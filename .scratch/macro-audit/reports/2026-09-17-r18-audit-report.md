# 轮 18 执行审计报告 — T1(#57)＋T2(#56)（2026-09-17，审计窗口）

> 基点：07f5226（round17-closeout 顶）→ HEAD（psr 943f5cf＋workspace 6e22b65）。评审范围=lyq/wyo/vyr/zzo/psr 五提交，44 文件 +2730/−545。
> 方法：不信自述——硬验收全部亲跑；声明逐条实物抽查（fs/rg 等效）；$code-review 双轴（Standards + Spec）并行子代理取证后逐条复核；过程违规单独呈报。

## §1 硬验收复跑（亲跑，非采信）

| 件 | 报告自述 | 审计实测 | 结论 |
|---|---|---|---|
| npm run gen | GEN-OK | GEN-OK | ✅ |
| npx tsc | TSC_OK | exit 0 | ✅ |
| npm test smoke | 14 套件全绿 | 15 测试件全绿（smoke 6/6·collectors 14/14·codelore 7+41+25=73·report-preview 5/5·intake 40/40·gitcli 11/11·sql-literal 17/17·mcp-db 12/12·audit 26/26·demo 38/38·github-rest 55/55·narrative 34·citation 29） | ✅（「14 套件」口径=codelore 三件套并记，件数小差无害） |
| 56-check | 23/23 | exit 0，断言体 t()×23 实测 | ✅ |
| 52a-check | 22/22 | exit 0 | ✅ |
| 53-check | 25/25（C4 改名钉） | exit 0；C4 断言实物在（evidence_flag 全载＋旧名零残留含 skeleton.required_fields） | ✅ |
| 33-check | 16/16 | exit 0 | ✅ |
| 14/48/51-check | PASS | 14-skeleton/48/51 全 exit 0 | ✅ |
| 42/44/46/54/55-check | （T0 基线） | 全 exit 0 | ✅ |
| 23-first-report-check | 环境性 import FAIL | exit 1（ERR_MODULE_NOT_FOUND src/report/narrative.js——.ts 源动态 import .js specifier，非本票引入） | ✅ 与登记一致 |
| 38/39/40-check | 既有 FAIL 与轮17基线逐条一致 | 38=E3+H4（34/36）；39=E3/E4/F1/F3/F4/F5/H6/I2/I3（29/38）；40=G5（1/57）——全部落在 t8-watch-review §3 归因类（mw-trigger 已决 ALARM／jiahao workflow 被 D-046 撤除／任务书重写标记／anysearch-cli 外部仓脏+引用消耗） | ✅ 陈旧类，无本票面新增 |
| npm pack | 71 件 129.1kB | total files 71 / 129.1 kB / unpacked 599.3 kB | ✅ 逐字节一致 |
| cli selftest | ok=true 5/5 | ok=true 5/5 | ✅ |
| 真实仓测活 | audit env-manager exit 0（sidecar） | exit 0，sidecar JSON 合法（RCP-b545e0e9f2b0e5e8，两次连跑逐字节一致=确定性保持） | ✅（回执值漂移属正当——见 §6-P1） |

## §2 声明 → 证据 → 结论 对照表

### T1 #57（A-065）

