# Report: 33 — T7 挂门机检化 guard

**A-xxx:** A-038 ｜ **Spec ref:** spec.md §R5-D2 ｜ **Status:** done（2026-09-15）

## 完成定义逐项

- [x] 机读登记表 `reports/33-gate-registry.json` 落文：27 项 × 三字段（最迟拍板时点/触发事件/复审时点）＋status；四族 = checklist-25(13) / ledger-two-field(10) / codelore-deferred(1 项含 20 面清单) / multi-writer(3)
- [x] 守卫 `reports/33-check.mjs`：A 族齐备断言 ×3 + B 源↔登记表对账 ×5（含未登记检出即 FAIL）+ 到期/触发判定 + PASS/FAIL + exit 0/1
- [x] 守卫实跑 `node 33-check.mjs` → **PASS 8/8 exit 0**；值守快照含 ALARM 4 / WARN 2 / BOUND 2
- [x] 登记表形态可复用（`bound_to`/`trigger_event`/`deadline_event` 字段即 #39 触发器 a 与各层 preview 前置的挂接点）

## 首跑值守快照（报警即发现，如实呈报）

| 级别 | 项 | 事实 |
|---|---|---|
| ALARM | 25-P2 | 「2a+2b 双结题」已于 2026-09-15 发生（A-035/A-036 done）——触发已发生未拍＋最迟时点已过（数值化承诺），按值守规则：1 工作日内升级或重组改绑一次 |
| ALARM | 25-B3.3 | 触发「阶段 3 开工门评审」已发生（R5 票据包立案 = 开工门）——CHANGELOG 口径待拍（最迟 阶段 3 首发 tag 前） |
| ALARM | 25-D4 | 触发「阶段 3 开工门」已发生——演示入口（内置样例项目）待拍（最迟 阶段 3 铺开前） |
| WARN | 25-B2.1 / 25-D4 | 「阶段 3 铺开」进行中——最迟时点临近 |
| BOUND | 25-P1 → #34+#41；25-P5 → #41⑤ | 已触发但已绑定票 |

## 实现说明

- `33-gate-registry.json`：`events` 表记录 13 个事件名及其发生态（occurred/in_progress/未发生+证据）；items 经 `trigger_event`/`deadline_event` 绑定事件——后续票翻转事件位即可让守卫自动报警（如 #39 落地后把 `mw-regression-ci` 翻 true）。
- 挂门行检出判据：行含 `挂门`/`deferred`/`最迟` 且不含 `decided-now`/`不立项`/`关闭`（P5 行靠 `最迟` 捕获——方向已拍但凭据子项仍挂门）。

## 阻塞

无。

## lessons 候选

- 挂门检出判据须含「最迟」——半拍板行（方向已拍/子项仍挂门）不标挂门字样；B5 孤儿断言抓到了这一点。

## 引用文件

- reports/33-gate-registry.json、reports/33-check.mjs
- 源：reports/25-rollout-checklist.md、reports/30-desk-calibration.json、../macro-audit/decision-ledger.md（D-024/D-026/D-034④/D-035④）、../macro-audit/reports/R5-Q5-atomcode-research.md §3
