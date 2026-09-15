# 常驻任务书 — 轮 7（R5 执行轮：阶段 3 铺开 = 扩面 → Macro-C → Micro-A → Micro-B → Macro-A）

> 生成：2026-09-15 grill 轮 6 收口整理环节。上一轮结果与权威文件指针见 .scratch/macro-audit/decision-ledger.md「轮 6 收口对账」节与 .scratch/architecture-recovery/handoffs/closeout-2026-09-15.md（R4 收口，仍有效）。
> 唯一事实源：docs/adr/0001~0017 + CONTEXT.md（54 词）+ 两本账本（.scratch/macro-audit/decision-ledger.md D-001~D-036 / .scratch/architecture-recovery/decision-ledger.md A-001~A-048）+ spec-phase-tasks.md（含 R5 节）+ .scratch/architecture-recovery/BACKLOG.md（阶段 3 票据包 #32~#43）。开工前先读这些，不许凭记忆。
> 阶段 3 串行骨架（D-034）：扩面 → Macro-C → Micro-A → Micro-B → Macro-A；横切项挂触发器，非前置门禁。
> 上架动作未授权（D-026/D-027 用户闸门）；preview 标注诚实是决策本体（ADR-0017）。

## 任务（每项声明覆盖 D-xxx）

> **轮 7 执行进度（2026-09-15 窗口 1）**：T0/T1/T2 已闭环——账本 A-037~A-048 登记（注：任务书原文「A-031 起」系过期口径，R4 已占用，按账本实物续 A-037）+ spec.md §R5-D1~12 + 12 三件套 + README 波次表 W12~W15（commit `vrm`@r5-t0-ticket-pack）；#33 守卫 `33-check.mjs` PASS 8/8 exit 0（commit `wns`@33-gate-watch-guard）首跑报警 ALARM 4（**P2 数值化承诺双结题到期未拍 / B3.3 CHANGELOG 开工门已触发 / D4 演示入口开工门已触发**——按值守规则待用户拍板）/WARN 2/BOUND 2；#34 plugin.json 已合 Agent Plugins 1.0.0（ajv valid，守卫 34-check.mjs PASS 11/11，commit `txk`@34-plugin-json-compliance）。**下一可开工 = #35（W12 余票，阶段 3 阻塞链关键路径）**；#36/#37/#41 待 #35 闭环后解锁。三栈均未 push（用户闸门）。


