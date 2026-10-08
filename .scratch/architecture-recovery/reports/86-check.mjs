// 86-check.mjs —— #87 structure 摘帽接入守卫（D-205②③ / ADR-0013 预声明先行走 2026-10-03-r57-t1-predecl.md §4）
// 断言面：A 枚举↔常量块互等（SEMANTIC_DOMAIN_LABELS dist 常量 ↔ CONTEXT「语义域」词条——71-check B1 同型对账）
//   → B facts 层 golden 闸（6F 自审实跑产物：同源引用互等＋opposing 谓词成对——单指标禁孤立入维）
//   → C 自检组（正负对照命中方向跑前声明：A1 异源检出红／A2 孤面拒绝红／A3 常量漂移检出红；负对照全绿）
// 纪律：机检闸只判 facts 层关系谓词不判叙事矛盾（D-205 负向）；exit 0 + PASS N/N 绿。
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { need, groupProbe, engineDepsOk } from './_lib/env-contract.mjs';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——B 组级 need engine-deps:）：dev-full=完整克隆＋engine/node_modules 在位全断言面；ci-shallow=CI 浅克隆（duckdb 原生绑定缺席→B 组 SKIP）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '#87 structure 摘帽接入守卫（D-205②③）——语义域常量互等+facts 层三断言 golden 闸';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 300) : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- 谓词（facts 层关系谓词——预声明 §4.1/§4.2，自检组 C 复用） ----------
const S3_FACES = ['god-classes', 'architecture-metrics', 'dependency-cycles', 'modularity-violations', 'instability', 'architecture-roles'];
// 断言一（同源引用互等）：structure 象限 slice_fields 逐面值 == 同 run facts 重算值；异源=violations
function predSameSource(sliceFields, factsRows) {
  const v = [];
  for (const k of S3_FACES) {
    const a = sliceFields[k];
    const b = factsRows[k];
    if (a !== b) { v.push(k + ':' + a + '!=' + b); }
  }
  return v;
}
// 断言二（opposing 谓词成对）：面集要么 6/6（derived）要么 0（not_applicable）——1~5 孤面=violation
function predPairAdmission(applicability, sliceKeys) {
  const n = sliceKeys.filter(function (k) { return S3_FACES.indexOf(k) >= 0; }).length;
  if (applicability === 'derived') { return n === S3_FACES.length ? [] : ['derived-but-partial:' + n + '/6']; }
  if (applicability === 'not_applicable') { return n === 0 ? [] : ['not_applicable-but-partial:' + n + '/6']; }
  return ['unexpected-applicability:' + applicability];
}
// 断言三（枚举↔常量块互等）：域标签对逐键全等（71 同型）
function predLabelEquality(constLabels, docLabels) {
  const v = [];
  for (const k of Object.keys(constLabels)) { if (constLabels[k] !== docLabels[k]) { v.push(k + ':' + constLabels[k] + '!=' + docLabels[k]); } }
  for (const k of Object.keys(docLabels)) { if (!(k in constLabels)) { v.push('doc-extra:' + k); } }
  return v;
}

// ---------- A. 枚举↔常量块互等（71-check B1/B2 同型对账） ----------
const UMD = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'upstream-dimension-map.js')).href);
const LBL = UMD.SEMANTIC_DOMAIN_LABELS;
t('A1 dist SEMANTIC_DOMAIN_LABELS 在且两键（structure/s3）', !!LBL && LBL.structure === 'structure/shape' && LBL.s3 === 'S3/budget-attribution', JSON.stringify(LBL));
const ctxDoc = readFileSync(join(REPO, 'CONTEXT.md'), 'utf8');
const entryIdx = ctxDoc.indexOf('**语义域（Semantic Domain）**');
const entry = entryIdx >= 0 ? ctxDoc.slice(entryIdx, ctxDoc.indexOf('_Avoid_', entryIdx)) : '';
t('A2 CONTEXT 语义域词条在场（两域标签＋D-209 双枚举句）', entry.length > 0 && entry.indexOf('structure/shape') >= 0 && entry.indexOf('S3/budget-attribution') >= 0 && entry.indexOf('stale_data_marker') >= 0 && entry.indexOf('warn↔behind') >= 0 && entry.indexOf('巧合非设计') >= 0);
t('A3 断言三互等：常量↔词条标签逐键全等', predLabelEquality({ structure: LBL.structure, s3: LBL.s3 }, { structure: 'structure/shape', s3: 'S3/budget-attribution' }).length === 0 && entry.indexOf('structure/shape') >= 0 && entry.indexOf('S3/budget-attribution') >= 0);
t('A4 src 映射面含常量（measure 层进映射面——D-205① 落点纪律）', readFileSync(join(ENG, 'src', 'audit', 'upstream-dimension-map.ts'), 'utf8').indexOf('SEMANTIC_DOMAIN_LABELS') >= 0);
t('A5 本守卫自身无 BOM', noBom(join(HERE, '86-check.mjs')));

