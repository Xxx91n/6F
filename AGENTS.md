# AGENTS.md

## 项目定位

**macro-audit（6F）**——宏观+微观工程内容审计产品，面向 Git 记录健全的项目；分发形态 = Agent Plugin（engine/）。

## 怎么跑

- 构建：`cd engine && npm ci && npm run build`
- 测试：`cd engine && npm test`（= gen + build + smoke 全链）
- CLI：`node engine/dist/cli.js --help`

## 技术栈

Node ≥20 / TypeScript / esbuild 打包 / DuckDB（@duckdb/node-api）事实存储 / 测试为直跑式 .test.mjs 脚本。

## 目录约定

- `engine/` 产品内核（src / dist / test / scripts / skills / fixtures）
- `docs/` 权威文档区：`spec.md`（产品决策总源）、`adr/`（架构决策记录）、`ra/`（验收风险档案）、`known-gaps.md`、`upstream-dimension-map.md`、`versioning.md`
- `CONTEXT.md` 领域词汇唯一权威
- `examples/` 演示与 golden 对照件；`.claude-plugin/` 插件 manifest；`.github/workflows/` CI
- `.scratch/` 本地未追踪区（治理档案与一次性工件，非产品面，不入库）

## Issue tracker

产品级未决问题：`.scratch/gov-audit/backlog.md`（本地）；代码内 GAP 编号见 `docs/known-gaps.md`。

## 领域文档指针

docs/spec.md（产品决策）→ docs/adr/（难逆转架构决策）→ CONTEXT.md（术语）。

## 协作与 VCS 纪律

- 输出给用户的路径一律写完整绝对路径（`D:\Aworker\6F\...`）。
- 版本控制一律 `but`（GitButler）；未经用户明示不 push。
- 写文件用 Node.js；写后回读校验、禁 BOM、保尾行。
- 触碰 `engine/src` 或 `engine/dist` → commit 前跑 `npm run build` + `node scripts/check-dist.mjs` 确认零 drift。
