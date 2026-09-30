# next-round —— 轮 53 常驻任务书（轮 52 T1-A 指针守卫件落地毕·四段入列全兑现＋D-181 勘误 E-4~E-9＋T1-B 退役呈裁单落盘；执行窗义务时点锚=下轮审计窗）

> 任务书=常驻交接物：新会话/子 Agent 读本件＋账本＋CONTEXT 即接续；执行窗义务带欠账三要素（具名 owner＋时点锚＋复验方式——D-170③）。
> **换代自检注记（D-185②）**：本换代已对声称态条目核 git 实物——①「守卫 62 件」实测 `*-check.mjs` 61 ＋ `xfail-run.mjs` 1 = 62，R52 落 84-check 后 **63 件**（`guard-all-run` ran=63 green=63 allOk=true）；②「指针守卫件未实施」=**已不属实**（`reports/84-check.mjs` ＋ `reports/known-pointer-violations.json` 在册，本轮实施）；③「baseline 册未建」=**已不属实**（17 条在册）；④「编年 max M-051」实测 CHANGELOG `M-` 键 max=**52**（M-052 本轮落）。
> **换代钉清单盘点（D-187①）**：断言面=**63 件 check ＋ 84-check 自身 25 条断言**。在册钉七组见「历史票面闭环索引」节整节保搬（逐钉核对见 §换代盘点）；**缺席钉一件**＝42-check F5（禁无 ✅ 的 `| T` 行含 #42）——本轮维持。**本轮新增断言面=84-check 的 25 条**（`PV-A*` 3 ＋ `PV-B` 1 ＋ `PV-C` 1 ＋ `PV-D*` 3 ＋ `PV-E*` 2 ＋ `PV-F10*` 4 ＋ `PV-G*` **12**——审计返工新增 `PV-G-F12` 行号形态反例），其断言面入本盘点承接口径（首轮由 84-check 自身与 `guard-all-run` 动态枚举承接，下轮盘点逐钉核对）。

## 轮 25~52 留痕（已定，勿重复）

- 轮 25~43：详见历轮收口节——字面钉三分类/quarantine 建制/Micro-B 设计树/四轮锐评辩证处置/守卫组升格触发器登记/第五轮锐评终局六裁＋分层定稿立法。
- 轮 44~50：GAP-HOST-01 关档／D-171~D-172 RA 到期与冻结重钉／registry stage2 字段化／D-174/D-175 静默窗与等待期序／R48 四裁（D-176~D-179）／R49 四裁（D-180~D-183）＋执行批全兑现／R50 四裁（D-184~D-187）。
- **轮 51 R50-impl 执行批＋审计窗＋返工（2026-09-30，r51-t1-exec 链）**：T1-A check-kit regex 根治六件齐（fixture 18/18＋golden 零误删＋70-check 回迁＋勘误闭账＋迁入闸退役＋GAP-CK-01 关档）＋T1-B 75a 分向核查；审计窗初报不通过→返工批→复验 guard-all-run 62/62；病灶三型实证：W8 孤儿孪生＋W6 per-session 短码＋全 hex 幻觉展开。
- **轮 51 grill＋整理环节（2026-09-30）**：七裁——D-188~D-195（指针纪律立法全链）＋全量去向对账 current 179 条全闭合。
- **轮 52 T1-A 执行窗（2026-09-30，`r52-t1a-pointer-guard` 叠于 `r51-closeout`）**：T1-A 指针守卫件四段全兑现——(a) D-177 预声明先行 `037f64cbf47a987fc818c215599c043457913816` → (b) `84-check.mjs` ＋ `known-pointer-violations.json` 落盘 `116a6594493b8127550d377515472841687de7ba` → (c) 首跑存量判级（册内 WARN 29／册外 FAIL 0）→ (d) `guard-all-run` **63/63** 入列；中途 75a C1 抓 `PV-F10D` 无牙断言 → `ea6866a2d7bab4686b3c1192fd1e8fb496d44c75` 修实断言 → D-180 bundle 腿 `ebdf743fb4d671957d2be8a54f8474aebbf544b4`。T1-B 退役呈裁单落盘（显式驳回摘除）。勘误 **E-4~E-9** append-only 追加。开机自纠实录：本轮文书起草时曾误写 `037f64cb037f64cb`（幻觉 hex 第三例），`git cat-file -t` 判 BAD OBJECT 后改正——**全 hex 一律实证**纪律当场自证。
- xfail 摘除注记：entries 当前 0/10（R39 已封闭）。

