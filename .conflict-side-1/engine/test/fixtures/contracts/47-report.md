# 47-report — 托管平台 API 适配器（GitHub REST）执行报告

- 票：BACKLOG #47 / R8-01 / A-055 / D-048 / ADR-0020
- 窗口：轮 12 常驻任务书 T1（2026-09-16）
- 交付面：engine/src/upstream/github-rest.ts＋test/fixtures/github-rest/cassette×5＋test/github-rest.test.mjs＋reports/47-check.mjs＋锁表 github-rest→active＋文档账本回写

## ① 完成定义逐项（每条附可复跑证据）

1. **适配器落盘**（REST 主路 + X-GitHub-Api-Version pin + 凭据三级探测 + PR 枚举/元数据/diff 双通道 + 限流退避 + 事实发射）：
   `ls engine/src/upstream/github-rest.ts` → 存在（690 行）；`cd engine && npx tsc -p tsconfig.json` → exit 0。
2. **golden cassette×5**（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot）：
   `ls engine/test/fixtures/github-rest/` → 5 带；recorded=real×2（env-manager 62-PR 实录制）/derived×2（实录制派生）/synthetic×1（官方文档语义合成）。
3. **测试入 smoke 闭环**：`cd engine && node test/github-rest.test.mjs` → `GITHUB-REST 55/55` exit 0；`npm test` 全链绿（SMOKE 6/6·COLLECTORS 14/14·ADAPTER 7/7·BATCH1 41/41·LLM 25/25·PREVIEW 5/5·INTAKE 31/31·DEMO 38/38·GITHUB-REST 55/55）。
4. **打包+进程测活**：`cd engine && npm run package` → 56 files/90.9 kB；`node dist/cli.js selftest` → ok:true 5/5 exit 0。
5. **真网活探**（可选回退真实命中）：本机无 GITHUB_TOKEN → strategy=gh-token 借读生效；collectGithubPrFacts(env-manager) → prs=62/calls=3/errors=0；rate_limit 运行日志 remaining 4988→4987→4986 落事实；token 泄漏断言=零。
6. **锁表翻转**：engine/upstream-lock.yaml github-rest 行 → status=active＋version=2022-11-28＋pin_type=api-version＋adapter 回填。
7. **守卫**：`node .scratch/architecture-recovery/reports/47-check.mjs` → PASS（收口复跑见 §④）。

## ② 阻塞 / 待用户

- 无工程阻塞。push/发布=用户闸门不动（T5/T6）。

## ③ 如实登记（偏差与勘误）

- 录制器首版 bug：auth 分支三元吞掉自定义 Accept 头，diff 路录成 JSON 详情——A10 断言（bytes>1000）抓获后单独重录 diff#64（application/vnd.github.diff → 1549B 真 diff 文本），capture 目录同步更正。
- cassette authenticated/unauthenticated 为全量 62-PR 真实行（_links/嵌套 repo/labels 等噪声字段剥离已在带内 sanitization 声明；body>200 字截断标 [cassette-truncated]）。
- rate-limit-exhausted 为 synthetic（真耗尽不可廉价强录），按 docs.github.com rate-limits 原文语义构造并如实标注；其余四面为真实/派生。
- 本机环境无 GITHUB_TOKEN——env-token 路以 cassette 注入断言；gh-token 路真机活探实证；unauthenticated 路真录制 60/h 响应头实证。
- 锁表 pin_type 枚举扩展：remote-api 行引入 `api-version`（X-GitHub-Api-Version 头 pin，非制品版本）——三处同源改：upstream-lock.yaml 头注+docs/versioning.md §3+44-check A4 枚举（复跑 PASS 56/56）。

- **r12exec-audit 复审打回返修**（round12-r12exec-audit.md：PASS-WITH-BLOCKING-OBSERVATIONS，四修全落）：
  - R1/P1 cassette source 勘误：unauthenticated-degraded 带 source 原抄 authenticated 文案称 gh 借读 token——实带为无认证录制（limit=60 自证），已照实改写；新增 B7 断言防再抄。
  - R2/S1 diff 兜底收窄：resolvePrDiff 原在 sha 双解但本地 diff 失败时也改道 API（spec 三处同文 仅 base/head 本地缺席兜底，第二触发器未披露）——按审计 R2 选 收窄代码：本地 diff 失败如实降级（channel=local-git / error_kind=local-diff），不静默改道；A10 断言锁死、D7 断言零 API 调用。
  - R3/S2 事实真值：diff 循环重发 rate_limit 事实原硬编码 retried:false、限流 diff 误记 api_error——callLog 条目补 retried/error_kind（裁决时刻归类 403/429→rate-limited），抽共用发射器 emitCallLog（list/detail/diff 三路径同源）；diff 限流现记 rate_limited 事实；L7/L8/L9+A11 断言锁定。
  - R4 勘误+死代码：行数原报 682 实为 690（现值），五处同值传抄已勘误；死代码三处清理（parsePrList / noRetry / readdirSync）。
  - 测试 51→55/55；47-check 37→40 断言。

## ④ 回归证据

- `node .scratch/architecture-recovery/reports/44-check.mjs` → PASS（收口复跑，见窗口报告引用）
- `node .scratch/architecture-recovery/reports/33-check.mjs` → PASS（同上）
- engine npm test 全链绿（上引）；npm run package / selftest 通过。

## ⑤ Lessons 候选

- ctx_execute 模板字面量嵌含正则/控制符的 TS 源码→转义层叠炸过一轮；String.raw 直写＋回读 marker 断言＋立刻 tsc 编译=三步防再犯（已入 WORKFLOW §4）。
- 录制器侧分支 bug（Accept 被吞）靠回放断言语义兜底——golden 模式价值再证。
- 降级/回退面要有真机活探佐证，不满足于纯 fixture。

## ⑥ 引用文件

- engine/src/upstream/github-rest.ts；engine/test/github-rest.test.mjs；engine/test/fixtures/github-rest/*.cassette.json（5）
- engine/upstream-lock.yaml；engine/package.json（smoke 链）；README.md §3；engine/CHANGELOG.md
- .scratch/architecture-recovery/reports/{47-check.mjs,47-report.md,47-capture/}；issues|prompts|handoffs/47-github-rest-adapter.md
- .scratch/architecture-recovery/{BACKLOG.md,decision-ledger.md(A-055),WORKFLOW.md(lessons)}；.scratch/macro-audit/reports/2026-09-16-report.md（窗口节）
- 录制工作区：reports/47-capture/（真实响应原始捕获，token 从未落盘）
