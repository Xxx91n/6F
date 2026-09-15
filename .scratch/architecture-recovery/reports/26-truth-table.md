# 26 — 阶段 1.5 量测审计：14 份 ADR 人工真值表 + 逐份 delta 表模板

> 本票为 OOS Phase 1 同构人工调查（ADR-0015 / D-025）。机读 golden set = `reports/26-truth-table.json`（本表由其生成，逐格可回溯行号）。
> 冻结数据源：首报 head `fc00d458`（observed_at 2026-09-13T14:31:09+08:00），冻结集 = docs/adr/ 13 份（0001~0013）；ADR-0014 为冻结后新增（2026-09-14 入库），记 post-freeze 行，不入冻结读数对照。v1 读数 = `adr-structure@v1` 真实代码对冻结文件集重跑（mean_ratio 复现 0.2462，与 23-measurements.json 冻结记录一致）。

## §0 口径

- **真值计数规则（预声明，先于读数汇总）**：truth_present = 五件套元素以任何带标签形态落字（`F-dash` dash 字段 / `F-bare` 裸行字段 / `F-bold` 加粗字段 / `F-sect` `## ` 节）或 ISO 日期可内联恢复（`I-inline`，含 Status 括号内嵌与决策理由散文内研究日期）；纯散文承载无标签（`I-prose`）与全缺（`M`）计 truth absent。
- **delta 分类**：`consistent` = v1 与真值一致；`detector-miss-form` = 真值存在但形态未被 v1 解析（裸行/加粗字段）；`detector-miss-inline` = 信息内联可恢复但 v1 未接回退链；`real-gap` = 文档层真实缺失；`post-freeze` = 冻结后新增不参与对照。
- **语义注记**：0008/0009 的 I-inline 日期（2026-09-12）为决策理由散文中的「atomcode 调研」日期——A-002 回退链 inline 腿按 head-60 ISO 规则会捕获；其语义为研究日期而非标签化决策日期，严格口径下计缺失时真值 mean_ratio = 0.4308（RED 方向不变）。

## §1 人工真值表（14 份）

| ADR | 冻结集 | Status | Date | Context | Decision | Consequences | 真值五件套 | v1 五件套 |
|---|---|---|---|---|---|---|---|---|
| 0001-five-scale-scope.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0002-no-mvp-slice.md | 是 | ✓ F-bare@L5 | ✓ I-inline@L5 2026-09-12 | ✗ — | ✗ — | ✗ — | 2/5 = 0.4000 | 0/5 = 0.0000 |
| 0003-boundary-product-and-usage.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0004-strategic-quadrant-five-dims.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0005-hub-of-facts-with-federated-adjudication.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0006-shared-skeleton-scale-slice.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0007-ten-demo-paths.md | 是 | ✓ F-bare@L5 | ✗ — | ✗ — | ✗ — | ✗ — | 1/5 = 0.2000 | 0/5 = 0.0000 |
| 0008-agent-plugin-five-layer-box.md | 是 | ✓ F-bare@L5 | ✓ I-inline@L3 2026-09-12 | ✗ — | ✗ — | ✗ — | 2/5 = 0.4000 | 0/5 = 0.0000 |
| 0009-intake-local-first-url-optin.md | 是 | ✓ F-bare@L5 | ✓ I-inline@L3 2026-09-12 | ✗ — | ✗ — | ✗ — | 2/5 = 0.4000 | 0/5 = 0.0000 |
| 0010-spec-repo-and-engineering-repo-split.md | 是 | ✓ F-bold@L3 | ✓ I-inline@L3 2026-09-12 | ✓ F-sect@L5 | ✓ F-sect@L10 | ✓ F-sect@L18 | 5/5 = 1.0000 | 3/5 = 0.6000 |
| 0011-single-repo-subdir-but-branches.md | 是 | ✓ F-bold@L3 | ✓ I-inline@L3 2026-09-12 | ✓ F-sect@L5 | ✓ F-sect@L10 | ✓ F-sect@L17 | 5/5 = 1.0000 | 3/5 = 0.6000 |
| 0012-value-validation-loop-first.md | 是 | ✓ F-dash@L3 | ✓ F-dash@L4 | ✓ F-sect@L8 | ✓ F-sect@L12 | ✓ F-sect@L16 | 5/5 = 1.0000 | 5/5 = 1.0000 |
| 0013-three-layer-acceptance-gates.md | 是 | ✓ F-dash@L3 | ✓ F-dash@L4 | ✓ F-sect@L8 | ✓ F-sect@L12 | ✓ F-sect@L16 | 5/5 = 1.0000 | 5/5 = 1.0000 |
| 0014-upstream-integration-dual-track.md | 否（冻结后新增） | ✓ F-dash@L3 | ✓ F-dash@L4 | ✗ — | ✗ — | ✗ — | 2/5 = 0.4000 | n/a |

辅助字段（非五件套，供 #27/#28 参考）：Deciders 字段仅 0012/0013/0014 为 F-dash；0010/0011 为散文/裸行提及（`- ledger D-0xx` 无冒号形态记 I-prose）；0001~0009 缺失。Ledger 仅 0012/0013 F-dash。`## Considered Options` 节全体缺失（0014 为裸行 `Considered Options:`）。git 首提交日期：0001~0011 = 2026-09-12，0012/0013 = 2026-09-13，0014 = 2026-09-14。

## §2 delta 分解（冻结集 13 份 × 5 件 = 65 cells）

