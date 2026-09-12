我先建立任务清单，然后并行读取本仓决策文件与检索知识库。

决策账本已读（D-001~D-013 全部 current）。继续并行读取 9 份 ADR 与 CONTEXT.md。

9 份 ADR 已读。继续读 CONTEXT.md 术语表，完成本地文档回顾。

知识库为空已证伪完成（ctx_search 返回空）。进入三引擎广泛搜索阶段。

继续三引擎搜索：IETF/Google Design Doc 流程、MCP/Agent Plugins 生态、monorepo/polyrepo 先例。

继续三引擎搜索：monorepo/polyrepo 拆分、CI matrix、DuckDB 嵌入、Sigstore/SLSA、stage-gate。

搜索阶段已覆盖 8 个查询、五类角度均有触及。补齐 stage-gate 与 smoke test 两个角度，并同步开始定点深挖第一批原文。

搜索阶段已充分（10+ 查询，Official/Comparative/Criticism/Currency/Community 五类角度均覆盖）。进入定点深挖，批量抓取第一批原文。

深挖第一批完成（6 次 fetch、6 独立域名）。补齐 thenewstack 正文（批评角度）、MCP 官方传输页、Claude Code 插件参考、Sigstore 官方，并补两轮搜索（校验器/打包轮子）。

深挖已达 8 次 fetch、8 独立域名。再补 IETF RFC 原文与 Sigstore 官方两处关键一手源，并将高价值页面索引进知识库供后续会话复用。

深挖达成：11 次原文读取、10+ 独立域名、三引擎交叉验证完成。进入综合输出。

所有调研动作已完成（本地文档通读 + 知识库证伪 + 三引擎 13+ 查询 + 11 次原文读取，覆盖 10+ 独立域名）。以下为最终调研报告。

---

# R2-Q7 调研报告：spec 与工程实现边界 / A+B 组合落地

> 检索标签：`R2-Q7-engineering-boundary`（本报告已随 ctx_fetch_and_index 落库，源标签 `R2-Q7-engineering-boundary-*`）

## 0. 执行摘要（Tl;dr）

**A+B 组合在工业界有充分先例支持，但「先修边界再进实现」是本仓唯一合规路径**：IETF RFC / Amazon PR-FAQ / Google Design Doc / GitHub Spec Kit 四个心智模型一致表明「spec 完成 → 工程实现」是一个显式的、有 gate 的迁移，不是无痕延续；ADR 的工业标准处置是 **supersede 链**（Fowler 与 AWS 双源确认「accepted 后不可修改，修订 = 新 ADR supersede 旧 ADR」），因此 **修订 ADR-0002 与另起工程仓不互斥——推荐「supersede ADR-0002 确立 spec 仓角色 + 另起工程仓承接实现」**，这与 D-008 预告的 B4.1 岔口完全吻合，是激活而非违反 D-008。工程轮子方面：MCP 官方 SDK、Agent Plugins 官方 JSON Schema、DuckDB 官方 Node.js/Python 绑定、GitHub Actions matrix、Sigstore/cosign 均为**直接先例**可直接采用；「双 manifest 单一元数据源生成」无直接先例（生态太新），但 Spec Kit #1743 的分仓契约生成模式与 Codex 第三方构建脚本是**半先例**。验收标准「编译→打包→启动并测活→每平台 test 闭环」= 工业界的 **walking skeleton + smoke/sanity/regression 分层 + CI matrix + liveness probe** 的标准等价物，有成熟 CI 骨架可循。

**Confidence: 中高**。边界心智模型与 ADR 处置为高置信（多源一致、一手文档）；Agent Plugin 生态轮子为中置信（规范 2026-08 才发布 1.0.0，生态极新，无大规模生产验证；本报告对 Agent Plugins 规范全文仅读了 38KB 中的 8KB，全文待 spec 阶段通读）；双 manifest 生成为低置信（无直接先例，需自研，已显式标注）。

---

## 1. 背景回顾（本仓现状与本问题的关系）

本仓 D:/Aworker/6F 是 spec-level 规划仓，与本问题直接相关的封口决策：

