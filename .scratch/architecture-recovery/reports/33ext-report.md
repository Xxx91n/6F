# 33ext-report — 挂门守卫扩展（registry watch 三态 schema 齐备化＋manual_watch 值守扫描）

> 票：#33 扩展子项 / R6-05｜A-xxx：A-053｜决定：D-041（watch 三态＋分层处置五款）、D-026⑤（值守规则）、round8-35-audit W6（fail-open 补洞呈报）
> issue：`.scratch/architecture-recovery/issues/33-ext-watch-guard.md`；handoff：`.scratch/architecture-recovery/handoffs/33-ext-watch-guard.md`；prompt：`.scratch/architecture-recovery/prompts/33-ext-watch-guard.md`
> 阻塞状态：**None**（#33 本体 done；D-041⑤ 归票=同族增量不立大票）
> 核心产物：`33-gate-registry.json`（7 项 manual_watch 五要素补齐＋micro-a-preview-prep 事件＋meta schema 落文）、`33-check.mjs`（D 组 7 断言＋E 组值守扫描＋COVERAGE 输出，8→16 断言）、`update-33ext-registry.mjs`（幂等迁移）

## ① 开工复述

必读清单逐条已解析：next-round.md T7 行（任务书原文——五要素/守卫增强范围逐字以此为准）、BACKLOG #33 行（扩展子项 D-041 注记）、A 账本 A-053 行（current）＋A-038 行（#33 原票）、macro-audit 账本 D-041（manual_watch 五要素＋逾期转 risk_accepted＋覆盖率指标逐字）/D-026（值守规则）/D-034（层序与触发器）、round8-35-audit.md W6 行（fail-open＋watch 零校验两洞——本票正是补这两个洞）、reports/33-check.mjs＋33-gate-registry.json（8 断言/30 项/14 事件现状）、reports/44-check.mjs（两段式/noBom 先例）、reports/update-40-registry.mjs（登记表迁移先例）、WORKFLOW §4.2。

**票档补立（计票内）**：33-ext-* issues/handoffs/prompts 三件套缺位（#44/#45/#41a 同型缺口第四次出现），按 issues/41a 模板补立后开工。

## ② 调研（决策原文对账 + 先例回顾）

**D-041 逐字对账**：① 三态=event_bound（默认）/manual_watch（显式五要素：标记+责任人+复审时点+验证方法+确认记录）/risk_accepted（接受人+理由+到期日）；③ 守卫语义=manual_watch 扫「复审时点逾期 or 确认记录缺失」、逾期转 risk_accepted 候选报警、每次运行输出 event_bound/total 覆盖率；注记=MANUAL_WATCH 是过渡态非终点、人工确认须留痕（判据版本/判定人/理由/时间戳——「ran but undocumented」为监管级 finding）、prose 复审本身不构成补偿控制、覆盖率缺口永远显式可见不隐性。

**W6 两洞对账**：`it.trigger_event && reg.events[...]` 对悬空事件引用静默跳过（fail-open——挂门守卫最危险方向，窗口期内 typo 不报警）＋对新 watch 字段零校验。本票 D4/D1 分别堵死：全部事件引用（trigger_event/deadline_event/review_event）悬空=显式 FAIL；watch 枚举非法=FAIL。

**先例回顾**（D-041 已取证可引＋本票实物对账）：① PCI/NIST 补偿控制——manual_watch 是补偿控制载体，无五要素（责任人/复审时点/验证方法/留痕）即「纸面控制」；② MHA 残余风险接受——risk_accepted 三要素（接受人+理由+到期日）对应工业界 risk acceptance 记录最小集；③ Sigma360 watchlist 分层盯梢——复审逾期升档候选名单而非自动翻转，与「风险接受须有权人签字」同构；④ #42 票教训「触发条件为条件时选 manual_watch 而非强绑事件」——复审时点同理：复审锚是事件不是日历（不发明日期）；⑤ 44-check 两段式/noBom/留痕字段先例直接复用。

