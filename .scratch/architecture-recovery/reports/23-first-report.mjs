// 23-first-report.mjs — 首报全链执行（采集 → fact → 叙事 → 裁决 → 报告）
// 用法：node .scratch/architecture-recovery/reports/23-first-report.mjs
// 覆盖 A-026 / A-027｜spec §R3-D5｜ADR-0012 阶段 1｜ADR-0013 三层闸门
// 依赖：零三方包；直接 import engine/src/collect/collectors.ts 与 engine/src/report/generate.ts（Node 类型剥离）。
// 纪律：B 层阈值全部读自 22-criteria-pre-registration.md 对应的预声明常量，跑后禁调（§7）。

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');
const GENERATE_TS = join(REPO, 'engine', 'src', 'report', 'generate.ts');
const SCHEMA_TS = join(REPO, 'engine', 'src', 'fact', 'schema.ts');

const C = await import(pathToFileURL(COLLECT_TS).href);
const G = await import(pathToFileURL(GENERATE_TS).href);
const S = await import(pathToFileURL(SCHEMA_TS).href);

// ---------- §0 预声明常量（与 22-criteria-pre-registration.md 逐字对齐，跑后禁调） ----------
const PRE_REG = '.scratch/architecture-recovery/reports/22-criteria-pre-registration.md';
const C_BASIS = '.scratch/architecture-recovery/reports/22-c-adjudication-basis.md';
const TC1_LAG_DAYS = 90;
const TC1_RATIO_RED = 0.20;
const TC1_MIN_N = 5;
const TC2_MEAN_RED = 0.60;
const TC2_FIELD_MISSING_RED = 0.50;
const TC3_RED = 0.50;
const TC3_GREEN = 0.70;
const TC3_TOPN = 20;

