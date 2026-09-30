# R52 T1-A 审计报告（2026-09-30）

> 身份：审计 Agent（本窗只出报告不动手修）｜对象：轮 52 T1-A 执行窗交付（分支 `r52-t1a-pointer-guard` 叠 `r51-closeout`，5 commits，tip `4e8fe0bfc54c2c593d4adff82cad8b70cdc184df` ("docs(轮52收口): T1-A 指针守卫件四段兑现落账＋勘误 E-4~E-9＋T1-B 退役呈裁单＋编年 M-052＋轮53 任务书换代")，**未 push 至 origin**——gb-local 为 GitButler 内部远端非外推）
> 任务书：`C:\Windows\temp\6f.txt`｜执行批报告：`.scratch/macro-audit/reports/2026-09-30-r52-report.md`｜交接：`opencode/6F-r52-handoff.md`
> 审计面：①硬验收亲自重跑；②$code-review 双轴（Standards＋Spec 子代理并行取证）；③D-xxx 逐条实物核对；④声明→证据→结论对照＋过程违规单独呈报。

## 0. 审计裁定（建议——呈用户拍板，审计不替追认）

**功能验收面：PASS**——用户验收四条（编译/打包/测活/平台 test）全数亲自复现一致；T1-A 四段、T1-B 呈裁、T2 续挂、T3 读数的主体声明逐条实物可证。

**规程/文书面：建议打回小修批（不替追认）**——发现 3 类规程违反＋9 项冻结声明件内未勘误偏离＋若干守卫设计缺陷（§4~§6），均需处置后复跑 §8 重跑清单。修复量小且机械，但命中本仓明文规程（D-181 勘误通道／§4.2.2 写盘协议／证据可复跑要求），故不记入「附注放行」。

## 1. 硬验收亲跑（不信自述）

| 判据 | 报告自述 | 审计实测（本窗亲跑） | 结论 |
|---|---|---|---|
| 编译 | `npm run build` → BUNDLE-OK | 亲跑 `tsc -p tsconfig.json && node scripts/build-bundle.mjs` → `BUNDLE-OK dist/cli.js` | 属实 |
| 打包 | `macro-audit-0.1.0.tgz` 255.5 kB / 85 files / shasum b6b9fb4d… | 亲跑 `npm run package` → 255.5 kB / unpacked 1.0 MB / **85 files** / shasum `b6b9fb4df4f0eb7824c50e8fddf2daaae58b9971` | 属实（逐位一致） |
| 测活 | `selftest` ok:true 5/5 | 亲跑 `node dist/cli.js selftest` → `{"ok":true}` 5/5（manifest readable / shells==4 / default mode / mcp read-only / receipt fields=5） | 属实 |
| 平台 test | `npm run smoke` 23 件套全绿 | 亲跑 `npm run smoke` → `PASS` 行 **349**、`FAIL` 行 **0**（含 AUDIT-ZERO-WRITE 4/4、DIALECT-BOUNDARY 19/19、FILE-CARD 36/36） | 属实 |
| 生成物零 drift | `check-dist` PASS 263151B/289395B＋工作面零变更 | 亲跑 → `DIST-RATCHET PASS: dist/cli.js 263151B / cap 289395B`；`git status --porcelain`=0 行（build/package/守卫全跑后仍零） | 属实 |
| 守卫主跑 | `PASS-COUNT 25 FAIL-COUNT 0` exit 0；`files=759 findings=30 legal=1 baselineWarn=29 newFail=0 unreachable=1 twinBuckets=1 staleEntries=0` | 亲跑 `node 84-check.mjs` → `PASS-COUNT 25 FAIL-COUNT 0` exit 0；`files=**761** findings=30 legal=1 baselineWarn=29 newFail=0 unreachable=1 twinBuckets=1 staleEntries=0` | **读数一致**；files 759→761 为收口 commit 落盘 r52-report＋呈裁单两件后自然漂移（断言语义非钉值） |
| `--emit` | 报告称 `findings=0 ; EMIT-DONE uniq=0`（建册前空态对照） | 亲跑 `node 84-check.mjs --emit` → `SURFACE files=761 findings=30 ; EMIT-DONE uniq=17` | **不可复现**（见 §5-V3——emit 路径不读册，任何时点输出≈30/17） |
| 守卫组 | `ran=63 green=63 … allOk=true GUARD-ALL-RESULT: PASS` | 亲跑 `guard-all-run.mjs` → `ran=63 green=63 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true PASS`（含 84-check 自动入列） | 属实（动态枚举 62→63 实证） |
| 引擎未触碰 | 本轮 `engine/src`/`dist` 未触碰 | `git diff r51-closeout..tip --stat` 9 文件全在 `.scratch/`＋`CHANGELOG.md` | 属实 |

