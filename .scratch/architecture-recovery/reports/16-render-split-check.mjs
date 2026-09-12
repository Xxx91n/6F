// A-016 guard: 渲染样式与模板结构切分契约机检
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const CONTRACT = path.join(HERE, '16-render-split.json');
const SCHEMA = path.join(HERE, '16-render-split.schema.json');
const UPSTREAM = path.join(HERE, '14-skeleton-fields.json');

const doc = JSON.parse(readFileSync(CONTRACT, 'utf8'));
const specNames = new Set(doc.spec_locked_field_names);
const styleFields = doc.demo_style_fields;
const styleNames = styleFields.map(function (f) { return f.name; });
const styleSet = new Set(styleNames);
const demoNames = new Set(doc.demo_locked_field_names);
const specFields = doc.spec_locked_fields;
const ROOT_TOKENS = new Set(['report']);

let pass = 0, fail = 0;
function chk(id, name, fn) {
  let ok = false, detail = "";
  try { const r = fn(); ok = !!r.ok; detail = r.detail || ""; }
  catch (e) { ok = false; detail = "EXCEPTION: " + e.message; }
  if (ok) { pass++; } else { fail++; }
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + ' ' + name + (detail ? ' :: ' + detail : ''));
}
function subset(a, b) { for (const v of a) { if (!b.has(v)) { return false; } } return true; }
chk('A1', 'spec 字段集是 demo 字段集的严格真子集（spec 不写样式）', function () {
  const proper = subset(specNames, demoNames) && demoNames.size > specNames.size;
  return { ok: proper, detail: 'spec=' + specNames.size + ' demo=' + demoNames.size + ' diff=' + (demoNames.size - specNames.size) };
});

chk('A2', 'spec 全部字段被 demo 继承（无遗漏渲染）', function () {
  const missing = [];
  for (const n of specNames) { if (!demoNames.has(n)) { missing.push(n); } }
  return { ok: missing.length === 0, detail: 'missing=' + missing.length + (missing.length ? ' ' + missing.slice(0, 5).join(',') : '') };
});

chk('A3', 'demo 字段集无孤儿（每个 demo 字段来自 spec 或样式清单）', function () {
  const orphans = Array.from(demoNames).filter(function (n) { return !specNames.has(n) && !styleSet.has(n); });
  return { ok: orphans.length === 0, detail: 'orphans=' + orphans.length + (orphans.length ? ' ' + orphans.slice(0, 5).join(',') : '') };
});

chk('A4', 'spec 字段名与样式字段名交集为空（命名空间 R3）', function () {
  const inter = Array.from(specNames).filter(function (n) { return styleSet.has(n); });
  return { ok: inter.length === 0, detail: 'intersection=' + inter.length };
});

chk('A5', 'spec 字段要素齐备（name/type/required/description/origin）', function () {
  const bad = specFields.filter(function (f) { return !f.name || !f.type || typeof f.required !== 'boolean' || !f.description || !f.origin; });
  return { ok: bad.length === 0, detail: 'fields=' + specFields.length + ' bad=' + bad.length };
});

chk('A6', '样式字段全部带 ui: 前缀且有 token_ref（命名空间 R2）', function () {
  const bad = styleFields.filter(function (f) { return f.name.indexOf('ui:') !== 0 || !f.token_ref; });
  return { ok: bad.length === 0, detail: 'style=' + styleFields.length + ' bad=' + bad.length };
});

chk('A7', '样式值为 token 引用、无字面量色值或绝对单位（命名空间 R5）', function () {
  const re = new RegExp('^[{][a-zA-Z][a-zA-Z0-9._]*[}]$');
  const bad = styleFields.filter(function (f) { return !re.test(f.value) || f.value_is_token_ref !== true; });
  const HASH = String.fromCharCode(35);
  const lit = styleFields.filter(function (f) { return f.value.indexOf(HASH) >= 0 || f.value.indexOf('px') >= 0 || f.value.indexOf('rgb') >= 0; });
  return { ok: bad.length === 0 && lit.length === 0, detail: 'badRef=' + bad.length + ' literal=' + lit.length };
});

chk('A8', '样式字段 applies_to 指向 spec 字段 / 章节 id / 报告根容器（命名空间 R6）', function () {
  const chapterRe = new RegExp('^C[1-4]$');
  const bad = [];
  styleFields.forEach(function (f) {
    const toks = String(f.applies_to).split(/[^A-Za-z0-9_]+/).filter(function (t) { return t.length > 0; });
    const hit = toks.some(function (t) { return specNames.has(t) || chapterRe.test(t) || ROOT_TOKENS.has(t); });
    if (!hit) { bad.push(f.name + ' -> ' + f.applies_to); }
  });
  return { ok: bad.length === 0, detail: 'unresolved=' + bad.length + (bad.length ? ' ' + bad.slice(0, 3).join(' | ') : '') };
});
function scan(severity) {
  const out = [];
  doc.boundary_scan_scope.targets.forEach(function (rel) {
    const abs = path.join(REPO, rel);
    if (!existsSync(abs)) { out.push(rel + " :FILE-MISSING"); return; }
    const text = readFileSync(abs, 'utf8');
    doc.boundary_blacklist.filter(function (c) { return c.severity === severity; }).forEach(function (c) {
      c.patterns.forEach(function (src) {
        let re;
        try { re = new RegExp(src, 'g'); } catch (e) { out.push(rel + ' ' + c.id + ' :BAD-REGEX'); return; }
        const m = text.match(re);
        if (m && m.length > 0) { out.push(rel + " " + c.id + " x" + m.length + " first=" + JSON.stringify(m[0]).slice(0, 40)); }
      });
    });
  });
  return out;
}

