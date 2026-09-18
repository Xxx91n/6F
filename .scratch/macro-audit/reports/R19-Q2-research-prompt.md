# R19-Q2 调研题面 — kernel CLI 外部用户路径：插件装上但跑不动的分发缺口

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 66 条：60 current/3 revised/3 承继吸收）；
- **必读**：decision-ledger 全部 current 记录（重点 D-037 upstream-lock 版本纪律、D-038 分发面 A+C 双轨、D-052 插件名/市场名、D-058 Kernel/Agent 边界、D-060 audit 命令、D-066 manifest 契约守卫）；ADR-0008（五层盒子：内核 CLI 随插件分发）、ADR-0016（纯 Agent Plugins 分发）、ADR-0017（preview 分级）、ADR-0021；CONTEXT 词条（Agent Plugin 五层盒子、Default Mode 一次安装命令、Repo Intake、Kernel/Agent 职责边界）；
- 缺口实证（T6，2026-09-18）：插件 `6f@xxx91n` GitHub marketplace 实装成功，但 `.mcp.json` `command="macro-audit"` 依赖全局 PATH；marketplace install=git clone（无 npm lifecycle/构建步），`engine/dist/` gitignored→clone 内 kernel 不存在；本机能跑=engine/ 下 `npm i -g .` 狗食路径；外部用户拿 clone 只有 src+package.json 无 dist；README/SKILL 无安装前置指引；
- 工程实况：kernel=TypeScript→dist/cli.js（bin 名 macro-audit）；MCP server=stdio；selftest 子命令存在（本机 ok:true 5/5）；分发路径 A=GitHub marketplace（已实证）、C=tgz（npm pack 面存在但未发布 npm registry，A-030 deferred）；
- 环境：Windows 11 主机、Git Bash、Node.js 工程、CI=GitHub Actions。

## 选项
- (a) 自包含化：dist 构建产物进分发面（commit dist 或单文件 bundle 入库），`.mcp.json` 改插件根相对路径调用——一键闭环零外部依赖，代价=产物入 git＋dist/src 同步守卫；
- (b) 纯文档指引：README/SKILL 写前置条件（Node＋clone 内 npm ci+build+npm i -g）＋selftest 验收步——诚实但重 toolchain 转嫁用户；
- (c) npm publish macro-audit＋文档两步安装——正规但解锁新渠道决策（npm 授权/包名/发布纪律）；
- (d) 组合：(a) 自包含为主＋README/SKILL 文档同票（无 PATH 依赖说明＋selftest 验收）；npm publish 维持 deferred；
- (e) 缓挂：外部实装样本≥1 再裁。

## 调研问题
1. Agent Plugin / MCP server 分发的「运行体到达」工业心智：git-clone 型插件如何分发可运行 kernel——${CLAUDE_PLUGIN_ROOT} 类相对路径变量的官方支持实况（.mcp.json/plugin.json 字段级）；commit 构建产物 vs release 分支 vs registry 依赖（npx/bunx -y）三形态的取舍先例；单文件 bundle（esbuild/ncc/pkg 单 executable）进仓的实践；
2. Claude Code 插件生态实证：官方/社区插件中带 MCP server 者如何解决命令解析——bundled runtime、全局 CLI 前置、npx 惰性拉取各占多少；官方文档对 plugin 内 MCP server command 解析路径（PATH vs 相对路径 vs 变量展开）的明文口径；
3. 构建产物入版本控制的治理先例：dist 入库的成熟模式（release-only 分支/commit dist+CI rebuild-diff 守卫/单文件 bundle）；「生成物即源码」的脏树/漂移防治惯例（actions/javascript-action 生态 dist 入库强制要求正是先例）；
4. 「一次安装命令」Default Mode 语义下的用户路径设计：插件生态（VS Code ext/Chrome ext/Claude plugin）对「装上即可用 vs 装上还需手动配 runtime」的期望管理；prerequisites 文档化的成熟形态（安装前置章/自检命令/错误时引导）；
5. 候选逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-038 分发面 A+C、ADR-0008 五层盒子内核 CLI 定位、D-037 锁定纪律、D-058 Kernel/Agent 边界、ADR-0016 纯插件分发）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) 分发修复要素清单（推荐方向展开：.mcp.json 写法/dist 入库形态或替代/文档指引要素/selftest 验收步/守卫断言面）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。