# 轮 22 审计报告（R22 AUDIT — macro-audit / architecture-recovery）

- **日期**：2026-09-18（审计窗独立会话）
- **审计对象**：`.scratch/macro-audit/reports/2026-09-18-report.md`（轮 22 执行报告）＋分支 `r22-impl-ledger` diff `b55a4d8..HEAD`（impl `6d02c1a`＋ledger/docs `1d31e9c`）
- **审计方法**：①硬验收不信自述全亲跑；②每条关键声明实物抽查（rg/文件存在性/git 历史）；③`$code-review` 双轴（Standards＋Spec 子代理并行）；④D-xxx 逐条对账本与实现；⑤过程面单独呈报不追认
- **判定**：**PASS-with-findings → 打回返工 R1/R2/R3**（硬验收全绿、实现忠实于 D-073~D-078 与 BACKLOG #65~#68；但含 1 项实测功能缺陷＋1 项潜伏崩溃＋报告枚举失真，按职责分离呈报不修）

## 一、硬验收亲跑对照（声明 → 证据 → 结论）

> 全部命令由审计窗重跑，exit 码实测。✅=声明属实；⚠=字面真但口径漂移。

| # | 声明 | 审计实测 | 结论 |
|---|---|---|---|
| 1 | `npm run build` exit 0 `BUNDLE-OK dist/cli.js` | exit 0，`BUNDLE-OK dist/cli.js` | ✅ |
| 2 | `npm pack --dry-run` 73 件 785.2kB | **73 件**、785.5kB、sha512 integrity | ✅（体积 ⚠+0.3kB 漂移） |
| 3 | `selftest` ok:true 5/5 | `{"ok":true}` 5 检查全 pass | ✅ |
| 4 | `doctor` overall=ok 三腿 | duckdb/git(2.55.0)/upstream(200) 全 ok，exit 0 | ✅ |
| 5 | `audit` 自仓 385 facts/21 ADR/202 commits/supported | **385 facts**/21 ADR/supported/exit 0 | ✅（commits ⚠实测 204=202+osq+workspace 漂移） |
| 6 | `npm run smoke` 17 套件全绿 | exit 0；smoke 链 17 个 .mjs 实物数=17；尾段 CITATION 38＋DOCTOR 9＋AUDIT-ZERO-WRITE 4/4 | ✅ |
| 7 | offline 13/13（A面7＋B面5＋复原1） | 13/13 PASS exit 0（非TTY零SELFHEAL＋opt-in fallback） | ✅ |
| 8 | e2e 3/3（opt-in 真补拉→HEALED） | 3/3 PASS exit 0（真拉 r.5→包目录复在） | ✅ |
| 9 | 守卫电池全 exit 0（12+骨架+xfail） | 33:23/23｜34:23/23｜38:34/34｜41b:33/33｜44:59/59｜46:30/30｜52a:22/22｜53:25/25｜54:20/20｜55:18/18｜56:24/24｜64:15/15｜14-skeleton PASS｜xfail-run `SEALED: 15`＋`XFAIL: 8 (cap 10)` exit 0 | ✅ 逐数一致 |
| 10 | validate 三面（本地→PASS／absent→SKIP+streak／CI+absent→INFO） | PASS／`SKIP streak=1`／`INFO cli-absent-expected` 三态实测 | ✅ |
| 11 | doctor --fix 实测三腿 ok | **绑定缺席面实测：heal=success＋包落盘，但 duckdb leg=fail「装成功但加载失败」，overall=fail exit 1**；二次运行（新进程）三腿 ok | ❌ **R1：声明仅在健康机成立——--fix 主路在目标场景必报 fail** |

## 二、D-xxx 逐条核对（账本 → 实现证据 → 结论）

