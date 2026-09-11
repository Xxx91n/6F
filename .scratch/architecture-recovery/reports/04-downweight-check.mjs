// 04-downweight-check.mjs — guard for reports/04-downweight.json (ticket #04, A-004)
// Validates: bucket coverage/monotonicity, matrix snapshot sync, B1 saturation,
// per-case recomputation (identities, override, gates, module share), template schema.
import { readFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url);
const data = JSON.parse(readFileSync(new URL('04-downweight.json', dir)));
const matrix = JSON.parse(readFileSync(new URL('05-unit-matrix.json', dir)));

const fails = [];
const ok = (cond, name) => { if (!cond) fails.push(name); };
const near = (a, b) => Math.abs(a - b) < 5e-4; // stored shares are rounded to 3 decimals

// 1. buckets: contiguous integer coverage 1..inf, monotone offset/coeff
const buckets = data.buckets;
ok(buckets.length === 4, 'bucket count = 4');
ok(buckets[0].human_actors.min === 1, 'B1 min = 1');
for (let i = 1; i < buckets.length; i++) {
  ok(buckets[i].human_actors.min === buckets[i - 1].human_actors.max + 1, `bucket ${i} contiguous`);
}
ok(buckets[3].human_actors.max === null, 'B4 open-ended (12+)');
for (let i = 1; i < buckets.length; i++) {
  ok(buckets[i].threshold_offset <= buckets[i - 1].threshold_offset, 'threshold_offset monotone non-increasing');
  ok(buckets[i].weight_coefficient >= buckets[i - 1].weight_coefficient, 'weight_coefficient monotone non-decreasing');
}
ok(buckets.every(b => b.weight_coefficient > 0 && b.weight_coefficient <= 1), 'coefficients in (0,1]');

// 2. matrix snapshot in sync with the real #05 matrix (5 S5 cells)
const snap = data.matrix_binding.v1_threshold_snapshot;
ok(snap.length === 5, 'snapshot covers 5 S5 cells');
for (const s of snap) {
  const cell = matrix.cells.find(c => c.id === s.cell);
  ok(cell && cell.dimension === 'S5', `cell ${s.cell} exists in matrix`);
  if (cell) {
    ok(cell.threshold.yellow.value === s.yellow.value && cell.threshold.red.value === s.red.value,
      `cell ${s.cell} thresholds in sync with 05-unit-matrix.json`);
  }
}

// 3. B1 saturation: every v1 threshold value >= 0.5 becomes >= 1.0 under B1 offset
const b1 = buckets.find(b => b.id === 'B1');
for (const s of snap) {
  for (const k of ['yellow', 'red']) {
    if (s[k].value >= 0.5) ok(s[k].value + b1.threshold_offset >= 1.0, `B1 saturation ${s.cell}.${k}`);
  }
}

const bucketOf = n => buckets.find(b => n >= b.human_actors.min && (b.human_actors.max === null || n <= b.human_actors.max)).id;

// 4. recompute each case from embedded evidence
let soloCases = 0;
for (const c of data.cases) {
  const tag = c.repo;
  const sum = c.identities.reduce((a, i) => a + i.count, 0);
  ok(sum === c.total_commits, `${tag}: identity counts sum to total_commits`);
  ok(c.window_commits === c.total_commits, `${tag}: all commits inside 365d window`);

  const humans = c.identities.filter(i => i.class === 'human').sort((a, b) => b.count - a.count);
  const hCount = humans.length;
  ok(hCount === c.human_actor_count, `${tag}: human_actor_count recomputed (${hCount})`);
  const humanTotal = humans.reduce((a, i) => a + i.count, 0);
  const aiCount = c.identities.filter(i => i.class === 'ai_agent').reduce((a, i) => a + i.count, 0);
  ok(near(aiCount / c.total_commits, c.ai_commit_share), `${tag}: ai_commit_share recomputed`);

  ok(bucketOf(hCount) === c.naive_bucket, `${tag}: naive bucket from human count`);

  const top = humans[0].count / humanTotal;
  const second = humans.length > 1 ? humans[1].count / humanTotal : 0;
  const override = hCount >= 2 && top >= 0.90 && second < 0.05;
  ok(override === c.structural_solo.applied, `${tag}: structural_solo.applied recomputed`);
  ok(near(top, c.structural_solo.top_actor_share), `${tag}: top_human_share recomputed`);
  ok((override ? 'B1' : c.naive_bucket) === c.final_bucket, `${tag}: final bucket = override ? B1 : naive`);

  const share = c.modules.filter(m => m.top_share >= 0.8).length / c.modules.length;
  ok(near(share, c.single_author_module_share), `${tag}: single_author_module_share recomputed`);

  const g1 = c.final_bucket === 'B1' && !c.codeowners_present && (c.human_reviewers === null || c.human_reviewers <= 1);
  const g2 = c.window_commits < 30;
  const g3 = c.ai_commit_share >= 0.50 && c.human_actor_count <= 1;
  const gates = [g1 && 'G1_NO_OWNERSHIP_ARTIFACT', g2 && 'G2_SAMPLE_TOO_SMALL', g3 && 'G3_AI_LABOR_MAJORITY'].filter(Boolean);
  ok(JSON.stringify(gates) === JSON.stringify(c.gates_triggered), `${tag}: gates recomputed [${gates.join(',')}]`);

  if (gates.length) {
    ok(c.expected.status === 'insufficient' && c.expected.verdict === 'insufficient_signal', `${tag}: insufficient expected`);
    ok(c.expected.aggregate_renormalization === 'drop_s5', `${tag}: drop_s5`);
  } else {
    ok(c.expected.status === 'sufficient' && c.expected.aggregate_renormalization === 'none', `${tag}: sufficient expected`);
  }
  if (c.final_bucket === 'B1') soloCases++;
}

// 5. at least 2 real solo-repo cases verified
ok(data.cases.length >= 2, 'at least 2 real cases');
ok(soloCases >= 2, `at least 2 solo (B1) cases (got ${soloCases})`);

// 6. template field block completeness
const f = data.report_template_field;
ok(f.block === 's5_signal_assessment', 'template block name');
const required = ['status', 'bucket_id', 'human_actor_count', 'actor_count_confidence', 'window', 'identity_summary',
  'ai_commit_share', 'structural_solo', 'downweight', 'reason_codes', 'verdict', 'aggregate_renormalization', 'rule_version'];
for (const r of required) ok(f.fields.some(x => x.name === r && x.required === true), `template field ${r} required`);
const statusField = f.fields.find(x => x.name === 'status');
ok(statusField && statusField.values.includes('insufficient') && statusField.values.includes('sufficient'), 'status enum');

if (fails.length) {
  console.log('FAIL: ' + fails.length + ' check(s): ' + fails.join('; '));
  process.exit(1);
}
console.log(`PASS: buckets contiguous+monotone (4); matrix snapshot in sync (5 S5 cells); B1 saturation OK; ${data.cases.length}/${data.cases.length} cases recomputed (identities, override, gates, module share); ${soloCases} solo real cases; template schema complete`);
