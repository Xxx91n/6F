# Prompt: 01 — S1 定位收敛语义度量方法

- A-xxx: A-001
- Decision: spec.md §Decision 4.1
- Blocked by: #05
- 必读清单:
  - issues/01-s1-semantic-measurement.md
  - handoffs/01-s1-semantic-measurement.md
  - spec.md §Decision 4.1
  - WORKFLOW.md §4.2
  - decision-ledger.md A-001
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- 必须用真实仓库跑一遍（不可只列方法）
- embedding 选型必须对比 ≥3 候选（给出放弃理由）
- 70% 阈值必须给出跨 ≥2 仓库的校准数据
- 1) 至少 2 个真实仓库跑通语义对齐流程；2) embedding 选型理由文档（3 候选对比）；3) 70% 阈值的跨仓库校准数据（每个仓库 5 个抽样点的对齐分）；4) 关键词 fallback 触发条件清单

## 专属验收（仅本票特有 — 完成定义）
- [ ] 必须用真实仓库跑一遍（不可只列方法）
- [ ] embedding 选型必须对比 ≥3 候选（给出放弃理由）
- [ ] 70% 阈值必须给出跨 ≥2 仓库的校准数据
- [ ] 1) 至少 2 个真实仓库跑通语义对齐流程；2) embedding 选型理由文档（3 候选对比）；3) 70% 阈值的跨仓库校准数据（每个仓库 5 个抽样点的对齐分）；4) 关键词 fallback 触发条件清单

## 开工第一句
窗口必须先复述本票的 Blocked by (#05) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/01-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/01-report.md。