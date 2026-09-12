# Report: A-008 — Schema 版本演进规则

| 项 | 值 |
|---|---|
| A-xxx covered | A-008 |
| Decision | spec.md §Decision 5.2 |
| Blocked by | #07（已闭环） |
| 对应 issue / handoff / prompt | issues/08-schema-versioning.md / handoffs/08-schema-versioning.md / prompts/08-schema-versioning.md |
| 上游 ADR | ADR-0005（HoF-FA ①④） |
| 日期 | 2026-09-12 |
| 版本控制 | `but` branch `a008-schema-versioning`（per WORKFLOW §4.2.1） |

---

## 0. 开工复述（per 本票「开工第一句」硬要求）

本窗口在动手前先复述本票的 Blocked by 与必读清单全部路径，确认理解：

**Blocked by: #07 — DuckDB fact table 写入策略。** 已核实 #07 闭环：`reports/07-report.md` 存在（2026-09-11 21:29）、`decision-ledger.md` A-007 = `done`（单写多读 SWMR 决议）、commit `19871d9 docs(A-007): select single-writer/multi-reader strategy for DuckDB fact table`。**阻塞已解除，#08 可开工。**

**必读清单（6 项，全部读全）：**

1. `.scratch/architecture-recovery/issues/08-schema-versioning.md`
2. `.scratch/architecture-recovery/handoffs/08-schema-versioning.md`
3. `.scratch/architecture-recovery/spec.md` §Decision 5.2
4. `.scratch/architecture-recovery/WORKFLOW.md` §4.2（含 §4.2.1 版本控制 / §4.2.2 文件写入 / §4.2.3 调研 / §4.2.4 账本 / §4.2.5 报告 / §4.2.6 启动器硬规则）
5. `.scratch/architecture-recovery/decision-ledger.md` A-008
6. `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`

**理解确认：** 本票 = A-008「Schema 版本演进规则」，上游约束来自 ADR-0005 ① 事件单向写入（schema 不可改、版本号演进）+ #07 预留的 `schema_version` 槽位；交付四项 = 注册中心位置与 API / 版本号语义 / 消费者订阅机制 / Schema 变更事件契约；收尾须落 `reports/08-report.md`、更新 ledger A-008、追加 WORKFLOW §4 lessons，全程走 `but` 独立分支。

---

## 1. 决议摘要（四项专属验收逐条明文）

### 1.1 注册中心位置与 API

**决议：混合式，不建 HTTP 服务。**

- **契约层（source of truth）= git 内的 AsyncAPI 契约文件**（`docs/contracts/fact/*.yaml`），走 PR 评审 + CI 兼容性机检。
- **运行时注册层 = 与 fact table 同库的 DuckDB 元数据表 `schema_registry`**（单一事实底座内），提供版本解析 + 引用完整性 + 审计。
- **API 形状 = 照抄 Confluent Schema Registry 四操作语义**（register / get-by-id / list / check-compat），以**内部函数 + 只读视图**形态存在，**不暴露 HTTP 服务**。

### 1.2 版本号语义

**决议：`schema_version` = 从 1 起的单调递增 SMALLINT 序号，不装 SemVer。** 主/次/补丁语义映射为 SchemaVer 的 **MODEL / REVISION / ADDITION** 三段分类，作为**变更评审语言**写入 `schema_registry.change_class`，不进入版本号数字；破坏性大版本体现在**契约文档名**（`fact.v1` / `fact.v2`）。版本号只作「位置索引」，内容标识由 `schema_digest`（SHA-256）承担，防「版本号撒谎」。

### 1.3 消费者订阅机制

**决议：写侧闸门 = `BACKWARD_TRANSITIVE`；读侧选择 = 按版本区间声明 + 逐事件 `schema_version` 分派解析（schema-on-read）。** 未知 `schema_version` 默认 **跳过 + 计数 + 告警**；关键消费者（合规/计费类）配置为**阻断进 DLQ**；利用 JSON payload 可无损暂存的特性，未知版本先入库、契约发布后补解析。

### 1.4 Schema 变更触发的事件契约

**决议：三个 CloudEvents 信封事件写回 DuckDB 元数据/审计表** —— `SchemaVersionRegistered` / `SchemaVersionRejected`（含 409 Incompatible 与失败原因）/ `SchemaVersionDeprecated`，接入 A-012 的 contract/lineage canary 防线做告警与审计。硬规则：**生产关闭 auto-registration**，注册只在 hub 侧显式发生（对齐 ADR-0005 ④）。

---

## 2. 前置背景与约束回顾

### 2.1 issue 要件（issues/08-schema-versioning.md）

- **What to build：** AsyncAPI 事件契约风格的 schema 演进规则（schema 不可改 / 版本号演进 / 消费者按版本订阅）+ Schema 注册中心。
- **专属 delta（检查点）：** ① 注册中心位置必须确定（库？文件？HTTP 服务？）② 版本号必须明确语义；③ 四项交付见下。
- **Status：** ready-for-agent。

### 2.2 handoff 完成定义（handoffs/08-schema-versioning.md）

1. Schema 注册中心位置与 API
2. 版本号语义（主/次/补丁含义）
3. 消费者订阅机制（订阅哪个版本、跨版本兼容策略）
4. Schema 变更触发的事件契约

**通用调研要求（每票适用）：** atomcode 深度调研（per §4.2.3）+ 回顾 docs/adr（ADR-0005）+ 回顾 CONTEXT.md 心智模型 + 对标工业界成熟方案 ≥2。

### 2.3 decision-ledger A-008 原文约束

> | A-008 | Schema 版本演进规则（AsyncAPI 事件契约心智，schema 不可改、版本号演进） | D-005 事件单向写入要求 schema 不可改、版本号演进（AsyncAPI 风格） | 前置 = AsyncAPI 工具链选定；高优先级；被 A-009 阻塞 | D-005 |

**读法澄清（不掩盖账本内部不一致）：** A-008 行「显式约束」列写「被 A-009 阻塞」，而 A-009 行写「被 A-008 阻塞」，两行互相指认构成循环。本票以 **issue / handoff / prompt / README 波次表四处一致的 `Blocked by: #07` 为权威**（README Wave 2 表：`08 | Schema 版本演进规则 | A-008 | … | #07`），判定 A-008 行的「被 A-009 阻塞」为账本笔误，**不据此改序**。该不一致已记入 §7.4 lessons 候选。

### 2.4 ADR-0005 约束与承接点

ADR-0005 = 「中心事实辐射 + 联邦裁决治理」（HoF-FA），4 子决策：① 数据流 = 事件单向写入 + 按需拉取投影；② 报告聚合 = 独立语义层（read model），不做 UI 抓取；③ 冲突解决 = 证据强度优先 + 时间戳兜底 + 冲突可见可审计；④ 裁决协议共享 = hub 集中版本化、scale 自运行时执行、hub 只做元逻辑（裁决/契约/路由）不经过数据面。

**本票承接点：**

- ① 「事件单向写入」直接要求 schema 不可改、演进走版本号 → 本票的 4.2（版本号语义）与 4.3.5（expand-contract 不变式）。
- ④ 「hub 集中版本化」→ 本票的 4.1（注册中心在 hub 侧、与事实底座同库）+ 4.4.4（关闭客户端 auto-registration，注册只能由 hub 显式发起）。
- 「hub 只做元逻辑、不经过数据面」→ 注册中心是**元逻辑**（契约/路由），不承载事实数据，因此放在元数据表而非新建数据面服务。
- ③ 「冲突可见可审计」→ 本票的 4.4（变更事件契约全部可审计）。

### 2.5 CONTEXT.md 心智模型映射（本票相关术语）

