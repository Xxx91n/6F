# Handoff: 08 — Schema 版本演进规则

- **A-xxx covered:** A-008
- **Decision:** spec.md §Decision 5.2
- **对应 issue:** issues/08-schema-versioning.md
- **对应 prompt:** prompts/08-schema-versioning.md

## 上下文摘要
D-005 事件单向写入要求 schema 不可改、版本号演进——这是写策略（07）的下游约束。

## 完成定义
1) Schema 注册中心位置与 API；2) 版本号语义（主/次/补丁含义）；3) 消费者订阅机制（订阅哪个版本、跨版本兼容策略）；4) Schema 变更触发的事件契约

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0005），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #07

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-008
- spec.md §Decision 5.2
- docs/adr/0005-*.md