import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const F_STALE = path.join(HERE, '09-stale-marker-fields.json');
const F_SKELETON = path.join(HERE, '14-skeleton-fields.json');
const F_SCHEMA = path.join(HERE, '14-skeleton.schema.json');

const checks = [];
const errors = [];
const ok = (n, d) => checks.push(['PASS', n, d]);
const bad = (n, d) => { errors.push(n + ': ' + d); checks.push(['FAIL', n, d]); };

const stale = JSON.parse(fs.readFileSync(F_STALE, 'utf8'));
const skel = JSON.parse(fs.readFileSync(F_SKELETON, 'utf8'));
const schema = JSON.parse(fs.readFileSync(F_SCHEMA, 'utf8'));
ok('load', '3 artifacts parsed: 09-stale-marker-fields + 14-skeleton-fields + 14-skeleton.schema');

// ---------- 1. SLA numeric (不得为非数字如 ASAP) ----------
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const sla = stale.sla;
if (!num(sla.default_sla_seconds)) bad('sla.numeric', 'default_sla_seconds must be a finite number, got ' + JSON.stringify(sla.default_sla_seconds));
if (sla.sla_is_numeric !== true) bad('sla.flag', 'sla_is_numeric must be true');
for (const k of ['warn_threshold_seconds', 'error_threshold_seconds', 'error_multiplier']) {
  if (!num(sla[k])) bad('sla.' + k, 'must be numeric, got ' + JSON.stringify(sla[k]));
}
ok('sla-numeric', 'default=' + sla.default_sla_seconds + 's warn=' + sla.warn_threshold_seconds + 's error=' + sla.error_threshold_seconds + 's (mult x' + sla.error_multiplier + ')');

// ---------- 2. per-scale SLA all numeric ----------
const scales = skel.scales;
if (sla.per_scale.length !== scales.length) bad('sla.per_scale.count', 'expected ' + scales.length + ', got ' + sla.per_scale.length);
for (const s of sla.per_scale) {
  if (!scales.includes(s.scale)) bad('sla.per_scale.scale', 'unknown scale ' + s.scale);
  for (const k of ['sla_seconds', 'warn_seconds', 'error_seconds']) {
    if (!num(s[k])) bad('sla.per_scale.' + k, s.scale + ' must be numeric');
  }
  if (s.warn_seconds !== s.sla_seconds) bad('sla.per_scale.warn', s.scale + ' warn must equal sla');
  if (s.error_seconds !== s.sla_seconds * sla.error_multiplier) bad('sla.per_scale.error', s.scale + ' error must be sla x ' + sla.error_multiplier);
}
ok('sla-per-scale', sla.per_scale.map(s => s.scale + '=' + s.sla_seconds + '/' + s.warn_seconds + '/' + s.error_seconds).join(' '));

// ---------- 3. SLA feasibility upper bound < default SLA ----------
if (!num(sla.feasibility_upper_bound_seconds)) bad('sla.feasibility', 'upper bound must be numeric');
if (!(sla.feasibility_upper_bound_seconds < sla.default_sla_seconds)) bad('sla.feasibility.relation', 'upper bound must be < default SLA');
ok('sla-feasibility', 'worst chain ' + sla.feasibility_upper_bound_seconds + 's < SLA ' + sla.default_sla_seconds + 's (headroom x' + sla.feasibility_headroom_ratio + ')');

// ---------- 4. tuning guide each has numeric_basis ----------
for (const g of sla.tuning_guide) {
  if (!g.id || !g.rule || !g.numeric_basis) bad('tuning.' + (g.id || '?'), 'each tuning item needs id/rule/numeric_basis');
}
ok('tuning-guide', sla.tuning_guide.length + ' tuning items, each with numeric_basis');

// ---------- 5. alerting quantified ----------
const al = stale.alerting;
for (const k of ['evaluation_interval_seconds', 'warn_consecutive_periods', 'error_consecutive_periods', 'clear_consecutive_periods', 'trend_window_seconds', 'stall_window_seconds']) {
  if (!num(al[k])) bad('alerting.' + k, 'must be numeric, got ' + JSON.stringify(al[k]));
}
if (!(al.clear_consecutive_periods > al.warn_consecutive_periods)) bad('alerting.hysteresis', 'clear periods must exceed trigger periods');
const levels = new Set(['warn', 'stale', 'unknown']);
if (al.triggers.length < 5) bad('alerting.triggers.count', 'expected >=5 triggers, got ' + al.triggers.length);
for (const t of al.triggers) {
  if (!t.id || !t.condition || !t.debounce) bad('alerting.trigger.' + (t.id || '?'), 'trigger needs id/condition/debounce');
  if (!levels.has(t.level)) bad('alerting.trigger.level', t.id + ' invalid level ' + t.level);
}
if (!al.clearing || !al.clearing.rule || !al.clearing.hysteresis) bad('alerting.clearing', 'clearing rule + hysteresis required');
ok('alerting-quantified', al.triggers.length + ' triggers; eval=' + al.evaluation_interval_seconds + 's warnN=' + al.warn_consecutive_periods + ' errN=' + al.error_consecutive_periods + ' clearN=' + al.clear_consecutive_periods);

