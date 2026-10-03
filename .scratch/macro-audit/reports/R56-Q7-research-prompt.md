# R56-Q7 调研题面 —— baggage 拓扑声明：默认形＋inbound 接受语义

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale），分发=Agent Plugin（CLI＋MCP server 双面）。R56 已裁：D-203~D-207（子枝序→preview 法理→structure 解排→supply-chain 续排→B4 处置）。本题为 #10 baggage 拓扑本体——D-207 已钉票面=拓扑声明＋四面定性＋触发器册。

拓扑实证（代码级）：
- facts schema 三面：trace_id/baggage_id/run_id 全 CHAR(32) hex32 NOT NULL（inherits A-010/D-108）；报告 C1 correlation_key={trace_id,baggage_id} 直接转投
- 键生成=audit 入口自生成：ctx.traceId 单源；run_id=ctx.traceId 同值；baggage_id=deriveBaggageId(ctx, dimension)=**run 内按维度派生**
- MCP quarantine 投影已可按 run_id 查询（跨 run 关联的事后查询面已存在）
- 今日真实载体集合=空∪进程内（R56-Q6 调研钉死）

拓扑主件（呈批件，D-207 已定形）：默认=进程内 OTel Context 语义，键由审计入口生成即内联入 fact；四面定性=MCP 暂非载体（宿主 agent 不受控+transport 无既定 baggage 通道）／github-rest 出站禁注（Honeycomb 泄漏面同型）／CLI 连跑=进程内／Macro-A=触发器挂起；触发器册=宿主侧 MCP trace-context 契约出现 OR D-062 达成，任一触发实测封口。

**本裁唯一岔口=inbound 接受语义**：trace_id 终端自生成 vs 可被调用方注入（audit 入口 --trace-id/env opt-in）——Macro-A 扇出 N 仓 run 共享父链的天然载体位。

已裁约束（current）：A-010 三面 schema 已定（CHAR32 hex32 CHECK）／A-013 OTel Baggage 仅限 opaque baggage_id／D-108 run_id 幂等自然键／D-126 照答不拒答／CONTEXT Trigger-gated Closure 词条／D-062 Macro-A DoR-b=≥2 真实仓 facts 用户主权侧。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；architecture-recovery 账本=D:/Aworker/6F/.scratch/architecture-recovery/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选（拓扑主件呈批＋inbound 岔口三选）

- **(i) 终端自生成钉死**：永不受外部键；跨 run 关联全走事后 linkage fact（Macro-A 启动时 orchestrator 写 parent linkage）——最简但关联是事后拼接非运行期链
- **(ii) opt-in 入口注入现裁**：audit 入口立 --trace-id hex32/env 接受面——Macro-A/agent 编排链载体先备好；默认仍自生成；代价=接受面输入校验+语义文档
- **(iii) 拓扑采纳＋inbound 挂触发器册**：拓扑今天只裁 informed 面；inbound 接受语义入同一触发器册（Macro-A DoR 达成时随其设计树裁——消费方形态未知时裁接口=无据裁定）

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 A-010 语义（trace_id 是否定为 run-scoped 终态、外部注入是否违其设计）、A-013 opaque baggage_id 边界、CONTEXT Trigger-gated Closure 词条原文形态；
2. **工业界心智模型为重点**：trace context 的 inbound 接受惯例——分布式系统「外部 trace_id 接受策略」成熟形态（OTel propagator extract 语义=接受但重开新 span 不续原链 vs 续链；trusted-boundary 惯例=跨信任边界 traceparent 是否该被采信——安全面：trace spoofing/注入日志伪造先例）；CLI 工具接受调用方 run/trace id 的先例（构建系统 bazel invocation_id、dbt invocation_id、GH CLI trace 头、workflow run attempt 关联）；「事后 linkage fact vs 运行期链」的审计语义对比（审计链要求 evidence 完整性——事后拼接是否削弱证据面）；扇出拓扑的成熟形（parent trace_id+child run_id 双层 vs 单层共享 trace_id 混池——MapReduce/Spark job-stage-task 层级 id 惯例）；
3. 辩证要求：逐候选给支持与反对论据；(i) 的事后拼接对审计证据链完整性的实质影响须正面展开（本产品核心卖的就是证据可审计）；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
