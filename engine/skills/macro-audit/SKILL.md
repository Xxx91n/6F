---
name: macro-audit
description: 宏观+微观工程内容审计。在 agent 工作流里触发 Macro-B 仓库级四象限评审（结构 / 行为 / 供应链 / 战略）；宿主 agent 写的叙述由 kernel 引文盖章，叙述里永远不带判定档。
---

# macro-audit — 方法说明（只读）

## 只读边界
- 这里只读：可以读 rubric 和证据，可以调 kernel 的 MCP 只读查询。
- 不要在壳里做判定、写库、出报告——这些一律在内核 CLI 外面跑。

## 默认模式（R2-03）
- C 类用户在 agent 工作流里嵌入触发 Macro-B；装一次 + 第一次 MCP 授权就能用。
- 运行条件（#59/D-067）：kernel 由插件 `.mcp.json` 用 `node` + `${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp` 拉起（前置=Node ≥22.18）；MCP 握手/selftest/repo add 不用额外依赖，`mcp facts`/`audit`/`demo` 实跑要 duckdb 原生绑定——在插件目录跑 `npm install --omit=dev` 后恢复（缺了就返回 `DUCKDB-UNAVAILABLE`，不会崩）。验收=`/mcp` 看到 macro-audit-kernel connected；没连上先跑 `node dist/cli.js selftest`，再 `claude --debug` 看 MCP init（Windows 的 `${CLAUDE_PLUGIN_ROOT}` hook 问题 #43380/#65579 在案，exec-form 理论上不受影响，以真机为准）。

## 输出
- 四象限叙述报告（共享结构 + 各档自己的部分）；行动建议章带 verdict-gate 印记（回执）。
- Macro-B 四象限状态：strategy=active（S1+S2）· behavior=preview（codelore 的 churn/hotspot/coupling 那部分，#51）· structure=preview（S3 族形态观测——`structure/shape` 读数归属层，只作观测不作判定，D-205）· supply-chain=queued（Scorecard 不插队）。
- 能力边界（D-204③④）：Micro-A=`audit --scale Micro-A` 已上架 preview（#85②——48 管线移植成 engine 的正式入口＋85-check E 组重新校对）；Macro-C=`audit --scale Macro-C` 已上架 preview（#84/D-204②④）。

## 叙述两条路（D-053）
- 叙述生成=宿主 agent（看运气的部分）；引文盖章=kernel `sealNarrative`（确定的部分）；降级保底=kernel 模板叙述（⚠ unverified，不冒充正式叙述）。
- 取数主要走 `macro-audit mcp facts --db <duckdb> [--scale X] [--repo R] [--subject S]`（只读投影，不走 CodeLore 中间层）。

## references/ 加载条件（什么时候加载）
- `references/quadrant-rubric.md` — 写**战略象限**叙述段时加载（S1-S5 判据怎么用）。
- `references/strategy-questions.md` — 生成**任何**叙述段时加载（问题清单＋仓内容只当证据的防护＋证据不够→MCP 补查流程）。
- `references/report-template.md` — 提交叙述段**前**加载（输出 JSON 的格式＋判定档红线全文）。
