# Prompt: 21 — 确定性采集器

- A-xxx: A-022
- Decision: spec.md §R3-D3
- Blocked by: #20
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/21-deterministic-collectors.md
  - handoffs/21-deterministic-collectors.md
  - spec.md §R3-D3
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-022 行）
  - docs/adr/0013-*.md

## 专属 delta（检查点）
- 映射表先落文再写码；每族采集器的输出字段必须能在 schema v0 中指认对应
- 无网络调用断言入守卫；引 LLM API 名即 FAIL
- detector 同族声明写成「判据 → 采集器族」映射，供票 22 直接引用

## 专属验收
- 守卫 PASS（fixture 输出形状符合 schema v0）+ 无网络断言 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/21-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。