# R23-Q5 atomcode 深调研——映射表落点：docs/ 独立文档 vs 并入 quadrant-rubric

**调研日期**：2026-09-19｜**题面**：reports/R23-Q5-research-prompt.md｜**置信度**：高（Sufficiency Gate：searches 9 Exa5/Tavily3/AnySearch1／五角度全覆／5 篇外部全文原文读：Anthropic best-practices、Fern、Diátaxis、Skill-Inject arXiv 2602.20156、K8s api-conventions＋本地一手 6 件：ledger D-078/D-080/D-081/D-082/D-012/D-053 原文、map 全文、rubric 全文、SKILL.md、CONTEXT 词条、代码指针）

---

## 1) 执行摘要

**推荐 (a)：保持 docs/ 独立＋双向指针终裁，置信高。** 三条决定性本地一手事实：
① **D-078② 原文已裁**「映射表=文档面非代码：新建 docs/upstream-dimension-map.md……裁决面消费按表归位」——落点 docs/ 是已采纳的裁决本体，(b)(c) 均构成改向须走勘误且无新实证支撑；
② 消费者=kernel 接线票＋NN-check 守卫，**确定性面消费确定性契约**，按 D-058 总则契约必须放 kernel 可达面（仓内 docs/），不能放宿主 agent 概率性消费的 skill 壳；
③ (b) 使层③ references 变裁决输入面，冲撞层①/层③ 分层（D-012③ skill 壳只读隔离＋D-053 band 红线）——Skill-Inject（arXiv 2602.20156）实证 skill 壳内文件是污染/注入高发面（frontier 模型最高 80% 攻击成功率），接线准入口径进概率消费面=band 渗漏通道扩宽。

## 2) 逐候选裁定

| 候选 | 裁定 | 依据/致命伤 |
|---|---|---|
| **(a) 保持 docs/ 独立＋双向指针** | ✅ **采纳** | D-078② 既裁；D-058 确定性消费面归属；Diátaxis reference vs guide 分型；K8s api-conventions（契约）与 kubectl docs（消费面）分置；Fern 契约/概念分层混合架构。**已知失败模式=指针须分发感知**：docs/ 不随 tgz 分发，rubric 侧路径指针在安装态必悬空 |
| (b) 并入 rubric references 新段 | ❌ 拒 | **三边界破全数成立**：层③变裁决输入面（接线准入口径进概率面）；agent 加载接线判据（叙事面接触 S4/S5 归位+准入=band 渗漏邻接面——叙事 agent 加载文件即接触「bot 身份在 S4 排除、S5 计入」等准入口径，自行归位维度的诱惑违反 band 红线精神）；kernel 依赖壳内文件（接线票/CI 语境下 skill 壳资源不可保证可达） |
| (c) 移入 references/ 独立文件 | ❌ 拒 | kernel 依赖 agent 资源目录方向反；**分发面错位**——npm pack 实物 tgz 含 skills/ 4 件不含 docs/：契约进分发物=「CI/kernel 回归读不到契约本体」或「仓面/分发面双版本」两难（D-078② 选 docs/ 时已隐含排除） |
| (d) 拆两份双写 | ❌ 拒 | 双写双漂（Fern 手工同步 4-6h/发布、漂移信任税）；D-037 单源纪律反向 |
| (e) 他径（spec.md 并入） | ❌ 不采 | spec=判据本体（D-004 封口）、map=fact→维接线投影语义异层；并入=本体与投影合并同 (b) 之病 |

## 3) 工业先例（全部已读原文）

| 先例 | 分置结构 | 对应 | URL |
|---|---|---|---|
| K8s API conventions vs kubectl | api-conventions.md（API 结构契约，面向扩展开发者）与 kubectl-conventions＋k8s.io 用户文档（消费面）分 repo 分目录；api-review-process 明言「Separate and keep separate the process and the API conventions parts of all our docs」 | map（契约）vs rubric（消费叙事辅助）分置 | github.com/kubernetes/community contributors/devel/sig-architecture/api-conventions.md |
| OpenAPI spec vs consumer guides（Fern） | spec 放 openapi/（SSOT）、概念 guide 手写放 docs/，「Both integrate into a single documentation site, but each follows its appropriate workflow」——**分置不分离靠指针统一呈现**；spec 由工程师持有 guide 由技术作者持有「Neither group blocks the other」 | 契约/概念分层＋谁消费谁持有 | buildwithfern.com/post/generated-vs-manual-documentation-which-approach |
| Diátaxis 四型 | reference=「facts…free of distraction and interpretation」与 how-to/explanation 分型；「Crossing or blurring the boundaries…is at the heart of a vast number of problems in documentation」 | map=reference 型／rubric=叙事组织 guide 型；混型=文档病根 | diataxis.fr/start-here |
| Anthropic skills 官方 best-practices | references/ 内容边界：「Claude reads additional files only as needed」＋加载须 SKILL.md 显式指令；references=当前任务辅助材料非跨层契约；跨层引用会产生不完整读取（head -100 preview） | 壳内只放叙事辅助三件（D-053② 票面既裁），不放 kernel 契约 | platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| Skill-Inject（arXiv 2602.20156） | skill 文件=frontier 模型最高 80% 攻击成功率消费面，壳内文件内容对 agent 行为强塑形 | 裁决邻接语义进概率面非中性动作 | arxiv.org/abs/2602.20156 |

## 4) 落地形态（双向指针措辞草案）

### 3.1 map 头部（docs/ 侧——① 定位与边界节追加一行）

