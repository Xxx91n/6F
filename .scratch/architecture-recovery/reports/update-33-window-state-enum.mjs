// update-33-window-state-enum.mjs — D-174①④ 兑现：stage2-launch-criteria 补 window_state_enum 三态闭集（幂等可重跑）
// ① window_state_enum:["not_started","running","satisfied_at"]——sibling-of-field 归位=window_state 顶层紧邻旁挂
//   （与 window{} 内 start_event/start_event_enum 命名惯例同构）；枚举键=值域声明约束既有字段，非数据字段扩张；
//   禁改 window_state 当前值（not_started 不动——枚举建制非读数变更）；三态闭集锁死禁开放
// ② confirmations 链式追加 window-state-enum-established 确认行（建制留痕——追加不改写原行，D-146⑤ 同构）
// 不做项：跨字段断言（window_state↔start_event 流转合法边）=D-174② 可选叠加层——做则归 33-check 且须 D-147
//   预声明验证包工序，本批不做不阻塞（列 (d) 面候选呈裁量位）
// 纪律（update-33-window-state.mjs 同款）：①幂等——已建制则跳过；②写后 assert-back（BOM/枚举/归位/确认行）；
// ③fail-closed——验证不过即 MIGRATION-ASSERT-FAIL exit 1。
// 用法：node update-33-window-state-enum.mjs → 写回 33-gate-registry.json 并回读断言；exit 0=齐备
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));

const ITEM_ID = 'stage2-launch-criteria';
const ENUM = ['not_started', 'running', 'satisfied_at'];
const idx = reg.items.findIndex(i => i.id === ITEM_ID);
if (idx < 0) { console.error('MIGRATION-ASSERT-FAIL: ' + ITEM_ID + ' missing'); process.exit(1); }
let changed = false;

const cur = () => reg.items[idx];
if (!Array.isArray(cur().window_state_enum) || cur().window_state_enum.join(',') !== ENUM.join(',')) {
  // sibling-of-field 归位：重建键序使 window_state_enum 紧邻 window_state 之后旁挂
  const it = cur();
  const rebuilt = {};
  let placed = false;
  for (const k of Object.keys(it)) {
    rebuilt[k] = it[k];
    if (k === 'window_state') { rebuilt.window_state_enum = ENUM.slice(); placed = true; }
  }
  if (!placed) rebuilt.window_state_enum = ENUM.slice();
  reg.items[idx] = rebuilt;
  changed = true;
}

const CONF = {
  at: '2026-09-29',
  by: 'R47-impl 执行批（轮48 T1，分支 r48-t1-exec）',
  criterion_version: 'D-174①④',
  decision: 'window-state-enum-established',
  reason: 'window_state 枚举键补位（D-174①④ 兑现）：window_state_enum=["not_started","running","satisfied_at"] 顶层旁挂 window_state——同容器枚举覆盖不对称建制欠账消解（install-manifest-spec 结构缺口 bug 修复先例；值域闭集机读化，写错值有数据面闸）；枚举键=值域声明约束既有字段非数据字段扩张，window_state=not_started 当前值不动；跨字段断言（running/satisfied_at 态须 start_event 已注册）=可选叠加层未做——做则归 33-check 且须 D-147 预声明验证包工序（列 (d) 面候选呈裁量位）。',
  evidence: 'registry 本项 window_state_enum 机读字段＋decision-ledger.md D-174'
};
if (!(cur().confirmations || []).some(c => c.decision === 'window-state-enum-established')) {
  cur().confirmations.push(CONF);
  changed = true;
}

if (changed) {
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8');
}

// --- assert-back（fail-closed） ---
const back = JSON.parse(fs.readFileSync(REG, 'utf8'));
const bit = back.items.find(i => i.id === ITEM_ID);
const hasBom = fs.readFileSync(REG)[0] === 0xEF;
const keys = Object.keys(bit || {});
const ok = !!bit
  && Array.isArray(bit.window_state_enum) && bit.window_state_enum.join(',') === ENUM.join(',')
  && bit.window_state === 'not_started'
  && keys.indexOf('window_state_enum') === keys.indexOf('window_state') + 1
  && (bit.confirmations || []).some(c => c.decision === 'window-state-enum-established' && !!c.at && !!c.by && !!c.criterion_version && !!c.reason && !!c.evidence)
  && !hasBom;
console.log('window_state=' + (bit && bit.window_state) + ' enum=' + JSON.stringify(bit && bit.window_state_enum) + ' keyorder=' + keys.indexOf('window_state') + '->' + keys.indexOf('window_state_enum') + ' confs=' + ((bit && bit.confirmations) || []).length + ' BOM=' + hasBom);
if (!ok) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log(changed ? 'REGISTRY-UPDATED' : 'REGISTRY-IDEMPOTENT-SKIP');
