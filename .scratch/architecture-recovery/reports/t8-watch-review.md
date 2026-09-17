# T8 值守面复核 — registry 复审留痕（轮 14 T8 / A-061）

日期：2026-09-17 ｜ 决策覆盖：D-043 / D-045 / D-055 / D-056 / D-057②

## ① 复核对象与结论

| 项 | 状态 | 事件锚 | 本轮复核结论 |
|---|---|---|---|
| mw-trigger-c | pending/event_bound | macro-a-start（未发生） | ✅ 维持 pending——Macro-A 未启动，复审语义锚已就位（D-043②） |
| hooks-presentation-face | pending/event_bound | presentation-demand-signal（未发生） | ✅ 维持 pending——无真实呈现需求信号，层④=声明位（D-055） |
| repomix-reopen-trigger | pending/event_bound | repomix-reopen-demand（未发生） | ✅ 维持 pending——无审计证据导出包需求（D-056） |
| narrative-eval-surface | triggered-bound/manual_watch | narrative-surface-landed（已发生） | ✅ 复核确认→bound #52 评测票成立；review_event 推进 stage3-close |
| codelore-deferred-faces | pending/manual_watch | micro-a-preview-prep（已发生，已消费两轮） | ✅ faces[] 同步 #51 激活（-hotspots/-coupling/-function-hotspots/+function-coupling→22 面）；review_event 推进 stage3-close |
| codelore-llm-mcp-face | pending/manual_watch | micro-a-preview-prep（已发生） | ✅ reviewed-stay-pending（Micro-A 走 REST 面）；review_event 推进 stage3-close |
| upstream-probes-scorecard-repomix | pending/manual_watch | 复审逾期 | ✅ reviewed-stay-pending（供应链象限无层刚需）；review_event 推进 stage3-close |

33-check 复核前 ALARM 4 / RISK-ACCEPTED-CANDIDATE 4 → 复核后 ALARM 0 / 候选 0。

## ② 状态翻转说明

- 本轮**无 status 翻转**：四触发器事件锚均未发生或已按判据处置；翻转权属人工裁决（risk_accepted），agent 只留确认+推进锚点。
- codelore-deferred-faces faces[] 修正属登记面同步（#51 已落「partial-activation-noted」，本轮补登记态自洽——面集计数 23→22，标题同步）。

## ③ 陈旧守卫清单（T0 复核归因——预存漂移非本轮破坏）

| 守卫 | 失效断言 | 归因 | 处置 |
|---|---|---|---|
| 38-check.mjs | E3 mw-trigger-b 旧 ALARM 文本 | mw-trigger-b 已 decided（D-043 触发 fired） | 保留陈旧断言不复写——历史守卫按当时快照冻结；当前值守面以 33-check 为准 |
| 39-check.mjs | E3/E4 mw-trigger-a ALARM＋F/I jiahao macro-b-regression.yml 存在断言 | mw-trigger-a 已 decided；jiahao workflow 已被 #46/D-046 撤除 | 同上 |
| 40-check.mjs | G5 next-round.md 旧 T## 标记 | 轮 14 任务书重写 | 同上 |
| 43-check.mjs | D5 同上 | 同上 | 同上 |
| 45-check.mjs | H5 同上 | 同上 | 同上 |

口径：历史 NN-check 断言「当时快照」语义——后续轮翻状属正常演化；守卫不重写（防改史），值守面以 registry+33-check 为准。

## ④ 残余值守面（下轮关注）

- mw-trigger-c：Macro-A 启动即触发（SWMR→L1 写队列评估起步）；
- hooks-presentation-face：呈现需求信号出现即实建最小 Stop/PostToolUse 面；
- repomix-reopen-trigger：导出包/跨仓打包实证需求出现即重开评估；
- narrative-eval-surface：#52 评测票开工时复核 grounded stamp 准确率/κ 基线；
- desk-task4/9/11：manual_watch 确认记录缺失（复审时点未至，WARN 非 ALARM）。
