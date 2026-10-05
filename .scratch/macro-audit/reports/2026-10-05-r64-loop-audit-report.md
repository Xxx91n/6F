# R64-LOOP 审计窗报告——R64 返工批复验（2026-10-05）

> 身份=**审计 Agent**（职责分离：只出报告，不动手修）；被审对象=`.scratch/macro-audit/reports/2026-10-05-r64-rework-report.md`（R64-LOOP 返工窗自述）＋5 个 commit（`18e8af97..d1210849`）。
> 前序=`.scratch/macro-audit/reports/2026-10-05-r64-audit-report.md`（R64 T1 审计窗，裁定不通过打回）。
> 审计基线=不信自述，全部亲自重跑；findings 逐条做**端到端 mutation-kill**，不采信「已改」只认「能杀」。

## ① 结论摘要

**审计结论：🟡 有条件通过——P0-1 已根治，但 P2-1 的 85-A4 那一处「修复」本身是死代码。**

- **P0-1（阻断）确认根治** ✅ 我独立复现三形态：浅克隆 `PASS-COUNT 29 / FAIL-COUNT 0` ＋ SKIP-GROUP 带三段因 ＋ **rc=0**（原 rc=1／newFail=72 归零）；全克隆 `34/34` 无 SKIP；同浅克隆 78-check 对照 rc=0。`engine-ci.yml` 已有 `fetch-depth: 0` 且触发 paths 扩至 `.scratch/**`。
- **P2-1 三处弱化：两处真修好、一处修坏** ❌ 41a-C3 与 41b-C2 我做出**真判别力**（变异全杀）；但 **85-A4 的「序无关正则」因 JS `[^]]` 语义错误而永不匹配**——我端到端注入真回归，守卫**保持全绿放行**。
- **P1-1 / P2-2 / P3-1 / P3-2 / 过程违规③ 全部确认闭环** ✅（逐条实测见 §③）。
- **新发现 P1-2**：DOCSCAN 组级 SKIP 在浅克隆下**掩盖真实指针违规**（我注入非法 40-hex 指针，守卫仍 `29 PASS/0 FAIL`）。与 40-check:B 同型、机制合规，但覆盖面比声称的宽。

**返工窗的工作质量整体是高的**——第一性判定正确（识别出选项 2 单独不足）、验收形态补齐（commit 后才跑克隆）、过程事故自曝（BACKLOG 行尾锚 no-op 假成功）。问题集中在一处正则写法与一处 skip 粒度。

## ② 硬验收重跑（亲自跑）

| 验收项 | 实测 | 结论 |
|---|---|---|
| 编译 | `macro-audit@0.2.0 build` → `BUNDLE-OK dist/cli.js`，tsc 0 error | ✅ |
| 打包 | `DIST-RATCHET PASS: 373105B / cap 385000B（margin 11895B）` | ✅ |
| 测活 | `selftest ok=true`，**manifest readable = `6f@0.2.0`** | ✅ |
| manifest SSOT | `npm run gen` → `GEN-OK`＋`versions aligned PASS` | ✅ |
| dist 零 drift | `git status -- engine/dist` 空；逐字节 sha256 **MATCH=16/16** | ✅ 无 drift、无 bundle commit（与自述一致） |
| 全量守卫（本机） | `ran=65 green=65 red=0 problems=0 allOk=true` | ✅ |
| 全克隆 | `HEAD=9d6371c isShallow=false` → 84-check **34/34**、guard-all 65/65（唯一 group-skip=40-check:B 带因） | ✅ |
| **浅克隆（P0-1 场景）** | `--no-local --depth 1` → **29 PASS / 0 FAIL**＋`SKIP-GROUP 84-check group=DOCSCAN reason=env-missing:git-history:full`（含原因/修复/影响三段）＋`rc=0` | ✅ **原 born-red 已归零** |
| 浅克隆对照 | 同克隆 78-check **rc=0** | ✅ |
| 派生再基线 | 63-inventory **1524**（70-check E1 对账 `PASS 13/13`）／75a findings **403** | ✅ |
## ③ findings 逐条对照（声明 → 证据 → 结论）

