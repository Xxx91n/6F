# 18 — Micro-A failure 跑通演示产物（happy vs failure 同骨架对比）

- A-xxx: A-018
- 演示路径: FP-4 / Micro-A failure：PR 结论无引文被 verdict-gate 拒绝
- 夹具: reports/18-demo-fixture.json（同一 PR，差异只来自结论是否绑定可解析证据）
- 脚本: reports/18-failure-demo.mjs

## Micro-A happy：PR diff 行级审计 + verdict-gate

### 1. 执行摘要
> integrity: coverage=3/3 | verdict=pass | render=ok

PR #412 @ acme/payments-gateway (a3f19c7)
行级结论 3 条：通过裁决 3 条，未通过 0 条。
无降级注释：全部结论均绑定可解析证据。

### 2. 4 象限 / 裁决
> integrity: coverage=3/3 | verdict=pass | render=ok

| ID | 位置 | 严重度 | 结论 | verdict-gate | 印记 |
|---|---|---|---|---|---|
| F-1 | src/ratelimit.ts:44 | high | 限流窗口常量硬编码为 60_000ms，未走配置中心 | pass | - |
| F-2 | src/ratelimit.ts:46 | medium | 新增令牌桶未按既有 retry 策略做退避 | pass | - |
| F-3 | src/webhook.ts:18 | low | webhook 重试路径缺少幂等键 | pass | - |

### 3. 证据
> integrity: coverage=4/4 | verdict=n/a（证据层） | render=ok

- [commit:a3f19c7] (git) src/ratelimit.ts:41-46 — 新增令牌桶限流
- [sarif:SC-204] (openssf-scorecard) src/ratelimit.ts:44 — 硬编码窗口常量
- [line:src/ratelimit.ts:44] (codelore) const WINDOW_MS = 60_000;
- [commit:7be2041] (git) src/ratelimit.ts:38 — 变更前逻辑
- F-1 绑定证据：line:src/ratelimit.ts:44, sarif:SC-204
- F-2 绑定证据：line:src/ratelimit.ts:44, sarif:SC-204
- F-3 绑定证据：line:src/ratelimit.ts:44, commit:7be2041

### 4. 行动建议
> integrity: coverage=3/3 | verdict=pass | render=ok

- [已过裁决] F-1：限流窗口常量硬编码为 60_000ms，未走配置中心
- [已过裁决] F-2：新增令牌桶未按既有 retry 策略做退避
- [已过裁决] F-3：webhook 重试路径缺少幂等键

---

## Micro-A failure：PR 结论无引文被 verdict-gate 拒绝

### 1. 执行摘要
> integrity: coverage=0/3 | verdict=rejected | render=ok

PR #412 @ acme/payments-gateway (a3f19c7)
行级结论 3 条：通过裁决 0 条，未通过 3 条。
⚠ 降级注释：本报告中 3 条未过 Evidence Gate，已发 GapRequest，未进入行动建议章。

### 2. 4 象限 / 裁决
> integrity: coverage=0/3 | verdict=rejected | render=ok

| ID | 位置 | 严重度 | 结论 | verdict-gate | 印记 |
|---|---|---|---|---|---|
| F-1 | src/ratelimit.ts:44 | high | 限流窗口常量硬编码为 60_000ms，未走配置中心 | rejected (NO_CITATION) | ⚠ contains uncited claims / ⚠ verdict rejected: NO_CITATION / ⚠ unverified |
| F-2 | src/ratelimit.ts:46 | medium | 新增令牌桶未按既有 retry 策略做退避 | rejected (NO_CITATION) | ⚠ contains uncited claims / ⚠ verdict rejected: NO_CITATION / ⚠ unverified |
| F-3 | src/webhook.ts:18 | low | webhook 重试路径缺少幂等键 | rejected (NO_CITATION) | ⚠ contains uncited claims / ⚠ verdict rejected: NO_CITATION / ⚠ unverified |

### 3. 证据
> integrity: coverage=4/4 | verdict=n/a（证据层） | render=ok

- [commit:a3f19c7] (git) src/ratelimit.ts:41-46 — 新增令牌桶限流
- [sarif:SC-204] (openssf-scorecard) src/ratelimit.ts:44 — 硬编码窗口常量
- [line:src/ratelimit.ts:44] (codelore) const WINDOW_MS = 60_000;
- [commit:7be2041] (git) src/ratelimit.ts:38 — 变更前逻辑
- F-1 绑定证据：⚠ data doesn't show: citation[F-1]
- F-2 绑定证据：⚠ data doesn't show: citation[F-2]
- F-3 绑定证据：⚠ data doesn't show: citation[F-3]

### 4. 行动建议
> integrity: coverage=0/3 | verdict=rejected | render=ok

- （空）本报告无结论通过裁决，行动建议章为 0 条。

#### 未通过裁决（保留 re-adjudication 入口）
- F-1：限流窗口常量硬编码为 60_000ms，未走配置中心  ⚠ verdict rejected: NO_CITATION — GapRequest(src/ratelimit.ts:44, TTL 72h, 升级：Adjudication Protocol 申诉通道)
- F-2：新增令牌桶未按既有 retry 策略做退避  ⚠ verdict rejected: NO_CITATION — GapRequest(src/ratelimit.ts:46, TTL 72h, 升级：Adjudication Protocol 申诉通道)
- F-3：webhook 重试路径缺少幂等键  ⚠ verdict rejected: NO_CITATION — GapRequest(src/webhook.ts:18, TTL 72h, 升级：Adjudication Protocol 申诉通道)

---

## 逐章对比（与 happy path 显式对照）

| 章节 | happy | failure | 差异 |
|---|---|---|---|
| 执行摘要 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同/内容降级 |
| 4 象限 / 裁决 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同/内容降级 |
| 证据 | coverage=4/4, verdict=n/a（证据层） | coverage=4/4, verdict=n/a（证据层） | 结构相同/内容降级 |
| 行动建议 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同/内容降级 |

## 守卫断言

| ID | 断言 | 结果 | 证据 |
|---|---|---|---|
| A1 | 5 条 failure path 每条 4 要素齐全 | PASS | 5 条路径，四要素校验 PASS |
| A2 | 每条 failure path 显式与 happy path 对比（>=3 条差异项） | PASS | FP-1:4 FP-2:4 FP-3:4 FP-4:4 FP-5:4 |
| A3 | happy 与 failure 报告章节结构逐字相同（yield=1） | PASS | 执行摘要 / 4 象限 / 裁决 / 证据 / 行动建议 |
| A4 | failure 报告含 >=1 条 verdict-gate 拒绝印记 | PASS | ⚠ verdict rejected: NO_CITATION | ⚠ verdict rejected: NO_CITATION | ⚠ verdict rejected: NO_CITATION |
| A5 | happy 报告零拒绝印记 | PASS | stamps=0 |
| A6 | 所有印记属于锁定词表（禁止自由发挥） | PASS | 15 个印记，越界 0 个 |
| A7 | failure 报告四章全部存在（降级不降低 yield） | PASS | 执行摘要 / 4 象限 / 裁决 / 证据 / 行动建议 |
| A8 | happy 与 failure 逐章对比产生真实差异 | PASS | happy pass=3 / failure rejected=3 / 差异章=4 |
| A9 | 被裁决驳回的结论不进入行动建议章 | PASS | 行动建议章通过数=0，未通过小节数=3 |

**总计: 9/9 PASS**