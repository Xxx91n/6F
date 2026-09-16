# R13-Q5 atomcode 深度调研报告 — 原预设余项清算（四小项）

> 调研题面：D:\Aworker\6F\.scratch\macro-audit\reports\R13-Q5-research-prompt.md
> 时点 2026-09-16；通道 ctx_batch_execute（label=atomcode-r13q5，FTS 已索引）；atomcode 会话锚 8cca04be-e454-4bca-8090-b74409f471f3。
> 冲突协议结果：**四小项全部零冲突——①销项②manual_watch③封口④归宿主 agent**。

## §1 执行摘要

四小项全 (a)：① codelore issue 外联草稿=销项；② 叙事质量评测面=登记 manual_watch（触发器=#50 落地、叙事实物出现后另立票）；③ anysearch-cli kernel 迁移=确认封口核销 BOM#6；④ sufficiency 补查回路=归宿主 agent（rubric 写程序、kernel 只判 insufficient）。

## §2 分项论证

### ① codelore issue 外联草稿 → (a) 销项（两源交叉）

OSSAlt 2026 贡献指南：issue 外联的正确时机=该功能对自己的决策面有真实拉动；无拉动的外联最接近社区点名的「drive-by PR」变体——草稿若发而我方叙事面已不走 codelore --llm，本质=向对方索取我们已不再消费的数据。D-053 已定型事实面：我方叙事=宿主 agent 生成＋kernel checkAllCitations 盖章（generate.ts:97）；codelore explain --llm 仅 env 门控可选 advisory（codelore.ts:276-283）。索取其叙事质量数据的决策价值已被 D-053 结构性清零。失败模式：(b) 照发=外联回复无处消费；(c) 暂缓挂 manual_watch=占 D-041 明示要避免的盯梢预算且激活条件与 D-053 方向相反不会自然到来。冲突排查：零冲突；销项注记须引 D-053 作理由不得静默；codelore.ts:137「LLM 面归 #36 独立票」登记与本销项不矛盾（适配层 env 门控面≠外联 issue）。

### ② 叙事质量评测面时点 → (a) 登记 manual_watch（两源交叉）

先物后尺惯例：RAGAS/DeepEval 官方使用模式全部预设「先有跑通管线后建评测 suite」，DeepEval 以 pytest 用例形态包在既有管线之上——无一框架预设「无被测对象先立评测面」。本轮叙事层被评测对象（宿主 agent 叙事段）在 #50 落地前不存在，先立评测面=评测空气。Trigger-gated Closure 词条＋D-041 manual_watch 三态纪律恰为此形态设计。失败模式：(b) 随 #50 内嵌=被测对象与验收判据同票自写自评，评测独立性丧失（κ 校准无从谈起）；(c) 永不评=与 D-053⑤「叙事记 model id 可溯」脱钩——可溯性若无评测面收割落地后即成死字段，且违背原预设「公开加分项」定位。冲突排查：零冲突；κ 校准飞轮原预设（research.md §4）登记暂缓面即显式安置非遗弃。

### ③ anysearch-cli kernel 迁移封口 → (a) 确认封口（两源＋实物）

实物面：sufficiency/gap/claim 归因语义已吸收进裁决协议＋checkAllCitations（generate.ts:97,152）＋evidence_threshold_met（generate.ts:236,591）；代码零迁移。strangler fig 治理文献（catapult.cx＋catio.tech＋oneuptime 三源交叉）：迁移/退役核心判据=消费面承接完成（「route traffic to the new implementation」），非「旧实现是否被搬运」；「without clear ownership and retirement criteria, façades/adapters become permanent technical debt」——不显式封口则 BOM#6 变无人认领永久挂账。失败模式：(b) 代码级迁移=为已完成的能力追加零价值工作（temporary architecture becoming permanent 反模式），且与 D-056 repomix 三源论证同构不可行。冲突排查：零冲突；与 D-056④ 退役登记纪律同构——核销注记写明「语义吸收≠代码迁移」判据；research.md §7.2「直接迁移」属原预设档案非规范面，照循 D-056 先例（本体不改裁决记账）。

### ④ sufficiency 补查回路归属 → (a) 归宿主 agent（三源交叉含两份官方一手档）

