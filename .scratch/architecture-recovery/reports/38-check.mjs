// #38 守卫——Macro-C preview：披露块在（缺=FAIL）/ happy+failure 双件形态 / 采集事实字段 / 报告引用一致 / 共享 DuckDB 触发器 b 证据
// 用法：node 38-check.mjs → 逐条 PASS/FAIL；exit 0 = 全 PASS，exit 1 = 有 FAIL
// acceptance-probe: sealed 2026-09-18 D-073 — E3 H4（attestation=acceptance-probe-attestation.jsonl；验收探针显式退役≠archived）
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const ENG = join(ROOT, 'engine');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
function sealed(name, attId, note) { console.log('SEALED ' + name + ' | att=' + attId + (note ? ' | ' + note : '')); }
const read = (f) => fs.readFileSync(join(here, f), 'utf8');
const noBom = (f) => { const b = fs.readFileSync(join(here, f)); return !(b.length >= 3 && b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); };

// --- A. 工件齐备 + 无 BOM ---
const ARTIFACTS = ['38-macro-c-preview-report.md', '38-macro-c-preview-report.json', '38-macro-c-preview-failure.md', '38-macro-c-preview-failure.json', '38-macro-c-facts.jsonl', '38-audit-facts.duckdb', '38-macro-c-measurements.json'];
t('A1 工件七件齐备', ARTIFACTS.every((f) => fs.existsSync(join(here, f))), ARTIFACTS.filter((f) => !fs.existsSync(join(here, f))).join(','));
t('A2 文本工件无 BOM', ARTIFACTS.filter((f) => !f.endsWith('.duckdb')).every(noBom), '');

const md = read('38-macro-c-preview-report.md');
const sc = JSON.parse(read('38-macro-c-preview-report.json'));
const fmd = read('38-macro-c-preview-failure.md');
const fsc = JSON.parse(read('38-macro-c-preview-failure.json'));
const meas = JSON.parse(read('38-macro-c-measurements.json'));
const factLines = read('38-macro-c-facts.jsonl').split('\n').filter(Boolean).map((l) => JSON.parse(l));

// --- B. 披露块（缺此块 = FAIL，D-032 披露非演示纪律） ---
t('B1 happy md 披露块在（单仓校准 + capability 2 of 5 · preview）', md.includes('披露块') && md.includes('单仓校准（anysearch-cli）') && md.includes('capability 2 of 5 · preview'), '');
t('B2 happy 侧车 preview_disclosure 机器可读字段齐备', !!sc.preview_disclosure && sc.preview_disclosure.capability_label === 'capability 2 of 5 · preview' && sc.preview_disclosure.calibration_scope === '单仓校准（anysearch-cli）' && sc.preview_disclosure.structural_limitations.length >= 3 && JSON.stringify(sc.preview_disclosure.not_in_preview) === JSON.stringify(['Micro-A', 'Micro-B', 'Macro-A']), '');
t('B3 披露块含全部结构性限制项（泛化门/同主偏差/llm_gated/数据未接/衍生观测）', sc.preview_disclosure && ['泛化', 'dogfooding', 'llm_gated', '数据未接', '衍生'].every((k) => sc.preview_disclosure.structural_limitations.join('；').includes(k)), '');
t('B4 failure 件同样带披露块（降级不丢 preview 诚实义务）', fmd.includes('披露块') && fmd.includes('单仓校准（anysearch-cli）') && !!fsc.preview_disclosure && fsc.preview_disclosure.capability_label === 'capability 2 of 5 · preview', '');

// --- C. 双件形态（happy 骨架+回执 / failure ⚠ unverified+降级注释+verdict-gate 印记） ---
t('C1 happy md 骨架 C1-C4 齐 + RECEIPT 印记', ['## C1', '## C2', '## C3', '## C4', 'RECEIPT RCP-'].every((s) => md.includes(s)), '');
t('C2 happy 侧车 degraded_mode=false 且 receipt.degraded=false', sc.degraded_mode === false && sc.receipt.degraded === false, '');
t('C3 failure md ⚠ unverified + 降级注释 + verdict-gate 印记', fmd.includes('⚠ unverified') && fmd.includes('降级产出') && fmd.includes('verdict_gate_stamp: insufficient ⚠ unverified'), '');
t('C4 failure 侧车 degraded_mode=true + verdict insufficient + 全部 recs 带降级注释 + receipt degraded', fsc.degraded_mode === true && fsc.overall_verdict === 'insufficient' && fsc.receipt.degraded === true && fsc.recommendations.length > 0 && fsc.recommendations.every((r) => typeof r.degraded_note === 'string' && r.degraded_note.includes('unverified')), '');
t('C5 failure 骨架不分离（与 happy 同 C1-C4 形态）', ['## C1', '## C2', '## C3', '## C4'].every((s) => fmd.includes(s)), '');

