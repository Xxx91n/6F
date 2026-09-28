# 2026-09-28 轮41 R40-T1 执行批 — 审计报告（审计窗）

> 审计对象 = r40-t1-exec 栈五件实施 commit（skt=64f0ae74 B批 / tml=6d62d16a A批 / yms=50af6812 C批 / rus=68f35d2a E批 / kny=7611f481 生成物）＋簿记 8c5834c4；fixed point = r40-closeout 顶 a9e4ee00。
> 被审件 = `.scratch/macro-audit/reports/2026-09-28-r40-t1-exec-report.md`；任务书 = `.scratch/macro-audit/handoffs/next-round.md` §T1（A~E）。
> 裁定面 = D-158／D-159／D-160／D-161②④／D-162③⑤⑥；纪律面 = D-139／D-140②／D-144①／D-145①／D-148②③／D-161④；守卫判据 = D-149④ 升格后形态＋D-159 tier/skip 新语义。
> 方法 = 不信自述：硬验收全部亲跑＋逐声明实物抽查（字节级 diff、`diff -w` 剥离机械面、键集比对、合成源谓词变异探测）＋$code-review 双轴并行子代理。审计窗只出报告不动手修。

## 结论：有条件通过（conditional PASS——两项必修回炉后确认）

硬验收 11 项全绿亲跑复现、裁定面五批逐项兑现且实物精确对应、commit 三栏位 trailer 形态全生效、未动他 agent 工作面（48-*/56-heldout/codebuddy-r38 残件原样未入批）。**但两项必修**：

- **F-2（实质规格未闭环，F-A1 同族残余二次发生）**：`blankStrings`（check-kit.mjs:74-84）对 `'…'`/`"…"` 字符串**原样保留**（仅遮罩模板字面量体）→ `'…stripComments(x)…'` 字符串内调用形态仍命中 callForm 获豁免——D-158①「字符串内提名不豁免」只封死模板字面量半边；且自相矛盾：模板文本 `` `pre stripComments(x) post` `` 不豁免、`'stripComments(x)'` 反而豁免（审计变异探测实证）。fxStringNom 载荷 `'stripComments 字符串提名'` 无 `(` 天然测不出此洞——「回滚即红」对 mask 失效类盲区。check-kit docstring、CONTEXT:365、ADR-0024:43「字符串提名不计」因此再度承诺超实现。
- **F-1（过程违规）**：大范围机械重缩进搭车语义 commit 且报告未披露——64f0ae74 内 `33-gate-registry.json` 整文件 4sp→2sp（diff 3558 行、有效语义仅 46 行）；6d62d16a 内 `75a-census-register.json`/`75a-census-findings.json` 1sp→2sp（register diff 8329 行、有效 369 行≈41×recheck_log）。违 AGENTS.md「格式化-only／机械重缩进禁搭车语义 commit——须独立 format commit 先行，大范围 reformat 登记 `.git-blame-ignore-revs`」；全仓实测无该文件。

## 1. 硬验收重跑（审计窗亲跑，全数复现）

| 验收项 | 报告声明 | 审计实跑（`env -u NODE_OPTIONS`） | 判定 |
|---|---|---|---|
| engine build | BUNDLE-OK dist/cli.js | `npm run build` → tsc + BUNDLE-OK dist/cli.js | 属实 |
| check-dist | PASS 263151B/cap 289395B | DIST-RATCHET PASS 263151B/289395B（margin 26244B≈25.6KiB） | 属实（字节数一致） |
| selftest | ok:true checks 5/5 | `npm run selftest` → ok:true checks 5/5 pass | 属实 |
| guard-all-run 全量 | ran=60 green=59 skipped=0 red=1 registered=1 problems=0 allOk=true | 逐件复现：red=01-check.mjs(D1,D5)⊆kr-01 册；60 件枚举含 xfail-run | 属实 |
| 75a-check | PASS 14/14 findings=389 | PASS 14/14 findings=389；S2 读数 hit/comment/stringNom=true、import/call=false 逐位同 | 属实 |
| 33-check | PASS 31/31；68项/47事件；ALARM 1 | 同（ALARM=readme-ci-badge 存量；三件新登记 BOUND 行在） | 属实 |
| xfail-run | PASS entries=0/10 | 同 | 属实 |
| 37/39/46 | 41/41、28/28、30/30 | 同（37 含 E4 实测值行；39 J 组链测绿；46 E2 报告节在） | 属实 |
| 01-check | FAIL 2（D1/D5 册内诚实保留） | FAIL D1/D5 exit 1（kr-01 语料面在册） | 属实 |
| SKIP 路径实证 | GUARD-RESULT:SKIP …reason=env-missing:* exit 0 | `GUARD_SIBLING_ROOT=D:/nonexistent-path-xyz node 37-check.mjs` → SKIP 三态复现 | 属实 |
| 语法全扫 | node --check all clean | 60 件均可执行（单件跑通即证） | 属实 |

