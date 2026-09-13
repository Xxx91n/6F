# R4-Q1 atomcode 深调研 —— 上游组合件策略（2026-09-13）

> 出处：grill 轮 4 Q1 经用户指示提交 atomcode 深调研；本文件由 ctx 知识库索引召回重组。
> 调研参数：模式 default（完整配额）；searches 16（Exa 6 + Tavily 2 + AnySearch 8）；angles 5/5（Official/Comparative/Criticism/Currency/Community）；full reads 10 篇原文。
> 续问锚点：atomcode -p "…" --resume 88169c0d-64ef-4e42-a157-2b7761206e52
> 纪律：本仓唯一数据源 = .scratch/macro-audit/decision-ledger.md；调研结论与 current 决策冲突禁止静默改向（D-019 协议）。

## 0) 原始问题（verbatim）

macro-audit（面向 git 记录健全仓库的宏观+微观工程内容审计产品）已封口决策集：5 档审计粒度共享同一证据层与裁决层、Hub-of-Facts 架构（DuckDB 事实表为共享事实底座 + 联邦裁决协议）、Agent Plugin 五层盒子分发、端到端价值验证闭环先行的四阶段建设节奏。目前 walking skeleton 已落地（只追加事实表、确定性采集器、带可核验裁决回执的报告链），进入阶段 2/3 的上游组合件接入：产品大部分能力将依赖外部上游组件（代码考古/证据采集、供应链健康评分、仓库内容打包摘要等），自研部分只有裁决协议、事实表 schema、预声明验收闸门、可核验回执这类护城河与黏合剂。请调研：①上游组件的引入方式应如何选——运行时依赖引用、vendor 源码进仓、适配器+外部 CLI 约定，各自在工业界的先例、适用判据与代价；②这类『大部分是组装上游、少部分是护城河』的产品，其组合件架构应如何在 README 里向新用户清晰阐述（分层/边界/数据流），有哪些成熟范本；③以工业界成熟落地的心智模型为重点，给出推荐与理由；④结论若与上述已封口决策冲突须显式点名，禁止静默改向。

## 1) 执行摘要（Tl;dr）

**推荐：以『适配器 + 外部 CLI/包管理器依赖（逐上游锁定版本 + golden 输出契约测试）』为引入主线，vendor 源码进仓仅作逃生舱口；README 心智模型 = arc42 三视图（上下文/构建块/运行时）压缩为一页 + Backstage 式「哪些是我们的/哪些是上游的」所有权分割 + super-linter 式上游清单表。** 与已封口决策核对后零推翻，但有一处需显式精化：五层盒子内「随分发核心二进制」在接入多上游 CLI 后需补充「运行时解析策略」（super-linter 式容器捆绑 vs go-plugin 式二进制发现 + checksum）子决策——精化而非改向。Confidence：高（三种引入方式均有 2+ 独立信源与知名工业先例交叉验证；唯 macro-audit 自身形态判断含少量产品特异推理）。

## 2) 分点结论

### ① 三种引入方式：先例、判据、代价

**A. 运行时依赖引用（包管理器 + lockfile/hash 锁定）**——先例：各语言生态默认答案（gitflow.dev 称 internal package 是「the default modern answer for most teams」）；kusari.dev 三档 pinning 强度（branch/tag/hash，hash 最强）。适用判据：上游活跃迭代、健康包生态、同语言/同运行时。代价：registry 故障/投毒可断构建或注入恶意代码；safeguard.sh FAQ 结论——lockfile sha512 完整性字段对内容的锁定强度与 vendor 字节相当且仓库重量远小，「Most teams should prefer lockfiles plus a caching proxy, and reserve vendoring for air-gap or regulatory requirements」。映射：库形态上游（如 Scorecard 的 Go 库用法）走此路。

**B. Vendor 源码进仓**——先例：Go vendor/、cargo vendor、C/C++ third_party/、macwright「vendor by default」（小中型已稳定依赖）。适用判据（sscsecurity 决策框架）：气隙部署、强监管可复现构建、安全关键依赖、上游缓慢演进/濒临废弃、依赖足迹小。代价（safeguard.sh 2026-04 批评角度一手数据）：SCA 扫描器对 third_party/ 失明（manifest 键控看不见 2019 年的 zlib CVE-2022-37434）；更新摩擦致静默腐化（实测 vendored C 库中位年龄 3 年+）；本地补丁即无名 fork；SBOM（NTIA minimum elements）无法出具。关键负面判据：「When is vendoring clearly the wrong call? Fast-moving ecosystems with good lockfile integrity」——macro-audit 的上游全部活跃迭代且依赖树庞大，vendor 是明确错误选项。