## 历史票面闭环索引（守卫锚点留痕——保护区节，D-187②：整节保搬只增不删）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16；T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）；T14 #43 golden 重基线 ✅ DONE（43-check 28/28）；#40 gsd-core ✅（40-check 57/57）；#45 demo 三 scenario ✅（45-check 51/51 复测确认）。
- 轮28 #77 门面收口包交付（T1）＋quarantine 设计树 18 裁全定（D-103~D-120）＋去向全归 #78；轮 29 #78 quarantine 建制 LOOP-2 PASS 闭环。
- **R39 收口实施批 ✅**／**R40 T1 执行窗 ✅**／**R41 审计返工硬化批 ✅**／**R41 收口批 ✅**／**R42-T1 执行+审计 LOOP 批 ✅**／**R43 收口批 ✅**／**R44-T1 执行窗批 ✅**／**R45 grill 收口批 ✅**／**R46/R47/R48 执行批＋审计窗＋收口全链 ✅**／**R49 执行批＋审计窗 ✅**／**R50 执行批＋收口批 ✅**／**R51 执行批＋审计窗＋返工＋收口批 ✅**／**R52 T1-A 执行窗 ✅**。
- #75 批2：批2-α 七件闭环；批2-β 探测面硬化立案挂账——**开启触发器已注册 registry（batch2beta-open-triggers 三事件锚，审计窗点火检查，D-169-a②）**；批3/批4 择批点显式不预裁（D-153④/D-156③）。
- **轮 52 增补**：`#84` 指针纪律守卫落盘 ✅ DONE 2026-09-30（84-check 25 断言 PASS ＋ `guard-all-run` 63/63 入列）。

## 换代盘点（D-187①——枚举断言面 ＋ 在场/缺席钉分向两列 → 逐钉核对）

| # | 钉（check:断言） | 向 | 核对结果 |
|---|---|---|---|
| 1 | `39-check:H6` T11 ✅ DONE ＋ 含 `#39` | 在场 | ✅ 保护区节保搬，`T11 #39 mw-trigger 接线 ✅ DONE` 逐字在位 |
| 2 | `40-check:G5` 含 `#40` 或 `gsd-core` | 在场 | ✅ 保护区节 `#40 gsd-core ✅` 在位 |
| 3 | `41a-check:F4` T6 行 ✅ DONE 2026-09-16 ＋ 含 `#41a` | 在场 | ✅ 保护区节逐字保搬 |
| 4 | `42-check:F5` 禁无 ✅ 的 `| T` 行含 `#42` | 缺席 | ✅ 维持缺席（本轮无 `#42` 开口行） |
| 5 | `43-check:D5` T14 ✅ | 在场 | ✅ 保护区节 `T14 #43 golden 重基线 ✅ DONE` 在位 |
| 6 | `44-check:G6` `#77` ＋ 闭环词 ＋ `#78` | 在场 | ✅ 保护区节轮28 行在位 |
| 7 | `45-check:H5` 含 `#45` 或 `demo` | 在场 | ✅ 保护区节 `#45 demo 三 scenario ✅` 在位 |
| 8 | `84-check` 25 条断言（新增面） | 在场 | ✅ 自身实跑 **PASS-COUNT 26 FAIL-COUNT 0**（小修批后）；由 `guard-all-run` 动态枚举承接 |

**盘点兜底**：`node .scratch/architecture-recovery/reports/guard-all-run.mjs` → `ran=63 green=63 allOk=true`（七组在册钉逐条由其宿主 check 兑现；84-check 面由本件第 8 行登记承接口径）。

## 口径基线（读前必知）

