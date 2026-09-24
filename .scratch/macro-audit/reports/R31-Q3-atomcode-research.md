# R31-Q3 调研报告：高治理密度仓库的「文书法典门槛」批评处置

> atomcode 深调研存档（R31 轮，题面=R31-Q3-research-prompt.md）。检索：web_search+AnySearch（Tavily 额度耗尽）；13 源含 K8s KEP/Rust RFC/Google Cloud ADR/datadef/arXiv 2304.08426 等。

## 1) 执行摘要（Tl;dr）

**推荐：候选 (a) 主体拒收＋两小增量，并将增量②升级为「生成式索引」而非纯事件触发器**（Confidence：高）。工业界心智模型一致支持：(i) 决策记录的价值恰恰在公开可追溯（KEP/RFC/Google Cloud 均明文将 onboarding 列为 ADR 的**收益**而非成本）；(ii) 体量问题的工业解法不是压缩文书或预写导览，而是**生成索引**（KEP 用元数据交叉索引、本仓知识库召回显示 anysearch-cli 已有 scripts/gen-adr-index.mjs 先例）——这直接治 README 地图表 ADR 区间过期（0021 vs 实 0023）这类 stale-pointer 病根；(iii) 外部贡献者基数为零时，预写大规模导览属 premature 投入，首个真实贡献者出现时再实证化是社区常态。批评的核心事实错误（78 vs 23 份 ADR）+ 导览面已存在 + stale 指针恰好可被小增量修复，使「拒收主体、吸收两增量」完全站得住。

## 2) 分点结论

**① 高治理密度项目的可读性先例——「重决策记录＋轻导览」是标配，且索引多为主 README 单页**
- Kubernetes KEP：enhancements/keps/README.md 仅 72 行=FAQ+快速入门+指向 KEP-0000 指针；其承诺的可读性设施是「Cross indexing of KEPs so that users can find connections and the current status of any KEP」——即机器可检索的交叉索引，不是手写阅读路径图。KEP 数量数千张，从未被认为需要「为新人压缩体量」。
- Rust RFC：RFC Book 首页就是索引式导览；libs-team 指南明文承认体量代价：「If there are tons of RFCs – especially trivial ones – people are less likely to engage with them」——但对策是**控制新增 RFC 的准入门槛**（重流程只用于重大变更），而非回头压缩已有库存。支持「账本/ADR 存量是历史资产，治理增量准入即可」。
- Google Cloud ADR 指南将「Onboarding: New team members can easily learn about the project」明文列为 ADR 体系的第一收益——决策记录密度高在工业界被理解为**新人资产**，前提是有入口（README/索引）。
- 审计追踪密度=可信度资产：SOC 2 合规文献一致将 comprehensive audit trail 作信任前提[原文此处截断——要旨：auditor 看的是完整 trail 非精简 trail]。

**② 外部贡献者门槛的实证时点——首贡献者出现前，测量与导览都无从谈起**
- 贡献者流失实证（GitHub PR 数据集 334 万 PR + OpenSauced 复盘，arxiv 2304.08426）：流失的决定因素是**首 PR 等待回复时长、反馈质量、是否被合并**——全是有贡献者之后才可测的量。「零外部贡献者时为门槛预写导览」在文献中没有先例支持；onboarding 文献全部以「已有稳定新人流入」为前提。
- 单作者 preview 期的正确投入面：Google Cloud/ADR GitHub org 共识=入口=一个诚实 README（本仓 CONTRIBUTING.md 已具备）＋索引。投入应放在**让入口不撒谎**（修 stale 指针），而非为假想的读者铺阅读路径。

**③ stale-pointer/文书漂移治理——生成式索引+freshness gate 是成熟形态，手写指针公认是病灶**
- datadef.io 两篇（2026-08 reviewed）：「A rewrite produces a fresh snapshot that starts rotting the day it ships」；解法四分法：delete / **date-stamp（决策记录=关于过去的真陈述，加日期横幅即停止误导）** / hand-fix / **automate（从源生成，build artifact 不会漂移）**。决策记录恰好落在「date-stamp」桶——本仓 ADR 本身无需治理，需要自动化的是**指向它们的指针**。
- lychee（链接检查）+Vale（文风）+last_reviewed freshness gate 是 2026 年 CI 标配栈（datadef、Mintlify 2026-06、EpicGames lore 内部规范三方交叉印证）。
- 最贴合本仓的形态：**生成式索引**——ADR 索引由脚本从 docs/adr/ 目录生成（不手编）。知识库召回显示姊妹仓 anysearch-cli 已有 scripts/gen-adr-index.mjs（README 注明 do not edit by hand）与 jiahao build-adr-index.js 先例——本仓 README 地图表 ADR 区间过期正是手写指针的必然结局，工业答案是把该表变成 build artifact。

