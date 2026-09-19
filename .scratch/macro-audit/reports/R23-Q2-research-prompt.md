# R23-Q2 atomcode 调研题面——upstream 接线票立项时机与「PR 合入」依赖语义解耦

## 问题

本仓 Macro-B 上游接入双轨制（ADR-0020）：防腐层先行→消费映射裁定居中→接线最后。D-078⑤ 已定序「后续实施轮映射表 PR 合入→接线票（COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费）以映射表合入为票间依赖」。

现实状态：

- 映射表 docs/upstream-dimension-map.md v0.1 已 commit 入仓（设计票 #68 闭环），但**全栈零 push**（用户闸门——分发面动作未授权）——字面读「PR 合入」永假，接线票被分发闸门绑架；
- 依赖本意：映射**定稿**先于接线（防 dimension 指派返工）——评审是本地可完成动作，push/PR 是分发面闸门动作，可解耦；
- **定稿欠账六项全决策面**（票面已登记）：review 覆盖行「S5↔S4 双挂待采后裁定」／Bot 占比「S5 已挂、S4 备选可下轮再裁」／映射表落点 vs quadrant-rubric 并面／LFX 权重列补读／#47 九类事实原文复核（明记接线票立票前）／ADR-0020 全文复读；
- 串行纪律现状：返工轮全消化（#69 闭环审计 PASS）——D-015「校准收敛后才扩面」前置已满足；
- 接线面实况：codelore=本地二进制无凭据门槛；github-rest=需 token＋网络（opt-in 面）——可分别接线或捆绑一票；
- 裁决面消费机制待设计：descriptor dimension:null 保留（防腐层），映射=业务语义在裁决面执行——「裁决面消费按表归位」的具体形态（adjudication 代码读表？映射编码为配置？硬编码进 quadrant 消费逻辑？）未裁定。

问题：接线票的立项时机与「PR 合入」依赖语义怎么裁？定稿欠账归 grill 决策面还是实施票内？

## 候选

(a) 下实施轮立接线票，票内首任务=map v0.1→v1.0 定稿——六项追问全压进实施票，工程与裁决混票；
(b) 本轮 grill 裁定稿面，定稿后立纯工程接线票——评审归决策面、实施归工程，六项追问逐题裁；
(c) 字面读 D-078⑤ 等 push+PR 真合入——接线无限挂起被分发闸门 hostage；
(d) 缓挂——先消化 D-079 落地＋judgement 项＋真机 MCP 验收，upstream 排再下一轮；
(e) 他径（如：codelore 先行 github-rest 后至的分批接线票）。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-079：重点 **D-078** ⑤⑦ 依赖原文+五维不动／**D-015** 串行校准量测有效先／**D-020** 上游双轨／**D-048** github-rest 最小契约／**D-047** codelore 接入裁定／**D-035** 逐面纪律 YAGNI／**D-011** 本地优先 opt-in／**D-024** 复审两字段／**D-079** 恒真族刚立／push 闸门=D-052/D-067⑧ 系列）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 **0020 托管 API 适配器双轨**／0014 防腐界／0004 五维／0009 本地优先／0018 版本编年）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Hosted API Adapter／SWMR Facade／Trigger Sequence／Evidence Gate 词条）；
4. 实物：docs\upstream-dimension-map.md v0.1 全文（双挂行/准入条件列/永久排除/复审字段）＋engine\src\collect\collectors.ts（COLLECTOR_DESCRIPTORS 注册表+descriptor 形制）＋engine\src\upstream\{github-rest,codelore}.ts＋engine\src\audit\macro-b.ts（裁决面消费实况——S1-S5 如何吃 fact）＋.scratch\architecture-recovery\BACKLOG.md（#47 残留+票面形制）；
5. **工业界成熟心智模型（重点）**：「文档定稿 vs 分发合入」的依赖解耦先例（design-doc sign-off vs merge-to-main 的两阶段门——Google design doc 流程/RFC 批准与代码合并分离、ADR status accepted≠merged code）、gate 语义中「条件永假=死锁」的识别与解锁先例、design ticket→implementation ticket 的分解模式（shape-up/pitch→build cycle、steel-thread 评审门槛）、评审欠账归「决策面会议」还是「实施票 DoD」的工程惯例、adapter wiring 的分批接入策略（strangler/逐适配器启用旗标）、映射表机器可读化（doc→config/code）的单源真值模式（doc-as-source vs generated-code-from-doc）；
6. 给出推荐与理由＋失败模式＋落地形态（定稿六项的归属裁＋接线票骨架草案：codelore/github-rest 分批还是捆绑＋裁决面消费机制候选形态＋守卫断言面）；
7. 显式核查与本仓 current 决策的冲突面（特别：**D-078⑤「PR 合入」字面是否需勘误注记**——若调研结论要求把「合入」重释义为「定稿」属语义再解释，须明示是否按 D-070 注记惯例承载还是触发 revised；D-015 串行纪律是否约束接线与 D-079 落地同轮）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计（定稿六项归属＋接线票骨架）；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
