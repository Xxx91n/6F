# Handoff: 05 — 25 采集单元矩阵

- **A-xxx covered:** A-005
- **Decision:** spec.md §Decision 4.5
- **对应 issue:** issues/05-25-unit-matrix.md
- **对应 prompt:** prompts/05-25-unit-matrix.md

## 上下文摘要
矩阵是 S1-S5 全维在 5 scale 下的二维展开；是 4.1/4.2/4.3/4.4 的上游抽象——任何单维决策必须能填入矩阵的对应行。

## 完成定义
1) 25 单元矩阵表（行=5 维 S1-S5，列=5 scale，单元格=判据/数据源/阈值）；2) 矩阵 schema 定义（字段、类型、必填项）；3) 跨仓校准机制说明（如何从单一仓库扩展到多仓分布）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: None (can start immediately)

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-005
- spec.md §Decision 4.5
- docs/adr/0004-*.md