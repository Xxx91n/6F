# R34-Q3 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表；决策账本 decision-ledger.md 139+ 条 D 记录；preview 0.x）。

## 问题

第三轮外部锐评（评审方快照区间=commit 12e2a49→44cc2a4/Round31 已自报）到达时主线已推进至 811d930——锐评呈报的「O2 golden FAIL（quarantine normalized 计数泄漏 git 方言）」缺陷在快照时属实，但已被后续修复（#81 边界吸收器：stats 桶收窄+吸收事件独立披露面）——评审滞后导致**已修缺陷被当开放问题呈报**。本会摄入侧自发执行了「逐条对照当前 HEAD 分诊」拦下误报，但该纪律未成文——账本已有惯例=D-076 批评→触发器映射＋锐评去向表、历轮锐评对照窗，均是对照现状做的实践但未见诸规则文件。

候选处置：
(a) 不立规约——摄入分诊纪律已隐含在历轮惯例；
(b) AGENTS.md 补一行摄入规程——「外部评审/锐评摄入=先钉评审快照 SHA＋逐条对照当前 HEAD 现状分诊：快照属实已修项标『快照属实/现状已修』不立案，快照属实仍开放项进裁定链，快照未核实项标 pending」；
(c) 对外立规要求评审方提交前重拉 HEAD——外部行为不可立法约束。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-076 批评→触发器映射与锐评去向表、D-130 锐评定性「三分实七分虚」、D-139 轻规约文法、D-138 如实登记、历轮锐评对照窗惯例、Dual Reporting 勘误纪律）、docs/adr/ 全部 ADR（重点 0017 preview/0018 编年纪律/0013 验收闸门）、CONTEXT.md 全部词条（重点 Watch Tri-state/Dual Reporting/Trigger-gated Closure/Known-gaps）；
2. 工业界成熟落地的心智模型（重点）：外部缺陷报告/安全披露的摄入分诊惯例——triage 规程对「报告基于过时版本」的处置（Apache/Chrome 安全团队的 version-check 先行惯例、CVE 评分的 affected-version 字段、GitHub Security Advisory 的受影响版本区间字段）、issue tracker 的「fixed in newer version」标签惯例（GitLab/kde/bugzilla 的 RESOLVED FIXED vs OBSOLETE 分类）、审计行业的 review-cutoff 与 subsequent-events 惯例（审计基准日 vs 报告日之间的期后事项处理——PCAOB AS 2801 subsequent events）、研究领域的 reproducibility/version-pin 惯例（artifact evaluation 的 commit-pin 要求）、「报告方钉快照 vs 接收方对照现状」职责分工的成熟边界；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
