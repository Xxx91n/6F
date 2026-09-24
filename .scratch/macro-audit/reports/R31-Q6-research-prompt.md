# R31-Q6 调研题面：增量小件票面化与排序——缺陷票独立 vs 仓务批合票 vs 并入主线票

## 决策问题

本仓 grill 流程共生五件增量，需决定票面化与排序：

1. **quarantine 方言归一修复**（D-128，真缺陷：Git<2.45 的 %cI 输出 +00:00 被误计 normalized→测试红/Intake Health 漂移）——边界层归一＋normalized 语义收窄＋披露面＋golden 再生＋回归 fixture；
2. **gen-adr-index 生成式索引**（D-130②：README ADR 区间 stale→脚本生成，移植姊妹仓先例）；
3. **dist 体积棘轮断言**（D-129③：rebuild-diff 同链 size ratchet+官方 check-dist.yml 两减痛件）；
4. **first-external-contributor 触发器登记**（D-130③：registry JSON 一行）；
5. **#80 票面勘误两处**（D-131③ 位点类比措辞/D-132④ golden 锁面枚举——两行字级文书）。

主线工作=#80 Micro-B 步②（投影+查询语义）已排定。

## 选项

- **(a) 两票分道**：#81=quarantine 缺陷票独立（回归追溯纪律），#82=仓务增量批一票（②③④⑤同型小件批内独立小步）；#81 先行，#82 与 #80 步②并行，主线不动；
- **(b) 各拆一票** #81~#85——粒度合规但票面开销超工作量；
- **(c) 并入 #80 步②**——review 混装（性质不重合）＋撑大票面；
- **(d) 不立票随手改**——违 trigger-gated/票面纪律。

## 必查上下文（仓内）

1. `.scratch/macro-audit/decision-ledger.md` 全部 current——重点 D-128⑥（建议新票 #81、与 #80 步②并行不冲突）、D-129③（棘轮挂守卫批票面级）、D-130②③（生成式索引/触发器）、D-131③/D-132④（票面勘误）、D-127①（单票闭环内部三步先例）、D-076④（批评→触发器吸收映射登记先例）、D-025（禁票内静默改骨架）；核查选项冲突；
2. `.scratch/architecture-recovery/BACKLOG.md` 票面粒度先例（#45 生成器票/#48 单票铺开/#80 三步票——合票 vs 拆票的既有尺度）；
3. `docs/adr/`＋`CONTEXT.md`——Trigger-Gated Closure/Trigger Sequence 词条。

## 必查工业心智模型（重点）

1. **缺陷修复 vs 特性票的分离惯例**：成熟项目（GitHub flow/GitLab flow/主干开发生态）对 hotfix/bugfix 与 feature 的分票纪律——缺陷票独立的价值（bisect/cherry-pick/revert 追溯粒度）vs 合票成本；
2. **「仓务批/chore batch」合票先例**：小件维护性工作（CI 守卫增强/文档生成脚本/registry 登记/文案勘误）打包一票的工程惯例——batch PR/chore train 的成熟形态与边界（什么性质可合批、什么必须独立）；
3. **票粒度判据**：影响面/回滚单元/review 认知负载三维度——「一票一性质」vs「一票一交付物」的通行判据；stacked diff 生态对「内部独立小步+一票闭环」的支持先例；
4. **缺陷与主线并行**：小缺陷票与主线特性票并行推进的集成风险判据（共享面/锁竞争/合并序）——本仓 quarantine 修复触 golden 再生面与 #80 步②投影面无交叠的判定方法。

## 输出要求

- 分点结论（标信源）；候选矩阵（a/b/c/d）；完整来源清单；信息缺口；一句话落地建议；冲突显式点名 D-xxx＋revised 文案方向，禁止静默改向。