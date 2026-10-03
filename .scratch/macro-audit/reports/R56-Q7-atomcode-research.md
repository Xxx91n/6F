我将加载 atomcode-research 技能并按其流程执行本次深调研。先做本地账本/ADR/CONTEXT 回顾，再发起 atomcode 深调研（串行、一次在途）。继续本地账本精确回顾：拉取 A-010/D-108/D-062/D-207 原文行与 CONTEXT 词条。继续精确回顾 D-062/D-108 原文行。本地账本回顾完成（A-010/D-062/D-108/D-126/D-207/CONTEXT 词条已取原文）。现在发起 atomcode 深调研（串行单发）。atomcode 调研返回结果丢失，按续跑锚定规程先探测进程存活并检索知识库。atomcode 进程仍在运行（PID 26920）——按续跑锚定规程轮询等待，不杀不重开。继续轮询等待 atomcode 调研完成（不杀进程）。继续轮询 atomcode 进程（续跑锚定规程，等待不杀）。继续轮询 atomcode 进程（后台调研仍在推进）。改变策略：先用 ctx_search 检查 atomcode 是否已把结果落库，同时自己做轻量网络调研补足，不再死等轮询。atomcode 后台调研仍在推进（PID 26920 存活），知识库尚未收到其结果索引。改为拉长间隔继续等待，完成后从知识库找回结果。继续轮询期间并行推进自有网络调研（非 atomcode，不违反串行护栏）。继续并行：验证关键原文（W3C 规范、OTel 规范）＋ 查 CLI invocation_id 先例 ＋ 探测 atomcode 进程。继续：用 AnySearch extract 打开 W3C 规范原文（web_fetch 被拦），并补扇出拓扑层级角度。继续：换 Tavily extract 打开 W3C 规范与 OTel 提取语义原文，并重试扇出拓扑检索。继续调研：补 Honeycomb trace 注入先例与 trace spoofing 攻击面证据，并检查 atomcode 进程。最后一轮补查：审计链视角的事后拼接 vs 运行期链，及 GitHub Actions run 关联先例；同时检查 atomcode。补最后一轮检索（AnySearch 批量：构建工具 invocation 先例＋多智能体扇出拓扑），随后再次探测 atomcode。调研材料已足够（三引擎交叉、多源验证完成）。最后探测一次 atomcode 是否已完成落库。继续等待 atomcode 完成调研（续跑锚定规程）。本地账本回顾＋三引擎多角度调研已足够支撑综合；atomcode 后台进程仍未退出（其结果未落库，作为缺口如实登记，不再等待）。以下为最终报告。

---

# R56-Q7 调研报告 —— baggage 拓扑声明＋inbound 接受语义

**Sufficiency Gate**：searches: 10（web_search×4 / tavily×4 / anysearch batch×1＋extract×1）| angles: Official（W3C/OTel/Bazel 官方规范与文档）＋ Criticism（trace spoofing／log injection 攻击面）＋ Comparative（invocation_id 先例对比）＋ Community（Stack Overflow/Bazel issue）＋ Currency（2026 年文多篇）| full reads: 3（W3C trace-context 全文经 tavily_extract、OTel Tracing SDK 官方档、本地账本多区段精读；w3.org 直 fetch 403、anysearch extract 失败，以 tavily_extract 原文顶替）| **gaps**：①atomcode 深调研进程仍在后台运行（PID 26920），其独立结果未回收；②GH CLI trace 头先例未获一手文档；③Honeycomb 泄漏事故细节仅得 D-207 转述＋同型机制佐证，未读事故原文；④dbt invocation_id 自生成语义仅得第三方文档，未读 dbt 官方档；⑤Spark job/stage/task 层级 id 未获一手来源。

---

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 拓扑采纳＋inbound 挂触发器册，置信度：高**。本地账本一手证据直接钉死了两个关键点：A-010 的语义分工已把「异步 fan-out、重试、补跑导致的跨 run 关联」分配给 **baggage_id**（“审计意图关联”），而非 trace_id——候选 (ii) 的“trace_id 注入=Macro-A 扇出天然载体位”论据被本仓已裁设计正面削弱；D-108 钉 run_id=traceId（sha256 内容哈希派生的幂等自然键）——外部注入 trace_id 即外部决定 run 身份，与幂等自然键语义**直接冲突**，现裁 (ii) 需 revised D-108 才能成立。工业界证据同向：W3C 规范把「信任边界处 restart trace（重新自生成）」列为消除 DoS 攻击面的标准形态，trace header 属攻击者可控面的 log-injection/证据污染先例充分；CLI 先例主流是自生成（dbt/GitHub Actions），bazel 虽有 `--invocation_id` 但显式写明“唯一性由调用方自担”。

