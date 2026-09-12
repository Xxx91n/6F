# 16: 渲染样式与模板结构切分

**A-xxx covered:** A-016
**Spec ref:** [spec.md](spec.md) §Decision 6.3

**What to build:**
spec 锁结构 + 字段；demo 锁样式（避免 spec 越界到 UI）

**Blocked by:**
#14, #15

**Status:** ready-for-agent

- [ ] spec 字段必须 < demo 字段（spec 不写样式）
- [ ] 越界清单需可机检
- [ ] 1) spec 应锁定的字段清单；2) demo 应锁定的样式清单；3) 越界检查清单（spec 阶段禁止触碰的 UI 元素）