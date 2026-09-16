# Handoff — 轮 12 执行窗收口（2026-09-16）

## 本轮完成

- **T1 / #47 托管平台 API 适配器（D-048/ADR-0020/A-055）— DONE**：
  - `engine/src/upstream/github-rest.ts`（682 行）：REST 直连主路＋`X-GitHub-Api-Version: 2022-11-28` pin；凭据三级探测（`GITHUB_TOKEN` env → `gh auth token` 只读借读 → 无认证 60/hr 显式降级；即用即清不建存储）；最小契约=PR 枚举（`platformDeclaredBot`=user.type==Bot+login [bot] 双检）＋PR 元数据＋diff 双通道（本地 git `base...head` 优先，API 仅 base/head 本地缺席兜底）；限流 x-ratelimit-*＋Retry-After 有界退避（次级带 retry-after 单次重试≤60s、primary remaining=0 即停标 reset_epoch）＋余额写事实库；schema 漂移显式抛 `GithubSchemaDrift`；`parseGithubRepoRef` 非 github 显式拒；九类事实（resolution/rate_limit 运行日志/pr_summary/pr_metadata/pr_diff/run/api_error/rate_limited/schema_drift）。
  - `engine/test/fixtures/github-rest/` cassette×5：authenticated+unauthenticated-degraded=env-manager 62-PR **真机录制**；rate-limit-exhausted=官方语义 **synthetic**；schema-drift+platform-bot=**derived**（实录制行删字段/加合成边缘行）。
  - `engine/test/github-rest.test.mjs` **51/51 PASS** 入 smoke 链（package.json scripts.smoke 尾）。
  - 锁表 `engine/upstream-lock.yaml` github-rest planned→**active**（version=2022-11-28 / pin_type=api-version / adapter 回填）；**pin_type 枚举扩展 api-version** 三处同源（lock 头注+docs/versioning.md §3+44-check A4）。
  - 守卫 `.scratch/architecture-recovery/reports/47-check.mjs` **PASS 37/37**；回归 44-check **56/56**、33-check **16/16**。
  - 验收四件套：tsc exit0 / npm test 全链绿 / npm run package→56f/90.4kB / dist/cli.js selftest ok 5/5；**真网活探** strategy=gh-token 命中 api.github.com（62 PRs/3 calls/remaining 4988→4986/token 零泄漏）。
  - 票档三件套 issues|prompts|handoffs/47-github-rest-adapter.md；47-report.md 六段式；BACKLOG #47 ✅；A-055 implemented；WORKFLOW §4 lessons；日报窗口节。
- **T4 #41b listing 残余核对**：description.md name=`6f`/displayName=`Macro Audit` 与 manifest.meta.json/plugin.json/marketplace.json 一致（macro-audit 字样=内核名合法留存，D-052 解耦声明在文）；无需改动。

## 版本控制状态

- 提交 `uvq` on branch **`r12-47-github-rest`**（stacked on `round11-closeout`）；28 文件入一 commit。
- **未 push**——用户闸门（T5）。

## 下一轮入口

- **T2 / #48 Micro-A preview（D-049）已解锁**：前置 #47 落地。票面=恰 4 条已 merged PR（dependabot/release-please/人类形态）双仓实跑＋共享骨架 Micro-A 切片＋报告双件＋披露三件套；desk-task15 机械导出断言进 48-check。cassette 可复用 47-capture 录制链。
- T3：.github/workflows/macro-b-regression.yml 已就位的 dispatch 首跑属 push 门后动作——blocked-by 用户。
- T5 push / T6 上架：用户专属闸门不变。

## 已知注意点

- ctx_execute 写含正则/\n\t 的源码：用普通 `'...'` 字面量数组 join 或 String.raw＋回读断言；本窗踩过 String.raw 把 \uXXXX 当字面量+普通模板吞一层反斜杠两次坑（均已修，WORKFLOW lessons 已记）。
- 录制工作区 `reports/47-capture/` 保留原始捕获供 #48 复用；token 从未落盘。
- rate-limit-exhausted cassette 为 synthetic（语义构造），报告中如实标注——勿当真实录制引用。

## 可复跑索引

- `node .scratch/architecture-recovery/reports/47-check.mjs` → PASS 37/37
- `cd engine && node test/github-rest.test.mjs` → GITHUB-REST 51/51
- `cd engine && npm test` → 全链绿（末段 GITHUB-REST 51/51）
- `cd engine && npm run package && node dist/cli.js selftest` → 56f/90.4kB + ok 5/5
