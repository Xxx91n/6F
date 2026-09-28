# R44-Q1 atomcode 调研报告存档——accepted-risk 五要件结构与「关档 vs 续等实证」裁界

> 题面=reports/R44-Q1-research-prompt.md；引擎=Exa＋AnySearch（Tavily 配额超限在档注明）＋全文精读 5（sorena/cybersigmacs/defectdojo/surecloud/NIST RMF FAQ 高亮）＋官方表单件（CMS/QC-CUNY）；angle=Official/Comparative/Criticism/Currency/Community。
> **存档性质**：审计窗复跑归档（原执行窗工件缺位→O2 观察修复）；结论与 R44 执行报告自述同向零冲突。
> 以下为 ctx_batch_execute 索引输出原文归档。

---

$ atomcode -p "What is the industry-standard structure for an accepted-risk (risk acceptance) record — required fields per NIST SP 800-37, ISO 27001/27005, and common GRC practice — and is closing a known-gap item as formally-accepted-risk (with compensating controls, named approver, review hook, expiry) versus keeping it open pending direct evidence an accepted governance disposition?"

## 1) 执行摘要 (Tl;dr)

**Confidence: 高** — 五要件结构在 NIST RMF、ISO 27001/27005 与 GRC 实务三线中高度一致：**① 风险/差距精确标识（含 policy citation）② 业务理由 ③ 已验证的补偿控制 ④ 具名且有权限的批准人 ⑤ 到期/复审日**。把有补偿控制、具名审批、复审钩与到期日的已知差距关闭为 formally-accepted-risk，**是**业界标准治理处置——前提是「接受」基于当前证据与既定验收判据；续等直接证据但无限期挂开态（open-ended）反而被审计实务视为反模式（未申报的政策变更）。

## 2) 分点结论

**结论 1 — NIST SP 800-37 (RMF Authorize 步) 的字段集** — 来源：NIST RMF Authorize Step FAQ（csrc.nist.gov，官方）。授权决策由 Authorizing Official 基于授权包做出；包内 = security/privacy plan + **security assessment report（缺陷清单）+ POA&M（计划修复项）**。风险接受是 AO 对已知缺陷的三种处置之一（remediate → POA&M / accept → 风险接受声明 / 变更系统）。FA/QC 等联邦机构落地表单字段（CMS Risk Acceptance Template、QC-CUNY 表单搜索原文）：deficiency 标识（含 800-53 控制号）、deficiency 描述、justification（为何不整改）、**compensating controls（含等效性论证 + 800-53 控制映射）**、多级具名签批（Owner → ISSM → CIO → AO → Agency CIO）、日期、**到期日（不得超过 CISO 批准日起 1 年；waiver 三年强制续期）**。与 800-37 对应：AO 具名 = 授权问责主体。

**结论 2 — ISO 27001/27005 的要求** — 来源：sorena.io（引用 27001:2022 Cl. 6.1.3(f)、27005:2022 Cl. 8.6/8.6.2/8.6.3/10.4）+ cybersigmacs.com 双源。**批准处置计划与接受残余风险是两个独立决策**，都需 risk owner 决定；超出验收判据的例外须记录 justification、决策权威、条件与期限。可审查记录应含：风险与计划版本、决策者与授权层级、决策日期、接受水平、**条件、暴露期限、到期/复审日、监控指标、后续行动**；未实施的处置只能标「target residual risk」，不得当作已实现的降险证据——这正是「关闭 vs 留开」的关键分界。

**结论 3 — GRC 实务共识（含批评面）** — 来源：SureCloud（2026-09 原文）。五阶段：intake → risk assessment → **tiered approval（权限随风险升级）** → compensating controls + time-boxing → scheduled review。「Open-ended exceptions function as undocumented policy changes」「出问题的例外很少是危险的那些，而是没人设到期日的那些」；有登记册本身就是治理成熟的证据。与知识库先前调研（grcopilot「90 天为通行上限、续期需新证据」、decryptiondigest「40% 机构存在过期未复审的例外」）同向——**固定到期日 + 复审是硬性要件，续期须新证据而非复制旧批准**。

**结论 4 — 工具实现印证** — 来源：DefectDojo 官方文档。其 Full Risk Acceptance 对象字段：名称、owner、recommendation、decision、proof/证据、**接受人（User who accepts）、expiration date、到期后 finding 回归 Active 的行为**——即「关闭为 accepted-risk 但保持可查询/可审计/可过期回弹」是工具层标准形态，而非真删除。

