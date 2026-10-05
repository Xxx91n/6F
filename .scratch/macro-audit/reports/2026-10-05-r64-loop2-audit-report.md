# R64-LOOP2 审计窗报告——返修二段复验（2026-10-05）

> 身份=**审计 Agent**（职责分离：只出报告，不动手修）；被审对象=`.scratch/macro-audit/reports/2026-10-05-r64-rework-report.md` §⑥（返修二段自述）＋4 个 commit（`c4f323ea..02f6ea5b`）。
> 前序：R64 T1 审计（裁定不通过）→ R64-LOOP 审计（裁定有条件通过，列 P0-2/P1-2）。
> 审计基线=不信自述。P0-2 逐条重跑 8 行变异矩阵；P1-2 直接读判级路由代码并做浅克隆注入。

## ① 结论摘要

**审计结论：✅ 通过。**

两项 findings 均以**端到端证据**闭环，非仅声明：

- **P0-2（85-A4 死正则）✅ 根治，且修法超出我的要求**——不仅把 `[^]]` 改成 `[^\]]`，还把「判别臂活性正对照」**内嵌进 A4 断言本身**（`NIP_ROGUE_RE.test(合成违规串)`）。这意味着：即使将来有人再次把正则改回 `[^]]` 形态，**守卫会自己变红**，而不是像这次一样静默假绿。**这是本轮最有价值的改动——它把一次性修复变成了常驻自证。**
- **P1-2（skip 覆盖面）✅ 按审计三选项取 1+3 组合**——扫描恒跑、纯位形 kind 照常判 FAIL、需 `cat-file` 的 kind 重路由 `PV-ENV-UNRESOLVABLE` 恒 WARN 披露（非静默）、历史可达性子面入 `HISTREACH` 组 SKIP。
- **P3-3 登记不处理** ✅ 符合我上轮建议（既存 +1 偏移，跨窗议题）。

**无新增阻断。** 本轮返修窗的自我批评质量高——两处过程事故（管道吃 `rc`、BACKLOG 行尾锚）都主动自曝，且 P0-2 的根因认领准确（「为守零反斜杠纪律写出的 `[^]]` 恰踩空类陷阱」）。

## ② 硬验收重跑（亲自跑）

| 验收项 | 实测 | 结论 |
|---|---|---|
| 编译 | `tsc -p tsconfig.json && build-bundle` → `BUNDLE-OK dist/cli.js` | ✅ |
| 打包 | `DIST-RATCHET PASS: 373105B / cap 385000B（margin 11895B）` | ✅ |
| 测活 | `selftest ok=true`，`manifest readable = 6f@0.2.0` | ✅ |
| dist 零 drift | 逐字节 sha256 **MATCH=16/16**；`git diff HEAD -- engine/dist` 空 | ✅ |
## ③ findings 逐条对照

| finding | 返修窗声明 | 我的实测 | 结论 |
|---|---|---|---|
| **P0-2** | `[^]]`→`[^\]]`；活性正对照内嵌 A4；8 行变异矩阵 5 杀 3 负对照 | 正则层 **8/8**；按守卫 A4 原式逐字求值 **8/8**；端到端 background 实跑：baseline `rc=0 PASS 37/37`、V2 序无关性本体 `rc=1 FAIL 1/37` 且 A4 行红 | ✅ **根治＋自证** |
| **P1-2** | 窄化 HISTREACH；纯位形可判红；env-unresolvable 恒 WARN 披露 | 浅克隆 `31 PASS/0 FAIL rc=0`；`GIT_DEP` 映射正确排除 bare-shortcode/fuzzy-phrase；F05/F06/F14 三条 FAIL 判定断言**在浅克隆下 PASS**；全克隆 `34/34` | ✅ **闭环** |
| **P3-3** | 登记不处理 | 账本有登记；inventory 1524 维持 | ✅ 符合建议 |

## ④ P0-2 详证：死正则修复 ＋ 活性自证

**修复后的源码**（`85-check.mjs:32-33`）：
```js
const NIP_ROGUE_RE = /not_in_preview:[ ]*\[[^\]]*'(Micro-A|Macro-C)'/;   // …正对照内嵌=判别臂活性自证（臂死亡即红）
t('A4 audit.ts not_in_preview 裁后=[Macro-A]（…判别臂序无关…LOOP P0-2 修正＋活性正对照）',
  srcA.indexOf("not_in_preview: ['Macro-A']") >= 0 && !NIP_ROGUE_RE.test(srcA) && NIP_ROGUE_RE.test("x = { not_in_preview: ['Macro-C'] };"));
```

### 证据一：正则层 8/8（原样抽出 shipped 字面量）

