# R47-Q2 调研题面 —— 「等外部真实验证」段的合法工作面与推进策略裁量

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓为五尺度工程内容审计产品（Macro-A/B/C + Micro-A/B）的 spec-level 规划+治理仓＋确定性 kernel。进度定位实证：VVL 主干阶段 0/1/1.5/2a/2b 全闭环；尺度铺开法定序（D-034②/D-121：Macro-C→Micro-A→Micro-B→Macro-A）已走至 Micro-B preview 闭环；kernel 实建（intake/quarantine/fact store/file-card/macro-b/report/mcp-server/cli/selftest），npm 包 85 件、smoke 349、60 件守卫 check 全绿、registry 74 项值守。

**当前阻塞面（Stage-2 公开推广判据包，D-162/D-168/D-173）**：
- 判据① capability 5/5 阻塞：Macro-A 绑 DoR-b=「跨仓关联键须在 ≥2 真实生产线仓 facts 验证」——.scratch 四仓 facts 被 D-062③ 排除，真实仓 facts 尚不存在；
- 判据④ 静默窗 window_state=not_started：窗起点事件须试点在场（Stage-1 charter 空集=零试点），vacuous silence≠stability；
- ②fresh clone 不红海=PASS 维持；③GAP-HOST-01=RA 五要件关档维持。
- Stage-1 试点邀请=用户主权闸门（D-162⑤ B(b) 逐案用户闸门，Agent 不代裁）。

**仓内剩余面**：T3 审计窗例行值守（哨兵读数/frozen 钉值机检/GAP-B2B 重审/Stage-2 四读数）＋挂账常项（批2-β 三事件触发器全否/O6 顺删待下次触碰/F-02 宿主盲区复测/readme-ci-badge trigger fired 待挂载窗/D-174 枚举键执行窗义务）＋批3/批4 择批点不预裁（D-153④/D-156③）。

## 缝的实质

临界路径外置：Stage-2 ①④ 解锁钥匙都在用户主权侧（Stage-1 试点 charter 邀请→findings 回流→④窗 running→真实仓 facts→DoR-b→Macro-A）。仓内无内生件可直接解锁 ①④——但「等」本身是否有合法推进面（预备件/维护件/值守强化）未经裁定；若纯值守姿态，数十项在册挂账与值守义务的能耗比是否健康亦无裁条。

## 候选

(a) 纯值守姿态：仓内工作=T3 例行＋触发器挂账点火检查＋已裁执行窗义务（D-174 等），不主动开新面——临界路径外置期不加戏，等用户发起 Stage-1 charter；
(b) 闭环残余面：把已 fired 但未处置的 trigger 收干净（readme-ci-badge 挂载随下一门面维护窗、O6 顺删搭车、F-02 复测）——既有欠账清零优先于新面；
(c) 预备件先行：为解锁后状态预建合法件——Stage-1 charter 模板/试点 intake 管线/DoR-b facts 采集管线预备件（不等于启动试点，是降解锁后时延）；批2-β 预备不动工（D-169-a② 触发器纪律不破）；
(d) 维护强化面：守卫覆盖加深/性能基线/frozen 包代表性巡检制度化——用等待期加固而非扩张。

## 调研要求

1. 工业界成熟心智模型（重点）：产品临界路径卡在外部验证依赖（试点/设计伙伴/真实环境证据）时的标准打法——design-partner 招募与 charter 惯例、pre-launch wait-phase 的合法工作面（ readiness maintenance／feature freeze 期允许什么工程活动）、「等待期」结构化值守（watch cadence/冻结资产代表性衰减巡检/触发器点火检查）先例；工程团队「被外部闸门阻塞时该做什么」的成熟模式（预备件 vs 纯等待 vs 质量债清零）。
2. 判候选：四候选各按工业先例评强弱——特别裁决：「等待期开预备件」是否构成对未达判据的实质绕行（shadow launch 反模式 vs 合法 readiness 工程的边界）；纯值守姿态的健康性判据（值守义务清单膨胀是否本身是信号）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-162③④⑤⑥/D-168 DoR-b 绑死/D-173 静默窗/D-169-a② 批2-β 事件触发器/D-153④/D-156③ 批3批4 不预裁/D-162⑤ Stage-1 用户主权闸门/ADR-0017 preview 层序）。
4. 推荐+理由+置信度；缺口如实标位（无一手公开材料即声明推断级）。
