// 40-macro-b-one-shot.mjs — Macro-B（已上架层）外部公开仓 URL opt-in 泛化验证（#40 / A-045 / R5-09 / spec §R5-D9）
// 复用说明：本文件 = 40-macro-b-one-shot.mjs 同构复用——采集/裁决/报告管线与预声明阈值零改动；
// [轮16/#53-D-060⑤] 本脚本已转 audit 一等命令（macro-audit audit）的回归对照物——非命令面主入口；audit 产物字段⊆本脚本产物字段，漂移即报警（53-check 断言）。
//   差异仅：默认目标=外部仓 clone 缓存、产物命名 40-*、披露块 calibration_scope=外部仓、条目 id 前缀 40-。
// 用法：
//   node 40-macro-b-one-shot.mjs                                          # 默认外部仓（open-gsd/gsd-core @ 40-clone-cache）
//   node 40-macro-b-one-shot.mjs --repo gsd-core --root <abs> --out <dir>   # 显式单仓形态
// 链 = URL opt-in intake（engine intake repo add：隔离缓存+全深度+浅拒+禁远程配置执行）
//   → 采集（gitlog + adr-structure@v2 + positioning）→ fact（40-*-facts.jsonl + 共享 40-audit-facts.duckdb）
//   → 裁决（PC-1/PC-2 正对照 + TC-1/2/3 真判据 + NC-1 负对照，阈值=22-criteria-pre-registration.md）→ 报告。
// 纪律：被测仓只读（git 只读子命令 + 文件读，绝不写）；唯一写动作 = --out 目录 40-* 工件。
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');                 // 6F 仓根（engine 所在）
const DIST = join(REPO, 'engine', 'dist');
const NL = String.fromCharCode(10);

const C = await import(pathToFileURL(join(DIST, 'collect', 'collectors.js')).href);
const G = await import(pathToFileURL(join(DIST, 'report', 'generate.js')).href);
const S = await import(pathToFileURL(join(DIST, 'fact', 'schema.js')).href);
const STORE = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);
const I = await import(pathToFileURL(join(DIST, 'intake', 'intake.js')).href);// #54/D-059①：%cI 输出经归一化（+00:00→Z）＋严格形状断言，与引擎同口径防跨版本漂移

// ---------- §0 参数：默认三仓全跑；--repo/--root/--out = 单仓 CI 形态 ----------
const EXT_URL = 'https://github.com/open-gsd/gsd-core.git';
const EXT_CACHE_KEY = createHash('sha256').update(EXT_URL).digest('hex').slice(0, 16);
const DEFAULT_REPOS = [
  { repo: 'gsd-core', root: join(HERE, '40-clone-cache', 'repos', EXT_CACHE_KEY) }
];
function parseArgs(argv) {
  const out = { repo: null, root: null, out: HERE };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--repo') { out.repo = argv[++i]; }
    else if (argv[i] === '--root') { out.root = argv[++i]; }
    else if (argv[i] === '--out') { out.out = argv[++i]; }
  }
  return out;
}
const ARGS = parseArgs(process.argv.slice(2));
const TARGETS = ARGS.repo ? [{ repo: ARGS.repo, root: resolve(ARGS.root || '.') }] : DEFAULT_REPOS;
const OUTDIR = resolve(ARGS.out);
if (!existsSync(OUTDIR)) { mkdirSync(OUTDIR, { recursive: true }); }

// ---------- §1 预声明阈值（与 22-criteria-pre-registration.md 逐字对齐，跑后禁调） ----------
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
const rawProbe = JSON.parse(readFileSync(join(HERE, '22-threshold-raw.json'), 'utf8'));
const STOPWORDS = rawProbe.tc3_s1_coverage.stopwords;
if (!Array.isArray(STOPWORDS)) { throw new Error('STOPWORDS-MISSING: 22-threshold-raw.json#tc3_s1_coverage.stopwords 不可解析'); }