| 决策 | 账本要求（原文摘） | 实现证据 | 结论 |
|---|---|---|---|
| D-073 | sealed=显式退役非 archived：attestation 固化＋移出执行集＋SEALED 顶显＋不占 cap | attestation.jsonl **15 行**（字段 fired_at/last_fired_commit/evidence/disposition/decision/migrated_to/env_dependency/attribution 全）；5 守卫 `sealed()`+`// acceptance-probe: sealed` 头标；xfail-run `SEALED: 15`＋entries=8/10；33-check G5/G6/G7 在 | ✅ 落实 |
| D-074 | 测工具不测环境：活契约腿→fixture（mkdtemp 因果可归因）挂 smoke 非停测 | `engine/test/audit-zero-write.test.mjs` 在（mkdtemp 玩具仓＋facts 防 vacuous＋porcelain 零写入＋HEAD 稳定）；smoke 链第 17 件；migrated_to 指针 8 行（46-check A1/A8/A14/B1、41b C1、fixture slug 均活锚） | ✅ 落实 |
| D-075 | 谁在看屏幕：CLI 交互面 auto＋stderr 预告；MCP/CI 永不自动拉包→四段披露＋opt-in；doctor --fix=唯一主路 | `duckdbSurface()` store.ts:62-66 三面逐字吻合；trigger auto|opt-in|null 门控；四段披露文案在；`healDuckdbBinding()` 复用全逻辑＋createRequire 验载；pin `1.5.5-r.5` 四方同值（store/pkg/lock×30/upstream-lock）；`NO_OFFICIAL_BINDINGS` 摘除（64-check A5 机检）；cmd.exe 数组包装×2；F7 `npm config get registry` 回落 npmjs.org | ⚠ 落实但 **R1**：--fix 复载走 `import()` 同 specifier 违自家 A-072 约束 |
| D-076 | 四触发器维持＋挂账（缺三要素不 revised） | registry `33-gate-registry.json` 47 项：git-iso/sql-strip/dist-in-repo/cue-table 复用各在案 | ✅ 落实 |
| D-077 | 预期缺席≠异常缺席：CI→INFO neutral；本地 SKIP 收窄；receipts 证据人工翻转 | `MACRO_AUDIT_CI` 在 validate-plugin＋engine-ci.yml validate 步注入；`INFO cli-absent-expected` 三态实测零 state 消费；`state.json mode=local-observation-only` 未跟踪；receipts.jsonl append-only {at,cli_version,verdict,output_digest}；registry promotion-watch 标 D-077 修订 manual_watch 语义 | ✅ 落实 |
| D-078 | dimension:null=防腐层留白；映射只落文档面；准入条件列；rate_limit 永排 | `docs/upstream-dimension-map.md` v0.1 五节＋准入条件列＋rate_limit 永久排除行＋S5↔S4 双挂＋复审两字段；descriptor `dimension: null`＋注释指针×2（github-rest.ts:35/codelore.ts:17）；上游文件 `S[1-5]` 零命中；44-check A14/A15/A16 | ✅ 落实 |
| D-071③注 | 「断言照跑」划界=活契约条目 | A-076 显式约束②在账；sealed 移出执行集＋attestation 固化语义一致 | ✅ 落实 |
| D-067⑧ | push 后真机验收随闸门 | 值守项 status quo（分支未 push） | ✅ 无翻转 |
| D-066③⑥注 | 41b 同型 SKIP 一并分层＋scoped 勘误 | 34-check G19c 在；A-078 约束⑤「INFO 前缀天然不计 warn58」 | ✅ 落实 |
| D-068注 | FAIL2 机检边界注记（versionChanged 只拦 desync） | r21-exec-report §八 F6＋账本 D-068 勘误在 | ✅ 落实 |
| D-037⑥ | pin 三方同值纪律 | r.5 四方（store/package.json/package-lock/upstream-lock）＋64-check C4 | ✅ 落实 |
| D-041 | registry 值守复核 | 47 项/31 事件在案（33-check COVERAGE 行佐证） | ✅ 无翻转 |
| D-035 | 不得裸挂——接线票挂依赖 | A-079 约束⑤接线票依赖声明在 | ✅ 落实 |
| D-020 | T4 覆盖列（上游适配器面） | 映射表含双适配器逐行 | ✅ 落实 |
| ADR-0004 | 五维不动=facet enrichment 非扩维 | 映射表定位节明写；无 S 维新增 | ✅ 落实 |
| ADR-0014 | 防腐层 descriptor 留白 | dimension:null 保留＋指针注释 | ✅ 落实 |
## 三、双轴评审聚合（$code-review）

