# R27-Q3 atomcode 深调研报告 —— 冻结输出契约 vs 真实脏历史的违约处置层级（2026-09-22）

> 置信度：分层判据与 DLQ 适用边界=**高**（Confluent/factorhouse/matthewpalma 三源一致+git 上游先例）；git 工具惯例=**中高**（code-maat、git 上游 patch 链一手证据，git-of-theseus 未验证）；GitHub 渲染策略=**低**（未获一手材料）。Sufficiency Gate：searches 7+（Exa×5、AnySearch×4、Tavily×2 配额耗尽仅得回执）｜原文全读 6（martinfowler/confluent/factorhouse/matthewpalma/code-maat#58/ctx 索引 4 页）｜四角覆盖。题面存档=R27-Q3-research-prompt.md。

## 1) 执行摘要

**推荐 (b) 为骨架、吸收 (a) 的登记义务与 (d) 的反向开关**：契约切两层——**协议级违约**（行结构/分隔符/无法定界记录，意味上游形状变了、所有记录同病）保持 fail-fast；**字段级病态**（记录结构完整、单字段值语义不合法且无确定性可挽救目标，如 " INDIA"）走 quarantine：日期置 null+⚠malformed 印记+原始字节回显+逐 SHA 计数入报告，审计继续。**反对 (c)**：" INDIA" 非版本拼写漂移是不可挽救脏数据，扩形状断言接受任意区名=契约稀释至无意义+制造虚假等价（INDIA≠+0530，无时间戳可映射）。**滑坡边界**：quarantine 必须按「原因码+有界比例阈值+登记义务」运营，否则沦为垃圾收容所（标记疲劳、覆盖率虚高）。

## 2) 分点结论

### ① 数据摄入管线心智模型：违约分两层，判据=「重试/挽救同一批字节是否有意义」

- **fail-fast 适用域**：错误意味上游系统性问题、继续处理无意义时中止。Confluent 对 Kafka Connect errors.tolerance=none（默认）：「坏数据或是上游问题的症状，继续处理其余消息没有意义」（已读原文）。
- **quarantine/DLQ 适用域**（三源高度一致）：matthewpalma——DLQ 适用于「传输层结构合法但语义对消费者非法」的毒丸消息，重试同一批字节不会有帮助；**无 owner 无 playbook 的 DLQ=latency relief, not risk reduction**。factorhouse——DLQ 三情形=反序列化失败/业务规则永久拒绝/重试预算耗尽；瞬时故障不进 DLQ 先走 retry topic，DLQ=terminal state；errors.tolerance=all 不配 DLQ topic=静默丢弃。Confluent——低关键性管道保运行，前提是 errors 不被悄悄传播+配指标监控。
- **本题映射**：列结构/分隔符坏=传输形状违约（无法定界字段）影响所有行→fail-fast 正确；单行日期=" INDIA"=记录结构完好、字段值语义非法→quarantine 域。

### ② git 上游与考古工具的实际惯例

- **git 上游自己选了记录级宽容**（最强先例，一手 patch 链+合并提交双源）：2023 Jeff King `jk/parse-commit-with-malformed-ident` 系列让 parse_commit() 对畸形 ident 更宽容（行尾反向找时间戳、容忍空白时间戳）。Peff 原话：这些对象「malformed…all at least a decade old…These days Git wouldn't allow them」；Thomas Bock 诉求=本题场景（「comparably old projects 也会出」）；维护者结论=**值得修解析器去读它们，而不是拒绝**（gitster/git 620e92b，2023-05-09）。心智模型=**病态元数据=数据属性，尽力解析，解析不出置 0**，非「不符即拒」。
- **code-maat=反例**（fail-fast 把负担推用户）：issue #58（mediawiki 分析中 commit message 内嵌日期+编码问题连续炸解析器，用户逐个手修，无 quarantine 机制只能崩或换格式）；issue #40 同型（IllegalArgumentException）。=本工具要超越的行业现状，亦证 (a) 硬崩=用户痛点。
- **Tolerant Reader 适用域划清**（Fowler 2011 已读原文）：论证对象=**服务演进**（provider 加字段/改结构不 break 客户端）——为拼写漂移归一化（+00:00 vs Z）提供正当性，**不为接受坏数据提供正当性**；引申到「宽容坏数据」是范畴错误=（c）的滑坡根。robustness principle 现代批评版：宽容接受被指安全与工程问题根源，负责任重述要求**明确写出接受什么、拒绝什么**=契约分层显式化而非单方面扩形。

