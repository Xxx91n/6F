# Prompt: 33 — T7 挂门机检化 guard

- A-xxx: A-038
- Decision: spec.md §R5-D2
- Blocked by: None（阶段 3 最优先）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/33-gate-watch-guard.md
  - handoffs/33-gate-watch-guard.md
  - spec.md §R5-D2
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-038 行）
  - reports/25-rollout-checklist.md（挂门行全集）
  - ../macro-audit/reports/R5-Q5-atomcode-research.md §3（绑定表权威文本）
  - ../macro-audit/spec-phase-tasks.md（任务 5/7 注记 + 暂缓面集注记）
  - ../macro-audit/decision-ledger.md（D-024/D-026/D-034/D-035 行）
  - docs/adr/0015-*.md、docs/adr/0017-*.md
  - CONTEXT.md（LRM Binding / Trigger-gated Closure / Self-probe）

## 专属 delta（检查点）
- 登记表机读形态（建议 reports/33-gate-registry.json）：四族输入逐项三字段齐备
- 守卫含「源文档挂门行↔登记表」对账断言——25-checklist 出现未登记挂门行即 FAIL
- 到期/触发判定：触发已发生未拍 → 1 工作日升级标记；硬到期未触发 → 重组改绑一次标记
- atomcode 调研：串行 -p 只放问题、timeout 600000、续跑锚定

## 专属验收
- reports/33-check.mjs 实跑 PASS（exit 0 + 显式 PASS/FAIL）+ 状态快照入报告
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/33-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/33-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
