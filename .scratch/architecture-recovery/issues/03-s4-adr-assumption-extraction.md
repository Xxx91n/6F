# 03: S4 ADR 假设提取工具链

**A-xxx covered:** A-003
**Spec ref:** [spec.md](spec.md) §Decision 4.3

**What to build:**
LLM 抽取 + 人工复核回路的 ADR 假设提取工具链

**Blocked by:**
#05

**Status:** done

- [x] LLM 抽取结果必须经过人工抽检（不能跳过）
- [x] 失败案例与成功案例并存（不要只挑好做的）
- [x] 1) LLM 抽取 prompt 模板（带 few-shot）；2) 人工抽检 checklist；3) 至少 5 个 ADR 的完整抽取案例（抽取结果 + 人工复核标记 + 假设失效判定）；4) 工具链 reusable 程度说明