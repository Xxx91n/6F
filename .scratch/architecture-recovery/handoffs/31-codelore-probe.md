# Handoff: 31 — 阶段 2b CodeLore 单上游探针

- **A-xxx covered:** A-036
- **Decision:** spec.md §R4-D6
- **对应 issue:** issues/31-codelore-probe.md
- **对应 prompt:** prompts/31-codelore-probe.md

## 上下文摘要（3-5 句）
阶段 2b = 唯一新增上游 CodeLore 薄垂直切片（ADR-0015：Scorecard/repomix 推阶段 3）。前置两个派生待决：运行时解析策略判定（容器捆绑 vs 二进制发现）+ Agent Plugins 1.0.0 plugin schema 原文阅读（顺手做 P1 预核对 baseline）。主体：适配器 → fact → 重跑 6F 首报同仓 + 同 spec 版本 diff；ADR-0014 纪律 = 锁版本 + golden 契约测试 + 适配层禁业务规则；provenance = commit pin + spec 版本 + data fingerprint。

## 完成定义（本票 done 判据）
- 解析策略判定 + schema 预核对 baseline 落文；适配器 + golden 契约测试落 engine/；重跑 diff + 漂移报告落 reports/31-*.md；任务 1/3 实测锚回写 spec-phase-tasks 注记；README 上游清单 CodeLore 行状态更新（$readme-crafter-skill，不虚报）；ledger A-036 回写 done；WORKFLOW §4 lessons；commit 引 A-036 + 守卫结果；守卫 reports/31-*.mjs PASS + engine CI 绿

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- #30（序列化纪律：2a 结题才开 2b）

## 关键参考
- docs/adr/0014（适配器双轨 + golden 契约）、0015 §Decision-2、0008（五层盒子/mcp.json 只读面）；reports/R5-Q3-atomcode-research.md（CodeLore 探针先例）
- atomcode 调研 = 运行时解析策略（本票核心调研点，串行 -p 只放问题 timeout 600000，续跑锚定）
- CodeLore 上游锁定版本与 golden 输出格式以调研结果为准
