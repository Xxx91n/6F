# R40-Q2 atomcode 调研报告存档（源头：atomcode -p F-A1 处置裁；Sufficiency Gate 见 §atomcode 自述）

# F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 3) 候选裁定
## 3) 候选裁定

**推荐 (a) 收紧谓词——豁免仅认剥后源码真消费形态（import/require 形态或 `stripComments(/stripMdComments(` 调用位）**，理由收敛为三条：

1. **光谱内最优对齐**：调用位豁免≈NullAway 的符号绑定＋CodeQL 的位姿纪律——「豁免绑定在真实消费点」是七工具唯一公共不变量；现状判据在光谱外无先例。
2. **对抗面收口**：(a) 后字符串常量提名不再豁免——ALIBI 证明的攻击类（不可达文本操纵检测器）被切断；注释与字符串两通道同堵，比现状只堵注释彻底。
3. **立法名兑现**：ADR-0024 立法名「判定锚消费位」，(a) 让实现真正到达「消费位」（import/调用=消费），现状只到「剥后提名位」——(a) 是 ADR 的兑现不是改向，**无需开 ADR-0025**，按 D-094(b)「合法演化」类在 ADR-0024 加一行注记（或 D-154① 补充执行注记）即可。

**(b) 只修文档不可取**：等于把「一行字符串常量可令 unstripped-scan 检出永久失效」的攻击面登记为有意接受——与 D-094③「欺诈（死面/名不副实）→修检查面」的自我分类正面冲突，也与 ADR-0024 Rejected 节已明文拒绝的「豁免判据维持提名位」同向。**文档必修但非充分**。

**(c) 中间档（字符串提名豁免标「宽豁免位」加注册钉）不推荐**：它管理的对象（字符串提名）本身就是无义务认知含义的噪音——写 `const _="stripComments"` 不构成任何豁免义务的「认知」，给它建注册钉=为无信息量面加管理成本；且注册钉会随字符串内容漂移产生维护债。若 (a) 落地后实测出现「字符串里合法讨论 stripComments 语义的文档型代码被误报」，届时再按 D-094 分诊逐件处置即可，无需预建机制。

**必修附件（随 (a) 同票）**：
- **CONTEXT:363 修正**：现文「注释或字符串里的字面提名不计」在现状实现下为**越界承诺**（实现只剥注释）。(a) 落地后该句变为真——应保留但改写为实现语义：「注释或字符串里的字面提名不计（豁免仅认 import/require 形态或 stripComments/stripMdComments 调用位）」，并把 S2 正对照 fixture 扩到字符串提名逃逸件（现有 fixture 只测注释逃逸）。
- **新检出 D-094 批注册门**：(a) 收紧后存量 41 件中若有「字符串提名豁免、无真实调用」的成员将从豁免集掉出→按 D-094 三分类批注册（预期属 (a) 守的真坏/合法演化类而非欺诈类，因 41 件在两语义下皆命中的实证已记录——**需重跑实测确认**，此为本报告唯一未验证项：41 件「两语义皆命中」是注释提名维度的实测，字符串提名维度的 41 件存活率未见实测记录）。
- **ADR-0024 注记**：一行「消费位判据于批2-β 执行窗兑现为 import/require/调用形态谓词，字符串提名不豁免（D-157）」，挂 ledger 指针。

## 收紧谓词

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 3) 候选裁定
## 3) 候选裁定

**推荐 (a) 收紧谓词——豁免仅认剥后源码真消费形态（import/require 形态或 `stripComments(/stripMdComments(` 调用位）**，理由收敛为三条：

1. **光谱内最优对齐**：调用位豁免≈NullAway 的符号绑定＋CodeQL 的位姿纪律——「豁免绑定在真实消费点」是七工具唯一公共不变量；现状判据在光谱外无先例。
2. **对抗面收口**：(a) 后字符串常量提名不再豁免——ALIBI 证明的攻击类（不可达文本操纵检测器）被切断；注释与字符串两通道同堵，比现状只堵注释彻底。
3. **立法名兑现**：ADR-0024 立法名「判定锚消费位」，(a) 让实现真正到达「消费位」（import/调用=消费），现状只到「剥后提名位」——(a) 是 ADR 的兑现不是改向，**无需开 ADR-0025**，按 D-094(b)「合法演化」类在 ADR-0024 加一行注记（或 D-154① 补充执行注记）即可。

