# 38-report — Macro-C preview：anysearch-cli 校准＋单仓披露＋happy/failure 演示双件

> 票：#38 / R5-07｜A-xxx：A-043｜决定：spec.md §R5-D7（D-034②⑤ / D-032② / D-033①）
> issue：`.scratch/architecture-recovery/issues/38-macro-c-preview.md`；handoff/prompt 同名 38
> 阻塞状态：**None**（#35 扩面 30 面契约、#36 LLM 门控面、#37 试点面审计均已闭环）
> 实跑入口：`.scratch/architecture-recovery/reports/38-macro-c-preview.mjs`（anysearch-cli 只读扫描：git 只读子命令 + 文件读 + `codelore analyze`，**被测仓零写入**；唯一写动作 = 本目录 38-* 工件 + 共享事实库 `38-audit-facts.duckdb`）

## ① 开工复述

必读清单逐条已解析：issue/handoff/prompt 38、spec.md §R5-D7 与 Macro-C 层定义（CONTEXT.md「Macro-C (Evolution Archaeology Audit)」单仓时间维度演化审视）、WORKFLOW §4.2、账本 A-043 行、macro-audit 账本 D-032/D-033/D-034 行、ADR-0006/0007/0013/0014/0017、CONTEXT.md（Release Preview / Degraded Demonstration / Trigger-gated Closure / Generalization Gate / Pilot-surface Audit）、reports/23-first-report.{mjs,md,json,failure.*}（Macro-B 首报形态）、reports/30-desk-calibration.json、reports/35|36|37-check.mjs 与 35|36|37-report.md（守卫与 6 段式先例）、next-round.md T10 行。

本票 delta：Macro-C 触发序列＋采集面（消费 #35 30 面契约＋#36 env 门控面）＋叙事/裁决/报告全链在 **anysearch-cli** 实跑出 preview 双件；报告强制披露「单仓校准（anysearch-cli）」结构性限制块；触发器 (b) 落点核查（是否共用同一 DuckDB→登记 self-probe）。

## ② 调研

通道 = 账本/spec/ADR 原文对账 + 上游面实物（`engine/src/upstream/codelore.ts` collectCodeloreFacets/collectCodeloreLlm 已就）+ 试点实测存档（37-pilot-measurements.json）+ **活仓实跑**（本票主通道）。**atomcode carrier 本窗口不可用**（同 #36/#37 窗口，如实登记，非阻塞——本票主证据为实跑产物非外部检索）。

工业先例对标（演化考古/预览披露，≥2，训练语料级未本窗口重验，如实登记）：①**CodeLore 本体**即演化考古工具先例（revisions/churn/code-age/architecture-trend 等历史分析面集——本层证据源与其同源复用，D-034②「CodeLore 同源」）；②**披露制 preview**——Snyk／Microsoft Entra／Boomi 未上架能力仅文字披露+「Not yet」标注（D-032 atomcode 已核验先例）；③**CASRAI 式机器可读披露块**（D-038③：fixture/capability/supply-chain 字段并入 D-037② 报告头字段统一契约面——本票 `preview_disclosure` 字段即该契约面的首次实现）；④**演化考古语义**：Software Evolution/Tornhill「Your Code as a Crime Scene」系 hotspot/churn 方法学为 CodeLore 面集上游学术源头。冲突核查：实测与账本 spec 无冲突；唯一计数出入 = desk 56 ADR 已漂移为 **65**（#37 已如实登记，本票沿用实测值）。

## ③ 开源轮子

零新增依赖。全链复用 engine dist 已编译模块：采集 `dist/collect/collectors.js`（adr-structure@v2 回退链 + gitlog）、`dist/upstream/codelore.js`（30 面契约 + LLM 门控）、fact `dist/fact/schema.js`+`store.js`（audit_fact v0 + appendFact 唯一写入口 + openReader/queryFacts 唯一读路径）、报告 `dist/report/generate.js`（骨架 1.1.0 + adjudication + degradeReport）。DuckDB 原生绑定本机已就位（`@duckdb/node-api` 1.5.5-r.4 + node-bindings-win32-x64）——本票首次端到端实跑 appendFact 写路径。

## ④ 完成定义 vs 实际

### 4.1 Macro-C 触发序列 + 采集→fact→叙事→裁决→报告全链实跑

