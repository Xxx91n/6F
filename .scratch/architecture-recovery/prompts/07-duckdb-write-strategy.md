# Prompt: 07 — DuckDB fact table 写入策略

- A-xxx: A-007
- Decision: spec.md §Decision 5.1
- Blocked by: None
- 必读清单:
  - issues/07-duckdb-write-strategy.md
  - handoffs/07-duckdb-write-strategy.md
  - spec.md §Decision 5.1
  - WORKFLOW.md §4.2
  - decision-ledger.md A-007
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 必须选一个写策略（不能"两种都可以"）
- 并发延迟评估必须量化
- 1) 单写进程架构图；2) 事务隔离级别选择理由；3) version 字段 schema（递增策略）；4) 多读并发对单写的延迟影响评估

## 专属验收（仅本票特有 — 完成定义）
- [ ] 必须选一个写策略（不能"两种都可以"）
- [ ] 并发延迟评估必须量化
- [ ] 1) 单写进程架构图；2) 事务隔离级别选择理由；3) version 字段 schema（递增策略）；4) 多读并发对单写的延迟影响评估

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/07-report.md。