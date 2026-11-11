# AGENTS.md

## 是什么
macro-audit（6F）——一个看工程内容的审计产品：多个仓库一起看、单个仓库看、看一个仓库的来龙去脉、看一次改动、看一个文件，都能干。发给用户的形式是 Agent 插件（代码在 `engine/`）。

## 怎么跑
- 构建：`cd engine && npm ci && npm run build`
- 测试：`cd engine && npm test`（生成清单 + 编译 + 冒烟测试，一整套）
- 命令行：`node engine/dist/cli.js --help`

## 权威
- 决定和术语各写在哪，只在 [`docs/authority.md`](docs/authority.md) 里讲一次；门面文书只留链接，不另抄一份。

## 别动
- `engine/dist/` 是自动生成的：改了 `engine/src` 就得 `npm run build`，提交前跑 `cd engine && node scripts/check-dist.mjs`，确认没有对不上的地方。

## 坑
- DuckDB 靠 `@duckdb/node-api` 的原生绑定；测试是直接跑的 `.test.mjs`，没套测试框架。
- 报告里讲故事的那些段落不许自己带判定档（`band`）；判定档由人来定，不归 Agent。
- 版本操作走 `but`：这个工作区不认裸 `git commit`；`but commit` 必须带上这张票的文件 ID（没提交的区域里可能有别的 agent 的改动）；push / tag / merge / 开 PR 这类对外动作，等用户明确说了再做。

## Agent skills

### Issue tracker

问题都记在这个仓的 GitHub Issues 里，用 `gh` 命令行读写。见 `docs/agents/issue-tracker.md`。

### Triage labels

五个固定的分诊角色，标签字跟角色名一模一样。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文的仓，一份文档管全部。见 `docs/agents/domain.md`。
