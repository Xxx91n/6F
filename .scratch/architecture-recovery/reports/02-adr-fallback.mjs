// 02-adr-fallback.mjs — git first-commit fallback for ADR timestamp recovery + precision validation.
// Strategy: when no YAML frontmatter timestamp is present, fall back to `git log --follow --format=%aI --reverse`
// which returns the author date of the commit that first added the file (a strong proxy for "when was this
// decision first recorded"). Then validate the precision by comparing git-derived dates against header/inline
// dates for the ADRs that DO have a discoverable date.
//
// Usage: node 02-adr-fallback.mjs [--scan <02-adr-header-scan.json>] [--out <02-adr-fallback.json>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
function arg(name, def) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; }

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const scanPath = arg("--scan", path.join(scriptDir, "02-adr-header-scan.json"));
const outPath  = arg("--out",  path.join(scriptDir, "02-adr-fallback.json"));

const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));

// NOTE: backslashes here are intentional for a regex string source — to test interactively:
//   new RegExp("\\b(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b", "g")
// We build the RegExp with a double-escaped source so the regex engine sees word boundaries.
const ISO_RE = new RegExp("\\b(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b", "g");

function extractInlineDate(text) {
  const head = text.split("\n").slice(0, 60).join("\n");
  const matches = head.match(ISO_RE) || [];
  if (matches.length === 0) return null;
  return matches.sort()[0];
}

function gitFirstCommit(repoRoot, relPath) {
  const r = spawnSync("git", [
    "-C", repoRoot,
    "log", "--follow", "--format=%aI|%H|%an",
    "--reverse", "--", relPath
  ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) return { ok: false, error: (r.stderr || r.stdout || "").trim().slice(0, 300) };
  const first = (r.stdout || "").trim().split("\n").find(l => l.trim().length > 0);
  if (!first) return { ok: false, error: "no commits" };
  const [date, sha, author] = first.split("|");
  return { ok: true, date, sha, author };
}

function gitHeadCommit(repoRoot) {
  const r = spawnSync("git", ["-C", repoRoot, "log", "-1", "--format=%aI"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  return (r.stdout || "").trim();
}

function diffDays(a, b) {
  const da = new Date(a + (a.length === 10 ? "T00:00:00Z" : ""));
  const db = new Date(b + (b.length === 10 ? "T00:00:00Z" : ""));
  if (isNaN(da) || isNaN(db)) return null;
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

const result = {
  schema_version: "1.0.0",
  generated_at: new Date().toISOString(),
  scanner: "02-adr-fallback.mjs",
  strategy: "git log --follow --format=%aI --reverse — first commit author date on file path",
  per_repo: [],
  precision: { total_with_header_or_inline_date: 0, with_first_commit_date: 0, matched: 0, delta_distribution_days: {} }
};

for (const r of scan.repos) {
  const repoEntry = { name: r.name, root: r.root, files: [], head_commit: gitHeadCommit(r.root), counts: { total: 0, header_date: 0, inline_date: 0, no_date: 0, first_commit_ok: 0, first_commit_failed: 0 } };
  for (const f of r.adr_files) {
    const fullPath = path.join(r.root, f.path);
    let text; try { text = fs.readFileSync(fullPath, "utf8"); } catch (e) { continue; }
    const headerDate = f.header_date ? f.header_date.value : null;
    const inlineDate = headerDate ? null : extractInlineDate(text);
    const decisionDate = headerDate || inlineDate;
    const gitRes = gitFirstCommit(r.root, f.path);
    const firstCommitDate = gitRes.ok ? gitRes.date.slice(0, 10) : null;
    let delta = null;
    if (decisionDate && firstCommitDate) delta = diffDays(firstCommitDate, decisionDate);
    repoEntry.files.push({
      path: f.path,
      header_date: headerDate,
      inline_date: inlineDate,
      decision_date: decisionDate,
      first_commit_date: firstCommitDate,
      first_commit_sha: gitRes.ok ? gitRes.sha : null,
      first_commit_author: gitRes.ok ? gitRes.author : null,
      first_commit_error: gitRes.ok ? null : gitRes.error,
      delta_days: delta
    });
    repoEntry.counts.total++;
    if (headerDate) repoEntry.counts.header_date++;
    else if (inlineDate) repoEntry.counts.inline_date++;
    else repoEntry.counts.no_date++;
    if (gitRes.ok) repoEntry.counts.first_commit_ok++;
    else repoEntry.counts.first_commit_failed++;
    if (decisionDate) result.precision.total_with_header_or_inline_date++;
    if (firstCommitDate) result.precision.with_first_commit_date++;
    if (delta !== null) {
      result.precision.matched++;
      const k = String(delta);
      result.precision.delta_distribution_days[k] = (result.precision.delta_distribution_days[k] || 0) + 1;
    }
  }
  result.per_repo.push(repoEntry);
}

// summary stats
const deltas = result.per_repo.flatMap(r => r.files.map(f => f.delta_days).filter(d => d !== null));
if (deltas.length) {
  const abs = deltas.map(d => Math.abs(d)).sort((a, b) => a - b);
  const sum = abs.reduce((a, b) => a + b, 0);
  const buckets = { "0d": 0, "1-7d": 0, "8-30d": 0, "31-90d": 0, "91-180d": 0, "181-365d": 0, ">365d": 0 };
  for (const d of abs) {
    if (d === 0) buckets["0d"]++;
    else if (d <= 7) buckets["1-7d"]++;
    else if (d <= 30) buckets["8-30d"]++;
    else if (d <= 90) buckets["31-90d"]++;
    else if (d <= 180) buckets["91-180d"]++;
    else if (d <= 365) buckets["181-365d"]++;
    else buckets[">365d"]++;
  }
  result.precision.abs_delta = {
    n: deltas.length,
    min: abs[0],
    median: abs[Math.floor(abs.length / 2)],
    p90: abs[Math.floor(abs.length * 0.9)] || abs[abs.length - 1],
    max: abs[abs.length - 1],
    mean: Math.round(sum / abs.length * 10) / 10
  };
  result.precision.abs_delta_buckets = buckets;
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log("Wrote", outPath);
console.log("Precision summary:", JSON.stringify(result.precision, null, 2));
for (const r of result.per_repo) {
  console.log("[", r.name, "] total=" + r.counts.total, "header=" + r.counts.header_date, "inline=" + r.counts.inline_date, "none=" + r.counts.no_date, "git_ok=" + r.counts.first_commit_ok, "git_fail=" + r.counts.first_commit_failed);
}
