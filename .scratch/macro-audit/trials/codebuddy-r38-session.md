# CodeBuddy 插件链 feasibility 试用 —— session 记录（R38）

>  charter=`codebuddy-r38-charter.md`（判据预声明/Kill Criterion 已入库，临场未改）。本件=SBTM 三件套之 session 记录——骨架先行落盘（D-151②），实测读数已于 2026-09-27 会话逐格回填。
> 记录者=本侧 agent。charter 预设「宿主操作=用户驱动面」按宿主仅 IDE 形态假设——实测本机装有 `@tencent-ai/codebuddy-code` CLI 2.151.0，`plugin marketplace/install` 子命令与 `-p` 会话面齐备，本侧 agent 直接驱动（宿主点击面不在本次覆盖内，如实记）。

## 环境快照（charter §环境快照字段）

| 字段 | 读数 | 状态 |
|---|---|---|
| CodeBuddy 版本＋形态（IDE/CLI） | `@tencent-ai/codebuddy-code` v2.151.0，CLI（npm 全局，`~/AppData/Roaming/npm/codebuddy`） | 实测 |
| 插件安装树 SHA | marketplace clone `665256737bb21299e1974ce28ddaf4225d49b524`（=远端 main 顶 `origin/main`，落后本地开发栈 r38-batch2-a——安装树读数以远端为准，差异如实披露）；插件缓存 `~/.codebuddy/plugins/cache/xxx91n/6f/0.1.0/`（dist/cli.js=263151B 与本仓棘轮读数逐字节同） | 实测 |
| OS | Windows 11 | 实测 |
| 文档基线 SHA | pinned `sha256:7d9e8e96aedd8ac1`（engine/README.md @commit 456c845e） | 钉死 |
| 文档基线备注 | 当前 HEAD 面 README sha256=`96a3d0a66f6c9f72`——r38 收口 commit 2d63c7c2 依 D-150④ 注记义务②加宿主兼容注记两行所致；C1「文档外干预步」判读仍以 pinned 基线所指安装指引为准，漂移行如实披露 | 披露 |
| 目标仓 SHA | env-manager `9eb8f24be508750f299e920d816ba9079771a3f1`（双侧审计回执 head_sha 逐字吻合） | 实测 ✓ |
| 开发仓 HEAD | `954783e04e8d8c0d1748bab3f39c6412128f76b9`（r38-closeout 分支顶，session 骨架落盘时点读数） | 实测 |
| worktree dirty | `git status --short` 计数=13（骨架落盘时点；审计窗复跑再生残留簿记态；依 D-152④ 预声明：不入判据只作环境披露，审计读数以安装树为准） | 披露 |
| 市场文件面 | `.claude-plugin/marketplace.json` 在盘（plugin `6f` source `./engine`，marketplace `xxx91n`）；`.codebuddy-plugin/`、`.workbuddy-plugin/`、根级 `.mcp.json` 均不在 | 实测 |
| TBS 计时 | 未单列（短窗可选字段，D-152⑥ R-c） | opt |

## CLI 基线预检（开发树侧非判据读数——正式 C1/C2 基线=安装树 dist/cli.js，charter §执行路径步5）

| 项 | 命令 | 读数 |
|---|---|---|
| 编译 | `cd engine && npm run build` | BUNDLE-OK dist/cli.js（tsc+esbuild） |
| dist 棘轮 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B / cap 289395B |
| 测活 | `node dist/cli.js selftest` | ok=true 5/5 |
| 打包 | `npm pack --dry-run` | macro-audit-0.1.0.tgz 85 件 255.4kB |
| 测试闭环 | `npm run smoke`（22 件） | 全绿 exit 0 |
| drift | `git status --short engine/src engine/dist` | 0 件 |

## 判据读数格（2026-09-27 实测回填）

| 判据 | 可操作定义（charter） | 读数 | 命中 |
|---|---|---|---|
| C1 安装链 | marketplace add→install→/mcp connected→selftest 5/5，零文档外干预步 | 全四步 PASS：`marketplace add Xxx91n/6F` ✔（11.3s，type=github）→ `install 6f@xxx91n` ✔（4.8s，scope=user enabled）→ 会话内 macro-audit-kernel ready:true（facts/file_card/quarantine 三工具暴露）→ 安装树 `node dist/cli.js selftest` ok:true 5/5。唯一干预步=`doctor --fix`（10.6s 补拉 win32-x64 bindings）——pinned README L45 明示「MCP 面=install→doctor --fix 1~2 步」，属文档内路径非文档外干预 | **hit** |
| C2 效果 | env-manager Macro-B 审计（agent 驱动）↔安装树直跑字段级 parity | 双侧产出五件产物；report.json 键集 70=70 零非对称；17 语义锚（report_id/scale/stability/verdict/head_sha/tree_sha/fact_count=960/commit_count=496/adr_count=14/codelore pin v0.28.0/…）零 diff；audit-facts.jsonl 双侧 960 行×872583B；audit-measurements.json 逐字节等 | **hit** |
| C3 披露 | stability:preview＋Macro-A not-yet＋会话内 agent 话术 preview 语义 | report.md 披露块齐：`stability: preview · capabilities: macro-b`、`capability 1 of 5 · preview`、`not_in_preview: Micro-A / Macro-C / Macro-A`、结构限制如实（supply-chain unverified/one-shot 快照时点披露）；agent 会话话术带 preview 语义＋如实报 SCALE-NOT-IMPLEMENTED 自纠 | **hit** |

## 三悬点实测格

