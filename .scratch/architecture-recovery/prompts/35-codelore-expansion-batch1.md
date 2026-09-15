# Prompt: 35 — CodeLore 契约面扩开首批 ≈30 面

- A-xxx: A-040
- Decision: spec.md §R5-D4
- Blocked by: None（与 #34 并行首票）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/35-codelore-expansion-batch1.md
  - handoffs/35-codelore-expansion-batch1.md
  - spec.md §R5-D4
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-040 行）
  - ../macro-audit/decision-ledger.md（D-034/D-035 行）
  - docs/adr/0014-*.md、docs/adr/0015-*.md
  - engine/src/upstream/codelore.ts、engine/test/fixtures/codelore/
  - reports/31-codelore-probe.mjs、reports/31-upstream-facts.jsonl、reports/31-report.md
  - ../macro-audit/spec-phase-tasks.md（暂缓面集注记）

## 专属 delta（检查点）
- `codelore analyze --help` 实物枚举存档先行——面名对账以实物为准，禁凭记忆
- 首批 = 演化主干 12＋S3 族 6＋S5 族 12 ≈30 面；禁一次契约全部 56 面；LLM 面不混入（#36 独立票）
- ADR-0014：适配层禁业务规则、raw 语义不出适配层；pin 0.28.0 不变
- 暂缓面集两字段登记核对（缺项 FAIL）——衔接 #33 guard 输入③

## 专属验收
- reports/35-check.mjs PASS + engine npm test / npm run package / selftest 不回归
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/35-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/35-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
