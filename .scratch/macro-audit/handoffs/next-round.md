# next-round — 轮 38 常驻任务书（轮 38 grill 封口·CodeBuddy 试用三裁＋执行协议＋完备性核查 D-150~D-152 全定后）

> 生成：2026-09-27 轮 38 收口。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-001~D-152：**141 current**／10 revised＝D-002/008/012/014/022/059①款/072/100②款/101③款/142①款／1 closed=D-019；本轮注记=R38 收口节——**勘误**：runtime-doctor-trigger 已于 2026-09-18 T6 discharged-decided，CodeBuddy 试用=第二宿主链路非首锚／「先行」=排程优先注记挂 D-150⑤）；quarantine 总成=`docs/adr/0022-quarantine-engine.md`；Micro-B 总成=`docs/adr/0023-micro-b-file-card-architecture.md`；执行账=`.scratch\architecture-recovery\decision-ledger.md`；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 25~37 留痕（已定，勿重复）

- 轮 25 grill 五裁（D-092~D-096）～轮 36 grill 封口（D-148~D-149）：详见历轮收口节——字面钉三分类/quarantine 建制/Micro-B 设计树/四轮锐评辩证处置/守卫组升格触发器登记全在案。
- **轮 28**：T1 交付（A-089 #77 门面收口包）＋grill 封口 quarantine 设计树 18 裁全定（D-103~D-120）＋去向全归 #78；轮 29 #78 quarantine 建制 LOOP-2 PASS 闭环。
- **轮 37 实施+审计收口（2026-09-27）**：T1=#75批1 升格主线落地——失效断言三分类建制（静默红 12 件全过 D-094 门：11 合法漂移改断言＋1 入 known-red-manifest kr-01＋0 欺诈死面）＋75a-check 字面钉普查 348 条全归因注册＋41a-D7 结构不变量化（编年键覆盖集∋dMax）＋guard-all-run 升格执行器（60 件动态枚举＋红集⊆册判据生效）；审计首轮打回（F1：git auto-abbrev 7→8 跳变撞 %h 字面钉）→%H 全锚+startsWith 等值窄修→**LOOP-2 PASS**；handoff `2026-09-27-r37-audit-pass-handoff.md`。
- **轮 38 grill 封口（2026-09-27）**：CodeBuddy 试用三裁＋执行协议＋完备性核查——**D-150**（核销呈报＋试用三裁〔插件全路径主验收+CLI 裸跑对照／本仓自审+env-manager／三段判据〕＋兼容性证伪实证收口零预修＋渠道合规注记义务＋试用先行）；**D-151**（parity 基线=(iv) 安装树自对照钉 SHA／exit-success 双轴封口判据＋SBTM 三件套＋feasibility 标题语义／trials/ 档案位新立＋findings 票面五要素+dedup-first）；**D-152**（完备性核查=定稿不早产＋charter 预声明三行＋R-a/b/c 参数＋关窗禁注册事件负向留痕）；调研 `R38-Q{1,2,3}-*.md` 全存档；**本轮零 revised**。
- xfail 摘除注记（7 条批）：执行侧已落、人工追认侧待批（D-102①）；**entries 当前 0/10**。

## 历史票面闭环索引（守卫锚点留痕）

- T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16；T11 #39 mw-trigger 接线 ✅ DONE（39-check 38/38）；T14 #43 golden 重基线 ✅ DONE（43-check 28/28）；#40 gsd-core ✅（40-check 57/57）；#45 demo 三 scenario ✅（45-check 51/51 复测确认）
- **#81 方言归一 ✅**／**#82 仓务批 ✅**／**#80 步② 投影+查询 ✅**／**#83 审计修批 ✅**／**R34 收口实施批 ✅**
- **R36 T1 P4 as-cast 返工 ✅**（A-094）／**R36 T2 #80 步③血缘缝合 ✅**（A-095+A-096 LOOP PASS——披露四件套+试点集 4 of 5 capability preview）
- **R37 T1 #75批1 升格主线 ✅**（失效断言三分类建制＋75a 普查 348 条＋41a-D7 不变量化＋guard-all-run 升格执行器；LOOP-2 PASS）
- #75 批2=348 条分档实修挂 T2；r37 审计 §10/§11 呈报七件（38-F2/25-C5a/37-C2/20-A5/26·28·30 机件重复/manifest 笔误/01-spotcheck 尾行）全归批2 合流，不逐裁（D-150⑤）。

## 口径基线（读前必知）

