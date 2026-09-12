#!/usr/bin/env node
// 01-check.mjs -- 票 #01 (A-001) 守卫脚本：校验全部交付物可机检
import fs from 'node:fs';
const R = 'D:/Aworker/6F/.scratch/architecture-recovery/reports';
const fail = [];
const ok = [];
const chk = (cond, msg) => { (cond ? ok : fail).push(msg); };
const load = (f) => JSON.parse(fs.readFileSync(R + '/' + f, 'utf8'));

const corpora = load('01-corpora.json');
const align = load('01-align.json');
const spot = load('01-spotcheck.json');
const fallback = load('01-fallback.json');

// --- D1: real repos ---
const repos = Object.keys(corpora.repos);
chk(repos.length >= 2, 'D1 real repos >= 2 (got ' + repos.length + ': ' + repos.join(',') + ')');
for (const r of repos) {
  chk(corpora.repos[r].intent.length >= 5, 'D1 ' + r + ' intent units >= 5 (got ' + corpora.repos[r].intent.length + ')');
  chk(corpora.repos[r].delivery.units.length >= 50, 'D1 ' + r + ' delivery units >= 50 (got ' + corpora.repos[r].delivery.units.length + ')');
  chk(corpora.repos[r].delivery.windows.length === 5, 'D1 ' + r + ' 5 drift windows (got ' + corpora.repos[r].delivery.windows.length + ')');
}

// --- D3: 5 sampling points per repo ---
for (const r of repos) chk(align.sampled[r].length === 5, 'D3 ' + r + ' sampled points == 5 (got ' + align.sampled[r].length + ')');

// --- D2: >= 3 embedding candidates actually run ---
const models = Object.keys(align.models);
chk(models.length >= 3, 'D2 embedding candidates run >= 3 (got ' + models.length + ': ' + models.join(',') + ')');
for (const m of models) {
  const M = align.models[m];
  chk(typeof M.pos_mean === 'number' && typeof M.neg_mean === 'number', 'D2 ' + m + ' pos/neg means present');
  chk(Array.isArray(M.calibration.sweep) && M.calibration.sweep.length >= 15, 'D2 ' + m + ' calibration sweep >= 15 rows');
  chk(M.calibration.at_0_70 !== null, 'D3 ' + m + ' calibration at 0.70 present');
  for (const r of repos) {
    chk(M.per_repo[r].rows.length === 5, 'D3 ' + m + '/' + r + ' 5 scored rows');
    chk(M.per_repo[r].rows.every((x) => x.max >= -1 && x.max <= 1), 'D3 ' + m + '/' + r + ' cosine in [-1,1]');
    chk(M.per_repo[r].rows.every((x) => x.top3.length === 3), 'D3 ' + m + '/' + r + ' top3 present');
    chk(M.drift[r].length === 5, 'D3 ' + m + '/' + r + ' 5 drift points');
  }
}

// --- D3: manual spot-check ---
const labels = Object.values(spot.labels);
chk(labels.length === 15, 'D3 spot-check labels == 15 (got ' + labels.length + ')');
chk(labels.every((l) => ['delivered', 'drift', 'absent'].includes(l.label)), 'D3 spot-check labels in enum');
chk(labels.filter((l) => l.label === 'delivered').length === 13, 'D3 13 delivered');
chk(labels.filter((l) => l.label !== 'delivered').length === 2, 'D3 2 non-delivered (absent+drift)');
for (const m of models) {
  const v = spot.per_model[m];
  chk(v && v.at_0_70 && v.best_f1, 'D3 spot-check calibration present for ' + m);
}
chk(typeof spot.per_repo_mean_excluding_title === 'object', 'D3 title-excluded means present');

// --- D4: fallback triggers ---
chk(fallback.triggers.length >= 5, 'D4 fallback triggers >= 5 (got ' + fallback.triggers.length + ')');
chk(fallback.triggers.every((t) => t.id && t.predicate && t.action && t.rationale && t.source_ref), 'D4 every trigger machine-checkable (id/predicate/action/rationale/source_ref)');
chk(typeof fallback.combination === 'string' && fallback.combination.length > 10, 'D4 combination formula present');

// --- D5: report <-> artifact consistency ---
const report = fs.readFileSync(R + '/01-report.md', 'utf8');
const allScores = [];
for (const m of Object.keys(align.models)) for (const r of Object.keys(corpora.repos)) for (const row of align.models[m].per_repo[r].rows) allScores.push(row.max.toFixed(4));
chk(allScores.every((v) => report.includes(v)), 'D5 all 45 sampled scores traceable into 01-report.md');
const bb = spot.per_model['bge-small-en-v15'];
chk(bb.at_0_70.f1 === 0.8182, 'D5 bge @0.70 F1 0.8182 matches');
chk(report.includes('13 delivered / 1 absent / 1 drift'), 'D5 report states 13/1/1 label split');
let peak = 0; let ser = 0;
for (const m of ['bge-small-en-v15', 'minilm-l6-v2']) for (const r of Object.keys(corpora.repos)) { const d = align.models[m].drift[r].map((w) => w.align); ser++; if (d[4] === Math.max(...d)) peak++; }
chk(ser === 6 && peak === 6, 'D5 drift 6/6 series peak at oldest window');
chk(report.includes('0.0252'), 'D5 me5 gap 0.0252 cited in report');
console.log('PASS: ' + ok.length + ' assertions');
if (fail.length) { console.log('FAIL: ' + fail.length); fail.forEach((f) => console.log('  x ' + f)); process.exit(1); }
console.log('checks: repos=' + repos.length + ' models=' + models.length + ' sampled/repo=5 spotcheck=15 fallback_triggers=' + fallback.triggers.length);
console.log('OK: D1 (>=2 real repos run) + D2 (>=3 embedding candidates) + D3 (5 points/repo + 0.70 calibration + manual spot-check) + D4 (fallback trigger list) + D5 (report<->artifact consistency) all verified');
