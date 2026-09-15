# Prompt: 22 — B 层判据预声明文档

- A-xxx: A-023, A-024, A-025, A-029
- Decision: spec.md §R3-D4
- Blocked by: #20, #21
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/22-b-criteria-prereg.md
  - handoffs/22-b-criteria-prereg.md
  - spec.md §R3-D4
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-023, A-024, A-025, A-029 行）
  - docs/adr/0013-*.md

## 专属 delta（检查点）
- 阈值测定先跑只读脚本留原始数（时间戳/占比），数字与测定方法同段落盘；跑后改数 = FAIL
- 「判据 → 采集器族」映射与票 21 交付逐行核对，不同族即停票
- 闸门顺序：文档成稿 → 用户审阅 → commit；任何一步倒置 = FAIL
- 引用逐条给出处（标准号+条款位），不可回查的引用删除

## 专属验收
- commit 时间戳早于票 23 开跑记录；4 个 A-xxx 出现在 commit msg
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/22-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/22-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。