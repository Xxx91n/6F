# AGENTS.md

## 是什么
macro-audit（6F）——宏观+微观工程内容审计产品，分发形态=Agent Plugin（`engine/`）。

## 跑法
- 构建：`cd engine && npm ci && npm run build`
- 测试：`cd engine && npm test`（gen + build + smoke 全链）
- CLI：`node engine/dist/cli.js --help`

## 别改
- `engine/dist/` 是生成物：改 `engine/src` 后必须 `npm run build`，提交前跑 `cd engine && node scripts/check-dist.mjs` 确认零 drift。
- 决策与术语分别落在哪：唯一成文处是 [`docs/authority.md`](docs/authority.md)，门面文书只留指针。

## 坑
- DuckDB 用 `@duckdb/node-api` 原生绑定；测试是直跑式 `.test.mjs`，不用测试框架。
- 叙事段不得携带裁决 band；band 归 C 层人裁。
- 版本操作走 `but`：workspace 拒绝裸 `git commit`；`but commit` 必须带本票文件 ID（未提交区可能含并发 agent 改动）；push / tag / merge / 开 PR 等外显动作等用户明令。

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, with label strings equal to their names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. See `docs/agents/domain.md`.
