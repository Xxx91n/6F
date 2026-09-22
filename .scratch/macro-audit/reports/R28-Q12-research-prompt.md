# R28-Q12 深调研题面：quarantine 证据在报告的呈现形态（专节+行内排除 vs 全局声明 vs 分离工件）

## 本仓背景（审计面产品 quarantine 建制的最后设计面）

产品=上游 git 数据→审计报告；append-only audit_fact SSOT＋quarantine_log 逐字段事件表（D-106/D-112 disposition 列：quarantined|normalized）；报告=投影（D-106④）；字节级确定性 charter。本问=**人读报告里 quarantine 证据的呈现编排**：逐 SHA 清单放哪、「派生统计须声明排除行」（D-100③）怎么落地、恒等式区摆位、零病态时节渲染语义。

## 现有决策约束（本问不得冲破）

- D-100③ 五件可观测：逐 SHA 清单／reason code／字节回显（截断呈现）／恒等式／比例阈值；「派生统计须声明排除行」义务已签；
- D-112⑤ normalized 行=只计数不渲染 ⚠（存储留痕≠报告噪音）；
- D-111 三面同源投影＋机读块已立；unsupported 报告=证据披露面；
- golden 字节稳定性：节恒在 vs 省略有 golden diff 牵连（T-01~T-07 测试纪律）。

## 选项

- **(a) 专设 Intake Health 节＋行内排除声明双轨**：专节=逐字段恒等式行＋受影响 commit 数＋逐 SHA 清单（quarantined only：sha/field/reason/raw echo）；各派生统计行内联声明排除数（over N-M commits）；零病态=专节恒在渲染「无」（阴性结果自证声明）；
- **(b) 全局一处声明**：报告头一块写完恒等式+清单+排除，metric 行零改动——消费者自行映射排除到统计；
- **(c) 纯行内**：每统计行内联、无专节——逐 SHA 清单无处安放；
- **(d) 分离工件**：主报告恒等式摘要＋独立 quarantine-report 工件——证据与裁定分文件。

## 调研任务

工业界成熟心智模型取证：① 数据质量报告的呈现惯例——Great Expectations/Soda/dbt test 报告怎么呈现 quarantine/排除（专节 vs 行内 vs 分离工件）？② 安全审计报告惯例——SARIF/snyk/trivy 报告里 suppressed/excluded 项的披露形态（就近披露 vs 汇总节 vs 分离文件）？③ 「阴性结果显式渲染」惯例——报告里零发现是渲染空节/显式「无」还是省略？审计报告惯例与工程惯例各自证据？④ 行内排除声明先例——统计/指标报告里「computed over N-M」式脚注的先例与格式惯例？⑤ 分离工件形态的先例与消费体验证据（证据与裁定分文件的成本）？⑥ 辩证：专节冗余风险（报告膨胀）、行内声明被跳过风险、空节噪音 vs 自证价值的权衡。输出=按这五/六角度组织、结论=推荐+理由、冲突核查=对 D-100③/D-106④/D-111/D-112⑤/测试纪律、来源清单、信息缺口、置信度。
