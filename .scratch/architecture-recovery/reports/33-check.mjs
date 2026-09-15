// #33 T7 挂门机检化守卫 —— 全挂门项三字段（最迟拍板时点/触发事件/复审时点）扫描 + 到期/触发报警
// 输入四族：① 25-rollout-checklist 挂门行 ② 30-desk-calibration 两字段占位 ③ CodeLore 暂缓面集(D-035④) ④ 多写者三触发器(D-034④)
// 用法：node 33-check.mjs → 打印 PASS/FAIL/ALARM/WARN；exit 0 = 结构完整（报警为值守输出），exit 1 = 结构缺漏
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const AR = join(here, '..');
const MA = join(AR, '..', 'macro-audit');
const reg = JSON.parse(fs.readFileSync(join(here, '33-gate-registry.json'), 'utf8'));
const checklist = fs.readFileSync(join(here, '25-rollout-checklist.md'), 'utf8');
const desk = JSON.parse(fs.readFileSync(join(here, '30-desk-calibration.json'), 'utf8'));
const macroLedger = fs.readFileSync(join(MA, 'decision-ledger.md'), 'utf8');

let pass = 0, fail = 0;
const alarms = [], warns = [];
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// --- A. 登记表三字段齐备 ---
const FAMILIES = ['checklist-25', 'ledger-two-field', 'codelore-deferred', 'multi-writer'];
t('A1 四族输入全在位', FAMILIES.every(f => reg.items.some(i => i.family === f)), FAMILIES.map(f => f + '=' + reg.items.filter(i => i.family === f).length).join(' '));
const missingFields = reg.items.filter(i => !i.deadline || !i.trigger || !i.review_at || !i.status).map(i => i.id);
t('A2 逐项三字段齐备（最迟拍板时点/触发事件/复审时点）', missingFields.length === 0, missingFields.join(','));
const badStatus = reg.items.filter(i => !['pending', 'deferred', 'decided', 'triggered-bound'].includes(i.status)).map(i => i.id);
t('A3 status 枚举合法', badStatus.length === 0, badStatus.join(','));

// --- B. 源文档↔登记表对账 ---
// B1: 25-checklist 挂门行全登记
const gatedRows = [];
for (const line of checklist.split('\n')) {
  if (!line.trim().startsWith('|')) continue;
  const cells = line.split('|').map(s => s.trim()).filter(Boolean);
  if (cells.length < 2) continue;
  const id = cells[0];
  if (!/^[A-Z]+[0-9.-]*$/.test(id)) continue;
  const row = cells.join(' ');
  const gated = row.includes('挂门') || row.includes('deferred') || row.includes('最迟');
  const settled = row.includes('decided-now') || row.includes('不立项') || row.includes('关闭');
  if (gated && !settled) gatedRows.push(id);
}
const regIds = new Set(reg.items.map(i => i.id));
const unregistered = gatedRows.filter(id => !regIds.has('25-' + id));
t('B1 25-checklist 挂门行全登记（' + gatedRows.length + ' 行）', unregistered.length === 0, unregistered.join(','));

// B2: desk-calibration probe 占位两字段齐备 + 全登记
const probeItems = (desk.items || []).filter(i => i.probe);
const probeMissing = [];
for (const it of probeItems) {
  if (!it.probe.satisfaction || !it.probe.review) probeMissing.push('task' + it.task + ':两字段缺');
  if (!regIds.has('desk-task' + it.task)) probeMissing.push('task' + it.task + ':未登记');
}
t('B2 两字段占位项全登记（' + probeItems.length + ' 项）', probeMissing.length === 0, probeMissing.join(','));

// B3: CodeLore 暂缓面集——每面名在 D-035④ 账本原文中可回查
const faceItem = reg.items.find(i => i.id === 'codelore-deferred-faces');
const d35 = macroLedger.split('\n').find(l => l.includes('D-035')) || '';
if (!faceItem) {
  t('B3 暂缓面集可回查 D-035④ 原文', false, 'registry item codelore-deferred-faces missing');
} else {
  const missingFaces = (faceItem.faces || []).filter(f => {
    const stem = f.replace('*', '');
    return !d35.includes(stem);
  });
  t('B3 暂缓面集 ' + faceItem.faces.length + ' 面可回查 D-035④ 原文', missingFaces.length === 0, missingFaces.join(','));
}

// B4: 多写者三触发器在位
const mwIds = ['mw-trigger-a', 'mw-trigger-b', 'mw-trigger-c'];
t('B4 多写者三触发器全登记', mwIds.every(id => regIds.has(id)));

// B5: 登记表内无指向不存在源的孤儿（family checklist-25 须与源行 id 一致）
const orphans = reg.items.filter(i => i.family === 'checklist-25' && i.status !== 'decided' && !gatedRows.includes(i.id.replace('25-', ''))).map(i => i.id);
t('B5 登记表无孤儿（checklist-25 族逐项有源行）', orphans.length === 0, orphans.join(','));

// --- C. 到期/触发判定 ---
for (const it of reg.items) {
  if (it.status === 'decided' || it.status === 'triggered-bound') continue;
  const trig = it.trigger_event && reg.events[it.trigger_event];
  const dl = it.deadline_event && reg.events[it.deadline_event];
  if (trig && trig.occurred) alarms.push(it.id + ' 触发已发生未拍（' + it.trigger + '）→ 1 工作日内升级');
  if (dl && dl.occurred) alarms.push(it.id + ' 最迟时点已过未拍（' + it.deadline + '）→ 重组改绑一次或升级用户');
  if ((trig && trig.in_progress) || (dl && dl.in_progress)) warns.push(it.id + ' 事件进行中（' + (it.deadline || it.trigger) + '）');
}

console.log('--- 值守快照 ---');
alarms.forEach(a => console.log('ALARM ' + a));
warns.forEach(w => console.log('WARN  ' + w));
const bound = reg.items.filter(i => i.bound_to);
bound.forEach(b => console.log('BOUND ' + b.id + ' → ' + (b.bound_to || '')));
console.log('---');
console.log('登记 ' + reg.items.length + ' 项 / 事件 ' + Object.keys(reg.events).length + ' 个 / ALARM ' + alarms.length + ' / WARN ' + warns.length);
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
