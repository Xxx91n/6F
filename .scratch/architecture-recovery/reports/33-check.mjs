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

// --- H. #65/D-073+D-074 sealed↔attestation 闭包（sealed 无 attestation 行=FAIL／entries+sealed 不重复／migrated_to 强制闭包） ---
const attPath = join(here, 'acceptance-probe-attestation.jsonl');
const attRows = [], attBad = [];
if (fs.existsSync(attPath)) {
  for (const line of fs.readFileSync(attPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { attRows.push(JSON.parse(line)); } catch (e) { attBad.push('jsonl-parse:' + line.slice(0, 40)); }
  }
}
// sealed() 调用点=守卫源码 sealed('<slug>')（与头部 acceptance-probe: sealed 标记行双锚机检，D-073⑧）
const sealedSites = [];
for (const f of fs.readdirSync(here).filter(f => /-check\.mjs$/.test(f))) {
  const g = f.replace(/-check\.mjs$/, '');
  const src = fs.readFileSync(join(here, f), 'utf8');
  const headMarked = src.indexOf('acceptance-probe: sealed') >= 0;
  for (const m of src.matchAll(/sealed\('([A-Z]+\d+[a-z]?)'/g)) sealedSites.push({ guard: g, slug: m[1], headMarked });
}
const attKeys = new Set(attRows.map(r => r.guard + ':' + r['assertion-slug']));
const siteKeys = new Set(sealedSites.map(x => x.guard + ':' + x.slug));
const sealedNoAtt = sealedSites.filter(x => !attKeys.has(x.guard + ':' + x.slug)).map(x => x.guard + ':' + x.slug);
const attNoSite = attRows.filter(r => !siteKeys.has(r.guard + ':' + r['assertion-slug'])).map(r => r.id);
t('G5 sealed↔attestation 双锚闭包（sealed() 调用点=' + sealedSites.length + ' ↔ attestation 行=' + attRows.length + '；sealed 无行/行无点=FAIL）',
  fs.existsSync(attPath) && attBad.length === 0 && sealedNoAtt.length === 0 && attNoSite.length === 0,
  sealedNoAtt.concat(attNoSite, attBad).join(','));
const entryKeysG = new Set(saEntries.map(e => e.guard + ':' + e['assertion-slug']));
const overlapG = [...attKeys].filter(k => entryKeysG.has(k));
const resurrect = [];
for (const x of sealedSites) {
  const src = fs.readFileSync(join(here, x.guard + '-check.mjs'), 'utf8');
  if (new RegExp("\\bt\\('" + x.slug + "\\s").test(src)) resurrect.push(x.guard + ':' + x.slug);
}
t('G6 entries∩sealed=∅（attestation ' + attKeys.size + ' 行 vs entries ' + saEntries.length + '）＋sealed 断言无 t() 残留（复活=XPASS 信号洞）', overlapG.length === 0 && resurrect.length === 0, overlapG.concat(resurrect).join(','));
const noHead = sealedSites.filter(x => !x.headMarked).map(x => x.guard + ':' + x.slug);
const ATT_REQ = ['id', 'guard', 'assertion-slug', 'fired_at', 'last_fired_commit', 'evidence', 'disposition', 'decision', 'migrated_to'];
const attFieldMiss = attRows.filter(r => !ATT_REQ.every(k => k in r)).map(r => r.id);
const attIdBad = attRows.filter(r => r.id !== 'ap-' + r.guard + '-' + String(r['assertion-slug']).toLowerCase()).map(r => r.id);
const attEvMiss = attRows.filter(r => typeof r.evidence !== 'string' || !fs.existsSync(join(here, '..', '..', '..', r.evidence))).map(r => r.id);
const NEEDS_MIG = new Set(['sealed-live-contract-migrated', 'sealed-superseded']);
const attMigMiss = attRows.filter(r => NEEDS_MIG.has(r.disposition) && !r.migrated_to).map(r => r.id);
const attMigBad = [];
for (const r of attRows) {
  if (!r.migrated_to) continue;
  const mt = String(r.migrated_to);
  const hi = mt.indexOf('#');
  const file = hi >= 0 ? mt.slice(0, hi) : mt;
  const anchor = hi >= 0 ? mt.slice(hi + 1) : '';
  const cand = [join(here, file), join(here, '..', '..', '..', file)];
  const target = cand.find(fp => fs.existsSync(fp));
  if (!target) { attMigBad.push(r.id + ':target-missing:' + file); continue; }
  if (anchor && fs.readFileSync(target, 'utf8').indexOf("'" + anchor + ' ') < 0) attMigBad.push(r.id + ':anchor-missing:' + anchor);
}
t('G7 attestation 行字段齐备＋id=ap-<guard>-<slug>＋evidence 可解析＋migrated_to 闭包（活契约/superseded 必填且目标含锚）＋sealed 守卫头标在',
  attFieldMiss.length === 0 && attIdBad.length === 0 && attEvMiss.length === 0 && attMigMiss.length === 0 && attMigBad.length === 0 && noHead.length === 0,
  attFieldMiss.concat(attIdBad, attEvMiss, attMigMiss, attMigBad, noHead).join(','));

// --- H. D-081③ github-rest review 面激活事件一致性（registry 事件↔代码常量漂移守卫） ---
{
  const ghPath = join(AR, '..', '..', 'engine', 'src', 'upstream', 'github-rest.ts');
  const ghSrc = fs.existsSync(ghPath) ? fs.readFileSync(ghPath, 'utf8') : '';
  const plannedM = ghSrc.match(/GITHUB_REST_PLANNED_SURFACES[^=]*=\s*\[([\s\S]*?)\]/);
  const reviewsPlanned = !!(plannedM && plannedM[1].indexOf('pulls.reviews') >= 0);
  const evH = reg.events['github-rest-reviews-active'];
  const itH = reg.items.find(i => i.id === 'github-rest-review-coverage-dimension');
  t('H1 registry 事件 github-rest-reviews-active 在且值守项 github-rest-review-coverage-dimension event_bound 绑锚在',
    !!(evH && itH && itH.watch === 'event_bound' && itH.trigger_event === 'github-rest-reviews-active'),
    itH ? '' : 'item-missing');
  t('H2 事件-常量一致（pulls.reviews 移出 PLANNED_SURFACES 而事件未翻=漂移 FAIL）',
    evH ? (reviewsPlanned === !evH.occurred) : false,
    'planned=' + reviewsPlanned + ' occurred=' + (evH ? evH.occurred : 'N/A'));
  const evB = reg.events['engine-ci-main-green'];
  const itB = reg.items.find(i => i.id === 'readme-ci-badge');
  const itG = reg.items.find(i => i.id === 'readme-motion-gif');
  t('H3 门面触发双件在：readme-ci-badge→engine-ci-main-green／readme-motion-gif→listing-material-freeze（D-089⑤ 触发项不预埋）',
    !!(evB && itB && itB.watch === 'event_bound' && itB.trigger_event === 'engine-ci-main-green'
      && itG && itG.watch === 'event_bound' && itG.trigger_event === 'listing-material-freeze'),
    'badge=' + (itB ? 'ok' : 'missing') + ' gif=' + (itG ? 'ok' : 'missing') + ' event=' + (evB ? 'ok' : 'missing'));
  const rdPath = join(AR, '..', '..', 'README.md');
  const rdSrc = fs.existsSync(rdPath) ? fs.readFileSync(rdPath, 'utf8') : '';
  const ciBadgeInReadme = /shields\.io[^\s)]*(workflow|actions)|actions\/workflows\/[^\s)]*badge/i.test(rdSrc);
  t('H4 CI badge 未预埋（engine-ci-main-green 未 occurred 而 README 含 workflow/actions 徽标=违诚实徽记 FAIL）',
    evB && evB.occurred ? true : !ciBadgeInReadme,
    'occurred=' + (evB ? evB.occurred : 'N/A') + ' ciBadge=' + ciBadgeInReadme);
}

