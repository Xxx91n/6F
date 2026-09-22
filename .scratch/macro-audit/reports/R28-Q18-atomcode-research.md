[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
Tavily 已超额，改用 Exa + AnySearch 双引擎继续。第二轮：git 官方测试惯例、fuzzing 官方文档、parser 测试套件、differential oracle。第二轮已覆盖 git 官方测试、fuzzing 官方文档、HTML5 测试套件、differential/metamorphic 学术源。现在定点深挖原文（配额 2：≥6 次 web_fetch）。继续定点深挖：t1060 走 googlesource 镜像（github 429），另抓 git hash-object 官方文档、LibFuzzer 文档、intramorphic/differential 论文页。配额已基本达成，最后补一轮交叉验证（fast-import 造对象 + OSS-Fuzz seed corpus 惯例），然后综合。调研材料已足额。最后核查本仓决策账本中相关 D 决策原文，做冲突核查。# R28-Q18 深调研报告：quarantine 覆盖载体——合成病态 fixture vs 真仓病态样本

> **Sufficiency Gate**：searches: 11（Exa 5 / AnySearch 4 / Tavily 2 超额失败如实登记） | angles: Official＋Criticism＋Comparative＋Community＋Currency（五类全覆盖） | full reads: 8（git-hash-object 官方档、git t1060-object-corruption.sh 原文、html5lib-tests tokenizer README、LibFuzzer 官方档、OSS-Fuzz ideal-integration/efficient_fuzzer、alphaxiv Intramorphic Testing、justonepixel golden tests、DataEngineer Academy synthetic data） | gaps: 见文末

---

## 1) 执行摘要（Tl;dr）

**推荐 (d) 双层：合成病态 fixture 仓做可编程正对照骨架 + 真仓腿做构造偏差兜底。** Confidence：**高**。理由：① 工业界四方先例全部收敛于同一心智模型——git 自身在 t1060-object-corruption.sh 里手工构造损毁对象（corrupt_byte/rm/mv）做合成 fixture，OSS-Fuzz 要求 seed corpus「有效+无效混合、进版本控制、持续用真实 bug 输入扩展」，libFuzzer 官方明确 seed corpus 应同时包含 valid 和 invalid 输入；② (b) 单靠真仓在 (a) 四族词表中已有实证死区——D-104 已认定「author/UTF-8/嵌分隔符无观测实例、判据不可立法」，真仓腿对大半词表族**结构性**给不出覆盖；(c) 单元级字节串绕过采集/解析链，连 git 自己都不这样做（t1060 在真实 loose object 文件上动字节）。**但合成件必须明码标注为「正对照/响应性证明」而非价值判定，且非引用负对照需独立构造**——这正好落在本仓 D-018 既有纪律内，零冲突。

## 2) 分点结论（按调研角度组织）

### ① 解析器/采集器测试语料惯例（Official＋Comparative）

**git 自身怎么造病态对象**——t1060-object-corruption.sh（已读原文，debase64 核验）给出三件套：

| 手法 | t1060 原文 | 对应本仓 (a)/(c) 判定 |
|---|---|---|
| 字节级损坏 | `corrupt_byte`: `dd of=$obj_file bs=1 seek=N conv=notrunc` 写 `\0` 进已存在的 loose object | **构造完整对象后损坏**——不走单元级字节串，走采集/解析链 |
| 删除对象 | `rm -f "$(obj_to_file ...)"` 造 missing object | 边界条件构造 |
| 错名对象 | hash 一个 corrupt blob 后 `rm good; mv bad good` ——对象名与内容不符 | 「misnamed object」族，正是手工构造才可控的病态 |
| 文件名重定向 | `git hash-object -t tree /dev/null` 造空树 | plumbing 直造，不经 commit 命令 |

`git hash-object --literally` 的官方语义（git-scm.com/docs/git-hash-object，已读原文）是决定性锚点：

> "**Allow --stdin to hash any garbage into a loose object** which might not otherwise pass standard object parsing or git-fsck checks. Useful for **stress-testing Git itself** or reproducing characteristics of corrupt or bogus objects encountered in the wild."

即 git 官方为「构造病态对象进语料」提供了**一等公民通道**——(a) 不是发明，是 git 自测的同款惯例。另一来源（git-fast-import 文档）补充：fast-import 对无效输入「terminate with non-zero exit and create a crash report」——即 fast-import 流本身也可编程构造 commit（author/committer 任意字符串可入 stream），是比 hash-object 更结构化的批量构造器。

**HTML5 解析器测试套件**（html5lib-tests，tokenizer README + WHATWG wiki 已读原文）——「de-facto standard」的实现无关共享语料，其纪律两条直接可移植：

- 输入是**手工构造的病态字节/字符序列**（JSON 里 `input` 字符串 + `doubleEscaped` 处理 UTF-16 code point——即 UTF-8 病态是**显式 fixture**而非指望真网抓到）；
- 期望断言采用「**错误计数而非错误全文**」——tree-construction README 明文「It doesn't matter what those lines are… the only thing that matters is that there be the right number of parse errors」。这给本仓 golden 契约一个低脆性范式：病态 fixture 的断言锚在「命中了哪个 reason_code 族」而非「完整诊断输出逐字节相等」。
- 格式本身自带向后兼容扩展位（"syntax allows backward-compatible extensions"）——与 D-119 open-ended 词表同构。

### ② fuzzing 界 seed corpus 心智模型（Official）

libFuzzer 官方档（已读原文）：

> "This corpus should ideally be seeded with a **varied collection of valid and invalid inputs**… The fuzzer generates random mutations based around the sample inputs… If a mutation triggers execution of a previously-uncovered path… that mutation is **saved to the corpus for future variations**."

三个可移植心智：**有效+无效混合**、**corpus 演化**（新覆盖路径的输入回存 corpus）、**-merge 最小化**（保覆盖去冗余）。OSS-Fuzz ideal-integration（已读原文）把 corpus 治理制度化：

- "seed corpus should be **available in revision control**… **regularly extended with the inputs that (used to) trigger bugs**"；
- "built with the rest of the tests — **no bit rot!**"——语料随测试一起构建，防 fixture 腐化；
- 演化来源正是**真实 bug 复现件回灌 corpus**——这就是「真仓腿喂合成语料」的官方形态：真仓病态不是替代合成件，是**增量注入**合成 corpus 的原料。

对本仓的精确翻译：真仓腿（INDIA badDate）不是 (a) 的替代方案，而是 corpus 演化机制的第一批「触发过 bug 的真实输入」——**真仓病态最终归宿是进 fixture 册并标注真实出处**，双层在 OSS-Fuzz 心智里本就是一体。

### ③ 数据管线测试惯例（Comparative＋Official）

DataEngineer Academy 综述（已读原文）给出与 (d) 完全同构的决策表：

| 测试目标 | 数据选择 | 原因 |
|---|---|---|
| 单元/schema 检查 | **Synthetic** | 快、可控、安全 |
| 业务规则验证 | Synthetic + 采样真实 | 控制性 + 真实性都要 |
| 性能/体量 | 采样或脱敏真实 | skew/timing 重要 |
| 预发布关键工作流 | **混合** | 隐藏边角只有真实数据暴露 |

关键判词（直接回答题面 (a) 的 false confidence 忧虑）："**Use synthetic test data to prove pipeline logic and guardrails. When the business risk is high, back it up with masked or sampled production data before release**"；以及 best practice 条目 "Add noise, nulls, duplicates, and broken records **on purpose**"——「故意加坏记录」正是 (a) 的定义；"Never let clean fixtures be your final proof"——但干净 fixture 不是终局证明，混合才是。

隐私/真实性张力：synthetic 从零构造（无真实记录、无 GDPR 面），masked/sampled 从真实记录来——本仓病态 commit 语料恰好**天然低敏**（commit 元数据本就公开发布），真实样本的隐私张力在本域不成立，反而是「真实样本合法性最高」的域——这进一步削弱 (b) 的隐私理由、支持直接保留真仓腿。

### ④ 「合成构造者与实现共享错误假设」的工业处理（Official＋Criticism）

这是题面最锋利的一问。文献锚点：Intramorphic Testing（Rigger & Su, arXiv 2210.11228，已读原文）——differential testing 的定义性弱点即题面所述风险："**assumes they don't share common defects**"。工业界三层对策，对应到 fixture 层：

1. **对照物三方性（Csmith 先例，本仓 D-118 已内化）**——39/40 独立对照物跑同一 fixture 件，若合成 fixture 构造有误（如「malformed」其实合法），39 端大概率按合法解析出值——**D-118 处置感知 parity 矩阵天然就是这个 oracle**：合成件进矩阵跑一轮，cli 判 quarantined × 39 产出正常值 = 可疑一致 warn，等价于「构造者假设错误」的可观测代理。**合成 fixture 不需要额外独立 oracle，接进 D-118 矩阵即是**。
2. **独立性注入在「断言构造」而非「输入构造」**——html5lib 式「错误计数」断言弱化了构造者对错误细节的假设耦合；
3. **真实样本兜底**——OSS-Fuzz「真实 bug 输入回灌 corpus」之所以制度化，正因为 fuzzer/构造器永远不能证明真实世界没有它想不到的形态。真仓腿保留即这层兜底。

(c) 被否的证据：git 自身测试从不单元级喂字节串给分类器；t1060 全部在**真实 loose object 文件**上操作。语义原因正是题面写的——绕过 zlib 解压、object 头、采集链的病态不是 quarantine 域要守的病态（D-110 oversize 的采集链上界、D-116 恒等式都挂在全链路上）。

### ⑤ fixture 可维护性/腐化（Criticism）

- justonepixel（YouTube 经验，已读原文）：golden test 三宗罪——自动再生工具让人**盲跑不看 diff**、全量断言脆于 flaky 字段、再生面不可定向。Go golden 测试实践（dev.to，5,810 个 golden file）给出工程解：**定向再生（-filter / Makefile target）+ writeIfChanged 防幻影 diff + 「迁移改机制不改内容，golden 变了=有 bug」铁律**。
- 对本仓纪律的直接含义：合成 fixture 进 golden 纪律时，**再生必须按族定向**（per reason_code 族 fixture 文件物理分立），且 fixture 件断言用 html5lib 式「族命中」弱断言替代全输出等比——防 D-114 报告呈现层的合法演进被迫连坐改 fixture。
- OSS-Fuzz "no bit rot" 判据给验证命令：fixture 构建脚本必须随测试跑（构造器坏了立刻 fail），不能是「历史手工产物躺着」。

### ⑥ 辩证

| 方案 | 风险 | 实证裁决 |
|---|---|---|
| (a) 纯合成 | 构造者与实现共享错误假设 → false confidence | 真实风险但**有现成对策**（D-118 矩阵 + 真实样本回灌），不构成否决 |
| (b) 纯真仓 | **覆盖结构性不可控**：D-104 实证三族（author/UTF-8/嵌分隔符）无观测实例；git/git 一仓的病态分布 = 上游偶然，词表大半族永无测试 | 否决——「不可控」不是理论担忧，是已发生的实证 |
| (c) 单元级字节串 | 绕过采集/解析链，oversize/协议级病态全部漏测；git 自身惯例反证 | 否决 |
| (d) 双层 | 成本：构造器 + fixture 册维护 | 成本被三处既有建制摊薄（fast-import/hash-object --literally 构造廉价、D-118 矩阵即 oracle、NN-check 守卫即 bit-rot 检测） |

## 3) 对比矩阵（候选方案 × 关键维度）

| 项 | 可编程覆盖 | 构造假设风险 | 链路完整性 | 维护成本 | 备注 |
|---|---|---|---|---|---|
| (a) 合成 fixture 仓 | 逐族+边界全覆盖 | 有（共享假设） | 全链（构造完整对象） | 中（golden 纪律） | git t1060 同款惯例；--literally 官方通道 |
| (b) 真仓腿 | 取决上游历史 | 无 | 全链 | 零 | D-104 已证大半族结构性空覆盖 |
| (c) 单元级字节串 | 分类器函数级全 | 有 | **断链** | 低 | git 惯例反对；漏 oversize/协议族 |
| (d) (a)+(b) | 全覆盖 + 真实兜底 | 对冲（D-118 矩阵+真实样本回灌） | 全链 | 中+小 | OSS-Fuzz corpus 演化心智 |

## 4) 冲突核查

- **D-018**：✅ 零冲突，且被强化。(d) 的合成件 = 正对照性质（证管线响应），**不得计入价值判定**；真判据仍是真实病态实例（INDIA）+ 未来真仓观测。建议落法：合成 fixture 的断言目标写「分类器对已知构造形态返回预期 reason_code」，属管线健康闸级别。
- **D-104**：✅ 且被解锁。D-104⑤ 触发器「出现且现有判据集无法归类 → registry 登记」——(a) 的合成件**不触发**它（合成件是已知形态的定向构造），但真仓腿持续供观测实例，两者分工与 D-104 观测驱动立法完全兼容。⚠ 一个边界要写明：**合成的 UTF-8 病态件不得反过来当 author 族判据的立法依据**——D-104 负向裁决「禁为无观测实例字段预设类别判据」不受合成件存在而改变（有构造件 ≠ 有观测实例）。
- **D-110**（strict 门禁/oversize）：⚠ (c) 被否的直接理由——字节串绕链测不到 oversize 上界。(d) 要求构造器走完整 loose object 路径（如 t1060 式 dd 大对象），与 D-110 采集链上界一致。
- **D-114**（报告呈现）：✅ 建议 fixture 断言用 html5lib 式「错误计数/族命中」弱断言，避免报告层呈现演进连坐 fixture——对 D-114 是友好化而非冲突。
- **D-116**（恒等式断言）：✅ 合成件走全链后恒等式断言自动覆盖病态输入分支——这是 (c) 做不到的免费收益。
- **D-118**（parity 矩阵）：✅ **被复用**——合成件是 parity 矩阵的天然新输入，且承担「构造者假设错误」的可观测代理角色（可疑一致 warn 格）。
- **D-119**（词表四族）：✅ 合成 fixture 的组织粒度 = 词表族（anchor_head_date_malformed / normalized_tz_offset / unclassified_field_anomaly / oversize 各一族 fixture 文件）+ 边界件（恰 N/N+1 字节、嵌定界符、UTF-8 病态），fixture 册结构直接镜像 D-119 词表结构。

**裁决：零冲突、零 revised；D-104 加一条边界注记（合成件≠观测实例，不构成立法依据）。**

## 5) 推荐（落法）

采纳 **(d)**，具体为三层：

1. **fixture 仓（构造器）**：测试语料内以 `git hash-object --literally` + fast-import stream 构造病态 commit 对象（git 官方同款惯例），per reason_code 族分立 fixture 文件，边界件显式枚举（恰 N/N+1、嵌定界符、UTF-8 病态、misnamed object、missing object——后两者抄 t1060 手法）。构造脚本随测试构建跑（OSS-Fuzz "no bit rot" 判据）。
2. **断言纪律**：html5lib 式弱断言（族命中 + 错误计数）而非全输出 golden 等比；再生按族定向；fixture 变更走与 golden 同级契约纪律。
3. **真仓腿保留为演化机制**：真仓病态（INDIA 及未来）既是构造偏差兜底，也是 corpus 回灌源——真实触发件标注出处后**同时**进 fixture 册（OSS-Fuzz「triggered-bug inputs 回灌 corpus」同款），并作为 D-018 意义上的真判据（合成件仅正对照）。合成件全量接入 D-118 parity 矩阵跑一轮作构造自查。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | git-hash-object 官方档 | https://git-scm.com/docs/git-hash-object | Official | 2.43.0（2023-11） | `--literally` 官方语义：hash garbage 进 loose object 供 stress-test——(a) 的官方通道 |
| 2 | git t/t1060-object-corruption.sh | https://code.googlesource.com/git/+/HEAD/t/t1060-object-corruption.sh（全文 base64 解码核验） | Official | master | git 自身损毁对象测试三手法（corrupt_byte/rm/misnamed）——合成 fixture 的 git 自测先例 |
| 3 | git t/README | https://github.com/git/git/blob/master/t/README | Official | — | test-lib 判定「真值验证集中于 t0000，其余隔离」的分层验证纪律 |
| 4 | git-fast-import 文档 | https://git-scm.com/docs/git-fast-import | Official | — | fast-import 无效输入 crash-report 语义；编程构造 commit 流 |
| 5 | LibFuzzer 官方档 | https://llvm.org/docs/LibFuzzer.html | Official | 持续更新 | seed corpus「valid+invalid 混合」+ corpus 演化 + -merge 最小化 |
| 6 | OSS-Fuzz ideal-integration | https://google.github.io/oss-fuzz/advanced-topics/ideal-integration/ | Official | — | corpus 进 RCS、no bit rot、真实 bug 输入回灌——双层心智的官方制度化 |
| 7 | Chromium efficient_fuzzer | https://chromium.googlesource.com/…/efficient_fuzzer.md | Official | — | 「file-format parser 用测试套件 valid 文件做 seed」——语料与测试套件共生 |
| 8 | html5lib-tests tokenizer README | https://github.com/html5lib/html5lib-tests/blob/master/tokenizer/README.md | Official | — | 手工病态输入 fixture + 错误计数式弱断言 + 向后兼容扩展位 |
| 9 | WHATWG Parser tests wiki | https://wiki.whatwg.org/wiki/Parser_tests | Official | 2013-10 | 「implementation-independent, self-describing shared tests」惯例 |
| 10 | justonepixel: Golden tests are a hassle | https://blog.justonepixel.com/growing-as-an-engineer/2024/06/22/golden-tests-are-a-hassle-to-maintain | Criticism | 2024-06-22 | YouTube 经验：自动再生盲跑、全量断言脆性——fixture 进 golden 的反面清单 |
| 11 | dev.to: Go golden 定向再生 | https://dev.to/bala_paranj_059d338e44e7e/your-go-golden-tests-dont-need-to-regenerate-everything-2o6g | Community | 2026-05 | writeIfChanged 防幻影 diff + 定向再生 + 「迁移改机制不改内容」铁律 |
| 12 | DataEngineer Academy: synthetic data | https://dataengineeracademy.com/blog/synthetic-data-for-testing-data-pipelines-when-it-helps-and-when-it-fails/ | Comparative | 2026-06-19 | 混合策略决策表 + 「clean fixture 非终局证明」判词 |
| 13 | Intramorphic Testing (Rigger & Su) | https://www.alphaxiv.org/abs/2210.11228 | Official（论文） | 2022 | differential oracle「不共享缺陷」假设的形式化——构造者风险的理论锚 |
| 14 | Google Testing Blog: brittle tests | https://testing.googleblog.com/2024/04/how-i-learned-to-stop-writing-brittle.html | Official | 2024-04 | 表达性断言 API 抗脆性——fixture 断言设计参考 |
| 15 | html5lib-tests 仓库 | https://github.com/html5lib/html5lib-tests | Official | — | 语料仓库组织形态（tokenizer/tree-construction/encoding 分立） |

**引擎备注**：Tavily 本轮 2 查均 429 超额（如实登记），三引擎交叉退化为 Exa + AnySearch 双引擎 + 本地账本；关键结论（合成 fixture 惯例、seed corpus 混合、混合策略）均有 ≥2 独立信源（官方文档 + 社区/工程实践）交叉。

## 7) 信息缺口

1. **JGit/libgit2 等再实现对 git 对象病态的处理惯例**未深挖——若未来 39 对照物涉及其解析行为，parity 矩阵的「39 也错」格语义可能需对齐其自身测试套件（未查，不影响本轮裁决）。
2. **go-git / libgit2 fuzz corpus 的具体 seed 构造法**（是否用 hash-object --literally 同款）未逐一取证——只有 OSS-Fuzz 通则，无单项目细案。
3. **本仓 39/40 对照物实际支持 quarantine disposition 的读法**（D-118 已立法框架，但 fixture 件进矩阵跑一轮的实操验证未做）——属落地验证非调研缺口。
4. html5lib-tests **encoding/ 目录**（UTF-8 病态族的语料组织细节）只读到了目录名，未逐件核验——若构造 UTF-8 病态 fixture 时可回读该目录作格式参考。

**输出文件路径**（如需落盘）：本报告文本可直接粘入 `.scratch/macro-audit/` 下对应 R28-Q18 报告文件；本会话为只读模式，未写磁盘。

继续此会话，运行：atomcode -p "…" --resume dca117e7-97e7-4699-901d-2a6606ed3352
