// report-preview.test.mjs — preview 披露块契约测试（#38/A-043/ADR-0017/D-037②）
// 断言面 = preview_disclosure 报告头块渲染 + 侧车机器可读字段 + degradeReport 降级保留
//        + 非 preview 报告零污染（骨架/侧车形态不变）+ 骨架 C1-C4 顺序不漂。
// 纯逻辑测试：只 import dist/report/generate.js，不起子进程不读仓外文件。
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const G = await import(pathToFileURL(join(root, 'dist', 'report', 'generate.js')).href);

let n = 0;
const t = (name, fn) => { fn(); n++; };

const DISCLOSURE = {
  capability_label: 'capability 2 of 5 · preview',
  calibration_scope: '单仓校准（anysearch-cli）',
  structural_limitations: [
    '校准语料 = 单仓（anysearch-cli，65 ADR＋supersede 链），不构成泛化证据',
    '同主仓确认偏差面：dogfooding = generative not evaluative（D-033）',
    'LLM 叙事面 env 门控关：S4 假设失效检测降级 ⚠ unverified'
  ],
  not_in_preview: ['Micro-A', 'Micro-B', 'Macro-A']
};

const baseInput = (extra) => ({
  report_id: 'MA-TEST-PREVIEW',
  scale: 'Macro-C',
  subject_ref: 'fixture@abc123',
  generated_at: '2026-09-16T00:00:00Z',
  trace_id: 't'.padEnd(32, '0'),
  baggage_id: 'b'.padEnd(32, '1'),
  headline: 'test headline',
  confidence: 0.5,
  stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: '1.2.0', fact_watermark_version: '1' },
  fact_ids: [],
  top_findings: [],
  evidence: [],
  claims: [],
  quadrants: [],
  recommendations: [],
  adjudication_entries: [],
  decided_at: '2026-09-16T00:00:00Z',
  commit_anchor: 'a'.repeat(40),
  tree_anchor: 'b'.repeat(40),
  gate_ref: { prereg_commit: 'x', criteria_path: 'p', basis_path: 'b', criterion_ids: [] },
  degraded: false,
  degraded_reason: null,
  ...extra
});

// ---------- A. 披露块渲染（preview 报告头契约） ----------
t('A1 preview 报告头含披露块全字段（capability/校准域/结构限制/未上架层）', () => {
  const r = G.buildReport(baseInput({ preview_disclosure: DISCLOSURE }));
  const md = G.renderMarkdown(r);
  assert.ok(md.includes('披露块'), 'missing 披露块 marker');
  assert.ok(md.includes('capability 2 of 5 · preview'));
  assert.ok(md.includes('单仓校准（anysearch-cli）'));
  assert.ok(md.includes('不构成泛化证据'));
  assert.ok(md.includes('Micro-A / Micro-B / Macro-A'));
});

t('A2 侧车机器可读字段 preview_disclosure 齐备', () => {
  const r = G.buildReport(baseInput({ preview_disclosure: DISCLOSURE }));
  const sc = JSON.parse(G.renderSidecar(r));
  assert.deepEqual(sc.preview_disclosure, DISCLOSURE);
});

t('A3 披露块在骨架 C1 之前且不扰章序（C1-C4 不变）', () => {
  const r = G.buildReport(baseInput({ preview_disclosure: DISCLOSURE }));
  const md = G.renderMarkdown(r);
  const discIdx = md.indexOf('披露块');
  const c1Idx = md.indexOf('## C1');
  assert.ok(discIdx > 0 && discIdx < c1Idx, 'disclosure must be in header area before C1');
  const skel = G.skeletonOf(md).map((s) => s.slice(0, 2));
  assert.deepEqual(skel, ['C1', 'C2', 'C3', 'C4']);
});

// ---------- B. 非 preview 报告零污染 ----------
t('B1 无 preview_disclosure → 报告无披露块、侧车字段为 null', () => {
  const r = G.buildReport(baseInput({}));
  const md = G.renderMarkdown(r);
  assert.ok(!md.includes('披露块'), 'non-preview report must not emit 披露块');
  const sc = JSON.parse(G.renderSidecar(r));
  assert.equal(sc.preview_disclosure, null);
});

// ---------- C. 降级保留（failure 演示件不丢 preview 诚实标注） ----------
t('C1 degradeReport 保留 preview_disclosure（降级不丢披露义务）', () => {
  const r = G.buildReport(baseInput({ preview_disclosure: DISCLOSURE }));
  const d = G.degradeReport(r, 'test-degraded');
  const md = G.renderMarkdown(d);
  assert.ok(md.includes('披露块') && md.includes('单仓校准（anysearch-cli）'));
  assert.ok(md.includes(G.UNVERIFIED_MARK), 'degraded must carry ⚠ unverified');
  const sc = JSON.parse(G.renderSidecar(d));
  assert.deepEqual(sc.preview_disclosure, DISCLOSURE);
  assert.equal(sc.degraded_mode, true);
});

console.log('REPORT-PREVIEW-TEST-OK ' + n + '/' + n);
