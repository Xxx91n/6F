# Audit: 轮 7 窗口 1（T0+T1+T2）— 2026-09-15 独立审计报告

> 身份：审计 Agent（独立窗口，非修复窗）。审计对象 = `.scratch/macro-audit/reports/2026-09-15-report.md` 及其引用 handoff/票档。
> 方法：不信自述——硬验收全部亲跑；每条声明做仓库实物抽查；双轴评审（Standards + Spec）由两个只读子代理并行取证，fixed point = `6cdcd31`（workspace 公共基座），diff = `6cdcd31...HEAD`（91 文件 / +1818 / -48，含 mqn/vrm/wns/txk/xow/wxk 六提交）。
> 职责分离：本报告只呈报不代修；过程违规单独列出，不替任何窗口追认。

## 1. 声明 → 证据 → 结论 对照表（硬验收全部亲跑）

| # | 报告声明 | 审计亲跑/实物证据 | 结论 |
|---|---|---|---|
| 1 | T0：12 票三件套 + 账本 A-037~A-048 + spec §R5-D1~12 + README 波次表 W12~W15 | 36/36 三件套文件在；账本 12 行齐（A-037 done / A-038·A-039 done→implemented / A-040~048 current）；spec R5-D1~12 各映射 1 条 A-xxx（12 覆盖、无去向清单空）；README W12=3/W13=3/W14=3/W15=1+触发器项 #42，Blocked-by 链与任务书次序一致；43/43 prompts 全含逐字黑体块 | **实质成立**，但证据命令 1 不可原样复跑：`node /tmp/t0-verify.mjs` 今日复跑 = **93/99 HAS-FAIL**（6 处 FAIL 全在「路径可解析」断言——v1 脚本不拆 `、` 连接的多路径行；修复窗自知并在 WORKFLOW lessons 记「首轮 7 误报」，另写 v2 复判 12/12 ALL-PASS）。「96 项结构断言全过」表述失准，且两自检脚本存于 /tmp 未入库 |
| 2 | #33：27 项登记 + 守卫 8/8 | 亲跑 `33-check.mjs` = PASS 8/8 exit 0；registry 实物 27 项四族（checklist-25=13 / ledger-two-field=10 / codelore-deferred=1 / multi-writer=3）+ 13 事件；值守快照 ALARM 4 / WARN 2 / BOUND 2 重现（25-P2 触发+最迟双警、25-B3.3、25-D4） | **成立**（覆盖弱化见 §3-W1） |
| 3 | #34：plugin.json 合 Agent Plugins 1.0.0 | 亲跑 ajv-cli validate（修正路径后）= `engine/plugin.json valid`；schema 副本核为非弱化（required $schema+name、additionalProperties:false、$schema const、extensions 反向域名对象、name pattern）——ajv 通过非空转 | **成立**；报告所引命令 `-s reports/34-plugin.schema.json` 在仓根无此路径（实物在 `.scratch/architecture-recovery/reports/`），命令原文有 cwd 歧义 |
| 4 | #34 常驻守卫 11/11 | 亲跑 = PASS 11/11 exit 0 | **成立**（G11 副作用见 §3-W5） |
| 5 | engine 编译+测试闭环 | `npm test` 亲跑：GEN-OK + tsc 0 错 + SMOKE-OK 6/6 + COLLECTORS-TEST-OK 14/14 + CODELORE-ADAPTER-TEST-OK 7/7 | **成立** |
| 6 | 打包通过 | `npm run package`：macro-audit-0.1.0.tgz，total files 31 | **成立** |
| 7 | 进程测活 | `node dist/cli.js selftest` = `{"ok":true}` 五检查全 pass，exit 0 | **成立** |
| 8 | gen 幂等 | 二次跑全 CLEAN 无 DRIFT + 7 PASS + GEN-OK | **成立** |
| 9 | 立票覆盖闸 12/12 | spec.md §R5-D1~D12 逐条核：各覆盖 A-037~A-048 一条，映射与 spec-phase-tasks R5-01~12、BACKLOG #32~#43 三方一致 | **成立** |
| 10 | 三栈均未 push（用户闸门） | `git ls-remote --heads origin`（github.com/Xxx91n/6F）无 5 分支；`gb-local/*` 为 GitButler 本地簿记 ref（remote URL=`.`），非外推事件 | **成立**（补注 gb-local 语义防误读） |
| 11 | 下窗口就绪：#35 三十面名全命中 `codelore analyze --help` 56 面清单；binary 0.28.0 在 PATH | 亲核 30/30 面名全命中（演化 12 + S3 6 + S5 12，main-dev 三件套 = main-dev/by-deletions/by-revs）；codelore 0.28.0 at ~/.cargo/bin | **成立** |

