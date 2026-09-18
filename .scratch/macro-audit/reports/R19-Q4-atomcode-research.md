# R19-Q4 调研报告 — CJK non-assert 同构缺口＋词表治理立规

> atomcode 深调研（2026-09-18 实跑；searches 15+/5 角度/full reads 8/domains 7+，置信中高）。题面=R19-Q4-research-prompt.md。

## 1) 执行摘要

**推荐：①(a) 补 CJK_NON_ASSERT_CUES 同构表（小种子表＋子串特性设计＋配套伪表豁免）；②(a) 立规（表头「词表即判据」声明＋改表义务三件套＋可选 56-check WARN），不选 (c) 独立 JSON 文件。** 置信度：**中高**——①(a) 有 ConText 官方四类 trigger 分表（hypothetical 独立成表）与 CNeSp 中文 speculation 研究线双重支撑，且与 EN 侧 r18 O2 名实对齐对称；②(a) 有 cspell/hunspell 与本仓 D-068 baseline-diff 先例支撑，但「改表义务」的复跑成本与本仓 52a 全量复跑惯例需在票面定界，工业界无逐 commit 复跑强制先例（多为 release/pre-commit 粒度），此部分置信中。

## 2) 分点结论

**2.1 ConText 官方先例：hypothetical 本来就是独立 trigger 表（支撑 ①(a)）**
ConText 官方论文（PMC2757457，已读原文）：trigger terms 按 contextual property 分四表——negated 143、historical 10、**hypothetical 11**、other 26；每表配 pseudo-trigger 表（hypothetical 4 条如 "if negative"/"know if"）。假想/示例语境 cue 表是否定表的对称兄弟表非可选装饰，pseudo 表是标配第三件。CJK 侧缺位=覆盖不对称非设计分歧。hypothetical 表仅 11 条——非断言语境 cue 词天然封闭小类，CJK 种子表 10-20 条量级即合先例形态。

**2.2 中文 speculation cue 有成熟研究线，但无现成可搬词表；morpheme/子串陷阱有文献记载**
- Zou/Zhu/Zhou ACL-IJCNLP 2015（P15-1064）：CNeSp 语料 16,841 句标注中文否定/speculation cue 与 scope；中文 cue 检测著名难点=morpheme 交叉（「猜」也出现在「猜想」）；中文 scope resolution 误差显著高于英文。
- FCS 2016 期刊版：cross-lingual cue expansion 提覆盖——「从 EN 语义对应物出发、按 CJK 特性落地」是该文献线标准做法。
- PMC7746498（CRF/embedding 综述）：中文 cue 检测 F 达 99% 但那是序列标注+嵌入路线；对 gazetteer 路线的教训=cue 词形歧义（一词两用）是 FP/FN 主源，必须配 pseudo/豁免机制。
- 结论：无可直接下载的中文 hypothetical cue 表成品（CNeSp 词表在论文正文/语料申请内），种子表须自建；任务面给的种子（例如/比如/假设/试想/倘若/举例来说/打个比方/理论上/虚构）与研究线词形高度吻合。

**2.3 CJK 子串匹配的词形边界治理：三件套设计模式**
1. **长词优先/多字词优先**：种子选最长自然词形（「举例来说」>「例如」；「理论上」非「理论」——「理论物理」不误吞；「假设」配伪表豁免「假说」「假设性」）。
2. **伪表豁免**：ConText pseudo-trigger 教科书先例；本仓 CJK_PSEUDO_NEG/CJK_SPEECH_PSEUDO 已是同型在役——CJK_NON_ASSERT_PSEUDO 同型设立（假说、假设性、零假设、假设检验、工作假设等逐词过）。
3. **命中点邻接检查**：本仓已有「赋值豁免」（cue 紧邻 = 右侧不作否定）先例可复用；「匹配后邻接复核」比负向前查正则更适合无词边界场景——与 substrCuesIn＋邻接判断现有架构一致，不需引入分词器。

**2.4 「词表=判据」治理形态：代码常量＋表头声明是主流，独立版本化文件是多消费者形态**
- **cspell**：词表=独立 project-words.txt，但变更纪律极轻（CLI 追加、无版本号、无强制复跑），治理靠 git diff 可见性。
- **hunspell**：.dic/.aff 随词典发行版版本化——版本化动力来自「多下游消费者」，单仓内部词表无此压力。
- **lint/静态分析**：规则与关键词普遍在代码/配置常量内，纪律=PR review＋测试快照。
- **本仓 D-068** 钉的是对外契约（报告骨架，下游可见）；cue 表是内部判定实现，语义变化由 held-out 复跑与 flag 输出兜底可见。
- 结论：代码常量＋表头「词表即判据」声明匹配本仓体量；(c) 独立 JSON＋版本号挂触发器（多消费者/热更新出现时再抽）。

