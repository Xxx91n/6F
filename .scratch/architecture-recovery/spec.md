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

---

## R2 — 产品定义补完（来源 D-008 ~ D-013，2026-09-12 grill 轮 2）

> 来源：spec-phase-tasks.md 第二轮（R2-01 ~ R2-05）；决策：decision-ledger.md D-008 ~ D-013（全部 current）。
> 与轮 1（D-004 ~ D-007 / A-001 ~ A-018）共用本 spec 结构；R2 覆盖表见文末。
> D-008 为流程导航决策（方向 = 补完产品定义），内容由 R2-01 ~ R2-05 承接，不单独立条。
> 边界：R2 全部完成前不启动工程实现（ADR-0002 边界不变）；边界变更属 D-014 待拍板项。

### User Stories（R2 增量）

7. As a 技术决策者（CTO / 架构师 / 尽调人）, I want 面向非作者可读的叙事化四象限报告 + 可追溯证据引文, so that 我能在尽调/架构决策前给出可驳回的判定
8. As a 工程团队成员（TL / 平台组 / 质量负责人）, I want CI 门禁裁决（verdict-gate）+ 低误报的行级带引文评审, so that 我能把审计嵌入 push/PR 流程而不被噪音淹没
9. As an agent 生态开发者（Claude Code / Codex 用户）, I want 一次安装的 Agent Plugin + 稳定的 MCP 只读查询面, so that 我能在 agent 会话内直接触发仓库评审
10. As a 自用者（本人 + 三自有仓）, I want 本地可复现的审计报告, so that 我能用真实反馈回路校准 rubric 判据

### R2-01 — 目标用户四类全集（persona 段落）

**覆盖 D-009**｜**负向约束**：禁止收窄为单一用户类；不做用户间优先级排序与时序切片（与 D-002 拒绝 MVP 切片同风格）。

#### Persona A — 技术决策者（CTO / 架构师 / 尽调人）
- **何时用**：尽调或架构决策前的一次性审视；需对外部仓库/组合给出可追溯判定。
- **拿走什么**：叙事化四象限报告（结构/行为/供应链/战略）+ 证据引文 + 战略诊断（S1-S5）；面向非作者可读。
- **主要 scale**：Macro-A / Macro-B（+ Macro-C）。
- **交付拉动**：报告可读性（面向非作者）。

#### Persona B — 工程团队（TL / 平台组 / 质量负责人）
- **何时用**：周期评审或 CI 门禁时刻（push / PR 自动触发）。
- **拿走什么**：verdict-gate 裁决 + 行级带引文评审 + 低误报的可行动建议。
- **主要 scale**：Micro-A / Macro-B。
- **交付拉动**：CI 门禁可靠性与低误报。

#### Persona C — agent 生态开发者（Claude Code / Codex 用户）
- **何时用**：agent 工作流内嵌时刻（会话内“评审这个仓库”）。
- **拿走什么**：一次安装的 Agent Plugin + MCP 只读证据查询面 + Macro-B 四象限叙事报告。
- **主要 scale**：Macro-B（默认模式）。
- **交付拉动**：plugin 分发与 MCP 接口稳定。

#### Persona D — 自用（本人 + jiahao / anysearch-cli / env-manager）
- **何时用**：手动触评时刻；作为 rubric 判据调优的校准锚。
- **拿走什么**：本地可复现的审计报告 + rubric 校准的真实反馈回路。
- **主要 scale**：Macro-B / Macro-C。
- **交付拉动**：本地可复现。

### R2-02 — 使用场景并集 + mode 枚举配置面

**覆盖 D-010**｜**负向约束**：默认模式必须单一（不许多默认并存）；非默认模式必须配置可达，禁止降为二等或砍掉。

#### 场景并集（4 类用户 × 时刻 × scale 归属，允许重叠）

| # | 用户 | 时刻 | scale 归属 | 是否默认 |
|---|---|---|---|---|
| S1 | C agent 生态开发者 | agent 工作流内嵌 | Macro-B | ✅ 默认 |
| S2 | B 工程团队 | CI 门禁（push/PR） | Micro-A | 配置可达 |
| S3 | B 工程团队 | 周期评审 | Macro-B | 配置可达 |
| S4 | A 技术决策者 | 尽调一次性 | Macro-B / Macro-C | 配置可达 |
| S5 | A 技术决策者 | 架构决策前 | Macro-A | 配置可达 |
| S6 | D 自用 | 手动触评 | Macro-B / Macro-C | 配置可达 |
| S7 | 任意 | 单文件查看 / LSP | Micro-B | 配置可达 |

#### mode 枚举配置面