## 2) 分点结论

**C1 — OTel/W3C inbound extract 语义＝接受即续链，但信任边界 restart 是规范级惯例**（两源：W3C TR/trace-context §7 原文＋OTel Tracing SDK 官方档＋OTep 0066）。
规范原文：extract 出的远端 SpanContext 存入 context、新 span 以其为 parent（续链，`IsRemote=true`），这是默认形；但 W3C Security Considerations 明文：“Some services MAY choose to **restart** a `traceparent` field to eliminate those risks completely… services may define **trust boundaries**… a vendor might only restart `traceparent` for authentication requests from or to external services”；且 mutation 清单中 “Restart trace: All properties regenerated. This mutation is used in services that are defined as a **front gate into secure networks** and **eliminates a potential denial-of-service attack surface**”。→ 工业心智＝「接受是默认、**边界处拒绝接受并自生成是规范认可的合法形态**」；(i)/(iii) 的终端自生成并非非标，而是 front-gate 服务的规范惯例。

**C2 — 安全面：trace header 属攻击者可控输入，采信外部 trace_id 有充分攻击先例**（两源：W3C 规范＋traceability-header 注入实证研究）。
实证研究记录了完整攻击链：侦察捕获合法 trace-parent → 用其“作 mask”绑定恶意请求到表面合法的 trace 上下文 → 阻碍 SOC 事件关联；header 反射类系统被注入伪造诊断条目（log forging / incident-response obstruction）。防御共识：“distrust any traceability header originating from the client；若业务必须接受外部 ID，走严格过滤＋deny-by-default 字符集”。对本产品：**fact 表就是证据库**，外部注入的 trace_id 直接成为审计证据字段，与 D-207 已裁的 github-rest 禁注（Honeycomb 数据平面污染同型）是同一危险类——只是方向相反（outbound 污染他人 vs inbound 污染自身证据面）。

**C3 — CLI 先例：自生成为主流，opt-in 注入存在但责任外置**（两源：Bazel 官方 CLI reference＋Stack Overflow/Bazel issue；dbt 经 Infinite Lambda 文档＋GitHub Actions contexts 官方档）。
- Bazel：`--invocation_id` 接受调用方 UUID，但官方原文钉明 "**If explicitly specified uniqueness must be ensured by the caller**"——即工业界接受注入的先例是把正确性责任完全转给调用方；
- dbt：`invocation_id` 每条命令**自生成**，调用方不传；GitHub Actions `run_id`/`run_attempt` 全部平台生成；
- 结论：调用方可注入是**存在但非默认**的形态，且仅 bazel 一家，其语义是“关联标签”而非“身份派生源”——与 D-108 的“运行身份=内容哈希派生”根本不同位。

**C4 — 本仓硬约束：A-010 语义分工＋D-108 幂等自然键合起来反对 (ii) 现裁**（账本一手）。
- A-010 落盘原文：“`trace_id` 关联**一次同步运行链路**；`baggage_id` 关联同一 repo/commit/PR/run 的审计意图，**覆盖异步 fan-out、重试和补跑导致的新 trace**”——跨 run 扇出的关联职责**已经立法给了 baggage_id/linkage 面**，trace_id 被定义为 run-scoped；
- D-108：“run_id=traceId（sha256 内容哈希＝Airflow logical-date 派生同构：**运行身份=逻辑身份**）”——注入 trace_id ⇒ run_id 同被外定 ⇒ 同内容重跑产生不同 run 身份，幂等约束 `UNIQUE(run_id,…)` 的"同仓态重跑=no-op"语义被击穿；
- A-013：“Baggage 仅限 opaque baggage_id，不得含 PII 或业务可反推编码”——外部注入 baggage/关联内容同样撞此边界。
- **显式点名**：(ii) 现裁与 **D-108** 直接冲突、与 **A-010** 语义分工冲突、与 **A-013** 张力。这不是调研反对 (ii) 的姿态问题，而是 (ii) 的代价清单远超题面所列“输入校验＋语义文档”——它需要 revised D-108（身份派生与注入通道解耦，例如注入值入独立列而非 trace_id/run_id 本体）。

