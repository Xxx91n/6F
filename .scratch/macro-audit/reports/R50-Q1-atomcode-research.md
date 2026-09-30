# R50-Q1 调研报告：共用注释剥离器 regex 字面量盲区处置

> 存档说明：atomcode CLI（ctx_batch_execute label=atomcode-r50q1）2026-09-30 跑回。过程如实登记——atomcode 子代理自报：派遣后调用返回未知状态，按续跑锚定探测后台进程（PID 7456/17220 存活）并轮询等待；后台深调研超时未归（进程存活中，不杀不弃），按 R35-Q4 先例转三引擎直查（web_search×3＋Tavily×3＋AnySearch×3＋ctx_search 知识库召回×4）合成，后台结果若后续落库可作补强。题面存档见 reports/R50-Q1-research-prompt.md。

**Sufficiency Gate** — searches: 10+（web_search ×3 · Tavily ×3 · AnySearch ×3＋ctx_search 知识库召回 ×4）| angles: Official（TS wiki/scanner、V8 scanner、js-tokens README、strip-comments README、Prism FAQ）/ Comparative（parser-based vs regex-based stripper 分层）/ Criticism（js-tokens known errors、Padolsey 复盘评论、Prism 已知失败面）/ Currency（typescript-go 2024 regex recovery commit）/ Community（Reddit r/Compilers、SO、j11y 评论线）五类全覆盖 | full reads: 6 篇全文（js-tokens README、strip-comments README、TS wiki FAQ、Prism FAQ、j11y Padolsey、typescript-go commit diff）＋4 篇实质原文摘录（TS scanner.ts、V8 scanner.cc、turbohtml lexer.c、fuz_code lexer_ts.ts）| gaps: ①acorn/esbuild/terser 源码直读未成（404/未命中），其结论以 js-tokens（自证与 Babel 同型 tokenization）＋V8＋TS 三方交叉支撑；②后台 atomcode 深调研未返回，第三轮独证缺位；③本仓被扫面语料上的启发式误识率无实测数据。

## 1) 执行摘要（Tl;dr）

**推荐：分步组合——本轮先落 (ii) 的机械化形态（附录B三条件判别成文为自动探测闸门＋D-181 勘误在册），下轮执行批按 D-177 预声明立项 (i)：check-kit 补 regex 字面量态，采用 js-tokens 式前驱 token 启发式＋「regex 不跨行」天然行级闭合，配等价性 golden fixture 全量对照后 70-check 回迁；70-check 本地双轨在修复落地前为合法过渡态。**（Confidence：高——工业心智模型有 TS/V8/js-tokens/Prism 四方一手文档交叉；唯一中置信项是启发式在本仓语料上的残余误识率，需 fixture 实测补证。）核心理由：前驱 token 启发式被工业界验证为**无 parser 条件下的标准解**（js-tokens 全库即此方案且自证与 Babel tokenization 一致），残差有界且可枚举；而 (iii)/(iv) 与 D-094③ 共用化立法方向相逆，(ii) 单独长期化则判别税逐位复利。

## 2) 分点结论

### ① 前驱 token 启发式的可靠性边界（特别裁决一）

**结论：无全量 parse 下，前驱 token 启发式是工业界事实标准，对合法代码可靠性极高，残差集中在 `}` 的 block-vs-object 字面量歧义一类，可枚举、可fixture。**（Confidence：高）

