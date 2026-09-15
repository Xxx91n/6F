# ADR-0016: 分发渠道方向 = 纯 Agent Plugins 生态（通用市场不进入、不占位、不注册）

- Status: accepted
- Date: 2026-09-15
- Deciders: 用户（grill 轮 5 Q6，承接 D-026 例外 2「方向层按一扇门+铅垂期规则现在拍」）
- Ledger: D-026 / D-027（current）；承继 ADR-0008（五层盒子形态不变）

## Context

#25 前置清单 P5 行要求选定目标市场（Agent Plugins 生态 vs 通用市场）。调研（R5-Q5）确认 publisher 身份类决策是一扇门（VS Code 官方：publisher ID 创建后不可改）且凭据/审核存在长铅垂期——铅垂期把最迟拍板时点（LRM）前移，「撞墙才拍」等于拍晚了；同时非 VS Code 通用市场的不可逆细节未经核验。

## Decision

分发渠道方向 = **纯 Agent Plugins 生态**：主渠道走 Agent Plugins 1.0.0 标准（marketplace.json 指向 GitHub 仓的自助上架形态）+ Claude Code 原生 .claude-plugin 双 manifest 并行（ADR-0008 既定），内核 CLI 随仓分发（Source-first，D-021 口径）。npm / VS Code / OpenVSX / JetBrains 等通用市场**现在不进入、不占位、不注册**——零新增不可逆锚点。

## Considered Options

(1) 纯 Agent Plugins 生态 / (2) 生态为主 + npm 副渠道 / (3) 全渠道并行。选 (1)：与 D-012 五层盒子、D-021 Source-first 同构；四壳能力（GitHub Action / 自用 CLI / 报告生成器）不因此作废，其渠道上架作为两扇门类追加决策挂到阶段 2 双结题之后按 #25 绑定表另拍。(2)/(3) 在未核验市场细节前注册身份 = 拍早了，与本 ADR 要防的「撞墙才拍」同为时机错误、方向相反。

## Consequences

- 阶段 3 上架票范围收窄为：Agent Plugins 生态自助上架 + 双 manifest 提交物（衔接 P1 预核对 baseline）。
- 日后若追加通用市场：先补该市场不可逆细节与铅垂期定向调研（R5-Q5 报告 §6 缺口 3 为闭合前置），再另立决策。
- 方向拍板 ≠ 上架授权：上架动作本身仍属用户闸门（D-012 余款 + D-026）。
- README 与发布口径不变：发布未发生，不得虚报可安装（D-021 纪律延续）。
