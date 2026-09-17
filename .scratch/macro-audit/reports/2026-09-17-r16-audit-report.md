# 轮16 实施审计报告——审计窗口独立复核（不信自述）

日期：2026-09-17　审计对象：分支 r16-impl-t1-t3-t2（wkp→usr→pwo→zvt→snw/收口 feba726），基点 6f021db（round15-closeout）
审计口径：报告每条关键声明=亲自重跑或仓库实物抽查；code-review 双轴子代理评审＋主窗逐条复核裁定

## ① 硬验收（亲跑，非转述）

| 声明 | 亲跑证据 | 结论 |
|---|---|---|
| tsc 编译 0 错 | `npx tsc -p tsconfig.json` → TSC_EXIT_0 | ✅ 成立 |
| 打包 121.8kB/71 件＋dist/audit 入包 | `npm pack --dry-run` → macro-audit-0.1.0.tgz 121.8kB/71 件，dist/audit/{audit,macro-b}.{js,d.ts} 在列 | ✅ 成立（逐字节一致） |
| --version 0.1.0 JSON | `node dist/cli.js --version` → {name:6f,version:0.1.0,shells:4} | ✅ 成立 |
| selftest ok:true 5/5 | 5 项全 pass | ✅ 成立 |
| 真实仓测活 RCP-e0ab92dca215a66d·supported·280 facts·codelore resolved | 亲跑 `audit D:/Aworker/env-manager --out .scratch/macro-audit/audit-r17` → receipt_id 逐字一致、fact_count=280、codelore resolved+pinned 0.28.0、五工件落盘 | ✅ 成立 |
| npm test 全链绿 | smoke 6/6·collectors·codelore·report-preview·intake 40/40·gitcli 11/11·sql 17/17·mcp-db 12/12·audit 24/24·demo 38/38·github-rest 55/55·narrative 34 | ✅ 成立 |
| 守卫基线 33=16/16·42=43/43·44=56/56·46=30/30·53=22/22·54=19/19·55=17/17·52a=21/21·41b=30/30 | 九脚本逐一亲跑全 exit 0，计数逐字一致 | ✅ 成立 |
| 33-check WARN 9→8 | 实测 WARN=8（5 项进行中事件＋3 项 manual_watch confirmations 空——复审时点未至常态） | ✅ 成立 |
| git diff --check 干净 | 干净 | ✅ 成立 |
| 守卫重跑未致脏树 | npm test(gen)+9 守卫+audit 跑后 but status 无 tracked 文件改动（仅本审计自产 audit-r17/ 工件为新增未跟踪） | ✅ 成立 |

## ② 实物抽查（rg/读码，非仅守卫转述）

