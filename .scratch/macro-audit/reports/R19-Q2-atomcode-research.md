# R19-Q2 调研报告：kernel CLI 外部用户路径——插件装上但跑不动的分发缺口

> atomcode 深调研（2026-09-18 实跑；9 searches/5 角度全覆盖/5 原文核验，置信高）。题面=R19-Q2-research-prompt.md。

## 1) 执行摘要

**推荐：(d) 组合——(a) 自包含化为主＋(b) 文档同票；npm publish 维持 deferred。置信度：高。**

官方文档**明文支持**插件 `.mcp.json` 中 `${CLAUDE_PLUGIN_ROOT}` 在 stdio server 的 `command/args/env` 三字段全量展开（MCP 官方页＋plugins-reference 双页原文核验），「插件根相对路径调用 kernel」是官方钦定正路；marketplace install=git clone 意味着可运行体必须随源进仓或用 `node`+bundle 单文件启动，官方 actions/javascript-action 模板（dist 入库＋CI rebuild-diff 守卫）正是成熟先例。唯一硬约束=Windows 上 `${CLAUDE_PLUGIN_ROOT}` 展开存在 open bug 链（#43380/#65579，hook 面已实锤；MCP server 面官方文档口径为 exec-form 纯字符串替换，理论可行但须真机验收），故 selftest 验收步＋Windows 标注是必须保险。

## 2) 分点结论

**2.1 `${CLAUDE_PLUGIN_ROOT}` 官方支持实况（字段级）——高置信，双源原文核验**
- 官方 MCP 页逐字：插件 MCP server 配置「Path placeholders: `${CLAUDE_PLUGIN_ROOT}` resolves to the plugin's installation directory」，替换适用面表列 **stdio servers: `command`, `args`, `env`**；官方示例=`"command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server"`。
- plugins-reference 补三点：① 三变量均「exported as environment variables to hook processes and to MCP and LSP server subprocesses」；② 官方排错表把「MCP server fails」first cause 写为「Missing `${CLAUDE_PLUGIN_ROOT}`」——**裸命令名+PATH 是官方明示反模式**；③ 插件更新后路径变，需 `/reload-plugins`。
- 反面参照：openai/codex #22842 实证别家宿主不支持插件内相对路径——此变量是 Claude Code 特有契约，本仓 D-038 目标宿主恰是 Claude Code，契约成立。

**2.2 git-clone 型插件分发可运行 kernel 的三形态——高置信**
| 形态 | 证据 | 判定 |
|---|---|---|
| bundled runtime 入仓（dist/bundle 随 clone＋`command:"node"`+`${CLAUDE_PLUGIN_ROOT}`） | 官方示例 `"command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/servers/server.js"]`；社区 L3Digital 同款 | **推荐**：零外部依赖、clone 即达 |
| 全局 CLI 前置（本仓现状裸 `macro-audit` 靠 PATH） | 官方排错表列失败首因；T6 已实证 | **现状缺陷，必须修** |
| `npx -y <pkg>` 惰性拉取 | 官方示例有 npx 条目 | 依赖 npm registry→与 A-030 deferred 冲突＋首呼延迟；**不采纳为主路** |

**2.3 构建产物入版本控制的治理先例——高置信**
- **actions/javascript-action（GitHub 官方模板）**：src/ 与 dist/ 并存于 main，README 明文「If you do not run this step（npm run bundle）, your action will not work correctly」——dist 入库是分发前提，git-clone 型分发体必须随源带可运行物的最强同构先例。
- **反面先例（VibeReference）不适用**：其论证前提=「CI/npm 会重新构建」——marketplace git-clone 无构建步，前提不成立。
- **漂移防治惯例**：CI rebuild 后 `git diff --exit-code dist/`（rebuild-diff 守卫，actions 生态标配）；dist 与 src 同 PR 提交；release-only 分支（releases/v1）可作升级位。
- **单文件 bundle**：esbuild `--bundle --platform=node` 成熟（devtails 实证 150MB→单文件）；caveat=`__dirname`/native `.node` 模块受限，必要时 `--packages=external`。单文件大幅压缩入库 diff 噪音与漂移面。

## 3) 对比矩阵