- **T0 立票（先行，串行门）✅ DONE 2026-09-15**：按 $to-spec / $to-tickets 把 BACKLOG #32~#43 / spec-phase-tasks R5-01~12 展开为 architecture-recovery 账本 A-031 起 + issues/handoffs/prompts（NN-slug ≤60 行硬规则 + 「## 收尾」段首黑体硬要求块 per WORKFLOW §4.2.6-6）+ README 波次表排程。次序 = #33 最优先 → #34/#35 并行首票 → #36/#37 → #38 → 其余随层序。**覆盖：D-029、D-030、D-031、D-032、D-033、D-034、D-035、D-036。**
- **T1 T7 挂门机检化（#33/R5-02，阶段 3 最优先）✅ DONE 2026-09-15**：guard 脚本统一扫描全部挂门项三字段（最迟拍板时点 / 触发事件 / 复审时点）到期报警——覆盖 25-checklist 挂门行、账本两字段登记项、CodeLore 暂缓面集复审时点、多写者三触发器（Macro-B 进 CI 定时回归 / Macro-C 共用同一 DuckDB / Macro-A 启动）。**覆盖：D-026、D-034、D-024。**
- **T2 plugin.json 合规（#34/R5-03）✅ DONE 2026-09-15**：engine/plugin.json 对齐 Agent Plugins 1.0.0——补 $schema const、收敛 schemaVersion/skills/mcp 范围、extensions 改反向域名对象图；AJV 校验入 guard 族。上架硬前置。**覆盖：D-036、D-012 余款。**
- **T3 CodeLore 扩面首批（#35/R5-04）**：演化主干 12 面（revisions/abs-churn/entity-churn/author-churn/hotspot-velocity/code-age/stale-code/architecture-trend/health-trend/lead-time/release-cadence/messages）＋ S3 族 6 面（god-classes/architecture-metrics/dependency-cycles/modularity-violations/instability/architecture-roles）＋ S5 族 12 面（ownership/entity-ownership/bus-factor/main-dev 三件套/knowledge-islands/communication/coordination-needs/team-composition/marginal-owner-risk/pair-programming），逐面 golden 契约测试（ADR-0014：适配层禁业务规则、raw 语义不出适配层）。面名以 `codelore analyze --help` 实物枚举为准。**覆盖：D-035、D-034。**
- **T4 LLM 面独立票（#36/R5-05）**：explain 族 env 门控（CODELORE_LLM_*）＋成本验收面；S4 ADR 假设抽取前置；不混入 T3。**覆盖：D-035。**
- **T5 试点面可用性审计（#37/R5-06）**：三试点仓实测脚本——env-manager/anysearch-cli/jiahao 的 PR 人/机比、ADR supersede 链完整度、托管面有无；产出层×仓 capacity 矩阵。**覆盖：D-033。**
- **T6 Macro-C preview（#38/R5-07，第二能力层）**：anysearch-cli 为校准语料（56 ADR＋supersede 链）；报告强制披露「单仓校准（anysearch-cli）」结构性限制；完成定义含该层 happy+failure 演示双件（D-032 DoD 准入件）。**覆盖：D-034、D-032、D-033。**
- **T7 Macro-B 三仓 one-shot＋回归（#39/R5-08）**：Macro-B 对 env-manager/anysearch-cli/jiahao 各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI——接入即触发多写者 self-probe 实测封口（D-034④a，衔接 T1）。**覆盖：D-033、D-034、D-024。**
- **T8 非自有仓泛化验证（#40/R5-09）**：≥1 非自有公开仓经 URL opt-in（D-013 首实用户）跑通 Macro-B；Macro-B GA 前置条件。**覆盖：D-033、D-013。**
- **T9 分发收尾（#41/R5-10）**：① examples/first-report/ 复制四件＋披露 README（6F 自审真实产物声明＋生成 commit＋日期＋重生成命令）；② README/marketplace 首段能力边界＋「capability 1 of 5 · preview」标注＋0.x 语义＋changelog；③ listing 资产（未上架层「Not yet in preview」披露块＋roadmap 链接）；④ Agent Plugins preview 字段查证＋竞品占位扫描（前置子任务）；⑤ 凭据申请（D-026③ 阶段 3 开工门已触发）。**上架动作本身停用户闸门。覆盖：D-030、D-031、D-032、D-026、D-027。**
- **T10 上游队列值守（#42/R5-11）**：Scorecard/repomix 探针按层需求拉动不插队；CodeLore sqlite/parquet dump 对照评估（采纳须另立 ADR）；Macro-B preview 供应链象限维持「⚠ 数据未接」披露。**覆盖：D-023、D-034、D-035。**
- **T11 样例 golden CI（#43/R5-12）**：CI 重渲染 fixture 并 diff，不一致即 fail，更新走 PR 审查；禁自动重生成直通 main。与 T1 同批立项。**覆盖：D-030。**

## 纪律规则（不可协商）

1. 【防丢】每个用户确认的实质结论当场追加 decision-ledger.md；任何压缩/compact/handoff 前先确认账本已落盘到最新。
2. 【数据源】整理的唯一数据源 = 账本；认为存在但账本没有的结论 → 列出并停下问，不许直接写进文档。
3. 【对账闸】整理环节 = 枚举 current → 逐条去向 → 无去向清单非空即停。
4. 【冲突协议】调研结论与 current 决策冲突 → 禁止静默改向：对应 D-xxx 标 revised（保留原记录）+ 新 D-xxx 呈报等拍板。
5. 【VCS】$but 全程；push/land/上架属用户闸门；本轮例外只在用户明示时。构建/测试一律 CI，本机仅轻量 node 断言（守卫脚本模式：reports/NN-check.mjs + exit 0 + PASS/FAIL）。
6. 【原子性】票产物落 reports/、守卫随票；账本行状态由执行窗口写、收口窗口复核核实。
7. 【preview 诚实】降级披露机制（⚠ unverified / ⚠ 数据未接 / capability N of 5）为对外承诺载体；禁止为撑首发补齐未验证 scale 的展示面（ADR-0017）。
8. 【触发器纪律】挂门项既不作铺开期前置门禁，亦不无限拖——触发即实测封口（Trigger-gated Closure）。

## Suggested skills

- $but —— 版本控制（立分支/commit；land+push 需用户明示）
- $to-spec / $to-tickets —— T0 立票链
- $implement —— 票执行（drives tdd at pre-agreed seams，收口 code-review）
- $atomcode-research —— 票内调研（串行单发、-p 只放问题、timeout 600000、锚点留证；配额中断走 resume anchoring 不杀进程）
- $domain-modeling —— 新术语/ADR 锐化（CONTEXT.md 只放词汇，实现决策进 docs/adr/）
- $grill-with-docs —— 若票执行暴露与 current 决策冲突需重新下探时
- $readme-crafter-skill —— T9 上游清单/披露页写作
- $handoff / $neat-freak —— 轮 7 收口归档与知识治理
