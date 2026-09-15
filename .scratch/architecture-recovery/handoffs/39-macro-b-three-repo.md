# Handoff: 39 — Macro-B 三仓 one-shot＋jiahao 回归

- **A-xxx covered:** A-044
- **Decision:** spec.md §R5-D8
- **对应 issue:** issues/39-macro-b-three-repo.md
- **对应 prompt:** prompts/39-macro-b-three-repo.md

## 上下文摘要（3-5 句）
D-033②：Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证；jiahao 挂持续回归进 CI——该接入动作即多写者三触发器之 (a) 激活点（D-034④a），激活即实测封口任务 7 多写者域（self-probe：并发争用曲线只能等系统规模化后实测）。衔接 #33 guard 登记条目状态翻转。

## 完成定义（本票 done 判据）
- 三仓 Macro-B one-shot 各一份报告产物（证据锚齐）
- jiahao 回归 CI 接入（workflow 变更 + 触发面写明）
- 多写者 self-probe 实测封口：任务 7 多写者域登记项状态翻转 + 实测结果落文（衔接 #33 登记表）
- 守卫 reports/39-*.mjs PASS；ledger A-044 done；WORKFLOW §4 lessons；commit 引 A-044 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（D-024/D-033/D-034）、spec.md §R5；冲突显式点名不静默改向
- **回顾 docs/adr/**：0012/0013（VVL+三层闸门）、0015（self-probe 三问）
- **回顾 CONTEXT.md**：「Self-probe / Trigger-gated Closure / Pilot-surface Audit」
- **对标工业界成熟方案**：≥2 个回归 CI/泛化验证先例

## 阻塞
- #37（capacity 矩阵为指派依据）

## 关键参考
- .github/workflows/engine-ci.yml（既有 CI 形态）；reports/30-desk-calibration.json 任务 7 行
- 三仓路径同 #37；macro-audit 账本 D-033/D-034 全文
