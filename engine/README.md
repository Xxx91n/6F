# macro-audit — engine（6F 单仓子目录 · walking skeleton）

> 位于 6F 单仓的 engine/ 子目录（per ADR-0011：单仓 + 子目录 + but 分支）。spec/契约来源：.scratch/architecture-recovery/spec.md ## R2。

## 结构（Agent Plugin 五层盒子）
- plugin.json（标准）/ .claude-plugin/plugin.json（Claude Code 原生）—— 由 manifest.meta.json 单一元数据源生成
- skills/macro-audit/（方法论壳，只读）
- mcp.json（kernel MCP 只读证据查询面，stdio）
- extensions/com.macroaudit.hooks/（hooks 触发/呈现面）
- src/cli.ts（内核 CLI；四外壳为规划目标，当前仅 CLI 外壳落地）

## 命令
- npm run gen      # 生成双 manifest + 防漂移校验（先比后写）
- npm run build    # tsc 编译
- npm run package  # npm pack --dry-run
- npm run smoke    # 启动并测活（进程存活 + 最小 e2e）
- npm test         # gen + build + smoke

## 验收
编译通过 / 打包通过 / 启动并测活；每平台 test 闭环 = 仓根 .github/workflows/engine-ci.yml（paths: engine/**），需 push 后以 CI run 结果为准。

## provenance（per ADR-0008 / R2-04）
- LICENSE ✓ / CHANGELOG ✓ / PROVENANCE.md（签名收据 + SLSA 显式降级声明）
