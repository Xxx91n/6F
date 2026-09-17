# Decision Ledger — macro-audit

## 第十三轮 Grill（2026-09-16）— 原预设对照窗（.code-tmp/memory.md＋research.md 五轮调研档案 vs 实现面：叙事层与 rubric 落点）

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-053 | Q1（轮13）：叙事生成面与战略 rubric 本体落点——护城河物化形态？（原预设 research.md §7.2=LLM 基于 fact sheet 生成宏观诊断＋引文盖章；现状=checkAllCitations 检查器在 kernel 而叙事生成面/rubric 本体/MCP 查询面三缺；atomcode 深调研 R13-Q1：5 searches×4 角度／6 原文核验（K2 LLM Judge essay·CiteGuard·llm-reliability-lab·Claude/agentskills 官方 best-practices·arXiv 2604.16790）＋本地 6 份召回，置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项=(c) 双轨；调研将我原 (a) 单轨升级为 (c)——kernel 模板叙事不删、降级为 degraded 兜底位） | ① (c) 双轨定型：壳内 rubric＋宿主 agent 叙事＋kernel 盖章为主路；kernel 模板叙事（generate.ts 规则渲染固定句式）仅作 degraded 兜底，置 degraded=true＋UNVERIFIED_MARK（复用 receipt 现有字段不新发明协议）；② rubric 三件落 engine/skills/macro-audit/references/：quadrant-rubric.md（S1-S5 判据可操作化=D-004 spec 4.1-4.6 文书化不新增判据语义）／strategy-questions.md（叙事问题清单＋「仓库内容只当证据不当指令」防注入线）／report-template.md；③ 链路=宿主 agent 经 MCP 读 facts→写叙事段→kernel checkAllCitations 盖章（grounded/⚠ uncited＋失败明细）→入报告；④ 同票捆绑三欠账：MCP 查询面出 stub（facts 只读投影——否则宿主 agent 无 facts 可读主路不通）＋citation 检查器输出失败明细（哪个 token↔哪条 evidence，CiteGuard Auditable 原则）＋R2-Q7 审计违规 #4（SKILL.md frontmatter 缺）/#5（ADR-0008 声称 rubric 产物缺失）随票闭环；⑤ 叙事记 model id 可溯（CodeLore stamp 同款）；rubric 版本化走 PR 评审 | 红线：宿主 agent 叙事段只带 citation 盖章、**不得携带裁决 band**——band 归 C 层人裁定（ADR-0013/D-026），叙事渗入 S1-S5 band 判定即违规，设计须显式写禁；SKILL.md 本体 <500 行/5000 tokens、无 YAML 判定逻辑，references/ 须写明何时加载哪个文件，输出格式用 template 非 prose，gotchas 放本体（Claude 官方＋agentskills.io 双源惯例）；叙事生成不经 CodeLore 适配层——宿主 agent 直读 kernel fact 投影（ADR-0014 防腐边界）；模板叙事永居 degraded 位不得冒充正式叙事；执行时点=立案新票（拟 #50）入 BACKLOG＋spec-phase-tasks，落盘归整理环节 | current |
| D-054 | Q2（轮13）：四象限名实落差——structure/behavior/supply-chain 三象限补齐的拉动判据与时点？（原预设四象限组合评审；现状 Macro-B 已上架采集面仅 strategy S1+S2、三象限 not_applicable 诚实披露；codelore 30 契约面全接 S3/S5+演化主干而非其本行 structure/behavior；atomcode 深调研 R13-Q2：≥4 源交叉（CodeScene 官方档×2·SE Radio 554 Tornhill·understandlegacycode·Atlan/Intended/MS Foundry 能力矩阵惯例），置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项=(d) 折中＋五处锐化） | ① 立票（拟 #51）=codelore behavior 面（churn/hotspot/change-coupling）逐面 golden 接 Macro-B behavior 象限，复用 #35 契约模式（ADR-0014 raw 语义不出适配层）；② SKILL.md/能力宣称面同步收窄为能力矩阵式措辞（strategy: active·behavior: preview·structure/supply-chain: queued——Atlan/Intended/MS Foundry「never treat roadmap as shipped」惯例），收窄与立票同票绑定（只收窄不立票=重演声明↔实物不一致）；③ 票面写死 quadrant 归位规则=facts 共享、quadrant 归属=切片决策，防「同一 fact 两象限归属」语义漂移（codelore 面同时被 Macro-C 演化主干消费的情形）；④ 低 commit 仓信度披露=churn/hotspot 带最小样本量判据（对齐 TC1_MIN_N=5 预声明阈值惯例，ADR-0015 量测有效性）；⑤ 立票时对 D-035 做一行勘误注记=faces 消费侧扩展至 Macro-B behavior 象限（契约本体不变），不许静默改向；⑥ 立票前先实物跑 `codelore analyze` 确认 hotspots/coupling 输出 schema 再写 golden | structure 续排队并显式登记暂缓理由=「与 S3 族双口径风险」（两套复杂度口径在报告内自相矛盾的失败模式）；supply-chain 维持 D-034③ 排队不动（Scorecard 不插队）；behavior 接入属 D-035④ 登记框架内预期激活非改向；不动 D-053 票面（拟 #50 五件套已封口）与 D-034① 层序（属「扩面」范畴延续非层序重排，注明为 Macro-B 象限消费属增量）；执行时点=立案入 BACKLOG＋spec-phase-tasks，落盘归整理环节 | current |
| D-055 | Q3（轮13）：hooks 层存废——五层盒子第④层名实裁定？（原预设=jiahao hooks 触发面复用；现状=com.macroaudit.hooks/ 仅 README 立场文档无实物、触发实靠 CI schedule＋skill 引导；atomcode 深调研 R13-Q3：官方规范×3＋示例仓＋22-hook 先例＋4 例无 hooks 审计插件核验，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项=(d) 纯勘误＋触发器登记；调研否决我原 (b) 最小实建倾向——新硬事实=com.macroaudit.hooks/ 自造命名空间无任何宿主会读） | ① 层④定名收窄为「可选呈现面/规范合法声明位」：ADR-0008 加勘误注记（决策本体=五层盒子＋hooks 永不作裁决执行点不改写）；② CONTEXT「Agent Plugin（本产品用法）」词条同步收窄（「反向域名扩展目录（hooks 触发/呈现面）」→「可选呈现面（声明位）」）；③ extensions/com.macroaudit.hooks/README.md 加一行「声明位，无 hook 实物，实建见触发器登记」；④ registry 登记新触发器：激活条件=真实呈现需求信号，激活动作=最小 Stop/PostToolUse 呈现面实建（原候选 b 形态）；⑤ ADR 注记＋CONTEXT 词条＋README 一行三处成对落盘，防「声明位被读作实物层」 | hooks=宿主专属非可移植组件（Agent Plugins 1.0.0 v1 可移植组件恰=skills＋mcp.json；官方示例仓「Hooks are not portable v1 components」逐字）；宿主命名空间惯例=VS Code/Copilot 读 com.github.copilot/hooks/hooks.json、Claude 读插件根 hooks/hooks.json——com.macroaudit 自造命名空间在任何宿主侧 inert；审计产品自带 hooks=信任税（「hooks execute without user consent」被列最高风险审计面），无真实呈现需求信号前禁止实建 hook 配置（D-031「不为撑形态补资产」）；排歧注记=CONTEXT Micro-A「触发器为每次 push 或 hook」的 hook 指 git/CI 语义非宿主 hooks 层；D-052 命名面零扰动；plugin.json extensions 声明保留（规范 §5.6/§8.1 合法）；执行时点=整理环节落盘＋registry 触发器登记 | current |
| D-056 | Q4（轮13）：repomix/gitingest 打包层去留？（原预设=全仓+历史打包喂 LLM 叙事层；架构演进=D-053 叙事面走宿主 agent MCP 读 facts＋ADR-0016 消费端恒为 agent 宿主→原用途抽空；atomcode 深调研 R13-Q4：repomix 全部官方用例预设「LLM 不可直接读 repo」＋官方自身已 MCP 化按需查询＋目标仓全超 ~10k 文件上限＋SWE-book/Atlan 退役惯例，置信高三路外推） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项=(a) 退役＋重开触发器登记锐化版） | ① 锁表 repomix-gitingest 行 planned→retired（行不删、provenance 可反查——锁表词表既有语义首次启用）；② 锁表注记写明「repo 文件面由宿主 agent 原生访问承担，产品不提供 repo 文本打包面」（防 D-053 被误读为依赖打包上游）；③ 裁决注记显式区分 D-045 从严弃用判据=repomix 属其「无价值」分支（消费前提结构性消失≠「可算但暂缓」面），非破例；④ 落盘时核对 registry upstream-probes-scorecard-repomix pending 项实际措辞随退役关闭/改绑；⑤ CONTEXT Macro-B 词条「数据源含 repomix」字样同步收窄；⑥ registry 登记重开触发器：激活条件=「审计证据导出包」独立需求面出现（或 Macro-A 跨仓打包实证场景），激活动作=另立需求票重评估接入 | 原用途抽空依据三源：repomix/gitingest 全部官方用例预设「LLM 不可直接读 repo」（ADR-0016 下恒假）＋repomix 官方已 MCP 化（pack_codebase/read_repomix_output 按需查询非整仓 concat）＋D-050 目标仓全超 ~10k 文件上限想喂也喂不进；scorecard 行不受影响（有真实拉动面 D-034③/D-054）；research.md 本体不改（原预设档案非规范面，退役裁决记本账即显式勘误落点）；退役后 README §3 人读表自动不再出现该行（锁表纪律原文）；执行时点=整理环节落盘 | current |
| D-057 | Q5（轮13）：原预设余项清算——①§6 codelore issue 外联草稿②叙事质量评测面时点③anysearch-cli kernel 迁移封口④sufficiency 补查回路归属？（atomcode 深调研 R13-Q5：OSSAlt 外联惯例＋RAGAS/DeepEval 先物后尺＋strangler fig 退役治理＋NVIDIA AI-Q/Orkes 官方档，四小项全 (a) 零冲突） | 采纳（2026-09-17，原话「采纳」＝整包 (a)×4） | ① codelore §6 issue 草稿**销项**：叙事面=宿主 agent（D-053）后其 --llm 质量数据对决策面无拉动，外联=drive-by 变体；销项注记显式引 D-053 作理由不静默（与 codelore.ts:137「LLM 面归 #36 独立票」登记不矛盾——适配层 env 门控面≠外联 issue）；② 叙事质量评测面**登记 manual_watch**（registry 五要素：标记＋责任人＋复审时点=#50 落地＋验证方法＋确认记录占位；触发器=叙事实物出现后另立票）——先物后尺惯例（RAGAS/DeepEval 无一预设「无被测对象先立评测面」）；κ 校准飞轮原预设由此显式安置非遗弃；③ anysearch-cli kernel 迁移**确认封口核销 BOM#6**：「语义吸收≠代码迁移」——sufficiency/gap/claim 归因已入裁决协议＋checkAllCitations＋evidence_threshold_met，消费面承接完成=迁移完成（strangler fig 治理判据），代码零迁移；④ sufficiency 补查回路**归宿主 agent**：strategy-questions.md（#50 票面内）写「证据不足→经 MCP 补查」程序段，kernel 只判 insufficient 不建 reround 回路——NVIDIA AI-Q/Orkes 官方档证 gap→follow-up 全在 orchestrator 层 | 失败模式防御：①照发=替维护者造 no-op 外联、暂缓=占 D-041 盯梢预算且激活条件与 D-053 方向相反；②内嵌 #50=被测对象与验收判据同票自写自评失独立性、永不评=D-053⑤ model id 成死字段；③要求代码迁移=为已完成能力追加零价值工作（temporary architecture becoming permanent）；④ kernel 建 reround=越权承担 orchestration 破坏 verdict_gate 单一职责、暂缓=CONTEXT Sufficiency Gate 词条「发起 GapRequest 补查轮」归属悬空名实分离；执行时点=②registry 项＋④rubric 程序段随整理环节/#50 落盘 | current |
| D-058 | Q6（轮13）：Kernel/Agent 职责边界要不要总则化？（本轮 D-055/D-056/D-057④ 三案背后同一隐含原则=确定性归 kernel、编排与概率性归宿主 agent，仓内无总则级落点；atomcode 深调研 R13-Q6：Anthropic workflow/agent 一句区分＋Spotify backfill 判据＋Fowler/ozimmer ADR 门槛三源，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项=(a) CONTEXT 词条收编，不开 ADR-0022） | ① CONTEXT.md 收编新词「Kernel/Agent 职责边界（确定性核 / 概率性编排）」，措辞按 R13-Q6 调研 §5 建议稿：总则=确定性面归 kernel（事实采集/引文盖章/门禁检查：可重放、可测试、预定路径），编排与概率性面归宿主 agent（叙事生成/补查回路/触发编排/呈现：模型驱动、路径不预定）；与 Anthropic workflow（predefined code paths）/agent（dynamic direction）区分同构；判例指针=hooks 层＝纯呈现面非裁决点（D-055）／repo 文件面归宿主 agent 原生访问、产品不提供打包上游（D-056）／gap→补查回路归 orchestrator 非 kernel（D-057④）；band 红线显式入词=裁决 band 永不归 agent、归 C 层人裁定（ADR-0013/D-026）；Avoid 行=微内核/裁判员运动员/确定性内核 vs 概率外壳/AI 管线 | 词条只写总则＋判例指针不写细则（防与 ADR 勘误漂移）；引用 ADR-0008 层④必须按 D-055 勘误后释义不得复活「hooks 触发面」旧表述；不开 ADR-0022（归纳命名无新决策无新取舍=ozimmer 零价值 ADR，ADR 门槛=单决策含取舍与备选）；判定标准用可操作判据（可重放/可测试 vs 模型驱动）非抽象形容词；随轮次新增判例追加指针；执行时点=整理环节落盘 | current |

## 第十五轮 Grill（2026-09-17）— 锐评对照窗（.code-tmp/锐评.txt 九点解剖 vs 实现面：atomcode R14-Q1-* 深调研逐点裁定）

| ID | 原问题 | 确认回答 | 规范化需求 | 显式约束/负向需求 | 状态 |
|---|---|---|---|---|---|
| D-059 | Q1（轮15）：锐评九点处置框架——逐点收/拒/缓总表？（锐评=.code-tmp/锐评.txt 九点解剖：%cI 时区击穿/无 audit 命令/selftest 静态/黑名单误伤/citation indexOf/MCP db 必填/intake 不 fetch/适配器孤岛/bundle+二进制；atomcode 深调研 R14-Q1：九点全部代码一手核验＋≥2 独立外部信源，置信高） | a′（2026-09-17，原话「a′」＝采纳修正版九点表：收 4/部分收 2/缓 2/拒 1） | **收 4**：①%cI P0 勘误票——`%cI`→`%ct`（epoch 全版本稳定）或归一化 `+00:00→Z`＋golden-ci「不挂 3 平台矩阵」声明勘误＋git-cli 锁表行「输出解析为契约」补输出格式断言 enforce；④黑名单误伤 P1——匹配前剥 SQL 字面量＋误伤回归测试（拒「必须上 AST」强主张，OWASP 分级下字符串黑名单在非注入面合法）；⑥MCP db 必填 P1——db 寻址收敛进 mcp.json 配置/服务端解析（引 D-053 拉动：叙事主路被此堵）；⑦intake 不 fetch P1——返回值/报告加 `snapshot_fetched_at` 时点披露＋显式刷新 opt-in（不自动 pull 保隔离纪律）＋`.git` 尾缀键归一。**部分收 2**：②audit 一等命令立案入 flesh-out 波次（Cockburn skeleton→flesh-out 时点=骨架已通现在补大门）；拒「产品定义失能」定性（.scratch 脚本形态=登记过的过渡态，ADR-0017）；⑧孤岛=登记过的 staged delivery 定性拒（#47→#48、#35→#51 排产在案），「先写后接」与 D-031⑤ 张力记台账不立票、github-rest 后续不得提前铺量。**缓 2**：③selftest→doctor 升级挂触发器「首个外部用户安装链路出现」（#48 env-manager 三形态已含运行时探测载体，doctor≠manifest 对账两类工具）；⑨bundle 脚手架不拆（完整 provenance 披露在案，拆破 43-check 28/28）挂退役触发器=Macro-B GA 时 clean-commit baseline 替换；duckdb 二进制挂清单值守。**拒 1**：⑤citation 主诉拒——presence→NLI→human-in-loop 叠加分级非替代（CiteGuard 文献），presence-check=D-053/D-058 封口设计界，BAND 从严有本意声明留痕；仅勘误小项=`contradicts` 死枚举砍成员（YAGNI，D-045「未实现≠语义冲突」登记勘误不立票） | 锐评总定性「航天文书包装玩具车」部分失实——本仓=walking-skeleton 方法论执行样本；九点评级均代码核验＋外部信源；audit 命令立案非推翻 ADR-0002（flesh-out≠MVP 切片）；执行时点=整理环节立项/勘误/值守登记 | current |
| D-060 | Q2（轮15）：`audit` 一等命令票面形态？（锐评 #2/#8 落地设计面；atomcode 深调研 R14-Q2：Cockburn walking-skeleton→flesh-out 原典＋clig.dev/bettercli/Thoughtworks CLI 惯例＋semgrep/trufflehog 先例三源，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项=(a)＋七处锐化清单） | ① 签名 `macro-audit audit <path\|owner/repo\|url> [--scale <S>] [--out <dir>] [--json]`，path 输入裁决逐字复用 repoAdd（ADR-0009 三段序：本地路径→owner/repo 消歧→URL opt-in clone）零新增输入面；② --scale 默认 Macro-B，传未实现值→exit 2＋stderr `{error:"SCALE-NOT-IMPLEMENTED",…}` 结构化错误＋implemented 列表＋层序引 ADR-0017③（措辞与 D-054 能力矩阵同源），不做静默降级；③ --out 双通道：省略=报告走 stdout，给出=写 report.md＋facts.duckdb 且 stdout 打 receipt 摘要 JSON（字段集与 demo receipt 同源禁另造）；④ 装配实现=one-shot 装配语义提炼为 engine 内单一管线函数（intake→collectors＋codelore 面→facts→骨架渲染），audit 与 demo 共同消费；39/40 脚本不删除转三仓回归对照物（golden parity：audit 产物字段⊆脚本产物，漂移即报警），票面写死「对照物仅仓内 CI 消费不随 tgz 分发」；⑤ 报告头沿用 `stability:"preview"＋capabilities:["macro-b"]`（D-037② 既有契约面）；⑥ --help 顶层 usage 行同步；⑦ **票面捆绑防名实分离**：audit 票与「README 能力边界行同步提及 audit」成对落盘（重演 D-054 同票绑定纪律）；⑧ 票面显式写「audit=确定性管线入口归 kernel，叙事仍走宿主 agent MCP 主路（#50），audit 不携带叙事生成职责」（D-058 边界防越界复用） | walking skeleton≠MVP——flesh-out=已规划能力按层序点亮不触 ADR-0002；子命令树随需而生不预铺空枝（`audit macro-b` 不建，`--scale` 参数化）；codelore 行为面随 #51 进本命令采集段（孤岛接通）；Micro-A 随 #48 以 `--pr` 或子面续接（#48 票面不动）；执行时点=整理环节立案 | current |
| D-061 | Q3（轮15）：#52 叙事质量评测面的被测对象拆分？（先物后尺细化；atomcode 深调研 R15-Q3：RAGAS/Arize/AWS-GEDD/CiteEval/κ 功效分析 17 源，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项=(a)＋锐化清单） | ① #52 拆双票：**#52a checker-eval 即时执行**——合成 claim-evidence 对 ~80-120 条按 checker 判定空间分层（presence 成立/不成立、支持/矛盾/中立、band-leak 注入、边界样本），指标=precision/recall 分类别＋FP/FN 分型（CiteEval 法）＋band-leak 检出率（BAND_PATTERNS 独立复测）；κ 基线=50-100 条子集双标→human-human κ 天花板→checker-人 κ，预声明阈值 κ≥0.6 起＋raw agreement＋bootstrap CI 双报；纪律=golden claim set 版本化＋PR 评审（D-037/#43 惯例）、checker 阈值改动不得参照本集标签（防调参泄漏）、held-out 只评一次、产物=eval JSON＋check 断言＋合成限制披露、**评测票与修复票分离**（暴露缺陷另立票防自评）、不改 checker 行为；**#52b 宿主叙事质量 eval 挂新触发器**——锚=audit 首次实跑产出真实宿主叙事段（或 pilot 真实语料 N≥50 段），语料=wild slice（不清洗失败形态 degraded/uncited 保留）＋held-out 与 52a 集分离存管，judge 跨族于宿主生成模型（preference leakage 缓解）＋先对齐（RAGAS align 工作流），指标=grounded stamp 准确率＋judge-human κ（预声明）＋与 52a 合成基线分布偏移对照，收割 D-053⑤ model id 字段防死字段；② D-057② 加勘误注记一行（registry 锚拆分：52a 不占锚即时执行／52b 改锚实跑语料）＋registry narrative-eval-surface 触发器定义细化 | checker=确定性仪器需标定非校准飞轮；合成语料评 agent 质量=自评变体（preference leakage 违判据独立纪律）＋违 D-053 模板叙事 degraded 位；52a 是 52b 方法学预演（双标/κ/阈值程序资产复用）；执行时点=整理环节改票 | current |
| D-062 | Q4（轮15）：Macro-A 启动判据（DoR）要不要现在定义？（mw-trigger-c 锚事件语义悬空） | a（2026-09-17，原话「a」＝采纳 (a) 现在登记 DoR 判据集＋维持层序末位） | ① 判据集现在登记（落点=mw-trigger-c 项 verify_method 写实＋CONTEXT Trigger Sequence 词条补「启动判据」句）：a.前序层 preview 全上架（Micro-A＋Micro-B preview 闭环，层序 D-034/ADR-0017③ Macro-A 末位不动）；b.跨仓关联键在 ≥2 真实仓 facts 上验证（D-028 correlation key）；c.SWMR 多写者域 self-probe 随启动实测封口（mw-trigger-c 本职=启动时门禁非前置）；d.能力矩阵 Macro-A 措辞同票收窄进启动票；② Macro-A 本体维持层序末位——判据集=登记义务非提前开工；③ .scratch 四仓 facts（jiahao/env-manager/anysearch-cli/gsd）为调研产物非生产线 facts，不计入判据 b 的「真实仓」口径 | 「macro-a-start」事件无判据定义=触发器纪律形式化缺口；判据集是设计工件可独立完成不依赖 Micro-B 排期；执行时点=整理环节落 registry/CONTEXT | current |
| D-063 | Q5（轮15）：轮14余项清算——L1 r14-audit-findings 分支处置＋L2 golden/verifier 解耦？（atomcode 深调研 R15-Q5：IntuitionLabs FDA/SLSA v1.0/Jest/google-golden/SRE toil/quarantine 14 源） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐=①(b)＋②(b)＋两处锐化） | ① **L1=(b) 审计件留档分支口径登记**：r14-audit-findings 分支登记为「审计档案面=冻结只读留档分支」——不合 main、视同已共享证据分支禁改写历史（合规惯例=证据归集中证据仓、主干留 commit 指针交叉引用；SLSA attestation 独立分发同构）；ledger/handoff 记分支名＋HEAD SHA 防遗忘误删；与 D-038 双通道、D-060「不随 tgz 分发」口径自洽；② **L2=(b) manual_watch 观察项**：registry 新项 `golden-verifier-dirty-on-rerun`——阈值=守卫重跑致脏树复现≥3 次（或 Macro-B GA 先到者）→立票；**届时修法=NN-check 族加显式 --update/--write 旗标、默认只读比对（A-050 先比后写模式推广，一次性小修补非解耦工程）**；五要素填全是 manual_watch 成立硬前提（缺责任人→退回立票）；不并入 D-059⑨（退役触发 vs 解耦观察异构，捆绑稀释可审计性） | ①(a) 合 main=时点快照被误读现行结论＋分发面再裁剪；②(a) 单次现象立票超业界阈值惯例=坟场风险；执行时点=整理环节（CONTEXT/handoff 口径行＋registry 新项＋ledger 记 SHA） | current |

