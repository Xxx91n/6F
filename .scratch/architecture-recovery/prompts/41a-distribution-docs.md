# Prompt: 41a — 分发收尾·仓内文档面

- A-xxx: A-051
- Decision: spec.md §R5-D10＋D-040
- Blocked by: 无（DoR 闭合，filler 优先级）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/41a-distribution-docs.md
  - handoffs/41a-distribution-docs.md
  - spec.md §R5-D10
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-051 / A-046 行）
  - ../macro-audit/decision-ledger.md（D-030/D-031/D-032/D-038/D-039/D-040 行）
  - docs/adr/0016-*.md、0017-*.md、0018-*.md；docs/versioning.md
  - reports/23-first-report.{md,json} + 23-first-report-failure.{md,json}（样例四件源）；reports/23-first-report.mjs（重生成入口）
  - engine/CHANGELOG.md（反向指针）；engine/src/report/generate.ts（preview_disclosure 契约）
  - README.md（现状）；docs/decisions/README.md

## 专属 delta（检查点）
- ① 复制非移动（.scratch 原件留溯源链）；披露 README 四要素齐（真实产物声明/生成 commit/日期/重生成命令）
- ② README 边界文案以冻结决策为唯一事实源——能力边界/preview 标注逐条可回溯 ADR-0016/0017/0018＋D-031/D-032，不发明能力声明；引用只指向 examples/first-report/ 公共路径不链 .scratch
- ③ 仓根 CHANGELOG.md 禁版本号头、条目键 ## [M-xxx] - ISO日期、固定字段行只引用不复制；ADR/A 区间写时实物读出
- 上架动作停用户闸门——本票产物止于仓内文档面，报告显式声明未上架

## 专属验收
- reports/41a-check.mjs PASS（exit 0 + PASS N/N）＋三子项逐项落位
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/41a-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/41a-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
