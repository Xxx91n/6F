# Handoff: 44 — 版本与上游锁定制度化

- **A-xxx covered:** A-049
- **Decision:** spec.md §R6-01＋D-037（版本与上游锁定制度化六条）＋D-039③（编年指针守卫并入 #44）＋ADR-0018
- **对应 issue:** issues/44-upstream-lock.md
- **对应 prompt:** prompts/44-upstream-lock.md

## 上下文摘要（3-5 句）
D-037 拍板制度化六条：0.x 单调纪律＋报告契约独立版本化＋upstream-lock.yaml 机读权威＋手动窗口更新＋advisory→enforce 门禁＋versioning.md 成文。前两条已由 ADR-0018/versioning.md/#45 披露块落位；本票落实物=锁表种子行＋README 绑定＋守卫族（含 D-039③ 编年指针校验同族并入）。P0 首发 tag 硬前置。

## 完成定义（本票 done 判据）
- `engine/upstream-lock.yaml` 落盘：种子行 codelore=active（exact-version 0.28.0＋`--version` pin 契约）／scorecard+repomix=planned／sqlite-dump=evaluating＋风险注记；九字段契约逐行齐备；表头纪律注记（retired 不删／禁 range·浮动 tag·latest／锁定先于依赖／更新走手动窗口＋golden 回归）
- README §3 上游清单表状态列绑锁表为机读权威（「以 engine/upstream-lock.yaml 为唯一权威」注记＋人读↔机读状态映射声明）；engine/CHANGELOG.md Unreleased 条目引 lock（D-037⑥ CHANGELOG entry 引用 lock diff 落位）
- 守卫 `reports/44-check.mjs` PASS：① 版本断言（实跑 `codelore --version`==锁表==CODELORE_PINNED_VERSION 三方同值）；② 锁表新鲜度（mtime/last_reviewed/next_review 日期断言，逾期 advisory 报警）；③ 三处 preview 标注同源（README 边界节＋generate.ts＋examples/README 关键字段一致，文档↔产物印记绑定）；④ 编年指针校验（引用 ADR 存在且 superseded 如实计／M-xxx ID 与日期单调／双账互指／engine CHANGELOG Unreleased 引 lock）——advisory→enforce 两段式留位并写明哪段已 enforce
- `reports/44-report.md` 六段式＋macro-audit 2026-09-16 日报窗口节
- ledger A-049 done→implemented＋WORKFLOW §4 lessons＋issue Status=done＋next-round T4 ✅＋BACKLOG #44 ✅＋commit 引 A-049＋守卫结果

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：锁表/版本断言先例（deterministic-deps、lockfile-lint、SLSA pin 纪律）；回顾 baseline（D-037/D-039/ADR-0018/docs/versioning.md）；冲突显式点名不静默改向
- **回顾 docs/adr/**：0014（上游双轨）、0017（preview 诚实）、0018（版本与编年）；**回顾 CONTEXT.md**：「Receipt / upstream / pin」词汇
- **对标工业界成熟方案**：≥2 个上游 pin/锁表先例（deterministic-deps 两段式门禁、lockfile-lint、npm ci --ignore-scripts 类）

## 阻塞
- 无（DoR 闭合——决策已冻结；本票为 P0 首发 tag 硬前置链一环）

## 关键参考
- docs/versioning.md §3（字段契约与种子行原文）、§4（更新节奏）、§5（门禁四件套）；docs/adr/0018 §D-1/D-2
- engine/src/upstream/codelore.ts（CODELORE_PINNED_VERSION=0.28.0、resolveCodelore binary-discovery）；engine/package.json（@duckdb/node-api 精确依赖）
- README.md §能力边界节+§3 上游清单表；engine/src/report/generate.ts（PreviewDisclosure/UNVERIFIED_MARK）；examples/first-report/README.md（preview_disclosure 时点差注记）
- 仓根 CHANGELOG.md＋engine/CHANGELOG.md（双账互指）；reports/{33-gate-registry.json,41a-check.mjs,43-check.mjs,45-check.mjs}（守卫先例）
