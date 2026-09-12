# Handoff: 02 — S2 ADR 质量事后补写判定

- **A-xxx covered:** A-002
- **Decision:** spec.md §Decision 4.2
- **对应 issue:** issues/02-s2-adr-timestamp-check.md
- **对应 prompt:** prompts/02-s2-adr-timestamp-check.md

## 上下文摘要
S2 阈值"事后补写 > 90 天 > 20% 判红"依赖 ADR 头时间戳，但很多真实仓库 ADR 不带 YAML 头。本票交付"头一致性核查"+"缺失头回退方案"。

## 完成定义
1) 至少 3 个真实仓库的 ADR YAML 头一致性扫描报告；2) 缺失头时的回退方案（如"按 git blame ADR 文件 first commit 时间替代"）；3) 回退方案的精度验证（与带头仓库对比）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline 决策（D-001 ~ D-007）、当前决策（spec.md §X.Y）、目标仓库现状；输出调研报告含推荐方案
- **回顾 docs/adr/**：与本票直接相关的 ADR（ADR-0004），理解约束与心智
- **回顾 CONTEXT.md**：相关心智模型术语（38 术语）
- **对标工业界成熟方案**：在调研报告中列举 ≥2 个成熟心智模型 / 工具 / 论文作类比

## 阻塞
Blocked by: #05

## 关键参考
- WORKFLOW.md §4.2.3 调研
- decision-ledger.md A-002
- spec.md §Decision 4.2
- docs/adr/0004-*.md