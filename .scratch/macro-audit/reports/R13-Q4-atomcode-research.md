# R13-Q4 atomcode 深度调研报告 — repomix/gitingest 打包层去留

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q4-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q4，FTS 已索引）；atomcode 会话锚（stdout 尾行为准）。
> 冲突协议结果：**零 revised——(a) 锐化版（退役＋重开触发器登记）＋D-045 须正面区分＋registry/CONTEXT 同步义务**。

## §1 执行摘要

**推荐 (a) 退役＋重开触发器登记**：锁表行 repomix-gitingest planned→retired（retired 行不删、provenance 可反查），裁决注记显式登记重开触发器（「审计证据导出包」独立需求面出现→另立需求票再激活评估）。Confidence 高，三重独立信源：① repomix/gitingest 全部官方用例均以「喂外部 LLM/chat」为前提（repomix.com use-cases 全文核验）；② repomix 自身 MCP 化转型（pack_codebase/read_repomix_output/grep_repomix_output——支持行范围部分读取，「专为直接文件系统访问受限的环境设计」）正是官方对「宿主 agent 恒在」前提的工业级回应；③ 本仓 D-053＋ADR-0016 使消费端按定义恒为 agent 宿主。注意：本推荐是 (a) 的锐化版——非裸退役，而是退役＋登记重开判据（吸收 (b) 的触发器语义、拒绝其「保留 planned 行」本体）。

## §2 分点结论

**结论 1（两源交叉）**：repomix/gitingest 类打包层的全部现存用例都预设「LLM 不可直接读 repo」——repomix 官方四用例（配合 Grok/ChatGPT 上传、Simon Willison llm CLI、Claude/Aider 工作流、knowledge datapack）全部是「打包→上传/附到 prompt」；OpenReplay「In most chat interfaces, LLMs cannot directly inspect a repository」。该前提在本产品架构下恒假。

**结论 2（两源交叉）**：工业界对「宿主 agent 恒在」的回应=打包层 MCP 化/查询化而非整仓 concat——repomix 官方 MCP server（pack_codebase 按需打包＋read_repomix_output 行范围部分读取＋grep_repomix_output）；zzet.org Gortex 对比文「packing a whole repo into one prompt and querying a repo on demand are two different jobs, and they fail in opposite directions」——整仓打包 token 随 repo 规模增长、每轮重复计费、lost-in-the-middle 丢点 >30%，「packing suffices for small repos under ~10k files, but breaks down at scale」——被审仓（git/django/spring-boot，D-050）全部远超 10k 文件，**即使想喂也喂不进**。Reddit r/LocalLLM 一手信号：「there are some good tools that I basically stopped using with Claude and Codex such as repomix」。

**结论 3（三源交叉）**：退役治理惯例支持 (a)——SWE-book ch15「code is a liability, not an asset」，deprecation 适用于「demonstrably obsolete and a replacement exists」，本仓情形更强=原用途前提被架构演进抽空且零沉没成本（adapter=null 从未接入）；Atlan 数据退役流程=staged retirement not deletion、保留 audit trail——与锁表「retired 行不删」同构。保留 planned 的唯一成本=每次 release 手动窗口复审税＋守卫面永久噪音。(b) 的失败模式=「planned 变永驻僵尸行」（LRM 语义：超期未拍=默认拍「永不接入」却占声明面），与 D-031 同族反模式。

**结论 4**：审计证据导出包载体=审计产物而非 repo concat——(d) 改用途属语义错配且「改用途不立新需求票=静默改向」，其合理内核已由 (a) 的重开触发器吸收。

## §3 对比矩阵

| 候选 | 架构一致性 | 持续成本 | 失败模式 | 判定 |
|---|---|---|---|---|
| (a) 退役＋重开触发器 | ✅ 完全一致 | 零接入成本，retired 行留档 | 误退役风险→显式触发器对冲 | **推荐** |
| (b) 保留 planned＋判据 | ⚠ 名实不符（无可达消费面） | 复审税＋守卫面永久噪音 | planned 变永驻僵尸行 | 不推荐 |
| (c) 立票接入 | ❌ 违 D-031＋YAGNI | 接入全成本 | 无消费面的活性依赖=纯负债 | 排除 |
| (d) 改用途再留 | ⚠ 语义错配 | 僵尸行＋误导读者 | 改用途不立票=静默改向 | 不推荐（内核已被 a 吸收） |

