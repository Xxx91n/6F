# 49-report — 回归 matrix 三首选仓接入（R9-03 / A-059 / D-050）

日期：2026-09-17 ｜ 票：#49 ｜ 决策：D-050 / D-046

## ① 完成定义对照

| 验收项 | 结果 |
|---|---|
| DEFAULT JSON 加三首选 leg（git/django/spring-boot 一仓一行） | ✅ 四 leg（含 jiahao 既有腿） |
| 备选表留痕（curl/flask/kafka） | ✅ workflow 注释内，机检断言 |
| 克隆预算实测（20min） | ✅ 本机全深度克隆计时 → 49-clone-budget.json |
| 隔离纪律沿用 | ✅ hooksPath=noop / ext.allow=never / https-only 闸门未动 |
| 49-check.mjs 守卫 | ✅ 见 ⑥ |
| dispatch 实跑 | ⏸ 待 push 授权（T6/T7 用户闸门，不触碰） |

## ② 改动面

- `.github/workflows/macro-b-regression.yml`：resolve job DEFAULT JSON 单 leg→四 leg；备选表注释入同文件
- 账本：A-059 落账（decision-ledger.md）
- BACKLOG #49 → ✅
- WORKFLOW §4 lessons 行追加
- 票档三件套：issues/prompts/handoffs/49-regression-matrix.md
- 工件：49-clone-budget.json / 49-check.mjs / 49-report.md

## ③ 克隆预算实测（本机，Git Bash 全深度 `git clone`）

| leg | 耗时 | 体积 | 预算内 |
|---|---|---|---|
| git/git | 189s | 376MB | ✅ |
| django/django | 158s | 354MB | ✅ |
| spring-projects/spring-boot | 159s | 322MB | ✅ |

三仓均远低于 1200s 预算 → 不触发备选替换。jiahao 为 D-046 既有腿不重测。CI runner 实际时长以 dispatch 实跑为准；若超时按备选表换（curl/flask/kafka）。

## ④ 口径声明

- 本票交付 = legs 接入 + 预算预检 + 守卫；**dispatch 实跑属 push 后动作，需用户授权（T6/T7）**，本票不声称任何 CI run 已完成。
- job 绿 = 管道跑通+产物在，不等于审计 verdict supported；TC-1/TC-2 对无 ADR 仓落 INCONCLUSIVE/insufficient 属有效回归信号（D-050）。
- 三仓仅进 Macro-B 回归面，不进 Micro-A 试点。
- 只读克隆审计不产生 license 传染；clone 走 intake 隔离（hooksPath=noop、ext.allow=never、全深度、浅拒、SHA-256 URL 缓存键）。

## ⑤ 已知限制

- 本机克隆实测非 CI 环境实测；runner 网络/磁盘差异未覆盖。
- workflow_dispatch 首跑结果未知，备选表可能仍需启用。
- 预存漂移清单照旧（38/39/40/43/45 陈旧断言），归 T8 复核。

## ⑥ 可复跑证据

- `node .scratch/architecture-recovery/reports/49-check.mjs` → PASS（本窗口实测）
- 克隆实测：`cd /tmp/r49-clone-test && git clone --quiet <url>` 计时输出 → git 189s/376MB、django 158s/354MB、spring-boot 159s/322MB
- 工件：D:\Aworker\6F\.scratch\architecture-recovery\reports\49-clone-budget.json
- 守卫：D:\Aworker\6F\.scratch\architecture-recovery\reports\49-check.mjs
