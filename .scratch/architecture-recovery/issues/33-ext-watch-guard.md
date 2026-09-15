# 33-ext: 挂门守卫扩展 — registry watch 三态 schema 齐备化＋manual_watch 值守扫描

**A-xxx covered:** A-053
**Spec ref:** [spec.md](spec.md) §R6-05；next-round.md T7

**What to build:**
① registry watch 三态 schema 齐备化——manual_watch 五要素（标记/责任人 owner/复审时点 review_at·review_event 机读锚/验证方法 verify_method/确认留痕 confirmations[]）对全部 manual_watch 项补齐（缺则补，值从实物推：责任人=待收口窗口指派或登记位、复审时点=各项 review_at 推得事件锚、验证方法=守卫脚本路径、确认留痕=confirmations 结构）；② 33-check.mjs 扩展守卫扫 manual_watch「复审逾期 or 确认记录缺失」——逾期项显式 WARN/ALARM；③ 逾期转 risk_accepted 候选报警——守卫输出候选名单，不自动翻转 status（翻转权属人工裁决）；④ 每次运行输出 event_bound/total 覆盖率；⑤ 确认动作留痕——confirmations 记录结构规范落文（判据版本 criterion_version/判定人 by/理由 reason/时间戳 at）；⑥ 事件引用改 fail-closed——trigger_event/deadline_event/review_event 引用不存在的事件=显式 FAIL（堵 round8-35-audit W6 fail-open 漏洞）；watch 字段校验同上。

**Blocked by:**
None（#33 已 done 本体在跑；D-041⑤ 归票=同族增量不立大票）

**Status:** done（2026-09-16）

- [x] registry 齐备化：7 项 manual_watch 五要素补齐（owner/review_event/verify_method 新增＋confirmations 归一）；micro-a-preview-prep 事件登记为 Micro-A preview 前置机读锚；meta 落文 watch_schema 三态契约＋confirmation_schema 留痕契约
- [x] 守卫扩展并入 33-check.mjs（裁定：并入保持单一挂门守卫，见 33ext-report ⑤）：D 组 7 断言（三态枚举/五要素/三要素/fail-closed/事件锚/留痕结构/BOM）＋E 组 manual_watch 扫描（逾期→ALARM+候选名单、确认缺失→WARN）＋COVERAGE event_bound/total 输出
- [x] 守卫实跑 PASS 16/16 exit 0；红证两态实跑（悬空事件引用→FAIL exit 1 复原；micro-a-preview-prep occurred→4 项 ALARM+候选名单复原）
- [x] npm test 全链绿不回归＋package＋selftest（engine 源码零改动）
- [x] 报告 reports/33ext-report.md＋macro-audit 日报窗口节＋账本/WORKFLOW/next-round/BACKLOG 收口
