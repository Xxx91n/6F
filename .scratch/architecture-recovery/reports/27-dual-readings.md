# 27-dual-readings — Erratum: TC-2 S2b 五件套完整度（首报读数勘误式双读数）

> 模板 = atomcode-r6-27 调研 §4 八节勘误结构（ISO 9001 §7.1.5.2 影响评估 + COPE/AIP erratum 制式 + CALDB 版本入元数据）。机读数据 = `27-dual-readings.json`。

## §1 触发与发现
adr-structure@v1 头部解析器仅接受 `- ` dash 字段（collectors.ts parseHeaderFields），且 A-002 交付的回退链（inline ISO → git 首提交）从未接线（ADR-0015 Context 有档）。#26 量测审计（26-truth-table.json）逐格分解发现 49 格 v1-miss 中 16 格为量测误差（Status 全形态误读 11 + Date 内联可恢复 5）。

## §2 影响评估（ISO §7.1.5.2 式）
- last-known-good = 无（回退链接线缺口自始存在）
- suspect interval = 首报批次 6F@fc00d458（observed 2026-09-13T14:31:09+08:00，adr_count=13）
- 受影响结论 = TC-2 字段归因（Status 缺失率被高估 84.62%→0%、Date 84.62%→内联+git 全恢复）；RED 判定方向经复核**不变**（见 §5）

## §3 修正描述
新增 `adr-structure@v2`（collectors.ts §2b）：字段腿 dash → 内联 Nygard（裸行/加粗），Date 追加 inline-iso（head-60）→ git 首提交（注入 first_commit_date）；节腿 ## 标题 → 行首裸标签。版本 = commit 本票；v1 函数、ADR_FIVE_PIECE、TC-2 阈值 0.60/0.50、23-first-report.mjs 全部原样保留。

## §4 重跑方法与验证
冻结集 13 份（git show @fc00d458）+ first_commit_date 注入（git log --follow %aI --reverse）；重测次数 = 恰好 1 次（预注册 27-prereg.md 先入库 commit pov）；golden set 对照 = 26-truth-table.json；判定 = v2 逐格读数 vs 预注册期望 **65/65 ALL-AGREE**（守卫复核）。

## §5 新旧并列结果表

| 读数 | detector | mean_ratio | Status 缺失率 | Date 缺失率 | Context/Decision/Consequences 缺失率 | verdict |
|---|---|---|---|---|---|---|
| 原读数（dated measurement，保留不撤） | adr-structure@v1 | 0.2462 | 0.8462 | 0.8462 | 0.6923 各 | RED |
| 修正读数（reportable value） | adr-structure@v2 | 0.5846 | 0.0000 | 0.0000 | 0.6923 各 | RED |
| 真值参照（人工真值表） | — | 0.4923 | 0 | 0.4615 | 0.6923 各 | — |

**结论变更声明**：TC-2 verdict 维持 RED（cond_a 0.5846<0.60 + cond_b 三节 0.6923>0.50 均仍命中）——方向不变；字段归因修正 = Status/Date 缺失为量测伪影（v2 腿命中：dash 16 / inline 11 / inline-iso 5 / git 6），真实缺失收窄为 Context/Decision/Consequences 三节 ×9 份（移交 #28）。

## §6 逐格 delta 表（65 cells）

