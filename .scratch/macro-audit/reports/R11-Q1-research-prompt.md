# R11-Q1 — atomcode 深度调研 prompt（托管平台 API 适配器立案 / Micro-A preview 硬前置）

> 纪律：本仓唯一数据源 = D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md；结论与任何 current 决策冲突时必须显式列出，禁止静默改向。

## 一、背景（本仓现状，调研前必读本地实物）

本仓 D:/Aworker/6F 是「宏观+微观工程内容审计产品」（面向 git 记录健全的项目）的工程仓＋spec 仓单仓结构。调研前请用只读方式完整回顾：

- D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md —— 全部 47 条记录中 40 条 current（重点：D-013 输入面=本地路径默认+远程 URL opt-in；D-024 挂门项两字段纪律；D-026/D-027 用户闸门（商业层/凭据面动作停用户）；D-033 试点仓指派三问＋PR 层硬约束；D-034② 阶段 3 串行骨架 Micro-A 第三「需托管平台 API 适配器新外部面」；D-035 CodeLore 上游接入；D-037 版本/上游锁表；D-043 判据意图读法先例；D-047 Micro-A 试点集 {env-manager,jiahao}＋第三槽挂本适配器）。
- D:\Aworker\6F\docs\adr\ 全部 19 篇 ADR（重点：0009 本地优先+URL opt-in 输入面；0014 上游双轨制=适配器轨道禁业务规则+raw 语义不出边界+vendor 逃生舱；0016 纯 Agent Plugins 分发=通用市场不进；0017 Preview 分级发布诚实披露；0018 上游锁表制度化；0019 SWMR 门面）。
- D:\Aworker\6F\CONTEXT.md 57 词术语表（重点：Repo Intake 输入面、Agent Plugin 五层盒子、Failure Semantics 诚实降级、Watch Tri-state）。
- 既有上游形态实物：engine/upstream-lock.yaml 锁表（codelore/duckdb/git-cli=active 已立 CLI 封装先例；scorecard/repomix=planned；codelore-sqlite-dump=evaluating）；engine/src 内 codelore 适配器实现（面名契约+golden cassette 模式）。

## 二、本次触发问题（轮 11 grill Q1）

D-034 脊柱推进到 Micro-A preview（层序第三位）。硬前置 = D-034② 登记的「托管平台 API 适配器新外部面」——Micro-A = PR 级 diff 审计，需从托管平台（当前事实面=GitHub）只读采集：

- PR 枚举（list，含 author 人/机判读——试点仓 env-manager 实测 dependabot+release-please 机器 PR 占 46/62≈74%，区分度验证依赖此字段）
- PR diff / patch（文件级变更）
- PR 元数据（number/state/merged/labels/base/head/commits 关联）
- 可选：review / comment 面（是否进最小集待定）

候选实现路径（用户已见轮廓）：
- (a) 立案适配器票（拟 #47）：需求面=read-only 契约+限流策略+凭据面（探测顺序+降级披露）+ADR-0014 双轨制评估+锁表登记；实现路径票内评估定
- (b) 立案并当场钉死 gh CLI 封装（本机 gh 已认证实测可用——T7 审计已用 gh pr list/gh api 跑通；git-cli=active 锁表先例=CLI 封装形态已立；但「用户机须装 gh+auth」是 Agent Plugin 分发面真问题）
- (c) 不立案：Micro-A 先走 gh 裸调探针（无适配层）——raw 语义直穿疑违 ADR-0014
- (d) 主线挂起先做副线

## 三、调研产出要求

结合工业界成熟落地的心智模型（重点：开发者工具中 CLI 封装 vs API 直连的先例与取舍、凭据管理/限流降级/诚实缺席惯例、上游适配层边界纪律、read-only 采集契约粒度惯例），回答：

1. 是否应此刻立案该适配器票（时机判据——Micro-A preview 开工门前置 vs 提前立案的信息充分性）；
2. 若立案：需求面边界（最小契约集取舍——review/comment 面是否入最小集）与推荐实现路径（gh CLI / REST+token / 无认证 / 混合，含 Agent Plugin 分发语境下的依赖代价）；
3. 限流/凭据/降级披露三面的惯例化处置建议；
4. 与本仓 current 决策的任何冲突点（显式列出，含理由）；
5. 风险与诚实披露点。

给出推荐与理由，标注置信度与来源层级。