固定点 `b55a4d8`；diff=`b55a4d8..HEAD`（57 件含 dist/lock；评审面=src/test/scripts/docs/checks）。两轴只读子代理并行，结论分列不合并不排序。

### Standards 轴
- **硬违规①**：`xfail-run.mjs` 互斥机检 `if (overlap0.length) problems.push(...)` 位于 `const problems = []` **之前**——overlap 触发日即 ReferenceError 崩溃而非结构化 FAIL（今休眠，exit 仍非零=fail-closed 但丢诊断）。→ **R2**
- **硬违规②**：报告 §三 sealed 枚举与 attestation 实物矛盾（见 R3）；报告同日文件名覆盖轮 20 执行报告（见 P1）。
- 假阳性已核销：子代理疑 attestation 未入仓——实已随 `6d02c1a` 提交（`git ls-files` 实证；系评审用 diff 排除 `*.jsonl` 所致的可见性缺口，非实现缺漏）。
- smell（judgement calls）：`sealed()` ×5 守卫逐字复制（自包含守卫惯例豁免，低优）；cmd.exe 包装 ×2（store.ts npmSpec / doctor.ts probeUpstream）；heal→createRequire 验载序列 ×2（loadDuckdb catch / healDuckdbBinding）；xfail-run attestation 解析无 try/catch（33-check 有 attBad 兜底——不对称）；xfail-run 执行面由 entries 派生→38/50 零条目不 spawn（emit 盲区，33-check G5 静态兜底）。

### Spec 轴
- **缺失/部分**：`doctor --fix` 复载 `openWriter→loadDuckdb→import()` 同 specifier——审计窗实测复现（**R1**，违 A-072「import() 失败缓存实证勿用同 specifier」）；BACKLOG #66④ 字面「增 doctor.bindings 检查项」未立独立检查腿（A-077 规范化未收＋追问留票「opt-in doctor 回显」——疑有意顺延，按票面字面记部分）；`rewrite-pending` 兜底路径未演练（今合规——全部 15 行干净闭包）。
- **超范围**：零——41 文件全部映射 T1~T5 或常规簿记；无 B 轨/市场/listing/push 闸门/#52b 触碰；registry 翻转（promotion-watch manual_watch／second-track triggered-bound bound_to=#65）在 grill 收口 commit `b55a4d8` 已落，正确不属本 diff。
- **实现存疑**：39-F2 恒真活断言（jiahao `macro-b-regression.yml` 已按 D-046 撤除→`wf=''`恒真过）——同 superseded 族漏网（分拣输入=FAIL 集，恒真型逃逸）→ **P2**；TTY 面 auto 先耗 once-per-process 使 --fix 同进程报 already-attempted（设计后果，可注明）；`readState()` 在 CI/INFO 路仍读（「零 state 消费」仅指写——无害）。

## 四、发现清单（分级呈报）

### A. 打回返工项（必修——附修复要求与重跑清单）

