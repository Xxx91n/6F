# 轮31 审计报告——#80 Micro-B 步①执行结果复核（ verdict: FAIL——打回返工 ）

- 日期：2026-09-23　会话：审计 Agent（独立复核窗，不动手修）
- 被审对象：分支 `r31-micro-b-step1` 两提交 `2bcf515`(wzt impl)+`677f3bb`(nkn docs)，fixed point=4f245c7
- 被审文书：`.scratch/macro-audit/reports/2026-09-23-r31-exec-report.md` + `handoffs/2026-09-23-r31-exec-handoff.md`
- 票面：BACKLOG #80 步①＝任务书 T1（D-124/D-125/D-038；ADR-0023）；impl 裁决账本=A-091
- 方法：不信自述——硬验收当窗重跑＋每条声明实物抽查（rg/文件存在性/真跑）＋$code-review 双轴（Standards+Spec 并行子代理取证）＋D-xxx 逐条对证

## ① 硬验收重跑（审计窗实测，非报告转述）

| 验收项 | 报告自述 | 审计实测 | 结论 |
|---|---|---|---|
| 编译 | `npx tsc -p tsconfig.json` 0 error | `npx tsc -p tsconfig.json` exit 0 零输出 | ✅ 实绿 |
| 打包 | npm pack dry-run 81 files/173.8kB | `npm run package` exit 0，macro-audit-0.1.0.tgz 81 files/173.8kB | ✅ 实绿 |
| 启动测活 | selftest ok=true＋smoke 6/6 | `node dist/cli.js selftest` → ok:true 五查全 pass | ✅ 实绿 |
| 每平台 test 闭环 | smoke 全链 19 件 | `npm run smoke` exit 0（&& 链全过）；**链实为 20 件**，micro-b-emit 在链第 5 位，独跑 MICRO-B-EMIT-TEST-OK 17/17 | ✅ 实绿（计数自述错：19→20） |
| 守卫基线 | 13 件全绿＋80-check 20/20＋xfail 0 | 33=31/31、39=28/28、40=57/57、43=28/28、44=59/59、45=51/51、70=13/13、71=16/16、72=16/16、73=14/14、77=16/16、80=20/20、xfail=0 条全 PASS；**41a=FAIL 1/38（D6）** | ❌ **41a 红** |
| CI 契约面 | 未述 | engine-ci rebuild-diff 步 `npm run build` 后 `git status --porcelain -- dist/` 须空——当前提交态 dist/cli.js=裸 tsc 产物，build 重跑即漂移 | ❌ **推即红（潜伏）** |

## ② 声明 → 证据 → 结论 对照表

