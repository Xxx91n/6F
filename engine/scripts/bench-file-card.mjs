// scripts/bench-file-card.mjs — #80 步③ 文件卡投影 benchmark（D-137/D-127：p95 分档＋target/danger 双阈值＋机器可裁决）
// 用法：node scripts/bench-file-card.mjs [--runs N] [--db <path>...] [--out <artifact.json>]
// 测量面：projectFileCard 端到端（开库→选集→取行→缝合→建卡）×试点库实档＋合成病态图 stress
//   （深链 60 跳＋宽边 500 条＋20k facet 行）。分档=按观测集事实行数分 small/medium/large。
// 阈值=实测预登记（见下方 THRESHOLDS 常量——登记值先于批内 commit 锁死，实跑数值留 artifact）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const P = await import(pathToFileURL(join(root, 'dist', 'fact', 'projection.js')).href);
const FC = await import(pathToFileURL(join(root, 'dist', 'fact', 'file-card.js')).href);

// ── 预登记阈值（ms）——实测预登记制：先测后写锁票面，target=正常达成档 danger=病态上限档
//   登记值见 .scratch/macro-audit/reports/80-bench-thresholds.md（同票）
const THRESHOLDS = {
  small:  { target: 200,  danger: 800   },   // <5k facts（实测基线 p95≤72ms——target≈3×基线留异机余量）
  medium: { target: 800,  danger: 3000  },   // 5k~50k facts
  large:  { target: 4000, danger: 12000 },   // >50k facts（含病态血缘图 stress——合成件实测 p95≈85ms 纯建卡面）
};

function parseArgs(argv) {
  const o = { runs: 30, dbs: [], out: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--runs') { o.runs = Number(argv[++i]); }
    else if (argv[i] === '--db') { o.dbs.push(argv[++i]); }
    else if (argv[i] === '--out') { o.out = argv[++i]; }
  }
  if (o.dbs.length === 0) {
    o.dbs = [
      join(root, '..', '.scratch', 'macro-audit', 'audits', 'r36', 'jiahao-facts.duckdb'),
      join(root, '..', '.scratch', 'macro-audit', 'audits', 'r36', 'env-manager-facts.duckdb')
    ];
  }
  return o;
}

function pct(sorted, p) {
  if (sorted.length === 0) { return null; }
  const i = Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1);
  return Math.round(sorted[i] * 100) / 100;
}

function tierOf(factCount) {
  return factCount < 5000 ? 'small' : factCount <= 50000 ? 'medium' : 'large';
}

// 合成病态图：60 跳深链＋500 条宽边＋N 条 facet 行——纯 buildFileCard CPU 面（无 IO）
function syntheticSet(nRows, nEdges, chainLen) {
  const facts = [];
  let seq = 0;
  const mk = (metric, subject, value) => ({
    fact_id: 'b' + (seq++).toString(16).padStart(35, '0'), trace_id: 'a'.repeat(32), baggage_id: 'b'.repeat(32),
    scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'bench@v1',
    repo_ref: 'bench@' + 'c'.repeat(40), subject_ref: subject, evidence_ref: 'bench',
    metric: metric, value_json: JSON.stringify(value), observed_at: '2026-09-26T00:00:00Z'
  });
  for (let i = 0; i < nRows; i++) {
    facts.push(mk('codelore.file_facet_row', 'src/f' + i + '.ts', { analysis: 'hotspots', row: { path: 'src/f' + i + '.ts', revisions: i % 97 + 1, hotspot_score: (i % 100) / 10 } }));
  }
  for (let i = 0; i < chainLen; i++) {
    facts.push(mk('file.renamed', 'v' + (i + 1) + '.ts', { from: 'v' + i + '.ts', to: 'v' + (i + 1) + '.ts', commit_sha: String(i).padStart(40, '0'), similarity: 90 }));
  }
  for (let i = 0; i < nEdges; i++) {
    facts.push(mk('file.renamed', 'w' + i + '.ts', { from: 'wold' + i + '.ts', to: 'w' + i + '.ts', commit_sha: String(900000 + i).padStart(40, '9'), similarity: 80 }));
  }
  // 深链末端行：v<chainLen>.ts 自带行（缝合触发面）
  facts.push(mk('codelore.file_facet_row', 'v' + chainLen + '.ts', { analysis: 'hotspots', row: { path: 'v' + chainLen + '.ts', revisions: 3, hotspot_score: 1 } }));
  return facts;
}

