// 31-codelore-probe.mjs — R4-05 阶段 2b 单上游探针：CodeLore 适配器实测 + 首报同仓同 spec 重跑 diff
// 纪律：冻结产物（23-*）零改动；本脚本产出平行产物 31-*；适配层禁业务规则（ADR-0014）。
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENGINE_DIST = join(REPO, 'engine', 'dist');
const C = await import(pathToFileURL(join(ENGINE_DIST, 'collect', 'collectors.js')).href);
const U = await import(pathToFileURL(join(ENGINE_DIST, 'upstream', 'codelore.js')).href);

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const git = (args) => spawnSync('git', args.split(' '), { cwd: REPO, encoding: 'utf8' }).stdout.trim();

// --- 1. 运行时解析 + pin 校验 ---
const res = U.resolveCodelore('codelore');

// --- 2. 上游探针事实采集（raw 语义，不过界） ---
const ctx = { repoRef: 'D:/Aworker/6F', headSha: git('rev-parse HEAD'), observedAt: new Date().toISOString(), runId: 'r31-codelore-probe', traceId: sha256('r31').slice(0, 32), baggageId: sha256('r31-bag').slice(0, 32) };
const explainPaths = ['engine/src/collect/collectors.ts', 'engine/src/fact/store.ts', 'engine/src/cli.ts'];
const upFacts = res.pinned ? U.collectCodeloreFacts({ repoRoot: REPO, explainPaths }, ctx) : [];

// --- 3. 首报同仓重跑（当前工作树 ADR 集 = 治理后状态；冻结集保持 fc00d458 口径） ---
const adrDir = join(REPO, 'docs', 'adr');
const adrFiles = readdirSync(adrDir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort();
const docs = adrFiles.map((f) => {
  const text = readFileSync(join(adrDir, f), 'utf8');
  const fc = git('log --diff-filter=A --format=%cs -- ' + 'docs/adr/' + f).split('\n').filter(Boolean).pop() || null;
  return { path: 'docs/adr/' + f, text, first_commit_date: fc };
});
const FIVE = ['Status', 'Date', 'Context', 'Decision', 'Consequences'];
const ratio = (facts) => {
  const vals = facts.filter((x) => x.metric === 'adr.five_piece_completeness').map((x) => JSON.parse(x.value_json));
  const missing = Object.fromEntries(FIVE.map((f) => [f, 0]));
  let sum = 0;
  for (const v of vals) { sum += v.ratio; for (const k of v.missing) missing[k]++; }
  const n = vals.length || 1;
  for (const k of Object.keys(missing)) missing[k] = Number((missing[k] / n).toFixed(4));
  const mean = Number((sum / n).toFixed(4));
  const verdict = (mean < 0.60 || missing.Status > 0.5 || missing.Date > 0.5) ? 'RED' : 'not-RED';
  return { mean, missing, verdict, n: vals.length };
};
const v1Facts = C.collectAdrStructure({ documents: docs }, ctx);
const v2Facts = C.collectAdrStructureV2({ documents: docs }, ctx);
const tc2_now_v1 = ratio(v1Facts);
const tc2_now_v2 = ratio(v2Facts);

// --- 4. 与冻结读数 diff ---
const frozen = JSON.parse(readFileSync(join(HERE, '23-measurements.json'), 'utf8'));
const diff = {
  frozen_set: { n: 13, commit: 'fc00d458', tc2_v1_mean: frozen.tc2.mean_ratio_4, tc2_v1_verdict: frozen.tc2.verdict, missing: frozen.tc2.missing_ratio_4 },
  current_tree: { n: docs.length, files: adrFiles, tc2_v1_mean: tc2_now_v1.mean, tc2_v1_verdict: tc2_now_v1.verdict, tc2_v2_mean: tc2_now_v2.mean, tc2_v2_verdict: tc2_now_v2.verdict, missing_v2: tc2_now_v2.missing },
  delta_v2_vs_frozen_v1: Number((tc2_now_v2.mean - frozen.tc2.mean_ratio_4).toFixed(4))
};

// --- 5. provenance + 产物 ---
const factsJsonl = upFacts.map((f) => JSON.stringify(f)).join('\n');
const out = {
  probe_id: 'R4-05-CODELORE-PROBE',
  generated_at: ctx.observedAt,
  runtime_resolution: { decision: 'binary-discovery', rationale: 'codelore = 单一自包含 Rust 二进制已驻 PATH；容器捆绑在探针期零隔离增益且增分发重量；MCP stdio 面留作未来通道', resolution: res },
  upstream_facts_count: upFacts.length,
  upstream_metrics: upFacts.map((f) => f.metric),
  diff,
  provenance: {
    commit_pin: ctx.headSha,
    spec_version: 'SCHEMA_VERSION_V0 + spec.md sha256 ' + sha256(readFileSync(join(REPO, '.scratch/architecture-recovery/spec.md'), 'utf8')).slice(0, 16),
    data_fingerprint: sha256(factsJsonl)
  }
};
writeFileSync(join(HERE, '31-probe-measurements.json'), JSON.stringify(out, null, 2) + '\n');
writeFileSync(join(HERE, '31-upstream-facts.jsonl'), factsJsonl + '\n');
console.log('resolve: ' + JSON.stringify({ version: res.version, pinned: res.pinned }));
console.log('upstream facts: ' + upFacts.length + ' (' + [...new Set(upFacts.map((f) => f.metric))].join(', ') + ')');
console.log('current tree TC-2: v1=' + tc2_now_v1.mean + ' ' + tc2_now_v1.verdict + ' | v2=' + tc2_now_v2.mean + ' ' + tc2_now_v2.verdict + ' (n=' + docs.length + ')');
console.log('frozen TC-2 v1: ' + frozen.tc2.mean_ratio_4 + ' ' + frozen.tc2.verdict);
