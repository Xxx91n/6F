// #33 T7 挂门机检化守卫 —— 全挂门项三字段（最迟拍板时点/触发事件/复审时点）扫描 + 到期/触发报警
// 输入四族：① 25-rollout-checklist 挂门行 ② 30-desk-calibration 两字段占位 ③ CodeLore 暂缓面集(D-035④) ④ 多写者三触发器(D-034④)
// A-053/#33-ext 扩展（D-041③＋round8-35-audit W6 补洞）：
//   D 组 watch 三态 schema——event_bound（默认，须事件锚）/manual_watch（五要素：标记+责任人 owner+复审时点
//      review_at·review_event 机读锚+验证方法 verify_method+确认留痕 confirmations[]）/risk_accepted（acceptor+reason+expires_at）
//   ＋事件引用 fail-closed（trigger_event/deadline_event/review_event 悬空=FAIL，堵 fail-open 静默跳过）
//   ＋confirmations 留痕四字段（at 时间戳/by 判定人/criterion_version 判据版本/reason 理由；evidence 缺→WARN）
//   E 组 manual_watch 值守——复审逾期→ALARM＋RISK-ACCEPTED-CANDIDATE 候选名单（翻转权属人工裁决，守卫不改 status）；
//      确认记录缺失→WARN（D-041③ 缺口显式可见）；每运行输出 COVERAGE event_bound/total 覆盖率
// 用法：node 33-check.mjs → 打印 PASS/FAIL/ALARM/WARN/RISK-ACCEPTED-CANDIDATE；exit 0 = 结构完整（报警为值守输出），exit 1 = 结构缺漏
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
const d35 = macroLedger.split('\n').filter(l => l.includes('D-035') || l.includes('D-045')).join('\n'); // B3 回查源=D-035④＋D-045（D-045 增补 3 面裁决；账本记录不改写故双源）
if (!faceItem) {
  t('B3 暂缓面集可回查 D-035④∥D-045 原文', false, 'registry item codelore-deferred-faces missing');
} else {
  const missingFaces = (faceItem.faces || []).filter(f => {
    const stem = f.replace('*', '');
    return !d35.includes(stem);
  });
  t('B3 暂缓面集 ' + faceItem.faces.length + ' 面可回查 D-035④∥D-045 原文', missingFaces.length === 0, missingFaces.join(','));
}

// B4: 多写者三触发器在位
const mwIds = ['mw-trigger-a', 'mw-trigger-b', 'mw-trigger-c'];
t('B4 多写者三触发器全登记', mwIds.every(id => regIds.has(id)));

// B5: 登记表内无指向不存在源的孤儿（family checklist-25 须与源行 id 一致）
const orphans = reg.items.filter(i => i.family === 'checklist-25' && i.status !== 'decided' && !gatedRows.includes(i.id.replace('25-', ''))).map(i => i.id);
t('B5 登记表无孤儿（checklist-25 族逐项有源行）', orphans.length === 0, orphans.join(','));

// --- D. watch 三态 schema 齐备化（A-053 / D-041③ / W6 fail-closed 补洞） ---
const WATCH_ENUM = ['event_bound', 'manual_watch', 'risk_accepted'];
const watchOf = i => i.watch || 'event_bound'; // event_bound=默认态（watch 字段缺省视同）
const badWatch = reg.items.filter(i => !WATCH_ENUM.includes(watchOf(i))).map(i => i.id);
t('D1 watch 三态枚举合法（event_bound 默认/manual_watch/risk_accepted）', badWatch.length === 0, badWatch.join(','));

// D2 manual_watch 五要素：标记(watch 值本身)+责任人(owner)+复审时点(review_at prose+review_event 机读锚)+验证方法(verify_method)+确认留痕(confirmations 数组)
const mwItems = reg.items.filter(i => watchOf(i) === 'manual_watch');
const mwMissing = [];
for (const it of mwItems) {
  const miss = [];
  if (!it.owner) miss.push('owner');
  if (!it.review_at) miss.push('review_at');
  if (!it.review_event) miss.push('review_event');
  if (!it.verify_method) miss.push('verify_method');
  if (!Array.isArray(it.confirmations)) miss.push('confirmations');
  if (miss.length) mwMissing.push(it.id + ':' + miss.join('+'));
}
t('D2 manual_watch 五要素齐备（' + mwItems.length + ' 项：标记/责任人/复审时点/验证方法/确认留痕）', mwMissing.length === 0, mwMissing.join(','));

// D3 risk_accepted 三要素：接受人+理由+到期日（翻转权属人工裁决，守卫不改 status）
const raItems = reg.items.filter(i => watchOf(i) === 'risk_accepted');
const raMissing = [];
for (const it of raItems) {
  const miss = [];
  if (!it.acceptor) miss.push('acceptor');
  if (!it.reason) miss.push('reason');
  if (!it.expires_at) miss.push('expires_at');
  if (miss.length) raMissing.push(it.id + ':' + miss.join('+'));
}
t('D3 risk_accepted 三要素齐备（' + raItems.length + ' 项：接受人/理由/到期日）', raMissing.length === 0, raMissing.join(','));

