# Spec: macro-audit spec 阶段展开

> 来源：架构报告 spec-phase-tasks.md 18 项（治理工件已退役，原文见 git 历史）
> 决策 ledger：decision-ledger.md A-001 ~ A-048（治理工件已退役，原文见 git 历史）

## Problem Statement

宏观+微观工程内容审计产品的 grill 决策层已完成（7 条决策全部 current，7 条 ADR 落地）；spec 阶段需展开 S1-S5 rubric 全文判据、集成层 schema/契约、报告模板最大公约数、10 演示路径明细等具体内容。无 spec 文本则决策层无法落地为可执行工程。

## Solution

把架构报告（spec-phase-tasks.md）的 18 项摩擦点全部登记为决策 ledger（A-001 ~ A-018），按"战略判据 / 集成架构 / 报告模板 / 演示路径"四个决策簇分组展开为 Implementation Decisions，每条 Decision 明确声明覆盖的 A-xxx；按依赖关系切成 18 张 issue / 18 份 handoff / 18 份启动器；并行波次由 issue 的 Blocked by 字段推导，写入 README.md。

## User Stories

1. As an 架构审计产品的内部架构师, I want S1-S5 rubric 在 5 scale 下都有具体判据/数据源/阈值, so that 我可以为每个真实仓库跑出可重复的审计报告
2. As an Hub-of-Facts 集成架构实施者, I want DuckDB fact table 的写入策略与 schema 演进规则明确, so that 我可以落地 5 scale 共享的事实底座
3. As an 报告模板设计者, I want 5 scale × 4 象限的共享结构 + scale 部分边界明确, so that Macro-A 跨仓叙事与 Micro-A 行级评审能在同一模板内并存
4. As an 演示场景编排者, I want 10 条演示路径（happy + failure）的触发条件/降级模式/报告产物明文, so that 我能交付可点的失败语义演示
5. As an 仓库维护者, I want 每张票覆盖的 A-xxx ID 明确可见, so that 我能 reverse-trace 任意决策回 ledger 原始摩擦点
6. As an 子窗口 agent, I want 启动器 ≤60 行 + 必读清单 + 专属 delta, so that 我能在 fresh context 下立即开工并避免复述已知规则

## Implementation Decisions

每条 Decision 必须引用至少一个 A-xxx。无去向记录清单非空时禁止立票。

### Cluster: 战略 quadrant S1-S5 全文判据

#### Decision 4.1 — S1 定位收敛语义度量方法
- **覆盖 A-001**
- 不锁 70% 为 hard rule；交付试点仓库清单 + 校对流程（含 embedding 选型、关键词 fallback、人工抽检）
- 与 A-005 矩阵结构对齐（每行的"语义度量"单元格复用 4.5 决策的矩阵格式）

#### Decision 4.2 — S2 ADR 质量事后补写判定
- **覆盖 A-002**
- 交付目标仓库 ADR YAML 时间戳头一致性核查清单 + 缺失头时的回退方案
- 阈值"事后补写 > 90 天 > 20% 判失败"作为初版参数；预留跨仓校对

#### Decision 4.3 — S4 ADR 假设提取工具链
- **覆盖 A-003**
- 工具链必须含 LLM 抽取 + 人工复核回路（不能只信 LLM）
- 输出假设失效集对照表模板（vs InfoQ ADR Drift Monitor 理念清单）

#### Decision 4.4 — S5 单人仓判据降权规则
- **覆盖 A-004**
- 团队规模归一化曲线（单作者模块占比 vs 团队规模的分桶阈值）
- 报告模板明确标注"信号不足"时的回退路径（按战略判据簇的约束）

#### Decision 4.5 — 25 采集单元矩阵
- **覆盖 A-005**
- 矩阵结构 = 5 dim × 5 scale = 25 个单元，每个单元含：判据定义 / 数据源 / 阈值初版 / 跨仓校对机制
- 是 4.1/4.2/4.3/4.4 的上游抽象（任何单维决策必须能填入矩阵的对应行）

#### Decision 4.6 — AI-agent 对 ADR 质量冲击评估
- **覆盖 A-006**
- 推迟：低优先级；spec 阶段交付"评估框架"（指标定义 + 取样方法），实际评估待 AI 代码生成主流化

### Cluster: 集成架构 = Hub-of-Facts with Federated Adjudication 落地

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
- 与报告模板的"陈旧数据标记"字段对齐

#### Decision 5.4 — Cross-scale correlation key
- **覆盖 A-010**
- fact table schema 前置字段：trace_id / baggage_id（OpenTelemetry Baggage 心智）
- 5 scale 共用此字段做跨 scale 关联查询

#### Decision 5.5 — LangGraph supervisor 适配评估
- **覆盖 A-011**
- adopt vs 自研 hub 协调层；评估产物 = 决策矩阵（语言契合度 / 学习曲线 / 与 Hub-of-Facts SSOT 心智冲突面）

#### Decision 5.6 — Data mesh 失败模式防线设计
- **覆盖 A-012**
- 三大失败（无人拥有 in-between / 悄悄断裂 / 重复劳动）各一条防线 + 监控指标

#### Decision 5.7 — 工具对齐评估
- **覆盖 A-013**
- metrics layer / OpenTelemetry baggage / AsyncAPI / LangGraph 与本仓库语言栈契合度评估矩阵

### Cluster: 报告模板 = 共享结构 + scale 部分

#### Decision 6.1 — 共享结构最大公约数
- **覆盖 A-014**
- 5 scale × 4 象限矩阵上的交集字段清单（章顺序锁定、字段必含、不锁措辞）

#### Decision 6.2 — Scale 部分差异边界
- **覆盖 A-015**
- Macro-A（跨仓叙事）vs Micro-A（PR 行级）vs 其他 3 档的差异字段清单
- 每档部分含：触发器、输入、输出粒度、引文密度、verdict-gate 印记位置

#### Decision 6.3 — 渲染样式与模板结构切分
- **覆盖 A-016**
- spec 锁结构 + 字段；demo 锁样式（避免 spec 越界到 UI）

### Cluster: 演示场景 = 10 路径

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

## Coverage（必填——核对输出）

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
- 不引入商业层（已定下来）；不引入具体工具选型（集成架构决策后由 Phase 4 落地）
- 不写 ADR（决策已固化）

## Further Notes

- 本 spec 是 to-spec 流程的产出；下一步 to-tickets 把每个 Decision 转 issue + handoff + prompt
- 并行波次由 issue 的 Blocked by 字段推导（不新造顺序），输出到 README.md

---

## R2 — 产品定义补完（2026-09-12 grill 轮 2）

