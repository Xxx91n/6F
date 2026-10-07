// 26-check.mjs — R4-01 量测审计守卫：真值表完整性 + v1 冻结集复跑一致性 + 纯文档零构建断言
// 用法: node 26-check.mjs   （退出码 0 = PASS）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import url from 'node:url';
import { spawnSync } from 'node:child_process';
import { commitsByGrep, touchedPaths, lastChangeSha } from './_lib/check-kit.mjs';
import { need, groupProbe, gitObjectNeedOk } from './_lib/env-contract.mjs';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
// D-214① consumption_forms（多形态消费方——C 组级 need git-object:）：dev-full=完整克隆全断言面；ci-shallow=CI 浅克隆（冻结对象借仓内 bundle 临时仓零写入物化，主仓零写）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = 'R4-01 量测审计守卫：真值表完整性 + v1 冻结集复跑一致性 + 纯文档零构建断言';


const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const SHA = 'fc00d458e215cc9a7a26af81626dec8712622821';
let pass = 0, fail = 0;
const ok = (cond, label) => { if (cond) { pass++; } else { fail++; console.log('FAIL:', label); } };

// ---- A. golden set 结构完整性 ----
const j = JSON.parse(fs.readFileSync(path.join(dir, '26-truth-table.json'), 'utf8'));
ok(Array.isArray(j.files) && j.files.length === 14, 'A1 真值表覆盖 14 份（13 冻结 + 1 post-freeze）');
const fz = j.files.filter(f => f.frozen);
ok(fz.length === 13, 'A2 冻结集恰为 13 份');
ok(j.files.find(f => f.path.endsWith('0014-upstream-integration-dual-track.md'))?.frozen === false, 'A3 0014 标记 post-freeze');
const FIVE = ['Status','Date','Context','Decision','Consequences'];
const CLASSES = ['consistent','detector-miss-form','detector-miss-inline','real-gap','post-freeze'];
let cellN = 0, badCell = 0;
for (const f of fz) {
  for (const k of FIVE) {
    const c = f.fields[k];
    if (!c || !CLASSES.includes(c.delta_class) || typeof c.truth_present !== 'boolean' || typeof c.v1_present !== 'boolean') badCell++;
    cellN++;
  }
}
ok(cellN === 65 && badCell === 0, 'A4 冻结集 65 cells 字段/分类齐备');
// v1-miss 格必须归入三类 delta 之一；hit 格必须 consistent
let badMiss = 0, badHit = 0;
for (const f of fz) for (const k of FIVE) {
  const c = f.fields[k];
  if (!c.v1_present && !['detector-miss-form','detector-miss-inline','real-gap'].includes(c.delta_class)) badMiss++;
  if (c.v1_present && c.delta_class !== 'consistent') badHit++;
}
ok(badMiss === 0, 'A5 每个 v1-miss 格已归类（漏认-form/漏认-inline/真实缺失）');
ok(badHit === 0, 'A6 每个 v1-hit 格 consistent');
// 形态归属一致性：form 误读只发生在字段行（Status），inline 误读只发生在 Date
let badMap = 0;
for (const f of fz) for (const k of FIVE) {
  const c = f.fields[k];
  if (c.delta_class === 'detector-miss-form' && k !== 'Status') badMap++;
  if (c.delta_class === 'detector-miss-inline' && k !== 'Date') badMap++;
  if (c.delta_class === 'real-gap' && c.truth_present) badMap++;
}
ok(badMap === 0, 'A7 delta 分类↔字段形态映射一致（form→Status / inline→Date / real-gap 真缺）');
// AC 登记簿完备：4 条作用于冻结集 + 1 条 post-freeze 预警
ok(Array.isArray(j.assignable_causes) && j.assignable_causes.length === 5, 'A8 可归属原因登记 5 条');

// ---- B. 聚合读数复核 ----
ok(j.aggregates.v1.mean_ratio === 0.2462, 'B1 v1 mean_ratio 复刻冻结值 0.2462');
ok(j.aggregates.truth.mean_ratio === 0.4923, 'B2 真值 mean_ratio = 0.4923');
ok(JSON.stringify(j.aggregates.truth.missing_counts) === JSON.stringify({Status:0,Date:6,Context:9,Decision:9,Consequences:9}), 'B3 真值缺失计数 {0,6,9,9,9}');
ok(j.aggregates.truth.mean_ratio < 0.60 && j.aggregates.truth.missing_counts.Context/13 > 0.50, 'B4 真值下 RED 方向仍成立（a 腿 + b 腿三节）');

