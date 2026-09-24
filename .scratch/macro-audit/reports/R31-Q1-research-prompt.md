# R31-Q1 深调研题面：字段病态统计的环境稳定性——「观测仪器方言」是否应计入「审计对象字段病态」

## 本仓背景

产品=宏观+微观工程内容审计（git 历史→审计报告）。立身之本=字节级确定性：同仓库→同 facts/报告，golden 逐字节比对验收。已定（勿推翻）：append-only audit_fact SSOT；上游适配层+防腐边界（raw 上游语义不出边界）；quarantine 字段级病态隔离引擎——intake 契约层分类器对每字段实例判三态 clean/normalized/quarantined，统计入报告 Intake Health 节，恒等式 total=clean+normalized+quarantined 可库内重算；reason code 受控词表含 normalized_tz_offset；normalized 桶立法意图=「+00:00→Z 类可确定性归一化漂移」的诚实计数（防标记疲劳不打告警印记）。

## 实证缺陷（本问）

采集 git log --format=%cI 时：git<2.45 输出 +00:00，git>=2.45 输出 Z——同一 commit 对象字节完全一致，差异 100% 产自 git 格式化器的版本方言。当前分类器执行 s.replace(/+00:00$/,"Z") 后以 s!==trimmed 判 normalized：→ 同仓库在 git2.39 宿主 Intake Health 计 clean=0 normalized=1、在 git2.55 宿主计 clean=1 normalized=0 → 逐字节 golden（于 git>=2.45 生成）在旧版 git 宿主必 FAIL。即「审计仪器版本」漂移被计进「审计对象字段病态统计」。

候选定性：
- **(a) 真缺陷=范畴误置**：+00:00 vs Z 是上游工具方言（观测仪器属性），非仓库自载病理（对比 %an 输出 " INDIA"=commit 对象内真病态）；方言吸收职责应归防腐边界层，字段病态统计只数主体自载异常——修复方向=边界层先行方言归一，分类器只见规范流；D-100② normalized 立法例须 scoped revised；
- **(b) 真缺陷但病灶在 golden/环境面**：分类语义不动，Intake Health 统计移出字节比对面或 golden 按环境分版——症状修非范畴修；
- **(c) 非缺陷**：quarantine 是输入确定性函数（账本明立），输入随环境变输出随之=对环境的诚实披露；O2 断言改环境知情即可——保留分类语义零 revised。

## 调研任务

取证工业界成熟心智模型并给推荐+理由+各候选评估+冲突核查+来源清单+置信度+信息缺口：
① 数据质量/DQ 工具的「方言 vs 病理」区分——Great Expectations/dbt tests/Deequ/Informatica 等是否区分「连接器/格式层归一化」与「数据值异常」；字段级质量统计中 canonical-equivalent input（语义等价的拼写差异）计 clean 还是 anomaly 的通行语义；
② 防腐边界层职责先例——anticorruption layer/adapters 对上游版本方言的吸收职责（same logical content, different wire spelling 归谁）；EDA/ETL 中 schema-on-read 归一化与数据质量判定的分层惯例；
③ golden/snapshot 测试的跨环境确定性惯例——成熟项目如何处理工具链版本导致的输出漂移（git 自身测试套件对不同版本的 fixture 策略、snapshot testing 环境敏感性处置、reproducible-builds/hermeticity 对「同输入同输出」的环境定义）；「same repo audited on different tool versions→different report」是否被行业视为产品级缺陷；
④ 遥测/观测性领域先例——OpenTelemetry/观测系统中「仪器元数据（instrument/resource attributes）」与「主体测量值」的分离惯例；审计/合规产品是否把采集环境元数据（collector version/tool dialect）作为独立披露面而非主体测量；
⑤ 规范化计数语义——Unicode NFC/NFKC、时区等价形（+00:00 vs Z vs UTC）、大小写等价等 canonicalization 场景中「改写发生了」这件事在审计日志/质量统计中如何计：honest-record 意图 vs 环境噪声污染的张力有无先例解法（如分「规范化计数」与「病理计数」两轴）。