# GLOSSARY — macro-audit（6F）

> 术语载体——领域唯一语言在此定义，词条不写实现细节。「决策与术语分别落在哪」只在 [`docs/authority.md`](docs/authority.md) 成文。

## 治理与载体

**Decision Carrier（决策载体）**：承载某一类决策正文的仓库文件。
_Avoid_: 把同一决策复制进代码注释、README 或归档。

**Authority Surface（权威面）**：「决策与术语分别在哪」的声明面——仓内只允许一处成文。
_Avoid_: 在多个文件各写一套权威声明。

**Design Pointer（Design 指针）**：写在约束点上、把读者指回决策载体的单行注释；格式以 `docs/authority.md` 为准。
_Avoid_: 把完整决策理由写进注释。

**Historical Fingerprint（历史指纹）**：只用于历史溯源、不承载现行权威的编号，如 `D-NNN`、`A-NNN` 与旧 BACKLOG 票号。
_Avoid_: 用历史编号承载新决策。

**Baseline Corpus（基准语料）**：用于差分重校准的不可变外部语料，按版本钉持有；它不是产品上游依赖。
_Avoid_: 把基准语料当成产品上游依赖。

**Live Contract（活契约）**：运行期被守卫消费、其可执行引用必须能解析的登记表或夹具；与只保历史字节的 Frozen Artifact 相对。
_Avoid_: 让活契约静默积累死引用。

**Frozen Artifact（冻结件）**：字节冻结的历史产物，只保证可回查、不再作为现行基准。
_Avoid_: 把冻结件当现行契约断言。

## 审计与尺度

**Audit**：对工程产物做带证据引文与可驳回裁决的结构化判定；输出必须可追溯到文件、commit 或度量值。

**Macro Audit**：跨仓到仓库级的审计视角，输出叙事化报告而非行级评论。

**Micro Audit**：单文件或单次提交粒度的审计，输出行级带引文评审或单文件质量卡。

**Scale**：审计粒度层级，共 5 档：Macro-A / Macro-B / Macro-C / Micro-A / Micro-B；共享证据层与裁决层。

**Macro-A（跨仓战略审计）**：多仓组合的战略对齐审视，触发器为季度/手动，输出战略叙事报告。

**Macro-B（仓库级四象限审计）**：单仓全景评审，四象限=结构 / 行为 / 供应链 / 战略。

**Macro-C（演化考古审计）**：单仓时间维度的演化审视，输出演化对比报告。

**Micro-A（PR 级 diff 审计）**：单次提交/PR 粒度审计，输出行级带引文评审 + verdict-gate。

**Micro-B（文件级审计）**：单文件粒度审计，输出文件质量卡（只读投影，advisory 不入裁决路径）。

## 证据与裁决

**Evidence Gate**：完成声明必须可核验；任何「完成/通过」须附行号、commit 或 SARIF 行等证据。

**Sufficiency Gate**：证据不足时标记 `data doesn't show` 并发起 GapRequest，禁止硬凑结论。

**Adjudication Protocol**：5 scale 共享的 verdict-gate 配置（证据门槛、申诉、override、审计日志）。

**Receipt（裁决回执）**：内核 CLI/CI 对审计结论出具的可离线复核回执，携带证据引用与判定结果。

**Provenance String（溯源串）**：现行报告内嵌的出处坐标（仓内相对路径＋行/节位），供读者回查引文；须可解析、不含本机绝对路径、不指已退役路径，且只作**出处**不构成裁决输入（冻结件的原始现场不受此限）。
_Avoid_: 把本机绝对路径或已退役路径写进报告出处；把出处坐标当裁决依据。

**Kill Criterion（预声明判据）**：跑被测仓前写下并 commit 的可操作判据；真判据未命中=「前提未被支持」的合法数据。

**Positive Control（正对照）**：与真判据共享 detector 路径的已知答案样本，只证明管线能响应，不计入价值判定。

**Failure Semantics**：采集失败、叙事超时、裁决驳回、渲染异常时的降级路径必须显式，禁止沉默失败。

**违约两级处置**：协议级违约（行形状/定界坏）→fail-fast；字段级病态→quarantine（字段 null + ⚠malformed，审计继续）。

**Quarantine 字段处置**：分类器永不 throw，逐字段返回 clean/normalized/quarantined + reason_code；处置归消费面与报告层。

**Reason Code 受控词表**：处置事件的分类码；open-ended，新码经 known-gaps 立法进场，未识别码 default-deny。

**Intake Health 节**：报告固定摄入健康节，含逐字段恒等式、受影响 commit 数、quarantined-only 逐 SHA 表。

**Dual Reporting（勘误式双读数）**：原读数不撤回，修正读数以勘误/并列形态发布并附 delta 表。

**Assignable Cause（可归属原因）**：异常读数判 invalid 的唯一凭证；无可归属原因时默认接受并升级调查。

**静默窗**：发布前的稳定性观察期；零试点下「无新 findings」是空真，不是稳定性证据。

## 集成与报告

