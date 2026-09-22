# R28-Q2 atomcode 调研题面（存档）

> 2026-09-22 轮28 grill Q2。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

「字段级 quarantine 的覆盖面裁」：一个工程内容审计工具（审计 git 仓历史、字节级确定性）已建立违约两级处置——协议级违约 fail-fast、字段级病态进 quarantine 桶（字段置 null+malformed 印记+reason code+三桶计数），且已定三态分类器住契约层、处置归消费面。现在要裁「本轮给哪些字段接线 quarantine 判定」。解析对象是 git log 的 __R__%H|%an|%cI 记录：%H=commit sha（git 自生成非用户数据，形状坏=协议级无字段级意义）；%an=author 名（git 允许空 author——空名不是病态；真病态候选=非法 UTF-8/控制字符/嵌入分隔符，但均无已观测实例、连病态判据都定义不出）；%cI=committer 日期（唯一有实证病态族的字段——git/git 仓存在 %cI 输出为「 INDIA」的病态 commit）；paths=文件名数组无单值病态概念。选项：(a) 机制按可泛化形态建（分类器签名与 reason code 枚举预留扩展位）但本轮只给 %cI 接线，author 等字段的病态判据挂「首个观测实例」触发器待实证再立法；(b) %cI+%an 双接线——author 病态族（非法 UTF-8/控制字符）一并覆盖，判据现在定义；(c) 全字段建制——sha/author/date 全接三态分类。请调研：①数据摄入/schema 验证管线对「给哪些字段上字段级校验」的成熟心智模型——全字段防御性验证 vs 仅已观测病态面验证 vs 关键字段优先级的取舍惯例（JSON Schema/Protobuf/Avro 校验器、Great Expectations/dbt tests 类数据质量框架的字段覆盖策略）；②「为无观测实例的字段定义病态判据」的失败模式——speculative validation 的误杀率、判据凭空发明后与实际数据不符的返工成本；③git 生态对 author/committer 字段病态的实际处置惯例（git fsck 对 malformed author 的判定面、git log 对非法编码的回退形态、code-maat/分析工具实例）；④对本题给出建制推荐与理由。辩证看待：指出牵强处与反例（「首个观测实例才立法」会否导致首个实例仍以协议级 fail-fast 硬崩而非平滑进 quarantine——即触发器式立法自身的覆盖空窗问题）。