| 术语 | 本票用法 |
|---|---|
| **Event Sourcing（本产品用法）** | 「事件单向写入 fact table，只追加不可改；schema 不可改、演进通过版本号（AsyncAPI 事件契约心智）」——本票是该条款的规则化。 |
| **SSOT** | 「同一审计事实只能由 DuckDB fact table 一处持有」——注册中心是**元数据**不是事实，因此可与 fact table 同库而不违反 SSOT；若另建 HTTP 服务则引入第二个存储，反而增加 SSOT 风险。 |
| **HoF-FA** | 「hub 只承载元逻辑（裁决/契约/路由），不经过数据面」——注册中心属契约元逻辑。 |
| **Read Model** | 「5 scale 各自从 fact table 投影的语义层」——本票的读侧订阅（4.3.3）即 read model 的投影入口规则。 |
| **Federated Computational Governance** | 「协议本体（…/schema 契约）由 hub 集中定义、版本化、code-as-policy」——注册中心即该协议本体的载体。 |
| **Failure Semantics** | 「每个 scale 都明写降级而非沉默失败」——本票的未知版本处理（4.3.4）按此要求显式三分（跳过/降级/阻断），禁止沉默。 |
| **Evidence Gate / Sufficiency Gate** | 本票的 FK 引用完整性 + `schema_digest` 校验即 Evidence Gate 的机制化；§6 信息缺口按 Sufficiency Gate 诚实标注。 |

### 2.6 上游 #07 接口（本票的输入契约）

07-report §4.3.3 的 DDL（spec 级 schema 定义，非实现代码）：

```sql
CREATE TABLE fact (
  version        BIGINT     NOT NULL,  -- 全局单调无空洞（块分配）；报告水位线
  schema_version SMALLINT   NOT NULL,  -- 事件契约版本；演进规则归 A-008（本票仅预留字段）
  event_type     VARCHAR    NOT NULL,  -- 审计事件类型（单向写入动作）
  scale_id       VARCHAR    NOT NULL,  -- Macro-A | Macro-B | Macro-C | Micro-A | Micro-B
  trace_id       VARCHAR,              -- 预留槽位；定义权归 A-010
  baggage_id     VARCHAR,              -- 预留槽位；定义权归 A-010
  payload        JSON       NOT NULL,  -- 事实载荷（DDL 不可改，演进走 schema_version）
  recorded_at    TIMESTAMP  NOT NULL,  -- 写者提交时刻
  PRIMARY KEY (version)
);
```

**本票直接继承的四条接口事实：**

1. `schema_version SMALLINT` 已定列类型（**不可改**）→ 本票的版本号语义必须装进 SMALLINT（见 4.2.4）。
2. `payload JSON NOT NULL` + 「payload 内不可变：schema 演化只能新增 schema_version 值，不能改 DDL」→ 本票的演进机制必须是**纯内容契约演进**（见 4.3.5）。
3. `version BIGINT` 全局单调无空洞（块分配）→ 本票的读侧水位/重放语义可直接复用（见 4.3.3）。
4. 07-report §5 明确：「A-008 演进规则（AsyncAPI 心智、注册中心）由 A-008 定义，本票不锁」→ 本票的授权边界。

---

## 3. atomcode 深度调研（per WORKFLOW §4.2.3）

### 3.1 执行参数

- 调用模板：`ctx_batch_execute(commands: [{label, command: "atomcode -p ..."}], concurrency: 1, timeout: 600000)`。
- **两轮串行**（同会话共享配额，禁并发）：R1 = 工业界 schema 版本演进方案与四问；R2 = DuckDB 落地细节 + 生态/供应链风险。
- 工具版本：`atomcode 5.0.9 (52ca5e6)`。
- 引擎覆盖：Exa / Tavily / AnySearch 三引擎交叉；R1 searches 16+ / full reads 12+ / domains 8+；R2 searches 15（Exa×8 + Tavily×4 + AnySearch×3，2 次 Exa 429 换引擎补齐）/ full reads 15。

### 3.2 R1 核心发现（每条带来源）

1. **HTTP REST 是注册中心的工业事实标准，其 API 形状即契约**（Confluent 官方 API Reference；Apicurio 以 `/apis/ccompat/v7|v8` 兼容实现）——register（`POST /subjects/{subject}/versions`，不兼容返 409/422）/ get-by-id（`GET /schemas/ids/{id}`）/ list（`GET /subjects/{subject}/versions`）/ check-compat（`POST /compatibility/...` → `{is_compatible}`）。
2. **文件/git 是「契约即代码」的合法工业路径**（Monte Carlo Data Contracts 101：「Treat contracts like code. Store them in Git, review via PRs, write tests」；buf `buf breaking` 四级严格度阶梯 FILE→PACKAGE→WIRE_JSON→WIRE）。
3. **库内（embedded）方案 = Fowler 的 schema-on-read 模式**（版本号随记录存储、schema 集中存放、读方按版本取 schema）——对「单写者 + 5 只读消费者」，**HTTP 服务不是必需的**：HTTP 注册中心的核心价值 = 并发注册仲裁 + 兼容检查集中执行 + 变更审计事件；单写者下注册仲裁恒等于无，兼容检查可前置到 CI，审计事件可写回 DuckDB 自己。
4. **SemVer 不适用于数据 schema 版本化**（Snowplow 2014 SchemaVer 原文论证）：SemVer 的 MAJOR 面向*代码依赖方*，schema 关心*历史数据能否被新 schema 读取*。三段映射：**ADDITION** = 兼容所有历史数据；**REVISION** = 可能阻断部分历史数据；**MODEL** = 破坏性。规则：从 1 起、无 0.x 不稳定期、用连字符 `1-0-1` 与 SemVer 视觉区分。
5. **subject version ≠ schema id**（Confluent 官方双源）：subject version = 进化作用域内的递增序号（位置索引）；schema ID = 全局内容寻址标识（相同定义跨 subject 共享同一 ID）。**两者都不是 SemVer**；兼容性靠注册策略，与版本号解耦。
6. **兼容策略是「注册时」的写侧闸门，订阅是「消费时」的读侧选择，二者正交**（Confluent 官方）。升级顺序硬规则：BACKWARD（默认）= 先升消费者再升生产者、可 rewind；FORWARD = 生产者先行、需「预想所有未来变更」（官方明示更难用）；FULL = 可独立升级但只允许加/删 optional 字段；NONE = 无检查，官方警告需谨慎。`*TRANSITIVE` 变体对**所有历史版本**检查，版本链 ≥3 时建议。
7. **FULL 实践中很快卡死**（Confluent 官方 + Florian 一线运维双源）：某电商团队在 FULL 下数个 sprint 无法做实质变更，出路是**版本化 topic**（`sensor-data-v1 → v2` + bridge consumer 过渡）。
8. **官方把「5 scale 按需拉取投影」命名为 schema-on-read**（Confluent event-streaming-patterns）：读方自行决定对每条事件应用哪个 schema 版本——即「拉投影时按 `schema_version` 选择解析器」的工业命名；消费者**按版本区间订阅**比按策略订阅更契合拉模式。
9. **变更事件有工业先例**（Confluent Cloud Schema Registry Management Auditable Events）：管理操作生成 **CloudEvents** 格式审计事件（`io.confluent.sg.server/request`），方法集含 `RegisterSchema`（失败返 `{status:FAILURE, errorCode:409, errorMessage:"Incompatible schema"}`）/ `DeleteSchemaVersion` / `UpdateSubjectConfig` 等 10 个，**其本身就是事件**（含 subject/version/id/principal/时间戳）。
10. **生产环境应关闭客户端 auto-registration**（Confluent 官方 security 文档）：否则客户端会悄悄注册不兼容 schema 绕过治理。

### 3.3 R2 核心发现（DuckDB 落地 + 风险）

