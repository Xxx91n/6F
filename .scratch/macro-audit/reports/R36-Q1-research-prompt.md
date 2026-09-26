# R36-Q1 调研题面（atomcode）

仓库 D:AworkerF 是 spec-level 工程内容审计产品（TypeScript engine + DuckDB facts）。刚完成 R35 收口（第四轮锐评三税全裁：D-144 复绿税/D-145 bundle 税/D-146 XFAIL 勘误）＋R36 T1（D-147 as-cast 返工已落码验收）＋T2（#80 步③血缘缝合＋LOOP 复审 PASS）。

## 问题

对 R35 锐评做核销复核后，裁定面实况：锐评文本面零残余裁面（三税全裁，唯一未完成=D-144② 41a-D7 结构不变量改写属执行排程非裁定面）。但辩证核查捞出两类「锐评后新生」开放面，本轮 grill 射程待裁：

面一（R1/R2 判断项，R36 审计窗产出、从未裁过）：
- R1：`lineageEdgeCapHit` 仅经非空 lineage 块披露——subject 无边＋祖先边池触帽时卡面仍 `lineage:null`，帽事件该卡不可见（病态角非硬错）；
- R2：peer 去重仅一跳；renamed_to 多 to-竞争边取首匹配（票面带病边界，返工批注明不修）。

面二（M-015 事件）：D-144① 「账行增量↔编年随行核对」checklist 行落盘的 r35-closeout commit（db40c8f）自身漏编年触红 41a-D7（第三次实证复绿税：r32-t0/r35-t0/r36 三例），1714e8b 补录 M-015 修复。暴露「规程生效时点」语义空白——checklist 对其自身落盘 commit 是否适用？

候选处置：
(a) 窄射程——锐评面核销呈报＋M-015 作第三实证注记登记（registry confirmations+1）＋R1/R2 挂回任务书 T 队列待专窗裁；
(b) 中射程——(a)＋本轮裁定 R1/R2（审计窗判断项顺手归零，呈报面清零）；
(c) 宽射程——(b)＋M-015 升格裁（为「规程生效时点=自落盘 commit 起算 vs 落盘 commit 豁免」立一句话规约）。

## 调研要求

1. 回顾 D:AworkerF.scratchmacro-auditdecision-ledger.md 全部 current 记录（重点 D-144 复绿税双层组合①~④、D-146 四档摄入分诊、D-142② Watch Tri-state 边界、D-135 票面纪律、D-070 随触碰顺带边界注记、D-071④/D-073 XFAIL cap+分拣建制、D-139 独立 commit 纪律、D-102① 追认惯例、Trigger-gated Closure 规程、审计窗呈报→判断项的既有处置先例），docs/adr/（0013 三层验收、0017 preview、0018 编年纪律、0022 Quarantine、0023 Micro-B），CONTEXT.md（评审快照分诊、Watch Tri-state、Suppressed Facets、File Lineage、Observation Set）；
2. 工业界成熟落地的心智模型（重点）：审计/评审中「病理角 deferred judgment item」的处置惯例（wontfix vs backlog severity 分诊、accepted-risk 文书形态、deferred defect 的复审时点约定——何时必须当场裁何时可排队）、规程立法的「生效时点」语义（policy effective date/溯及力惯例、立法 commit 自身适用性的业界处置——lint 规则启用豁免期/grandfather clause/生效即全覆盖先例）、评审核销报告（disposition table）的成熟形态、误报/证伪呈报的 errata 文书惯例（IETF errata Rejected/Bugzilla INVALID 类比延伸）；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
