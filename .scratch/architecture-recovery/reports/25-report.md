# 25 — 铺开与分发收尾（A-030 / spec §R3-D7）

## §1 开工复述（per 启动器「开工第一句」）

- **阻塞状态**：`Blocked by: #24` —— **已解除**。#24 于 2026-09-14 闭环（缺口回流实测锚清扫：两轮 atomcode 调研 + 校准映射清单，守卫 34/34 PASS，A-028 → implemented）；but status 见 `24-gap-sweep-anchors` 分支 commit yws。A-030 开工前状态为 `current → deferred（收口结算 2026-09-13）`，本票开工即解除 deferred。
- **必读清单逐条路径**（开工前逐条确认可解析）：
  1. `issues/25-rollout-distribution.md` → `.scratch/architecture-recovery/issues/25-rollout-distribution.md` ✅
  2. `handoffs/25-rollout-distribution.md` → 同目录 handoffs/ ✅
  3. `spec.md §R3-D7` → `.scratch/architecture-recovery/spec.md`（R3-D7 铺开与分发收尾，覆盖 A-030，计划 R3-07）✅
  4. `WORKFLOW.md §4.2` → 同目录 WORKFLOW.md（§4.2.1 版本控制 but / §4.2.2 文件写入 ctx_execute+回读校验 / §4.2.3 atomcode 串行 / §4.2.4 账本落盘 / §4.2.5 报告收口 / §4.2.6 启动器硬规则）✅
  5. `decision-ledger.md`（A-030 行）→ 同目录 decision-ledger.md ✅
  6. `docs/adr/0011-*.md` → `docs/adr/0011-single-repo-subdir-but-branches.md` ✅
- 常驻任务书：`.scratch/macro-audit/handoffs/next-round.md`（轮 4 收口版，T3 明示本票 = R3-07/含 BACKLOG B1/B2/B3 立票建议，开工须用户逐项拍板——本票产物即该拍板入口）。

## §2 调研（per WORKFLOW §4.2.3）

- **atomcode 深度调研**：单轮串行真实执行（atomcode 5.0.9，ctx_batch_execute concurrency=1、timeout=600000，一次跑完未中断）。提示词留档 `reports/25-atomcode-prompt.md`；成稿 `reports/25-atomcode-research.md`（含 §0 通道留痕 + Sufficiency Gate 自查：searches 7 / 全文 6 篇 / 五角度全覆盖）。
- **baseline 回顾**：macro-audit 账本 current 决策（重点 D-016/017/018 + 轮 4 D-020/021）+ spec §R3-D7 + docs/adr/0011（另核对 0008 五层盒子、0012/0013、0014）+ CONTEXT.md 相关术语（分发形态五层盒子/Receipt/10 路径法/共享骨架）。
- **工业对标 ≥2**：实给 4（四市场上架四层闸门 / DoR+DEEP+Release Readiness 三件套 / 演示资产双路径法则 / 版本不可复用+源码包义务），逐条映射见调研报告 §A。
- **冲突点名**：零改向冲突（调研报告 §B）；一处适用性边界如实标注——调研对象为四大成熟插件市场，Agent Plugins 1.0.0 schema 原文未读（已登记于 D-020 派生待决），四层闸门作校准输入外推有效、落地前须补该前置。

## §3 前置清单（本票主产物）

- 落盘 `reports/25-rollout-checklist.md`：§0 实测快照 → §1~§5 BACKLOG B1/B2/B3/B4/B5 全量清点 → §6 plugin 上架条件 P1~P6 → §7 演示资产 D1~D5 → §8 逐项拍板请求汇总（立票类/关闭失实确认类/授权类/范围裁定类）。
- **25 行清单全部带拍板标记**：动作行 24 行标「待用户拍板」+ B4.1 一行标「已被 D-015 取代」（启动器 delta：一行带过不展开，B4.1 全文仅出现 1 次）。
- **每项前置条件可执行判定**（issue 勾项②）：判定列逐行给出 能/部分能/不能 + 需什么。
- **零实施**（issue 勾项③ + prompt delta③）：未执行任何上架/push/立票/删分支动作；唯一写操作 = 本票四份产物落盘 + 账本/lessons 回写。
- **实测抓出的过期前提**（§0 快照 vs BACKLOG 登记文）：①e-branch-1 不存在（B2.2 前提失实）；②根 README.md 已按 D-021 落盘且 BACKLOG「不含代码」表述失实（B3.1 实质闭合）；③origin 已配置（B5-4「仓无远端」半句作废，「push 需明确指令」仍成立）。

## §4 信息缺口（Sufficiency Gate）

