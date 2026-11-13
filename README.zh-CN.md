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

6F 是一个 **Claude Code Plugin**，用来审一个代码仓库。
> 它适合 git 记录完整、看得出历史的仓库。
- Macro-A：几个仓合起来看
- Micro-A：一个 PR 改了什么
- Macro-B：一个仓，四个象限一起看
- Micro-B：一次看一个文件
- Macro-C：一个仓是怎么走到今天这样的

## 安装 {#install}

**开跑前要有**：Node.js ≥ 22.18

```text
/plugin marketplace add Xxx91n/6F
/plugin install 6f@xxx91n
```

## 它是怎么想的 {#highlights}

- **一张事实表（Facts）** :  每句话都写进同一张表，只往后加、不改旧行；五个档共用这张表，各档自己下结论。
- **分档裁决（Federation）** :  每个结论都要过同一道结论检查（`verdict-gate`），检查用的规矩就建在上面那张共享事实表上。
- **看历史（Forensics）** :  历史演化档（Macro-C）拿仓库一路怎么变过来的记录当证据。
- **五档（Five scales）** :  五种审计档位共用一张事实表；五档都在计划里，不是先砍到一档交差。
- **实话实说（Frankness）** :  预览版、降级产物、带 `synthetic` 标记的演示仓，都会在产物里说清自己是哪一种，按一段一段放开的办法来标。
- **能自查（Fingerprints）** :  每条结论都带一张回执，上面有两处校验，断网也能自己对一遍。

> [!NOTE]
> 现在到哪一步：Macro-B、Macro-C、Micro-A、Micro-B 四档在预览；Macro-A 还只在计划里。

## 现在到哪一步 {#capability-matrix}

| 档位 | 到哪一步 |
|---|---|
| Macro-B 单仓四象限档 | **capability 1 of 5 · preview**（自己审自己的首报样例见 [examples/first-report/](examples/first-report/)）；四个象限的状态：**strategy: active**（S1+S2 的数据已经接进来了）· **behavior: preview**（CodeLore 那块的改动频次、热点、耦合读法）· **structure: preview**（S3 族看形态：`structure/shape` 这类读数只作观测，不参与判定）· **supply-chain: queued**（排队，Scorecard 不插队） |
| Macro-C 历史演化档 | **capability 2 of 5 · preview**（单个仓库的校对说明） |
| Micro-A PR diff | **capability 3 of 5 · preview**（数据从托管平台的取数中间层来；这层加固完，它就成了 engine 的正式入口） |
| Micro-B 单文件档 | **capability 4 of 5 · preview**（`audit file` 出文件卡；先拿来试的是自己名下的两个仓 jiahao 和 env-manager，用来追文件改名和校对：只给建议（`advisory`），从结构上就跟判定分开，建议不会变成判定） |
| Macro-A 跨仓战略档 | Not yet in preview |

来源：#85②、D-204③④（Micro-A 产线化）、D-205（structure 象限）、D-034③（Scorecard 排队）、#51（behavior 象限）。

## 报告长什么样 {#what-a-report-looks-like}

这是本仓自审的一段真实节选（[examples/first-report/23-first-report.md](examples/first-report/23-first-report.md)）:  判定按测到的写下去，不四舍五入：

```text
# MA-23-6F-FIRST-REPORT :  Macro-B first report (6F@fc00d458…)
> RECEIPT RCP-9d20125ad0976c86  facts=228  adjudications=6
> issued_at=2026-09-13T14:31:09+08:00  commit=fc00d458e215…  tree=6f405cfc2ce5

- overall_verdict: unsupported        confidence: 0.75
- headline: main premise falsified at TC-2 (mean_ratio 0.2462 < 0.60,
  Status/Date missing 84.62%); TC-1 INCONCLUSIVE; TC-3 AMBER
```

## 自己跑一遍 {#quick-verification}

从源码跑（Node ≥ 22.18）：

```bash
cd engine
npm install
npm test         # 先生成清单，再编译，最后跑冒烟测试（起得来、跑得动）
npm run selftest
```
---


## 三层架构 {#architecture-three-layers}

![三层架构：Agent Plugin 分发层 → 事实与裁决核心层 → 上游证据层](docs/assets/architecture.svg)

最外面这层（命令行、skills 外壳、MCP 接口）架在我们自己写的核心里：一张只往后加的 `audit_fact` DuckDB 事实表、五档共用的一道结论检查（`verdict-gate`），再加一张带两处校验的回执。证据只能从取数中间层进来，上游的原始内容不出这层。


## 用到的上游 {#upstream-components}

