# R40-Q4 调研题面（atomcode -p 直贴）

## 调研问题

仓内 60 件自研 check 守卫的「退役机制」——判定何时可将一件守卫移出运行集及其处置形态——在成熟测试治理中对应什么心智模型？

背景：Apache-2.0 仓（.scratch 随仓公开）60 件 check 守卫（5808 行 / ~1183 t() 断言）分两类画像：
- 阶段件：票面带 D/A/稿-轮标记（23 首报全链、26 量测审计、29 T4 裁定原文、37 三仓实测、39 Macro-B one-shot、46 回归 CI 迁回、64 duckdb 自愈、71/72 接线票、82 仓务增量批、83 审计修批……）——守护对象多为冻结工件/轮次性收口成果
- 契约件：常驻机制守卫（33 挂门三字段、34 plugin.json 结构、41a 文档面、44 版本上游锁定、70 vacuous 恒真族、75a 三分类建制、78 quarantine 闸、80 Micro-B 面、81 方言归一……）

外部锐评指控「守卫面成本倒挂：断言量超工程源码」（数字面已勘误为 5808 行/58 组），处方「断言裁军、阶段守卫批量归档」。已裁入门条件：裁军诉求显式驳回（D-144 税保留——两次实证真漏录 M-013/M-009），残余只裁「era-scoped 退役机制扩展」（D-149 manifest 已立法形态=唯一合法出口）。

关键证据（仓内一手）：
1. R37 全量画像：12 件静默红全过 D-094 门——11 改断言＋1 入册——红的全是「钉住对象合法演化→改断言」，无一件因守卫已死退役
2. 守护面消亡先例：repomix 已退役（守护面随票消亡）但守卫退役处置当时未建制化
3. 批内先例：39-check 的 F1/F3 断言级 superseded 留批注——断言可随结构收敛退场但文件不删
4. T3 读数：8 件技术债全=triaged（卫生债非体量债）
5. check-kit 无退役原语——处置形态须新建

候选（我倾向 (i)）：
(i) 面消亡判据＋manifest 退役类：守卫仅当守护面本身消亡（对象移除/被上层机制吸收）可退役；处置=移出运行集＋manifest 'retired' 类留档（历史可查非删除）；提案通道=T3 审计窗逐件呈报；元数据并入 tier 自声明（每件守卫声明 protected_surface+tier，面消亡可机检）
(ii) 不立机制：D-149 manifest+D-159 tier 自足；退役走个案裁定链
(iii) 判据放宽：「零 FAIL 历史∧守护面稳定 N 窗」可退役（纯成本导向——疑撞 R23 恒真纪律：零 FAIL≠无用）

## 必回顾
- D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-144 税保留+两次实证漏录、D-148 R35 锐评三税已裁毕、D-149 manifest/era-scoped/静默红、D-102 可杀性、R23 恒真纪律〔D-076③/D-079〕、D-141/VACUOUS 判据、D-159 tier 自声明+env-contract 档、D-157 C2 入门条件）
- D:\Aworker\6F\docs\adr 全部 24 件
- D:\Aworker\6F\CONTEXT.md 全部词条（Golden 锁面自声明、Instrument Dialect、Quarantine、Accepted Risk、Suppress 面）
- 工业界心智模型（重点）：测试退役/淘汰判据（dead test detection、test maintenance cost models、mutation-based retire criteria）；Google/Facebook monorepo 大规模测试集的 ownership/deprecation 治理；pytest/Go/Jest 的 collect-ignore/skip-if-dead-fixture 先例；「守护对象消亡」vs「断言失效」的退役语义区分；archive-out-of-runset 与 deleted 的考古面保留判例；SMURF/maintenance-cost 模型在「保留 vs 退役」取舍中的权重证据

要求：每候选给工业界支持度与仓内账本冲突点；给出推荐与理由；explicit 列出与 current D-xxx 的任何冲突（修订协议要求呈报）。
