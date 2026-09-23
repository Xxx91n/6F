# R30-Q6 atomcode 深调研报告：文件卡查询语义四联动子面（A/B/C/D）

> 运行：2026-09-23（atomcode -p，session 索引在案）；题面见 R30-Q6-research-prompt.md。
> 来源 15 件：XTDB bitemporality 官方档／Datomic filters 官方档／SQL Server FOR SYSTEM_TIME（SQL:2011 制度化）／SonarQube about-new-code+process-steps 官方档／Sourcegraph Help+PR#58381+gitserver PR#64245／Git 官方书 10.1 plumbing／GitHub internals III 博文／GitHub contents API／RFC 2616+MDN 410+ErrorLookup／Relay semantic-nullability 官方档／Yieldmo 反例文／Sonar 社区帖。置信度=高（主干多官方源交叉）。

## 1) 执行摘要（Tl;dr）

**推荐 B（时点可选+miss 四类+补采资格），四个子面各有独立论证**：时点=默认最新观测集+at:<sha> 显式 opt-in pin；staleness=双字段披露照答不拒答；miss=四类显式态+renamed_to 带血缘跳转（301 语义+逐请求重验证）；补采=仓级管线跑当前 HEAD 产新观测集 append，脏工作区零影响零感知。

## 2) 候选评估矩阵

| 候选 | 时点 | staleness | miss | 补采 | 判定 |
|---|---|---|---|---|---|
| A 最简化 | 仅最新观测集 | head_sha 披露 | 二分 | 无资格检查 | 不够（Sourcegraph 已超越此阶段，commit-pin 一等公民） |
| **B 时点可选** | 最新默认+at:sha pin | 双字段对比 | 四类显式态 | 仓级管线跑当前 HEAD，脏区不阻塞 | **推荐**（≈XTDB/Datomic as-of+Sourcegraph repo@commit+GitHub ref） |
| C 严格拒答 | 强制 HEAD 匹配 | 拒答 | — | 强制重采 | 无先例支持，索引产品无一拒答 |
| D worktree 感知 | — | — | — | 阻塞/感知 | 违 plumbing 读对象模型（blame/log 均不读工作区） |

## 3) 分点结论（四子面）

**子面① 时点选择→默认最新观测集+at:<sha> pin，不支持强制 HEAD 匹配**
- XTDB 官方档：valid-time（=observed_at/采集 HEAD）与 transaction-time（入库时点）分离，查询默认问 valid-time 且不要求=now，retroactive 常态——「最新观测集可落后于 HEAD」的理论支撑；
- Datomic 官方档：as-of 接受三粒度 pin，history 视图并存——pin 与全历史是一等功能非特例；注意 since 陷阱=pin 查询需「现在库解析实体+过去库取值」双引用（对 at:sha 实现是直接警告）；
- SQL:2011 FOR SYSTEM_TIME AS OF：制度化 as-of 语法，AS OF 仅常量/变量——**pin=显式用户输入不自动派生**；
- Yieldmo 反面教训：「不要把业务逻辑建在 time-travel 上」——as-of 适合调试/审计不适合主路径⇒at:sha=显式 opt-in，默认=最新观测集。

**子面② staleness→双字段披露照答不拒答**
- Sourcegraph 官方 Help：陈旧结果三件套=解释原因+照常返回+repo@commit pin+对照验证，零拒答选项；
- Sourcegraph PR #58381：点击结果总跳 blob@commit 非 blob@head（「avoids inconsistencies if indexing lags」），已知 UX 成本（HEAD 也显示 SHA）被接受为正确取舍；
- SonarQube new-code 模型：时点差异编码进查询语义（new vs overall code 四种定义）非拒答；issue 新旧靠 line hash+backdating 全在陈旧快照上操作；
- 联邦合规先例（promise.legal）：「as of」日期披露=合规最低要求，是标注非阻断；
- 语义定性：卡答「at 采集 HEAD 时点该文件的事实」与「HEAD 是否漂移」是两个正交事实——后者是披露字段非拒绝条件。C「stale=拒答」在全部信源零先例。

**子面③ miss 分类学→四类显式态+renamed_to 必须带血缘跳转**
- HTTP 正典：404=不知道为什么没有（默认态）；410=曾存在确定永久没了（never_collected/not_tracked_at_sha）；301=曾存在已永久移走有转送地址（renamed_to——**唯一「miss 必须可跳转」语义**）；not_applicable≈合法空值非 miss；
- GraphQL Relay semantic-nullability（官方档）：业界从「null=错误冒泡」走向 semantic nullability——区分「业务上没有（合法 null）」与「解析失败（错误）」；not_applicable=卡 schema 一等可空值，not_collected 族=错误路径显式枚举——**miss 二分混淆两类，违背 GraphQL 十年演进方向**；
- SonarQube rename 先例：官方每次分析主动做 rename 检测维持 issue 血缘，但社区证 rename 检测会漏——**renamed_to 不应无条件自动跳转**：有血缘事实则跳转，无则降级 410 语义；且 301 难回滚（客户端缓存）⇒跳转须随请求重新验证血缘（血缘事实本身带时点）。

**子面④ 补采粒度与资格→仓级管线跑当前 HEAD；脏工作区零影响零感知**
- git 官方书 10.1：objects/refs 是内容寻址数据库与工作区分离，plumbing 直接操作对象库不触碰 index/worktree；GitHub internals III：文件历史查询全走对象库；
- Sourcegraph gitserver PR #64245：自建 git 服务读历史唯一故障面=commit 不存在（force-push 后 SHA 消失），处理=显式 NotFound 检查——**补采资格检查的正确对象=「目标 SHA 在对象库可达」非工作区清洁度**；
- SonarLint worktree bug（2024 社区）：唯一 worktree 相关故障=IDE 侧误用工作区路径——反证纯对象读取层不该有 worktree 感知；
- 补采粒度：Sonar 官方档确认其模型也是「全仓扫描入库按文件投影查询」——**单文件补采在全部先例中不存在**；补采产出**新观测集**（新 observed_at/head_sha）append 叠加非覆盖（XTDB bitemporal append：旧文档不删除新版本 put 叠加）。

## 4) 最终推荐语义

1. 时点：默认=最新已采集观测集；at:<sha> 显式 opt-in pin；不实现强制 HEAD 匹配（无先例且破坏 bitemporal 可积累性）；
2. staleness：双字段披露（observed_head_sha+current_head_sha 或 drift 标志），照答不拒答；pin 时披露 pin 是否等于该观测集 head_sha（PR #58381「总显示 SHA」教训）；
3. miss：四类显式态 never_collected／not_tracked_at_sha（可提示用 at: 其他 sha 试探）／not_applicable（合法空值非 miss）／renamed_to（血缘跳转+逐请求重验证，无血缘事实降级 not_tracked 语义）；
4. 补采：唯一粒度=当前 HEAD 仓级管线重跑产新观测集 append；资格检查=目标 SHA 对象库可达（gitserver 先例）；脏工作区零影响零感知。

## 5) 信息缺口

- Datomic since-lookup 陷阱（实体解析时点 vs 取值时点分离）对 at:sha 实现的具体映射需票面验证；
- Sourcegraph 「SHA 展示的 UX 成本」量化不可得（仅定性记录）；
- 补采触发后并发/重复触发去抖语义未调研（幂等键应天然覆盖，待票面核）。