**结论 5 — 关闭 vs 留开的裁定**：两种都可能是合法处置，分界在**当前证据状态**：
- **可关闭为 accepted-risk**：风险已按现行判据评估、补偿控制已验证运转、具名有权者已签、到期日+复审钩在册——此时「接受」就是终态决策，不需要等直接证据。留开反而制造「永不修复也永不决策」的审计盲区。
- **应保持 open**：① 处置尚未评估/补偿控制未验证——ISO 27005 明确此时只能标 *target* residual risk，不得记为已接受；② 组织判据要求该风险等级须更高层级或实证后才能批；③「接受」被用作无限期拖延手段——此时正确标签不是 accept 而是 **risk deferral / conditional acceptance（带 deadline 的条件下接受）**，必须保留 open-ish 状态与到期触发。

## 3) 对比矩阵

| 框架 | 决策主体 | 必录字段 | 时限要求 | 来源 |
|---|---|---|---|---|
| NIST SP 800-37 R2 | Authorizing Official（具名） | SAR 缺陷、POA&M、justification、compensating controls（+800-53 映射）、签批链、日期 | 实务上限 1 年；waiver 3 年强制复审 | csrc.nist.gov; cms.gov; qc.cuny.edu |
| ISO 27001/27005:2022 | Risk owner（+更高层 when 判据要求） | 计划版本、决策者/权限、日期、接受水平、条件、到期/复审日、监控指标 | 例外须 time limit；持续性监控 | sorena.io; cybersigmacs.com |
| GRC 实务/工具 | 分级审批（风险越高层级越高） | 五要件 + 证据 + 登记册 | 通行 90 天级；无到期日 = 反模式 | surecloud.com; defectdojo docs |

## 4) 来源清单

1. NIST RMF Authorize Step FAQs — https://csrc.nist.gov/CSRC/media/Projects/risk-management/documents/06-Authorize%20Step/NIST%20RMF%20Authorize%20Step-FAQs.pdf — Official — PDF 二进制不可读，字段结论取自搜索高亮正文（授权包构成、AO 职责）
2. CMS Risk Acceptance Template — https://www.cms.gov/files/document/riskacceptancetemplatepdf — Official — 联邦级 RA 表单字段全集（补偿控制+等效性、AO 签批、年度复审/三年续期）
3. QC-CUNY Risk Acceptance Form — https://www.qc.cuny.edu/its/wp-content/uploads/sites/16/2023/04/QC-Risk-Acceptance-Form.pdf — Official — 多级签批 + 到期≤1 年（原文 404，字段取自搜索高亮）
4. Sorena ISO 27005 Residual Risk Approval — https://www.sorena.io/artifacts/global/iso-27005/residual-risk-approval — Official-secondary — 已读全文；27001 6.1.3(f)/27005 8.6 条款映射、记录字段清单、target vs achieved residual 区分
5. CyberSigma ISO 27005 Guide — https://cybersigmacs.com/knowledge-center/iso-27005/ — Official-secondary — 已读全文；27005 结构、与 27001 关系
6. SureCloud 5-Stage Exception Process — https://www.surecloud.com/blog-hub/how-to-handle-exception-request — Criticism/Comparative — 已读全文；open-ended = 未申报政策变更、分级审批、到期日硬性
7. DefectDojo Risk Acceptances — https://docs.defectdojo.com/triage_findings/findings_workflows/os__risk_acceptance/ — Comparative（工具）— 已读全文；RA 对象字段 + 到期回弹行为
8. ISO OBP 27005:2022 词条 — https://www.iso.org/obp/ui/en/#!iso:std:80585:en — Official — risk retention 定义（临时性）
9. 知识库跨会话：grcopilot / cybersecurity101 / decryptiondigest 五要件报告（90 天上限、续期需新证据、40% 过期未复审统计）

## 5) 信息缺口

- Tavily 引擎配额耗尽，未能三引擎全量交叉（Exa + AnySearch 双引擎已覆盖）。
- ISO 条款号（6.1.3(f)、8.6.3）依赖二手转述，标准原文付费墙未读。
- NIST PDF 为二进制，内容经由搜索高亮而非全文解析；如需逐字引用建议用 pdftotext 离线提取。
- 「90 天」通行上限是 practitioner 共识而非任何标准条文——引用时应标注为 GRC 惯例。

---

**Sufficiency Gate（原跑附注）**：searches: 5（Exa + AnySearch；Tavily quota-exhausted 记为缺口）| angles: Official/Comparative/Criticism/Currency/Community | full reads: 5 | domains: 6+ | gaps: Tavily 不可用、NHIMG/secportal/CUNY 403/429/404、ISO 标准原文付费墙（条款号经二手指南）。
