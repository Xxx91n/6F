# Handoff: 06 — AI-agent 对 ADR 质量冲击评估框架

- **A-xxx covered:** A-006
- **Decision:** spec.md §Decision 4.6
- **对应 issue:** issues/06-ai-agent-adr-impact.md
- **对应 prompt:** prompts/06-ai-agent-adr-impact.md

## 上下文摘要
低优先级；spec 阶段只交付"框架"——指标定义 + 取样方法；具体评估待 AI 代码生成主流化。

## 完成定义
1) 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）；2) 取样方法（哪个仓库、什么 commit 范围、什么 prompt）；3) 推迟触发条件

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: None (can start immediately)

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-006
- spec.md §Decision 4.6
- docs/adr/0004-*.md