| 声明 | 实物证据 | 结论 |
|---|---|---|
| F1 层序修回 ADR-0017③ 原文 | audit.ts SCALE_LAYER_ORDER=「Macro-C→Micro-A→Micro-B→Macro-A」起首、Macro-B 不入剩余漏斗；53-check B2b 断言原文前缀+ADR-0017 引用；audit.test S5 PASS | ✅ 属实（实现早于基点在 f3354ea，本票复核在案） |
| F8 四守卫补 noBom | 52a/53/54/55-check.mjs 均含 noBom 字节扫描 | ✅ 属实（同上随 r16fix 已修） |
| F9 吞旗拒收 | 实测 `--scale --json` → exit 2 + `AUDIT-ARGS: missing value`；audit.test E2 | ✅ 属实 |
| F10 空值守卫 5 处→结构化 insufficient | audit.ts:201＋demo.ts:206＋38-macro-c-preview.mjs:210/299/304＋39-macro-b-one-shot.mjs:285＋40-macro-b-one-shot.mjs:287 全部 `(x.length>0?[x[0].fact_id]:[])` 守卫形；活 .mjs 零裸取残余（F10 类） | ✅ 实质成立；⚠ 清点不完整——见 G3；行号引用有漂移（demo 实测 206 非 242；「38:」=38-macro-c-preview.mjs 非 38-check.mjs，简写歧义） |
| F11 改名全链 20 处＋判定式零改 | 活代码面 evidence_threshold_met 零残留（仅 23-first-report.mjs 冻结豁免 D-063＋53-check 断言字面量）；evidence_flag 36+ 处；generate.ts/audit.ts diff 纯标识符替换值式不变；14-skeleton-fields.json 同步；golden 三场景重基线 | ✅ 改名成立；⚠ 骨架契约版本未升——见 G2 |
| F15 mcp facts 复用 resolveFactsDb | mcp-server.ts:96 工具腿走 resolveFactsDb 三源链（arguments.db→serverConfig.db→env） | ✅ 属实（随 r16fix 已修，复核在案） |
| F13 Middle Man 内联＋registry 翻转 | demo.ts diff 净删 identity-alias 块（HEAD_SHA=probes.headSha 等约 20+ 别名行＋CollectedFact 死 import）；registry demo-cleanup-observe=discharged-decided；demo 38/38 O2 逐字节 PASS | ✅ 属实（D-064⑥ 顺带清触发面命中，sanctioned-extra 非 creep） |

### T2 #56（A-066）

| 声明 | 实物证据 | 结论 |
|---|---|---|
| ①语义边界文档化 | citation.ts 模块头 presence-level 明文＋PRESENCE_LIMITS 四键（semantics/output_states/fn_disclosure/adversarial_fp_guard）＋supports reason 文案「非语义蕴含」；citation.test J1 | ✅ 属实 |
| ②三表确定性否定剥离＋CJK 独立词表＋预声明窗口 | EN_PRE/POST/PSEUDO＋CJK_PRE/POST/PSEUDO 六表实物在；CJK 为中文词形独立表（不/没/未/无/非/否/别/莫/勿/毋/缺乏/否认…伪否定表 不得不/非常/无疑/未必不/无缝…），非英文 port；NEG_WINDOW_PRE=60/POST=40/ATTRIBUTION_TAIL=80/SPEECH_LOOKBACK=24 全 export | ✅ 成立；⚠ EN 表混入非否定 cue（'for example'/'e.g.'/'suppose'/'hypothetical'/'in theory'/'below'/'other than' 等假想/比较语境）→context_flags 输出 'negated:' 标签名不副实——O2 观察项 |
| ③引语包裹模式表自设计 | QUOTE_PAIRS（直/印刷/CJK 角引成对）＋isClauseLike（多词句/双语长句/句读终结/≥6CJK，单词恒术语不剥） | ✅ 属实 |
| ④fail-safe 从严 | 悬挂直双引号歧义→全篇掩蔽；悬挂 CJK 开号掩蔽至文末/闭号掩蔽文首；裁决标签位（cue+':'非内容锚）；=赋值豁免（citation.ts:285-288）；SPEECH_BOUNDARY 大小写不敏感缺省→过掩蔽方向（从严 benign） | ✅ 属实 |
| ⑤held-out 分区＋首跑＋禁调参 | 56-checker-heldout-corpus.json 53 件 12 分层独立文件（corpus_id=56-checker-heldout-v1，disclosure 明记与 52a 分区存管+只评一次）；eval contract_floor=1.0 预声明；52a 语料文件本 diff 零触碰（sha 指纹面完好）；首跑 contract 48/48+disclosed_fn=5+violations=0+two_state_only=true | ✅ 属实；⚠ 方法学提醒——gold 由实施者同日设计期标注（intra-rater 口径已披露），「独立」强度以披露为限——O5 |
| ⑥FN 披露归 human-in-loop | disclosed_fn=5 条逐条 note；PRESENCE_LIMITS.fn_disclosure 机读；52a FN 12→13（+1=52a-011 cue 附着歧义披露不硬解） | ✅ 属实 |
| ⑦二态维持 | SupportRelation='supports'\|'insufficient' 联合型；eval two_state_only=true；无第三态引入 | ✅ 属实 |
| 52a 复测数值 | eval-results.json：fp=0（13→0）/fn=13/κ_all=0.7108≥0.6/κ_nonadv=0.9703/band 12/12+干净 FP 0/6/intra-rater=1.000；post_repair 注记在 | ✅ 逐数一致 |

