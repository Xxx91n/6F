# R57 T1 执行批审计报告（审计窗随读批——独立复验）

- 窗口：2026-10-03；身份=**审计 Agent**（职责分离：只出报告，不动手修）。
- 被审对象：分支 `r57-t1-exec`，10 commit 链 `wto→tnz→vnm→npm→tnu→rtu→ytl→yop→tml→qrs`；固定点=`f96936fa`（wto 之父）→ 顶点=`75bcc4d`（qrs），diff 53 files / +8434 / −7078。
- 被审声明源：`D:/Aworker/6F/.scratch/macro-audit/reports/2026-10-03-r57-report.md`（69 行）＋预声明包 `...-r57-t1-predecl.md`（71 行）＋交接 `C:/Users/Administrator/AppData/Local/Temp/r57-t1-exec-handoff.md`。
- 方法：**不信报告自述**——硬验收四项亲自重跑（build/pack/测活/test 闭环），每条关键声明做仓库实物抽查（git show 元数据／JSON 实物计数／源码 grep／独立 CLI 实跑），双轴评审（Standards＋Spec）由审计窗自行执行（子代理派遣因鉴权失败不可用，已降级为同规程自跑并声明）。

---

## §0 审计结论（一句话）

**有条件通过（CONDITIONAL PASS）。** 四票（#84/#85/#86/#87）的**功能实现与全部机检判据经独立复跑全部成立**——85-check 26/26、86-check 18/18、守卫组 65/65 allOk=true、npm test 379 PASS / 0 FAIL、build 零 drift、pack/selftest/doctor 全绿，此六项均为审计窗**亲自实跑**读数，非引用报告自述。但存在 **2 项 P1 记账缺陷（账本事实错误）＋1 项 P1 结构性缺陷（收口节重复落账）＋2 项 P2 披露缺陷**，均属文书/记账面，**不推翻功能票闭环结论**，但账本作为唯一裁定事实源其准确性被打破，须返工修正后方可视为终态。

---

## §1 硬验收（审计窗亲自重跑——用户原话「编译通过、打包通过、启动并测活、每平台 test 闭环」）

| # | 验收项 | 审计窗实跑命令 | 实测读数 | 结论 |
|---|---|---|---|---|
| V-1 | 编译 | `cd engine && npm run build` | exit 0；`BUNDLE-OK dist/cli.js` | ✅ |
| V-2 | 打包 | `npm pack --dry-run` | `macro-audit-0.1.0.tgz`；89 files；280.8 kB | ✅ |
| V-3 | 启动测活 | `node dist/cli.js selftest` | `{"ok":true,...}` 5 checks 全 pass，exit 0 | ✅ |
| V-4 | 启动测活 | `node dist/cli.js doctor` | `overall:"ok"`；四腿 duckdb/bindings/git/upstream 全 ok | ✅ |
| V-5 | test 闭环 | `npm test`（gen+build+smoke 23 套件） | `TEST_EXIT=0`；`grep -c "^PASS "`=**379**；`grep -c "^FAIL "`=**0** | ✅ |
| V-6 | 零 drift | build 后 `node scripts/check-dist.mjs` | `DIST-RATCHET PASS: 310334B / cap 385000B`；build 前后同值＝**确定性构建零 drift** | ✅ |
| V-7 | 守卫组基线 | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | **`ran=65 green=65 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true`**；`GUARD-ALL-RESULT: PASS` | ✅ |
| V-8 | 命令面实跑 | `node engine/dist/cli.js audit . --scale Macro-C --out <tmp>`（审计窗独立发起，非经守卫） | `exit=0`；`report_id=MA-AUDIT-6F-MACRO-C`；`scale=Macro-C`；`capabilities=["macro-c"]`；五工件齐（audit-facts.jsonl / audit-measurements.json / facts.duckdb / report.json / report.md）；侧车 `structure applicability=derived dimensions=["S3"]`；`supply_chain applicability=not_applicable` | ✅ |

