# 36: CodeLore LLM 面独立票（explain 族 env 门控＋成本验收）

**A-xxx covered:** A-041
**Spec ref:** [spec.md](spec.md) §R5-D5

**What to build:**
explain 族 LLM 面契约化：env 门控（CODELORE_LLM_* 环境变量族——未配置 = 面不可用且报告显式降级披露，不静默失败）＋成本验收面（调用成本计量字段 / 上限判据 / 超限降级路径落文）。S4 ADR 假设抽取前置；独立验收、不混入 #35。

**Blocked by:**
#34, #35

**Status:** ready-for-agent

- [ ] explain 族面清单实物枚举 + env 门控字段契约（CODELORE_LLM_* 族：变量名 / 语义 / 缺省行为）
- [ ] 成本验收面（计量字段 + 上限判据 + 超限降级路径）
- [ ] golden 契约测试两形态（门控关 = 降级披露形态；门控开 = 正常形态；测试不真调 LLM）
- [ ] 守卫 reports/36-*.mjs PASS
