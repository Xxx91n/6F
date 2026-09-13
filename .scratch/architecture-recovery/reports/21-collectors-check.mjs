// 守卫：确定性采集器（A-022 / spec.md §R3-D3）
// 用法：node .scratch/architecture-recovery/reports/21-collectors-check.mjs
// 约定：零依赖（不 import @duckdb/node-api）；直接 import 纯逻辑 schema.ts / collectors.ts（Node 22.18+ 类型剥离）。

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const FIXTURE = join(HERE, '21-collectors-fixture.json');
const MAP_JSON = join(HERE, '21-collectors.json');
const SCHEMA_TS = join(REPO, 'engine', 'src', 'fact', 'schema.ts');
const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
const map = JSON.parse(readFileSync(MAP_JSON, 'utf8'));
const S = await import(pathToFileURL(SCHEMA_TS).href);
const C = await import(pathToFileURL(COLLECT_TS).href);
const src = readFileSync(COLLECT_TS, 'utf8');
function stripComments(text) {
  return text.split(String.fromCharCode(10)).map(function (line) {
    const i = line.indexOf('//');
    return i >= 0 ? line.slice(0, i) : line;
  }).join(String.fromCharCode(10));
}
const code = stripComments(src);
const codeLower = code.toLowerCase();

const ctx = {
  runId: fx.context.runId,
  traceId: fx.context.traceId,
  repoRef: fx.context.repoRef,
  scale: fx.context.scale,
  observedAt: fx.context.observedAt
};

const adrFacts = C.collectAdrStructure(fx.adr, ctx);
const dates = C.adrDates(fx.adr);
const posFacts = C.collectPositioning(fx.positioning, ctx);
const gitFacts = C.collectGitlog({ commits: fx.gitlog.commits, paths: fx.gitlog.paths, adrDates: dates }, ctx);
const all = adrFacts.concat(posFacts).concat(gitFacts);
const EX = fx.expect;

function first(facts, metric, subject) {
  const r = facts.filter(function (f) {
    return f.metric === metric && (subject === undefined || f.subject_ref === subject);
  });
  return r.length > 0 ? r[0] : null;
}

// ---- N 组：不接 LLM / 无网络 / 无副作用 ----
const NET_TOKENS = ['fetch(', 'node:http', 'node:https', 'node:net', 'node:tls', 'node:dns', 'XMLHttpRequest', 'axios', 'undici', 'WebSocket'];
const netHits = NET_TOKENS.filter(function (t) { return code.indexOf(t) >= 0; });
check('N1', netHits.length === 0, 'netTokens=' + JSON.stringify(netHits));
const LLM_TOKENS = ['openai', 'anthropic', 'claude', 'gpt', 'gemini', 'embedding', 'llm', 'bedrock', 'ollama'];
const llmHits = LLM_TOKENS.filter(function (t) { return codeLower.indexOf(t) >= 0; });
check('N2', llmHits.length === 0, 'llmTokens=' + JSON.stringify(llmHits));
const NONDET = ['Date.now(', 'Math.random(', 'new Date('];
const ndHits = NONDET.filter(function (t) { return code.indexOf(t) >= 0; });
check('N3', ndHits.length === 0, 'nondeterministicCalls=' + JSON.stringify(ndHits));
const PROC = ['child_process', 'spawn', 'execSync', 'execFile'];
const procHits = PROC.filter(function (t) { return code.indexOf(t) >= 0; });
check('N4', procHits.length === 0, 'processTokens=' + JSON.stringify(procHits));
const FS_TOKENS = ['node:fs', 'readFileSync', 'readFile(', 'writeFileSync', 'opendirSync'];
const fsHits = FS_TOKENS.filter(function (t) { return code.indexOf(t) >= 0; });
check('N5', fsHits.length === 0, 'fsTokens=' + JSON.stringify(fsHits));
const THRESH = C.DETECTOR_BINDING.filter(function (e) { return e.threshold !== null; });
check('N6', THRESH.length === 0 && src.indexOf('THRESHOLD') < 0, 'nonNullThresholds=' + THRESH.length);

