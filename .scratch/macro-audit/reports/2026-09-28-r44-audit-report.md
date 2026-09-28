# 2026-09-28 R44-T1 执行批审计报告（r44-t1-exec 栈）

> 审计窗=轮45 T3 本体（任务书 .scratch/macro-audit/handoffs/next-round.md 轮45 版）；被审对象=r44-t1-exec 栈：`uys`(6770378d，语义批＋handoff)＋`kzz`(b6387d9f，生成物再生独立 commit)，栈于 r43-closeout 梢 d9412e19；未 push。审计方法=不信自述：硬验收全部亲跑＋逐声明实物抽查＋双轴评审＋D 条逐条核对。

## 0. 总结论

**PASS**——硬验收 7 面全部独立复跑一致（逐格同读数）；报告 18 条关键声明全部仓库实物可核；双轴评审 Standards 硬违规 0／Spec 零缺口零跑偏；D-xxx 引用 15 条逐条对账全落实（缺失 0／弱化 0／跑偏 0）。呈报件 4 件全部观察级（O1~O4），零必修。

## 1. 硬验收独立复跑（审计亲跑，env -u NODE_OPTIONS）

| 面 | 报告自述 | 审计复跑实测 | 结论 |
|---|---|---|---|
| 编译 | `npm run build` → BUNDLE-OK | BUNDLE-OK dist/cli.js（tsc+esbuild） | ✅ 一致 |
| dist 零漂移 | check-dist PASS 263151B/cap 289395B | DIST-RATCHET PASS 263151B/cap 289395B——字节数逐格相同 | ✅ 一致 |
| 打包 | npm pack --dry-run → 85 件 255.5kB | total files=85，package size=255.5kB | ✅ 一致 |
| 启动测活 | `node dist/cli.js selftest` ok=true 5/5 | ok=true，5/5 pass（manifest/shells/default-mode/mcp-readonly/receipt） | ✅ 一致 |
| 测试闭环 | npm run smoke 22 测试件全绿 | 22 文件 && 链末件 FILE-CARD 36/36 跑通（链式语义=全部 exit 0）；读数抽见 SMOKE 6/6、QUARANTINE 58/58、CITATION 38、DEMO 38/38、GITHUB-REST 56/56、UPSTREAM-MAP 21/21、DIALECT 19/19、FILE-CARD 36/36、AUDIT-ZERO-WRITE 4/4 | ✅ 一致 |
| 守卫组 | guard-all-run ran=60 green=59 red=1（册内 kr-01）allOk=true partial=0/60 | ran=60 green=59 skipped=0 gskip=0 red=1 registered=1 problems=0 allOk=true；KNOWN-RED 01-check.mjs slugs=D1,D5 与 known-red-manifest kr-01 条目逐字段对得上（guard/expected_slugs/expires_fallback 2026-12-31）；GUARD-ALL-RESULT: PASS | ✅ 一致 |
| registry 校验 | 33-check PASS 31/31（73 项/52 事件/ALARM 1/WARN 9/RISK-ACCEPTED-CANDIDATE 0） | 逐格相同：PASS 31/31，登记 73 项/事件 52/ALARM 1/WARN 9/RISK-ACCEPTED-CANDIDATE 0；event_bound 50/73 | ✅ 一致 |

附证：本审计 build 复跑后 `git status` 上 engine/dist/cli.js 零改动——dist 字节不变声明获独立实证（报告 §5 同述）。平台注：宿主=Windows 11 本机；fresh-clone 判据②维持 R42 审计证实读数（本轮 runner 仅增展示行，无环境面影响——认可该沿用口径）。

## 2. 声明 → 证据 → 结论 对照表

