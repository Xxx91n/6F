# R47-Q1 调研题面 —— registry 机读字段枚举键建制裁量（window_state_enum 对称性问题）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓为五尺度工程内容审计产品（Macro-A/B/C + Micro-A/B）的 spec-level 规划+治理仓。治理面核心工件=`.scratch/architecture-recovery/reports/33-gate-registry.json`（manual_watch 注册表：74 项值守项＋52 事件键；33-check.mjs 机检 31/31 校验面消费——D2 五要素齐备／D6 confirmations 留痕等断言组）。

D-173（current）为 Stage-2 判据④ A(a) 30 日静默窗钉定机读五件：start_event（枚举 pilot_started/findings_all_closed/freeze_declared）＋start_at＋prereq_check＋reset_log[]＋decision_date 复合测试；并立窗状态机 window_state∈{not_started, running, satisfied_at}（零试点期合法读数=not_started，「计时中」无锚读数退役）。

## 缝的实证

r47 执行批落地时：`window{}` 容器内 `start_event` 已带 `start_event_enum` 键（枚举值域机读先例），而 `window_state` 为顶层裸字符串字段（当前值 "not_started"），无对应枚举键——值域 {not_started, running, satisfied_at} 仅存于 D-173 裁条与 CONTEXT「静默窗」词条文本面。写入错值（如 "runningg"）无机检闸拦截——r47 审计呈报 F4（观察级不阻塞）指「start_event_enum 已有先例，对称建制可入批——须裁定是否超额建制」。

## 候选

(i) 补位建制（对称先例）：registry 项加 window_state_enum 键（或 window.state_enum 与 start_event_enum 同构归位）——值域机读化、写错值可校验；属 D-173③ 五件字面外延增量，须裁定非静默搭车。
(ii) 不建（字面守界）：D-173③ 五件即全集，枚举约束留裁条/词条文本面——裁条边界最严，但机读面留校验洞且与 start_event_enum 不对称已在册。
(iii) 升级校验面（33-check 侧）：数据面零增量，改在 33-check.mjs 加 window_state 值域断言——探测面修语义须 D-147 预声明验证包工序，工序重于 (i)。

## 调研要求

1. 工业界成熟心智模型（重点）：schema/registry/manifest 中枚举值域声明惯例；「对称性建制 vs 最小字段集」取舍——值域已声明的字段未配机读校验是否视为建制欠账；状态机字段 enum 约束在 CI/registry 校验层的落地惯例；枚举声明放数据面（自描述）vs 校验面（断言层）的取舍先例。
2. 判候选：三候选各评强弱——特别裁决：同容器内部分字段带枚举键、部分裸字段的不对称形态在工业惯例中的定位（欠账／可接受／反模式）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-173③ 五件建制边界、D-147 探测面修语义预声明纪律、D-155 manual_watch 五要件、D-146⑤ 勘误链、D-144①④ 账行↔编年随行）。
4. 推荐+理由+置信度；缺口如实标位（无一手公开材料即声明推断级）。