> 来源：spec-phase-tasks.md 第二轮（R2-01 ~ R2-05）；对应裁定已随治理工件退役，原文见 git 历史。
> 与轮 1（A-001 ~ A-018）共用本 spec 结构；R2 覆盖表见文末。
> 流程导航决策（方向 = 补完产品定义）由 R2-01 ~ R2-05 承接，不单独立条。
> 边界（已更新 2026-09-12）：工程实现已启动并位于 6F/engine/（单仓 + engine/ 子目录）。

### User Stories（R2 增量）

7. As a 技术决策者（CTO / 架构师 / 尽调人）, I want 面向非作者可读的叙事化四象限报告 + 可追溯证据引文, so that 我能在尽调/架构决策前给出可驳回的判定
8. As a 工程团队成员（TL / 平台组 / 质量负责人）, I want CI 关卡裁决（verdict-gate）+ 低误报的行级带引文评审, so that 我能把审计嵌入 push/PR 流程而不被噪音淹没
9. As an agent 生态开发者（Claude Code / Codex 用户）, I want 一次安装的 Agent Plugin + 稳定的 MCP 只读查询面, so that 我能在 agent 会话内直接触发仓库评审
10. As a 自用者（本人 + 三自有仓）, I want 本地可复现的审计报告, so that 我能用真实反馈回路校对 rubric 判据

### R2-01 — 目标用户四类全集（persona 段落）

**负向约束**：禁止缩小范围为单一用户类；不做用户间优先级排序，也不按时间切块（和拒绝砍出来的第一版的既有决定同一个路子）。

#### Persona A — 技术决策者（CTO / 架构师 / 尽调人）
- **何时用**：尽调或架构决策前的一次性审视；需对外部仓库/组合给出可追溯判定。
- **拿走什么**：叙事化四象限报告（结构/行为/供应链/战略）+ 证据引文 + 战略诊断（S1-S5）；面向非作者可读。
- **主要 scale**：Macro-A / Macro-B（+ Macro-C）。
- **交付拉动**：报告可读性（面向非作者）。

#### Persona B — 工程团队（TL / 平台组 / 质量负责人）
- **何时用**：周期评审或 CI 关卡触发时（push / PR 自动触发）。
- **拿走什么**：verdict-gate 裁决 + 行级带引文评审 + 低误报的可行动建议。
- **主要 scale**：Micro-A / Macro-B。
- **交付拉动**：CI 关卡的可靠性和低误报。

#### Persona C — agent 生态开发者（Claude Code / Codex 用户）
- **何时用**：agent 工作流内嵌时刻（会话内“评审这个仓库”）。
- **拿走什么**：一次安装的 Agent Plugin + MCP 只读证据查询面 + Macro-B 四象限叙事报告。
- **主要 scale**：Macro-B（默认模式）。
- **交付拉动**：plugin 分发与 MCP 接口稳定。

#### Persona D — 自用（本人 + jiahao / anysearch-cli / env-manager）
- **何时用**：手动触评时刻；作为 rubric 判据调优的校对锚。
- **拿走什么**：本地可复现的审计报告 + rubric 校对的真实反馈回路。
- **主要 scale**：Macro-B / Macro-C。
- **交付拉动**：本地可复现。

### R2-02 — 使用场景并集 + mode 枚举配置面

**负向约束**：默认模式必须单一（不许多默认并存）；非默认模式必须配置可达，禁止降为二等或砍掉。

#### 场景并集（4 类用户 × 时刻 × scale 归属，允许重叠）

| # | 用户 | 时刻 | scale 归属 | 是否默认 |
|---|---|---|---|---|
| S1 | C agent 生态开发者 | agent 工作流内嵌 | Macro-B | ✅ 默认 |
| S2 | B 工程团队 | CI 关卡（push/PR） | Micro-A | 配置可达 |
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

**覆盖：默认模式开箱路径 / Agent Plugin 契约群 / 输入面契约**

- **默认模式**：C 类用户在 agent 工作流内嵌时刻触发的 Macro-B 仓库级四象限评审；开箱零配置（不需 CI / hook / 团队准备）。
- **“零配置”精确语义** = 一次 install 命令 + 首次 MCP 工具授权（非零交互）。
- **首次授权事件清单**（逐项）：
  1. 安装 Agent Plugin（plugin.json + skills/ + mcp.json + 扩展目录 + 内核 CLI）；
  2. 首次启动 kernel MCP（stdio）→ 客户端弹出 MCP 工具授权；
  3. 首次读取本地仓库路径 → 本地文件读取授权；
  4. （远程输入时）“远程 clone + 网络 + 本地 git 凭据使用”为一个授权事件（输入面契约的远程授权细则）；
  5. 首次写 DuckDB 事实表 / 缓存目录 → 本地写入授权。
- **校验点**：默认模式必须与分发渠道同形（marketplace 一键装 → 零配置首跑）；默认体验不得需要 CI / hook 配置才能跑通（否则与一键安装渠道自相矛盾）。
- **风险登记**：默认体验绑死“agent 会话内发起”——宿主不支持 plugin 形态时默认模式不可达（宿主支持矩阵属实现期调研，spec 层只声明前提）。

### R2-04 — Agent Plugin 契约群

**覆盖：Agent Plugin 契约群**

- **plugin.json**：标准 Agent Plugins 1.0.0 schema（closed schema，$schema 常量 URI；客户端不得运行时拉取 schema）；字段含 name / version / description / skills / mcp / commands 等（字段级 schema 待通读规范全文后定稿，见信息缺口）。
- **mcp.json**：kernel MCP 只读证据查询面；stdio 传输，指向 DuckDB 事实表；严格只读（同 GitHub Copilot code review MCP 强制 readOnlyHint 规则）。
- **双 manifest 单一元数据源生成脚本规范**：单一元数据源（如 manifest.meta.json）→ 生成标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json；生成后 diff 比对防走样；**无直接先例，属自研范围**（调研 R2-Q7 §3）。
- **内核 CLI 四外壳命令面**：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器——同一二进制多入口。
- **receipt 协议字段**：环境外确定性 gate 出具的可核验回执（证据引用 + 判定结果 + 可离线复核）；报告“行动建议”章的 verdict-gate 印记即其报告层形态。
- **provenance manifest 清单**：license + CHANGELOG + 签名收据（Sigstore / cosign keyless）+ 构建来源（SLSA 参照）。
- **安全纪律**：skill 壳只读隔离（判定 / 写库 / 出报告只能内核 CLI）；hooks 永不作裁决执行点（仅 PostToolUse / Stop 触发/呈现 receipt）。

### R2-05 — 输入面契约