**R1 `doctor --fix` 复载死路（功能缺陷，实测复现）**
- 现场：`engine/src/doctor.ts:48-55`——heal 成功后 `await openWriter(db)` → `loadDuckdb()` → `import('@duckdb/node-api')` 同 specifier。绑定缺席面首次 `import()` 失败被 Node ESM 模块表缓存；`loadDuckdb` 虽复位 `duckdbModulePromise=null`，第二次 `import()` 仍回弹缓存失败态。
- 实测（本审计窗，绑定目录 park 后）：`DUCKDB-SELFHEAL {result:"success", trigger:"doctor-fix"}`＋`installed @duckdb/node-bindings-win32-x64@1.5.5-r.5` → duckdb leg `fail`「doctor --fix 装成功但加载失败：DUCKDB-UNAVAILABLE…」→ overall=fail **exit 1**；新进程复跑 doctor → 三腿 ok（workaround 成立）。
- 定性：违自家约束「ESM retry 必走 createRequire（import() 失败缓存实证，勿用同 specifier）」（A-072/A-077 约束①）；--fix 恰是 MCP/CI 面唯一恢复路径（该面无 auto），目标场景必报 fail。报告「doctor --fix 实测三腿 ok」系健康机所测（绑定在位时 fix 分支未触达）——字面真但验证对象为空。
- 修复要求：复载不走同 specifier `import()`——以 `createRequire` 验载结果为准（`healDuckdbBinding` 已内置该验载），或令复载经 createRequire 通道/对 duckdbModulePromise 回填已验载模块；修复后 `--fix` 须在同进程报 leg=ok。
- 测试要求：offline/e2e 增 --fix 面断言（绑定缺席→`doctor --fix`→同进程 leg=ok＋exit 0）——现测试矩阵恰缺此面（offline 测 loadDuckdb 门控、e2e 走子进程，--fix 同进程复载无人看守）。
- 重跑清单：`npm run build`＋offline（13/13+新增断言）＋e2e 3/3＋绑定缺席面 `doctor --fix` leg=ok exit 0＋64-check＋smoke＋`doctor` 三腿 ok。

**R2 `xfail-run.mjs` use-before-declare（潜伏崩溃）**
- 现场：互斥机检 `if (overlap0.length) problems.push('entries-sealed-overlap:'+…)` 在 `const problems = []` 声明之前——entries∩sealed 非空日即 `ReferenceError`（恰在该检查该 firing 时崩），丢诊断但 exit 非零（fail-closed）。
- 修复要求：`const problems = []` 声明上移过该检查点（序调换一行）。
- 重跑清单：`xfail-run` exit 0＋33/34/38/41b/44/46/52a/53/54/55/56/64 电池＋构造临时 overlap 行验证 FAIL 行如实输出而非崩溃（验证后还原）。

**R3 报告/账本枚举失真勘误批（文档面）**
- 失真清单（实物=`acceptance-probe-attestation.jsonl`＋`stale-assertions.json`＋git 基态）：
  ① 报告 §二 T1 双锚枚举「39:ecdc015/40:65e188e」——实物 39=`b1d71c6`、**无 40 行**（40:G5 走 active 入册非封存；ecdc015/65e188e 二 SHA 虽为真 commit 但非该守卫锚）；
  ② 报告 §三 sealed 枚举「38:H4/H5、40:H2、t8:H1」——实物 `38:E3/H4`、无 40 行、`t8:A3`；枚举条数 16 与自称「15 行」自相矛盾；
  ③ 报告 §二 T1 及 A-076 规范化需求栏 active-8 枚举含「t8:H3」——实物为 `45:B5`（上轮即在册，git `b55a4d8`/`11e0de8` 基态实证）；t8 的 slug 实为 A3 已封存。
- 修复要求：沿用 T5 勘误惯例「原文读数保留＋勘误成对落盘」——报告 §二/§三与 A-076 需求栏按 attestation/stale-assertions 实物成对勘误；不得静默改写历史读数。
- 重跑清单：33-check G5-G7（attestation↔sealed 闭包未动，勘误不触碰执行面）＋文档面引用一致性人工复核。

### B. 过程面呈报（不追认，呈用户裁）

