# Backlog — 整轮收口遗留事项（2026-09-12）

> 呈报用户决定是否立票（per 用户 /goal 第 6 项）。

## B1 — 流程规范（建议立即立票）

| 编号 | 标题 | 触发条件 | 估时 | 建议 |
|---|---|---|---|---|
| B1.1 | W1/W2 全部 14 份报告补 commit-surface 处置 + 分到独立 branch | W3/W4 已示范 `sc [15-...]` / `re [16-...]` 形态，W1/W2 历史遗留 | 1 票 = 14 子任务 | **建议立票** — 闭合 V3-V4 违规 |
| B1.2 | 启动器收尾硬要求加 强提示（黑体警告）防 W2/W3 V2 重演 | W2 L4 + W3 L2 都明示"必须做但 agents 没做" | 1 票 = 18 启动器更新 | **建议立票** |
| B1.3 | A-006 重启触发器接入 D-007 演示脚本 | A-006 deferred 等 AI 代码生成主流化 | 1 票 = 集成测试 | **建议立票** |

## B2 — 仓库结构（建议合并到下轮开工）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B2.1 | 把 `.scratch/` 加入 .gitignore 或明确其跟踪策略（当前无 .gitignore，.scratch/ 全部进 git） | 1 票 | 视用户偏好 |
| B2.2 | 删 e-branch-1（空分支 `(merged upstream) (no commits)`）| 1 票 | cleanup |

## B3 — 文档与可发现性（可选）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B3.1 | 在仓根写 README.md（说明本仓是 spec-level 规划仓、不含代码） | 1 票 | 强建议（当前无仓根 README） |
| B3.2 | 把 docs/adr/ 链接到 docs/decisions/ 索引 | 1 票 | 易做 |
| B3.3 | 仓根加 CHANGELOG.md 记录本轮 7 ADR + 18 A-xxx | 1 票 | 易做 |

## B4 — 上下游对接（待用户决定）

| 编号 | 标题 | 估时 | 建议 |
|---|---|---|---|
| B4.1 | 进入 Phase 4 实施（per WORKFLOW.md §2）—— 但需另起工程仓 | 1 个工程仓 | 视产品方向 |
| B4.2 | 与 jiahao / anysearch-cli / env-manager 对接（这三个仓被 W2 扫描但未实际集成） | 多票 | 视产品方向 |

## B5 — 不可立票的事项（仅供参考）

- W1-W4 commits 已在 zz + 各独立 branch（23 个 branch）；如需合并到 main，需用户指示栈序 + push 策略
- 仓根无 .gitignore —— `.scratch/` 等都被 git 追踪
- A-006 评估未做实际扫描（仅 framework）
- 仓无远端；push 需用户明确给 `push 到 <remote> <branch>` 指令

## 阶段 3 票据包（2026-09-15 R6 grill 收口立案，来源 D-036；#43 为 D-030③ 登记候选票并入）

> 次序（R7 更新，DoR 锐化 per D-040：开工闸门=依赖闭合即可拉，波次=协调/验收装置）：#32~#34 done → #35 关键路径 → #44/#45/#41a 就绪即做（filler 优先级不占关键路径）→ #36/#37 → #38 → 其余随层序；#41b 授权面就绪即做（D-042；提交点击=用户）。
> 上架动作未授权（D-026/D-027 用户闸门）；各票需求面在立票环节（to-spec/to-tickets）填实。