1. **DuckDB FK 引用完整性支持且强制执行**（官方 constraints 文档直读）：`schema_version SMALLINT REFERENCES schema_registry(version)` 插入时探测 ART 索引，违规抛 `Violates foreign key constraint`。**前提与限制**：被引用列必须 PK/UNIQUE；**不支持 ON DELETE CASCADE**；**自引用插入不支持**；**ALTER ADD CONSTRAINT 仅部分约束支持**（官方明说 "not currently supported for all constraints"）→ **FK 必须在建表时声明**。
2. **DuckDB 核心引擎没有 JSON Schema draft 校验函数——硬边界，`data does not show`**（官方 1.5 JSON 标量函数清单直读）：只有 `json_valid`（语法）/`json_structure`（DuckDB 自定义结构推断，非 draft）/`json_type`/`json_keys` 等；**无任何 draft 校验函数**。唯一途径是社区扩展 `json_schema`（Query.farm，MIT，`INSTALL json_schema FROM community`）——但周下载 ~875、GitHub 5 stars、无活跃版本承诺，**实验性质，不可作为生产完整性唯一防线**。
3. **CHECK 约束能约束 JSON 字段但能力有限**（官方 constraints + issue #13365）：`CHECK(json_extract_string(payload,'$.x') IS NOT NULL)` 技术上成立，但历史上需显式 cast 绕过 binder error；CHECK 每行求值且 JSON 提取无法走索引（官方警告拖慢写入）；**无法表达 `$ref`/`allOf`/`oneOf`/`format` 等 draft 语义**。→ 结论：**JSON Schema draft 校验放写者进程内 + CI，DuckDB 侧只留 `payload JSON NOT NULL`（语法）+ FK（版本引用）+ 可选轻量 CHECK**。
4. **`payload JSON NOT NULL` 已由类型系统兜底语法合法性**（官方 JSON 类型文档）：插入非法 JSON 抛 `Conversion Error: Malformed JSON`，`json_valid` CHECK 冗余；注意 JSON 类型比较保留空白/键序（`'{"a":5}'::JSON != '{"a": 5}'`）。
5. **SMALLINT 上限 32767 足够**（官方数值类型表）：每天发布一个版本可用 89.8 年；DDL 冻结后无法改列类型。
6. **DDL 冻结下 expand-contract 退化为「纯内容契约」演进**（Fowler Parallel Change 官方 + Confluent 部署序 + 场景推理，中-高置信）：注册→切换写入→消费迁移→弃用，每步不变式可严格定义；**独特红利**是没有数据库双写/回填问题（结构不变、内容契约变、事件不可变），回滚全程无损；**但「压缩弃用窗口」仍是最常见事故源**。
7. **未知 schema_version 工业界三分，无单一正确答案**（AWS Glue 官方文档直读 + Fowler Tolerant Reader）：**跳过** = AWS Glue 官方原文 "log the data from the record and move on"；**降级** = schema-on-read 拉取后补解析（Confluent/Glue 消费端遇未知 schema ID 自动拉取并缓存）；**阻断** = "or halt the application" / DLQ。**分歧点**：AWS Glue 二选一放任（未规定默认），而 Confluent 默认 BACKWARD 而非 FORWARD 且自认 FORWARD 更难用——工业主流默认「消费者能读旧数据」，对 skip-unknown 持保留。
8. **Apicurio Registry 3.3.x 官方支持 AsyncAPI 3.1.0**（官方 artifact reference 直读：`ASYNCAPI: 2.0.0 → 2.6.0, 3.0.0, 3.1.0`；issue #7695 已 fixed）；**版本口径冲突（不悄悄二选一）**：Red Hat 3.1 build 文档只列到 `3.0.0`——3.1.0 支持是 3.3.x 引入的。**Microcks** 支持 v2.x/v3.x 但 **3.1.0 显式支持声明 `data does not show`**，且 2026-04 仍有 v3 导入 NPE 未修（成熟度中-低）。
9. **2026-07-14 AsyncAPI 供应链攻击属实，三源核验**（官方 issue #656 + 官方 postmortem + 多厂商报告）：5 个包被投毒（`@asyncapi/generator@3.3.1` / `generator-helpers@1.1.1` / `generator-components@0.7.1` / `@asyncapi/specs@6.11.2` 及 `6.11.2-alpha.1`），最后安全版本 = 3.3.0 / 1.1.0 / 0.7.0 / **6.11.1**；攻击路径 = PR spam 掩蔽 → `pull_request_target` pwn request → 窃取 `asyncapi-bot` token → force-push → **以合法 OIDC provenance 发布投毒包**；载荷 require 时即执行（非 postinstall）下载 RAT；暴露窗口 4h20m；CVSS 9.8；`@asyncapi/specs` 被 parser 以 `^6.11.1` 范围**传递式拉取**。
10. **头号教训：provenance 不是事前防线**（npm 官方文档直读：provenance "does **not guarantee** the package has no malicious code"）——它是事后审计/归因工具。事前防线 = exact-version/lockfile（`npm ci` + `overrides` 强制安全版本）+ 版本白名单 + `min-release-age` 冷却期（本案暴露窗口仅 4h20m，冷却期直接抵消）+ `npm audit signatures` + CI egress 阻断。

### 3.4 对标工业界成熟方案（≥2 要求达成 — 实际 7 个）

| 方案 | 注册载体 / API | 版本号语义 | 兼容机制 | 消费者订阅 | 变更事件 / 审计 | 主要局限 |
|---|---|---|---|---|---|---|
| **Confluent Schema Registry** | HTTP REST（subject/version/id，Kafka WAL 存储） | subject version=序号；schema id=全局内容寻址；非 SemVer | BACKWARD/FORWARD/FULL/NONE + TRANSITIVE；注册时强制，默认 BACKWARD | 消息内嵌 schema ID 自描述；auto.register / use.latest.version | CloudEvents 审计事件（10 个方法，含 409 失败） | 需独立服务运维；FULL 过紧、FORWARD 难用（官方自认）；Kafka 锁定 |
| **Apicurio Registry** | HTTP REST；**兼容 Confluent ccompat v7/v8**；支持 AsyncAPI 2.0–3.1 + JSON Schema draft-04→2020-12 | artifact/version/globalId 模型 | 同 Confluent 语义 | 同 Confluent | 版本状态机 ENABLED/DISABLED/DEPRECATED | 独立服务；本场景偏重 |
| **AsyncAPI 规范** | 契约=文件(git)，`info.version` 文档级 SemVer；**官方无 registry 组件** | 文档版本 major.minor.patch；**文档版本 ≠ 消息版本** | 规范无内置兼容检查，靠工具/CI 补 | 无标准；实践=资源版本化（topic 内嵌 v1/v2） | 无官方事件，靠 PR + CI | 版本化「无银弹」；无官方 registry 是现状 |
| **JSON Schema + $id** | 文件/git；`$id` 可作版本锚点 | SchemaVer（MODEL-REVISION-ADDITION）或借 SemVer；无官方强制语义 | 无内建兼容判定，需自建策略 | schema-on-read，读方自选版本 | 无；靠 CI 校验 | 兼容判定无标准实现 |
| **AWS Glue Schema Registry** | 托管 REST（registry/schema/version）+ SerDe 库 | schema 级递增 version | FORWARD/BACKWARD/FULL（+ NONE/DISABLED 及 `*_ALL` 变体），注册即检查 | 消息携带 schema id；消费端凭 id 解析，未知 ID 自动拉取并缓存 | IAM 控制变更者 + AWS 审计 | Avro 优先；与 Confluent 模型略异（无 subject/全局 id） |
| **Apache Iceberg** | 表元数据层（JSON metadata + 列 field ID） | 元数据随 snapshot 版本化；无语义版本号 | 元数据级 add/drop/rename/reorder/widen；**ID 永不复用**；读时按 ID 投影 | 读时按 field ID 映射，新 schema 下旧文件自动兼容 | snapshot 提交即演进记录 | **机械安全 ≠ 下游兼容**（rename 断 dbt/Looker） |
| **Delta Lake** | 表事务日志；schema-on-write enforcement | 无显式版本号 | 默认 enforcement 拒写不匹配；`mergeSchema` / `autoMerge` | 读时按事务日志解析最终 schema | 事务 audit log | **evolution 过度宽容**（零重叠 schema 也接受，官方自警） |
| **Event Sourcing 迁移实践** | 无注册中心；事件存储自描述（事件类型名 + v1/v2） | Greg Young：新版本必须能从旧版本转换，否则是**新事件**而非新版本 | **事件不可变**；upcasting + 投影时迁移 | 消费者对旧版本 upcast | 纠错=写新事实事件；无标准事件契约 | 改名/删字段必须新事件；长期版本债务 |

