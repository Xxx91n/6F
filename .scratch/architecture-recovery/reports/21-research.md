# 21-research — 确定性采集器调研（A-022 / spec.md §R3-D3）

- **调研日期：** 2026-09-13 ｜ **模式：** landscape + comparison ｜ **工具：** atomcode（per WORKFLOW §4.2.3）
- **服务对象：** `6F/engine`（TypeScript，ESM，Node >= 20）三族确定性采集器，输出绑定 schema v0
- **决策链：** R3-D3 · D-016（阶段 0 含确定性采集器，不接 LLM）· D-017（B 判据必须确定性）· D-018（2 正对照 + 3 真判据 + 1 负对照）· ADR-0013
- **上游：** A-021（`engine/src/fact/schema.ts` + `store.ts`，#20 已闭环 28/28 PASS）· A-007 单写多读 · A-008 版本演进 · A-010 correlation key

## §0 执行摘要

**推荐：三族采集器 = `adr-structure`(S2) + `positioning`(S1) + `gitlog`(跨族交叉)，全部实现为「纯逻辑 + 依赖注入」模块。**
三条硬约束决定了这个形态：① D-016/D-017 要求「第一采集器为确定性采集、不接 LLM」——禁止任何网络与模型调用，且必须可机检；② A-021 已把 `audit_fact` 的 `collector_id` 与 `observed_at` 两列 `inherits` 标记为 `R3-D3`——本票是这两列的唯一生产者，输出形状无自由度；③ D-018 要求正对照与真判据共享 detector 路径——采集器必须是「族」而不是一次性脚本，判据才能指认族。

## §1 Baseline 回顾（与 current 决策的显式点名）

| 决策 | 对本票的约束 | 本票处置 |
|---|---|---|
| D-016 | 阶段 0 = push + CI 实跑 + schema v0 + 确定性采集器；四阶段串行；第一采集器确定性、不接 LLM | 本票是阶段 0 最后一块；不并行 A（铺开） |
| D-017 | B 层判据必须确定性、不接 LLM；禁止跑后补写判据 | 本票只交付可测信号，不产出任何判定结论 |
| D-018 | 2 正对照 + 3 真判据 + 1 负对照；正对照须与真判据共享 detector 路径；正对照不计入价值判定 | 落「判据 → 采集器族」映射表供票 22 引用 |
| ADR-0013 | 执行序：先 B 判据预声明文档 → 用户审阅 → commit → 再跑 6F | 本票不含跑 6F 动作，也不写阈值 |
| A-023 | 阈值跑前测定写死、跑后禁调 | 本票禁止出现任何阈值常量（守卫 N3 断言） |

### §1.1 冲突点名（不静默改向）

**冲突 C-21-1：D-018 的「2 正对照」与「3 真判据跨 3 个数据源」在数量上不匹配。**
- 事实：真判据候选 3 条分别落在 3 个数据源（S2a 事后补写占比 → git log × ADR 头部；S2b 五件套完整度 → docs/adr 结构；S1 定位关键词覆盖率 → README/roadmap/CHANGELOG 文本），而正对照只有 2 条。
- 本票解法（实现层，不改 D-018 配比）：把 2 条正对照设计为**跨族驱动**——PC-1 同时驱动 `adr-structure` 与 `positioning` 两族；PC-2 驱动 `gitlog` 族并与 `adr-structure` 交叉。这样 3 族全部被正对照覆盖，每条真判据都能指认至少 1 条同族正对照。
- 若票 22 认为需改配比（例如改为 3 正对照），属改向，须由票 22 显式回写账本，本票不代劳。

## §2 仓库现状（一手核验）

| 现状 | 证据 |
|---|---|
| `audit_fact` 16 列已冻结，`collector_id` / `observed_at` 两列 `inherits=R3-D3` | `engine/src/fact/schema.ts`（AUDIT_FACT_FIELDS） |
| 写入口唯一：`appendFact(connection, FactEvent)`；`fact_seq` / `ingested_at` / `schema_version` 由 store 赋值 | `engine/src/fact/store.ts` |
| 只追加守卫已落地：`classifyStatement` / `assertAppendOnly` / `REWRITE_BLACKLIST` | `engine/src/fact/schema.ts` |
| 采集器零实现 | `engine/src/` 现有 cli / index / manifest / selftest / fact 五个模块 |
| 本机禁安装原生绑定、禁构建；构建与测试一律 CI | #20 结论 + package.json scripts |
| handoff 上下文摘要「fact table/采集器零实现」的 fact table 部分已被 #20 过时 | ledger A-021 = done |

## §3 工业界成熟方案对标