**覆盖：输入面契约**

- **repo add 命令面**：repo add <path|owner/repo|url>；clone 只走 CLI 与配置文件，不暴露为 MCP 工具。
- **消歧规则**：明确本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 明确 URL（https / git@）才 clone。
- **clone 缓存目录布局**：隔离缓存目录（如 <cache>/repos/<hash>/）；不写回用户工作区；评审后可清理。
- **凭据复用**：本地 git 凭据链（SSH agent / credential helper / PAT 即用即清）；不新建凭据存储。
- **全深度校验拒绝路径**：远程一律 fetch-depth 0 + 校验 .git 完整性；浅 clone 明确拒绝并提示。
- **授权事件字段**：见 R2-03 首次授权事件清单第 4 项。

### R2 Coverage（核对）

| 来源决策 | 覆盖的 R2 Decision |
|---|---|
| 流程导航（补完产品定义） | （由 R2-01 ~ R2-05 承接） |
| 目标用户四类全集 | R2-01 |
| 使用场景并集 + mode 枚举 | R2-02 |
| 默认模式开箱路径 | R2-03 |
| Agent Plugin 契约群 | R2-03 / R2-04 |
| 输入面契约 | R2-03 / R2-05 |

### R2 Out of Scope / 信息缺口

- 工程实现边界已变更：单仓 + engine/ 子目录。
- 待通读 Agent Plugins 1.0.0 规范全文后定稿 plugin.json / mcp.json 字段级 schema。
- 双 manifest 生成脚本无直接先例，属自研范围。

## R3 — 验证协议（2026-09-12 grill 轮 3）

> 本段为指针段：决策全文以本文件的 R3-01/R3-02 段为准（原裁定与执行计划 R3-01 ~ R3-07 已随治理工件退役，见 git 历史）。

### R3-01 — 建设主干：端到端价值验证完整跑通
四阶段串行：阶段 0（push+CI 实跑 / fact table schema v0 含 correlation key / 确定性采集器不接 LLM）→ 阶段 1（6F 自身 Macro-B happy path，S2+S1 起手，产出首份带引文+Receipt 真报告，覆盖一条失败路径）→ 阶段 2（实测锚回流扫 16 缺口）→ 阶段 3（铺开+分发收尾）。这是一条打通全链的试验路径，不是产品级的缩水版。

### R3-02 — 首报验收：三层关卡 + 事前判据
A 形式达标（结构+引文+Receipt）→ B 内容非平凡（预声明 kill criterion：2 正对照 + 3 真判据 + 1 负对照；真判据未命中=合法实验数据）→ C 信任裁决（三档裁定、依据预入库防 HARKing、锚定 B 产物、回写记录）。三级措辞：前置管线健康闸 / 主前提证伪闸 / 反向红条。

### R3 Coverage（核对）
- 端到端价值验证完整跑通 → R3-01 + 计划表 R3 全段 + CONTEXT（Value Validation Loop）；
- 三层验收关卡 → R3-02 + 计划表 R3-04/05 + CONTEXT（Acceptance Gate / Kill Criterion）；
- Positive Control → R3-02 + 计划表 R3-04 + CONTEXT（Positive Control）。

### Implementation Decisions（R3 执行轮，来源 A-019 ~ A-030，2026-09-12）

> 核对闸：A-019 ~ A-030 每条至少被本节一个 R3-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R3-D1 push 与 CI 实跑激活**（覆盖 A-019, A-020｜计划 R3-01｜issue 19）
push 到用户指定远端并触发 engine-ci.yml 首跑，取得首个 CI 绿/红证据；CI 矩阵平台范围明文为最小可证集并随首跑验证。关卡：远端与时机须用户明示授权；未授权不推。

**R3-D2 fact table schema v0**（覆盖 A-021｜计划 R3-02｜issue 20）
DuckDB fact table schema v0：字段级清单含 correlation key 前置字段；事件只追加、版本号演进；沿用上轮 A-007（SWMR）/A-008（版本演进）/A-010（correlation key）决议不重开。

**R3-D3 确定性采集器**（覆盖 A-022｜计划 R3-03｜issue 21）
采集器清单 = S2 ADR 结构扫描 + S1 定位素材 + git log，输出形状绑定 R3-D2 schema；不接 LLM；正对照与真判据共享同族 detector 路径。

**R3-D4 B 层判据预声明文档**（覆盖 A-023, A-024, A-025, A-029｜计划 R3-04｜issue 22）
三级 kill criterion 措辞 + 2 正对照 + 3 真判据（阈值跑前测定写死）+ 1 负对照（选材+复核路径）+ 引用策略（ICH E10 + ISO 13528 权威锚）；文档放进 commit 先于首报（HARKing 禁令）；须用户审阅后 commit。

**R3-D5 首报全链与三层关卡验收**（覆盖 A-026, A-027｜计划 R3-05｜issue 23）
6F 全链首跑（采集→fact→叙事→裁决→报告）：首报格式 md 主产物 + 可回头查引文 + Receipt 印记 + 引文→结论支持关系校验；C 层判据明确覆盖 agent 可消费性（结构化裁决块/可解析引文锚）；同路径覆盖一条失败路径（降级 + ⚠ unverified）。

**R3-D6 缺口回流实测锚清扫**（覆盖 A-028｜计划 R3-06｜issue 24）
用首报实测锚补 CodeScene/GitClear 定向调研与 B 层迁移有效性多仓复核；定向调研只作校对输入不阻塞首报。

**R3-D7 铺开与分发收尾**（覆盖 A-030｜计划 R3-07｜issue 25）
分发收尾前置清单清点（BACKLOG B1/B2/B3 立票、plugin 上架条件、演示资产范围）当时逐项待拍板——B 票据已随治理工件退役；B4.1 已被单仓 + engine/ 子目录的架构决策取代不立项。

#### R3 核对（2026-09-12）

- A-019 ~ A-030 共 12 条 → R3-D1:2 / R3-D2:1 / R3-D3:1 / R3-D4:4 / R3-D5:2 / R3-D6:1 / R3-D7:1 = 12 覆盖，无去向记录清单 = 空。
## R4 — 序列化校对（2026-09-15 grill 轮 5）

> 本段为指针段：决策全文以本文件 R4 段为准（原裁定与执行计划 R4-01 ~ R4-05 已随治理工件退役，见 git 历史）。

### R4-01 — 阶段 1.5 量测审计
14 份 ADR 人工真值表 + 逐份 delta 表模板：区分 detector 漏认（内联 Nygard 格式）vs 真实缺失；产物 = R4-02 验收 golden set + 原 TC-2 RED 记 invalid 的逐份可归属原因（Assignable Cause）。先于一切 v2 代码；纯文档零构建。

