# 23 — atomcode 深度调研（carrier 状态与落位说明）

> 本节为落位说明；atomcode 成稿正文在下方可分隔线之后，未作改写。

| 项 | 值 |
|---|---|
| 提示词留档 | `reports/23-atomcode-prompt.md` |
| 成稿路径 | 本文件（正文 = atomcode 深研模式输出，2026-09-13） |
| carrier 历史 | ① 首轮 HTTP 403（CodingPlan 失效）；② 复跑第 22 轮 context overflow 被会话中断（产物仅 2.3 KB 过程自述）；③ 第三次尝试在另一会话完成并由**用户手动转存**至 `C:\Windows\temp\# 23 — atomcode 深度调研提示词（A-026 _ A-027 _.md`（第 1588–1853 行），本文件由其抽取落位 |
| 临时产物 | `23-atomcode-research.raw.md` / `.err` 已按临时文件纪律删除 |
| 调研模式 | default（四子问题，完整配额）；Sufficiency Gate 自查见正文 §9 |
| 一手来源 | 26 源：SARIF v2.1.0、FEVER arXiv:1803.05355、RFC 3161 / 6962 / 9110、OSCAL v1.1.3、OTLP 1.11.0、GraphQL、gRPC HTTP2、in-toto v1、W3C VC 2.0、IEEE 829-1998 等 |
| 先例依据 | #17 先例 + #22 教训③：carrier 缺口必须显式记录 |

**本票据正文 §6 采纳的实现加固（A 层，不改 B/C 判据）**：receipt 增加 `tree_anchor`（抗 commit 哈希可塑性，正文 §2.1 / arXiv:2607.02820）、`content_digest`（显式算法 + 规范化规则）、`gate_ref`（预声明闸门引用，机器证明「经过闸门而非事后生成」）。其余建议（A5 方向检查的四值 `support_relation`、S1–S6 同骨架套件扩展）记 `23-report.md` §4 为下一票输入。

---

# 23 — atomcode 深度调研报告：审计/审查类产品「第一份真报告」的四重约束

> 调研对象：票 23（A-026 引文支持关系 / A-027 agent 可消费性 / spec §R3-D5 首报验收）
> 调研日期：2026-09-13 ｜ 模式：default（四子问题，完整配额）
> 本地接地：已读 D-016/017/018、ADR-0012/0013、票 22 C 层裁定依据（预入库）、票 18 骨架不变式、`23-first-report.json` / `23-gates.json` 实际产物
> 知识库复用：命中本会话已索引 SARIF 2.1.0 规范（585 节）、RFC 9110、GraphQL spec、OSCAL assessment-results、OTLP、GitHub SARIF 文档，关键条款均从索引原文取证，未凭摘要下结论

---

## 1. 执行摘要（Tl;dr）

**四件事在工业界各有一个成熟先例，且可以拼成一个零外部依赖的自洽方案**：
（1）引文必须**支撑**结论 —— 借鉴 FEVER 三分类（SUPPORTS/REFUTES/NOT ENOUGH INFO）+ Bluebook 引证信号的「类型化有向支持关系」，落地为 5 条确定性断言（A1–A5），其中 A5（方向检查）是「有引文即通过」缺失的关键一环；
（2）Receipt 不可伪造 —— 「单仓自用、零外部服务」约束下，**内容寻址哈希 + 双锚（commit sha + tree sha）+ 预声明闸门引用（gate_ref）+ 可选本地 Ed25519 签名**是最贴切的机制；RFC 3161 / CT / W3C VC 全部因需要外部权威或 PKI 仪式被否决为主方案，但其数据模型词汇被借用；
（3）agent 可消费性 —— 现有 JSON 侧车格式保留，按 SARIF 三原则改造（判据/裁决分离、location+snippet 自包含、稳定指纹）；OSCAL 提供 finding/target-status 语义词汇但不引入其 schema；
（4）失败同骨架 —— OTLP `partial_success` 是最强先例（**同一消息类型承载全成功/部分/失败三态，字段恒在**），配 6 条可机检判据（S1–S6）。

**Confidence：高**（核心结论全部有一手规范原文/论文支撑，且双引擎交叉）；**中**（CycloneDX 规范正文未读到、IEEE 829 依赖搜索级全文摘录，见 §7 缺口）。

---

## 2. 对比矩阵（摘要后强制项）

### 2.1 Receipt「不可伪造回执」机制对比（SQ2，约束：单仓、零外部服务、确定性）

