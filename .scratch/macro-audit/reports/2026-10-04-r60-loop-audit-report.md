# R60 LOOP 返修复验审计报告（第三轮审计——放行裁定）

- 窗口：2026-10-04 11:16~11:40；身份=**审计 Agent**（职责分离：只出报告，不动手修）。
- 被审对象：R59 审计打回后的返修三 commit——`llo`(`dbdc546356d6` 文书批)／`lvm`(`bfd978729897` 语义批)／`vpl`(`4e9eb35e28fd` 派生 bundle)。
- 被审声明源：`D:/Aworker/6F/.scratch/macro-audit/reports/2026-10-04-r59-loop-rework-report.md`＋`2026-10-04-r59-loop-fix-predecl.md`＋`C:/Users/Administrator/AppData/Local/Temp/r59-loop-rework-handoff.md`。
- 前轮报告：`2026-10-04-r59-loop-audit-report.md`（裁定 CONDITIONAL FAIL，列 A-1~A-7）。
- 方法：**不信自述**——逐项实物取证＋同套验收亲自重跑＋**独立确定性探针**。

---

## §0 结论

**放行（PASS）。**

A-1（P1，LOOP-1）与 A-2（P2，LOOP-2）**均经独立复验闭环**；LOOP-3 残渣根因**结构性消除并实测归零**。本次放行与前两轮的关键区别在于：**验收证据不再是单次侥幸读数**——85-check 经**独立三连跑 3/3 全绿**（修复前为 2/3 含一次 C1 红），且修复方式是**结构性消除 TOCTOU**（两侧同读冻结快照），而非降低判据或换语料。审计窗同时实测 anysearch-cli 活仓 HEAD 在窗口内**再次移动**（`b3c758e5`→`6dfe53c0`→**`e905785a`**），反证该缺陷的根因真实存在且修复方向正确。

**未发现新的 P1／P2 缺陷。** 仅存 1 项 P3 文书残留（见 §4），不影响判据面。

---

## §1 返修项逐条复核（对照前轮 §6 A-1/A-2）

### A-1（P1）85-check C1 语料竞态——**闭环（独立复验）**

| 取证项 | 审计窗实测 | 判定 |
|---|---|---|
| 修复机制落盘 | `85-check.mjs:72-77`：活仓 `rev-parse` 钉 `SRC_HEAD` → `git clone` 至 OS temp → `checkout SRC_HEAD` 生成冻结面 `AS_PIN`；`:77` `gitO` 全部改指 `AS_PIN`；engine 实跑 `:81 input: AS_PIN`；oracle 侧 `adrDirO`／`deferRegistryO` 同指 `AS_PIN` | ✅ |
| 新增 C0 不变式 | `:79` `t('C0 语料钉快照一致：clone HEAD＝＝钉取 SRC_HEAD')` | ✅ |
| **确定性探针（本窗独立执行）** | 连续三跑：**343s PASS 27/27 ／ 253s PASS 27/27 ／ 188s PASS 27/27 ⇒ passes=3 fails=0 of 3** | ✅ **修复前对照：passes=2 fails=1（C1 head_sha 漂移）** |
| 全基线复跑 | `ran=65 green=65 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true`；`GUARD-ALL-RESULT: PASS` | ✅ |
| 根因真实性反证 | 活仓 HEAD 窗口内三度读数：`b3c758e5` → `6dfe53c0` → **`e905785a`**（持续移动） | ✅ 竞态源真实存在 |
| LOOP-1 风险是否真正消除 | 判据为**结构性**（同进程不再触碰活仓两次），非概率性缓解 | ✅ |

**审计窗评语**：修复选择了审计建议中的**「钉快照」路径**（而非把 head_sha 差异降级为 WARN），保住了 ADR-0015 重校准的严格性；predecl §2 亦如实声明「本改造不削弱既有断言——C1 head_sha 对账在冻结面上仍由 engine 解 HEAD 与 oracle rev-parse 两侧独立产生」。**这是正确的修法**：降 WARN 会掩盖真实漂移，钉快照则从结构上使漂移不可能发生。

### A-2（P2）census 终态链式注记——**闭环**

