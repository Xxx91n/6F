[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我将按「default 档」执行本轮调研：先召回知识库，再三引擎广泛搜索，定点深挖，最后合成。知识库命中 R28-Q9/Q10 相关先例。现在三引擎广搜（角度：Official / Comparative / Community / Criticism）。Tavily 超限，改用 Exa+AnySearch 双引擎继续。下一轮覆盖 FHIR/gRPC/registry 流程角度。定点深挖：抓原文验证 gRPC/protobuf 枚举演进、Stripe 错误码目录、RFC 8126 注册政策、Kubernetes API 约定（枚举扩展先例）。继续深挖：Kubernetes API 约定（枚举扩展纪律）、Microsoft extensible enum 指南、HTTP 状态码扩展史、bug 分类注册流程。继续补足配额：深挖批评/社区角度（「Other」枚举陷阱、gRPC 官方指引、RFC 8297 扩展史）+ 补搜配置外置失控先例。补最后两处定点验证（Azure extensible enum 官方原文、Stripe 错误码目录），然后合成。配额自查已达成（searches: 9 | angles: Official / Comparative / Criticism / Community | full reads: 8 | gaps: 见文末）。合成如下。

---

# R28-Q17 调研报告：reason_code 受控词表 v1 种子

## 1) 执行摘要

**Tl;dr**：工业界惯例明确支持 **(a) 最小种子=仅有决策出处的码 + 兜底码 + 「枚举按开放对待」的消费者纪律**。IANA 建新 registry 的 checklist 只要求「specify the initial set of items **if applicable**」（RFC 8126 §2.2 checklist 第 4 条）——初始集按需给出，后续条目走注册政策逐条进；Microsoft Azure 把这条路制度化成 **extensible enum**：「枚举值集合应被视为*部分清单*（partial list），`YOU SHOULD use extensible enums unless you are positive the set will NEVER change`」；Raymond Chen 进一步给出关键推论：**连兜底码都不该进枚举本体**——「Other」应在消费者侧由应用自建，词表保持 open-ended。gRPC/protobuf 是反面镜子：proto3 改 open enum 正是因为 closed enum 的 unknown-handling 造成了实测的兼容性破坏。**(a) 高置信胜出；(b) 被多方判为反模式；(c) 过度瘦身、(d) 治理外泄各有代价。** Confidence：高（每个关键结论均有 ≥2 独立信源）。

**对比矩阵**：

| 项 | 初始诚实度 | 扩展纪律 | 消费者契约 | 工业先例 | 备注 |
|---|---|---|---|---|---|
| (a) 最小种子+兜底 | 词表=已验事实 | 每码走立法全流程 | 词表外值→兜底码，开放枚举语义 | IANA / Azure extensible enum / Stripe 增量史 | 本仓既有 D-104② 就是此模式，先例同构 |
| (b) 预登记 fsck 全族 | 假——未验判据入表 | 无门槛堆码 | 词表=空头承诺 | Microsoft CA1700 禁「Reserved」占位成员；Chen：Other 的存在暗示穷尽 | 未用码同样出现在消费者 switch/文档里 |
| (c) 只有 unclassified | 极端诚实 | 已立法码重复走流程 | 已定案事实被降格 | IANA registry 无此惯例——初始集「if applicable」该给就给 | 立法管线空转学费 |
| (d) 外置配置 | 表面灵活 | 绕过 schema CHECK 门禁 | 词表与验证器分叉 | 配置漂移（configuration drift）文献：外置基线与实际状态渐行渐离 | 治理物离开契约物=失控先例 |

## 2) 分角度结论

### ① 初始播种惯例：初始集=「当时已知的已验成员」，不是「能枚举的全部」

- **IANA/RFC 8126（Official，一手精读）**：§2.2 checklist 对新 registry 的要求是「Specify the initial set of items for the registry, **if applicable**」，然后「Select a registration policy for **future** registrations」——初始集与后续准入是两个显式分离的机制。初始集没有义务穷尽 namespace。IANA 实操（HTTP 状态码 registry 即其例）也是逐码随规范文档进场：103 Early Hints 是 2017 年才以 Experimental RFC 8297 注册、2025 年才状态晋升（httpwg 原文 + datatracker 状态变更文档双源）——**没有任何主流 registry 采取「预登记全族」**。
- **FHIR（Official，hl7.org 精读）**：ValueSet 明确区分 extensional（逐码枚举）与 intensional（算法定义），并直言 extensional「greater maintenance burden」——维护成本是显式设计考量。初始版本只装当时 compose 里验过的码。
- **Stripe（Official，error-codes 目录提取）**：其错误码目录是上百个具体码（`card_declined`、`terminal_reader_hardware_fault`…），全部逐码配「消费者该做什么」；DeepWiki 对 stripe/openapi 的分析指出新码（如 `account_token_required_for_v2_account`）是**在既有码旁增量加入**的——目录是历年观测驱动的沉淀物，不是第一天预登记的。
- **设计指南（Socratopia API 设计手册，间接但表述精准）**：错误分类学的正确做法是「Step 1: enumerate failure modes **by working backward from the operation**」——从实际操作的失败模式回推，而非从病态全集正推；并「Commit to additive evolution: you may add new codes; you may not remove or rename」。

### ② open/closed enum 之争：兜底码放消费者侧，词表按开放对待

- **protobuf（Official 一手精读）**：proto3 全量改 **open enum** 的动因就是 closed enum 的 unknown 值处理在 repeated field 里造成重排/丢失类实际 bug；文档原话「Proto3 and editions use open enums **specifically because of the unexpected behavior that closed enums cause**」。本仓 schema CHECK 是封闭验证器，但**消费面语义应当是开放的**：未知码→`unclassified_field_anomaly` 兜底，与 proto3 open enum「解析未知值、保留原值」精神同构。
- **Azure Guidelines（Official 一手精读）**：extensible enum 是强制纪律——「`YOU SHOULD use extensible enumerations unless you are positive that the symbol set will NEVER change`」+「`DO document to customers that new values may appear in the future`」。加值非破坏性、删值才破坏，这一兼容性规则与本仓词表扩管方向完全一致。
- **Raymond Chen（Official，一手精读，2025-02-17）**：反对把「Other/兜底」做成枚举成员——「the presence of an Other logically implies that the enumeration is exhaustive」；正确姿势是「document that the enumeration is open-ended, and programs should treat any unrecognized values as if they were Other」。⚠️ 这对本仓是一个**精修信号**：v1 词表里已立法码照收，但 ADR 应写明词表 open-ended、`unclassified_*` 是消费侧行为而非穷尽性声明。
- **消费者纪律（Criticism/Community）**：WunderGraph「why you should avoid exhaustive switch in API clients」与 Abseil Tip of the Week #147（exhaustive switch 在枚举加值时的破坏责任归属分析）、C# CS8524 unnamed enum value 警告——都是同一主题：**加码必须永不破坏消费者，靠的是消费侧默认分支而非词表冻结**。与本仓 R28-Q9 已立的「default-deny、未声明≠健康」判定轴正交兼容。

### ③ 分类学立法惯例：逐条登记 + 专家评审，初始集小而真

- **RFC 8126 §4.5/§5（精读）**：Expert Review 政策的职责就是「review guidance to the designated expert」——新条目按**个案**送审，评审看的是登记请求的文档完备性。这正是 D-104② known-gaps→立法流程的 registry 版本。
- **gRPC status codes（Official 一手精读）**：16 个码全量定型+「If new codes are added over time they must choose a numerical value that does not collide」——即便是最接近「预登记」的系统，新码仍要走文档化流程逐个进；且明确保留 UNKNOWN 作为 unknown error space 的兜底（「errors raised by APIs that do not return enough error information may be converted to this error」）——**大词表系统同样需要且保留兜底码**。
- 对比 (c)：ICD/LOINC 类扩展集依赖 intensional 机制才敢瘦身；对一个 schema CHECK 内联的审计词表，把四个已被 D-105/D-112/D-104②/D-117 立法的码踢出去重走流程，没有任何先例支持。

### ④ 「首个新码走全流程=端到端验证」的工业表述

- **支持面**：Stripe 错误码测试套件模式（dev.to 社区文，搜索摘要确认论点、原文 404 已注明为缺口）主张「error-code catalog + 每码一条基线测试 + 文档从代码派生」——每个码进入目录时都过一遍验证机械，本质就是「新码走全流程=管线自验」。IANA 的 provisional registration（RFC 8126 §4.13）也承认「登记流程本身需要被使用才能验证」—— early allocation 的存在证明业界认为流程要走通才算数。
- **反例/学费面**：Abseil #147 指出 exhaustive switch 加码破坏时的责任摩擦——流程的价值恰恰在它制造这种受控摩擦；真正的「流程空转」是 (c) 让已定案码重复立法，而非让首个真新码走一遍。两源合流：**端到端验证价值 > 空转担忧，前提是流程成本本来就轻（一次 ADR+CHECK 行更新）**。

### ⑤ 辩证项核查

- **(a) 词表瘦=诚实 vs 运营负担**：Azure 的强制 extensible enum 立场直接回答——「除非你确定集合永不变化，否则就该按部分清单治理」。运营负担（首个新码一次全流程）是一次性学费，且换来立法管线被真实行使过的证据。Balance 指向 (a)。
- **(b) 空头承诺实证**：Microsoft CA1700（一手检索结果引用）明令禁止「Reserved」占位枚举成员：「you should not expect users to ignore a member just because its name contains "reserved"」——未兑现的码进入词表即成为消费者的死分支与文档谎言。这正是 (b) 的工业判词。
- **(d) 配置外置失控**：Octopus/Wiz/IBM/Puppet 四家 configuration drift 文献一致：外置于验证机制的基线随时间渐行渐离，修复手段都是「把基线拉回受版本控制、可校验的契约物」。reason_code 是 schema CHECK 级契约物（本仓已锚定），外置配置=把治理物移出 drift 检测半径。(d) 排除。

## 3) 冲突核查

- **D-104②（观测驱动立法）**：(a) 与其同构互证；(b) 直接违反「禁预防性猜测」。(a) ✓
- **D-104④（git fsck msg-id 命名风）**：(b) 的「对齐 fsck 全族」只是命名层面的对齐——命名风可以预留（新码将来按 msg-id 风起名），但**注册**不能预留。两者不冲突：命名约定先行、成员观测驱动。
- **D-104⑤ / D-110（strict 门禁、default-deny）**：词表开放语义 + 消费者兜底分支与 default-deny 一致（未识别码落 `unclassified_field_anomaly` 走黄/红，不落绿）。
- **D-105 / D-112 / D-117**：三决策码全部进 v1 词表——这正是 (a) 与 (c) 的分界；(c) 需要推翻三个已定案决策，无冲突余量。
- **与 R28-Q9 先例（reason_class SARIF 式小枚举）**：本报告 Chen 结论给出一条精修建议——ADR 中显式声明词表 open-ended、兜底是消费侧行为而非枚举成员语义，防止未来加码时的「Other 陷阱」。

## 4) 推荐

**采纳 (a)**：v1 词表 = 四个已立法码（anchor_head_date_malformed / normalized_tz_offset 族 / unclassified_field_anomaly / oversize 族）+ ADR 写明三点：① 词表 open-ended，新码经 known-gaps→立法全流程逐条进场（首个真新码=管线端到端验证，其学费记录进 decision ledger）；② 兜底语义属消费面（未识别码→unclassified 路径，default-deny 不落绿），非穷尽性声明；③ 拒绝 (b)（CA1700 判词：未验码=占位谎言）、(c)（无先例支持推翻已定案码）、(d)（配置漂移教训：治理物必须留在 schema CHECK 契约物内）。

## 5) 来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| RFC 8126 IANA Considerations | https://www.rfc-editor.org/rfc/rfc8126.html | Official | 2017-06 | 初始集「if applicable」与后续注册政策分离的 registry 惯例 |
| gRPC Status Codes (doc/statuscodes.md) | https://github.com/grpc/grpc/blob/master/doc/statuscodes.md | Official | 持续维护 | 16 码定型史+UNKNOWN 兜底+增量加码规则 |
| Protobuf Enum Behavior | https://protobuf.dev/programming-guides/enum/ | Official | 持续维护 | closed→open enum 的实测兼容性动因 |
| Azure REST API Guidelines | https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md | Official | 2025-03-28 版 | extensible enum 强制纪律、加值非破坏规则 |
| API design note: Beware of adding an "Other" enum value | https://devblogs.microsoft.com/oldnewthing/20250217-00/?p=110873 | Official/Criticism | 2025-02-17 | 兜底码放消费侧、词表 open-ended 声明 |
| FHIR ValueSet (v5.0.0) | https://hl7.org/fhir/valueset.html | Official | 2023 | extensional/intensional 之辨与维护负担 |
| RFC 8297 (103 Early Hints) | https://httpwg.org/specs/rfc8297.html | Official | 2017-12 | HTTP 状态码 registry 逐码进场实例 |
| Status change 103 Early Hints | https://datatracker.ietf.org/doc/status-change-early-hints-to-proposed-standard/ | Currency | 2025-02 | 实验码→标准的晋升路径证明增量立法 |
| Stripe Error codes 目录 | https://docs.stripe.com/error-codes | Official | 实时 | 大目录=观测沉淀物，逐码配消费者动作 |
| Stripe openapi API Evolution (DeepWiki) | https://deepwiki.com/stripe/openapi/6-api-evolution-and-change-management | Comparative | 2025-12 | 新码在既有码旁增量加入的实证 |
| Microsoft CA1700 | https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca1700 | Criticism | 2025-02 | 禁「Reserved」占位成员=预登记空头承诺判词 |
| Status Codes / Problem Details 设计手册 | https://www.socratopia.app/library/designing-apis-distributed-communication-en/chapter-5 | Community/指南 | — | 错误分类学四步法、additive evolution 承诺 |
| Abseil Tip of the Week #147 | https://abseil.io/tips/147 | Community | — | exhaustive switch 加码破坏的责任分析 |
| WunderGraph: avoid exhaustive switch in API clients | https://wundergraph.com/blog/why_you_should_avoid_exhaustive_switch_case_in_api_clients | Criticism | 2024-02 | 加枚举值必须不破坏消费者的纪律 |
| Configuration drift (Octopus/Wiz/IBM/Puppet) | https://octopus.com/devops/configuration-management/configuration-drift/ 等 4 篇 | Criticism | 2023–2026 | (d) 外置基线漂移失控先例群 |
| IETF StackExchange/Reddit CS8524/Dart #2474 | https://softwareengineering.stackexchange.com/questions/360767/ 等 | Community | — | 枚举扩展兼容性社区共识 |

## 6) 信息缺口

1. Stripe 错误码测试套件原文（dev.to）404——「每码一测试」论点仅有搜索摘要支撑，未读到全文；
2. FHIR 端「初始 value set 如何定 v1」没有找到 HL7 官方对*首版成员选择标准*的成文专章（现有材料只支持 general governance 惯例）；
3. ICD/SNOMED 新条目登记的一手流程文档（WHO 官方提案流程页）本轮未抓取，分类学立法角度部分依赖 IANA 类比推断；
4. bug taxonomy（Chromium/WebKit bug classification）视角未覆盖——若需要可补一轮。

**Sufficiency Gate**：searches: 9 | angles: Official, Comparative, Criticism, Community | full reads: 8 | gaps: 上述 4 条（均不改变推荐方向）。

继续此会话，运行：atomcode -p "…" --resume b286c741-7968-4151-8d10-bc1daf0256a7
