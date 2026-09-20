# R23-Q1 atomcode 调研报告——「恒真不可证伪」候选族的制度面落点

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R23-Q1-research-prompt.md
> 运行：2026-09-19 · atomcode 串行单发 · 9 查询×3 引擎（Exa 2/Tavily 2/AnySearch 3）· 角度=Official＋Criticism＋Comparative＋Currency＋Community · full reads 5 成功＋1×403 换源 · domains 7（chromium.googlesource.com、trunk.io、jestjs.io、github.com、washington.edu、stackoverflow(403 换源)、pypi.org）· 关键结论均 ≥2 引擎或 ≥2 独立信源交叉 · 本地账本面读全（D-070/D-071/D-073/D-074 原文＋22 轮收口注记）

## 1) 执行摘要（Tl;dr）

**推荐 (b)：新立 D-079 独立候选族判据**，输入面=FAIL∪恒真候选＋引用物缺席普查，配套 sibling-dependency grep 机检探测、恒真二值判定口径（VACUOUS/NOT-VACUOUS）、39-F2 走「删除＋探测证据留痕」而非 XFAIL 或裸删。核心依据：恒真件的病根（分拣输入=FAIL 集，恒真件不 FAIL 不进视野）是**分拣机制的盲区**，不是 13 件册外断言处置（D-073）的措辞缺口——勘误注记（a）承载不了新判据族。Confidence：**高**（39-F2 实证在案＋四个独立工业先例交叉＋仓内 D-074③ 已有 anti-vacuous 自检先例可承接）。

## 2) 分点结论

1. **恒真/vacuous test 是被工业界命名并独立治理的缺陷类，不是 FAIL 噪声的子类**。vacuous 工具（2026 新出，tree-sitter 静态检测）将其分为 no-assertions／constant-assertion／swallowed-failure／unreachable-assertion／patched-target-under-test 五型，并实测「约 2% 的真实测试永不失败」；其 README 点名 pytest 官方拒绝为此加 flag（issue #2706）正是「恒真件不 FAIL、靠既有失败驱动分拣永不入视野」的同型佐证。

## 3) 对比矩阵

| 候选 | 制度面位置 | 工业先例吻合度 | 主要否决理由 |
|---|---|---|---|
| (a) D-073 勘误注记就地扩判据 | 旧决策内扩义 | Chromium＝分文件不就地扩；ADR 惯例=immutable+supersede | 勘误惯例（D-044/D-055 先例）语义=措辞写实/收窄，非承载新判据族；D-073 病根面（册外存量）≠本案病根面（输入面盲区） |
| **(b) 新立 D-079 独立候选族判据** | 新 D 条目＋守卫新探测 pass | vacuous 静态检测＋jest obsolete 主动报告＋Chromium 分文件——三先例全指向「独立载体＋机检探测」 | 成本：需先做断言级 id 盘点（但这是 D-071 已登记的欠账，顺带偿还） |
| (c) 拒扩走删除/XFAIL | 分拣输出处置 | 裸删撞 D-044 禁行；XFAIL 语义错配 | XFAIL=「预期失败的行为缺陷」，恒真件不失败无 XPASS 自清信号，strict 机制对它失效（D-071② 失效域）；且 (c) 是输出处置不是判据落点，未回答「下一件恒真怎么进视野」 |
| (d) 挂触发器缓办 | registry event_bound | 适用于「无实证、待信号」情形 | 39-F2 已实证 fired 信号（审计已抓到一件），实证在案时缓办=接受盲区继续漏；触发器只能作为 D-079 之后的复发盯梢件（部分吸收） |

## 4) 落地形态（D-079 建议骨架）

### 4.1 恒真探测机制（sibling-dependency grep 普查）

- **探测 pass**（建议挂 xfail-run 同层或独立 NN-check）：对每条断言 id，从其断言源抽取「期望引用物清单」（外部 workflow 文件路径、golden 文件、registry 条目、sibling 仓路径等）→ grep 引用物存在性；机检输出新行形制 `VACUOUS-CAND <id> (referent-missing: <path>)`，与 SEALED 行同构顶显。
- **二值判定口径**（沿 D-076③ 防安慰剂纪律：判定必须二值事件禁程度副词）：
  `VACUOUS ⇔ (引用物存在性=缺席) ∧ (该断言执行历史零 FAIL 记录)` —— 两条件皆可机检；任一不成立即 NOT-VACUOUS。
