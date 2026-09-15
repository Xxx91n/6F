# 常驻任务书 — 轮 8（R5/R6 执行轮：阶段 3 铺开 = 扩面 → Macro-C → Micro-A → Micro-B → Macro-A）

> 生成：2026-09-15 grill 轮 7 收口整理环节。上一轮结果与权威文件指针见 .scratch/macro-audit/decision-ledger.md「轮 7 收口对账」节。
> 唯一事实源：docs/adr/0001~0018 + CONTEXT.md（56 词）+ 两本账本（.scratch/macro-audit/decision-ledger.md D-001~D-041 / .scratch/architecture-recovery/decision-ledger.md A-001~A-048）+ spec-phase-tasks.md（含 R5/R6 节）+ .scratch/architecture-recovery/BACKLOG.md（票据包 #32~#45）+ docs/versioning.md。开工前先读这些，不许凭记忆。
> 阶段 3 串行骨架（D-034）：扩面 → Macro-C → Micro-A → Micro-B → Macro-A；横切项挂触发器，非前置门禁。
> 开工纪律（D-040 锐化）：开工闸门 = DoR（依赖闭合即可拉）；波次仅作协调/验收装置。
> 上架动作未授权（D-026/D-027 用户闸门）；preview 标注诚实是决策本体（ADR-0017）。

## 任务（每项声明覆盖 D-xxx）

> **轮 8 执行进度（2026-09-16）**：T0/T1/T2/T3/T8/T9/T10 已闭环（A-037~A-048 登记 + 33-check 8/8 + 34-check 11/11 + 35-check 22/22 + 36-check 20/20 + 37-check 40/40 + 38-check 36/36；commits vrm/wns/txk + r8 栈 lro/tyt + r9 栈 ytz/kuy）。守卫首跑 ALARM 4 已全部拍板清零（P2→D-037 / B3.3→D-039 / D4→D-038，registry 三项 status=decided）。#35 经独立审计 20/20 成立、文书级返修已落地（残余 4 面裁决挂 registry manual_watch 项 codelore-residual-faces）。**#38 Macro-C preview 已闭环（第二能力层）：anysearch-cli 全链实跑 1012 facts、披露块双件、共享事实库触发 mw-trigger-b（多写者 self-probe 实测封口进入值守通道，ALARM 已登记）**。**下一可开工 = #39（Macro-B 三仓 one-shot＋jiahao 回归——mw-trigger-a 激活点）＋ #44/#45/#41a（filler 就绪即做）**；#41b 不入波次（blocked-by 用户闸门+listing-submission）。栈均未 push（用户闸门）。

