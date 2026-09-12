# Handoff: 01 — S1 定位收敛语义度量方法

- **A-xxx covered:** A-001
- **Decision:** spec.md §Decision 4.1
- **对应 issue:** issues/01-s1-semantic-measurement.md
- **对应 prompt:** prompts/01-s1-semantic-measurement.md

## 上下文摘要
S1 是战略 quadrant 5 维中最容易"看起来对但其实虚"的维度——语义对齐本身是模糊任务。Decision 4.1 已声明不锁 70% 为 hard rule；本票交付"校准流程"而非"阈值"。

## 完成定义
1) 至少 2 个真实仓库跑通语义对齐流程；2) embedding 选型理由文档（3 候选对比）；3) 70% 阈值的跨仓库校准数据（每个仓库 5 个抽样点的对齐分）；4) 关键词 fallback 触发条件清单

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #05

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-001
- spec.md §Decision 4.1
- docs/adr/0004-*.md