# R51-Q2 调研报告 —— 「指针字段」适用范围划界（引用位 vs 提及位分层管制）

> 存档说明：atomcode 深调研子代理派遣未归（进程存活 ~25 分钟知识库无落库，延续不归形态），按 R48-Q4/R50-Q4 先例转白名单工具（web_search/tavily/anysearch/ctx_search）自行合成——**degraded_performance 合法降级形态**（D-186：组成字段必填；本轮构成=atomcode 派遣未归→编排层合成）。题面存档见 reports/R51-Q2-research-prompt.md。

**Sufficiency Gate**：searches: 14（web_search×3、tavily×2、anysearch batch×8 问、ctx_search 召回×4 轮）| angles: Official（git/kernel/RFC Editor/Gerrit/Conventional Commits/FedRAMP-CMS-CDSE/gitlint 官方档）＋Comparative（位置管制 vs 形态管制）＋Criticism（lint 误报经济学）＋Community（HN/Reddit/gitlint issue）＋Currency（2025-2026 时效项）| full reads: 6（git interpret-trailers 官方全文、kernel submitting-patches 官方全文、RFC Editor errata 官方页、gitlint 内建规则官方全文、KB 跨会话 R51-Q1 报告召回、CONTEXT.md/POA&M 词条召回）| 域覆盖 12+（git-scm.com、kernel.org、rfc-editor.org、jorisroovers.com、conventionalcommits.org、gerrit-review.googlesource.com、fedramp.gov、security.cms.gov、cdse.edu、golangci-lint.run、lukeplant.me.uk、github.com 等）| gaps: 见 §7。

## 1) 执行摘要（Tl;dr）

**裁定：采纳 (iv) 分层口径为架构，但严格层的成员资格按 (ii) 职能判定义、机检按位形近似承载——即「职能入规、位形承载」的融合形态。** Confidence：**高**。理由：工业界引用管制的成熟心智模型一致是「结构位严检＋散文位不检」（git trailer 块、kernel Fixes footer 位、Conventional Commits footer、Gerrit hashtag/Change-Id 位、YAML front matter、POA&M 列字段全部同型），既否决 (iii) 宽口径（全文 SHA 形串入规＝误报税实证灾难），也说明纯 (i) 窄口径会漏 W6 同型缺口（T3 表指代位不在命名勘误列内）；而「职能判可机械化」有 checkpatch 直接先例（行首 tag 白名单＋正则即是对「footer 职能」的位形近似）。叙述段只保留一条窄禁令：裸短码不得单独承担定位。

## 2) 对比矩阵（四候选）

| 候选 | 机检性 | 缺口覆盖 | 管制税 | 业界先例对齐 | 判定 |
|---|---|---|---|---|---|
| (i) 窄口径（列级） | 最易：列头白名单即完 | **漏 T3 表 commit 指代位、账行唯一指代括注**（W6 同型缺口永续——这些是结构位但不在「命名勘误列」清单内） | 低 | POA&M 逐列必填字段制同型，但 POA&M 的「列」= 职能面全枚举，非任选少数列 | 不采纳（作为唯一划界太窄） |
| (ii) 中口径（职能级） | 中：需位形近似（列头白名单＋括注位正则），**近似有 checkpatch 直接先例** | 覆盖全部三实证（F1/W8/W6） | 散文不背税 | git trailer 块检测本身就是「以结构启发式近似职能」的官方实践 | **采纳为「严格层」的定义判据** |
| (iii) 宽口径（全文面） | 表面最简，实报面灾难 | 全覆盖但噪声淹没信号 | **极高**：SHA 形字串误报面大 | 反面先例充分（见 §3-C1） | 否决 |
| (iv) 分层口径 | 严格层可机检＋散文层一条窄正则 | 严格层若仅按「结构位」定义则同 (i) 的漏；**补职能定义后无缺口** | 分级最优 | **git/kernel/CC/Gerrit/front matter 全部同型** | **采纳为架构** |

## 3) 分点结论

**C1. 宽口径 (iii) 的过度税有 lint 生态直接实证——否决。** golangci-lint 官方专设 False Positives 页面承认误报是 linter 的结构性问题、需靠配置收敛【S10】；lukeplant 对 Pylint 的实测复盘：宽规则下「95% 的报出问题是误报」【S11】；Codacy 总结 linter 七大缺陷中误报列居前，直接后果是「狼来了」效应——团队学会无视告警【S12】。全文 hex 形串扫描会命中文档示例、截断引用、其他工具的 hash 字面量，报错信噪比崩塌后守卫本身失去权威。RFC Editor 的选择是同构旁证：RFC 发布后**全文冻结不重扫**，错误走结构化 errata 侧信道（Reported/Verified/Rejected/Held 四态人工核验）【S4】——即便对法定标准文本，IETF 也不做全文形态管制。

