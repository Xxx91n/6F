# Handoff: 18 — Failure path 明文

- **A-xxx covered:** A-018
- **Decision:** spec.md §Decision 7.2
- **对应 issue:** issues/18-failure-path-detail.md
- **对应 prompt:** prompts/18-failure-path-detail.md

## 上下文摘要
D-007 failure path 是关键创新点——把失败语义强制嵌入演示。是 17 的下游。

## 完成定义
1) 5 条 failure path 明文表（每条 4 要素齐全）；2) 至少 1 条 failure path 跑通演示（与 happy path 对比）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0005, ADR-0006, ADR-0007），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #17

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-018
- spec.md §Decision 7.2
- docs/adr/0005-*.md
- docs/adr/0006-*.md
- docs/adr/0007-*.md