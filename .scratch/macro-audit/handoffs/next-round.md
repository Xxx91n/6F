# next-round — 轮 39 常驻任务书（轮 39 grill 封口·CodeBuddy 试用关窗核认＋批2-β 探测面硬化 D-153~D-156 全定后）

> 生成：2026-09-27 轮 39 收口。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-001~D-156：**145 current**／10 revised＝D-002/008/012/014/022/059①款/072/100②款/101③款/142①款／1 closed=D-019；本轮=R39 收口节——**勘误**：N1/N2 去向断链补登 GAP-B2B-07/08）；quarantine 总成=`docs/adr/0022-quarantine-engine.md`；Micro-B 总成=`docs/adr/0023-micro-b-file-card-architecture.md`；探测面硬化立法载体=ADR-0024（批2-β 执行窗起草义务在案）；执行账=`.scratch\architecture-recovery\decision-ledger.md`；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 25~38 留痕（已定，勿重复）

- 轮 25 grill 五裁（D-092~D-096）～轮 36 grill 封口（D-148~D-149）：详见历轮收口节——字面钉三分类/quarantine 建制/Micro-B 设计树/四轮锐评辩证处置/守卫组升格触发器登记全在案。
- **轮 28**：T1 交付（A-089 #77 门面收口包）＋grill 封口 quarantine 设计树 18 裁全定（D-103~D-120）＋去向全归 #78；轮 29 #78 quarantine 建制 LOOP-2 PASS 闭环。
- **轮 37 实施+审计收口（2026-09-27）**：T1=#75批1 升格主线落地——失效断言三分类建制（静默红 12 件全过 D-094 门：11 合法漂移改断言＋1 入 known-red-manifest kr-01＋0 欺诈死面）＋75a-check 字面钉普查 348 条全归因注册＋41a-D7 结构不变量化＋guard-all-run 升格执行器（60 件动态枚举＋红集⊆册判据生效）；LOOP-2 PASS。
- **轮 38 grill 封口（2026-09-27）**：CodeBuddy 试用三裁＋执行协议＋完备性核查——D-150~D-152 全 current；charter/session/report 三件套落 trials/。
- **轮 38 T1 试用执行关窗（2026-09-27）**：CLI 2.151.0 三判据全 hit（C1 安装链四步零文档外干预／C2 安装树自对照 parity：report.json 70 键、17 语义锚、facts 960 行×872583B 逐字节等、measurements 字节等〔唯一差=evidence[].reproduce_cmd per-run 路径〕／C3 preview 披露诚实）＋三悬点全实证＋findings×4 全不进裁定链；IDE 形态 not-run→GAP-HOST-01＋manual_watch 接力；LOOP-1 PASS（closeout handoff 2026-09-27-r38-t1-closeout-handoff.md）。
- **轮 39 grill 封口（2026-09-27）**：D-153（射程 b′）／D-154（批2-β 行为语义三裁＋ADR-0024 义务）／D-155（登记处置面打包：技术债八件两全形态＋IDE manual_watch＋F-02 哨兵观察不上报）／D-156（完备性终裁：定稿不早产＋N1/N2 断链补登＋批4 对称性＋词条声明）；**本轮零 revised**。
- xfail 摘除注记：执行侧已落（45-check H5 摘除＋xfail-run 复绿）、人工追认注记已登 R39 收口节（D-102① 封闭）；**entries 当前 0/10**。

## 历史票面闭环索引（守卫锚点留痕）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16；T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）；T14 #43 golden 重基线 ✅ DONE（43-check 28/28）；#40 gsd-core ✅（40-check 57/57）；#45 demo 三 scenario ✅（45-check 51/51 复测确认）
- **#81 方言归一 ✅**／**#82 仓务批 ✅**／**#80 步② 投影+查询 ✅**／**#83 审计修批 ✅**／**R34 收口实施批 ✅**
- **R36 T1 P4 as-cast 返工 ✅**（A-094）／**R36 T2 #80 步③血缘缝合 ✅**（A-095+A-096 LOOP PASS——披露四件套+试点集 4 of 5 capability preview）
- **R37 T1 #75批1 升格主线 ✅**（失效断言三分类建制＋75a 普查 348 条＋41a-D7 不变量化＋guard-all-run 升格执行器；LOOP-2 PASS）
- **R38 T1 CodeBuddy 试用窗 ✅**（CLI 三判据 hit＋三悬点实证＋findings×4 分诊闭环；LOOP-1 PASS）
- #75 批2=348 条分档实修——批2-α 七件已闭环；批2-β 探测面硬化裁定已立案挂 T1。

## 口径基线（读前必知）

