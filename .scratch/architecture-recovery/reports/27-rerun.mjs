// 27-rerun.mjs — R4-02 冻结集重跑：v1 + v2 双读数（规则与期望读数冻结于 27-prereg.md，先入库后执行）
// 用法: node 27-rerun.mjs   （写 reports/27-dual-readings.json + 27-dual-readings.md）
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const SHA = 'fc00d458e215cc9a7a26af81626dec8712622821';
const C = await import(pathToFileURL(join(REPO, 'engine', 'src', 'collect', 'collectors.ts')).href);

function git(args) { return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }

const frozenPaths = git(['ls-tree', '--name-only', SHA, 'docs/adr/']).trim().split(String.fromCharCode(10));
const docs = frozenPaths.map(function (p) {
  const first = git(['log', '--follow', '--format=%aI', '--reverse', '--', p]).trim().split(String.fromCharCode(10))[0];
  return { path: p, text: git(['show', SHA + ':' + p]), first_commit_date: first || null };
});

const ctx = { runId: 'r27-rerun', traceId: C.sha256Hex('6F|' + SHA + '|rerun').slice(0, 32), repoRef: '6F@' + SHA, scale: 'Macro-B', observedAt: '2026-09-13T14:31:09+08:00' };

const v1Facts = C.collectAdrStructure({ documents: docs }, ctx);
const v2Facts = C.collectAdrStructureV2({ documents: docs }, ctx);

const FIVE = ['Status','Date','Context','Decision','Consequences'];
function perFile(facts) {
  const out = {};
  for (const f of facts) {
    const v = JSON.parse(f.value_json); const fn = f.subject_ref.split('/').pop();
    out[fn] = out[fn] || { fields: {}, legs: {} };
    if (f.metric === 'adr.header_field_present') { out[fn].fields[v.field] = v.present; out[fn].legs[v.field] = v.leg || 'dash'; }
    if (f.metric === 'adr.section_present') { out[fn].fields[v.section] = v.present; out[fn].legs[v.section] = v.leg || 'dash'; }
    if (f.metric === 'adr.five_piece_completeness') { out[fn].five = v; }
    if (f.metric === 'adr.decision_date') { out[fn].decision_date = v; }
  }
  return out;
}
const v1 = perFile(v1Facts), v2 = perFile(v2Facts);
const truth = JSON.parse(readFileSync(join(HERE, '26-truth-table.json'), 'utf8'));

// 期望读数（27-prereg §2 写死）：truth_present 格 → present；Date real-gap → present(git)；其余 real-gap → absent
const cells = [];
let agree = 0;
for (const tf of truth.files.filter(function (f) { return f.frozen; })) {
  const fn = tf.path.split('/').pop();
  for (const k of FIVE) {
    const t = tf.fields[k];
    const expected = t.truth_present || (k === 'Date' && t.delta_class === 'real-gap' && !!tf.git_first_commit);
    const v1p = t.v1_present;
    const v2p = v2[fn].fields[k];
    const leg = v2[fn].legs[k];
    const ok = v2p === expected;
    if (ok) { agree++; }
    cells.push({ file: fn, field: k, truth: t.truth_present, truth_form: t.form, v1: v1p, v2: v2p, v2_leg: leg, expected: expected, agree: ok, delta_class: t.delta_class });
  }
}

function agg(facts) {
  const fives = facts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return JSON.parse(f.value_json); });
  const mean = fives.reduce(function (s, v) { return s + v.ratio; }, 0) / fives.length;
  const miss = {};
  for (const k of FIVE) { miss[k] = fives.filter(function (v) { return v.missing.indexOf(k) >= 0; }).length / fives.length; }
  const condA = mean < 0.60;
  let condB = false;
  for (const k of Object.keys(miss)) { if (miss[k] > 0.50) { condB = true; } }
  return { n: fives.length, mean_ratio_4: mean.toFixed(4), missing_ratio_4: Object.fromEntries(Object.keys(miss).map(function (k) { return [k, Number(miss[k].toFixed(4))]; })), cond_a: condA, cond_b: condB, verdict: (condA || condB) ? 'RED' : 'NOT_RED' };
}
const v1Agg = agg(v1Facts), v2Agg = agg(v2Facts);
const truthAgg = { n: 13, mean_ratio_4: truth.aggregates.truth.mean_ratio.toFixed(4), missing_ratio_4: Object.fromEntries(Object.keys(truth.aggregates.truth.missing_counts).map(function (k) { return [k, Number((truth.aggregates.truth.missing_counts[k] / 13).toFixed(4))]; })) };

const out = {
  meta: { generated_at: new Date().toISOString(), frozen_sha: SHA, detector_v1: 'adr-structure@v1', detector_v2: 'adr-structure@v2', prereg: 'reports/27-prereg.md', golden_set: 'reports/26-truth-table.json', rerun_count: 1 },
  dual_readings: { v1_frozen: v1Agg, v2_rerun: v2Agg, truth_reference: truthAgg },
  agreement: { cells_total: cells.length, cells_agree: agree, all_agree: agree === cells.length },
  decision_dates: Object.fromEntries(Object.keys(v2).map(function (fn) { return [fn, v2[fn].decision_date]; })),
  cells: cells
};
writeFileSync(join(HERE, '27-dual-readings.json'), JSON.stringify(out, null, 2) + String.fromCharCode(10), 'utf8');
console.log('v1 mean:', v1Agg.mean_ratio_4, v1Agg.verdict, '| v2 mean:', v2Agg.mean_ratio_4, v2Agg.verdict);
console.log('agreement:', agree + '/' + cells.length, agree === cells.length ? 'ALL-AGREE' : 'MISMATCH');
console.log('v2 missing_ratio:', JSON.stringify(v2Agg.missing_ratio_4));
const legCount = {};
for (const c of cells) { if (c.v2) { legCount[c.v2_leg] = (legCount[c.v2_leg] || 0) + 1; } }
console.log('v2 legs:', JSON.stringify(legCount));
