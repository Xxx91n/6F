# 39-report — Macro-B 三仓 one-shot 泛化验证＋jiahao 持续回归接入 CI（触发器 a 激活即实测封口）

> 票：#39 / R5-08｜A-xxx：A-044｜决定：D-033②（时序+回归仓指派）、D-034④a（多写者触发器 (a)）、D-024（self-probe 两字段纪律）
> issue：`.scratch/architecture-recovery/issues/39-macro-b-three-repo.md`；handoff：`.scratch/architecture-recovery/handoffs/39-macro-b-three-repo.md`
> 阻塞状态：**None**（#37 已闭环，capacity 矩阵为指派依据）
> 实跑存档：`.scratch/architecture-recovery/reports/39-macro-b-measurements.json`（探针 `39-macro-b-one-shot.mjs` 生成；**三仓只读零写入**）

## ① 开工复述

必读清单逐条已解析：issues/39 + handoffs/39 + prompts/39、spec.md §R5-D8、WORKFLOW §4.2、A-044 行（current）、macro-audit 账本 D-024/D-033/D-034 行、ADR-0012/0013/0015、`.github/workflows/engine-ci.yml`、30-desk-calibration.json 任务 7 行、CONTEXT.md（Self-probe / Trigger-gated Closure / Pilot-surface Audit）、37-pilot-measurements.json + 37-report.md（capacity 矩阵 + D-033 对照）、38-macro-c-preview.mjs + 38-check.mjs（preview_disclosure 契约面 + 共享库先例）、33-gate-registry.json（mw-trigger-a/b/c + mw-regression-ci + desk-task7）、engine/src 全树（collect/run/report 链）。**本票不改 engine 源码** → 验收链以既有 `npm test` 不回归为准（见 ⑥）。

## ② 调研（实测探针为主通道——atomcode carrier 本窗口不可用，如实登记）

调研通道 = 三仓只读实测（`39-macro-b-one-shot.mjs` 全链复用已上架采集面）+ 多写者真并发实测（`39-mw-self-probe.mjs` 子进程争用）+ 账本/spec 原文对账。工业先例（训练语料级，未本窗口重验，如实登记）：① 定时回归 = cron-scheduled audit job 与 OpenSSF Scorecard weekly-scan / Dependabot scheduled run 同构（定时审计≠PR 门禁，两类 CI 面分离）；② 「结果三档不总是绿」与 Chaos/fitness-function 报告的"测量值非通过线"惯例一致（反复接受非跑通 = D-033 已入规）。冲突核查：本票实测与 D-033/D-034 无冲突——jiahao 回归仓指派经 #37 实测前提成立（托管面证伪后 Macro-B 回归角色反而更稳）；D-033「无托管下限」语义缺口仍挂 #37 呈报项，不在本票裁决范围。

## ③ 开源轮子

零新增依赖：`39-macro-b-one-shot.mjs` 纯 ESM Node + `git -C <repo>` 只读子命令 + engine/dist 采集器（adr-structure@v2 / positioning@v1 / gitlog@v1）+ buildReport/degradeReport + store.ts appendFact；`39-mw-self-probe.mjs`/`39-mw-child.mjs` 以 spawn 子进程制造**真实**并发争用（非模拟）；jiahao workflow 复用 actions/checkout@v4 + setup-node@v4 官方件。

## ④ 完成定义 vs 实际

### 4.1 三仓 Macro-B one-shot（逐仓报告产物 + 证据锚）

| 仓 | commits | ADR | facts | PC-1/PC-2 | TC-1 | TC-2 | TC-3 | NC-1 | **overall** | receipt |
|---|---|---|---|---|---|---|---|---|---|---|
| env-manager | 496 | 14 | 276 | PASS/PASS | NOT_RED(n=8) | NOT_RED(mean=0.8857) | GREEN(0.9000) | PASS | **supported** | `RCP-b1106d4112171be9` |
| anysearch-cli | 314 | 65 | 1041 | PASS/PASS | NOT_RED(n=65) | **RED**(mean=0.6462，Status 缺失率 0.7385>0.50) | GREEN(0.8500) | PASS | **unsupported** | `RCP-b87bc53eb457a9fc` |
| jiahao | 251 | 69 | 1101 | PASS/PASS | NOT_RED(n=69) | NOT_RED(mean=0.9275) | GREEN(0.9000) | PASS | **supported** | `RCP-4d1b294f6e2b0a07` |