**(b) 只修文档不可取**：等于把「一行字符串常量可令 unstripped-scan 检出永久失效」的攻击面登记为有意接受——与 D-094③「欺诈（死面/名不副实）→修检查面」的自我分类正面冲突，也与 ADR-0024 Rejected 节已明文拒绝的「豁免判据维持提名位」同向。**文档必修但非充分**。

**(c) 中间档（字符串提名豁免标「宽豁免位」加注册钉）不推荐**：它管理的对象（字符串提名）本身就是无义务认知含义的噪音——写 `const _="stripComments"` 不构成任何豁免义务的「认知」，给它建注册钉=为无信息量面加管理成本；且注册钉会随字符串内容漂移产生维护债。若 (a) 落地后实测出现「字符串里合法讨论 stripComments 语义的文档型代码被误报」，届时再按 D-094 分诊逐件处置即可，无需预建机制。

**必修附件（随 (a) 同票）**：
- **CONTEXT:363 修正**：现文「注释或字符串里的字面提名不计」在现状实现下为**越界承诺**（实现只剥注释）。(a) 落地后该句变为真——应保留但改写为实现语义：「注释或字符串里的字面提名不计（豁免仅认 import/require 形态或 stripComments/stripMdComments 调用位）」，并把 S2 正对照 fixture 扩到字符串提名逃逸件（现有 fixture 只测注释逃逸）。
- **新检出 D-094 批注册门**：(a) 收紧后存量 41 件中若有「字符串提名豁免、无真实调用」的成员将从豁免集掉出→按 D-094 三分类批注册（预期属 (a) 守的真坏/合法演化类而非欺诈类，因 41 件在两语义下皆命中的实证已记录——**需重跑实测确认**，此为本报告唯一未验证项：41 件「两语义皆命中」是注释提名维度的实测，字符串提名维度的 41 件存活率未见实测记录）。
- **ADR-0024 注记**：一行「消费位判据于批2-β 执行窗兑现为 import/require/调用形态谓词，字符串提名不豁免（D-157）」，挂 ledger 指针。

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**置信度：高（(a) 方向）／中（措辞钉法）。** 工业界所有主流抑制/豁免机制的公共心智模型是：**豁免绑定在被豁免对象的真实消费形态上（符号引用、注解绑定、规则点名、紧邻行位），且豁免必须是「具名的、可被审计的、死了会报红的」**——没有任何一个成熟工具接受「源码任意位置裸子串提及工具名即豁免」这种判据；本案 `unstrippedScanHit` 的现状正是这个反模式，且**字符串常量提名**与**注释提名**在「不可达文本为何能改变判定」这一点上完全同族（ALIBI 对抗评论研究把这一类统称为「不触碰程序语义即可操纵检测器」）。倾向 (a) 收紧谓词成立；但需注意两点修正：① CONTEXT:363「字符串里的字面提名不计」是**词条承诺超前于实现**——实现只剥注释不剥字符串，词条越界必修（改为「注释内提名不计」或随 (a) 扩到字符串）；② ADR-0024 立法名「判定锚消费位」与实现「剥后提名位」差半步——(a) 案恰好把这半步补齐，属立法名的**兑现**而非改向，ADR 补一行注记即可。

## 豁免粒度

### atomcode
# atomcode

$ atomcode -p "宏观+微观工程内容审计仓（D:/Aworker/6F）批2-β 探测面硬化 F-A1 处置裁。请回顾 .scratch/macro-audit/decision-ledger.md 全部 current 记录（157 条，重点 D-094 字面钉三分类/D-102 无牙族/D-154① 消费位判据/D-157 摄入分诊）、docs/adr/0024-detector-judgment-at-consumption-position.md 与 CONTEXT.md 消费位判据/豁免集可达性词条。病灶实证（75a-check.mjs:50）：unstrippedScanHit 豁免判据 if(/stripComments|stripMdComments/.test(stripped))return false——剥注释后源码任意位置裸子串即豁免，而剥注释工具不剥字符串→const _="stripComments" 纯字符串提名同获豁免（审计实证）；CONTEXT:363 写「字符串里的字面提名不计」=词条承诺比实现严、措辞越界必修。ADR-0024 立法名=「判…

