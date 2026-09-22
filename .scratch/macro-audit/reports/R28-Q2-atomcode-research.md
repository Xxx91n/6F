# R28-Q2 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q2：「字段级 quarantine 的覆盖面裁」——本轮接线哪些字段（仅 %cI / +%an / 全字段）。
> 题面存档：R28-Q2-research-prompt.md。执行：atomcode -p 串行单发。
> Sufficiency Gate：searches 10（两批 AnySearch，Exa/Tavily 超限由其单引擎补位）| angles：Official/Comparative/Criticism/Community | full reads 7（git-scm/kernel.org/man7/github.blog/github issue/sparvi/postman）。

## 1) 执行摘要（Tl;dr）

**推荐选项 (a)**：机制按可泛化形态建（三态分类器签名、reason code 枚举预留扩展位），本轮只给 %cI 接线；author 等字段的病态判据挂「首个观测实例」触发器。Confidence 高——git 生态自身（fsck msg-id 机制、GitHub transfer.fsckObjects 实践）就是这个模式的一手范本：检查器的形态是穷举建档的，检查项的立法是逐病态族实证追加的。

## 2) 分点结论

**① 数据质量管线字段覆盖心智模型=关键字段优先，非全字段防御**（置信高）——dbt 内建仅 4 类测试按列手工声明；Great Expectations 300+ expectations 靠 profiling 从实际观测数据建议（profiling-driven expectations）非凭空立法（sparvi.io 原文）；JSON Schema format 校验定位 convenience not a guarantee，官方建议 strict 仅用于已知可控契约面（postman 原文）。(c) 全字段=给 %H 重复立法（协议级已兜底）＋给 %an 凭空立法（判据定义不出）＋给 paths 发明概念——三违「验证已知契约面」惯例。

**② speculative validation 失败模式**（置信中高，git 案例间接支撑）——git-fsck 官方警告最贴切：「it is better to enumerate existing objects with problems with fsck.skipList, instead of listing the kind of breakages... as doing the latter will allow new instances of the same breakages go unnoticed」（git-scm+kernel.org 双源）——为未见实例预设类别遮蔽未来真阳性；反向同样遮蔽假阳性（合法罕见数据误杀进桶）。判据连定义都定义不出时不应提前立法。

**③ git 生态实际处置惯例**（置信高）——git fsck FSCK MESSAGES=穷举建档逐项定级清单：badDate/badDateOverflow/badEmail/missingEmail/missingNameBeforeEmail/missingAuthor/empty ident name 等各标 (ERROR)/(INFO)，fsck.<msg-id> 可 error→warn→ignore 降级（git-scm+kernel.org+man7 三源）。关键：badDate 有专属 msg-id 因为该病态族被反复观测（dropwizard#3563：18 个 badDate commit 直接阻断新版 git clone——原文已读）；author 非法编码没有专属 msg-id=git 生态未把它当已成立病态族。处置惯例=分级非二值：GitHub 用 transfer.fsckObjects 入口拦截病态对象（协议级 fail-fast 镜像）＋已入库病态对象用 skipList 按对象白名单豁免而非按类别放行（github.blog Git 2.6 文）——精确对应本仓架构：协议级违约摄入边界 fail-fast，字段级病态按已观测实例进 quarantine。%an 空名是独立 msg-id 非必然 ERROR 证实「空 author 不病态」；非法 UTF-8/控制字符在 fsck 体系根本无对应判定项=判据暂不可立法。

**④ 反方证据反向支持 (a) 补丁**——badDate 病态真实高频（dropwizard 18 commit 断 clone），%cI 接线非过度防御而恰好覆盖已证实病态面。

## 3) 建制推荐与理由（针对问题④）

**选 (a)，但给「触发器式立法」加两个补丁**：

