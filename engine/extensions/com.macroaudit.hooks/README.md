# com.macroaudit.hooks（反向域名扩展目录）

hooks 仅作触发 / 呈现面（per ADR-0008）：
- PostToolUse / Stop：呈现 receipt、注入证据就绪上下文。
- 永不作裁决执行点 —— 裁决一律环境外执行（内核 CLI / CI gate）。