| 取证项 | 审计窗实测 | 判定 |
|---|---|---|
| 账本 L1962 **原文未改写** | 实文仍为「401 条（+12…）」——**D-146⑤ 链式纪律正确执行** | ✅ |
| 账本 L1966 新增终态注记 | 「census 终态链式注记（R59 审计 LOOP-2／D-146⑤）：连锁后终态＝400 条（+11／−1）——上行 401(+12) 归因节内「82-check 一族」系删重前快照归因，该族已在连锁摘除…实物依据更新＝75a-census-findings.json 400 条」 | ✅ |
| 报告 L49 终态注记 | 同行尾部已追加〔终态注记（R59 审计 LOOP-2）…〕 | ✅ |
| 实物三方对齐 | `75a-census-register` entries=**400** ＝ `75a-census-findings` len=**400** ＝ 75a-check 实跑 `findings=400`（`PASS C1 400 findings ↔ register 400 条`＋`PASS C2 注册表零悬空条目`） | ✅ |

### LOOP-3（残渣面）——**结构性消除**

| 取证项 | 实测 | 判定 |
|---|---|---|
| `85-check.mjs` | `:12 import { tmpdir } from 'node:os'`；`:43 tmpB = mkdtempSync(join(tmpdir(),'85-run-'))`；`:70 tmpC = mkdtempSync(join(tmpdir(),'85-recal-'))` | ✅ |
| `86-check.mjs` | `:10 import { tmpdir }`；`:66 tmpB = mkdtempSync(join(tmpdir(),'86-run-'))` | ✅ |
| 残渣实测 | `reports/` 下 `85-recal-*`／`85-run-*`／`86-run-*` 目录数 = **0**（本窗跑完 85×3＋86＋全基线后） | ✅ **根消** |

（前轮 LOOP-3 曾实证 MCP 超时硬杀会在 `reports/` 留 `85-recal-*`；本轮因落点迁 OS temp，该类残渣不再落仓内。）

---

## §2 验收重跑（审计窗亲自执行）

| # | 项 | 实测读数 | 结论 |
|---|---|---|---|
| V-1 | `npm run build` | exit 0；`BUNDLE-OK dist/cli.js` | ✅ |
| V-2 | `npm pack --dry-run` | exit 0；**total files: 89** | ✅ |
| V-3 | `selftest` | exit 0；`ok=true` | ✅ |
| V-4 | `doctor` | exit 0；`overall=ok`；duckdb/bindings/git/upstream 四腿 ok | ✅ |
| V-5 | `npm test` | **exit 0／PASS=379／FAIL=0**（133s）；19 套件汇总行全绿（`MACRO-C-TEST-OK 23/23` 等） | ✅ |
| V-6 | `check-dist.mjs` | `DIST-RATCHET PASS: 310334B / cap 385000B（margin 74666B）` | ✅ |
| V-8 | `audit . --scale Macro-C` 独立实跑 | exit 0（218s）；`report_id=MA-AUDIT-6F-MACRO-C`；**五工件齐**；`structure=derived dims=["S3"]`；`supply_chain=not_applicable` | ✅ |
| G-85 | 85-check ×3 | **PASS 27/27 ×3**（343/253/188s） | ✅ |
| G-all | `guard-all-run.mjs` | **`ran=65 green=65 … allOk=true`**；`GUARD-ALL-RESULT: PASS` | ✅ |
| G-84 | 84-check | `PASS newFail=0 baselineWarn=5`（前窗伴生新红已清零） | ✅ |
| G-41a | 41a-check | `PASS 39/39` | ✅ |
| G-33 | 33-check | `PASS 33/33` | ✅ |
| G-75a | 75a-check | `PASS (16,0)`；`findings=400`；C1／C2 PASS | ✅ |
| G-86 | 86-check | 见全基线 GREEN | ✅ |

### 2.1 D-140② 生成物隔离（三 commit 逐件）

