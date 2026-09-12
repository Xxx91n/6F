# Handoff: macro-audit 下一轮常驻任务书（2026-09-12 grill 轮 2 收口）

> 用途：下一轮子 Agent 的常驻任务书。路径按用户显式指定写入仓内（覆盖 $handoff 默认的 OS 临时目录）。
> 唯一数据源纪律：一切决策以 [.scratch/macro-audit/decision-ledger.md](../decision-ledger.md) 为准；本文不复制账本内容，只给指针。

## 上下文摘要（5 句）

1. 本仓（D:/Aworker/6F，远端 6F/main）是宏观+微观工程内容审计产品的 spec-level 规划仓：轮 1 已封口 D-001~D-007（7 ADR + 38 术语 + 18 票全闭环）。
2. 轮 2 grill 主干 = 补完产品定义（D-008）：新落 D-009~D-013 五条 current（用户四类全集 / 场景并集+默认模式 / 默认模式选定 / 分发=Agent Plugin 五层盒子双 manifest / 输入面=本地默认+URL 可达）。
3. 整理阶段已落盘：ADR-0008（分发形态）+ ADR-0009（输入面）；CONTEXT.md 增至 42 术语（新增 Default Mode / Agent Plugin / Receipt / Repo Intake）；spec-phase-tasks.md 增 R2-01~R2-05。
4. 账本 13 条全部 current、无 revised/stale；两次 atomcode 调研（atomcode-q5-delivery-form / atomcode-q6-input-surface）零推翻、两处精确化（授权清单、MCP 只读边界）。
5. 本轮工作未提交 git——工作树含上述新写入文件，是否 commit 等用户指令。

## 权威参考文件

- `D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md` — 决策账本（D-001~D-013 全 current + 两轮信息缺口段）
- `D:/Aworker/6F/.scratch/macro-audit/spec-phase-tasks.md` — 计划表（轮 1 十八项 + R2-01~R2-05）
- `D:/Aworker/6F/docs/adr/0001-*.md ~ 0009-*.md` — 9 条 ADR
- `D:/Aworker/6F/CONTEXT.md` — 42 术语词汇表
- `D:/Aworker/6F/.scratch/architecture-recovery/` — 轮 1 spec 执行全套（spec.md / 18 票 / reports / WORKFLOW.md / BACKLOG.md）
- `D:/Aworker/6F/.code-tmp/research.md` + `memory.md` — 五轮调研基线

## 下一轮任务清单（每项声明覆盖的 D-xxx）

| # | 任务 | 覆盖 D-xxx | 阻塞前置 |
|---|---|---|---|
| T1 | R2-01：四类 persona 段落写入 spec（何时用 / 拿走什么） | D-009 | 无 |
| T2 | R2-02：使用场景并集清单 + mode 枚举配置面 | D-010 | T1 |
| T3 | R2-03：默认模式开箱路径契约（一次安装 + 首次授权事件清单，含远程 clone 授权） | D-011, D-012, D-013 | T2 |
| T4 | R2-04：Agent Plugin 契约群（plugin.json / mcp.json / 双 manifest 生成脚本规范 / CLI 四外壳命令面 / receipt 协议 / provenance 清单） | D-012 | 无 |
| T5 | R2-05：输入面契约（repo add / 消歧 / 缓存布局 / 凭据复用 / 全深度校验拒绝路径 / 授权事件字段） | D-013 | T4 |
| T6 | 信息缺口扫描：账本 D-012 缺口 5 条 + D-013 缺口 4 条 + 轮 1 遗留 18 条（spec-phase-tasks 轮 1 表对应条目已闭环，仅档缺口段遗留项待判） | 全部 D | 无 |
| T7 | 呈报待用户决定：BACKLOG B1/B2/B3 立票与否；旧仓 architecture-recovery-spec 手动删除；工程实现是否启动（涉及修订 ADR-0002 或另起工程仓，BACKLOG B4.1） | （流程项） | 无 |

## 纪律（下一轮必读）

- 数据源唯一：decision-ledger.md；不得从对话记忆补充结论——发现账本没有的结论，列出并停下问用户。
- 冲突协议：调研结论与任何 current 决策冲突时，禁止静默改向——标记旧记录 revised（保留原文）+ 新记 D-xxx 呈报，等用户拍板后才下探。
- grill 期间禁止修源码、禁止设定账本外目标；每个确认结论当场落盘。
- 调研串行：atomcode 一次只允许一个在途（共享配额）；失败按 resume 锚定续跑，不重开。
- 版本控制走 $but；未收到用户指令前不 commit / 不 push。

## Suggested skills（下一轮按需调用）

1. `$to-spec` — R2-01~R2-03 落成 spec 用户故事与需求段
2. `$to-tickets` — R2 五环转 tracer-bullet 票（含 Blocked by）
3. `$implement` / `$tdd` — 若用户批准进入工程实现（先决：ADR-0002 修订或另起工程仓）
4. `$atomcode-research` — T6 信息缺口的补充调研（串行）
5. `$handoff` — 各子任务窗口收尾
6. `$but` 工作流（`but setup` 恢复 workspace 后）— 全部 VCS 写操作
7. `$wait-what` — 与账本/CONTEXT.md 术语歧义时
8. `$neat-freak` — 收口时一致性盘点

## Git 状态快照（本任务书生成时）

- 远端：github.com/Xxx91n/6F（private，仅 main）；本地未提交的变更：decision-ledger.md（+D-008~D-013）、CONTEXT.md（+4 词）、docs/adr/0008+0009、spec-phase-tasks.md（+R2 段）、本文件。
- 遗留：旧仓 architecture-recovery-spec 未删（缺 delete_repo 权限，需用户手动）；`.scratch/` 无 .gitignore 策略（BACKLOG B2.1 待定）。
