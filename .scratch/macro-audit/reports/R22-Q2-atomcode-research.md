# R22-Q2 调研报告——环境敏感腿断言处置

- 调研工具：atomcode-research（resume id: a8030afe-4afd-4c8d-bed9-036e23f67ddf）
- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q2-research-prompt.md
- 置信度：高（9 源全部本轮实读，含 Google Testing Blog/SWE-book/Pact/pytest/turborepo 源码级）

## ① 结论（推荐 + 一句话）

**推荐 (a) 双轴处置**（附一条 (b) 的限定吸收）：env∩验收探针（38:H4、39:I1/I2/I3 的「验收时点零写入证明」语义）走 D-073 sealed + attestation 通道；env∩活契约（「审计工具永不写被测仓」的工具不变量语义）把断言对象从活环境改写为受控 fixture（engine/test 里临时 clone 一个玩具仓、跑审计、断言 git status --porcelain 干净），守卫面原断言随 sealed 退役并留 migration 指针。一句话：**测工具的行为，不测环境的状态**——Google 测试纪律与 Pact provider-state 模型在这一点上完全一致，而 (b)(c)(d)(e) 要么把环境噪声合法化，要么把死断言供在册子里。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 双轴处置（sealed＋fixture 迁移） | **采纳（推荐）** | 唯一同时满足因果归因修复（fixture 隔离，trunk.io「robust tests are completely isolated」）、不变量永续（新测试接替）、验收语义封存（D-073 机制直接复用）三者的方案。工业先例最厚：hermetic servers（Google）、provider states（Pact）、dirty-hash 归一化（turborepo 用 hash 而非 PASS/FAIL 断言）。 |
| (b) ENV-SKIP 第四态 | **不采纳（吸收其一粒）** | skip 是测试债经典批评：pytest 官方文档把 skip 定义为「条件不满足就不跑」，社区纪律是 skip 必须有 reason 且会被审计；ENV-SKIP 把「环境脏」变成合法绿灯，真回归（审计真写了被测仓）与噪声在输出面上无法区分——恰是本题要修复的因果断裂，只是从 FAIL 噪声换成 SKIP 噪声。可吸收的一粒：sealed 守卫若偶然仍被执行/引用，输出可标注 env-dependency 原因，但那是 attestation 的字段，不是新输出态。 |
| (c) 前探＋快照化 | **不采纳为主** | 「对验收时点快照做增量检查」本质是把环境状态冻结进仓库——冻结的环境不再是环境（被并行 agent 继续弄脏即漂移），且快照维护本身成为新的断言债。「前探（probe-gate-then-assert）」的合理内核已被 (a) 的 fixture 化吸收：fixture 测试的前置就是自己 clone 干净仓，探针与断言合一，不再需要独立前探机制。 |
| (d) 入册 XFAIL | **不采纳** | 违反 D-073⑦ 显式划界（环境敏感腿「不属使命完成，不入册不删除，归下题」）；XFAIL 占 cap 位且语义错误——XFAIL 语义是「预期失败的行为缺陷」，而 env 腿失败不是被测行为的预期失败，是断言对象错位。入册等于把断言对象错位合法化为已知缺陷。 |
| (e) 维持现状缓挂 | **不采纳** | 实测已 fired（check-38 H4 FAIL 34/36，2026-09-17 两次实测），FAIL 是持续噪声；SWE-book ch11：不可靠信号导致「工程师停止对测试失败作反应，测试套件价值归零」。缓挂即接受信号贬值。 |

## ③ 工业先例证据（带 URL，均本轮实读）

