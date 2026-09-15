# Prompt: 40 — 非自有公开仓泛化验证 ≥1

- A-xxx: A-045
- Decision: spec.md §R5-D9
- Blocked by: #39
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/40-external-repo-generalization.md
  - handoffs/40-external-repo-generalization.md
  - spec.md §R5-D9
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-045 行）
  - ../macro-audit/decision-ledger.md（D-013/D-033 行）
  - docs/adr/0009-*.md
  - spec.md §R2-05（输入面契约）
  - CONTEXT.md（Generalization Gate / Repo Intake）

## 专属 delta（检查点）
- ≥1 非自有公开仓，URL opt-in 全路径（隔离缓存 clone / 全深度 / 浅 clone 拒绝 / 凭据复用本地链）
- 选定理由落文（规模/ADR 健全度/语言栈）；与三仓 one-shot 对照差异如实写
- 产出 = Macro-B GA 前置泛化证据

## 专属验收
- reports/40-check.mjs PASS + 泛化证据落文
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/40-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/40-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
