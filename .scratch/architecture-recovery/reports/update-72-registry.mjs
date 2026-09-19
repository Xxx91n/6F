// update-72-registry.mjs — 33-gate-registry.json 追加「rubric 权重立案登记」项（T4/D-084④：仅登记不提前开工）
// 纪律（update-40-registry.mjs 同款）：①幂等——已存在则跳过；②写后 assert-back（BOM/字段/事件引用三检）；
// ③fail-closed——验证不过即 MIGRATION-ASSERT-FAIL exit 1 不写盘。
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const raw = fs.readFileSync(REG, 'utf8');
const reg = JSON.parse(raw);

const EVENT_ID = 'quadrant-rubric-params-draft';
const ITEM_ID = 'rubric-weight-drafting';
let changed = false;

if (!reg.events[EVENT_ID]) {
  reg.events[EVENT_ID] = {
    occurred: false,
    note: 'D-084④：「quadrant-rubric 初版参数起草」票立项之日=事件发生；权重/强弱语义进 quadrant-rubric 判据面（不进映射表/路由契约——D-084 映射表无权重列）。机检=本登记表值守复核＋立案票审计清点。'
  };
  changed = true;
}

if (!reg.items.some(i => i.id === ITEM_ID)) {
  reg.items.push({
    id: ITEM_ID,
    family: 'quadrant-rubric',
    title: '权重语义 rubric 层立案——「quadrant-rubric 初版参数起草」触发（D-084④：映射表无权重列，权重/强弱语义归判据面）',
    deadline_event: null,
    deadline: '无硬到期——纯事件驱动（次锚=映射表 next_review 2026-10-19 复审照常过目）',
    trigger_event: EVENT_ID,
    trigger: '「quadrant-rubric 初版参数起草」票立项（本项仅登记不提前开工——D-084④）',
    review_at: '立案时带 LFX v2「人气≠健康」启示一句（Health Score 聚合面 40/35/25——权重仅存聚合层，分类/映射页零权重列）',
    status: 'pending',
    watch: 'event_bound',
    verify_method: '33-check 值守面复核＋立案票审计清点：权重行进 quadrant-rubric 判据面不进映射表/路由层（71-check A2 常量无权重断言同向执哨）'
  });
  changed = true;
}

if (changed) {
  const out = JSON.stringify(reg, null, 1) + '\n';
  fs.writeFileSync(REG, out, 'utf8');
}

// --- assert-back（fail-closed） ---
const back = JSON.parse(fs.readFileSync(REG, 'utf8'));
const hasBom = fs.readFileSync(REG)[0] === 0xEF;
const it = back.items.find(i => i.id === ITEM_ID);
const ok = !!back.events[EVENT_ID] && !!it && it.status === 'pending' && it.watch === 'event_bound' && it.trigger_event === EVENT_ID && !hasBom;
console.log('events=' + Object.keys(back.events).length + ' items=' + back.items.length + ' ' + ITEM_ID + '=' + !!it + ' BOM=' + hasBom);
if (!ok) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log(changed ? 'REGISTRY-UPDATED' : 'REGISTRY-IDEMPOTENT-SKIP');
