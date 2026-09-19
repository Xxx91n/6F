# R23-Q4 atomcode 调研题面——Bot 占比行终裁：S5 定稿还是改挂 S4

## 问题

本仓 upstream→dimension 映射表（docs/upstream-dimension-map.md v0.1→v1.0 定稿流程，D-078/D-080/D-081 已裁骨架/接线/review 行）有一行：

| github_rest.pr_metadata（Bot 占比切片） | bot 参与密度 | S5 | 措辞锁「平台声明的 Bot 身份」 | S4 备选挂追问留票，下轮可再裁 |

关键事实：

- **Bot 占比 fact 已实产**（与 review 行本质差异）：pr_metadata 含 per-PR Bot 判读（user.type==Bot＋login [bot] 后缀双检，ADR-0020 最小契约内、措辞纪律「平台声明的 Bot 身份」不自建启发式）——有数据形状可裁；
- 维度语义（CONTEXT.md）：S4=Evolution Direction 演化方向（趋势/方向信号），S5=Ownership Boundary Fit 所有权边界匹配（人机/协作归属与声明边界拟合）；
- 「S4 备选可再裁」是同型裸挂尾巴——无自然事件锚可挂（review 行锚=面激活机检事件，Bot 行无等价物）；
- D-081④ 刚立判据：同一切片喂两维=双计数泄漏（双挂选项已被排除逻辑覆盖）；
- S4 归属论据：自动化采纳方向=演化信号；反论据：窗口快照占比不是趋势量——纵向趋势派生才是另一个 fact。

问题：本行怎么裁才算 v1.0 定稿？

## 候选

(a) 终裁 S5 移除备选尾巴：bot 占比=交付行为体的人机构成=所有权边界直白归位；备注封边「S4 归属仅限未来纵向趋势派生 fact」；
(b) 改裁 S4：自动化采纳=演化方向信号；
(c) 双挂：已被 D-081④ 排除；
(d) 事件锚化挂起：无自然锚=裸挂违 D-035；
(e) 他径。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-081：重点 **D-078** 行形制+Bot 行原文「措辞锁+S4 备选」／**D-081** ④双挂排除判据+同型裸挂警示／**D-080** 定稿流程／**D-048** ADR-0020 措辞纪律「平台声明 Bot 身份」／**D-035** 不得裸挂／**D-047/D-054** 切片归属）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（0004 五维语义／0020 Bot 措辞纪律）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（S4/S5 词条原文）；
4. 实物：docs\upstream-dimension-map.md v0.1 ②节 Bot 行原文＋engine\src\upstream\github-rest.ts（Bot 双检产出实况）；
5. **工业界成熟心智模型（重点）**：bot 参与/自动化占比指标在 CHAOSS/LFX/DORA 的维度归属先例（归 Community/Bot 检测类 vs Development/交付类 vs 独立 automation 类——bot activity 被归哪类 focus area）、「快照窗口统计量 vs 纵向趋势量」在维度模型里的归属判据（cross-sectional snapshot 能否算 evolution/direction 信号的工业处理）、ownership/boundary-fit 类维度的典型收纳信号集（S5 类维度在成熟模型里吃什么）、CHAOSS bot-detection 专项 metric 的分类归属、指标快照 vs 趋势在 maturity model/health score 里的分层先例；
6. 给出推荐与理由＋失败模式＋落地形态（终裁则行措辞+封边备注；改挂则准入条件措辞）；
7. 显式核查与本仓 current 决策的冲突面（特别：D-078 Bot 行原文「S4 备选挂追问留票」——终裁移除备选是否构成对该原文的实质收窄需要注记；D-048 措辞纪律边界）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