**选定与排除（本场景）：**

- **采纳其心智但不引入运行时**：Confluent（四操作 API 语义 + 兼容策略 + 审计事件形状）、Apicurio（版本状态机 ENABLED/DISABLED/DEPRECATED + 未来升级路径）、AWS Glue（未知 schema 的消费端行为 + skip/halt 双先例）、SchemaVer（MODEL/REVISION/ADDITION 评审语言）、Fowler（schema-on-read + Tolerant Reader + Parallel Change）。
- **排除**：Confluent/Glue/Apicurio 的 **HTTP 服务形态**（单写者无需注册仲裁，且引入第二个存储违反 SSOT 心智）；**SemVer**（SchemaVer 论证错位）；**NONE 常态化**（静默破坏）；**FULL 作默认**（一线卡死）；**Delta `autoMerge` 式过度宽容**（本场景要求 payload 严格按注册契约校验）。

### 3.5 基线决策回顾（D-001 ~ D-007 与本票契合度）

| 基线决策 | 与本票的关系 | 契合度 |
|---|---|---|
| D-001 五 scale 范围 | 5 scale 即本票的 5 个只读消费者 | 一致 |
| D-002 无 MVP 切片 | 本票不提供「先上最小 registry 后补兼容策略」的降级选项——四项交付一次闭环 | 一致 |
| D-003 边界（产品与用法） | 本票只在 spec 层定规则，不写实现代码、不引具体运行时 | 一致 |
| D-004 战略 quadrant S1-S5 | 无直接交集（D-004 是采集/判据层） | 无冲突 |
| D-005 集成架构 HoF-FA | **直接上游**：① 事件单向写入 → 本票 schema 不可改；④ hub 集中版本化 → 本票注册中心在 hub 侧 | 强一致 |
| D-006 报告模板共享骨架 | 本票的「schema 变更事件契约」与 D-006 的 read model 陈旧标记同族（供 A-009/A-014 复用） | 下游 |
| D-007 演示 10 路径 | failure path 需要「schema 不兼容被拒」的可演示语义 → 本票 4.4.2 的 `SchemaVersionRejected` 提供该印记 | 下游 |

### 3.6 反例失败模式（不重复的教训，供 A-009/A-012/A-013 复用）

1. **必填字段直接加进 schema 就上线** → 老消费者反序列化崩溃、lag 飙升（Florian billing 案例）。教训：新字段必须 optional + default。
2. **先从 schema 删字段再更新消费者** → 反序列化错误遍地（Florian「classic mistake」）。教训：删除顺序 = 生产者停发 → 等保留期 → 消费者更新 → 最后删 schema。
3. **FULL 当默认策略** → 团队数个 sprint 无法做实质变更，被迫版本化 topic。
4. **生产环境开着 auto-register** → 客户端悄悄注册不兼容 schema，绕过治理。
5. **NONE 常态化** → 静默破坏无人发现；官方定位为最后手段。
6. **Delta `autoMerge` 全局放开** → 官方自警「schema evolution is rather permissive」，downstream 悄悄坏。
7. **Iceberg rename「机械安全」当「语义安全」** → 元数据不重写数据文件，但 dbt 模型/Looker 仪表盘全断（「Iceberg protects data integrity, not query compatibility」）。
8. **纯 Parquet schema-on-read 无 enforcement** → Spark 取第一个文件的 schema，列错位、数据静默读错。
9. **事件溯源里改历史事件** → 破坏 as-of 审计、投影不可重放；正确做法是写纠错事实事件（Greg Young）。
10. **用 SemVer 语义承载 schema 版本** → major bump 不表达「读不读得了历史数据」（SchemaVer 论证）。
11. **版本号只升不检** → `schema_version` 字段可以撒谎；须配 `schema_digest` 校验防错标（由 Confluent「相同定义共享 ID」去重思想推得，中置信推断）。

---

## 4. 核心交付物

### 4.1 交付物 1 — Schema 注册中心位置与 API

#### 4.1.1 位置决议（三层职责切分）

```
┌─ 契约层（source of truth，git） ──────────────────────────────┐
│  docs/contracts/fact/fact.v1.yaml  (AsyncAPI 文档，info.version)  │
│  docs/contracts/fact/fact.v2.yaml                                │
│  ── PR 评审 + CI 兼容性机检（buf breaking 阶梯思想）             │
└──────────────────────────────────────────────────────────────┘
                    │ 注册（显式，hub 侧）
                    ▼
┌─ 运行时注册层（hub，与 fact table 同库 DuckDB） ────────────────┐
│  schema_registry 表（版本解析 + 引用完整性 + 审计）              │
│  fact.schema_version ──FK──▶ schema_registry.version            │
└──────────────────────────────────────────────────────────────┘
                    │ 只读快照
                    ▼
┌─ 消费层（5 scale read model） ────────────────────────────────┐
│  按版本区间声明 + 逐事件 schema_version 分派解析（schema-on-read）│
└──────────────────────────────────────────────────────────────┘
```

#### 4.1.2 为什么是混合式（三选一的排他理由）

| 候选 | 判定 | 理由（带证据） |
|---|---|---|
| **纯 HTTP 服务** | **拒绝** | HTTP 注册中心的核心价值 = 并发注册仲裁 + 兼容检查集中执行 + 变更审计事件（R1 结论 2.3）。本场景是 #07 已锁定的**单写者**（SWMR），注册仲裁恒等于无；兼容检查可前置到 CI；审计事件可写回 DuckDB 自身。引入独立服务 = 第二个存储 + 运维面，违反 SSOT 心智与 ADR-0005 ④「hub 不经过数据面」。 |
| **纯文件（git 契约）** | **拒绝作为唯一层** | 文件无法提供**引用完整性**——`fact.schema_version` 需要数据库级强约束（DuckDB FK 强制执行，R2 结论 1），否则可写入未注册版本号。文件层保留为契约 source of truth（Monte Carlo「契约即代码」+ buf CI 机检，R1 结论 2.2）。 |
| **纯库内（embedded）** | **拒绝作为唯一层** | 库内无法表达「契约评审 + CI 破坏性变更检测」的治理流程；且 AsyncAPI 契约文档本身需要 git 版本化（ADR-0005 ④「协议本体集中定义、版本化、code-as-policy」）。 |
| **混合（选定）** | **选定** | 契约层给治理与 CI 机检，运行时层给 FK 引用完整性与 SQL 直查审计，消费层给 schema-on-read。三层各取所长，且**不新增服务、不新增存储**。 |

#### 4.1.3 `schema_registry` DDL（spec 级 schema 定义，非实现代码）

