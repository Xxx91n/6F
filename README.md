# macro-audit — 宏观 + 微观工程内容审计

面向 git 记录健全仓库的工程内容审计产品：**证据采集大部分来自上游组合件，裁决协议、事实表 schema、验收闸门与可核验回执是本项目自研的护城河与黏合剂**。5 档审计粒度（Macro-A 跨仓战略 / Macro-B 仓库级四象限 / Macro-C 演化考古 / Micro-A PR diff / Micro-B file level）共享同一事实底座与裁决层，差异在触发器与报告切片。

> [!NOTE]
> 当前状态（2026-09-16）：**preview 形态（能力边界见下节矩阵）**——Macro-B / Macro-C 两层经实跑校准、报告头与披露块按 preview 口径标注；Micro-A / Micro-B / Macro-A 为 **Not yet in preview**（roadmap 叙事非可用承诺）。发布未发生——本页为源码自举说明，不存在可安装 listing（ADR-0016 渠道决策＋上架用户闸门）。下表标注「规划中」的上游尚未接入，请勿据本页认为产品已完成。

## 能力边界（preview 标注）

发布节奏 = **Preview 分级发布**（ADR-0017）：**build-scope ≠ release-sequence**——5 档审计粒度为全规划（ADR-0001 standing），各层独立走 preview→GA 漏斗，preview 形态不构成 MVP 切片。

| scale | 状态 |
|---|---|
| Macro-B 仓库级四象限 | **capability 1 of 5 · preview**（自审首报样例见 [examples/first-report/](examples/first-report/)） |
| Macro-C 演化考古 | **capability 2 of 5 · preview**（单仓校准披露口径） |
| Micro-A PR diff | Not yet in preview |
| Micro-B file level | Not yet in preview |
| Macro-A 跨仓战略 | Not yet in preview |

preview 标注诚实是决策本体非装饰（ADR-0017）：报告头/侧车 `preview_disclosure` 披露块（capability 标注＋校准范围＋结构性限制＋not_in_preview 清单）与上表为同一语义源；降级产出带 `⚠ unverified` 印记，未接证据域带「⚠ 数据未接」标注，合成 fixture 带「synthetic」印记且不冒充真实审计。

**0.x 语义**：版本号 0.x 单调递增、号不复用；minor = 契约变更、patch = 修复、不回退发旧线补丁；1.0 退出条件 = 报告 schema 冻结＋已接上游适配器全过确定性验收（非日历触发）。口径全文见 [docs/versioning.md](docs/versioning.md)；产品版本变更以 [engine/CHANGELOG.md](engine/CHANGELOG.md) 为准，仓级里程碑/决策编年见 [CHANGELOG.md](CHANGELOG.md)。

## 组合件架构（三层）

```mermaid
flowchart TB
    subgraph DIST["分发层 · Agent Plugin 五层盒子"]
        CLI["内核 CLI（四外壳规划）"]
        SK["skills/ 方法论壳（只读）"]
        MCP["mcp.json 只读证据查询面"]
    end
    subgraph CORE["事实与裁决层 · 护城河（自研）"]
        FACT[("DuckDB audit_fact<br/>只追加事实表")]
        ADJ["联邦裁决协议 verdict-gate"]
        RCP["Receipt 回执 + 三层验收闸门"]
    end
    subgraph EVID["证据层 · 上游组合件"]
        GIT["git CLI"]
        CL["CodeLore（已接入·探针切片）"]
        SC["OpenSSF Scorecard（规划中）"]
        RP["repomix / gitingest（规划中）"]
    end
    EVID -->|"经适配器写入 · raw 语义不出适配层"| CORE
    CORE -->|"四外壳消费"| DIST
```

### 上游清单

| 上游组件 | 角色 | 形态 | 引入方式（D-020 双轨制） | 锁定策略 | 状态 |
|---|---|---|---|---|---|
| DuckDB（@duckdb/node-api） | 事实表底座 | Node 库 | 运行时依赖引用 | package-lock 精确锁定 | 已接入（active） |
| git CLI | 仓库考古 / 确定性采集 | 外部 CLI | 适配器 + 外部 CLI | 随宿主环境；输出解析为契约 | 已接入（active） |
| CodeLore | 代码考古 / 证据层 | CLI | 适配器 + 外部 CLI | exact pin 0.28.0 + golden 契约测试 | 已接入（active；探针切片：explain/summary 只读面） |
| OpenSSF Scorecard | 供应链健康评分 | Go 库 / CLI | 库→依赖引用；CLI→适配器 | hash pinning / 锁版本 | 规划中（planned） |
| repomix / gitingest | 仓库内容打包摘要 | CLI / pip 包 | 适配器 + 外部 CLI | 锁版本 + golden 契约测试 | 规划中（planned） |

> **状态列 = 机读权威绑定**：唯一权威 = [`engine/upstream-lock.yaml`](engine/upstream-lock.yaml)（D-037③，#44/A-049 落盘）——本表为人读形态，状态映射 = 已接入→active／规划中→planned／评估中→evaluating（retired 行不出本表；锁表另含评估中条目 `codelore-sqlite-dump`）。锁定纪律：禁 range/浮动 tag/latest，更新走手动窗口＋golden 回归护航（[docs/versioning.md](docs/versioning.md) §3-4）。

