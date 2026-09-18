# R21-Q1 atomcode 调研题面——陈旧守卫生命周期治理

## 问题

本仓守卫体系（.scratch/architecture-recovery/reports/NN-check.mjs 族，~30 件）出现「陈旧断言 FAIL 常态化」：实测 9 条 FAIL 分布 5 守卫（41a×4/43×1/45×1/50×2/t8×1），全部经归因=预存漂移非破坏（如 #52 票被拆为 #52a/#52b 后断言锚名过时、next-round.md 每轮重写致 T 序号断言过期、a_range 随账本增长）。现行纪律=冻结快照永不复写（保史证语义）＋归因移交人工值守清单＋「FAIL 不扩大」逐轮人工比对。该立什么换代机制？

## 候选

(a) known-failures 清单制：stale-assertions.json 登记（guard+断言 id+归因+review 期号），NN-check 输出三态扩为 FAIL/XFAIL/XPASS；
(b) 守卫级过期元数据：断言/守卫声明 expires/superseded-by，过期转 archived 不跑；
(c) 维持现状+归因机检强化（只升格 t8 归因清单为 33-check 单点消费的期望集，不改各 NN-check 输出态）；
(d) 复写冻结快照重基线（破史证语义）；
(e) 缓挂。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-070，重点 D-037 版本纪律／D-041 watch 三态／D-055 先例注记／D-063 有实证即裁决／D-066 守卫分层两段式／D-068 baseline 机制）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0012 三层验收闸门／0017 preview 分级）；
3. CONTEXT.md 词条：D:\Aworker\6F\CONTEXT.md；
4. 执行账先例：D:\Aworker\6F\.scratch\architecture-recovery\decision-ledger.md（A-053 registry 扩展、A-061 T8 复核归因、R14 lesson 冻结快照）；
5. 实物：D:\Aworker\6F\.scratch\architecture-recovery\reports\t8-watch-review.md（陈旧守卫归因清单）；
6. **工业界成熟心智模型（重点）**：pytest xfail(strict)/xfail_strict 配置、Chromium TestExpectations 文件、Firefox mochitest expected-fail annotations、Perl TAP TODO、.NET SkipIf/conditional skip、Rust compile-fail/known-bug 目录、golang testdata golden -update 旗标、snapshot testing 过期治理（insta/jest --ci）、CI flaky-test quarantine 制度（bazel/flaky test handler）、expected-failure 清单的 review/expire 治理（如 Chromium TestExpectations 的 expiration 字段、web-platform-tests META.yml）；
7. 给出推荐与理由＋失败模式＋落地形态（清单文件 schema？断言 id 命名规则？三态输出协议改动面？清单自身腐化治理——XPASS 自清/review 期号/数量上限）；
8. 显式核查与本仓 current 决策的冲突面（特别是「冻结快照不复写」与「守卫输入文件随轮漂移」的张力——清单制是否隐性破冻结语义？guard 输入面（BACKLOG/next-round/ledger 行）本身随轮滚动是陈旧 FAIL 的主源，治本是否应是「断言输入面快照化」而非输出态分级？）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
