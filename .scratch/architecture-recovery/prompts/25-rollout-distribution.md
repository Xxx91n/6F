# Prompt: 25 — 铺开与分发收尾

- A-xxx: A-030
- Decision: spec.md §R3-D7
- Blocked by: #24
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/25-rollout-distribution.md
  - handoffs/25-rollout-distribution.md
  - spec.md §R3-D7
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-030 行）
  - docs/adr/0011-*.md

## 专属 delta（检查点）
- 清单每行必须带「待用户拍板」标记；无标记的动作项 = FAIL
- B4.1 只标「已被 D-015 取代」一行带过，不展开
- 本票零实施动作：只清点落文，出现上架/推送类执行 = FAIL

## 专属验收
- 前置清单落盘且逐项标拍板状态
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/25-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。