### 3.1 SARIF v2.1.0（OASIS 标准）—— 确定性扫描器 + 固定输出 schema
- 来源：<https://www.oasis-open.org/standard/sarifv2-1-os/>
- 心智：静态分析工具只产出**事实**（ruleId / level / locations / message），判定与聚合交给消费方；输出形状由标准固定，工具不得自由扩展核心字段。
- **同构点**：本票「输出形状绑定 schema v0」= 把采集器降级为 SARIF producer，裁决留给 B/C 层。**异构点**：SARIF 面向缺陷定位，本票面向度量事实（`metric` + `value_json`），无 severity 概念。

### 3.2 OpenTelemetry / W3C Baggage —— 关联键前置 + 信号只追加
- 来源：<https://opentelemetry.io/docs/concepts/signals/baggage/>
- 心智：`trace_id` 标识链路，`baggage` 携带跨服务业务维度；二者随信号一起传播，信号只追加不可改写。
- **同构点**：`audit_fact` 的 correlation 组（`trace_id` / `baggage_id`，CHAR(32) hex）位于 payload 之前（#20 断言 F7），正是 OTel 心智的 schema 化。**异构点**：OTel 有 8KB / 64 条目限值与 SDK 传播链，本场景只需在 schema 层固定形态，无运行时传播。

### 3.3 Bazel Hermeticity —— 同输入同输出 + 动作默认无网络
- 来源：<https://bazel.build/basics/hermeticity>
- 心智：给定相同输入源码与产品配置，封闭构建**总是**返回相同输出；构建动作与宿主隔离，网络受限。
- **同构点**：本票「不接 LLM + 无网络调用断言 + 注入时钟 + 内容哈希派生 ID」= 采集层的 hermeticity。**异构点**：Bazel 靠沙箱强制，本票靠「依赖注入 + 守卫源码扫描」两层（Node 侧无沙箱可用）。

### 3.4 补充先例（上轮已核实）
- EventStoreDB / Kafka：append-only event log，无 update 路径 —— 与 #20 只追加守卫同构，见 `reports/20-research.md` §5；本票继承而非重开。

## §4 推荐方案

1. **三族 + 注册表**：`adr-structure` / `positioning` / `gitlog`，经 `collect/index.ts` 统一注册；`collector_id` 形如 `adr-structure@v1`。
2. **纯逻辑 + 依赖注入**：文件内容与 git log 记录由调用方注入；采集器自身不读 fs、不起子进程、不发网络请求。收益：守卫可零依赖 import；同输入 ⇒ 同行（字节级可复现）。
3. **确定性 ID**：`fact_id` / `trace_id` / `baggage_id` 由内容哈希（node:crypto sha256）派生；`observed_at` 由注入时钟决定；不使用 `Math.random`、不使用 `Date.now()`（守卫 N2 断言）。
4. **输出契约**：每族产出严格等于 `store.FactEvent` 的 13 个字段；`fact_seq` / `ingested_at` / `schema_version` 三列由 store 赋值，采集器不得自造（守卫 S 组断言）。
5. **映射表先落文再写码**（启动器专属 delta 第 1 条）：`reports/21-collector-map.md` + 机器可读 `reports/21-collectors.json`；「判据 → 采集器族」映射供票 22 直接引用。

## §5 信息缺口（Sufficiency Gate，不掩盖）

1. **阈值缺失**：A-023 未闭环，本票不设任何阈值常量；票 22 必须补。
2. **S3/S4/S5 三族未落地**：D-016 阶段 1 只起手 S1+S2；本票注册表留扩展位但不开空头实现。
3. **真仓实测未做**：本票只用 fixture 验证形状（守卫层），6F 真跑属阶段 1，不在本票。
4. **git log 族的宿主适配**：本票把 git log 视为「已解析的记录流」注入，真正的 `git log --follow` 调用与解析属适配层，未在本票实现（避免引入子进程依赖，守住无网络/无副作用断言）。
5. **ADR 头部格式自由度**：`docs/adr/*.md` 现用 `- Status:` / `- Date:` 列表式头部 + `## Context` / `## Decision` / `## Consequences` 章节；若未来引入 YAML front-matter，解析需扩一档（本票按现状实现，守卫锁定现状格式）。

## §6 引用文件

- `.scratch/architecture-recovery/issues/21-deterministic-collectors.md`
- `.scratch/architecture-recovery/handoffs/21-deterministic-collectors.md`
- `.scratch/architecture-recovery/spec.md` §R3-D3（L311-312）
- `.scratch/architecture-recovery/decision-ledger.md` L225-L242（A-019 ~ A-030）；macro-audit 账本 D-016 / D-017 / D-018
- `docs/adr/0013-three-layer-acceptance-gates.md`
- `CONTEXT.md` L86-L93（S1 Positioning Convergence / S2 ADR Quality）
- `engine/src/fact/schema.ts`、`engine/src/fact/store.ts`
- `.scratch/architecture-recovery/reports/20-research.md` §5
- `reports/20-fact-schema-check.mjs`（守卫模板）
