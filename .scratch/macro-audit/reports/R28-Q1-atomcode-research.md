# R28-Q1 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q1：「数据摄入契约层的违约分类语义归属」——三态判定的架构归属（契约层 vs 消费面）。
> 题面存档：R28-Q1-research-prompt.md。执行：atomcode -p 串行单发。
> Sufficiency Gate：searches 8（Exa/Tavily 额度耗尽，AnySearch 补位完成全部查询）| angles：Official/Criticism/Comparative/Community | full reads 6。

## 1) 执行摘要（Tl;dr）

**推荐 (a)：契约边界层导出三态分类器——协议级仍 throw，字段级不再 throw、返回三态判定**，消费面只继承分类结果、不重判分类语义。（Confidence：高——三个支点各有 ≥2 独立信源交叉支持，且与被裁对象「确定性审计工具」的特殊约束强耦合。）

理由一句话：quarantine 桶语义（字段置 null + malformed 印记 + 三桶恒等式）本质上是「分类」而非「处置」——分类必须全链唯一口径才可重放；成熟管线实证=判定语义下沉到 ingestion/framework 层（Kafka Connect、DuckDB reader 都在框架层做 per-record 判定），处置策略（进哪桶、计数、告警）留给消费面。选项 (a) 恰好是这个划分。

## 2) 分点结论

### ① 记录级病态判定住哪层：framework/ingestion 层判，consumer 层处置

- **Kafka Connect（Confluent 官方，2019-03，全文）**：convert 与 transform 两个框架内阶段的错误由 Connect 框架统一接管（错误表明确标注这两行 Handled?=Yes），而 connector 生命周期两端（start/poll/put）的错误框架不管、无 DLQ。即：解析/转换层的 per-record 病态判定由 ingestion framework 承担，DLQ 路由/监控/告警是框架提供的机制，但「什么算坏」由 converter/transform 这个边界解析器自己抛出、框架拦截分流。
- **Factor House（Comparative/Criticism，2026-09，全文）**：Kafka broker 没有 DLQ 原语，「消息是否可处理是 consumer 回答的问题」——裸 Kafka 里判定权在消费方；但一旦有 Connect 这种 ingestion 框架，判定就被收进框架的 error handler（RetryWithToleranceOperator），connector 只需配置 errors.tolerance。per-group/per-source 分桶归因问题——正是三桶分离计数要解决的同类问题，业界解法=判定统一、桶按归属分离，不是各消费面各判各的。
- **DuckDB（官方文档，全文）**：read_csv 的 store_rejects=true 在 reader（ingestion 层）内部完成 per-record/per-field 判定——坏行跳过、写入 reject_errors 表，且带 column_idx/column_name/error_type/csv_line/error_message 的字段级结构化诊断。字段级 CAST 失败不住消费面，也不以异常逃逸出 reader——判定与诊断信息都在 ingestion 层产出。
- **综合**：成熟心智模型=「解析器判定 + 框架分流」。判定语义（什么叫 malformed）与产生数据的解析逻辑同源，必须住解析层；quarantine 桶、计数、覆盖率恒等式是处置策略，住消费/报告层。与选项 (a) 的划分完全同构。

### ② Parse-dont-validate / validation-at-the-boundary 对共享解析器的立场

- **lexi-lambda《Parse, dont validate》（学派原典，2019-11，全文）**：核心主张=解析产出的数据携带已验证的证明，后续代码不再可能问「这数据合法吗」。推论到多消费面：验证做一次，产出的类型把不变量编译进数据本身——判定结果共享，不各自重判。

### ③ 异常即控制流 vs 显式结果类型的取舍惯例

- **Result pattern 派**（Jovanović；FluentResults/OneUptime 等多篇）：验证类可预期错误应显式返回——调用方在签名上就该看到失败的可能性，且便于收集多个诊断而非 throw first-error。
- **diagnostics 列表派实证**：DuckDB reject_errors（逐条结构化诊断，含列名/错误类型/原文行）、Kafka Connect DLQ 的 errors.deadletterqueue.context.headers.*（把错误类名、阶段、原始 topic/分区写进消息头再路由）——所有「非终结性」字段/记录级病态，业界都走结构化诊断收集面，不走 throw first-error。
- **throw 派保留**给两种情形：协议级形状崩坏（Jackson JsonParseException 直接冒泡成 Connect task FAILED）、以及配置性错误——两者都符合 exceptional situation 定义。
- **结论**：字段级三态返回值（clean/normalized/quarantined + 诊断明细）是主流形态；异常只留协议级。

### ④ 建制推荐（方案 a 的落地形态）

1. **契约边界层导出两个函数**：parseOrThrow（协议级形状断言+归一化，形状坏即 throw——保留 fail-fast）与 classifyField/归一化产物携带三态（字段级判定，永不 throw，返回 clean|normalized|quarantined + 诊断结构）。吸收 (c) 的半步正确（协议级与字段级要分开），但字段级判定语义不下放——留在契约层与 normalize 同源。
2. 三个消费面（引擎探针、平行回归脚本、未来适配器）只做桶的落位与计数，不做判定——「与引擎同口径」纪律从「import 同一函数」升级为「继承同一分类结果」，字节级可重放恒等式（clean+normalized+quarantined=总记录数）由分类器单一出口天然保障。
3. 未来适配器（codelore/REST）接入时只实现「如何把上游字节喂进同一分类器」，不重新发明「什么算 malformed」——避免分类语义随适配器数分裂。

