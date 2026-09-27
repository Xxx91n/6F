# R38-Q3 调研题面（atomcode）

仓库 D:\Aworker\6F=工程内容审计产品 6F（Agent Plugin 五层盒）。R38 轮已立两裁：D-150（CodeBuddy 试用射程裁五件：核销呈报／试用三裁=插件全路径主验收线+CLI 裸跑对照·目标仓=本仓自审+env-manager·验收判据三段／兼容性面预设证伪实证收口零改动〔官方兼容 `${CLAUDE_PLUGIN_ROOT}`+`.claude-plugin/` 双源〕／渠道合规+注记义务+D-059③ 触发器兑现+D-075 路径入预案／试用先行排序）；D-151（执行协议三裁：parity 基线=(iv) 安装树自对照〔钉安装树 SHA、字段级 parity 主判据、r36 降参照轶事、(ii) 留应急降级〕／封口判据=预声明 charter＋exit/success 双轴〔关窗=过程完备性≠缺陷清零〕＋feasibility 标题语义＋关窗禁写触发器形态／产物=(α) `.scratch/macro-audit/trials/` 新目录+一句话语义声明同 commit＋SBTM 三件套〔charter→session→debrief 报告〕＋findings 票面五要素+deduplicate-first）。

## 问题

完备性核查裁——本轮裁定面是否已穷尽、定稿是否早产。对抗性清扫候选残面（请逐件判定「属裁面/属执行参数/属伪面」）：
① D-059③「selftest→doctor 升级触发器=首个外部用户安装链路出现」已登记兑现——其触发后果动作（文档升级内容）是机械执行还是需另行裁定；
② CodeBuddy 宿主面内 sub-surface：IDE 版 vs CLI 版安装路径/mcp.json 约定差异是 charter 参数还是独立裁面；
③ env-manager 目标仓在本机的可得性/路径钉定与 fallback（若仓不可得的备选目标仓裁定）；
④ duckdb 绑定在用户试用机的获取流（D-075 已钉 MCP 面永不自动拉包+doctor --fix 唯一主路——runbook 执行覆盖 or 残余裁面）；
⑤ 试用三悬点（marketplace 读取/.mcp.json 自动发现/Windows 展开）实测后是否需要 registry event 绑定（Trigger-gated Closure：试用关窗事件驱动注记②从「实证待真机收口」升级为已实证）——即「试用关窗事件」应否注册为 registry 事件条目；
⑥ 批2 与试用「先行」的语义精度：严格串行（批2 等试用 findings 回流）还是并行可辩（348 条字面钉处置与试用互不依赖时）——D-150⑤ 的「先行」是否留有并行裁面；
⑦ 本仓自审目标态：开发 worktree 当前存在 index staged-revert 中间态（80 件 MM/D vs HEAD）——审计读 git objects 不受 worktree 污染是否需事实核查入 charter 环境快照；
⑧ CodeBuddy 侧 agent 驱动的 Macro-B 审计执行路径（skill 壳引导 agent 走 CLI 命令还是 MCP tools）是宿主面内自由执行还是须裁的最小路径约定；
⑨ 试用 findings 的分诊执行者与时点（我回流会分诊 vs 票面预填后试用窗口内即分诊）——D-146 分诊的执行分工是否需裁；
⑩ preview 披露在 CodeBuddy 会话面（agent 话术层）的呈现义务是否需要补一条「宿主面披露行」（D-150⑤ 负向只禁了对外呈报虚报，会话内 agent 行为面未钉）；
⑪ 试用本身是否需要 BACKLOG 票载体（#8x 编号、票面内容、与批2 票的依赖关系）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-150/D-151 刚立两裁的逐字覆盖范围、D-059③ 触发器原文与后果语义、D-146 分诊执行纪律、D-142 钉 SHA 惯例、D-130② 双真源、D-131 落点判据、D-075 自愈分层、D-055 hooks 禁建、D-053 叙事双轨〔agent 叙事面〕、BACKLOG 票面惯例条款、以及全部 trigger/registry 相关条款）；
2. 回顾 docs/adr/ 与 CONTEXT.md（Pilot-surface Audit、Trigger-gated Closure、Watch Tri-state、registry 词条〔若有〕、Kernel/Agent 职责边界）；
3. 工业界成熟落地的心智模型（重点）：pilot/trial readiness checklist 惯例（go/no-go 准备度核查的成熟清单类目——comms plan/rollback/support channel/success instrumentation/data-legal 各面）；探索式测试 charter 完备性惯例（SBTM 中 charter 该覆盖什么不该覆盖什么）；「完备性核查」本身的成熟形态（design review completeness checklist/pre-mortem/pre-flight checklist 惯例——如何系统性地找「漏裁面」而非凭直觉）；任务编排中「串行 vs 并行」的判定惯例（依赖图先行 vs 反馈门控先行）；
4. 给出推荐与理由：对①~⑪逐件判定裁面属性并给处置建议；若发现题面未列的残面如实补充；显式指出与账本任一 current 决策的冲突点（冲突则标 revised 呈报，禁静默改向）。
