# Prompt: 12 — Data mesh 失败模式防线设计

- A-xxx: A-012
- Decision: spec.md §Decision 5.6
- Blocked by: None
- 必读清单:
  - issues/12-data-mesh-defense.md
  - handoffs/12-data-mesh-defense.md
  - spec.md §Decision 5.6
  - WORKFLOW.md §4.2
  - decision-ledger.md A-012
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 每条防线必须有触发条件（不能"持续监控"）
- 监控指标必须可量化
- 1) 三大失败每条一条防线（机制 + 触发条件 + 处置流程）；2) 监控指标清单；3) 防线失效的降级路径

## 专属验收（仅本票特有 — 完成定义）
- [ ] 每条防线必须有触发条件（不能"持续监控"）
- [ ] 监控指标必须可量化
- [ ] 1) 三大失败每条一条防线（机制 + 触发条件 + 处置流程）；2) 监控指标清单；3) 防线失效的降级路径

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/12-report.md。