| ADR | Status | Date | Context | Decision | Consequences |
|---|---|---|---|---|---|
| 0001-five-scale-scope.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0002-no-mvp-slice.md | detector-miss-form | detector-miss-inline | real-gap | real-gap | real-gap |
| 0003-boundary-product-and-usage.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0004-strategic-quadrant-five-dims.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0005-hub-of-facts-with-federated-adjudication.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0006-shared-skeleton-scale-slice.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0007-ten-demo-paths.md | detector-miss-form | real-gap | real-gap | real-gap | real-gap |
| 0008-agent-plugin-five-layer-box.md | detector-miss-form | detector-miss-inline | real-gap | real-gap | real-gap |
| 0009-intake-local-first-url-optin.md | detector-miss-form | detector-miss-inline | real-gap | real-gap | real-gap |
| 0010-spec-repo-and-engineering-repo-split.md | detector-miss-form | detector-miss-inline | consistent | consistent | consistent |
| 0011-single-repo-subdir-but-branches.md | detector-miss-form | detector-miss-inline | consistent | consistent | consistent |
| 0012-value-validation-loop-first.md | consistent | consistent | consistent | consistent | consistent |
| 0013-three-layer-acceptance-gates.md | consistent | consistent | consistent | consistent | consistent |
| 0014-upstream-integration-dual-track.md | post-freeze | post-freeze | post-freeze | post-freeze | post-freeze |

**汇总**：consistent 16 / detector-miss-form 11（Status 全形态误读）/ detector-miss-inline 5（Date 内联可恢复）/ real-gap 33（Date 文档层缺失 6 + 三节结构缺失 27）。

**判定影响（对照冻结读数）**：
- mean_ratio：v1 = 0.2462 → 真值 = **0.4923**（仍 < 0.60 → (a) 腿 RED 方向不变）
- field_missing_ratio：Status 84.62% → **0%**（纯量测伪影）；Date 84.62% → **46.15%**（6/13，不再触 (b)；其中 5 格为回退链未接漏认，6 格为真实缺失且 git 腿可外部供给）；Context / Decision / Consequences 69.23% → **69.23% 不变**（9/13，全部真实缺失）
- 结论：v1 RED 判定**方向成立**（(a) + (b) 三节腿均仍命中），但**字段归因错误**——原读数把 Status/Date 记为最大缺失源，真值显示 Status 零缺失、Date 缺失减半且其中大半为量测误差。RED 的量测伪影部分（11+5=16 格）可按 D-025 成对动作记 invalid；真实缺失 33 格不消失，移交 #28 治理。

## §3 可归属原因登记（OOS Phase 1 式）

| AC-ID | 性质 | 可归属原因 | 证据 | 影响格 |
|---|---|---|---|---|
| AC-26-1 | measurement-error | adr-structure@v1 头部字段解析器仅接受 `- ` dash 前缀（collectors.ts parseHeaderFields L142 正则），Nygard 裸行 `Status:` 与 bold `**Status:**` 形态未识别 | engine/src/collect/collectors.ts L137-148；逐份 L5/L3 行号见本表 fields | Status ×11（0001~0011 全部 v1-miss 中真值均存在） |
| AC-26-2 | measurement-error | A-002 交付的回退链（inline ISO date head-60 → git 首提交）从未接入 detector（ADR-0015 Context 明文记录） | reports/02-adr-fallback.mjs（extractInlineDate/gitFirstCommit）；docs/adr/0015 Context | Date ×5（0002/0008/0009/0010/0011 内联可恢复） |
| AC-26-3 | real-gap | Date 文档层真实缺失（全文无任何日期文本）——git 首提交腿可外部供给但文档未携带 | 逐份 Date=M；git_first_commit 列 | Date ×6（0001/0003~0007）；转 #28 治理范围 |
| AC-26-4 | real-gap | Context/Decision/Consequences `## ` 节结构真实缺失（信息以散文/决策理由段承载，无标记节） | 逐份三节 M；prose 承载注记 | 三节 ×9 文件 = 27 cells（0001~0009）；转 #28 治理范围 |
| AC-26-5 | measurement-error | 0014（冻结后新增）Consequences/Options 以裸行标签（全角/半角冒号）承载——若纳入扫描面 v1 将漏认；提前登记供 v2 规则评审 | docs/adr/0014 L11 | post-freeze 行 |

> OOS 纪律对齐：每个 v1-miss 格均已落「specific, documented, identifiable」可归属原因（解析器白名单过窄 / 回退链未接线 / 文档真实缺失三类）；「复测合格」未被当作原因——invalid 依据 = 预存在的接线缺口记录（ADR-0015 Context），非事后合理化。

## §4 逐份 delta 表模板（移交 #27 复用）

每份 ADR 一行 × 每字段一组列；#27 重跑后填写 v2 列并复核 class：

```
| ADR | field | truth(form@line) | v1 | v2 | v2_leg | delta_class | assignable_cause |
|-----|-------|------------------|----|----|--------|-------------|------------------|
| 0001-five-scale-scope.md | Status | present(F-bare@L5) | miss | <填> | <inline?> | detector-miss-form | AC-26-1 |
| ...（逐字段 65 行由 #27 生成；v2_leg 记捕获腿 = dash/inline/git/none）|
```

## §5 交接

- **#27（R4-02）**：golden set = `26-truth-table.json` files[].fields；一致率口径 = 冻结集 13 份 × 五件套 65 格逐格比对 v2 读数 vs truth_present；重测次数与判定规则须先于重跑写死。
- **#28（R4-03）**：真实缺失准入清单 = delta_class=real-gap 33 格 → Date 字段 6 份（0001/0003~0007）+ 三节 `## ` 结构 9 份（0001~0009）；散文承载信息保留，补记注明「量测审计驱动的勘误补记」。post-freeze 行 0014（Context/Decision 真缺、Consequences/Options 裸行）治理与否属 #28 范围内酌情项（不在冻结对照）。
