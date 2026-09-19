# quadrant-rubric — 战略象限 S1-S5 判据可操作化（v0.1 / D-004 文书化）

> 加载条件：宿主 agent 为**战略（strategic）象限**写叙事段时加载本文件；其余象限叙事不加载。
> 定位：本文件是 spec.md §D-004（Decision 4.1~4.6）与 CONTEXT.md S1-S5 词条的**文书化投影**——不新增判据语义、不设新阈值；阈值初版参数以 spec 原文为准，改动走 PR 评审。
> 红线：本文件只供叙事组织证据；**判据数值不得出现在叙事段的 band 断言里**（band 归 C 层人裁定，ADR-0013/D-026）。
> - **fact→维度归位**：维度归位的接线契约不在本文件（归 kernel 裁决面）。叙事段只按既有 facts 组织证据，**不得引用准入条件或自行归位维度**——归位是 kernel/接线票的确定性动作，不是叙事判断。

## 维度速查（判据名 → 操作化口径）

| 维 | 判什么 | 证据源 | 初版参数 / 回退 |
|---|---|---|---|
| S1 Positioning Convergence（定位收敛） | 「意图声明」（README 一句话定位、roadmap、epic 目标）与「实际交付内容」（功能面、PR 主题、issue 分流）的收敛度 | README/docs/roadmap/CHANGELOG/git log/issue+label/PR 标题 | 定位关键词覆盖率＋漂移起点检测；**不锁 70% hard rule**——交付试点仓清单＋校准流程（embedding 选型主路，关键词 fallback，人工抽检）；跨仓校准预留 |
| S2 ADR Quality（ADR 质量） | ADR 是否「真决策」：Context 张力/Considered Options/正负 Consequences/immutable+supersede 链/决策当时写而非事后补；含决策可逆性（confidence＋门类型 one-way/two-way＋回滚路径） | docs/adr/ 全量结构扫描＋git log --follow＋TODO/FIXME 密度对照 | 事后补写判定=YAML 时间戳头一致性核查清单；缺失头→回退方案；初版阈值「事后补写>90天占比>20% 判红」预留跨仓校准 |
| S3 Facade-vs-Structure Budget（门面预算 vs 结构预算） | 维护预算花在「门面」（God Object/巨类/单实现抽象/范式通胀）还是「结构」（边界清晰/内聚/适度抽象） | CodeLore 上帝对象分析＋抽象利用率＋shearing layers 识别 | spec 4.x 未单列本维判定参数——叙事只可组织既有结构象限事实，不得自创预算阈值；信号不足→标「⚠ 数据未接」 |
| S4 Evolution Direction（演化方向） | 系统是否沿声明方向演化还是漂移/侵蚀；含空位与负向声明（YAGNI 注释/被否选项/out-of-scope 记录）的诚实度 | docs/adr/ 假设段＋依赖方向违规趋势＋ADR supersede 链 | 主战场 Macro-C：ADR 假设提取=LLM 抽取＋人工复核回路（不能只信 LLM）；输出假设失效集对照表 |
| S5 Ownership Boundary Fit（所有权边界匹配） | 模块分解与所有权分解（git author 矩阵/CODEOWNERS/AGENTS.md）是否同构（Conway's Law 工程化） | CODEOWNERS＋git blame 作者-模块矩阵＋bus factor＋PR reviewer 分布 | **单人仓该维信号弱必须降权**：团队规模归一化曲线（单作者模块占比 vs 团队规模分桶）；报告显式标注「信号不足」回退路径 |

## 叙事组织规则（非判据）

- 每维叙事只回答：证据显示了什么（引 evidence_id 锚）——**不评 band**。
- 维度无证据→直写「该维证据面未接/不足」，不得用修辞掩盖。
- S1-S5 判据语义改动=改 spec.md §D-004 走 PR 评审，本文件随之同步版本号。
