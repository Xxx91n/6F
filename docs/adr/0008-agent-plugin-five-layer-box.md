# 分发形态 = Agent Plugin 五层盒子（双 manifest）
> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。

## Context

决策理由：atomcode 调研 2026-09-12（三引擎 10 查询 × 13 原文 × 8 域名）实证——纯 skill 包可被跳过且注入攻击 80% 成功率（arXiv Skill-Inject）；独立完整 CLI 与默认模式（agent 内嵌）的分发渠道不同形；SaaS 被 ADR-0003 排除；hooks 因 190 项失效清单 + issue #21460 + SoundGate 论文永不承载裁决；与已封口默认模式同形是硬约束。

## Decision

产品交付形态 = Agent Plugins 1.0.0 标准盒子：plugin.json + skills/ 方法论壳（SKILL.md + 战略叙事 rubric）+ mcp.json（kernel MCP 只读证据查询面，stdio 指向 DuckDB 事实表）+ 反向域名扩展目录（hooks 仅作触发/呈现：PostToolUse/Stop 呈现 receipt、注入证据就绪上下文）+ 随分发核心确定性 CLI（编排证据管线 + 联邦裁决 + 产出报告；同一二进制四外壳：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。发布采用双 manifest——标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json 并行，由构建脚本从单一元数据源生成以防漂移（Anthropic 不在 Agent Plugins TSC 名单；Claude Code 对标准仅部分兼容，issue #88906）。

## Consequences

安全纪律：skill 壳只读隔离——判定/写库/出报告只能内核 CLI 执行，skill 仅调只读 MCP 查询面；hooks 永不作裁决执行点；随分发附 provenance 纪律（license + CHANGELOG + 签名收据）。

Status: accepted
