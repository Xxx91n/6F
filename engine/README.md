# macro-audit — 工程仓（walking skeleton）

> 由 spec 仓 D:/Aworker/6F 的 ADR-0010 授权另起。spec/契约来源：D:/Aworker/6F/.scratch/architecture-recovery/spec.md ## R2。

## 结构（Agent Plugin 五层盒子）
- plugin.json（标准）/ .claude-plugin/plugin.json（Claude Code 原生）—— 由 manifest.meta.json 单一元数据源生成
- skills/macro-audit/（方法论壳，只读）
- mcp.json（kernel MCP 只读证据查询面，stdio）
- extensions/com.macroaudit.hooks/（hooks 触发/呈现面）
- src/cli.ts（内核 CLI，四外壳同二进制）

## 命令
- npm run gen      # 生成双 manifest（防漂移）
- npm run build    # tsc 编译
- npm run package  # npm pack --dry-run
- npm run smoke    # 启动并测活（liveness + 最小 e2e）
- npm test         # gen + build + smoke

## 验收
编译通过 / 打包通过 / 启动并测活 / 每平台 test 闭环（CI matrix）。