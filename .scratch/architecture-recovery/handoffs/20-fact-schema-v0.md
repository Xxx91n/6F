# Handoff: 20 — fact table schema v0

- **A-xxx covered:** A-021
- **Decision:** spec.md §R3-D2
- **对应 issue:** issues/20-fact-schema-v0.md
- **对应 prompt:** prompts/20-fact-schema-v0.md

## 上下文摘要（3-5 句）
轮 3 已封口（macro-audit 账本 D-016 ~ D-018，ADR-0012/0013）：建设主干 = 端到端价值验证闭环，四阶段串行；首报验收 = A→B→C 三层闸门，B 层为预声明 kill criterion（2 正对照 + 3 真判据 + 1 负对照）。本票是 R3-00 的执行票，摩擦点已登记为 A-021（architecture-recovery/decision-ledger.md R3 执行轮段）。工程在 6F/engine/ 单仓子目录；walking skeleton 已验收；MCP 为 stub、fact table/采集器零实现。

## 完成定义（本票 done 判据）
- schema v0 代码/落文交付 + 绑定选型唯一 + 守卫断言清单；ledger A-021 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-021 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-016 ~ D-018）、spec.md §R3-D2、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：46 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- None (can start immediately)

## 关键参考
- docs/adr/0005-*.md；decision-ledger.md A-007/A-008/A-010（上轮决议）；reports/R3-Q1-atomcode-research.md §4
- 守卫脚本模式沿用上轮：reports/20-*.mjs 守卫 + 退出码 0 + 显式 PASS/FAIL（本机只跑轻量 node 断言；构建/测试一律 CI）
- 上轮同号报告（如有）在 reports/ 目录；macro-audit 决策背景见 .scratch/macro-audit/decision-ledger.md