## 3) 对比矩阵

| 项 | 判定语义归属 | 多消费面口径一致性 | 失败模式 | 备注 |
|---|---|---|---|---|
| (a) 契约层三态分类器 | 契约层判定，消费面处置 | 单一出口天然一致；回归脚本继承同一分类结果 | 分类器膨胀为策略层（见辩证） | 与 Kafka Connect/DuckDB 实证同构 |
| (b) catch 后各面归因 | 契约层 throw，消费面重判 | 依赖每个面 catch 逻辑逐字对齐；异常是 first-error 无字段级明细可分流 | 异常丢失粒度（哪个字段、什么病）需从 message 文本反解，破坏确定性重放；与 parse-dont-validate 直接相悖 | 仅当框架强制异常面（如某些 Sink API）时才是惯例 |
| (c) 协议级/纯归一化拆开，字段判定下放 | 字段判定语义归各消费面 | 三消费面三套判定，漂移风险最高；报告恒等式失守 | 未来适配器各自发明 quarantine 语义 | 「拆开协议级与归一化」这半步是对的，可并入 (a) |

## 4) 辩证：牵强处与反例（如实指出）

- **(a) 的真实风险——分类器膨胀为策略层**：如果契约层开始决定「quarantined 的字段置 null 后要不要打印记、印记格式、计数归属」，它就吃掉了报告层的职责。防线：契约层只输出判定+诊断数据（像 DuckDB reject_errors 那样的原始事实），置 null/印记/计数/恒等式全部留在消费面与报告层。判断标准：契约层的输出类型变了=正常演化；契约层开始引用报告结构=越界。
- **(b) 并非一无是处——在某些框架里 catch 分流确实是惯例**：裸 Kafka consumer（Factor House 全文实证：无框架时 DLQ 完全是 consumer 侧责任）、Spring Kafka 的 DefaultErrorHandler+DeadLetterPublishingRecoverer 都是消费面 catch 后路由。反例成立的前提是「异常携带足够结构化信息」——Java SerializationException 有类型、有 cause 链可分桶。但本场景是字节级确定性审计：从异常 message/stack 反解「哪个字段、什么病态」不可重放、不可 diff，(b) 在本约束下被这一条单独否决，即便它在一般管线里是惯例。
- **(c) 的反例价值**：如果未来适配器的上游语义差异极大（codelore 的「字段非法」与 REST API 的「字段非法」判据不同——比如编码 vs 业务规则），字段判定下放反而更诚实，契约层强行统一会造出泄漏抽象（契约层需要知道每个上游的业务语义）。此时应退回 (c) 的下放、但要求各消费面复用契约层的三态类型定义——类型共享、判定分权，是 (a) 与 (c) 的中间态。是否触发这一退路，取决于 codelore 适配器实际接入时字段判据是否真的与现有上游同质。
- **未尽事项**：Kafka Streams 的 DeserializationExceptionHandler 细节未读源码级材料；若要对标 Streams 的形态（handler 作为可插拔策略而非固定语义），可进一步验证 (a) 中「分类器导出为可注入策略」的变体——对单工具而言通常过度设计，但记录在案。

## 5) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| Kafka Connect Deep Dive – Error Handling and Dead Letter Queues (Confluent) | confluent.io/blog/kafka-connect-deep-dive-error-handling-dead-letter-queues/ | Official | 2019-03 | 框架在 convert/transform 阶段接管 per-record 错误；fail-fast 为默认；DLQ 靠 errors.tolerance=all + context headers |
| Dead letter queues in Kafka: patterns and pitfalls (Factor House) | factorhouse.io/articles/dead-letter-queues-kafka/ | Comparative/Criticism | 2026-09 | Kafka 无原生 DLQ；无框架时判定权在 consumer；per-source/per-group 分桶归因；DLQ 生产失败模式 |
| Parse, dont validate (lexi-lambda) | lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/ | Official（学派原典） | 2019-11 | 验证产物应是携带证明的数据；下游不再重判——直接支持判定语义单点化 |
| CSV Import (DuckDB docs) | duckdb.org/docs/data/csv/overview | Official | 当前版 | ingestion 层内置 faulty-file 处理入口 |
| Reading Faulty CSV Files (DuckDB docs) | duckdb.org/docs/current/data/csv/reading_faulty_csv_files.html | Official | 当前版 | store_rejects + reject_errors 结构化字段级诊断（column_idx/error_type/csv_line）——字段级判定住 reader 的直接实证 |
| Functional Error Handling in .NET With the Result Pattern (Milan Jovanović) | milanjovanovic.tech | Community | — | 可预期错误显式返回、签名可见失败可能性、收集多诊断 |

## 6) 信息缺口

1. Kafka Streams DeserializationExceptionHandler 的官方 API 细节未读原文（本轮靠 Factor House 转述）；
2. DuckDB 源码层 store_rejects 与异常路径如何共存（是否内部 catch 后转诊断）未验证到代码级；
3. AnySearch 检索对 Result-vs-Exception 的反方材料（异常派辩护）只拿到摘要、未全文核验——但该反方主要影响实现风格而非本题的归属裁定，不影响结论。