// ---------- 6. A-012 alignment ----------
const a12 = al.alignment_with_A_012 || '';
if (!a12.includes('read_model_lag_seconds')) bad('align.A012.metric', 'must reference read_model_lag_seconds');
if (!a12.includes(String(al.warn_consecutive_periods))) bad('align.A012.debounce', 'must state consecutive periods value');
ok('align-A012', 'read_model_lag_seconds + 3-period debounce consistent with A-012');

// ---------- 7. field definitions aligned with D-006 ----------
const d006 = new Map();
for (const c of skel.skeleton.chapters) for (const f of c.fields) d006.set(f.name, c.id);
const mf = stale.marker_field;
if (mf.chapter !== 'C1') bad('marker.chapter', 'marker fields must live in C1');
for (const f of mf.fields) {
  for (const k of ['name', 'type', 'required', 'description']) {
    if (!f[k]) bad('marker.field.' + k, (f.name || '?') + ' missing ' + k);
  }
  if (typeof f.required !== 'boolean') bad('marker.field.required', f.name + ' required must be boolean');
  if (d006.get(f.name) !== 'C1') bad('marker.field.presence', f.name + ' not registered in D-006 C1 (got ' + d006.get(f.name) + ')');
}
ok('marker-registered-in-D006', mf.fields.length + ' fields registered verbatim in D-006 C1: ' + mf.fields.map(f => f.name).join(', '));
for (const r of mf.reused_d006_field_names) {
  if (!d006.has(r.name)) bad('reuse.missing', r.name + ' not found verbatim in D-006');
  if (r.chapter && d006.get(r.name) !== r.chapter) bad('reuse.chapter', r.name + ' expected chapter ' + r.chapter + ' got ' + d006.get(r.name));
  if (!r.usage) bad('reuse.usage', r.name + ' missing usage');
}
ok('reuse-D006-names', mf.reused_d006_field_names.length + ' D-006 names reused verbatim: ' + mf.reused_d006_field_names.map(r => r.name).join(', '));
const MARKERS = ['fresh', 'warn', 'stale', 'unknown'];
const mapped = mf.semantics_mapping.map(m => m.marker);
for (const m of MARKERS) if (!mapped.includes(m)) bad('semantics.missing', 'marker ' + m + ' missing from semantics_mapping');
for (const m of mf.semantics_mapping) {
  for (const k of ['degraded_mode', 'grounded_c3', 'verdict_gate_stamp_c4', 'alert_level']) {
    if (!m[k]) bad('semantics.' + k, m.marker + ' missing ' + k);
  }
}
ok('semantics-mapping', mf.semantics_mapping.length + ' marker states mapped to degraded_mode/grounded/verdict_gate_stamp');
const enumField = mf.fields.find(f => f.name === 'stale_data_marker');
const wantEnum = 'enum[' + MARKERS.join('|') + ']';
if (enumField.type !== wantEnum) bad('marker.enum', 'stale_data_marker type must be ' + wantEnum + ', got ' + enumField.type);
const skelMarker = skel.skeleton.chapters[0].fields.find(f => f.name === 'stale_data_marker');
if (!skelMarker || skelMarker.type !== wantEnum) bad('marker.enum.d006', 'D-006 stale_data_marker enum mismatch');
ok('marker-enum', 'stale_data_marker enum identical in A-009 artifact and D-006 skeleton: ' + wantEnum);

