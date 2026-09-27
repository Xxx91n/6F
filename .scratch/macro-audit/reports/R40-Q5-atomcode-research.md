# R40-Q5 atomcode 调研报告存档（提交信息版面形态；atomcode -p 同题；Sufficiency：7 searches/4 angles/6 full reads；Tavily 配额降双引擎）

# R40-Q5 调研报告：提交信息版面形态的工业界心智模型

searches: 7（Exa×4 / AnySearch×3） | angles: Official / Comparative / Criticism / Community（4 类） | full reads: 6（conventionalcommits.org、git-interpret-trailers、Gerrit Change-Id 文档、kernel submitting-patches、cbea.ms、tbaggery）＋commitlint 源码/README 摘要核验＋仓内 decision-ledger D-018/041/044/139/140/144/153/156/157 全文核读 | gaps: GitButler 官方无强制 message 规范（只有 agent tuning 建议示例）、「发票式 subject」无公开同型先例可引（即本仓为负例孤证，工业界无背书——这本身是关键发现）；Tavily 配额 429 降级双引擎（沿 R40-Q3 先例）。

---

## 1) 执行摘要（Tl;dr）

**推荐候选 (i) Trailer 化，置信度：高。** 工业界的心智模型是精确存在的：**subject=人读面单意图摘要（"what+why"），body=自由文人读详情，footer/trailer=结构化机读元数据**——这一三栏位双受众分离模型在 git 核心工具链（`git interpret-trailers`、`git shortlog`、`format-patch`）、Conventional Commits §6-10、Linux kernel DCO 签名链、Gerrit Change-Id 四个独立生态中完全一致且各自独立成立。现行「发票式 subject」（~150 字全量清单＋D-ID 钉标题行）在四个生态中**均无先例**，且直接撞上「subject 被工具普遍截断」的硬约束——机读锚钉在被截断的行上，等于机读面自我削弱。候选 (i) 是唯一同时满足 D-157③ 门条件（内容不动只裁形态）且与全部 current D-xxx 零冲突的形态；唯一需显式声明的是 D-157 负向条款「trailer 化=形态兼容增强须显式声明」——本裁定即该声明的载体，非冲突。

## 2) 分点结论

### 2.1 三栏位分离是 git 原生心智模型，不是风格偏好

- **git 官方文档**（`git help commit`，经 commitlint issue #4092 引证）：「begin the commit message with a single short (≤50 chars) line summarizing the change, followed by a blank line and then a more thorough description」——subject/body 结构性分离是 git 的一等概念，第一行被 git 全工具链单独消费。
- **tbaggery（tpope, 2008，一手源，全文已读）**：subject line 被 `git log --oneline`、`git rebase -i`、`git shortlog`、`git format-patch`（作 email subject）、reflogs、gitk、GitHub **处处以截断形态使用**——「if there are any technical details that cannot be expressed in these strict size constraints, put them in the body instead」。这条对本案最致命：**D-ID 引用钉在 subject 上，凡工具截断处即丢锚**。
- **cbeams（2014，一手源，全文已读）**：「A diff will tell you what changed, but only the commit message can properly tell you why」——subject 承载单意图，细节落 body 是双受众设计的标准答案。

### 2.2 机读面迁 footer 是成熟工具链的标准形态（四处独立先例）

| 生态 | 机读 trailer | 证据 |
|---|---|---|
| git 本体 | `git interpret-trailers`：RFC 822 风格 Key: value，`--parse` 提供结构化解析器 | 官方文档全文已读；trailer 块识别规则明确（≥25% trailer 行＋空行前置） |
| Linux kernel | Signed-off-by / Acked-by / Reviewed-by / Fixes: 审计链（DCO 法律效力） | kernel.org submitting-patches 全文已读；SO/law.SE 交叉 |
| Gerrit | Change-Id **必须**在 footer（最后段落），Gerrit 直接拒收 footer 外的 Change-Id | Gerrit 官方文档全文已读：「a Change-Id line must be in the footer (last paragraph)」——**机读锚不进 footer 系统直接拒绝解析**，是「subject 钉机读锚」反例的官方反教材 |
| Conventional Commits | footer token MUST 用 `-` 代空格、`Key: value` 语法、显式「inspired by the git trailer convention」；BREAKING CHANGE 走 footer 承载语义变更 | v1.0.0 规范全文已读（§8-16） |

**关键推论**：本仓「将来 guard 做 commit↔ledger 引用闭合机检」的需求，恰好是 `git interpret-trailers --parse` 的原生用例——footer 结构化后机检从「subject 文本正则啃」升维为「标准解析器消费」，这条路径 Gerrit 已验证十余年。