| commit | 性质 | 文件 | `engine/dist` | 判定 |
|---|---|---|---|---|
| `llo`/`dbdc546356d6`("docs(r59-loop-rework): R59 LOOP 返修文书批——A-2 census 终态链式注记双处落账+R59 返修预声明包先行（D-177）+R59 审计报告/交接随收编") | docs（文书批：D-177 predecl＋终态注记＋审计件收编） | 5 | 0 | ✅ |
| `lvm`/`bfd978729897`("fix(r59-loop-rework): R59 LOOP 返修——85-check C 组语料钉快照消 TOCTOU+mkdtemp 残渣面收口+执行器预算 900s+审计报告指针 canonicalize") | fix（语义：钉快照＋mkdtemp 迁移＋预算 900s＋指针 canonicalize） | 6 | **0** | ✅ |
| `vpl`/`4e9eb35e28fd`("bundle: 守卫跑伴生派生再基线——63-assertion-inventory(85-check 27→28 断言, 1508 emit 位)+75a-census-findings(lno 随行)随 R59 LOOP 返修(D-140②)") | bundle（派生再基线：63-inventory＋75a-findings） | 2 | 0 | ✅ |

**三 commit 均零 dist 搭车**；`vpl` 严格限于两件派生件。**D-140② 满足。**

### 2.2 D-177 预声明先行（时序取证）

- `llo`（文书批，含 predecl 包）**先于** `lvm`（语义/探测面改动）落盘 —— `but status` 栈序与 commit 父子关系一致。
- predecl 内容质量抽检：§1 封闭变更清单（四项，逐项列明）｜§2 新增断言**命中方向跑前声明**（C0＝红方向，常态＝绿）＋**负向声明**（不削弱既有断言，C1 仍两侧独立）＋clone 非 shallow 说明｜§3 census 增量**预期＝0** 预判＋避险项（bundle 体积常数字面量不复活 82-check 钉）｜§4 验收命令集。**符合 D-177／D-181 规程。**

---

## §3 伴生处置复核

| 项 | 声称 | 实测 | 判定 |
|---|---|---|---|
| 84-check 指针 canonicalize | 审计报告 L55-56 短 SHA 8 位→12 位＋verbatim subject，newFail 2→0 | `84-check PASS newFail=0 baselineWarn=5`；lvm 确含 `2026-10-04-r59-loop-audit-report.md` 改动 4 行 | ✅ |
| 63-inventory 再生 | C0 致 1507→1508 | `guards=64`；`assertion_ids` 合计=**1508**；`85-check` 条目=**28** | ✅ |
| 账本登记完整性 | — | L1967「LOOP 返修登记」载明 A-1／A-2／伴生处置／1507→1508／验收读数，**四要素齐备** | ✅ |

---

## §4 本窗观察（均非 P1／P2）

### OBS-1 ｜【P3】报告 L49 仍引「1507 emit 位」，实物为 1508

- `2026-10-03-r57-report.md:49` 段内「63-inventory 再生 64 守卫 **1507** emit 位」——C0 新增断言后实物为 **1508**。
- 该行**终态注记只覆盖 census 条数（400/+11/−1）**，未覆盖 emit 位计数。
- **缓解**：账本 L1967 已完整登记「63-assertion-inventory 再生 1507→1508 emit 位」，且报告 L49 属 D-146⑤ 保护下的历史行。
- **建议**：随下次触碰该报告时以链式注记补一行 emit 位终态；**不值得单开返修窗**。

### OBS-2 ｜【已证伪·非缺陷】63-inventory 断言计数与运行时 PASS 数差 1

- 本窗曾疑 `63-inventory` 记录 `85-check=28`／`86-check=19`，而运行时为 27／18，疑派生件多计。
- **取证后证伪**：`85-check.mjs`／`86-check.mjs` 中 `t(` 出现 28／19 次，其中各 1 次是 **`function t(name, ok, detail) {` 的定义处**（非断言调用）；剔除后真实断言数＝**27／18**，与运行时 PASS 数**完全一致**。
- 结论：**派生件计数自洽，无缺陷**。登记于此以免后续审计窗重复误判。

---

## §5 过程事实呈报（不替用户追认）