**V-5 套件明细（23 套件全绿，节选关键项）**：`MACRO-C-TEST-OK 23/23`（新入 smoke 链）、`SMOKE-OK 6/6`、`FILE-CARD 36/36`、`QUARANTINE 58/58`、`DIALECT-BOUNDARY 19/19`、`UPSTREAM-MAP-TEST-OK 21/21`、`GITHUB-REST 56/56`、`DEMO 38/38`。

**V-5b 报告未列但已核**：报告 §1 称「23 册套件」，实测 smoke 链 **23 个 test 文件**（`engine/package.json:30` scripts.smoke 逐节点名 23 项，macro-c 已入链）。数字相符。

---

## §2 「声明 → 证据 → 结论」逐条对照表

### 2.1 T1-A #84 Macro-C 产线化（D-204②④）

| 声明（报告行） | 审计窗证据 | 结论 |
|---|---|---|
| L10 `macro-c.ts` 460 行，38 §1~§9 编排逐段保真 | `wc -l`=**459**（差 1 行，非缺陷）；§0~§9 段落标记逐段在位（`§5 fact_id 内容寻址去重`@164／`§7 四象限`@332／`§8 事实库写入`@396／`§9 报告双件`@420），38 原件 §0/§2/§4/§5/§8/§9 对应齐 | ✅ 属实（行数表述微差） |
| L10 `fact-write.ts` 同 emit 函数/同 grain/同恒等式，`audit.ts`§8 与 `macro-c.ts` 同消费 | `macro-c.ts:30 import { writeRunFactsAndEvents } from "./fact-write.js"`；`fact-write.ts:91` QUARANTINE-CONSTRAINT 事务写；85-check A5 机核「同位共享核在（audit.ts 与 macro-c.ts 同消费）」PASS | ✅ 属实 |
| L11 `AUDIT_SCALES_IMPLEMENTED=[Macro-B, Macro-C]` | `engine/src/audit/audit.ts:29` 实文 `= ["Macro-B","Macro-C"]`；53-check B2 随改后 25/25 绿 | ✅ 属实 |
| L11 `not_in_preview=[Micro-A, Macro-A]`（audit.ts:304） | `audit.ts:316` 实文 `not_in_preview: ["Micro-A","Macro-A"]`；85-check A4 机核 PASS；**V-8 独立实跑侧车复现同值** | ✅ 属实 |
| L11 85-check **PASS 26/26** | 审计窗实跑 `node 85-check.mjs` → 末行 `PASS 26/26`，含 C1 编排层对账／C2 supersede 十计数／C3 chainFact fact_id 全等／C4 band 对账／D2·D3 正对照检出 | ✅ 属实（独立复现） |
| L12 命令面测活 exit 0＋五工件齐 | **V-8 独立实跑复现**（见上表） | ✅ 属实 |
| L14 `npm test` exit 0 全 23 册套件绿 | **V-5 实测 exit 0 / 379 PASS / 0 FAIL** | ✅ 属实 |
| L15 `npm pack` OK＋`check-dist` 310,334B/385,000B | **V-2／V-6 实测同值** | ✅ 属实 |
| L16 `selftest` ok＋`doctor` overall=ok | **V-3／V-4 实测同值** | ✅ 属实 |

### 2.2 T1-B #85 Micro-A 收窄批（D-204③）

| 声明（报告行） | 审计窗证据 | 结论 |
|---|---|---|
| L20 48-check 45/45／44-check 59/59／41b 33/33／73-check 14/14 全绿 | 审计窗逐件实跑：`48-check`→**PASS 45/45**；`44-check`→**PASS 59/59**；`41b-check`→**PASS 33/33**；`73-check`→**PASS 14/14**；另 `53-check` 25/25、`51-check` 42/42、`78-check` 42/42 | ✅ 属实（全部独立复现） |
| L20 README 双语＋sync 戳 `436fd419ff2a` | README.md / README.zh-CN.md 均含 `calibrated demo`＋`not in plugin distribution`；41b-check C2 戳一致性断言在链且绿 | ✅ 属实 |
| L21 #85② 产线化票立案，DoR-a Micro-A 分量维持不满足 | `BACKLOG.md:106` #85 行实文载「②产线化票…fetchDiffArtifact/cassetteFetcher 硬化」＋「闭环前 D-062 DoR-a Micro-A 分量维持不满足」，状态 `✅ 收窄批闭环＋产线化票立案` | ✅ 属实 |
| L54 48 生成器 `not_in_preview=[Micro-B, Macro-A]` 旧列含 Micro-B，本窗不动 | 报告已如实登记为「#85② 移植窗随改面」；属**授权边界内**的克制（未越权即正确） | ✅ 属实且处置得当 |

