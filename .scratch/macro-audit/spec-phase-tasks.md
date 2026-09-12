# Spec Phase Tasks — macro-audit

> 本清单由 grill 退出时从 [.scratch/macro-audit/decision-ledger.md](decision-ledger.md) 抽出 18 项信息缺口，按 7 条决策分组。
> grill 决策层已完成（7/7 current），spec 阶段任务是展开决策层未定的"判据/数据源/阈值/契约"等具体内容。
> 每个任务标：所属决策 / 优先级 / 阻塞面 / 触发条件（spec 阶段开始时哪些前置任务需先完成）。

## 来源 D-004（战略 quadrant 5 维 S1-S5 全文判据）— 6 项

| # | 任务 | 优先级 | 阻塞面 | 前置 |
|---|---|---|---|---|
| 1 | S1 定位收敛的语义度量方法：定位关键词覆盖率启发式 70% 阈值的校准流程与试点仓库清单 | 高 | S1 rubric 数据源 | CodeLore explain_file 集成测试 |
| 2 | S2 ADR 质量"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）> 20% 判红"——目标仓库 ADR YAML 时间戳头一致性核查 | 中 | S2 rubric 阈值 | 目标仓库样板确认 |
| 3 | S4 演化方向的 ADR 假设提取工具链：LLM 辅助抽取 + 人工复核回路（InfoQ 仅为理念文，需自建） | 高 | S4 rubric 数据源 | LLM API 选定 |
| 4 | S5 所有权边界匹配在单人仓的判据降权规则：单作者模块占比 vs 团队规模归一化曲线 | 中 | S5 rubric 阈值 | 工业界小团队分布数据 |
| 5 | 5 维 × 5 scale = 25 个采集单元的具体判据 + 数据源 + 阈值矩阵 | 高 | S1-S5 全文落地 | D-004 ADR 锁定后开始 |
| 6 | AI-agent 生成代码对 ADR 质量冲击的评估（bool.dev AP8 未展开） | 低 | S2 长期演化 | 待 AI 代码生成主流化 |

## 来源 D-005（集成架构 = Hub-of-Facts with Federated Adjudication 落地）— 7 项

| # | 任务 | 优先级 | 阻塞面 | 前置 |
|---|---|---|---|---|
| 7 | DuckDB fact table 单写多读 vs 多写多读的并发与版本控制策略 | 高 | 集成层 schema | CodeLore DuckDB schema 复审 |
| 8 | Schema 版本演进规则（AsyncAPI 事件契约心智，schema 不可改、版本号演进） | 高 | 数据契约 | AsyncAPI 工具链选定 |
| 9 | Read model 失效策略：陈旧读容忍度（事件已写、投影未更新）的 SLA 与触发条件 | 中 | 报告层一致性 | D-006 报告模板敲定 |
| 10 | Cross-scale correlation key（trace_id / baggage_id）字段设计与 OpenTelemetry Baggage 集成 | 高 | 跨 scale 观测性 | OpenTelemetry SDK 语言栈选定 |
| 11 | LangGraph supervisor 与本仓库 hub 协调层的契合度评估（adopt vs 自研） | 中 | hub 实现路径 | 本仓库语言栈确定 |
| 12 | Data mesh 三大失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）对本仓库的逆推防线设计 | 中 | 集成层稳健性 | ADR-0005 锁定后开始 |
| 13 | 工具对齐：metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 等参考实现与本仓库语言栈契合度评估 | 中 | 实现期风险 | 语言栈（TS / Rust / Python）确定 |

## 来源 D-006（报告模板 = 共享骨架 + scale 切片）— 3 项

| # | 任务 | 优先级 | 阻塞面 | 前置 |
|---|---|---|---|---|
| 14 | 共享骨架"最大公约数"具体设计：5 scale × 4 象限矩阵上的交集字段清单 | 高 | 报告模板骨架 | ADR-0006 锁定 |
| 15 | Scale 切片差异的具体边界：尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界 | 高 | 报告模板差异度 | 真实仓库试点 |
| 16 | 渲染样式与模板结构的切分：spec 锁定结构与字段、demo 锁定渲染样式（避免 spec 越界到 UI） | 中 | 演示层 | ADR-0006 + ADR-0007 锁定 |

## 来源 D-007（演示场景 = 10 路径）— 2 项

| # | 任务 | 优先级 | 阻塞面 | 前置 |
|---|---|---|---|---|
| 17 | 10 路径中"可点演示"vs"文档可读"的成本/价值权衡 | 中 | 演示层实施预算 | ADR-0007 锁定 |
| 18 | Failure path 的 verdict-gate 触发条件 + 报告产物形态：每条 failure path 明文规定触发、降级、产物 | 高 | 失败路径可演示 | ADR-0005 + ADR-0006 锁定 |

---

## spec 阶段开工顺序建议

```
D-004 -> 任务 5（25 单元矩阵）-> 任务 1-4（S1-S5 单维全文）-> D-005 -> 任务 7-13 -> D-006 -> 任务 14-16 -> D-007 -> 任务 17-18
```

每条决策先落地 ADR（已写），spec 阶段按依赖顺序展开任务清单。