## 2. commit 结构与规程核对

| 项 | 自述 | 实测 | 结论 |
|---|---|---|---|
| 5 件次序 | `037f64cb`(预声明先行)→`116a6594`(守卫+册+勘误)→`ea6866a2`(去无牙)→`ebdf743f`(bundle 腿)→`4e8fe0bf`(收口) | `git log r51-closeout..tip` 序一致；`but status` 同构（nvn/vmv/wvk/nqo/vrk） | 属实 |
| D-177 时序 | 预声明 commit 先于语义 commit | `git show --stat`：`037f64cbf47a987fc818c215599c043457913816` ("docs(D-177): D-192 指针守卫件预声明包先行落盘") 仅含 predecl 一文件；`116a6594493b8127550d377515472841687de7ba` ("feat(D-192): 指针守卫件 84-check 落盘＋baseline 册首跑建册＋D-181 勘误 E-4~E-9") 含守卫+册+账本 3 件 | 属实 |
| 预声明冻结 | D-181 冻结声明件 | `git diff 037f64cb..HEAD -- predecl` = 0 字节 | 属实 |
| D-180 分腿 | 派生件独立 bundle commit | `ebdf743fb4d671957d2be8a54f8474aebbf544b4` ("bundle: 守卫跑伴生——63-assertion-inventory 派生漂移（84-check 入列 25 断言）") 仅含 inventory 一文件；语义腿零夹带 | 属实 |
| 去无牙修 | `75a C1` 抓 PV-F10D | `git show ea6866a2d7bab4686b3c1192fd1e8fb496d44c75`：`t(...,true)`→守恒式（stale+hits==entries&&entries>0）；75a-check:43 toothless 检出正则实物在 | 属实 |
| trailer 三栏位 | D-161④ | 5/5 均有 `Ledger-Refs:`（实值）＋`Chronicle:`/`Adrs:` 键在场；`Chronicle: M-052` 仅落收口 commit——「键常驻/值按适用填」口径自洽 | 属实（键在位） |
| 勘误链 | E-4~E-9 append-only | `git show 116a6594` 账本 +7 行=E-4..E-9 六条追加，E-1~E-3 原文未动 | 属实 |
| 工作面 | clean | `git status --porcelain`=0（亲跑全部验收后仍 0） | 属实 |
| 未 push | origin 无该分支 | `refs/remotes/origin` 仅 HEAD/main；`gb-local/*` 为 GitButler 内部远端 | 属实 |

## 3. D-xxx 逐条「声明 → 证据 → 结论」对照

