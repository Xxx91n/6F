# R64 T1 审计窗报告——R63 执行批验收层 LOOP 复验（2026-10-05）

> 身份=**审计 Agent**（职责分离：只出报告，不动手修）；任务书=`.scratch/macro-audit/handoffs/next-round.md`（R64 换代，T1 位）。
> 被审对象=`.scratch/macro-audit/reports/2026-10-05-r63-report.md`（R63 T1 执行批自述）＋其 9 个 commit（`0a9fe25d..41f9d95a`）。
> 审计基线=不信自述，全部亲自重跑；双轴评审（Standards＋Spec）按 `code-review` skill 走子代理并本人复核取证。

## ① 结论摘要

**审计结论：❌ 不通过（打回原修复窗口返工）。**

R63 执行批的**语义实现基本扎实**——三票主断言全部实物复现，编译/打包/测活/测试/全量守卫/鲜克隆复读六项硬验收全绿，独立 mutation-kill 4/4 击杀成功。但存在 **1 项 P0 阻断缺陷**（我亲自复现，非转述）：**#88 新增的 CI 步骤在其自身的 CI 克隆形态下必然长红**，即票面「CI 射程缺口勘误」的修复本身是 born-red。另 **1 项 P1 记账矛盾**（验收判据同时被记为「欠账」与「已闭环」）。

按职责分离：**审计窗口只出报告**。下文 findings 均附修复要求与重跑清单，等你裁定修法或授权打回。

## ② 硬验收重跑（第 1 条：亲自跑，不采信自述）

| 验收项 | 命令 | 实测 | 结论 |
|---|---|---|---|
| 编译 | `npm run build`（tsc＋esbuild） | `BUNDLE-OK dist/cli.js`，exit 0，tsc 0 error | ✅ |
| 打包体积 | `node scripts/check-dist.mjs` | `DIST-RATCHET PASS: 373105B / cap 385000B（margin 11895B ≈ 11.6 KiB）` | ✅ 与自述一致 |
| 测活 | `node dist/cli.js selftest` | `ok=true`，5 项检查全 pass | ✅ |
| dist 零 drift | 6 件 dist 逐字节 sha256 对 HEAD | **6/6 MATCH**（含 `micro-a.js` 45228B／`micro-a.d.ts` 5237B） | ✅ 无 drift |
| 测试闭环 | 12 套件逐个跑 | 全 exit 0：SMOKE 6/6／COLLECTORS 14/14／ADAPTER 7/7／BATCH1 41/41／MICRO-B-EMIT 18/18／LLM 25/25／REPORT-PREVIEW 5/5／MACRO-C 23/23／**MICRO-A 22/22**／UPSTREAM-MAP 21/21／DEMO 38/38／ZERO-WRITE 4/4 | ✅ |
| 全量守卫 | `guard-all-run.mjs`（本机） | `ran=65 green=65 red=0 problems=0 allOk=true` | ✅ |
| 鲜克隆复读 | 独立 `--no-local` 全克隆＋`npm ci`＋guard-all | `ran=65 green=65 red=0`，唯一 group-skip `40-check.mjs:B`（`env-missing:asset:40-clone-cache`，带 reason） | ✅ 确认自述的复读读数属实 |
| 84-check 鲜克隆 | 同上克隆内单跑 | `PASS-COUNT 34 FAIL-COUNT 0`／`GUARD-RESULT: PASS newFail=0` | ✅ |
| 派生件再基线 | 63-inventory 1523 emit 位／75a findings 403 | 机核 `TOTAL assertion_ids = 1523`、`findings = 403` | ✅ 与自述逐位一致 |

**硬验收通过。** 报告自述的所有读数我逐条复现，无一处虚报。

## ③「声明 → 证据 → 结论」对照表（15 项完成定义逐项机核）

| # | 声明（报告①） | 证据（我的实测） | 结论 |
|---|---|---|---|
## ④ 独立 mutation-kill 复验（审计窗本职——防 immortal test）

我从 `41a-check.mjs` 原样抽出 `headingViolations()`，对**真实账本**注入变异，第二人复核 H1/H2/H5/H6：