**C5 — 事后 linkage fact vs 运行期链：审计语义上 (i) 的短板被“启动时写入”大幅补偿，但须防滑**（两源：audit failure-mode 研究＋chain-of-custody 讨论）。
审计证据研究的关键区分：事后**重建**（reconstruction——从日志/截图/叙述倒推）不过 contemporaneity/chain-of-custody 阈值，属证据不足；而**执行时生成的证据对象**（execution-time evidence objects）合规。据此：
- (i) 的"Macro-A 启动时 orchestrator 写 parent linkage fact"**不是事后重建**——linkage fact 在执行时点写入，属 contemporaneous 证据；真正的实质损失是**结构性**的：linkage fact 是一条断言（"这几个 run 同属一次扇出”），而运行期共享链是**构造性绑定**（child 证据在写入时即携带 parent 身份，无法事后剥离）。断言可错、可漏写、可被孤儿 run 悖离；构造性绑定不会。
- 缓解形态（不属本裁、留 Macro-A 设计树）：linkage fact 记录双向 id（parent_trace_id＋child_run_id），且 child run 写入时由 child 侧回填 parent 引用——把“orchestrator 单方断言”升级为“两侧各自执行时点留痕”。
- (ii) 若成立则运行期链是构造性绑定，证据面最强——但以 C4 的三处账本冲突为代价。

**C6 — 扇出拓扑：双层（parent linkage＋child 自有 run 身份）优于单层混池**（两源：多智能体观测性文档＋审计证据面推理）。
多智能体实测文档正面记录了**单层混池失败形态**：“each agent creates its own trace by default → fragmented observability"（各自为政），其解法是把 orchestrator trace_id 传给全部子任务——但这恰恰制造了本题关心的张力：子任务身份被 parent 身份吞并。MapReduce/Spark 的 job→stage→task 三层 id 惯例（未获一手来源，列为缺口）指向同一方向：**层级身份各层自有、层间用引用关联**。对审计产品：双层保留每个 run 的独立幂等身份（D-108 不动），关联走 linkage——与 A-010 语义分工完全同构。

## 3) 候选辩证总表

| 候选 | 支持论据 | 反对论据 | 账本冲突 |
|---|---|---|---|
| (i) 终端自生成钉死 | 最简；W3C front-gate restart 惯例同型（C1）；证据不被外部输入污染（C2）；A-010/D-108/A-013 零冲突 | 跨 run 关联=linkage 断言非构造性绑定，断言可漏可错（C5）；Macro-A 启动前需先备好 linkage 写入义务 | 无 |
| (ii) opt-in 注入现裁 | 运行期构造性绑定证据面最强（C5）；bazel 有注入先例（C3）；Macro-A 编排链载体先备好 | trace_id 注入=外部决定 run 身份，击穿幂等自然键（C4）；审计证据库引入攻击者可控字段（C2）；A-010 已把扇出关联分给 baggage_id，“天然载体位”论据不成立（C4）；消费方（Macro-A）形态未知，接口无据裁定 | **D-108（直接）、A-010、A-013** |
| (iii) 拓扑采纳＋inbound 挂触发器册 | 拓扑主件已由 D-207 定形，本裁只补 informed 面；与 Trigger-gated Closure 词条原文形态完全同构（不显式前置、不无限拖延）；消费方形态未知时裁接口=无据裁定，D-062 达成时随其设计树裁有据 | inbound 语义悬置意味着 (i)/(ii) 的收益差异在触发前不可兑现——但今日真实载体集合=空∪进程内（R56-Q6 实证），悬置面无现实消费方，损失为零 | 无；与 D-207 触发器双事件同册合并 |

## 4) 推荐

