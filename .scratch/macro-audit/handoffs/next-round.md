# next-round —— 轮 47 常驻任务书（轮 46 grill 收口毕·R46-impl 执行窗义务时点锚=下轮执行批）

> 任务书=常驻交接物：新会话/子 Agent 读本件＋账本＋CONTEXT 即接续；执行窗义务带欠账三要素（具名 owner＋时点锚＋复验方式——D-170③）。

## 轮 25~46 留痕（已定，勿重复）

- 轮 25~43：详见历轮收口节——字面钉三分类/quarantine 建制/Micro-B 设计树/四轮锐评辩证处置/守卫组升格触发器登记/第五轮锐评终局六裁＋分层定稿立法。
- **轮 44 T1 执行窗闭环（2026-09-28，r44-t1-exec）**：GAP-HOST-01 RA 五要件档案成文呈批→用户批「关档」；存量 RA 两字段普查 15 项全在册零重立项；footer partial:N/M polish 落；T3 六项哨兵读数全落 registry。
- **轮 45 grill（2026-09-29）**：两裁——D-171 RA 到期形态二分＋D-172 kr-01 收口 (iv)（冻结重钉＋frozen 豁免立法＋漂移观察移交）。
- **轮 46 R45-impl 执行批＋审计窗＋LOOP 修复批（2026-09-29，r46-t1-exec→PR#13 merged）**：kr-01 冻结重钉三件＋摘除入 closed[]（册内红=0）；frozen_evidence_packs 五件 sha256 钉值＋01-check F 组；r1 RA 用户批准重立项（min(复评触发,2026-12-28)）；r2 wontfix 追认；drift-watch 观察项在册（锚 8→1）；审计 PASS→F1~F6 全处置（F1 勘误链 9→8／F4=75a M4/M5 schema 建制／F5 F 组消歧／F6 拖车补齐）＋修复后十面硬验收全格复现。
- **轮 46 grill（2026-09-29，本批）**：一裁——D-173 判据④ A(a) 静默窗语义钉定（窗状态机 not_started/running/satisfied_at——零试点⇒not_started 合法读数非「计时中」；回流口径=来源分级内外同权〔能力面重置／hygiene 记 log 披露〕；重置锚=变更进入被验证制品事件非 finding 本体；机读五件建制〔start_event/start_at/prereq_check/reset_log/decision_date 复合测试〕；**D-162→revised** 仅④款 A(a) 收窄）；atomcode R46-Q1 调研存档（置信中高/Q2 高）。
- xfail 摘除注记：entries 当前 0/10（R39 已封闭）。

## 历史票面闭环索引（守卫锚点留痕）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16；T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）；T14 #43 golden 重基线 ✅ DONE（43-check 28/28）；#40 gsd-core ✅（40-check 57/57）；#45 demo 三 scenario ✅（45-check 51/51 复测确认）
- 轮28 #77 门面收口包交付（T1）＋quarantine 设计树 18 裁全定（D-103~D-120）＋去向全归 #78；轮 29 #78 quarantine 建制 LOOP-2 PASS 闭环
- **R39 收口实施批 ✅**／**R40 T1 执行窗 ✅**／**R41 审计返工硬化批 ✅**／**R41 收口批 ✅**／**R42-T1 执行+审计 LOOP 批 ✅**／**R43 收口批 ✅**／**R44-T1 执行窗批 ✅**／**R45 grill 收口批 ✅**／**R45-impl 执行窗批 ✅**／**R46 审计 LOOP 修复批 ✅**／**R46 grill 收口批 ✅**（本批——执行义务挂下轮执行窗）
- #75 批2：批2-α 七件闭环；批2-β 探测面硬化立案挂账——**开启触发器已注册 registry（batch2beta-open-triggers：GAP-B2B 恶化/第二同型需求/缺口新增命中三事件锚，审计窗点火检查，D-169-a②——D-169①款续现行不受②款收窄影响）**；批3/批4 择批点显式不预裁（D-153④/D-156③）

## 口径基线（读前必知）