### 2.3 T1-C #86 对账/认领票包（D-207②③＋D-209）

| 声明（报告行） | 审计窗证据 | 结论 |
|---|---|---|
| L25 A-009 全数字表对账认领（认领非重议） | 账本 R57 节「#9 对账票——A-009 全数字表对账认领」行在位，原文含 SLA 5s/5s/15s/3 周期/6 周期/per-scale/T1-T5 全数字表，尾注「**认领非重议**（D-207② 负向行）——数值改动须另题」；A-009 数值表未被改写 | ✅ 属实 |
| L25 D-209 双语义域账本成文一行 | 账本 R57 节载 stale_data_marker 政策量四态 vs drift 位置量三态不互映射；`spec-phase-tasks.md:24` #9 行 R57 注同步在位 | ✅ 属实 |
| L25 #13 核销 | `spec-phase-tasks.md:28` #13 行「R56 注→已对账：A-013 已闭环事实对账…——D-207③」 | ✅ 属实 |
| L26 `grep 认领非重议` 命中 | 审计窗实跑命中（账本 R57 节） | ✅ 属实 |

### 2.4 T1-D #87 structure 摘帽接入（D-205②③）

| 声明（报告行） | 审计窗证据 | 结论 |
|---|---|---|
| L30 ADR-0013 预声明先行（代码 commit 前落盘） | **时序可证**：`wto`(predecl) `2026-10-03 13:34:25` < `npm`(T1-A feat) `15:09:14`；勘误 `tnz` 13:46:46 / `vnm` 15:08:47 亦均早于 feat | ✅ 属实（D-177／D-181 满足） |
| L31 86-check **PASS 18/18** | 审计窗实跑 `node 86-check.mjs` → A1~A5/B1~B7/C1~C6 全 PASS，末行计数 **18**；含 C2 正对照（单面值 99 vs facts 1 → 检出）、C3（5/6 面 → 成对闸拒绝）、C5（常量漂移 → 检出） | ✅ 属实（独立复现） |
| L32 structure 象限两态（6/6 齐→derived＋S3 维；缺→not_applicable） | `audit.ts:306` s3Complete 分支；**V-8 独立实跑复现 `structure=derived dimensions=["S3"]`**；86-check B2/C3/C4 正负对照双向验证 | ✅ 属实 |
| L32 `SEMANTIC_DOMAIN_LABELS` 常量块 | `upstream-dimension-map.ts:52-55` 实文两键：`structure:"structure/shape"`／`s3:"S3/budget-attribution"`；86-check A3 逐键互等＋C5 漂移正对照 | ✅ 属实 |
| L33 摘帽措辞在场（override_reason 载域标签） | `audit.ts:306` override_reason 载 `SEMANTIC_DOMAIN_LABELS.structure`；86-check B5 在场／B7 旧 D-054 queued 措辞退役 双断言绿 | ✅ 属实 |
| L34 谓词完备性呈用户审阅位（D-205④） | 报告 §1 T1-D 明列三断言最小集并指预声明载体 `predecl §4.1~4.5`，未自行定稿 | ✅ 属实（定稿权属用户，正确让渡） |

### 2.5 验收标准对照（报告 L38~L41）

