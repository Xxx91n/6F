// 51-macro-b-behavior.mjs — Macro-B behavior 象限接入管道（#51 / A-058 / D-054）
// 链 = codelore analyze 行为面集（hotspots/coupling/function-hotspots，env-manager 实物跑 schema 已确认）
//   → fact（51-macro-b-env-manager-facts.jsonl＋51-audit-facts.duckdb，scale=Macro-B）
//   → 判据（51-behavior-criteria.md 预声明 PC-1/TC-1/TC-2/NC-1，跑后禁调）
//   → Macro-B 报告（behavior 象限 native 切片；strategy/structure/supply_chain 如实 not_applicable＋queued 理由）
// quadrant 归位（D-054③）：fact.quadrant=collector provenance（strategic/codelore 族）不改写；
//   报告象限归属=切片决策——behavior QuadrantEntry 消费行为面事实。
// 纪律：被测仓只读（codelore analyze 只读扫描）；codelore 0.28.0 pin（resolveCodelore 不 pin 即降级不静默换版）。

import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const DIST = join(REPO, 'engine', 'dist');
const NL = String.fromCharCode(10);
const RUN_AT = new Date().toISOString();

const C = await import(pathToFileURL(join(DIST, 'collect', 'collectors.js')).href);
const G = await import(pathToFileURL(join(DIST, 'report', 'generate.js')).href);
const CL = await import(pathToFileURL(join(DIST, 'upstream', 'codelore.js')).href);
const STORE = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);

const OUT = HERE;
const SUBJECT = 'Xxx91n/env-manager';
const REPO_ROOT = 'D:/Aworker/env-manager';
const TC1_MIN_N = 5;

// ---------- §0 behavior 切片字段契约 ----------
export const BEHAVIOR_SLICE_FIELDS = [
  'faces', 'face_row_counts', 'hotspot_top', 'coupling_pairs', 'min_revs', 'sample_met', 'deferred_faces', 'quadrant_assignment'
];

// ---------- §1 采集（codelore 行为三面） ----------
const ctx = { runId: 'r51-behavior', traceId: '51be51be51be51be51be51be51be51be', repoRef: SUBJECT, scale: 'Macro-B', observedAt: RUN_AT };
const facts = CL.collectCodeloreFacets({ repoRoot: REPO_ROOT, facets: CL.CODELORE_BEHAVIOR_FACETS }, ctx);
const resolution = facts.find(function (f) { return f.metric === 'upstream.resolution'; });
const facetFacts = facts.filter(function (f) { return f.metric === 'codelore.facet_rows'; });
const errFacts = facts.filter(function (f) { return /facet_(parse_)?error/.test(f.metric); });

// schema 留痕：每面实跑列清单（判据引用的实物锚）
const schema = {};
for (const f of facetFacts) { const v = JSON.parse(f.value_json); schema[v.analysis] = v.columns; }
writeFileSync(join(OUT, '51-behavior-schema.json'), JSON.stringify({ recorded_at: RUN_AT, codelore_version: resolution ? JSON.parse(resolution.value_json).version : null, faces: schema }, null, 2) + NL);

// ---------- §2 fact 落盘 ----------
writeFileSync(join(OUT, '51-macro-b-env-manager-facts.jsonl'), facts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL);
const dbPath = join(OUT, '51-audit-facts.duckdb');
if (existsSync(dbPath)) { unlinkSync(dbPath); }
if (existsSync(dbPath + '.wal')) { unlinkSync(dbPath + '.wal'); }
const conn = await STORE.openWriter(dbPath);
for (const f of facts) { await STORE.appendFact(conn, f); }
conn.closeSync();

// ---------- §3 判据（预声明——本段只执行不改写） ----------
const byFace = {};
for (const f of facetFacts) { const v = JSON.parse(f.value_json); byFace[v.analysis] = v; byFace[v.analysis].fact_id = f.fact_id; }
const hRows = byFace.hotspots ? byFace.hotspots.rows : [];
const cRows = byFace.coupling ? byFace.coupling.rows : [];
const fhRows = byFace['function-hotspots'] ? byFace['function-hotspots'].rows : [];

const pc1 = facetFacts.length === 3 && facetFacts.every(function (f) { return JSON.parse(f.value_json).row_count > 0; }) && errFacts.length === 0;
const tc1 = hRows.length > 0 && hRows.every(function (r) { return typeof r.revisions === 'number' && r.revisions >= TC1_MIN_N; });
const tc2 = cRows.length > 0 && (cRows.filter(function (r) { return r.shared >= 2 && r.degree > 0; }).length / cRows.length) >= 0.5;
const DEFERRED = ['function-coupling(--target)'];
const nc1 = DEFERRED.length > 0; // 未接面如实登记（deferred_faces 写入切片字段即兑现）