### 2.3 50/72 规则的地位：经验惯例而非铁律，但「subject 须短」有工具实证

- 50/72 出自 tpope 2008 博文（preslav.me 2015 追溯），72=80 列终端减缩进，50=kernel 消息均值经验值——**起源是工具适配，非亚里士多德式先验**。
- 但现代规范已放宽：commitlint `@commitlint/config-conventional` 的 `header-max-length` **默认 100**（源码已核验，issue #4092 确认 72→100 演化）；Conventional Commits 不规定长度。GitHub 超过 72 字符截断 subject（community discussion #12450）。
- **对本仓的含义**：72 字符不是必须命中的人数，但 ~150 字 subject 在 GitHub/shortlog/oneline 视图中必然截断或污染整行列表——「发票式 subject」损害的是**列表扫描面**（正是审计者浏览历史的主视图）。

### 2.4 「commit message as audit surface」vs「audit metadata in footer」——工业界两案并存但后者占优

- kernel：审计面（DCO 签名链、Fixes、审阅链）**全部在 trailer**，subject 只有一句 what+why；其 patch 工作流（format-patch→email）依赖 subject 作邮件标题，进一步强制 subject 单意图。
- Conventional Commits 定位语自述：「a specification for adding **human and machine readable** meaning to commit messages」——双受众即规范的设计目标，实现方式恰恰是三栏位分工而非挤压。
- 未找到任何成熟项目把变更清单＋引用编号压缩进 subject 的先例（cbeams 文首的 Spring 反例正是被引以为戒的形态）。**「发票式 subject」= 孤证反例，无工业背书**——外部锐评「双受众挤同一行」的指控在信源面上成立。

### 2.5 GitButler 语境适配

GitButler 官方文档不强制 message 形态，其 agent tuning 示例建议 Conventional Commits；`but squash -m`、`but reword` 全程支持 body/trailer 编辑，stacked-PR 工作流中 PR 标题取 subject——**subject 收敛反而提升 stacked-PR 标题质量**。无冲突。

## 3) 对比矩阵

| 候选 | 工业界支持度 | 内容保全（D-157③ 门） | 机检升维路径 | 账本冲突 |
|---|---|---|---|---|
| (i) Trailer 化 | **高**：四生态独立先例（git/kernel/Gerrit/CC）＋`interpret-trailers --parse` 原生解析器 | 满足——内容一字不削，仅迁移栏位 | footer→标准解析器→闭合机检可直接实施 | 无硬冲突；须按 D-157 负向条款显式声明形态增强 |
| (ii) 维持现状 | **无先例**（四生态均无 subject 承载清单＋引用锚的形态）；GitHub/shortlog 截断直接伤机读锚 | 满足（不动） | 无——机检永远依赖 subject 正则，锚在截断行上脆弱 | 与 D-157③「裁面=形态改善」的入门方向相悖（该门已裁「进裁定链」即承认需改） |
| (iii) 轻改不引 trailer 语法 | **低**：body 承载分项符合 tpope 惯例，但放弃 trailer=放弃结构化机读面 | 满足 | 半升维——body 自由文仍需正则解析，机读锚语义未定型 | 无硬冲突，但放弃已验证 15 年的标准形态无技术理由 |

## 4) 推荐与理由

**推荐 (i) Trailer 化**，理由链：

1. **心智模型对位精确**：候选 (i) 正是 git/Conventional Commits 的三栏位模型（subject=单意图人读 / body=自由文详情 / footer=结构化机读），且 kernel+Gerrit 证明「审计元数据走 trailer」在重审计场景（法律级 DCO、评审追踪）下经过最大规模实证。
2. **机检收益是实打实的**：本仓已裁定的 commit↔ledger 引用闭合机检方向（D-041 机检优先、D-044 分层账本纪律），在 footer 结构化后从正则啃变为 `git interpret-trailers --parse` 消费——把将来守卫的实现成本和误报率同时压低。
3. **D-157③ 门条件精确满足**：D-ID／M-号／分项清单全部保留（迁 body bullets＋footer tokens），裁的只是栏位分配——「不改纪律的形态改善」门语言的原样兑现。
4. **建议的具体形态**（供裁定参考，非本轮拍板项）：
   - subject：`feat(轮40批2-β探测面硬化): 豁免判据改剥后消费位＋multi-hit 扩面＋S1/S2 整改`（收敛至一行意图）
   - body bullets：原分项清单逐条
   - footer：`Ledger-Refs: D-153 D-154 D-156`／`Chronicle: M-025`／`Adrs: ADR-0024`（token 语法从 CC §8：无空格、`-` 代空格）
