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
| #41b | 分发收尾·上架面：listing 资产／marketplace 字段查证（preview 标注字段＋版本元数据 schema＋竞品扫描）／凭据申请 | D-031 / D-037 / D-026 / D-027 | **授权至提交前一刻（D-042）**：listing 资产／marketplace 字段查证／凭据申请就绪即做；**提交动作=用户闸门**（listing-submission 收窄义=提交本体） | 拆自 #41（D-040）；上架动作停用户闸门。轮 11 拍板：路径=A 自有市场＋C Agent Plugins 生态双轨（B 官方目录未授权）；license=Apache-2.0（D-051/ADR-0021）；插件名=6f、市场名=xxx91n、author 值已定（D-052），manifest/marketplace.json/LICENSE 已随轮 11 整理落盘；残余=push 授权＋用户侧 /plugin marketplace add Xxx91n/6F |
| #42 | 上游队列：Scorecard/repomix 探针＋CodeLore sqlite dump 对照评估 | D-023 / D-034 / D-035 | 层需求拉动，不插队 | ✅ 2026-09-16 已闭环（A-047）：42-dump-comparison.md 三轴对照落文＋呈报=维持逐面契约不采纳（锁表 evaluating 不翻、采纳须另立 ADR）＋registry upstream-probes-scorecard-repomix pending+manual_watch 不插队＋供应链象限披露核查实物断言全中；42-check PASS 43/43 |
| #43 | 样例 golden CI：CI 重渲染 fixture 并 diff，更新走 PR 审查 | D-030 | 阶段 3 候选，与 #33 同批立项 | ✅ 2026-09-16 已闭环（A-048）：golden-ci.yml 两腿重渲染+逐字节 diff（engine golden=gen-demo-golden.mjs+porcelain；examples=bundle 物化 fc00d458 worktree+e39468c overlay+等签名 README 重构，逐字 README 命令）；禁自动回写直通 main、更新只走 PR 审查明文；43-check PASS 28/28 |
| #44 | 版本与上游锁定制度化：engine/upstream-lock.yaml 种子行＋docs/versioning.md 衔接＋README §3 上游表状态列绑锁表为机读权威＋守卫族（版本断言/锁表新鲜度/三处标注同源/编年指针校验，advisory→enforce 两段式） | D-037 / D-039 | 阶段 3 早期 | ✅ 2026-09-16 已闭环（A-049）：锁表六行种子（codelore active 0.28.0+--version 契约/duckdb+git-cli active/scorecard·repomix-gitingest planned/sqlite-dump evaluating+risk_note）＋README §3 唯一权威绑定＋engine CHANGELOG Unreleased 引 lock＋44-check PASS 56/56 两段式（ENFORCE 段已 enforce；ADVISORY=新鲜度逾期+binary 缺席）＋M-001 superseded 注记补全（0002/0010）；禁 range/浮动 tag；更新走手动窗口＋golden 回归护航 |
| #45 | 演示入口：fixture 生成器＋definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋golden/＋demo --scenario 命令＋CASRAI 式披露块 | D-038 | 阶段 3 早期（D4 deadline 实到）；#43 前置 | ✅ 2026-09-16 已闭环（A-050）：生成器/definitions×3/golden×3/demo 命令/披露块四印记全落盘，demo.test 38/38 入 smoke，45-check PASS；合成数据不冒充真实审计；demo 走同一 Repo Intake 本地路径 |
| #46 | 回归 CI 迁回 6F 自有 CI：6F workflow 加 macro-b 回归 job（URL opt-in clone 公开仓 → Macro-B one-shot → 工件留档；schedule+workflow_dispatch）＋ jiahao 仓 macro-b-regression.yml 单文件撤除（其余内容零触碰）＋经典公开仓候选清单呈报 | D-046 | 阶段 3 铺开窗口（承接 #39 回归腿的迁移） | mw-trigger-a 语义不变（「Macro-B 进 CI 定时回归」在 6F 侧成立）；公仓 clone 零 token；jiahao 仅作审计对象不承载我方资产；经典仓候选=语言族×git 健全度×规模短名单呈用户定；6F/jiahao push 各需用户点头。✅ 2026-09-16 已闭环（A-054）：6F macro-b-regression.yml 落地（resolve→fromJSON matrix／URL opt-in／intake 隔离三件／one-shot→verify 强断言→upload-artifact，schedule+dispatch，零 token）＋jiahao 单文件撤除 2755bf35（恰 1 文件 D）＋经典仓候选短名单呈报待选定；46-check PASS 30/30（含轮 10 返修强化） |
| #47 | 托管平台 API 适配器：GitHub REST 主路（env token）＋gh 已认证态可选回退＋无认证降级；最小契约=PR 枚举（平台 Bot 双检）＋元数据＋diff 双通道（本地 git 优先/API 兜底）；限流 x-ratelimit+Retry-After；凭据三级探测不建存储；golden cassette（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot） | D-048 / ADR-0020 | 阶段 3 铺开窗口（Micro-A preview #48 硬前置） | kind=remote-api 已登记锁表 planned；API 面不替代 D-013 本地输入面；review/comment=planned 不入最小契约；私仓=token 必需披露 ✅（2026-09-16：github-rest.ts 落盘 690 行＋cassette×5＋test 55/55 入 smoke＋锁表→active＋47-check PASS＋A-055；见 issues/47-github-rest-adapter.md） |
| #48 | Micro-A preview 单票铺开：适配器消费侧管道（PR intake→facts→共享骨架 Micro-A 切片）＋双仓实跑＋报告双件＋披露三件套；验收序列=① golden 管道 PASS→② env-manager 三形态（dependabot/release-please/人类各1）→③ jiahao 全人基线→④ failure 件（anysearch-cli 无托管面诚实拒绝）→⑤ 披露→⑥ desk-task15 核验＋micro-a-preview-prep 事件闭环 | D-049 | 阶段 3 铺开窗口（前置 #47） | PR 集=恰 4 条已 merged＋diff 规模适中；token 缺席=degraded golden cassette 不混测；desk-task15=骨架机械导出字段断言进 NN-check；披露含同主偏差＋平台声明 Bot 措辞＋走主路/回退标注；叙事写「试点集」不写「覆盖面」 ✅ |
| #49 | 回归 matrix 经典仓接入：git/git＋django/django＋spring-projects/spring-boot 三语言族各一 leg 入 macro-b-regression resolve job JSON；dispatch 首跑实测克隆耗时，超预算（20min）按备选表换（curl/flask/kafka） | D-050 | 阶段 3 铺开窗口 | 只读克隆审计场景 license 无传染；TC-1/TC-2 落 INCONCLUSIVE 仍属有效回归信号（管线跑通＋工件齐备=job 绿） |