**(iii) 拓扑采纳＋inbound 接受语义挂入 D-207 同一触发器册**（触发事件不变：宿主侧 MCP trace-context 契约出现 OR D-062 达成，任一触发即实测封口）。票面钉三层：① 默认形=进程内 OTel Context 语义＋终端自生成（与 W3C front-gate restart 惯例同型，与 A-010 语义分工一致）；② 触发时重裁 inbound 时，**bazel 型 opt-in 注入是合法候选但必须与 D-108 解耦**（注入值不得占用 trace_id/run_id 本体——幂等自然键不动，注入关联走独立列或 linkage 面），此判据预声明入触发器册防届时临场裁；③ (i) 的 linkage fact 义务留 Macro-A 设计树，且按 C5 缓解形态要求两侧执行时点留痕。

**置信度：高**。三个独立支柱互证：本仓账本一手原文（A-010/D-108 冲突是硬证据非姿态）、W3C/OTel 规范原文（信任边界 restart=规范级惯例）、CLI 先例（注入非默认且责任外置）。中低置信残留集中在 Honeycomb 事故细节与 GH CLI 先例（见缺口）。

## 5) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| W3C Trace Context (TR) | w3.org/TR/trace-context/ | Official | §7 Security Considerations＋restart mutation 原文（tavily_extract 全文） |
| OTel Tracing SDK 官方档 | opentelemetry.io/docs/specs/otel/trace/sdk/ | Official | ParentBased/remote-parent extract 语义原文 |
| OTep 0066 Separate Context Propagation | github.com/open-telemetry/opentelemetry-specification（oteps/0066） | Official | extracted remote context 与 current span 分离存储语义 |
| OTep parent_span_is_remote | 同仓 specification/trace/api.md | Official | IsRemote＝entry-point 判定语义 |
| W3C Trace Context L2 | w3.org/TR/trace-context-2（tavily 摘要） | Official | MUST ignore invalid traceparent 条款佐证 |
| Traceability header 注入实证 | （header-based log injection 研究，经 Exa 检索引述） | Criticism | trace spoofing 攻击链＋WAF 覆写防御先例 |
| 分布式追踪攻防 | soumendrak.com/blog/2026/08/how-distributed-tracing-works | Criticism/Community | attacker-controlled inbound headers→DoS/forge，“untrusted 视为 suggestion、trust boundary restart" |
| Bazel CLI reference | bazel.build/reference/command-line-reference | Official | `--invocation_id`：caller 责任原文 |
| Bazel issue #6476＋SO 52947778 | github.com/bazelbuild/bazel/issues/6476；stackoverflow.com/questions/52947778 | Community | invocation_id 注入用途=下游实体关联 |
| dbt invocation_id 语义 | infinitelambda.com/dbt-observability-row-level-metadata | Comparative | invocation_id 每命令自生成＋RUN_ID/invocation_id 分层 |
| GitHub Actions contexts | docs.github.com/actions/reference/workflows-and-actions/contexts | Official | run_id/run_attempt 平台生成惯例 |
| 多智能体 trace 传播实证 | docs.gp.scale.com（AgentEx multi-agent-tracing） | Comparative | 单层混池碎片化失败形态＋trace_id 传播解法 |
| 审计事后重建失效模式 | exa.ai/library（Audit Failure Modes in Post-Hoc Reconstruction） | Official | contemporaneity/chain-of-custody 阈值——事后重建 vs 执行时证据 |
| Chain of Custody 组合规范 | gracecommons.dev/compositions/chain-of-custody.html | Comparative | 证据链不可断/防篡改四要件 |
| 本地账本（一手） | D:/Aworker/6F/.scratch/{macro-audit,architecture-recovery}/decision-ledger.md；D:/Aworker/6F/CONTEXT.md | Local | A-010/D-062/D-108/D-207/Trigger-gated Closure 词条原文 |

## 6) 信息缺口

1. **atomcode 深调研未回收**：进程（PID 26920）仍在后台运行、结果未落库；若其返回与本报告结论冲突，以规范原文＋账本一手证据为准并登记分歧。
2. GH CLI 是否携带 trace/关联头：未获一手文档（对结论影响低——GitHub Actions 侧已证平台生成惯例）。
3. Honeycomb 泄漏事故（D-207 票面引用）一手事故报告未读到独立原文。
4. Spark/MapReduce job→stage→task 层级 id 一手来源缺失（C6 该支点目前是推理＋多智能体侧证）。
5. dbt 官方档对 invocation_id 的原文表述未直读（现依据第三方实现文档）。