| # | 报告声明 | 审计实物核验 | 结论 |
|---|---|---|---|
| 1 | docs/ra/GAP-HOST-01.md 五要件档案 §0~§6 | 文件在位 49 行：§1 判据引用（D-162③+registry verify_method 原文互引）、§2 justification（IDE 盲区不可自力）、§3 补偿控制（CLI 三判据 hit＋双哨兵＋Stage-2 闸不旁路）、§4 具名裁者=用户（起草人=Agent≠批准人）、§5 到期日 min(IDE 会话,2026-12-27)=恰 90d＋复审钩＋逾期失效重立项、§6 批准登记（关档/2026-09-28/用户） | ✅ |
| 2 | known-gaps GAP-HOST-01 status=accepted-risk＋词表第四态 | 台账行在：status=accepted-risk、review_by=min(下次 IDE 形态会话,2026-12-27)、trigger_id=codebuddy-ide-gap-watch；字段行注释含「accepted-risk=RA 五要件齐备封闭终态，D-169-b②——档案位 docs/ra/」；全表 13 行（GAP-078×4 legislated＋GAP-B2B×8 triaged＋GAP-HOST-01） | ✅ |
| 3 | registry 九件 confirmations 追加 | 逐件机读核验全部在册：r1/r2 ra-census-fields-verified（D-169-b③）、batch2beta-techdebt-review status-unchanged、codebuddy-ide-gap-watch ra-approved-closed（D-168②/D-169-b②）、codebuddy-f02-display-watch status-unchanged（D-155③，CLI 2.151.0 实证）、guard-retirement-class channel-idle（D-160①②③⑤）、stage2-launch-criteria criterion-03-ra-closed、protected-surface-death-watch zero-event-read（60/60 declared）、batch2beta-open-triggers trigger-not-ignited（D-169-a② 三问全否） | ✅ 9/9 |
| 4 | 账本 R43 收口节末增「执行窗兑现」小节 | diff 实证：decision-ledger.md +10 行，小节含 T1-A/B/C/D＋T2＋T3＋分层定稿逐条 | ✅ |
| 5 | 编年 M-037 | CHANGELOG.md +## [M-037] - 2026-09-28，milestone/adr_range/a_range/ledger_pointer/impact 五段齐备 | ✅ |
| 6 | 任务书换代=轮45＋锚点携带 | next-round.md 头=轮45；「历史票面闭环索引」节在位；六件字面钉逐件源码级核对——39-check H6(T11+DONE+#39)、40-check G5(#40/gsd-core)、41a-check F4(正则 T6 分发收尾·仓内文档面（#41a/R6-03）✅ DONE 2026-09-16 精确命中)、43-check D5(T14✅)、44-check G6(#77 闭环行+#78)、45-check H5(#45/demo)——全部命中且守卫组复跑全绿 | ✅ |
| 7 | guard-all-run footer partial=N/M 派生展示行、机读面零改动 | diff=+3 行（注释＋partialCount filter＋console.log），ran=/GUARD-ALL-RESULT/skip 机读行原样；实测输出 partial=0/60 行在 | ✅ |
| 8 | 消亡普查 60/60 声明非空零事件 | 独立重数：reports/ 下含 PROTECTED_SURFACE token 的守卫件=60，空赋值扫描 0 命中，抽样声明全部实义非空；manifest retired=[]＋_retired/ 仅 README.md | ✅ |
| 9 | F-02 哨兵 CLI 2.151.0 盲区持续 | 审计独立复跑 `codebuddy mcp list`→「No MCP servers configured.」——同读数复现 | ✅ |
| 10 | 存量 RA 普查 15 项两字段全在册零重立项 | r1/r2 原始 JSON 核验：acceptor=用户具名＋expires_at=事件制复评触发均在册；known-gaps 13 行 8 列全填；GAP-078×4 review_by=2026-10-23 未到期 | ✅ |
| 11 | 账本口径 D-001~D-170：157 current/12 revised/1 closed | 独立计数：canonical 行 unique=170、max=D-170；末格状态 current=157、revised=12（D-002/008/012/014/022/059/072/100/101/142/148/159）、closed=1（D-019） | ✅ 逐数吻合 |
| 12 | kzz 生成物再生独立 commit 无语义变更 | 13 件 224+/224-；逐行过滤 nonchurn=0——仅 generated_at/run_at/RCP 回执/facts UUID/编年计数；engine/ 路径 diff=0 行 | ✅ |
| 13 | 提交信息三栏位（D-161④） | uys/kzz 均 subject 单意图行＋body 分项 bullets＋footer Ledger-Refs/Chronicle/Adrs 三 trailer 在 | ✅ |
| 14 | engine/src、dist 未触碰 | git diff d9412e19..b6387d9f -- engine/ = 0 行；审计 build 后 dist 零改动 | ✅ |
| 15 | 证据源 trials/codebuddy-r38-{charter,report}.md | charter/report/session 三件均在位（含 codebuddy-r38/{baseline,codebuddy-run,self-run} 目录） | ✅ |
| 16 | atomcode 裁决辅助调研 9 源同向零冲突 | 过程性声明——仓内无调研工件落盘；产出结论（关档同向/零 revised）已固化于 RA §6＋registry 确认行，与现状一致 | ◻ 仓内不可核，记录一致 |
| 17 | O6 顺删维持挂账（本窗未触碰 40-check） | 40-check.mjs 不在 uys/kzz 任一 diff——「不专开批」纪律如实执行 | ✅ |
| 18 | T2 批2-β 点火三问全否续挂账 | registry conf 三问逐条记录；known-gaps GAP-B2B 八行 status=triaged 同态（对基线无恶化）、无新增条目 | ✅ |

## 3. 双轴评审（$code-review；diff=d9412e19..b6387d9f；子代理未启用——diff 总量 274+/46-＋224 行对称 churn，审计窗内联双轴取证已足）

### Standards（仓内文档化标准＋Fowler 嗅探基线）

- 提交信息三栏位、生成物独立 commit、报告/交接命名纪律、字面钉锚点携带（修复后落盘态）、RA 五要件标准形、registry confirmations schema 与既有条目同构——全部合规。
- 唯一代码变更=guard-all-run.mjs +3 行 footer：风格与既有 console.log 聚合一脉，命名 partialCount 达意；`r.skipGroups.length` 断言形状与下行过滤器近似——Fowler Duplicated Code 判定为 judgement-call 级以下（三行内惯用聚合，工具不强制），不立 finding。
- AGENTS.md 规程面对账：engine/src|dist 未触碰→前置 build+check-dist 义务不触发（仍复跑取证）；账行增量=0（仅收口节追加非新 D 行）→编年随行一致（M-037 随批在）；无 format-only 搭车；无秘密外泄；无 git-object 写面操作。
- **Standards 硬违规=0**；judgement-call=1 件（见 O1）。

### Spec（spec 源=轮44 任务书快照 @d9412e19 T1/T2/T3＋完成定义）

- T1-A（D-168②+D-169-b②）：五要件逐项落档案；两选项「关档/续等实证」皆呈、用户批「关档」；批准结果回账本＋registry 双登记 ✓。
- T1-B（D-169-b③）：两字段普查 15 项全在册、零「到期缺失/已过」→重立项不点火；确认行落册 ✓（r1/r2 到期字段=事件制形态，grandfather 标注保留——spec 字面=「到期日在册？」在场性检查，合规；见 O3）。
- T1-C（D-167-c①）：spec 明文「不专开批」——维持挂账即正确执行 ✓。
- T1-D（D-167-b）：可选 polish 兑现，机读面禁动守约 ✓。
- T2（D-169-a②）：点火三问全否→deferred 维持，确认行落册 ✓。
- T3 六项哨兵读数＋消亡普查＋Stage-2 四读数＋F-02 复测——全落 registry ✓。
- 完成定义四件套（编译/打包/启动测活/test 闭环）＋守卫组升格判据——审计全部独立复绿 ✓。
- 范围蠕变：零——diff 全 confined 于声明面（docs/.scratch/CHANGELOG/registry/3 行 runner footer）。
- **Spec 缺口=0，未请项=0，疑似错实现=0**。

## 4. D-xxx 逐条核对（子 Agent 声明引用面）

| D 条 | 声明用途 | 账本原文核对 | 结论 |
|---|---|---|---|
| D-168② | RA 档案呈批义务 | 「判据③ GAP-HOST-01 起草 RA 档案呈报用户裁——五要件形态…批关档或续等实证皆合法终态」逐字兑现 | ✅ |
| D-169-b② | RA 五要件标准形 | 判据引用/justification/补偿控制(可验证)/具名裁者(提交人≠批准人)/到期日≤90d/复审钩——六件全在 §1~§5 | ✅ |
| D-169-b③ | 存量 grandfather 轻回填 | 「两检查字段（裁者具名？到期日在册？）」在场性检查如实执行；事件制到期形态保留标注合规 | ✅ |
| D-169-b④ | 到期缺失/已过禁续期须重立项 | 零命中→触发器不点火；RA §5 正确引用④款作失效条款 | ✅ |
| D-169-a② | 批2-β 触发器三事件锚 | registry verify_method 三问原文在；trigger_event 未置 occurred | ✅ |
| D-167-c① | O6 闸后重言断言删=触碰搭车 | 未触碰→未删，挂账维持；Bond 判据随读零新例 | ✅ |
| D-167-b | footer partial 可选 polish | 呈现层派生行落、机读面未动 | ✅ |
| D-170②③④ | 分层定稿双行呈报/欠账三要素/哨兵续任 | 任务书＋账本收口节维持「裁定层闭环/验收层开放」分行；O6 欠账三要素（owner+时点锚+复验）在册；stage2 哨兵续任确认行落册 | ✅ |
| D-155②③ | F-02 归属裁＋哨兵复测 | verify_method 原文在（禁 CLI 外推 IDE）；CLI 2.151.0 复测证据留存 | ✅ |
| D-164-b | 消亡判据事件锚/发射腿禁预建 | verify_method 含「零机件」声明；manifest 无预建发射腿 | ✅ |
| D-160①②③⑤ | 退役通道建制 | retired=[]、_retired/ 仅 README、channel-idle 确认行 | ✅ |
| D-156③ | 批3/批4 显式不预裁 | 任务书挂账常项原句在 | ✅ |
| D-149② | 锚面固化（任务书换代携带锚节） | 落盘态锚节在；换代曾瞬时漏带→六件守卫红→修复后绿（§6 呈报） | ✅（含过程事件，见 O4） |
| D-161④ | 提交信息三栏位 | 两 commit trailer 三键在 | ✅ |
| D-140② | 生成物独立 commit 规约 | kzz 独立 bundle commit（D-139 同型扩展沿用）；本审计再生漂移随行弃置不入账（r42 审计先例） | ✅ |
| D-145① | engine/src|dist 触碰→前置 build+check-dist | 未触碰→义务不触发；验收面仍复跑取证 | ✅ N/A-适用性 |
| D-042/D-074/D-101/D-162③⑤ | 用户闸门 | 无 push/无宿主侧代行/无 git-object 写/无 Stage-2 启动 | ✅ 零越闸 |

**缺失/弱化/跑偏：0 件。**

## 5. 过程呈报（观察级，审计不追认仅呈报）

- **O1（judgement-call）**：guard-all-run.mjs `skipGroups.length` 谓词形状与相邻过滤器近似——三行聚合惯用法，不报修。
- **O2（过程性声明不可仓核）**：atomcode 裁决辅助调研（9 源）无仓内工件；结论态（同向零冲突→关档）已固化多处且内部一致。用户指示追加的裁者辅助件，证据链自述可信但审计无从复跑。
- **O3（口径注记）**：r1/r2 RA 项到期字段=事件制复评触发非 ≤90d 日历——D-169-b③ 普查字面=在场性检查故合规，普查确认行已显式标注 grandfather 形态保留。「事件制 expiry 与五要件 ≤90d 的兼容关系是否需要裁定面收口」=真实开口缝，可作下轮 grill 题（见交接）。
- **O4（已披露过程事件）**：任务书换代首版漏带锚节→六件字面钉守卫合法红→携带锚节重生成→复绿。落盘态零违；教训已随报告 §7＋交接注意事项＋任务书锚节本体固化。守卫按设计抓获——规程生效，无净违规需追认。

## 6. 职责分离与窗口状态

- 审计窗零实现面改动：本审计复跑产出 12 件守卫再生漂移（纯时戳/UUID churn，逐行过滤实证）——`but discard` 弃置不入账（r42 审计先例「再生漂移随行弃置」）；弃置后 `git status` 净零。
- 轮45 T3 哨兵读数：本审计独立复跑已取证（消亡普查 60/60、F-02 复测同盲区、批2-β 三问全否、Stage-2 四读数同态、RA 复审钩未到期）——与 R44 登记全同态；**registry 确认行登记按职责分离留待下一执行/收口窗**（若用户裁定审计窗直登亦可，口径呈此备裁）。
- 无返工需求：零必修件，不打回原窗口。

## 7. 复跑命令清单

```
cd engine && env -u NODE_OPTIONS npm run build            # BUNDLE-OK
cd engine && env -u NODE_OPTIONS node scripts/check-dist.mjs  # DIST-RATCHET PASS 263151/289395
cd engine && env -u NODE_OPTIONS npm run package          # 85 files 255.5kB
cd engine && env -u NODE_OPTIONS node dist/cli.js selftest    # ok=true 5/5
cd engine && env -u NODE_OPTIONS npm run smoke            # 22 件链全绿
node .scratch/architecture-recovery/reports/guard-all-run.mjs # 60/59/1 allOk=true PASS
node .scratch/architecture-recovery/reports/33-check.mjs      # PASS 31/31 73 项
codebuddy mcp list                                        # No MCP servers configured（F-02 同态）
```

## 8. 引用文件

docs/ra/GAP-HOST-01.md；docs/known-gaps.md；.scratch/architecture-recovery/reports/33-gate-registry.json；.scratch/architecture-recovery/reports/known-red-manifest.json；.scratch/architecture-recovery/reports/guard-all-run.mjs；.scratch/macro-audit/decision-ledger.md；CHANGELOG.md；.scratch/macro-audit/handoffs/next-round.md（轮45）；.scratch/macro-audit/handoffs/2026-09-28-r44-exec-handoff.md；.scratch/macro-audit/reports/2026-09-28-r44-exec-report.md；.scratch/macro-audit/trials/codebuddy-r38-{charter,report,session}.md。
