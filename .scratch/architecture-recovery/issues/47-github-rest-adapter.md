# 47: 托管平台 API 适配器 — GitHub REST 主路（env token 三级探测）+ gh 可选回退 + 无认证降级 + PR 枚举/元数据/diff 双通道 + 限流退避 + golden cassette×5

**A-xxx covered:** A-055
**Spec ref:** spec-phase-tasks.md R8-01 行；../../macro-audit/handoffs/next-round.md T1；D-048 / ADR-0020

**What to build:**
`engine/src/upstream/github-rest.ts`——GitHub REST 直连主路（`X-GitHub-Api-Version: 2022-11-28` pin）＋凭据三级探测（`GITHUB_TOKEN` env → `gh auth token` 已认证态只读借读 → 无认证 60/hr 显式降级，即用即清不建存储）＋最小契约=PR 枚举（平台声明 Bot 双检 user.type==Bot + login [bot] 后缀）＋PR 元数据＋diff 双通道（本地 git base...head 优先，REST diff 仅 base/head 本地缺席兜底）＋限流 x-ratelimit-*+Retry-After 有界退避触顶即停＋余额写事实库运行日志。golden cassette×5 离线回放。票毕锁表 `github-rest` planned→active。

**Blocked by:**
无（DoR 闭合——D-048 已冻结；#48 Micro-A preview 硬前置本票）

**Status:** done（2026-09-16）

- [x] ① github-rest.ts 落盘（682 行）：三级探测 resolveGithubCredential＋fetcher 可注入 HTTP 面＋限流头解析/有界退避客户端＋schema 漂移显式抛错＋PR summary/detail 解析＋diff 双通道（git cat-file -e 双 sha 可解→local-git，否则 api 兜底）＋collectGithubPrFacts 事实发射（resolution/rate_limit 运行日志/pr_summary/pr_metadata/pr_diff/run/api_error/rate_limited/schema_drift）
- [x] ② golden cassette×5：authenticated（env-manager 62-PR 实录制 list+detail×2+diff）／unauthenticated-degraded（真实 60/h 头）／rate-limit-exhausted（官方语义合成：retry-after→有界重试→remaining=0 停）／schema-drift（实录制派生删 user/head.sha）／platform-bot（实录制派生+2 合成边缘行）
- [x] ③ test/github-rest.test.mjs 51/51 全 PASS 入 smoke 链；47-check.mjs 守卫；锁表 github-rest→active（version=2022-11-28 pin_type=api-version adapter 回填）；README §3/CHANGELOG/BACKLOG/账本/WORKFLOW lessons 回写
- [x] ④ 47-report.md 六段式＋macro-audit 日报窗口节

**实证：** npm test 全链绿（SMOKE 6/6·COLLECTORS 14/14·ADAPTER 7/7·BATCH1 41/41·LLM 25/25·PREVIEW 5/5·INTAKE 31/31·DEMO 38/38·GITHUB-REST 51/51）＋package 56f/90.4kB＋selftest ok 5/5＋真网活探（gh 回退真实命中 api.github.com，62 PRs/3 calls，token 零泄漏）
