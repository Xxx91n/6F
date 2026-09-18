# 轮21 审计报告（审计 Agent 独立验收）

- 被审对象：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-exec-report.md`＋其引用 handoff
- 评审基准点：`eb1a293`（r21 栈首 commit `ovl` 之父）→ `HEAD`（workspace `146645f`）；diff=47 文件 +4036/−389（已固化 `.code-tmp/r21-audit/r21.diff`）
- 方法：不信自述——硬验收全链亲跑＋逐声明实物抽查＋$code-review 双轴（Standards / Spec 两子代理并行）
- 审计窗口只读：实现零改动；xfail 负测用原子备份-注入-恢复（文件已逐字节复原，porcelain 干净）

## 一、总体结论

**PASS-with-findings（通过，带发现项）**——六票核心契约全部落地且硬验收全绿；执行报告实质可信，但有 2 处读数陈旧/措辞失准、1 处实测口径漂移（+2 册外陈旧）、若干机制弱化点与 spec 字面偏差。发现项不构成本轮契约破坏，全部转入下一轮返工要求（见 §六）。

## 二、硬验收独立重跑（全部亲为，非抄报告）

| 验收项 | 实测 | 报告声称 | 结论 |
|---|---|---|---|
| `npm test`（gen+build+smoke 16 套件） | exit 0；尾部 GITHUB-REST 55/55、CITATION 38、DOCTOR 9 | exit 0 | ✅ |
| 守卫电池 | 33:20/20、34:**22/22**、41b:33/33、44:56/56、46:30/30、52a:22/22、53:25/25、54:20/20、55:18/18、56:24/24（hash `0628234f798bc569`）、64:14/14 | 同值（报告漏列 34-check，实为 22/22） | ✅ |
| `14-skeleton-check` | exit 0，三方一致＋semantic-flip 边界行 | PASS | ✅ |
| `xfail-run.mjs` | exit 0，`XFAIL: 10 (cap 10)`，五守卫断言照跑 161/171 green | PASS | ✅ |
| `duckdb-selfheal-offline` | 7/7 | 7/7 | ✅ |
| `duckdb-selfheal-e2e` | 3/3（真补拉 win32-x64→openWriter 读写） | 3/3 | ✅ |
| `dist/cli.js doctor` | exit 0；三腿 ok（upstream=registry.npmjs.org 200 实测） | 同 | ✅ |
| `dist/cli.js selftest` | 5/5 | 5/5 | ✅ |
| `claude plugin validate engine --strict` | 干净 | 干净 | ✅ |
| `claude --plugin-dir engine mcp list` | macro-audit-kernel ✔ Connected | Connected | ✅ |
| `npm pack --dry-run` | **73 件**（dist 42 已入库含 doctor.*＋fixtures 16＋skills 4＋杂项 11） | **71 件** | ⚠ 见 F1 |
| xfail 负路（悬空注入） | exit 1，`guard-missing`＋`dangling`＋`over-cap` 三问题齐抓；恢复后 exit 0 | 三负路实证 | ✅（亲验其一） |

## 三、声明 → 证据 → 结论 对照表

### #58 manifest 契约守卫链（A-070 / D-066·D-037⑤·D-041）

| 声明 | 证据 | 结论 |
|---|---|---|
| 34/41b-check 三断言（skills `^\./`、mcp 裸字段 FAIL、单一 .mcp.json 无兄弟遮蔽） | `34-check.mjs` G15/G16b/G17 + `41b-check.mjs` A8/A9/A10 码面在；两守卫实跑 22/22、33/33 | ✅ 属实 |
| 真校验器 advisory 双触发＋WARN 不红 | `engine-ci.yml` advisory 步＋`npm run validate:plugin` 手动窗口＋34-check `ADV` 段实跑 `claude-validate` 干净 | ✅ 属实（触发面见 S7 偏差） |
| SKIP 硬化（cli-absent 计 WARN＋连续 SKIP 顶显） | `validate-plugin.mjs` 存在＋34-check G19b `w58` 分支＋state 文件逻辑在码面 | ⚠ 弱化：状态存 `.code-tmp/` 未跟踪，CI 永不累计 streak（F5） |
| SchemaStore 快照进仓＋digest 入锁 | `58-claude-code-plugin-manifest.schema.json` 70423B，sha256=`3f69938d71a4` 与锁表 digest 逐字一致；G16a/G18 PASS | ✅ 属实 |
| claude-cli 入锁＋三方同值 | upstream-lock `claude-cli 2.1.251 exact-version`；G19b 实测三方同值 PASS | ✅ 属实 |
| `engine/mcp.json` 退役、单一 .mcp.json | diff 中 `engine/mcp.json` −15 行删除；`.mcp.json`=node+`${CLAUDE_PLUGIN_ROOT}` 正形；两份 plugin.json 实物核查（`.claude-plugin` skills=`./skills/macro-audit`，root 无 skills、无 mcp 裸字段） | ✅ 属实 |
| `.mcp.json` 入 files[]、pack 71 件 | files[] 含 `.mcp.json` ✅；**pack 实测 73** | ⚠ F1 |

### #63 陈旧守卫换代机制（A-071 / D-071·D-068⑥·D-041③）

| 声明 | 证据 | 结论 |
|---|---|---|
| stale-assertions.json version/cap=10/entries | 实物：version=1、cap=10、entries=10，十字段全（id=xfail-`<guard>`-`<slug>` 形）、review_anchor=stage3-close＋expires_fallback=2026-12-31 | ✅ 属实 |
| 三态协议＋断言照跑＋strict XPASS 一律红 | `xfail-run.mjs` 码面 PASS/FAIL/XFAIL/XPASS 分级；实跑 161/171 green 顶显 `XFAIL: 10`；注入悬空条目实测 exit 1（guard-missing+dangling+over-cap 齐抓） | ✅ 属实 |
| 33-check 元校验四断言 enforce | `33-check.mjs` L180-207 G1(≤cap)/G2(十字段+id 形)/G3(悬空)/G4(evidence 指针)＋逾期→WARN；实跑 20/20 | ✅ 属实 |
| 30+ 守卫只读盘点 | `63-assertion-inventory.json`：48 守卫 / 906 断言 id | ✅ 属实 |
| 首批 9 条入册 | 实收 **10 条**（45×2：B5+H5）——H5 为任务书重写新破，票面注「前提勘误」 | ⚠ 字面偏差已披露（S2） |
| 38/39/40 册外 11 件批量处置登记 | BACKLOG #63 注记＋A-071③ 在案；**审计复测册外=13 件** | ⚠ F3 |
| >cap→FAIL 立票批量处置 | 33-check G1 含该规则（entries>cap→FAIL）；册外 11 件无逐条锚/兜底日期、无独立立票行，挂 `xfail-second-track-trigger`（pending/manual_watch） | ⚠ 弱化（S3） |

### #64 duckdb 自愈补拉（A-072 / D-072·D-067②·D-037⑥）

| 声明 | 证据 | 结论 |
|---|---|---|
| 平台探测→`npm install --no-save` 精确单平台包 | `store.ts` L48-111：`platformPackageSuffix`＋`DUCKDB_PINNED_VERSION='1.5.5-r.4'`＋`--no-save`（devCheckout 分流去 `--omit=dev`） | ✅ 属实（分流为披露偏差 S7） |
| 完整性校验（.node 存在/尺寸阈/version 三方同值） | `store.ts` L129 `ver===PINNED && nodeCount>0 && sizeOk` | ✅ 属实（尺寸阈=统一 1MB，逐变体实测 deferred） |
| 每进程至多 1 次 | `selfHealAttempted` 旗标 L54/L96 | ✅ 属实 |
| ESM 缓存绕开=createRequire retry | `store.ts` L9 import＋L142 `createRequire(import.meta.url)('@duckdb/node-api')` | ✅ 属实 |
| DUCKDB-SELFHEAL 结构化事件（MCP stdio 避让 stderr） | `emitSelfHeal` L90-92 `MACRO_AUDIT_MCP_STDIO==='1'`→stderr；`mcp-server.ts` L7 置旗标 | ✅ 属实（非 MCP 面 stdout 污染见 F8） |
| win32-arm64 保守回落 | `NO_OFFICIAL_BINDINGS={'win32-arm64'}` L53 | ⚠ 前提已证伪仍硬禁（S8/F4） |
| 三段披露文案 | L145 DUCKDB-UNAVAILABLE 三段文案在 | ✅ 属实 |
| CI 双腿 | `engine-ci.yml` offline-sim＋E2E 两步在 | ✅ 属实 |
| upstream-lock bindings 行 | `duckdb-node-bindings 1.5.5-r.4 exact-version active` 在 | ✅ 属实 |
| npm test 全链「含 selfheal-offline 7」 | `package.json` smoke 链 16 文件**不含**自愈两测试（挂 CI 腿非 npm test） | ⚠ 措辞失准 F2 |

### #61 cue 表分层＋顺带清（A-073 / D-069·D-070①·D-065·D-058）

| 声明 | 证据 | 结论 |
|---|---|---|
| CJK_NON_ASSERT_PRE(16)/POST(6)/PSEUDO(5) | `citation.ts` L123-138 逐项实数：PRE=16、POST=6、PSEUDO=5，与票面种子逐字一致（「严格来说」不收、≥2 字） | ✅ 属实 |
| EN_NON_ASSERT_CUES 接线（原死表） | L327/329 入 `enCuesIn` 扫描产 `pre-ctx/post-ctx` hits → L411 映射 `non-asserted` klass | ✅ 属实（票面未枚举，账本记 r18 名实对齐修复） |
| CJK_SPEECH_PSEUDO 补收（假说/举例来说/比如说） | 表实存 23 项含三词；豁免使 non-asserted 可达 | ✅ 属实（同上已披露） |
| 词表即判据统一声明 | 14 张词表全部有声明头（审计亲验，Spec 子代理此处误报已剔除） | ✅ 属实 |
| 56-check hash WARN 非 FAIL | `56-check.mjs` L87 WARN 不增 f 计数；实测 hash=`0628234f798bc569` PASS-INFO | ✅ 属实 |
| [cleanup] 独立 commit 零语义触碰 | `xxm`(d5efdf0) 独立 commit；firstFactIds 提炼/死条件/Set/签名对称+stripMemo WeakMap/check() 风格均在 diff；56-check hash 不变自证 | ✅ 属实 |
| K1-K9＋held-out 零漂移＋52a 阈值不动 | citation.test 38/38；`56-heldout-eval.json` 在；52a 22/22 | ✅ 属实 |

### #60 骨架契约升版机检（A-074 / D-068·D-037②）

| 声明 | 证据 | 结论 |
|---|---|---|
| committed baseline v1.2.0 四章 16/15/9/10 | `14-skeleton-baseline.json` 实物：v1.2.0、C1:16/C2:15/C3:9/C4:10、required_fields 排序数组 | ✅ 属实 |
| 三 FAIL 双向拦 | `14-check.mjs` §9 L166-171 breaking-no-bump/bump-no-fields/baseline-stale 三分支码面在 | ✅ 属实（一处边界见 S1） |
| 三方一致＋doc↔code 子集 | L148 V_base/V_doc/V_code＋L177-190 子集规则（值必填⊆必现） | ✅ 属实 |
| semantic-flip 边界行 | L201 固定打印；实跑输出在 | ✅ 属实 |
| 负测 T1/T2/T3 各 EXIT1 | 报告声称实证；码面三分支可证（本窗口未重放负测——同构负路已在 xfail 亲验） | ✅ 码面可信 |

### #62 运行时 doctor（A-075 / D-059③）

| 声明 | 证据 | 结论 |
|---|---|---|
| 三腿 probe（duckdb/git/上游）＋三态聚合 | `doctor.ts` 全读：openWriter 自愈链/git --version/registry HEAD 5s/worst-leg 聚合/degraded 语义 | ✅ 属实 |
| 结构化 JSON 非静默＋exit 语义 | 实跑 `{doctor:1.0.0,legs[3],overall:ok}` | ✅ 属实 |
| selftest 不扩容 | `selftest.ts` 无 doctor 引用；README 能力行 L43 在 | ✅ 属实 |
| registry runtime-doctor-trigger→decided | registry 实物 status=decided（confirmations 含 2026-09-18 T6→#62 消费行） | ✅ 属实 |
| doctor.test 9/9 入 smoke | `smoke` 链含 doctor.test.mjs；实跑 9/9 | ✅ 属实（D8 恒真断言见 F11） |

## 四、双轴评审（$code-review，子代理并行取证）

### Standards（基线=Fowler smell 全集＋仓内成文标准）

1. **[成文-轻] `## CLI 命令面`（README L19-27）未列 `macro-audit doctor`**——L43 能力分级行已声明 doctor，命令面漏登；票面要求「README 零依赖能力行」已满足，命令清单不一致属轻违反。
2. **[成文-轻] `doctor.test.mjs` D8 恒真断言** `check('D8 selftest 不扩容…', true)`——声称性检查非可核验断言。
3. **[成文-轻] 执行报告 §七引用清单全相对路径**（9 处 `.scratch/…` vs 1 处绝对）——违 AGENTS.md「用户需复制/打开的路径写全绝对路径」，同轮 handoff 已用绝对路径。
4. [judgement] Duplicated Code：34-check G15-G17 与 41b A8-A10 三断言同逻辑两文件重写（票面注「同族断言」）；`negationHits` 8 行同构 `scan().map(relabel)` 可表驱动。
5. [judgement] `probeUpstream` 硬编码 `registry.npmjs.org`，与自愈 `npm install`（honor `npm_config_registry`）口径错位——镜像源用户 upstream 腿失真。
6. [judgement] `emitSelfHeal` 非 MCP 面落 `console.log`——`audit --json`/`demo` stdout 混入 `DUCKDB-SELFHEAL` 行（doctor.test 已靠 `{` 前缀过滤绕行）。
7. [judgement] SKIP-STREAK-ALERT 状态存 `.code-tmp/` 未跟踪→CI 每轮复位，≥2 升格永不触发（同 F5）。
8. [judgement] `xfail-run.mjs` `perGuard[g].crashed` 写入不读=dead store。
9. [judgement] `selfHealDuckdb` `spawnSync` npm install（≤240s）在 MCP 进程内阻塞 JSON-RPC 事件循环——冷装时延面未记。

