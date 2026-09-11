# Report: A-018 — Failure path 明文

- **A-xxx:** A-018
- **Decision:** `spec.md` §Decision 7.2
- **ADR ref:** `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` / `docs/adr/0006-shared-skeleton-scale-slice.md` / `docs/adr/0007-ten-demo-paths.md`
- **对应 issue:** `issues/18-failure-path-detail.md`
- **对应 handoff:** `handoffs/18-failure-path-detail.md`
- **对应 prompt:** `prompts/18-failure-path-detail.md`
- **Report date:** 2026-09-11
- **Verdict:** 5 条 failure path 全部明文，每条 4 要素（触发条件 / 降级模式 / verdict-gate 拒绝印记 / 报告产物形态）齐全并逐条显式与 happy path 对比；其中 **FP-4 / Micro-A failure** 已用可执行夹具真实跑通，与 happy path 同骨架对比，**9/9 守卫断言 PASS**。`confidence: 高`。

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

**Blocked by: #17** —— 状态：**已解除**。依据 `decision-ledger.md` A-017 行与 `reports/17-report.md`：#17 已闭环，决议为「10 路径中 6 条可点 / 4 条文档」，总 clickable 预算 18.5 agent-days；并明确「4 条文档 failure path 交由 A-018 明文触发 / 降级 / 报告产物」。本票据此开工，不再等待。

**必读清单全部路径 + 阅读状态：**

| # | 路径 | 状态 |
|---|---|---|
| 1 | `issues/18-failure-path-detail.md` | 已读全文（531 B） |
| 2 | `handoffs/18-failure-path-detail.md` | 已读全文（1,201 B） |
| 3 | `spec.md` §Decision 7.2 | 已读（L114-116 + Coverage 表 L145） |
| 4 | `WORKFLOW.md` §4.2 | 已读（§4.2.1 版本控制 / §4.2.2 文件写入 / §4.2.3 调研 / §4.2.4 决策账本 / §4.2.5 报告 / §4.2.6 启动器硬规则） |
| 5 | `decision-ledger.md` A-018 | 已读（L26 条目 + L25 A-017 前置关系） |
| 6 | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 已读全文（Status: accepted） |
| 7 | `docs/adr/0006-shared-skeleton-scale-slice.md` | 已读全文（Status: accepted） |
| 8 | `docs/adr/0007-ten-demo-paths.md` | 已读全文（Status: accepted） |
| 附 | `CONTEXT.md` 相关术语 | 已读：Failure Path / Degraded Demonstration / Happy Path / Evidence Gate / Sufficiency Gate / Failure Semantics / Adjudication Protocol / Verdict Gate |
| 附 | `reports/17-report.md` | 已读全文（172 行）—— 本票 5 条 failure path 的名单与可点/文档属性直接取自其 §2/§3.2 |

> **carrier 说明：** 本窗口 `ctx_*` / `ctx_batch_execute` / `ctx_execute` / `ctx_execute_file` 均已暴露并实际使用（文件读取、磁盘写入、脚本执行、调研全部走 ctx carrier，无 fallback）。`atomcode 5.0.9` 可用，已按 WORKFLOW §4.2.3 以 `ctx_batch_execute(concurrency=1, timeout=600000)` 串行调用，未并发。

---

## 1. 调研（per WORKFLOW §4.2.3 — atomcode 深度调研）

**调用：** `ctx_batch_execute(commands:[{label:"atomcode-A018-research", command:"atomcode -p "...""}], concurrency:1, timeout:600000)`

**配额达成：** 12 次三引擎查询（Exa / Tavily / AnySearch）+ 7 次原文核验 + 8+ 域名 + 双源交叉验证覆盖全部关键结论。`Confidence: 高`。

### 1.1 六条分点结论（每条标注来源编号）