**2.5 预防性对称 vs 实证驱动：判定面侧立场=「廉价对称补齐、昂贵能力等实证」**
- 安全侧（microsoft amplifier-module SafetyValidator）：FP 高危 pattern 强制更窄匹配＋测试覆盖假阳性——判定面规则宁可预防性收窄，FP 代价（误 supports）高于漏报，与 D-065 fail-safe 同向。
- 本仓判据：CJK 假想语境实证=0 是「没测过」非「测过没有」——52a FP 主类=语境包裹误判（含假想示例），CJK 语料在作用域内，假想语境在中文工程文本频率与英文同量级。EN 已补表下 CJK 不补=同一判定面语种间不对称——恰是 D-065「CJK 独立词表不能只 port」纪律要防的缺口形态。补小表（10-20 条＋伪表）成本≈一次票面工作；但种子表须一次声明、禁后续参照标签渐进调参。

## 3) 对比矩阵

| 项 | 形态 | 证据强度 | 主要风险 | 备注 |
|---|---|---|---|---|
| ①(a) 补 CJK non-assert 表 | 代码常量同构表＋伪表＋邻接豁免 | ConText 四表先例＋CNeSp 线＋EN 侧对称 | 子串误吞（假说/理论物理/专名内含串） | 种子 10-20 条封闭小类，先验声明 |
| ①(b) 不补（YAGNI） | 维持三表 | 实证=0 可辩 | 语种间判定面不对称；已知 FP 主类在 CJK 侧留缺口 | 与 D-065 精神相悖 |
| ①(c) 缓挂 | 触发器登记 | — | 触发条件难定义（需检测器才测得出） | 鸡生蛋问题 |
| ②(a) 表头声明＋改表义务 | 注释声明＋同 commit 义务＋56-check WARN | cspell/hunspell 轻纪律＋D-068 机检先例 | 义务执行靠自觉 | 与 D-065/D-061 同族延伸 |
| ②(b) 不立规 | 现状 | — | 改表无痕、判定面漂移不可见 | 与 D-068 治理不对称 |
| ②(c) 独立 JSON＋版本号 | 数据文件＋版本断言 | hunspell 多下游先例 | 单消费者纯开销；失类型检查与单测直达 | 挂触发器再抽 |

## 4) 落地要素清单

**4.1 CJK_NON_ASSERT_CUES 种子设计建议**（先验声明，禁后续参照标签增补）
- pre-语境类：例如、比如、譬如、举例来说、比如说、打个比方、比方说、假设、假定、假如、假若、倘若、倘使、要是、试想、设想、不妨设想、假想、设若
- post/短窗类：理论上、在理论上、原则上、纯属虚构、仅为示例、仅供参考（「严格来说」不收——限定语非假想语境）
- 设计纪律：①一律 ≥2 字词形不收单字；②「理论」不收「理论上」收；③「假设」收但 CJK_NON_ASSERT_PSEUDO 配「假说、假设性、零假设、假设检验、工作假设」豁免（科学语域「假设」=名词性 hypothesis 非假想语境标记——一词两用主失效模式须逐词过单测）；④命中后邻接检查复用现有赋值豁免架构。
- flag kind 沿用 `non-asserted`（flag 词表零改动），剥离窗口与 EN_NON_ASSERT 同参数，fail-safe 从严不变。

**4.2 治理立规要素（②(a)）**
- **表头声明**（各 cue 表注释统一模板）：「词表即判据：本表增删改变 supports/insufficient 判定面；改动须同 commit 记动机（登记于票面/decision-ledger 行内），复跑 held-out 一轮＋52a 回归对照（阈值不回调），禁参照 52a 语料标签调参（D-065 延伸）」。
- **改表义务三件**：①同 commit 动机记录；②held-out 复跑＋52a golden parity 对照；③禁参照标签调参明示延伸至 cue 表（D-065 加严登记非修订）。
- **56-check baseline-diff WARN（可选，建议做）**：cue 表常量内容 hash 断言进 56-check——表内容变而票面无登记→WARN（不 FAIL，学 D-068 分级但降一档：cue 表是内部判定面非对外契约，防守卫通胀）；行数/串拼接近似 hash 即可不做语义 diff。
- **不抽 JSON**：表留 code（类型检查＋单测直达＋无解析层）；触发器登记「cue 表被第二个消费者引用或需热更新时→抽独立文件＋D-068 式版本断言」。

**4.3 机检面形态**：56-check WARN（hash 变更↔登记缺失）＋npm test 单测（假说/假设检验豁免、理论物理不命中、假设性不命中、例如命中剥离）。

## 5) 各候选已知失败模式

