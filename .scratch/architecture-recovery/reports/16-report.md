# 报告 16 — 渲染样式与模板结构切分（A-016）

- **A-xxx:** A-016 ｜ **Decision:** spec.md §Decision 6.3 ｜ **Blocked by:** #14, #15
- **产物:** `reports/16-render-split.json`、`reports/16-render-split.schema.json`、`reports/16-render-split-check.mjs`

## 1. 开工复述（per 启动器 ## 开工第一句）

- **Blocked by：** #14（共享骨架最大公约数）、#15（Scale 切片差异边界）。
- **必读清单 7 项，全部已读：** `issues/16-rendering-split.md`、`handoffs/16-rendering-split.md`、`spec.md §Decision 6.3`、`WORKFLOW.md §4.2`、`decision-ledger.md A-016`、`docs/adr/0006-shared-skeleton-scale-slice.md`、`docs/adr/0007-ten-demo-paths.md`。
- **前置核实：** ledger A-014 状态 `done`、A-015 状态 `done`，阻塞已解除，本票可独立闭环。

## 2. 调研（atomcode 深度调研，per WORKFLOW §4.2.3）

调用 `atomcode` 串行执行一轮深度调研（三引擎 15 次检索 / 10 次全读 / Official·Comparative·Criticism·Currency·Community 五角度全覆盖），并回顾 D-001~D-007 baseline、ADR-0006/0007、CONTEXT.md。

| 方案 | 先例等级 | 分离机制 | 可迁移点 |
|---|---|---|---|
| **JSON Schema + uiSchema**（react-jsonschema-form） | 有直接先例 | “schema tells what, uiSchema tells how” | `ui:` 词法前缀做两层命名空间隔离 —— 本票 R1/R2 直接照搬 |
| **W3C Design Tokens（DTCG 2025.10）** | 字段级类比 | 样式值 token 化 + `$` 前缀保留字 | 样式值只引用 token 名、禁字面量 —— 本票 R5 |
| **DITA**（OASIS） | 有直接先例 | topic 内容 vs ditamap 交付组织分离 | 4 章骨架=信息类型，切片=不同 map 组装，渲染层=DITA-OT |
| **SARIF**（OASIS） | 组合式创新 | 纯数据契约 + 独立查看器生态 | 报告契约与渲染器彻底解耦 |
| **HTML/CSS 分离** | 有直接先例 | 语义标记 vs 样式表 | 心智原型；且其“分离是单向的”局限已被记录 |
| **arc42** | 字段级类比 | 锁 12 节结构与目的，不锁措辞 | 与 ADR-0006“锁章顺序不锁措辞”同构 |
| **LaTeX documentclass** | 字段级类比（**反面教材**） | 内容与文档类分离，但 `	extbf`/`space` 可混入内容 | 直接证明“仅靠写作协议不够，必须词表拦截” —— 越界清单的动机 |

**推荐方案（三层契约 + 三道闸机）**：spec 层锁结构与字段并声明式禁 `ui:` 前缀键与样式词表键；demo 层用 `ui:` 前缀白名单 + 样式值全部 token 化；CI 用“词表扫描 + 契约校验 + 双层差分”三闸机。本票只落地其中的**契约与差分闸**，主题 token 的实际值留给 Phase 4（`demo/theme.tokens.json`），避免 spec 期就写死呈现。

## 3. 信息缺口（Sufficiency Gate）

1. **本票不落字面量样式值** —— 28 个样式字段只锁 token 名，色值/字号的真实取值需 Phase 4 在 `demo/theme.tokens.json` 落盘；本票刻意不写，避免把样式提前引入 spec 期。
2. **DTCG 2025.10 非 W3C 标准轨道**（Community Group Final Report），只借其命名空间惯例，不绑定实现。
3. **zeroheight 84% 采用率为二手转述**，引用于趋势判断，不用于结论性断言。
4. **软警告词表未做语料校准** —— 当前 12 个中文样式词在三个 spec 侧文件上命中 0，尚未在更大规模报告语料上验证误报率。
5. **切片字段 60 名的 origin 全部可追溯**至 A-005 矩阵，但 A-005 矩阵本身若变更需重跑 A13 断言。

## 4. 完成定义对照（per handoff ## 完成定义）

| # | 完成定义 | 落地形态 | 机检 | 结果 |
|---|---|---|---|---|
| 1 | spec 应锁定的字段清单 | `16-render-split.json#spec_locked_fields`（110 项 / 唯一 109 名：骨架 50 项 + 切片 60 名，均带 type/required/description/origin） | A5/A13/A15 | PASS |
| 2 | demo 应锁定的样式清单 | `16-render-split.json#demo_style_fields`（28 个 `ui:` 前缀 token，全部带 token_ref/applies_to/value_is_token_ref） | A6/A7/A8 | PASS |
| 3 | 越界检查清单（spec 阶段禁止触碰的 UI 元素） | `16-render-split.json#boundary_blacklist`（18 类：17 硬禁 + 1 软警告，每类含可编译正则 + 工业依据） | A10/A11/A12 | PASS |