// --- D. 采集事实字段（fact schema v0 13 字段 + 面集计数 + 门控降级形态） ---
const FIELDS = ['fact_id', 'trace_id', 'baggage_id', 'scale', 'quadrant', 'dimension', 'collector_id', 'repo_ref', 'subject_ref', 'evidence_ref', 'metric', 'value_json', 'observed_at'];
t('D1 全部 fact 13 字段齐备 + scale=Macro-C + value_json 可解析', factLines.every((f) => FIELDS.every((k) => k in f) && f.scale === 'Macro-C' && (() => { try { JSON.parse(f.value_json); return true; } catch { return false; } })()), 'facts=' + factLines.length);
const metric = (m) => factLines.filter((f) => f.metric === m);
t('D2 codelore 契约面 30/30 facet_rows 零 error + resolution pinned', metric('codelore.facet_rows').length === 30 && metric('codelore.facet_error').length === 0 && metric('codelore.facet_parse_error').length === 0 && metric('upstream.resolution').length > 0 && JSON.parse(metric('upstream.resolution')[0].value_json).pinned === true, 'rows=' + metric('codelore.facet_rows').length);
const gateV = metric('codelore.llm_gate').length > 0 ? JSON.parse(metric('codelore.llm_gate')[0].value_json) : null;
const costV = metric('codelore.llm_cost').length > 0 ? JSON.parse(metric('codelore.llm_cost')[0].value_json) : null;
t('D3 llm_gate fact 在 + 门控关形态=llm_gated 降级披露（runner 零调用）/ 门控开=narrative 与成本计量自洽', gateV !== null && costV !== null && (gateV.configured === false ? (metric('codelore.llm_gated').length === 3 && costV.calls_attempted === 0) : (metric('codelore.llm_narrative').length === costV.calls_succeeded && metric('codelore.llm_error').length === costV.calls_failed && costV.calls_attempted === costV.calls_succeeded + costV.calls_failed)), 'configured=' + (gateV ? gateV.configured : 'missing') + ' gated=' + metric('codelore.llm_gated').length + ' narrative=' + metric('codelore.llm_narrative').length);
t('D4 ADR 语料 65 份全解析（decision_date 65 + first_commit 65 + lag 65）', metric('adr.decision_date').filter((f) => JSON.parse(f.value_json).date !== null).length === 65 && metric('git.first_commit').length === 65 && metric('git.adr_lag_days').length === 65, '');
const chainV = metric('adr.supersede_chain_summary').length > 0 ? JSON.parse(metric('adr.supersede_chain_summary')[0].value_json) : null;
t('D5 supersede 链摘要 fact：8 边 + 断链0 + 缺回链0', chainV !== null && chainV.edge_count === 8 && chainV.unresolved_refs.length === 0 && chainV.missing_backrefs.length === 0, '');
t('D6 fact_id 去重留痕（双 resolution 合一）+ dedup_dropped=1', meas.dedup_dropped === 1, '');

// --- E. 共享 DuckDB + 触发器 b 登记（衔接 #33 registry） ---
const STORE = await import(pathToFileURL(join(ENG, 'dist', 'fact', 'store.js')).href);
let dbOk = false, dbScale = {};
try {
  const reader = await STORE.openReader(join(here, '38-audit-facts.duckdb'));
  const rows = await (await STORE.queryFacts(reader, 'SELECT scale, COUNT(*) n FROM audit_fact GROUP BY scale ORDER BY scale')).getRows();
  const repos = await (await STORE.queryFacts(reader, 'SELECT COUNT(DISTINCT repo_ref) n FROM audit_fact')).getRows();
  for (const r of rows) { dbScale[String(r[0])] = Number(r[1]); }
  dbOk = Number(repos[0][0]) >= 2;
  reader.closeSync();
} catch (e) { dbOk = false; console.log('  duckdb read error: ' + e.message); }
const mbCount = read('23-facts.jsonl').split('\n').filter(Boolean).length;
t('E1 共享事实库同库双 scale（Macro-B ' + mbCount + ' + Macro-C ' + factLines.length + '）+ ≥2 repo_ref', dbScale['Macro-B'] === mbCount && dbScale['Macro-C'] === factLines.length && dbOk, JSON.stringify(dbScale));
const reg = JSON.parse(read('33-gate-registry.json'));
const mwb = reg.items.find((i) => i.id === 'mw-trigger-b');
t('E2 registry 触发器 b 登记：event occurred + confirmations trigger-fired', reg.events['macro-c-shared-duckdb'].occurred === true && !!mwb && Array.isArray(mwb.confirmations) && mwb.confirmations.some((c) => c.decision === 'trigger-fired'), '');
sealed('E3', 'ap-38-e3', 'mw-trigger-b decided——值守 ALARM 口径变迁属验收时点探针使命完成；33-check 回归由基线电池直跑承接');

