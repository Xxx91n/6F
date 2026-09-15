# Audit: 轮 8 窗口（#35 / A-040 CodeLore 首批 30 面契约化）— 独立审计报告

> 身份：审计 Agent（独立窗口，非修复窗）。审计对象 = `.scratch/architecture-recovery/reports/35-report.md`（6 段式）+ `.scratch/macro-audit/reports/2026-09-15-report.md`（窗口 1+2）及引用 handoff/issue/prompt/账本。
> 方法：不信自述——硬验收全部亲跑；每条声明做仓库实物抽查；双轴评审（Standards + Spec）由两个只读子代理并行取证，fixed point = `e72f47c`（轮 7 审计通过点），diff = `e72f47c..HEAD`（70 文件 / +11360 / -75，含 xzx/pvy/lro/tyt 四提交 + workspace commit）。
> 职责分离：本报告只呈报不代修；过程违规单独列出，不替任何窗口追认。审计中亲跑 35-probe 重写产物已用 `but discard zz` 全数还原（zz 先前为空，还原后 git status 0 改动）。

## 1. 声明 → 证据 → 结论 对照表（硬验收全部亲跑，2026-09-16）

| # | 报告声明 | 审计亲跑/实物证据 | 结论 |
|---|---|---|---|
| 1 | `codelore analyze --help` 实物枚举存档 13,088B、枚举 57 面 | 文件 13,088B 实物在；解析 possible-values 段得 57 面名；README 自称 61 的计数差已如实登记于报告与调研档 | **成立** |
| 2 | 首批 30 面对账零差异 + 残余 4 面登记 | `35-facet-reconciliation.json`：enum_count=57、batch1.matched=30/30、diffs=[]、unregistered_residual=[entity-effort, architecture-violations, finding-hotspot-overlap, defect-validation] | **成立**（残余裁决无跟踪位 → §3-W1） |
| 3 | 逐面 cassette + manifest + 实测采集 | 亲跑 `35-probe.mjs` → `facets contracted=30 errors=0 facts=31`；fixtures 实物 = 30 json + 8 csv + manifest.json；manifest 每面带 sha256/row_count/columns/spot，空面另带 csv_file/csv_sha256/csv_header_sha256 | **成立**（probe 具副作用 → §3-W5） |
| 4 | 守卫 `35-check.mjs` PASS 21/21 | 亲跑 → PASS 21/21 exit 0（A1-A4/B1-B3/C1-C4/D1-D5/E1-E3/F1-F2） | **成立**（A4 设计张力 → §3-W1） |
| 5 | 编译通过 | `npm test` 内 `tsc -p tsconfig.json` 0 错 exit 0 | **成立** |
| 6 | 打包通过 | `npm run package` → macro-audit-0.1.0.tgz，total files 31（与基线一致，测试件不打包） | **成立** |
| 7 | 启动并测活进程 | `node dist/cli.js selftest` → `{"ok":true}` 五检查全 pass exit 0 | **成立** |
| 8 | 测试全绿入链 | `npm test` → GEN-OK + SMOKE 6/6 + COLLECTORS 14/14 + ADAPTER 7/7 + BATCH1 41/41；测试实物 41 用例 = A1-A3 + facet 循环 30 + C1-C3 + D1-D4 + E1 | **成立** |
| 9 | 每平台 test 闭环 | `.github/workflows/engine-ci.yml` matrix = ubuntu/windows/macos × node 20/22，steps 含 `npm run smoke`（smoke 链已含 codelore-batch1.test.mjs） | **成立** |
| 10 | 暂缓面集两字段 + #33 不回归 | 亲跑 `33-check.mjs` → PASS 8/8 exit 0（值守快照 ALARM 0 / WARN 6 / BOUND 2，与窗口 2 报告口径一致）；registry `codelore-deferred-faces` 项 faces=20、deadline（满足判据）+ review_at（各层 preview 前置）齐备、watch=manual_watch、source=D-035④ | **成立** |
| 11 | 适配层零业务规则（ADR-0014） | codelore.ts 全文件 `threshold|verdict|RED|score_band` 零命中、spawnSync 在、`CODELORE_PINNED_VERSION = '0.28.0'` 在；测试 E1 + 35-check C2 双机检 | **成立** |
| 12 | LLM 面未混入 | BATCH1 契约表 30 面无 explain 族；文件内 explain 引用全部为 #31 探针期存量代码（ExplainDossier/parseExplainDossier/explainPaths），非新增 | **成立** |
| 13 | 空面 csv 第二通道逐字节钉死 | 8 空面 = stale-code/release-cadence/god-classes/dependency-cycles/knowledge-islands/communication/marginal-owner-risk/pair-programming；csv cassette 实物 header 与 manifest.columns 一致；测试逐面断言 `sha256(csvRaw)===csv_sha256` + header 列契约 | **成立** |
| 14 | 冻结 argv 入契约 | code-age `extraArgs=['--age-time-now','2026-09-15']`、messages `['-e','(?i)(fix|feat|docs)']` 在契约表与 manifest.extra_args 双钉 | **成立** |
| 15 | 红证：畸形/漂移输入被拒 | 测试 C1 非数组 JSON 抛错 / C2 非对象行抛错 / C3 截断 cassette 抛错；D2 facet_error 降级不中断 / D3 facet_parse_error / D4 未 pin 短路只出 resolution | **成立** |
| 16 | 收尾硬要求 4 项 | ① 35-report.md 在（①-⑦段式）② A-040 行 = `done → implemented（2026-09-15）` ③ WORKFLOW §4 lessons 尾行 R5 #35 在 ④ commit `1c7ccee` 消息引 `guard 35-check PASS 21/21` + `契约测试41/41`（Spec 子代理误报「未引守卫结果」，已亲验推翻） | **成立** |
| 17 | 通用调研要求 | `35-atomcode-research.md` 在：3 先例对比矩阵（code-maat/CodeScene/CodeLore 均原文核验）+ golden 六步法 + 冲突点名段 + Sufficiency Gate + 6 独立域名来源 | **成立**（CONTEXT.md 回顾无举证 → §3-W6） |
| 18 | 分支/未 push | `but status`：r8-35-codelore-batch1（lro+tyt）叠 r7-closeout-docs（xzx+pvy），zz 空；`git ls-remote origin` 仅 refs/heads/main，无任一票分支外推 | **成立** |
| 19 | 窗口 1 声明不回归（T0/T1/T2，上轮已审） | 亲跑：32-t0-verify 99/99 ALL-PASS、32-t0-verify2 12/12、34-check PASS 11/11、ajv `plugin.json valid`、gen 二次全 CLEAN+GEN-OK | **成立** |
| 20 | macro 报告窗口 2 追加未覆盖窗口 1 | 实物两节并存在 | **成立** |

