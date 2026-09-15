# 44-report — 版本与上游锁定制度化（upstream-lock.yaml 种子行＋README §3 绑定＋守卫族 advisory→enforce）

> 票：#44 / R6-01｜A-xxx：A-049｜决定：D-037（版本与上游锁定制度化六条）、D-039③（编年指针守卫并入）、ADR-0018、docs/versioning.md
> issue：`.scratch/architecture-recovery/issues/44-upstream-lock.md`；handoff：`.scratch/architecture-recovery/handoffs/44-upstream-lock.md`；prompt：`.scratch/architecture-recovery/prompts/44-upstream-lock.md`
> 阻塞状态：**None**（DoR 闭合——决策已冻结；本票为 P0 首发 tag 硬前置链一环）
> 核心产物：`engine/upstream-lock.yaml`（6 行种子）、`README.md` §3 状态列绑定、`.scratch/architecture-recovery/reports/44-check.mjs`（56 断言）

## ① 开工复述

必读清单逐条已解析：next-round.md T4 行（任务书原文四节）、BACKLOG #44 行（D-037/D-039 覆盖、阶段 3 早期、禁 range/浮动 tag）、spec-phase-tasks.md R6-01 行（P0 首发 tag 硬前置）、A 账本 A-049 行、macro-audit 账本 D-037（锁表制度六条逐字：字段契约/种子行/手动窗口/advisory→enforce/落位三处）与 D-039③（指针有效性校验并入 #44）、docs/versioning.md（已成文——§3 字段契约与种子行、§4 更新节奏、§5 门禁四件套）、docs/adr/0018（§D-1 锁定制度化/§D-2 双层 CHANGELOG）、engine/src/upstream/codelore.ts（CODELORE_PINNED_VERSION='0.28.0'、binary-discovery、resolveCodelore）、README.md §3 上游清单表+§能力边界节、engine/src/report/generate.ts（PreviewDisclosure 四字段+UNVERIFIED_MARK）、examples/first-report/README.md（preview_disclosure 时点差注记）、仓根/engine CHANGELOG（双账互指）、reports/33-gate-registry.json（25-P2 decided→D-037）、reports/{41a,43,45}-check.mjs（守卫先例）。

**票档补立（计票内）**：#44 开工前 issues/handoffs/prompts 三件套缺位（#45/#41a 报告已呈报 R6 票据包同型缺口）——按 issues/41a 模板补立 44-upstream-lock 三件套后开工。

## ② 调研（决策原文对账 + 先例回顾）

**D-037③④⑤⑥ 逐字对账**：③ 锁表字段 `id/kind/version/pin_type(exact-version|commit-sha|digest)/contract/status(active|planned|evaluating|retired)/adapter/last_reviewed/next_review`——retired 行不删、种子行 codelore=active(exact-version＋--version 契约)/scorecard+repomix=planned/sqlite-dump=evaluating＋风险注记；④ 更新=手动窗口（每 release 前）＋全量 golden 回归，禁 Renovate 式自动升级；⑤ 门禁=advisory→enforce 两段式（deterministic-deps 模式：版本断言 job＋锁定表新鲜度＋三处标注同源＋golden diff）→独立小票 #44；⑥ 落位=versioning.md 成文（已有）＋README §3 状态列指向锁表为机读权威＋CHANGELOG entry 引用 lock diff。**D-039③**：指针有效性校验（引用 ADR 存在且非 superseded、里程碑 ID/日期单调、双账互指）并入 #44 同族「声明↔实物一致性」advisory→enforce 机检。

**先例回顾**：① deterministic-deps 两段式门禁=先 advisory 报警后 enforce 断流——本守卫 WARN/FAIL 双通道同构；② lockfile-lint/npm ci 类 pin 校验=版本串禁 range 前缀为基线断言（A7 机检）；③ golden diff 段已由 #43 golden-ci.yml enforce（两腿重渲染+逐字节 diff），本守卫不重复造腿、G/D 组作引用锚；④ 41a-check 的「区间实物反推」模式复用于编年指针校验（adr_range/a_range 写时读出对比实物）；⑤ binary-discovery 契约=适配器既有机制（resolveCodelore 已实跑 --version==pin），守卫把它升格为三方同值断言（binary↔锁表↔源内常量）。

**原子性纪律**：上游版本一律经锁表登记、禁未 pin 接入——README §3 五行全须锁表可反查，故种子行在 D-037 四行原文之外补 duckdb-node-api/git-cli 两行 active（登记为绑定完整性扩展，非静默加面，见 ⑤ 裁定 2）。

## ③ 开源轮子/落地物

