# Handoff: 27 — 判据 v2 追加（adr-structure 回退链接线）

- **A-xxx covered:** A-032
- **Decision:** spec.md §R4-D2
- **对应 issue:** issues/27-criteria-v2-fallback-chain.md
- **对应 prompt:** prompts/27-criteria-v2-fallback-chain.md

## 上下文摘要（3-5 句）
TC-2 v1 detector 只认 YAML 时间戳头，未接 A-002 交付的回退链（YAML → 内联 Nygard Status:/Date: → git 首提交），导致内联格式 ADR 被误计缺失。本票接线 v2：v1 代码与阈值 0.60 留档禁改，v2 并存可复跑；对冻结首报数据（reports/23-measurements.json 同批输入）重跑出并列读数 + 逐份 delta 勘误。验收硬口径 = v2 读数与 #26 人工真值表一致率；重测次数与判定规则必须先于重跑写死入库（禁 testing into compliance）。

## 完成定义（本票 done 判据）
- v2 detector 落 engine/ + v1 留档；重测预注册文档先于重跑 commit；并列读数 + delta 表落 reports/27-*.md；ledger A-032 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-032 + 守卫结果；守卫 reports/27-*.mjs PASS（exit 0）+ engine CI 绿（构建/测试一律 CI）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- #26（人工真值表 = golden set；无真值表不得动 detector）

## 关键参考
- engine/src/collect/collectors.ts（adr-structure@v1）；reports/02-adr-fallback.mjs（A-002 回退链实现）；reports/21-collector-map.md + 21-collectors.json（判据↔detector 绑定）；reports/23-measurements.json（冻结输入）
- docs/adr/0013（预声明判据纪律）、0015（双读数发布纪律）；CONTEXT.md「Dual Reporting / Assignable Cause」