**C2. 「引用位 vs 提及位」分层是 git 生态的成文官制——(iv) 的架构直接有原型。** git 官方对 trailer 的定义原话：「trailer 是加在 **otherwise free-form part** 末尾的元数据」，trailer 块有精确结构判据（空行前导＋块内 ≥25% trailer 行）【S1】——即 git 官方自己就把 commit message 二分为「自由散文面」＋「结构机读位」，且机读位（`--parse`）只从结构位提取。Conventional Commits 同型：header/body/footer 三分，footer 是 BREAKING CHANGE 与 issue 引用的法定机读位，body 是人读散文【S2】【S3】；EC 组件库规范明文「footer should contain…references to GitHub issues」【S3】。kernel 把这个分层做成了**执法**：Fixes tag 只在 footer 位受检（12+ hex ＋ subject 校验位，checkpatch 行首锚定正则执法【S5】【S6】），commit message 正文里叙述性提及其他 commit 不受任何形态检查。gitlint 的全部内建规则同样只针对 title/body 的**结构性质**（长度、空白、正则模板）而无一检语义【S7】。→ 按位置分档管制不是本仓发明，是 git 生态三十年默认。

**C3. 「职能判」的机械化近似有直接先例：checkpatch 就是用「行首 tag 白名单＋锚定正则」去近似「这一行承担 footer 指针职能」。** kernel checkpatch 执法 Fixes 时并不理解语义，它做的是：位置锚定（commit message 尾块）＋标签字面白名单（`Fixes:`）＋值格式正则（12-40 hex）【S6】。这正是候选 (ii) 担心的「表格列头白名单＋括注位正则」的同构物——**业界已验证：职能级判据落地的正确方式不是让机器做语义判断，而是把职能面的成员枚举成封闭的位形模式清单**。同理，git 判定「这段算不算 trailer 块」用的也是结构启发式（25% 规则）而非语义理解【S1】。→ 特别裁决①：**职能判可承载，承载方式=封闭位形枚举**：命名指针列（勘误节指针列、登记表证据锚列）＋结构表 commit 指代列（T3 读数表）＋括注位正则（`（[0-9a-f]{4,40}|\w{3}）` 型表格/账行内括注）。枚举须封闭（D-095 语义），扩列走立法票。

**C4. 叙述段括注型指代：应入规，但只入「宽层」的窄禁令——判据是「是否唯一指代手段」，不是出现位置。** 特别裁决②：`（wmu）`型括注在被读者用于反查 commit 时**事实承担指针职能**——GitButler 官方立场（「短码 per-session 生成、always read them from `but status`」【S8，R51-Q1 已核原文】）使短码在任何位置都不具备跨会话可解析性，故「裸短码单独承担定位」在叙述段也应禁（这正是 (iv) 散文层规则）。但 SHA 长串在散文中的**提及**（叙述「该修复由 c6cb5a33… 引入」）不负定位义务——URI 生态同构：RFC 3986 明文 fragment 引用「不蕴含主资源可访问或将被访问」【S9】，即「提及一个可能悬空的标识符」在叙述位是合法修辞，在定位位才是义务。判据操作化：叙述段内出现短码/hex 括注时，问一个问题——「该记录中是否存在合法指针位承载同一指代？」有→括注是别名（合法）；无→括注是唯一指代手段（入规受检）。此问在审计窗人工复核中几乎无歧义（特别裁决④：可操作）。

**C5. POA&M/审计文书先例：结构字段逐列必填＋叙述自由，且人工复核按列清单走、不按语义裁量。** FedRAMP/CMS POA&M 制度要求每个条目的**指定列**各承载法定字段（unique identifier、control reference、milestone、completion date、evidence），CDSE 官方 Job Aid 的复核方式就是「对照样表逐列核对所需信息」【S13】【S14】——人工审计窗的判别单位是**列名**，不是自由语义。FDA 483 response 同型：官方草案指南定义结构响应格式（逐 observation 对应 CAPA＋证据），叙述性说明自由但证据锚必须落位【S15】【S16】。→ 这支撑本仓「严格层」的复核形态：**人工面核对封闭列清单，机检面跑位形正则，两者成员一致**——特别裁决①的可判性问题由此闭合。

