# Prompt: 39 — Macro-B 三仓 one-shot＋jiahao 回归

- A-xxx: A-044
- Decision: spec.md §R5-D8
- Blocked by: #37
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/39-macro-b-three-repo.md
  - handoffs/39-macro-b-three-repo.md
  - spec.md §R5-D8
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-044 行）
  - ../macro-audit/decision-ledger.md（D-024/D-033/D-034 行）
  - docs/adr/0012-*.md、0013-*.md、0015-*.md
  - .github/workflows/engine-ci.yml
  - reports/30-desk-calibration.json（任务 7 行）
  - CONTEXT.md（Self-probe / Trigger-gated Closure / Pilot-surface Audit）

## 专属 delta（检查点）
- 三仓各一次 Macro-B one-shot（env-manager / anysearch-cli / jiahao）
- jiahao 持续回归 CI 接入 = 多写者触发器 (a) 激活点——接入即登记 self-probe 实测封口（衔接 #33 登记表翻转）
- 试点成功度量 = 反复接受非跑通；回归仅限已上架层

## 专属验收
- reports/39-check.mjs PASS + 三份 one-shot 产物 + CI 变更
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/39-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/39-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
