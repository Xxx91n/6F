我先加载 atomcode-research 技能，然后按其流程执行：知识库召回 → 本地账本/ADR/CONTEXT 回顾 → 三引擎联网调研 → 综合。我先开始回顾账本、ADR 和 CONTEXT，并基于知识库进行验证。ctx_search 上次调用未读成功，重试；同时继续读 CONTEXT.md 剩余部分。知识库已召回 A-010/A-009/A-013 关键记录。继续补齐本地账本事实源：CONTEXT 收尾 + 两本账本 current 记录 + spec-phase-tasks 三行原文。账本 D-203 行未命中，可能标题格式不同。换宽匹配再查。bash 被只读闸拦截，改走 ctx 沙箱。一次批量调用完成：本地账本 grep 取证 + atomcode 深调研（串行）。atomcode 载体因 shell 引号问题失败，改用无 shell 的 execFile 方式重试，并同时补齐 spec-phase-tasks 三行原文取证。上一次 ctx_execute 的返回未被回放。按续跑锚定规程：先 ctx_search 探测结果是否已落库，再探测进程是否仍在运行。上次 ctx_execute 返回未回放，按续跑锚定规程：探测 atomcode 进程是否仍在运行，并检索知识库是否已索引其结果。进程存活（两个 atomcode.exe），调研仍在后台推进。按续跑锚定：轮询等待并检索落库结果。调研进程仍在后台推进，继续轮询等待其退出。沙箱脚本少了收尾括号导致语法错误，修正后继续轮询。atomcode 仍在运行，继续按轮询规程等待其退出后再取结果。继续轮询 atomcode 进程（其调研仍在后台推进，本会话保持串行不另开新调研）。atomcode 进程仍在运行，继续轮询等待。进程仍在运行，继续等待并轮询。（后台 atomcode 调研仍在运行；按串行护栏，在它退出前不并行发起共用外部引擎的检索，继续轮询。）atomcode 后台进程已超轮询上限仍未归（按 D-186 降级形态立法：后台未归=合法降级，标注 degraded_performance，主腿自查继续）。现在按调研题面的配额直接执行三引擎联网调研。三引擎首轮已回收 Baggage 面。现在定点深挖：读官方原文 + 补 CQRS staleness SLA 与 CLI/单机追踪接入判据两角度。定点验证剩余三源（W3C 镜像、读模型滞后实践、baggage 误用批评面），并顺带探测后台调研是否已归。（MCP 指示块静默读取，不影响任务。）补最后两篇深读（截断工件全文 + W3C 规范的可用镜像面），随后合成最终报告。（MCP 指示块静默读取。）后台调研仍在运行中——发出最后一次查询（target 判断依据 + 字段先行的演变），然后再检查一次。最后探测一次后台调研进程，然后合成最终报告。后台 atomcode 深调研进程经多轮轮询（约 25 分钟）仍未归，按本仓 D-186 降级形态立法处理：atomcode 腿标注 **degraded_performance（后台未归）**，主腿（本会话直查）已按配额完成调研并合成如下报告。

---

# R56-Q6 调研报告 —— B4 三行解封后的残余处置形态

**Sufficiency Gate**：searches: 7（Official×2 / Comparative×2 / Criticism×1 / Community×1 / 时效含 2026 年文多篇） | full reads: 6（opentelemetry.io baggage 原文、Honeycomb footgun 全文、OneUptime W3C baggage 全文、EventSourcingDB 读模型滞后全文、OTel baggage spec 摘录、Protean schema 演化全文；w3.org/TR/baggage 403 未读、以 OneUptime+OTel Java advisory 双源顶替） | gaps：见文末。

## 1) 执行摘要（Tl;dr）

**推荐 (d)——先 #10 后 #9 挂 #13——但附一处关键修正：#9 的“烤”应定性为跨账本对账确认票（采纳 A-009 已有数字表），非开放式设计题。** 置信度：**中高**。高置信部分：#13 无设计自由度（A-013 已两次闭环，残余纯执行）；#9 的 SLA 数字在 architecture-recovery 账本 A-009 已全量定值（含 per-scale 表与 T1-T5 触发规则），再烤一题属重复立法。中置信部分：#10 的 MCP server 面在当前形态下**不构成 baggage 传播的真实载体**（宿主 agent 不受本仓控制），故 (c) 的 YAGNI 直觉对“传播机制”正确、对“拓扑裁定”错误——正确出口是本仓既有词条 **Trigger-gated Closure**：拓扑裁 now、载体挂触发器。

## 2) 分点结论