const hardHits = scan('hard_ban');
const softHits = scan('soft_warn');

chk('A9', '骨架字段与切片字段命名空间不重叠（命名空间 R7 / 继承 A-015 R1）', function () {
  const skel = specFields.filter(function (f) { return f.kind === 'structure'; }).map(function (f) { return f.name; });
  const slice = specFields.filter(function (f) { return f.kind === 'slice-metric'; }).map(function (f) { return f.name; });
  const ss = new Set(skel);
  const inter = slice.filter(function (n) { return ss.has(n); });
  return { ok: inter.length === 0, detail: 'skeleton=' + skel.length + ' slice=' + slice.length + ' inter=' + inter.length };
});

chk('A10', '越界黑名单条目结构完整且每条正则可编译', function () {
  const cats = doc.boundary_blacklist;
  const bad = [];
  cats.forEach(function (c) {
    if (!c.id || !c.name || !c.rationale) { bad.push(c.id + ':missing-field'); }
    if (c.severity !== 'hard_ban' && c.severity !== 'soft_warn') { bad.push(c.id + ':bad-severity'); }
    if (!Array.isArray(c.patterns) || c.patterns.length === 0) { bad.push(c.id + ':no-pattern'); return; }
    c.patterns.forEach(function (src) { try { new RegExp(src); } catch (e) { bad.push(c.id + ":bad-regex"); } });
  });
  return { ok: bad.length === 0, detail: 'categories=' + cats.length + ' bad=' + bad.length };
});

chk('A11', '越界硬禁扫描：spec 侧契约文件零命中（可机检核心闸）', function () {
  return { ok: hardHits.length === 0, detail: 'targets=' + doc.boundary_scan_scope.targets.length + ' hardHits=' + hardHits.length + (hardHits.length ? ' :: ' + hardHits.slice(0, 5).join(' ; ') : '') };
});

chk('A12', '越界扫描作用域排除黑名单定义文件与守卫自身（命名空间 R8 防自指）', function () {
  const t = doc.boundary_scan_scope.targets;
  const e = doc.boundary_scan_scope.excluded;
  const selfIn = t.some(function (x) { return x.indexOf('16-render-split.json') >= 0 || x.indexOf('16-render-split-check.mjs') >= 0 || x.indexOf('16-report.md') >= 0; });
  return { ok: !selfIn && e.length >= 3, detail: 'targets=' + t.length + ' excluded=' + e.length + ' selfInScope=' + selfIn };
});

chk('A13', '上游契约计数对齐（A-014 骨架 / A-015 切片）', function () {
  const up = JSON.parse(readFileSync(UPSTREAM, 'utf8'));
  const skelN = up.skeleton.chapters.reduce(function (n, c) { return n + c.fields.length; }, 0);
  const sl = new Set();
  up.cells.forEach(function (c) { (c.slice_fields || []).forEach(function (f) { if (f && f.name) { sl.add(f.name); } }); });
  const okN = doc.counts.skeleton_occurrences === skelN && doc.counts.slice_unique === sl.size;
  return { ok: okN, detail: 'declared=' + doc.counts.skeleton_occurrences + '/' + doc.counts.slice_unique + ' actual=' + skelN + '/' + sl.size };
});

chk('A14', '契约 schema 存在且为 JSON Schema 2020-12 + additionalProperties:false', function () {
  if (!existsSync(SCHEMA)) { return { ok: false, detail: 'schema missing' }; }
  const s = JSON.parse(readFileSync(SCHEMA, 'utf8'));
  const D = String.fromCharCode(36);
  const okS = s[D + 'schema'] === 'https://json-schema.org/draft/2020-12/schema' && s.additionalProperties === false && !!s[D + 'defs'];
  return { ok: okS, detail: 'draft=' + (s[D + 'schema'] || 'none') + ' additionalProperties=' + s.additionalProperties };
});

chk('A15', '四章 C1-C4 均有 spec 锁定字段（章顺序骨架不空）', function () {
  const chs = new Set();
  specFields.forEach(function (f) { if (f.kind === 'structure') { chs.add(String(f.container).split(' ')[0]); } });
  const need = ['C1', 'C2', 'C3', 'C4'];
  const miss = need.filter(function (c) { return !chs.has(c); });
  return { ok: miss.length === 0, detail: 'chapters=' + Array.from(chs).sort().join(',') + ' missing=' + miss.join(',') };
});

chk('A16', 'demo 字段总数 = spec 唯一字段数 + 样式字段数', function () {
  const expect = specNames.size + styleFields.length;
  return { ok: doc.demo_locked_field_names.length === expect, detail: 'demo=' + doc.demo_locked_field_names.length + ' expect=' + expect };
});

console.log('');
console.log('soft-warn hits: ' + softHits.length);
softHits.slice(0, 12).forEach(function (h) { console.log("  SOFT " + h); });
console.log('');
console.log('TOTAL: ' + pass + ' pass / ' + fail + ' fail');
console.log(fail === 0 ? 'GUARD RESULT: PASS' : 'GUARD RESULT: FAIL');
process.exit(fail === 0 ? 0 : 1);