# 11: LangGraph supervisor 适配评估

**A-xxx covered:** A-011
**Spec ref:** [spec.md](spec.md) §Decision 5.5

**What to build:**
adopt vs 自研 hub 协调层的决策矩阵（语言契合度 / 学习曲线 / 与 D-005 SSOT 心智冲突面）

**Blocked by:**
None (can start immediately)

**Status:** closed（2026-09-11，A-011 闭环，报告 = reports/11-report.md）

- [x] 必须给出明确决策（adopt / 自研 / 混合）→ 自研（不 adopt / 不混合），重评触发器 T1-T3 见报告 §1
- [x] 决策矩阵 ≥5 维度 → 7 维三列矩阵，报告 §4.3
- [x] 1) LangGraph 能力清单（报告 §4.1，8 能力域版本锚定）；2) 契合度评分 6 维（报告 §4.2，均分 2.33/5）；3) 决策 = 自研 + 排他理由 5 条（报告 §1 + §4.4）