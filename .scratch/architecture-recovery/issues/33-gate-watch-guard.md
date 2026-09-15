# 33: T7 挂门机检化 guard — 全挂门项三字段到期报警

**A-xxx covered:** A-038
**Spec ref:** [spec.md](spec.md) §R5-D2

**What to build:**
统一 guard 脚本扫描全部挂门项三字段（最迟拍板时点 / 触发事件 / 复审时点）并到期报警。输入面四族：① reports/25-rollout-checklist.md 挂门行（B2.1 / B3.2 / B3.3 / P1~P4 / P5 凭据 / D3 / D4 / D5 + deferred 的 B1.3/B5-3）；② 账本两字段登记项（D-024：spec-phase-tasks 任务 5/7 注记与待探针占位的「满足判据＋复审时点」）；③ CodeLore 暂缓面集复审时点（D-035④ ~20 面，复审时点 = 各层 preview 前置）；④ 多写者三触发器（D-034④：a=Macro-B 进 CI 定时回归 / b=Macro-C 共用同一 DuckDB / c=Macro-A 启动）。绑定表权威文本 = reports/R5-Q5-atomcode-research.md §3；值守规则 = 触发已发生而未拍 1 个工作日内升级 / 硬到期未触发按重组改绑一次 / 再到期升级用户。

**Blocked by:**
None（阶段 3 最优先，横切兜底；与 #43 同批立项）

**Status:** ready-for-agent

- [ ] 挂门项机读登记表落文（四族输入逐项登记三字段；漏登记字段 = FAIL）
- [ ] 守卫脚本 reports/33-*.mjs：源文档挂门行 ↔ 登记表对账（未登记行检出即 FAIL）＋ 到期/触发判定 ＋ 显式 PASS/FAIL ＋ exit 0/1
- [ ] 守卫实跑 PASS；报告含当前各挂门项状态快照（哪些已触发未拍 / 哪些临近到期）
- [ ] 登记表形态可被后续票复用（#39 触发器 a 激活点、各层 preview 前置复审时点）
