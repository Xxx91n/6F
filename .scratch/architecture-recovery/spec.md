# Spec: macro-audit spec 阶段展开

> 来源：架构报告 = [.scratch/macro-audit/spec-phase-tasks.md](../macro-audit/spec-phase-tasks.md) 18 项
> 决策 ledger：[decision-ledger.md](decision-ledger.md) (A-001 ~ A-018)
> WORKFLOW 引用：[WORKFLOW.md](WORKFLOW.md) §4.2 通用规则 / ADR-0001 ~ ADR-0007

## Problem Statement

宏观+微观工程内容审计产品的 grill 决策层已完成（7 条决策全部 current，7 条 ADR 落地）；spec 阶段需展开 S1-S5 rubric 全文判据、集成层 schema/契约、报告模板最大公约数、10 演示路径明细等具体内容。无 spec 文本则决策层无法落地为可执行工程。

## Solution

把架构报告（spec-phase-tasks.md）的 18 项摩擦点全部登记为决策 ledger（A-001 ~ A-018），按"决策簇 D-004 / D-005 / D-006 / D-007"分组展开为 Implementation Decisions，每条 Decision 显式声明覆盖的 A-xxx；按依赖关系切成 18 张 issue / 18 份 handoff / 18 份启动器；并行波次由 issue 的 Blocked by 字段推导，写入 README.md。

## User Stories

1. As an 架构审计产品的内部架构师, I want S1-S5 rubric 在 5 scale 下都有具体判据/数据源/阈值, so that 我可以为每个真实仓库跑出可重复的审计报告
2. As an Hub-of-Facts 集成架构实施者, I want DuckDB fact table 的写入策略与 schema 演进规则明确, so that 我可以落地 5 scale 共享的事实底座
3. As an 报告模板设计者, I want 5 scale × 4 象限的共享骨架 + scale 切片边界明确, so that Macro-A 跨仓叙事与 Micro-A 行级评审能在同一模板内并存
4. As an 演示场景编排者, I want 10 条演示路径（happy + failure）的触发条件/降级模式/报告产物明文, so that 我能交付可点的失败语义演示
5. As an 仓库维护者, I want 每张票覆盖的 A-xxx ID 显式可见, so that 我能 reverse-trace 任意决策回 ledger 原始摩擦点
6. As an 子窗口 agent, I want 启动器 ≤60 行 + 必读清单 + 专属 delta, so that 我能在 fresh context 下立即开工并避免复述已知规则

## Implementation Decisions

每条 Decision 必须引用至少一个 A-xxx。无去向记录清单非空时禁止立票。

### D-004 Cluster: 战略 quadrant S1-S5 全文判据

#### Decision 4.1 — S1 定位收敛语义度量方法
- **覆盖 A-001**
- 不锁 70% 为 hard rule；交付试点仓库清单 + 校准流程（含 embedding 选型、关键词 fallback、人工抽检）
- 与 A-005 矩阵结构对齐（每行的"语义度量"单元格复用 4.5 决策的矩阵格式）

#### Decision 4.2 — S2 ADR 质量事后补写判定
- **覆盖 A-002**
- 交付目标仓库 ADR YAML 时间戳头一致性核查清单 + 缺失头时的回退方案
- 阈值"事后补写 > 90 天 > 20% 判红"作为初版参数；预留跨仓校准

#### Decision 4.3 — S4 ADR 假设提取工具链
- **覆盖 A-003**
- 工具链必须含 LLM 抽取 + 人工复核回路（不能只信 LLM）
- 输出假设失效集对照表模板（vs InfoQ ADR Drift Monitor 理念清单）

#### Decision 4.4 — S5 单人仓判据降权规则
- **覆盖 A-004**
- 团队规模归一化曲线（单作者模块占比 vs 团队规模的分桶阈值）
- 报告模板显式标注"信号不足"时的回退路径（per D-004 约束）

#### Decision 4.5 — 25 采集单元矩阵
- **覆盖 A-005**
- 矩阵结构 = 5 dim × 5 scale = 25 个单元，每个单元含：判据定义 / 数据源 / 阈值初版 / 跨仓校准机制
- 是 4.1/4.2/4.3/4.4 的上游抽象（任何单维决策必须能填入矩阵的对应行）

#### Decision 4.6 — AI-agent 对 ADR 质量冲击评估
- **覆盖 A-006**
- 推迟：低优先级；spec 阶段交付"评估框架"（指标定义 + 取样方法），实际评估待 AI 代码生成主流化

### D-005 Cluster: 集成架构 = Hub-of-Facts with Federated Adjudication 落地

