# ADR-0018: 版本与编年制度化 = 0.x 单调纪律＋上游锁表＋报告契约独立版本化／双层 CHANGELOG 分工

- Status: accepted
- Date: 2026-09-15
- Deciders: 用户（grill 轮 7 Q1/Q3，atomcode 取证后拍板）
- Ledger: D-037 / D-039（current）；承继 ADR-0014（上游双轨制）、ADR-0017（preview 标注延伸进报告契约面）

## Context

25-P2（版本与上游锁定数值化承诺）与 25-B3.3（仓根 CHANGELOG 口径）的触发事件均已发生且超期/到点；0.x 语义（ADR-0017）需要制度化锚点，仓根需要一个不复述产品变更的大局编年。

## Decision

### Decision-1 版本与上游锁定
0.x 单调递增不回退发旧线补丁；`report_schema` 独立版本化＋报告头 stability/capabilities/superseded_by/provenance-hash 固定字段；`engine/upstream-lock.yaml` 机读权威（锁定先于依赖、retired 不删、禁 range/浮动 tag）；更新走手动窗口＋golden 回归，禁自动升级；守卫 advisory→enforce（#44）。成文 = docs/versioning.md。

### Decision-2 双层 CHANGELOG 分工
`engine/CHANGELOG.md` = 产品版本账唯一权威（Keep-a-Changelog，capability 声明＋BREAKING/CHANGE＋lock diff 引用＋report_schema 版本＋反向指针）；仓根 `CHANGELOG.md` = 里程碑编年指针制（`## [M-xxx] - ISO日期` 键、禁版本号头、机器可解析固定字段行、只引用 ADR/A 区间/账本节不复制）；指针有效性守卫（引用存在性/单调性/双账互指）并入 #44。

## Considered Options

- D-1：自动升级（Renovate 式）——拒：detector 版本变化=审计口径变更；改绑 P2 到期——拒：事件已至＋内容全可定义。
- D-2：仓根 CHANGELOG 复述 engine 内容（firehose 反模式，实证失败）／直接用 `## [x.y.z]` 版本头（口径污染）——均拒。

## Consequences

版本/编年职责分层清晰、全部可机检；#44/#41a 获得明确 DoD；上游接入必须先登记锁表（TRUST 面收敛）。