| 变异 | 期望 | 实测 | 判定 |
|---|---|---|---|
| 基线：双账本原样 | 绿 | `dupsH2=0 dupsH3=0`（两账本皆） | ✅ |
| 同父 `###` 重复 | 红 | `dupsH3=1` | ✅ **击杀成功，H2 非空断言** |
| 全局 `##` 重复 | 红 | `dupsH2=1` | ✅ **击杀成功，H1 非空断言** |
| 跨父 `###` 同字面 | 绿 | `dupsH3=0` | ✅ H5 边界成立 |
| 围栏内伪 `##` | 绿 | `dupsH2=0` | ✅ H6 围栏跳过成立 |

**#89 的守卫是真断言，不是 immortal test。** 双子代理之一曾怀疑 H2 在 `architecture-recovery` 账本上空转（该账本仅 1 个 `###`）——经我实测该疑虑不成立：断言逻辑对两个账本**共用同一函数**，macro-audit 账本 64×`##`/116×`###` 提供充足判别力，H1/H2 组合非空。

## ⑤ Findings

### P0-1（阻断）｜#88 的 CI 射程修复是 born-red：84-check 在 CI 自身克隆形态下必红

**声明**：报告①#9「engine-ci.yml portable 守卫段（84-check 入列起步）」✅；BACKLOG #88「验收判据=fresh clone 全绿」✅ 已闭环。
**证据**（我亲自复现，非转述）：

```
$ git clone --no-local --depth 1 file:///D:/Aworker/6F /tmp/sh     # 正是 actions/checkout@v4 默认形态
$ git cat-file -e cb625c64521398306f914eb7986a4a505f95291a
-> 该对象在浅克隆中不存在

$ node .scratch/architecture-recovery/reports/84-check.mjs
FAIL PV-B-STRICT-ACTIVE :: 合法形行探针 kind=nonexistent-sha
FAIL PV-C-LEGAL-FORM :: legal 指针 0 件逐件断…违例 0
FAIL PV-D-ZERO-NEW-FAIL :: 册外 FAIL 72 件（须零）
FAIL PV-NONEXISTENT-SHA :: fe3271d8…（72 件级联）
PASS-COUNT 28 FAIL-COUNT 6
GUARD-RESULT: 84-check FAIL newFail=72          exit=1
```

对照组，排除环境干扰：
- **同一浅克隆内，既有 CI 步骤 78-check = `78CHECK 42/42` PASS** → 浅克隆本身不是变量。
- **同一提交**（41f9d95a 与 workspace HEAD 的 84-check.mjs 逐字节相同）→ 不是版本漂移。
- **全克隆同命令 = 34/34 PASS** → 唯一变量是克隆深度。

**根因**：`84-check.mjs:413` 仍硬钉历史对象 `const SHA1 = 'cb625c64521398306f914eb7986a4a505f95291a'`，`:414` 用 `git log -1 --format=%s SHA1` 取 subject。R63 的 fixture 自足修（`:485-502`）只覆盖了 `F01~F20` 的 `SHA_OK/SHA_TWIN`，**没有覆盖 `mainRun()` 里 B/C 面断言所依赖的这枚历史对象**。该对象位于历史深处，浅克隆取不到 → subject 空 → 探针退化为 `nonexistent-sha` → 连带 72 个「合法指针」全量扫描判 `cat-file -e` 失败。

**这正是 R63 报告 ③ lessons 第 1 条自己写的那个坑**（「断言面合法演化清查须覆盖非本票字面载体钉…按字面 grep 清查漏网」）——报告正确地把它抽象成了 lesson，但**没有回头检查自己这次的 CI 修复是否踩了同一个坑**。报告 §② 欠账三要素也没有这一项。

**加重情节：本仓已有正确先例，新步骤未照做。**

```yaml
# golden-ci.yml:41-42
- uses: actions/checkout@v4
  with:
    fetch-depth: 0 # bundle 前置对象 200b344 位于历史深处；git diff 需要基线
# macro-b-regression.yml:86-87
    fetch-depth: 0          # one-shot 证据锚读 .scratch 仓内文件；全量对象与 #39 先例一致
```