#### Decision 5.1 — DuckDB fact table 写入策略
- **覆盖 A-007**
- 决策点：单写多读 vs 多写多读；选前者（SSOT + 集中写入进程）
- 含并发控制（事务隔离级别）+ 版本控制（每个事件带 version 字段）

#### Decision 5.2 — Schema 版本演进规则
- **覆盖 A-008**
- AsyncAPI 事件契约风格：schema 不可改、版本号演进、消费者按版本订阅
- Schema 注册中心（去哪查哪个版本当前 active）

#### Decision 5.3 — Read model 失效策略
- **覆盖 A-009**
- 陈旧读容忍度 SLA（默认 5 秒）+ 触发条件（投影延迟 > SLA 时报警）
- 与 D-006 报告模板的"陈旧数据标记"字段对齐

#### Decision 5.4 — Cross-scale correlation key
- **覆盖 A-010**
- fact table schema 前置字段：trace_id / baggage_id（OpenTelemetry Baggage 心智）
- 5 scale 共用此字段做跨 scale 关联查询

#### Decision 5.5 — LangGraph supervisor 适配评估
- **覆盖 A-011**
- adopt vs 自研 hub 协调层；评估产物 = 决策矩阵（语言契合度 / 学习曲线 / 与 D-005 SSOT 心智冲突面）

#### Decision 5.6 — Data mesh 失败模式防线设计
- **覆盖 A-012**
- 三大失败（无人拥有 in-between / 静默断裂 / 重复劳动）各一条防线 + 监控指标

#### Decision 5.7 — 工具对齐评估
- **覆盖 A-013**
- metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 与本仓库语言栈契合度评估矩阵

### D-006 Cluster: 报告模板 = 共享骨架 + scale 切片

#### Decision 6.1 — 共享骨架最大公约数
- **覆盖 A-014**
- 5 scale × 4 象限矩阵上的交集字段清单（章顺序锁定、字段必含、不锁措辞）

#### Decision 6.2 — Scale 切片差异边界
- **覆盖 A-015**
- Macro-A（跨仓叙事）vs Micro-A（PR 行级）vs 其他 3 档的差异字段清单
- 每档切片含：触发器、输入、输出粒度、引文密度、verdict-gate 印记位置

#### Decision 6.3 — 渲染样式与模板结构切分
- **覆盖 A-016**
- spec 锁结构 + 字段；demo 锁样式（避免 spec 越界到 UI）

### D-007 Cluster: 演示场景 = 10 路径

#### Decision 7.1 — 路径成本 / 价值权衡
- **覆盖 A-017**
- 每条路径的"可点 vs 文档"决策表（10 行 × 2 列）

#### Decision 7.2 — Failure path 明文
- **覆盖 A-018**
- 5 条 failure path 每条明文：触发条件 / 降级模式 / verdict-gate 拒绝印记 / 报告产物形态

## Testing Decisions

- 每条 Implementation Decision 的 Acceptance Criteria 由对应 issue 的 checklist 项承担（per to-tickets 模板）
- spec 阶段不做单元测试（这是 spec 文档）；测试在 Phase 4 实施阶段进入 ticket 实施
- 验证规则：spec.md 本身的可验证项 = 每个 A-xxx 在 Decision 中至少出现一次（per coverage 闸）

## Coverage（必填 — 对账闸输出）

| A-xxx | 覆盖的 Decision |
|---|---|
| A-001 | Decision 4.1 |
| A-002 | Decision 4.2 |
| A-003 | Decision 4.3 |
| A-004 | Decision 4.4 |
| A-005 | Decision 4.5 |
| A-006 | Decision 4.6 |
| A-007 | Decision 5.1 |
| A-008 | Decision 5.2 |
| A-009 | Decision 5.3 |
| A-010 | Decision 5.4 |
| A-011 | Decision 5.5 |
| A-012 | Decision 5.6 |
| A-013 | Decision 5.7 |
| A-014 | Decision 6.1 |
| A-015 | Decision 6.2 |
| A-016 | Decision 6.3 |
| A-017 | Decision 7.1 |
| A-018 | Decision 7.2 |

## Out of Scope

- 不写任何实现代码（Phase 4 才进入实施）
- 不引入商业层（D-003 已封口）；不引入具体工具选型（D-005 决策后由 Phase 4 落地）
- 不写 ADR（D-001 ~ D-007 已固化）

## Further Notes

- 本 spec 是 to-spec 流程的产出；下一步 to-tickets 把每个 Decision 转 issue + handoff + prompt
- 并行波次由 issue 的 Blocked by 字段推导（不新造顺序），输出到 README.md