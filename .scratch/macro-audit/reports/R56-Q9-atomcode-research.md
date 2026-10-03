# R56-Q9 调研报告 —— per-layer preview→GA 毕业判据框架形态

**降级登记**：atomcode 委托腿（编排会话 b7cd3385＋调研执行会话 28d66602）在发出知识库召回＋三引擎首轮广搜后停滞 6+ 分钟无写入，终稿未产出。抢救物=两会话 tools 字段内已落盘的 4 份检索结果（KB 召回／Tavily K8s／web_search Chrome／anysearch SOC2）＋本会话直接补直读 KEP-1194（PRR 过程 KEP）与 sig-architecture/production-readiness.md 全文。记 degraded 样本同型（D-186）。轮 56 构成比：Q1 真回传（前提作废）／Q2~Q7 半降级／Q8 全降级／Q9 半降级（有抢救物）。

## 1) 本地回顾结论（编排会话已完成的本地腿，tools 输出核验）

- ADR-0017 原文确认：「其余 4 scale 各走独立 preview→GA 漏斗不打包等齐」——**漏斗概念立法在案，出口端判据从未定义**，缺口属实。
- CONTEXT 暴露梯度词条：Stage-0/1/2 是**暴露/营销面**判据（capability 5/5＋fresh-clone＋GAP-HOST-01＋findings 分诊＋30 日静默窗）——判据对象是「产品能不能更大声」，非「单层成不成熟」。
- docs/versioning.md L9：产品 1.0=schema 冻结＋已接适配器全过确定性验收——**契约稳定性面**判据。
- D-049 Micro-A DoD 先例：preview **入口**判据=票面内 a~f 验收序列（golden→实跑→基线→failure→披露→desk 核验）——判据的既有载体形态=票面预声明序列，非独立判据文档。
- KB 存量召回（本轮）：R56-Q2 报告段（preview=用户可达交付面五源交叉＋K8s「never graduate」合法终态先例＋Since/Until 机检账面）；SLO 三层结构段（SLI 类目固定／SLO 数值场景定的先例已在库）。

## 2) 工业界心智模型（三引擎抢救物＋直读）

### 支柱一：K8s KEP —— 「类目固定／判据自定／外部评审闸」三层结构的正典

KEP-1194＋production-readiness.md 直读定谳：
- **判据类目是框架强制的**：kep.yaml/KEP README 必须含 test plan、PRR 问卷、graduation criteria 段——**没填毕业判据段的 KEP 连 implementable 都进不了**（Enhancement Freeze 硬闸）。类目缺失=结构性拒绝，这是「先立类目」的最硬先例。
- **判据数值/内容是逐特性自定的**：KEP-1194 原文「it leaves that criteria up to the KEP authors and approvers to define」——类目归框架、内容归特性作者、**闸归第三方评审**（PRR 团队＝SIG 外的「outsider view」，原文明言其价值在「识别 SIG 内部人会漏掉的项」）。
- **毕业判据可演化不溯及**：判据随里程碑 PR 更新（latest-milestone/milestone struct 逐段记录），走 PR 评审改判据=光明正大的修订面，与账本 append-only 链式追加同构——**预声明≠锁死，修订走显式通道**。
- 「never graduate」合法终态先例（KB 存量）：CPUManagerPolicyAlphaOptions 等门显式声明永不毕业——**永久 preview 是合法终态但须显式声明**，直接支撑 (i) 类目内「明示永久豁免/终态声明」行。
- alpha→beta 的典型判据轴（社区 issue #4000＋惯例）：默认可启用→默认开启／测试覆盖／文档齐备／运营可控（可禁用可回滚）——判据轴=「可达性＋验证＋文档＋可运维」四类，与本题候选类目（语料广度≈验证面／披露清洁窗≈诚实标注／适配器验收≈可运维／schema 稳定≈契约面）结构同型。

### 支柱二：Chrome / ChromeStatus —— 阶段框架固定＋逐特性字段必填

web_search 抢救物（new.chromium.org/blink/launching-features 原文）：ChromeStatus 阶段序列固定（Prototype→Dev Trials→Evaluating readiness→Intent to Ship），「few strictly required gates」但**每阶段有 required fields**（3 LGTMs from API owners 等）；Intent to Ship=逐特性在公开邮件列上走判据宣告。心智模型同构：**阶段骨架全局共享，毕业证据逐特性申报，门槛=具名 approver 而非自动满足**——对应本仓「各层 GA 票内申报＋具名裁者」纪律（D-169 具名裁者同型）。

### 支柱三：SOC2/SLO —— 「判据类目 vs 阈值」分离的合规界惯例