引入方式按 ADR-0014：适配器 + 外部 CLI/库为主线，库形态上游走包管理器 lockfile hash pinning，vendor 源码进仓仅在气隙分发或上游废弃两种情况逃生。逐上游绑定与契约测试在阶段 2 立票定版。

## Runtime View（walking skeleton 当前数据流）

```mermaid
flowchart LR
    A["被审计仓库<br/>本地路径默认<br/>远程 URL clone 至隔离缓存"] --> B["采集器 / 适配器<br/>确定性采集"]
    B -->|"INSERT 渲染 · 只追加校验"| C[("audit_fact 事实表<br/>trace / baggage 关联键")]
    C -->|"只读投影"| D["裁决<br/>verdict-gate"]
    D -->|"判定 + 证据引用"| E["Receipt 回执<br/>双锚 tree_anchor + content_digest"]
    E -->|"verdict-gate 印记"| F["报告产物<br/>引文可回查 + ⚠ unverified 标记"]
```

## 所有权边界

| 归属 | 组件 |
|---|---|
| **我们的（护城河）** | 联邦裁决协议（verdict-gate）· DuckDB 事实表 schema（只追加 + 跨 scale 关联键）· 三层验收闸门（A 形式 / B 预声明判据 / C 人裁定）· Receipt 回执（双锚）· 预声明判据纪律（2 正对照 + 3 真判据 + 1 负对照） |
| **借来的（上游）** | DuckDB 引擎本体 · git CLI · CodeLore（已接入·探针切片）· OpenSSF Scorecard（规划中）· repomix / gitingest（规划中） |

## 契约声明

- 上游组件一律**经适配器**写入事实表；上游原始语义不出适配层（防腐层纪律：适配层禁放业务规则）。
- 上游替换或升级**不得改动事实表 schema**——schema 不可变，演进只走版本号。
- 上游逐项锁定版本并配 golden 输出契约测试；vendor 源码进仓仅在气隙分发或上游废弃时启用，且必须带 UPSTREAM 清单与 patches/ 纪律。

## 仓库地图

| 路径 | 内容 |
|---|---|
| [CONTEXT.md](CONTEXT.md) | 术语表（54 词，领域唯一语言） |
| [docs/adr/](docs/adr/) | 架构决策记录 ADR-0001 ~ ADR-0018 |
| [engine/](engine/) | 内核 CLI + Agent Plugin 五层盒子（构建 / 命令细节见 [engine/README.md](engine/README.md)） |
| [examples/first-report/](examples/first-report/) | 发布样例资产：6F 自审 Macro-B 首报四件（happy + failure 双对，披露制） |
| [CHANGELOG.md](CHANGELOG.md) | 仓级里程碑/决策编年（指针制；产品版本账以 engine/CHANGELOG.md 为准） |
| .scratch/macro-audit/ | 决策账本（D-001~D-041）+ spec 阶段任务 + 调研报告 |
| .scratch/architecture-recovery/ | 执行轮账本（A-001~A-053）+ 票据 / 守卫 / 首报产物 |

## 演示与样例

- **确定性演示**（零外部依赖、跑完即弃）：`node dist/cli.js demo`——fixture 生成器合成临时 git 仓走 Macro-B 全链；三场景 `node dist/cli.js demo --list`（happy-path / degraded-supply / degraded-incomplete）。合成 fixture 带 synthetic 披露印记，**不冒充真实审计**。
- **真实首报样例**：[examples/first-report/](examples/first-report/)——6F 仓自审 Macro-B 实跑产物四件（happy + failure 双对），披露生成 commit / 日期 / 重生成命令与冻结时点属性。

## Try on a real repository

外部仓经 URL opt-in 接入（D-013 本地优先＋URL opt-in）：clone 至隔离缓存（sha256 键）＋全深度校验＋浅 clone 显式拒绝＋禁远程配置执行＋凭据复用本地 git 凭据链。

```bash
cd engine && npm install && npm run build
node dist/cli.js repo add https://github.com/open-gsd/gsd-core.git   # opt-in 公开仓
node dist/cli.js repo add /path/to/local/repo                        # 本地路径（同一 Intake 本地腿）
```

- opt-in 公共仓示例：[open-gsd/gsd-core](https://github.com/open-gsd/gsd-core)（本仓已实测接入：2026-09-16 Macro-B one-shot 1424 facts，裁定 unsupported 如实落数——TC-2 归因为 ADR dash+加粗形态漏认，detector 覆盖缺口如实登记）。
- **⚠ 外部内容随上游变化**：外部仓内容/结构随其上游演化，审计读数不可 golden 预期——示例仅说明接入路径，不构成对特定裁定结果的承诺。
- 当前 `repo add` 交付 = intake 接入面；对外部仓的完整审计管线现以仓内脚本形态执行（实跑记录见执行账 A-044/A-045），打包内一等命令面未冻结——不虚构 `audit` 子命令。

## 快速验证（源码自举，需 Node ≥ 20）

```bash
cd engine
npm install
npm test         # gen 双 manifest → tsc 编译 → smoke（启动并测活）
npm run selftest
```

CI 闭环见 [.github/workflows/engine-ci.yml](.github/workflows/engine-ci.yml)（paths: engine/**）。