```sql
CREATE TABLE schema_registry (
  version        SMALLINT   NOT NULL,  -- 从 1 起单调递增序号（位置索引，非 SemVer）
  contract_id    VARCHAR    NOT NULL,  -- 契约文档标识（如 fact.v1 / fact.v2）
  schema_digest  VARCHAR    NOT NULL,  -- 契约内容 SHA-256（内容寻址，防「版本号撒谎」）
  status         VARCHAR    NOT NULL,  -- active | deprecated | disabled（Apicurio 状态机）
  change_class   VARCHAR    NOT NULL,  -- ADDITION | REVISION | MODEL（SchemaVer 评审语言）
  compat_policy  VARCHAR    NOT NULL,  -- 注册时生效的兼容策略快照（如 BACKWARD_TRANSITIVE）
  registered_at  TIMESTAMP  NOT NULL,  -- 写者提交时刻（对齐 fact.recorded_at 语义）
  author         VARCHAR    NOT NULL,  -- 注册发起者（hub 侧显式）
  change_reason  VARCHAR    NOT NULL,  -- 变更理由（审计用，非空）
  superseded_by  SMALLINT,             -- 被哪个版本取代（deprecated 时必填）
  PRIMARY KEY (version),
  CHECK (status IN ('active', 'deprecated', 'disabled')),
  CHECK (change_class IN ('ADDITION', 'REVISION', 'MODEL')),
  CHECK (version >= 1),
  CHECK (status <> 'deprecated' OR superseded_by IS NOT NULL)
);
```

**建表顺序硬规则：** `schema_registry` 必须先于 `fact` 创建（FK 目标须先存在）。

#### 4.1.4 API 形状（照抄 Confluent 四操作语义，形态为内部函数 + 只读视图）

| 操作 | Confluent 端点（R1 证据） | 本票形态 | 语义 |
|---|---|---|---|
| register | `POST /subjects/{subject}/versions` → `{id, version}`；不兼容 409/422 | 内部函数 `register_schema(contract, digest, change_class, reason, author)` | 兼容机检 → 通过则 INSERT registry 行 + 发 `SchemaVersionRegistered`；不通过则发 `SchemaVersionRejected` 并拒绝 |
| get-by-id | `GET /schemas/ids/{id}` | 只读视图 `v_schema_by_version` | 按 version 取契约（digest + 文档引用） |
| list | `GET /subjects/{subject}/versions` → `[1,2,3,...]` | 只读视图 `v_schema_active` | 列举 active/deprecated/disabled 版本与状态 |
| check-compat | `POST /compatibility/subjects/{subject}/versions` → `{is_compatible}` | CI 机检脚本 `check-schema-compat.mjs`（不落库） | 破坏性变更预检，**前置到 PR/CI**，不进运行时 |
| config | `GET/PUT /config` → BACKWARD…NONE | `schema_registry.compat_policy` 列（注册时快照） | 兼容级别读；本场景固定 BACKWARD_TRANSITIVE（见 4.3.2） |

**为何不暴露 HTTP：** 单写者无仲裁需求；5 scale 只读消费用快照即可；HTTP 会引入「hub 经过数据面」的架构违规。**为何仍照抄 Confluent 语义：** 未来若变多写者/外部团队，可**无缝切换 Apicurio**（ccompat v7/v8 兼容，支持 AsyncAPI 3.1.0 + JSON Schema draft-04→2020-12），内部函数签名与 REST 语义一一对应，迁移成本接近零。

#### 4.1.5 与 fact table 的引用完整性（**本票对 #07 DDL 的唯一增量**）

**增量：** 把 #07 DDL 的

```sql
  schema_version SMALLINT   NOT NULL,  -- 事件契约版本；演进规则归 A-008
```

改为

```sql
  schema_version SMALLINT   NOT NULL REFERENCES schema_registry(version),
```

**为什么必须现在做（DDL 冻结前）：** DuckDB 官方明说 `ALTER TABLE ... ADD CONSTRAINT` "not currently supported for all constraints"（R2 结论 1），且 fact table 是 append-only + DDL 冻结（#07 §4.3.3），**冻结后无法补 FK**。

**边界声明：** 这是本票对 #07 DDL 的**唯一改动**，**不修改 07-report.md**（避免越界改他票产物），改由本报告 §5 + ledger A-008 记录增量，供 Phase 4 建表时采纳。若集成方因写入开销拒绝 FK，**降级方案**（保底但非首选）：注册表 + 写者进程内引用检查 + 机检对账 SQL（见 4.1.6）。

**不变式：** FK 要求「注册行先于事实行」——单写者在写 v+1 事件前先 INSERT registry 行，天然满足（与 4.3.5 步骤 1 同构）。

#### 4.1.6 机检对账 SQL（Evidence Gate 载体）

```sql
-- (a) 无悬空引用：任何 fact.schema_version 必须有 registry 行（FK 降级方案下的对账）
SELECT f.schema_version, COUNT(*) AS orphan_rows
FROM fact f LEFT JOIN schema_registry r ON f.schema_version = r.version
WHERE r.version IS NULL GROUP BY 1;

-- (b) 版本号撒谎检测：同一 version 的 digest 与契约文档当前 digest 必须一致
SELECT r.version, r.schema_digest AS registered_digest
FROM schema_registry r WHERE r.status = 'active'
ORDER BY r.version;

-- (c) 弃用窗口合规：deprecated 行必须给出 superseded_by，且窗口 >= 1 个发布周期
SELECT version, registered_at, superseded_by FROM schema_registry WHERE status = 'deprecated';
```

### 4.2 交付物 2 — 版本号语义

#### 4.2.1 决议：单调递增 SMALLINT 序号，不装 SemVer

- `schema_version` = **从 1 起、单调递增、不跳号**的 SMALLINT 序号（位置索引）。
- **不装 SemVer**：SemVer 的 MAJOR=「不兼容 API 变更」面向*代码依赖方*，而 schema 关心*历史数据能否被新 schema 读取*（Snowplow SchemaVer 论证，R1 结论 4）。用 SemVer 承载 schema 版本 = 反例 10。
- **不给序号附加语义**：兼容性由**注册时策略判定**并落 `change_class` 审计，避免「版本号撒谎」（反例 11）。

#### 4.2.2 主/次/补丁 → MODEL / REVISION / ADDITION 映射（专属验收「版本号必须明确语义」的直接回答）

| 三段位（用户问法） | SchemaVer 对应 | 对事件 schema 的含义 | 判据（可否读历史数据） | `change_class` 值 |
|---|---|---|---|---|
| **主版本** | **MODEL** | 破坏性：无法与任何历史数据交互 | 删字段 / 改字段名 / 改类型 / 改变 required 集合 | `MODEL` |
| **次版本** | **REVISION** | 可能阻断部分历史数据 | 放宽 `additionalProperties` 后加字段 / 改约束或枚举 | `REVISION` |
| **补丁** | **ADDITION** | 兼容所有历史数据 | 新增 optional 字段（`additionalProperties` 保持 false） | `ADDITION` |

**落地方式（关键）：** 这三段**不进入 `schema_version` 数字**（SMALLINT 装不下三段，也不需要），而是：

1. 写入 `schema_registry.change_class`（审计 + 评审语言）；
2. 破坏性变更体现在**契约文档名**：`fact.v1` → `fact.v2`（EventStack 实践：文档级版本 + 资源内嵌主版本，R1 结论 6）；
3. `schema_version` 序号只做**细粒度流水**（每次契约变更 +1）。

**规则：** 从 1 起，**无 0.x 不稳定期**（SchemaVer 规则，R1 结论 4）。

#### 4.2.3 三标识辨析（subject version / schema id / schema_digest）

| 标识 | 语义 | 本票落点 |
|---|---|---|
| **version（序号）** | 进化作用域内的**位置索引**（从 1 起递增） | `schema_registry.version` = `fact.schema_version` |
| **schema id（内容寻址）** | 全局唯一、按定义内容去重（相同定义共享同一 ID） | 本场景用 **`schema_digest`（SHA-256）** 承担内容寻址角色 |
| **contract_id（文档标识）** | 契约文档名（含主版本） | `schema_registry.contract_id`（`fact.v1`） |

