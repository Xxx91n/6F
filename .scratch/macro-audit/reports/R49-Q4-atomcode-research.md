# R49-Q4 调研报告 —— 微修处置裁量：探测面守卫的 false-green 危险方向修复 vs 缓挂

**执行方式说明**：atomcode CLI 深调研在后台运行未归返（未杀进程——其结果落库后可 ctx_search source:atomcode 补强）；本报告由本会话三引擎直调（Exa/Tavily/AnySearch）＋知识库召回（code-vulnscan FP-filter、Mozilla xfail、Sourcegraph、Google eng-practices）综合成报，原文核验多件。

## 1) 执行摘要（Tl;dr）

**推荐候选 (i) 双修小批量，置信度：高（~85%）。** 工业界心智模型一致支持：漏报（false-negative）类守卫缺陷是静默高危向（"false negatives are silent and carry the higher risk"——Cyberhaven 原文），修复又便宜（移植本仓已验证例程），AR 缓挂五要件成本≈修复成本，故 AR 严格劣于修——不是「惯例性禁止缓挂」，而是**被支配选项（dominated option）**。F4 虽是误报安全向（缓挂在业界合法），但修复便宜且存在「文档声称覆盖而实现不覆盖」的名实缝（truthfulness gap），缓挂反而更贵。双修进一个微修批（一个收口工序），但按本仓 D-139/D-140② 纪律各走独立语义 commit。

## 2) 对比矩阵（四候选）

（索引节存在——正文未逐字召回；判定已并入逐候选裁决与推荐。）

## 3) 分点结论（工业界心智模型）

**① 漏报 vs 误报的方向分级——漏报是危险向，业界口径高度一致（高置信，三源+）。**
- Cyberhaven（安全运营，全文已读）："False positives are immediately visible and disruptive. **False negatives are silent and carry the higher risk**: they allow actual exfiltration or policy violations to go undetected." 且高误报率经由 alert fatigue 制造漏报风险。
- 检测工程惯例（Taggart Tech 检测矩阵）：false negative 对应动作是 "you're missing a rule"——必须补的缺陷类；误报对应动作是 tune/suppress。
- 学术面：arXiv 2408.13855（PMD/SpotBugs/SonarQube 350 个历史 FN/FP issue 实证）——FN 与 FP 都被开发者作为确认并修复的 bug 对待：静态分析工具自身的漏报缺陷是正常缺陷流不是「接受项」。
- 本仓知识库同构：code-vulnscan false-positive-filter skill 明文 "The cost of a false positive: erodes trust... **The cost of a false negative: a real vulnerability ships.**"

**② 守卫/测试基建自身缺陷的优先级——「假绿即失效」是高优先类（高置信，多源）。**
- 测试基建文献（Total Shift Left、Sauce Labs、Keploy）共识：测试/守卫的假信号（含假绿）比没有测试更糟——"A flaky test is worse than no test at all"，mask 真缺陷并腐蚀对整个套件的信任。F3 的「注释吞行即吞真实违规」正是假绿：守卫在最能骗人的时候（显示绿）失效。
- 但注意区分：F3 是 **latent defect**（当前绿、无已知触发输入）非 active 失效。潜伏缺陷的业界处置（Mozilla xfail 管理惯例）：已知缺陷必须挂可核验的哨兵（bug 号）＋定期盘查钩——恰与本仓 D-169/D-171 五要件＋sentinel+盘查钩同构。即：**缓挂不是非法态，但缓挂的合规成本（五要件）必须真实支付**——题面已确认该成本≈修复成本，故缓挂纯亏。

**③ 同型反模式普查——有明确先例支持主动全肃（中高置信）。**
- Sourcegraph（codebase-scale 修复文，全文已读）："one insecure pattern becomes forty insecure patterns"——同型反模式任其复制是规模化腐化机理；修复方法论=root-cause 修复一次性肃清全部实例而非逐例打补丁。
- 反模式文献（dev.to/freecodecamp）："changes must also be propagated across all the other locations where the code was pasted"——修一处留一处=留雷。
- **本仓自身的先例更强**：A18 初版 regex 缺陷已实证造成真事故（75a-check C2 真败＋计数失配），修复后 d179-check 仍保留同型手搓正则——说明上次修复没有做同型普查。这次补上普查（对 40+ check 手搓注释剥离/字符串处理正则做一次有界 grep 扫描）成本极低且消除复发面。

**④ 小修打包 vs 单独修——「一个工序、各自独立变更」是惯例（高置信）。**
- Google eng-practices small-CLs："the right size for a CL is one self-contained change...addressing just one thing"；但 small cleanups 可搭车入相关 CL。对应本仓：F3、F4 是两个自足小修各走独立 commit（D-139/D-140②），但共享同一个微修批工序（一次预声明＋一次守卫组收口）——正是 D-177「声明面按变更大小比例化」立法预设的形态。
- 业界 batch-fix 惯例（review-fix）："High: batch similar fixes together"——同为守卫微修、同批收口，打包合理。