| 票号 | 标题 | 来源 D-xxx | 挂门/前置 | 备注 |
|---|---|---|---|---|
| #32 | B1.2 落地：31 份 prompts「## 收尾」段首黑体硬要求块 | D-029 | 无 | 已于轮 6 整理环节执行完毕 |
| #33 | T7 挂门机检化 guard：扫全部挂门项「最迟时点/触发事件/复审时点」到期报警 | D-026 / D-034④ / D-024 | 阶段 3 最优先 | 横切兜底；输入含三触发器与暂缓面集复审时点。✅ W1 已落地（33-check.mjs 8/8）。**扩展子项（D-041）**：registry watch 三态（event_bound/manual_watch/risk_accepted）五要素齐备化＋守卫扫 manual_watch「复审逾期 or 确认缺失」＋逾期转 risk_accepted 候选＋event_bound/total 覆盖率输出＋decided 状态枚举登记。✅ 2026-09-16 已闭环（A-053）：manual_watch 7 项五要素 3/5→5/5＋micro-a-preview-prep 事件＋33-check 并入扩展（D 组 fail-closed 堵 W6＋E 组 manual_watch 扫描＋COVERAGE 23/30）PASS 16/16＋红证两态＋npm test 不回归 |
| #34 | plugin.json 对齐 Agent Plugins 1.0.0（$schema const / schemaVersion / skills·mcp·extensions 形态）＋ AJV 校验入 guard | D-036 / D-012 余款 | 上架硬前置链 | 独立小票（明示修正 handoff 并入分发收尾票原建议） |
| #35 | CodeLore 契约面扩开首批 ≈30 面（演化主干 12＋S3 族 6＋S5 族 12），逐面 golden 契约测试 | D-035 / D-034 | Macro-C preview 前置 | ADR-0014 纪律：适配层禁业务规则。✅ 2026-09-16 已闭环（A-040）：≈30 面逐面 golden 契约落地（演化主干 12＋S3 族 6＋S5 族 12）＋独立审计 20/20 成立＋文书返修闭合（残余 4 面挂 registry manual_watch codelore-residual-faces）；35-check PASS 22/22 |
| #36 | CodeLore LLM 面（explain 族）env 门控＋成本验收 | D-035 | S4 ADR 假设抽取前置 | 独立验收，不混入 #35。✅ 2026-09-16 已闭环（A-041）：explain --llm／diff --llm／mcp explain_file env 五变量门控＋llm_cost 计量＋超限降级披露，契约测试 25/25 两形态；36-check PASS 20/20 |
| #37 | 试点面可用性审计：三仓 PR 人/机比＋supersede 链完整度实测脚本 | D-033 | Macro-C/Micro-A 试点前置 | ✅ 2026-09-16 已闭环（A-042）：三仓只读实测＋层×仓 capacity 矩阵（jiahao 托管面出入呈报 D-033）；37-check PASS 40/40 |
| #38 | Macro-C preview：anysearch-cli 校准＋报告强制披露单仓校准限制＋happy+failure 演示双件 DoD | D-034 / D-032 / D-033 | #35/#36/#37 | 第二能力层。✅ 2026-09-16 已闭环（A-043）：anysearch-cli 校准全链 1012 facts＋preview_disclosure 披露块双件＋共享事实库触发 mw-trigger-b；38-check PASS 36/36 |
| #39 | Macro-B 三仓 one-shot＋jiahao 持续回归接入 CI | D-033 / D-034 | 回归接入 CI = 多写者触发器 (a) 激活点 | 激活即实测封口任务 7。✅ 2026-09-16 已闭环（A-044）：三仓 one-shot 裁定 supported／unsupported／supported 如实落数＋jiahao workflow 接入 CI（mw-trigger-a 触发值守）＋多写者 self-probe 实测封口 desk-task7→triggered-bound；39-check PASS 38/38 |
| #40 | 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户） | D-033 / D-013 | Macro-B GA 前置 | ✅ 2026-09-16 已闭环（A-045）：open-gsd/gsd-core URL opt-in 接入 Macro-B 1424 facts unsupported 如实落数（TC-2 双归因区分）＋engine intake 面落地（repo add 31 断言）＋first-external-repo→occurred；40-check PASS 57/57 |
| #41a | 分发收尾·仓内文档面：examples/first-report/ 复制四件＋披露 README／README 能力边界＋preview 标注＋「Try on a real repository」节／仓根编年首条落地 | D-030 / D-031 / D-032 / D-038 / D-039 / D-040 | 就绪即做（filler）；DoD 含「边界文案以冻结决策为唯一事实源」护栏 | 拆自 #41（D-040）✅ 2026-09-16 已闭环（A-051）：四件+披露 README／边界矩阵 capability 1-2 of 5 preview+三层 Not yet+0.x+Try 节／仓根 CHANGELOG M-001+engine 指针闭环（W4 悬空清零）；41a-check PASS；上架动作未执行（用户闸门） |
| #41b | 分发收尾·上架面：listing 资产／marketplace 字段查证（preview 标注字段＋版本元数据 schema＋竞品扫描）／凭据申请 | D-031 / D-037 / D-026 / D-027 | **授权至提交前一刻（D-042）**：listing 资产／marketplace 字段查证／凭据申请就绪即做；**提交动作=用户闸门**（listing-submission 收窄义=提交本体） | 拆自 #41（D-040）；上架动作停用户闸门。轮 11 拍板：路径=A 自有市场＋C Agent Plugins 生态双轨（B 官方目录未授权）；license=Apache-2.0（D-051/ADR-0021）；插件名=6f、市场名=xxx91n、author 值已定（D-052），manifest/marketplace.json/LICENSE 已随轮 11 整理落盘；残余=push 授权＋用户侧 /plugin marketplace add Xxx91n/6F | 核对留痕完成（2026-09-17，A-060）：description.md/marketplace.json/checklist 三处陈旧口径修复同步 README（capability 1-3 of 5、Apache-2.0）；41b-check PASS；残余=push 授权＋提交点击（用户闸门） |
| #42 | 上游队列：Scorecard/repomix 探针＋CodeLore sqlite dump 对照评估 | D-023 / D-034 / D-035 | 层需求拉动，不插队 | ✅ 2026-09-16 已闭环（A-047）：42-dump-comparison.md 三轴对照落文＋呈报=维持逐面契约不采纳（锁表 evaluating 不翻、采纳须另立 ADR）＋registry upstream-probes-scorecard-repomix pending+manual_watch 不插队＋供应链象限披露核查实物断言全中；42-check PASS 43/43 |
| #43 | 样例 golden CI：CI 重渲染 fixture 并 diff，更新走 PR 审查 | D-030 | 阶段 3 候选，与 #33 同批立项 | ✅ 2026-09-16 已闭环（A-048）：golden-ci.yml 两腿重渲染+逐字节 diff（engine golden=gen-demo-golden.mjs+porcelain；examples=bundle 物化 fc00d458 worktree+e39468c overlay+等签名 README 重构，逐字 README 命令）；禁自动回写直通 main、更新只走 PR 审查明文；43-check PASS 28/28 |
| #44 | 版本与上游锁定制度化：engine/upstream-lock.yaml 种子行＋docs/versioning.md 衔接＋README §3 上游表状态列绑锁表为机读权威＋守卫族（版本断言/锁表新鲜度/三处标注同源/编年指针校验，advisory→enforce 两段式） | D-037 / D-039 | 阶段 3 早期 | ✅ 2026-09-16 已闭环（A-049）：锁表六行种子（codelore active 0.28.0+--version 契约/duckdb+git-cli active/scorecard·repomix-gitingest planned/sqlite-dump evaluating+risk_note）＋README §3 唯一权威绑定＋engine CHANGELOG Unreleased 引 lock＋44-check PASS 56/56 两段式（ENFORCE 段已 enforce；ADVISORY=新鲜度逾期+binary 缺席）＋M-001 superseded 注记补全（0002/0010）；禁 range/浮动 tag；更新走手动窗口＋golden 回归护航 |
| #45 | 演示入口：fixture 生成器＋definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋golden/＋demo --scenario 命令＋CASRAI 式披露块 | D-038 | 阶段 3 早期（D4 deadline 实到）；#43 前置 | ✅ 2026-09-16 已闭环（A-050）：生成器/definitions×3/golden×3/demo 命令/披露块四印记全落盘，demo.test 38/38 入 smoke，45-check PASS；合成数据不冒充真实审计；demo 走同一 Repo Intake 本地路径 |
| #46 | 回归 CI 迁回 6F 自有 CI：6F workflow 加 macro-b 回归 job（URL opt-in clone 公开仓 → Macro-B one-shot → 工件留档；schedule+workflow_dispatch）＋ jiahao 仓 macro-b-regression.yml 单文件撤除（其余内容零触碰）＋经典公开仓候选清单呈报 | D-046 | 阶段 3 铺开窗口（承接 #39 回归腿的迁移） | mw-trigger-a 语义不变（「Macro-B 进 CI 定时回归」在 6F 侧成立）；公仓 clone 零 token；jiahao 仅作审计对象不承载我方资产；经典仓候选=语言族×git 健全度×规模短名单呈用户定；6F/jiahao push 各需用户点头。✅ 2026-09-16 已闭环（A-054）：6F macro-b-regression.yml 落地（resolve→fromJSON matrix／URL opt-in／intake 隔离三件／one-shot→verify 强断言→upload-artifact，schedule+dispatch，零 token）＋jiahao 单文件撤除 2755bf35（恰 1 文件 D）＋经典仓候选短名单呈报待选定；46-check PASS 30/30（含轮 10 返修强化） |
| #47 | 托管平台 API 适配器：GitHub REST 主路（env token）＋gh 已认证态可选回退＋无认证降级；最小契约=PR 枚举（平台 Bot 双检）＋元数据＋diff 双通道（本地 git 优先/API 兜底）；限流 x-ratelimit+Retry-After；凭据三级探测不建存储；golden cassette（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot） | D-048 / ADR-0020 | 阶段 3 铺开窗口（Micro-A preview #48 硬前置） | kind=remote-api 已登记锁表 planned；API 面不替代 D-013 本地输入面；review/comment=planned 不入最小契约；私仓=token 必需披露 ✅（2026-09-16：github-rest.ts 落盘 690 行＋cassette×5＋test 55/55 入 smoke＋锁表→active＋47-check PASS＋A-055；见 issues/47-github-rest-adapter.md） |
| #48 | Micro-A preview 单票铺开：适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片）＋双仓实跑＋报告双件＋披露三件套；验收序列=① golden 管道 PASS→② env-manager 三形态（dependabot/release-please/人类各1）→③ jiahao 全人基线→④ failure 件（anysearch-cli 无托管面诚实拒绝）→⑤ 披露→⑥ desk-task15 核验＋micro-a-preview-prep 事件闭环 | D-049 | 阶段 3 铺开窗口（前置 #47） | PR 集=恰 4 条已 merged＋diff 规模适中；token 缺席=degraded golden cassette 不混测；desk-task15=骨架机械导出字段断言进 NN-check；披露含同主偏差＋平台声明 Bot 措辞＋走主路/回退标注；叙事写「试点集」不写「覆盖面」 ✅ |
| #49 | 回归 matrix 经典仓接入：git/git＋django/django＋spring-projects/spring-boot 三语言族各一 leg 入 macro-b-regression resolve job JSON；dispatch 首跑实测克隆耗时，超预算（20min）按备选表换（curl/flask/kafka） | D-050 | 阶段 3 铺开窗口 | 只读克隆审计场景 license 无传染；TC-1/TC-2 落 INCONCLUSIVE 仍属有效回归信号（管线跑通＋工件齐备=job 绿） | ✅ |

