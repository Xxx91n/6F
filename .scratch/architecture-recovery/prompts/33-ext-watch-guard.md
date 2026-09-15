# Prompt: 33-ext — 挂门守卫扩展（watch 三态齐备化＋manual_watch 值守）

- A-xxx: A-053
- Decision: D-041＋round8-35-audit W6
- Blocked by: 无（#33 本体 done）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/33-ext-watch-guard.md
  - handoffs/33-ext-watch-guard.md
  - next-round.md T7 行（任务书原文）
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-053 / A-038 行）
  - ../macro-audit/decision-ledger.md（D-041 / D-026 / D-034 行）
  - reports/33-gate-registry.json、reports/33-check.mjs、reports/round8-35-audit.md（W6 行）
  - reports/44-check.mjs（两段式/营业时钟/noBom 先例）、reports/update-40-registry.mjs（迁移先例）

## 专属 delta（检查点）
- manual_watch 五要素逐字=标记/责任人/复审时点/验证方法/确认留痕；补齐值从实物推不发明（责任人=收口窗口指派或登记位、复审时点=review_at→review_event 事件锚、验证方法=守卫脚本路径、确认留痕=confirmations[]）
- 事件引用 fail-closed：trigger_event/deadline_event/review_event 悬空=显式 FAIL；watch 枚举非法=FAIL
- 逾期→ALARM＋RISK-ACCEPTED-CANDIDATE 名单，**守卫不自动翻转 status**（risk_accepted 翻转权属人工裁决）
- 每运行输出 COVERAGE event_bound/total；confirmations 四必备字段=at/by/criterion_version/reason
- 既有 WARN/ALARM/BOUND 值守快照格式不破坏；断言并入 33-check 或分立 33ext-check——裁定写明理由

## 专属验收
- reports/33-check.mjs PASS（exit 0 + PASS N/N）＋红证：悬空事件引用→FAIL、review_event occurred→ALARM+候选名单
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾

**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**：① 报告落盘 `reports/33ext-report.md`；② ledger 本票行状态回写 done/deferred；③ WORKFLOW §4 追加 lessons 行；④ commit message 引用守卫结果。

报告写入 reports/33ext-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