- **P1 报告同日撞名覆盖**：`.scratch/macro-audit/reports/2026-09-18-report.md` 整文覆盖轮 20 执行报告（#59/A-069 票档，git 历史 41bf360/7bbb230 可恢复）——`2026-09-18-r21-exec-report.md` 已立 `-rNN-` 轮次后缀先例而本报告未沿。本审计报告命名已循后缀先例。
- **P2 恒真断言漏网**：39-F2 读已撤除的 jiahao workflow→恒真过（同 superseded 族，分拣输入=FAIL 集故逃逸）。建议下轮把 sealed 判据自「失效」扩到「失效∨恒真不可证伪」候选面复核。
- **P3 未提交残留**：`engine/package.json` 尾换行 diff（琐碎，建议随返工 commit 收编或丢弃）；`.scratch/architecture-recovery/reports/48-*`/`56-heldout-eval.json` 12 件金样脏树——registry `golden-verifier-dirty-on-rerun` 在册观察项解释成立（本审计重跑电池亦再生产脏树，属已登记现象非新违规；审计窗状态该批脏树审计前已存在）。
- **P4 良性漂移登记**：pack 785.5kB vs 785.2；audit commit_count 204 vs 202（osq+workspace commit 所致）；receipts 行数 4→8+（append-only 正常累积＋本审计 3 面各追加）。

### C. 观察项（judgement，不阻）

- `sealed()` ×5 复制（自包含守卫惯例）；cmd.exe 包装 ×2；heal-verify 序列 ×2——如接受提取可另立重构票，非本轮范围。
- xfail-run emit 盲区（38/50 零条目不 spawn）；attestation 解析无 try/catch（对 33-check attBad 兜底不对称）。
- TTY 面 `doctor --fix` 同进程 once-per-process 被 auto 先耗——设计后果，建议 README/doctor 输出注一句。

## 五、审计自身留痕（诚实登记）

- 本审计窗只读代码＋跑命令，未改任何源码/账本/报告/测试（职责分离）。
- 副作用登记（均设计内＋未跟踪面）：`engine/.code-tmp/audit-r22-verify/`（本审计产物：audit 输出＋r22-src.diff）；validate 三面实测追加 receipts 3 行＋state streak=1；doctor --fix 实测经真补拉 r.5（绑定目录 park→拉→复原核实，现场已恢复）；守卫电池重跑再生产金样脏树（P3 已呈报）。
- 子代理产出：Standards/Spec 两轴评审均为本审计委托的只读子代理；其疑 attestation 未入仓一条经我核销为假阳性。

## 六、结论与处置

- **判定**：PASS-with-findings——硬验收 11 项中 10 项全属实，1 项（doctor --fix）字面真但目标场景实测必 fail；实现与 D-073~D-078/BACKLOG #65-68/A-076~A-080 逐条吻合无跑偏无缩水；范围零蔓延；T6~T9 值守面无未授权动作。
- **处置**（职责分离——审计窗不修）：打回修复窗返工 **R1＋R2＋R3**；修完按 §一同一套验收重跑＋§四A 专项（绑定缺席面 `doctor --fix` leg=ok exit 0＋xfail overlap 注入冒烟）。
- **不替我追认**：P1~P3 过程面单独呈报，由用户裁定是否并要求修复窗一并收编。

## 七、引用文件清单

- 审计产物：`D:\Aworker\6F\engine\.code-tmp\audit-r22-verify\`（audit 输出＋r22-src.diff）；本报告 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r22-audit-report.md`
- 被审对象：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-report.md`、`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`、`D:\Aworker\6F\.scratch\architecture-recovery\BACKLOG.md`（#65~#68）、`D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md`（R13 A-076~A-080）、`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（D-073~D-078）
- 实现面：`engine/src/fact/store.ts`、`engine/src/doctor.ts`、`engine/src/cli.ts`、`engine/src/upstream/{github-rest,codelore}.ts`、`engine/scripts/validate-plugin.mjs`、`engine/test/{audit-zero-write,duckdb-selfheal-offline,duckdb-selfheal-e2e}.test.mjs`、`.scratch/architecture-recovery/reports/{xfail-run.mjs,stale-assertions.json,acceptance-probe-attestation.jsonl,33/34/38/39/41a/44/50/64/t8-check.mjs}`、`docs/upstream-dimension-map.md`、`.github/workflows/engine-ci.yml`