- `engine/upstream-lock.yaml`（新增 4.4kB）：`lock_version: 1`＋`upstreams:` 六行——codelore（active/exact-version 0.28.0/--version pin 契约/adapter=codelore.ts）、duckdb-node-api（active/exact-version 1.5.5-r.4/package-lock 契约）、git-cli（active/version=null 随宿主环境·输出解析为契约）、openssf-scorecard（planned）、repomix-gitingest（planned）、codelore-sqlite-dump（evaluating＋risk_note）。表头注释=纪律本体：唯一机读权威/锁定先于依赖/retired 不删/禁 range·浮动 tag·latest/手动窗口＋golden 回归/next_review 语义。
- `README.md` §3：状态列五格加机读枚举括注（已接入（active）/规划中（planned））＋表下权威绑定注记（唯一权威=engine/upstream-lock.yaml、状态映射、锁定纪律、sqlite-dump 评估中条目注明）。
- `engine/CHANGELOG.md`：`## [Unreleased]` Added 条目引 upstream-lock.yaml 种子行（D-037⑥ CHANGELOG entry 引 lock diff 落位）；0.1.0 历史条目不动。
- `engine/package.json`：`files` += `upstream-lock.yaml`——报告 provenance 锚（锁定表快照 hash，versioning.md §2）随 tgz 分发；npm pack 实测 54 files/76.1kB 含该文件。
- `CHANGELOG.md`（仓根）M-001 adr_range 注记补全：`ADR-0002 superseded` → `ADR-0002/ADR-0010 superseded`——**守卫 F4 首跑抓出的真实注记缺口**（0010 亦被 0011 supersede，写时漏计），按「如实计」纪律补齐两枚。
- `.scratch/architecture-recovery/reports/44-check.mjs`（新增）：56 断言八组＋yaml 子集解析器（锁表格式受控，零外部依赖）＋`codelore --version` 实跑＋两段式 PASS/WARN 通道。
- 票档三件套补立：issues/handoffs/prompts/44-upstream-lock.md。

**engine 源码零改动**（新增=数据文件/文档/守卫；package.json 仅 files 元数据＋1 行）；upstream/ 层零改动（ADR-0014）。

## ④ 完成定义 vs 实际

### 4.1 任务书 T4 四节逐项

| 任务书原文 | 落地 | 证据 |
|---|---|---|
| ① upstream-lock.yaml 种子行（codelore active exact-version＋--version 契约／scorecard+repomix planned／sqlite-dump evaluating，每行状态/版本/校验方式字段） | 六行落盘：种子四行状态逐字＋duckdb/git-cli 补行；九字段逐行齐备；sqlite-dump 带 risk_note | 44-check A1-A11 |
| ② README §3 上游表状态列绑锁表为机读权威（注明「以 engine/upstream-lock.yaml 为唯一权威」） | 状态列括注枚举值＋表下唯一权威注记＋人读↔机读映射声明 | 44-check D1-D6 |
| ③ 守卫族——版本断言（实跑 --version==锁表）＋锁表新鲜度（mtime/日期断言）＋三处 preview 标注同源＋编年指针校验，advisory→enforce 两段式 | B 组三方同值实跑 0.28.0；C 组 mtime/日期+逾期 WARN；E 组三处共享 token＋文档↔产物印记绑定；F 组 ADR 存在+superseded 如实计/M 单调/双账互指；两段式 PASS/WARN 通道 | 44-check B/C/E/F 组 |
| ④ 44-report.md 六段式＋macro-audit 日报窗口节 | 本报告＋2026-09-16-report.md「窗口：#44」节 | 44-check G8/G9 |

### 4.2 两段式留位（本票按任务书写明哪段已 enforce）

| 段 | 范围 | 状态 |
|---|---|---|
| **ENFORCE（FAIL 即 exit 1）** | A 锁表结构/种子行/枚举/禁 range·浮动、B binary 可解析时版本断言三方同值、C 日期格式/mtime 断言、D README 绑定、E 三处标注同源、F 编年指针、G 文档账本、H BOM | **本票已 enforce** |
| **ADVISORY（WARN 报警非失败）** | C5 锁表新鲜度逾期（next_review<营业日）、B4/B5 binary 不在 PATH 环境位 | advisory——转 enforce 触发点=首发 tag 手动窗口（D-037④）或对应上游接入票落地 |
| golden diff 段 | engine/examples golden 逐字节 diff | 已由 #43 golden-ci.yml enforce（本守卫不重复造腿） |

