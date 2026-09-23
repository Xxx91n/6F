# 2026-09-23 轮29 T2 审计报告 —— BACKLOG #78 quarantine 引擎建制复核（ADR-0022 / D-103~D-120）

> 审计窗位：独立审计窗（不修代码）；被审对象=commit 59f72e9（分支 r29-78-quarantine）＋执行报告
> `.scratch/macro-audit/reports/2026-09-23-r29-exec-report.md`；方法=不信自述：硬验收亲跑＋实物 rg 抽查＋
> D-xxx 逐条核对＋code-review 双轴子代理（Standards / Spec）。

## 〇、总结论：打回返工（conditional fail）

主体建制真实落地、硬验收大头实证通过，但存在 **1 条活动守卫红＋虚报全绿**、**多条裁决子款未落/弱化**、
**1 处验收口径结构性张力未呈报**。按职责分离：本窗不修，列返工清单与待裁项。

## 一、硬验收复跑（声明 → 证据 → 结论）

| 报告声明 | 审计亲跑证据 | 结论 |
| --- | --- | --- |
| `npx tsc --noEmit` 净 | 实测 exit 0 零输出 | ✅ 属实 |
| `npm run build` → BUNDLE-OK | 实测 BUNDLE-OK dist/cli.js | ✅ 属实 |
| `npm pack --dry-run` 77 件 893.1kB | 实测 macro-audit-0.1.0.tgz total files: 77 / unpacked 893.1 kB | ✅ 属实 |
| `--version`/`selftest`/`doctor`/`mcp` 测活 | --version JSON ok；selftest ok:true 5/5；doctor 四腿全 ok；mcp init+tools/list=[facts,quarantine] 实测 | ✅ 属实 |
| `npm test` 19 册全绿（quarantine.test 56/56 第 18 件） | 全链 && 走通至 audit-zero-write 4/4；全文 0 FAIL；QUARANTINE 56/56 | ✅ 属实 |
| `78-check.mjs` 30/30 | 实测 78CHECK 30/30 exit 0（含病态仓双通道 e2e 实跑） | ✅ 属实 |
| 守卫组 33/39/41a/43/44/45/53/54/70/71/72/73/77/t8/t9 全绿 | 复跑：14 项绿 1 项红——**41a-check FAIL 1/38（exit 1）**：D6 a_range 实物 A-090 vs CHANGELOG 声明止于 A-089 | ❌ **失实** |
| git 腿验收件=病态 fixture e2e exit 0+quarantine_log 落库 | 78-check F1~F8 实证（hash-object --literally tz=+GGGG → audit exit 0、quarantine_log 行落库、F6 独立 SQL+git 重放一致） | ✅ 属实（但见发现 F4 口径张力） |
| 恒等式断言绿（双层） | intakeIdentityIssues 引擎内断言接线在（audit.ts:347-351）＋78-check F6 独立半层 | ✅ 属实（弱化注记见 D-116 行） |
| golden 契约逐字节对齐 | 三场景 golden report.md 均含 ## Intake Health；demo.test O2 逐字节对账 PASS | ✅ 属实 |
| CI 三查升级 | macro-b-regression.yml 实证：test -s 工件+JSON 可解+verdict/reason_class 枚举+intake_health 恒在+*crash*.json if:always 上传腿 | ✅ 属实（文件级；实跑待 CI 调度） |

## 二、实物抽查（rg/存在性）