| 候选 | 失败模式 |
|---|---|
| ①(a) | ①子串误吞（「假设检验」「假说」「理论物理」）；②cue 歧义一词两用（「假设」名词义）→伪表漏配→误剥真支持→新 FN；③种子先验不全→CJK 假想长尾（「姑且」「权且」「且看」）漏检→残留 FP；④窗口照搬 EN 参数对中文短句偏宽 |
| ①(b) | 判定面语种不对称固化；CJK 假想包裹 FP 在 52b 真实语料面爆发时被迫救火（届时已违「先验声明」纪律沦为标签调参） |
| ①(c) | 触发条件依赖检测器自身→实际永不触发 |
| ②(a) | 义务靠自觉可略过；hash WARN 只查变没变不查登记没登记（除非票面机器可查） |
| ②(b) | 判定面静默漂移；D-068 已给契约立规而 cue 表裸奔=治理不对称新债 |
| ②(c) | 单消费者纯开销；JSON 化失类型检查与单测直达；维护成本≈D-068 量级无对外契约收益 |

## 6) 与本仓 current 决策冲突排查

- **D-065**：无冲突，①(a) 是其正向延伸——种子从 EN 语义对应物出发但词形按 CJK 子串特性重造（FCS 2016 cross-lingual cue expansion 同款惯例）。**注意点**：D-065「禁参照 52a 标签调参」目前只管评测侧，②(a) 立规须把禁令明示延伸到 cue 表增补——这是对 D-065 的**加严**而非修订，票面须显式登记。
- **D-059⑤**：无冲突。non-assert 剥离→insufficient 属第一级确定性前处理不新增第三态（flag kind `non-asserted` 已在词表内，补表后 flag 零改动）。
- **D-058**：无冲突。cue 表在 kernel 判定面内非叙事面。
- **D-068**：无冲突同族扩展。票面须写明降档理由：D-068 三 FAIL 钉对外契约，cue 表是内部判定面→用 WARN 不用 FAIL 防守卫通胀。
- **D-061**：无冲突。改表复跑义务直接引用其惯例。
- **D-053**：无冲突。「词表即判据」措辞与 supports=lexical-presence-support 收窄语义一致。
- 无需任何 revised；仅 D-065 加严一条延伸须在票面显式登记。

## 7) 完整来源清单

| 来源 | URL | 角度 | 贡献 |
|---|---|---|---|
| ConText 官方论文 | https://pmc.ncbi.nlm.nih.gov/articles/PMC2757457/ | Official | trigger 四表+hypothetical 独立成表+pseudo-trigger 标配 |
| Zou/Zhu/Zhou ACL-IJCNLP 2015 | https://aclanthology.org/P15-1064/ | Official | CNeSp 中文 speculation 语料+morpheme 交叉难点 |
| FCS 2016 期刊版 | https://journal.hep.com.cn/fcs/EN/10.1007/s11704-016-6102-z | Official | cross-lingual cue expansion 标准做法 |
| PMC7746498 CRF/embedding 综述 | https://pmc.ncbi.nlm.nih.gov/articles/PMC7746498/ | Official | cue 一词两用=FP/FN 主源+gazetteer 须配豁免 |
| cspell 官方文档×2 | https://cspell.org/ | Official | 词表轻纪律先例（git diff 可见性治理） |
| hunspell 官网 | https://hunspell.github.io/ | Official | 词典版本化=多消费者驱动 |
| Alexa slot-type 文档 | https://developer.amazon.com/ | Official | slot values 治理形态（导航壳） |
| microsoft amplifier SafetyValidator | https://deepwiki.com/ | Community | FP 高危 pattern 预防性收窄先例 |
| Sardine 规则调整三档 | https://www.sardine.ai/ | Community | 规则存在预防性+调整实证驱动 |
| SO lookahead 讨论 | https://stackoverflow.com/ | Community | 纯正则 lookaround 处理重叠串不可靠 |
| arXiv 2405.13319 | https://arxiv.org/abs/2405.13319 | Official | 补充核验 |

## 8) 信息缺口

1. **CNeSp 完整 speculation cue 词表**：在论文 PDF 内（二进制流未解析），可后续 ctx_fetch_and_index 或本地 pdftotext 补——若要为种子表做第二轮校对这是最值得补的一手词表。
2. **中文 hypothetical cue 在工程文本（非临床/金融）的频率统计**：无文献覆盖；「CJK 假想实证=0」在 52a 内成立，外推风险已写入失败模式。
3. **「改词表→强制复跑」的逐 commit 级工业先例**：未找到（工业惯例=release/pre-commit 粒度）；本票复跑义务定为「改表的同一 commit」属本仓自设加严，票面应如实标注为先验纪律非移植惯例。
4. Alexa custom slot values 版本化治理细节未取得正文（不影响主结论）。