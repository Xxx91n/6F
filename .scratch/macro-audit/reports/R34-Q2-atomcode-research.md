# R34-Q2 atomcode 调研存档 —— 文档法典门槛处置（贡献者阅读地图裁）

调研时间：2026-09-25（本轮 atomcode 批次）｜题面：R34-Q2-research-prompt.md｜resume 句柄：60e061dd-e298-4201-b69c-98db2facab30
引擎面：web_search×3 + anysearch batch×3 + ctx_search 召回（Tavily 限额）；full reads 6；置信：高。

## 1) 执行摘要（Tl;dr）

**推荐 (b)**——在 CONTRIBUTING.md 追加 ~15-20 行「必读三件 + 可忽略面 + 读法顺序」最小阅读地图，是三候选中唯一同时满足「消解幸存者偏差论证」与「不违账本 current 决策」的选项。(a) 维持现状的论据（事件触发器只能观测到达者、消费面驱动资产纪律）有辩证力，但混淆了「重资产预建」与「轻指针补全」两类动作——(b) 属后者。(c) 违反 D-130/D-138 已立的消费面驱动与触发器封口纪律，明确排除。

## 2) 分点结论

**结论一：工业界惯例高度收敛于「curated entry points」——小导览层是标配非重资产。**
- Linux kernel 文档自承认「几千个孤立文档如一堆散沙」，解法=按读者群组织成书＋一份 doc-guide/contributing.html 指针页（docs.kernel.org，Official）——「不删存量、不加副本、加地图」，正是 (b) 的形态。
- rustc-dev-guide 工作组成立动机（2019 Inside Rust）=「降低编译器贡献门槛」——用学习路径导览而非压缩 ADR/RFC 存量（与 D-130 调研中 Rust libs-team「控增量准入不压缩存量」同源互证）。
- Kubernetes contributor guide 分层：README（是什么）→ contributor guide（怎么进）→ 深度文档（按需读），三层分工。

**结论二：FLOSS 贡献者漏斗实证支持「沉默未达者真实存在且占多数」。**
- McQuaid（Homebrew 维护者，funnel 文，已全文核读）：漏斗每级 hefty drop-off，用户→贡献者→维护者逐级衰减；核心建议=reduce friction at each stage＋文档化 PR 流程。opensource.guide/building-community（已全文核读）引用同一漏斗模型，并引 GitHub 2017 调查：**不完整或令人困惑的文档是开源用户最大痛点**。两源独立互证。
- arXiv:2502.18440（CHASE 2025，已核读）：4226 个 Debian 项目实证——CONTRIBUTING 文件通常在贡献涌入之后才出现；早期项目倾向简短。反向读法：6F 处在「贡献涌入之前」窗口，31 行简短 CONTRIBUTING 符合工业界常态非欠账——但 (b) 的 ~15-20 行增量仍在常态带宽内，不构成过度预建。
- arXiv:2407.04159（IEEE TSE 2025）：新手首 patch 接受率与任务选取/文档起点强相关；清晰起点文档降低进入摩擦是正向结论。

**结论三：幸存者偏差论证在方法论上成立，但不指向 (a) 而指向 (b)。**
- `82-first-external-contributor` 是 event_bound 触发器，只能计数到达者，被门槛劝退者零观测——辩证面正确。
- 但 (a) 的推论「所以不预建」偷换概念：账本的消费面驱动纪律（D-138 负向）禁止的是**重资产**（CI 矩阵腿、独立导览维护面）；一份 15-20 行指针段维护成本≈0（指向已存在的 AGENTS/adr/CONTEXT 只加读法顺序），是给未来第一个到达者的低成本路标，不改变触发器观测义务。
- 锐评者本人（高动机读者）淹了=比「假设性沉默者」更强的实证信号——第一个真实到达者大概率同样淹。

