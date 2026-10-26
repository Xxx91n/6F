# 旧票号与决策号索引（历史档案 · 只读）

> 本文件是**非权威、只读**的历史解析层，不载任何现行决策——权威载体见同目录 [`README.md`](README.md) 的首行指针。
> 新决策**不得**写入本档案，也不得新增 `D-NNN` 编号。

## 口径

| 项 | 值 |
|---|---|
| 账本与票册来源修订 | `2e6061be`（= `e356581e~1`，`.scratch/` 移出版本控制前的最后一份） |
| 退役批 | `e356581e`（该批删除 `.scratch/`、`docs/decisions/`、死 ADR 与仓根 `CHANGELOG.md`） |
| 索引核对基线 | `cd9ca956`（建索引时的 `main` 尖，钉死不改写；对该 commit 直接 `git grep` 即可复现「引用数」列） |
| `D-NNN` 定义条数 | 220（`D-001`–`D-220`，逐号连续无缺） |
| `A-NNN` 定义条数 | 99（`A-001`–`A-099`，逐号连续无缺） |
| 旧票号行数 | 67（BACKLOG `#32`–`#94`，含 `#41a/#41b`、`#52a/#52b` 两片制，另收 `#41`、`#52` 两个已拆分父号） |
| 可辨 `D-NNN` 记号全集 | 225 = 220 条账本定义 + 5 个散文/夹具假阳性（见 §4） |

> **口径校正**：上游票面把这条全集记作「225 个真实 D-code」；实测 225 是**形似 `D-NNN` 的记号数**，真决策只有 220 条（`D-001`–`D-220`，账本逐号连续无缺），另 5 个是散文与夹具占位。父票 #38 D3 的「225/229」两个数无法从任何可复现统计里得到（229 无从测得），本索引以可复现的 225/220/5 记账，请治理轮在 #38 更正措辞。

### 列义

- **引入**：该记号首次出现的 commit 短号与**作者日期**（`git log --format=%H%x09%aI`），按 `.scratch/` 三份载体的 git 历史逐 commit 反查；不是决策被拍板的日期——账本落盘即引入。
- **状态**：账本行状态列的原文首词，未改写、未重新裁定。
- **去向 / 现行载体**：`｜` 左侧为账本收口节所载去向原文摘要（首词与状态列同值时省略），右侧 `载体` 为账本行点名物在本仓文件清单里的唯一性解析结果。`〔守卫已退役〕` = 去向点名的守卫在当前仓已无对应文件；`历史现场` = 该票逐票档案在 `.scratch/` 退役前的路径（见 §5）；`**unmapped**` = 本仓无以该票号命名的现行工件、票面亦未点名可解析物，不代表票未执行。
- **引用数**：该记号在 `git grep` 于基线 `cd9ca956` 的**已提交文本**里的出现次数，统计域排除 `engine/dist/`（生成物）、`*.jsonl` / `*.diff` / `*.duckdb`（二进制与冻结件）与 `docs/archive/`（本档案自身），因此只反映**人写的历史指纹**；未按撞号消歧，用于观察某条决策还被多少现行文本引用。
- **未载 / unmapped**：`**去向未载**`（`D` 表）= 账本收口节没记该决策的去向；`**unmapped**`（票表）= 本仓无以该票号命名的现行工件且票面未点名可解析物；两者都**不是**裁决状态，只表示解析链在本仓断掉。

### 撞号警示

GitHub tracker 与旧 BACKLOG **共用同一串号**。本表所有 `#NN` 指 **旧 BACKLOG 票号**；`#38`–`#47` 现在同时是治理轮的 GitHub issue 号（父票 #38 与子票 #39–#47），语义完全不同。消歧判据：代码注释、workflow 注释、`NN-check` 与 `.scratch` 路径旁的 `#NN` 属旧 BACKLOG；治理轮文书（`docs/adr/0025` 起、本档案、新 spec 段）里的 `#NN` 属 GitHub issue。解析规则见 `docs/agents/issue-tracker.md`。

## 1. `D-NNN` → 账本行 / 引入 commit / 现行载体

