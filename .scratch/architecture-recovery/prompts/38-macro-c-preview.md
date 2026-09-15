# Prompt: 38 — Macro-C preview（第二能力层）

- A-xxx: A-043
- Decision: spec.md §R5-D7
- Blocked by: #35, #36, #37
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/38-macro-c-preview.md
  - handoffs/38-macro-c-preview.md
  - spec.md §R5-D7
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-043 行）
  - ../macro-audit/decision-ledger.md（D-031/D-032/D-033/D-034 行）
  - docs/adr/0006-*.md、0007-*.md、0013-*.md、0017-*.md
  - reports/23-first-report.md、reports/23-first-report-failure.md（形态参照）
  - reports/30-desk-calibration.json
  - CONTEXT.md（Macro-C / Release Preview / Degraded Demonstration）

## 专属 delta（检查点）
- 校准语料 = anysearch-cli（56 ADR＋supersede 链）；报告强制披露「单仓校准（anysearch-cli）」结构性限制
- DoD 准入件 = 该层 happy+failure 演示双件（failure 含 ⚠ unverified/降级注释/verdict-gate 印记）
- 触发器 (b) 核查：是否与 Macro-B 共用同一 DuckDB——是则登记 self-probe 触发（衔接 #33）

## 专属验收
- reports/38-check.mjs PASS + preview 报告产物齐
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/38-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/38-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
