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

## CLI 命令面
- `macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]` —— 一等审计命令（#53/D-060）：Macro-B 实仓审计。链 = repoAdd 输入裁决（ADR-0009 三段式）→ `src/audit/macro-b.ts` 共享管线（策略面 + codelore 行为面，与 demo 同消费）→ 骨架报告 + facts.duckdb。
  - `--scale` 缺省 `Macro-B`（唯一已上架）；未实装层不假装——结构化 `SCALE-NOT-IMPLEMENTED` + exit 2。
  - 省略 `--out`：报告 md 走 stdout；`--json` 改走 sidecar JSON；`--out <dir>` 双写（`report.md`/`report.json`/`audit-facts.jsonl`/`audit-measurements.json`/`facts.duckdb`）后 stdout 打印回执 JSON。
  - `--refresh`：intake URL 缓存显式刷新 opt-in（#55/D-059⑦；不自动 pull）；快照时点/缓存命中披露落 measurements.intake + 报告披露块。
- `macro-audit repo add <path|owner/repo|url> [--cache <dir>] [--refresh]` —— repo 输入裁决（本地路径 | owner/repo 本地优先 | URL opt-in 隔离 clone；远程配置执行恒定 disabled、浅仓拒绝、hooks noop、protocol.ext.allow=never）。
- `macro-audit demo [scenario] [--out <dir>] [--json] [--keep]` —— 合成 fixture 演示跑通（三场景 golden 字节锁）。
- `macro-audit mcp [--db <facts.duckdb>]` / `mcp facts [--db <path>]` —— MCP stdio 只读 facts 投影面（db 寻址=--db → MACRO_AUDIT_FACTS_DB env，与 MCP 服务端链一致：arguments.db → server --db → env；全缺→usage/结构化错误）。
- `macro-audit selftest` / `--version` / `--help`。

## 验收
编译通过 / 打包通过 / 启动并测活；每平台 test 闭环 = 仓根 .github/workflows/engine-ci.yml（paths: engine/**），需 push 后以 CI run 结果为准。

## provenance（per ADR-0008 / R2-04）
- LICENSE ✓ / CHANGELOG ✓ / PROVENANCE.md（签名收据 + SLSA 显式降级声明）
