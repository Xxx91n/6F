# 42: 上游队列值守 — Scorecard/repomix 探针拉动＋sqlite dump 对照评估

**A-xxx covered:** A-047
**Spec ref:** [spec.md](spec.md) §R5-D11

**What to build:**
① Scorecard/repomix 探针按层需求拉动接入（不插队——某层 preview 需要供应链/打包摘要数据时启动，当前无层刚需则保持队列登记）；② CodeLore sqlite/parquet 全量 fact-store dump 对照评估落文（vs 逐面契约路径）；③ Macro-B preview 供应链象限维持「⚠ 数据未接」披露核查。

**Blocked by:**
#35（dump 对照评估需首批契约面落位作对照基线）；Scorecard/repomix 探针 = 层需求触发器拉动

**Status:** ready-for-agent

- [ ] dump 对照评估落文（字段覆盖度 / 语义翻译面厚度 / golden 可测性三轴对比逐面契约路径）
- [ ] dump 采纳与否的呈报（采纳须另立 ADR——适配层语义翻译面变厚，D-035③）
- [ ] Scorecard/repomix 探针登记保持「层需求拉动」状态（含触发条件字段，衔接 #33 guard）
- [ ] Macro-B preview 报告供应链象限「⚠ 数据未接」披露在位核查
- [ ] 守卫 reports/42-*.mjs PASS
