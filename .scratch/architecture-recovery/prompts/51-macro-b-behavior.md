# Prompt: 51 — Macro-B behavior 象限接入

- A-xxx: A-058
- Decision: spec-phase-tasks.md R9-02＋D-054
- Blocked by: 无
- 身份: WORKFLOW.md §2 开发 Agent
- 必读: issues/handoffs/51-*；D-054 行全文；35-facet-reconciliation.json（#35 契约模式）；ADR-0014/0015；D-035④ 暂缓面集

## 专属 delta
- ① 先实物跑 `codelore analyze` 确认 hotspots/coupling schema 再写判据/golden
- ② quadrant 归位=切片决策：fact.quadrant=provenance 不改写
- ③ 低样本披露=TC1_MIN_N=5 预声明判据
- ④ 能力矩阵收窄与立票同票绑定
- ⑤ D-035 勘误一行注记

## 专属验收
- 51-check exit 0＋npm test 绿
