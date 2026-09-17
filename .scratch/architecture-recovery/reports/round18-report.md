# round18 执行报告 — 轮 18 常驻任务书 T1(#57 F 项修复 P0)＋T2(#56 checker 语义边界 P1)（2026-09-17）

> 触发：.scratch/macro-audit/handoffs/next-round.md 轮 18 任务书；D-064①（F 项处置表）＋D-065（#56 方向=③+①）。
> 分支栈：round17-closeout → r18-fix-57（lyq 代码面 / wyo 行政面）→ r18-fix-56（vyr 代码面 / zzo 行政面）。未 push。

## T1 #57：轮16审计 F 项修复（6/6 落地）

| F 项 | 修复 | 机检 |
|---|---|---|
| F1 层序串 | audit.ts layer_order 修回 ADR-0017③ 原文（Macro-C→Micro-A→Micro-B→Macro-A，Macro-B 已上架不回插） | 53-check B 面断言层序原文＋audit.test S5 |
| F8 noBom | 52a/53/54/55-check 补 noBom 扫描面 | 各守卫 F 面 PASS |
| F9 吞旗 | CLI 旗标值双横线前缀拒绝（--scale --json → exit 2 AUDIT-ARGS missing value 结构化） | audit.test E2 |
| F10 空值 | pc1AdrFacts 等 [0] 裸取同型守卫——活代码面：audit.ts:201,202,206／demo.ts:206,207,211／38-macro-c-preview.mjs:299,304／39-macro-b-one-shot.mjs:285,286,290／40-macro-b-one-shot.mjs:287,288,292（pc1/pc2Lag/nc1Facts 同型扩展）；守卫侧：38-check.mjs:47,48,49,52（r18 审计 G3 返工补）；23-first-report.mjs 冻结豁免（D-063） | audit/demo 测试＋38/39/40 守卫 |
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
| npm test | 15 测试件全绿：gen+tsc+smoke（audit 26/26·demo 38/38 O2 逐字节·narrative 34·citation 29/29 新增·github-rest 55/55·mcp-db 12/12·intake 40/40·sql-literal 17/17·gitcli 11/11·codelore 73·collectors 14·report-preview 5） |
| 56-check | 23/23 |
| 52a-check | 22/22（E1 复测基线） |
| 53-check | 25/25（C4 改名钉） |
| 33-check | 16/16 |
| 14/48/51-check | PASS（skeleton 契约/产物重跑） |
| 23-first-report-check | 既有环境性 import 解析失败（源 .ts 动态 import .js specifier——非本票引入，登记不扩大） |
| 38/39/40-check | 既有环境性 FAIL 与轮17基线逐条一致（jiahao/anysearch-cli/next-round 记录面，不扩大修复） |
| npm pack | 71 件 129.1kB（unpacked 599.3kB） |
| cli selftest | ok=true 5/5 |
| 真实仓测活 | audit /d/Aworker/env-manager --scale Macro-B --json exit 0（sidecar 输出）；回执时点：T1 时点（citation.ts 未改）RCP-e0ab92dca215a66d 与 r16 同值；T2 context_flags 进 digestInput 后终态 RCP-b545e0e9f2b0e5e8（两次连跑逐字节一致=确定性保持，属加法字段正当漂移） |

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

## 轮 18 审计返工包（2026-09-17 r18-audit 打回小修 G1-G3＋过程呈报）

> 审计裁决：打回小修 3 项（主体验收实质成立）。报告：.scratch/macro-audit/reports/2026-09-17-r18-audit-report.md

| 项 | 缺陷 | 修复 | 复跑 |
|---|---|---|---|
| G1 | 56-check.mjs F2 vacuous noBom（4/6 裸相对名仓根调用下不存在→跳过） | nb 全改 join(HERE/REPO,…)＋existsSync 前置（缺文件=FAIL 非跳过） | 56-check 23/23；BOM 注入红证 FAIL F2（bom:…eval.mjs→22/23 exit 1），还原复绿 |
| G2 | 骨架契约改名未升版（违 A-064 C9 升版触发点=字段改名） | REPORT_SKELETON_VERSION 1.1.0→1.2.0＋14-skeleton-fields.json schema_version 同步；09-stale-check 语义钉改「proposal applied@1.1.0 且 current≥proposed」（历史提案不改写）；48-micro-a-preview.mjs 断言/fixture 改 G.REPORT_SKELETON_VERSION 常量引用；audit.test J2 钉 1.2.0；golden 三场景重基线 | npm test 15 件全绿（audit 26/26）＋14/48/51-check 全 PASS＋09-stale-check 15/15 |
| G3 | F10 同型清点漏守卫侧（38-check.mjs:47/48/49/52 四处 metric()[0] 裸取） | 四处转 length>0 守卫＋detail 字段 null-safe | 38-check FAIL 面收窄——E3 单项陈旧类残留（mw-trigger-b ALARM 登记后不再触发=环境性），H4 转绿；无本票新增 |
| O2 | EN_PRE_NEG 混入假想/示例 cue（for example/hypothetical 等）→flags 输出 negated: 名不副实 | 拆 EN_NON_ASSERT_CUES 表（假想/示例/假设语境标记 15 词）＋flag kind 三段名实对齐：negated（否定窗）/ non-asserted（非断言语境）/ verdict-label（裁决标签位）；模块头 flag 词表文档化 | held-out 复跑 contract 48/48、disclosed_fn=5 不变；52a 复测 FP=0/κ=0.711 不变（剥离行为恒等仅 flag 名改） |
| O5 | held-out gold 系实施者同日标注 | corpus disclosure.note 补「标注者即本票实施者同日完成，非独立双标，独立性强度以此披露为限」 | 56-heldout-eval.json sha 绑定重生成 |

过程呈报勘误（P1-P3）：
- P1 回执时点限定已补（本表验收行＋BACKLOG＋handoff）
- P2 行号勘误：demo.ts:242→206；「38:」简写消歧=38-macro-c-preview.mjs（非 38-check.mjs）；F10 守卫位逐条枚举见 §F10 行
- P3 npm test 计数勘误：14 套件→15 测试件（codelore 三件套并记）
