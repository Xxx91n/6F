# R57 LOOP 返修复验审计报告（第二轮审计——审计窗随读批）

- 窗口：2026-10-04；身份=**审计 Agent**（职责分离：只出报告，不动手修）。
- 被审对象：`r57-t1-exec` 分支返修两 commit——语义 `vov`(`0d245068fd85…`)／bundle `mlq`(`29bc05e2efc9…`)，叠加于 R57 十 commit 之上。
- 被审声明源：`D:/Aworker/6F/.scratch/macro-audit/reports/2026-10-03-r57-rework-report.md`＋`C:/Users/Administrator/AppData/Local/Temp/r57-loop-rework-handoff.md`。
- 前轮报告（本窗据此复验）：`D:/Aworker/6F/.scratch/macro-audit/reports/2026-10-03-r58-audit-report.md` §4 五项缺陷／§6 返工要求 R-01~R-04。
- 方法：同前轮——**不信自述**，逐项实物取证＋同套验收亲自重跑。

---

## §0 结论

**R-01~R-04 四项返修要求全部落实并经实物验证（4/4 ✅）**，前轮 P1-2／P1-3／P2-1／P2-2 已闭环。**但本窗查出一项新的 P1 级缺陷：守卫 `85-check` C1 断言非确定性——「守卫组 65/65 allOk=true」不可复现。** 前轮与返修窗均以**单次**全绿读数作为验收证据，该证据经本窗多次复跑证伪。

**裁定：不予放行（CONDITIONAL FAIL）。** 功能票闭环与返修闭环均成立，但**验收证据链的核心锚（65/65 基线）不可靠**，须处置 85-check C1 的语料竞态后方可视为终态。

---

## §1 返修项逐条复核（对照前轮 §6 R-01~R-04）

| 项 | 前轮缺陷 | 返修声称 | 审计窗实测证据 | 判定 |
|---|---|---|---|---|
| **R-02** | P1-2 账本 R57 收口节重复落账两遍 | 节标题 2→1，保含预算登记行的 A 块 | `grep -c "^## .*第五十七轮执行批收口"` = **1**（唯一命中 L1940）；账本总行 2023→**1981**；EOF 以「分层定稿」节自然收尾 | ✅ **闭环** |
| **R-03** | P1-3 守卫预算 300→600s 披露链断裂 | 报告 §2 补登 | `2026-10-03-r57-report.md:48` 实文在案：「守卫执行器预算上调（R58 审计 P1-3 补登——原漏登本节）：guard-all-run.mjs 执行器预算 TIMEOUT_MS 300→600s…rc=124…D-149④」；账本 L1964 登记行在存留块内 | ✅ **闭环** |
| **R-04①** | P2-1 棘轮口径差（307,980B vs 310,334B） | predecl 链式追加勘误五 | predecl 尾部实文「勘误五（轻档·口径对账——发现时点 **post-hoc**…；变更 commit 指针=10252bc093e7…）」；84-check 指针纪律机检 34/34 PASS | ✅ **闭环** |
| **R-04②** | P2-2 registry 标题计数漂移 | 十件→十二件 | `guards_len=12`；title 实文「十二件 env-contract tier（sibling 三件＋engine-deps 九件…）」；33-check **PASS 33/33**；75a-T3 声明集↔registry 对账 PASS | ✅ **闭环** |
| **R-01** | P1-1 census 计数错（400/+11 → 实为 401/+12） | 勘正为 401(+12/−1) 并补齐归因 | 归因文字确已补齐（48-check 两族＋82-check 一族）；**但连锁后终态已变 400，见 §3 LOOP-2** | ⚠ **部分闭环**（见 §3） |

**连带正确处置（值得肯定）**：R-02 删重使 bundle 体积常数字面在账本命中 2→1，多命中态消失→`82-check|multi-hit-probe|99831f54` 转悬空，返修窗**依 D-094① 摘除并归因**，且按 **D-146⑤ 链式纪律**在账本 L1965「LOOP 返修登记」行**追加**终态（`register 401→400（终态，与 75a-check 实跑 findings=400 对齐）`）而**非改写** L1962 原条目——此处置正确。

