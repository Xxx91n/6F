# r31 exec handoff——#80 Micro-B 步① 落地完成 → 步②接棒

## 状态摘要

- 分支/提交：`r31-micro-b-step1` @ `wzt`（GitButler workspace，未 push——合并/推送逐次授权）
- 步① = 绿：tsc 0 error / npm pack dry-run 81 files / selftest ok=true / smoke 全链 19 件全绿 / 守卫基线 13+1 件全绿（新增 80-check 20/20）
- 执行报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-23-r31-exec-report.md`（逐项证据+impl 裁决+lessons）
- 账本：`.scratch/architecture-recovery/decision-ledger.md` **A-091**（步① impl 参数①~⑦——步②实现前必读，尤其①行对象形态/④scale=Micro-B/⑤成对双端/⑧血缘接线旗标语义）

## 步①留下的可用件（步②直接复用，勿重造）

- `engine/src/fact/subject.ts`——查询侧 subject 同样过 normalizeSubjectPath（归一单点，miss 判定前先归一）
- `engine/src/collect/file-lineage.ts`——file.renamed 血缘事实=renamed_to 跳转链的数据源；gitRenameLogArgs/parseRenameLogZ/RENAME_DETECTOR_VERSION 已钉
- `engine/src/upstream/codelore.ts`——reaggregateFileFacetRows（卡字段重算读源）、reconcilePerFileVsAggregate（对账判据）、subjectProbe 注入缝
- `engine/src/audit/macro-b.ts`——fileLineage spec 旗标：lazy 补采（D-122②）复用 collectMacroB 同管线=同构发射管线位（audit=on/demo=off 先例）
- `engine/test/fixtures/micro-b/`+`scripts/gen-micro-b-emission-golden.mjs`——fixture/golden 范式（骨架锁非内容值）步②照抄
- 测试范式：`engine/test/micro-b-emit.test.mjs`（smoke 链第 19 件；新测试按同法入 package.json smoke）

## 下一步（步②=T2，票面逐项照 BACKLOG #80 步②清单）

1. 文件卡投影：DuckDB 读模型（新表/视图，不混 audit_fact）——subject=规范化 path，投影缝合 file.renamed 血缘链
2. 确定性派生三件：priority_band/percentile_rank/top_n_flag——规则版本+派生 provenance（计数+subject_set_hash）；新值不毒库（毒值=可断言值非布尔）
3. advisory 结构性隔离：卡 schema 中 advisory 字段族物理隔离、类型上无 verdict/gate-consumable 字段（禁字段扫描测试锁）
4. 失败三态：new_file/insufficient_history/not_applicable；miss 四类：never_collected/not_tracked_at_sha/not_applicable/renamed_to（B 类=git 客观谱系判据）
5. at:<sha> pin+staleness 双字段（miss 内嵌不升格 payload）；renamed_to=条件跳转查血缘链；新文件驻留新 subject 不跳转
6. 双通道骨架：MCP tool（只读，miss→not_collected 状态+CLI 指引，不触发写）+ CLI `audit file`（lazy 补采=同构管线，sha 可达性闸）
7. 步②缝测试：投影/派生/隔离/三态/四类/at:sha/staleness/跳转/双通道各一条+e2e；fixture 增补按 D-038 范式

## 避雷（本会话实证）

- ctx_execute 写码一律数组行 push+join（模板字面量\/\u/反引号被宿主层吃转义×3 实证）；守卫断言用 includes 不用含括号正则字面量
- 对账判据比对面=file-bearing 子集−skipped（非文件粒度行天然不入）——判据语义先于代码
- 宿主级测试 `env -u NODE_OPTIONS`（ctx 沙箱注入污染）；文件写入后字节回读+BOM 检查
- dist/ 为版本化产物——改 src 后必须 `npm run build`（tsc+esbuild bundle 两件）一起提交；裸 `npx tsc` 产 346 行裸壳 cli.js 会致 CI rebuild-diff 六腿全红（r31 审计硬红实证）
- VC 全走 `but`（本会话分支 r31-micro-b-step1 已应用）；历史守卫读冻结工件不重跑采集器

## suggested skills

- `gitbutler`（VC 全流程必经）/`implement`（步②驱动，TDD seam 先写断言）/`tdd`（步②测试 seam）/`code-review`（提交前自审）
- `atomcode-research`（步②投影/卡 schema 设计若需先例调研——串行）/`codegraph`（仓内探查）
- `handoff`（步②收尾同法交接）

## 引用

- 任务书：`.scratch/macro-audit/handoffs/next-round.md`（#80 步②条目为准）
- 设计：ADR-0023 / D-121~D-127（账本 `.scratch/macro-audit/decision-ledger.md`）
- 上轮交接：`2026-09-23-r30-design-handoff.md`
