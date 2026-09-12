# Handoff: 04 — S5 单人仓判据降权

- **A-xxx covered:** A-004
- **Decision:** spec.md §Decision 4.4
- **对应 issue:** issues/04-s5-ownership-single-author.md
- **对应 prompt:** prompts/04-s5-ownership-single-author.md

## 上下文摘要
Conway 默认团队规模 ≥12 人；单人仓（如 env-manager 早期）S5 信号弱。D-004 已强制单人仓 S5 降权 + 报告显式标注"信号不足"。

## 完成定义
1) 团队规模分桶定义（1 / 2-5 / 6-11 / 12+）；2) 每桶的 S5 阈值降权系数；3) 报告模板"信号不足"标注字段定义；4) 至少 2 个单人仓真实案例验证

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #05

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-004
- spec.md §Decision 4.4
- docs/adr/0004-*.md