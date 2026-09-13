// 守卫：B 层判据预声明文档 + C 层裁定依据（A-023 / A-024 / A-025 / A-029；spec §R3-D4）
// 用法：node .scratch/architecture-recovery/reports/22-criteria-check.mjs
// 约定：零新增依赖；数字一律程序化派生自 22-threshold-raw.json 与 detectors，禁止手工转录（per #16 教训④）

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const NL = String.fromCharCode(10);
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const DOC = join(HERE, '22-criteria-pre-registration.md');
const CDOC = join(HERE, '22-c-adjudication-basis.md');
const RAW = join(HERE, '22-threshold-raw.json');
const MAPJSON = join(HERE, '21-collectors.json');
const PROBE = join(HERE, '22-threshold-probe.mjs');
const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

// ---- G1 三件套存在且非空 ----
[['G1a', DOC], ['G1b', CDOC], ['G1c', RAW]].forEach(function (e) {
  const ok = existsSync(e[1]) && Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') > 200;
  check(e[0], ok, e[1].split('reports')[1] + ' bytes=' + (existsSync(e[1]) ? Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') : 0));
});

const doc = readFileSync(DOC, 'utf8');
const cdoc = readFileSync(CDOC, 'utf8');
const raw = JSON.parse(readFileSync(RAW, 'utf8'));
const map = JSON.parse(readFileSync(MAPJSON, 'utf8'));
const C = await import(pathToFileURL(COLLECT_TS).href);

// ---- G2 六个判据 ID 齐备 ----
const IDS = ['PC-1', 'PC-2', 'TC-1', 'TC-2', 'TC-3', 'NC-1'];
const missIds = IDS.filter(function (i) { return doc.indexOf(i) < 0; });
check('G2', missIds.length === 0, 'missing=' + JSON.stringify(missIds));

// ---- G3 阈值字面与探针常量一致（程序化派生，禁手工转录）----
const TH = raw.pre_registered_thresholds;
const expectLits = [
  String(TH.lag_days_red),
  TH.lag_ratio_red.toFixed(2),
  String(TH.min_judgeable),
  TH.five_piece_mean_red.toFixed(2),
  TH.field_missing_ratio_red.toFixed(2),
  TH.coverage_red.toFixed(2),
  TH.coverage_amber.toFixed(2)
];
const missTh = expectLits.filter(function (s) { return doc.indexOf(s) < 0; });
check('G3', missTh.length === 0, 'thresholds=' + JSON.stringify(expectLits) + ' missing=' + JSON.stringify(missTh));

// ---- G4 实测数字与原始数一致 ----
const tc2 = raw.tc2_s2b_five_piece;
const tc3 = raw.tc3_s1_coverage;
const tc1 = raw.tc1_s2a_backdating;
const pct = function (x) { return (x * 100).toFixed(2) + '%'; };
const expectNums = [
  tc2.mean_ratio.toFixed(4),
  pct(tc1.adr_dated_ratio),
  pct(tc2.missing_field_ratio.Status),
  raw.pre_registered_outcome.tc3_worst_ratio.toFixed(4),
  String(tc1.judgeable_rows)
];
const missNum = expectNums.filter(function (s) { return doc.indexOf(s) < 0; });
check('G4', missNum.length === 0, 'nums=' + JSON.stringify(expectNums) + ' missing=' + JSON.stringify(missNum));

// ---- G5 判据→族映射：collectors.ts 与 21-collectors.json 逐条比对（不同族即停票）----
const tsBinding = C.DETECTOR_BINDING;
const jsonBinding = map.detector_binding;
check('G5a', tsBinding.length === jsonBinding.length, 'ts=' + tsBinding.length + ' json=' + jsonBinding.length);
// 归一化：TS 侧 families[]（首项=主族，其后=交叉族）；JSON 侧 primary_family + cross_family
function famArray(e) {
  const a = [];
  const base = (e.families && e.families.length > 0) ? e.families : (e.primary_family ? [e.primary_family] : []);
  base.forEach(function (x) { if (a.indexOf(x) < 0) { a.push(x); } });
  (e.cross_family || []).forEach(function (x) { if (a.indexOf(x) < 0) { a.push(x); } });
  return a;
}
const drift = [];
jsonBinding.forEach(function (j) {
  const t = tsBinding.filter(function (x) { return x.criterion === j.criterion; })[0];
  if (!t) { drift.push(j.criterion + ':missing-in-ts'); return; }
  if (j.type !== t.type) { drift.push(j.criterion + ':type ' + j.type + ' vs ' + t.type); }
  const jf = famArray(j).join('+');
  const tf = famArray(t).join('+');
  if (jf !== tf) { drift.push(j.criterion + ':family ' + jf + ' vs ' + tf); }
  const jc = j.same_family_control === undefined ? null : j.same_family_control;
  const tcx = t.same_family_control === undefined ? null : t.same_family_control;
  if (String(jc) !== String(tcx)) { drift.push(j.criterion + ':control ' + jc + ' vs ' + tcx); }
});
check('G5b', drift.length === 0, 'drift=' + JSON.stringify(drift));

// ---- G6 配比 2 正对照 + 3 真判据 + 1 负对照 ----
const countBy = function (arr, key) {
  const o = {};
  arr.forEach(function (x) { o[x[key]] = (o[x[key]] || 0) + 1; });
  return o;
};
const tc = countBy(jsonBinding, 'type');
check('G6', tc.positive_control === 2 && tc.true_criterion === 3 && tc.negative_control === 1,
  'positive=' + tc.positive_control + ' true=' + tc.true_criterion + ' negative=' + tc.negative_control);

// ---- G7 负对照三条件 + 复核路径齐备（A-024）----
const ncTokens = ['N-a', 'N-b', 'N-c', '复核路径', '不自动定罪', '备份选材'];
const missNc = ncTokens.filter(function (t) { return doc.indexOf(t) < 0; });
check('G7', missNc.length === 0, 'missing=' + JSON.stringify(missNc));

// ---- G8 引用可回查：三个条款位字面齐备 ----
const CITES = ['1.5 Assay Sensitivity', '1.3.4 Active (Positive) Concurrent Control', '9.4 z scores', '9 Calculation of performance statistics'];
const missCite = CITES.filter(function (t) { return doc.indexOf(t) < 0; });
check('G8', missCite.length === 0, 'missing=' + JSON.stringify(missCite));

// ---- G9 闸门顺序段存在（成稿 → 审阅 → commit → 首报）----
const GATE = ['闸门顺序', '用户审阅', 'commit', '票 23'];
const missGate = GATE.filter(function (t) { return doc.indexOf(t) < 0; });
check('G9', missGate.length === 0, 'missing=' + JSON.stringify(missGate));

// ---- G10 跑后禁调声明存在 ----
check('G10', doc.indexOf('跑后禁调') >= 0 && doc.indexOf('跑后改数') >= 0, 'hasFrozenClause=' + (doc.indexOf('跑后禁调') >= 0));

// ---- G11 预声明预期结果与程序化重算一致（防事后调节）----
const OUT = raw.pre_registered_outcome;
const rows = doc.split(NL);
const verdictPair = [['TC-1', OUT.tc1], ['TC-2', OUT.tc2], ['TC-3', OUT.tc3]];
const bad = [];
verdictPair.forEach(function (p) {
  const line = rows.filter(function (r) { return r.indexOf('| ' + p[0] + ' |') === 0; })[0];
  if (!line) { bad.push(p[0] + ':row-missing'); return; }
  if (line.indexOf(p[1]) < 0) { bad.push(p[0] + ':expect ' + p[1] + ' not in row'); }
});
check('G11', bad.length === 0, 'recomputed=' + JSON.stringify(verdictPair) + ' bad=' + JSON.stringify(bad));

// ---- G12 C 层三档齐备 ----
const TIERS = ['supported', 'unsupported', 'insufficient'];
const missTier = TIERS.filter(function (t) { return cdoc.indexOf(t) < 0; });
check('G12', missTier.length === 0, 'missing=' + JSON.stringify(missTier));

// ---- G13 C 层对抗性清单 8 条 ----
const missAdv = [];
for (let i = 1; i <= 8; i++) { if (cdoc.indexOf('| A' + i + ' |') < 0) { missAdv.push('A' + i); } }
check('G13', missAdv.length === 0, 'missing=' + JSON.stringify(missAdv));

// ---- G14 C 层锚定 B 产物 + 回写要求 ----
check('G14', cdoc.indexOf('锚定 B 产物') >= 0 && cdoc.indexOf('回写') >= 0 && cdoc.indexOf('decision-ledger.md') >= 0, 'hasAnchorAndWriteback=true');

// ---- G15 原始数时间戳存在且探针确定性（无 Date.now / Math.random）----
const probeSrc = readFileSync(PROBE, 'utf8');
const nondet = ['Date.now(', 'Math.random('].filter(function (t) { return probeSrc.indexOf(t) >= 0; });
check('G15', typeof raw.observed_at === 'string' && raw.observed_at.length > 0 && nondet.length === 0,
  'observedAt=' + raw.observed_at + ' nondeterministic=' + JSON.stringify(nondet));

// ---- G16 浅克隆污染排除（per W2 #02 教训）----
check('G16', raw.meta && raw.meta.is_shallow !== true && raw.meta.commitCount > 0,
  'shallow=' + (raw.meta ? raw.meta.isShallow : 'n/a') + ' commits=' + (raw.meta ? raw.meta.commitCount : 'n/a'));

let ok = true;
results.forEach(function (r) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + ' :: ' + r[2]);
  if (!r[1]) { ok = false; }
});
const passed = results.filter(function (r) { return r[1]; }).length;
console.log(ok ? ('GUARD-PASS ' + passed + '/' + results.length) : ('GUARD-FAIL ' + passed + '/' + results.length));
process.exitCode = ok ? 0 : 1;
