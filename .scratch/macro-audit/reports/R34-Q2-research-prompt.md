# R34-Q2 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表；分发形态=Agent Plugin，ADR-0016；preview 0.x 单维护者）。

## 问题

第三轮外部锐评呈报「文档密度门槛」：23 ADR + 139 条决策账本记录 + 80+ 张 backlog 票据 + ~百份审计 handoff——「让任何外部想要贡献代码的人如同在阅读一套庞杂的法典」。

现状缓冲面：
- CONTRIBUTING.md 已有 31 行诚实 preview 版（欢迎面=bug 报告/文档修正/审计结果报告；review latency 声明；Ground rules 指针区链 AGENTS.md/engine README/docs/adr/CONTEXT.md——风格=指针不重复）；
- registry 已挂 `82-first-external-contributor` 事件绑定触发器（D-130 立法——preview 期外部贡献者实证=零）；
- README.md 已链 docs/adr、CONTEXT.md、decision-ledger。

辩证面（呈报方论点）：事件绑定判据在此或有结构性盲区——触发器只能观测「到达者」，观测不到「被门槛劝退的沉默未达者」（survivorship bias）；锐评者本人=高动机读者也在法典里淹了。反方：preview 期外部贡献者=零实证＋消费面驱动资产纪律（D-138 禁跨宿主 CI 矩阵腿同判据——为不存在消费面预置资产）。

候选处置：
(a) 维持事件绑定——preview 期不预建导览资产；
(b) 最小阅读地图先行——CONTRIBUTING.md 或 docs/ 补 ~15-20 行「必读三件+可忽略面」导览（读法典的顺序而非副本：e.g. README→CONTEXT 词条→ADR 0005/0023，.scratch/ 声明为过程档案面非必读）；
(c) 系统导览层——docs/THE-MAP.md 全景导读。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-130 first-external-contributor 触发器立法、D-138 禁预建 CI 矩阵腿判据、D-139 轻规约不立票判据、D-140 锁面降噪裁定、Avoid/消费面驱动资产相关条款）、docs/adr/ 全部 ADR（重点 0016 分发、0017 preview 发布模型、0003 边界=产品+用法、0012 价值验证环先行）、CONTEXT.md 全部词条（重点 Trigger-gated Closure/Known-gaps/Frankness 系披露词/消费面驱动资产词条）；
2. 工业界成熟落地的心智模型（重点）：开源项目贡献者门槛的成熟处置——「文档太多吓退贡献者」vs「文档太少无法贡献」的两难实证、CONTRIBUTING.md 最佳实践（GitHub 官方 contributing guidelines/opensource.guide）、「curated entry points」式导览惯例（如 Linux kernel「process/1.Intro.rst」、Kubernetes contributor guide、rust-lang 「how to read rustc」式文档地图）、README/CONTRIBUTING/docs 三层的职责分工惯例、preview/early-stage 项目「先声明不欢迎 vs 先铺导览」的成熟判据、沉默未达者/幸存者偏差在贡献者漏斗里的实证研究（FLOSS contributor funnel、first-response latency 对新贡献者留存的影响）；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
