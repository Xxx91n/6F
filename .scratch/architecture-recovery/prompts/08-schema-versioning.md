# Prompt: 08 — Schema 版本演进规则

- A-xxx: A-008
- Decision: spec.md §Decision 5.2
- Blocked by: #07
- 必读清单:
  - issues/08-schema-versioning.md
  - handoffs/08-schema-versioning.md
  - spec.md §Decision 5.2
  - WORKFLOW.md §4.2
  - decision-ledger.md A-008
  - docs/adr/0005-*.md

## 专属 delta（仅本票特有 — 检查点）
- 注册中心位置必须确定（库？文件？HTTP 服务？）
- 版本号必须明确语义
- 1) Schema 注册中心位置与 API；2) 版本号语义（主/次/补丁含义）；3) 消费者订阅机制（订阅哪个版本、跨版本兼容策略）；4) Schema 变更触发的事件契约

## 专属验收（仅本票特有 — 完成定义）
- [ ] 注册中心位置必须确定（库？文件？HTTP 服务？）
- [ ] 版本号必须明确语义
- [ ] 1) Schema 注册中心位置与 API；2) 版本号语义（主/次/补丁含义）；3) 消费者订阅机制（订阅哪个版本、跨版本兼容策略）；4) Schema 变更触发的事件契约

## 开工第一句
窗口必须先复述本票的 Blocked by (#07) + 必读清单中的全部路径，确认理解后方可动手。

## 收尾
完成定义见 handoff（与本票 ## 专属验收 段语义对齐）；版本控制遵循 WORKFLOW §4.2.1；通用调研要求遵循 handoff；报告写入 reports/08-report.md。