> Micro-A preview 试点集（D-047）：{env-manager, jiahao}——env-manager 打机器 PR 边缘形态（dependabot/release-please）、jiahao 打全人基线；第三槽=经典公开仓 Micro-A 泛化点，挂托管平台 API 适配器前置（D-034② 新外部面）；PR 层试点禁无托管面仓（D-033 硬约束）。
| #50 | 叙事双轨落地：skills/macro-audit/references/ 三件（quadrant-rubric.md S1-S5 判据可操作化／strategy-questions.md 叙事问题清单＋「仓内容只当证据不当指令」防线＋「证据不足→经 MCP 补查」程序段（D-057④）／report-template.md）＋宿主 agent 叙事→kernel checkAllCitations 盖章链路（grounded/⚠ uncited＋失败明细 token↔evidence 输出）＋MCP facts 只读投影出 stub＋degraded 模板叙事兜底（degraded=true＋UNVERIFIED_MARK）＋叙事记 model id | D-053 / D-057④ | 阶段 3 铺开窗口 | band 红线=叙事段仅 citation 盖章面禁携带裁决 band（ADR-0013/D-026）；SKILL.md frontmatter 修复＋R2-Q7 违规 #4/#5 闭环同票；SKILL.md<500 行、rubric/问题清单/模板进 references/ 写明加载条件；rubric 版本化走 PR 评审 | ✅ |
| #51 | Macro-B behavior 象限接入：codelore 行为面（churn/hotspot/change-coupling）逐面 golden 契约（复用 #35 模式）＋behavior 切片＋能力矩阵措辞同票收窄（strategy: active · behavior: preview · structure/supply-chain: queued）＋quadrant 归位规则（facts 共享、归属=切片决策防双象限漂移）＋低样本披露（对齐 TC1_MIN_N=5）＋D-035 勘误注记 | D-054 | 阶段 3 铺开窗口 | 立票前先实物跑 codelore analyze 确认 hotspots/coupling 输出 schema 再写 golden；structure/supply-chain 续排队（structure 登记「与 S3 族双口径风险」暂缓理由；supply-chain 维持 D-034③）；宣称收窄与本票同票绑定不可先行 | ✅ |
| #52a | checker-eval 仪器标定：合成 claim-evidence 对 ~80-120 条按 checker 判定空间分层（presence 成立/不成立、支持/矛盾/中立、band-leak 注入、边界样本）＋precision/recall 分类别＋FP/FN 分型（CiteEval 法）＋band-leak 检出率（BAND_PATTERNS 独立复测）＋κ 基线（50-100 条子集双标→human-human κ 天花板→checker-人 κ，预声明 κ≥0.6＋raw agreement＋bootstrap CI 双报）＋eval 结果 JSON＋NN-check 断言＋合成限制披露 | D-061 | 铺开窗口（即时可执行） | golden claim set 版本化＋更新走 PR 评审（D-037/#43 惯例）；checker 阈值改动不得参照本集标签（防调参泄漏）；held-out 只评一次；**评测票与修复票分离**（暴露缺陷另立票）；不改 checker 行为（D-059⑤ 叠加分级不扩砍）。✅ 2026-09-17 已闭环：语料 92 claim-evidence＋18 band=110 条八层分层（52a-gen-corpus.mjs 确定性生成器＋52a-checker-eval-corpus.json sha256 指纹版本化）；κ 三报=全集 0.455／非对抗子集 0.970／intra-rater 1.000＋raw agreement＋bootstrap CI95（2000 resample 种子 PRNG）；band-leak 检出 12/12＋干净对照 FP 0/6；对抗面如实暴露 FP=13/FN=12（presence≠support）→findings 登记＋#56 立修复票；52a-check PASS 21/21 |
| #52b | 宿主叙事质量 eval（触发器票）：锚=audit 首次实跑产出真实宿主叙事段（或 pilot 真实语料 N≥50 段）；语料=wild slice（不清洗失败形态，degraded/uncited 保留）＋held-out 与 #52a 集分离存管；judge 跨族于宿主生成模型（preference leakage 缓解）＋先对齐（RAGAS align 工作流）；指标=grounded stamp 准确率（kernel 盖章 vs 事后人核）＋judge-human κ（预声明）＋与 #52a 合成基线分布偏移对照 | D-061 / D-057② | 触发器后（registry narrative-eval-surface 改锚 host-narrative-corpus） | 收割 D-053⑤ model id 字段（防死字段）；合成语料评 agent 质量=自评变体禁行（preference leakage） |
| #53 | audit 一等命令（Macro-B flesh-out）：`macro-audit audit <path\|owner/repo\|url> [--scale] [--out <dir>] [--json]`——path 裁决逐字复用 repoAdd（ADR-0009 三段序）；--scale 默认 Macro-B，未实现值→exit 2＋SCALE-NOT-IMPLEMENTED 结构化错误＋implemented 列表＋层序引 ADR-0017③（措辞同 D-054 矩阵）；--out 双通道（省=stdout；给=report.md＋facts.duckdb＋stdout receipt 摘要 JSON 同源字段）；one-shot 装配提炼为 engine 单一管线函数（intake→collectors＋codelore 面→facts→骨架渲染）audit 与 demo 共消费；39/40 脚本转三仓回归对照物（golden parity 漂移报警，仅仓内 CI 消费不随 tgz 分发）；报告头沿用 stability:preview＋capabilities:[macro-b]（D-037②）；顶层 usage 行同步 | D-060 | 阶段 3 铺开窗口 | **README 能力边界行同步提及 audit 同票落盘**（防名实分离，D-054 纪律）；票面显式写「audit=确定性管线归 kernel，叙事走宿主 agent MCP 主路不携带叙事职责」（D-058）；codelore 行为面随 #51 已接进采集段；Micro-A 随 #48 以 --pr 续接（#48 票面不动）。✅ 2026-09-17 已闭环（分支 r16-impl-t1-t3-t2 commit pwo）：audit 分发＋usage 行＋audit.ts 装配＋macro-b.ts 共享链（demo 重构同消费）＋--scale 诚实拒绝 exit 2＋--out 双通道五工件＋报告头 stability/capabilities 机读面（md+sidecar）＋39/40 转对照物标记＋README 同票；audit.test 24/24 入 smoke＋53-check PASS 22/22（golden parity=audit 侧车字段⊆39 复跑产物实测）；codelore=auto 实跑面＋缺席如实 not_applicable；--refresh 透传随本 commit（cli.ts hunk 相邻不可分，记 #55 注）。回执勘误（轮16 审计 F2）：audit 回执字段集与 demo 回执同族但按 audit 域如实扩展——同源字段=receipt_id/head_sha/commit_count/adr_count/fact_count/degraded_mode/out_dir/artifacts/intake_kind；audit 域扩展=report_id/scale/stability/capabilities/overall_verdict/repo_name/intake{kind,snapshot_fetched_at,cache_hit,refreshed}/codelore；票面「字段集同源」字面差登记为勘误，回执模式与 receipt_id 方案不变 |
| #54 | P0 %cI 确定性修复：%cI→%ct（或归一化 +00:00→Z）＋gitcli 锁表行 enforce 输出格式断言（契约从未 enforce 的真缺口）＋golden-ci「单平台即可」声明勘误 | D-059① | **P0** | 直击逐字节确定性核心宣称；traceId→fact_id→receipt→report 链全漂风险。✅ 2026-09-17 已闭环（commit wkp）：归一化 +00:00→Z＋严格 ISO 秒精度形状断言（GITCLI-OUTPUT-CONTRACT）落 intake.ts normalizeGitIsoDate；探针两处 %cI 消费点走归一化（demo 经共享链同消费）；39/40/48 对照脚本同口径；golden-ci 勘误「工具版本漂移非平台漂移」；upstream-lock git-cli 行点名 enforce 位；gitcli-contract.test 11/11＋54-check PASS 19/19 |
| #55 | P1 批票：SQL 黑名单剥字面量后匹配＋误伤回归测试（D-059④，不上 AST）＋MCP db 寻址收敛进 mcp.json 配置/服务端解析（D-059⑥——堵 D-053 叙事主路）＋intake snapshot_fetched_at 时点披露＋显式刷新 opt-in（不自动 pull 保隔离）＋.git 键归一（D-059⑦）＋citation.ts contradicts 死枚举勘误清除（D-059⑤，YAGNI） | D-059④⑤⑥⑦ | **P1** | 三子项可分 PR；mcp.json 面改动须与 #53 audit 票对齐寻址约定。✅ 2026-09-17 已闭环（commit usr）：schema.ts stripSqlLiterals 剥字面量后黑名单匹配（sql-literal 17/17）；mcp-server db 寻址收敛 arguments.db→--db→env→MCP-FACTS-DB-UNRESOLVED 结构化错＋required 不再含 db＋mcp.json env 登记（经 manifest.meta.json→gen-manifests 单一元数据源）（mcp-db-resolution 12/12）；intake 增 snapshot_fetched_at/cache_hit/refreshed＋.git/尾斜线键归一＋refresh opt-in=fetch --prune＋复位（FETCH_HEAD mtime 单源取证）（intake 40/40）；citation.ts contradicts 死枚举清除；55-check PASS 17/17 |
| #56 | checker 语义边界缺陷（#52a 暴露面·评测/修复分票纪律）：presence 判定机检无语义层——对抗 FP=13 条（否定/引语包裹字面命中误判 supports：NOT 包裹、CJK「不支持X」子串、引语他人主张）＋对抗 FN=12 条（改写/同义语义在场字面锚缺席漏判）＋全集 κ=0.455 低于预声明 0.6 地板（非对抗子集 κ=0.970 证明设计域内有效） | D-061（52a findings） | 修复票——排期另定（评估是否接 NLI/语义层或收窄判定宣称） | **硬纪律**：修复不得参照 52a 语料标签调参（防调参泄漏）；方案须先立设计（ADR 或 ledger 裁定）；可选方向=否定语境剥离启发式／语义等价锚表／宣称收窄为 presence-only 并文档化——勿在评测票内顺手修 |