function git(args) {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

const HEAD_SHA = git(['rev-parse', 'HEAD']).trim();
const HEAD_DATE = git(['log', '-1', '--format=%cI']).trim();
const COMMIT_COUNT = Number(git(['rev-list', '--count', 'HEAD']).trim());

const ctx = {
  runId: 'r23-' + HEAD_SHA.slice(0, 7),
  traceId: C.sha256Hex('6F|' + HEAD_SHA + '|' + HEAD_DATE).slice(0, 32),
  repoRef: '6F@' + HEAD_SHA,
  scale: 'Macro-B',
  observedAt: HEAD_DATE
};

// ---------- §1 采集：gitlog（PROBE-INVARIANT：解析完整性先断言） ----------
const rawLog = git(['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
const commits = [];let cur = null;
for (const line of rawLog.split(String.fromCharCode(10))) {
  const t = line.trim();
  if (t.indexOf('__R__') === 0) {
    const parts = t.slice(5).split('|');
    cur = { sha: parts[0], author: parts[1], date: parts[2], paths: [] };
    commits.push(cur);
  } else if (cur && t.length > 0) {
    cur.paths.push(t);
  }
}
if (commits.length !== COMMIT_COUNT) { throw new Error('PROBE-INVARIANT-FAIL: parsed ' + commits.length + ' != git rev-list ' + COMMIT_COUNT); }

// ---------- §2 采集：ADR 结构 / 定位 / 注入式 gitlog ----------
const adrDir = join(REPO, 'docs', 'adr');
const adrFiles = readdirSync(adrDir).filter(function (f) { return f.length > 3 && f.slice(-3) === '.md'; }).sort();
const adrDocs = adrFiles.map(function (f) { return { path: 'docs/adr/' + f, text: readFileSync(join(adrDir, f), 'utf8') }; });
const adrPaths = adrDocs.map(function (d) { return d.path; });

const rawProbe = JSON.parse(readFileSync(join(HERE, '22-threshold-raw.json'), 'utf8'));
const stopwords = rawProbe.tc3_s1_coverage.stopwords;
if (!Array.isArray(stopwords)) { throw new Error('STOPWORDS-MISSING: 22-threshold-raw.json#tc3_s1_coverage.stopwords 不可解析'); }

const intentDocs = [
  { path: '.scratch/architecture-recovery/README.md', text: readFileSync(join(REPO, '.scratch/architecture-recovery/README.md'), 'utf8') },
  { path: 'CONTEXT.md', text: readFileSync(join(REPO, 'CONTEXT.md'), 'utf8') }
];
const subjects = git(['log', '--pretty=format:%s']).split(String.fromCharCode(10));
const deliveryDocs = [{ path: 'git log subjects @ ' + HEAD_SHA.slice(0, 7), text: subjects.join(String.fromCharCode(10)) }];

const adrFacts = C.collectAdrStructure({ documents: adrDocs }, ctx);
const adrDateMap = C.adrDates({ documents: adrDocs });
const posFacts = C.collectPositioning({ intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: TC3_TOPN, stopwords: stopwords }, ctx);
const gitFacts = C.collectGitlog({ commits: commits, paths: adrPaths, adrDates: adrDateMap }, ctx);
const realFacts = adrFacts.concat(posFacts, gitFacts);

// ---------- §3 正对照 PC-1 / PC-2（级 1 管线健康闸，fixture 级） ----------
const GOLDEN_ADR = [
  '# ADR-9999: PC-1 golden fixture',
  '',
  '- Status: accepted',
  '- Date: 2026-09-13',
  '- Deciders: fixture',
  '- Ledger: D-000',
  '',
  '## Context',
  '',
  'fixture context.',
  '',
  '## Decision',
  '',
  'fixture decision.',
  '',
  '## Consequences',
  '',
  'fixture consequences; this supersedes ADR-0000.'
].join(String.fromCharCode(10));
const POS_DECL = 'macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor';
const pc1AdrFacts = C.collectAdrStructure({ documents: [{ path: 'fixtures/23-pc1-golden-adr.md', text: GOLDEN_ADR }] }, ctx);
const pc1PosFacts = C.collectPositioning({ intentDocs: [{ path: 'fixtures/23-pc1-positioning.md', text: POS_DECL }], deliveryDocs: [{ path: 'fixtures/23-pc1-delivery.md', text: POS_DECL }], topN: TC3_TOPN, stopwords: stopwords }, ctx);
const pc1Five = pc1AdrFacts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
const pc1Sup = pc1AdrFacts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
const pc1 = {
  adr_fact_count: pc1AdrFacts.length,
  pos_fact_count: pc1PosFacts.length,
  five_piece_present: pc1Five ? JSON.parse(pc1Five.value_json).present : -1,
  supersede_present: pc1Sup ? JSON.parse(pc1Sup.value_json).present : null,
  pass: pc1AdrFacts.length > 0 && pc1PosFacts.length > 0 && pc1Five && JSON.parse(pc1Five.value_json).present === 5 && pc1Sup && JSON.parse(pc1Sup.value_json).present === true
};

const PC2_PATH = 'fixtures/23-pc2-lag-adr.md';
const pc2Commits = [{ sha: 'pc2fixture0000000000000000000000000000001', author: 'fixture', date: '2026-01-01T00:00:00+08:00', paths: [PC2_PATH] }];
const pc2AdrDates = {};
pc2AdrDates[PC2_PATH] = '2026-09-13';
const pc2Facts = C.collectGitlog({ commits: pc2Commits, paths: [PC2_PATH], adrDates: pc2AdrDates }, ctx);
const pc2Lag = pc2Facts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
const pc2 = {
  fact_count: pc2Facts.length,
  lag_fact_count: pc2Lag.length,
  delta_days: pc2Lag.length > 0 ? JSON.parse(pc2Lag[0].value_json).delta_days : null,
  pass: pc2Lag.length > 0 && JSON.parse(pc2Lag[0].value_json).delta_days > 0
};

// ---------- §4 真判据 TC-1 / TC-2 / TC-3（级 2 主前提证伪闸，实测） ----------
const lagValues = gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return JSON.parse(f.value_json); });
const tc1Judgeable = lagValues.length;
const tc1Backfill = lagValues.filter(function (v) { return v.delta_days > TC1_LAG_DAYS; }).length;
const tc1Ratio = tc1Judgeable === 0 ? 0 : tc1Backfill / tc1Judgeable;
const tc1Verdict = tc1Judgeable < TC1_MIN_N ? "INCONCLUSIVE" : (tc1Ratio > TC1_RATIO_RED ? "RED" : "NOT_RED");

const fiveValues = adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return JSON.parse(f.value_json); });
const tc2Total = fiveValues.length;
const tc2Mean = tc2Total === 0 ? 0 : fiveValues.reduce(function (s, v) { return s + v.ratio; }, 0) / tc2Total;
const tc2Missing = {};
for (const k of C.ADR_FIVE_PIECE) { tc2Missing[k] = 0; }
for (const v of fiveValues) { for (const k of v.missing) { tc2Missing[k] = tc2Missing[k] + 1; } }
const tc2MissingRatio = {};
for (const k of Object.keys(tc2Missing)) { tc2MissingRatio[k] = tc2Total === 0 ? 0 : tc2Missing[k] / tc2Total; }
const tc2CondA = tc2Mean < TC2_MEAN_RED;
let tc2CondB = false;
for (const k of Object.keys(tc2MissingRatio)) { if (tc2MissingRatio[k] > TC2_FIELD_MISSING_RED) { tc2CondB = true; } }
const tc2Verdict = (tc2CondA || tc2CondB) ? "RED" : "NOT_RED";