### R4-02 — 判据 v2 追加
adr-structure detector 接线 A-002 回退链（YAML 头 → 内联 Nygard → git 首提交）；v1 留档禁改；验收 = 与 R4-01 人工真值表一致率；对冻结首报数据重跑 → 并列读数 + 勘误说明（重测次数与判定规则事先写死，禁 testing into compliance）。

### R4-03 — ADR 治理卫生票
6F 真实五件套缺失清零：准入范围 = R4-01 人工读数中真实缺失分解；验收独立于 R4-02——两票互为引用、互不为完成条件。

### R4-04 — 阶段 2a 冻结校对
10 项 desk 清单（任务 2/4/8/9/10/11/12/13/14/15/16 + 任务 5 已锚行 + 任务 7 单写者域草案）；草案全部标注置信域（单写者证据禁外推多写者）；待只读检查占位带「满足判据 + 复审时点」两字段。

### R4-05 — 阶段 2b CodeLore 单上游只读检查
前置 = 运行时解析策略判定（容器捆绑 vs 二进制发现）+ 读 Agent Plugins 1.0.0 plugin schema 原文（P1 预核对 baseline 顺手做）；中间层 + 锁版本 + golden 契约测试（中间层双轨制：适配层禁业务规则）；重跑 6F 首报同仓 + 同 spec 版本 diff；provenance 锚定（commit pin + spec 版本 + data fingerprint）；产物 = 数据源变化报告 + 任务 1/3 实测锚 + README 上游清单 CodeLore 行状态更新（不虚报）。

### Implementation Decisions（R4 执行轮，来源 A-031 ~ A-036，2026-09-15）

> 核对闸：A-031 ~ A-036 每条至少被本节一个 R4-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R4-D1 阶段 1.5 量测审计**（覆盖 A-031｜计划 R4-01｜issue 26）
14 份 ADR 逐份人工真值表（五件套字段读数 + Nygard 内联格式识别）+ 逐份 delta 表模板（detector 漏认 vs 真实缺失分列）；产物即 R4-02 golden set 与 TC-2 RED invalid 判定的逐份可归属原因；纯文档零构建。

**R4-D2 判据 v2 追加**（覆盖 A-032｜计划 R4-02｜issue 27）
adr-structure detector 接线 A-002 回退链；v1 代码与 v1 阈值 0.60 留档禁改；验收 = 与真值表一致率（golden set 对照）；冻结首报数据重跑 → 并列读数 + 逐份 delta 表勘误说明；重测次数与判定规则事先写死。

**R4-D3 ADR 治理卫生**（覆盖 A-033｜计划 R4-03｜issue 28）
6F 自身 ADR 五件套真实缺失清零（范围仅以 R4-01 真实缺失分解为准）；与 R4-D2 互为引用、互不为完成条件；补写须注明勘误性质（量测审计驱动的治理补记）。

**R4-D4 C 层 disposition 补记**（覆盖 A-034｜任务书 T4｜issue 29）
T1~T3 结题后按 CAPA reopen 惯例补记 disposition：architecture-recovery 记录 C 裁定节追加（不改写原文与时间戳）；勘误式双读数发布（原 RED 不撤回 + 成对动作说明）。

**R4-D5 阶段 2a 冻结校对**（覆盖 A-035｜计划 R4-04｜issue 30）
冻结首报数据上的 10 项 desk 校对；草案带置信域标注；待只读检查占位两字段纪律（满足判据 + 复审时点）；不改冻结数据、不接新上游。

**R4-D6 阶段 2b CodeLore 只读检查**（覆盖 A-036｜计划 R4-05｜issue 31）
只接一个上游的一条薄路径：中间层 → fact → 重跑首报同仓 + 同 spec 版本 diff；锁版本 + golden 契约测试；provenance 锚定三件套；产物 = 数据源变化报告 + 任务 1/3 实测锚 + README 上游清单状态列更新。

#### R4 核对（2026-09-15）

- A-031 ~ A-036 共 6 条 → R4-D1~D6 各覆盖 1 条 = 6 覆盖，无去向记录清单 = 空。
- 波次序列化（per 任务书）：#26 → (#27 ∥ #28) → #29 → #30 → #31；唯一并行对 = #27/#28 且验收互不引用为完成条件。

## R5 — 阶段 3 铺开（2026-09-15 grill 轮 6）

> 本段为指针段：决策全文以本文件 R5 段为准（原裁定、执行计划 R5-01 ~ R5-12 与 BACKLOG 票据包 #32~#43 已随治理工件退役，见 git 历史）。
> 阶段 3 串行结构：扩面 → Macro-C → Micro-A → Micro-B → Macro-A；横切项挂触发器、非前置关卡。上架动作未授权（用户关卡）；preview 标注诚实是决策本体（Preview 分级发布）。

### Implementation Decisions（R5 执行轮，来源 A-037 ~ A-048，2026-09-15）

> 核对闸：A-037 ~ A-048 每条至少被本节一个 R5-Dn 覆盖；无去向记录清单非空时禁止立票（当前：空）。

**R5-D1 B1.2 落地（31 份 prompts 黑体块）**（覆盖 A-037｜计划 R5-01｜issue 32）
31 份 prompts/NN-*.md「## 收尾」段首黑体强提示块，措辞逐字 = 轮 6 整理时定的强提示块文本；范围 = 现存 31 份全量；handoffs 不加；未来新票由 WORKFLOW §4.2.6-6 模板纪律继承。已于轮 6 整理环节执行完毕。

**R5-D2 T7 到期提醒的机器检查**（覆盖 A-038｜计划 R5-02｜issue 33）
统一检查脚本扫描全部到期提醒项的三字段（最迟拍板时点 / 触发事件 / 复审时点）到期报警；输入四族 = 25-checklist 到期提醒行 + 记录两字段登记项 + CodeLore 暂缓面集复审时点 + 多写者三触发器；定期检查规则 = 触发未拍 1 工作日升级 / 硬到期重组改绑一次 / 再到期升级用户。

**R5-D3 plugin.json 合规修复**（覆盖 A-039｜计划 R5-03｜issue 34）
engine/plugin.json 对齐 Agent Plugins 1.0.0：$schema const、schemaVersion/skills/mcp 范围收敛、extensions 改反向域名对象图；修元数据源（manifest.meta.json / gen-manifests.mjs）而非仅改产物；ajv 一次性校验留证 + 常驻检查脚本零依赖结构断言。上架硬前置链第一环。

