# 26-report — 阶段 1.5 量测审计（A-031 / spec §R4-D1）

## §0 开工复述

本票 Blocked by None（W7 串行门，可立即开工）。必读清单已逐条读取：issue/handoff/spec §R4-D1/WORKFLOW §4.2/ledger A-031 行/ADR-0015/23-measurements.json/22-criteria-pre-registration.md。本票唯一目标 = 14 份 ADR 人工真值表 + 逐份 delta 表模板，先于一切 v2 代码。

## 调研

- **通道**：`ctx_batch_execute`（Bash）→ `atomcode -p "<question>"` 单问题串行，timeout 600000；resume 锚 = `cc4bd156-319a-4040-b49d-2eaea2bed537`（索引 label = atomcode-r6-26）。
- **基线回顾**：macro-audit 账本 D-023~D-025 + spec §R4-D1 + 仓库现状（冻结集 fc00d458 = 13 份 ADR）。
- **工业先例（≥2，含冲突点名）**：
  1. **AIAG MSA 计数型 AAA 真值表**（MSA 手册 3rd p127/4th p134，经 SigmaXL/Minitab 双重印证）：Part/Appraiser/Assessed Result/Reference 四列 + Type I（好判坏=测量系统误读）/Type II（坏判好=真实缺失漏放）误分类分解 —— 本票 fields[] 每格 truth_present vs v1_present 即同构，detector-miss-* = Type I 类，real-gap = 真实缺失。
  2. **FDA OOS 指南 2022 §III Phase I 七步 + §211.192 书面记录**：登记表字段先例（OOS 编号/逐项检查/假设记录/归因结论）；纪律 = 「复测合格不构成可归属原因」「human error 须追溯到系统性缺口」——本票 AC 登记簿以「回退链未接线（系统性缺口，ADR-0015 Context 有档可查）」为可归属原因，非事后合理化。
  3. **对接规则（来源 1 二分）**：OOS 来源二分 = measurement process aberration vs manufacturing process aberration——本票 delta 分类同构（detector-miss = 测量过程侧，real-gap = 文档/生产侧）。
- **冲突点名**：无（调研结果与 D-025 既有措辞一致，未构成改向）。
- **信息缺口（调研自报）**：AIAG 原文页为付费标准（二手印证）；AAA→OOS 对接为最佳实践推断（中置信）；两抓源 403 已换源补读。不影响本票表结构合法性。

## 完成定义对照

| 判据 | 结果 | 证据 |
|---|---|---|
| 14 份 ADR 逐份读数表落盘（五字段 + Nygard 形态识别） | ✅ | reports/26-truth-table.md §1（14 行，逐格 form@line）+ 26-truth-table.json files[] |
| 逐份 delta 表模板（漏认 vs 真实缺失分列） | ✅ | 26-truth-table.md §2 冻结集 65 格分类 + §4 移交模板 |
| 逐份可归属原因登记（供 RED invalid 判定 + golden set 复用） | ✅ | §3 登记 AC-26-1~5；每个 v1-miss 格可归 AC（守卫 A5-A8） |
| 纯文档零构建 | ✅ | 守卫 D1/D2：docs/adr + engine/ 零改动、23-measurements.json 未动 |
| 守卫脚本 PASS exit 0 | ✅ | `node 26-check.mjs` → GUARD RESULT: PASS (18 pass, 0 fail) |
| ledger A-031 回写 + lessons + commit 引 A-031 | 本次提交执行 | 见版本控制处置 |

## 关键发现（报送首脑）

1. **真值 mean_ratio = 0.4923**（v1 读 0.2462）：RED 方向成立但归因纠正——Status 真实缺失 0/13（v1 称 84.62%，全部 Type I 误读：裸行 `Status:` ×9 + bold `**Status:**` ×2）；Date 真实缺失 6/13（v1 称 11/13；0002/0008/0009/0010/0011 内联可恢复）；三节结构缺失 9/13 全部为真实缺失（散文承载、无 `## ` 标记节）。
2. **v1 复跑复现**：实跑真实 detector 代码（engine/src/collect/collectors.ts，Node 24 直导入）对冻结集再算 mean_ratio = 0.2462 与逐格读数 65/65 一致 → 量测审计读数可复跑。
3. **ADR-0014 post-freeze 预警**：若未来纳入扫描面，其 Consequences/Options 裸行标签（全角冒号）将被 v1 漏认——已登记 AC-26-5 供 #27 规则评审。
4. **集合口径差异**：任务书称「14 份」而冻结集实为 13 份（0014 冻结后 2026-09-14 入库）——本票两者皆覆（13 冻结对照 + 0014 post-freeze 行），golden set 一致率口径 = 冻结集 65 格。

## 阻塞

- 无。本票解锁 #27（golden set 已就位）与 #28（real-gap 33 格清单已就位）。

## lessons 候选

- 真值表生成先用实跑 v1 代码锁定 v1 逐格读数、再做人工形态判定，可消除「凭记忆写真值」风险；守卫内嵌实跑复现（C2/C3）比静态快照更硬。
- Node 24 可直接 import engine/src/*.ts（type-stripping）——守卫可直引真实 detector，不必复制逻辑（但注意 Windows 下绝对路径需 pathToFileURL）。

## 引用文件

- 产物：reports/26-truth-table.md / reports/26-truth-table.json / reports/26-check.mjs / reports/26-report.md（本文件）
- 证据源：docs/adr/0001~0014（frozen @fc00d458 + 0014 工作树）、reports/23-measurements.json、reports/02-adr-fallback.mjs、engine/src/collect/collectors.ts、reports/22-criteria-pre-registration.md §3.2
- 调研：atomcode-r6-26（ctx 索引；resume cc4bd156-319a-4040-b49d-2eaea2bed537）

## 版本控制处置

- 本票产物计划提交至分支 `26-adr-measurement-audit`（叠于 r6-ticket-scaffold 之上），commit msg 引用 A-031 + 守卫结果。未 push（push 属用户闸门）。

## 覆盖口径勘误补注（2026-09-15 返修窗口）

- 真值表覆盖 14 份 = 13 冻结 + 0014 post-freeze；ADR-0015/0016 同为 post-freeze 但未纳入真值表（当时 docs/adr 全集 14 份字面达成，0015/0016 后续入库）。豁免费口径注明于此；如需覆盖，另立增补票不重开本真值表。