**C. 适配器 + 外部 CLI 约定（含容器化捆绑变体）**——先例三档递进：GitPython（wrap git CLI，官方自警资源泄漏 → 包装层须短生命周期受控调用）；HashiCorp go-plugin（subprocess+gRPC，「Plugins cannot crash your host process」+ 协议版本号失效旧插件）；super-linter（10.6k star，最贴近 macro-audit 形态的上游打包器——「does not reinvent the wheel」、容器锁几十个上游、逐 linter 独立测试、高度精选避免检查重叠；MegaLinter 同型加插件架构）；Terraform plugin protocol（版本化契约工业级范本：major 管兼容、minor 只增量、v5→v6 翻译层）。适用判据：上游本质是 CLI/进程形态、你的价值在编排与裁决而非上游功能本身、需要故障隔离与语言解耦。代价：上游 CLI 输出格式漂移（必须逐上游锁版本 + golden 输出契约测试）；安装面变大（容器镜像或二进制发现）；适配层自身维护成本（Microsoft ACL 模式官方注意事项：翻译层禁放业务规则）。

**对比矩阵**：

| 项 | 运行时依赖引用 | Vendor 源码进仓 | 适配器+外部 CLI（容器化捆绑） |
|---|---|---|---|
| 工业先例 | 各语言包管理器默认；gitflow/kusari | Go vendor/cargo vendor/C++ third_party；macwright | GitPython、go-plugin/Terraform protocol、super-linter/MegaLinter |
| 升级敏捷度 | 高（Renovate/Dependabot 自动化） | 低（实测中位腐化 3 年+） | 中（逐上游锁版本，容器整体升级） |
| 供应链韧性 | lockfile hash 锁定≈vendor 强度 | 最高（上游消失/投毒免疫） | 高（容器镜像 digest 锁定） |
| 扫描器可见性 | 好（manifest 驱动） | 差（需 UPSTREAM 清单+代码指纹扫描） | 好（容器内 manifest 完整） |
| 适配边界清晰度 | 中（上游类型渗入业务代码） | 中 | 最高（进程边界=天然 ACL） |
| 分发复杂度 | 低 | 低 | 中（容器/二进制发现） |
| 与 macro-audit 契合度 | 适配库形态上游 | 低（上游活跃迭代，判据不符） | 最高（裁决边界=事实表 schema） |

### ② README 组合件心智模型：三个范本 + 建议结构

1. **Backstage（CNCF）——所有权三分法**：Core/App/Plugins 三组件各写明「who maintains it」；README 本体极薄（82 行），架构细节外链 architecture-overview——README 给地图、docs 给楼层平面图；building blocks 语法明说 App/Backend「没有自己的功能，只负责 wiring」，即组装型产品的自我描述语法。
2. **arc42——分层/边界/数据流标准模板**：Section 3 Context & Scope（上游组件声明为外部系统）、Section 5 Building Block View（黑盒/白盒层级）、Section 6 Runtime View（运行时场景=数据流）；官方强调「prefer relevance over completeness」。
3. **super-linter——上游清单表格**：README 一张「语言 | Linter | Formatter」表把全部上游及角色摊开，配「does not reinvent the wheel」一句定位；gpt-researcher 示范 README 内嵌 5 步 planner/executor 数据流 + 架构心智图的轻量做法。

**给 macro-audit 的 README 结构建议（压缩 arc42 为一页）**：①一句话定位（证据采集大部分来自上游，裁决/schema/回执是我们的）；②三层盒子图对应五层插件——证据层=上游组件表（组件名/形态库或 CLI/引入方式/锁定策略）、事实与裁决层=护城河（DuckDB 事实表 schema、联邦裁决协议、回执链）、分发层=Agent Plugin 五层盒子；③Runtime View 一条 Mermaid 数据流（仓库输入→采集器→事实表→裁决→回执→报告），每个箭头标注谁产出、谁消费、以什么契约；④所有权表（Backstage 式：是我们的——回执/schema/闸门 vs 借来的——逐项列上游）；⑤契约声明（上游经适配器进事实表，raw 语义不出适配层；上游换实现，事实表 schema 不动）。写作纪律（freecodecamp/arc42 一致结论）：按读者分视图（概念图给决策者、组件图给贡献者）、禁止架构叙事与营销文案混排、black box 模板只写职责/接口/源码位置三件事。

### ③ 推荐与理由：双轨制 + 逃生舱