## 第十三轮收口对账（2026-09-17 整理环节）

> 增量 6 条（D-053~D-058）全部有去向，无去向清单=空→过闸落盘。本环节实物面：ADR-0008/0015 勘误补记×2、CONTEXT.md 五处（封口行＋Macro-B 数据源收窄＋Agent Plugin 词条收窄＋Sufficiency Gate 补查归属＋Kernel/Agent 职责边界新词）、hooks README 声明位行、upstream-lock.yaml repomix→retired（首个 retired 行）、registry +3 项（hooks-presentation-face event_bound／narrative-eval-surface manual_watch／repomix-reopen-trigger event_bound）＋upstream-probes 项改绑 scorecard-only、README §3 repomix 三面清除、versioning.md 同步、42/44-check 断言同步、BACKLOG #50/#51、spec-phase-tasks R9、CHANGELOG M-004、engine CHANGELOG Unreleased、next-round.md 轮 14 任务书。

| D | 决策 | 去向 |
|---|---|---|
| D-053 | 叙事双轨＋rubric 三件＋MCP 出 stub | BACKLOG #50＋spec-phase R9-01 |
| D-054 | behavior 象限接入＋能力矩阵收窄＋D-035 勘误 | BACKLOG #51＋spec-phase R9-02 |
| D-055 | hooks 层④=可选呈现面/声明位 | ADR-0008 勘误＋CONTEXT 词条＋hooks README＋registry hooks-presentation-face |
| D-056 | repomix retired＋重开触发器 | upstream-lock 行＋README §3＋versioning＋CONTEXT Macro-B＋registry 探针改绑＋repomix-reopen-trigger＋ADR-0015 勘误＋42/44-check 断言 |
| D-057 | 余项×4 核销 | ①③ 账本即销项/封口；②registry narrative-eval-surface；④入 #50 票面 |
| D-058 | Kernel/Agent 职责边界 | CONTEXT 新词条 |

## 第十一轮收口对账（2026-09-16 整理环节）

- 账本增量：D-048~D-052（5 条，全 current）；总量=52 条（46 current / 5 revised / 1 closed——D-019 状态格以 current 起首实为 closed，按语义计）
- 增量去向：D-048→BACKLOG #47＋spec-phase-tasks R8-01＋upstream-lock github-rest planned 行（kind 词表扩 remote-api）＋README §3 行＋versioning 种子行＋ADR-0020；D-049→BACKLOG #48＋R8-02；D-050→BACKLOG #49＋R8-03（#46 行选定补记于 #49 行内）；D-051→BACKLOG #41b 行＋engine/LICENSE 换文＋manifest/package/marketplace license 字段＋ADR-0021＋checklist §B 勾销；D-052→manifest.meta.json（单源）→双 manifest 重生成（GEN-OK）＋.claude-plugin/marketplace.json 新建＋description.md/checklist 同步＋CONTEXT 双词
- 无去向记录清单：空（全 46 条 current 均有去向；旧 41 条去向见轮 4~8 收口对账节）
- ADR 评估：+2（ADR-0020 适配器路径=反直觉防回改；ADR-0021 license=上游审计结论不可自明）；D-049/050 循 #38/#46 先例不立新 ADR
- CONTEXT：+2 词（Hosted API Adapter／Plugin-Marketplace 双层命名）＋轮 11 封口行
- 编年：CHANGELOG M-003（adr_range 0001~0021；既有 M-002=轮8 W14 条目保持不动，新条目按递增序追加尾部）；engine/CHANGELOG Unreleased 双条
- 用户闸门残留：push 授权（=发布实质发生）＋/plugin marketplace add＋B 轨未授权
- 会话层纪律（不入仓面细节）：P-1 归因销项=用户确认自推；流程性自我归因类观察不进提交文档面
- 校验：gen-manifests GEN-OK；守卫跑批见执行账

## 第十一轮 Grill（2026-09-16）— W15 窗口包（轮 10 审计交接单方向：Micro-A preview 主线）

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-048 | Q1（轮11）：托管平台 API 适配器是否立案为 #47？（W15①；D-034② 脊柱第三位 Micro-A preview 硬前置=「托管平台 API 适配器新外部面」；D-047 试点第三槽同挂此前置；atomcode 深调研 R11-Q1：7 searches／6 原文核验（docs.github.com 限流页·PAT 管理页·PRs REST 页·github.blog 2025-05-08 changelog·gh-as-backend 实践 wiki·gh_pr_list 手册），置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项；调研推翻我原「gh CLI 优先」倾向——ADR-0016 纯 Agent Plugins 分发语境下「用户机须装 gh」属 third-party consumer 反模式，辩证采纳 REST 主路） | ① 立案 #47=托管平台 API 适配器（GitHub PR 面只读采集），Micro-A preview 开工门前置；② 最小契约集=PR 枚举（含平台 Bot 判读 user.type=="Bot"＋login [bot] 后缀双检）＋PR 元数据＋diff 双通道（本地 git diff base...head 优先／API 兜底 base/head 不在本地 clone 的情形）；review/comment 面登记 planned 不入最小集（YAGNI 待真实需求拉动，同 D-035 逐面纪律）；③ 实现路径钉死=REST 直连＋X-GitHub-Api-Version pin 主路＋gh 已认证态可选回退（best-effort 不承诺契约）；④ 凭据三级探测即用即清：GITHUB_TOKEN env→本地 gh auth 借读（只读不改）→无认证降级（60/h＋预披露），不建 token 存储不引 OAuth；⑤ 限流=每响应读 x-ratelimit-remaining/reset 头＋余额写事实库运行日志，次级限流 403/429 遵守 Retry-After 退避不硬重试，触顶即停＋报告标注；⑥ 降级三态诚实披露可确定性触发可进 golden（ADR-0014 golden cassette 同款）；⑦ 锁表扩 kind=remote-api＋GitHub REST planned 行先行登记（未登记禁止接入 per ADR-0018/D-037） | 显式调和三写入票：锁表 kind 扩 remote-api=枚举扩容非偷改契约（D-037③ 逐字字段清单纪律）；API 面不替代 D-013 本地输入面（base/head 本地可解不调 API）；gh 回退标注「可选优化非依赖」不得被读作 git-cli 先例自然延伸（git 为产品硬依赖 gh 为额外二进制，前提不同）；凭据面交互（要求用户提供 token）停 D-026/D-027 用户闸门；人/机判读措辞=「平台声明的 Bot 身份」非语义判定（判不出自建 App 外 CI 脚本）；私仓场景（jiahao 等）列「token 必需」披露；raw 语义不出适配层；冲突核查 40 current 零冲突零 revised；执行时点=整理环节立案（BACKLOG #47＋spec-phase-tasks 注记＋锁表 planned 行草案），实现落执行窗 | current |
| D-049 | Q2（轮11）：Micro-A preview 铺开票（拟 #48）票面形态如何定义？（W15③；前置 #47 已凭 D-048 立案；desk-task15 判据=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」重绑 micro-a-preview-prep；atomcode 深调研 R11-Q2：11 查询×5 角度／6 原文核验，置信高） | 采纳（2026-09-16，原话「采纳」＝采纳修正后推荐全项） | ① #48 单票铺开=适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片渲染）＋双仓试点实跑＋报告双件＋披露三件套，一票闭环对齐 ADR-0017 层自成完整价值单元与 #38/#39 双先例；② 票内验收序列写死：a. golden 契约驱动管道段 PASS → b. env-manager 三形态实跑 → c. jiahao 全人基线 → d. failure 件 → e. 披露三件套 → f. desk-task15 判据核验＋micro-a-preview-prep 事件闭环；③ PR 选取最小充分集=恰 4 条具体实例：env-manager×3（dependabot×1＋release-please×1＋人类×1）＋jiahao×1（全人 merged 对照），硬判据=已 merged＋diff 规模适中（非单行非巨型重写，票面写死实例不给通用公式）；④ failure 演示件=anysearch-cli 无托管面诚实拒绝（D-033 硬约束逆用：intake 阶段显式拒绝→报告落 unsupported: 无托管 PR 面＋原因＋前置条件，复刻 A-044 先例）；token 缺席降级=degraded 通道 golden cassette 占位不混测；⑤ desk-task15 验证=字段断言脚本化进 NN-check.mjs：字段清单从 ADR-0006 骨架∩Micro-A 切片机械导出（禁手抄漂移），happy 正向 ⊇ 断言＋failure 反向拒绝语义断言；golden 只锁字段骨架不锁内容值（内容级 golden 归 GA 收口）；⑥ 披露三件套=preview 标注（capability N of M 措辞对齐 D-031 先例）＋同主确认偏差（happy 件报告头部醒目位置非脚注）＋「平台声明的 Bot 身份」措辞 | 票面引用 D-047 口径不得回引 D-033 原文（原判已被 #37 实测证伪）；happy 件=真实审计产物（D-030 provenance 披露制），fixture 仅用于管道 golden 段——票面写明两通道口径防「真实报告被误标 fixture」；骨架字段与真实 PR 数据不适配时不得在 #48 内静默改骨架（走 D-025 勘误双读数，骨架改动另立决策）；机器 PR 审计结果不得被读作人类代码质量结论（反向失真红线）；票面叙事写「试点集」不得写「覆盖面」（2 仓 4 PR 是形态覆盖非统计样本）；实跑凭据走主路或 gh 回退须如实披露；#47 未落地前 #48 不并行抢工（票面显式声明前置）；冲突核查 41 current 零冲突零 revised；执行时点=整理环节立案（BACKLOG #48＋spec-phase-tasks 注记），实现落执行窗 | current |
| D-050 | Q3（轮11）：T3 经典公开仓选定——回归 matrix 接入哪些仓？（W15②；D-046③ 授权「经典语言×经典公开仓」扩展；候选清单=46-classic-repo-candidates.md atomcode 一手元数据已核验） | A（2026-09-16，原话「A」＝三首选全接） | ① Macro-B 回归 matrix 接入三首选：C 族=git/git、Python 族=django/django、Java 族=spring-projects/spring-boot（resolve job DEFAULT JSON 一仓一行，matrix 自动各一 leg）；② 首跑以 workflow_dispatch 实测克隆耗时对 20min 预算，超预算者按备选表换（C 备 curl/curl、Python 备 pallets/flask、Java 备 apache/kafka）；③ GPLv2（git/git）对本场景无传染性顾虑——只读克隆审计不链接不分发其代码，license 风险面可接受不从严换 curl | 头部 OSS 仓基本无字面 docs/adr/ → Macro-B TC-1/TC-2 如实落 INCONCLUSIVE/insufficient（D-033 口径：管线跑通＋工件齐备=job 绿，反复接受非跑通如实落数）；变体目录映射（KIP/DEP/technical→ADR 语料面）属范围扩张须另立票评估不在本决策内；三仓只进 Macro-B 回归面不自动进 Micro-A 试点（Micro-A 需托管 PR 面属独立判据 per T7 复核②）；克隆外部仓守 intake 隔离纪律（hooksPath=noop／ext.allow=never／sha256 键／浅拒，#40 已落地）；执行时点=整理环节更新 BACKLOG #46 注记/新票承接＋执行窗落地 | current |
| D-051 | Q4（轮11）：listing 上架路径组合＋license 拍板（W15④；D-042 #41b 授权面；ADR-0016 渠道边界比对；事实底座更新=6F 已转公开仓【他方会话动作，同 P-1 型】，「私仓须 token」前提消失；engine/LICENSE 现为 UNLICENSED proprietary 占位与公开仓自相矛盾） | 两段拍板（2026-09-16）：①路径=「(a) A+C 双轨」；②license=「Apache-2.0」（原话「Apache-2.0」，经上游 license 兼容性实物核查：codelore 0.28.0=GPL-3.0-only external-cli 用户自装不传染／@duckdb/node-api=MIT 打包进 tgz 出站任选／git=GPL-2.0 exec 不传染／gh=MIT／scorecard planned=Apache-2.0 同族） | ① 上架路径=A+C 双轨：A=仓根加 .claude-plugin/marketplace.json（plugins[].source 指 ./engine）＋push，用户侧 /plugin marketplace add Xxx91n/6F 自助装；C=Agent Plugins 生态 plugin.json 已合规（#34）仓已公开，validator 过即发布+目录爬虫自动收录；两轨皆自助零审核同属 ADR-0016 指定生态；B 官方外部目录（clau.de/plugin-directory-submission 表单+人工审核）不在本次授权，留待用户日后单独拍板；② license=Apache-2.0：专利授权/专利报复条款降低企业采用摩擦＋商标条款护 listing 名＋与 planned Apache-2.0 上游（scorecard）同族；落盘=engine/LICENSE 换 Apache-2.0 全文＋engine/plugin.json・engine/package.json・.claude-plugin 双 manifest license 字段同步＋marketplace.json 同值；③ 凭据/字段值：author.name・author.email・marketplace.name 等表单值仍待用户提供（留下一题） | codelore/git 等 copyleft 上游永不得 vendor 进分发物（tgz 内嵌其二进制即 GPL 传染整个分发物——binary-discovery 形态即防线，锁表 contract 语义沿用）；路径 B 属灰区（Agent 插件专项目录非通用市场但含提交+人工审核）本次明确不授权；所有 push 动作仍停用户闸门（D-026/D-027 不变）；6F 已公开→.scratch 426 跟踪文件（决策账本/审计文书）已公开可见如实披露；listing 提交点击=listing-submission 事件本体仍用户专属；执行时点=整理环节落盘（marketplace.json 新建+license 换文+字段同步+BACKLOG #41b 行更新），push/提交落用户侧 | current |
| D-052 | Q5（轮11）：listing 字段值包——marketplace.name／author・owner 字段／插件名裁定？（W15④续；D-051 已定路径 A+C＋Apache-2.0；用户澄清追问 marketplace.name≠插件名的语义后经三层模型图阐明：市场=货架名／插件=商品名／plugin.json strict 权威） | 确认（2026-09-16，原话「确认」＝整包采纳；用户拍板「对外产品名就叫 6F」→ 插件名一并改 6f，安装链=plugin@marketplace 语法下 /plugin install 6f@xxx91n） | ① 插件名=6f：engine/plugin.json＋engine/.claude-plugin/plugin.json＋marketplace.json plugins[].name 三处同改（macro-audit 对外 listing 面退役，仓内 .scratch/macro-audit 目录与 description 文案不动）；② marketplace.name=xxx91n（市场名独立于仓名，install ref=6f@xxx91n 读作「xxx91n 的 6f」）；③ author/owner.name=Xxx91n；④ author/owner.email=xxx91n@duck.com；⑤ author/owner.url=https://github.com/Xxx91n；⑥ homepage/repository=https://github.com/Xxx91n/6F（双 manifest 补设）；⑦ license=Apache-2.0（D-051） | 插件名 6f 合法性已核（Agent Plugins 规范：2 字符小写字母数字、首尾字母数字、无 --/..；CC 市场名非 17 保留名非仿冒）；插件名改 6f 后对外可发现性靠 description/keywords 承担（用户明示取舍）；marketplace.json 新建时 plugins[].strict 默认 true=plugin.json 为组件权威；执行时点=整理环节落盘（engine 双 manifest name/license/author/homepage/repository 字段＋仓根 .claude-plugin/marketplace.json 新建＋docs/listing/credential-checklist §B 勾销），push 停用户闸门 | current |

