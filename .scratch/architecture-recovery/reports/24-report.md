# 24 — 缺口回流实测锚清扫（A-028 / spec §R3-D6）

## §1 开工复述（per 启动器「开工第一句」）

- **阻塞状态**：`Blocked by: #23` —— **已解除**。#23 于 2026-09-13 闭环（首报 + 三闸验收 + C 层人裁定 supported 回写账本）；README Frontier 重算确认 W5 = #24 可开工。A-028 开工前状态为 `current → deferred（收口结算 2026-09-13）：下一波候选`。
- **必读清单逐条路径**（开工前逐条确认可解析）：
  1. `issues/24-gap-sweep-anchors.md` → `.scratch/architecture-recovery/issues/24-gap-sweep-anchors.md` ✅
  2. `handoffs/24-gap-sweep-anchors.md` → 同目录 handoffs/ ✅
  3. `spec.md §R3-D6` → `.scratch/architecture-recovery/spec.md`（R3-D6 缺口回流实测锚清扫，覆盖 A-028）✅
  4. `WORKFLOW.md §4.2` → 同目录 WORKFLOW.md（§4.2.1 版本控制 but / §4.2.2 文件写入 ctx_execute+回读校验 / §4.2.3 atomcode 串行 / §4.2.4 账本落盘 / §4.2.5 报告收口 / §4.2.6 启动器硬规则）✅
  5. `decision-ledger.md`（A-028 行）→ 同目录 decision-ledger.md ✅
  6. `docs/adr/0013-*.md` → `docs/adr/0013-three-layer-acceptance-gates.md` ✅

## §2 调研（per WORKFLOW §4.2.3）

- **atomcode 深度调研**：两轮串行真实执行（atomcode 5.0.9，ctx_batch_execute concurrency=1，共享配额无并发）。轮 1 = 审计/审查类产品「第一份真报告」先例（CodeScene / GitClear / Structure101 / Sonar），15 源、9 次原文读；轮 2 = B 层 kill criterion 多仓迁移有效性（Just 2014 / Papadakis 2018 / ISO 13528 / ICH E10 / OWASP Benchmark），13 源、8 次全文读（含 3 篇 PDF 深读）。提示词留档 `reports/24-atomcode-prompt.md`；成稿 `reports/24-atomcode-research.md`（含 Sufficiency Gate 自查）。
- **baseline 回顾**：macro-audit 账本 D-016/017/018（current）+ spec §R3-D6 + docs/adr/0012、0013 + CONTEXT.md 相关术语（Value Validation Loop / Acceptance Gate / Kill Criterion / Positive Control / Receipt）。
- **工业对标 ≥2**：实给 6（CodeScene 校准三回路 / GitClear 嗅探测试+可下钻 / Just+Papadakis 复制链 / ICH E10 三臂+ISO 13528 判据独立性 / OWASP Benchmark 三失效模式+Youden / Stryker baseline+Google diff-only+NIST Juliet），逐条映射见调研报告综合段 §A。
- **冲突点名**：无改向冲突；两处张力显式记录（调研报告综合段 §B）：①正对照→真判据外推强度为「中-强、有条件」（Papadakis 规模混杂 / ISSTA 2026 场景依赖），处置=多仓复核以「下限门禁而非质量度量」对冲，不改 D-018；②「误报率上报回路」在四家先例中基本空白，本仓负对照复核路径设计反而领先先例——只作校准输入记录。
- **首报实测锚接入**：23-report §4 缺口段实测锚（@duckdb/node-api 原生包缺包 → JSONL 同形态降级）+ 首报双产物同源生成（generate.ts → md+json 侧车）进入校准输入。

## §3 校准输入映射清单（双产物之二）

- 落盘 `reports/24-calibration-map.md`：§1 既有缺口登记表（16 项 active + R2Q7-6 性质变化吸收，编号全集 = macro-audit 2026-09-12-report.md §12.5）；§2 校准输入 CI-01~04（→ D-013-2 / R2Q7-3 / R2Q7-4 / R2Q7-5）；§3 无校准输入缺口 12 项如实标注；§4 边界声明。
- **不新造缺口**：CI 行指向由守卫机检（KNOWN 17 编号全集校验 + 新造编号扫描 0 命中）。调研新增开放问题留在调研报告自身缺口段（轮1 §5 ×4 / 轮2 §6 ×4），未升格。
- **不改写首报**：TC-1 INCONCLUSIVE / TC-2 RED / TC-3 AMBER / PC 2/2 / NC-1 零命中 / C 层人裁定 supported 全部维持原状；B 层判据 v1 仍锁定，复核计划为阶段 2 执行输入而非判据修订。

## §4 信息缺口（Sufficiency Gate）

