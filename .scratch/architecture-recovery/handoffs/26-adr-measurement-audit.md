# Handoff: 26 — 阶段 1.5 量测审计

- **A-xxx covered:** A-031
- **Decision:** spec.md §R4-D1
- **对应 issue:** issues/26-adr-measurement-audit.md
- **对应 prompt:** prompts/26-adr-measurement-audit.md

## 上下文摘要（3-5 句）
轮 5 已封口（ADR-0015 / D-023~D-025）：TC-2 RED（五件套完整度 mean_ratio 0.2462，Status/Date 缺失率 84.62%）处置 = 量测效度先行——本票是 FDA OOS 两阶段调查的 Phase 1 同构：14 份 ADR 人工真值表，先于一切 v2 代码。A-002 已证实工业界 ADR YAML 头采纳率 <1%、其交付的回退链（YAML→内联→git 首提交）从未接入 detector，故 RED 读数里量测误差与真实缺失未分解。产物双用：R4-02 验收 golden set + 原 RED invalid 的逐份可归属原因。冻结范围 = 首报时点 docs/adr/ 全集 14 份（ADR-0015/0016 系冻结后新增，不入真值表）。

## 完成定义（本票 done 判据）
- 人工真值表 + 逐份 delta 表模板 + 逐份可归属原因登记落盘（reports/26-*.md/.json）；ledger A-031 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-031；守卫脚本 reports/26-*.mjs PASS（退出码 0）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- None（可立即开工；解锁 #27/#28/#29）

## 关键参考
- docs/adr/0001~0014（被测对象全集）；reports/22-criteria-pre-registration.md（TC-2 判据原文）；reports/23-measurements.json（冻结读数）；reports/02-adr-fallback.mjs（A-002 回退链交付物）；docs/adr/0015（量测效度纪律）
- 调研聚焦：FDA OOS Phase 1 实验室调查清单结构 / MSA attribute agreement analysis 表式（工业先例 ≥2）
