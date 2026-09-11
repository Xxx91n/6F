# Decision Ledger — architecture-recovery

> 本 ledger 收录架构报告（macro-audit spec-phase-tasks.md）的每个摩擦点/候选项，每条以 A-NNN 编号。
> 每条含：ID / 问题描述原文 / 规范化需求 / 显式约束 / 状态。
> spec 中每条必须声明覆盖哪些 A-xxx；无去向记录清单非空时不得立票。

| ID | 问题描述原文 | 规范化需求 | 显式约束 | 来源决策 |
|---|---|---|---|---|
| A-001 | S1 定位收敛的语义度量方法：定位关键词覆盖率启发式 70% 阈值的校准流程与试点仓库清单 | 定位收敛语义对齐方法（embedding/关键词）需工业界试点校准，阈值不能锁定 70% 为 hard rule | 前置 = CodeLore explain_file 集成测试；高优先级 | D-004 |
| A-002 | S2 ADR 质量"事后补写（文档日期 vs 实现 commit 日期差 > 90 天）> 20% 判红"——目标仓库 ADR YAML 时间戳头一致性核查 | 目标仓库所有 ADR 必须带 YAML 时间戳头，否则 S2 阈值不可执行 | 前置 = 目标仓库样板确认；中优先级 | D-004 |
| A-003 | S4 演化方向的 ADR 假设提取工具链：LLM 辅助抽取 + 人工复核回路（InfoQ 仅为理念文，需自建） | 自建 ADR 假设提取工具链（LLM 抽取 + 人工复核），不可只引 InfoQ 理念文 | 前置 = LLM API 选定；高优先级 | D-004 |
| A-004 | S5 所有权边界匹配在单人仓的判据降权规则：单作者模块占比 vs 团队规模归一化曲线 | 单人仓/小团队场景下 S5 信号弱，必须按团队规模归一化降权 | 前置 = 工业界小团队分布数据；中优先级 | D-004 |
| A-005 | 5 维 × 5 scale = 25 个采集单元的具体判据 + 数据源 + 阈值矩阵 | S1-S5 每维在 5 scale 下的判据/数据源/阈值全矩阵化 | 前置 = D-004 ADR 锁定（已锁）；高优先级；是 001/002/003/004 的上游 | D-004 |
| A-006 | AI-agent 生成代码对 ADR 质量冲击的评估（bool.dev AP8 未展开） | AI 生成代码时代 ADR 质量的长期演化评估 | 前置 = 待 AI 代码生成主流化；低优先级；可推迟 | D-004 |
| A-007 | DuckDB fact table 单写多读 vs 多写多读的并发与版本控制策略 | D-005 Hub-of-Facts 底层 SSOT 的写入策略需在多写并发与版本控制间明确选择 | 前置 = CodeLore DuckDB schema 复审；高优先级 | D-005 |
| A-008 | Schema 版本演进规则（AsyncAPI 事件契约心智，schema 不可改、版本号演进） | D-005 事件单向写入要求 schema 不可改、版本号演进（AsyncAPI 风格） | 前置 = AsyncAPI 工具链选定；高优先级；被 A-009 阻塞 | D-005 |
| A-009 | Read model 失效策略：陈旧读容忍度（事件已写、投影未更新）的 SLA 与触发条件 | D-005 read model 陈旧读的 SLA 与触发条件 | 前置 = D-006 报告模板敲定（依赖 A-014）；中优先级；被 A-008 阻塞 | D-005 |
| A-010 | Cross-scale correlation key（trace_id / baggage_id）字段设计与 OpenTelemetry Baggage 集成 | D-005 跨 scale 观测性字段；fact table schema 前置字段 | 前置 = OpenTelemetry SDK 语言栈选定；高优先级 | D-005 |
| A-011 | LangGraph supervisor 与本仓库 hub 协调层的契合度评估（adopt vs 自研） | D-005 hub 实现路径决策（adopt LangGraph supervisor vs 自研） | 前置 = 本仓库语言栈确定；中优先级 | D-005 |
| A-012 | Data mesh 三大失败模式（无人拥有 in-between / 静默断裂 / 重复劳动）对本仓库的逆推防线设计 | D-005 集成层稳健性：预先设计防线防 data mesh 失败模式 | 前置 = ADR-0005 锁定（已锁）；中优先级 | D-005 |
| A-013 | 工具对齐：metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 等参考实现与本仓库语言栈契合度评估 | D-005 实现期风险评估（工具栈契合度） | 前置 = 语言栈（TS / Rust / Python）确定；中优先级 | D-005 |
| A-014 | 共享骨架"最大公约数"具体设计：5 scale × 4 象限矩阵上的交集字段清单 | D-006 报告模板骨架：5 scale × 4 象限矩阵上的共享字段 | 前置 = ADR-0006 锁定（已锁）；高优先级；阻塞 A-015/A-016 | D-006 |
| A-015 | Scale 切片差异的具体边界：尤其 Macro-A（跨仓叙事）vs Micro-A（PR 行级）的表达边界 | D-006 报告模板差异度：每个 scale 切片的专属字段与边界 | 前置 = 真实仓库试点；高优先级；被 A-014 阻塞；阻塞 A-016 | D-006 |
| A-016 | 渲染样式与模板结构的切分：spec 锁定结构与字段、demo 锁定渲染样式（避免 spec 越界到 UI） | D-006 演示层：spec 不锁样式、demo 才锁样式 | 前置 = ADR-0006 + ADR-0007 锁定（已锁）；中优先级；被 A-014 + A-015 阻塞 | D-006 |
| A-017 | 10 路径中"可点演示"vs"文档可读"的成本/价值权衡 | D-007 演示层实施预算：每条路径的"真可点 vs 文档可读"决策 | 前置 = ADR-0007 锁定（已锁）；中优先级；阻塞 A-018 | D-007 |
| A-018 | Failure path 的 verdict-gate 触发条件 + 报告产物形态：每条 failure path 明文规定触发、降级、产物 | D-007 失败路径可演示：10 条 failure path 每条明文规定 verdict-gate / 降级 / 报告产物 | 前置 = ADR-0005 + ADR-0006 锁定（已锁）；高优先级；被 A-017 阻塞 | D-007 |

