// verify-waiting-list.mjs — D-175⑦ 复验机件：等待期 allowed/deferred 清单「项级归位机查」（一次性校验件，不入守卫枚举）
// 校验① 清单文件在且每数据行归位列 ∈ {allowed,deferred}；② registry 全项逐 id 在表命中；③ 在册挂账项
//   （status≠decided）∪值守项（manual_watch/risk_accepted）零漏列；④ 归位语义一致抽查（值守项=allowed／
//   未决 event_bound=deferred——readme-ci-badge 为 (b) 清零特许豁免位）
// 用法：node verify-waiting-list.mjs → 逐项 PASS/FAIL＋VERIFY-PASS/FAIL；exit 0=归位机查过
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const LIST = join(HERE, '..', '..', 'macro-audit', 'handoffs', 'waiting-allowed-deferred.md');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
const md = fs.readFileSync(LIST, 'utf8');

let pass = 0, fail = 0;
const t = (n, ok, x = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x ? ' | ' + x : '')); ok ? pass++ : fail++; };

const rows = [];
for (const line of md.split('\n')) {
  const s = line.trim();
  if (!s.startsWith('|')) continue;
  const cells = s.split('|').map(c => c.trim()).filter(Boolean);
  if (cells.length < 4) continue;
  if (/^[-:\s|]+$/.test(s)) continue;                    // 分隔行
  if (cells[0] === '项' && cells[3] === '归位') continue; // 表头行
  rows.push({ slug: cells[0], cat: cells[1], face: cells[2], dispo: cells[3] });
}
const badRows = rows.filter(r => !['allowed', 'deferred'].includes(r.dispo)).map(r => r.slug);
t('L1 数据行归位列枚举合法（allowed|deferred，行数=' + rows.length + '）', rows.length > 0 && badRows.length === 0, badRows.join(','));

const slugs = new Set(rows.map(r => r.slug));
const missing = reg.items.filter(i => !slugs.has(i.id)).map(i => i.id);
t('L2 registry 全项逐 id 在清单（' + reg.items.length + ' 项全命中）', missing.length === 0, missing.join(','));

const live = reg.items.filter(i => i.status !== 'decided' || i.watch === 'manual_watch' || i.watch === 'risk_accepted');
const liveMissing = live.filter(i => !slugs.has(i.id)).map(i => i.id);
t('L3 挂账项∪值守项零漏列（' + live.length + ' 项）', liveMissing.length === 0, liveMissing.join(','));

const byId = Object.fromEntries(rows.map(r => [r.slug, r.dispo]));
const isWatch = i => i.watch === 'manual_watch' || i.watch === 'risk_accepted';
const misWatch = reg.items.filter(i => isWatch(i) && byId[i.id] !== 'allowed').map(i => i.id);
const misEvent = reg.items.filter(i => (!i.watch || i.watch === 'event_bound') && i.status !== 'decided' && i.id !== 'readme-ci-badge' && byId[i.id] !== 'deferred').map(i => i.id);
t('L4 值守项归位=allowed 一致（manual_watch/risk_accepted ' + reg.items.filter(isWatch).length + ' 项）', misWatch.length === 0, misWatch.join(','));
t('L5 未决 event_bound 归位=deferred 一致（readme-ci-badge=(b)清零豁免位）', misEvent.length === 0, misEvent.join(','));

console.log('rows=' + rows.length + ' registry=' + reg.items.length + ' live=' + live.length);
console.log(fail === 0 ? 'VERIFY-PASS' : 'VERIFY-FAIL');
process.exit(fail === 0 ? 0 : 1);
