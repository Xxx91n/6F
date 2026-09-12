# Handoff: 16 — 渲染样式与模板结构切分

- **A-xxx covered:** A-016
- **Decision:** spec.md §Decision 6.3
- **对应 issue:** issues/16-rendering-split.md
- **对应 prompt:** prompts/16-rendering-split.md

## 上下文摘要
D-003 已封边界（产品本体 + 使用方法，不含纯 UI 决定）；本票明确切分规则。

## 完成定义
1) spec 应锁定的字段清单；2) demo 应锁定的样式清单；3) 越界检查清单（spec 阶段禁止触碰的 UI 元素）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0006, ADR-0007），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #14, #15

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-016
- spec.md §Decision 6.3
- docs/adr/0006-*.md
- docs/adr/0007-*.md