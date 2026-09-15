# Prompt: 41 — 分发收尾

- A-xxx: A-046
- Decision: spec.md §R5-D10
- Blocked by: #34
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/41-distribution-closeout.md
  - handoffs/41-distribution-closeout.md
  - spec.md §R5-D10
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-046 行）
  - ../macro-audit/decision-ledger.md（D-026/D-027/D-030/D-031/D-032 行）
  - reports/25-rollout-checklist.md（P1~P6/D1~D5 行）
  - reports/23-first-report.md、reports/23-first-report.json、reports/23-first-report-failure.md、reports/23-first-report-failure.json（样例四件源）
  - docs/adr/0008-*.md、0016-*.md、0017-*.md
  - README.md（五段式现状）

## 专属 delta（检查点）
- 前置子任务先行：Agent Plugins preview 字段查证＋竞品占位扫描（atomcode 串行 -p 只放问题 timeout 600000）→ 再做 listing 资产
- ① 复制非移动（.scratch 原件留溯源链）；披露 README 四要素齐
- 引用只指向 examples/first-report/ 公共路径；未上架层只文字披露＋「Not yet in preview」
- 上架动作停用户闸门——本票产物止于「上架就绪面」，报告显式声明未上架

## 专属验收
- reports/41-check.mjs PASS + 五子项逐项落位
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/41-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/41-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
