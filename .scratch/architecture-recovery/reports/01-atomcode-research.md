# 01 atomcode 深度调研原始输出（WORKFLOW 4.2.3）

> carrier: `atomcode --prompt-file reports/01-research-prompt.md --output-format text`
> 采集时间: 2026-09-12
> 说明: 本文件为 atomcode 无头模式 stdout 原样落盘（UTF-8），供 trace；结论摘录见 01-report.md。

---

[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我将按 atomcode-research 深度调研流程执行（该技能内容已随请求内联注入，直接沿用其配额与工具纪律）。先建任务清单，并做知识库召回 + 首轮三引擎搜索。

知识库无相关命中（仅 auto-memory 通用条目），转入联网调研。更新任务状态，并批量抓取 Q1 官方一手信源 + 启动 Q2 学术搜索。

继续 Q1：批量抓取本地小模型官方 model card（参数量/维度/许可证）+ API 模型官方文档（Cohere/Voyage/Google）。

补 Q1 最后一组核验：OpenAI 官方文档（.md 版）、Google text-embedding、multilingual-e5-small 与 bge-small 参数规格（三引擎交叉）。

Q1 信息已齐（官方文档 + 多源交叉完成）。切换任务到 Q2，同时启动 Q3 主信源抓取与 bge-m3 参数核验。

Q2 材料已齐（reflexion model + DocChecker + traceability + drift 多源）。转入 Q3/Q4：抓取阈值校准与混合检索主信源，并补 BEIR、Fellegi-Sunter 理论源。



Q3/Q4 主体材料已齐。最后一批：抓取 BEIR / DocChecker / Reflexion / README 维护论文原文核验，并补分位数法与 EMA 基线的补充搜索。



# 深度调研报告：S1「定位收敛」语义对齐度量 —— embedding 选型 / 阈值校准 / fallback

**Sufficiency Gate 自查**：searches: 17（web_search ×8、Tavily ×5、AnySearch ×4，三引擎交叉）| angles: Official / Comparative / Criticism / Currency / Community 五类全覆盖 | full reads: 16 次 web_fetch 原文核验（官方文档 8 + 论文/学术 5 + 厂商/工具 3）| gaps: bge-m3 官方参数量未一手核验、API 延迟多为第三方数据、voyage-3 价格跨源冲突、LinkedIn 帖未能直读原文（用 arxiv 论文佐证）。

---

## 执行摘要（Tl;dr）

**Confidence：中—高。** 高置信部分：各模型规格（维度/参数量/许可证/语言覆盖）均来自官方 model card / 官方文档并多源交叉；低置信部分：具体 MTEB 子任务分数随排行榜版本（MTEB v1/v2）波动，API 价格存在跨源冲突，落地阈值必须按你的语料自建校准集，任何外部推荐值都只是起点。

**三个直接回答**：
1. **选型**：中英混合短文本对齐场景，首选 **BAAI/bge-m3**（本地 ONNX、1024 维、MIT、100+ 语言含中英、dense+sparse+colbert 三合一——其内置词法稀疏输出可直接充当 BM25 fallback，一个模型解决两件事）；API 路径首选 **text-embedding-3-small**（官方 MTEB 62.3、$0.02/1M，性价比之王），多语质量优先用 **Cohere embed-multilingual-v3.0**（官方语言清单 100+ 含中文）。被放弃者均有明确理由（详见 §1）。
2. **心智模型**：工业界无"意图 vs 实现"的直接同构产品，但有 4 类成熟方法可拼接：**Reflexion Model**（声明模型 vs 源码模型一致性矩阵，1995 年奠基）、**doc-code 一致性检测**（DocChecker 等，代码-注释配对二分类）、**需求-代码可追踪性 TLR**（IR/embedding 链接恢复）、**架构漂移/侵蚀检测**；组织形式上的 mission drift / scope creep 只有概念无量化公式——**你的产品恰好填补空白**。
3. **阈值**：**0.70 初版合法但必须"锚定"使用**——绝对余弦值不可跨模型/跨语料解释（anisotropy 已是学术共识），建议 0.70 作为"疑似不齐"触发值，配合 Fellegi-Sunter 式双阈值灰区 + EMA 滚动基线校准，而非一刀切硬阈值。

---

## 一、embedding 模型选型（对比矩阵）

### 1.1 结论先行

- **本地小模型推荐（主）**：`BAAI/bge-m3` —— 唯一同时满足【中文+英文】【本地离线】【内置词法 fallback】三要求的小体积模型。[来源 1, 2, 5]
- **本地小模型推荐（次，纯英文）**：`BAAI/bge-small-en-v1.5`（MTEB 62.17、STS 81.59）或 `thenlper/gte-small`（STS 82.07，小模型中 STS 最高）——两者均为 33.4M 参数、MIT、384 维、512 token。[来源 3, 4]
- **API 推荐**：`text-embedding-3-small`（$0.02/1M、1536 维、官方 MTEB 62.3）成本/质量最优；多语质量优先 `Cohere embed-multilingual-v3.0`（1024 维、官方 100+ 语言清单含中文、512 ctx）；极致质量 `text-embedding-3-large`（64.6）或 `voyage-3`（多语检索强）。[来源 6, 7, 8, 9]
- **不建议**：`all-MiniLM-L6-v2`（256 token 截断 + 分数低 5-6 分，只配当冒烟基线）；`multilingual-e5-small`（强制 `query:`/`passage:` 前缀，对称任务也要求前缀，操作易错且向量空间被前缀污染）；Google `text-embedding-004/005`（官方文档明确其已被 `gemini-embedding-001` 统一，版本指针不稳定）。[来源 10, 11, 12, 13]

### 1.2 对比矩阵

| 模型 | 维度 | 参数量 | 许可证 | 部署形态 | 成本 /1M tokens | MTEB 平均 | STS (10) | 聚类 | 中文/多语 | 离线 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| all-MiniLM-L6-v2 | 384 | 22.7M | Apache-2.0 | 本地 ONNX/PyTorch | $0（自托管） | 56.26 | 78.9 | 42.35 | 仅英文 | ✅ | 256 token 截断；1.17B 训练对 [1,10] |
| bge-small-en-v1.5 | 384 | 33.4M | MIT | 本地 ONNX | $0 | 62.17 | 81.59 | 43.82 | 仅英文 | ✅ | v1.5 修复相似度分布问题（对阈值友好）[3] |
| gte-small | 384 | 33.4M | MIT | 本地 ONNX | $0 | 61.36 | **82.07** | **44.89** | 仅英文（官方声明） | ✅ | 小模型中 STS 最高 [4] |
| multilingual-e5-small | 384 | 118M | MIT | 本地 ONNX | $0 | ~59.9（e5-small-v2） | ~80.4 | 39.9 | 94 种 | ✅ | **必须加 query:/passage: 前缀**，对称任务也要求 [11,12] |
| **bge-m3** | 1024 | ~0.6B（单一来源，见缺口） | MIT | 本地 ONNX | $0 | 63.0–63.2 | — | — | **100+（含中英）** | ✅ | 8192 ctx；dense+sparse+colbert 三合一 [2,5,14] |
| text-embedding-3-small | 1536 | — | 专有 | API | **$0.02** | 62.3（官方自报） | — | — | 多语（无官方清单） | ❌ | Matryoshka 可截维 [6,8,9,14] |
| text-embedding-3-large | 3072 | — | 专有 | API | $0.13 | 64.6 | — | — | 多语 | ❌ | 截到 256 维仍优于 ada-002 [6,8,14] |
| Cohere embed-multilingual-v3.0 | 1024 | — | 专有 | API | $0.10（第三方） | ~64.5 | — | — | **100+，官方清单含 zh** | ❌ | 512 ctx；支持 cos/dot/euclidean [7,9] |
| Voyage-3 | 1024 | — | 专有 | API | $0.06~$0.12（**跨源冲突**） | 63.8 | — | — | 多语 | ❌ | 32k ctx；2026-01 已被 voyage-4 系取代 [8,13,15] |
| Google text-embedding-004/005 | 768 | — | 专有 | API | $0.025（免费层） | ~63–68（版本/来源不一） | — | — | 005 仅英文+代码；多语走 multilingual-002 | ❌ | **官方建议迁移 gemini-embedding-001（3072 维）** [13,16,17] |

> 注：STS/聚类列只对本地小模型有可直接引用的子任务分数（来自 gte-small 与 bge-small 官方卡片的 MTEB 表 [3,4]）；API 模型未给子任务拆分（单一来源缺口，勿外推）。

### 1.3 关键判据与证据

1. **"短文本语义对齐"是 STS/成对分类类任务，不是 retrieval**——MTEB 原始论文的核心发现是 *"没有任何单一模型统治所有任务；面向 STS 的模型在 retrieval 上表现差，反之亦然"*（STS 与 retrieval 是"对称/非对称"两类几何）[18]。你的"意图声明 vs 交付物"比对是**对称成对相似度**，因此应看重 STS/成对分类分数而非 retrieval 分数——这直接否定了"无脑上大 retrieval 模型"的路线。
2. **bge-m3 的双重适配**：BAAI 官方卡片确认 M3 = Multi-linguality（100+ 语言）、Multi-granularity（8192 token）、Multi-functionality（dense + **lexical(sparse)** + colbert 统一）[2]。sparse 输出即 BM25 式词法分数——**同一模型同一索引内天然具备 embedding→词法 fallback 能力**，与 §4 的 fallback 设计直接呼应。
3. **e5 系的前缀陷阱**：官方 FAQ 白纸黑字 *"Do I need to add the prefix? Yes, this is how the model is trained, otherwise you will see a performance degradation"*，且对称任务也要 `query:` 前缀 [11,12]。对"README 一句话 vs commit message"这种等长对称短文本，前缀会系统性抬高/改变分数分布，校准成本高，**放弃**。
4. **all-MiniLM 的截断问题**：官方卡片 "input text longer than **256 word pieces** is truncated" [10]。仓库意图声明常超 256 词片，截断即丢语义，且 56.26 的 MTEB 平均显著低于 bge/gte 同级模型 [4]。
5. **Google 004/005 的不稳定性**：Vertex 官方文档列表只有 `gemini-embedding-001`（3072 维，统一了 005 与 multilingual-002）作为现行模型，且明确警告 *"Specifying a model without a version number isn't recommended, as it is merely a legacy pointer"* [16]。版本指针模型不适合做跨期稳定的审计度量。
6. **确定性/离线**：本地模型权重固定、ONNX 可量化部署、结果可复现；API 模型按名稳定但供应商可静默更新（Voyage 维护了一整张 deprecated 表 [15]）。对"审计产品"，可复现性本身是硬需求——这也是 §4 触发条件的重要输入。

---

## 二、『意图 vs 实现漂移』度量心智模型（4+2 个成熟方案）

### 2.1 结论先行

没有任何公开方法直接度量"README 定位 vs commit 交付"这种**仓库级意图对齐**；但存在 4 个可拼接的成熟范式和 2 个概念类比。共性度量公式形态高度一致：**对齐度 = f(相似度(声明载体, 实现载体)) + 阈值判定**，这正是你 S1 要做的事；所有方法的已知局限（词汇鸿沟、粒度不匹配、阈值跨域不迁移）也都将成为你校准时的已知坑。

### 2.2 方法清单

**① Reflexion Model（软件反射模型）——声明 vs 实现的奠基范式**
- 出处：Murphy, Notkin & Sullivan，FSE 1995 / IEEE TSE 2001（doi:10.1109/32.917525）[19,20]。
- 判据：工程师定义"高层模型"（声明架构）与"源码模型"，工具计算两者一致性矩阵，输出 **convergence（一致）/ divergence（不一致）/ absence（缺失）** 三类弧；应用于 NetBSD（25 万行 C）与 Microsoft Excel 再工程。
- 度量公式：无单一数值，是**结构性差异集合**；形式化刻画在论文中。
- 局限：结构级（模块/依赖图）比对，需人工定义映射；不做语义级文本对齐——但它给了你"声明-实现不一致"的**三分类心智模型**（你的 S1 对齐度可以照搬"一致/漂移/缺失"三分）。

**② 文档-代码一致性检测（doc-code consistency）——最贴近你度量对象的成熟方法**
- DocChecker（EACL 2024 System Demo，Dau/Guo/Bui）[21]：LM 框架检测"代码-注释不一致"（ICCD 任务 72.3% accuracy，超 GPT-3.5/CodeLlama），判据=代码段与注释是否描述同一概念（二分类 + 生成修复建议）；局限：粒度是函数/docstring，不覆盖 README/PR/CHANGELOG 级意图，且依赖启发式规则的旧方法效果差。
- 社区工具 code-bert（CodistAI 开源）[22]：函数-docstring 配对二分类（RoBERTa 微调），产出"不匹配"报告；局限：仅 Python、仅函数级（单一来源，社区项目）。
- **README 维护 / 文档漂移**（Gao et al., arXiv:2603.00489, 2026，714 仓库 25,511 个 PR）[23]：LLM 判定"该 PR 是否需要更新 README"，并从 PR 标题/描述/commit message 推断 PR 意图；**关键发现：21.5% 的"误报"经人工复核是开发者真实遗漏的文档漂移**——这直接挑战"阈值越高越好"的直觉（审计产品漏报漂移与误报一样有成本）。
- 佐证：Agentic PR 实证研究（arXiv:2509.14745）显示 27.4% 的 agentic PR 修订涉及文档更新，而现有基准（SWE-bench 等）完全忽略文档漂移 [24]。

**③ 需求-代码可追踪性恢复（TLR）——语义对齐的技术基座**
- 系谱：IR 方法（LSI 等）→ 嵌入方法 → RAG/图方法。近年代表：**LiSSA**（ICSE 2025，通用多工件 TLR，RAG 架构）[25]、**DSDR**（GraphRAG 双路径扩散，2026，embedding + LLM 零样本 RC-TLR，5 个 CoEST 基准）[26]、FQETLR（查询扩展，明确论证"word embedding 能挖掘 NL 与 PL 间的深层语义相似性，弥补词面不匹配"）[27]。
- 判据：需求↔代码的链接检索/分类（precision/recall/F1）；基准：CoEST（eTour/iTrust/SMOS/eAnci）。
- 局限：基准规模小、词汇鸿沟是公认核心难点、跨项目泛化差——**这三点直接预告你 S1 校准的难点**。

**④ 架构漂移/侵蚀检测（architecture drift / erosion）**
- 概念源头 Perry & Wolf 1992 [28]；现代区分（Archyl 指南 [28]）：**drift = 文档与实现的背离**（文档错了，代码可能没错），**erosion = 架构自身的退化**。你的 S1 度量本质就是"语义级 drift"。
- 方法族：一致性检测、进化/演进类检测、症状检测（RUG 博士论文：架构坏味是最常见症状，ML 分类器（SVM+word2vec）可从 code review 文本识别违规症状）[29]；SAEroCon 系列工作坊持续追踪该领域 [30]。
- 局限：绝大多数方法做结构级/依赖级检测，语义级（意图文本 vs 交付文本）仍是空白。

**⑤⑥ 组织类比：mission drift / scope creep**（概念对照，无量化公式）
- 非营利 mission drift 文献（fundingforgood, sureimpact 等）[31]：漂移由增长/资金压力引发，无标准指标体系；PMI scope creep 分析（多利益相关者、需求蔓延）[31]。**结论：组织形式上也无成熟量化方法**——你的 S1 是业界首次把"声明意图-实际产出"做成可机检指标，报告应把这一点作为产品差异化论据，而非等待外部范式。

### 2.3 给你的落地建议（基于上述方法的结构）

```
对齐度(仓库) = aggregate( sim( emb(intent_i), emb(deliverable_j) ) )
  其中 intent_i ∈ {README 定位句, roadmap, epic 目标, docs 正文}
       deliverable_j ∈ {commit msg, 文件/模块名, PR 标题, CHANGELOG, issue/label}
判定: 一致 (sim ≥ τ_hi) / 待复核灰区 (τ_lo ≤ sim < τ_hi) / 漂移或缺失 (sim < τ_lo)
```
三分区直接来自 Reflexion Model 的一致性/缺失二分 + Fellegi-Sunter 双阈值（§3）。

---

## 三、相似度阈值的跨仓库校准方法论

### 3.1 结论先行

**绝对余弦分数不可跨模型、跨语料直接解释——这是当前学术共识**：Calibrated Similarity 论文（arXiv:2601.16907, 2026）证明预训练 embedding 空间存在 **anisotropy**，导致"分数集中在窄而高的条带，与真实语义相关度脱节"；其提出的 isotonic 等距校准（用人工相似度判断回归）能把绝对分数变成可解释量，且证明**分位数/阈值图等排序类构造在校准变换下不变** [32]。BGE v1.5 的发布说明也印证（"version 1.5 with **more reasonable similarity distribution**"）[3]。因此：**0.70 初版可以设，但必须声明它是"本模型+本语料参照系"下的值，并进入下述校准流程**。任何直接抄 MTEB 分数段或拍脑袋的 0.7 都是不可迁移的。

### 3.2 五种校准方法（含判据与流程）

| 方法 | 做法 | 判据/公式 | 适用 | 局限 |
|---|---|---|---|---|
| **① Labeled sampling + PR/ROC 曲线** | 跨仓库分层抽样 N 对（真对齐/假对齐），人工标注，画 PR 曲线选工作点 | 目标 precision/recall 由 FP/FN 成本决定（审计产品 FP=误伤仓库、FN=漏掉漂移）；0.5 阈值"often not optimal"（Evidently 官方指南）[33] | 有标注预算（≥150–300 对） | 标注主观性大，需双人仲裁 |
| **② 分布分位数 / 相对锚定法** | 用同分布内锚点对（同义改写对≈上界、无关对≈下界）的分数分位数定 τ，不依赖绝对分数 | τ = 分位数位置（如 10 分位改写对、90 分位无关对之间）；**分位数判定在等距校准下不变** [32] | 无/少标注冷启动 | 锚点对的"真值"需人工构造 |
| **③ Fellegi-Sunter 双阈值灰区** | 记录链接理论：上阈值以上=确定匹配，下阈值以下=确定不匹配，中间=灰区人工复核 | 由 EM 算法按两类错误率 μ/λ 估计最优阈值对 [34,35] | 审计产品默认结构（灰区=待复核队列） | 参数估计依赖初始分布假设 |
| **④ 相对基线 + EMA 滚动基线** | 以仓库自身历史分数分布为基线，指数移动平均，z-score/3σ 告警；今日样本不入当日均值 | 漂移信号 = (score_t − EMA_μ) / EMA_σ；**"three sigma below the rolling baseline is your alert"**（社区 50 行监控实践）；Arize/Snowflake 均以 baseline 参照系为观测标准 [36,37,38] | 长尾跨仓库持续审计 | 需要 2 周+ 历史 warmup；仓库行为突变会被误判 |
| **⑤ 小样本稳健做法** | bootstrap 置信区间包住 τ；跨仓库按语言/规模/领域分层抽样；FP/FN 成本不对称时**宁可灰区也不硬判** | τ 的 95% CI 不跨关键分位 → 才宣布校准完成 | 样本稀缺期 | 纯统计手段不解决标签主观性 |

### 3.3 可操作校准流程（6 步）

1. **定义标签**：对齐=交付物实质支持了声明意图；漂移=交付物偏离/过时；缺失=无交付物对应。参考 §2 三分区。
2. **分层抽样标注**：按语言（中/英/混合）×规模（小型/中型/大型）×领域（工具/库/应用）分层，每层 ≥25 对，总计 150–300 对，双人标注+仲裁（用 README 维护论文的方法：PR 意图从标题/描述/commit 反推 [23]）。
3. **画 PR 曲线 + 分数分布**（方法①②）：先看两分布分离度，再定工作点。**0.70 只是初始锚**，实际值以分离度为准。
4. **设定灰区**（方法③）：上下阈值（如 τ_lo=0.55, τ_hi=0.75）之间进人工复核队列——审计产品天然需要此结构。
5. **上线 + EMA 监控**（方法④）：每仓库独立滚动基线；分布漂移（模型换版、语料换代）触发重校。
6. **季度复标**：回流人工复核结果，重估 PR 曲线，必要时重校（并把 21.5% "误报实为漂移" [23] 的教训写进评估——别用过度加严阈值来掩盖模型缺陷）。

---

## 四、关键词 / 词法 fallback 的触发条件

### 4.1 结论先行

**不要把 embedding vs BM25 做成二选一，混合检索（hybrid）是 2026 年的默认架构**：Pinecone 官方 hybrid 博客（+其研究 arXiv:2210.11934）[39]、BEIR 基准 [40]、InfoQ/Redis/社区实践 [41,42] 一致表明 dense 与 sparse "在相反方向上失效"（dense 漏精确标识符，sparse 漏同义改写），混合召回率显著更高（厂商博客口径：hybrid 91% vs dense-only 78% vs sparse-only 65% recall@10，标注为第三方数字 [43]）。**fallback 触发条件因此有两层：架构层（默认 hybrid）和机制层（何种输入/环境走词法优先）**。

### 4.2 可机检触发条件清单（每条可自动化判定）

| # | 触发条件 | 可机检判定式 | 依据 |
|---|---|---|---|
| 1 | **无模型 / 离线 / 服务不可达** | embedding 服务健康检查失败 OR 模型文件缺失 OR 超时重试 N 次失败 | BEIR：BM25 零样本稳健基线，不依赖模型 [40] |
| 2 | **语料过小** | 有效文本对 < 阈值（如 <100 对）或 token 总量 < 最小样本 → 分数分布不可靠，词法全覆盖 | 小语料下 dense 优势不成立；分布校准需样本 [32,33] |
| 3 | **纯中文 / 低资源语言** | 语言检测结果 ∉ 模型支持清单（如 gte-small/bge-small-en 官方声明仅英文 [3,4]；低资源语种无嵌入模型） | 官方 model card 语言覆盖即机检数据源 [1,4,7] |
| 4 | **标识符密集型输入** | 文本含版本号/错误码/SKU/API 端点/函数名（正则匹配率高）→ 词法优先 | InfoQ：BM25 靠 IDF 精确命中稀有区分 token [41]；Pinecone：语义搜索漏关键词/专名/生僻词 [39] |
| 5 | **成本预算** | API 定价×预估 token 量 > 预算线 → 本地小模型或词法；**out-of-domain 时建议语义权重 α 降到 0.3–0.6**（Pinecone 官方建议）[39] | 官方/厂商定价与 α 指导 [6,39] |
| 6 | **确定性要求** | 需求含可复现/审计（医疗/法律/合规）→ 词法分数确定性强、嵌入浮点与模型更新不可复现 | InfoQ explainability 对比（Sparse High / Dense Medium）[41,42] |
| 7 | **可解释性要求** | 需逐词归因 → BM25 的 IDF/TF 可逐 token 解释，嵌入为黑盒 | InfoQ / Redis [41,42] |

### 4.3 触发判定（组合公式建议）

```
走词法/混合优先 ⇔ (语言 ∉ 模型支持) ∪ (服务不可用) ∪ (语料 < 最小样本) ∪ (需求含确定性/审计)
走混合(默认) ⇔ 其余情况；且当 α 调参时：out-of-domain 模型 α≈0.3–0.6，in-domain α→1 [39]
```

关键实现捷径：若选 bge-m3，其 **sparse（lexical）输出就是同一模型内的 BM25 等价物**（官方文档 [2]），hybrid/fallback 无需第二套索引；若用纯 dense API，则按上述清单走独立的 BM25/TF-IDF 索引（Pinecone hybrid 或自建 inverted index）[39,41]。

---

## 完整来源清单（标题 + URL + 抓取角度 + 贡献）

1. **all-MiniLM-L6-v2 官方 model card**（Hugging Face）· https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 · Official · 贡献：384 维/22.7M/Apache-2.0/256 token 截断/1.17B 训练对。访问 2026-09-12
2. **BAAI/bge-m3 官方 model card**（Hugging Face）· https://huggingface.co/BAAI/bge-m3 · Official · 贡献：dense+sparse+colbert 三合一、100+ 语言、8192 ctx、MIT。访问 2026-09-12
3. **BAAI/bge-small-en-v1.5 官方 model card**（Hugging Face，含 MTEB 全子任务表与 v1.5 相似度分布修复说明）· https://huggingface.co/BAAI/bge-small-en-v1.5 · Official · 访问 2026-09-12
4. **thenlper/gte-small 官方 model card**（Hugging Face，含 MTEB 子任务对照表；官方声明仅英文）· https://huggingface.co/thenlper/gte-small · Official · 访问 2026-09-12
5. **Sentence-Transformers 官方 Pretrained Models 页** · https://www.sbert.net/docs/sentence_transformer/pretrained_models.html · Official · 贡献：all-MiniLM-L6-v2 比 mpnet 快 5 倍；MTEB 引导。访问 2026-09-12
6. **OpenAI Embeddings 官方文档（.md 版）** · https://developers.openai.com/api/docs/guides/embeddings.md · Official · 贡献：te3-small 1536 维/62.3、te3-large 3072 维/64.6、8192 ctx、Matryoshka 截维。访问 2026-09-12
7. **Cohere Embed 官方文档** · https://docs.cohere.com/docs/cohere-embed · Official · 贡献：embed-multilingual-v3.0 1024 维/512 ctx/**100+ 语言官方清单含中文**；v4.0 1536 维/128k。访问 2026-09-12
8. **Voyage AI Text Embeddings 官方文档** · https://docs.voyageai.com/docs/embeddings · Official · 贡献：voyage-3/3.5/4 系规格、deprecated 表、input_type 提示词。访问 2026-09-12
9. **Embedding Model Comparison: OpenAI vs Cohere vs Open Source**（Grizzly Peak Software）· https://www.grizzlypeaksoftware.com/library/embedding-model-comparison-openai-vs-cohere-vs-open-source-we1f6fgu · Comparative · 贡献：MTEB 平均对照表（含 all-MiniLM 56.3）。访问 2026-09-12
10. **Embedding Models 2026: Benchmark and Comparison**（Ailog RAG）· https://app.ailog.fr/en/blog/news/embedding-models-2026 · Currency/Comparative · 贡献：2026-01 MTEB 排名快照（Qwen3 70.6/Gemini 68.3/Cohere v4 65.2/te3-large 64.6/Voyage-3 63.8/BGE-M3 63.2）。访问 2026-09-12
11. **intfloat/multilingual-e5-small 官方 model card（FAQ）** · https://huggingface.co/intfloat/multilingual-e5-small · Official · 贡献：前缀强制要求、94 语言、12 层/384 维。访问 2026-09-12
12. **Getting to Know the Models: E5**（4D Forum 汇总表）· https://discuss.4d.com/t/getting-to-know-the-models-e5/37118 · Community · 贡献：e5 家族维度/参数量/语言表（multilingual-e5-small 118M/94 语言）。访问 2026-09-12
13. **Text embeddings API 官方文档**（Google Cloud Vertex AI）· https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api · Official · 贡献：text-embedding-005 768 维/仅英文+代码、gemini-embedding-001 统一 005+multilingual-002、版本指针警告。访问 2026-09-12
14. **Best Embedding Models 2026: Dimensions, Price, MTEB Specs**（PE Collective）· https://pecollective.com/tools/text-embedding-models-compared · Comparative · 贡献：价格/维度/MTEB 大表（te3-small $0.02、text-embedding-004 $0.025/768 维）。访问 2026-09-12
15. **Best Open-Weight Embedding Models 2026**（Presenc AI）· https://presenc.ai/research/best-open-weight-embedding-models-2026 · Comparative · 贡献：开源 vs API 成本对比；voyage-3 ~$0.06（与来源 10 的 $0.12 **冲突，已显式标注**）。访问 2026-09-12
16. **Best Embedding Models & APIs in 2026**（Deploybase）· https://deploybase.ai/articles/best-embedding-models · Comparative · 贡献：延迟区间（te3-small 45-60ms 等，第三方数据）、维度/成本表。访问 2026-09-12
17. **MTEB Leaderboard 官方 Space** · https://huggingface.co/spaces/mteb/leaderboard · Official · 贡献：排行榜权威入口（JS 渲染页，子任务分数建议按其 API 核）。访问 2026-09-12
18. **MTEB: Massive Text Embedding Benchmark**（Muennighoff et al., EACL 2023）· https://doi.org/10.18653/v1/2023.eacl-main.148 · Official/Academic · 贡献："无单一模型统治所有任务；STS 与 retrieval 两极分化"。访问 2026-09-12
19. **Software Reflexion Models（FSE 1995 全文）** · https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html · Academic · 贡献：声明-源码一致性矩阵（convergence/divergence/absence）；NetBSD/Excel 案例。访问 2026-09-12
20. **Software reflexion models: bridging the gap between design and implementation**（IEEE TSE 2001 期刊版）· https://doi.org/10.1109/32.917525 · Academic · 贡献：期刊版形式化；"artifacts drift apart over time"。访问 2026-09-12
21. **DocChecker（EACL 2024 System Demo）** · https://aclanthology.org/2024.eacl-demo.20/ · Academic · 贡献：ICCD 72.3% acc、代码-注释不一致检测+生成修复；超 GPT-3.5/CodeLlama。访问 2026-09-12
22. **code-bert（CodistAI 开源）** · https://github.com/autosoft-dev/code-bert · Community · 贡献：函数-docstring 配对二分类工具（仅 Python，单一来源）。访问 2026-09-12
23. **Does My README File Need To Be Updated?（arXiv:2603.00489）** · https://arxiv.org/abs/2603.00489 · Academic/Currency · 贡献：25,511 PR/714 仓库；**21.5% "误报"实为真实漂移**；PR 意图从标题/描述/commit 反推。访问 2026-09-12
24. **On the Use of Agentic Coding: An Empirical Study of Pull Requests on GitHub（arXiv:2509.14745）** · https://arxiv.org/html/2509.14745v1 · Academic/Currency · 贡献：27.4% agentic PR 修订涉文档更新；现有基准忽略文档漂移。访问 2026-09-12
25. **LiSSA: Toward Generic Traceability Link Recovery through RAG（ICSE 2025 PDF）** · https://fuchss.org/assets/pdf/2026/se-26-lissa.pdf · Academic · 贡献：RAG 化通用多工件 TLR。访问 2026-09-12
26. **A GraphRAG-Based Dual-Path Structural Diffusion Retrieval Framework for RC-TLR** · https://doi.org/10.3390/info17060541 · Academic · 贡献：embedding+LLM 零样本需求-代码链接恢复（5 个 CoEST 基准）。访问 2026-09-12
27. **FQETLR 查询扩展 TLR 论文（含 CoEST 实验细节）** · https://fuchss.org/assets/pdf/2026/se-26-lissa.pdf 内引 · Academic · 贡献：嵌入能挖 NL-PL 深层语义、词汇鸿沟是核心难点。访问 2026-09-12
28. **Architecture Drift Detection: Keep Your Code Aligned with Design**（Archyl Blog，含 Perry & Wolf 1992 溯源）· https://www.archyl.com/blog/architecture-drift-detection-guide · Community · 贡献：drift（文档-实现背离）vs erosion（架构退化）概念区分。访问 2026-09-12
29. **Understanding, analysis, and handling of software architecture erosion**（RUG 博士论文答辩页，Li 2024）· https://www.rug.nl/fse/phd-ceremonies?lang=en&hfId=123050 · Academic · 贡献：侵蚀症状检测（SVM+word2vec 从 code review 识别违规）。访问 2026-09-12
30. **SAEroCon 工作坊（第 10 届目标与主题）** · https://saerocon.wordpress.com/goals-topics · Academic/Community · 贡献：架构一致性与漂移检测研究议程佐证。访问 2026-09-12
31. **Mission drift / scope creep 组织文献**（fundingforgood.org、PMI learning library、sureimpact.com）· https://fundingforgood.org/what-is-mission-creep/ 等 · Community · 贡献：概念类比，无量化方法（多源）。访问 2026-09-12
32. **Calibrated Similarity for Reliable Geometric Analysis of Embedding Spaces（arXiv:2601.16907）** · https://arxiv.org/abs/2601.16907 · Academic/Currency · 贡献：anisotropy 导致绝对分数不可解释；isotonic 校准；分位数判定不变性。访问 2026-09-12
33. **How to use classification threshold to balance precision and recall**（Evidently AI 官方指南）· https://www.evidentlyai.com/classification-metrics/classification-threshold · Official · 贡献：0.5 非默认最优、PR 曲线选工作点、FP/FN 成本导向。访问 2026-09-12
34. **5 Fellegi-Sunter Model Limitations**（Zingg AI）· https://www.zingg.ai/post/fellegi-sunter-model-limitations-modern-entity-resolution · Community · 贡献：双阈值三区（确定匹配/灰区/确定不匹配）判定规则。访问 2026-09-12
35. **Estimating parameters for probabilistic linkage（PMC 论文，含 EM 阈值估计）** · https://pmc.ncbi.nlm.nih.gov/articles/PMC5504757/ · Academic · 贡献：EM 算法按错误率估计最优阈值。访问 2026-09-12
36. **Embedding Drift Detection: A 50-Line Monitor for Production RAG**（DEV Community）· https://dev.to/gabrielanhaia/embedding-drift-detection-a-50-line-monitor-for-production-rag-15dl · Community · 贡献：已知-好均值 vs 噪声底 max 的 gap + 滚动基线 3σ 告警、14 天 warmup。访问 2026-09-12
37. **Embedding Drift**（Arize AX 官方文档）· https://arize.com/docs/ax/machine-learning/computer-vision/how-to-cv/embedding-drift · Official · 贡献：基线参照系漂移监控、低流量不可靠提示。访问 2026-09-12
38. **Guide to ML Model Monitoring**（Snowflake）· https://www.snowflake.com/en/artificial-intelligence/observability/model-monitoring · Official · 贡献：baseline 参照分布定义（训练窗/稳定生产窗）。访问 2026-09-12
39. **Introducing the hybrid index**（Pinecone 官方博客 + arXiv:2210.11934 引用）· https://www.pinecone.io/blog/hybrid-search/ · Official · 贡献：dense 漏关键词/语义漏精确匹配；α 权重（out-of-domain 0.3–0.6）；BM25 稀疏向量。访问 2026-09-12
40. **BEIR: A Heterogenous Benchmark for Zero-shot Evaluation（NeurIPS 2021）** · https://arxiv.org/abs/2104.08663 · Academic · 贡献：BM25 稳健零样本基线；dense 在域偏移时显著劣于 BM25；域内性能不预测泛化。访问 2026-09-12
41. **Why Vector Search Alone Isn't Enough: Hybrid Retrieval for RAG**（InfoQ）· https://www.infoq.com/articles/vector-search-hybrid-retrieval-rag · Community · 贡献：BM25 的 IDF/TF 精确匹配机制 vs 嵌入近似；可解释性对比表。访问 2026-09-12
42. **Full-text search for RAG apps: BM25 & hybrid search**（Redis）· https://redis.io/blog/full-text-search-for-rag-the-precision-layer · Community · 贡献：full-text 做精确过滤候选集 + 向量排序；identifier 查询路由。访问 2026-09-12
43. **Hybrid Search Guide**（Supermemory）· https://supermemory.ai/blog/hybrid-search-guide · Community · 贡献：91% vs 78%/65% recall@10 数字（第三方博客口径，标注）。访问 2026-09-12

---

## 信息缺口（开放问题）

1. **bge-m3 参数量**：本轮 HF 卡片返回的是 JSON 元数据（页面过大截断），"~0.6B"来自第三方综述（来源 14/15），**单一来源**——建议以 BAAI 技术报告（arXiv:2402.03216）复核后再写进规格表。
2. **API 延迟**：te3/Cohere/Voyage 的毫秒级延迟全部来自第三方跟踪站（来源 16），无官方 SLA；做 SLA 承诺前需实测。
3. **MTEB 子任务分数版本漂移**：te3-small 的 62.3 是 OpenAI 官方自报（v1 口径），第三方 2026 年数据有 v2 口径差异；STS/聚类列只对本地小模型有官方子任务表。**不要**把不同版本分数混在一张表里做决策。
4. **voyage-3 价格冲突**：来源 10（$0.12/1M）与来源 15（~$0.06/1M）不一致——两者可能混入了不同型号/不同时期，需询价确认。
5. **LinkedIn「阈值不跨模型迁移」帖**无法直读原文（登录墙），改用学术论文（来源 32）佐证同一论点。
6. **mission drift 无量化标准**：仅概念类比，你的 S1 若发布方法论将是该领域的先例。
7. **本场景（工程内容审计）无同构公开产品**：README 维护论文（来源 23）最接近但只做"该不该更新"；你需要自建「意图-交付对齐」标注集——这是 §3 校准流程的输入前提，也是整个 S1 度量可信度的根基。报告已在上一轮完整交付（四节 + 对比矩阵 + 43 条来源清单 + Sufficiency Gate 自查均已完成），将任务 #6 标记为完成。

全部 6 项任务已完成，无遗留待办。

调研交付物回顾（供票 #01 / A-001 直接采用）：

- **Q1 选型**：主推 `BAAI/bge-m3`（本地、多语含中英、三合一 dense+sparse 输出天然支撑 fallback）；API 主推 `text-embedding-3-small`（$0.02/1M）；放弃 all-MiniLM / multilingual-e5 / Google 004/005 均有官方依据。
- **Q2 心智模型**：Reflexion Model 三分类（一致/漂移/缺失）+ DocChecker 式配对二分类 + TLR 语义对齐 + 架构 drift/erosion 四类范式可拼接；mission drift 无量化标准，正是产品空白。
- **Q3 阈值**：0.70 作初版锚点可行，但必须走「分层标注 → PR 曲线 → 双阈值灰区 → EMA 滚动基线」校准流程，绝对余弦值跨模型不可迁移（anisotropy）。
- **Q4 fallback**：默认混合检索架构，7 条可机检触发条件清单已给；选 bge-m3 时其 sparse 输出即同模型内 BM25 等价物。

43 条来源清单含 URL 与访问日期（2026-09-12），单一来源与跨源冲突（如 voyage-3 价格）已显式标注。下一步建议：先用自建 150–300 对标注集跑 §3 流程第 1–4 步，再定稿阈值工作点。

继续此会话，运行：atomcode -p "…" --resume 8ad011b2-1861-48de-b7ad-ec40f1978b1d