- **T0 立票（先行，串行门）✅ DONE 2026-09-15**：R5 票据包展开完成。**覆盖：D-029~D-036。**
- **T1 挂门机检化（#33/R5-02）✅ DONE 2026-09-15**：guard 8/8，首跑 ALARM 4 已消化。**覆盖：D-026、D-034、D-024。**
- **T2 plugin.json 合规（#34/R5-03）✅ DONE 2026-09-15**：Agent Plugins 1.0.0 对齐＋AJV 入 guard。**覆盖：D-036、D-012 余款。**
- **T3 CodeLore 扩面首批（#35/R5-04）✅ DONE 2026-09-15（审计返修落地 2026-09-16）**：演化主干 12 面＋S3 族 6 面＋S5 族 12 面≈30 面，逐面 golden 契约测试（ADR-0014）。**关键路径，Macro-C preview 前置。覆盖：D-035、D-034。**
- **T4 版本与上游锁定制度化（#44/R6-01，新票 P0）**：① engine/upstream-lock.yaml 种子行（codelore active exact-version＋--version 契约／scorecard+repomix planned／sqlite-dump evaluating）；② README §3 上游表状态列绑锁表为机读权威；③ 守卫族——版本断言 job（实际 --version==锁表）＋锁表新鲜度＋三处 preview 标注同源＋编年指针校验（引用 ADR 存在且非 superseded/里程碑单调/双账互指），advisory→enforce 两段式；④ docs/versioning.md 已成文（本环节），本票按文落实物。**覆盖：D-037、D-039。**
- **T5 演示入口（#45/R6-02，新票）**：fixture 生成器＋fixtures/definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋fixtures/golden/＋demo --scenario 命令（临时目录生成、跑完即弃）＋CASRAI 式机器可读披露块（与 D-037② 报告头字段同一契约面，禁止两处手抄）。demo 走同一 Repo Intake 本地路径（D-013）。**#43 前置；阶段 3 早期。覆盖：D-038。**
- **T6 分发收尾·仓内文档面（#41a/R6-03，filler 优先级）**：① examples/first-report/ 复制四件＋披露 README；② README 能力边界＋preview 标注＋0.x 语义＋「Try on a real repository」节（opt-in 公共小仓链接＋「外部内容随上游变化」标注）；③ 仓根 CHANGELOG.md 编年首条落盘（M-xxx 键，区间写时从实物读出）；DoD 护栏=边界文案以冻结决策为唯一事实源，扩面变更走文案 update 子项。**就绪即做不占关键路径；受 #44 指针守卫覆盖。覆盖：D-030、D-031、D-032、D-038、D-039、D-040。**
- **T7 挂门守卫扩展（#33 扩展子项/R6-05）**：registry watch 三态 schema 齐备化（manual_watch 五要素：标记/责任人/复审时点/验证方法/确认留痕）＋守卫扫 manual_watch「复审逾期 or 确认记录缺失」＋逾期转 risk_accepted 候选报警＋每次运行输出 event_bound/total 覆盖率＋确认动作留痕（判据版本/判定人/理由/时间戳）。**覆盖：D-041。**
- **T8 LLM 面独立票（#36/R5-05）✅ DONE 2026-09-16**：explain 族 env 门控＋成本验收面——实物枚举修正（analyze 枚举 explain-*=0；LLM 面=explain --llm/diff --llm/mcp explain_file），env 五变量契约+门控判读+llm_cost 计量+超限降级；契约测试 25/25 两形态；36-check.mjs PASS 20/20。**覆盖：D-035。**
- **T9 试点面可用性审计（#37/R5-06）✅ DONE 2026-09-16**：三仓实测脚本→层×仓 capacity 矩阵（37-check 40/40；D-033 对照 2 一致 2 出入呈报）。**覆盖：D-033。**
- **T10 Macro-C preview（#38/R5-07）✅ DONE 2026-09-16**：anysearch-cli 校准全链实跑（codelore 30/30+ADR 65+supersede 8 边↔37 一致+llm_gated 降级披露）＋preview_disclosure 披露块双件（happy+failure）＋共享事实库（Macro-B 228+Macro-C 1012 → mw-trigger-b 触发登记）；38-check 36/36。**覆盖：D-034、D-032、D-033。**
- **T11 Macro-B 三仓 one-shot＋jiahao 回归（#39/R5-08）**：接入 CI 即触发 mw-regression-ci 事件（D-034④a）。**覆盖：D-033、D-034、D-024。**
- **T12 非自有仓泛化验证（#40/R5-09）**：≥1 非自有公开仓 URL opt-in——落地即触发 first-external-repo 事件（registry 新增位，解 desk-task2/15 盯梢）。**覆盖：D-033、D-013。**
- **T13 上游队列值守（#42/R5-11）**：Scorecard/repomix 探针拉动；sqlite dump 对照评估（采纳另立 ADR）。**覆盖：D-023、D-034、D-035。**
- **T14 样例 golden CI（#43/R5-12）**：CI 重渲染 fixture diff；消费 #45 definitions（前置 #45 落盘）。**覆盖：D-030。**
- **T15 分发收尾·上架面（#41b/R6-04）**：listing 资产＋marketplace 字段查证（preview 字段＋版本元数据 schema 缺口＋竞品扫描）＋凭据申请。**blocked-by 用户闸门明示＋listing-submission；不排程不入波次不占 WIP。覆盖：D-031、D-037、D-026、D-027。**

## 纪律规则（不可协商）

1. 【防丢】每个用户确认的实质结论当场追加 decision-ledger.md；任何压缩/compact/handoff 前先确认账本已落盘到最新。
2. 【数据源】整理的唯一数据源 = 账本；认为存在但账本没有的结论 → 列出并停下问，不许直接写进文档。
3. 【对账闸】整理环节 = 枚举 current → 逐条去向 → 无去向清单非空即停。
4. 【冲突协议】调研结论与 current 决策冲突 → 禁止静默改向：对应 D-xxx 标 revised（保留原记录）+ 新 D-xxx 呈报等拍板。
5. 【VCS】$but 全程；push/land/上架属用户闸门；本轮例外只在用户明示时。构建/测试一律 CI，本机仅轻量 node 断言（守卫脚本模式：reports/NN-check.mjs + exit 0 + PASS/FAIL）。
6. 【原子性】票产物落 reports/、守卫随票；账本行状态由执行窗口写、收口窗口复核核实。
7. 【preview 诚实】降级披露机制（⚠ unverified / ⚠ 数据未接 / capability N of 5 / synthetic fixture）为对外承诺载体；禁止为撑首发补齐未验证 scale 的展示面（ADR-0017）。
8. 【触发器纪律】挂门项既不作铺开期前置门禁，亦不无限拖——触发即实测封口（Trigger-gated Closure）；manual_watch 逾期转 risk_accepted 候选（D-041）。
9. 【锁定纪律】上游版本一律经 upstream-lock.yaml 登记，禁 range/浮动 tag，更新走手动窗口＋golden 回归（D-037）。

## Suggested skills

- $but —— 版本控制（立分支/commit；land+push 需用户明示）
- $to-spec / $to-tickets —— 新票（#44/#45/#41a/#33-ext）立票链
- $implement —— 票执行（drives tdd at pre-agreed seams，收口 code-review）
- $atomcode-research —— 票内调研（串行单发、-p 只放问题、timeout 600000）
- $domain-modeling —— 新术语/ADR 锐化（CONTEXT.md 只放词汇，实现决策进 docs/adr/）
- $grill-with-docs —— 若票执行暴露与 current 决策冲突需重新下探时
- $readme-crafter-skill —— #41a README/编年/披露页写作
- $handoff / $neat-freak —— 轮 8 收口归档与知识治理