const covFacts = posFacts.filter(function (f) { return f.metric === 'positioning.keyword_coverage'; }).map(function (f) { return { subject: f.subject_ref, value: JSON.parse(f.value_json), fact_id: f.fact_id }; });
let tc3Lowest = null;
for (const c of covFacts) { if (tc3Lowest === null || c.value.ratio < tc3Lowest.value.ratio) { tc3Lowest = c; } }
const tc3Ratio = tc3Lowest ? tc3Lowest.value.ratio : 0;
const tc3Verdict = tc3Ratio < TC3_RED ? "RED" : (tc3Ratio < TC3_GREEN ? "AMBER" : "GREEN");

// ---------- §5 负对照 NC-1（级 3 反向红条） ----------
const NC1_PATH = 'engine/src/fact/schema.ts';
const nc1Facts = C.collectAdrStructure({ documents: [{ path: NC1_PATH, text: readFileSync(join(REPO, NC1_PATH), 'utf8') }] }, ctx);
const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
const nc1Sup = nc1Facts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
const nc1 = {
  path: NC1_PATH,
  fact_count: nc1Facts.length,
  five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1,
  supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null,
  pass: false
};
nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;

// ---------- §6 fact：只追加事实日志（形态绑定 audit_fact 16 列） ----------
const factFieldNames = S.AUDIT_FACT_FIELDS.map(function (f) { return f.name; });
const factRows = realFacts.map(function (f, i) {
  return {
    fact_seq: i + 1,
    fact_id: f.fact_id,
    schema_version: S.SCHEMA_VERSION_V0,
    trace_id: f.trace_id,
    baggage_id: f.baggage_id,
    scale: f.scale,
    quadrant: f.quadrant,
    dimension: f.dimension,
    collector_id: f.collector_id,
    repo_ref: f.repo_ref,
    subject_ref: f.subject_ref,
    evidence_ref: f.evidence_ref,
    metric: f.metric,
    value_json: f.value_json,
    observed_at: f.observed_at,
    ingested_at: HEAD_DATE
  };
});
writeFileSync(join(HERE, '23-facts.jsonl'), factRows.map(function (r) { return JSON.stringify(r); }).join(String.fromCharCode(10)) + String.fromCharCode(10), 'utf8');
const insertStatements = factRows.map(function (r) {
  const cols = factFieldNames.join(', ');
  const vals = factFieldNames.map(function (n) {
    const v = r[n];
    if (v === null) { return "NULL"; }
    return String.fromCharCode(39) + String(v).split(String.fromCharCode(39)).join(String.fromCharCode(39) + String.fromCharCode(39)) + String.fromCharCode(39);
  }).join(', ');
  return 'INSERT INTO audit_fact (' + cols + ') VALUES (' + vals + ');';
});
writeFileSync(join(HERE, '23-facts-insert.sql'), insertStatements.join(String.fromCharCode(10)) + String.fromCharCode(10), 'utf8');
for (const sql of insertStatements) { S.assertAppendOnly(sql); }