## 2. 声明→证据→结论 对照表（报告 §二 逐条）

| # | 报告声明 | 审计证据 | 结论 |
|---|---|---|---|
| B1 | `_lib/env-contract.mjs` 新立：GUARD_SIBLING_ROOT 默认 D:/Aworker＋siblingPath＋envProbe＋goose-duck-agent→eys 映射；禁 sibling 清单进仓 | 文件实物在（29 行）；SIBLING_DIRS 四键含 eys 映射；边界注记齐 | 属实（伴生缺陷见 F-4：注释整体 \uXXXX 转义不可读） |
| B2 | check-kit：GUARD_TIERS 词表＋guardSkip/guardDeclaredTier/guardDeclaredSurface | 四符号导出在案（check-kit.mjs:52,57,65,66） | 属实但弱化——三解析件零消费者（75a 内联同款正则，「共用」注释不实；F-5） |
| B3 | 60 件守卫自声明：57 portable＋3 env-contract（37/39/46）；xfail-run 形态修正 | 枚举 `*-check.mjs + xfail-run.mjs`=60，tierMap 实数 57/3 精确；xfail-run 带 TIER+册内 tier 注记 | 属实 |
| B4 | guard-all-run：SKIP 三态解析＋skipped 独立计数＋不进 allOk＋册件转 SKIP 只 WARN | 码证 :36-37 解析、:41-42 三集分离、:56 册件转 SKIP→WARN continue、:71-72 footer 计数+reason、allOk=fail==0&&skipSet==0；判定行=fail==0（skip 不绊门不折 pass） | 属实（一角见 F-6） |
| B5 | 37/39/46 envProbe 启动探测；sibling 在但漂移→方言披露（WARN 语义）不 FAIL | 三件 envProbe/need 接线在案（37:16/39:23/46:23）；**漂移披露面仅 37 有实质 WARN/NOTE 行（:49-86 C1/C2b/C3 退化型）；39 头注自称该面但全文零实现行（注释超实现）；46 连声称都无——sibling 漂移在 39/46 仍硬 FAIL** | 半兑现（弱化见 F-7） |
| B6 | 01-check 自指绝对路径→repo-relative（kr-01 env 缺陷面关账，语料红面维持） | `R = dirname(fileURLToPath(import.meta.url))` 在案；kr-01 lifecycle_log 增 env-defect-closed 条（ref D-159④）且册不摘——D1/D5 红面维持 | 属实 |
| B7 | 11 件非 check `.mjs` `D:/` 字面收敛 | 实数=11（01-align/01-extract/01-spotcheck/02-adr-header-scan/18-failure-demo/31-codelore-probe/37-probe/38-macro-c-preview/39-macro-b-one-shot/48-micro-a-preview/51-macro-b-behavior）；现网非 check .mjs `D:/` 字面=0 | 属实（精确命中） |
| B8 | registry env-gated 条目＋env-contract-tier-active 事件；CONTEXT 词条；CHANGELOG M-027 | registry item env-gated-guard-class（guards=[37,39,46]、status decided、verify_method 指 75a-T3）＋事件 occurred=2026-09-28；CONTEXT:376 词条；CHANGELOG M-027 | 属实 |
| A1 | blankStrings（字符串/模板遮罩保行号、${} 递归）＋realConsumption（剥后仅认 import/require 具名引入、裸调用位；成员调用不豁免） | 码证 check-kit.mjs:70-128；变异探测 13 例：string-bare-name=false（正确）、member-call=false、sideeffect-import=false、named-import/destr-require/bare-call/tpl-${call}=true | 兑现；**string-with-callform/dquoted-callform=true=残留豁免通道（F-2）** |
| A2 | fxStringNom fixture 字符串提名必中、回滚即红；S2 五因子 | fixture 在案（75a:172），S2 断言五因子齐；活跑 stringNom=true | 兑现；fixture 载荷无 `(` 钉不住 F-2 通道（钉强度不足） |
| A3 | 41 件在册重跑分诊：零迁移零悬空，findings=389 前后不变 | register entries=389、其中 unstripped-scan 族 41 条全挂 recheck_log（at 2026-09-28/ref D-158①/「谓词收紧重测仍命中」）；findings.json 条数 a9e4ee00↔HEAD 389→389 | 属实 |
| A4 | census recheck_log 留痕＋ADR-0024 注记＋CHANGELOG M-028 | recheck_log×41；ADR-0024:43 注记挂 D-158（不开 ADR-0025 兑现）；M-028 在 | 属实 |
| C1 | manifest retired 类八要素 schema＋retired_policy＋_retired/ 建制＋首件走 T3 | manifest.retired=[]（空类 vacuous）＋retired_policy 文本齐；_retired/README.md 建制全（判据/流程/终态语义/划界）；75a-M3 八要素+归档实物+出运行集断言在案（:148） | 属实 |
| C2 | D-094 划界注记成对落盘 | 账本 :1132 注记＋README/manifest 双侧引述 | 属实 |
| C3 | registry guard-retirement-class＋retired-class-schema-active；CONTEXT retired 词条；M-029 | 全在案 | 属实 |
| D | 五 commit 全用三栏位 footer（D-161②④） | 5/5 带 Ledger-Refs+Chronicle；Adrs 仅涉 ADR 时挂（词表「钉涉及 ADR」语义支持省略） | 兑现；**tml/yms/rus subject 仍挂 (D-158)/(D-160)/(D-162③⑤⑥) 机读锚——违 D-161 负向「禁 subject 钉机读锚」（F-3）** |
| E1 | stage2-launch-criteria manual_watch：四判据＋30 日静默窗＋D-031⑤ 挂判据①＋D-162⑥「无未分诊残留」措辞 | 条目在案：verify_method 四判据全、30 日窗、D-031⑤ 入 review_at；watch=manual_watch 五要素齐 | 属实 |
| E2 | Stage-0 追认＋Stage-1 逐案用户闸门记 confirmations.reason；CONTEXT 暴露梯度词条；M-030＋exposure-ladder-registered 事件 | confirmations.reason 载三段＋负向留痕全；CONTEXT:384 词条；事件 occurred | 属实 |
| kny | census-findings 再生 excerpt ×24→×27 随四编年行；D-140② 独立落账 | diff 单行 excerpt `×24`→`×27`，无手工干预痕迹；独立 commit | 属实（探针 +3 与四编年行 ±1 口径差为计数语义琐事，附注不立案） |
| §五 事故 | nul 清零／a-stage-apply 插值事故／70-check E1 漂移再生入 yms | 全仓 find -name nul=零；63-inventory 在 B(+10→13)/C(13→14) 两 commit 内变（生成物随行语义 commit——同族搭车灰区并入 F-1 处理） | 属实＋并入 F-1 |
| §四.3 | 工作树残留非本批改动未动 | git status：48-*×11 M、56-heldout M、codebuddy-r38 删/未跟踪——均不在六 commit 文件面 | 属实 |

