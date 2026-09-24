# R31-Q2 深调研：dist-in-repo 第三轮立场批评处置——工业取证与处置推荐

> atomcode 深调研存档（R31 轮，题面=R31-Q2-research-prompt.md）。检索：web_search×7+AnySearch×5（Tavily 额度耗尽双引擎补位）；原文深读 8 篇；官方一手×3。

## 1) 执行摘要（Tl;dr）

**推荐 (a) 维持不重裁＋登记，外加 (c) 的一个低成本增量动作（体积值守正式化）——即 (a)＋(c) 混合形态。** Confidence：高。理由：①外部锐评的核心指控（「dist 入仓是负担」）与 GitHub 官方 2026 年现状直接相反——官方教程（Node 24.x、actions/javascript-action、actions/typescript-action 三处一手证据）至今仍把 commit dist/ 作为标准流程，官方模板仓甚至自带 check-dist.yml rebuild-diff 守卫，即「批评所攻击的方案=官方现行标准做法」；②锐评本身零新增实证，按本仓 D-063/D-075 受理边界不构成重裁条件；③但「CI 打回一次」确实是 rebuild-diff 守卫按设计工作的实证（漏跑 bundle 被抓=守卫成功非失败），恰好证明该机制的低成本纠错价值。

## 2) 分点结论

### ① dist-in-repo 惯例现状——官方立场未反转，dist 入仓仍是现行标准

**结论：GitHub 官方至今（2026-09 实测原文）明确推荐 commit dist/，且官方自己的模板仓就是「dist 入仓＋rebuild-diff 守卫」的活样板。** Confidence：高（官方一手原文×3 直接读取）。
- 官方教程原文（docs.github.com，已读全文，页面要求 Node.js 24.x、runs.using: node24——当前最新版教程）：「Checking in your node_modules directory can cause problems. As…」[原文段此处截断——要旨：官方字面指令 commit dist/；ncc/rollup 单文件替代 node_modules]
- cardinalby 打包实践文列出 dist-in-repo 三大痛点方向：这些痛点正是本仓方案已用 rebuild-diff 守卫＋esbuild 确定性 bundle 逐一覆盖的——该文自己的解法也是「用 CI 检查产物是否漂移」，与本仓同向。
- **演进趋势**：Reddit r/github「we will move to esbuild」——ncc→esbuild 迁移是社区方向，本仓已在 esbuild 上，处于趋势前沿。未发现任何「GitHub 弃 dist-in-repo」信号；官方 2026 年教程仍用 node24+dist。
- **其他分发机制权衡**：npm provenance/SLSA 是「免构建安装」工业级替代——registry 分发＋Sigstore 签名；但前提=必须有 registry 发布渠道（云端 runner）；本仓 npm publish 已 deferred，provenance 是触发器事件（publish 激活）兑现时才可用的机制，现在不构成替代方案。actions/attest-build-provenance 同需 release 渠道，git-clone 型安装不适用。

### ② 决策复审触发器/立场批评治理——「decision stands until context changes」有成熟心智模型

**结论：ADR 经典治理正是本仓触发器模型的工业先例，「成本复述 vs 新实证」的区分判据在 Nygard 原文里有字面出处。** Confidence：高。
- Nygard 2011 原文（cognitect 原站抓取失败，AnySearch 摘录+多源转述交叉一致）：「This response may be OK, if the decision is still valid. It may not be good, however, if the context has changed and the decision should really be revisited」——复审的正当理由被精确限定为上下文变化，而非有人重新表达不满。「If a decision is reversed, we will keep the old one around, but mark it as superseded」——裁决可逆但不因批评自动可逆。
- techlead.education ADR Guide（R22-Q4 轮已读全文在案）：「If the context has changed, great — write a new ADR… If not, the decision stands」＋把「re-litigating settled decisions」列为 ADR 要防的首要病；同时要求定期复审 active ADRs 的 context 是否仍成立——维持裁决与常态化复审机制并存，正是本仓「触发器值守＋复审通道常开」的形态。
- derekleeds/guides（搜索摘要核验）：状态机 proposed/accepted/rejected/deprecated/superseded＋「Revisit when reality changes」——「reality changes」而非「opinion re-arrives」是复审触发词：成本已知的复述不改变 reality，只有新事实（体积越阈、渠道翻转、惯例反转）才算 context change。
- hidekazu-konishi ADR 实践文：「An ADR is an immutable record… When a decision changes, write a new ADR」——不变式是行业共识。
- 本仓内部对照：R22-Q4 已立的 dist-in-repo-superseded 触发器三事件锚（publish 激活/体积过阈/官方惯例反转）与候选 (b) 完全同构——本轮批评没有命中三个事件锚中的任何一个。