**atomcode 通道**：本窗口不可用（同 #36~#41a/#43/#44 窗口），调研=账本原文逐字对账＋既有先例实物核验，登记非阻塞。

## ③ 开源轮子/落地物

- `reports/update-33ext-registry.mjs`（新增，幂等）：一次性迁移——manual_watch 7 项补 `owner`/`review_event`/`verify_method`（已有字段不覆写）＋`confirmations` 归一数组＋登记 `micro-a-preview-prep` 事件＋meta 落文 `watch_schema`/`confirmation_schema`/`extended`；写回后回读断言（五要素缺失/事件/BOM 任一失败 exit 1）。
- `reports/33-gate-registry.json`（数据改动）：
  - meta：`extended`（A-053 登记＋W6 补洞）＋`watch_schema` 三态契约落文＋`confirmation_schema` 留痕契约落文（at/by/criterion_version/reason 四必备、evidence 锚、decision 标签）。
  - events +1：`micro-a-preview-prep`（occurred=false）——Micro-A preview 前置审计机读锚（层序 D-034：Macro-C 已闭环，Micro-A 为下一层）；事件 14→15。
  - items 30 项不变；manual_watch 7 项五要素 3/5→5/5：desk-task4/9/11（owner=收口窗口指派+登记位 task probe、review_event=stage3-close、verify_method=33-check E 段＋probe.satisfaction 判据清点）；codelore-deferred-faces/llm-mcp-face/upstream-probes（review_event=micro-a-preview-prep）；codelore-residual-faces（review_event=[micro-a-preview-prep, stage3-close] 双锚取先到）。
- `reports/33-check.mjs`（守卫扩展，并入本体不分立——裁定见 ⑤1）：
  - D 组 7 断言：D1 watch 三态枚举（缺省=event_bound）；D2 manual_watch 五要素齐备（7 项）；D3 risk_accepted 三要素（0 项 vacuous pass）；D4 **事件引用 fail-closed**（46 处引用全可解析，悬空=FAIL——W6 洞）；D5 event_bound 项均有事件锚；D6 confirmations 留痕四字段齐备（5 条，evidence 缺→WARN）；D7 BOM。
  - E 组值守扫描：manual_watch 项（status≠decided）复审逾期（review_event occurred）→ALARM＋RISK-ACCEPTED-CANDIDATE 候选名单；复审窗口进行中→WARN；确认记录缺失（confirmations 空）→WARN（D-041③ 缺口显式可见）；E1 扫描全覆盖断言（7/7）。
  - 快照增量：`RISK-ACCEPTED-CANDIDATE` 行＋`COVERAGE event_bound 23/30 items` 行＋汇总行尾追加候选计数——既有 WARN/ALARM/BOUND 格式零破坏。
- 票档三件套：issues/handoffs/prompts/33-ext-watch-guard.md（按 41a 模板）。

**engine 源码零改动**；upstream/ 层零改动（ADR-0014）。

## ④ 完成定义 vs 实际

### 4.1 任务书 T7 七条逐项

