# 集成架构 = Hub-of-Facts with Federated Adjudication（C+A 合成）

跨 scale 集成架构 = 「中心事实辐射 + 联邦裁决治理」（Hub-of-Facts with Federated Adjudication）：数据底座采 C（共享 DuckDB fact table）+ 治理协议采 A（定义集中、执行分散）；4 子决策——① 数据流 = 事件单向写入 + 按需拉取投影；② 报告聚合 = 独立语义层（read model），不做 UI 抓取；③ 冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计；④ 裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑（裁决/契约/路由）不经过数据面。决策理由：基于 atomcode-research 2026-09 调研（三引擎 + 11 原文），A 联邦模式在 5 scale 间会复现 data mesh 三大失败（无人拥有 in-between / 静默断裂 / 重复劳动）——因为 5 scale 是同一审计事实的不同粒度而非独立业务域；B 星型把事实与引擎混淆且违反 ADR-0001 平权；C+A 合成用 SSOT + 各 scale 自建 read model 满足 CQRS/Event Sourcing / metrics layer / SonarQube portfolio 心智。

Status: accepted