| # | 结论 | 对本票的落地影响 |
|---|---|---|
| C1 | **降级只允许降低「内容完整度/置信度」，不允许改变「产物形态」** —— Fox & Brewer 的 harvest/yield 形式化与 OTel Demo 的「失败与成功产生同构 span」独立收敛于同一结论 | 立为 **骨架不变式**：ADR-0006 四章标题在任何降级下必须存在（yield=1），降级只改每章 `integrity: {coverage, verdict, render}` 与印记 |
| C2 | **证据采集失败的正确降级不是「重试到成功」，而是「fail fast + 部分 harvest + gap 声明」** —— 慢依赖比崩溃依赖更危险（耗尽连接池）；naive retry 与疏于维护的 fallback 是事故根源 | FP-1 / FP-3 / FP-5 的降级模式一律禁用 naive retry，改用 per-source breaker + bulkhead + 独立预算 |
| C3 | **裁决被驳回是最被低估的降级路径，且有实证数据** —— CodeRabbit 实证（31,073 次评审 / 10,191 PR）：**56.3% 被开发者驳回**，其中 58% 属无效建议（43.3% 假阳性 / 10% 超范围 / 4.7% 冗余），42% 属与意图惯例不合 | 驳回原因必须 **分类编码**（`false_positive` / `out_of_scope` / `redundant` / `misalignment`）且可申诉；驳回 ≠ 终局，需保留 re-adjudication 入口 |
| C4 | **门禁拒绝印记的三个工业原型** —— `contains uncited claims` ↔ Wikipedia `{{citation needed}}` + EY citation enforcement（无 URI 即 abstain）；`data doesn't show` ↔ NIST SI-11 + EY 低分拦截；`gap request` ↔ EY closed-loop RAG 重检索 | 印记是「请求/声明」而非「错误码」：既要机器可读（结构化字段）也要人类可读（自然语言注释）；**词表锁定，禁止自由发挥** |
| C5 | **叙事超时的代价曲线有工业证据** —— EY：未验证 LLM 声明首次正确率仅 70–85%，5 步验证后接近零误差，但验证消耗约 50% 的 AI 节省时间 | 叙事预算必须显式包含「验证时间」；超时降级为「已验证段落 + 未验证断言列表」，未验证项进 `unverified` 桶，**绝不混入已验证结论** |
| C6 | **报告渲染异常最易与裁决层耦合，应隔离** —— NIST SI-11 错误消息结构 + bulkhead 资源隔离 | 渲染层失败只降渲染（该节降为纯文本/JSON 兜底），**不得污染 verdict-gate 状态**（FP-5 的核心约束） |

### 1.2 工业对标矩阵（≥2 个成熟心智模型 / 工具 / 论文）

| 类比（来源） | 触发条件机制 | 降级模式 | 门禁印记 / 产物 | 可吸收点 | 不适用边界 |
|---|---|---|---|---|---|
| **Google SRE 错误预算**（sre.google/workbook/error-budget-policy，原文核验） | SLO 四周窗口内预算耗尽（99.9% SLO = 0.1% 预算）；单事件消耗 >20% 预算强制 postmortem | 冻结变更/发布（除 P0/安全修复）；团队转向可靠性工作；**分歧升级 CTO 裁决** | 预算耗尽本身即印记；postmortem 必须含 ≥1 个 P0 action item | ①触发条件必须可量化、可自动判定，不能「看情况」；②升级通道要明文（本票落地为 GapRequest TTL + 申诉通道） | SRE 管的是服务可靠性，不管「结论是否可采信」；其冻结语义不能直接套到单条审计结论 |
| **OpenTelemetry Demo（flagd 故障注入）**（官方文档原文核验） | feature flag 显式开关，可调百分比（PR #3625 把布尔改为 10%/25%/50% 变体） | 每个故障场景 = 可开关、可回放的显式剧本（含 `llmInaccurateResponse` 返回预置不准确结果） | **失败路径与成功路径产生同构 span**（error=true 但 trace 结构一致），故障可通过 span 属性追踪到注入点 | ①failure 演示必须是可回放剧本而非碰运气复现；②**降级产物与正常产物共享结构**——直接支撑 ADR-0006 骨架不变式 | OTel 没有判定层：flag 由人切换，而审计降级需按触发条件自动进入；verdict-gate 语义必须自建 |
| **Fox & Brewer: Harvest/Yield**（论文原文核验） | 形式化定义：yield = 响应必达率，harvest = 内容完整度 | 保持 yield=1，按需降低 harvest | 响应骨架不变 | 给「骨架不变」这条硬约束提供了形式化依据，避免它被当成风格偏好 | 论文处理的是分布式数据可用性，不涉及证据可采信性；只能借其形式，不能借其判据 |
| **Circuit Breaker / Bulkhead**（hld.handbook.academy 对比文） | 慢依赖 vs 崩溃依赖；breaker 状态机 + 三种隔离粒度 | 熔断 + 资源隔离（Envoy per-host 优于 per-service） | 无（基础设施层） | ①**慢依赖比崩溃依赖更危险**——直接否决 naive retry；②隔离粒度指导「渲染层 vs 裁决层」「per-source」的划分 | 只有「断开」语义，没有「部分 harvest + 声明缺口」语义；不能单独满足审计降级需求 |
| **NIST SP 800-53 SI-11 / AI RMF / ISO 15489**（csf.tools SI-11、nvlpubs AI RMF 1.0） | 错误条件的结构化处理 | 错误消息给足纠正信息、防泄露内部细节 | 可追溯 / 可审计的记录属性 | ①错误消息是「给足纠正信息」而非裸错误码——支撑印记的人类可读要求；②traceability 是合规市场的硬需求 | 规范给的是要求不是设计；ISO 15489-1:2016 全文在付费墙后（见 §1.3 缺口） |
| **CodeRabbit 驳回实证（2026-07）/ EY 幻觉风险白皮书**（alphaXiv、EY GL，原文核验） | 开发者驳回行为；LLM 声明正确率 70–85% | 驳回分类学 + 5 步验证工作流 + citation enforcement（无 URI 即 abstain）+ closed-loop RAG 重检索 | 驳回率 56.3%；验证吃掉约 50% 的 AI 节省时间 | ①驳回是常态不是异常；②「无 URI 即 abstain」是 Evidence Gate 零容忍的工业依据；③验证成本必须计入预算 | 二者是代码评审与咨询场景，不含 5 scale 四阶段时序；投影到本产品需实跑确认（本票 §3 已做） |