我先回顾本地证据（ledger、ADR、CONTEXT、75a-check.mjs 病灶），再按配额做三引擎工业界先例调研。我先定位 75a-check.mjs 实际路径与 CONTEXT 词条、ledger 关键条目。本地证据链已齐。开始三引擎工业界先例调研——第一批官方文档角度。Tavily 配额已耗尽，改用 anysearch 作为第三引擎补位；继续覆盖 CodeQL/ErrorProne/PMD/Checkstyle 各工具豁免粒度与对抗可绕过（dodge）反模式角度。继续定点深挖：抓取官方原文核验（ESLint/CodeQL/NullAway/Semgrep），并补 PMD/Checkstyle 与「豁免绕过/误报取舍」角度。继续补齐 PMD/Checkstyle 粒度与「豁免可绕过（dodge）/误报-漏报取舍」角度，并核验原文。继续补 Checkstyle 抑制、CodeQL 消费位语义与「对抗可绕过抑制」角度的原文核验。再补两处原文核验（Semgrep 官方豁免页、对抗性注释绕过文），然后合成报告。调研配额已达成本地证据与外部先例齐备，出综合裁定报告。

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 2) 分点结论（工业界先例逐条） (1)
## 2) 分点结论（工业界先例逐条）

**① 成熟工具的豁免粒度光谱——全部锚定消费形态或具名绑定，无一锚定裸提名**

| 工具 | 豁免载体 | 粒度/绑定对象 | 提名字符串可获豁免？ | 死豁免处置 |
|---|---|---|---|---|
| ESLint | 注释指令 | 行级（disable-line/next-line）、区间级（disable/enable 对）、文件级、rule 点名必填 | 否——必须是 `eslint-disable` 语法形态的注释 | `reportUnusedDisableDirectives` 默认 warn，可升 error=死指令即红 |
| Semgrep | `nosemgrep` 注释 | 命中首行或紧邻前一行；rule-id 点名可选（匿名豁免受平台开关管控） | 否——注释必须在匹配位 | 豁免仍生成 finding 落 Ignored triage 态=豁免本身可见可审 |
| CodeQL | `// codeql[query-id]` / `lgtm[query-id]` 注释 | **空行紧邻 alert 之前**（2.12.0 明文「must be placed on a blank line before the alert」）；经 `@kind alert-suppression` 查询消费 | 否——query-id 点名＋位姿约束 | SARIF suppression 对象进 code scanning，alerts API 可见 |
| ErrorProne/NullAway | `@SuppressWarnings("BugPattern")` | **符号绑定**（方法/字段/类声明），BugPattern 具名；NullAway 官方 wiki 明言 method/class 级「often too coarse」并推荐 downcast 收窄 | 否——注解在声明位，编译器消费 | PMD 有 `UnnecessaryWarningSuppression` 规则反扫死豁免；ErrorProne 有 `SuppressWarningsDeprecated` 同型 |
| PMD | 注解＋SuppressionFilter XML | 注解=类/方法级，rule 点名（`PMD.UnusedLocalVariable`）；filter=文件/规则/XPath/message-regex 四维 | 否 | `--show-suppressed` 强制披露被抑制项 |
| gitleaks/eslint-seatbelt baseline | 基线文件 | 位置指纹绑定（文件+行+规则） | 否 | `--deny-unused-baseline`＝死项即红 |

**交叉验证**：ESLint vs Semgrep 官方博客（semgrep.dev 2021 对比文）双向确认两者都只在「命中行位」接受豁免、都支持 rule 点名收窄——两独立信源。NullAway wiki（2026-09-05 仍活跃修订）与 minconio/medium 第三方文双向确认注解粒度与「过粗抑制是反模式、官方主动劝退」立场。CodeQL 2.12.0 changelog 官方原文＋Stack Overflow 实操文双向确认紧邻位姿纪律。

**② 与本案判据的映射：本案豁免判据在光谱上比所有先例都宽**

本案 `if(/stripComments|stripMdComments/.test(stripped)) return false` 的语义是：**剥后源码任意位置出现工具名裸子串→全局豁免**。对照光谱：最接近的先例是 ESLint 的 `/* eslint no-alert: "off" */` 文件级关断——但那仍是**具名指令形态**（注释在指令语法位、可被 reportUnusedDisableDirectives 审计），不是「源码里任何地方写了这个函数名就行」。连以宽松著称的 `# noqa` 裸标注也要求**注释形态＋命中行位**两个约束。本案判据连注释形态约束都没有（字符串、属性名、标识符提名同获豁免）——**在七个工具的光谱上找不到同宽先例**。

**③ 对抗可 dodge（dodgeable suppression）先例：一行不可达文本令检出永久失效＝已命名反模式**

## 冲突点

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 4) 与 current D-xxx / ADR 的冲突点（显式列）
## 4) 与 current D-xxx / ADR 的冲突点（显式列）

