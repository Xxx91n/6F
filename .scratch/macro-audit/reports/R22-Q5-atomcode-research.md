# R22-Q5 调研报告——SKIP-STREAK CI 失明（streak 机制持久化/收窄/重构裁定）

- 调研工具：atomcode-research（resume id 在稿内）
- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q5-research-prompt.md
- Sufficiency Gate：searches 11（web×7＋tavily×1＋anysearch×3）｜angles 五类全用｜full reads 9（pytest skipping／sre.google workbook／Chromium expectation_files／Netflix Kayenta／GitHub workflow-syntax／GH caching doc／omgmog commit-noise／Kayenta runbook／slo-generator 讨论）
- 置信：高（病灶判断三方信源＋本地实物双重印证）

## ① 结论

**推荐 (d) 组合**：语义收窄（CI=cli-absent-expected 面→SKIP 转 INFO 常态登记、不进 streak）＋本地 streak 留 .code-tmp 显式降格声明「仅本地连续观测」＋promotion 挂人工复核事件（值守人读本地窗证据后确认翻转）。

一句话：**SKIP-STREAK 的病灶不是持久化缺失而是前提错配——CI 上 SKIP 恒真是环境事实不是异常信号，任何持久化方案（候选 a）只会把永真告警修成永真告警的持久版；正确修法是按环境分层断言（pytest skipif／Chromium TestExpectations 工业共识），晋升门从「自动读 streak」改为「人工读窗口证据」（canary 人工 approval path 先例）**。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 状态持久化 | ❌ 否决 | 修持久化不修语义错配。CI cache 三重失败：①GitHub 官方明示 cache 不可变/key 不覆盖/至多 7 天存活——跨窗口计数器载体先天不可靠；②streak 语义在 CI 上永真（无 claude CLI 是预期事实），持久化=永久告警非异常信号；③仓内状态文件被 CI 写回=commit-back 机器人模式，社区实证污染提交史（omgmog 实测 142/1091 条噪声 commit）。三害无一利。 |
| (b) 语义收窄＋环境分层 | ⚠ 采纳为骨架但单独不完整 | 方向正确：「预期缺席」与「异常缺席」分离是 pytest skipif 与 Chromium TestExpectations 成熟心智。但 promotion 取证面「本地版本窗口留痕」悬空——谁在哪窗读什么证据、谁按什么翻牌未闭合，event_bound 触发器在语义收窄后失去机检输入。 |
| (c) 证据工件化 | ❌ 否决（部分要素可吸收） | CI 产工件回写仓=commit-back 污染史；且 CI 窗口工件全是 SKIP，读连续 2 窗工件=读连续 2 份 SKIP=promotion 永不触发，比现状更死。receipt 文化正确但 receipt 应产在本地手动窗口非 CI。 |
| (d) 组合 | ✅ **推荐** | 三组件闭合 (b) 悬空面：①语义收窄治本；②本地 streak 降格声明=R21 审计「票面注明仅本地有效」合法出口实体化；③人工晋升门（D-041 manual_watch 五要素）闭合 promotion 取证——Kayenta marginal→human approval path 正型先例。 |
| (e) 缓挂 | ❌ 否决 | R21 审计已列返工第 1 项给了两个合法出口，条件已实然命中而按期序挂起=D-063 反面；R22-Q1 先例——触发条件已实然命中而缓挂=已知债务展期被裁不采纳。 |

## ③ 工业先例证据（带 URL）

**A. expected-skip vs anomaly-skip 语义区分（官方，双引擎交叉）**
- pytest 官方："A skip means that you expect your test to pass only if some conditions are met"——skip 是声明的环境前提非告警信号。https://pytest.org/en/stable/how-to/skipping.html
- GitHub Actions continue-on-error：环境期望模型——「预期此步在特定环境会失败/缺席」的显式声明，结果标 neutral 不标 fail。https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Chromium TestExpectations：`[ win debug ] foo.html [ Skip ]`——预期态按环境 tag 分流，同一测试在不同环境可有不同预期。https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/testing/expectation_files.md

**B. streak/counter 在 CI 的持久化模式（批评＋官方双源）**
- cache 载体不可靠：条目不可变、同 key 永不覆盖、存活至多 7 天、分支隔离——跨版本窗口计数器放不下。https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching
- commit-back 机器人：实证 142 条机器 commit 污染 1091 条史、需 rebase 手术清洗。https://blog.omgmog.net/post/reducing-github-action-commit-noise/
- 推论：**跨运行计数器在 CI 的三种介质（cache/artifact/commit-back）全都不适合本场景**——但更重要的是，语义收窄后 CI 面根本不需要计数器。

