# Handoff: 46 — 回归 CI 迁回 6F 自有 CI

- **A-xxx covered:** A-054
- **Decision:** BACKLOG #46＋macro-audit 账本 D-046（+D-013/D-033 派生）
- **对应 issue:** issues/46-regression-ci-migration.md
- **对应 prompt:** prompts/46-regression-ci-migration.md

## 上下文摘要（3-5 句）
#39 把 Macro-B 定时回归挂在 jiahao 仓内嵌 workflow；D-046 裁决回归 CI 归 6F 自有——jiahao 仅作审计对象不承载我方资产。本票三子项：6F workflow 落位（URL opt-in 公开仓矩阵）、jiahao 单文件撤除、经典公开仓候选短名单呈报。公仓 clone 零 token（D-013 输入面）；mw-trigger-a 语义在 6F 侧同成立。

## 完成定义（本票 done 判据）
- 6F workflow：schedule+workflow_dispatch 触发面；resolve→fromJSON matrix；repo_url 仅 https:// 公开仓；clone 守 #40 intake 隔离三件；engine build→one-shot→工件断言→upload-artifact；最小权限
- jiahao 撤除：恰 `.github/workflows/macro-b-regression.yml` 一文件 D，其余零触碰（他方在途分支不干扰）
- 候选呈报：语言族×git 健全度×规模短名单落文档，不定案（DEFAULT JSON 接入=用户选定后动作）
- 守卫 reports/46-check.mjs PASS；ledger A-054 done；WORKFLOW §4 lessons；commit 引守卫结果
- 报告显式声明：job 绿=管线跑通非裁定绿；6F/jiahao push 各需用户授权

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：经典公开仓候选的 ADR 语料形态/git 健全度/规模量级
- **回顾 docs/adr/**：0014（适配层纪律）、0017（preview 标注诚实）；**回顾 CONTEXT.md**：「Receipt / Repo Intake URL opt-in」
- **纪律复用**：#40 intake 隔离三件（hooksPath=noop/ext.allow=never/浅拒）原样进 clone 腿

## 阻塞
- 无（DoR 闭合——#39 done；公仓零 token）

## 关键参考
- reports/39-macro-b-one-shot.mjs（one-shot 管线）；reports/40-check.mjs（intake 隔离断言先例）；engine/src/intake/intake.ts
- macro-audit 账本 D-046 全文；D-013（输入面）；D-033（反复接受非跑通）；D-034④a（触发面=定时回归非门禁）
