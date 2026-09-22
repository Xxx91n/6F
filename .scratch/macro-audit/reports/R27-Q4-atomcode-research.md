# R27-Q4 atomcode 深调研报告 —— 实施窗口边界（门面收口包 vs 引擎 quarantine 建制同窗与否）（2026-09-22）

> 置信度：高（两大支柱各 ≥2 独立信源交叉）。Sufficiency Gate：searches 6+（web_search×3、AnySearch×3；Tavily 配额耗尽双引擎补足）｜原文全读 7｜7 域名｜四角覆盖。题面存档=R27-Q4-research-prompt.md。

## 1) 执行摘要

**推荐 (a)，但带一个修正：B 票不是「排下一窗」，而是立即开工的并行独立验证窗；红修腿归入 B 票而非 A 票。** 两条交叉验证的工业心智模型：①「One PR = one idea」——文档/门面改动与引擎核心行为变更（intake schema+golden 测试）是**不同 idea**，混入同一验证窗让审阅者无法区分「行为变更是有意还是笔误」（youngju.dev；Pragmatic Engineer 验证 Meta/Google 十年惯例）。②「哨兵红≠腐红」——cicd.watch healthy/flaky/broken 分类学与 Google/Fuchsia flake 政策一致：**consistent failing 且检出真实缺口的测试必须尽快处置，但路径是「移出关键路径+立票限期修复」，不是塞进主题不符的窗口**。

## 2) 分点结论

### ① 混合异质改动的惯例与代价

- **共识=禁止混合**：「refactor 与 behavior change 混在一个 PR」是最常见最有害的反模式——审阅者无法回答「行为变更是故意还是重构失误」；固定次序=先重构（声明行为恒等）后行为变更（youngju.dev 2026-05 全文）。本题 A 包全部=行为恒等/结构文档面，B=行为变更——恰构成标准拆分对。
- Meta/Google 十年 stacked diffs 深层理由：小而单一主题变更单元才能被独立测试/审查/回滚（Pragmatic Engineer 2023 一手证言）；GitButler 多栈分支=这套惯例原生载体。
- **原子性关键检验=回滚粒度**：B 出问题需 revert 时，混在 A 里会连带回滚文档/registry 状态（HN stacked PRs 反复出现 rollback 论证）。
- **代价与反例**：过度拆分有协调成本（squash 重审批/栈工具 bug/rebase 地狱，栈深>5 管理成本急升）——但 A+B 不是依赖栈是两个并行独立主题，拆开成本=一次性立票非持续 rebase 税。
- **反向用「feature+测试同 idea」**：B 的 schema 改动、golden 更新、覆盖率恒等式必须同窗，不可把 golden 拆出去；B 票虽大主题上仍是一个 idea。
- **判据=主题一致性非改动类型一致性**：A 包内五件事同属「发布门面/致谢收口」一个主题同窗合理；若把 A 再拆 4 窗=过度拆分。

### ② 非门禁调度回归红的紧迫度惯例

- **分类学（多源交叉）**：cicd.watch 三分法——healthy/flaky/broken；「单一失败是数据点不是类别」；broken（一贯红近期窗口无绿）→修测试或修代码二者必居其一没有第三选项。本题 git 腿=broken 类非 flaky。
- Google/Fuchsia flake 政策（官方已读）：「先移出关键路径再离线修复——不在 CQ 边跑边修让其他贡献者承受不可靠信号」；「flake 不因移出 CQ 而被忽视，是必须修的真问题」。映射：非门禁调度红=**立刻立票+限期，而非立刻抢修，也绝不允许烂着**。
- minware quarantine gotchas：隔离变墓地/失去可观测性=两大陷阱→隔离/延期必须有 owner+deadline（minware 建议 30 天未修即摘除；Google 惯例一个 sprint 内）。
- 腐红常态化机制：「红是常态」→滑向 suppress 而非 fix、重跑试试成标准操作、CI 信号信任崩塌；红腿拖延真实代价=DORA 全链路通胀（lead time/change fail rate/恢复时间全被污染）。
- **分界线判据**：哨兵检出 vs 腐红不在红多久而在三件事——(1) 失败是否有 owner 与 deadline；(2) 失败原因是否已分类（真实缺口 vs 环境/flake）；(3) 是否列进 sprint 而非 backlog 泥潭。本题红腿已正确分类（哨兵检出真实缺口、非门禁），满足「已诊断」只缺 owner+deadline。
- **紧迫度正确刻度**：broken 类非门禁红≈优先级高于一切非主题工作但不打断进行中主题窗——SLA=「本迭代内+带 deadline 立票」非「立即放下一切」（十分钟修复惯例针对门禁红/阻断 merge）。