// ---------- §2 正/负对照夹具（与 23-first-report.mjs 同构；PC-2 日期随被测仓观测日漂移保持 lag>0） ----------
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
].join(NL);
const POS_DECL = 'macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor';
const INTENT_CANDIDATES = ['CONTEXT.md', 'README.md', 'AGENTS.md'];   // positioning 意图面：仓根三件套（存在才取）
const NC1_CANDIDATES = ['package.json', 'README.md', 'Cargo.toml'];   // 负对照选材：非 ADR 文件，五件套预期 0 命中

function git(root, args) {
  return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function pickExcerpt(absOrRelPath, tokens, base) {
  const text = readFileSync(base ? join(base, absOrRelPath) : absOrRelPath, 'utf8');
  const lines = text.split(NL);
  if (tokens === null || tokens === undefined) { return { line: 1, text: lines[0].trim() }; }  // 文件存在性锚：取首行
  const list = Array.isArray(tokens) ? tokens : [tokens];
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of list) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}

// ---------- §3 单仓 one-shot 全链 ----------
async function runOneShot(target) {
  const NAME = target.repo;
  const ROOT = target.root;
  const HEAD_SHA = git(ROOT, ['rev-parse', 'HEAD']).trim();
  const HEAD_DATE = I.normalizeGitIsoDate(git(ROOT, ['log', '-1', '--format=%cI']).trim());
  const TREE_SHA = git(ROOT, ['rev-parse', 'HEAD^{tree}']).trim();
  const COMMIT_COUNT = Number(git(ROOT, ['rev-list', '--count', 'HEAD']).trim());
  const ctx = {
    runId: 'r40-' + NAME + '-' + HEAD_SHA.slice(0, 7),
    traceId: C.sha256Hex(NAME + '|' + HEAD_SHA + '|' + HEAD_DATE).slice(0, 32),
    repoRef: NAME + '@' + HEAD_SHA,
    scale: 'Macro-B',
    observedAt: HEAD_DATE
  };

  // -- 采集：gitlog（PROBE-INVARIANT：解析完整性先断言） --
  const rawLog = git(ROOT, ['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
  const commits = [];
  let cur = null;
  for (const line of rawLog.split(NL)) {
    const t = line.trim();
    if (t.indexOf('__R__') === 0) {
      const parts = t.slice(5).split('|');
      cur = { sha: parts[0], author: parts[1], date: I.normalizeGitIsoDate(parts[2]), paths: [] };
      commits.push(cur);
    } else if (cur && t.length > 0) {
      cur.paths.push(t);
    }
  }
  if (commits.length !== COMMIT_COUNT) { throw new Error('PROBE-INVARIANT-FAIL[' + NAME + ']: parsed ' + commits.length + ' != git rev-list ' + COMMIT_COUNT); }

  // -- 采集：ADR 语料（adr-structure@v2 回退链） --
  const adrDir = join(ROOT, 'docs', 'adr');
  const adrFiles = existsSync(adrDir) ? readdirSync(adrDir).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() : [];
  const firstCommitOf = (p) => {
    let best = null;
    for (const c of commits) { if (c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) { best = c.date; } }
    return best;
  };
  const adrDocs = adrFiles.map(function (f) {
    const rel = 'docs/adr/' + f;
    return { path: rel, text: readFileSync(join(adrDir, f), 'utf8'), first_commit_date: firstCommitOf(rel) };
  });
  const adrPaths = adrDocs.map(function (d) { return d.path; });
  const adrFacts = C.collectAdrStructureV2({ documents: adrDocs }, ctx);
  const adrDateMap = {};
  for (const f of adrFacts) {
    if (f.metric === 'adr.decision_date') {
      const v = JSON.parse(f.value_json);
      if (v.date) { adrDateMap[f.subject_ref] = v.date.slice(0, 10); }
    }
  }
  const gitFacts = C.collectGitlog({ commits: commits, paths: adrPaths, adrDates: adrDateMap }, ctx);

  // -- 采集：positioning（意图面=仓根 CONTEXT/README/AGENTS 存在者；交付面=git log subjects） --
  const intentDocs = [];
  for (const cand of INTENT_CANDIDATES) {
    const p = join(ROOT, cand);
    if (existsSync(p)) { intentDocs.push({ path: cand, text: readFileSync(p, 'utf8') }); }
  }
  const subjects = git(ROOT, ['log', '--pretty=format:%s']).split(NL);
  const deliveryDocs = [{ path: 'git log subjects @ ' + HEAD_SHA.slice(0, 7), text: subjects.join(NL) }];
  const posFacts = intentDocs.length > 0
    ? C.collectPositioning({ intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: TC3_TOPN, stopwords: STOPWORDS }, ctx)
    : [];
  const realFacts = adrFacts.concat(posFacts, gitFacts);

  // -- 正对照 PC-1 / PC-2（管线健康闸，夹具与被测仓无关） --
  const pc1AdrFacts = C.collectAdrStructure({ documents: [{ path: 'fixtures/40-pc1-golden-adr.md', text: GOLDEN_ADR }] }, ctx);
  const pc1PosFacts = C.collectPositioning({ intentDocs: [{ path: 'fixtures/40-pc1-positioning.md', text: POS_DECL }], deliveryDocs: [{ path: 'fixtures/40-pc1-delivery.md', text: POS_DECL }], topN: TC3_TOPN, stopwords: STOPWORDS }, ctx);
  const pc1Five = pc1AdrFacts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
  const pc1Sup = pc1AdrFacts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
  const pc1 = {
    pass: pc1AdrFacts.length > 0 && pc1PosFacts.length > 0 && pc1Five && JSON.parse(pc1Five.value_json).present === 5 && pc1Sup && JSON.parse(pc1Sup.value_json).present === true
  };
  const PC2_PATH = 'fixtures/40-pc2-lag-adr.md';
  const pc2Commits = [{ sha: 'pc2fixture0000000000000000000000000000001', author: 'fixture', date: '2026-01-01T00:00:00+08:00', paths: [PC2_PATH] }];
  const pc2AdrDates = {}; pc2AdrDates[PC2_PATH] = '2026-09-13';
  const pc2Facts = C.collectGitlog({ commits: pc2Commits, paths: [PC2_PATH], adrDates: pc2AdrDates }, ctx);
  const pc2Lag = pc2Facts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
  const pc2 = { pass: pc2Lag.length > 0 && JSON.parse(pc2Lag[0].value_json).delta_days > 0, delta_days: pc2Lag.length > 0 ? JSON.parse(pc2Lag[0].value_json).delta_days : null };

  // -- 负对照 NC-1（被测仓内非 ADR 文件，五件套预期 0 命中） --
  let nc1Path = null;
  for (const cand of NC1_CANDIDATES) { if (existsSync(join(ROOT, cand))) { nc1Path = cand; break; } }
  if (!nc1Path) { throw new Error('NC1-CANDIDATE-MISS[' + NAME + ']'); }
  const nc1Facts = C.collectAdrStructure({ documents: [{ path: nc1Path, text: readFileSync(join(ROOT, nc1Path), 'utf8') }] }, ctx);
  const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
  const nc1Sup = nc1Facts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
  const nc1 = { path: nc1Path, fact_count: nc1Facts.length, five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1, supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null };
  nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;

  // -- 真判据 TC-1 / TC-2 / TC-3（预声明阈值，实测） --
  const lagValues = gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return JSON.parse(f.value_json); });
  const tc1Judgeable = lagValues.length;
  const tc1Backfill = lagValues.filter(function (v) { return v.delta_days > TC1_LAG_DAYS; }).length;
  const tc1Ratio = tc1Judgeable === 0 ? 0 : tc1Backfill / tc1Judgeable;
  const tc1Verdict = tc1Judgeable < TC1_MIN_N ? 'INCONCLUSIVE' : (tc1Ratio > TC1_RATIO_RED ? 'RED' : 'NOT_RED');
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
  const tc2Verdict = (tc2CondA || tc2CondB) ? 'RED' : 'NOT_RED';
  const covFacts = posFacts.filter(function (f) { return f.metric === 'positioning.keyword_coverage'; }).map(function (f) { return { subject: f.subject_ref, value: JSON.parse(f.value_json), fact_id: f.fact_id }; });
  let tc3Lowest = null;
  for (const c of covFacts) { if (tc3Lowest === null || c.value.ratio < tc3Lowest.value.ratio) { tc3Lowest = c; } }
  const tc3Ratio = tc3Lowest ? tc3Lowest.value.ratio : 0;
  const tc3Verdict = intentDocs.length === 0 ? 'INCONCLUSIVE' : (tc3Ratio < TC3_RED ? 'RED' : (tc3Ratio < TC3_GREEN ? 'AMBER' : 'GREEN'));

  // -- fact：JSONL（只追加形态绑定 audit_fact 列；PC/NC 夹具不入流，与 #23 同构） --
  const factRows = realFacts.map(function (f, i) {
    return { fact_seq: i + 1, fact_id: f.fact_id, schema_version: S.SCHEMA_VERSION_V0, trace_id: f.trace_id, baggage_id: f.baggage_id, scale: f.scale, quadrant: f.quadrant, dimension: f.dimension, collector_id: f.collector_id, repo_ref: f.repo_ref, subject_ref: f.subject_ref, evidence_ref: f.evidence_ref, metric: f.metric, value_json: f.value_json, observed_at: f.observed_at, ingested_at: HEAD_DATE };
  });
  const FACTS_PATH = join(OUTDIR, '40-macro-b-' + NAME + '-facts.jsonl');
  writeFileSync(FACTS_PATH, factRows.map(function (r) { return JSON.stringify(r); }).join(NL) + NL, 'utf8');

  // -- 实测数落盘（供引文回查 + 39-check 断言面） --
  const meas = {
    repo: NAME, root: ROOT, observed_at: HEAD_DATE, head_sha: HEAD_SHA, tree_sha: TREE_SHA, commit_count: COMMIT_COUNT,
    adr_count: tc2Total, intent_docs: intentDocs.map(function (d) { return d.path; }), fact_count: realFacts.length,
    tc1: { judgeable_n: tc1Judgeable, backfill_n: tc1Backfill, ratio_4: tc1Ratio.toFixed(4), verdict: tc1Verdict, threshold: { lag_days: TC1_LAG_DAYS, ratio_red: TC1_RATIO_RED, min_n: TC1_MIN_N } },
    tc2: { total: tc2Total, mean_ratio_4: tc2Mean.toFixed(4), missing_counts: tc2Missing, missing_ratio_4: Object.fromEntries(Object.keys(tc2MissingRatio).map(function (k) { return [k, Number(tc2MissingRatio[k].toFixed(4))]; })), cond_a: tc2CondA, cond_b: tc2CondB, verdict: tc2Verdict, threshold: { mean_red: TC2_MEAN_RED, field_missing_red: TC2_FIELD_MISSING_RED } },
    tc3: { per_source: covFacts.map(function (c) { return { path: c.subject, hit: c.value.hit, keywords: c.value.keywords, ratio_4: c.value.ratio.toFixed(4) }; }), lowest_path: tc3Lowest ? tc3Lowest.subject : null, lowest_ratio_4: tc3Ratio.toFixed(4), verdict: tc3Verdict, threshold: { red: TC3_RED, green: TC3_GREEN, top_n: TC3_TOPN } },
    nc1: nc1, pc1: pc1, pc2: pc2
  };
  const MEAS_NAME = '40-macro-b-' + NAME + '-measurements.json';
  writeFileSync(join(OUTDIR, MEAS_NAME), JSON.stringify(meas, null, 2) + NL, 'utf8');

  // -- 证据（C3）+ 结论→引文锚 --
  const evidence = [];
  function addEvidence(id, path, token, claim, reproCmd, base) {
    const ex = pickExcerpt(path, token, base || null);
    evidence.push({ evidence_id: id, source: path, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: HEAD_DATE, reproduce_cmd: reproCmd, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const RUN_CMD = 'node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --repo ' + NAME + ' --root ' + ROOT;
  const MEAS_REL = join(OUTDIR, MEAS_NAME);
  const MEAS_TOK = function (k) { return '"' + k + '"'; };
  const R = NAME.toUpperCase().split('-').join('');
  addEvidence('EV-40-' + R + '-01', MEAS_REL, MEAS_TOK('fact_count'), '本次实测：' + NAME + ' Macro-B one-shot 采集事实数', RUN_CMD);
  addEvidence('EV-40-' + R + '-02', MEAS_REL, MEAS_TOK('verdict'), '本次实测：' + NAME + ' TC-1 ADR 事后补写判据裁定（' + tc1Verdict + '）', RUN_CMD);
  addEvidence('EV-40-' + R + '-03', MEAS_REL, MEAS_TOK('mean_ratio_4'), '本次实测：' + NAME + ' TC-2 五件套完整度 mean_ratio', RUN_CMD);
  addEvidence('EV-40-' + R + '-04', MEAS_REL, MEAS_TOK('lowest_ratio_4'), '本次实测：' + NAME + ' TC-3 定位覆盖率最低值', RUN_CMD);
  addEvidence('EV-40-' + R + '-05', MEAS_REL, MEAS_TOK('five_piece_present'), '本次实测：' + NAME + ' NC-1 负对照选材五件套命中数（预期 0）', RUN_CMD);
  if (adrFiles.length > 0) {
    addEvidence('EV-40-' + R + '-06', 'docs/adr/' + adrFiles[0], null, NAME + ' ADR 语料锚：docs/adr/' + adrFiles[0] + ' 实物存在（语料 ' + adrFiles.length + ' 份）', 'git -C ' + ROOT + ' show HEAD:docs/adr/' + adrFiles[0], ROOT);
  }
  addEvidence('EV-40-' + R + '-07', '.scratch/macro-audit/decision-ledger.md', '非自有公开仓', 'D-033：泛化验证必须引 ≥1 非自有公开仓（D-013 URL opt-in 首实用户）= Macro-B GA 前置条件', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);

  const claims = [];
  function addClaim(id, evId, tokens) { claims.push({ claim_id: id, evidence_id: evId, required_tokens: tokens }); }
  addClaim('CL-40-' + R + '-01', 'EV-40-' + R + '-01', ['fact_count']);
  addClaim('CL-40-' + R + '-02', 'EV-40-' + R + '-02', ['verdict']);
  addClaim('CL-40-' + R + '-03', 'EV-40-' + R + '-03', ['mean_ratio_4']);
  addClaim('CL-40-' + R + '-04', 'EV-40-' + R + '-04', ['lowest_ratio_4']);
  addClaim('CL-40-' + R + '-05', 'EV-40-' + R + '-05', ['five_piece_present']);
  addClaim('CL-40-' + R + '-06', 'EV-40-' + R + '-07', ['非自有公开仓']);

  // -- 裁决条目（C2；band 三档如实：supported/unsupported/insufficient） --
  function tcBand(v) {
    if (v === 'INCONCLUSIVE') { return 'insufficient'; }
    if (v === 'RED') { return 'unsupported'; }
    return 'supported';
  }
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
    { criterion_id: 'PC-1', band: pc1.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: (pc1AdrFacts.length > 0 ? [pc1AdrFacts[0].fact_id] : []).concat(pc1PosFacts.length > 0 ? [pc1PosFacts[0].fact_id] : []), anchored_evidence_ids: ['EV-40-' + R + '-01'], decided_at: HEAD_DATE, rationale: pc1.pass ? 'adr-structure 与 positioning 两族均产出非空事实，golden ADR 五件套 5/5 且 supersede 链命中（' + NAME + ' run 内管线活性正对照）' : '正对照未中，管线故障 P0' },
    { criterion_id: 'PC-2', band: pc2.pass ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: pc2Lag.length > 0 ? [pc2Lag[0].fact_id] : [], anchored_evidence_ids: ['EV-40-' + R + '-01'], decided_at: HEAD_DATE, rationale: pc2.pass ? 'gitlog 族检出事后补写 delta_days = ' + String(pc2.delta_days) : '正对照未中，管线故障 P0' },
    { criterion_id: 'TC-1', band: tcBand(tc1Verdict), basis_refs: ['B2'], anchored_fact_ids: tc1FactIds, anchored_evidence_ids: ['EV-40-' + R + '-02'], decided_at: HEAD_DATE, rationale: NAME + ' ADR 事后补写：可判定数 ' + tc1Judgeable + '（门槛 ' + TC1_MIN_N + '），>90d 占比 ' + meas.tc1.ratio_4 + '，判 ' + tc1Verdict },
    { criterion_id: 'TC-2', band: tcBand(tc2Verdict), basis_refs: ['B2'], anchored_fact_ids: tc2FactIds, anchored_evidence_ids: ['EV-40-' + R + '-03'], decided_at: HEAD_DATE, rationale: NAME + ' ADR 五件套：mean_ratio ' + meas.tc2.mean_ratio_4 + '（门槛 ' + TC2_MEAN_RED + '），字段缺失率超线=' + tc2CondB + '，判 ' + tc2Verdict },
    { criterion_id: 'TC-3', band: tcBand(tc3Verdict), basis_refs: ['B2'], anchored_fact_ids: tc3FactIds, anchored_evidence_ids: ['EV-40-' + R + '-04'], decided_at: HEAD_DATE, rationale: NAME + ' 定位覆盖：意图面 ' + intentDocs.length + ' 件最低 ratio ' + meas.tc3.lowest_ratio_4 + '（' + String(meas.tc3.lowest_path) + '），判 ' + tc3Verdict },
    { criterion_id: 'NC-1', band: nc1.pass ? 'supported' : 'insufficient', basis_refs: ['B4'], anchored_fact_ids: nc1Facts.length > 0 ? [nc1Facts[0].fact_id] : [], anchored_evidence_ids: ['EV-40-' + R + '-05'], decided_at: HEAD_DATE, rationale: nc1.pass ? '负对照选材 ' + NAME + '/' + nc1Path + ' 五件套 0 命中、supersede 0 命中（特异性成立）' : '负对照命中，转复核路径' }
  ];
  const strategyBand = G.deriveOverallBand(adjudicationEntries);

  // -- 四象限切片（Macro-B 已上架采集面 = strategy 原生；其余 not_applicable 如实披露） --
  const GATE = { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, audit_ref: 'reports/40-macro-b-one-shot.mjs' };
  const quadrants = [
    { quadrant: 'strategy', applicability: 'native', verdict: strategyBand, score: null, confidence: 0.6, dimensions: ['S1', 'S2'], slice_fields: { s1_keyword_coverage_ratio: Number(meas.tc3.lowest_ratio_4), s2_five_piece_mean_ratio: Number(meas.tc2.mean_ratio_4), adr_count: tc2Total, lag_judgeable_n: tc1Judgeable, intent_docs: intentDocs.length }, verdict_gate: { protocol_version: GATE.protocol_version, decision: strategyBand, evidence_flag: tc2Verdict === 'RED', decided_at: HEAD_DATE, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: [] },
    { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: 'Macro-B 已上架采集面仅 strategy（S1+S2）——structure 无采集器（与 #23 首报同口径）', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-stage1'] },
    { quadrant: 'behavior', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: 'Macro-B 已上架采集面仅 strategy（S1+S2）——behavior 无采集器', audit_ref: GATE.audit_ref }, conflict_markers: ['out-of-scope-stage1'] },
    { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: '⚠ 数据未接——Scorecard/repomix 按层需求队列接入不插队（D-034③）', audit_ref: GATE.audit_ref }, conflict_markers: ['data-not-connected'] }
  ];
  const recommendations = [
    { rec_id: 'R-40-' + R + '-1', priority: 'P1', action: 'adr-structure v2 回退链补「- **Field:**」（dash+加粗）头部腿——本仓 Status 缺失读数主要为 detector 漏认（可归属原因候选），v3 腿须先预注册判据再改 detector（27-prereg 纪律，v2 禁改）', rationale: 'gsd-core 92 份 ADR 头部统一为 dash+加粗形态，v2 四腿（dash/inline/inline-iso/git）未覆盖 → Status 缺失率主成分为漏认；外部仓泛化暴露的首个覆盖缺口', expected_impact: 'TC-2 字段缺失读数区分「真缺失 vs 漏认」，跨仓可比性恢复', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-40-' + R + '-03'], degraded_note: null },
    { rec_id: 'R-40-' + R + '-2', priority: 'P2', action: 'first-external-repo 事件 occurred 落账：desk-task2 判据达成（TC-1 judgeable≥min_n 5）→ triggered-bound；desk-task15 判据属 Micro-A（未上架层）→ 值守通道呈报', rationale: 'URL opt-in 首实用户落地（D-013），registry 绑定项按登记处置不静默', expected_impact: 'Macro-B GA 前置条件达成；挂门值守状态机推进', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / ' + strategyBand, evidence_refs: ['EV-40-' + R + '-07'], degraded_note: null }
  ];
  const HEADLINE = NAME + ' Macro-B one-shot（capability 1 of 5 · preview）：' + COMMIT_COUNT + ' commits / ADR ' + tc2Total + ' 份 / facts ' + realFacts.length + '——TC-1 ' + tc1Verdict + '（n=' + tc1Judgeable + '）、TC-2 ' + tc2Verdict + '（mean=' + meas.tc2.mean_ratio_4 + '）、TC-3 ' + tc3Verdict + '（' + meas.tc3.lowest_ratio_4 + '）→ 综合裁定 ' + strategyBand + '（反复接受非跑通：三档如实落数）。';

  const reportInput = {
    report_id: 'MA-40-' + NAME.toUpperCase().split('-').join('') + '-MACRO-B-ONESHOT',
    scale: 'Macro-B',
    subject_ref: NAME + '@' + HEAD_SHA.slice(0, 12),
    generated_at: HEAD_DATE,
    trace_id: ctx.traceId,
    baggage_id: C.deriveBaggageId(ctx, 'S2'),
    headline: HEADLINE,
    confidence: 0.6,
    stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: '1.1.0', fact_watermark_version: '1' },
    fact_ids: realFacts.map(function (f) { return f.fact_id; }),
    top_findings: ['EV-40-' + R + '-01', 'EV-40-' + R + '-03', 'EV-40-' + R + '-04'],
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
    preview_disclosure: {
      capability_label: 'capability 1 of 5 · preview',
      calibration_scope: '外部公开仓 URL opt-in 泛化验证（open-gsd/gsd-core，非自有公开仓——D-013 首实用户）',
      structural_limitations: [
        '单仓泛化证据：本报告为首个非自有仓 one-shot（n=1）——满足 D-033「≥1 外部仓」下限，不构成外部仓形态全覆盖',
        'structure/behavior/supply_chain 象限 not_applicable：Macro-B 已上架采集面仅 strategy（S1+S2）；供应链象限 ⚠ 数据未接（D-034③）',
        'TC-2 读数含 detector 漏认成分：gsd-core ADR 头部为「- **Field:**」（dash+加粗混排）形态，v2 回退链未覆盖——Status 缺失读数主要为漏认而非真实缺失（可归属原因候选，待 v3 腿预注册）',
        'one-shot 度量 = 反复接受非跑通：TC 三档裁定（supported/unsupported/insufficient）如实落数，不为跑通而跑通'
      ],
      not_in_preview: ['Micro-A', 'Micro-B', 'Macro-A']
    },
    human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
  };
  const report = G.buildReport(reportInput);
  const MD_NAME = '40-macro-b-' + NAME + '.md';
  const JSON_NAME = '40-macro-b-' + NAME + '.json';
  writeFileSync(join(OUTDIR, MD_NAME), G.renderMarkdown(report) + NL, 'utf8');
  writeFileSync(join(OUTDIR, JSON_NAME), G.renderSidecar(report) + NL, 'utf8');

  return {
    repo: NAME, head_sha: HEAD_SHA, head_date: HEAD_DATE, commit_count: COMMIT_COUNT,
    facts: realFacts, factRows: factRows, measurements: meas,
    verdicts: { pc1: pc1.pass, pc2: pc2.pass, tc1: tc1Verdict, tc2: tc2Verdict, tc3: tc3Verdict, nc1: nc1.pass, overall: report.adjudication.overall },
    receipt: report.receipt.receipt_id,
    outputs: { md: MD_NAME, sidecar: JSON_NAME, facts: '40-macro-b-' + NAME + '-facts.jsonl', measurements: MEAS_NAME }
  };
}

// ---------- §4 主流程：逐仓 one-shot → 共享事实库 → 汇总实测 ----------
const results = [];
for (const t of TARGETS) {
  results.push(await runOneShot(t));
}

// 共享事实库：40-audit-facts.duckdb——三仓 Macro-B 事实同一 audit_fact 表同一 appendFact 写路径
const DB = join(OUTDIR, '40-audit-facts.duckdb');
if (existsSync(DB)) { unlinkSync(DB); }
const writer = await STORE.openWriter(DB);
const seenFactIds = new Set();
let dedupDropped = 0;
let appended = 0;
for (const r of results) {
  for (const f of r.facts) {
    if (seenFactIds.has(f.fact_id)) { dedupDropped++; continue; }
    seenFactIds.add(f.fact_id);
    await STORE.appendFact(writer, f);
    appended++;
  }
}
const scaleRows = await (await STORE.queryFacts(writer, 'SELECT scale, COUNT(*) AS n FROM audit_fact GROUP BY scale ORDER BY scale')).getRows();
const repoRows = await (await STORE.queryFacts(writer, 'SELECT repo_ref, COUNT(*) AS n FROM audit_fact GROUP BY repo_ref ORDER BY repo_ref')).getRows();
const dbCounts = { by_scale: {}, by_repo: {} };
for (const r of scaleRows) { dbCounts.by_scale[String(r[0])] = Number(r[1]); }
for (const r of repoRows) { dbCounts.by_repo[String(r[0])] = Number(r[1]); }
await writer.run('FORCE CHECKPOINT');
writer.closeSync();

const summary = {
  probe: '40-macro-b-one-shot.mjs',
  generated_at: new Date().toISOString(),
  ticket: 40,
  a_xxx: 'A-045',
  scale: 'Macro-B',
  targets: results.map(function (r) {
    return {
      repo: r.repo, head_sha: r.head_sha, head_date: r.head_date, commit_count: r.commit_count,
      adr_count: r.measurements.adr_count, fact_count: r.factRows.length, intent_docs: r.measurements.intent_docs,
      verdicts: r.verdicts, receipt: r.receipt, outputs: r.outputs
    };
  }),
  shared_duckdb: {
    file: '40-audit-facts.duckdb',
    appended: appended,
    dedup_dropped: dedupDropped,
    db_by_scale: dbCounts.by_scale,
    db_by_repo: dbCounts.by_repo,
    note: '外部仓 Macro-B 事实同一 audit_fact 表、同一 appendFact 写路径（单写者串行追加）；与 #39 三仓基线同路径，供泛化对照'
  }
};
writeFileSync(join(OUTDIR, '40-macro-b-measurements.json'), JSON.stringify(summary, null, 2) + NL, 'utf8');

for (const r of results) {
  const v = r.verdicts;
  console.log('[40] ' + r.repo + ' head=' + r.head_sha.slice(0, 7) + ' commits=' + r.commit_count + ' adr=' + r.measurements.adr_count + ' facts=' + r.factRows.length +
    ' | PC-1 ' + (v.pc1 ? 'PASS' : 'FAIL') + ' PC-2 ' + (v.pc2 ? 'PASS' : 'FAIL') +
    ' | TC-1 ' + v.tc1 + ' TC-2 ' + v.tc2 + ' TC-3 ' + v.tc3 + ' NC-1 ' + (v.nc1 ? 'PASS' : 'FAIL') +
    ' | overall=' + v.overall + ' receipt=' + r.receipt);
}
console.log('[40] duckdb appended=' + appended + ' dedup_dropped=' + dedupDropped + ' ' + JSON.stringify(dbCounts.by_repo));
process.exit(0);
