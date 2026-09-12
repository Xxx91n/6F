import fs from 'fs';
import path from 'path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const ROOT = path.resolve(HERE, '..');
const SKELETON = path.join(HERE, '14-skeleton-fields.json');
const SCHEMA = path.join(HERE, '14-skeleton.schema.json');
const MATRIX = path.join(HERE, '05-unit-matrix.json');

const errors = [];
const checks = [];
const ok = (n, d) => checks.push(['PASS', n, d]);
const bad = (n, d) => { errors.push(n + ': ' + d); checks.push(['FAIL', n, d]); };

// ---------- 1. load ----------
const doc = JSON.parse(fs.readFileSync(SKELETON, 'utf8'));
const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
const matrix = JSON.parse(fs.readFileSync(MATRIX, 'utf8'));
ok('load', '3 artifacts parsed: skeleton + schema + A-005 matrix');

// ---------- 2. lightweight JSON Schema validation ----------
function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}
function validate(node, sch, trail) {
  if (!sch || typeof sch !== 'object') return;
  if (sch.type) {
    const t = typeOf(node);
    const want = sch.type;
    if (want === 'integer' ? !(Number.isInteger(node)) : t !== want) bad('schema.type', trail + ' expected ' + want + ' got ' + t);
  }
  if (sch.const !== undefined && node !== sch.const) bad('schema.const', trail + ' must equal ' + JSON.stringify(sch.const));
  if (sch.enum && !sch.enum.includes(node)) bad('schema.enum', trail + ' value ' + JSON.stringify(node) + ' not in ' + JSON.stringify(sch.enum));
  if (typeof sch.pattern === 'string' && typeof node === 'string' && !(new RegExp(sch.pattern).test(node))) bad('schema.pattern', trail + ' does not match ' + sch.pattern);
  if (typeof node === 'string' && sch.minLength !== undefined && node.length < sch.minLength) bad('schema.minLength', trail);
  if (Array.isArray(node)) {
    if (sch.minItems !== undefined && node.length < sch.minItems) bad('schema.minItems', trail + ' has ' + node.length + ' < ' + sch.minItems);
    if (sch.maxItems !== undefined && node.length > sch.maxItems) bad('schema.maxItems', trail + ' has ' + node.length + ' > ' + sch.maxItems);
    if (sch.uniqueItems && new Set(node.map(x => JSON.stringify(x))).size !== node.length) bad('schema.uniqueItems', trail);
    if (sch.items) node.forEach((it, i) => validate(it, sch.items, trail + '[' + i + ']'));
  }
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    (sch.required || []).forEach(k => { if (!(k in node)) bad('schema.required', trail + ' missing ' + k); });
    if (sch.properties) Object.keys(node).forEach(k => { if (sch.properties[k]) validate(node[k], sch.properties[k], trail + '.' + k); });
    if (sch.additionalProperties === false && sch.properties) Object.keys(node).forEach(k => { if (!(k in sch.properties)) bad('schema.additionalProperties', trail + ' unexpected key ' + k); });
  }
}
validate(doc, schema, 'root');
ok('schema-2020-12', 'skeleton conforms to 14-skeleton.schema.json');

// ---------- 3. chapter order locked ----------
const chs = doc.skeleton.chapters;
if (doc.skeleton.locked !== true) bad('chapters.locked', 'skeleton.locked must be true');
if (chs.length !== 4) bad('chapters.count', 'expected exactly 4, got ' + chs.length);
const ords = chs.map(c => c.ordinal);
if (ords.join(',') !== '1,2,3,4') bad('chapters.ordinal', 'ordinals must be strictly 1,2,3,4 in order; got ' + ords.join(','));
const ids = chs.map(c => c.id);
if (new Set(ids).size !== ids.length) bad('chapters.id', 'duplicate chapter id');
const names = chs.map(c => c.name).join(' -> ');
if (names !== '执行摘要 -> 四象限与裁决 -> 证据 -> 行动建议') bad('chapters.order', 'chapter name sequence mismatch: ' + names);
if (chs.some(c => c.locked !== true)) bad('chapters.locked', 'every chapter must have locked=true');
ok('chapter-order-locked', '4 chapters, ordinals ' + ords.join(',') + ', sequence ' + names);

// ---------- 4. field completeness ----------
let fieldTotal = 0;
const PLACEHOLDER = /TBD|待定|待补|待填|TODO|PLACEHOLDER|XXX|[?][?][?]/;
for (const c of chs) {
  for (const f of c.fields) {
    fieldTotal++;
    for (const k of ['name','type','required','description']) {
      const v = f[k];
      if (v === undefined || v === null || v === '') bad('field.' + k, c.id + '.' + f.name + ' missing ' + k);
    }
    if (typeof f.required !== 'boolean') bad('field.required', c.id + '.' + f.name + ' required must be boolean');
    if (PLACEHOLDER.test(String(f.description))) bad('field.placeholder', c.id + '.' + f.name + ' description has placeholder');
  }
}
ok('field-completeness', fieldTotal + ' fields, each with name/type/required/description, no placeholders');

