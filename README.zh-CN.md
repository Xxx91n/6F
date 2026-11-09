<p align="center">
  <img src="docs/assets/hero.svg" alt="6F :  macro + micro engineering-content audit" width="880"/>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-38bdf8" alt="License: Apache-2.0"/></a>
  <img src="https://img.shields.io/badge/version-0.3.0-f59e0b" alt="Version: 0.3.0"/>
  <img src="https://img.shields.io/badge/node-%E2%89%A522.18-38bdf8" alt="Node: &ge;22.18"/>
  <a href="#install"><img src="https://img.shields.io/badge/marketplace-installable-f59e0b" alt="Marketplace: installable"/></a>
  <a href="https://github.com/Xxx91n/6F/actions/workflows/engine-ci.yml"><img src="https://github.com/Xxx91n/6F/actions/workflows/engine-ci.yml/badge.svg?branch=main" alt="engine-ci: main"/></a>
</p>

<p align="center"><a href="README.md">English</a> &middot; <a href="README.zh-CN.md">&#31616;&#20307;&#20013;&#25991;</a></p>

6F 是一个 **Claude Code Plugin**，对一个代码仓库进行评估。
> 主要面向 git 记录健全的仓库。
- Macro-A 跨仓战略分析
- Micro-A PR Diff 分析
- Macro-B 单仓四象限分析
- Micro-B 单文件分析
- Macro-C 历史演化分析

## 安装 {#install}

**前置条件**：Node.js ≥ 22.18

```text
/plugin marketplace add Xxx91n/6F
/plugin install 6f@xxx91n
```

## 心智模型 {#highlights}

- **事实（Facts）** :  每条说法都落进同一张只追加的事实表（Hub-of-Facts：一张共享事实表，各档自己做裁决）。
- **分档裁决（Federation）** :  每条结论都过同一个 `verdict-gate` 判定关，规则建立在上面那张共享事实表上。
- **看历史（Forensics）** :  历史演化档（Macro-C）把仓库历史变成证据。
- **五档（Five scales）** :  五档审计共用一张事实表；五档都在计划里，不是砍出来的第一版。
- **诚实（Frankness）** :  预览版、降级产物和带 `synthetic` 标记的东西，会明说自己是哪种，按分阶段预览发布来标。
- **可复查（Fingerprints）** :  每条结论都附一张带两处校验的回执，离线也能自己查。

> [!NOTE]
> 当前状态：Macro-B、Macro-C、Micro-A、Micro-B 四档在预览；Macro-A在计划中。

## 目前状态 {#capability-matrix}

| scale | 状态 |
|---|---|
| Macro-B 单仓四象限档 | **capability 1 of 5 · preview**（自审首报样例见 [examples/first-report/](examples/first-report/)）；四象限状态：**strategy: active**（S1+S2 采集已接）· **behavior: preview**（codelore 的 churn/hotspot/coupling 那部分，#51）· **structure: preview**（S3 族的形态观测:  `structure/shape` 这个读数归属层里的读数，只作观测不作判定，D-205）· **supply-chain: queued**（D-034③ Scorecard 不插队） |
| Macro-C 历史演化档 | **capability 2 of 5 · preview**（单仓校对说明） |
| Micro-A PR diff | **capability 3 of 5 · preview**（托管平台取数中间层的使用方；这层加固后已经成了 engine 的正式入口:  #85②，D-204③④） |
| Micro-B 单文件档 | **capability 4 of 5 · preview**（`audit file` 文件卡；试点仓是同主双仓 jiahao 和 env-manager 的文件改名追踪和校对:  只给建议（`advisory` / advisory-only），结构上和裁决隔开，建议永远不进判定关） |
| Macro-A 跨仓战略档 | Not yet in preview |

## 报告长什么样 {#what-a-report-looks-like}

这是本仓自审的一份真实节选（[examples/first-report/23-first-report.md](examples/first-report/23-first-report.md)）:  判定按测到的写下去，不四舍五入：

