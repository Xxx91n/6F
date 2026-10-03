# R56-Q4 调研题面 —— structure 象限解排：S3 双口径消解形态

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale）；Macro-B=单仓四象限评审（结构/行为/供应链/战略），战略象限含 S1-S5 五维（ADR-0004）。

R56 已裁（current）：D-203 子枝序 B3→B1→B2→B4→B6；D-204 preview 法理边界（preview=用户可达交付面；Macro-C 产线化+Micro-A 收窄立票+DoR-a 支路 A 如实计数）。本题为 B1 本体。

双口径矛盾字段级实证：
- S3 Facade-vs-Structure Budget=战略维预算归因读数（维护预算花在门面 vs 结构；证据源=codelore god-classes+抽象利用率+shearing layers）
- S3 族 6 面已接 S3：god-classes/architecture-metrics/dependency-cycles/modularity-violations/instability/architecture-roles（upstream-dimension-map 归位表，注记「s3 族须成对 opposing 准入执行 #51 双口径风险」）
- structure 象限（四象限第一位）=形态健康读数（代码长什么样）——欲消费同族面做不同判读
- D-054 裁定原文：structure 续排队「与 S3 族双口径风险」（两套复杂度口径在报告内自相矛盾的失败模式）；D-054③ quadrant 归位规则=facts 共享、quadrant 归属=切片决策
- 现状：Macro-B 象限面 strategy active（S1+S2）·behavior preview（#51 已接入 codelore behavior 族）·structure/supply-chain queued

已裁约束（current）：D-054 暂缓理由原文＋切片归位规则＋收窄-立票绑定纪律／D-034③ Scorecard 排队不插队（supply-chain 面专用，structure 不适用）／D-080④ 文档单源真值＋裁决面映射常量块／D-084 权重归 rubric 面／ADR-0013 预声明判据三层验收闸／ADR-0015 量测效度先行／ADR-0024 检测器判据在消费位。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选

- **(i) 分层分工成文＋解排**：写死测量/归因两层——structure 象限产形态测量读数（S3 族 6 面原始量+聚合判据），S3 消费同面读预算归因叙事；报告两处读数各挂语义域标签（JSS/EMSE 多指标共存先例）；D-054 暂缓消解→立票解排
- **(ii) 归并不独立成面**：structure 象限位=S3 读数重投影——零矛盾但象限独立性牺牲，四象限变 3.5 象限，战略维借尸还魂进测量位=层次倒挂
- **(iii) 续排**：等 B4 correlation key 或 Macro-A 启动后再议——queued 已是第三久欠账
- **(iv) 判据先行后解排**：先写「口径不打架」机检闸（golden 断言：同仓报告内 S3 与 structure 读数不得生成自相矛盾陈述——ADR-0013 预声明同型），闸成立再裁接入形态
- 助理推荐=(i)+(iv) 复合：分层分工成文＋不打架 golden 闸作解排准入判据

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 D-054③ 切片归位规则射程、D-080④/D-084 映射与权重分离、ADR-0024 消费位判据对「双口径判读归属」的含义；
2. **工业界心智模型为重点**：同数据多判读共存的成熟先例——软件度量领域多口径治理（JSS/EMSE 多指标共存、ISO 25010 质量模型分层=measure vs interpret、SLO/SLI 与 SLI 多用途读法）；「自相矛盾陈述」的检测形态（报告内一致性断言/self-consistency test 先例——如数据质量框架 Great Expectations 的跨指标一致性校验、形式化报告 contradiction detection）；分层语义域标注惯例（metric semantic domain labeling、BI 语义层 metric definitions 单一语义源如 dbt metrics/MetricFlow、LookML measure 定义层 vs derived 层）；象限内 measurement vs interpretation 分层架构先例（SEI CAME、Goal-Question-Metric GQM 范式——GQM 恰是 goal→question→metric 三层把同面读成不同答案的正规框架）；
3. 辩证要求：逐候选给支持与反对论据；「不打架」机检闸的可判定性风险（叙事层面矛盾非数值可比——闸能断言什么粒度？）；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