// --- F. 报告引用一致（md↔侧车↔measurements↔37 存档） ---
t('F1 report_id/scale/subject 三处一致', md.includes('MA-38-ANYSEARCH-MACRO-C-PREVIEW') && sc.report_id === 'MA-38-ANYSEARCH-MACRO-C-PREVIEW' && sc.scale === 'Macro-C' && sc.subject_ref === 'anysearch-cli@' + meas.head_sha.slice(0, 12) && md.includes('anysearch-cli@' + meas.head_sha.slice(0, 12)), '');
t('F2 裁决条目 6 + 引文校验全 supports + overall=insufficient（诚实部分裁定）', sc.adjudication.entries.length === 6 && sc.citation_checks.every((c) => c.support === 'supports') && sc.overall_verdict === 'insufficient', 'checks=' + sc.citation_checks.length);
t('F3 TC-MC-3 insufficient 锚定 llm_gate fact（深检面降级印记）', sc.adjudication.entries.some((e) => e.criterion_id === 'TC-MC-3' && e.band === 'insufficient' && /llm_gated|门控/.test(e.rationale)), '');
t('F4 supply_chain 象限 not_applicable + ⚠ 数据未接（D-034③）', sc.quadrants.some((q) => q.quadrant === 'supply_chain' && q.applicability === 'not_applicable' && /数据未接/.test(q.verdict_gate.override_reason) && q.conflict_markers.includes('data-not-connected')), '');
t('F5 measurements↔37 存档对账一致（adr=65 edges=8 复测同值）', meas.crosscheck_37.adr_parity === true && meas.crosscheck_37.edge_parity === true && meas.crosscheck_37.unresolved_38 === 0 && meas.crosscheck_37.missing_backrefs_38 === 0, '');
t('F6 measurements 共享库断言 shared=true 且计数对齐', meas.shared_duckdb.shared === true && meas.shared_duckdb.db_by_scale['Macro-B'] === mbCount && meas.shared_duckdb.db_by_scale['Macro-C'] === factLines.length, '');
t('F7 happy md 含 preview 标注 + llm_gated + 触发登记叙事', md.includes('capability 2 of 5') && md.includes('llm_gated') && md.includes('mw-trigger-b'), '');

// --- G. 引擎纪律 + 测试链 ---
const pkg = JSON.parse(fs.readFileSync(join(ENG, 'package.json'), 'utf8'));
t('G1 smoke 链接入 report-preview.test.mjs', pkg.scripts.smoke.includes('report-preview.test.mjs'), '');
const pv = spawnSync('node', [join(ENG, 'test', 'report-preview.test.mjs')], { encoding: 'utf8' });
t('G2 preview 契约测试实跑全绿', pv.status === 0 && /REPORT-PREVIEW-TEST-OK (\d+)\/\1/.test(pv.stdout || ''), (pv.stdout || '').trim().split('\n').pop());
const upsrc = fs.readFileSync(join(ENG, 'src', 'upstream', 'codelore.ts'), 'utf8');
t('G3 适配层零业务规则词（ADR-0014）', !/threshold|verdict|RED|score_band/.test(upsrc), '');
const gensrc = fs.readFileSync(join(ENG, 'src', 'report', 'generate.ts'), 'utf8');
const gendist = fs.readFileSync(join(ENG, 'dist', 'report', 'generate.js'), 'utf8');
t('G4 preview_disclosure 契约面源↔编译一致', gensrc.includes('PreviewDisclosure') && gendist.includes('preview_disclosure'), '');
t('G5 store.ts fact_seq 序列 + registry 种子落 dist', fs.readFileSync(join(ENG, 'dist', 'fact', 'store.js'), 'utf8').includes('audit_fact_seq') && fs.readFileSync(join(ENG, 'dist', 'fact', 'store.js'), 'utf8').includes('schema_registry'), '');

// --- H. 落点文书 ---
t('H1 38-report.md 落盘', fs.existsSync(join(here, '38-report.md')), '');
if (fs.existsSync(join(here, '38-report.md'))) {
  const rep = read('38-report.md');
  t('H2 报告含披露纪律 + 触发器 b + 双件 + 验收链引用', rep.includes('单仓校准（anysearch-cli）') && rep.includes('mw-trigger-b') && rep.includes('38-macro-c-measurements.json') && rep.includes('capability 2 of 5') && /38-macro-c-preview-failure/.test(rep), '');
  t('H3 报告含实测值引用（1012/228/65/8/30 命中）', ['1012', '228', '65', '8', '30'].every((v) => rep.includes(v)), '');
}
sealed('H4', 'ap-38-h4', 'env 腿（sibling 活仓探针）——活契约由 engine/test/audit-zero-write.test.mjs 承接挂 smoke 链');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