| 裁条 | 执行批声明 | 审计实物证据 | 结论 |
|---|---|---|---|
| D-192⑤ 入列 | guard-all-run 动态枚举自动入列 63/63 | 亲跑 footer 一致；`63-assertion-inventory.json` 含 `"84-check":{"assertion_ids":25}` | ✅ 兑现 |
| D-177 预声明先行 | commit `037f64cbf47a987fc818c215599c043457913816` ("docs(D-177): D-192 指针守卫件预声明包先行落盘") 先语义 commit 落盘 | git log 次序＋单文件 diff＋冻结零漂移 | ✅ 兑现 |
| D-192① baseline 册 | 17 条 / 6 文件 / 4 kind / 三字段 / 禁行号 | json 实测 entries=17；files=D-177predecl/ledger/r35/r49audit/r49predecl/r51 共 6；kinds=bare-shortcode+fuzzy-phrase+short-sha+nonexistent-sha 共 4；errata_ref 17/17 实物可解析（PV-F10A 亲跑 PASS） | ✅ 兑现 |
| D-191③ 首跑判级 | 册内 WARN 29／册外 FAIL 0 | 亲跑 `baselineWarn=29 newFail=0`；29 WARN 明细逐条可溯至册 17 指纹 | ✅ 兑现 |
| D-192③ 孪生分桶 | 桶 1 族 2 成员 WARN | 亲跑 `PV-TWIN-BUCKET change-id nktntvkkwqtr 桶成员 2`；`cat-file -p` 两 SHA 同 change-id `nktntvkkwqtrnqxwmtokzulttpowxnpp` 实证 | ✅ 兑现（但见 §6-D1 钉数断言缺陷） |
| D-190③④ 锚线 | `201935fc` 孤儿 twin WARN 不判 FAIL | `merge-base --is-ancestor` 对 main/HEAD 双 rc=1（对象在库不可达）；`cb625c64521398306f914eb7986a4a505f95291a` ("fix(D-184/审计返工): F-09 成员集＋attributed 机检可红＋指针 git hash 实名＋打包口径更正") 对 HEAD rc=0 | ✅ 兑现 |
| D-188④ 法定形断言 | `bbb3ba73` 幻觉 hex 第二例入册 PV-11 | `git cat-file -t bbb3ba73` → `fatal: Not a valid object name`；r49 报告 L123 「本窗读数」列命中（通道 B 严格层） | ✅ 兑现 |
| D-188④ E-3 族 | `cb625c6491895e479a59ad5770d2748a8de70b32` 不存在 | `git cat-file -t` → `could not get object info` | ✅ 兑现 |
| D-181 勘误 | E-4~E-9 append-only | 账本六条实物在（行 1661-1666） | ✅ 兑现 |
| D-160②⑥ T1-B 呈裁 | 提议 (ii)＋显式驳回 (i) | 呈裁单在；registry `check-kit`/`blindspot` grep=0 亲证（items=75）；`_retired/` 仅 README；`_lib/check-kit.mjs` 存活且 12 守卫文件消费（面未消亡论据成立——「21 消费位」本窗按文件计 12，位/文件口径差异存疑不阻断） | ✅ 兑现 |
| D-156③ T2 续挂 | batch2beta 三事件全 no 未动工 | diff 无批2 文件触碰 | ✅ 兑现 |
| D-185 开工对表 | 八行差异登记 | 账本 §7 表在 | ✅ 兑现 |
| D-149④ 升格判据 | 全量跑＋红集⊆manifest | 亲跑 green=63 red=0 | ✅ 兑现 |
| D-148③ 生效时点 | 守卫自落盘 commit 起生效 | commit 序与豁免声明一致 | ✅ 兑现 |

## 4. 冻结声明件内偏离（D-181 应勘误未勘误——预声明 §7 留「空」期间实现已偏离 9 处）

预声明件自述「任何实现与本件不一致处按 D-181 通道追加勘误，不回改原文」；实测 `D-192-pointer-guard-predeclaration.md` §7 仍为空，但实现面存在下列偏离（均需补勘误或回改实现）：