| 机制 | 防伪造原理 | 外部依赖 | 与「单仓零服务」契合度 | 本票取舍 |
|---|---|---|---|---|
| RFC 3161 TSA | 签名时间戳令牌 = {消息摘要 + TSA 身份 + 时间 + 序列号}（imprint） | TSA 服务 + PKI 信任根；自托管 TSA = 自建 PKI 仪式 | 低：自托管 TSA 是真实部署模式（Stella Ops ADR-036 本地 TSA），但仍是「服务 + 证书」，超出单仓自用复杂度 | **否决为主方案**；借用其「摘要+时间+身份」字段词汇 |
| Certificate Transparency（RFC 6962） | SCT = 日志签名的回执 + 包含证明（inclusion proof），可公开审计 | 日志服务器 + 监控方 | 低：自托管日志退化为「一个你已信任的签名者」，相对仓内签名零增益 | **否决**；其「回执可离线验证」语义借鉴 |
| in-toto + Sigstore | in-toto statement 以 **digest 绑定 subject**；签名经 cosign 本地可离线，keyless 路径走 Fulcio/Rekor（外部） | 签名层可选零依赖（本地密钥）；keyless 透明日志 = 外部 | **高（结构）/ 中（信任）**：statement 结构 = 本票 receipt 的完美形状；monotonic principle 直接服务降级设计 | **采用为结构模板**：digest 绑定 subject + 本地签名可选层；keyless 路径不用 |
| W3C VC 2.0 | VC = 「tamper-evident claims + metadata，以密码学证明谁签发」，proof 内嵌，**离线可验、无需联系签发者** | 信任锚/issuer 体系（标准假设存在） | 中：数据模型（claims+metadata+embedded proof）最贴近「裁决回执」概念；但单仓场景 issuer = 报告生成器本身，信任锚 = 仓 | **否决为协议**；借用 proof-embedded 数据模型与「离线可验」验收口径 |
| 内容寻址哈希链 + commit 锚定（现实现） | 内容改 1 字节 → 哈希变；commit 锚定仓库状态；**弱点：commit sha 本身可塑**（arXiv:2607.02820：ECDSA s→n−s 翻转等三条路线可产生同内容异哈希且签名有效） | 零 | **最高**：确定性、离线、零依赖 | **采用为主方案**，加固：补 `tree_anchor`（内容寻址的 tree sha 才是不可变主体）+ 显式 canonicalization 规则 + 可选签名层 |

### 2.2 机器可消费裁决格式对比（SQ3）

| 格式 | 裁决/结论表达 | 引文锚表达 | 预声明规则绑定 | 降级表达 | 本场景必需字段 | 本场景噪音 |
|---|---|---|---|---|---|---|
| SARIF 2.1.0（OASIS） | `results[]` + `ruleId` 绑定；GitHub 要求 ruleId 跨分析稳定、`partialFingerprints` 做跨 run 去重 | `physicalLocation.artifactLocation.uri` + `region`(startLine/startColumn) + **`snippet`（§3.30.13，artifact 缺失时仍自包含）**；`location.relationships[]`（§3.28.7/§3.34 有向关系） | `run.tool.driver.rules[]`（reportingDescriptor，「信息应很少变化」） | invocation 级 `notifications[]`；GitHub 截断策略=按严重度保 top | **必需**：rule/判据 id（稳定）、location+snippet 自包含引文、稳定指纹、rule 与 result 分离　**噪音**：threadFlows、stackFrames、fix、扫描器 severity 映射、help URL |
| OSCAL assessment-results（NIST v1.1.3） | `findings[].target.target-status`（satisfied / not-satisfied / partially-satisfied）+ `rationale` + `recorded-by`；`results` 汇总 observed 状态 | `observations[]`（证据，含 subjects/origins/methods）+ `relevant-evidence[].links[].href` | 通过 `implementation-statement-uuid` / `related-observations` 关联控制项 | 状态枚举自带第三档 partially-satisfied | **必需（语义层）**：observation=证据、finding.target-status=裁决、relevant-evidence=支持关系——三者语义模型是本票最贴切的「词汇表」　**噪音**：UUID 沼泽、XML/JSON 双载体的控制项/计划/系统文档全家桶（不引入） |
| in-toto statement v1 | `_type` + `subject[{name,digest}]` + `predicateType` + `predicate` | 无（digest 绑定，非行级引文） | `predicateType` = 类型化谓词（可挂自定义 schema） | monotonic principle：忽略字段永不得把 DENY 变 ALLOW；未识别字段 MUST ignore | **必需**：digest 绑定 subject 的 receipt 包络形状、monotonic 验收口径　**噪音**：供应链语义（SLSA 等谓词） |
| CycloneDX attestation（v1.6） | 复用 in-toto 包络 + SBOM 谓词 | 同上 | 同 in-toto | 同 in-toto | 参考：证明「attestation 复用 in-toto 包络」是行业惯例　**⚠ 规范正文未读到（两候选 URL 均 404），仅搜索级证据，不据此下设计结论** |
| JUnit XML（de facto） | `testcase` + `<failure>/<error>/<skipped>` 子元素；**失败项元素形态不变，只加子节点** | 无（system-out 文本） | 无 | **item 级状态在元素内部表达，容器恒有 counts**——「同骨架」最直接先例 | **必需**：item 级状态枚举在固定位置出现的形态先例　**⚠「无官方规范」（testmoapp 原文），各工具 flavor 漂移**——教训：要 agent 可消费就必须自持 schema + 机检，不能寄望事实标准 |

---

## 3. 分点结论（每条带来源；分歧如实标注）

### SQ1 引文→结论支持关系校验

**C1.1 「有引文即通过」为什么不够**：支持是**关系**而非**属性**。当前 `23-gates.json` 的 `citation_checks`（`support:"supports"` + `matched_tokens`）只断言「结论锚 token 在引文原文中逐字命中」——这是必要条件不是充分条件：引文可以存在、token 可以命中、但方向相反（证据说 superseded 结论说 accepted）、或引文只是相关而非支撑。工业界对此有两条独立证据线：
- **FEVER**（arXiv:1803.05355，2018；fever.ai/2018/task.html）把 claim–evidence 判定显式定义为**三分类**：SUPPORTS / REFUTES / NOT ENOUGH INFO。二元「cited/uncited」在该模型里根本不成立——「引文存在但不支撑」与「证据不足不可判」是**不同失败模式**，分别对应本票 22-c §1 的 `unsupported` 与 `insufficient`，不可合并。
- **Bluebook 引证信号**（Wikipedia: Citation signal，全文抓取；JUI 图书馆页，搜索级全文摘录）：每条引文必须带**类型化信号**——no signal（直接支撑/直引）、See（支撑但不直接陈述）、Accord/e.g.、Cf.（类比）、**Contra（直接矛盾）**、But see（间接矛盾）、See generally（仅背景）。法律写作的核心错误之一就是「引了一个其实矛盾的来源却不用 contra 标注」——即**支持关系必须逐引文声明且方向正确**，这与本票 ADR-0013 后果「D-006 引文校验升级为引文→结论支持关系校验」逐字同构。