- **主线 = 适配器 + 外部 CLI/库，逐上游锁定版本，配 golden 输出契约测试**。理由：(a) 护城河（裁决协议、事实表 schema、回执）要求上游可替换——Microsoft ACL 模式定义「ensure that dependencies on outside subsystems do not limit an application design」；(b) 进程/容器边界是天然防腐层，super-linter 证明此形态可在 10k+ star 规模维护几十个上游；(c) 版本化契约先例充分（go-plugin protocol version、Terraform v5/v6 并存与翻译层）。
- **库形态上游走包管理器 + lockfile hash pinning**——不为「统一」把所有上游 CLI 化；按上游信任度与带宽选 pinning 强度（kusari 判据）。
- **Vendor 仅两种情况启用**：某具体上游需离线/气隙分发、或上游废弃且无替代；且必须带 UPSTREAM 清单 + patches/ 目录纪律（safeguard 五条规则），否则 SBOM 与扫描全线失明。
- **README**：arc42 三视图一页化 + Backstage 所有权分割 + super-linter 上游清单表——三者分别解决「数据流怎么讲清楚」「边界归谁」「上游是什么」三个新用户必问问题，全部是被大规模项目验证过的形态，无需发明新格式。

### ④ 调研侧冲突核对（atomcode 原文）

| 封口决策 | 核对结论 |
|---|---|
| Hub-of-Facts（DuckDB 事实表 SSOT + 联邦裁决） | 无冲突，且调研强化它：ACL 官方判据（翻译层不放业务规则）恰好论证「事实表 schema 是唯一允许上游语义落地的边界」 |
| Agent Plugin 五层盒子双 manifest | 无冲突，但需显式精化一处：盒内「随分发核心二进制」在接入多上游 CLI 后必须补「运行时解析策略」（容器捆绑 vs 二进制发现+checksum）——盒内打包形态的子决策，不动摇五层盒子本身 |
| 四阶段建设节奏（价值验证先行） | 无冲突。适配器优先是 walking skeleton 的自然延伸：先定契约测试骨架，上游替换不动裁决层 |
| 裁决协议/schema/闸门/回执 = 自研护城河 | 无冲突，但调研称「知识库 D-00X 曾有『裁决层不自研，直接复用 Receipt Gate / agent-completion-gate』」建议合并表述（见主 Agent 核对：此句无账本出处，属召回偏差） |
| 证据层 BOM（CodeLore + Scorecard + repomix/gitingest） | 无冲突。引入方式此前未封口——本调研是补位决策而非改向；唯一有潜在冲突风险的 vendor 选项已被明确不推荐，无实际冲突发生 |

atomcode 原文声明：本报告未推翻任何既有决议；两处（运行时解析子决策、Receipt 表述合并）均为新增精化项，建议落为新 D 条目而非修订旧条目。

## 3) 完整来源清单（13 条）

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| S1 | Vendoring vs. Dynamic Dependency Resolution（OSS Supply Chain Security 书） | sscsecurity.dev/book2/chapter-13/ch-13.3/ | Official/Comparative | 三方案对比表、决策树、hybrid proxy 第三态 |
| S2 | Vendoring Dependencies: When It Helps and When It Hurts Security | safeguard.sh | Criticism（2026-04-30） | vendor 失效模式一手数据（扫描失明、3 年腐化中位数）、五条 vendor 纪律、lockfile≈vendor 强度 |
| S3 | Vendor by default（Tom MacWright） | macwright.com（2021-03-11） | Community | vendor 正面心智（小中型稳定依赖）、not-everything 边界 |
| S4 | Anti-Corruption Layer pattern（Microsoft Azure） | learn.microsoft.com（2026-05-30） | Official | ACL 定义、翻译层禁放业务规则、适用/不适用判据 |
| S5 | Multi-repo coordination: submodules, subtrees, packages | gitflow.dev（2026-06-07） | Comparative | submodule/subtree/package 三方案决策表与失败模式 |
| S6 | Stick a Pin in It（Kusari） | kusari.dev（2025-01-23） | Official | 三档 pinning 强度（branch/tag/hash）与选择判据 |
| S7 | hashicorp/go-plugin README | github.com/hashicorp/go-plugin | Official | subprocess+RPC 插件架构、协议版本化、checksum 验证 |
| S8 | Terraform plugin protocol（HashiCorp 官方） | developer.hashicorp.com | Official | 版本化契约工业级范本（major 破坏/minor 增量/v5→v6 翻译层） |
| S9 | Super-Linter README | github.com/super-linter/super-linter（v8） | Official/Community | 上游打包器最贴近先例：容器捆绑、精选集合、逐 linter 测试 |
| S10 | Backstage README + Architecture overview | github.com/backstage/backstage; backstage.io | Official | Core/App/Plugins 所有权三分法、README 薄身+外链、building block 语法 |
| S11 | GPT Researcher README | github.com/assafelovic/gpt-researcher | Community | README 内嵌数据流段落 + 五步 planner/executor 描述 |
| S12 | arc42 Section 5 Building Block View | docs.arc42.org/section-5; arc42.org | Official | 黑盒/白盒层级模板、prefer-relevance-over-completeness |
| S13 | System Architecture Documentation Best Practices | freecodecamp.org | Community | 三读者视图（概念/组件/运维）分层原则 |

