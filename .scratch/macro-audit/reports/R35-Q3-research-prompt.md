# R35-Q3 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品。仓内有自建 XFAIL 治理体系：.scratch/architecture-recovery/reports/stale-assertions.json（cap=10 清单制，D-071 立法 pytest strict-xfail 心智模型；D-073 cap 满三向分拣＋sealed 封存；D-074 环境敏感腿处置；D-102 摘除人工裁决）。另有 D-142 立法的外部评审摄入三档分诊规程（AGENTS.md 明文）：钉评审快照 SHA＋逐条对照当前 HEAD——「快照属实/现状已修」不进裁定链（去向表照登）／仍开放→裁定链／无法核实→pending+复审时点。

## 问题

第四轮外部锐评（快照=当前 HEAD 68db5ad）§4-3 呈报「XFAIL 清单 cap=10 已填满 10 条、再多一个守卫失效就瞬间熔断、卡着配额过日子、摘除已修复条目塞新失败」。

对照实况：**锐评快照时点即失实**——stale-assertions.json entries=[]（0/10）。meta 节记叙了 2026-09-18 的 10/10 饱和史（第 10 条恰满 cap→D-073 触发→三向分拣→sealed 11 件→降至 8）与 2026-09-22 的批摘史（六条批摘+xfail-45-h5+xfail-45-b5 摘除清零，摘除条目挂「人工裁决明文候选待 D-102① 追认」）。锐评读了 meta 历史叙述未看 entries 实况——「卡着配额过日子」描述的是已结束的 9-18 时点状态。机制实史全链路：10/10 熔断→触发器 fired→立票批量处置→腾位→清零，压力阀按设计工作。

本件真正裁面：锐评首次实例化了 D-142 三档分诊未覆盖的第四摄入态——**「快照时点即不属实（可核实且证伪）」**。三档语义边界：「快照属实/现状已修」=真+已修、「仍开放」=真+开放、「无法核实→pending」=查不清；本案=查清了且证伪（误读 meta 历史当现状），不属任何一档——本轮靠执行者自觉拦截未进裁定链。

候选处置：
(a) 勘误登记＋D-142 补第四档——收口节勘误行如实记「cap 10/10 呈报快照时点即失实（entries=0/10），系读 meta 历史叙述未核 entries 实况」＋AGENTS.md 摄入行扩半句「可核实且证伪→标『快照不属实』如实驳回不进裁定链（去向表照登）」；
(b) 仅勘误不补规程——误读属个案，证伪驳回按常识办（但本轮拦它就是靠自觉，D-142 立法动机恰是消自觉依赖）；
(c) 机制层回看 cap/摘除规程——D-073 已裁不翻，批摘待 D-102① 追认已在任务书 T3（机制面无裁只登记）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-142 摄入三档分诊原文与边界、D-071 全条款、D-073 cap 满分拣/sealed、D-074、D-094、D-102① 摘除追认、D-075 受理三要素、D-076 批评去向表/全留痕、D-139 correction 文法、D-041 复审逾期、D-129 收口注记先例），docs/adr/（重点 0013 三层验收、0018 版本编年、0022 Quarantine），CONTEXT.md（重点 评审快照分诊/Watch Tri-state/Dual Reporting/Known-gaps 台账/Trigger-gated Closure）；
2. 工业界成熟落地的心智模型（重点）：外部评审/安全报告/审计意见摄入的「证伪态」处置惯例——bug tracker resolution 分类学中 NOTABUG/INVALID/WORKSFORME 的语义边界（Bugzilla/Jira/GitHub triage 状态机，误报与无法复现如何分档）、协调披露（coordinated vulnerability disclosure）对「报告前提即错误」的处置先例、审计意见书的 management representation letter 机制中对「事实性异议」的回应文书形态、RFC/标准勘误流程中对「erratum 本身错误」的 reject-verified 态（IETF errata Verified/Rejected/Held for Document Update 三态）、学术同行评审 rebuttal 中对事实错误的处置规范、「善意误报仍应留痕可回溯」与「证伪驳回应显式不立案」的张力处置；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