| 悬点 | 读数 |
|---|---|
| 仓根 .claude-plugin/marketplace.json 被 CodeBuddy 市场读取 | ✅ `marketplace add Xxx91n/6F` 成功（type=github，known_marketplaces.json 落 xxx91n 条目，installLocation 实测在盘） |
| 插件级 .mcp.json 自动发现（macro-audit-kernel 注册） | ✅ 会话内 server ready:true、三工具暴露（`codebuddy mcp list` CLI 面不列插件注入项——展示面盲区见 F-02） |
| Windows 真机 ${CLAUDE_PLUGIN_ROOT} 展开（/mcp connected 即证） | ✅ MCP server 拉起成功即证展开正确（node + 展开路径 stdio） |

## 逐步命令＋读数流水

| # | 命令/操作 | 输出要点 | 文档外干预? |
|---|---|---|---|
| 1 | `codebuddy plugin marketplace add Xxx91n/6F` | ✔ 'xxx91n' added（type=github），11.3s | 否 |
| 2 | `codebuddy plugin install 6f@xxx91n` | ✔ installed 0.1.0 scope=user enabled，4.8s | 否 |
| 3 | `/mcp` 等价面：`-p` 会话探针 | macro-audit-kernel ready:true；暴露 facts/file_card/quarantine；`codebuddy mcp list` 空列（见 F-02） | 否 |
| 4 | `node <安装树>distcli.js selftest` | {"ok":true} 5/5（manifest/shells/mode/mcp read-only/receipt） | 否 |
| 4a | 首跑 audit 探针 | DUCKDB-UNAVAILABLE 四段结构化披露（非崩溃）→ `doctor --fix` 10.6s 自愈成功（文档内主路，pinned README L45） | 否（文档内步） |
| 5 | 本仓自审（`-p` 会话驱动 `audit D:/Aworker/6F`） | supported；306 commits/ADR 23/facts 797；agent 如实报 SCALE-NOT-IMPLEMENTED 并自纠默认层 | 否 |
| 6 | env-manager 效果审（`-p` 会话驱动 `audit D:/Aworker/env-manager`） | supported（confidence 0.6）；产物五件落 codebuddy-run/ | 否 |
| 7 | 对照基线 `node <安装树>distcli.js audit D:/Aworker/env-manager --out baseline/` | supported；head_sha=9eb8f24… 钉吻合；产物五件落 baseline/ | 否 |
| 8 | 字段级 parity 比对 | 键集 70=70；锚 17/17 零 diff；facts 960 行两侧 872583B；measurements byte-equal | 否 |

## findings 登记（五要素票面，dedup-first）

> 每条：①复现步骤②环境快照③严重度④来源⑤D-146 四档去向建议。已先与三悬点清单+既有账面互斥。

| id | 概要 | 复现步骤 | 环境 | 严重度 | 来源 | 四档建议 | dedup 对照 |
|---|---|---|---|---|---|---|---|
| F-01 | 安装树首跑 audit/mcp-facts 面缺 `@duckdb/node-api` 原生绑定→DUCKDB-UNAVAILABLE；`doctor --fix` 10.6s 自愈 | marketplace add→install→`node <安装树>/dist/cli.js audit <repo>` | win11/cb-2.151.0/安装树 66525673 | low | C1 步4a | **不进裁定链**——快照属实但系 D-075 设计内文档化补偿（pinned README L45「MCP 面 1~2 步」明示）；实证补偿机制按设计工作 | 悬点清单无此项；D-075 账面已载 |
| F-02 | `codebuddy mcp list` 不列插件注入的 MCP server（显示 "No MCP servers configured"），会话内实已 connected——宿主展示面盲区，易致用户误判 | install 后 `codebuddy mcp list` vs `-p` 会话内探针 | 同上 | low | 悬点② | **不进本仓裁定链**——宿主侧行为（CodeBuddy 本体），非本仓插件缺陷；留宿主适配层观察项 | 与 F-01 不同面（一为绑定缺失一为展示盲区） |
| F-03 | 安装树=远端 main 顶 66525673，落后本地开发栈（r38 二窗未 push）——用户实装即此态 | `git -C <marketplace clone> rev-parse HEAD` vs 本地 HEAD | 环境披露 | info | 环境快照 | **不进裁定链**——环境披露非缺陷；判据读数已按 charter 以安装树为准 | — |
| F-04 | `--scale macro` 未实装报 SCALE-NOT-IMPLEMENTED；agent 如实披露并自纠落默认 Macro-B | `cli.js audit <repo> --scale macro` | 安装树 66525673 | info | 步5 | **不进裁定链**——结构化错误如实披露=设计行为（Default Mode 收窄先例同型） | — |

## 关窗核对（exit 轴——成功轴独立取值）

- [x] 三判据全跑完＋每条有读数
- [x] findings 全过 D-146 四档初分（≠终裁；四条均「不进裁定链」级，理由附票面）
- [x] session 记录落盘 trials/（本件）
- [x] debrief 报告落盘 `codebuddy-r38-report.md`（标题=「CodeBuddy 插件链 feasibility 试用报告」）
- [x] 关窗不注册 registry 事件（D-151②/D-152⑤ 负向沿行）；未实测残项：宿主 GUI/IDE 形态未覆盖（CLI 形态已实证）→如需 IDE 面复核转 manual_watch 五要素接力

## exit/success 双轴结论

- **exit 完备性**：五格关窗核对全勾。
- **success**：C1 hit / C2 hit / C3 hit——判据轴全命中（成功轴独立取值：安装链可用＋效果 parity 全等＋披露诚实；findings 四条全为 info/low 级设计内行为，无阻塞缺陷）。
- **形态限定**：本窗实证=CLI 宿主形态（v2.151.0）；IDE 形态未覆盖，判据命中不自动外推。
