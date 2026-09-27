# R39-Q3 调研呈报：spec-level 审计仓治理——known-gaps 五要素台账 ＋ registry manual_watch ＋ D-146 四档分诊

> atomcode 调研归档（resume handle：见 atomcode-r39q3 batch）。题面=R39-Q3-research-prompt.md；run 于 2026-09-27。

**TL;DR**：工业界惯例全面支持面A 的五要素默认指派方案（owner=仓内值守＋review_by=下一审计窗＋trigger_id=manual_watch＋status=open-registered）；面B 推荐挂 manual_watch（候选 i）；面C 推荐不主动上报＋观察项登记（候选 i＋iii 合并，上报留条件触发）。Confidence：高——①⑤ 两问有三域以上独立信源收敛，②③④ 系惯例外推、置信中高，已逐条标注。

## 0) 本地证据链核查

| 记录 | 与本题关系 |
|---|---|
| D-113 | known-gaps 双册分工法定形态：台账字段=gap_id/reason_code 族/首见实例证据链（repo+sha+raw）/status（observed→triaged→legislated）/owner（到人/角色）/notes/review_by/trigger_id（可空外链 registry）；registry 只持触发器五要素、禁复制缺口语义字段；「registry 条目只回答触发器是否还在烧」——单向权威 |
| D-113 负向 | 缺 owner 的清单=Copla 台账腐化先例；无复核节奏=18 个月后还列着不存在的系统 |
| A-053 / CONTEXT「Watch Tri-state」 | manual_watch 五要素=标记＋owner＋复审时点＋verify_method＋confirmations[]；event_bound 为默认态（须 trigger_event/deadline_event 至少一机读锚）；人工盯梢=补偿控制非缺口关闭 |
| D-146（承接 D-142 revised） | 摄入四档制：「快照属实/现状已修」与「可核实且证伪→快照不属实」两档显式不进裁定链、去向表照登；「无法核实→pending」须入 registry 则走 manual_watch 五要素 |
| D-148 | Three-Disposition（Fixed/Deferred/Accepted-Risk）＋Accepted-Risk 三要素含复评触发条件 |
| D-150⑤/D-152③ | 批2 无依赖项可并行准备、处置顺序服从试用 findings 回流重排；试用关窗不注册 registry 事件，关窗后残项→manual_watch 接力 |
| CONTEXT「宿主试用」词条 | 关窗=判据驱动；not-run 如实记录；宿主面内呈现=被测对象非立法对象 |
| R28-Q11 档案 | known-gaps 承载形态调研已做过一轮（NIST IR 8286r1/GitHub known-issues/Copla/Orca），本轮不重复其结论、只在其上答新问 |

### 显式冲突点清单（逐条核过 current 全记录后仅存两处张力，无硬冲突）

- **C1〔面B 归属轴〕**：面B「CodeBuddy IDE 未覆盖」若挂 manual_watch，其五要素 verify_method 须复用试用三判据（D-151/D-152 charter）——但 D-152 裁「试用关窗后残项方按 Trigger-gated 挂 manual_watch 接力」，IDE 形态是试用射程内 not-run 残项还是射程外新形态存在读法张力。化解：D-150 试用主验收线=CLI 三判据已 hit 关窗，IDE=同一宿主的未覆盖驱动路径——属「关窗后未实测残项」范畴，挂 manual_watch 与 D-152 自洽；判「新宿主另立试用」反而把同宿主拆成两案。
- **C2〔面C 归因前置〕**：面C「宿主展示盲区」若挂 manual_watch，五要素 verify_method 须写「宿主升级后复测 codebuddy mcp list」——但该触发器是宿主侧条件，非本仓可控事件；与 D-044「绑定↔判据语义匹配须人工判定」纪律同族：挂登记可以，但须如实标注「触发源在宿主侧、本仓只做守望」防误读为本仓缺陷已立案（宿主试用词条负向「宿主面内呈现=被测对象非立法对象」同向）。

## 2) 分点结论（按五问）

### ① 台账字段与 review 锚点选型惯例——推荐锚定「下一审计窗（事件锚）」，禁纯 prose「下一窗」裸写

- review_by 三选型对比：固定日期机检性弱（日期可漂移）；里程碑锚中；**下一审计窗机检性强（33-check 可扫）＋腐化风险低＝首选**；须落实为 registry review_event 机读锚而非 prose。
- 「无 review 锚=graveyard」判据获多源印证（IF4IT per-item 治理/codeintelligently 183→14 合并案例/ebpearls 健康判据「register 不过季增长」）。
- T1-N1 单挂「对外转述/发布材料前」复评锚合规——属里程碑式事件锚。

### ② 试点未覆盖形态的披露与复核登记惯例——推荐面B=候选 (i) 挂 manual_watch