NVIDIA AI-Q Blueprint Deep Researcher 官方档（已读原文）：内部流程图明示「Orchestrator: Analyze gaps and identify follow-up queries」在 orchestrator（agent 层），检索执行在 researcher subagent，无任何 gap→re-query 逻辑下沉到数据/kernel 层。Orkes Deep Research Agent 官方档：review_coverage→sufficient!==true→loopCondition 补查循环由 workflow 编排层驱动（DO_WHILE evaluator），编排本体是 agent 编排器不是检索 kernel。agentic RAG 通论（mastra.ai 已读原文＋lyzr/zbrain 交叉）：Corrective/Self-RAG 全谱系「evaluate→refine→re-retrieve」回路皆归 agent。失败模式：(b) kernel 建 reround=kernel 越权承担 orchestration、破坏 verdict_gate 单一职责；(c) 暂缓=CONTEXT「Sufficiency Gate」词条已写 GapRequest 补查轮、归属悬空=名实分离。冲突排查：零冲突——词条现文已隐含 agent 侧动作（「发起 GapRequest 补查轮」），(a) 是落点确认非改向。

## §3 对比矩阵

| 项 | 推荐 | 关键判据 | 若选错的失败模式 | 冲突结论 |
|---|---|---|---|---|
| ① 外联 | (a) 销项 | pull→pull 惯例＝先有真实拉动再外联 | 照发=drive-by 变体；暂缓=占盯梢预算 | 与 D-053③ 零冲突；codelore.ts:137 env 门控登记无耦合 |
| ② 评测面 | (a) manual_watch（触发器=#50 落地） | 先物后尺：RAGAS/DeepEval 预设被测管线在先 | 内嵌=自写自评失独立性；永不评=model id 成死字段 | 零冲突；复用 D-041 五要素纪律非新机制 |
| ③ kernel 迁移 | (a) 封口核销 BOM#6 | 退役判据看消费面承接非代码搬运 | 代码迁移=零价值重复工作 | 与 D-056 同构零冲突 |
| ④ 补查回路 | (a) 归宿主 agent | AI-Q/Orkes 官方：gap→follow-up 在 orchestrator 层 | kernel 建=越权破坏单一职责；暂缓=归属悬空名实分离 | 零冲突；词条现文已隐含 agent 侧动作 |

## §4 执行落点建议（入整理环节）

- ①③ 账本各行落盘（销项/封口，引 D-053/D-056 同款注记纪律），非删行 provenance 可反查；
- ② registry 登记 manual_watch 项（五要素齐：标记＋责任人＋复审时点=#50 落地＋验证方法＋确认记录占位）；
- ④ 随 D-053② rubric references/ 落盘时在 strategy-questions.md 写「证据不足→经 MCP 补查」程序段，kernel 不新增 reround 回路；
- 全部四项在账本注记点名 ADR-0013/0014/0016 无冲突，不静默改向。

## §5 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | OSSAlt OSS 贡献指南 | ossalt.com | Community | ① 外联时机惯例；drive-by PR 变体警告 |
| 2 | niteagent.com RAG 评测管线指南 | niteagent.com | Community | ② 先物后尺：RAGAS/DeepEval 预设既有管线 |
| 3 | TruLens/RAGAS/DeepEval 对比 | 对比文 | Comparative | ② 评测框架使用模式 |
| 4 | oneuptime.com strangler fig | oneuptime.com | Community | ③ 消费面承接=迁移完成判据（已读原文） |
| 5 | catapult.cx 遗留现代化 | catapult.cx | Criticism | ③ 无退役判据→永久技术债（已读） |
| 6 | catio.tech strangler fig 实践指南 | catio.tech/blog | Criticism | ③ temporary infra 变 permanent（已读） |
| 7 | NVIDIA AI-Q Blueprint Deep Researcher | docs.nvidia.com/aiq-blueprint/2.0.0 | Official | ④ gap→follow-up 在 orchestrator 层（原文已读） |
| 8 | Orkes Deep Research Agent | orkes.io/content/devguide/ai/cookbook | Official | ④ 补查循环由编排层驱动 |
| 9 | ZBrain agentic RAG | zbrain.ai/agentic-rag | Community | ④ Corrective RAG 回路归 agent |
| 10 | mastra.ai/lyzr.ai agentic RAG 通论 | mastra.ai（已读原文）＋lyzr | Community | ④ evaluate→refine→re-retrieve 归 agent |
| 11 | 本地：generate.ts/codelore.ts/33-gate-registry/CONTEXT/ledger | 本仓 | — | 冲突排查底座 |

## §6 信息缺口

- 「语义吸收核销原预设迁移项」的逐字同构先例无公开一案一议——strangler 治理文献三路外推（置信高）；
- κ 校准飞轮的工业级实现细节（judge 校准样本集形态）留待触发器激活时再调研。

**一句话裁定**：四小项全 (a)——①销项（引 D-053 注记）②manual_watch 登记（触发器=#50 落地）③封口核销 BOM#6（「语义吸收≠代码迁移」）④归宿主 agent（rubric 写补查程序、kernel 只判 insufficient）；全部与本仓 current 决策零冲突，执行落点=整理环节。
