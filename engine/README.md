# macro-audit — engine（6F 仓库里的内核子目录）

> 本目录挂在 6F 这个单仓里（单仓 + 子目录 + but 分支）。决定和术语写在哪，只看 [`docs/authority.md`](../docs/authority.md)；本目录的测试和契约检查脚本在 `test/`。
> 名字说明：`macro-audit` 是内核的技术名字（命令行和包名、MCP 服务名 `macro-audit-kernel`、skills 路径都不改）；对外品牌叫 **6F**。两个名字故意不一样（D-093），这是定下来的规矩，不是没做完的事。

## 目录结构（Agent 插件的五层）
- plugin.json（标准清单）/ .claude-plugin/plugin.json（Claude Code 原生清单）—— 两份都由 manifest.meta.json 这一个元数据来源生成
- skills/macro-audit/（方法论说明，只读）
- .mcp.json（内核的只读证据查询入口，走 stdio——Claude 会自动从这里发现；整个目录只放一个 .mcp.json（D-066），不许旁边再放一个同名的把前一个盖掉）
- extensions/com.macroaudit.hooks/（hooks 的触发和呈现）
- src/cli.ts（内核命令行；计划里一共四种外壳，现在只做了命令行这一种）

## 常用命令
- npm run gen      # 生成两份清单（先比对再写）+ docs/adr/README.md 索引 + README 致谢段和中文 README 里的同步标记
- npm run build    # tsc 编译 + build-bundle（用 esbuild 把 dist/cli.js 覆写成单文件包；dist 跟着源码一起进仓 #59/D-067）
- npm run package  # npm pack --dry-run
- npm run smoke    # 快速试跑（进程能活着 + 最小一条端到端）
- npm test         # gen + build + smoke
- npm run selftest       # 5 项自检（等同 node dist/cli.js selftest）
- npm run demo:golden  # demo 三个场景的 golden 逐字节比对（definitions 改了要走 PR，规矩同前）
- npm run check:docs   # 文档只读检查（生成的清单和索引跟仓里的一致不一致、各处指针有没有断；具体查什么看脚本本身）

## 命令行有哪些命令
- `macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh] [--strict-quarantine|--no-strict-quarantine]` —— 主审计命令（#53/D-060）：对真实仓库做审计。流程是先用 repoAdd 判断输入（本地路径默认可用 / owner-repo 先找本地 / URL 要明确同意），再走共享管线（`src/audit/macro-b.ts` 的策略部分 + codelore 的行为部分，和 demo 用同一套；`src/audit/macro-c.ts` 是 Macro-C 历史演化部分——#84/D-204②④，移植 38 管线，再用 anysearch-cli 的原始语料重新校对并核对；`src/audit/micro-a.ts` 是 Micro-A PR 部分——#85②/D-204③④，移植 48 管线），最后产出按报告模板生成的报告和 facts.duckdb。
  - `--scale` 默认 `Macro-B`（已经能跑的是 `Macro-B` · `Macro-C` · `Micro-A`——`src/audit/audit.ts` 的 `AUDIT_SCALES_IMPLEMENTED`）；没做的档位不假装——返回结构化的 `SCALE-NOT-IMPLEMENTED`，并以 exit 2 退出。
  - 不写 `--out`：报告 md 走 stdout；写 `--json` 改走 sidecar JSON；写 `--out <dir>` 时两份都写（`report.md`/`report.json`/`audit-facts.jsonl`/`audit-measurements.json`/`facts.duckdb`），跑完会在 stdout 打印回执 JSON。
  - `--refresh`：要刷新接进来的远端仓库 URL 缓存时明确打开（#55/D-059⑦；不会自动 pull）；快照时点和缓存命中情况写进 measurements.intake 和报告的预览说明块。
  - `--strict-quarantine` / `--no-strict-quarantine`：Quarantine 严格档的开关（D-110④ 优先顺序：命令行开关 > 环境变量 > 配置文件；环境变量是 `MACRO_AUDIT_STRICT_QUARANTINE`）。
- `macro-audit audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]` —— Micro-B 文件卡（#80/D-122·D-126）：文件卡按需补采，这是唯一的写入入口（MCP 这边永远不写）；`--db` 必填——它指定观测集存在哪里，文件不存在就新建一个只往后加的库。
- `macro-audit repo add <path|owner/repo|url> [--cache <dir>] [--refresh]` —— 判断 repo 输入（本地路径 | owner/repo 先找本地 | URL 要明确同意并单独隔离 clone；远程配置执行一律 disabled、拒绝浅克隆、hooks 设为 noop、protocol.ext.allow=never）。
- `macro-audit demo [scenario] [--out <dir>] [--json] [--keep] [--list]` —— 用合成 fixture 演示跑通（三个场景的 golden 逐字节固定；`--list` 列出 happy-path / degraded-supply / degraded-incomplete）。
- `macro-audit mcp [--db <facts.duckdb>]` —— MCP stdio 服务端（内核 MCP 只读入口；数据库地址按 `--db` → `MACRO_AUDIT_FACTS_DB` 环境变量 → 都没有就报用法或结构化错误）。
- `macro-audit mcp facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n]` —— MCP 只读 facts 查询（固定列集 + LIMIT，不接受裸 SQL）。
- `macro-audit mcp quarantine [--db <path>] [--run <run_id>] [--field <name>] [--limit n]` —— quarantine_log 的只读查询（#78/D-113②），和 mcp facts 一样只读出限定列。
- `macro-audit selftest` / `doctor [--fix]` / `--version` / `--help` —— selftest = 5 项自检；doctor = 运行时做三项探测（duckdb 能不能开库 / git / 上游能不能连上，输出结构化 JSON，探测失败会明确报出来；#62/D-059③），`--fix` 是 DuckDB 自动修复唯一明确的入口。