产物（`.scratch/architecture-recovery/reports/`）：`39-macro-b-<repo>.{md,json}` 报告三份 + `39-macro-b-<repo>-facts.jsonl` + `39-macro-b-<repo>-measurements.json` + 汇总 `39-macro-b-measurements.json` + 共享事实库 `39-audit-facts.duckdb`（**同一 audit_fact 表：3 repo_ref × Macro-B = 2418 行**，同一 appendFact 写路径，dedup_dropped=0）。每份报告含 C1-C4 骨架 + RECEIPT + 披露块（`capability 1 of 5 · preview` + 单仓→三仓校准域 + dogfooding 结构性限制）+ 6 裁决条目引文全 supports。

**诚实落数（反复接受非跑通）**：anysearch-cli 判 **unsupported**——TC-2 RED（Status 头缺失率 73.85% 超 0.50 预声明阈值；该仓 ADR 以混排格式书写，v2 回退链解析 Status 命中率低）——这是合法实验数据非管线失败：PC-1/PC-2 正对照 PASS 证明管线活性、NC-1 负对照 PASS 证明特异性。

### 4.2 jiahao 持续回归 CI 接入（写入对象裁定）

裁定：**写 jiahao 仓**（票 DoD「jiahao 持续回归接入 CI」主语=jiahao 的回归；D-033②「jiahao 挂 Macro-B 持续回归」）。落点 `D:\Aworker\jiahao\.github\workflows\macro-b-regression.yml`：
- **触发面写明**：`schedule`（cron 周一 03:17 UTC 定时回归，D-034④a 语义）+ `workflow_dispatch`（手动复跑）；**不接 push/pull_request**——回归≠PR 门禁（PR 门属本仓 ci.yml 自有面）。
- **已上架层限定**：只跑 Macro-B one-shot（`39-macro-b-one-shot.mjs --repo jiahao --root $GITHUB_WORKSPACE/audited-repo --out macro-b-artifacts`，单仓形态已本机实测复跑同 receipt）；preview 层不混。
- **链**：checkout 本仓全历史（fetch-depth:0 供 gitlog）+ checkout `Xxx91n/6F` 引擎仓（私仓需 `MACRO_AUDIT_6F_TOKEN`，公仓回落 github.token；ref=main 注释要求首跑前钉 SHA per D-037）→ npm install/gen/build → one-shot → verify 工件（receipt+scale+md 存在）→ upload-artifact。
- **job 绿语义**：管线跑通+工件齐备（非裁定绿——裁定三档如实）。
- **VCS**：jiahao 仓自行 commit——`but commit -b r9-39-macro-b-regression`，commit `84077dab`（but id `zqm`），仅该 workflow 单文件变更，工作树零残留。

### 4.3 触发器 (a) 激活 = 多写者 self-probe 实测封口（衔接 #33）

- **registry 翻转**：`33-gate-registry.json` event `mw-regression-ci`→occurred=true+证据；`mw-trigger-a` 追加 confirmations（trigger-fired，D-034④ 判据版）→ 33-check 输出 `ALARM mw-trigger-a`（与 mw-trigger-b 同值守通道，收口窗口拍板）。
- **self-probe 实测执行**（`39-mw-self-probe.mjs` + `39-mw-child.mjs`，专用探针库 `39-mw-probe.duckdb`，父进程零持锁零污染）：
  | 实测面 | 读数 |
  |---|---|
  | 同进程第二 openWriter | **denied**（DuckDB 单文件锁 fail-fast） |
  | 单写者并发 append | 30/30 ok（单连接内并发任务序列化成立） |
  | 写者持有期 openReader | **denied** |
  | conn.closeSync 后再 openWriter | **denied**——**DuckDBInstance 持锁至进程退出**（实测暴露的资源生命周期事实） |
  | 跨进程并行写者 ×4 | **1 胜 3 lock_denied**（互斥化，无撕裂写） |
  | 跨进程串行写者 ×2 | 2/2 成立（SWMR 跨进程追加） |
  | 持锁中 reader/writer 并发 | reader denied / writer lock_denied |
  | 终读回 | **66/66 行零重复 fact_id** |
- **判据读数**（task7 satisfaction「并发写入无丢行/乱序/冲突」）：并行多写者被单文件锁互斥化——**无丢行无乱序（锁拒非丢）但亦不并行** → 并发策略维持 **SWMR 单写者序列化门面**（store.ts 唯一写入口即门面）；多采集器并行直写同一 fact 表不满足判据。`desk-task7` 状态翻转 **triggered-bound**（bound_to self-probe 结果→收口窗口裁决）+ confirmations `self-probe-executed` 落文。
- **新发现登记（呈报非裁决）**：`store.ts openWriter` 只回传 connection，instance closeSync 无门面 → **文件锁在进程内不可释放**（实测 reopen denied 佐证）；跨进程 CI/回归面天然规避（每 job 独立进程），但同进程「写后读回」场景受此约束——登记为收口窗口/后续票候选议题。