// ---------- §7 实测数落盘（供引文回查） ----------
pc1.golden_five_present_s = pc1.five_piece_present + '/5';
pc1.golden_supersede_hit_s = String(pc1.supersede_present);
pc2.delta_days_s = String(pc2.delta_days);
const measurements = {
  observed_at: HEAD_DATE,
  head_sha: HEAD_SHA,
  commit_count: COMMIT_COUNT,
  adr_count: tc2Total,
  tc1: { judgeable_n: tc1Judgeable, backfill_n: tc1Backfill, ratio_4: tc1Ratio.toFixed(4), verdict: tc1Verdict, threshold: { lag_days: TC1_LAG_DAYS, ratio_red: TC1_RATIO_RED, min_n: TC1_MIN_N } },
  tc2: { total: tc2Total, mean_ratio_4: tc2Mean.toFixed(4), missing_counts: tc2Missing, missing_ratio_4: tc2MissingRatio, cond_a: tc2CondA, cond_b: tc2CondB, verdict: tc2Verdict, threshold: { mean_red: TC2_MEAN_RED, field_missing_red: TC2_FIELD_MISSING_RED } },
  tc3: { per_source: covFacts.map(function (c) { return { path: c.subject, hit: c.value.hit, keywords: c.value.keywords, ratio_4: c.value.ratio.toFixed(4), missed: c.value.missed }; }), lowest_path: tc3Lowest ? tc3Lowest.subject : null, lowest_ratio_4: tc3Ratio.toFixed(4), verdict: tc3Verdict, threshold: { red: TC3_RED, green: TC3_GREEN, top_n: TC3_TOPN } },
  nc1: { path: NC1_PATH, fact_count: nc1.fact_count, five_piece_present: nc1.five_piece_present, supersede_present: nc1.supersede_present, pass: nc1.pass },
  pc1: pc1,
  pc2: pc2
};
for (const k of Object.keys(measurements.tc2.missing_ratio_4)) { measurements.tc2.missing_ratio_4[k] = Number(measurements.tc2.missing_ratio_4[k].toFixed(4)); }
writeFileSync(join(HERE, '23-measurements.json'), JSON.stringify(measurements, null, 2) + String.fromCharCode(10), 'utf8');

// ---------- §8 证据（C3）+ 结论→引文锚（引文→结论支持关系校验） ----------
const MEAS_REL = '.scratch/architecture-recovery/reports/23-measurements.json';

function pickExcerpt(relPath, tokens) {
  const text = readFileSync(join(REPO, relPath), 'utf8');
  const list = Array.isArray(tokens) ? tokens : [tokens];
  const lines = text.split(String.fromCharCode(10));
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of list) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + relPath + ' tokens=' + String(tokens));
}

const evidence = [];
function addEvidence(id, relPath, token, claim, reproCmd) {
  const ex = pickExcerpt(relPath, token);
  evidence.push({
    evidence_id: id,
    source: relPath,
    locator: 'L' + ex.line,
    claim: claim,
    grounded: true,
    collected_at: HEAD_DATE,
    reproduce_cmd: reproCmd,
    reproduce_absent_reason: null,
    required_tokens: [],
    excerpt: ex.text
  });
}

const REPRO_PREREG = 'git show 7395495:.scratch/architecture-recovery/reports/22-criteria-pre-registration.md';
const REPRO_RUN = 'node .scratch/architecture-recovery/reports/23-first-report.mjs';

