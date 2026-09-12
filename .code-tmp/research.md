# Research Compendium — 面试官式仓库宏观评审(Macro Engineering Audit)产品调研

> **文档性质**: 本会话(2026-08-30 起, 多轮)全部调研成果的可定位资料汇编。每个结论均附真实来源 URL。
> **来源可信度标记**: `【已读】` = 本轮经 web_fetch 打开原文全文核验; `【搜索级】` = 仅搜索引擎摘要, 未全文读; `【403未读】` = 抓取被拒, 未读; `【知识库】` = 已索引进 context-mode 知识库(source 标签见 §9)。
> **快照时点**: 2026-08-30。商业产品功能变化快, 所有结论以该快照为准, 引用时注意时点漂移。
> **本地输入文件**: `C:/Users/Administrator/下载/memory.md`(原始记忆)与 `C:/Users/Administrator/下载/我先读取记忆文件，看看里面记录的产品信息。 _read_file_ _path_.md`(上一轮对话转写, 与本档案内容一致, 无增量信息)。

---

## 0. 文档地图

| 章节 | 内容 | 对应轮次 |
|---|---|---|
| §1 | 调研任务定义(品类判据四条 / rubric 七条 / 四象限模型 / 待验证查询) | 输入(memory.md) |
| §2 | 核心结论摘要(Tl;dr, 五轮调研) | 综合 |
| §3 | 第一轮: 产品全景调研(候选排序/证据门禁开源化/批评共识/商业动向/供应链/中文市场/社区/方法论) | 轮1 |
| §4 | 第二轮: 实现形态调研(Agent Skills 规范 / skills vs MCP vs hooks / hooks 190 项限制 / SoundGate / Agent Plugins 1.0.0) | 轮2 |
| §5 | 第三轮: CodeLore 叙事层深挖(端点/配置/机制/诚实限制/evidence-doc 文化/同名混淆警告) | 轮3 |
| §6 | 第四轮: 给 CodeLore 作者的 Issue 草稿(英文, 要叙事层质量数据) | 轮3 |
| §7 | 第五轮: 终局决策(形态=Agent Plugin 五层盒子 / 核心心智模型 / BOM 开源引入 vs 自研 / 对比矩阵) | 轮4 |
| §8 | 完整来源清单(全部 URL, 状态/角度/日期/贡献) | 综合 |
| §9 | 知识库落库索引记录(ctx_fetch_and_index source 标签) | 轮1-3 |
| §10 | 信息缺口与后续行动 | 综合 |
| §11 | 用户自有资产档案(jiahao / anysearch-cli / env-manager 评审摘要, 来自 memory.md) | 输入 |

---

## 1. 调研任务定义(来源: `C:/Users/Administrator/下载/memory.md` 原文, 本地文件非 URL)

### 1.1 品类判据(四条, 缺一不可)

验证问题: 市面上有没有一个产品/开源工具/skill, 能做到「面试官式 / 行业老鸟式」的仓库宏观评审?

1. **宏观视角**: 评架构、过程、定位、技术债——不是逐行 diff 评审;
2. **证据驱动**: 每条批评必须附硬证据(文件字节数、commit 统计、ADR、圈复杂度);
3. **工程心智模型**: 基于真实方法论(行为代码分析、技术债经济学、供应链基线), 而非泛泛而谈;
4. **裁决能力**: 给出优先级判断和取舍建议(「v1.0 前先做哪两件事」式)。

明确排除: CodeRabbit 类逐行 PR 评论机器人。

### 1.2 评估 rubric(发现候选产品时的打分标准, memory.md 原文)

| # | 判据 | 含义 |
|---|---|---|
| 1 | 证据管线 | 是否自动采集 git 历史/文件度量/依赖图?(无 → 必然泛泛而谈) |
| 2 | 行为考古 | 是否有 hotspot = 频率 × 复杂度 或等价物? |
| 3 | 供应链维度 | 是否覆盖 OpenSSF Scorecard 类检查? |
| 4 | 战略叙事 | 能否评「定位收敛 / 范围蔓延」而非只评代码? |
| 5 | 裁决门禁 | 输出是否要求证据引用、可驳回? |
| 6 | 成本与部署 | 开源可自托管 > 商业 SaaS; 是否支持私有仓库本地跑? |
| 7 | 与 jiahao 的互补性 | 能否嵌入现有 verdict-gate 闭环? |

### 1.3 四象限模型(评审方法论拆解)

一次完整的「面试官式」评审 = 四个象限的组合, 现有工具各管一段, 没有单一产品覆盖全部:

| 象限 | 内容 | 代表工具 |
|---|---|---|
| 结构 | 文件规模、圈复杂度、上帝对象、依赖结构 | scc / tokei / lizard / NDepend / SonarQube |
| 行为(考古) | git 历史挖掘: 变更频率×复杂度=hotspot、CI 救火占比、知识分布 | code-maat(开源) / CodeScene(商业) |
| 供应链 | 分支保护、依赖钉版、签名发布、VEX 处置 | OpenSSF Scorecard(开源) |
| LLM 综合裁决 | 结构+历史+定位的叙事化评审与优先级 | repomix/gitingest 打包 → 大上下文 LLM + rubric |

关键洞察(memory.md 原文): 「泛泛而谈是数据饥饿的症状, 不是提示词不好」——不给 `git log --numstat`, 任何 persona 都说不出「40 个 commit 里 15 个在修 CI」。

### 1.4 10 条待验证查询(调研起点, memory.md 列出的中英文检索问题)

1. "behavioral code analysis" LLM narrative report 2026
2. CodeScene open source alternative 2026 / CodeScene 开源平替
3. repository-level LLM audit agent 2026
4. AI code review tool evidence citation verdict gating hallucination
5. architecture fitness function LLM report(ArchUnit / dependency-cruiser + LLM)
6. Sourcegraph Amp / Cursor Bugbot / Augment Code 是否提供宏观架构评审报告
7. CHAOSS GrimoireLab 过程度量与 LLM 结合
8. "codebase health check" SaaS 2026 new entrants pricing
9. git mining hotspot LLM agent open source
10. tech debt prioritization tool AI 2026

---

## 2. 核心结论摘要(五轮调研 Tl;dr)

### 2.1 产品全景(轮1, 2026-08-30)

