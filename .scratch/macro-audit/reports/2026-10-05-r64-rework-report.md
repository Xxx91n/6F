# R64 T1 返工窗报告——R63 执行批审计打回返工闭环（2026-10-05）

> 身份=**修复/开发子 Agent**（返工窗）；输入=R64 T1 审计窗裁定「不通过·打回返工」（`2026-10-05-r64-audit-report.md`）＋用户指令「重新 LOOP 修复，严肃以第一性原则修复」。
> 修法裁定与验收判据修订已在 D 账本 R64 节报 grill 追认；本报告只载事实与可复跑证据。

## ① Findings → 修法 → 证据 全映射

### P0-1（阻断）84-check CI 浅克隆 born-red → **闭环**
- **第一性判定**：审计三选项中「SHA1 运行时物化」单独不足以根治——浅克隆下 PV-C/PV-D 校验的 72 件「合法指针」是真账本引用的**真历史 commit**（SHA=内容哈希，无法物化），属环境性不可判。落地三件组合：
  1. `engine-ci.yml` checkout `fetch-depth: 0`（止血；golden-ci.yml:41/macro-b-regression.yml:86 先例同型注释）；
  2. B 面探针（`cb625c64…` 字面钉废止→FX.SHA_OK 运行时物化）＋F 面短钉（`da0c25a9`→SHA_OK 8hex 前缀，F03/F08/F11/F17 四处）——materializeFixture 提升为主跑前共享件，零历史依赖面全自足；
  3. 浅克隆检出（`rev-parse --is-shallow-repository`）→C/D/D3/E-TWIN/F10D 面**组级 SKIP 带因**（DOCSCAN group，env-contract `need git-history:full` 首用＋groupProbe 机读行，40-check:B 同型；幻觉探针 …91b 保留原义）。
- **验收判据修订声明**：审计重跑清单期望「浅克隆 34/34」不可达（72 件历史对象），改判据=**浅克隆 0 FAIL＋SKIP 带因＋全克隆 34/34**。
- **commit 后克隆双形态实测**（HEAD=586374a，即返修后工作区顶）：
  - `git clone --no-local --depth 1` → `PASS-COUNT 29 FAIL-COUNT 0`＋`GUARD-RESULT: SKIP-GROUP 84-check group=DOCSCAN reason=env-missing:git-history:full | 原因…手动修复…无网影响面`＋`docscan=SKIP(shallow)`＋**rc=0**（原 born-red 场景 rc=1/newFail=72 → 归零）；
  - 同浅克隆 78-check 对照 **rc=0**；
  - 全克隆同命令 → `PASS-COUNT 34 FAIL-COUNT 0`、无 SKIP、`newFail=0 baselineWarn=5`。