addEvidence('EV-001', PRE_REG, '0.2462', '预声明（跑前写死）：TC-2 mean_ratio = 0.2462，判 RED', REPRO_PREREG);
addEvidence('EV-002', PRE_REG, ['INCONCLUSIVE', '可判定数'], '预声明：TC-1 可判定数 2 < 门槛 5，判 INCONCLUSIVE', REPRO_PREREG);
addEvidence('EV-003', PRE_REG, ['AMBER', '0.6000'], '预声明：TC-3 最低 ratio = 0.6000，判 AMBER', REPRO_PREREG);
addEvidence('EV-004', 'docs/adr/0012-value-validation-loop-first.md', '阶段 1 = Macro-B', 'ADR-0012：阶段 1 = 6F 自身 Macro-B happy path 出首报', 'git show HEAD:docs/adr/0012-value-validation-loop-first.md');
addEvidence('EV-005', 'docs/adr/0013-three-layer-acceptance-gates.md', 'A→B→C', 'ADR-0013：首报验收 = A→B→C 三层串行闸门', 'git show HEAD:docs/adr/0013-three-layer-acceptance-gates.md');
addEvidence('EV-006', MEAS_REL, 'mean_ratio_4', '本次实测：TC-2 mean_ratio（4 位小数）', REPRO_RUN);
addEvidence('EV-007', MEAS_REL, 'judgeable_n', '本次实测：TC-1 可判定数', REPRO_RUN);
addEvidence('EV-008', MEAS_REL, 'lowest_ratio_4', '本次实测：TC-3 最低覆盖率（4 位小数）', REPRO_RUN);
addEvidence('EV-009', MEAS_REL, 'five_piece_present', '本次实测：NC-1 负对照选材五件套命中数（预期 0）', REPRO_RUN);
addEvidence('EV-010', MEAS_REL, 'golden_supersede_hit_s', '本次实测：PC-1 正对照 golden ADR 的 supersede 链命中', REPRO_RUN);
addEvidence('EV-011', MEAS_REL, 'delta_days_s', '本次实测：PC-2 正对照事后补写 ADR 的 delta_days', REPRO_RUN);

const claims = [];
function addClaim(id, evId, tokens) { claims.push({ claim_id: id, evidence_id: evId, required_tokens: tokens }); }
addClaim('CL-001', 'EV-006', ['mean_ratio_4', measurements.tc2.mean_ratio_4]);
addClaim('CL-002', 'EV-007', ['judgeable_n', String(tc1Judgeable)]);
addClaim('CL-003', 'EV-008', ['lowest_ratio_4', measurements.tc3.lowest_ratio_4]);
addClaim('CL-004', 'EV-001', ['0.2462']);
addClaim('CL-005', 'EV-002', ['INCONCLUSIVE', '可判定数']);
addClaim('CL-006', 'EV-003', ['AMBER', '0.6000']);
addClaim('CL-007', 'EV-004', ['阶段 1 = Macro-B']);
addClaim('CL-008', 'EV-005', ['A→B→C']);
addClaim('CL-009', 'EV-009', ['five_piece_present', '0']);
addClaim('CL-010', 'EV-010', ['golden_supersede_hit_s', 'true']);
addClaim('CL-011', 'EV-011', ['delta_days_s', pc2.delta_days_s]);

// ---------- §9 裁定条目（C2 结构化裁决块，逐条锚定 B 层产物） ----------
function tcBand(v) {
  if (v === 'INCONCLUSIVE') { return 'insufficient'; }
  if (v === 'RED') { return 'unsupported'; }
  return 'supported';
}

// 双锚：commit sha 之外再取 tree sha（调研报告 §2.1 / arXiv:2607.02820：commit sha 可塑，tree 才是内容寻址主体）
const TREE_SHA = git(['rev-parse', 'HEAD^{tree}']).trim();
const GATE_REF = {
  prereg_commit: '7395495',
  criteria_path: PRE_REG,
  basis_path: C_BASIS,
  criterion_ids: ['PC-1', 'PC-2', 'TC-1', 'TC-2', 'TC-3', 'NC-1']
};

