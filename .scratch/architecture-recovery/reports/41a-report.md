# 41a-report — 分发收尾·仓内文档面（样例落位＋README 边界/preview/0.x/Try 节＋仓根编年首条）

> 票：#41a / R6-03｜A-xxx：A-051｜决定：D-030（样例资产披露制）、D-031（P6 preview 形态）、D-032（演示面披露非资产）、D-038④（Try-on-real-repo 节）、D-039②（双层 CHANGELOG 分工）、D-040（#41 拆分调度）
> issue：`.scratch/architecture-recovery/issues/41a-distribution-docs.md`；handoff：`.scratch/architecture-recovery/handoffs/41a-distribution-docs.md`；prompt：`.scratch/architecture-recovery/prompts/41a-distribution-docs.md`
> 阻塞状态：**None**（DoR 闭合——原 #41 唯一前置 #34 已 done；filler 优先级不占关键路径）
> 上架面声明：**上架动作未执行（用户闸门）**——listing/字段查证/凭据属 #41b，blocked-by 用户闸门＋listing-submission，本票不碰。

## ① 开工复述

必读清单逐条已解析：next-round.md T6 行（任务书原文）、BACKLOG #41a 行、issues/handoffs/prompts/41-distribution-closeout.md（原 #41 票——本票继承其仓内文档面）、A-051/A-046 账本行、macro-audit 账本 D-030/D-031/D-032/D-038/D-039/D-040 行、docs/adr/0016（渠道=Agent Plugins only，不虚报可安装）/0017（preview 发布模型）/0018（双层 CHANGELOG 分工）、docs/versioning.md（0.x 语义）、engine/CHANGELOG.md:6（反向指针·W4 悬空呈报）、engine/src/report/generate.ts（preview_disclosure 同一语义源）、reports/23-first-report.{md,json}+failure 双件（样例四件源）＋23-first-report.mjs（重生成入口）、reports/45-check.mjs/45-report.md（守卫与报告先例）、docs/decisions/README.md、README.md（现状）。

**票档补立（计票内）**：#41a 开工前 issues/handoffs/prompts 三件套缺位（issues/ 无 41a 档）——按 issues/40 模板补立 41a-distribution-docs 三件套后开工；与 #45 窗口登记的「R6 票据包票档缺位」同型缺口，本票补齐本票面。

## ② 调研（决策原文对账 + 先例回顾）

**冻结决策逐字对账（唯一事实源）**：
- **D-030②**：四件=发布样例资产，落位仓根 examples/first-report/（**复制非移动**，.scratch 原件留溯源链），一页 README 声明「6F 自审真实产物、非合成 fixture」＋生成 commit＋日期＋重生成命令；防失真=披露制（provenance 锚＋⚠ unverified 段）；③ 样例不得被读作「当前读数」——冻结时点属性（commit＋日期戳）。
- **D-031①②/ADR-0017**：形态=「capability 1 of 5 · preview」＋0.x 语义＋changelog 明示覆盖范围；README 首段披露能力边界，5 scale 作 roadmap 叙事非可用承诺；build-scope≠release-sequence 划界。
- **D-032①③**：上架期演示面=仅 Macro-B happy+failure 双件；未上架层仅文字披露＋「Not yet in preview」标注，禁造资产化演示。
- **D-038④**：README 设「Try on a real repository」节给 1-2 个 opt-in 公共小仓链接＋「外部内容随上游变化不可 golden 预期」标注。
- **D-039②/ADR-0018 §D-2**：仓根 CHANGELOG.md=里程碑编年指针制——`## [M-xxx] - ISO日期` 键、禁版本号头、固定字段行（里程碑名/ADR 区间/执行账 A 区间/账本节指针/一行影响声明）只引用不复制；engine/CHANGELOG.md 反向指针；首条=spec/decision 阶段封口，区间写文件时实物读出。
- **D-040**：本票=仓内文档面，filler 就绪即做；README/编年改动受 #44 指针守卫族覆盖；护栏=边界文案以冻结决策为唯一事实源。

**先例回顾**：① erf/preflight-scout 披露双先例（D-030 调研已核）→ 披露 README 四要素形态；② Snyk/MS Entra/Boomi 披露制先例（D-032 调研已核）→ 未上架层文字披露+Not yet 标注；③ keepachangelog 指针制（D-039 调研已核）→ 编年条目机器可解析固定字段；④ #38 preview_disclosure 契约面→README 边界标注同一语义源（generate.ts PreviewDisclosure），Macro-C 印记=capability 2 of 5 · preview。