| 冲突/张力点 | 对方立场 | 本案影响 | 处置 |
|---|---|---|---|
| **D-154① 「最小修法」限定** | ADR-0024 明文记 (i) 最小修法=先剥注释再测豁免谓词；字符串通道未入裁 | (a) 超出「最小修法」范围=探测语义再变更 | 按 D-154① 自设判据（「判据变更属探测语义难逆转变更」）走账本新裁 D-157＋ADR-0024 注记，非静默改 |
| **CONTEXT:363 词条越界** | 词条已承诺「字符串里的字面提名不计」而实现未兑现 | 词条=承诺比实现严（**反向名实分离**：通常病是实现超承诺，本案是承诺超实现） | (a) 落地即兑现词条；落盘前窗口期词条失实——同票落地消解，不留悬空期 |
| **D-094 三分类口径** | (a)守的真坏→修现实；欺诈→修检查面禁入 XFAIL | 41 件中字符串提名成员掉出豁免集后，其原豁免性质需重定性 | 批注册门重跑实测分诊；预判合法演化类；**禁入 XFAIL 册**纪律沿用 |
| **D-102 无牙族** | 自指断言/恒真断言=无牙 | unstripped-scan 被字符串提名致失效=检出牙被拔 | (a) 即补牙；S2 fixture 扩字符串逃逸件=牙的可杀性证明（对齐 D-102「可杀性是断言质量闸」） |
| **D-157 摄入分诊** | 摄入评审材料先分诊真伪 | 本报告的病灶实证（75a-check:50）我未能直接读源文件（文件不在 glob 命中路径，仅 CONTEXT/ADR/CHANGELOG 三方转述一致） | **置信度注**：病灶代码本体未一手核验，三方转述（CONTEXT:363 承认字符串提名、ADR-0024 Rejected 节、CHANGELOG M-025）互洽——建议执行窗先一手读 75a-check.mjs 确认行号与谓词形状再落刀 |
| **ADR-0024「单收①②」one-decision 纪律** | ③处置类不入册 | (a) 属①的同根深化非③类处置 | 注记归属①同根，不违反 Watson 反模式判据；若嫌注记重，降级为 ledger D-157 单条＋ADR Consequences 一行亦可 |

## nosemgrep

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 2) 分点结论（工业界先例逐条） (2)
- ALIBI（arXiv 2607.24964，2026-07）：向源码插入自然语言评论即可让 LLM 漏洞检出器 >90% 漏报真漏洞——核心机制「不触碰程序语义的文本改变检测器判定」。传统静态分析器**不把注释当指令读所以免疫**——这恰是本案的反面：75a-check 把注释/字符串里的提名当豁免判据读，等于主动把「注释层」接入了判定面。dev.to 分析文（2026-07-29）明确总结：「传统 linter/SAST 不读注释为指令，故对此攻击免疫」——**本案病灶等价于自愿放弃这层免疫**。
- Semgrep 官方 issue 讨论（#3521 关联 PR）：连「nosemgrep 出现在匹配区中间」都因「会造成指代混乱」被显式拒绝——业界对「豁免判据可被错位文本触发」的容忍度是零。
- Baseline 滥用：rafter.so 分诊指南（2026-03）把「无理由抑制＝time bomb」列为纪律红线，业界对策是 justification 强制＋expiry 强制——对应本案 D-094 批注册门的 41 件 convention-registered 册，方向一致。

**④「豁免误报 vs 漏报」取舍先例：豁免判据属「检测器的检测器」，业界一致选从严（宁误报不漏报）**

- Rafter 指南定量：SAST 30–70% FP 是常态，但业界对策是**强化分诊工作流**而非放宽豁免——「scanners that reduce false positives also reduce true positives」显式写成工程取舍；豁免判据放宽的直接代价就是 recall 损失。
- 检测豁免判据本身的 FP/FN：豁免判据过宽=检出面漏报（真消费者被豁免=假阴性豁免，本案 41 件之外的真调用若被字符串提名误豁免即此类）；过窄=豁免误报（真消费者未获豁免→检出误报→回到 D-094 批注册门走 (b) 类处置）。**业界先例（unused-disable-directives、UnnecessaryWarningSuppression、deny-unused-baseline）全部把「死豁免/坏豁免」做成 error 级**——即豁免面一律从严、误报走豁免注册流程消化，不走放宽豁免判据消化。这正是 (a)＋D-094 批注册门的组合。
- ESLint 官方「Disable Rules」节明文：「inline disable 应受限使用、必须带理由、优先配置文件级处理」——豁免是**特权**不是默认，特权对应窄判据。

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 2) 分点结论（工业界先例逐条） (1)
## 2) 分点结论（工业界先例逐条）