| D | 引入 | 状态 | 去向（账本原文摘要）｜ 现行载体 | 引用数 |
|---|---|---|---|---|
| D-001 | `3a049d45`·09-12 | current | spec 条目：ADR-0001 + CONTEXT.md「Macro Audit / Micro Audit / Scale」词条；判据细节 → spec.md Decision 4.5 + 计划表任务 1~5 ｜ 载体 `docs/adr/0001-five-scale-scope.md` `engine/src/audit/macro-b.ts` `engine/src/audit/macro-c.ts` | 6 |
| D-002 | `3a049d45`·09-12 | revised | 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/macro-c.ts` `engine/src/audit/micro-a.ts` | 1 |
| D-003 | `3a049d45`·09-12 | current | spec 条目：ADR-0003（规划边界 = 产品本体 + 使用方法，商业层排除） ｜ 载体 `docs/adr/0003-boundary-product-and-usage.md` `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` | 2 |
| D-004 | `3a049d45`·09-12 | current | spec 条目：ADR-0004 + spec.md Decision 4.1~4.6；计划表条目：任务 1~6 ｜ 载体 `docs/adr/0004-strategic-quadrant-five-dims.md` `docs/spec.md` | 5 |
| D-005 | `3a049d45`·09-12 | current | spec 条目：ADR-0005 + spec.md Decision 5.1~5.7；计划表条目：任务 7~13；阶段 0 部分已实现（R3-02，A-021） ｜ 载体 `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` `docs/spec.md` | 0 |
| D-006 | `3a049d45`·09-12 | current | spec 条目：ADR-0006；计划表条目：任务 14~16 ｜ 载体 `docs/adr/0006-shared-skeleton-scale-slice.md` `docs/spec.md` | 3 |
| D-007 | `3a049d45`·09-12 | current | spec 条目：ADR-0007；计划表条目：任务 17~18；Macro-B happy+failure path 已由 R3-05 首报覆盖（A-026） ｜ 载体 `docs/adr/0007-ten-demo-paths.md` `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` | 4 |
| D-008 | `9d1742c4`·09-12 | revised | 载体 `ADR-0002（保持删除）` `docs/adr/0003-boundary-product-and-usage.md` `docs/spec.md` | 0 |
| D-009 | `9d1742c4`·09-12 | current | 计划表条目：R2-01 → spec.md「R2-01 目标用户四类全集」（已封口） ｜ 载体 `docs/spec.md` | 0 |
| D-010 | `9d1742c4`·09-12 | current | 计划表条目：R2-02 → spec.md「R2-02 使用场景并集 + mode 枚举」（明注覆盖 D-010） ｜ 载体 `docs/spec.md` | 0 |
| D-011 | `9d1742c4`·09-12 | current | 计划表条目：R2-03 → spec.md「R2-03 默认模式开箱路径契约」+ CONTEXT.md「Default Mode」词条 ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` `docs/spec.md` | 1 |
| D-012 | `9d1742c4`·09-12 | revised | 计划表条目：R2-04 → spec.md「R2-04 Agent Plugin 契约群」+ spec 条目 ADR-0008 + CONTEXT.md「Agent Plugin / Receipt」词条 ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `engine/skills/macro-audit/SKILL.md` `docs/spec.md` | 4 |
| D-013 | `9d1742c4`·09-12 | current | 计划表条目：R2-05 → spec.md「R2-05 输入面契约」+ spec 条目 ADR-0009 + CONTEXT.md「Repo Intake」词条 ｜ 载体 `docs/adr/0009-intake-local-first-url-optin.md` `docs/spec.md` `CONTEXT.md〔退役→GLOSSARY.md〕` | 40 |
| D-014 | `9d1742c4`·09-12 | revised | revised（2026-09-12 用户更正架构；由 D-015 承载） ｜ 载体 `ADR-0002（保持删除）` `ADR-0010（保持删除）` `docs/spec.md` | 3 |
| D-015 | `9d1742c4`·09-12 | current | spec 条目：ADR-0011（单仓 + 子目录 + but 分支）+ 实体落地 engine/ ｜ 载体 `docs/adr/0011-single-repo-subdir-but-branches.md` `ADR-0010（保持删除）` `docs/spec.md` | 1 |
| D-016 | `ac03dda8`·09-13 | current | spec 条目：ADR-0012；计划表条目：R3-01~03/05（已闭环，A-019~A-027 implemented）+ R3-06/R3-07 = 票 #24/#25（backlog，A-028/A-030 deferred） ｜ 载体 `docs/adr/0012-value-validation-loop-first.md` `ADR-0002（保持删除）` `engine/src/audit/macro-b.ts` | 21 |
| D-017 | `ac03dda8`·09-13 | current | spec 条目：ADR-0013；计划表条目：R3-04/R3-05（已实现：预注册文档 + 首报 A→B→C，C 裁定 supported） ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `docs/spec.md` | 12 |
| D-018 | `ac03dda8`·09-13 | current | spec 条目：ADR-0013；计划表条目：R3-04（22-criteria-pre-registration.md，2+3+1 判据入库，A-023~A-025） ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `engine/test/fixtures/contracts/22-criteria-pre-registration.md` `docs/spec.md` | 20 |
| D-019 | `b96a0393`·09-13 | current | current（倾向已确认；atomcode 调研中，最终拍板待回报）→ closed（2026-09-14 用户拍板「采纳」，派生 D-… ｜ 载体 `docs/adr/0012-value-validation-loop-first.md` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-020 | `35250c36`·09-14 | current | spec 条目：docs/adr/0014（本轮起草落盘）；实施落点 = 阶段 2/3 → 票 #24/#25（backlog） ｜ 载体 `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` `docs/spec.md` | 5 |
| D-021 | `742d4f7a`·09-14 | current | 本轮整理产物：根 README.md（五段式，readme-crafter-skill 流程）+ handoffs/next-round.md（下轮任务书） ｜ 载体 `engine/README.md` `engine/skills/macro-audit/SKILL.md` | 4 |
| D-022 | `da009fc5`·09-15 | revised | 原「禁止缺口未回流前接上游」被 D-023 序列化控制取代（原记录保留） ｜ 载体 `docs/adr/0012-value-validation-loop-first.md` `docs/spec.md` | 0 |
| D-023 | `da009fc5`·09-15 | current | spec 条目：docs/adr/0015 §Decision-2；计划表条目：spec-phase-tasks.md R4 节（R4-01~05） ｜ 载体 `spec-phase-tasks〔历史现场〕` `docs/spec.md` | 0 |
| D-024 | `da009fc5`·09-15 | current | spec 条目：docs/adr/0015 §Decision-1；计划表条目：任务 1/3/5/7 注记纠偏（任务 7 前置标 stale、按域拆分）；CONTEXT.md「Self-probe（自证探针）」 ｜ 载体 `docs/spec.md` `CONTEXT.md〔退役→GLOSSARY.md〕` | 3 |
| D-025 | `da009fc5`·09-15 | current | spec 条目：docs/adr/0015 §Decision-3；计划表条目：R4-01（量测审计）/ R4-02（v2）/ R4-03（治理）+ C 层 disposition 补记项；CONTEXT.md「Dual Reporting」/「Assign… ｜ 载体 `docs/spec.md` `CONTEXT.md〔退役→GLOSSARY.md〕` | 4 |
| D-026 | `da009fc5`·09-15 | current | 整理产物：25-rollout-checklist.md 拍板状态列 24 行 + §8 注记（superseded 三步关闭 B2.2/B3.1/B5-4 + closed B5-1）；绑定表权威文本 = reports/R5-Q5-atomcode-re… ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` | 11 |
| D-027 | `da009fc5`·09-15 | current | spec 条目：docs/adr/0016；25-rollout-checklist.md P5 行「方向已拍」；README 上游清单/发布口径不变 ｜ 载体 `.claude-plugin/marketplace.json` `docs/spec.md` | 4 |
| D-028 | `da009fc5`·09-15 | current | 本轮整理环节已执行完毕：16 守卫亲跑 16/16 PASS（exit 0，soft-warn 1 = spec.md「布局」属设计层）→ git update-ref -d 删 gb-local/16-rendering-split 残留 ref（but … ｜ 载体 `docs/spec.md` | 3 |
| D-029 | `84f571a6`·09-15 | current | 计划表条目：BACKLOG #32（已执行：31 份 prompts「## 收尾」段首黑体块，逐字措辞落地）＋25-checklist B1.2 行→decided-now＋WORKFLOW §4.2.6 第 6 条模板继承 ｜ 载体 旧票 #32 `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 0 |
| D-030 | `84f571a6`·09-15 | current | 计划表条目：BACKLOG #41（examples/first-report/ 复制＋披露 README）＋#43（golden CI 候选票）＋25-checklist D1 行→decided-now ｜ 载体 `engine/src/audit/macro-b.ts` 旧票 #41 旧票 #43 | 17 |
| D-031 | `84f571a6`·09-15 | current | spec 条目：docs/adr/0017（preview 发布模型＋build-scope/release-sequence 划界）；计划表条目：BACKLOG #41；25-checklist P6 行→decided-now ｜ 载体 `docs/adr/0001-five-scale-scope.md` `ADR-0002（保持删除）` `engine/src/audit/macro-b.ts` | 9 |
| D-032 | `84f571a6`·09-15 | current | spec 条目：docs/adr/0017 §Decision-4（披露非演示）；计划表条目：BACKLOG #41＋各层 preview DoD（#38 等票完成定义）；25-checklist D2 行→decided-now ｜ 载体 `engine/src/audit/macro-b.ts` 旧票 #41 旧票 #38 | 5 |
| D-033 | `84f571a6`·09-15 | current | 计划表条目：BACKLOG #37（可用性审计）/#39（三仓 one-shot＋jiahao 回归）/#40（非自有仓 GA 前置）；25-checklist B4.2 行→decided-now ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/macro-c.ts` `engine/src/audit/micro-a.ts` | 120 |
| D-034 | `84f571a6`·09-15 | current | spec-phase-tasks.md 第六轮 R5 节（阶段 3 串行骨架）；BACKLOG 次序注记；三触发器→#33 机检输入、#39＝触发器 (a) 激活点 ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/macro-c.ts` `engine/src/audit/micro-a.ts` | 150 |
| D-035 | `84f571a6`·09-15 | current | 计划表条目：BACKLOG #35（首批 ~30 面）/#36（LLM 面独立票）/#42（dump 对照评估＋上游队列）；spec-phase-tasks.md 暂缓面集两字段注记 ｜ 载体 `docs/adr/0014-upstream-integration-dual-track.md` `engine/src/audit/macro-c.ts` 旧票 #35 | 15 |
| D-036 | `84f571a6`·09-15 | current | 整理产物：BACKLOG.md #32~#43 立案＋spec-phase-tasks.md R5 节＋本节对账 ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/macro-c.ts` 旧票 #32 | 0 |
| D-037 | `655d8c98`·09-16 | current | ADR-0018 §D-1＋docs/versioning.md＋#44＋#41b（版本元数据查证挂入）＋checklist P2→decided-now＋registry 25-P2→decided ｜ 载体 `docs/adr/0018-versioning-and-chronicle-discipline.md` `docs/adr/0017-preview-release-model.md` `docs/adr/0014-upstream-integration-dual-track.md` | 42 |
| D-038 | `655d8c98`·09-16 | current | #45＋#43 前置注记＋#41a（Try-on-real-repo 节）＋spec-phase-tasks R6 契约面注记＋checklist D4→decided-now＋registry 25-D4→decided ｜ 载体 旧票 #45 旧票 #43 旧票 #41a | 54 |
| D-039 | `655d8c98`·09-16 | current | ADR-0018 §D-2＋#41a（仓根编年首条）＋#44（指针守卫）＋checklist B3.3→decided-now＋registry 25-B3.3→decided＋engine/CHANGELOG.md 反向指针 ｜ 载体 `docs/adr/0018-versioning-and-chronicle-discipline.md` `docs/adr/0017-preview-release-model.md` `engine/CHANGELOG.md` | 9 |
| D-040 | `655d8c98`·09-16 | current | BACKLOG #41→#41a/#41b 拆分＋WORKFLOW §4.2.7＋next-round.md 任务改写 ｜ 载体 旧票 #41 旧票 #41a 旧票 #34 | 0 |
| D-041 | `655d8c98`·09-16 | current | #33 扩展子项（BACKLOG 注记）＋registry watch 三态数据面（本环节落盘：23 event_bound/4 manual_watch，新增事件 first-external-repo） ｜ 载体 旧票 #33 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 0 |
| D-042 | `5dca40df`·09-16 | current | BACKLOG #41b 票面在册（授权至提交前一刻；提交点击=用户闸门）——轮11 起在案〔历史断链补登〕 ｜ 载体 旧票 #41b `engine/test/fixtures/contracts/33-gate-registry.json` | 5 |
| D-043 | `5dca40df`·09-16 | current | spec-phase-tasks R7-02（mw-a/b registry＋desk-task7→decided＋判据写实化）＋ADR-0019＋#39 闭环实证（A-044）〔补登〕 ｜ 载体 `docs/adr/0019-multiwriter-adjudication-swmr-facade.md` `engine/src/audit/macro-c.ts` 旧票 #39 | 8 |
| D-044 | `5dca40df`·09-16 | current | spec-phase-tasks R7-03＋registry trigger_event 改绑 micro-a-preview-prep（已落）＋#48 票面核验面〔补登〕 ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` 旧票 #48 | 2 |
| D-045 | `5dca40df`·09-16 | current | spec-phase-tasks R7-04：entity-effort→后续批次（S5 ownership 族承接）＋3 面入暂缓面集（D-035④ 两字段纪律）〔补登〕 ｜ 载体 `docs/adr/0014-upstream-integration-dual-track.md` `ADR-0015（保持删除）` `33-check〔守卫已退役〕` | 6 |
| D-046 | `5dca40df`·09-16 | current | BACKLOG #46 已闭环（A-054：macro-b-regression.yml 落地＋jiahao 单文件撤除 2755bf35）〔补登〕 ｜ 载体 `docs/adr/0016-distribution-channel-agent-plugins-only.md` `.github/workflows/macro-b-regression.yml` `engine/src/audit/macro-b.ts` | 8 |
| D-047 | `5dca40df`·09-16 | current | BACKLOG #48 票面（env-manager＋jiahao 双试点验收序列）〔补登〕 ｜ 载体 `docs/adr/0014-upstream-integration-dual-track.md` `engine/src/audit/micro-a.ts` 旧票 #48 | 6 |
| D-048 | `28b40670`·09-16 | current | BACKLOG #47 已闭环（A-055：github-rest.ts＋cassette×5＋47-check PASS）〔补登〕 ｜ 载体 `docs/adr/0016-distribution-channel-agent-plugins-only.md` `docs/adr/0014-upstream-integration-dual-track.md` `docs/adr/0018-versioning-and-chronicle-discipline.md` | 33 |
| D-049 | `28b40670`·09-16 | current | current（⑤款「骨架」定义以 D-132 澄清为准=字段键集＋语义不变量定点值——同源措辞注记防再争议） ｜ 载体 `docs/adr/0017-preview-release-model.md` `docs/adr/0006-shared-skeleton-scale-slice.md` `engine/src/audit/micro-a.ts` | 72 |
| D-050 | `28b40670`·09-16 | current | #46 工件实证：.github/workflows/macro-b-regression.yml DEFAULT matrix=jiahao＋git/git＋django/django＋spring-boot（C/Python/Java 族一仓一行）〔补登〕 ｜ 载体 `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` 旧票 #46 | 14 |
| D-051 | `28b40670`·09-16 | current | BACKLOG #41b＋ADR-0021（Apache-2.0）；marketplace.json/plugin.json 已落盘〔补登〕 ｜ 载体 `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` `docs/adr/0016-distribution-channel-agent-plugins-only.md` `engine/plugin.json` | 27 |
| D-052 | `28b40670`·09-16 | current | BACKLOG #41b（插件名=6f 三处同改＋市场名/author 字段值已落）〔补登〕 ｜ 载体 `engine/plugin.json` `engine/.claude-plugin/plugin.json` `.claude-plugin/marketplace.json` | 31 |
| D-053 | `42bea32c`·09-17 | current | BACKLOG #50＋spec-phase R9-01 ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `docs/adr/0013-three-layer-acceptance-gates.md` `docs/adr/0014-upstream-integration-dual-track.md` | 71 |
| D-054 | `42bea32c`·09-17 | current | BACKLOG #51＋spec-phase R9-02 ｜ 载体 `docs/adr/0014-upstream-integration-dual-track.md` `ADR-0015（保持删除）` `engine/skills/macro-audit/SKILL.md` | 25 |
| D-055 | `42bea32c`·09-17 | current | ADR-0008 勘误＋CONTEXT 词条＋hooks README＋registry hooks-presentation-face ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `engine/src/audit/micro-a.ts` `CONTEXT.md〔退役→GLOSSARY.md〕` | 11 |
| D-056 | `42bea32c`·09-17 | current | upstream-lock 行＋README §3＋versioning＋CONTEXT Macro-B＋registry 探针改绑＋repomix-reopen-trigger＋ADR-0015 勘误＋42/44-check 断言 ｜ 载体 `ADR-0015（保持删除）` `docs/adr/0016-distribution-channel-agent-plugins-only.md` `engine/test/contracts/44-check.mjs` | 13 |
| D-057 | `42bea32c`·09-17 | current | ①③ 账本即销项/封口；②registry narrative-eval-surface；④入 #50 票面 ｜ 载体 `engine/src/upstream/codelore.ts` `engine/skills/macro-audit/references/strategy-questions.md` 旧票 #50 | 10 |
| D-058 | `42bea32c`·09-17 | current | CONTEXT 新词条 ｜ 载体 `docs/adr/0022-quarantine-engine.md` `docs/adr/0013-three-layer-acceptance-gates.md` `docs/adr/0008-agent-plugin-five-layer-box.md` | 22 |
| D-059 | `6f021db6`·09-17 | revised | P0=#54（%cI+gitcli 断言+golden-ci 勘误）；P1=#55（SQL 字面量/MCP db/intake 时点/contradicts 勘误）；三触发器入 registry（runtime-doctor-trigger/bundle-r… ｜ 载体 `docs/adr/0017-preview-release-model.md` `ADR-0002（保持删除）` `engine/test/contracts/43-check.mjs` | 59 |
| D-060 | `6f021db6`·09-17 | current | BACKLOG #53（audit 一等命令八要素＋README 同票绑定） ｜ 载体 `docs/adr/0009-intake-local-first-url-optin.md` `docs/adr/0017-preview-release-model.md` `ADR-0002（保持删除）` | 16 |
| D-061 | `6f021db6`·09-17 | current | BACKLOG #52→#52a+#52b 拆票；registry narrative-eval-surface 改锚 host-narrative-corpus（pending/event_bound）；D-057② 勘误注记：原锚「叙事实物出现」已随 #… ｜ 载体 旧票 #52 旧票 #52a 旧票 #52b | 14 |
| D-062 | `6f021db6`·09-17 | current | registry mw-trigger-c.verify_method=DoR 判据集；CONTEXT Trigger Sequence 词条补启动判据句 ｜ 载体 `docs/adr/0017-preview-release-model.md` `engine/src/audit/micro-a.ts` `CONTEXT.md〔退役→GLOSSARY.md〕` | 3 |
| D-063 | `6f021db6`·09-17 | current | ①L1：r14-audit-findings（SHA c06aa58833940c8f9858011d6028944f8187c6f7）已于 PR #5 合入 main（12e2a49），先于本裁定发生——裁定口径「审计件=冻结只读留档分支不合 main」自… ｜ 载体 `engine/src/audit/macro-b.ts` `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 4 |
| D-064 | `07f52265`·09-17 | current | BACKLOG #57 修复票（F1/F8/F9/F10/F11/F15 六子项，P0）＋#56 票面修订（F5 held-out 分区）＋#52b 行 F4 注记＋registry demo-cleanup-observe（F13）；D-060 四处勘误注… ｜ 载体 `docs/adr/0009-intake-local-first-url-optin.md` `docs/adr/0017-preview-release-model.md` `engine/test/contracts/53-check.mjs` | 11 |
| D-065 | `07f52265`·09-17 | current | BACKLOG #56 行修订（方向=③+① 全要素：文档化命名/三表剥离/pseudo 表/CJK 词表/fail-safe/held-out 分区/FN 披露/二态不加第三态） ｜ 载体 旧票 #56 | 14 |
| D-066 | `69389352`·09-18 | current | BACKLOG #58（P1：34/41b-check 三断言＋advisory 真校验器双触发＋SKIP 计入 WARN 硬化＋SchemaStore 快照进仓＋claude-cli/schemastore 入锁）＋registry claude-vali… ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `engine/test/contracts/41b-check.mjs` `engine/test/contracts/34-check.mjs` | 14 |
| D-067 | `69389352`·09-18 | current | BACKLOG #59（P0 自包含分发修复全八项——外部用户死 MCP server 线上缺口） ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `docs/adr/0016-distribution-channel-agent-plugins-only.md` `82-check〔守卫已退役〕` | 13 |
| D-068 | `69389352`·09-18 | current | BACKLOG #60（P1：14-skeleton-baseline.json＋14-check 三 FAIL 双向拦＋三方一致断言＋语义翻转边界行；豁免=baseline 更新本身） ｜ 载体 `14-check〔守卫已退役〕` `engine/test/fixtures/contracts/14-skeleton-fields.json` `engine/src/report/generate.ts` | 4 |
| D-069 | `69389352`·09-18 | current | BACKLOG #61（P1 判定 commit 全项：CJK_NON_ASSERT_CUES＋伪表＋词表治理＋56-check hash WARN）＋registry cue-table-second-consumer 事件＋cue-table-extra… ｜ 载体 `engine/test/contracts/56-check.mjs` 旧票 #61 `engine/test/fixtures/contracts/33-gate-registry.json` | 10 |
| D-070 | `69389352`·09-18 | current | ①-⑤ → #61 [cleanup] r18 残余 ①-⑤ 独立 commit 子项（防纠缠＋memo 熔断写票面）；⑥ → 52a-eval-results.README.md 侧车注记（本环节落）；⑦ → A-ledger R10 头括注勘误（本环节落… ｜ 载体 `engine/test/contracts/56-check.mjs` `engine/src/report/citation.ts` `engine/test/fixtures/contracts/52a-eval-results.json` | 1 |
| D-071 | `eb1a293e`·09-18 | current | BACKLOG #63（P1：stale-assertions.json 清单＋首批 9 条＋NN-check 断言级 id/三态输出协议＋33-check 元校验四断言）＋registry xfail-second-track-trigger 项（manu… ｜ 载体 `33-check〔守卫已退役〕` 旧票 #63 `engine/test/fixtures/contracts/33-gate-registry.json` | 5 |
| D-072 | `eb1a293e`·09-18 | revised | BACKLOG #64（P1：store.ts 自愈精确补拉＋三段文案＋bundle external 验收＋CI 干净机 E2E smoke＋离线断言＋npm 渠道辨析票面）＋registry 三复审触发器项（duckdb-vendored-review／… ｜ 载体 `engine/src/fact/store.ts` `engine/package.json` 旧票 #64 | 39 |
| D-073 | `b55a4d83`·09-18 | current | BACKLOG #65（P1 册外批量分拣：13 件归因三向分拣＋acceptance-probe-attestation.jsonl 双锚＋sealed 第三态＋33-check G5 闭包＋rewrite-pending 兜底）＋registry xfa… ｜ 载体 `33-check〔守卫已退役〕` 旧票 #65 `engine/test/fixtures/contracts/33-gate-registry.json` | 4 |
| D-074 | `b55a4d83`·09-18 | current | 并入 #65（env 腿分拣面）＋engine/test/audit-zero-write.test.mjs（mkdtemp 玩具仓 fixture＋自检防 vacuous＋smoke 链）＋attestation migrated_to 必填闭包＋1:1 … ｜ 载体 `40-check〔守卫已退役〕` `33-check〔守卫已退役〕` `engine/test/audit-zero-write.test.mjs` | 19 |
| D-075 | `b55a4d83`·09-18 | current | BACKLOG #66（P1 自愈分层修订承接 D-072 revised：isTTY/MCP/CI 面探测＋MCP 四段披露＋doctor --fix 主路＋MACRO_AUDIT_SELFHEAL=1 opt-in＋F4/F7/F8/F9 四缺陷＋Def… ｜ 载体 旧票 #66 `docs/spec.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 20 |
| D-076 | `b55a4d83`·09-18 | current | registry 四枚 event_bound（git-iso-contract-review／sql-strip-escape-review／dist-in-repo-review 新增＋cue-table-extraction-trigger 复用不重建… ｜ 载体 `engine/test/contracts/34-check.mjs` `engine/test/fixtures/contracts/33-gate-registry.json` 旧票 #55 | 16 |
| D-077 | `b55a4d83`·09-18 | current | BACKLOG #67（P2 SKIP-STREAK 分层：MACRO_AUDIT_CI 旗标＋INFO 第三披露态＋state.json local-observation-only 降格＋claude-validate-receipts.jsonl＋pr… ｜ 载体 `docs/adr/0018-versioning-and-chronicle-discipline.md` `33-check〔守卫已退役〕` `engine/test/contracts/34-check.mjs` | 8 |
| D-078 | `b55a4d83`·09-18 | current | BACKLOG #68（P2 设计票：docs/upstream-dimension-map.md 骨架已裁→PR 评审合入→接线票票间依赖；dimension:null 保留＋NN-check「上游文件无 S1-S5 字样」守卫断言立案） ｜ 载体 `docs/adr/0009-intake-local-first-url-optin.md` `docs/adr/0014-upstream-integration-dual-track.md` `docs/adr/0004-strategic-quadrant-five-dims.md` | 20 |
| D-079 | `82cbb604`·09-19 | current | BACKLOG #70（P1 vacuous 恒真断言族：分拣输入面=FAIL∪恒真候选（引用物缺席普查）＋二值口径 VACUOUS⇔引用物缺席∧零 FAIL 历史＋certain/likely 分级＋baseline 只拦新增＋独立 vacuity-man… ｜ 载体 旧票 #70 旧票 #65 | 1 |
| D-080 | `82cbb604`·09-19 | current | map v1.0 本地定稿（本环节已落：docs/upstream-dimension-map.md v0.1→v1.0）＋BACKLOG #71（codelore 接线票·批1：注册＋Macro-B 归位＋映射常量块＋逐行对账守卫）＋BACKLOG #72… ｜ 载体 `docs/adr/0020-hosted-platform-api-adapter.md` `docs/adr/0009-intake-local-first-url-optin.md` `docs/adr/0014-upstream-integration-dual-track.md` | 15 |
| D-081 | `82cbb604`·09-19 | current | map v1.0 行改写（pending(event_bound)＋无偏好序，本环节已落）＋registry 双件增补（github-rest-reviews-active 事件＋github-rest-review-coverage-dimension e… ｜ 载体 `docs/adr/0020-hosted-platform-api-adapter.md` `33-check〔守卫已退役〕` `engine/test/contracts/44-check.mjs` | 11 |
| D-082 | `82cbb604`·09-19 | current | map v1.0 行改写（S5 终裁＋封边备注，本环节已落）＋§④ 快照/趋势通用判据行（本环节已落）＋§⑤ 清单项收口（本环节已落）＋D-078⑤ 清单项收口注记（见下） ｜ 载体 `docs/adr/0020-hosted-platform-api-adapter.md` | 5 |
| D-083 | `82cbb604`·09-19 | current | map §① 职责边界行（kernel 接线契约／不供叙事消费／不随 tgz 分发三显式句，本环节已落）＋rubric 零口径原则行（无路径指针，本环节已落）＋NN-check「skill 包内文件不得引用 docs/ 路径」断言立案（随 #71 票面）＋D… ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `engine/skills/macro-audit/references/quadrant-rubric.md` `engine/src/upstream/codelore.ts` | 6 |
| D-084 | `82cbb604`·09-19 | current | map §④ 权重行＋§⑤ 销项注记（本环节已落）＋rubric 层立案项（任务书 T 项：挂 quadrant-rubric 初版参数起草触发＋LFX v2「人气≠健康」启示带句） ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `docs/adr/0020-hosted-platform-api-adapter.md` `engine/skills/macro-audit/references/quadrant-rubric.md` | 14 |
| D-085 | `a826c0c4`·09-20 | current | BACKLOG #73（门面整改总票：三面全含＋执行序=仓内物料先行/元数据写最后＋生效边界登记；repo-logo 不入门负向约束随票面） ｜ 载体 `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` 旧票 #73 | 0 |
| D-086 | `a826c0c4`·09-20 | current | 并入 #73 面一（README 双层门面：pitch→badges→能力矩阵→安装→样例→快速验证 上半层；工程节段保留下半层不删不稀释） ｜ 载体 `docs/adr/0017-preview-release-model.md` 旧票 #73 | 0 |
| D-087 | `a826c0c4`·09-20 | current | 并入 #73 面一（README.md EN 主位＋README.zh-CN.md 中文全量；元数据英文）＋同步机制前置（D-088 裁毕方可落地） ｜ 载体 旧票 #73 | 2 |
| D-088 | `a826c0c4`·09-20 | current | 并入 #73＋73-check.mjs 立案（双语同步守卫：canonicalMarker 断言＋heading 锚点集/code block/链接/badge 互等 FAIL＋sync 版本戳失配 XFAIL＋owner 字段）＋≥3 语言升级触发器留票面 ｜ 载体 `engine/test/contracts/73-check.mjs` 旧票 #73 | 8 |
| D-089 | `a826c0c4`·09-20 | current | 并入 #73 面一视觉（静态 badges＋icon.svg 派生 hero＋架构 SVG＋样例截片）＋registry 双 event_bound：readme-ci-badge（锚=engine-ci-main-green 新事件）／readme-mot… ｜ 载体 旧票 #73 `engine/test/fixtures/contracts/33-gate-registry.json` `examples/first-report/` | 16 |
| D-090 | `a826c0c4`·09-20 | current | 并入 #73 面二（LICENSE/CONTRIBUTING/SECURITY/CODE_OF_CONDUCT/ISSUE_TEMPLATE×3/PULL_REQUEST_TEMPLATE/CODEOWNERS 七件） ｜ 载体 `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` `CONTRIBUTING.md` `SECURITY.md` | 0 |
| D-091 | `a826c0c4`·09-20 | current | 并入 #73 面三末步（description/topics/social-card 三项授权写操作——包级授权已授照稿执行；homepage 留空登记） ｜ 载体 `docs/assets/social-card.png` `engine/src/mcp-server.ts` 旧票 #73 | 0 |
| D-092 | `cbf7fa13`·09-22 | current | BACKLOG #74（6F 正名＋六-F 宣言门面执行：hero.svg 重绘 6F＋六 F chip 族／README.md H1+Highlights 宣言块+alt／social-card.png 重产〔未上传零成本窗〕／preview badge … ｜ 载体 `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` `docs/adr/0001-five-scale-scope.md` `docs/adr/0017-preview-release-model.md` | 2 |
| D-093 | `cbf7fa13`·09-22 | current | 并入 #74（波及面=双 README／hero／social-card／description.md displayName→6F 带变更注记；双锚 #6f 主+macro-audit 兼容；73-check 锚点集同步；保留面=architecture.… ｜ 载体 `engine/test/contracts/73-check.mjs` `docs/listing/description.md` `docs/assets/social-card.png` | 2 |
| D-094 | `cbf7fa13`·09-22 | current | BACKLOG #75 批1（失效三分类建制：字面钉普查 pass〔复用 D-079 机制族〕＋剥注释名↔检纪律＋presence/liveness/readiness 三层命名＋XFAIL 册只收合法漂移类＋vacuity 豁免登记位）＋WORKFLOW … ｜ 载体 `engine/test/contracts/73-check.mjs` `.github/workflows/engine-ci.yml` 旧票 #75 | 14 |
| D-095 | `cbf7fa13`·09-22 | current | BACKLOG #75 批2（枚举 open/closed 声明制＋closed 面成员级双向差集 lint＋常量 SSOT 派生计数＋成员级漂移禁入册＋reserved 机制域界〔外部输入面/cap≤2/生产者→FAIL〕＋preflight 逐条裁）＋W… ｜ 载体 旧票 #75 `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 2 |
| D-096 | `cbf7fa13`·09-22 | current | BACKLOG #75 批3（63 清单头 census-contract 块〔字段 schema 归一+五豁免规则正反例对〕＋70-check 互等裁决断言比对契约＋契约变更 PR 门控＋契约=70/vacuity 共用规格＋契约枚举 open/close… ｜ 载体 `70-check〔守卫已退役〕` 旧票 #75 旧票 #33 | 0 |
| D-097 | `720f071f`·09-22 | current | #76 ✅ 已闭环（R26 实施轮合入 main d207a0a；分支 CI 35677822036 六腿绿＋main 35681529820 绿） ｜ 载体 `engine/test/contracts/64-check.mjs` `engine/src/cli.ts` `.github/workflows/engine-ci.yml` | 0 |
| D-098 | `aafb4637`·09-22 | current | #77 门面收口包（A 窗本轮实施：生成式致谢锚段+closed regen-diff 守卫+zh 镜像+badge+homepageUrl）＋ #79 NOTICE 承接核查（衍生立项，随 #75 排产） ｜ 载体 `engine/upstream-lock.yaml` `engine/src/upstream/github-rest.ts` 旧票 #77 | 5 |
| D-099 | `aafb4637`·09-22 | current | registry 两新 event_bound 条目（official-catalog-icon-required / docs-site-deployed，均已登记 occurred=false 事件锚）；本轮零新资产——范围外登记：favicon 族/市… ｜ 载体 `engine/test/fixtures/contracts/33-gate-registry.json` | 12 |
| D-100 | `aafb4637`·09-22 | revised | #78 引擎 quarantine 建制（B 并行独立验证窗；macro-b-regression git 腿红修=验收件；owner+deadline 票面） ｜ 载体 `.github/workflows/macro-b-regression.yml` `docs/known-gaps.md` `engine/src/audit/macro-b.ts` | 15 |
| D-101 | `aafb4637`·09-22 | revised | 窗口边界裁本体——体现于 #77/#78 排产与任务书 T 序列（无独立票据）；显式豁免第三态为条件兜底 ｜ 载体 旧票 #77 旧票 #75 `engine/test/fixtures/contracts/33-gate-registry.json` | 1 |
| D-102 | `aafb4637`·09-22 | current | 实物已落地（R26 T0 摘除在案：stale-assertions meta.xpass_removal_2026_09_22＋45-check H5 已移除，xfail-run 复绿）；本条=形式追认＋衍生纪律（断言无牙族/反向 TDD mutation… ｜ 载体 `engine/test/contracts/45-check.mjs` 旧票 #75 旧票 #45 | 0 |
| D-103 | `42ff1c91`·09-23 | current | #78 引擎建制——契约层三态分类器（判定/处置硬分界）＋%cI 接线＋锚病态→unsupported 裁定路径 ｜ 载体 `engine/src/audit/macro-b.ts` 旧票 #78 | 10 |
| D-104 | `42ff1c91`·09-23 | current | 载体 `engine/test/fixtures/contracts/33-gate-registry.json` | 7 |
| D-105 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 9 |
| D-106 | `42ff1c91`·09-23 | current | #78——quarantine_log 逐字段事件表 schema＋字段实例恒等式口径＋run_id/recorded_at 幂等语义＋协议级崩溃工件（双通道落盘） ｜ 载体 旧票 #78 | 8 |
| D-107 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 1 |
| D-108 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 15 |
| D-109 | `42ff1c91`·09-23 | current | 载体 `engine/src/cli.ts` `engine/scripts/39-macro-b-one-shot.mjs` | 18 |
| D-110 | `42ff1c91`·09-23 | current | #78——仓级 accepted_reason_codes strict 基线＋verdict/exit code 两轴契约＋normalized disposition 同表留痕 ｜ 载体 `engine/src/cli.ts` 旧票 #78 | 21 |
| D-111 | `42ff1c91`·09-23 | current | 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` | 10 |
| D-112 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 9 |
| D-113 | `42ff1c91`·09-23 | current | #78＋产品面 known-gaps 台账首版文件（立法触发器侧入 33-gate-registry 既有机制，gap↔trigger 单向互链） ｜ 载体 `docs/known-gaps.md` `engine/test/fixtures/contracts/33-gate-registry.json` 旧票 #78 | 14 |
| D-114 | `42ff1c91`·09-23 | current | #78——Intake Health 专节+行内排除声明＋逐 commit 事务写失败 fail-fast（错误码分流退出类） ｜ 载体 旧票 #78 | 4 |
| D-115 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 17 |
| D-116 | `42ff1c91`·09-23 | current | #78——恒等式双层对账（引擎内逐 commit 断言＋独立 NN-check 守卫脚本 load-bearing 标注） ｜ 载体 旧票 #78 | 10 |
| D-117 | `42ff1c91`·09-23 | current | #78——raw_bytes 64KiB 截断+指纹三件套+oversize 码（定标前跑 corpus 字段值长度直方图校准） ｜ 载体 旧票 #78 | 20 |
| D-118 | `42ff1c91`·09-23 | current | 39/40 parity 比对器升级（处置感知矩阵+fail-loud 兜底+预期分歧入 known-gaps）——归 #78 或独立小票待归票裁 ｜ 载体 `docs/known-gaps.md` 旧票 #78 `engine/test/fixtures/contracts/33-gate-registry.json` | 16 |
| D-119 | `42ff1c91`·09-23 | current | #78——reason_code v1 四族种子+open-ended 声明＋合成病态 fixture 册（hash-object --literally/fast-import，镜像词表结构） ｜ 载体 `docs/known-gaps.md` 旧票 #78 `engine/test/fixtures/contracts/33-gate-registry.json` | 11 |
| D-120 | `42ff1c91`·09-23 | current | **去向未载**（账本收口节无记录，语义以账本行本体为准） | 6 |
| D-121 | `80a830a4`·09-23 | current | #80＋层序注记（铺开序 Macro-C→Micro-A→Micro-B→Macro-A 不变，Macro-A 最后）＋quarantine 尾巴三件事件闸保持原判＋T10 值守面维持＋R28-Q19 完整性复核债挂账不丢 ｜ 载体 `engine/test/contracts/53-check.mjs` `engine/src/audit/audit.ts` `engine/src/audit/macro-b.ts` | 3 |
| D-122 | `80a830a4`·09-23 | current | #80——预采集投影主干＋CLI-only lazy 补采＋MCP 永不写（miss→not_collected+CLI 指引）＋披露四件＋首查延迟 benchmark 条款（双触发面签名/CLI 命令形态票面裁；「LSP 调用」词条释义收窄已落 CONTE… ｜ 载体 旧票 #80 `CONTEXT.md〔退役→GLOSSARY.md〕` | 6 |
| D-123 | `80a830a4`·09-23 | current | #80——三层卡契约（kernel 数据＋确定性派生＋宿主叙事）＋advisory 结构性隔离＋失败三态＋closed 指标集（priority 阈值/分位 scope/指标键字典票面收口） ｜ 载体 旧票 #80 | 9 |
| D-124 | `80a830a4`·09-23 | current | #80——per-file 一等事实发射＋facet_rows 降 raw 证据位＋Macro-B behavior 消费面迁移＋补采同构发射管线（value_json 形态/role 标记机制/行数实测票面收口） ｜ 载体 `engine/src/audit/macro-b.ts` 旧票 #80 | 12 |
| D-125 | `80a830a4`·09-23 | current | #80——subject 规范化形五规则＋NFC＋禁大小写折叠＋file_renamed 血缘一等事实＋投影层缝合（阈值定值/case 告警落点/symlink 细则/跨 git 版本可复算验证票面收口） ｜ 载体 旧票 #80 | 15 |
| D-126 | `80a830a4`·09-23 | current | #80——at:sha pin＋staleness 双字段照答不拒答＋miss 四类显式态＋renamed_to 条件跳转＋补采资格=SHA 可达仓级管线＋脏区零感知＋双引用层纪律（miss 字段命名/drift 形态/并发去抖票面收口） ｜ 载体 旧票 #80 | 17 |
| D-127 | `80a830a4`·09-23 | current | #80 票面本体——单票闭环＋内部三步 stacked-diff＋形态三角双仓试点＋0-switch/1-switch 边界件＋p95 分档双阈值＋披露四件套＋not_in_preview＋golden 骨架锁＋能力矩阵措辞收窄同票＋退路 C 登记 ｜ 载体 旧票 #80 | 3 |
| D-128 | `55d6ae1b`·09-24 | current | #81——边界方言归一＋normalized 立法例收窄（D-100② scoped revised 已挂）＋双轴披露面＋golden 一次性再生＋回归 fixture（归一规则枚举面/方言留痕载体/normalized_tz_offset 码处置=票面 i… ｜ 载体 `docs/known-gaps.md` 旧票 #81 旧票 #80 | 20 |
| D-129 | `55d6ae1b`·09-24 | current | #82 批②——体积棘轮断言挂 rebuild-diff 同链＋check-dist 两减痛件；批评→dist-in-repo-superseded 触发器吸收映射登记（账本已载，registry 引用面随 #82）；收口注记=229,002B/5,116 … ｜ 载体 `engine/scripts/check-dist.mjs` 旧票 #82 `engine/test/fixtures/contracts/33-gate-registry.json` | 5 |
| D-130 | `55d6ae1b`·09-24 | current | #82 批①③——gen-adr-index 生成式索引（README ADR 指针生成化）＋first-external-contributor 触发器入 33-gate-registry；锐评点定性「三分实七分虚」留案 ｜ 载体 `docs/adr/0001-five-scale-scope.md` `CONTRIBUTING.md` `engine/scripts/gen-adr-index.mjs` | 5 |
| D-131 | `55d6ae1b`·09-24 | current | #82 批④——#80 票面勘误（D-038 位点类比措辞）；「谁消费它」谓词判据→CONTEXT 词条（本环节落：Demo Fixture 边界句） ｜ 载体 `engine/src/upstream/github-rest.ts` 旧票 #82 旧票 #80 | 0 |
| D-132 | `55d6ae1b`·09-24 | current | #82 批④——#80 票面勘误（golden 锁面枚举对齐 manifest）；「骨架」精修→CONTEXT Golden 锁面词条（本环节落）；D-127⑥/D-049⑤ status 注记已挂；34-guard→R32 #43 基线候选 v2 注记传递… ｜ 载体 旧票 #82 旧票 #80 旧票 #43 | 2 |
| D-133 | `55d6ae1b`·09-24 | current | 票据立案本体——#81/#82 分道＋排序（#81 先行，#82 与 #80 步②并行，主线不动）；waived-research 先例登记 ｜ 载体 `engine/scripts/check-dist.mjs` `engine/scripts/gen-adr-index.mjs` 旧票 #81 | 0 |
| D-134 | `e07650ab`·09-25 | current | #83 批①必修收窄——file-card lazy 补采 constraint 吞错收窄至 fact_id UNIQUE 精确指认（余者上抛回滚）＋emitted/skipped 披露计数＋毒事实回归断言＋DuckDB 消息形态钉＋落票前实物验证（@duc… ｜ 载体 `docs/adr/0022-quarantine-engine.md` `engine/src/audit/audit.ts` 旧票 #83 | 9 |
| D-135 | `e07650ab`·09-25 | current | #83 票据立案本体——单票修批＋批内排序（必修收窄→契约符合性→正确性边件→卫生组末节）＋步③双仓实跑前落的时点裁定 ｜ 载体 `engine/test/contracts/80-check.mjs` `engine/src/mcp-server.ts` 旧票 #83 | 5 |
| D-136 | `e07650ab`·09-25 | current | #83 批②契约符合性组扩一子项——失败态（new_file/insufficient_history）投影收口：历史派生族滤出卡面＋suppressed_facets closed 枚举带原因码＋derived.suppressed_by 保留＋raw 层… ｜ 载体 旧票 #83 | 11 |
| D-137 | `e07650ab`·09-25 | current | #80 步③票面扩枚举——血缘缝合入枚举＋批内子项清单（多跳链遍历/环检测/跨观测集解析）＋1-switch 成对件双端验证升级＋实测超载升级独立票路径预登记；D-125 行 F10 归口注记已挂 ｜ 载体 旧票 #80 | 15 |
| D-138 | `e07650ab`·09-25 | current | 33-gate-registry.json 新条目 81-first-non-z-dialect-host（event_bound/deferred/字段全齐已落）＋R32 收口节不可证面登记＋D-128⑤ scoped 注记已挂 ｜ 载体 `docs/adr/0009-intake-local-first-url-optin.md` `engine/test/fixtures/contracts/33-gate-registry.json` `docs/known-gaps.md` | 4 |
| D-139 | `e07650ab`·09-25 | current | AGENTS.md 负向行（格式化禁搭车＋写断言扩「禁 BOM＋保尾行」已落）＋33-gate-registry.json 新条目 89-format-piggyback-recurrence（deferred 触发器已落）＋本收口节 V1~V4 四行登记 ｜ 载体 `docs/adr/0018-versioning-and-chronicle-discipline.md` `engine/test/contracts/44-check.mjs` `engine/test/contracts/78-check.mjs` | 6 |
| D-140 | `7a624309`·09-25 | current | engine/.gitattributes dist/ generated 标记＋AGENTS.md 生成物禁搭车行＋D-067 信任源注记＋D-059⑨ 互引注记（本批已落） ｜ 载体 `docs/adr/0016-distribution-channel-agent-plugins-only.md` `engine/scripts/check-dist.mjs` `engine/src/audit/macro-b.ts` | 2 |
| D-141 | `7a624309`·09-25 | current | CONTRIBUTING.md 阅读地图段（纯指针零 ADR 枚举）＋D-130 注记（本批已落） ｜ 载体 `CONTRIBUTING.md` `engine/scripts/gen-adr-index.mjs` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-142 | `7a624309`·09-25 | revised | AGENTS.md 摄入规程行＋CONTEXT「评审快照分诊」词条＋registry 90-review-intake-mistriage-recurrence deferred 触发器（本批已落） ｜ 载体 旧票 #81 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 4 |
| D-143 | `7a624309`·09-25 | current | 件①本收口节勘误行（已落）；件② file-card.ts SuppressedFacetReason 收窄＋件④ 83-check B2 标签收窄 → R35 收口实施批（next-round.md T1）；件③ D-136 注记（已落） ｜ 载体 `engine/test/contracts/83-check.mjs` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-144 | `db40c8fb`·09-26 | current | AGENTS.md「收口工序前置核对」行（①④ 已落）＋41a-D7 结构不变量改写（②→实施窗，载体 #75批1）＋registry xfail-second-track-trigger 追认+rebind（③ 已落） ｜ 载体 `docs/adr/0018-versioning-and-chronicle-discipline.md` `41a-check〔守卫已退役〕` `engine/test/contracts/78-check.mjs` | 5 |
| D-145 | `db40c8fb`·09-26 | current | AGENTS.md dist 再生前置核对行（① 已落）——engine/scripts/check-dist.mjs 脚本现成零新机制 ｜ 载体 `docs/adr/0016-distribution-channel-agent-plugins-only.md` `engine/scripts/check-dist.mjs` `.github/workflows/engine-ci.yml` | 0 |
| D-146 | `db40c8fb`·09-26 | current | AGENTS.md 摄入分诊第四档行（① 已落）＋CONTEXT「评审快照分诊」四档扩写（② 已落）＋registry 90-条目/事件覆盖面扩写（③ 已落）＋边界声明随①②落（④ 已落）＋本节勘误登记（⑤ 已落） ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 9 |
| D-147 | `db40c8fb`·09-26 | revised | engine/src/fact/file-card.ts 一行修＋四件验证包＋协议核对义务（实施窗 T1 挂账） ｜ 载体 `engine/test/contracts/83-check.mjs` `engine/src/fact/file-card.ts` | 1 |
| D-148 | `181f2e2f`·09-27 | revised | AGENTS.md「规程生效时点」行＋「审计 finding 处置」行（③② 已落）＋registry 条目 r1-lineage-edgecap-accepted-risk／r2-peer-dedup-reaffirmed 入 risk_accepted … ｜ 载体 `docs/ra/r1-lineage-edgecap-accepted-risk.md` `engine/test/fixtures/contracts/33-gate-registry.json` `engine/CHANGELOG.md` | 15 |
| D-149 | `181f2e2f`·09-27 | current | AGENTS.md「守卫组指称」行（①② 已落）＋registry 条目 guard-baseline-upgrade-trigger（event_bound）＋t3-guard-manifest-shipped 事件（④ 已落）＋红件处置谱归 #75批1/… ｜ 载体 `engine/test/contracts/45-check.mjs` 旧票 #75 `engine/test/fixtures/contracts/33-gate-registry.json` | 9 |
| D-150 | `2d63c7c2`·09-27 | current | 本裁=试用方向立法——执行载体=charter（trials/codebuddy-r38-charter.md，判据预声明即 Kill Criterion 兑现）＋轮38任务书 T1/T2 序；注记义务①落 docs/adr/0016 Consequence… ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `docs/adr/0017-preview-release-model.md` `docs/adr/0016-distribution-channel-agent-plugins-only.md` | 2 |
| D-151 | `2d63c7c2`·09-27 | current | charter 全文承载（(iv) 基线/exit-success 双轴/SBTM 三件套/findings 五要素/dedup-first）＋trials/README.md 一句话语义声明（同 commit）＋CONTEXT 词条×2（宿主试用/安装树自… ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 1 |
| D-152 | `2d63c7c2`·09-27 | current | charter 预声明节承载（③not-run 不换仓/⑦读数以安装树为准/R-a~c 参数/判据三会话内观测点/「摄入分诊≠终裁」显式化）＋D-150⑤ scoped 注记（③，见 D-150 状态格）＋⑤「关窗不注册事件」负向留痕（本节 scoping） | 0 |
| D-153 | `07290531`·09-27 | current | 射程立法——核销呈报与五项混合颗粒度裁定序入本收口节＋编年 M-024 随行；簿记面（T1-N2 口径刷新/xfail 追认注记/R28-Q19 台账位）不占裁定链随本节过程登记 ｜ 载体 `docs/adr/0024-detector-judgment-at-consumption-position.md` `docs/adr/0022-quarantine-engine.md` `37-check〔守卫已退役〕` | 2 |
| D-154 | `07290531`·09-27 | current | 探测面语义立法——执行载体=批2-β 实施窗（源码面裁定≠执行，本轮零源码改动）＋ADR-0024 立法文档归执行窗随源码同窗（收①②；③处置类不入）；登记面兑现=known-gaps/registry 本批随行；41 件存量册 note 挂 ADR-002… ｜ 载体 `docs/adr/0024-detector-judgment-at-consumption-position.md` `docs/known-gaps.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 6 |
| D-155 | `07290531`·09-27 | current | 登记面立法——registry 三新项（batch2beta-techdebt-review/codebuddy-ide-gap-watch/codebuddy-f02-display-watch）＋事件 next-audit-window 机读锚＋know… ｜ 载体 `37-check〔守卫已退役〕` `33-check〔守卫已退役〕` `docs/known-gaps.md` | 13 |
| D-156 | `07290531`·09-27 | current | 完备性终裁——N1/N2 补登=GAP-B2B-07/08 实物兑现（去向断链修复）；批4 对称性显式＋词条声明义务＋禁绕过收口节关窗=本节 scoping/过程登记条款 ｜ 载体 `docs/adr/0024-detector-judgment-at-consumption-position.md` `25-check〔守卫已退役〕` `docs/known-gaps.md` | 10 |
| D-157 | `a9e4ee00`·09-28 | current | 摄入分诊九条定案＋射程(b)立法＋C2 入门条件——锐评五面裁面入本节去向表承载；簿记面（T3 哨兵／T2 票面）不占裁定链随 scoping 登记 ｜ 载体 `docs/adr/0017-preview-release-model.md` `37-check〔守卫已退役〕` `26-check〔守卫已退役〕` | 0 |
| D-158 | `a9e4ee00`·09-28 | current | F-A1 谓词收紧立法——执行载体=实施窗同票五件（谓词改剥后真消费形态＋CONTEXT:363 表述坐实＋S2 fxStringNom 扩件＋41 件字符串维度重测分诊＋ADR-0024 一行注记挂本条指针）；新检出按 D-094 批注册不绕门 ｜ 载体 `docs/adr/0024-detector-judgment-at-consumption-position.md` `ADR-0025（治理轮新编号）` `CONTEXT.md〔退役→GLOSSARY.md〕` | 3 |
| D-159 | `a9e4ee00`·09-28 | revised | 环境契约分层立法——执行载体=实施窗六件套（env SSOT 变量＋tier 自声明全 60 件＋skip 三态呈现契约＋manifest env-gated 类＋01-check repo-relative→kr-01 显式转正＋非 check 字面清扫）… ｜ 载体 `01-check〔守卫已退役〕` `37-check〔守卫已退役〕` `39-check〔守卫已退役〕` | 59 |
| D-160 | `a9e4ee00`·09-28 | current | era-scoped 退役机制立法——执行载体=实施窗（manifest retired 类终态留档＋D-094 划界注记＋protected_surface+tier 双字段显式扩展 D-159＋归档目录＋首件流程）；裁军诉求显式驳回=本节 scoping… ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 51 |
| D-161 | `a9e4ee00`·09-28 | current | 提交信息三栏位形态立法——trailer 词表词条本批先立 CONTEXT（生效依赖先行）＋新形态自本收口 commit 后下一 commit 起适用（D-148③ 落盘豁免） ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/CHANGELOG.md` | 0 |
| D-162 | `a9e4ee00`·09-28 | revised | 暴露梯度三段立法——Stage-0 追认即刻生效（语义命名非动作）；Stage-1 随首例 charter 落地（宿主资格=逐案用户闸门）；Stage-2 四判据包＋30 日静默窗入 registry manual_watch 锚随执行窗登记（D-155 同… ｜ 载体 `docs/adr/0017-preview-release-model.md` `docs/ra/GAP-HOST-01.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 18 |
| D-163 | `466aac1e`·09-28 | current | env-contract 泛化立法——四类前置探测（git-object:/engine-deps:/asset:/sibling:）＋SKIP reason 修复指引模板（D-072 三段文案）＋ghost 五件 T3 逐件判（在仓自足+正当冻结语料→临时… ｜ 载体 `engine/test/contracts/43-check.mjs` `40-check〔守卫已退役〕` `engine/test/contracts/23-first-report.mjs` | 47 |
| D-164 | `466aac1e`·09-28 | current | 探测粒度精化＋retired 哨兵立法——groupProbe(group,needs) 组级 API＋46 B/C 挂 sibling:jiahao 与 A/D/E 零需分档＋39 E 段脱连坐＋GUARD-RESULT 组级三态渲染＋footer ski… ｜ 载体 `engine/test/contracts/47-check.mjs` `engine/test/contracts/46-check.mjs` `39-check〔守卫已退役〕` | 19 |
| D-165 | `466aac1e`·09-28 | current | 分层定稿立法——裁定层本轮闭环（本节即兑现物：每条锐评指控去向在册）；验收层如实不闭——fresh-clone 哨兵条目+stage2-launch-criteria 判据② FAIL 确认行=本批随收口落；tier 误声明复发触发器=本批随收口落；编年随行… ｜ 载体 `engine/test/fixtures/contracts/33-gate-registry.json` `engine/CHANGELOG.md` | 17 |
| D-166 | `b0379ddb`·09-28 | current | 锐评逐项双层终局裁定——五态表本节即兑现物（§2.1 双层闭环／§2.2·§2.3 显式驳回-USP2类带替代控制／§3.3 验收开放-值守／§1 留痕）；CONTEXT「分层定稿」词条项级扩写随行 ｜ 载体 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 0 |
| D-167 | `b0379ddb`·09-28 | current | 闸粒度上限终裁＋审计残余处置——组粒度终态定论/Bond 判据「还能失败吗」入册（本节）；O4 三重披露维持＋可选 footer partial 派生展示语（polish 非义务）；O6 40-B1 重言删挂「下次触碰 40-check」NO-OP 搭车 ｜ 载体 `40-check〔守卫已退役〕` | 0 |
| D-168 | `b0379ddb`·09-28 | current | Stage-2 残余分层处置——①Macro-A 绑死 DoR（DoR-b 实证不满足如实报阻塞：.scratch 四仓 facts 被 D-062③ 排除、真实仓 facts 不存在）／③GAP-HOST-01 RA 五要件档案草案=执行窗义务呈用户批（关… ｜ 载体 `docs/ra/GAP-HOST-01.md` | 13 |
| D-169 | `b0379ddb`·09-28 | revised | T2 挂账续持＋三事件触发器（GAP-B2B 恶化/第二同型需求/缺口台账新增命中——本批注册入 registry，D-170③「未注册不算锚定」）＋审计窗点火检查义务；D-148→revised/RA 五要件标准立（AGENTS.md RA 行＋CONTE… ｜ 载体 `ADR-0035（治理轮新编号）` `docs/ra/GAP-HOST-01.md` 旧票 #75 | 33 |
| D-170 | `b0379ddb`·09-28 | current | 分层定稿判据化——裁定层本轮宣告闭环（锐评五条终局名分＋逐题拍板留痕）；欠账三要素（具名 owner＋时点锚＋复验方式）判据入册；验收层开放面双行呈报 ｜ 载体 `docs/ra/GAP-HOST-01.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 2 |
| D-171 | `b3306052`·09-29 | current | RA 到期语义分类立法——腐化基座类强制 min(事件先到,≤90d) 双锚／wontfix 恒久类事件制合法双条件（触发事件=在册可核验 sentinel＋低频盘查钩=T3 审计窗普查形态）＋分类判据=「补偿控制存续承载接受有效性」；r1 判腐化类重立项 … ｜ 载体 `docs/known-gaps.md` `docs/ra/GAP-HOST-01.md` `docs/ra/r1-lineage-edgecap-accepted-risk.md` | 19 |
| D-172 | `b3306052`·09-29 | current | kr-01 收口路径裁定 (iv)——冻结重钉 3 件（git show 3a049d45: 字节级恢复 01-corpora/01-align/01-spotcheck）＋frozen 证据包机器可查豁免立法＋流程缺陷归因登记＋上游漂移观察移交＋revie… ｜ 载体 `01-check〔守卫已退役〕` `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 12 |
| D-173 | `183ddcfb`·09-29 | current | 本收口节实物（spec 条目级去向=CONTEXT「静默窗」新词条＋暴露梯度 Stage-2 弹注同步；registry stage2-launch-criteria 字段化＋读数更正=执行窗义务） ｜ 载体 `docs/spec.md` `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 5 |
| D-174 | `3637557d`·09-29 | current | 本收口节实物（registry stage2-launch-criteria 补 window_state_enum ＋可选跨字段断言=执行窗义务；spec 条目级去向=「静默窗」词条既有值域文本面已在——枚举键机读化属 registry 字段形态不立词条） ｜ 载体 `33-check〔守卫已退役〕` `docs/spec.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 4 |
| D-175 | `3637557d`·09-29 | current | 本收口节实物（等待期 allowed/deferred 清单成文＋(b) 面盘点＋(c) 三问筛呈裁＋(d) 面清单呈裁=执行窗义务；CONTEXT「等待期工作面序」新词条=本批落） ｜ 载体 `docs/spec.md` `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 2 |
| D-176 | `ce09ea3a`·09-29 | current | spec-治理面裁定条＋执行窗义务三要素（轮49 T1 候选：(b) 面已触发欠账清零序内——修复一行＋46-check parse 档断言＋registry manual_watch 新册项 ci-workflow-liveness-watch） ｜ 载体 `engine/test/contracts/46-check.mjs` `49-check〔守卫已退役〕` `.github/workflows/macro-b-regression.yml` | 13 |
| D-177 | `ce09ea3a`·09-29 | current | spec-治理面裁定条＋文书面条款落行义务（WORKFLOW §4.2.x 或报告文书节——执行窗裁量）＋D-147 revised 注记互引 ｜ 载体 `docs/spec.md` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 3 |
| D-178 | `ce09ea3a`·09-29 | current | spec-治理面裁定条＋执行窗义务（R48 (d) 面调研缺件从 ctx source 物化补落 reports/——轮49 文书批） ｜ 载体 `docs/spec.md` | 0 |
| D-179 | `ce09ea3a`·09-29 | current | spec-治理面裁定条＋执行窗义务（生成器确定性化＋volatile-fields 枚举清单＋两跑零 diff 自检件——(d) 面序内排程在 D-176 后；源码面变更须走 D-177 新规工序：先落声明物化面＋实跑必选——本裁为 D-177 生效后首个适… ｜ 载体 `engine/test/contracts/46-check.mjs` `docs/spec.md` | 12 |
| D-180 | `d7979ed6`·09-30 | current | spec-治理面裁定条＋执行窗义务（WORKFLOW/报告节口径落行「除已收编真实语义信号件外零 churn」＋收口模板随行——轮50 文书批） ｜ 载体 `75a-check〔守卫已退役〕` `docs/spec.md` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 0 |
| D-181 | `d7979ed6`·09-30 | current | spec-治理面裁定条＋执行窗义务（预声明文件 append-only 勘误节建制＋首例三缝隙补勘误〔①载体漂移轻档索引批注／②A5 增项③锚语义=重档勘误 commit post-hoc 标位〕＋「首例即定形」注记——轮50 文书批） ｜ 载体 `docs/spec.md` | 9 |
| D-182 | `d7979ed6`·09-30 | current | spec-治理面裁定条＋执行窗义务（册项 anysearch-cli-intent-drift-watch 追加确认行＋缺口 Accepted Risk 五要件注册＋哨兵续看——轮50 文书批；冻结件字节零动） ｜ 载体 `ADR-0036（治理轮新编号）` `engine/src/audit/macro-c.ts` `docs/spec.md` | 13 |
| D-183 | `d7979ed6`·09-30 | current | spec-治理面裁定条＋执行窗义务（轮50 执行批微修批——三内容各自紧凑预声明〔D-177 比例化〕＋各自独立 commit＋一次守卫组收口；普查命中走 D-181 勘误） ｜ 载体 `179-check〔守卫已退役〕` `engine/test/contracts/46-check.mjs` `docs/spec.md` | 4 |
| D-184 | `8844d5bd`·09-30 | current | spec-治理面裁定条＋执行窗义务（AR 五要件注册＋迁入闸条文=本轮收口批；闸件机检件＋check-kit 根治〔预声明包先行〕=轮51 执行批——闸件本体系 check 源码按 D-184 负向④排产入执行批非收口写码面） ｜ 载体 `70-check〔守卫已退役〕` `179-check〔守卫已退役〕` `docs/spec.md` | 11 |
| D-185 | `8844d5bd`·09-30 | current | spec-治理面裁定条＋执行窗义务（WORKFLOW 开工闸条第四条＋任务书换代模板自检注记=本轮收口批落行；首个失真事件差异行形态核对=复验面） ｜ 载体 `docs/spec.md` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 0 |
| D-186 | `8844d5bd`·09-30 | current | spec-治理面裁定条＋执行窗义务（WORKFLOW §4.2.3 调研规程落行＋降级构成比逐轮登记=本轮收口批；连续 3 轮 100% fallback 复审票=事件触发器在册） ｜ 载体 `docs/spec.md` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-187 | `8844d5bd`·09-30 | current | spec-治理面裁定条＋执行窗义务（WORKFLOW 换代工序条＋保护区节规程化=本轮收口批落行；75a 分向适配核查=轮51 执行批） ｜ 载体 `42-check〔守卫已退役〕` `engine/test/contracts/44-check.mjs` `engine/test/contracts/45-check.mjs` | 0 |
| D-188 | `6f467e60`·09-30 | current | spec-治理面裁定条＋WORKFLOW §4.2.10-6 条文（本轮收口批落行）＋CONTEXT「commit 指针法定形」词条；机检件=执行窗登记（D-192⑤ 下轮执行批） ｜ 载体 `docs/spec.md` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 1 |
| D-189 | `6f467e60`·09-30 | current | WORKFLOW §4.2.10-8 位形枚举条文＋CONTEXT「严格层／宽层」词条（本轮收口批） ｜ 载体 `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-190 | `6f467e60`·09-30 | current | WORKFLOW §4.2.10-7＋CONTEXT「锚线」词条（本轮收口批） ｜ 载体 `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-191 | `6f467e60`·09-30 | current | 本轮收口批兑现：predecl §7 勘误补钉行＋T3 wmu 映射勘误＋D-191 行自体伪 SHA 勘误（下节目 E-1~E-3）；存量普查判级=守卫首跑承接（执行窗登记） | 0 |
| D-192 | `6f467e60`·09-30 | current | 执行窗登记=下轮执行批（D-177 预声明先行→fixture 四态→落盘→guard-all-run 绿→D-149 入列）；CONTEXT「已知违规清单」词条本轮落 ｜ 载体 `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 2 |
| D-193 | `6f467e60`·09-30 | current | 本轮收口批兑现：WORKFLOW §4.2.10 扩写＋CONTEXT 五词条；明示不立 ADR-0025＋不另立指针纪律专文（过程裁定载体惯例承袭） ｜ 载体 `ADR-0025（治理轮新编号）` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `CONTEXT.md〔退役→GLOSSARY.md〕` | 0 |
| D-194 | `6f467e60`·09-30 | revised | 仅②款复验义务被 D-195 撤销（降级合成结论采纳为终态）；①双层结构原则＋④呈报教训立法存续 current | 0 |
| D-195 | `6f467e60`·09-30 | current | 账本即落点（过程裁定）；atomcode 构成比登记随行（下节目过程登记） ｜ 载体 `账本行本体（过程裁定，无独立工件）` | 0 |
| D-196 | `2d4be54c`·10-01 | current | registry manual_watch 条目落盘=执行批 T1-C；显式驳回 (i) 摘除／(iii) 散文表维持随本表登记 ｜ 载体 `engine/test/fixtures/contracts/33-gate-registry.json` | 7 |
| D-197 | `2d4be54c`·10-01 | current | WORKFLOW §4.2.10-10 条文（本批落）；立法票扩列 STRICT_HEADERS＋84-check 反向闸断言面=执行批 T1-B（D-177 预声明先行） ｜ 载体 `84-check〔守卫已退役〕` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 0 |
| D-198 | `2d4be54c`·10-01 | current | WORKFLOW §4.2.10-11 兑现路径预登记（本批落）；显式驳回全仓递归与根级 .md 规则枚举随本表登记 ｜ 载体 `84-check〔守卫已退役〕` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` `engine/CHANGELOG.md` | 0 |
| D-199 | `2d4be54c`·10-01 | current | 执行批 T1-A 专项收敛窗（下轮执行批）；同窗 PV-F10D 守恒复跑＋manifest 只删不增独立 commit ｜ 载体 `84-check〔守卫已退役〕` | 0 |
| D-200 | `2d4be54c`·10-01 | current | 84-check 探测面三收紧并入 T1-B 同一 D-177 预声明包（执行批） ｜ 载体 `84-check〔守卫已退役〕` | 0 |
| D-201 | `2d4be54c`·10-01 | current | WORKFLOW §4.2.10-12 条文（本批落）；84-check PROTECTED_SURFACE 声明补句随 T1-B 触碰同窗落；death-watch 随读口径=执行侧登记 ｜ 载体 `84-check〔守卫已退役〕` `.scratch/architecture-recovery/WORKFLOW.md〔退役·历史现场〕` | 3 |
| D-202 | `f96936fa`·10-03 | current | 账本即落点（过程裁定/设计树路由——D-195 同型先例，去向表登记本身即兑现） ｜ 载体 `engine/src/audit/audit.ts` `engine/src/audit/macro-c.ts` `engine/src/audit/micro-a.ts` | 0 |
| D-203 | `f96936fa`·10-03 | current | 账本即落点（序已全量消费为 D-204~D-210） ｜ 载体 `docs/adr/0017-preview-release-model.md` `engine/src/audit/audit.ts` `engine/src/audit/micro-a.ts` | 0 |
| D-204 | `f96936fa`·10-03 | current | CONTEXT「preview」法理边界词条新立＋执行窗立新票×2（Macro-C 产线化票=38 管线移植 engine 一等面+file-card 同位+anysearch-cli 原语料重校准断言；Micro-A 产线化票=适配器硬化面）＋同票收窄措辞… ｜ 载体 `ADR-0015（保持删除）` `engine/src/audit/audit.ts` `engine/src/audit/macro-c.ts` | 54 |
| D-205 | `f96936fa`·10-03 | current | CONTEXT/spec 分层语义词条（structure/shape vs S3/budget-attribution 双标签+ADR-0024 消费位判据引用）＋新守卫 check（facts 层三断言=同源引用互等/opposing 谓词成对引 #51… ｜ 载体 `docs/adr/0024-detector-judgment-at-consumption-position.md` `docs/adr/0013-three-layer-acceptance-gates.md` `ADR-0015（保持删除）` | 21 |
| D-206 | `f96936fa`·10-03 | current | registry Trigger-gated Closure 双事件登记（B6 议程前置 OR Macro-B 报告 supply-chain 行真实消费信号）＋源判据存档=reports/R56-Q5-atomcode-research.md（已落盘）＋O… ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `engine/src/audit/macro-b.ts` `spec-phase-tasks〔历史现场〕` | 5 |
| D-207 | `f96936fa`·10-03 | current | #10→账本内部路由已消费成 D-208；#9→对账票归执行窗立新票（含 A-009 数字表对账认领+D-209 枚举域成文）；#13→认领票（spec-phase-tasks #13 行注记转「已对账」）；显式驳回 (b) 打包/(c) 全转执行票随表登记 ｜ 载体 `engine/src/audit/micro-a.ts` `engine/src/upstream/github-rest.ts` `spec-phase-tasks〔历史现场〕` | 0 |
| D-208 | `f96936fa`·10-03 | current | CONTEXT 拓扑词条（进程内 OTel Context+终端自生成+四面定性+github-rest 禁注负向行）＋registry inbound 重裁双事件册（宿主侧 MCP trace-context 契约出现 OR D-062 达成；册内预声明=… ｜ 载体 `engine/src/upstream/github-rest.ts` `spec-phase-tasks〔历史现场〕` `docs/spec.md` | 3 |
| D-209 | `f96936fa`·10-03 | current | #9 对账票内一行成文（stale_data_marker=政策量四态 vs drift=位置量三态不互映射，fresh 同名巧合非设计）＋A-009 数字表对账认领注记；无新工程面 | 0 |
| D-210 | `f96936fa`·10-03 | current | CONTEXT 暴露梯度词条注入（三轴正交句：层 GA=能力成熟度门/产品 1.0=契约稳定性门/Stage-2=暴露门＋判据类目骨架六件：语料广度/披露清洁窗/象限完整度含明示永久豁免位/适配器确定性验收/schema 稳定窗/修订通道声明）＋各层 GA … ｜ 载体 `docs/adr/0017-preview-release-model.md` `ADR-0015（保持删除）` `docs/versioning.md` | 0 |
| D-211 | `6a7a714d`·10-07 | current | ①reef#1→BACKLOG #88 执行票（验收判据=fresh clone 全绿并入 fresh-clone-rerun-watch 哨兵＋tier 重声明＋CI 射程缺口勘误；修法 impl 参数不预钉）；②reef#2→registry dist-… ｜ 载体 `docs/adr/0017-preview-release-model.md` `84-check〔守卫已退役〕` `engine/test/contracts/78-check.mjs` | 25 |
| D-212 | `6a7a714d`·10-07 | current | BACKLOG #89 断言票（41a-check 承载 ## 全局唯一＋### 同父节内唯一双账本同扫＋ADR-0013 预声明随票）；84-check 对账本文档面扫描维持不变注记=D-212 行内已载免再落 ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `docs/adr/0024-detector-judgment-at-consumption-position.md` `41a-check〔守卫已退役〕` | 0 |
| D-213 | `6a7a714d`·10-07 | current | 账本即落点＋CONTEXT 词条（本轮整理环节落——D-213① 承载面义务）＋BACKLOG #91（危险正则形态机检断言〔[^]/否定类内裸 ]〕＋同型普查 D-183 通道＋P0/P1 内嵌活性正对照分级落地）；承载面拍板=α（D-177 scoped… ｜ 载体 `docs/adr/0013-three-layer-acceptance-gates.md` `engine/test/contracts/85-check.mjs` 旧票 #91 | 3 |
| D-214 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #91（consumption_forms 枚举面 schema＋75a-T3 式声明↔登记双单向对账＋registry 消费形态变更触发器＋D-159①/D-211①/D-177⑤/D-076③/D-165② 五处边界注记随执行… ｜ 载体 `.github/workflows/engine-ci.yml` 旧票 #91 `账本行本体（过程裁定，无独立工件）` | 24 |
| D-215 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #91（env-contract.mjs＋need() 头注＋D-163①「四类→五类」D-146⑤ scoped 勘误注记三同窗；修复面禁主仓 fetch——D-074 边界） ｜ 载体 `84-check〔守卫已退役〕` 旧票 #91 `docs/spec.md` | 8 |
| D-216 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #94（4.2 but-only 例外行沿 4.2.1 文法＋registry gitbutler-eof-hunk-watch manual_watch 登记〔本轮整理环节随落〕＋两冻结件 75a-census-register… ｜ 载体 旧票 #94 `账本行本体（过程裁定，无独立工件）` `engine/test/fixtures/contracts/33-gate-registry.json` | 9 |
| D-217 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #92（build-bundle.mjs minifyWhitespace+minifySyntax〔禁 identifiers/禁 sourcemap 入 dist〕→实测读数→cap=N×1.25 向下重推导＋D-177 预声… ｜ 载体 `docs/adr/0008-agent-plugin-five-layer-box.md` `docs/adr/0011-single-repo-subdir-but-branches.md` `docs/adr/0016-distribution-channel-agent-plugins-only.md` | 9 |
| D-218 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #93（update-70-inventory.mjs＋70-check.mjs §1 同源双拷贝同修＋63-inventory 再生独立 commit〔D-180① 紧邻对〕＋75a/下游钉值同轮一次重钉＋纯减法归因判据预声明〔… ｜ 载体 `70-check〔守卫已退役〕` 旧票 #93 `账本行本体（过程裁定，无独立工件）` | 0 |
| D-219 | `6a7a714d`·10-07 | current | 账本即落点＋BACKLOG #94（stable() 追加 \n＋drift 比对改字节等价 readFileSync(full,"utf8") !== expected 去双侧 trim〔D-196「能看自身」兑现〕＋一次 npm run gen 再生四件… ｜ 载体 `engine/scripts/gen-manifests.mjs` `engine/scripts/gen-adr-index.mjs` `engine/scripts/gen-micro-b-emission-golden.mjs` | 2 |
| D-220 | `6a7a714d`·10-07 | current | ①.gitignore 增 .atomcode/ 豁免行→BACKLOG #94 顺带腿（文件写归执行批）；②远端三分支 r53-closeout/r54-t1-pointer-convergence/r55-audit 已于 2026-10-07 git … ｜ 载体 旧票 #94 `engine/CHANGELOG.md` | 1 |

覆盖核对：220 条 `D-NNN` 全部由 `macro-audit-ledger.md` / `architecture-recovery-ledger.md` 的账本行直读解析；其中 14 条账本收口节未记去向、4 条去向点名物在本仓无对应工件，逐号见 §7。

## 2. 旧票号 `#32`–`#94` → BACKLOG 行 / 引入 commit / 现行载体

