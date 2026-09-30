# R51-Q1 调研报告 —— commit 指针实名化纪律（五候选裁决）

> 存档说明：atomcode 子代理深调研派遣三次回传失败（MCP stdio 回放故障，非配额耗尽），按 R48-Q4 同型先例转白名单工具（web_search/tavily/anysearch/ctx_search）自行合成——**degraded_performance 合法降级形态**（D-186：组成字段必填；本轮构成=atomcode 派遣未归→编排层合成）。题面存档见 reports/R51-Q1-research-prompt.md。

**Sufficiency Gate**：searches: 7（web_search×1、tavily×3、anysearch×1、tavily 定向×2）| angles: Official（Gerrit/kernel/git/GitButler 官方文档）＋Criticism（change-id 非唯一性、patch-id 局限）＋Community（HN/Lobsters/reflog 教程）＋Comparative（Gerrit vs jj vs GitButler change-id 生态）｜full reads: 6（gerrit user-changeid、gerrit commit-msg hook、git-cherry-pick、git-patch-id、GitButler rubbing 教程、kernel submitting-patches latest）｜gaps: 见 §6。**缺口声明**：本地账本/CONTEXT.md 在 atomcode 子代理环境未定位到，冲突扫描以题面约束条文＋知识库跨会话召回为据，账本原文逐条核对由编排层补足（本仓侧已核 D-181/D-148③/D-146⑤ 原文）。

## 1) 执行摘要（Tl;dr）

**推荐：以 (i) 单层实名化为主体立法，内嵌 (ii) 的降格形态（change-id 仅作叙述性辅证字段、永不作指针），并将 (iv) 的「孪生检测」作为最小守卫按 D-149 规程入列；拒绝 (iii) 推迟落盘、拒绝 (v) 的完整三层一步到位。** Confidence：**高**——Gerrit 双身份模型、kernel 12-hex 惯例、GitButler 短码会话性三条主腿均有官方一手文档两源以上交叉验证；置信折扣在于机检成本效益一条只有间接证据（patch-id 官方定位「reasonably stable」），以及账本原文未逐条核对。

## 2) 分点结论

**C1. 双身份（patch-identity vs commit-identity）是业界成文模型，Gerrit 为 canonical 先例。** Gerrit 官方文档明文：Change-Id「is independent of the commit id」，amend/rebase/cherry-pick 时「leave the Change-Id line unmodified」即可让新 commit 自动挂回同一 change【S1】【S2】。GitButler 博客与 HN/lobsters 证实 jj/GitButler/Gerrit 正在协作统一 change-id 头格式（reverse-hex），语义同型【S5】【S6】。→ 候选 (ii) 的心智模型有充分工业先例。

**C2. 但 change-id 的缺陷面恰好落在审计文书场景。** ① Gerrit 官方明文承认「Change-Id is **not necessarily unique** within a Gerrit instance——可在不同 repo/branch 复用」【S1】——这正是本仓孪生事件的同构病：change-id 相同的 SHA 可能不止一个（孤儿孪生 vs 主线），change-id 无法单独消歧。② 非 Gerrit 环境下无服务端 change→patchset 索引，反查只能 `git log --grep` 或 cat-file 全扫（依赖对象未被 gc）。③ 3 字母短码（wmu/xqr）官方定位明确是**会话内 UI 便利**：GitButler skill 的 concepts.md 官方文本「IDs are generated **per-session**…always read them from `but status`」「branch short IDs identify branches only within the workspace snapshot」【S9】，且 verbose 行的 sha 注记「changes on every amend; do not pass it to commands」——连 GitButler 自己都警告短码不可外传。→ **短码禁当指针＝官方立场直接支持；(ii) 只能降格为辅证字段，不能升为指针。**