// ---- S 组：输出形状符合 schema v0 ----
const STORE_COLS = ['fact_seq', 'ingested_at', 'schema_version'];
const COLLECTOR_COLS = S.AUDIT_FACT_FIELDS.map(function (f) { return f.name; }).filter(function (n) { return STORE_COLS.indexOf(n) < 0; });
const WANT_KEYS = COLLECTOR_COLS.slice().sort().join(',');
const badKeys = all.filter(function (f) { return Object.keys(f).sort().join(',') !== WANT_KEYS; });
check('S1', all.length > 0 && badKeys.length === 0, 'facts=' + all.length + ' badKeySets=' + badKeys.length);
check('S2', COLLECTOR_COLS.length === 13, 'collectorProducedCols=' + COLLECTOR_COLS.length);
const SCALES = ['Macro-A', 'Macro-B', 'Macro-C', 'Micro-A', 'Micro-B'];
const badScale = all.filter(function (f) { return SCALES.indexOf(f.scale) < 0; });
check('S3', badScale.length === 0, 'scale=' + (all.length ? all[0].scale : 'none'));
const QUADRANTS = ['structure', 'behavior', 'supply-chain', 'strategic'];
const badQuad = all.filter(function (f) { return QUADRANTS.indexOf(f.quadrant) < 0; });
check('S4', badQuad.length === 0, 'quadrant=' + (all.length ? all[0].quadrant : 'none'));
const DIMS = ['S1', 'S2', 'S3', 'S4', 'S5'];
const badDim = all.filter(function (f) { return f.dimension !== null && DIMS.indexOf(f.dimension) < 0; });
check('S5', badDim.length === 0, 'badDimension=' + badDim.length);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const badId = all.filter(function (f) { return !UUID_RE.test(f.fact_id) || f.fact_id.length !== 36; });
check('S6', badId.length === 0, 'factIdSample=' + (all.length ? all[0].fact_id : 'none'));
const HEX32 = /^[0-9a-f]{32}$/;
const badHex = all.filter(function (f) { return !HEX32.test(f.trace_id) || !HEX32.test(f.baggage_id); });
check('S7', badHex.length === 0, 'correlationBad=' + badHex.length);
const badJson = all.filter(function (f) { try { JSON.parse(f.value_json); return false; } catch (e) { return true; } });
check('S8', badJson.length === 0, 'valueJsonInvalid=' + badJson.length);
const badClock = all.filter(function (f) { return f.observed_at !== ctx.observedAt; });
check('S9', badClock.length === 0, 'injectedClockMismatch=' + badClock.length);
const IDS = [C.ADR_STRUCTURE_ID, C.POSITIONING_ID, C.GITLOG_ID];
const badCid = all.filter(function (f) { return IDS.indexOf(f.collector_id) < 0; });
check('S10', badCid.length === 0, 'collectorIds=' + IDS.join(','));
function varcharMax(type) {
  const m = type.match(/^VARCHAR[(]([0-9]+)[)]$/);
  return m ? Number(m[1]) : null;
}
const lenBad = [];
S.AUDIT_FACT_FIELDS.forEach(function (f) {
  const max = varcharMax(f.type);
  all.forEach(function (row) {
    const v = row[f.name];
    if (v === undefined) { return; }
    if (v === null) { if (!f.nullable) { lenBad.push(f.name + ":null"); } return; }
    const s = String(v);
    if (s.length === 0 && !f.nullable) { lenBad.push(f.name + ":empty"); }
    if (max !== null && s.length > max) { lenBad.push(f.name + ":tooLong"); }
    if (f.type === "CHAR(32)" && s.length !== 32) { lenBad.push(f.name + ":char32"); }
  });
});
check('S11', lenBad.length === 0, 'lengthOrNullViolations=' + lenBad.length);
const badTrace = all.filter(function (f) { return f.trace_id !== fx.context.traceId; });
check('S12', badTrace.length === 0, 'tracePropagation=' + (all.length ? all[0].trace_id : 'none'));
// ---- C 组：抽取正确性 + 确定性 ----
const fiveC = first(adrFacts, 'adr.five_piece_completeness', EX.completePath);
const fiveCV = fiveC ? JSON.parse(fiveC.value_json) : null;
check('C1', !!fiveCV && fiveCV.present === EX.completeFivePiecePresent && fiveCV.ratio === EX.completeFivePieceRatio && fiveCV.missing.length === 0, 'completeFive=' + (fiveC ? fiveC.value_json : 'none'));
const fiveP = first(adrFacts, 'adr.five_piece_completeness', EX.partialPath);
const fivePV = fiveP ? JSON.parse(fiveP.value_json) : null;
check('C2', !!fivePV && JSON.stringify(fivePV.missing) === JSON.stringify(EX.partialMissing), 'partialMissing=' + (fiveP ? fiveP.value_json : 'none'));
const supC = first(adrFacts, 'adr.supersede_link_present', EX.completePath);
const supCV = supC ? JSON.parse(supC.value_json) : null;
check('C3', !!supCV && supCV.present === EX.completeSupersedePresent && supCV.matches >= 1, 'supersede=' + (supC ? supC.value_json : 'none'));
const supP = first(adrFacts, 'adr.supersede_link_present', EX.partialPath);
const supPV = supP ? JSON.parse(supP.value_json) : null;
check('C4', !!supPV && supPV.present === EX.partialSupersedePresent, 'partialSupersede=' + (supP ? supP.value_json : 'none'));
const dateC = first(adrFacts, 'adr.decision_date', EX.completePath);
check('C5', !!dateC && JSON.parse(dateC.value_json).date === EX.completeDecisionDate, 'decisionDate=' + (dateC ? dateC.value_json : 'none'));
const dateP = first(adrFacts, 'adr.decision_date', EX.partialPath);
check('C6', !!dateP && JSON.parse(dateP.value_json).date === EX.partialDecisionDate, 'partialDate=' + (dateP ? dateP.value_json : 'none'));
const cov = first(posFacts, 'positioning.keyword_coverage');
const covV = cov ? JSON.parse(cov.value_json) : null;
check('C7', !!covV && covV.keywords === EX.positioningKeywords && covV.hit + covV.missed.length === covV.keywords && covV.ratio >= 0 && covV.ratio <= 1, 'coverage=' + (cov ? cov.value_json : 'none'));
const drift = first(posFacts, 'positioning.drift_anchor');
const driftV = drift ? JSON.parse(drift.value_json) : null;
check('C8', !!driftV && (driftV.first_missed_keyword === null || covV.missed.indexOf(driftV.first_missed_keyword) >= 0), 'drift=' + (drift ? drift.value_json : 'none'));
const fc = first(gitFacts, 'git.first_commit', EX.completePath);
const fcV = fc ? JSON.parse(fc.value_json) : null;
check('C9', !!fcV && fcV.sha === EX.completeFirstCommitSha && fcV.date === EX.completeFirstCommitDate, 'firstCommit=' + (fc ? fc.value_json : 'none'));
const cc = first(gitFacts, 'git.commit_count', EX.completePath);
check('C10', !!cc && JSON.parse(cc.value_json).count === EX.completeCommitCount, 'commitCount=' + (cc ? cc.value_json : 'none'));
const fc2 = first(gitFacts, 'git.first_commit', EX.partialPath);
const fc2V = fc2 ? JSON.parse(fc2.value_json) : null;
check('C11', !!fc2V && fc2V.sha === EX.partialFirstCommitSha, 'partialFirstCommit=' + (fc2 ? fc2.value_json : 'none'));
const lag = first(gitFacts, 'git.adr_lag_days', EX.completePath);
const lagV = lag ? JSON.parse(lag.value_json) : null;
check('C12', !!lagV && lagV.delta_days === EX.lagDeltaDays && lagV.adr_date === EX.lagAdrDate && lagV.first_commit_date === EX.lagFirstCommitDate, 'adrLagDays=' + (lag ? lag.value_json : 'none'));
const am = first(gitFacts, 'git.author_matrix', EX.completePath);
const amV = am ? JSON.parse(am.value_json) : null;
check('C13', !!amV && amV.authors.length === 2 && amV.top_share > 0 && amV.top_share <= 1, 'authorMatrix=' + (am ? am.value_json : 'none'));
const rerun = C.collectAdrStructure(fx.adr, ctx).concat(C.collectPositioning(fx.positioning, ctx)).concat(C.collectGitlog({ commits: fx.gitlog.commits, paths: fx.gitlog.paths, adrDates: dates }, ctx));
check('C14', JSON.stringify(rerun) === JSON.stringify(all), 'deterministicRerunIdentical=' + (JSON.stringify(rerun) === JSON.stringify(all)));
const ctx2 = { runId: 'run-21-other', traceId: ctx.traceId, repoRef: ctx.repoRef, scale: ctx.scale, observedAt: ctx.observedAt };
const otherBag = C.deriveBaggageId(ctx2, 'S2');
const sameBag = C.deriveBaggageId(ctx, 'S2');
const sameBag2 = C.deriveBaggageId(ctx, 'S2');
check('C15', sameBag !== otherBag && sameBag === sameBag2, 'baggageStablePerRunAndVariesByRunId');
check('C16', adrFacts.length > 0 && posFacts.length > 0 && gitFacts.length > 0, 'familiesNonEmpty=' + adrFacts.length + '/' + posFacts.length + '/' + gitFacts.length);

