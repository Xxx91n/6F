# 轮 37 T1 / #75批1 审计报告 —— 复核结果：打回窄返工（册外新红 23-P2）

- 日期：2026-09-27（审计窗，非修复窗）
- 对象：`reports/2026-09-27-r37-exec-report.md` ＋ `handoffs/2026-09-27-r37-t1-handoff.md` ＋ 栈 `r37-t1-75b1` 三提交（16947e6 feat / a93942a chore-regen / 9c6dec4 docs-A-097）；固定点=a198e15（r36-closeout 顶）
- 方法：不信自述——逐项亲跑硬验收＋逐声明仓库实物抽查＋双轴评审（Standards/Spec 并行子代理，评审 diff 存档 `audits/r37/audit-r37-code.diff`）
- **裁定：打回（单项窄返工）**——交付 12 件三分类建制本身扎实且逐条实物吻合，但收口判据 `guard-all-run` 于审计时点 FAIL（册外新红），不满足「收口前守卫组绿」前置。

## 1. 硬验收亲跑（对照报告 §5）

| 项 | 报告声称 | 审计复跑实测 | 结论 |
|---|---|---|---|
| 编译 | tsc 0 + BUNDLE-OK | `npm run build` → BUNDLE-OK dist/cli.js | ✅ |
| dist 零漂 | DIST-RATCHET 263151B/289395B | PASS 263151B/289395B（margin 26244B） | ✅ |
| 打包 | 85 件 255.2kB | macro-audit-0.1.0.tgz 85 件 255.2kB | ✅ |
| selftest | 5/5 ok:true | 5/5 ok:true | ✅ |
| MCP 测活 | init + tools=[facts,quarantine,file_card] | initialize ok，tools/list=[facts,quarantine,file_card] | ✅ |
| smoke | 22 册全 PASS | 22 件链全绿（SMOKE 6/6…FILE-CARD 36/36，含 PROBE-INVARIANT） | ✅ |
| **守卫升格判据** | **ran=60 red=1(registered) problems=0 PASS** | **ran=60 red=2 registered=1 problems=1 → GUARD-ALL-RESULT: FAIL** | **❌ 册外新红 23-first-report-check.mjs P2** |
| 75a 普查 | 9/9 PASS findings=348 | 9/9 PASS findings=348 | ✅ |
| NUL/BOM | 0/0 | grep -rlP \x00 全改动面 0 命中；BOM 0 | ✅（附 P-7 尾行小疵） |

## 2. F1 册外新红定性（打回根因）

- 现象：`node .scratch/architecture-recovery/reports/guard-all-run.mjs` → `FAIL 册外新红: 23-first-report-check.mjs`；单跑 23-check → `FAIL P2 — 票 22 预声明已 commit：73954956（预期 7395495）`。
- 根因（实物核实）：23-check:42 `git log --format=%h -1` 出缩写 SHA 与 `23-gates.json` 钉字面 `t22_prereg_commit:"7395495"` 做严格等值比较；本仓 odb 对象增长触发 git auto-abbrev 7→8 位跳变（同一会话内亲见 `git log --oneline` 由 7 位转 8 位：`c2e4c5b`→`c2e4c5b9`；`git -c core.abbrev=7` 强制 7 位即复现 `7395495`；`rev-parse 7395495` 单值解析无歧义，非碰撞型）。
- 时点推断：报告时点 %h=7 位判据绿属实（不证伪）；漂移发生于其后（`but` 后台 fetch/对象库增长越界）。**但钉面脆性客观存在**——断言随 odb 规模非确定性失效，正是本轮 D-094② 要管的「字面钉」族成员（短 SHA 等值钉），修复窗触过 23-check 文件而未顺带硬化该钉。
- 机制自证有效：升格判据正确拦下新红（`册外新红=FAIL`），known-red 册件 01 slugs=D1,D5 与 expected_slugs 精确吻合。

## 3. 声明→证据→结论对照表（报告关键声明逐条）