// ---------- B. facts 层 golden 闸（6F 自审实跑产物；engine-deps 组级闸） ----------
const DEPS_B = [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))];
if (groupProbe('86-check', 'B', DEPS_B)) {
  const tmpB = mkdtempSync(join(tmpdir(), '86-run-'));
  const r = spawnSync('node', [join(ENG, 'dist', 'cli.js'), 'audit', '..', '--scale', 'Macro-B', '--out', join(tmpB, 'out')], { encoding: 'utf8', cwd: ENG, timeout: 420000 });
  t('B1 CLI audit --scale Macro-B exit 0（摘帽后实跑面）', r.status === 0, 'status=' + r.status + ' err=' + (r.stderr || '').slice(0, 200));
  const side = existsSync(join(tmpB, 'out', 'report.json')) ? JSON.parse(readFileSync(join(tmpB, 'out', 'report.json'), 'utf8')) : null;
  const sq = side ? side.quadrants.filter(function (x) { return x.quadrant === 'structure'; })[0] : null;
  t('B2 structure 象限摘帽两态（codelore 在→derived+S3 维；缺席→not_applicable——数据缺席事实不因摘帽改变）', !!sq && (sq.applicability === 'derived' || sq.applicability === 'not_applicable') && (sq.applicability === 'derived' ? JSON.stringify(sq.dimensions) === JSON.stringify(['S3']) : sq.dimensions.length === 0), JSON.stringify(sq && { a: sq.applicability, d: sq.dimensions }));
  // 同源重算：同 run facts.jsonl 的 S3 面 facet_rows 逐面 row_count
  const factsRows = {};
  if (existsSync(join(tmpB, 'out', 'audit-facts.jsonl'))) {
    for (const l of readFileSync(join(tmpB, 'out', 'audit-facts.jsonl'), 'utf8').split('\n').filter(Boolean)) {
      const f = JSON.parse(l);
      if (f.metric === 'codelore.facet_rows' && S3_FACES.indexOf(f.subject_ref) >= 0) { factsRows[f.subject_ref] = JSON.parse(f.value_json).row_count; }
    }
  }
  const slice = sq ? sq.slice_fields : {};
  const sameSrc = predSameSource(slice, factsRows);
  const pair = predPairAdmission(sq ? sq.applicability : 'missing', Object.keys(slice));
  t('B3 断言一同源引用互等：slice_fields 逐面 == 同 run facts 重算', sq && sq.applicability === 'not_applicable' ? Object.keys(slice).length === 0 : sameSrc.length === 0, JSON.stringify({ sameSrc: sameSrc, slice: slice, facts: factsRows }));
  t('B4 断言二 opposing 成对准入：6/6 或 0，禁 1~5 孤面', pair.length === 0, JSON.stringify(pair));
  t('B5 摘帽措辞在场（override_reason 载 structure/shape 域标签）', !!sq && sq.applicability !== 'derived' ? sq.verdict_gate.override_reason.indexOf('D-205') >= 0 : sq.verdict_gate.override_reason.indexOf('structure/shape') >= 0 && sq.verdict_gate.override_reason.indexOf('S3/budget-attribution') >= 0, sq && sq.verdict_gate.override_reason && sq.verdict_gate.override_reason.slice(0, 80));
  t('B6 supply-chain 维持（D-206 续排——not_applicable＋数据未接）', !!side && (function () { const s = side.quadrants.filter(function (x) { return x.quadrant === 'supply_chain'; })[0]; return s && s.applicability === 'not_applicable' && s.verdict_gate.override_reason.indexOf('数据未接') >= 0; })());
  t('B7 旧 queued 措辞退役（override_reason 无 双口径风险暂缓/D-054 queued）', !!sq && sq.verdict_gate.override_reason.indexOf('双口径风险暂缓') < 0);
  try { rmSync(tmpB, { recursive: true, force: true }); } catch (e) { }
}

// ---------- C. 自检组（预声明 §4.4 命中方向——构造偏差必须红） ----------
(function () {
  const facts = { 'god-classes': 1, 'architecture-metrics': 2, 'dependency-cycles': 3, 'modularity-violations': 4, instability: 5, 'architecture-roles': 6 };
  const greenSlice = { 'god-classes': 1, 'architecture-metrics': 2, 'dependency-cycles': 3, 'modularity-violations': 4, instability: 5, 'architecture-roles': 6 };
  const redSlice = Object.assign({}, greenSlice, { 'god-classes': 99 });
  t('C1 A1 负对照：同源双算 → 0 违规（绿）', predSameSource(greenSlice, facts).length === 0);
  t('C2 A1 正对照：slice 单面值 99 vs facts 1 → 检出（红）', predSameSource(redSlice, facts).length > 0 && predSameSource(redSlice, facts)[0].indexOf('god-classes') >= 0);
  t('C3 A2 正对照：5/6 面 slice → 成对闸拒绝（红）', predPairAdmission('derived', Object.keys(greenSlice).slice(0, 5)).length > 0);
  t('C4 A2 负对照：6/6 → derived 绿；0 面 → not_applicable 绿', predPairAdmission('derived', Object.keys(greenSlice)).length === 0 && predPairAdmission('not_applicable', []).length === 0);
  t('C5 A3 正对照：常量漂移模拟 → 检出（红）', predLabelEquality({ structure: 'structure/shape', s3: 'S3/budget-x' }, { structure: 'structure/shape', s3: 'S3/budget-attribution' }).length > 0);
  t('C6 A3 负对照：现库常量↔词条 → 绿', predLabelEquality({ structure: 'structure/shape', s3: 'S3/budget-attribution' }, { structure: 'structure/shape', s3: 'S3/budget-attribution' }).length === 0);
})();

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