### ③ 产物体积量化治理——阈值惯例：「当前值＋25%」的 ratchet，且 229KB 远未到痛点区

**结论：业界体积值守的标准形制是 size-limit/bundlewatch 的「ratchet（棘轮）」——限值锚定当前实测值上浮 10-25%，增长须经有理由的 PR 显式抬限；「过阈」没有绝对数字，锚定的是「静默增长」而非增长本身。** Confidence：高（size-limit 官方 README＋BundleWatch 官方文档＋实践指南三方交叉）。
- size-limit 官方 README：「Add 25% to the current total size and use that as the limit」——官方示范的初始阈值=当前值×1.25；10kB 是「浏览器库」档位线，与 CLI 分发场景不可比。
- BundleWatch 官方配置：maxSize 默认 Infinity（必须显式设限），示例 100kb（gzip）——浏览器资产口径。
- ratchet 哲学：「the gate does not forbid growth, it forbids silent growth」；抬限须走有书面理由的 reviewed PR。对本仓启示：**「73% 消耗」在 ratchet 模型下不是违规信号**——ratchet 关心增速与静默性，绝对百分比消耗不是治理输入。
- 仓体积痛点实证锚：gitprotect.io（2026-06）指出 Git 仓膨胀真实痛点在 MB-GB 级大文件/归档/转储；本仓 229KB 即使翻倍仍是「噪音级」。Cardinalby 痛点列表无「dist 太大」，痛点全是同步纪律而非体积——与锐评「沉重技术十字架」修辞形成对照：工业痛点文献记录的是流程负担，本仓已用 CI 守卫把该负担转为自动化。
- 插件/agent 分发场景：未找到「agent plugin 市场对仓内产物体积」专门阈值文献；最近类比锚=GitHub javascript-action 生态大型 action 的 dist 普遍 1-10MB 级（ncc 全家桶常态），229KB 在该生态属轻量。

### ④ rebuild-diff 守卫成熟度——官方标准实践，非过度工程

**结论：「重建并比对产物」是 GitHub 官方 javascript-action 模板的自带标准 CI 步骤，也是可复现构建社区的成熟模式；其已知失败成本有官方缓解方案。** Confidence：高。
- 官方背书：actions/javascript-action 的 check-dist.yml（已读原文）=官方参考实现，含两个已知成本对症处理：① --ignore-space-at-eol 处理行尾误报；② 失败时 upload-artifact 把期望产物传上来让开发者一键修复。本仓守卫若要收紧可直接借鉴。
- 同型守卫生态扩散：softprops/action-gh-release issue#698（社区大型 action 自发要求 verify dist 守卫）；nickcharlton/diff-check（「运行命令后任何文件被改动即 FAIL」通用 Action，动机=Dependabot bump 忘提交 lockfile/生成物）——「生成物漂移守卫」是 GitHub 生态通用痛点解法非孤例。本仓那次「漏跑 bundle 判 FAIL」正是守卫在审计场景的正确拦截（防审计结论建立在陈旧产物上），是机制成功的实证。
- 可复现构建社区（reproducible-builds.org tools 页）：diffoscope/reprotest/rebuilderd 整条工具链都在做「重构建并比对」，Debian/Arch 包级验证基础设施级成熟实践；CLI bundle rebuild-diff 是其轻量特例。
- 已知权衡（诚实面）：误报源=构建非确定性（ncc 泄漏本地路径、时间戳、依赖解析漂移）；esbuild＋lockfile＋固定 Node 版本下单文件 bundle 确定性较高；官方守卫存在本身证明 GitHub 判定「误报成本<漂移成本」。

## 3) 对比矩阵：三候选处置

| 候选 | 治理合规性（D-063/D-075） | 外部证据支持 | 成本/风险 | 裁定 |
|---|---|---|---|---|
| (a) 维持不重裁＋登记 | ✅ 完全合规：零新实证不受理 revised；触发器吸收批评=R22-Q4 既有模型 | 官方惯例未反转（触发器事件③未发生）；Nygard「context 未变则 decision stands」 | 批评的历史命中率教训（D-072）要求不能纯丢弃——登记机制已覆盖 | **采纳为主体** |
| (b) 受理重裁 | ❌ 违反受理边界：行数增长≠越阈（73%<100%）、CI 打回=守卫成功非失败，均非「context change」 | 无任何一源支持提前拆仓/publish；publish 激活应由市场事件触发而非批评触发 | 重裁将打开「批评即可翻案」先例，腐蚀 D-075 边界 | 不采纳 |
| (c) 维持＋增量动作 | ⚠️ 条件合规：体积值守正式化是增强非修订 | size-limit ratchet 惯例（+25% 或 +10% 棘轮、抬限走书面 PR）；官方 check-dist.yml 减痛设计可直接借鉴 | 低成本：一个 stat 断言可挂 rebuild-diff 同链 | **采纳为增量**：立「制品体积治理」值守（ratchet 断言），并把官方守卫的 --ignore-space-at-eol＋失败上传产物两个减痛点纳入守卫注记 |

