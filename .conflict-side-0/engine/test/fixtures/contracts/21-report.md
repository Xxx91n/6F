# 21-report — 确定性采集器（A-022 / spec.md §R3-D3）

- **票：** #21 ｜ **A-xxx：** A-022 ｜ **对应 issue：** issues/21-deterministic-collectors.md ｜ **对应 prompt：** prompts/21-deterministic-collectors.md
- **日期：** 2026-09-13 ｜ **守卫：** reports/21-collectors-check.mjs **43/43 PASS（退出码 0）** ｜ **#20 守卫回归：** 28/28 PASS

## §1 开工复述（per 启动器「开工第一句」）

**阻塞状态：** 本票 Blocked by #20。核实 ledger A-021 = done（#20 闭环，绑定唯一 @duckdb/node-api@1.5.5-r.4 + 只追加守卫 28/28 PASS），**阻塞已解除**。

**必读清单逐条路径（动手前逐条确认可解析）：**

| # | 条目 | 路径 | 确认 |
|---|---|---|---|
| 1 | issue | .scratch/architecture-recovery/issues/21-deterministic-collectors.md | 628 B |
| 2 | handoff | .scratch/architecture-recovery/handoffs/21-deterministic-collectors.md | 1958 B |
| 3 | spec | .scratch/architecture-recovery/spec.md §R3-D3（L311-312） | 可解析 |
| 4 | WORKFLOW | .scratch/architecture-recovery/WORKFLOW.md §4.2（L229-262） | 可解析 |
| 5 | ledger | .scratch/architecture-recovery/decision-ledger.md L234（A-022 行） | current → 本票回写 done |
| 6 | ADR | docs/adr/0013-three-layer-acceptance-gates.md | 1978 B |

## §2 调研（per WORKFLOW §4.2.3）

调研全文见 reports/21-research.md。要点：

1. **与 current 决策的显式点名**：D-016（阶段 0 末块、确定性、不接 LLM）、D-017（B 判据确定性）、D-018（2 正对照 + 3 真判据 + 1 负对照，正对照与真判据共享 detector 路径）、A-023（阈值跑前写死，本票禁止预设）。
2. **冲突 C-21-1（已显式点名，不静默改向）**：D-018 只给 2 条正对照，而 3 条真判据分布在 3 个数据源。本票在实现层把 PC-1 设计为同时驱动 adr-structure + positioning、PC-2 驱动 gitlog（并与 adr-structure 交叉），使 3 族全部被正对照覆盖。**D-018 的 2+3+1 配比未改**；若票 22 认为需改配比，须由票 22 显式回写账本。
3. **工业对标（>=2，一手来源）**：
   - SARIF v2.1.0（OASIS 标准，https://www.oasis-open.org/standard/sarifv2-1-os/）：确定性扫描器只产事实、输出形状由标准固定，与本票「输出形状绑定 schema v0」同构。
   - OpenTelemetry / W3C Baggage（https://opentelemetry.io/docs/concepts/signals/baggage/）：trace_id + baggage 前置关联、信号只追加，与 A-010 correlation key 同构。
   - Bazel Hermeticity（https://bazel.build/basics/hermeticity）：同输入同输出、动作默认无网络，与「不接 LLM + 无网络断言 + 注入时钟 + 内容哈希派生 ID」同构。
4. **仓库现状一手核验**：audit_fact 16 列中 collector_id / observed_at 两列 inherits=R3-D3，本票是这两列的唯一生产者；写入口唯一为 appendFact。

## §3 交付物

| 交付物 | 说明 |
|---|---|
| engine/src/collect/collectors.ts | 三族实现 + 注册表 + DETECTOR_BINDING。**单模块、零相对 import**：使守卫可用 Node 自带类型剥离直接 import（已实测 Node 22.22 / 24.11 均不解析 .js → .ts，故不做跨文件拆分） |
| reports/21-collector-map.md | **映射表先落文**（启动器专属 delta 第 1 条）：每族 输入 → 抽取逻辑 → 输出字段映射；公共列映射；detector 同族声明 |
| reports/21-collectors.json | 机器可读映射表（3 族 + 6 条判据绑定 + for_ticket_22），守卫 D5 断言其与代码零漂移 |
| reports/21-collectors-fixture.json | fixture：完整 ADR（PC-1）/ 残缺 ADR / 已知事后补写 ADR（PC-2）/ 定位素材 / 3 条 commit |
| reports/21-collectors-check.mjs | 守卫：N / S / C / D / A 五组 43 条断言 |
| reports/21-guard-run.log | 守卫运行实录（43/43 PASS） |
| reports/21-research.md | 调研报告 |

