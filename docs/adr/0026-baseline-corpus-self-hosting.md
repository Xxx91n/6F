# Macro-C 基准语料自持 = 仓内 frozen bundle + 独立 baseline-lock

- Date: 2026-10-26
- Status: accepted

## Context

`85-check` 的 C 组把 Macro-C 差分重校准的基准语料钉在同级仓 anysearch-cli 的 `770d2549`。该提交当前是 **dangling**（不在任何 ref 上），gc 随时可能清掉；同级仓的历史整理（rebase / squash / filter-branch / GC）会让基准无声失效。CI 上没有 sibling，C 组只能整组跳过；而跳过不等于红，套件仍然全绿（可见性已由 `SKIP-GROUPS` 修复，可执行性未修）。

同时，`upstream-lock.yaml` 用 `status: planned` 承载一个已在消费的基准钉（#32）；冻结事实 `38-macro-c-facts.jsonl` 里嵌了 30 处本机绝对路径（#34）；同一份基准被三处不同名字指称（lock 的 `770d2549`、冻结事实的 `b45d0799`、known-gaps 的无 sha 描述）。

## Decision

基准语料自持，并与产品上游分离：

- 把 anysearch-cli 的 `770d2549` 打成 frozen bundle 入库（实测 144KB），经 `env-contract` 的只读路径物化；守卫运行期不在主仓对象库写入。
- 新建 `engine/baseline-lock.yaml`，作为基准语料的唯一权威；`upstream-lock.yaml` 移除 anysearch 行，保持纯产品上游语义与致谢闭账口径。
- `85-check` C 组改读 `baseline-lock.yaml` 并物化仓内 bundle；无 sibling 的机器上 C1/C2/C3 值级断言实跑，`SKIP-GROUPS` 归零。
- 唯一权威钉 = `770d2549`；`38-macro-c-facts.jsonl` 的 `b45d0799` 标为历史产物，不再当基准；冻结件字节零动，本机绝对路径在归档索引注明属原始现场。
- 活跃路径（baseline-lock、85-check、报告输出）不得出现本机绝对路径。

## Considered Options

- **只在 anysearch-cli 侧登记"禁改写该提交"**：仍是跨仓假设，且该提交已经 dangling；CI 仍然不可达。
- **在 `upstream-lock.yaml` 增 `baseline` status**：会污染"产品上游"语义，并迫使 `gen-acknowledgments` 与 77-check 扩枚举；#32 的根因正是把基准混进了上游锁。
- **重算/重生冻结事实**：冻结事实是历史证据，字节零动优先；重生会制造新的"哪一枚 sha 才是权威"问题。

## Consequences

- 仓内多一枚 144KB 制品；基准变更走手动窗口：重打 bundle、改 baseline-lock、跑 C 组全等断言。
- GAP-CI-01 从"CI 不可达"改为已解；85-check C 组不再依赖 sibling。
- #32/#33/#34 一并收口；`docs/known-gaps.md` 中相关行的状态与复审时点随票更新。
- 架构决策记录：基准语料不是产品上游，属于"被审计的同级基准仓"，其生命周期与上游锁不同。