1. **Google Testing Blog《Hermetic Servers》(2012-10-03)** — https://testing.googleblog.com/2012/10/hermetic-servers.html — Official。「访问外部服务器会因缺乏确定性导致 flakiness」；解法=hermetic——SUT 全部要件打包在测试机器内、无网络连接。映射：38/39 的断言对象（sibling 活仓）就是「外部依赖」，fixture 化即 hermetic 化。
2. **Google Testing Blog《Test Flakiness》(2020-12-16)** — https://testing.googleblog.com/2020/12/test-flakiness-one-of-main-challenges.html — Official+Community。flakiness 来源之一是「资源被与测试无关的其他任务消耗」——正是「并行 agent 弄脏邻仓」；「hermetic environments are less likely to be flaky」直接支持 fixture 化。
3. **《Software Engineering at Google》ch11** — https://abseil.io/resources/swe-book/html/ch11.html — Official。0.1% flake × 10000 tests/天 = 每天 10 次无意义调查；flakiness 超阈值后「tests lose confidence, engineers stop reacting」。证明 (e) 缓挂代价=信号死亡。
4. **Pact Docs《Provider States》** — https://docs.pact.io/getting_started/provider_states — Official。契约测试对「环境前置状态」的工业化治理：前置状态由 provider state handler 注入受控数据（「injecting it straight into the data source」），且「每个 interaction 隔离验证不依赖前序结果」——不变量测试的前置必须是受控注入而非活环境现状。
5. **pytest 官方《How to use skip and xfail》** — https://docs.pytest.org/en/stable/how-to/skipping.html — Official。skip 官方语义：「期望测试只在条件满足时通过，否则跳过」，要求 reason 且单独计数汇总。skip 不是错，但它是条件性可运行的登记，不是处置终态——env 腿终态不该是「条件不满足就跳」，该是「对象改对后永远可跑」。
6. **turborepo turborepo-scm/src/git.rs get_dirty_hash** — https://github.com/vercel/turborepo/blob/fe55e564/crates/turborepo-scm/src/git.rs — Official（源码级）。工业界对 dirty-worktree 的处置：不做 PASS/FAIL 持续断言，把 git status --porcelain -z + git diff HEAD 哈希成 dirty hash，脏树仅作缓存键输入（None=clean）。环境状态被降格为输入信号而非断言对象——与 (a)「不测环境」一致。
7. **j2r2b《Ensure no uncommitted changes》(2019-03-26)** — https://j2r2b.github.io/2019/03/26/ensure-no-uncommitted-changes.html — Community/实践。clean-tree check 正确位置：「CI server will perform the check for you」——是构建后置门禁（自己的构建有没有弄脏自己的仓），发生在与被检者同一 CI 边界内；本仓 38:H4 跨仓断言邻仓，边界错位，所以它是前置门禁模型而非持续断言模型。
8. **trunk.io《The Ultimate Guide to Flaky Tests》(2024-08-12)** — https://trunk.io/blog/the-ultimate-guide-to-flaky-tests — Community（含 Microsoft/Wing Lam 研究引用）。四类根因中「external resources」「lack of isolation」精确覆盖本题：「If nothing in the code changes when a test flakes, look outside the code」——env 腿 FAIL 时代码没变即此实例。隔离处方：「Robust tests are completely isolated… They each set up their own state」。
9. **Google ICSTW 2023 论文《Hermetic, Ephemeral Test Environments》** — https://doi.org/10.1109/icstw58534.2023.00029 — Official（同行评审，摘要级已读）。

## ④ 落地形态设计

**A. 双轴分拣机检判据（扩展 D-073③ 的三向判据表）**

| 断言 | env-sensitive？ | 验收探针 or 活契约？ | 机检判据 | 处置 |
|---|---|---|---|---|
| 38:H4 | 是 | 验收探针（#38 one-shot 验收的零写入证明） | 守卫源 spawnSync git -C <仓外路径>＋头部含「接入时点验收」标记 | sealed + attestation 行 |
| 39:I1/I2 | 是 | 验收探针（#39 三仓 one-shot 同上） | 同上（39-check.mjs:15 REPOS 硬编码 sibling 路径，grep 可判） | sealed + attestation 行 |
| 39:I3 | 是＋决策漂移双重 | 验收探针 | jiahao commit name-only 断言＋D-046 已撤该 workflow | sealed + attestation 行 disposition 加注 superseded-by-D-046 |
| 40-check BASES | 是 | 待逐条判定 | 同 sibling grep | 逐条走本表，不整守卫一刀切 |
| 「审计永不写被测仓」不变量 | 是（语义面） | **活契约** | 无现有断言面（见 B） | fixture 测试承接（B 项） |

