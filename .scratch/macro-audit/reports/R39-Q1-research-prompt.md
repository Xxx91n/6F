# R39-Q1 调研题面（atomcode）

仓库 D:AworkerF 是 spec-level 工程内容审计产品（品牌 6F／内核 macro-audit）。产品形态=Agent Plugin 五层盒（确定性 CLI 内核＋MCP 只读查询面＋skills 方法论壳＋可选宿主扩展＋报告模板资产——ADR-0008）；分发渠道=纯 Agent Plugins（ADR-0016）；当前态=preview capability 4/5（Macro-B/Macro-C/Micro-A/Micro-B 已 preview，Macro-A 未上架）；marketplace listing 活在 GitHub（Xxx91n/6F，`6f@xxx91n`，git-clone 无构建步）。

## R38 已闭环事实（勿重复验证）

- CodeBuddy CLI 宿主试用已执行关窗（trials/codebuddy-r38/）：`@tencent-ai/codebuddy-code` 2.151.0，三判据全 hit——C1 安装链四步零文档外干预（doctor --fix 属 pinned README 文档内主路）／C2 字段级 parity（report.json 70 键零非对称、17 语义锚零 diff、facts 960 行×872583B 逐字节等、measurements 逐字节等）／C3 preview 披露诚实；三悬点全实证（.claude-plugin/marketplace.json 被读、插件级 .mcp.json 自动发现、${CLAUDE_PLUGIN_ROOT} Windows 展开正确——官方兼容别名判断真机证实）；findings×4 全 D-146 初分「不进裁定链」。形态限定：CLI 已实证、IDE 形态未覆盖。
- 批2-α 闭环：r37 审计呈报七件实修全 closed；348 条字面钉普查册稳态（75a-census-register.json 全归因）；guard-all-run 60 件动态枚举 PASS（红集={01.kr-01}⊆known-red-manifest）。
- r38 全链已 PR #7 合入 main（a96ae2e0），工作树零未提交物。
- 账本：D 面 152 主记录（141 current/10 revised/1 closed）；A 面 99（max A-099）；编年至 M-023。ADR 23 件。

## 在途面（本轮射程候选清册）

批2-β 五项（75b-disposition-draft.md §3，探测器语义变更属裁定链非机械修）：
1. unstrippedScanHit「注释提名即豁免」漏洞——探测器应扫剥后源码的 strip 消费位而非原文 mention（注释里提函数名即被判豁免=探测盲区）；
2. multi-hit-probe 仅收 `.indexOf(` 字面量（`.includes(`/`.test(` 逃逸）＋普查 walk 面漏 `.scratch/macro-audit/`——扩面后新检出须注册；
3. SCAN_EXEMPT 含 guard-all-run.mjs 不可达项（枚举面为 *-check.mjs）＋75a-S1 自指断言恒真边例（assert 文本自提及即过——自引用恒真断言）；
4. stripMdComments 零调用面维持（新增 md 面断言方消费，不为凑调用而改存量）——维持 or 处置；
5. 技术债候选三件：75a 每跑写 findings 工件（守卫写工作树设计内）／41a 手写 indexOf 解析器／guard-all-run FAIL-slug 正则耦合。

可并入项：审计 N5/N6（37-check inline spawnSync 残余＋check-kit gitOut 不检 status 的 false-green 向）＋T1-N1（「字段级 parity 全等」表述精化——70 键中 69 等、唯一差=evidence[].reproduce_cmd per-run 路径自引）。

簿记/观察项：T1-N2 registry 计数口径刷新（61/42→62/43）；T1-N3 F-02 宿主展示盲区是否挂 manual_watch；IDE 形态缺口接力方式。

旧债：xfail 摘除追认（D-102①）；R28-Q19 复核债。

战略面：批3（multi-hit 76 件点级锚改造试批 ~10 件）排产时点；Macro-B GA 前置条件何时开裁。

## 问题

本轮射程裁——候选：
(a) 窄射程：只做核销呈报（锐评同件复核零残余＋T1 结果核认），批2-β 推迟下轮；
(b) 中射程：核销呈报＋批2-β 五项逐件裁定（N5/N6/T1-N1 并入考察），簿记项顺手处置不逐裁；
(c) 宽射程：(b)＋处置面打包裁（IDE manual_watch 立不立／xfail 摘除追认／R28-Q19 复核债／registry 口径刷新）＋批3 排产时点裁。

且若选 (b)/(c)：批2-β 五项各自的处置方向请给推荐（改探测器语义／维持现状＋登记技术债／拆件分期），以及逐项裁 vs 打包一裁的颗粒度惯例。

## 调研要求

1. 回顾 D:AworkerF.scratchmacro-auditdecision-ledger.md 全部 current 记录（重点：D-094 三分类处置门〔legit/convention/event-pin〕、D-071⑨ 字面钉修法族〔行钉/结构匹配/外部锚回引〕、D-146 评审摄入四档分诊与 D-146⑤ 勘误惯例、D-148② Accepted-Risk 三要素、D-149 守卫组升格条款、D-150~D-152 试用裁定组〔findings 回流重排触发语义〕、D-102① xfail 摘除追认挂账、75a 普查建制条款，以及一切涉及守卫/check 断言治理/字面钉/技术债登记的条款）；
2. 回顾 docs/adr/（0005 HoF-FA、0008 五层盒、0013 三层验收门、0017 preview 分级、0019 SWMR、0022 quarantine）与 CONTEXT.md（Kill Criterion、Watch Tri-state、Trigger-gated Closure、Accepted Risk、守卫基线枚举、Self-probe、Positive Control）；
3. 工业界成熟落地的心智模型（重点）：①测试断言基础设施治理惯例——mutation testing（变异测试对断言强度的度量，Stryker/PIT）、linter 规则误报治理（ESLint suppression comment 语义演化、CodeQL query suite 分级）、flaky/quarantine 名单管理（谷歌/微软 quarantined tests 惯例）；②探测器/扫描器盲区治理——「注释内提及即豁免」类启发式的失效模式与安全先例（security scanner 的 suppression audit）；③自引用恒真断言（assertion that mentions its own name）处置先例；④技术债批次化处置惯例（debt triage 三分类/四象限、boy-scout-rule 边界、分批试批评估返工面）；⑤试用 findings 回流影响内部整改优先级的先例（pilot feedback triage）；⑥guard/CI 检查项 write-artifact 语义（test 写工作树 vs 临时目录惯例）；
4. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（冲突则该 D-xxx 需标 revised 呈报新决策，禁静默改向）。特别核查：①批2-β 逐项裁 vs 打包裁的颗粒度与本仓 D-094/D-146 先例的兼容性；②「探测器语义变更」是否应视同 spec 变更走 ADR 还是账本裁足够；③D-152③「试用 findings 回流重排」在四条全不进裁定链的实态下，「无需重排」结论本身是否需要显式裁认（防排序承诺悬空）。
