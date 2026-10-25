# 19-report — push 与 CI 实跑激活（A-019, A-020）

- **Ticket:** issues/19-push-ci-activation.md ｜ **Handoff:** handoffs/19-push-ci-activation.md ｜ **Prompt:** prompts/19-push-ci-activation.md
- **Decision:** spec.md §R3-D1 ｜ **Session:** 2026-09-13
- **状态: DONE** — push 已执行（4 commits / 3 branches 达 origin）；engine-ci 首跑 **6/6 全绿**（run 34736927344）

---

## §0 用户授权原话（逐字抄录 — 闸门核验）

> **授权：`origin/main 立即执行`**
> 释义（用户在闸门问询中选择项之原文）：push 到 https://github.com/Xxx91n/6F.git 的 main，立即触发 engine-ci.yml 首跑并取 run 链接。

闸门核验：授权原话**已获**（远端 = `origin`，时机 = 立即，ref = `main`）→ 闸门通过。

补充裁定（本次会话）：`20落地，可以继续` —— 暂挂解除，恢复本票执行。

---

## §1 开工第一句复述（阻塞状态 + 必读清单逐条路径）

**阻塞状态：** issue 记 `Blocked by: None`；显式**闸门**「push 远端与时机须用户明示授权」——**已通过**。

**必读清单逐条解析（6/6 可解析）：**

| # | 清单条目 | 解析路径 | 状态 |
|---|---|---|---|
| 1 | issues/19-push-ci-activation.md | .scratch/architecture-recovery/issues/19-push-ci-activation.md | OK 16 行 |
| 2 | handoffs/19-push-ci-activation.md | .scratch/architecture-recovery/handoffs/19-push-ci-activation.md | OK 26 行 |
| 3 | spec.md §R3-D1 | .scratch/architecture-recovery/spec.md:305 | OK |
| 4 | WORKFLOW.md §4.2 | .scratch/architecture-recovery/WORKFLOW.md | OK |
| 5 | decision-ledger.md（A-019, A-020） | .scratch/architecture-recovery/decision-ledger.md:231-232 | OK |
| 6 | docs/adr/0012-*.md | docs/adr/0012-value-validation-loop-first.md（**仓根**，非 .scratch/ 下） | OK 唯一命中 |

---

## §2 完成定义逐项对照（handoff）

| 完成判据 | 状态 | 证据 |
|---|---|---|
| push 完成 | **DONE** | `but push` → 4 commits / 3 branches 达 origin（§3 P4） |
| CI run 链接留档 | **DONE** | run 34736927344 ／ 34737204262（§5） |
| 矩阵明文 | **DONE** | §4（最小可证集一档） |
| ledger A-019/A-020 回写 | **DONE** | 两行 status `deferred` → `done`（含 run 结果） |
| WORKFLOW §4 追加 1 行 lessons | **DONE** | 19 行 lessons 已随 `0f111c4` 落盘；本轮新增教训记 §6 候选 |
| commit msg 引用 A-019/A-020 + CI run 结果 | **DONE** | 见 §8 提交信息 |

---

## §3 执行经过（暂挂 → 解除 → push）

### 3.1 暂挂期（本会话前段，已解除）

三项勘察事实支撑了当时的暂挂裁定：

**F1 — engine-ci 已实跑且全绿。** run 34690925491，`main` @ `66e4433`，push 事件，`2026-09-12T11:23:23Z`，6/6 job 绿。→ ledger A-019 原文「engine-ci.yml 未实跑」**前提失实**。

**F2 — CI 仅由 `engine/**` 变更触发**（workflow `on.push.paths: engine/**`）；R3 规划基线（issues/handoffs/prompts 19-25 + README/ledger/spec）全在 `.scratch/`，不触碰 `engine/**`。当时唯一 `engine/**` 变更属并行票据 20 的在飞 WIP。

**F3 — `but` 默认不推 GitHub。** `but config push-remote = gb-local`（本地裸库 `.`），`target = gb-local/main`；`but push` 仅达 gb-local；WORKFLOW §4.2.1 禁 `git push`。

### 3.2 恢复与解除（用户「20落地，可以继续」后）

