# R28-Q17 深调研题面：reason_code 受控词表 v1 种子——初始枚举收哪些码

## 本仓背景

审计产品 quarantine 引擎：reason_code=受控词表（schema CHECK 级契约物），命名对齐 git fsck msg-id 风（D-104④）；扩管纪律=观测驱动立法（D-104②：新码须经 known-gaps→立法流程，禁预防性猜测）。已被决策锚定的码：anchor_head_date_malformed（D-105）／normalized_tz_offset 族（D-112）／unclassified_field_anomaly（D-104②）／oversize 族（D-117）。git 现实另有已观测未立法病态族（badDate 变体/badEmail/missingAuthor 等 fsck msg-id 可查全族）。

## 选项

- **(a) 最小种子=仅有决策出处的码**：其余病态族首见走 UNCLASSIFIED→known-gaps→立法全流程（首个新码走全流程=端到端验证立法管线）；
- **(b) 预登记 fsck msg-id 全族**：可枚举病态全收——违观测驱动原则，未验判据的码=空头承诺；
- **(c) 词表最小到机制**：v1 只有 unclassified——已立法码重复走流程；
- **(d) 词表外置配置文件**：脱离 schema CHECK 治理。

## 调研任务

工业界成熟心智模型取证：① 受控词表/枚举治理的初始播种惯例——API 错误码枚举（Stripe/GitHub API error codes）、gRPC status codes、HTTP 状态码扩展史、FHIR value sets 的初始版本是怎么定成员的（最小可行 vs 预登记全族）？② 「枚举+兜底码」模式的扩展演进惯例——open/closed enum 之争（protobuf unknown enum 处理、extensible enum 模式）、新增枚举值的兼容性规则；③ 分类学立法惯例——ICD/SNOMED/bug taxonomy/错误码注册表（IANA registry）的新条目登记流程与初始集惯例；④ 「首个新码走全流程=端到端验证」论证的先例与反例（流程空转学费 vs 验证价值的工业界表述）；⑤ 辩证：(a) 词表瘦=诚实 vs 频繁触发立法流程的运营负担；(b) 预登记的空头承诺风险实证；(d) 配置外置的治理失控先例。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-104②④⑤/D-105/D-110/D-112/D-117、来源清单、信息缺口、置信度。