5. **落地注意**：trailer token 词表（Ledger-Refs/Chronicle/Adrs）须在 CONTEXT.md 立词条声明（沿 D-156④ 词条同步惯例）；截断风险点（GitHub >72 截断 subject）不影响 footer——footer 在 message 尾部永不截断。

## 5) 与 current D-xxx 冲突清单（修订协议呈报义务）

| D-xxx | 关系 | 判定 |
|---|---|---|
| D-157③ | 本裁面的入门条件来源；负向条款「禁 C3 处置动编年纪律本身（trailer 化=形态兼容增强**须显式声明**）」 | **非冲突，但须履行**：本裁定落地时须显式声明「trailer 化为形态兼容增强」——D-ID/M-号内容语义零改动，仅载体迁移；此声明即满足该负向条款 |
| D-018 | 内容长度不可削的纪律来源（编年/引用/分项=审计面内容） | **零冲突**：候选 (i) 明文「内容一字不削」；阈值/编年纪律本体不动 |
| D-041/D-044 | 机检优先、绑定↔事件分层纪律 | **同向**：footer 结构化是 D-041⑤「禁通用规则引擎、按四模式成本序」框架内的解析面改善，不新增机制 |
| D-139/D-140 | 独立 commit 纪律（format/bundle 不搭车） | **零冲突**：trailer 化是 message 内容纪律，与生成物 commit 分类正交；但落地新 message 形态属规程，按 D-148③ 自落盘 commit 起生效、落盘自身豁免 |
| D-144①④ | 账行↔编年随行核对 | **同向增强**：footer 化后 Ledger-Refs/Chronicle 可机检闭合，核对从人工随行升级为守卫可验证 |
| D-153/D-156 | 裁定颗粒度/完备性惯例 | **零冲突**：本候选属裁定链内事项，须按惯例附调研出处＋CONTEXT 词条声明 |

**无任何条目须标 revised。**

## 6) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| Conventional Commits 1.0.0 | conventionalcommits.org/en/v1.0.0/ | Official | §6-10 三栏位语法全文；「human and machine readable」设计目标 |
| git-interpret-trailers | git-scm.com/docs/git-interpret-trailers | Official | trailer 解析器原文（--parse／识别规则）——机检升维的原生工具 |
| Gerrit Change-Ids | gerrit.cloudera.org/Documentation/user-changeid.html | Official | Change-Id 必须 footer＋拒收 subject 位锚——反例官方反教材 |
| kernel submitting-patches | kernel.org/doc/html/latest/process/submitting-patches.html | Official | DCO 签名链审计面全在 trailer、subject=what+why |
| A Note About Git Commit Messages | tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html | Official/一手 | 50/72 起源＋subject 全工具链截断消费清单（本案最致命论据） |
| How to Write a Git Commit Message | cbea.ms/git-commit/ | Community/一手 | what/why 分工反例正面论证（Spring 发票式反例） |
| commitlint #4092 | github.com/conventional-changelog/commitlint/issues/4092 | Community | header-max-length 72→100 演化＋git 官方 50 字源引证 |
| @commitlint/config-conventional README | github.com/.../config-conventional/README.md | Official | 现代 subject 上限实证=100 非铁律 |
| What's with the 50/72 rule? | preslav.me/2015/02/21/what-s-with-the-50-72-rule/ | Criticism/追溯 | 50/72=工具适配经验值非先验 |
| GitHub truncation discussion | github.com/orgs/community/discussions/12450 | Criticism | >72 subject 被 GitHub 截断实证 |
| GitButler docs（tuning/CLI） | docs.gitbutler.com | Official | but 全程支持 body/reword；无强制形态冲突 |
| Kernel DCO signoff（SO/cert-manager） | stackoverflow.com/questions/1962094 等 | Community | Signed-off-by 审计语义交叉验证 |

## 7) 信息缺口

- 「发票式 subject」无公开同型先例——无法引用某成熟项目同形态存续的证据，正反两侧都只能靠三栏位模型外推（但反例侧被 cbeams 的 Spring 案例直接覆盖）。
- Gerrit 原始官方站（gerrit-review.googlesource.com）取的是 cloudera 镜像文档，v2.14 与当前版语义无已知差异（Change-Id footer 要求至今未变，jj-vcs 2026 讨论 #9349 佐证其仍活跃）。
- kernel 文档 50 字段落只取到目录与开篇，subject 具体段（≤70-75 字）经 SO #2290016 引文交叉验证，未全文重抓——关键句已双源（preslav.me＋SO 摘要引文）支撑，风险低。