// ---- D 组：detector 同族声明（D-018；供票 22 引用） ----
const B = C.DETECTOR_BINDING;
const pc = B.filter(function (e) { return e.type === 'positive_control'; });
const tc = B.filter(function (e) { return e.type === 'true_criterion'; });
const nc = B.filter(function (e) { return e.type === 'negative_control'; });
check('D1', B.length === 6 && pc.length === 2 && tc.length === 3 && nc.length === 1, 'positive=' + pc.length + ' true=' + tc.length + ' negative=' + nc.length);
function byCrit(name) {
  for (const e of B) { if (e.criterion === name) { return e; } }
  return null;
}
const tcBad = tc.filter(function (e) {
  const ctl = byCrit(e.same_family_control);
  if (!ctl) { return true; }
  const shared = e.families.filter(function (f) { return ctl.families.indexOf(f) >= 0; });
  return shared.length === 0;
});
check('D2', tcBad.length === 0, 'trueCriteriaWithoutSameFamilyControl=' + JSON.stringify(tcBad.map(function (e) { return e.criterion; })));
const famBad = [];
B.forEach(function (e) {
  e.families.forEach(function (f) { if (C.COLLECTOR_FAMILIES.indexOf(f) < 0) { famBad.push(e.criterion + ':' + f); } });
});
check('D3', famBad.length === 0, 'unknownFamilies=' + JSON.stringify(famBad));
const covered = [];
pc.forEach(function (e) {
  e.families.forEach(function (f) { if (covered.indexOf(f) < 0) { covered.push(f); } });
});
check('D4', C.COLLECTOR_FAMILIES.every(function (f) { return covered.indexOf(f) >= 0; }), 'familiesCoveredByPositiveControls=' + covered.join(','));
function jsonFamilies(entry) {
  const out = [];
  const push = function (x) { if (x && out.indexOf(x) < 0) { out.push(x); } };
  if (entry.families) { entry.families.forEach(push); }
  if (entry.primary_family) { push(entry.primary_family); }
  if (entry.cross_family) { entry.cross_family.forEach(push); }
  return out.sort();
}
const driftRows = [];
map.detector_binding.forEach(function (j) {
  const e = byCrit(j.criterion);
  if (!e) { driftRows.push(j.criterion + ':missing'); return; }
  if (e.type !== j.type) { driftRows.push(j.criterion + ':type'); }
  const jf = jsonFamilies(j);
  const ef = e.families.slice().sort();
  if (jf.join(',') !== ef.join(',')) { driftRows.push(j.criterion + ':families'); }
  const jc = j.same_family_control === undefined ? null : j.same_family_control;
  if (jc !== e.same_family_control) { driftRows.push(j.criterion + ':control'); }
});
check('D5', driftRows.length === 0, 'mapVsCodeDrift=' + JSON.stringify(driftRows));
check('D6', B.every(function (e) { return e.threshold === null; }) && !!map.for_ticket_22, 'thresholdsDeferredToTicket22');