**结论 1（#9 残余已被 A-009 实质收窄为零设计自由度）**：architecture-recovery 账本 A-009（current，2026-09-12 票 #09 闭环）已定：SLA 默认 5 秒、warn=5s/error=15s 两级阈值、连续 3 周期去抖/6 周期迟滞清除、per-scale 全数字表（MICRO-A 2/2/6 → MACRO-A 300/300/900）、报警触发 T1-T5 五条全量化、T5 探测失败→unknown（fail-closed）。其“与 D-006 对齐”段明确载明 C1 五字段（stale_data_marker 四态枚举等）系该票的版本化追加产出。**#9 的真实残余 = 把 A-009 数字表在 macro-audit 账本对账认领（D-xxx 行），并做一处显式调和**：A-009 的 stale_data_marker 是四态（fresh/warn/stale/unknown），本仓 file-card drift 是三态（fresh/behind/unknown，D-126 照答不拒答）——两套枚举需一行裁定映射（warn→behind 或保留四态），这是唯一需要拍板的点。工业面支持：CQRS 读模型滞后是设计权衡非缺陷，惯例是“测量它、披露它、按需容忍或主动刷新”（EventSourcingDB），照答不拒答+双字段披露（D-126/Observation Set）与业界“降级优雅而非拒绝服务”心智一致；Spanner bounded staleness、PBS（Berkeley）均为“量化容忍度”先例，支持定值而非拒答阈值化。

**结论 2（#10：YAGNI 对“机制”成立、对“裁定”不成立——张力用 Trigger-gated Closure 消解）**：
- 工业心智（三源交叉）：Baggage 是**传播而非记录**——不显式拷贝到 span attribute 就哪儿都不落（opentelemetry.io 官方 + Honeycomb + OneUptime 一致）；官方语义分工=“请求起点已知、全链需要”的短标识符（tenant/plan/debug flag），误用面=大数据、敏感值、授权决策进 baggage（“数据平面污染”即 Honeycomb 实录的客户 baggage 泄入自家 ingest 事故）；W3C 限值 64 条目/8192 字节，OTel Java 曾因不限长出 CVE（GHSA-rcgg-9c38-7xpx，1.62.0 修复）。
- **载体判据**：baggage 跨进程传播需要双方安装 propagator 的真实载体（TextMap/环境变量 carrier；OTel spec 明言“API 无 SDK 也须可用，以支持透明跨进程传播”——但前提是有 carrier 通道）。逐面核：①**MCP server 面**——宿主 agent 不归本仓管，stdio/HTTP transport 无既定 baggage 通道，**当前非真实载体**（MCP `_meta` 字段是未来可能的契约位，未出现即不集成）；②**github-rest 适配器**——出站注 baggage 头给第三方=纯泄漏面无收益（Honeycomb 事故同型），禁用；③**CLI 多 scale 连跑**——同进程/父子进程，OTel Context 对象即可，无需 W3C 头；④**Macro-A 跨仓**——未来面，D-062 DoR 未开。→ **今日真实载体集合=空 ∪ 本仓进程内**。
- **为何仍裁 #10 先烤**：(c) 的“baggage 无载体时集成是空架子”对——但 (c) 把“拓扑判断留给执行窗”错了。schema 三面字段已落盘（A-010 current，事实表内联双键），本仓自身有“字段先行、语义后补”的兼容窗口惯例可依（Avro/Kafka FULL-compat 心智：加字段带默认=完全兼容，语义永久钉死）；而“哪个面是载体、默认拓扑是什么、何时重评”是**便宜的裁定**不是贵的机制。本仓 Trigger-gated Closure 词条（CONTEXT.md）恰好为此而生：显式登记触发事件（如「宿主侧出现可承载 trace context 的 MCP 契约」「Macro-A 启动判据 D-062 达成」），任一触发即实测封口。**既非前置门禁化、也非永不复审**——这是对 (c) YAGNI 论点的正面回答：烤的不是传播器，是拓扑声明+触发器册。

**结论 3（#13 纯执行票，零自由度）**：A-013 已两次闭环（初版+精化段），四工具方向钉死：metrics 自研轻量 metric_catalog（不引 dbt Semantic Layer）、Baggage 受限采用（仅 opaque baggage_id+红线 W3C 64 条/8KB+CVE-2026-45292）、AsyncAPI 采用（含 2026-07-14 供应链攻击防护约束）、LangGraph 不默认。残余“契合度评估”=按既有红线执行核验，无任何设计自由度。票化无争议。

**结论 4（账本冲突扫描）**：候选 (a)/(d) 与 current 零冲突；(c) 与 A-010（fact table 内联双关联键已交付 reports/10-report.md 含跨 scale SQL）存在**隐性张力**——schema 已交付而集成悬置，若全转执行票须显式注记“字段维持、语义挂触发器”，否则构成账本间名实缝；(b) 打包稀释——#9 是对账确认、#10 是拓扑+触发器立法，两者证据面与辩证深度完全不同质，打包违 D-054③ 同型分工纪律。

## 3) 对比矩阵（候选 × 判据）

