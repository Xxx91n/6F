# R22-Q4 atomcode 调研题面——锐评残余四奇观处置（立场性批评对已决已实装决策的复审受理面）

## 问题

外部锐评（.code-tmp/锐评.md）对本仓 R14~R21 工程面发起六项批评，其中两项已在本轮 grill 处置（自愈=D-075 revised 落地；XFAIL cap 官僚=D-073 sealed 分拣）。残余四项全部命中**已决已实装已审计**的 current 决策，且批评性质为立场性/审美性非新实证：

1. **git-ISO 严正则**（D-059①→#54 闭环）：engine/src/intake/intake.ts normalizeGitIsoDate 用 GIT_ISO_STRICT_RE 把 git %cI 的 +00:00 强制规范为 Z，违形抛 GITCLI-OUTPUT-CONTRACT＋11 断言契约测试。锐评：「该改用 epoch/语义对比拥抱不确定性，而非用胶带贴住外部世界的嘴」。对价：契约使命=golden 资产逐字节确定性（防腐边界契约校验），语义对比会把不确定性搬进 golden 比对内部；fail-closed 是 D-068 本意行为。
2. **SQL 四重正则 stripSqlLiterals**（#55 闭环）：schema.ts 用四重正则剥字面量后跑关键字黑名单，注释载明 OWASP 分级「字符串黑名单在非注入面合法」。锐评：「宁写 4 个正则模拟词法也绝不引入正规解析器，刀尖跳舞」。对价：作用面=应用侧只追加门面的启发式守卫非安全边界。
3. **词表专家系统**（D-069→#61 闭环）：citation.ts 七张中英文词表＋滑动窗口＋词表即判据治理＋2692 行评测集。锐评：「为保确定性内核纯洁性手搓上世纪专家系统」。对价：D-069 是确定性 Kernel 原则排除法产物（NLI 概率模型入 Kernel 违 Kernel/Agent 边界＋破审计可复现性=产品本体价值）。
4. **dist 入库**（D-067→#59 闭环）：esbuild 3707 行 bundle 随源进仓，javascript-action 官方先例。锐评：「制品库化巨型混合怪」。对价：git-clone 型分发无构建步→可运行体随源进仓；npm publish deferred（D-038）；锐评未给替代方案。

问题：立场性批评对已决已实装决策，该受理重裁、全数维持挂触发器、还是不受理？复审触发器的可证伪条件该怎么写才不沦为永久挂账？

## 候选

(a) 全数受理逐条重裁（四题各开调研）；
(b) 全数维持＋事件绑定复审触发器（各挂可证伪复审条件：git-ISO=实测契约外新格式／SQL=作用面实证逃逸案例／cue 表=第二消费者或 held-out 系统性误判（cue-table-extraction-trigger 已在可复用/扩义）／dist=npm publish 激活或 pack 体积过阈）；
(c) 挑最强项部分受理；
(d) 不受理不登记。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-075，重点 **D-075 revised 先例**（立场批评+实证→部分修订的受理边界）／D-059①⑤ 九项处置表／D-067 自包含分发／D-069 词表治理／D-063 有实证即裁决／D-068 fail-closed／D-038 npm deferred）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0014 适配器腐蚀边界／0015 量测效度先行／0019 SWMR）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Kernel/Agent 职责边界／Trigger-gated Closure／Dual Reporting）；
4. 实物：engine\src\intake\intake.ts:86-92（GIT_ISO_STRICT_RE）＋engine\src\fact\schema.ts:65-74（stripSqlLiterals）＋engine\src\report\citation.ts（词表）＋engine\scripts\build-bundle.mjs＋.scratch\architecture-recovery\reports\33-gate-registry.json（既有触发器形制）；
5. **工业界成熟心智模型（重点）**：已决决策的复审受理纪律（ADR review/supersede 触发条件——MADR/Nygard ADR 的 status 演化模型；「decision fatigue vs revisiting」文献）、contract testing 边界校验模式（fail-fast at boundary vs semantic tolerance——Postel 法则在现代 API 治理的争议面）、lint/heuristic 工具对 parser-grade 精度的比例原则（OWASP 分级思想＋semgrep 官方对正则 vs AST 的适用面声明）、确定性系统 vs 概率组件的边界划分（deterministic core + probabilistic edge 模式）、build artifact 入仓的工业化先例与边界（javascript-action dist 惯例/vendored releases/deploy branches 的正当性边界）、「review trigger/expiration-based revisit」机制（ADR 的 revisit criteria、sunset clauses、pre-mortem trigger conditions 写法）；
6. 给出推荐与理由＋失败模式＋落地形态（复审触发器的 registry 条目形制：事件定义/判定者/过期兜底——参照本仓 33-gate-registry.json 五要素）；
7. 显式核查与本仓 current 决策的冲突面（特别：(b) 的触发器会不会变成「永不触发的安慰剂」——工业界对复审条件可证伪性/可判定性的写法要求；四决策各自维持的答辩要点是否经得起「立场批评也有真颗粒」的检验）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计（四枚触发器的具体事件定义与判定口径）；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