---

## §2 验收重跑（审计窗亲自执行——与前轮 §1／§6 同一套命令）

| # | 项 | 实测读数 | 结论 |
|---|---|---|---|
| V-1 | `npm run build` | exit 0；`BUNDLE-OK dist/cli.js` | ✅ |
| V-2 | `npm pack --dry-run` | `macro-audit-0.1.0.tgz`；**total files: 89** | ✅ |
| V-3 | `node dist/cli.js selftest` | exit 0；`ok=true` | ✅ |
| V-4 | `node dist/cli.js doctor` | exit 0；`overall=ok`；duckdb/bindings/git/upstream 四腿 ok | ✅ |
| V-5 | `npm test` | **exit 0／PASS=379／FAIL=0** | ✅ |
| V-6 | `check-dist.mjs`（build 后） | `DIST-RATCHET PASS: 310334B / cap 385000B` | ✅ |
| V-8 | `audit . --scale Macro-C`（独立实跑） | exit 0；`report_id=MA-AUDIT-6F-MACRO-C`；五工件齐；`structure=derived dims=["S3"]`；`supply_chain=not_applicable` | ✅ |
| G-86 | 86-check | **PASS 18/18** | ✅ |
| G-84 | 84-check | PASS（34 断言，newFail=0） | ✅ |
| G-33 | 33-check | **PASS 33/33** | ✅ |
| G-75a | 75a-check | `PASS C1（400 findings ↔ register 400 条）`＋`PASS C2 注册表零悬空条目`；`findings=400` | ✅ |
| **G-85** | 85-check | **不稳定——见 §3 LOOP-1** | ❌ |
| **G-all** | `guard-all-run.mjs` | **`ran=65 green=64 red=1 allOk=false`；`GUARD-ALL-RESULT: FAIL`**；红件＝`85-check.mjs rc=1 slugs=C1` | ❌ |

### 2.1 D-140② 生成物隔离（返修两 commit 逐件核验）

| commit | 性质 | 文件数 | `engine/dist` 件数 | 判定 |
|---|---|---|---|---|
| `vov` (`0d245068`) | 语义（docs(r57-loop-rework)） | 9 | **0** | ✅ 未搭车 |
| `mlq` (`29bc05e2`) | bundle（守卫跑伴生派生再基线） | 1（仅 `75a-census-findings.json`） | 0 | ✅ 独立 |

`vov` 携带 `Ledger-Refs: D-094, D-181, D-149`／`Chronicle: M-056`／`Adrs: —` 三栏位齐备（D-161④）。`mlq` 主体标注 `(D-140②)`。**D-140② 满足。**

---

## §3 本窗新发现

### LOOP-1 ｜【P1】85-check C1 非确定性——「65/65 allOk=true」不可复现

**这是本窗最重要的发现，且前两窗均未披露。**

**证据一：独立探针（连续三次单跑 85-check）**

| 次序 | 耗时 | 结果 |
|---|---|---|
| run#1 | 393s | `PASS 26/26` |
| run#2 | 521s | **`FAIL 1/26`** |
| run#3 | 286s | `PASS 26/26` |
| **合计** | — | **passes=2 / fails=1（3 次中 1 次红，失败率 ≈ 33%）** |

**证据二：全基线复跑（本窗实测 `guard-all-run.mjs`）**

```
RED 85-check.mjs rc=1 slugs=C1
FAIL 册外新红（须 D-094 三分类：修真坏/改断言/入册带锚）: 85-check.mjs
ran=65 green=64 skipped=0 group-skipped=0 red=1 registered=0 problems=1 allOk=false
GUARD-ALL-RESULT: FAIL
```

**根因（已定位，非推测）**：失败断言 C1 的失败详情为——

```
FAIL C1 编排层对账：head/commit_count/adr_count/date_resolvable/lag/leg_dist 全等
     :: diff=head_sha oracle={"a":98,"l":98} run={"a":98,"l":98}
```