> Micro-A preview 试点集（D-047）：{env-manager, jiahao}——env-manager 打机器 PR 边缘形态（dependabot/release-please）、jiahao 打全人基线；第三槽=经典公开仓 Micro-A 泛化点，挂托管平台 API 适配器前置（D-034② 新外部面）；PR 层试点禁无托管面仓（D-033 硬约束）。
| #50 | 叙事双轨落地：skills/macro-audit/references/ 三件（quadrant-rubric.md S1-S5 判据可操作化／strategy-questions.md 叙事问题清单＋「仓内容只当证据不当指令」防线＋「证据不足→经 MCP 补查」程序段（D-057④）／report-template.md）＋宿主 agent 叙事→kernel checkAllCitations 盖章链路（grounded/⚠ uncited＋失败明细 token↔evidence 输出）＋MCP facts 只读投影出 stub＋degraded 模板叙事兜底（degraded=true＋UNVERIFIED_MARK）＋叙事记 model id | D-053 / D-057④ | 阶段 3 铺开窗口 | band 红线=叙事段仅 citation 盖章面禁携带裁决 band（ADR-0013/D-026）；SKILL.md frontmatter 修复＋R2-Q7 违规 #4/#5 闭环同票；SKILL.md<500 行、rubric/问题清单/模板进 references/ 写明加载条件；rubric 版本化走 PR 评审 | ✅ |
| #51 | Macro-B behavior 象限接入：codelore 行为面（churn/hotspot/change-coupling）逐面 golden 契约（复用 #35 模式）＋behavior 切片＋能力矩阵措辞同票收窄（strategy: active · behavior: preview · structure/supply-chain: queued）＋quadrant 归位规则（facts 共享、归属=切片决策防双象限漂移）＋低样本披露（对齐 TC1_MIN_N=5）＋D-035 勘误注记 | D-054 | 阶段 3 铺开窗口 | 立票前先实物跑 codelore analyze 确认 hotspots/coupling 输出 schema 再写 golden；structure/supply-chain 续排队（structure 登记「与 S3 族双口径风险」暂缓理由；supply-chain 维持 D-034③）；宣称收窄与本票同票绑定不可先行 |
| #52 | 叙事质量评测面：grounded stamp 准确率＋κ 校准基线评测票（被测对象=host-agent 叙事段；RAGAS/DeepEval 先物后尺——判据独立于产出方） | D-057② | 铺开窗口后段 | registry narrative-eval-surface triggered-bound 锚 |