## 4) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Creating a JavaScript action — GitHub Docs | https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action | Official | 官方字面指令 commit dist/（Node 24.x 版） |
| 2 | actions/typescript-action 模板仓 | https://github.com/actions/typescript-action | Official | dist/ 随模板入仓；bundle 是必做步 |
| 3 | actions/javascript-action check-dist.yml | https://raw.githubusercontent.com/actions/javascript-action/main/.github/workflows/check-dist.yml | Official | rebuild-diff 守卫官方参考实现＋减痛设计 |
| 4 | cardinalby: JS Action packing and releasing | https://cardinalby.github.io/blog/post/github-actions/js-action-packing-and-releasing/ | Criticism+Comparative | dist-in-repo 三大痛点＋CI 产物漂移检查解法 |
| 5 | Nygard: Documenting Architecture Decisions | https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions | Official | 「context changed 才 revisit」原文（摘录级） |
| 6 | derekleeds/guides: architectural-decisions | https://github.com/derekleeds/guides | Official | 「Revisit when reality changes」；superseded 状态机 |
| 7 | ai/size-limit README | https://github.com/ai/size-limit | Official | +25% ratchet 阈值惯例 |
| 8 | BundleWatch 配置参考 | https://bundlewatch.io/reference/configuration | Official | maxSize 默认 Infinity |
| 9 | Bundle size budget 实践指南 | — | Comparative | 「forbids silent growth, not growth」；抬限走 reviewed PR |
| 10 | npm provenance 官方文档 | https://docs.npmjs.com/generating-provenance-statements/ | Official | provenance/SLSA 需 registry 渠道前提 |
| 11 | reproducible-builds.org/tools | https://reproducible-builds.org/tools/ | Official | 重构建比对=基础设施级成熟模式 |
| 12 | nickcharlton/diff-check | https://nickcharlton.net/posts/diff-check-github-action | Community | 「生成物漂移即 FAIL」通用化实践 |
| 13 | softprops/action-gh-release issue #698 | https://github.com/softprops/action-gh-release/issues/698 | Community | 大型 action 社区自发要求 check-dist 同型守卫 |
| 14 | Reddit r/github 实践帖 | https://www.reddit.com/r/github/comments/1lw7lv3/ | Community | ncc→esbuild 迁移趋势 |
| 15 | gitprotect.io: hidden cost of Git repo bloat | https://gitprotect.io/blog/hidden-cost-of-git-repository-bloat/ | Criticism+Currency | Git 仓体积真实痛点在 MB-GB 级 |
| 16 | hidekazu-konishi ADR templates & patterns | https://hidekazu-konishi.com/entry/architecture_decision_records_templates_a | Official | ADR 不可变＋supersede 共识 |

## 5) 信息缺口

1. Agent plugin 市场对仓内产物体积的专门阈值/痛点数据不存在公开文献——本仓 307.2KB 锚只有内部锚定依据，无外部基准可校准；建议在触发器注记里标注「锚为内部 ratchet 初始值，非工业基准」。
2. Tavily 引擎本轮配额耗尽，第三引擎交叉验证由 AnySearch+web_search（Exa）双引擎完成。
3. cognitect 原站与 derekleeds blob 页抓取失败，Nygard 关键段落属摘录级证据非全文级。
4. 「esbuild 产物在不同 Node 版本下的字节确定性」无直接实证数据——守卫实际误报率需以自身 CI 历史统计为准。

**给收口注记的一句话建议**：本批评按 D-075 不受理重裁；外部证据显示 GitHub 官方（node24 教程、typescript-action 模板、check-dist.yml）至今仍是 dist-in-repo＋rebuild-diff 的标准实践，「惯例反转」触发器事件③确认未发生；体积实测 229,002B/307,200B（73%）与「CI 打回=守卫按设计拦截」两数据入注记；增量动作：体积值守按 size-limit ratchet 惯例正式化（棘轮断言挂 rebuild-diff 同链），并借鉴官方守卫的 --ignore-space-at-eol＋失败上传产物减痛设计。