**C3. SHA 实名化＋长度下限有成文先例。** kernel 官方 submitting-patches：Fixes 标签要求「first 12 characters of the SHA-1」且「use **at least** the first twelve characters…collisions with shorter IDs a real possibility…even if there is no collision with your six-character ID **now**, that condition may change five years from now」【S3】【S4】——这正是「钉最短板数 12+ hex」的成文依据，且其论证（现在不碰撞≠未来不碰撞）恰好支持审计文书的长期稳定性取向应取更保守长度。kernel 同时示范「`commit <12-hex> ("subject")` 双要素格式」，subject 作为人读校验位可一并采纳。

**C4. 「写入时即钉」vs「收口回填」：时点权衡有明确先例。** kernel Fixes 标签、git cherry-pick `-x`（「(cherry picked from commit …)」写入即时 SHA）【S7】都是写入时点即钉实例 SHA，无一采用占位符回填；Gerrit patch-set 模型则相反——指针永远指向「服务端当前认可的那个 SHA」，隐含「指针的权威时点=收口时点」。两条先例各支持一半，裁决关键在本仓账本=唯一事实源立场：账本条目是审计记录而非活评审页，占位符意味着存在一个「账本暂时说不出事实」的窗口，违反账本作为事实源的语义。且 R51 实证已证明收口后 amend 仍会发生（W8），「收口回填」并不消灭漂移风险，只是把风险移到回填动作本身的正确性上。→ **(iii) 否决**；(i) 的「写入时点主线可达」判据（cat-file -e＋merge-base --is-ancestor）是把 W8 的教训内化为判据的正确形态，成文先例为 kernel「Fixes 必须指向实际引入 bug 的 commit」语义＋git cherry 的 patch-id 等价检测（官方文档主用例即「look for likely duplicate commits」【S8】）。

**C5. 孤儿 commit 的文档引用规避：reflog 生态的共识是「不在文书中引用不可达对象」。** reflog 文献一致强调 reflog 条目数周后被 gc 清除【S10】【S11】——引用一个仅 reflog 可达的 commit，等于引用一个注定悬空的指针。这直接支持 (i) 的「主线可达」判据成为指针合法性条件：不可达=不合法指针，即使 cat-file -e 通过。

**C6. 机检守卫（iv）成本效益：有工具先例但应最小化。** git patch-id 官方定位「reasonably stable…reasonably unique」且主用例即查重【S8】——孪生检测（同 change-id 多 SHA 告警）可用 `git log --grep change-id` 实现，无需 patch-id 全扫，成本极低。但守卫全集扩张有伴生负担先例（R48-Q4 已裁「负担随 guard 集线性膨胀」）。→ **只入列最小守卫**：格式合法性（≥12 hex）＋存在性（cat-file -e）＋孪生告警（同 change-id 多 SHA），主线可达性检查在 GitButler 环境下 merge-base 语义不稳（虚拟分支栈），降为审计窗人工复核项——即 (iv) 的裁剪版，而非全量四查。

**C7. 五候选裁决矩阵。**

| 候选 | 裁定 | 核心依据 | 致命伤 |
|---|---|---|---|
| (i) 单层实名化 | ✅ **采纳为主腿** | kernel 12-hex 成文惯例【S3】【S4】；reflog/gc 悬空风险【S10】；账本事实源语义 | 单独使用则 W8 型错误（写时点后 amend）只能靠人工复核 |
| (ii) 双身份并列 | ⚠️ **降格采纳**（change-id=辅证字段非指针） | Gerrit 官方双轨模型【S1】【S2】；jj/GitButler 生态统一趋势【S5】【S6】 | change-id 非唯一（官方承认跨 branch 复用）【S1】；非 Gerrit 环境反查依赖 gc 存活；作指针则「同 id 多 SHA」时无法消歧——恰是本案病灶 |
| (iii) 推迟落盘 | ❌ **否决** | 无占位符回填先例；cherry-pick -x/kernel Fixes 均写入即钉【S7】 | 账本出现「事实源暂不载明事实」窗口；回填动作本身引入新的写错时点；W8 已证明收口后仍会 amend，问题未被消灭只被转移 |
| (iv) 机检守卫 | ⚠️ **裁剪采纳**（格式+存在性+孪生告警三项；可达性留人工） | git patch-id 官方主用例即查重【S8】；D-149 守卫入列规程有建制通道 | 主线可达性在 GitButler 虚拟栈下 merge-base 语义不稳，机检易假红；全量四查违反 R48-Q4 守卫负担最小化裁量 |
| (v) 三层复合 | ❌ **一步到位否决，路径采纳** | —— | 一步到位=建制过载；但 (i) 主腿＋(ii) 降格辅证＋(iv) 裁剪版守卫的渐进路径恰是推荐方案 |

