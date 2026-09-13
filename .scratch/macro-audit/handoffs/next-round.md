# Handoff: 轮 4 定稿收口 → 下轮入口（2026-09-14）

> 类型：grill 轮 4 整理收口 handoff（供下轮子 Agent 常驻恢复上下文）。生成者：首脑会话（整理环节）。
> 本文件不重复其他工件内容，只给指针；唯一决策数据源 = [decision-ledger.md](../decision-ledger.md)（D-001~D-021 + 轮 4 收口对账节）。

## 本轮结果（5 句）

1. 轮 4 grill 封口 3 条：D-019（Q1 调研委托，已 closed）、D-020（上游引入 = 适配器双轨制 + vendor 逃生舱，ADR-0014）、D-021（根 README 组合件五段式，readme-crafter-skill 流程落盘）。
2. atomcode R4-Q1 深调研（reports/R4-Q1-atomcode-research.md）：双轨制推荐，13 来源，与全部 current 决策零冲突零 revised；一处调研召回偏差（agent-completion-gate 无账本出处）已如实记录。
3. 收口对账：17 条 current 全部有去向（无去向清单空），对账表在账本「轮 4 收口对账（2026-09-14）」节。
4. 整理产物：根 README.md（五段式：定位/盒子图+上游清单/Runtime View/所有权表/契约声明）、docs/adr/0014、CONTEXT.md（轮 4 intro 行 + Language 节去重）。
5. 版本控制：分支 grill-r4（commits nwx/mlr/prm/mrn/mqw + handoff commit），未 push——push 与落 main 等用户明确指令。

## 下轮任务（每项声明覆盖的 D-xxx）

- **T1（覆盖 D-020）阶段 2 组合件接入立票**：运行时解析策略下探（容器捆绑 vs 二进制发现；前置 = 读 Agent Plugins 1.0.0 plugin schema 原文，见调研信息缺口 2）+ 上游逐项锁定与 golden 输出契约测试定版；与票 #24/#25（A-028/A-030，deferred）衔接。
- **T2（覆盖 D-021）README 维护**：readme-crafter-skill Phase 6 建议清单按需采纳（CI 徽章 / hero 图 / 首报截图）；上游清单表状态列随阶段 2 进展更新（规划中 → 已接入），更新时须同步账本。
- **T3（覆盖 D-016 残余）R3-06/R3-07 立票**：缺口回流（票 #24，A-028）与铺开+分发收尾（票 #25，A-030，含 BACKLOG B1/B2/B3 立票建议）——启动器已在 .scratch/architecture-recovery/prompts/，开工须用户逐项拍板。
- **T4（用户闸门，非任务）**：grill-r4 push / 落 main 授权；TC-2 RED 处置方向（修 ADR Date 头 vs 判据 v2）；C 裁定张力复核（可选）。

## 权威文件（只信这些）

- 决策账本：.scratch/macro-audit/decision-ledger.md（含轮 4 收口对账节）
- 本轮调研：.scratch/macro-audit/reports/R4-Q1-atomcode-research.md（续问锚点 resume 88169c0d-64ef-4e42-a157-2b7761206e52）
- 决策记录：docs/adr/0001 ~ 0014；术语表：CONTEXT.md（46 词）
- 计划表：.scratch/macro-audit/spec-phase-tasks.md（R1 任务 1~18 / R2-01~05 / R3-01~07）；执行轮状态：.scratch/architecture-recovery/README.md
- 对外门面：根 README.md（组合件五段式）


## 纪律规则（常驻，沿袭上一份任务书）

1. 【数据源纪律】整理/写作的唯一数据源是 decision-ledger.md；账本里没有的结论必须列出并停下问用户，不许写进文档。
2. 【冲突协议】调研/新证据与任何 current D 冲突时：禁止静默改向——原 D 标 revised（保留原记录），新 D 呈报，用户拍板后才继续。
3. 【执行环境】ctx 激活；ctx_batch_execute shell=bash；文件写入一律 node.js（防嵌套断连），写后验字节/BOM/特征片段。
4. 【CI-only】本机禁止一切构建/编译/打包/测试运行（用户 2026-09-04 命令）；测试证据只认 CI run/artifact。
5. 【版本控制】but 分支隔离；commit 可自主（防丢失），push / 合并 / 删史一律等用户明确指令。
6. 【grill 纪律】若重开 grill：一次一题、调研充分后提问、退出前报账本条目数 + 覆盖率自评并问「是否可以定稿」。

## Suggested skills

- $but —— 版本控制（commit / land / push；push 前必停）
- $readme-crafter-skill —— README 迭代与 Phase 6 复核（references/quality-checklist.md 11 项）
- $atomcode-research —— 运行时解析策略 / plugin schema 定向调研（串行，-p 只放问题，timeout 600000）
- $grill-with-docs / $grilling —— 新决策下探（防丢规则 + 冲突协议照旧）
- $handoff / $neat-freak —— 下一轮收口
