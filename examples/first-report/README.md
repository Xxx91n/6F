# examples/first-report — 6F 自审真实首报样例（happy + failure 双对）

> 披露制样例（决策来源 D-030）：本目录四件为 **6F 仓自身经 Macro-B 管线实跑产出的真实审计报告**，非合成 fixture、非手写示意。
> **冻结时点属性**：读数反映生成时点（2026-09-13）的仓状态与判据版本——请按历史快照阅读，**不得被读作「当前读数」**。

## 四件清单

| 文件 | 内容 |
|---|---|
| `23-first-report.md` | Macro-B 首报 · 人读形态（happy path，overall_verdict = unsupported） |
| `23-first-report.json` | 同报告 · 机器可读侧车（receipt / 裁决块 / 引文校验全量） |
| `23-first-report-failure.md` | failure 路径演示 · 人读形态（降级产出 ⚠ unverified，overall = insufficient） |
| `23-first-report-failure.json` | 同报告 · 机器可读侧车 |

## 生成溯源（披露四要素）

- **真实产物声明**：对 6F 仓自身的真实 Macro-B 审计（dogfooding 首报）实跑产出，非合成 fixture、非事后补写的示意文本；happy 双件为实跑产物原样复制。
- **生成 commit**：`fc00d458e215cc9a7a26af81626dec8712622821`（subject_ref = `6F@fc00d458…`；receipt 双锚 commit + tree `6f405cfc2ce5…`）。
- **生成日期**：`2026-09-13T14:31:09+08:00`（generated_at；receipt `RCP-9d20125ad0976c86` / `RCP-1f603ed7b3032f0a`）。
- **重生成命令**：`node .scratch/architecture-recovery/reports/23-first-report.mjs`——脚本审计 **HEAD**，须在工作树处于生成 commit `fc00d458…` 的状态下运行方可复现同读数；判据版本 = `22-criteria-pre-registration` 预声明快照（跑后禁调）。

## 诚实标注

- **failure 件性质**：failure 双件由同一实跑报告经 `degradeReport(FP-2)` 确定性降级渲染产出——演示「docs/adr 采集域空事实 → 主前提不可裁定 → GapRequest → ⚠ unverified 回执」的降级形态，**不是一次真实采集事故的记录**。
- **unsupported 裁定口径**：TC-2 判红（ADR Status/Date 缺失率 84.62% > 预声明阈值 0.50）为判据口径下的合法裁定，非管线故障；正/负对照全 PASS 证明管线活性。
- **契约时点差**：四件生成于 2026-09-13，早于 `preview_disclosure` 披露块契约（ADR-0017 / D-037②，2026-09-16 首实现）——侧车 JSON 无 `preview_disclosure` 字段属时点事实，非缺失缺陷；演示级披露块实物见 `engine demo` 合成 fixture 产物。
- **溯源链**：原件保留于 `.scratch/architecture-recovery/reports/`（复制非移动）；CI 重渲染 fixture 并 diff 的 golden 校验为 #43 登记票（禁自动重生成直通 main）。
