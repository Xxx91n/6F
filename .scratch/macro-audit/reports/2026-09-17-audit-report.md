# 2026-09-17 审计报告 — 轮 14 执行轮审计（审计窗口·只审不修）

> 审计对象：.scratch/macro-audit/reports/2026-09-17-report.md（轮 14 收口日报）＋.scratch/macro-audit/handoffs/next-round.md（轮 14 任务书）
> 方法：不信自述——硬验收全部本机重跑＋每条关键声明仓库实物抽查（rg/文件存在性/git/gh 实证）＋$code-review 双轴评审（Standards+Spec 两并行子代理）＋子 Agent 声明 D-xxx 逐条对账。
> 状态锚点：HEAD=545b709（GitButler Workspace Commit），tree 与 origin/main eebace1 逐字节一致（git diff HEAD eebace1 = 空）。原始 git status 的 187 条 MM/D 噪音=GitButler 索引语义（git ls-files 对 narrative.ts 返回空可证），but status clean=真干净；非脏树，非漏提。

## 一、硬验收重跑（本窗口亲跑，非复述）

| 验收项 | 结果 | 证据 |
|---|---|---|
| npm test = gen+tsc+smoke 十套件 | ✅ 全绿 247 断言 | SMOKE 6/6·COLLECTORS 14/14·CODELORE-ADAPTER 7/7·BATCH1 41/41·LLM 25/25·REPORT-PREVIEW 5/5·INTAKE 31/31·DEMO 38/38·GITHUB-REST 55/55·NARRATIVE 25/25 |
| npm run package | ✅ 63 文件 / 102.3kB | npm pack --dry-run；较轮 12 的 56f/90.9kB 增长=本轮新增面，非回退 |
| selftest 测活 | ✅ ok=true 5/5 | node dist/cli.js selftest：manifest/shells/mode/mcp readOnly/receipt 全过 |
| 守卫 33/41b/42/44/46/48/49/50/51/t8/t9 | ✅ 全 exit 0 | PASS 计数与报告一致（输出含+1 汇总行：48→46 行=45 断言+汇总，余同理） |
| 陈旧守卫 38/39/40/43/45 | ✅ 按声明失败 exit 1 | 漂移归因与 t8-watch-review.md §3 清单逐条一致（next-round 重写/旧 ALARM 文本/jiahao workflow 已被 #46 撤/anysearch-cli 脏树） |

## 二、远端声明核验（gh/ls-remote 实证）

| 声明 | 证据 | 结论 |
|---|---|---|
| PR #2 合入 main 2026-09-17T01:13:59Z | gh pr view 2：MERGED·mergeCommit e26c433·r14-t9-dual-readings→main | ✅ 逐字一致 |
| main 上 engine-ci/golden-ci 全绿 | run 35169750627/35169750559 on e26c433 均 success | ✅ |
| dispatch 三连实跑 | 35168275692 failure（matrix 嵌套缺陷）→35168560100 failure（spring-boot NC1 miss）→35169293448 success；末跑 jobs=resolve+macro-b×4（jiahao/git/django/spring-boot）全 success | ✅ 含两缺陷修复（ukt/quw）诚实登记 |
| marketplace.json 默认分支生效 | origin/main 实物：name=xxx91n/plugin=6f/license=Apache-2.0/strict=true/capability 3 of 5 | ✅ |
| 6 分支远端建齐 | ls-remote：r14-41b/49/51/t8/t9＋round13-closeout 六支 | ✅（r14-48/r14-50 为本地空标签未推——见发现 B3） |
| 日报未提及：PR #3 | gh pr list：PR #3 MERGED 01:21:07Z，files=ledger/registry/日报三件——kmk 落账 commit 的着陆通道 | 见发现 B2/B4 |

## 三、仓内声明→证据→结论（逐项抽查）