| 链节 | 实测 |
|---|---|
| 触发 | 手动触发 preview（CONTEXT.md：Macro-C 触发器=手动或版本发布节点）；锚定 anysearch-cli HEAD `8314a3c`（314 commits，非 shallow） |
| 采集 | adr-structure@v2 ×65 份（回退腿实测分布 dash 17 / inline 18 / inline-iso 74 / git 40 / miss 176——anysearch-cli 混排格式被 v2 回退链兜住，decision_date **65/65** 解析）；gitlog ×65 路径（first_commit/commit_count/author_matrix/adr_lag_days 各 65）；**codelore 契约面 30/30 facet_rows 零 error**（pin 0.28.0）；LLM 面 env 门控关 → `codelore.llm_gate` + 3×`llm_gated` + `llm_cost`（runner 零调用，**不伪造不真调**，降级披露合法形态）；supersede 链 live 复测 = **8 边、断链 0、缺回链 0**（whole 1 + item 2 + amends 2 + defer 1 + 纪律样本 2），与 37-pilot 存档逐值一致 |
| fact | 1012 条（dedup 1 条：两 collect 各 emit 的 `upstream.resolution` 内容全同 → fact_id 内容寻址去重留痕）→ `38-macro-c-facts.jsonl` + **共享事实库 `38-audit-facts.duckdb`**（appendFact 写路径） |
| 叙事/裁决 | 判据集 PC-MC-1/2 + TC-MC-1/2/3 + NC-MC-1 全锚定 fact/evidence；overall=**insufficient**（TC-MC-3 S4 深检面 llm_gated → 诚实部分裁定，非管线失败）；引文校验 **9/9 supports**；receipt `RCP-5f869c282a475240` |
| 报告 | happy `38-macro-c-preview-report.{md,json}` + failure `38-macro-c-preview-failure.{md,json}` 双件落盘 |

### 4.2 报告强制披露块（缺 = FAIL）

`generate.ts` 新增 **`preview_disclosure`** 契约面（D-037② 报告头字段统一契约面的首次实现——#45 演示披露块将复用同一字段，禁两处手抄）：报告头 `> 披露块` 区 + 侧车 `preview_disclosure` 机器可读字段；degradeReport 降级保留（failure 件同样带块）。块内容：`capability 2 of 5 · preview`／`calibration_scope: 单仓校准（anysearch-cli）`／`structural_limitations` 5 项（单仓不构成泛化证据·dogfooding D-033／同主确认偏差面／llm_gated 深检降级 ⚠ unverified／供应链 ⚠ 数据未接 D-034③／structure·behavior 衍生观测不裁决）／`not_in_preview: Micro-A / Micro-B / Macro-A`。

### 4.3 happy + failure 演示双件（D-032 DoD 准入件）

happy 件：骨架 C1-C4 + RECEIPT + 披露块 + degraded_mode=false。failure 件：`degradeReport` 产出（FP-38-1 采集域空事实集场景）——回执行 `⚠ unverified`、`降级产出` 注释、`verdict_gate_stamp: insufficient ⚠ unverified` 印记、recommendations 全带 degraded_note；披露块与骨架不分离（CONTEXT.md Degraded Demonstration 形态成立）。

### 4.4 触发器 (b) 核查：**共用成立 → 已登记**

`38-audit-facts.duckdb` 同一 `audit_fact` 表内实测 **Macro-B 228 条（23-facts.jsonl 经 appendFact 回放——23-facts-insert.sql 的执行形态）+ Macro-C 1012 条**，同一写路径、≥2 repo_ref 同库——「Macro-C preview 与 Macro-B 共用同一 DuckDB」**成立**。登记动作：`33-gate-registry.json` event `macro-c-shared-duckdb`→occurred+证据；`mw-trigger-b` 加 `confirmations`（decision=trigger-fired，D-034④ 判据版）；33-check 输出 `ALARM mw-trigger-b 触发已发生未拍 → 1 工作日内升级`（多写者域进入 self-probe 实测封口通道——**封口实测属后续任务，本票只负登记**，如实登记）。

### 4.5 实跑暴露并修复的真缺陷（顺手修复，如实登记）

- **`engine/src/fact/store.ts` 写路径从未端到端实跑**：`fact_seq`（NOT NULL PK）无赋值路径 + `schema_registry` 外键（`schema_version REFERENCES`）无种子行 → `appendFact` 必炸。修复：openWriter 增 `CREATE SEQUENCE IF NOT EXISTS audit_fact_seq` + INSERT 走 `nextval('audit_fact_seq')`；`schema_registry` 幂等种子行（version=1 Registered/FULL）。DDL 表结构未动（冻结契约不破，只补 store 侧机制）。
- **`upstream.resolution` 双 emit 撞 UNIQUE**：两 collect 函数各自 emit 同内容 resolution fact → fact_id 相同；fact_id 内容寻址 → 按 id 去重（dedup_dropped=1 留痕 measurements）。
- **WAL 未合并**：连接未关留 `.wal` 侧文件 → `FORCE CHECKPOINT` + `closeSync()` 落单文件库（2.3MB，可独立 openReader 读回）。

