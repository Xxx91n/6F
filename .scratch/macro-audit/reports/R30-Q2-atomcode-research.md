# R30-Q2 atomcode 深调研报告：文件级审计卡片的触发面×采集模型选型

> 运行：2026-09-23（atomcode -p）；题面见 R30-Q2-research-prompt.md。
> 引擎实况：Exa 中途限流、Tavily 配额耗尽→AnySearch 主力+web_search 补位；searches 10+、full reads 6、五角度全覆盖；置信度=高（主干四源交叉）/中（补采降级细节）。
> resume 锚：4f0f2751-0d94-481a-9ca4-1ba9497c1dc2

## 1) 执行摘要（Tl;dr）

**推荐 A（预采集+投影式 read-model）为主干，辅以 C（缺失面按需补采）作长尾文件降级路径；明确否决 D（host-hook）与纯 B（全按需）。** 工业界同类产品（SonarQube、CodeScene、Sourcegraph、CodeClimate）无一例外采用「批式预计算索引→查询面只读」心智模型；字节级确定性约束（观测时点锚 HEAD、禁墙钟）天然要求「采集时点固定」=预采集语义。按需计算（B）无法保证 git log --follow 结果与 HEAD 时点快照一致（工作树可能脏、HEAD 可能前移）破坏确定性；host-hook（D）无工业先例且把触发权交给宿主越过 SSOT 投影纪律。

## 2) 对比矩阵

| 候选 | 工业先例 | 确定性兼容 | 延迟/新鲜度 | 主要风险 | 判定 |
|---|---|---|---|---|---|
| **A 预采集+投影** | SonarQube（scanner 报告→CE 汇总→Web 查询）、CodeScene（仓级分析→系统图/文件卡）、Sourcegraph（SCIP 索引→查询面） | ✅ 采集锚定 HEAD，天然字节确定 | 查询毫秒级；新鲜度=上次采集 | 初始采集慢（CodeScene FAQ 明示） | **主干** |
| B 按需采集 | 无主流先例（CodeClimate engine 是整仓触发，非单文件） | ❌ 现场算 git log 受工作树状态污染 | 首查秒~十秒级（--follow 大文件很慢） | --follow 性能差、结果不可复现 | 否决 |
| C 混合（骨架+补采） | CodeScene Delta Analysis Hotspot Scan（>50 文件自动降级、只扫热点）=按预算裁剪计算面先例 | ⚠️ 可兼容：补采结果仍写回 SSOT 再投影 | 热文件毫秒、长尾文件秒级+一次性写回 | 补采与预采集两套代码路径 | **降级/长尾补充** |
| D host-hook 驱动 | 无先例（Sourcegraph 走持续索引而非宿主 hook；LSP 属 IDE 而非 agent 宿主） | ❌ 触发时点不由 kernel 控制 | 依赖宿主实现 | 破坏 SSOT 投影纪律、宿主耦合 | 否决（可作 future 扩展面） |

## 3) 分点结论（含来源）

**① 工业界 per-file 指标一律是「预计算索引」，查询面只读。**
SonarQube：文件级指标 CI 侧 scanner 算好、打包二进制分析报告、入队后 Compute Engine 存储并算聚合度量，UI/查询=纯投影（SonarSource 官方论坛 Ann Campbell＋官方 performance 文档证实 CE=后台批处理）。Sourcegraph：code nav 分 search-based（即时但启发式）与 precise（SCIP 预索引、编译器级准确），precise 明示「requires more upfront investment」=用预索引换查询质量（SCIP 官宣博客+Code Navigation 文档两源交叉）。CodeScene：hotspot/coupling/code health 均来自仓级演化分析后的系统图与文件视图，delta analysis 性能优化方向=「加缓存」（7.0.3 release notes）。→ 文件卡=DuckDB SSOT 上的 read-model 投影，与五层架构（fact SSOT+MCP 只读查询面）完全同构=A 的最强论据。

**② 预聚合 vs 按需计算的选择判据（OLAP 惯例）支持 A+C。**
Oracle OLAP 官方文档：按查询频率决定物化层级——高频查询面预聚合、低频长尾 runtime 计算（skip-level aggregation）。Ramakrishnan/Gehrke 教材：物化视图维护策略分 Immediate/Deferred/Lazy，**Lazy（查询触发刷新）是公认合法选项**=C 的理论依据：骨架投影（高频/热点文件）预物化，长尾文件首查时 lazy 补采、写回 SSOT、再投影，之后归入预物化集。判据归纳：查询扇出小且维度固定（单文件、指标集固定）→投影式；维度基数巨大（全仓每文件全指标笛卡尔积）→不必全物化，lazy 填充。

**③ 「查看触发」在 AI 时代落地形态=显式 tool 调用，而非 IDE/LSP 派生事件。**
Sourcegraph 已把 code search/nav/blame 通过 MCP server 暴露给 agent（官方 context-compare 对比页：MCP server 提供 search、code nav、file browsing、commit/diff search）；Serena 等 MCP server 用 symbol 级工具替代「文件被打开」这类 IDE 事件。agent 宿主里没有等价于 IDE hover 的被动触发面——**agent 的「查看文件」就是调用一个 tool**，所以规范层「单文件查看触发」应落地为：MCP tool（如 file_audit_card）+CLI 子命令双入口，二者都只是投影查询不触发采集。LSP 层缺失不是缺陷而是边界清晰：LSP 面向 IDE 宿主，本仓宿主=agent IDE，MCP tool 就是它的 hover。