- **置信分级**（vacuous 工具先例）：结构级（certain，引用物路径从断言源机械导出且缺席）→ 自动入候选清单；判断级（likely，路径可能漂移/另有锚）→ 人工裁决留痕（45-H5 前提勘误先例）。
- **探测器自身防恒真**（mutation verify 先例）：普查 pass 需含一条自检——注入一个已知「引用物缺席」的合成断言，验证探测器能抓到（anti-vacuity positive control，D-018 正对照心智）。

### 4.2 候选清单

- 建议载体=**独立 vacuity-manifest（或并入 stale-assertions.json 增 status=vacuous 枚举，票面二选一裁决）**；条目字段：id／guard／referent-path／探测证据／confidence（certain|likely）／disposition／decision——沿 stale-assertions.json 已有 schema（D-071①）最小扩展。
- 39-F2 为**首个实证条目**；全量候选须跑一次普查（30 个 NN-check 守卫），首轮预计产出即为「盲区存量盘点」。

### 4.3 39-F2 处置

- **删除断言＋attestation 式留痕**（禁裸删——D-073 已有「无留档裸删撞 D-044 禁行」先例）：留痕行记 {id, guard, referent-missing 证据（grep 输出/commit SHA——jiahao workflow 撤除在 origin/main 的 2755bf35）, disposition=vacuous-deleted, decision=D-079}。语义=「守卫对象已被合法撤除，断言对象消亡」——jest obsolete snapshot 的「主动报告并退役」处置。
- **不走 XFAIL**：不失败无 XPASS 自清信号；**不走 sealed**：sealed 语义=「验收时 fired 过、使命完成显式退役」（D-073③），39-F2 从未 fired，attestation 的 fired_at 字段填不了——恒真件退役证据是「探测实证」非「fire 实证」，这正是需要 D-079 独立判据的根因。

### 4.4 与既有机制的关系（划界注记义务）

- D-073 管辖：**曾经 FAIL/册外存量**的三态分拣（active/XFAIL/sealed）——输入=FAIL∪册外。
- D-079 管辖：**从未 FAIL 且不可能 FAIL** 的恒真候选——输入=引用物缺席普查结果。
- 两轨共用：attestation 形制（append-only jsonl，D-073④/D-077④ 同款）、33-check 元校验位、断言级稳定 id（D-071② 前置条件）。

## 5) 失败模式

1. **假阳性淹没**：引用物路径重构后断言另有锚 → 普查爆红。治理：certain/likely 分级＋only-certain 默认（vacuous --min-confidence 先例）＋baseline 惯例（存量记录一次，只拦新增）。
2. **VACUOUS 态膨胀为新垃圾桶**：候选清单条目堆积无人处置 → 重演 cap=10 陷落。治理：清单带 cap＋复审锚＋逾期报警（D-071④ 同款元校验）；超 SLA → fix or delete（Trunk SLA 纪律）。
3. **探测器自身恒真**（守卫守卫者也要被守）：普查逻辑写错恒零输出 → 永远「无恒真候选」假绿。治理：positive-control 自检断言（4.1）。
4. **勘误膨胀**：若错采 (a)，D-073 会从「13 件批量处置」膨胀为承载探测机制+候选清单+二值口径的巨型条目——违反注记惯例的本意（D-064 已登记「防勘误膨胀：本批为同日滞后集中清算非常态」）。
5. **删除丢历史证据**：39-F2 相关审计链（jiahao 撤除史）散落多账本 → 留痕行内嵌 evidence 指针（D-044 链路惯例）。

## 6) 冲突核查（逐条 D-xxx）

| D | 核查结论 |
|---|---|
| D-073 | 兼容。D-073②「判据可机检（sibling 依赖 grep）」原文已内嵌引用物普查思想；D-079 是其输入面盲区的补全非改向。需划界注记：D-073 分拣输入=FAIL∪册外；D-079 输入=恒真候选（正交病根）。D-073⑦「环境敏感腿另题处置」不适用于 39-F2（非 env 腿，是引用物消亡腿） |
| D-071 | 兼容但需一行划界：XFAIL 语义（预期失败的行为缺陷）对恒真件失效——恒真件不产生 FAIL/XPASS 任何信号，strict 机制无着力点；断言级 id 盘点欠账（D-071 缺口登记）由 D-079 普查顺带偿还 |
| D-074 | 强支持。D-074③ fixture 自检断言「审计确实产出了 facts」**就是仓内首个 anti-vacuous 先例**——D-079 是该手法从单测试到守卫族的制度化推广 |
| D-070 | 兼容。(a) 若采将与 D-070 注记惯例冲突（注记承载对象=残余观察项就地勘误，非新判据族载体） |
| D-041 | 兼容。(d) 若采作复发盯梢须过五要素（owner/事件/验证方法）；首件实证在案故触发器只配作 D-079 落地后的复发门，不能替代处置 |
| D-044 | 兼容。39-F2 删除须 append-only 留痕，attestation 行双锚（账本↔manifest）沿用 |
| D-063 | 兼容。本轮=制度面判据扩展（新决策）非案卷级翻案，不触碰「审计件冻结」口径 |
| D-076 | 兼容且被其加固：③「判定口径必须二值事件禁程度副词」直接移植为恒真二值口径的合法性来源 |
| D-037 | 兼容。manifest schema 扩展沿 D-048 枚举扩容先例走版本化 |
| D-058 | 兼容。探测=确定性机检归守卫层（kernel 侧），不涉 agent 编排 |