| 缺口 | 性质 | 处置 |
|---|---|---|
| Agent 原生市场一手发布规范（MCP Registry / Agent Plugins 1.0.0 schema 原文） | 未读到一手 | 调研报告 §5-1 明示；登记为 P1 前置（D-020 派生待决同源） |
| Cortex/OpsLevel PRR 全文 | 摘要级 | 调研报告 §5-2；以 LaunchDarkly 全文为准 |
| 开源项目 release checklist 实例 | 样例 404 | 调研报告 §5-3；以 LaunchDarkly 模板替代 |
| CWS「90% 三天内过审」 | 未获官方证实 | 调研报告 §5-4；按分歧处理不采纳 |

## §5 完成定义对照（逐项）

| handoff 完成定义项 | 状态 | 证据 |
|---|---|---|
| 前置清单落文并呈报 | ✅ | `reports/25-rollout-checklist.md`（9.2KB；25 行 + §8 拍板汇总） |
| ledger A-030 回写 done | ✅ | `decision-ledger.md` A-030 行 → done → implemented（2026-09-14） |
| WORKFLOW §4 追加 1 行 lessons | ✅ | 2026-09-14 R3 #25 行（文件尾追加） |
| commit msg 引用 A-030 | ✅ | 见 §8 |
| issue 勾项①：B4.1 标「已被 D-015 取代」不立项 | ✅ | 清单 §4 行，全文仅 1 次出现（守卫 C4 机检） |
| issue 勾项②：每项前置条件可执行判定 | ✅ | 判定列逐行（守卫 C3/C6 机检） |
| issue 勾项③：不实施任何上架或 push | ✅ | 零实施声明 + 违禁词扫描（守卫 C5） |
| prompt delta①：清单每行带「待用户拍板」 | ✅ | 守卫 C3 逐行机检 |
| prompt delta②：B4.1 一行带过不展开 | ✅ | 守卫 C4 出现次数断言 |
| 通用调研要求：atomcode + ADR/CONTEXT 回顾 + 对标 ≥2 + 冲突点名 | ✅ | 调研报告 §0/§4；冲突点名 §B 零冲突 |
| 守卫脚本（沿上轮模式） | ✅ | `reports/25-check.mjs` 退出码 0、显式 PASS/FAIL |

## §6 阻塞

- 无上游票阻塞（#24 已闭环）。
- 待用户来料（不阻塞本票闭环，阻塞后续执行）：§8 拍板汇总列出的全部决策点——本票按设计只交付「待拍板清单」，用户逐项拍板后各子项才进入实施。

## §7 lessons 候选（已同步 WORKFLOW §4）

- 「清点/卫生」类票动手前先跑实测快照：BACKLOG 登记前提会被后续轮改写（本票抓出 3 处失实），判定列必须写实测结果而非复述原文。
- 「每行标拍板状态」「一行带过」类启动器 delta 由守卫逐行机检兜底（标记缺失扫描 + 出现次数断言），不靠自述。

## §8 版本控制处置（WORKFLOW §4.2.1）

- 独立 but 分支 `25-rollout-distribution`（本 session 专用，不动他人分支；与其他在飞分支并行隔离）。
- commit message：`25: close A-030 — 铺开与分发收尾前置清单清点落文（25 行全标待用户拍板 + B4.1 已被 D-015 取代一行带过）+ atomcode 调研（四层上架闸门/演示资产双路径/DoR+DEEP+PRR，13 源零冲突）+ 守卫 25-check.mjs PASS exit 0；ledger A-030 → implemented；WORKFLOW §4 lessons +1`
- 不 push、不合并、不动历史（push/合并一律等用户明确指令，per 常驻任务书纪律 5）。

## §9 引用文件

- 本票产物：`reports/25-atomcode-prompt.md` / `reports/25-atomcode-research.md` / `reports/25-rollout-checklist.md` / `reports/25-check.mjs` / 本报告
- 必读清单：`issues/25-rollout-distribution.md`、`handoffs/25-rollout-distribution.md`、`spec.md` §R3-D7、`WORKFLOW.md` §4.2、`decision-ledger.md` A-030 行、`docs/adr/0011-single-repo-subdir-but-branches.md`
- 常驻任务书与决策源：`.scratch/macro-audit/handoffs/next-round.md`、`.scratch/macro-audit/decision-ledger.md`（D-016~D-021）、`.scratch/architecture-recovery/BACKLOG.md`、`CONTEXT.md`
- 实测锚：`engine/plugin.json`、`engine/.claude-plugin/plugin.json`、`engine/mcp.json`、`engine/manifest.meta.json`、`engine/package-lock.json`、根 `README.md`、`docs/decisions/`、`reports/23-first-report.{md,json}` + `23-first-report-failure.{md,json}`、but branch list / git branch -a / git remote -v 输出