### 4.3 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| 锁表九字段契约＋种子行状态逐字＋风险注记＋表头纪律 | §4.1①：44-check A1-A11 全 PASS |
| README 绑定＋engine/CHANGELOG Unreleased 引 lock | §4.1②：D1-D6/F8 全 PASS |
| 守卫四件套＋两段式写明 enforce 段 | §4.1③/4.2：B/C/E/F 组全 PASS＋文件头与本报写明 |
| 44-report 六段＋日报窗口节 | §4.1④ |
| ledger/lessons/issue/next-round/BACKLOG/commit 引 A-049+守卫 | 见收口段 |
| npm test 不回归 | ⑥：全链绿（GEN-OK+tsc 0 错+SMOKE 6/6+COLLECTORS 14/14+ADAPTER 7/7+BATCH1 41/41+LLM 25/25+REPORT-PREVIEW 5/5+INTAKE 31/31+DEMO 38/38）；package 54f 76.1kB；selftest 5/5 |

## ⑤ 卡死 3 连问 + 决策对照

无卡死。**裁定 1——种子行是否补 duckdb/git-cli**：取补。D-037③ 种子原文枚举四行，但同条「锁定表先于依赖存在/禁未 pin 接入」＋T4②「README §3 状态列绑锁表为机读权威」要求 README 五行全可反查——duckdb/git-cli 已在接入态，锁表缺行使「唯一权威」对两行失言。补两行 active（pin 纪律照实物：package-lock 精确值/随宿主环境契约），性质=绑定完整性扩展非新接入，报告显式登记。**裁定 2——superseded 判定口径**：Status 头行「Status: superseded」为判据（正文提 supersedes 关系不算）——首跑按全文误报 0011/0017，锐化后实得 0002/0010 两枚，顺带抓出 M-001 注记漏计 0010（补全）。**裁定 3——新鲜度日期基准**：用仓内业务时钟（本地日期 ∪ 日报文件名日期）而非 UTC 墙钟——toISOString 在 UTC+8 下回退一天致 last_reviewed 误判未来；账本正文日期不可扫（含 2026-12-10 截止日会污染「今天」）。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| 锁表在位/九字段/枚举/种子行逐字/禁 range/risk_note/表头纪律 | `node .scratch/architecture-recovery/reports/44-check.mjs` A1-A11 |
| 版本断言三方同值：binary 0.28.0==锁表==CODELORE_PINNED_VERSION | 44-check B1-B6（实跑 `codelore --version` exit 0） |
| 锁表新鲜度：mtime≤now、ISO 日期、last≤today≤next_review | 44-check C1-C5（C5 为 advisory 段） |
| README §3 五行状态↔锁表同源＋唯一权威注记 | 44-check D1-D6 |
| 三处 preview 标注同源＋文档↔产物印记绑定（1 of 5↔golden、2 of 5↔#38 实物） | 44-check E1-E8 |
| 编年指针：ADR 区间存在+superseded 如实计（0002/0010）/M 单调/双账互指/Unreleased 引 lock | 44-check F1-F8 |
| engine 全链绿不回归 | `cd engine && npm test` → GEN-OK＋tsc 0 错＋SMOKE 6/6＋COLLECTORS 14/14＋ADAPTER 7/7＋BATCH1 41/41＋LLM 25/25＋REPORT-PREVIEW 5/5＋INTAKE 31/31＋DEMO 38/38；`npm run package` 54 files 76.1kB（upstream-lock.yaml 入 tgz）；`node dist/cli.js selftest` ok 5/5 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/44-check.mjs` → **PASS 56/56**，WARN 0，exit 0 |
| 票档三件套/账本/lessons/任务书/BACKLOG/日报窗口节 | 44-check G1-G9 |

## ⑦ 教训

1. **「唯一权威」断言须先覆盖全集再谈绑定**：README 五行若只绑四行种子，两行失言比不绑定更糟——补 duckdb/git-cli 行使状态列全可反查；锁表先于依赖的规则反向要求已接入项补登记。
2. **日期断言勿用 UTC 墙钟当业务「今天」**：`toISOString()` 在 UTC+8 回退一天；账本正文日期含未来截止日不可扫——业务时钟取本地日期 ∪ 日报文件名日期最稳。
3. **「superseded」全文匹配误报高**：正文提 supersedes 关系≠自身被 supersede——判据锚定 Status 头行；守卫首跑即抓出 M-001 漏计 ADR-0010（已补全），机检价值实证。
4. **两段式门禁落地=双计数器非双脚本**：PASS/WARN 分离计数＋exit 只看 FAIL——binary 缺席与锁表逾期属环境/节奏位，作 WARN；结构与同源断言全 enforce。
5. **yaml 子集解析器可控即够用**：零依赖守卫不引 js-yaml——锁表格式自造自守（顶层标量+行组+行内零嵌套），解析器 30 行随票走。