async function benchDb(dbPath, repo, subject, runs) {
  const ts = [];
  let card = null;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    card = await P.projectFileCard(dbPath, { repo: repo, subject: subject, current_head_sha: null });
    ts.push(performance.now() - t0);
  }
  ts.sort((a, b) => a - b);
  const setCount = card && card.kernel ? Object.keys(card.kernel.facet_rows).reduce((s, k) => s + card.kernel.facet_rows[k].length, 0) : 0;
  return { db: dbPath, subject: subject, runs: runs, p50: pct(ts, 0.5), p95: pct(ts, 0.95), max: pct(ts, 1), card_rows: setCount };
}

function benchBuild(setFacts, subject, runs) {
  const ts = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    FC.buildFileCard({ subject: subject, setRepoRef: 'bench@' + 'c'.repeat(40), setFacts: setFacts, availableHeadShas: [], pinnedSha: null, currentHeadSha: null, source: 'unknown', cliGuidance: null });
    ts.push(performance.now() - t0);
  }
  ts.sort((a, b) => a - b);
  return { runs: runs, rows: setFacts.length, p50: pct(ts, 0.5), p95: pct(ts, 0.95), max: pct(ts, 1) };
}

async function main() {
  const o = parseArgs(process.argv);
  const subjects = { 'jiahao-facts.duckdb': 'src/shared/paths.js', 'env-manager-facts.duckdb': 'src/Audit/Crypto/AuditCrypto.cs' };
  const results = [];
  for (const db of o.dbs) {
    const base = db.split(/[\\/]/).pop();
    const repo = base.replace(/-facts\.duckdb$/, '');
    const subject = subjects[base] || 'src/shared/paths.js';
    results.push(await benchDb(db, repo, subject, o.runs));
  }
  // 合成 stress：20000 facet 行＋60 跳深链＋500 宽边——大档
  const synth = benchBuild(syntheticSet(20000, 500, 60), 'v60.ts', o.runs);
  synth.synthetic = '20000-rows/500-edges/60-hop-chain';
  synth.tier = 'large';
  const verdicts = [];
  for (const r of results.concat([synth])) {
    const tier = r.tier || tierOf(r.card_rows || r.rows || 0);
    const t = THRESHOLDS[tier];
    const verdict = r.p95 === null ? 'no-data' : r.p95 <= t.target ? 'target' : r.p95 <= t.danger ? 'acceptable' : 'danger';
    verdicts.push({ name: r.synthetic || r.db, tier: tier, p95_ms: r.p95, p50_ms: r.p50, max_ms: r.max, target_ms: t.target, danger_ms: t.danger, verdict: verdict });
  }
  const out = { schema: 'file-card-bench/v1', runs_per_case: o.runs, thresholds: THRESHOLDS, measured_at: new Date().toISOString(), node: process.version, cases: verdicts };
  const text = JSON.stringify(out, null, 1) + '\n';
  if (o.out) { mkdirSync(dirname(o.out), { recursive: true }); writeFileSync(o.out, text); }
  process.stdout.write(text);
  const bad = verdicts.filter(v => v.verdict === 'danger').length;
  process.exit(bad > 0 ? 1 : 0);   // danger 档=非零退出（机器可裁决）
}

main().catch(e => { console.error('BENCH-FAIL ' + (e && e.message ? e.message : e)); process.exit(2); });
