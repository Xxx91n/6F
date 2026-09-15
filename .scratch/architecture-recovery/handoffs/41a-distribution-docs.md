# Handoff: 41a — 分发收尾·仓内文档面

- **A-xxx covered:** A-051
- **Decision:** spec.md §R5-D10＋D-040（#41 拆分调度）
- **对应 issue:** issues/41a-distribution-docs.md
- **对应 prompt:** prompts/41a-distribution-docs.md

## 上下文摘要（3-5 句）
#41 按 D-040 拆两片：本票=仓内文档面（examples 样例落位＋README 边界/preview 标注/0.x/Try-on-real-repo 节＋仓根编年首条），#41b=上架面（listing/字段查证/凭据，blocked-by 用户闸门＋listing-submission）。就绪即做 filler 不占关键路径；本票 README/编年改动受 #44 指针守卫族覆盖。

## 完成定义（本票 done 判据）
- examples/first-report/ 四件复制＋披露 README 四要素齐（真实产物声明/生成 commit/日期/重生成命令）；.scratch 原件保留溯源链
- README 能力边界＋「capability N of 5 · preview」＋0.x 语义＋「Try on a real repository」节（opt-in 公共小仓链接＋「外部内容随上游变化」标注）；未上架层「Not yet in preview」文字披露
- 仓根 CHANGELOG.md 首条（## [M-xxx] - ISO日期 键、禁版本号头、固定字段行=里程碑名/ADR 区间/执行账 A 区间/账本节指针/一行影响声明，只引用不复制）；engine/CHANGELOG.md 反向指针闭环
- 边界文案逐条可回溯冻结决策（ADR-0016/0017/0018、D-030~D-032、D-038~D-040、docs/versioning.md）——不自行发明能力声明
- 守卫 reports/41a-check.mjs PASS；ledger A-051 done；WORKFLOW §4 lessons；commit 引 A-051＋守卫结果
- 报告显式声明「上架动作未执行（用户闸门）」

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：README 边界文案/披露页写法对标；回顾 baseline（D-030/D-031/D-032/D-038/D-039/D-040）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0016、0017、0018；**回顾 CONTEXT.md**：「Release Preview / Degraded Demonstration / Receipt」
- **对标工业界成熟方案**：≥2 个 preview 标注/披露页先例（Snyk／MS Entra／Boomi 已有取证可引）

## 阻塞
- 无（DoR 闭合——原 #41 Blocked-by #34 已 done；上架面非本票范围）

## 关键参考
- reports/23-first-report.{md,json} + 23-first-report-failure.{md,json}（样例四件源）；reports/23-first-report.mjs（重生成入口）
- macro-audit 账本 D-030/D-031/D-032/D-038/D-039/D-040 全文；docs/versioning.md；engine/CHANGELOG.md（反向指针）；engine/src/report/generate.ts（preview_disclosure 同一语义源）；README.md（现状）
