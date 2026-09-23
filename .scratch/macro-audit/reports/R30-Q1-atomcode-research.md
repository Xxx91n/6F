# R30-Q1 atomcode 深调研报告：加固 epic 收口后的下一设计焦点选型

> 运行：2026-09-23（atomcode -p 全景调研模式）；题面见 R30-Q1-research-prompt.md。
> 引擎实况：Tavily 全程配额耗尽→Exa+AnySearch 双引擎+本地产品库三源（原文核验：S1/S3/S6 web_fetch 已核验）；置信度=高（顶层）/中（B 内排序）。
> resume 锚：1b914999-0fc7-4de6-80c8-33d7cd8424df

## 1) 执行摘要（Tl;dr）

**推荐排序：B > A > C > D，置信度：高。** 工业界一致心智模型是“核心精度/稳定性锁定后，先补齐当前能力的端到端消费闭环，再向下一相邻尺度做广度扩张；加固尾巴仅在触发事件到达时处理，不做前置阻塞”。本产品加固 epic 已通过终审，Micro-A 适配器已 active、远程 intake 已在——B 中 Micro-A 全管线收口是边际成本最低、闭环价值最高的下一格；A 中未被触发器封口的薄项可作并行小任务清掉，但不作为焦点；C 继续值守复核纪律。

**置信度标注理由**：B 优先于 A/C 有强多源收敛（产品自身两条纪律 + SonarQube/Semgrep/CodeScene 演化史 + 稳定化-释放惯例），高置信；B 内部 Micro-A 与 Macro-C 谁先，取决于现有消费面哪个触发需求更实——这是产品内判断，调研只能给结构性偏向（Micro-A 依赖更少），中置信。

## 2) 分点结论

**结论 1：核心加固后“先收尾消费面、再扩张尺度”是主导惯例，不是反向。**
来源：[S1] Ansede ROADMAP 明文设有 "unlock gate"——"Before any net-new rule expansion: incident clustering must be benchmarked and verified"，即精度未锁前禁止扩量；但精度经终审锁定后（本产品已达成），路线图立即转向 Phase 3 Breadth Expansion。来源：[S2] Itera Research 稳定化文（2025-12）：功能构建停止后进入 stabilization period，验证的是“真实条件下可用”，不是继续加厚度。
→ 映射到本产品：加固 epic 通过终审 = 精度已锁；下一格是消费闭环/下一尺度，不是继续在单仓四象限里加立法面。

**结论 2：单仓核心稳定后，下一落地层级的工业常见顺序是“仓内变更级（PR diff）→ 历史演化 → 跨仓聚合”，跨仓几乎总是最后。**
来源：[S3] SonarQube 演化史（DeepWiki 原文核验）：先有单项目分析 + Quality Gate，Portfolios（跨仓聚合实体）是后期才加入的企业级汇总层，且依赖成熟的单项目数据底座（schema 中 portfolio 本质是项目组件的引用拷贝）。来源：[S4] Semgrep 演化史（AnySearch 多源）：2018 单语言扫描器 → 2022 供应链 → 2023 云平台集中策略 → 2024+ AI 修复，扩张方向是“相邻能力”而非跳层。来源：[S5] CodeScene（官方）：单仓行为分析（hotspot/Code Health）为起点，团队/组织视图（knowledge silos、bus factor）是后续叠加。
→ 映射：Macro-A（跨仓）需多仓 intake，前置依赖最重，工业先例一致排最后；Micro-A（PR diff）依赖最薄（适配器已 active、intake 已在）；Macro-C（演化考古）可复用现有 git 采集，依赖居中。B 内部 Micro-A → Macro-C → Macro-A 的顺序有充分先例支撑。

**结论 3：加固尾巴（候选 A）“等触发”优于“提前拉动”，但非触发封口的薄项可并行清。**
来源：[S6] abstractopedia Deferred Objectives Backlog（原文核验）：“延期必须有 exit condition（evidence required + date of review），否则是 workflow defect”；产品自身纪律（LRM + Trigger-gated Closure，召回自知识库 ADR/CONTEXT）与此完全同构。工业惯例：触发器门控项的提前拉动仅发生在“触发事件已到”或“延期项开始阻塞主线”时，无事件则按 cadence 值守复核。
→ 映射：A 中四项若已登记触发器且事件未到，按纪律继续等；其中“完备性续审”若属非触发封口的常规债，可作为 B 主线间隙的并行小项（thin tail 不阻塞主线是惯例，但也不遗忘——需在台账中保持可见）。

**结论 4：治理面（C）按 cadence 走，不因 epic 收官而提前全量复核。**
来源：[S6] 同上——有 owner + 复核节奏 + 触发条件的延期项，惯例是按既定 cadence 走（如 sprint/月度 review），提前全量拉动只在“产品面发生结构性变化”时才合理。epic 收官本身可视为一次轻量复核触发，但 53 项逐一值守复核的优先级低于价值闭环推进。

**结论 5：报告消费面深化（D 或 B 的组成部分）与尺度扩张不冲突，应并入 B 作为闭环的一部分。**
来源：[S4] Semgrep 的教训（其 PMF 困境被明确记录为“用户停留在免费扫描器、付费价值来自协作/合规消费面”）说明：没有消费面的能力扩张留不住价值。本产品“端到端价值闭环先行”纪律正对应此——Micro-A 管线收口时必须连带报告消费面，否则闭环不成立。

## 3) 对比矩阵

