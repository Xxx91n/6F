# 19-report — push 与 CI 实跑激活（A-019, A-020）

- **Ticket:** issues/19-push-ci-activation.md ｜ **Handoff:** handoffs/19-push-ci-activation.md ｜ **Prompt:** prompts/19-push-ci-activation.md
- **Decision:** spec.md §R3-D1 ｜ **Session:** 2026-09-13
- **状态: DEFERRED** — 用户裁定「暂挂，等 #20 完成」；**未执行任何 push**

---

## §0 用户授权原话（逐字抄录 — 闸门核验）

> **授权：`origin/main 立即执行`**
> 释义（用户在闸门问询中选择项之原文）：push 到 https://github.com/Xxx91n/6F.git 的 main，立即触发 engine-ci.yml 首跑并取 run 链接。

闸门核验：授权原话**已获**（远端 = `origin`，时机 = 立即，ref = `main`）→ 闸门通过。

---

## §1 开工第一句复述（阻塞状态 + 必读清单逐条路径）

**阻塞状态：** issue 记 `Blocked by: None`；显式**闸门**「push 远端与时机须用户明示授权」——**已通过**。

**必读清单逐条解析（6/6 可解析）：**

| # | 清单条目 | 解析路径 | 状态 |
|---|---|---|---|
| 1 | issues/19-push-ci-activation.md | .scratch/architecture-recovery/issues/19-push-ci-activation.md | OK 16 行 |
| 2 | handoffs/19-push-ci-activation.md | .scratch/architecture-recovery/handoffs/19-push-ci-activation.md | OK 26 行 |
| 3 | spec.md §R3-D1 | .scratch/architecture-recovery/spec.md:305 | OK |
| 4 | WORKFLOW.md §4.2 | .scratch/architecture-recovery/WORKFLOW.md:229-300 | OK |
| 5 | decision-ledger.md（A-019, A-020） | .scratch/architecture-recovery/decision-ledger.md:231-232 | OK |
| 6 | docs/adr/0012-*.md | docs/adr/0012-value-validation-loop-first.md（**仓根**，非 .scratch/ 下） | OK 唯一命中 |

---

## §2 完成定义逐项对照（handoff）

| 完成判据 | 状态 |
|---|---|
| push 完成 | DEFERRED（用户裁定暂挂） |
| CI run 链接留档 | DONE（既有 run 34690925491，见 §5） |
| 矩阵明文 | DONE（见 §4） |
| ledger A-019/A-020 回写 | DONE（回写为 `deferred`） |
| WORKFLOW §4 追加 1 行 lessons | DONE（已追加） |
| commit msg 引用 A-019/A-020 + CI run 结果 | DEFERRED（待恢复时执行） |

---

## §3 暂挂依据（用户裁定 + 三项勘察事实）

用户裁定：**「暂挂，等 #20 完成」**。

支撑事实（执行前勘察，逐条取证）：

**F1 — engine-ci 已实跑且全绿。** run 34690925491，`main` @ `66e4433`，push 事件，`2026-09-12T11:23:23Z`，6/6 job 绿。→ ledger A-019 原文「engine-ci.yml 未实跑」**前提失实**（该 run 早于 R3 grill 轮落盘 ac03dda = 2026-09-13 01:32 +0800）。

**F2 — CI 仅由 `engine/**` 变更触发**（workflow `on.push.paths: engine/**`）。工作区**唯一** `engine/**` 变更属**并行票据 20 的在飞 WIP**：`engine/src/fact/{schema,store,index}.ts`（新建）、`engine/package.json`（加 `@duckdb/node-api@1.5.5-r.4`），时间戳 Sep 13 02:27-02:35，且 `reports/20-report.md` 未生成 → 票据 20 未完成。R3 规划基线（issues/handoffs/prompts 19-25 + README/ledger/spec）全在 `.scratch/`，**不触碰 `engine/**`**。

**F3 — `but` 默认不推 GitHub。** `but config push-remote = gb-local`（本地裸库 `.`），`target = gb-local/main`；`but push` 仅达 gb-local；WORKFLOW §4.2.1 禁 `git push`。落 origin/main 须经 `but pr` 或改 push-remote。

**结论：** 不含 `engine/**` 变更则本次 push 不触发 CI；唯一 `engine/**` 变更属他人未完成工作（受「不 commit/push 他人工作」规则保护）。→ 用户裁定暂挂。

---

## §4 CI 矩阵明文（A-020 交付物）

**档位：仅「最小可证集」一档（不加平台；稀释禁令）。**