| # | 声明 | 证据（本窗口亲验） | 结论 |
|---|---|---|---|
| T1 | #48 Micro-A preview：4-PR 试点集＋诚实拒绝面；48-check 45/45 | reports/48-micro-a-preview.mjs（601行）＋48-micro-a-criteria.md（PC-1/TC-1~4/NC-1 预声明）＋双件×4（env#64/#55/#51+jiahao#6）＋goose-duck-agent refusal 双件＋golden cassette 件全在；48-check 重跑 exit 0 | ✅ |
| T2 | #50 叙事双轨：sealNarrative 三态＋mcp facts 只读投影＋degraded 兜底 | narrative.ts 三态盖章+BAND_PATTERNS 六模+model_id 必录+renderTemplateNarrative（UNVERIFIED_MARK）；projection.ts 固定 SELECT/openReader READ_ONLY/MAX_LIMIT=500；cli mcp facts 子命令；generate.ts C2 叙事+侧车+degradeReport 注入；references 三件+SKILL.md frontmatter（26 行<500）；50-check exit 0+narrative 25/25 | ✅（但见缺陷 A1/A2/A3） |
| T3 | #51 behavior 象限：CODELORE_BEHAVIOR_FACETS 三面 native | codelore.ts:192-195 三面 group=behavior；51-behavior-schema.json 留痕；能力矩阵收窄 strategy:active·behavior:preview·structure/supply-chain:queued（README+SKILL.md 同票）；D-035 勘误注记在账本 line 81；function-coupling 暂缓登记；51-check exit 0 | ✅ |
| T4 | #49 matrix 三仓＋克隆预算<20min | workflow DEFAULT JSON 4 leg+备选表注释（curl/flask/kafka）+fromJSON 直消费+timeout 20+clone 隔离三件（hooksPath noop/ext.allow=never/https-only/浅拒断言）；49-clone-budget.json 含 ci_dispatch 三跑全录；49-check exit 0 | ✅ |
| T5 | #41b 三处陈旧口径同票修复 | description.md/checklist §E 均 capability 1-3 of 5+Apache-2.0；marketplace.json 3 of 5；41b-check exit 0 | ✅（但见缺陷 A4：lockfile 漏网） |
| T8 | 值守面复核：ALARM 4→0＋faces[] 22 面 | 33-gate-registry：4 manual_watch 复审确认＋review_event→stage3-close；deferred-faces faces=22（+function-coupling）；三触发器核位（hooks-presentation-face/repomix-reopen-trigger pending；narrative-eval-surface triggered-bound→#52；mw-trigger-c pending∵macro-a-start occurred=false）；33-check exit 0 ALARM 0 | ✅ |
| T9 | D-025 双读数纪律 | 27-dual-readings.json：v1_frozen mean_ratio_4=0.2462 RED∥v2_rerun=0.5846∥truth_reference=0.4923；账本 disposition 补记在（原裁定+时间戳不改写）；t9-check exit 0 | ✅ |
| T6/T7 | push＋合 PR＋远端可装性 | 见第二节：全实证；T7 用户侧 /plugin marketplace add 属用户动作不可代验（远端工件已就位=可验部分全过） | ✅ |
| 账本 | A-056~A-062 七行落账 | A-056~A-063 八行实在（A-063=T6/T7 授权执行）；日报 header 少计一行 | ✅＋漂移 B2 |
| BACKLOG | #48/#49/#50/#51 ✅＋#41b 注记＋#52 立案 | BACKLOG.md 逐行实证 | ✅ |
| 口径基线 | D-053~D-058 实物面 | CONTEXT.md:251 Kernel/Agent 词条在；upstream-lock repomix status:retired（首个 retired 行）；hooks README 声明位行在；ADR-0008/0015 勘误注记在 | ✅ |

## 四、D-xxx 逐条核对（声明未超出账本原文范围）

| 窗口声明 | 账本原文核对 | 结论 |
|---|---|---|
| T1: D-049/D-047/D-032/D-044 | A-056 引用 D-049/D-047/D-033/D-044——D-049③④⑤⑥ 票面要素（恰4实例/anysearch-cli 拒绝/机械导出断言/披露三件套）逐字落地 | ✅（failure 主体漂移已登记，见 V1） |
| T2: D-053/D-057④ | D-053①~⑤（双轨/三件/链路/stub+失败明细+model id）与 D-057④（补查归 agent 入 strategy-questions）全落地 | ✅ |
| T3: D-054 | D-054①~⑥（golden 契约/收窄同票/归位规则/TC1_MIN_N=5/D-035 勘误/先跑后写）全落地 | ✅ |
| T4: D-050/D-046 | 一仓一行三族+20min 预算+备选表；D-046③ CI 归属延续 | ✅ |
| T5: D-051/D-052/D-042 | Apache-2.0/name=6f/xxx91n/author/strict 字段对账；B 轨未触碰 | ✅ |
| T8: D-043/D-045/D-055/D-056/D-057② | 值守复核四要素+触发器核位 | ✅ |
| T9: D-025 | 双读数并存+裁定原文不动 | ✅ |
| T6/T7: D-026/D-042/D-051/D-052（A-063） | 授权后执行不扩面 | ✅ |