**C. 「two consecutive windows」晋升机制——窗口取证本就跨运行介质（官方×2）**
- Kayenta：逐迭代 canary analysis，聚合分 success→自动 promote／marginal→**human approval path**／failure→rollback；窗口证据存于 metrics 后端（Atlas/Stackdriver/Prometheus），从不依赖 CI 状态文件。https://cloud.google.com/blog/products/gcp/introducing-kayenta-an-open-automated-canary-analysis-tool-from-google-and-netflix
- SRE multiwindow alerting 同构：多窗证据=累积观测非单点计数器。

## ④ 落地形态设计

**1. 输出态语义（SKIP/INFO 分层）**——validate-plugin.mjs 改造：
- 环境判定显式化：`MACRO_AUDIT_CI=1`（或 engine-ci.yml 环境变量注入）→cli-absent-expected 面；否则→cli-expected 面（本地/开发窗）。fail-safe 方向选「缺省=cli-expected」（本地缺省告警）。
- cli-absent-expected 面：输出 `INFO(claude-validate): cli-absent-expected（CI 面预期缺席，advisory 能见度归零属环境事实）`——计入披露行（ADV | 回显保留），不计 WARN、不进 streak、不触发升格。取 continue-on-error 的 neutral 语义：预期缺席既非绿也非红，是第三披露态。
- cli-expected 面且 cli-absent：保留现 SKIP+streak+SKIP-STREAK-ALERT——但语义收窄为「本地异常缺席」（本地装了 CLI 的环境突然 absent=环境劣化信号，前提成立）。
- state.json 语义改写：`{"mode":"local-observation-only","streak":0,"last":"pass"}`——留 .code-tmp 未跟踪，头部注释与 registry 行明示「本地连续观测计数器，CI 面不消费；非契约面、非 promotion 证据」。34-check 可选元断言「state.json 若存在则 mode 字段须等于 local-observation-only」防漂移。

**2. promotion 判定的证据载体**：
- 废除「registry event_bound 自动读 streak 翻牌」路径（CI 无输入，永 false）。
- 新载体=本地 receipt 留痕：`npm run validate:plugin`（手动窗，D-066②第二触发）每次跑后 append 一行到 `.code-tmp/claude-validate-receipts.jsonl`（{at, cli_version, verdict, output_digest}，append-only——D-073③ attestation 同构）。
- registry claude-validate-promotion-watch 条目改 manual_watch（五要素）：owner=macro-audit 队列值守／verify_method=读 receipts.jsonl 连续 2 版本窗记录（无 SKIP/WARN 污染行）／复审时点=每版本窗清点／确认留痕=33-check confirmation_schema 四必备（at/by/criterion_version/reason，reason 引 receipts digest）／标记=条目本体。
- **2 版本窗口判据原文保留**：改的只是证据读取面（streak 计数器→receipts 账）与翻牌执行者（自动→人工确认），机制本体「满 2 窗全绿才升」不动。

**3. state.json 终态**：留 .code-tmp 未跟踪＋降格声明，不迁仓内、不入 CI cache。

## ⑤ 失败模式与治理

| 失败模式 | 概率 | 治理 |
|---|---|---|
| 收窄后 CI 面 advisory 能见度归零无人察觉（本地窗也长期不跑 validate） | 中 | INFO 行常驻 ADV | 回显＋registry manual_watch 复审时点显式要求值守人每版本窗跑一次 npm run validate:plugin 并核 receipts；33-check E 段复审逾期→ALARM（D-041③ 同构） |
| receipts.jsonl 被本地清理（.code-tmp 非持久面）导致 2 窗证据断链 | 低 | receipt 行轻量、值守人复审即续写；断链=窗口计数归零重计（registry 现行 review_at 语义原样适用），损失仅是时间不是正确性 |
| 人工晋升门被 prose 复审敷衍 | 中 | confirmation_schema 四必备强制（at/by/criterion_version/reason）＋criterion_version 钉 D-066⑥ 修订版号；reason 须引 receipts digest——33-check 已有留痕契约校验 |
| MACRO_AUDIT_CI 配置漂移（本地 CI 模拟忘设→本地 absent 误判 INFO 不告警） | 低 | fail-safe 缺省=cli-expected；CI workflow 显式注入，配置漂移面在 workflow 文件（受 34/41b 守卫链审计面覆盖） |
| 未来真给 CI 装了 claude CLI（advisory 面变真） | 低 | CI 面自动升为 cli-expected 语义（旗标仍在但 absent 不再发生），INFO→PASS 自然迁移；registry 修订版注记此边界 |