| 声明 | 审计窗证据 | 结论 |
|---|---|---|
| 编译 `npm run build` OK＋check-dist 零 drift | **V-1／V-6 实测**；build 前后 dist/cli.js 同为 310334B | ✅ 属实 |
| 打包 `npm pack` OK | **V-2 实测** | ✅ 属实 |
| 启动测活 selftest ok＋doctor ok＋两 scale 实跑 exit 0 | **V-3／V-4／V-8 实测**（Macro-C 由审计窗独立发起） | ✅ 属实 |
| 守卫组 **65/65 allOk=true** | **V-7 实测逐字复现** `ran=65 green=65 … allOk=true` | ✅ 属实（独立复现） |
| 「平台矩阵＝engine-ci（ubuntu/macos/windows × node20/22）经 push 触发——push 为用户闸门未授权，CI 腿待推送后核」 | `.github/workflows/engine-ci.yml:17-18` 实文 `os: [ubuntu-latest, windows-latest, macos-latest]`、`:28` `node-version: ${{ matrix.node }}`、`:52` dist-drift job 按 os×node 分片。**矩阵声明属实**；CI 实跑腿确未触发（未 push，用户闸门） | ✅ 属实且**披露诚实**（未把本地绿伪装成 CI 绿） |

---

## §3 双轴评审（Standards ＋ Spec）

> 子代理派遣两次均返回 `Unauthorized`（Cline 鉴权失败），故双轴由审计窗**按同一规程自行执行**，证据标准不降。此为过程事实，登记备查。

### 3.1 Standards 轴（对照 AGENTS.md／决策账本 D-xxx／ADR-0013／ADR-0015）

**（a）硬违规核查——逐条以 git 元数据取证：**

| 标准 | 取证方式 | 读数 | 判定 |
|---|---|---|---|
| **D-140②** dist 产物禁搭车语义 commit | 逐 commit `git show --name-only | grep engine/dist/` | 仅 `tnu`(bundle) 与 `ytl`(bundle) 两件含 dist；`npm`(T1-A feat)／`rtu`(T1-D feat)／`yop`／`tml`／`qrs` **零 dist 文件** | ✅ **无违规** |
| **D-177** 探测面语义改必带预声明验证包 | commit 时序 | predecl `wto` 13:34:25 早于全部 feat/bundle | ✅ 满足 |
| **D-181** 勘误须变更前识别 | 时序 | `tnz` 13:46:46、`vnm` 15:08:47 均早于 `npm` 15:09:14；predecl §5.1 四条链式追加不改写原条目 | ✅ 满足 |
| **D-161④** 提交信息三栏位 | 逐 commit `%b` grep Ledger-Refs | 10/10 commit 均带 `Ledger-Refs:` trailer（如 npm=`D-204, D-058, D-177, D-181`） | ✅ 满足 |
| **D-129③** 棘轮抬限须显式裁定留痕 | `check-dist.mjs:13-17` | 抬限记录**三处留痕**：源码注释（实测 307,980B→新帽 385,000B＝×1.25）＋predecl 勘误四＋账本 R57 过程登记 | ✅ 满足 |
| **D-145①** engine 触碰→build＋check-dist 零 drift 前置 | 审计窗代验 | **V-6 实测零 drift** | ✅ 满足 |

**（b）基线坏味（judgement call，非硬违规）：**

- **Mysterious Name（弱）**：`upstream-dimension-map.ts:52` 键名 `s3` 与值 `S3/budget-attribution` 不同形。仓内 ADR-0024 已定「语义域标签＝消费位归属」且 86-check A3 互等断言锁死，改名成本大于收益。**建议不动**。
- **Duplicated Code（弱）**：`macro-c.ts` 与 `macro-b.ts` 共享 intake 探针形状（macro-c.ts:245 明注「与 Macro-B 同 probe」）。此为**显式声明的刻意同构**（kernel 边界 D-058 内确定性采集复用），且 D-108 禁换核重写 anchor 逻辑。**判定：可接受，非缺陷**。
- **Primitive Obsession（弱）**：`check-dist.mjs:15` `DIST_CLI_SIZE_CAP_BYTES = 385000` 裸数值。仓内已由「改本常量＝显式裁定」注释＋账本留痕机制对冲。**判定：机制已覆盖**。
- **测试质量**：`macro-c.test.mjs` 23 断言经实跑全绿且入 smoke 链，`audit.test.mjs` S2~S4/R12 随改已登记。**未发现恒真断言或同形反复**。

