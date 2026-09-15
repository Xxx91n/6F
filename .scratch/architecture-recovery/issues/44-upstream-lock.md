# 44: 版本与上游锁定制度化 — upstream-lock.yaml 种子行 / README §3 状态列绑锁表 / 守卫族 advisory→enforce

**A-xxx covered:** A-049
**Spec ref:** [spec.md](spec.md) §R6-01（spec-phase-tasks.md R6-01 行；P0 首发 tag 硬前置）

**What to build:**
四节（轮 8 任务书 T4 原文）：① `engine/upstream-lock.yaml` 种子行（codelore active exact-version＋`--version` 契约／scorecard+repomix planned／sqlite-dump evaluating——每行状态/版本/校验方式字段，字段契约 id/kind/version/pin_type/contract/status/adapter/last_reviewed/next_review per D-037③）；② README §3 上游清单表状态列绑锁表为机读权威（表注明「以 engine/upstream-lock.yaml 为唯一权威」）；③ 守卫族 `reports/44-check.mjs`——版本断言（实跑 `codelore --version`==锁表值）＋锁表新鲜度（mtime/日期断言）＋三处 preview 标注同源（README 边界节＋generate.ts＋examples README 关键字段一致）＋编年指针校验（引用 ADR 存在且非 superseded/里程碑单调/双账互指），advisory→enforce 两段式；④ `reports/44-report.md` 六段式＋macro-audit 日报窗口节。docs/versioning.md 已成文（本票按文落实物）。

**Blocked by:**
无（DoR 闭合——决策已冻结 D-037/D-039；阶段 3 早期票）

**Status:** done（2026-09-16）

- [x] ① upstream-lock.yaml 种子行落盘（六行：codelore/duckdb-node-api/git-cli=active；openssf-scorecard/repomix-gitingest=planned；codelore-sqlite-dump=evaluating+risk_note；表头纪律注记 retired 不删/禁 range/手动窗口+golden 回归）
- [x] ② README §3 上游表状态列标 active/planned 枚举值＋「以 engine/upstream-lock.yaml 为唯一机读权威」注记；engine/CHANGELOG.md Unreleased 条目引 lock（D-037⑥）；package.json files += upstream-lock.yaml（provenance 锚随 tgz）
- [x] ③ reports/44-check.mjs PASS：版本断言（实跑 codelore --version 三方同值：binary↔锁表↔CODELORE_PINNED_VERSION）／锁表新鲜度（mtime≤now、last_reviewed≤today、next_review 逾期→advisory WARN）／三处 preview 标注同源／编年指针（ADR 存在+superseded 如实计、M-xxx 单调、双账互指）；两段式留位写明 enforce 段与 advisory 段
- [x] ④ 44-report.md 六段式＋macro-audit 日报窗口节；账本 A-049 done→implemented＋WORKFLOW §4 lessons＋next-round T4 ✅＋BACKLOG #44 ✅