| # | 报告声明 | 实物证据 | 结论 |
|---|---|---|---|
| 1 | 12 件静默红全过 D-094 门，11 改断言+1 入册 | `git show 16947e6` 逐件 hunk 核对：20=A5 裸词→8 条 SQL 语句形态正则；23=import→dist/generate.js；25=C3b 末格非空+C5a 剥末格；26/28/30=porcelain→票面 commit 集物证（A-031/A-033/A-035 grep+show --name-only 触碰面审计）；35=D-035∪D-045 并集回查；37=C2 逐 SHA committer 核验+C3 ls-tree 钉快照 head；38=D4 钉 meas.adr_count+F2/F5 收窄；41a=D7b 编年键覆盖集∋dMax（含 ~/～区间展开 cap200）；44=G6 行级共现；54=B2/B3 吸收后分类锚+stripComments | ✅ 逐字吻合 |
| 2 | 01 入册 kr-01 四要素齐备 | known-red-manifest.json：policy 明文「只收 legit-drift/欺诈禁入册」；entry 含 evidence/review_anchor（语料重采样票 或 stage3-close）/expires_fallback=2026-12-31/added；expected_slugs=[D1,D5] 与实测红 slug 一致 | ✅ |
| 3 | 75a 七族 348 条全归因 | register entries=348；kind 分布 53+51+10+2+41+115+76 与报告逐数吻合；dispositions 六类齐；C1/C2 注册表对偶闸实测绿 | ✅ |
| 4 | 83-B2 multi-hit 注册（P5-B2 顺带） | register 中 83-check 2 条 acknowledged-multi-hit（available_head_shas×3、FILE_CARD_HISTORY_DERIVED_FACETS×2），note 载 D-143④ 禁加分支凑数 | ✅ |
| 5 | 剥注释通用化 | _lib/check-kit.mjs 24 行（行注/块注/字符串保护）在档；54-check 接为消费点；41 件 unstripped-scan 登记 convention-registered | ✅（P-4 弱化见下） |
| 6 | 三层命名 | 115 existence-assert 全标 layer=presence；liveness/readiness 语义在 meta | ✅ 收窄属实（见 P-2） |
| 7 | 升格判据落地 | guard-all-run.mjs 68 行：动态枚举 *-check+xfail-run=60、册外新红 FAIL、册件复绿 FAIL（strict）、悬空 FAIL、slug 漂移 WARN、剥 NODE_OPTIONS；registry trigger status=decided、t3-guard-manifest-shipped.occurred=true、kr-01 manual_watch 五要素、corpus-resnapshot-landed 事件立；AGENTS 升格条款在文 | ✅ 机制在案（当前红=F1） |
| 8 | stale-assertions policy_d094 | meta.policy_d094 在文（禁欺诈入册条款） | ✅ |
| 9 | 账行↔编年同 commit | 9c6dec4 同时含 A-097 账行+M-020 编年段 | ✅ D-144① |
| 10 | 生成物再生独立 commit | a93942a 仅工件面（48-golden×11/01-spotcheck/56-heldout/63-inventory/75a-census×2）；feat/docs 分离干净 | ✅ D-140② |
| 11 | BACKLOG #75 批1 闭环标/WORKFLOW lessons/CONTEXT 面 | BACKLOG.md:96 批1 闭环〔A-097〕在文；WORKFLOW:361 lessons 行在文 | ✅ |
| 12 | 未 push | `git branch -a --contains 9c6dec4` 仅 gitbutler/workspace+r37-t1-75b1+gb-local；origin 无 r37 分支 | ✅ |
| 13 | 引擎产物零字节差 | 本轮三 commit 零触 engine/src|dist；check-dist 复跑 PASS | ✅ |
| 14 | 红线遵守 | B 轨零触/无删 dist/阈值非先写死/摄入四档未动/密封验收语义未动 | ✅ |

