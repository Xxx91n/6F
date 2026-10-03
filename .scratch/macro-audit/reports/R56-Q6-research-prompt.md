# R56-Q6 调研题面 —— B4 三行解封后的残余处置形态

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale），分发=Agent Plugin（MCP server＋CLI 双面）。R56 已裁：D-203 子枝序 B3→B1→B2→B4→B6；D-204 preview 法理边界；D-205 structure 解排；D-206 supply-chain 续排+源判据预声明。本题为 B4 本体。

spec-phase-tasks 三行前提解封（语言栈事实=TS+DuckDB，D-006 报告模板已定）：

- **#9 读模型失效策略**（中优先级，报告层一致性；原卡点=D-006 报告模板敲定）：实测残余=SLA 数值与分级触发条件定值。已落地实物=报告骨架 C1 强制五字段（stale_data_marker/staleness_sla_seconds/read_model_lag_seconds/read_model_version/fact_watermark_version）＋file-card drift 三态（fresh/behind/unknown，D-126 照答不拒答）＋intake snapshot_fetched_at+--refresh opt-in（D-059⑦）。字段全在，策略未定。
- **#10 cross-scale correlation key**（高优先级，跨 scale 观测性；原卡点=OTel SDK 语言栈选定）：实测残余=OTel Baggage 传播拓扑。已落地实物=schema trace_id/baggage_id/run_id 三面（inherits A-010/D-108）。跨进程面枚举：MCP server（agent→MCP→engine）、宿主 API 适配器（ADR-0020 github-rest）、CLI 多 scale 连跑、Macro-A 跨仓（未来）。
- **#13 工具对齐**（中优先级，实现期风险；原卡点=语言栈确定）：残余=metrics/OTel baggage/AsyncAPI/LangGraph 契合度评估——纯执行票无设计自由度。

已裁约束（current）：A-010 correlation key 三面已定（architecture-recovery 账本）／D-126 照答不拒答／D-059⑦ refresh opt-in／D-108 run_id／ADR-0013 预声明／ADR-0015 效度先行／D-062 Macro-A DoR／D-203 子枝序（B4 在 B3/B1/B2 后）。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；architecture-recovery 账本=D:/Aworker/6F/.scratch/architecture-recovery/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选

- **(a) 各归其位**：#10 烤一题（baggage 传播拓扑——跨进程面枚举与挂载点），#9 烤一题（SLA 数值表+分级触发条件），#13 转执行票
- **(b) 打包一题**：三行残余一题打包裁定——#9/#10 性质不同（策略定值 vs 架构拓扑），打包稀释辩证深度
- **(c) 全转执行票**：#9 取保守默认（demo 已有 sla_seconds:5 形态），#10 待真实跨进程需求面出现再集成（YAGNI——baggage 无载体时集成是空架子），#13 执行票——最小烤面但把「何时需要载体」架构判断留给执行窗
- **(d) 先 #10 后 #9 挂 #13**：序同 (a) 但显式定序——#10 表内标高优先级＋跨 scale 观测性是 Stage-2/Macro-A 共用原语，#9 次之，#13 票化

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 A-010 三面继承形态、D-126/D-059⑦ 既定语义对 #9 残余的收窄射程、MCP server 面是否构成 baggage 传播的真实载体；
2. **工业界心智模型为重点**：OTel Baggage 的成熟用法与误用边界（baggage vs span attribute 语义分工、W3C baggage propagation、OTel 官方「baggage 滥用=数据平面污染」警告）；CLI/plugin 形态产品中分布式追踪的接入时点先例（单机 CLI 何时需要 trace context——server 化/MCP 化/多进程面出现的拉动判据）；读模型 staleness SLA 的成熟形态（CQRS/event-sourcing 投影滞后容忍度惯例——「eventual consistency SLA」量化先例、照答不拒答 vs 阈值拒答的语义谱）；schema 字段先行 vs 语义后补的演化惯例（字段先落盘、传播语义后定的兼容窗口）；
3. 辩证要求：逐候选给支持与反对论据；(c) 的 YAGNI 论点 vs #10「高优先级」表内定级的张力须正面展开；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