| 决策 | 内容 | 与本问题的关系 |
|---|---|---|
| **D-002 / ADR-0002** | 本仓产出 = spec-level 完整规划；「执行阶段的实现优先级排序属于本仓库外的工作」 | **A+B 组合的直接障碍**：在本仓启动工程实现需要显式处置本条 |
| **D-008** | 本仓继续扮演 spec 规划仓，**不修订 ADR-0002**；「B 方向若日后启动，须显式修订 ADR-0002 或另起工程仓」（BACKLOG B4.1 预告） | **A+B 组合的授权闸门**：激活 B4.1 岔口正是 D-008 预留给「日后」的路径 |
| D-003 / ADR-0003 | 规划边界 = 产品本体 + 使用方法；商业层排除 | 工程实现属产品本体，不越界；但上架 marketplace 属商业层，不在本期 |
| D-012 / ADR-0008 | 分发形态 = Agent Plugin 五层盒子（plugin.json + skills/ + mcp.json + 扩展目录 + 内核 CLI 四外壳，双 manifest） | 工程实现的**落地对象** |
| D-013 / ADR-0009 | 输入面 = 本地路径默认 + 远程 URL 配置可达 | 工程实现的输入契约 |
| R2-01~05（未完成） | persona / 场景并集+mode / 默认模式契约 / Agent Plugin 契约群 / 输入面契约 | A+B 组合中「spec 契约」的未完成部分，时序上须先于或并行于工程实现 |

**核心张力**：验收标准「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环」预设了一个**可构建、可启动的软件交付物**——这是 walking skeleton 的语言，不是 spec 的语言。本仓当前无产品源码、无构建清单，且 D-002/D-008 明确「R2 全部完成前不启动工程实现」。A+B 组合因此必然要求：① 修订 ADR-0002（或另起工程仓）；② 在工程侧建立 walking skeleton 级的验收闭环。

---

## 2. 对标表（工业成熟心智模型，对象 / 固定什么 / 自由什么 / 印证 / 先例性质）

| 心智模型 | 固定什么 | 自由什么 | 对本问题的印证 | 先例性质 |
|---|---|---|---|---|
| **IETF RFC 标准流程**（RFC 2026/BCP 9） | spec 文本（RFC 为唯一权威）；成熟度门槛 = **至少 2 个独立可互操作实现**（Draft Standard 4.1.2 节）；RFC 7942 Implementation Status 段 | 实现语言/厂商/实现方式 | spec 与实现**分离但以实现证伪 spec**：标准升级靠「多实现 + 互操作测试」——正是「spec 完成 ≠ 工程完成，验收须落到独立实现」的源头 | **直接先例**（最古老的 spec↔实现分离机制，1996 年至今） |
| **Amazon PR/FAQ + Working Backwards**（Bryar & Carr） | PR/FAQ 文档 = go/no-go 前置 gate；客户视角叙事；FAQ 反推能力清单 | PR/FAQ 批准后的实现方法（Amazon 明确「批准后接 Agile」） | 「先写文档、批准后才组队开工」= A+B 的工业原型；文档是 gate 而非产出物 | **直接先例**（文档先行 gate） |
| **Google Design Doc**（eng-practices / V8 评审指南） | 设计文档结构（背景/概述/详细设计/备选方案/测试部署监控/文档历史）；LGTM 评审流程；done criteria 显式写入 | 实现细节与选型 | 工程实现前必须有「批准的设计」；done criteria 相当于把验收标准前置写进文档 | **直接先例** |
| **GitHub Spec Kit / spec-driven development** | spec 为 executable artifact（living source of truth）；specify→plan→tasks→implement 四阶段、逐阶段验证后才推进 | 栈、实现细节、spec 演进内容 | 与 A+B 最同构：spec 驱动实现；**讨论 #1743 正是「specs 独立仓 + FE/BE 分仓」的真实需求**，官方建议「top-level 使用」，分仓靠发布版本化契约产物 | **直接先例**（现代 AI 工程语境） |
| **Walking Skeleton / Tracer Bullets**（Cockburn / GOOS / Pragmatic Programmer） | 第一里程碑 = 最小端到端系统，**自动构建、部署、端到端测试全部就位**；skeleton 是生产代码非原型 | skeleton 之后的功能生长顺序 | 「编译→打包→启动并测活→test 闭环」= walking skeleton 定义逐字对应（"automatically build, deploy, and test end-to-end"）；"It's not a prototype — it's production code, so write tests" | **直接先例**（验收标准的源头） |
| **Stage-Gate®**（Cooper） | 阶段 + Gate（Go/Kill/Recycle）；Gate 三要素 = readiness check + must-meet（knockout）+ should-meet 计分 | 各阶段内活动 | 「规划完成」显式化为一个 gate 的 must-meet 判据；kill 决策制度化 | **类比**（产品创新流程，软件工程适用需裁剪；无直接软件先例） |
| **Monorepo vs Polyrepo**（nx.dev） | 判据固定：共享代码量、原子变更频率、团队规模、CI 成本、访问控制 | 组织选择 | spec 仓与实现仓同仓/分仓 = 该判据的子问题；判据可直接套用 | **直接先例**（同仓/分仓判据） |
| **ADR immutability + supersede 链**（Fowler / AWS） | accepted 后**不可修改**；修订 = 新 ADR supersede 旧 ADR（含链接），旧 ADR 保留 | 新 ADR 内容 | ADR-0002 处置的唯一工业标准路径：不可 in-place 改，只能 supersede | **直接先例**（双源：Fowler 2026-03-24 + AWS Prescriptive Guidance） |

