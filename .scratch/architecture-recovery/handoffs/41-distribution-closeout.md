# Handoff: 41 — 分发收尾

- **A-xxx covered:** A-046
- **Decision:** spec.md §R5-D10
- **对应 issue:** issues/41-distribution-closeout.md
- **对应 prompt:** prompts/41-distribution-closeout.md

## 上下文摘要（3-5 句）
上架资格面收尾票（D-030/D-031/D-032 落点）：样例资产落位 examples/first-report/（复制非移动、披露制防失真）＋preview 标注（capability 1 of 5 · preview＋0.x 语义＋changelog）＋listing 资产（未上架层只文字披露）＋前置查证（Agent Plugins preview 字段＋竞品占位）＋凭据申请。上架动作本身停用户闸门。

## 完成定义（本票 done 判据）
- 五子项逐项落位；前置子任务（preview 字段查证＋竞品扫描）先行且结论落文
- examples/first-report/README.md 披露四要素齐（真实产物声明/生成 commit/日期/重生成命令）
- README/marketplace 首段能力边界 +「capability 1 of 5 · preview」+ 0.x 语义 + changelog
- 引用只指向公共路径（不链 .scratch）；未上架层「Not yet in preview」披露块
- 守卫 reports/41-*.mjs PASS；ledger A-046 done；WORKFLOW §4 lessons；commit 引 A-046 + 守卫结果
- 报告显式声明「上架动作未执行（用户闸门）」

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：preview 字段查证＋竞品占位扫描（本子任务前置）；回顾 baseline（D-026/D-027/D-030/D-031/D-032）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0008、0016、0017；**回顾 CONTEXT.md**：「Release Preview / Degraded Demonstration / Receipt」
- **对标工业界成熟方案**：≥2 个 preview 标注/listing 披露先例（Snyk／MS Entra／Boomi 等已有取证可引）

## 阻塞
- #34（plugin.json 合规 = 上架硬前置链第一环）

## 关键参考
- reports/25-rollout-checklist.md（P1~P6/D1~D5 拍板状态）；reports/23-first-report.{md,json} + 23-first-report-failure.{md,json}（样例四件源）
- macro-audit 账本 D-030/D-031/D-032 全文；README.md（五段式现状）
