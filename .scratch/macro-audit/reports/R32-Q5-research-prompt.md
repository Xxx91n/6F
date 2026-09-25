# R32-Q5 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB 存储 + Micro-B 文件级审计卡三层契约）。

## 问题

R32 修复窗落地 #81「quarantine 方言归一缺陷修」（D-128）：git <2.45 对 UTC 偏移提交吐 '+00:00'、≥2.45 吐 'Z'——同一 commit object 跨版本字面漂移会在 golden 文件造成假差集；修法=边界吸收器归一 '+00:00'→'Z'（摄入时归一＋吸收事件留痕披露）。D-128⑤ 要求「golden 一次性再生」以消除存量 golden 中可能混入的非 Z 字面。

现状：本宿主 git 方言本即 Z，golden 再生零差集——「golden 跨宿主稳定」声明在本仓库内不可证伪（无差集工件可留）。机制层证据已足：dialect-boundary.test.mjs 用 gitRunner 注入缝喂合成 +00:00/Z 双语料，断言 fieldStats 逐字节一致＋吸收事件 4/0 分列——归一确定性已被合成证据覆盖，缺的只是真实非 Z 宿主上的再生差集工件。

候选处置：
(a) 如实登记＋条件触发器——账本/报告登记「不可仓内证伪」＋33-gate-registry.json 挂事件绑定触发项（「首遇非 Z 方言宿主→golden 再生＋差集工件留证」，照 82-first-external-contributor event_bound 先例带 owner/verification/confirmation 字段）；
(b) 补跨宿主 CI 矩阵腿——CI 加 git<2.45 环境腿产出真差集工件；
(c) 降声明措辞——「跨宿主稳定」从已验证降为设计目标；
(d) 不登记不动。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-128 方言归一/golden 再生义务、D-129~D-133 票据与触发器先例、D-122 披露四件、D-126 at:sha pin、D-059 git-cli 输出契约、D-130 first-external-contributor 触发器立法、D-127/D-132 golden 锁面分层、D-025 双读数纪律）、docs/adr/ 全部 ADR（重点 0009 本地优先/0014 防腐层/0022 quarantine/0023 micro-b）、CONTEXT.md 全部词条（重点 Trigger Sequence/Trigger-gated Closure/Watch Tri-state/Known-gaps/Instrument Dialect/Golden 锁面/Demo Fixture）；
2. 工业界成熟落地的心智模型（重点）：环境依赖型断言的成熟处置——「本环境不可观测的验证义务」如何登记与闭合（conditional/ opportunistic testing、environment-matrix 成本判据、known-limitation 披露惯例、feature-flag/canary 式事件触发验证）、golden/snapshot 测试跨环境稳定性的工业做法（insta/Jest snapshot 的环境确定性要求、LLVM 跨平台 FileCheck 惯例）、审计/合规语境下「不可证伪声明」的披露标准（PCAOB/审计证据充分适当性）；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
