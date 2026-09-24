# R31-Q4 调研题面：测试 fixture 落点——域级 test/fixtures 自管 vs 集中 fixtures/golden 注册树

## 决策问题

本仓引擎有两套 fixture 树：

- **`engine/fixtures/`**（D-038 立法）：`definitions/*.json`＋`golden/<scenario>/`（happy-path/degraded-supply/degraded-incomplete 三场景）＋`golden/manifest.json`＋生成器——为 `demo` 命令消费的**合成演示仓契约面**，随 npm tgz 分发，#43 golden CI 以此 manifest 为基线；
- **`engine/test/fixtures/`**：域级测试断言件自管树——codelore（47 件批内 JSON）/github-rest（HTTP cassette×5）/narrative（seal-golden）/micro-b（步①新生 4 件：emission-input/emission-skeleton.golden/manifest/rename-log，自带 kind/schema_version/generator 自描述头）。

Micro-B #80 步①把发射断言件落在 `test/fixtures/micro-b/`（仿 sibling 同构范式、自管 manifest）。锐评/复核提出 S1 悬置裁决：这是合法的「D-038 位点类比」还是必须「字面接入」D-038 树（即迁 `engine/fixtures/golden/micro-b/`＋注册进其 manifest.json）？

## 选项

- **(a) 同构范式追认**：D-038 立法域=对外演示合成仓契约面；域级测试件依 sibling 惯例落 `test/fixtures/<domain>/` 自管——测试内部件不进已分发 demo 契约面；
- **(b) 字面接入**：凡 golden 工件一律入 `fixtures/golden/<name>/`＋manifest 注册——单一注册面但把单测断言件混入 tgz 分发契约；
- **(c) 双注册**：件留 test/ 同时在 D-038 manifest 挂引用——双真源风险。

## 必查上下文（仓内）

1. `.scratch/macro-audit/decision-ledger.md` 全部 current 记录——重点 D-038（fixture 立法原文：资产形态=fixtures/definitions+golden+generator 随 tgz 分发、demo 入口、CASRAI 披露块、合成不冒充真实）、D-061（golden 版本化纪律=基线引用稳定）、D-127⑥（golden 锁字段骨架非内容值）、D-130（生成式索引原则——枚举指针须生成式）；核查三选项是否触任何 current 决策；
2. `docs/adr/`（0001~0023 全目）与 `CONTEXT.md` 词条——直接相关=ADR-0022（quarantine 引擎）、ADR-0023（Micro-B 架构）、Synthetic Demo Fixtures 词条；
3. `engine/fixtures/golden/manifest.json` 与 `engine/test/fixtures/micro-b/manifest.json` 实文对照——注册粒度/消费方/分发面差异。

## 必查工业心智模型（重点）

1. **测试 fixture 组织惯例**：成熟仓（Jest/pytest/Go testdata/Rust tests/fixtures 生态）如何处理「域级断言件」vs「共享契约 fixture」——就近放（co-located testdata/）还是集中注册（central fixture registry）？各自代价（发现性/重复/污染面）；golden-file 测试生态（Rust insta/goldie、Go golden -update、Jest snapshot）的 fixture 落点惯例——快照件跟谁住？
2. **分发契约面 vs 测试内部面的边界惯例**：随包分发的 fixture/snapshot（npm files/cargo include/pip package_data）与纯测试件如何在仓内隔离——有没有「tests/ 永不入包、fixtures/ 可入包」的通行隔离原则？把单测件误放进分发面的真实事故先例；
3. **manifest/注册表模式**：集中 manifest 注册的代价与收益（单一发现面 vs 双真源/合并冲突）；「自描述目录」（每域自带 manifest）vs「全局注册表」在大型仓的演进方向（如 monorepo 的 per-package manifest vs root registry）；
4. **「字面接入 vs 范式类比」的治理学**：当新场景落在既有规则（D-038）的字面射程边缘时，成熟项目如何裁决规则适用域——legislative intent（立法意图限缩）vs plain-meaning（字面覆盖）的先例与判据；有没有「新 fixture 类一律问『谁消费它』」的通行判据。

## 输出要求

- 分点结论（每条标信源类型：官方文档/学术/对比实践/社区）；候选对比矩阵（覆盖 a/b/c）；完整来源清单；信息缺口；一句话落地建议。
- 若调研结论与本仓现行 current 决策冲突，显式点名冲突的 D-xxx 并给出 revised 替代文案方向——禁止静默改向。