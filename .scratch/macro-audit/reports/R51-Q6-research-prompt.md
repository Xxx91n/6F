# R51-Q6 调研题面 —— 指针纪律载体落点（WORKFLOW 扩写 vs CONTEXT 词条 vs ADR vs 组合）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。指针纪律立法已成四裁：D-188（法定指针形=SHA≥12hex+(\"subject\")＋存在∧锚线可达＋短码禁针＋裁剪版机检三项）、D-189（严格层/宽层划界＋封闭位形枚举）、D-190（锚线声明制）、D-191（存量两残留勘误＋守卫首跑两级判级）、D-192（baseline 文件制判级＋封闭枚举扫描面＋孪生检测 WARN＋D-177 预声明路径）。

悬而未裁=**成文载体落点**。本仓文档分层既成惯例：
- `WORKFLOW.md`（.scratch/architecture-recovery/）=操作条文面（§4.2.x 规程节——审计/勘误/预声明等程序条文居所；§4.2.10 既有指针节为本次扩写位）；
- `CONTEXT.md`=术语词典（词条=命名+定义+边界示例）；
- `docs/adr/`=产品架构决策（ADR 入闸门槛：难撤销／缺上下文难懂／有意义权衡——历史 24 件全为产品面裁定）；
- `decision-ledger.md`=裁定链（程序性裁定历来落账本+WORKFLOW 条文，非 ADR——D-181/D-146⑤/D-149 等先例）；
- `AGENTS.md`=操作行摘要（选择性承载）。

待成文内容件：①法定指针形定义（SHA≥12hex+subject+锚线可达）；②锚线声明制规则；③严格层/宽层位形枚举；④短码禁令＋change-id 辅证位；⑤勘误通道消费规程（D-181 指针列法定形）。待命名词条候选：「法定指针形」「锚线（anchor line）」「严格层/宽层」「孤儿孪生（orphan twin）」「已知违规清单（baseline）」。

## 候选

(i) **WORKFLOW §4.2.10 扩写＋CONTEXT.md 词条节**（程序条文+术语词典双层）——仓内先例主流形态；
(ii) **(i) ＋ ADR-0025**——若判定本裁属「缺上下文难懂+有意义权衡」级（指针纪律牵 VC 工具链特性，后来者需背景）；
(iii) **CONTEXT 主词条唯一承载**（WORKFLOW 不扩写只引用）——判据与规程散在词条不利执行；
(iv) **单开专题文档**（如 .scratch/macro-audit/docs/pointer-discipline.md）——建制面膨胀，检点面分散。

另须裁：**执行窗分工**——条文面+勘误行=本轮收口批；守卫件=下轮执行批（D-177 预声明先行，check 源码属源改面）。

## 调研要求

1. 工业界成熟心智模型（重点）：规范文档分层惯例——ISO 9001/27001 体系文档金字塔（policy→procedure→record）；标准文本的 normative/informative annex 分工（规则条文 vs 术语定义分置惯例——ISO/IEC Directives Part 2 术语条款规范）；RFC 的术语节（§1.1 Terminology）与规程节分离惯例；ADR 社区关于「什么值得写 ADR」的门槛惯例（Michael Nygard 原典「architecturally significant」判据、adr.github.io 指南——过程性/工具性决策入 ADR 与否的先例）；政策类文档「程序归程序、词典归词典」的编制惯例；规章命名惯例（术语先定义后使用的 drafting 惯例）。
2. 判候选：①双层载体（程序条文入 WORKFLOW＋术语入 CONTEXT）vs 单载体优劣先例；②ADR 门槛判读——「VC 工具链文书纪律」属产品架构决策还是过程规程（先例：24 件 ADR 全产品面＋程序裁定历来落账本+WORKFLOW）；③词条命名——「孤儿孪生」等新造词 vs 既有工业名词（dangling commit/orphan commit 是否应采原名避免自造词税）；④专题文档面膨胀的先例判读。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-188~D-192 五裁、D-181 勘误通道、D-146⑤、D-149 守卫建制、D-161④ footer 三栏位〔commit trailer 面〕、D-165/D-170 分层定稿〔裁定层/验收层文书分层先例〕、D-177 预声明、D-148③、ADR-0009 边界面惯例）。
4. 推荐+理由+置信度；缺口如实标位。