```text
# MA-23-6F-FIRST-REPORT :  Macro-B first report (6F@fc00d458…)
> RECEIPT RCP-9d20125ad0976c86  facts=228  adjudications=6
> issued_at=2026-09-13T14:31:09+08:00  commit=fc00d458e215…  tree=6f405cfc2ce5

- overall_verdict: unsupported        confidence: 0.75
- headline: main premise falsified at TC-2 (mean_ratio 0.2462 < 0.60,
  Status/Date missing 84.62%); TC-1 INCONCLUSIVE; TC-3 AMBER
```

## 快速验证 {#quick-verification}

从源码跑（Node ≥ 22.18）：

```bash
cd engine
npm install
npm test         # gen manifests → tsc build → smoke (launch & liveness)
npm run selftest
```
---


## 三层架构 {#architecture-three-layers}

![三层架构：Agent Plugin 分发层 → 事实与裁决核心层 → 上游证据层](docs/assets/architecture.svg)

分发层（CLI、skills 外壳、MCP 面）架在我们自己做的核心上：只追加的 `audit_fact` DuckDB 事实表、共享的 `verdict-gate` 判定规则，加上带两处校验的回执。证据只能通过取数中间层进来；上游原始内容不出中间层。


## 上游组件 {#upstream-components}

| 上游组件 | 作用 | 形态 | 引入方式（D-020 双轨接入） | 锁定方式 | 状态 |
|---|---|---|---|---|---|
| DuckDB（@duckdb/node-api） | 事实表底座 | Node 库 | 运行时依赖 | package-lock 精确锁定 | 已接入（active） |
| git CLI | 挖仓库历史 / 确定性采集 | 外部 CLI | 中间层 + 外部 CLI | 随宿主环境；输出解析就是契约 | 已接入（active） |
| CodeLore | 代码考古 / 证据层 | CLI | 中间层 + 外部 CLI | exact pin 0.28.0 + golden 契约测试 | 已接入（active；只读检查：explain/summary） |
| OpenSSF Scorecard | 供应链健康评分 | Go 库 / CLI | 库→依赖；CLI→中间层 | hash 锁定 / 锁版本 | 规划中（planned） |
| GitHub REST API | 改动档（Micro-A）的 PR 数据源:  枚举/元数据/diff 取不到就走备选；本地 git 优先 | remote-api | 中间层 + 环境变量 token 三级探测 | X-GitHub-Api-Version 固定 + golden cassette 契约 | 已接入（active） |

引入方式按双轨接入：中间层 + 外部 CLI/库是主线；库形态的上游用包管理器 lockfile 的 hash 固定；把上游源码拷进仓，只在离线分发或上游废弃时用，是最后的退路。


## 功能归属 {#ownership-boundary}

| 归属 | 组件 |
|---|---|
| **我们的** | 共享的判定关规则（verdict-gate）· DuckDB 事实表结构（只追加 + 跨档关联键）· 三层验收闸（A 形式 / B 事前判据 / C 人工改判）· 带两处校验的回执 · 事前判据规则（2 个正对照 + 3 条真判据 + 1 个负对照） |
| **上游** | DuckDB 引擎本体 · git CLI · CodeLore（已接入·只读检查）· GitHub REST API（已接入·REST 为主 + `gh` 可选回退）· OpenSSF Scorecard（规划中） |

## 约定 {#contracts}

- 上游组件一律**通过取数中间层**写事实表；上游原始内容不出中间层（隔离规则：中间层不放业务规则）。
- 换掉或升级上游**不许改事实表结构**:  结构固定，要变只能走版本号。
- 每个上游都锁版本，并配 golden 输出契约测试；把上游源码拷进仓，只在离线分发或上游废弃时用，而且必须带 UPSTREAM 清单和 patches/ 规则。

## 仓库结构 {#repository-map}