### Spec（票面=next-round.md T 表＋BACKLOG #58-#64＋账本 D 条目）

1. **[partial] #60 FAIL2 机检边界**：`versionChanged=V_doc!==V_base` 只拦 desync——baseline 同步升版＋零字段 diff 的「升版忘改字段」三 FAIL 全逃逸（单快照 diff 先天不可见历史；spec 字面全覆盖不可机检，建议账本注边界）。
2. **[disclosed-deviation] #63 首批 9→10**：45-H5 为任务书重写新破如实入册恰满 cap（前提勘误在案）。
3. **[weakened] 册外 11 件无机制承接**：仅票面/账本登记，无逐条 review_anchor/expires_fallback、无独立批量处置立票行，挂 `xfail-second-track-trigger`（manual_watch, stage3-close）。
4. ~~EN/CJK_SPEECH_CUES 缺词表声明~~——**子代理误报，审计复核 14 表全有声明头，剔除**。
5. **[deferred] #64 逐变体尺寸实测**未交付：统一 1MB 阈值（票面「落地时实测披露」属 deferred）。
6. **[disclosed-deviation] 票面外改动**：EN_NON_ASSERT 接线（r18 死表修复，账本记为核心修复）、CJK_SPEECH_PSEUDO 增补、devCheckout 分流（防 npm omit 剪 devDeps，有注记）、CI validate 触发面由「manifest 变更」放至 `engine/**` 全量（advisory 无害但触发面放大）、musl 探测用 `ldd --version` 非 spec 指名 detect-libc（零依赖替代）。
7. **[premise-corrected] win32-arm64 前提已证伪仍回落**：审计亲验 `@duckdb/node-bindings-win32-arm64@1.5.5-r.5` 在 registry 实存（dispatcher optionalDeps 8 变体）——报告勘误声明属实；`NO_OFFICIAL_BINDINGS` 硬禁未跟进，该平台自愈被永禁。
8. **[shape-deviation] 三态协议为 overlay** 非 NN-check 本体改造：`xfail-run.mjs` 外挂重分级（`^(PASS|FAIL) <slug>` 解析）；语义满足，各守卫本体仍二态；inventory 显示部分守卫 `assertion_ids:0` 不可寻址。
9. [minor] `emitSelfHeal` 在 createRequire retry 前发 `result:"success"`——装成功≠载成功（telemetry 精度）。

