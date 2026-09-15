# Prompt: 37 — 试点面可用性审计

- A-xxx: A-042
- Decision: spec.md §R5-D6
- Blocked by: #34, #35
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/37-pilot-surface-audit.md
  - handoffs/37-pilot-surface-audit.md
  - spec.md §R5-D6
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-042 行）
  - ../macro-audit/decision-ledger.md（D-033 行）
  - docs/adr/0009-*.md
  - reports/02-report.md（W2 三仓扫描先例）
  - CONTEXT.md（Pilot-surface Audit / Generalization Gate）

## 专属 delta（检查点）
- 三仓只读实测：D:/Aworker/env-manager、D:/Aworker/anysearch-cli、D:/Aworker/jiahao——只读不写
- 三指标：PR 人/机比（非人类 PR 边缘形态显式识别）/ ADR supersede 链完整度 / 托管面有无
- 产出 层×仓 capacity 矩阵（每格证据锚）；与 D-033 指派对照——出入如实写不静默改向

## 专属验收
- reports/37-*.mjs 实跑 PASS + 矩阵落文
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/37-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/37-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
