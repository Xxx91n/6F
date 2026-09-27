# R39-Q1 调研呈报：射程裁 × 批2-β 五项处置 × 断言基础设施治理先例

> atomcode 调研归档（resume handle：2bafda7a-a790-42c6-855a-1fcb4ecc9d39）。题面=R39-Q1-research-prompt.md；run 于 2026-09-27；检索面=web_search×1＋tavily×3＋anysearch×1，全文精读 6 件＋本仓账本全文/CONTEXT/ADR 清单/知识库召回 4 批。

**Sufficiency Gate**：searches: 5+ | angles: Official/Comparative/Criticism/Currency/Community 全五类 | full reads: 6（Microsoft ADR 官方档、suppress-ratchet 仓、Autonoma tautological-tests 全文、martinfowler ADR、biome suppressions 讨论、本仓 decision-ledger 全文 1056 行＋CONTEXT.md＋ADR 清单＋知识库 4 批召回）| gaps: ①「probe 语义变更立法载体」无逐字同名先例（以 Nygard ADR 门槛＋本仓 D-058/ADR-0022 先例外推，置信中高）；② suppression 到期日专门文献薄（以 detekt/gitleaks/betterer＋XFAIL cap 惯例补位）。

## 0) 本地证据链核查

账本现 152 主记录（D-001~D-152）。与本题直接相关的 current 决策面：

| 记录 | 与本题的关系 |
|---|---|
| D-150⑤（scoped 注记，D-152③ 承载） | 「批2 无依赖项可并行准备，处置顺序服从试用 findings 回流重排」——批2-β 裁定的排程约束 |
| D-151② / D-152⑤ | 试用关窗=判据驱动、关窗不注册 registry 事件；findings 走 D-146 四档摄入分诊（≠终裁） |
| D-146 / D-142 | 摄入四档制：「快照属实/现状已修」与「可核实且证伪」显式不进裁定链、去向表照登 |
| D-144③ / D-094 | 批1 字面钉普查触发器已 fired（guard-all-run 60 件动态枚举生效）；失效三分类=守卫三分类门 |
| D-102 / D-071⑧ | XFAIL 册只收合法漂移类；「断言无牙族」（便利分支命中）=欺诈/松散钉边例 |
| D-095①④ | 内部常量集超枚举成员默认删除；reserved 唯一合法域=外部输入面 |
| D-148 | Three-Disposition（Fixed/Deferred/Accepted-Risk）＋「同缺陷三议→commit-or-close」纪律 |
| D-113 | known-gaps 台账五要素（owner/review_by/证据链）——技术债登记的法定形态 |
| D-058 | ADR 门槛先例：无新取舍的归纳命名不开 ADR（ozimmer 零价值 ADR 判据） |
| ADR-0022 / ADR-0018 | quarantine 语义变更立 ADR 的先例；append-only 编年纪律 |
| 75b 草案 §3（A-099 载体，r38-impl 落盘） | 批2-β 五项原文：「本批不机械推进——改探测面属裁定链事项」 |

### 显式冲突点清单（逐条核过 current 全记录后仅存四处张力，无硬冲突）

- **C1〔排程张力〕**：题面候选 (b)/(c) 若在本轮裁定批2-β，撞 D-150⑤「处置顺序服从试用 findings 回流重排」——除非裁定明确批2-β 属「无依赖项并行准备」范畴且试用关窗已判 exit。化解见①推荐。
- **C2〔登记悬空风险〕**：题面⑤「N5/N6/T1-N1 并入」——N-xxx/T-xxx 编号系统住任务书/审计报告，不在裁定链账本。并入若不落 D-113 五要素（owner/review_by/证据链/trigger_id）即成悬空项，违 D-113 负向「缺 owner 的清单=Copla 腐化先例」。须在裁定时逐件填五要素。
- **C3〔XFAIL 摘除追认重复裁面〕**：(c) 中「xfail 摘除追认」——D-102 已裁已落（stale-assertions meta 已记、45-check H5 已摘、xfail-run 复绿）。再裁=同题二议，按 D-148 纪律只能以「追认注记」形态出现，不得产出与 D-102 不同调的新裁决（否则须标 revised）。
- **C4〔SCAN_EXEMPT 摘除的归因前置〕**：75b 草案 §3 已列「摘除/改写同批裁」，D-095① 支持删除超枚举成员；但 D-094③「普查检出非判罪——归因注记制」要求摘除前先归因（guard-all-run.mjs 不可达项=枚举面为 *-check.mjs 的文案漂移，属 D-094 (b) 合法演化类非欺诈类），摘除须带归因注记非静默删除。