| # | 事项 | 判定 |
|---|---|---|
| G-1 | 子代理派遣仍不可用（`spawn_agent` 鉴权失败，前轮已载）；本窗继续以沙箱自跑取证 | 已登记 |
| G-2 | `but show vpl` 失败（`Could not open worktree file for reading`）；已用 `git show 4e9eb35e28fd`／`but status` 完成同等取证 | 工具面，非仓缺陷 |
| G-3 | 裸 `git status` 的 `??`（macro-c.ts／85-check.mjs 等）仍为 GitButler 虚拟分支基线噪声；判据以 `but diff` 为准 | 无变化 |
| G-4 | 本窗探针改用 `Start-Process` 后台化（规避 context-mode MCP 600s 硬上限），**未再产生残渣**；收尾 `but diff` 仅 `.atomcode` 一件（与审计前一致） | 零 drift |
| G-5 | `.atomcode/artifacts/` 两件仍 staged；`.scratch/tmp-aud.txt` 仍未跟踪（`git status`＝`??`／`but status` ＝ `A`）；两者本窗**均未处置**（属用户裁定面 A-5／A-6） | 待裁 |

---

## §6 仍待用户裁定（前轮 A-3~A-7 延续；A-1／A-2 已闭环）

| # | 事项 | 本窗状态 |
|---|---|---|
| ~~A-1~~ | 85-check C1 竞态 | ✅ **已闭环并独立复验** |
| ~~A-2~~ | census 终态链式追加 | ✅ **已闭环并独立复验** |
| **A-3** | 「账本节标题唯一性」守卫立法 | **仍未落**（前两轮建议落 41a-check／84-check） |
| **A-4** | 300→600s 是否补勘误六 | **已被事实取代**：现行为 300→**900s**，且已由 R59 predecl §1.4 覆盖并登记账本 L1967。**原 A-4 问题自然消解**，仅需确认 predecl 链式记录是否需补记 600s 这一中间态 |
| **A-5** | `.scratch/tmp-aud.txt` 删留 | **仍未处置**（审计窗三轮取证结论不变：内容为单套件 `audit.test.mjs` stdout 捕获，全仓 `git grep tmp-aud`＝**NONE**，与任何已知 `npm test` 捕获形态不符；建议删） |
| **A-6** | `.atomcode` 两件 staged 归属 | **仍未处置** |
| **A-7** | push／CI 矩阵腿 | **仍为用户闸门**——本地全绿不得据此宣称 CI 已绿 |

---

## §7 本窗复验基线（供下窗对比）

| 锚 | 本窗实测 | 稳定性 |
|---|---|---|
| 守卫组基线 | **`ran=65 green=65 allOk=true`** | ✅ **本轮可信**——由 85-check 3/3 确定性连绿＋结构性修复支撑，非单次侥幸 |
| 85-check | **3/3 PASS 27/27**（343/253/188s） | ✅ 确定性达成（修复前 2/3，1 次 C1 红） |
| 86-check | PASS（18 断言，全基线 GREEN） | ✅ |
| 84-check | `newFail=0`（34 断言） | ✅ |
| 41a-check | `39/39` | ✅ |
| 33-check | `33/33` | ✅ |
| 75a-check | `findings=400`；C1／C2 PASS | ✅ |
| npm test | exit 0／**379 PASS／0 FAIL**（19 套件） | ✅ |
| `dist/cli.js` | **310334B**（cap 385000B，margin 74666B） | ✅ 确定性构建 |
| census | register **400** ＝ findings **400** ＝ live **400**；base 390；**+11／−1** | ✅ 三方对齐 |
| 63-inventory | `guards=64`；`assertion_ids` 合计 **1508** | ✅ |
| 账本 R57 节标题数 | **1** | ✅ |
| `reports/` 守卫残渣目录数 | **0** | ✅ LOOP-3 根消 |
| 执行器预算 | `TIMEOUT_MS=900000`（实测峰值 521s／修复后实测 343s，占用率 38%） | ✅ 余量充裕 |
| Macro-C 独立实跑 | exit 0／五工件／`structure=derived[S3]`／`supply_chain=not_applicable` | ✅ |

---

## §8 审计窗边界声明

- 本窗**未 push／未 merge／未 amend／未修改任何被审文件**；VC 观察全只读。
- 本窗**未代用户追认**任何过程偏差；§5 各项按事实登记。
- 本窗**未触碰**：48/38 存档 REAL 工件、A-009 数字表、B 轨官方目录、atomcode 进程。
- CI 平台矩阵腿**仍未验证**（需 push，用户闸门）。