## 2. D-xxx 覆盖逐条核对（票声明 vs 账本原文 vs 实物）

- **T0 → D-029/030/031/032/033/034/035/036**：八条决策在 macro 账本均在位且票化一致——D-029→#32（逐字措辞块，43/43 prompts 命中）；D-030→#41①四件样例+golden CI（#43）；D-031→#41② capability 1 of 5·preview·0.x·changelog；D-032→#38 DoD happy+failure 双件 + #41 不补 8 路径；D-033→#37/#39/#40 三仓角色绑定；D-034→波次次序（扩面→Macro-C→Micro-A→Micro-B→Macro-A）+ 多写者三触发器入登记表；D-035→#35 首批 30 面/#36 LLM 独立票/#42 dump 对照 + 暂缓面集 20 面入登记表；D-036→票据包形态本身（#34 独立不并入收尾，已照修正执行）。**覆盖成立**。
- **T1 → D-026/034/024**：登记表四族 = checklist-25（D-026 绑定表）/ 两字段（D-024）/ 暂缓面集（D-035④）/ 多写者（D-034④）。声明少报了 D-035④ 输入族（保守少报不算违规）。**覆盖成立**。
- **T2 → D-036 + D-012 余款**：不合规项逐条对消与 D-012 双 manifest/provenance 条款一致；`license` 字段补入不在 31-upstream-drift 不合规清单内，但引 D-012「license+CHANGELOG+签名收据」provenance 条款可辩护且报告已披露。**成立（轻微越单，已披露）**。

## 3. 缺失 / 弱化 / 跑偏（单独列出）

- **W1（弱化）**：#33 机检报警实覆盖 **16/27**——11 项（desk-task2/4/5/7/9/10/11/13/14/15 + codelore-deferred-faces）`trigger_event`/`deadline_event` 双 null，`review_at` 为 prose（「阶段 3 铺开前」等），守卫对其永不报警、复审时刻靠人工盯；「全部挂门项到期报警」目标部分弱化（登记表仍集中兜底可见）。
- **W2（弱化）**：`25-P1` status=`triggered-bound`，但其 trigger_event=`listing-submission` 未发生——「已绑定」被误标「已触发」，状态枚举混淆两轴（P5 的 triggered-bound 则成立：kickoff-gate 已发生）。
- **W3（跑偏-微）**：`issues/33` 与 `handoffs/33` 引用 `reports/R5-Q5-atomcode-research.md` 缺 `../macro-audit/` 前缀（prompt 33 与 registry 写对了——三件套内不一致）。
- **W4（弱化-微）**：mw-trigger-a/b/c 三项以 `—` 占位过 A2「三字段齐备」断言（语义空值不算缺）。
- **W5（观察）**：`34-check.mjs` G11 在「check」内 `execSync` 重跑 gen 改写三份产物再断言幂等——守卫非只读（先例 29/30/31-check 均只读校验）；漂移时先自愈再 FAIL，留副作用。`33-check.mjs` B3 对缺项抛 TypeError 而非显式 FAIL（退出码仍非 0，安全但粗糙）；`AP_SCHEMA`/`AP_ALLOWED` 字面量在 gen 与 34-check 双处复制（漂移风险，建议 34-check 改读 schema 文件 properties）。
- **W6（失同步-微）**：根 README 索引表 `CONTEXT 50 词`（实 54）/`D-001~D-028`（实 D-036）/`A-001~A-030`（实 A-048）三格未随本窗 ADR-0017 格同步；next-round.md 头「A-001~A-030」失同步（本窗编辑该文件未顺带修）；spec.md 头「A-001~A-018」沿袭陈旧（R4 已漏）。README「handoffs 每份含通用调研要求」被 handoff-32 证伪（补立案档有意豁免，但文字未豁免）。A-037 status 文体与兄弟行不一致。
- **B5-2 行**无挂门关键词不可被守卫检出——实体已由 25-B2.1 并项登记覆盖，注记而已。