| 路径 | 内容 |
|---|---|
| [docs/authority.md](docs/authority.md) | 决定和术语 |
| [GLOSSARY.md](GLOSSARY.md) | 术语表:  每个领域词是什么意思 |
| [docs/spec.md](docs/spec.md) | 产品决策（缺口：docs/known-gaps.md；风险记录：docs/ra/） |
| [docs/adr/](docs/adr/) | 架构决策（背景 / 备选 / 后果） |
| [engine/](engine/) | 内核 CLI + Agent Plugin 五层盒子（构建 / 命令细节见 [engine/README.md](engine/README.md)） |
| [examples/first-report/](examples/first-report/) | 发布样例：6F 自审 Macro-B 首报四件（顺利 + 失败一对，说明规则） |
| [engine/CHANGELOG.md](engine/CHANGELOG.md) | 产品版本记录 |

## 在真实仓库上试用 {#try-on-a-real-repository}

外部仓要经过 URL opt-in 才接进来（D-013 本地优先 + URL opt-in）：clone 到隔离缓存（sha256 作键）+ 全深度校验 + 浅 clone 直接拒绝 + 远程配置不许执行 + 复用本地 git 凭据链。

```bash
cd engine && npm install && npm run build

# intake: local path | owner/repo (local-first) | URL opt-in isolated clone
node dist/cli.js repo add https://github.com/open-gsd/gsd-core.git
node dist/cli.js repo add /path/to/local/repo

# audit: first-class command :  Macro-B default; Macro-C / Micro-A also shipped
node dist/cli.js audit /path/to/local/repo
node dist/cli.js audit <repo> --scale Macro-C
node dist/cli.js audit <repo> --scale Micro-A

# Micro-B file card (lazy supplementary collection, --db required)
node dist/cli.js audit file <repo> <file> --db <facts.duckdb> [--at <sha>]
```

- opt-in 公共仓示例：[open-gsd/gsd-core](https://github.com/open-gsd/gsd-core)（本仓实测接过：2026-09-16 跑了一次 Macro-B，产出 1424 条事实，判定 `unsupported` 照实写下来:  TC-2 追到 ADR dash+加粗写法的识别缺口，登记成覆盖缺口；实跑记录见执行记录 A-045）。
- **⚠ 外部内容会随上游变**：外部仓的内容和结构跟着上游变，审计读数不能按 golden 预期:  这个示例只说明接入路径，不承诺某条判定。
- `--scale` 只接受已经做出来的档（`Macro-B` / `Macro-C` / `Micro-A`）；没做的档返回结构化的 `SCALE-NOT-IMPLEMENTED` + exit 2:  CLI 不假装能跑没接上的档。

<!-- acknowledgments:start — GENERATED by engine/scripts/gen-acknowledgments.mjs; do not edit by hand (regen: node engine/scripts/gen-acknowledgments.mjs) -->
## 致谢 {#acknowledgments}

6F 建立在这些上游组件之上——就是 [engine/upstream-lock.yaml](engine/upstream-lock.yaml) 里状态为 active 的那组：

- **[CodeLore](https://github.com/emrecdr/codelore)** — 代码考古与证据层外部 CLI（explain/summary 只读检查）
- **[DuckDB Node API](https://github.com/duckdb/duckdb-node)** — 各档审计写入事实表用的 DuckDB 底座（@duckdb/node-api）
- **[DuckDB Node bindings](https://github.com/duckdb/duckdb-node)** — 事实表运行所依赖的平台原生 DuckDB 二进制（@duckdb/node-bindings-*）
- **[git](https://github.com/git/git)** — 确定性的仓库历史挖掘与证据采集（宿主环境自带外部 CLI）
- **[GitHub REST API](https://docs.github.com/rest)** — 改动档（Micro-A）的 PR 数据源——枚举／元数据／diff 取不到就走备选（本地 git 优先）
- **[esbuild](https://github.com/evanw/esbuild)** — 打包发布用的单文件 dist 包构建器
- **[SchemaStore](https://github.com/SchemaStore/schemastore)** — claude-code-plugin-manifest schema（快照即契约的本地校验源）
- **[Claude Code CLI](https://github.com/anthropics/claude-code)** — 只给建议的 claude plugin validate 校验工具链

*完整上游记录（含 planned／evaluating／retired 行）见 [engine/upstream-lock.yaml](engine/upstream-lock.yaml)；法律上的署名义务由 NOTICE/许可证文件承担，本节只给人看致谢。*
<!-- acknowledgments:end -->
