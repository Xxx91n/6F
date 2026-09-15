# Spec: macro-audit spec 阶段展开

> 来源：架构报告 = [.scratch/macro-audit/spec-phase-tasks.md](../macro-audit/spec-phase-tasks.md) 18 项
> 决策 ledger：[decision-ledger.md](decision-ledger.md) (A-001 ~ A-048)
> WORKFLOW 引用：[WORKFLOW.md](WORKFLOW.md) §4.2 通用规则 / ADR-0001 ~ ADR-0018

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
> 边界（已更新 2026-09-12）：工程实现已启动并位于 6F/engine/（ADR-0002 superseded by ADR-0010 → ADR-0011；ledger D-014 revised / D-015 current）。

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

- 工程实现边界已变更：ADR-0002 superseded by ADR-0010 → ADR-0011（单仓 + engine/ 子目录）；ledger D-014 revised / D-015 current。
- 待通读 Agent Plugins 1.0.0 规范全文后定稿 plugin.json / mcp.json 字段级 schema。
- 双 manifest 生成脚本无直接先例，属自研范围。

## R3 — 验证协议（来源 D-016 ~ D-018，2026-09-12 grill 轮 3）

> 本段为指针段：决策全文以 docs/adr/0012、docs/adr/0013 与 decision-ledger D-016 ~ D-018 为准；执行计划见 spec-phase-tasks.md R3-01 ~ R3-07。

### R3-01 — 建设主干：端到端价值验证闭环（ADR-0012）
四阶段串行：阶段 0（push+CI 实跑 / fact table schema v0 含 correlation key / 确定性采集器不接 LLM）→ 阶段 1（6F 自身 Macro-B happy path，S2+S1 起手，产出首份带引文+Receipt 真报告，覆盖一条失败路径）→ 阶段 2（实测锚回流扫 16 缺口）→ 阶段 3（铺开+分发收尾）。性质为实现级 tracer bullet，非产品级 MVP 切片。

### R3-02 — 首报验收：三层闸门 + 预声明判据（ADR-0013）
A 形式达标（骨架+引文+Receipt）→ B 内容非平凡（预声明 kill criterion：2 正对照 + 3 真判据 + 1 负对照；真判据未命中=合法实验数据）→ C 信任裁决（三档裁定、依据预入库防 HARKing、锚定 B 产物、回写账本）。三级措辞：前置管线健康闸 / 主前提证伪闸 / 反向红条。

### R3 Coverage（对账）
- D-016 → R3-01 + ADR-0012 + 计划表 R3 全段 + CONTEXT（Value Validation Loop）；
- D-017 → R3-02 + ADR-0013 + 计划表 R3-04/05 + CONTEXT（Acceptance Gate / Kill Criterion）；
- D-018 → R3-02 + ADR-0013 + 计划表 R3-04 + CONTEXT（Positive Control）。

### Implementation Decisions（R3 执行轮，来源 A-019 ~ A-030，2026-09-12）

> 对账闸：A-019 ~ A-030 每条至少被本节一个 R3-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R3-D1 push 与 CI 实跑激活**（覆盖 A-019, A-020｜计划 R3-01｜issue 19）
push 到用户指定远端并触发 engine-ci.yml 首跑，取得首个 CI 绿/红证据；CI 矩阵平台范围明文为最小可证集并随首跑验证。闸门：远端与时机须用户明示授权；未授权不推。

**R3-D2 fact table schema v0**（覆盖 A-021｜计划 R3-02｜issue 20）
DuckDB fact table schema v0：字段级清单含 correlation key 前置字段；事件只追加、版本号演进；沿用上轮 A-007（SWMR）/A-008（版本演进）/A-010（correlation key）决议不重开。

**R3-D3 确定性采集器**（覆盖 A-022｜计划 R3-03｜issue 21）
采集器清单 = S2 ADR 结构扫描 + S1 定位素材 + git log，输出形状绑定 R3-D2 schema；不接 LLM；正对照与真判据共享同族 detector 路径。

