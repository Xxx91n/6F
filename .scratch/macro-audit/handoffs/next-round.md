# next-round —— 轮 42 常驻任务书（轮 41 grill 收口毕·R41 执行窗时点锚=本批/下轮首启）

> 生成：2026-09-28 轮 41 收口（R41 grill 三裁毕＋分层定稿——裁定层闭环、验收层哨兵值守）。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-001~D-165：**153 current**／11 revised〔含本轮换入 D-159〕＋1 closed=D-019 沿旧例）。三裁均裁定≠执行——执行窗义务全量挂账（收口节「执行窗登记」预声明，实施不许再裁）。

## 轮 25~41 留痕（已定，勿重复）

- 轮 25~40：详见历轮收口节——字面钉三分类/quarantine 建制/Micro-B 设计树/四轮锐评辩证处置/守卫组升格触发器登记/第五轮锐评六裁全在案。
- **轮 28**：T1 交付（A-089 #77 门面收口包）＋grill 封口 quarantine 设计树 18 裁全定（D-103~D-120）＋去向全归 #78；轮 29 #78 quarantine 建制 LOOP-2 PASS 闭环。
- **轮 40 T1 执行窗闭环（2026-09-28）**：D-158~D-162 执行面全兑现——F-A1 谓词收紧＋env-contract 分层（60 件 tier 自声明＋GUARD_SIBLING_ROOT SSOT＋SKIP 三态）＋retired 建制＋暴露梯度登记；guard-all-run allOk=true（60 跑 59 绿 1 册内红）；commit skt/tml/yms/rus/kny @ r40-t1-exec。
- **轮 40 审计返工批（2026-09-28）**：R41-T1 audit LOOP-2 PASS——F-1 blame-ignore-revs 两 SHA 登记／F-2 字符串遮罩全类补齐（变异探测 14/14）／F-4 u-escape 转义修净＋siblingExists 死件摘除／F-5 75a 复用 check-kit 解析件／F-6 skip/crash 角落修净／F-7 39/46 漂移披露补腿。
- **轮 41 grill 封口（2026-09-28）**：锐评辩证复验「完成了没」——fresh-clone 亲测 14 红/13 册外新红（四类环境前置漏探测）→D-163 泛化立法（**D-159→revised 唯一正面冲突按规程处置**）／D-164 组级粒度精化＋retired 哨兵锚定／D-165 分层定稿（裁定层闭环、验收层如实值守）；二阶勘误两件＋subject 锚残留登记；调研六件存档。
- xfail 摘除注记：entries 当前 0/10（R39 已封闭）。

## 历史票面闭环索引（守卫锚点留痕）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16；T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）；T14 #43 golden 重基线 ✅ DONE（43-check 28/28）；#40 gsd-core ✅（40-check 57/57）；#45 demo 三 scenario ✅（45-check 51/51 复测确认）
- **R39 收口实施批 ✅**／**R40 T1 执行窗 ✅**／**R41 审计返工硬化批 ✅**／**R41 收口批 ✅**（本批）
- #75 批2：批2-α 七件闭环；批2-β 探测面硬化立案挂账；批3/批4 择批点显式不预裁（D-153④/D-156③）。

## 口径基线（读前必知）