## 3. D-xxx 逐条核对

| 裁定 | 要求 | 实现证据 | 判定 |
|---|---|---|---|
| D-158① | 豁免谓词收紧=剥后真消费形态；字符串/属性名/标识符提名不豁免 | realConsumption 三判据在案；裸名/成员调/侧效 import/引用传递均不豁免 | **部分兑现**——字符串内调用形态仍豁免（F-2） |
| D-158② | ADR-0024 一行注记不开 ADR-0025 | ADR-0024:43 | 兑现 |
| D-158③ | CONTEXT 消费位词条表述坐实 | CONTEXT:364-365 已含「字符串提名不计」 | **措辞再度越界**（实现未排字符串内调用形态；F-2 伴随项） |
| D-158④ | S2 fxStringNom 逃逸件回滚即红 | fixture+断言在案 | 兑现但钉不全（无 `(` 变体） |
| D-158⑤ | 41 件字符串维度重测分诊、掉出者批注册 | recheck_log×41 零迁移 | 兑现 |
| D-159① | portable/env-contract 两档＋画像 9→3 勘误登记 | 3 件声明＋registry 勘误注记 | 兑现 |
| D-159② | tier 自声明强制未声明=红 | 60/60 声明＋75a-T1 机检 | 兑现 |
| D-159③ | skip 三态契约（不进 allOk、计数+reason、不混标、不折 pass） | runner/footer/guardSkip 全兑现；allOk 严格、判定按 fail | 兑现 |
| D-159④ | manifest env-gated 类（registry+事件 D-149④ 形态）＋01 repo-relative→kr-01 关账 | 双侧留痕全 | 兑现 |
| D-159⑤ | 37/39/46 探测化：缺失→skip、在但漂移→方言披露 | 探测腿三件齐；**披露腿仅 37 有实物**（39 注释自称零实现、46 无） | **半兑现（F-7）** |
| D-159⑥ | 11 件非 check 字面收敛 | 实数 11 | 兑现 |
| D-160①~⑥ | 面消亡判据／manifest+归档／双字段／划界注记／扩容先例／裁军驳回 | 全在案（§2 C1-C3） | 兑现（T3 通道=逐件呈报为程序面，无独立 retired 候选发射件——prose-only 附注） |
| D-161①②③ | 三栏位＋词表入 CONTEXT＋prospective | footer 5/5；词表 :372-373；历史未重写 | 兑现 |
| D-161④＋负向 | 落盘后全量适用；禁 subject 钉机读锚 | tml/yms/rus subject 挂 D-锚 | **负向条款违（F-3）** |
| D-162①~⑥ | Stage-0 追认／Stage-1 闸门／Stage-2 判据包／30 日窗／逐案主权／措辞修正 | registry 条目逐项对应 | 兑现 |
| D-144①④ | 账行增量↔编年随行 | M-027~030 随各 commit footer | 兑现 |
| D-145① | engine 触碰前置 | 六 commit 零 engine/ 路径——豁免成立且仍自跑 build+check-dist | 兑现 |
| D-148③ | 规程生效时点 | trailer 自 a9e4ee00 后新 commit 起适用 | 兑现 |
| D-149④ | 升格判据 | guard-all-run 全量红集⊆册（red={01}⊆{kr-01}） | 兑现 |

