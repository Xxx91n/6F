# R36-Q2 atomcode 调研报告（2026-09-26/27）

题面：.scratch/macro-audit/reports/R36-Q2-research-prompt.md

## 调研面

Sufficiency Gate：searches 7（Exa 2/Tavily 4/AnySearch 1）｜full reads 6｜gaps：Chromium expectations 形制细节未全读（base64 取核心段）、Google TIA 论文二手转述。

## TL;DR

**推荐 (c) 两阶段**：今日收口采 (a) 枚举集止血判据＋T3 落地后升格 (b) 全量+known-red manifest 终态——(b) 非替代而是 (a) 的机械化超集。与工业界 pre-merge gate 分层惯例（fast subset 上 gate、full suite 后台/周期车道）及 XFAIL 管理惯例（manifest 管理 expected-failure）双重同构。置信高（≥2 独立信源交叉）。

## 分点结论

**① 分层惯例**：pre-commit fast checks vs CI full suite 分层是成熟形态（switowski 已读原文）；TIA/affected 车道分层须预建依赖图（Nx affected=graph+git 基线计算非裁量——本仓无依赖图设施，(d) 触碰面口径无成熟同构被证伪）。

**② XFAIL/quarantine 成熟形态**：Mozilla Web QA XFAIL（bug 号强制+复审解除流程）、Chromium expectations 机制、pytest xfail strict（复绿转门禁事件）、wptrunner expectation 更新机制、JSON-Schema-Test-Suite failures/ 目录 manifest 先例——expected-failure 一律 manifest 管理非删除非无视。

**③ 静默红无牙化机理**：berkinduz「Normalization of Deviance（Challenger 案）+Broken Windows」——红件常驻教团队无视红，真回归溜过。⚠️ 本仓 13 红件多为**确定性红**（钉腐化）非 flaky，按 QASkills「quarantine is for flakiness not for failures」口径**无资格无限期豁免**——恰由 T3 承接，manifest 必须带期限。pie.inc「later never comes，coverage shrinks」须按月统计 skip 数；trunk.io/mill-build 证明 quarantine+manifest 配追责有效前提是有 expiry。

**④ 外部语料漂移类守卫**：上游 pin＋更新轮生成 expectation 文件是成熟处置（wptrunner/JSON-Schema 先例）。

**⑤ graveyard 反模式**：qaskills「parking tests and never returning」——两阶段 (a) 若无升格触发器会固化为永久 (a)；对策=expiry+ownership+size cap（quarantine>1% 即 fail build）。

## 对比矩阵

| 项 | gate 确定性 | 静默红处置 | 成本/时序 | 工业同构 | 风险 |
|---|---|---|---|---|---|
| (a) 枚举集 | 高（明示清单） | 红件挂 T3 不挡，暂无 manifest 约束 | 今日即可 | pre-commit fast subset | 红绿边界靠人维护，清单外面继续烂 |
| (b) 全量+manifest | 最高（红⊆manifest+复绿告警） | manifest 收容+期限+复绿显形 | 空窗至 T3 | pytest xfail strict/Mozilla XFAIL | 无（唯延后） |
| (c) 两阶段 | 今(a)→终(b) | 止血不空窗终态有牙 | 增量无空窗 | TIA/nightly 演进路径 | 须设升格触发防中间态固驻 |
| (d) 触碰面 | 低（每轮重裁） | 无 manifest 红件续静默 | 看似最低实需映射设施 | 无成熟同构（TIA 依赖预建图） | 选择歧义+无牙化双重证伪 |

## 与账本 current 决策的冲突点

| 决策 | 关系 | 处置建议 |
|---|---|---|
| D-094（失效三分类+T3/#75批1） | 同向强化：13 红件须先过三分类门——合法漂移→改断言或入 XFAIL 册；真坏→修现实；欺诈（名不副实/死面）→禁入 manifest | 无冲突，并入 #75批1 |
| D-071③/D-073（XFAIL 册只收合法漂移） | 约束：措辞钉/冻龄钉若属「活契约的脆实现」非合法漂移→不入 manifest；manifest 准入=D-094-(b) 类专属 | (b) manifest 收窄为合法漂移专属 |
| D-139/D-140（守卫改写独立 commit） | 约束：(b) 落地后 manifest 红件复绿仍走独立复绿 commit | 无冲突 |
| D-144 系列/R35 先例（守卫组 18 件全绿审计基线） | 名义张力：枚举集口径变更基线面 | 建议新决策显式申明——注：经复核 18 件枚举钉在任务书 H51 非账本行，D-144① 原文未钉集合→补全语义非改向，零 revised 成立 |
| (c) 中间态停驻 | graveyard 反模式 | 登记升格触发器：T3 manifest 产出当轮即切 (b)（Trigger-gated Closure 惯例同 D-071⑨） |

## 呈报方事实修正（调研后补测）

- 任务书 H51 已有「守卫基线 18 件」枚举——守卫组有指称但锚面在换代任务书；
- 45-check 复测 PASS 51/51（15s；前扫 45s 超时误杀）；静默红实数=12（41a=基线内合法中途红，余 11 件皆基线外 era-scoped 脚本）；
- 23-check 断链实因=import 链解析 .js 而 src 树纯 .ts（引擎重构后 era 断链）。

## 来源清单

Mozilla Web QA XFAIL 官方／Chromium web_tests flake 官方文档／pytest xfail strict 官方／QASkills quarantine+TIA 指南（graveyard/1%cap/expiry）／switowski pre-commit-vs-CI／berkinduz Normalization-of-Deviance／Nx affected 官方／fountain.io monorepo 策略／trunk.io flaky 指南（Fuchsia/Slack Cornflake）／mill-build auto-quarantine／pie.inc quarantine 反模式／JSON-Schema-Test-Suite PR#727／wptrunner expectations 官方——13 源含 6 官方原文。
