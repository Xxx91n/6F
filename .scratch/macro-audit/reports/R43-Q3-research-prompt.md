# R43-Q3 调研题面 — 预登记发布闸 vs 外部批评压力：残余判据的处置排程

## 背景
产品 macro-audit（Agent Plugin 形态，marketplace 已被动上架=Stage-0）。外部锐评核心战略指控：「别内卷，把产品发给真实用户压测」。本仓回应机制=暴露梯度三段（D-162）：Stage-1 邀测带 charter、Stage-2 公开推广须预声明四判据全达标+30 日静默窗。判据刻意独立于批评压力（KEP-5241 GA 判据化先例）。

## 判据现状（四判据机查/台账可核）
- ① capability 5/5：现声明 4/5 preview；缺的一层=Macro-A（跨仓战略审计层），其启动又绑自身 DoR 闸（D-062）：a.前序层 preview 全上架（已满足）、b.跨仓关联键在≥2真实仓 facts 验证（实证不满足——手头四仓 facts 被明文判定为调研产物不计数）、c.SWMR self-probe 随启动、d.措辞收窄
- ② fresh clone 不红海：本周转绿 ✅
- ③ GAP-HOST-01 关闭：试点宿主 IDE 形态盲区——CLI 已验证三判据全 hit、IDE 面关窗后残项未实测；关闭双路径=宿主侧实证（需外部宿主会话，我方不可自力执行）或 accepted-risk 三要素档案
- ④ 试点 findings 全封+30 日静默窗：findings 已过摄入分诊、时钟已在计时（被动）

## 裁决问题（三候选）
残余判据处置排程：
(i) 批评压力拉动——开执行窗强推：Macro-A preview 立项（越 DoR-b）＋GAP-HOST-01 走 accepted-risk 即关
(ii) 全守不动——判据包值守原样，无任何推进动作
(iii) 分层处置——①绑死 DoR 如实报「合法不可开」；③起草 accepted-risk 档案呈报裁「真关还是等宿主实证」；④被动计时无需动作

## 调研要求
- 回顾本仓 decision-ledger 全部 current 记录（D-062 DoR/D-162 梯度判据/D-148 accepted-risk 三要素/D-026/D-027 用户主权）、docs/adr（0017 漏斗/0016 分发渠道）、CONTEXT.md 词条
- 重点工业界心智模型：预登记发布判据在外部压力下的纪律（KEP-5241 判据化 GA、SRE launch checklist 不可豁免性、design-partner 判据前置惯例）；「 readiness gate 不满足时开半成品」的失败先例；依赖外部方验证项的处置（blocker 外部依赖=等实证 vs risk-acceptance 文书化）；公开推广（GA/launch）被批评/市场压力加速的反例与正例；accepted-risk 档案起草时机（提前起草呈报 vs 临窗才裁）
- 辩证看待；若与 current 决策冲突：标记呈报禁静默改向
- 给出推荐与理由