**① 成熟工具的豁免粒度光谱——全部锚定消费形态或具名绑定，无一锚定裸提名**

| 工具 | 豁免载体 | 粒度/绑定对象 | 提名字符串可获豁免？ | 死豁免处置 |
|---|---|---|---|---|
| ESLint | 注释指令 | 行级（disable-line/next-line）、区间级（disable/enable 对）、文件级、rule 点名必填 | 否——必须是 `eslint-disable` 语法形态的注释 | `reportUnusedDisableDirectives` 默认 warn，可升 error=死指令即红 |
| Semgrep | `nosemgrep` 注释 | 命中首行或紧邻前一行；rule-id 点名可选（匿名豁免受平台开关管控） | 否——注释必须在匹配位 | 豁免仍生成 finding 落 Ignored triage 态=豁免本身可见可审 |
| CodeQL | `// codeql[query-id]` / `lgtm[query-id]` 注释 | **空行紧邻 alert 之前**（2.12.0 明文「must be placed on a blank line before the alert」）；经 `@kind alert-suppression` 查询消费 | 否——query-id 点名＋位姿约束 | SARIF suppression 对象进 code scanning，alerts API 可见 |
| ErrorProne/NullAway | `@SuppressWarnings("BugPattern")` | **符号绑定**（方法/字段/类声明），BugPattern 具名；NullAway 官方 wiki 明言 method/class 级「often too coarse」并推荐 downcast 收窄 | 否——注解在声明位，编译器消费 | PMD 有 `UnnecessaryWarningSuppression` 规则反扫死豁免；ErrorProne 有 `SuppressWarningsDeprecated` 同型 |
| PMD | 注解＋SuppressionFilter XML | 注解=类/方法级，rule 点名（`PMD.UnusedLocalVariable`）；filter=文件/规则/XPath/message-regex 四维 | 否 | `--show-suppressed` 强制披露被抑制项 |
| gitleaks/eslint-seatbelt baseline | 基线文件 | 位置指纹绑定（文件+行+规则） | 否 | `--deny-unused-baseline`＝死项即红 |

**交叉验证**：ESLint vs Semgrep 官方博客（semgrep.dev 2021 对比文）双向确认两者都只在「命中行位」接受豁免、都支持 rule 点名收窄——两独立信源。NullAway wiki（2026-09-05 仍活跃修订）与 minconio/medium 第三方文双向确认注解粒度与「过粗抑制是反模式、官方主动劝退」立场。CodeQL 2.12.0 changelog 官方原文＋Stack Overflow 实操文双向确认紧邻位姿纪律。

**② 与本案判据的映射：本案豁免判据在光谱上比所有先例都宽**

本案 `if(/stripComments|stripMdComments/.test(stripped)) return false` 的语义是：**剥后源码任意位置出现工具名裸子串→全局豁免**。对照光谱：最接近的先例是 ESLint 的 `/* eslint no-alert: "off" */` 文件级关断——但那仍是**具名指令形态**（注释在指令语法位、可被 reportUnusedDisableDirectives 审计），不是「源码里任何地方写了这个函数名就行」。连以宽松著称的 `# noqa` 裸标注也要求**注释形态＋命中行位**两个约束。本案判据连注释形态约束都没有（字符串、属性名、标识符提名同获豁免）——**在七个工具的光谱上找不到同宽先例**。

**③ 对抗可 dodge（dodgeable suppression）先例：一行不可达文本令检出永久失效＝已命名反模式**

## 置信度

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 5) 置信度自评
## 5) 置信度自评

- **「业界无裸子串提名豁免先例」**：高——七工具官方文档/源码级核验，两独立信源/工具交叉。
- **「(a) 优于 (b)(c)」**：高——光谱对齐＋对抗面＋立法名兑现三路独立支撑。
- **「41 件在 (a) 下零迁移」**：**中低**——注释维度实测在案，字符串维度存活率未实测，执行窗必须先跑。
- **「病灶代码一手核验」**：**未达成**——文件定位失败（glob 无 75a-check.mjs 命中，可能路径约定不同），本报告基于三处一致转述；落刀前须一手读码。

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 1) 执行摘要（Tl;dr）
## 1) 执行摘要（Tl;dr）