结论：**序号是索引、digest 是内容标识**，两者都不是 SemVer（Confluent 官方双源，R1 结论 5）。

#### 4.2.4 起点、上限与约束（承接 #07 的列类型约束）

- **起点：** 1（首版契约）。
- **上限：** SMALLINT = −32768..32767（官方数值类型表）。**32767 个版本足够**（每天一版可用 89.8 年）。
- **列类型不可改：** #07 已定 `SMALLINT`，DDL 冻结后无法改类型 → 本票**接受该约束**，不改 #07。
- **「版本号撒谎」防护：** 必须配 `schema_digest` 校验（机检 SQL (b)），否则序号只升不检无法防错标（反例 11）。

### 4.3 交付物 3 — 消费者订阅机制

#### 4.3.1 正交性（先厘清两个概念）

**兼容策略 = 注册时的写侧闸门；订阅 = 消费时的读侧选择。二者正交**（Confluent 官方，R1 结论 6）。

#### 4.3.2 写侧兼容策略：`BACKWARD_TRANSITIVE`

| 候选 | 判定 | 理由 |
|---|---|---|
| **BACKWARD_TRANSITIVE** | **选定** | 保证「新消费者总能读**全部历史**事件」——5 scale 是只读拉取投影，随时可能新增 scale 或回放历史（#07 §4.3.2 的 rewind 语义），必须能读全历史。TRANSITIVE 变体在版本链 ≥3 时必需（官方建议，R1 结论 6）。 |
| BACKWARD（非 TRANSITIVE） | 拒绝 | 只对最新版本检查，版本链 ≥3 时旧版本兼容性失保。 |
| FORWARD | 拒绝 | 本场景无「不可升级的遗留消费者」；官方明示 FORWARD 需「预想所有未来变更」更难用（R1 结论 6）。 |
| FULL | 拒绝 | 只允许加/删 optional 字段，一线案例数个 sprint 卡死（R1 结论 7）。 |
| NONE | 拒绝 | 静默破坏无人发现（反例 5）。 |

**升级顺序（由 BACKWARD 决定）：先升消费者，再切生产者；可 rewind 到全历史。**

#### 4.3.3 读侧订阅：版本区间声明 + schema-on-read 分派

每个 scale 在 registry（或等价配置）声明**自支持的版本区间** `consumes_version_range`，拉投影时按每条事件的 `schema_version` 分派解析器：

```sql
-- 按版本区间拉取（复用 #07 的 version 水位语义）
SELECT * FROM fact
WHERE scale_id = :scale_id
  AND schema_version BETWEEN :min_supported AND :max_supported
  AND version > :last_seen_version          -- 增量续跑（#07 §4.3.2）
ORDER BY version;
```

- 工业命名：**schema-on-read**（Confluent event-streaming-patterns，R1 结论 8）。
- **按版本区间订阅 > 按策略订阅**：拉模式下读方自选版本比写侧策略更契合（R1 结论 8）。
- 写侧 BACKWARD_TRANSITIVE 保证「新消费者读旧事件」；读侧区间声明保证「消费者不越界读未来版本」。

#### 4.3.4 未知 `schema_version` 处理（Failure Semantics 显式三分）

| 策略 | 语义 | 数据风险 | 适用 |
|---|---|---|---|
| **跳过（默认）** | 忽略未知版本事件，仅**计数 + 告警** | 静默丢失（须配监控） | 全部普通 scale（AWS Glue 官方 "log the data and move on"） |
| **降级（本场景红利）** | 未知版本事件**先入库**（payload 为原始 JSON），契约发布后**补解析** | 无丢失，延迟处理 | 本场景独有优势：JSON payload 无需 schema 即可存储（对比 Avro/Protobuf 无法解码） |
| **阻断** | 反序列化失败即异常/DLQ | 无静默丢失但下游停机 | 关键消费者（合规/计费类），配置为阻断进 DLQ |

**必须写进报告的分歧点：** AWS Glue 官方对失败处理是**二选一放任**（skip 或 halt 均可，未规定默认）；Confluent 默认 BACKWARD 而非 FORWARD 且自认 FORWARD 更难用——**工业主流默认「消费者能读旧数据」，对 skip-unknown 持保留**。本场景取「跳过 + 计数 + 告警」为默认，**并把跳过与降级结合**（先照存，注册后补解析），阻断留给关键消费者。

#### 4.3.5 expand-contract 四步与不变式（DDL 冻结下的「纯内容契约」演进）

| 步骤 | 动作 | 不变式 | 回滚 |
|---|---|---|---|
| **0. 兼容性门禁** | 新契约 v+1 与全部历史版本做兼容机检（BACKWARD_TRANSITIVE；JSON = 只加可选字段，不删必填、不改类型） | v+1 必须通过机检，否则不可注册 | — |
| **1. Expand（注册）** | 在 `schema_registry` 插入 v+1 行（含 digest/change_class/reason）；fact 结构不动 | I1 注册是纯元数据操作，0 行事实受影响；I2 已写入事件 100% 仍为旧版本 | 删注册行即还原 |
| **2. 写入切换（migrate-1）** | 单写者开始产出 v+1 事件，v 事件停止 | I3 每条事件 `schema_version` 必可解析（注册先行，FK 保证）；I4 表内多版本共存，消费者可按版本过滤；I5 因 v+1 向后兼容，未升级消费者读 v+1 也能容忍（Tolerant Reader） | 写者 feature-flag 切回 v，0 数据变更 |
| **3. 消费迁移（migrate-2）** | 5 scale 按自身节奏升级到处理 v+1 | I6 消费者升级无全局协调要求（schema-on-read）；I7 任一时刻新旧消费者并存均可正确消费 | 消费者降级回 v 即还原 |
| **4. Contract（弃用）** | 弃用窗口（工业实践 1–2 周，≥1 发布周期）后把旧版本标记 `deprecated`/`disabled`；**历史行永不删除**（append-only） | I8 弃用只影响「新写」，不影响历史；I9 窗口内未升级消费者仍有解析路径 | 窗口内随时可逆；**窗口后唯一回滚 = 恢复备份** → 窗口期不得压缩 |

**本场景的独特红利：** 无数据库双写/回填问题（结构不变、内容契约变、事件不可变），因此「压缩阶段」最常见的两类事故（回填窗口漏写、切读 100% 流量无灰度）天然不存在。**但仍有的最大事故源 = 压缩弃用窗口**（Fowler + Liquibase 双源），必须执行完 contract，否则比不迁移更糟。

### 4.4 交付物 4 — Schema 变更触发的事件契约

#### 4.4.1 三事件（最小契约集）

| 事件 | 触发 | 关键载荷 | 工业对应物 |
|---|---|---|---|
| `SchemaVersionRegistered` | 兼容机检通过、registry 插入成功 | `version, contract_id, schema_digest, change_class, compat_policy, registered_at, author, change_reason` | Confluent `schema-registry.RegisterSchema`（成功 `{status:SUCCESS, data:{id}}`） |
| `SchemaVersionRejected` | 兼容机检失败 | `contract_id, attempted_digest, errorCode:409, errorMessage:"Incompatible schema", verbose messages[]` | Confluent `RegisterSchema` 失败（`{status:FAILURE, errorCode:409, errorMessage:"Incompatible schema"}`） |
| `SchemaVersionDeprecated` | 旧版本进入弃用窗口 | `version, superseded_by, deprecated_at, sunset_after` | Confluent `DeleteSchemaVersion` / Monte Carlo 弃用窗口（≥1 发布周期） |

#### 4.4.2 事件信封（CloudEvents 1.0，对齐 Confluent 先例）