**C1.2 可机检三元组落地（claim / evidence / support_relation → 5 条断言，全部确定性、零 LLM，符合 D-016）**：

| 断言 | 内容 | 判定方式 | 失败语义（对应 22-c §1 三档） |
|---|---|---|---|
| A1 引文存在 | 每个 claim_id ≥1 evidence_id | 集合检查 | 该结论 `insufficient`（缺口族印记 `data doesn't show`） |
| A2 定位可解析 | evidence.locator 在 pinned commit 下可重开（file:line 或 repo@sha 可解析） | 解析器重放 | `insufficient`（不可验证≠不存在） |
| A3 引文逐字 | evidence.excerpt 是 locator 所指 artifact 的逐字子串 | 子串/哈希比对 | `insufficient`（防引文伪造） |
| A4 支持规则命中 | 按 claim_type 选择确定性规则：metric→数值锚+比较方向；count→计数相等；status→枚举值匹配；relation→双端锚+关系标记；qualitative→token 锚 | 正则/数值/枚举比对（**即现有 matched_tokens 的泛化**） | 命中失败 → `unsupported`（有引文、撑不住） |
| A5 方向检查 | 证据与结论**方向不矛盾**（如 ADR 状态声明 vs 文件实际状态标记；supersede 链方向） | 枚举值/极性比对 | 矛盾 → 该结论标 **refutes** → `unsupported`（FEVER 的 REFUTES 档；这是「有引文即通过」完全漏掉的档） |

**C1.3 能力边界（必须明示）**：FEVER 原机制是微调 BERT 做隐式蕴含判定（论文 abstract）；本票按 D-016 不得接 LLM，因此**隐式语义支撑不可机检**——`supports_indirect` 只能以「锚/关键词在场」近似，语义存疑时保守判 `insufficient` 而非放行。这不是违规，是 D-016 下的诚实边界，应在首报 A 层断言中声明（对应 22-c 对抗清单 A1「口径事实 vs 事实本身」）。

### SQ2 Receipt 印记（不可伪造）

**C2.1 结论**：五机制中**内容寻址哈希链 + 双锚 + gate_ref（+可选本地签名）最贴近「单仓自用、零外部服务」**。依据：
- RFC 3161 的防伪造核心是**签名 imprint**（消息摘要+TSA 身份+时间+序列号），但权威来自 TSA；自托管 TSA（Stella Ops ADR-036 为真实先例）引入 PKI 仪式，超出「单仓、确定性、不接 LLM」的复杂度预算——**否决为主方案，词汇借鉴**（receipt 必含：内容摘要 + 时间 + 身份 + 锚）。
- CT 的 SCT 本质是「日志签名的可离线验证回执」（RFC 6962 §3；certificate.transparency.dev/howctworks 全文）——其价值在**公开透明+监控**，单仓场景无第二个信任方，自托管日志零增益——**否决**。
- in-toto 的 statement 结构（`_type` / `subject[{name,digest}]` / `predicateType` / `predicate`，spec v1 statement.md 全文）+ 两条解析规则（未识别字段 MUST ignore；**monotonic principle：忽略任何字段永不得把 DENY 变 ALLOW**，spec v1 README 全文）——**结构模板采用**：receipt = 对「报告内容 digest + 闸门事实」的签名断言；monotonic 原则直接成为 SQ4 的判据 S4。
- W3C VC 2.0（w3.org/TR/vc-data-model-2.0/，Tavily 提取；web_fetch 403）定义 VC 为「tamper-evident claims + metadata，密码学证明签发者」，proof 内嵌、离线可验——**数据模型借鉴**（claims+metadata+proof 三件齐全），协议不用。
- **关键风险证据（批评角度）**：arXiv:2607.02820《Git Hash Chain Malleability》（2026-07 提交、2026-08 v2，abstract 全文）证明**签名 git commit 的哈希仍可被改变**（ECDSA 代数翻转、OpenPGP 未哈希子包插入、CMS DER 重编码三条路线，且能通过 `git verify-commit` 与 GitHub Verified 徽标），后续所有依赖提交哈希级联改变。→ **receipt 只锚 commit sha 不够，必须同时锚 tree sha**（tree 才是内容寻址的不可变主体）。

**C2.2 降级方案（无密钥时）**：receipt 仍有效为「防篡改（tamper-evident）但不归因」，归因维度打 `⚠ unverified`（复用票 18 既有印记，不新增印记词）——同骨架，只降完整度。

### SQ3 agent 可消费性