| 上游组件 | 作用 | 形态 | 怎么接进来 | 怎么钉住版本 | 状态 |
|---|---|---|---|---|---|
| DuckDB（@duckdb/node-api） | 事实表底座 | Node 库 | 运行时依赖 | package-lock 精确锁定 | 已接入（active） |
| git CLI | 挖仓库历史 / 确定性采集 | 外部 CLI | 中间层 + 外部 CLI | 随宿主环境；输出解析就是契约 | 已接入（active） |
| CodeLore | 代码考古、出证据 | CLI | 中间层 + 外部 CLI | 钉在 0.28.0，另配 golden 契约测试 | 已接入（active；只读检查：explain/summary） |
| OpenSSF Scorecard | 供应链健康打分 | Go 库 / CLI | 库走依赖；CLI 走中间层 | hash 锁定 / 锁版本 | 规划中（planned） |
| GitHub REST API | 改动档（Micro-A）的 PR 数据源:  列 PR、取元数据、取 diff，平台给不出就走备选，本地 git 优先 | remote-api | 中间层 + 环境变量 token 三级探测 | X-GitHub-Api-Version 固定 + golden cassette 契约 | 已接入（active） |

上游进来只有两条路：主力是加一层取数中间层、外面挂外部命令或库；装成库的上游用包管理器的 lockfile 把版本和哈希钉住。把上游源码整份拷进仓里是最后手段，只在离线分发、或者上游已经没人维护时才用。

来源：D-020（两条路接上游）。


## 哪块是谁的 {#ownership-boundary}

| 归属 | 组件 |
|---|---|
| **我们的** | 五档共用的结论检查（`verdict-gate`）· DuckDB 事实表结构（只往后加，加跨档关联键）· 三道验收闸（A 看形式 / B 事前写好的判据 / C 人来改机器）· 带两处校验的回执 · 事前写好的判据（2 个正对照 + 3 条真判据 + 1 个负对照） |
| **上游的** | DuckDB 引擎本体 · git CLI · CodeLore（已接入·只读检查）· GitHub REST API（已接入·以 REST 为主，`gh` 可选回退）· OpenSSF Scorecard（规划中） |

## 几条规矩 {#contracts}

- 上游组件一律**通过取数中间层**写事实表；上游的原始内容不出这层（这层只搬数据，不放业务规则）。
- 换掉或者升级上游**不许动事实表结构**:  结构钉死，要变只能升版本号。
- 每个上游都钉住版本，并且配一套 golden 输出测试；把上游源码整份拷进仓里只在离线分发、或者上游已经没人维护时用，而且必须带 UPSTREAM 清单和 patches/ 规矩。

## 仓里都有什么 {#repository-map}

| 路径 | 内容 |
|---|---|
| [docs/authority.md](docs/authority.md) | 决定和术语各写在哪，只在那一份里讲 |
| [GLOSSARY.md](GLOSSARY.md) | 术语表:  每个领域词是什么意思 |
| [docs/spec.md](docs/spec.md) | 产品上的决定（还没覆盖到的地方记在 docs/known-gaps.md；接受下来的风险记在 docs/ra/） |
| [docs/adr/](docs/adr/) | 架构上的决定（当时的背景、试过哪些备选、最后担什么后果） |
| [engine/](engine/) | 内核命令行 + Agent 插件，里面分五层（怎么构建、命令怎么用见 [engine/README.md](engine/README.md)） |
| [examples/first-report/](examples/first-report/) | 发布用的样例：6F 自己审自己那份 Macro-B 首报的四件产物（顺利一份、失败一份，说明写在同一个目录里） |
| [engine/CHANGELOG.md](engine/CHANGELOG.md) | 产品每个版本改了什么 |

## 拿真仓库试一把 {#try-on-a-real-repository}

别人的仓，得你给链接、明确点头才会接进来：先克隆到一个隔离的缓存目录（拿 URL 算出的短 sha256 当目录名），克隆时要求完整历史、浅克隆直接拒掉，远程配置里的东西不许执行，用你本地已有的那套 git 凭据。

```bash
cd engine && npm install && npm run build

# 接仓进来:  本地路径 | owner/repo（先找本地）| 给链接后克隆到隔离缓存
node dist/cli.js repo add https://github.com/open-gsd/gsd-core.git
node dist/cli.js repo add /path/to/local/repo

# 审计:  Macro-B 是默认档，Macro-C / Micro-A 也能跑
node dist/cli.js audit /path/to/local/repo
node dist/cli.js audit <repo> --scale Macro-C
node dist/cli.js audit <repo> --scale Micro-A

# Micro-B 文件卡（用到哪个文件再补采，必须给 --db）
node dist/cli.js audit file <repo> <file> --db <facts.duckdb> [--at <sha>]
```

- 公开仓的例子：[open-gsd/gsd-core](https://github.com/open-gsd/gsd-core)（本仓真接过一次：2026-09-16 跑了一遍 Macro-B，出 1424 条事实，判定 `unsupported` 就照实写下来:  TC-2 追下去发现是认不出 ADR 里「破折号 + 加粗」这种写法，当成覆盖缺口登记了）。
- **⚠ 别人的仓一直在变**：内容和结构都跟着上游走，读数不可能跟 golden 对得上:  这个例子只说明怎么接进来，不保证任何一条判定。
- `--scale` 只认已经做出来的那几档（`Macro-B` / `Macro-C` / `Micro-A`）；还没做的档会返回 `SCALE-NOT-IMPLEMENTED` 并退出码 2:  命令行不装作能跑没接上的档。

来源：D-013（别人的仓怎么接进来）、A-045（gsd-core 那次的实跑记录）。

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