**C6. 宽/窄之间的分层缝有边界失控先例，须用「封闭枚举＋改列走票」对冲。** gitlint issue #176 实证：连「title/body 边界」这种最简单的结构位判定都有边角漏洞（尾随空行导致 B6 失效），靠 issue＋patch 修复【S17】——分层规则的位置定义必须可判（空行/分隔符显式定义），且位形枚举的**扩充通道要法定**（新增受检列=立法票，不许散文里悄悄长出新的「事实指针位」长期不检）。这与本仓 D-149 守卫入列、D-185 开工对表机制天然咬合。

## 4) 冲突扫描（对本仓 current 决策）

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| **D-188 指针实名化** | 否——**被具体化** | D-188 定了指针字段的法定形（SHA≥12hex＋subject＋存在∧可达），本轮定「哪些位是字段」；融合裁定把 F1（勘误列）、W8（补钉表值）、W6（T3/账行括注）三类实证位全部纳入严格层或宽层窄禁令，正是 D-188 缺的划界半边 |
| **D-161④ footer 机读位 vs subject 人读位分工** | 否——**同构支持** | D-161④ 本身就是「位置分层」决策，本轮裁定是其一般化 |
| **D-181 勘误三字段** | 否 | 勘误节「变更 commit 指针」列在任何口径下都是命名指针列，原样受检 |
| **D-165/D-170 分层定稿** | 否——同向 | 裁定层/验收层分档与「结构位/叙述位」分档同族 |
| **D-146⑤ 链式追加** | 否 | 叙述段从宽层规则使追加叙述可继续用短码叙事，仅「裸短码唯一指代」受限 |
| **D-148③ 不溯既往** | 否——须显式衔接 | T3 残留 `(wmu)` 按 R51-Q1 已定路径走 D-181 勘误通道处置，不强制回写 |
| **D-095 枚举 closed 面** | 否——**被援引** | 严格层位形枚举必须封闭，扩列走票；禁「事实指针位」无票增长（C6） |
| **D-149/D-160 守卫建制** | 否 | 守卫实现=列头白名单＋括注正则＋散文层裸短码检测，按 D-149 入列 |
| **D-185 开工对表** | 否 | 对表项加「指针位形枚举与当前文档结构一致」检查 |

## 5) 推荐＋理由＋置信度

**推荐：融合形态——「(iv) 分层架构 × (ii) 职能定义判据 × 位形封闭枚举承载机检」。**

- **严格层（法定形全检：SHA≥12hex＋("subject")＋写入时点存在∧可达）**：职能上「唯一/首要定位一个 commit」的一切位置——勘误节指针列、登记表证据锚列、去向表指针位、审计固定点与返工链位、T3 表 commit 指代列、补钉表值位、账行/表格内**唯一指代手段**的括注。机检=封闭位形枚举（列头白名单＋锚定正则），枚举扩充走立法票。
- **宽层（叙述段）**：SHA 任意位数提及自由；短码可作叙事别名**当且仅当**同一记录内存在严格层合法指针承载同一指代；裸短码单独承担定位=违规。此层判据人工一问可判（C4），机检=括注短码位正则＋同记录指针位共现检查。
- **理由**：三层证据收敛——①git/kernel/CC/Gerrit/front matter/POA&M 六域先例全部同型于「结构位严＋散文宽」（C2/C5）；②宽口径误报税有 lint 生态实证否决（C1）；③窄口径漏 W6 同型缺口，而职能判的机械化恰有 checkpatch 官方先例（C3）。风险对冲：分层缝的失控风险用封闭枚举＋改票通道对冲（C6）。
- **置信度：高。** 架构层（分层）证据三域以上交叉；职能判机械化有一手官方先例（checkpatch、git trailer 启发式）；唯一留裁量的是「唯一指代手段」人工判，但 C4 的一问判据在审计窗可操作，且 D-188④ 本就把此类留人工。