### ③ 推荐与判据

判据表：主题一致性（A=发布门面一个 idea；B=intake 契约行为变更一个 idea）｜回滚原子性（revert A 不碰引擎；revert B 整体回滚+golden 同步回退）｜审查信噪比（A 零负担行为恒等；B schema+golden+恒等式同窗互证）｜红腿归属（塞 A=伪装；git 腿红因恰是缺 B，修 B 即修红）。

- **驳 (b)**：A+B 同窗正中 mixed-PR 最强反模式；B 的 golden/schema 同 idea 不可拆而红修依赖 B 的 schema——同窗必然把 B 整体拖进，A 审查被 ~800 行 schema diff 淹没（youngju.dev ~500 行 effectively-unreviewed 悬崖）。
- **驳 (c) 并吸收**：红修优先对门禁红成立（十分钟惯例），对非门禁 broken 红只成立「限期立票」部分；完全暂停 A 去 (c)=拖延零风险文档包无质量收益纯机会成本。(c) 合理内核「红不能烂」由 B 的 deadline 承接非打断 A 承接。
- **(d) 正规第三态**：若 B 本迭代排不上，正确动作非混窗而是按 Fuchsia 政策给红腿**显式已知问题登记**（xfail/跳过标记+tracking issue+deadline）——调度回归「显式豁免红」而非「常态红」，保持信号诚实。
- **牵强处自查**：①无直接「审计仓门面混合」专门研究，由通用 PR 卫生惯例外推但方向保守（审计仓可信度=产品面，业界只会更严格）；②「B 立即开工」在单人/低带宽情境可能退化空头票→此时启用显式豁免第三态而非硬撑并行；③Google trailing-gap（Strategy B 落地后追修）理论支持「红着先干活」但以自动化二分+自动 revert 基建为前提，本仓无此基建不构成有效反例。

## 3) 对比矩阵

| 选项 | 主题一致性 | 红腿处置 | 回滚原子性 | 主要风险 |
|---|---|---|---|---|
| (a) 修正版 | ✅ A/B 各一个 idea | B 票限期承接 | ✅ | B 若空转需显式豁免兜底 |
| (b) 混窗 | ❌ mixed-PR 反模式 | 顺带修 | ❌ 连带回滚 | 审查信噪比崩、行为变更伪装 |
| (c) 红修优先 | ✅ | 立即 | ✅ | 打断零风险门面包=纯机会成本 |

## 4) 来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Authoring Reviewable Pull Requests | youngju.dev/blog/culture/2026-05-14 | Community/批评 | One PR=one idea、mixed-PR 反模式、审查尺寸悬崖（全文已读） |
| 2 | Two CI strategies to keep main green | blog.theopnv.com/posts/2026/07/blocking-vs-chasing-failures | Comparative | true/green head 模型、Google Strategy A/B、NRSR（全文已读） |
| 3 | Pipeline stability: healthy/flaky/broken | cicd.watch/learn/pipeline-stability | Official 分类学 | broken/flaky/healthy 三分类、腐红机制、DORA 通胀（全文已读） |
| 4 | Fuchsia Flaky Test Policy | fuchsia.googlesource.com | Official | 「先移出关键路径再离线修」、flake 不因移出被忽视（全文已读） |
| 5 | Flaky Test Quarantine | minware.com/guide/best-practices/flaky-test-quarantine | Official 指南 | 隔离 gotchas：墓地化、30 天摘除规则、信号掩蔽（全文已读） |
| 6 | Stacked Diffs | newsletter.pragmaticengineer.com/p/stacked-diffs | Community | Meta/Google 十年拆分惯例一手证言（全文已读） |
| 7 | HN: Stacked PRs live on GitHub | news.ycombinator.com/item?id=49112232 | Community/批评 | 拆分协调成本反例（全文已读） |
| 8 | Continuous Integration (growsmethod) | growsmethod.com | Official | 十分钟修复惯例针对门禁红（404 仅搜索摘要未计入已读） |
| 9 | SafeRevert (Google Research) | research.google/pubs/saferevert | Official | 大规模仓 broken change 自动处置研究（摘要佐证未全文） |

## 5) 信息缺口

- 无直接针对「文档/门面 vs 引擎行为同窗混合」专门研究——由 One-idea 惯例外推（结论已标注）；
- Tavily 第三引擎缺席（配额耗尽），双引擎+7 次原文核验补足；
- growsmethod 原文 404，十分钟修复惯例经转引佐证。