| # | 声明（冻结件） | 实现（84-check.mjs / 册） | 判定 |
|---|---|---|---|
| P1 | 列头白名单 **11 项**（§2 通道 A） | `STRICT_HEADERS` **12 项**（多出 `'git hash'`）——CHANGELOG/next-round 仍写「11 项」→ diff 内自相矛盾 | 偏离·未勘误 |
| P2 | EXEMPT-DIR＝`node_modules/.git/dist/reports/_retired/reports/40-clone-cache`（路径锚定） | `SKIP_DIRS` 增 `'repomix-output'`（第 6 项，目录全仓不存在）；且按**裸目录名任意深度**豁免——`_retired`/`dist`/`40-clone-cache` 在任意子路径均被跳过，宽于声明的 `reports/` 锚定 | 偏离·未勘误 |
| P3 | `anchor_decl.lines` 声明 `["HEAD","main"]`（§4 schema 例） | 册实物 `["main","HEAD"]` | 偏离·未勘误（语义无害） |
| P4 | 册 schema 顶层＝version/policy/anchor_decl/entries | 册增 `first_run` 顶层字段 | 偏离·未勘误（additive） |
| P5 | fixture F-01..F-10 | 实现 F-01..F-**11**（增 PV-G-F10-BOOK-KEY-ROUNDTRIP／PV-G-F11-KIND-REACHABLE）；断言注释自称「四态＋六衍生态」（4+6=10≠11） | 偏离·未勘误（additive，注释口径亦错位） |
| P6 | F-02 输入 `9f12…5678` | 该串实为 **42hex** 落不进 `{7,40}`；实现静默换用 `cb62…91b` 行使断言生效 | 修法正确但属命题级改动，报告 lessons 自承、§7 未登记 |
| P7 | EXEMPT-SUB＝`*atomcode-research*.md`／`*research-prompt*.md` | `EXEMPT_SUB_RE=/(atomcode-research|research-prompt)/` 未锚 `.md` 文件名——路径任意段命中即豁免（目录名同形亦豁免） | 偏离·未勘误 |
| P8 | F-10 断言 B 禁行号三形态 `L<数字>`／`:行号`／`第 N 行` | 实现正则缺 **`:行号`（冒号行号）形态**——`file.md:123` 式 pattern 可混入册不被抓 | **防大赦护栏实有漏检** |
| P9 | F-07 期望「WARN slug=PV-UNREACHABLE——禁判 FAIL」 | fixture 仅断言 `anchorReach` 返 null，**未路由 judge()** 证明不产 FAIL（实际因 kind=legal 被 judge 跳过而恒 WARN——语义成立但声明的断言未被演练） | 断言弱化 |

## 5. 过程违规清单（单独呈报——审计不替追认）

| # | 违规 | 证据 | 规程依据 |
|---|---|---|---|
| V1 | **写盘丢尾行（回归）**：`84-check.mjs`（新件）＋`decision-ledger.md`＋`CHANGELOG.md`（后两者 @r51-closeout 均有尾行，本轮被改丢） | 末字节实测非 0x0A；`git show r51-closeout:<f>` 末字节=0x0A | AGENTS.md「禁 BOM＋保尾行」／WORKFLOW §4.2.2 |
| V2 | 「本轮零扩面」自述失真：账本登记「零扩面（SURFACE_CLOSED=1 在位）」，但 P1/P2 即扩面性变更（列头+1／豁免目录+1＋豁免语义放宽） | 账本行 vs 84-check.mjs:25/32 | 声明↔实物一致性 |
| V3 | `--emit` 证据行不可复现：报告引 `findings=0/uniq=0`——emitRun 不读册，任何时点输出≈`findings=30/uniq=17`（与报告同段「17 唯一指纹」自述亦矛盾） | 亲跑 emit＋读 emitRun() 实现 | 证据可复跑要求 |
| V4 | 「84-check 425 行」读数漂移：实测 440/441 行（ea6866a2 后未更新自述） | `wc -l`=440 | 文档读数随行更新 |
| V5 | 宽层残留「6 个 12+hex 非对象 token」计数口径未声明且按字面不可复现：审计普查=**1076 个极大 hex run（12~40h）中 29 可解析、1047 非对象**；良性主体=上游仓 SHA（39/40/46/48 系 macro-b/c 分析报告）＋审计指纹摘要；单「仓内叙事文书」层仍有 ≥20 件 stale/非对象 token | 审计自跑普查（§7） | 声称态可核实义务 |
| V6 | `63-assertion-inventory.json` 顶层 `updated`/`updated_by` 未随 bundle 腿更新（仍 2026-09-19/`update-70-inventory.mjs`） | 文件头字段 | 派生件元数据随行 |

## 6. 守卫件设计缺陷（Spec/Standards 双轴＋审计复核）