- **engine-ci 触发面**：paths 增 `.scratch/**`＋`docs/adr/**`＋`CONTEXT.md`＋`AGENTS.md`（84-check SURFACE_CLOSED 全部扫描根——审计要求 .scratch/**，本窗扩至完整扫描面；成本=文档类 commit 触发 engine CI，正确性优先）。
- commit：`yrr`（84-check.mjs＋engine-ci.yml 两件精确收清单）。

### P1-1（记账矛盾）fresh-clone 欠账↔已闭环 → **闭环**
- r63-report ②欠账①/⑥表行勘误销账（registry fresh-clone-rerun-watch 第 5 confirmation=闭环实物，决策=fresh-clone-green，复读 HEAD 09c73858 ran=65 green=65）＋#88 CI 面欠账重开条目（本窗即闭）。互斥性恢复；「欠账三要素互斥断言是否立法」留 grill。

### P2-1（三处守卫弱化）→ **闭环**
- `41a-C3`：逐名实现位改行级实物——`Macro-B / Macro-C / Micro-B / Micro-A are in preview` Status 行逐名＋`| Macro-A cross-repo strategy | Not yet in preview |` 矩阵行实物（原全文名词汇匹配，Micro-B 因能力-4 矩阵行恒在=无判别力）。
- `85-A4`：判别臂改序无关正则 `/not_in_preview:[ ]*\[[^]]*'(Micro-A|Macro-C)'/` 不命中（旧负锚仅认列首位，重排即漏）。
- `41b-C2`：恒真臂 `includes('Micro-A=audit --scale Micro-A') === false` 删除，换判别臂=四层在架＋capability 4 of 5＋Macro-A 未上架＋Micro-A 在册（全部对 marketplace description 实文实测命中）。

### P2-2（predecl §1.3 overall band 缺席）→ **闭环**
- 85-check 新增 **E9**：`overall_verdict`＋`preview_disclosure.structural_limitations` 双侧全等（pr64＋pr51）——等值集补位；审计建议的偏差⑦措辞覆盖一并落地（engine PR 面与 48 生成器字节同文，全等成立）。85-check 断言 36→37（63-inventory 1523→1524，update-70-inventory.mjs 唯一路径再生，70-check E1 复验绿）。

### P3-1（两新文件缺尾行）→ **闭环**
- `engine/src/audit/micro-a.ts` 48790→48791B、`engine/test/micro-a.test.mjs` 9266→9267B（各 +0x0A）。**dist 零 drift**：tsc 产物本就带尾行，仅源缺失——engine/dist 不在变更列表，无 bundle commit。

### P3-2（版本未递增）→ **闭环（存疑项裁定=补办）**
- docs/versioning.md §1「minor=契约变更」——本批（#84 Macro-C＋#85② Micro-A 两批）合并追补 **0.1.0→0.2.0**：SSOT=manifest.meta.json（顶层+claudePlugin 双位）→`npm run gen` 再生成 plugin.json×2（`versions aligned PASS`）＋marketplace/package/package-lock 直改＋engine/CHANGELOG `## [0.2.0] - 2026-10-05` 节＋版本 bullet；selftest `manifest readable: 6f@0.2.0`；r14fix C10 标题随改（`[0.1.0] 前区单 Added 段`，断言逻辑不动）；preview tag 留 push 授权窗补挂（GitButler workspace commit 上打 tag 会被重写，不落）。

### 过程违规③（git index staged-D 中间态）→ **开工即修**
- `git reset -- engine/dist`（仅 index 条目复位）：staged-D×2＋pre-R63 stale dist blob（cli.js 310334B 旧包等 4 件 MM）清除；`.atomcode` 两件 staged-A **原样保留**（T3 主权，从未入任何 commit）；修后 micro-a.js/.d.ts sha256 与 HEAD 逐字节核等。裸 `git commit` 陷阱解除。

### 过程违规①（验收形态选取缺失）→ **本窗回应**
- 本窗验收含 CI 形态：返修 commit 后 `--no-local --depth 1` 浅克隆实跑（born-red 原场景）＋全克隆对照，读数见上。立法题（「探测面验收是否必须含消费环境真实形态」＋「--depth/对象可达性入 D-163 探测面分类」）留 grill——handoff 下一轮 grill 方向①②已列。

### 过程违规②（欠账↔闭环未互斥核对）→ 见 P1-1。**过程违规④（lesson 未回检自身）**：本窗返修全程按「结构等值类」清查——84-check 内全部历史钉枚举（SHA1＋da0c25a9×4 处＋…91b 保留位）逐一处置，非仅字面单点。

## ② 验收电池（全部本机实测）

| 项 | 命令 | 读数 |
|---|---|---|
| 编译 | `npm run build` | BUNDLE-OK dist/cli.js，tsc 0 error（macro-audit@0.2.0） |
| 打包 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 373105B / cap 385000B（margin 11895B——cli.js 逐字节不变） |
| 测活 | `node dist/cli.js selftest` | ok=true；manifest readable **6f@0.2.0** |
| manifest SSOT | `npm run gen` | CLEAN plugin.json×2/.mcp.json＋versions aligned PASS＋GEN-OK |
| dist 零 drift | `git status -- engine/dist` | 空（6 件全等，无 bundle commit） |
| 测试闭环 | `npm run smoke`（24 套件） | 全 exit 0——MICRO-A 22/22／MACRO-C 23/23／AUDIT-ZERO-WRITE 4/4 等 |
| 全量守卫 | `guard-all-run.mjs` | **ran=65 green=65 red=0 problems=0 allOk=true** |
| 快守卫 15 件 | 75a/41a/41b/53/r14fix/33/39/44/45/86/70/kit-regex/d179/t8/t9 | 全 rc=0——75a 16/0｜41a 47/47｜41b 33/33｜70 E1 对账 1524 绿 |
| 浅克隆验收 | `clone --no-local --depth 1`→84-check | 29 PASS/0 FAIL＋SKIP-GROUP 带因＋rc=0（原 rc=1） |
| 浅克隆对照 | 同克隆 78-check | rc=0 |
| 全克隆对照 | `clone --no-local`→84-check | 34/34、newFail=0、无 SKIP |

## ③ 派生信号与登记面

- 63-assertion-inventory：1523→**1524** emit sites（85-E9）；75a-census findings=403↔register=403（84-check PROTECTED_SURFACE 同行扩注后行哈希 **a497477f→4efaa0fe** 原位换键，归因 legit-literal/D-094②/D-144② 不变）；33-check 33/33。
- D 账本：新增「第六十四轮返修批收口对账」节（P0-1 修法组合＋判据修订报 grill 追认）；r63-report ②/⑥ 勘误；BACKLOG #85/#88 行尾增补；任务书轮 64 增补＋盘点行 10 扩列 E0~E9。

## ④ 提交清单（but 分批，显式 file-id，收清单逐一核实）

1. `yrr` fix(#88-rework)——84-check.mjs＋engine-ci.yml（2 件）
2. `mok` fix(engine) P3-1/P3-2——10 件（src/test/版本链/CHANGELOG/r14fix 标题）
3. `ynl` fix(guards) P2-1/P2-2——85/41a/41b（3 件）
4. `qpu` bundle 派生再基线——63-inv＋75a findings/register（3 件）
5. docs 收口 commit——D 账本 R64 节＋r63-report 勘误＋BACKLOG＋任务书＋**审计窗两件**（报告/handoff）＋本报告

## ⑤ 债与留痕

- 无新增欠账。#88 CI 面重开欠账本窗即闭（读数=本文 ①P0-1）。
- 待 grill（非执行窗裁定面）：①验收形态选取立法；②git-history 探测面入 D-163 分类（`git-history:full` need 首用，SSOT FIX 模板化待裁）；③欠账↔闭环互斥断言；④P0-1 修法组合与判据修订追认。
- T3 主权面不动：`.atomcode` 两件 staged-A 原样（未入任何 commit）；#90 dist 形态重评票仍待用户/裁定链。
- 过程小事故（自曝）：BACKLOG 行尾追加首版用 `/\|\s*$/` 锚而该表行以 `）` 结尾——replace 静默 no-op 且 hit 标志误置，产生一次「写=原文」的假成功读数；复改改用 endsWith('）') 定位＋写后 grep 复验，+312B 落定。教训=行尾锚先验形态、hit 标志必须由 replace 命中驱动。