### ③ 建制推荐

**划线判据**（可操作分界）：

| | fail-fast（协议级违约） | quarantine（字段级病态） |
|---|---|---|
| 违约对象 | 输出契约结构层：列数、分隔符、记录定界、行形状 | 记录定界成功后的单字段值语义 |
| 含义 | 上游形状变了→所有记录同病，部分数据不可解释 | 仅该行该字段不可挽救，其余行含义归属不受影响 |
| 测试 | 能否对每一行独立判定 | 该 fact 行在日期缺失下是否仍可归属可审计 |
| 本题例子 | git 未来版本改 %cI 列布局 | " INDIA"：无时间戳，任何映射都是编造 |

**第三桶 normalized**：可确定性归一化漂移（+00:00→Z）既不 fail 也不 quarantine，单独桶且**必须与 quarantine 分开计数**——宽容只有「有界且被度量」才安全，repair log 防接受域静默扩宽；只扩不收的 envelope=契约消失。

**quarantine 可观测性五件**：
1. **逐 SHA 清单不只计数**（SHA 字节确定性，计数非诊断上下文）；报告含 reason code，quarantine 与 normalized 两码永不合并；
2. **原始字段字节回显**——fact 行原样保留 " INDIA" 字面值，证明 quarantine 是输入的确定性函数（全链确定性不因宽容破）；
3. **覆盖率恒等式显式化**：总行数=clean+normalized+quarantined 写报告头；quarantined>0 不改变审计「完成」地位，但派生统计（时间窗分析）必须声明排除了哪些行；
4. **有界阈值+升级路径**：单仓单字段 quarantine 比例超阈→升级为该仓 unsupported（回退 (a) 裁定）——给 (b) 装收紧路径防 envelope 只扩不收；
5. **反向开关（吸收 d，方向相反）**：默认 tolerate+quarantine，opt-in `--strict-quarantine` 让 CI/回归对**新出现的 reason code** 硬崩；新 reason code=契约覆盖缺口信号，登记入 known-gaps 台账（吸收 a）。

### ④ 滑坡边界与反例（辩证）

- **垃圾收容所风险路径**：无 reason code 枚举约束+无阈值升级+只报计数→任何新病态静默吸桶，known-gaps 台账不再增长，工具失去「发现未知契约缺口」能力。
- **标记疲劳**：⚠ 若对可归一化漂移（+00:00）也打，百万 commit 级仓报告被淹没，真 quarantine 行不可见→normalized 不打 ⚠（或降级为统计行），⚠ 只留 quarantine。
- **审计完整性稀释**：下游把 null 日期当真实值参与时间窗/排序统计=quarantine 注入静默谎言→**null 必须是毒值**：任何消费方触碰 null 须显式报错或显式跳过，不能当 0 处理。
- **(c) 为何错**：有确定性等价目标的漂移才可归一化；" INDIA" 无时刻可指，接受它=契约退化为「任何词法 token 都算时区」+虚假归类风险（硬映射 +0530 是编造数据，违反字节级确定性审计立身之本）。
- **(d) 单独牵强**：脏数据在上游不可变历史里，审计者无法「选择」数据干净与否；opt-in 把决定推给最缺信息一方，且默认档（硬崩）恰对旗舰用例坏。opt-in 只有作为 strict 反向开关才有价值。
- **(a) 保留价值**：「如实落数」诚实性正是 (b) 登记义务来源；错在粒度——15 年前不可变 commit 永久报废整仓审计，而 git 上游自己都在解析这些对象；且 unsupported 裁定应由 quarantine 比例阈值触发而非首次碰壁即触发。