| 票 | 引入 | 标题（BACKLOG 原文摘要）| 来源 | 状态 | 现行载体 | 引用数 |
|---|---|---|---|---|---|---|
| #32 | `84f571a6`·09-15 | B1.2 落地：31 份 prompts「## 收尾」段首黑体硬要求块 | D-029 | 账本未记闭环 | **unmapped** ｜ 历史现场 `.scratch/architecture-recovery/handoffs/32-prompts-closeout-block.md` 等 6 件 | 11 |
| #33 | `84f571a6`·09-15 | T7 挂门机检化 guard：扫全部挂门项「最迟时点/触发事件/复审时点」到期报警 | D-026 / D-034④ / D-024 | 账本记已闭环 | `33-check〔守卫已退役〕` `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/33-ext-watch-guard.md` 等 9 件 | 28 |
| #34 | `84f571a6`·09-15 | plugin.json 对齐 Agent Plugins 1.0.0（$schema const / schemaVersion / skills·mcp·extensions … | D-036 / D-012 余款 | 账本未记闭环 | `engine/test/contracts/34-check.mjs` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/34-plugin-json-compliance.md` 等 6 件 | 12 |
| #35 | `84f571a6`·09-15 | CodeLore 契约面扩开首批 ≈30 面（演化主干 12＋S3 族 6＋S5 族 12），逐面 golden 契约测试 | D-035 / D-034 | 账本记已闭环 | `docs/adr/0014-upstream-integration-dual-track.md` `35-check〔守卫已退役〕` `engine/src/audit/macro-c.ts` `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/35-codelore-expansion-batch1.md` 等 11 件 | 10 |
| #36 | `84f571a6`·09-15 | CodeLore LLM 面（explain 族）env 门控＋成本验收 | D-035 | 账本记已闭环 | `36-check〔守卫已退役〕` 旧票 #35 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/36-codelore-llm-faces.md` 等 15 件 | 15 |
| #37 | `84f571a6`·09-15 | 试点面可用性审计：三仓 PR 人/机比＋supersede 链完整度实测脚本 | D-033 | 账本记已闭环 | `37-check〔守卫已退役〕` `engine/src/audit/macro-c.ts` `engine/src/audit/micro-a.ts` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/37-pilot-surface-audit.md` 等 7 件 | 28 |
| #38 | `84f571a6`·09-15 | Macro-C preview：anysearch-cli 校准＋报告强制披露单仓校准限制＋happy+failure 演示双件 DoD | D-034 / D-032 / D-033 | 账本记已闭环 | `38-check〔守卫已退役〕` `engine/src/audit/macro-c.ts` 旧票 #35 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/38-macro-c-preview.md` 等 13 件 | 20 |
| #39 | `84f571a6`·09-15 | Macro-B 三仓 one-shot＋jiahao 持续回归接入 CI | D-033 / D-034 | 账本记已闭环 | `engine/scripts/39-macro-b-one-shot.mjs` `39-check〔守卫已退役〕` `engine/src/audit/macro-b.ts` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/39-macro-b-three-repo.md` 等 30 件 | 19 |
| #40 | `84f571a6`·09-15 | 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户） | D-033 / D-013 | 账本记已闭环 | `engine/scripts/40-macro-b-one-shot.mjs` `40-check〔守卫已退役〕` `engine/src/audit/macro-b.ts` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/40-external-repo-generalization.md` 等 15 件 | 23 |
| #41 | `84f571a6`·09-15 | 已拆分为 #41a/#41b（父号不再单独受理） | — | 已拆分 → #41a/#41b | 拆分父号，落点见 #41a/#41b | 41 |
| #41a | `655d8c98`·09-16 | 分发收尾·仓内文档面：examples/first-report/ 复制四件＋披露 README／README 能力边界＋preview 标注＋「Try on a real re… | D-030 / D-031 / D-032 / D-038 / D-0… | 账本记已闭环 | `41a-check〔守卫已退役〕` 旧票 #41 `engine/CHANGELOG.md` `examples/first-report/` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/41a-distribution-docs.md` 等 5 件 | 0 |
| #41b | `655d8c98`·09-16 | 分发收尾·上架面：listing 资产／marketplace 字段查证（preview 标注字段＋版本元数据 schema＋竞品扫描）／凭据申请 | D-031 / D-037 / D-026 / D-027 | 账本未记闭环 | `engine/test/contracts/41b-check.mjs` `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` `docs/listing/description.md` 旧票 #41 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/41b-listing-assets.md` 等 6 件 | 0 |
| #42 | `84f571a6`·09-15 | 上游队列：Scorecard/repomix 探针＋CodeLore sqlite dump 对照评估 | D-023 / D-034 / D-035 | 账本记已闭环 | `42-check〔守卫已退役〕` `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/42-upstream-queue.md` 等 14 件 | 13 |
| #43 | `84f571a6`·09-15 | 样例 golden CI：CI 重渲染 fixture 并 diff，更新走 PR 审查 | D-030 | 账本记已闭环 | `engine/test/contracts/43-check.mjs` `.github/workflows/golden-ci.yml` `engine/scripts/gen-demo-golden.mjs` 旧票 #33 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/43-sample-golden-ci.md` 等 5 件 | 37 |
| #44 | `655d8c98`·09-16 | 版本与上游锁定制度化：engine/upstream-lock.yaml 种子行＋docs/versioning.md 衔接＋README §3 上游表状态列绑锁表为机读权威＋守… | D-037 / D-039 | 账本记已闭环 | `engine/test/contracts/44-check.mjs` `engine/upstream-lock.yaml` `docs/versioning.md` `engine/CHANGELOG.md` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/44-upstream-lock.md` 等 5 件 | 20 |
| #45 | `655d8c98`·09-16 | 演示入口：fixture 生成器＋definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋golden/＋… | D-038 | 账本记已闭环 | `engine/test/contracts/45-check.mjs` 旧票 #43 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/45-demo-entry.md` 等 5 件 | 20 |
| #46 | `5dca40df`·09-16 | 回归 CI 迁回 6F 自有 CI：6F workflow 加 macro-b 回归 job（URL opt-in clone 公开仓 → Macro-B one-shot → … | D-046 | 账本记已闭环 | `engine/test/contracts/46-check.mjs` `.github/workflows/macro-b-regression.yml` `engine/src/audit/macro-b.ts` 旧票 #39 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/46-regression-ci-migration.md` 等 5 件 | 17 |
| #47 | `28b40670`·09-16 | 托管平台 API 适配器：GitHub REST 主路（env token）＋gh 已认证态可选回退＋无认证降级；最小契约=PR 枚举（平台 Bot 双检）＋元数据＋diff 双… | D-048 / ADR-0020 | 账本未记闭环 | `engine/test/contracts/47-check.mjs` `docs/adr/0020-hosted-platform-api-adapter.md` `engine/src/upstream/github-rest.ts` `engine/src/audit/micro-a.ts` 旧票 #48 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/47-github-rest-adapter.md` 等 5 件 | 39 |
| #48 | `28b40670`·09-16 | Micro-A preview 单票铺开：适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片）＋双仓实跑＋报告双件＋披露三件套；验收序列=① gol… | D-049 | 账本未记闭环 | `engine/test/contracts/48-check.mjs` `engine/test/contracts/48-micro-a-preview.mjs` `engine/src/audit/micro-a.ts` 旧票 #47 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/48-micro-a-preview.md` 等 42 件 | 55 |
| #49 | `28b40670`·09-16 | 回归 matrix 经典仓接入：git/git＋django/django＋spring-projects/spring-boot 三语言族各一 leg 入 macro-b-re… | D-050 | 账本未记闭环 | `.github/workflows/macro-b-regression.yml` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/49-regression-matrix.md` 等 6 件 | 26 |
| #50 | `42bea32c`·09-17 | 叙事双轨落地：skills/macro-audit/references/ 三件（quadrant-rubric.md S1-S5 判据可操作化／strategy-questio… | D-053 / D-057④ | 账本未记闭环 | `engine/test/contracts/50-check.mjs` `docs/adr/0013-three-layer-acceptance-gates.md` `engine/skills/macro-audit/references/quadrant-rubric.md` `engine/skills/macro-audit/references/strategy-questions.md` `engine/skills/macro-audit/references/report-template.md` ｜ 历史现场 `.scratch/architecture-recovery/handoffs/50-narrative-dual-track.md` 等 5 件 | 49 |
| #51 | `42bea32c`·09-17 | Macro-B behavior 象限接入：codelore 行为面（churn/hotspot/change-coupling）逐面 golden 契约（复用 #35 模式）＋… | D-054 | 账本未记闭环 | `engine/test/contracts/51-check.mjs` `engine/test/contracts/51-macro-b-behavior.mjs` `engine/src/audit/macro-b.ts` 旧票 #35 ｜ 历史现场 `.scratch/architecture-recovery/handoffs/51-macro-b-behavior.md` 等 13 件 | 52 |
| #52 | `9460cf28`·09-17 | 已拆分为 #52a/#52b（父号不再单独受理） | — | 已拆分 → #52a/#52b | 拆分父号，落点见 #52a/#52b | 26 |
| #52a | `6f021db6`·09-17 | checker-eval 仪器标定：合成 claim-evidence 对 ~80-120 条按 checker 判定空间分层（presence 成立/不成立、支持/矛盾/中立、… | D-061 | 账本记已闭环 | `engine/test/contracts/52a-check.mjs` `engine/test/contracts/52a-checker-eval.mjs` `engine/test/contracts/52a-gen-corpus.mjs` `engine/test/fixtures/contracts/52a-checker-eval-corpus.json` 旧票 #56 ｜ 历史现场 `.scratch/architecture-recovery/reports/52a-check.mjs` 等 6 件 | 0 |
| #52b | `6f021db6`·09-17 | 宿主叙事质量 eval（触发器票）：锚=audit 首次实跑产出真实宿主叙事段（或 pilot 真实语料 N≥50 段）；语料=wild slice（不清洗失败形态，degrad… | D-061 / D-057② | 账本未记闭环 | 旧票 #52a `engine/test/fixtures/contracts/33-gate-registry.json` | 0 |
| #53 | `6f021db6`·09-17 | audit 一等命令（Macro-B flesh-out）：macro-audit audit <path\|owner/repo\|url> [--scale] [--out … | D-060 | 账本记已闭环 | `engine/test/contracts/53-check.mjs` `docs/adr/0009-intake-local-first-url-optin.md` `docs/adr/0017-preview-release-model.md` `engine/src/audit/audit.ts` `engine/src/audit/macro-b.ts` ｜ 历史现场 `.scratch/architecture-recovery/reports/53-check.mjs` | 16 |
| #54 | `6f021db6`·09-17 | P0 %cI 确定性修复：%cI→%ct（或归一化 +00:00→Z）＋gitcli 锁表行 enforce 输出格式断言（契约从未 enforce 的真缺口）＋golden-c… | D-059① | 账本记已闭环 | `engine/test/contracts/54-check.mjs` `engine/src/intake/intake.ts` `.github/workflows/golden-ci.yml` `engine/upstream-lock.yaml` ｜ 历史现场 `.scratch/architecture-recovery/reports/54-check.mjs` | 11 |
| #55 | `6f021db6`·09-17 | P1 批票：SQL 黑名单剥字面量后匹配＋误伤回归测试（D-059④，不上 AST）＋MCP db 寻址收敛进 mcp.json 配置/服务端解析（D-059⑥——堵 D-053… | D-059④⑤⑥⑦ | 账本记已闭环 | `engine/test/contracts/55-check.mjs` `engine/src/report/citation.ts` `engine/src/fact/schema.ts` `engine/scripts/gen-manifests.mjs` `engine/src/mcp-server.ts` ｜ 历史现场 `.scratch/architecture-recovery/reports/55-check.mjs` | 34 |
| #56 | `813d1d7c`·09-17 | checker 语义边界缺陷（#52a 暴露面·评测/修复分票纪律）：presence 判定机检无语义层——对抗 FP=13 条（否定/引语包裹字面命中误判 supports：N… | D-061（52a findings） | 账本记已闭环 | `engine/test/contracts/56-check.mjs` `engine/test/contracts/56-checker-heldout-eval.mjs` `engine/test/contracts/52a-check.mjs` `engine/src/report/citation.ts` 旧票 #52a ｜ 历史现场 `.scratch/architecture-recovery/reports/56-check.mjs` 等 4 件 | 15 |
| #57 | `07f52265`·09-17 | 轮16审计 F 项修复单票（修 6）：F1 audit.ts 层序串修回 ADR-0017③ 原文（Macro-C→Micro-A→Micro-B→Macro-A，勿把已上架 M… | D-064① | 账本记已闭环 | `docs/adr/0017-preview-release-model.md` `engine/test/contracts/53-check.mjs` `engine/test/contracts/55-check.mjs` `33-check〔守卫已退役〕` `engine/test/contracts/51-check.mjs` | 1 |
| #58 | `69389352`·09-18 | manifest 契约守卫链扩（D-066）：①34-check/41b-check 增三断言——两份 plugin.json skills 值须 ^\./ 路径形（裸名 fai… | D-066 / D-037⑤ / D-041 | 账本记已闭环 | `engine/test/contracts/34-check.mjs` `engine/test/contracts/41b-check.mjs` `engine/test/contracts/55-check.mjs` `engine/test/contracts/44-check.mjs` 旧票 #59 ｜ 历史现场 `.scratch/architecture-recovery/reports/58-claude-code-plugin-manifest.schema.json` | 5 |
| #59 | `69389352`·09-18 | kernel 自包含分发修复（D-067）：①.mcp.json 改 command:"node"＋args:["${CLAUDE_PLUGIN_ROOT}/dist/cli.j… | D-067 / D-038 / D-037⑥ | 账本记已闭环 | `engine/test/contracts/34-check.mjs` `engine/test/contracts/41b-check.mjs` `engine/src/fact/store.ts` `.github/workflows/engine-ci.yml` `engine/upstream-lock.yaml` | 11 |
| #60 | `69389352`·09-18 | 骨架契约升版机检（D-068/A-064 C9 机械化）：14-skeleton-baseline.json 存 {baseline_version, chapters:[{id… | D-068 / A-064 C9 / D-037② | 账本记已闭环 | `14-check〔守卫已退役〕` `engine/test/fixtures/contracts/14-skeleton-fields.json` `engine/src/report/generate.ts` | 0 |
| #61 | `69389352`·09-18 | cue 表语义分层收尾＋r18 顺带清（D-069＋D-070①）：判定 commit——CJK_NON_ASSERT_CUES 种子表 10-20 条（pre：例如/比如/譬如… | D-069 / D-070① / D-065 / D-058 | 账本记已闭环 | `engine/test/contracts/56-check.mjs` `engine/src/report/citation.ts` | 11 |
| #62 | `69389352`·09-18 | 运行时 doctor 探测票（runtime-doctor-trigger 兑现——first-external-install 于 T6 occurred）：selftest … | D-059③ | 账本记已闭环 | `engine/test/fixtures/contracts/33-gate-registry.json` | 12 |
| #63 | `eb1a293e`·09-18 | 陈旧守卫换代机制（D-071 known-failures 清单制）：①stale-assertions.json（version/cap=10/entries：id=xfail… | D-071 | 账本记已闭环 | `33-check〔守卫已退役〕` `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/reports/63-assertion-inventory.json` | 0 |
| #64 | `eb1a293e`·09-18 | duckdb 自愈补拉（D-072）：①store.ts loadDuckdb() DUCKDB-UNAVAILABLE 命中点前置自愈——平台探测（process.platfo… | D-072 / D-067② / D-037⑥ | 账本记已闭环 | `engine/test/contracts/64-check.mjs` `engine/src/fact/store.ts` `engine/package.json` 旧票 #62 `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/reports/64-check.mjs` | 46 |
| #65 | `b55a4d83`·09-18 | 册外陈旧断言批量分拣票（D-073/D-074）：①册外 13 件逐条归因三向分拣（判据=守卫头 // acceptance-probe: sealed <date> <deci… | D-073 / D-074 | 账本记已闭环 | `33-check〔守卫已退役〕` `40-check〔守卫已退役〕` `engine/test/audit-zero-write.test.mjs` 旧票 #65 `engine/test/fixtures/contracts/33-gate-registry.json` | 3 |
| #66 | `b55a4d83`·09-18 | duckdb 自愈分层修订（D-075 承接 D-072 revised）：①面探测——MCP≡MACRO_AUDIT_MCP_STDIO==='1'／CLI≡非 MCP 且 s… | D-075 / D-072(revised) / D-067⑧ / D… | 账本未记闭环 | `docs/spec.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 4 |
| #67 | `b55a4d83`·09-18 | SKIP-STREAK 环境分层（D-077）：①validate-plugin.mjs 以 MACRO_AUDIT_CI=1（engine-ci.yml 注入）判 cli-ab… | D-077 / D-066③⑥(注记) / D-041 / D-037⑤ | 账本记已闭环 | `docs/adr/0018-versioning-and-chronicle-discipline.md` `engine/test/contracts/34-check.mjs` `engine/scripts/validate-plugin.mjs` `.github/workflows/engine-ci.yml` `engine/test/fixtures/contracts/33-gate-registry.json` | 0 |
| #68 | `b55a4d83`·09-18 | upstream→dimension 映射表设计票（D-078）：①新建 docs/upstream-dimension-map.md（版本化走 PR 评审同 #50 rubri… | D-078 / D-020 / ADR-0004 / D-048 / … | 账本未记闭环 | `docs/adr/0020-hosted-platform-api-adapter.md` `docs/adr/0004-strategic-quadrant-five-dims.md` `docs/adr/0014-upstream-integration-dual-track.md` `engine/skills/macro-audit/references/quadrant-rubric.md` `engine/src/audit/macro-b.ts` | 1 |
| #69 | `21b85f2e`·09-19 | r22 审计打回返工票（P1）：R1 doctor --fix 复载死路——复载走 openWriter→loadDuckdb→import() 同 specifier 命中 E… | r22 审计 §四A / A-072 / D-075 | 账本记已闭环 | `engine/package.json` | 0 |
| #70 | `82cbb604`·09-19 | vacuous 恒真断言族制度面（D-079）：①恒真不可证伪=独立候选族，分拣输入面=FAIL∪恒真候选（sibling-dependency grep 引用物缺席普查复用）；… | D-079 / D-073注 / D-071注 / D-018 | 账本记已闭环 | 旧票 #65 ｜ 历史现场 `.scratch/architecture-recovery/reports/70-check.mjs` | 0 |
| #71 | `82cbb604`·09-19 | codelore 接线票·批1（D-080③ sibling 首票）：①COLLECTOR_DESCRIPTORS 注册 codelore 消费面＋Macro-B 裁决面按映射表… | D-080 / D-078 / D-082③ / D-083⑤ / D… | 账本未记闭环 | `engine/test/contracts/71-check.mjs` `docs/adr/0014-upstream-integration-dual-track.md` `engine/test/contracts/44-check.mjs` `engine/src/audit/macro-b.ts` `docs/upstream-dimension-map.md` ｜ 历史现场 `.scratch/architecture-recovery/reports/71-check.mjs` | 7 |
| #72 | `82cbb604`·09-19 | github-rest 接线票·批2（D-080③ sibling 次票）：①opt-in 注册（需 token＋网络——凭据缺席环境显式报告 skipped 不算 PASS防假… | D-080 / D-081 / D-082 / D-048 / ADR… | 账本未记闭环 | `engine/test/contracts/72-check.mjs` `docs/adr/0020-hosted-platform-api-adapter.md` `engine/src/audit/macro-b.ts` `engine/src/audit/micro-a.ts` `engine/src/upstream/github-rest.ts` ｜ 历史现场 `.scratch/architecture-recovery/reports/72-check.mjs` | 9 |
| #73 | `a826c0c4`·09-20 | GitHub 门面整改总票（D-085 三面全含）：①面二社区文件七件先行（root LICENSE=engine/LICENSE Apache-2.0 复制〔ADR-0021/… | D-085~D-091 / ADR-0021 / D-051 / D-… | 账本未记闭环 | `engine/test/contracts/73-check.mjs` `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` `docs/assets/social-card.png` `engine/test/fixtures/contracts/33-gate-registry.json` ｜ 历史现场 `.scratch/architecture-recovery/reports/73-check.mjs` | 2 |
| #74 | `cbf7fa13`·09-22 | 6F 正名＋六-F 宣言门面执行（D-092/D-093）：①hero.svg 重绘〔名=6F＋三 chip→六 F 族〕；②README.md——H1/alt→6F＋首屏 Hi… | D-092 / D-093 / D-088 / D-031 / D-0… | 账本未记闭环 | `engine/test/contracts/73-check.mjs` `engine/README.md` `engine/src/audit/macro-c.ts` `docs/listing/description.md` | 0 |
| #75 | `cbf7fa13`·09-22 | 守卫纪律建制包三批（D-094/095/096）：批1〔已闭环 2026-09-27/A-097：60 件全跑红集={01}⊆known-red-manifest；75a 普查 … | D-094 / D-095 / D-096 / D-079 / D-0… | 账本记已闭环 | `engine/test/contracts/73-check.mjs` `70-check〔守卫已退役〕` 旧票 #33 旧票 #70 `engine/test/fixtures/contracts/33-gate-registry.json` | 16 |
| #76 | `cbf7fa13`·09-22 | engine-ci 首跑红修（R24 handoff §新增问题立案）：A 类 Node-20 三平台——audit.test.mjs J1/J2＋demo.test.mjs M… | R24 handoff / D-072③ / registry eng… | 账本记已闭环 | `engine/src/cli.ts` `.github/workflows/engine-ci.yml` `engine/test/fixtures/contracts/33-gate-registry.json` | 6 |
| #77 | `aafb4637`·09-22 | 门面收口包·A 窗（本轮实施）：①README.md 新「## Acknowledgments」节置尾（Honesty notes 之前）——生成式锚段非手写：生成器持 per-… | D-098 / D-099③ / D-101① / D-089⑤ / … | 账本记已闭环 | `engine/test/contracts/77-check.mjs` `engine/upstream-lock.yaml` `engine/src/upstream/github-rest.ts` 旧票 #78 ｜ 历史现场 `.scratch/architecture-recovery/reports/77-check.mjs` | 5 |
| #78 | `aafb4637`·09-22 | 引擎 quarantine 建制·B 并行独立窗（含 macro-b-regression git 腿红修=验收件）：①intake 违约两级化——协议级违约（列结构/分隔符/记… | D-100 / D-101② / D-059①收窄链 | 账本记已闭环 | `engine/test/contracts/78-check.mjs` `.github/workflows/macro-b-regression.yml` `docs/known-gaps.md` `engine/CHANGELOG.md` ｜ 历史现场 `.scratch/architecture-recovery/reports/78-check.mjs` | 28 |
| #79 | `aafb4637`·09-22 | NOTICE 承接合规核查（D-098⑦ 衍生立项）：8 个 active 上游逐个核查 NOTICE 文件存在性（Apache-2.0 §4(d)：上游带 NOTICE 则分发… | D-098⑦ / ADR-0021 | 账本未记闭环 | `docs/adr/0021-outbound-license-apache-2-no-copyleft-vendoring.md` 旧票 #75 | 0 |
| #80 | `80a830a4`·09-23 | Micro-B preview 文件级审计卡单票闭环（D-121~D-127，ADR-0023）：内部三步 stacked-diff 各独立绿——①发射改造+fixture go… | D-121~D-127 / ADR-0023 / D-028 / D-… | 账本未记闭环 | `engine/test/contracts/80-check.mjs` `docs/adr/0023-micro-b-file-card-architecture.md` `engine/src/audit/macro-b.ts` 旧票 #51 ｜ 历史现场 `.scratch/architecture-recovery/reports/80-check.mjs` 等 2 件 | 40 |
| #81 | `55d6ae1b`·09-24 | quarantine 方言归一缺陷修（D-128，R31-Q1 锐评实证受理）：观测仪器方言（git %cI 版本差 +00:00↔Z 族）归防腐边界层确定性吸收——分类器只见规… | D-128 / D-100② / D-103 / D-106 / D-… | 账本未记闭环 | `engine/test/contracts/81-check.mjs` `docs/known-gaps.md` 旧票 #80 ｜ 历史现场 `.scratch/architecture-recovery/reports/81-check.mjs` | 12 |
| #82 | `55d6ae1b`·09-24 | R31 仓务增量批（D-129③/D-130②③/D-131③/D-132④⑤/D-133②）——批内各独立小步：①gen-adr-index 生成式索引（README ADR … | D-129 / D-130 / D-131 / D-132 / D-1… | 账本未记闭环 | `engine/scripts/gen-adr-index.mjs` `engine/test/fixtures/contracts/33-gate-registry.json` 旧票 #80 ｜ 历史现场 `.scratch/architecture-recovery/reports/82-check.mjs` | 6 |
| #83 | `e07650ab`·09-25 | R32 审计建议修批单票（D-135 票面化；批内排序先修后扫）：①必修收窄——file-card lazy 补采写循环 constraint 吞错收窄=仅精确指认 fact_i… | D-134 / D-135 / D-136 | 账本记已闭环 | `engine/test/contracts/83-check.mjs` `engine/test/contracts/80-check.mjs` 旧票 #80 ｜ 历史现场 `.scratch/architecture-recovery/reports/83-check.mjs` | 15 |
| #84 | `f96936fa`·10-03 | Macro-C 产线化票（D-204，ADR-0015 硬准入）——.scratch/architecture-recovery/reports/38-macro-c-previ… | D-204 D-058 D-062 | 账本记已闭环 | `ADR-0015（保持删除）` `engine/test/contracts/85-check.mjs` `engine/src/audit/audit.ts` `engine/src/audit/macro-c.ts` ｜ 历史现场 `.scratch/architecture-recovery/reports/84-check.mjs` | 21 |
| #85 | `f96936fa`·10-03 | Micro-A 收窄＋产线化双票（D-204 同票绑定，D-054②纪律）：①收窄批——报告头/SKILL.md/披露三件套降「calibrated demo · not in … | D-204 D-054 D-062 | 账本未记闭环 | `engine/test/contracts/85-check.mjs` `ADR-0015（保持删除）` `engine/test/contracts/48-micro-a-preview.mjs` `engine/src/audit/micro-a.ts` 旧票 #85 ｜ 历史现场 `.scratch/architecture-recovery/reports/85-check.mjs` | 49 |
| #86 | `f96936fa`·10-03 | B4 对账/认领票包（D-207②③+D-209）：①#9 对账票——A-009 全数字表（SLA 默认 5s/warn 5s/error 15s/3 周期去抖 6 周期迟滞/p… | D-207 D-209 | 账本记已闭环 | `engine/test/contracts/86-check.mjs` `spec-phase-tasks〔历史现场〕` `docs/spec.md` ｜ 历史现场 `.scratch/architecture-recovery/reports/86-check.mjs` | 0 |
| #87 | `f96936fa`·10-03 | structure 摘帽接入票（D-205 同票绑定，D-054②）：①分层词条已落 CONTEXT「语义域」词条（structure/shape vs S3/budget-at… | D-205 D-054 D-206 | 账本记已闭环 | `docs/adr/0013-three-layer-acceptance-gates.md` `engine/test/contracts/86-check.mjs` 旧票 #51 `CONTEXT.md〔退役→GLOSSARY.md〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 10 |
| #88 | `6a7a714d`·10-07 | reef#1 84-check fixtureRun fresh-clone 自足修票（R62-D-211①；第五轮锐评暗礁实证）——硬钉孤儿 commit 201935fc（零… | D-211 D-163 D-159 D-146 | 账本未记闭环 | `84-check〔守卫已退役〕` `engine/test/contracts/78-check.mjs` `.github/workflows/engine-ci.yml` | 4 |
| #89 | `6a7a714d`·10-07 | A-3 账本节标题唯一性守卫立法票（R62-D-212；R58 审计呈报→R61 移交 grill 收口）——41a-check 承载双层断言：## 全局唯一＋### 同父 ##… | D-212 D-159 | 账本未记闭环 | `docs/adr/0013-three-layer-acceptance-gates.md` `41a-check〔守卫已退役〕` `84-check〔守卫已退役〕` | 0 |
| #90 | `6a7a714d`·10-07 | dist 形态重评票（dist-ratchet-headroom-low 触发强制开立——D-211②/D-076④ 留痕兑现）：#85② 产线化后 dist/cli.js=37… | D-211 D-076 D-181 D-217 | 账本未记闭环 | 旧票 #85 旧票 #92 | 9 |
| #91 | `6a7a714d`·10-07 | R66 探测面立法落地批（D-213/D-214/D-215——同责同面守卫机制票）：①zero-backslash 适用域机检——危险正则形态扫描断言（[^]/否定类内裸 ] … | D-213 D-214 D-215 D-183 D-177 D-163 D-074 D-146 D-159 D-076 D-165 | 账本记已闭环 | `docs/spec.md` `engine/test/fixtures/contracts/33-gate-registry.json` | 5 |
| #92 | `6a7a714d`·10-07 | dist 体积治理批（D-217＝#90 裁定落地票）：build-bundle.mjs 增 minifyWhitespace:true＋minifySyntax:true（禁 … | D-217 D-129 D-177 | 账本记已闭环 | `engine/scripts/build-bundle.mjs` `engine/scripts/check-dist.mjs` 旧票 #90 | 6 |
| #93 | `6a7a714d`·10-07 | emit 计量修复批（D-218=P3-3 处置）：update-70-inventory.mjs＋70-check.mjs §1 同源双拷贝同修（emit 谓词排除两类定义行形… | D-218 D-177 D-180 D-146 | 账本记已闭环 | `70-check〔守卫已退役〕` | 0 |
| #94 | `6a7a714d`·10-07 | EOF/hygiene 兜底批（D-216/D-219/D-220①）：①WORKFLOW/AGENTS 4.2 but-only 例外行（沿 4.2.1 linked-work… | D-216 D-219 D-220 | 账本记已闭环 | `engine/scripts/gen-manifests.mjs` `engine/scripts/gen-adr-index.mjs` `engine/scripts/gen-micro-b-emission-golden.mjs` `engine/scripts/validate-plugin.mjs` 旧票 #93 | 2 |