**Hub-of-Facts with Federated Adjudication**：共享 DuckDB fact table + 定义集中、执行分散的联邦裁决。

**SSOT**：同一审计事实只由 fact table 一处持有，5 scale 共享读、禁止跨 scale 复制。

**Event Sourcing**：事件单向追加写入 fact table，报告可重放，schema 演进靠版本号。

**Read Model**：各 scale 从 fact table 投影的语义层，独立优化，不做 UI 抓取。

**Cross-Scale Correlation Key**：跨 scale 关联同一 commit/PR 的 trace_id / baggage_id。

**Semantic Domain（语义域）**：同一批事实的判读归属层；`structure/shape`=形态测量读数，`S3/budget-attribution`=预算归因读数。同一面可被两层读，归属由读它的那一层决定，不由采集它的那一层决定。
_Avoid_: 把 structure 观测直接当 S3 裁决。

**Report Template**：共享骨架 + scale-specific 切片；骨架章序=执行摘要→四象限/裁决→证据→行动建议。

**Strategic Quadrant**：四象限之一，评「产品往哪去、值不值得」；覆盖 5 scale。

**S1 定位收敛**：意图声明与实际交付的收敛度。

**S2 ADR 质量**：ADR 是否为真决策（Context / Options / Consequences / supersede 链 / 当时写）。

**S3 门面预算 vs 结构预算**：维护预算花在门面还是结构。

**S4 演化方向**：系统是否沿声明方向演化，还是漂移/侵蚀。

**S5 所有权边界匹配**：模块分解与所有权分解是否同构；单人仓信号弱须降权披露。

**Hotspot**：CodeLore 的「变更频率 × 复杂度」乘积，直接复用不自创。

**Report Aggregation**：多 scale 输出合并规则（时间对齐 / 证据去重 / 冲突标记 / 主裁决来源）。

**Conflict Resolution**：scale 间结论冲突时的仲裁规则，不允许各自为政。

**Actionable Recommendation**：报告末章，须带 verdict-gate 印记；未过裁决的建议标 ⚠ unverified。

## 演示与发布

**Demonstration Scenario**：5 scale × 关键/失败路径 = 10 条演示路径。

**Happy Path / Failure Path**：成功路径与显式降级路径，产物共用骨架、必须可对比。

**Degraded Demonstration**：失败路径产物必含 ⚠ unverified / 降级注释 / 裁决拒绝印记。

**Release Preview**：`capability N of 5 · preview` + 0.x 语义；build-scope ≠ release-sequence。

**Generalization Gate**：层 GA 须引 ≥1 非自有公开仓完成真实泛化验证，试点成功不算泛化。

**Demo Fixture**：确定性生成的合成 git 仓，必须带合成披露戳，不得冒充真实审计。

**Agent Plugin**：Agent Plugins 1.0.0 五层盒子 + 双 manifest；内核 CLI 同二进制四外壳。

**Default Mode**：开箱路径=C 类用户在 agent 工作流内触发 Macro-B 四象限评审。

**Repo Intake**：本地路径默认 + 远程 URL 显式 opt-in；clone 到隔离缓存、全深度、浅 clone 拒绝。

**Value Validation Loop**：主干=在真实仓库跑通「采集→fact→叙事→裁决→报告」，四阶段串行。

**Acceptance Gate**：首报验收 A 形式→B 内容→C 信任裁决，三层串行、预声明判据。

**SWMR Facade**：存储层只准入单写者，竞争失败 fail-fast；升级阶梯 L0→L3。

**Hosted API Adapter**：GitHub REST + env token 主路，gh 认证态可选回退，无认证显式降级。

**Instrument Dialect**：上游工具版本造成的等价拼写差异，归防腐边界吸收并独立披露。

**Subject Canonical Form**：仓根相对、`/` 分隔、NFC、无空段的文件 subject 规范化路径。

**File Lineage**：rename 连续性的一等事实；血缘是附加事实非身份本体。

**Observation Set**：一次采集在 HEAD 时点产出的全部 facts；append-only，`at:<sha>` 可 pin。

**Raw Evidence Layer**：上游原始输出的 append-only 保真层，不进文件卡查询主路径。

**Known-gaps 台账**：契约覆盖缺口登记册（gap_id / reason / 证据 / status / owner / review_by / trigger）。

## 品牌与边界

**6F**：公开品牌名；六句 F 宣言=Facts / Federation / Forensics / Five scales / Frankness / Fingerprints。

**Plugin/Marketplace 双层命名**：plugin name=`6f`，marketplace name=`xxx91n`，内核名 `macro-audit` 不变。

**Kernel/Agent 职责边界**：确定性面归 kernel，编排与概率性面归宿主 agent；band 永不归 agent。

**Canonical→Derived**：README.md 为 canonical，README.zh-CN.md 为 derived；可落后但不得假装新鲜。

**暴露梯度**：Stage-0 被动挂牌 → Stage-1 定向邀请 → Stage-2 公开推广（四判据 + 30 日静默窗）。