```json
{
  "specversion": "1.0",
  "type": "io.macro-audit.schema.registered",
  "source": "hub://schema-registry",
  "subject": "fact.v2",
  "time": "2026-09-12T00:00:00Z",
  "id": "<uuid>",
  "datacontenttype": "application/json",
  "data": {
    "version": 2,
    "contract_id": "fact.v2",
    "schema_digest": "sha256:...",
    "change_class": "ADDITION",
    "compat_policy": "BACKWARD_TRANSITIVE",
    "author": "hub",
    "change_reason": "..."
  }
}
```

**写回位置：** 与 registry 同库的审计表 `schema_change_log`（append-only），供 5 scale 的 canary/告警消费。

#### 4.4.3 与 A-012 防线对接

- 三事件接入 A-012 的 **Contract + Lineage Canary Gate**（`lineage_gap_count` / `critical_unexpected_count` 等指标）——schema 变更属「契约变更」canary 的输入。
- `SchemaVersionRejected` 的计数进入 A-012 的 `critical_unexpected_count`；弃用窗口逾期未完成进 `warning → quarantined` 状态机。

#### 4.4.4 硬规则：关闭 auto-registration（对齐 ADR-0005 ④）

**注册只能由 hub 侧显式发起**，禁止客户端/消费者自动注册（Confluent 官方 security 建议，R1 结论 10）。理由：ADR-0005 ④「hub 集中版本化、scale 自运行时执行」——注册权是 hub 的元逻辑特权，下放即破坏治理。

---

## 5. 与其他票的关系与边界

| 票 | 关系 | 边界（谁定义什么） |
|---|---|---|
| **#07 A-007（DuckDB 写入策略）** | **直接上游**：预留 `schema_version SMALLINT` 槽位与 `payload JSON` 不可改约束；本票定义演进规则 | **本票对 #07 DDL 的唯一增量 = 为 `schema_version` 加 FK 到 `schema_registry(version)`**（4.1.5）。不修改 07-report.md；增量在 ledger A-008 与本报告登记。 |
| **#09 A-009（Read model 失效策略）** | 本票的读侧订阅（4.3.3）+ 变更事件（4.4）为其输入；#07 的 0.65s ≪ 5s SLA 余量仍有效 | 陈旧读 SLA 与触发条件由 A-009 定义；本票不锁 SLA |
| **#10 A-010（Cross-scale correlation key）** | 无交集（字段槽位各自独立） | `trace_id`/`baggage_id` 定义权归 A-010；本票只读它们作为分派过滤条件 |
| **#12 A-012（Data mesh 防线）** | 本票的变更事件接入其 Contract/Lineage Canary Gate | 防线清单与监控指标由 A-012 定义 |
| **#13 A-013（工具对齐）** | A-013 已判定「AsyncAPI 采用为事件契约/schema 版本治理规范，但**无官方 registry**，契约版本注册走 A-008 自研 schema_registry 版本表」——**本票即该结论的落地**；A-013 补充 3 的供应链硬约束（白名单 generator ≥3.3.0 / specs 6.11.1）由本票 §3.3-9/10 继承 | 工具选型矩阵由 A-013 定义；本票不重估 |
| **#14 A-014（共享骨架）** | 本票的 schema 变更事件可与报告模板的「契约版本」字段对齐 | 模板字段清单由 A-014 定义 |
| **#17/#18 A-017/A-018（演示路径）** | `SchemaVersionRejected` 提供 failure path 的「不兼容被拒」可演示印记 | 路径编排由 A-017/A-018 定义 |

---

## 6. 信息缺口（per Sufficiency Gate — 诚实标注 data does not show）

1. **DuckDB 核心无 JSON Schema draft 校验函数——`data does not show`**（R2 结论 2）：官方 1.5 JSON 标量函数清单无 draft 校验；社区扩展 `json_schema`（Query.farm）周下载 ~875 / 5 stars / 无活跃版本承诺，**实验性质**。→ 本票的应对是把 draft 校验放**写者进程内 + CI**，DuckDB 侧只留类型语法 + FK；**Phase 4 需实测社区扩展在生产负载下的稳定性后再决定是否纳入**。
2. **DuckDB CHECK 对 JSON Schema 语义零内建支持——`data does not show`**（R2 结论 3）：CHECK 无法表达 `$ref`/`allOf`/`oneOf`/`format`。
3. **无完全同构的公开先例**：本场景 = 单写者 + append-only DuckDB + payload JSON + 5 只读消费者，工业界无完全同构案例；4.3.5 的 expand-contract 不变式为**由 Fowler Parallel Change + Confluent 部署序 + 场景推理合成**（中-高置信），非直读先例。
4. **DuckDB FK 的写入开销未获定量基准**：R2 只确认 FK 强制执行与 ART 索引探测机制，**无公开的 per-row FK 开销曲线**——4.1.5 的 FK 采纳建议**未含量化代价**，Phase 4 建表时须实测（若开销不可接受则走 4.1.5 的降级方案 + 机检对账）。
5. **Microcks 对 AsyncAPI 3.1.0 的显式支持声明未找到——`data does not show`**（R2 结论 8）；且 2026-04 仍有 v3 导入 NPE 未修。
6. **Apicurio 版本口径冲突**：同一官方站点 3.3.x 文档列支持 `3.1.0`，Red Hat 3.1 build 文档只列到 `3.0.0`——**若锁定 3.1.x 发行版则只能到 3.0.0**（本票不悄悄二选一）。
7. **`@asyncapi/specs` 6.11.2 投毒事件的时间线细节**（4h20m 暴露窗口、C2 IP）来自官方 postmortem 与多厂商报告交叉，**但具体受害者数量未公开**。

---

## 7. 完成定义对照（逐项，per WORKFLOW §4.2.5）

### 7.1 专属验收 checklist（本票特有）

- [x] **注册中心位置必须确定（库？文件？HTTP 服务？）** — §4.1：**混合式**（git 契约层 + DuckDB 元数据表运行时层 + 消费层 schema-on-read），**明确不是 HTTP 服务**，附三选一排他理由表。
- [x] **版本号必须明确语义** — §4.2：**从 1 起单调递增 SMALLINT 序号，不装 SemVer**；主/次/补丁 → MODEL/REVISION/ADDITION 映射表 + 三标识辨析 + 上限与「撒谎」防护。
- [x] **1) Schema 注册中心位置与 API** — §4.1.3（`schema_registry` DDL）+ §4.1.4（四操作 API 形状表 + 只读视图）+ §4.1.5（FK 引用完整性）+ §4.1.6（机检对账 SQL）。
- [x] **2) 版本号语义（主/次/补丁含义）** — §4.2.2 映射表（三段位 → SchemaVer → 判据 → change_class）。
- [x] **3) 消费者订阅机制（订阅哪个版本、跨版本兼容策略）** — §4.3.2（写侧 BACKWARD_TRANSITIVE + 排他理由）+ §4.3.3（读侧版本区间 + schema-on-read SQL）+ §4.3.4（未知版本三策略）+ §4.3.5（expand-contract 四步与 I1–I9 不变式）。
- [x] **4) Schema 变更触发的事件契约** — §4.4.1（三事件表）+ §4.4.2（CloudEvents 信封）+ §4.4.3（A-012 对接）+ §4.4.4（关闭 auto-registration 硬规则）。

### 7.2 通用调研要求对照（per handoff「通用调研要求」段）

