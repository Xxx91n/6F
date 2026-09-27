# 2026-09-27 轮40 T1 批2-β 探测面硬化实施批 — 审计报告（审计窗）

> 审计对象 = commit `acd79890`（feat 实施批）＋`6278ef92`（docs 收口：执行报告＋交接）@ `r40-b2beta-hardening`（栈叠 `ae35b99c`/r39-closeout；GitButler workspace 顶件 93213b43）。
> 被审件 = `.scratch/macro-audit/reports/2026-09-27-r40-exec-report.md`＋`.scratch/macro-audit/handoffs/2026-09-27-r40-t1-closeout-handoff.md`；任务书 = `handoffs/next-round.md` §T1。
> 裁定面 = D-153②〔①②③〕/D-154①②③④/D-156④；纪律面 = D-094③/D-144①/D-145①；守卫判据 = D-149④ 升格后形态（guard-all-run 全量＋红集⊆册）。
> 方法 = 不信自述：硬验收亲自重跑＋逐声明仓库实物抽查（rg/字节级/键集比对）＋$code-review 双轴并行子代理＋变异检查。审计窗只出报告不动手修。

## 结论：有条件通过（conditional PASS）

硬验收八项全绿（全部亲跑非引述）、裁定面四子项逐项兑现、§3 偏差披露机理三点全实证成立且 S2 等价兑现判为 honoring intent、过程纪律零违规。
**唯一实质发现 F-A1（弱化类）**：豁免谓词在剥后源码上测 `stripComments|stripMdComments` 裸子串——stripComments 不剥字符串字面量，故 `const x='stripComments'` 式字符串提名仍获豁免（审计实证：合成源探测谓词命中=true）。与刚收口的注释提名逃逸同族残余面；且 CONTEXT.md 新词条明示「注释或字符串里的字面提名不计」——措辞越界于实现实态（实现未排字符串提名）。处置见 §5（打回修复窗或呈报批准修，审计不代裁）。

## 1. 硬验收重跑（审计窗亲跑）

| 验收项 | 报告声明 | 审计实跑 | 判定 |
|---|---|---|---|
| 75a-check | PASS 10/10，findings=389↔register 389 | `env -u NODE_OPTIONS node 75a-check.mjs` → GUARD RESULT: PASS（10 pass, 0 fail）findings=389；S2 读数 hit=true comment=true import=false call=false 逐位同 | 属实 |
| 70-check | PASS 13/13（E1 盘点再生 75a 9→10） | PASS 13/13，C1=59 守卫/1398 调用点，E1 对账绿 | 属实 |
| guard-all-run | PASS ran=60 red=1={01-check}⊆kr-01 | ran=60 red=1 registered=1 problems=0；红件=01-check.mjs slugs=D1,D5；manifest 实测 kr-01-corpus-regen/guard=01-check/legit-drift | 属实 |
| npm run build | tsc+BUNDLE-OK | engine/ 下 BUNDLE-OK dist/cli.js | 属实 |
| check-dist | 263151B/cap 289395B、git 零 drift | DIST-RATCHET PASS 263151B/289395B margin 26244B；build 后 `git status engine/` 零改动 | 属实 |
| --version | rc=0 | {"name":"6f","version":"0.1.0",shells×4} | 属实 |
| selftest | ok:true 5/5 | ok:true，checks 5/5 pass | 属实 |
| 复跑一致性 | —（增补证据） | 审计复跑 75a-check 覆写 75a-census-findings.json 后 git status 零 diff＝落盘工件即真跑产物非手编 | 加强 |

## 2. 声明→证据→结论 对照表（报告 §1/§2 逐条）