**结论四：(c) 违反现行立法，排除。**
- docs/THE-MAP.md 系统导览层=新建独立维护面→与 CONTEXT「消费面驱动资产」Avoid 条款直接冲突（为已声明 preview/单维护者/零外部贡献者的消费面预置第二导览资产）；
- 与 Trigger-gated Closure 词条冲突（无触发事件时前置铺开）；
- D-130 已定性锐评「三分实七分虚」（23 份 ADR 非 78，计数失实）——为虚部立独立系统导览层属过度整改。

## 3) 与账本 current 决策的冲突点（显式）

| 决策 | 与推荐 (b) 的关系 |
|---|---|
| **D-130**（#82 批① gen-adr-index 生成式索引＋82-first-external-contributor 触发器） | **部分重叠，非冲突，但有一处需呈报**：D-130 批①已立法「README ADR 指针生成化」。(b) 若在 CONTRIBUTING 手写 ADR 读法顺序=双源指针违副本纪律。解法：补段不放 ADR 逐条列表（归 gen-adr-index），只放「必读三件指针＋可忽略面声明（.scratch/=过程档案非必读）＋指回 README 的 ADR 索引」——纯指针非副本，合 Ground rules 文法。采纳须 D-130 行挂 scoped 注记。 |
| **D-138**（禁预建 CI 矩阵腿=为不存在消费面预置资产） | **判据引用冲突风险**：(a) 方会将 D-138 外推到任何文档增量。但 D-138 判据原文=「真用户痛点驱动才划算」（zoekt #1034）——本案恰有真痛点实证（锐评者实测被淹），判据不成立非冲突。 |
| **D-139**（轻规约文法：一行规约不立票不设守卫） | **正向支持**：(b) 的 15-20 行指针段正是 D-139 同款轻量文法。 |
| **Trigger-gated Closure／Known-gaps 词条** | 触发器封口纪律不禁止给已到达者减摩擦，只禁止前置铺开/无限拖延；(b) 不动触发器不设新门禁，兼容。D-138②「不可证伪面如实登记」文法可平移——补一句诚实声明（preview/单维护者/响应延迟），对齐 opensource.guide 建议。 |

## 4) 三候选对比矩阵

| 候选 | 消解锐评实证 | 与消费面驱动纪律相容 | 维护成本 | 漏斗摩擦削减 | 裁定 |
|---|---|---|---|---|---|
| (a) 维持事件绑定 | ❌ 不作为——沉默未达者仍零观测 | ✔ | 零 | 零 | 否——锐评者被淹是真实痛点，D-138「真用户痛点驱动」判据实际已触发 |
| (b) 最小阅读地图 | ✔ | ✔ 纯指针非副本、轻规约文法 | ≈0 | 直接降低首读摩擦 | **推荐** |
| (c) THE-MAP.md | ✔✔ | ❌ 前置铺开违 Trigger-gated Closure＋预置第二资产 | 新增独立维护面 | 过度 | 排除 |

## 5) 信息缺口

- Tavily 引擎限额未产出（connect timeout＋plan limit），第三引擎降级为 AnySearch＋Exa 双引擎；关键结论均有 ≥2 独立信源，未受实质影响。
- 「第一响应延迟→留存」Mozilla 量化研究仅有 opensource.guide 二手引用（48h 阈值），原始研究未直接核读；不影响推荐方向。
- .scratch/ 在 README 文书地图表中的现有定位未逐字复核——(b) 落地时需先读 README 对应节避免与 gen-adr-index 产出重复。

## 6) 来源清单（节选）

- docs.kernel.org/doc-guide/contributing.html（Official：kernel 文档散沙→按读者群成书＋指针页）
- mikemcquaid.com contributor funnel（已全文核读：漏斗 hefty drop-off＋reduce friction）
- opensource.guide/building-community（已全文核读：漏斗模型＋GitHub 2017 调查「不完整/困惑文档=最大痛点」）
- arXiv:2502.18440（CHASE 2025：4226 Debian 项目 CONTRIBUTING 实证）
- arXiv:2407.04159（IEEE TSE 2025：新手首 patch 接受率与文档起点强相关）
- Inside Rust 2019（rustc-dev-guide 工作组动机=降低编译器贡献门槛）
- Kubernetes contributor guide（三层分工惯例）
