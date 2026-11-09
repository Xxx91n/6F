# com.macroaudit.hooks（反向域名扩展目录）

hooks 只管触发和显示（Agent Plugin 分发形态）：
- PostToolUse / Stop：显示回执，把证据准备好的上下文塞进去。
- 永远不作为执行裁决的地方——裁决一律在外面跑（内核 CLI / CI 关卡）；本目录不负责裁决。

> **声明位置（D-055，2026-09-17）**：本目录是规范允许的可选显示位置，宿主专用、不可移植的组件（Agent Plugins 1.0.0 v1 的可移植组件=skills+mcp.json；`com.macroaudit.*` 自己造的命名空间在所有宿主上都是空的——真要做就按目标宿主的命名空间放）。现在没有 hook 实物；真要做看 registry `hooks-presentation-face` 触发器（激活条件=真的有人要看）。