两处先例的注释写明「对象位于历史深处」正是加 `fetch-depth: 0` 的理由。`engine-ci.yml:25` 是裸 `actions/checkout@v4`，无 `fetch-depth`。

**同时注意**：`engine-ci.yml` 的触发路径仅 `engine/**` 与工作流自身（`:4-6`, `:9-11`）。84-check 住在 `.scratch/**`，**改守卫本身不会触发该工作流**——即「CI 射程」只覆盖了运行时不覆盖变更时，两头都漏。

**修复要求**（三选一或组合，裁定权在你）：
1. **最小改动**：给 `engine-ci.yml:25` 加 `fetch-depth: 0`，与本仓两处先例一致。注意副作用：该 job 克隆变慢，但 84-check 需要全量对象才正确，**属于「守卫正确性 > job 速度」的正当取舍**。
2. **根治**：把 `mainRun()` 的 `SHA1` 也改为运行时物化（与 `SHA_OK/SHA_TWIN` 同法），使 84-check 真正零历史依赖——这样 `portable` tier 的自声明才名副其实，且不拖慢 CI。
3. **两者都做**（推荐）：`fetch-depth: 0` 止血 + 运行时物化治本。

**重跑清单**（修完必须跑，与本审计第 1 条同一套）：

```
npm run build && node scripts/check-dist.mjs && node dist/cli.js selftest
node .scratch/architecture-recovery/reports/guard-all-run.mjs          # 期望 65/65 allOk=true
git clone --no-local --depth 1 file:///<repo> /tmp/v && cd /tmp/v/engine && npm ci --ignore-scripts
cd /tmp/v && node .scratch/architecture-recovery/reports/84-check.mjs   # 期望 34/34 PASS（本条即验收判据）
cd /tmp/v && node .scratch/architecture-recovery/reports/78-check.mjs   # 对照：既有步骤仍须 42/42
```
### P1-1（记账矛盾）｜fresh-clone 全绿复读同时被记为「欠账」与「已闭环」

**声明**：报告①#7 标注「✅（本体）/复读挂账」；§② 欠账三要素第①项列「fresh-clone 全绿复读——owner=本窗收口尾」；而 BACKLOG #88 标「✅ 2026-10-05 已闭环」且附「fresh clone 全绿读数并入哨兵」。
**证据**：`33-gate-registry.json` 的 `fresh-clone-rerun-watch` 第 5 条 confirmation 记 `decision: fresh-clone-green`，`status: decided`，理由载明「复读（closeout bundle 后干净 HEAD 09c73858）ran=65 green=65 red=0」；`git cat-file -t 09c73858` = commit，**该复读读数真实存在**。我也独立复现了 65/65。
**结论**：**读数无问题，但同一事实被同时挂在「欠账」和「已闭环」两个互斥状态上。** 判据既已闭环，就不应留在欠账表；反之亦然。欠账三要素（D-170③）的价值在于「未闭之债有人 owner 有时点锚」，把已闭项留在表内会稀释该机制的信噪比。
**修复要求**：以 registry 读数为准，**删掉报告 §② 欠账①**（或改标「本窗收口尾已闭，见 registry confirmation」）；同时对 #88 的 CI 面重开一条独立欠账（承接 P0-1）。

### P2-1（弱化）｜三处守卫断言被放松以适配翻转，其中一处近乎恒真

