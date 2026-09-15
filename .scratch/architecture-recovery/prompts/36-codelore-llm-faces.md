# Prompt: 36 — CodeLore LLM 面独立票

- A-xxx: A-041
- Decision: spec.md §R5-D5
- Blocked by: #34, #35
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/36-codelore-llm-faces.md
  - handoffs/36-codelore-llm-faces.md
  - spec.md §R5-D5
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-041 行）
  - ../macro-audit/decision-ledger.md（D-035 行）
  - reports/03-extraction-prompt.md、reports/03-extraction-cases.md（S4 LLM 抽取先例）
  - engine/src/upstream/codelore.ts
  - CONTEXT.md（S4 Evolution Direction / Failure Semantics）

## 专属 delta（检查点）
- env 门控族 = CODELORE_LLM_*（变量名/语义/缺省行为契约落文）
- 门控关 = 显式降级披露不静默失败；测试不真调 LLM（golden cassette 两形态）
- 成本验收面：计量字段 + 上限判据 + 超限降级路径
- S4 ADR 假设抽取前置——本票交付物即其前置

## 专属验收
- reports/36-check.mjs PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/36-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/36-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
