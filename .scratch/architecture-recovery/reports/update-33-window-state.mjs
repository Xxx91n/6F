// update-33-window-state.mjs — D-173①③④ 兑现：stage2-launch-criteria 静默窗机读字段建制＋读数链式更正（幂等可重跑）
// ① window_state→not_started（零试点⇒窗未启动——「计时中」非合法读数，vacuous silence≠stability）
// ② window{} 五件机读字段：start_event（枚举 pilot_started/findings_all_closed/freeze_declared）／start_at／prereq_check（启动校验试点在运行）／reset_log[]（finding_id/source_class/reset_at/new_window_start）／decision_date 复合测试（open 清零∧修复部署∧窗内观察满最短时长）
// ③ R46-F1 归能力面入 reset_log 披露（source_class=capability；窗未启动不重置——分类先例在案 D-173②④）
// ④ confirmations 链式追加 window-state-corrected 确认行（六次承载静默窗读数的确认行语义悬空更正——读数链留痕不改写 D-146⑤）
// 纪律（update-72-registry.mjs 同款）：①幂等——已建制则跳过；②写后 assert-back（BOM/字段/确认行三检）；③fail-closed——验证不过即 MIGRATION-ASSERT-FAIL exit 1。
// 用法：node update-33-window-state.mjs → 写回 33-gate-registry.json 并回读断言；exit 0=齐备
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));

const ITEM_ID = 'stage2-launch-criteria';
const it = reg.items.find(i => i.id === ITEM_ID);
if (!it) { console.error('MIGRATION-ASSERT-FAIL: ' + ITEM_ID + ' missing'); process.exit(1); }
let changed = false;

if (it.window_state !== 'not_started') {
  it.window_state = 'not_started';
  changed = true;
}

if (!it.window) {
  it.window = {
    start_event: null,
    start_event_enum: ['pilot_started', 'findings_all_closed', 'freeze_declared'],
    start_at: null,
    prereq_check: 'pilot_running',
    reset_log: [],
    decision_date: { require_open_findings: 0, require_fix_deployed: true, min_observation_days: 30 }
  };
  changed = true;
}

const F1 = {
  finding_id: 'R46-F1',
  source_class: 'capability',
  reset_at: null,
  new_window_start: null,
  note: '窗未启动不重置（D-173②④）——能力面归类先例在案：证据完整性错值=capability 非 hygiene'
};
if (!it.window.reset_log.some(e => e.finding_id === 'R46-F1')) {
  it.window.reset_log.push(F1);
  changed = true;
}

const CONF = {
  at: '2026-09-29',
  by: 'R46-impl 执行批（轮47 T1，分支 r47-t1-exec）',
  criterion_version: 'D-173①~⑤',
  decision: 'window-state-corrected',
  reason: '窗读数链式更正（D-173①④兑现）：静默窗语义钉定后，前六次承载窗读数的确认行语义悬空——confs#0 registered（「四判据包+30日静默窗入册值守」登记行=窗规格入册非计时宣称）／#2 criterion-02-pass-read（「④A(a) 30日窗计时中」）／#3 layered-disposition-registered（「判据④ 30日窗计时确认」）／#4 criterion-03-ra-closed（「④30日静默窗计时中（findings封闭处置后计时起算）」）／#5 status-unchanged（「④30日静默窗计时中」）／#6 criteria-readings（「④计时中（30日静默窗未达标）」）——窗起点事件未发生（start_event∈{pilot_started,findings_all_closed,freeze_declared} 无一注册：Stage-1 charter 空集=零试点）⇒无起点锚的计时宣称=不可审计读数；判据④读数口径更正为 window_state=not_started（vacuous silence≠stability——空真不是稳定性证据）；读数链留痕不改写（D-146⑤ 勘误链二阶修正——原确认行逐字保留，本行即更正注记）。',
  evidence: 'registry 本项 window_state/window 机读字段＋decision-ledger.md D-173'
};
if (!(it.confirmations || []).some(c => c.decision === 'window-state-corrected')) {
  it.confirmations.push(CONF);
  changed = true;
}

if (changed) {
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8');
}

// --- assert-back（fail-closed） ---
const back = JSON.parse(fs.readFileSync(REG, 'utf8'));
const bit = back.items.find(i => i.id === ITEM_ID);
const hasBom = fs.readFileSync(REG)[0] === 0xEF;
const w = bit && bit.window;
const ok = !!bit && bit.window_state === 'not_started'
  && !!w && w.start_event === null
  && Array.isArray(w.start_event_enum) && w.start_event_enum.join(',') === 'pilot_started,findings_all_closed,freeze_declared'
  && w.start_at === null && w.prereq_check === 'pilot_running'
  && Array.isArray(w.reset_log) && w.reset_log.some(e => e.finding_id === 'R46-F1' && e.source_class === 'capability' && e.reset_at === null && e.new_window_start === null)
  && !!w.decision_date && w.decision_date.require_open_findings === 0 && w.decision_date.require_fix_deployed === true && w.decision_date.min_observation_days === 30
  && (bit.confirmations || []).some(c => c.decision === 'window-state-corrected' && !!c.at && !!c.by && !!c.criterion_version && !!c.reason && !!c.evidence)
  && !hasBom;
console.log('window_state=' + (bit && bit.window_state) + ' confs=' + ((bit && bit.confirmations) || []).length + ' reset_log=' + (w ? w.reset_log.length : 'N/A') + ' BOM=' + hasBom);
if (!ok) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log(changed ? 'REGISTRY-UPDATED' : 'REGISTRY-IDEMPOTENT-SKIP');