### 1.3 Sufficiency Gate — 信息缺口（未闭合项，显式登记）

| 缺口 | 影响 | 建议闭合方式 |
|---|---|---|
| **ISO 15489-1:2016 全文未读**（付费墙，仅 OBP 目录 + iTeh 样本片段） | 若产品要宣称 ISO 对齐，「AAT 审计工具如何把记录属性转成检查问题」未核验 | 补读或购买全文；v1 不宣称 ISO 对齐 |
| **NIST AI RMF 1.0 traceability 具体功能段只读到摘要级**；AI RMF 2.0（2024）未查 | 合规市场的可追溯性要求边界不清 | 补读 AI RMF 1.0 PDF 全文 + 2.0 差异 |
| **GapRequest 补查轮的工业对应（closed-loop RAG 重检索）目前只有 EY 单一来源** | 单一来源支撑，交叉验证不足 | 再交叉验证 agent tool-use retry loop 文献 |
| **EU AI Act conformity assessment / technical documentation 条款未展开**；ISO 19011 审计管理标准未查 | 面向合规市场时缺官方角度 | 若进合规市场另开调研票 |
| **CodeRabbit 驳回预测模型的输入特征只见摘要**（76% F1，Qwen3-4B LoRA） | 「verdict-gate 拒绝原因自动分类」的可迁移细节不足 | 若要自动化分类需补读论文方法段 |
| **OTel Demo `paymentUnreachable` 端到端行为未实测** | failure path 演示的参照物缺实测 | 演示阶段直接跑一遍 OTel Demo 作为对照 |
| **本票自有缺口**：FP-1/FP-2/FP-3/FP-5 为文档路径，仅明文未实跑 | 4 条 failure path 的触发阈值（如 `min_required` 历史深度、`parser_limit_bytes`）尚未用真实语料校准 | Phase 4 实施时按 W2 #02 先例，配可复用 .mjs + 真实数据集 + 精度验证三件套 |

---

## 2. 5 条 failure path 明文表

### 2.1 三条共享约束（先于表格成立）

1. **骨架不变式（yield=1）**：任何降级下报告四章标题 —— 执行摘要 → 4 象限 / 裁决 → 证据 → 行动建议 —— 必须逐字存在。降级只改每章 `integrity: {coverage, verdict, render}` 与印记，**不改章节结构**。依据：ADR-0006 + Fox & Brewer harvest/yield (C1) + OTel 同构 span。
2. **印记词表锁定**：`⚠ data doesn't show: <source_id>` / `⚠ contains uncited claims` / `⚠ gap request: <target>` / `⚠ verdict rejected: <reason_code>` / `⚠ rendering degraded: <section_id>` / `⚠ unverified`。**禁止自由发挥新印记**（由 A6 断言机检）。
3. **两类印记不得混用**：`data doesn't show` + `gap request` = 采集/证据缺口（**不进裁决**）；`verdict rejected` + `unverified` = 裁决驳回（**已进裁决并被拒**）。混用会让用户无法区分「没查到」与「查到了但不采信」。

### 2.2 五条 failure path（每条 4 要素齐全）

