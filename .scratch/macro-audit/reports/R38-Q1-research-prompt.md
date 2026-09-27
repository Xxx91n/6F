# R38-Q1 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（品牌 6F／内核 macro-audit）。产品形态=Agent Plugin 五层盒（确定性 CLI 内核＋MCP 只读查询面＋skills 方法论壳＋可选宿主扩展＋报告模板资产——ADR-0008）；分发渠道=纯 Agent Plugins（ADR-0016，npm publish 渠道 deferred——D-067⑧）；当前态=preview capability 4/5（Macro-B/Macro-C/Micro-A/Micro-B 已 preview，Macro-A 未上架）；marketplace listing 已活在 GitHub（Xxx91n/6F，`6f@xxx91n`，git-clone 无构建步，dist/cli.js esbuild 单文件 bundle 随源进仓）。运行面实测：selftest 5/5 PASS；doctor 四腿全 ok（duckdb win32-x64 绑定在盘 1.5.5-r.5、git 2.55、npm registry 可达）；demo 场景 3 件（happy-path/degraded-supply/degraded-incomplete 合成夹具）；真实仓审计先例在案（r36 审计窗 jiahao/env-manager 实测）；origin/main 已推至 r37 态。

用户新问：「我们的这个能不能用？什么时候试试效果？我这有 codebuddy 可以直接安装试一下效果」。宿主=腾讯 CodeBuddy（Code/CLI）。已取证事实（勿重复验证）：CodeBuddy 实现 Claude-Code 同构插件体系——`/plugin marketplace add`/`install`/`enable`/`uninstall`、`/plugin-validate`、`/reload-plugins`、`/skills`；plugin.json manifest 字段面含 commands/agents/skills/hooks/mcpServers/lspServers；skills 加载位=.codebuddy/skills/（项目级）与 ~/.codebuddy/skills/（用户级）＋插件级 skills/；占位符=${CODEBUDDY_PLUGIN_ROOT}（未设定的环境变量占位符保留字面量不替换）；项目级 .mcp.json 直接支持（local>project>user 优先级，项目级首连需用户审批，非交互面须 --settings 预配）。

已知可移植性缺口：engine/.mcp.json 写死 `${CLAUDE_PLUGIN_ROOT}/dist/cli.js`——CodeBuddy 只认 ${CODEBUDDY_PLUGIN_ROOT}，字面量残留→MCP 拉起必败（预期失效面）。manifest 目录约定：本仓用 .claude-plugin/（仓根 marketplace.json＋engine/.claude-plugin/plugin.json）＋engine 根 plugin.json（agent-plugins.org 通用 schema）；CodeBuddy 侧插件 manifest 目录名与 marketplace.json 字段兼容性未实证。hooks 扩展=extensions/com.macroaudit.hooks 仅 README 桩（无真实 hook 发货）。skills=engine/skills/macro-audit 单件 SKILL.md。

在途债务面：#75批2=348 条字面钉普查册分档实修（multi-hit 76／existence-assert 115／date-literal 53／magic-floor 51 等族）；r37 审计报告 §10/§11 非阻塞呈报七件（38-F2 support 枚举过松、25-C5a 尾格扫描盲区、37-C2 欠数不可检出、20-A5 SQL 未剥注释、26/28/30 check-commit 机件重复、known-red-manifest 笔误、01-spotcheck 缺尾行）；升格后收口判据=guard-all-run 60 件动态枚举全量跑＋红集⊆known-red-manifest＋册件复绿 strict 告警（已生效）。

## 问题

试用射程裁——候选：
(a) 窄射程：锐评核销呈报（零残余裁面已定）＋试用推迟独立轮再裁；
(b) 中射程：核销呈报＋试用三裁——宿主面（纯 MCP 挂载／插件全路径／CLI 裸跑或其组合）、目标仓（本仓自审／jiahao·env-manager 既有对象／新外部仓）、验收判据（什么算「试出效果」）；r37 呈报七件全部挂批2 不逐裁；
(c) 宽射程：(b)＋兼容性预期失效面本轮裁定（预修成宿主无关形态 or 如实留作试用实证目标）＋批2/试用排序裁（试用先行拿真实宿主反馈喂批2 优先级，还是批2 清零后再出仓）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：ADR-0016 纯插件渠道与 D-067 分发轨道/npm deferred 语义边界、ADR-0017 preview 分级发布与 capability 标注纪律（不虚报先例）、ADR-0008 五层盒、D-066 .mcp.json 单一口径「禁兄弟 mcp.json 同位遮蔽」、D-075 分层自愈（CLI 自动补拉 vs MCP 永不自动拉＋doctor --fix 唯一主路＋MACRO_AUDIT_SELFHEAL opt-in）、D-052 Plugin/Marketplace 双层命名、D-146 评审摄入四档分诊（试用反馈回流走哪条道）、D-144①④ 收口前置核对、D-148 Accepted-Risk 三要素/grandfather 生效时点、D-149 守卫组升格条款、以及账本中一切涉及试用/pilot/预览/对外曝光/宿主适配的条款）；
2. 回顾 docs/adr/（0008 五层盒、0016 纯插件渠道、0017 preview 分级、0020 托管平台适配、0021 出站许可证）与 CONTEXT.md（Agent Plugin、Release Preview、Default Mode、Plugin/Marketplace 双层命名、Kernel/Agent 职责边界、Demonstration Scenario、Watch Tri-state）；
3. 工业界成熟落地的心智模型（重点）：开发者工具 preview/beta 试用项目惯例（dogfooding→early-access→preview→GA 分层；pilot 验收判据=onboarding 摩擦量化、time-to-first-value、known-issues 台账 vs 阻塞修复门槛）；多宿主插件/扩展可移植性工程先例（VSCode↔forks、Obsidian、Claude Code 插件生态跨宿主适配、占位符/环境变量抽象惯例=宿主抽象层 vs per-host 清单两条路线）；MCP server 跨宿主分发成熟形态（.mcp.json 模板化、mcp market/smithery、stdio 宿主无关惯例）；field-trial/technical-preview 已知缺陷策略（ship-with-known-issues＋known-limitations 文档 vs fix-before-pilot）；外部试用与内部整改排序先例（早期真实宿主反馈介入 vs 内部清零再曝光）；Windows＋Node 原生绑定分发风险先例；
4. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（冲突则该 D-xxx 需标 revised 呈报新决策，禁静默改向）。特别核查两点边界：①若调研认为 CodeBuddy 试用构成「分发渠道扩张」，对照 ADR-0016 判它是渠道语义内的宿主新增（合规）还是新渠道（须裁）；②若建议预修占位符/宿主清单，对照 D-066（.mcp.json 单一口径禁同位遮蔽）与 ADR-0008 五层盒分层（宿主扩展层职责）评估冲突面。