## 4. 双轴评审（子代理并行，diff=audits/r37/audit-r37-code.diff）

### Standards 轴

- **硬违规：无。** 生成物隔离 commit（D-140②）/编年随行（D-144①）/账册政策句/只读 git 调用/AGENTS 升格条款一致性全部核过。
- judgement calls：26/28/30 `git log --grep + show --name-only` 触及面机件三份重复（_lib/check-kit.mjs 本批新建可收留）;freeze-SHA 前缀比对两处重复；`stripMdComments` 零调用；SCAN_EXEMPT 列 `guard-all-run.mjs` 不可达项（枚举面为 -check.mjs）；38-F2 收窄至「非空串」弱于枚举域钉；75a S1 自指断言恒真边例；75a 每跑写 findings 工件（有意设计但属守卫写工作树）；41a 手写 indexOf 解析器；guard-all-run FAIL-slug 正则耦合 60 件输出格式；manifest policy 文「三分位」疑「三分类」笔误；multi-hit 普查仅收 `.indexOf(` 字面量（includes/test 逃逸）；unstrippedScanHit 对「注释提及 stripComments」即豁免。

### Spec 轴

- (a) 缺失/弱化：三层命名仅落为 register layer 元数据（断言名/文本未动，liveness/readiness 仅存 meta 散文）；剥注释通用化=仅 54-check 消费（41 件登记存量按「新增断言须过剥注释面」豁免——可辩护但需明言）；普查 walk 面漏 `.scratch/macro-audit/`（multi-hit 欠全量）。
- (b) scope creep：无实项。
- (c) 实现弱化：38-F2 枚举域钉应保留（`contradicts` 也过）；37-C2 欠数检出能力丧失（单向收窄）；25-C5a 末格剥离致拍板状态列成禁言盲区；20-A5 新正则跑在未剥注释 storeCode 上（注释含 "DELETE FROM" 会误报——同批自产剥注释库未自消费）；kr-01 分类 (b) 可争议（语料退化最硬裁定项——但复审锚+期限在册，延期修通道系 D-094 设计内）；41a-D7b 覆盖集计指针性提及即可满足（票面定义如此）。
- (d) 红线：全数守住。

## 5. 呈报项（非阻塞，随返工批登记或归批2+排产）

- **P-1**：38-check F2 断言力收窄（全 supports→非空串即过）——建议枚举域钉 `support∈{supports,...}` 收窄。
- **P-2**：三层命名落地形态=register 元数据而非断言名修订——窄于票面但合「115 件标 layer=presence」自述；补 liveness/readiness 实件或改票面措辞。
- **P-3**：25-C5a 末格剥离禁言盲区；37-C2 欠数不可检出（如账面认为可接受请在册注记）。
- **P-4**：20-A5 正则扫未剥注释源文；unstrippedScanHit 探测含「注释提名即豁免」漏洞；multi-hit 仅收 indexOf 字面量且漏扫 macro-audit 面。
- **P-5**：26/28/30 票面 commit 集机件三份复制——check-kit 收留去重。
- **P-6**：manifest policy「三分位」笔误（全文处处「三分类」）；SCAN_EXEMPT 不可达项；stripMdComments 零调用。
- **P-7**：`01-spotcheck.json` 已提交 blob 缺尾行（生成物级；tailNL 纪律是否覆盖 JSON 工件请票面明言）。

## 6. 过程违规呈报

- **无过程违规。** commit 分件干净（feat/chore/docs 分离）、编年随行同 commit、未 push、NUL/BOM 清零、报告命名合纪、红线全守。
- 审计自身副作用披露：本窗复跑守卫令 48-golden/01-spotcheck/56-heldout 等实跑工件再生（` M` 漂移=时间戳/回执刷新，设计内）——归修复窗下批 chore commit 收容或 but discard 处置均可；评审 diff 工件已存 `audits/r37/audit-r37-code.diff`。

## 7. 返工要求（打回清单）

