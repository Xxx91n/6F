# 39: Macro-B 三仓 one-shot 泛化验证＋jiahao 持续回归接入 CI

**A-xxx covered:** A-044
**Spec ref:** [spec.md](spec.md) §R5-D8

**What to build:**
Macro-B（已上架层）对 env-manager / anysearch-cli / jiahao 各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI——接入动作 = 多写者三触发器之 (a) 激活点（D-034④a），激活即实测封口任务 7 多写者域（self-probe，衔接 #33 guard 登记）。试点成功度量 = 反复接受非跑通；持续回归仅限已上架层。

**Blocked by:**
#37（试点面可用性审计产出 capacity 矩阵为指派依据）

**Status:** ready-for-agent

- [ ] 三仓各一次 Macro-B one-shot（报告产物齐、每仓给证据锚）
- [ ] jiahao 持续回归 CI 接入（workflow 变更写明触发面；接入即触发器 (a) 激活）
- [ ] 多写者 self-probe 实测封口任务登记/执行（衔接 #33 挂门登记表条目状态翻转）
- [ ] 守卫 reports/39-*.mjs PASS