## §3 D-xxx 逐条核对

| D | 要求 | 证据 | 结论 |
|---|---|---|---|
| D-064① | 修 6 单票＋重跑清单（53-check B/C＋audit.test＋npm test＋33-check） | F1/F8/F9/F15 随 f3354ea 已修复核在案；F10/F11/F13 本票净增全落；重跑清单全绿 | ✅ |
| D-064⑥ | F13 观察项顺带清 | demo.ts 内联＋registry 翻转 discharged-decided | ✅ |
| D-063 | 23-first-report.mjs 冻结豁免 | 旧名仅残存该冻结件＋断言字面量，活面清零 | ✅ |
| D-065 ①~⑦ | 见 §2 T2 七行 | 全要素实物在 | ✅（O2/O5 观察） |
| D-064⑤ | held-out 分区＋分离存管＋首跑 | 独立语料文件＋eval 脚本＋结果 JSON 三件套 | ✅ |
| D-058 | kernel 纯字符串处理禁 NLI/概率 | citation.ts 全文零 import/require，纯正则+子串 | ✅ |
| D-059⑤/D-045 | 二态不加第三态 | 联合型＋eval two_state_only | ✅ |
| D-053④ | FN 明细披露义务归 human-in-loop | disclosed_fn 明细＋PRESENCE_LIMITS | ✅ |

## §4 双轴评审（$code-review，并行子代理＋审计复核）

### Standards（11 项，审计复核后）
- **defect 级**：56-check.mjs F2——`nb` 混入裸相对名（4/6 件）与 `join(REPO,…)` 绝对径并列；按文档化调用（仓根 `node .scratch/.../56-check.mjs`）相对名不存在→`!existsSync`→**vacuous pass**，noBom 对 4 件从未触发（应 `join(HERE,…)`）。**复核属实**——审计已独立验证 4 件实物无 BOM，故为守卫弱化非产品缺陷。→ G1
- 软标准：A-ledger R10 头「T2→A-066 随落地补」括注已过期（行已填）；轮 18 四条过程教训未 append 进 WORKFLOW §4（惯例面）。→ O6/O7
- 基线气味（判断级，全部复核成立）：守卫式 `(x.length>0?[x[0].fact_id]:[])` ×6 重复（standalone 脚本惯例部分豁免）；EN 否定表混入假想/比较 cue 致 flag 名实不符（同 Spec#7）；citation.ts:358 `hay.indexOf(needle)<0` 死条件（pos===-1&&negCues===0 蕴含恒真）；closers Map 值未读（Set 即可）；enCuesIn/substrCuesIn 签名不对称；citation.test.mjs 用 assert 风格偏离屋`t(name,ok)`惯例（输出面兼容故危害低）；SPEECH_BOUNDARY 大小写敏感→过掩蔽（fail-safe 方向 benign）；checkAllCitations 每 claim 重跑 stripContexts+pseudoSpansOf（可 memo）；56-check B2 名「九类+」实断 12 分层。→ O2/O8
- 「52a instrument.note 无语义层」经复核**非陈旧**——修复后仍无语义层（确定性字符串处理），描述如实，撤销该项。

### Spec（7 项，审计复核后）
- (a) F10 同型清点不完整：38-check.mjs:47/48/49/52 四处 `metric('…')[0].value_json` 裸取残留（空集→TypeError 非结构化 FAIL，同类崩溃面；守卫侧 fail-loud 危害低于产出侧）。**复核属实**。→ G3
- (a) F1/F8/F9/F15 不在本 diff（基点前 f3354ea 已落）——实物面审计独立验证全部在架，属「随修复核」口径，非缺项。
- (a) held-out gold=实施者同日标注（intra-rater 口径已如实披露）。→ O5
- (b) F13 属 D-064⑥ sanctioned-extra，非 creep；52a-eval-results.json 原地覆写（基线仅存 git 史+post_repair 注记——惯例面可接受，注记面提醒）。→ O4
- (c) **契约改名不升版**：C2 required_fields 内 `verdict_gate.evidence_threshold_met→evidence_flag` 改名，而 REPORT_SKELETON_VERSION 停 1.1.0＋14-skeleton-fields.json schema_version 停 1.1.0；本仓明文规则（A-064 C9）「升版触发点=字段删除/改名/语义翻转时」——改名即触发点。「0.y.z 零兼容税」只覆盖包 semver 轴不覆盖骨架契约轴。**复核属实——本票未升版亦未落账本勘误注记**。→ G2
- (c) 否定表超「否定」名义塞入非否定 cue——同 Standards 复核。→ O2