| 项 | 端到端价值闭环贡献 | 前置依赖 | 与既有纪律契合度 | 工业先例强度 | 备注 |
|---|---|---|---|---|---|
| **B 主线下一尺度** | ★★★ 直接新增一层完整闭环 | Micro-A 最薄（适配器已 active）；Macro-C 居中；Macro-A 最重（多仓 intake） | 高——两条纪律的直接指向 | 强（SonarQube/Semgrep/CodeScene 均按此序扩张） | 内部顺序建议 Micro-A → Macro-C → Macro-A |
| **A 加固收尾域** | ★ 间接（信任存量） | 已通过终审；多为等触发项 | 中——触发器封口纪律指向“等”，但非封口项可并行 | 中（稳定化惯例支持收尾，但以 epic 终审为准绳） | 非触发项并入主线间隙，触发项等事件 |
| **C 治理面值守复核** | ★ 间接（防退化） | 无硬依赖，但无事件驱动 | 高（符合 LRM/cadence 纪律） | 中（延期台账惯例：按 cadence 不提前） | 53 项按既定节奏走即可 |
| **D 报告消费面深化** | ★★（并入 B 才成闭环） | 依附于某尺度 | 中——单独做无闭环意义 | 强（Semgrep 教训：无消费面的能力留不住价值） | 不单列，并入 B 各层收口 |

## 4) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| S1 | ROADMAP-TO-WORLD-BEST (Ansede) | github.com/mattybellx/Ansede/blob/master/docs/ROADMAP-TO-WORLD-BEST.md | Official/Comparative | 2026（in-repo） | "precision before breadth" unlock gate 模式一手实证 |
| S2 | Why Software Stabilization Matters Before You Release (Itera Research) | itera-research.com/.../why-software-stabilization-matters-before-you-release/ | Currency | 2025-12 | 加固后先稳定化验证、再建新功能的惯例 |
| S3 | Portfolios and Applications (DeepWiki SonarSource/sonarqube) | deepwiki.com/SonarSource/sonarqube/7.3-portfolios-and-applications | Official | 2026-01 | 跨仓聚合（Portfolios）后置、依赖单项目底座的 schema 一手证据（web_fetch 已核验） |
| S4 | Semgrep 公司演化史（多源聚合：semgrep blog/融资报道） | dev2.semgrep.dev/blog/2024/securing-codeql-with-semgrep/ 等 | Official/Currency | 2018-2026 | 扫描器→平台→消费面的相邻扩张史 + PMF 困境批评面 |
| S5 | CodeScene: Behavioral Code Analysis（官方产品页） | codescene.com/product/behavioral-code-analysis | Official | 持续更新 | 演化考古（hotspot/change coupling）作为独立尺度的工业形态与单仓→组织视图叠加顺序 |
| S6 | Deferred Objectives Backlog (abstractopedia) | abstractopedia.org/mechanisms/deferred_objectives_backlog/ | Community/Comparative | 持续 | 触发器门控延期项：exit condition + review cadence 惯例（web_fetch 已核验） |
| S7 | SonarQube Cloud Monorepo support（官方文档） | docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/monorepo-support.md | Official | 持续 | 多仓支持的 CI 依赖与配置成本面 |
| S8 | CodeRabbit vs Greptile vs Qodo 2026 (tech-insider) / Codacy alternatives | tech-insider.org/coderabbit-vs-greptile-vs-qodo-2026/ 等 | Comparative | 2026-07/08 | PR 级评审赛道的当前竞争密度（Micro-A 差异化定位参考） |
| S9 | Deferred-tracking skill (skills.rest) | skills.rest/skill/deferred-tracking | Community | 持续 | 延期项跟踪惯例补位 |

## 5) 信息缺口

1. **Tavily 引擎全程缺位**（配额耗尽），三引擎交叉验证降级为双引擎 + 本地产品库三源；“加固后广度扩张”在 AnySearch 的命中偏技术债向，产品路线向的一手规范（如线性/Stripe 式 roadmap 公开文）未直接命中。
2. **Micro-A vs Macro-C 内部顺序**：缺“演化考古 vs PR 评审”在同类产品中谁先落地的直接时序实证，只能由依赖厚度间接推断（Micro-A 依赖已备齐 → 结构性优先），最终应由本产品现有消费面的真实触发需求裁决。
3. **53 项触发器注册表**的逐项状态未在本轮展开（仅确认纪律框架），值守复核的具体提前/继续判定需产品内台账数据支撑。

## 本仓侧事后核查注记（归档时补，非 atomcode 输出）

- 题面前提校正：题面称「五尺度仅 Macro-B 实建」——按 --scale 集成面属实；但 preview 层实态为 **Macro-C preview 已闭环（#38，2026-09-16，A-043，anysearch-cli 1012 facts+披露双件+mw-trigger-b 触发）＋Micro-A preview 已闭环（#48，4 条真实 PR 报告双件+骨架交集断言+desk-task15 判 decided）**。法定铺开序 D-034②「扩面→Macro-C→Micro-A→Micro-B→Macro-A」已执行至 Micro-A；audit.ts:26 SCALE_LAYER_ORDER 与 53-check B2b 断言钉死该序。
- 由此，调研「B 内 Micro-A→Macro-C→Macro-A」排序答的是一个已被历史回答的子问题（前提陈旧所致），不构成对 D-034② 的有效挑战；真实前沿=Micro-B（第四格）→Macro-A（末位，DoR 判据已登记 D-062，含「Micro-A＋Micro-B preview 闭环」启动闸）。