**R5-D4 CodeLore 扩面首批 ≈30 面**（覆盖 A-040｜计划 R5-04｜issue 35）
演化主干 12 面＋S3 族 6 面＋S5 族 12 面，逐面 golden 契约测试（适配层禁业务规则、raw 语义不出适配层）；面名以 `codelore analyze --help` 实物枚举为准；Macro-C preview 前置。

**R5-D5 CodeLore LLM 面独立票**（覆盖 A-041｜计划 R5-05｜issue 36）
explain 族 env 门控（CODELORE_LLM_*）＋成本验收面；S4 ADR 假设抽取前置；独立验收不混入 #35。

**R5-D6 试点面可用性审计**（覆盖 A-042｜计划 R5-06｜issue 37）
env-manager / anysearch-cli / jiahao 三仓只读实测：PR 人/机比、supersede 链完整度、托管面有无；产出 层×仓 capacity 矩阵（Pilot-surface Audit 三问）。

**R5-D7 Macro-C preview（第二能力层）**（覆盖 A-043｜计划 R5-07｜issue 38）
anysearch-cli 为校对语料（56 ADR＋supersede 链）；报告强制说明单仓校对的范围和结构性限制（报告字段名保持 `calibration_scope`）；完成定义含该层 happy+failure 演示双件（DoD 准入件）。

**R5-D8 Macro-B 三仓 one-shot＋jiahao 回归**（覆盖 A-044｜计划 R5-08｜issue 39）
Macro-B 对三试点仓各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI——接入即触发多写者 self-probe 实测定下来（衔接 #33）。

**R5-D9 非自有仓泛化验证**（覆盖 A-045｜计划 R5-09｜issue 40）
≥1 非自有公开仓经 URL opt-in（首实用户）跑通 Macro-B；Macro-B GA 前置条件。

**R5-D10 分发收尾**（覆盖 A-046｜计划 R5-10｜issue 41）
五子项：examples/first-report/ 复制四件＋说明 README／README·marketplace preview 标注＋0.x 语义＋changelog／listing 资产（未上架层「Not yet in preview」说明块）／Agent Plugins preview 字段查证＋竞品占位扫描（前置子任务）／凭据申请（已触发）。上架动作停用户关卡。

**R5-D11 上游队列定期检查**（覆盖 A-047｜计划 R5-11｜issue 42）
Scorecard/repomix 只读检查按层需求拉动不插队；CodeLore sqlite/parquet dump 对照评估（采纳须另立 ADR）；Macro-B preview 供应链象限维持「⚠ 数据未接」说明。

**R5-D12 样例 golden CI**（覆盖 A-048｜计划 R5-12｜issue 43）
CI 重渲染 examples/first-report/ fixture 并 diff，不一致即 fail，更新走 PR 审查；禁自动重生成直通 main；与 #33 同批立项、执行在 #41 样例放进后。

#### R5 核对（2026-09-15）

- A-037 ~ A-048 共 12 条 → R5-D1~D12 各覆盖 1 条 = 12 覆盖，无去向记录清单 = 空。
- 波次序列化（按任务书分波）：#33 最优先 → #34/#35 并行首票 → #36/#37/#41 → #38/#39/#43 → #40；#42 触发器拉动不占波次；#32 已于轮 6 整理环节收尾。

## R7 — W14 收尾裁决包（2026-09-16 grill 轮 8）

> 本段为指针段：决策全文以本文件 R7 段为准（原裁定、执行计划 R7-01 ~ R7-06 与 BACKLOG #41b/#46 已随治理工件退役，见 git 历史）。

- #41b 上架面授权至提交前一刻（资产/查证/凭据申请随 DoR 开工，提交=用户关卡）；
- 多写者域按判据意图读法跑通：SWMR 单写者门面成文、fail-fast 准入、L0→L3 升级阶梯（SWMR 单写者门面 + fail-fast + L0→L3 升级阶梯）；
- desk-task15 触发器重绑 micro-a-preview-prep＋勘误留痕（分层记录：fired 记录不可变／绑定可修正）；
- CodeLore 残余 4 面裁决清零：entity-effort→后续批次，architecture-violations/defect-validation/finding-hotspot-overlap→暂缓面集（逐项判据＋复审时点）；
- Macro-B 回归 CI 迁回 6F 自有 CI（URL opt-in 公仓 clone，零 token），jiahao 仅留审计对象角色；
- Micro-A preview 试点集 = {env-manager, jiahao}＋经典公开仓第三槽（挂托管 API 中间层前置）。

---

## R8 — 2026-09-16 之后的产品级决策（2026-10-26 治理轮补记，tracker #41）

> 本段由治理票 tracker #41 追加，记录 R7 之后的产品级决策；架构上的取舍写在 `docs/adr/` 的现行决定里（索引见 [`docs/adr/README.md`](adr/README.md)），本段不抄一遍。
> 来源只写这几类：架构决定、工单（一律写 `tracker #N`，指 GitHub 上的现行工单）、commit、现行文件；本段不加新的 D 编号。
> 编号只在本文件内有效：退役 `spec-phase-tasks.md`（已移出版本控制，见 git 历史）的 R8-01 ~ R8-04 是历史编号，不指本段。
> 本段接在 R7 后面：R1–R7 一个字都没动。

### R8-1 — Macro-C 做成正式入口（capability 2 of 5 · preview）

- **决策**：Macro-C 从退役的脚本管线搬成 `audit --scale Macro-C` 正式入口；做成正式入口的前提 = 用同一族基准做一次差分重校对（85-check C 组逐值相等），没通过就不进预览版。
- **写事实的方式**：和 Micro-B 文件卡共用同一套事实生成逻辑（同粒度、同一条恒等式），不另写一套 fact。
- **校对说明**：校对用的语料 = anysearch-cli 一个仓；只用一个仓校对会有什么结构性限制，必须在报告里说明（承 R5-D7）。
- **基准**：基准语料由仓库自己保存：一份冻结的基准包（frozen bundle）＋ 独立的 `baseline-lock` 登记版本；落地由 tracker #33 / tracker #32 / tracker #34 承担——本段只记决定，不把还没做成的事写成已经做成。
- **来源**：commit `10252bc0`（做成正式入口）、commit `6626d08d`（基准固定为不可变提交）、`engine/src/audit/macro-c.ts`、`engine/CHANGELOG.md` §0.2.0。

### R8-2 — Micro-A 做成正式入口（capability 3 of 5 · preview）

