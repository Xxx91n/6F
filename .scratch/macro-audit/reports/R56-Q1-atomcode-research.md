# R56-Q1 atomcode 调研报告存档

> 会话：7613d1b3-504b-4084-8345-6e2d77788d52｜iso=2026-10-02T15:59:48.708+00:00

我将先加载 atomcode-research 技能，随后回顾本地账本与 ADR，再进行三引擎联网调研。先做本地取证：抽取账本 current 决策、ADR 与 CONTEXT 中与四个候选相关的记录。ctx 工具未挂载，改用白名单内只读工具直接回顾账本与 ADR。ctx 工具未挂载、bash 被只读拦截，无法走 atomcode CLI 委托。我改用白名单内三引擎自研，按协议配额执行。本地账本关键证据已取（D-030 铺开序、D-121 Micro-B 设计树、D-162 Stage-0/1/2、D-033 试点绑定、D-047/D-049 票面、Stage-2 判据①=capability 5/5）。现在第一阶段广搜：五角度三引擎并行。继续广搜：补对比、时效、社区角度。进入定点深挖：抓取高价值原文核验，并补最后两个角度（技术雷达门槛、CodeLore 现状）。# R56-Q1 深调研报告 —— grill 设计树根节点裁定

**Sufficiency Gate**: searches: 10 | angles: Official／Comparative／Criticism／Currency／Community 全五类 | full reads: 6（gojko.net 原文、codepulsehq 工具对比全文、hercules GitHub 原文、CodeLore GitHub 原文、CodeScene 官方档×2）| 本地账本/ADR/CONTEXT 检索 3 组 | gaps: 见文末

---

## 1) 执行摘要（Tl;dr）

**推荐 (a) Macro-C 能力层设计树作为本轮 grill 根节点**，同时把 (c) 中「语言栈前提事实解封」的 #9/#10/#13 重估作为低成本的并行账面 lanes（不占根节点位）。**Confidence：高**——理由有三重独立支撑：① 层序 Macro-C→Micro-A→Micro-B→Macro-A 是账本 current 决策（D-030②/D-121），选 (a) 是零冲突执行既有裁定，选 (b) 则须显式推翻 D-xxx；② 工业界心智模型（walking skeleton→flesh-out、value-stream 排序、radar 分级）均指向「骨架已立（Macro-B+Micro-B 已 preview），按预声明序列铺下一块未建能力」；③ Macro-C 上游生态实证就绪（CodeScene 商业活体＋CodeLore 已在本仓缝入 #35 契约面），而 Micro-A 面向的 PR-diff 审计赛道已是红海商品化。

---

## 2) 分点结论

### 2.1 工业界能力铺开次序模型 → 支持 (a)

- **Walking skeleton（Cockburn 正典定义）**：「tiny implementation performing a small end-to-end function…architecture and functionality then evolve in parallel」——本仓现状正是骨架已走：Macro-B 一等命令实跑真仓＋Micro-B 已缝入 preview（#80）。骨架之后的标准动作是 **flesh-out**（按既有架构逐层填肉），而非另起第二条端到端线。〔gojko.net，已读原文〕
- **Gojko「crutches」修正**（2014）：主张更薄的价值切片先行、后端迭代补齐——但它修正的是「骨架期拖太久」，不修正「已声明序列的 flesh-out 次序」。本仓骨架期已过（两 scale 上架），crutches 模式反而支持诚实 preview 分级（ADR-0017 已在做）。〔gojko.net，已读原文〕
- **Value-stream 排序**：VSM 惯例=先选 product family、端到端走通、瓶颈优先。本仓 value stream 是「五尺度审计报告」，当前瓶颈=未建层中**层序第一位的 Macro-C**；且 D-121 铺开序裁定的时点信息（Micro-B 设计时已归位 Macro-C 在前）是账本内最新意愿表达。〔lean.org／atlassian.com，搜索面交叉〕
- **Technology Radar adopt-trial 门槛**：Trial=limited production use，Adopt=proven in production。这正对应本仓 preview 分级漏斗——下一层进 Trial（preview）前须完成其设计树烤制；跳序让 Micro-A 先进 Trial 无 radar 惯例支持（radar 是按成熟度晋升，不是按容易程度挑序）。〔thoughtworks.com Radar Vol.32/33，搜索面〕

