// update-40-registry.mjs — #40 registry 回写（first-external-repo occurred + desk-task2/15 绑定处置；一次性生成器）
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const P = join(HERE, '33-gate-registry.json');
const reg = JSON.parse(readFileSync(P, 'utf8'));

// 1. first-external-repo 事件翻转（实跑完成后才可落）
reg.events['first-external-repo'] = {
  occurred: true,
  date: '2026-09-16',
  evidence: '#40 落点：open-gsd/gsd-core 经 URL opt-in 接入（engine repo add → 40-clone-cache/repos/f0b1eba9471ef4de，全深度 5887 commits 浅拒通过）→ Macro-B one-shot unsupported（RCP-d4f119c5a2cac629）——D-013 首实用户 / D-033 GA 前置达成。锚：reports/40-intake-receipt.json + 40-out/40-macro-b-gsd-core.* + 40-external-comparison.json'
};

// 2. desk-task2：满足判据达成（gsd-core TC-1 judgeable=92 ≥ min_n=5）→ triggered-bound
const t2 = reg.items.find(i => i.id === 'desk-task2');
if (!t2) { throw new Error('desk-task2 missing'); }
t2.status = 'triggered-bound';
t2.bound_to = '判据满足：gsd-core TC-1 judgeable_n=92 ≥ min_n=5（30-desk-calibration task2.satisfaction 原文判据）';
t2.confirmations = (t2.confirmations || []).concat([{
  at: '2026-09-16',
  by: '#40 外部仓 one-shot 实跑',
  criterion_version: '30-desk-calibration.json items[task=2].probe.satisfaction 原文',
  decision: 'trigger-fired-criterion-met',
  reason: '首个非 6F 目标仓 open-gsd/gsd-core 经 URL opt-in 接入并跑 Macro-B：TC-1 judgeable_n=92 ≥ min_n(5)，外部仓 ADR 集 TC-1 可判定 → 探针占位满足判据达成，转 triggered-bound',
  evidence: 'reports/40-out/40-macro-b-gsd-core-measurements.json tc1.judgeable_n=92 + reports/40-intake-receipt.json + reports/40-external-comparison.json'
}]);

// 3. desk-task15：触发已发生但满足判据属 Micro-A（未上架层）→ 值守通道呈报，status 保持 pending（ALARM = 登记处升级路径）
const t15 = reg.items.find(i => i.id === 'desk-task15');
if (!t15) { throw new Error('desk-task15 missing'); }
t15.confirmations = (t15.confirmations || []).concat([{
  at: '2026-09-16',
  by: '#40 外部仓 one-shot 落点核查',
  criterion_version: '30-desk-calibration.json items[task=15].probe.satisfaction 原文',
  decision: 'trigger-fired-criterion-unmet',
  reason: 'first-external-repo 已 occurred；但本项满足判据 =「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」——Micro-A 为未上架层（capability 3 of 5，not_in_preview），#40 产出为 Macro-B 报告不构成本项判据 → 状态保持 pending，值守通道呈报待 Micro-A 上架后判定',
  evidence: 'reports/40-external-comparison.json + 30-desk-calibration.json items[task=15]'
}]);

writeFileSync(P, JSON.stringify(reg, null, 2) + '\n', 'utf8');
const back = JSON.parse(readFileSync(P, 'utf8'));
console.log('registry updated: first-external-repo.occurred=' + back.events['first-external-repo'].occurred +
  ' desk-task2=' + back.items.find(i => i.id === 'desk-task2').status +
  ' desk-task15=' + back.items.find(i => i.id === 'desk-task15').status +
  ' items=' + back.items.length);