**关键判断**：8 个心智模型中 7 个是**直接先例**（仅 Stage-Gate 为类比）。工业界对「spec 完成 → 工程实现」的处理高度收敛：**文档是 gate，实现是证伪**——没有「spec 仓内直接长代码」的先例，也没有「只 spec 不实现」的长期先例（IETF 标准升级强制多实现）。这印证了 A+B 组合的合理性，同时要求边界迁移必须**显式化**。

---

## 3. 四条问题的推荐方案

### Q1：spec 与工程实现边界的工业成熟心智模型

**推荐：采用「四门闸模型」作为本仓边界心智**——整合四个有直接先例的模型：

1. **Spec Gate（PR/FAQ + Design Doc 混合）**：R2 spec 契约（R2-01~05）完成 = 进入实现的 gate 通过条件，spec 是 living artifact（Spec Kit 语义）而非一次性文档；
2. **Implement Skeleton（walking skeleton）**：工程第一里程碑 = 最小端到端可构建/可打包/可测活系统 + 全部 CI 自动化，不按功能切片（与 D-002 反 MVP 精神同构——不做 feature MVP，做**架构 skeleton**，两者不冲突）；
3. **Prove via Implementation（IETF 语义）**：spec 的验收证据 = 独立实现 + 互操作/端到端测试闭环，而非文档自证；
4. **Boundary Migration（ADR supersede + polyrepo 判据）**：spec 仓与实现仓的边界随阶段显式迁移（见 Q2）。

**取舍**：若只取 PR/FAQ（文档 gate 最轻）则缺少「实现证伪 spec」环节，spec 与实现脱节；若只取 IETF（证伪最严格）则 gate 过重，单仓产品不适用（IETF 的多独立实现门槛对内部产品过重——标注为**类比裁剪**）。四门闸是各模型取其适配本仓的切片。

### Q2：ADR-0002 的处置

**推荐：supersede ADR-0002（写 ADR-0010）确立「spec 仓角色正式化 + 工程实现另起工程仓」，双轨并行。** 理由与判据：

1. **ADR 工业标准处置 = supersede，不是 in-place 修订**。Fowler（2026-03-24）：「Once an ADR is accepted, it should never be reopened or changed - instead it should be superseded」；AWS：「When the team accepts an ADR, it becomes immutable. If new insights require a different decision, the team proposes a new ADR... supersedes the previous ADR」。ADR-0002 的修订**只有一条合规路径**：新 ADR 声明 supersede，旧 ADR 保留（本仓 S2 ADR 质量判据本身就检查 supersede 链——不按此处置会自打脸）；
2. **分仓优于同仓，判据来自 nx.dev + Spec Kit #1743 实证**：
   - 共享代码量：spec 仓与实现仓**几乎不共享代码**（spec 是 markdown/契约，实现是源码）→ polyrepo 判据成立；
   - 原子变更频率：spec 修订与实现演进**节奏不同**（spec 低频稳定、实现高频迭代）→ 同仓原子变更收益低；
   - 访问控制/CI：实现仓需要独立 CI matrix（Windows/macOS/Linux），spec 仓不需要 → 分仓隔离 CI 成本；
   - Spec Kit #1743 实证：用户问「specs 独立仓 + FE/BE 分仓」，官方答「top-level 使用 Spec Kit」+ 分仓靠**发布版本化契约产物**（OpenAPI/TS types/Pydantic models）——这正是分仓的成熟做法，与本仓 D-012 双 manifest「单一元数据源生成防漂移」、D-013 契约化输入面**同构**；