| # | 缺陷 | 说明 | 处置建议 |
|---|---|---|---|
| D1 | **`PV-E-TWIN-COVERAGE` 钉数断言违反判级矩阵**——断言 `twins.length === 1`：孪生在声明矩阵中「恒 WARN 不影响 rc」，但出现第二个孪生桶／孤儿对象被 gc／严格层指针指向无 change-id 的非 GitButler commit（`cidCovered<cidTotal`）都会使 rc 翻 1——WARN 态事项反噬 rc | 84-check.mjs:353 vs 预声明 §5 矩阵＋文件头自宣「恒 WARN 不影响 rc」 | 改覆盖率式断言（cid 覆盖率＋桶逐件 WARN 列报）或钉「≥1 且全列报」不钉等值 |
| D2 | **`PV-C-LEGAL-FORM` 恒真**：legal 入集前提是 `resolveSha` 已证 `^{commit}`，再 `cat-file -t` 恒得 `commit`——Bond 判据「还能失败吗」=否 | mjs:335-336 | 改断「legal 指针逐件 ≥12hex∧subject∧可解析」或转探测面登记 |
| D3 | **`PV-D3-KIND-SLUG-INJECTIVE` 构造恒真**：slug 由 `'PV-'+kind.toUpperCase()` 生成，两集合等长是定义推论 | mjs:342 | 删或改「slug 词表↔kind 枚举对表」 |
| D4 | **枚举盲区：裸 `commit`/`SHA` 列头不入严格层**——本批文书自体即利用盲区：r52-report §6 `\| … \| commit \|` 列装 8-hex 无 subject 指针（`037f64cb`/`116a6594`/`ea6866a2`/`ebdf743f`）；handoff commit 序表 `\| SHA \| 腿 \|` 列装 40-hex 无 subject 指针。按 D-189⑧ 职能定义（表内唯一指代手段）应为严格层→新立法生效后（D-148③）新违规且守卫漏检；按封闭枚举字面则无违规但枚举欠列 | mjs:29-33 名单 vs r52-report §6 / 6F-r52-handoff commit 序表 | 文书改用白名单列头＋法定形指针（正解）；或列头扩列走立法票——至少须登记盲区 |
| D5 | `bareCodes` 英文三字母词误报面：`commit fix 后` 类行文命中 `'commit '+[a-z]{3}`——仓内中文语境暂无命中但探测面语义脆弱 | mjs:178-184 | 词表黑名单或要求短码后接 `（`/`(` |
| D6 | `splitRow` 假设行尾 `\|`：GFM 允许省略外管——`a|b` 行或缺尾管行静默丢列；代码围栏 ``` 内表格/`#` 行未排除会误喂 strictCells | mjs:106-115 | 健壮性补件（列入下轮，非本轮阻断） |
| D7 | `hasSubject` 接受 ` ("")` 空 subject 作校验位；`'\\'` 字面量孤例（line 92）与「零反斜杠」自述口径错位 | mjs:201/92 | nit |

## 7. 宽层残留抽查读数（D-188⑥——本窗实测履行）

普查口径：扫描面 5 根（含 SKIP_DIRS 同守卫）内**极大 hex run 长度 12~40** 唯一 token→逐个 `git cat-file -t` 实证。

