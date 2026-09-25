# R35 审计报告 —— T0 守卫基线＋T1 R34 收口实施批复核（分支 r35-t1-vocab-narrow）

> 审计窗 2026-09-25 23:25。对象=执行报告 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-25-r35-exec-report.md`（16 条声明）＋handoff `D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-25-r35-t1-handoff.md`。评审定点=e68cb89（kmk 真实父提交，git rev-parse 747cc04^ 实证）；范围提交=kmk(747cc04)→qmw(c1f92cf)→rkm(f85fb15)→xtl(0afd94c)。

## 判定

**审计通过（PASS，附呈报项 P1~P6——均不阻塞，依 R33 O 级先例登记随票/呈报用户裁）**。16 条声明全部亲跑/实物复核通过；双轴评审 Standards=PASS-WITH-NITS、Spec=PASS-WITH-NITS；D-143②④ 实现忠实票面；D-140② 独立 bundle commit 首用正确。过程违规零件；报告自述偏差三件（P1~P3）＋实现弱化观察一件（P4）＋继承弱点两件（P5/P6）。

## 1. 硬验收亲跑复核（不信自述，审计窗实测）

| 验收 | 命令（仓根/engine） | 审计实测 | 结论 |
|---|---|---|---|
| 编译 | `cd engine && env -u NODE_OPTIONS npm run build` | exit 0；tsc 零错＋`BUNDLE-OK dist/cli.js` | ✅ |
| 打包 | `cd engine && npm run package` | `macro-audit-0.1.0.tgz`，total files: 85 | ✅ |
| 测活 | `cd engine && node dist/cli.js selftest` | `{"ok":true}` 五 checks 全 pass（manifest/4 shells/6 modes/mcp read-only/receipt=5） | ✅ |
| MCP stdio | `node .scratch/macro-audit/audits/r33/mcp-f5.cjs` | INIT ok→tools=[facts,quarantine,file_card]→缺库卡 card_type:miss/never_collected/isError=false/cli_guidance 实路径 | ✅ |
| test 闭环 | `cd engine && env -u NODE_OPTIONS npm run smoke` | exit 0（&& 链 22 册全过；FILE-CARD 26/26） | ✅ |
| dist 棘轮 | `cd engine && node scripts/check-dist.mjs` | `DIST-RATCHET PASS: 257947B / cap 289395B`（字节级复现） | ✅ |
| gen 幂等 | `cd engine && npm run gen` ×2 | 生成面零漂移；porcelain 仅 `MM engine/dist/fact/file-card.d.ts`——核实=GitButler 合成索引噪声：`git diff HEAD` 对该件为空（工作树=提交态），`but status` zz 干净 | ✅ |

## 2. 声明→证据→结论 对照表（16 条全覆盖）

| # | 声明 | 审计证据（亲跑/实物） | 结论 |
|---|---|---|---|
| 1 | T0 基线 41a-check 初跑 FAIL 1/38（D7 ledger_pointer，漏 M-013） | 重构验证成立：D7=`cl.indexOf(dMax)` 其中 dMax=macro 账本最大 D 号（41a-check.mjs:71）；e68cb89 树 CHANGELOG 无 M-013 亦无 'D-143' 字面，而 mko 落账后 dMax=D-143→FAIL 机理成立。历史事件无法原地重放（不动工作树），机理链完整 | ✅（重构验证） |
| 2 | kmk 补 M-013→复绿 38/38 | kmk=CHANGELOG 单件 +8 行；M-013:102-108 五固定字段齐＋ledger_pointer 含双路径＋D-140~D-143；亲跑 41a PASS 38/38 | ✅ |
| 3 | file-card.ts :39-40 词表收窄＋行尾钉＋上行注释更正 | 实物：:38 「词表源=D-126③ FailureState 族」；:39 二成员集＋行尾钉逐字在；wc -c=20414 与报告一致；SuppressedFacetReason 全仓仅 file-card.ts 一处引用 | ✅ |
| 4 | 83-check.mjs B2 标签收窄 | :43 实文「本枝新增、pin 枝既有」；wc -c=6302 一致 | ✅（断言面见 P5） |
| 5 | A-093 行＋M-014 编年 | A-093:429 位于 A-092 之后、R29-REWORK 注记之前（正确位），status=implemented；M-014:110-116 | ✅ |
| 6~13 | 编译/打包/测活/MCP/smoke/83-check/18守卫/棘轮 | 见 §1 亲跑表；18 守卫逐件 exit 0 且读数逐字复现（33:31/31 39:28/28 40:57/57 41a:38/38 43:28/28 44:59/59 45:51/51 70:13/13 71:16/16 72:16/16 73:14/14 77:16/16 78:42/42 80:28/28 81:18/18 82:15/15 83:19/19 xfail-run entries=0/10） | ✅ |
| 14 | gen×2 零漂移 | 见 §1；MM=合成索引噪声已坐实非真漂移 | ✅ |
| 15 | rkm 独立 bundle commit（D-140② 首用） | `git show f85fb15`：仅 engine/dist/fact/file-card.d.ts（Bin 3651→3632）；d.ts 实物=二成员新词表；file-card.js 无 SuppressedFacetReason 残留（类型擦除），cli.js 棘轮字节不变 | ✅ |
| 16 | qmw 零夹带 | `git show c1f92cf` 全 diff 亲审：恰四面（file-card.ts :38-40 单 hunk／83-check :43 单行／账本 +A-093／CHANGELOG +M-014），零格式化噪声零越界面 | ✅ |

附：xtl=docs commit（报告+handoff 自身落盘，§五未自引属正常）；mm 噪声已在 §1 消化。

## 3. D-xxx 逐条核对（声明的裁定→实现证据）

| D | 要求 | 实现证据 | 结论 |
|---|---|---|---|
| D-143② | SuppressedFacetReason 收窄 {new_file,insufficient_history}＋行尾钉 | file-card.ts:38-40 逐字落实；可达性审计窗独立复核：failure 赋值仅 :287-289（ok/new_file/insufficient_history），suppressed 门控滤 ok，not_applicable 经 :217 missCard 早退不可达——收窄=诚实可达集成立 | ✅（P4 弱化观察） |
| D-143④ | B2 标签收窄到断言实际覆盖 | 83-check.mjs:43 标签=裁定规定措辞逐字 | ✅（断言本身弱点=P5，裁定负向已禁扩断言） |
| D-143①③ | 勘误行＋D-136 注记（归属 mko 已落，非本批） | 勘误登记节「F9 emitted 203→197…勘误封账（D-143①）」在案；D-136 status 格含 D-143③ 注记「文法来源引用非成员全集」 | ✅（在 mko，非本批面） |
| D-140② | dist 再生独立 bundle commit | rkm 单件 dist .d.ts 隔离成立 | ✅ |
| D-094③ | 名↔检纪律 | B2 标签名实相符整改即本款实例 | ✅ |
| D-095① | closed 枚举诚实声明 | 词表收窄后 closed 声明与可达集一致 | ✅ |
| D-126③ | 词表源引用 | 行尾钉正确区分「miss/card_type 层可达」边界 | ✅ |
| D-104④ | 收窄=非破坏（additive 可逆） | A-093① 论证成立：preview 0.x 无外部消费者 | ✅ |
| D-135 | 批内同票纪律 | 两编辑面同批一票合规 | ✅ |
| D-139② | 格式化禁搭车 | qmw 全 diff 零格式化噪声 | ✅ |

## 4. 双轴评审（$code-review 平行子代理）

### Standards（AGENTS.md＋WORKFLOW＋CONTRIBUTING＋Fowler 味基线）

PASS-WITH-NITS。文档化纪律全守（bundle commit 分离首用正确/格式化零搭车/Node 写回读/账位/编年格式）。无硬违规；味基线零新发（被删的 'not_applicable' 本即 Speculative Generality 正确拆除）。nit 见 P4（`as` 断言旁路）/P5（B2 断言三处同文）/P6（commit 缺 A-NNN 引用、WORKFLOW §4 lessons 未追记）。

### Spec（next-round T0/T1＋D-143②④＋R33-O1/O3＋A-093）

PASS-WITH-NITS。缺失/跑偏零件——T1a/T1b 逐字落实、T0 基线真实捕获回红、编年随行齐、xtl 范围外行为零。not_applicable 不可达性独立复核成立。nit 见 P3（执行报告 §三 交叉登记措辞）/P5（B2 断言隔离力）。

## 5. 呈报项（观察/弱化/跑偏——审计窗不修，去向用户裁）

- **P4（弱化·可选返工）**：`engine/src/fact/file-card.ts:299` `reason: failure as SuppressedFacetReason`——`as` 于 #83 批引入非 qmw 新加，但它使 D-143② 目的句「收窄后 exhaustiveness 判力可对第三原因码新枝拦截」打折：未来给 FailureState 加成员并经新枝赋值时 `as` 静默放行（交叠类型断言 tsc 恒过）。一行修法：`let failure: 'ok' | SuppressedFacetReason = 'ok'`（:287 声明收窄即可去 cast，failure_state: FailureState 兼容子集）。**呈报**：若要求 exhaustiveness 判力完备→打回修复窗做此行＋重跑 §1 全套；若认现行防护足够（测试面 C4/C5 锁运行时值）→登记观察项结案。
- **P5（继承弱点·登记随票）**：B2 断言 `indexOf('available_head_shas: input.availableHeadShas.slice()')` 命中 file-card.ts :186/:200/:241 三处同文——删 :241 本枝行 B2 不红（pin 枝同文兜底），断言隔离力弱于新标签名义。D-143④ 负向已禁「扩断言补第二枝」，非违规；若未来要强化→须先立裁。
- **P6（判例级 nit）**：kmk/xtl commit message 无 A-NNN 引用（WORKFLOW 期望惯例）；执行报告「Lessons 候选」未同步 WORKFLOW §4——沿近两轮同款疏漏，一致性 nit。

## 6. 过程违规呈报（不替追认）

- **P1（报告自述失准）**：exec-report §五「引用工件」全用仓内相对路径，违 AGENTS.md「输出文件路径一律给完整绝对路径」规则（该窗自己定的偏好面）。
- **P2（分支拓扑自述失实）**：handoff/报告 §五称「r35-t1-vocab-narrow 上叠 r34-closeout mko」——实证 `git merge-base --is-ancestor mko xtl = NO`，kmk parent=e68cb89：两支为同基平行兄弟，mko 内容仅经 GitButler workspace merge 进工作树。后果面：r35 单支 land 不携带 r34 收口面（D-140~143 账行/AGENTS 摄入行/.gitattributes/CONTEXT 词条/registry 90- 均只在 mko），且 M-013 编年将引用主线不存在的 D-140~143 行=悬空引用——**落地顺序须 mko 先行或同批**。41a-D7 单支复核：r35 独树 dMax=D-139、CHANGELOG 含 'D-139' 字面→守卫仍绿，非缺陷但拓扑描述应更正。
- **P3（报告自述失准）**：exec-report §三称「A-093 行内已交叉登记（文法来源引用非成员全集）」——实测 A-093 行无该字样（grep '文法来源|D-143③' 于执行账本=0 命中）；交叉登记实物在 macro 账本 D-136 status 格（mko 落）。事实存在、位置描述失准。

违规定性：P1~P3 均为文书/自述层失准（R33-O7 同型先例=登记不追改），零语义面违规；格式化搭车/生成物搭车/push 越权/编年漏行全清白。

## 7. 引用工件

- 被审报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-25-r35-exec-report.md`
- 被审交接：`D:\Aworker\6F\.scratch\macro-audit\handoffs\2026-09-25-r35-t1-handoff.md`
- 票面：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` T0/T1；`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md` D-143（行948）/D-140（行945）/R34 收口节（行958-963）
- 执行账：`D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md` A-093（行429）
- 上游审计：`D:\Aworker\6F\.scratch\architecture-recovery\reports\2026-09-25-r33-audit-report.md`（O1/O3=本批件④②来源）
- 提交：e68cb89 基上 kmk(747cc04)/qmw(c1f92cf)/rkm(f85fb15)/xtl(0afd94c) @ r35-t1-vocab-narrow；兄弟栈 r34-closeout=mko(7a62430) 未 land 于本支