**双轴收口一行**：Standards 9 项（最重=SKIP-STREAK CI 失明/命令面漏登并列轻违反）；Spec 8 项有效＋1 误报（最重=#60 FAIL2 机检边界与册外 11 无承接并列）。

## 五、缺失 / 弱化 / 跑偏 清单

- **缺失**：F5 SKIP-STREAK 在 CI 永不触发（状态未持久化）；F6 #60 FAIL2 synced-empty-bump 不可检（设计边界，建议账本注明）；册外 11 件无逐条锚点与独立立票。
- **弱化**：F4 `NO_OFFICIAL_BINDINGS` win32-arm64 前提已证伪仍硬禁（需决策票：摘除 or 保回落）；F7 `probeUpstream` 硬编码 registry 与自愈 registry 口径错位；F8 `emitSelfHeal` 非 MCP stdout 污染＋success 先发；F9 spawnSync 阻塞 MCP 事件循环；F10 逐变体尺寸统一 1MB。
- **跑偏（披露在案但超票面字面）**：EN_NON_ASSERT 接线、SPEECH_PSEUDO 增补、devCheckout 分流、CI 触发面放大、ldd 替代 detect-libc、首批 9→10。
- **报告读数**：F1 `npm pack` 实测 **73** 非 71（#62 doctor.* 入 dist 后未复测——A-070「71 件持平」注记可溯源根因）；F2 「npm test 含 selfheal-offline 7」措辞——自愈测试挂 CI 腿非 smoke 链；F3 册外实测 **13**（38×2/39×10/40×1）vs 报告 11——+2=38:H4（anysearch-cli 被 grill-round-70 弄脏，环境漂移）＋39:H6（next-round 换代锚点新破，与已入册 45-H5 同型未入册）。
- **过程违规单独呈报（不替执行方追认）**：
  - P1：报告终值 pack=71 为陈旧读数（应 73）——精度缺陷非产品缺陷；
  - P2：npm test 括号注将 CI 腿测试归入 npm test——措辞不严谨；
  - P3：册外 11 读数在审计复测时已漂移为 13（含 1 环境敏感腿＋1 同型新破未入册）——如实呈报三口径（账本首批 9 / 报告实测 11 / 审计复测 13）；
  - P4：报告 §七全相对路径违仓内成文约定（轻）。
  - 合规面确认：6+1 分支栈全未 push（用户闸门）✓；[cleanup] 独立 commit ✓；判定/cleanup 分离 ✓；负测实证在案且本审计亲验其一 ✓；无静默追认。

