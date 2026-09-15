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

> 次序（R7 更新，DoR 锐化 per D-040：开工闸门=依赖闭合即可拉，波次=协调/验收装置）：#32~#34 done → #35 关键路径 → #44/#45/#41a 就绪即做（filler 优先级不占关键路径）→ #36/#37 → #38 → 其余随层序；#41b 不入波次（blocked-by 用户闸门＋listing-submission）。
> 上架动作未授权（D-026/D-027 用户闸门）；各票需求面在立票环节（to-spec/to-tickets）填实。

| 票号 | 标题 | 来源 D-xxx | 挂门/前置 | 备注 |
|---|---|---|---|---|
| #32 | B1.2 落地：31 份 prompts「## 收尾」段首黑体硬要求块 | D-029 | 无 | 已于轮 6 整理环节执行完毕 |
| #33 | T7 挂门机检化 guard：扫全部挂门项「最迟时点/触发事件/复审时点」到期报警 | D-026 / D-034④ / D-024 | 阶段 3 最优先 | 横切兜底；输入含三触发器与暂缓面集复审时点。✅ W1 已落地（33-check.mjs 8/8）。**扩展子项（D-041）**：registry watch 三态（event_bound/manual_watch/risk_accepted）五要素齐备化＋守卫扫 manual_watch「复审逾期 or 确认缺失」＋逾期转 risk_accepted 候选＋event_bound/total 覆盖率输出＋decided 状态枚举登记 |
| #34 | plugin.json 对齐 Agent Plugins 1.0.0（$schema const / schemaVersion / skills·mcp·extensions 形态）＋ AJV 校验入 guard | D-036 / D-012 余款 | 上架硬前置链 | 独立小票（明示修正 handoff 并入分发收尾票原建议） |
| #35 | CodeLore 契约面扩开首批 ≈30 面（演化主干 12＋S3 族 6＋S5 族 12），逐面 golden 契约测试 | D-035 / D-034 | Macro-C preview 前置 | ADR-0014 纪律：适配层禁业务规则 |
| #36 | CodeLore LLM 面（explain 族）env 门控＋成本验收 | D-035 | S4 ADR 假设抽取前置 | 独立验收，不混入 #35 |
| #37 | 试点面可用性审计：三仓 PR 人/机比＋supersede 链完整度实测脚本 | D-033 | Macro-C/Micro-A 试点前置 | |
| #38 | Macro-C preview：anysearch-cli 校准＋报告强制披露单仓校准限制＋happy+failure 演示双件 DoD | D-034 / D-032 / D-033 | #35/#36/#37 | 第二能力层 |
| #39 | Macro-B 三仓 one-shot＋jiahao 持续回归接入 CI | D-033 / D-034 | 回归接入 CI = 多写者触发器 (a) 激活点 | 激活即实测封口任务 7 |
| #40 | 非自有公开仓泛化验证 ≥1（URL opt-in 首实用户） | D-033 / D-013 | Macro-B GA 前置 | |
| #41a | 分发收尾·仓内文档面：examples/first-report/ 复制四件＋披露 README／README 能力边界＋preview 标注＋「Try on a real repository」节／仓根编年首条落地 | D-030 / D-031 / D-032 / D-038 / D-039 / D-040 | 就绪即做（filler）；DoD 含「边界文案以冻结决策为唯一事实源」护栏 | 拆自 #41（D-040）✅ 2026-09-16 已闭环（A-051）：四件+披露 README／边界矩阵 capability 1-2 of 5 preview+三层 Not yet+0.x+Try 节／仓根 CHANGELOG M-001+engine 指针闭环（W4 悬空清零）；41a-check PASS；上架动作未执行（用户闸门） |
| #41b | 分发收尾·上架面：listing 资产／marketplace 字段查证（preview 标注字段＋版本元数据 schema＋竞品扫描）／凭据申请 | D-031 / D-037 / D-026 / D-027 | **blocked-by：用户闸门明示＋listing-submission 事件**——不排程不入波次不占 WIP | 拆自 #41（D-040）；上架动作停用户闸门 |
| #42 | 上游队列：Scorecard/repomix 探针＋CodeLore sqlite dump 对照评估 | D-023 / D-034 / D-035 | 层需求拉动，不插队 | ✅ 2026-09-16 已闭环（A-047）：42-dump-comparison.md 三轴对照落文＋呈报=维持逐面契约不采纳（锁表 evaluating 不翻、采纳须另立 ADR）＋registry upstream-probes-scorecard-repomix pending+manual_watch 不插队＋供应链象限披露核查实物断言全中；42-check PASS 43/43 |
| #43 | 样例 golden CI：CI 重渲染 fixture 并 diff，更新走 PR 审查 | D-030 | 阶段 3 候选，与 #33 同批立项 | ✅ 2026-09-16 已闭环（A-048）：golden-ci.yml 两腿重渲染+逐字节 diff（engine golden=gen-demo-golden.mjs+porcelain；examples=bundle 物化 fc00d458 worktree+e39468c overlay+等签名 README 重构，逐字 README 命令）；禁自动回写直通 main、更新只走 PR 审查明文；43-check PASS 28/28 |
| #44 | 版本与上游锁定制度化：engine/upstream-lock.yaml 种子行＋docs/versioning.md 衔接＋README §3 上游表状态列绑锁表为机读权威＋守卫族（版本断言/锁表新鲜度/三处标注同源/编年指针校验，advisory→enforce 两段式） | D-037 / D-039 | 阶段 3 早期 | ✅ 2026-09-16 已闭环（A-049）：锁表六行种子（codelore active 0.28.0+--version 契约/duckdb+git-cli active/scorecard·repomix-gitingest planned/sqlite-dump evaluating+risk_note）＋README §3 唯一权威绑定＋engine CHANGELOG Unreleased 引 lock＋44-check PASS 56/56 两段式（ENFORCE 段已 enforce；ADVISORY=新鲜度逾期+binary 缺席）＋M-001 superseded 注记补全（0002/0010）；禁 range/浮动 tag；更新走手动窗口＋golden 回归护航 |
| #45 | 演示入口：fixture 生成器＋definitions 三场景（happy-path/degraded-supply/degraded-incomplete）＋golden/＋demo --scenario 命令＋CASRAI 式披露块 | D-038 | 阶段 3 早期（D4 deadline 实到）；#43 前置 | ✅ 2026-09-16 已闭环（A-050）：生成器/definitions×3/golden×3/demo 命令/披露块四印记全落盘，demo.test 38/38 入 smoke，45-check PASS；合成数据不冒充真实审计；demo 走同一 Repo Intake 本地路径 |