// D4 事件引用 fail-closed：trigger_event/deadline_event/review_event 悬空=FAIL（W6：原 it.trigger_event && reg.events[...] 静默跳过）
const eventRefs = [];
for (const it of reg.items) {
  for (const k of ['trigger_event', 'deadline_event', 'review_event']) {
    for (const ev of [].concat(it[k] || [])) eventRefs.push({ id: it.id, k, ev });
  }
}
const dangling = eventRefs.filter(r => !reg.events[r.ev]).map(r => r.id + '.' + r.k + '=' + r.ev);
t('D4 事件引用 fail-closed（' + eventRefs.length + ' 处引用全可解析 reg.events）', dangling.length === 0, dangling.join(','));

// D5 event_bound 项至少一事件锚（无锚项须落 manual_watch——不可绑入 manual_watch 的补绑序见 D-041②）
const ebUnbound = reg.items.filter(i => watchOf(i) === 'event_bound' && !i.trigger_event && !i.deadline_event).map(i => i.id);
t('D5 event_bound 项均有事件锚（trigger_event 或 deadline_event）', ebUnbound.length === 0, ebUnbound.join(','));

// D6 confirmations 留痕结构：判据版本 criterion_version/判定人 by/理由 reason/时间戳 at；evidence 缺→WARN
const CONF_REQ = ['at', 'by', 'criterion_version', 'reason'];
const confBad = [], confNoEvidence = [];
let confTotal = 0;
for (const it of reg.items) {
  for (const c of (it.confirmations || [])) {
    confTotal++;
    const miss = CONF_REQ.filter(f => !c[f]);
    if (miss.length) confBad.push(it.id + ':' + miss.join('+'));
    if (!c.evidence) confNoEvidence.push(it.id);
  }
}
t('D6 confirmations 留痕四字段齐备（判据版本/判定人/理由/时间戳，' + confTotal + ' 条）', confBad.length === 0, confBad.join(','));
if (confNoEvidence.length) warns.push('confirmations 缺 evidence 锚：' + confNoEvidence.join(','));

// D7 BOM（写入纪律：禁 BOM）
const noBom = fp => { const b = fs.readFileSync(fp); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); };
t('D7 登记表与守卫脚本无 BOM', noBom(join(here, '33-gate-registry.json')) && noBom(join(here, '33-check.mjs')));

// --- C. 到期/触发判定 ---
for (const it of reg.items) {
  if (it.status === 'decided' || it.status === 'triggered-bound') continue;
  const trig = it.trigger_event && reg.events[it.trigger_event];
  const dl = it.deadline_event && reg.events[it.deadline_event];
  if (trig && trig.occurred) alarms.push(it.id + ' 触发已发生未拍（' + it.trigger + '）→ 1 工作日内升级');
  if (dl && dl.occurred) alarms.push(it.id + ' 最迟时点已过未拍（' + it.deadline + '）→ 重组改绑一次或升级用户');
  if ((trig && trig.in_progress) || (dl && dl.in_progress)) warns.push(it.id + ' 事件进行中（' + (it.deadline || it.trigger) + '）');
}

// --- E. manual_watch 值守扫描：复审逾期 or 确认记录缺失（A-053 / D-041③） ---
// 复审逾期（review_event 任一 occurred）→ ALARM＋RISK-ACCEPTED-CANDIDATE 候选名单——翻转权属人工裁决，守卫不自动改 status；
// 确认记录缺失（confirmations 空）→ WARN——覆盖率缺口显式可见不隐性（D-041 注记）
const riskAcceptedCandidates = [];
let mwScanned = 0;
for (const it of mwItems) {
  if (it.status === 'decided') continue;
  mwScanned++;
  const revEvents = [].concat(it.review_event || []);
  const fired = revEvents.filter(e => reg.events[e] && reg.events[e].occurred);
  const inProg = revEvents.filter(e => reg.events[e] && reg.events[e].in_progress);
  if (fired.length) {
    alarms.push(it.id + ' manual_watch 复审逾期（review_event ' + fired.join('/') + ' 已 occurred，确认留痕 ' + (it.confirmations || []).length + ' 条）→ risk_accepted 候选转人工裁决');
    riskAcceptedCandidates.push(it.id);
  } else {
    if (inProg.length) warns.push(it.id + ' manual_watch 复审窗口进行中（review_event ' + inProg.join('/') + '）');
    if (!(it.confirmations || []).length) warns.push(it.id + ' manual_watch 确认记录缺失（复审时点未至，confirmations 空）');
  }
}
const mwExpected = mwItems.filter(i => i.status !== 'decided').length;
t('E1 manual_watch 值守扫描全覆盖（pending/deferred/triggered-bound 入扫）', mwScanned === mwExpected, mwScanned + '/' + mwExpected);

