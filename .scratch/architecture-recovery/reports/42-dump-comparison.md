# 42-dump-comparison — CodeLore sqlite/parquet dump vs 逐面契约路径 三轴对照评估

> 票：#42 / R5-11｜A-xxx：A-047｜决定：D-035③（dump 立为对照评估项；首批仍走逐面契约；采纳须另立 ADR）、D-034③、D-023、ADR-0014（双轨制/ACL 纪律）
> 性质：**对照评估呈报**——本文件只做评估结论呈报，不采纳、不接入、不立 ADR（采纳权留用户闸门）。
> 实物证据：`42-probe.mjs` 只读枚举（`--version`/`--help`/`analyze --help`/`docs`/`schema`/`profile`，零 analyze 计算面、零 --output 写副作用）→ `42-probe-measurements.json` + `42-{version,top-help,analyze-help,docs.md,schema.txt,profile.txt}` 档案。
> 对照基线（#35 产出）：`engine/src/upstream/codelore.ts` 30 面契约＋`engine/test/fixtures/codelore/batch1/manifest.json`＋`35-facet-reconciliation.json`（57 枚举）＋`35-analyze-help.txt`（format 行跨票对账 drift=none）。

## 0. dump 面形态实物枚举（2026-09-16 探针读数，codelore 0.28.0）

| 枚举面 | 实物读数（逐字） | 出处 |
|---|---|---|
| sqlite 格式定义 | `sqlite: full fact-store dump; requires --output` | analyze --help format 行（42-analyze-help.txt） |
| parquet 格式定义 | `parquet: hotspots, revisions, summary; requires --output` | 同上 |
| docs 逐条定义 | `parquet — columnar bulk export for analytical pipelines`／`sqlite — full DuckDB fact-store dump` | 42-docs.md L74-75 |
| provenance 形态 | `Every file output is paired with a .provenance.json sidecar capturing the run's full Options shape. SQLite outputs embed the equivalent inside the provenance table.` | 42-docs.md L88 |
| 内部 schema | `Schema: schema_v8 (facts/schema_v1.sql)`；DuckDB 1.10505.0；缓存=每仓 5 份 fact store 轮替 | 42-profile.txt |
| 公开 schema 面 | `codelore schema` 目录 = **57 个输出行类型**（与 analyze 枚举同集），`minimal envelope`（schemars derive 未全量应用）——**dump 内部表 schema 不在公开面** | 42-schema.txt |
| 格式全集 | csv/json/ndjson/sarif/markdown/gha/html/parquet/sqlite/spa/step-summary（11 种） | 42-probe-measurements.json |

**关键定性**：sqlite dump = **ingest 层原始 fact-store 的全量导出**（codelore 内部 DuckDB 持久缓存的镜像），不是 57 个分析面的产出物；parquet = 仅 3 个分析面的列式导出（57 中占 3，是逐面契约路径的真子集）。

## 1. 轴①：字段覆盖度

| 维度 | 逐面契约路径（现状） | sqlite dump 路径 | parquet 路径 |
|---|---|---|---|
| 覆盖对象 | **分析产出层**：30 面契约字段逐列钉死（manifest `columns` 逐字，如 instability=path/ca/ce/instability、bus_factor=module/total_commits/bus_factor/top_contributor/top_contributor_share/model、coordination-needs 8 列含 cochange_entropy/tier） | **ingest 原始层**：内部 fact-store 表全集——是分析的输入原料，非分析结果 | 3 个分析面（hotspots/revisions/summary）的产出层 |
| 对 30 面契约字段的覆盖 | 30/30（契约即字段清单） | **0/30**——instability、bus_factor、god_score、fractal_value、cochange_entropy、lead_time_seconds、acceleration、health bands 等派生字段**不出现在 fact-store**，须由我方重算 | 3/30（且该 3 面中 hotspots 属暂缓面集未契约） |
| 字段语义锚 | 列名+行形状+spot 值+独立双通道计量（json-row0 vs csv-header） | 内部 schema_v8（`facts/schema_v1.sql`）——`codelore schema` 公开面不覆盖内部表，字段含义无对外语义标注 | 同逐面契约（列名=分析行类型） |
| 层需求拉动适配 | 已按层需求分批（首批 30 面/LLM 面/暂缓 22 面挂 manual_watch） | 全量导出无粒度——要么全吃要么不吃 | 固定 3 面无拉动粒度 |