### 2.2 演化考古工具生态成熟度 → Macro-C 上游就绪，但有先决条件清单

- **商业活体**：CodeScene 持续维护（7.4.6 档），其官方档明确了演化分析的**落地先决条件**，可直接转化为 Macro-C 设计树的验收判据素材：
  - 知识/ownership 类指标须**全量历史**；hotspot 用滑动窗防陈旧热点偏置；团队类指标从组织变更日切起算；
  - **squashed import commit 偏置**：历史未随代码迁移的仓库会把全部功劳记给首 commit——须排除初始 commit（本仓 D-054④ 的最小样本量判据 TC1_MIN_N=5 是同族纪律，可扩展）；
  - **跨仓耦合不可算**：change-coupling 依赖同仓同 commit——「三仓并跑→Macro-A」的试点设计不受影响，但 Macro-C 若做多仓对照须预声明此边界。〔docs.enterprise.codescene.io，已读〕
- **OSS 生态老化**：hercules（2.8k star）本体活跃度存疑——其自载 roadmap 承认 source{d} 已死、Babelfish 依赖 abandoned、大仓 burndown 有 OOM 与 1.5GB YAML 解析问题；git-of-theseus 维护间歇（erikbern 偶发修复），2025 年出现 Rust 重写 gix-of-theseus（500× 提速）说明需求在、旧工具在换血。**含义**：Macro-C 不应绑死任一 OSS 工具，CodeLore（Rust 原生、31 analyses、直接读 git、自带 provenance receipt 与 DuckDB fact store）已是 code-maat 的 drop-in 后继且**已在本仓适配层内**——上游选型无需再调研，设计树可直接消费。〔github.com/src-d/hercules 已读；amedee.me／github.com/emrecdr/codelore 已读〕
- **CodeLore 与 Macro-C 的契合度**：其 analyses 面（hotspots/coupling/ownership/knowledge-fragmentation/code-health/clone-coupling/community detection）与账本 D-035 契约面、D-054 behavior 象限已消费的事实一致；其 MCP 工具面（`change_context` 预写简报、`gate_changes` working-tree verdict）甚至已经长出了 Micro-A 相邻形态——这说明 Macro-C 与 Micro-A 共享同一 fact store 是架构既定方向（D-121 投影主干已裁）。

### 2.3 PR-diff 审计工具生态 → 支持 (a) 优先于 (b) 的差异化论据

- CodeRabbit/Copilot review/Macroscope 等已高度商品化，2025 年赛道拥挤（dev.to 六强评测、deployhq 一年实战、CodeRabbit 自家 AI-vs-human 报告：AI 代码问题多 1.7×）。**Micro-A 的可借鉴面**已被这些产品明排（题面自认「已明排形态除外」），其剩余差异化空间=审计/verdict-gate 语义而非「review 得好」——这个差异化恰恰依赖 **#10 cross-scale correlation key**（把 Micro 发现挂回 Macro 热点/演化证据），而 #10 的重估在 (c) 面里。**含义**：先烤 Macro-C 再烤 Micro-A，Micro-A 设计时能继承演化事实做 correlation，次序红利明确。
- 反向论据（支持 (b)）：env-manager 试点绑定（D-033）是**唯一托管 PR 面**，试点现成、#48 票面已立案（D-049 七锐化），启动摩擦最小。但「启动摩擦小」不是层序判据——D-121 已裁层序，且 Micro-A 若无 correlation key 先行，audit 卡会缺宏观锚。

### 2.4 候选 (c) 能力矩阵收口面 → 部分成立，宜拆作并行 lanes

