# Prompt: 10 — Cross-scale correlation key

- A-xxx: A-010
- Decision: spec.md §Decision 5.4
- Blocked by: None
- 必读清单:
  - issues/10-cross-scale-correlation-key.md
  - handoffs/10-cross-scale-correlation-key.md
  - spec.md §Decision 5.4
  - WORKFLOW.md §4.2
  - decision-ledger.md A-010
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 字段必须在 fact table schema 里（不能"另起表"）
- OTel 集成要选语言栈契合度最高的 SDK
- 1) trace_id / baggage_id 字段定义（类型 / 长度 / 来源）；2) OpenTelemetry SDK 集成清单（哪些 scale 用哪个 SDK）；3) 跨 scale 查询示例 SQL

## 专属验收（仅本票特有 — 完成定义）
- [ ] 字段必须在 fact table schema 里（不能"另起表"）
- [ ] OTel 集成要选语言栈契合度最高的 SDK
- [ ] 1) trace_id / baggage_id 字段定义（类型 / 长度 / 来源）；2) OpenTelemetry SDK 集成清单（哪些 scale 用哪个 SDK）；3) 跨 scale 查询示例 SQL

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/10-report.md。