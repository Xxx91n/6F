# Prompt: 11 — LangGraph supervisor 适配评估

- A-xxx: A-011
- Decision: spec.md §Decision 5.5
- Blocked by: None
- 必读清单:
  - issues/11-langgraph-eval.md
  - handoffs/11-langgraph-eval.md
  - spec.md §Decision 5.5
  - WORKFLOW.md §4.2
  - decision-ledger.md A-011
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 必须给出明确决策（adopt / 自研 / 混合）
- 决策矩阵 ≥5 维度
- 1) LangGraph 能力清单；2) 与本仓库心智模型的契合度评分（≥5 维度）；3) adopt / 自研决策 + 理由

## 专属验收（仅本票特有 — 完成定义）
- [ ] 必须给出明确决策（adopt / 自研 / 混合）
- [ ] 决策矩阵 ≥5 维度
- [ ] 1) LangGraph 能力清单；2) 与本仓库心智模型的契合度评分（≥5 维度）；3) adopt / 自研决策 + 理由

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/11-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/11-report.md。