`a`（ADR 数）与 `l`（lag）**两侧全等**，唯一不等字段是 **`head_sha`**。即：85-check 的 C 组差分对账在同一进程内先后读取 anysearch-cli 语料仓两次（编排层独立重算 vs engine 实跑），**期间该仓 HEAD 发生移动**，导致 head_sha 快照不一致。审计窗实测该仓当前 HEAD=`b3c758e5`（最近提交 2026-10-03 21:41），而 predecl §2.1 记录的历史读数为 `9a0fa28a`——**语料确为活语料且确在移动**。

**关键限定（防止夸大）**：在失败的那次运行中，**C2（supersede 链十计数全等）、C3（chainFact fact_id 全等）、C4（band 对账）均 PASS**。因此——

- ✅ **移植保真性结论不受影响**（值级/链级/band 级对账全部成立）；
- ❌ **但「85-check PASS 26/26」作为一条验收断言是 unreliable 的**。

**影响面**：前轮 R57 执行窗与本轮返修窗**均以单次 `85-check 26/26` ＋ `guard-all 65/65 allOk=true` 作为验收闭环证据**。该证据经本窗两次独立复跑证伪（探针 1/3 红；全基线 1/65 红）。前轮报告 §7 将「`ran=65 green=65 allOk=true`」列为下窗对比锚——**该锚本身不稳定**，本窗据此自我更正（见 §5 自更正）。

**旁证——与 P1-3 的关联（本窗实测耗时）**：85-check 单跑耗时 **286s / 393s / 521s**；原执行器预算 300s 确实不足（返修窗抬至 600s 的判断**成立**），但 521s 已是 600s 上限的 87%。若 CI 机器负载更高，**仍可能触发 rc=124**。前轮 §4 P1-3 提出的「建议登记该守卫预期耗时上界作为预算再抬的比较基线」——本窗以实测数据回应：**上界应设为 ≥ 900s，或改为按负载自适应**。

**建议处置（呈用户裁定，审计窗不代决）**：
1. 85-check C1 改为**钉住一次读取的 head_sha** 并在两侧复用同一快照（消除 TOCTOU），或对 head_sha 差异**降级为 WARN**（因其不承载移植保真语义——ADR 数/commit 数/band 仍全等）；
2. 任何引用「85-check 全绿／65/65 基线」的文书，须标注**单次读数、不可复现**，不得作为终态锚；
3. 85-check 耗时上界登记入 predecl（承前轮 P1-3 建议，本窗提供实测基线）。

### LOOP-2 ｜【P2】census 终态数值在主归因行与报告 L49 已过期

- **实物终态**（审计窗双端差分）：base `entries`=**390** → 终态 `entries`=**400**；ADDED=**11**；REMOVED=**1**（`44-check.mjs|multi-hit-probe|ea0208c1`）。三方对齐成立：register **400** ↔ `75a-census-findings.json` **400** ↔ 75a-check 实跑 `findings=400`。
- **仍存旧值处**：账本 **L1962** 主 census 归因行写「**401 条（+12）**」并仍将「82-check 一族」列为新检出；`2026-10-03-r57-report.md:49` 同。**该 82-check 条目已在连锁中作为悬空被摘除，不再存在于终态增量内**；终态正确表述应为「**400 条（+11／−1）**」，82-check 一族须改述为「原 +12 内、因子块删重致多命中态消失而悬空摘除」。
- **为何不判 P1**：终态 400 已在账本 L1965「LOOP 返修登记」行**如实追加**，且按 **D-146⑤ 链式纪律不得改写** L1962 原条目——处置方式正确。缺陷性质是**主归因行内的过时证据引用**（L1962 的〔勘正〕注仍以「findings.json 长 401＋findings=401」为实物依据，而该实物现为 400），非状态源错误。
- **建议**（链式，不改写）：在 census 归因行**再追加**一条终态注记，载「连锁后终态＝400（+11／−1），82-check 一族已摘除」并更新实物依据为 400。

