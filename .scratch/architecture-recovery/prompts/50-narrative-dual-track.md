# Prompt: 50 — 叙事双轨落地

- A-xxx: A-057
- Decision: spec-phase-tasks.md R9-01＋D-053＋D-057④
- Blocked by: 无
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent
- 必读清单: issues/handoffs/50-*；spec §D-004 cluster；decision-ledger D-053 行（band 红线全文）；ADR-0013/0026/0014/0008；generate.ts（checkAllCitations/degradeReport/skeleton）；store.ts+schema.ts（SWMR/append-only）；SKILL.md；30-desk-calibration.json task15；CONTEXT.md Kernel/Agent 词条

## 专属 delta
- ① 叙事生成归宿主 agent；kernel 只盖章（checkAllCitations）不生成正式叙事；模板叙事永居 degraded 位
- ② band 红线**机检**非纪律：叙事段/claim 携 band→seal=rejected，违规明细入报告
- ③ mcp facts=固定 SELECT 形+参数绑定+READ_ONLY+limit≤500——不接裸 SQL
- ④ references 写明加载条件；rubric=D-004 文书化不新增判据语义；SKILL.md<500 行
- ⑤ R2-Q7 #4/#5 同票闭环；叙事记 model id
- 写入纪律：含正则的源文件用 new RegExp(字符串) 或 Edit 工具（ctx 写文件转义会剥 \b/\s）

## 专属验收
- `cd engine && npm test` 全链绿（narrative.test 25/25 在链）
- `node .scratch/architecture-recovery/reports/50-check.mjs` exit 0
- registry narrative-surface-landed occurred＋narrative-eval-surface triggered-bound＋BACKLOG #52