| 任务书原文 | 落地 | 证据 |
|---|---|---|
| ① registry watch 三态 schema 齐备化——manual_watch 五要素对全部 manual_watch 项补齐（值从实物推） | 7 项五要素 3/5→5/5：标记=watch 值、责任人=owner（收口窗口指派＋登记位）、复审时点=review_at prose＋review_event 机读锚、验证方法=verify_method（33-check E 段＋各项判据清点）、确认留痕=confirmations[] | 33-check D2 PASS 7/7；update-33ext-registry.mjs MIGRATION-OK |
| ② 守卫扫 manual_watch「复审逾期 or 确认记录缺失」——逾期项显式 WARN/ALARM | E 组：逾期→ALARM、确认缺失→WARN（首跑 7 项确认缺失 WARN 如实落出） | 33-check E1＋快照 WARN×7 |
| ③ 逾期转 risk_accepted 候选报警——候选名单不自动翻转 status | RISK-ACCEPTED-CANDIDATE 快照行＋汇总计数；红证 micro-a-preview-prep occurred→4 项候选名单、status 无一翻转 | 红证②输出（见 ⑥） |
| ④ 每次运行输出 event_bound/total 覆盖率 | `COVERAGE event_bound 23/30 items（manual_watch 7 / risk_accepted 0）` | 33-check 快照行 |
| ⑤ 确认动作留痕——confirmations 记录结构规范落文（判据版本/判定人/理由/时间戳字段） | meta.confirmation_schema 落文四必备字段＋evidence/decision 语义；D6 断言全库 5 条记录四字段齐备（evidence 缺→WARN） | 33-check D6 PASS |
| ⑥ 事件引用改 fail-closed＋watch 字段校验同上 | D4：trigger/deadline/review_event 46 处引用悬空=FAIL（红证①：注入 nonexistent-event-x→FAIL 1/16 exit 1）；D1 watch 枚举非法=FAIL | 红证①输出（见 ⑥） |
| ⑦ 守卫 PASS＋不回归——并入 33-check 还是分立 33ext-check 按惯例裁定写明理由 | **并入 33-check.mjs**（理由见 ⑤1）；全量重跑 PASS 16/16 exit 0；npm test 全链绿＋package＋selftest 不回归 | ⑥ 收尾清单 |

### 4.2 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| 五要素齐备＋值从实物推 | §4.1① |
| 守卫扫「复审逾期 or 确认缺失」 | §4.1② |
| 候选名单不自动翻转 | §4.1③ |
| event_bound/total 覆盖率 | §4.1④ |
| confirmations 留痕规范落文（四必备字段；evidence→WARN） | §4.1⑤ |
| fail-closed＋watch 枚举校验 | §4.1⑥ |
| 33-check 全量重跑＋快照格式不破坏＋npm test 不回归 | §4.1⑦、⑥ |
| 账本/lessons/issue/next-round/BACKLOG/commit 引 A-053＋守卫结果 | 见收口段 |

## ⑤ 卡死 3 连问 + 决策对照