| finding | 返修窗声明 | 我的实测 | 结论 |
|---|---|---|---|
| **P0-1** | 三件组合：fetch-depth:0＋B/F 面运行时物化＋浅克隆组级 SKIP；判据修订为「浅克隆 0 FAIL＋SKIP 带因＋全克隆 34/34」 | 浅克隆 rc=0／29 PASS／SKIP-GROUP 带三段因；全克隆 34/34；CI 两处配置在位 | ✅ **确认根治** |
| **P1-1** | r63-report ②/⑥ 勘误销账＋#88 CI 面欠账重开即闭 | `r63-report:59` 已带「【R64 勘误：已闭销账（P1-1），见②】」；账本 R64 节载明互斥修复 | ✅ 闭环 |
| **P2-1 (a)** 41a-C3 | 改行级实物（Status 行四层逐名＋Macro-A 矩阵行） | 变异测试：删 Status 行 → **KILLED**；改 Macro-A 矩阵行 → **KILLED** | ✅ 真判别力 |
| **P2-1 (b)** 41b-C2 | 删恒真臂，换四层在架＋capability 4 of 5＋Macro-A 未上架 | 5/5 变异全 **KILLED**（含空串） | ✅ 真判别力 |
| **P2-1 (c)** 85-A4 | 改序无关正则 `/not_in_preview:[ ]*\[[^]]*'(Micro-A\|Macro-C)'/` | **该正则永不匹配**（见 §④ P0-2）；端到端注入真回归 → 守卫**全绿放行** | ❌ **修复本身是死代码** |
| **P2-2** | 新增 E9＝overall_verdict＋structural_limitations 双侧全等 | `85-check.mjs:240` 断言在位；85-check **37/37**（36→37）；inventory 1523→1524 | ✅ 闭环 |
| **P3-1** | 两文件补尾行，dist 零 drift | 两文件 `lastByte=10`；`git status -- engine/dist` 空 | ✅ 闭环 |
| **P3-2** | 0.1.0→0.2.0 走 SSOT 链 | package/plugin×2/marketplace/manifest.meta 全 **0.2.0**；selftest 读 `6f@0.2.0`；CHANGELOG `[0.2.0]` 节在位 | ✅ 闭环 |
| **过程违规③** | `git reset -- engine/dist`，`.atomcode` 原样保留 | `git status` 仅剩 `.atomcode` 两件 staged-A；dist 16/16 与 HEAD 全等；staged-D 已清 | ✅ 闭环 |
| **过程违规①** | 验收含 CI 形态（commit 后浅克隆实跑） | 我独立复核三形态全绿 | ✅ 已回应 |

## ④ Findings

### P0-2（阻断）｜85-A4 的「序无关正则」永不匹配——端到端变异放行

**声明**：`85-check.mjs:32` 判别臂改为「序无关：任一位形不得回列 Micro-A/Macro-C」，题字写明「R64 返修 P2-1」。
**证据一（正则层）**：从源码原样抽出该正则直接测：

```
shipped=false fixed=false expect=false      :: not_in_preview: ['Macro-A']        （当前态，须绿）
shipped=false fixed=true  expect=true  DEAD :: not_in_preview: ['Micro-A']
shipped=false fixed=true  expect=true  DEAD :: not_in_preview: ['Macro-A', 'Micro-A'] （序无关性本体）
shipped=false fixed=true  expect=true  DEAD :: not_in_preview: ['Macro-C', 'Macro-A']
shipped=false fixed=true  expect=true  DEAD :: not_in_preview: ['Micro-A','Macro-C']
shipped=false fixed=true  expect=true  DEAD :: not_in_preview: ['Macro-B','Macro-A','Macro-C']

SHIPPED correct on 1/6      FIXED correct on 6/6
```