## 第八轮 Grill（2026-09-16）— W14 收口窗口包（round9 审计交接单六项）

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-042 | Q1（轮8）：#41b 上架面——本窗口是否授权开工？（W14①；blocked-by=用户闸门明示＋listing-submission 事件 per D-040；票内三件套=listing 资产制作／marketplace 字段查证／凭据申请+提交） | C（2026-09-16，原话「C」＝全授权：listing 资产＋字段查证＋凭据申请三件套均开工，仅最终上架提交点击留给用户） | #41b 解除整票封锁、授权至提交前一刻：① listing 资产制作（截图/描述文案/图标）＋marketplace 字段查证（preview 标注字段＋D-037 版本元数据 schema 缺口＋竞品扫描）＋凭据申请=可执行工作面，随 DoR 就绪即做、filler 优先级不占关键路径（沿用 D-040 波次纪律）；② 最终上架「提交」动作=用户点击，listing-submission 事件语义收窄为提交动作本体；③ 凭据申请中凡需用户侧操作（账号/支付/协议签署/验证码）的环节回到用户执行，agent 只备材料不给代触 | 提交点击=用户专属动作，任何自动化/脚本不得代触；授权范围以本记录为限不外溢（其他外部账户开立/付费/法务承诺仍须逐项明示）；D-026/D-027 商业层闸门由「整票封锁」收窄为「提交单点」——非废除是精确化；凭据值不得入仓入文档入会话回显；执行时点=整理环节改 BACKLOG #41b 行＋registry listing-submission 事件注记收窄＋next-round.md 任务书同步 | current |
| D-043 | Q2（轮8）：多写者域终裁——mw-trigger-a/b＋desk-task7 如何判？（W14②；两触发器已 fired：#39 jiahao CI 回归／#38 Macro-C 共用 DuckDB；self-probe 读数=并行多写者被文件锁互斥化 1 胜 3 lock_denied fail-fast 零撕裂、跨进程串行追加 2/2、终读 66/66 零重复） | OK（2026-09-16，原话「OK」＝采纳修正后推荐全项；基于 atomcode 深调研：7 searches/8 原文核验 DuckDB 官方文档×3·Quack 博客·OneUptime 生产指南·HN·GH Discussion #22288·PostHog·Bugsink，置信高；缺口=Quack beta 生产故障案例缺失） | 意图读法闭环三落盘：① desk-task7 判据措辞写实改写=「多写者并发发起写入时，完整性由引擎级文件锁准入保证：竞争失败方显式失败（fail-fast 零撕裂）、胜者串行追加、终读零重复行；不承诺引擎层并行写」——判据守护结果属性不守护实现路径；② 两字段登记（D-024 纪律）：满足判据=39-mw-self-probe.json 实测证据；复审时点=D-034 三触发器任一激活且「锁等待进入关键路径」实测信号出现→重开升级评估，从 L1 写队列（bounded queue＋单 owner 进程）起步而非直接 Quack/DuckLake；③ mw-trigger-a/b 置 decided（裁决证据=本记录），mw-trigger-c 保留 event_bound 作复审触发面；并发策略成文=SWMR 单写者门面＋应用层 fail-fast 准入，升级阶梯 L0→L3 登记为复审语义 | 不成立票做真多写者（引擎层字面不可满足=官方 not a design goal；且与 A-007 排他理由正面冲突）；「把多写者收敛回单写者」本身是工业界正解非妥协；升级评估不得跳过 L1 直接上 L3；判据措辞改写属写实非松绑——实测证据不变；冲突核查全部 current（重点 A-007/D-005/D-024/A-044）零冲突，唯一冲突方向=字面读法；执行时点=整理环节改 registry（mw-a/b decided＋desk-task7 判据措辞/状态）＋30-desk-calibration.json task7.satisfaction 写实化 | current |
| D-044 | Q3（轮8）：desk-task15 处置——触发器绑错事件的语义错配怎么修？（W14③；判据=「≥1 条 Micro-A 真实 PR 报告产出且字段清单满足骨架交集」属 Micro-A 层，但 trigger_event=first-external-repo 已于 2026-09-16 随 #40 fired，产出为 Macro-B 报告→trigger-fired-criterion-unmet；正确事件 micro-a-preview-prep 已注册未发生） | OK（2026-09-16，原话「OK」＝采纳修正后推荐全项；基于 atomcode 深调研：8 原文核验 Elastic 规则历史·Prometheus ALERTS·Sentinel 关单·Wolfsberg/Sigma360·OpsAI·TechPlained，置信高；缺口=里程碑 gate 登记系统无完全同构公开先例，由 SIEM/SLO/AML 三邻域汇聚外推置信中高） | 重绑＋勘误留痕四落盘：① desk-task15 trigger_event 改绑 micro-a-preview-prep，trigger 文本改「Micro-A preview 前置/真实 PR 报告产出」，watch 维持 event_bound，判据原文不动；② 已 fired 的 confirmation 保留不删，行内勘误注记「前身绑定 first-external-repo 于 2026-09-16 判定错配（判据=Micro-A 产出，实产 Macro-B），fired 记录转审计痕迹」——Assignable Cause／Dual Reporting 语义复用；③ 重绑与勘误同次落盘成对动作（禁只重绑不留痕）；④ 升级条款沿用既有链：micro-a-preview-prep 按 LRM 到期仍不来→改绑一次→再到期升级用户，不新增机制 | 分层账本纪律：fired 事件=不可变 append-only 历史，绑定关系=可修正配置，两层各记各账；绑错=规则缺陷非事件缺陷，处置=修规则＋留 disposition，绝不删改已发生记录；禁转 manual_watch（本案绑定清晰可机检，转人工=D-041 明示要避免的降级）；禁拆判据（判据单一无歧义，错在绑定）；如实登记张力点：#33 守卫族不校验「绑定↔判据语义匹配」（本质人工判定）——随落盘留一行成因复盘不立新闸；冲突核查 D-001~D-043＋18 ADR＋CONTEXT 全词条零冲突零 revised；执行时点=整理环节 registry 数据面单点修正 | current |
| D-045 | Q4（轮8）：codelore-residual-faces——57 枚举中 4 个未登记残余面的去向裁决？（W14④；faces=entity-effort／architecture-violations／finding-hotspot-overlap／defect-validation；registry deadline 判据=逐面落「暂缓面集／后续批次／显式弃用」并落 D-xxx 原文） | ok（2026-09-16，原话「ok」＝采纳修正后推荐全项；基于 atomcode 深调研：8 searches/7+ 原文核验＋codelore-src v0.28.0 四实现文件一手核实（entity_effort/arch_violations/defect_validation/finding_hotspot_overlap.rs＋calibrate_defects.rs）；Herbold EMSE 2022 SZZ 噪声定量证据；我方初判 3 对 1 过重被修正） | 逐面裁决=1 后续批次＋3 暂缓面集、零弃用：① entity-effort→后续批次（纯 git 零外部输入，CodeMaat parity，与已契约 entity-ownership 同族——建议随 S5 ownership 族一并契约化）；② architecture-violations→暂缓面集，判据=目标仓存在 .codelore-arch-rules.toml（或我方为被审仓起草规则集），复审=Macro-B preview 结构象限拉动时——性质=可算但空输入下诚实缺席非不可算；③ defect-validation→暂缓面集，判据=产出 defects.calib.json 前置票＋SZZ 噪声披露（引 Herbold 2022：SZZ 判定的 bug-fix 仅约半数为真），复审=S4/ADR 假设抽取层需缺陷-健康关联证据时——输入依赖=AG-SZZ 自挖掘非 issue tracker；④ finding-hotspot-overlap→暂缓面集不弃用，判据=首个外部扫描上游接入，复审=#42 上游队列评估时点，激活时触发 ADR-0014 适配器评估——对齐 CodeScene hotspot×findings 治理心智模型 | 弃用判据从严：复合派生/需外部输入非弃用理由（弃用仅用于无价值或语义冲突面）；「诚实缺席」语义（空输入零行/0.0 分）为上游内建性质，不得把零行当失败；defect-validation 激活必带 SZZ 噪声披露（ADR-0015 量测效度先行同向）；登记面同步：暂缓面集清单 22→25＋registry faces[] 逐面标 disposition/判据/复审时点＋spec-phase-tasks 注记（否则 33-check B3 FAIL）；D-035④「preview 拉动补 golden 契约」框架不变，本次判据为其具体化非改向；冲突核查全 current 零冲突零 revised；执行时点=整理环节 | current |
| D-046 | Q5（轮8）：jiahao 回归 CI 首实跑处置——前置链如何打通？（W14⑤；原方案=workflow 内嵌被测仓需 MACRO_AUDIT_6F_TOKEN 私仓 PAT；用户追问「为何牵扯 jiahao」后改选） | d（2026-09-16，原话「d。我们可以测其他经典语言、经典的公开仓库。但是不要影响jiahao仓库的其他内容，小心谨慎」＝采纳 (d) 迁移方案＋授权扩展回归目标到其他经典公开仓＋jiahao 撤除限于单文件） | 回归面从「被测仓内嵌 CI」迁回「6F 自有 CI」：① 6F .github/workflows/ 新增回归 job——repo add URL opt-in 克隆 jiahao（公仓零 token）等公开仓→Macro-B one-shot→工件落库；schedule+workflow_dispatch 双触发面沿用；② jiahao 仓 .github/workflows/macro-b-regression.yml 单文件撤除（删除提交上 jiahao main），**严禁触碰 jiahao 其他任何内容**；③ 回归目标集授权扩展=可测其他经典语言/经典公开仓（不限于三试点）；④ mw-trigger-a 语义不变（Macro-B 进 CI 定时回归在 6F CI 形态同样成立），D-043 裁决与 D-034④a 触发器条款不受影响；⑤ MACRO_AUDIT_6F_TOKEN 需求取消（无跨私仓面） | jiahao 撤除=单文件删除提交、零其他改动（用户明示小心谨慎——操作前后须 diff 验证仅一文件变更）；回归目标扩展仅限公开仓且一律走 URL opt-in 输入面（D-013），克隆外部仓守 intake 隔离纪律（hooksPath=noop／ext.allow=never／sha256 键／浅拒，#40 已落地）；「被测仓 CI 内嵌」形态与 Agent Plugin 分发不符（ADR-0016），放弃该形态不构成损失；6F push 与 jiahao 删除提交 push 分别需授权；执行时点=整理环节立案（新票挂 BACKLOG）＋执行窗落地 | current |
| D-047 | Q6（轮8）：Micro-A preview 试点候选集确认——{env-manager, jiahao}？（W14⑥；D-033 原判 env-manager 唯一合格试点被 #37 实测证伪：jiahao 有托管面 6PR 全人／env-manager 10PR 含 dependabot/release-please 机器边缘形态；capacity 重排结论待收口确认） | C（2026-09-16，原话「C」＝采纳 (c)：双试点确认＋预留第三槽） | ① Micro-A preview 试点集={env-manager, jiahao}——env-manager 打机器 PR 边缘形态（dependabot/release-please=最难判区分度），jiahao 打全人 PR 干净基线（既是回归仓又是试点仓复用）；② 预留第三候选槽=经典公开仓 Micro-A 泛化点，挂靠在托管平台 API 适配器落地后激活（D-034② 登记新外部面前置），不排期；③ 两仓同主属确认偏差面沿用 D-033 登记口径如实披露 | PR 层试点不得指派无托管 PR 面的仓（D-033 硬约束维持）；第三槽激活须托管 API 适配器先行（外部面新接入走 ADR-0014 双轨制评估＋锁表登记）；jiahao 随 D-046 撤 CI 后仅作审计对象不承载我方资产；冲突核查全 current 零冲突（对 D-033 是 capacity 重排的收口确认非改向——原判依据被实测证伪属证据更新）；执行时点=整理环节（BACKLOG/registry/spec-phase-tasks 同步＋desk-task15 重绑已凭 D-044 就绪） | current |