## ③ 产物面（零 engine 源码改动，纯仓内文档面）

- `examples/first-report/`：四件复制（23-first-report.{md,json}＋23-first-report-failure.{md,json}，与 .scratch 原件逐字节 sha256 一致，原件留溯源链）＋`README.md` 披露页。
- `README.md`：状态注刷新（2026-09-16 preview 形态）＋新增「能力边界（preview 标注）」节（五层矩阵＋0.x 语义＋双 CHANGELOG 指针）＋「演示与样例」节（demo＋examples 公共路径）＋「Try on a real repository」节（gsd-core opt-in＋外部内容随上游变化标注＋repo add=intake 面如实注）＋仓库地图补 examples/CHANGELOG 行并同步账本编号区间。
- `CHANGELOG.md`（仓根新建）：编年首条 `## [M-001] - 2026-09-15`（spec/decision 阶段封口）＋五字段行，区间实物读出。
- `engine/CHANGELOG.md`：反向指针注记改写为闭环（「待 #41a 落盘」→「已于 #41a 落盘」，W4 悬空指针清零）。
- `docs/decisions/README.md`：ADR-0016/0017/0018 映射行顺手精化（A-051 归位）。
- `reports/41a-check.mjs`：39 断言守卫（只读，exit 0 + PASS N/N）。
- 票档补立：issues/handoffs/prompts/41a-distribution-docs.md。

## ④ 完成定义 vs 实际

### 4.1 决策原文逐项

| 决策原文 | 落地 | 证据 |
|---|---|---|
| 四件复制非移动＋.scratch 原件留溯源链 | `examples/first-report/` 四件，sha256 与原件逐字节一致；原件在 | 41a-check B1-B3 |
| 披露 README：真实产物声明＋commit＋日期＋重生成命令 | 四要素齐（fc00d458…／2026-09-13T14:31:09+08:00／23-first-report.mjs）＋冻结时点+failure 性质+preview_disclosure 时点差三处如实注 | 41a-check B4-B6 |
| README 首段能力边界＋capability 标注＋0.x 语义＋changelog 覆盖 | 首段 NOTE＋专节矩阵（1 of 5=Macro-B／2 of 5=Macro-C／三层 Not yet）＋0.x 语义＋engine/仓根 CHANGELOG 双指针 | 41a-check C1-C5 |
| 未上架层只文字披露＋Not yet in preview | Micro-A/Micro-B/Macro-A 三层逐名标注；无资产化演示 | 41a-check C3/C10 |
| Try on a real repository：opt-in 链接＋外部内容随上游变化标注 | gsd-core 链接（2026-09-16 实测 1424f unsupported 如实引）＋标注＋repo add=intake 面如实注（不虚构 audit） | 41a-check C6-C7 |
| 引用只指公共路径不链 .scratch | README 样例引用=examples/first-report/；无 .scratch 样例路径 | 41a-check C8 |
| 仓根编年 M-xxx 键＋禁版本号头＋字段行只引用不复制＋区间实物读出 | `## [M-001] - 2026-09-15`＋五字段行；ADR-0001~0018/A-001~A-053/D-001~D-041 与实物反推一致 | 41a-check D1-D8 |
| engine/CHANGELOG 反向指针＋双账互指 | 指针在且「待落盘」残留清零；仓根指回 engine | 41a-check E1-E3 |
| 边界文案以冻结决策为唯一事实源 | 全部边界措辞回溯 ADR-0016/0017/0018＋D-030~032/D-038~040＋versioning.md＋披露块实物印记；无 capability 3/4/5 发明 | 41a-check C10＋§5 |

### 4.2 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| examples 四件＋披露 README 四要素齐 | §4.1 行 1-2（B1-B6 全 PASS） |
| README 边界/preview/0.x/Try 节＋未上架层 Not yet | §4.1 行 3-6（C1-C11 全 PASS） |
| 仓根 CHANGELOG 首条＋engine 反向指针闭环 | §4.1 行 7-8（D1-D8/E1-E3 全 PASS） |
| 边界文案可回溯冻结决策不发明 | §4.1 行 9＋§5 歧义 2 |
| 守卫 PASS＋ledger done＋lessons＋commit 引 A-051+守卫 | ⑥ 断言清单＋收口记录 |
| 报告显式声明上架未执行（用户闸门） | 文首阻塞状态块＋本节 |