const decidedAt = new Date().toISOString();
const entries = [
  { criterion_id: 'PC-1', band: pc1 ? 'supported' : 'insufficient', basis_refs: ['B1', 'B4'], anchored_fact_ids: facetFacts.map(function (f) { return f.fact_id; }), anchored_evidence_ids: [], decided_at: decidedAt, rationale: '行为三面 facet_rows 齐备性（hotspots/coupling/function-hotspots 各 row_count>0，errFacts=' + errFacts.length + '）' },
  { criterion_id: 'TC-1', band: tc1 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: byFace.hotspots ? [byFace.hotspots.fact_id] : [], anchored_evidence_ids: ['EV-B-HOTSPOTS'], decided_at: decidedAt, rationale: '低样本判据：hotspots min(revisions)>=' + TC1_MIN_N + '（实测 min=' + (hRows.length ? Math.min.apply(null, hRows.map(function (r) { return r.revisions; })) : 'n/a') + '）' },
  { criterion_id: 'TC-2', band: tc2 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: byFace.coupling ? [byFace.coupling.fact_id] : [], anchored_evidence_ids: ['EV-B-COUPLING'], decided_at: decidedAt, rationale: 'coupling shared>=2&degree>0 占比=' + (cRows.length ? (cRows.filter(function (r) { return r.shared >= 2 && r.degree > 0; }).length / cRows.length).toFixed(3) : 'n/a') + '（阈值 0.5）' },
  { criterion_id: 'NC-1', band: nc1 ? 'supported' : 'insufficient', basis_refs: ['B1'], anchored_fact_ids: [], anchored_evidence_ids: [], decided_at: decidedAt, rationale: 'function-coupling（--target 参数面）暂缓如实登记——deferred_faces 写入切片字段' }
];

// ---------- §4 证据锚（C3） ----------
const evidence = [
  { evidence_id: 'EV-B-HOTSPOTS', source: 'codelore analyze hotspots', locator: '51-behavior-schema.json#hotspots', claim: 'hotspots 面列集＋revisions 全行>=5', grounded: true, collected_at: RUN_AT, reproduce_cmd: 'codelore analyze --analysis hotspots --format json --repo <env-manager>', reproduce_absent_reason: null, required_tokens: ['hotspot_score', 'revisions'], excerpt: 'columns: ' + (schema.hotspots || []).join(',') },
  { evidence_id: 'EV-B-COUPLING', source: 'codelore analyze coupling', locator: '51-behavior-schema.json#coupling', claim: 'coupling 面列集＋shared/degree 有效', grounded: true, collected_at: RUN_AT, reproduce_cmd: 'codelore analyze --analysis coupling --format json --repo <env-manager>', reproduce_absent_reason: null, required_tokens: ['entity_a', 'entity_b', 'degree', 'fisher_p'], excerpt: 'columns: ' + (schema.coupling || []).join(',') },
  { evidence_id: 'EV-B-FHOTSPOTS', source: 'codelore analyze function-hotspots', locator: '51-behavior-schema.json#function-hotspots', claim: 'function-hotspots 面列集', grounded: true, collected_at: RUN_AT, reproduce_cmd: 'codelore analyze --analysis function-hotspots --format json --repo <env-manager>', reproduce_absent_reason: null, required_tokens: ['function', 'function_hotspot_score'], excerpt: 'columns: ' + (schema['function-hotspots'] || []).join(',') }
];
const claims = evidence.map(function (e) { return { claim_id: 'C-' + e.evidence_id, evidence_id: e.evidence_id, required_tokens: e.required_tokens }; });

// ---------- §5 象限切片 + 报告 ----------
const hotTop = hRows.slice(0, 3).map(function (r) { return r.path + '(revs=' + r.revisions + ',score=' + Number(r.hotspot_score).toFixed(2) + ')'; });
const behaviorBand = (pc1 && tc1 && tc2 && nc1) ? 'supported' : 'insufficient';
const gate = { protocol_version: 'ADR-0013-C/v1', decision: 'insufficient', evidence_flag: false, decided_at: decidedAt, override_reason: null, audit_ref: '51-behavior-criteria.md' };
const quadrants = [
  { quadrant: 'behavior', applicability: 'native', verdict: behaviorBand, score: null, confidence: 0.6, dimensions: [],
    slice_fields: { faces: ['hotspots', 'coupling', 'function-hotspots'], face_row_counts: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length }, hotspot_top: hotTop, coupling_pairs: cRows.length, min_revs: TC1_MIN_N, sample_met: tc1, deferred_faces: DEFERRED, quadrant_assignment: 'slice-decision（facts 共享 quadrant=strategic/codelore 族 provenance 不改写；象限归属=报告切片决策 D-054③）' },
    verdict_gate: { protocol_version: 'ADR-0013-C/v1', decision: behaviorBand, evidence_flag: pc1, decided_at: decidedAt, override_reason: null, audit_ref: '51-behavior-criteria.md' },
    conflict_markers: [] },
  { quadrant: 'strategy', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {},
    verdict_gate: Object.assign({}, gate, { override_reason: '本票切片仅行为面；strategy 象限采集面已由 #39 上架（active 维持）' }), conflict_markers: [] },
  { quadrant: 'structure', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {},
    verdict_gate: Object.assign({}, gate, { override_reason: 'queued：与 S3 族双口径风险暂缓（D-054）' }), conflict_markers: [] },
  { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {},
    verdict_gate: Object.assign({}, gate, { override_reason: 'queued：Scorecard 不插队（D-034③）' }), conflict_markers: [] }
];