| 处 | 旧断言 | 新断言 | 判定 |
|---|---|---|---|
| `41a-check.mjs:47` (C3) | `['Micro-A','Micro-B','Macro-A'].every(s => readme.indexOf(s) >= 0)`（**逐名**） | `['Micro-B','Macro-A'].every(...)` ＋ 标题仍写「逐名」 | ⚠️ **标题与实现不符**：`Micro-B` 因能力-4 矩阵行而出现在 README，与「未上架层」无关。断言退化为「README 提到这两个词」。predecl §1.4 写的是「逐名=[Micro-B, Macro-A]」，实现不是逐名。 |
| `85-check.mjs:32` (A4) | 正锚 `not_in_preview: ['Micro-A','Macro-A']` ＋负锚排除 `['Micro-A','Macro-C']` | 正锚 `['Macro-A']` ＋ 负锚 `srcA.indexOf("not_in_preview: ['Micro-A'") < 0` | ⚠️ **判别臂消失**：旧负锚 `['Micro-A','Macro-C']` 是真正区分「Micro-A 出列」与「Macro-C 出列」的臂；新负锚对 `['Macro-A']` 这个串几乎恒真。 |
| `41b-check.mjs:64` (C2) | — | 新增 `mk.plugins[0].description.includes('Micro-A=audit --scale Micro-A') === false` | ❌ **近乎恒真的同义反复**：断言「描述不含某个没人会写的串」，无判别力，却计入 33/33 分母虚增绿量。 |

**修复要求**：C2 的恒真项删除或换成有判别力的断言（如 `capability 3 of 5` 与 Micro-A 行**同现**）；C3/A4 的标题与断言面对齐，若确为有意弱化，按 D-146⑤ 走**勘误注记**留痕，不要让标题继续声称「逐名」。

### P2-2（漏项）｜85-check 从未比较 `overall` band

predecl §1.3 的等值集明列「六判据 band／**overall band**／…」；E1/E2 比 `entries` band、E3/E4 比 11 个切片字段、E5 比 fact_ids、E6 比披露块——**`grep -n "overall" 85-check.mjs` 零命中**，`overall_verdict` 从未被断言。报告 ①#2 声称「E 组差分对账」全等时，`overall` 落在断言域外。
**修复要求**：要么补 `overall_verdict` 等值断言，要么按 D-146⑤ 勘误通道把 §1.3 的「overall band」标为**有意移出断言域**并留边界声明。当前状态是「票面要求 vs 实现」两头不落，属静默偏离。

### P3-1（卫生）｜两个新文件缺尾行

`micro-a.ts` 末字节 = 125（`}`），`micro-a.test.mjs` 末字节 = 59（`;`），**均无 `0x0A`**；同批的 `macro-c.ts`／`macro-c.test.mjs` 末字节均为 10。违反 AGENTS.md「写后回读断言、禁 BOM＋保尾行」。修法：各补一个尾换行。

### P3-2（存疑）｜契约变更未见版本递增

`engine/package.json`、`engine/plugin.json`、`.claude-plugin/marketplace.json` 三处仍 `"version": "0.1.0"`。本批把 Micro-A 从 calibrated-demo 翻成 plugin 分发面 preview 层并新增 CLI 面（契约变更）。`docs/versioning.md` §1「0.x 单调递增；minor = 契约变更」。
**注**：`git show 10252bc0` 显示此前 Macro-C 产线化同样未 bump——这可能是**长期存在的既有缺口**而非本批新增，故列 P3 存疑，请你裁定是否要追补（含是否需要 `git tag`）。

## ⑥ 双轴评审结果（Standards / Spec 并列，不合并不重排）

### Standards 轴

**硬违规**
1. `engine-ci.yml:89-90` 新步骤 `shell: bash` 无 PowerShell 回退（AGENTS.md 跨 shell 规则）。**缓解**：同文件既有 6 个步骤全用 `shell: bash`，新步骤与本仓 CI 惯例一致——故列为账本登记项而非阻断。
2. `micro-a.ts` / `micro-a.test.mjs` 缺尾行（同 P3-1）。
3. 版本未递增（同 P3-2）。

**搭车纪律核查（我亲自逐 commit `--stat` 验证）**：**两条禁搭车规则均守住** ✅——`7b19bb86 bundle:` 只含 6 件 `engine/dist/**`；`29c31fba feat(engine)` 零 dist 路径；`0f4137e1 bundle:` 只含 3 件派生 json。无语义 commit 夹带生成物，无 bundle commit 夹带源码。README 同步戳 `6e72603907ed` 与 `sha256(README.md)` 前 12 位**实测相符**。