## 第七轮 Grill（2026-09-15）— 阶段 3 挂门拍板包（守卫首跑 ALARM 处置）

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-037 | Q1（轮7）：25-P2 版本与上游锁定数值化承诺——现在拍 or 改绑一次？（守卫首跑 ALARM：deadline=阶段 2 双结题已过） | 采纳（2026-09-15，原话「采纳」＝修正后推荐六条全项；基于 atomcode 深调研：8 searches/5 原文核验 semver.org·slsa.dev·deterministic-deps·Mergify·appsecuritystandards，置信高；信息缺口=Agent Plugins marketplace 版本元数据 schema 未查得原文，并入 #41 前置查证） | P2 处置=现在拍（升级非改绑），制度化六条：① 版本纪律=0.x 单调递增（minor=契约变更、patch=修复、不回退发旧线补丁），1.0 退出条件写死=报告 schema 冻结+已接上游适配器全过确定性验收；② 报告契约补强=report_schema 独立版本号+stability:"preview"+capabilities:["macro-b"] 头字段+provenance 锚加锁定表快照 hash+superseded_by 归档互链（spec 注记，落报告 schema 票）；③ 新建 engine/upstream-lock.yaml（字段 id/kind/version/pin_type(exact-version|commit-sha|digest)/contract/status(active|planned|evaluating|retired)/adapter/last_reviewed/next_review；retired 行不删；种子行=codelore active exact-version+--version 契约/scorecard+repomix planned/sqlite-dump evaluating+风险注记）；④ 更新节奏=手动窗口（每 release 前）+全量 golden 回归护航，禁 Renovate 式自动升级（detector 版本变化=审计口径变更）；⑤ 门禁=advisory→enforce 两段式（deterministic-deps 模式：版本断言 job+锁定表新鲜度+三处标注同源+golden diff）→独立小票 #44（#43 保持样例 golden 单一职责）；⑥ 落位=docs/versioning.md 成文+README §3 上游清单表加状态列指向锁定表为机读权威+CHANGELOG entry 引用 lock diff | 0.x 不作免责滥用（声明即契约）；pin 禁 range/浮动 tag/latest；锁定表先于依赖存在（禁未 pin 接入）；漂移检出=报告换戳不作废（superseded_by 互链）；上架动作仍用户闸门（D-026/D-027 不变）；冲突核查 30 current+17 ADR 无 revised——superseded_by=D-025 Dual Reporting 机制化延伸、capabilities/stability=ADR-0017 报告面延伸、禁 range=D-020/ADR-0014 补强，均同向；执行时点=grill 定稿后整理环节；整理环节更新 25-checklist P2 行=decided-now+registry 触发面关闭+BACKLOG #44 立案+docs/versioning.md 落盘 | current |
| D-038 | Q2（轮7）：25-D4 演示入口形态——样例仓 or 内置 fixture？（开工门已触发，阶段 3 铺开 in_progress，deadline 实到） | OK（2026-09-15，原话「OK」＝采纳修正后推荐全项；基于 atomcode 深调研：8 searches/7 原文核验 FerrLabs·golden-file 双指南·Zylos·Anuj Raja·CASRAI·FeatureOps，置信高；缺口=无同构公开先例，.expect.toml 为测试惯例迁移） | D4=内置合成 fixture 生成器为主干＋外部样例仓仅文档 opt-in：① 资产形态=fixtures/definitions/*.json（happy-path＋degraded-supply＋degraded-incomplete 首发三个）＋fixtures/golden/＋generator/ 随 tgz 分发；生成器输出确定性 git 仓（merge/多分支/tag，FerrLabs 模式），临时目录生成跑完即弃；② 入口=demo [--scenario] 命令，默认 happy-path，scenario 列降级变体；③ 披露块=机器可读 CASRAI 式（fixture: synthetic (generated by <ver>)｜not an audit of any real repository｜capability 1 of 5 · preview｜supply-chain: ⚠ unverified），与 D-037② 报告头字段合并为统一契约面（spec 注记归并，防两处手抄漂移）；④ 外部样例仓不进 tgz，README 设「Try on a real repository」节给 1-2 个 opt-in 公共小仓链接＋「外部内容随上游变化不可 golden 预期」标注；⑤ 归票=新票 #45（生成器＋定义三件套＋demo 命令＋披露块），#43 golden CI 消费同一 definitions（#43←#45）；⑥ 时序=#45 列阶段 3 早期票（与 #35 并行或紧随，整理环节排波次表） | 合成数据不得冒充真实审计结论（披露块为硬契约非脚注）；失败路径为一等演示场景须可确定性触发（degraded-supply=D-034④ 供应链未接的演示化实现）；demo 内部走同一 Repo Intake 本地路径不设新输入面（D-013）；外部样例仓仅限文档 opt-in 标注非确定；与 D-030 静态样例报告 README 各自成节互不冒充；冲突核查 30 current＋17 ADR 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 25-checklist D4 行=decided-now＋registry 触发面关闭＋BACKLOG #45 立案 | current |
| D-039 | Q3（轮7）：25-B3.3 仓根 CHANGELOG.md 口径——与 engine/CHANGELOG.md 如何分工？（开工门已触发，deadline 首发 tag 前） | OK（2026-09-15，原话「OK」＝采纳修正后推荐全项；基于 atomcode 深调研：7 searches/6 原文核验 keepachangelog 1.1.0 全文·common-changelog·ReleaseRay·adrkit PR#110·MS decision-log，置信高；缺口=指针制条目仅项目级先例非成文标准） | 双层分工＋里程碑编年指针制：① engine/CHANGELOG.md=产品版本账唯一权威（Keep-a-Changelog；capability 范围声明+BREAKING/CHANGE+upstream-lock diff 引用+report_schema 版本），头部加反向指针「仓级编年见 ../CHANGELOG.md」；② 仓根新建 CHANGELOG.md=仓级编年——不用版本号不用 KaC 名义，条目键=## [M-xxx] - ISO日期，头部固定模板声明「本账=仓级里程碑/决策编年；产品变更以 engine/CHANGELOG.md 为准」；条目=机器可解析固定字段行（里程碑名/ADR 区间/执行账 A 区间/账本节指针/一行影响声明），只引用不复制；首条=spec/decision 阶段封口（区间写文件时实物读出，不写死数）；③ 守卫扩展=指针有效性校验（引用 ADR 存在且非 superseded、里程碑 ID/日期单调、双账互指）并入 #44（同族「声明↔实物一致性」advisory→enforce 机检）；④ B3.3 行=decided-now；仓根 CHANGELOG 落盘随 #41（首发 tag 同门） | 仓根编年绝不出现版本号（根除与 engine 版本竞争单调性）；禁根聚合复述 engine 内容（firehose 反模式实证失败）；禁手维护索引式内容复制（SSOT）；条目须机器可解析（守卫可确定性校验）；冲突核查 30 current＋17 ADR 无 revised——与 D-037⑥/ADR-0017 覆盖声明/SSOT 纪律同向；执行时点=grill 定稿后整理环节；整理环节更新 25-checklist B3.3 行=decided-now＋registry 触发面关闭＋#44 守卫范围注记 | current |
| D-040 | Q4（轮7）：#41 分发收尾调度——提前开工 or 随 W13 整批？（审计交接校正：Blocked-by 仅 #34 已 done，严格依赖现已可开工） | OK（2026-09-15，原话「OK」＝采纳修正后推荐全项；基于 atomcode 深调研：6 searches/6 原文核验 SAFe ART Flow·sreschool·Humanizing Work INVEST·Mountain Goat SPIDR·Atlassian WIP·Docsio，置信高） | #41 拆两片分别调度：① #41a「分发收尾·仓内文档面」DoD=examples/ 样例复制且可复现＋README 能力边界/preview 标注与冻结发布模型逐条对上＋仓根编年首条落地＋护栏「能力边界文案以冻结决策为唯一事实源、扩面变更走文案 update 子项」；调度=就绪即做、filler 优先级（不占关键路径）；② #41b「分发收尾·上架面」=listing 资产＋marketplace 字段查证（含 D-037 版本元数据 schema 缺口）＋凭据申请；blocked-by=用户闸门明示＋listing-submission 事件——不排程不入波次不占 WIP；③ 纪律锐化入规：开工闸门=DoR（依赖闭合即可拉），波次收敛为协调/验收装置（整批 demo/评审/回顾）不再充当开工闸门；④ #41a 的 README/编年改动受 #44 守卫族覆盖（标注同源＋编年指针校验） | #41b 不得以任何形式传导「凭据申请在推进」的授权暗示（D-026/D-027 用户闸门不变）；波次锐化为澄清非反转——D-036 排程本义即依赖次序；拆票判据（完成定义不可同测 or 部分被非工作项事件门控→该拆）入规供后续票据复用；冲突核查 30 current＋17 ADR 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 BACKLOG #41 拆分＋next-round.md 解锁口径修正 | current |
| D-041 | Q5（轮7）：#33 机检覆盖 16/27 残余——11 项无事件绑定项如何处置？（审计登记残余项：desk-task×10＋codelore-deferred×1 靠 prose review_at 人工盯） | ok（2026-09-15，原话「ok」＝采纳修正后推荐全项；基于 atomcode 深调研：7 源核验 Airbyte 触发架构·PCI/NIST 补偿控制·MHA 残余风险·Fowler 事件分类·Sigma360 watchlist，置信高） | 三态登记＋分层处置：① registry 补 watch 字段三态=event_bound（默认）/manual_watch（显式五要素：标记+责任人+复审时点+验证方法+确认记录）/risk_accepted（接受人+理由+到期日）；② 补绑序=扫 11 项按四模式成本序（事件词表扩展→票完成/PR 合并事件→轮询谓词→不可绑入 manual_watch），禁通用规则引擎；③ 守卫语义扩展=manual_watch 项扫「复审时点逾期 or 确认记录缺失」，逾期转 risk_accepted 候选报警，每次运行输出 event_bound/total 覆盖率指标；④ 盯梢频率按到期紧迫度分层；⑤ 归票=registry schema＋守卫语义扩展作 #33 扩展子项（同族增量不立大票），补绑数据面属整理环节 | MANUAL_WATCH 不是终点是过渡态——复审时点过仍未绑=升 risk_accepted 记录接受人（LRM 闭环机制化）；人工确认须留痕（判据版本/判定人/理由/时间戳——「ran but undocumented」为监管级 finding）； prose 复审本身不构成补偿控制；覆盖率缺口永远显式可见不隐性；冲突核查 30 current＋17 ADR 无 revised（升级链=CONTEXT.md LRM Binding 词条的机制化实现，同向）；执行时点=grill 定稿后整理环节＋#33 扩展子项 | current |

## 第六轮 Grill（2026-09-15）— #25 拍板包 + 阶段 3 铺开预研裁定

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-029 | Q1（轮7）：#25-B1.2 启动器收尾硬要求加黑体强提示（防 W2/W3 V2 重演）——措辞、位置、范围？ | ok（2026-09-15，原话「ok」＝采纳推荐方案：段首位置＋黑体措辞＋31 份 prompts 全量） | 在现存 31 份 prompts/NN-*.md 的「## 收尾」段首插入黑体强提示块，原描述句保留在强提示块之后；措辞逐字＝「**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 reports/NN-report.md；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。」；范围＝现存 31 份 prompts 全量（BACKLOG 原估 18 份已过时）；handoffs 不另加强提示（完成定义已是硬判据清单）；未来新票由 WORKFLOW §4.2.6 模板纪律继承 | 措辞逐字落地（声明类文字 1:1 对齐纪律，禁语义近似改写）；不动 handoffs 完成定义段；grill 期间不动仓——执行时点＝本轮 grill 定稿后的整理环节；整理环节同步把 #25-checklist B1.2 行状态列更新为 decided-now | current |
| D-030 | Q2（轮7）：#25-D1 23-first-report 双件套是否列为发布样例资产＋落位＋防失真机制？ | 采纳（2026-09-15，原话「采纳」＝修正后推荐 ①②③ 全项；基于 atomcode 深调研：落位惯例高置信（Go project-layout 成文 + preflight-scout/claude-config-auditor 交叉验证）、dogfooding 利弊中置信；信息缺口：无大厂官方 style guide 成文论述，结论由开源惯例归纳） | ① 确认 .scratch/architecture-recovery/reports/ 下 23-first-report.{md,json} + 23-first-report-failure.{md,json} 四件列为发布样例资产（happy+failure 双对，覆盖 D-007 Macro-B 两路径）；② 落位仓根 examples/first-report/（复制非移动，.scratch 原件留溯源链），目录带一页 README 声明「6F 自审真实产物、非合成 fixture」＋生成 commit＋日期＋重生成命令（erf/preflight-scout 披露双先例）；③ 防失真本阶段走披露制（报告自带 provenance 三锚 commit pin＋spec 版本＋data fingerprint＋detector 版本戳＋⚠ unverified 段）；样例 golden CI（CI 重渲染 fixture 并 diff、更新走 PR 审查）登记为阶段 3 候选票，与 T7 机检化同批立项 | 禁自动重生成样例直通 main（Jest/Vitest snapshot 纪律：入版本库＋code review）；样例不得被读作「当前读数」——必须披露冻结时点属性（生成 commit＋日期戳）；README/marketplace 引用只能指向 examples/first-report/ 公共路径，不得链 .scratch 工作区路径；冲突核查已执行：与 D-003/D-007/D-021/D-025/D-027 无硬冲突（辩证点记录在案：调研方 canonical＝合成 fixture，本品采纳真实自跑因披露机制已内建；家丑外扬对本品＝自举证）；执行时点＝本轮 grill 定稿后整理环节；整理环节同步把 #25-checklist D1 行状态列更新为 decided-now | current |
| D-031 | Q3（轮7）：#25-P6 最小可发布形态——Macro-B 单 scale 即上架 vs 等更多 scale？ | 采纳（2026-09-15，原话「采纳」＝修正后推荐全项；基于 atomcode 两轮取证：通用惯例轮 9 searches/6 reads/五角度＋内部约束嵌入轮（冲突核对表）；置信高；信息缺口=Agent Plugins preview 标注字段未成文、竞品占位未扫描） | P6＝Macro-B 单层＋Preview 形态即具备上架资格：① 形态=「capability 1 of 5 · preview」＋0.x 版本语义＋changelog 明示当前覆盖范围（Pichler MMP 判据：Macro-B「装完→四象限叙事→证据可溯→降级披露」已是完整价值单元）；② README/marketplace 描述首段披露能力边界，5 scale 作 roadmap 叙事非可用承诺（JetBrains 类比：不得暗示未实现功能）；③ 划界入规：build-scope（5 层全规划，ADR-0001 standing）≠ release-sequence（分层暴露），preview 上架不构成 MVP 切片；④ 其余 4 scale 各走独立 preview→GA 漏斗不打包等齐（Copilot 分级惯例）；⑤ 派生登记：Agent Plugins preview 标注字段查证＋同生态竞品 audit 插件占位扫描＝上架票前置子任务 | 本记录不授权上架动作（D-026/D-027 用户闸门不变）；不得把上架版说成「产品 1.0/完整五档审计」；降级披露机制（⚠ unverified／三层闸门）升级为对外承诺载体，preview 标注诚实是决策本体非装饰；禁止为撑首发临时补齐未验证 scale 的展示面；冲突核查穷尽 24 条 current 无 revised 需求——ADR-0002(superseded)/D-002(revised) 的宽解读风险由本条划界款吸收；执行时点＝grill 定稿后整理环节；整理环节更新 #25-checklist P6 行＝decided-now | current |
| D-032 | Q4（轮7）：#25-D2 上架期演示路径覆盖口径——仅 2/10 or 排期补齐其余 8 条？ | 采纳（2026-09-15，原话「采纳」＝终版推荐全项；基于 atomcode 两轮取证：首轮＋全约束轮 6 searches/6 reads（Snyk／MS Entra／SPFx／Boomi／LaunchNotes／Harness 原文核验）；置信高；缺口=Agent Plugins 生态无同型先例属相邻惯例外推） | ① 上架期演示面=仅 Macro-B happy+failure 2/10 路径（即 D-030 examples/first-report/ 双件），不首发补齐其余 8 路径、不交付未上架层任何预览性演示资产；② 其余 8 路径补齐时点=各层 preview 里程碑的 DoD 准入件（「该层 happy+failure 演示双件」写入每层 preview 票完成定义），不日历独立排期；③ 未上架层仅以文字披露＋roadmap 叙事＋「Not yet in preview」式标注露出（Snyk／MS／Boomi 披露制先例）；④ failure 路径首发即含属超配项（多数 preview 仅 happy path），正向保留 | 禁为未上架层造资产化演示（preview 条款不背书未发布能力，与 0.x 语义直接冲突）；演示资产与能力真实状态不得解耦（防失真纪律）；演示随版本重生成义务沿用市场 listing 规范；D-007 十路径矩阵设计不缩减，本条只定发布时序；冲突核查穷尽 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist D2 行=decided-now | current |
| D-033 | Q5（轮7）：#25-B4.2 与 jiahao / anysearch-cli / env-manager 三试点仓对接的产品方向与优先级？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/7 全文核验，角色框架高置信、多仓排序法中置信=a16z design-partner 框架迁移；缺口：各仓 PR 人/机比与 supersede 链完整度未实测） | 对接方向=试点仓角色绑定能力层而非仓：① 角色分配=anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材）／env-manager→Micro-A 唯一合格试点＋泛化验证（唯一托管 PR 面，含 dependabot/release-please 非人类 PR 边缘形态）／jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限）／三仓并跑→Macro-A 泛化冒烟（需≥2仓天然最后）；② 时序=Macro-B 已上架层立即对三仓各跑一次 one-shot 泛化验证，jiahao 挂 Macro-B 持续回归（阶段3 CI 票），其余层试点随各 preview 漏斗；③ 前置票=试点面可用性审计脚本（PR 人/机比、supersede 链完整度实测）；④ 拆票=可用性审计→Macro-B 三仓 one-shot→各层试点→回归接入，不立大票 | 结构性限制入规：三仓同主属确认偏差面（dogfooding=generative not evaluative，OCLint 官方口径只给信心不证泛化），试点定位=校准＋冒烟；泛化验证必须引≥1 非自有公开仓（D-013 URL opt-in 首实用户），登记为 Macro-B GA 前置条件；持续回归仅限已上架层；试点成功度量=反复接受非跑通；PR 层试点不得指派无托管 PR 面的仓（capacity 硬约束）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节；整理环节更新 #25-checklist B4.2 行=decided-now | current |
| D-034 | Q6（轮7）：阶段 3 铺开次序——第二能力层选型、上游接入次序、任务 7 多写者域封口时机？ | OK（2026-09-15，原话「OK」＝采纳推荐全项；基于 atomcode 取证：6 searches/6 reads，三子问题均 ≥2 独立惯例支撑，置信高；多仓排序/基础设施封口时机为框架迁移中置信） | 阶段 3 串行骨架=扩面→Macro-C→Micro-A→Micro-B→Macro-A：① 首个铺开票=CodeLore 契约面扩开（考古层所需面＋S3/S4/S5 矩阵行拉动，单上游原则不破）；② 层序=Macro-C 第二（复用 Macro-B 行为象限管道＋anysearch-cli 试点面＋CodeLore 同源）→Micro-A 第三（env-manager 试点激活点，需托管平台 API 适配器新外部面）→Micro-B 第四（jiahao 下限＋回归）→Macro-A 最后（≥2 仓并跑）；③ 供应链象限在 Macro-B preview 报告降级为「⚠ 数据未接」，Scorecard/repomix 探针按层需求队列接入不插队；④ 任务 7 多写者域改写为触发器条款：三触发器任一即实测封口——(a) Macro-B 进 CI 定时回归、(b) Macro-C preview 共用同一 DuckDB、(c) Macro-A 启动；⑤ Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制 | 禁止 Scorecard 插队只为补齐 preview 供应链象限（降级披露制已立法）；触发器条款不得被读作铺开期前置门禁（infrastructure-last 纪律）亦不得无限拖（value lead time 变差=人为瓶颈信号）；D-024 兼容吸收：三触发器即其两字段纪律的「满足判据」登记；D-033 批一并行修正为错峰（env-manager 随 Micro-A 漏斗顺延）；冲突核查 26 条 current 无 revised；执行时点=grill 定稿后整理环节 | current |
| D-035 | Q7（轮7）：CodeLore 契约面扩开清单——扩开粒度、首批面集、sqlite dump 替代路径处置？ | 走推荐（2026-09-15，原话「走推荐」＝采纳推荐全项；事实底座=codelore analyze --help 实物枚举 56 面，非记忆） | CodeLore 扩开粒度=按「层需求×面族」分批契约：① 首批（Macro-C preview 票内）=演化主干 12 面＋S3 族 6 面＋S5 族 12 面≈30 面，逐面 golden 契约测试钉死（ADR-0014 纪律）；② LLM 面（explain 族）单独成票——env 门控＋成本面，S4 假设抽取前置，独立验收；③ sqlite/parquet 全量 fact-store dump 立为对照评估项——首批仍走逐面契约（契约即文档、golden 可测），dump 若采纳须另立 ADR（适配层语义翻译面变厚）；④ 暂缓面集（Micro 层/备用 ~20 面：function-*、clones/clone-coupling、coupling、hotspots、code-health、centrality、communities、soc、effort-exposure、code-familiarity、delivery-friction/metrics、cycle-origins/cycle-health、unstable-interface、refactoring-targets、authors、top-committers、crossing 等）登记「满足判据+复审时点」=各层 preview 前置（D-024 两字段纪律） | 禁止一次契约全部 56 面（2b 薄切片纪律）；禁止 dump 路径绕过逐面契约直通（raw 语义不出适配层——D-020）；LLM 面不得混入首批（独立 env 门控＋成本验收）；暂缓面集必须挂复审时点不得裸挂；执行时点=grill 定稿后整理环节 | current |
> 勘误注记（2026-09-16，per D-054⑤）：D-035④ 暂缓面集（~20 面）中 `hotspots`／`coupling`／`function-hotspots` 三面经 #51 激活——消费侧扩展至 Macro-B behavior 象限（CODELORE_BEHAVIOR_FACETS，group=behavior），逐面 golden 契约同 #35 模式不变；function-coupling 因 --target 参数面形态留暂缓面集。契约本体（适配层 raw 语义不出层）不改。

| D-036 | Q8（轮7）：阶段 3 票据包成型——D-029~D-035 派生项归票、编号、挂门依赖、执行次序？ | OK（2026-09-15，原话「OK」＝采纳票据包全项） | 阶段 3 票据包立案（编号续 #32 起，写回 BACKLOG）：#32 B1.2 落地=31 份 prompts 黑体强提示（机械批改，整理环节可做）；#33 T7 挂门机检化=guard 脚本扫所有挂门项「最迟时点/触发事件/复审时点」到期报警（独立小票横切兜底，阶段 3 最优先）；#34 plugin.json 修复=对齐 Agent Plugins 1.0.0 ＋AJV 校验入 guard（独立小票挂上架硬前置链，不并入分发收尾票——修正 handoff 原建议：验证独立、上架票不混工程噪音）；#35 CodeLore 扩面首批≈30 面 golden 契约（Macro-C preview 前置）；#36 LLM 面独立票 env 门控＋成本验收（S4 假设抽取前置）；#37 试点面可用性审计=三仓 PR 人/机比＋supersede 链实测脚本（试点前置）；#38 Macro-C preview=anysearch-cli 校准＋单仓校准披露＋演示双件 DoD（依赖 #35/#36/#37）；#39 Macro-B 三仓 one-shot＋jiahao 回归接入 CI（=多写者触发器 a 激活点）；#40 非自有公开仓泛化验证≥1 仓走 URL opt-in（Macro-B GA 前置）；#41 分发收尾=examples/first-report/＋README 披露页＋preview 标注/0.x 语义/changelog＋listing 资产＋preview 字段查证与竞品扫描＋凭据申请（上架动作仍属用户闸门）；#42 上游队列=Scorecard/repomix 探针＋sqlite dump 对照评估（层需求拉动不插队）。次序：#32/#33 整理环节→#34/#35 并行首票→#36/#37→#38→其余随层序 | 上架动作不授权（D-026/D-027 用户闸门不变）；票据包为立案框架非 spec——各票需求面在整理环节填实；#34 独立 vs handoff「并入分发收尾票」原建议为明示修正点；执行时点=grill 定稿后整理环节 | current |

| D-023 | Q2（轮5）：阶段 2 缺口回流中是否应接入上游组合件？调研推荐路径？ | **采纳γ路径——阶段2拆分=2a冻结校准→2b CodeLore单上游探针**。2a：在首报frozen数据（仅git CLI+DuckDB）上纯spec/文档校准16项缺口中不依赖新上游的部分，标记须上游probe才能闭合的缺口。2b：接入CodeLore一条薄垂直切片（适配器→fact→重跑首报同仓→同一spec版本diff），用diff归因数据源漂移。序列化保证单变量控制。 | 阶段2内部拆分为2a+2b两子步骤，严格序列化；2a冻结校准用现有两条上游数据、不碰代码；2b只接一个上游（CodeLore，覆盖任务1/3/10三项高优缺口），通过适配器+fact+重跑+同spec diff保证单变量归因；Scorecard/repomix仍推到阶段3（strangler fig逐项接入，避免大爆炸）。 | 2a完成前不得启动2b（序列化纪律）；2b必须带provenance锚定（commit pin+spec版本+data fingerprint）；2b适配器必须遵守D-020防腐层纪律（禁放业务规则）；不因2b接入CodeLore而在阶段2追加接入Scorecard或repomix（一条上游探针就够了）；冲突协议：D-022标revised，原记录保留，本记录（D-023）为current取代。 | current |
| D-024 | Q3（轮5）：2a 冻结校准范围如何划分？争议任务 7 如何归类？ | 采纳 γ 路径调研裁定（原话「ok」，2026-09-15；基于 atomcode R5-Q3 深调研，报告 reports/R5-Q3-atomcode-research.md） | 2a 冻结校准范围 = 三问决策树：Q1 未知变量是外部工具输出的形态/语义/规模（无法从 spec 文本或自有数据推导）→ 上游探针轮；Q2 未知变量是自家系统在负载/争用下的行为 → 自证探针（self-probe），属铺开阶段实测、不是上游探针；Q3 未知变量可由 spec 内部契约+冻结首报数据推导 → Desk calibration。经调研核验：三「必等上游」项判定成立（CodeLore explain_file 受 CODELORE_LLM_ 环境门控、Scorecard --format=probe 44 probe 字段形状须实跑固化、repomix --token-count-tree 跨仓差异巨大）；10 项 desk 可校准清单成立。争议任务 7（事实表并发写入策略）裁定 = 按域拆分（非整项 desk 亦非整项推迟）：单写者维度用 228 条冻结实测出 desk 草案并标注置信域；多写者维度登记为自证探针项、铺开阶段实测后封口；原登记前置「CodeLore DuckDB schema 复审」判定为类别错放（缺 Q2 行为证据、给的是 Q1 契约证据），标 stale 并记录纠偏理由。本条新增 self-probe 类目补全 D-023 的 desk/上游二分法，不改 D-023。 | desk 草案必须标注置信域，禁止把单写者实测证据外推到多写者域（DoD 验证域原则 + Iceberg single-writer 生产先例）；所有保留「待 probe」占位的缺口登记时须带「满足判据 + 复审时点」两字段（PMI 失效前置惯例，否则退化为无人复审的死锁项）；2b 仍只接 CodeLore，Scorecard/repomix 探针在阶段 3；本条与 A-007 SWMR 决议无冲突（多写者实测本就是 A-007 明示的 Phase 4 遗留，本条仅正式登记为 self-probe 项）；model-based estimate 只在实测验证过的域内可接受，数据不足时补测或显式降级为「模型估计待实测确认」、禁静默外推 | current |
| D-025 | Q4（轮5）：TC-2 RED（首报真发现 mean_ratio 0.2462 / Status/Date 缺失率 84.62%）处置方向？ | 采纳（2026-09-15，原话「采纳」；基于 atomcode R5-Q4 深调研 FDA OOS 框架呈报，报告 reports/R5-Q4-atomcode-research.md，resume 锚点 dd6c7fec-efce-4c24-8867-eec2ad179053） | 处置 = (c) 顺序双轨 + (d) 勘误式双读数留档 合成，权威框架 = FDA OOS 两阶段调查规程（Barr 判例/2006 指南）。执行序：① 阶段 1.5 = 14 份 ADR 人工真值表（量测审计，**先于任何 v2 实现**——真值表同时是 v2 验收 golden set 与原 RED invalidate 的 assignable-cause 证据；AIAG MSA 惯例：测量系统分析先于用测量数据做过程决策）；② 两条修复线预注册互不为条件——判据 v2 追加（接线 A-002 回退链入 detector，v1 留档，验收 = 与人工真值表一致率）∥ ADR 治理卫生票（验收 = 人工/v2 读数中真实缺失清零），互为引用、互不为完成条件；③ 发布规范 = 勘误式双读数：原 RED 不撤回不覆盖（dated measurement），v2 修正读数以勘误/并列形态发布 + 逐份 delta 表量化量测误差；RED→绿唯一合法通道 = 成对动作「原读数记 invalid（附逐份可归属原因）+ 修正读数成为 reportable value」；④ C 层「信任并行动」裁定的 disposition 按 CAPA reopen 惯例待 Phase 1（量测审计）补毕后再落——不推翻人裁定本身，只补前置调查。 | 伦理判据对称适用：「规则是否先于结果存在且有独立出处」——回退链先于 RED 交付 ⇒ v2 = 修 bug；RED 后发明指标 = HARKing；对偶地未确认量测效度前补齐 ADR 头迁就 detector = teaching to the test（(a) 路径禁区）；delta 中被确认的真实缺失部分不得因任何 detector 改动而消失；重测次数与判定规则事先写死（禁 testing into compliance）；不改写已落盘的 C 裁定原文与时间戳、不改写任何预注册文件（不可变纪律）；TC-2 v1 阈值 0.60 不动，本条只修构件解析；「事后写判据」本身是审计发现项——两线互不条件语句须以预注册措辞入库 | current |
| D-026 | Q5（轮5）：#25 前置清单 25 行拍板范围裁定；例外 2（P5 方向现在拍）与 D-012 商业层条款的冲突处置？ | 采纳（2026-09-15，原话「采纳」＝(A)+绑定表+例外 1+例外 2 冲突处置走甲；基于 atomcode R5-Q5 深调研，报告 reports/R5-Q5-atomcode-research.md，resume 锚点 5ed818fd-2d60-46f8-8396-df6a278f2a6f） | 拍板范围 = (A) 最小拍板 + 2 行现在拍例外 + 全 25 行强制绑定「最迟拍板时点 + 触发事件」决策日志（绑定表见报告 §3，整理环节写入 25-rollout-checklist 拍板状态列）。① 本轮闭合：④组失实行 3 行（B2.2 e-branch-1 不存在 / B3.1 根 README 已闭合 / B5-4 origin 已配置）+ B5-1 栈序+push（R3 收口已按授权执行 8be9db5）——关闭动作走 Fowler superseded 语义三步：改状态不改内容 + 双向指针 + 一行失实理由，禁删除或静默划掉；② 例外 1：B1.1 现在拍（处置范围 = 14 份全量、分支命名沿用票 NN-slug 既有先例，W3/W4 sc/re 形态已示范）——它是 2a 校准的 ground-truth 输入、25 行中唯一晚拍阻塞下游开工项；③ 例外 2 = D-012 边界锐化：市场**方向判定**（Agent Plugins 生态 vs 通用市场 vs 兼摄）= 本仓阶段 3 前置一扇门项（publisher ID 创建后不可改 + 凭据/审核长铅垂期把 LRM 前移，方向层按 70% 置信规则先行）；**商业条款**（定价/开源协议/竞品对比）仍属仓外按 D-003 排除不变；凭据申请在阶段 3 开工门启动；④ P6/D2 禁止单方面提前拍：按 set-based design 登记候选判据集不收窄，阶段 2 双结题（2a diff 合入 + 2b 探针结题）数据收窄；⑤ 防退化兜底入规：每行触发事件后 1 个工作日内必须拍板；事件迟迟不来以「最迟拍板时点」为硬到期日、到期重组改绑一次、再到期升级用户——禁静默滞留（LRM 超期 = 决策由默认做出）。 | 全量拍 (B) 与部分纪律拍 (C) 被调研否决（可逆项提前拍产物被阶段 2 过时化、只制造重做）；未绑触发事件的推迟不成立（退化为债）；P5 方向拍板 ≠ 上架动作授权（上架/推送仍属用户闸门 per D-012 余款）；④组关闭不改写 #25 报告正文只更新状态列；D-012 除末句外全部条款继续有效、由 D-026 承继（登记先于锐化，#25 已将 P5 划入本仓闸门、D-016 阶段 3 明含分发收尾，本轮仅消除登记先后的条款歧义） | current |
| D-027 | Q6（轮5）：P5 市场方向本体选哪个？（D-026 例外 2 的实质拍板，一扇门） | 推荐 (1)（2026-09-15，用户选定「推荐 (1)」） | P5 市场方向 = **纯 Agent Plugins 生态**：主渠道 = Agent Plugins 1.0.0 标准下 marketplace.json 指向 GitHub 仓的自助上架形态 + Claude Code 原生 .claude-plugin 双 manifest 并行（均系 D-012 既定形态），内核 CLI 随仓分发（Source-first per D-021）；npm / VS Code/OpenVSX / JetBrains 等通用市场**现在不进入、不占位、不注册**——四壳能力（GitHub Action / 自用 CLI / 报告生成器）不因此作废，只是其分发渠道上架作为两扇门类追加决策挂到阶段 2 双结题之后按 D-026 绑定表另拍。 | 不注册任何通用市场 publisher 身份/命名空间（避免未核验细节下的一扇门固化）；上架动作本身仍属用户闸门（D-012 余款 + D-026：方向拍板 ≠ 上架授权）；若日后追加通用市场需先补该市场不可逆细节与铅垂期定向调研（R5-Q5 报告 §6 缺口 3 的闭合前置）；README 上游清单/状态列不得因本条虚报可安装（发布未发生，A-030 口径不变） | current |
| D-028 | Q7（轮5）：16-rendering-split 未合并分支如何处置？（R3 收口 backlog ①，收口时因 merge-base NOT-MERGED 依安全纪律保留） | (a) 复核后删除（2026-09-15，用户选定「(a) 复核后删除（推荐）」） | 实物证明：branch tip 与 main 上 16-* 四件 blob 逐字节一致（16-render-split-check.mjs=1d79f4b9 / 16-render-split.json=36305040 / 16-render-split.schema.json=f43fe7e4 / 16-report.md=3e65706e），两笔 A-016 commit（1fff488/81961c2）零 engine 触面、commit message 信息已在报告正文与收口记录保真——分支内容已被完整并入，仅 commit 对象与 ref 残留。处置 = 整理环节执行：① 亲跑 node 16-render-split-check.mjs 复核（预期 16/16 PASS exit 0，轻量断言无构建产物）；② 满足则 $but 删除 gb-local/16-rendering-split 残留引用（unapply/delete）；③ 四 blob 等价证明清单登记进本轮收口记录。 | 守卫复核 FAIL 即中止删除并升级呈报（证据链断裂不许按原计划动手）；删除动作限本分支（不波及其他 unapplied 项）；R3 收口当时的 NOT-MERGED→保留判定不追认为错误（当时只有 commit 层证据，内容层等价证明是本轮新增）；整理环节前不动手（grill 期间不动仓） | current |

### D-027 后续影响（开放跟踪）
- 联动：#25 清单 P5 行拍板状态更新（整理环节）= 「方向已拍：纯 Agent Plugins 生态（D-027）；凭据申请挂阶段 3 开工门」；根 README 快速验证段维持「源码自举」口径无需改（方向与现状一致）。
- 阶段 3 上架票届时范围收窄为：Agent Plugins 生态自助上架 + 双 manifest 提交物（P1 预核对 baseline 衔接）；通用市场渠道如需追加另立票。



### D-026 后续影响（开放跟踪）
- **整理环节执行清单**：① .scratch/architecture-recovery/reports/25-rollout-checklist.md 拍板状态列更新：B2.2/B3.1/B5-4/B5-1 → closed-superseded（各附一行失实/在案理由 + 双向指针）；B1.1 → decided-now（范围+命名已定）；其余行「待用户拍板」改「挂门：<最迟时点>｜触发：<事件>」；② 绑定表全 25 行入本账本决策日志区（报告 §3 转录）；③ 非 VS Code 市场不可逆细节（JetBrains/OpenVSX/npm-OSSRH）未核——若 P5 方向拍向通用市场需补一轮定向调研（报告 §6 缺口 3）。
- **调研者行数偏差如实登记**：R5-Q5 只见 20 具名行、按组规则套门；#25 原件 25 行含 B4.1（取代不立项维持）与 B1.3/B5-3（A-006 维持 deferred）——本仓按原件补挂已在报告 §3 完成，组规则无冲突。
- **backlog expiry 置信度注记**：触发-到期-升级三段机制属 ADR 状态机 + 社区惯例（Pereira 3-6 月保质期）拼装，无单一权威标准（报告 §6 缺口 2），中置信采用。
- **派生待决**：P5 方向本体（选哪个市场）= Q6，属实质选择非时机问题，单独下探。
- 出处：atomcode R5-Q5 深调研（第一轮 600s 超时→探测存活→轮询至自然退出→终稿未入索引→`-c` 续跑纯输出恢复一次成功，全程未杀进程未换题重开；searches 9 / full reads 6 / 五角度 / 三引擎；锚点 5ed818fd-2d60-46f8-8396-df6a278f2a6f）。



### D-025 后续影响（开放跟踪）
- **派生立票清单（to-tickets 阶段编号）**：T-A 阶段 1.5 量测审计票（14 份 ADR 人工真值表 + 逐份 delta 表模板，先于一切 v2 代码）；T-B 判据 v2 票（adr-structure detector 接线 A-002 回退链，验收 = 真值表一致率，冻结数据重跑出并列读数）；T-C ADR 治理卫生票（真实缺失清零，验收独立于 T-B）；三者完成后 C 层 disposition 补记（reopen 闭合）。既有阶段 2 票（2a/2b per D-023/D-024）排其后。
- **先例登记**：阶段 1.5 是本产品「量测效度先行」纪律的首个实例；工业锚 = FDA OOS / TheAuditor（FP 回流规则改进、源码零改动）/ Aker Build（dated measurement 不改写、双读数并列）/ Codacy Verity（dated rule 独立沉淀）。
- **CONTEXT.md 新词候选（grill 退出时评估）**：「勘误式双读数（Dual Reporting）」——方法修订前后读数并列披露、差值即量测误差量化，_Avoid_: 重测覆盖（暗示废除旧读数）、数据迁移；「可归因原因（assignable cause）」——OOS 术语，原读数得以记 invalid 的唯一凭证，_Avoid_: 误报原因（无留档语义）。
- **冲突核对结论（2026-09-15）**：零冲突零 revised——D-017（裁定由人做，本条只补 disposition 前置）/ D-018（阈值不动，只修构件解析，同构 A-023 v2 追加机制）/ D-023+D-024（阶段 1.5 为其前置插入项，方向一致）/ A-026（首报不撤回，双读数与 Receipt 锚定同构）均保持 current。
- 出处：atomcode R5-Q4 深调研（searches 13 / 三引擎 / full reads 6 / 五角度；Lakens 403 以摘要替代、CLSI 未取原文如实登记），首轮 5h 配额中断 → 等重置后 --resume 单变量续跑一次成功（W5 锚点纪律第三次闭合）。


> 防丢账本：本会话 grill 流程中所有被用户确认的实质性结论，每条当场落盘。
> 规则：grill 中不写源码、不改目标；本文件是唯一允许持续写入的项目文件（直到 grill 结束）。
> 进入下一题前必须确认账本已写到最新。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-001 | 在「宏观+微观工程内容审计」里，「宏观审计」和「微观审计」分别对应什么 scope？ | 都要包含，全都要，具体你看研究文件 | 产品必须同时覆盖 5 档 scale：Macro-A 跨仓战略 / Macro-B 仓库级 4 象限 / Macro-C 演化考古 / Micro-A PR diff / Micro-B file。5 档共享证据层（CodeLore+Scorecard）与裁决层（verdict-gate），差异在触发器与报告切片。 | 不做行级 lint（规矩非审计）；不做 PR 评论机器人形态（已明排 CodeRabbit）；不做 runtime observability（与内容审计无关） | current |

### D-001 后续影响（开放跟踪）
- 5 scale 落地后需在 rubric §7 增加"触发器切片"维度，避免 macro-B 评估套到 micro-A 上；
- Macro-A 自研战略 rubric 必须同时支持 5 scale 上下文（不能只评单仓）；
- CodeLore `diff --llm` 默认是 Micro-A 路径；`explain --llm` 默认是 Macro-B 路径——两者不能混用；
- verdict-gate 在 Micro-A 与 Macro-B 都必须工作，但触发器不同（前者 push hook，后者手动/周期）。

| D-002 | MVP 范围 — 先做哪一档 scale？ | 你先不要管先做哪个，把一共这个仓库的本质就是要做哪些：全部都先规划好所有完整的内容 | 本仓库 = 完整规划（spec-level）产物。5 scale（Macro-A / Macro-B / Macro-C / Micro-A / Micro-B）必须在 spec 层同时落地：rubric 全列、架构蓝图全画、跨 scale 集成全映射、报告模板全出。执行阶段的实现优先级排序属于本仓库外的事，不在 grill 范围。 | 禁止"先做 X、Y/Z 之后再说"的 MVP 切片；禁止在 spec 阶段把任意 scale 标"v2 再做"；禁止把跨 scale 集成推到"以后再说" | revised |

### D-002 后续影响（开放跟踪）
- Q3 必须重设：原"目标用户 / 战略 rubric / 与自有项目关系 / 商业形态"四题保留，但 MVP 切片已无意义，"实现优先级"类问题从 todo 中移除；
- rubric 不能仅聚焦单 scale：4 象限（结构/行为/供应链/战略）必须全 scale 覆盖，战略象限的维度清单是 D-002 下最高优先级缺口；
- 跨 scale 集成（数据流 / 报告聚合 / 冲突解决 / 裁决协议共享）必须作为独立规划维度，不允许分散在各 scale 章节里各说各话；
- 演示场景必须覆盖全部 5 scale，禁止"演示只演 Macro-B、Micro-A 之后再接"；
- ADR 候选：D-002 本身满足 ADR 三判据（hard to reverse / surprising without context / real trade-off）—— 等 grill 退出时写为 ADR-0001 "规划范围=5 scale 全 spec、不做 MVP 切片"。

| D-003 | 「全部都先规划好所有完整的内容」的边界 = ? | （用户未答，按 grill 推荐选项落地） | 本仓库完整规划边界 = 产品本体（规格层 / 架构层 / 集成层）+ 使用方法（演示层）。商业层（开源协议/商业模式/竞品定价）明确排除——本仓库是 spec 级规划，不是商业 BP。商业问题在本仓库外另起讨论。 | 禁止在 spec 阶段引入商业模式；禁止"演示只演 Macro-B、Micro-A 之后再接"；规格/架构/集成/演示 四层不允许缺层落地 | current |

### D-003 后续影响（开放跟踪）
- 集成层（跨 scale 数据流 + 裁决协议共享 + 报告聚合 + 冲突解决）作为独立章节写，不分散到 5 scale 各章；
- 演示层（5 scale 用户旅程 + 触发器时序 + 失败语义 + 降级路径）必须全部 5 scale 覆盖；
- 商业问题（开源协议 / 商业模式 / 竞品定价）一律"另起炉灶"，本仓库不接；
- 术语表需补充：触发器时序 / 失败语义 / 降级路径 / 报告聚合 / 冲突解决；
- ADR 候选：与 D-002 同类，grill 退出时合并写为 ADR-0001/0002。

| D-004 | approve atomcode 推荐的 5 维战略 quadrant 吗？ | approve 5 维，S5 改名"所有权边界匹配"（推荐） | 战略 quadrant 装 5 维，每维全 5 scale 覆盖：S1 定位收敛（吸收 #1 定位收敛 + #2 范围蔓延）｜S2 ADR 质量（吸收 #4 ADR + #5 决策可逆性合并）｜S3 门面预算 vs 结构预算（吸收 #3 + #9 抽象成熟度）｜S4 演化方向（吸收 #8 演化 + #10 空位与负向声明）｜S5 所有权边界匹配（原"团队拓扑匹配"改名，吸收 #6，避开 D-003 边界争议）。#7 承诺密度工业界无独立心智模型，降为 S3/S4 过程证据。 | 单人仓 S5 必须降权并在报告显式标注"信号不足"；5 dim 全部禁止仅服务于单一 scale；阈值（黄/红）声明为初版参数、预留校准机制（不锁死） | current |

### D-004 后续影响（开放跟踪）
- ADR 候选：D-004 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时写为 ADR-0002「战略 quadrant = 5 维 S1-S5（基于 atomcode 调研）」；
- S1 判据中"定位关键词覆盖率 < 70%"为启发式阈值，需在 spec 中标注"试点校准"——不可直接当 hard rule；
- S2 判据中"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）占比 > 20% 判红"——此条依赖 git blame 与 ADR 头时间戳，需先确认目标仓库是否所有 ADR 都带 YAML 时间戳头；
- S4 判据中"ADR 假设提取"目前 InfoQ 给的是理念清单，无可复用工具；spec 应声明 LLM 辅助抽取 + 人工复核回路；
- 5 维 × 5 scale = 25 个采集单元，每单元都需要证据采集法 + 数据源 + 阈值——这是 D-004 的下游 spec 任务；
- 6 项信息缺口（承诺密度文献空缺 / S1 语义度量 / S5 单人仓判据 / S4 ADR 假设提取 / 阈值跨仓校准 / 未覆盖视角）落进 ledger 信息缺口段，grill 退出前可一并扫一遍；
- 商业层概念（PMI 统计、Conway 三响应、Arcalea 战略漂移）仅作心智模型参照，未进入判据数据源——守住 D-003 边界。

| D-005 | 跨 scale 集成架构 shape = ? | approve C+A 合成（推荐） | 集成架构 = 「中心事实辐射 + 联邦裁决治理」（Hub-of-Facts with Federated Adjudication）：数据底座采 C（共享 DuckDB fact table）+ 治理协议采 A（定义集中、执行分散）。4 子决策：①数据流 = 事件单向写入 + 按需拉取投影；②报告聚合 = 独立语义层（read model），不做 UI 抓取；③冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计；④裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑（裁决/契约/路由）不经过数据面。 | 5 scale 平权通过"事实层平等 + 协议层统一"实现，不通过拓扑对称；hub 是产品级组件不归任何单一 scale；冲突必须可见可审计（保留全量输出分布）；裁决 hub 不经过数据面（控制面集中、数据面直连） | current |

### D-005 后续影响（开放跟踪）
- ADR 候选：D-005 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-002/D-005 写为 ADR-0001「规划范围=5 scale 全 spec、不做 MVP 切片 + 集成架构=Hub-of-Facts with Federated Adjudication」；
- DuckDB fact table 是产品级 SSOT，但底层证据源（CodeLore + Scorecard + repomix + git history）写入顺序与版本控制必须明文规定——单写多读还是多写多读待 spec 阶段定；
- 事件单向写入（event sourcing 心智）= 报告可重放，但要求 fact table 写入路径只追加不可改；spec 阶段需明确 Schema 版本演进规则（AsyncAPI 事件契约心智）；
- 独立语义层（read model）= 各 scale 投影可独立优化，但增加存储与一致性维护成本——spec 阶段需明确 read model 失效策略（陈旧读 vs 实时读）；
- 冲突"可见可审计"= 保留各 scale 全量输出分布，不只最终选中项——下游失败时能重建裁决过程，否则调试成本 3-5 倍；
- OpenTelemetry Baggage 跨信号传递上下文——5 scale 分析同一 commit/PR 时用共享 span context/baggage 关联；spec 阶段引入 trace_id/baggage_id 作为 cross-scale correlation key；
- 数据契约（schema/版本）是裁决协议落地的前提——5 scale 共用 DuckDB fact table 的 schema 治理属于集成层 spec 任务，不可分散到各 scale；
- 7 项信息缺口（atomiccode §7 列出）落进 ledger 信息缺口段，grill 退出前扫一遍。

| D-006 | 5 scale 报告模板形态 = ? | C. 共享骨架 + scale 切片（推荐） | 报告模板 = 共享骨架（章节顺序：执行摘要 → 4 象限/裁决 → 证据 → 行动建议）+ scale-specific 切片。骨架在集成层共享（fact table 投影），scale-specific 切片在各 scale 独立投影。与 D-005 read model 心智一致——事实层平等 + 表达层统一骨架、scale 差异在切片层。 | 骨架设计必须兼顾 5 scale（最大公约数）；scale-specific 切片禁止跨 scale 引用（避免互依赖）；证据章节必含 grounded ✓/⚠ 引文校验盖章；行动建议章节必含 verdict-gate 印记（裁决可追溯）；模板不锁定具体措辞、只锁定章节顺序与必备字段 | current |

### D-006 后续影响（开放跟踪）
- ADR 候选：D-006 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并写为 ADR-0003「报告模板 = 共享骨架 + scale 切片」；
- 共享骨架的"最大公约数"设计需要在 5 scale × 4 象限（结构/行为/供应链/战略）矩阵上找交集——这是 D-006 下 spec 阶段的具体设计任务；
- scale 切片差异最大的应是 Macro-A（跨仓战略对齐叙事）与 Micro-A（PR 行级评审）——前者宏观叙事、后者行级带引文，共享骨架必须都能容纳；
- 行动建议章节须与 D-005 裁决协议对齐——只有通过 verdict-gate 的建议才进报告，否则标 ⚠ unverified；
- 模板渲染层属于产品演示范畴（D-003 演示层），不属于规格层——spec 锁定模板结构与字段、demo 锁定渲染样式；
- grounded ✓/⚠ 引文校验盖章机制可借鉴 CodeLore narrative stamping（research §5.2）作为 Micro-A 行级章节的实证模板。

| D-007 | 演示场景设计方法 = ? | B. 关键路径 + 失败路径（推荐） | 演示场景 = 每 scale 一条关键路径（happy path）+ 一条失败路径（failure path），共 10 条路径（5 scale × 2）。每条路径四要素：触发条件 / 步骤序列 / 成功/失败语义 / 报告产物。失败路径与 D-002 失败语义要求直接对接（显式降级而非沉默失败）。10 路径共用 D-005 Hub-of-Facts 但每 scale 自运行时执行——与集成架构一致。 | 5 scale 全覆盖（禁止"演示只演 Macro-B、Micro-A 之后再接"）；10 路径必须各自独立可演；失败路径必须显式标注降级而非崩溃；每条路径最终产物必须可演示（报告渲染出来）；10 路径产物格式须与 D-006 共享骨架对齐 | current |

### D-007 后续影响（开放跟踪）
- ADR 候选：D-007 满足三判据（hard to reverse / surprising without context / real trade-off），grill 退出时合并 D-006/D-007 写为 ADR-0004「报告模板=共享骨架+scale 切片 / 演示=10 路径（5 scale × 2）」；
- 10 路径中"失败路径"是 D-007 关键创新点——把失败语义强制嵌入演示，避免产品发布后才补失败处理；spec 阶段需为每个失败路径明文规定：触发条件、降级模式、报告产物形态、是否触发 verdict-gate；
- "happy path 与 failure path 共享报告模板"——D-006 共享骨架在两条路径下都必须能容纳，failure path 的报告产物不可与 happy path 形态分离（否则用户无法对比）；
- 10 路径与 D-001 5 scale 的对应关系在 spec 阶段需逐一敲定：每 scale 触发什么典型场景（例 Macro-A=多仓战略对齐评审、Micro-A=PR 行级评审），happy path 验证 scale 本身正常、failure path 验证 scale 的降级与裁决可追溯性；
- 10 路径演示的成本/价值权衡——10 条独立可演路径维护成本不低，spec 阶段需评估是否全部要"真可点"演示或部分只需"文档可读"；
- grill 退出后，转入 spec 阶段：rubric S1-S5 全文 / 25 采集单元（5 dim × 5 scale）/ 集成层 schema / 报告模板最大公约数 / 10 演示路径——D-004~D-006 信息缺口段共 16 项需 spec 阶段扫。


## Grill 退出记录（2026-09-11）

- 决策条数：D-001 ~ D-007 共 7 条全部 current，无 stale/revised/deferred；
- ADR 落地：7 条 ADR 已写入 docs/adr/ 目录（ADR-0001 ~ ADR-0007），每条满足 ADR 三判据；
- spec 阶段任务：spec-phase-tasks.md 含 18 项信息缺口，按依赖关系组织；
- CONTEXT.md 38 术语 + 38 `_Avoid_` 已落表，intro 段已更新；
- 与 baseline 对齐：D-001 ~ D-007 与 memory+research 五轮调研 baseline 无冲突，2 次 atomcode-research 调研已分别验证；
- 8 项 grill 硬要求（决策账本 / 不写源码 / 不换目标 / 一题一答 / 防丢账本 / 退出前自评 / 不自宣结束 / 必须问是否可以定稿）全部满足。
## 覆盖率自评（退出 grill 前必填）
- 已覆盖：术语表 17 词 + D-001/D-002/D-003/D-004 共 4 条决策 + 战略 quadrant 5 维 S1-S5
- 未覆盖 / 仍开放：见上文「仍开放」清单
- 信息缺口：6 项 D-004 标注项已记入，spec 阶段扫一遍

**当前进度（动态）**：7 / 7 条决策落地，覆盖率 100%（决策层）；规格层（D-004 S1-S5 rubric 全文 / D-006 共享骨架 / D-007 10 路径明细）尚未展开，spec 阶段执行。18 项信息缺口已记入。

## 信息缺口与下一题方向

**已封口**：
- D-001 ✅ 5 scale scope 边界（Macro-A/B/C + Micro-A/B）
- D-002 ✅ MVP 切片被拒，要求 spec-level 完整规划
- D-003 ✅ 规划边界 = 产品本体（规格/架构/集成）+ 使用方法（演示）
- D-004 ✅ 战略 quadrant = 5 维 S1-S5（S5 改名"所有权边界匹配"）
- D-005 ✅ 集成架构 = Hub-of-Facts with Federated Adjudication（C+A 合成）
- D-006 ✅ 报告模板 = 共享骨架 + scale 切片
- D-007 ✅ 演示场景 = 10 路径（5 scale × 关键+失败）

**D-004 信息缺口（不阻塞 grill，进 spec 时扫一遍）**：
1. #7 承诺密度工业界无独立心智模型，已降为 S3/S4 过程证据——若 spec 需独立维度则自建判据（无外部锚）
2. S1 定位收敛的语义度量（embedding/关键词法）无行业标准工具，70% 阈值为启发式
3. S5 在单人/小团队仓库的判据效力——Conway 默认团队规模 ≥ 12 人，小仓库需降权
4. S4 的 ADR 假设提取自动化——InfoQ 仅为理念文，需 LLM 抽取+人工复核回路
5. 阈值跨仓校准——所有黄/红线目前由工业界统计 + 本地三项目锚点推导，未大样本验证
6. 未覆盖视角：AI-agent 生成代码对 ADR 质量的冲击（bool.dev AP8 只点到"别让 AI 替你做权衡"）

**D-005 信息缺口（atomcode §7，spec 阶段扫一遍）**：
7. fact table 单写多读 vs 多写多读——不同 scale 写入证据时的并发与版本控制策略
8. Schema 版本演进规则——D-005 事件单向写入要求 schema 不可改，演进路径需明文（AsyncAPI 事件契约心智）
9. read model 失效策略——陈旧读（事件已写、投影未更新）的容忍度与触发条件
10. cross-scale correlation key——OpenTelemetry Baggage 实际落地需引入 trace_id/baggage_id 字段，schema 设计前置
11. LangGraph supervisor 适配——5 scale 协调层是否直接用 supervisor（参考 10 号信源）还是自研 hub
12. data mesh 失败模式对 C 方案的逆推——A 的失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）需提前设计防线
13. 工具对齐状态——metrics layer / OpenTelemetry baggage / AsyncAPI 等参考实现成熟度与本仓库语言栈的契合度（TS vs Rust vs Python）

**D-006 信息缺口（spec 阶段扫一遍）**：
14. 共享骨架的"最大公约数"具体设计——5 scale × 4 象限矩阵上的交集字段清单
15. scale 切片差异的具体边界——尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界
16. 渲染样式与模板结构的切分——spec 锁定结构、demo 锁定样式（避免 spec 越界到 UI）

**D-007 信息缺口（spec 阶段扫一遍）**：
17. 10 路径中"可点演示"vs"文档可读"的成本/价值权衡
18. failure path 的 verdict-gate 触发条件与报告产物形态——每个失败路径都需明文规定

**grill 退出候选清单**：
- 决策层：D-001 ~ D-007 共 7 条已封口
- 规格层：D-004 S1-S5 rubric 判据全文 / D-006 共享骨架最大公约数 / D-007 10 路径明细 尚未展开
- 信息缺口：18 项散落 ledger，spec 阶段扫

**退出前必走**：报账本条目数 + 覆盖率自评 → 问"是否可以定稿"
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿
- Q6：5 scale 的报告模板形态
- Q7：演示场景覆盖 5 scale 的用户旅程
- 退出 grill：覆盖自评 + 是否定稿



---

## 第二轮 Grill（2026-09-12）— 方向：补完产品定义

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-008 | 「进一步建设」的主干方向是哪个？（A 补完产品定义 / B 走向工程实现 / C 清理 BACKLOG / D 自有资产对接） | A | 本轮 grill 主干 = 补完产品定义：目标用户 × 使用场景 × 与外部世界接口（谁来用、何时用、用完拿走什么）。本仓继续扮演 spec-level 规划仓角色，不修订 ADR-0002（no MVP slice）与 ADR-0003（商业层排除）。 | 本轮不做工程实现选型（B 挂起）；不清理 BACKLOG 卫生票 B1/B2/B3（C 挂起）；不定义 jiahao/anysearch-cli/env-manager 对接关系（D 挂起）——三者待产品定义补完后统一重估 | revised |

### D-008 后续影响（开放跟踪）
- 本轮设计树顺序：目标用户 → 使用场景 → 外部接口；目标用户定义必须能反向解释「为什么需要 5 scale 全量」——为 ADR-0001 补上用户面佐证；
- B 方向（工程实现）若日后启动，须显式修订 ADR-0002 或另起工程仓（BACKLOG B4.1 已预告此岔口）；
- C 方向 BACKLOG B1.1/B1.2/B1.3、B2.x、B3.x 继续挂起，立票决策推迟到本轮 grill 退出后；
- D 方向（自有资产对接）在本轮只允许以「目标用户之一是否是自己」的形式出现，不进入集成细节。
| D-009 | 目标用户：这个产品做给谁？（A 技术决策者 / B 工程团队 / C agent 生态开发者 / D 自用优先） | A-D全都用 | 目标用户 = 四类全集，无排除：A 技术决策者（CTO/架构师/尽调人）＋ B 工程团队（TL/平台组/质量负责人）＋ C agent 生态开发者（claude code/codex 用户，装 plugin 进 agent 工作流）＋ D 自用（本人 + jiahao/anysearch-cli/env-manager 三自有仓）。 | 禁止收窄为单一用户类；不做时序切片与用户间优先级排序（与 D-002 拒绝 MVP 切片同风格）；「四类各自何时开始被真实服务」属实现排期，不在本轮 | current |

### D-009 后续影响（开放跟踪）
- 四类用户的「使用时刻」不同质（尽调一次性触发 vs 团队 CI 周期门禁 vs agent 工作流内嵌 vs 手动自评）——使用场景题必须按并集组织，场景清单 ≥ 4 组，禁止压成单一旅程；
- 四类用户对交付形态拉动不同：A 要叙事报告可读性（面向非作者）/ B 要 CI 门禁可靠性与低误报 / C 要 plugin 分发与 MCP 接口稳定 / D 要本地可复现——外部接口题列并集而非公约数；
- D（自用）仍是唯一能提供即时真实反馈回路的用户类——战略 rubric 判据调优以 D 为校准锚，但 D 不再是「唯一首要用户」；
- 与 ADR-0002 兼容性：四类全集是 spec-level 声明，实现优先级排序仍属仓外，不冲突；与 D-008「B 方向挂起」一致。
| D-010 | 使用场景的组织方式？（A 用户×时刻并集 / B 统一评审事件 / C 触发器优先矩阵） | A，刚好我们选中一个最佳适合大众默认模式，有需要其他模式自己设置配置就行了 | 使用场景 = 用户 × 时刻并集组织（四类用户各列场景清单，允许重叠，不强制统一旅程）；叠加默认模式规则：四类用户×时刻组合中选定**一个**「最适合大众」的组合作为产品默认形态（开箱即走的路径），其余场景/模式全部通过配置切换到达（opt-in）。 | 默认模式必须单一（不许多默认并存）；非默认模式必须配置可达，禁止把非默认场景降为二等或砍掉；默认模式的具体选定（哪类用户×哪个时刻）是 spec 必须明文写出的独立决策（见 Q4）；场景并集完整保留，默认化只改变开箱姿态不删减覆盖 | current |

### D-010 后续影响（开放跟踪）
- Q4 = 默认模式选定（哪类用户 × 哪个时刻 × 哪个 scale 组合为开箱形态）；
- 「默认 + 配置切换」隐含一个模式枚举与配置项：spec 层需定义模式枚举（mode）、取值集合、默认值——这进入外部接口题的输入面；
- 场景清单仍按并集全列；触发器类型（手动/周期/事件 hook/agent 调用）作为每条场景的属性标注，C 方案 20 单元矩阵可作 spec 阶段索引视图自动生成；
- 校验点：默认模式必须与分发渠道形态一致（Agent Plugin marketplace 为分发主渠道 per research §7.4）——默认体验若需要 CI/hook 配置才能跑通，则与一键安装渠道自相矛盾。
| D-011 | 默认模式选定：哪类用户 × 哪个时刻 × 哪个 scale 为开箱路径？（A C-agent×工作流内嵌×Macro-B / B 团队×CI×Micro-A / C 自用×手动×Macro-B / D 尽调×一次性×Macro-B/C） | A | 默认模式 = C 类用户（agent 生态开发者）在 agent 工作流内嵌时刻触发的 Macro-B 仓库级四象限评审：装完 plugin 后「说一句评审这个仓库」即可拿到四象限叙事报告，开箱路径零配置（不需要 CI / hook / 团队准备）。 | 默认模式单一且必须与分发渠道同形（marketplace 一键装 → 零配置首跑）；Micro-A CI 门禁 / 尽调一次性 / 自用手动触评全部降级为配置可达模式、不做默认；D（自用三仓）保留为 rubric 校准锚但与默认体验解耦；默认模式只声明开箱路径，不禁用或删减其余场景（D-010 场景并集完整保留） | current |

### D-011 后续影响（开放跟踪）
- 默认模式锁定后，分发形态必须与默认体验同形（Agent Plugin 五层盒子 per research §7.4）——该项研究结论从未进过决策账本，Q5 询问是否封口；
- 术语候选：Default Mode（默认模式）将成为 CONTEXT.md 新词，待 grill 退出时随本轮术语批量更新；
- spec 任务预告：模式枚举（mode 配置项）取值集合 + 默认值 + 配置切换面，需在 spec 阶段展开为外部接口输入面的一部分；
- 风险登记：默认体验绑死「agent 会话内发起」——若某分发宿主不支持 plugin 形态，该宿主上默认模式不可达（宿主支持矩阵属实现期调研，spec 层只声明前提）。
| D-012 | 分发/交付形态：A Agent Plugin 五层盒子 / B 纯 skill 包 / C 独立完整 CLI / D SaaS？ | 接受（atomcode 调研推荐 A 附三修正，呈报后批准） | 分发形态 = Agent Plugin 五层盒子（Agent Plugins 1.0.0 标准）：plugin.json + skills/ 方法论壳（SKILL.md + 战略 rubric references）+ mcp.json（kernel MCP 只读证据查询面，stdio 指向 DuckDB 事实表）+ 反向域名扩展目录（hooks 触发/呈现面）+ 随分发核心确定性 CLI（编排证据管线 + 联邦裁决 + 产出报告；同一二进制四外壳：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。三修正：①双 manifest——标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json 并行发布，构建脚本从单一元数据源生成防漂移（Anthropic 不在 Agent Plugins TSC 名单，Claude Code 对标准仅部分兼容，issue #88906）；②hooks 只做触发/呈现（PostToolUse/Stop 呈现 receipt、注入证据就绪上下文），裁决一律环境外执行（内核 CLI / CI gate），hooks 永不作裁决执行点（190 项 hook 失效 + issue #21460 + SoundGate 三源实证）；③skill 壳只读隔离——rubric 与证据读取放壳内，判定/写库/出报告只能内核 CLI 执行，skill 仅允许调只读 MCP 查询面（Skill-Inject 实证注入攻击 80% 成功率）；随分发附 provenance 纪律（license + CHANGELOG + 签名收据）。 | 「零配置」精确语义 = 一次 install 命令 + 首次 MCP 工具授权（非零交互）——D-011 保持 current，本条承载其精确化；禁止把裁决逻辑放进 hook；禁止 skill 壳持有写权限或执行管线；禁止只发单 manifest（Claude Code 默认用户群会丢失）；SaaS 形态继续排除（D-003）；插件市场上架选择属商业层，按 D-003 另行决策 | revised（2026-09-15 仅末句「插件市场上架选择属商业层按 D-003 另行决策」被 D-026 边界锐化；五层盒子/双 manifest/hooks 只触发不裁决/skill 壳只读隔离/provenance 纪律及其余全部条款仍有效，由 D-026 承继） |

### D-012 后续影响（开放跟踪）
- ADR 候选：D-012 满足三判据（难反转——工程围绕盒子形态展开；无上下文会困惑——为什么不是纯 CLI/纯 skill；真实取舍——四候选显式对比），grill 退出时写 ADR-0008「分发形态 = Agent Plugin 五层盒子（双 manifest）」；
- spec 任务预告：plugin.json / mcp.json 字段契约、mode 枚举与默认值、内核 CLI 四外壳命令面、receipt 协议字段、provenance manifest 内容清单；
- CONTEXT.md 新词候选：Agent Plugin / Default Mode（默认模式）/ Receipt（裁决回执）——退出时统一评估是否入表；
- 调研证据快照：三引擎 10 查询、13 次原文抓取、8 域名、关键结论均 ≥2 独立信源；检索标签 atomcode-q5-delivery-form 可复现（ctx_search source 过滤）。

### D-012 信息缺口（spec 阶段扫）
1. Agent Plugins 1.1.0 working draft 未细读——若 hooks 标准化，扩展目录策略需复评；
2. 国内 agent 生态（Qwen/Kimi 等）对 Agent Plugins / Agent Skills 标准支持度未知——若 C 类用户含国内开发者需补调研；
3. MCP 2026-07-28 大修订细节（stateless remote transport / deprecate Sampling）仅单源——kernel MCP 若走 streamable-http 需重读规范正文；
4. Skill-Inject 论文（arXiv 2602.20156）仅摘要级——威胁模型细化需读全文；
5. Claude Code 完整兼容 Agent Plugins 1.0.0 时间表未官宣——跟踪 issue #88906，落地后原生壳可退役为纯扩展目录。
| D-013 | 目标仓输入面：A 仅本地路径 / B 本地路径默认+远程 URL 配置可达 / C 远程托管拉取？ | 接受（atomcode 调研推荐 B 附五细则，呈报后批准） | 输入面 = 本地路径为默认 + 远程 URL 配置可达。输入裁决顺序：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https/git@）才 clone 到本地隔离缓存，此后全部走同一本地管线（URL 在输入面之后不复存在）。五细则：①凭据复用——clone 用本地 git 凭据链（SSH agent / credential helper / PAT 即用即清），不新建凭据存储；②不可信输入纪律——隔离缓存目录、禁远程配置执行（默认不信任被审仓的 hooks/config）、不写回用户工作区、评审后可清理；③远程一律全深度 clone（fetch-depth 0）+ 校验 .git 完整性，浅 clone 显式拒绝——这是「面向 git 记录健全的项目」的输入面落地；④入口收敛——clone 只走随分发 CLI（repo add）与配置文件，不暴露为 kernel MCP 工具，MCP 保持严格只读查询面（GitHub Copilot code review MCP 强制 readOnlyHint 的同构口径）；⑤授权清单含「远程 clone + 网络 + 本地 git 凭据使用」为一个授权事件（细化 D-011/D-012 的授权语义）。 | 禁止远程托管式拉取（等同 SaaS 输入形态，违反 D-003 商业层排除）；禁止把 clone 暴露为 MCP 工具；禁止新建凭据存储体系；浅 clone 输入必须拒绝并提示（git 记录不健全的仓不属本产品的承诺面）；D-011 / D-012 保持 current，本条承载其授权清单与只读边界的精确化，无 D 被推翻 | current |

### D-013 后续影响（开放跟踪）
- ADR 候选：输入面裁决满足三判据（难反转——输入契约定后全部管线围绕本地路径假设；会困惑——为什么不做远程托管；真实取舍——A/B/C 三案对比），grill 退出时写 ADR-0009「输入面 = 本地路径默认 + 远程 URL 配置可达（五细则）」；
- spec 任务预告：repo add 命令面、clone 缓存目录布局、消歧规则实现、授权事件清单字段、快照 zip 输入（尽调场景，视同本地路径）的等价地位声明；
- 调研证据：工业界事实标准 = 本地 checkout 后扫描（SonarQube 强制 full clone / Semgrep CI checkout→scan / TruffleHog clone-to-tmp）；B 的成熟原型 = repomix --remote / gitingest URL / TruffleHog 临时目录范式；C 形态实证 = GitHub App 托管拉取（CodeRabbit/Greptile），与 D-003 冲突被排除；检索标签 atomcode-q6-input-surface 可复现。

### D-013 信息缺口（spec 阶段扫）
1. git bundle 专门文档未读——尽调快照打包传输场景待 spec 评估是否支持为输入形态；
2. 超大仓 / monorepo 规模策略未展开——clone 体量上限与超时阈值 spec 待定；
3. Agent Plugins 规范整页未抓取（本轮只读 Google 博客与 issue）——发布前需通读正文；
4. 尽调社区一手正文（r/startups 帖）被拦未读——尽调输入面结论对应子项置信度为中。


---

## 第三轮（2026-09-12）— R2-Q7 调研呈报：spec 与工程实现边界（A+B 组合）

> 触发：子 Agent 验收标准（编译/打包/启动测活/每平台 test 闭环）预设了可构建的软件交付物，与 ADR-0002「spec-level 规划、实现属仓外」边界冲突；用户倾向 A+B 组合。
> 调研：atomcode 深度调研（检索标签 R2-Q7-engineering-boundary），报告 .scratch/macro-audit/reports/R2-Q7-atomcode-research.md。
> 冲突协议执行：D-002、D-008 已标 revised（原记录保留）；D-014 曾于 2026-09-12 经用户批准 → current，后经用户更正架构 → revised（由 D-015 承载；ADR-0010 → ADR-0011）。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-014 | A+B 组合（完成 R2 spec 契约 + 进入工程实现）如何落地？ | 用户：「我偏向A+B的组合」（未拍板，待调研呈报后裁定）；atomcode R2-Q7 调研推荐：supersede ADR-0002（新 ADR-0010）+ 另起工程仓 + R2-01~05 先封口 + 工程仓 walking skeleton 验收。 | ① 写新 ADR supersede ADR-0002，确立「spec 仓角色正式化 + 工程实现迁移至独立工程仓」；② 另起工程仓承接实现（polyrepo 判据：几乎不共享代码 / spec 与实现变更节奏不同 / CI 与访问控制需隔离）；③ R2-01~05 先封口（尤其 R2-04 Agent Plugin 契约群 = 工程实现的对象），再启工程；④ 工程仓验收 = walking skeleton + smoke→sanity→regression 分层 + CI matrix（Windows/macOS/Linux × 运行时）+ liveness probe。 | 禁止 in-place 改 ADR-0002（ADR 不可变，只能 supersede；Fowler+AWS 双源）；禁止把工程实现源码落进本 spec 仓；本期验收止于「可构建/可打包/可测活/可签名」，上架/分发仍归仓外（D-003 不变）；双 manifest 单一元数据源生成无直接先例，须显式标注为自研范围。 | revised（2026-09-12 用户更正架构；由 D-015 承载） |

### D-014 后续影响（开放跟踪）
- 冲突清单（报告 §4）：C1=D-002/ADR-0002；C2=D-008（最关键，须裁定是否激活 B4.1 岔口）；C3=R2 时序；C4=D-003 商业边界；C5=D-012 五层盒子（无实质冲突）。
- 用户拍板后动作：若批准，写 ADR-0010（supersede ADR-0002）+ 建工程仓 + 按 R2-01~05 顺序封口 spec；若不批准，回退 D-002/D-008 为 current 并记录否决理由。
- 调研信息缺口 8 项（报告 §6）：Agent Plugins 规范全文未通读、1.1.0 draft、DuckDB Node 双线选型、SEA/Bun+原生模块组合、双 manifest 生成无先例、spec↔工程仓契约衔接机制、MCP 2026-07-28 修订、国内 agent 生态支持度。
- 证据：atomcode R2-Q7 报告（11 次原文 / 10+ 域名 / 三引擎交叉验证）。
- （2026-09-12 追记）D-014 后经用户更正架构 → revised；「另起工程仓」被 D-015 / ADR-0011 取代。


---

## 第四轮（2026-09-12）— 架构更正：单仓 + 子目录 + but 分支

> 触发：用户 2026-09-12 更正——「将 6F-impl 合并到 6F；分开是错误的；正确架构 = 6F 为默认项目文件夹、其余内容在子目录、but 管理不同分支（非独立仓 / 工作树）」。
> 处置：D-014 标 revised（其「另起工程仓」被更正）；新记 D-015；ADR-0011 supersede ADR-0010。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-015 | 工程实现的仓形态？（单仓+子目录 vs 另起工程仓） | 用户：「将 6F-impl 合并到 6F 中，分开是错误的，正确的架构是 6F 为默认项目文件夹，其余内容在子目录，同时 but 管理不同分支，而不是隔离以工作树」 | 单仓：D:/Aworker/6F 为唯一 git 仓；实现内容入子目录 6F/engine/；并行隔离用 but 分支（非独立仓 / 非 git worktree）；6F-impl 已删除并迁入。 | 禁止另起独立工程仓；禁止用 git worktree 隔离；禁止把实现散落在仓根（必须子目录）；ADR-0010「另起工程仓」被 supersede。 | current |

### D-015 后续影响（开放跟踪）
- ADR-0011（supersede ADR-0010）已落盘 docs/adr/0011-single-repo-subdir-but-branches.md；ADR-0010 标 superseded。
- 工程内容新路径：6F/engine/（迁后 build/smoke 6/6 PASS）；6F-impl 已删除。
- 后续 VCS 均在 6F 单仓的 but 分支上操作；CI path filter 限于 engine/**。

## 第五轮（2026-09-12）— grill 轮 3：进一步建设主干方向

> 触发：轮 3 Q1（A 工程纵深 / B spec 深化 / C 端到端价值验证闭环 / D 分发生态）经用户指示提交 atomcode 深调研；调研无冲突 current 决策；用户拍板接受呈报。

| ID | 原问题 | 确认回答原文 | 规范化需求 | 显式约束 / 负向需求 | 状态 |
|---|---|---|---|---|---|
| D-016 | 轮 3「进一步建设」的主干方向选哪个？ | 接受（对呈报 D-016 草拟记录；该草拟基于 atomcode R3-Q1 深调研，五类心智模型交叉一致） | 主干 = C 端到端价值验证闭环，串行四阶段：阶段 0 = push + CI 实跑 + DuckDB fact table schema v0（事件只追加 + cross-scale correlation key）+ 确定性采集器（git log / ADR 结构扫描）；阶段 1 = Macro-B 单仓 happy path 于 6F 自身，S2 ADR 质量 + S1 定位收敛起手，跑通 采集→fact→叙事→裁决→报告，产出第一份带引文 + 裁决回执（Receipt）的真报告，同路径顺带覆盖一条失败路径（降级 + ⚠ unverified）；阶段 2 = 用实测锚回流清扫 16 项信息缺口；阶段 3 = A 铺开其余采集器/scale + D 上架收尾。 | 阶段 0~3 必须串行（唯一可并行 = 阶段 0 内 CI 实跑）；禁止 C 与完整 A 并行（稀释「最薄」）；禁止 B 与 C 并行（desk 校准 vs 实测锚双源冲突）；第一采集器为确定性采集、不接 LLM；真报告载体 =「报告生成器」CLI 外壳（五层盒子既有壳，不引入新分发形态）；顺手更正 spec-phase-tasks.md 残留失效句（「R2 全部完成前不启动工程实现」随 ADR-0002 supersede 链失效） | current |

### D-016 后续影响（开放跟踪）
- 性质声明：本决策是**实现级 tracer bullet**，不是产品级 MVP 切片——5 scale 规格完整度不变（与 revised D-002 / ADR-0002→0010→0011 supersede 链不冲突，atomcode 已逐条核对 11 条封口决策无静默改向）。
- 与 D-005 对接：fact table schema v0 是 HoF-FA 首次真实落地，schema 必须含 correlation key 字段（衔接缺口 #10；事件只追加、版本化演进规则沿用 D-005/CONTEXT 既定语义）。
- 与 D-007 对接：阶段 1 一举落地 10 演示路径中的 Macro-B happy path + 一条 failure path；其余 8 条顺延。
- 与 D-012 对接：真报告走「报告生成器」外壳；五层盒子其余壳不动、不引入新形态。
- 与 D-013 对接：6F 为本地路径输入，零授权事件 = 最薄输入。
- RAT 口径：本决策的证伪点 =「S1/S2 阈值在 6F 真实数据上能否产出非平凡结论」+「带引文与裁决回执的报告能否被信任并驱动行动」——验收口径需用户另行裁定（下一个 grill 问题）。
- 信息缺口消化顺序反转：16 项缺口从「工程前清零」改为「阶段 2 实测锚回流清扫」。
- 出处：atomcode R3-Q1 调研已落盘 .scratch/macro-audit/reports/R3-Q1-atomcode-research.md（15 源 / 14 抓取 / 12 域名）。
| D-017 | 「第一份真报告」（阶段 1 产物）的验收口径？（A 形式达标 / B 内容非平凡 / C 信任裁决） | 我偏向于A+C（提交调研前）；调研呈报后：接受（A→B→C 三层串行闸门 + 无 revised 处理） | 验收 = A→B→C 三层串行闸门：A 形式达标（共享骨架齐全 + 每条结论可回查引文 + Receipt 存在），为 smoke 层；B 内容非平凡，重定义为 RAT 预声明 kill criterion——跑 6F 之前以确定性规则写下判据并 commit 入库（候选：S2 命中真实 supersede 链异常 / ADR 状态与仓库文件现实不一致 / S1 给出可核验推理链；S1/S2 至少一维命中），未命中 = 合法实验数据（产品前提被证伪）而非失败，须回写账本；C 信任裁决四条款：① 裁定三档（信任并行动 / 不信任 / 需修订重判）且裁定依据在看报告前写死入库（防 HARKing）；② 引入构建链路外读者或对抗性清单（逐条排查「哪些结论可能是先验套话」）；③ C 裁定必须显式锚定 B 的产物（回答「非平凡判定是否可信、可行动」）；④ 裁定原文 + 时间戳回写决策账本。 | 禁止 A+C 跳过 B（三条独立工业证据链汇聚：no-finding 陷阱 / eval gaming 无 golden set / Goodhart 定律）；禁止 C 脱离 B 产物做纯结构裁定；禁止跑后补写判据（HARKing）；B 判据必须确定性、不接 LLM（与 D-016 一致） | current |

### D-017 后续影响（开放跟踪）
- 三处强化登记（**非 revised**，经用户拍板同意以本条目细化承载）：① D-006 引文校验盖章升级为「引文→结论支持关系」校验——引文齐全但撑不住结论的报告标 unsupported；② D-001 verdict-gate 以 C 层信任裁决为其外部校准锚，防裁决层退化为「自动化的形式达标」；③ D-011 下的 C 层验收判据须显式覆盖 agent 可消费性（引文可解析、裁决结构可编程引用），闭合「人裁定 vs agent 消费」视角错位。
- 阶段 1 执行次序锁定：先写 B 判据（确定性规则）→ commit 入库 → 再跑 6F 全链；atomcode 可提供 B 判据预声明草案（resume 4c4ba50a-a259-470d-8774-09d4877d9a23）。
- B 层设计要旨：「未命中」是实验的第一份合法产出（RAT/HDD 心智），严禁把未命中等同失败压回炉重跑。
- 出处：atomcode R3-Q2 深调研（置信度高；9 次三引擎查询 / 8 条全文核验 / 7 独立域名），落盘 .scratch/macro-audit/reports/R3-Q2-atomcode-research.md。
| D-018 | B 层判据（kill criterion）的构造方式？（A 全已知异常 / B 全真判据 / C 正对照+真判据混合） | 接受（对呈报 D-018 草拟记录；基于 atomcode R3-Q3 深调研呈报） | B 层 = C 构，配比 2 正对照 + 3 真判据 + 1 负对照（调研新增建议）：正对照 2 条须与真判据共享 detector 路径（同一族确定性采集器），职责仅证「管线能响应」，**不计入价值判定**；真判据 3 条承载证伪，每条预注册「可操作定义 + 显式阈值 + 命中方向 + 未中语义」，阈值跑前写死、跑后禁调（ISO 13528 纪律：判据独立于被测结果事前设定）；负对照 1 条（取预期 0 命中的已知干净片段）作特异性守卫，命中走事前约定的复核路径、不自动定罪。kill criterion 三级措辞：前置·管线健康闸（正对照 2/2 必须命中，否则实验无效、不修读数）→ 主·前提证伪闸（真判据全空且正对照 2/2 命中 =「前提未被支持」合法实验数据，回写账本、触发前提复审）→ 反向红条（真判据命中但正对照未全中 = 结果不可信、按管线故障处理）。 | 禁止正对照计入价值判定（mutation testing / KAT / 实验室 QC 三重先例）；正对照与真判据数据隔离使用、不可混报（Ferrer golden rule）；「未命中=合法数据」仅适用于真判据，正对照未中=管线故障（对 D-017 语义的细化，非改向）；负对照命中不自动定罪 | current |

### D-018 后续影响（开放跟踪）
- 五线证据汇聚（临床 ICH E10 assay sensitivity / ISO 13528 能力验证 / OWASP Benchmark+NIST Juliet / mutation testing / NIST CAVP KAT），置信高；调研确认「无单一综述断言混合=标准」，结论以多领域汇聚形态成立。
- 真判据 3 条的候选草案（阈值待用户测定后入库）示例：S2a 事后补写检测（ADR 文档时间戳与首 commit 间隔 >90 天占比）、S2b 五件套结构完整度、S1 定位关键词实测覆盖率；正对照首候选 = spec-phase-tasks.md 残留句 vs ADR-0002 supersede 链。
- 负对照的「已知干净」本身可能错——命中后走复核路径（信息缺口存档），不自动定罪。
- 阶段 1 执行序更新：先起草 B 层判据预声明文档（三级措辞 + 2+3+1 判据表）→ 用户审阅 → commit 入库 → 再跑 6F；atomcode 可提供草案（resume 3a3d4bf5-3d4f-4ac4-9d83-b69aea3bbfba）。
- 出处：atomcode R3-Q3 深调研（15 次三引擎查询 / 13 篇全文核验 / 9 域名），落盘 .scratch/macro-audit/reports/R3-Q3-atomcode-research.md。

| D-019 | 轮 4 Q1：下一阶段主干议题与节奏？（A 上游组合件策略为主干+根 README 组合件结构阐述 / B 只补 README 可见性 / C 复议 ADR-0012 节奏） | 更加偏向于继续按照之前心智模型的计划走，但 Q1 整个提交 atomcode 深度调研（原话全文见规范化需求①，2026-09-13） | ① 原回答原文：「按照你这么说的话，那我更加偏向于继续按照之前心智模型的计划走，但是还是将当前问题 Q1 整个提交 atomcode 深度调研，调研时必须回顾：decision-ledger 中全部 current 记录、docs/adr 与 CONTEXT.md 现有条目、工业界成熟落地的心智模型（重点），给出推荐与理由。若调研结论与账本中任何 current 决策冲突：禁止静默改向——把对应 D-xxx 标记为 revised（保留原记录），生成新的 D-xxx 记录呈报给我，等我拍板后才继续下探。」② 主干议题 = 上游组合件策略（上游引入方式 + 护城河/黏合剂边界 + 根 README 组合件结构阐述为其自然产物）；③ ADR-0012 节奏不复议——按既有四阶段计划走，组合件接入对应阶段 2/3（A-028/A-030，票 #24/#25）；④ 调研回顾范围 = 两本账本全部 current 记录 + docs/adr 13 篇 + CONTEXT.md 46 词条 + 工业界成熟落地心智模型（重点），输出推荐与理由 | 冲突协议：调研结论与任何 current 决策冲突时禁止静默改向——对应 D-xxx 标 revised（保留原记录）、生成新 D-xxx 呈报、等用户拍板后才继续下探；grill 期间不动源码；push 前必停 | current（倾向已确认；atomcode 调研中，最终拍板待回报）**→ closed（2026-09-14 用户拍板「采纳」，派生 D-020）** |

### D-019 后续影响（开放跟踪）
- 调研落盘：.scratch/macro-audit/reports/R4-Q1-atomcode-research.md（atomcode 单问串行，timeout 600000，-p 只放问题本体）。
- 冲突候选清单（调研回报后逐条核对，命中即走 revised 协议）：D-012/ADR-0008（分发五层盒子）、D-016/ADR-0012（四阶段节奏）、ADR-0005（HoF-FA）、ADR-0009（输入面 clone-to-local）、D-015/ADR-0011（单仓子目录）、A-021/A-022（fact schema v0 与确定性采集器实现决策）。
- 最终拍板前不基于调研结论下探新问题；拍板后在本块追加拍板结果或派生 D-020。
- 2026-09-14 拍板结果：**采纳**（派生 D-020，D-019 闭环）。

| D-020 | D-020 拍板：上游组件引入方式 = 双轨制 + 逃生舱？（基于 atomcode R4-Q1 深调研呈报，报告落盘 reports/R4-Q1-atomcode-research.md） | 采纳（2026-09-14，原话：「采纳」） | 上游引入方式定版双轨制 + 逃生舱：①主线 = 适配器 + 外部 CLI/库，逐上游锁定版本 + golden 输出契约测试——进程/容器边界为天然防腐层（工业先例：super-linter 容器捆绑、hashicorp/go-plugin subprocess+RPC、Terraform plugin protocol 版本化契约）；②库形态上游走包管理器 + lockfile hash pinning，不为统一强推全部 CLI 化（kusari 三档 pinning 判据 branch/tag/hash）；③vendor 源码进仓仅两种情况逃生：具体上游需离线/气隙分发、或上游废弃且无替代，启用时必须带 UPSTREAM 清单 + patches/ 目录纪律。README 组合件阐述范本 = arc42 三视图一页化 + Backstage 所有权分割 + super-linter 上游清单表（README 蓝图另立 Q2 拍板） | 禁止 vendor 活跃迭代的大依赖树上游（一手数据：vendored C 库中位年龄 3 年+、SCA 扫描失明、SBOM 无法出具）；适配层禁放业务规则（Microsoft ACL 判据）；上游 raw 语义不出适配层；本条为阶段 2/3 补位决策，不修订 D-012/D-016/ADR-0005 | current |

### D-020 后续影响（开放跟踪）
- 冲突核对结论（2026-09-13）：零冲突、零 revised——与 D-012/D-015/D-016/D-017/D-018、ADR-0005/0008/0009/0011/0012/0013、A-021/A-022 全部一致；ACL 判据强化 ADR-0005（事实表 schema = 唯一允许上游语义落地的边界）。
- 调研召回偏差记录：调研④所称「D-00X 复用 Receipt Gate / agent-completion-gate」无账本出处（全仓 grep 无 agent-completion-gate 字样；Receipt Gate 仅 Micro-A 数据源词条）——不采纳为事实；其合并措辞与 A-026 自研双锚 Receipt 交付一致。
- 派生待决：Q2 根 README 五段式蓝图；运行时解析策略（容器捆绑 vs 二进制发现，前置 = 读 Agent Plugins 1.0.0 plugin schema 原文）；上游清单表含「已接入/规划中」状态列（已接入：DuckDB/git；规划中：CodeLore、OpenSSF Scorecard、repomix/gitingest——以账本/spec 为准）。
- 实施落点：阶段 2/3（A-028/A-030，票 #24/#25）；grill 定稿前不落盘 README、不动源码。

| D-021 | Q2：根 README 组合件结构 = 调研五段式蓝图（新建仓根 README.md）？ | 采纳 A（2026-09-14，原话：「采纳A+ [$readme-crafter-skill]」） | 仓根新建 README.md，五段式：①一句话定位（证据采集大部分来自上游，裁决/schema/回执是我们的）；②三层盒子图（对应五层插件）+ 上游清单表（组件名｜形态｜引入方式｜锁定策略｜状态）；③Runtime View Mermaid 数据流（仓库输入→采集器→事实表→裁决→回执→报告，每箭头标注谁产出/谁消费/以什么契约）；④所有权表（Backstage 式：是我们的 vs 借来的）；⑤契约声明（上游经适配器进事实表，raw 语义不出适配层；上游换实现，事实表 schema 不动）。裁量四点：位置=仓根新建；定位=薄地图（架构细节外链 docs/，构建命令留 engine/README.md 不重复）；上游清单表带已接入/规划中状态列（已接入：DuckDB、git；规划中：CodeLore、OpenSSF Scorecard、repomix/gitingest）；落盘时机=本轮 grill 定稿后的整理环节一次写入。写作工具 = readme-crafter-skill（SKILL.md 已全文读入） | 上游清单表不得虚报进度（规划中不得写成已接入）；不暗示已发布（npm 包/插件上架未发生，A-030 deferred）；禁止发明社会证明与装饰性徽章（license=UNLICENSED 不放 license 徽章）；语言中文（与仓内文档一致）；grill 定稿前不动盘 | current |

### D-021 后续影响（开放跟踪）
- readme-crafter-skill 兼容性核对（2026-09-14）：与五段式零冲突——skill 定位「README=front page 不是全文档」对应薄地图裁量；「Monorepo: root README as navigation hub」正对 6F 形态；Mermaid 原生渲染支撑段③；evidence model（unverified 不写）支撑状态列如实标注。skill 分类落位：项目类型=Monorepo Hub / Agent or AI Tool，分发姿态=Source-first，受众=Evaluator+Power User 为主（AI Agent 次要），气质=Developer Utility；skill Phase 3 interview 已由 grill Q1/Q2 等价完成，Phase 4 plan 已由五段式拍板等价完成。
- 写入执行清单（定稿后整理环节）：skill Phase 1 SCAN（事实采集，仓根现状+engine 元数据+CI）→ Phase 5 GENERATE（按五段式逐段，命令/路径对实物核验）→ Phase 6 VERIFY（quality-checklist 11 项 + repo-integrity hard-compare）→ 产出 3-5 条后续建议清单（如 CI 徽章、hero 图）。
- 6F 特殊纪律：license=UNLICENSED（engine/package.json）→ 不放 license 徽章；发布态未发生 → 不暗示可安装；CI 徽章（engine-ci.yml 实跑在案）作建议不作默认。
- 定稿后配套（按 domain-modeling 惯例）：D-020 具 ADR 三条件（难逆/无上下文会困惑/真实取舍）→ 起草 ADR-0014；D-021 属文档结构不立 ADR；CONTEXT.md intro 追加轮 4 一行。

### D-024 后续影响（开放跟踪）
- **整理环节执行清单（定稿后写入 spec-phase-tasks.md，grill 期间不动该文件）**：① 任务 7 前置「CodeLore DuckDB schema 复审」改注为 ~~stale~~ + 纠偏理由（类别错放：Q2 行为证据 ≠ Q1 契约证据）+ 新前置（单写者域 = 首报 228 条冻结实测，2a 可出带置信域草案；多写者域 = self-probe 项，复审时点 = 阶段 3 铺开多采集器后）；② 任务 1/3 前置改注「探针时点 = 2b（CodeLore）」；③ 任务 5 内部 S3/S4/S5 行注「占位待探针（探针时点 = 2b / 阶段 3）」；④ 所有保留待-probe 占位的缺口登记补两字段：满足判据 + 复审时点。
- **CONTEXT.md 新词候选（grill 退出时评估）**：「自证探针（self-probe）」——自家系统在负载/争用下行为的实测校准类目，与上游探针（外部工具形态/语义/规模）和 desk calibration（契约+冻结数据推导）三分类互斥完备。_Avoid_: 基准测试（暗示性能测试而非缺口校准）、自测（暗示单元级）。
- 冲突核对结论（2026-09-15）：零冲突零 revised——D-023 的 desk/上游二分法被本条补全为三分类（self-probe 显式命名），方向一致不推翻；A-007 SWMR 决议不受影响（多写者实测本就是其明示遗留）。
- 出处：atomcode R5-Q3 深调研（8+ 检索 / 三引擎 / 8 篇原文 / 8+ 域名 / 五角度；PMI 源 403 经 pmessentials 交叉），落盘 .scratch/macro-audit/reports/R5-Q3-atomcode-research.md（resume 锚点未捕获，全文可经 ctx_search 检索词找回）。

## 轮 4 收口对账（2026-09-14）

> 数据源纪律：本节由账本自身枚举生成（17 条 current）；去向列引用的文件均经实物核验存在（ADR-0001~0013、spec.md ## Implementation Decisions 与 R2-01~05 节、spec-phase-tasks.md 任务 1~18 / R2 / R3 表、根 README.md、docs/adr/0014、handoffs/next-round.md）。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-001 | current | spec 条目：ADR-0001 + CONTEXT.md「Macro Audit / Micro Audit / Scale」词条；判据细节 → spec.md Decision 4.5 + 计划表任务 1~5 |
| D-003 | current | spec 条目：ADR-0003（规划边界 = 产品本体 + 使用方法，商业层排除） |
| D-004 | current | spec 条目：ADR-0004 + spec.md Decision 4.1~4.6；计划表条目：任务 1~6 |
| D-005 | current | spec 条目：ADR-0005 + spec.md Decision 5.1~5.7；计划表条目：任务 7~13；阶段 0 部分已实现（R3-02，A-021） |
| D-006 | current | spec 条目：ADR-0006；计划表条目：任务 14~16 |
| D-007 | current | spec 条目：ADR-0007；计划表条目：任务 17~18；Macro-B happy+failure path 已由 R3-05 首报覆盖（A-026） |
| D-009 | current | 计划表条目：R2-01 → spec.md「R2-01 目标用户四类全集」（已封口） |
| D-010 | current | 计划表条目：R2-02 → spec.md「R2-02 使用场景并集 + mode 枚举」（明注覆盖 D-010） |
| D-011 | current | 计划表条目：R2-03 → spec.md「R2-03 默认模式开箱路径契约」+ CONTEXT.md「Default Mode」词条 |
| D-012 | current | 计划表条目：R2-04 → spec.md「R2-04 Agent Plugin 契约群」+ spec 条目 ADR-0008 + CONTEXT.md「Agent Plugin / Receipt」词条 |
| D-013 | current | 计划表条目：R2-05 → spec.md「R2-05 输入面契约」+ spec 条目 ADR-0009 + CONTEXT.md「Repo Intake」词条 |
| D-015 | current | spec 条目：ADR-0011（单仓 + 子目录 + but 分支）+ 实体落地 engine/ |
| D-016 | current | spec 条目：ADR-0012；计划表条目：R3-01~03/05（已闭环，A-019~A-027 implemented）+ R3-06/R3-07 = 票 #24/#25（backlog，A-028/A-030 deferred） |
| D-017 | current | spec 条目：ADR-0013；计划表条目：R3-04/R3-05（已实现：预注册文档 + 首报 A→B→C，C 裁定 supported） |
| D-018 | current | spec 条目：ADR-0013；计划表条目：R3-04（22-criteria-pre-registration.md，2+3+1 判据入库，A-023~A-025） |
| D-020 | current | spec 条目：docs/adr/0014（本轮起草落盘）；实施落点 = 阶段 2/3 → 票 #24/#25（backlog） |
| D-021 | current | 本轮整理产物：根 README.md（五段式，readme-crafter-skill 流程）+ handoffs/next-round.md（下轮任务书） |

**无去向记录清单：空** —— 17/17 current 全部有去向。非 current 处理：D-002/D-008/D-014 = revised（原记录保留；D-014 由 D-015 承载、D-008 内容由 R2-01~05 承接）；D-019 = closed（拍板采纳派生 D-020）。


| D-022 | Q1（轮5）：源码推进的阻塞面是什么？阶段2/3按什么节奏推进？ | **A — 维持 VVL 既定节奏**：先拍板 #25 checklist，然后按 R3-06→R3-07 串行推进（先缺口回流，再铺开）。不跳过阶段 2 直接铺开到阶段 3（那会回到 D-002 禁 MVP 切片的老路）。 | 阶段 2/3 继续遵循 ADR-0012 四阶段串行模型：阶段 2（R3-06 缺口回流）必须在阶段 3（R3-07 铺开+分发）之前完成；#25 checklist 中待拍板项构成阶段 2 启动闸门，需用户逐项裁定后再立票开工。 | 禁止跳过阶段 2 直接铺开其余 scale（违反 D-002 禁 MVP 切片精神）；禁止在缺口未回流前接入新上游组合件（先看清全貌再动手）；阶段 2 开工前须用户拍板 #25 checklist 中至少 B1/B3/B4 类立票项的范围与优先级。 | revised |

## 轮 5 收口对账（2026-09-15）

> 数据源纪律：本节由账本自身枚举生成（程序化：28 条 = 22 current / 5 revised / 1 closed）；去向列引用的文件均经实物核验存在（本轮整理环节新产物：docs/adr/0015、0016；spec-phase-tasks.md 第五轮 R4 节；25-rollout-checklist.md 拍板状态列；CONTEXT.md 轮 5 intro + 4 新词 46→50；README.md 数字同步；reports/R5-Q3/Q4/Q5-atomcode-research.md）。
> 轮 4 收口对账表（17 行）仍有效，本轮只覆盖 D-022 起的增量与 D-012 状态变更；旧行去向不重复。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-022 | revised | 原「禁止缺口未回流前接上游」被 D-023 序列化控制取代（原记录保留） |
| D-023 | current | spec 条目：docs/adr/0015 §Decision-2；计划表条目：spec-phase-tasks.md R4 节（R4-01~05） |
| D-024 | current | spec 条目：docs/adr/0015 §Decision-1；计划表条目：任务 1/3/5/7 注记纠偏（任务 7 前置标 stale、按域拆分）；CONTEXT.md「Self-probe（自证探针）」 |
| D-025 | current | spec 条目：docs/adr/0015 §Decision-3；计划表条目：R4-01（量测审计）/ R4-02（v2）/ R4-03（治理）+ C 层 disposition 补记项；CONTEXT.md「Dual Reporting」/「Assignable Cause」 |
| D-026 | current | 整理产物：25-rollout-checklist.md 拍板状态列 24 行 + §8 注记（superseded 三步关闭 B2.2/B3.1/B5-4 + closed B5-1）；绑定表权威文本 = reports/R5-Q5-atomcode-research.md §3；CONTEXT.md「LRM Binding」 |
| D-027 | current | spec 条目：docs/adr/0016；25-rollout-checklist.md P5 行「方向已拍」；README 上游清单/发布口径不变 |
| D-028 | current | **本轮整理环节已执行完毕**：16 守卫亲跑 16/16 PASS（exit 0，soft-warn 1 = spec.md「布局」属设计层）→ git update-ref -d 删 gb-local/16-rendering-split 残留 ref（but branch delete 对 remote 类无机制，循 R3 收口先例例外）→ 等价证明：四件 blob 逐字节一致（check=1d79f4b9 / json=36305040 / schema=f43fe7e4 / report=3e65706e）+ 1fff488 与 main 树差空；三 main（main/origin/main/gb-local/main）均 8be9db5，but branch list 清零 |
| D-012 | revised | 仅末句商业条款被 D-026 锐化（去向：ADR-0016 渠道方向 + D-027）；五层盒子余款去向不变（ADR-0008 / spec R2-04 / CONTEXT 词条，见轮 4 对账表） |

**无去向记录清单：空** —— 22/22 current 全部有去向（16 条沿轮 4 表 + 6 条本表；revised/closed 按原记录保留规则处理）。

### 轮 5 整理环节执行记录（2026-09-15）

- 对账闸通过 → 依次落盘：spec-phase-tasks.md（5 行注记 + R4 节）→ 25-rollout-checklist.md（24 行状态列 + §8 注记）→ ADR-0015/0016 → CONTEXT.md（intro + 4 词 = 50）→ README.md（4 处数字）→ D-028 清理执行 → 本节 → handoffs/next-round.md。
- 全部写入经 node.js（默认执行环境），每文件写后回读验证（无 BOM / 关键片段存在断言）；未触 engine/**，无构建产物。
- 冲突协议全程零静默改向：本轮 2 次 revised（D-022、D-012）均先呈报后落盘、原记录保留。

## 轮 6 收口对账（2026-09-15）

> 数据源纪律：本节由账本自身枚举生成（36 条 = 30 current / 5 revised＝D-002/008/012/014/022 / 1 closed＝D-019）；去向列引用文件均经实物核验（本轮新产物：docs/adr/0017；CONTEXT.md 4 新词 50→54；25-rollout-checklist.md 5 行状态列＋§8 注记；BACKLOG.md 阶段 3 票据包 #32~#43；spec-phase-tasks.md 第六轮 R5 节；WORKFLOW §4.2.6 第 6 条；prompts/ 31 份黑体块；handoffs/next-round.md）。
> 轮 4/5 对账表仍有效，本表只覆盖 D-029 起增量；本轮零 revised、零状态变更。

| D-xxx | 状态 | 去向（spec 条目 / 计划表条目号 / 整理产物） |
|---|---|---|
| D-029 | current | 计划表条目：BACKLOG #32（已执行：31 份 prompts「## 收尾」段首黑体块，逐字措辞落地）＋25-checklist B1.2 行→decided-now＋WORKFLOW §4.2.6 第 6 条模板继承 |
| D-030 | current | 计划表条目：BACKLOG #41（examples/first-report/ 复制＋披露 README）＋#43（golden CI 候选票）＋25-checklist D1 行→decided-now |
| D-031 | current | spec 条目：docs/adr/0017（preview 发布模型＋build-scope/release-sequence 划界）；计划表条目：BACKLOG #41；25-checklist P6 行→decided-now |
| D-032 | current | spec 条目：docs/adr/0017 §Decision-4（披露非演示）；计划表条目：BACKLOG #41＋各层 preview DoD（#38 等票完成定义）；25-checklist D2 行→decided-now |
| D-033 | current | 计划表条目：BACKLOG #37（可用性审计）/#39（三仓 one-shot＋jiahao 回归）/#40（非自有仓 GA 前置）；25-checklist B4.2 行→decided-now |
| D-034 | current | spec-phase-tasks.md 第六轮 R5 节（阶段 3 串行骨架）；BACKLOG 次序注记；三触发器→#33 机检输入、#39＝触发器 (a) 激活点 |
| D-035 | current | 计划表条目：BACKLOG #35（首批 ~30 面）/#36（LLM 面独立票）/#42（dump 对照评估＋上游队列）；spec-phase-tasks.md 暂缓面集两字段注记 |
| D-036 | current | 整理产物：BACKLOG.md #32~#43 立案＋spec-phase-tasks.md R5 节＋本节对账 |

**无去向记录清单：空** —— 8/8 增量 current 全部有去向（22 条旧 current 沿轮 4/5 对账表不变）。

### 轮 6 整理环节执行记录（2026-09-15）

- 对账闸通过 → 依次落盘：prompts 31 份黑体块（#32 执行）→ 25-checklist 5 行＋§8 注记 → WORKFLOW §4.2.6-6 → README/spec.md ADR 计数同步 → ADR-0017 → CONTEXT.md 4 词 → BACKLOG #32~#43 → spec-phase-tasks R5 节 → 本节 → handoffs/next-round.md → but commit。
- 全部写入经 node.js（默认执行环境），写后回读断言；未触 engine/**，无构建产物。
- 冲突协议全程零静默改向：本轮 0 revised；#43 系 D-030③ 登记候选票，并入票据包尾（编号续 D-036 包体自然延伸）。
- D-030 落位动作归票 #41（D-036 归票为最新裁定）；D-030 约束款「执行时点＝整理环节」解读为「整理环节起的票据生命周期」，实物复制在 #41 执行窗口完成——两点张力如实登记，不静默调和。

## 轮 7 收口对账（2026-09-15）

增量记录 D-037~D-041（第七轮 Grill 节）对账结果：

| D | 去向 |
|---|---|
| D-037 | ADR-0018 §D-1＋docs/versioning.md＋#44＋#41b（版本元数据查证挂入）＋checklist P2→decided-now＋registry 25-P2→decided |
| D-038 | #45＋#43 前置注记＋#41a（Try-on-real-repo 节）＋spec-phase-tasks R6 契约面注记＋checklist D4→decided-now＋registry 25-D4→decided |
| D-039 | ADR-0018 §D-2＋#41a（仓根编年首条）＋#44（指针守卫）＋checklist B3.3→decided-now＋registry 25-B3.3→decided＋engine/CHANGELOG.md 反向指针 |
| D-040 | BACKLOG #41→#41a/#41b 拆分＋WORKFLOW §4.2.7＋next-round.md 任务改写 |
| D-041 | #33 扩展子项（BACKLOG 注记）＋registry watch 三态数据面（本环节落盘：23 event_bound/4 manual_watch，新增事件 first-external-repo） |

无去向记录：空（5/5 有去向）。状态台账：41 条记录 = 35 current / 5 revised / 1 closed。

执行记录（整理环节落盘面）：registry JSON（3 项 decided＋watch 三态＋first-external-repo 事件）；25-checklist P2/B3.3/D4＋§8 R7 注记；BACKLOG（#44/#45 立案、#41→#41a/#41b、#33 扩展注记、次序行 DoR 锐化）；spec-phase-tasks 第七轮 R6 节；docs/versioning.md 新建；docs/adr/0018 新建；docs/decisions/README.md 索引 17→18；engine/CHANGELOG.md 反向指针；CONTEXT.md（2 新词 Demo Fixture/Watch Tri-state＋header 轮 6/7 行）；README.md 与 spec.md ADR 计数→0018；WORKFLOW §4.2.7。

如实登记：①仓根 CHANGELOG.md 实体未在本环节创建——per D-039/D-040 归 #41a 窗口（首发 tag 同门）；②engine/upstream-lock.yaml 种子行归 #44（账本约束列未列其为整理交付物）；③manual_watch 项五要素字段齐备化（watch_owner/watch_method）属 #33 扩展子项，本环节仅落 watch/confirmations 数据面；④D-037④ 「Advisory→enforce」守卫族机检项与 #44 同票。

## 第八轮收口对账（2026-09-16）

| 项 | 结论 |
|---|---|
| 账本 | 47 条（40 current / 6 revised / 1 closed）；W14 六项 frontier 全拍（D-042~D-047 均 current，无 revised） |
| 去向 | D-042→BACKLOG #41b 行解锁＋listing-submission 收窄注记；D-043→ADR-0019＋30-cal task7 写实化＋registry mw-a/b·desk-task7→decided＋CONTEXT SWMR Facade；D-044→registry desk-task15 重绑＋勘误；D-045→residual-faces→decided＋deferred 22→25（速写 20→23）＋33-check B3 双源回查（D-035∥D-045）＋#46 后续批次承接 entity-effort；D-046→BACKLOG #46＋spec-phase-tasks R7；D-047→BACKLOG 试点集注记＋R7-06 |
| 无去向清单 | 空（47/47 有去向） |
| 整理产物 | ADR-0019 新建；docs/decisions/README 索引＋README/spec.md ADR 区间 18→19＋D 区间 41→47；CONTEXT 56→57 词＋header 轮 8 行；CHANGELOG M-002；registry watch 23 event_bound/7 manual_watch；spec.md R7 指针节 |
| 如实登记 | ① 33-check B3 回查源扩为 D-035∥D-045（账本记录不改写→守卫口径扩展）；② 经典公开仓候选清单未定→#46 呈报短名单；③ ADR-0019 先例：判据措辞默认按意图读法撰写；④ #41b 提交动作/凭据实操仍用户闸门；⑤ 6F/jiahao push 未授权 |
## 第十五轮收口对账（2026-09-17 整理环节）

| D | 去向 |
|---|---|
| D-059 | P0=#54（%cI+gitcli 断言+golden-ci 勘误）；P1=#55（SQL 字面量/MCP db/intake 时点/contradicts 勘误）；三触发器入 registry（runtime-doctor-trigger/bundle-retirement-trigger/duckdb-binary-watch）；#8 先写后接张力记台账（本行）不立票 |
| D-060 | BACKLOG #53（audit 一等命令八要素＋README 同票绑定） |
| D-061 | BACKLOG #52→#52a+#52b 拆票；registry narrative-eval-surface 改锚 host-narrative-corpus（pending/event_bound）；**D-057② 勘误注记**：原锚「叙事实物出现」已随 #50 触发，经 D-061 拆分后其语义由 52a（即时、不占锚）＋52b（改锚真实语料）承继——原 D-057② 决策本体不动 |
| D-062 | registry mw-trigger-c.verify_method=DoR 判据集；CONTEXT Trigger Sequence 词条补启动判据句 |
| D-063 | ①L1：r14-audit-findings（SHA c06aa58833940c8f9858011d6028944f8187c6f7）**已于 PR #5 合入 main（12e2a49），先于本裁定发生**——裁定口径「审计件=冻结只读留档分支不合 main」自本轮起约束未来审计件分支；已合入内容留存不撤（撤除=改写已共享历史）；②L2：registry golden-verifier-dirty-on-rerun（manual_watch，≥3 次→立票，修法=守卫旗标化） |

轮 15 全部 5 条增量皆有去向，无去向清单=空。

## 第十六轮执行记录（2026-09-17，分支 r16-impl-t1-t3-t2）

| 票 | 落盘 |
|---|---|
| #54 (D-059①) | commit wkp：normalizeGitIsoDate 归一化+严格形状断言（intake.ts）；%cI 消费点单源在 audit/macro-b.ts；39/40/48 对照脚本同口径；golden-ci 勘误＋upstream-lock enforce 位；gitcli-contract.test 11/11＋54-check 19/19 |
| #55 (D-059④⑤⑥⑦) | commit usr：stripSqlLiterals（sql-literal 17/17）；MCP db 三源寻址＋MCP-FACTS-DB-UNRESOLVED（mcp-db-resolution 12/12，mcp.json env 经 manifest.meta.json 单一元数据源生成）；intake snapshot_fetched_at/cache_hit/refreshed＋.git 键归一＋refresh opt-in（intake 40/40）；contradicts 死枚举清除；55-check 17/17 |
| #53 (D-060) | commit pwo：audit 一等命令八要素全项；audit/macro-b.ts 共享链（demo 重构同消费）；SCALE-NOT-IMPLEMENTED exit 2；--out 双通道五工件＋回执 JSON；报告头 stability/capabilities 机读面；39/40 转对照物＋golden parity 实测（audit 侧车字段⊆39 复跑产物）；audit.test 24/24＋53-check 22/22；README 同票 |
| #52a (D-061) | commit 后随：合成语料 110 条（92 claim-evidence＋18 band，52a-gen-corpus.mjs 确定性生成＋sha256 指纹）；κ 三报=全集 0.455（<0.6 地板如实报＋findings 登记）／非对抗子集 0.970／intra-rater 1.000；band-leak 检出 12/12＋干净 FP 0/6；对抗 FP=13/FN=12 分型入 eval JSON；**#56 立修复票**（评测/修复分票纪律兑现）；52a-check 21/21 |

如实登记：① cli.ts --refresh 旗标行与 audit 分发块同 diff hunk 相邻不可再分，随 #53 commit 落盘（#55 注记）；② mcp.json 为 gen-manifests 生成物，env 配置面落 manifest.meta.json 单一元数据源（首跑 gen 报 DRIFT 即教训）；③ 52a 双标=intra-rater 单人二轮口径（合成语料 inter-rater 天花板退化为构造确定性，限制披露随 eval JSON）；④ snapshot_fetched_at 取证源=FETCH_HEAD mtime 单源（clone/refresh/缓存命中三腿同值，双钟不漂）；⑤ cli.ts audit 分发块测试期误用 audit_fact_events 表名——事实表实为 audit_fact（store.ts 唯一权威），test 修正后 audit.test 24/24。
## 第十七轮 Grill（2026-09-17）

| D | 原问题 | 用户原回答 | 规范化需求 | 显式约束/负向需求 | 状态 |
|---|---|---|---|---|---|
| D-064 | Q1（轮17）：轮16审计 F1-F15 处置框架？（atomcode 深调研 R17-Q1：DevSquad spec-amendment/clig.dev/Speakeasy/semver.org/JRH 六源＋本地一手文书核验，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐全项） | ① 修 6 单票：F1 层序串修回 ADR-0017③ 原文＋53-check B 面断言层序原文／F8 新四守卫补 noBom 扫描／F9 旗标值双横线前缀拒绝（结构化 USAGE 错误）／F10 pc1AdrFacts 空值守卫→结构化 insufficient（demo.ts:246 同型并修，Failure Semantics：崩溃=缺结构化语义第三态）／F11 evidence_threshold_met 改名优先于改判定式（名字表达错误概念；0.y.z 改名零兼容税）＋53-check C 面同步／F15 mcp facts 调试腿复用 resolveFactsDb 三源链；② 勘误 5 注记级：F2 D-060③「同源」收窄为公共字段命名词同源禁同义异名（沿 D-043 写实先例）／F3 D-060④「单一函数」勘误为函数组共享（golden parity 为实体防漂移机制）／F6 改 #56 票面对齐 D-059⑤（D-061 本体不动）／F7 D-060③ 补记五工件清单（D-048 枚举扩容先例）／F14 D-060① 签名补 --refresh 第五旗标（D-059⑦ 已裁定能力）；③ F12 已闭环（ADR-0009 头部勘误补记实物已在）；④ F4 注记承接（合成语料 human-human 天花板测量对象不存在，遗留 #52b 真实语料面）；⑤ F5 held-out 分区＋分离存管写入 #56 票面；⑥ F13 观察项（下次接触 demo.ts 的票顺带清） | 零 revised——全部票面改动落注记级勘误非决策改向；修复票重跑清单=53-check＋audit.test＋npm test＋33-check 基线；防勘误膨胀（本批为同日滞后集中清算非常态）；执行时点=整理环节立票＋注记 | current |
| D-065 | Q2（轮17）：#56 checker 语义边界修复方向裁定？（atomcode 深调研 R17-Q2：NegEx/ConText/NegDetector/CiteEval/TIST 12 源，置信高） | 采纳（2026-09-17，原话「采纳」＝采纳修正后推荐=(a)③+①＋五处锐化） | ① **判定语义文档化命名**：citation 盖章面明文 supports=presence-level 字面锚在场（否定/引语语境剥离后），非语义蕴含——命名即判据（TIST 惯例：未命名 verifier 协议跨评测不可比）；② **否定语境剥离=确定性三表启发式**：pre-negation cues／post-negation cues／pseudo-negation 表（防误剥，ACL W13-5635 结构）＋CJK 独立词表（不/没/未/无/非，禁 port 英文表）＋预声明窗口参数；③ 引语包裹模式表自设计（无现成 gazetteer）；④ **fail-safe 默认**：检测不确定→保持原判定/宁 insufficient 勿误 supports（与 BAND 从严同向）；⑤ 测试纪律=held-out 分区建立（兑现 D-064⑤ F5）＋修复后 held-out 首跑复测＋禁参照 52a 语料标签调参；⑥ FN=12 语义缺口如实披露归 human-in-loop 级（D-053④ 明细义务面）；⑦ 输出空间维持 supports/insufficient 二态不加第三态（D-045 YAGNI 判例同） | NegEx/ConText=确定性算法先例（纯正则无句法语义依赖）完全落 D-058 kernel 边界；启发式=收敛性改进非完备解（嵌套/复杂句式残留如实披露）；纯收窄=把已知 defect 包装成宣称不支持；锚表无合法构建来源；NLI=概率模型违 D-058＋不可重放破盖章；执行时点=#56 票面修订后 implement | current |
## 第十七轮收口对账（2026-09-17 整理环节）

| D | 去向 |
|---|---|
| D-064 | BACKLOG #57 修复票（F1/F8/F9/F10/F11/F15 六子项，P0）＋#56 票面修订（F5 held-out 分区）＋#52b 行 F4 注记＋registry demo-cleanup-observe（F13）；**D-060 四处勘误注记**：②层序条款不变（F1 属实现违票面非票面错）／③「同源」收窄释义=公共字段命名词同源禁同义异名（沿 D-043 写实先例）＋补记 --out 五工件清单（report.md/report.json/facts.duckdb/audit-facts.jsonl/audit-measurements.json，D-048 枚举扩容先例）／④「单一管线函数」勘误为函数组共享（golden parity=实体防漂移机制，D-031 镜像不抽象）／①签名补 --refresh 第五旗标（D-059⑦ 已裁定能力，D-048 枚举扩容先例）；F12 ADR-0009④ 勘误补记实物核验已在闭环 |
| D-065 | BACKLOG #56 行修订（方向=③+① 全要素：文档化命名/三表剥离/pseudo 表/CJK 词表/fail-safe/held-out 分区/FN 披露/二态不加第三态） |

轮 17 全部 2 条增量皆有去向，无去向清单=空。
