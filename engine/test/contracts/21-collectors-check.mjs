// 这个检查：确定性采集器（A-022 / spec.md §R3-D3）
// 用法：node engine/test/contracts/21-collectors-check.mjs
// 约定：不引任何三方依赖（不 import @duckdb/node-api）；直接 import 纯逻辑的 schema.ts / collectors.ts（Node 22.18+ 能剥类型）。

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { stripComments } from './_lib/check-kit.mjs';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '守卫：确定性采集器（A-022 / spec.md §R3-D3）';


const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const FIXTURE = join(REPO,'engine','test','fixtures','contracts','21-collectors-fixture.json');
const MAP_JSON = join(REPO,'engine','test','fixtures','contracts','21-collectors.json');
const SCHEMA_TS = join(REPO, 'engine', 'src', 'fact', 'schema.ts');
const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
const map = JSON.parse(readFileSync(MAP_JSON, 'utf8'));
const S = await import(pathToFileURL(SCHEMA_TS).href);
const C = await import(pathToFileURL(COLLECT_TS).href);
const src = readFileSync(COLLECT_TS, 'utf8');
// stripComments：剥注释这件事统一走 _lib/check-kit.mjs（D-183 那次扫描找到的毛病——原来是手搓的，被 indexOf(//) 一截就断，字符串也没保住）
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

// 不联网 / 不碰 LLM / 没有副作用
const NET_TOKENS = ['fetch(', 'node:http', 'node:https', 'node:net', 'node:tls', 'node:dns', 'XMLHttpRequest', 'axios', 'undici', 'WebSocket'];
const netHits = NET_TOKENS.filter(function (t) { return code.indexOf(t) >= 0; });
check('N1 源码里没有任何联网的写法', netHits.length === 0, 'netTokens=' + JSON.stringify(netHits));
const LLM_TOKENS = ['openai', 'anthropic', 'claude', 'gpt', 'gemini', 'embedding', 'llm', 'bedrock', 'ollama'];
const llmHits = LLM_TOKENS.filter(function (t) { return codeLower.indexOf(t) >= 0; });
check('N2 源码里没提任何大模型服务', llmHits.length === 0, 'llmTokens=' + JSON.stringify(llmHits));
const NONDET = ['Date.now(', 'Math.random(', 'new Date('];
const ndHits = NONDET.filter(function (t) { return code.indexOf(t) >= 0; });
check('N3 源码里没有取当前时间或随机数的写法', ndHits.length === 0, 'nondeterministicCalls=' + JSON.stringify(ndHits));
const PROC = ['child_process', 'spawn', 'execSync', 'execFile'];
const procHits = PROC.filter(function (t) { return code.indexOf(t) >= 0; });
check('N4 源码里没有起子进程的写法', procHits.length === 0, 'processTokens=' + JSON.stringify(procHits));
const FS_TOKENS = ['node:fs', 'readFileSync', 'readFile(', 'writeFileSync', 'opendirSync'];
const fsHits = FS_TOKENS.filter(function (t) { return code.indexOf(t) >= 0; });
check('N5 源码里没有读写本地文件的写法', fsHits.length === 0, 'fsTokens=' + JSON.stringify(fsHits));
const THRESH = C.DETECTOR_BINDING.filter(function (e) { return e.threshold !== null; });
check('N6 阈值全空着，源码里也没出现 THRESHOLD', THRESH.length === 0 && src.indexOf('THRESHOLD') < 0, 'nonNullThresholds=' + THRESH.length);