## 4. 过程违规（单独呈报，不追认）

- **P-V1**：#33/#34 收尾硬要求③「WORKFLOW §4 追加 lessons 行」未执行——两票报告「lessons 候选」滞留未 promote，WORKFLOW lessons 表 0 行对应记录，而 issue 已标 done。按票内逐字规则「缺任一项 = 本票未闭环」，两票闭环形式不全（R4 票 lessons 行已 promote 有先例）。
- **P-V2**：handoff「通用调研要求（每票适用）」对 #33/#34 未产出调研报告（无 33/34-atomcode 产物，报告无调研段与 ≥2 类比）。复用 R5-Q5/31-upstream-drift 既有调研在事实上可辩护，但票内未声明豁免或复用依据。
- **P-V3**：commit `e15db6d`/`6b9a18c`（收口/交接 docs）无 A-NNN/D-NNN 引用——违反 WORKFLOW 2026-09-11 lesson「commit 必须以 A-NNN 起头或引用」规约（软性，非票 commit）。
- **P-V4**：验收证据脚本 `t0-verify.mjs`/`t0-verify2.mjs` 存 /tmp 未入库——「每条可复跑」声明依赖易失路径（本轮审计恰好复跑到，不可保证下次）。

## 5. 结论与处置建议

硬验收 11/11 声明实质成立；D-xxx 覆盖核对成立；三栈未 push、树净。但存在 P-V1/P-V2 两项过程违规与声明 1 表述失准——**建议：打回修复窗口小修后复审**，或由用户明示豁免放行。

### 返工清单（若打回）
1. promote #33/#34 lessons 入 WORKFLOW §4（或显式呈报用户豁免该条款并改规）；
2. #33/#34 调研要求处置：补 atomcode 调研报告，或在报告/handoff 显式登记「复用 R5-Q5 §3 / 31-upstream-drift 为依据」；
3. 修 issues/33 + handoffs/33 的 `../macro-audit/` 路径前缀；
4. 报告声明 1 改如实口径（v1 93/99 + v2 12/12），自检脚本移入 `reports/` 入库；
5. 同步三处计数（根 README 索引表 / next-round.md 头 / spec.md 头）；25-P1 status 语义修正（bound 未 triggered）；
6.（可选）34-check G11 加 `--check` 模式或注释写明变异语义；33-check 缺项显式 FAIL；mw-trigger 占位语义注记；34-check 白名单改读 schema 文件。

### 重跑清单（无论谁修，修后必跑，与本次同套）
`cd engine && npm test`（GEN-OK+tsc+6/6+14/14+7/7）→ `npm run package`（tgz 31）→ `node dist/cli.js selftest`（ok=true）→ `node reports/33-check.mjs`（8/8 exit 0）→ `node reports/34-check.mjs`（11/11 exit 0）→ ajv-cli validate plugin.json（valid）→ `node engine/scripts/gen-manifests.mjs` 二次（CLEAN+GEN-OK）→ t0 自检入仓版（ALL-PASS）。

## 6. 双轴评审原文要点（两只读子代理并行取证）