## 4. 双轴评审摘要（$code-review 并行子代理）

### Standards 轴（HARD 1／SMELL 7）
- 硬违规=blankStrings `'…'`/`"…"` 不遮罩（同 F-2）。
- 气味：check-kit 三件导出零消费+75a 内联重复正则（Duplicated/Speculative Generality）；siblingExists 无引用；env-contract.mjs 注释 \uXXXX 转义（F-4）；75a:194 中行 import；guard-all-run SKIP+crash 角落双集归属（F-6）；envProbe 整件级 skip 丢 portable 覆盖面（46 A/D 组随 jiahao 缺席全跳）；unstrippedScanHit 探针面仍扫未遮罩串（`readFileSync(\`${x}.mjs\`)` 类探针盲区；(ts|md|mjs) 宽泛命中 results.txt）。

### Spec 轴（MISSING 3／CREEP 1／WRONG 3）
- MISSING：retired 双通道 prose-only（无 retired 候选发射件——评：spec 原文「探测器共用」语义下属设计内程序面，降级为附注）；39/46 披露半腿（同 F-7）；trailer Adrs 可选性未明文（词表「钉涉及 ADR」可辩护——附注）。
- CREEP：75a-T3 对账硬门超 spec 字面（有益自立门槛——附注不追责）。
- WRONG：blankStrings 半边遮罩（同 F-2）；成员调用收窄超 spec 文本（D-158① 原文「调用位」无「裸」字——`kit.stripComments(` 真实消费被误伤方向=over-flag 保守侧；exec report 称「D-158 裸调用位定义」措辞虚挂）；reindent 搭车（同 F-1）。