| # | 报告声明 | 审计证据 | 结论 |
|---|---|---|---|
| ① | unstrippedScanHit 改测 stripComments 剥后消费位（注释提名不豁免；import/调用计消费位；谓词同走剥后面） | diff 实证三处谓词全改测 `stripped`（75a-check.mjs:49-53）；S2 fixture 四态判据覆盖三语义 | 兑现；**弱化残留**=字符串提名仍豁免（F-A1） |
| ② | multi-hit 扩 .includes(/.test( 字面量＋walk 补 macro-audit；dry-run 独立工件；delta 42+1 批注册；当日转窗 | 探针正则 `\.(?:indexOf\|includes\|test)\(` 在案；walk 第3面在案；dryrun 工件 90344B/389 条与 findings 键集 keyDiff=0（审计重算）；register round=40 恰 42 条全 `acknowledged-multi-hit`/`D-094②/D-154②`；--emit 提前 exit 不写主件（码证 99-102 vs 164） | 兑现 |
| ③ | SCAN_EXEMPT 摘死项＋S1 可达性改写＋register meta.exempt 归因 | diff 实证 {75a,guard-all-run}→{75a}；S1 改 assert `SCAN_EXEMPT ⊆ checkFiles`（引枚举面非自指、未挂册外锚——负向条款满足）；meta.exempt 载 D-094③/D-154③ 归因；old register meta.exempt 对照含死项 | 兑现 |
| ④ | ADR-0024 收①②（③不入）＋41 件册 note 挂指针＋CONTEXT 双词条 | ADR-0024 在盘 4430B 无 BOM 尾 NL（字节级亲验）；Ledger 行引 D-153②〔①②〕/D-154①②；Context/Rejected 节明示③处置类不入；register unstripped-scan 41/41 条含 ADR-0024 指针；CONTEXT ##Language 尾部双词条在 | 兑现；CONTEXT「字符串提名不计」措辞越界（F-A1 伴随项） |
| 348→389 | register 净迁移 | old register=348（ae35b99c 检出亲数）；new=389；42 新−1 悬空摘=+41 账平 | 属实 |
| 悬空 1 件摘除（46→49 归因迁移） | Map 后写覆盖 | old 键=46-check｜new 键=49-check（同 sha8 指纹 d46c5672——同字面量归因迁移实证非巧合） | 属实 |
| unstripped-scan 族 delta=0／存量 41 零迁移 | 两语义下皆命中 | 新 findings 该族=41＝旧册 41；全 41 条挂 ADR 指针 | 属实 |
| 编年 M-025 随行 | D-144① | M-025 在 acd79890 同一 commit（git show 亲验），非 docs commit 搭车 | 属实 |
| 他 agent 工作面未动 | 48-*×11＋56-heldout＋trials/codebuddy-r38 | git status 实测：M 件恰=11×48-*＋1×56-heldout；trials 暂存删除＋untracked 重建态与交接描述一致；本批 commit 不含上述件 | 属实 |
| 偏差披露（§3） | S1 自命中机理不成立→S2 兑现 | 三点机理全实证：主循环 `SCAN_EXEMPT.has→continue`（:61）短路三产线；C2 禁非活体键；75a 真 import stripComments 两语义皆豁免。S2 变异检查：旧谓词回灌→fxCommentOnly false→S2 红（killable 实证） | 披露诚实＋等价兑现判 honoring intent |

## 3. D-xxx 逐条核对

| 裁定 | 要求 | 实现证据 | 判定 |
|---|---|---|---|
| D-153②〔①〕 | 剥后消费位＋立 ADR-0024 | 见①④行 | 兑现（残留见 F-A1） |
| D-153②〔②〕 | 扩面＋walk 补面＋三分类门注册 | 42 条全过 D-094 门 disposition/decision/round 三字段齐 | 兑现 |
| D-153②〔③〕 | 摘死项＋S1 恒真改可达性 | S1=⊆walked 枚举面 assert，killable（加死项即红） | 兑现 |
| D-154① | 面A 最小修法 | 谓词三处同迁剥后面，最小 diff | 兑现（弱化残留 F-A1） |
| D-154② | dry-run→批注册→当日 enforcing＋禁过期差值 | dryrun 独立工件＋转窗日实跑 keyDiff=0 | 兑现 |
| D-154③ | 摘死项＋S1 改写＋348→349 预读 | 前半兑现；+1 预读机理不成立→S2 正对照替代（已披露，审计认可等价） | 兑现＋已披露偏差 |
| D-154④ | ③不入 ADR-0024 | ADR 双节明示排除 | 兑现 |
| D-156④ | CONTEXT 双词条随 ADR 同立 | 双词条在 ##Language 尾、同 commit | 兑现（措辞过界见 F-A1） |
| D-094③ | 归因注记 | 源码注释＋meta.exempt 双载 | 兑现 |
| D-144① | 编年随行 | M-025 随 feat commit | 兑现 |
| D-145① | engine 触碰前置 | commit 零 engine/ 路径，豁免成立且自增补 build+check-dist 证据 | 兑现 |
| D-149④ | 升格判据收口 | guard-all-run 60 件红集⊆册 | 兑现 |

## 4. 双轴评审摘要（$code-review，并行子代理）

### Standards 轴
- 硬违规：无。JSON 衍生件随行=批注册协议语义组成非格式搭车；check-kit/`t()` 约定与兄弟守卫一致。
- F-A1（主发现）：实现豁免谓词裸子串测试——字符串字面量提名仍豁免（残余逃逸同族）＋CONTEXT 措辞越界。
- F-A2（文案）：walk 行注释「实测零 .mjs——纯封洞」不严——walk 收 md/json/ts 且实测改变了既有字面量的 maxFile/计数归因（键集不变故 guard 不红；表述应限「零新增检出」）。
- F-A3（文案）：closeout-handoff 引 `75a-check.mjs:52-60`——continue 实在 :61、三产线 :63-67。
- F-A4（观察）：.test( 收集形态会把被测串当探针针（误收容量，批注册门已兜）；F-A5（存量）：unused `file` 参＋探针字面量收集自 raw 原文（注释内字面量可成针——扩面后收集面变宽）。

### Spec 轴
- 五项规定全核到实物；零 scope creep（衍生件全在 §6 声明）。
- F-A6（轻）：S2 注释「SCAN_EXEMPT 字面于真实消费位必被修后探测器命中」言过——fxConsumption 命中纯由 readFileSync+.indexOf 路径，该字面量为装饰。
- 偏差裁定：三点机理声明全在码中实证；S2 等价兑现 honoring intent（甚至比预读单发自命中更强的四态正对照）；披露诚实。

## 5. 过程违规呈报

**无**。commit 拆分干净（feat/docs 两 commit；编年随 feat 非 docs）；无格式变更搭车；无 engine 产物搭车；无越权 push；未动他 agent 面。

## 6. 处置建议（审计不代裁）

- **F-A1（唯一实质项）两径呈报**：(a) 修复窗小修——豁免谓词收紧至真实消费形态（如测 `stripComments\s*\(`／`import` 语句形态），同步修 CONTEXT 措辞；收紧若产新检出按 D-094 门照常注册；(b) 若裁定接受「剥后提名即豁免」现状语义——至少修 CONTEXT「字符串」三字越界并补记 ADR-0024 Consequences 注记。重跑清单（无论谁修）：`env -u NODE_OPTIONS node 75a-check.mjs`（期望 10/10；若新检出→批注册随行）＋`node 70-check.mjs`＋`guard-all-run.mjs`＋keyDiff 复算。
- F-A2/A3/A6 文案级：随 F-A1 同窗顺手修（NO-OP 搭车例外适用面——同文件顺手整理）。
- F-A4/A5：观察登记，不阻塞；探针针收集自 raw 面建议批3 点级锚改造时一并裁。

## 7. 引用（审计亲验件）

- 实跑证据：本报告 §1 表内全部命令当窗亲跑；变异检查=ctx 沙箱合成源回灌旧谓词。
- 文件：75a-check.mjs(:48-54,:57,:61,:67,:82,:150-161)、75a-census-register.json（389/meta.exempt/42×r40/41×ADR 指针）、75a-b2beta-dryrun-findings.json、docs/adr/0024、CONTEXT.md、CHANGELOG.md(M-025)、docs/adr/README.md(+行)、known-red-manifest.json(kr-01)。
