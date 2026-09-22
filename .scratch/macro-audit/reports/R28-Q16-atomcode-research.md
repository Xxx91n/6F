[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
开始 R28-Q16 深调研。先召回知识库（D-060/D-104/D-106/D-116 相关），再启动三引擎广搜。知识库已召回 D-060/D-106/D-107 相关背景。现在第一阶段：三引擎、五角度并行广泛搜索。Tavily 配额已超限（记录为引擎缺口），继续用 Exa+AnySearch 双引擎补齐其余角度，并开始定点抓取原文验证。继续第二阶段：定点深挖已命中的一手信源，并补足批评/时效/社区角度。继续定点深挖：抓取微软官方 shadow testing 指南与 oracle 问题的批评面材料，并补 (b) 双实现漂移代价角度。继续定点深挖：抓取 Diffy（双实现 parity 的噪声过滤惯例）与 Csmith 原文（异常输入 oracle 处理），补齐 (a) 与 ⑤ 的取证。补齐关键一手信源：Diffy（shadow diff 工具，含 noise 过滤惯例）原文 + 补一个「expected divergence 分类」搜索。抓取最后两个关键原文：Diffy 的噪声过滤惯例与 differential fuzzing 的分歧语义。补一轮知识库核查 D-104/D-116，然后合成最终报告。配额自查：searches: 11（web_search 5 + anysearch 6）| angles: 官方／对比／批评／时效／社区 全五类 | full reads: 7（iterasec、langsec SPW23、opentofu equivalence-testing、Microsoft 工程手册、helpmetest-Diffy、fuzze.rs、Csmith）| gaps: Tavily 配额超限（该引擎缺席，已用 Exa+AnySearch 双引擎兜底）；Diffy 官方 repo 直接 URL 404，改用二手详述文＋微软手册交叉验证。现在综合输出。

---

# R28-Q16 调研报告：独立对照物在病态输入上的 parity 语义

## 1) 执行摘要（Tl;dr）

**推荐 (a)：处置感知 parity 矩阵——比对按 disposition 分流，`cli=quarantined × 39结果` 判分歧类别（预期分歧记档 / 可疑一致 warn），39 端不做 quarantine 分类器、病态实例不排除出比对面。** Confidence **高**。判据：①工业界 differential testing 的心智模型从来不是「分歧=失败」，而是「分歧=信号，需 triage 分类」——fuzze.rs 把分歧 triage 明确分为「一方错/双方错/spec 歧义」三路，本仓「39 也判病态=预期分歧记档」正是其直译；②「一方报错一方产出」在 LangSec/parser differential 界被公认为**最强信号而非噪声**（T-Reqs、HDHUNTER、Dartmouth parser differential survey），(c) 排除 quarantined 实例等于把对照物价值最大的输入面主动致盲，与安全界共识直接相反；③「可疑一致」（39 产出与 cli 本应值相同）正是 Diffy 的 noise-baseline 心智模型的反面应用：正常实现链路对病态输入应当**不产出好值**，产出好值=双实现共享了同一错误假设——这是 differential fuzzing 文献里「both wrong the same way」盲区的可观测代理，(a) 独有而 (c)(d) 完全丢失。

## 2) 分点结论

**① 双实现/影子管线的惯例：分歧不是失败，是待分类的信号（支撑 a 的矩阵分流）**
- Wikipedia/differential testing 综述（GI 讲义）：任何不一致「marked as a potential bug」，但综述明确比较阶段要做 triage——「collect all divergences, then cluster by root cause；不要在第一个分歧处停止」。→ 分歧分类矩阵是标准做法，不是发明。
- fuzze.rs（2026-07，一手 harness 文）：分歧 triage 三分类——①spec 无歧义→一方 over/under-permissive 是 bug；②spec 有「implementations MAY」→spec 歧义，记档而非 bug；③「both wrong the same way」→差分法盲区，需独立手段补。→ 本仓 (a) 的「预期分歧记档」=第②类，「可疑一致 warn」=对第③类盲区的工程化探测。
- Csmith 官方：任何输出差异=「bug in gcc or clang, or in Csmith itself」——即分歧 triage 里**对照物自身也可能在被告席上**，矩阵需允许「39 解析器也错」这一格。
- 微软工程手册 shadow testing：shadow 的目的就是「monitoring and capturing differences then compare」，比对面覆盖全部复制流量，不含「异常输入除外」条款。

**② 「一方报错一方产出」的处置惯例：这正是 parser differential 的核心资产（支撑 a，直接证伪 c）**
- T-Reqs（CCS 2021）/HDHUNTER（USENIX Sec 2025）/Gudifu：HTTP request smuggling 的检测原理就是**两个解析器对同一段字节产出不同结果（含一个报错一个接受）**——分歧是可利用缺陷的直接证据，全行业主动构造这类输入去找分歧。
- Dartmouth「A Survey of Parser Differential Anti-Patterns」（LangSec SPW23，一手）：parser differential 「sometimes even independent modules, which may individually appear bug-free」——**独立模块互核正是暴露单侧无法自见的分歧的唯一手段**。
- Iterasec（2025-11）：缓解建议第 6 条「Conduct comprehensive multi-parser testing: test critical inputs against **all** parsers involved」——且特别强调病态/边缘输入正是分歧藏身处，「automated scanners show no findings」的地方。→ (c) 把 quarantined 实例排除出 parity，等于把「critical inputs」从多解析器测试面里删掉，方向与安全界完全相反。
- LangSec 总纲：病态输入上的行为分歧是攻击面的定义性特征；对照物在此的价值最大（题面已述，信源一致支持）。

**③ 「预期不一致」的表达惯例：排除清单/分歧分类而非比对面删除（支撑 a 的矩阵设计，驳 c 的实现方式）**
- OpenTofu equivalence-testing（官方工具，一手）：golden 比对内建 `IgnoreFields` + `Rewrites`——**预期差异表达为比对器内的显式豁免条目，而不是从测试语料里删用例**。→ 本仓等价物：quarantined 实例保留在 parity 面，其分歧以「预期分歧类别」条目显式登记（复用 R28-Q11 的 known-gaps 双册形态可顺接）。
- Diffy（Twitter/Airbnb/字节生产使用）：三实例比对 + noise baseline + 「mark as expected」字段级排除；关键指标是 **critical differences = 差异 − 噪声**，噪声 learning 自「两个相同实现互比」。→ 启示：本仓 (a) 的「可疑一致 warn」可理解为反向 noise baseline——病态输入上 39 端产好值不是噪声，是比噪声更值得查的反常。
- PHPUnit golden-master 惯例（社区）：expected diffs 以规范化函数过滤，未覆盖的差异**仍然 fail**——预期豁免必须枚举显式，兜底是失败不是沉默。→ 矩阵未预见的组合格应 fail/loud，不应静默通过。

**④ 辩证：(b) 双实现漂移 vs (a) 矩阵完备性负担 vs (c) 失明代价**
- (b) 双份规则漂移：fuzze.rs 明言「cost of the second implementation——有时值得（conformance-grammar 场景），有时不值得」；关键判据是第二实现是否承担独立 oracle 职责。本仓 39 个脚本**已经是独立实现**——39 端不需要「实现 quarantine 分类器」，只需要在矩阵里作为「观察到的行为」被分类。(b) 若指 39 端再加一套分类逻辑，则落入 DRY/单一真源反模式（本仓 2026-09-18 已有先例裁决：「双实现 + parity 测试：否决——债还在，只是加报警器」）。规则真源在 cli 端（D-103 三态分类器），39 端保持独立解析职责不复制分类规则——这正是 SoD 精神，(b) 破坏之。
- (a) 矩阵完备性：真实负担存在——fuzze.rs：「canonicalisation is THE hard part… expect to revise it several times」。化解法是行业惯例：未枚举组合格默认 **fail loud**（PHPUnit 兜底语义）+ 分歧类别登记册随新组合迭代（OpenTofu IgnoreFields 的演进方式）。矩阵是 2×3 级别的小矩阵（cli 两 disposition × 39 三类结果），不是组合爆炸。
- (c) 失明代价：以上 ② 的全部文献反证；另外 oracle 问题文献（CsmithEdge、metamorphic testing false-positive 文）指出差分法在异常输入上的噪声确实更高，但这用「分类」解决而非「排除」解决——exclusion 是把信噪比问题错误地当成了覆盖问题。

## 3) 对比矩阵

| 选项 | 病态输入上的信号面 | 分歧语义 | 实现面成本 | 与 D-060 SoD 精神 | 判定 |
|---|---|---|---|---|---|
| (a) 处置感知 parity 矩阵 | **全保留**：quarantined 实例仍在比对面，分歧分类记账 | 分歧=分类信号（预期记档/可疑 warn/未预见 fail loud），标准 differential triage 惯例 | 小矩阵＋登记册迭代 | 保留独立实现互核，39 端不复制分类规则 | **推荐** |
| (b) 39 端独立实现分类器 | 全保留 | 双实现互核最强 | 双倍实现面＋双份规则漂移（违反本仓既有「双实现否决」裁决） | 破坏 SoD——分类规则复制到对照物 | 否决 |
| (c) 排除 quarantined | **失明**：恰好删掉对照物价值最大的面 | 只剩 clean 面，异常分歧不可见 | 最小 | 名义保留实际致盲 | 否决 |
| (d) 仅协议级覆盖 | 字段级病态完全不入 parity | 同 c | 最小 | 同 c | 否决 |

## 4) 冲突核查（对本仓既有决策）

| 决策 | 冲突？ | 说明 |
|---|---|---|
| D-060 golden parity（audit 侧车字段 ⊆ 39 复跑产物） | **不冲突，是收窄条件的精确化** | (a) 把「⊆」在 quarantined 实例上从「值相等」改为「结果落入预期分歧类别也计 ⊆」——这是对病态输入上新事实的登记，不是改向 |
| D-106 grain＝逐病态字段事件 | 不冲突 | 矩阵以 quarantined 事件为分流键，grain 不变 |
| D-107 恒等式三桶库内重算 | 不冲突 | parity 矩阵是 39 对照面语义；恒等式是库内对账面，正交 |
| D-104 known-gaps 双册层级（R28-Q11） | **可顺接** | 「预期分歧类别」条目落 known-gaps 册（owner/status/证据五要素齐备），registry 不复制语义字段——与已裁决形态一致 |
| D-116 恒等式验证执行面 | 不冲突 | 正交维度 |
| 本仓 2026-09-18「双实现+parity=否决」先例 | **支持排除 (b)** | 同一裁决逻辑直接适用 |

无需要 revised 的静默改向。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | Differential Testing（GI 讲义综述） | https://dl.gi.de/bitstreams/3449b9a4-741c-4774-a294-f39d6f6ff0f9/download | Official | — | 差分测试管线与 triage 阶段定位 |
| 2 | Differential testing - Wikipedia | https://en.wikipedia.org/wiki/Differential_testing | Official | — | 「任何不一致=潜在 bug」基线语义 |
| 3 | T-Reqs: HTTP Request Smuggling with Differential Fuzzing | https://doi.org/10.1145/3460120.3485384 | Official（论文） | 2021-11 | 解析器分歧=安全信号的一手系统化 |
| 4 | HDHUNTER / Gudifu（USENIX Sec'25） | https://www.usenix.org/system/files/usenixsecurity25-mu.pdf | Official | 2025 | 多实现差分 fuzzing 的当代状态 |
| 5 | A Survey of Parser Differential Anti-Patterns（LangSec SPW23） | https://langsec.org/spw23/papers.html | Official | 2023-05 | 独立模块互核暴露单侧不可见分歧 |
| 6 | Understanding Parser Differential Vulnerabilities | https://iterasec.com/blog/understanding-parser-differential-vulnerabilities/ | Comparative | 2025-11 | 「critical inputs against all parsers」缓解惯例 |
| 7 | Compiler Validation via EMI | https://www.cs.ucdavis.edu/~su/publications/emi.pdf | Official | 2014 | 差分 oracle 的替代视图与 UB 排除前提 |
| 8 | Csmith 官方 README | https://github.com/csmith-project/csmith | Official | — | 「分歧=三者之一有 bug」triage 三方性 |
| 9 | OpenTofu equivalence-testing | https://github.com/opentofu/equivalence-testing | Official | — | 预期差异=比对器内显式豁免条目惯例 |
| 10 | Microsoft Engineering Playbook: Shadow Testing | https://microsoft.github.io/code-with-engineering-playbook/automated-testing/shadow-testing/ | Official | 2024-09 | 影子比对覆盖全流量、无异常输入豁免 |
| 11 | Diffy shadow-mode 详解 | https://helpmetest.com/blog/diffy-shadow-mode-testing/ | Community/二手 | 2026-05 | noise baseline、critical differences、mark-as-expected |
| 12 | Differential Fuzzing — Catching Spec Bugs by Disagreement | https://fuzze.rs/blog/differential-fuzzing | Community/技术文 | 2026-07 | 分歧 triage 三分类＋canonicalisation 维护负担 |
| 13 | CsmithEdge（EMSE） | https://link.springer.com/article/10.1007/s10664-022-10146-1 | Criticism | 2022 | UB/异常输入是差分 oracle 的已知噪声源，处置=精化非排除 |
| 14 | 正则方言差分测试的 oracle 问题 | https://arxiv.org/html/2603.00311v1 | Criticism | 2026-02 | 方言分歧→假阳告警的处理讨论 |

（注：3、4、7、13 未整页抓取原文 PDF，摘要来自搜索引擎返回的论文正文节选，已在文中按节选内容使用，未超出节选范围作断言。）

## 6) 信息缺口

- **Diffy 官方一手文档**（opendiff repo）直接 URL 404，噪声过滤/expected 标记机制经微软手册＋helpmetest 二手交叉验证，一手未直接读到——对本仓无阻塞（机制语义已双源）。
- Tavily 引擎本轮配额超限缺席，「shadow testing 数据管道 quarantine 对账」的垂直检索仅 AnySearch 单引擎覆盖，未获第三源独立复证——但该角度结论（比对面不剔除异常输入）已由 5+ 独立源支撑。
- 未找到与「39 脚本独立复跑对照物」完全同构的公开先例（最接近的是 shadow testing + parser differential 的组合），(a) 的「可疑一致 warn」一格是文献惯例的组合应用而非单一直接先例——此为设计创新点，报告时如需标注证据强度应单列。

**裁决呈报**：推荐 **(a)**，附三点形态约束——①矩阵未枚举的组合格默认 fail loud（PHPUnit 兜底语义）；②「预期分歧类别」条目落 known-gaps 册（D-104 形态），不进 registry；③39 端零代码改动、不引入 quarantine 分类逻辑（SoD 保持）——与 D-060/D-104/D-106/D-107/D-116 及本仓「双实现否决」先例零冲突，置信高。

继续此会话，运行：atomcode -p "…" --resume adbc63fd-a724-49ec-b5fd-c082a41f1780