const tc1FactIds = gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return f.fact_id; });
const tc2FactIds = adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return f.fact_id; });
const tc3FactIds = covFacts.map(function (c) { return c.fact_id; });

const adjudicationEntries = [
  { criterion_id: 'PC-1', band: pc1.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: [pc1AdrFacts[0].fact_id, pc1PosFacts[0].fact_id], anchored_evidence_ids: ['EV-010'], decided_at: HEAD_DATE, rationale: pc1.pass ? 'adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中' : '正对照未中，管线故障 P0' },
  { criterion_id: 'PC-2', band: pc2.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: pc2Lag.length > 0 ? [pc2Lag[0].fact_id] : [], anchored_evidence_ids: ['EV-011'], decided_at: HEAD_DATE, rationale: pc2.pass ? 'gitlog 族检出事后补写 delta_days = ' + String(pc2.delta_days) : '正对照未中，管线故障 P0' },
  { criterion_id: 'TC-1', band: tcBand(tc1Verdict), basis_refs: ['B2'], anchored_fact_ids: tc1FactIds, anchored_evidence_ids: ['EV-002', 'EV-007'], decided_at: HEAD_DATE, rationale: '可判定数 ' + tc1Judgeable + ' < 门槛 ' + TC1_MIN_N + '，判 ' + tc1Verdict + '（不等于绿，仅记数据缺口）' },
  { criterion_id: 'TC-2', band: tcBand(tc2Verdict), basis_refs: ['B2'], anchored_fact_ids: tc2FactIds, anchored_evidence_ids: ['EV-001', 'EV-006'], decided_at: HEAD_DATE, rationale: 'mean_ratio ' + measurements.tc2.mean_ratio_4 + ' 与 Status/Date 缺失率，判 ' + tc2Verdict },
  { criterion_id: 'TC-3', band: tcBand(tc3Verdict), basis_refs: ['B2'], anchored_fact_ids: tc3FactIds, anchored_evidence_ids: ['EV-003', 'EV-008'], decided_at: HEAD_DATE, rationale: '最低覆盖率 ' + measurements.tc3.lowest_ratio_4 + '（' + String(measurements.tc3.lowest_path) + '），判 ' + tc3Verdict },
  { criterion_id: 'NC-1', band: nc1.pass ? 'supported' : 'insufficient', basis_refs: ['B4'], anchored_fact_ids: nc1Facts.length > 0 ? [nc1Facts[0].fact_id] : [], anchored_evidence_ids: ['EV-009'], decided_at: HEAD_DATE, rationale: nc1.pass ? '负对照选材 ' + NC1_PATH + ' 五件套 0 命中、supersede 0 命中、fact_count = ' + nc1.fact_count : '负对照命中，转 §5.3 复核路径' }
];

const strategyBand = G.deriveOverallBand(adjudicationEntries);
const quadrants = [
  { quadrant: 'strategy', applicability: 'native', verdict: strategyBand, score: null, confidence: 0.75, dimensions: ['S1', 'S2'], slice_fields: { s1_keyword_coverage_ratio: Number(measurements.tc3.lowest_ratio_4), s2_five_piece_mean_ratio: Number(measurements.tc2.mean_ratio_4) }, verdict_gate: { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, decision: strategyBand, evidence_threshold_met: tc2Verdict === 'RED', decided_at: HEAD_DATE, override_reason: null, audit_ref: C_BASIS }, conflict_markers: [] },
  { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, decision: 'insufficient', evidence_threshold_met: false, decided_at: HEAD_DATE, override_reason: '本轮无 structure 象限采集器（阶段 1 只跑 S2+S1）', audit_ref: C_BASIS }, conflict_markers: ['out-of-scope-R3-01'] },
  { quadrant: 'behavior', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, decision: 'insufficient', evidence_threshold_met: false, decided_at: HEAD_DATE, override_reason: '本轮无 behavior 象限采集器（阶段 1 只跑 S2+S1）', audit_ref: C_BASIS }, conflict_markers: ['out-of-scope-R3-01'] },
  { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, decision: 'insufficient', evidence_threshold_met: false, decided_at: HEAD_DATE, override_reason: '本轮无 supply_chain 象限采集器（阶段 1 只跑 S2+S1）', audit_ref: C_BASIS }, conflict_markers: ['out-of-scope-R3-01'] }
];