| # | 路径（scale / 属性） | ① 触发条件（明文 + 可机检） | ② 降级模式（显式，非沉默） | ③ verdict-gate 拒绝印记 | ④ 报告产物形态 |
|---|---|---|---|---|---|
| **FP-1** | Macro-A failure：跨仓证据不足 / portfolio 缺事实<br>**文档** | portfolio 内 ≥1 个目标仓在采集预算内未返回 / 返回空 / schema 违约 / 鉴权失败；或已采仓数 N < 声明覆盖仓数 M。<br>机检：`collected_repos < declared_repos` 或 `source.status ∈ [TIMEOUT, EMPTY, SCHEMA_VIOLATION, AUTH_FAILED]`；预算 = per-source 独立（p99.9 + 2s）× 重试预算 | **fail fast + 部分 harvest + gap 声明**：按仓独立 breaker + bulkhead；已采仓证据照常入证据章；未采仓章节降级为 gap 声明，**不阻塞叙事**；执行摘要显式声明 N/M 覆盖率。<br>**禁止**：naive retry 重试到成功（C2）、静默省略缺仓、因缺仓拒出报告 | `⚠ data doesn't show: <repo_id>`<br>`⚠ gap request: <repo_id>`<br>`reason_code: SOURCE_UNAVAILABLE`<br>`enters_adjudication: false` | 四章与 happy 逐字相同；`integrity.coverage = N/M`、`verdict = n/a`；执行摘要带「本报告基于 N/M 个仓库，缺口见附录」；证据章该仓节 = gap 声明块（含 attempts / error class / 时间戳） |
| **FP-2** | Macro-B failure：仓库级证据门拒绝 / 引文缺失<br>**文档** | 4 象限中任一象限的叙事断言存在 citations 为空，或引用 ref 在证据集中不可解析。<br>机检：`quadrant.uncited_claims > 0` 或 `quadrant.unresolvable_refs > 0`；Evidence Gate 门槛 = 每条断言绑定 ≥1 条可解析证据；叙事预算显式含验证时间（C5） | **部分叙事保留 + 无引文句降级为结构化断言列表 + GapRequest 补查轮**：已完成且带引文的象限照常保留；无引文句降级为无引文链接的断言列表；对该象限发 GapRequest（TTL + 升级通道，防 Wikipedia backlog 病）；未验证断言进 `unverified` 桶，绝不混入已验证结论。<br>**禁止**：补写「看起来合理」的引文 | `⚠ contains uncited claims`<br>`⚠ verdict rejected: NO_CITATION`<br>`reason_code: NO_CITATION`<br>`enters_adjudication: true`<br>`taxonomy: false_positive / out_of_scope / redundant / misalignment` | 四章与 happy 逐字相同；`integrity.verdict = rejected（该象限）`；被驳回象限原位占位 + 降级注释；行动建议章只收已过 gate 的建议，被驳回项进「未通过裁决」小节并保留 re-adjudication 入口 |
| **FP-3** | Macro-C failure：历史或 ADR 时间戳不足<br>**文档** | 目标仓 git 历史深度不足以支撑演化对比，或 ADR 缺 YAML 时间戳头导致 drift 不可计算；**浅克隆（fetch-depth:1）一律判为污染**。<br>机检：`history_depth_commits < min_required` 或 `adr_timestamped_ratio < threshold` 或 `repo.shallow_clone === true`（一票否决） | **时间轴降级为「可计算窗口」+ 窗口外显式声明 + 请求 full history**：计算可支撑对比的窗口 `[t0, t1]`；窗口内正常出演化对比；窗口外显式标 `data doesn't show`，不做外推；发 gap request 请求 `fetch-depth=0` 重采。<br>**禁止**：用浅克隆 pack 边界伪造历史（W2 #02 教训：会把 4 年回顾文档误判为治理差）、窗口内趋势外推 | `⚠ data doesn't show: git_history[<window>]`<br>`⚠ gap request: fetch-depth=0`<br>`reason_code: HISTORY_INSUFFICIENT`<br>`enters_adjudication: false` | 四章与 happy 逐字相同；`integrity.coverage = window_ratio`；演化对比章显示「可计算窗口 [t0, t1]」+ 窗口外占位块（标注缺口而非留白）；CI 评估时 `fetch-depth: 0` 为硬约束 |
| **FP-4** | Micro-A failure：PR 结论无引文被 verdict-gate 拒绝<br>**可点（本票唯一实跑）** | PR 行级结论的 citation 数为 0，或引用 ref 在采集证据集中不可解析；Micro-A 是裁决入口，不容忍 partial。<br>机检：`finding.citations.length === 0` 或 `finding.citations.some(c => !evidence_refs.has(c.ref))`；阈值 = 任一 finding 无引文即触发（无 URI 即 abstain，C4） | **无引文 finding 进 unverified 桶 + GapRequest 补查轮 + 驳回原因分类编码**：TTL 72h + 升级到 Adjudication Protocol 申诉通道；驳回原因按 C3 分类学编码供后续再训练；该 finding **不进入行动建议章**。<br>**禁止**：降级为「概率性评论」（Micro-A 核心卖点就是「不是概率性评论机器人」）、被驳回却仍出现在行动建议章 | `⚠ contains uncited claims`<br>`⚠ verdict rejected: NO_CITATION`<br>`⚠ unverified`<br>`reason_code: NO_CITATION`<br>`enters_adjudication: true` | 四章与 happy 逐字相同；`integrity.verdict = rejected`；行级评审表该行打印记；行动建议章 **N → 0 条**，「未通过裁决」小节列出该 finding + re-adjudication 入口。实跑见 §3 |
| **FP-5** | Micro-B failure：文件过大 / 解析失败 / 局部证据不足<br>**文档** | 文件大小超解析上限，或解析器抛错，或局部 facts 采集失败。<br>机检：`file.bytes > parser_limit_bytes` 或 `parser.status === "ERROR"` 或 `facts.status === "FAILED"`；Micro-B 为 advisory 层，不进主裁决路径 | **分节渲染 + 失败节降级为纯文本/JSON 兜底 + 渲染层与裁决层隔离**（C6 bulkhead）：已解析节正常渲染；失败节原位降级为结构化 JSON 兜底块；渲染状态写入 `integrity.render`，**不写 verdict**；advisory 语义保持，降级不外溢到主裁决路径。<br>**禁止**：解析失败污染 verdict-gate 状态、整份质量卡因单节失败拒出 | `⚠ rendering degraded: <section_id>`<br>`⚠ data doesn't show: file_facts`<br>`reason_code: PARSE_FAILED`<br>`enters_adjudication: false` | 四章与 happy 逐字相同；`integrity.coverage = partial`、`verdict = n/a（advisory）`、`render = degraded`；文件质量卡对应节原位占位 + 结构化 JSON 兜底；全报告 integrity metadata 标记渲染状态 |