**B. fixture 测试归属面：engine/test/，不是守卫层**

- 落点 engine/test/audit-zero-write.test.mjs（与现有 smoke.test.mjs/gitcli-contract.test.mjs 同层；已核 engine/test 目录现无零写入覆盖，fixtures/ 下有 cassette 模式可仿）。
- 测试体：fs.mkdtemp 建临时目录→git init 最小玩具仓（3-5 文件含可触发各 collector 的 README/源码片段，cassette 化）→跑 engine 审计管线→git -C <tmp> status --porcelain 断言空→清理。每次临时建仓（ephemeral），不 clone 真实 sibling（真实仓内容漂移违反 hermetic）。
- 挂接：package.json smoke 链（与 38-check G1 的 report-preview.test.mjs 同模式），不变量随 npm run smoke 每次实跑——比原守卫更强的持续性（原来是验收时点一次性）。
- 断言名显式写不变量语义：「audit 管线对被测仓零写入（fixture 仓 git status 干净）」。

**C. migration 指针格式（双向可机检）**

- sealed 守卫侧：attestation 行加字段 "migrated_to": "engine/test/audit-zero-write.test.mjs#audit-zero-write"（活契约腿的行必填此字段；纯验收探针腿该字段为 null——migrated_to 非空即 33-check 可断言「目标文件存在且含该断言 id」）。
- fixture 侧反向指针（工具输出 EOF 截断仅存首行）：测试文件头注释登记承接的 sealed 断言出处（哪条 sealed → 哪个 test id 的 1:1 对应表写入 attestation 行）。

## ⑤ 失败模式与治理

1. **fixture 测试假阳性**：玩具仓太简单触发不了真实写入路径→治理：fixture 内容从真实 sibling 仓 README/源码结构 cassette 化抽样（仿 engine/test/fixtures/github-rest cassette 先例），测试内加自检断言「审计确实产出了 facts」（防 vacuous pass）。
2. **封存埋掉活不变量**：sealed attestation 语义是「验收时 fired」，不变量语义是「永远不写」。**防线=migrated_to 强制闭包**：活契约腿 sealed 行 migration 字段必填＋33-check 校验目标存在——封存不是终点，迁移完成才允许封存行闭合。fixture 测试未写则 attestation 行必须标 rewrite-pending（复用 D-073⑤），禁止直接 sealed。
3. **D-071③ 冲突**：「断言照跑」保护活契约 XFAIL 条目。fixture 迁移后原断言不在 xfail-run 执行集（sealed），形式冲突——但 D-073⑨ 已预留划界注记。本题裁决落在：**迁出≠停测**——断言行为被 engine/test 新测试 1:1 承接且频率更高（每次 smoke vs 每轮 grill），③ 的精神（信号不断）保住，③ 的字面由 D-073⑨ 注记豁免。迁移测试 1:1 对应表写入 attestation 行。
4. **fixture 仓 git init 在 Windows 竞态/权限**：mkdtemp+init 每次新建有秒级开销与偶发锁→治理：测试内重试一次＋失败时 stderr 归因输出；不开共享缓存仓（缓存引入状态泄漏违反隔离处方）。
5. **过度归因风险**：fixture 全绿不能证明「对真实 sibling 仓也零写入」（真实仓有 .gitignore 边界/子模块/大小写差异）→attestation 行 evidence 字段保留原验收时点真实仓实测记录（D-044 不可变历史），fixture 测试只承接持续性，真实仓快照证据承接历史性，两者 attestation 行内并置。

## ⑥ 与本仓 current 决策冲突核查表