- verify_method=「IDE 实装时按 charter 三判据重跑」（复用 D-151/D-152 判据本体）；trigger 同 A 节律锚定下一审计窗哨兵；known-gaps 另留 observed 披露条目（平台矩阵式三态披露惯例：supported/unsupported/verified 分列）。
- 归属化解（冲突 C1）：IDE=同宿主未覆盖驱动路径=「关窗后未实测残项」，挂 manual_watch 与 D-152⑤ 自洽。

### ③ 非本仓缺陷的上游/宿主报送边界——推荐不主动上报（候选 i）＋挂观察项（iii），上报留条件触发

- notes 显式归因「宿主侧、非本仓缺陷、不立案」；trigger 合格化改写=**下一审计窗哨兵复测**（弃裸「宿主升级时」模糊 trigger）；若用户侧有官方反馈意愿另走授权通道。
- 「不主动上报」与 D-146「不进本仓裁定链=宿主侧行为」初分自洽，观察项登记即足负留痕义务（宿主试用词条「宿主面内呈现=被测对象」同向）。

### ④ manual_watch trigger 可判定性写法——「宿主版本升级时复核」类模糊 trigger 单独不合格，须补可观测锚才合格

- 合格形态=可机读锚（review_event=下一审计窗哨兵复测）或明确事件名；「宿主升级时」本仓无可观测手段=不合格裸写，须改写为审计窗哨兵节律。

### ⑤ 六件合并登记 vs 分列颗粒度——推荐一册一节合并登记＋条目级五要素（两全形态）

- 分列支持：IF4IT「One authoritative governed record per Technical Debt Item」——独立可治理条件须独立条目。
- 合并支持：codeintelligently 反面教训（183 张 ticket→合并成 14 条 register 条目才可行动；「register>20 items=tracking too much, merge related items」）；ebpearls 健康判据「register 不过季增长」。
- 六件实况：同 owner、同 review_by、同 trigger_id——四要素天然同值，六行分立重复字段即噪音。推荐：known-gaps 台账收一条节级条目（六件并列清单），每件带一行独立 mini-五要素（证据链＋逐件归因注记——防某一件先触发时无法单独关闭）；registry manual_watch 挂一事件（节级复审）。与 D-113 双册分工兼容：registry 管节级触发器是否还烧，台账管逐件 status。分立六条 manual_watch 事件=33-check 扫描面膨胀无增益；单行六件混填一个五要素=逐件关闭语义丢失。

## 三面打包推荐汇总

| 面 | 推荐 | 五要素 |
|---|---|---|
| A | 采纳题面默认指派全项 | owner=仓内值守（notes 写角色解析）；review_by=批2-β 后下一审计窗〔含 T1-N1 单挂对外转述前复评〕=registry review_event 机读锚；trigger_id=manual_watch（节级一事件）；status=open-registered |
| B | 候选 (i)：挂 manual_watch | verify_method=「IDE 实装时按 charter 三判据重跑」；trigger 同 A 节律；known-gaps 另留 observed 披露条目（平台矩阵式三态披露） |
| C | (i)+(iii) 组合：不主动上报＋观察项登记；上报设条件触发 | notes 显式归因「宿主侧、非本仓缺陷、不立案」；trigger=下一审计窗哨兵复测（合格化改写，弃裸「宿主升级时」） |

## 对比矩阵（review 锚点三选＋面C 三选）

| 项 | 固定日期 | 里程碑 | 下一审计窗 | | 不上报(留观察) | 上报官方 | 挂 manual_watch |
|---|---|---|---|---|---|---|---|
| 机检性 | 弱（日期可漂移） | 中 | 强（33-check 可扫） | | 强 | 中（外部响应不可控） | 强（须补可观测锚） |
| 腐化风险 | 中 | 中 | 低 | | 低 | 低 | 中（模糊 trigger 高） |
| 本仓适配 | 一般 | 适合批2-β 牵引件 | 首选 | | 首选 | 条件触发 | 与(i)合并成立 |

## 4) 完整来源清单（摘）

NIST IR 8286r1/GitHub known-issues 模板/Copla 台账腐化/Orca（R28-Q11 档案已核）；IF4IT per-item TD 治理；codeintelligently 183→14 合并案例；ebpearls register 健康判据；lightsondata/kubernetes-sigs/logrocket/nexstone 技术债字段与 review 惯例（题面 5+ 搜索/5 角度/full reads 见 atomcode 索引原件）。

## 5) 信息缺口

- ②③④ 三问系惯例外推（未覆盖形态披露／宿主报送边界／trigger 可判定性无逐字同名先例），置信中高已标注。
- 「节级合并＋条目级五要素」两全形态为本仓 D-113 双册分工下的合成解，非逐字外部先例。
