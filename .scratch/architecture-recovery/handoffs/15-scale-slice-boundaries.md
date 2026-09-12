# Handoff: 15 — Scale 切片差异边界

- **A-xxx covered:** A-015
- **Decision:** spec.md §Decision 6.2
- **对应 issue:** issues/15-scale-slice-boundaries.md
- **对应 prompt:** prompts/15-scale-slice-boundaries.md

## 上下文摘要
D-006 scale-specific 切片的差异度——尤其 Macro-A 跨仓叙事 vs Micro-A 行级评审的边界。

## 完成定义
1) 5 scale 切片差异表（≥5 列）；2) Macro-A vs Micro-A 的极端差异案例；3) 切片字段不允许与骨架共享字段冲突

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0006），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #14

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-015
- spec.md §Decision 6.2
- docs/adr/0006-*.md