**Standards 轴小结：0 项硬违规，4 项弱 smell 均判定可接受。**

### 3.2 Spec 轴（对照 D-204/205/206/207/209＋BACKLOG #84~#87＋predecl 封闭清单）

**（a）MISSING／PARTIAL：** 无。#84 移植面＋重校准断言、#85 收窄措辞链、#86 认领注记、#87 三断言闸＋摘帽接入，四票要求项逐条有实物。

**（b）SCOPE CREEP——预声明封闭清单（§1）vs 实际 diff 比对：**

predecl §1 明列「不变面：48 存档 REAL 报告五件／38 存档工件／A-009 数字表」。审计窗逐项核验：**三者均未被改写**（48 存档 REAL 件 D-e4 维持；A-009 数字表原文在位）。**无越界。**

实际 diff 中未见于 predecl §1 逐条列举、但可由声明归因的文件：`guard-all-run.mjs`（执行器预算，见 P1-3）、`78-check.mjs`（C11 断言随 §8 抽取迁移 fact-write.ts——报告 L47 已如实登记「78-C11 D-094(b)」）、账本／BACKLOG／spec／CHANGELOG／next-round（收口记账面，票面义务内）。**均已披露，非隐式扩面**。

**（c）WRONG：** 无。逐条比对 D-206 负向行（supply-chain 维持 queued/not_applicable——**V-8 实跑复现 `not_applicable`**）、D-051 单指标禁孤立入维（opposing 成对闸 C3 正对照拒绝 5/6 面）、D-205④ 定稿权让渡（未自行定稿）。

**Spec 轴小结：0 MISSING／0 WRONG／SCOPE-CREEP 均已披露。**

---

## §4 P1/P2 发现（须处置——审计窗不代修）

### P1-1 ｜账本 census 计数错误（唯一裁定事实源事实性缺陷）

- **位置**：`.scratch/macro-audit/decision-ledger.md:1962` 与 `:2004`（R57 收口节「census 归因」行）；报告 `2026-10-03-r57-report.md:48` 同源错误。
- **声明**：「75a-census-register **400 条**（**+11** 新检出归因…；**−1** 悬空摘除 44-check\|multi-hit-probe\|ea0208c1）」。
- **审计窗实测**（对 base `f96936fa` 与 tip `75bcc4d` 双端 JSON 实物差分，非引用任何计数）：
  - base `entries` 键数 = **390**；tip `entries` 键数 = **401**。
  - ADDED = **12** 条：`48-check.mjs\|multi-hit-probe\|{f04ea2fd,38f8c051}`、`85-check.mjs\|existence-assert\|{9ac2d236,a87a1c4d,fafb96dd}`、`85-check.mjs\|multi-hit-probe\|{ea0208c1,b1b02316}`、`85-check.mjs\|unstripped-scan\|{975b1736}`、`86-check.mjs\|multi-hit-probe\|{c09ed050,03abf9b8}`、`86-check.mjs\|unstripped-scan\|{b70efef0}`、**`82-check.mjs\|multi-hit-probe\|99831f54`**。
  - REMOVED = **1** 条：`44-check.mjs\|multi-hit-probe\|ea0208c1`（与声明一致）。
  - 交叉验证：75a-check 实跑 `findings=401`，且 `75a-census-findings.json` 长度 = **401**。
- **结论**：**声明的「400 条」与「+11」两处均错**，实物为 **401 条 / +12 / −1**（390+12−1=401 自洽）。归因文字仅提「85/86 新守卫」两族，**遗漏 `48-check` 两族与 `82-check` 一族共 3 条**的归因说明（`82-check` 在报告全文出现 0 次）。
- **性质**：D-094① census 归因登记失准。账本是唯一裁定事实源，此为**可机核事实的错误陈述**，非叙事瑕疵。
- **附带**：交接文档 `r57-t1-exec-handoff.md:16` 写的是「census register **401** 条（**+12**/−1 归因）」——**交接文档是对的，报告与账本是错的**。即同一批次两份文书对同一数字不一致，且账本采了错值。

