# Prompt: 03 — S4 ADR 假设提取工具链

- A-xxx: A-003
- Decision: spec.md §Decision 4.3
- Blocked by: #05
- 必读清单:
  - issues/03-s4-adr-assumption-extraction.md
  - handoffs/03-s4-adr-assumption-extraction.md
  - spec.md §Decision 4.3
  - WORKFLOW.md §4.2
  - decision-ledger.md A-003
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- LLM 抽取结果必须经过人工抽检（不能跳过）
- 失败案例与成功案例并存（不要只挑好做的）
- 1) LLM 抽取 prompt 模板（带 few-shot）；2) 人工抽检 checklist；3) 至少 5 个 ADR 的完整抽取案例（抽取结果 + 人工复核标记 + 假设失效判定）；4) 工具链 reusable 程度说明

## 专属验收（仅本票特有 — 完成定义）
- [ ] LLM 抽取结果必须经过人工抽检（不能跳过）
- [ ] 失败案例与成功案例并存（不要只挑好做的）
- [ ] 1) LLM 抽取 prompt 模板（带 few-shot）；2) 人工抽检 checklist；3) 至少 5 个 ADR 的完整抽取案例（抽取结果 + 人工复核标记 + 假设失效判定）；4) 工具链 reusable 程度说明

## 开工第一句
窗口必须先复述本票的 Blocked by (#05) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/03-report.md。