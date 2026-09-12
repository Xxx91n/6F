# Handoff: 07 — DuckDB fact table 写入策略

- **A-xxx covered:** A-007
- **Decision:** spec.md §Decision 5.1
- **对应 issue:** issues/07-duckdb-write-strategy.md
- **对应 prompt:** prompts/07-duckdb-write-strategy.md

## 上下文摘要
D-005 已封 SSOT 心智；本票选"单写多读"——避免 5 scale 多写并发引发的冲突。

## 完成定义
1) 单写进程架构图；2) 事务隔离级别选择理由；3) version 字段 schema（递增策略）；4) 多读并发对单写的延迟影响评估

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0005），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: None (can start immediately)

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-007
- spec.md §Decision 5.1
- docs/adr/0005-*.md