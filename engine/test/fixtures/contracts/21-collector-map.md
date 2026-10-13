# 21 — 采集清单与字段映射表（A-022 / spec.md §R3-D3）

> 启动器专属 delta 第 1 条：**映射表先落文再写码**。本文件是 `engine/src/collect/**` 的唯一规格来源；机器可读版见 `reports/21-collectors.json`。

## §1 总契约

| 项 | 值 |
|---|---|
| 输出表 | `audit_fact`（schema v0，16 列） |
| 采集器生产列（13） | `fact_id` `trace_id` `baggage_id` `scale` `quadrant` `dimension` `collector_id` `repo_ref` `subject_ref` `evidence_ref` `metric` `value_json` `observed_at` |
| store 生产列（3） | `fact_seq`（identity）`ingested_at`（DEFAULT）`schema_version`（= SCHEMA_VERSION_V0） |
| 写入口 | `engine/src/fact/store.ts` 的 `appendFact(connection, FactEvent)`，采集器不直接触库 |
| 只追加 | 复用 `assertAppendOnly`；采集器侧无 update/delete 路径 |

## §2 三族采集器（输入 → 抽取逻辑 → 输出字段映射）

### 2.1 `adr-structure@v1`（S2 ADR 质量）

**输入**：注入的 `{ path, text }[]`（docs/adr/*.md 内容）。

**抽取逻辑**：

1. 头部字段（列表式 `- Key: value`）逐行扫描，取 H1 之后首个非空块；目标字段 = `Status` / `Date` / `Deciders` / `Ledger`。
2. 正文章节：`^## ` 开头行，目标 = `Context` / `Decision` / `Consequences`（另记 `Options` / `Considered Options` 为可选项）。
3. supersede 链：全文字段级匹配 `supersede`（大小写不敏感，含 `superseded by` / `supersedes`）。
4. 五件套 = `Status` / `Date` / `Context` / `Decision` / `Consequences`，完整度 = 命中数 / 5。

**输出字段映射**：

| audit_fact 列 | 取值 |
|---|---|
| `collector_id` | `adr-structure@v1` |
| `dimension` | `S2` |
| `quadrant` | `strategic` |
| `subject_ref` | ADR 文件路径 |
| `evidence_ref` | `<adr path>#L<line>`（命中行；聚合类指标用 `<adr path>`） |
| `metric` | `adr.header_field_present` / `adr.section_present` / `adr.five_piece_completeness` / `adr.supersede_link_present` / `adr.decision_date` |
| `value_json` | 见 `21-collectors.json` 的 `value_shape` |

### 2.2 `positioning@v1`（S1 定位收敛）

**输入**：意图声明文本数组（README / roadmap / epic）+ 实际交付文本数组（CHANGELOG / PR 标题 / issue label）+ 抽取配置 `{ topN, stopwords }`。

**抽取逻辑**：

1. 意图文本确定性分词：ASCII 词（长度 ≥ 2，小写化）+ CJK 2-gram。
2. 去停用词（注入表）后按频次降序、同频按字典序取 `topN` 作为定位关键词集合（同频字典序保证确定性）。
3. 在交付文本中逐词命中统计（大小写不敏感）；覆盖率 = 命中词数 / 关键词数。
4. 漂移锚 = 关键词集合中首个未命中词（按集合顺序）。

> `topN` 是**采集配置**（决定关键词集合规模），不是判据阈值；阈值归票 22，见 §4。

**输出字段映射**：

| audit_fact 列 | 取值 |
|---|---|
| `collector_id` | `positioning@v1` |
| `dimension` | `S1` |
| `subject_ref` | 意图声明文档路径 |
| `metric` | `positioning.keyword_coverage` / `positioning.keyword_hit` / `positioning.drift_anchor` |

### 2.3 `gitlog@v1`（跨族交叉）

**输入**：注入的 commit 记录 `{ sha, author, date, paths[] }[]` + 注入的 ADR 日期映射 `{ adrPath: date }`（由 `adr-structure@v1` 产出）+ 目标路径列表。

**抽取逻辑**：

1. 按路径聚合：首现提交 = 最早 `date`；同 `date` 时按 `sha` 字典序取小（确定性兜底）。
2. 提交数、作者分布（作者名升序；`top_author` = 计数最高，同数按名字典序）。
3. 与注入 ADR 日期比对得 `delta_days = adr_date - first_commit_date`（天，可为负）。

**输出字段映射**：

| audit_fact 列 | 取值 |
|---|---|
| `collector_id` | `gitlog@v1` |
| `dimension` | `null`（跨维，S2a 与 S5 共用） |
| `evidence_ref` | `<sha>` |
| `metric` | `git.first_commit` / `git.commit_count` / `git.author_matrix` / `git.adr_lag_days` |

## §3 公共列映射（三族一致）

| audit_fact 列 | 来源 | 确定性保证 |
|---|---|---|
| `fact_id` | `sha256(collector_id 竖线 subject_ref 竖线 metric 竖线 value_json 竖线 observed_at)` 取前 32 hex，格式化为 UUID 形态（36 字符） | 内容寻址，同输入同行 |
| `trace_id` | 注入的 run trace_id（32 位小写 hex） | 调用方保证 |
| `baggage_id` | `sha256(repo_ref 竖线 scale 竖线 quadrant 竖线 dimension 竖线 run_id)` 取 32 hex | 同一 (仓, scale, quadrant, dimension, run) 恒定，供 A-010 跨尺度关联 |
| `scale` | 注入；默认 `Macro-B`（D-016 阶段 1 = Macro-B 单仓 happy path 于 6F 自身） | 配置 |
| `repo_ref` | 注入 | 配置 |
| `observed_at` | 注入的 ISO-8601 时刻 | 禁用 `Date.now()` / `Math.random()` |
| `value_json` | `JSON.stringify(value)`（键序固定为构造顺序） | 结构固定 |

## §4 detector 同族声明（判据 → 采集器族，供票 22 直接引用）

| 判据 | 类型 | detector 族 | 交叉族 | 同族正对照 | 阈值 |
|---|---|---|---|---|---|
| PC-1 管线健康闸 A | 正对照 | `adr-structure` + `positioning` | — | — | — |
| PC-2 管线健康闸 B | 正对照 | `gitlog` | `adr-structure` | — | — |
| TC-1 S2a 事后补写占比 | 真判据 | `gitlog` | `adr-structure` | PC-2 | 待票 22 |
| TC-2 S2b 五件套完整度 | 真判据 | `adr-structure` | — | PC-1 | 待票 22 |
| TC-3 S1 定位关键词覆盖率 | 真判据 | `positioning` | — | PC-1 | 待票 22 |
| NC-1 负对照 | 负对照 | `adr-structure` | — | 无（命中走复核路径，不自动定罪） | — |

**跨族驱动说明（冲突 C-21-1 的解法）**：D-018 只给 2 条正对照，而 3 条真判据分布在 3 个数据源。本票把 PC-1 设计为同时驱动 `adr-structure` 与 `positioning` 两族、PC-2 驱动 `gitlog`（并与 `adr-structure` 交叉），使每条真判据都能指认至少 1 条同族正对照，D-018 的 2+3+1 配比不变。若票 22 认为需要改配比，属改向，须由票 22 显式回写账本。

## §5 不接 LLM 的机检口径

- 采集器源码禁止出现网络原语（`fetch` / `http` / `https` / `XMLHttpRequest` / `axios` / `net` / `tls` / `dns`）。
- 禁止出现任何 LLM / 模型 API 名（`openai` / `anthropic` / `claude` / `gpt` / `gemini` / `embedding` / `llm` 作为标识符）。
- 禁止 `Date.now()` / `Math.random()` / `require("child_process")` / `spawn` / `exec`。
- 上述全部由 `reports/21-collectors-check.mjs` 源码扫描断言（N 组）。
