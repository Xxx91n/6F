# 37-report — 试点面可用性审计：三仓 PR 人/机比 + ADR supersede 链完整度实测

> 票：#37 / R5-06｜A-xxx：A-042｜决定：D-033（三试点仓角色指派建议——本票为其前置实测）
> issue：`.scratch/architecture-recovery/issues/37-pilot-surface-audit.md`；handoff：`.scratch/architecture-recovery/handoffs/37-pilot-surface-audit.md`
> 阻塞状态：**None**（#34、#35 均已闭环；per 任务书 T9「下一可开工」）
> 实测存档：`.scratch/architecture-recovery/reports/37-pilot-measurements.json`（探针 `37-probe.mjs` 生成，git 只读命令：remote -v / log / shortlog / branch -r / rev-list / rev-parse / tag；**三仓零写入**）

## ① 开工复述

必读清单逐条已解析：issue/handoff/prompt 37、spec.md §R5-D6、WORKFLOW §4.2、A-042 行（current）、macro-audit 账本 D-033 行（角色指派建议原文）、ADR-0015（量测效度先行）、ADR-0009（Repo Intake）、CONTEXT.md（Pilot-surface Audit / Generalization Gate）、reports/02-*（W2 三仓扫描先例）、reports/35|36-check.mjs 与 35|36-report.md（守卫与 6 段式先例）、next-round.md T9 行。

三问落文目标（Pilot-surface Audit，per CONTEXT.md）：**capacity / ground-truth 可得性 / 泛化增量**。本票不改 engine 代码 → 验收链以既有 `npm test` 不回归为准（见 ⑥）。

## ② 调研（实测探针为主通道——本窗口无 atomcode carrier，如实登记）

调研通道 = **活仓只读实测**（`37-probe.mjs`，ADR-0015「量测效度先行」同构：先于指派判定测准 pilot surface）+ 账本/spec 原文对账。工业先例（训练语料级，未本窗口重验，如实登记）：①「人/机 PR 比」判定形态与 OpenSSF Scorecard `Maintained`/`Contributors` check（bot-账号单列、组织成员数）同构；②「PR 不可从无托管面仓产出」与 D-033 内嵌 capacity 硬约束一致；③dependabot/release-please 属 GitHub 官方文档明的 bot PR 边缘形态（`[bot]` 署名 + `dependabot/` 远端分支族 + release-please--branches 命名）。冲突协议：实测与 D-033 desk 判定有出入 → 按纪律呈报不静默改向（见 ⑤）。

## ③ 开源轮子

零新增依赖、零写入被测仓：`37-probe.mjs` 纯 ESM Node + `spawnSync git -C <repo> <只读子命令>`；ADR 解析 = 文件名序号 + Status 行 + `Superseded by ADR-NNNN`/`supersedes`/`Amends:`/`References:`/`defer-NNNN` 结构化引用抽取（否定形「does not supersede」与自指引文单列，不进断链统计）。

## ④ 完成定义 vs 实际

### 4.1 三指标逐仓落数（全部实测，非 desk）