- 账本：D 面 **173 条（158 current／14 revised／1 closed）**；A 面 max A-099；编年 max **M-041**（R46 收口批）。
- **守卫判据**：收口前跑 `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（动态枚举全量）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；SKIP 三态＋组级 SKIP-GROUP 机读面生效；footer 含 `partial=N/M` 派生展示行（呈现层非机读态）。
- **册内红=0**：kr-01 已消解（冻结重钉＋manifest closed[] 摘除——R46 执行批兑现 D-172①⑤）；manifest closed[]/frozen_evidence_packs 顶层类有 75a M4/M5 schema 校验钉。
- 收口工序前置（D-144①④/D-145①）：账行增量↔编年随行核对＋守卫组硬跑；engine/src|dist 触碰→`npm run build`＋`node scripts/check-dist.mjs` 零 drift 再 commit。
- **提交信息三栏位**（D-161④）：subject 单意图人读行／body 分项 bullets／footer `Ledger-Refs:`+`Chronicle:`+`Adrs:`（bundle-only commit 亦须三栏全列——Adrs 空列照写，F6 建制先例）。
- **registry=74 项/52 事件键**（33-check 基线）；manual_watch 五要素齐备化生效。
- **known-gaps 台账**：quarantine 四件（GAP-078-* legislated）＋批2-β 八件（triaged）＋GAP-HOST-01=accepted-risk（RA 档案复审钩=min(下次 IDE 会话,2026-12-27)，逾期失效须重立项）。
- **Frozen 证据包**（D-172②＋R46 兑现）：01 系五件工件=历史证据冻结类——manifest frozen_evidence_packs[id=frozen-01-series] 五件 sha256/bytes 钉值在册＋01-check F 组断言机检；regen/刷新批触碰=钉值红即违例信号；有意图刷新走裁定链写明理由；02/38/56 系不自动豁免（逐类裁定）。
- **RA 到期形态二分**（D-171）：补偿控制存续承载件→强制 min(事件先到,≤90d)；wontfix 恒久类→事件制合法双条件（在册可核验 sentinel＋低频盘查钩=T3 普查）；判据钉控制存续承载性非名义标签。
- **静默窗状态机**（D-173）：Stage-2 判据④ A(a) 30 日窗——state∈{not_started,running(reset_count),satisfied_at}；零试点⇒not_started（「计时中」非合法读数，vacuous silence≠stability）；回流=能力面 findings（内外同权）重置／hygiene 记 reset_log 披露；重置锚=变更进入被验证制品事件非 finding 本体；达标=decision_date 复合测试（open 清零∧修复部署∧窗内观察满最短时长）。
- **定稿语义（D-165/D-170）**：裁定层闭环≠验收层闭环——双行呈报禁单句「已完成」。

## 任务序列

### T1 — 执行窗批（R46-impl，覆盖 D-173①~⑤——欠账三要素逐件齐备）

- **T1-A registry stage2-launch-criteria 字段化落地**（D-173①③④）：window_state→`not_started`＋五件机读字段建制（start_event 枚举 pilot_started/findings_all_closed/freeze_declared＋start_at＋prereq_check＋reset_log[]＋decision_date 复合测试说明字段——字段形态最小化不超额）＋六次「计时中」确认行链式更正注记（D-146⑤ 读数链留痕不改写——追加 window-state-corrected 确认行载明前读数语义悬空）＋F1 归能力面入 reset_log 披露项（finding_id=R46-F1／source_class=capability／窗未启动不重置——分类先例在案）；owner=执行批；复验=registry 项读数核验＋33-check 相容（新字段不破校验面——破则同窗校验面同步扩随批）。
- O6 顺删（D-167-c①）继续挂账：下次触碰 40-check.mjs 时 NO-OP 搭车删 40-B1 闸后重言断言；不专开批。

### T2 — BACKLOG #75 票面批2 建制（续挂账；覆盖 75b §4／D-156③／D-169-a②）

- 维持 deferred：开启判据=事件锚非日历（registry batch2beta-open-triggers 三事件——R46 点火检查三问全否）；审计窗承担点火检查（核验非自动排工位）；批3/批4 择批点显式不预裁（D-153④/D-156③）。

### T3 — 审计窗哨兵值守（覆盖 D-155②③／D-164-b／D-169-a②／D-170③④／D-172④／D-173④——本窗本体）

- registry manual_watch 复审枚举：batch2beta-techdebt-review／codebuddy-ide-gap-watch（RA 复审钩=min(IDE 会话,2026-12-27)，逾期失效须重立项）／codebuddy-f02-display-watch／guard-retirement-class／stage2-launch-criteria／batch2beta-open-triggers 点火检查；**anysearch-cli-intent-drift-watch 首次随读**（D-172④——review_event=next-audit-window 本窗激活：复测上游 intent 面计数／检索上游仓认领票——「该退化无认领票」标注在场复核；漂移坐实→冻结包代表性衰减声明呈裁＋S1 重校准须有意图裁定非机械 regen）。
- **protected-surface-death-watch 随读**：各守卫 PROTECTED_SURFACE 引用物存在性人工普查（消亡判据事件发生即激活 T3 逐件呈报，不等窗）。
- **frozen 豁免随读**：manifest frozen_evidence_packs 钉值机检（75a M5 schema＋01-check F 组）——regen/刷新批触碰 01 系工件即违例信号；豁免范围=恰 01 系五件。
- GAP-B2B 八件逐件 status 重审读数（兼作触发器①恶化读数输入）。
- Stage-2 判据包四读数值守：①capability 漏斗态（Macro-A 绑 DoR-b——真实仓 facts 面形成与否）／②fresh-clone 判据维持／③GAP-HOST-01=RA-closed 复审钩值守／④**窗读数=window_state 字段机读**（not_started 期不再报「计时中」——起点事件 pilot_started/findings_all_closed 注册后方转 running）。
- IDE 面可得→charter 三判据重跑读数标 IDE-specific＋r1 RA 档案复审钩（min(复评触发,2026-12-28)——复审时重验 reprobe 补偿控制存续）；F-02 哨兵复测。

### 挂账常项（勿重复烤）

- R28-Q19 复核债／R31-Q6 resume 可选（句柄 a324fdd2-738e-4a71-b220-065c362e2d71）／readme-ci-badge（trigger 已 fired 09-22——挂载随 #77 门面收口包或下一门面维护窗，挂载完成方翻 status）／批3+批4 择批点显式不预裁／**T2 票面批2 事件触发非临窗再裁**（D-169-a②）／**拆件复审触发**（D-164④——groupProbe 落地后连坐仍实质发生再裁 46a/46b）／**断言级 need() 不预建**（D-167-a）／**resolve 归属争议点**（评审方可回访时重开）／**GAP-HOST-01 复审钩**（min(下次 IDE 会话,2026-12-27)——逾期禁裸续期须五要件重立项）／**r1 哨兵可选加固**（D-171③a 裁量件——日历兜底已足，不建制不违规）／**02/38/56 系工件 frozen 判定**（逐类裁定链，不自动豁免）／**Stage-1 试点邀请**（宿主资格=逐案用户闸门——zero charter 期静默窗读数=not_started 如实报非绕闸）。

## Suggested skills（本窗口）

- **implement / tdd**：T1 registry 字段化实修（stage2 项五件建制＋确认行链式更正＋reset_log 披露项）。
- **diagnosing-bugs**：哨兵读数分诊＋触发器点火检查归因；33-check 相容性异常分诊。
- **atomcode-research**：新决策题调研入口（题面存档→-p 深调研→辩证呈报→冲突即停标 revised）。
- **gitbutler**：VC 唯一写面——trailer 三栏位全量适用（bundle-only 空列照写）；push/merge 逐次闸门。
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- 判据/charter/裁定临场不可改——变更须先走裁定链；探测面修语义必带预声明验证包（D-147 先例）。
- dry-run 无转窗条件禁长期化；过期差值禁直接转窗；S1 改写禁再自指。
- **工具链避雷**：bash 下 `2>nul` 会写真 `nul` 文件；ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`；写文件经 node/ctx 时 NUL 字面量会物化为真 NUL（A-096 教训）。
- 报告命名纪律：`{date}-r{NN}-exec-report.md`／`-audit-report.md`；DB 探查=副本探查原件 sha256 前后校验。
- **退役判据=面消亡唯一合法路径**——禁命中率/年龄/通过史/断言量作判据（D-160 负向）；退役经 T3 窗逐件非批量；**retired 发射腿禁预建**（D-164-b）。
- **skip 三态语义**：skip=环境缺席、xfail=该工作但物不在——禁混标；skip 不进 allOk 禁折 pass；**组级 SKIP 同纪律组粒度沿用**（D-164-a③）；**组粒度=探测粒度终态上限**（D-167-a）。
- **哨兵触发钉事件非纯时间窗**（D-164-b／D-169-a②）；未注册触发器不算锚定（D-170③）；**判据读数须有机读锚**——无起点锚的「计时中」类读数禁续用（D-173④ 读数更正先例）。
- **git-object 访问零写入**——禁主仓 fetch/unbundle 写 object store（D-074）；自足件首选临时仓+alternates 借用。
- **执行窗必带时点锚＋欠账三要素**（D-165④＋D-170③）——具名 owner＋时点锚＋复验方式缺一不算锚定。
- **Stage-1 逐案 charter**；**Stage-2 四判据+静默窗未达标禁启动**（判据②③已达标——余①阻塞〔Macro-A 绑 DoR-b 未满足禁因外部压力开工〕＋④窗=not_started 窗未启动）。
- **冗余断言处置判据**（D-167-c，Bond 判据）：「这个断言还能失败吗」——闸后同语句重言必不能败→删；覆盖闸未覆盖后果者留。
- **RA 五要件＋到期二分**（D-169-b② 取代 D-148②；D-171 收窄②款）：判据引用＋justification+可验证补偿控制＋具名裁者（起草人≠批准人）＋到期日+复审钩——缺一=finding 静默丢弃禁为；到期二分=补偿控制存续承载件 min(事件先到,≤90d)／wontfix 恒久类事件制双条件（在册 sentinel＋盘查钩）；到期缺失/已过禁续期须重立项。
- **Frozen 证据包**（D-172②）：历史证据类工件禁扫 regen 批（F 组钉值红=违例信号）；重钉=git 原 blob 字节级恢复禁手改数字；阈值下调=静默改向禁为；frozen≠永不更新（有意图刷新走裁定链）。
- **跨仓主权**：anysearch-cli 等 sibling 仓不立案代排产——漂移移交=观察项非代管（D-172④）。
- **勘误链纪律**（D-146⑤/D-165）：二阶修正链式追加不改写原条目——registry 确认行/读数链同适用（计时中→not_started 更正即此形态）。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- 宿主侧操作（插件安装/会话执行/IDE 试用驱动）=用户驱动面，agent 不代行宿主内点击；宿主缺陷不代报官方渠道。
- social-card.png 上传=所有者 web-UI 手动操作。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
- 外部评审工件入仓须先走摄入分诊四档（D-142/D-146）——证伪驳回须附核实依据；勘误二阶修正链式追加不改写原条目（D-165）。
- 审计 finding 处置态封闭三档（D-169）——Accepted Risk 缺五要件任一=静默丢弃 finding 禁为；**RA 档案起草权在 Agent、批准权在用户**。
- 规程生效时点=自落盘 commit 起对新行为生效、落盘 commit 自身豁免（D-148③）。
- 试用关窗≠缺陷清零；关窗判据驱动非事件驱动（D-151②/D-152⑤）。
- Stage-1 宿主邀请对象=用户主权逐案闸门（D-162⑤）；Stage-2 公开推广=判据包达标后用户拍板启动（D-162③——静默窗 not_started 期禁以窗计时作进度宣称）。
- 「定稿」语义=分层（D-165/D-170）——裁定层闭环声明与验收层未达事实双行呈报，禁单句「已完成」。