## 2. D-xxx 覆盖逐条核对（票声明 vs 账本原文 vs 实物）

- **D-035①** 首批=演化 12+S3 6+S5 12 ≈30 面逐面 golden 契约：契约表恰 30 面（12/6/12）与 issue 名单逐字一致；30 cassette+manifest+41 用例。**覆盖成立**。
- **D-035②** LLM 面独立票不混入：BATCH1 无 explain 族；issues/36 立案在（Status: ready-for-agent 正确）。**覆盖成立**。
- **D-035③** sqlite dump 立为对照评估项、首批仍逐面契约：issues/42 ①② 登记 dump 对照评估三轴 + blocked-by #35（现已解锁）；本票未采纳 dump。**覆盖成立**。
- **D-035④** 暂缓面集 ~20 面「满足判据+复审时点」：registry 项 faces=20 与 D-035④ 原文逐名可回查（35-check D4 机检）；两字段齐备。**覆盖成立**（残余 4 面裁决跟踪缺口 → §3-W1）。
- **D-034①** 首个铺开票=CodeLore 扩面：本票即该票，时序与层序一致。**覆盖成立**。
- **A-040** 行：done→implemented 2026-09-15，Deliverable/Note 与实物一致。**覆盖成立**。

## 3. 缺失 / 弱化 / 跑偏（单独列出）

