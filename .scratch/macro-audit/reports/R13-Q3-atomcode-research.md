# R13-Q3 atomcode 深度调研报告 — hooks 层存废：五层盒子第④层的名实裁定

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q3-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q3，FTS 已索引）；atomcode 会话锚 cdcfc34d-bc8a-4543-8b86-ca11709455f8。
> 冲突协议结果：**零 revised——ADR-0008 勘误注记（决策本体不动）＋CONTEXT 词条同步＋registry 触发器登记**。

## §1 执行摘要

**推荐 (d) 纯勘误**：hooks 第④层名实收窄为「可选呈现面/规范合法声明位」——ADR-0008 勘误注记＋CONTEXT 词条同步＋触发器登记（激活条件=真实呈现需求信号；激活动作=候选 (b) 的最小 Stop/PostToolUse 呈现面），目录与 manifest 声明保留，零实物建设。置信高。

## §2 分点结论

**① hooks 不是 Agent Plugins 1.0.0 可移植组件**——规范 §8 明文 client-specific 文件走反向域名目录；v1 可移植组件恰为 skills+mcp.json 两类（§7）；官方示例仓逐字「Hooks and similar capabilities are not portable v1 components」且禁止 plugin.json 顶层加 hooks/agents/commands 字段；Google 官方称反向域名目录为 escape hatch「Clients that don't recognize it ignore it」。【已读 agent-plugins.org/specification、agent-plugins-example、Google 官方博客】

**② 更尖锐事实：`com.macroaudit.hooks/` 这个目录名没有任何宿主会去读**——宿主 hooks 交付惯例按各自命名空间：VS Code/Copilot 读 `com.github.copilot/hooks/hooks.json`，Claude 读插件根 `hooks/hooks.json`，Copilot 旧格式读根 `hooks.json`（VS Code 文档三格式对照表原文）。com.macroaudit 是自造命名空间非任何客户端所有——该目录在任何宿主侧都 inert，唯一现实功能=「规范合法的意图声明位」。这直接证伪原预设「复用 hooks 分发面作审计触发面」的技术前提——即使 jiahao 未解耦，com.macroaudit 命名空间也无人消费。【已读 code.visualstudio.com agent-plugins 档、code.claude.com plugins-reference】

**③ 职责边界先例与 ADR-0008 原释义兼容**：SessionStart=stdout 注入上下文（bootstrap/提醒面）；Stop=回执/收尾呈现与 turn 守卫——karanb192 的 nerf-receipts（SessionStart+PostToolUse+Stop 组合）是「hooks 作 receipt 呈现面」最贴切先例；PreToolUse=门禁面（allow/deny）。社区口诀与 research.md §4.2 一致。【已读 karanb192/claude-code-hooks 22 hook 插件化先例、hidekazu-konishi 事件分布综述】

**④ 「无 hooks 的审计/评审插件」先例存在、多见、被接受——行业默认形态就是 skills-only**：jeremymorgan/code-review-skills（22 审计 skill 打包上架无 hooks）、hebstr/claude-code-plugins、dualform-labs/review-audit（主打「read-only、structurally unable to report a PASS it didn't verify」）、CloudSecurityPartners/skills（其 /skill-audit 把 Hook Analysis 列**最高优先风险面**：「hooks execute without user consent」）。VS Code 官方对插件 hooks 挂 Caution。**对审计产品而言 hooks 是信任税不是功能增益——我们的卖点恰是「可核验、少一层不可审的自动执行面」**。

## §3 对比矩阵（要点）

(a) 改写级联最大＋违勘误留痕惯例＋删掉规范合法声明位后未来实建反而要重新发明放置位置；(b) 仅 Claude 宿主有效＋触发宿主安全审查＋无需求信号即属 D-031 禁止的「为撑形态补资产」；(c) 撞 SoundGate 结构性天花板＋多宿主私有协议维护黑洞；(d) 残余风险=目录+README 仍可能被读作「有实物层」——缓解=ADR 注记＋CONTEXT 词条＋README 一行三处成对落盘。

## §4 与本仓 current 决策冲突点排查（点名）