## ⑤ 卡死 3 连问 + 决策对照

无卡死。**裁定歧义 1——README 边界矩阵的 capability 口径**：D-031① 原文写「capability 1 of 5 · preview」（单层期口径），但 #38 实物披露块已将 Macro-C 标为「capability 2 of 5 · preview」——取实物印记为准（同一语义源=generate.ts PreviewDisclosure），矩阵列两层 preview＋三层 Not yet；若照抄 D-031 旧口径会把已上架校准层抹掉/或反向把未校准层写成可用，两向都违诚实条款。**裁定歧义 2——Try 节是否虚构审计命令**：cli.js usage 实物只有 `--version|selftest|mcp|repo add|demo`——`repo add` 只交付 intake 接入面，对外部仓的完整审计以仓内脚本形态执行（A-044/A-045 实跑记录）；README 如实注「不虚构 audit 子命令」，与「不发明能力声明」护栏同向。**歧义 3——M-001 日期取封口日还是落盘日**：取里程碑发生日 2026-09-15（轮 7 收口拍板＋ADR-0018 最后落盘日），落盘窗口（#41a/2026-09-16）记入 impact 字段行——编年记「里程碑何时发生」非「何时补记」。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| 票档三件套在（按 40 模板补立） | `41a-check.mjs` A1-A2 |
| 四件落位＋逐字节=原件＋原件在 | 41a-check B1-B3；复制时 sha256 四件一致（57129c42/33d4ad75/760b27c1/df4be0e3 前缀） |
| 披露 README 四要素＋三处诚实标注 | 41a-check B4-B6 |
| README 边界矩阵＋preview 标注＋0.x＋Try 节＋不链 .scratch＋不虚报可安装＋无能力发明 | 41a-check C1-C11 |
| 仓根 CHANGELOG M-001＋字段行＋区间实物一致 | 41a-check D1-D8（守卫运行时重扫 docs/adr+双账本反推区间串） |
| 双账指针闭环（W4 悬空清零） | 41a-check E1-E3；engine/CHANGELOG.md:6 |
| 账本/文书落文（A-051 done／issue done／lessons／T6✅／BACKLOG✅／报告六段／日报窗口） | 41a-check F1-F8 |
| 新增/改动文件零 BOM | 41a-check G1 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/41a-check.mjs` → **PASS 39/39** exit 0 |
| npm test 不回归 | `cd engine && npm test` → GEN-OK＋tsc 0 错＋SMOKE 6/6＋COLLECTORS 14/14＋ADAPTER 7/7＋BATCH1 41/41＋LLM 25/25＋REPORT-PREVIEW 5/5＋INTAKE 31/31＋DEMO 38/38（本票零 engine 源码改动） |
| 上架动作未执行（用户闸门） | 本报告文首＋④ 显式声明；#41b blocked-by 不动 |

## ⑦ 教训

1. **披露页的「重生成命令」必须连带运行上下文**：23-first-report.mjs 审计的是 HEAD——冻结时点声明若不写「在生成 commit 工作树状态运行」，读者拿当前 HEAD 复跑会得到不同读数并误判失真。披露制防失真的最小闭环=commit pin＋日期戳＋「脚本读 HEAD」语义注记。
2. **多层 preview 的边界文案以产物印记为准**：D-031 的「capability 1 of 5」是单层期口径；#38 后 Macro-C 印记=capability 2 of 5——README 矩阵须从披露块实物倒推而非照抄决策原文旧口径。「同一语义源」落地=generate.ts PreviewDisclosure 与 README 标注双向可对。
3. **命令面以 CLI usage 为唯一事实源**：写「Try on a real repository」前对 cli.js usage 逐字核——`repo add` 只交付 intake，无 `audit` 子命令；如实注「审计管线以仓内脚本形态执行」比虚写命令更守 preview 诚实（不发明能力声明护栏机械化）。
4. **编年「区间写时实物读出」的机械化=守卫运行时反推**：41a-check D5-D7 重扫 docs/adr（18 件→ADR-0018）＋双账本唯一编号（A-053/D-041）拼区间串再断言——写死的区间串会随票据推进漂移，守卫反推使其过期即 FAIL。
5. **failure 样例的性质注记不可省**：failure 双件=degradeReport 确定性降级演示（同实跑渲染降级形态），不注明会被误读为真实采集事故——披露 README 加「不是一次真实采集事故的记录」与 preview_disclosure 时点差如实注，两处都是「诚实标注」而非免责修辞。