- **决策**：Micro-A 从 48 管线搬成 `audit --scale Micro-A` 正式入口（仓内生成器 `engine/test/contracts/48-micro-a-preview.mjs`）；做成正式入口的前提 = 用同一族基准做一次差分重校对（85-check E 组：引擎侧 cassette 回放和 48 生成器的 golden 在 fact_id 上逐值相等）。
- **输入规则**：只接受 GitHub 上托管的仓和 ref；本地路径和名册外的仓一律拒绝，返回明确错误码（`MICRO-A-INPUT` / `MICRO-A-SCOPE`，exit 2），不悄悄降级。
- **试点校对**：同主双仓 env-manager + jiahao 的 4 条已合并 PR 固定样本（release-please / 声明式 bot / human 三种形态）；按 PR 看，不拆成每个 commit 一条；数据面主路 = 托管平台接口中间层（GitHub REST＋凭据三级探测，没有认证时会明确降级）。
- **来源**：commits `29c31fba`（做成正式入口）、`2066d412`（预览状态翻转）、`engine/src/audit/micro-a.ts`、`engine/CHANGELOG.md` §0.2.0。

### R8-3 — Micro-B 文件卡（capability 4 of 5 · preview）

- **决策**：Micro-B 的预览形态 = 文件级审计卡（file-audit card，只读投影），不是用来下判定的：卡上写明 `advisory: true`，没有判定结果，也没有能被判定关直接读取的字段；只给建议的卡永远不进判定关。
- **试点与说明**：试点仓 = 同主双仓 jiahao + env-manager；同主偏差，以及这种只给建议、不进裁决的做法带来的结构性隔离，都必须在能力状态表和报告里写明。
- **入口**：`audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]`（用到时才补采，这是唯一的写入口，MCP 那边永远不写）；`audit --scale Micro-B` 没有实装，返回结构化的 `SCALE-NOT-IMPLEMENTED` 并 exit 2。卡的结构和约定（三层卡、miss 四类、文件改名记录接缝的合规约定）写在 `docs/adr/` 的现行架构决定里（索引见 [`docs/adr/README.md`](adr/README.md)），本段不抄一遍。
- **来源**：commits `652ebc9d`（文件卡投影）、`81a3ef87`（文件改名记录接起来＋预览状态翻转）、`engine/src/fact/file-card.ts`、`engine/src/audit/file-card.ts`、`engine/CHANGELOG.md` §0.2.0。

### R8-4 — 能力状态表（五档都计划做，每档自己从预览版走到正式版）

- **决策**：五档是完整计划，不是砍出来的第一版；先做哪档不等于什么时候发哪档，每档自己从预览版走到正式版。报告里的 `preview_disclosure` 和能力状态表说的是同一件事；能力状态表就是给人看发布进度的那张表。
- **状态快照（0.2.0 发布时）**：Macro-B = `capability 1 of 5 · preview`（象限部分：strategy active／behavior preview／structure preview／supply-chain queued）；Macro-C = 2 of 5 preview（要说明只校对了一个仓）；Micro-A = 3 of 5 preview；Micro-B = 4 of 5 preview（只给建议，不进裁决）；Macro-A = Not yet in preview（只是路线图里的说法，不是能用的承诺）。当前值以能力状态表为准，本段只记分层的决定。
- **命令面**：已上架 `--scale` = Macro-B / Macro-C / Micro-A；未实装层不假装（`SCALE-NOT-IMPLEMENTED` + exit 2）。Micro-B 走文件卡入口（R8-3），不是第四种 `--scale`。
- **层序**：扩面 → Macro-C → Micro-A → Micro-B → Macro-A 的 preview 推进顺序不变（承 R5 阶段 3 结构）。
- **来源**：`README.md` / `README.zh-CN.md` §Capability matrix、`engine/src/audit/audit.ts`（`AUDIT_SCALES_IMPLEMENTED`）、commits `2066d412` / `81a3ef87`、GLOSSARY（预览版 / 泛化闸）。

### R8-5 — 0.2.0 → 0.3.0 的支持面变化

- **决策**：产品版本升到 0.3.0（不是 0.2.1）——支持哪些版本是用户能看见的承诺，不能藏进补丁版本里（`docs/versioning.md` §1：minor = 契约变更；版本纪律也写在那里）。
- **Node 支持面**：下限从 ≥20 提到 ≥22.18（三条检查脚本直接 import `.ts`，需要类型剥离）；engine-ci 矩阵从 Node 20/22 改为 [22, 24]（三 OS 六条任务）；不保留 Node 20 的 SKIP 分支，也不宣称已经停止维护的版本（Node 20 于 2026-04-30 停止维护）。
- **同步面**：`engines.node`、CI 矩阵、版本号（package / manifest / 双 plugin.json / README 徽章）、README×2、engine/README、SKILL.md 的 Prerequisites 必须同源一致。落地票 = tracker #36（Node 面）＋ tracker #45（版本与文本）；本段只记决策，HEAD 上的版本号和 ≥22.18 已经同源一致。
- **来源**：父票 tracker #38（Node 支持面 / 版本 0.3.0）、`docs/versioning.md` §1。

### R8-6 — 预览说明的规则

- **决策**：预览标记本身就是决定，不是装饰。报告头和旁边的 JSON 文件里必须带上 `preview_disclosure` 的四个字段：`capability_label` / `calibration_scope` / `structural_limitations` / `not_in_preview`；报告头另外带 `stability: preview` + `capabilities: [...]`。这段说明和能力状态表说的是同一件事，不许两处各写一份（`docs/versioning.md` §2）。
- **三印记**：降级产出 `⚠ unverified`；还没接上证据的地方标「⚠ 数据未接」；合成的演示仓标 `synthetic`。三者不能互相冒充，也不能冒充真实审计。
- **还没上架的层**：对外分发的地方统一标 "Not yet in preview"；版本锁表里 `planned` 的行不能被读成已经接上。
- **来源**：`engine/src/report/generate.ts`（`PreviewDisclosure` / `stability` / `capabilities`）、`engine/src/audit/audit.ts`、README §Capability matrix + §Honesty notes、`docs/versioning.md` §2、GLOSSARY（预览版 / 演示用假仓）。

### R8 Coverage（核对）

| tracker #41 决策项 | 覆盖的 R8 Decision |
|---|---|
| Macro-C 做成正式入口 | R8-1 |
| Micro-A 做成正式入口 | R8-2 |
| Micro-B 文件卡 | R8-3 |
| 能力状态表 | R8-4 |
| 0.2.0 → 0.3.0 支持面变化 | R8-5 |
| 预览说明规则 | R8-6 |

- 核对：6/6 覆盖，无去向记录清单 = 空；来源指针见各 R8-n 的「来源」行。
- 边界：架构正文只在 `docs/adr/`，本段不复制；本段不加新的 D 编号或 ADR 编号；产品级决策不搬去 README、架构决定或归档。