**轴①裁定**：dump 与契约面不在同一数据层——dump 是「原料全集」，契约是「成品字段」。若目标是消费上游分析语义（现状需求），dump 的契约字段覆盖度 = 0；parquet 是契约路径的真子集不构成替代。

## 2. 轴②：语义翻译面厚度

| 维度 | 逐面契约路径 | sqlite dump 路径 |
|---|---|---|
| 适配层职责 | 进程调用＋字节解析＋pin 校验——翻译厚度=列名→fact 载荷直通（codelore.ts 头注：「只做进程调用+原始输出解析」） | 须在我方适配层内**重新实现全部分析语义**才能达到同一字段含义 |
| 须重实现的上游语义清单（analyze --help 实物枚举） | 无（上游算好） | mailmap 归一化＋`.codelorebots` 过滤＋`.codelore-teams` 别名／rename-aware canonical lineage（`--no-canonical-lineage` 反证默认开）／`.gitignore`+`.codeloreignore`+`--exclude` 排除链／`--min-revs` 地板＋`--min-shared-revs`＋`--min-coupling/--max-coupling` 带通／Fisher 共变门＋`--fdr-correction` BH 校正／`--time-bucket` 逻辑提交桶化／`--departed-threshold-days` 离任判定／`--window-days` 锚定窗口／`--knowledge-model` commits/doe 双模型／`--rework-window-days`  rework 检测／`--release-tag-glob`／`--max-changeset-size` 重构扫荡过滤／`--code-maat-compat` 遗留行为族／`--include-merges` 语义差 |
| ADR-0014/D-020 合规性 | 合规——raw 语义不出适配层（上游语义=结构化行原样传出） | **结构性冲突**——重实现上游语义=把业务规则搬进适配层，直接违反「适配层禁放业务规则」；「raw 语义不出适配层」倒置为「raw 语义进适配层再复刻」 |
| 语义漂移可见性 | 行形状漂移即抛错（parseJsonRows 非数组/非对象行直接 throw）＋golden 逐面钉死 | 内部 schema_v8 演进不触 CLI 契约面——schema_v8→v9 可在 `--version` 不变、help 不变下发生，漂移无告警面 |
| provenance | 逐面 evidence argv＋resolution fact（binary/pinned/version） | dump 内嵌 provenance 表（run Options 快照）——**此项 dump 占优**，但记录的是运行选项非字段语义 |

**轴②裁定**：dump 路径的语义翻译厚度 = 把 codelore 分析引擎复刻进防腐层，厚度爆炸且结构性违反 ADR-0014。这不是工作量问题而是架构分层问题——上游语义的上游性正是契约路径的价值。

## 3. 轴③：golden 可测性

| 维度 | 逐面契约路径（已实证） | sqlite dump 路径 |
|---|---|---|
| golden 形态 | 30 cassette＋manifest 独立计量（columns/row_count/sha256/spot，双通道：json-row0 / csv-header 表头第二通道兜底空结果面） | DuckDB 二进制文件——页布局/WAL/缓存态属内部实现，**逐字节确定性非契约** |
| 可断言面 | argv 冻结（含 `--age-time-now`/`-e` 冻结参考时钟与表达式）→ stdout 形状→列名→行数→spot 值五级断言 | 仅能断言表名/行数——钉的是内部 schema_v8（非公开契约面），上游内部演进即 golden 盲漂 |
| 已落地测试 | codelore-batch1.test.mjs 41/41 入 smoke 链（#35 实证） | 无——需为每个重实现语义另建 golden 矩阵=重建上游整套测试面 |
| 失败语义 | facet_error/facet_parse_error 降级 fact 不中断（30 面独立失败域） | dump 解析失败=全量失败域（单点） |

**轴③裁定**：契约路径的 golden 已实证可测（41/41）；dump 路径只能钉内部 schema=钉非契约面，golden 价值降级为「上游实现细节快照」，审计口径锚定失效。

## 4. 工业先例对照（atomcode 深调研，2026-09-16；6+ searches/6 原文核验，来源清单存本节尾）

