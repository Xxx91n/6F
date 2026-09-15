// #35 守卫——首批 30 面契约化对账 + 暂缓面集两字段核对 + 引擎不回归
// 用法：node 35-check.mjs → 逐条 PASS/FAIL；exit 0 = 全 PASS，exit 1 = 有 FAIL
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const AR = join(here, '..');
const ROOT = join(AR, '..', '..');
const MA = join(ROOT, '.scratch', 'macro-audit');
const FX = join(ROOT, 'engine', 'test', 'fixtures', 'codelore', 'batch1');
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// --- A. 实物枚举存档 + 首批对账 ---
const help = fs.readFileSync(join(here, '35-analyze-help.txt'), 'utf8');
const recon = JSON.parse(fs.readFileSync(join(here, '35-facet-reconciliation.json'), 'utf8'));
t('A1 analyze --help 存档含 possible values', /possible values:/.test(help), 'bytes=' + Buffer.byteLength(help));
t('A2 实物枚举 >=56 面', recon.enum_count >= 56, 'enum=' + recon.enum_count);
t('A3 首批 30 面名 100% 命中实物枚举、零差异', recon.batch1.matched === 30 && recon.batch1.total_spec === 30 && recon.batch1.diffs.length === 0, 'matched=' + recon.batch1.matched + '/' + recon.batch1.total_spec);
const EXPECTED_RESIDUAL = ['architecture-violations', 'defect-validation', 'entity-effort', 'finding-hotspot-overlap'];
const actualResidual = (recon.unregistered_residual || []).slice().sort();
t('A4 残余 4 面显式登记（未纳入暂缓面集，留收口裁决）', JSON.stringify(actualResidual) === JSON.stringify(EXPECTED_RESIDUAL.slice().sort()), actualResidual.join(','));

// --- B. 逐面 golden cassette + manifest 一致 ---
const manifest = JSON.parse(fs.readFileSync(join(FX, 'manifest.json'), 'utf8'));
const fnames = Object.keys(manifest.facets);
t('B1 manifest 面数=30', fnames.length === 30, fnames.length + '');
const bad = [];
for (const [name, spec] of Object.entries(manifest.facets)) {
  const fp = join(FX, spec.file);
  if (!fs.existsSync(fp)) { bad.push(name + ':cassette-missing'); continue; }
  const raw = fs.readFileSync(fp, 'utf8');
  if (sha256(raw) !== spec.sha256) bad.push(name + ':sha256-drift');
  let rows;
  try { rows = JSON.parse(raw); } catch (e) { bad.push(name + ':cassette-unparseable'); continue; }
  if (rows.length !== spec.row_count) bad.push(name + ':row_count-drift');
  if (spec.row_count > 0 && JSON.stringify(Object.keys(rows[0])) !== JSON.stringify(spec.columns)) bad.push(name + ':columns-drift');
  if (spec.row_count === 0 && !(spec.columns_source === 'csv-header' && spec.columns.length > 0)) bad.push(name + ':empty-no-col-contract');
}
t('B2 30 面 cassette sha256/行数/列契约全钉死', bad.length === 0, bad.join(','));
const grp = { evolution: 0, s3: 0, s5: 0 };
for (const k of fnames) grp[manifest.facets[k].group]++;
t('B3 族划分 12+6+12', grp.evolution === 12 && grp.s3 === 6 && grp.s5 === 12, JSON.stringify(grp));

// --- C. 适配层纪律（ADR-0014） ---
const src = fs.readFileSync(join(ROOT, 'engine', 'src', 'upstream', 'codelore.ts'), 'utf8');
t('C1 pin 0.28.0 + binary-discovery 不变', src.includes("CODELORE_PINNED_VERSION = '0.28.0'") && src.includes('binary-discovery'), '');
t('C2 适配层有进程调用且零业务规则词', /spawnSync/.test(src) && !/threshold|verdict|RED|score_band/.test(src), '');
t('C3 契约表/解析器/采集器三出口齐备', src.includes('CODELORE_BATCH1_FACETS') && src.includes('parseJsonRows') && src.includes('collectCodeloreFacets'), '');
const dist = fs.readFileSync(join(ROOT, 'engine', 'dist', 'upstream', 'codelore.js'), 'utf8');
t('C4 dist 编译产物含首批面出口', dist.includes('CODELORE_BATCH1_FACETS') && dist.includes('collectCodeloreFacets'), '');

// --- D. 暂缓面集两字段登记核对（衔接 #33 guard 输入③） ---
const reg = JSON.parse(fs.readFileSync(join(here, '33-gate-registry.json'), 'utf8'));
const faceItem = reg.items.find((i) => i.id === 'codelore-deferred-faces');
t('D1 暂缓面集 registry 项在位', !!faceItem, '');
if (faceItem) {
  t('D2 两字段齐备（满足判据 deadline + 复审时点 review_at）', !!faceItem.deadline && !!faceItem.review_at, (faceItem.deadline || '').slice(0, 40));
  t('D3 watch=manual_watch + confirmations 字段在', faceItem.watch === 'manual_watch' && Array.isArray(faceItem.confirmations), '');
  const d35 = (fs.readFileSync(join(MA, 'decision-ledger.md'), 'utf8').split('\n').find((l) => l.startsWith('| D-035 |')) || '');
  const missingFaces = (faceItem.faces || []).filter((f) => !d35.includes(f.replace('*', '')));
  t('D4 暂缓面 ' + (faceItem.faces || []).length + ' 面可回查 D-035④ 原文', missingFaces.length === 0, missingFaces.join(','));
  const enumSet = new Set(recon.enum);
  const unresolvable = (faceItem.faces || []).filter((f) => {
    if (f === 'function-*') return !recon.enum.some((e) => e.startsWith('function-'));
    if (f === 'metrics') return !enumSet.has('delivery-metrics');
    return !enumSet.has(f);
  });
  t('D5 暂缓面名全部可解析到实物枚举（含 function-* / metrics 速写映射）', unresolvable.length === 0, unresolvable.join(','));
}

// --- E. 探针实测产物 ---
const facts = fs.readFileSync(join(here, '35-upstream-facts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const pm = JSON.parse(fs.readFileSync(join(here, '35-probe-measurements.json'), 'utf8'));
t('E1 实测 30 面全成 facet_rows、0 错误', pm.facets_contracted === 30 && pm.facet_errors.length === 0, 'contracted=' + pm.facets_contracted);
t('E2 facts = 30 facet_rows + 1 resolution，schema v0 字段齐备', facts.length === 31 && facts.filter((f) => f.metric === 'codelore.facet_rows').length === 30 && facts.every((f) => f.fact_id && f.trace_id && f.collector_id === 'codelore-adapter@v1'), 'facts=' + facts.length);
t('E3 provenance 三要素（commit pin / spec sha / facts fingerprint）', !!(pm.provenance.commit_pin && pm.provenance.spec_version && pm.provenance.facts_fingerprint), '');

// --- F. 测试闭环接入 ---
const pkg = JSON.parse(fs.readFileSync(join(ROOT, 'engine', 'package.json'), 'utf8'));
t('F1 smoke 链接入 codelore-batch1.test.mjs（CI 三平台同跑）', pkg.scripts.smoke.includes('codelore-batch1.test.mjs'), pkg.scripts.smoke);
const testSrc = fs.readFileSync(join(ROOT, 'engine', 'test', 'codelore-batch1.test.mjs'), 'utf8');
t('F2 契约测试逐面循环覆盖（for-of manifest.facets）+ 红证用例在', testSrc.includes('Object.entries(manifest.facets)') && /shape drift/.test(testSrc), '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
