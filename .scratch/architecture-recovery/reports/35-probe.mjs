// 35-probe.mjs — #35/A-040 首批 30 面契约化探针：golden cassette 录制 + manifest 生成 + 适配器实测采集
// 纪律：适配层禁业务规则（ADR-0014）；cassette = 真实 stdout 逐字录制（禁规范化）；manifest 行数/列由裸 JSON.parse/CSV 头独立计算（不经适配器解析器）。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENGINE_DIST = join(REPO, 'engine', 'dist');
const FX = join(REPO, 'engine', 'test', 'fixtures', 'codelore', 'batch1');
const U = await import(pathToFileURL(join(ENGINE_DIST, 'upstream', 'codelore.js')).href);

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const git = (args) => spawnSync('git', args.split(' '), { cwd: REPO, encoding: 'utf8' }).stdout.trim();

// --- 1. 运行时解析 + pin 校验 ---
const res = U.resolveCodelore('codelore');
if (!res.pinned) { console.error('codelore not pinned: ' + JSON.stringify(res)); process.exit(2); }

mkdirSync(FX, { recursive: true });

// --- 2. 逐面录制 cassette + manifest（raw stdout 逐字落盘） ---
const facets = {};
for (const spec of U.CODELORE_BATCH1_FACETS) {
  const run = U.runCodeloreAnalysis('codelore', spec, REPO);
  const file = spec.analysis + '.json';
  if (!run.ok) {
    facets[spec.analysis] = { group: spec.group, status: run.status, error: run.stderrTail };
    console.log('RUN-FAIL ' + spec.analysis + ' status=' + run.status);
    continue;
  }
  writeFileSync(join(FX, file), run.stdout, 'utf8');
  // manifest 独立计量：裸 JSON.parse（非适配器 parseJsonRows）
  const rows = JSON.parse(run.stdout);
  const entry = {
    group: spec.group,
    format: 'json',
    extra_args: spec.extraArgs,
    file: file,
    row_count: rows.length,
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    columns_source: rows.length > 0 ? 'json-row0' : null,
    sha256: sha256(run.stdout),
    bytes: Buffer.byteLength(run.stdout, 'utf8'),
    spot: null
  };
  if (rows.length > 0) {
    const k = entry.columns[0];
    entry.spot = { key: k, value: rows[0][k] };
  } else {
    // 空结果面：以 csv 表头钉列契约（独立第二通道）
    const csv = spawnSync('codelore', ['analyze', '--analysis', spec.analysis, '--format', 'csv', '--repo', REPO].concat(spec.extraArgs), { cwd: REPO, encoding: 'utf8' });
    const csvFile = spec.analysis + '.csv';
    writeFileSync(join(FX, csvFile), csv.stdout || '', 'utf8');
    const head = (csv.stdout || '').split('\n').map((l) => l.trim()).filter(Boolean);
    entry.columns = head.length > 0 ? head[0].split(',') : [];
    entry.columns_source = 'csv-header';
    entry.csv_file = csvFile;
    entry.csv_sha256 = sha256(csv.stdout || '');
    entry.csv_header_sha256 = head.length > 0 ? sha256(head[0]) : null;
  }
  facets[spec.analysis] = entry;
  console.log('REC ' + spec.analysis + ' rows=' + entry.row_count + ' cols=' + entry.columns.length + ' bytes=' + entry.bytes);
}

const manifest = {
  codelore_version: res.version,
  pinned_version: U.CODELORE_PINNED_VERSION,
  captured_at: new Date().toISOString(),
  repo: REPO,
  capture_commit: git('rev-parse HEAD'),
  note: 'golden cassette 录制清单——columns/row_count/sha256 由裸 JSON.parse 与 csv 表头独立计量（不经适配器解析器）；空结果面列契约走 csv-header 第二通道；repo/capture_commit 为录制时点 provenance（机器路径+HEAD sha）；重跑 probe 按当时仓库活历史重写全部 cassette（录制副作用，非只读校验）',
  facets: facets
};
writeFileSync(join(FX, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// --- 3. 适配器端到端实测采集（真二进制路径） ---
const ctx = { runId: 'r35-batch1-probe', traceId: sha256('r35').slice(0, 32), repoRef: REPO, scale: 'Macro-C', observedAt: new Date().toISOString() };
const facts = U.collectCodeloreFacets({ repoRoot: REPO }, ctx);
writeFileSync(join(HERE, '35-upstream-facts.jsonl'), facts.map((f) => JSON.stringify(f)).join('\n') + '\n', 'utf8');

const perFacet = Object.fromEntries(facts.filter((f) => f.metric === 'codelore.facet_rows').map((f) => { const v = JSON.parse(f.value_json); return [v.analysis, { rows: v.row_count, cols: v.columns.length }]; }));
const errs = facts.filter((f) => f.metric !== 'codelore.facet_rows' && f.metric !== 'upstream.resolution');
const out = {
  probe_id: 'R6-35-CODELORE-BATCH1',
  generated_at: ctx.observedAt,
  resolution: res,
  facets_contracted: Object.keys(perFacet).length,
  facet_errors: errs.map((f) => f.metric + ':' + f.subject_ref),
  per_facet: perFacet,
  provenance: {
    commit_pin: git('rev-parse HEAD'),
    spec_version: 'spec.md sha256 ' + sha256(readFileSync(join(REPO, '.scratch/architecture-recovery/spec.md'), 'utf8')).slice(0, 16),
    facts_fingerprint: sha256(facts.map((f) => JSON.stringify(f)).join('\n'))
  }
};
writeFileSync(join(HERE, '35-probe-measurements.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('facets contracted=' + out.facets_contracted + ' errors=' + errs.length + ' facts=' + facts.length);