**R3-D4 B 层判据预声明文档**（覆盖 A-023, A-024, A-025, A-029｜计划 R3-04｜issue 22）
三级 kill criterion 措辞 + 2 正对照 + 3 真判据（阈值跑前测定写死）+ 1 负对照（选材+复核路径）+ 引用策略（ICH E10 + ISO 13528 权威锚）；文档落位 commit 先于首报（HARKing 禁令）；须用户审阅后 commit。

**R3-D5 首报全链与三层闸门验收**（覆盖 A-026, A-027｜计划 R3-05｜issue 23）
6F 全链首跑（采集→fact→叙事→裁决→报告）：首报格式 md 主产物 + 可回查引文 + Receipt 印记 + 引文→结论支持关系校验；C 层判据显式覆盖 agent 可消费性（结构化裁决块/可解析引文锚）；同路径覆盖一条失败路径（降级 + ⚠ unverified）。

**R3-D6 缺口回流实测锚清扫**（覆盖 A-028｜计划 R3-06｜issue 24）
用首报实测锚补 CodeScene/GitClear 定向调研与 B 层迁移有效性多仓复核；定向调研只作校准输入不阻塞首报。

**R3-D7 铺开与分发收尾**（覆盖 A-030｜计划 R3-07｜issue 25）
分发收尾前置清单清点（BACKLOG B1/B2/B3 立票、plugin 上架条件、演示资产范围）逐项待用户拍板；B4.1 已被 D-015 取代不立项。

#### R3 对账（2026-09-12）

- A-019 ~ A-030 共 12 条 → R3-D1:2 / R3-D2:1 / R3-D3:1 / R3-D4:4 / R3-D5:2 / R3-D6:1 / R3-D7:1 = 12 覆盖，无去向记录清单 = 空。
## R4 — 序列化校准（来源 D-022 ~ D-028，2026-09-15 grill 轮 5）

> 本段为指针段：决策全文以 docs/adr/0015、docs/adr/0016 与 macro-audit decision-ledger D-022 ~ D-028 为准；执行计划见 spec-phase-tasks.md 第五轮 R4-01 ~ R4-05。

### R4-01 — 阶段 1.5 量测审计（ADR-0015 §Decision-3，D-025）
14 份 ADR 人工真值表 + 逐份 delta 表模板：区分 detector 漏认（内联 Nygard 格式）vs 真实缺失；产物 = R4-02 验收 golden set + 原 TC-2 RED 记 invalid 的逐份可归属原因（Assignable Cause）。先于一切 v2 代码；纯文档零构建。

### R4-02 — 判据 v2 追加（ADR-0015 §Decision-3，D-025）
adr-structure detector 接线 A-002 回退链（YAML 头 → 内联 Nygard → git 首提交）；v1 留档禁改；验收 = 与 R4-01 人工真值表一致率；对冻结首报数据重跑 → 并列读数 + 勘误披露（重测次数与判定规则事先写死，禁 testing into compliance）。

### R4-03 — ADR 治理卫生票（ADR-0015 §Decision-3，D-025）
6F 真实五件套缺失清零：准入范围 = R4-01 人工读数中真实缺失分解；验收独立于 R4-02——两票互为引用、互不为完成条件。

### R4-04 — 阶段 2a 冻结校准（ADR-0015 §Decision-1/2，D-023/D-024）
10 项 desk 清单（任务 2/4/8/9/10/11/12/13/14/15/16 + 任务 5 已锚行 + 任务 7 单写者域草案）；草案全部标注置信域（单写者证据禁外推多写者）；待探针占位带「满足判据 + 复审时点」两字段。

### R4-05 — 阶段 2b CodeLore 单上游探针（ADR-0015 §Decision-2，D-023/D-024/D-020 派生）
前置 = 运行时解析策略判定（容器捆绑 vs 二进制发现）+ 读 Agent Plugins 1.0.0 plugin schema 原文（P1 预核对 baseline 顺手做）；适配器 + 锁版本 + golden 契约测试（ADR-0014：适配层禁业务规则）；重跑 6F 首报同仓 + 同 spec 版本 diff；provenance 锚定（commit pin + spec 版本 + data fingerprint）；产物 = 数据源漂移报告 + 任务 1/3 实测锚 + README 上游清单 CodeLore 行状态更新（不虚报）。

