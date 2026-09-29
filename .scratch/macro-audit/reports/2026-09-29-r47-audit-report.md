# 轮47 执行批审计报告（审计窗对 r47-t1-exec）

日期：2026-09-29　审计对象：R46-impl 兑现批（tvq 语义＋ymm 生成物，stacked on r46-closeout）　判据面：零修订

## 裁定：PASS（呈报 F1~F3 全 minor，零阻塞）

## 一、硬验收亲跑（不信自述，逐格复跑）

| 项 | 命令 | 本窗复跑实测 | 报告自述 | 结论 |
| --- | --- | --- | --- | --- |
| 迁移幂等 | `node .scratch/architecture-recovery/reports/update-33-window-state.mjs` | `window_state=not_started confs=8 reset_log=1 BOM=false / REGISTRY-IDEMPOTENT-SKIP`，exit 0 | 同 | 一致 |
| 同窗校验 | `node .scratch/architecture-recovery/reports/33-check.mjs` | `PASS 31/31`；登记 74 项／事件 52 个／ALARM 1／WARN 9；D6 confirmations 111 条 | 同 | 一致 |
| 守卫全量 | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | `GUARD-ALL-RESULT: PASS ran=60 green=60 skipped=0 red=0 allOk=true partial=0/60` | 同 | 一致 |
| 文件完整性 | node 读字节 | registry：BOM=false CRLF=false 尾 `}\n`（146755B）；.mjs：BOM=false CRLF=false 尾 `);\n` | 隐含（脚本 BOM 断言） | 一致 |
| 工作树 | `but status` | 审计再生漂移 13 件已 `but discard` 弃置，净零还原被审态（轮46 审计先例同法） | — | 自清毕 |

等价物映射（本批零源码面）：编译→JSON.parse 读回断言＋.mjs 加载执行无语法错；打包→不触 engine/src|dist，D-145① 前置条件未触发属实；测活→迁移两态实跑＋33-check＋guard-all 全量实跑。

## 二、声明→证据→结论 对账表

| # | 声明（报告/handoff） | 本窗取证 | 结论 |
| --- | --- | --- | --- |
| 1 | `window_state=not_started` 顶层字段 | registry items[stage2-launch-criteria].window_state 实物="not_started" | 属实 |
| 2 | `window{}` 五件机读建制 | start_event=null＋start_event_enum=[pilot_started,findings_all_closed,freeze_declared]＋start_at=null＋prereq_check="pilot_running"＋reset_log[]＋decision_date{require_open_findings:0,require_fix_deployed:true,min_observation_days:30} 全在 | 属实（外加 start_event_enum 为第六键——判 start_event 的枚举 schema 标注，与「最小化不超额」相容，观察见 F4） |
| 3 | F1 归 capability 入 reset_log 披露 | reset_log[1]={finding_id:R46-F1,source_class:capability,reset_at:null,new_window_start:null,note:…} | 属实 |
| 4 | 六次「计时中」确认行链式更正 | confs#0/#2/#3/#4/#5/#6 原文逐字核对：#2~#6 各载「30日窗计时中/计时确认/计时中（未达标）」读数；#0=「四判据包+30日静默窗入册值守」登记行（更正行 reason 内自披露非计时宣称，未伪饰）；confs#1 criterion-02-fail-read 无窗读数→正确未列 | 属实且枚举准确 |
| 5 | 原确认行逐字保留（D-146⑤） | #0~#6 原文仍在位（审计读回原文） | 属实 |
| 6 | confirmations 110→111 | 全表 confirmations=111 条 | 属实 |
| 7 | 33-check D6 机检过 | PASS D6（四字段齐备 111 条） | 属实 |
| 8 | 登记 74 项／事件 52 个不变 | items.length=74；events 键=52（对象非数组） | 属实 |
| 9 | ALARM 1=readme-ci-badge fired（既有挂账）／WARN 9 既有 | 值守快照逐字一致；与历轮挂账常项吻合 | 属实 |
| 10 | 33-check.mjs 本体零改动（D-147 探测面纪律不越） | tvq 文件清单不含 33-check.mjs | 属实 |
| 11 | commit 序 tvq（语义）→ymm（生成物） | `but show`：tvq=26366c02 六件纯语义面；ymm=48e51819 十二件纯生成物；栈 r47-t1-exec ⊃ r46-closeout ⊃ base 05094278 | 属实（ymm 件数与标签计数差一见 F2） |
| 12 | D-139/D-140② 语义/生成物不混 | tvq 六件零生成物；ymm 十二件零语义面 | 属实 |
| 13 | D-161④ trailer 三栏位 | tvq/ymm 均 `Ledger-Refs:`＋`Chronicle:`＋`Adrs:`（Adrs 空列照写） | 属实 |
| 14 | D-144①④ 账行增量↔编年随行 | decision-ledger.md :1363「执行窗兑现（R46-impl 批=轮47 T1）」节＋CHANGELOG [M-042]（ledger_pointer 回指）同 commit | 属实 |
| 15 | registry 前 sha256=d7188d17879d647f… | `git show tvq^:…33-gate-registry.json` 实测 sha256 前 16 位=d7188d17879d647f | 属实（密码学级吻合） |
| 16 | 零试点⇒not_started 前提 | registry 事件键无 pilot/charter 类（仅 stage2/stage3 生命周期事件）；items 无 charter 项；start_event=null 为忠实机读 | 属实 |
| 17 | O6 顺删续挂（本轮未触 40-check.mjs） | `40-B1 clone 缓存目录实物在位` 断言仍在 40-check.mjs:45 | 属实 |
| 18 | T2 批2 deferred 事件锚 | events.batch2beta-trigger-ignited={occurred:false,at:null}＋item batch2beta-techdebt-review=pending | 属实 |
| 19 | D 总数 173 不变 | ledger `D-174` 计数=0 | 属实 |
| 20 | update-72 同款纪律照搬 | update-72-registry.mjs 同构：changed 闸/写后 assert-back/MIGRATION-ASSERT-FAIL exit 1/IDEMPOTENT-SKIP 逐字同款 | 属实 |
| 21 | 判据④读数口径=window_state 机读（T3 自此取） | handoff「下一窗口须知」明文＋next-round 口径基线节已载状态机语义 | 属实 |
| 22 | 「每个平台 test 闭环」映射 | 迁移脚本 assert-back 自含＋字段经 33-check D2/D6 消费＋T3 窗读数锚 window_state——无死字段 | 属实 |