| 先例 | dump 侧 | 契约面 | 纪律 |
|---|---|---|---|
| Kubernetes etcd vs API server | etcd 内部 KV（编码随 etcd2→3 变） | 版本化 REST API＋watch 语义 | 仅 API server 有权触 etcd；直读绕过 schema 校验/准入/watch——API 是唯一程序化接口 |
| Terraform tfstate vs `show -json` | state 快照=实现细节 | `terraform output/show -json`（v1.x 兼容承诺） | HashiCorp 明文「state 格式非公开集成接口」；需要全量数据时官方**另造 JSON 契约输出**而非扶正内部格式——「dump 原料≠消费契约」教科书操作 |
| GitLab 生产 PG vs REST/GraphQL | `gitlab_internal` 分类表无兼容承诺 | 版本化 API＋废弃策略 | DB 直连=内部特权访问；schema 随 migration 无通知变更 |
| GitHub GH Archive | Events API 输出的固化快照（payload 字段上游随时可改） | REST/GraphQL 实时 API | GH Archive 成功恰因消费 API 输出非内部 schema——dump 侧也不许下游对结构做强假设 |
| CodeQL/SARIF | 内部 database（抽取器私有格式） | SARIF v2.1.0 OASIS 标准＋JSON schema | 交换面走标准契约；消费方须容忍字段增减——dump 消费者通常不守此纪律 |

**采纳 dump 为事实输入面的风险点（调研归纳）**：①内部 schema 无版本承诺→golden 基线静默失效；②绕过语义/校验层，raw 态与契约面同一实体可能不一致；③内部结构无对外语义标注→自维护「dump 字段→事实语义」翻译层且逐版重验；④快照无并发/事务语义，无法回答事实新鲜度；⑤官方不支持区，上游升级即断面。

**来源（原文核验）**：developer.hashicorp.com/terraform/language/state；discuss.hashicorp.com/t/48660（apparentlymart）；kubernetes.io api-concepts＋configure-upgrade-etcd；learnkube.com/etcd-breaks-at-scale；handbook.gitlab.com database-frameworks；docs.gitlab.com multiple_databases；gharchive.org；docs.github.com codeql-cli sarif-output；docs.oasis-open.org sarif v2.1.0。缺口：GitLab「DB 直连不受支持」逐字引语为间接强证据（访问管控＋internal 分类双源）。

## 5. 呈报结论

**结论 = 维持逐面契约路径，不采纳 sqlite/parquet dump 为事实输入面。**

1. **三轴汇总**：字段覆盖度——dump 对 30 面契约字段覆盖 0/30（层级错位：原料 vs 成品）；语义翻译面厚度——dump 要求复刻上游分析引擎入防腐层，结构性违反 ADR-0014；golden 可测性——dump 只能钉内部 schema_v8 非契约面，golden 降级为实现细节快照。
2. **与 D-035③ 对账**：决策原文「首批仍走逐面契约（契约即文档、golden 可测），dump 若采纳须另立 ADR（适配层语义翻译面变厚）」——本评估以实物证据实证了「适配层语义翻译面变厚」的完整量级（轴②清单 16 项上游语义须复刻），结论与 D-035③ 既定方向一致，**无冲突无 revised**。
3. **采纳门保持开放（不焊死）**：若未来层需求须原始粒度 fact-store（契约面无法表达的数据维度，如自定义跨面 join），采纳路径 = 另立 ADR＋pin 落定（exact-version 或 digest）＋golden 回归——锁表 `codelore-sqlite-dump` 行维持 `evaluating` 不翻状态（本票评估完呈报，状态翻转属 ADR 拍板权）。
4. **dump 保留合法用途**：诊断/调研侧通道（如一次性取证上游原始粒度验证契约面读数）——属分析管线原料用途（GH Archive/Terraform 先例的 dump 合法域），**不进 verdict 输入面**。
5. **parquet 同判**：3/57 子集且全属未契约/暂缓面，不构成替代路径。

## 6. 登记与裁决归属

- 本评估 = 对照评估落文义务（#42 checklist①②），非 ADR、非接入、非事实链改动——engine 源码零改动。
- 锁表 `codelore-sqlite-dump` 行注记已更新指向本文件＋结论；`status: evaluating` 维持（D-035③：采纳须另立 ADR——呈报不代拍）。
- Scorecard/repomix 探针维持「层需求拉动」队列登记（registry `upstream-probes-scorecard-repomix`，manual_watch 五要素齐备）——当前无层刚需，不插队。