// 输出形状要符合 schema v0
const STORE_COLS = ['fact_seq', 'ingested_at', 'schema_version'];
const COLLECTOR_COLS = S.AUDIT_FACT_FIELDS.map(function (f) { return f.name; }).filter(function (n) { return STORE_COLS.indexOf(n) < 0; });
const WANT_KEYS = COLLECTOR_COLS.slice().sort().join(',');
const badKeys = all.filter(function (f) { return Object.keys(f).sort().join(',') !== WANT_KEYS; });
check('S1 每条事实的字段集合都对得上', all.length > 0 && badKeys.length === 0, 'facts=' + all.length + ' badKeySets=' + badKeys.length);
check('S2 采集器产出 13 个字段', COLLECTOR_COLS.length === 13, 'collectorProducedCols=' + COLLECTOR_COLS.length);
const SCALES = ['Macro-A', 'Macro-B', 'Macro-C', 'Micro-A', 'Micro-B'];
const badScale = all.filter(function (f) { return SCALES.indexOf(f.scale) < 0; });
check('S3 scale 只在这五档里', badScale.length === 0, 'scale=' + (all.length ? all[0].scale : 'none'));
const QUADRANTS = ['structure', 'behavior', 'supply-chain', 'strategic'];
const badQuad = all.filter(function (f) { return QUADRANTS.indexOf(f.quadrant) < 0; });
check('S4 quadrant 只在这四个面里', badQuad.length === 0, 'quadrant=' + (all.length ? all[0].quadrant : 'none'));
const DIMS = ['S1', 'S2', 'S3', 'S4', 'S5'];
const badDim = all.filter(function (f) { return f.dimension !== null && DIMS.indexOf(f.dimension) < 0; });
check('S5 dimension 要么是空，要么在 S1–S5 里', badDim.length === 0, 'badDimension=' + badDim.length);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const badId = all.filter(function (f) { return !UUID_RE.test(f.fact_id) || f.fact_id.length !== 36; });
check('S6 fact_id 是 36 位的 UUID', badId.length === 0, 'factIdSample=' + (all.length ? all[0].fact_id : 'none'));
const HEX32 = /^[0-9a-f]{32}$/;
const badHex = all.filter(function (f) { return !HEX32.test(f.trace_id) || !HEX32.test(f.baggage_id); });
check('S7 trace_id 和 baggage_id 都是 32 位十六进制', badHex.length === 0, 'correlationBad=' + badHex.length);
const badJson = all.filter(function (f) { try { JSON.parse(f.value_json); return false; } catch (e) { return true; } });
check('S8 value_json 每一条都能解析', badJson.length === 0, 'valueJsonInvalid=' + badJson.length);
const badClock = all.filter(function (f) { return f.observed_at !== ctx.observedAt; });
check('S9 observed_at 都用了注进去的那个时间', badClock.length === 0, 'injectedClockMismatch=' + badClock.length);
const IDS = [C.ADR_STRUCTURE_ID, C.POSITIONING_ID, C.GITLOG_ID];
const badCid = all.filter(function (f) { return IDS.indexOf(f.collector_id) < 0; });
check('S10 collector_id 只在这三个里', badCid.length === 0, 'collectorIds=' + IDS.join(','));
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
check('S11 字段长度和是否允许空都对得上', lenBad.length === 0, 'lengthOrNullViolations=' + lenBad.length);
const badTrace = all.filter(function (f) { return f.trace_id !== fx.context.traceId; });
check('S12 trace_id 一路传下去没掉', badTrace.length === 0, 'tracePropagation=' + (all.length ? all[0].trace_id : 'none'));
// 抽取对不对，还有跑两遍是不是一模一样
const fiveC = first(adrFacts, 'adr.five_piece_completeness', EX.completePath);
const fiveCV = fiveC ? JSON.parse(fiveC.value_json) : null;
check('C1 完整样本五个要件都齐', !!fiveCV && fiveCV.present === EX.completeFivePiecePresent && fiveCV.ratio === EX.completeFivePieceRatio && fiveCV.missing.length === 0, 'completeFive=' + (fiveC ? fiveC.value_json : 'none'));
const fiveP = first(adrFacts, 'adr.five_piece_completeness', EX.partialPath);
const fivePV = fiveP ? JSON.parse(fiveP.value_json) : null;
check('C2 残缺样本缺的就是那几样', !!fivePV && JSON.stringify(fivePV.missing) === JSON.stringify(EX.partialMissing), 'partialMissing=' + (fiveP ? fiveP.value_json : 'none'));
const supC = first(adrFacts, 'adr.supersede_link_present', EX.completePath);
const supCV = supC ? JSON.parse(supC.value_json) : null;
check('C3 完整样本里认出了取代链接', !!supCV && supCV.present === EX.completeSupersedePresent && supCV.matches >= 1, 'supersede=' + (supC ? supC.value_json : 'none'));
const supP = first(adrFacts, 'adr.supersede_link_present', EX.partialPath);
const supPV = supP ? JSON.parse(supP.value_json) : null;
check('C4 残缺样本里取代链接的判定和预期一致', !!supPV && supPV.present === EX.partialSupersedePresent, 'partialSupersede=' + (supP ? supP.value_json : 'none'));
const dateC = first(adrFacts, 'adr.decision_date', EX.completePath);
check('C5 完整样本的决策日期取对了', !!dateC && JSON.parse(dateC.value_json).date === EX.completeDecisionDate, 'decisionDate=' + (dateC ? dateC.value_json : 'none'));
const dateP = first(adrFacts, 'adr.decision_date', EX.partialPath);
check('C6 残缺样本的决策日期取对了', !!dateP && JSON.parse(dateP.value_json).date === EX.partialDecisionDate, 'partialDate=' + (dateP ? dateP.value_json : 'none'));
const cov = first(posFacts, 'positioning.keyword_coverage');
const covV = cov ? JSON.parse(cov.value_json) : null;
check('C7 命中、漏掉、总数三个数对得上，占比在 0–1 之间', !!covV && covV.keywords === EX.positioningKeywords && covV.hit + covV.missed.length === covV.keywords && covV.ratio >= 0 && covV.ratio <= 1, 'coverage=' + (cov ? cov.value_json : 'none'));
const drift = first(posFacts, 'positioning.drift_anchor');
const driftV = drift ? JSON.parse(drift.value_json) : null;
check('C8 第一个漏掉的关键词要么没有，要么在漏掉清单里', !!driftV && (driftV.first_missed_keyword === null || covV.missed.indexOf(driftV.first_missed_keyword) >= 0), 'drift=' + (drift ? drift.value_json : 'none'));
const fc = first(gitFacts, 'git.first_commit', EX.completePath);
const fcV = fc ? JSON.parse(fc.value_json) : null;
check('C9 完整样本的首个提交 sha 和日期都对', !!fcV && fcV.sha === EX.completeFirstCommitSha && fcV.date === EX.completeFirstCommitDate, 'firstCommit=' + (fc ? fc.value_json : 'none'));
const cc = first(gitFacts, 'git.commit_count', EX.completePath);
check('C10 完整样本的提交数对', !!cc && JSON.parse(cc.value_json).count === EX.completeCommitCount, 'commitCount=' + (cc ? cc.value_json : 'none'));
const fc2 = first(gitFacts, 'git.first_commit', EX.partialPath);
const fc2V = fc2 ? JSON.parse(fc2.value_json) : null;
check('C11 残缺样本的首个提交 sha 对', !!fc2V && fc2V.sha === EX.partialFirstCommitSha, 'partialFirstCommit=' + (fc2 ? fc2.value_json : 'none'));
const lag = first(gitFacts, 'git.adr_lag_days', EX.completePath);
const lagV = lag ? JSON.parse(lag.value_json) : null;
check('C12 差几天、ADR 日期、首个提交日期三个数都对', !!lagV && lagV.delta_days === EX.lagDeltaDays && lagV.adr_date === EX.lagAdrDate && lagV.first_commit_date === EX.lagFirstCommitDate, 'adrLagDays=' + (lag ? lag.value_json : 'none'));
const am = first(gitFacts, 'git.author_matrix', EX.completePath);
const amV = am ? JSON.parse(am.value_json) : null;
check('C13 两位作者，头部占比在 0–1 之间', !!amV && amV.authors.length === 2 && amV.top_share > 0 && amV.top_share <= 1, 'authorMatrix=' + (am ? am.value_json : 'none'));
const rerun = C.collectAdrStructure(fx.adr, ctx).concat(C.collectPositioning(fx.positioning, ctx)).concat(C.collectGitlog({ commits: fx.gitlog.commits, paths: fx.gitlog.paths, adrDates: dates }, ctx));
check('C14 再跑一遍，结果逐字节一样', JSON.stringify(rerun) === JSON.stringify(all), 'deterministicRerunIdentical=' + (JSON.stringify(rerun) === JSON.stringify(all)));
const ctx2 = { runId: 'run-21-other', traceId: ctx.traceId, repoRef: ctx.repoRef, scale: ctx.scale, observedAt: ctx.observedAt };
const otherBag = C.deriveBaggageId(ctx2, 'S2');
const sameBag = C.deriveBaggageId(ctx, 'S2');
const sameBag2 = C.deriveBaggageId(ctx, 'S2');
check('C15 同一次 run 里稳定，换了 runId 就变', sameBag !== otherBag && sameBag === sameBag2, 'baggageStablePerRunAndVariesByRunId');
check('C16 三族采集器都出了东西', adrFacts.length > 0 && posFacts.length > 0 && gitFacts.length > 0, 'familiesNonEmpty=' + adrFacts.length + '/' + posFacts.length + '/' + gitFacts.length);

