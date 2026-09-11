# 05: 25 采集单元矩阵

**A-xxx covered:** A-005
**Spec ref:** [spec.md](spec.md) §Decision 4.5

**What to build:**
5 维 × 5 scale = 25 单元的具体判据 + 数据源 + 阈值初版 + 跨仓校准机制

**Blocked by:**
None (can start immediately)

**Status:** done

- [x] 矩阵必须 25 格全填（不能留空说"待定"）
- [x] schema 必须形式化（可机检）
- [x] 1) 25 单元矩阵表（行=5 维 S1-S5，列=5 scale，单元格=判据/数据源/阈值）；2) 矩阵 schema 定义（字段、类型、必填项）；3) 跨仓校准机制说明（如何从单一仓库扩展到多仓分布）