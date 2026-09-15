# Prompt: 13 — 工具对齐评估

- A-xxx: A-013
- Decision: spec.md §Decision 5.7
- Blocked by: None
- 必读清单:
  - issues/13-tool-alignment.md
  - handoffs/13-tool-alignment.md
  - spec.md §Decision 5.7
  - WORKFLOW.md §4.2
  - decision-ledger.md A-013
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 评估维度 ≥4 个
- 每个工具必须给决策
- 1) 工具 × 评估维度的契合度矩阵；2) 每个工具的"采用 / 替代 / 自研"决策

## 专属验收（仅本票特有 — 完成定义）
- [ ] 评估维度 ≥4 个
- [ ] 每个工具必须给决策
- [ ] 1) 工具 × 评估维度的契合度矩阵；2) 每个工具的"采用 / 替代 / 自研"决策

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/13-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/13-report.md。