**C3.1 载体选择**：保留现有 JSON 侧车（`23-first-report.json`）为唯一机器载体，**按 SARIF 三原则改造**：
1. **rule/result 分离**（OASIS SARIF §3.17/§3.27；GitHub 文档原文：「The ruleId for a result has to be the same across analysis」「rules…should change infrequently」）：B 层判据（22-criteria-pre-registration，已 commit `7395495`）= rules 层（不变、预声明、入库前存在）；C 层裁决 = results 层（随 run 变）。判据 id（PC-1/TC-1/NC-1…）即稳定指纹——对齐 GitHub 用 `partialFingerprints` 做跨 run 去重的机制（GitHub SARIF 文档全文），本票的「裁决去重键 = hash(criterion_id + fact_ids 集合)」。
2. **引文自包含**（SARIF §3.30.13 snippet 原文：「allows a SARIF viewer to present the contents of the region even if the artifact from which it was taken is not available」）：evidence 必带 excerpt 原文 + locator，agent 不重开仓也能校验 A3。
3. **引文锚可解析**（SARIF §3.4.5 artifactLocation.index 的「uri 与 index 必有其一」约束）：locator 要么可解析要么不存在，禁止悬空引用。
**OSCAL 取语义不取 schema**：`observations`（证据）→ `findings.target.target-status`（裁决三值，NIST OSCAL assessment-results outline v1.1.3 索引原文：status 带 reason）→ `relevant-evidence.links`（支持关系）是最贴切的内部词汇表，但其 UUID/控制项全家桶是纯噪音，不引入。
**批评角度交叉验证**：Boost《SARIF Can't Save You Now》（票 15 报告已存档、当时已读全文，此处转引并注明）——SARIF 是「总线」需要状态化 ETL、severity/置信度归一化是真实痛点 → **本票 verdict_gate 协议（decision/level 枚举）必须独立于报告格式**，格式换（如将来出 SARIF 导出）裁决协议不动。
**时效（Currency）**：SARIF 2.2 草案已在 TC wiki 推进（票 15 存档：precision #611、security-severity #612、theLocationOwner #540）；2026-05 JetBrains CLion 2026.1.2 内置 SARIF Viewer（blog 搜索级）、2026-06 sarif-sdk v5.1.0 把 SARIF 规范 markdown + AI findings profile 纳入 SDK（commit 搜索级）——**生态在扩、2.1.0 仍是当前发布版**；若本票落地晚于 2.2 发布，自建的 precision/severity 字段应让位原生字段（决策点，非冲突）。

### SQ4 失败路径同骨架（降级只降完整度不改形态）

**C4.1 工业先例（全部一手原文/索引原文取证）**：
- **OTLP partial success（最强先例）**：OpenTelemetry OTLP spec（1.11.0 文档全文）——「the server response MUST be the **same** Export ServiceResponse message as in the Full Success case. Additionally…MUST initialize the `partial_success` field…set `rejected_*`…SHOULD populate `error_message`」；且**全接受时也允许**用 `partial_success` 发 warning（此时 `rejected_*` MUST = 0、`error_message` MUST 非空）。→ 三态（全成功/部分/失败）**同消息类型**、降级字段**恒在**（可为零值）、降级信息**带内**（in-band）。
- **RFC 9110 §15.3.7（206）**：「Since a 206 response is **self-descriptive**, the client can still understand a response that only partially satisfies its range request」+ 客户端 MUST 检视 Content-Range 才知道缺了什么 → 降级必须**自描述**，缺口可寻址（§14.4 Content-Range 结构：`incl-range / complete-length`，即「缺哪段/总长多少」）。
- **GraphQL June 2018 §7**：「A response may contain **both a partial response as well as encountered errors** in the case that a field error occurred on a field which was replaced with null」+ 错误必须带 `path` 定位到出错字段 → 失败项**在原 schema 原位**以 null+path 表达，不是另开错误通道。
- **gRPC PROTOCOL-HTTP2.md**：`Response → (Headers *Messages Trailers) / Trailers-Only`，「**Status must be sent in Trailers even if the status code is OK**」；Trailers-Only = 空载荷但状态通道完整；Status-Details MUST NOT 与 Status 矛盾 → **状态通道恒在、载荷可为空、状态与明细不得自相矛盾**。
- **JUnit XML**：失败用例 = 同元素 + `<failure>` 子节点，容器 counts 恒在；**但该格式「no official specification」（testmoapp 原文）导致 flavor 漂移** → 教训：同骨架必须**自持 schema + 机检**，不能寄望事实标准。
- **IEEE 829-1998**（standards.ieee.org 摘要 + ku.edu 镜像全文摘录，搜索级；PDF 本体未能提取，如实标注）：「This standard specifies the **form and content** of individual test documents. **It does not specify the required set** of test documents」——**形态固定、集合可裁剪**，即「同骨架」的标准化表述；Test Summary Report 结构含 Variances 节（偏差在既定结构内报告）。时效标注：829-2008 已被 ISO/IEC/IEEE 29119 取代（IEEE SA 页明示），本票引其**原则**而非现行编号。

**C4.2 可机检「同骨架」判据（6 条，对应现有 A 层断言的升级）**：

| 判据 | 内容 | 机检方式 | 先例 |
|---|---|---|---|
| S1 结构不变 | 降级版与 happy 版过**同一个 JSON Schema**（章节 id、必填字段、类型全等） | schema 校验 + 两版字段集 diff = ∅ | JUnit 容器恒有 counts；23-gates.json 已有 `A.skeleton_happy`/`A.skeleton_failure` 雏形 |
| S2 仅值级降级 | 两版差异 JSON-pointer **白名单**：枚举值（三档 verdict/锁定印记词）、evidence 缺位→显式 gap 条目（**不得删除**）、per-chapter integrity 字段 | diff 输出 ⊆ 白名单，越界即 FAIL | GraphQL 原位 null+path；票 18「降级只改 integrity 与印记，不改章节结构」 |
| S3 自描述 | 降级原因可从文档**自身**发现：`degraded` + `degraded_reason` + per-chapter `integrity{coverage,verdict,render}`，无带外通道 | 断言字段恒在；degraded=true 时 reason 非空 | RFC 9110「self-descriptive」；OTLP in-band |
| S4 单调性 | 验证器**忽略任何字段**时，结论只能更保守（supported→insufficient 方向），永不放行 | 验证器实现约束 + 负测试（删字段后裁决必须不升档） | in-toto monotonic principle（spec v1 README 原文） |
| S5 状态恒在 | `overall_verdict` 与每象限 verdict **永不缺省**，值 ∈ {supported, unsupported, insufficient} | 枚举校验 | gRPC「Status even if OK」 |
| S6 缺口可寻址 | 每个降级点带稳定 id，下游 agent 可据 id 发起补查（`gap request: <target>` 的 target 必须是文档内可寻址 id） | 断言所有印记中 `<source_id>/<target>` 在文档内可解析 | RFC 9110 Content-Range「缺哪段」；GraphQL errors.path；22-c GapRequest 语义 |

