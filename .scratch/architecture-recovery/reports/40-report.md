# 40-report — 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户，Macro-B GA 前置）

> 票：#40 / R5-09｜A-xxx：A-045｜决定：D-013（Repo Intake 五细则）、D-033（外部仓泛化下限 + dogfooding 边界）、D-034④（多写者触发器域，本票不触）
> issue：`.scratch/architecture-recovery/issues/40-external-repo-generalization.md`；handoff：`.scratch/architecture-recovery/handoffs/40-external-repo-generalization.md`
> 阻塞状态：**None**（#39 已闭环，三仓基线 + one-shot 管线 + 共享库先例全在位）
> 实跑存档：`reports/40-out/40-macro-b-measurements.json`（探针 `40-macro-b-one-shot.mjs`）+ `reports/40-intake-receipt.json` + `reports/40-external-comparison.json`（**目标仓只读零写入**）

## ① 开工复述

必读清单逐条已解析：issues/40 + handoffs/40 + prompts/40、spec.md §R5-D9/§R2-05、WORKFLOW §4、A-045 行、macro-audit 账本 D-013/D-033/D-034 行、docs/adr/0009（intake-local-first-url-optin）、CONTEXT.md（Repo Intake / Generalization Gate）、30-desk-calibration.json task2/task15 行、33-gate-registry.json（first-external-repo + desk-task2/15 绑定）、39-macro-b-one-shot.mjs 全链（复用对象）、39-check.mjs（断言面先例）、engine/src（cli/selftest/collect/run/report 链）。**本票 engine 源码增量 = intake 模块 + CLI 接线 + 契约测试**（ADR-0009 输入面落地），采集/裁决/报告层零改动。

## ② 调研（选型核验 + 先例回顾）

**目标仓选定**：`open-gsd/gsd-core`（`https://github.com/open-gsd/gsd-core.git`，默认分支 `next`）。经 GitHub API + raw 内容抽样核验：owner=open-gsd 公开组织**非 6F 同主**（与 env-manager/anysearch-cli/jiahao 无所有权关联）；真实 JS/TS 项目（package.json/tsconfig/eslint/tests 在位）；docs/adr 96 个 .md（92 个匹配语料命名）远超 min_n=5；5887 commits 历史深度充足；CONTEXT.md+README.md 意图面在位；head commit 2026-09-15 活跃维护。备选 `adr/madr` 因 docs/adr 探测 404 淘汰（落 `40-target-selection.json`）。**选型调研发现**：gsd-core ADR 头部为 `- **Field:**`（dash+加粗混排）形态，与三试点仓 dash/裸行形态不同——选型时即预判 v2 回退链可能部分漏认，如实登记为泛化压力测试点（§④ 实测证实）。

**工业先例回顾**（训练语料级，未本窗口重验，如实登记）：① 外部 OSS 仓泛化是 SE 量测研究标准做法——Qualitas Corpus / Defects4J / Bugs.jar 等语料均以「与工具开发无关的第三方仓」为泛化面，同主 dogfooding 不构成 evidence 与该惯例一致（D-033 入规同源）；② clone-to-isolated-cache + 全深度 + 禁远程配置执行与 GitHub Actions `actions/checkout` 隔离工作区 + `fetch-depth: 0` + 不执行被 checkout 仓配置惯例同构；③ 「凭据复用本地 git 链不新建凭据存储」与 gh CLI/git credential helper 委托惯例一致。冲突核查：本票实现与 D-013 五细则逐条对账无冲突。

## ③ 开源轮子

engine 增量三文件：`engine/src/intake/intake.ts`（repoAdd 输入裁决 + cloneToIsolatedCache）、`engine/src/cli.ts` 接线（`repo add <input> [--cache]`）、`engine/test/intake.test.mjs`（31 断言全离线——本地夹具 + file:// 等价路径实跑真 clone）。零新增 npm 依赖：纯 node:crypto/fs/child_process + `git` 子进程（复用本地凭据链——SSH agent/credential helper 即用即清，不新建凭据存储）。`40-macro-b-one-shot.mjs` = `39-macro-b-one-shot.mjs` 同构复用（管线/判据/阈值零改动；差异=默认目标+产物命名 40-*+披露块文案+条目 id 前缀，生成器 `make-40-script.mjs` 留痕可复算）。

## ④ 完成定义 vs 实际

### 4.1 URL opt-in 全路径实跑（D-013 五细则逐条落地）

`node engine/dist/cli.js repo add https://github.com/open-gsd/gsd-core.git --cache .scratch/architecture-recovery/reports/40-clone-cache` → 回执 `40-intake-receipt.json`：