- [x] **atomcode 深度调研**（per §4.2.3）：两轮串行，三引擎交叉（R1 searches 16+ / reads 12+；R2 searches 15 / reads 15）；回顾了 baseline D-001~D-007（§3.5）、当前决策 spec.md §Decision 5.2（§2.3）、目标仓库现状（§2.6 上游 #07 DDL）。
- [x] **回顾 docs/adr/**：ADR-0005 全文直读，四子决策逐条承接（§2.4）。
- [x] **回顾 CONTEXT.md 心智模型**：7 个相关术语映射表（§2.5）。
- [x] **对标工业界成熟方案 ≥2**：实际 **7 个**（Confluent / Apicurio / AsyncAPI / JSON Schema $id / AWS Glue / Iceberg / Delta Lake / Event Sourcing），见 §3.4。

### 7.3 阻塞

- **Blocked by #07：已闭环**（§0 证据）。本票**一次闭环，不阻塞他票**。
- 本票产出供 **#09（A-009）/ #14（A-014）/ #18（A-018）** 复用。

### 7.4 lessons 候选（per WORKFLOW §4「教训持续追加 / 不可蒸发」）

1. **账本内部指认冲突必须用「多源一致」裁决，不悄悄二选一。** A-008 行「被 A-009 阻塞」与 A-009 行「被 A-008 阻塞」构成循环，而 issue/handoff/prompt/README 四处一致指向 `Blocked by: #07`。本票以四处一致为权威并显式记录该笔误（§2.3）——**教训：ledger 的「显式约束」列是自由文本，易与「阻塞」字段脱钩；派生阻塞关系应只由 issue 的 Blocked by 单一来源推导。**
2. **DDL 冻结前必须把跨票的约束一次性声明完。** `schema_version` 的 FK 若不在建表时声明，DuckDB 官方明说无法后补（`ALTER ADD CONSTRAINT` 仅部分支持）。**教训：凡「DDL 冻结」的票，其下游票必须在建表前完成 FK/CHECK 声明，否则降级为进程内校验 + 机检对账（可靠性下降一档）。**
3. **「provenance = 安全」是错的。** 2026-07-14 AsyncAPI 供应链攻击的投毒包携带**合法 OIDC provenance**（npm 官方亦明说 provenance 不保证无恶意代码）。**教训：provenance 是事后归因工具，事前防线是 exact-version + 版本白名单 + 冷却期（本案暴露窗口 4h20m，冷却期直接抵消）。**
4. **「单写者」使 HTTP 注册中心的核心价值归零。** 并发注册仲裁 + 兼容检查集中执行 + 变更审计事件——三项在单写者下分别退化为「无需」「可前置 CI」「可写回本库」。**教训：选架构前先问「这个组件的核心价值在本场景是否还存在」，不存在则用更轻的载体（本例：库内元数据表 + git 契约）。**
5. **版本号必须与内容校验绑定，否则会「撒谎」。** 只升不检的序号无法防错标；`schema_digest`（内容寻址）是必要配套（§4.1.6 机检 SQL (b)）。

### 7.5 引用文件列表（per WORKFLOW §4.2.5）

**仓库内（本票直接引用）：**

- `issues/08-schema-versioning.md`
- `handoffs/08-schema-versioning.md`
- `prompts/08-schema-versioning.md`
- `spec.md`（§Decision 5.2；§Coverage A-008 → Decision 5.2）
- `WORKFLOW.md`（§4.2 全部子节）
- `decision-ledger.md`（A-008 / A-009 / A-013 行）
- `README.md`（Wave 2 波次表，`08 | … | #07`）
- `reports/07-report.md`（§4.3.3 DDL / §5 边界）
- `CONTEXT.md`（7 术语）
- `docs/adr/0005-hub-of-facts-with-federated-adjudication.md`

**工业界来源（atomcode 两轮直读核验，节选关键）：**

- Confluent Schema Registry Concepts / Schema Evolution & Compatibility Types / API Reference / Secure Schema Registry / Management Auditable Events（docs.confluent.io）
- Confluent event-streaming-patterns：schema-on-read（raw.githubusercontent.com/confluentinc/event-streaming-patterns）
- Snowplow：Introducing SchemaVer（snowplow.io/blog）
- AsyncAPI Specification 3.1 / Release Notes 3.1.0 / 官方 postmortem（Miasma Supply Chain Attack）/ spec-json-schemas issue #656 / generator issue #2184（asyncapi.com, github.com/asyncapi）
- Apicurio Registry 3.3.x artifact reference / issue #7695（apicur.io, github.com/Apicurio）
- AWS Glue Schema Registry：How the schema registry works（docs.aws.amazon.com）
- DuckDB：constraints / create_table / json_type / json_functions / numeric data types / issue #13365（duckdb.org, github.com/duckdb）
- Martin Fowler：Tolerant Reader / Parallel Change（martinfowler.com）
- Apache Iceberg Spec / Delta Lake Schema Evolution / LakeOps Iceberg in Production
- Greg Young：Why Can't I Update an Event / Oskar Dudycz：Simple patterns for events schema versioning
- Monte Carlo：Data Contracts 101 / Florian Courouge：Schema Evolution in Production / buf breaking rules
- npm Docs：Generating provenance statements

---

## 8. 版本控制（per WORKFLOW §4.2.1）

- 分支：`but` 独立分支 `a008-schema-versioning`（本 Agent session 专用，不动他人分支）。
- 提交：`but commit -b a008-schema-versioning -m "docs(A-008): ..."`，commit message 以 `A-008` 标识（对齐 W1 lessons「commit 必须以 A-NNN 起头或引用」）。
- 收尾两步（per W1 lessons「启动器收尾硬要求」）：① `decision-ledger.md` A-008 状态写 `done` + 结论落盘；② `WORKFLOW.md` §4 追加 1 行 lessons。
- 全程禁用 git 写命令（`git add/commit/push/checkout/merge/rebase/stash/cherry-pick`）。

### 8.1 提交面处置说明（commit-surface disposition，镜像先例 0d0e3e5）

- **已提交到本票分支**：`reports/08-report.md`（本票独占新增文件）。
- **未提交到本票分支（有意为之）**：`decision-ledger.md` 与 `WORKFLOW.md` 的本票改动已在**工作区落盘**，但**不并入本票 commit**。原因：两文件的未提交 diff 各为**单个 hunk**，且该 hunk 混入了其他并行分支的在途改动——
  - `decision-ledger.md` 的表格状态单元格改动覆盖 A-001 / A-003 / A-004 / A-005 / A-006 / A-007 / A-010 ~ A-018（多票在途），与 A-008 同处 hunk `@@ -6,24 +6,24 @@`；
  - `WORKFLOW.md` 的 lessons 追加行含 #03 / #14 / #01（其他分支在途），与 #08 同处 hunk `@@ -273,3 +273,10 @@`。
  - `but` 无法按 hunk 拆分（官方 skill 明示），若整体提交会把**其他 agent 的工作并入本票分支**（违反「不 commit 他人工作」）。
- **处置**：遵循仓库先例 `0d0e3e5 docs(A-004): record commit-surface disposition note (sq:e blocked by ticket-05-unit-matrix uncommitted deps)`——记录本说明，把共享文件的本票改动留在工作区，由各自分支收尾或后续统一收口。
- **本票落盘已完成**（per §4.2.4 + W1 lessons 收尾两步）：① ledger A-008 行状态 = `done` + `## A-008 结论落盘` 块已写入；② WORKFLOW §4 lessons 已追加 3 行。两者均在工作区可验（`grep` 可见），仅未 commit。
- **解除条件**：其他分支的在途改动各自提交后，本票改动可随下一次共享文件收口一并提交（或在 `but` 支持更细粒度提交时单独提交）。
- **并发写入事件（2026-09-12 00:40）**：本票首次落盘 ledger 后，`decision-ledger.md` 被另一并行窗口以自持副本覆盖（字节 35335 → 33626），A-008 行状态与块一度丢失。本票已在**当前最新版**账本上重新落盘并复核。教训：共享 append-only 文件在「多窗口并行」下存在**后写覆盖**风险，落盘后应立即回读校验，不依赖「写过一次就安全」。