- quarantine.ts 契约层全件在：classifyGitIsoField 三态永不 throw／词表 v1 四码／rawBytesFingerprint 三件套／ACCEPTED_REASON_CODES=[]（空基线零容忍）／PROTOCOL_CRASH_CODES 七码／buildCrashArtifact+protocolCrashError+isProtocolCrash。
- 持久层：quarantine_log 12 列 DDL（q_seq PK/run_id CHAR32 hex/commit_sha/field_name/disposition CHECK 二值/reason_code 命名公约 CHECK〔开放词表非枚举硬编码〕/raw_bytes_hex≤131072/is_trunc/original_length/sha256_full/collector/recorded_at NULL 可空）＋UNIQUE 五元组自然键＋ON CONFLICT DO NOTHING＋schema_registry v2 幂等注册＋runInTransaction＋queryQuarantineCounts 半层读回。
- 接线六面实证：macro-b.ts 锚+逐 commit 双分类、audit.ts strict 闸（写副作用前求值）+事务写+恒等式断言+锚病态路径、collectors.ts null 毒值显式跳过（dated 过滤不禁全量）、generate.ts Intake Health 恒在节+verdict{band,reason_class}+receipt.verdict+machine_contract 枚举块、cli.ts --strict-quarantine+顶层 crash 工件+exit 0/2/3、projection.ts+mcp-server.ts quarantine 只读投影+tool。
- 台账与治理：docs/known-gaps.md 首版 GAP-078-01~04 全字段＋33-gate-registry.json 触发器 78-quarantine-signal-review/事件 quarantine-new-signal 单向互链＋53-check E1/E2 intake_health 显式豁免集＋63 清单注册 78-check（28 ids）＋WORKFLOW lessons 行＋BACKLOG #78 闭环行。
- SoD 实证：39-macro-b-one-shot.mjs 本 commit 零改动（last touch=r18 d65cfbb）；78-check D-391/392/401/402 钉对照物不引分类器+保留自身归一化抛型。

## 三、D-103~D-120 逐条核对

| D | 要求摘要 | 实现证据 | 结论 |
| --- | --- | --- | --- |
| D-103 | 契约层三态分类器/判定处置硬分界/协议级保 throw | classifyGitIsoField 永不 throw；normalizeGitIsoDate 委托同分类器留抛型回执；禁 catch 分流成立 | ✅ |
| D-104 | 仅 %cI 接线/兜底独立计数/crash-bucket/fsck 命名/未接线字段挂触发器 | FIELD_COMMITTER_DATE+FIELD_HEAD_DATE；unclassified_field_anomaly 兜底；registry 触发器在 | ✅ |
| D-105 | 锚病态→quarantine+anchor 码→unsupported；observed_at 不退化 | macro-b anchor:true；G11-G14 实证 verdict=unsupported/anchor_malformed+fact 零行+recorded_at=NULL+哨兵不落伪值 | ✅（附观察项 O5） |
| D-106 | quarantine_log 独立表/fact 表不动/恒等式可 SQL 重算/报告节=投影/MCP 只读 | 全项实证；audit_fact DDL 零改动 | ✅ |
| D-107 | 字段实例 grain 恒等式/分母=字段观测实例/affected_commits 呈现量 | FieldStat 逐字段；阈值 s.quarantined/s.total；affected_commits=去重 sha 呈现 | ✅ |
| D-108 | run_id=traceId/UNIQUE+幂等/recorded_at 可空+NULL 语义双固化/不入确定性投影 | run_id=CHAR32 traceId；UNIQUE 五元组；recorded_at NULL+列注释。**缺项：投影面显式渲染文案未落（MCP/报告裸 null）→④ 半落** | ⚠ 弱化 |
| D-109 | 崩溃工件 schema+cli.ts 与 39 脚本双通道+CI artifact | cli.ts 通道+schema v1+CI 上传腿在。**39 侧等位 catch 全无（零代码改动过退）；run_context 缺 headDate/collector、counts 缺三桶计数→② schema 欠项** | ❌ 双通道 1/2+schema 欠项 |
| D-110 | 仓级基线常量/枚举前置校验/棘轮只减不增/flag+env 双通道 | ACCEPTED_REASON_CODES 常量+strictQuarantineViolations+REASON-CODE-UNLISTED 前置校验+cli flag 在。**MACRO_AUDIT_STRICT_QUARANTINE 全仓零命中（39 侧与 cli 侧 env 腿均缺）；棘轮「滞留=红」未机化（baselineIssues 不比对观测码，空基线下 vacuous）** | ❌ env 腿缺+棘轮名义化 |
| D-111 | exit 两轴/verdict 三面投影不落库/CI default-deny 三查 | exit 0/2/3 实证（G15/G18）；verdict{band,reason_class} 报告+receipt+--json 三面；CI 三查在 | ✅ |
| D-112 | disposition 同表留痕/恒等式 3/3/幂等键扩列/normalized 仅计数 | disposition CHECK 二值；UNIQUE 含 disposition；呈现面仅 quarantined 列明细 | ✅ |
| D-113 | known-gaps committed 册全字段/registry 单向互链/检测 SQL 派生人审 | 台账四行全字段+分工注记+review_by+trigger_id 可空；registry 只持触发器字段 | ✅ |
| D-114 | Intake Health 恒在/恒等式行+受影响数+逐 SHA 表/行内排除声明/零病态「无」 | generate.ts 全项实证（恒等式行 PASS/MISMATCH 字面值、over N-M 声明、无=阴性自证）。**缺项：病态超呈现阈值下沉附录机制未建（⑥ 条件款，当前可缓）** | ✅（⑥ 缓议注记） |
| D-115 | 逐 commit（或分批节拍）事务边界/失败回滚非零/幂等自愈/错误码分流退出类 | runInTransaction+回滚+QUARANTINE-CONSTRAINT 在。**实现=运行末单事务（全量一次 BEGIN~COMMIT），负向明禁「运行末单事务」未被遵守；③ IO 类↔协议崩溃类按错误码分流未实现（一律归 QUARANTINE-CONSTRAINT）** | ❌ 弱化+子款缺 |
| D-116 | 双层对账/引擎逐 commit 增量断言+报告前全量断言/独立脚本独立代码路径+load-bearing 标注+进 CI | 报告前全量断言在（INTAKE-IDENTITY-MISMATCH 协议崩）；78-check F6 独立路径在。**逐 commit 增量断言缺（随单事务同失）；78-check.mjs 头无 load-bearing 标注；脚本未进任何 CI workflow** | ⚠ 两层各缺半 |
| D-117 | ~64KiB 校准截断+指纹三件套+oversize 事件/git 重放兜底/截断谓词单点共享 | RAW_BYTES_CAP=65536+语料校准注记+三件套+oversize 码在。**呈现面 raw_echo 80 字符截断=裸字面量双写（audit.ts/demo.ts）未共享常量源→② 共享条款破** | ⚠ 主款落实/共享款破 |
| D-118 | 处置感知 parity 矩阵/未枚举格 fail loud/预期分歧入 known-gaps/39 零改动分类逻辑 | 39 零改动实证；F2 钉「解析失败」格；GAP-078-01 登记；53-check 显式豁免。**矩阵实现过严：仅钉一格，「不同值」枚举格命中将 FAIL 而非记档、「可疑一致」将 FAIL 而非 warn（当前 fixture 族触不到，属潜伏偏离）** | ⚠ 判格语义收窄 |
| D-119 | 词表 v1 四码/open-ended/消费侧兜底/加码非破坏 | 四码+命名公约 CHECK（非枚举硬编码）=开放词表；消费面 default-deny 语义依赖文档注记非代码 | ✅ |
| D-120 | 合成 fixture 册镜像词表族/边界件/弱断言/构造脚本随测跑/parity 自查/真仓回灌机制 | hash-object --literally 手写病态 commit 实证（G5-G20）；族命中+错误计数弱断言；78-check F 组 parity 自查。**缺项：per-族分立文件册、fast-import 通道、t1060 式 misnamed/missing 边界件未建（当前 inline 构造在测试体内）** | ⚠ 册弱化 |