## 4) 四个特别裁决

**① false-green 探测面缺陷是否惯例性不可缓挂？**——裁决：**不是绝对禁止，但在本案参数下不可缓挂**。AR 是合法封闭态（D-169 三处置之一，业界 risk register 同样允许 accepted risk），但 (a) 漏报向缺陷接受须证明补偿控制存在——而守卫本身就是补偿控制，守卫自身失效时「补偿控制」无从谈起（自我指涉悖论：用一个可能吞行的守卫当自己缺陷的补偿控制不成立）；(b) D-171 到期形态二分下它属「补偿控制存续承载类」→强制 ≤90d 双锚，登记＋到期复审成本≥修复成本。结论：修。

**② false-red（F4）缓挂 AR 是否合理？**——裁决：**合法但劣于修**。误报缓挂在业界有充分先例（suppress/tune/tag-and-monitor 惯例，CardinalOps："suppression is smarter than silence"）。但本案 F4 有两个加重项：(a) 名实缝——文档声称覆盖 shell 式 '#' 注释而实现不覆盖，这是真实性缺陷而非单纯误报，缓挂=让已落盘文档持续说谎；(b) 修复便宜。两者叠加使 AR 成本>修复成本。结论：修。

**③ 同型普查是否主动全肃？**——裁决：**是，且本轮就该做**。Sourcegraph 规模化修复方法论＋copy-paste 反模式传播惯例＋本仓 A18→d179 实证复发链三重支持。普查范围有界（grep 手搓注释剥离/引号处理正则 across NN-check 集），命中即修、未命中登记一句「普查已做零命中」即可（账行增量，D-144①④ 随行）。

**④ 微修批打包边界**——裁决：一个微修批＝{F3 修＋F4 修＋同型普查（有界）}，批内各自独立 commit＋各自紧凑预声明（D-177 比例化），批走一次守卫组收口（D-149 升格后判据：guard-all-run 全量＋红集⊆known-red manifest）。

## 5) 冲突扫描（与本仓 current 决策）

| 决策 | 冲突检查 | 结论 |
|---|---|---|
| D-169/D-171（AR 五要件＋到期二分） | 候选 (ii) 的 F4-AR 若立，属补偿控制承载类→≤90d 双锚＋具名裁者；成本≈修 | 不冲突但被支配；支持修 |
| D-177（预声明验证包，比例化） | 双修各须紧凑预声明先行 | 兼容，声明面小 |
| D-181（勘误通道，刚立法） | 实施中若扩面（如普查发现第三处同型）走 D-181 | 兼容，预留通道 |
| D-180（收口 commit 对，刚立法） | 守卫修 commit 的收口形态须按 D-180 对 | 兼容 |
| D-175②（工作面序） | 微修批插入位次须遵工作面序 | 不冲突 |
| D-144①④（账行↔编年随行） | 普查零命中也要留账行 | 兼容 |
| D-140②/D-139（分 commit 纪律） | F3/F4 各独立语义 commit 禁搭车；不触 engine/dist（check 件在 .scratch） | 兼容，无 bundle 义务 |
| D-179（减负包语义） | F3 正是 d179-check 自身——修复即强化 D-179 的守卫；修后须复核该 check 断言语义未被改动 | 兼容，注意修后自证 |

## 6) 推荐＋置信度

**推荐候选 (i) 双修小批量＋附带同型普查**，理由链：漏报向守卫缺陷是业界公认高危静默向①＋修复便宜使 AR 成为被支配选项②＋名实缝使 F4 缓挂贵于修③＋同型普查有本仓实证复发链支持④＋打包形态与 D-177 比例化预声明立法正交兼容。**置信度：高（~85%）**——扣分项：F3 漏报窗口的实际可达性（何种注释形态触发吞行）未做可达性实测，属 latent 非 active。

**缺口如实标位**：
1. atomcode CLI 深调研仍在后台运行，其结果落库后可补强来源面（尤其「守卫失效型缺陷优先级」的更直接文献）；
2. 工业界无「守卫自身的漏报缺陷优先级」的成文标准——本结论由安全检测（FN>FP）＋测试基建（假绿 mask）两条类比链合成，非单一权威条文；
3. F3 修复后的等价性验证（新例程与旧正则在现 fixtures 上行为一致、且在吞行注入 fixture 上分出红绿）是 D-177 预声明包应覆盖的验证面，本轮未设计具体 fixture。