### P1-2 ｜R57 收口节在账本中重复落账两遍（结构性缺陷）

- **位置**：`decision-ledger.md:1940` 与 `:1982` **两处** 完全同名的 `## 第五十七轮执行批收口对账（R57 T1，2026-10-03）` 节，各含完整五子节（执行批四腿兑现／T1-C 认领注记／过程登记／执行窗登记闭合／分层定稿）。
- **审计窗实测**：
  - base `f96936fa`：R57 节标题计数 = **0**（本轮新建，合理）。
  - `yop`(T1-B) 之后：仍 = **0**（账本尚未动）。
  - **`tml`(r57-closeout) 之后：= 2**；`qrs` 之后仍 = **2**。
  - `git show tml -- .scratch/macro-audit/decision-ledger.md`：**+84 / −0** 行，其中 `^+## …R57` 标题行 **2 条**。
  - 两块内容逐行比对：**17 行差异**，全部为「A 块含 `guard-all-run 执行器预算常数上调`（TIMEOUT_MS 300→600s）而 B 块无此行」导致的位移——即 **B 块是 A 块去掉预算登记行后的近乎完整副本**。
- **结论**：收口节被**写入两次**，形成同一轮次两条平行收口节。因两块内容近乎相同且**都**含错误的「400 条/+11」，机器与人都难以一眼察觉；且下游任何按节标题定位的解析都会命中其一，造成**双份歧义**。
- **守卫盲区**：审计窗实测 65 件守卫全绿，**无一件能捕获此缺陷**——41a-check／84-check 对账本只做编号唯一性与指针形态断言，**无「节标题唯一性」断言**。这解释了为何 `guard-all-run` 报 `allOk=true` 却仍有 P1 缺陷在场。

### P1-3 ｜守卫执行器预算上调未进预声明封闭清单（披露链断点）

- **事实**：`guard-all-run.mjs` 的 `TIMEOUT_MS` 由 `300000` 改为 `600000`（diff 实证，含注释行改写）。该 commit 由 `tml` 携带。
- **登记状态**：**已**在 `decision-ledger.md:1964` 过程登记（原文含 rc=124 一例、压线态定性、「执行器运行预算非判据/断言语义（D-149④）／对照 D-177 探测面语义修——不适用」）。
- **缺口**：
  1. 该变更**不在 predecl §1 封闭清单**内（审计窗 `grep "guard-all\|78-check\|预算"` 于 predecl → **0 命中**）。报告 §2「过程事实与偏差」**完全未提及**此变更（`grep "600\|300\|预算\|rc=124"` 于报告 → **0 命中**）。
  2. 唯一披露载体是**交接文档**（`r57-t1-exec-handoff.md:15`：「执行器预算 300→600s…非判据变更，账本过账登记」）与**账本 A 块**。因 P1-2 的重复落账，**B 块无此登记行**——即「过账登记」实际只存在于将被合并掉的那一份里。
  3. D-177 适用性裁定（运维常数非探测面语义改）**论证成立**，本项不判违规；判为**披露链断点**：变更事实未进入面向验收的正式报告，导致审计者若只读报告＋账本会遗漏该变更。
- **风险提示**：85-check 在原 300s 预算下曾 rc=124 超时。抬限后 65/65 全绿。**该超时本身是否掩盖了 85-check 的真实耗时边界，审计窗无法从单次全绿读数证伪**——建议下轮在预声明中登记该守卫的预期耗时上界，作为后续预算再抬的比较基线。

### P2-1 ｜棘轮帽数值与 predecl 勘误四存在 675B 口径差

- predecl 勘误四（`predecl §5.1`）：「实测超限（**307,980B**，+18.1KiB）…抬至 385,000B（实测×1.25 惯例）」。
- 审计窗实测终值：**310,334B**（build 后复现）。
- 二者非矛盾（307,980B 为抬限当时实测、310,334B 为终值，差 2,354B 属后续 ytl 增补 S3 接线所致），但**账本 R57 过程登记直接引「实测终值 310,334B」而 predecl 仍留 307,980B**，两处数字并列易被误读为不一致。**建议**在勘误五（链式追加，不改写勘误四）中登记终态口径。

