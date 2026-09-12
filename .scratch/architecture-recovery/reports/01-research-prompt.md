# 01 调研提示词（atomcode 深度调研 / WORKFLOW 4.2.3）

> 用途：为票 #01（S1 定位收敛语义度量方法 / A-001）做 embedding 选型 + 阈值校准 + fallback 的深度调研。
> carrier：atomcode --prompt-file（无头）。

## Prompt

你是资深软件工程研究助手。请做一次深度调研，输出结构化中文报告，覆盖以下 4 个问题。每条结论必须给出来源（论文标题 / 工具官方文档 / URL），并做双源交叉，单一来源必须显式标注。

背景：我们在做一个「工程内容审计」产品，维度 S1「定位收敛」需要度量一个仓库的『意图声明』（README 一句话定位、roadmap、epic 目标、docs 正文）与『实际交付内容』（commit message、文件/模块名、PR 标题、CHANGELOG、issue/label）之间的语义对齐度。我们要选 embedding 模型，校准一个相似度阈值（初版 70%），并设计 embedding 不可用时的关键词 fallback。

### 问题 1：embedding 模型选型（≥3 候选对比）
对比以下候选（可补充）：
- 本地小模型：sentence-transformers/all-MiniLM-L6-v2、BAAI/bge-small-en-v1.5、thenlper/gte-small、intfloat/multilingual-e5-small、BAAI/bge-m3
- API 模型：OpenAI text-embedding-3-small/large、Cohere embed-multilingual-v3.0、Voyage-3、Google text-embedding-004/005
对每个给出：向量维度、参数量、许可证、部署形态（本地 ONNX / API）、每百万 token 成本、延迟、MTEB 相关子任务分数（STS / 聚类 / 短文本）、中文与多语支持、确定性、离线可用性。最后给出『短文本语义对齐』场景的推荐，并给出被放弃候选的明确放弃理由。

### 问题 2：工业界 / 学术界『意图 vs 实现漂移』度量心智模型（≥2 个成熟方案）
列举并分析：
- 文档-代码一致性检测（doc-code consistency / documentation drift detection）的论文与工具（README 质量研究、API 文档不一致检测、DocChecker、CodeBERT 系方法）
- 战略漂移 / mission drift / scope creep 的检测方法
- 任何把『声明意图』与『实际产物』做语义对齐的公开方法
给出每个方法的判据、度量公式、局限。

### 问题 3：相似度阈值的跨仓库校准方法论
如何为一个语义相似度阈值（如 0.70）做跨仓库校准？覆盖 labeled sampling、precision/recall 曲线、分布分位数法、相对基线法、EMA 基线、小样本稳健做法。给出可操作的校准流程步骤。

### 问题 4：关键词 / 词法 fallback 的触发条件
在什么条件下应从 embedding 退回到 BM25 / TF-IDF / 关键词覆盖率？覆盖：无模型 / 离线、语料过小、纯中文 / 低资源语言、成本预算、确定性要求、可解释性要求。给出可机检的触发条件清单。

输出格式：Markdown，四节，每节结论先行，末尾附『来源清单』（标题 + URL + 访问日期）。
