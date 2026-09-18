---
name: macro-audit
description: 宏观+微观工程内容审计。在 agent 工作流内触发 Macro-B 仓库级四象限评审（结构 / 行为 / 供应链 / 战略）；宿主 agent 叙事经 kernel 引文盖章，叙事面永不携带裁决 band。
---

# macro-audit — 方法论壳（只读）

## 只读隔离纪律（per ADR-0008）
- 本壳只读：允许读取 rubric 与证据、调用 kernel MCP 只读查询面。
- 禁止在本壳内做判定 / 写库 / 出报告 —— 一律由内核 CLI 环境外执行。

## 默认模式（per R2-03）
- C 类用户在 agent 工作流内嵌触发 Macro-B；一次安装 + 首次 MCP 授权即可。
- 运行前提（#59/D-067）：kernel 经插件 `.mcp.json` 以 `node` + `${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp` 拉起（Prerequisites=Node ≥20）；MCP 握手/selftest/repo add 零依赖可用，`mcp facts`/`audit`/`demo` 实跑需 duckdb 原生绑定——插件目录 `npm install --omit=dev` 后恢复（缺失时 `DUCKDB-UNAVAILABLE` 结构化降级非崩溃）。验收=`/mcp` 见 macro-audit-kernel connected；未连接先 `node dist/cli.js selftest` 再 `claude --debug` 看 MCP init（Windows `${CLAUDE_PLUGIN_ROOT}` hook 面 bug 链 #43380/#65579 在案，exec-form 理论免疫以真机为准）。

## 输出
- 四象限叙事报告（共享骨架 + scale 切片）；行动建议章含 verdict-gate 印记（receipt）。
- Macro-B 象限能力矩阵：strategy=active（S1+S2）· behavior=preview（codelore churn/hotspot/coupling 切片，#51）· structure=queued（与 S3 族双口径风险暂缓）· supply-chain=queued（Scorecard 不插队）。

## 叙事双轨（D-053）
- 叙事生成=宿主 agent（概率面）；引文盖章=kernel `sealNarrative`（确定性面）；degraded 兜底=kernel 模板叙事（⚠ unverified，不冒充正式叙事）。
- 取数主路：`macro-audit mcp facts --db <duckdb> [--scale X] [--repo R] [--subject S]`（read-only 投影，不经 CodeLore 适配层）。

## references/ 加载条件
- `references/quadrant-rubric.md` — 写**战略象限**叙事段时加载（S1-S5 判据可操作化口径）。
- `references/strategy-questions.md` — 生成**任何**叙事段时加载（问题清单＋仓内容只当证据防线＋证据不足→MCP 补查程序）。
- `references/report-template.md` — 提交叙事段**前**加载（输出 JSON 契约＋band 红线全文）。
