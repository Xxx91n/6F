# R28-Q11 atomcode 调研题面

> 2026-09-22 轮28 grill Q11。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件 SSOT、字节级确定性可重放、报告=read model 投影、MCP 只读查询面。quarantine 建制 D-100~D-112 全链就位（分类器/字段接线/锚字段/quarantine_log 表含 disposition/恒等式/幂等写入/崩溃工件/strict 门禁/verdict 两轴/normalized 留痕）。

## 已就位决策（本题约束）

- D-100⑤：新 reason code=契约覆盖缺口信号登记 known-gaps 台账——台账形态未裁；
- D-104②⑤：兜底码 UNCLASSIFIED_FIELD_ANOMALY 独立计数+立法时迁移存量；未接线字段判据挂可观测谓词触发器→registry 登记（出现且无法归类→实证再立法）；
- D-110：strict 基线=仓级 accepted_reason_codes 版本化常量（门禁面，per-repo 已接受清单）——与 known-gaps（全局覆盖缺口目录=legislation 队列）不同轴；
- 仓内既有 registry=33-gate-registry.json（.scratch 治理册，watch 五要素 schema：标记/owner/review_event/verify_method/confirmations——收「触发器」非「缺口条目」）；
- 检测面可推导：UNCLASSIFIED 出现/新码首见从 quarantine_log SQL 派生；台账面=人审登记（owner/status/立法进度/首见实例引用）。

## 裁决问题

known-gaps 台账承载形态：

- (a) 产品侧 committed 台账文件（版本化+PR 评审；条目=gap id/reason_code 族/首见实例 repo+sha+raw 引用/status(observed→triaged→legislated)/owner/notes；检测侧=quarantine_log SQL 派生信号，人审登记）；
- (b) 挂进 gate registry（复用 watch 五要素 schema；但 registry 是 .scratch 治理册非产品面，且收的是触发器非缺口条目——层级错配）；
- (c) 纯 SQL 派生不建册（quarantine_log 查 UNCLASSIFIED/新码即缺口视图——零维护但无 owner/status/进度轨，登记退化为查询=缺口无人认领化）；
- (d) (a)+(b) 双册分工：缺口目录（产品册）＋立法触发器（治理册 registry 条目）各归各位、条目互链（gap↔trigger id）。

## 调研任务

1. 工业界「已知缺陷/覆盖缺口目录」与「触发器/观察清单」分册 vs 合册惯例：KNOWN_ISSUES/known-gaps 文件、lint suppressions with expiry、CVE accepted-risk register、安全例外台账（risk register）、data quality issue tracker——缺口条目与行动触发器是否分开管理；
2. 「检测可推导 vs 裁决须登记」的双层惯例：自动发现的缺陷信号（scan finding）如何转为人审登记的台账条目（triage workflow）；
3. 覆盖缺口台账的条目字段惯例：first-seeded/owner/status/linked-evidence 等元数据（缺陷跟踪、SBOM gap、API coverage gap 文献）；
4. .scratch 治理册 vs 产品面文件的分工判据：哪些登记物住仓内产品面哪些住规划面（本仓已有先例=资产 registry 住 .scratch）；
5. 辩证处：每选项找真实反例；(d) 双册互链是否有过度建制风险（两套登记为同一缺口付双份记账成本）；(c) 纯派生视图在哪些场景其实够用。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