### 2.3 与 happy path 的显式对比（不可只列 failure 自身）

| # | failure path | 对应 happy path | 逐项差异（happy → failure） |
|---|---|---|---|
| FP-1 | Macro-A failure：跨仓证据不足 | Macro-A happy：跨仓战略对齐审计（**可点**） | ①`coverage`: M/M → N/M；②证据章该仓节：完整战略叙事 → gap 声明块；③印记：无 → `data doesn't show` + `gap request`；④章节结构：**完全不变** |
| FP-2 | Macro-B failure：证据门拒绝 / 引文缺失 | Macro-B happy：单仓 4 象限审计（**可点**） | ①该象限 `verdict`: ok → rejected；②引文盖章：grounded ✓ → `⚠ contains uncited claims`；③建议位置：行动建议章 → 「未通过裁决」小节；④章节结构：**完全不变** |
| FP-3 | Macro-C failure：历史 / ADR 时间戳不足 | Macro-C happy：演化考古 / ADR drift 审计（**可点**） | ①时间轴：全时段 → 窗口 `[t0, t1]`；②drift 曲线：完整 → 窗口内完整 + 窗口外占位；③印记：无 → `data doesn't show` + `gap request`；④章节结构：**完全不变** |
| FP-4 | Micro-A failure：PR 结论无引文被拒 | Micro-A happy：PR diff 行级审计 + verdict-gate（**可点**） | ①`verdict`: pass → rejected；②行动建议章：N 条 → 0 条 + 「未通过裁决」小节；③印记：无 → `contains uncited claims` + `verdict rejected` + `unverified`；④章节结构：**完全不变**（§3 实跑验证） |
| FP-5 | Micro-B failure：文件过大 / 解析失败 | Micro-B happy：单文件质量卡（**可点**） | ①`render`: ok → degraded；②facts 节：完整 facts → 结构化 JSON 兜底块；③印记：无 → `rendering degraded` + `data doesn't show`；④章节结构：**完全不变** |

> **对比的关键落点**：五行的第 ④ 项都是「章节结构完全不变」。这是 `CONTEXT.md`「Degraded Demonstration」术语的硬要求 —— 不允许 failure path 产物与 happy path 形态分离，否则用户无法对比裁决可追溯性。本票把它做成可机检断言 A3/A7。

---

## 3. FP-4 / Micro-A failure 跑通演示（与 happy path 对比）

### 3.1 为什么是这一条

A-017 决议中 `Micro-A failure` 是唯一同时满足两个硬阈值的 failure path：`RiskImpact = 5 ≥ 4`、`FailureROI = (5 + 5 + 5) / 2.0 = 7.5 ≥ 5.0`。其余四条 failure path 要么 RiskImpact < 4（FP-1/FP-3/FP-5），要么 FailureROI 4.8 未过阈值（FP-2）。因此本票实跑 FP-4，其余四条走文档明文。

### 3.2 演示三件套（per W2 #02 先例：可复用脚本 + 真实数据集 + 精度验证）

