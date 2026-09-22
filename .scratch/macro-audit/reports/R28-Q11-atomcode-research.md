# R28-Q11 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q11：「known-gaps 台账承载形态」——产品册 vs 治理册 vs 纯 SQL 派生 vs 双册互链。
> 题面存档：R28-Q11-research-prompt.md。执行：atomcode -p 串行单发（97 行/14.8KB/13 索引节）。
> Sufficiency Gate：searches 5 角度五类覆盖；full reads 4（GitHub known-issues 内容模型、lightsondata DQ issue log、DryRun risk register、alvor.io risk register）＋深读 2（gitleaks baseline×2、BettererNet 文档）；Tavily 超限 AnySearch 补位。置信高。

## 1) 执行摘要

**推荐 (d) 双册分工——产品面 committed known-gaps 台账（a）承载缺口条目，.scratch 33-gate-registry 治理册承载立法触发器，gap↔trigger 单向 id 互链**，置信度高：工业界「缺口/风险目录（人审决策记录）」与「行动触发器/观察清单」分册是主流惯例（NIST 风险登记册 vs 扫描器 findings 流、GitHub known-issues 内容模型 vs issue tracker、data quality issue log vs 自动检测），合册（b）层级错配、纯派生（c）违反 D-100⑤ 已裁的「登记」义务。两处锐化防双份记账：registry 条目禁复制缺口语义字段（owner/status/立法进度权威单向在 known-gaps 册）；known-gaps 条目 trigger 引用可空（大多数缺口走阈值/strict 硬崩路径无需专门触发器）。

## 2) 分点结论

**① 缺口目录与触发器/观察清单分册是工业界惯例（双源+）。** NIST IR 8286r1 风险登记册本体=决策记录（owner/response type/status/回来复核的日期）；accepted risk≠closed risk 须有 acceptor/rationale/conditions/复核日期；扫描器 findings（自动信号）在成熟平台（DryRun/ArmorCode）聚合进登记册作另一路输入——findings 流与登记册分层；lightsondata DQ issue log 三段字段（issue details backlog→assigned→in progress→closed/ownership/resolution）与 (a) 提议字段几乎一一对应；GitHub 官方 known-issues 内容模型=产品面 committed 文档（PM/EM 人审）而逐 bug 走 issue tracker——文档册与 tracker 天生分立；Orca 安全指南「record what you have not scanned as a stated gap with an owner」——gap 条目显式挂 owner 是安全行业明文惯例。

**② 「检测可推导 vs 裁决须登记」双层=triage workflow 标准形态。** DryRun：扫描器自动产 findings（Detected/Agent/Status），triage 是独立人工动作（bulk triage with reason、dismissed findings 复审）——自动信号不自动等于台账条目，中间必有人审层；SBOM→VEX 七段管线：CVE intake（自动）→exploitability analysis（人工）→VEX justification（裁决登记含 analyst name/analysis date/evidence links）。

**③ 台账条目字段惯例（多源收敛）。** gap id=Risk ID/Issue ID；reason_code 族=Category/RuleID；首见实例 repo+sha+raw 引用=evidence links/Detected+File+Commit；status observed→triaged→legislated≈backlog→assigned→closed；owner=Risk Owner（须到人/角色——「A team name cannot approve」）；notes=rationale/resolution。**业界普遍另有 review date/复核节奏字段**（NIST Review Frequency、Copla「review date as a core field」、ASD ISM expiry date）——建议条目补可选 review_by 或复用 registry review_event 防台账腐化（Copla 实证：无复核节奏表格册 18 个月后还列着公司不再用的系统）。

**④ 每选项反例（辩证）。** (a) 单册反例：known-issues 文档不追踪修复进度——行动追踪必须外挂，纯产品册无触发语义立法时机会漏；(b) 层级错配实证：registry 五要素是触发器语义，缺口条目要的 status 进度轨/证据链在五要素里无位；且覆盖缺口=产品面诚实声明住 .scratch 等于对消费者不可见，违「报告=read model 投影」诚实纪律；(c) 登记退化：Copla 明文「无 owner/status 的清单 becomes stale…spreadsheets often become the risk」、Orca「owner left eleven months ago=unowned in practice」——纯 SQL 视图产 findings 流非登记册，登记≠可查询、登记=有人认领+进度轨；(c) 真正够用场景=缺口量小且全部即时升级（UNCLASSIFIED 出现即崩当场立法无存续期）——但 D-104② 已裁 UNCLASSIFIED 可在非 strict 下存续观察故对本仓不成立（若未来立法周转缩到零可降级 (c)，留注记）；(d) 双份记账风险真实但可控——锐化：registry 条目只持五要素触发器字段禁复制缺口语义字段，known-gaps 条目持 trigger_id 可空外链，状态权威单向。

## 3) 对比矩阵

| 选项 | 承载面 | 缺口条目语义 | 触发器语义 | 冲突 | 判定 |
|---|---|---|---|---|---|
| (a) 单产品册 | committed 产品文件 | 完整（业界字段惯例齐备） | 无位立法时机漏 | 与 D-104 需补桥 | 可用但缺触发轨 |
| (b) 并入 registry | .scratch 治理册 | 五要素无 status/证据链位 | 原生 | 违 D-104 层级＋产品面不可见 | 排除 |
| (c) 纯 SQL 派生 | quarantine_log 视图 | 无 owner→无人认领化 | 部分 | 违 D-100⑤「登记」 | 排除（仅零周转场景够用） |
| (d) 双册互链 | 产品册＋治理册 | known-gaps 册承载 | registry 条目承载 | 三决策全兼容 | 推荐＋两锐化 |

## ⑤ 冲突核查

D-100⑤：(d) 是其直接落地零冲突，(c) 与「登记」语义冲突排除；D-104②⑤ 触发器挂 registry 既有路径不动；D-110 基线=门禁面不同轴；**零 revised**。

## 4) 来源清单

NIST IR 8286r1 风险登记册（决策记录本体）；alvor.io risk register（acceptor/rationale/conditions/review date）；saltycloud Isora GRC；lightsondata DQ issue log（三段字段）；GitHub known-issues 内容模型官方档（产品面 committed 文档 PM/EM 人审）；DryRun Security Risk Register＋ArmorCode（findings 流聚合进 register 分层）；meddeviceguide SBOM→VEX 七段管线（自动 intake→人工 analysis→VEX justification 登记）；Orca 安全指南（stated gap with owner）；Copla（review date 核心字段+腐化实证）；gitleaks baseline 文档×2；BettererNet DOCUMENTATION。

## 5) 信息缺口

betterer 官网 404（BettererNet 文档与 gitleaks 实践交叉补位）；lint suppression expiry 专门文献较薄（fallow/hawk/detekt 沉淀补位）；Tavily 配额耗尽未参与。