## 3. `A-NNN` → 架构恢复账本行（附册）

`A-NNN` 是 architecture-recovery 账本的问题条目编号，`D-NNN` 的 `来源决策` 列与其互相咬合；随附此册以免 `A-NNN` 引用成为死字。

| A | 引入 | 来源 D | 状态 | 现行载体 | 引用数 |
|---|---|---|---|---|---|
| A-001 | `2e2520c4`·09-11 | D-004 | implemented | 账本行本体 | 23 |
| A-002 | `2e2520c4`·09-11 | D-004 | implemented | 账本行本体 | 16 |
| A-003 | `2e2520c4`·09-11 | D-004 | implemented | 账本行本体 | 8 |
| A-004 | `2e2520c4`·09-11 | D-004 | implemented | 账本行本体 | 11 |
| A-005 | `2e2520c4`·09-11 | D-004 | implemented | 账本行本体 | 58 |
| A-006 | `2e2520c4`·09-11 | D-004 | deferred | 账本行本体 | 18 |
| A-007 | `2e2520c4`·09-11 | D-005 | implemented | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 31 |
| A-008 | `2e2520c4`·09-11 | D-005 | implemented | `engine/test/fixtures/contracts/33-gate-registry.json` | 47 |
| A-009 | `2e2520c4`·09-11 | D-005 | implemented | 账本行本体 | 8 |
| A-010 | `2e2520c4`·09-11 | D-005 | implemented | 账本行本体 | 32 |
| A-011 | `2e2520c4`·09-11 | D-005 | implemented | 账本行本体 | 6 |
| A-012 | `2e2520c4`·09-11 | D-005 | implemented | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` | 7 |
| A-013 | `2e2520c4`·09-11 | D-005 | implemented | 账本行本体 | 6 |
| A-014 | `2e2520c4`·09-11 | D-006 | implemented | `docs/adr/0006-shared-skeleton-scale-slice.md` | 42 |
| A-015 | `2e2520c4`·09-11 | D-006 | implemented | `engine/src/audit/micro-a.ts` | 8 |
| A-016 | `2e2520c4`·09-11 | D-006 | implemented | `docs/adr/0006-shared-skeleton-scale-slice.md` `docs/adr/0007-ten-demo-paths.md` | 12 |
| A-017 | `2e2520c4`·09-11 | D-007 | implemented | `docs/adr/0007-ten-demo-paths.md` | 6 |
| A-018 | `2e2520c4`·09-11 | D-007 done — W2 5 条 f… | implemented | `docs/adr/0005-hub-of-facts-with-federated-adjudication.md` `docs/adr/0006-shared-skeleton-scale-slice.md` | 21 |
| A-019 | `5c7d1118`·09-13 | D-016 | done — 票 #19 闭环 | `.github/workflows/engine-ci.yml` | 23 |
| A-020 | `5c7d1118`·09-13 | D-016 | done — 票 #19 闭环… | `.github/workflows/engine-ci.yml` | 14 |
| A-021 | `5c7d1118`·09-13 | D-016 | done — 票 #20 闭环… | `engine/test/fixtures/contracts/33-gate-registry.json` | 26 |
| A-022 | `5c7d1118`·09-13 | D-016/D-018 | done — 票 #21 闭环… | `engine/src/collect/collectors.ts` `engine/test/fixtures/contracts/21-collectors.json` | 18 |
| A-023 | `5c7d1118`·09-13 | D-018 | done — 票 #22 闭环… | 账本行本体 | 17 |
| A-024 | `5c7d1118`·09-13 | D-018 | done — 票 #22 闭环… | `engine/src/fact/schema.ts` `engine/CHANGELOG.md` | 10 |
| A-025 | `5c7d1118`·09-13 | D-017/D-018 | done — 票 #22 闭环… | 账本行本体 | 13 |
| A-026 | `5c7d1118`·09-13 | D-016/D-017 | done — 票 #23 闭环 | `engine/test/fixtures/contracts/14-skeleton-fields.json` | 14 |
| A-027 | `5c7d1118`·09-13 | D-017/D-011 | done — 票 #23 闭环 | 账本行本体 | 29 |
| A-028 | `5c7d1118`·09-13 | D-016/D-018 | done — 票 #24 闭环 | `24-check〔守卫已退役〕` | 3 |
| A-029 | `5c7d1118`·09-13 | D-018 | done — 票 #22 闭环… | 账本行本体 | 14 |
| A-030 | `5c7d1118`·09-13 | D-016 | done — 票 #25 闭环 | `25-check〔守卫已退役〕` | 10 |
| A-031 | `9a42d224`·09-15 | D-025 | done → implemen… | `docs/spec.md` | 4 |
| A-032 | `9a42d224`·09-15 | D-025 | done → implemen… | `docs/spec.md` | 1 |
| A-033 | `9a42d224`·09-15 | D-025 | done → implemen… | `docs/spec.md` | 10 |
| A-034 | `9a42d224`·09-15 | D-025 / D-017 | done → implemen… | 账本行本体 | 1 |
| A-035 | `9a42d224`·09-15 | D-023 / D-024 | done → implemen… | `docs/spec.md` | 2 |
| A-036 | `9a42d224`·09-15 | D-023 / D-024 / D-020… | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `docs/spec.md` | 5 |
| A-037 | `e856b56b`·09-15 | D-029 | done → implemen… | 旧票 #32 `docs/spec.md` | 4 |
| A-038 | `e856b56b`·09-15 | D-026 / D-034 / D-024 | done → implemen… | 旧票 #33 `docs/spec.md` | 2 |
| A-039 | `e856b56b`·09-15 | D-036 / D-012 余款 | done → implemen… | `engine/plugin.json` `engine/scripts/gen-manifests.mjs` | 2 |
| A-040 | `e856b56b`·09-15 | D-035 / D-034 | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `engine/src/audit/macro-c.ts` | 3 |
| A-041 | `e856b56b`·09-15 | D-035 | implemented | `36-check〔守卫已退役〕` 旧票 #36 | 4 |
| A-042 | `e856b56b`·09-15 | D-033 | done → implemen… | `37-check〔守卫已退役〕` 旧票 #37 | 1 |
| A-043 | `e856b56b`·09-15 | D-034 / D-032 / D-033 | done → implemen… | `docs/adr/0017-preview-release-model.md` `38-check〔守卫已退役〕` | 6 |
| A-044 | `e856b56b`·09-15 | D-033 / D-034 / D-024 | done → implemen… | `39-check〔守卫已退役〕` `engine/scripts/39-macro-b-one-shot.mjs` | 10 |
| A-045 | `e856b56b`·09-15 | D-033 / D-013 | done → implemen… | `33-check〔守卫已退役〕` `40-check〔守卫已退役〕` | 5 |
| A-046 | `e856b56b`·09-15 | D-030 / D-031 / D-032… | current | 旧票 #41 旧票 #34 | 1 |
| A-047 | `e856b56b`·09-15 | D-023 / D-034 / D-035 | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `33-check〔守卫已退役〕` | 1 |
| A-048 | `e856b56b`·09-15 | D-030 | done → implemen… | `engine/test/contracts/43-check.mjs` `engine/scripts/gen-demo-golden.mjs` | 13 |
| A-049 | `9c7cf128`·09-16 | D-037 / D-039 | done → implemen… | `ADR-0010（保持删除）` `engine/test/contracts/44-check.mjs` | 9 |
| A-050 | `9c7cf128`·09-16 | D-038 / D-013 / D-034 | --list]；fixture… | `docs/adr/0014-upstream-integration-dual-track.md` `engine/test/contracts/45-check.mjs` | 11 |
| A-051 | `9c7cf128`·09-16 | D-030 / D-031 / D-032… | done → implemen… | `docs/adr/0016-distribution-channel-agent-plugins-only.md` `docs/adr/0001-five-scale-scope.md` | 0 |
| A-052 | `9c7cf128`·09-16 | D-031 / D-037 / D-026… | current | 旧票 #41b `docs/spec.md` | 0 |
| A-053 | `9c7cf128`·09-16 | D-041 | done → implemen… | `33-check〔守卫已退役〕` 旧票 #33 | 3 |
| A-054 | `fe6bbd9e`·09-16 | D-046 / D-013 / D-033 | done → implemen… | `engine/test/contracts/46-check.mjs` `.github/workflows/macro-b-regression.yml` | 0 |
| A-055 | `80e6af32`·09-16 | D-048 / ADR-0020 | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `docs/adr/0020-hosted-platform-api-adapter.md` | 5 |
| A-056 | `3e588e02`·09-17 | D-049 / D-047 / D-033… | done → implemen… | `40-check〔守卫已退役〕` `engine/test/contracts/44-check.mjs` | 9 |
| A-057 | `9460cf28`·09-17 | D-053 / D-057④ / ADR-… | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `docs/adr/0013-three-layer-acceptance-gates.md` | 7 |
| A-058 | `1097e88e`·09-17 | D-054 / D-035④勘误 / AD… | done → implemen… | `ADR-0015（保持删除）` `docs/adr/0014-upstream-integration-dual-track.md` | 5 |
| A-059 | `296f7bfa`·09-17 | D-050 / D-046③ | done → implemen… | `49-check〔守卫已退役〕` `.github/workflows/macro-b-regression.yml` | 0 |
| A-060 | `b45bd831`·09-17 | D-051 / D-052 / D-042 | done → implemen… | `engine/test/contracts/41b-check.mjs` `docs/listing/description.md` | 3 |
| A-061 | `2803710e`·09-17 | D-043 / D-045 / D-055… | done → implemen… | `33-check〔守卫已退役〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 0 |
| A-062 | `8f9c8336`·09-17 | D-025 | done → implemen… | `28-check〔守卫已退役〕` | 0 |
| A-063 | `1e325bec`·09-17 | D-026 / D-042 / D-051… | done → implemen… | `.claude-plugin/marketplace.json` `.github/workflows/engine-ci.yml` | 0 |
| A-064 | `b4a4c347`·09-17 | 审计报告 .scratch/macro-a… | done → implemen… | `engine/src/mcp-server.ts` `engine/src/report/generate.ts` | 1 |
| A-065 | `2e7881d9`·09-17 | D-064① / D-064⑥ / D-0… | done → implemen… | `docs/adr/0017-preview-release-model.md` `engine/test/contracts/53-check.mjs` | 0 |
| A-066 | `2e7881d9`·09-17 | D-065 / D-064⑤ / D-05… | done → implemen… | `engine/test/contracts/56-check.mjs` `engine/test/contracts/52a-check.mjs` | 0 |
| A-068 | `baeace80`·09-18 | D-051 / D-052 / D-055 | done → implemen… | `engine/test/contracts/34-check.mjs` `engine/test/contracts/41b-check.mjs` | 4 |
| A-067 | `244e4824`·09-17 | D-064 / D-065 / A-064… | done | `engine/test/contracts/56-check.mjs` `38-check〔守卫已退役〕` | 0 |
| A-069 | `7bbb230f`·09-18 | D-067 / D-038 / D-037⑥ | done → implemen… | `engine/test/contracts/34-check.mjs` `engine/test/contracts/41b-check.mjs` | 1 |
| A-070 | `54e96a99`·09-18 | D-066 / D-037⑤ / D-041 | done → implemen… | `engine/test/contracts/34-check.mjs` `engine/test/contracts/41b-check.mjs` | 0 |
| A-071 | `82c08ce0`·09-18 | D-071 / D-068⑥ / D-04… | done → implemen… | `33-check〔守卫已退役〕` 旧票 #63 | 0 |
| A-072 | `953f8403`·09-18 | D-072 / D-067② / D-03… | done → implemen… | `engine/test/contracts/64-check.mjs` `engine/src/fact/store.ts` | 2 |
| A-073 | `d5efdf0d`·09-18 | D-069 / D-070① / D-06… | done → implemen… | `engine/test/contracts/56-check.mjs` `engine/test/contracts/52a-check.mjs` | 0 |
| A-074 | `4eea666f`·09-18 | D-068 / A-064 C9 / D-… | done → implemen… | `14-check〔守卫已退役〕` `engine/src/report/generate.ts` | 0 |
| A-075 | `4dfc0ae0`·09-18 | D-059③ / D-072⑧ | done → implemen… | `engine/src/doctor.ts` `engine/src/cli.ts` | 1 |
| A-076 | `1d31e9ce`·09-19 | D-073 / D-074 / D-071… | done → implemen… | `33-check〔守卫已退役〕` `engine/test/audit-zero-write.test.mjs` | 0 |
| A-077 | `1d31e9ce`·09-19 | null——MCP/CI 缺省零 spaw… | done → implemen… | `engine/test/contracts/64-check.mjs` `engine/src/fact/store.ts` | 0 |
| A-078 | `1d31e9ce`·09-19 | D-077 / D-066③⑥注 / D-… | done → implemen… | `engine/test/contracts/34-check.mjs` `engine/scripts/validate-plugin.mjs` | 0 |
| A-079 | `1d31e9ce`·09-19 | D-078 / D-020 / ADR-0… | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `docs/adr/0004-strategic-quadrant-five-dims.md` | 0 |
| A-080 | `1d31e9ce`·09-19 | R21 审计 §六 / D-068 | done → implemen… | `engine/test/contracts/34-check.mjs` | 0 |
| A-081 | `21b85f2e`·09-19 | r22 审计 R1/R2/R3/P1/P3… | done → implemen… | `engine/test/doctor-fix.test.mjs` `engine/src/fact/store.ts` | 0 |
| A-082 | `c3767c32`·09-19 | D-079 / D-073注 / D-07… | done → implemen… | `70-check〔守卫已退役〕` `39-check〔守卫已退役〕` | 0 |
| A-083 | `c3767c32`·09-19 | D-080 / D-078 / D-082… | done → implemen… | `docs/adr/0014-upstream-integration-dual-track.md` `engine/test/contracts/71-check.mjs` | 0 |
| A-084 | `c3767c32`·09-19 | D-080 / D-081 / D-082… | done → implemen… | `docs/adr/0020-hosted-platform-api-adapter.md` `engine/test/contracts/72-check.mjs` | 0 |
| A-085 | `c3767c32`·09-19 | D-084④ | done → implemen… | `33-check〔守卫已退役〕` `engine/test/contracts/71-check.mjs` | 0 |
| A-086 | `c3767c32`·09-19 | R22 审计 §C / R21-R22 e… | done → implemen… | `70-check〔守卫已退役〕` `33-check〔守卫已退役〕` | 0 |
| A-087 | `c3767c32`·09-19 | D-041 / D-043 / D-045… | done → implemen… | 旧票 #65 旧票 #52 | 0 |
| A-088 | `aafb4637`·09-22 | dylib | done → implemen… | `engine/test/contracts/73-check.mjs` `engine/test/contracts/45-check.mjs` | 0 |
| A-089 | `e5833ded`·09-22 | D-098①②③④⑤⑥⑦ / D-089⑤… | implemented 202… | `engine/test/contracts/77-check.mjs` `33-check〔守卫已退役〕` | 0 |
| A-090 | `c5feac1a`·09-23 | D-103~D-120 / ADR-002… | implemented 202… | `docs/adr/0022-quarantine-engine.md` `engine/test/contracts/78-check.mjs` | 0 |
| A-091 | `2c7fb0c1`·09-23 | D-124 / D-125 / D-038… | implemented 202… | `docs/adr/0023-micro-b-file-card-architecture.md` `engine/test/contracts/80-check.mjs` | 0 |
| A-092 | `5096a1f8`·09-25 | implemented 2026-09-25 | implemented 202… | `engine/test/contracts/83-check.mjs` `82-check〔守卫已退役〕` | 0 |
| A-093 | `07b505fb`·09-25 | D-143②④ / D-094③ / D-… | implemented 202… | `engine/test/contracts/83-check.mjs` `engine/src/fact/file-card.ts` | 0 |
| A-094 | `7baec939`·09-26 | ①TS 4.4 别名收窄机制边界实证（TS… | implemented 202… | `engine/test/contracts/83-check.mjs` `engine/src/fact/file-card.ts` | 0 |
| A-095 | `81a3ef87`·09-26 | D-137 / D-126 / D-127… | implemented 202… | `engine/test/contracts/41b-check.mjs` `engine/test/contracts/44-check.mjs` | 1 |
| A-096 | `3fc1b8aa`·09-26 | D-137② / D-127③⑤ / D-… | implemented 202… | `engine/test/contracts/44-check.mjs` `engine/test/contracts/80-check.mjs` | 0 |
| A-097 | `b1ef2514`·09-27 | D-094 / D-144② / D-14… | implemented 202… | `75a-check〔守卫已退役〕` `engine/test/fixtures/contracts/33-gate-registry.json` | 3 |
| A-098 | `e9380c25`·09-27 | D-094(b) / D-149④ / 审… | implemented 202… | `75a-check〔守卫已退役〕` | 0 |
| A-099 | `67c79dac`·09-27 | D-094 / D-150⑤ / D-15… | implemented 202… | `25-check〔守卫已退役〕` `26-check〔守卫已退役〕` | 0 |