3. **与 D-008 的关系**：D-008 原文「B 方向若日后启动，须显式修订 ADR-0002 或另起工程仓」——本推荐**两个条件都满足**（supersede ADR-0002 + 另起工程仓），是**激活 D-008 预告的 B4.1 岔口**，不是违反 D-008。但「不修订 ADR-0002」的字面约束与「supersede」存在表面冲突，须人工裁定（见 §5 冲突清单）。

**取舍**：同仓方案（修订 ADR-0002 后本仓直接长代码）更省事，但违反 D-002 的「实现优先级排序属仓外」语义、污染 spec 仓纯净性、且 Spec Kit 先例明确分仓需契约产物机制（本仓已有此机制的设计）；分仓方案多一个仓的维护成本与 spec drift 风险（Spec Kit #1743 与 deployhq 均指出 multi-repo 是 spec-kit 的已知弱点），但角色清晰、与既有决策体系兼容。**判据结论：分仓。**

### Q3：Agent Plugin 产品工程实现的成熟轮子

| 轮子 | 工业成熟度 | 推荐 | 依据 |
|---|---|---|---|
| plugin.json / mcp.json schema 与校验 | ✅ **官方 JSON Schema 直接采用** | 用 `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` + `mcp.schema.json`（closed schema，$schema 常量 URI，客户端**不得运行时拉取 schema**——规范 §5.2 明示） | agent-plugins.org/specification 一手规范 |
| 校验工具 | ✅ 半先例 | 官方无 CLI；社区 `claude-code-marketplace-validator`（E001-E012 规则、`--format json` 供 CI、`--strict`）可参考模式；Codex 侧第三方构建脚本展示了「单一元数据源生成多 manifest + 自校验」的可行实现 | GitHub 实测 |
| **双 manifest 单一元数据源生成** | ⚠️ **无直接先例**（生态 2026-08 才发布 1.0.0） | 需自研构建脚本；**类比参照** = Spec Kit #1743 分仓契约生成（OpenAPI→多语言产物）+ Codex build-codex-plugin.mjs 模式；自研范围与 D-012「防漂移」约束一致 | 显式标注无直接先例 |
| MCP server 脚手架 | ✅ **官方 SDK 直接采用** | TS `@modelcontextprotocol/sdk`（StdioServerTransport + StreamableHTTPServerTransport）；Python `mcp` SDK v2（支持 2026-07-28 规范，stdio/Streamable HTTP/SSE 全传输） | modelcontextprotocol.io 官方规范 + python-sdk 一手 |
| 内核 CLI 四外壳打包 | ✅ 直接先例 | npm bin（标准 npm CLI）+ GitHub Action（composite action 惯例）+ 独立二进制（**Bun `build --compile` 支持跨平台交叉编译**：linux/darwin/windows × x64/arm64 目标表，或 Node SEA——Bun 启动快体积 60MB、Node SEA 体积 114MB+，见 yyx990803 基准）；四外壳 = 同一二进制多入口，monorepo 多入口打包常规操作 | Bun 官方文档 + 社区基准 |
| 跨平台 test 闭环（CI matrix） | ✅ **直接先例** | GitHub Actions `matrix`（os: [ubuntu, windows, macos] × node 版本，`fail-fast: false`），多平台构建→上传 artifact→release job；macOS 构建必须在 macOS runner 上（Electric UI 实证） | GitHub Actions 官方 + 多篇实践 |
| DuckDB 绑定与嵌入 | ✅ 官方绑定直接采用 | 官方 `duckdb` npm 包（Node.js API，SQLite 风格）+ Python 绑定（pandas 集成成熟）；**注意**：Node.js API 文档标注 Deprecated 与 Neo 双线，需在 spec 阶段选型（信息缺口） | duckdb.org 官方文档 |
| receipt/签名/provenance | ✅ **直接先例** | **Sigstore/cosign**：keyless signing（Fulcio CA + Rekor 透明日志）、支持 GitHub Actions OIDC ambient 凭据（`--oidc-provider github-actions`）、可签 OCI artifacts/二进制；GoReleaser 集成 bundle；SLSA 为框架参照 | sigstore/cosign GitHub 一手 |
| 五层盒子组装（plugin.json + skills/ + mcp.json + 扩展目录） | ✅ 规范即标准 | 直接按 Agent Plugins 1.0.0 规范布局（§4.2 standard layout）；**路径包含规则**（`./` 前缀、禁止 `../` 逃逸 plugin root）规范已强制，需在实现中落地为校验 | agent-plugins.org 一手 |

