# Handoff: 33-ext — 挂门守卫扩展（registry watch 三态齐备化＋manual_watch 值守）

- **A-xxx covered:** A-053
- **Decision:** D-041（watch 三态＋分层处置五款）、D-026⑤（值守规则）、round8-35-audit W6（fail-open 补洞）
- **对应 issue:** issues/33-ext-watch-guard.md
- **对应 prompt:** prompts/33-ext-watch-guard.md

## 上下文摘要（3-5 句）
#33 本体已 done（33-check.mjs 8/8），但 round8-35 审计 W6 抓出两个洞：事件引用 fail-open（`it.trigger_event && reg.events[...]` 悬空静默跳过）＋watch 字段零校验。D-041① 定 registry watch 三态（event_bound 默认/manual_watch 五要素/risk_accepted 三要素），② 补绑序后 7 项落 manual_watch 但五要素仅 3/5（缺 owner/verify_method/复审机读锚），③ 守卫须扫「复审逾期 or 确认记录缺失」＋逾期转 risk_accepted 候选＋event_bound/total 覆盖率输出。本票=同族增量扩展（D-041⑤ 不立大票）。

## 完成定义（本票 done 判据）
- 全部 manual_watch 项五要素齐备（标记/责任人/复审时点/验证方法/确认留痕），缺字段补齐且值从实物推（责任人=收口窗口指派或登记位、复审时点=review_at 推得 review_event 机读锚、验证方法=守卫脚本路径、确认留痕=confirmations 数组）
- 33-check.mjs（或独立 33ext-check.mjs——裁定写明理由）扫 manual_watch「复审逾期 or 确认记录缺失」：逾期显式 ALARM＋确认缺失显式 WARN
- 逾期项输出 RISK-ACCEPTED-CANDIDATE 候选名单——不自动翻转 status（翻转权属人工裁决）
- 每次运行输出 event_bound/total 覆盖率
- confirmations 记录结构规范落文（at 时间戳/by 判定人/criterion_version 判据版本/reason 理由四必备字段；evidence 缺→WARN）
- 事件引用 fail-closed：trigger_event/deadline_event/review_event 悬空=显式 FAIL；watch 枚举校验同上
- 33-check 扩展后全量重跑 PASS＋既有 WARN/ALARM/BOUND 快照格式不破坏；npm test 全链绿＋package＋selftest 不回归（engine 零改动）
- ledger A-053 done；WORKFLOW §4 lessons；commit 引 A-053＋守卫结果；报告 reports/33ext-report.md 六段式＋日报窗口节

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：watchlist/manual_review 机制工业先例；回顾 baseline（D-041/D-026/D-034/D-035④）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0001、0014；**回顾 CONTEXT.md**：「LRM Binding」「Trigger-gated Closure」
- **对标工业界成熟方案**：watchlist 分层盯梢（Sigma360/PCI-NIST 补偿控制/MHA 残余风险——D-041 已取证可引）

## 阻塞
- 无（#33 本体 done；本票为其扩展子项）

## 关键参考
- reports/33-gate-registry.json（30 项/14 事件；manual_watch 7 项：desk-task4/9/11、codelore-deferred-faces、codelore-residual-faces、codelore-llm-mcp-face、upstream-probes-scorecard-repomix）
- reports/33-check.mjs（8 断言＋值守快照）；reports/round8-35-audit.md W6 行；macro-audit 账本 D-041 行
- 守卫先例：reports/44-check.mjs（两段式 PASS/WARN 通道、REPO_TODAY 营业时钟、noBom）；reports/update-40-registry.mjs（登记表迁移先例）