// --- I. #70/D-079 vacuity-manifest.json 元校验（G 组 stale 册同构；dangling 语义按 disposition 分——deleted→slug 必缺席） ---
const vmPath = join(here, 'vacuity-manifest.json');
let vm = null;
try { vm = JSON.parse(fs.readFileSync(vmPath, 'utf8')); } catch (e) { vm = null; }
t('I1 vacuity-manifest.json 在且 version/cap=10/entries<=cap（恒真候选独立册——vs stale 扩枚举语义二分）',
  !!vm && vm.version === 1 && vm.cap === 10 && Array.isArray(vm.entries) && vm.entries.length <= vm.cap,
  vm ? 'entries=' + vm.entries.length + '/' + vm.cap : 'missing/parse-fail');
const vmEntries = vm && Array.isArray(vm.entries) ? vm.entries : [];
const VM_FIELDS = ['id', 'guard', 'assertion-slug', 'referent-path', 'detection_evidence', 'confidence', 'zero_fail_history', 'disposition', 'decision', 'evidence', 'review_anchor', 'expires_fallback', 'added'];
const VM_DISP = ['candidate-certain', 'candidate-likely', 'vacuous-deleted', 'adjudicated-not-vacuous'];
const VM_CONF = ['certain', 'likely'];
const vmFieldMiss = vmEntries.filter(e => !VM_FIELDS.every(f => f in e)).map(e => e.id);
const vmIdBad = vmEntries.filter(e => e.id !== 'vac-' + e.guard + '-' + String(e['assertion-slug'] || '').toLowerCase()).map(e => e.id);
const vmDup = vmEntries.map(e => e.id).filter((v, i, a) => a.indexOf(v) !== i);
const vmEnumBad = vmEntries.filter(e => !VM_DISP.includes(e.disposition) || !VM_CONF.includes(e.confidence)).map(e => e.id);
t('I2 条目十三字段齐备＋id=vac-<guard>-<slug> 形＋无重复＋disposition/confidence 枚举合法', vmFieldMiss.length === 0 && vmIdBad.length === 0 && vmDup.length === 0 && vmEnumBad.length === 0, vmFieldMiss.concat(vmIdBad, vmDup, vmEnumBad).join(','));
const vmDangling = [];
for (const e of vmEntries) {
  const gp = join(here, e.guard + '-check.mjs');
  if (!fs.existsSync(gp)) { vmDangling.push(e.id + ':guard-missing'); continue; }
  const src = fs.readFileSync(gp, 'utf8');
  const hasSlug = src.indexOf("'" + e['assertion-slug'] + ' ') >= 0;
  if (e.disposition === 'vacuous-deleted' && hasSlug) vmDangling.push(e.id + ':deleted-slug-复活');
  if (e.disposition !== 'vacuous-deleted' && !hasSlug) vmDangling.push(e.id + ':' + e['assertion-slug'] + ' 不在 ' + e.guard + ' 断言名集');
}
t('I3 无悬空条目（vacuous-deleted→slug 必缺席；candidate-*→slug 必在位）', vmDangling.length === 0, vmDangling.join(','));
const vmEvMiss = vmEntries.filter(e => typeof e.evidence !== 'string' || !fs.existsSync(join(here, '..', '..', '..', e.evidence))).map(e => e.id);
t('I4 evidence 指针存在（逐条 evidence 路径可解析）', vmEvMiss.length === 0, vmEvMiss.join(','));
const vmOverdue = vmEntries.filter(e => typeof e.expires_fallback === 'string' && e.expires_fallback < TODAY33).map(e => e.id);
if (vmOverdue.length) warns.push('vacuity-manifest 复审锚逾期未动（expires_fallback<' + TODAY33 + '）：' + vmOverdue.join(',') + ' → risk_accepted 候选同构转人工裁决（D-041③ 同构）');


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