**关键提示（Criticism 角度）**：thenewstack 实证 Agent Plugins 1.0.0 是「small interoperability floor」——六家公司只统一了组件**位置**（plugin.json/skills/mcp.json 放哪），**未统一组件行为**（skill 格式委托 Agent Skills spec、wire 行为委托 MCP spec），且 Anthropic 不在 TSC。含义：① 双 manifest（标准 + Claude Code 原生）的必要性被第三方佐证（D-012 已封口，无需修订）；② 工程实现时不要假设「符合 Agent Plugins = 全客户端可用」，客户端兼容矩阵（D-011 风险登记）是真实风险。

### Q4：验收标准的工业等价实践与 CI 骨架

用户验收标准「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到」的工业等价物，**逐项对应**：

| 验收要求 | 工业等价实践 | 依据 |
|---|---|---|
| 编译通过 | build job（各平台各运行时版本） | CI matrix 标准 |
| 打包通过 | package job：产物打包（npm pack / binary / action bundle）+ artifact 上传 | Electric UI / OneUptime 实证 |
| 启动并测活 | **liveness probe / e2e 健康检查**：启动进程 → 进程存活断言 + 最小端到端功能断言（MCP stdio initialize 握手 + DuckDB 查询面 + CLI --version） | walking skeleton「deployed, automated end-to-end test」+ K8s liveness 语义 |
| 每平台 test 闭环 | **smoke → sanity → regression 分层**：smoke 是 build 后第一道 gate，**smoke 失败则后续全部不跑**（"If smoke fails, you don't run sanity"）；每平台至少跑 smoke 层 | drizz / Harness / CloudBees / QA Wolf 多源一致 |
| 避免「只引入却没做到」 | **每平台必须有「启动并测活」的最小断言**，而非只编译——这正是「只引入」的反面：编译通过 ≠ 进程能起 | walking skeleton + smoke gate 语义 |

**可落地 CI 骨架建议**（不写代码，只给阶段结构）：

1. **test job**：`matrix`（os × node 版本，fail-fast: false）→ 单元/契约测试；
2. **build/package job**：各平台构建（Bun --compile --target 或 Node SEA）→ 上传 artifact；
3. **smoke job**：启动进程 → 测活（存活 + 最小端到端断言：MCP initialize 握手、DuckDB 查询、CLI 四外壳各出一次）→ 失败即阻断 release；
4. **release gate**：签名（cosign keyless + GitHub Actions OIDC）+ provenance 生成 + GitHub Release 发布；
5. **spec 校验 gate**（本仓特有）：plugin.json/mcp.json 过官方 schema 校验 + 双 manifest 一致性校验（单一元数据源生成后 diff 比对）——这是「每个平台 test 闭环」之外的**分发契约闭环**，对应 D-012 防漂移约束。

---

## 4. 与本仓 current 决策的冲突清单（须人工裁定）

> 纪律要求：以下冲突**全部显式列出**，本报告不做静默改向。任何 A+B 启动都须用户/决策层对下列各项裁定。

