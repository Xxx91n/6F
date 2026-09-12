# Handoff: 03 — S4 ADR 假设提取工具链

- **A-xxx covered:** A-003
- **Decision:** spec.md §Decision 4.3
- **对应 issue:** issues/03-s4-adr-assumption-extraction.md
- **对应 prompt:** prompts/03-s4-adr-assumption-extraction.md

## 上下文摘要
InfoQ ADR Drift Monitor 只给理念清单，无可复用工具。本票自建工具链——LLM 抽取假设 → 人工抽检 → 对照现实指标。

## 完成定义
1) LLM 抽取 prompt 模板（带 few-shot）；2) 人工抽检 checklist；3) 至少 5 个 ADR 的完整抽取案例（抽取结果 + 人工复核标记 + 假设失效判定）；4) 工具链 reusable 程度说明

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #05

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-003
- spec.md §Decision 4.3
- docs/adr/0004-*.md