**C4.3 与票 18 的对接（无改向，升级）**：票 18 已锁定四章骨架不变式（yield=1）+ 印记词表两族分禁（`data doesn't show`/`gap request` = 采集缺口不进裁决；`verdict rejected`/`unverified` = 裁决驳回）——S2 的白名单**必须与印记词表严格一致**，两族印记各归其章（缺口族只许出现在 C3 证据章与 C1 的 `degraded_reason`；驳回族只许出现在 C2 裁决章），这是 A6 对抗项的机检化。

---

## 4. 心智模型/类比映射（≥2，实给 6）

| # | 心智模型（来源） | 支撑本票哪个设计决策 |
|---|---|---|
| 1 | **FEVER 三分类** SUPPORTS/REFUTES/NOT ENOUGH INFO（arXiv:1803.05355 + fever.ai task 页） | SQ1：`support_relation` 四值枚举；`unsupported`（有引文撑不住，含 refutes）与 `insufficient`（不可验证/证据缺）**分家**——直接对应 22-c §1 三档裁决，是 C1.2 表 A4/A5 拆分的依据 |
| 2 | **Bluebook 引证信号** see/cf/contra/see generally（Wikipedia 全文 + JUI 页摘录） | SQ1：支持关系是**类型化、有方向、逐引文声明**的；A5 方向检查 = 机器版「contra 必须标注」；信号层级（direct→indirect→background）即 support_relation 的强度序 |
| 3 | **in-toto monotonic principle**（spec v1 README 原文：忽略字段永不把 DENY 变 ALLOW） | SQ4 判据 S4：验证器 fail-closed 默认 `insufficient`；receipt 签名缺失只降归因维度不降其余（C2.2） |
| 4 | **OTLP partial_success**（OTLP spec 1.11.0 原文：同消息类型 + rejected_*/error_message 恒在，全接受时 rejected=0 仍可发 warning） | SQ4 判据 S3/S5：`degraded_mode` + per-chapter integrity **带内恒在**（零值合法）；这是「同骨架」的最强工业先例 |
| 5 | **SARIF rule/result 分离 + partialFingerprints**（OASIS 规范 + GitHub 文档：ruleId 跨分析必须稳定、指纹做去重） | SQ3：B 层判据（rules，预声明入库）与 C 层裁决（results，随 run 变）分离；判据 id + fact_ids 哈希 = 裁决稳定指纹，agent 可跨 run 引用同一判据 |
| 6 | **RFC 3161 imprint**（摘要+时间+身份+序列号的签名令牌）+ **Git hash chain malleability 反例**（arXiv:2607.02820） | SQ2：receipt 字段集 = 内容摘要 + issued_at + 闸门身份（gate_ref）+ 锚；反例证明**必须加 tree_anchor**，commit sha 单锚不足 |

---

## 5. 与 current 决策的显式冲突点名（约束要求，无静默改向）

| # | 对象 | 关系 | 处置 |
|---|---|---|---|
| 1 | **D-016（采集器确定性、不接 LLM）** | **无冲突，但划定能力边界**：FEVER 原生机制是 BERT 分类；本票只借其三分类词汇，支持判定全部用确定性规则（正则/数值/枚举）。隐式语义支撑不可机检 → 保守判 `insufficient`。该边界须写入首报 A 层声明（对齐 22-c 对抗清单 A1） | 不推荐任何 LLM 判定支持关系的方案（含 LLM-as-judge、NLI 模型），约束遵守 |
| 2 | **D-017 / ADR-0013** | **无改向，属操作化**：ADR-0013 后果「D-006 引文校验升级为引文→结论支持关系校验（撑不住标 unsupported）」由 C1.2 的 A1–A5 落地。唯一细化：A5 失败（refutes）→ `unsupported`；A2/A3 失败 → `insufficient`（「不可验证」≠「撑不住」）。该细化是对 22-c §1 既有定义的**澄清而非新判据**，须回写账本时注明（22-c §5.4 偏离说明条款） | 回写 ledger 时以 A-026 条目记录 |
| 3 | **D-018（判据预声明、阈值跑前写死）** | **流程约束**：receipt 新增 `tree_anchor`/`gate_ref`/`signature` 属 A 层「Receipt 存在」smoke 判据的实现扩展。**若**认定其改变 receipt 定义，按 22-c 对抗清单 A3 口径（「任何改动必须是 v2 追加且 v1 留档」）走 v2 流程；本报告不单方将其定性为 B 层判据变更，也不新增任何 B/C 层判据 | 提请裁定：tree_anchor 定为「A 层实现加固」（推荐）或「receipt v2」（走留档流程） |
| 4 | **票 18 印记词表锁定** | **无新增印记**：receipt 校验失败复用 `⚠ unverified`；「哈希校验失败」vs「签名缺失」的区分建议放 `degraded_reason` 枚举，**不**扩印记词表 | 遵守断言 A6（两族分禁）；S2 白名单与词表对齐 |
| 5 | **A-029（禁止虚构单一综述来源）** | 本报告每条结论给标准号+条款位+URL；FEVER 三分类 = 论文 abstract + task 页双源；IEEE 829 = IEEE SA 页 + 镜像全文摘录（并如实标注 PDF 未提取成功）；CycloneDX = **未验证**，明说不用其下结论 | 无单一综述来源；无编造 URL（全部为实际抓取/索引过的地址） |
| 6 | **单仓样本约束（n=13 ADR）** | 票面写 64 commits，`23-gates.json` 实跑 `commit_count=67`（写票与实跑间仓有演进）——数据以 gates 文件为准。本报告**所有结论均不依赖多仓语料**（哈希链/同骨架/三分类/信号体系均为单文档内可判定性质） | 无改向 |
| 7 | **SARIF 2.2 时效** | 非冲突，**决策点**：若实现落地晚于 SARIF 2.2 发布（TC wiki 已见 precision/security-severity/theLocationOwner 提案），自建 precision/severity 字段应让位原生字段（票 15 报告缺口 3 已预告此风险） | 落地前查 OASIS 发布状态一次即可 |

