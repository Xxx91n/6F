# quadrant-rubric — 战略象限 S1-S5 判据怎么用（v0.1 / D-004 文字版）

> 什么时候加载：宿主 agent 为**战略（strategic）象限**写叙述段时加载；其他象限不加载。
> 定位：本文件是 spec.md 战略 quadrant 判据簇（Decision 4.1~4.6）、ADR-0004 和 GLOSSARY.md S1-S5 词条的文书化说明（文字版）——不加新判据，不设新阈值；阈值初版参数以 spec 原文为准，要改就走 PR 评审。
> 红线：本文件只帮叙述组织证据；**判据数值不得出现在叙述段的判定档断言里**（判定档由 C 层人定，D-026）。
> - **事实到维度的归位**：归位规则不在本文件（在 kernel 裁决面）。叙述段只按已有事实组织证据，**不得引用进入条件或自己归位维度**——归位是 kernel/接线票的确定动作，不是叙述判断。

## 维度速查（判据名 → 怎么用）

| 维 | 判什么 | 证据源 | 初版参数 / 回退 |
|---|---|---|---|
| S1 Positioning Convergence（定位收敛） | 「意图声明」（README 一句话定位、roadmap、epic 目标）和「实际交付内容」（功能面、PR 主题、issue 分流）有多一致 | README/docs/roadmap/CHANGELOG/git log/issue+label/PR 标题 | 定位关键词覆盖率＋走样起点检测；**不锁 70% hard rule**——交付试点仓清单＋校对流程（embedding 选型主路，关键词 fallback，人工抽检）；跨仓校对预留 |
| S2 ADR Quality（ADR 质量） | ADR 是不是「真决定」：Context 张力/Considered Options/正负 Consequences/immutable+supersede 链/决定当时写而不是事后补；含决定可逆性（confidence＋门类型 one-way/two-way＋回滚路径） | 被审计仓 ADR 目录全量扫描＋git log --follow＋TODO/FIXME 密度对照 | 事后补写判定=YAML 时间戳头一致性检查清单；缺头→回退方案；初版阈值「事后补写>90天占比>20% 判失败」预留跨仓校对 |
| S3 Facade-vs-Structure Budget（门面预算 vs 结构预算） | 维护预算花在「门面」（God Object/巨类/单实现抽象/范式通胀）还是「结构」（边界清楚/内聚/适度抽象） | CodeLore 上帝对象分析＋抽象利用率＋shearing layers 识别 | spec 4.x 没单列本维判定参数——叙述只能组织已有的结构象限事实，不得自创预算阈值；信号不够→标「⚠ 数据未接」 |
| S4 Evolution Direction（演化方向） | 系统是沿声明方向演化，还是走样/侵蚀；含空位和负向声明（YAGNI 注释/被否选项/out-of-scope 记录）的诚实度 | 被审计仓 ADR 假设段＋依赖方向违规趋势＋ADR supersede 链 | 主战场 Macro-C：ADR 假设提取=LLM 抽取＋人工复核回路（不能只信 LLM）；输出假设失效集对照表 |
| S5 Ownership Boundary Fit（所有权边界匹配） | 模块分解和所有权分解（git author 矩阵/CODEOWNERS/AGENTS.md）是不是同一结构（Conway's Law 工程化） | CODEOWNERS＋git blame 作者-模块矩阵＋bus factor＋PR reviewer 分布 | **单人仓这个维度的信号弱，必须降权**：团队规模归一化曲线（单作者模块占比 vs 团队规模分桶）；报告明确标「信号不够」的回退路径 |

## 叙述怎么组织（不是判据）

- 每维叙述只回答：证据显示了什么（引 evidence_id 锚）——**不评判定档**。
- 维度没有证据→直接写「该维证据面没接上/不够」，不要用修辞盖住。
- S1-S5 判据要改=改 spec.md 战略 quadrant 判据簇（Decision 4.1~4.6）或 ADR-0004，走 PR 评审，本文件跟着改版本号。
