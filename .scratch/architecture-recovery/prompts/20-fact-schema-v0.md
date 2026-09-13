# Prompt: 20 — fact table schema v0

- A-xxx: A-021
- Decision: spec.md §R3-D2
- Blocked by: None (can start immediately)
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/20-fact-schema-v0.md
  - handoffs/20-fact-schema-v0.md
  - spec.md §R3-D2
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-021 行）
  - docs/adr/0005-*.md

## 专属 delta（检查点）
- 绑定选型先做三候选项对照表再定唯一项；报告中出现「两种都可以」即自判 FAIL
- 字段清单逐项标注与 A-007/A-008/A-010 决议的继承关系，重开决议 = 停票报告
- 本机只跑轻量 node 断言脚本；任何构建/测试命令留待 CI

## 专属验收
- 守卫脚本存在且退出码 0；schema 文件无 update/delete 路径可指认
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/20-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。