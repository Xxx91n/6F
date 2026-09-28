# R44-Q1 调研题面 — accepted-risk 五要件结构与「关档 vs 续等实证」处置裁界

## 背景
macro-audit 仓轮 44 T1-B：GAP-HOST-01（CodeBuddy IDE 会话不可直达——CLI 侧无 host-attach，插件 MCP server 注入行为宿主侧不可仓核）长期挂 open。D-168② 裁定以 RA 五要件档案呈批用户关档：①风险精确标识 ②不修理由 ③可验证补偿控制 ④具名批准人（≠起草者）⑤到期/复审日 ≤90d+复审钩。D-169-b②③④ 同步立规：存量 RA 普查＋批2-β 触发器三问＋manual_watch 五要素。

## 裁决问题
accepted-risk（risk acceptance）档案的工业标准字段结构为何（NIST SP 800-37 / ISO 27001 / 27005 / 通行 GRC 实务）？把「已知差距+补偿控制在册+具名批准+复审钩+到期日」关闭为 formally-accepted-risk，与「续等直接证据维持 open」相比，何者是业界认可的治理处置？

候选：(i) 关档为 accepted-risk（处置即终态名分）；(ii) 维持 open 至宿主侧实证可达；(iii) 条件接受（risk deferral/conditional acceptance，带 deadline 保留 open-ish 态）。

## 调研要求
- 工业界 RA 记录必备字段（各框架条款级）；「关闭 vs 留开」的裁定分界；续期/到期语义
- 辩证看待；若与本仓 current 决策（D-168②/D-169 系五要件 ≤90d）冲突：标记呈报禁静默改向
- 给出推荐与理由

---

**存档注记**：原 R44 执行窗 atomcode 调研未留仓内工件（审计观察 O2）。本题为审计窗依报告＋registry 留痕复原的同题复跑，英文题面 verbatim："What is the industry-standard structure for an accepted-risk (risk acceptance) record — required fields per NIST SP 800-37, ISO 27001/27005, and common GRC practice — and is closing a known-gap item as formally-accepted-risk (with compensating controls, named approver, review hook, expiry) versus keeping it open pending direct evidence an accepted governance disposition?"——复跑结论与原报告自述同向（五要件三框架一致＋关档为合法处置），遂归档为可核工件。