**P1 — 票据 20 已落位**：branch `20-fact-schema-v0` 头部 `654db79`（原 `f009797`），含 engine/** 变更（`engine/package.json` + `engine/src/fact/{schema,store,index}.ts`）与 `reports/20-*`；ledger A-021 已回写 `done`。→ F2 的阻塞条件消失。

**P2 — 栈重排（关键处置）**：上一轮 `but move 19-push-ci-activation --above grill-r3-wrapup` 使 20 的基被改到 `main`，产生 rebase 冲突（`WORKFLOW.md` / `decision-ledger.md` 同点追加；冲突提交树含 701 个 GitButler 内部文件）。

- 处置：`but resolve cancel --force` → `but move 20-fact-schema-v0 --above 19-push-ci-activation`。
- 结果：20 的基回到 `0f111c4`（19 的 head），冲突**自动消除**；且 20 的内容（19 行 + 20 行 lessons；A-021=done）**完整保留**。栈成线性：`grill → 19 → 20`。

**P3 — push 机制核定**：`but config push-remote origin`（原 `gb-local` 为本地裸库 `.`，`but push` 不达 GitHub；WORKFLOW §4.2.1 禁 `git push`）。`but push --dry-run` 预演确认 4 commits / 3 branches。

**P4 — 实推（`but push`）**：

```
✓ Successfully pushed 4 commits
  grill-r3-wrapup       -> origin/grill-r3-wrapup       (new -> ac03dda)
  19-push-ci-activation -> origin/19-push-ci-activation (new -> 0f111c4)
  20-fact-schema-v0     -> origin/20-fact-schema-v0     (new -> 654db79)
```

**P5 — CI 首跑**：push 事件触发 engine-ci（`paths: engine/**`，由 `654db79` 满足）。**先记 run 链接**（https://github.com/Xxx91n/6F/actions/runs/34736927344）再看绿红 → **6/6 全绿**（§5）。

---

## §4 CI 矩阵明文（A-020 交付物）

**档位：仅「最小可证集」一档（不加平台；稀释禁令）。**

| 维度 | 取值 | 依据 |
|---|---|---|
| 触发 | `push` + `pull_request`，`paths: engine/**` | 仅 engine 变更需 CI；避免无谓消耗 |
| OS | ubuntu-latest / windows-latest / macos-latest | engine 为跨平台 Node CLI 插件；路径与进程语义差异是真实失败源 |
| Node | 20 / 22 | `engines: node>=20` 下界 + 当前 LTS |
| 单元数 | 3 x 2 = **6 cells** | |
| 步骤 | `npm install` → `gen` → `build` → `package` → `smoke`（`working-directory: engine`） | 双 manifest 单一元数据源 + gen 先比后写（真防漂移） |

**加平台冲动 → 记 lessons 候选，不实施**（本票无新增平台）。

---

## §5 CI 证据留档

### 5.1 本票首跑（由本票 push 触发）

- **Run**: https://github.com/Xxx91n/6F/actions/runs/34736927344
- **id / event / head**: 34736927344 ｜ `push` ｜ branch `20-fact-schema-v0` @ `654db7949f67c3c70f98380afa71f5d9b88a95ef`
- **window**: 2026-09-13T04:02:09Z → 2026-09-13T04:02:53Z（约 44s）
- **conclusion**: `success` — **6/6 job 全绿**：ubuntu-latest(20/22)、macos-latest(20/22)、windows-latest(20/22)；每 job 11 步 0 失败
- **注解（告警，未致失败）**：①`Node.js 20 is deprecated`（actions/checkout@v4 与 setup-node@v4 被强制跑在 Node 24）；②各平台 `git ... failed with exit code 128`（与既有 run 34690925491 同源，属 checkout 的 git 元数据告警）

### 5.2 前序既有 run（背景）

- run 34690925491：`main` @ `66e4433`，push，`2026-09-12T11:23:23Z`，6/6 绿（ledger A-019 原文「未实跑」据此判为失实）

### 5.3 闭环 push 后复跑（本票终态）

- **Run**: https://github.com/Xxx91n/6F/actions/runs/34737204262
- **id / event / head**: 34737204262 ｜ `push` ｜ branch `20-fact-schema-v0` @ `98324d2d9d7731e2cac614a9a7f9cd966fb7d897`
- **window**: 2026-09-13T04:08:50Z → 2026-09-13T04:09:46Z（约 56s）
- **conclusion**: `success` — **6/6 job 全绿**（ubuntu-latest / macos-latest / windows-latest × Node 20/22）
- **意义**：ledger A-019/A-020 回写 `done` + 报告终态提交（`mvp`）随栈重排后经 `but push` 达 origin，复跑同样 6/6 绿 → 闭环提交未引入回归。

---

## §6 lessons 候选

| # | 现象 | 教训 | 来源 |
|---|---|---|---|
| L-19-a | 启动器要求「缺授权原话=停票」，而 /goal 未含授权原话 | 闸门型票据的启动器应把**授权三要素**（远端/时机/ref）作为待填槽位前置 | prompt §专属 delta |
| L-19-b | 必读清单 `docs/adr/0012-*.md` 通配符，基准目录在**仓根**而非 `.scratch/architecture-recovery/` | 通配符引用需标注**基准目录** | WORKFLOW §4.2.6 |
| L-19-c | ledger 记「engine-ci.yml 未实跑」，而该 workflow **已实跑并全绿** | 闸门/前提类事实立票时须**机检复核**（`gh run list`），不得凭记忆断言 | A-019 vs run 34690925491 |
| L-19-d | CI 由 `paths: engine/**` 触发，而 R3 规划基线全在 `.scratch/` → 推基线**不触发** CI | 触发条件与被推内容须在立票时对齐 | workflow vs 基线内容 |
| L-19-e | `but` 默认 `push-remote=gb-local`（本地），`but push` 不达 GitHub | 涉 GitHub 的票须先核实 push-remote/forge 再定机制 | but config |
| L-19-f | `but move <branch> --above <other>` 会改被移分支之上各分支的**基**；本例使 20 的基由 `main` 变为 19，产生「同点追加」rebase 冲突（WORKFLOW/ledger），且冲突提交树被塞入 701 个 `.conflict-side-*` / `.auto-resolution` 内部文件 | ①栈重排前先确认各分支当前基（`but status` 树形 + `git rev-parse` 各 tip）；②共享 append-only 文件（lessons 表 / ledger）的多票追加，**要么同栈（基相对化）要么单分支承载**，否则必然同点冲突；③`but resolve apply` 在「基合并」阶段可能失败（非内容问题）——此时**改基**（`but move`）比解内容更对症 | 本票 P2 |
| L-19-g | 冲突提交被 GitButler 自动以 `ours` 侧写回树，使提交树**丢失**作者内容（R3 段 / lessons 行），而 `but status` 仍标 `{conflicted}` | ①冲突提交的树可能已被自动改写，勿以其树为「作者原意」；判定作者内容看 `but resolve conflicts` 的 `theirs` 侧；②`but resolve cancel --force` 丢弃编辑后，改基重放可让 GitButler 用**作者原意**重建，内容不丢 | 本票 P2 |

（L-19-c/d/e 已择要追加至 WORKFLOW §4；L-19-f/g 为本轮新增，按 delta「加平台/扩张冲动写 lessons 候选而非实施」同样只记候选）

---

## §7 引用文件列表

- `.scratch/architecture-recovery/issues/19-push-ci-activation.md`
- `.scratch/architecture-recovery/handoffs/19-push-ci-activation.md`
- `.scratch/architecture-recovery/prompts/19-push-ci-activation.md`
- `.scratch/architecture-recovery/spec.md`（§R3-D1, :305）
- `.scratch/architecture-recovery/WORKFLOW.md`（§4.2）
- `.scratch/architecture-recovery/decision-ledger.md`（A-019/A-020 行 + 闭环注记）
- `docs/adr/0012-value-validation-loop-first.md`
- `.github/workflows/engine-ci.yml`
- `.scratch/architecture-recovery/reports/20-report.md`（并行票 #20）
- run 34736927344 ／ run 34737204262 ／ run 34690925491

---

## §8 版本控制处置（WORKFLOW §4.2.1）

- 全程**未执行**任何 `git` 写命令；push 经 `but push`（已获授权）。
- 栈 `grill → 19 → 20` 已推 origin；本票产物落 branch `19-push-ci-activation`。
- **提交信息**（实际，commit `mvp` @ `19-push-ci-activation`）：`19(A-019/A-020): 闭环 — push 达 origin（4 commits / 3 branches）+ engine-ci 首跑绿 run 34736927344（6/6）；ledger A-019/A-020 回写 done；报告终态`
- **本票终态 push**：`19-push-ci-activation 0f111c4 → 4624acd`、`20-fact-schema-v0 654db79 → 98324d2`；栈 `grill → 19 → 20` 线性，20 的 `engine/**` 与 `reports/20-*` 无损保留
- **栈重排与冲突解**：`but move mvp -b 19-push-ci-activation` 后 `mvp` 与 20-tip 各遇 1 处 ledger 三方冲突；按语义解（A-019/A-020 取 19 侧 `done`、A-021 取 20 侧 `done`），`but resolve apply` 逐条应用，零内容丢失

---

## §9 残留与后续

1. **落 main**：本票完成定义只要求 push + run 链接；把栈落到 `origin/main` 经 `but pr new` + 合并（见 §3 授权 ref=main）。
2. **观察项**：Node 20 弃用告警（actions 版本需升）；各平台 `git exit 128` 注解（未致失败）。
3. **矩阵扩平台**（如需）记 lessons 候选，未实施（稀释禁令）。