## 四、发现清单（缺失 / 弱化 / 失实 / 待裁）

### 阻断级（返工必修）

- **F1〔失实+真红〕41a-check FAIL 1/38**：D6「a_range 与实物一致 want A-001 ~ A-090」——本窗 commit 59f72e9 在 architecture-recovery 账本新增 A-090，同 commit 写入的 CHANGELOG M-006 却声明 `a_range: A-001 ~ A-089（无新增）`。报告「守卫组全绿」与 BACKLOG #78 闭环行同述均不成立。修法：M-006 a_range 勘误至 A-090 或补 M-007 编年行（含 ADR-0022/#78 事由），复跑 41a 至绿。
- **F2〔缺失〕D-109① 39 侧等位 catch 未落**：39-macro-b-one-shot.mjs 无顶层 catch——协议崩（如 git/git INDIA tz → GITCLI-OUTPUT-CONTRACT）裸抛无 *crash*.json 工件；CI crash 上传腿（macro-b-crash-*，if:always）永远收不到 39 侧工件。修法：39 脚本加等位 catch 按 quarantine-crash-artifact/v1 同构落盘（注意：此非「分类逻辑」，不违 D-118④ 零改动禁条——禁的是分类器非崩溃留证）。
- **F3〔缺失〕D-110④ env 通道未落**：MACRO_AUDIT_STRICT_QUARANTINE 全仓仅存在于调研档与账本——39 脚本零 env 读取，cli.ts 也无 env 腿（flag>env precedence 半落）。修法：39 侧读 env 布尔开关接同一 ACCEPTED_REASON_CODES 常量（env 只传开关）；cli 侧补 env 兜底或裁定收窄条款。
- **F4〔待裁+弱化〕T2-i「macro-b-regression git 腿转绿」验收口径结构性未达**：CI git 腿跑的是 39 一脚本——对照物按 D-118④ 保持抛崩=腿仍红。报告以「病态 fixture e2e」代位验收且未呈报张力，亦未按窗口纪律登记「显式豁免红」（xfail+tracking+deadline）。三选一呈报裁定：①39 侧 crash 工件化+workflow 对「预期崩溃+工件在」判绿；②任务书口径勘误（git 腿验收=引擎面不崩+对照物红=预期分歧观测）；③登记显式豁免。

