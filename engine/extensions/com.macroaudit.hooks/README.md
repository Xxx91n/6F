# com.macroaudit.hooks（反向域名扩展目录）

hooks 仅作触发 / 呈现面（per ADR-0008）：
- PostToolUse / Stop：呈现 receipt、注入证据就绪上下文。
- 永不作裁决执行点 —— 裁决一律环境外执行（内核 CLI / CI gate）。

> **声明位（D-055，2026-09-17）**：本目录=规范合法的可选呈现面声明位，宿主专属非可移植组件（Agent Plugins 1.0.0 v1 可移植组件=skills+mcp.json；`com.macroaudit.*` 自造命名空间在一切宿主侧 inert——实建须按目标宿主命名空间落位）。现无 hook 实物；实建见 registry `hooks-presentation-face` 触发器（激活条件=真实呈现需求信号）。
