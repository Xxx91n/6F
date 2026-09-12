# macro-audit — 方法论壳（只读）

name: macro-audit
description: 宏观+微观工程内容审计。在 agent 工作流内触发 Macro-B 仓库级四象限评审（结构 / 行为 / 供应链 / 战略）。

## 只读隔离纪律（per ADR-0008）
- 本壳只读：允许读取 rubric 与证据、调用 kernel MCP 只读查询面。
- 禁止在本壳内做判定 / 写库 / 出报告 —— 一律由内核 CLI 环境外执行。

## 默认模式（per R2-03）
- C 类用户在 agent 工作流内嵌触发 Macro-B；一次安装 + 首次 MCP 授权即可。

## 输出
- 四象限叙事报告（共享骨架 + scale 切片）；行动建议章含 verdict-gate 印记（receipt）。