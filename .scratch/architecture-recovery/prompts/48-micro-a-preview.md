# Prompt: 48 — Micro-A preview 单票铺开

- A-xxx: A-056
- Decision: spec-phase-tasks.md R8-02＋D-049＋D-047/D-033/D-044
- Blocked by: #47（已闭环）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/48-micro-a-preview.md / handoffs/48-micro-a-preview.md
  - spec-phase-tasks.md R8-02 行；../macro-audit/handoffs/next-round.md T1 行
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-056 行）；../macro-audit/decision-ledger.md（D-049 行）
  - docs/adr/0020-*.md（github-rest 契约）、0013-*.md（裁决协议）、0017-*.md（preview 分级）
  - engine/src/upstream/github-rest.ts（适配器契约面）；engine/test/github-rest.test.mjs（cassette 回放先例）
  - reports/39-macro-b-one-shot.mjs（one-shot 管道先例）；reports/47-check.mjs（守卫先例）
  - reports/30-desk-calibration.json items[task=15]（满足判据原文）；33-gate-registry.json（micro-a-preview-prep/desk-task15）

## 专属 delta（检查点）
- ① PR 集=恰 4 条已 merged 票面写死实例（env-manager #64/#55/#51＋jiahao #6）不给通用公式；subject_ref=PR 级（owner/repo#N）
- ② 判据=证据完整性/托管面资格/选择性，非 PR 质量裁决（diff --llm 行级叙事归 #50 宿主 agent 面）
- ③ 披露三件套：capability 3 of 5 · preview＋同主确认偏差（dogfooding=generative not evaluative）＋平台声明的 Bot 身份措辞＋走主路/回退标注
- ④ failure 件=无托管面显式拒绝（unsupported＋原因＋前置条件）；票面前提漂移如实登记不硬套
- ⑤ 骨架交集机械导出断言（REPORT_SKELETON.required_fields ∩ MICRO_A_SLICE_FIELDS）禁手抄漂移；golden 只锁字段骨架不锁内容值
- 禁跑 35-probe.mjs；被测仓只读；凭据即用即清永不入工件；写入 Node.js＋回读断言＋禁 BOM

## 专属验收
- `node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs --golden` exit 0（14 断言全 PASS）
- `node .scratch/architecture-recovery/reports/48-micro-a-preview.mjs` 真跑：4 PR supported＋goose-duck-agent refusal unsupported
- `node .scratch/architecture-recovery/reports/48-check.mjs` exit 0
- `cd engine && npm test` 全链绿（含 github-rest 55/55）＋`npm run package`＋`node dist/cli.js selftest`
- registry micro-a-preview-prep occurred＋desk-task15 decided；40/44-check 漂移对齐后回归全 PASS