```
OK  match=false expect=false :: current - must NOT false-red
OK  match=true  expect=true  :: V1 ['Micro-A']
OK  match=true  expect=true  :: V2 ['Macro-A', 'Micro-A']   ← 序无关性本体
OK  match=true  expect=true  :: V3 ['Macro-C', 'Macro-A']
OK  match=true  expect=true  :: V4 ['Micro-A','Macro-C']
OK  match=true  expect=true  :: V5 ['Macro-B','Micro-A','Macro-C'] buried
OK  match=false expect=false :: NEG Macro-B 不在本臂管辖域
OK  match=false expect=false :: NEG implemented 数组非 not_in_preview
real audit.ts (must be false): false
```

### 证据二：按守卫 A4 原式逐字求值 8/8

不只测正则，而是把 A4 的完整合取式（正锚 ∧ ¬rogue(src) ∧ rogue(probe)）在每个变异体上求值：

```
OK  A4=GREEN expect=GREEN :: baseline
OK  A4=RED   expect=RED   :: V1 / V2 / V3 / V4 / V5（五个违规位形）
OK  A4=GREEN expect=GREEN :: NEG rogue ['Macro-A','Macro-B']
→ 8/8 correct
```

### 证据三：端到端真跑（独立克隆，各自 npm ci）

| 克隆 | rc | 终值 |
|---|---|---|
| baseline（未变异） | **0** | `PASS 37/37` |
| V2 序无关性本体 `['Macro-A','Micro-A']` | **1** | `FAIL 1/37`，A4 行红 |

对照我上一轮发现的正是这个 case 存活（`MUTATION SURVIVED`），现已反转。

### 证据四：活性正对照真的会自爆（这是本轮最值得肯定的一点）

我专门验证了「万一将来又有人改回 `[^]]`」这个场景：

```
dead regex [^]] on the synthetic probe: false   → 若臂再退回 [^]]，A4 的第三个合取项为 false ⇒ A4 直接红
```

即：**这个修复不只是把 bug 修掉了，还给这个 bug 装了一个不会失效的看门狗。** 「改了必须验」从一次性纪律变成了守卫结构的一部分——正是我在上轮 handoff 里建议 grill 立法的那件事，返修窗直接落成了代码。

## ⑤ P1-2 详证：skip 窄化确实收窄了

**关键路由代码**（`84-check.mjs:417-422`）：
```js
if (!HIST_OK) {
  const GIT_DEP = { 'short-sha':1, 'missing-subject':1, 'nonexistent-sha':1, 'misplaced-pointer':1, 'misplaced-unresolvable':1 };
  for (const fd of all) { if (GIT_DEP[fd.kind]) fd.kind = 'env-unresolvable'; }
}
```
`bare-shortcode` 与 `fuzzy-phrase` **不在 GIT_DEP 内** → 浅克隆下仍走 `judge()` 的正常 FAIL 分支。

**浅克隆实测**：注入违规后 `newFail` 判定链仍可判红——守卫自带的三条 FAIL 判定断言在浅克隆下**全部 PASS**：
```
PASS PV-G-F05-BARE-SHORTCODE :: 裸短码判 FAIL slug=PV-BARE-SHORTCODE
PASS PV-G-F06-FUZZY-PHRASE    :: 模糊语判 FAIL kind=fuzzy-phrase
PASS PV-G-F14-REVERSE-GATE    :: 非白名单列头纯指针负载判 FAIL slug=PV-MISPLACED-POINTER
```
这三条跑的是真 `judge()`＋真 `scanDoc()`，证明「纯位形面照跑可判红」这句话在浅克隆形态下为真。

**披露非静默**：浅克隆 `SURFACE` 行显式打出 `envUnresolvable=77`，比全克隆的 `legal=72 / baselineWarn=5` 结构差异一目了然；SKIP-GROUP 的 reason 三段（原因／手动修复／无网影响面）完整，且措辞已按窄化后的事实改准（「纯位形面（裸短码/模糊语）照跑可判红」）。

**我的一次自我修正（如实记录）**：我最初注入 `| abc1234 |` 与 `| 本轮修复 commit |` 期待浅克隆变红，实测均绿。追查后确认是**我的注入体被判成了 `short-sha`（在 GIT_DEP 内 → 正确降级为 WARN）而非纯位形 kind**——守卫行为是对的，是我的探针构造不对。改用守卫自带 fixture 的判定路径（上述 F05/F06/F14）后确认能力成立。**这条不计为 finding，属探针构造失误。**

**全克隆回归无退化**：`34/34`、`legal=72`、`newFail=0`、`baselineWarn=5`（与返修前同值）。

## ⑥ 过程违规（单列呈报）

