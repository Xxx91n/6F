# Prompt: 05 — 25 采集单元矩阵

- A-xxx: A-005
- Decision: spec.md §Decision 4.5
- Blocked by: None
- 必读清单:
  - issues/05-25-unit-matrix.md
  - handoffs/05-25-unit-matrix.md
  - spec.md §Decision 4.5
  - WORKFLOW.md §4.2
  - decision-ledger.md A-005
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- 矩阵必须 25 格全填（不能留空说"待定"）
- schema 必须形式化（可机检）
- 1) 25 单元矩阵表（行=5 维 S1-S5，列=5 scale，单元格=判据/数据源/阈值）；2) 矩阵 schema 定义（字段、类型、必填项）；3) 跨仓校准机制说明（如何从单一仓库扩展到多仓分布）

## 专属验收（仅本票特有 — 完成定义）
- [ ] 矩阵必须 25 格全填（不能留空说"待定"）
- [ ] schema 必须形式化（可机检）
- [ ] 1) 25 单元矩阵表（行=5 维 S1-S5，列=5 scale，单元格=判据/数据源/阈值）；2) 矩阵 schema 定义（字段、类型、必填项）；3) 跨仓校准机制说明（如何从单一仓库扩展到多仓分布）

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/05-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/05-report.md。