## 5. 过程违规呈报（不替追认）

- **F-1 重缩进搭车**（上揭）：三 JSON 整文件重缩进随语义 commit 混入、无独立 format commit、无 .git-blame-ignore-revs 登记、报告未披露。另 63-assertion-inventory.json 生成物在 B/C 两语义 commit 内随行（10→13→14）——同族灰区。
- **F-3 D-161 负向违**：本批正是 trailer 裁的执行批，3/5 subject 仍挂机读锚（锚寄生截断带未修净）。
- **披露缺位**：F-1 重缩进、F-4 \uXXXX 注释、F-7 披露半腿均未进报告 §四遗留面——报告自述完备性受损（参照 r40 批2-β 审计「§3 偏差披露」先例，本应同级披露）。
- 已核无违规：无 push/merge（用户闸门守）；无越界文件；无 engine 产物搭车（未触 engine）；新件 UTF-8 无 BOM。

## 6. Findings 处置建议（审计不代裁）

- **F-2（必修·回炉）**：blankStrings `'…'`/`"…"` 分支改遮罩（`q + ' '.repeat(len) + q` 保行号保引号边界）；fxStringNom 增 `(` 载荷变体钉死；同步校准 check-kit docstring／CONTEXT:365／ADR-0024 措辞至实态；41 件复跑分诊（预计 findings 面不动——当前无守卫依赖该通道，复跑实证为准；新检出按 D-094 门注册）。**重跑清单**：`env -u NODE_OPTIONS node 75a-check.mjs`（14/14 期望）＋`node 70-check.mjs`＋`node guard-all-run.mjs`＋变异探测套件（审计侧 13 例已存档本节）。
- **F-1（必修·呈报裁定）**：三 JSON 重缩进既成事实不可拆——呈报两条：①认账登记（补 .git-blame-ignore-revs 登 64f0ae74/6d62d16a 或裁定豁免）＋报告 §四补披露；②工具面根治（registry/census 写入脚本钉 2sp 已有现状——立项「先 format commit 再语义」操作纪律强化或守卫提示）。
- **F-7（建议修）**：39/46 漂移披露半腿——按 37 的 WARN 退化型补齐或裁定「39/46 漂移语义不适用披露面」并改 39 头注去自称。
- **F-3/F-4/F-5/F-6（轻）**：F-3 后续 commit 修净（历史不重写守 D-161 负向）；F-4 env-contract.mjs 注释还原 UTF-8（SSOT 文件可读性）；F-5 死 API 摘除或 75a 改复用（二择一）；F-6 skip+crash 角落记观察。
- **附注（观察登记不阻塞）**：retired 候选发射程序面、Adrs 可选性明文、75a-T3 超字面自建、kny ±1 口径、模板内探针盲区、envProbe 整件粒度、member-require 形态漏检（保守方向）。

## 7. 引用（审计亲验件）

- 命令：§1 表全部当窗亲跑；变异探测=node --input-type=module 合成源 13 例回灌 realConsumption。
- 文件：`_lib/env-contract.mjs`、`_lib/check-kit.mjs`(:52-128)、`guard-all-run.mjs`(:35-72)、`75a-check.mjs`(:52-71,:148,:168-192)、`01-check.mjs`(:4-9)、`37/39/46-check.mjs` 探测段、`known-red-manifest.json`（retired/retired_policy/kr-01.lifecycle_log）、`_retired/README.md`、`33-gate-registry.json`（三新条目+三事件）、CONTEXT.md(:364-365,372-373,376-389)、CHANGELOG.md(M-027~030)、docs/adr/0024(:43)、decision-ledger.md(:962-967,1088-1132)、75a-census-register.json（389 entries/41×recheck_log）、75a-census-findings.json（389→389）。
- diff 取证：`git show <sha>`、`diff -w` 剥离（registry 3558→46 有效行、register 8329→369）。
- 子代理：Standards 轴（HARD 1/SMELL 7）、Spec 轴（MISSING 3/CREEP 1/WRONG 3）——完整发现已并入 §2/§3/§5/§6。