| # | 冲突项 | 冲突点 | 建议裁定方向 |
|---|---|---|---|
| C1 | **D-002 / ADR-0002**（本仓产出 = spec 规划，实现优先级排序属仓外） | A+B 要求在本仓语境启动工程实现，ADR-0002 原文禁止 | **supersede ADR-0002**（写 ADR-0010 声明「spec 仓角色正式化 + 工程实现迁移至工程仓」）；或裁定同仓实现（本报告不推荐，见 Q2） |
| C2 | **D-008**（本仓不修订 ADR-0002；B 方向启动须显式修订或另起工程仓） | D-008 字面「不修订 ADR-0002」vs A+B 要求修订；但 D-008 原文同时预告「若日后启动须显式修订或另起工程仓」 | 裁定：本次是否视为「激活 B4.1 岔口」。若激活，C2 即消解（D-008 自含授权）；若不激活，A+B 整体不成立 |
| C3 | **R2-01~05 未完成** vs 验收标准要求「编译/打包/测活」 | 时序问题：spec 契约未封口即进工程实现，违反「R2 全部完成前不启动工程实现」的 D-002 后续跟踪语义 | 推荐裁定：**R2-01~05 先封口（尤其 R2-04 Agent Plugin 契约群，它直接定义工程实现的对象），随后启动工程 walking skeleton**；或裁定并行（spec 与 skeleton 同步推进），但需显式接受「spec 未封口即实现」的风险 |
| C4 | **D-003 / ADR-0003**（商业层排除） | 验收标准若延伸至「上架 marketplace / 分发」，触碰商业层 | 推荐裁定：本期验收止于「可构建、可打包、可测活、可签名」；上架/分发决策仍归仓外（D-003 不变） |
| C5 | **D-012 / ADR-0008**（五层盒子） | 无实质冲突——工程实现正是落地五层盒子；仅提示：Agent Plugins 1.0.0 的「小互操作地板」（thenewstack 实证）意味着工程实现**不得假设**全客户端兼容，D-011 风险登记需在工程仓兑现为兼容矩阵测试 | 无需修订，需在工程仓立项时兑现 |

**不冲突但需注意**：D-005（DuckDB fact table）——Node.js DuckDB API 有 Deprecated/Neo 双线，spec 阶段需选定绑定线（信息缺口）；D-009 四类用户全集——验收的「每平台」指 OS 矩阵，不是用户矩阵，两者无冲突。

---

## 5. 一手来源清单

（全部为本轮真实打开过的 URL；搜索摘要不算已读，未读的已标注）