// ---------- 5. 5x4 cartesian completeness ----------
const qs = doc.quadrants, ss = doc.scales;
const want = new Set();
for (const q of qs) for (const s of ss) want.add(q + '|' + s);
const got = new Set(doc.cells.map(c => c.quadrant + '|' + c.scale));
const missing = [...want].filter(k => !got.has(k));
const extra = [...got].filter(k => !want.has(k));
if (missing.length) bad('cells.missing', missing.join(', '));
if (extra.length) bad('cells.extra', extra.join(', '));
const cellIds = doc.cells.map(c => c.id);
if (new Set(cellIds).size !== cellIds.length) bad('cells.id', 'duplicate cell id');
for (const c of doc.cells) {
  if (c.id !== c.quadrant.toUpperCase() + 'x' + c.scale) bad('cells.id-format', c.id + ' does not match QUADRANTxSCALE');
  if (!c.slice_fields.length) bad('cells.slice_fields', c.id + ' has empty slice_fields');
  for (const sf of c.slice_fields) {
    for (const k of ['name','type','required','description','origin']) {
      if (!sf[k]) bad('slice_field.' + k, c.id + '.' + sf.name + ' missing ' + k);
    }
    if (typeof sf.required !== 'boolean') bad('slice_field.required', c.id + '.' + sf.name + ' required must be boolean');
    if (PLACEHOLDER.test(String(sf.description))) bad('slice_field.placeholder', c.id + '.' + sf.name);
  }
}
ok('cartesian-5x4', '20/20 cells, full quadrant x scale coverage, ids unique and well-formed');

// ---------- 6. strategy quadrant = 5 dims per scale ----------
const strat = doc.cells.filter(c => c.quadrant === 'strategy');
for (const c of strat) {
  if (c.slice_fields.length !== 5) bad('strategy.dims', c.id + ' expected 5 fields (S1-S5), got ' + c.slice_fields.length);
}
if (strat.length !== 5) bad('strategy.coverage', 'strategy quadrant must cover 5 scales, got ' + strat.length);
ok('strategy-S1-S5', strat.length + ' strategy cells x 5 dims = ' + strat.reduce((a,c)=>a+c.slice_fields.length,0) + ' metric bindings');

// ---------- 7. cross-check against A-005 matrix ----------
const mm = new Map();
for (const c of matrix.cells) {
  const set = new Set();
  if (c.threshold && c.threshold.yellow) set.add(c.threshold.yellow.metric);
  if (c.threshold && c.threshold.red) set.add(c.threshold.red.metric);
  mm.set(c.id, set);
}
let bound = 0;
for (const c of doc.cells) {
  for (const sf of c.slice_fields) {
    const o = String(sf.origin);
    if (!o.startsWith('A-005:')) continue;
    const cellId = o.split('#')[1];
    if (!cellId) { bad('xref.origin', c.id + '.' + sf.name + ' origin missing #cellId'); continue; }
    if (!mm.has(cellId)) { bad('xref.matrix', c.id + '.' + sf.name + ' references unknown A-005 cell ' + cellId); continue; }
    if (!mm.get(cellId).has(sf.name)) bad('xref.metric', c.id + '.' + sf.name + ' not a metric of A-005 cell ' + cellId);
    else bound++;
  }
}
ok('xref-A-005', bound + ' slice fields resolved against A-005 metric names');

// ---------- 8. applicability distribution ----------
const app = {};
for (const c of doc.cells) app[c.applicability] = (app[c.applicability] || 0) + 1;
ok('applicability', JSON.stringify(app));

// ---------- report ----------
console.log('--- 14-skeleton-check ---');
for (const [s, n, d] of checks) console.log(s.padEnd(6), '|', n.padEnd(22), '|', d);
const sliceTotal = doc.cells.reduce((a,c)=>a+c.slice_fields.length,0);
console.log('---');
console.log('chapters:', chs.length, '| fields:', fieldTotal, '| cells:', doc.cells.length, '| slice fields:', sliceTotal);
if (errors.length) { console.log('FAIL: ' + errors.length + ' error(s)'); process.exit(1); }
console.log('PASS: 4 chapters order-locked, ' + fieldTotal + ' fields typed/required/described, 20/20 cells, ' + sliceTotal + ' slice fields, ' + bound + ' xrefs to A-005, no placeholders');