// update-33-ci-liveness-watch.mjs — D-176③ 兑现：ci-workflow-liveness-watch manual_watch 册项落地（幂等可重跑）
// 五要件（D-155 哨兵建制）：watch=manual_watch＋owner＋review_at＋review_event=next-audit-window＋verify_method＋confirmations 首行；
//   哨兵对象=workflow 面活性（解析死亡/平台停用/注册漂移三类失效皆无仓内信号→节律盘查补网；46-check A18 拦文本档）；
//   workflow_dispatch 实跑=未授权动作不本册登记（D-176 scoping）。
// 纪律（同 update-33-window-state-enum.mjs）：①幂等——同型在位则跳过；②写后 assert-back（五要件/事件锚/BOM/项数）；③fail-closed。
// 用法：node update-33-ci-liveness-watch.mjs → 写回 33-gate-registry.json 并回读断言；exit 0=齐备
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));

const ITEM = {
  id: 'ci-workflow-liveness-watch',
  family: 'repo-maintenance',
  title: 'CI workflow 活性值守——workflow 文件级解析死亡/平台调度停用/注册漂移三类失效均无仓内可观测信号，哨兵节律盘查补网（macro-b-regression 死件案 D-176 防再发）',
  deadline_event: null,
  deadline: '—（manual_watch）',
  trigger_event: null,
  trigger: 'workflow 面语法病/调度注册漂移再发（宿主侧失效形态仓内无可观测信号→哨兵节律替代锚，codebuddy-ide-gap-watch 同型先例）；语法病复发先由 46-check A18 parse 档闸拦网',
  review_at: '每审计窗（T3 哨兵节律）盘查；46-check 转红或 workflow 文件再触语法病即提前',
  status: 'pending',
  watch: 'manual_watch',
  source: 'macro-audit decision-ledger D-176③（R48 收口节执行窗登记——轮49 T1 兑现位）',
  owner: '仓内值守',
  review_event: 'next-audit-window',
  verify_method: 'T3 审计窗三读数：①gh workflow list/run list（或等值 API 列读）核 macro-b-regression 名复原且 schedule 注册活性在案（覆盖 60 天自动停用/注册漂移平台侧失效——D-176③ 原款字面）、近窗 run 无 0s 败迹/YAML error 形态；②actionlint 或等值解析器本地跑 .github/workflows/*.yml 全绿（parse 校验工具归哨兵节律承载非 CI 硬依赖——D-176③）；③46-check A18 parse 档闸读数在绿。workflow_dispatch 实跑属未授权动作不入本册（D-176 scoping 另行登记）',
  confirmations: [{
    at: '2026-09-29',
    by: 'R49-impl 执行批（轮49 T1，分支 r49-t1-exec）',
    criterion_version: 'D-176③',
    decision: 'ci-liveness-sentinel-registered',
    reason: 'D-176③ 兑现：死件复原后活性兜底建制——workflow 文件级解析失败致 schedule 静默死亡系本窗新发现失效形态（冒号病态→解析拒绝→dispatch 无声 0 跑），仓内断言网原无死角；双轨闸=46-check A18 文本档拦网＋本册哨兵补平台态（dispatches/API 列读不可达时 gh workflow list 等价）',
    evidence: 'registry 本项＋decision-ledger.md D-176＋46-check.mjs A18'
  }]
};

const idx = reg.items.findIndex(i => i.id === ITEM.id);
let changed = false;
if (idx < 0) {
  reg.items.push(ITEM);
  changed = true;
} else if (JSON.stringify(reg.items[idx]) !== JSON.stringify(ITEM)) {
  console.error('MIGRATION-ASSERT-FAIL: item exists with drifted content（不覆写——人工核对）');
  process.exit(1);
}

if (changed) fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8');

// --- assert-back（fail-closed） ---
const back = JSON.parse(fs.readFileSync(REG, 'utf8'));
const bit = back.items.find(i => i.id === ITEM.id);
const hasBom = fs.readFileSync(REG)[0] === 0xEF;
const five = bit && bit.watch === 'manual_watch' && !!bit.owner && !!bit.review_at && !!bit.review_event && !!bit.verify_method && Array.isArray(bit.confirmations) && bit.confirmations.length > 0;
const evOk = bit && Object.prototype.hasOwnProperty.call(back.events, bit.review_event);
const ok = !!bit && five && evOk && !hasBom;
console.log('item=' + ITEM.id + ' five_fields=' + five + ' event_anchor=' + evOk + ' items=' + back.items.length + ' BOM=' + hasBom);
if (!ok) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log(changed ? 'REGISTRY-UPDATED' : 'REGISTRY-IDEMPOTENT-SKIP');
