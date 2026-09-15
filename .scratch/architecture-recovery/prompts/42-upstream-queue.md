# Prompt: 42 — 上游队列值守

- A-xxx: A-047
- Decision: spec.md §R5-D11
- Blocked by: #35（dump 对照）；Scorecard/repomix 探针 = 层需求拉动
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/42-upstream-queue.md
  - handoffs/42-upstream-queue.md
  - spec.md §R5-D11
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-047 行）
  - ../macro-audit/decision-ledger.md（D-020/D-023/D-034/D-035 行）
  - docs/adr/0014-*.md
  - engine/src/upstream/codelore.ts、reports/31-upstream-facts.jsonl
  - CONTEXT.md（SSOT / Event Sourcing）

## 专属 delta（检查点）
- dump 对照评估三轴：字段覆盖度 / 语义翻译面厚度 / golden 可测性——vs 逐面契约路径
- 采纳 dump 须另立 ADR 呈报（不自改向）；不采纳则登记对照结论归档
- Scorecard/repomix 探针保持层需求拉动登记（触发条件字段齐，衔接 #33 guard）；禁止为补齐供应链象限插队
- Macro-B preview「⚠ 数据未接」披露在位核查

## 专属验收
- reports/42-check.mjs PASS + dump 对照评估落文
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/42-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/42-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
