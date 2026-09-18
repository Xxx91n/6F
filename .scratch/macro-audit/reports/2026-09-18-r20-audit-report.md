# 轮 20 T1 审计报告 — #59 kernel 自包含分发修复复审（2026-09-18 · 审计窗 · 目标 commit lvr+prs / 分支 r20-59-kernel-selfcontained）

## 裁定

**打回小修返工（conditional pass）**：功能交付全部亲历实证为真（硬验收 4 件全过＋真机等价环 Connected＋降级仿真逐字复现），D-067 八子项与四件用户验收无缺失项；但检出记录准确性缺陷 3 处、D-037⑥ 文内义务缺口 1 处、CI 惯例面 3 处、守卫总账披露不完整 1 处——修复量小、均为文档/惯例面，不涉及判定逻辑返工。修复后按 §8 重跑清单复验即可终裁。

## 1. 硬验收亲历重跑（不信自述，全部本地实跑）

| 验收件 | 命令 | 本窗实测结果 | 结论 |
|---|---|---|---|
| A 编译 | `npm run build` | `tsc -p tsconfig.json && node scripts/build-bundle.mjs` → `BUNDLE-OK dist/cli.js`；**重建后 `git status --porcelain -- engine/dist` 零输出**（产物确定性，rebuild-diff 语义自证） | ✅ |
| B 打包 | `npm run package` | `npm pack --dry-run` → **71 files / 167.0 kB** / macro-audit-0.1.0.tgz | ✅ |
| C 启动测活 | `node dist/cli.js selftest` | `{"ok":true,checks:[...5/5 pass]}`；`--version` JSON 正常；`demo --list` 三场景 | ✅ |
| C′ MCP 握手 | spawn `node dist/cli.js mcp` + JSON-RPC | initialize → `protocolVersion=2024-11-05` `serverInfo={"name":"macro-audit","version":"0.1.0"}`；tools/list → `facts`；tools/call facts(db 实档） → 真 fact 行返回 | ✅ |
| D 每平台 test 闭环 | `npm test` | gen GEN-OK（4 产物全 CLEAN 幂等）＋build＋15 smoke 套件全绿 exit 0 | ✅（本机；CI 远端随 push 闸门内，报告如实登记） |
| 真机验收⑧ | `claude --plugin-dir D:/Aworker/6F/engine mcp list` | `plugin:6f:macro-audit-kernel: node D:/Aworker/6F/engine/dist/cli.js mcp - ✔ Connected`（claude 2.1.251/Windows，本窗实测复现） | ✅ 等价环 |
| 校验器顺带 | `claude plugin validate engine --strict` | `Validation passed` | ✅ |
| 零依赖降级仿真 | 全量插件目录拷贝（无 node_modules）至 .code-tmp/r20-audit/plugin-sim | `--version`/`selftest` 5/5/`demo --list`/MCP 握手全通；facts → `isError:true` `MCP-FACTS-ERROR: DUCKDB-UNAVAILABLE…npm install 后恢复`（结构化降级非崩溃） | ✅ |

## 2. 声明 → 证据 → 结论 对照表（报告 §① 12 行逐条）

| # | 报告声明 | 本窗实物证据 | 结论 |
|---|---|---|---|
| ① | `.mcp.json` command=node + args=[${CLAUDE_PLUGIN_ROOT}/dist/cli.js, mcp]；gen 单源幂等 | cat .mcp.json 逐字符合；gen-manifests.mjs:19 单源生成（mcp.json 兄弟保留 bare `macro-audit` 不动）；npm test 内 gen 4 产物 CLEAN | ✅ 属实 |
| ② | dist 入库；esbuild vs tsc-dist 由 smoke 定形；`.gitignore` 无 dist 行 | **dist=40 件（git ls-files 40，报告/交接/账本/WORKFLOW 四处均写 41——计数错误）**；cli.js=153,604B 恰符；bundle 无相对 import、保 `#!/usr/bin/env node` shebang、`import("@duckdb/node-api")` 外置未内联；.gitignore 仅 node_modules/*.tgz/*.log；smoke 三件套+MCP 实测 | ⚠ 属实但计数错（41→40） |
| ③ | CI rebuild-diff 守卫（porcelain，shell:bash）挂 34/41b 链；34-check G13/G14 | engine-ci.yml:28-30 在；34-check PASS 14/14 本窗复跑。**偏离注记**：spec 原文=`npm ci && git diff --exit-code` 且「挂入 34/41b 守卫链」——实现=workflow 内嵌 porcelain 步（改进方向：捕未跟踪）＋34-check 仅得 G13/G14 本地钉；npm install 未随 spec 改 npm ci | ✅ 属实（字面偏离已披露方向正确） |
| ④ | README/SKILL/根 README 同票五要素 | engine/README §插件安装：Node≥20+node --version 自检/安装两行//mcp 或 selftest 验收/能力分级表/#43380+#65579 bug 链/claude --debug 引导全在；SKILL.md 运行前提行在；根 README 过渡句式保 C9 pinned 子串（41a-C9 实测 PASS） | ✅ 属实 |
| ⑤ | 守卫扩 command 禁裸名 G12 | 34-check.mjs G12 在且 PASS：command===node 或含 ${CLAUDE_PLUGIN_ROOT} | ✅ 属实 |
| ⑥ | esbuild 入 upstream-lock active/exact-version | 锁表末行 id=esbuild kind=node-lib version=0.28.2 pin_type=exact-version status=active +contract+adapter+双日期全字段；package.json devDep 精确值；package-lock resolved 0.28.2；npx esbuild --version=0.28.2 三方同值；44-check 56/56 | ✅ 属实 |
| ⑦ | npm publish 维持 deferred | package.json 无 publishConfig；files 未动；private:true；mcp.json npm 面未动 | ✅ 属实 |
| ⑧ | 真机 /plugin install→/mcp connected（等价环） | 本窗实测 `claude --plugin-dir … mcp list` → Connected（exec-form ${CLAUDE_PLUGIN_ROOT} 展开为绝对路径实证）；字面 marketplace install 未做=push 用户闸门，报告 §④2 如实披露 | ✅ 等价环属实（字面项披露合规） |
| A-D | 编译/打包/测活/平台闭环 | 见 §1 | ✅ 全过 |

## 3. D-xxx 逐条核对（覆盖声明 D-067 / D-038 / D-037⑥）

- **D-067 八子项**：①✅ ②✅（计数错另列） ③✅（机制偏离已披露：porcelain＞diff --exit-code 捕未跟踪；落点=workflow 非守卫脚本内嵌） ④✅ ⑤✅ ⑥✅ ⑦✅ ⑧⚠等价环（字面需 push 闸门，已如实披露）。
- **D-038**：仅承接「npm publish deferred＋双通道分工」（mcp.json 留 npm 面 bare command）——未越界引用，✅。
- **D-037⑥**：upstream-lock esbuild 行入锁 ✅；**但同条落位义务「CHANGELOG entry 引用 lock diff」未兑现——engine/CHANGELOG.md [Unreleased] 无 #59/esbuild 条目（该账惯例逐票登记 lock/manifest 变更，见 #47/#50/upstream-lock 创建行先例）。缺口 G4。**
- 账本一致性：A-069 登记内容与实物一致（除同错计数 41）；BACKLOG #59 ✅ 行在；WORKFLOW §4 lessons 行在（R11 #59）。

## 4. 双轴评审摘要（$code-review：Standards＋Spec，平行子代理）

### Standards
- 硬违规（触碰文件 vs 仓内成文惯例）：engine-ci.yml `npm install`（兄弟 golden-ci.yml:51／macro-b-regression.yml:98 均 `npm ci`；R7#46 lesson 成文「触碰 workflow 先对齐兄弟安装/版本惯例」；且 spec D-067③ 原文即 `npm ci`——npm install 可改写 package-lock，与新增 rebuild-diff 守卫的锁定语义相抵）；无 `permissions: contents: read`（两兄弟均有）；`paths:` 未含 workflow 自身（本守卫改动自身不触发 CI）。
- CHANGELOG 义务缺口：engine/CHANGELOG.md [Unreleased] 无 #59/D-067/esbuild-lock 条目（D-037⑥「CHANGELOG entry 引用 lock diff」＋逐票登记惯例）。
- 判断级 smell：build-bundle.mjs `result.errors` 检查不可达（buildSync 抛异常路径）；34-check `charCodeAt(0)===0x23` 可读性弱；engine/README:14「npm run build # tsc 编译」过期未同步 bundle 步（本票触碰同文件）；README:114「不虚构 audit 子命令」与已上架 audit 命令矛盾（**陈旧先于本票**）；store.ts/handoff `getDuckdb()` 名实不符（实物=`loadDuckdb()`）。
### Spec
- 八子项全实现；字面偏离三件均「已披露且方向正确」：③ porcelain 捕未跟踪（优于 spec 字面）、② bundle+tsc 树双形态并交（测试 import 依赖 tsc 树，合理）、⑧ plugin-dir 等价环（push 闸门约束，自标）。
- spec 外新增但属目标必需：store.ts 懒加载降级、demo.ts metaPath 锚（零 node_modules 不崩=票目标本身）。
- 缺失项：无功能缺失；⑧ 为唯一 partial（等价非字面）。

## 5. 陈旧守卫归因复核（本窗独立重扫全族）

报告披露 41a FAIL 4/39（C10/D6/D7/F4）——本窗逐条核实归因成立：C10 与 41b-C1 真互斥（41b 强制 README 含 capability 3 of 5，README:16 实物在；41a-C10 禁其出现——冻结后 #41b 落地所致）；D6 want=A-001~A-069（CHANGELOG 未随 A-068/D-070 进账在先，A-069 落账扩 1 项——报告 §④4 已如实披露）；F4 钉 next-round 已换代。
**本窗追加扫描（报告守卫总账未列）发现同族陈旧 FAIL 4 件**：43-check D5（钉 next-round T14，已换代）／45-check B5（`codelore:` 字段名误吞子串扫描，baeace8 基线已含）／50-check E2+E3（registry narrative-eval-surface status=pending＋BACKLOG #52 已拆 #52a/#52b，D-061 轮15 所致）／t8-check A3（同一 registry 钉）。**全部先于本票存在（实物锚均在 lvr 之前 commit），与本票无关，但报告「收口时点全量复跑」未披露此四件——总账完整性缺口 G5。**

## 6. 过程合规核查

- 文件完整性：19 个触碰文件零 BOM、全 LF ✅；写盘纪律未见违规痕迹。
- 版本控制：分支 r20-59-kernel-selfcontained 两 commit（fix lvr 55 件／docs prs 5 件）分层正确；未 push（用户闸门）✅；`.code-tmp/` 未入库 ✅。
- 与 T8 移交口径一致：41a 陈旧面＋duckdb-binary-watch／bundle-retirement 关联项如实移交，未静默复写冻结守卫 ✅（R14 lesson 执行到位）。
- 如实披露到位：干净 clone 无 duckdb 残余缺口另立票待裁、真机字面验收受闸门——报告 §④ 不绕路不硬凑 ✅。

## 7. 返工清单（打回项）

**必修（P1——记录准确性/文内义务）**
- R1 「dist 41 件」→40：改 `.scratch/macro-audit/reports/2026-09-18-report.md`（2 处）、`handoffs/2026-09-18-r20-t1-handoff.md`（1 处）、`.scratch/architecture-recovery/decision-ledger.md` A-069 行、`.scratch/architecture-recovery/WORKFLOW.md` lessons 行——四处同源修正为 40 并注勘误。
- R2 handoff `getDuckdb()` → `loadDuckdb()`（2026-09-18-r20-t1-handoff.md:44，门面名实对齐防下窗误导）。
- R3 engine/CHANGELOG.md [Unreleased] 补 #59/D-067 条目（.mcp.json 契约＋dist 入库＋store.ts 懒加载＋CI 守卫），并引 upstream-lock esbuild diff——D-037⑥ 落位义务兑现。
- R4 engine/README.md:14「npm run build # tsc 编译」→ 注明 tsc+build-bundle 两步（同文件内口径一致）。
**应修（P2——惯例对齐，spec 字面即如此）**
- R5 engine-ci.yml `npm install` → `npm ci`（D-067③ 字面＋R7#46 惯例＋防 CI 端 package-lock 被静默改写）。
- R6 engine-ci.yml 补 `permissions: contents: read`＋paths 纳入 `.github/workflows/engine-ci.yml` 自身（惯例对齐＋本守卫自触发）。
**建议（P3——披露完整性，可并入 T8）**
- R7 守卫总账补注 43/45/50/t8 四件陈旧 FAIL（同 41a 族归因移交 T8 值守清单，免下窗重查）。
- R8（可选）build-bundle.mjs 删不可达 errors 检查或改 try/catch；34-check `0x23`→`startsWith("#!")`。

## 8. 修复后重跑清单（原修复窗执行）

```
cd D:/Aworker/6F/engine && npm run gen && npm run build && npm run package && node dist/cli.js selftest
cd D:/Aworker/6F && node .scratch/architecture-recovery/reports/{34-check,41b-check,44-check,41a-check}.mjs
git status --porcelain -- engine/dist   # 须零输出
npm test   # exit 0
```
预期：34=14/14、41b=30/30、44=56/56 PASS；41a 维持 4/39 陈旧归因面（不扩大）；npm test 全绿；dist 无漂移。

## 9. 审计方法与证据工件

- 审计窗：Devin（SWE-2 Max），独立窗未参与修复；全程亲历实跑零采信自述。
- 证据工件：`.code-tmp/r20-audit/mcp-probe.mjs`（MCP 握手探针）、`.code-tmp/r20-audit/plugin-sim/`（零 node_modules 仿真目录）。
- 评审：Standards＋Spec 双轴平行子代理（$code-review skill 流程）；D-xxx 对照账本原文（D-067 line 572 区／A-069 R11 行）。
- 版本控制面核查经 `but status`（r20-59-kernel-selfcontained=lvr+prs，叠于 round19-closeout xql，common base baeace8）。

## 10. 终裁（返工 commit ytx 复验后，2026-09-18 本窗）

**PASS**：§7 返工清单 R1~R8 逐项实物复核全落实——
- R1：报告/handoff×3/A-069/WORKFLOW 四处「41 件」→40＋勘误注入文（勘误体例=改写＋留注，合冻结纪律）；
- R2：handoff `loadDuckdb()` 与 store.ts:42 名实对齐；
- R3：engine/CHANGELOG.md [Unreleased] ### Changed 首行 #59 全量条目并引 upstream-lock esbuild diff（D-037⑥ 兑现）；
- R4：engine/README:14 → tsc+build-bundle 两步；
- R5：engine-ci.yml `npm ci`（spec 字面＋兄弟惯例＋锁定语义三对齐）；
- R6：`permissions: contents: read`＋push/PR paths 均含 workflow 自身；
- R7：报告 §④ 新增第 5/6 条——勘误注＋43-D5/45-B5/50-E2E3/t8-A3 四件陈旧 FAIL 补注（移交 T8）；
- R8：build-bundle.mjs 改 try/catch（BUNDLE-OK 实跑复现）；34-check G13 `startsWith("#!")` 复跑 PASS。

**§8 重跑清单本窗全过**：gen GEN-OK（4 产物 CLEAN）／build BUNDLE-OK／package 71 件 167.5kB（+0.5kB=CHANGELOG 条目，合理）／selftest 5/5／porcelain dist 零输出／34=14/14、41b=30/30、44=56/56／41a 维持 4/39 同四项不扩大／npm test exit 0（15 套件全绿）。

**残余登记（不阻断，移交收口/T8）**：`.scratch/architecture-recovery/BACKLOG.md` #59 行仍写「dist 41 件入库」——本审计 R1 清单漏列第五处，返工按单修毕后此残留未覆盖；一字勘误，随下次收口或 T8 值守一并修正。

审计报告本体随 ytx 入库；本 §10 与 pass-handoff 随终裁落盘。