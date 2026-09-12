# Prompt: 15 — Scale 切片差异边界

- A-xxx: A-015
- Decision: spec.md §Decision 6.2
- Blocked by: #14
- 必读清单:
  - issues/15-scale-slice-boundaries.md
  - handoffs/15-scale-slice-boundaries.md
  - spec.md §Decision 6.2
  - WORKFLOW.md §4.2
  - decision-ledger.md A-015
  - docs/adr/0006-*.md

## 专属 delta（仅本票特有 — 检查点）
- 每切片 ≥5 列描述
- 必须显式列出 Macro-A 与 Micro-A 的边界差异
- 1) 5 scale 切片差异表（≥5 列）；2) Macro-A vs Micro-A 的极端差异案例；3) 切片字段不允许与骨架共享字段冲突

## 专属验收（仅本票特有 — 完成定义）
- [ ] 每切片 ≥5 列描述
- [ ] 必须显式列出 Macro-A 与 Micro-A 的边界差异
- [ ] 1) 5 scale 切片差异表（≥5 列）；2) Macro-A vs Micro-A 的极端差异案例；3) 切片字段不允许与骨架共享字段冲突

## 开工第一句
窗口必须先复述本票的 Blocked by (#14) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/15-report.md。