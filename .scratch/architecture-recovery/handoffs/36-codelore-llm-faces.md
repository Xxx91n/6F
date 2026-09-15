# Handoff: 36 — CodeLore LLM 面独立票（explain 族 env 门控＋成本验收）

- **A-xxx covered:** A-041
- **Decision:** spec.md §R5-D5
- **对应 issue:** issues/36-codelore-llm-faces.md
- **对应 prompt:** prompts/36-codelore-llm-faces.md

## 上下文摘要（3-5 句）
D-035②：LLM 面（explain 族）单独成票——env 门控＋成本面，S4 假设抽取前置，独立验收。门控语义：CODELORE_LLM_* 未配置 = 面不可用且报告显式降级披露（Failure Semantics：显式降级非沉默失败）。测试不真调 LLM——golden cassette 两形态（门控关/开）。

## 完成定义（本票 done 判据）
- explain 族面清单 + CODELORE_LLM_* env 契约（变量名/语义/缺省行为）落文
- 成本验收面：计量字段 + 上限判据 + 超限降级路径
- golden 契约测试两形态 PASS；守卫 reports/36-check.mjs PASS
- ledger A-041 回写 done；WORKFLOW §4 lessons；commit 引 A-041 + 守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（D-035、S4 假设抽取链 #03 先例）、spec.md §R5、engine 现状；冲突显式点名不静默改向
- **回顾 docs/adr/**：0014；**回顾 CONTEXT.md**：「S4 Evolution Direction / Failure Semantics」
- **对标工业界成熟方案**：≥2 个 LLM 功能 env 门控/成本计量先例

## 阻塞
- #34, #35（次序批次二）

## 关键参考
- reports/03-extraction-prompt.md / 03-extraction-cases.md（S4 LLM 抽取先例）
- engine/src/upstream/codelore.ts；macro-audit 账本 D-035②
