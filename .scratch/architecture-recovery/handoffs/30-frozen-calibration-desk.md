# Handoff: 30 — 阶段 2a 冻结校准（10 项 desk 清单）

- **A-xxx covered:** A-035
- **Decision:** spec.md §R4-D5
- **对应 issue:** issues/30-frozen-calibration-desk.md
- **对应 prompt:** prompts/30-frozen-calibration-desk.md

## 上下文摘要（3-5 句）
阶段 2 拆 2a/2b（D-023）：2a 在冻结首报数据（228 条事实，仅 git CLI + DuckDB 采集面）上做纯文档校准；三问决策树（D-024）归类——本票只做 desk 类（spec 契约 + 冻结数据可推导）。10 项清单 = spec-phase-tasks 任务 2/4/8/9/10/11/12/13/14/15/16 + 任务 5 已锚行 + 任务 7 单写者域草案。全部草案标注置信域；待探针占位（上游探针/自证探针类）按两字段纪律登记，防退化死锁。

## 完成定义（本票 done 判据）
- 10 项 desk 校准草案落 reports/30-*.md（逐项带置信域标注）；待探针占位两字段齐全；ledger A-035 回写 done；WORKFLOW §4 追加 1 行 lessons；commit msg 引用 A-035；守卫 reports/30-*.mjs PASS（exit 0）

## 通用调研要求（每票适用，写一次）
- **atomcode 深度调研**（per WORKFLOW §4.2.3）：回顾 baseline（macro-audit 账本 current 决策，重点 D-023 ~ D-025）、spec.md §R4、仓库现状；输出调研报告含推荐方案；与任何 current 决策冲突时显式点名，不得静默改向
- **回顾 docs/adr/**：本票相关 ADR（见下方关键参考），理解约束与心智
- **回顾 CONTEXT.md**：50 术语中与本票相关项（Domain 语言不得绕开）
- **对标工业界成熟方案**：调研报告中列举 ≥2 个成熟心智模型/工具/论文作类比

## 阻塞
- #27, #28（W8 双票结题 = R4-02 入库 + 治理票闭环，序列化纪律）

## 关键参考
- spec-phase-tasks.md 任务 2/4/5/7/8~16 行；reports/23-measurements.json + 23-fixtures.json（冻结数据）；reports/24-calibration-map.md（16 缺口登记 + 已锚行）；docs/adr/0015 §Decision-1（三问决策树）
- CONTEXT.md「Self-probe」词条（自证探针两字段纪律）