---

## 6. 对票 23 实现的推荐方案（字段级，可直接落地）

### 6.1 `23-gates.json` → `citation_checks[]` 扩展（SQ1）

```jsonc
{
  "claim_id": "CL-001",
  "claim_text": "…",                                  // 新增：结论原文（A5 与 agent 引用所需）
  "claim_type": "metric",                              // 新增：metric|count|status|relation|qualitative，决定用哪条支持规则
  "evidence_id": "EV-006",
  "support_relation": "supports_direct",               // 替代二值 "supports"：supports_direct|supports_indirect|refutes|insufficient
  "rule": {                                            // 新增：确定性支持规则（跑前声明；无 LLM，D-016）
    "kind": "numeric_inequality",                      // numeric_inequality|token_hit|enum_match|endpoint_pair
    "anchors": ["mean_ratio_4", "0.2462"],             // 现有 matched_tokens 升格为声明锚
    "direction": "eq"                                  // eq|ge|le|contains|present|absent
  },
  "checks": {                                          // 新增：A1–A5 五断言（全部机检）
    "A1_citation_present": true,
    "A2_locator_resolvable": true,
    "A3_excerpt_verbatim": true,
    "A4_rule_matched": true,
    "A5_direction_ok": true
  },
  "matched_tokens": ["mean_ratio_4", "0.2462"],        // 保留：兼容现有 A 层断言
  "missing_tokens": []
}
```
映射：任一 A1–A3 假 → 该结论 `insufficient`（缺口族印记）；A4 假 → `unsupported`；A5 假 → `refutes` → `unsupported`（驳回族印记）。

### 6.2 `23-first-report.json` → `receipt` 扩展（SQ2）

```jsonc
"receipt": {
  "receipt_id": "…", "chain_hash": "…", "issued_at": "…",   // 保留
  "commit_anchor": "…",                                       // 保留
  "tree_anchor": "…",             // 新增：tree sha（抗 commit 哈希可塑性，arXiv:2607.02820）
  "content_digest": { "algo": "sha256", "value": "…", "canonicalization": "keys_sorted_utf8_no_ws" },
                                                                   // 新增：显式算法+规范化规则（RFC 3161 imprint 词汇）
  "gate_ref": {                    // 新增：预声明闸门引用——「经过闸门而非事后生成」的证明
    "prereg_commit": "7395495",     // 现有 preflight.t22_prereg_commit 升格入 receipt
    "criteria_path": "…22-criteria-pre-registration.md",
    "basis_path": "…22-c-adjudication-basis.md",
    "criterion_ids": ["PC-1","PC-2","TC-1","TC-2","TC-3","NC-1"]
  },
  "fact_count": 228, "adjudication_count": 6, "degraded": false,  // 保留
  "signature": {                   // 新增，可选（非阻断层）：本地 Ed25519，无网络（in-toto/Sigstore 离线签名模式）
    "algorithm": "ed25519", "key_id": "…", "value": "base64…"   // 无密钥时 = null → 归因维度 ⚠ unverified，其余不降
  },
  "verification": {                // 新增：自描述验证步骤（RFC 9110 self-descriptive 原则）
    "steps": ["canonicalize(report.json)", "sha256 == chain_hash", "git cat-file <tree_anchor> 存在且 == commit.tree", "gate_ref.prereg_commit 拓扑先于 commit_anchor"]
  },
  "mark": "…"                      // 保留
}
```
机检验收 R1–R5：R1 重哈希一致；R2 tree_anchor 存在于该 commit；R3 `gate_ref.prereg_commit` **拓扑先于** `commit_anchor`（预声明先于报告的机器证明，呼应 HARKing 禁令）；R4 签名（若存在）可验；R5 任一 R1–R3 失败 → 全报 `⚠ unverified`，骨架不变。

### 6.3 裁决块载体（SQ3）