- **js-tokens**（regex-powered tokenizer，npm 周下载千万级，Babel 生态常用）官方 README 全文核验：「Differentiating between regex and division in JavaScript is really tricky. **js-tokens looks at the previous token** to tell them apart. As long as the previous tokens are valid, it should do the right thing.」并显式公布其**全部已知误识案例仅 3 组**，全部是 `}` 之后「block 结束→regex」vs「object 字面量结束→除号」的二义（`{}/a/g`、switch-case 冒号、labeled statement），且官方明言「it does not seem like you can distinguish between the two without implementing a parser」——即**残差不是实现缺陷而是该方案的理论边界**，工业做法是把边界写成 documented known-errors 而非假装清零。
- **粗粒度前驱分类的实用形态**：两个独立实现（turbohtml 的 C lexer、fuz_code 的 TS lexer）展示同一规则：「`/` is division after an identifier, numeric literal, string literal, `)`, `]`, or `}`; otherwise it's a regex」——即只需把前驱 token 分成 P_VALUE / P_NONE 两三档即可，工程量小且这正是 check-kit 零依赖可承载的形态。turbohtml lexer 另展示**parser-rescan 变体**：lexer 一律产 DIV，parser 在需要 regex 的位置 rewind 重扫（`jm_lex_rescan_regex`）——这是 V8（`ScanRegExpPattern` 由 parser 决定调用）、TypeScript（`reScanSlashToken`，wiki FAQ 全文核验：默认 InputElementDiv 扫除号，「in contexts where a bare `/` would not make sense (such as when parsing a PrimaryExpression), the goal is modified to InputElementRegExp」）共用的**语法目标（lexical goal）机制**。这证实：**真正生产级正确性靠 parser 上下文，启发式是「无 parser 时被广泛采用且残差可文档化」的降级档**——恰是 check-kit 的处境。
- **esbuild/terser 直读缺口如实声明**：源码未取到原文，但其同族证据（V8/TS/acorn 生态 + js-tokens 自证 Babel 一致性）已足支撑结论方向；esbuild 的 js_lexer 同样是手写 lexer＋parser 驱动的 regex 上下文（AnySearch 命中其 issue #201 讨论 lexer 形态，未逐行核验，标注为外推）。

### ② 安全方向判定：误留 vs 误删的不对称（特别裁决二）

**结论：在「剥面供盘点/扫描」的用途下，业界惯例支持把错误方向全偏「误留」（保守不剥），因为下游断言能捕获漂移；「误删」（把代码内容当 regex 吞掉）是静默丢失，是危险向。**（Confidence：高）

- **Prism FAQ 全文核验**给出 regex-powered 工具的存在理由，其中一条直接是安全向论证：「**Graceful error recovery. Parsers fail on incorrect syntax, where regular expressions keep matching.**」——regex 型工具的错误模式是「少识别/保留原文」，不是「吞掉内容」；Prism 并官方承认 99% 准确率量级的误差是可接受代价，且**已知失败面逐条公开文档化**（「Prism's known failures are documented on this page」）。
- **历史教训的反面印证**：Padolsey 2009 经典 comment-removal 方案（先剥字符串/regex 再剥注释）评论区逐条翻车实录（嵌套定界符、行尾无换行、`/* comment */ program //comment` 输出错误内容）——翻车形态全是「**删错内容**」而非「留下注释」。作者本人结论：「the comment problem can't be solved with regular expressions」，且「trust the parsers over this」。这印证两点：(a) 无 parser 剥离器的失败模式主要是危险向的误删；(b) 工业劝告是把这类工具的契约明示为「不保证 parser 级正确」。
- **socket.dev 对 stripper 生态的分层**（搜索快照，原文 403 已声明）：社区把 stripper 显式分「parser-based（不会被 strings/regex 内的伪注释绊倒）」与「non-parser-based（有已知绊点）」两档——**分层本身就是治理手段**：非 parser 档合法存在，但须声明档位与已知绊点。
- **映射到本仓**：70-check 实证故障形态是 inStr 粘滞→注释被当字符串保留→**该剥不剥→盘点漂移**——这恰是「误留」安全向，且被 E1 断言当场抓获（fail-visible）。若反向修（激进进 regex 态但误判除号），会把 `a / b` 后的代码当 regex 吞掉→**误删危险向→静默漏扫**。因此若做 (i)，regex 态的进入条件必须**保守偏除号**（前驱不在高置信 regex 允许集时不进 regex 态），宁可残余 70-check 型漂移（断言可捕获）不可引入静默漏扫。这是「全偏安全向」设计的直接应用。

