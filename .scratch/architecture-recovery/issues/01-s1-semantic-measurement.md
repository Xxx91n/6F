# 01: S1 定位收敛语义度量方法

**A-xxx covered:** A-001
**Spec ref:** [spec.md](spec.md) §Decision 4.1

**What to build:**
S1 定位收敛的语义对齐方法（embedding 选型 / 关键词 fallback / 人工抽检）+ 试点仓库清单（至少 2 个真实仓库）+ 70% 阈值的校准流程

**Blocked by:**
#05

**Status:** ready-for-agent

- [ ] 必须用真实仓库跑一遍（不可只列方法）
- [ ] embedding 选型必须对比 ≥3 候选（给出放弃理由）
- [ ] 70% 阈值必须给出跨 ≥2 仓库的校准数据
- [ ] 1) 至少 2 个真实仓库跑通语义对齐流程；2) embedding 选型理由文档（3 候选对比）；3) 70% 阈值的跨仓库校准数据（每个仓库 5 个抽样点的对齐分）；4) 关键词 fallback 触发条件清单