- SOC2（anysearch 抢救物）：Trust Services Criteria（CC1~CC9 共性判据）**类目全局固定**，逐企业逐审计期 evidence 自定——「控制目标固定／证据逐案」是审计界已运行数十年的形态，与本产品「判据类目立法／证据值挂各层票」直接同构。
- SLO（KB 存量）：SLI 类目固定（好事件占比／burn-rate），SLO 阈值逐服务逐场景定——「现在填阈值=无据裁定」的反面不是不预声明，而是**预声明到什么粒度**。

### 支柱四：判据轴正交性 —— 层 GA ≠ 产品 1.0 ≠ Stage-2

三面各管一轴（K8s 同型：feature 成熟度／API stability／release readiness 是三组独立判据）：
- **层 GA**=能力成熟度门（这一层的产出物是否可信到摘 preview 帽）——判据对象=层内证据积累；
- **产品 1.0**=契约稳定性门（schema 冻结＋适配器确定性验收，versioning.md L9 已写死）——判据对象=对外契约面；
- **Stage-2**=暴露门（能不能更大声推广）——判据对象=市场/信任面。
(ii)「Stage-2 单层投影」把暴露门判据搬去成熟度门=轴错位，capability 5/5 等判据本身不可单层化（它度量的是全集覆盖）。

## 3) 逐候选辩证

- **(i) 类目先立＋阈值后填**：**支持**——K8s/SOC2/SLO/Chrome 四独立先例同型；类目是结构知识（今天可裁），阈值是经验数据（挂各层票）；ADR-0013 预声明惯例的框架层自然延伸；防「到时改门槛」的立法本意得到兑现。风险=类目清单完备性（漏类目则各层票无类可归）——缓解=类目骨架预声明时允许各层票**追加类目**（修订走显式通道，K8s 判据演化同型）＋「明示永久豁免」行吸收 never-graduate 终态。
- **(ii) Stage-2 单层投影**：**反对**——轴错位（暴露门≠成熟度门）＋判据不可单层化（capability 5/5、GAP-HOST-01 是全集语义）；且 Stage-2 判据消费的是试点 findings——单层没有自己的「findings 分诊残留」语义对应物。
- **(iii) per-layer GA 概念取消**：**反对**——正面撞 ADR-0017「各层独立漏斗」字面（须 ADR 勘误）；且 K8s/Chrome/Azure 分级成熟度全是 per-unit 面，无一先例支持「成熟度只存于产品级」；丢掉中间态=层只能 preview 或等 1.0，preview 帽变永久帽却无声明通道。
- **(iv) 整体挂起**：**反对**——KEP 正面证伪「判据等消费方」：毕业判据在 **alpha 时点**就必须填（数据尚不存在时），判据先于证据是这套体系的设计本意（防 goal-post moving）；挂到 Stage-1 charter=把判据立法推到证据已积累之后，恰是预声明纪律要防的形态。唯一可吸收的核：类目骨架的「追加类目」通道保留 (iv) 的谦逊成分。

## 4) 推荐

**采纳 (i) 类目先立＋阈值后填**，置信度 **中高**（K8s 一手直读＋三先例互证；扣分项=抢救物非完整 atomcode 报告＋类目清单的完备性靠修订通道兜底）。

锐化三件（对 (i) 的精化非新候选）：
1. **判据类目骨架六件**（题面五件＋补一件）：语料广度／披露清洁窗／象限完整度（含明示永久豁免位——K8s never-graduate 终态先例）／适配器确定性验收／schema 稳定窗＋**毕业判据修订通道声明**（各层票可追加类目，修订走显式呈裁非静默回填——KEP milestone struct 演化同型）；
2. **三轴正交成文**：层 GA=能力成熟度门／产品 1.0=契约稳定性门／Stage-2=暴露门——CONTEXT 暴露梯度词条加一行指向即可消层次混淆；
3. **判据载体=D-049 式票面序列**：各层 GA 判据不立独立判据文档，挂各层 GA 票内预声明验收序列（既有载体形态复用，闸=守卫组机检可断定的类目优先——语料广度计数／⚠ 标缺席窗可机检，schema 稳定窗需操作化定义）。

## 5) 与账本 current 冲突核查

**零冲突，零 revised 需求**。(i) 与 ADR-0017（独立漏斗字面兑现）／ADR-0013（预声明流程）／ADR-0015（类目判据走机检可判定谓词，叙事类判据不进闸——D-205 锐化继承）／versioning.md L9（轴正交非替代）／D-162（Stage-2 不动）／D-204（GA 语义构建在 preview=可达面之上，同轴延伸）全部相容。

## 6) 信息缺口

1. 六件类目骨架的完备性自检未做——各层票追加类目通道是兜底，首轮类目清单可在你审阅时增删；
2. 「披露清洁窗」的窗口径（golden 面无 ⚠ 标的时长/次数）未操作化——归各层 GA 票阈值面；
3. Chrome LGTMs 对应的「具名 approver」在本仓映射为谁（用户主权=天然 approver，D-162⑤ 用户闸门同构）——属成文措辞非新裁量。
