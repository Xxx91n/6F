# R32-Q1 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB 存储 + quarantine 引擎）。

## 问题

engine/src/fact/store.ts 的 classifyWriteError 用 IO_ERROR_RE 把写错误二分：命中 IO 类→'io'，否则一律→'constraint'。engine/src/audit/file-card.ts 的 lazy 补采写循环（runInTransaction 包裹，F3 返修已补事务）对每条 appendFact 失败做：classifyWriteError(e) !== 'constraint' 才上抛——即所有 constraint 类错误一律静默跳过。代码注释自述意图仅是「fact_id 撞 UNIQUE=幂等跳过」，但实现吞掉的面包围整个非 IO 错误空间（schema 违例/类型错/NOT NULL 违例等）。后果：非 IO 写错被吞后事务仍 COMMIT，残观测集静默上桌（审计窗毒事实验已实证：注入非 IO 错误→好行已落库）。这与 Hub-of-Facts append-only 完整性叙事有张力。

候选处置：
(a) 吞错收窄到仅 fact_id UNIQUE 撞键（错误消息模式匹配），其余 constraint 类上抛→回滚；
(b) 明示容忍登记为已裁残余风险+挂触发器；
(c) 并入后续票据顺手修。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 中全部 current 记录（重点 D-103~D-120 quarantine 引擎系、D-115③ 错误码分流、D-122③ 事务括注、D-106 quarantine_log 载体）、docs/adr/ 全部 ADR（重点 0022-quarantine-engine、0023-micro-b）、CONTEXT.md 全部词条；
2. 工业界成熟落地的心智模型（重点）：幂等写与重试的错误分类惯例（transient vs permanent vs idempotent-skip）、append-only/event-sourced 存储的部分写与事务语义、SQLite/DuckDB 约束错误处理惯例、吞错 vs fail-fast 的边界判据、「静默跳过」在审计/合规语境下的可接受性；
3. 给出推荐与理由，并显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