| # | 报告声明 | 审计取证（亲验） | 结论 |
|---|---|---|---|
| 1 | subject 规范化形=SCIP 五规则+NFC+禁折叠+case 冲突告警+symlink 细则，归一单点在发射边界 | `engine/src/fact/subject.ts` 实物在：normalizeSubjectPath 拒 absolute/dotdot/NUL/empty、反斜杠→`/`、`.`/空段清洗、NFC 显式、字面保留不折叠；detectCaseOnlyConflicts 分桶成对；codelore.ts emit 边界+explain/dossier 同器归一（L120/683 命中）；symlink 走 defaultSubjectPathProbe（lstat→realpath 仓内 regular file） | ✅ 成立（一处微缺陷见④-S3） |
| 2 | per-file 一等事实：subject_ref=规范化 path、value_json=per-path-face 行对象、append-only+去重幂等 | emitPerFileFacts 实物在：path/entity 单文件行、entity_a+entity_b 双端 peer 互指、非文件粒度行不发射；makeFact fact_id=deriveFactId(desc,subject_ref,metric,value_json,observed_at) 含 subject→哈希精确到文件；per-call seen 去重；实测 batch1 夹具 file_facet_row=1078/363 subject（独立重算一致） | ✅ 成立 |
| 3 | file_renamed 血缘一等事实 {from,to,head_sha,threshold,detector_version} 参数入载荷可复算 | file-lineage.ts 实物：载荷八键（五合同字段+commit_sha/similarity/git_version 举证）；collectFileLineage 三 metric（renamed/lineage_skip/lineage_scan）；C1/C2 合成字节测试+C3 真 git tmpdir e2e（本窗重跑 PASS） | ✅ 成立 |
| 4 | 跨 git 版本可复算验证件 | e2e 断言 `gitRenameLogArgs('50%')` 真子进程（非回放），CI 3OS×2Node 六腿同跑；git_version 随行举证不入骨架锁 | ⚠️ 弱达标：真 git 每腿实跑成立，但「跨版本」靠 matrix 附带差异，无受控双版本对照断言 |
| 5 | facet_rows 降 raw 证据位（append-only 保留+role 标记） | codelore.ts L293-303：聚合载荷 rows 全量保留+`role:'raw_evidence'`+per_file_emitted 计数；测试 D1 断 role+保留 | ✅ 成立 |
| 6 | Macro-B behavior 消费面迁移+对照期对账判据（BbA 先例） | audit.ts L164-173：读源=reaggregateFileFacetRows 重聚合；bhvPc1 并入 `facetRecon.match===true`；判据=per-file 重算多重集==file-bearing 聚合行−skipped（reconcilePerFileVsAggregate 实物逐行核）；measurements.micro_b{per_file_facts,subject_skips,case_conflicts,reconciliation} 披露在 | ✅ 成立（判据同源对称性一处边界缺陷见④-S2） |
| 7 | fixture golden=发射产出骨架锁（字段骨架非内容值）+D-038 fixture 体系接入 | golden --check 实跑 GOLDEN-CHECK-OK；骨架含 metric 集/value_json 键集/subject 形/role/skip/冲突对/血缘键集/recon——**但实锁内容值**（计数 11/9-2-7、subject 字面、skip raw_path 字面），超「非内容值」字面；落点=test/fixtures/micro-b/ 非 fixtures/{definitions,golden} 体系、未注册 fixtures/golden/manifest.json | ⚠️ 部分成立：golden 机制在且过；「骨架非内容值」字面超锁（方向=更严，可辩）；「D-038 体系接入」措辞偏松=同构范式非字面接入——两项呈报待裁 |
| 8 | 步①独立绿 | 编译/打包/测活/smoke 实测全绿；**但守卫基线 41a 红＋dist 产物违构建契约（见③）** | ❌ 不成立（两处红） |
| 9 | 账本落盘 A-091 | `.scratch/architecture-recovery/decision-ledger.md` A-091 行在（①~⑦ impl 裁决全录，状态 implemented 2026-09-23） | ✅ 成立 |
| 10 | upstream-dimension-map Micro-B 不入 S 维归位 | L167 `if (f.scale==='Micro-B') continue` 实物在 | ✅ 成立 |
| 11 | fileLineage 旗标 audit=on/demo=off | audit.ts L151 `fileLineage:{mode:'on'}`；demo.ts collectMacroB spec 无 fileLineage 键=off；macro-b.ts spec 旗标+RenameLogRunner 注入缝在 | ✅ 成立 |
| 12 | 80-check 20/20＋63-inventory regen 55 守卫/1322 点 | 80-check 实跑 20/20；63-assertion-inventory.json 含 80-check(20 ids) 守卫计数=55 | ✅ 成立（但见③-R3：F2 断言空转） |
| 13 | CHANGELOG M-008 修 41a 陈旧断言根因 | M-008 行在且 adr_range=ADR-0023 正确——**但同 commit 落 A-091 未写 M-009，a_range 滞留 A-001~A-090→41a-D6 当场红** | ❌ 声明不实（修了旧漂移又造同款新漂移） |

## ③ 打回理由（硬红 3 条）

