// codelore-batch1.test.mjs — 首批 30 面逐面 golden 契约测试（#35/A-040/D-035①；#31 cassette 回放先例扩展）
// 断言面 = cassette 字节未漂（sha256）+ 行数/列契约 vs manifest（独立计量源）+ 首行 spot 值钉死
//        + 漂移/畸形输入拒绝（红证）+ collect 注入面（无真二进制依赖，CI 可跑）+ 适配层零业务规则词。
// 测试绝不调真实 codelore 二进制——录制/探针在 reports/35-probe.mjs。
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const C = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const FX = join(HERE, 'fixtures', 'codelore', 'batch1');
const manifest = JSON.parse(readFileSync(join(FX, 'manifest.json'), 'utf8'));
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const ADAPTER_SRC = readFileSync(join(root, 'src', 'upstream', 'codelore.ts'), 'utf8');

let n = 0;
const t = (name, fn) => { fn(); n++; };

// ---------- A. 面集对账（适配器契约表 == manifest == 首批名单） ----------
t('A1 manifest 契约面=30 且族划分 12+6+12', () => {
  const names = Object.keys(manifest.facets);
  assert.equal(names.length, 30);
  const g = { evolution: 0, s3: 0, s5: 0 };
  for (const k of names) g[manifest.facets[k].group]++;
  assert.deepEqual(g, { evolution: 12, s3: 6, s5: 12 });
});

t('A2 适配器契约表与 manifest 同源 30 面', () => {
  assert.equal(C.CODELORE_BATCH1_FACETS.length, 30);
  assert.deepEqual(
    C.CODELORE_BATCH1_FACETS.map((f) => f.analysis).sort(),
    Object.keys(manifest.facets).sort()
  );
});

t('A3 pin 0.28.0 不变 + manifest 记录版本一致', () => {
  assert.equal(C.CODELORE_PINNED_VERSION, '0.28.0');
  assert.equal(manifest.pinned_version, '0.28.0');
  assert.equal(manifest.codelore_version, '0.28.0');
});

// ---------- B. 逐面 golden 契约（30 面逐面） ----------
for (const [name, spec] of Object.entries(manifest.facets)) {
  t('facet ' + name + ' cassette 未漂 + 行数/列/spot 契约', () => {
    const fpath = join(FX, spec.file);
    assert.ok(existsSync(fpath), name + ' cassette missing');
    const raw = readFileSync(fpath, 'utf8');
    assert.equal(sha256(raw), spec.sha256, name + ' cassette drift');
    assert.equal(Buffer.byteLength(raw, 'utf8'), spec.bytes, name + ' bytes drift');
    const rows = C.parseJsonRows(raw);
    assert.equal(rows.length, spec.row_count, name + ' row_count drift');
    if (spec.row_count > 0) {
      assert.deepEqual(C.facetColumns(rows), spec.columns, name + ' columns drift');
      assert.equal(rows[0][spec.spot.key], spec.spot.value, name + ' spot value drift');
    } else {
      // 空结果面：json 断言空数组语义；列契约由 csv cassette 逐字节钉死（sha256 回验）
      assert.deepEqual(rows, []);
      assert.ok(spec.columns.length > 0 && spec.columns_source === 'csv-header', name + ' empty-facet column contract missing');
      const csvPath = join(FX, spec.csv_file);
      assert.ok(existsSync(csvPath), name + ' csv cassette missing');
      const csvRaw = readFileSync(csvPath, 'utf8');
      assert.equal(sha256(csvRaw), spec.csv_sha256, name + ' csv cassette drift');
      assert.deepEqual(csvRaw.split('\n').map((l) => l.trim()).filter(Boolean)[0].split(','), spec.columns, name + ' csv header columns drift');
    }
  });
}

// ---------- C. 红证：漂移/畸形输入拒绝 ----------
t('C1 非数组 JSON 被拒', () => {
  assert.throws(() => C.parseJsonRows('{"a":1}'), /not an array/);
});
t('C2 非对象行被拒', () => {
  assert.throws(() => C.parseJsonRows('[1,2,3]'), /shape drift/);
  assert.throws(() => C.parseJsonRows('[["a"]]'), /shape drift/);
  assert.throws(() => C.parseJsonRows('[null]'), /shape drift/);
});
t('C3 截断 cassette 解析抛错（不产生半截假阳性）', () => {
  const raw = readFileSync(join(FX, manifest.facets['lead-time'].file), 'utf8');
  assert.throws(() => C.parseJsonRows(raw.slice(0, Math.floor(raw.length / 2))));
});

// ---------- D. collect 注入面（resolver+runner 注入，无真二进制） ----------
const CTX = { runId: 'ut35', traceId: 't'.padEnd(32, '0'), repoRef: 'fixture', scale: 'Macro-C', observedAt: '2026-09-16T00:00:00Z' };
const fakeResolver = (binary) => ({ strategy: 'binary-discovery', binary, version: '0.28.0', pinned: true, error: null });