- **载体**：JSON 侧车（现有）为唯一机器载体；SARIF/OSCAL **只借词汇与原则，不引 schema**。
- **分离**：B 层判据文档（rules 层，`7395495` 已入库）不随报告变化；报告内每 verdict 引用 `criterion_id`（= SARIF ruleId 角色）。
- **引文锚**：evidence = `{locator(可解析), excerpt(逐字自包含, = SARIF snippet 角色), collected_at, reproduce_cmd}`（现有 C3 骨架已具备，仅需 A3 断言机检化）。
- **指纹**：`verdict_fingerprint = sha1(criterion_id + sorted(fact_ids))`（= partialFingerprints 角色，供跨 run 对齐）。
- **裁决块最小必需字段**：`criterion_id, verdict(三值), verdict_fingerprint, evidence_refs[], support 断言引用, decided_at, audit_ref`；**噪音剔除**：threadFlow/stack/fix/扫描器 severity/help URL/CVSS（若做 SARIF 导出为可选 profile，不进核心 schema）。
- **verdict_gate 协议独立**（Boost 批评教训）：`verdict_gate.{decision, level, protocol_version}` 自成协议，报告格式可换、协议不动。

### 6.4 失败路径机检套件（SQ4）

在现有 A 层断言（票 18 的 A3/A7：骨架 yield=1 + 印记词表）之上，新增 S1–S6 六条机检（§3 C4.2 表），其中：
- S1/S2 直接消费 `23-gates.json` 的 `A.skeleton_happy/skeleton_failure`（从「标题清单比对」升级为「字段集 diff = ∅ + 差异 pointer ⊆ 白名单」）；
- S4 以**负测试**机检：构造「删字段」与「删签名」两个变异体，断言裁决不升档（monotonic，in-toto）；
- S6 与 22-c GapRequest 语义闭环：`gap request: <target>` 的 `<target>` 必须解析到文档内 evidence/skeleton id，agent 可据此发起补查——这是「信任并行动」的最小动作面。

---

## 7. 信息缺口（仍不知道什么）

1. **CycloneDX v1.6 规范正文未读到**（`cyclonedx.org/specification/versions/1.6/` 与 `v-1_6` 均 404；GitHub 仓库结构可见但未下钻）——矩阵中该行仅搜索级证据，**未用于设计结论**；如需入报告应补抓 spec 仓库 raw 路径。
2. **IEEE 829-1998 全文 PDF 提取失败**（二进制流）——「form/content 固定、集合可选」与 TSR 结构引自 Exa 对该 PDF 的全文摘录 + IEEE SA 摘要，**未逐页核验**；结论止于原则层（与票 15 报告缺口 2 口径一致）。
3. **RFC 3161 全文未整读**（rfc-editor 抓到的是 info 页 + 搜索级正文摘录）——imprint 字段集为标准常识级内容、风险低，但精确条款位（§2.4.1/§2.4.2）落地前应再核一次原文。
4. **SARIF 2.2 规范正文未读**（仅 TC wiki + sarif-sdk commit，票 15 已预告）——2.2 发布前本票按 2.1.0 设计，发布后做字段让位检查（§5-7）。
5. **本地 Ed25519 签名层的密钥管理**未调研深水区（密钥放仓 vs 环境变量的取舍、轮换）——属实现期细节，不影响本票裁决；建议落地时单独立小票。
6. **FEVER 三分类在本仓 ADR 语料上的判别力**未实测（n=13 样本上 `supports_indirect` 与 `insufficient` 的分布未知）——这正是 B 层 kill criterion 要回答的，不在 desk 调研范围。

---

## 8. 完整来源清单（26 源；标注抓取角度/日期/贡献/读取深度）

