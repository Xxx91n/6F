# Prompt: 23 — 首报全链与三层闸门验收

- A-xxx: A-026, A-027
- Decision: spec.md §R3-D5
- Blocked by: #19, #22
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/23-first-report-e2e.md
  - handoffs/23-first-report-e2e.md
  - spec.md §R3-D5
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-026, A-027 行）
  - docs/adr/0012-*.md
  - docs/adr/0013-*.md

## 专属 delta（检查点）
- 开跑前三查：票 19 CI 证据在档、票 22 预声明已 commit、裁定依据预入库文件可指认——任一缺 = 停票
- B 闸执行顺序不可倒：正对照 2/2 先行，未中即停并按管线故障报，不许继续读数
- 真判据全空时按「前提未被支持」合法数据回写账本，禁止回炉重跑凑命中
- C 裁定原文 + 时间戳由用户产出后回写账本；agent 可消费侧车与主报告同步交付

## 专属验收
- 三闸执行记录齐（A 机检清单 / B 对照表 / C 裁定原文）；失败路径产物含 ⚠ unverified 印记
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/23-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。