**④ Advisory 非裁决卡的披露惯例。**
CodeScene 区分两形态：delta analysis（可接 quality gate、阻塞）与系统图/文件视图洞察（纯 advisory、配 ML priority 排序降误读感）；hotspot 文档反复强调「low health in non-hotspot has lower priority」=**用上下文优先级元数据防误读而非隐藏数据**。静态分析界共识（Parasoft/Cycode）：误读风险靠分级（critical/priority）、抑制机制（suppression）与可追溯披露管理。落到文件卡设计：卡上必须披露 (a) 数据源=HEAD <sha> 时点的演化指标（确定性锚点即披露点）、(b) 指标性质=advisory 非裁决（显式字段如 advisory:true 不进 gate 路径）、(c) 每项指标的可复现查询（SSOT 表+SQL 可引证据）、(d) 长尾文件若为 lazy 补采标注采集来源（prefetch vs on-demand），避免读者把新鲜度差异误读为结论差异。

## 4) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | SonarSource 论坛：Detailed Explanation of Code Analysis Process | community.sonarsource.com/t/.../120081 | Official | SonarQube 预计算流水线（scanner→报告→CE→查询）官方确认 |
| 2 | SonarQube 官方：Improving performance (CE workers) | docs.sonarsource.com/.../improving-performance | Official | CE 后台批处理角色、并行 PR 分析佐证预计算 |
| 3 | CodeScene：Technical Debt / Hotspots 文档 | codescene.io/docs/guides/technical/hotspots.html | Official | hotspot/churn/health 仓级预分析→视图模型 |
| 4 | CodeScene：Delta Analysis CI/CD 文档 | docs.enterprise.codescene.io/.../automated-delta-analyses.html | Official | Full Scan vs Hotspot Scan（>50 文件降级）=C 的预算裁剪先例；quality gate 与 advisory 分离 |
| 5 | CodeScene 7.0.3 Release Notes | codescene.com/on-prem-release-notes/release-notes-7.0.3 | Currency | delta analysis 性能靠缓存改进，印证预计算路线 |
| 6 | Sourcegraph：Announcing SCIP | sourcegraph.com/blog/announcing-scip | Official | 预索引 vs 即时的取舍原话；增量索引动机 |
| 7 | Sourcegraph：Code Navigation 文档 | sourcegraph.com/docs/code-navigation | Official | search-based（即时）vs precise（预索引）双轨 |
| 8 | Sourcegraph：AI Coding Context Tools Compared | sourcegraph.com/resources/context-compare | Comparative | MCP server 承载 code search/nav/blame 给 agent 的先例 |
| 9 | Code Climate：Build Your Own Plugin | codeclimate.com/legacy/build-your-own-codeclimate-plugin | Official | engine=整仓容器化批跑、STDOUT JSON——非单文件按需 |
| 10 | Oracle OLAP：Balancing Precalculated and Runtime Aggregation | docs.oracle.com/.../aggreg10.htm | Official | 预聚合 vs 按需的经典判据（按查询频率分层） |
| 11 | Ramakrishnan/Gehrke 物化视图材料（搜索命中课件） | （SQL 教材章节，检索自 web_search） | Academic | Immediate/Deferred/Lazy 维护策略=C 的理论依据 |
| 12 | Parasoft：False Positives in Static Code Analysis | parasoft.com/blog/false-positives-in-static-code-analysis/ | Criticism | advisory 误读治理惯例 |
| 13 | Cycode：Static Code Analysis Best Practices | cycode.com/blog/static-code-analysis/ | Criticism | 抑制/分级披露惯例 |
| 14 | CodeScene FAQ | community.codescene.com/help/collections/3484497-faqs | Community | 初始分析耗时长是已知批评点（预采集的代价） |
| 15 | G2 CodeScene Reviews | g2.com/products/codescene/reviews | Community | 大仓 UI 变重=预计算新鲜度/性能权衡实证 |

## 5) 信息缺口

- 各产品「文件卡首查延迟」无官方量化数字（CodeScene 初始分析时长仅社区定性抱怨）；建议以本仓规模做一次 A vs C 实测基准。
- host-hook 形态无任何先例可引，D 的否决基于架构一致性推理而非实证。
- Exa 中途限流、Tavily 额度耗尽，三引擎中 AnySearch 承担大部分验证；关键结论均有 ≥2 独立信源，个别（lazy 补采细节）仅单引擎可达。

## 落地建议（atomcode 一句话版）

规范层改为：「触发器=MCP tool file_audit_card 或 CLI audit file <path> 子命令（宿主 AI agent 的『查看』即 tool 调用）；采集=仓级批式预采集锚定 HEAD 入 DuckDB SSOT，文件卡为纯投影；对预采集未覆盖的文件，首查触发 lazy 补采、结果写回 SSOT 后再出卡，卡片披露 head_sha、advisory:true 与每项指标的 SSOT 可追溯来源。」