**judgement call（smell，恒为判断非违规）**：最显著是 `preview_disclosure` 在 `micro-a.ts:325` 与 `48-micro-a-preview.mjs:351` 逐字节重复（两处必须手工同步）；其次 `audit.ts:122-123` 的 scale if 级联每加一层就多一个分支（两层已做，五层将散）；`capability 3 of 5 · preview` 是九处裸字符串无类型。Feature Envy / Data Clumps / Message Chains / Middle Man / Refused Bequest 无发现。

### Spec 轴

**(c) 看起来实现了但实为错**：P0-1（#88 验收判据在 CI 形态下不成立）＋ P1-1（记账矛盾）。

**(a) 缺失/部分**：P2-2（`overall` band）、predecl §3.4 的 75a 归因仅数据落地未见逐条归因。

**(b) 越界（scope creep）**：README 状态日期 2026-09-20→2026-10-05 与 zh-CN 同步戳重算，未列 predecl §1.4（我实测戳值正确，属未申报非错误）。#90 立案有 predecl §1.5 授权，非越界。

**#85② 移植保真度**：`micro-a.ts` 确按 §0~§10 逐段移植，`MICRO_A_SLICE_FIELDS` 与 48 导出出处**执行级**互等（E0 PASS）。predecl 偏差①~⑦ 全部落地且无未申报偏差——仅 `micro-a.ts:451` 的替代 limitation 文案属偏差⑦覆盖下的新措辞，而 E6 只比 `capability_label`/`not_in_preview`，故该措辞**无断言覆盖**（建议随 P2-2 一并补）。

**#89 正负对照**：H3/H4 确为真断言（我独立 4/4 击杀），非 immortal test。

## ⑦ 过程违规（单列呈报，不代为追认）

1. **CI 修复未经自身 CI 形态验证即合入**。#88 的 CI 射程勘误在 `--depth 1` 形态下必红，而合入前的验收只有「本机 34/34」+「全克隆 34/34」。两次读数都真实，**但都不是 CI 形态**——读数选得对、验得窄。这是本次 P0 的过程根因，我不认定为「谎报」，认定为**验收形态选取缺失**。
2. **欠账表与闭环状态未做互斥核对**（P1-1）。收口 commit 同时写下「已闭环」与「仍挂账」。
3. **`but status -fv` 与 `git status` 读数不一致，本窗未处置**。`but status -fv` 显示 `[uncommitted]` 仅 `.atomcode` 两件；但 `git status` 显示 **10 项**，其中 `engine/dist/audit/micro-a.js` 与 `micro-a.d.ts` 呈 **staged-D（已暂存删除）＋ worktree 另有同名未跟踪件**。我已核：两文件在 HEAD 中**存在**、worktree 字节与 HEAD **完全一致**、只是**不在 index stage 0**。即 index 处于「删除待提交」态。**这是 GitButler 的正常中间态**（内容无损、HEAD 无恙、84-check/全守卫仍绿），但**若下任一 Agent 跑裸 `git commit`，会把这 2 件 dist 产物提交成删除态**。请指示是否要我方处置——**我按职责分离不动它**。
4. **报告 ③ 的 lesson 与本窗自身缺陷同型**。lesson 说「按字面 grep 清查漏网，须枚举结构等值类」，而 P0-1 恰恰是同一形态的漏网（漏的是「历史对象可达性」这个结构面，不是字面 `201935fc`）。**lesson 提炼正确但未回检自身**。

## ⑧ 引用文件（本审计取证物）

- 被审报告：`.scratch/macro-audit/reports/2026-10-05-r63-report.md`
- 任务书：`.scratch/macro-audit/handoffs/next-round.md`
- 预声明包：`.scratch/architecture-recovery/reports/2026-10-05-r63-t1-predecl.md`
- 票面：`.scratch/architecture-recovery/BACKLOG.md`（#85/#88/#89/#90）
- 缺陷点：`.github/workflows/engine-ci.yml:25,89-92`；`.scratch/architecture-recovery/reports/84-check.mjs:413-414,485-502`
- 对照先例：`.github/workflows/golden-ci.yml:41-42`；`.github/workflows/macro-b-regression.yml:86-87`
- 弱化面：`41a-check.mjs:47`；`85-check.mjs:32`；`41b-check.mjs:64`
- 记账面：`.scratch/architecture-recovery/reports/33-gate-registry.json`（`fresh-clone-rerun-watch` 第 5 confirmation）

