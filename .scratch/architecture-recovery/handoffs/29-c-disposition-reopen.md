# Handoff: 29 — C 层 disposition 补记 + 双读数发布

- **A-xxx covered:** A-034
- **Decision:** spec.md §R4-D4
- **对应 issue:** issues/29-c-disposition-reopen.md
- **对应 prompt:** prompts/29-c-disposition-reopen.md

## 上下文摘要（3-5 句）
首报 C 层人裁定「supported」（2026-09-13T10:49:04.195Z 已入库）与规则推导 unsupported 存在张力（已如实记录）；D-025 裁定该裁定跳过了 OOS Phase 1 → 按 CAPA reopen 惯例补前置调查，不推翻人裁定。本票在 #26~#28 全结题后落 disposition 补记 + 勘误式双读数发布：原 RED 不撤回不覆盖（dated measurement），「判红转判绿」唯一合法通道 = 成对动作（原读数记 invalid 附逐份可归属原因 + 修正读数成为 reportable value）。

## 完成定义（本票 done 判据）
- 账本 C 裁定节追加 disposition 段（原裁定与时间戳原文保留）；双读数发布物落 reports/29-*.md；ledger A-034 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-034；守卫 reports/29-*.mjs PASS（exit 0，校验原文未改写 + 成对动作字段齐备）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- #26, #27, #28（T1~T3 全结题 = 前置调查补毕）

## 关键参考
- 账本「C 层人裁定落盘」节（追加对象）；reports/23-gates.json（C.human 槽位）；reports/22-c-adjudication-basis.md（裁定依据）；docs/adr/0015 §Consequences 第 1 条
- 调研聚焦：CAPA reopen 文档惯例 / FDA OOS Phase 2 全规模调查 disposition 格式
