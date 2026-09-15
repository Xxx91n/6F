# Prompt: 28 — ADR 治理卫生票

- A-xxx: A-033
- Decision: spec.md §R4-D3
- Blocked by: #26
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/28-adr-hygiene-sweep.md
  - handoffs/28-adr-hygiene-sweep.md
  - spec.md §R4-D3
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-033 行）
  - docs/adr/0015-*.md
  - reports/26-*.md（真实缺失分解）

## 专属 delta（检查点）
- 准入范围 = #26 真实缺失分解，逐项清零不扩大
- 每处补记注明「量测审计驱动的勘误补记」性质
- 不以 #27 detector 读数为验收依据（互不为完成条件）
- 真实缺失不因任何 detector 改动而消失

## 专属验收
- 真实缺失逐项清零 + 勘误性质标注 + 守卫 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/28-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