## 4. 散文假阳性（不入索引）

下列 `D-NNN` 形记号经逐处核读**不是决策号**，故不建索引行；仓内引用它们处不得按决策解析：

| 记号 | 出现 | 实际语义 | 现场 |
|---|---|---|---|
| `D-000` | 21 处 / 10 文件 | 合成夹具与 one-shot 脚本写出的 ADR 头占位串 `- Ledger: D-000`（被审计对象用的假 ledger 名，非本仓决策） | `engine/src/audit/macro-b.ts:44`、`engine/fixtures/definitions/*.json`、`engine/test/contracts/23-first-report.mjs:95` |
| `D-393` | 1 处 | `78-check` 断言标签的自造短名（=「39 脚本第 3 项」），非 ledger 行 | `engine/test/contracts/78-check.mjs:80` |
| `D-394` | 1 处 | 同上（=「39 脚本第 4 项」） | `engine/test/contracts/78-check.mjs:81` |
| `D-403` | 1 处 | 同上（=「40 脚本第 3 项」） | `engine/test/contracts/78-check.mjs:82` |
| `D-391` | 0 处（现行仓） | 已退役 `.scratch` 审计报告里的同族标签；仅在 `2e6061be` 的报告中出现 | `.scratch/macro-audit/reports/2026-09-23-r29-audit-report.md:34`（随 `.scratch` 退役，见 §5） |

