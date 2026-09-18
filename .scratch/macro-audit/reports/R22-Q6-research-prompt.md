# R22-Q6 atomcode 调研题面——上游适配器接 Macro-B 的排期与 dimension 映射先行设计面

## 问题

本仓五尺度审计产品的 Macro-B（仓库级四象限审计）fact 采集面现状：

- engine\src\collect\collectors.ts 的 COLLECTOR_DESCRIPTORS 注册表=仅三件（adr-structure／positioning／gitlog）；
- engine\src\upstream\codelore.ts（23KB）：CodeLore 二进制发现＋pin 校验的 CollectorDescriptor 已建成，但 **dimension: null 游离未注册**——字面空槽；
- engine\src\upstream\github-rest.ts（28KB）：GitHub REST 防腐层全就绪（PR 枚举/Bot 判读/diff 双通道/限流纪律/凭据三级探测），但**无 CollectorDescriptor 绑定**、无 dimension 映射落点；
- cli.ts 对 codelore 的引用仅 intake provenance（记录探测结果）非 fact 采集；
- **真设计缺口**：上游 fact→S1-S5 dimension/quadrant 映射表不存在——github-rest 的 PR 元数据（合并速度/Bot 占比/review 覆盖）该喂哪个 dimension 是未裁定设计面非接线工程问题；
- 外部锐评荐言三：「挂满精密仪表的宏观战舰未巡航真实世界」——github-rest/codelore 已写好却未接 Macro-B，批评成立；
- 但 ADR-0009 本地优先下上游是 opt-in 面非核心路径；R21 九项返工＋轮 22 五决策（D-073~D-077）落地未消化（D-015 串行校准先例）；ADR-0020 双轨制=「防腐层先行、消费映射裁定居中、接线最后」既有节奏。

问题：上游接入的排期与先行设计面怎么裁？dimension:null 的空槽填什么？

## 候选

(a) 锐评原案立即接：dimension 映射设计＋接线一体化进下一实施轮；
(b) 纯串行先消化后接：返工轮全部落地→upstream 轮才启；
(c) 设计先行、实施排后：upstream→S1-S5 dimension/quadrant 映射表本轮即裁定或立设计票（决策面先行），接线实施排返工轮后——对齐 ADR-0020 双轨节奏；
(d) 缓挂：上游接入不入下一里程碑，转 Macro-C/Micro-A 尺度面；
(e) 他径。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-077，重点 D-020 上游双轨／D-048 github-rest 最小契约／D-047 codelore 接入裁定／D-015 串行校准／D-035 逐面纪律 YAGNI／D-011 本地优先 intake／D-073~D-077 本轮落地账）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 **0004 S1-S5 四象限维度**／0009 intake 本地优先 URL opt-in／0014 适配器双轨腐蚀边界／0020 托管 API 适配器）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Scale／dimension/quadrant 语义／Repo Intake／opt-in 面）；
4. 实物：engine\src\collect\collectors.ts（CollectorDescriptor/DetectorBinding/COLLECTOR_DESCRIPTORS 注册表形制）＋engine\src\upstream\{github-rest,codelore}.ts 头注与导出＋engine\src\cli.ts L126＋docs\adr\0004 维度定义原文＋.scratch\architecture-recovery\BACKLOG.md（既有票面形制与 #47 上游票残留）；
5. **工业界成熟心智模型（重点）**：repo-mining 工具上游数据→分析维度的映射先例（SonarQube/CodeClimate 的 metric→dimension 分层、LFX Insights/CHAOSS 的 metric-category 模型、GitHub Octoverse/linguist 类信号归类）、「设计先行实施排后」的里程碑工程先例（ADR 双轨/riskiest-assumption-first/steel-thread 模式）、detector/positive-control 消费面与新 fact family 接入的既有工程模式（facet enrichment vs new dimension）、平台遥测 opt-in 边界（GitHub API 数据进本地审计面的 consent/provenance 纪律）、collector registry 的开放-封闭原则落地（新 family 注册的 schema/治理约束先例）；
6. 给出推荐与理由＋失败模式＋落地形态（映射表草案骨架：github-rest 各 fact→dimension/quadrant 候选映射＋codelore dimension 槽位候选——给出候选方案供下轮裁定）；
7. 显式核查与本仓 current 决策的冲突面（特别：D-035 逐面纪律 YAGNI 是否约束映射面扩展／D-011 intake 本地优先下上游 opt-in 面的边界／dimension:null 槽位填补是否动 ADR-0004 五维定义）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计（含映射表草案骨架）；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