**置信度：高（(a) 方向）／中（措辞钉法）。** 工业界所有主流抑制/豁免机制的公共心智模型是：**豁免绑定在被豁免对象的真实消费形态上（符号引用、注解绑定、规则点名、紧邻行位），且豁免必须是「具名的、可被审计的、死了会报红的」**——没有任何一个成熟工具接受「源码任意位置裸子串提及工具名即豁免」这种判据；本案 `unstrippedScanHit` 的现状正是这个反模式，且**字符串常量提名**与**注释提名**在「不可达文本为何能改变判定」这一点上完全同族（ALIBI 对抗评论研究把这一类统称为「不触碰程序语义即可操纵检测器」）。倾向 (a) 收紧谓词成立；但需注意两点修正：① CONTEXT:363「字符串里的字面提名不计」是**词条承诺超前于实现**——实现只剥注释不剥字符串，词条越界必修（改为「注释内提名不计」或随 (a) 扩到字符串）；② ADR-0024 立法名「判定锚消费位」与实现「剥后提名位」差半步——(a) 案恰好把这半步补齐，属立法名的**兑现**而非改向，ADR 补一行注记即可。

### F-A1 处置裁定支持报告：探测面豁免判据强度（批2-β 消费位判据 vs 字符串提名逃逸） > 4) 与 current D-xxx / ADR 的冲突点（显式列）
## 4) 与 current D-xxx / ADR 的冲突点（显式列）

| 冲突/张力点 | 对方立场 | 本案影响 | 处置 |
|---|---|---|---|
| **D-154① 「最小修法」限定** | ADR-0024 明文记 (i) 最小修法=先剥注释再测豁免谓词；字符串通道未入裁 | (a) 超出「最小修法」范围=探测语义再变更 | 按 D-154① 自设判据（「判据变更属探测语义难逆转变更」）走账本新裁 D-157＋ADR-0024 注记，非静默改 |
| **CONTEXT:363 词条越界** | 词条已承诺「字符串里的字面提名不计」而实现未兑现 | 词条=承诺比实现严（**反向名实分离**：通常病是实现超承诺，本案是承诺超实现） | (a) 落地即兑现词条；落盘前窗口期词条失实——同票落地消解，不留悬空期 |
| **D-094 三分类口径** | (a)守的真坏→修现实；欺诈→修检查面禁入 XFAIL | 41 件中字符串提名成员掉出豁免集后，其原豁免性质需重定性 | 批注册门重跑实测分诊；预判合法演化类；**禁入 XFAIL 册**纪律沿用 |
| **D-102 无牙族** | 自指断言/恒真断言=无牙 | unstripped-scan 被字符串提名致失效=检出牙被拔 | (a) 即补牙；S2 fixture 扩字符串逃逸件=牙的可杀性证明（对齐 D-102「可杀性是断言质量闸」） |
| **D-157 摄入分诊** | 摄入评审材料先分诊真伪 | 本报告的病灶实证（75a-check:50）我未能直接读源文件（文件不在 glob 命中路径，仅 CONTEXT/ADR/CHANGELOG 三方转述一致） | **置信度注**：病灶代码本体未一手核验，三方转述（CONTEXT:363 承认字符串提名、ADR-0024 Rejected 节、CHANGELOG M-025）互洽——建议执行窗先一手读 75a-check.mjs 确认行号与谓词形状再落刀 |
| **ADR-0024「单收①②」one-decision 纪律** | ③处置类不入册 | (a) 属①的同根深化非③类处置 | 注记归属①同根，不违反 Watson 反模式判据；若嫌注记重，降级为 ledger D-157 单条＋ADR Consequences 一行亦可 |

> **Tip:** Results are scoped to this batch only. To search across all indexed sources, use `ctx_search(queries: [...])` or call ctx_batch_execute with `query_scope: "global"`.

Searchable terms for follow-up: unstrippedscanhit, suppressions, suppressionfilter, alert-suppression, suppresswarningsdeprecated, justification, unstripped-scan, stripcomments, stripmdcomments, unnecessarywarningsuppression, checkstyle, comparative, suppression, 2026-07-29, anysearch, criticism, community, nosemgrep, atomcode, stripped, official, query-id, downcast, baseline, overflow, rejected, current, disable, ignored, 不读注释为指令, fixture, return, tavily, ignore, 判定锚消费位, triage, rafter, expiry, d-102, 消费位判据