## 3) 选项对比矩阵

| 选项 | 确定性 | 覆盖率 | 契约完整性 | 主要风险 | 业界先例 |
|---|---|---|---|---|---|
| (a) 硬崩+登记 | 高 | 低（整仓报废） | 高 | 一个病态 commit 否决百万行审计；与 git 上游惯例相悖 | code-maat 现状（用户痛点） |
| (b) 层级重划+quarantine | 高（quarantine 是确定性函数） | 高 | 高（需配套 reason code/阈值/台账） | 无观测配套则沦为垃圾收容所 | Kafka Connect DLQ、git 上游 parse_commit 宽容化 |
| (c) 扩形状断言 | 中 | 高 | **低**（契约稀释） | 虚假等价映射、接受域静默扩宽 | 被 robustness-principle 现代批评直接否定 |
| (d) opt-in 分流 | 高 | 取决于默认档 | 中 | 默认档坏；决定权错配 | strict-mode 作为反向开关有价值 |

## 4) 来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| Kafka Connect Deep Dive – Error Handling and DLQs | confluent.io/blog/kafka-connect-deep-dive-error-handling-dead-letter-queues/ | Official | 2019-03 | fail-fast vs DLQ 官方分野、errors.tolerance 语义、低关键性管道保运行边界 |
| Dead letter queues in Kafka: patterns and pitfalls | factorhouse.io/articles/dead-letter-queues-kafka/ | Official/Criticism | 2026-06/09 | DLQ 三适用情形、tolerance=all 静默丢弃陷阱、DLQ 诊断 header 规范 |
| DLQs for async backends | matthewpalma.dev/blog/dead-letter-queues-async-backends-redrive-and-operations | Community | 2026-04 | 失败分类学、「垃圾收容所」反模式原始表述、DLQ 四监控指标 |
| Tolerant Reader | martinfowler.com/bliki/TolerantReader.html | Official | 2011-05 | 宽容读取真实适用域=服务演进而非坏数据 |
| code-maat issue #58 | github.com/adamtornhill/code-maat/issues/58 | Community/Criticism | 2018-09 | git 历史分析工具对病态 commit fail-fast 的行业现状反例 |
| jk/parse-commit-with-malformed-ident 合并提交 | github.com/gitster/git/commit/620e92b | Official | 2023-05 | git 上游对畸形 ident 宽容化决策 |
| [PATCH v3 4/4] parse_commit() date-parsing failure modes (Peff) | public-inbox.org/git/20230427081724 | Official | 2023-04 | 「对象 malformed 但值得解析」一手论证 |
| Robustness principle | en.wikipedia.org/wiki/Robustness_principle | Official | — | Postel 原语及当代批评（显式接受/拒绝清单要求） |
| code-maat issue #40 | github.com/adamtornhill/code-maat/issues/40 | Community | — | 格式不匹配硬崩又一实证 |
| Structured Streaming Guide | spark.apache.org/docs/latest/structured-streaming-programming-guide.html | Official | — | 主流引擎 per-record corruption 路径（浅读） |
| git-of-theseus README | github.com/erikbern/git-of-theseus | Community | — | 畸形处理未见明述（弱） |
| Tolerant Reader / Strict Writer Policy | abstractopedia.org | Criticism | — | 「宽容须有界且被度量、repair log 防扩宽」（弱源） |

## 5) 信息缺口

- GitHub 对坏 commit 渲染策略：未获一手文档/issue——该项结论未给出；
- git-of-theseus/hercules 畸形处理：README 无明述，需读源码验证（超出 web 调研范围）；
- " INDIA" 具体 commit 公开讨论未检索到（可能仅审计时撞见；git 上游 2023 patch 链讨论同族病态）；
- Tavily 配额耗尽，三引擎交叉实际=Exa+AnySearch 双引擎+6 次原文抓取补足。
