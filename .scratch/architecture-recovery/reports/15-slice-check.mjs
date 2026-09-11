#!/usr/bin/env node
// A-015 机检守卫：Scale 切片差异边界（spec.md §Decision 6.2 / ADR-0006）
// 断言依据：prompts/15 专属验收 + handoffs/15 完成定义 + WORKFLOW §4.2.3 可机检要求
// 写法约束（per #14 教训）：全部用字面 indexOf / 字符判断，不写正则，规避转义坑
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, '15-slice-boundaries.json'), 'utf8'));
const up = JSON.parse(fs.readFileSync(path.join(here, '14-skeleton-fields.json'), 'utf8'));

let pass = 0;
let fail = 0;
function check(id, cond, msg) {
  if (cond) { pass++; console.log('  PASS ' + id + ' ' + msg); }
  else { fail++; console.log('  FAIL ' + id + ' ' + msg); }
}
function ne(v) {
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === 'object') return Object.keys(v).length > 0 && Object.values(v).every(ne);
  return false;
}

// ---- 上游字段集（A-014 产物）----
const skelNames = [];
up.skeleton.chapters.forEach(function (c) { c.fields.forEach(function (f) { skelNames.push(f.name); }); });
const skelSet = new Set(skelNames);
const sliceEntries = [];
const byScale = {};
up.cells.forEach(function (c) {
  if (!byScale[c.scale]) byScale[c.scale] = [];
  c.slice_fields.forEach(function (f) {
    sliceEntries.push({ scale: c.scale, quadrant: c.quadrant, name: f.name, origin: f.origin });
    byScale[c.scale].push(f.name);
  });
});
const sliceNames = sliceEntries.map(function (e) { return e.name; });

console.log('A-015 slice boundary check — 15-slice-boundaries.json');
console.log('  upstream: ' + skelNames.length + ' skeleton fields / ' + sliceEntries.length + ' slice fields / ' + up.cells.length + ' cells');

// A1 5 scale 全覆盖 + 每切片至少 5 列描述
const colIds = data.difference_columns.map(function (c) { return c.id; });
let minCols = 99;
data.slices.forEach(function (s) {
  let n = 0;
  colIds.forEach(function (k) { if (ne(s[k])) n++; });
  if (n < minCols) minCols = n;
});
check('A1', data.slices.length === 5 && minCols >= 5, '5 slices, min populated columns per slice = ' + minCols + ' (>=5)');

// A2 spec §Decision 6.2 五强制列齐备且标记 spec_mandated
const mandated = ['trigger', 'inputs', 'output_granularity', 'citation_density', 'verdict_gate_stamp_position'];
const haveMandated = mandated.every(function (m) {
  const col = data.difference_columns.find(function (c) { return c.id === m; });
  return col && col.spec_mandated === true;
});
check('A2', haveMandated, 'spec 6.2 mandated columns present and spec_mandated=true (' + mandated.length + ')');

// A3 Macro-A vs Micro-A 极端差异：>=5 维度且每维两端取值必须不同
const dims = data.extreme_case.divergence_dimensions;
const allDiffer = dims.every(function (d) { return d.macro_a !== d.micro_a && d.macro_a && d.micro_a; });
check('A3', dims.length >= 5 && allDiffer && data.extreme_case.machine_checkable === true,
  'extreme case dims = ' + dims.length + ' (>=5), all macro_a != micro_a = ' + allDiffer + ', machine_checkable = ' + data.extreme_case.machine_checkable);

// A4 R2 切片字段名与骨架字段名交集为空
const collision = sliceNames.filter(function (n) { return skelSet.has(n); });
check('A4', collision.length === 0, 'slice-vs-skeleton name collisions = ' + collision.length + ' ' + JSON.stringify([...new Set(collision)]));

// A5 R3 跨 scale 切片字段名交集为空（ADR-0006 禁止跨 scale 引用）
const scaleKeys = Object.keys(byScale);
const cross = [];
for (let i = 0; i < scaleKeys.length; i++) {
  for (let k = i + 1; k < scaleKeys.length; k++) {
    const a = new Set(byScale[scaleKeys[i]]);
    byScale[scaleKeys[k]].forEach(function (n) { if (a.has(n)) cross.push(scaleKeys[i] + ' x ' + scaleKeys[k] + ' : ' + n); });
  }
}
check('A5', cross.length === 0, 'cross-scale slice field reuse = ' + cross.length + ' ' + JSON.stringify(cross));

