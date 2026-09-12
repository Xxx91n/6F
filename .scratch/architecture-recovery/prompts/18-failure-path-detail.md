# Prompt: 18 — Failure path 明文

- A-xxx: A-018
- Decision: spec.md §Decision 7.2
- Blocked by: #17
- 必读清单:
  - issues/18-failure-path-detail.md
  - handoffs/18-failure-path-detail.md
  - spec.md §Decision 7.2
  - WORKFLOW.md §4.2
  - decision-ledger.md A-018
  - docs/adr/0005-*.md
  - docs/adr/0006-*.md
  - docs/adr/0007-*.md

## 专属 delta（仅本票特有 — 检查点）
- 每条 failure path 4 要素必齐
- 必须显式与 happy path 对比（不可只列 failure 自身）
- 1) 5 条 failure path 明文表（每条 4 要素齐全）；2) 至少 1 条 failure path 跑通演示（与 happy path 对比）

## 专属验收（仅本票特有 — 完成定义）
- [ ] 每条 failure path 4 要素必齐
- [ ] 必须显式与 happy path 对比（不可只列 failure 自身）
- [ ] 1) 5 条 failure path 明文表（每条 4 要素齐全）；2) 至少 1 条 failure path 跑通演示（与 happy path 对比）

## 开工第一句
窗口必须先复述本票的 Blocked by (#17) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/18-report.md。