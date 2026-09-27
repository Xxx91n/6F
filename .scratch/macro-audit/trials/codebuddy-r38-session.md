# CodeBuddy 插件链 feasibility 试用 —— session 记录（R38）

>  charter=`codebuddy-r38-charter.md`（判据预声明/Kill Criterion 已入库，临场不可改）。本件=SBTM 三件套之 session 记录——骨架先行落盘（D-151②），实测读数随试用会话逐格回填；未跑项标 `not-run`＋原因（预声明规则）。
> 记录者=本侧 agent；CodeBuddy 侧 agent 操作=用户驱动面（宿主内点击不代行）。

## 环境快照（charter §环境快照字段）

| 字段 | 读数 | 状态 |
|---|---|---|
| CodeBuddy 版本＋形态（IDE/CLI） | _待试用会话读数_ | pending |
| 插件安装树 SHA | _待 `/plugin install` 后读_ | pending |
| OS | Windows 11 | 实测 |
| 文档基线 SHA | pinned `sha256:7d9e8e96aedd8ac1`（engine/README.md @commit 456c845e） | 钉死 |
| 文档基线备注 | 当前 HEAD 面 README sha256=`96a3d0a66f6c9f72`——r38 收口 commit 2d63c7c2 依 D-150④ 注记义务②加宿主兼容注记两行所致；C1「文档外干预步」判读仍以 pinned 基线所指安装指引为准，漂移行如实披露 | 披露 |
| 目标仓 SHA | env-manager `9eb8f24be508750f299e920d816ba9079771a3f1`（本机实测 `git -C D:\Aworker\env-manager rev-parse HEAD`，与 charter pin `9eb8f24b` 前缀一致） | 实测 ✓ |
| 开发仓 HEAD | `954783e04e8d8c0d1748bab3f39c6412128f76b9`（r38-closeout 分支顶） | 实测 |
| worktree dirty | `git status --short` 计数=13（48-golden×11/56-heldout/75a-census-findings——r37 审计复跑再生残留簿记态；依 D-152④ 预声明：不入判据只作环境披露，审计读数以安装树为准） | 披露 |
| 市场文件面 | `.claude-plugin/marketplace.json` 在盘（plugin `6f` source `./engine`，marketplace `xxx91n`）；`.codebuddy-plugin/`、`.workbuddy-plugin/`、根级 `.mcp.json` 均不在 | 实测 |
| TBS 计时 | _可选——单人短窗降为可选字段（D-152⑥ R-c）_ | opt |

## CLI 基线预检（开发树侧非判据读数——正式 C1/C2 基线=安装树 dist/cli.js，charter §执行路径步5）

| 项 | 命令 | 读数 |
|---|---|---|
| 编译 | `cd engine && npm run build` | BUNDLE-OK dist/cli.js（tsc+esbuild） |
| dist 棘轮 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B / cap 289395B |
| 测活 | `node dist/cli.js selftest` | ok=true 5/5（manifest/shells=4/mode 单值/mcp read-only/receipt 5 字段） |
| 打包 | `npm pack --dry-run` | macro-audit-0.1.0.tgz 85 件 255.4kB |
| 测试闭环 | `npm run smoke`（22 件） | 全绿 exit 0（smoke 6/6・collectors 14/14・codelore 7/7+41/41+25/25・micro-b 18/18・report-preview 5/5・intake 40/40・gitcli 11/11・sql-literal 17/17・mcp-db 12/12・audit 26/26・demo/github-rest/upstream-map/narrative/citation 38・doctor 9・quarantine 58/58・audit-zero-write 4/4・dialect 19/19・file-card 36/36） |
| drift | `git status --short engine/src engine/dist` | 0 件（重建字节一致） |

## 判据读数格（试用会话逐格回填；未跑=not-run＋原因）

| 判据 | 可操作定义（charter） | 读数 | 命中 |
|---|---|---|---|
| C1 安装链 | marketplace add→install→/mcp connected→selftest 5/5，零文档外干预步 | _pending_ | _pending_ |
| C2 效果 | env-manager Macro-B 审计（CodeBuddy agent 驱动）↔安装树 cli.js 直跑字段级 parity | _pending_ | _pending_ |
| C3 披露 | stability:preview＋Macro-A not-yet＋会话内 agent 话术 preview 语义 | _pending_ | _pending_ |

## 三悬点实测格

| 悬点 | 读数 |
|---|---|
| 仓根 .claude-plugin/marketplace.json 被 CodeBuddy 市场读取 | _pending_ |
| 插件级 .mcp.json 自动发现（macro-audit-kernel 注册） | _pending_ |
| Windows 真机 ${CLAUDE_PLUGIN_ROOT} 展开（/mcp connected 即证） | _pending_ |

## 逐步命令＋读数流水

| # | 命令/操作 | 输出要点 | 文档外干预? |
|---|---|---|---|
| 1 | `/plugin marketplace add Xxx91n/6F` | _pending_ | _pending_ |
| 2 | `/plugin install 6f@xxx91n` | _pending_ | _pending_ |
| 3 | `/mcp` | _pending_ | _pending_ |
| 4 | `node <安装树>\engine\dist\cli.js selftest`（若 /mcp 未 connected 的分流探针） | _pending_ | _pending_ |
| 5 | 本仓自审（agent 经 skills 壳对 D:\Aworker\6F 跑审计） | _pending_ | _pending_ |
| 6 | env-manager 效果审（agent 驱动 `audit D:\Aworker\env-manager`） | _pending_ | _pending_ |
| 7 | 对照基线 `node <安装树>\engine\dist\cli.js audit D:\Aworker\env-manager --out <tmp>` | _pending_ | _pending_ |
| 8 | 字段级 parity 比对（字段键集＋语义不变量定点值，D-132 锁面） | _pending_ | _pending_ |

## findings 登记（五要素票面，deduplicate-first）

> 每条：①复现步骤（命令/URL 级）②环境快照③严重度④来源（C1~C3/悬点编号）⑤D-146 四档去向建议（快照属实·现状已修→不进裁定链／仍开放→立 D-xxx 或挂批2／无法核实→pending+复审时点／可证伪→驳回附依据）。**先与三悬点清单+既有账面互斥再分诊。**

| id | 概要 | 复现步骤 | 环境 | 严重度 | 来源 | 四档建议 | dedup 对照 |
|---|---|---|---|---|---|---|---|
| F-01 | _pending_ | | | | | | |

## 关窗核对（exit 轴——成功轴独立取值）

- [ ] 三判据全跑完＋每条有读数（not-run 亦算读数，须附原因）
- [ ] findings 全过 D-146 四档初分（≠终裁）
- [ ] session 记录落盘 trials/（本件）
- [ ] debrief 报告落盘 `codebuddy-r38-report.md`（标题=「CodeBuddy 插件链 feasibility 试用报告」）
- [ ] 关窗不注册 registry 事件（D-151②/D-152⑤ 负向沿行）；未实测残项→manual_watch 五要素接力

