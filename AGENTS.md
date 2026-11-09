# AGENTS.md

## 是什么
macro-audit（6F）——从多个仓库、单个仓库、仓库历史，到一次改动、一个文件都能看的工程内容审计产品，分发形态是 Agent 插件（代码在 `engine/`）。

## 跑法
- 构建：`cd engine && npm ci && npm run build`
- 测试：`cd engine && npm test`（gen + build + smoke 全链）
- CLI：`node engine/dist/cli.js --help`

## 权威
- 决策和术语各写在哪，只在 [`docs/authority.md`](docs/authority.md) 里讲一次；门面文书只留指针，不另抄一份。

## 别改
- `engine/dist/` 是生成物：改 `engine/src` 后必须 `npm run build`，提交前跑 `cd engine && node scripts/check-dist.mjs` 确认零 drift。

## 坑
- DuckDB 用 `@duckdb/node-api` 原生绑定；测试是直跑式 `.test.mjs`，不用测试框架。
- 报告里的叙述段落不许自己带判定档（`band`）；判定档由人来定，不归 Agent。
- 版本操作走 `but`：workspace 拒绝裸 `git commit`；`but commit` 必须带这张票的文件 ID（没提交的区域里可能有别的 agent 的改动）；push / tag / merge / 开 PR 这类对外动作，等用户明确指示。

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, with label strings equal to their names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. See `docs/agents/domain.md`.