- 账本：D 面 **165 条（153 current／11 revised〔D-159 本轮换入〕／1 closed=D-019 沿旧例）**；A 面 max A-099；编年 max **M-034**。
- **守卫判据**：收口前跑 `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（动态枚举全量）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；D-159 SKIP 三态生效——skip 不进 allOk、计数+reason 进 footer、sibling 寻址走 GUARD_SIBLING_ROOT SSOT。
- 收口工序前置（D-144①④/D-145①）：账行增量↔编年随行核对＋守卫组硬跑；engine/src|dist 触碰→`npm run build`＋`node scripts/check-dist.mjs` 零 drift 再 commit。
- **提交信息三栏位已全量生效（D-161④）**：subject 单意图人读行／body 分项 bullets／footer `Ledger-Refs:`+`Chronicle:`+`Adrs:`；T1 批 3 件 subject 锚残留已登 R41 收口节（历史不重写）。
- **registry=72 项**（33-check 基线——R41 收口增四哨兵：fresh-clone-rerun-watch〔manual_watch〕／protected-surface-death-watch〔manual_watch·消亡判据事件触发〕／tier-misdeclaration-recurrence〔event_bound〕／npm-v12-allowscripts-review〔event_bound〕）；stage2-launch-criteria 判据② FAIL 确认行在册。
- **known-gaps 台账**：quarantine 四件（GAP-078-*）＋批2-β 九行＋GAP-HOST-01 observed（CLI=verified/IDE=observed-unverified）。
- **定稿语义（D-165）**：裁定层闭环≠验收层闭环——fresh-clone 判据② FAIL 如实值守，Stage-2 维持关闭直至哨兵复验转绿；「定稿」声明禁读成「评审关切已解决」。
- 宿主实证面：CodeBuddy CLI 三判据 hit 已封口；IDE 未实测残项在册值守。

## 任务序列

### T1 — R41 裁定执行窗实施批（时点锚=本批/下轮首启；覆盖 D-163/D-164/D-165②）

- **A. env-contract 泛化四件套（D-163①②③④⑥）**：need 类型扩 `git-object:`/`engine-deps:`/`asset:`＋SKIP reason 修复指引模板（D-072 三段文案：原因→手动命令→无网影响面）＋**git-object 五件 T3 逐件判**（23/26/27/28/43——在仓自足且系正当冻结语料→环境前置；首选临时仓零写入读法 mkdtemp unbundle＋GIT_ALTERNATE_OBJECT_DIRECTORIES 借用使 portable 声明变真，**禁主仓 fetch 写 object store**〔D-074〕；**43-check B1 单裁**——verify 语义本身是 ghost 证据面禁机械归类）＋engine-deps 七件原生绑定探测（38/39/50/53/78/80/83）＋40-clone-cache asset 探测＋tier 真实性逐件重声明（portable=任何 clone 零外部前置）。
- **B. 组级探测四件套（D-164-a）**：`groupProbe(group,needs)` API 下沉 env-contract.mjs＋46-check B/C 挂 `sibling:jiahao`／A·D·E 零需 portable 段＋39-check E 段 registry 面脱 sibling/deps 连坐＋GUARD-RESULT 组级三态渲染＋footer skip 计数跟组粒度＋guard-all-run 分类器同步扩列＋**47-check 组内异质普查**（75a-T3 同窗——调研信息缺口③）。
- **C. fresh-clone 复跑（D-165②＋fresh-clone-rerun-watch）**：泛化+组级落地后独立 worktree clone（无本机环境）→bootstrap→guard-all-run——未册化红=0＋SKIP 件全带可读 reason 方判绿；读数更新 stage2-launch-criteria 判据② 确认行。
- 次序：A 先行（哨兵复跑依赖泛化落地）；B 可与 A 并行（46/39 调用点同窗改写）；C 殿后复验；43-B1 单裁=执行窗首件呈报。

### T2 — BACKLOG #75 票面批2 建制（射程外独立批登记；覆盖 75b §4／D-156③）

- 对象：#75 票面 open/closed 枚举建制＋常量 SSOT＋reserved 机制——独立建制批非本批裁面；开启时点随执行窗落地后临窗再裁（批3/批4 择批点同句显式不预裁）。

### T3 — 审计窗哨兵值守（覆盖 D-155②③／D-164-b／D-165② 兑现面——本窗本体）

- registry manual_watch 复审：next-audit-window 锚 occurred→到期复审（batch2beta-techdebt-review／codebuddy-ide-gap-watch／codebuddy-f02-display-watch／guard-retirement-class／stage2-launch-criteria）。
- **protected-surface-death-watch 随读**：各守卫 PROTECTED_SURFACE 引用物存在性人工普查（零机件——消亡判据事件发生即激活 T3 逐件呈报，不等窗）。
- **fresh-clone-rerun-watch 随读**：泛化落地后当窗必复跑（判据② 复验动作）。
- GAP-B2B 八件逐件 status 重审读数（供退役提案面输入——有无守卫面消亡实例）。
- Stage-2 判据包四读数值守：capability 漏斗态／fresh clone 红面（哨兵复跑读数）／GAP-HOST-01 disposition／findings 消化＋30 日静默窗。
- IDE 面可得→charter 三判据重跑读数标 IDE-specific；F-02 哨兵复测。

### 挂账常项（勿重复烤）

- R28-Q19 复核债／R31-Q6 resume 可选（句柄 a324fdd2-738e-4a71-b220-065c362e2d71）／readme-ci-badge ALARM=值守信号／批3+批4 择批点显式不预裁／T2 票面批2 临窗再裁／**拆件复审触发**（D-164④——groupProbe 落地后连坐仍实质发生再裁 46a/46b 拆件）／**resolve 归属争议点**（评审方可回访时重开）。

## Suggested skills（本窗口）

- **implement / tdd**：T1 三件套实修主驱动（探测类型扩展先机制后接件；groupProbe API→调用点→渲染面→分类器成链）。
- **diagnosing-bugs**：四类前置探测边界＋git-object 临时仓借用读法验证＋47-check 异质普查归因＋判据② 复跑分诊。
- **domain-modeling**：组级探测/消亡判据事件哨兵词条随机制落地同步立（D-156④ 惯例）；ADR-0024 注记同窗。
- **atomcode-research**：新决策题调研入口（题面存档→-p 深调研→辩证呈报→冲突即停标 revised）。
- **gitbutler**：VC 唯一写面——trailer 三栏位全量适用；push/merge 逐次闸门。
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- 判据/charter/裁定临场不可改——变更须先走裁定链；探测面修语义必带预声明验证包（D-147 先例）。
- dry-run 无转窗条件禁长期化；过期差值禁直接转窗；S1 改写禁再自指。
- **工具链避雷**：bash 下 `2>nul` 会写真 `nul` 文件；ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`；写文件经 node/ctx 时 `\u0000` 字面量会物化为真 NUL（A-096 教训）。
- 报告命名纪律：`{date}-r{NN}-exec-report.md`／`-audit-report.md`；DB 探查=副本探查原件 sha256 前后校验。
- **退役判据=面消亡唯一合法路径**——禁命中率/年龄/通过史/断言量作判据（D-160 负向）；退役经 T3 窗逐件非批量；**retired 发射腿禁预建**（D-164-b——空转机件+假阳分诊实证负担；方向反转成本首例临窗补评）。
- **skip 三态语义**：skip=环境缺席、xfail=该工作但物不在——禁混标；skip 不进 allOk 禁折 pass；**组级 SKIP 同纪律组粒度沿用**（D-164-a③）。
- **哨兵触发钉事件非纯时间窗**（D-164-b 消亡判据事件／D-165③ 误声明检测／D-163⑧ npm v12 触碰——首件退役/复发/体制变化禁落两窗间静默丢失）。
- **git-object 访问零写入**——禁主仓 fetch/unbundle 写 object store（D-074）；自足件首选临时仓+alternates 借用。
- **执行窗必带时点锚**（D-165④）——执行义务无限期=变相 accepted-risk 绕三要素禁制。
- **Stage-1 逐案 charter**；**Stage-2 四判据+30 日窗未达标禁启动**（判据② 当前 FAIL 如实值守）。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- 宿主侧操作（插件安装/会话执行/IDE 试用驱动）=用户驱动面，agent 不代行宿主内点击；宿主缺陷不代报官方渠道。
- social-card.png 上传=所有者 web-UI 手动操作。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
- 外部评审工件入仓须先走摄入分诊四档（D-142/D-146）——证伪驳回须附核实依据；勘误二阶修正链式追加不改写原条目（D-165）。
- 审计 finding 处置态封闭三档（D-148②）——Accepted Risk 缺三要素任一=静默丢弃 finding 禁为。
- 规程生效时点=自落盘 commit 起对新行为生效、落盘 commit 自身豁免（D-148③）。
- 试用关窗≠缺陷清零；关窗判据驱动非事件驱动（D-151②/D-152⑤）。
- Stage-1 宿主邀请对象=用户主权逐案闸门（D-162⑤）；Stage-2 公开推广=判据包达标后用户拍板启动（D-162③）。
- 「定稿」语义=分层（D-165）——裁定层闭环声明与验收层未达事实双行呈报，禁单句「已完成」。