- 账本：D 面 152 条（141 current）；A 面 max A-098；编年 max M-022。
- **守卫判据（升格后形态，D-149④ fired）**：收口前跑 `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（动态枚举全量）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；18 件枚举为升格前基线历史快照存证。
- 收口工序前置（D-144①④/D-145①）：账行增量↔编年随行核对＋守卫组硬跑；engine/src|dist 触碰→`npm run build`＋`node scripts/check-dist.mjs` 零 drift 再 commit；「本轮无账行增量」可显式声明豁免。
- 试用判据预声明已入库=`.scratch\macro-audit\trials\codebuddy-r38-charter.md`——试用窗开启即受其约束（Kill Criterion 兑现）。
- registry=61 项/42 事件（33-check 基线）；risk_accepted 通道在册 2 件（r1/r2）。

## 任务序列

### T1 — CodeBuddy 试用窗执行（主线；覆盖 D-150②③④／D-151①②③／D-152②④⑤⑥⑦⑧）

- charter 在盘：`trials/codebuddy-r38-charter.md`——三判据/三悬点/预声明规则/findings 五要素票面全预声明。
- 执行分工：CodeBuddy 侧 agent＝用户驱动（宿主内 `/plugin marketplace add`+`install`+agent 驱动审计）；本侧记录者＝session 记录辅助＋debrief 文书＋findings D-146 四档初分。
- 关窗判据=exit 完备性（三判据全跑有读数＋findings 全过初分＋三件套落 trials/）；success 独立取值不预设。
- findings 仍开放者→立 D-xxx 或挂 T2 优先级重排。

### T2 — BACKLOG #75 批2 字面钉分档实修（覆盖 D-149③④／D-150⑤／D-152③）

- 对象=75a-check 普查 348 条注册项＋r37 呈报七件合流。
- 处置门=D-094 三分类（合法漂移→改断言或入册带期限/真坏→修现实/欺诈死面→禁入 manifest）。
- 排程语义：批2 无依赖项可并行准备（普查重扫/分档草案），处置顺序服从 T1 findings 回流重排（D-152③ 注记）。

### T3 — 试用关窗后事项（覆盖 D-152⑤／D-150④ 注记②更新）

- 注记②「实证待真机收口」→按 D-146⑤ 勘误惯例更新为实测结论（engine/README 宿主兼容注记行）。
- 关窗时未实测残项→manual_watch 五要素触发器接力（Trigger-gated 正确接法）。
- 批2 优先级按试用 findings 实态重排执行。

### 挂账常项（勿重复烤）

- R28-Q19 复核债／R31-Q6 resume 可选（句柄 a324fdd2-738e-4a71-b220-065c362e2d71）／xfail 批摘 D-102① 追认待批／readme-ci-badge ALARM=值守信号。

## Suggested skills（本窗口）

- **atomcode-research**：新决策题调研入口（题面存档→-p 深调研→辩证呈报→冲突即停标 revised）。
- **implement / tdd**：T2 批2 实修主驱动。
- **diagnosing-bugs**：T1 试用 findings 归因（Assignable Cause）＋三悬点实证判读。
- **domain-modeling**：CONTEXT 词条维护（宿主试用/安装树自对照两词条已落可参照形制）。
- **gitbutler**：VC 唯一写面——本任务书已 commit 防丢；后续 push/merge 逐次闸门。
- **handoff**：下轮收口同规程再生。

## 窗口边界纪律（D-101 精神沿用）

- grill 期间不动源码；试用执行只在宿主会话面（本仓工件=charter/记录/报告类文书）。
- 判据/charter 临场不可改——变更须先走裁定链；T1 findings 未分诊禁直接修（D-146 硬边界）。
- **工具链避雷**：ctx 沙箱 bash 注入 NODE_OPTIONS 污染 stderr——宿主级测试先 `env -u NODE_OPTIONS`；写文件经 node/ctx 时 `\0` 字面量会物化为真 NUL（A-096 根因教训）。
- 报告命名纪律：`{date}-r{NN}-exec-report.md`／`-audit-report.md`；试用件命名 `codebuddy-r38-{charter|session|report}.md`。
- DB 探查纪律：audits/ 下证据库一律副本探查（cp 到 Temp 再 --db），原件 sha256 前后校验。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- CodeBuddy 侧操作（插件安装/会话执行）=用户驱动面，agent 不代行宿主内点击。
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
- 外部评审工件入仓须先走摄入分诊四档（D-142/D-146）——证伪驳回须附核实依据。
- 审计 finding 处置态封闭三档（D-148②）——Accepted Risk 缺三要素任一=静默丢弃 finding 禁为。
- 规程生效时点=自落盘 commit 起对新行为生效、落盘 commit 自身豁免（D-148③）。
- 试用关窗≠缺陷清零；关窗判据驱动非事件驱动（D-151②/D-152⑤）。
