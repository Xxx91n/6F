# Prompt: 43 — 样例 golden CI

- A-xxx: A-048
- Decision: spec.md §R5-D12
- Blocked by: #41
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/43-sample-golden-ci.md
  - handoffs/43-sample-golden-ci.md
  - spec.md §R5-D12
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-048 行）
  - ../macro-audit/decision-ledger.md（D-030 行③）
  - .github/workflows/engine-ci.yml
  - reports/23-first-report.md（样例源）
  - docs/adr/0017-*.md

## 专属 delta（检查点）
- CI golden job：重渲染 examples/first-report/ fixture 并 diff——命令与 #41 披露 README 的重生成命令一致
- 不一致即 fail（非零退出 + 差异摘要入 job 日志）；样例更新只走 PR 审查
- 禁自动重生成直通 main（snapshot 纪律）

## 专属验收
- reports/43-check.mjs PASS + workflow 变更落位
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/43-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/43-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
