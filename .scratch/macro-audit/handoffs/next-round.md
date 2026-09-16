# next-round — 轮 9 常驻任务书（W14 收口后）

> 生成于 2026-09-16 轮 8 整理环节（handoff skill）。任何子 Agent 读本文件即可接续：先读本节口径→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 口径基线（读前必知）

- 并发策略 = SWMR 单写者门面（ADR-0019）：判据守护结果属性非实现路径；fail-fast 准入=完整性成立的合法形态
- 分层账本纪律（D-044）：fired 事件=不可变 append-only 历史；绑定=可修正配置；绑错=规则缺陷，修规则＋留 disposition/勘误
- 暂缓面集现 25 枚举（D-035④ 22＋D-045 增 3）；B3 回查源=D-035∥D-045
- 回归 CI 归属=6F 自有 CI（D-046）：jiahao 仅作审计对象；经典公开仓可入回归面
- Micro-A preview 试点={env-manager,jiahao}＋第三槽（托管 API 适配器前置，D-047）
- 上架面授权至提交前一刻（D-042）：凭据申请/字段查证/listing 资产可开工；**提交点击=用户**

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本 R7 节＋ADR-0019；跑 33-check 确认值守面基线 | D-043~D-047 | 基线快照 | — |
| T1 | **#46 回归 CI 迁回**：6F `.github/workflows/` 加 macro-b 回归 job（URL opt-in clone 公仓→one-shot→工件；schedule+workflow_dispatch） | D-046 | engine 仓库 workflow＋验证工件 | implement / tdd（契约断言） |
| T2 | **#46 jiahao 撤除**：删 `D:\Aworker\jiahao\.github\workflows\macro-b-regression.yml` 单文件；前后 `git diff` 断言恰 1 文件删除 | D-046 | jiahao 仓单提交 | 无（最小外科） |
| T3 | **#46 经典仓候选清单**：语言族×git 健全度×规模短名单（如 C/Python/Java 各一）呈用户定；选定后接入 T1 job 的 repo matrix | D-046 / D-013 | 候选呈报＋matrix 配置 | research（atomcode） |
| T4 | **#41b 上架面开工**：listing 资产（截图/描述/图标）＋marketplace 字段查证（preview 标注字段/版本元数据 schema/竞品扫描）＋凭据申请材料包——提交动作停用户 | D-042 / D-031 / D-037 | 资产＋查证文档入仓；凭据材料呈用户 | atomcode-research（marketplace 查证） |
| T5 | registry 复核：desk-task15 重绑后首复审窗=micro-a-preview-prep occurred 时拉起；manual_watch 7 项确认留痕随复审写入 | D-044 / D-041 | registry confirmations | — |
| T6 | entity-effort 后续批次票：随 S5 ownership 族契约化窗口立案（判据＝该族拉动） | D-045 | BACKLOG 行（届时） | — |
| T7 | Micro-A preview 前置包：试点集双仓 PR 面实测复核（env-manager 机器 PR 边缘形态／jiahao 全人基线）；第三槽等托管 API 适配器 | D-047 / D-034② | preview 前置审计记录 | codebase-design |
| T8 | mw-trigger-c 值守维持：Macro-A 启动即复审；若届时设计仍单写者串行采集→本域永久封口呈报 | D-043 / D-034 | registry 状态翻转呈报 | — |
| T9 | 暂缓面集 25 面值守：判据逐面挂住（新增 3 面判据见 33-gate-registry face_criteria）；复审时点=各层 preview 前置 | D-045 / D-035 | registry confirmations | — |
| T10 | 提交动作（**用户专属**）：marketplace listing 最终提交点击；jiahao/6F 远端 push 授权确认 | D-026 / D-027 / D-042 | 用户操作 | — |

## 轮 8 执行回执（保留行，验收账锚）

- **T0~T14 ✅ DONE 2026-09-15/16**（R5/R6 票据包全闭环）：T0 立票／T1 #33 挂门机检化／T2 #34 plugin.json／T3 #35 CodeLore 30 面（含审计返修）／**T4 #44 版本与上游锁定制度化 ✅ DONE 2026-09-16**（锁表种子＋44-check 56/56；覆盖 D-037/D-039）／T5 #45 演示入口／T6 #41a 仓内文档面／T7 #33 扩展 watch 三态／T8 #36 LLM 面门控／T9 #37 试点审计／T10 #38 Macro-C preview／T11 #39 三仓 one-shot＋jiahao 回归（jiahao 侧 workflow 已按 D-046 列入 #46 撤除）／T12 #40 gsd-core 泛化验证／T13 #42 上游队列／T14 #43 golden CI
- **T15 #41b**（上轮 blocked）：本轮 D-042 授权至提交前一刻→转入本任务书 T4

## 纪律规则（不可协商）

1. 【防丢】每个用户确认的实质结论当场追加 decision-ledger.md；任何压缩/compact/handoff 前先确认账本已落盘到最新。
2. 【数据源】整理的唯一数据源 = 账本；认为存在但账本没有的结论 → 列出并停下问，不许直接写进文档。
3. 【对账闸】整理环节 = 枚举 current → 逐条去向 → 无去向清单非空即停。
4. 【冲突协议】调研结论与 current 决策冲突 → 禁止静默改向：对应 D-xxx 标 revised（保留原记录）+ 新 D-xxx 呈报等拍板。
5. 【用户闸门】上架提交点击／远端 push（6F、jiahao 各需明示）／凭据实操 = 用户专属；agent 只备料。
