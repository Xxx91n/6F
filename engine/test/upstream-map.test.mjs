// upstream-map.test.mjs — upstream→dimension 接线契约 seam 测试（#71/#72 接线票 / D-080④）
// seam=裁决面映射常量块（audit/upstream-dimension-map.ts）：resolver 准入判定＋collector 注册面＋投影双通道
// 断言纪律：descriptor dimension:null 保留（ADR-0014）；pending(event_bound)≠已裁维（D-081③）；权重不在本面（D-084）
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const M = await import(pathToFileURL(join(root, 'dist', 'audit', 'upstream-dimension-map.js')).href);
const CL = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const GH = await import(pathToFileURL(join(root, 'dist', 'upstream', 'github-rest.js')).href);

let n = 0;
const t = (name, fn) => { fn(); n++; };

// ---------- A. codelore resolver：族组逐面归位 ----------
t('A1 演化主干 12 面全→S4', () => {
  for (const a of M.CODELORE_EVOLUTION_FACETS) {
    const r = M.resolveCodeloreAnalysis(a);
    assert.equal(r.dimension, 'S4', a);
    assert.equal(r.admitted, true, a);
  }
  assert.equal(M.CODELORE_EVOLUTION_FACETS.length, 12);
});
t('A2 s3 族 6 面→S3 且准入含 opposing', () => {
  for (const a of M.CODELORE_S3_FACETS) {
    const r = M.resolveCodeloreAnalysis(a);
    assert.equal(r.dimension, 'S3', a);
    assert.match(r.admission, /opposing/, a);
  }
  assert.equal(M.CODELORE_S3_FACETS.length, 6);
});
t('A3 s5 族 12 面→S5', () => {
  for (const a of M.CODELORE_S5_FACETS) assert.equal(M.resolveCodeloreAnalysis(a).dimension, 'S5', a);
  assert.equal(M.CODELORE_S5_FACETS.length, 12);
});
t('A4 explain 族→S4 且准入=env 门控', () => {
  for (const a of M.CODELORE_EXPLAIN_SURFACES) {
    const r = M.resolveCodeloreAnalysis(a);
    assert.equal(r.dimension, 'S4', a);
    assert.match(r.admission, /env 门控/, a);
  }
});
t('A5 behavior 族→Macro-B QuadrantEntry lane（不直归 S 维，D-054③）', () => {
  for (const a of M.CODELORE_BEHAVIOR_FACES) {
    const r = M.resolveCodeloreAnalysis(a);
    assert.equal(r.dimension, null, a);
    assert.equal(r.lane, 'Macro-B-QuadrantEntry', a);
    assert.equal(r.admitted, false, a);
  }
  assert.deepEqual([...M.CODELORE_BEHAVIOR_FACES], CL.CODELORE_BEHAVIOR_FACETS.map(f => f.analysis));
});
t('A6 deferred/未登记面→not_mapped（D-035④）', () => {
  assert.equal(M.isCodeloreDeferredAnalysis('function-coupling'), true);
  assert.equal(M.isCodeloreDeferredAnalysis('revisions'), false);
  const r = M.resolveCodeloreAnalysis('function-coupling');
  assert.equal(r.dimension, null);
  assert.equal(r.admitted, false);
  assert.match(r.reason, /not_mapped|deferred/);
});
t('A7 批1 facet 注册表 30 面全被映射覆盖（无漏面）', () => {
  for (const f of CL.CODELORE_BATCH1_FACETS) {
    const r = M.resolveCodeloreAnalysis(f.analysis);
    assert.notEqual(r.dimension, null, f.analysis + ' unmapped');
    assert.match(r.dimension, /^S[345]$/, f.analysis);
  }
  assert.equal(CL.CODELORE_BATCH1_FACETS.length, 30);
});

// ---------- B. github-rest resolver：准入与排除 ----------
t('B1 pr_summary→S4 无准入', () => {
  const r = M.resolveGithubRestSlice('pr_summary');
  assert.equal(r.dimension, 'S4');
  assert.equal(r.admitted, true);
});
t('B2 merge-lead-time 人类 PR→S4；平台声明 Bot→准入拒', () => {
  assert.equal(M.resolveGithubRestSlice('merge-lead-time', { is_bot_via_platform_identity: false }).dimension, 'S4');
  const rb = M.resolveGithubRestSlice('merge-lead-time', { is_bot_via_platform_identity: true });
  assert.equal(rb.admitted, false);
  assert.match(rb.reason, /平台声明 Bot/);
});
t('B3 bot-participation-density→S5 措辞锁平台声明 Bot 身份', () => {
  const r = M.resolveGithubRestSlice('bot-participation-density');
  assert.equal(r.dimension, 'S5');
  assert.match(r.admission, /平台声明的 Bot 身份/);
});
t('B4 review-coverage=pending(event_bound) 非已裁维（D-081③——不产面≠断言败）', () => {
  const r = M.resolveGithubRestSlice('review-coverage');
  assert.equal(r.dimension, null);
  assert.equal(r.lane, 'pending-event_bound');
  assert.equal(r.admitted, false);
  assert.match(r.reason, /github-rest-reviews-active|pulls\.reviews/);
});
t('B5 pr_diff→Micro-A lane 不直采 Macro-B', () => {
  const r = M.resolveGithubRestSlice('pr_diff');
  assert.equal(r.dimension, null);
  assert.equal(r.lane, 'Micro-A');
});
t('B6 遥测/决议面永久排除出 S 维', () => {
  for (const f of ['resolution', 'rate_limit', 'rate_limited', 'api_error', 'schema_drift', 'run', 'preflight']) {
    assert.equal(M.isGithubRestExcludedFactType(f), true, f);
    const r = M.resolveGithubRestSlice(f);
    assert.equal(r.dimension, null, f);
    assert.equal(r.lane, 'excluded', f);
  }
});

