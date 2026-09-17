# 分发形态 = Agent Plugin 五层盒子（双 manifest）
> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。
> 勘误补记（D-055，2026-09-17）：层④ hooks 释义收窄为「可选呈现面/规范合法声明位」——宿主专属非可移植组件（Agent Plugins 1.0.0 v1 可移植组件恰=skills＋mcp.json；宿主命名空间惯例=VS Code/Copilot 读 com.github.copilot/hooks/hooks.json、Claude 读插件根 hooks/hooks.json，com.macroaudit.* 自造命名空间在一切宿主侧 inert）；现为声明位无 hook 实物，实建走 registry hooks-presentation-face 触发器（激活条件=真实呈现需求信号，激活动作=最小 Stop/PostToolUse 呈现面按目标宿主命名空间落位）。排歧：CONTEXT Micro-A「触发器为每次 push 或 hook」的 hook 指 git/CI 语义非本层。决策本体（五层盒子、hooks 永不作裁决执行点）不改写。

## Context

决策理由：atomcode 调研 2026-09-12（三引擎 10 查询 × 13 原文 × 8 域名）实证——纯 skill 包可被跳过且注入攻击 80% 成功率（arXiv Skill-Inject）；独立完整 CLI 与默认模式（agent 内嵌）的分发渠道不同形；SaaS 被 ADR-0003 排除；hooks 因 190 项失效清单 + issue #21460 + SoundGate 论文永不承载裁决；与已封口默认模式同形是硬约束。

## Decision

产品交付形态 = Agent Plugins 1.0.0 标准盒子：plugin.json + skills/ 方法论壳（SKILL.md + 战略叙事 rubric）+ mcp.json（kernel MCP 只读证据查询面，stdio 指向 DuckDB 事实表）+ 反向域名扩展目录（hooks 仅作触发/呈现：PostToolUse/Stop 呈现 receipt、注入证据就绪上下文）+ 随分发核心确定性 CLI（编排证据管线 + 联邦裁决 + 产出报告；同一二进制四外壳：插件内嵌 / GitHub Action / 自用 CLI / 报告生成器）。发布采用双 manifest——标准 plugin.json 与 Claude Code 原生 .claude-plugin/plugin.json 并行，由构建脚本从单一元数据源生成以防漂移（Anthropic 不在 Agent Plugins TSC 名单；Claude Code 对标准仅部分兼容，issue #88906）。

## Consequences

安全纪律：skill 壳只读隔离——判定/写库/出报告只能内核 CLI 执行，skill 仅调只读 MCP 查询面；hooks 永不作裁决执行点；随分发附 provenance 纪律（license + CHANGELOG + 签名收据）。

Status: accepted