| 维度 | 取值 | 依据 |
|---|---|---|
| 触发 | `push` + `pull_request`，`paths: engine/**` | 仅 engine 变更需 CI；避免无谓消耗 |
| OS | ubuntu-latest / windows-latest / macos-latest | engine 为跨平台 Node CLI 插件；路径与进程语义差异是真实失败源——首跑已现 windows/macos `git exit 128` 注解 |
| Node | 20 / 22 | `engines: node>=20` 下界 + 当前 LTS |
| 单元数 | 3 x 2 = **6 cells** | |
| 步骤 | `npm install` → `gen` → `build` → `package` → `smoke`（`working-directory: engine`） | 双 manifest 单一元数据源 + gen 先比后写（真防漂移） |

**加平台冲动 → 记 lessons 候选，不实施**（本票无新增平台）。

---

## §5 CI 证据留档

- **首个绿 run：** https://github.com/Xxx91n/6F/actions/runs/34690925491
- **headSha:** 66e4433bb8b52cb88f03de3e03f23b97f1c71a31 ｜ **event:** push ｜ **branch:** main ｜ **createdAt:** 2026-09-12T11:23:23Z ｜ **conclusion:** success
- **6/6 job 全绿：** ubuntu-latest(20/22)、windows-latest(20/22)、macos-latest(20/22)
- **日志摘要（注解，均未致失败）：** 各平台 `git ... failed with exit code 128` 告警；`Node.js 20 is deprecated`（actions 被强制跑在 Node 24）→ 已登记为观察项。

---

## §6 lessons 候选

| # | 现象 | 教训 | 来源 |
|---|---|---|---|
| L-19-a | 启动器要求「缺授权原话=停票」，而 /goal 未含授权原话 | 闸门型票据的启动器应把**授权三要素**（远端/时机/ref）作为待填槽位前置 | prompt §专属 delta |
| L-19-b | 必读清单 `docs/adr/0012-*.md` 通配符，基准目录在**仓根**而非 `.scratch/architecture-recovery/` | 通配符引用需标注**基准目录** | WORKFLOW §4.2.6 |
| L-19-c | ledger 记「engine-ci.yml 未实跑」，而该 workflow **已实跑并全绿** | 闸门/前提类事实立票时须**机检复核**（`gh run list`），不得凭记忆断言 | A-019 vs run 34690925491 |
| L-19-d | CI 由 `paths: engine/**` 触发，而 R3 规划基线全在 `.scratch/` → 推基线**不触发** CI | 触发条件与被推内容须在立票时对齐 | workflow vs 基线内容 |
| L-19-e | `but` 默认 `push-remote=gb-local`（本地），`but push` 不达 GitHub | 涉 GitHub 的票须先核实 push-remote/forge 再定机制 | but config |

（L-19-c/d/e 为本票新增，已择要追加至 WORKFLOW §4）

---

## §7 引用文件列表

- `.scratch/architecture-recovery/issues/19-push-ci-activation.md`
- `.scratch/architecture-recovery/handoffs/19-push-ci-activation.md`
- `.scratch/architecture-recovery/prompts/19-push-ci-activation.md`
- `.scratch/architecture-recovery/spec.md`（§R3-D1, :305）
- `.scratch/architecture-recovery/WORKFLOW.md`（§4.2, :229-300）
- `.scratch/architecture-recovery/decision-ledger.md`（:231-232）
- `docs/adr/0012-value-validation-loop-first.md`
- `.github/workflows/engine-ci.yml`
- `.scratch/architecture-recovery/BACKLOG.md`（:37, :40）
- `.scratch/architecture-recovery/README.md`（:273, :279）
- `.scratch/architecture-recovery/HANDOFF-2026-09-12-round-close.md`

---

## §8 版本控制处置（WORKFLOW §4.2.1）

- 全程**未执行**任何 `git` 写命令；**未执行** `but push`。
- 本票产物经 `but commit` 落到独立 branch `19-push-ci-activation`（**未推送**）。
- 明确**排除**并行票据 20 的在飞 WIP：`engine/package.json`、`engine/src/fact/*`、`reports/20-fact-schema.*`（未 commit、未 push）。
- **未推送声明**：用户裁定暂挂，本票止于本地提交，不执行任何 push。

---

## §9 恢复条件（resume）

同时满足以下全部后恢复本票并执行 push + CI 触发：

1. 票据 20（A-021 / R3-D2）完成并落位（`engine/**` 变更可推）；
2. 用户重申远端与时机授权（或沿用本次 `origin/main`）；
3. 机制确定：`but pr`（PR 触发 + squash 合并）或改 `push-remote=origin`；
4. 首跑后**先记 run 链接**再看绿红；红 = 只收日志摘要报阻塞，**不改 workflow 文件**。