> - **职责边界（本表 vs quadrant-rubric）**：本表=kernel 接线契约（接线票 COLLECTOR_DESCRIPTORS 注册＋Macro-B 归位＋NN-check 守卫的确定性判据源），**不供宿主 agent 叙事消费、不随 tgz 分发**；叙事证据组织口径见 engine/skills/macro-audit/references/quadrant-rubric.md（D-053）。两文件各持一职、互不并写（D-078 追问留票「落点 vs 并面」本行终裁销项）。

### 3.2 rubric 侧（头部引言区追加原则行，不带跨包路径）

> - **fact→维度归位**：维度归位的接线契约不在本文件（归 kernel 裁决面）。叙事段只按既有 facts 组织证据，**不得引用准入条件或自行归位维度**——归位是 kernel/接线票的确定性动作，不是叙事判断。

**为什么 rubric 侧不给路径指针**：tgz 分发实物（npm pack 73 文件清单）不含 docs/——安装态宿主 agent 按路径找必然落空；Anthropic 官方警告跨层引用产生不完整读取。原则行传达红线语义即可，路径指针只存在于双方都在场的仓内面（map 头部＋descriptor 注释＋账本）。

### 3.3 指针拓扑总结

```
docs/upstream-dimension-map.md ──(路径指针)──> engine/skills/.../quadrant-rubric.md   [仓内面，双向可见]
engine/skills/.../quadrant-rubric.md ──(原则行，无路径)──✕                                  [分发面，单向红线]
src/upstream/codelore.ts:17 / github-rest.ts:35 ──(路径指针)──> docs/upstream-dimension-map.md  [代码→契约，D-078② 既裁]
```

## 5) 失败模式（落地后仍需值守四点）

| # | 失败模式 | 防御 |
|---|---|---|
| F1 | **悬空指针**：后续会话好心在 rubric/SKILL.md 补 docs/ 路径指针，安装态断裂 | map 头部边界行写死「不随 tgz 分发」显式句；**NN-check 可加断言：skill 包内文件不得引用 docs/ 路径** |
| F2 | **并面复潮**：未来某轮以「方便叙事」为由重提并入 | 入账本后按 D-076③「decision stands until context changes」纪律——重裁须立场批评＋实证＋工业先例交叉三要素（D-075④ 受理边界） |
| F3 | **rubric 原则行被读成新判据**：措辞若含「准入了/排除了」具体内容即越界 | 原则行**零具体口径**（只说「不在本文件/不得引用」，不复述任何准入条件） |
| F4 | **map 演化时 rubric 不同步的语义漂移**：map 新增准入纪律（如 D-082③ 快照/趋势判据）而叙事 agent 仍按旧直觉组织证据 | 可接受且**有意**：叙事本不消费准入面无同步义务；漂移风险仅在 kernel 消费侧，由接线票 golden＋NN-check 覆盖 |

## 6) 冲突核查（逐条 D-xxx/ADR）

| 对象 | (a) 关系 | 判定 |
|---|---|---|
| D-078②（映射表=文档面新建 docs/） | 直接履行落点原文一致 | ✅ 零冲突，(b)(c) 反而是静默改向 |
| D-078⑤（追问留票「落点 vs 并面」） | 本裁即销项动作 | ✅ 留票行随本裁销账本留痕 |
| D-080①（定稿六项归决策面） | 本裁属「并面」项决策面处理 | ✅ 程序合规 |
| D-053（rubric 三件/加载条件/band 红线） | rubric 职责面不动仅加零口径原则行；(b) 会加新职责=越 #50 票面 | ✅ 零冲突 |
| D-058（Kernel/Agent 边界总则） | 接线判据=确定性面归 kernel | ✅ 零冲突且是总则直接应用 |
| D-012③（skill 壳只读隔离） | 不扩壳内职责面；Skill-Inject 实证支持收窄 | ✅ 零冲突 |
| D-004/ADR-0004（S1-S5 spec 封口） | map 不新增判据语义；rubric 原则行亦不新增 | ✅ 零冲突 |
| ADR-0013/D-026（band 归 C 层） | (a) 不给叙事面新增判据接触面；(b) 反向扩面 | ✅ 零冲突，(b) 违 |
| ADR-0014（适配层禁业务语义） | descriptor 留白＋指针现状不动 | ✅ 零冲突 |
| ADR-0008/D-012（五层盒分发） | skills/references=层③壳随 tgz；docs/=仓面文书不随 tgz——(a) 维持现状拓扑 | ✅ 零冲突 |
| D-037③（防漂移族） | 单源不双写 | ✅ 零冲突 |
| D-081/D-082（行级定稿态先例） | 文件级落点不动行级 pending/终裁状态 | ✅ 零冲突 |

**结论：(a) 全 current 零冲突零 revised；(b)(c) 各 2-3 条正面冲突且无新实证支撑受理（D-075④ 边界）。**

## 7) 信息缺口

1. NN-check 守卫现物未逐字读（知识库有断言语义描述非原文）——「skill 包内文件不得引用 docs/ 路径」新断言立案时须核现物形制；
2. Skill-Inject 论文的 frontier 模型覆盖率数字来自摘要/二手转述未读正文方法节；
3. Fern 手工同步成本数字（4-6h/发布）来自其博客自陈非第三方审计。

## 8) 建议追问（grill 现场三问）

1. **rubric 侧指针形态**：原则行（默认，无路径防悬空）vs 零指针（更极简但丢失红线提醒）；
2. **map 头部边界注记**：是否写死「不随 tgz 分发、非宿主 agent 消费面」显式句（默认写死防 F1 复潮）；
3. **留票销项措辞**：D-078⑤「落点 vs 并面」行销项走勘误注记（引本裁 D 号）还是随轮次收口对账即销（默认后者，本裁入账本即留痕）。