**④ 「文书体量=方法论自证」论证先例**
- 直接明文论证未找到（合规域论证「audit trail 支撑信任」，Rust RFC 论证「公开决策过程给所有 stakeholder confidence」，均隔一层）。
- 最强组合论据：Rust RFC Book 首页——「RFC process…so that all stakeholders can be confident about the direction of the project」（公开记录→信心）＋ SOC 2 域「完整 trail 是认证前提」。对审计 CLI 产品而言，其治理文书就是产品论的 demo 数据：批评者读不懂法典≠法典应删，而是**入口该修**。

## 3) 候选对比矩阵

| 候选 | 工业先例支持 | 治 stale-pointer 病根 | 成本/风险 | 评估 |
|---|---|---|---|---|
| (a) 拒收＋两增量 | 强：KEP/RFC/Google 全部「重记录+轻导览」 | 增量①只修表不修机制 | 若增量①仍手写，会再次过期 | **推荐主体**，但增量①应升级为生成式 |
| (b) 立导览整改票 | 无先例；KEP/RFC 均未为此立专项 | 否 | 零读者时 premature 投入 | 拒收；改为 (a)② 事件触发器 |
| (c) 文书经济化 | 反例：RFC book 明文否定压缩存量、只控增量 | 否 | 摧毁方法论自证 | 明确拒绝 |
| (d) 零动作 | 部分（RFC 门槛控制） | 否——README 0021 stale 持续实证「体量产生漂移」 | 已知缺陷不修，削弱自身信誉 | 拒绝；至少做增量① |

## 4) 完整来源清单

1. Kubernetes KEP README — github.com/kubernetes/enhancements/blob/master/keps/README.md [Official] — 已读 — KEP 流程轻导览+cross-indexing 承诺
2. Rust RFC Book 首页 — rust-lang.github.io/rfcs/ [Official] — 公开流程→stakeholder confidence
3. Rust RFC libs-team 指南 — rust-lang.github.io/rfcs/libs_changes.html [Official] — 「tons of RFCs→less engagement」+准入门槛对策
4. Google Cloud ADR overview — cloud.google.com/architecture/architecture-decision-records [Official] — onboarding 列为 ADR 首要收益
5. adr.github.io [Official] — 抓取失败仅搜索摘要：ADR org 目标=工具化+AKM 指针
6. datadef.io「Documentation checks in CI」— datadef.io/guides/en/docs-checks-in-ci [Official/实践] — lychee/Vale/freshness gate/Danger 规则
7. datadef.io「Stale documentation playbook」— datadef.io/guides/en/stale-documentation [Official/实践] — 四分法处置+date-stamp 决策记录+生成式防漂移
8. Mintlify「Documentation Linting」— mintlify.com/library/documentation-linting [Comparative] — stale timestamps/链接检查分类
9. arXiv 2304.08426（GitHub PR time-to-first-response 实证）— export.arxiv.org [Official/学术] — 首响应时长主导 PR 生命周期
10. OpenSauced contributor onboarding — dev.to/opensauced [Community] — onboarding 以有新人为前提+文档首条
11. SOC 2 audit trail 文献簇 — auditkit.dev/hyrelog.com/fastercapital.com [Comparative/Community] — 仅摘要 — audit trail→trust 论证（弱证据已标注）
12. EpicGames lore doc-standards — github.com/EpicGames/lore [Official] — Vale+markdownlint+lychee 三连 CI
13. 本仓知识库召回 — anysearch-cli scripts/gen-adr-index.mjs / jiahao build-adr-index.js（README ADR index rebuilt 72 entries）— 生成式索引已有仓内先例

## 5) 信息缺口

- 「审计驱动开发/自身可追溯性即产品信誉」的逐字学术论证未找到；只有合规域类比与 RFC 公开流程收益，均隔一层。
- 「零外部贡献者项目预写 onboarding 的失败案例」无直接文献——该结论是从 onboarding 实证的前提反推。
- adr.github.io 原文抓取失败，其工具清单未经原文核验。
- 「事件触发器」（first-external-contributor）作为治理模式在工业界无命名先例，是本仓自创——调研既不支持也不反对，仅确认零读者期预写无先例。

**对决策账本的落地建议（一句话）**：D 记录主体拒收（计数失实+导览面在+基数零），增量①=README ADR 区间勘误且顺手把 ADR 地表改为脚本生成（仓内已有 gen-adr-index.mjs 先例可移植），增量②=first-external-contributor 事件触发器入 BACKLOG 待实证化。