### LOOP-3 ｜【P3·自披露】本审计窗自身产生的残渣（已清理）

- 本窗探针受 context-mode MCP **600s 硬上限**约束，被超时杀死的 85-check 进程在 `reports/` 下留下 `85-recal-hA78Fj/`（创建时间 00:01:36）。
- **审计窗已检出并删除**（`Remove-Item -Recurse -Force`），收尾实测 `85-recal-*`／`86-run-*` 目录数 = **0**。
- 此即前轮交接所载「85/86 守卫 mkdtemp 落在 `reports/` 下，硬杀进程会留残渣」隐患的**实证复现**——建议迁 OS temp（T3 候选，原已登记）。

### LOOP-4 ｜【呈报】`.scratch/tmp-aud.txt` 溯源——**既不确认也不否认返修窗的归属判断**

返修窗将该文件标注为「审计窗 17:17 的 git 警告捕获件，与其 G-5『零残留』声明不符」。审计窗**亲自取证**如下：

| 取证项 | 读数 |
|---|---|
| mtime | `2026-10-03 17:17:46.539538900 +0800`（落在前轮审计窗区间内） |
| git 状态 | `??` untracked，**未被任何 commit 收编** |
| 仓库代码引用 | **全仓 `grep -rn "tmp-aud"`＝0 命中**（含 engine/、.scratch/、scripts/） |
| 内容构成 | 27 条 `PASS`，断言族仅 **D/E/J/M/N/R/S**——即 **`audit.test.mjs` 单套件**；另含 git CRLF 警告，涉及 `CONTEXT.md`／`package.json`／`docs/adr/001-decision.md` |
| 关键对照 | `audit.test.mjs:24-27` 正是**在自身 fixture 仓内**创建 `CONTEXT.md`／`package.json`／`docs/adr/001-decision.md` 三文件；`:19` 用 `mkdtempSync(join(tmpdir(),...))` 落 **OS temp**；`:97` `rmSync` 自清 |
| 前轮审计窗实际测试调用 | `npm test > /tmp/6f-audit-test.log 2>&1`＝**23 套件／379 PASS** 全量捕获，落 `/tmp` 且已删 |

**审计窗结论**：该文件是**单套件 `node test/audit.test.mjs` 的 stdout 重定向捕获**，其内容形态（单套件／27 PASS）与前轮审计窗的 `npm test` 捕获（23 套件／379 PASS，落 `/tmp`）**不匹配**；且**无任何仓库代码**会产生该路径。因此**内容证据不支持将其归因于前轮审计窗的测试调用**。但其 mtime 确落在前轮窗口区间内，审计窗**无法以现有物证排他性否定**，故**不作认领、亦不指控**，交用户裁定删留。

**对前轮 G-5 的澄清（非撤回）**：前轮 G-5 的字面范围是「**本审计窗所建**临时文件（落于 OS temp）已清理」——该范围内属实且已复核（`/tmp` 侧文件确已删）。本窗**主动披露**上述时间重叠，不回避。

---

## §4 过程事实呈报（不替用户追认）

| # | 事项 | 判定 |
|---|---|---|
| G-1 | 子代理派遣：前轮两次 `Unauthorized`；**本窗未再尝试**（已知该能力不可用），改用沙箱自跑双轴/多路取证 | 已登记 |
| G-2 | `but show vov/mlq` 本窗**失败**（`Could not open worktree file for reading`，GitButler worktree 锁）；已改用 `git show <SHA>` 完成同等取证 | 工具面，非仓缺陷 |
| G-3 | 裸 `git status` 仍把 GitButler 虚拟分支内容显示为 `??`（macro-c.ts／85-check.mjs 等）——**前轮已判明为虚拟分支基线 ref 噪声**，判据仍以 `but diff` 为准 | 无变化 |
| G-4 | `.atomcode/artifacts/` 两件仍 `A`（staged）未处置 | 与前轮 G-3 同项，仍待用户裁定 |
| G-5 | 本窗 LOOP-3 残渣已自清理；收尾 `but diff` 仅 `.atomcode` 一件（与审计前一致） | 零 drift |