### ③ 行级回退/降级策略先例（特别裁决三）

**结论：有先例，且比「先例」更强——它是 JS 词法语法自身的内置属性＋TS 官方分类器的实际工作方式。**（Confidence：高）

- JS regex 字面量**语法上不可跨行**（js-tokens README：「JavaScript regex literals cannot contain newlines…so unclosed regex literals simply end at the end of the line」；V8 `ScanRegExpPattern` 遇行终止符即 return false）——即「检测到歧义/未闭合，降级到行尾闭合」**就是 spec 允许的标准恢复路径**。
- TS wiki FAQ 全文核验：TS 的 lexical classifier「is intended to be fast and **work on single lines at a time**…only has the context of a single line with a previous line state」，并且官方承认其在嵌套模板串等场景「results may not be accurate…In practice this does not happen much, so the behavior is largely acceptable」——**行级＋前驱状态的降级分类器被 TypeScript 官方作为产品形态发布**，并附带官方使用指引（见④）。typescript-go 2024-12 的 `reScanSlashToken` 错误恢复 commit 进一步展示：未闭合 regex 时逐层找不平衡括号截断——行内启发式恢复的当代实例。
- 映射到 check-kit：即使不加 regex 态，「检测到疑似 regex-引号形→该行降级为不信任/标记人工复核」的行级回退也有充分工业正当性，可作为 (i) 落地前的过渡护栏或 (i) 内部的歧义行兜底。

### ④ adoption gate 对共享工具是否合法长期态（特别裁决四）

**结论：分档准入（accuracy-needs-based routing）是业界认可的正式机制，但合法形态是「机械化闸门」，人工逐位判别不是长期态——后者是复利型技术债。**（Confidence：高）

- **TS 官方即采用此模式**（wiki FAQ 原文）：「consumers who need classifiers should rely on the syntactic (and semantic) classifiers **if accuracy is important**, using the lexical classifier **as a fallback**」——共享工具（lexical classifier）保留，但**官方明文规定消费位按准确性需求路由**。这正是「narrow contract＋adoption gate」的一等公民形态。
- **本仓已有同构判例**（知识库召回，R39-Q2）：suppression 判据裁决确立「豁免必须锚定消费位＋机械化，『注释提及即豁免』是全局豁免反模式」——映射到本题：附录B三条件判别若停留为「每迁一件人工过一遍」，形态上正是 R39-Q2 已裁过的手工豁免；成文为**自动探测**（迁入前跑一个小 check：扫描被扫面是否有 regex-引号形/歧义除号位，命中即阻断迁入）才是合法形态。
- **成本判断**：同意题面「AR 五要件登记成本≥修的边际成本」的直觉——(ii) 作为**终态**不经济；作为**过渡闸**（修复落地前的 1-2 轮）则恰好是 TS 模式：闸门在根治完成后自然退役。

### ⑤ 契约收窄声明的先例评价

**结论：narrow contract 合法，但必须带「检测机制＋已知失败语料」双重实体，纯声明式收窄=改名免责，业界面目不佳。**（Confidence：中高）

- 正面先例：js-tokens 把窄契约做成了**文档化的 known-errors 语料**（3 组案例＋逐例期望/实际输出）——收窄声明因为附带了可复现的失败边界而成为有效契约。Prism 同构（known failures 专页）。
- 反面印证：Reddit r/node 实测「strip-comments works OK on .css but can not remove comments from (JS)」——纯声明不带检测的窄契约工具在社区的口碑是「不可靠」，用户实际转向 parser 档。即：**契约收窄若无机器可验的边界声明，市场裁决=不信任**。
- 映射到 (iii)：若选 (iii)，必须补「regex-引号形探测器」使「限无 regex 面」可机检，否则该候选在本仓自己的 D-169/D-171 镜下（补偿控制可验证性）都过不了五要件。

### ⑥ 等价性 fixture 惯例