## 1) 执行摘要（TL;DR）

**射程推荐 (b)，置信高**——批2-β 五项是已登记的裁定链义务（75b 草案 §3 明文「属裁定链事项」），(a) 窄射程违「同缺陷三议→commit-or-close」；(c) 的处置面四件中三件（xfail 追认、registry 簿记、复核债）是非裁面机械件，按 D-139/D-141 轻规约文法随收口落盘即可，不占裁定链，批3 排产时点按 D-150⑤ 留给试用 findings 回流后再裁。批2-β 内部：①②③（探测器语义/扩面）逐件裁＋探测器语义变更立 ADR；④⑤（零调用面维持＋技术债登记）打包裁。**「试用 findings 全不进裁定链→无需重排」无须新 D 立法**，但按 D-142/D-146 精神须在收口节留一行显式判断（「分诊结果全部为封闭态→D-150⑤ 重排前提消失」），否则该判断必然不再现。

## 2) 分点结论

### ① 射程选 (b)

- **(a) 太窄**：批2-β 不是新题——75b 草案 §3（r38-impl A-099 同 commit 落盘）已把五项列为裁定候选并明文「不机械推进，属裁定链」；D-144③ 已把批1 增长面腿提前执行并 bound_to=#75批1。只做核销呈报=已登记义务无限期挂起，撞 Trigger-gated Closure 词条 Avoid「无限延期（value lead time 恶化信号）」。
- **(c) 过宽的部分恰是非裁面**：xfail 摘除追认=D-102 已闭环（本条重复裁面，冲突点 C3）；registry 簿记刷新=机械执行件；manual_watch 登记=五要素填表非裁定。按 D-135 负向「禁卫生组升格独立票」票面纪律，这些走收口窗轻规约即可。批3（multi-hit 76 件点级锚改造）排产时点维持 D-150⑤——等试用 findings 回流重排后再裁，本轮不预裁（预裁=临场信息不足，撞预声明纪律）。
- **(b) 恰好覆盖全部真裁面**：五项中三项是探测器行为语义变更（裁定链本分），两项是轻量登记。排程上先裁试用关窗（exit 判据核验＋findings 分诊）再裁批2-β，即化解 C1——批2-β 五项全为「无依赖项」，其裁定不阻塞、但其处置顺序按 D-150⑤ 注记服从回流。

### ② 批2-β 五项处置方向与颗粒度

| 项 | 处置方向 | 颗粒度 | 依据（本地＋外部） |
|---|---|---|---|
| ① strip-前原文 mention 即豁免 | 改：探测器改扫剥后源码的 strip 消费位（75b 草案已定向） | 逐件裁＋立 ADR | 语义=「豁免判据从提名位改消费位」，有取舍（原文 mention 可能承载合法豁免意图 vs 扫剥后扫=防注释逃逸）——Nygard/Microsoft ADR 判据「affects key quality attributes, difficult to reverse」命中；对照 ADR-0022 先例（探测器硬化语义变更立 ADR） |
| ② multi-hit 扩 .includes/.test＋walk 补 .scratch/macro-audit | 改（扩面） | 逐件裁，与①同 ADR 或同批两裁决 | 扩面后新检出须注册（75b 草案原文）；D-095 open/closed 声明制：closed 探测面扩容=声明变更走裁定＋常量 SSOT 派生；D-110 棘轮反向适用——扩面不触发基线收缩，新检出按 D-094 三分类门分诊 |
| ③ SCAN_EXEMPT 不可达项＋自指恒真断言 | 摘除（带归因注记） | 打包裁（同批同性质=枚举面卫生） | D-095①「超枚举成员默认删除」；自指断言=外部文献确认的反模式：Autonoma「Useless Unit Tests」五形态之「assertion paths that can never go red」——断言文本自提及即过=恒真断言，与 D-102「断言无牙族」同型；摘除前按 D-094③ 归因（C4） |
| ④ stripMdComments 零调用面 | 维持＋登记 | 打包裁 | 75b 草案原文「新增 md 面断言方消费」=有已登记消费意图非死面，不触 D-094 欺诈类；与 D-045「可算但暂缓≠弃用」判据同构。外部佐证：checkstyle SuppressionCommentFilter 设计哲学「legitimate reasons 在代码内自证优于外部清单」——零调用但有消费方意图的函数维持是常态，仅需注记消费面时点 |
| ⑤ 三件技术债＋N5/N6/T1-N1 并入 | 登记进 known-gaps 台账（D-113 形态） | 打包裁 | 逐件填五要素（owner/review_by/证据链/trigger_id/status）；守卫写工作树工件（75a findings）=设计内行为登记 manual_watch 观察即可；手写解析器/正则耦合=D-096 census-contract 契约块已立法兜住语义面，登记复审锚即可 |