### P2-2 ｜registry `env-gated-guard-class` 标题计数未随 guards 同步

- `33-gate-registry.json` 该项 `guards` 数组实测 **12** 件（base 10 → tip 12，85/86 入列）。
- 但同项 `title` 仍写「**十件** env-contract tier（sibling 三件＋engine-deps 七件…）」——`3+7=10`，与数组 12 件**不符**。
- **机检状态**：75a-check T3 断言（声明集 ↔ registry guards 集对账）**实测 PASS**（decl 与 reg 均为同一 12 件），即**现有守卫只校验集合相等、不校验标题计数**，故此漂移长期不被捕获。
- 判定：**文档面陈述性缺陷**，非判据面缺陷。

---

## §5 过程违规呈报（单列——不替用户追认）

| # | 事项 | 审计窗判定 |
|---|---|---|
| G-1 | **子代理派遣失败**：双轴评审两次 `spawn_agent` 均返回 `Unauthorized`（Cline 鉴权），无法并行取证 | 审计窗按同一规程**自行执行双轴**，证据标准不降（全部落到 file:line / git 元数据 / 实跑读数）。**呈报**：本窗未使用子代理与 atomcode 并行取证，与任务书预期编排有差。 |
| G-2 | **`but commit` CHANGES 选择器静默回退全量**（报告 L45 已自述，五例实测） | 审计窗**无法独立复现**（需复演提交动作，且审计窗职责分离禁写 VC 面）。**采信报告自述并登记**：该工具事实若成立，则 R57 全部 10 commit 的文件收清单**均依赖事后 `but show` 人工核对**而非选择器保证。审计窗已用 `but show` 逐 commit 复核文件清单，**未发现残留误收**（dist 仅在两件 bundle commit；`.atomcode` 工件确认未进 HEAD：`git cat-file -e HEAD:…` → NOT_IN_HEAD）。 |
| G-3 | **`.atomcode/artifacts/` 两件处于 staged 未提交态** | `git status --porcelain` 显示 `A  .atomcode/artifacts/3fdbe1691749d90a`／`A  .atomcode/artifacts/560c767e95d42daf`（**已暂存**，非 untracked）。交接文档 L18 称「保持未跟踪原状」，**与实际 staged 态不符**（轻微）。建议下轮明确其归属：要么提交、要么 `git rm --cached` 退回真未跟踪。**审计窗不代为处置**（VC 写面属执行窗／用户闸门）。 |
| G-4 | **预声明与实现的行数微差**：报告称 macro-c.ts 460 行，实测 459 行 | 判定为**表述误差非缺陷**（`wc -l` 不计末行无换行）。登记备查。 |
| G-5 | **本审计窗自身零写入确认** | 审计窗全部动作只读（git show/log/diff、node 跑守卫、grep）；临时文件建于 OS temp 并已清理（`rm` 后 `ls` 复核无残留）；85/86 守卫的 mkdtemp 残渣面实测**无残留**（`85-recal-*`／`86-run-*` 均不存在）；收尾 `but diff` 仍仅显示 `.atomcode` 一件（审计前既有态），**审计窗未引入任何 drift**。 |

---

## §6 返工要求（打回原修复窗口——附修复要求与重跑清单）

**处置方式**：P1-1／P1-2／P2-1／P2-2 属记账与文书面修正，**建议打回 R57 收口窗口（原 owner）返工**；P1-3 需呈用户裁定是否补登记。**审计窗不代修**（职责分离）。

### 修复要求（R-01 ~ R-04）