## 3) 冲突扫描（按题面点名的 current 决策）

- **D-181 勘误三字段**：不冲突——「变更 commit 指针」字段由本立法**具体化**（指针=SHA+主线可达），三字段框架原样保留。
- **D-146⑤ 链式追加**：不冲突——内部短码降为叙述性别名后，链式追加的叙述段可继续用短码叙事，仅指针位受限。
- **D-177 预声明验证包**：不冲突——孪生检测守卫的验证包可走预声明。
- **D-148③ 生效时点不溯既往**：**须显式衔接**——账本 T3 读数表残留的 wmu/xqr 短码属旧条目，按不溯既往原则不强制改写，但应走 D-181 勘误通道（而非新立法追溯）处置，勘误条目本身按新指针纪律写。
- **D-074 git-object 零写入**：不冲突——cat-file -e/merge-base --is-ancestor/log --grep 全为只读。
- **D-149/D-160 守卫建制与退役**：不冲突——裁剪版守卫按 D-149 入列；建议立法时预埋退役条件（如 GitButler 官方 change-id 跨仓唯一性承诺出现则孪生检测可退役）。
- **D-185 开工对表**：不冲突——守卫入列后首个开工对表项应含「指针格式新规」检查。
- **D-165/D-170 分层定稿、D-161④ trailer 三栏位**：不冲突——成文载体落 WORKFLOW §4.2.10 扩写＋新词条（kernel 格式惯例入词条，操作判据入 §4.2.10），分层不变。
- **账本原文未逐条核对**（缺口）：冲突扫描中涉 D-条款者以题面转述＋知识库召回为据，立法票前由编排层补核（本仓侧已核 D-181/D-148③/D-146⑤ 原文）。

## 4) 推荐＋理由＋置信度

**推荐：分阶段复合（路径＝(i)→内嵌(ii)降格→(iv)裁剪），一步到位形态否决。置信度：高。**