## A-005 结论落盘（2026-09-11，票 #05 闭环）

- 交付：25 格采集单元矩阵（行 S1-S5 × 列 5 scale）全填无占位，机检 PASS（`reports/05-matrix-check.mjs`）。
- 产物：`reports/05-unit-matrix.json` + `reports/05-unit-matrix.schema.json`（JSON Schema 2020-12）+ `reports/05-report.md`。
- 单元格结构 = OpenSSF Scorecard check + SonarQube (metric,operator,value) 阈值三元组 + provenance 初版参数声明；全部阈值 origin=expert/v1，90 天校准窗口（expires 2026-12-10）。
- 跨仓校准：三档（静态 Alves 百分位 / 相对过滤 Marinescu / 动态 EMA+σ 基线）+ 分桶（language/tech-stack/architecture-role/team-size）+ 试点语料 env-manager/jiahao/anysearch-cli。
- 上游对齐：是 Decision 4.1-4.4 的上游抽象，单维决策映射见 report §3.5；解锁 Wave 2 票 #01/#02/#03/#04/#14。

## 覆盖率自评（退出对账闸前必填）
- 已覆盖：spec.md 中 18 条 Implementation Decision 全部覆盖 A-001 ~ A-018（per Coverage 表）
- 无去向记录：**0**（清单非空时禁止立票 — 当前为空，立票放行）
- 立票情况：18 张 issue + 18 份 handoff + 18 份 prompt + 4 波次 README 全部生成

## 信息缺口与下一题方向
- (动态追加)

## A-006 结论落盘（2026-09-11，票 #06 闭环）

- **决议：推迟（DEFER）**——per spec.md §Decision 4.6「推迟：低优先级；spec 阶段交付评估框架（指标定义 + 取样方法），实际评估待 AI 代码生成主流化」。本票交付框架，**不做实际评估**。
- 交付：评估框架三段（`reports/06-report.md`）——(1) 指标清单 M1 决策一致性 C_est / M2 可逆性 RI / M3 上下文漂移 St+KV（3 核心）+ M4 ADR 密度（补充），全部含机检公式/数据源/检测器/阈值；(2) 取样方法（P0/P1/P2 仓库池 + 排除规则、365 天 default 分支窗口、min 5 ADR / 30 提交、检测流水线配置 schema + 四条 prompt 硬规则）；(3) 推迟触发条件（T1-T8 八条机检矩阵 + 明确不评估清单 + 三级回升路径）。
- 关键约束承接：阈值声明为**初版参数**，复用 ADR-0004 预留的跨仓校准机制，不另起一套；与 A-005 已落盘的 90 天校准窗口同源。
- 上游对齐：本票是 D-004 / S2 ADR Quality 的**时间导数**（S2 评「ADR 现在好不好」，本票评「AI 生成代码是否让 ADR 体系随时间劣化」），主战场在 Macro-C（演化考古）scale。
- **L0 基线（推迟态常驻产物）**：本仓库当前 7 条 ADR（0001-0007）、2 个提交、0 个 AI 归属 trailer——T1/T6/T7/T8 全部未越线，且 min_commit_count / min_adr_count 双重不达标，**L1 取样在物理上不可执行**；推迟是机检必然结果而非主观偏好。
- 依赖关系：与 A-002（ADR 时间戳头）共享证据基础（M3 的 St 需要时间戳）；与 A-003（LLM 抽取工具链）应复用而非另建；与 A-009 的「陈旧」概念**不合并**（A-009 管管道延迟，本票管决策与代码语义错位）。
- 调研依据：atomcode 三引擎 14 查询 / 12 次抓取 / 22 来源；核心证据 = arXiv 2602.07609（一致性检测精度基准）、arXiv 2603.28592（AI 债 22.7% 存活率）、GitClear 2026（重复块 +81%）、SonarQube agentic AI gate、OpenSSF Scorecard。
- 阻塞：无（Blocked by: None），本票一次闭环。
