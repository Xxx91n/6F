# round18 执行报告 — 轮 18 常驻任务书 T1(#57 F 项修复 P0)＋T2(#56 checker 语义边界 P1)（2026-09-17）

> 触发：.scratch/macro-audit/handoffs/next-round.md 轮 18 任务书；D-064①（F 项处置表）＋D-065（#56 方向=③+①）。
> 分支栈：round17-closeout → r18-fix-57（lyq 代码面 / wyo 行政面）→ r18-fix-56（vyr 代码面 / zzo 行政面）。未 push。

## T1 #57：轮16审计 F 项修复（6/6 落地）

| F 项 | 修复 | 机检 |
|---|---|---|
| F1 层序串 | audit.ts layer_order 修回 ADR-0017③ 原文（Macro-C→Micro-A→Micro-B→Macro-A，Macro-B 已上架不回插） | 53-check B 面断言层序原文＋audit.test S5 |
| F8 noBom | 52a/53/54/55-check 补 noBom 扫描面 | 各守卫 F 面 PASS |
| F9 吞旗 | CLI 旗标值双横线前缀拒绝（--scale --json → exit 2 AUDIT-ARGS missing value 结构化） | audit.test E2 |
| F10 空值 | pc1AdrFacts 等 [0] 裸取 5 处活代码守卫（audit.ts:201/demo.ts:242/38:299,304/39:285/40:287）→结构化 insufficient；23-first-report.mjs 冻结豁免（D-063） | audit/demo 测试＋38/39/40 守卫 |
| F11 改名 | evidence_threshold_met→evidence_flag 全链 20 处（判定式零改动；骨架契约/渲染/audit/demo/5 活 .mjs/14-skeleton-fields.json/golden 三场景） | 53-check C4（新字段布尔＋旧字段零出现） |
| F15 复用 | mcp facts 调试腿复用 resolveFactsDb 三源链 | mcp-db 12/12 |
| F13 顺带 | demo.ts ~34 行 identity-alias Middle Man 内联＋CollectedFact 死引用清除（D-064⑥ 观察项） | demo O2 golden 逐字节恒等；registry→discharged-decided |

## T2 #56：checker 语义边界修复（D-065 全要素）

**语义边界文档化**（citation.ts 模块头＋PRESENCE_LIMITS 机读常量）：
- supports = presence-level 字面锚在场判定（语境剥离后逐字命中），**非语义蕴含**
- 输出空间恒二态 supports/insufficient（D-059⑤/D-045，不加第三态）

**确定性语境剥离**（纯字符串处理，kernel 禁 NLI/概率模型 D-058）：
- 三表否定剥离：EN_PRE/EN_POST/EN_PSEUDO＋CJK_PRE/CJK_POST/CJK_PSEUDO 六表；CJK 独立词表（不/没/未/无/非/否/别/莫…）非 port 英文表
- 预声明窗口：NEG_WINDOW_PRE=60/NEG_WINDOW_POST=40/ATTRIBUTION_TAIL=80/SPEECH_LOOKBACK=24（全部 export 常量）
- 引语包裹模式表自设计：成对引号（直引号/印刷引号/CJK 角引）×剥离条件=归属 cue 前置或语句形态（isClauseLike：多词句/双语长句/句读终结/≥6CJK——单词词组含长 snake_case 键名恒为术语不剥）
- 归属引导段（据称/according to/they claim 等）＋言语子句剥离（speech cue→句读/转折边界或 TAIL，无引号归属同捕）
- fail-safe 从严：悬挂直双引号开闭歧义→全篇掩蔽；悬挂 CJK 开号→掩蔽至文末；悬挂 CJK 闭号→掩蔽文首至此；cue 词裁决标签位（X: 标签非内容锚）；=赋值豁免（allow=never 配置取值非主张否定）
- 伪否定豁免：not only/no doubt/nothing but/不得不/非常/无疑/未必不 等覆盖区 cue 作废
- context_flags 加法字段机读明细（negated/context-stripped/quoted/attributed/speech-quoted/unbalanced-quote/verdict-label/absent）

