# Prompt: 09 — Read model 失效策略

- A-xxx: A-009
- Decision: spec.md §Decision 5.3
- Blocked by: #08
- 必读清单:
  - issues/09-read-model-staleness.md
  - handoffs/09-read-model-staleness.md
  - spec.md §Decision 5.3
  - WORKFLOW.md §4.2
  - decision-ledger.md A-009
  - docs/adr/0005-*.md
  - docs/adr/0006-*.md

## 专属 delta（仅本票特有 — 检查点）
- SLA 必须是数字（不能"尽快"）
- 字段定义必须与 D-006 报告模板字段名一致
- 1) SLA 默认值 + 调优指南；2) 报警触发逻辑；3) 报告模板"陈旧数据标记"字段定义（与 D-006 对齐）

## 专属验收（仅本票特有 — 完成定义）
- [ ] SLA 必须是数字（不能"尽快"）
- [ ] 字段定义必须与 D-006 报告模板字段名一致
- [ ] 1) SLA 默认值 + 调优指南；2) 报警触发逻辑；3) 报告模板"陈旧数据标记"字段定义（与 D-006 对齐）

## 开工第一句
窗口必须先复述本票的 Blocked by (#08) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/09-report.md。