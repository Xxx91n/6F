# 36: CodeLore LLM 面独立票（explain 族 env 门控＋成本验收）

**A-xxx covered:** A-041
**Spec ref:** [spec.md](spec.md) §R5-D5

**What to build:**
explain 族 LLM 面契约化：env 门控（CODELORE_LLM_* 环境变量族——未配置 = 面不可用且报告显式降级披露，不静默失败）＋成本验收面（调用成本计量字段 / 上限判据 / 超限降级路径落文）。S4 ADR 假设抽取前置；独立验收、不混入 #35。

**Blocked by:**
#34, #35

**Status:** done（2026-09-16；36-check.mjs PASS 20/20）

- [x] explain 族面清单实物枚举 + env 门控字段契约（CODELORE_LLM_* 族：变量名 / 语义 / 缺省行为）→ reports/36-llm-faces-reconciliation.json（analyze 枚举 explain-*=0 如实登记；topics 46；LLM 面 3；env 五变量契约）
- [x] 成本验收面（计量字段 + 上限判据 + 超限降级路径）→ codelore.llm_cost fact + call_cap/cap_source + call-cap-reached 降级
- [x] golden 契约测试两形态（门控关 = 降级披露形态；门控开 = 正常形态；测试不真调 LLM）→ engine/test/codelore-llm.test.mjs 25/25
- [x] 守卫 reports/36-*.mjs PASS → reports/36-check.mjs PASS 20/20 exit 0
