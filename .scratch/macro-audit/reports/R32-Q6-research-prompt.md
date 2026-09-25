# R32-Q6 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB 存储 + Micro-B 文件级审计卡三层契约）。本仓执行窗/审计窗分离的双 Agent 工作流：执行窗落栈、审计窗亲跑复现+呈报违规但不替执行窗追认。

## 问题

R32 审计 §6 呈报四项过程违规（语义差集经深比对证清白，但过程层违「diff 小、可审」约定）：
- V1：33-gate-registry.json 全文件重缩进 1sp→4sp（1459 行全变）搭车一个 +1 事件的语义提交——审计深比对证实 events 纯增无删改/items 54=54/meta 同，但 diff 可审性差且丢文件尾行；栈已 land 上游不可回退（改写历史禁区）。
- V2：44-check G6 断言放宽（去 T1 行锚）后断言名仍写「T1 行含 #77」——名实不符；放宽本身在 commit 已声明属任务书换代容忍，定性合法但标签未同步。已更正。
- V3：执行报告把 78-check C1 断言更新归为「合法文档漂移」——实系 #81 接线变更的断言跟进，报告定性口径小误。已更正。
- V4：package.json 丢尾行（同 V1 一族卫生回退）。已更正。

候选处置：
(a) 登记追认即止——违规事实+更正结果如实入账本收口节，V1 载「不可回退」，不立新规则；
(b) 登记＋立轻规约——追认同上＋AGENTS.md/票面模板补显式负向行「格式化-only 变更禁搭车语义提交，须独立 format commit 先行」；
(c) 守卫化——CI/guard 加 diff 噪声断言（JSON 语义等价但字节大差检测等）；
(d) 只登记不追认。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-018 版本纪律/编年、D-130 仓务规约先例、D-133 票据粒度、D-135 修批、以及任何涉及「diff 可审性/格式化搭车/尾行/提交卫生」的既有约定）、docs/adr/ 全部 ADR（重点 0018 版本编年纪律）、CONTEXT.md 全部词条、AGENTS.md 既有约定面；
2. 工业界成熟落地的心智模型（重点）：「format-only commit 与语义 commit 分离」的成熟惯例（git 社区代码风格提交纪律、large-scale refactoring 分票惯例如 「机械变更先行票」、prettier/clang-format 引入时的独立提交惯例）、.gitattributes/.editorconfig/CI lint 对尾行与文件格式的强制惯例、「审计/复核窗呈报过程违规后的追认（ratification）」在合规/内控语境的处置（finding→corrective action→closure 的成熟流程）、diff 噪声对评审有效性的实证影响（review fatigue/信噪比文献）；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