const recommendations = [
  { rec_id: 'R-23-1', priority: 'P0', action: '为 docs/adr 全集 13 份补 Status/Date YAML 头，使 S2 事后补写判据可执行', rationale: 'TC-1 可判定数 2 < 门槛 5，根因是 11/13 ADR 无 Date 头（缺失率 84.62%）', expected_impact: 'TC-1 由 INCONCLUSIVE 转为可判定，S2 阈值获得 assay sensitivity', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-002', 'EV-006', 'EV-007'], degraded_note: null },
  { rec_id: 'R-23-2', priority: 'P1', action: '把 ADR 中文结构标记口径登记为 v2 追加（新开账本条目 + v1 留档），不在首报后静默重判', rationale: 'adr-structure@v1 只识别英文标记，6F 的 ADR-0001~0007 以 H1 + 自由正文书写；这是口径事实不是误报，改口径属改向', expected_impact: '消除 TC-2 RED 的口径歧义，保留 v1 结果可比性', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / unsupported', evidence_refs: ['EV-001', 'EV-006'], degraded_note: null },
  { rec_id: 'R-23-3', priority: 'P2', action: '把 23-first-report.json 侧车作为 Agent Plugin 的裁决块契约候选，落 R3-D7 分发前置清单', rationale: 'A-027 要求裁决块结构化、引文锚可解析；侧车已含 verdict 枚举 + evidence_id/source/locator 三元组', expected_impact: '下游 agent 可直接消费裁决而不必解析 md', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / supported', evidence_refs: ['EV-005'], degraded_note: null }
];

const HEADLINE = '6F 首报：主前提「ADR 具备可机器核验的决策记录结构」在 TC-2 被证伪（mean_ratio ' + measurements.tc2.mean_ratio_4 + ' < 0.60，Status/Date 缺失率 84.62%）；TC-1 因可判定数 ' + tc1Judgeable + ' < 门槛 5 判 INCONCLUSIVE；TC-3 判 ' + tc3Verdict + '；综合裁定 ' + strategyBand + '。';

const reportInput = {
  report_id: 'MA-23-6F-FIRST-REPORT',
  scale: 'Macro-B',
  subject_ref: '6F@' + HEAD_SHA,
  generated_at: HEAD_DATE,
  trace_id: ctx.traceId,
  baggage_id: C.deriveBaggageId(ctx, 'S2'),
  headline: HEADLINE,
  confidence: 0.75,
  stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: '1.1.0', fact_watermark_version: '1' },
  fact_ids: realFacts.map(function (f) { return f.fact_id; }),
  top_findings: ['EV-006', 'EV-007', 'EV-008'],
  evidence: evidence,
  claims: claims,
  quadrants: quadrants,
  recommendations: recommendations,
  adjudication_entries: adjudicationEntries,
  decided_at: HEAD_DATE,
  commit_anchor: HEAD_SHA,
  tree_anchor: TREE_SHA,
  gate_ref: GATE_REF,
  degraded: false,
  degraded_reason: null,
  human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
};

const report = G.buildReport(reportInput);
const FP_REASON = 'FP-2 Macro-B failure：docs/adr 采集域返回空事实（采集缺口，data doesn' + String.fromCharCode(39) + 't show），主前提不可裁定并发 GapRequest';
const degraded = G.degradeReport(report, FP_REASON);

const md = G.renderMarkdown(report);
const sidecar = G.renderSidecar(report);
const mdFail = G.renderMarkdown(degraded);
const sidecarFail = G.renderSidecar(degraded);

writeFileSync(join(HERE, '23-first-report.md'), md + String.fromCharCode(10), 'utf8');
writeFileSync(join(HERE, '23-first-report.json'), sidecar + String.fromCharCode(10), 'utf8');
writeFileSync(join(HERE, '23-first-report-failure.md'), mdFail + String.fromCharCode(10), 'utf8');
writeFileSync(join(HERE, '23-first-report-failure.json'), sidecarFail + String.fromCharCode(10), 'utf8');
writeFileSync(join(HERE, '23-fixtures.json'), JSON.stringify({ pc1_golden_adr: GOLDEN_ADR, pc1_positioning: POS_DECL, pc2_path: PC2_PATH, pc2_first_commit_date: pc2Commits[0].date, pc2_adr_date: pc2AdrDates[PC2_PATH], nc1_path: NC1_PATH }, null, 2) + String.fromCharCode(10), 'utf8');

const gates = {
  run: { head_sha: HEAD_SHA, observed_at: HEAD_DATE, commit_count: COMMIT_COUNT, adr_count: tc2Total, fact_count: realFacts.length },
  preflight: {
    t19_ci_run_ids: ['34736927344', '34737204262'],
    t19_ci_result: 'engine-ci 6/6 job 全绿（票 19 闭环）',
    t22_prereg_commit: '7395495',
    t22_prereg_path: PRE_REG,
    t22_c_basis_path: C_BASIS
  },
  A: {
    skeleton_happy: G.skeletonOf(md),
    skeleton_failure: G.skeletonOf(mdFail),
    receipt: report.receipt,
    evidence_count: evidence.length,
    citation_checks: report.adjudication.citation_checks
  },
  B: { pc1: pc1, pc2: pc2, tc1: measurements.tc1, tc2: measurements.tc2, tc3: measurements.tc3, nc1: measurements.nc1 },
  C: { overall: report.adjudication.overall, entries: report.adjudication.entries, human: report.adjudication.human },
  outputs: {
    happy_md: '.scratch/architecture-recovery/reports/23-first-report.md',
    happy_sidecar: '.scratch/architecture-recovery/reports/23-first-report.json',
    failure_md: '.scratch/architecture-recovery/reports/23-first-report-failure.md',
    failure_sidecar: '.scratch/architecture-recovery/reports/23-first-report-failure.json',
    facts_jsonl: '.scratch/architecture-recovery/reports/23-facts.jsonl',
    facts_insert_sql: '.scratch/architecture-recovery/reports/23-facts-insert.sql',
    measurements: '.scratch/architecture-recovery/reports/23-measurements.json',
    fixtures: '.scratch/architecture-recovery/reports/23-fixtures.json'
  }
};
writeFileSync(join(HERE, '23-gates.json'), JSON.stringify(gates, null, 2) + String.fromCharCode(10), 'utf8');

console.log('[23] head=' + HEAD_SHA.slice(0, 7) + ' commits=' + COMMIT_COUNT + ' adr=' + tc2Total + ' facts=' + realFacts.length);
console.log('[23] PC-1 ' + (pc1.pass ? 'PASS' : 'FAIL') + ' | PC-2 ' + (pc2.pass ? 'PASS' : 'FAIL') + ' delta_days=' + String(pc2.delta_days));
console.log('[23] TC-1 ' + tc1Verdict + ' (n=' + tc1Judgeable + ') | TC-2 ' + tc2Verdict + ' (mean=' + measurements.tc2.mean_ratio_4 + ') | TC-3 ' + tc3Verdict + ' (' + measurements.tc3.lowest_ratio_4 + ')');
console.log('[23] NC-1 ' + (nc1.pass ? 'PASS' : 'FAIL') + ' (facts=' + nc1.fact_count + ', five=' + nc1.five_piece_present + ')');
console.log('[23] overall=' + report.adjudication.overall + ' receipt=' + report.receipt.receipt_id);
const supports = report.adjudication.citation_checks.filter(function (c) { return c.support === 'supports'; }).length;
console.log('[23] citation checks ' + supports + '/' + report.adjudication.citation_checks.length + ' supports');