| ADR | field | truth | v1 | v2 | delta_class |
|---|---|---|---|---|---|
| 0001-five-scale-scope.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0001-five-scale-scope.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0001-five-scale-scope.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0001-five-scale-scope.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0001-five-scale-scope.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0002-no-mvp-slice.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0002-no-mvp-slice.md | Date | ✓ I-inline | ✗ | ✓ inline-iso | detector-miss-inline |
| 0002-no-mvp-slice.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0002-no-mvp-slice.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0002-no-mvp-slice.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0003-boundary-product-and-usage.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0003-boundary-product-and-usage.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0003-boundary-product-and-usage.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0003-boundary-product-and-usage.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0003-boundary-product-and-usage.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0004-strategic-quadrant-five-dims.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0004-strategic-quadrant-five-dims.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0004-strategic-quadrant-five-dims.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0004-strategic-quadrant-five-dims.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0004-strategic-quadrant-five-dims.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0005-hub-of-facts-with-federated-adjudication.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0005-hub-of-facts-with-federated-adjudication.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0005-hub-of-facts-with-federated-adjudication.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0005-hub-of-facts-with-federated-adjudication.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0005-hub-of-facts-with-federated-adjudication.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0006-shared-skeleton-scale-slice.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0006-shared-skeleton-scale-slice.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0006-shared-skeleton-scale-slice.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0006-shared-skeleton-scale-slice.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0006-shared-skeleton-scale-slice.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0007-ten-demo-paths.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0007-ten-demo-paths.md | Date | ✗ — | ✗ | ✓ git | real-gap |
| 0007-ten-demo-paths.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0007-ten-demo-paths.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0007-ten-demo-paths.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0008-agent-plugin-five-layer-box.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0008-agent-plugin-five-layer-box.md | Date | ✓ I-inline | ✗ | ✓ inline-iso | detector-miss-inline |
| 0008-agent-plugin-five-layer-box.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0008-agent-plugin-five-layer-box.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0008-agent-plugin-five-layer-box.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0009-intake-local-first-url-optin.md | Status | ✓ F-bare | ✗ | ✓ inline | detector-miss-form |
| 0009-intake-local-first-url-optin.md | Date | ✓ I-inline | ✗ | ✓ inline-iso | detector-miss-inline |
| 0009-intake-local-first-url-optin.md | Context | ✗ — | ✗ | ✗  | real-gap |
| 0009-intake-local-first-url-optin.md | Decision | ✗ — | ✗ | ✗  | real-gap |
| 0009-intake-local-first-url-optin.md | Consequences | ✗ — | ✗ | ✗  | real-gap |
| 0010-spec-repo-and-engineering-repo-split.md | Status | ✓ F-bold | ✗ | ✓ inline | detector-miss-form |
| 0010-spec-repo-and-engineering-repo-split.md | Date | ✓ I-inline | ✗ | ✓ inline-iso | detector-miss-inline |
| 0010-spec-repo-and-engineering-repo-split.md | Context | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0010-spec-repo-and-engineering-repo-split.md | Decision | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0010-spec-repo-and-engineering-repo-split.md | Consequences | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0011-single-repo-subdir-but-branches.md | Status | ✓ F-bold | ✗ | ✓ inline | detector-miss-form |
| 0011-single-repo-subdir-but-branches.md | Date | ✓ I-inline | ✗ | ✓ inline-iso | detector-miss-inline |
| 0011-single-repo-subdir-but-branches.md | Context | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0011-single-repo-subdir-but-branches.md | Decision | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0011-single-repo-subdir-but-branches.md | Consequences | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0012-value-validation-loop-first.md | Status | ✓ F-dash | ✓ | ✓ dash | consistent |
| 0012-value-validation-loop-first.md | Date | ✓ F-dash | ✓ | ✓ dash | consistent |
| 0012-value-validation-loop-first.md | Context | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0012-value-validation-loop-first.md | Decision | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0012-value-validation-loop-first.md | Consequences | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0013-three-layer-acceptance-gates.md | Status | ✓ F-dash | ✓ | ✓ dash | consistent |
| 0013-three-layer-acceptance-gates.md | Date | ✓ F-dash | ✓ | ✓ dash | consistent |
| 0013-three-layer-acceptance-gates.md | Context | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0013-three-layer-acceptance-gates.md | Decision | ✓ F-sect | ✓ | ✓ dash | consistent |
| 0013-three-layer-acceptance-gates.md | Consequences | ✓ F-sect | ✓ | ✓ dash | consistent |

## §7 版本与命名
原读数 = 23-measurements.json（fc00d458 批次，存档不动）；修正读数集 = 27-dual-readings.json（独立文件名，原结果不覆盖）。

## §8 传播与记录保存
本勘误与首报（reports/23-first-report.md）双向链接；账本 C 裁定节 disposition 补记移交 #29（CAPA reopen：原裁定 supported 原文保留）；回归防再发 = reports/27-check.mjs 守卫 + engine/test/collectors.test.mjs 单测入 CI。