### 4.4 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| 三仓 Macro-B one-shot 各一份报告产物（证据锚齐） | §4.1：3×{md,json,facts,meas}+共享库；锚=facts 数/receipt/live HEAD（39-check B 组逐仓验） |
| jiahao 回归 CI 接入（workflow 变更 + 触发面写明） | §4.2：macro-b-regression.yml（schedule+dispatch，无 push/PR）；jiahao commit 84077dab @ r9-39-macro-b-regression |
| 多写者 self-probe 实测封口：任务 7 登记项状态翻转 + 实测结果落文 | §4.3：desk-task7→triggered-bound+confirmations；39-mw-self-probe.json 五面读数 |
| 守卫 PASS；ledger A-044 done；WORKFLOW §4 lessons；commit 引 A-044+守卫 | `39-check.mjs` PASS 见 ⑥；账本/lessons/commit 见收口 |

## ⑤ 卡死 3 连问 + 决策对照

无卡死。**写入对象歧义**（jiahao workflow vs 本仓回归 job）：按票 DoD 主语裁定写 jiahao 仓（§4.2），本仓零 workflow 变更。**anysearch-cli unsupported 裁定**：TC-2 Status 缺失率超线判 RED——如实落数不补阈值不调 detector（量测效度纪律：判据跑前写死跑后禁调）。**与 #37 呈报项的关系**：jiahao 托管面证伪使「无托管下限」样本缺位仍挂原呈报通道（#37 报告 §5），本票 Macro-B 回归指派不受影响。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| 三仓 one-shot 实跑、零写被测仓 | `node .scratch/architecture-recovery/reports/39-macro-b-one-shot.mjs` → 逐仓摘要+duckdb 计数，exit 0；`git -C <repo> status --porcelain` 三仓空 |
| 证据锚可回查 | 39-check B 组：facts>0 + `RCP-*` + `git cat-file -t <head_sha>`=commit（产物锚定生成时刻，#23 教训——jiahao 审计锚 9e82760 在 workflow commit 后 HEAD 已前移，不与易变 HEAD 等值比较） |
| 报告形态合规 | 39-check C 组：C1-C4+RECEIPT+披露块 capability 1 of 5+6 裁决+引文全 supports+supply_chain ⚠ 数据未接 |
| 共享事实库 | 39-check D1/D2：单 scale Macro-B + 3 repo_ref + 2418 行=jsonl 总和 |
| jiahao CI 接入 | 39-check F 组：workflow 触发面/链/已上架层注释 + `git -C jiahao log -1 r9-39-macro-b-regression` 含 A-044 + 工作树净 |
| registry 翻转 | 39-check E 组 + `node 33-check.mjs` → PASS 8/8 + `ALARM mw-trigger-a` + `BOUND desk-task7` |
| self-probe 实测 | `node .scratch/architecture-recovery/reports/39-mw-self-probe.mjs` → 五面读数 + 66/66 零 dup；39-check G 组逐值断言 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/39-check.mjs` → **PASS N/N**，exit 0 |
| engine 不回归（零 engine 源码改动） | `cd engine && npm test` → GEN-OK + tsc 0 错 + SMOKE 6/6 + COLLECTORS 14/14 + ADAPTER 7/7 + BATCH1 41/41 + LLM 25/25 + REPORT-PREVIEW 5/5；`npm run package` 31 files 27.5kB；`node dist/cli.js selftest` ok 5/5 |
| 单仓 CI 形态可复跑 | `node 39-macro-b-one-shot.mjs --repo jiahao --root D:/Aworker/jiahao --out <dir>` → 同 receipt RCP-4d1b294f6e2b0a07（确定性） |

## ⑦ 教训

1. **DuckDB 文件锁属 instance 而非 connection**：`store.ts openWriter` 只回传 connection，`closeSync` 后锁仍在（同进程 reopen/reader 皆拒）——「写后同进程读回」在本门面下天然不可行；实测暴露前只能从 C++ 锁语义猜，现已落数为证（收口窗口可评估是否给 store 加 instance 释放门面）。
2. **self-probe 要真并发就别让父进程持锁**：初版父进程先开 writer 再起子进程，全部读数被父锁污染（B1/B2 全 lock_denied 假象）；重构为父进程零持锁+子进程互打后读数才真实——测量装置自身污染是 self-probe 头号坑。
3. **「接入即触发」动作要把证据锚写进 workflow 本体**：触发面/已上架层限定/job 绿语义全部注释进 yml，登记表 confirmations 指回文件——不依赖口头转述。
