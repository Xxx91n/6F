# Prompt: 04 — S5 单人仓判据降权

- A-xxx: A-004
- Decision: spec.md §Decision 4.4
- Blocked by: #05
- 必读清单:
  - issues/04-s5-ownership-single-author.md
  - handoffs/04-s5-ownership-single-author.md
  - spec.md §Decision 4.4
  - WORKFLOW.md §4.2
  - decision-ledger.md A-004
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- 分桶必须可量化（不能模糊分）
- 必须用单人仓真实案例验证
- 1) 团队规模分桶定义（1 / 2-5 / 6-11 / 12+）；2) 每桶的 S5 阈值降权系数；3) 报告模板"信号不足"标注字段定义；4) 至少 2 个单人仓真实案例验证

## 专属验收（仅本票特有 — 完成定义）
- [ ] 分桶必须可量化（不能模糊分）
- [ ] 必须用单人仓真实案例验证
- [ ] 1) 团队规模分桶定义（1 / 2-5 / 6-11 / 12+）；2) 每桶的 S5 阈值降权系数；3) 报告模板"信号不足"标注字段定义；4) 至少 2 个单人仓真实案例验证

## 开工第一句
窗口必须先复述本票的 Blocked by (#05) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/04-report.md。