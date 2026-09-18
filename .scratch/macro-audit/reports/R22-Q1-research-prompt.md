# R22-Q1 atomcode 调研题面——册外陈旧断言批量处置与 cap 满机制缺口

## 问题

本仓 known-failures 清单制（D-071 落地：stale-assertions.json cap=10＋xfail-run.mjs 严格三态 PASS/FAIL/XFAIL/XPASS＋断言照跑＋33-check 元校验 enforce）运行首轮即撞「cap 满即无处可去」：

- 清单 10/10 已满（41a×4/43×1/45×2/50×2/t8×1），entries>cap→FAIL 拦新增注册；
- 册外实测 **13 件**陈旧断言分布三守卫：38×2／39×10／40×1——均为 R5 期「接入时点验收守卫」（#38 Macro-C preview／#39 三仓 one-shot／#40 非自有仓 URL opt-in），milestone 早已完成、fired 记录属不可变历史（D-044），FAIL 主因=世界向前（D-046 撤 jiahao workflow／next-round.md 换代锚点／邻仓被并行 agent 弄脏）而非契约破坏；
- 册外件无逐条 review_anchor/expires_fallback、无独立批量处置立票行；D-071⑨ 预留的 xfail-second-track-trigger（manual_watch, stage3-close）触发条件=「条目触 cap 或连续 2 复审锚无变化」——cap 已满=条件实已命中；
- 病灶分层：①验收探针漂移（时点事件不可回移→XPASS 自清信号无意义，与 D-071「断言照跑」的活契约前提不同失效类）；②活契约漂移（同型可入册但无 headroom）；③环境敏感腿（38:H4/39:I1-I3「sibling 仓工作树零写入」类断言对并行 agent 环境零免疫）。

该立什么批量处置机制？

## 候选

(a) 提前触发 second-track＋三向分拣批量票：触发器认定 fired；逐条归因分拣——验收探针面封存（fired attestation 固化留档＋断言改写时点快照/结构不变量＋守卫转 sealed 态）／活契约面逐条入册（腾位后 headroom 内）／环境敏感腿另题处置；cap=10 不动；
(b) 批量桶条目扩容：清单 schema 加 group entry（一条=一族＋逐条锚点附件，cap 按条目计）；
(c) cap 上调＋全量入册（13 件补锚点入册 cap→~23）；
(d) 激进删除：验收面断言判「使命完成」整面移除；
(e) 缓挂等 stage3-close 锚自然到。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-072，重点 **D-071 清单制本体**／D-068 baseline 机制／D-070 顺带清分流／D-041 watch 三态／D-063 有实证即裁决／D-055 先例注记／D-044 不可变历史／D-046 撤除先例／D-037 版本纪律）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0013 三层验收闸门／0017 preview 分级／0019 SWMR）；
3. CONTEXT.md 词条：D:\Aworker\6F\CONTEXT.md（Trigger-gated Closure／Watch Tri-state／Self-probe／Acceptance Gate／Dual Reporting）；
4. 执行账先例：D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md（A-071 #63 落地留痕）；
5. 实物：D:\Aworker\6F\.scratch\architecture-recovery\reports\stale-assertions.json＋xfail-run.mjs＋38/39/40-check.mjs＋D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-audit-report.md（§3 册外归因＋§六返工要求第 8 项）；
6. **工业界成熟心智模型（重点）**：验收测试生命周期与退役纪律（ATDD/BDD living documentation 的契约文档 vs 时点探针分野）、Fit/FitNesse 历史教训、测试封存/归档实践（test attestation/audit trail 不可变留档）、pytest xfail 配额与 expire 治理、Chromium TestExpectations expiration 字段、大型 monorepo 测试墓穴治理（Google「delete flaky tests」Trunk 原则 vs 封存）、golden/snapshot 的基线化退出（insta pending-snap、jest obsolete snapshot 清理）、contract testing（Pact）中「契约 vs 时点验证」的语义分界、CI 守卫脚本的使命完成判据（done-ness criteria）、测试资产减值（test asset depreciation）心智模型；
7. 给出推荐与理由＋失败模式＋落地形态（封存态的守卫输出语义？attestation 留档格式？分拣判据的可机械化程度？sealed 守卫与 xfail-run/33-check 的接口面？）；
8. 显式核查与本仓 current 决策的冲突面（特别是：D-071③「断言照跑不转 archived」是否被「验收探针封存」隐性破例——封存 vs archived 的语义分界；D-044 不可变历史与断言移除的张力；触发器提前触发 vs manual_watch 期序纪律）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