// #80 步①：per-file 一等事实发射——file-bearing 行（path/entity→1 条；entity_a+entity_b→双端 2 条）
const expectedFileFacts = (exclude) => Object.entries(manifest.facets).reduce((s, [name, spec]) => {
  if (name === exclude) return s;
  const rows = JSON.parse(readFileSync(join(FX, spec.file), 'utf8'));
  return s + rows.reduce((t, r) => t + (typeof r.entity_a === 'string' && typeof r.entity_b === 'string' ? 2 : ((typeof r.path === 'string' && r.path) || (typeof r.entity === 'string' && r.entity)) ? 1 : 0), 0);
}, 0);

t('D1 collect 全 30 面 → 1 resolution + 30 facet_rows(raw 证据位) + per-file 一等事实，schema v0 字段齐备', () => {
  const runner = (bin, spec) => ({ ok: true, status: 0, stdout: readFileSync(join(FX, manifest.facets[spec.analysis].file), 'utf8'), stderrTail: '' });
  const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver: fakeResolver, runner }, CTX);
  const fileFacts = facts.filter((f) => f.metric === 'codelore.file_facet_row');
  assert.equal(facts.length, 31 + fileFacts.length);
  assert.equal(fileFacts.length, expectedFileFacts());
  assert.ok(fileFacts.every((f) => f.scale === 'Micro-B'), 'per-file grain=Micro-B');
  assert.ok(facts.filter((f) => f.metric === 'codelore.facet_rows').every((f) => JSON.parse(f.value_json).role === 'raw_evidence'), 'facet_rows raw 证据位');
  assert.equal(C.reconcilePerFileVsAggregate(facts).match, true, '聚合↔per-file 对账');
  assert.equal(facts[0].metric, 'upstream.resolution');
  const fr = facts.filter((f) => f.metric === 'codelore.facet_rows');
  assert.equal(fr.length, 30);
  for (const f of facts) {
    for (const k of ['fact_id', 'trace_id', 'baggage_id', 'collector_id', 'metric', 'value_json', 'observed_at']) assert.ok(f[k] !== undefined, k);
    assert.equal(f.collector_id, 'codelore-adapter@v1');
  }
  const rev = fr.find((f) => f.subject_ref === 'revisions');
  const v = JSON.parse(rev.value_json);
  assert.equal(v.row_count, manifest.facets['revisions'].row_count);
  assert.deepEqual(v.columns, manifest.facets['revisions'].columns);
  assert.equal(v.rows.length, manifest.facets['revisions'].row_count);
});

t('D2 面失败 → facet_error 降级不中断其余面', () => {
  const runner = (bin, spec) => spec.analysis === 'instability'
    ? { ok: false, status: 2, stdout: '', stderrTail: 'boom' }
    : { ok: true, status: 0, stdout: '[]', stderrTail: '' };
  const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver: fakeResolver, runner }, CTX);
  const err = facts.find((f) => f.metric === 'codelore.facet_error');
  assert.ok(err && err.subject_ref === 'instability');
  assert.equal(facts.filter((f) => f.metric === 'codelore.facet_rows').length, 29);
  assert.equal(facts.filter((f) => f.metric === 'codelore.file_facet_row').length, 0);   // 空行面不发 per-file 事实
});

t('D3 解析失败 → facet_parse_error（原始文本不进 fact）', () => {
  const runner = () => ({ ok: true, status: 0, stdout: 'not-json{', stderrTail: '' });
  const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver: fakeResolver, runner, facets: [C.CODELORE_BATCH1_FACETS[0]] }, CTX);
  assert.equal(facts.length, 2);
  assert.equal(facts[1].metric, 'codelore.facet_parse_error');
  const v = JSON.parse(facts[1].value_json);
  assert.ok(typeof v.message === 'string' && v.message.length > 0);
  assert.ok(!('rows' in v) && !('columns' in v), 'raw rows must not leak on parse failure');
});

t('D4 未 pin/缺失二进制 → 只出 resolution 事实（沿用 #31 语义）', () => {
  const resolver = (binary) => ({ strategy: 'binary-discovery', binary, version: '9.9.9', pinned: false, error: null });
  const runner = () => { throw new Error('runner must not be called'); };
  const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver, runner }, CTX);
  assert.equal(facts.length, 1);
  assert.equal(JSON.parse(facts[0].value_json).pinned, false);
});

// ---------- E. 适配层零业务规则词（#31 A3 先例） ----------
t('E1 适配层有进程调用且无业务规则词', () => {
  assert.ok(/spawnSync/.test(ADAPTER_SRC));
  assert.ok(!/threshold|verdict|RED|score_band/.test(ADAPTER_SRC), 'business-rule word in adapter');
});

console.log('CODELORE-BATCH1-TEST-OK ' + n + '/' + n);