颗粒度总判：混合制——行为语义类（①②③）逐件裁（各自可独立验收、各自带 mutation 级验证义务，沿 D-147「预声明验证包」先例），登记类（④⑤）打包裁（同轻量同域，沿 D-133「票面开销超工作量则禁拆」判据）。这与 D-135 的单票批内排序纪律兼容：五项可落同一裁定窗、批内按上述分组，但禁与试用整改批混窗（D-135③ 负向）。

### ③ 测试断言基础设施治理先例（外部交叉验证）

| 机制 | 工业先例 | 关键判据 | 对本仓映射 |
|---|---|---|---|
| Mutation testing 断言强度 | StrykerJS break:null（never fail the build）/Stryker.NET=0——工具默认把强度门设为「展示非执法」；pitest 作者：静态分数门「invites gaming」、diff-time 才有效；mutmut ratchet=已提交基线只升不降、容差按 mutant 计数非百分比；Ruby mutant 每个豁免等价突变须注释＋周期复challenge；chobbledotcom 维持带静态检查的 equivalent-mutants 注册表（拒绝过期条目）；100% 数学不可达（等价突变） | 断言强度度量≠覆盖率；幸存者注册表须带 rationale＋复challenge判据；ratchet 是收敛机制非目标线 | D-094④ presence/liveness/readiness 三层命名与 mutation 分层判据同向；75a-S1 自指断言在 mutation 语义下=永不红的幸存者，摘除即「killed-by-removal」；本仓 348 条字面钉普查=D-094 普查机制，与 mutmut「按计数棘轮」同构 |
| Linter suppression 治理 | suppress-ratchet（全文核读）：对 eslint-disable/# noqa 计数棘轮——「lint 绿≠没人静音规则」；CodeQL baseline-ratchet ADR（全文核读）：基线文件+棘轮+守卫 workflow 防静默清零基线；overreacted（Dan Abramov）：no-restricted-disable——禁套娃豁免，「最终兜底=code review 与 lint config owner」；Biome 讨论 #2907：强制豁免附理由的 off/warn/error 分档 | 豁免须可解释（explanation 有团队价值）；基线只降不升；防「green check 被伪造」 | D-094 失效三分类+XFAIL 册规（欺诈类禁入册）与 biome「must-explain」同构；D-110 棘轮（基线只减不增）已有本地立法——外部先例双向印证 |
| Quarantine 名单 | GitLab stale 断言 3 个月自动删除 SLA（D-102 已引）；Bugzilla INVALID/WORKSFORME 分档（D-146 已引）；detekt baseline 只吞签名精确匹配存量；gitleaks 无逃生舱 | 隔离名单须带期限/复评锚，无期限=graveyard | 本仓 cap=10+XPASS-strict+批摘三防已超多数工业实践；SCAN_EXEMPT 不可达项按此谱系=「签名漂移存量」→改断言或摘除，禁裸豁免 |
| 自引用/恒真断言 | Autonoma 五形态（全文核读）：恒真断言「passes regardless of correctness」、检测启发式=「assert 期望值来自同一实现」；D-102 断言无牙族（|| 便利分支） | mutation 检验=恒真断言的机检死刑（意图未满足世界里必须红） | 75a-S1 自指断言=恒真反模式同型，摘除方向获外部先例支撑 |

### ④ 「试用 findings 全不进裁定链→无需重排」是否须显式裁认

须显式留痕，但无须新 D 立法。理由链：
1. D-150⑤ 已立法「处置顺序服从试用 findings 回流重排」——「重排」是条件性行为，其前提（存在进裁定链的 findings）可被分诊结果证伪。前提不成立时该条件条款自然失效，逻辑上无须废止。
2. 但按本仓自己的纪律（D-142②「不写下的分诊判断必然不再现」＋D-076④ 全留痕义务），「无需重排」是一个可判定判断，须在试用 debrief/收口节留一行：分诊四档逐条结论汇总＋「全部封闭态→D-150⑤ 重排前提未触发」——形态沿 D-146⑤ 勘误/D-139① correction 惯例（一行去向表登记，非新 D）。
3. 反面佐证（外部）：CodeQL baseline-ratchet ADR 把「现状无新 finding」也显式编码进基线文件而非口头记忆——「零事件」本身是证据状态；CONSORT/零病态节恒在渲染（D-114④「零病态时节恒在——证据缺席≠证据为零」）同构。阴性结论须显式渲染是本仓已立法的通用纪律。
4. D-152⑤ 负向依旧适用：关窗≠注册 registry 事件，「无需重排」的登记走收口节不走触发器。

