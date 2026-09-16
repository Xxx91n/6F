# Handoff: 47 — 托管平台 API 适配器（GitHub REST）

- **A-xxx covered:** A-055
- **Decision:** spec-phase-tasks.md R8-01＋D-048＋ADR-0020
- **对应 issue:** issues/47-github-rest-adapter.md
- **对应 prompt:** prompts/47-github-rest-adapter.md

## 上下文摘要（3-5 句）
D-048 拍板：托管平台 API 适配器=GitHub REST 直连主路＋gh 已认证态可选回退＋无认证显式降级三态；凭据三级探测即用即清；最小契约=PR 枚举（平台声明 Bot 双检）＋元数据＋diff 双通道（本地 git 优先）；限流有界退避触顶即停。本票是 #48 Micro-A preview 的硬前置——API 面不替代 D-013 本地输入面，两路并存。审查/评论面 planned 不入最小集。

## 完成定义（本票 done 判据）
- `engine/src/upstream/github-rest.ts`：三级探测＋REST 主路＋API 版本 pin＋PR 枚举/元数据/diff 双通道＋限流退避＋schema 漂移显式报＋事实发射（resolution/rate_limit/pr_summary/pr_metadata/pr_diff/run）
- golden cassette×5 落 `engine/test/fixtures/github-rest/`（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot——real/derived/synthetic 如实标注）
- `test/github-rest.test.mjs` 作用于 dist/ 产物入 smoke 链全 PASS
- 锁表 `github-rest` planned→active＋README §3 状态列＋engine/CHANGELOG Unreleased 引锁表
- 守卫 `reports/47-check.mjs` PASS（exit 0）＋44-check/33-check 回归不降级
- `reports/47-report.md` 六段式＋macro-audit 日报窗口节
- ledger A-055 done→implemented＋WORKFLOW §4 lessons＋issue Status=done＋BACKLOG #47 ✅＋commit 引 A-055＋守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：GitHub REST 官方文档（rate-limits/pulls 面）；回顾 baseline（D-048/ADR-0020/codelore.ts 先例）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0020（本票决策）、0014（上游双轨）、0021（分发许可）；**回顾 CONTEXT.md**：「upstream / pin / degraded」词汇
- **对标工业界成熟方案**：VCR/cassette 回放先例（nock/pollyjs 语义——本仓走零依赖自制回放，因 cassette 面极小）

## 阻塞
- 无（DoR 闭合——决策已冻结）

## 关键参考
- docs/adr/0020 §决策段（三级探测/diff 双通道/限流语义原文）；.scratch/macro-audit/decision-ledger.md D-048 行
- engine/src/upstream/codelore.ts（adapter 先例：runner/resolver 可注入、业务规则禁入）；engine/src/collect/collectors.ts（makeFact 契约）
- engine/upstream-lock.yaml github-rest 行（contract 原文）；engine/test/codelore-adapter.test.mjs（fixture 回放测试形态）
- reports/44-check.mjs（守卫两段式先例）；reports/33-gate-registry.json（挂门登记）