- **支持**：语言栈前提已事实解封（engine 实为 TS+DuckDB），#9/#10/#13 的重估是纯账面动作、成本极低；R4-02（adr-structure detector v2 接线）是 P0 且属 Macro-B 象限收口，与 (a) 无文件冲突。
- **反对（作为根节点）**：这是记账与补欠账，不产出新能力层；工业界惯例（radar／capability matrix「never treat roadmap as shipped」，D-054② 已引 Atlan/Intended/MS Foundry 惯例）支持把矩阵收口当**治理常项**而非主线。
- **裁定建议**：(c) 拆两条并行 lane——①R4-02 接线（P0 实工）；②#9/#10/#13 前提解封重估（账面），均不占 grill 根节点。

### 2.5 候选 (d) Stage-1/2 推进面 → 过早，且判据依赖链指向 (a)

- Stage-2 判据①=capability 5/5（**Macro-A preview 上架为终点**），而 D-030②/D-121 层序裁定 Macro-A **天然最后**；判据②③④（fresh-clone 不红海／GAP-HOST-01 关闭／试点 findings 清零）全部依赖试点跑出读数。
- Stage-1 逐案 charter 试用（D-151/D-162）需要**有东西可试**：当前可试集=Macro-B+Micro-B，charter 形态可边跑边磨，但把 Stage-1/2 当根节点=在能力未铺完时优化分发漏斗——VSM 惯例下是给瓶颈下游提速。
- **冲突点名**：(d) 若提前推进静默窗启动，与 D-173 静默窗词条「零试点期读数=not_started 非计时中」及 D-162 stage 门控语义冲突风险高。

### 2.6 候选 (e) → 无新增信息，不展开（本仓 dogfooding 已由三仓并跑/Macro-B 回归覆盖；V-04 立法面是收口期动作）。

### 2.7 辩证总表：对 (a) 的反对论据（如实呈报）

1. **认知负荷最重**：演化考古的时间维度语义（对比语义、演化切片、校准方法论）是五尺度中 epistemics 最难的一层；烤它的设计树比烤 Micro-A 慢。
2. **历史质量依赖**：CodeScene 官方档列出的先决条件（全量历史、import-commit 偏置、跨仓边界）意味着 Macro-C 对「git 记录健全」的前提最敏感——低 commit 仓披露纪律（D-054④）要扩面。
3. **缓解**：反对论据全是「难」不是「错」；且 anysearch-cli→56 ADR＋supersede 链作为校准语料（D-033）是本仓独有的自证资产，越晚用越浪费（账本自身在增长，校准集越早冻结越可复验）。

---

## 3) 对比矩阵

| 项 | 层序一致性 | 上游/试点就绪度 | 差异化价值 | Stage-2 判据贡献 | 冲突点名 |
|---|---|---|---|---|---|
| (a) Macro-C 设计树 | ✅ 层序第一位（D-030②/D-121 current） | ✅ CodeLore 已缝入 #35 契约面；anysearch-cli 校准语料绑定（D-033） | ✅ 演化考古=非红海，CodeScene 商业验证 | 间接（Forensics 资产位） | 无 |
| (b) Micro-A 设计树 | ⚠️ 跳序，须显式推翻 D-030②/D-121 | ✅ env-manager 唯一托管 PR 面＋#48 票面（D-049） | ⚠️ PR-diff 赛道红海，差异化依赖 #10 correlation key | 判据①计数 | **D-030②/D-121** |
| (c) 能力矩阵收口 | 中性（账面） | ✅ 前提事实解封，成本极低 | ❌ 无新能力 | ❌ 无 | 若动 #13 票面须带 D-049 回指 |
| (d) Stage-1/2 推进 | ⚠️ 依赖层序走完 | ⚠️ 判据②③④依赖试点读数 | ❌ 漏斗优化非能力建设 | ✅ 正是该面本体 | **D-162/D-173**（静默窗 not_started 语义） |

---

## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Forget the walking skeleton – put it on crutches（Gojko Adzic） | gojko.net/2014/06/09/forget-the-walking-skeleton-put-it-on-crutches/ | Official/Community | 2014-06-09 | walking skeleton 正典定义＋crutches 修正的适用边界（**已读原文**） |
| 2 | CodeScene Project Configuration 官方档 7.4.6 | docs.enterprise.codescene.io/latest/configuration/projects.html | Official | 持续 | 演化分析先决条件：全量历史/滑动窗/import-commit 偏置/跨仓耦合边界（**已读**） |
| 3 | CodeScene How it works | codescene.com/product/how-it-works | Official | 持续 | 商业活体证据、behavioral+static 融合定位（**已读**） |
| 4 | hercules（src-d GitHub） | github.com/src-d/hercules | Criticism | 维护中衰减 | OOM/1.5GB YAML/Babelfish abandoned/source{d} 死——OSS 老化实证（**已读**） |
| 5 | 500x Faster Theseus Plots with Rust and Gitoxide | amedee.me/introducing-gix-of-theseus | Currency | 2025-10-07 | git-of-theseus 10h/hercules 1h vs Rust 重写——生态换血信号（**已读**） |
| 6 | CodeLore GitHub | github.com/emrecdr/codelore | Comparative | 持续 | 31 analyses/code-maat drop-in 后继/DuckDB fact store/MCP 面——Macro-C 上游就绪实证（**已读**） |
| 7 | Git Metadata Analysis Tools（CodePulse guide） | codepulsehq.com/guides/git-metadata-analysis-tools | Comparative | 2026-02→2026-07 更新 | OSS 工具 limitation 矩阵（theseus 窄/hercules 难装）＋git 元数据价值面（**已读**） |
| 8 | Thoughtworks Technology Radar Vol.33 | thoughtworks.com/…/tr_technology_radar_vol_33_en.pdf | Official | 2025-11 | adopt/trial/assess/hold 晋级语义＝preview 分级先例 |
| 9 | 6 Best AI Code Review Tools 2025（dev.to） | dev.to/heraldofsolace/… | Comparative | 2025-12 | PR-diff 赛道商品化、Copilot review 表层化 |
| 10 | AI vs Human Code Generation Report（CodeRabbit） | coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report | Currency | 2025-12-17 | AI 代码 1.7× 问题——Micro-A 审计语义的需求侧证据 |
| 11 | Value Stream Mapping（Lean Enterprise Institute／Atlassian） | lean.org/lexicon-terms/value-stream-mapping; atlassian.com/…/value-stream-mapping | Official | 持续 | VSM 瓶颈优先/端到端排序惯例（搜索面交叉） |
| 12 | Thoughtworks Radar Techniques（toxic flow/feedback sensors for coding agents） | thoughtworks.com/en-us/radar/techniques | Currency | 2026-04 | AI 生成代码反自满面——Micro-A gate 语义的工业界呼应 |

三引擎交叉：Exa（#1/2/3/5/8/9/10/12）、Tavily（#4 部分/8/11）、AnySearch（#4/6/7/10）——关键结论（层序模型、演化工具先决条件、PR-diff 红海、OSS 老化）均 ≥2 引擎或 ≥2 独立信源。

---

## 5) 信息缺口

1. **Macro-C 对比语义的逐字先例**：CodeScene/CodeLore 提供「两点对比/时间窗」机制，但「演化考古审计报告的切片粒度」（per-release? per-quarter? per-epoch?）无逐字同名先例——设计树须自裁并标注惯例外推（对齐 R39-Q3 的披露纪律）。
2. **#47 托管 API 适配器与 Macro-C 的关系**：GitHub REST 适配器（A-055 已落）是否为 Macro-C 补采管线的一部分，账本未见显式裁定，需 grill 时点名。
3. **anysearch-cli 校准语料的冻结时点**：56 ADR 链仍在增长，「校准集何时截断」无 current 决策。
4. **Paywall 未读**：Tornhill《Your Code as a Crime Scene》第二版正文未直接核验（经 refactoring.fm 播客与 CodeScene 官方档二阶交叉，置信中高）。

**最终裁定建议**：本轮 grill 根节点=**(a) Macro-C 能力层设计树**；(c) 拆 R4-02 接线＋#9/#10/#13 前提解封重估两条并行账面 lane 随轮处理；置信度**高**。
