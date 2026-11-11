---
name: macro-audit
description: 宏观加微观的工程内容审计。装进 agent 后，对一个仓库跑 Macro-B 四象限评审（结构 / 行为 / 供应链 / 战略）；宿主 agent 写出来的叙述，由内核逐句核对引文后盖章，叙述里永远不带判定档。
---

# macro-audit —— 怎么用（只读）

## 一条红线：只读
- 这里只能读：能读判据、能读证据，能调内核的 MCP 只读查询。
- 判定、写库、出报告都不在壳里做——这些全在内核 CLI 外面跑。

## 默认模式（R2-03）
- C 类用户（在 agent 生态里自己干活的那种开发者）把插件嵌进 agent 工作流，就会触发 Macro-B；装一次、头一回给 MCP 授权，就能用。
- 跑起来的前提（#59/D-067）：内核由插件的 `.mcp.json` 用 `node` 拉起，参数是 `${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp`（机器上得有 Node ≥22.18）。只握手、自检、repo add 这三样不用别的依赖；`mcp facts`/`audit`/`demo` 要真跑，得有 duckdb 的原生绑定——在插件目录跑一次 `npm install --omit=dev` 就补回来（缺了会返回 `DUCKDB-UNAVAILABLE`，不会崩）。怎么算装好了：`/mcp` 里看到 macro-audit-kernel 是 connected。没连上，先跑 `node dist/cli.js selftest`，再 `claude --debug` 看 MCP 启动那一段（Windows 上 `${CLAUDE_PLUGIN_ROOT}` 在 hook 里的老问题 #43380/#65579 记在案；exec-form 理论上不受影响，以真机为准）。

## 给出什么
- 四象限叙述报告（大家共用的骨架 + 每档自己那段）；行动建议那一章带结论检查的印记（回执）。
- Macro-B 四象限各自到哪一步：strategy=active（S1+S2）· behavior=preview（codelore 的 churn/hotspot/coupling 那部分，#51）· structure=preview（S3 族的形态观测——`structure/shape` 解释层里的读数，只当观测看，不作判定，D-205）· supply-chain=queued（Scorecard 不插队）。
- 哪几档能跑（D-204③④）：Micro-A 用 `audit --scale Micro-A`，已上架 preview（#85②——把 48 那套管线搬成 engine 的正式入口，再用 85-check E 组重新校对）；Macro-C 用 `audit --scale Macro-C`，已上架 preview（#84/D-204②④）。

## 叙述由谁写、由谁核（D-053）
- 叙述正文交给宿主 agent 写（这一段看运气）；引文核对交给内核 `sealNarrative`（这一段是硬规矩）；兜底由内核自己套模板出一段（标 ⚠ unverified，不冒充正式叙述）。
- 取数主要走 `macro-audit mcp facts --db <duckdb> [--scale X] [--repo R] [--subject S]`（只读投影，不绕 CodeLore 中间层）。

## references/ 加载条件（什么时候加载）
- `references/quadrant-rubric.md` —— 写**战略象限**的叙述段时加载（S1-S5 判据怎么用）。
- `references/strategy-questions.md` —— 写**任何**叙述段时加载（问题清单 + 仓内文字只当证据的防护 + 证据不够时怎么补查）。
- `references/report-template.md` —— 交叙述段**前**加载（输出 JSON 长什么样 + 判定档红线全文）。