### Implementation Decisions（R4 执行轮，来源 A-031 ~ A-036，2026-09-15）

> 对账闸：A-031 ~ A-036 每条至少被本节一个 R4-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R4-D1 阶段 1.5 量测审计**（覆盖 A-031｜计划 R4-01｜issue 26）
14 份 ADR 逐份人工真值表（五件套字段读数 + Nygard 内联格式识别）+ 逐份 delta 表模板（detector 漏认 vs 真实缺失分列）；产物即 R4-02 golden set 与 TC-2 RED invalid 判定的逐份可归属原因；纯文档零构建。

**R4-D2 判据 v2 追加**（覆盖 A-032｜计划 R4-02｜issue 27）
adr-structure detector 接线 A-002 回退链；v1 代码与 v1 阈值 0.60 留档禁改；验收 = 与真值表一致率（golden set 对照）；冻结首报数据重跑 → 并列读数 + 逐份 delta 表勘误披露；重测次数与判定规则事先写死。

**R4-D3 ADR 治理卫生**（覆盖 A-033｜计划 R4-03｜issue 28）
6F 自身 ADR 五件套真实缺失清零（范围仅以 R4-01 真实缺失分解为准）；与 R4-D2 互为引用、互不为完成条件；补写须注明勘误性质（量测审计驱动的治理补记）。

**R4-D4 C 层 disposition 补记**（覆盖 A-034｜任务书 T4｜issue 29）
T1~T3 结题后按 CAPA reopen 惯例补记 disposition：architecture-recovery 账本 C 裁定节追加（不改写原文与时间戳）；勘误式双读数发布（原 RED 不撤回 + 成对动作说明）。

**R4-D5 阶段 2a 冻结校准**（覆盖 A-035｜计划 R4-04｜issue 30）
冻结首报数据上的 10 项 desk 校准；草案带置信域标注；待探针占位两字段纪律（满足判据 + 复审时点）；不改冻结数据、不接新上游。

**R4-D6 阶段 2b CodeLore 探针**（覆盖 A-036｜计划 R4-05｜issue 31）
单上游薄垂直切片：适配器 → fact → 重跑首报同仓 + 同 spec 版本 diff；锁版本 + golden 契约测试；provenance 锚定三件套；产物 = 数据源漂移报告 + 任务 1/3 实测锚 + README 上游清单状态列更新。

#### R4 对账（2026-09-15）

- A-031 ~ A-036 共 6 条 → R4-D1~D6 各覆盖 1 条 = 6 覆盖，无去向记录清单 = 空。
- 波次序列化（per 任务书）：#26 → (#27 ∥ #28) → #29 → #30 → #31；唯一并行对 = #27/#28 且验收互不引用为完成条件。

## R5 — 阶段 3 铺开（来源 D-029 ~ D-036，2026-09-15 grill 轮 6）

> 本段为指针段：决策全文以 docs/adr/0017 与 macro-audit decision-ledger D-029 ~ D-036 为准；执行计划见 spec-phase-tasks.md 第六轮 R5-01 ~ R5-12 与 BACKLOG.md 阶段 3 票据包 #32~#43。
> 阶段 3 串行骨架（D-034）：扩面 → Macro-C → Micro-A → Micro-B → Macro-A；横切项挂触发器、非前置门禁。上架动作未授权（D-026/D-027 用户闸门）；preview 标注诚实是决策本体（ADR-0017）。

### Implementation Decisions（R5 执行轮，来源 A-037 ~ A-048，2026-09-15）

> 对账闸：A-037 ~ A-048 每条至少被本节一个 R5-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R5-D1 B1.2 落地（31 份 prompts 黑体块）**（覆盖 A-037｜计划 R5-01｜issue 32）
31 份 prompts/NN-*.md「## 收尾」段首黑体强提示块，措辞逐字 = D-029；范围 = 现存 31 份全量；handoffs 不加；未来新票由 WORKFLOW §4.2.6-6 模板纪律继承。已于轮 6 整理环节执行完毕。