| # | 来源 | 角度 | 日期 | 贡献 | 读取深度 |
|---|---|---|---|---|---|
| 1 | OASIS SARIF v2.1.0 规范 — docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html | Official | 2024（发布版） | §3.30.13 snippet、§3.28.7/§3.34 relationships、§3.4.5 artifactLocation.index——SQ1/SQ3 引文锚机制全部条款位 | 全文索引（585 节），条款级取证 |
| 2 | FEVER: FAct Extraction And VERification — arxiv.org/abs/1803.05355 | Official | 2018 | claim-evidence 三分类定义（SQ1 核心模型） | abstract 全文 |
| 3 | FEVER 2018 task page — fever.ai/2018/task.html | Official | 2018 | 任务设定、evidence=Wikipedia 句、三类判定 | 全文 |
| 4 | Wikipedia: Citation signal — en.wikipedia.org/wiki/Citation_signal | 百科 | 当前 | 11 信号全表 + 排序规则（SQ1 A5） | 全文 |
| 5 | Swisher Library (JUI) Bluebook signals — library.ju.edu/bluebook-citation/signals | Official(机构) | 未标 | 四组信号分类、see also 误用反例 | 搜索级全文摘录 |
| 6 | RFC 3161 — rfc-editor.org/rfc/rfc3161 | Official | 2001 | TSA imprint 结构、自托管 TSA 讨论线索 | info 页全文 + 正文摘录（全文未整读，已标注） |
| 7 | RFC 6962 — rfc-editor.org/rfc/rfc6962.html | Official | 2013 | CT log/SCT/包含证明（SQ2 否决依据） | 全文 |
| 8 | Certificate Transparency: How it works — certificate.transparency.dev/howctworks | Official | 当前 | SCT=日志签名的可离线验证回执 | 全文 |
| 9 | in-toto attestation spec v1 README — raw.githubusercontent.com/in-toto/attestation/.../spec/v1/README.md | Official | v1.2 | **monotonic principle**、未识别字段 MUST ignore（S4/C2.2） | 全文 |
| 10 | in-toto statement.md — 同仓 spec/v1/statement.md | Official | v1 | `_type/subject[digest]/predicateType` 结构（receipt 包络模板） | 全文 |
| 11 | W3C VC Data Model 2.0 — w3.org/TR/vc-data-model-2.0/ | Official | CR 2025-05 | 「tamper-evident claims + 内嵌 proof、离线可验」定义（web_fetch 403，经 Tavily extract） | 提取级（§3.2 关键段） |
| 12 | OSCAL assessment-results JSON outline v1.1.3 — pages.nist.gov/OSCAL-Reference/models/v1.1.3/assessment-results/json-outline/ | Official | 当前 | findings.target.target-status（三值+reason）、observations、relevant-evidence（SQ3 语义词汇） | 全文索引，条款级取证 |
| 13 | OpenTelemetry OTLP spec 1.11.0 — opentelemetry.io/docs/specs/otlp/ | Official | 当前 | Full/Partial/Failure 同消息类型、partial_success 恒在（S3/S5 最强先例） | 全文 |
| 14 | GraphQL spec June 2018 §7 — spec.graphql.org/June2018/ | Official | 2018 | partial response + errors 并存、path 寻址（S6） | 全文索引，条款级取证 |
| 15 | RFC 9110 §15.3.7/§14.4 — rfc-editor.org/rfc/rfc9110 | Official | 2022 | 206 self-descriptive、Content-Range（S3/S6） | 全文索引，条款级取证 |
| 16 | gRPC PROTOCOL-HTTP2.md — grpc.github.io/grpc/core/ | Official | 当前 | Trailers/Trailers-Only、「Status even if OK」（S5） | 全文 |
| 17 | testmoapp/junitxml — raw.githubusercontent.com/testmoapp/junitxml/.../README.md | Community | 2023 | 「no official specification」、flavor 漂移教训（C4.1） | 全文 |
| 18 | IEEE 829-1998 — people.eecs.ku.edu 镜像 + standards.ieee.org/ieee/829/1218 | Official | 1998 | form/content 固定、集合可选；TSR 含 Variances；被 29119 取代（时效标注） | 搜索级全文摘录（PDF 提取失败，已标注） |
| 19 | GitHub SARIF support — docs.github.com/.../sarif-files/sarif-support | Official | 当前 | ruleId 跨分析稳定、partialFingerprints 去重、PR diff 定位条件（SQ3 指纹） | 全文 |
| 20 | Git Hash Chain Malleability — arxiv.org/abs/2607.02820 | Official(预印本)/Criticism | 2026-07 提交、2026-08 v2 | commit 哈希可塑三条路线 → **tree_anchor 加固**依据 | abstract 全文 |
| 21 | JetBrains CLion 2026.1.2 SARIF Viewer — blog.jetbrains.com/clion/2026/05/sarif-viewer | Currency | 2026-05-20 | SARIF 生态 2026 仍在扩张 | 搜索摘要 |
| 22 | microsoft/sarif-sdk v5.1.0 commit a4fc88e | Currency | 2026-06-17 | SARIF 规范 markdown + AI findings profile 入 SDK（生态/时效信号） | 搜索摘要 |
| 23 | Boost《SARIF Can't Save You Now》（经票 15 报告 15-atomcode-research.md 转引，该票当时已读全文） | Criticism | 2022-11-03 | SARIF=总线需状态化 ETL、severity 归一化痛点 → verdict_gate 协议独立 | 转引（原始全文读取发生于票 15 会话，本会话未重抓，已标注） |
| 24 | nesbitt.io《Signing is for the bad days》 | Community | 2026-05-24 | Sigstore attestation 绑定 CI 身份的语境 | 搜索摘要 |
| 25 | TestifySec《Sigstore vs. In-toto》 | Comparative | 未标 | Sigstore=信任基础设施 vs in-toto=陈述格式，互补定位（SQ2 取舍佐证） | 搜索摘要 |
| 26 | SARIF TC Wiki《What's new in SARIF 2.2》（经票 15 报告转引） | Currency | 2026-02 | precision #611 / security-severity #612 / theLocationOwner #540（§5-7 决策点） | 转引（同上） |

**引擎交叉验证说明**：Exa（web_search）/ Tavily（tavily_search+extract）/ AnySearch（academic 垂直 + batch）三引擎均覆盖四个子问题；关键结论的双源情况——FEVER 三分类（Exa+AnySearch 学术库）、Bluebook 信号（Exa+AnySearch 批量）、in-toto monotonic（Exa 仓库+Tavily 生态文）、RFC 3161/CT（Exa+Tavily）、OTLP partial success（Exa 规范+Tavily 社区 issue 讨论，含一个实现分歧：rejected=0 但 error_message 非空时日志级别，见来源 13 检索命中，不影响本票结论）、JUnit 无官方规范（Exa+AnySearch 双引擎同结论）、git 哈希可塑性（Exa+AnySearch 同命中）。**无两源冲突未决项**；唯一「分歧」已如实记录为 OTLP 实现层面日志级别讨论，不触及本票设计。

---

## 9. Sufficiency Gate 自查

`searches: 22 次工具调用 / ~25 个独立查询 | angles: Official+Comparative+Criticism+Currency+Community（五类全用）| full reads: 20+ URL 实读（15+ 独立域名），其中规范/标准/论文 14 份 | gaps: CycloneDX 正文、IEEE 829 PDF 提取、RFC 3161 全文整读、SARIF 2.2 正文、本地密钥管理深水区（均已列入 §7，无硬凑板块）`

---

*报告完。核心交付：SQ1 五断言模型（A1–A5）、SQ2 双层 receipt（哈希双锚+gate_ref+可选签名）、SQ3 SARIF 三原则改造、SQ4 六条同骨架机检（S1–S6），字段级建议见 §6，可直接作为票 23 实现与 A 层断言扩展的输入。*