| 候选 | 裁定面完整性 | 账本对齐 | 成本/风险 |
|---|---|---|---|
| (a) #10+#9 各烤一题+#13 票 | ✅ 完整 | ✅ 零冲突 | ⚠ #9 重烤=对 A-009 重复立法，烧一题配额 |
| (b) 三行打包一题 | ❌ 性质异质稀释 | ⚠ 近 D-054③ 反例 | ❌ 辩证深度不足 |
| (c) 全转执行票 | ❌ #10 拓扑判断悬空 | ⚠ 与 A-010 已交付 schema 生名实缝，须注记 | ✅ 最省；⚠ Stage-2/Macro-A 共用原语无裁定锚 |
| **(d) 先 #10 后 #9 挂 #13（推荐）** | ✅ 显式定序+观测性原语优先 | ✅ 零冲突 | ✅ 修正项：#9 降格为对账确认票（采纳 A-009 数字表+一行枚举映射裁定） |

## 4) 推荐＋理由＋置信度

**推荐 (d) 修正版**：① **#10 先烤**——票面=默认拓扑声明（进程内 OTel Context；baggage_id 由审计入口生成即入 fact 表，不依赖跨进程载体）＋四跨进程面逐面定性（MCP 面=暂非载体、github-rest=禁注、CLI 连跑=进程内、Macro-A=触发器挂起）＋触发器双事件入 registry（Trigger-gated Closure 形态）；② **#9 次之，烤成对账确认票**——采纳 A-009 全数字表，唯一裁定点=四态↔三态枚举映射；③ **#13 转执行票**。**置信度：中高**。高置信：#13/#9 残余性质判断（本地账本一手记录直接支撑）；中置信：MCP 面“暂非载体”的判断依赖当前宿主生态无既定 trace-context 契约——此为可证伪判断，触发器册正是为它留的重评口。

## 5) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| OTel Baggage 官方概念页 | opentelemetry.io/docs/concepts/signals/baggage/ | Official | 2026-02-22 | baggage≠attributes、安全边界、Baggage Span Processor |
| OTel Context Propagation 官方页 | opentelemetry.io/docs/concepts/context-propagation/ | Official | 2026-08 | 敏感信息禁入、边界清洗 |
| Ask Miss O11y: Baggage（Honeycomb） | honeycomb.io/blog/ask-miss-o11y-opentelemetry-baggage | Criticism | 2022-04-25 | footgun 实录：客户 baggage 泄入第三方 ingest 事故 |
| W3C Baggage 配置指南（OneUptime） | oneuptime.com/blog/post/2026-02-06-w3c-baggage-propagation-opentelemetry/view | Official/Comparative | 2026-02-06 | 64 条目/8192 字节限值、边界校验 |
| OTel Java GHSA-rcgg-9c38-7xpx | github.com/open-telemetry/opentelemetry-java/security/advisories/GHSA-rcgg-9c38-7xpx | Criticism | — | 无限长解析 CVE，1.62.0 修复（与 A-013 红线互证） |
| Read-Model Consistency and Lag（EventSourcingDB） | docs.eventsourcingdb.io/best-practices/read-model-consistency-and-lag/ | Official | — | 读模型滞后=设计权衡、健康检查阈值惯例 |
| Correlation ID vs Trace ID（Last9） | last9.io/blog/correlation-id-vs-trace-id | Comparative | — | 简单架构 correlation 足矣/多部件才上 full tracing |
| Trace ID vs Correlation ID（OneUptime） | oneuptime.com/blog/post/2026-09-03-trace-id-vs-correlation-id-…/view | Comparative | 2026-09-03 | 长工作流=workflow ID+多 trace 分工 |
| Event Versioning and Evolution（Protean） | docs.proteanhq.com/patterns/event-versioning-and-evolution/ | Official | — | 字段先行默认值兼容、语义永不改字段 |
| Avro/Schema Registry 兼容性（Confluent，经搜索工件） | （web_search 工件内） | Official | — | FULL-compat 演化窗口 |
| Spanner timestamp bounds | cloud.google.com/spanner/docs/timestamp-bounds | Official | — | bounded staleness 量化读先例 |
| PBS（Berkeley） | pbs.cs.berkeley.edu | Official | — | eventual consistency 量化容忍先例 |

## 6) 信息缺口

1. **MCP 宿主侧 trace-context 契约现状**：未找到 2026 年 MCP 生态宿主（Claude Code 等）是否/如何向 MCP server 传递 traceparent/baggage 的一手规范——这是 #10 烤面时须实测的点，也是触发器登记的第一候选事件。
2. **OTel 环境变量 carrier 在 Windows 多进程的实际形态**：spec 提及 Environment Variable Carriers 但未深读原文，#10 票面若含 CLI 子进程拓扑须补。
3. **atomcode 载体腿缺失**：本次深调研后台未归（D-186 降级登记），引擎交叉配额由主腿三引擎直查顶替；若规程要求 atomcode 载体必达，须按降级构成比登记本题为 degraded_performance 样本。