// A6 R4 事实唯一：每个切片字段必须有 origin
const noOrigin = sliceEntries.filter(function (e) { return !e.origin; });
check('A6', noOrigin.length === 0, 'slice fields missing origin = ' + noOrigin.length);

// A7 R5 印记位置命中 A-014 三印记白名单
const stamps = ['verdict_gate', 'grounded', 'verdict_gate_stamp'];
const badStamp = data.slices.filter(function (s) {
  return !stamps.some(function (t) { return s.verdict_gate_stamp_position.indexOf(t) >= 0; });
});
check('A7', badStamp.length === 0, 'slices with stamp outside whitelist = ' + badStamp.length);

// A8 两端极端语义：MICRO-B advisory 不进裁决 + MICRO-A 阻断
const mb = data.slices.find(function (s) { return s.scale === 'MICRO-B'; });
const maa = data.slices.find(function (s) { return s.scale === 'MICRO-A'; });
const mbOk = !!mb && mb.verdict_gate_stamp_position.indexOf('不进入裁决路径') >= 0;
const maOk = !!maa && maa.blocking === true && maa.verdict_gate_stamp_position.indexOf('行级裁决') >= 0;
check('A8', mbOk && maOk, 'MICRO-B advisory declared = ' + mbOk + ', MICRO-A blocking = ' + (maa ? maa.blocking : 'n/a'));

// A9 占位词检测（只扫描述性载荷；namespace_contract.rules 的 R6 规则文本本身需引用该词，故排除以免误报）
const placeholders = ['TODO', 'TBD', 'FIXME', '待定', '占位', '???'];
const blob = JSON.stringify({ columns: data.difference_columns, slices: data.slices, extreme: data.extreme_case });
const hits = placeholders.filter(function (p) { return blob.indexOf(p) >= 0; });
check('A9', hits.length === 0, 'placeholder hits in descriptive payload = ' + hits.length + ' ' + JSON.stringify(hits));

// A10 slice_field_count 与 A-014 真实数据一致
const mismatch = data.slices.filter(function (s) {
  return s.slice_field_count !== (byScale[s.scale] || []).length;
}).map(function (s) { return s.scale + ':declared ' + s.slice_field_count + ' vs actual ' + (byScale[s.scale] || []).length; });
check('A10', mismatch.length === 0, 'slice_field_count mismatches = ' + mismatch.length + ' ' + JSON.stringify(mismatch));

// A11 契约自描述与上游对齐
const selfOk = data.decision_ref.indexOf('Decision 6.2') >= 0 && data.adr_ref.indexOf('0006') >= 0 && data.blocked_by === '#14' && data.scales.length === 5;
check('A11', selfOk, 'self-description: ' + data.decision_ref + ' / ' + data.adr_ref + ' / blocked_by ' + data.blocked_by);

// A12 每列都有工业对标与先例性质（WORKFLOW §4.2.3 调研可机检）
const missingBasis = data.difference_columns.filter(function (c) { return !c.industrial_basis || !c.precedent_class || !c.source_ref; });
check('A12', missingBasis.length === 0, 'columns with industrial basis = ' + (data.difference_columns.length - missingBasis.length) + '/' + data.difference_columns.length);

// A13 调研段完整：>=2 一手来源 + 信息缺口显式 + 至少一列有直接先例
const rs = data.research;
const hasDirect = data.difference_columns.some(function (c) { return c.precedent_class.indexOf('有直接先例') >= 0; });
check('A13', !!rs && rs.sources.length >= 2 && rs.gaps.length > 0 && hasDirect,
  'research: sources = ' + (rs ? rs.sources.length : 0) + ', gaps = ' + (rs ? rs.gaps.length : 0) + ', direct-precedent column present = ' + hasDirect);

console.log('');
if (fail === 0) {
  console.log('PASS: ' + pass + '/' + (pass + fail) + ' assertions — 5 slices x ' + colIds.length + ' columns, ' + dims.length + ' extreme dims, ' + sliceEntries.length + ' slice fields, 0 collisions, 0 cross-scale reuse');
  process.exit(0);
} else {
  console.log('FAIL: ' + fail + ' of ' + (pass + fail) + ' assertions failed');
  process.exit(1);
}