---

## R9 — 报告溯源锚的取值规则（2026-10-28 治理轮补记，tracker #94 D6）

> 本段由治理轮的合并子票 tracker #100 补写，记录 R8 之后的产品决定；实现细节和实测细节都写在 `docs/adr/` 的现行架构决定里，索引见 [`docs/adr/README.md`](adr/README.md)，本段不抄一遍。
> 来源只写这几类：架构决定、工单（一律写 `tracker #N`，指 GitHub 上的现行工单）、commit、现行文件；本段不加新的 D 编号。
> 本段接在 R8 后面：R1–R8 的决定没动，这次只把说法改成人话。

### R9-1 — `prereg_commit` 只取可解析 commit，或带前缀的明确标记

- **决策**：报告里的 `gate_ref.prereg_commit` 只允许三种值：① 一枚能真正解析的 commit（4–40 位小写十六进制；下限取 4，因为 git 能吐出的最短缩写就是 4 位，`core.abbrev` 小于 4 会被 git 忽略；而且必须真能解析成这个仓里的一个 commit，长得像但指错对象不算）；② 以 `sentinel:` 开头的存档哨兵（一个占位值，它本来就不是 commit）；③ 以 `degraded:` 开头的明确降级（本该取到 commit，但取不到或取不准）。三种以外的值一律不行，生成回执时当场退回，不让读者去猜。这条规矩管的是用户能看到的报告：读者不翻源码，也能判断这个坐标是不是 commit、能不能回头查。
- **为什么要定这条规矩**：这个字段以前混着三种值——真 commit、仓里没有定义的存档字面量、以及浅克隆时悄悄取到的边界 commit。第三种最麻烦：它看起来就是一枚合法 commit，不报错，还会随克隆深度变化，同一个判据件在两种克隆方式下给出不同的锚和不同的回执摘要。「取对了没有」这件事，读者在报告里查不出来，只能靠发出方用值本身的样子来证明。
- **拿不到历史时，不许悄悄糊弄**：取不到判据件最后一次改动的 commit 时，不要返回边界 commit，而是写一个带名字的降级标记。现在的清单一共五枚：`resolvePreregCommit` 产出四枚——`degraded:shallow-clone`（确认是浅克隆）、`degraded:no-source-repo`（安装态插件没有源码仓根）、`degraded:depth-unknown`（判不出克隆深度）、`degraded:no-criteria-history`（这个仓里取不到判据件的 commit）——另外契约生成脚本 `51-macro-b-behavior.mjs` 真实运行时会产出 `degraded:unanchored-run`。这五枚就是本条登记的清单：以后新增一枚，必须先把名字写在这里——`85-check` A17 只看写法对不对，看不出名字在不在册，只有写在这里才和代码对得上。是不是浅克隆，用 `git rev-parse --is-shallow-repository` 判断；`--filter=` 这类只取部分历史的克隆不在上面这份清单里，现在不判成降级（仍可能交出边界 commit），要不要把判断范围扩大另定。「全量历史属受支持运行形态」这条裁定，以及三份 workflow 里 `fetch-depth: 0` 的现状，都写在 `docs/adr/` 的现行架构决定里（索引见 [`docs/adr/README.md`](adr/README.md)），本条不抄一遍。降级能被机器查出来，不许用 SKIP 混过去（承 tracker #35 的规矩：被跳过的检查组不能当作没发生）。
- **两种标记的写法不可能撞在一起**：标记前缀里带冒号，git 短 SHA 和全 SHA 的字符里都没有冒号。这两种标记只能由专门的生成函数产出，直接写死的字面量不再算合法锚。短 SHA 显示几位（在 7 和 8 之间跳）只关乎宽度，不关乎身份；沿用 tracker #84 的全值比较规则，本条不再重复。commit 这种值的宽度下限取 **4**，不取 7：git 自己能吐出的最短缩写就是 4 位（`core.abbrev` 小于 4 会被 git 自己忽略）。如果门槛设在 7，`core.abbrev=4` 的检出就会交出一个「写法合法、却被门槛判成说不清」的锚，报告在组装时抛错、存不下来——这是判定规则自己造成的可用性问题。反过来，给取值加 `--abbrev=7` 也不干：它会把本仓自然的 8 位缩写固定成 7 位，改动的正是 tracker #86 明确排除的宽度表示方式，还会让 `48-micro-a-golden-*` 十二件和生成器对不上。
- **这条规矩只管对外发出的内容，不改历史现场**：`38-*` 冻结件、`51-macro-b-*` 和 `23-first-report` 存档件里原来那种不带前缀的写法（连同各自已经算好的回执链）一个字节都不动——按 [`docs/authority.md`](authority.md) §3 的历史编号规则，按字节冻住的历史存档可以保留原样。对外发出的内容改成带标记的写法以后，存档里的那一枚仍按「历史编号」读。同一个名字两种写法并存，不算有两套现行说法：现行规则只有本条这一种，另一枚是已经声明为历史产物的出处坐标。
- **和 D-179① 的关系**：D-179①（历史编号，这里只作引用）定了一条「伴生确定性」：判据件跟着它最后一次改动的 commit 固定下来，取值就取这个 commit；这个含义在浅克隆下会悄悄失准，本条补的是**取不到真值时该写成什么样**，不改它的取值定义。
- **`degraded:` 不冒充 R8-6 的三印记**：`degraded:` 既不是「⚠ 数据未接」，也不是 `⚠ unverified`；它是锚这个坐标自己声明降级了，和 R8-6 的三印记并列，互不重叠。
- **来源**：`engine/src/report/generate.ts`（`classifyPreregAnchor`／`preregSentinel`／`preregDegraded`／`assertDiscriminablePreregAnchor`）、`engine/src/audit/micro-a.ts`（`resolvePreregCommit`）、`engine/src/audit/macro-c.ts`、`engine/src/demo/demo.ts`、`engine/test/micro-a.test.mjs` S 组（合成浅克隆仓的正负对照）、`engine/test/report-preview.test.mjs` P 组（实际生成时会拒收说不清的锚）、`engine/test/contracts/85-check.mjs` A17、`docs/adr/README.md`、tracker #86／#89／#94 D6／#100。

### R9 Coverage（核对）

| tracker #94 决策项 | 覆盖的 R9 Decision |
|---|---|
| D6 — tracker #86＋tracker #89 合并票：定下 prereg 锚怎么取值 | R9-1 |