// detector 同族声明（D-018；供票 22 引用）
const B = C.DETECTOR_BINDING;
const pc = B.filter(function (e) { return e.type === 'positive_control'; });
const tc = B.filter(function (e) { return e.type === 'true_criterion'; });
const nc = B.filter(function (e) { return e.type === 'negative_control'; });
check('D1 六条判据：两枚正对照、三枚真判据、一枚负对照', B.length === 6 && pc.length === 2 && tc.length === 3 && nc.length === 1, 'positive=' + pc.length + ' true=' + tc.length + ' negative=' + nc.length);
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
check('D2 每条真判据都配了一个同族的正对照', tcBad.length === 0, 'trueCriteriaWithoutSameFamilyControl=' + JSON.stringify(tcBad.map(function (e) { return e.criterion; })));
const famBad = [];
B.forEach(function (e) {
  e.families.forEach(function (f) { if (C.COLLECTOR_FAMILIES.indexOf(f) < 0) { famBad.push(e.criterion + ':' + f); } });
});
check('D3 用到的族名都是登记过的', famBad.length === 0, 'unknownFamilies=' + JSON.stringify(famBad));
const covered = [];
pc.forEach(function (e) {
  e.families.forEach(function (f) { if (covered.indexOf(f) < 0) { covered.push(f); } });
});
check('D4 每个族都至少被一枚正对照覆盖到', C.COLLECTOR_FAMILIES.every(function (f) { return covered.indexOf(f) >= 0; }), 'familiesCoveredByPositiveControls=' + covered.join(','));
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
check('D5 映射表跟代码没走样', driftRows.length === 0, 'mapVsCodeDrift=' + JSON.stringify(driftRows));
check('D6 阈值全留给票 22，映射表里有 for_ticket_22 这一行', B.every(function (e) { return e.threshold === null; }) && !!map.for_ticket_22, 'thresholdsDeferredToTicket22');