### §3.1 三族与判据绑定（供票 22 直接引用）

| 判据 | 类型 | detector 族 | 同族正对照 | 阈值 |
|---|---|---|---|---|
| PC-1 管线健康闸 A | 正对照 | adr-structure + positioning | — | — |
| PC-2 管线健康闸 B | 正对照 | gitlog（× adr-structure） | — | — |
| TC-1 S2a 事后补写占比 | 真判据 | gitlog（× adr-structure） | PC-2 | 待票 22 |
| TC-2 S2b 五件套完整度 | 真判据 | adr-structure | PC-1 | 待票 22 |
| TC-3 S1 定位关键词覆盖率 | 真判据 | positioning | PC-1 | 待票 22 |
| NC-1 负对照 | 负对照 | adr-structure | 无（命中走复核路径） | — |

**五件套定义（本票定版，票 22 直接引用）**：Status / Date / Context / Decision / Consequences，完整度 = 命中数 / 5。

### §3.2 守卫断言分组结果

| 组 | 覆盖 | 结果 |
|---|---|---|
| N（1-6） | 不接 LLM / 无网络 / 无子进程 / 无 fs / 无 Date.now 与 Math.random / 无预设阈值 | 6/6 PASS |
| S（1-12） | 输出形状符合 schema v0：键集 = 采集器 13 列、枚举、UUID 与 hex 形态、value_json 合法、长度与 NOT NULL 约束、注入时钟与 trace 传播 | 12/12 PASS |
| C（1-16） | 抽取正确性与确定性：五件套 / supersede / 决策日期 / 覆盖率 / 首现提交 / adr_lag_days = 42（PC-2）/ 重跑字节相同 / baggage 稳定 | 16/16 PASS |
| D（1-6） | detector 同族声明：2+3+1 配比、每条真判据有同族正对照、三族全覆盖、映射表与代码零漂移、阈值全 null | 6/6 PASS |
| A（1-3） | 只追加：复用 assertAppendOnly 拒绝 6 条改写语句、源码无 SQL 改写 token、导出无 mutating 函数 | 3/3 PASS |

## §4 信息缺口（Sufficiency Gate，不掩盖）

1. **阈值缺失**：A-023 未闭环。本票只交付可测信号，DETECTOR_BINDING 所有 threshold 为 null（守卫 N6 / D6）。
2. **真仓实测未做**：本票只用 fixture 验证形状与抽取逻辑；6F 真跑属阶段 1。
3. **git log 宿主适配未实现**：本票把 commit 记录视为注入流，真正的 git log --follow 调用与解析属适配层（避免引入子进程依赖，守住 N4 断言）。
4. **S3 / S4 / S5 三族未落地**：D-016 阶段 1 只起手 S1+S2；注册表留扩展位但不开空头实现。
5. **TS 编译未本机验证**：本机禁构建（沿用 #20）。本票未改动 tsconfig.json 与 package.json，也未改动 src/index.ts（沿用 #20 新模块不挂入口的既有做法），故编译面增量仅为新增单文件；npm run build / smoke 以 CI 为准。
6. **CJK 分词为 2-gram 规则**：非语义分词，对中文定位素材是粗粒度近似；票 22 若需更细口径须显式登记为改向。

## §5 完成定义对照（per handoff + issue 检查项）

