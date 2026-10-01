# R53-Q1 调研题面 —— 哨兵值守条目处置裁定（退役 vs 降级常规自检 vs 散文表维持）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。守卫建制面：63 件机检 check（reports/*-check.mjs）＋registry（33-gate-registry.json，75 项触发器/值守条目，五要素齐备才有锚定）＋账本 T3 审计窗哨兵读数表（散文表面）。退役判据立法（D-160⑥）：「退役判据=守护面消亡唯一合法路径」，断言量/年龄/通过史不作退役判据；逐件经 T3 窗非批量（D-160②）；未注册触发器不算锚定（D-164-b——R52 实证：本哨兵 registry 全文零命中）。

对象哨兵：check-kit-regex-blindspot-watch——守护面=`_lib/check-kit.mjs` 的 `stripComments` 正则字面量解析（21 处守卫消费位在册）。病灶已根治：fixture 18/18＋golden 零误删＋70-check 回迁 PASS＋迁入闸退役＋GAP-CK-01 closed。但守护面未消亡（函数仍是活跃共用面，新增 JS 语法形态时病态可复发）。当前登记面=仅账本 T3 散文表一行——无机读锚、无 verify_method、无 owner 三要素。已挂三窗。

## 候选

(i) **摘除**（retired 类终态留档）——不合 D-160⑥（面未消亡即以「病灶根治」替代「面消亡」作退役依据）；且 _retired/ 归档实物不存在，摘除即 75a M3 断言转红。
(ii) **降级常规自检＋补注册**——registry manual_watch 条目五要素齐备（review_event=next-audit-window；trigger=面演化驱动「stripComments 新增 JS 语法形态」非日历；verify_method=每审计窗跑 check-kit-regex-check.mjs 读数登记；bound_to=D-184②④/D-192）；值守节律从「逐窗亲跑」降为「低频盘查」。
(iii) **维持散文表值守现状**——无机读锚的黑洞面，已挂三窗实证拖延。

## 调研要求

1. 工业界成熟心智模型（重点）：监控/守卫类条目「病灶根治但守护面存续」时的退役 vs 降级 vs 保留惯例——lint 规则弃用政策（ESLint deprecated rules）、CI check/SAST 规则退役判据、SRE 告警评审与退役惯例（alert fatigue 与 coverage 权衡、prometheus alert 生命周期）、安全回归测试生命周期（漏洞修复后回归测试保留与否）、monitoring-as-code/observability 治理文献；「守护面消亡才退役」型判据 vs「静默通过史」型判据的工业先例对比；未注册/无机读锚值守条目（wiki/runbook 散文清单）的治理失效先例——on-call 手册腐化、phantom monitoring、shadow SLO。
2. 判候选：三候选各评强弱——特别裁决 (ii)「降级低频＋注册锚定」相对 (iii) 的边际收益是否值得，(i) 在面存续下摘除的风险先例。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-160 退役判据族、D-164-b 注册锚定、D-169 finding 处置三档、D-175 等待期序、D-183 RA 自我指涉、D-177 预声明验证包）。
4. 推荐+理由+置信度；缺口如实标位。