### 4.6 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| Macro-C 全链在 anysearch-cli 实跑产出 preview 报告 | §4.1 全链实测（1012 facts + 双件） |
| 报告含单仓校准披露块（缺=FAIL）＋capability/层级标注诚实 | §4.2 preview_disclosure 契约面（happy+failure 双载） |
| happy+failure 演示双件（failure 含 ⚠ unverified/降级注释/verdict-gate 印记） | §4.3（38-check C 组 5 断言） |
| 触发器 (b) 核查落文 | §4.4：共用成立 → registry 触发登记（衔接 #33） |
| 守卫 PASS；ledger A-043 done；WORKFLOW §4 lessons；commit 引 A-043+守卫 | `38-check.mjs` **PASS 34/34**；收口一并落盘 |

## ⑤ 卡死 3 连问 + 出入登记

无卡死。**如实登记三项**：
1. **overall=insufficient 是 happy 件的正确形态而非失败**——S4 假设失效检测深检面属 LLM env 门控（#36 契约），门控关=该维度证据门槛未达 → TC-MC-3 insufficient → 综合 insufficient。PC/TC-MC-1/2/NC 全 supported 证管线健康；「preview 诚实部分裁定」即 ADR-0017 披露本体（与 #23 首报 TC-2 RED 同为「真判据未中=合法实验数据」同族纪律）。
2. **desk 计数漂移再确认**：账本「56 ADR」→ 实测 **65**（#37 已登记漂移，本票二次独立复测同值，不作新出入）。
3. **mw-trigger-b 触发后义务**：ALARM 登记即「触发已发生未拍」——多写者 self-probe 实测封口为后续任务（值守规则：1 工作日内升级），本票不代封口。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| anysearch-cli 只读扫描零写入 | `git -C D:/Aworker/anysearch-cli status --porcelain` → 空（38-check H4）；脚本头注明白名单（git 只读子命令 + 文件读 + codelore analyze） |
| Macro-C 全链实跑 | `node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs` → exit 0：facts=1012、facets 30/30、edges=8、lag 65、shared=true、overall=insufficient、9/9 supports；实测存档 `38-macro-c-measurements.json` |
| preview 双件 + 披露块 | `38-macro-c-preview-report.{md,json}` / `38-macro-c-preview-failure.{md,json}`：披露块双载（38-check B1-B4） |
| 共享事实库（触发器 b） | `38-audit-facts.duckdb` openReader 读回 `Macro-B=228 + Macro-C=1012`（38-check E1）；registry `mw-trigger-b` confirmations trigger-fired + event occurred（E2/E3） |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/38-check.mjs` → **PASS 34/34**，exit 0 |
| npm test 全链绿 | `cd D:\Aworker\6F\engine && npm test` → GEN-OK + tsc 0 错 + SMOKE-OK 6/6 + COLLECTORS 14/14 + ADAPTER 7/7 + BATCH1 41/41 + LLM 25/25 + **REPORT-PREVIEW 5/5**（新测试入 smoke 链） |
| 打包+测活 | `npm run package`（npm pack --dry-run）+ `node dist/cli.js selftest` ok 5/5 |
| 33-check 回归 | exit 0 PASS 8/8 + `ALARM mw-trigger-b`（触发登记的值守输出） |

## ⑦ 教训

1. **「结构断言 ≠ 行为证明」**：store.ts 经 #20/#21 结构守卫全过却藏着 fact_seq 无赋值+FK 无种子两个致命缺陷——唯一写入口首次端到端实跑才暴露。凡「只被结构检查、从未实跑」的写路径，preview 票必须把它列入实跑面（本票顺手修复并如实登记）。
2. **fact_id 内容寻址 → 同内容即同一事实**：两个采集函数 emit 同值 resolution fact 撞 UNIQUE 是 schema 的正确行为；采集汇总层须按 fact_id 去重并留痕（dedup_dropped），而非改 id 伪造唯一性。
3. **外部仓混排 ADR 格式 = v2 回退链的主战场**：anysearch-cli 65 份里 dash 腿仅 17 命中，inline/inline-iso/git 腿兜底把 decision_date 解析率拉到 65/65——#27 冻结的回退链设计在外部仓上被实证有效；`miss 176`（Deciders/Ledger 等字段缺）属诚实数据缺口不是解析失败。
4. **二进制工件要干净关闭**：DuckDB 连接不 close 会留 `.wal` 侧文件——FORCE CHECKPOINT + closeSync 才能落单文件可复验库。