| 完成定义 / 检查项 | 状态 | 证据 |
|---|---|---|
| 三族采集器实现 | done | engine/src/collect/collectors.ts（collectAdrStructure / collectPositioning / collectGitlog） |
| 映射表落文 | done | reports/21-collector-map.md + reports/21-collectors.json |
| 守卫 PASS | done | 21-collectors-check.mjs **43/43 PASS，退出码 0**；#20 回归 28/28 PASS |
| 采集清单落文（每族 输入 → 抽取逻辑 → 输出字段映射表） | done | 映射表 §2 |
| 不接 LLM（无网络调用断言，可机检） | done | 守卫 N1-N6 |
| 正对照与真判据同族 detector 声明 | done | 映射表 §4 + DETECTOR_BINDING + 守卫 D1-D5 |
| 守卫断言：输出形状符合 schema v0 | done | 守卫 S1-S12（39 条事实逐列校验） |
| ledger A-022 回写 done | done | decision-ledger.md L234 |
| WORKFLOW §4 追加 1 行 lessons | done | WORKFLOW §4 Lessons 表 |
| commit msg 引用 A-022 + 守卫结果 | done | 见 §8 |

## §6 阻塞

- **本票阻塞：无**（#20 已闭环，阻塞解除）。
- **下游待办（不阻塞本票）**：票 22 需补 3 条真判据阈值并写预声明文档；票 22 若质疑 C-21-1 的跨族驱动解法，须显式回写账本而非静默改配比。
- **CI 待验证**：engine/** 变更将触发 engine-ci.yml（3 OS × Node 20/22 = 6 cells），构建与 smoke 结果以 CI 为准。

## §7 lessons 候选

| ID | 教训 | 处置 |
|---|---|---|
| L-21-a | Node 22.22 / 24.11 的类型剥离不解析 .js → .ts 相对 import（实测 Cannot find module .../adr-structure.js）；按 NodeNext 写 .js 后缀的 TS 多文件模块，守卫脚本直接 import 会失败 | 供守卫直接 import 的纯逻辑模块必须单模块、零相对 import（只依赖 node: 内建），或改用 .ts 后缀 + TS 5.7+ allowImportingTsExtensions；本票选前者以免改 tsconfig |
| L-21-b | 源码级「不接 LLM」断言若直接扫原文，会被注释里的「不接 LLM」字样自伤（首轮 N2 FAIL，llmTokens 命中 llm） | 源码扫描断言必须先 stripComments 再匹配（与 #20 stripComments 同法） |
| L-21-c | D-018 的「2 正对照」与「3 真判据跨 3 数据源」数量不匹配，是实现层必须先解的结构冲突 | 用「跨族驱动」解：1 条正对照可驱动多族，配比不变；冲突须显式点名并写明改配比属改向 |

## §8 版本控制处置（per WORKFLOW §4.2.1）

- 全程走 but CLI，未使用任何 git 写命令。
- 本 session 独立分支，未动他人分支；未执行 push（push 属外部副作用，须用户明示授权）。
- commit message 引用 A-022 + 守卫结果：21(A-022): 确定性采集器三族 + 映射表 — 守卫 43/43 PASS。

## §9 引用文件列表

- .scratch/architecture-recovery/issues/21-deterministic-collectors.md
- .scratch/architecture-recovery/handoffs/21-deterministic-collectors.md
- .scratch/architecture-recovery/prompts/21-deterministic-collectors.md
- .scratch/architecture-recovery/spec.md（§R3-D3 L311-312）
- .scratch/architecture-recovery/decision-ledger.md（L234 A-022；L225-L242 A-019~A-030）
- .scratch/architecture-recovery/WORKFLOW.md（§4.2.1 版本控制 / §4.2.2 文件写入 / §4.2.3 调研 / §4.2.5 报告）
- docs/adr/0013-three-layer-acceptance-gates.md
- CONTEXT.md（L86-L93：S1 Positioning Convergence / S2 ADR Quality）
- engine/src/fact/schema.ts、engine/src/fact/store.ts（schema v0 / 唯一写入口）
- engine/src/collect/collectors.ts（本票实现）
- reports/21-research.md、reports/21-collector-map.md、reports/21-collectors.json
- reports/21-collectors-fixture.json、reports/21-collectors-check.mjs、reports/21-guard-run.log
- reports/20-fact-schema-check.mjs（守卫模板 + 回归基线）
