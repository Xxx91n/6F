# R17-Q2 atomcode 深度调研报告 — #56 checker 语义边界修复方向

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R17-Q2-research-prompt.md
> 时点 2026-09-17；通道 ctx_batch_execute（label=atomcode-r17q2）；12 来源（ConText/NegEx ACL/NegDetector CJK/CiteEval/TIST verifier/TianPan/Google AttributedQA/in-com FP/gazetteer 综述/中文否定综述＋本仓一手文书）。
> 冲突协议结果：**零 revised**——(a) 是 D-058/D-059⑤/D-061/D-064 的合取执行。

## §1 执行摘要

**推荐 (a) ③+① 组合，置信高**：宣称收窄 presence-only 文档化＋否定语境剥离确定性启发式，FN=12 披露归 human-in-loop。①NegEx/ConText 算法族先例——纯正则无句法语义依赖、明确写成确定性算法（ConText 原文），完全落 D-058 kernel 边界内；②D-059⑤ 叠加分级非替代已封口——纯收窄 (b)=把已知 defect 包装成宣称，静态分析 FP 处置惯例不支持；③锚表 (c) 在禁参照语料调参纪律下无合法构建来源＋gazetteer 覆盖天花板实锤。

## §2 分点结论

**2.1 分级先例**：presence→轻启发式→NLI 是收敛架构——NegEx(Chapman 2001)→ConText(Harkema 2009 JBI) 教科书先例「regular expressions…no syntactic or semantic analysis」，被 MetaMap 等直接集成；NLI 侧 ALCE/AutoAIS 是第二层标准形态但 CiteEval 批判其为 suboptimal proxy（context insufficiency、二值过粗）——**分层各司其职、NLI 不当 oracle**，与 D-059⑤ 完全同构。TianPan：NLI struggle with partial support/numerical/long spans——eval as signal not oracle。

**2.2 否定剥离有效性与失效模式**：NegDetector（中文临床 FSA）recall 0.9985/precision 0.9498——CJK 确定性先例直接成立。失效模式：①scope 误判（pseudo-negation 需第三张 cue 表，ACL W13-5635 三表结构）；②嵌套/复杂句式（DEEPEN/DepNeg：纯窗口在依赖复杂句 FP 偏高，句法层补=引入解析器代价）；③CJK 否定词表须独立（不/没/未/无/非，不能 port 英文表）。**收敛性改进非完备解**——治 FP 主类、有残留＋少量新 FP，须配分级披露。

**2.3 收窄 vs 剥离=互补非二选一**：静态分析 FP 处置分层=位置 suppression→规则 tuning→分析深度→宣称收窄；对「pattern rules without semantic understanding」同构 FP，工业答案=承认语义边界＋降低宣称非无限加规则。**presence-only 宣称下否定误判仍算 defect**——收窄解决 κ 判定口径，剥离解决承诺范围内的准确度（收窄答「承诺什么」，剥离答「承诺内做准」）。TIST 2607.20527：未命名 verifier 协议→unsupported rate 3-18% 不可比——**判定语义必须文档化命名**，直接支持③义务。

**2.4 kernel 边界**：(a)(b)(c) 合规（纯字符串处理）；(d) 违规（NLI=概率模型破 D-058＋校准集需新语料＋模型漂移破 golden＋不可重放破盖章语义）。

## §3 对比矩阵

(a) ③+①：kernel 合规／治 FP=13 显著／FN=12 披露归 human／确定性可重放／维护低（cue 表~30-50 词）／先例强（NegEx/ConText/NegDetector）=**推荐**；(b) 纯③：不治 FP=13、宣称外漂移=拒；(c) ①+②：锚表无合法构建来源＋冻结于构建日＋同义注入新攻击面=拒；(d) NLI：D-058 违规＋破可重放=拒。

## §4 #56 票面要素（推荐方向展开）

① 判定语义文档化：citation 盖章面明文「supports=presence-level 字面锚在场（否定/引语语境剥离后），非语义蕴含」——命名即判据（TIST 惯例）；② 启发式=三表结构（pre-negation cues／post-negation cues／**pseudo-negation 表**防误剥）＋CJK 独立词表（不/没/未/无/非）＋预声明窗口参数；③ 引语包裹模式表自设计（无现成 gazetteer 可移植——attribution 层接近物）；④ **fail-safe 默认**：检测不确定时保持原判定/宁 insufficient 勿误 supports（与 BAND 从严同向）；⑤ 测试纪律：held-out 分区建立（D-064⑤ F5 兑现）＋修复后 held-out 首跑复测＋禁参照 52a 语料标签调参；⑥ 披露义务：FN=12 语义缺口如实披露归 human-in-loop 级（D-053④ 明细义务面）；⑦ F6 对齐：票面分层枚举对齐 D-059⑤ 输出空间（supports/insufficient 二态，不加第三态——D-045 YAGNI 判例同）。

## §5 失败模式

(a)：scope 窗口误判（误剥真支持→新 FN）／嵌套引语转述双层／CJK 词表覆盖不全／伪否定词／剥离只治 FP 不治 FN——缓解=三表＋预声明窗口＋伪否定表＋fail-safe；(b)：宣称外漂移（用户仍把 supports 当语义支撑读）；(c)：锚表冻结＋同义注入攻击面＋维护沉没；(d)：校准集新语料工程＋不可重放破盖章＋模型漂移破 golden。

## §6 冲突排查

D-059⑤ ✅ 且是 (a) 的直接授权（拒的是 NLI 替代非层内增强）；D-058 ✅（确定性字符串处理）；D-061 ✅（先验设计＋held-out 复测可满足）但 (c)② 锚表违调参泄漏纪律；D-053 ✅（措辞收窄=盖章语义如实文档化，FN 披露落明细义务）；D-064 ✅（直接兑现 F5/F6）；D-045 ✅（不加第三态沿用 YAGNI 判例）。**零 revised**；(b) 若坚持须修订「语义边界缺陷」票面定性（不推荐）。

## §7 信息缺口

①NegEx 式窗口在审计短句域（非临床长报告）FP 率无直接基准——held-out 首跑实测＋预声明窗口参数；②引语包裹确定性先例少（更接近 attribution 层）——模式表须自设计；③「presence 层内加确定性否定剥离」组合效果无实测文献=工程惯例推断；④未来 NLI 层重开（#52b）校准协议借 2607.20527 gold-anchored+conformal 形态届时补调研。

**一句话裁定**：(a)——宣称文档化（presence-level 命名）＋三表确定性否定剥离（fail-safe 从严）＋held-out 复测＋FN 披露归 human 级。