- 核对：1/1 覆盖，无去向记录清单 = 空；来源看 R9-1 的「来源」行。
- 边界：实测记录和「全量历史属受支持运行形态」这条裁定都记在 `docs/adr/` 的现行架构决定里（索引见 [`docs/adr/README.md`](adr/README.md)）；各个对外发出点的静态检查在 `85-check` A17；本段不新增 ADR 编号、不加新的 D 编号、不动 `GLOSSARY.md`。

---

## R10 — 全仓大白话收尾（2026-11-11 grill 补记，tracker #200）

> 本段接在 R9 后面，只记这一轮新定的事。上一轮（tracker #148）的做法本轮沿用，本段不重抄。
> 来源只写这几类：工单（一律写 `tracker #N`）、commit、现行文件；本段不加新的 D 编号，也不新增 ADR 编号。

### R10-1 — 这轮清什么

- 上一轮（tracker #148）把门面、代码注释和现行决策文档过了一遍，但 `docs/spec.md` 的 R1–R7 还是当初 grill 的原样：英文小节名、`As a …, I want …, so that …` 句式，还有 Hub-of-Facts、verdict-gate、scale、persona 这些词。这轮把它改成大白话，这件事由 tracker #202 做。
- 同时复查其余文档、代码注释、测试标题和英文文书，把上一次没清干净的旧叫法清掉；这几块的活分在 tracker #203–#209。
- 只改说法，不改决定、判定条件、数字和结论。
- 来源：tracker #200（grill 定下的本轮范围）、tracker #148（上一轮做完的范围和遗留）。

### R10-2 — 术语以 GLOSSARY 为准

- 难懂的头词换成大白话，[`GLOSSARY.md`](../GLOSSARY.md) 已改，旧叫法全部进了每条下面的「不要用」列。改了哪几个词，到术语表里查，本段不抄一遍。
- 新加 3 条（原来表里没有）：暂挂两边、分析项组、接数据工单。术语表这轮只加不减，老的一条没删。
- 另有 3 个说法（审计窗、补采、换戳）不进术语表，也不当禁用词处理；这三个说法是本轮 grill 新记的，tracker #200 摘要里没写。
- 一个东西只留一个名字；容易混的才统一，普通描述句怎么顺口怎么说。
- 旧叫法不是一次清完的：被各张票自己钉住不动的地方照旧留着（`docs/authority.md` §2 表、`docs/spec.md` 的 R8/R9、`engine/*.yaml` 的注释、`33-gate-registry.json` 的键名和事件锚）。这几处先留着，等对应票来改；别拿术语表反过来说这些地方写错了。
- 碰到表里没有的新词：句子里能讲清就讲清；反复出现、又影响判对错的，才停下来问用户加词条。
- 来源：tracker #200（12 条改名和 3 条新增都是它定的）、[`GLOSSARY.md`](../GLOSSARY.md)。

### R10-3 — 旧决定号怎么放

- 正文讲白话；旧号退到每节末尾的「来源」行，想查再顺着号查。
- `docs/spec.md` 的覆盖表保留，它就是拿号对账用的。
- 机器读的名字一律不动：命令、参数、错误码、JSON 键、数据库列、环境变量、文件路径、`preview_disclosure` 这类字段。
- 来源：tracker #200、tracker #148（旧号退到来源行这套写法是上一轮定下的）。

### R10-4 — 英文文书

- 英文保持英文，用日常说法，不强行和中文头词一一对应。
- 机器名原样；指向 [`docs/authority.md`](authority.md) 的链接保留。
- 来源：tracker #200（定下这条规矩）、tracker #209（英文文书改造在那张票做）。

### R10-5 — 真会被读的登记表里的说明

- [`engine/test/fixtures/contracts/33-gate-registry.json`](../engine/test/fixtures/contracts/33-gate-registry.json) 的 title / reason / evidence 这些说明文字要改成人话，这件事由 tracker #210 做；本段只定规矩，本段自己不动那份文件。键名、id、status、事件锚、事件成员不动。
- 来源：tracker #200、tracker #210（这份文件的人话改造在那张票做）。

### R10-6 — 验收

- 人读为准，用三份真材料当尺子：[`README.zh-CN.md`](../README.zh-CN.md)、本文件的 R1–R7、[`docs/upstream-dimension-map.md`](upstream-dimension-map.md)。用户读完说「懂了」才算过。这三份里的旧叫法要等 tracker #203–#209 清完才换得到位，现在拿来看结构就行。
- 人审按 tracker #148 的办法：一次交一份文件，给绝对路径和「原文 → 改后」清单；超长文件按章节分两三次交。
- `check:docs` 和 `npm test` 在提交前各跑一遍，只当「别把链接、号、生成物弄坏」的保险；被脚本按字面钉住的字原样保留：`进入条件`、`永久排除`、`S5 ↔ S4`、`capability 1 of 5 · preview`、`capability 2 of 5 · preview`、`capability 3 of 5 · preview`、`capability 4 of 5 · preview`、`已接入（active`、`规划中（planned`、`GAP-078-01`、`解析失败` 等。
- 不加扫词脚本，这是 tracker #148 定下的，本轮照旧。
- 来源：tracker #200、tracker #148。

### R10-7 — 不在这轮里

- 报告正文里印出来的存量中文（「摄入」「披露块」等）另开一票，这票是 `tracker #211`；改了要重算 demo golden。
- 放宽机器名规矩另开一票，这票是 `tracker #212`。两张都还只是开着，没做完。
- 冻住的存档、生成物、机器名、键名不动；`examples/first-report` 四件报告一个字节不改。
- 来源：tracker #200（「不在这轮里」的清单由它列）、tracker #148（上一轮的同类边界）、tracker #211、tracker #212。

### R10 Coverage（核对）

| tracker #200 摘要上的事 | 覆盖的 R10 条 |
|---|---|
| 要解决什么／想做成什么样：把 R1–R7 和其余文档、注释、英文文书的旧叫法清掉 | R10-1 |
| 12 条改名加 3 条新增，术语表只加不减 | R10-2 |
| 正文里的旧决定号退到每节末尾的「来源」行；spec 的覆盖表保留 | R10-3 |
| 英文文书保持英文，用日常说法 | R10-4 |
| 真会被读的登记表只清 title / reason / evidence，键名不动 | R10-5 |
| 验收靠人读三份真材料 | R10-6 |
| 报告正文存量中文、放宽机器名规矩，各另开一票 | R10-7 |

- 核对：7/7 覆盖，无去向记录清单 = 空。
- 来源：tracker #200（本轮 spec 索引）、tracker #148（上一轮 spec）、[`GLOSSARY.md`](../GLOSSARY.md)、[`docs/authority.md`](authority.md)。
- 边界：本轮不改产品承诺；本段不新增 ADR 编号、不加新的 D 编号。