同族标签未穷尽登记：`D-392` / `D-401` / `D-402` 出现在 `2e6061be` 那条退役散文里（同一行 `78-check D-391/392/401/402 钉对照`），因在 `cd9ca956` 的已提交文本中已无出现，不占上表行数——若日后被重新引用，按同样口径判作散文标签而非决策号。

另：`D-053①` 一类带圈号的后缀是同一决策的子项引用，索引按主干号（`D-053`）解析，圈号不进表。

## 5. `.scratch` 历史现场

`.scratch/` 于 `e356581e` 全量移出版本控制并加入 `.gitignore`，此后不在工作树。旧票的 handoff / issue / prompt / report 逐票档案仍可按**旧路径 + 引入 commit** 取回：

```
git show 2e6061be:.scratch/architecture-recovery/handoffs/<NN>-<slug>.md
git show 2e6061be:.scratch/macro-audit/decision-ledger.md
```

本索引第 2 节的票号与 `.scratch/architecture-recovery/{handoffs,issues,prompts}/<NN>-*` 的文件名前缀逐一对应（`#01`–`#51`）；`.scratch/architecture-recovery/reports/<NN>-*` 覆盖到 `#86`（区间内有缺号）。第 2 节「现行载体」列尾的**历史现场**即按该前缀匹配给出的样本路径。`#87` 起的逐票档案改按日期命名，落 `.scratch/macro-audit/handoffs/` 与 `.scratch/macro-audit/reports/`，只能按日期与轮次回查。仓内代码注释里残留的 `.scratch/...` 路径按本节的**历史现场**语义读，不作为现行锚——该改写义务由 GitHub issue #29 承接。