**审计窗未修改仓库任何文件**：全程只读 + 系统临时目录克隆（已删除）；收尾复核 `git status` = 10 项，与审计开始时逐项一致；6 件 dist 字节仍与 HEAD 全等。

并把 `.scratch/**` 加进 `engine-ci.yml` 的触发 `paths`，否则守卫变更永不入 CI 射程。
| 1 | `micro-a.ts` 574 行；`audit.ts implemented=[Macro-B,Macro-C,Micro-A]` | 文件在，tsc 编译通过；85-check A3 PASS | ✅ 属实 |
| 2 | 85-check **36/36**，E5 fact_id 全等 | `PASS 36/36`；E0~E8 全 PASS；E5 断言在 `:234` 比较 `fact_ids` 三联＋双件 `JSON.stringify` 全等 | ✅ 属实（但见 P2-2：`overall` band 从未比较） |
| 3 | DoR-a 四层 preview 在架 | README.md:43／README.zh-CN.md:49／description.md:25 均含 `capability 3 of 5 · preview`；41b-check 33/33 | ✅ 属实 |
| 4 | 48 生成器 L360/L448 翻转＋golden 再生 | `48-micro-a-preview.mjs:360,448` 双行均 `not_in_preview: ['Macro-A']`；48-check 45/45 | ✅ 属实 |
| 5 | 编译/打包/测活/测试闭环 | 见 §② 全部实测 | ✅ 属实 |
| 6 | 84-check **34/34** F01~F20 语义不动唯 SHA 值换 | `PASS-COUNT 34 FAIL-COUNT 0`；`:485-502` 确为 mkdtemp＋commit-tree 运行时物化；`:485` 孤儿 commit 201935fc 钉已废止 | ✅ 属实（**但覆盖面不全，见 P0-1**） |
| 7 | fresh clone 全绿（本体 GREEN／复读 62/65→全绿） | 我独立全克隆复读 = 65/65 green | ⚠️ 读数属实，但**状态记账矛盾**（见 P1-1） |
| 8 | env-contract→portable 重声明 | `84-check.mjs:14` `const TIER = 'portable'`＋PROTECTED_SURFACE 含「零依赖未推送对象…portable tier fresh-clone 可跑重申」 | ✅ 属实（**但该重声明在 CI 形态下为伪**，见 P0-1） |
| 9 | engine-ci 射程缺口勘误 | `engine-ci.yml:89-92` portable 段在位 | ❌ **修复本身 born-red，见 P0-1** |
| 10 | 41a-check 双层断言 **47/47** | `PASS 47/47`；我另做**独立 mutation-kill 4/4 全击杀**（见 §④） | ✅ 属实且非空断言 |
| 11 | ADR-0013 正负对照 H3/H4/H5/H6 | 四控制齐备；H3/H4 在 check 内运行时构造切片 | ✅ 属实 |
| 12 | census 再基线 403＋guard-meta 扩注 | findings=403；guard-all 65/65 | ✅ 属实 |
| 13 | margin 11,895B／headroom 3.09%＜25% → 翻转＋#90 立案 | 我算 `(1−373105/385000)×100 = 3.09%`；registry `ratchet-headroom-watch` status=`triggered-bound`；BACKLOG #90 在册 | ✅ 算术与流程均属实 |
| 14 | 收口前置 build＋check-dist 零 drift | 我重跑 check-dist PASS；6/6 字节 MATCH | ✅ 属实 |
| 15 | T3 `.atomcode` 两件全程未入任何 commit | `git log 41f9d95a -- .atomcode` = 空；`git log --all` 仅命中 gitbutler 内部 stash ref | ✅ 属实 |