| 工件 | 路径 | 字节 | 作用 |
|---|---|---:|---|
| 明文表（机检源） | `reports/18-failure-paths.json` | 14,653 | 5 条 failure path 的 4 要素 + happy 对比，机器可读 |
| 夹具 | `reports/18-demo-fixture.json` | 3,655 | 同一 PR `#412 @ acme/payments-gateway`，happy profile 3/3 带引文、failure profile 0/3 带引文；**采集结果两条路径完全相同** |
| 脚本 | `reports/18-failure-demo.mjs` | 12,447 | 四阶段管线（采集 → 叙事 → 裁决 → 报告）+ 9 条守卫断言 |
| 产物 | `reports/18-demo-output.md` / `.json` | 6,044 / 7,896 | 两条路径的完整报告渲染 + 逐章对比 + 断言结果 |

**执行：** `node 18-failure-demo.mjs` → `EXIT=0`（托管 node v22.22.2）。

**关键设计：** 差异**只**来自「结论是否绑定可解析证据」，采集阶段的 4 条证据（`commit:a3f19c7` / `sarif:SC-204` / `line:src/ratelimit.ts:44` / `commit:7be2041`）在两条路径下完全一致。这排除了「fixture 造假」的退路 —— 同一份事实，只因结论未绑定证据就被裁决拒绝。

### 3.3 逐章对比结果

| 章节 | happy integrity | failure integrity | 内容 |
|---|---|---|---|
| 执行摘要 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同 / 内容降级 |
| 4 象限 / 裁决 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同 / 内容降级 |
| 证据 | coverage=4/4 | coverage=4/4 | 结构相同 / 内容降级（绑定行由 ref 变 `data doesn't show`） |
| 行动建议 | coverage=3/3, verdict=pass | coverage=0/3, verdict=rejected | 结构相同 / 内容降级（0 条 + 「未通过裁决」3 条） |

**failure 路径实际打出的印记（15 条，全部落在锁定词表内）：**

- 3 × `⚠ contains uncited claims`
- 3 × `⚠ verdict rejected: NO_CITATION`
- 3 × `⚠ unverified`
- 3 × `⚠ data doesn't show: citation[F-1|F-2|F-3]`
- 3 × `⚠ gap request: <file>:<line>`（TTL 72h，升级：Adjudication Protocol 申诉通道）

### 3.4 守卫断言（9/9 PASS）

| ID | 断言 | 结果 | 证据 |
|---|---|---|---|
| A1 | 5 条 failure path 每条 4 要素齐全 | PASS | 5 条路径，四要素校验 PASS |
| A2 | 每条 failure path 显式与 happy path 对比（≥3 条差异项） | PASS | FP-1:4 FP-2:4 FP-3:4 FP-4:4 FP-5:4 |
| A3 | happy 与 failure 报告章节结构逐字相同（yield=1） | PASS | 执行摘要 / 4 象限 / 裁决 / 证据 / 行动建议 |
| A4 | failure 报告含 ≥1 条 verdict-gate 拒绝印记 | PASS | 3 × `verdict rejected: NO_CITATION` |
| A5 | happy 报告零拒绝印记 | PASS | stamps=0 |
| A6 | 所有印记属于锁定词表（禁止自由发挥） | PASS | 15 个印记，越界 0 个 |
| A7 | failure 报告四章全部存在（降级不降低 yield） | PASS | 四章均有非空 body |
| A8 | happy 与 failure 逐章对比产生真实差异 | PASS | happy pass=3 / failure rejected=3 / 差异章=4 |
| A9 | 被裁决驳回的结论不进入行动建议章 | PASS | 行动建议章通过数=0，未通过小节数=3 |

**总计：9/9 PASS。**

---
## 4. 完成定义清单逐项

