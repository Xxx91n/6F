# Prompt: 14 — 报告模板共享骨架

- A-xxx: A-014
- Decision: spec.md §Decision 6.1
- Blocked by: #05
- 必读清单:
  - issues/14-shared-skeleton-design.md
  - handoffs/14-shared-skeleton-design.md
  - spec.md §Decision 6.1
  - WORKFLOW.md §4.2
  - decision-ledger.md A-014
  - docs/adr/0006-*.md

## 专属 delta（仅本票特有 — 检查点）
- 章顺序必须严格锁定（不能"约 4 章"）
- 字段必含清单每字段类型 / 必填 / 说明
- 1) 章顺序锁定（章节列表 + 必填字段）；2) 5 scale × 4 象限矩阵交集字段表；3) 不锁措辞的范围说明

## 专属验收（仅本票特有 — 完成定义）
- [ ] 章顺序必须严格锁定（不能"约 4 章"）
- [ ] 字段必含清单每字段类型 / 必填 / 说明
- [ ] 1) 章顺序锁定（章节列表 + 必填字段）；2) 5 scale × 4 象限矩阵交集字段表；3) 不锁措辞的范围说明

## 开工第一句
窗口必须先复述本票的 Blocked by (#05) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/14-report.md。