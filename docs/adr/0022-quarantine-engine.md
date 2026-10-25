# ADR-0022: Quarantine 引擎——上游病态输入的两级处置建制

- Status: accepted
- Date: 2026-09-23
- Deciders: 用户（grill 轮 28 Q1~Q18，逐问 atomcode 深调研后拍板「采纳」×18）
- Ledger: D-103~D-120（全 current）；承 D-100（两级处置立案）／D-059①（revised：仅协议级保留「不符即拒」）／D-101（B 窗独立验证）／ADR-0014（raw 不出适配层）／ADR-0020（上游数据面）

## Context

审计产品的上游是真实 git 历史，病态实例必然存在（git/git 的「 INDIA」badDate 为观测先例）。D-059①「归一化后不符即拒」在字段级病态上过强——一个病态 commit 否决百万行审计不可接受。须建制：哪些违约 fail-fast、哪些隔离续审、证据如何留痕、裁定如何对外表达、缺口如何回流立法。本 ADR 总成轮 28 十八裁。

## Decision

**判定层（契约层，确定性无 I/O）**
- 两级违约：协议级（记录定界/行形状坏）→fail-fast；字段级（单值语义非法）→quarantine（D-100/D-103）；
- 分类器返回 {status:clean|normalized|quarantined, value, reason_code, raw}，永不 throw；处置归消费面/报告层（判定/处置硬分界）；
- 覆盖面=观测驱动立法：本轮仅 %cI 接线；无法归类→unclassified_field_anomaly 兜底独立计数（不硬崩）；新字段判据挂可观测谓词触发器（D-104）。

**存储层**
- quarantine_log=逐字段处置事件表（SSOT 外独立表）：commit_sha/field/raw_bytes/reason_code/collector/run_id/recorded_at/disposition（quarantined|normalized）；正常 fact 照常进主表（D-106/D-112）；
- 恒等式逐字段实例 grain：total=clean+normalized+quarantined，三桶全库内可重算（D-107/D-112）；
- run_id=traceId（内容哈希，锚病态哈希 raw bytes），自然键 UNIQUE+INSERT OR IGNORE 幂等；recorded_at=确定性观测时点可空（NULL=时点不可得，投影显式渲染）（D-108）；
- raw_bytes 有界截断（~64KiB，corpus 直方图校准）＋指纹三件套（is_truncated/original_length/sha256_full）；超界本身=oversize quarantine 事件；完整现场由 commit_sha 指向的 git 对象重放兜底（D-117）。

**运行面**
- 事务边界=逐 commit（fact+quarantine 同事务）；任一 INSERT 失败→整批回滚＋非零退出（IO 类；约束违例按 schema bug 归协议崩溃类）；幂等重跑自愈（D-115）；
- 协议级崩溃=结构化 JSON 工件（error_code/raw_bytes_hex/crash_location/run_context/counts），cli.ts 与 39 脚本双通道同构落盘，CI 收 artifact（D-109）；
- 恒等式双层对账：引擎内逐 commit 断言＋报告前全量断言（违例=协议崩溃类非零，无 warn 降级）；外部独立 check 脚本（独立代码路径，load-bearing 标注）（D-116）。

**门禁与裁定面**
- --strict-quarantine：仓级版本化 accepted_reason_codes 基线，∉基线→硬崩；棘轮只减不增；unclassified 永不可入；语义=msg-id 级门禁（D-110）；
- verdict 机读三态（supported/unsupported/insufficient）＋reason_class 受控词表，三面同源投影（报告机读块/receipt/--json），不落库（纯推导量）；exit code 两轴：0=管线完成（含 unsupported/insufficient），非零=协议崩溃/IO/strict 崩；CI 消费面 default-deny 三查（exit==0∧JSON 可解析∧verdict 枚举合法）（D-111）；
- 锚字段（headDate）病态→quarantine+anchor_head_date_malformed→基数 1 病态率 100%→unsupported；observed_at 永不退化为 ingested_at（D-105）。

**治理与呈现面**
- known-gaps 台账=产品面 committed 册（gap_id/reason 族/首见证据链/status/owner 到人/review_by/trigger_id 可空）；检测=quarantine_log 派生信号，裁决须人审；立法触发器住治理册 registry，单向互链不互写（D-113）；
- reason_code 词表 open-ended：v1 种子=anchor_head_date_malformed/normalized_tz_offset/unclassified_field_anomaly/oversize 四族（全有立法出处）；加码非破坏、删改破坏；消费面未识别码→unclassified 路径（D-119）；
- 报告 Intake Health 节恒在渲染：恒等式行＋受影响 commit 数＋quarantined-only 逐 SHA 表；统计行内联「over N-M commits」排除声明；零病态渲染「无」=阴性自证；normalized 仅计数不列明细（D-114）；
- 39/40 对照物 parity 升级为处置感知矩阵：quarantined×39 结果判分歧类别（预期分歧记档/可疑一致 warn/未枚举 fail loud），预期分歧入 known-gaps（D-118）；
- 测试覆盖双层：合成病态 fixture 册（hash-object --literally/fast-import，镜像词表族，html5lib 式弱断言，parity 矩阵构造自查）＋真仓腿演化回灌（合成件=正对照非真判据；合成件≠观测实例不构成立法依据）（D-120）。

## Considered Options

- quarantine 事件写 audit_fact 行/报告双写——拒（D-106）：grain 混表+投影面写 SSOT；
- 协议崩溃也进 quarantine_log——拒（D-109）：垂死路径不依赖 DB 写＋逐运行事件 grain 不混入逐字段表；
- unsupported→专用非零 exit code——拒（D-111）：裁定混进执行语义（trivy/gitleaks 过载事故先例）；
- normalized 不落库——拒（D-112）：恒等式该项永不可重算=空头支票＋改写无 provenance；
- quarantine 写失败降级续跑+degraded 报告——拒（D-115）：账实分离=不完整 audit trail=control failure；
- raw_bytes 全量无界——拒（D-117）：DuckDB 向量扫描 2048×blob_size 峰值内存=对抗性 DoS 链；
- 39 端复制分类器/parity 排除病态实例——拒（D-118）：双生 bug＋对照物在价值最大处失明；
- 词表预登记 fsck 全族/外置配置——拒（D-119）：未验码=占位谎言/配置漂移失控。

## Consequences

- 实现票=#78（B 窗独立验证，macro-b-regression git 腿红修=验收件）；D-118 parity 升级可拆独立小票；
- 新产物面：quarantine_log 表、known-gaps 台账文件、崩溃工件目录、合成 fixture 册、strict 基线常量、Intake Health 报告节、双层对账守卫脚本；
- 开放残余（impl 级随票收口）：比例阈值默认值／MCP 查询 API 形态／DDL 列序+schema_version／null 消费映射表／collector 枚举／截断阈值 corpus 校准；
- 边界登记：锚字段基数 1 的 unsupported 收敛=巧合非同构（D-105④）；词表开放语义靠消费侧默认分支非冻结（D-119）；台账可降级纯派生视图的条件=立法周转缩零（D-113⑤）。