## §5 打回项（返工小修包——审计窗不动手修）

| 项 | 缺陷 | 修复要求 | 重跑清单 |
|---|---|---|---|
| **G1** | 56-check.mjs F2 vacuous noBom（4/6 件从未实检） | `nb` 四裸名改 `join(HERE,…)`；断言须先 `existsSync` 全真再扫 BOM（缺文件应 FAIL 非跳过） | 56-check exit 0＋注入 BOM 红证一次（负向验证守卫真触发） |
| **G2** | 骨架契约改名未升版（违 A-064 C9 触发点） | 二选一：① REPORT_SKELETON_VERSION→1.2.0＋14-skeleton-fields.json schema_version 同步＋CHANGELOG/账本注记；② 若裁定沿「零兼容税」不升版，须账本勘误注记明示理由（写清骨架轴与包 semver 轴区分）——不得沉默 | npm test＋14/48/51/53-check 全绿＋账本注记落盘（选②时） |
| **G3** | F10 同型清点漏守卫侧（38-check.mjs:47/48/49/52 四处 metric()[0] 裸取） | 补守卫转结构化 FAIL，或在 BACKLOG/账本补「守卫侧 fail-loud 不清点」的明示豁免理由；另 demo.ts 行号引用勘误（242→206）、「38:」简写消歧（=38-macro-c-preview.mjs） | 38-check  FAIL 面不扩大（仍 E3/H4 陈旧类）＋清点注记落盘 |

## §6 过程呈报（不替执行窗追认）

- **P1 env-manager 回执声明时点**：T1 阶段（r18-fix-57，citation.ts 未改）跑 audit 得 RCP-e0ab92dca215a66d 与 r16 同 receipt——该时点口径可成立（digest 输入面彼时未变）；但 T2 落地后 context_flags 加法字段进 digestInput，终态实测 RCP-b545e0e9f2b0e5e8（两次连跑逐字节一致=确定性保持）。「与 r16 同 receipt」仅 T1 时点为真；round18-report 验收矩阵未复述回执值只写 exit 0+sidecar——无伪声明，但 BACKLOG/账本/handoff 的回执行未加注「T2 后正当漂移」时点限定，读者易误读为终态仍同。→ 建议随 G3 注记一并补时点限定。
- **P2 报告行号/计数漂移**：「demo.ts:242」（实 206）、「38:299,304」简写歧义、「5 处」vs 实 7 守卫位——文书精度瑕疵，实质无缺。
- **P3 「14 套件」口径**：实 15 测试件（codelore 三件套并记）。计数口径无碍结论。
- **纪律面核查通过**：分支栈 r18-fix-57→r18-fix-56 独立不越权；未 push（T5 用户闸门）；写盘文件全 BOM-clean；52a 标定语料本 diff 零触碰（调参泄漏面完好）；过程教训四条自呈报与 diff 实物吻合（`/s+/` 错裂、否定义动词误入 speech 表、isClauseLike 过剥、悬挂引号歧义——均可从当前实现形态反证真实经历）。

## §7 裁决

**打回小修（3 项 G）**——主体验收实质成立（硬验收全绿复现＋F 项/D-065 全要素实物在＋双轴无 spec 漏项），但 G1 守卫空转、G2 契约版本纪律违例、G3 清点不完整三项须返工后重跑 §1 同一套验收（重点：56-check 红证、14/48/51/53-check、npm test）。G2 含裁定成分（升版 vs 勘误注记）可呈用户/grill 定向。

审计通过口径：G1~G3 闭环＋重跑绿 → 补「通过」章并生成交接；本窗只出报告。

## §8 下一 grill 方向指示

- R18-Q1 候选：骨架契约版本纪律执行面——「升版触发点」规则是否需守卫钉（14-check 加版本↔字段 diff 联动断言）？
- R18-Q2 候选：presence-level 语境剥离 cue 表语义分层——假想/比较语境与否定语境是否应分表分 flag kind（'negated:' vs 'hypothetical:'/'comparative:'），名实对齐判据如何定？