**根因**：JS 正则中 `[^]` 是「任意字符」，所以 `[^]]` 被解析为「任意字符」后跟一个字面 `]`。实测 `/[^]/.test('a') = true`、`/[^]]/.test('a') = false`。因此 `[^]]*` 只能匹配「直到后面某个 `]` 为止」的文本——**而 `]` 在单行数组字面量里位于名字之后**，所以该臂永远无法匹配 `['Micro-A']` 这种形态。正确写法是 `[^\]]`（转义右方括号）。

**证据二（端到端，最硬）**：克隆仓 → 保留合法字面量不动、**另加**一处 `const _rogue = { not_in_preview: ['Micro-A','Macro-A'] };` → 跑真守卫：

```
PASS A4 audit.ts not_in_preview 裁后=[Macro-A]（…判别臂序无关…R64 返修 P2-1）
>>> MUTATION SURVIVED — 守卫对该违规完全失明
```

（对照组：把原行直接改成 `['Macro-A','Micro-A']` 时守卫会红——但那是**正锚** `indexOf("not_in_preview: ['Macro-A']")` 失效所致，与序无关臂无关。序无关臂的存在意义恰恰是「合法字面量仍在、另有违规位形」这一它唯一该管的场景。）

**为什么是阻断级**：我上一轮 P2-1 的 finding 是「判别臂消失」，返修窗正确地接受了「要序无关」这个方向，但**实现出来的东西不具备它声称的性质**。守卫现在对一种真实回归形态完全失明，且 85-check 报 `37/37` 全绿——比修复前更危险，因为**它看起来被修好了**。这也正是 R63 报告 ③ lesson 的第三次同型复发：改了、报告写了、但没做端到端变异验证。

**修复要求（一行）**：
```js
// 现状（死）：   !/not_in_preview:[ ]*\[[^]]*'(Micro-A|Macro-C)'/.test(srcA)
// 修正（一行）： !/not_in_preview:[ ]*\[[^\]]*'(Micro-A|Macro-C)'/.test(srcA)
```
改完**必须**重跑 §⑤ 的端到端变异清单，并确认修正正则对当前 `audit.ts` 仍返回 `false`（我已验：`[^\]]` 版本对真实 audit.ts = `false`，不误红）。

**全仓扫描**：我对 `reports/` 下全部 `.mjs`/`.js` 扫了「否定字符类首成员为未转义 `]`」这一 bug 形态，**全仓仅此 1 处**，无同类扩散。

### P1-2（新）｜DOCSCAN 组级 SKIP 在浅克隆下掩盖真实指针违规

### P3-3（轻）｜63-inventory 的 85-check 计数比 live 多 1（既存偏移，非本窗引入）

inventory 记 `85-check.assertion_ids = 38`，live 实跑 `PASS 37/37`；R63 时同样是 inventory 37 / live 36。属 `update-70-inventory.mjs` 静态计数与 live 断言的**既存 +1 偏移**，本窗只是沿用；`70-check E1` 对账 `PASS 13/13` 绿，故 70-check 口径容忍该偏移。**列 P3 仅供登记，不建议本窗处理**（跨窗议题）。

**CI 配置核实**：`engine-ci.yml:38-41` `fetch-depth: 0` ＋注释引 golden-ci:41 先例；触发 paths 扩至 `.scratch/**`＋`docs/adr/**`＋`CONTEXT.md`＋`AGENTS.md`（push 与 pull_request 双侧）。**P0-1 要求的 CI 射程改造确实落地。**

## ⑤ 重跑清单（P0-2 修完必跑）