**专属验收逐项：**

- [x] **spec 字段必须 < demo 字段（spec 不写样式）** —— 断言 A1/A2/A3/A4：spec 唯一 109 名 ⊊ demo 137 名（差 28 = 样式字段数），spec∩style=0，demo 无孤儿字段。
- [x] **越界清单需可机检** —— 断言 A10（18 类结构完整、正则全部可编译）+ A11（对 3 个 spec 侧契约文件扫描，硬禁命中 0）+ A12（扫描作用域排除黑名单定义文件与守卫自身，防自指）。
- [x] **三清单齐备** —— 见上表 1/2/3，且 `16-render-split.json` 经 ajv 对 JSON Schema 2020-12 校验 `valid=true`。

**守卫实跑：** `node reports/16-render-split-check.mjs` → **16 pass / 0 fail，GUARD RESULT: PASS，退出码 0**；软警告命中 0。

## 5. 阻塞

- **无。** Blocked by #14 / #15 均已 `done`，本票一次闭环。
- **解锁下游：** A-016 契约供 D-007 演示层（A-017/A-018 已 done）在 Phase 4 渲染时消费；`ui:` 前缀与 token 化约定需 Phase 4 建 `demo/theme.tokens.json` 时遵守。

## 6. lessons 候选（提交 WORKFLOW §4）

1. **“禁止 X”类守卫的作用域必须显式声明并机检** —— 黑名单定义文件（本票 `16-render-split.json`）与守卫脚本自身必然包含被禁模式文本；若不把二者写进 `boundary_scan_scope.excluded` 并加断言（A12），守卫必然自指失败。这是 W3 #15 R6 教训在本票的**主动预防**而非事后修复。
2. **守卫首跑 FAIL 时先怀疑守卫自身** —— 本票首跑 14/16：A11 失败是 `path.resolve` 回退层级少一级（落在 `.scratch` 而非仓库根），A8 失败是分词字符类把 `.` 留在允许集内导致 `C1.overall_verdict` 被当作整体。**两处都是守卫 bug，契约本身无缺陷**；判定顺序应为“先验守卫，再改契约”。
3. **schema 字符类要与真实数据同源校验** —— `token_ref` 正则漏 `_` 导致 `stamp.verdict_gate` 被拒；ajv 一次性校验（不进常驻守卫）抓出该问题，印证 W3 #15“一次性依赖不写进常驻守卫”的收益。
4. **派生优于转录** —— spec 侧 110 个字段全部由 `14-skeleton-fields.json` 程序化派生（非手工抄写），使 A13 上游计数对齐成为硬断言，杜绝跨票字段漂移。

## 7. 引用文件列表

- `issues/16-rendering-split.md`、`handoffs/16-rendering-split.md`、`prompts/16-rendering-split.md`
- `spec.md §Decision 6.3`、`WORKFLOW.md §4.2`（4.2.1 版本控制 / 4.2.2 文件写入 / 4.2.3 调研 / 4.2.4 决策账本 / 4.2.5 报告）
- `decision-ledger.md A-016`（及 A-014 / A-015 状态行）
- `docs/adr/0006-shared-skeleton-scale-slice.md`、`docs/adr/0007-ten-demo-paths.md`、`CONTEXT.md`
- `reports/14-skeleton-fields.json`（上游骨架契约）、`reports/15-slice-boundaries.json`（上游切片契约）
- 本票产出：`reports/16-render-split.json`、`reports/16-render-split.schema.json`、`reports/16-render-split-check.mjs`、`reports/16-report.md`

## 8. 版本控制处置（per WORKFLOW §4.2.1）

- **已提交**：本票 4 个新产物提交至独立分支 `16-rendering-split`（commit `ryr`）——`16-render-split.json`、`16-render-split.schema.json`、`16-render-split-check.mjs`、`16-report.md`。
- **未提交（commit-surface disposition）**：`decision-ledger.md`（A-016 行）与 `WORKFLOW.md`（§4 lessons 追加行）。原因：本票改动与其他 agent 的未提交改动落在**同一 diff hunk** 内 —— ledger hunk `sq:77` 同时包含 A-014 / A-015 行的他人改动，WORKFLOW hunk `pyw:8` 同时包含 W3 lessons 行的他人改动。GitButler 无法按 ID 拆分同一 hunk，按 hunk 提交会把他人工作并入本票分支，违反「不动他人工作」约束。
- **内容均已落盘**：ledger A-016 状态 = `done`；WORKFLOW §4 已追加 W4 #16 lessons 行。待主脑统一收口时提交。与 W3 #15 / #09 的 commit-surface disposition 同型。
- **越权提交检查**：本票新增文件全部落在 `.scratch/architecture-recovery/reports/`，未触动 jiahao / anysearch-cli / env-manager 及其他 agent 分支。