- **W1（缺失-跟踪，本轮最重）**：枚举残余 4 面（entity-effort / architecture-violations / finding-hotspot-overlap / defect-validation）已如实登记 `unregistered_residual` 并声明「留收口窗口裁决」，但**裁决无任何跟踪载体**——next-round.md T0-T15 无此项、registry 无对应项、无票据。且 `35-check.mjs` A4 将 4 面名写死为 `EXPECTED_RESIDUAL`：若裁决落地登记入暂缓面集，A4 转 FAIL——守卫把「未登记」固化为期望态（绊线方向可被辩护为强制同步，但裁决本身无 owner/时点）。
- **W2（失同步）**：`.scratch/architecture-recovery/README.md` 波次表（376-420 行）整体陈旧——仍写「总票数 12（#32~#43）」、#41 未拆分为 #41a/#41b、#43 前置写「#41 样例落位后」（D-038⑤ 已改 #45←#43）、Frontier 仍称「W12 可开工 #33/#34/#35」。与 BACKLOG/next-round 矛盾；32-t0-verify 只断言关键词存在，此类漂移不可检出。
- **W3（失同步-微）**：`issues/35` Status 仍 `ready-for-agent`（同波次 #32/#33/#34 均翻 `done — …`）；`next-round.md` 进度块未随 #35 闭环刷新——头部仍「下一可开工 = #35」、T3 行无 ✅ DONE（T0/T1/T2 行均有）。常驻任务书落后于 ledger/handoff 一手。
- **W4（悬空引用）**：`engine/CHANGELOG.md:6` 反向指针指向尚不存在的仓根 `CHANGELOG.md`（D-039② 钦定指针文本、实体归 #41a）；#44 指针校验落地即 FAIL——需加注「待 #41a 落盘」或排 #41a 先于 #44 enforce 段。
- **W5（观察）**：`35-probe.mjs` 是录制器非只读校验——重跑按当时仓库活历史重写全部 cassette/manifest/facts/measurements（本审计亲跑产生 24 文件改动，含 n_revs 30→31、lead-time 110→111 等真实数据漂；已 discard 还原）。cassette 钉的是「录制时点」的本仓历史，后续 commit 落地后再跑 probe 必产漂移——符合 golden 录制语义，但证据命令行未标注副作用，下一个审计窗易踩。
- **W6（弱化-微）**：通用调研要求「回顾 CONTEXT.md 词条」在 35-report ① 必读清单与研究档中均无举证（词条域已在调研对比矩阵覆盖，举证缺位而已）；`facetColumns` 只取 rows[0] 键名，后续行新增列不入列契约（cassette sha256 兜底，非漏洞）；33-check `it.trigger_event && reg.events[...]` 对悬空事件引用静默跳过（fail-open）+ 对新 watch 字段零校验——fail-open 是挂门守卫最危险方向，已排 T7/#33-ext，窗口期内 typo 不报警；33-check `includes('D-035')` vs 35-check `startsWith('| D-035 |')` 同语义两严度（fail-closed 仅脆性）。
- **W7（判定项）**：`docs/decisions/README.md:2` ADR-0018 行孤儿插于 H1 下（无表头/分隔行，渲染为裸文本）；「ADR 覆盖映射」表仍止 ADR-0007。根 README:6「阶段 2/3 尚未开始」与 :38「CodeLore 已接入（探针切片：explain/summary 只读面）」落后于 30 面契约（README 文案归 #41a 已排票）。codelore.ts evidence 字符串(:236) 与 runner argv(:190) 同命令两处表达且形状已漂（evidence 缺 `--repo`）；`parseJsonRows`≈`parseSummaryJson` 同构；两 collector 的 resolve→pushResolutionFact→pinned 序言重复——possible Duplicated Code（judgement call）。
- **AGENTS.md 新增（f91e03e）**：Spec 轴记为越单；审计复核其内容=用户协作偏好+环境速查，判定多为用户授意落盘，降格为记录项不算违规。
- **`collectCodeloreFacets` 无生产调用方**：仅测试经注入面消费——属本票契约面交付（#38 Macro-C 接线），非 Speculative Generality；登记防误读为死代码。

## 4. 过程违规（单独呈报，不追认）

- **P-V1**：commit `f91e03e`（pvy，AGENTS.md docs）消息无 A-NNN/D-NNN 引用——违 WORKFLOW 2026-09-11 lesson「commit 必须以 A-NNN 起头或引用」（软性 docs commit，同类 round7 P-V3）。xzx 有 D-037~D-041 引用、lro/tyt 有 35/A-040 引用，合规。
- 无其他违规：#35 收尾硬要求 ①-④ 全执行；atomcode 调研产物在；三件套/ledger/lessons/commit 链齐。

## 5. 结论与处置建议

硬验收 20/20 声明成立（编译/打包/测活/全测试/五守卫/probe/ajv/gen 幂等/分支未推全亲跑）；D-xxx 覆盖核对成立；无硬违规、过程违规仅 P-V1 一项（微）。但存在 W1（残余 4 面裁决无跟踪 + A4 固化期望态）、W2/W3（波次表与任务书/票据状态失同步）、W4（CHANGELOG 悬空指针将绊 #44）——**建议：打回修复窗口一次小修后复审（文书级，不动代码）；或由用户明示豁免放行。**

### 返工清单（若打回）