## §4 与本仓 current 决策冲突排查（逐条点名）

- **D-053**：✅ 同向且为退役提供核心论据；唯一补强处——retired 后锁表注记写明「repo 文件面由宿主 agent 原生访问承担，产品不提供 repo 文本打包面」，防读者以为 D-053 依赖某打包上游（注记级非改向）。
- **ADR-0016**：✅ 消费端恒为 agent 宿主=退役论据的结构性前提。
- **D-037③/ADR-0018**：✅ retired 是锁表词表既有语义的首次启用；retired 后 README §3 人读表自动不再出现（锁表纪律原文已规定）。
- **CONTEXT.md Macro-B 词条**：⚠ 词条含「数据源为 CodeLore＋OpenSSF Scorecard＋repomix」类字样——须随退役同步收窄。
- **research.md §7.3 BOM**：✅ 原预设档案非规范面，退役裁决即显式勘误落点（记于账本新 D 即可，不改 research.md 本体）。
- **#42 行**：⚠ 弱关联——#42 已闭环（A-047）不改写；但 registry 的 upstream-probes-scorecard-repomix pending 项若仍挂 repomix 须随票关闭/改绑——落盘时核对实际措辞。
- **D-045**：⚠ **须正面回应**——D-045 是对 codelore 57 面「零弃用」的从严裁定（复合派生/需外部输入非弃用理由）；本case不同构：repomix 行非「可算但暂缓」面而是**消费前提结构性消失**，恰落入 D-045 判据的「无价值」分支——裁决注记须显式做此区分，防被读作 D-045 从严纪律的破例。
- **D-055**：✅ 同构先例（「planned 声明被读作未来实物」=「声明位被读作实物层」同类失真）。
- **scorecard 行**：✅ 不受影响——有真实拉动面（供应链象限 D-034③/D-054）。

## §5 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Repomix use-cases 官方全文 | repomix.com/guide/use-cases | Official | 四用例全部预设「喂外部 LLM」 |
| 2 | Repomix MCP server 官方档 | repomix.com（MCP 节，Exa 摘录） | Official | pack_codebase/read_repomix_output/grep——官方对宿主 agent 场景的回应 |
| 3 | OpenReplay repomix 指南 | blog.openreplay.com | Community | 「chat interfaces 中 LLM 不能直接 inspect repo」 |
| 4 | zzet.org Gortex 对比文 | zzet.org（2026-06-02） | Comparative | 整仓打包 vs 按需查询=两种 job 反向失败；10k 文件上限 |
| 5 | Reddit r/LocalLLM | reddit.com/r/LocalLLM | Community | 「stopped using repomix with Claude and Codex」一手信号 |
| 6 | SWE-book ch15 deprecation | Google SWE book | Official | code is liability；obsolete+replacement 判据 |
| 7 | Atlan 数据退役流程 | docs.atlan.com（2026-03-12） | Official | staged retirement not deletion＋audit trail |
| 8 | SmartDeploy/HeroDevs 退役判据 | 搜索级 | Community | 「isolated and unused」=黄旗非红旗｜
| 9 | 本地：research.md §7.3／lock 表／ledger D-045/D-053/D-055 | 本仓 | — | 冲突排查底座 |

## §6 信息缺口

1. 无逐字同构先例（「宿主 agent 恒在的产品中退役 planned 打包层」无公开一案一议）——结论三路外推，置信高但非同构实证；
2. repomix 官方 FAQ 大仓限制段仅得高亮摘录未整页抓取——与 zzet.org 引文互证不影响方向；
3. registry upstream-probes-scorecard-repomix 项精确措辞未核对——落盘执行时须实际核对该项是否需随退役关闭/改绑。

**一句话裁定**：(a) 退役＋重开触发器登记——planned→retired 行留档、锁表注记写「repo 文件面由宿主 agent 原生访问承担」、D-045「无价值分支」显式区分、registry 探针项核对关闭、重开触发器=「审计证据导出包需求出现→另立票重评估」。
