# Handoff: 33 — T7 挂门机检化 guard

- **A-xxx covered:** A-038
- **Decision:** spec.md §R5-D2
- **对应 issue:** issues/33-gate-watch-guard.md
- **对应 prompt:** prompts/33-gate-watch-guard.md

## 上下文摘要（3-5 句）
#25 拍板包留下一批挂门项（LRM 绑定：最迟拍板时点＋触发事件），加上 D-024 两字段登记项与 D-034④ 多写者三触发器、D-035④ 暂缓面集复审时点——分散在 25-checklist / spec-phase-tasks / 两本账本多处。人工盯不住，需一个统一 guard 机读登记表 + 守卫脚本做到期/触发报警。本票是阶段 3 横切兜底、最优先。

## 完成定义（本票 done 判据）
- 机读登记表 reports/33-gate-registry.json（或等价形态）落文：四族输入逐项含「最迟拍板时点 / 触发事件 / 复审时点 / 当前状态」
- 守卫 reports/33-check.mjs：① 源文档挂门行↔登记表对账（未登记检出即 FAIL）；② 三字段齐备性断言；③ 到期/已触发未拍项报警输出；④ exit 0 + 显式 PASS/FAIL
- 守卫实跑 PASS；报告含挂门项状态快照
- ledger A-038 回写 done；WORKFLOW §4 lessons；commit 引 A-038 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-024/D-026/D-034/D-035）、spec.md §R5、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：54 术语中与本票相关项（LRM Binding / Trigger-gated Closure / Self-probe 不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比（如 Stage-Gate 门卫 / LRM / backlog expiry 惯例）

## 阻塞
- 无（阶段 3 最优先，横切兜底）

## 关键参考
- reports/25-rollout-checklist.md（挂门行全集）；reports/R5-Q5-atomcode-research.md §3（绑定表权威文本）
- spec-phase-tasks.md（任务 5/7 注记 + 暂缓面集注记）；docs/adr/0015（D-024 三问决策树）/ 0017（preview 模型）
- CONTEXT.md「LRM Binding / Trigger-gated Closure / Self-probe」词条