| D-013 细则 | 落地 | 证据 |
|---|---|---|
| 输入裁决顺序（本地→owner/repo 本地优先→显式 URL 才 clone） | `classifyRepoInput`：`./`/`../` 强制本地、`owner/repo` 本地优先消歧（不存在→`OWNER-REPO-UNRESOLVED` 不隐式 clone）、https/ssh/git@/file 显式 URL → url 腿 | intake.test.mjs C1-C11/O1/O2 |
| 隔离缓存 | `<cache>/repos/sha256(url)[:16]/` = `40-clone-cache/repos/f0b1eba9471ef4de`；同 URL 复用、异源碰撞报 `INTAKE-CACHE-COLLISION` | 回执 + intake.test U1/U4/U5 |
| 凭据复用 | clone 走本地 git 凭据链（本环境为 https 公仓免凭据；私仓路径自动经 SSH agent/credential helper），不新建凭据存储 | `credentials: local-git-credential-chain` 恒定位 |
| 禁远程配置执行 | clone 产物 `core.hooksPath=<cache>/noop-hooks` + `protocol.ext.allow=never` + `core.symlinks=false`；不递归子模块；零写回用户工作区 | 实物 `git config --local` 读数（40-check B5/B6）|
| 全深度 + 浅 clone 拒绝 | clone 不传 `--depth`；产物 `is-shallow-repository=false`（5887 commits）；本地浅仓输入显式拒 `SHALLOW-CLONE-REJECTED` | intake.test S1-S3/U3 + 40-check B2/B7 |
| 入口收敛 | clone 仅经 `repo add` CLI；kernel MCP 查询面保持只读（intake 不被 mcp 面导入） | cli.ts repo 子命令；MCP 面零改动 |

二次 `repo add` 同 URL → `cloned:false` 幂等复用（回执即证据）。

### 4.2 Macro-B one-shot（外部仓，与三仓基线同管线同判据）

`node .scratch/architecture-recovery/reports/40-macro-b-one-shot.mjs --out .scratch/architecture-recovery/reports/40-out` →

| 仓 | 来源 | commits | ADR | facts | PC-1/PC-2 | TC-1 | TC-2 | TC-3 | NC-1 | **overall** | receipt |
|---|---|---|---|---|---|---|---|---|---|---|---|
| env-manager | 内部 dogfooding | 496 | 14 | 276 | PASS/PASS | NOT_RED(n=8) | NOT_RED(mean=0.8857) | GREEN(0.9000) | PASS | supported | RCP-b1106d41… |
| anysearch-cli | 内部 dogfooding | 314 | 65 | 1041 | PASS/PASS | NOT_RED(n=65) | **RED**(Status 真缺失率 0.7385) | GREEN(0.8500) | PASS | unsupported | RCP-b87bc53e… |
| jiahao | 内部 dogfooding | 251 | 69 | 1101 | PASS/PASS | NOT_RED(n=69) | NOT_RED(mean=0.9275) | GREEN(0.9000) | PASS | supported | RCP-4d1b294f… |
| **gsd-core** | **外部 URL opt-in** | 5887 | 92 | 1424 | PASS/PASS | NOT_RED(n=92) | **RED**(cond_b：Status 缺失率 0.9783) | GREEN(0.8000) | PASS | **unsupported** | `RCP-d4f119c5a2cac629` |

**泛化证据读数（40-external-comparison.json 机读对照）**：
- **管线在更大语料面不失真**：1424 facts（92 ADR/5887 commits）超基线上限 1101；PC-1/PC-2/NC-1 在外部输入下全 PASS。
- **TC-1 NOT_RED + judgeable_n=92**：92/92 ADR 全经 git 首提交日可判，>90d 滞后占比 0.0000——外部仓 ADR 事后补写无据；**desk-task2 满足判据（≥1 外部仓 TC-1 judgeable≥5）达成**。
- **TC-3 GREEN**（CONTEXT.md 1.0000 / README.md 0.8000）：定位采集面对外部意图文档直接可用。
- **TC-2 RED——可归属原因与 anysearch-cli 不同**：gsd-core mean_ratio_4=0.7478（cond_a 不触发），cond_b 由 Status 缺失率 0.9783 触发；而 Context/Decision/Consequences 缺失率仅 0.163/0.076/0.044。**Status 行形态 `- **Status:** Accepted`（dash+加粗）先被 dash 正则挡下再被 inline 拒绝——v2 四腿（dash→inline→inline-iso→git）均漏认**。v2 冻结于 27-prereg（判据跑后禁调），故缺口如实落数不修 detector；登记为 v3 腿可归属原因候选（报告 R-40-GSDCORE-1 建议 P1）。**同一 unsupported 裁定、不同归因：anysearch-cli=真缺失主导，gsd-core=漏认主导**——这是外部泛化的核心新发现（§⑦ lessons）。
- **报告披露块已改外部仓校准面**（`calibration_scope: 外部公开仓 URL opt-in 泛化验证`），不残留「同主三试点仓」文案。

### 4.3 registry 与挂门处置

