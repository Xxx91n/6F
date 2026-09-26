# R36-Q1 atomcode 调研报告（2026-09-26）

题面：.scratch/macro-audit/reports/R36-Q1-research-prompt.md

## 调研面

Sufficiency Gate：searches 5｜angles Official(IETF/ESLint)/Comparative/Criticism/Currency/Community｜full reads 6｜gaps：Bugzilla INVALID 官方文书 404（以 IETF Rejected 为主证，Bugzilla 仅旁注）。

## 分点结论

**结论一**：deferred judgment 项的工业惯例是「分诊三态」非 wontfix——finding-triage/OWASP Three-Disposition rule：Fixed / Deferred / Accepted Risk 三态（false positive 是第四态但语义=「不存在该 finding」非处置）。R1 属 Accepted Risk 候选。框架要求 accepted-risk 三要素齐备：(1) 为何 fix 不适用；(2) 补偿控制；(3) **复评触发条件**（最常被漏填字段）——缺任一项=真实 finding 被静默丢弃。QA Sphere 2026 同向：低优先级积压须显式政策「定期复审并关闭永不修的，或承认 P4=closed-with-a-record」——wontfix 也要有记录非无声消失。来源：finding-triage SKILL 原文、qasphere.com 原文。

**结论二**：R2 的正确呈报形态是「确认既有账本注记」非本轮新裁。票面「带病边界返工批注明不修」已存在——若本轮再裁按约束须标 revised 呈报。工业惯例叫 re-affirmation：accepted-risk 文书要求 Approver+Date accepted，对已记录不修决定本轮动作仅=补齐「复评触发条件」字段（如：多 to 竞争边实际歧义案例出现时重开），无需推翻或新立。与 (b) 兼容但形态必须是确认非改向。

**结论三**：M-015 语义空白有两条成熟先例链，均指向「落盘 commit 自身豁免」：
- lint 引入先例（ESLint 官方 Bulk Suppressions 文档+TikTok 工程原文）：新规则启用为 error 时存量违规批量豁免进 suppressions 文件、新代码即刻全覆盖、自定节奏清理存量。规则生效边界=规则落盘那一刻的仓库状态；落盘 commit 自身「违规」属存量不回溯判罚。ESLint 文档明言若须先清零存量才能启用规则=「codebase 越大越不可能启用」死局——对应 M-015：若 checklist 落盘 commit 自身也要合规，规程永远无法启动（鸡生蛋）。
- 立法先例（IESG errata 声明+Wikipedia grandfather clause）：法律默认推定 prospective（Calder v. Bull 传统）；grandfather clause=旧规则继续适用于既有情形、新规则适用未来案例。IETF errata 对「事后新知」同构：发布时点不存在的问题不构成 erratum。

**结论四**：M-015 呈报形态=IETF errata「Verified + Hold for Document Update」组合非 Rejected。红守卫第三次实证是真实证据（Verified：发布时点即存在的规程缺陷=生效时点语义空白），但处置不是撤销核销而是「缺陷记入注记、未来规程修订纳入」＋立即以 (c) 一句话规约立法封口。解析明确（grandfather 惯例）故可直接立法非挂起。

## 对比矩阵

| 项 | 射程 | 工业惯例支持度 | 风险 |
|---|---|---|---|
| (a) 窄 | 核销+M-015 注记+R1/R2 挂回待专窗 | 低：M-015 第三次实证，挂回=把确定性重演问题再挂一次，违「same defect discussed three times→commit or close」分诊纪律（qasphere 明文） | 语义空白留存，第四次触发裁定成本重付 |
| (b) 中 | (a)+本轮裁 R1/R2 | 中：R1 首裁合规；R2 若裁则触既有注记须 revised 呈报 | R2 呈报形态处理不当=静默改向账本 |
| **(c) 宽（推荐）** | (b)+M-015 一句话规约立法 | 高：lint bulk-suppression（新代码全覆盖+落盘点豁免）+grandfather clause（新规不溯及既往）双先例链一致 | 一句话措辞须精确，歧义会造新空白 |

## 推荐落地措辞

> **M-015 规约（裁立）**：一切 checklist/规程自其落盘 commit 起对新行为生效；该落盘 commit 自身豁免（grandfather——对应 lint 存量豁免惯例）。后续轮次 checklist 行落盘 commit 须自带编年随行，自下一次落盘起红守卫全额适用。

> **R1（accepted-risk 裁立）**：lineageEdgeCapHit 在「subject 无边+祖先边池触帽」病态角下卡面 lineage:null、帽事件不可见——非硬错。接受理由：披露伞（truncated）在存在边时如实工作，病态角触发需 subject 零边+触帽双重条件；补偿控制：reprobe 路径可经非空 lineage 块回查；复评触发：出现 subject 零边且触帽的真实案例即重开。

> **R2（确认式呈报非新裁）**：确认票面「带病边界不修」注记，补齐复评触发条件：renamed_to 多 to 竞争边产生实际取首匹配歧义案例时重开。不改变账本 current 决策故无需 revised；若裁立文本与「注明不修」出现任何不同调判词，则必须显式标 revised 呈报，禁止静默改向。

## 来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| IESG Processing of RFC Errata | datatracker.ietf.org/doc/statement-iesg-iesg-processing-of-rfc-errata-for-the-ietf-stream-20210507/ | Official | errata 三态判据；「发布后新知不构成 erratum」 |
| Finding Triage SKILL | github.com/briiirussell/cybersecurity-skills finding-triage | Official(框架) | Three-Disposition；accepted-risk 三要素；defer 不降 severity |
| ESLint Bulk Suppressions | eslint.org/docs/latest/use/bulk-suppressions | Official | 新规则启用=存量豁免+新代码全覆盖+prune |
| Bulk Suppressions (TikTok) | developers.tiktok.com/blog | Community/实务 | 批量豁免设计动机 |
| Grandfather clause | en.wikipedia.org/wiki/Grandfather_clause | Official(百科) | 新规管未来旧规管既有+Grace period |
| Severity vs Priority (QA Sphere) | qasphere.com/blog/severity-vs-priority | Comparative | P4=closed-with-a-record；三议同题即 commit-or-close |
| Defect Triage Guide (ThinkSys) | thinksys.com/qa-testing | Community | disposition 表形态（Deferred→Target Release/Backlog 列） |
| ESLint baseline discussion #21007 | github.com/eslint/eslint/discussions/21007 | Community | 存量基线化只罚新违规共识 |