| mode | 取值 | 默认值 | 触发 / 切换语义 |
|---|---|---|---|
| default | agent 内嵌 Macro-B | ✅ 是 | 一次安装 + 首次授权后，会话内“评审这个仓库” |
| ci-gate | Micro-A PR diff | 否 | CI 配置切换（GitHub Action 外壳） |
| scheduled | Macro-B 周期 | 否 | 周期配置切换 |
| due-diligence | Macro-B / C 一次性 | 否 | 手动 / 配置切换 |
| manual | 自用手动 | 否 | CLI 手动触评 |
| file | Micro-B 文件级 | 否 | LSP / 单文件查看（advisory，不进裁决） |

- mode 枚举是外部接口配置契约的一部分；取值/默认值/切换面在此定义，字段级 schema 由 R2-03 / R2-04 细化。

### R2-03 — 默认模式开箱路径契约

**覆盖 D-011 / D-012 / D-013 细则⑤**

- **默认模式**：C 类用户在 agent 工作流内嵌时刻触发的 Macro-B 仓库级四象限评审；开箱零配置（不需 CI / hook / 团队准备）。
- **“零配置”精确语义** = 一次 install 命令 + 首次 MCP 工具授权（非零交互）。
- **首次授权事件清单**（逐项）：
  1. 安装 Agent Plugin（plugin.json + skills/ + mcp.json + 扩展目录 + 内核 CLI）；
  2. 首次启动 kernel MCP（stdio）→ 客户端弹出 MCP 工具授权；
  3. 首次读取本地仓库路径 → 本地文件读取授权；
  4. （远程输入时）“远程 clone + 网络 + 本地 git 凭据使用”为一个授权事件（D-013 细则⑤）；
  5. 首次写 DuckDB 事实表 / 缓存目录 → 本地写入授权。
- **校验点**：默认模式必须与分发渠道同形（marketplace 一键装 → 零配置首跑）；默认体验不得需要 CI / hook 配置才能跑通（否则与一键安装渠道自相矛盾）。
- **风险登记**：默认体验绑死“agent 会话内发起”——宿主不支持 plugin 形态时默认模式不可达（宿主支持矩阵属实现期调研，spec 层只声明前提）。

### R2-04 — Agent Plugin 契约群

**覆盖 D-012**

- **plugin.json**：标准 Agent Plugins 1.0.0 schema（closed schema，$schema 常量 URI；客户端不得运行时拉取 schema）；字段含 name / version / description / skills / mcp / commands 等（字段级 schema 待通读规范全文后定稿，见信息缺口）。
- **mcp.json**：kernel MCP 只读证据查询面；stdio 传输，指向 DuckDB 事实表；严格只读（同 GitHub Copilot code review MCP 强制 readOnlyHint 口径）。
- **双 manifest 单一元数据源生成脚本规范**：单一元数据源（如 manifest.meta.json）→ 生成标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json；生成后 diff 比对防漂移；**无直接先例，属自研范围**（调研 R2-Q7 §3）。
- **内核 CLI 四外壳命令面**：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器——同一二进制多入口。
- **receipt 协议字段**：环境外确定性 gate 出具的可核验回执（证据引用 + 判定结果 + 可离线复核）；报告“行动建议”章的 verdict-gate 印记即其报告层形态。
- **provenance manifest 清单**：license + CHANGELOG + 签名收据（Sigstore / cosign keyless）+ 构建来源（SLSA 参照）。
- **安全纪律**：skill 壳只读隔离（判定 / 写库 / 出报告只能内核 CLI）；hooks 永不作裁决执行点（仅 PostToolUse / Stop 触发/呈现 receipt）。

### R2-05 — 输入面契约

**覆盖 D-013**

- **repo add 命令面**：repo add <path|owner/repo|url>；clone 只走 CLI 与配置文件，不暴露为 MCP 工具。
- **消歧规则**：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https / git@）才 clone。
- **clone 缓存目录布局**：隔离缓存目录（如 <cache>/repos/<hash>/）；不写回用户工作区；评审后可清理。
- **凭据复用**：本地 git 凭据链（SSH agent / credential helper / PAT 即用即清）；不新建凭据存储。
- **全深度校验拒绝路径**：远程一律 fetch-depth 0 + 校验 .git 完整性；浅 clone 显式拒绝并提示。
- **授权事件字段**：见 R2-03 首次授权事件清单第 4 项。

### R2 Coverage（对账）

| 来源 D-xxx | 覆盖的 R2 Decision |
|---|---|
| D-008 | （流程导航，由 R2-01 ~ R2-05 承接） |
| D-009 | R2-01 |
| D-010 | R2-02 |
| D-011 | R2-03 |
| D-012 | R2-03 / R2-04 |
| D-013 | R2-03 / R2-05 |

### R2 Out of Scope / 信息缺口

- 不启动工程实现（ADR-0002 边界；边界变更 = D-014 待拍板）。
- 待通读 Agent Plugins 1.0.0 规范全文后定稿 plugin.json / mcp.json 字段级 schema。
- 双 manifest 生成脚本无直接先例，属自研范围。