**R5-D2 T7 挂门机检化 guard**（覆盖 A-038｜计划 R5-02｜issue 33）
统一 guard 扫描全部挂门项三字段（最迟拍板时点 / 触发事件 / 复审时点）到期报警；输入四族 = 25-checklist 挂门行 + 账本两字段登记项 + CodeLore 暂缓面集复审时点 + 多写者三触发器；值守规则 = 触发未拍 1 工作日升级 / 硬到期重组改绑一次 / 再到期升级用户。

**R5-D3 plugin.json 合规修复**（覆盖 A-039｜计划 R5-03｜issue 34）
engine/plugin.json 对齐 Agent Plugins 1.0.0：$schema const、schemaVersion/skills/mcp 范围收敛、extensions 改反向域名对象图；修元数据源（manifest.meta.json / gen-manifests.mjs）而非仅改产物；ajv 一次性校验留证 + 常驻守卫零依赖结构断言。上架硬前置链第一环。

**R5-D4 CodeLore 扩面首批 ≈30 面**（覆盖 A-040｜计划 R5-04｜issue 35）
演化主干 12 面＋S3 族 6 面＋S5 族 12 面，逐面 golden 契约测试（ADR-0014：适配层禁业务规则、raw 语义不出适配层）；面名以 `codelore analyze --help` 实物枚举为准；Macro-C preview 前置。

**R5-D5 CodeLore LLM 面独立票**（覆盖 A-041｜计划 R5-05｜issue 36）
explain 族 env 门控（CODELORE_LLM_*）＋成本验收面；S4 ADR 假设抽取前置；独立验收不混入 #35。

**R5-D6 试点面可用性审计**（覆盖 A-042｜计划 R5-06｜issue 37）
env-manager / anysearch-cli / jiahao 三仓只读实测：PR 人/机比、supersede 链完整度、托管面有无；产出 层×仓 capacity 矩阵（Pilot-surface Audit 三问）。

**R5-D7 Macro-C preview（第二能力层）**（覆盖 A-043｜计划 R5-07｜issue 38）
anysearch-cli 为校准语料（56 ADR＋supersede 链）；报告强制披露「单仓校准（anysearch-cli）」结构性限制；完成定义含该层 happy+failure 演示双件（D-032 DoD 准入件）。

**R5-D8 Macro-B 三仓 one-shot＋jiahao 回归**（覆盖 A-044｜计划 R5-08｜issue 39）
Macro-B 对三试点仓各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI——接入即触发多写者 self-probe 实测封口（D-034④a，衔接 #33）。

**R5-D9 非自有仓泛化验证**（覆盖 A-045｜计划 R5-09｜issue 40）
≥1 非自有公开仓经 URL opt-in（D-013 首实用户）跑通 Macro-B；Macro-B GA 前置条件。

**R5-D10 分发收尾**（覆盖 A-046｜计划 R5-10｜issue 41）
五子项：examples/first-report/ 复制四件＋披露 README／README·marketplace preview 标注＋0.x 语义＋changelog／listing 资产（未上架层「Not yet in preview」披露块）／Agent Plugins preview 字段查证＋竞品占位扫描（前置子任务）／凭据申请（D-026③ 已触发）。上架动作停用户闸门。

**R5-D11 上游队列值守**（覆盖 A-047｜计划 R5-11｜issue 42）
Scorecard/repomix 探针按层需求拉动不插队；CodeLore sqlite/parquet dump 对照评估（采纳须另立 ADR）；Macro-B preview 供应链象限维持「⚠ 数据未接」披露。

**R5-D12 样例 golden CI**（覆盖 A-048｜计划 R5-12｜issue 43）
CI 重渲染 examples/first-report/ fixture 并 diff，不一致即 fail，更新走 PR 审查；禁自动重生成直通 main；与 #33 同批立项、执行在 #41 样例落位后。

#### R5 对账（2026-09-15）

- A-037 ~ A-048 共 12 条 → R5-D1~D12 各覆盖 1 条 = 12 覆盖，无去向记录清单 = 空。
- 波次序列化（per 任务书/D-036）：#33 最优先 → #34/#35 并行首票 → #36/#37/#41 → #38/#39/#43 → #40；#42 触发器拉动不占波次；#32 已于轮 6 整理环节闭环。