// ---------- 8. versioned extension declaration ----------
const ex = stale.extends;
if (!ex || ex.artifact !== 'reports/14-skeleton-fields.json') bad('extends.artifact', 'must extend 14-skeleton-fields.json');
if (ex.base_schema_version !== '1.0.0') bad('extends.base', 'base version must be 1.0.0');
const _sv = (v) => v.split('.').map(Number); const _ge = (a, b) => { for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; } return true; }; if (ex.proposed_schema_version !== '1.1.0' || !_ge(_sv(skel.schema_version), _sv(ex.proposed_schema_version))) bad('extends.proposed', 'proposal applied at 1.1.0; current skeleton ' + skel.schema_version + ' must be >= proposal');
if (ex.change_class !== 'ADDITION') bad('extends.class', 'change_class must be ADDITION');
ok('versioned-extension', ex.base_schema_version + ' -> ' + ex.proposed_schema_version + ' (' + ex.change_class + '), applied; skeleton now ' + skel.schema_version);

// ---------- 9. ADR-0006 skeleton invariant ----------
const names = skel.skeleton.chapters.map(c => c.name).join(' -> ');
if (names !== '执行摘要 -> 四象限与裁决 -> 证据 -> 行动建议') bad('adr0006.chapters', 'chapter sequence changed: ' + names);
if (skel.skeleton.chapters.length !== 4) bad('adr0006.count', 'must stay 4 chapters');
if (skel.skeleton.chapters.map(c => c.ordinal).join(',') !== '1,2,3,4') bad('adr0006.ordinal', 'ordinals must stay 1,2,3,4');
ok('adr0006-invariant', '4 chapters + order locked after ADDITION (yield=1)');

// ---------- 10. state machine demo ----------
function run(samples) {
  const cfg = { warnT: sla.warn_threshold_seconds, errorT: sla.error_threshold_seconds, warnN: al.warn_consecutive_periods, errorN: al.error_consecutive_periods, clearN: al.clear_consecutive_periods };
  let state = 'fresh', warnRun = 0, errRun = 0, clearRun = 0;
  const out = [];
  for (const lag of samples) {
    if (lag === null) { state = 'unknown'; warnRun = errRun = clearRun = 0; out.push(state); continue; }
    if (lag > cfg.errorT) { errRun++; warnRun++; clearRun = 0; }
    else if (lag > cfg.warnT) { warnRun++; errRun = 0; clearRun = 0; }
    else { clearRun++; warnRun = 0; errRun = 0; }
    if (state === 'unknown') state = 'fresh';
    if (errRun >= cfg.errorN) state = 'stale';
    else if (state === 'stale') { if (clearRun >= cfg.clearN) state = 'fresh'; }
    else if (warnRun >= cfg.warnN) state = 'warn';
    else if (state === 'warn' && clearRun >= cfg.clearN) state = 'fresh';
    out.push(state);
  }
  return out;
}
const scenarios = [
  { name: 'S1 fresh steady', in: [0.5, 0.6, 0.7], expectLast: 'fresh' },
  { name: 'S2 warn after 3 periods', in: [6, 6, 6], expectLast: 'warn' },
  { name: 'S3 stale after 3 error periods', in: [16, 16, 16], expectLast: 'stale' },
  { name: 'S4 warn then clear after 6', in: [6, 6, 6, 1, 1, 1, 1, 1, 1], expectLast: 'fresh' },
  { name: 'S5 probe fail -> unknown', in: [0.5, null], expectLast: 'unknown' }
];
let simPass = 0;
for (const s of scenarios) {
  const trace = run(s.in);
  const last = trace[trace.length - 1];
  if (last !== s.expectLast) bad('sim.' + s.name, 'expected ' + s.expectLast + ' got ' + last + ' trace=' + trace.join(','));
  else simPass++;
}
ok('state-machine-demo', simPass + '/' + scenarios.length + ' scenarios pass (fresh/warn/stale/clear/unknown)');

// ---------- 11. probe SQL ----------
const sql = mf.probe_sql || {};
for (const k of ['fact_watermark', 'read_model_version', 'lag_seconds']) {
  if (!sql[k] || typeof sql[k] !== 'string') bad('probe_sql.' + k, 'missing SQL probe');
}
ok('probe-sql', Object.keys(sql).length + ' probe statements');

console.log('--- 09-stale-check ---');
for (const [s, n, d] of checks) console.log(s.padEnd(6), '|', n.padEnd(28), '|', d);
console.log('---');
console.log('default SLA:', sla.default_sla_seconds + 's | per-scale:', sla.per_scale.length, '| triggers:', al.triggers.length, '| marker fields:', mf.fields.length);
if (errors.length) { console.log('FAIL: ' + errors.length + ' error(s)'); process.exit(1); }
console.log('PASS: ' + checks.length + ' checks, SLA numeric, D-006 aligned (' + mf.fields.length + ' registered + ' + mf.reused_d006_field_names.length + ' reused), alerting quantified, state machine ' + simPass + '/' + scenarios.length);