- **ADR-0008**：唯一被触动 ADR——勘误注记收窄层④释义（「可选呈现面、宿主专属非可移植、现为声明位」），决策本体（五层盒子、hooks 永不作裁决执行点）不改写；与 D-053 登记的 R2-Q7 违规 #5 同型——本勘误正是消除「声明↔实物不一致」的成对动作。
- **CONTEXT.md「Agent Plugin（本产品用法）」词条**：字面含「反向域名扩展目录（hooks 触发/呈现面）」——须随勘误同步收窄为「可选呈现面（声明位）」，否则词条与 ADR 漂移。
- **engine/plugin.json**：extensions.com.macroaudit.hooks 声明合法保留；description「五层盒子」字样不动（(a) 才引发级联；(d) 对 D-052 已封口命名面零扰动）。
- **D-046**：零冲突——jiahao 只读化正是「复用前提消失」的既登记原因。
- **ADR-0016/D-027**：零冲突——hooks 非可移植组件的规范事实反而加固「纯 Agent Plugins 可移植核心」渠道判断。
- **D-031/D-032/ADR-0017**：(b)(c) 若现在实建即违「不交付未绑定已上架能力的资产/演示」；(d)＋触发器登记零冲突，且触发器登记本身是 Trigger-gated Closure 标准应用。
- **D-013**：CONTEXT Micro-A 词条含「触发器为每次 push 或 hook」——此 hook 指 git/CI hook 语义非宿主 hooks 层，无须触动但建议注记一句排歧防未来读者混淆。

## §5 各候选已知失败模式（汇总）

- **(a)**：改写级联最大（ADR+CONTEXT+manifest description+listing 文案）；违勘误留痕惯例；删声明位后未来实建要重新发明放置位置。
- **(b)**：SessionStart 注入每会话 token 成本；插件 hooks 触发宿主安全审查（VS Code Caution＋skill-audit 类工具列 hooks 为最高风险面）；仅单宿主有效跨宿主即重写；无用户需求信号支撑即属 D-031 禁止的「为撑形态补资产」。
- **(c)**：SoundGate 结构性天花板＋190 项失效清单＋多宿主私有协议维护面——jiahao 批评「沙子上盖楼」整体适用本品。
- **(d)**：残余风险=勘误不彻底（只改 ADR 不改 CONTEXT）；缓解=三处成对落盘（ADR 注记＋CONTEXT 词条＋README 一行「声明位，无 hook 实物，实建见触发器登记」）。

## §6 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Agent Plugins Specification 1.0.0 | agent-plugins.org/specification | Official | §7/§8 组件类型与客户端扩展规范原文 |
| 2 | VS Code — Agent plugins | code.visualstudio.com/docs/agent-customization/agent-plugins | Official | 三宿主 hooks 路径对照表＋hooks 安全 Caution |
| 3 | Claude Code Plugins reference | code.claude.com/docs/en/plugins-reference | Official | 插件 hooks=根 hooks/hooks.json；32 事件表 |
| 4 | Agent Plugins 1.0（Crosley） | blakecrosley.com/blog/agent-plugins-standard | Comparative | 闭合 schema 十字段、无 provenance/signing 层 |
| 5 | agent-plugins-example 官方示例仓 | github.com/agentplugins/agent-plugins-example | Official | 「Hooks are not portable v1 components」逐字 |
| 6 | karanb192/claude-code-hooks | github.com/karanb192/claude-code-hooks | Community | 22 hook 插件化先例；事件分布；34–114ms 实测 |
| 7 | jeremymorgan/code-review-skills | github.com/jeremymorgan/code-review-skills | Community | 无 hooks 审计插件被接受先例① |
| 8 | hebstr/dualform-labs/CloudSecurityPartners 三例 | github 搜索摘要级 | Community | 无 hooks 先例②③④；hooks=最高风险审计面 |
| 9 | Claude World hooks guide | claude-world.com/articles/hooks-guide | Community | 「零 hooks 为基线」成文政策 |
| 10 | Claude Code Hooks Complete Guide | hidekazu-konishi.com/entry/claude_code_hooks_complete_guide.html | Comparative | SessionStart stdout 注入语义 |
| 11 | 本仓 research.md §4／memory.md | .code-tmp/ | Official+Criticism | 190 项限制、SoundGate、官方语义划分 |
| 12 | 本仓 ledger/ADR | 本仓 | — | 冲突排查底座 |

## §7 信息缺口

- Cursor/Kiro 宿主插件 hooks 写法未逐一定点读原文（VS Code 三格式表已给兼容格局，风险低）；
- 「带 hooks 的审计类插件在 Agent Plugins 生态上架且被好评」正面先例未查得——若视为必查项下轮可定向扫 SkillsMP 目录；
- (b) 若未来触发实建，「receipt 呈现 hook」最小 JSON 形态未做设计稿——属触发后工作。

**一句话裁定**：选 (d)——hooks 第④层名实收窄为「可选呈现面/规范合法声明位」，ADR-0008 勘误注记＋CONTEXT 词条同步＋触发器登记（激活条件=真实呈现需求信号，激活动作=候选 b 的最小 Stop/PostToolUse 呈现面），目录与 manifest 声明保留，零实物建设。