三引擎交叉验证：vendoring 利弊（S1+S2+S3）、CLI 包装先例（S7+S8+S9）、README 范本（S10+S11+S12+S13）——每个关键结论 ≥2 独立信源。

## 4) 信息缺口（3 条）

1. 无完美同构先例：「审计裁决型 + 事实表 SSOT + 回执链」精确组合无公开一手架构文档；super-linter（缺裁决层）与 Backstage（缺本地 CLI 采集）各覆盖一半，结论按功能切面对齐合成，存在少量类比外推。
2. 容器捆绑 vs 二进制发现在 Agent Plugin 生态的兼容性未实证：需在阶段 2 实施前读 Agent Plugins 1.0.0 plugin schema 原文确认盒内二进制/容器解析语义。
3. 上游 CLI 输出格式漂移的量化频率缺数据：golden 契约测试维护成本只能定性引用 GitPython/go-plugin 经验，无第三方统计。

## 5) 主 Agent 冲突核对（扩展至 D-001~D-018 + A-001~A-030）

atomcode 侧核对覆盖 D-001~D-013（其知识库召回范围）；主 Agent 按协议补齐 D-014~D-018 与 A-019~A-030：

- **D-016/ADR-0012 四阶段**：一致——适配器主线是阶段 2/3 组合件接入的自然延伸（调研明示无冲突）。
- **D-017/D-018/ADR-0013 三层闸门与判据**：无涉（本问不触及验收协议）。
- **D-012/ADR-0008 五层盒子**：一致；「运行时解析策略」为新子决策，按台账惯例落新 D 条目（不修订 D-012）。
- **D-015/ADR-0011 单仓子目录**：一致（容器捆绑/二进制发现均可在单仓内承载）。
- **ADR-0009 输入面 clone-to-local**：一致（适配器不改变输入面裁决）。
- **A-021/A-022（fact schema v0、确定性采集器）**：一致——适配器输出经契约测试进事实表，raw 语义不出适配层；现有自研采集器即适配器雏形。
- **一处调研侧召回偏差（如实呈报）**：调研④称「知识库 D-00X 曾有『裁决层不自研，直接复用 Receipt Gate / agent-completion-gate』」——全仓 grep（.scratch/docs/CONTEXT.md）无任何账本条目含此表述，且「agent-completion-gate」字样全仓不存在；「Receipt Gate」仅作为 Micro-A 数据源词条出现（CONTEXT.md L43、reports/15/17/18）。按「账本唯一数据源」纪律：**无此 current 决策，无 revised 触发**；调研建议的合并措辞（复用其机制、拥有自己的回执 schema 与签发链）与 A-026 实际交付（自研双锚 Receipt）一致，可作 README 契约声明措辞采纳。

**结论：零冲突、零 revised。** 两处新增精化项（运行时解析子决策、README 契约声明措辞）+ 一处调研召回偏差记录。

## 6) 呈报与拍板请求

- **D-020（拟）上游引入方式 = 双轨制 + 逃生舱**：适配器+外部 CLI/库（锁定版本 + golden 契约测试）为主线；库形态上游走包管理器 lockfile hash pinning；vendor 仅气隙/上游废弃两种情况启用且须 UPSTREAM 清单纪律。待用户拍板。
- **根 README 组合件结构（拟）**：按调研五段式（一句话定位/三层盒子图+上游清单表/Mermaid Runtime View/所有权表/契约声明）落 6F 根 README。待用户拍板。
- **运行时解析策略（拟后续问题）**：容器捆绑 vs 二进制发现，须先读 Agent Plugins 1.0.0 plugin schema 原文（信息缺口 2）再下探。
- 状态：以上均为**建议**，未经用户拍板不落账本、不进 README、不动源码（grill 纪律）。