### ⑤ 探测器语义变更的立法载体：ADR（不是决策账本单载）

- 判据（Nygard/Fowler ADR 原典＋Microsoft Well-Architected 官方档，双源）：ADR 收「architecturally significant」决策——影响结构、关键质量属性、或难逆转；「a record without justification loses its value」；append-only、superseded 链。①项「豁免判据从提名位改消费位」改变探测器的判定语义（=P-4 残余面收口），难逆转且影响审计产品的探测力=ASR 命中→开 ADR（建议 ADR-0024，模式沿 ADR-0022 Detector Hardening 先例：决策本体+备选+负向）。
- 账本的角色：本仓惯例（D-053~D-152 全部 152 条）是账本记裁定过程、ADR 承载可长期引用的决策本体、CONTEXT 收词条三分。D-058 先例确立 ADR 门槛=「单决策含取舍与备选」——①② 两项各自有取舍（扫原文 vs 扫剥后；扩面 vs 维持探针精度），过门槛；③④⑤ 无新取舍（删除超枚举/维持有消费面/登记债），不开 ADR，走账本裁定+票面/登记承载。
- 反向红线：禁把探测器语义变更只写进账本不立 ADR——账本行是 grill 窗口记录，未来消费者（新探测器实现者）无法从 152 条表格行可靠重建「为什么扫剥后源码」的取舍论证；这正是 ozimmer「零价值 ADR」判据的反面适用。

## 3) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Maintain an ADR — Microsoft Well-Architected（官方） | learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record | Official | ADR 判据（结构/质量属性/难逆转）、append-only、superseded 链（全文核读） |
| 2 | Architecture Decision Record — Martin Fowler | martinfowler.com/bliki/ArchitectureDecisionRecord.html | Official | Nygard 起源、ADR 门槛、decision log 区分 |
| 3 | suppress-ratchet — GitHub Action | github.com/motchalini-llc/suppress-ratchet | Community/Comparative | 豁免计数棘轮、「lint 绿≠没人静音」、AI 时代 green-faking（全文核读） |
| 4 | CodeQL baseline-ratchet ADR（clipman 仓） | github.com/MohammedEl-sayedAhmed/clipman/blob/main/docs/adr/0002-baseline-ratchet-for-codeql.md | Official | 基线棘轮三件套＋防静默清零＋line-drift 诚实登记（全文核读） |
| 5 | Useless Unit Tests: 5 Patterns That Never Fail — Autonoma | getautonoma.com/blog/useless-unit-tests-tautological-anti-pattern | Criticism | 恒真/自指断言五形态、mutation 手工检验法、AI 生成测试的假绿（全文核读，2026-06） |
| 6 | Suppressions of Suppressions — overreacted.io | overreacted.io/suppressions-of-suppressions | Community | no-restricted-disable 套娃豁免禁令、最终兜底=review+owner |
| 7 | Biome suppression 讨论 #2907 | github.com/biomejs/biome/discussions/2907 | Community | 强制豁免附理由的 off/warn/error 分档争论 |
| 8 | Mutation Testing 最佳实践（testmuai/CircleCI/Karate 合成） | testmuai.com/learning-hub/mutation-testing 等 | Comparative | 断言强度≠覆盖率、幸存者=工作清单非分数 |
| 9 | 本仓 knowledge-base：env-manager #50 Stryker Governance 报告 | （ctx 召回，batch:reports-dir） | Official（本仓系） | Stryker break=ratchet、survivor registry 带 re-challenge、pitest diff-time 论 |
| 10 | 本仓 knowledge-base：R28-Q8/Q11 沉淀 | （ctx 召回） | Official（本仓系） | gitleaks/baseline 类先例 |

## 4) 信息缺口

- 「探测器语义变更立 ADR」无逐字同名工业先例——结论由 Nygard ASR 判据外推，建议裁定时如实标注同构迁移（沿 D-133 waived-research 注记文法）。
- suppression 到期日/过期机制专门文献薄：工业主流=计数棘轮而非时间到期；本仓 XFAIL cap+复审锚模式实为超集，无需改采。
- N5/N6/T1-N1 三件的原文内容在账本无载——其并入五要素的填实须以 r37/r38 审计报告原文为输入，本轮未抓取审计报告全文（conflict C2 已按缺失处理）。