- **Standards**：硬违规 = README/next-round/spec 头计数失同步（§3-W6）；软违规 = 两收口 commit 无账本引用（P-V3）。判定项 = G11 变异副作用、字面量双处复制、B3 崩溃路径、A-037 文体。确认合规面 = 守卫零依赖+exit 0/1+PASS/FAIL 格式、prompts ≤60 行+逐字块、报告 §4.2.5 结构、registry 数学一致。
- **Spec**：缺失 = WORKFLOW lessons（P-V1）、atomcode 调研产物（P-V2）、报警覆盖 16/27（W1）；越单 = license 字段（轻微、已披露、D-012 可辩护）；疑似跑偏 = G11 变异、B3 崩溃、P1 状态语义、计数失同步、issues/33 路径。已证正确面 = 12 三件套、账本映射三方一致、registry 覆盖 13 挂门行+10 两字段+20 暂缓面+3 触发器、plugin.json 对消清单精确、ALARM 4/2/2 可复现。

## 引用

- 被审对象：`.scratch/macro-audit/reports/2026-09-15-report.md`、`handoffs/next-round.md`、`handoffs/2026-09-15-r7-window1.md`
- 票档：`reports/32-report.md`、`33-report.md`、`34-report.md`、`33-gate-registry.json`、`34-plugin.schema.json`
- 取证子代理：Standards / Spec 各一（explore 只读），fixed point `6cdcd31`

## 7. 复审结论（2026-09-15 同日，返修后重跑）

修复窗按返工清单执行完毕（commit `mrs`@34-plugin-json-compliance + `wmn`@r7-session-1-closeout）。逐项复审：

- P-V1 ✅ WORKFLOW §4 新增 R5 #33/#34 两条 lessons 行（五列格式合规）；
- P-V2 ✅ 33/34-report 各补「调研依据（复用声明）」段——引用 R5-Q5 §3 / 31-upstream-drift §4 / schema 实物副本，明示未另跑 atomcode 的依据，非静默；
- P-V3 ✅ 两个返修 commit 均带 A-037..A-039 / D-029..D-036 引用（历史两 commit 不回改，登记备查）；
- P-V4 ✅ t0 自检脚本入库 `reports/32-t0-verify{,2}.mjs`（v1 多路径行拆分缺陷已修，99/99 ALL-PASS）；报告声明 1/3 改如实口径并在偏差节登记；
- W2 ✅ registry 25-P1 改 `pending`（bound_to 保留），BOUND 快照改由 bound_to 推导——P1 显示为绑定未触发，语义正确；
- W3 ✅ R5-Q5 路径前缀补齐 4 处（issues/33、handoffs/33、decision-ledger A-038 行、AR README 值守行）；
- W5 ✅ 34-check G11 改为漂移时恢复原状再 FAIL（守卫恢复只读语义）+ 白名单改读 schema 文件 properties；33-check B3 缺项显式 FAIL；mw-trigger 占位语义化；
- W6 ✅ 根 README（54 词/D-036/A-048）、next-round 头、spec.md 头三处计数同步；AR README handoffs 段补 #32 豁免注记、覆盖行同步；
- W1（报警覆盖 16/27）维持设计限制如实登记——desk 两字段项与暂缓面集复审靠 prose review_at，留作后续票评估项，不阻塞本轮。

**重跑验收（与首轮同套）**：`npm test` = GEN-OK + tsc 0 错 + SMOKE 6/6 + COLLECTORS 14/14 + ADAPTER 7/7；`npm run package` = tgz 31 文件；`selftest` ok=true 5/5；33-check 8/8、34-check 11/11、32-t0-verify 99/99、32-t0-verify2 12/12 全 exit 0；ajv `plugin.json valid`；gen 二次 CLEAN+GEN-OK。registry 返修期间曾被外部重排版（54→392 行），审计窗亲核语义差仅 4 处目标字段后压回原格式，diff 保持最小。

**审计终判：PASS（返修后）**。轮 7 窗口 1 交付（T0+T1+T2）全部声明成立、过程违规清零、残余项已如实登记。