- 总量：**1076 唯一 token／可解析 29／非对象 1047**（长度分布 12h:916·16h:57·32h:51·40h:47·其余 5）。
- 良性主体：上游仓 SHA（macro-b/c 分析档案 39-/40-/46-/48- 系 ~700＋）；审计证据摘要（r32 e2e/trials md5 类 ~200＋）；调研档案 synthetic（`a1b2…`、`deadbeef`、`0000…` 等）。
- **仓内叙事文书残留**（非上游/摘要类，逐件待定性）：`decision-ledger.md` 6 件（`eec2ad179053`/`df6a278f2a6f`/`09d4877d9a23`/`b69aea3bbfba`/`065c362e2d71` 12h stale ＋ E-3 40h）；handoffs 4 件（`e0ab92dca215a66d`/`b545e0e9f2b0e5e8`/`0628234f798bc569` 16h stale ＋ `037f64cb037f64cb` 自纠实录）；r49-audit 2 件（`0830a98300676210e2fca` 21h／`f2d85493b161c8dcc` 17h 截断 SHA 形）；r49-predecl 2 件（`966c7e7f…` 40h／`8d908aa9f7e8de8f5a20ff1d` 24h）；r46-exec 3 件 12h；r24~r38 审计报告若干 12/16h；`80-bench-thresholds` `ba83908a…` 40h；`architecture-recovery/decision-ledger.md` 10 件。
- **结论**：「6 个」自述偏小一个数量级——即便剔除上游/摘要后仍 ≥20 件。该残留属机检固有盲区属实，但下轮人工抽查基数应按本普查而非「6」。建议：①报告数字按口径更正（勘误）；②残留分四类登记（上游 SHA／证据摘要／stale 本仓 SHA／synthetic）逐件定性；③`0830a98300676210e2fca`/`f2d85493b161c8dcc` 这类奇长截断形优先定性（幻觉 hex 族嫌疑）。

## 8. 返工批要求（若用户采纳打回）＋重跑清单

**修复要求（小修批，独立 commit 序：修→勘误→文书同步）**：

1. 补尾行：`84-check.mjs`、`decision-ledger.md`、`CHANGELOG.md` 末行补 `\n`（Node 写入＋回读断言，禁 BOM）。
2. 冻结件勘误：predecl §7 按 D-181 append-only 补登 §4 全九项偏离（P1~P9），含「实现已偏离声明」逐条对照；或回改实现贴合声明（P1/P2/P3/P7 为推荐回改位——守严不扩面）。
3. 修 `PV-F10B` 正则补 `:行号` 冒号行号形态（声明三形态补齐）；补 fixture 反例。
4. 修 `PV-E-TWIN-COVERAGE` 去钉数——改 cid 覆盖率断言（cidCovered===cidTotal 可保留但须对无 change-id 指针豁免或登记）＋桶逐件 WARN 列报，消除 WARN 态反噬 rc；同步审视 `PV-C`/`PV-D3` 恒真性（D-167-c Bond 判据：删除或改实断）。
5. 证据行更正：r52-report `--emit` 行改实测（30/17 或注明时点）；「files=759」注「收口前两件文书落盘前读数」；「425 行」改 440/441；「零扩面」删或改写。
6. D4 盲区处置：本批文书 `commit`/`SHA` 列头指针改法定形（SHA≥12hex＋`("subject")`），并将「裸 commit/SHA 列头不入严格层」登记为枚举盲区（扩列走立法票 D-095 或勘误注记）；下轮把「列头盲区」列入 T1 呈裁。
7. `63-assertion-inventory.json` `updated`/`updated_by` 随 bundle 腿更新（或登记该字段为挥发字段豁免）。

**重跑清单（修完必跑——与本窗同一套）**：

```
node .scratch/architecture-recovery/reports/84-check.mjs
node .scratch/architecture-recovery/reports/84-check.mjs --emit
node .scratch/architecture-recovery/reports/guard-all-run.mjs
node engine/scripts/check-dist.mjs
cd engine && npm run build && npm run package && npm run smoke && node dist/cli.js selftest
git status --porcelain
# 尾行回读断言：三文件末字节==0x0A 且无 BOM
# predecl §7 勘误条目在场断言
```

## 9. 审计自身边界

- 本窗零写仓内语义面：未改任何文件（本报告为唯一新增），未 commit、未 push、未触碰 `engine/src|dist`（亲跑 build/package/smoke 均为只读再生产，check-dist 复核零 drift）。
- 双轴评审经两个并行子代理完成（Standards/Spec），发现均经本窗对实物复核后方列入上文；未采信子代理未能自证之点（commit 序/trailer 由本窗 git 亲证）。
- 宽层抽查（§7）按 D-188⑥ 职责呈报读数，定性裁定归用户/T3 窗。
- 本报告自体遵守指针纪律：commit 引用一律法定形（`SHA≥12hex`＋`("subject")`）或宽层自由提及；表头避开严格层白名单形态。