| 项 | 到达性 | 外部依赖 | 产物入 git 代价 | 治理守卫 | 决策冲突 | 判定 |
|---|---|---|---|---|---|---|
| (a) 自包含 | ✅ 一次安装闭环 | 仅 Node runtime | dist diff 噪音＋漂移 | CI rebuild-diff＋D-066 扩一条 | 无冲突；ADR-0008 同向兑现 | **主路** |
| (b) 纯文档 | ❌ 5 步手动 | Node＋npm toolchain | 零 | 无（文档腐烂） | CONTEXT 一次安装命令**正面冲突** | 仅作同票文档位 |
| (c) npm publish | ✅（npx/两步） | registry 授权/包名/纪律 | 零 | 供应链面 | **冲突 D-038**（A+C 未含 npm） | 维持 deferred |
| (d) 组合 | ✅ | 仅 Node | 同 (a) | 同 (a)＋文档 selftest | 无冲突 | **推荐** |
| (e) 缓挂 | ❌ 缺口持续 | — | — | — | 与 D-066 事故钉死纪律相反 | 否 |

## 4) 分发修复要素清单（推荐方向展开）

1. **`.mcp.json` 写法**（engine/mcp.json 改造）：`command:"node"`, `args:["${CLAUDE_PLUGIN_ROOT}/dist/cli.js","mcp"]`——变量放 `args` 不放 `command`（Windows 最小暴露面）；本机狗食路径不受影响（同文件两解析，npm i -g 照旧），建议本机也改 `--plugin-dir` 加载以与外部同构验收。
2. **dist 入库形态**：优先单文件 bundle（esbuild `--bundle --platform=node --outfile=dist/cli.js`；`__dirname`/native 模块 caveat，必要时 `--packages=external`＋最小 node_modules 子集——权衡后裁定）；退而求其次 tsc 多文件 dist 整目录入库。`engine/.gitignore` 去掉 `dist/`（或改仅忽略中间物）。
3. **同步守卫**：CI 步骤=`npm ci && npm run build && git diff --exit-code dist/`（rebuild-diff，actions 标配）——dist 与 src 漂移即红。挂入 34-check/41b 守卫链（D-066 同族扩展子项，不立大票）。
4. **文档指引要素**（README＋SKILL 同票）：① Prerequisites：Node ≥ X（`node --version` 自检）；② 安装两行：`/plugin marketplace add Xxx91n/6F`＋`/plugin install 6f@xxx91n`；③ 验收一步：`macro-audit selftest` 或 `/mcp` 确认 macro-audit-kernel connected；④ Windows 标注：`${CLAUDE_PLUGIN_ROOT}` 已知 bug 链提示＋失败引导（`claude --debug` 看 MCP init）。
5. **selftest 验收步**：现有 selftest（5/5）保持；补「bundle 到达性」检查（dist/cli.js 存在且 `node dist/cli.js --version` exit 0）。
6. **守卫断言面新增**：D-066 shape 钉扩展——`.mcp.json` 的 command 字段禁裸名（须为 `node` 或含 `${CLAUDE_PLUGIN_ROOT}`），防回退 PATH 依赖形态。

## 5) 各候选已知失败模式

- **(a)/(d)**：① dist 漂移（忘 rebuild 就 push）→ 第 6 点守卫兜住；② bundle 破坏 `__dirname`/worker/native 依赖（esbuild caveat）→ 打包后全量 smoke＋selftest；③ Windows `${CLAUDE_PLUGIN_ROOT}` bug（#43380/#65579 链）→ MCP 面 exec form 理论免疫但须真机验收＋文档标注；④ 插件更新后旧路径残留（官方：更新后需 reload）→ 文档提一句。
- **(b)**：五步 toolchain 转嫁=「一次安装命令」破约；文档与代码漂移无守卫；Windows npm 全局 PATH 缺失是高频事故。
- **(c)**：npm 授权/包名/发布纪律三面新决策（A-030 deferred 是 deliberate）；npx 首呼延迟＋registry 网络依赖（arXiv 2603.05344 实证 first-call latency 与 discovery 竞态）。
- **(e)**：T6 缺口已实证，D-066 刚立事故钉死纪律——缓挂与纪律直接矛盾；marketplace 已公开，缺口=现在进行时。

## 6) 与本仓 current 决策冲突排查

