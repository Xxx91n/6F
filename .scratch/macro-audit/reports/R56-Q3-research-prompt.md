# R56-Q3 调研题面 —— preview 法理边界裁定：Macro-C/Micro-A 名实缝处置

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景（前提已勘误——以本段为准）

产品=宏观+微观工程内容审计（5 scale），分发=Agent Plugin（ADR-0008），发布=Preview 分级漏斗（ADR-0017「preview 标注诚实是决策本体非装饰」；D-054「能力矩阵措辞收窄与立票同票绑定」纪律）。

R56-Q2 已裁子枝序 B3→B1→B2→B4→B6（D-203），本题为 B3 本体。R56-Q2 调研已钉死法理共识：preview=用户可达交付面（GitHub SLA/Iterable Beta/.NET/Azure/K8s feature gates 五源交叉），工件存在不算。

名实缝实测（代码级实证）：
- Macro-C preview 产物=.scratch/architecture-recovery/reports/38-macro-c-preview.mjs（29KB 自含脚本；纯 node builtins＋_lib/env-contract.mjs；**零 engine 模块复用**；内联 shell git＋直写 DuckDB facts＋内联建报告；纯本地 git 考古**无外部依赖面**）
- Micro-A preview 产物=同目录 48-micro-a-preview.mjs（44KB 自含脚本；同样零 engine 复用；含 fetchDiffArtifact/cassetteFetcher——依赖宿主 API diff 工件面，需适配器硬化）
- 对照：Macro-B/Micro-B 已产品化（engine/src/audit 一等命令＋file-card 面），engine/src 中**不存在** macro-c/micro-a 探测模块
- 分发物=engine/dist＋skills＋manifests；.scratch 不入分发——用户装插件无法自产 Macro-C/Micro-A 工件

已裁约束（current）：D-034②层序＋③Scorecard 队列纪律／D-054 收窄-立票同票绑定＋「never treat roadmap as shipped」（Atlan/MS Foundry 引例）／D-062 Macro-A DoR-a=前序层全 preview（若 Micro-A/Macro-C 降级则 DoR-a 不再满足或须解释票）／D-121 铺开序归位／D-175 等待期合法工作面序／ADR-0015 量测效度先行（移植件须原语料重校准复跑一致）／ADR-0017 preview 诚实线。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选（共享约束：法理边界句入 CONTEXT 词条；audit.ts 行级修正归执行窗）

- **(i) 收窄披露＋立票绑定**：矩阵降级为 calibrated demo·not in plugin distribution 级披露＋同票立产线化票入队列；连带后果=D-062 DoR-a 计数表改写（门重开口或须解释票）
- **(ii) 全产线化**：两管线移植插件一等面（真移植非薄封装；原语料重校准断言复跑）；多周工程批，4/5 名义原样保住
- **(iii) 分层建制**：preview 内立两级（productized preview／calibrated demo）＋Since/Until 式账本列（K8s graduated 表先例）；措辞面同 (i) 但 taxonomy 成文
- **(iv) 混合非对称**：Macro-C 产线化（纯本地最便宜真移植）＋Micro-A 收窄立票（适配器硬化面更重）；矩阵=3 产品化 preview＋1 demo＋1 absent，每行名实严格一致但同类声明两级读

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别注意 D-054 收窄-立票绑定纪律、D-062 DoR-a 计数语义、ADR-0015 效度先行对「移植重校准」的要求；
2. **工业界心智模型为重点**：名实缝处置的成熟先例——产品宣称收窄/降级的披露形态（Google deprecated labs、feature 回退声明、K8s Graduated/Deprecated 表的 Until 列纪律）；「宣称先行、交付后补」vs「交付先行、宣称保守」两条路线的代价结构（reputational debt / capability lag 文献）；demo→product 移植的校准失效风险（measurement drift on port）；分级标签 taxonomy 成文的成本收益（K8s alpha/beta、Azure 两级 preview）；非对称处置的同面两级读是否被惯例接受（混合成熟度矩阵先例——OpenFeature flag 矩阵、OSS 组件分级）；
3. 辩证要求：逐候选给支持与反对论据；(i) 的 DoR-a 连带后果须展开（门重开口 vs 解释票两条支路的先例）；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