```
# 1. 一行修正后，先验正则层不误伤
node -e "const re=/not_in_preview:[ ]*\[[^\]]*'(Micro-A|Macro-C)'/;
console.log('real audit.ts (须 false):', re.test(require('fs').readFileSync('engine/src/audit/audit.ts','utf8')));"

# 2. 端到端变异（5 违规位形 + 3 负对照）——克隆内改 audit.ts 后跑真守卫
git clone --no-local file:///<repo> /tmp/m && cd /tmp/m/engine && npm ci --ignore-scripts && cd /tmp/m
#   违规：['Micro-A'] / ['Macro-A','Micro-A'] / ['Macro-C','Macro-A'] / ['Micro-A','Macro-C'] / ['Macro-B','Macro-A','Macro-C']
#   → 每次 85-check 必须 rc≠0
#   负对照：['Macro-A'] / ['Macro-A','Macro-B'] / implemented 数组含 Micro-A
#   → 每次 85-check 必须 rc=0

# 3. 硬验收电池（同本审计 §②）
npm run build && node scripts/check-dist.mjs && node dist/cli.js selftest && npm run gen
node .scratch/architecture-recovery/reports/guard-all-run.mjs        # 65/65 allOk=true
node .scratch/architecture-recovery/reports/85-check.mjs            # 37/37
node .scratch/architecture-recovery/reports/84-check.mjs            # 34/34

# 4. 浅克隆回归（P0-1 不得回退）
git clone --no-local --depth 1 file:///<repo> /tmp/s && cd /tmp/s/engine && npm ci --ignore-scripts && cd /tmp/s
node .scratch/architecture-recovery/reports/84-check.mjs            # 29 PASS / 0 FAIL / rc=0 / SKIP-GROUP 带因
```

若 P1-2 也修（窄化 skip），追加：浅克隆内向扫描面注入非法指针，**必须红**。

## ⑥ 双轴评审（Standards / Spec 并列）