| 检查对象 | 冲突？ | 裁定 |
|---|---|---|
| D-038 分发面 A+C 双轨 | 无冲突，**兑现 A 轨**；npm 仍 deferred | 同向 |
| ADR-0008 五层盒子（内核 CLI 随插件分发） | 无冲突——现状（dist 不随 clone）才是名实落差；dist 入库使「随插件分发」成真 | 修复性同向 |
| D-037 upstream-lock 版本纪律 | esbuild 若进构建链按 D-037 入锁表（active/exact-version）——执行义务非冲突 | 加一条执行义务 |
| D-058 Kernel/Agent 边界 | 无冲突：修到达方式不动职责面 | 同向 |
| D-052 插件名/市场名 | 无冲突（6f@xxx91n 沿用） | 同向 |
| D-060 audit 一等命令 | 无冲突：selftest/audit 经 bundle 照常可达 | 同向 |
| D-066 manifest 契约守卫 | 无冲突且**扩展位**：第 6 点守卫断言是 shape 钉自然延伸 | 同向扩展 |
| ADR-0016 纯插件分发 | 无冲突：(a) 恰消除「装完还需手动 npm build」非纯插件残留；Node=宿主生态默认前提不算新渠道 | 同向 |
| CONTEXT「一次安装命令」Default Mode | (b) 单选会破约；(d) 使名实一致 | (d) 兑现 |

**无 revised 需求——(d) 与全部 current 决策同向或属其执行细化。**

## 7) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Claude Code Docs — MCP | https://code.claude.com/docs/en/mcp | Official | `${CLAUDE_PLUGIN_ROOT}` 字段级替换表（stdio: command/args/env）；npx 官方惯用 |
| 2 | Claude Code Docs — Plugins reference | https://code.claude.com/docs/en/plugins-reference | Official | 排错表「MCP server fails=Missing ${CLAUDE_PLUGIN_ROOT}」；三变量导出 MCP 子进程；官方 node 相对路径示例；更新后 reload |
| 3 | Claude Code Docs — Plugin marketplaces | https://code.claude.com/docs/en/plugin-marketplaces | Official | marketplace 相对路径解析规则 |
| 4 | anthropics/claude-code #65579 | https://github.com/anthropics/claude-code/issues/65579 | Criticism | Windows 变量未展开 bug＋关联链 #43380/#11984/#18527；hook 面实锤；exec form 修复方向 |
| 5 | openai/codex #22842 | https://github.com/openai/codex/issues/22842 | Criticism | 别家宿主不支持插件内相对路径——Claude 专属契约 |
| 6 | actions/javascript-action | https://github.com/actions/javascript-action | Official/先例 | dist 入库＋「不 bundle 就不工作」分发前提；releases/v1 形态 |
| 7 | VibeReference — commit dist? | https://www.vibereference.com/devops-and-tools/should-you-commit-dist-folder | Comparative | 反方先例及其不适用性论证（前提=CI/npm rebuild） |
| 8 | claudefa.st plugins-distribution | https://claudefa.st/blog/tools/mcp-extensions/plugins-distribution | Community | 插件社会契约「makes a working setup shareable」；`--plugin-dir` 测试纪律 |
| 9 | esbuild Getting Started | https://esbuild.github.io/getting-started | Official | `--bundle --platform=node` 单文件；`__dirname`/native caveat |
| 10 | devtails esbuild bundle | https://devtails.xyz/bundling-your-node-js-express-app-with-esbuild | Community | 单文件 bundle 部署实证 |
| 11 | L3Digital Claude-Code-Plugins mcp.md | https://github.com/L3Digital-Net/Claude-Code-Plugins/blob/main/docs/mcp.md | Community | 社区插件 `node dist/server.js`＋npx 两形态并存 |
| 12 | MetaMask CLI setup / ClaudeKit / Ritual / Specky docs | https://docs.metamask.io/agent-wallet/cli-setup/ 等 | Official/Community | prerequisites 文档化惯例（前置章/自检/错误引导） |

## 8) 信息缺口

1. **Windows Claude Code（CLI 宿主）下 MCP server 面 `${CLAUDE_PLUGIN_ROOT}` 真机验收**——bug 实锤全在 hook 面/Cowork；MCP 面 exec form 官方口径支持但缺一手复现。落票后第一条验收项：真机 `/plugin install` 后 `/mcp` 看 connected。
2. **本仓 kernel bundle 兼容性**（`__dirname`/duckdb native 模块是否被 esbuild 打包破坏）——需本地 `esbuild --bundle` 试跑 smoke 定 bundle vs tsc-dist 形态。
3. **官方/社区插件三种 command 形态占比**——无系统普查，只有官方示例与零散样例。
4. dist 单文件 bundle 与 D-037 锁表交互的 esbuild 版本锁定细节——留执行环节。