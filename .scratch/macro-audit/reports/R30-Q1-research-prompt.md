# R30-Q1 深调研题面：加固 epic 收口后的下一设计焦点选型——quarantine 收尾域 vs 主线尺度扩展 vs 治理面

## 本仓背景

产品=宏观+微观工程内容审计（git 记录健全的项目），设计五尺度：Macro-A 跨仓战略审计／Macro-B 单仓四象限审计／Macro-C 演化考古审计／Micro-A PR 级 diff 审计／Micro-B 文件级审计。架构=确定性 CLI kernel＋DuckDB fact SSOT（append-only）＋MCP 只读面＋skills 方法论壳＋报告模板层＋Agent Plugin 分发；Hub-of-Facts with Federated Adjudication；证据充分性闸门＋provenance/receipt；Preview 分级发布（build-scope≠release-sequence）；0.x 版本纪律＋触发器门控封口（gate registry 53 项）。

当前实建状态：`macro-audit audit --scale` 缺省 Macro-B，其余四尺度=SCALE-NOT-IMPLEMENTED 结构化拒绝（exit 2）——**五尺度仅 Macro-B 实建**。刚收口的大加固 epic=quarantine 引擎（病态上游 git 数据两级处置：契约层三态分类器／独立事件表 quarantine_log／字段实例恒等式 total=clean+normalized+quarantined／逐 commit 事务幂等写／协议崩溃工件／仓级 strict 基线棘轮／Intake Health 报告节／双层对账／39 parity 处置感知矩阵／词表 v1 四族 open-ended），18 条设计决策（D-103~D-120）＋全量实现＋终审 LOOP-2 PASS。

已就绪的下游资产：Micro-A 数据面 github-rest 适配器=锁表 active（PR 枚举+元数据+diff 双通道最小契约已建）；远程 intake（owner/repo|URL→clone cache）已存在；Macro-A 战略象限五维 S1~S5 判定口径已在 ADR-0004 定义；报告共享骨架+scale 切片模式已立法（ADR-0006）。

## 账本已裁的相关边界（供冲突核查，勿推翻）

- ADR-0012 价值验证闭环先行：主干方向=端到端价值闭环优先于广度铺开；
- ADR-0015 序列化校准：量测效度先行（真值表→治理→分级推进）；
- ADR-0017 Preview 分级发布：单层先行+逐层漏斗，构建范围≠发布顺序；
- ADR-0001 五尺度=产品级承诺非 MVP 切片（ADR-0002 无 MVP slice）；
- Trigger-gated Closure 纪律：触发器未发生不提前开工（如 rubric 权重立案待 quadrant-rubric-params-draft 触发）；
- 审计窗建议的 quarantine 收尾项中两项为观察/触发型（strict 首码端到端=等真实新码；CI 腿首跑=调度观察），非可裁设计面；
- 红线：39/40 对照物零分类逻辑引入（SoD）；词表立法=观测驱动非预防性猜测。

## 候选方向（本问=选型）

- **(a) quarantine 收尾域打包**：字段接线扩展序（当前仅 %cI 独接线，扩面顺序+每字段判据立法序）＋strict 立法管线机械面（observed→triaged→legislated→ratchet 票面化）＋parity 矩阵「不同值/可疑一致」枚举格严格化＋完备性续审（上轮 Q19 撞限未答）——真实但薄，部分项为等触发非可裁；
- **(b) 主线推进·下一尺度/面选型**：Macro-A（需多仓 intake+跨仓聚合，S1~S5 已定）／Macro-C（演化考古，复用 git 采集面最近）／Micro-A（适配器已 active，PR 级 diff）／报告消费面深化——产品最大未探设计树；
- **(c) 治理面**：registry 53 项值守复核＋触发器待绑项——行政复核非设计树；
- **(d) 其他**。

## 调研任务

取证工业界成熟心智模型评估选型：① 审计/静态分析/数据质量/度量产品在完成大型可靠性加固 epic 之后的演进排序惯例——广度扩张（新尺度/新覆盖）vs 深度收尾（残余加固面）的权衡模型与实证先例；② 多层级审计/度量产品的成熟路径——单仓级核心稳定后下一个落地层级的常见形态（跨仓聚合型／变更级/PR 级／历史演化分析各自的工业先例产品、落地顺序与前置依赖）；③ 「触发器门控延期项」的拉动惯例——延期项何时该提前拉动 vs 继续等触发；④ 对本产品三候选给出推荐排序+理由（需回应 ADR-0012 价值闭环先行／ADR-0017 单层先行漏斗纪律的指向）。输出=推荐排序+各候选评估+理由+冲突核查+来源清单+信息缺口+置信度。
