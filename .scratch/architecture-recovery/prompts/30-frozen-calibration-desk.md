# Prompt: 30 — 阶段 2a 冻结校准（10 项 desk 清单）

- A-xxx: A-035
- Decision: spec.md §R4-D5
- Blocked by: #27, #28
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/30-frozen-calibration-desk.md
  - handoffs/30-frozen-calibration-desk.md
  - spec.md §R4-D5
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-035 行）
  - docs/adr/0015-*.md
  - spec-phase-tasks.md（任务 2/4/5/7/8~16）
  - reports/23-measurements.json
  - reports/24-calibration-map.md

## 专属 delta（检查点）
- 10 项 desk 清单逐项草案 + 置信域标注（单写者证据禁外推多写者）
- 待探针占位每行带「满足判据 + 复审时点」两字段，缺一 = FAIL
- 不改冻结数据、不接新上游（单变量纪律）

## 专属验收
- 10 项草案 + 置信域 + 两字段占位全齐 + 守卫 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/30-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