## 6) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| S1 | git-interpret-trailers 官方文档 | https://git-scm.com/docs/git-interpret-trailers | Official | 更新至 2.56.0 (2026-09) | trailer=「otherwise free-form part 末尾」结构位定义＋25% 块判定启发式（职能≈位形近似的官方原型） |
| S2 | Conventional Commits v1.0.0 | https://www.conventionalcommits.org/en/v1.0.0/ | Official | 2021 | header/body/footer 三分，footer=机读位 |
| S3 | EC Git Commit Guidelines | https://ec.europa.eu/component-library/v1.14.2/ec/docs/conventions/git/ | Official | — | footer 承载 issue 引用与 BREAKING CHANGE 的组织级成文规范 |
| S4 | Errata in RFCs（RFC Editor） | https://www.rfc-editor.org/series/rfc-errata/ | Official | 2026-05-09 | 全文冻结＋结构化侧信道四态核验（反宽口径全文重扫的制度选择） |
| S5 | kernel submitting-patches（最新） | https://www.kernel.org/doc/html/latest/process/submitting-patches.html | Official | 持续 | Fixes: 12+ hex＋subject 双要素成文规范 |
| S6 | LKML: checkpatch enforce 12-char SHA for Fixes | https://lkml.indiana.edu/hypermail/linux/kernel/2507.2/09050.html | Official/Currency | 2025-07 | checkpatch 以位置锚定＋格式正则执法 Fixes（职能判机械化直接先例） |
| S7 | gitlint 内建规则 | https://jorisroovers.com/gitlint/latest/rules/builtin_rules/ | Official | 持续 | 全部规则=结构性质检查，零语义检查 |
| S8 | GitButler concepts（本仓 skill 引官方文本） | 本地 gitbutler skill（R51-Q1 已核） | Official | — | 短码 per-session、禁外传——裸短码禁令的官方依据 |
| S9 | RFC 3986（URI 语法） | http://pike.lysator.liu.se/rfc3986.xml | Official | 2005 | fragment 引用不蕴含可访问性——「提及≠定位义务」的规范依据 |
| S10 | golangci-lint False Positives 官方页 | https://golangci-lint.run/docs/linters/false-positives/ | Official/Criticism | 持续 | 误报是 linter 结构性问题 |
| S11 | Pylint false positives（lukeplant） | https://lukeplant.me.uk/blog/posts/pylint-false-positives/ | Criticism/Community | 2019 | 宽规则 95% 误报实测 |
| S12 | 7 drawbacks of linting tools（Codacy） | https://blog.codacy.com/7-drawbacks-of-linting-tools | Criticism | 2026-01 | 误报→告警失效的机制 |
| S13 | FedRAMP POA&M Playbook | https://www.fedramp.gov/legacy/playbook/csp/authorization/poam/ | Official | 2026-06 | 逐列法定字段＋授权包审查 |
| S14 | CDSE POA&M Job Aid | https://www.cdse.edu/portals/124/documents/jobaids/cyber/CDSE_POAM_Final_Job_Aid.pdf | Official | 2025-08 | 人工复核按列清单走（判别单位=列名） |
| S15 | FDA: Responding to Form 483（草案指南） | https://www.fda.gov/media/191427/download | Official | 2025-2026 | 结构化响应格式法定化 |
| S16 | FDA 483 response 实务（The FDA Group） | https://www.thefdagroup.com/blog/writing-an-effective-fda-483-response | Community/Comparative | 2023 | 叙述自由＋证据锚落位分工 |
| S17 | gitlint issue #176（B6 边界漏洞） | https://github.com/jorisroovers/gitlint/issues/176 | Community/Criticism | 2021-02 | 结构位判定也有边界漏洞→封闭枚举＋修票通道必要性 |
| S18 | yamllint issue #161（front matter lint） | https://github.com/adrienverge/yamllint/issues/161 | Community | 2019 | 结构化头域可 lint＋正文散文不检的 SSG 生态共识 |
| S19 | R51-Q1 调研报告（知识库跨会话） | batch:atomcode-r51q1 | 前轮调研 | 2026-09-30 | 短码禁当指针官方立场、12-hex 成文依据、不溯既往衔接路径——本轮直接复用 |

## 7) 信息缺口（如实标位）

1. **atomcode 深调研子代理未归**：进程持续存活但 ~25 分钟后知识库仍无本轮落库，延续 R48-Q4/R50-Q4「不归」形态；本报告按先例降级为三引擎直查承载。**若该进程后续落库，建议收口票前 ctx_search 召回合并**（同法 `atomcode -c` 续跑亦可，但按既有先例其结果与直查结论高度重叠的概率大）。
2. **IETF errata 报告表单的字段级引用格式**（erratum 是否强制结构化 section 引用字段）未抓到表单原文——RFC errata 官方页只证实了四态分类与「不回写正文」，字段级细节留待补抓 datatracker errata 流程草案全文。
3. **「位置管制 vs 形态管制」作为显式命名二分法**在审计/质量文献（POA&M/FDA 域）中未见理论化原文——本报告由六域实践归纳，非引用既有理论名词。
4. **FDA 483 草案指南为 PDF**，web_fetch 不可读，仅凭摘要与二级信源（Alston/NSF/The FDA Group）交叉——如需一手条文字段须另用浏览器渲染读 PDF。
5. **账本原文（decision-ledger.md 等）在 D:/ 根目录未逐条对表**（R51-Q1 同缺口延续）：冲突扫描基于题面转述＋知识库召回＋CONTEXT.md 词条命中，立法票前仍须做一次账本原文对表（D-185 语义）——编排层已补核 D-188/D-181/D-161④/D-146⑤/D-095/D-148③ 原文。