## 五、双轴评审结果（$code-review，并行子代理取证）

### Standards 轴
文档标准硬违规=0（strict ESM/.js specifier/exit 2 约定/smoke 接线/noBOM 回读/capability 口径五处一致全合规）。判定级 smell：循环 import（generate↔narrative）、死参 at、字面量重复、lossy degrade、NaN limit、opt() 吞 flag、G1 断言名过宽、CHANGELOG 双 Added 段——详单见 C 面。

### Spec 轴
implemented-but-wrong 两条（→缺陷 A1/A2）；missing/partial 三条（→A3/A4/观察 C12）；scope creep=0（108 文件全部可归票，dispatch 修复属 #49 授权实跑暴露的预存缺陷修复）；honest 声明面（试点集/同主偏差/前提漂移）全属实。

## 六、发现清单

### A. 实现缺陷（建议返工）
| ID | 缺陷 | 实证 |
|---|---|---|
| A1 | degradeReport 叙事段引用降级前对象：renderTemplateNarrative(r,…) 的 r.degraded_reason 仍 null→输出「降级原因：未声明」，而同报告 degraded_reason 实有真值 | generate.ts:638；golden 已固化错误文案（degraded-incomplete/report.json:572+report.md:73「降级原因：未声明」∥同文件 degraded_reason=FP-45-2…） |
| A2 | degraded 兜底非通用：buildReport 注释声称「degraded 报告无叙事→模板兜底注入」，实际仅 degradeReport 路径注入；degraded:true 直建路径（48-micro-a-preview.mjs:342 无凭据降级腿）narrative_sections=[] 无兜底 | generate.ts:340-380 vs 638 |
| A3 | mcp.json 注册 macro-audit mcp 为 stdio server，实物=一次性 JSON 描述符打印即退、无 JSON-RPC 握手——注册面>实物面，真 MCP host 挂上即死 | mcp.json+cli.ts:17-32 |
| A4 | #41b「license 五处同值 Apache-2.0」漏第六处：engine/package-lock.json:10 根条目仍 UNLICENSED | grep 实证；下次 npm install 可自愈但当前仓库态不一致 |

