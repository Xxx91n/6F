# 39: Macro-B 三仓 one-shot 泛化验证＋jiahao 持续回归接入 CI

**A-xxx covered:** A-044
**Spec ref:** [spec.md](spec.md) §R5-D8

**What to build:**
Macro-B（已上架层）对 env-manager / anysearch-cli / jiahao 各跑一次 one-shot 泛化验证；jiahao 持续回归接入 CI——接入动作 = 多写者三触发器之 (a) 激活点（D-034④a），激活即实测封口任务 7 多写者域（self-probe，衔接 #33 guard 登记）。试点成功度量 = 反复接受非跑通；持续回归仅限已上架层。

**Blocked by:**
#37（试点面可用性审计产出 capacity 矩阵为指派依据）

**Status:** done（2026-09-16，39-check.mjs PASS 守卫全绿 exit 0；报告 `.scratch/architecture-recovery/reports/39-report.md`）

- [x] 三仓各一次 Macro-B one-shot（报告产物齐、每仓给证据锚） — `39-macro-b-one-shot.mjs` 实跑：env-manager 276 facts supported（RCP-b1106d4112171be9）/ anysearch-cli 1041 facts unsupported（TC-2 RED 如实落数，RCP-b87bc53eb457a9fc）/ jiahao 1101 facts supported（RCP-4d1b294f6e2b0a07）；产物 `39-macro-b-<repo>.{md,json}`+facts.jsonl+measurements+共享 `39-audit-facts.duckdb`（3 repo_ref×Macro-B=2418 行）；锚=facts 数/receipt/live HEAD（39-check B 组）
- [x] jiahao 持续回归 CI 接入（workflow 变更写明触发面；接入即触发器 (a) 激活） — `D:\Aworker\jiahao\.github\workflows\macro-b-regression.yml`：schedule 周一 03:17 UTC + workflow_dispatch（无 push/PR，回归≠门禁）；checkout 本仓全历史+Xxx91n/6F 引擎→one-shot --repo jiahao→工件上传；jiahao commit `84077dab`（but zqm @ r9-39-macro-b-regression）
- [x] 多写者 self-probe 实测封口任务登记/执行（衔接 #33 挂门登记表条目状态翻转） — `39-mw-self-probe.mjs`+`39-mw-child.mjs` 真并发实测：同进程二写 denied/conn.close 不放锁（instance 持有）/跨进程并行 1 胜 3 lock_denied/串行 2/2/持锁期读写皆拒/66 行零 dup → `39-mw-self-probe.json`；registry `mw-regression-ci`→occurred、`mw-trigger-a` confirmations trigger-fired（ALARM 值守）、`desk-task7`→triggered-bound+self-probe-executed
- [x] 守卫 reports/39-*.mjs PASS — `39-check.mjs` PASS（exit 0）