无卡死。**裁定 1——断言并入 33-check 本体 vs 独立 33ext-check.mjs：取并入。** 理由：33-check 是全票共识引用的单一挂门守卫（各票 commit/报告口径「33-check N/N」为统一哨兵），分立会造成双跑约定漂移（哪个必须先跑、口径以谁为准）＋watch schema 校验与 A/B/C 组数据源同源（同一 registry/事件表），拆出去反而割裂 fail-closed 覆盖面；44-check 先例亦为本票守卫族单文件多组。E 组为值守扫描非断言组，与既有 C 组「判定循环＋快照输出」同构，并入后单文件职责仍=挂门登记表守卫。**裁定 2——复审时点机读锚取事件不取日历**：manual_watch 各项 review_at 全是事件型 prose（「阶段 3」「Micro-A preview 前置」「下个收口窗口」），无一日历日——编日期=虚构。登记 `micro-a-preview-prep` 新事件为 Micro-A 前置机读锚（stage3-close 复用既有事件）；desk-task11「/ 语言栈变更时」非登记事件，机读锚取 stage3-close＋verify_method 注明提前触发语义保留在 prose。review_event 允许数组（residual-faces 双锚=任一先到即逾期）。**裁定 3——「确认记录缺失」WARN 判据=confirmations 空数组**：字段缺失已由 D2 FAIL 兜住（schema 层）；运行态 WARN 打在「登记以来零确认留痕」——D-041③「覆盖率缺口永远显式可见不隐性」的直接实现，7 项 WARN 每跑必现直至人工确认落痕，是设计信号非噪音。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| manual_watch 五要素齐备（7 项：标记/责任人/复审时点/验证方法/确认留痕） | `node .scratch/architecture-recovery/reports/33-check.mjs` → D2 PASS 7/7 |
| watch 三态枚举合法＋risk_accepted 三要素（0 项）＋event_bound 事件锚 | D1/D3/D5 PASS |
| 事件引用 fail-closed（46 处全解析；悬空=FAIL exit 1） | D4 PASS＋红证①：注入 `trigger_event=nonexistent-event-x` → `FAIL D4 … 25-B1.3.trigger_event=nonexistent-event-x` exit 1，复原 exit 0 |
| manual_watch 扫描：逾期→ALARM+候选名单、确认缺失→WARN、不翻 status | E1 7/7＋红证②：`micro-a-preview-prep.occurred=true` → 4 项 `ALARM …复审逾期`＋`RISK-ACCEPTED-CANDIDATE`×4（desk-task4/9/11 锚 stage3-close 未至仍 WARN——双锚/分锚语义正确），status 零翻转，复原 exit 0 |
| COVERAGE event_bound/total 每运行输出 | 快照行 `COVERAGE event_bound 23/30 items（manual_watch 7 / risk_accepted 0）` |
| confirmations 留痕四字段（5 条记录齐备；evidence 缺→WARN） | D6 PASS；meta.confirmation_schema 落文 |
| 登记表/守卫/迁移脚本无 BOM | D7 PASS；迁移脚本回读断言 BOM=false |
| 迁移幂等可重跑 | `node .scratch/architecture-recovery/reports/update-33ext-registry.mjs` → `MIGRATION-OK`（manual_watch items=7 五要素缺失=无 / events=15 / items=30） |
| 守卫 PASS＋快照格式不破坏 | `node .scratch/architecture-recovery/reports/33-check.mjs` → **PASS 16/16** exit 0（WARN/ALARM/BOUND 行格式同前，新增 RISK-ACCEPTED-CANDIDATE/COVERAGE 行） |
| engine 全链绿不回归 | `cd engine && npm test` → 全绿（GEN-OK＋tsc 0 错＋SMOKE 6/6＋COLLECTORS 14/14＋ADAPTER 7/7＋BATCH1 41/41＋LLM 25/25＋REPORT-PREVIEW 5/5＋INTAKE 31/31＋DEMO 38/38）；`npm run package`＋`node dist/cli.js selftest` ok（见收口段实测行） |
| 票档三件套/账本/lessons/任务书/BACKLOG/日报窗口节 | issues|handoffs|prompts/33-ext-watch-guard.md 落盘；A-053→implemented；WORKFLOW §4 +1；next-round T7 ✅＋进度块；BACKLOG #33 行；2026-09-16-report.md 窗口节 |

## ⑦ 教训

1. **fail-open 是挂门守卫最危险方向**：`ref && table[ref]` 短路求值把「引用悬空」静默跳过——窗口期内 typo 不报警，守卫形同虚设。凡「可选引用字段」必须独立断言可解析性（fail-closed），不得用真值性既当存在判断又当查询条件。
2. **三态 schema 的「默认态」也要显式校验**：event_bound 缺省即默认，但默认态的约束（须有事件锚）不校验就会出现「名义默认、实际无锚」的游离项——D5 把默认态的不变式落成断言。
3. **复审时点机读锚取事件不取日历**：复审点全是事件型 prose 时，编 ISO 日期=虚构数据；事件登记（micro-a-preview-prep）把「层 preview 前置」这类节律变成可判 occurred 的锚，与 trigger/deadline 同一机制复用。
4. **「缺口显式可见」要落成每跑必现的信号**：manual_watch 零确认留痕不是缺陷是过渡态——WARN 常驻（7/7）比沉默正确，D-041③ 的「不隐性」即此；同时 ALARM 与 WARN 分档（逾期升档候选名单），盯梢频率按紧迫度分层。
5. **守卫扩展先做红证再算落地**：注入悬空引用→FAIL、翻转事件 occurred→ALARM+候选，两态实跑证明断言不是「永真装饰」——与 #43 篡改检出、#44 首跑抓 M-001 漏计同一条纪律。