## 三、D-xxx 覆盖裁定逐条

| D 条 | 要求 | 证据 | 结论 |
| --- | --- | --- | --- |
| D-173① | 窗状态机→not_started（零试点） | window_state 字段=not_started；start_event 三枚枚举机读建制 | 落实 |
| D-173② | 来源分级内外同权；F1 归能力面 | reset_log[0] source_class=capability＋note 载分类先例 | 落实 |
| D-173③ | 机读五件建制 | window{} 五件全在（外加 enum 键） | 落实 |
| D-173④ | 现状处置=六次更正＋F1 披露 | confs#7 window-state-corrected 五字段齐（at/by/criterion_version/reason/evidence）；reset_log F1 入 | 落实 |
| D-173⑤ | D-162④ A(a) 收窄留痕履行＋引用链 | CONF.criterion_version="D-173①~⑤"；ledger D-162 行 revised 注记在案（:978） | 落实 |
| D-146⑤ | 勘误链二阶修正（追加注记不改写原行） | 原 confs 逐字保留，更正以新增确认行承载 | 落实 |
| D-144①④ | 账行↔编年随行 | ledger 节＋M-042 同 commit | 落实 |
| D-161④ | commit 三栏位 trailer | 两 commit 全列 | 落实 |
| D-139/D-140② | 语义/生成物 commit 隔离 | tvq/ymm 二分干净 | 落实 |
| D-145① | engine/src|dist 触碰前置 build+check-dist | 零触碰，前置条件未触发——判据面如实声明 | 落实 |
| D-149①②（升格后判据） | guard-all-run 全量＋红集⊆manifest | 60/60 绿、红集∅（册内红=0 维持） | 落实 |
| D-167-c① | O6 顺删续挂 | 40-B1 断言在、40-check.mjs 未触 | 落实（挂账语义正确） |
| D-170③ | 欠账三要素 | T1-A 于去向表/收口节登记＋执行窗兑现 | 落实 |
| D-173 负向「禁轮内动 registry」 | registry 变更落执行窗非裁轮 | 本批=轮47 执行窗，时点合规 | 落实 |

## 四、双轴评审（code-review 规程）

### Standards

- update-33-window-state.mjs 与 update-72 先例逐字同构（幂等/changed 闸/写后回读断言/fail-closed exit 1）；LF、无 BOM、尾换行；头注释 D 引用链完整。
- registry diff 纯增量（新顶层键＋window{}＋reset_log 条目＋confirmations 追加），无存留数据改写。
- judgement 级观察（非违规）：
  - `it.window.reset_log.some`（:45）对「window 预存但缺 reset_log」的残缺中间态会 TypeError——崩态 exit≠0 仍 fail-closed，仅报错形态不优雅；
  - `start_event_enum` 为 spec「五件」外第六键——判为 start_event 枚举 schema 标注；
  - `window_state` 无孪生枚举字段（三态仅账本文字承载）——消费方只能对字面值校验，与 start_event_enum 不对称（入 F4 观察）。

### Spec

- spec 源：next-round.md T1-A 任务条＋decision-ledger.md D-173（:978）①~⑤。
- 缺口 0；蠕变 0；实现-声明逐款对上（见第三节）。「字段形态最小化不超额」处 start_event_enum 为可辩护扩张。

## 五、呈报项（全 minor，零阻塞——不替用户追认）

- F1 报告§变更文件清单漏列 handoff 自身：清单列语义 commit 5 件，tvq 实含 6 件（`.scratch/macro-audit/handoffs/2026-09-29-r47-exec-handoff.md` 未列）。
- F2 计数标签不确：ymm subject 与报告均称「48-golden×10」，实含 11 件 golden（总 12 件）。
- F3 漂移性质描述低估：报告称「run_at/generated_at 时戳＋派生计数漂移」——实测 jsonl 系 fact_id/trace_id/baggage_id UUID 全跑全量重生成＋github_rest.rate_limit 活读数（remaining/used/reset_epoch）漂移；语义载荷（PR 元数据/判定结构）稳定，「无语义变更」结论仍成立。
- F4（观察非缺口）window_state 无枚举机读键：三态 {not_started,running,satisfied_at} 仅账本/口径基线文字承载；start_event 已有 enum 先例，对称建制可入下批候选。

## 六、过程违规

无。守纪逐项实测：语义/生成物分 commit、trailer 三栏位、账行↔编年随行、探测面不修不扩（D-147）、挂账如实续挂、升格后守卫判据全量跑、审计副作用自清。

## 七、引用

- 被审：reports/2026-09-29-r47-exec-report.md、handoffs/2026-09-29-r47-exec-handoff.md、update-33-window-state.mjs、33-gate-registry.json（stage2-launch-criteria 项）
- spec：handoffs/next-round.md T1-A；decision-ledger.md D-173（:978）、轮46 收口节（:1328）＋执行窗兑现节（:1363）；CHANGELOG [M-042]（:332）
- 被审 commit：tvq=26366c02→ymm=48e51819（r47-t1-exec ⊃ r46-closeout），未 push/未 merge