| 声明 | 实物 | 结论 |
|---|---|---|
| normalizeGitIsoDate 归一化＋严格形状断言 | intake.ts:86 `+00:00→Z`＋GIT_ISO_STRICT_RE 不符即 throw（不静默放行） | ✅ |
| %cI 消费点单源归一化 | macro-b.ts:72,82 恰 2 处全走 normalizeGitIsoDate；upstream-lock git-cli 行 contract 点名 enforce 位 | ✅ |
| .git 尾缀/尾斜线键归一 | intake.ts:115 normalizeRepoUrlKey（去尾 .git＋尾斜线→同 sha 缓存槽） | ✅ |
| refresh opt-in 不自动 pull | intake.ts：缓存命中+refresh→`fetch origin --prune`（noop hooksPath＋protocol.ext.allow=never）→reset --hard origin/HEAD；无 pull | ✅ |
| 时点披露单源 | snapshot_fetched_at=FETCH_HEAD mtime，clone/refresh/缓存命中三腿同一取证函数 | ✅ |
| MCP db 三源寻址 | mcp-server.ts resolveFactsDb=arguments.db→serverConfig.db(--db argv)→MACRO_AUDIT_FACTS_DB env→MCP-FACTS-DB-UNRESOLVED；required 去 db | ✅ |
| mcp.json=gen 生成物 | manifest.meta.json 增 mcp.env.MACRO_AUDIT_FACTS_DB→gen-manifests 同步 mcp.json；npm test gen 段 CLEAN 无漂移 | ✅ |
| stripSqlLiterals | fact/schema.ts:80 剥 $$/tag/单双引号/backtick 后黑名单匹配 | ✅ |
| contradicts 死枚举清零 | citation.ts:9 SupportRelation=supports\|insufficient（注释勘误在，代码面无消费残留） | ✅ |
| audit 一等命令 | cli.ts audit 分发块：签名四旗标、未知旗标 exit2、SCALE-NOT-IMPLEMENTED 结构化 exit2、--out 双通道、顶层 usage 行同步 | ✅ |
| 共享管线 | audit/macro-b.ts 导出 probeMacroBRepo/collectMacroB/evaluateMacroB/macroBContext/tcBand；audit.ts:15,119 与 demo.ts:25,131-138 同消费 | ✅（但见 F3） |
| audit 不携叙事 | 亲跑 report.json narrative_sections=[]；53-check G1 同断言 | ✅ |
| 报告头 stability/capabilities | generate.ts 契约字段＋实跑输出 preview/[macro-b]；golden 三场景 diff 仅 +stability/capabilities 行 | ✅ |
| README 同票 | README:20-22 audit 命令行＋五工件说明在 | ✅ |
| golden-ci 勘误块 | .github/workflows/golden-ci.yml:14-18 勘误块在（2026-09-17/#54/D-059①，工具版本漂移非平台漂移，单平台裁定维持） | ✅ |
| registry 五触发器＋evidence 锚 | 33-gate-registry.json：runtime-doctor-trigger:845／bundle-retirement:869／duckdb-binary-watch:893／golden-verifier-dirty-on-rerun:918／narrative-eval-surface 改锚 host-narrative-corpus:788-824；confirmations 均带 D-059~D-063 账本行＋check 产物锚 | ✅ |
| 语料 110 条＋指纹版本化 | corpus JSON 实物=92 items 八层＋18 band=110；sha256_16=5abd322377e8562e 与 eval JSON corpus.sha256_16 逐字绑定（B2 断言） | ✅ |
| κ 三报＋双读数 | eval JSON：全集 0.455(CI95[0.261,0.630])／非对抗 0.970／intra-rater 1.000；FP=13/FN=12 分型在；band 12/12＋干净 0/6；findings 三条如实落——与 BACKLOG/台账同数 | ✅ |
| 评测/修复分票 | BACKLOG:77 #56 在，含「禁参照 52a 语料调参」硬纪律＋三候选方向；52a-check E3=eval 脚本无 engine/src 写操作 | ✅ |
| D-063① 审计件留档口径 | r14-audit-findings c06aa58 确已合 main（12e2a49 ancestor）——先于裁定发生；账本如实记「约束未来分支、不撤已合」 | ✅（含诚实披露） |
| 分支/提交结构 | but status：r16-impl-t1-t3-t2 栈于 round15-closeout，五 commit 序一致，未 push | ✅ |

## ③ 双轴评审发现（子代理取证，主窗逐条复核裁定）

### Standards 轴

- **F1 [确认缺陷·误引]** audit.ts:24 `SCALE_LAYER_ORDER='Micro-A→Micro-B→Macro-B→Macro-C→Macro-A（ADR-0017③ 层序）'`——ADR-0017③ 原文层序=`Macro-C→Micro-A→Micro-B→Macro-A`（其余 4 scale 漏斗序，Macro-B 已上架不在列）。实现串既乱序又把已上架层插入漏斗，并误归因 ADR。随 SCALE-NOT-IMPLEMENTED 结构化错误出货。D-060② 票面要求「层序引 ADR-0017③（措辞与 D-054 能力矩阵同源）」——硬违。处置=修串回 ADR 原序（或账本勘误改口径）＋重跑 53-check B 面。
- **F8 [惯例回归]** 新四守卫 52a/53/54/55-check.mjs 均无 noBom 扫描（旧 33/42 等有；44-check H1 本轮兜底过＋本审计字节级实测新文件全 clean）——覆盖缺口非实质污染，建议补扫。
- **F9 [鲁棒性]** cli.ts audit 参数解析 `--scale` 直吞下一 token 不查 `--` 前缀（mcp facts 解析器有查）——`audit x --scale --json` 会把 --json 当 scale 值，fail-closed 仍 exit 2 但报错对象混淆。
- **F10 [边界崩溃面]** audit.ts:201 `col.pc1AdrFacts[0].fact_id` 无空值守卫——PC-1 正对照失败路径会 TypeError 崩溃而非判 insufficient（demo.ts:246 同型预存沿袭）。
- **F11 [语义可疑]** audit.ts:222 `evidence_threshold_met: ev.tc2.verdict==='RED'`（沿袭 demo.ts:258）——「证据达阈」与「指标红」混用，NOT_RED 时如实误报 false；建议裁定语义或改名。
- **F12 [文档滞后·判断项]** ADR-0009④ clone 入口枚举（「CLI（repo add）与配置文件」）未含 `audit <url>` 第二 CLI 入口——同裁决路径精神在，枚举措辞需勘误行。
- **F13 [死码/判断项]** demo.ts:98 `git()` 零调用（重构残余）；demo.ts:140-173 约 30 行 identity-alias Middle Man（注释自认=diff 最小化留置，建议后续清）。
- Standards 其余判定：Duplicated Code（audit↔demo 装配样板）与 F3 同源合并计。

