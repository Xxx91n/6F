# R22-Q6 调研报告——上游适配器接 Macro-B 的排期与 dimension 映射先行设计面

- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q6-research-prompt.md
- 置信：高（本地账本原文＋CHAOSS/LFX/SonarQube 三源交叉；三引擎 Exa×3＋Tavily×1＋AnySearch×3，关键结论均≥2 独立信源）

## ① 结论

**推荐 (c) 设计先行、实施排后**：本轮（决策面）即裁定「上游 fact→S1-S5 dimension/quadrant 映射表」并立为设计票（含 codelore dimension 槽位候选），接线实施排在返工轮落地之后。

一句话：**映射裁定是 ADR-0020 双轨制的中间轨「消费映射居中」，本轮走它、下轮接它；dimension:null 不是空槽故障，是防腐层故意留白的正确状态，填补它恰恰只能发生在裁决面而非适配器面。**

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 锐评原案一体化进下一实施轮 | 弃 | 一体化把设计裁定（五维语义扩展）与接线工程绑死同一轮，违 D-035 逐面纪律与 ADR-0014「适配层禁放业务规则」——映射表正是业务规则，塞进接线票会压进适配器层。 |
| (b) 纯串行先消化后接 | 弃（过严） | D-015 串行约束的是量测有效性链（没校准前消费测量无效），映射设计不消费测量结果——纸面裁定可安全并行；纯串行违背「票间依赖=上票真实产物」的 Milestone Serial Slicing 语义。 |
| **(c) 设计先行、实施排后** | **采纳** | 对齐 ADR-0020 三段节奏「防腐层先行、消费映射裁定居中、接线最后」：防腐层已建（#47 done、codelore 已建），中段=映射裁定正是当前缺口；steel-thread 先例支持先钉贯穿契约再逐 use case 铺开。 |
| (d) 缓挂转 Macro-C/Micro-A | 弃 | 锐评三批评成立度中等——github-rest 51 断言已入 smoke 却零消费面是真实资产闲置；Micro-A preview（#48）硬前置就是 #47 消费侧，缓挂让已验收资产持续折旧。 |
| (e) 他径 | 不需要 | (c) 已覆盖。 |

## ③ 工业先例证据（带 URL，均已读原文）

| 先例 | 证据 | 对本题支持 |
|---|---|---|
| SonarQube metric→software-quality 分层 | docs.sonarsource.com software-qualities：rule 关联 quality，analyzer 只产 issue 不自称属于哪 quality | 映射挂规则/判据面不在采集面——(c) 直接依据 |
| CHAOSS metric vs metrics-model 两层 | chaoss.community/kb-metrics-and-metrics-models：metrics 答单问，models 聚合答复杂问 | 单 fact→维度先分类、维度→象限归位在 model 层聚合——与 #51「facts 共享、归属=切片决策」同构 |
| CHAOSS Bot 污染警示 | starter-project-health：Time to First Response/Closure Ratio 仅 primarily driven by humans 时适用；bot 影响多指标 | Bot 双检是 CHAOSS 级量测有效性前提——映射表须把「bot 过滤后事实」与「原始计数」分开映射 |
| LFX Insights 分类纪律 | insights.linuxfoundation.org development：Development metrics include bot actions，其他全类 excluded——全平台唯一显式「同一信号按类别出入 bot」治理 | 同一 PR 元数据在不同 dimension 可采可弃——映射表须逐 dimension 写准入条件非全局开关 |
| LFX 维度=固定四类指标可增 | health-score：四等权 category 固定、指标归属其下 | ADR-0004 五维作固定 category，上游 fact=往里放指标——facet enrichment 不动五维定义 |
| Code Climate 十查归四类 | 10-point technical-debt assessment：底层 check 归纳少量 category＋opposing metrics 防 gaming | 少量 fact→少量维度归位是行业常态；S3 双口径风险需成对 opposing 映射防单边激励 |
| Steel Thread 排期法 | rubick.com/steel-threads/（2023）：先打通最薄贯穿契约再逐 use case 铺开；cutover 一体化是项目失败首因 | (a) 一体化即 mini-cutover；(c) 先契约后铺开是正型 |
| 反例：VS Code Metrics | learn.microsoft.com code-metrics-values：单指标直接映射单维度无中间分层——被 CHAOSS 路线超越 | 警示勿退化 1:1 查找表；允许 fact→(dimension, 准入条件) 多值映射 |

## ④ 落地形态设计

### 4.1 dimension:null 槽位裁定原则

dimension:null 在两 descriptor 里是**防腐层故意留白**（ADR-0014：适配层禁业务语义；映射=业务语义只能落裁决面）。填补方式**不是**给适配器 descriptor 填维度字符串：

- 保留 dimension:null 于上游 descriptor（标注注释「映射见 upstream-dimension-map.md」）；
- 新建映射表=文档面非代码：`docs/upstream-dimension-map.md`（版本化、走 PR 评审，同 #50 rubric 先例），裁决面消费时按表归位；
- 若 CollectorDescriptor 需承载映射可加 `dimension_hints: string[] | null`（多值可空裁决面可覆写）——但不进本轮实施（动 fact schema 牵 A-021 链，本轮建议不加纯文档面）。

### 4.2 映射表草案骨架（候选方案，供下轮裁定——非终裁）

github-rest 九类事实（#47 报告口径）→ 候选映射：