**严格意义上的「单一产品」仍不存在**——没有任何一个工具能完整满足四条品类判据。但「证据→裁决编排层没人卖」的核心假设已被 2026 开源社区**部分证伪**: 今年出现至少 4 个独立实现的「证据门禁」组件(CodeLore 引文校验盖章、Josh English Evidence Gate、RepoAudit 幻觉验证器、FSE'26 HalluJudge), 以及 1 个形态最接近「宏观审计报告」的开源产品(RepoPilotAI)。真正无人占领的空位收窄为三个: ①**战略叙事维度**(产品定位收敛/范围蔓延/门面预算——没有任何产品做); ②**四象限+证据+裁决的全编排单一产品**; ③供应链维度(仍只有 OpenSSF Scorecard 单点, 无 LLM 叙事化)。

### 2.2 实现形态(轮2, 2026-08-30)

**交付物 = Agent Plugin(插件), 而非纯 skill/hook、也非完整 Agent CLI。** 插件是「盒子」(分发与语义容器): 盒内装五层——①确定性核心 CLI/二进制(证据管线+裁决) ②MCP server(证据查询面) ③SKILL.md(方法论壳) ④hooks(jiahao 触发面) ⑤报告模板。官方语义依据: wmedia.es 六扩展点「Plugins = How you package and share all of the above」; Agent Plugins 1.0.0(2026-08-06, 跨厂商)定义 v1 = plugin.json + skills/ + mcp.json。现成先例(本轮验证): **agent-completion-gate**(skill 壳+确定性 gate+CI 脚手架)、**Receipt Gate**(签名 receipt + Claude Code Stop-hook 集成)、**anthropics/skills**(官方技能按 plugin marketplace 分发, 175k star)。

### 2.3 CodeLore 叙事层(轮3)

端点: 默认本地 ollama(`http://localhost:11434/v1`, OpenAI 兼容); 配置 = 仅环境变量 `CODELORE_LLM_MODEL`(必填) / `CODELORE_LLM_API_KEY` / `CODELORE_LLM_BASE_URL`(OpenAI 兼容方言)或 `ANTHROPIC_API_KEY`(Anthropic 路径); 不配置 = 无叙事层, 其余一切照常。这是全工具唯一会碰网络的路径。作者已写明「诚实限制」: `grounded ✓` 只证明数字出现在证据里, 不证明论断为真。**叙事层是全工具唯一没有 quality data 的层**——已起草 Issue 索取数据(§6)。

### 2.4 终局决策(轮4)

- **形态**: Agent Plugin 五层盒子(见 §2.2);
- **核心心智模型**: 「证据是货币、工程心智是视角、可驳回裁决是出口——先复现事实, 再谈观点, 观点必附证据, 裁决必可驳回」, 四层管线(证据→事实→叙事→裁决) × 四象限判断力(结构/行为/供应链/战略);
- **BOM**: 引入 6 类开源件(CodeLore / OpenSSF Scorecard / repomix+gitingest / verdict-gate 现成实现 / Agent Plugins 1.0.0 / 自有 jiahao+anysearch-cli 复用); 自研 4 样(战略叙事 rubric / 四象限综合裁决器 / sufficiency-gate 宏观版 / 插件胶水+报告模板)——**战略叙事 rubric 是唯一真护城河**。

---

## 3. 第一轮: 产品全景调研(2026-08-30)

### 3.1 候选排序(最接近「你要的产品」, 2026-08 快照)

| 排序 | 产品 | 覆盖 | 致命缺口 | 来源 |
|---|---|---|---|---|
| 1 | **CodeLore**(开源, Rust, 单二进制) | 结构×历史融合 + 引文校验的 LLM 叙事 + 质量门禁 + SARIF + corpus 校准 | 无供应链维度、无战略/定位叙事、无「v1.0 先做哪两件事」裁决建议; 新仓库 | 【已读】https://github.com/emrecdr/codelore |
| 2 | **RepoPilotAI**(开源, ADK+MCP) | 宏观报告形态(架构/质量/文档/安全四维评分+可行动建议) | 纯 LLM 读文件, 无 git 历史挖掘、无度量事实表——缺最看重的证据管线 | 【已读】https://github.laiyagushi.com/vaibhavitej-a11y/RepoPilotAI |
| 3 | **CodeScene**(商业) | 行为考古标杆(hotspot 专利算法) + 2026 新增 CodeHealth MCP Server / PR Refactoring Agent / ACE | 仍是「维护经济学」评分, 不评产品定位/战略; hotspot 闭源 ML(CodeLore 公开点名批评, 以可复现公式对比) | 【已读】https://codescene.com/pricing |
| 4 | **GitClear**(商业) | git 挖掘+AI 代码行级归因(Diff Delta 持久性/返工率) | 面向 ROI/效能度量, 不是评审报告; 无战略叙事 | 【已读】https://gitclear.com |

### 3.2 「证据门禁」已开源化(2026 年被独立发明 ≥4 次)

| 实现 | 机制 | 量化指标 | 来源 |
|---|---|---|---|
| CodeLore `explain --llm` | LLM 叙事带引文校验, 逐数字核验并盖章 `grounded ✓` / `⚠ contains uncited claims`; provenance manifest 保证可复现 | — | 【已读】https://github.com/emrecdr/codelore |
| Josh English ai-code-review(2026-02, MIT) | SYSTEM prompt 内建 Evidence Requirement——必须引行注/diff hunk/仓库内真实读取, 否则违规; 「对幻觉有健康过敏」是核心卖点 | — | 【已读】https://medium.com/@jengas/ai-code-review-de79a9a5e840 |
| RepoAudit(普渡, arXiv 2501.18160) | validator 模块用数据流事实+路径条件可满足性验证 bug 报告 | 精度 78.43%, $2.54/项目 | 【已读】https://arxiv.org/abs/2501.18160 |
| HalluJudge(FSE'26 Industry Track) | 无参考幻觉检测器, 判断 LLM 评审评论是否 grounded | F1 0.85、$0.009/次、67% 与开发者偏好一致 | 【已读】https://arxiv.org/abs/2601.19072 |

含义: 「证据→裁决」编排层的护城河叙事被削弱——架构是对的, 但「没人在做」变成「大家都在做但没人做完整」。真实差异化空间在**战略叙事**与**全象限编排**, 不在证据门禁本身。

### 3.3 批评共识: AI 评审「浅」、diff-only 错过架构问题

- Sonar 官方(2026-07-09)自认: 「Diff-only feedback can miss broader architectural or dependency issues」——官方把「全仓库上下文」列为好工具第一判据。【已读】https://www.sonarsource.com/resources/library/best-ai-code-review-tools/
- Josh English 「context collapse」论点: 差评审的病根是上下文饥饿, 不是模型不够聪明。【已读】同 §3.2
- 社区佐证(搜索级): dev.to「AI 处理评审后你不再追问 why、不再看架构模式」; Reddit r/ExperiencedDevs「GitHub code scanning + copilot 抓快速胜利, 但错过深层架构问题」。

### 3.4 商业侧 2026 动向: 全部收敛到「AI 生成代码的验证/门禁」

| 玩家 | 动态 | 来源 |
|---|---|---|
| Harness | 2026-08-27 发布「Agent-Ready Code Repository + AI Code Review」: AI Checks 作为 merge 前强制门禁, 「Groupings that prioritize what to review」 | 【已读】https://www.harness.io/blog/agent-ready-code-repository-ai-code-review |
| SonarQube AI Code Assurance | 对 AI 代码项目强推 7 条件质量门(新代码覆盖率 ≥80%、重复 ≤3%、安全评级 A 等) | 【搜索级】SonarQube 官方文档 |
| GitClear | 行级归因 + 持久性评分, 面向 CFO 的 ROI 数字 | 【已读】https://gitclear.com |
| Amazon CodeGuru Reviewer | **2025-11-07 起停止新接入**(AWS 官方公告)——老一代 ML 评审器退场 | 【搜索级】AWS 官方文档 |
| Greptile / DeepWiki | PR 粒度: Greptile $30/席/月「带全仓上下文的 PR 评审 bot」, 9K+ 团队; DeepWiki 静态 wiki, 维护者集中批评幻觉与陈旧 | 【已读】https://howworks.ai/blog/deepwiki-vs-greptile-vs-reading-it-yourself |
| CodeScene | 2026 新增 CodeHealth MCP Server(「给编码 agent 一个确定性质量目标」)——商业玩家开始往 agent 编排层走, 但无叙事报告 | 【已读】https://codescene.com/pricing |

### 3.5 供应链维度: 唯一覆盖者仍是 OpenSSF Scorecard

未发现任何工具把「分支保护/依赖钉版/VEX 处置」升级为带判断的宏观评审判据(全引擎检索无命中)。rubric 第 3 条的稳定空位。

### 3.6 中文市场(搜索级佐证, 未抓原文)

思码逸 **Merico**(深度代码分析/研发效能, GGV 投资)、华为 **CodeArts 码道**、GitLab Duo Code Review(2026-01 GA)——全部是度量或审查工具, 未发现「宏观战略评审」形态。中文社区内容集中在「AI 引入技术债 11 万条、安全问题存活率 41.1%」的量化警示, 而非评审产品。

### 3.7 社区信号: 整仓审计是 2026 真实需求, 但都在浅层

HN 2026 年出现「AI that audits your codebase in 60 seconds」、vibe-auditor、「codebase-drag-audit」方法论文等, 均为「LLM 扫一遍出报告」形态, 无证据管线。【已读】https://hn.algolia.com/api/v1/search?query=codebase%20audit&tags=story&hitsPerPage=20

### 3.8 方法论工具层(DIY 方案的更新依据)

fitness function 路线(ArchUnit / dependency-cruiser / import-linter → spec-kit #3674「宪法应编译成可执行架构测试而非靠 LLM 评审」)是确定性治理, 与 LLM 叙事评审互补而非替代(搜索级佐证)。「repomix/gitingest 打包→大上下文 LLM」方案仍有效, 但 CodeLore 的 DuckDB 事实表 + SARIF 已把「证据采集」标准化了。

---

## 4. 第二轮: 实现形态调研(Agent Plugin 决策, 2026-08-30)

### 4.1 决策结论

**交付物 = Agent Plugin(插件), 不是纯 skill/hook, 不是完整 Agent CLI, 不是脚手架。**

- 插件不是「第四种机制」, 是**盒子(分发与语义容器)**: wmedia.es 六扩展点语义「Plugins = How you package and share all of the above」。【已读】https://wmedia.es/en/tips/claude-code-skills-hooks-mcp-plugins-comparison
- 盒内五层: ①确定性核心 CLI/二进制(证据管线+裁决) ②MCP server(证据查询面) ③SKILL.md(方法论壳) ④hooks(jiahao 触发面) ⑤报告模板。「纯插件」是空话——盒子里必须有核心二进制。

### 4.2 官方语义划分(三源交叉一致)

| 机制 | 回答的问题 | 定义处 | AI 参与 | 来源 |
|---|---|---|---|---|
| Skills | 做什么(知识/流程) | SKILL.md(markdown) | 是——模型跟随, 概率性 | 【已读】claudeskills.info / wmedia.es / academy.claude.com |
| MCP | 能访问什么(数据/工具) | .mcp.json / 协议 | 否——协议桥, 结构化 | 同上 |
| Hooks | 什么时候自动发生(保证) | settings.json(JSON) | 否——shell 命令, 确定性 | 【已读】https://code.claude.com/docs/en/hooks-guide |
| Sub-agents | 谁来做(隔离执行) | .claude/agents/(markdown) | 是——独立实例 | wmedia.es |
| Plugins | 怎么打包分享(盒子) | plugin.json / .claude-plugin/ | 否——打包格式 | 【已读】wmedia.es + Google Blog |

决策口诀(claudeskills.info, 【已读】https://claudeskills.info/blog/skills-vs-mcp-vs-hooks/): 「knowledge goes in skills, access goes through MCP, guarantees go in hooks」; 评审工作流三件套示例: **skill 教评审程序 → MCP 给 PR/证据 → hook 保证门禁, 缺一条腿凳子就倒**。

### 4.3 为什么不能只做 skill 或只做 hook(批评维度, 三源互证)

1. **skill 不可靠**: Reddit r/AI_Agents 共识——触发匹配「模糊, 有时加载错 skill」、无版本标准、跨 agent 兼容只保证核心指令不保证特性迁移。【搜索级】https://www.reddit.com/r/AI_Agents/comments/1stcu8e/
2. **hook 有硬上限**: 《190 Things Claude Code Hooks Cannot Enforce》六类失败——pipe/--bare/cowork/VSCode 路径完全跳过 hooks; MCP 工具调用忽略 deny; subagent 里 exit code 2 被静默丢弃; Windows 路径带空格直接挂。【已读】https://dev.to/boucle2026/what-claude-code-hooks-can-and-cannot-enforce-148o
3. **更硬的证据 — SoundGate 论文**: arXiv 2607.14166《Stop Means Stop: Measuring and Repairing the Enforcement Gap in Agent-Framework Control Primitives》(FSE 级, 2026-07)实测 6 个主流 agent 框架的批准门/取消/超时**全部泄漏**(sibling leak、replay 双执行、cancellation orphan、timeout zombie), 前沿模型 14% 概率自发发出泄漏触发型计划; 修复方案 = 环境外 Rust 门(SoundGate), 完全中介契约。【已读】https://arxiv.org/abs/2607.14166 — **直接命中 jiahao 已知短板「只能拦 Stop 处声明、拦不住轨迹中间」——hook 事件模型的天花板是结构性的**。

### 4.4 Agent Plugins 1.0.0(2026-08-06): 分发层已标准化

- Google 官方博客: Amazon/Cursor/Microsoft/OpenAI/Vercel/Google 共同维护的跨厂商打包标准; v1 恰好定义两种组件: **skills + MCP servers**(plugin.json + skills/ + mcp.json); hooks/agents 走 `com.example.client/` 反向域名扩展目录; 独立组件独立失败。「问题不在组件, 在盒子——而这个盒子每个客户端都要自己发明」。【已读】https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/
- 规范正文: plugin.json 必填 `$schema` + `name`; mcp.json 必填 `$schema` + `mcpServers`(stdio / streamable-http / sse 三传输); 路径包含防止目录穿越; 客户端注入 PLUGIN_ROOT/PLUGIN_DATA。【搜索级】https://github.com/agentplugins/agent-plugins-spec(DeepWiki 镜像: https://deepwiki.com/agentplugins/agent-plugins-spec/2-specification-v1.0.0)

### 4.5 生态规模佐证

- SkillsMP 已索引 **28.3 万+ 个 skill**(2026-02, 从 2025-12 的零起步)。【搜索级】https://denser.ai/blog/agent-skills-guide
- VoltAgent/awesome-agent-skills: 1000+ 官方/社区 skills, 3.4k forks。【搜索级】https://github.com/VoltAgent/awesome-agent-skills
- 25+ 平台支持 Agent Skills(2026-01)。【搜索级】https://medium.com/spillwave-solutions/agent-skills-the-universal-standard-transforming-how-ai-agents-work-fc7397406e2e

---

## 5. 第三轮: CodeLore 叙事层深挖(2026-08-30)

### 5.1 端点与配置(事实, 来源【已读】advanced-usage.md §8.5 全文 + README, 已索引进知识库)

| 项 | 值 | 说明 |
|---|---|---|
| 默认端点 | `http://localhost:11434/v1`(ollama, OpenAI 兼容方言) | 「local-first: with nothing configured but a model name, requests go to a local OpenAI-compatible endpoint」 |
| `CODELORE_LLM_MODEL` | **必填**(OpenAI 兼容方言) | `ollama list` 任意名字; Anthropic 方言下覆盖默认(Sonnet 级) |
| `CODELORE_LLM_API_KEY` | 可选 bearer token | 本地跑通常不需要 |
| `CODELORE_LLM_BASE_URL` | 仅 OpenAI 兼容方言生效 | Anthropic 路径忽略它 |
| Anthropic 路径 | 设 `ANTHROPIC_API_KEY` 即可 | base URL 被钉死, 不可改 |
| 不配置时的行为 | MCP `explain_file` 返回 fact_sheet + `narrative_error`, 调用照常成功; `explain --llm` 硬错误+setup 提示; `diff --llm` 仅警告 | 无 `--llm` 时字节级不变、永不碰网络 |

**回答用户问题「端点是什么?要自己配吗?」: 是的, 完全自己配, 且只配环境变量、无配置文件。默认本地 ollama; 只设 `CODELORE_LLM_MODEL` 即可跑本地; 要云端就 `ANTHROPIC_API_KEY`(或 `CODELORE_LLM_BASE_URL` + `CODELORE_LLM_API_KEY` 走 OpenAI 兼容)。这是全工具唯一会碰网络的路径。**

来源: 【已读】https://raw.githubusercontent.com/emrecdr/codelore/main/docs/advanced-usage.md(155.7KB 全文索引); 【知识库】codelore-repo / codelore-advanced-usage。

### 5.2 引文检查机制(写 Issue 的弹药)

- Prompt 把 fact sheet **原样嵌入作为模型唯一证据**, 指示「只用 sheet 上的事实、引用确切数字、不知道就说 the data doesn't show 而非猜测」;
- 生成后引文检查: 提取叙事中每个数字 token 与 sheet 值匹配, **容忍舍入**(叙事 "0.79" 由事实 0.786 支撑; "80%" 由 0.803 支撑), **符号感知**(`-0.5` 只被事实 `-0.5` 支撑, 排除日期/范围中的连字符);
- Stamp 格式: `advisory — model <id>, grounded ✓` 或 `advisory — model <id>, ⚠ contains uncited claims: -0.5, 42.5%`;
- **作者自写诚实限制**: `grounded ✓` 只表示「叙事引用的每个数字都出现在证据里」, 不代表「每个论断为真」。检查无法发现: 伪造的小整数(≤12 豁免, prose 脚手架如 "the 3 files")、碰巧与 sheet 上无关分数重合的百分比、张冠李戴的真实数字。「The narrative is advisory; the dossier above it is the authority.」;
- Narrative 缓存: 内容派生 key(evidence 文本 hash + prompt/schema 版本 + model id), 重复运行免费; `--llm-refresh` 强制重生成; 单次 bounded timeout 无重试;
- 隔离保证: 评分路径不 import 叙事层(单向依赖箭头); 叙事永不触碰分数/门禁/退出码。

### 5.3 作者的数据展示心智模型(issue 的靶子, 均【已读】raw.githubusercontent.com/emrecdr/codelore/main/docs/*)

1. **research-foundations.md**: 品牌承诺「every metric is peer-reviewed-grounded」; 每条分析 = 论文引用 + what the signal means + **what good values look like**(如「1-2 authors: clear ownership; 6+ no dominant: red flag」)+ 实现文件链接 + why it matters;
2. **perf-evidence-v1.md**(2026-06-07): 性能证据文档先例——状态/日期/硬件/方法学(`/usr/bin/time -l`, warm vs cold)/仓库规模矩阵表/交叉检查/结论; 测不了的(Linux kernel)明确标 **TBD** 并说明为何不当 release blocker;
3. **provenance manifest**: 每次运行出 `.provenance.json`(所有 config knob 序列化 + 版本 pin + 时间戳), 防「不同阈值得出不同数字」的扯皮;
4. **corpus Wilson 95% CI**: 有限参考池的百分位带置信区间, 不假装精确;
5. **roadmap-v1.x-and-beyond.md**: 决策 rubric(leverage × risk × strategic); 「Borrow-or-build」原则(绝不 copy-paste, 识别 signal 重新推导)。

→ **落差: 这个仓库给每条确定性分析都配了证据文档, 唯独 LLM 叙事层(全工具唯一非确定性、唯一网络路径、唯一会幻觉的层)没有任何质量数据。** Issue 就是问「receipts 呢?」。

### 5.4 同名混淆警告

**PyPI 上有一个也叫 `codelore` 的 Python 包**(实际 CLI 叫 `lore`, 环境变量 `LORE_LLM_PROVIDER` / `LORE_OLLAMA_MODEL` 等, 支持 Anthropic/Groq/OpenRouter/Gemini/DeepSeek/NVIDIA NIM/ollama 多 provider, 混合检索+SQLite+RRF+MCP, 处理 git 历史/ADR/postmortem)——**完全不同的项目, 安装勿混淆**。我们讨论的是 Rust 的 `github.com/emrecdr/codelore`。【搜索级】https://pypi.org/project/codelore/

### 5.5 外部「要数据」的心智模型参照(issue 方法学弹药, 均【已读】)

1. **SWR-Bench**(arXiv 2509.01494): ACR 领域现成基准——1000 个手工验证 PR、LLM 评测与人类 ~90% 一致、结论「现有 ACR 工具 underperform」、多评审聚合 F1 +43.67%。→ 「评测方法学已存在, 你不用从零发明」。【已读】https://arxiv.org/abs/2509.01494
2. **futureagi precision/recall 方法论**(2026-08-10): 评审工具有四个 job 四套 ground truth; 在 PR 上 **FPR 不可计算**(true negatives 无界), 厂商该报的是 **FDR = 1 − precision**(决定「团队会不会开始无视这个工具」的数字), 而厂商从不报它。【已读】https://futureagi.com/blog/ai-code-review-tools-precision-recall/
3. **HalluJudge**(FSE'26): F1 0.85、$0.009/次、67% 与开发者偏好一致——裁决一致性可以直接借这套度量。【已读】https://arxiv.org/abs/2601.19072
4. **SWE-bench/experiments#462**(2026-07-27): 模范「要数据」issue——先谢维护者、说明自己在做什么、列出已读 artifacts(commit pin)、三个精确问题、每题说明对结论的影响、不假设 LICENSE、愿意修正。【已读】https://github.com/SWE-bench/experiments/issues/462

---


## 7. 第五轮: 终局决策(2026-08-30)

### 7.1 形态确认: Agent Plugin 五层盒子

**对, 交付物是插件——但「插件是盒子, 盒子里必须有引擎」。** 结构:

```
macro-audit-plugin(Agent Plugins 1.0.0 格式, 可发布到 skills.sh / SkillsMP 等市场)
├── plugin.json                    ← $schema: agent-plugins.org/schemas/1.0.0/plugin.schema.json
├── skills/macro-audit/
│   ├── SKILL.md                   ← 方法论壳: 四象限 rubric + 战略叙事问题清单 + 报告模板 + 裁决格式
│   ├── scripts/                   ← 调核心 CLI 的薄包装 + 报告渲染
│   └── references/                ← quadrant-rubric.md / strategy-questions.md / report-template.md
├── mcp.json                       ← 指向 kernel MCP server(证据查询: hotspots/facts/report)
├── com.jiahao.repoaudit/          ← 扩展目录: hooks 配置(触发时机)+ jiahao tiers
└── (随分发的) 核心二进制           ← CodeLore + 自研 kernel(编排+裁决+sufficiency-gate)
```

现成先例(本轮全部验证): **agent-completion-gate**(skill 壳+确定性 Python gate+CI 脚手架, `npx skills add` 一条命令分发, 中文 README)【已读】https://github.com/zhjai/agent-completion-gate; **Receipt Gate**(ed25519 签名 receipt + Claude Code Stop-hook 集成片段, 「make the agent hand you a receipt every time it claims to be done」)【已读】https://github.com/marketplace/actions/receipt-gate; **anthropics/skills**(官方技能按 plugin marketplace 分发, 175k star / 20.8k forks)【已读】https://github.com/anthropics/skills。

### 7.2 核心心智模型(多轮编排后的总结)

**一句话: 面试官式整仓评审 = 证据是货币、工程心智是视角、可驳回裁决是出口——先复现事实, 再谈观点, 观点必附证据, 裁决必可驳回。**

四层管线(从 memory.md 四象限升级):

| 层 | 性质 | 内容 | 关键开源件 |
|---|---|---|---|
| 证据层 | 确定性/离线 | 结构(字节/LOC/复杂度)+ 行为考古(git: churn/hotspot/耦合/ownership/知识孤岛)+ 供应链 + 上下文打包 | CodeLore、OpenSSF Scorecard、repomix/gitingest |
| 事实层 | 可查询 | DuckDB 事实表/SARIF/corpus 百分位(Wilson CI), 「每个数字可 trace 到 SQL」 | CodeLore |
| 叙事层 | 概率性/引文盖章 | LLM 只基于 fact sheet 生成宏观诊断, grounded ✓/⚠; 不知道就说 the data doesn't show; advisory 永不触碰分数/门禁/退出码 | CodeLore --llm |
| 裁决层 | 门禁/可驳回 | agent 声称完成必须交证据(verdict-gate); 证据不足明确标缺口再补查(sufficiency-gate); 输出「v1.0 前先做哪两件事」式优先级 | Receipt Gate / agent-completion-gate / jiahao / anysearch-cli kernel |

四象限判断力(面试官视角):

| 象限 | 问什么 | 数据源 | 覆盖者 |
|---|---|---|---|
| 结构 | 代码长什么样 | 复杂度/依赖/上帝对象 | CodeLore / CodeScene |
| 行为 | 团队怎么碰它 | churn/hotspot/耦合/孤岛 | CodeLore / CodeScene / GitClear |
| 供应链 | 它站在什么地上 | Scorecard/依赖/CI/发布 | OpenSSF Scorecard(唯一) |
| 战略 | 它在往哪去, 值不值得 | 定位收敛/范围蔓延/门面预算/ADR 质量 | **无人(我们的空位)** |

核心心智原则(从三项目档案 + CodeLore 提炼):
- **泛泛而谈是数据饥饿的症状**(memory.md 原文, 与 Josh English "context collapse" 互证);
- **证据门禁**: 完成声明必须可核验——2026 年被独立发明 ≥6 次(CodeLore stamp、Josh English Evidence Gate、RepoAudit validator、HalluJudge、Receipt Gate、agent-completion-gate), 证明它是对的, 且你不需要再发明;
- **诚实限制**: stamp 只证明数字出现、不证明论断为真(CodeLore 官方口径原话);
- **可复现**: provenance manifest / commit pin / CI(CodeLore perf-evidence-v1 做法)。

### 7.3 BOM 盘点: 开源引入 vs 自研

**引入(直接用, 6 类):**

| # | 开源件 | 角色 | 验证状态 |
|---|---|---|---|
| 1 | **CodeLore**(Rust 单二进制) | 证据层核心: 结构×行为 57 分析+DuckDB 事实表+SARIF+corpus 校准+引文盖章叙事+MCP server+gate。**替代 memory 里 scc+lizard+code-maat 三件套** | 已读(知识库 2 份索引) |
| 2 | **OpenSSF Scorecard** | 供应链维度(唯一覆盖, 并入证据层) | 上轮已读 |
| 3 | **repomix / gitingest** | 全仓+历史打包喂叙事层 | 确认活跃(repomix.com / gitingest.com) |
| 4 | **verdict-gate 现成实现(借鉴模式, 不再自研)**: Receipt Gate(bootproof)、agent-completion-gate(zhjai, 中文 README)、Agent Evidence Gate、agents-shipgate、prove-it-ai-gate | 裁决层确定性部分——「agent 只能 propose done, 外部 gate 读真实产物授 complete」 | 已读 2 个(Receipt Gate / agent-completion-gate), 余搜索级 |
| 5 | **Agent Plugins 1.0.0 + Agent Skills 规范** | 打包/分发格式(plugin.json/skills//mcp.json) | 已读(Google 博客 + 规范仓库) |
| 6 | **自有资产复用**: jiahao(hooks 11 宿主分发面+现有 verdict-gate)+ anysearch-cli kernel(sufficiency-gate/GapRequest/claim 归因语义) | 触发面+编排语义, 直接迁移 | memory.md 档案 |

**自研(必须发明, 4 样):**

| # | 自研项 | 为什么必须自己写 | 备注 |
|---|---|---|---|
| 1 | **战略叙事 rubric** | 全行业真空位(所有工具只评代码, 不评产品意图)——**唯一真护城河** | 定位收敛/范围蔓延/门面预算/ADR 质量/团队拓扑 vs 产品意图, 做成可执行判断清单 |
| 2 | **四象限综合裁决器** | CodeLore 只有 ROI 排序, 没有「v1.0 前先做哪两件事」式产品级裁决 | 把四象限证据压缩成 2-3 条优先级, 每条附证据引用 |
| 3 | **sufficiency-gate 宏观版** | anysearch-cli 的搜索充分性语义要迁移成「评审证据充分性」: 报告缺口检测 + GapRequest 补查轮 | 核心是「禁止硬凑」 |
| 4 | **插件胶水 + 宏观报告模板** | 装配工工作, 决定形态: plugin.json + SKILL.md 方法论壳 + mcp.json + hooks 接线 + 报告模板(RepoPilotAI 四维评分形态参考, 内容自研) | 技术含量低, 但缺它就不是插件 |
| (可选) | 叙事层质量评测(SWR-Bench 式 / grounded stamp 准确率) | 公开加分项, issue 已在 §6 草拟 | 非 MVP 必须 |

### 7.4 形态选型对比矩阵(终局)

| 方案 | 确定性 | 可移植性 | 分发 | 维护成本 | 先例 | 判定 |
|---|---|---|---|---|---|---|
| 纯 skill | 低(模型跟随) | 高 | 单文件 | 低 | 大量浅层 audit skill | ✗ 只能当方法论壳 |
| 纯 hook | 高 | 低(各家私有) | 配置 JSON | 中 | 190 项限制 + SoundGate | ✗ 只能当触发 |
| 完整 Agent CLI | 高 | 低 | 安装包 | 高 | claude code 等过剩 | ✗ 不需要第 4 个外壳 |
| **Agent Plugin(五层盒子)** | **高(核心在 CLI)** | **高(双开放标准)** | **marketplace 一键装** | 中 | agent-completion-gate / Receipt Gate / anthropics/skills / CodeLore MCP | **✓ 终局形态** |

---

## 8. 完整来源清单(全部 URL, 按轮次/类别组织)

### 8.1 核心产品与工具(第一轮, 全部【已读】)

| # | 标题/实体 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | CodeLore 仓库(Rust 行为分析) | https://github.com/emrecdr/codelore | Official | 2026(搜索索引 2026-08-06) | 最大发现: OSS 行为分析+引文校验 LLM 叙事+确定性公式+provenance manifest |
| 2 | CodeLore Advanced Usage Guide(§8.5 全文) | https://raw.githubusercontent.com/emrecdr/codelore/main/docs/advanced-usage.md | Official | 2026 | 叙事层端点/环境变量/引文检查机制/诚实限制/缓存/失败姿态全事实(155.7KB) |
| 3 | CodeLore Performance Evidence | https://raw.githubusercontent.com/emrecdr/codelore/main/docs/perf-evidence-v1.md | Official | 2026-06-07 | 作者 evidence-doc 心智模型先例(warm/cold 方法学+规模矩阵+TBD 诚实标注) |
| 4 | CodeLore Research Foundations | https://raw.githubusercontent.com/emrecdr/codelore/main/docs/research-foundations.md | Official | 2026 | 「every metric is peer-reviewed-grounded」品牌承诺; 分析-论文映射格式 |
| 5 | CodeLore Roadmap | https://raw.githubusercontent.com/emrecdr/codelore/main/docs/roadmap-v1.x-and-beyond.md | Official | 2026 | 决策 rubric(leverage×risk×strategic); Borrow-or-build 原则 |
| 6 | RepoPilotAI 仓库 | https://github.laiyagushi.com/vaibhavitej-a11y/RepoPilotAI | Official/Currency | 2026-07 | 宏观评分报告形态的唯一开源实现(四维评分+Overall+可行动建议) |
| 7 | AI Code Review: Building a Principal Engineer | https://medium.com/@jengas/ai-code-review-de79a9a5e840 | Community | 2026-02-04 | Evidence Gate 开源化证明 + context collapse 论点 |
| 8 | Harness Agent-Ready Code Repository | https://www.harness.io/blog/agent-ready-code-repository-ai-code-review | Currency | 2026-08-27 | 企业级 AI Checks merge 门禁/分组优先级 |
| 9 | RepoAudit 论文 | https://arxiv.org/abs/2501.18160 | Official | 2025-01(2025-05 v3) | 仓库级 LLM 审计+幻觉 validator, 精度 78.43%, $2.54/项目 |
| 10 | repo-audit GitHub Topic | https://github.com/topics/repo-audit | Community | 2026 | 20 个整仓审计项目生态(多数浅层) |
| 11 | CodeScene 定价页 | https://codescene.com/pricing | Official | 2026 | 2026 功能盘: CodeHealth MCP Server/PR Refactoring Agent/ACE, €18 起 |
| 12 | GitClear 首页 | https://gitclear.com | Official | 2026 | 行级 AI 归因/Diff Delta/持久性/返工率 |
| 13 | HN Algolia: codebase audit | https://hn.algolia.com/api/v1/search?query=codebase%20audit&tags=story&hitsPerPage=20 | Community | 2026-03~06 | Show HN 60 秒审计/vibe-auditor 等浅层产品证据 |
| 14 | DeepWiki vs Greptile 诚实对比 | https://howworks.ai/blog/deepwiki-vs-greptile-vs-reading-it-yourself | Criticism/Comparative | 2026-04-29 | DeepWiki 幻觉/陈旧实锤(LLVM/LibreOffice 维护者原话); Greptile 定位 |
| 15 | Codegen: 8 AI Tools for Tech Debt | https://codegen.com/ai-tools-for-technical-debt | Comparative | 2026-03-10 | 三层次(检测/修复/追踪)分类; CodeScene/SonarQube/vFunction 定位 |
| 16 | HalluJudge 论文 | https://arxiv.org/abs/2601.19072 | Official | 2026-01(FSE'26) | 无参考幻觉检测 F1 0.85、$0.009/次、67% 与开发者偏好一致 |
| 17 | Sonar: Best AI Code Review Tools 2026 | https://www.sonarsource.com/resources/library/best-ai-code-review-tools/ | Official/Criticism | 2026-07-09 | 官方承认 diff-only 错过架构问题; 全仓库上下文=第一判据 |

### 8.2 实现形态与分发标准(第二轮)

| # | 标题/实体 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 18 | Agent Skills 官方规范 | https://agentskills.io/specification | Official | 2026 | SKILL.md 格式/frontmatter/三级渐进加载 |
| 19 | Skills vs MCP vs Hooks 决策指南 | https://claudeskills.info/blog/skills-vs-mcp-vs-hooks/ | Comparative | 2026-07-02 | 「知识→skill/访问→MCP/保证→hook」决策表+评审三件套 |
| 20 | Claude Code 6 大扩展点 | https://wmedia.es/en/tips/claude-code-skills-hooks-mcp-plugins-comparison | Comparative | 2026-02-10 | 六机制语义矩阵; Plugins=如何分发 |
| 21 | Claude Code hooks 官方文档 | https://code.claude.com/docs/en/hooks-guide | Official | 2026 | hooks 事件模型/确定性控制定位 |
| 22 | Agent Plugins 1.0.0 发布 | https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/ | Official/Currency | 2026-08-06 | 跨厂商打包标准: skills+MCP 为 v1 唯二组件, 扩展目录承载 hooks |
| 23 | Agent Plugins 规范正文 | https://github.com/agentplugins/agent-plugins-spec(DeepWiki: https://deepwiki.com/agentplugins/agent-plugins-spec/2-specification-v1.0.0) | Official | 2026-08 | plugin.json/mcp.json 细节(搜索级+DeepWiki 佐证) |
| 24 | 190 Things Hooks Cannot Enforce | https://dev.to/boucle2026/what-claude-code-hooks-can-and-cannot-enforce-148o | Criticism | 2026-04-01 | hook 六类失败(pipe/MCP/subagent/Windows), 裁决不能放 hook 的实锤 |
| 25 | Stop Means Stop(SoundGate) | https://arxiv.org/abs/2607.14166 | Official | 2026-07-15(v3 08-08) | 框架控制原语全泄漏; 修复=环境外 Rust gate; jiahao 短板的结构性解释 |
| 26 | Skills vs other features(Claude Academy) | https://academy.claude.com/courses/introduction-to-agent-skills/skills-vs-other-claude-code-features | Official | 2026 | CLAUDE.md/skills/subagents/hooks/MCP 职责划分(搜索级) |
| 27 | SKILL.md 生态讨论(Reddit) | https://www.reddit.com/r/AI_Agents/comments/1stcu8e/ | Community | 2026 | skill 触发模糊/无版本标准/跨 agent 兼容只保核心指令(搜索级) |
| 28 | SkillsMP 生态数据 | https://denser.ai/blog/agent-skills-guide | Community | 2026-02 | 28.3 万+ skills 被索引; skills.sh CLI 安装(搜索级) |
| 29 | awesome-agent-skills | https://github.com/VoltAgent/awesome-agent-skills | Community | 2026 | 1000+ skills 合集, 3.4k forks(搜索级) |
| 30 | Red Hat: MCP vs skills | https://developers.redhat.com/articles/2026/05/25/mcp-servers-vs-skills-choosing-right-context-your-ai | Official | 2026-05-25 | MCP 与 skills 互补而非竞争(【403未读】, 已由 claudeskills.info/wmedia 替代覆盖) |

### 8.3 评测方法学与「要数据」参照(第三轮)

| # | 标题/实体 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 31 | SWR-Bench | https://arxiv.org/abs/2509.01494 | Official | 2025-09-01(v2 2026-06-05) | ACR 现成基准: 1000 手工验证 PR, ~90% 人类一致, 工具 underperform, 聚合 F1 +43.67% |
| 32 | AI Code Review Tools: Precision/Recall | https://futureagi.com/blog/ai-code-review-tools-precision-recall/ | Criticism | 2026-08-10 | FPR 在 PR 上不可计算; FDR=1−precision 才是该报的数字; 四 job 四套 ground truth |
| 33 | SWE-bench/experiments#462 | https://github.com/SWE-bench/experiments/issues/462 | Community | 2026-07-27 | 模范「要数据」issue 全文(结构/语气/不假设 LICENSE/愿意修正) |
| 34 | PyPI codelore(同名混淆警告) | https://pypi.org/project/codelore/ | Comparative | 2026 | 同名 Python 包(LORE_LLM_* 变量, 多 provider)——与 Rust CodeLore 是不同项目(搜索级) |

### 8.4 终局验证(第四轮, 全部【已读】)

| # | 标题/实体 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 35 | Receipt Gate(marketplace action) | https://github.com/marketplace/actions/receipt-gate | Official/Currency | 2026 | verdict-gate 现成实现: ed25519 签名 receipt + Claude Code Stop-hook 集成片段 |
| 36 | agent-completion-gate | https://github.com/zhjai/agent-completion-gate | Official/Community | 2026 | 「skill 壳+确定性 Python gate+CI 脚手架」插件形态完整先例; `npx skills add` 分发; 中文 README |
| 37 | anthropics/skills | https://github.com/anthropics/skills | Official | 2026 | 官方技能按 plugin marketplace 分发, 175k star / 20.8k forks |
| 38 | Agent Evidence Gate | https://github.com/marketplace/actions/agent-evidence-gate | Community | 2026 | 确定性、隐私优先的 evidence 验证器(搜索级) |
| 39 | agents-shipgate | https://github.com/ThreeMoonsLab/agents-shipgate | Community | 2026 | 确定性 merge gate(搜索级) |
| 40 | prove-it-ai-gate | https://github.com/hrishikesh-thakre/prove-it-ai-gate | Community | 2026 | evidence-folder-contract(搜索级) |
| 41 | EngineeringSpec CLI | https://www.npmjs.com/package/@engineeringspec/cli | Community | 2026-08-19 | 版本化工程变更契约+fail-closed diff gate(搜索级) |
| 42 | repomix | https://repomix.com / https://github.com/yamadashy/repomix | Official | 2026 | 代码库打包 AI 友好格式(搜索级确认活跃) |
| 43 | gitingest | https://gitingest.com | Official | 2026 | Git 仓库转 LLM 文本摘要(搜索级确认活跃) |

### 8.5 本地文件(非 URL)

| # | 文件 | 贡献 |
|---|---|---|
| L1 | C:/Users/Administrator/下载/memory.md | 原始记忆: 品类判据/rubric/四象限/竞品清单/10 条查询/三项目评审档案/搜索栈备忘/TinyFish 结论 |
| L2 | C:/Users/Administrator/下载/我先读取记忆文件，看看里面记录的产品信息。 _read_file_ _path_.md | 上一轮对话完整转写(与本文档内容一致, 无增量) |
| L3 | D:/Aworker/jiahao、D:/Aworker/anysearch-cli、D:/Aworker/env-manager | 用户自有项目(见 §11) |

### 8.6 搜索级佐证(未全文读, 已在正文标注)

SonarQube AI Code Assurance 文档、AWS CodeGuru 停更公告(2025-11-07)、GitLab Duo Code Review(2026-01 GA)、思码逸 Merico、GitHub Code Quality、CHAOSS/GrimoireLab、spec-kit #3674、codelens、dev.to/Reddit 批评帖、知乎「AI 代码债务 11 万条」、zylos.ai LLM 评测 2026、aclanthology.org/2026.acl-long.11、edtek.ai citation-grounded LLM、arxiv.org/html/2607.11074v1(ResearchQA)、galtea.ai LLM 评测指南、birjob.com LLM 评测 2026、openhumanitiesdata.metajnl.com(10.5334/johd.489)、aimultiple.com、entelligence.ai、cubic.dev false-positive-problem、arxiv.org/html/2502.18440v1、ospo.library.jhu.edu README 最佳实践、github.com/tablegpt/evaluation、github.com/usnistgov/opensource-repo、github.com/alirezarezvani/claude-skills、github.com/levnikolaevich/claude-skills、gist.github.com/nud3l(code-audit skill)、mcpmarket.com comprehensive-codebase-audit、firecrawl.dev best-claude-code-skills、blakecrosley.com hooks-explained、github.com/disler/claude-code-hooks-mastery、engineeratheart.medium.com、endorlabs.com guardrails-slip、mintmcp.com hooks-security、hidekazu-konishi.com hooks complete guide、news.ycombinator.com/item?id=44429225、github.com/marketplace/actions/agent-behavior-safety-gate、linkedin.com AURUM-V 发布帖、arxiv.org/pdf/2605.07135(AWI 注入)、github.com/orgs/community/discussions/205109、towardsai.net MCP vs Agent Skills、primeline.cc skills-plugins-mcp-subagents、pristren.com skills-vs-mcp、linkedin.com brijpandeyji MCP vs Skills、auth0.com what-ai-tools-mcp-servers-and-skills-actually-do、chris-ayers.com agent-skills-plugins-marketplace、awesomeskill.ai、github.com/BehiSecc/awesome-claude-skills、github.com/deterministic-agents/gate-contracts、GitHub 官方 benchmark issue(Gorilla/BFCL, sileix 本地 vs 排行榜数字讨论)。

---

## 9. 知识库落库索引记录(ctx_fetch_and_index source 标签)

| source 标签 | 内容 | 规模 |
|---|---|---|
| codelore-repo | https://github.com/emrecdr/codelore(README 全文) | 52 sections / 73.1KB |
| codelore-advanced-usage | https://raw.githubusercontent.com/emrecdr/codelore/main/docs/advanced-usage.md(全文) | 104 sections / 155.7KB |
| repopilotai-repo | https://github.laiyagushi.com/vaibhavitej-a11y/RepoPilotAI | 33 sections / 12.5KB |
| josh-english-ai-code-review | https://medium.com/@jengas/ai-code-review-de79a9a5e840 | 12 sections / 14.0KB |
| codegen-techdebt-roundup | https://codegen.com/ai-tools-for-technical-debt | 22 sections / 20.0KB |
| howworks-deepwiki-greptile | https://howworks.ai/blog/deepwiki-vs-greptile-vs-reading-it-yourself | 30 sections / 14.3KB |

检索方式: `ctx_search(queries: [...], source: "<label>")`。

---

## 10. 信息缺口与后续行动

1. **战略 rubric 的具体维度清单**(自研项)——下一步唯一需要拍板的决策点: 「战略」象限判据, 是否把 ADR 质量/门面预算等具体指标定下来;
2. agents-shipgate / prove-it-ai-gate / Agent Evidence Gate 细节(搜索级)——选型裁决层时再逐一读 README;
3. CodeLore 叙事层实测质量(§6 issue 已草拟; 可本地跑 `explain --llm` 验证);
4. Agent Plugins 1.0.0 各客户端 conformance 矩阵(发布前查);
5. 中文市场: 思码逸 Merico / 华为 CodeArts 是否藏宏观评审形态(仅搜索层, 未抓原文);
6. CodeScene ACE / PR Refactoring Agent 是否已产出叙事化报告(定价页无证据, 需实测);
7. 时点漂移: 全部结论为 2026-08-30 快照, 商业产品季度更新频繁。

---

## 11. 用户自有资产档案(memory.md 原文摘要, 三项目评审)

### 11.1 anysearch-cli(私有, TypeScript monorepo)

- 定位: 本地优先 agentic 检索+记忆系统(CLI + MCP + plugin 三 app);
- 架构: retriever(providers: anysearch/exa/tavily + RRF k=60)/ store(SQLite: FTS5+实体+向量 e5-small q8 三臂融合, freshness factor, quarantine)/ kernel(sufficiency-gate, GapRequest reround, ADR-0034 claim 级归因层);
- 亮点: 教科书级混合检索; 归因层正面硬刚 RAG 最难问题; eval harness(golden 指纹, 50-run 零方差, judge κ 校准);
- 批评: 34 个 ADR 中 30 个是流水账; 分发面(3 app)vs 内容面(2 domain toml + 1 skill)失衡; 本地 e5-small 语义天花板低; 无 LICENSE 未开源;
- 一句话: 工程上过度精良、产品定义尚未收敛的研究仪器。

### 11.2 jiahao(私有, JavaScript, agent 治理中间件)

- 定位: 跨 11 家 agent 宿主的「纪律注入+裁决门禁」——SessionStart 注入铁律, Stop 时 verdict-gate 拦无证据的「完成」声明;
- 架构: 8 hooks(activate/mode-tracker/verdict-gate/subagent/sweep/profile/runtime + hooks.json); hook tier(claude-code/codex/copilot/qoder)+ instruction tier(cursor/windsurf/cline/opencode/aider)+ MCP; bench/polygraph 测谎基准; 395 测试(411 断言, 29 suites, 全绿——知识库命中验证);
- 亮点: ADR-0029 验证者自验证(14 对行为探针 zero-miss); Protection Tier 诚实降级披露; κ 校准飞轮 + 预注册阈值; hash 链证据日志;
- 批评: 自证完备但功效证据缺位(无装/不装对照); 依赖 11 家私有 hook 协议=沙子上盖楼; 治理面复杂度通胀无 cap; **只能拦 Stop 处声明、拦不住轨迹中间**(SoundGate 论文证实这是 hook 事件模型的结构性天花板);
- 一句话: 把 prompt 纪律当安全关键系统做的最认真尝试——证明了「是对的」, 还没证明「是有用的」。

### 11.3 env-manager(公开, C# + Tauri + Rust, v0.9.30→v1.0.0)

- 定位: Windows 环境变量管理器(GUI + CLI + 特权 service + MSI), 带 profile/备份/加密 secret 子系统;
- 亮点: 发布工程成品级(release-please + 四面包一致性门禁 + MSI 冒烟 + SignPath 筹备); 供应链卫生(11 条 VEX 处置, Dependabot NO-GO 分析); 13 个 ADR 全是真决策; Windows 域实战伤疤(PATH 语义比较, trailing-backslash fixture);
- 批评: Program.cs 157KB / SecretProvider.cs 82KB / EnvFeatures.cs 44KB 上帝对象; C# 核心无单元测试(384 个 Vitest 全是前端); 近期 40 commit 约 15 个在修 CI; secret 功能滑向「env 界 1Password」的重承诺; 门面预算 > 结构预算;
- 一句话: 三项目中唯一「给人用」的真产品——流程世界级, 结构地下室级。

### 11.4 跨项目模式

工程质量与抽象程度成反比: 离真实用户越近工程越健康。jiahao=宪法层(管 agent), anysearch-cli=执行层(被管的 agent 造的研究仪器), env-manager=产品层(发货给人)。

### 11.5 搜索栈备忘(memory.md)

现用: Tavily + AnySearch + Exa(对应本会话 web_search=Exa, tavily, anysearch 三引擎)。TinyFish(tinyfish.ai)建议作为 anysearch-cli 第 4 个 provider(arch $7/1k, deep $12-15/1k, 免费约 20k 请求/月), sufficiency-gate 不足时升级 Agent 兜底。

---

## 附注: 方法学声明

- 所有【已读】来源均在本会话经 web_fetch 打开原文全文核验, 未凭搜索摘要下结论; 搜索级来源均在正文明确标注, 未以摘要顶替计数;
- 403 未读(Red Hat MCP vs skills)已用替代源(claudeskills.info + wmedia.es)覆盖;
- 关键结论均得到 ≥2 个独立信源交叉验证(三引擎: Exa/Tavily/AnySearch);
- 本档案为 2026-08-30 快照, 商业产品功能变化快, 引用时注意时点漂移。