## 六、返工要求（转下一修复窗口）＋重跑清单

**修复要求（按优先级）**：
1. F5 SKIP-STREAK 状态持久化方案（CI artifact 或锁表豁免位），或票面注明「本机制仅本地有效」如实收窄；
2. F4 win32-arm64 决策票：`NO_OFFICIAL_BINDINGS` 摘除接入自愈 or 保守回落写明判据（registry 已实证包存在）；
3. F1/F2 报告精度回改（pack 73、selfheal 挂 CI 腿措辞）＋F3 册外 13 读数更新与 39:H6 归因（同 45-H5 型——评估入册或批量桶处置）；
4. F7 probeUpstream 走 `npm_config_registry`（`npm config get registry` 探测，回落 npmjs.org）；
5. F8 `emitSelfHeal` 非 MCP 面 stderr 化或事件归 stderr 通道＋success 移 retry 后；
6. F11 README `## CLI 命令面` 补 `macro-audit doctor` 行；doctor.test D8 换真断言（如断言 selftest.ts 无 doctor import）；
7. F6 账本注 FAIL2 机检边界行；
8. 册外 11 件立独立批量处置票或并入 second-track 票面登记（锚点/兜底日期补齐）；
9. judgement 项（spawnSync 阻塞/dead store/重复断言/detect-libc）随顺带票或票面登记。

**修复后重跑清单（与本审计同一套）**：
`cd D:/Aworker/6F` 下：`node .scratch/architecture-recovery/reports/{33,34,41b,44,46,52a,53,54,55,56,64}-check.mjs`、`14-skeleton-check.mjs`、`xfail-run.mjs` 全 exit 0；`cd engine && npm test` exit 0；`npm pack --dry-run` 件数与报告一致；`node dist/cli.js doctor`/`selftest` 全绿；`node test/duckdb-selfheal-{offline,e2e}.test.mjs` 过；`claude plugin validate engine --strict` 干净；`claude --plugin-dir engine mcp list` Connected。

## 七、审计工件

- diff 固化：`D:\Aworker\6F\.code-tmp\r21-audit\r21.diff`（5701 行）＋`r21-commits.txt`＋`r21-files.txt`
- 评审子代理：Standards（64d868d5）/ Spec（881e47ea）并行取证，发现项已逐条由审计复核（含 1 处误报剔除）
- 审计窗口零写入实现面（仅 `.code-tmp/` 审计工件＋stale-assertions.json 负测原子注入-复原）