| 完成定义（issue #18 + handoff #18） | 状态 | 证据 |
|---|---|---|
| 每条 failure path 4 要素必齐 | [x] | §2.2 表五行，每行 ①②③④ 齐全；机检断言 **A1 PASS**（`18-failure-paths.json` 5/5 四要素非空） |
| 必须显式与 happy path 对比（不可只列 failure 自身） | [x] | §2.3 逐项差异表（每条 4 项差异，其中第 ④ 项为骨架不变）；机检断言 **A2 PASS**（5/5 各 ≥3 条差异项，实际各 4 条） |
| 1) 5 条 failure path 明文表（每条 4 要素齐全） | [x] | §2.2 表 + `reports/18-failure-paths.json`（14,653 B，5 条路径，机器可读） |
| 2) 至少 1 条 failure path 跑通演示（与 happy path 对比） | [x] | §3 —— FP-4 / Micro-A failure 实跑 `EXIT=0`，**9/9 守卫断言 PASS**；产物 `18-demo-output.md` / `.json` |
| （handoff 通用调研）atomcode 深度调研 | [x] | §1 —— 12 次三引擎查询 + 7 次原文核验 + 8+ 域名，经 `ctx_batch_execute(concurrency=1)` 串行调用 |
| （handoff 通用调研）回顾 docs/adr 相关 ADR | [x] | §0 清单第 6/7/8 项；ADR-0005/0006/0007 均全文已读（Status: accepted） |
| （handoff 通用调研）回顾 CONTEXT.md 心智模型 | [x] | §0 附项：Failure Path / Degraded Demonstration / Happy Path / Evidence Gate / Sufficiency Gate / Failure Semantics / Adjudication Protocol / Verdict Gate |
| （handoff 通用调研）对标工业界 ≥2 个成熟方案 | [x] | §1.2 六项对标（SRE 错误预算 / OTel Demo flagd / Harvest-Yield / Circuit Breaker-Bulkhead / NIST SI-11-AI RMF-ISO 15489 / CodeRabbit-EY），每项标明可吸收点与不适用边界 |

---

## 5. 阻塞

- **Blocked by: #17 —— 已解除**（A-017 已 done，`reports/17-report.md` 已交付）。
- **本票自身阻塞：无**，一次闭环。
- **遗留下游（不阻塞本票）**：
  - FP-1 / FP-2 / FP-3 / FP-5 的触发阈值（历史深度 `min_required`、时间戳比率 `threshold`、解析上限 `parser_limit_bytes`）尚未用真实语料校准 —— 按 A-017 决议这四条 v1 为文档路径，阈值校准归入 Phase 4。
  - GapRequest 的 TTL / 升级链路目前只在 FP-4 演示中硬编码（72h + 申诉通道），尚未与 A-009 read model 失效策略、A-008 schema 版本演进对齐。
- **下游解锁**：A-018 交付后，D-007（演示场景 10 路径）在「失败语义明文」这一维度已完整；Phase 4 实施可直接消费 `18-failure-paths.json`。
- **版本控制处置（per WORKFLOW §4.2.1 + 仓库先例 `0d0e3e5 docs(A-004)`）**：本票新建的 6 个工件（`reports/18-failure-paths.json` / `18-demo-fixture.json` / `18-failure-demo.mjs` / `18-demo-output.md` / `18-demo-output.json` / `18-report.md`）已用 `but commit -b a018-failure-path-detail` 提交到本 session 独立分支，commit message 带 A-018 标识。
- **`decision-ledger.md` 与 `WORKFLOW.md` 的本票改动留在工作区、不提交**：这两个共享文件的当前 diff hunk（`sq:d` / `sq:8` / `py:c`）混入了并行分支 W2 #01 / #03 / #08 与 W3 #14 的在途改动，GitButler 的 hunk 粒度无法把本票改动从中拆出；整体提交会擅自带走他人工作，违反「不动他人分支」约束。
  - 本票改动已在磁盘落盘并回读校验：ledger A-018 行状态 = `done` + `## A-018 结论落盘` 块（当前最新版字节 37,987 → 40,715）；WORKFLOW §4 Lessons 追加 1 行（字节 26,465 → 27,567，5 列对齐）。
  - **并发覆盖事件（诚实记录）**：本票首次把 ledger 落盘到 38,204 字节后，该文件被并行窗口以自持副本整体覆盖（38,204 → 37,987，行数 152 → 174），A-018 行状态与结论块一度丢失。已在**当前最新版**上重新落盘并回读复核（本节版本号已同步更新）。
  - **解除条件**：其他分支各自收口后，本票的 ledger A-018 行状态与 lessons 一行随下一次共享文件统一收口提交。
  - 与 `reports/08-report.md` 记录的并发教训一致：共享 append-only 文件在多窗口并行下存在「后写覆盖」风险，落盘后必须立即回读校验，不依赖「写过一次就安全」。

---

## 6. Lessons 候选