**R1 dist/cli.js 未走 bundle——违构建契约＋CI rebuild-diff 必红。** committed 态=裸 tsc 输出（346 行，`import {runSelftest} from './selftest.js'`），而 `npm run build`=tsc+esbuild 单文件 bundle（实跑重生产 5114 行）。审计窗实跑 `npm run build` 后 `git status --porcelain dist/` 即出 `M dist/cli.js`——engine-ci.yml rebuild-diff guard（3OS×2Node 每腿）推即红。文书铁证：PR checklist「engine/src 改→engine/dist 重建（npm run build）」/engine README/build-bundle.mjs 头注（git-clone 型安装零构建步靠 bundle 随源）。根因路径=报告自述编译命令 `npx tsc`（裸 tsc 覆写 cli.js 后入提交）；exec-handoff 还把错误规程固化成「tsc 重建一起提交」。

**R2 41a-check D6 FAIL——编年漂移同犯重演。** 账本 A-091 随 wzt 落盘，CHANGELOG 最新 a_range 仍 `A-001 ~ A-090`（M-008 自述「本轮零新增」对轮30成立，但轮31 新增 A-091 须自有编年行）。41a-check D6 实测 `want A-001 ~ A-091` → FAIL 1/38。此正是轮29 已立训的失败模式（WORKFLOW §4 2026-09-23 行：「账本新增 A-090 与同 commit CHANGELOG M-006 自相矛盾，41a D6 当场抓红」）——下一轮即重演。

**R3 80-check F2 断言空转（vacuous）。** `/| #80 |/.test(backlog)`——`|` 交替含空分支，对任意输入恒真，该断言永不可能 FAIL。违仓内反无牙断言纪律（D-079/断言普查建制方向）。

## ④ 弱化/跑偏/边界项（非阻塞，逐条列）

- S1「D-038 fixture 体系接入」弱化：落点 test/fixtures/micro-b/＋manifest 三件套=同构范式（生成器+golden+--check），但不在 fixtures/{definitions,golden} 树、未注册 fixtures/golden/manifest.json。呈报待裁：措辞勘误为「同构范式」或实物接入体系。
- S2 reconcile 判据与发射规则非同源（codelore.ts）：isFileBearing 认 entity_a/entity_b 不要求非空，emit 要求非空——`{'':...,entity_b:'x'}` 畸形对行=判据算 file-bearing 而发射静默不记 skip → 假 mismatch；rowRawPath 取 path/entity 优先于 entity_a，与 emit「对行优先」顺序相反——带 path 字段的对行若 path 在 skip 集会被错排。边界缺陷，现 fixture 不触发。
- S3 subject.ts `raw.trim()` 静默归一：' a.ts'→'a.ts' 无 warning 留痕=未申报身份合并（与禁折叠同族边界），'C:foo' drive-relative 逃逸 absolute 检。微缺陷：应告警或拒绝。
- S4 file_subject_skip 载荷两形态：emit 面 {analysis,group,raw_path,reason} vs explain 面 {raw_path,reason}（L122/685）——同 metric 两骨架。
- S5 file-lineage.ts `from_raw` 冗余：fromN 失败时 from 已=e.from 原值，from_raw 重复=死字段；file.lineage_skip 的 evidence 串丢 'HEAD'（与 argv/scan 行不一致——违本文件自述「argv=evidence 单源」）；parseRenameLogZ 截断尾边静默丢（from/to 空即跳——协议面 fail-fast 纪律的判断项）。
- S6 golden 锁面超票面字面（见②-7）——呈报待裁非定缺。
- S7 跨版本可复算弱达标（见②-4）。
- S8 文档计数漂移：报告「smoke 19 件/第 19 件」→实 20 件/链内第 5。
- S9 Micro-B ctx 字面量四重复制（codelore.ts L122/291/309/685）——可抽 microBCtx(ctx)，判断项；emitPerFileFacts 7 参+out 参=长参列，判断项。
- S10 AGENTS.md 绝对路径规则：报告§⑦引用清单用仓内相对路径（状态摘要段已给绝对路径，清单段从宽登记）。

## ⑤ 过程违规呈报（审计不替追认）