// 只追加（A-021 继承下来的规矩）
const REWRITE = ['UPDATE audit_fact SET metric = 1', 'DELETE FROM audit_fact WHERE fact_seq = 1', 'DROP TABLE audit_fact', 'ALTER TABLE audit_fact ADD COLUMN x INTEGER', 'TRUNCATE TABLE audit_fact', 'MERGE INTO audit_fact USING t ON true WHEN MATCHED THEN UPDATE SET metric = 1'];
const leaked = [];
REWRITE.forEach(function (s) { if (S.classifyStatement(s).allow) { leaked.push(s); } });
check('A1 六条改写语句全被拒', leaked.length === 0, 'appendOnlyRejected=' + (REWRITE.length - leaked.length) + '/' + REWRITE.length);
const SQL_TOKENS = ['UPDATE ', 'DELETE ', 'DROP ', 'ALTER ', 'TRUNCATE ', 'MERGE ', 'INSERT '];
const upSrc = code.toUpperCase();
const sqlHits = SQL_TOKENS.filter(function (t) { return upSrc.indexOf(t) >= 0; });
check('A2 采集器源码里没有改数据的 SQL 关键字', sqlHits.length === 0, 'sqlRewriteTokensInCollectors=' + JSON.stringify(sqlHits));
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
check('A3 导出的函数名里没有改数据的动词', fns.length > 0 && badFns.length === 0, 'exports=' + fns.length + ' mutating=' + JSON.stringify(badFns));

let ok = true;
results.forEach(function (r) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + ' :: ' + r[2]);
  if (!r[1]) { ok = false; }
});
const passed = results.filter(function (r) { return r[1]; }).length;
console.log(ok ? ('GUARD-PASS ' + passed + '/' + results.length) : ('GUARD-FAIL ' + passed + '/' + results.length));
process.exitCode = ok ? 0 : 1;
