# R56-Q8 调研题面 —— stale_data_marker 四态 ↔ drift 三态枚举映射裁定

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale）。R56 已裁 D-203~D-208。本题为 B4 收尾——D-207 指定 #9 对账票内唯一裁定件=枚举映射。

两套枚举实测（不同语义域）：
- stale_data_marker（architecture-recovery 账本 A-009 current，报告级 C1 强制字段）：四态 fresh/warn/stale/unknown=**读模型滞后 SLA 判级**（时间-政策量：lag_seconds vs sla_seconds 阈值分档；warn=滞后但未超阈、stale=超阈、unknown=探测不可得 fail-closed）
- drift（engine/src/fact/file-card.ts，D-126 照答不拒答）：三态 fresh/behind/unknown=**事实快照与 HEAD 位置对照**（位置量：observed_head_sha vs current_head_sha 等值比较，无阈值无政策）
- 关联面：intake snapshot_fetched_at+cache_hit/refreshed 披露（D-059⑦）；报告 C1 同层另有 read_model_lag_seconds/staleness_sla_seconds 数值字段

语义域划分实证：fresh 仓也可 lag 超 SLA（位置与滞后正交——快照在 HEAD 但投影跑慢）；behind 仓也可能 lag 达标（HEAD 前移但读模型跟上）。两枚举测不同物。

已裁约束（current）：A-009 SLA 全数字表+四态枚举+T1-T5 触发规则+T5 fail-closed unknown／D-126 drift 三态照答不拒答／D-059⑦ snapshot 时点披露／D-205 分层分工（测量/归因各挂语义域标签先例——本题为其同型应用位）／ADR-0024 判据在消费位。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；architecture-recovery 账本=D:/Aworker/6F/.scratch/architecture-recovery/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选

- **(i) 双枚举保留各语义域**：marker=报告级 SLA 判级面、drift=file-card 位置对照面；对账票内成文「两枚举语义域不同不互映射」一行（fresh 两域同义巧合非设计；warn↔behind 无映射关系）
- **(ii) warn→behind 合并映射**：硬统一三态——behind 顶替 warn 位；词义通胀风险（位置语义借去表政策判级），且「在 HEAD 之后」≠「滞后未超阈」语义错位
- **(iii) 全统一四态**：drift 升四态加 warn 位——位置对照被迫背 SLA 判级语义，D-126 三态简洁稀释

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 A-009 四态定义原文、D-126 三态原文、D-205 语义域标签先例射程；
2. **工业界心智模型为重点**：状态枚举的语义域纪律——同名词不同义（homonym enum）治理先例（DB 设计 status 字段多义事故文献、API 设计 state vs status 分离惯例）；位置量 vs 政策量分层（CQRS 投影 position vs freshness SLO；K8s conditions ObservedGeneration vs Ready 分层=「观察到第几代」与「是否就绪」正交先例——正是本同型）；枚举合并的失败模式（HTTP status 语义过载批评、git status 码表）；「滞后」与「过期」的语义区分（stale vs lagging vs behind 在分布式文献中的用词惯例）；
3. 辩证要求：逐候选给支持与反对论据；双枚举保留的阅读者混淆风险（用户在报告见 marker=warn 又在 file-card 见 drift=behind 是否真会误读——代价对称性须正面展开）；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