1. 残余 4 面裁决挂跟踪：registry 增 manual_watch 项（满足判据=收口裁决落 D-xxx、复审时点=下个 grill/收口窗口）或 next-round.md 增 T 行；同时修 `35-check.mjs` A4——断言「残余面 ∈ unregistered_residual ∪ 已登记暂缓集」而非写死名单，裁决落地后自洽。
2. 同步 `.scratch/architecture-recovery/README.md` 波次表：总票数/波次按 #41 拆分与 #44/#45 立案重算（或注明被 next-round.md 取代）；#43 前置改 #45；Frontier 段刷新为「W12 已闭环 #33/#34/#35，W13 可开工 #36/#37/#41a」。
3. `issues/35` Status 翻 `done — …`；`next-round.md` T3 行加 ✅ DONE、头部进度行改「下一可开工 = #36/#37/#41a」。
4. `engine/CHANGELOG.md:6` 指针加「（待 #41a 落盘）」注记，或确认 #41a 排于 #44 enforce 段之前。
5. `docs/decisions/README.md:2` ADR-0018 孤儿行并入表格或改正文行；覆盖映射表补 ADR-0008~0018（可推至 #41a 文书票一并）。
6.（可选）33-check 事件引用改 fail-closed（引用不存在=显式 FAIL）；codelore.ts evidence 串改为自 argv 派生防二次漂移；manifest.json `repo`/`capture_commit` 机器路径字段加注释声明为录制 provenance。

### 重跑清单（修后必跑，与本次同套）

`cd engine && npm test`（GEN-OK+tsc 0 错+SMOKE 6/6+COLLECTORS 14/14+ADAPTER 7/7+BATCH1 41/41）→ `npm run package`（tgz 31）→ `node dist/cli.js selftest`（ok=true 5/5）→ `node reports/35-check.mjs`（21/21）→ `node reports/33-check.mjs`（8/8）→ `node reports/34-check.mjs`（11/11）→ `node reports/32-t0-verify.mjs`+`verify2`（99/99+12/12）→ ajv plugin.json（valid）→ gen 二次（CLEAN+GEN-OK）→ `but status`（zz 无残留）。**注意：35-probe.mjs 为录制器有写副作用，非验收必跑项；若跑须 `but diff` 核漂移并复原。**

## 6. 双轴评审要点（两只读子代理并行取证，父代理已逐项复核实物）

- **Standards**：硬违规 0；判定项 8——CHANGELOG 悬空指针（W4）、33-check fail-open+watch 零校验（W6）、AR README 波次表漂移（W2）、decisions README 孤儿行+映射表止 0007（W7）、根 README 两处陈旧（W7）、codelore.ts 三处 possible Duplicated Code（W7）、D-035 匹配严度不一（W6）、34-check G11 崩溃窗口残留风险（上轮已改恢复原状，残注记）。合规确认面：D-8 lessons 格式、A-040 回写、报告段式、守卫惯例、ADR-0014 零业务规则、D-035 三禁、D-041⑤ watch 三态数据面。
- **Spec**：缺失 2（commit 引守卫=子代理无 git 误报已推翻；CONTEXT.md 举证缺位=W6）/ 越单 1（AGENTS.md，降格记录项）/ 疑似跑偏 3（残余 4 面无跟踪+A4 固化=W1；messages -e 检索口径入 extraArgs=边缘观察，已落字 argv 契约可辩护；facetColumns row0 限定=W6）。次 spec（轮7收口）全部对得上：BACKLOG 四行/ADR-0018/versioning.md/WORKFLOW §4.2.7/next-round T0-T15/25-checklist decided-now；manual_watch 五要素 3/5 已排 T7 合规递延。

## 引用

- 被审对象：`.scratch/architecture-recovery/reports/35-report.md`、`.scratch/macro-audit/reports/2026-09-15-report.md`、`.scratch/macro-audit/handoffs/2026-09-15-r8-35-handoff.md`、`.scratch/macro-audit/handoffs/next-round.md`
- 票档：`issues/35`、`handoffs/35`、`prompts/35`、`35-facet-reconciliation.json`、`35-probe-measurements.json`、`35-upstream-facts.jsonl`、`33-gate-registry.json`、macro 账本 D-034/D-035、arch 账本 A-040、spec.md §R5-D4
- 取证子代理：Standards / Spec 各一（explore 只读；均无 git/shell 权限，git 依赖断言由本审计窗亲验补位）
- 环境注记：本机 `rg` 不可用（exit 127/空输出），检索均以 node 兜底
