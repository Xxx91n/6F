# Prompt: 16 — 渲染样式与模板结构切分

- A-xxx: A-016
- Decision: spec.md §Decision 6.3
- Blocked by: #14, #15
- 必读清单:
  - issues/16-rendering-split.md
  - handoffs/16-rendering-split.md
  - spec.md §Decision 6.3
  - WORKFLOW.md §4.2
  - decision-ledger.md A-016
  - docs/adr/0006-*.md
  - docs/adr/0007-*.md

## 专属 delta（仅本票特有 — 检查点）
- spec 字段必须 < demo 字段（spec 不写样式）
- 越界清单需可机检
- 1) spec 应锁定的字段清单；2) demo 应锁定的样式清单；3) 越界检查清单（spec 阶段禁止触碰的 UI 元素）

## 专属验收（仅本票特有 — 完成定义）
- [ ] spec 字段必须 < demo 字段（spec 不写样式）
- [ ] 越界清单需可机检
- [ ] 1) spec 应锁定的字段清单；2) demo 应锁定的样式清单；3) 越界检查清单（spec 阶段禁止触碰的 UI 元素）

## 开工第一句
窗口必须先复述本票的 Blocked by (#14, #15) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/16-report.md。