## ⑥ 与本仓决策冲突核查表（逐条）

| 决策 | 冲突面 | 裁定 |
|---|---|---|
| D-066⑥ 转 enforce 判据（「满 2 版本窗口无 SKIP 污染」） | promotion 改人工确认翻转是否冲突？ | **需一行勘误注记（revised 由注记承载），本体不冲突**：「2 版本窗口全绿」判据原文保留；变化仅在①证据载体（streak 计数器→本地 receipts.jsonl）②翻牌执行者（event_bound 自动→manual_watch 人工确认）。注记须写明：原 event_bound 触发器在 CI 面永 false（SKIP 恒真=永无「无 SKIP 污染」窗口），是机制设计时未识别的环境分层缺口，非事后翻案——D-063 实证（R21 审计 F5）在案。 |
| D-066③ SKIP 语义硬化（cli-absent 计 WARN＋连续 SKIP 升格顶显） | 语义收窄是否动本条款？ | **需 scoped 勘误注记**：③ 条款在 cli-expected 面（本地）原样保留；新增限定「仅 cli-expected 面有效，CI=cli-absent-expected 面 SKIP→INFO 不计 WARN 不进 streak」。非改写决策内容，是显式声明环境适用域——D-070「冻结语义不改写＋成对落盘注记」惯例照办。 |
| D-041 watch 三态五要素 | promotion-watch event_bound→manual_watch 是否破三态契约？ | 不冲突——三态状态机本就含 event_bound↔manual_watch 迁移语义（真·条件式判据归 manual_watch；本项判据=人工读本地窗证据，正是 manual_watch 定义域）。A-053 先例在案。 |
| D-063 有实证即裁决 | 收窄而非修持久化是否正当？ | 支持——R21 审计 F5 实测即实证；审计 §六第 1 项明文给了「如实收窄」出口，本轮裁定是兑现非绕行。 |
| D-070 文档面处置 | 勘误载体 | 注记落 decision-ledger D-066 行内（scoped 勘误注记格式，D-071⑩ 先例）＋registry 条目 title 行同步标注。 |
| D-071/D-073 受控状态文件先例 | state.json 是否类比 stale-assertions.json 迁仓内？ | 区分成立：stale-assertions.json=声明式期望表（人写、只读校验、决策产物）→入仓合法；claude-validate-state.json=运行累积计数器（守卫每轮覆写）→不入仓。D-073③ append-only attestation 形制移植给 receipts.jsonl（同为证据留痕面）非给 state 文件。 |
| D-037⑤ advisory→enforce 两段式 | 两段式本身是否动摇？ | 不动——advisory 位、WARN 不红、双触发全保留；本裁定只修 advisory 位内部输出态分级与环境分层。 |
| CONTEXT Watch Tri-state | 人工晋升门是否=「隐性人工盯」反模式？ | 否——manual_watch 三态就是本仓对真·条件式判据的合法形态，前提是五要素齐备＋机检确认留痕（33-check 校验），与「prose 复审非控制」边界不越。 |

## ⑦ 信息缺口

1. Kayenta 逐窗判定持久化实现未公开到代码级——receipts.jsonl append-only 是本仓 D-073③ attestation 先例内推，非 Kayenta 直接镜像；
2. GitHub community discussion #137587 只取得摘要（cache 7 天存活、非持久用例结论已核）；
3. claude CLI 的 CI 官方安装路径：D-066 已登记缺口「CI 无凭据运行未官方确认」——本轮沿用不重开；
4. receipts 断链重计的「窗口」粒度：registry 现行 review_at「每版本窗口清点」但版本窗机检锚未定义——落地票需钉可寻址锚（建议=engine CHANGELOG M 条目，ADR-0018 编年同源）。

## ⑧ 建议追问

1. 「INFO 第三披露态」是否同时适用于其他 advisory 面（41b 内同型 SKIP 行是否一并分层）——落地票需统一语义；
2. receipts.jsonl 与 attestation（D-073③）是否共载体还是分文件（共载体更省概念税，但 attestation 是验收探针专用语义——建议分文件、同 schema 形制）；
3. state.json 的 mode 元断言要不要真进 34-check（可选加固）还是只票面声明。