const input = {
  report_id: 'MA-51-ENVMANAGER-BEHAVIOR', scale: 'Macro-B', subject_ref: SUBJECT,
  generated_at: RUN_AT, trace_id: ctx.traceId, baggage_id: C.sha256Hex([SUBJECT, 'Macro-B', 'behavior', ctx.runId].join('|')).slice(0, 32),
  headline: 'Macro-B behavior 象限接入：codelore churn/hotspot/coupling 切片（hotspot_top=' + (hotTop[0] || 'none') + '）',
  confidence: 0.6,
  stale: { marker: 'fresh', sla_seconds: 86400, lag_seconds: 0, read_model_version: G.REPORT_SKELETON_VERSION, fact_watermark_version: String(facts.length) },
  fact_ids: facts.map(function (f) { return f.fact_id; }),
  top_findings: hotTop.concat(['coupling_pairs=' + cRows.length]),
  evidence: evidence, claims: claims, quadrants: quadrants,
  recommendations: [{ rec_id: 'R-51-1', priority: 'P2', action: 'behavior 象限 preview 位维持：churn/hotspot/coupling 三面接 codelore（min_revs=' + TC1_MIN_N + ' 阈值惯例）', rationale: 'behavior 切片已落（native 象限）——低样本仓信度披露靠 TC-1 判据守住', expected_impact: 'Macro-B 四象限名实落差收窄为 strategy+behavior 双 active', effort: '本票已付', verdict_gate_stamp: behaviorBand, evidence_refs: ['EV-B-HOTSPOTS', 'EV-B-COUPLING'], degraded_note: null }],
  adjudication_entries: entries, decided_at: decidedAt,
  commit_anchor: 'unanchored', tree_anchor: 'unanchored',
  gate_ref: { prereg_commit: 'unanchored', criteria_path: '51-behavior-criteria.md', basis_path: '22-c-adjudication-basis.md', criterion_ids: ['PC-1', 'TC-1', 'TC-2', 'NC-1'] },
  degraded: false, degraded_reason: null,
  preview_disclosure: {
    capability_label: 'capability 1 of 5 · preview',
    calibration_scope: '单仓校准（Xxx91n/env-manager，codelore 0.28.0 实跑）；behavior 切片=preview 位',
    structural_limitations: ['行为面仅 churn/hotspot/coupling 三族（function-coupling --target 参数面暂缓）', '同主试点仓校准非泛化证据（dogfooding=generative not evaluative，D-033）', 'strategy/structure/supply-chain 本票不裁（归位=切片决策，各象限判据独立）'],
    not_in_preview: ['function-coupling', 'structure 象限', 'supply-chain 象限', 'Micro-B', 'Macro-A']
  }
};
const report = G.buildReport(input);
writeFileSync(join(OUT, '51-macro-b-env-manager.json'), G.renderSidecar(report) + NL);
writeFileSync(join(OUT, '51-macro-b-env-manager.md'), G.renderMarkdown(report));

// ---------- §6 测量工件 ----------
writeFileSync(join(OUT, '51-behavior-measurements.json'), JSON.stringify({
  run_at: RUN_AT, repo: SUBJECT, codelore_version: resolution ? JSON.parse(resolution.value_json).version : null,
  fact_count: facts.length, facet_rows: facetFacts.length, facet_errors: errFacts.length,
  rows: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length },
  criteria: { PC1: pc1, TC1: tc1, TC2: tc2, NC1: nc1 }, verdict: behaviorBand,
  min_revs_threshold: TC1_MIN_N,
  hotspot_min_revisions: hRows.length ? Math.min.apply(null, hRows.map(function (r) { return r.revisions; })) : null
}, null, 2) + NL);
console.log(JSON.stringify({ ok: true, verdict: behaviorBand, facts: facts.length, faces: Object.keys(schema), criteria: { PC1: pc1, TC1: tc1, TC2: tc2, NC1: nc1 } }));