- 账本：D 面 156 条（145 current／10 revised／1 closed=D-019 沿旧例）；A 面 max A-099；编年 max M-024。
- **守卫判据（升格后形态，D-149④ fired）**：收口前跑 `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（动态枚举全量）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；18 件枚举为升格前基线历史快照存证。
- 收口工序前置（D-144①④/D-145①）：账行增量↔编年随行核对＋守卫组硬跑；engine/src|dist 触碰→`npm run build`＋`node scripts/check-dist.mjs` 零 drift 再 commit；「本轮无账行增量」可显式声明豁免。
- **registry=65 项/44 事件**（33-check 基线；轮39 增 batch2beta-techdebt-review/codebuddy-ide-gap-watch/codebuddy-f02-display-watch＋next-audit-window 哨兵锚）；risk_accepted 通道在册 2 件（r1/r2）。
- **known-gaps 台账**：quarantine 四件（GAP-078-*）＋批2-β 登记批九行（GAP-B2B-01~08 triaged＋GAP-HOST-01 observed——宿主形态矩阵 CLI=verified/IDE=observed-unverified，禁 CLI 外推 IDE）。
- 宿主实证面：CodeBuddy **CLI** 三判据 hit 已封口；IDE 未实测残项在册值守。

## 任务序列

### T1 — 批2-β 探测面硬化实施批（主线；覆盖 D-153②／D-154①②③／D-156④）

- ① `unstrippedScanHit` 豁免判据改测 `stripComments(srcText)` 剥后消费位（注释提名不再豁免；import/真实调用计消费位）——实测 comment-only 逃逸=0，存量 41 件册零迁移。
- ② multi-hit 扩面 `.includes(`/`.test(` 字面量＋walk 补 `.scratch/macro-audit/`：**先 dry-run 只报不判→delta 全量一次过 D-094 三分类批注册→预声明转窗=分诊完成当日转 enforcing、漂移以转窗日实跑重算 delta 禁用过期差值**（baseline-ratchet 形态）；dry-run 产物写独立工件位非 findings 主件。
- ③ SCAN_EXEMPT 摘 guard-all-run 死项（D-094③ 归因=枚举面文案漂移合法演化类）＋S1 改写 `SCAN_EXEMPT ⊆ walked 枚举面` 可达性自检——改写后 S1 自命中修后探测器→携归因注记入册（348→349）作①修法正对照。
- ④ `docs/adr/0024` 起草收①②取舍论证（③处置类不入）；41 件册 note 挂 ADR-0024 指针同行；CONTEXT「消费位判据/豁免集可达性自检」词条随 ADR 落地同步立（D-156④）。
- 编年随该实施 commit（D-144①）；engine/src|dist 触碰走 build+check-dist 前置（D-145①）。

### T2 — BACKLOG #75 票面批2 建制（射程外独立批登记；覆盖 75b §4／D-156③）

- 对象：#75 票面 open/closed 枚举建制＋常量 SSOT＋reserved 机制——独立建制批，非本轮裁面；开启时点随批2-β 落地后临窗再裁（批3/批4 择批点同句显式不预裁）。

### T3 — 审计窗哨兵值守（覆盖 D-155②③／D-156②③ 兑现面）

- registry 三新项值守节律：next-audit-window 哨兵锚 occurred→复审义务激活（33-check ALARM）；技术债八件逐件 status 重审。
- IDE 形态可得/用户启用 IDE 面→按 charter 三判据重跑，读数标 IDE-specific。
- F-02 哨兵复测：`codebuddy mcp list` 对照会话内连通态——宿主侧守望非本仓缺陷、不主动上报（用户授权另行）。

### 挂账常项（勿重复烤）

- R28-Q19 复核债／R31-Q6 resume 可选（句柄 a324fdd2-738e-4a71-b220-065c362e2d71）／readme-ci-badge ALARM=值守信号／批3（76 件点级锚）+批4（existence-assert 115 件升格）择批点显式不预裁（D-153④/D-156③）。

## Suggested skills（本窗口）

- **implement / tdd**：T1 批2-β 实修主驱动（dry-run→批注册→enforcing 序内做 mutation 级验证）。
- **diagnosing-bugs**：②delta 检出件 D-094 分诊归因＋gitOut status 盲区 false-green 面修复验证。
- **atomcode-research**：新决策题调研入口（题面存档→-p 深调研→辩证呈报→冲突即停标 revised）。
- **domain-modeling**：ADR-0024 落地时 CONTEXT 词条同步立（消费位判据/豁免集可达性自检）。
- **gitbutler**：VC 唯一写面——本任务书已 commit 防丢；后续 push/merge 逐次闸门。
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- 判据/charter/裁定临场不可改——变更须先走裁定链；探测面修语义必带预声明验证包（D-147 先例）。
- dry-run 无转窗条件禁长期化；过期差值禁直接转窗（以转窗日实跑重算）；S1 改写禁再自指。
- **工具链避雷**：ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`；写文件经 node/ctx 时 ` ` 字面量会物化为真 NUL（A-096 根因教训）。
- 报告命名纪律：`{date}-r{NN}-exec-report.md`／`-audit-report.md`；试用件命名 `codebuddy-r38-{charter|session|report}.md`。
- DB 探查纪律：audits/ 下证据库一律副本探查（cp 到 Temp 再 --db），原件 sha256 前后校验。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- 宿主侧操作（插件安装/会话执行/IDE 试用驱动）=用户驱动面，agent 不代行宿主内点击；宿主缺陷不代报官方渠道（授权另行）。
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
- 外部评审工件入仓须先走摄入分诊四档（D-142/D-146）——证伪驳回须附核实依据。
- 审计 finding 处置态封闭三档（D-148②）——Accepted Risk 缺三要素任一=静默丢弃 finding 禁为。
- 规程生效时点=自落盘 commit 起对新行为生效、落盘 commit 自身豁免（D-148③）。
- 试用关窗≠缺陷清零；关窗判据驱动非事件驱动（D-151②/D-152⑤）。