- `first-external-repo` → **occurred=true** + 证据锚（实跑完成后翻转）。
- `desk-task2` → **triggered-bound**（判据达成：gsd-core TC-1 judgeable=92≥min_n 5）+ confirmations `trigger-fired-criterion-met`。
- `desk-task15` → **pending 保持** + confirmations `trigger-fired-criterion-unmet`（判据=「≥1 条 Micro-A 真实 PR 报告」，Micro-A 未上架层；本票 Macro-B 产出不构成本项判据）→ 33-check `ALARM desk-task15` 为登记处设计的值守升级通道，非缺陷。
- `node 33-check.mjs` → PASS 8/8（ALARM 3：desk-task15 + mw-trigger-a/b 既有；WARN 5 既有）。

### 4.4 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| 目标公开仓选定＋理由落文 | `40-target-selection.json`：gsd-core + 7 条理由 + madr 淘汰记录 |
| URL opt-in 全路径实跑（隔离缓存/全深度/浅拒路径不触=引擎层拒绝） | §4.1：回执+实物核查+引擎契约测试 31 断言 |
| Macro-B 报告产出 + 三仓对照差异如实写 | `40-out/40-macro-b-gsd-core.{md,json,facts.jsonl,measurements.json}` + `40-external-comparison.json` §4.2 |
| 守卫 PASS | `40-check.mjs` PASS（见 ⑥） |
| ledger A-045 done / WORKFLOW §4 lessons / commit 引 A-045+守卫 | 见收口 |

## ⑤ 卡死 3 连问 + 决策对照

无卡死。**裁定歧义 1——TC-2 RED 是否「补 detector 让它绿」**：否决。v2 回退链冻结于 27-prereg（判据跑后禁调=量测效度纪律），外部仓暴露的覆盖缺口是合法实验数据——unsupported 如实落数，detector 缺口另立 v3 腿预注册票（R-40-GSDCORE-1 建议）。**裁定歧义 2——desk-task15 是否随 first-external-repo 翻转**：否决。判据原文=Micro-A 真实 PR 报告（未上架层），本票 Macro-B 产出不构成；保持 pending + ALARM 值守通道为登记处设计语义。**候选仓更替**：madr 探测失败后转 gsd-core，过程落 selection JSON 可回查。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| URL opt-in 实跑（非手动 clone 代替） | `node engine/dist/cli.js repo add <url> --cache .scratch/architecture-recovery/reports/40-clone-cache` → 回执 JSON（二次跑 `cloned:false` 幂等）|
| clone 隔离+全深度+禁远程配置 | 40-check B 组：is-shallow=false + HEAD=回执 + remote=url + hooksPath=noop + ext.allow=never + 5887 commits + 工作树净 |
| Macro-B 产物齐备+读回一致 | 40-check D 组：facts.jsonl 行数=meas.fact_count=DuckDB 行数（1424）+ receipt 双侧一致 + 披露块外部仓文案 |
| 三基线对照 | 40-check E 组：4 行对照表 + url_optin/dogfooding 标记 + TC-2 归因区分落文 |
| registry 翻转+绑定处置 | 40-check F 组 + `node 33-check.mjs` → PASS 8/8 + BOUND desk-task2 + ALARM desk-task15 |
| intake 契约测试 | `cd engine && node test/intake.test.mjs` → INTAKE 31/31（分类/本地/浅拒/owner-repo 消歧/URL clone/幂等/远程配置禁全离线实跑）|
| engine 全链绿 | `cd engine && npm test` → GEN-OK + tsc 0 错 + SMOKE 6/6 + COLLECTORS 14/14 + ADAPTER 7/7 + BATCH1 41/41 + LLM 25/25 + REPORT-PREVIEW 5/5 + INTAKE 31/31；`npm run package` 33 files 30.7kB；`node dist/cli.js selftest` ok 5/5 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/40-check.mjs` → **PASS N/N**，exit 0 |

## ⑦ 教训

1. **外部仓首个可归属原因类发现：同一判红不同归因必须分开写**。gsd-core 与 anysearch-cli 同为 TC-2 RED→unsupported，但前者主成分=detector 漏认（dash+加粗形态），后者=真缺失——若只盯裁定档位会抹掉「v2 回退链覆盖缺口」这一真实泛化发现。跨仓对照必须逐字段拆解 missing_ratio 再归因，量测效度先于裁定档位。
2. **披露块文案是 caller 注入的——复用管线脚本时要同步改披露面**。39 脚本直跑外部仓会把「同主三试点仓」文案带进证据产物；40 脚本以生成器复制+最小差异法处理（管线零改动、披露面换外部仓），比事后给产物打补丁干净——receipt content_digest 不含手改。
3. **intake 测试可以全离线实跑真 clone**：`file://` 等价路径让 `cloneToIsolatedCache` 在 CI 无网面下跑真 git clone（隔离/全深度/浅拒/远程配置禁全链），比 mock spawnSync 更硬——file:// 归入显式 URL 腿（不经网络）是干净的等价面。
4. **registry 触发≠判据满足**：first-external-repo 触发 desk-task2/15 两项，但判据各自独立——task2 判据（外部仓 TC-1 judgeable≥5）达成立即 bound，task15 判据（Micro-A 报告）属未上架层保持 pending+ALARM。按登记处置不静默翻转，值守通道的设计意图就是「触发已发生未拍→升级」。
