# R28-Q18 深调研题面：quarantine 路径的测试/回归覆盖载体（合成病态 fixture vs 真仓病态样本）

## 本仓背景

审计产品 quarantine 引擎：reason_code v1 四族（anchor_head_date_malformed/normalized_tz_offset/unclassified_field_anomaly/oversize，D-119）＋恒等式断言（D-116）＋strict 门禁（D-110）＋parity 矩阵（D-118）＋报告呈现（D-114）。现有验证面：git/git 真仓回归腿（真实病态=INDIA commit badDate 族，覆盖不可控）＋NN-check 守卫脚本＋golden 契约测试＋39/40 独立对照物。本仓既有判据构造纪律：正对照（证管线能响应不计入价值判定）＋真判据＋负对照（D-018）。

## 未裁问题

词表各族与边界条件的可复现覆盖载体：

- **(a) 合成病态 fixture 仓**：构造 malformed commit 对象入测试语料，逐族+边界（恰 N 字节/N+1/嵌定界符/UTF-8 病态）——可编程全覆盖；fixture 进 golden 纪律；
- **(b) 只靠真仓腿**：覆盖取决于上游历史，词表大半族无测试；
- **(c) 单元级 fixture**：字节串喂分类器不构造完整 git 对象——绕过采集/解析链；
- **(d) (a)+(b) 双层**：合成件=可编程正对照，真仓腿=真实病态的构造偏差兜底。

## 调研任务

工业界成熟心智模型取证：① 解析器/采集器测试语料惯例——合成畸形输入 vs 真实语料（crash corpus、citer、W3C parser test suites、git 自身 t/ 测试套件怎么造病态对象——fast-import/手工构造/hash-object --literally？）；② fuzzing 界的 seed corpus 心智模型（合成种子+真实样本混合、corpus 演化）；③ 数据管线测试惯例——synthetic fixtures vs production data samples（GDPR/真实性张力、contract testing 的 fixture 纪律）；④ 「合成构造者与实现共享错误假设」风险的工业界处理（differential/independent oracle 在 fixture 层的对应）；⑤ fixture 的可维护性/腐化惯例（golden file 腐烂、fixture 与实现版本漂移）；⑥ 辩证：(a) 构造错误的 false confidence、(b) 覆盖不可控的实证、(d) 双层成本。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-018/D-104/D-110/D-114/D-116/D-118/D-119、来源清单、信息缺口、置信度。
