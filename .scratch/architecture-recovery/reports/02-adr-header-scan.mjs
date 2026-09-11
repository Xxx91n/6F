// 02-adr-header-scan.mjs — reusable YAML timestamp header consistency scanner for ADR collections.
// Usage: node 02-adr-header-scan.mjs [--repos <json>] [--out <json>] [--root <path>]
// Default repos = the 4 local repositories on this host; override via --repos.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}

const DEFAULT_REPOS = [
  { name: "6F",            root: "D:/Aworker/6F",            adr_dirs: ["docs/adr"] },
  { name: "env-manager",   root: "D:/Aworker/env-manager",   adr_dirs: ["docs/adr"] },
  { name: "jiahao",        root: "D:/Aworker/jiahao",        adr_dirs: ["docs/adr"] },
  { name: "anysearch-cli", root: "D:/Aworker/anysearch-cli", adr_dirs: ["docs/adr"] }
];

const reposJson = arg("--repos", null);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outPath  = arg("--out",   path.join(scriptDir, "02-adr-header-scan.json"));

const repos = reposJson ? JSON.parse(fs.readFileSync(reposJson, "utf8")) : DEFAULT_REPOS;

// --- header detection ---
// A YAML frontmatter header is a top-of-file block between two lines containing only "---".
// We look for any key whose name suggests a date / status / deciders (loose — covers MADR / adr-tools / log4brains / adr-manager variants).
const DATE_KEYS    = ["date", "decision-date", "decision_date", "decided", "decided_at", "decided-on", "decided_on", "created", "created_at", "created-on", "created_on", "last-updated", "updated_at", "last_updated"];
const STATUS_KEYS  = ["status", "state", "decision-status"];
const META_KEYS    = ["deciders", "decision-makers", "drivers", "consulted", "informed", "tags", "title", "slug"];

const ISO_DATE_RE  = /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:[T ][0-9:.+\-Z]+)?\b/;

function detectYAMLFrontmatter(text) {
  // normalize line endings
  const t = text.replace(/\r\n/g, "\n");
  if (!t.startsWith("---")) return { hasFm: false, fm: null, rest: t };
  // find closing fence
  const lines = t.split("\n");
  if (lines[0].trim() !== "---") return { hasFm: false, fm: null, rest: t };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { end = i; break; }
  }
  if (end === -1) return { hasFm: false, fm: null, rest: t };
  const fmLines = lines.slice(1, end);
  return { hasFm: true, fm: fmLines.join("\n"), rest: lines.slice(end + 1).join("\n") };
}

function parseFrontmatter(fm) {
  // tiny YAML-lite: split on top-level "key: value" lines and "key:" group blocks.
  // We do NOT need full YAML — we only need: (a) which keys exist, (b) is the value a date.
  const out = {};
  if (!fm) return out;
  const lines = fm.split("\n");
  let cur = null;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trimEnd();
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z_][\w\-]*):\s*(.*)$/);
    if (m) {
      const k = m[1].toLowerCase();
      const v = m[2].trim();
      if (v === "") { cur = k; out[k] = ""; continue; }
      // strip surrounding quotes
      const unq = v.replace(/^["']|["']$/g, "");
      out[k] = unq;
      cur = null;
    } else if (cur && /^\s+-\s+/.test(raw)) {
      // list item under a key
      const item = raw.replace(/^\s+-\s+/, "").trim();
      const arr = Array.isArray(out[cur]) ? out[cur] : (out[cur] = []);
      arr.push(item);
    }
  }
  return out;
}

function extractDateField(parsed) {
  // Look in any *date* key, prefer "decision-date" > "date" > others.
  const ordered = ["decision-date", "date", "decided", "decided_at", "decided-on", "decided_on", "created", "created_at", "created-on", "created_on", "last-updated", "updated_at", "last_updated"];
  for (const k of ordered) {
    if (parsed[k] && ISO_DATE_RE.test(parsed[k])) return { key: k, value: parsed[k] };
  }
  // Also check the first 200 chars of rest for an inline date (some MADR variants do this).
  return null;
}

function classify(parsed) {
  if (Object.keys(parsed).length === 0) return "no_header";
  const hasDate = !!extractDateField(parsed);
  const hasStatus = STATUS_KEYS.some(k => k in parsed);
  const hasMeta = META_KEYS.some(k => k in parsed);
  if (hasDate && hasStatus) return "full_header";
  if (hasDate || hasStatus) return "partial_header";
  if (hasMeta) return "metadata_only";
  return "unknown";
}

// --- main scan ---
const result = {
  schema_version: "1.0.0",
  scanned_at: new Date().toISOString(),
  scanner: "02-adr-header-scan.mjs",
  detection_rules: {
    date_keys: DATE_KEYS,
    status_keys: STATUS_KEYS,
    meta_keys: META_KEYS,
    iso_date_pattern: ISO_DATE_RE.source
  },
  repos: []
};

let total = 0, full = 0, partial = 0, metadata = 0, nohdr = 0, unknown = 0;

for (const r of repos) {
  const repoEntry = { name: r.name, root: r.root, adr_dirs: r.adr_dirs, adr_files: [], counts: { total: 0, full_header: 0, partial_header: 0, metadata_only: 0, no_header: 0, unknown: 0 } };
  for (const d of r.adr_dirs) {
    const fullDir = path.join(r.root, d);
    if (!fs.existsSync(fullDir)) continue;
    const items = fs.readdirSync(fullDir).filter(f => /\.(md|markdown|adoc|rst)$/i.test(f));
    for (const f of items) {
      const fp = path.join(fullDir, f);
      let text;
      try { text = fs.readFileSync(fp, "utf8"); } catch (e) { continue; }
      const { hasFm, fm } = detectYAMLFrontmatter(text);
      const parsed = parseFrontmatter(fm);
      const cls = classify(parsed);
      const dateInfo = extractDateField(parsed);
      const fileRel = path.relative(r.root, fp).replace(/\\/g, "/");
      const fileEntry = {
        path: fileRel,
        size_bytes: text.length,
        has_frontmatter: hasFm,
        classification: cls,
        header_date: dateInfo ? { key: dateInfo.key, value: dateInfo.value } : null,
        header_keys: Object.keys(parsed)
      };
      repoEntry.adr_files.push(fileEntry);
      repoEntry.counts.total++;
      repoEntry.counts[cls]++;
      total++;
      if (cls === "full_header") full++;
      else if (cls === "partial_header") partial++;
      else if (cls === "metadata_only") metadata++;
      else if (cls === "no_header") nohdr++;
      else unknown++;
    }
  }
  result.repos.push(repoEntry);
}

result.aggregate = { total_adrs_scanned: total, full_header: full, partial_header: partial, metadata_only: metadata, no_header: nohdr, unknown };

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log("Wrote", outPath);
console.log("Aggregate:", JSON.stringify(result.aggregate, null, 2));
for (const r of result.repos) {
  console.log(`  [${r.name}] total=${r.counts.total}  full=${r.counts.full_header}  partial=${r.counts.partial_header}  meta=${r.counts.metadata_only}  none=${r.counts.no_header}  unknown=${r.counts.unknown}`);
}