// ---- C. v1 真实代码冻结集复跑 ----
const mod = await import(url.pathToFileURL(path.join(root, 'engine/src/collect/collectors.ts')).href);
// git-object 前置（D-163②）：fc00d458 冻结集非分支祖先 clone 不携带——缺席借仓内 bundle 临时仓零写入物化
if (groupProbe('26-check', 'C', [need('git-object:' + SHA, gitObjectNeedOk(root, SHA, path.join(dir, '23-frozen-' + SHA.slice(0, 8) + '.bundle')))])) {
const docs = fz.map(f => ({ path: f.path, text: spawnSync('git', ['show', SHA + ':' + f.path], { cwd: root, encoding: 'utf8' }).stdout }));
ok(docs.every(d => d.text && d.text.length > 0), 'C1 冻结集 13 份可由 git show 取出');
const ctx = { runId: 'r6-check', traceId: 't', repoRef: '6F@fc00d458', scale: 'Macro-B', observedAt: '2026-09-13T14:31:09+08:00' };
const facts = mod.collectAdrStructure({ documents: docs }, ctx);
const ratios = facts.filter(f => f.metric === 'adr.five_piece_completeness').map(f => JSON.parse(f.value_json).ratio);
ok(Math.abs(ratios.reduce((a,b)=>a+b,0)/ratios.length - 0.2462) < 0.0001, 'C2 v1 实跑 mean_ratio 复现 0.2462');
// 逐格比对：v1 实跑读数与真值表 v1_present 逐格一致
let cellDiff = 0;
const live = {};
for (const f of facts) {
  const v = JSON.parse(f.value_json); const fn = f.subject_ref.split('/').pop();
  live[fn] = live[fn] || {};
  if (f.metric === 'adr.header_field_present') live[fn][v.field] = v.present;
  if (f.metric === 'adr.section_present') live[fn][v.section] = v.present;
}
for (const f of fz) for (const k of FIVE) if (live[f.path.split('/').pop()][k] !== f.fields[k].v1_present) cellDiff++;
ok(cellDiff === 0, 'C3 v1 实跑与真值表 v1_present 逐格一致（65/65）');
}

// ---- D. 票面时代域断言（R37/#75批1 D-094(b) 工具时代漂移——GitButler 合成索引令 git status porcelain 现幻影 MM，永失真；钉票面 commit 集物证） ----
// R38/#75批2（r37 审计 P-5）：git log --grep + show --name-only 机件收编 _lib/check-kit.mjs（26/28/30 三份复制去重）。
const a31 = commitsByGrep(root, 'A-031');
const touched26 = touchedPaths(root, a31);
const badTouched26 = [...touched26].filter(function (p) { return p === 'engine' || p === 'docs/adr' || p.indexOf('engine/') === 0 || p.indexOf('docs/adr/') === 0; });
ok(a31.length > 0 && badTouched26.length === 0, 'D1 票面时代域：A-031 commit 集零触 docs/adr/engine（' + a31.length + ' commits/' + touched26.size + ' paths 物证）' + (badTouched26.length ? ' BAD=' + badTouched26.join(',') : ''));
const freeze23 = lastChangeSha(root, '.scratch/architecture-recovery/reports/23-measurements.json');
ok(freeze23.indexOf('e39468c9c53d') === 0, 'D2 冻结读数 23-measurements.json 最后变更钉死冻结点 e39468c（内容自冻结零改动）got ' + freeze23.slice(0, 10));
const md = fs.readFileSync(path.join(dir, '26-truth-table.md'), 'utf8');
ok(md.includes('0.4923') && md.includes('AC-26-5') && md.includes('delta 表模板'), 'D3 人读表含真值聚合 + AC 登记 + delta 模板');

console.log('\nGUARD RESULT:', fail === 0 ? 'PASS' : 'FAIL', '(' + pass + ' pass, ' + fail + ' fail)');
process.exit(fail === 0 ? 0 : 1);
