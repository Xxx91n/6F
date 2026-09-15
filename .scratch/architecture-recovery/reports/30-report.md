# 30-report — 阶段 2a 冻结校准（A-035 / spec §R4-D5）

## §0 开工复述
本票 Blocked by R4-02 入库（✓ pov+uvr+orr 已 commit）。必读已读：issue/handoff/spec §R4-D5/D-023/D-024/spec-phase-tasks.md 任务表/23-measurements.json/24-calibration-map.md。范围 = 13 项冻结校准（11 desk 草案 + 任务 5 已锚行 + 任务 7 单写者域草案）。

## 调研
- 本票为 desk calibration（D-024 Q3 类：契约+冻结数据推导，不涉外部探针）——调研输入复用既有原子锚（atomcode-r6-26/27 + 24-calibration-map CI-01~04 + R5-Q3 报告），未新跑 atomcode（串行纪律下无新增外部问题）。
- 冲突点名：无（与 D-023/D-024 既定分类一致）。

## 完成定义对照
| 判据 | 结果 | 证据 |
|---|---|---|
| 10+ 项 desk 校准草案落盘逐项标置信域 | ✅ | 30-desk-calibration.md/.json：13 行（任务 2/4/8~16 desk 草案 + 5 已锚行 + 7 单写者域草案），置信域列逐项非空 |
| 待探针占位两字段（满足判据+复审时点） | ✅ | 10 项占位全带 satisfaction+review（守卫 A6） |
| 不改冻结数据、不接新上游 | ✅ | 守卫 C1：23-*/engine/docs-adr 零改动 |
| 单写者证据禁外推 | ✅ | 任务 2/4/7 置信域显式标注（守卫 A3/A4） |
| 守卫 PASS exit 0 | ✅ | `node 30-check.mjs` → PASS 9/9 |

## 阻塞
无。解锁 #31（R4-04 结题 ✓）。

## lessons 候选
- 校准清单用 JSON 结构化承载（30-desk-calibration.json）再由 md 渲染——守卫可机检「置信域非空 + 占位两字段齐备」，比散文清单硬。

## 引用文件
- 产物：reports/30-desk-calibration.json / 30-desk-calibration.md / 30-check.mjs / 30-report.md
- 证据源：23-measurements.json、23-facts.jsonl（228 行）、24-calibration-map.md、engine/src/fact/schema.ts、spec-phase-tasks.md

## 版本控制处置
- 分支 `30-frozen-calibration-desk`（叠于 29-c-disposition-reopen），commit 引 A-035。