**F1 必修（唯一阻塞项）**：23-first-report-check.mjs P2 短 SHA 等值钉失效——按 D-094(b) 改断言：建议 `git log --format=%H` 全锚 + `fullSha.startsWith(gates.preflight.t22_prereg_commit)` 前缀等值（钉钉=预声明 commit 存在性，非钉显示宽度）；或 gates JSON 改钉全 SHA。同批顺手 grep `%h`/`--short`/`slice(0,7)` 等短 SHA 比较位点排除同族残余（75a 无此探测族，建议批2+ 立 short-sha-pin 族候选）。

**返工后重跑清单（与本审计同套）**：
1. `cd engine && npm run build`（tsc 0+BUNDLE-OK）
2. `node scripts/check-dist.mjs`（PASS）
3. `npm run package`（85 件）
4. `npm run selftest`（5/5）
5. MCP 测活 initialize+tools/list=[facts,quarantine,file_card]
6. `npm run smoke`（22 册全绿）
7. `node .scratch/architecture-recovery/reports/guard-all-run.mjs` → **GUARD-ALL-RESULT: PASS（red 集⊆册）**
8. `node .scratch/architecture-recovery/reports/75a-check.mjs`（9/9）
9. NUL/BOM 嗅探全改动面 0/0

**裁断注记**：本审计按职责分离未动手修。P-1~P-7 为呈报项非打回条件——由修复窗裁定吸纳或票面登记批2+。

---

## LOOP-2 复核核销（2026-09-27，返工后）

**裁定：F1 核销——审计通过。**

### 返工实物核对（亲跑，非轻信自述）

| 验收项 | 复跑结果 |
|---|---|
| build | PASS（tsc 0 + BUNDLE-OK） |
| check-dist | PASS 263151B/289395B（engine 零动） |
| package | PASS 85 件 tgz 255.2kB |
| selftest | PASS 5/5 |
| MCP stdio | engine/dist 零动 → 前轮实测结论沿用（dist/cli.js 263151B 逐字节同值） |
| smoke | 22 册全绿、FAIL 行 0（6 条命中均为 PASS 行内含 failure 字样） |
| 75a-check | PASS 9/9 findings=348 |
| guard-all-run | **PASS：ran=60 red=1(registered) problems=0**，红集={01}⊆册 |
| NUL/BOM/tailNL | 返工触及 21 文件 bad=[] |

### 修法核对

- `23-check` P2：`%h`→`%H` 全锚 + `startsWith(t22_prereg_commit)` 前缀等值，R37 返工注记行在位——钉=commit 存在性（行 42-45）。
- `75a-check`：新增 `short-sha-pin` 探测族（行 39）+ C4 正对照扩六族（行 121/124）；findings 仍 348 → 该族当前零命中，与残余普查声明一致。
- 同族残余独立复扫（剥注释）：12 命中全部为 detail 打印/数组截取/探测族自身——断言面零残余属实。

### 过程核对

- commit 分件：`4d92312c` fix（仅 23-check+75a-check 两语义文件）/`ed9e085f` chore（纯再生工件 12 件）/`68d9c51f` docs（A-098 账行+M-021 编年+rework-report+handoff 追记四件同 commit，D-144① 合规）。
- 账行 A-098 在位（ledger:434）、M-021 在编年（CHANGELOG:166-172，a_range 升至 A-098）、返工报告与 handoff 追记段在档。
- 未 push。

### 闭环结论

轮 37 T1 / BACKLOG #75 批1 审计闭环成立：打回→窄修→同套九项复验全绿→账编随行钉合规。附注：本 LOOP 同时构成升格机制首次实战拦截记录——册外新红被如实挡在闸门外，修复后红集回落册内。

## 产物（LOOP-2）

- 本核销段（追加于本报告末）
- 审计窗交接：`.scratch/macro-audit/handoffs/2026-09-27-r37-audit-pass-handoff.md`

*LOOP-2 复核毕——审计通过。*
