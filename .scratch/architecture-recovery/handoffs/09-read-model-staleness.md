# Handoff: 09 — Read model 失效策略

- **A-xxx covered:** A-009
- **Decision:** spec.md §Decision 5.3
- **对应 issue:** issues/09-read-model-staleness.md
- **对应 prompt:** prompts/09-read-model-staleness.md

## 上下文摘要
D-005 read model 独立投影（不锁实时）；陈旧读 SLA + 标记字段让用户知情。

## 完成定义
1) SLA 默认值 + 调优指南；2) 报警触发逻辑；3) 报告模板"陈旧数据标记"字段定义（与 D-006 对齐）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0005, ADR-0006），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #08

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-009
- spec.md §Decision 5.3
- docs/adr/0005-*.md
- docs/adr/0006-*.md