// ---------- C. collector 注册面（descriptor dimension:null 保留） ----------
t('C1 codelore descriptor 注册（registered + opt_in=binary+pin）', () => {
  const r = M.UPSTREAM_COLLECTOR_REGISTRY.find(x => x.descriptor.id === 'codelore-adapter@v1');
  assert.ok(r);
  assert.equal(r.registered, true);
  assert.equal(r.opt_in, 'binary+pin');
});
t('C2 github-rest descriptor 注册（registered + opt_in=token+network＋skipped 语义在）', () => {
  const r = M.UPSTREAM_COLLECTOR_REGISTRY.find(x => x.descriptor.id === 'github-rest-adapter@v1');
  assert.ok(r);
  assert.equal(r.registered, true);
  assert.equal(r.opt_in, 'token+network');
  assert.match(r.skipped_semantics, /skipped/);
});
t('C3 注册 descriptor 即适配器原物（dimension:null 未改写——ADR-0014）', () => {
  const ids = M.UPSTREAM_COLLECTOR_REGISTRY.map(x => x.descriptor.id).sort();
  assert.deepEqual(ids, ['codelore-adapter@v1', 'github-rest-adapter@v1']);
  assert.equal(CL.CODELORE_DESCRIPTOR.dimension, null);
  assert.equal(GH.GITHUB_REST_DESCRIPTOR.dimension, null);
});

// ---------- D. 投影 seam（upstream fact→dimension 归位双通道） ----------
const mkFact = (family, metric, subject, value) => ({ fact_id: 'F-' + metric, trace_id: 't', baggage_id: 'b', scale: 'Macro-B', quadrant: 'strategic', dimension: null, collector_id: 't@v1', repo_ref: 'r', subject_ref: subject || 'repo', evidence_ref: 'e', metric, value_json: JSON.stringify(value || {}), observed_at: 'x' });
t('D1 upstream fact 投影：mapped/unmapped 双通道＋shape', () => {
  const proj = M.projectUpstreamDimensions([
    mkFact('upstream-codelore', 'codelore.facet_rows', 'revisions', { analysis: 'revisions' }),
    mkFact('upstream-codelore', 'codelore.facet_rows', 'function-coupling', { analysis: 'function-coupling' }),
    mkFact('upstream-github-rest', 'github_rest.pr_summary', 'r#1', { bot_declared: false }),
    mkFact('upstream-github-rest', 'github_rest.rate_limit', 'r', {}),
    mkFact('adr-structure', 'adr.count', 'r', {}),
  ]);
  assert.equal(proj.map_version, 'v1.0');
  assert.deepEqual(proj.mapped.map(e => e.subject_ref), ['revisions', 'r#1']);
  assert.deepEqual(proj.unmapped.map(e => e.subject_ref), ['function-coupling', 'r']);
  assert.equal(proj.mapped[0].dimension, 'S4');
  assert.equal(proj.unmapped[0].lane, 'deferred');
  assert.equal(proj.unmapped[1].lane, 'excluded');
});
t('D2 非 upstream family 不入投影面', () => {
  const proj = M.projectUpstreamDimensions([mkFact('gitlog', 'gitlog.count', 'r', {})]);
  assert.equal(proj.mapped.length, 0);
  assert.equal(proj.unmapped.length, 0);
});
t('D3 投影无权重字段（D-084——映射行形制禁权重列）', () => {
  const proj = M.projectUpstreamDimensions([mkFact('upstream-codelore', 'codelore.facet_rows', 'revisions', { analysis: 'revisions' })]);
  for (const e of [...proj.mapped, ...proj.unmapped]) assert.equal('weight' in e, false);
  assert.equal(M.UPSTREAM_DIMENSION_MAP.every(r => !('weight' in r)), true);
});

// ---------- E. 常量↔适配器实物对账（防幽灵映射/漏注册） ----------
t('E1 映射行引用的 codelore 面名全在适配器实物枚举（无幽灵面）', () => {
  const real = new Set([...CL.CODELORE_BATCH1_FACETS, ...CL.CODELORE_BEHAVIOR_FACETS].map(f => f.analysis));
  for (const r of M.CODELORE_DIMENSION_MAP) {
    if (r.surface_kind === 'analysis') assert.equal(real.has(r.surface), true, 'phantom=' + r.surface);
  }
});
t('E2 pulls.reviews 仍在 PLANNED_SURFACES ⇔ review-coverage 仍 pending（镜像 33-H2 引擎侧）', () => {
  const planned = GH.GITHUB_REST_PLANNED_SURFACES.includes('pulls.reviews');
  const pending = M.resolveGithubRestSlice('review-coverage').lane === 'pending-event_bound';
  assert.equal(planned, pending);
});

console.log('UPSTREAM-MAP-TEST-OK ' + n + '/' + n);
