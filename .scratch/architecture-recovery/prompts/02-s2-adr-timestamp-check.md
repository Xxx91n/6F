# Prompt: 02 — S2 ADR 质量事后补写判定

- A-xxx: A-002
- Decision: spec.md §Decision 4.2
- Blocked by: #05
- 必读清单:
  - issues/02-s2-adr-timestamp-check.md
  - handoffs/02-s2-adr-timestamp-check.md
  - spec.md §Decision 4.2
  - WORKFLOW.md §4.2
  - decision-ledger.md A-002
  - docs/adr/0004-*.md

## 专属 delta（仅本票特有 — 检查点）
- 必须扫描真实仓库（不可纯理论）
- 回退方案必须验证精度
- 扫描工具输出可复用（脚本）
- 1) 至少 3 个真实仓库的 ADR YAML 头一致性扫描报告；2) 缺失头时的回退方案（如"按 git blame ADR 文件 first commit 时间替代"）；3) 回退方案的精度验证（与带头仓库对比）

## 专属验收（仅本票特有 — 完成定义）
- [ ] 必须扫描真实仓库（不可纯理论）
- [ ] 回退方案必须验证精度
- [ ] 扫描工具输出可复用（脚本）
- [ ] 1) 至少 3 个真实仓库的 ADR YAML 头一致性扫描报告；2) 缺失头时的回退方案（如"按 git blame ADR 文件 first commit 时间替代"）；3) 回退方案的精度验证（与带头仓库对比）

## 开工第一句
窗口必须先复述本票的 Blocked by (#05) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/02-report.md。