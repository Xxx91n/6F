# Handoff: 10 — Cross-scale correlation key

- **A-xxx covered:** A-010
- **Decision:** spec.md §Decision 5.4
- **对应 issue:** issues/10-cross-scale-correlation-key.md
- **对应 prompt:** prompts/10-cross-scale-correlation-key.md

## 上下文摘要
D-005 跨 scale 观测性基础——5 scale 分析同一 commit/PR 时通过共享 trace_id/baggage_id 关联。spec 阶段作为 schema 前置字段设计。

## 完成定义
1) trace_id / baggage_id 字段定义（类型 / 长度 / 来源）；2) OpenTelemetry SDK 集成清单（哪些 scale 用哪个 SDK）；3) 跨 scale 查询示例 SQL

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0005），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: None (can start immediately)

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-010
- spec.md §Decision 5.4
- docs/adr/0005-*.md