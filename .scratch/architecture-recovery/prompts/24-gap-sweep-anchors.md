# Prompt: 24 — 缺口回流实测锚清扫

- A-xxx: A-028
- Decision: spec.md §R3-D6
- Blocked by: #23
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/24-gap-sweep-anchors.md
  - handoffs/24-gap-sweep-anchors.md
  - spec.md §R3-D6
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-028 行）
  - docs/adr/0013-*.md

## 专属 delta（检查点）
- 映射清单只允许指向既有 16 项缺口编号；新造缺口 = FAIL
- 调研结论只写「校准输入」段落，不改写首报任何判定

## 专属验收
- atomcode 调研报告 + 校准输入映射清单双产物落盘
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/24-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/24-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。