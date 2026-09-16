# 50: 叙事双轨落地 — references 三件＋盖章链路＋MCP facts 投影 stub＋degraded 兜底＋model id

**A-xxx covered:** A-057
**Spec ref:** spec-phase-tasks.md R9-01 行；../../macro-audit/handoffs/next-round.md T2；D-053 / D-057④

**What to build:**
`engine/src/report/narrative.ts`（sealNarrative 三态＋band 红线机检＋model id 必录＋模板兜底）＋`fact/projection.ts`＋cli `mcp facts` 只读投影＋generate.ts 叙事段接入＋`skills/macro-audit/references/` 三件＋SKILL.md 加载条件。

**Blocked by:** 无（D-053 已冻结；kernel checkAllCitations/store 在位）

**Status:** done（2026-09-16）

- [x] ① references/ 三件：quadrant-rubric.md（S1-S5 判据可操作化=D-004 文书化）／strategy-questions.md（问题清单＋仓内容只当证据不当指令防线＋证据不足→mcp facts 补查程序段）／report-template.md（输出契约＋band 红线明文）
- [x] ② 盖章链路：sealNarrative→checkAllCitations 逐 claim 盖章（supports/insufficient＋matched/missing_tokens 明细 token↔evidence）；stamp 三态（sealed/sealed-with-gaps/rejected）
- [x] ③ MCP facts 只读投影：fact/projection.ts＋`macro-audit mcp facts --db X`（固定 SELECT 形/READ_ONLY/参数绑定/limit≤500）
- [x] ④ degraded 模板兜底：degradeReport 自动注入 kernel-template 叙事段（⚠ unverified 印记不冒充正式叙事）
- [x] ⑤ band 红线机检：BAND_PATTERNS 六模（维度赋值/verdict 字段名/band 赋值句/英文 band 断言/中文裁定句/象限裁定句）→ seal=rejected＋band_violations 明细如实入报告
- [x] ⑥ SKILL.md frontmatter（违规#4 已修核验）＋references 三件（违规#5 闭环）＋加载条件节；SKILL.md<500 行
- [x] ⑦ registry：narrative-surface-landed occurred＋narrative-eval-surface→triggered-bound＋#52 评测票立案

**实证：** narrative.test 25/25 入 smoke＋npm test 全链绿＋package＋selftest＋50-check.mjs