| 决策 | 冲突面 | 核查结论 |
|---|---|---|
| D-073（sealed/attestation 双锚） | attestation 记「验收时 fired」，env 腿不变量语义是「永不写」——封存会否埋掉活义务？ | **不冲突，条件成立**：D-073⑦ 本就把 env 腿划出 sealed 主通道「另题处置」；本题即那个「另题」，裁决为：验收探针腿直接走 D-073③ sealed；活契约腿 sealed 附加 migrated_to 必填约束（D-073④ 字段集超集，向后兼容）＋③⑤ rewrite-pending 机制复用。 |
| D-071③（断言照跑） | 迁出断言停止在守卫层执行 | **形式冲突、精神保住**：D-073⑨ 划界注记已预留豁免口；落地时须在该注记下补一行「env 活契约腿以 fixture 承接，承接测试挂 smoke 链」，使豁免显式化而非默认化。 |
| D-071（清单制/cap） | (d) 入册占 cap 位 | 冲突：D-073⑦ 已禁止 env 腿入册；(d) 违之，弃。 |
| D-068（baseline） | sealed 后 baseline 计数变化 | 顺延 D-073③ SEALED: n 顶显计数口径，baseline 对账按「entries+sealed」双集合，33-check 已含不重复断言，无新增冲突。 |
| D-046（撤 workflow 先例） | 39:I3 本身测的就是被撤的 workflow 变更面 | **支持 sealed**：I3 是 D-046 决策漂移的直接受害者，attestation 行 disposition 加 superseded-by-D-046，属「决策变更致断言失效」的正型封存。 |
| D-044（不可变历史） | attestation 是否改写历史？ | 不冲突：attestation jsonl append-only（D-073④ 同构），真实仓 fired 证据以原样固化，fixture 迁移是新增承接层不是改写。 |
| D-063（有实证即裁决） | 本轮是否有实证？ | 有：check-38 H4 两日两次实测 FAIL（grill-round-70 弄脏邻仓）、39-check.mjs:15 sibling 硬编码、engine/test 无零写入覆盖——三件实证已闭环归因。 |
| ADR-0013（三层验收闸门） | fixture 测试放 engine/test 是否越层？ | 不越：engine/test 是引擎层测试标准落点（smoke 链既有先例），闸门层只消费其结果；守卫层 sealed 后闸门对账走 attestation，层序保持。 |
| ADR-0009（intake 本地优先） | fixture 用本地临时仓 | 一致：mkdtemp 本地建仓，不依赖网络/远端。 |

## ⑦ 信息缺口

1. **ENV-SKIP 无工业先例**：检索未找到任何主流测试框架定义「环境前置失败」为第四输出态（pytest 的 skip 是条件登记非环境探针语义）——(b) 缺失先例本身即其不成熟度证据，若未来采 (b) 属自创机制需自担语义风险。
2. **40-check BASES 断言原文未逐行核**（本轮只 grep 到 sibling 引用存在）：断言级处置需批量票落地时逐行盘点（同 R22-Q1 缺口 1「断言级 id 盘点」）。
3. **fixture 玩具仓最小充分内容未定**：需审计各 collector 真实触发样例，可能需从 sibling 仓抽样 cassette——工作量评估留给落地票。
4. **attestation 下游消费者**（承接 R22-Q1 缺口 3）：migrated_to 新字段是否影响 held-out eval/下轮审计 agent 读取格式，未确认。

## ⑧ 建议追问

1. fixture 测试是否要同时覆盖 Macro-A/B/C 三 scale 审计管线（成本 ×3），还是先覆盖本仓实际运行的 scale？
2. migrated_to 闭包校验放 33-check G5 扩展还是新 G6？（G5 现有职责是否已过载）
3. 39 几乎全守卫陷落——整守卫 sealed（守卫级）还是断言级部分 sealed，env 腿裁决是否改变该经济性判断？
4. 若未来并行 agent 弄脏本仓 6F 自身（守卫体系所在的仓），D-068 baseline 机制是否需要同类「测工具不测环境」迁移？