// --- G. #63/D-071 stale-assertions.json 元校验（直接 enforce——纯结构校验确定性，D-068⑥ 同构） ---
// 悬空条目=FAIL／evidence 指针存在性=FAIL／条目数>cap=FAIL／复审锚逾期未动→WARN 报警（D-041 risk_accepted 候选同构）
const saPath = join(here, 'stale-assertions.json');
let sa = null;
try { sa = JSON.parse(fs.readFileSync(saPath, 'utf8')); } catch (e) { sa = null; }
t('G1 stale-assertions.json 在且 version/cap=10/entries≤cap（条目数>cap→FAIL 立票批量处置）',
  !!sa && sa.version === 1 && sa.cap === 10 && Array.isArray(sa.entries) && sa.entries.length <= sa.cap,
  sa ? 'entries=' + sa.entries.length + '/' + sa.cap : 'missing/parse-fail');
const saEntries = sa && Array.isArray(sa.entries) ? sa.entries : [];
const saFields = ['id', 'guard', 'assertion-slug', 'attribution', 'failure_class', 'evidence', 'review_anchor', 'expires_fallback', 'superseded_by', 'added'];
const saFieldMiss = saEntries.filter(e => !saFields.every(f => f in e)).map(e => e.id);
const saIdBad = saEntries.filter(e => e.id !== 'xfail-' + e.guard + '-' + String(e['assertion-slug'] || '').toLowerCase()).map(e => e.id);
const saDup = saEntries.map(e => e.id).filter((v, i, a) => a.indexOf(v) !== i);
t('G2 条目十字段齐备＋id=xfail-<guard>-<slug> 形＋无重复', saFieldMiss.length === 0 && saIdBad.length === 0 && saDup.length === 0, saFieldMiss.concat(saIdBad, saDup).join(','));
const saDangling = [];
for (const e of saEntries) {
  const gp = join(here, e.guard + '-check.mjs');
  if (!fs.existsSync(gp)) { saDangling.push(e.id + ':guard-missing'); continue; }
  const src = fs.readFileSync(gp, 'utf8');
  if (src.indexOf("'" + e['assertion-slug'] + ' ') < 0) saDangling.push(e.id + ':' + e['assertion-slug'] + ' 不在 ' + e.guard + ' 断言名集');
}
t('G3 无悬空条目（guard 文件在＋assertion-slug 命中守卫断言名集）', saDangling.length === 0, saDangling.join(','));
const saEvMiss = saEntries.filter(e => typeof e.evidence !== 'string' || !fs.existsSync(join(here, '..', '..', '..', e.evidence))).map(e => e.id);
t('G4 evidence 指针存在（逐条 evidence 路径可解析）', saEvMiss.length === 0, saEvMiss.join(','));
const _td33 = new Date();
const TODAY33 = _td33.getFullYear() + '-' + String(_td33.getMonth() + 1).padStart(2, '0') + '-' + String(_td33.getDate()).padStart(2, '0');
const saOverdue = saEntries.filter(e => typeof e.expires_fallback === 'string' && e.expires_fallback < TODAY33).map(e => e.id);
if (saOverdue.length) warns.push('stale-assertions 复审锚逾期未动（expires_fallback<' + TODAY33 + '）：' + saOverdue.join(',') + ' → risk_accepted 候选同构转人工裁决（D-041③ 同构）');

console.log('--- 值守快照 ---');
alarms.forEach(a => console.log('ALARM ' + a));
warns.forEach(w => console.log('WARN  ' + w));
const bound = reg.items.filter(i => i.bound_to);
bound.forEach(b => console.log('BOUND ' + b.id + ' → ' + (b.bound_to || '')));
riskAcceptedCandidates.forEach(id => console.log('RISK-ACCEPTED-CANDIDATE ' + id + ' → 复审逾期：转 risk_accepted 须人工裁决（acceptor+reason+expires_at），守卫不自动翻转 status'));
console.log('---');
const ebCount = reg.items.filter(i => watchOf(i) === 'event_bound').length;
console.log('COVERAGE event_bound ' + ebCount + '/' + reg.items.length + ' items（manual_watch ' + mwItems.length + ' / risk_accepted ' + raItems.length + '）');
console.log('登记 ' + reg.items.length + ' 项 / 事件 ' + Object.keys(reg.events).length + ' 个 / ALARM ' + alarms.length + ' / WARN ' + warns.length + ' / RISK-ACCEPTED-CANDIDATE ' + riskAcceptedCandidates.length);
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