| 教训 | 触发场景 | 建议固化 |
|---|---|---|
| **「共享骨架」只有做成断言才算落地** —— 本票把 ADR-0006 的「骨架不变」从文字约束变成 A3/A7 两条机检断言后，才发现「证据章」在 failure 下也必须有内容（不能空），否则 yield=1 是空的 | 写「X 与 Y 共享结构」这类约束时 | 凡是「共享 / 同构 / 不变」类约束，必须配一条断言检查两个产物的结构 JSON 相等 |
| **两类印记混用会摧毁可追溯性** —— 初稿把采集缺口也打成 `verdict rejected`，导致「没查到」与「查到了但不采信」不可区分 | 设计 failure 印记词表时 | 印记词表要按「是否进入裁决」分族；分族写进共享约束并由断言检查 |
| **`.mjs` 在 Node v22 下是 ESM，`require` 不可用** —— 首跑 `ReferenceError: require is not defined` | 用 `fs.writeFileSync` 生成 `.mjs` 脚本时 | 生成 `.mjs` 一律用 `import fs from 'fs'`；若沿用 CJS 写法应直接命名为 `.cjs`（per W2 #02「下次写 .mjs 默认走 ctx_execute 路径」的延伸） |
| **fixture 必须让两条路径共享采集结果** —— 若 happy/failure 各自造假证据集，演示会退化为自证 | 构造 failure path 演示夹具时 | 差异只允许来自「被检验的那一维」（本票 = 结论是否绑定证据），其余输入完全同源 |
| **atomcode 可用时必须走 ctx carrier 串行调用** —— 本窗口 `ctx_batch_execute` 与 `atomcode 5.0.9` 均可用，未出现 #17 的 carrier 缺口；调研深度显著高于官方一手文档直读 | 每票调研阶段 | 开工先探测 `atomcode --version`，可用则禁止退回「读几个官网充数」 |

---

## 7. 引用文件列表

### 仓库内

- `.scratch/architecture-recovery/issues/18-failure-path-detail.md`
- `.scratch/architecture-recovery/handoffs/18-failure-path-detail.md`
- `.scratch/architecture-recovery/prompts/18-failure-path-detail.md`
- `.scratch/architecture-recovery/spec.md` §Decision 7.2 + Coverage 表
- `.scratch/architecture-recovery/WORKFLOW.md` §4.2（§4.2.1 版本控制 / §4.2.2 文件写入 / §4.2.3 调研 / §4.2.4 决策账本 / §4.2.5 报告 / §4.2.6 启动器硬规则）
- `.scratch/architecture-recovery/decision-ledger.md` A-017 / A-018
- `.scratch/architecture-recovery/reports/17-report.md`（本票上游，5 条 failure path 名单来源）
- `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`
- `docs/adr/0006-shared-skeleton-scale-slice.md`
- `docs/adr/0007-ten-demo-paths.md`
- `CONTEXT.md`（Failure Path / Degraded Demonstration / Happy Path / Evidence Gate / Sufficiency Gate / Failure Semantics / Adjudication Protocol / Verdict Gate）

### 本票产出

- `reports/18-failure-paths.json`（5 条 failure path 明文表，机器可读）
- `reports/18-demo-fixture.json`（Micro-A happy/failure 同 PR 夹具）
- `reports/18-failure-demo.mjs`（四阶段管线 + 9 条守卫断言，可复跑）
- `reports/18-demo-output.md` / `reports/18-demo-output.json`（演示产物）
- `reports/18-report.md`（本报告）

### 外部一手来源（atomcode 三引擎调研 + 原文核验）

| # | 来源 | URL | 角度 |
|---:|---|---|---|
| 1 | Google SRE Workbook — Example Error Budget Policy | https://sre.google/workbook/error-budget-policy/ | Official（原文核验） |
| 2 | OpenTelemetry Demo — Feature Flags | https://opentelemetry.io/docs/demo/feature-flags/ | Official（原文核验） |
| 3 | Fox & Brewer — Harvest, Yield, and Scalable Tolerant Systems | https://radlab.cs.berkeley.edu/people/fox/static/pubs/pdf/c18.pdf | Paper（原文核验） |
| 4 | Resilience Patterns: Timeouts, Retries, Circuit Breakers, Bulkheads | https://hld.handbook.academy/curriculum/reliability-and-operations/resilience-patterns/ | Comparative |
| 5 | HN — The August 17 outage 讨论 | https://news.ycombinator.com/item?id=49378957 | Criticism（降级实现失败教训） |
| 6 | CodeRabbit 驳回实证（31,073 次评审 / 10,191 PR） | https://alphaxiv.org/ | Paper / Empirical（2026-07，原文核验） |
| 7 | Wikipedia — Citation needed | https://en.wikipedia.org/wiki/Wikipedia:Citation_needed | Community（原文核验） |
| 8 | EY — Managing hallucination risk in LLM deployments | https://www.ey.com/ | Official / Whitepaper（原文核验） |
| 9 | NIST SP 800-53 r5 SI-11 — Error Handling | https://csf.tools/reference/nist-sp-800-53/r5/si/si-11/ | Official（规范） |
| 10 | NIST AI RMF 1.0 | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf | Official（摘要级，见 §1.3 缺口） |