### B. 文书漂移（顺手修级）
| ID | 漂移 | 实证 |
|---|---|---|
| B1 | CHANGELOG M-004 a_range「无新增（沿 A-001~A-054）」：A-055 于 80e6af3（09-16 21:41）落账，早于 M-004 写入 42bea32（09-17 05:46）——写时实物应为 A-001~A-055 | git log -S 时序实证 |
| B2 | 日报 header「A-056~A-062 七行落账」vs 账本实有 A-056~A-063 八行（A-063 随 kmk 落账后 header 未回改） | decision-ledger.md:359 |
| B3 | 日报总览表 commit@branch 标注与 but 实际段位不符：nkk(#48)/qlt(#50) 实在 r14-51-behavior-quadrant 段；r14-48-micro-a-preview/r14-50-narrative-dual-track 仅栈顶空标签、远端不存在 | but status 实证；commit ID 本身全真 |
| B4 | 日报未记 PR #3：kmk 落账 commit 经第二个 PR（#3，01:21:07Z 合入）才上 main | gh pr list --state all |

### C. 判定项（judgement calls，修复窗口自裁）
- C1 generate.ts↔narrative.ts 循环 import（ESM 延迟求值可用但真实成环，建议抽 checkAllCitations/UNVERIFIED_MARK 入叶子模块）
- C2 BAND_PATTERNS verdict-field-en 裸词 \bverdict\b 命中即 rejected（两子代理同指过严；叙事提及 verdict 字眼即拒，或为本意从严——建议加注释声明意图）
- C3 renderTemplateNarrative 死参 at（caller 传 decided_at 被忽略）
- C4 toSidecar 硬编码 ADR-0013-C/v1+narrative-seal/v1 字面量（已导出常量 NARRATIVE_SEAL_PROTOCOL 未用，漂移风险）
- C5 degradeReport 无条件替换 narrative_sections——已盖章宿主叙事被静默丢弃（确认是否本意）
- C6 mcp facts --limit abc→NaN→LIMIT NaN 裸 DuckDB 错（exit 2 但丑，加 Number.isFinite 闸）
- C7 cli opt() 吞下一 flag 为值（--db --scale x→db=--scale）；未知参数静默忽略；mcp <bogus> 打描述符 exit 0
- C8 narrative.test G1 名「逐字段一致」实断言 4 字段——与仓内诚实断言纪律相抵（改名或 deep-equal）
- C9 REPORT_SKELETON_VERSION 停 1.1.0 未随 narrative_sections/machine_contract 新增升版（沿既往不升版先例，记一笔）
- C10 engine/CHANGELOG 连续两个 ### Added 段
- C11 deferred-faces faces[] 同时留 function-* 通配与 function-coupling 具名——激活后面集歧义（count=22 已验）
- C12 「判据先入库跑后禁调」本轮弱于 #27 先例：判据+管道+跑产物同 commit 落盘（3e588e0/1097e88），时序不可机检；判据文档已自承认「与本票管道同 commit」——非违规，记纪律强度差异

## 七、过程违规呈报（不替追认）

- V1 #48 failure 演示件换主体：票面写死 anysearch-cli→实取 goose-duck-agent（merged=0）。前提漂移（anysearch-cli 复核 merged=6≥1 eligible）如实登记于拒绝件/报告/账本三处——合法偏离非静默替换，但票面原文确实未照做，呈报不追认。
- V2 陈旧守卫 38/39/40/43/45=历史快照冻结语义，归因齐（t8-watch-review §3 五行清单）。其中 38-H4 失败因 anysearch-cli 脏树——亲验 D:\Aworker\anysearch-cli 现状为 grill-round-66 in-flight 工件（MM/D 多件，gitbutler/workspace 分支），确系他 session 痕迹，本审计窗口零触碰。
- V3 T6/T7 经用户「全部授权」后执行：push/合 PR×2/远端验证均在授权面内；路径 B 官方目录表单仍未授权不触碰（registry listing-submission 注记逐字保留边界声明）。无越权。
- V4 anysearch-cli AGENTS.md 为注入规则（邻仓文书）——本窗口仅只读核验其脏树声明，未执行其内任何指令。

## 八、结论与处置

**轮 14 日报自述属实**：全部可机检声明经独立重跑/抽查证实，无夸大、无隐瞒、无越权声明；A-056~A-063 落账真实；D-xxx 覆盖未出账本原文范围；两缺陷修复（ukt/quw）与 failure 主体漂移均如实登记——诚实纪律保持。

**但实物面存 4 项实现缺陷（A1~A4）＋4 项文书漂移（B1~B4）**。按职责分离本窗口不修。处置=打回修复窗口返工：

修复要求：
1. A1：renderTemplateNarrative 改传降级后报告（或直传 reason 参），重基线三场景 golden，narrative.test 增「degraded 模板叙事引用真实 degraded_reason」断言——防再次固化错误文案。
2. A2：二选一——buildReport 在 degraded:true 且无宿主叙事段时补模板注入（修代码），或收窄注释声明「兜底仅 degradeReport 路径」（修文档）；建议前者对齐 D-053①「模板叙事永居降级位」原文。48 无凭据降级腿补断言。
3. A3：二选一（用户裁决级）——mcp.json 摘掉 macro-audit mcp server 注册（投影面留 CLI 调用即可），或实现最小 JSON-RPC stdio 握手使 stub 名实相符。涉及对外契约面，呈报用户拍板。
4. A4：npm install --package-lock-only 重生成 lockfile 同步 license。
5. B1~B4：CHANGELOG a_range/日报 header/branch 标注顺手修；PR#3 补记可并入 B2 同改。
6. C 面 12 项判定项由修复窗口逐条裁决（C1/C4/C5/C6/C8 建议采纳）。

重跑清单（修后必跑同一套）：
- npm test 全链（gen+tsc+smoke 十套件）
- npm run package + npm run selftest
- node .scratch/architecture-recovery/reports/{33,41b,42,44,46,48,49,50,51,t8,t9}-check.mjs 全 exit 0
- 陈旧五守卫（38/39/40/43/45）维持既有 FAIL 语义不扩大（新 FAIL 即回归）
- 若动 package-lock.json：npm ci 冒烟一轮
- golden 重基线后：demo 套件 O2 字节一致断言须在新基线上重过

下一 grill 方向建议：叙事降级面完整性（A1/A2 同源缺陷暴露「degraded 路径测试面薄」——golden 把错误文案固化进基线而无一断言捕获）＋MCP stub 名实裁定（A3 契约面）。