零 revised 候选——(b) 与全部 current 决策正交或互补；唯一状态变更需求=D-073 加一行划界注记（成对落盘惯例）。

## 7) 信息缺口

1. **恒真候选族全集未知**：39-F2 是审计抓到的一件；30 个 NN-check 守卫的引用物存在性普查未跑，存量规模（可能 0~数件）影响 D-079 票的 cap 设计与优先级（P1/P2）。
2. **引用物抽取规则未盘点**：从断言 slug → 期望引用路径的映射表是机检前提，需断言级 id 盘点（D-071 已登记的欠账）先行。
3. **候选清单载体二选一未裁**：独立文件 vs stale-assertions.json 扩 status 枚举——后者少一文件但混两种语义（XFAIL=预期失败 vs VACUOUS=不可证伪），前者干净但多一份 cap 管理。留票面。
4. **零 FAIL 历史的取证方式**：「该断言执行历史零 FAIL」目前靠守卫跑批日志；日志保留窗口与取证口径未核。

## 8) 建议追问（呈用户）

1. **载体裁决**：vacuity-manifest 独立文件 vs 并入 stale-assertions.json 扩枚举？（推荐独立——语义二分更干净，Chromium 分文件先例同构）
2. **D-079 优先级**：P1（随 #65 实施轮顺带）还是 P2？（存量普查结果出来前建议 P2，39-F2 单件先走删除留痕）
3. **likely 级候选处置**：人工逐件裁决（45-H5 先例）还是挂 manual_watch 触发器积批处理？
4. **普查执行时点**：与 D-071 缺口登记的「断言级 id 盘点」合并一轮做（省一次全守卫扫描）？

## 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | vacuous（GitHub README） | https://github.com/MahdiAlani/vacuous | Currency/Official | 2026（v0.1.1） | 恒真五型分类、certain/likely 分级、baseline 惯例、约 2% 真实率、verify mode |
| 2 | vacuous v0.1.1（PyPI） | https://pypi.org/project/vacuous/0.1.1/ | Official | 2026 | 交叉验证 #1 分类与退出码语义 |
| 3 | Chromium Web Test Expectations and Baselines | https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/testing/web_test_expectations.md | Official | 现行 | 「永不 pass 的 test 应删除」＋NeverFixTests＋StaleTestExpectations 分文件处置（原文已 fetch 核验） |
| 4 | Chromium Expectation Files | https://chromium.googlesource.com/chromium/src/+/main/docs/testing/expectation_files.md | Official | 现行 | Pass/Skip 等期望语义全集 |
| 5 | Equivalent Mutants in the Wild（ISSTA 2024, UW） | https://homes.cs.washington.edu/~rjust/publ/equi_mutants_ems_issta_2024.pdf | Academic/Criticism | 2024 | RIP 三分类、等价 mutant 中位率 2.97%、静态归因可行性 |
| 6 | Eradicating flaky tests（Trunk） | https://trunk.io/blog/eradicating-flaky-tests | Community/Official | 2025-03 | quarantine→SLA→disable/delete 流水线、「隔离不是终态」（原文已 fetch 核验） |
| 7 | Datadog Flaky Test Management | https://docs.datadoghq.com/tests/flaky_management | Official | 现行 | 「30 天未修自动 disabled」政策引擎先例 |
| 8 | Jest Snapshot Testing（官方档） | https://jestjs.io/docs/snapshot-testing | Official | 现行 | CI 不自动写快照、obsolete 主动报告纪律（tavily 原文核验） |
| 9 | What are obsolete snapshots（Stack Overflow） | https://stackoverflow.com/questions/57793527/ | Community | — | obsolete snapshot 社区共识（403 换源） |