1. **（返修窗自曝 1）** 浅克隆探针首跑 `rc=$?` 被管道吃掉导致误报，改用裸 `rc` 捕获修正。**这是本轮唯一的过程瑕疵，且是自曝＋已修**。值得肯定的是：它与 R63 那次「误置 hit 标志」的教训同型，说明该教训正在被实际应用。
2. **（返修窗自曝 2）** P0-2 根因认领准确：*「我上轮为守零反斜杠纪律写出的 `[^]]` 恰好踩中 JS `[^]`=任意字符空类陷阱」*。**这个认领质量很高**——它把一次手滑追溯到了纪律冲突（zero-backslash 纪律 vs 正则字符类语义），而不是简单归因为「粗心」。这也正是它提出的 grill 第四题（两纪律合流）的依据。
3. **（本审计窗自曝）** 探针构造失误一次，见 §⑤ 末。记此以保持对称。
4. **无新增过程违规。** 提交卫生良好：4 个 commit 分层清晰（fix(guards)／fix(#88-rework2)／bundle 派生／docs 收口），`.atomcode` 未入任何 commit，LOOP 审计两件随 `nsl` 入库。

## ⑦ 双轴评审

### Standards 轴
- **无硬违规**。新代码注释密度与决策留痕密度都高于仓库均值（`NIP_ROGUE_RE` 那行注释同时记录了 bug 形态、根因、正对照用意与关联 ticket）——这是好实践。
- **judgement call**：把正对照内嵌进 A4 使该断言变成三合取式，可读性下降（一个断言干三件事）。若未来拆分，建议把活性自证独立成一条 `t()`——但那样计数会 +1 触发 inventory 再生。**当前形态在「零 churn」与「可读性」间的取舍是合理的，不建议改。**
- 提交卫生：与上轮同评价，无异议。

### Spec 轴
- 两项 findings 均按审计要求落地，无 scope creep，无未申报偏差。
- P3-3 按建议只登记不处理，符合「跨窗议题不夹带」的纪律。
- **判据与声明一致性**：本轮无判据修订需求（沿用上轮已获 grill 追认的判据），返修窗未私自改动，实测读数与判据相符。

## ⑧ 转呈 grill（本轮由返修窗提出，我复核后认为成立）

| # | 议题 | 我的意见 |
|---|---|---|
| ① | 验收形态选取立法 | 成立。三轮证据链已足够（#88 浅克隆 born-red → P0-1；P0-2 死正则 → 变异验证；P1-2 skip 掩盖 → 声明与实测对齐） |
| ② | `git-history` 探测面入 D-163 分类 | 成立。`git-history:full` 已首用并跑通，SSOT FIX 模板化确有必要 |
| ③ | **守卫断言「已修复」是否必须附变异击杀读数** | **成立且优先级最高**。本轮返修窗已自发把它落成 `NIP_ROGUE_RE` 内嵌正对照——**代码层面已经先行验证了这题的可行性**，立法只是把实践升格为通则 |
| ④ | 「否定字符类内 `]` 必须转义」与 zero-backslash 纪律合流 | **成立，且这是本轮最有价值的立法题**。P0-2 的根因正是「为守旧纪律而写出陷阱写法」——两条纪律在此直接冲突，需要 grill 明确边界（哪些形态必须允许反斜杠） |

**我的补充建议**：④③两题应**合并**裁定。③的通则若不配套④的正则纪律细则，下次仍会以别的形态复发。

## ⑨ 引用文件

- 被审报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-05-r64-rework-report.md` §⑥
- 本窗前序：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-05-r64-loop-audit-report.md`（P0-2／P1-2 的原始证词）
- 修复点：`85-check.mjs:32-33`（正则＋活性正对照）、`84-check.mjs:417-422`（HISTREACH 路由）
- 账本：`.scratch/macro-audit/decision-ledger.md`「返修二段」小节

**本审计窗未修改仓库任何文件**：全程只读；临时克隆建在 `.code-tmp/`（`.gitignore:9` 已忽略）并已全部删除（`ls -d .code-tmp/r65*` = No such file）；收尾 `git status` 仅剩 T3 两件 staged-A；dist 16/16 字节与 HEAD 全等。
| 全量守卫 | `ran=65 green=65 red=0 problems=0 allOk=true` | ✅ |
| 85-check | `PASS 37/37` | ✅ |
| 41a / 41b | `47/47` ／ `33/33` | ✅ 无回退 |
| 84-check 全克隆 | `SURFACE files=821 findings=77 legal=72 baselineWarn=5 newFail=0` → **`PASS-COUNT 34 FAIL-COUNT 0`** | ✅ |
| 84-check 浅克隆 | `findings=77 legal=0 baselineWarn=77 envUnresolvable=77 histreach=SKIP(shallow)` → **`31 PASS / 0 FAIL / rc=0`** | ✅ |
| 派生信号 | 63-inventory **1524**（85-check=38，live 37，+1 既存偏移维持）／75a findings **403** | ✅ |

**repo 卫生**：`git status` 仅剩 `.atomcode` 两件 staged-A（T3 主权，从未入任何 commit）；我的临时克隆全在 `.code-tmp/`（已 gitignore）且已删除；dist 零 drift。