### Spec 轴

- **F2 [字面偏离]** D-060③「stdout 打 receipt 摘要 JSON（字段集与 demo receipt 同源禁另造）」——audit 回执字段集与 demo 回执不同源：audit={report_id,scale,stability,capabilities,overall_verdict,repo_name,intake{4字段},codelore,…} vs demo={scenario,synthetic,verdict,degraded_reason,intake_kind,temp_discarded,…}；重合约 9 字段（receipt_id/head_sha/commit_count/adr_count/fact_count/degraded_mode/out_dir/artifacts 等）。同族回执概念、字段集确属另造——字面违约，需裁定（收窄 or 票面勘误授权）。
- **F3 [部分实现]** D-060④「提炼为 engine 内单一管线函数（intake→collectors＋codelore 面→facts→骨架渲染）audit 与 demo 共同消费」——中段 probe/collect/evaluate 已共享成函数组，但「单一管线函数」未成：intake（repoAdd）与骨架渲染（buildReport/render*）为共享件但两端装配样板各约百行重复（audit.ts §5-6 ↔ demo.ts §对应块）。精神达成、字面未达。
- **F4 [已披露偏离]** D-061「50-100 条子集双标→human-human κ 天花板」→实装=intra-rater 单人二轮（n=92 全集），κ=1.000 构造性退化。eval JSON disclosure＋账本如实登记③均披露，理由成立（合成语料 inter-rater 退化为构造确定性）——已披露偏离非隐瞒，但「human-human 天花板」仍属未达项，遗留至 #56/#52b 真实语料面补。
- **F5 [弱满足]** D-061「held-out 只评一次」——无 held-out 分区结构，92+18 全集一次性评测。仅弱读法成立。
- **F6 [分层缺口]** D-061 分层枚举含「矛盾/中立」，实 8 层无此二层——defensible（contradicts 枚举同轮 D-059⑤ 清除、checker 输出空间仅 supports/insufficient），票面枚举未对齐。
- **F7 [超票面·良性]** --out 实写五工件（+report.json/audit-facts.jsonl/audit-measurements.json）vs 票面「report.md＋facts.duckdb＋回执」——加法超票面，README 同票记载，无害但属票面外扩。
- **F14 [超签名·已披露]** audit 签名带 --refresh（D-060① 票面四旗标无此项）——#55 邻 hunk 混入，BACKLOG #53 行注记已披露。
- **F15 [小不一致]** `mcp facts` CLI 调试腿仍硬要 --db（cli.ts:37），未复用 resolveFactsDb 链——D-059⑥ 字面只约束服务端寻址，属一致性余项。
- 负向需求全守住：无自动 pull／未上 AST／eval 不改 checker 行为／audit 不产叙事／39/40 对照物不入 tgz（files 白名单外）／未见参照语料调参痕迹。

## ④ 过程违规/纪律呈报（不追认，只呈报）

1. cli.ts --refresh 行（#55 物）随 #53 commit 落盘——hunk 相邻不可分；账本 554①＋BACKLOG #53 注已自披露。属已披露瑕疵非隐瞒。
2. 测试期误用 audit_fact_events 表名——账本如实登记⑤已披露并修正（audit.test 24/24 现绿）。
3. mcp.json 首跑直改被 gen 回写冲掉——已转 manifest.meta.json 单源＋lesson 登记。
4. 本审计未发现隐瞒性违规；以上三条均为执行方自披露留痕。

## ⑤ 裁定

**硬验收 PASS**（§① 全绿、§② 实物全对上、双读数一致、无隐瞒）。
**附条件**：F1（层序误引）为出货 payload 内规范性误引，须返工或呈报裁定——建议立小票修 audit.ts:24 串＋53-check 断言层序原文；F2（回执字段集同源违约）须裁定收窄或票面勘误；F3/F4/F5/F6 建议随 #56 设计票/账本勘误一并裁定；F8-F15 为 advisory/后续清理项。
返工者重跑清单：53-check（B 面 SCALE 断言＋C 面回执）＋audit.test＋npm test＋33-check 基线。
