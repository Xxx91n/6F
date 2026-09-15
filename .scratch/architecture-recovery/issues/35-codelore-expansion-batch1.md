# 35: CodeLore 契约面扩开首批 ≈30 面（演化主干 12＋S3 族 6＋S5 族 12）

**A-xxx covered:** A-040
**Spec ref:** [spec.md](spec.md) §R5-D4

**What to build:**
首批契约面 = 演化主干 12 面（revisions / abs-churn / entity-churn / author-churn / hotspot-velocity / code-age / stale-code / architecture-trend / health-trend / lead-time / release-cadence / messages）＋ S3 族 6 面（god-classes / architecture-metrics / dependency-cycles / modularity-violations / instability / architecture-roles）＋ S5 族 12 面（ownership / entity-ownership / bus-factor / main-dev 三件套 / knowledge-islands / communication / coordination-needs / team-composition / marginal-owner-risk / pair-programming）；逐面 golden 契约测试。面名以 `codelore analyze --help` 实物枚举为准（禁凭记忆）；ADR-0014 纪律：适配层禁业务规则、raw 语义不出适配层。Macro-C preview 前置票。

**Blocked by:**
None（与 #34 并行首票）

**Status:** done — 35-check PASS 21/21（返修后 22/22）＋ npm test 全绿（2026-09-15 闭环，2026-09-16 审计返修）

- [x] `codelore analyze --help` 实物枚举存档（reports/35-*）；首批面集与任务书面名逐一对账（差异如实登记、不静默改名）
- [x] 逐面适配器输出 + golden cassette + 契约测试（沿用 #31 binary-discovery + pin 0.28.0 模式）
- [x] 暂缓面集（~20 面）「满足判据＋复审时点」两字段登记核对（衔接 #33 guard 输入③）
- [x] 守卫 reports/35-*.mjs PASS + engine CI 绿（适配层零业务规则词断言沿用 #31 G5 先例）