// ---- A 组：只追加（A-021 继承） ----
const REWRITE = ['UPDATE audit_fact SET metric = 1', 'DELETE FROM audit_fact WHERE fact_seq = 1', 'DROP TABLE audit_fact', 'ALTER TABLE audit_fact ADD COLUMN x INTEGER', 'TRUNCATE TABLE audit_fact', 'MERGE INTO audit_fact USING t ON true WHEN MATCHED THEN UPDATE SET metric = 1'];
const leaked = [];
REWRITE.forEach(function (s) { if (S.classifyStatement(s).allow) { leaked.push(s); } });
check('A1', leaked.length === 0, 'appendOnlyRejected=' + (REWRITE.length - leaked.length) + '/' + REWRITE.length);
const SQL_TOKENS = ['UPDATE ', 'DELETE ', 'DROP ', 'ALTER ', 'TRUNCATE ', 'MERGE ', 'INSERT '];
const upSrc = code.toUpperCase();
const sqlHits = SQL_TOKENS.filter(function (t) { return upSrc.indexOf(t) >= 0; });
check('A2', sqlHits.length === 0, 'sqlRewriteTokensInCollectors=' + JSON.stringify(sqlHits));
function exportedFnNames(text) {
  const out = [];
  text.split('export ').forEach(function (chunk) {
    let c = chunk;
    if (c.startsWith('async function ')) { c = c.slice(15); }
    else if (c.startsWith('function ')) { c = c.slice(9); }
    else { return; }
    const i = c.indexOf('(');
    if (i > 0) { out.push(c.slice(0, i).trim()); }
  });
  return out;
}
const VERBS = ['update', 'delete', 'merge', 'patch', 'replace', 'insert', 'upsert'];
const fns = exportedFnNames(code);
const badFns = fns.filter(function (f) {
  const l = f.toLowerCase();
  return VERBS.some(function (v) { return l.indexOf(v) >= 0; });
});
check('A3', fns.length > 0 && badFns.length === 0, 'exports=' + fns.length + ' mutating=' + JSON.stringify(badFns));

let ok = true;
results.forEach(function (r) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + ' :: ' + r[2]);
  if (!r[1]) { ok = false; }
});
const passed = results.filter(function (r) { return r[1]; }).length;
console.log(ok ? ('GUARD-PASS ' + passed + '/' + results.length) : ('GUARD-FAIL ' + passed + '/' + results.length));
process.exitCode = ok ? 0 : 1;
