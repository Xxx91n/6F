# Prompt: 26 — 阶段 1.5 量测审计

- A-xxx: A-031
- Decision: spec.md §R4-D1
- Blocked by: None（可立即开工）
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/26-adr-measurement-audit.md
  - handoffs/26-adr-measurement-audit.md
  - spec.md §R4-D1
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-031 行）
  - docs/adr/0015-*.md
  - reports/23-measurements.json
  - reports/22-criteria-pre-registration.md

## 专属 delta（检查点）
- 真值表覆盖 = 首报冻结时点 docs/adr/ 全集 14 份（ADR-0015/0016 冻结后新增，不入表）
- 每份五字段逐项读数：Status / Date / Deciders / Context / Decision，标「存在 / 缺失 / 内联 Nygard 变体」
- delta 表模板分列「detector 漏认」与「真实缺失」，逐份可归属原因可指认
- 本票纯文档零构建：出现 engine/ 或 docs/adr/ 改动 = FAIL
- atomcode 调研聚焦 OOS Phase 1 清单 / MSA attribute agreement 表式

## 专属验收
- 三件套产物落盘（真值表 + delta 模板 + 可归属原因登记）且守卫 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/26-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