| 上游 fact（github-rest） | → dimension 候选 | → quadrant | 准入条件（LFX 式逐维写明） |
|---|---|---|---|
| pr.list（PR 枚举/吞吐） | S4 演化方向（活动信号） | strategic | 无 |
| pr 元数据·merge lead time | S4 演化方向 | strategic | 仅人类 PR（CHAOSS 纪律） |
| pr 元数据·Bot 占比（平台声明 Bot 双检） | S5 所有权边界匹配（自动化面占位的所有权含义） | strategic | 措辞锁「平台声明的 Bot 身份」 |
| pr 元数据·review 覆盖 | S5（协作治理证据）→ S4 双挂候选 | strategic | review 面=planned 未采，采后裁定 |
| diff 双通道产物 | Micro-A/PR 层消费为主，Macro-B 不直采 | — | D-049 消费链 |
| rate_limit 运行日志 | 不入任何 S 维（遥测面，非项目健康信号） | — | 永久排除，防遥测渗入裁决 |

codelore 槽位候选（对齐 D-035 首批 30 面分族）：

| codelore 面族 | → dimension 候选 | 备注 |
|---|---|---|
| 演化主干 12 面 | S4 演化方向 | #51 behavior 票已裁 churn/hotspot/coupling |
| S3 族 6 面 | S3 门面预算 vs 结构预算 | #51 登记「与 S3 族双口径风险」暂缓——映射表须给成对 opposing 指标 |
| S5 族 12 面 | S5 所有权边界匹配 | authors/top-committers 类属 S5 |
| explain/LLM 族 | S4（假设抽取前置，D-035②） | env 门控不变 |

### 4.3 排期落点

1. 本轮（决策面）：裁定映射表骨架→派生 D-078＋立设计票（BACKLOG 形制同 #51）；
2. 返工轮：R21 九项＋D-073~077 落地（不动）；
3. 后续实施轮：映射表 PR 评审合入→接线票（COLLECTOR_DESCRIPTORS 注册＋Macro-B 消费）以映射表为票间依赖。

## ⑤ 失败模式与治理

| 失败模式 | 治理 |
|---|---|
| 映射硬编码进适配器（业务规则渗入防腐层，违 ADR-0014） | 映射表=文档面＋裁决面消费；descriptor 只放可空 hints；NN-check 加「上游文件无 S1-S5 字样」守卫断言 |
| 1:1 退化查表（一 metric 绑死一 S 维） | 映射行必须带准入条件列；允许多值；复审时点挂 D-024 两字段纪律 |
| Bot 污染跨维泄漏（CHAOSS 警示） | 逐 dimension 准入条件显式写明 bot 出入；沿用「平台声明 Bot 身份」措辞纪律（#47） |
| 遥测面渗入裁决（rate_limit 等运行事实入 S 维） | 映射表设永久排除列 |
| 设计票变僵尸（立了不裁） | 设计票绑定复审时点＋下轮任务书 T 项（D-035 暂缓面「不得裸挂」同款纪律） |
| 防腐层留白被误当 bug 修复 | descriptor 注释补一行「dimension:null=设计留白，见 upstream-dimension-map.md」——唯一可安全顺手做的代码改动甚至可不做 |

## ⑥ 与本仓 current 决策冲突核查表（逐条）

| 决策 | 冲突面 | 裁定 |
|---|---|---|
| ADR-0004（五维定义） | dimension:null 填补是否动 S1-S5 定义？ | **不动**：LFX/SonarQube 先例均为「category 固定、指标向内 enrichment」；映射表是往既有五维放指标；若无维度可容纳的事实（如 rate_limit）走「永久排除」非扩维。 |
| D-020/ADR-0014（双轨防腐） | 映射归属层 | 支持 (c)：映射=业务规则落裁决面/文档面不落适配层。 |
| D-048/ADR-0020 | 最小契约边界 | 不冲突：映射消费 PR 枚举/元数据已采面；review/comment 仍 planned（YAGNI 不因映射而破）。 |
| D-047/#51（D-054） | quadrant 归位规则「facts 共享、归属=切片决策」 | 一致：映射表与该规则同构，行为面先例直接复用。 |
| D-015（串行校准） | (c) 的设计并行是否违串行先例 | 不冲突：串行约束量测有效性链，映射设计不产测量值。 |
| D-073~D-077 | 本轮返工占用 | 不冲突：(c) 恰是把 upstream 从返工轮摘出，只占决策面不争实施带宽。 |

## ⑦ 信息缺口

1. LFX health-score 四类权重化聚合原文未全文核读——聚合公式细节影响映射表是否引入权重列，建议下轮补读；
2. D-073~077 逐字原文只取到部分——其与 upstream 设计票在下一任务书的优先级排序需用户在 grill 现场定；
3. github-rest「九类事实」完整清单以 #47 报告为准——本报告按头注＋锁表口径重构，接线票立票前应以 47-report 原文复核；
4. ADR-0020 原文只读了标题与账本转述，未逐字读 docs/adr/0020 全文。

## ⑧ 建议追问（供下轮 grill）

1. 映射表落点选 docs/upstream-dimension-map.md（版本化 PR 评审）还是并进 #50 的 quadrant-rubric.md（rubric 面统一）？——两处都合 D-035，选哪个影响 rubric 版本化节奏；
2. dimension_hints 字段要不要进 CollectorDescriptor schema（v0 13 字段外第 14 字段）——加字段即动 fact schema 牵 A-021 链，本轮建议不加纯文档面，请确认；
3. Bot 占比归 S5 的候选映射是否认可？还是归 S4（自动化=演化信号）？——映射表唯一真语义争议点，CHAOSS/LFX 各有先例可引；
4. rate_limit 运行事实「永久排除出 S 维」是否成立，还是进报告运行日志披露段即可。