## 6. 冻结事实的可移植性注记

`engine/test/fixtures/contracts/38-macro-c-facts.jsonl`（旧票 #38 的 Macro-C 冻结事实）内含 **30 处本机绝对路径**（全部形如 `D:/Aworker/anysearch-cli`），属原始采集现场，**不可移植**、不作为基准锚。该文件字节零动；基准钉的现行权威面由治理轮 GitHub issue #33/#34 承接，本档案不裁。

## 7. 解析断点清单

**旧票号（本仓无以票号命名、亦未被票面文本点名的现行工件）**：`#32`。

**`D-NNN` 账本记了去向、但去向点名物在本仓无对应工件**（4 条，机械解析结果）：`D-152` `D-191` `D-194` `D-209`。按「去向点名物无对应工件」的字面判据，`D-023`／`D-024`／`D-025` 亦应计入——三者点名 `docs/adr/0015`，而该编号保持删除；这三行在 §1 的载体列另有 `docs/spec.md` 可回落，故未计入这 4 条。

**`D-NNN` 账本收口节未记去向**（14 条）：`D-002` `D-008` `D-014` `D-019` `D-049` `D-104` `D-105` `D-107` `D-108` `D-109` `D-111` `D-112` `D-115` `D-120`。

三类都**不是**「决策失效」的判定，只标出历史引用到本仓的解析链在哪里断；裁决语义按 [`README.md`](README.md) 的权威载体指针查。第三类里被 tracker #25 点名的 `D-002`／`D-008`／`D-014`／`D-019` 四条，其现行去向已逐条定案，见下方 §7.1。