**结论：lexer 变更配 golden corpus 对照是标准惯例，且本仓守卫形态天然适配。**（Confidence：高）js-tokens 用 test262-parser-tests（「passes all but 3 of test262-parser-tests」）＋自建 known-errors fixture 双层；TS 用 fixture 比对（js-tokens README 直接给出与 Babel 的 tokenization fixture 对照）。本仓先例（D-140② dist 等价性、D-177 预声明验证包）已是同构：对 8 消费位的全部被扫面做「旧剥面 vs 新剥面」全量快照对照，差异集须逐条归因（预期：regex 态修正类差异白名单＋零未归因差异），即可把「改错=全消费位共损」的风险压到断言级。

## 3) 对比矩阵

| 候选 | 盲区处置 | 工业先例强度 | 与账本兼容性 | 主要代价/风险 |
|---|---|---|---|---|
| (i) 立项根治（regex 态＋前驱启发式＋行级闭合＋fixture） | 收窄至可枚举残差（`}` 歧义类），非清零 | **强**：js-tokens 同型方案生产验证；TS/V8 验证 parser-rescan 上界 | 兼容：D-177 预声明先行、D-183 普查即修同向、D-094③ 正向 | 启发式残差须诚实声明；fixture 建设一次性成本；改错风险由 golden 全量对照压住 |
| (ii) AR＋迁入闸（三条件成文机械化） | 盲区永续但可控（断言兜底） | 中强：TS 消费位路由同构；但 AR 终态不经济 | 兼容；须满足 D-169/D-171 五要件＋到期日 | 每新增消费位付判别税；闸门若手工化=R39-Q2 已裁的全局豁免反模式 |
| (iii) 契约收窄＋冻结 | 盲区永续＋共用化停摆 | 中：收窄本身合法，但无机检=口碑性不可信（Reddit strip-comments 先例） | **与 D-094③ 方向相逆**；「改名免责」批评成立除非补机检 | 8 件中 7 件被迫维持可迁不可迁的模糊态 |
| (iv) 全回退去共用化 | 各件自适 | 弱：无主流项目从共享词法回退分散手搓 | **逆 D-094③**；A18/d179 两次同型 bug 史实证分散更易错 | 重复实现复活，同型 bug 第三次概率高 |

## 4) 冲突扫描（逐条）

| 决策 | 冲突面 | 裁定 |
|---|---|---|
| D-094③（共用化立法） | (iii)(iv) 逆向；(i)(ii) 同向 | (i)(ii) 组合不冲突且被加固 |
| D-177（预声明验证包） | (i) 的 regex 态变更触探测面 | 不冲突但**前置**：声明物化先于变更，fixture 集即声明物的一部分 |
| D-179（确定性生成）/D-181（勘误通道） | 70-check 现状记档 | 不冲突：D-181 记档在修复落地前存续，落地后勘误闭账 |
| D-183（普查即修） | 同型反模式命中处置 | 支持 (i)：盲区根因修除后普查判别条件整体退役 |
| D-169/D-171（AR 五要件） | 若 (ii) 过渡期 | 过渡期 AR 须五要件齐备（补偿控制=机械化闸门探测 check，非 prose） |
| D-139/D-140②（分 commit） | (i) 执行批 | 不冲突：check-kit 语义变更独立 commit，任何生成物独立 bundle commit |
| D-148③（生效时点） | 新闸门规制 | 自落盘 commit 起对新迁入生效，存量 8 件 grandfather |
| R39-Q2 判例（豁免锚定消费位＋机械化） | 闸门形态 | 闸门必须自动探测，禁手工「过一遍即过」 |

## 5) 推荐＋置信度＋缺口