**held-out 分区首跑**（D-064⑤ F5——独立于 52a 标定语料，禁参照其标签调参）：
- 56-checker-heldout-corpus.json：53 件十二分层（positive/neg-pre/neg-post/pseudo/CJK/quoted/term-quoted/unbalanced/fn-paraphrase-disclosed/attachment-ambiguous-disclosed/ungrounded），gold=人类语义标签，disclosed 层如实承载 presence-level 与人类语义错位
- 首跑结果：**contract 48/48（100%）＋disclosed_fn=5＋violations=0＋two_state=true**

**FN 披露归 human-in-loop**（D-053④）：改写/同义语义在场但字面锚缺席者如实判 insufficient 不硬解（PRESENCE_LIMITS.fn_disclosure＋56-heldout-eval disclosed_fn 块）；cue 附着歧义（浅仓拒绝类=否定 cue 与锚同句但语义不互否）同披露

**52a 修复后复测**（只测不调纪律维持，eval 加 post_repair 注记）：
- **FP 13→0**（对抗否定/引语面全修复）／**FN 12→13**（+1=52a-011 cue 附着歧义，如实披露不硬解）
- **κ_all 0.455→0.711** 过预声明 0.6 地板／κ_nonadv 0.970／band 12/12／intra-rater 1.000
- 52a-check E1 复测基线：FN 类披露维持＋FP 改善方向钉（≤13 或清零）＋post_repair 注记断言

## 验收矩阵（全绿）

| 件 | 结果 |
|---|---|
| npx tsc | TSC_OK |
| npm test | 14 套件全绿：gen+tsc+smoke（audit 26/26·demo 38/38 O2 逐字节·narrative 34·citation 29/29 新增·github-rest 55/55·mcp-db 12/12·intake 40/40·sql-literal 17/17·gitcli 11/11·codelore 73·collectors 14·report-preview 5） |
| 56-check | 23/23 |
| 52a-check | 22/22（E1 复测基线） |
| 53-check | 25/25（C4 改名钉） |
| 33-check | 16/16 |
| 14/48/51-check | PASS（skeleton 契约/产物重跑） |
| 23-first-report-check | 既有环境性 import 解析失败（源 .ts 动态 import .js specifier——非本票引入，登记不扩大） |
| 38/39/40-check | 既有环境性 FAIL 与轮17基线逐条一致（jiahao/anysearch-cli/next-round 记录面，不扩大修复） |
| npm pack | 71 件 129.1kB（unpacked 599.3kB） |
| cli selftest | ok=true 5/5 |
| 真实仓测活 | audit /d/Aworker/env-manager --scale Macro-B --json exit 0（sidecar 输出） |

## 过程教训（机检修复环）

1. **模板字面量转义面**：ctx_execute 写源码时 \n/\s/\b/\u 经两层模板层→真换行/字符吞入（regex 断行、split(/s+/) 错裂为字面 s、\u4e00 落为字面 一）。教训=写后回读断言正则形态（本次 /s+/ 造成 golden 4 翻转由 demo O2 逐字节网住）
2. **双角色词表冲突**：denied/disputes 类否定义动词误入 speech 表→掩蔽 cue 词本体致后置否定失效（was denied→supports 漏网）；否定义动词退出 speech 表留否定 cue 表执职
3. **术语引号过剥**：isClauseLike 初版 len≥10 单词即剥→JSON 键名（fact_count 等）被误作语句引语；修为多词句/双语长句/句读终结/≥6CJK 四类条件，单词恒为术语
4. **悬挂直双引号开闭歧义**：首版按开号处理掩蔽至文末致歧义侧漏；修为歧义→全篇掩蔽（fail-safe 从严）

## 残余披露

- **改写/同义 FN 类**：字面锚缺席即判 insufficient——语义召回缺口归 human-in-loop 复核（PRESENCE_LIMITS.fn_disclosure 机读）
- **cue 附着歧义**（52a-011 类）：窗内 cue 无法解目标附着（浅仓拒绝=拒绝为事件内容非锚否定）→从严 insufficient 披露，不硬解
- **无引号第一人称归属**：「本报告称/our report states」类一手归属超出第三方引语表范围——残余 FP 披露面（presence-level 如实承载）
- CJK '称/说' 伪言语豁免表为白名单词形（名称/简称/小说/不得不说…），未覆盖词形从严掩蔽（fail-safe 方向）