1. **「守卫基线复绿」自述失实**——报告§② 宣称 41a=38/38，committed 态实测 FAIL 1/38。且失败模式=上轮刚立训的编年漂移（同 commit 落账本行不补编年行）。收口自述绿前当窗实跑核验的教训条目已在 WORKFLOW，本轮违。
2. **dist 构建规程写错并固化进交接**——exec-handoff 写「改 src 后 tsc 重建一起提交」，正确规程=npm run build（tsc+bundle）；此错规程若被步②窗口照抄将再产同 defect。
3. **commit 账本引用纪律**：WORKFLOW §4（2026-09-11）「commit 必须以 A-NNN 起头或引用」——wzt 含「账本A-091」✅；**nkn `docs(r31)` 无任何账本/ADR 引用** ❌（未 push，可 but reword 补）。
4. **80-check F2 空断言**（见③-R3）——守卫自身质量项，随本批返工。

## ⑥ 返工要求（打回修复窗口）与重跑清单

必修（硬红）：
1. `cd engine && npm run build` 产 bundle 形态 dist/cli.js 入提交；exec-handoff「tsc 重建」措辞改「npm run build 重建（含 bundle 步）」。
2. CHANGELOG 补 M-009（轮31 步①编年行：a_range `A-001 ~ A-091`、adr_range 仍 ADR-0023、ledger_pointer 双账本含 A-091/D-121~127、impact 记步①交付）→ 41a-check 复跑须 38/38。
3. 80-check F2 修正则 `/\| #80 \|/`（转义竖线）→ 复跑 20/20 且断言有牙（可临时改 BACKLOG 验证会 FAIL 后还原，或人工核 regex 语义）。

建议同批（边界/一致性）：
4. reconcilePerFileVsAggregate 的 isFileBearing/rowRawPath 与 emit 同规则化（对行优先、非空约束一致）；subject.ts trim 前后不一致→warning 或 reject；file_subject_skip 两调用面载荷对齐；from_raw 删除或注明存在理由；file.lineage_skip evidence 补 HEAD 与 argv 同源。
5. nkn `but reword` 补账本引用（A-091）。
6. 报告勘误：§② 41a 红实录、smoke 计数 19→20；§①「D-038 体系接入」措辞按裁决改。

呈报用户裁决项（审计不定案）：
7. golden 锁面含内容值（计数/subject 字面）超「字段骨架非内容值」字面——方向=更严，接受则票面/报告补注「骨架+定点计数值」，不接受则收窄 skeleton 生成器。
8. S1「D-038 体系接入」口径裁决。

修后重跑清单（同本审计①套，缺一不收）：
- `cd engine && npx tsc -p tsconfig.json` exit 0
- `npm run build` → `git status --porcelain -- dist/` 空（等价 CI rebuild-diff 自查）
- `npm run package` exit 0；`node dist/cli.js selftest` ok:true
- `npm run smoke` exit 0（20 件含 micro-b-emit）
- 守卫全量：`for n in 33 39 40 41a 43 44 45 70 71 72 73 77 80; do node .scratch/architecture-recovery/reports/$n-check.mjs; done`＋`xfail-run.mjs` 全 PASS
- `node engine/scripts/gen-micro-b-emission-golden.mjs --check` GOLDEN-CHECK-OK

## ⑦ 审计范围声明

- 审计窗未改任何仓内文件；`npm run build` 验证性重跑产生的 dist/cli.js 漂移已 but discard 还原，but status=干净。
- 未验证项：跨 git 版本差异实测（本机单版本）、CI 真跑（未 push——rebuild-diff 结论为本地等价重放推断，非已发生事件）。
- 双轴评审原始输出：Standards 轴 4 硬违例+7 判断项（dist 契约/编年漂移/F2 空转/commit 引用=硬；ctx 复制/长参列/证据串漂移等=判断）；Spec 轴 (a)3 偏差 (b)零实质超 scope (c)5 疑似错——本报告②③④已逐条裁决采纳或降级，无未处置残留。
