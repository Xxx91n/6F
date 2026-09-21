# macro-audit — engine（6F 单仓子目录 · walking skeleton）

> 位于 6F 单仓的 engine/ 子目录（per ADR-0011：单仓 + 子目录 + but 分支）。spec/契约来源：.scratch/architecture-recovery/spec.md ## R2。
> kernel 代号注记：`macro-audit` 为 kernel 技术标识（CLI/bin、MCP 服务名 `macro-audit-kernel`、skills 路径保留不动）；门面品牌名 = **6F**（双名分层 D-093——内部名故意不同于营销名=纪律非债）。

## 结构（Agent Plugin 五层盒子）
- plugin.json（标准）/ .claude-plugin/plugin.json（Claude Code 原生）—— 由 manifest.meta.json 单一元数据源生成
- skills/macro-audit/（方法论壳，只读）
- .mcp.json（kernel MCP 只读证据查询面，stdio——Claude 自动发现位；单一 .mcp.json 口径见 D-066，禁兄弟 mcp.json 同位遮蔽）
- extensions/com.macroaudit.hooks/（hooks 触发/呈现面）
- src/cli.ts（内核 CLI；四外壳为规划目标，当前仅 CLI 外壳落地）

## 命令
- npm run gen      # 生成双 manifest + 防漂移校验（先比后写）
- npm run build    # tsc 编译 + build-bundle（dist/cli.js=esbuild 单文件 bundle 覆写，dist 随源进仓 #59/D-067）
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

## 插件安装（Claude Code · git-clone 分发 · #59/D-067）

**Prerequisites**：Node.js ≥ 20（`node --version` 自检）；Claude Code 2.x。

```text
/plugin marketplace add Xxx91n/6F
/plugin install 6f@xxx91n
```

marketplace 安装 = git clone 无构建步——可运行体 `dist/cli.js`（esbuild 单文件 bundle）随源进仓（actions/javascript-action 先例；忘 rebuild 由 CI rebuild-diff 守卫拦截）。`.mcp.json` 以 `node` + `${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp` 启动 kernel MCP server——裸命令名+PATH 为官方排错表明示反模式（T6 事故），已禁。

**验收**：`/mcp` 确认 `macro-audit-kernel` = connected；或在插件目录 `node dist/cli.js selftest`（5/5 即活）。

**能力分级**（git-clone 不带 node_modules）：
- 零依赖可用：`selftest` / `doctor`（运行时三腿探测：duckdb 可开库/git/上游连通——结构化 JSON 输出，探测失败非静默；#62/D-059③）/ `--version` / MCP 握手（initialize・tools/list）/ `repo add` / `demo --list`
- 需 duckdb 原生绑定：`mcp facts` / `audit` / `demo` 实跑——**按面分层自愈**（#66/D-075 revised 承接 D-072）：**CLI 交互面**首次使用自动补拉（需网络 ~40MB，stderr 预告最长 240s 可 Ctrl-C 中断）——store.ts 精确拉 `@duckdb/node-bindings-<platform>@1.5.5-r.5`（`npm install --no-save --omit=dev`＋完整性校验，每进程至多 1 次）；**MCP/CI 无人值守面永不自动拉包**——缺失时返回结构化 `DUCKDB-UNAVAILABLE` 四段披露（缺失原因→修复路径→能力边界→opt-in）而非进程崩溃：修复=插件目录 `macro-audit doctor --fix`（自愈唯一显式主路）或 `npm install --omit=dev`；opt-in=设 `MACRO_AUDIT_SELFHEAL=1` 本进程启用自动补拉（代价：阻塞最长 240s，MCP 面即阻塞 JSON-RPC）。Default Mode 收窄如实登记：CLI 面「一次安装命令」语义不变；**MCP 面=install→doctor --fix（或 opt-in env）1~2 步——补偿机制在 MCP 面以披露替代自动**。
- npm 渠道辨析：本仓 npm publish 渠道维持 deferred（D-067⑧ 不动）≠插件目录 `npm install` 依赖拉取（消费上游包非自发布）——两者勿混读。

**Windows 已知 bug 链**：Claude Code 对 `${CLAUDE_PLUGIN_ROOT}` 的展开在 hook 面有 open issue（anthropics/claude-code#43380 / #65579）；MCP stdio exec-form 官方口径为纯字符串替换、理论免疫，但 Windows 真机以 `/mcp` 实测为准。失败引导：`claude --debug` 看 MCP init 日志；若 server 未 connected，先 `node dist/cli.js selftest` 区分「宿主未拉起」与「进程拉起即崩」。

## 验收
编译通过 / 打包通过 / 启动并测活；每平台 test 闭环 = 仓根 .github/workflows/engine-ci.yml（paths: engine/**），需 push 后以 CI run 结果为准。

## provenance（per ADR-0008 / R2-04）
- LICENSE ✓ / CHANGELOG ✓ / PROVENANCE.md（签名收据 + SLSA 显式降级声明）