1. **立即立法**（WORKFLOW §4.2.10 扩写＋新词条）：指针=git SHA（≥12 hex，kernel 惯例）＋("subject") 双要素；合法性判据=写入时点 cat-file -e＋主线可达；内部短码全面禁当指针、降为叙述性别名；change-id 允许作为**辅证字段**与 SHA 并列记录（便于 amend 后反查继任者），但字段名必须明示「辅证非指针」。
2. **机检按 D-149 入列**（裁剪版）：格式合法性＋存在性＋同 change-id 多 SHA 告警三项机检；主线可达性留审计窗人工复核。
3. **存量处置**：T3 残留短码走 D-181 勘误通道，勘误条目自身用新指针纪律——不修法溯既往，修条目走勘误。
4. **驳回 (iii)**：占位符回填无工业先例且破坏账本事实源语义，驳回理由入去向表。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| S1 | Gerrit Code Review - Change-Ids（官方，v3.14 文档） | gerrit-review.googlesource.com/Documentation/user-changeid.html | Official（已读原文） | change-id 独立于 commit id；amend/rebase 保 id；**非唯一性**（跨 repo/branch 可复用）——(ii) 缺陷面核心证据 |
| S2 | Gerrit commit-msg hook 文档（官方） | gerrit.googlesource.com/gerrit/+/HEAD/Documentation/cmd-hook-commit-msg.txt | Official（已读原文） | change-id 生成机制（虚拟 commit SHA-1）；「globally unique」承诺的边界（含 tree/parent/committer 时间戳——注意：含 parent，故 rebase 后 change-id 计算基变但 id 本身保留） |
| S3 | Linux kernel Submitting patches（latest，官方） | kernel.org/doc/html/latest/process/submitting-patches.html | Official（已读原文） | Fixes 标签格式与双要素引用惯例 |
| S4 | kernel Submitting patches v4.19（官方，经 tavily 全文命中） | kernel.org/doc/html/v4.19/process/submitting-patches.html | Official | 12-hex 最小长度成文依据原文（「at least twelve…may change five years from now」） |
| S5 | GitButler 官方博客：git-ux-rant | blog.gitbutler.com/git-ux-rant | Official/Community | change-id header=「track the identity of a change across commits…even if you rebased…SHA changed」——GitButler 对 change-id 持久性的官方立场 |
| S6 | HN #49794736 ＋ lobsters aupah1：Gerrit/GitButler/jj change-id 协作 | news.ycombinator.com/item?id=49794736; lobste.rs/s/aupah1 | Community/Currency（2026-09） | change-id 头格式跨项目统一（reverse-hex 互操作）、core git 未采纳——change-id 生态现状与前景 |
| S7 | git-cherry-pick 官方手册 | git-scm.com/docs/git-cherry-pick | Official（已读原文） | `-x` 溯源字段惯例：写入时点即钉源 SHA；且「private branch 无用」——**指针引用须面向公共可达面**的成文依据 |
| S8 | git-patch-id 官方手册 | git-scm.com/docs/git-patch-id | Official（已读原文） | patch-id「reasonably stable/unique」；主用例=查同型重复 commit——孪生检测工具先例及其局限（同 patch 可能多个合法 commit） |
| S9 | GitButler CLI skill concepts.md（本机官方随附文档） | C:/Users/Administrator/.agents/skills/gitbutler/references/concepts.md | Official（本地，已读） | 短码 per-session 生成、「always read from but status」、verbose sha「changes on every amend; do not pass it to commands」——3 字母短码=会话内 UI 便利的官方定位 |
| S10 | GitButler CLI 官方教程 rubbing | docs.gitbutler.com/cli-guides/cli-tutorial/rubbing | Official（已读原文） | 官方自述「Commit IDs with a change ID remain stable across history edits; a SHA-based ID can change when GitButler rewrites history」——amend 密集流下 SHA 不稳的一手承认，支持辅证字段价值 |
| S11 | reflog 恢复文献两篇 | dev.to/itxshakil/…; oneuptime.com/blog/2026-01-24-git-reflog-recovery | Community/Criticism | 孤儿 commit 仅 reflog 可达、gc 后消失——不可达对象不得入文书的机理证据 |

## 6) 信息缺口

1. **账本原文（decision-ledger.md / CONTEXT.md 词条 / WORKFLOW §4.2.10）未逐条核对**——atomcode 子代理环境未定位到本仓治理文件，冲突扫描建立在题面转述与知识库跨会话召回上；立法票前由编排层补核（本仓侧已核 D-181/D-148③/D-146⑤ 原文对表）。
2. **主线可达性机检在 GitButler 虚拟栈下的具体实现语义**（merge-base 对虚拟分支的适用性）未获一手验证——留待守卫建制票实测。
3. **GitButler change-id 在 merge/push 后的官方存续承诺**：官方教程说 change-id 跨历史编辑稳定，但「merge 到目标分支后头是否保留、上游 gc 后能否反查」未找到明文——反查方案（log --grep）目前是社区通行做法而非官方承诺。
4. 「monotonic vs unstable identifier 在审计文书的治理先例」未找到直接一手文献（金融/法务域未检索到落地案例），本报告以 Gerrit patch-set vs kernel Fixes 两极先例替代论证——如需更强支撑可补一轮学术/金融审计域检索。