- **R-01（对应 P1-1）**：将 `decision-ledger.md:1962` 与 `:2004` 及报告 L48 的 census 归因改为「**401 条（+12 / −1）**」，并补齐遗漏的 3 条归因说明（`48-check.mjs\|multi-hit-probe` 两族、`82-check.mjs\|multi-hit-probe\|99831f54`）。数字须与 `75a-census-findings.json` 长度（401）及 75a-check 实跑 `findings=401` 对齐。
- **R-02（对应 P1-2）**：删除 R57 收口节的**重复副本**，保留信息**超集**的一份——即保留含 `guard-all-run 执行器预算` 登记行的 A 块（若同时采纳 R-01 修正则更佳）。**链式纪律**：不改写历史轮次节，仅处理本轮 R57 节。
- **R-03（对应 P1-3）**：在报告 §2 过程事实节**补登**守卫执行器预算 300→600s 变更（含 rc=124 压线态与 D-149④ 适用性论证）；若 R-02 采纳，确认该登记行在**存留块**中在位。是否补入 predecl 勘误五请用户裁定（审计窗不自行决定预声明载体变更）。
- **R-04（对应 P2-1／P2-2）**：①predecl 追加**勘误五**（链式）登记棘轮终态口径 310,334B，说明与勘误四 307,980B 的时点差异；②`33-gate-registry.json` 的 `env-gated-guard-class` 标题「十件」改为「十二件」并同步 sibling/engine-deps 拆分计数。

### 返工后**必须重跑**的同一套验收（与本窗 §1 逐字一致）

```bash
cd /d/Aworker/6F/engine
npm run build && node scripts/check-dist.mjs     # V-1／V-6：零 drift
npm pack --dry-run                                # V-2
node dist/cli.js selftest                         # V-3
node dist/cli.js doctor                           # V-4
npm test                                          # V-5：期望 exit 0／379 PASS／0 FAIL
node dist/cli.js audit . --scale Macro-C --out <tmp>   # V-8：五工件＋structure=derived[S3]
cd /d/Aworker/6F
node .scratch/architecture-recovery/reports/85-check.mjs      # 期望 PASS 26/26
node .scratch/architecture-recovery/reports/86-check.mjs      # 期望 PASS 18/18
node .scratch/architecture-recovery/reports/75a-check.mjs      # 期望 findings=401／T3 PASS
node .scratch/architecture-recovery/reports/guard-all-run.mjs  # 期望 ran=65 green=65 allOk=true
```

**新增建议断言（防 P1-2 复发）**：在 41a-check 或 84-check 增设「账本 `## ` 级节标题唯一性」断言（同名节标题计数 >1 即红）。此为**本窗发现的守卫盲区**，是否立法请用户裁定——审计窗仅呈报，不自行扩守卫面。

---

## §7 复验基线（本窗实测读数——下窗对比锚）

| 锚 | 本窗实测值 |
|---|---|
| 守卫组 | `ran=65 green=65 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true` |
| 85-check | `PASS 26/26` |
| 86-check | `PASS 18/18`（A5／B7／C6 三项在报告外亦全绿） |
| 84-check | `PASS-COUNT 34 FAIL-COUNT 0` |
| npm test | exit 0／379 PASS／0 FAIL／23 套件／MACRO-C-TEST-OK 23/23 |
| dist/cli.js | `310334B`（cap 385000B，margin 74666B ≈ 72.9 KiB） |
| census register | `entries` = **401**（base 390；+12 / −1） |
| census findings | `401`（75a-check 实跑 `findings=401`） |
| 63-inventory | `guards` = **64**（base 62；新增 85-check／86-check）；`assertion_ids` 合计 = **1507**（base 1461） |
| registry env-gated | `guards` 数组 = **12**（base 10）；items 总数 = 78（未变） |
| 账本 R57 节标题数 | **2（重复——P1-2 待修）** |

---

## §8 审计窗边界声明

- 本窗**未 push／未 merge／未 amend／未修改任何被审文件**；全部 VC 观察为只读（`but status`／`but diff`／`but show`／`git show`／`git log`）。
- 本窗**未触碰**：push/merge（用户闸门）、atomcode 进程、B 轨官方目录、48/38 存档 REAL 工件、A-009 数字表。
- 本窗**未代用户追认**任何过程偏差；§5 各项按事实登记，处置权属用户。
- CI 平台矩阵腿**仍未验证**（需 push，属用户闸门）——本地全绿为自证位，**不得**据此宣称 CI 已绿。