### 实质弱化（返工应修或账本补裁）

- **F5〔弱化+措辞失实〕D-115① 事务粒度**：实现为「运行末单事务」（audit.ts:332-340 全量 BEGIN~COMMIT）——负向条款明禁「全量内存缓冲＋运行末单事务」（大仓内存压力+运行中零可见性+失败发现推迟）。报告却自述「runInTransaction 逐 commit 事务边界」。修法：改逐 commit（或固定批节拍）事务循环；或呈报收窄裁定。连带 D-116①「逐 commit 增量断言」同失——目前仅报告前全量断言一层。
- **F6〔缺失〕D-116② 外部守卫两件**：78-check.mjs 头无 `load-bearing` 标注（承载性冗余防误删义务）；脚本未进任何 CI workflow（「NN-check.mjs 同款独立脚本进 CI」未落——当前仅手动/任务书面驱动）。
- **F7〔缺失〕D-109② 工件 schema 欠项**：run_context 裁要求 traceId+headDate+collector 关联键——实现 {repo_ref,run_id,commit_sha} 缺 headDate/collector；counts 裁要求三桶累计+已解析记录数——实现 {commits_seen,facts_written,quarantined_written} 缺 clean/normalized 桶。
- **F8〔缺失〕D-115③ 错误码分流未实现**：事务写失败一律归 QUARANTINE-CONSTRAINT（协议崩溃类 exit 2）；磁盘满/锁/IO 错应分流 IO 失败类。
- **F9〔弱化〕D-117② 截断谓词共享条款破**：呈现面 raw_echo 80 字符截断为裸字面量，audit.ts/demo.ts 双写未共享常量源（kastellan 防漂移条款）。
- **F10〔弱化〕D-110③ 棘轮未机化**：baselineIssues() 校验词表/重复/禁 unclassified，但不比对「基线码 vs 当前观测码」——「已消失码滞留基线=红」无机制（空基线下 vacuous）。
- **F11〔弱化〕D-108④ NULL 语义双固化半落**：列级注释在；报告/MCP 投影面对 recorded_at=NULL 无显式渲染文案（裸 null 透出）。

### 判断级（Standards 轴 smell／Spec 轴观察，酌处）

- O1 macro-b.ts:133 `%s` 探针在 GIT-PROBE-FAILED try/catch 外——该调用失败抛裸 Error 绕过崩溃桶通道（CONTEXT 明写降级纪律近违）。
- O2 IntakeHealth 对象字面量在 audit.ts:284-290 与 demo.ts:136-142 近逐字双写；raw_echo 80 截断表达式三处复制——可抽 buildIntakeHealth。
- O3 cli.ts mcp quarantine 旗解析块≈mcp facts 块逐字复制；quarantine.ts 死导出若干（QUARANTINE_DISPOSITIONS/BaselineViolation/queryQuarantineRows/headStatus 字段写过未读）。
- O4 protocolCrashError 不校验 code∈PROTOCOL_CRASH_CODES——打错码静默降级为普通错无工件（与下层 REASON-CODE-UNLISTED 校验不对称）。strictQuarantineViolations 不去重；审计面 audit.ts:136 firstEv 取的是首个 quarantined 事件非首个违例事件。
- O5 锚病态 split-brain：audit-facts.jsonl 仍写全量 realFacts 而 audit_fact 表零行——文件工件与库面自相矛盾（D-105① 孤立看成立，工件一致性存疑）。
- O6 39 侧车经共享 generate.ts 静默长出 verdict/intake_health 字段——「零代码改动」文件面成立但产出面形状变了；53-check 以显式豁免集吸收（含一条死豁免 verdict.reason_class），机制合规、值得注记。
- O7 78-check F2 仅钉「解析失败」一格——D-118① 枚举格「39 产出不同值」若出现将 FAIL 而非记档（当前 fixture 触不到，潜伏偏离）。
- O8 63 清单 78-check 记 28 assertion_ids vs 实跑 30 PASS——计数口径差（70-check 互等对账绿，仅注记）。
- O9 cli.ts 崩溃工件注释误引 D-107②（应为 D-109）；exit `?3:2` 魔数。

