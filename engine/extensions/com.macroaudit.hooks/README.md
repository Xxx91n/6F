# com.macroaudit.hooks（按反向域名起的扩展目录）

hooks 只管什么时候触发、显示什么东西（这是 Agent Plugin 分发形态的事）：
- PostToolUse / Stop：把回执显示出来，顺手把「证据已就绪」这层上下文注入进去。
- hooks 永不承载裁决——裁决一律在外面跑（内核 CLI / CI 关卡）。

> **这个目录为什么放这儿（D-055，2026-09-17）**：规范允许把显示组件放在这种可选位置，但这种组件是给某个宿主专用的、搬到别的宿主就不好使（Agent Plugins 1.0.0 v1 里能搬来搬去的只有 skills 和 mcp.json 两样；`com.macroaudit.*` 这个命名空间是我们自己起的，在所有宿主上都是空的——真要做，就按目标宿主自己的命名空间放）。现在还没有 hook 实物；真要做，先看 registry 里 `hooks-presentation-face` 那个触发器（什么时候激活＝真有人要看）。
