# Handoff: 50 — 叙事双轨落地

- **A-xxx covered:** A-057
- **Decision:** spec-phase-tasks.md R9-01＋D-053（+D-057④/D-026 派生）
- **对应 issue:** issues/50-narrative-dual-track.md
- **对应 prompt:** prompts/50-narrative-dual-track.md

## 上下文摘要
D-053 拍板 (c) 双轨：壳内 rubric＋宿主 agent 叙事＋kernel 盖章=主路；kernel 模板叙事=degraded 兜底位。宿主 agent 经 MCP facts 投影读数（ADR-0014 不经 CodeLore 适配层），叙事段只带引文锚，kernel sealNarrative 逐 claim 盖章＋band 红线机检。

## 完成定义
- references 三件在位＋SKILL.md 加载条件＋frontmatter（R2-Q7 #4/#5）
- sealNarrative 三态＋失败明细 token↔evidence＋band 违规机检 rejected
- mcp facts 只读投影 stub 可用（e2e 实证）
- degradeReport 模板叙事兜底（kernel-template/⚠ unverified）
- registry narrative-surface-landed occurred＋评测面 triggered-bound＋#52 立案
- narrative.test 25/25 入 smoke＋50-check PASS

## 阻塞
无（已闭环）。评测票 #52 待铺开窗口后段。