1. **补丁一：触发器兜底路径显式设计**——立法前若字段级病态在运行中被观测到，第一落点应是 quarantine（字段置 null+兜底 reason code 如 UNCLASSIFIED_FIELD_ANOMALY 的兜底桶计数），而非协议级 fail-fast 硬崩——否则「首个观测实例」恰触发最不体面的死法。兜底码与正式立法码分开计数，立法时把兜底桶存量迁移到正式桶。
2. **补丁二：reason code 枚举对齐 git fsck msg-id 命名法**——fsck.<msg-id> 支持 error/warn/ignore 三级与三桶同构；reason code 枚举直接对齐 fsck msg-id（badDate→映射 %cI 病态族）=免费获一份十年实战打磨的命名法，未来立法有现成语义锚点。
3. **author 病态触发条件写成可观测谓词**——不只「出现过一次」而是「出现且现有判据集无法归类」，把触发器从被动等待变主动检测覆盖空窗。

## 4) 辩证：牵强处与反例

- **「首个观测实例才立法」自身有覆盖空窗**：隐含假设=首个实例到来时系统还活着。若首个 author 病态触发的是协议级解析失败（嵌入分隔符破坏 __R__%H|%an|%cI 记录结构本身——嵌入分隔符恰是 author 病态候选之一，能伪装成协议级违约），它将以协议级 fail-fast 硬崩而非平滑进 quarantine——(a) 的「author 零覆盖」不是真零覆盖：一条因 author 畸形崩掉的记录会被错误归因到协议层。补丁：协议级 fail-fast 崩溃现场应保留原始字节快照（进入独立 crash-bucket 计数），供触发器立法时回溯归因——否则「首个观测实例」可能永远无法被观测为 author 病态。
- **(b) 的反向牵强**：「非法 UTF-8/控制字符」判据看似便宜通用，但 git log 管道输出经编码转换（Windows 下尤其）后，非法 UTF-8 来源可能是自家工具链转码层而非 git 数据本身——摄入层与数据层未分离证明前立法=把自家工具 bug 立法成上游数据病态，此为 (b) 最大返工风险形态。
- **对 (c) 的公平让步**：若审计工具承诺长期跨仓运行（病态面随语料扩大扩容），(a) 的「逐实例立法」会造成 reason code 枚举碎片化与跨轮口径漂移。缓解=扩展位必须真实可注册（新判据=新增分类器条目+回归用例），不是预留注释。

## 5) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| git-fsck 官方文档 | git-scm.com/docs/git-fsck | Official | FSCK MESSAGES 穷举清单、fsck.<msg-id> 分级、skipList 优于类别豁免的官方警告 |
| git-fsck(1) kernel.org 镜像 | kernel.org/pub/software/scm/git/docs/git-fsck.html | Official | 交叉验证 badDate/badEmail 判定面 |
| git-fsck(1) man7.org | man7.org/linux/man-pages/man1/git-fsck.1.html | Official | 第三源交叉；missingAuthor/missingEmail 独立判定项 |
| dropwizard #3563 | github.com/dropwizard/dropwizard/issues/3563 | Criticism/实例 | badDate 病态真实高频，18 commit 阻断 clone |
| Git 2.6 flexible fsck | github.blog/news-insights/git-2-6-including-flexible-fsck-and-improved-status/ | Official | GitHub transfer.fsckObjects 入口拦截+skipList 按实例豁免分层惯例 |
| GE vs dbt | sparvi.io/blog/great-expectations-vs-dbt-tests | Comparative | 声明式按列+profiling 驱动立法 |
| JSON Schema 数据类型指南 | blog.postman.com/json-schema-data-types/ | Official | format=convenience not guarantee；strict 仅用于可控契约面 |
| SO: bad date 修复 | stackoverflow.com/questions/59231306 | Community | 仅摘要可用（403），佐证 badDate 常见运维痛点 |
| public-inbox szeder 帖 | public-inbox.org/git/20191031101539 | Community | 未读成（超时），仅摘要佐证 fsck ignore 用法 |

## 6) 信息缺口

- code-maat 等分析工具对 author 字段异常的实际处置未获一手源码证据（只读约束+引擎超限），但其为宽松文本解析器大概率静默容错而非校验，不影响主结论；
- 「%cI 输出为 ` INDIA`」的具体 commit 实例未在检索中定位一手来源，依赖本方已观测事实；
- speculative validation 误杀率的定量研究未找到合适文献；该部分由 fsck 类别豁免警告间接支撑，标中等置信。