| # | 来源 | 类型/日期 | 贡献 |
|---|---|---|---|
| 1 | [Martin Fowler — Architecture Decision Record](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) | Official / 2026-03-24 | ADR 生命周期：accepted 后不可改，修订必须 supersede 链（Q1/Q2 核心依据） |
| 2 | [AWS Prescriptive Guidance — ADR process](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html) | Official | ADR immutable + Proposed/Accepted/Superseded 状态机，10-15 分钟评审法（Q2 第二信源） |
| 3 | [IETF RFC 2026 — Internet Standards Process (BCP 9)](https://datatracker.ietf.org/doc/rfc2026/) | Official / 1996-10 | Draft Standard 门槛 = 至少 2 个独立可互操作实现；RFC 7942 Implementation Status 段（Q1 spec↔实现分离源头） |
| 4 | [Agent Plugins Specification 1.0.0](https://agent-plugins.org/specification) | Official / 2026-08 | 规范正文：closed schema、$schema 常量、路径包含规则（`./` 禁止 `../`）、standard layout（Q3 核心；全文 38KB 仅读 8KB，待 spec 阶段通读） |
| 5 | [Agent Plugins — JSON Schemas](https://agent-plugins.org/schemas) | Official | plugin.schema.json / mcp.schema.json 官方发布（Q3 校验器依据） |
| 6 | [GitHub Spec Kit — discussion #1743（specs 独立仓 + FE/BE 分仓）](https://github.com/github/spec-kit/discussions/1743) | Community / 2026-03 | **spec 仓 vs 实现仓分仓的直接先例**：官方答「top-level 使用 Spec Kit」，分仓靠版本化契约产物（Q2 核心实证） |
| 7 | [GitHub Blog — Spec-driven development with Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit) | Official / 2025-09-02 | spec 为 living executable artifact；specify→plan→tasks→implement 四阶段（Q1 现代语境模型） |
| 8 | [The New Stack — Agent Plugins portability gaps](https://thenewstack.io/agent-plugins-portability-gaps/) | Criticism / 2026-08-17 | **批评角度**：1.0.0 是「small interoperability floor」，统一位置未统一行为；Anthropic 不在 TSC；MAINTAINERS 未含 Google（Q3 风险与双 manifest 佐证） |
| 9 | [MCP Specification 2025-03-26 — Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) | Official | stdio（客户端启动子进程，stdin/stdout JSON-RPC）+ Streamable HTTP（单端点 POST/GET，SSE 可选）；DNS rebinding 安全警告（Q3 MCP 脚手架依据） |
| 10 | [MCP Python SDK v2](https://github.com/modelcontextprotocol/python-sdk) | Official / 2026-07-28 规范 | v2 支持全传输（stdio/Streamable HTTP/SSE）；Python 3.10+（Q3 SDK 选型第二信源） |
| 11 | [DuckDB — Node.js API 文档](https://duckdb.org/docs/lts/clients/nodejs/overview.html) | Official | 官方 Node.js 绑定（SQLite 风格 API）；**注意 Deprecated 与 Neo 双线**（Q3 绑定依据 + 信息缺口） |
| 12 | [sigstore/cosign (GitHub)](https://github.com/sigstore/cosign) | Official | keyless signing（Fulcio + Rekor）、GitHub Actions OIDC ambient 凭据、OCI artifacts/二进制签名、GoReleaser bundle（Q3 receipt/签名依据） |
| 13 | [Working Backwards — PR/FAQ 官方说明](https://workingbackwards.com/resources/working-backwards-pr-faq) | Official（Bryar & Carr） | PR/FAQ 是 go/no-go 前置；批准后才组队开工；后续接 Agile（Q1 文档 gate 模型） |
| 14 | [Bun Docs — Single-file executable](https://bun.com/docs/bundler/executables) | Official | `bun build --compile --target` 跨平台交叉编译（linux/darwin/windows × x64/arm64 目标表）（Q3 CLI 打包依据） |
| 15 | [yyx990803 — bun vs node SEA 基准](https://github.com/yyx990803/bun-vs-node-sea-startup) | Community | Bun compile（60MB，启动快）vs Node SEA（114MB+）实测对比（Q3 二进制选型依据） |
| 16 | [Stage-Gate（Cooper 最新版）](http://www.bobcooper.ca/images/files/articles/2/2-2-The-Latest-View-on-Stage-Gate.pdf) | Official（学术） | 阶段 + Gate（Go/Kill/Recycle）；readiness/must-meet/should-meet（Q1 类比模型） |
| 17 | [drizz.dev — Smoke Testing in CI/CD](https://www.drizz.dev/post/smoke-testing-in-ci-cd-pipelines-what-actually-matters) | Community | smoke→sanity→regression 分层；smoke 失败则后续不跑（Q4 验收依据） |
| 18 | [Harness — Smoke vs Sanity Testing](https://www.harness.io/blog/differences-between-smoke-testing-and-sanity-testing) | Community | smoke 是 build 后 fast gate，sanity 聚焦变更（Q4 第二信源） |
| 19 | [Electric UI — Cross-platform release builds with GitHub Actions](https://electricui.com/blog/github-actions) | Community | macOS 构建必须在 macOS runner；build→release 双 job（Q3/Q4 CI matrix 实证） |
| 20 | [OneUptime — Multi-Platform Builds](https://oneuptime.com/blog/post/2026-02-02-github-actions-multi-platform-builds/view) | Community / 2026-02 | matrix（os × target）含 darwin-arm64；fail-fast: false；artifact 上传模式（Q4 CI 骨架第二信源） |
| 21 | [nx.dev — Monorepo vs Polyrepo](https://nx.dev/docs/kb/monorepo-vs-polyrepo) | Official（工具商） | 同仓/分仓判据维度表（Q2 判据框架） |
| 22 | [KeisukeYamashita — claude-code-marketplace-validator](https://github.com/KeisukeYamashita/claude-code-marketplace-validator) | Community | 社区校验器先例：E001-E012 规则、CI JSON 输出、strict 模式（Q3 校验工具半先例） |

**未读/抓取失败（诚实标注）**：sigstore.dev 首页（JS 渲染返回 "Loading..."，改用 cosign GitHub 一手覆盖）；Agent Plugins 规范正文仅读前 8KB/38KB；thenewstack 正文被订阅墙部分截断（已用 AnySearch extract 获取主体）。

---

## 6. 信息缺口（仍不知道 / 开放问题）

1. **Agent Plugins 1.0.0 规范全文未通读**（仅 8KB/38KB）——发布前必须读完全文，特别是 §6 component discovery、§7.1 skill 格式委托、§8 client extensions、Appendix A conformance checklist（承继 D-012 信息缺口 3 同类问题）；
2. **Agent Plugins 1.1.0 working draft 未细读**——若 hooks/扩展目录标准化，D-012 扩展目录策略需复评（承继 D-012 信息缺口 1）；
3. **Node.js DuckDB API Deprecated/Neo 双线选型未定**——事实表绑定的 spec 前置决策；
4. **Node SEA / Bun 打包含原生模块（DuckDB）的组合未见成熟先例文档**——若四外壳二进制内嵌 DuckDB，需工程仓 spike 验证（显式标注为无先例项）；
5. **双 manifest 单一元数据源生成无直接先例**——自研范围与格式需 spec 阶段敲定（Q3 已标注）；
6. **spec 仓 → 工程仓的契约衔接机制**（版本化契约产物 vs 子模块 vs 生成发布）需按 Spec Kit #1743 讨论结论定案——这是分仓方案成败关键；
7. **MCP 2026-07-28 大修订细节**（stateless remote transport / Sampling deprecation）仅 python-sdk 单源——kernel MCP 若走 streamable-http 需读规范正文（承继 D-012 信息缺口 3）；
8. 国内 agent 生态（Qwen/Kimi）对 Agent Plugins 支持度未知（承继 D-012 信息缺口 2，与 C 类用户边界相关）。

---

**Sufficiency Gate 自查**：searches: 13+（web_search 8 + tavily 4 + anysearch 3）| angles: Official / Comparative / Criticism / Currency / Community 五类全覆盖 | full reads: 11 次原文（web_fetch 9 + AnySearch extract 2，另有 sigstore.dev 1 次失败换源成功）| 独立域名: 10+（martinfowler.com / aws.amazon.com / datatracker.ietf.org / agent-plugins.org / github.com / github.blog / thenewstack.io / modelcontextprotocol.io / duckdb.org / workingbackwards.com / bun.com 等）| 三引擎交叉验证: 关键结论（ADR supersede、Agent Plugins 规范、MCP 传输、CI matrix、smoke 分层）均 ≥2 独立信源 | gaps: Agent Plugins 规范全文、DuckDB Node 双线选型、双 manifest 生成先例、SEA+原生模块组合——已在 §6 显式列出，未硬凑。

---

**结论一句话**：A+B 组合成立且工业先例充分，但执行路径只有一条合规的——**supersede ADR-0002 + 另起工程仓（激活 D-008 预告的 B4.1 岔口）+ R2-01~05 先封口 + 工程仓以 walking skeleton 起步兑现「编译/打包/测活/每平台 test 闭环」验收**；其中「supersede ADR-0002」与 D-008 字面约束的冲突（C2）须人工裁定。

调研任务已全部完成（5/5）。报告全文见上，核心结论浓缩如下：

**交付物**：R2-Q7 中文调研报告已输出（检索标签 `R2-Q7-engineering-boundary`，高价值页面已尝试落库，但 ctx_fetch_and_index 因本机 bun 缺失报 ENOENT，索引失败——不影响报告，来源清单均为真实抓取）。

**三个一句话结论**：

1. **边界心智**：工业界（IETF RFC / Amazon PR-FAQ / Google Design Doc / GitHub Spec Kit）对「spec 完成 → 工程实现」的处理收敛为「**文档是 gate、实现是证伪**」——7/8 个对标模型为直接先例，唯一类比项（Stage-Gate）已标注。

2. **ADR-0002 处置**：推荐 **supersede ADR-0002（新 ADR）+ 另起工程仓**——Fowler 与 AWS 双源确认「accepted 后不可 in-place 改」；Spec Kit #1743 实证分仓成熟做法 = 发布版本化契约产物，与本仓双 manifest 防漂移设计同构。此路径同时满足 D-008 预告的 B4.1 岔口两个条件。

3. **验收标准**：用户验收 = walking skeleton + smoke→sanity→regression 分层 + CI matrix + liveness probe 的标准等价物；工程轮子中 MCP 官方 SDK、Agent Plugins 官方 JSON Schema、DuckDB 官方绑定、cosign 均为直接先例，**双 manifest 单一元数据源生成无直接先例（需自研）**，已在报告中显式标注。

**唯一需要您人工裁定的冲突**（报告 §4 共列 5 项）：

- **C2（最关键）**：supersede ADR-0002 与 D-008「不修订 ADR-0002」字面冲突——需裁定「本次是否视为激活 B4.1 岔口」；若激活，C2 消解，A+B 组合整体成立；
- **C3 时序**：R2-01~05 先封口再启动工程 skeleton，还是并行——推荐前者；
- **C1/C4/C5**：无实质阻塞，仅需确认边界（验收止于「可构建/可打包/可测活/可签名」，上架分发仍归仓外）。

如需，我可以基于报告直接起草 ADR-0010（supersede ADR-0002 的草案文本）供决策层审阅。