**推荐：分步组合 (ii)→(i)。** 本轮：把附录B三条件判别落为自动探测件（新 check 或 75a 扩展），D-181 在册限制补 AR 五要件（补偿控制=该探测件；到期日=修复轮；具名裁者）。下轮执行批：D-177 预声明包（含等价性 fixture 集：regex-引号/除号后 `/`、`/=/` 角例、模板串内 `${/x/}`、js-tokens 三组 `}` 歧义案例逐条钉期望行为）→ check-kit 补 regex 态（前驱 token 三档分类 P_VALUE/P_NONE，**进入偏保守：歧义时按除号处理**→全偏「误留」安全向；regex 扫描遇行尾强制闭合=天然行级回退）→ 全消费位剥面 golden 对照零未归因差异 → 70-check 回迁、D-181 闭账、过渡闸退役。

**Confidence：高**（方向层：四方一手文档交叉＋本仓账本全兼容；形态层：js-tokens 直接证明零依赖启发式可行性）。**中置信项**：启发式在本仓被扫面语料上的残余误识率——js-tokens 的 3 组残差是否在本仓语料出现需 fixture 实测；缓解=fixture 集覆盖＋残差案例入 known-errors 册。

**缺口（如实标位）**：①acorn/esbuild/terser 源码未直读，其具体 prev-token 实现细节为生态交叉外推，执行批设计时应直接取 js-tokens 源码（单文件、零依赖、MIT）作为参考实现而非凭本报告转述；②后台 atomcode 深调研未返回，若后续落库可补第三独证；③「歧义时按除号」的全偏安全向在本仓盘点语义下的假阴率（漏检 regex 内引号形）无实测——探测件落地时一并量测。

## 6) 完整来源清单

| 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|
| js-tokens README | github.com/lydell/js-tokens/blob/master/README.md | Official | 持续维护 | **核心**：前驱 token 启发式方案全文＋3 组已知误识案例＋行级闭合规则＋与 Babel fixture 一致性声明 |
| TS wiki FAQs for API Consumers | github.com/microsoft/TypeScript-wiki/blob/main/FAQs-for-API-Consumers.md | Official | 持续维护 | lexical goals/reScan 机制官方解释＋「消费位按准确性需求路由」adoption gate 官方形态 |
| TS scanner.ts | github.com/microsoft/TypeScript/blob/main/src/compiler/scanner.ts | Official | 持续维护 | reScanSlashToken 实体 |
| typescript-go regex recovery commit | github.com/jamespack/typescript-go/commit/fd6ab05 | Official/Currency | 2024-12 | 未闭合 regex 行内启发式恢复的当代实例 |
| V8 scanner.cc ScanRegExpPattern | github.com/v8/v8/blob/master/src/scanner.cc | Official | — | parser 驱动 regex 扫描＋行终止符强制闭合 |
| Prism FAQ | prismjs.com/faq | Official/Criticism | — | regex-powered 工具的误差容忍哲学＋graceful recovery 安全向论证＋known failures 文档化惯例 |
| strip-comments README | github.com/jonschlinkert/strip-comments | Official | 2019 | 非 parser 档 stripper 实物；extract-comments 依赖 esprima=parser 档对照 |
| socket.dev strip-javascript-comments 分析 | socket.dev/npm/package/strip-javascript-comments | Criticism | 2019 | parser-based vs non-parser-based 分层（403，搜索快照，已声明） |
| Padolsey: JavaScript comment removal revisited | j11y.io/snippets/javascript-comment-removal-revisted/ | Community | 2009-09 | 无 parser 剥离失败模式实录（误删危险向）＋「trust the parsers」行业劝告 |
| Reddit r/node: most reliable comment remover | reddit.com/r/node/comments/16jrrow | Community | 2023 | 无机检窄契约工具的社区口碑裁决 |
| turbohtml lexer.c / fuz_code lexer_ts.ts（搜索摘录） | github.com/tox-dev/turbohtml 等 | Comparative | — | 三档前驱分类（P_VALUE/P_NONE）最小实现形态＋parser-rescan 变体 |
| Reddit r/Compilers tokenization 帖 | reddit.com/r/Compilers/comments/1cpx22l | Community | — | 「division operator is ambiguous to RegExp literals, context-driven pull-lexer required」社区共识 |