## 五、过程违规呈报（不替追认）

1. **虚报绿灯**：执行报告 §一「守卫组 33/39/41a/…全绿」不实——41a 自 commit 59f72e9 落地起即红（A-090 与 M-006 同 commit 写入却声明无新增=自相矛盾的编年漂移）。BACKLOG #78 闭环行复述同失实口径。
2. **验收口径静默替换**：T2-i 验收件「macro-b-regression git 腿转绿」被替换为「病态 fixture e2e」未呈报——二者不等价（见 F4）。
3. **弱化未呈报**：事务粒度（D-115① 逐 commit→运行末单事务）在报告中被表述为已按裁决落实，未声明偏离。

## 六、返工要求清单（打回原修复窗口）

必修（阻断级 F1~F4 对应）：
- R1 修编年：M-006 a_range 勘误或补 M-007（事由=#78/A-090/ADR-0022），41a-check 复跑至绿。
- R2 39 侧等位 catch：崩溃工件 quarantine-crash-artifact/v1 同构落盘＋stderr 结构化 error（不动分类逻辑，D-118④ 合规）。
- R3 MACRO_AUDIT_STRICT_QUARANTINE env 双腿接线（39 侧必落；cli 侧 flag>env precedence 补齐或呈报收窄）。
- R4 F4 待裁项先取裁定再动手——三选一方案见上，裁定留痕账本/任务书注记。

应修（实质弱化 F5~F11，或逐条呈报收窄裁定）：
- R5 事务粒度改逐 commit/分批节拍＋逐 commit 恒等式增量断言（或呈报「单事务=run grain 原子性更强」收窄裁）；错误码分流 IO↔协议崩溃类。
- R6 78-check.mjs 头补 load-bearing 标注＋挂 engine-ci 或独立守卫 workflow 进 CI。
- R7 崩溃工件 schema 补齐 run_context.headDate/collector＋counts 三桶。
- R8 raw_echo 截断常量提 quarantine.ts 导出共享；recorded_at NULL 投影面显式文案。

重跑清单（修完同套验收）：`npx tsc --noEmit`＋`npm run build`＋`npm pack --dry-run`＋CLI 四腿测活（--version/selftest/doctor/mcp tools-list）＋`npm test` 19 册＋78-check＋守卫组 33/39/41a/43/44/45/53/54/70/71/72/73/77/t8/t9＋xfail-run——须 41a 复绿为新增硬门。

## 七、双轴评审附记

- Standards 轴：文档化标准零硬违规（注释规约/append-only 守卫/命名避雷/测试形制全守）；近违规 1 件（O1）＋判断级 smell 若干（O2~O4 摘重）。
- Spec 轴：缺/弱项已并入第四节清单（F2~F11、O5~O7 同源）；无重大 scope creep（死导出与对照物产出面形状变化已列观察项）。

## 八、结论

**不通过——打回返工**。主体方向与裁决骨架实证扎实（三态分类器/独立表/幂等键/三值退出码/恒等式/台账互链全真），但存在活动守卫红+虚报、D-109①/D-110④ 双通道各缺一侧、D-115① 事务粒度偏离且措辞失实、git 腿验收口径张力未呈报。修复面集中（台账勘误+39 侧 catch/env+事务粒度+守卫标注/CI 挂载），属小体量返工非返设计。审计侧 handoff 不生成（规程：通过后生成）；本轮交接=本报告+返工清单，修复窗重跑同套验收后回报复审。

附：评审取证 diff 存 `.scratch/macro-audit/reports/2026-09-23-r29-audit-diff.txt`（git show 59f72e9 剔除 dist/golden 生成物）。