## 插件安装（Claude Code · 靠 git clone 分发 · #59/D-067）

**前置条件**：Node.js ≥ 22.18（用 `node --version` 自查；从 22.18 起内置 TypeScript 类型剥离，不用加 flag，`test/contracts/` 里三个检查脚本直接读 `.ts` 源码就靠这个）；Claude Code 2.x。

```text
/plugin marketplace add Xxx91n/6F
/plugin install 6f@xxx91n
```

从市场安装等于 git clone，不走构建——能直接跑的 `dist/cli.js`（esbuild 打成的单文件包）跟着源码一起进仓（这是 actions/javascript-action 的做法；忘了重新 build，CI 的 rebuild-diff 检查会拦住）。`.mcp.json` 用 `node` 加 `${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp` 启动内核 MCP 服务；不要只写命令名再靠 PATH 去找（官方排错文档明确说这是错误做法，T6 那次事故就是它），现在已经禁掉。

**验收**：跑 `/mcp` 确认 `macro-audit-kernel` = connected；或者在插件目录跑 `node dist/cli.js selftest`（5/5 就说明活着）。

**两种安装方式下的能力差别**（git clone 不会带 node_modules）：
- 不需要额外依赖就能用：`selftest` / `doctor`（运行时探测，细节见上面的命令说明；#62/D-059③）/ `--version` / MCP 握手（initialize・tools/list）/ `repo add` / `demo --list`
- 需要 duckdb 原生绑定才能用：`mcp facts` / `mcp quarantine` / `audit` / `audit file` / `demo` 的实际运行——**按功能分层自动修复**（#66/D-075 修订版，接 D-072）：**命令行交互这边**第一次用会自动补拉（要联网约 40MB，stderr 提前说明最长 240 秒，可以 Ctrl-C 中断）——store.ts 只拉 `@duckdb/node-bindings-<platform>@1.5.5-r.5` 这一个包（`npm install --no-save --omit=dev` 加完整性校验，每个进程最多 1 次）；**MCP 和 CI 这种没人守着的情况永远不自动拉包**——缺包时返回结构化的 `DUCKDB-UNAVAILABLE`，分四段写清楚（为什么缺、怎么修、能做什么、怎么主动开启），不会把进程直接搞崩：修法是在插件目录跑 `macro-audit doctor --fix`（就是上面说的自动修复入口），或者 `npm install --omit=dev`；想主动开启就设 `MACRO_AUDIT_SELFHEAL=1`，只对当前进程生效（代价是最多卡 240 秒，在 MCP 这边就是卡住 JSON-RPC）。默认模式在 MCP 这边缩小了范围，照实登记：命令行这边还是「装一次就能用」；**MCP 这边要「安装 → doctor --fix（或设环境变量）」1~2 步——在 MCP 这边用提前说明代替自动拉包**。
- npm 渠道要分清：本仓自己用 `npm publish` 发布这条路仍然暂缓（D-067⑧ 不动），这和插件目录里 `npm install` 做依赖拉取是两回事（那只是用上游的包，不是自己发布）——两者别混着读。

**Windows 上已知的问题**：Claude Code 在 hook 这边展开 `${CLAUDE_PLUGIN_ROOT}` 有还没关闭的 issue（anthropics/claude-code#43380 / #65579）；MCP stdio 的 exec-form 按官方说法只是纯字符串替换，理论上不受影响，但 Windows 实机还是要以 `/mcp` 实测结果为准。失败了怎么查：用 `claude --debug` 看 MCP init 日志；如果 server 没 connected，先跑 `node dist/cli.js selftest`，分清是「宿主没拉起来」还是「进程拉起来就崩」。

**宿主兼容说明**（D-150④ 要求写注记②，R38-Q1 查过官方中英文两份资料）：CodeBuddy 官方声明兼容 Claude Code 插件规范——`${CODEBUDDY_PLUGIN_ROOT}` 优先，`${CLAUDE_PLUGIN_ROOT}` 和 `.claude-plugin/` 目录作为兼容项保留并自动识别——`.mcp.json` 里固定写成 `${CLAUDE_PLUGIN_ROOT}` **已经实测能用**（R38 T1 试用 CLI 2.151.0 时三个存疑点全部实测：marketplace.json 被读、插件级 `.mcp.json` 自动发现拉起、占位符在 Windows 能展开——证据件 `trials/codebuddy-r38-report.md` 已经随治理文档一起退役，git 历史里能查到）；IDE 形态还没覆盖（docs/known-gaps.md 里 GAP-HOST-01 这条已经按「接受这个风险」记在缺口表上，不能拿命令行的结果往外推；D-155②）。

## 验收
编译通过、打包通过、能启动并通过活体测试；每个平台的测试都在仓根的 .github/workflows/engine-ci.yml 里跑（只监听 engine/** 的改动），push 之后以 CI run 的结果为准。

## 出处清单（Agent 插件分发形态 / R2-04）
- LICENSE ✓ / CHANGELOG ✓ / PROVENANCE.md（签名收据 + SLSA 明确写出降级声明）
