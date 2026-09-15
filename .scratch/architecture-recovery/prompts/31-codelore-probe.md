# Prompt: 31 — 阶段 2b CodeLore 单上游探针

- A-xxx: A-036
- Decision: spec.md §R4-D6
- Blocked by: #30
- 身份: 遵循 WORKFLOW.md §2 的开发 Agent，本票唯一目标 = 完成本票闭环
- 必读清单（动手前逐条确认可解析）:
  - issues/31-codelore-probe.md
  - handoffs/31-codelore-probe.md
  - spec.md §R4-D6
  - WORKFLOW.md §4.2
  - decision-ledger.md（A-036 行）
  - docs/adr/0008-*.md
  - docs/adr/0014-*.md
  - docs/adr/0015-*.md
  - reports/R5-Q3-atomcode-research.md
  - README.md（上游清单表）

## 专属 delta（检查点）
- 先落两个前置：运行时解析策略判定（容器捆绑 vs 二进制发现）+ Agent Plugins 1.0.0 plugin schema 原文 P1 预核对 baseline
- atomcode 调研 = 运行时解析策略判定（-p 只放问题、串行、timeout 600000、续跑锚定）
- 适配层禁业务规则（ADR-0014）；锁版本 + golden 契约测试
- provenance 三锚：commit pin + spec 版本 + data fingerprint
- README 上游清单 CodeLore 行状态更新走 $readme-crafter-skill，不虚报可安装

## 专属验收
- 前置两件 + 适配器/golden 契约 + 重跑 diff + 漂移报告 + 任务 1/3 实测锚 + README 状态列 + 守卫 PASS
- 其余完成判据遵循 handoff 内的完成定义

## 开工第一句
先复述：本票阻塞状态 + 必读清单逐条路径，确认后再动手。

## 收尾
报告写入 reports/31-report.md（完成定义逐项 / 阻塞 / lessons 候选 / 引用文件）；ledger 回写与 lessons 追加按 handoff 完成定义执行；版本控制遵循 WORKFLOW §4.2。