### 7.1 五条旧决策的现行去向（tracker #25 补记，2026-10-26）

本节把 tracker #25 点名的五条逐条给出解析去向：`D-002` / `D-008` / `D-014` / `D-019` / `D-022`。定的是「这条历史引用现在由哪个载体承载」，不重新裁定决策内容。前四条属 §7 第三类断点（账本收口节未记逐行去向）；`D-022` 账本本身有去向行（记「被 `D-023` 序列化控制取代」），但它的解析链在 `D-023` 处断，故一并定案。口径四条：

- **只定去向，不改原文**：两份账本保持逐字节冻结，本节不编辑账本任何一行，也不新增 `D-NNN` 编号。
- **不向 `docs/spec.md` R8 追加条目**：R8 记的是 2026-09-16 之后的产品级决策；这五条都早于该窗口，且各有现行载体——本节只指向既有条文（`D-002` 的核心在既有 R8-4，`D-008` 的商业边界在 `docs/spec.md` §Out of Scope），不新增 R8 条目。没有一条产生新的产品决策，故父票 tracker #38 给的「归档索引或 spec R8」两个落点里，本票取归档索引。
- **与 §1「载体」列的关系**：§1 载体列是文件名机械解析，不是裁定——`D-002` 那行解析到 `engine/src/audit/*.ts`、`D-014` 那行解析到两份保持删除的 ADR（0002／0010），都不代表决策载体。读载体时按本节所指，不按 §1 的机械列；裁决本身仍只在载体正文。
- **「账本状态」列取原文首词**：与 §1「状态」列同口径（账本行状态列的原文首词），不取终态；终态写在「去向类别」列。故 `D-019` 填 `current`，其 `→ closed` 由去向类别承载。

| D | 账本状态 | 去向类别 | 现行载体（可解析） | 判定依据 |
|---|---|---|---|---|
| `D-002` | revised | **被现行文档吸收**（核心）＋ **前提过期**（仓形态部分） | [`ADR-0001`](../../adr/0001-five-scale-scope.md) Decision「必须同时覆盖 5 档 scale」；[`ADR-0017`](../../adr/0017-preview-release-model.md) §5「build-scope ≠ release-sequence」（该条自述划界吸收 `ADR-0002` 的 no-MVP-slice 语义残留）；[`docs/spec.md`](../../spec.md) R8-4 | 核心「5 scale 全规划、禁 MVP 切片」现行有效（`ADR-0002` 保持删除后，禁令残留在 `ADR-0017` §5 自述承继，非本票改指）；原文「执行阶段的实现优先级排序属于本仓库外」的前提已随 `D-015`／`ADR-0011`（单仓＋`engine/` 子目录承载实现）失效——实现排期现已在仓内立项，但那是执行事实，不改写本条禁止的「spec 阶段 MVP 切片」 |
| `D-008` | revised | **stale 关闭**（轮次性）＋ 常驻部分被现行文档吸收 | 轮次封口 = [`docs/spec.md`](../../spec.md) R2-01 ~ R2-05；商业层排除 → [`docs/spec.md`](../../spec.md) §Out of Scope（`不引入商业层（已封口）`），架构侧依据 [`ADR-0003`](../../adr/0003-boundary-product-and-usage.md)；no-MVP-slice（原文点 `ADR-0002`，该编号保持删除）→ [`ADR-0001`](../../adr/0001-five-scale-scope.md) ＋ [`ADR-0017`](../../adr/0017-preview-release-model.md) §5 | 原文主语是「**本轮** grill 主干」，轮次结束即失效。载体替换留痕：原文点名 `ADR-0002`，该编号保持删除，其语义残留由 `ADR-0017` §5 自述划界吸收——这是既有记载，不是本票改指。被挂起的 B／C／D 三项已分别重估：B（工程实现）→ `D-015`／`ADR-0011`；C（BACKLOG 卫生）→ 本轮治理轮承接（tracker #38 及子票）；D（自有资产对接）→ 后由 R8-1／R8-2 重新立项落地（那是新决策，不由本条派生）。故不再挂起 |
| `D-014` | revised | **实质取代** | 现行载体 [`ADR-0011`](../../adr/0011-single-repo-subdir-but-branches.md)（`Status: accepted`｜`Supersedes: ADR-0010`）；取代链 = `D-015` → `ADR-0010`（已 superseded、保持删除）→ `ADR-0011` | 原文两条结论分别有去向：「另起工程仓（polyrepo）」被用户 2026-09-12 更正推翻（`D-015`／`ADR-0011`）；「写新 ADR supersede `ADR-0002`」已执行为 `ADR-0010`，`ADR-0010` 自身随后被 `ADR-0011` 取代，`ADR-0002` 的语义残留由 [`ADR-0017`](../../adr/0017-preview-release-model.md) §5 自述吸收。本条无残留有效内容 |
| `D-019` | current | **已终结**（账本行记 `current → closed`，派生决策现行） | 派生 `D-020` → [`ADR-0014`](../../adr/0014-upstream-integration-dual-track.md)；「`ADR-0012` 节奏不复议」是对 `ADR-0012` 不作修改的决定，本身无独立载体（随本条 closed），[`ADR-0012`](../../adr/0012-value-validation-loop-first.md) 仍载四阶段串行本体 | 账本原文即记「closed（2026-09-14 用户拍板『采纳』，派生 D-020）」；本条是一次议题派发（把 Q1 提交 atomcode 深调研），调研结论已成 `D-020` 并落 `ADR-0014`。其冲突协议（禁止静默改向／grill 期间不动源码／push 前必停）属 grill 轮次流程，三条去向不同：`grill 期间不动源码` 随 grill 退出、对象已不存在；`push 前必停` 已由 [`AGENTS.md`](../../../AGENTS.md) 的外显动作闸门独立成文（push／tag／merge／开 PR 等用户明令）；`禁止静默改向` 无现行成文载体——现行实践是 ADR supersede 链（如 `ADR-0011` supersedes `ADR-0010`），属惯例而非约束，记为文本缺口，不补写 |
| `D-022` | revised | **实质取代**（载体指针断链已补记；禁令措辞有文本缺口） | [`docs/spec.md`](../../spec.md) R4-04（阶段 2a 冻结校准）＋ R4-05（阶段 2b CodeLore 单上游探针）；节奏模型 → [`ADR-0012`](../../adr/0012-value-validation-loop-first.md) | `D-023` 原文规定「2a 完成前不得启动 2b（序列化纪律）」，并写明「`D-022` 标 revised，原记录保留，本记录（`D-023`）为 current 取代」；2a／2b 的拆分与内容已落 R4-04／R4-05。**断链**：`D-023` 账本去向写 `docs/adr/0015 §Decision-2`，而 `ADR-0015` 属「保持删除」编号、本仓无此文件，`D-022` 的解析链在 `D-023` 处断；现行落点按本节右侧解析，不追认已删的 0015。**文本缺口**（不改变去向判定）：上述禁令在现行 R4-04／R4-05 无复述，现行文本只留 2a→2b 的段序与波次序列（`tracker #30` → `tracker #31`）两条线索；R4-05 的「前置 =」是运行时解析策略判定，不是 2a 完成门槛，不作该禁令的载体。本节只记录历史禁令与缺口，不补写 |

对账：5/5 有去向，无遗漏。按父票 D16 的三分类归并——**stale 关闭** 1（`D-008`，轮次性）｜**被现行文档吸收** 4（`D-002`、`D-014`、`D-019`、`D-022`；路径不同：`D-014`／`D-022` 走「实质取代」，`D-019` 走「派生决策」，`D-002` 直接由现行条文承载）｜**需新决策** 0。表内四个标签（被吸收／stale 关闭／实质取代／已终结）是同一分类下的路径细分，不是第四类。另记文本缺口 2 条（去向均已定，缺的是现行复述）：`D-019` 的「禁止静默改向」、`D-022` 的序列化禁令措辞。

`D-023` 的断链只补记不修（账本字节冻结，改它等于改写历史现场）。同指向 `docs/adr/0015` 的还有 `D-024`／`D-025`——不在本票五条内、未定案；读账本那几行时按本节口径消歧。

## 8. 建表方法（不复算，仅登记）

本索引由一次性脚本从 git 对象库提取：行号取自 `2e6061be` 的两份账本与 BACKLOG 原文；「引入」列按 `git log --reverse` 逐 commit 读 `.scratch/macro-audit/decision-ledger.md`、`.scratch/architecture-recovery/decision-ledger.md`、`.scratch/architecture-recovery/BACKLOG.md` 三份载体的首次出现；「载体」列按账本行点名的 ADR 号、守卫名、文件名与 `docs/`、`engine/`、`.github/` 路径在 `cd9ca956` 的文件清单里做唯一性匹配；「引用数」列为该基线的 `git grep` 计数（统计域见 §列义）。本票不新增生成脚本入仓（交付面为四个 `.md`），如需再生按本节口径重跑；§1–§3 表体为脚本生成，§0 的口径校正段、§4–§8 与 §7.1 为手写，再生时须保留。
