# Prompt: 06 — AI-agent 对 ADR 质量冲击评估框架

- A-xxx: A-006
- Decision: spec.md §Decision 4.6
- Blocked by: None
- 必读清单:
  - issues/06-ai-agent-adr-impact.md
  - handoffs/06-ai-agent-adr-impact.md
  - spec.md §Decision 4.6
  - WORKFLOW.md §4.2
  - decision-ledger.md A-006
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- 必须明文"推迟"——不要做实际评估
- 指标必须可机检（不能只是定性）
- 1) 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）；2) 取样方法（哪个仓库、什么 commit 范围、什么 prompt）；3) 推迟触发条件

## 专属验收（仅本票特有 — 完成定义）
- [ ] 必须明文"推迟"——不要做实际评估
- [ ] 指标必须可机检（不能只是定性）
- [ ] 1) 评估指标清单（至少 3 个：决策一致性 / 可逆性 / 上下文漂移）；2) 取样方法（哪个仓库、什么 commit 范围、什么 prompt）；3) 推迟触发条件

## 开工第一句
窗口必须先复述本票的 Blocked by (None) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/06-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/06-report.md。