### Standards 轴
- **无新增硬违规**。本窗新代码（84-check 的 skip 段、E9 断言、41a/41b 断言改写）风格与既有一致，无 BOM、无尾行问题（已机核 `lastByte=10`）。
- **judgement call**：`[^]]` 之误本质是**正则字符类语义的误解**，不属 Fowler smell 清单，但同型于 **Primitive Obsession→应为强类型/已构造正则**；建议本仓正则纪律补一条「否定字符类内 `]` 必须转义」的成文规则（现 AGENTS.md 有 zero-backslash 纪律但未覆盖此形态）。
- 提交卫生：5 个 commit 分层清晰（fix(#88)／fix(engine)／fix(guards)／bundle 派生／docs 收口），**dist 未入任何语义 commit**，`.atomcode` 两件未入任何 commit。`but show` 收清单我已逐一核实。

### Spec 轴
- P0-2（P2-1 未真修）、P1-2（skip 覆盖面超声明）如上。
- **判据修订的处理是合规的**：返修窗**没有**把「浅克隆 34/34 不可达」私自改判为通过，而是明确写出「审计期望不可达 → 改判据＝0 FAIL＋SKIP 带因＋全克隆 34/34」并**报 grill 追认**。这符合 D-165/D-170 分层（验收层读数不得改判据，修订须走裁定链）。**这一点做得对，应明确肯定。**
- 未发现 scope creep；无未申报偏差。

## ⑦ 过程违规（单列呈报）

1. **（继承）正则类改动缺端到端变异验证**——本轮 P0-2 的直接成因，也是 R63 lesson 的第三次同型复发。**建议进 grill 立法题**：守卫断言的「已修复」是否必须附变异击杀读数才算验收（对应 handoff 方向①的同类）。
2. **skip 覆盖面声明与实测不符**——报称「B/G 面照跑」，实测整个扫描面停摆。机制合规但描述失准，属**诚实披露不足**（非隐瞒，SKIP 行本身带三段因可见）。
3. **（返修窗自曝，值得肯定）** BACKLOG 行尾锚 `\|\s*$` 对以 `）` 结尾的表行静默 no-op 且 hit 标志误置，产生「写=原文」的假成功；自曝并复改（`endsWith('）')` ＋写后 grep 复验）。这是**健康的自曝文化**，应予肯定而非追究。
4. **git index 中间态已消除** ✅——上轮我报的 `staged-D` 陷阱本窗开工即修，`.atomcode` staged-A 原样保留。本轮 `git status` 干净（仅 T3 两件）。

## ⑧ 引用文件

- 被审报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-05-r64-rework-report.md`
- 前序审计：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-05-r64-audit-report.md`
- 缺陷点：`.scratch/architecture-recovery/reports/85-check.mjs:32`（死正则）；`84-check.mjs:406-408`（skip 粒度）
- 修好的面：`41a-check.mjs:47`、`41b-check.mjs:64`、`85-check.mjs:240`(E9)、`.github/workflows/engine-ci.yml:38-41`＋触发 paths
- 账本：`.scratch/macro-audit/decision-ledger.md`「第六十四轮返修批收口对账」节

**本审计窗未修改仓库任何文件**：全程只读 ＋ 系统临时目录克隆（已全部删除，`ls /tmp/r64*` = No such file）；收尾 `git status` 仅剩 T3 两件 staged-A，与开工时一致；dist 16/16 字节仍与 HEAD 全等。
**声明**：返修报告称 SKIP 期间「B/G 面（运行时物化自足）照跑」。
**证据**：浅克隆内向 `CONTEXT.md` 注入一条**非法 40-hex 指针**（`| \`\`deadbeef…\`\` | injected rogue pointer |`，正是 PV- 系列的判定对象），重跑：

```
SURFACE files=819 findings=0 legal=0 … newFail=0 … docscan=SKIP(shallow)
PASS-COUNT 29 FAIL-COUNT 0
>>> STAYS GREEN on an injected illegal pointer
```

即浅克隆下**位形违规检测整体失效**，不只我上一轮点出的「历史可达性」那一类。

**公允之处**：机制本身合规——用了 `_lib/env-contract.mjs` 的 `need()`/`groupProbe()`（D-159⑥ SSOT），SKIP-GROUP 是 guard-all 的既有协议（40-check:B 同型），且 CI 已配 `fetch-depth: 0`，**故 CI 路径上不会触发该 skip**。这是**诚实的环境性降级**，不是偷懒。

**但覆盖面比声明的宽**：报称只是「历史依赖面 SKIP」，实测是**整个扫描面 SKIP**（`findings=0` 意味着连纯位形检出都没跑）。判级差异真实存在——全克隆 `findings=77 legal=72 baselineWarn=5`，浅克隆 `findings=0`。

**风险面**：任何人在浅克隆下跑 84-check 会得到**误导性的全绿**（29/29）。我另实测：浅克隆下 guard-all 报 `GUARD-ALL-RESULT: FAIL`，但那是**其他**守卫也 group-skip 了（26/27/28/40/43 五件同样 `git-object:` 缺失）；若某人的浅克隆恰好保有那些对象、只缺 `git-history:full`，84-check 会静默降级。

**修复要求（择一或组合）**：
1. **窄化 skip 粒度**：把 `DOCSCAN_OK` 从「整面跳过」改为「只跳过需要 `cat-file` 的历史可达性子判定」，保留纯位形扫描（位形违规不需要历史对象）。最贴合原意。
2. **或**：登记 `git-history:full` 为**强制环境前置**——在 `guard-all-run.mjs` 侧把该 group-skip 计为需人工确认的状态，而非静默放行。
3. **或**：接受现状但**修正声明**——把返修报告与 `PROTECTED_SURFACE` 里「SKIP 期间 B/G 面照跑」的措辞改为「SKIP 期间整个指针扫描面不参与判定」，让覆盖面诚实。

**注意**：这一条**不是**要求返工窗回退 P0-1——P0-1 修法（fetch-depth:0）是对的，skip 只是浅克隆下的兜底，CI 路径已免疫。
