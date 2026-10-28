// report-preview.test.mjs — preview 披露块契约测试（#38/A-043；Preview 分级发布：标注诚实是决策本体/D-037②）
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
  // 合规锚形态（R9-1）：测试夹具直接写显式哨兵形，不经被测构造子——P 组挂了不会连带全文件失真。
  gate_ref: { prereg_commit: 'sentinel:test-anchor', criteria_path: 'p', basis_path: 'b', criterion_ids: [] },
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

// ---------- P. prereg 锚取值口径（tracker #100／R9-1：可解析 commit 或显式标记，禁模糊态） ----------
// 正负对照都落在这里：口径只有落到产线 choke point（buildReceipt）才不是文书承诺。
t('P1 三形态各自命中——commit 形／显式哨兵／显式降级（前缀即判别面，不读源码也能分辨）', () => {
  assert.equal(G.classifyPreregAnchor('e356581e'), 'commit');
  assert.equal(G.classifyPreregAnchor('a'.repeat(40)), 'commit');
  assert.equal(G.preregSentinel('38-script-const'), 'sentinel:38-script-const');
  assert.equal(G.classifyPreregAnchor(G.preregSentinel('38-script-const')), 'sentinel');
  assert.equal(G.preregDegraded('shallow-clone'), 'degraded:shallow-clone');
  assert.equal(G.classifyPreregAnchor(G.preregDegraded('shallow-clone')), 'degraded');
});

t('P2 模糊态判否——历史裸字面量与无前缀值一律不再构成合法锚', () => {
  const AMBIGUOUS = [
    '38-script-const', '45-demo-criteria', 'unknown', 'unanchored', 'x', '',
    'sentinel:', 'degraded:', 'sentinel:bad reason', 'Sentinel:x', 'SENTINEL:x',
    'deadBeef', 'zzzzzzz', 'e356581e ', 'e356581g', 'a'.repeat(41)
  ];
  for (const v of AMBIGUOUS) { assert.equal(G.classifyPreregAnchor(v), 'ambiguous', 'must reject ' + JSON.stringify(v)); }
});

t('P2b commit 形下限取 git 能 emit 的最小宽度——4 位放行、3 位判否（core.abbrev<4 被 git 忽略）', () => {
  assert.equal(G.classifyPreregAnchor('7670'), 'commit');
  assert.equal(G.classifyPreregAnchor('767'), 'ambiguous');
});

t('P3 buildReport 在产线 choke point 拒收模糊态锚（不是只写在文书里的口径）', () => {
  assert.throws(
    () => G.buildReport(baseInput({ gate_ref: { prereg_commit: '38-script-const', criteria_path: 'p', basis_path: 'b', criterion_ids: [] } })),
    /PREREG-ANCHOR-AMBIGUOUS/
  );
});

t('P4 degradeReport 同一路径——降级变体不得绕过口径', () => {
  const forged = G.buildReport(baseInput());
  forged.receipt.gate_ref.prereg_commit = 'unanchored';
  assert.throws(() => G.degradeReport(forged, '降级原因'), /PREREG-ANCHOR-AMBIGUOUS/);
});

t('P5 三形态各自放行（正对照：收紧判据没有把合法锚一起拒掉）', () => {
  for (const v of ['e356581e', 'a'.repeat(40), G.preregSentinel('38-script-const'), G.preregDegraded('shallow-clone')]) {
    const r = G.buildReport(baseInput({ gate_ref: { prereg_commit: v, criteria_path: 'p', basis_path: 'b', criterion_ids: [] } }));
    assert.equal(r.receipt.gate_ref.prereg_commit, v);
  }
});

console.log('REPORT-PREVIEW-TEST-OK ' + n + '/' + n);