| 指标 | env-manager | anysearch-cli | jiahao |
|---|---|---|---|
| **GitHub PR 总数**（merge-commit + squash(#N)，committer=GitHub 才计） | **10** | **0**（无 PR 流程=下限） | **6** |
| ├ 人作者 PR | 6（#30,32,46,47,49,51） | 0 | 6（#1,2,3,4,5,7） |
| ├ bot 作者 PR | 1（dependabot[bot] #55） | 0 | 0 |
| └ 机器生成 PR（release-please） | 3（#48,50,64） | 0 | 0 |
| 在飞 bot PR 远端分支 | 9（dependabot×8 + release-please×1） | 0 | 0 |
| 作者构型（commit 分母） | 人 1 身份(10) / 机 7 身份(486)——「Env Manager Bot」469 主笔 | 人 2 身份(312) / 机 2 身份(2) | 人 2 身份(250) / 机 1 身份(1) |
| **ADR 文件数**（docs/adr/NNNN-*.md） | 14 | 65 | 69 |
| ├ whole-ADR supersede（Status: Superseded by） | 0 | 1（0058→0060，含 ship-gate 断言强制回链，ADR-0060 D1） | 0 |
| ├ item 级 supersede（决策项取代） | 0 | 2（0059→0060 errata；0063 D2→0033 D2，0033 D9 回链） | 2（0039 D3 锚→0062→0066） |
| ├ Amends/References/defer 引用边 | 0 | 3（含 defer-0026） | 66（含 defer-0024→docs/deferred-registry.json） |
| └ 断链 / 缺回链（supersede 族） | 0 / 0 | 0 / 0 | 0 / 0 |
| **托管面** | GitHub remote（同步 0/0）+ 9 workflows + PR 模板 + dependabot.yml + ISSUE_TEMPLATE + CONTRIBUTING + CODE_OF_CONDUCT + ci pull_request 触发 | GitHub remote（同步 0/0）+ 6 workflows（ci.yml 带 pull_request 触发）——**无** PR 模板/dependabot/CODEOWNERS | GitHub remote（origin 同步 0/0，另有 gb-local GitButler 本机伪 remote）+ ci.yml（pull_request 触发 + fetch-depth:0）——**6 个人类 PR 已落地** |
| git 健康 | 非 shallow，496 commits，5 tags | 非 shallow，314 commits，2 tags | 非 shallow，251→252 commits（+1=#39 workflow commit 84077da，复测漂移如实记），1 tag |

### 4.2 层 × 仓 capacity 矩阵（行=能力层，列=三仓；格内=实测判定+证据锚）

| 层 \ 仓 | env-manager | anysearch-cli | jiahao |
|---|---|---|---|
| **Micro-A**（PR 级 diff 审计；capacity 硬约束=须托管 PR 面） | ✅ **合格且唯一带非人类 PR 边缘形态**：10 PR（人6/bot1/机器生成3）+ 9 在飞 bot 分支；锚：`0f70ec56`(dependabot #55)、`f5423020`(#64)、`.github/dependabot.yml`、`.github/workflows/dependabot-auto-merge.yml` | ❌ **不合格（下限）**：0 PR（本地历史零 GitHub-committer 事件）；锚：37-pilot-measurements.json `pr_ratio.github_pr_total=0` | ✅ **实测合格（与 desk 判定相反）**：6 个人类 PR + ci.yml pull_request 触发；锚：`28c253e`(#7)、`c35c23f`(#1)、`.github/workflows/ci.yml` |
| **Micro-B**（文件级，本地 git 即可） | ✅ 合格：git 健全非 shallow（496 commits） | ✅ 合格（314 commits） | ✅ 合格（251→252 commits，复测漂移同上） |
| **Macro-B**（仓级四象限 one-shot/回归） | ✅ 合格（git+CI+托管全有） | ✅ 合格（git 健全+CI） | ✅ 合格（git+CI+托管全有）——D-033 拟定的 Macro-B 回归仓，实测前提成立 |
| **Macro-C**（演化考古；核心素材=ADR 深度+supersede 链） | △ **弱（下限）**：14 ADR 但 supersede 边=0——链完整度无从可测（无取代事件）；锚：37-probe `supersede_chain.edge_count=0` | ✅ **合格（D-033 指派成立）**：65 ADR + whole-ADR supersede 1 + item 级 2，断链 0、回链 0 缺；锚：`docs/adr/0058` status 行、`docs/adr/0060` D1 | ✅ **合格且引用网最密**：69 ADR + 68 结构化引用边（Amends 17/References 48/defer 1），item 级 supersede 2 全回链；锚：`docs/adr/0039` 锚点段、`docs/deferred-registry.json`（defer-0024 解析） |
| **Macro-A**（跨仓组合；需 ≥2 仓） | 三仓并跑 capacity 满足（D-033 拟「天然最后」不变） | 同 | 同 |

### 4.3 Pilot-surface Audit 三问落文

- **capacity**：env-manager = 三指标全高（托管 PR 面 + bot 边缘形态 + 9 workflow），但 ADR supersede 素材薄（0 边）；anysearch-cli = ADR 链强（65 份、链完整）但 **PR 面=0**（不能接 Micro-A）；jiahao = PR 面实测存在（6 人类 PR）+ 引用网最密（68 边），**不再是「无托管下限」**。
- **ground-truth 可得性**：三仓均非 shallow、origin/main 同步 0/0、全部证据锚（文件/commit/度量值）live 复测一致（守卫 B/C 组）——三仓 ground-truth 均可得。
- **泛化增量**：三仓同主（Xxx91n/Euiop1 系），dogfooding 确认偏差面已在 D-033 入规——本矩阵只作校准+冒烟指派依据；泛化证据仍须 ≥1 非自有公开仓（#40 / D-013 URL opt-in），本票实测锚供 #38（Macro-C preview）、#39（Macro-B one-shot+回归）直接消费。

### 4.4 handoff 完成定义逐项

| handoff 完成定义 | 实际 |
|---|---|
| 实测脚本 reports/37-*.mjs 落文并实跑（只读；非人类 PR 边缘形态显式识别） | `37-probe.mjs`（exit 0；bot-authored / machine-generated(release-please) 单列；git 全只读子命令）+ `37-pilot-measurements.json` |
| 三指标逐仓落数 + 层×仓 capacity 矩阵（每格证据锚） | §4.1 三指标表 + §4.2 矩阵（每格 sha/文件/度量值锚） |
| 与 D-033 角色指派对照（一致/出入如实写；出入 → 冲突协议呈报不静默改向） | §5.1 对照表——2 项一致、2 项出入（jiahao 托管面证伪 / env-manager「唯一」证伪） |
| 守卫 PASS | `37-check.mjs` **PASS 40/40**（见 ⑥） |
| ledger A-042 done + WORKFLOW §4 lessons + commit 引 A-042+守卫 | 本次收口一并落盘 |

## ⑤ 卡死 3 连问 + D-033 对照（冲突协议呈报）

无卡死。**D-033 desk 指派 vs 实测对照**（出入如实登记，per 冲突协议不静默改向）：

| D-033 原文判定 | 实测结果 | 判定 |
|---|---|---|
| anysearch-cli→Macro-C 校准语料（56 ADR＋supersede 链稀缺素材） | 65 ADR（desk 计数 56 已漂移至 65）+ supersede 链完整（3 边全解析+回链，另含 1 条「显式不取代」纪律样本 + ship-gate 断言先例 ADR-0060 D1） | ✅ **一致**（计数漂移如实记） |
| env-manager→Micro-A「唯一合格试点」（唯一托管 PR 面，含 dependabot/release-please 边缘形态） | 托管 PR 面存在且 bot 边缘形态独有（dependabot #55 + release-please 3 PR + auto-merge workflow）；但「**唯一**托管 PR 面」被证伪——jiahao 亦有 6 PR | ⚠️ **部分出入**：「唯一」不成立；若 Micro-A 试点要件含 bot 边缘形态则仍唯一 |
| jiahao→Micro-B·Macro-B 回归＋下限测试（纯本地仓测「git 健全无托管」下限） | **证伪**：origin=github.com/Xxx91n/jiahao.git 与本地 main 同步 0/0、ci.yml 带 pull_request 触发、6 个人类 PR（#1-#7，2026-09-10~14，早于 D-033 拍板日 09-15）——**非纯本地、非无托管** | ❌ **出入**：「无托管下限」角色前提不成立；jiahao 实测可作 Macro-B 回归（成立）/ Micro-A 人类 PR 面 / Macro-C 密引用网 |
| 三仓并跑→Macro-A 泛化冒烟（≥2 仓天然最后） | capacity 满足 | ✅ 一致 |
| capacity 硬约束「PR 层试点不得指派无托管 PR 面的仓」 | 实测唯一无 PR 面 = **anysearch-cli**（不能接 Micro-A）；jiahao 有资格 | ⚠️ 排序重排：Micro-A 候选集 = {env-manager, jiahao}，非 {env-manager} 单例 |

**呈报建议**（供收口窗口裁决，不自行改 D-033）：D-033① 角色绑定能力层原则不变，但 desk 事实两点过时——(a) jiahao 已有 GitHub 托管 PR 面，「下限测试」语义需重绑（若仍需「无托管下限」样本，三仓中无合格者，须另选非托管本地仓或承认下限缺位）；(b) env-manager「唯一 PR 面」应锐化为「唯一 bot-PR 边缘形态面」。Macro-C 校准语料指派不变。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| 三仓只读实测、零写被测仓 | `node .scratch/architecture-recovery/reports/37-probe.mjs` → 逐仓摘要 + `WROTE 37-pilot-measurements.json`，exit 0；git 子命令白名单（remote -v/log/shortlog/branch -r/rev-list/rev-parse/tag）见探针头注 |
| 三指标逐仓落数 | `37-pilot-measurements.json`：`env-manager pr=10(h6/b1/g3) adr=14 edges=0` / `anysearch-cli pr=0 adr=65 edges=8` / `jiahao pr=6(h6) adr=69 edges=68` |
| 证据锚可回查 | `node .scratch/architecture-recovery/reports/37-check.mjs` B 组：head/PR-sha `git cat-file -e` 全过、ADR/workflow 文件锚全存在 |
| 度量值 live 复测一致 | 37-check C 组：commit_count / GitHub-committer 总数 / ADR 文件数 独立重跑 = 存档 |
| 非人类 PR 边缘形态单列 | 37-check D1/D2：env bot≥1（dependabot[bot] `0f70ec56`）+ machine-generated≥1（release-please `4cfe6e2d`/`57162dc1`/`f5423020`）+ 9 在飞 bot 分支 |
| 无 PR 面仓如实下限 | 37-check D3：anysearch-cli `github_pr_total=0` 且 remote 存在（托管有无与 PR 面有无分列） |
| D-033 对照出入不藏 | 本报告 §5.1 表：2 一致 / 2 出入 / 1 硬约束排序重排 |
| 守卫 PASS | `node .scratch/architecture-recovery/reports/37-check.mjs` → **PASS 40/40**，exit 0 |
| engine 不回归（本票零 engine 改动） | `cd D:\Aworker\6F\engine && npm test` → 见收口记录（GEN-OK + tsc 0 错 + SMOKE/COLLECTORS/ADAPTER/BATCH1/LLM 全绿） |

## ⑦ 教训

1. **「机器生成 PR」判据必须收窄到产物形态而非主题词**：`release-please` 字样出现在 subject 不等于机器生成（#46/#47/#51/#32 是人类在做 release-please 治理）——正确签名 = `chore(main): release X.Y.Z` 标题 + `release-please--branches--*` 分支名。首版误分 4 个 PR，复测纠回 h6/b1/g3。
2. **supersede 抽取须防三类假阳**：否定形（「does not supersede ADR-0040」是纪律样本非边）、自指引文（ADR-0060 引用自身 status 格式说明）、跨行接续（「again by ADR-0066」在段落后续行）——逐类单列后断链统计才诚实。
3. **desk 角色指派必须带实测闸**：D-033「jiahao 纯本地无托管」在拍板前 5 天已被 6 个 PR 证伪——desk 结论标置信域/实测闸是 Pilot-surface Audit 存在的意义；本票即其实例。