- 账本：D 面 **195 条唯一 ID**（179 current／16 非 current——前缀口径实测，R52 开工对表 D-6 记「拆分未能独立复现，按任务书口径沿用」）；A 面 max A-099；编年 max **M-052**（本批）。
- **守卫判据**：收口前跑 `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（动态枚举全量——**63 件**）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；SKIP 三态判别在案。
- **册内红=0**：`known-red-manifest.json` entries 当前 0；closed[]/frozen_evidence_packs 顶层类有 75a M4/M5 schema 校验钉。
- **commit 指针纪律**（D-188~D-190）：指针字段=SHA≥12hex＋`("subject")`＋写入时点 `cat-file -e` 存在∧锚线祖先集可达；锚线默认=文书落盘分支栈 tip，跨线须具名声明；严格层=位形封闭枚举（WORKFLOW §4.2.10-8），裸短码单独定位=违规；存量走勘误通道（E-1~E-9 在册）。
- **指针守卫已落地**（D-192）：`reports/84-check.mjs` ＋ `reports/known-pointer-violations.json`。判级=**册内 WARN／册外 FAIL**；可达性与孪生恒 WARN（D-190④ 人工复核边界）；册项失配自报可移除（ratchet 只减不增）；扫描面封闭枚举 5 面（`.scratch/macro-audit`＋`.scratch/architecture-recovery`＋`docs/adr`＋`CONTEXT.md`＋`AGENTS.md`），扩面走立法票 D-095。**机检管严格层，宽层残留仍归审计窗人工抽查（D-188⑥）**。
- **开工对表**（D-185）：任务书声称态断言→开工 `git log`/`git show`/`cat-file -t` 实证核实；失真→差异行登记＋裁剪续工；guideline 式非硬 gate。
- **atomcode 降级形态**（D-186）：组成字段必填；fallback/后台未归=degraded_performance 合法降级；配额耗尽=唯一不续跑例外；构成比逐轮登记（轮50=4/4→轮51=5/7→**轮52=0/0**——复审计数**连续 2/3 未变**，未达 3 轮 100% 触发线）；深调研复验钩已撤销（D-195）。
- **换代哨兵字标盘点**（D-187）：换代前枚举断言面＋在场/缺席钉分向两列→新书逐钉核对；「历史票面闭环索引」节=保护区整节保搬只增不删。
- **收口 commit 对节奏**（D-180）＋**扩面勘误通道**（D-181）＋**收口工序前置**（D-144①④/D-145①）：账行增量↔编年随行核对＋守卫组硬跑；engine/src|dist 触碰→`npm run build`＋check-dist 零 drift。
- **提交信息三栏位**（D-161④）：subject 人读单意图／body 分项 bullets／footer `Ledger-Refs:`+`Chronicle:`+`Adrs:`。
- **registry=75 项**（R52 实测 `items.length=75`）；**known-gaps**：GAP-HOST-01=RA closed 复审钩值守／GAP-REP-01=accepted-risk（消费触发锚）／GAP-CK-01=closed；批2-β 八件 triaged 续挂。
- **Frozen 证据包**（D-172②＋D-182）；**RA 到期形态二分**（D-171）＋**静默窗状态机**（D-173——Stage-2 判据④ window_state=not_started）。
- **等待期工作面序**（D-175）：(b) 欠账清零第一→(d) 深度维护主体→(c) 预备件三问筛→(a) 值守仅底线。**R52 兑现 (b)→(d)**：(b) T1-A 执行窗清偿完毕→(d) 指针守卫件落地。
- **预声明验证包工序**（D-177）＋**断言档位判据**（D-176）＋**定稿语义分层**（D-165/D-170 双行呈报）。

## 任务序列

### T1 — 审计窗批（R53 审计窗，T3 哨兵值守＋T1-B 裁定承接）

- **T1-B′ check-kit-regex-blindspot-watch 裁定承接**：呈裁单 `.scratch/macro-audit/reports/2026-09-30-r52-t3-retirement-proposal.md` 在册（提议 (ii) 降级常规自检＋补 registry 条目；显式驳回 (i) 摘除，理由 D-160⑥ 面未消亡）。裁定归 T3 窗逐件窗（D-160②）。owner=审计窗；时点=下轮审计窗；复验=采纳 (ii) 时 registry 条目落盘＋`33-check` E 段绿／采纳 (i) 时 manifest retired 八要素＋`_retired/` 归档实物＋`75a M3` 绿。
- **册内 17 条 WARN 收敛**：按 D-181 勘误通道逐件处置——**回写冻结声明件须独立勘误 commit**（禁夹带进语义批）。owner=审计窗/执行批；时点=按件；复验=每件收敛后对应册条目移除 ＋ `PV-F10D` 守恒断言复跑（失配数+命中数==册条目数）。
- **宽层残留抽查**（D-188⑥，机检管严格层后仍不可省）：基准已由「6 个」更正为审计普查读数——扫描面内极大 hex run（12~40）唯一 token **1076** 个，可解析 29／非对象 1047；剔除上游仓 SHA（~700）与审计指纹摘要（~200）与调研 synthetic 后，**仓内叙事文书层仍 ≥20 件**。奇长截断形（`0830a98300676210e2fca` 21h／`f2d85493b161c8dcc` 17h）优先定性。分四类登记（上游 SHA／证据摘要／stale 本仓 SHA／synthetic）逐件定性。owner=审计窗；时点=下轮审计窗；复验=抽查行在账本「宽层抽查读数」节。
- registry manual_watch 复审枚举：batch2beta-techdebt-review／codebuddy-ide-gap-watch（RA 复审钩=min(IDE 会话,2026-12-27)）／codebuddy-f02-display-watch／guard-retirement-watch／ci-workflow-liveness-watch／anysearch-cli-intent-drift-watch。
- **protected-surface-death-watch 随读**＋**frozen 豁免随读**（manifest 钉值机检＋intent-drift 读数续录）。
- GAP-B2B 八件逐件 status 重审读数＋Stage-2 判据包四读数值守（window_state 机读）。
- **等待期序随读**（D-175）＋**macro-b liveness 续读**（下一真实 schedule=2026-10-05 03:17 UTC——三态如实登记；dispatch 实跑未授权不跑）。
- **atomcode 降级构成比续录**（D-186②）。

### T2 — BACKLOG #75 票面批2 建制（续挂账；覆盖 75b §4／D-156③／D-169-a②）

- 维持 deferred：开启判据=事件锚非日历（registry batch2beta-open-triggers 三事件，R52 读数全 no）；审计窗承担点火检查；批3/批4 择批点显式不预裁——**禁借 D-175 (c) 预备件名义动工**（D-175⑧ 明载边界）。

### T3 — 深度维护主体候选（(d) 面；D-175⑥ 呈用户裁量位）

- **候选件**（呈用户裁量，本轮不预裁）：①指针守卫件扫描面扩列（现 5 面，`docs/` 其余面与 `engine/**` 未在列——扩面走立法票 D-095）；②baseline 册从 WARN 收敛为摘除的批量作业窗（须逐件勘误 commit）；③`PROTECTED_SURFACE` 与指针纪律面交叉声明（D-160③ 与 D-188 的守护面表述是否需对齐）；④**严格层列头枚举欠列**（账本 E-11：裸 `commit`／`SHA` 列头不在封闭枚举内，实测本批文书即在该盲区下放置指针；扩列走立法票 D-095）；⑤审计登记不罚三条的收紧票（`bareCodes` 英文三字母词误报面／`splitRow` 行尾 `|` 假设／空 subject 校验位）。

### 挂账常项（勿重复烤）

- R28-Q19 复核债／R31-Q6 resume 可选／批3+批4 择批点显式不预裁／**T2 票面批2 事件触发非临窗再裁**（D-169-a②）／**拆件复审触发**（D-164④）／**断言级 need() 表**／S1 重校准（D-182②——消费触发锚未至不预裁）。

## Suggested skills

- **implement / tdd**：册内 WARN 收敛批（每件一条独立勘误 commit ＋ 对应 `PV-F10D` 复跑）。
- **diagnosing-bugs**：指针病态分诊（孤儿孪生／per-session 短码／幻觉 hex 展开／审计口径落差四型——R52 实证「审计以可 `cat-file -e` 为通过位 ≠ 立法法定形」）。
- **atomcode-research**：新裁定题调研入口（题面存档→`-p` 深调研→辩证呈报→冲突即停标 revised）——串行配额纪律；**存档义务=reports/ 文件硬要求**（D-178）；**降级形态在册**（D-186）＋**复验钩已撤**（D-195）。
- **gitbutler**：VC 唯一写面——trailer 三栏位全量适用；**收口 commit 对节奏**（D-180）；push/merge 逐次闸门；**短码仅会话内别名不充电针位**（D-188③——R52 自纠实录即反例）。
- **handoff**：下轮收口同规程再生——**换代钉清单盘点步先行**（D-187①；R52 盘点面已含 84-check 25 断言承接口径，见上节第 8 行）。

## 窗口边界纪律（D-101 精神沿用）

- 判据/charter/裁定临场不可改——变更须先走裁定链；**探测面修语义必带预声明验证包（D-177）＋冻结声明件内扩面走勘误通道（D-181）**。
- **指针纪律边界**（D-188~D-192）：法定形三要件缺一不可；锚线不可推定=非法指针；宽层散文不背核验税；位形枚举封闭扩列走立法票；baseline 条目必关联勘误行号；存量 WARN/新增 FAIL 两级判级（禁 blame 时点判定）；主锚线可达性留人工复核非机检（GitButler 虚拟栈 merge-base 语义不稳）；**机检只管严格层——宽层散文中的幻觉 SHA 是固有盲区，人工抽查不可省**。
- dry-run 无转窗条件禁长期化；过期差值禁直接转窗；S1 改写禁再自指。
- **工具链避雷**：bash 下 `2>nul` 会写真 `nul` 文件；ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`；写文件经 node/ctx 时 NUL 字面量会物化为真 NUL（A-096 教训）；**短码→全 hex 展开不可凭记忆补全**（E-3 病灶，R52 再犯一次并当场自纠）；**hex 长度不可凭直觉**（R52 fixture 曾把 40 位写成 42 位致断言空转）；**写 .mjs 零反斜杠＋表格 fixture 须复刻真实列位**（R52 两次 fixture 空转教训）。
- 报告命名纪律：`{date}-r{NN}-report.md`／`-audit-report.md`；DB 探查=副本探查原件 sha256 前后校验；**调研存档面**：reports/ 硬文件（D-178）＋组成字段必填（D-186①）；**收口口径**：「除已收编真实语义信号件外零 churn」（D-180②）。
- **workflow/yml 文书纪律**（D-176）；**挥发字段两族分流**（D-179）；**退役判据=面消亡唯一合法路径**（D-160——经 T3 窗逐件非批量）；**skip 三态语义**（D-167-a）。
- **哨兵触发钉事件非纯时间窗**（D-164-b／D-169-a②）；未注册触发器不算锚定（R52 实证：check-kit-regex-blindspot-watch registry 零条目）；判据读数须有机读锚。
- **git-object 访问零写入**（D-074）；自足件首选临时仓+alternates。
- **执行窗必带时点锚＋欠账三要素**（D-165④＋D-170③）；**Stage-1 逐案 charter**；**Stage-2 四判据+静默窗未达标禁启动**。
- **冗余断言处置判据**（D-167-c Bond 判据）：「这个断言还能失败吗」——R52 实录：`PV-E-TWIN-BUCKET-PRESENT` 原 `t(..., true, ...)` 被自查改覆盖率守恒式；`PV-F10D` 被 `75a C1` 抓 toothless 后改守恒式。**写断言即写反例**。
- **RA 五要件＋到期二分**（D-169-b②/D-171）＋**守卫自身缺陷 AR=自我指涉悖论不成立**（D-183④）；**漏报向守卫缺陷=被支配缓挂禁型**（D-183④）。
- **开工对表边界**（D-185）：guideline 式非硬 gate；差异行走既有登记面；只钉声称态条目。
- **换代盘点边界**（D-187）：保护区节只增不删；节外钉须清单显式登记；盘点步非新 check 文件。
- **Frozen 证据包**（D-172②＋D-182）；**跨仓主权**（D-172④/D-182——sibling 仓不立案代排产；不对上游发外联）。
- **勘误链纪律**（D-146⑤/D-165/D-181）：链式追加不改写原条目——指针类勘误写法定形指针（E-1 先例；R52 E-4~E-9 同型，全 hex `git rev-parse` 实证）。
- **等待期立法边界**（D-175⑧）＋**自动分诊边界**（D-179④）。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- 宿主侧操作=用户驱动面；宿主缺陷不代报官方渠道；social-card.png 上传=所有者 web-UI 手动。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
- 外部评审工件入仓须先走摄入分诊四档（D-142/D-146）——证伪驳回须附核实依据。
- 审计 finding 处置态封闭三档（D-169）；**RA 档案起草权在 Agent、批准权在用户**。
- 规程生效时点=自落盘 commit 起对新行为生效、落盘 commit 自身豁免（D-148③）。
- 试用关窗≠缺陷清零（D-151②/D-152⑤）；Stage-1 邀请对象=用户主权逐案闸门（D-162⑤）；Stage-2=判据包达标后用户拍板（D-162③）；**(c) 面候选件=呈用户裁量位**（D-175⑦）。
- 「定稿」语义=分层（D-165/D-170 双行呈报）。
- **workflow_dispatch 实跑=外触副作用面**（D-176——须用户单独授权；R52 未实跑，如实登记）。
- **atomcode 进程处置=用户主权**——调研进程在途未归禁我杀；降级形态合法化（D-186）；**复验钩撤销为终态裁定**（D-195）。