| 缺口 | 性质 | 处置 |
|---|---|---|
| Structure101 v1 时期（2006 前）首报形态 | 无一手材料 | 调研报告轮1 §5-1 明示；archive.org/JavaOne 2003-2005 为后续路径 |
| GitClear 首个付费客户 + Diff Delta 相关性原始研究页 | 未展开抓取 | 调研报告轮1 §5-2 明示 |
| Sonar 早期质量门阈值（SQALE 技术债比率）标定数据 | 未深挖 | 调研报告轮1 §5-3 明示 |
| ISO/IEC 17043 Annex B 方案设计原文 | 未深读 | 调研报告轮2 §6-1 明示；多仓复核方案级设计目前以 ISO 13528 侧写 |
| OWASP 官方对调参基准的正式回应 | 未见 | 调研报告轮2 §6-2 明示 |
| 「审计工具×种子缺陷」正对照外推强度 | 无直接文献 | 调研报告轮2 §6-3 明示；以「下限门禁非质量度量」对冲 |
| 锚定仓「历史缺陷→可触发审计路径」转换率 | 无先验数据 | 调研报告轮2 §6-4 明示；建议判据 v1 附预注册 pilot 记录该数字 |
| 12 项既有缺口无校准输入 | 本轮调研范围外 | 映射清单 §3 如实标注，维持 open/部分 |

## §5 完成定义对照（逐项）

| handoff 完成定义项 | 状态 | 证据 |
|---|---|---|
| 调研报告落盘 | ✅ | `reports/24-atomcode-research.md`（39,544 bytes；两轮成稿 + 综合段） |
| 校准输入映射清单落盘 | ✅ | `reports/24-calibration-map.md`（6,276 bytes；16 项登记表 + CI-01~04） |
| ledger A-028 回写 done | ✅ | `decision-ledger.md` A-028 行 → done → implemented（2026-09-14） |
| WORKFLOW §4 追加 1 行 lessons | ✅ | 2026-09-14 R3 #24 行（文件尾追加） |
| commit msg 引用 A-028 | ✅ | 见 §8 |
| issue 勾项①：atomcode 调研执行，来源可回查 | ✅ | 28 源全带 URL；守卫 C5（url-like refs=43） |
| issue 勾项②：校准输入逐条映射缺口编号（不新造） | ✅ | 守卫 C7/C8（17 编号全集 / CI 行⊆KNOWN / 新造编号 0 命中） |
| issue 勾项③：只作校准输入，不阻塞不改写首报 | ✅ | 守卫 C9a/b/c + 映射清单 §4 边界声明 |
| prompt delta：映射只允许既有 16 项缺口编号 | ✅ | 守卫 C7a/C7b（16 active 声明 + R2Q7-6 性质变化标注） |
| prompt delta：调研结论只写「校准输入」段 | ✅ | 调研报告综合段 §C + 映射清单 §2 |
| 守卫脚本（沿上轮模式） | ✅ | `reports/24-check.mjs` **34/34 PASS（退出码 0）** |

## §6 阻塞

- 无上游票阻塞（#23 已闭环）。
- 无待用户来料：本票产物均为 agent 侧交付（调研报告 + 映射清单 + 复核计划骨架）；多仓复核实跑属阶段 2，非本票范围；#25 的分发拍板与 push 授权仍悬置（不阻塞本票闭环）。

## §7 lessons 候选（已同步 WORKFLOW §4）

1. 缺口清单的「N 项」口径必须先溯源再登记：本票 16 项 = macro-audit §12.5 的 5+4+8−1（R2Q7-6 性质变化）；R2Q7-1/2/7/8 与 D-013-3/D-012-1/3/2 是同一缺口的两轮登记承继对，不显式标注会把 17 行误当 17 项。
2. 「只允许指向既有编号」类约束必须落成守卫机检（编号全集校验 + CI 行⊆KNOWN + 新造编号正则扫描），自述约束不可信。
3. 无输入缺口如实标注「本轮未覆盖」是合法且必要的映射形态——映射清单的完备性在「每行指向合法」而非「每缺口都有输入」。

## §8 版本控制处置（WORKFLOW §4.2.1）

- 全程走 `but` CLI，未使用任何 git write 命令。
- 独立分支：`24-gap-sweep-anchors`（本 Agent session 专用；不动 grill-r4 等他 agent 栈）。
- commit message 引用 A-028 + 守卫结果（24-check.mjs 34/34 PASS，退出码 0）。
- 未 push（push 授权仍悬置，per 收口归档「push 与落 main 等用户明确指令」）。

## §9 引用文件

| 文件 | 作用 |
|---|---|
| `.scratch/architecture-recovery/issues/24-gap-sweep-anchors.md` | 完成判据 |
| `.scratch/architecture-recovery/handoffs/24-gap-sweep-anchors.md` | 完成定义 |
| `.scratch/architecture-recovery/prompts/24-gap-sweep-anchors.md` | 启动器（本票常驻任务书） |
| `.scratch/architecture-recovery/spec.md` §R3-D6 | 规范来源 |
| `docs/adr/0012-value-validation-loop-first.md` / `0013-three-layer-acceptance-gates.md` | 主干与三层闸门约束 |
| `.scratch/macro-audit/decision-ledger.md` D-016/D-017/D-018 | baseline current 决策 |
| `.scratch/macro-audit/reports/2026-09-12-report.md` §12 | 16 项缺口编号来源 |
| `.scratch/macro-audit/reports/R3-Q1-atomcode-research.md` §7 / `R3-Q3-atomcode-research.md` §7 | 本票两项调研的原始登记缺口 |
| `reports/23-first-report.md` / `.json` / `23-gates.json` / `23-report.md` §4 | 首报实测锚 |
| `reports/24-atomcode-prompt.md` / `24-atomcode-research.md` / `24-calibration-map.md` / `24-check.mjs` | 本票产物 |