## §9 复审章（返工包 rxt/xwk 复跑——2026-09-17 二跑，审计窗口）

> 基点扩展：07f5226→HEAD（含 r18-rework 栈 rxt d65cfbb 代码面 / xwk 244e482 行政面；38 文件 +535/−337；未 push）。.code-tmp/r18-audit/* 为审计窗 scratch 未并入。

### 打回项复核

| 项 | 复核结果 | 结论 |
|---|---|---|
| G1 56-check F2 空转 | 71-72 行 nb 全 `join(HERE/REPO,…)`＋existsSync 前置（缺文件=FAIL）；审计亲注 BOM 红证：FAIL F2 `bom:…heldout-eval.mjs`→exit 1（22/23），字节级还原后 PASS 23/23——守卫真触发实证 | ✅ 闭环 |
| G2 骨架契约未升版 | REPORT_SKELETON_VERSION='1.2.0'＋14-skeleton-fields.json schema_version 同步 1.2.0＋audit.test J2 钉 1.2.0＋09-stale-check 改「proposal applied@1.1.0 且 current≥proposal」语义钉（历史提案记录不改写）＋48/38/39/40 四脚本改 G.REPORT_SKELETON_VERSION 常量引用（防下次升版再断）＋golden 三场景+48 工件重基线；A-067 账本注记明记「0.y.z 零兼容税只覆盖包 semver 轴，骨架契约轴按 C9 升版」 | ✅ 闭环 |
| G3 F10 清点不完整 | 38-check.mjs:47/48/49/52 四处 metric(...)[0] 转 length>0 守卫＋detail null-safe；38-check FAIL 面 34/36→35/36 收窄（仅 E3 陈旧类残留；H4 因外部仓转净转绿）无新增 | ✅ 闭环 |

### 顺带项复核

- O2 cue 表名实对齐：假想/示例词拆 `EN_NON_ASSERT_CUES` 独立表（15 词），flag kind 三段 `negated`/`non-asserted`/`verdict-label`，模块头 flag 词表文档化；剥离机制恒等仅标签改名（held-out 48/48、52a FP=0 κ=0.711 复测不变——实测 56/52a-check 均绿）| ✅
- O5 披露强化：held-out corpus disclosure 补「标注者即本票实施者同日完成，非独立双标，独立性强度以此披露为限」| ✅
- P1/P2/P3 文书勘误：round18-report §返工包节＋exec-handoff/BACKLOG 回执时点限定（T1=e0ab…→终态=b545e0e9f2b0e5e8）；F10 枚举扩为产出面逐条＋守卫侧 4 位；「14 套件」→「15 测试件」 | ✅
- 过程合规：本审计报告被 xwk 行政提交原样留档（diff 零删行）——审计工件完整性保持；未 push；scratch 未并入 | ✅

### 复跑矩阵（复审亲跑，同 §1 套）

gen GEN-OK｜tsc exit 0｜npm test 15 件全绿（audit 26/26·demo 38/38 O2·citation 29）｜56/52a/53/33/14/48/51/42/44/46/54/55/09-stale 全 exit 0｜38=35/36（仅 E3 陈旧类）｜39=30/38（陈旧类）｜40=1/57（陈旧类）｜23 env-FAIL 不变｜npm pack 71 件 129.5kB｜selftest ok=true 5/5｜env-manager audit exit 0 RCP-b545e0e9f2b0e5e8（复跑逐字节一致；O2 flag 改名未触 env-manager 语料，digest 不变属正当）

### 终裁

**审计通过**。T1(#57)＋T2(#56)＋返工包（G1-G3＋O2/O5＋P1-P3）全链闭环，重跑同套验收全绿。

残余观察项（判断级，不阻断）：守卫式 `(x.length>0?[x[0].fact_id]:[])` 重复 6+ 处（standalone 惯例部分豁免）；citation.ts:358 死条件；closers Map 值未读；enCuesIn/substrCuesIn 签名不对称＋checkAllCitations 每 claim 重剥离（可 memo）；citation.test.mjs assert 风格偏离屋 t() 惯例；52a-eval-results.json 原地覆写（基线靠 git 史）；R10 头括注陈旧；WORKFLOW §4 未 append 本轮教训。建议随下一维护票顺带清或登记观察位。