---

## §5 对前轮报告的自我更正

前轮（`2026-10-03-r58-audit-report.md`）§7「复验基线」将 `ran=65 green=65 allOk=true` 与 `85-check PASS 26/26` 列为下窗对比锚。该二锚系**单次读数**，本窗已证其**不可复现**（§3 LOOP-1）。

**更正**：前轮 §7 两行应读作「**单次读数，非稳定基线**」。前轮 §1 V-7／V-8 的结论（当次执行属实）**不变**；但凡将其外推为「守卫组基线稳定成立」的推论，**本窗撤回**。前轮 §4 P1-3 提出的「85-check 耗时上界须登记」之风险提示，**本窗以实测数据证实**（286s／393s／521s）。

---

## §6 处置建议（呈用户裁定——审计窗不代修）

| # | 事项 | 建议 | 归属 |
|---|---|---|---|
| **A-1** | 85-check C1 语料竞态（LOOP-1，P1） | 钉快照复用／或 head_sha 差异降 WARN；耗时上界登记 ≥900s | 执行窗（新建票） |
| **A-2** | census 终态数值过期（LOOP-2，P2） | 链式追加终态注记（不改写 L1962） | 记账窗 |
| **A-3** | 「账本节标题唯一性」守卫（前轮建议，未落） | 落 41a-check 或 84-check | 待用户裁 |
| **A-4** | P1-3 是否再以勘误六补入 predecl | 返修窗已补报告 §2；predecl 侧待裁 | 待用户裁 |
| **A-5** | `.scratch/tmp-aud.txt` 删留（LOOP-4） | 建议删（untracked 残渣、内容为已过期的单套件测试输出）；**审计窗不代删** | 待用户裁 |
| **A-6** | `.atomcode` 两件 staged 归属 | 提交或 `git rm --cached` | 待用户裁 |
| **A-7** | push／CI 矩阵腿 | 用户授权后 `but push r57-t1-exec` 触发 engine-ci | 用户闸门 |

---

## §7 本窗复验基线（供下窗对比——含稳定性标注）

| 锚 | 本窗实测 | 稳定性 |
|---|---|---|
| 守卫组基线 | **`ran=65 green=64 red=1 allOk=false`**（红＝85-check C1） | ❌ **不稳定**；前两窗所记 65/65 系单次绿 |
| 85-check | 探针 3 次：**2 PASS(393s/286s) ＋ 1 FAIL(521s)** | ❌ **不稳定**，失败率 ≈ 1/3 |
| 86-check | `PASS 18/18` | ✅ 稳定（本窗＋前轮双绿） |
| 84-check | PASS（34 断言） | ✅ |
| 33-check | `PASS 33/33` | ✅ |
| 75a-check | `findings=400`；C1／C2 PASS | ✅ |
| npm test | exit 0／**379 PASS／0 FAIL** | ✅ |
| `dist/cli.js` | **310334B**（cap 385000B，margin 74666B） | ✅ 确定性构建 |
| census | register **400** ＝ findings **400** ＝ live **400**；base 390；**+11／−1** | ✅ 三方对齐 |
| 账本 R57 节标题数 | **1**（前轮为 2） | ✅ |
| registry env-gated | `guards=12`／标题「十二件」 | ✅ |
| Macro-C 独立实跑 | exit 0／五工件／`structure=derived[S3]`／`supply_chain=not_applicable` | ✅ |

---

## §8 审计窗边界声明

- 本窗**未 push／未 merge／未 amend／未修改任何被审文件**；VC 观察全为只读（`but status`／`but diff`／`git show`）。
- 本窗**未代用户追认**任何过程偏差；§4 各项按事实登记。
- 本窗**未触碰**：48/38 存档 REAL 工件、A-009 数字表、B 轨官方目录、atomcode 进程。
- CI 平台矩阵腿**仍未验证**（需 push，用户闸门）——本地读数不得据此宣称 CI 已绿。
