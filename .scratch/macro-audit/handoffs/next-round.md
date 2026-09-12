# Resident Task Book — macro-audit 下轮（R3 执行轮）

> 生成：2026-09-12，grill 轮 3 收尾（数据源：decision-ledger.md D-001 ~ D-018 程序化对账通过，无去向清单为空）。
> 本文件覆盖写替换上一份轮 2 任务书（其 T1~T7 已在 R2-Q7 轮执行或并入 R3 计划；历史见 git 提交 137c2a1）。

## 现状摘要（5 句）

1. 产品规格三层已封口：R1 决策簇 + R2 产品定义（用户/场景/默认模式/插件契约/输入面）+ R3 验证协议（spec.md ## R1/R2/R3）。
2. 决策账本至 D-018：current 15 条 / revised 3 条（D-002、D-008、D-014）；轮 3 新增 D-016（主干=端到端价值验证闭环先行，ADR-0012）、D-017（首报三层验收闸门）、D-018（B 判据构造 2 正对照+3 真判据+1 负对照），合并 ADR-0013。
3. 工程现状：单仓 engine/ 子目录 walking skeleton（build/smoke 6/6），MCP 是 stub、fact table/采集器/rubric 零实现；CI（仓根 engine-ci.yml）已配未实跑。
4. 调研资产：R3-Q1/Q2/Q3 三份 atomcode 报告在 .scratch/macro-audit/reports/（resume 锚点在各自文末）。
5. 版本控制：全部轮 3 产物已由 but commit 入本地基线；**未 push**——push 需用户明确授权（R3-01）。

## 权威文件（只信这些，不信对话回忆）

- 决策账本：.scratch/macro-audit/decision-ledger.md（唯一数据源）
- 规格：.scratch/architecture-recovery/spec.md（## R1 / ## R2 / ## R3 指针段）
- 计划表：.scratch/macro-audit/spec-phase-tasks.md（R1 18 项 / R2-01~05 / R3-01~07）
- 术语：CONTEXT.md（46 词）｜决策：docs/adr/0001 ~ 0013（0002/0010 已 supersede）
- 调研报告：.scratch/macro-audit/reports/R3-Q1/Q2/Q3-atomcode-research.md

## 任务表（每项声明覆盖的 D-xxx）

| 任务 | 内容 | 覆盖 D-xxx | 计划条目 | 备注 |
|---|---|---|---|---|
| T1 | push + engine-ci.yml 实跑 | D-016 | R3-01 | **需用户先授权远端与时机**；不 push 不开工 T4 |
| T2 | 阶段 0：DuckDB fact table schema v0（事件只追加 + correlation key）+ 确定性采集器（git log / ADR 结构扫描，不接 LLM） | D-016（衔接 D-005） | R3-02/03 | 本地禁止构建/测试——验证走 CI（用户 2026-09-04 命令） |
| T3 | B 层判据预声明文档：三级 kill criterion 措辞 + 2 正对照（绑定 detector 路径）+ 3 真判据（阈值跑前测定）+ 1 负对照（候选：上轮返工产物）→ **用户审阅** → commit 入库 | D-017 / D-018 | R3-04 | 必须先于首报（HARKing 禁令）；atomcode 可出草案（resume 3a3d4bf5…） |
| T4 | 阶段 1：6F 全链首报（S2 ADR 质量 + S1 定位收敛起手，「报告生成器」外壳），A→B→C 闸门验收；同路径覆盖一条失败路径 | D-016 / D-017 / D-018 | R3-05 | 顺带落地 D-007 十路径的 Macro-B happy + failure path；C 层裁定原文回写账本 |
| T5 | 阶段 2：实测锚回流清扫 16 项信息缺口 | D-016 | R3-06 | 顺序反转：先实测后 desk |
| T6 | 阶段 3：铺开其余采集器/scale + 分发收尾（plugin 上架、BACKLOG 卫生） | D-016 | R3-07 | 用户逐项拍板后再动 |
| T7 | 运行纪律常驻：账本随确认随写；调研冲突即标 revised 并呈报等拍板；atomcode 串行（一次一个 in-flight） | 全部 | — | 见下节 |

## 纪律规则（常驻）

1. 【数据源纪律】整理/写作的唯一数据源是 decision-ledger.md；账本里没有的结论必须列出并停下问用户，不许写进文档。
2. 【冲突协议】调研/新证据与任何 current D 冲突时：禁止静默改向——原 D 标 revised（保留原记录），新 D 呈报，用户拍板后才继续。
3. 【执行环境】ctx 激活；ctx_batch_execute shell=bash；文件写入一律 node.js（防嵌套断连），写后验字节/BOM/特征片段。
4. 【CI-only】本机禁止一切构建/编译/打包/测试运行；测试证据只认 CI run/artifact；工程验证推 CI 分支跑 workflow。
5. 【版本控制】but 分支隔离；commit 可自主（防丢失），push / 合并 / 删史一律等用户明确指令。
6. 【grill 纪律】若重开 grill：一次一题、调研充分后提问、退出前报账本条目数+覆盖率自评并问「是否可以定稿」。

## Suggested skills

- $but —— 全部版本控制操作（commit/分支/diff）
- $atomcode-research —— 深调研（串行；-p 只放问题；冲突走协议 2）
- $grill-with-docs / $grilling —— 若需重开 grill 逐题下探
- $to-spec / $to-tickets / $implement —— T2~T6 工程落地的规格→票→实现链
- $neat-freak —— 轮末知识收口；$handoff —— 下轮任务书续写
- $wait-what —— 任务书或规格存在理解分歧时校准

## Git 状态快照（生成本书时）

- 基线：单仓 6F；轮 3 全部产物（账本 D-016~018、ADR-0012/0013、CONTEXT 46 词、spt R3 段、spec.md R3 段、3 份调研报告、本书）已 but commit；远端未配置推送动作。
- 上轮遗留：BACKLOG B1/B2/B3 立票决定仍在用户手中（B4.1 已被 D-015 取代——单仓方案下无需另起工程仓）。
