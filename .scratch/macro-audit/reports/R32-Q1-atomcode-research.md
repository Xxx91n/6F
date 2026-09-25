# R32-Q1 atomcode 调研报告（2026-09-25 归档）

题面：constraint 吞错面过宽（F7g 实证升级）——吞错收窄至 fact_id UNIQUE / 明示容忍 / 并入后续票 三候选。
调研形式：atomcode -p（ctx_batch_execute 串行），仓内 current 记录+ADR+CONTEXT 已回顾，工业源 7 件（官方 4/批评 1/比较 1/社区 1），置信高。

## 1) 执行摘要

推荐 (a) 吞错收窄至仅 fact_id UNIQUE 撞键——四理由（见 §4），Confidence 高。

## 2) 分点结论

**① 现状定性：这不是「幂等跳过」，是二分吞错。** classifyWriteError（store.ts:340-343）用 IO_ERROR_RE 二分：命中 IO 词表→'io'，否则一律→'constraint'。file-card.ts:128 对所有 'constraint' 类静默 continue。而 audit.ts 主链同函数的正确用法是「io→AuditIoError(exit 4)；constraint→protocolCrashError(QUARANTINE-CONSTRAINT) 协议崩」（audit.ts:416-419）。**同一个分类器在两条链上承担两个语义**，file-card 链把 constraint 从「协议崩溃」重释义成「幂等跳过」——注释自述 fact_id 撞 UNIQUE=跳过非错误，但代码根本没有验证撞的是哪个约束。schema.ts 里 audit_fact 表约束远不止 fact_id UNIQUE：还有 fact_seq PK、schema_version FK+CHECK、trace_id/baggage_id 的 CHECK(regexp_matches(...))、各字段 NOT NULL——全部落入被吞的桶。Confidence 高（代码一手核验）。

**② DuckDB 语义事实**：约束违例抛 `Constraint Error: ...`（官方 ACID 博客原文：「Constraint Error: Duplicate key "id: 42" violates primary key constraint」），事务内错误默认中止事务；ACID/原子性由官方两源（transactions 文档＋ACID 博客）确认。收窄实现的精确抓手：匹配消息前缀 `Constraint Error` 且含 fact_id 约束名才判幂等跳过；DuckDB 错误消息不像 SQLite 那样内建五档冲突解决算法（sqlite.org/conflict.html：ROLLBACK/ABORT/FAIL/IGNORE/REPLACE），应用层必须自己分型——即「在 catch 里精确指认预期异常、其余 rethrow」的 Khorikov 模式。Confidence 高（官方一手双源）。

**③ 幂等写惯例：预期异常须「最低层捕获＋可指名」**。AWS Durable Execution 官方档原文：「When an idempotency-enabled API returns a duplicate-request error on retry, it usually means the first attempt already succeeded. Handle that error as success, not failure」——但前提是该错误是可识别的 duplicate-request 专用错误，且推荐用 INSERT ... ON CONFLICT DO NOTHING 让存储层幂等而非应用层宽吞。Khorikov：「only those you expect」——catch 块只转换指名约束的异常，其余 rethrow。更优实现路径：file-card 补采前已先读 preCard 判观测集存在性、batch 内已有 seen Set 去重，fact_id 撞键合法来源只有「预读与补采间隙的并发写」或「同批 cross-collector 重复」——前者频度极低，可在循环外先查一次已存在 fact_id 集（WHERE fact_id IN），或事务外预查后仅对预期撞键收窄 catch。Confidence 高（AWS 官方＋Khorikov 双源）。

**④ 吞错 vs fail-fast 判据（社区+批评）**：Wikipedia Error hiding 列吞错为 anti-pattern。可辩护边界判据（综合 SQLite IGNORE 语义、AWS、jlevy/tbd postmortem）：仅在 (i) 错误是设计预期且可逐字指认、(ii) 跳过后不变量仍由其他机制保证、(iii) 跳过可观测 时成立。现行实现三条全不满足：(i) 不可指认（吞整个非 IO 空间）、(iii) 零观测（连计数都没有）。注意 (ii)：恒等式断言 D-116① 只对账 quarantine_log 三桶，**不对 fact 主表的静默缺失对账**——残集无兜底。Confidence 高。

## 3) 对比矩阵（三候选处置）

| 项 | (a) 收窄至 fact_id UNIQUE | (b) 明示容忍+挂触发器 | (c) 并入后续票据 |
|---|---|---|---|
| 毒事实止血 | 立即 | 不止血（残观测集继续产生仅登记） | 不止血（拖延期累积） |
| 与 D-115① 一致性 | 恢复一致 | 持续冲突且须给 D-115 立 revised 才合法 | 冲突持续至票到 |
| 与吞错判据符合度 | 完全符合（预期+可指名+事务兜底） | 只满足可观测（登记≠消除账实分离） | 均不满足 |
| 实现成本 | 小：收窄 catch+吞错计数披露 | 中：known-gaps+registry+还须解释为何违反自家 ADR-0022 判据 | 零（但 #80 步③双仓实跑会踩中） |
| 审计合规面 | trail 完整性恢复 | 静默跳过=control failure（自家 ADR 原文） | 同 (b) |
| 残余风险 | DuckDB 消息字符串匹配依赖→守卫测试钉形态缓解（D-059① git-cli 输出契约先例）；或改存储层预查兜底 | 毒事实=每次 lazy 补采都可能埋 | 同 (b)+时间累积 |

## 4) 推荐与理由

**推荐 (a)，理由四条**：

1. 自述意图与实现的偏差是 bug 不是设计张力——注释明说吞的只是 fact_id 撞 UNIQUE，实现吞整个非 IO 空间；属「实现恢复其声明」非改向（D-099 声明↔实物一致性纪律的守卫对象本身）。
2. **D-115① 已裁决过这个问题**——轮 28 裁决=fail-fast+错误码分流，约束违例归协议崩溃（=schema bug 信号）。file-card 链是步②新增面实现时偏离既有裁决而非有意重裁——正确动作=实现回到裁决，不是给裁决立 revised。
3. fail-fast 在本产品有不可让渡的理由——审计产品核心资产=audit trail 完整性；ADR-0022 拒绝「写失败降级续跑」的判据（账实分离=control failure）直接覆盖本场景。(b)=把该判据在本链作废。
4. 实现路径清晰低风险：file-card.ts:127-128 条件改精确匹配（isFactIdUniqueViolation——消息含 Constraint Error 且含 fact_id/UNIQUE 指认；或更稳妥：循环前预查该观测集已存在 fact_id 集消除撞键场景）；吞错命中递增可披露计数（emitted 与 skipped 分开，对齐 D-122 披露纪律）；加守卫测试=非 IO 非指名错误上抛后 runInTransaction 必须回滚（毒事实回归测试）。

**(c) 否决理由**：#80 步③双仓实跑（jiahao+env-manager）正是 lazy 补采高频触发面，毒事实会在试点数据里继续累积并污染 golden 基线；修法=单函数条件收窄+一条测试，远小于票面流通成本。

**(b) 唯一适用场景**：若实测 DuckDB 约束错误消息在 Node API 层不带约束名无法可靠指认——也不是选 (b) 的理由，而是先修错误指认（升级到错误码/SQLSTATE 级判定），fail-fast 语义不动。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Constraint Conflict Resolution in SQLite（官方） | https://sqlite.org/conflict.html | Official | 约束违例五档处置语义全景；IGNORE=逐行跳过精确边界 |
| 2 | DuckDB Transaction Management（官方 1.4 LTS） | https://duckdb.org/docs/lts/sql/statements/transactions.html | Official | ACID/事务语句语义；snapshot isolation；abort 语义 |
| 3 | Changing Data with Confidence and ACID（DuckDB 官方博客） | https://duckdb.org/2024/09/25/changing-data-with-confidence-and-acid.html | Official | 约束违例错误消息形态原文——收窄实现匹配抓手 |
| 4 | Error hiding（Wikipedia） | https://en.wikipedia.org/wiki/Error_hiding | Criticism | 吞错=anti-pattern 定性框架 |
| 5 | How to handle unique constraint violations（Khorikov） | https://enterprisecraftsmanship.com/posts/handling-unique-constraint-violations/ | Comparative | 只 catch 预期异常+按约束名指认+其余 rethrow 权威模式 |
| 6 | Idempotency and retries（AWS Durable Execution 官方） | https://docs.aws.amazon.com/durable-execution/patterns/best-practices/idempotency/ | Official | 幂等写惯例；duplicate 错误按成功处理的前提=专用可识别错误 |
| 7 | Silent error swallowing postmortem（jlevy/tbd） | https://github.com/jlevy/tbd/blob/main/docs/project/specs/done/plan-2026-01-29-silent-error-swallowing-postmortem.md | Community | 「失败仅 log 而代码继续报成功」postmortem 同构实证 |

## 6) 信息缺口（仍不知道的）

1. **DuckDB Node API（@duckdb/node-api）约束违例是否携带结构化错误码/约束名**——落票前需一次实物验证（注入故意 NOT NULL 违例打印 error 对象全貌）；拿得到约束名则指认实现从字符串匹配升级为码级判定。
2. DuckDB 版本升级是否曾/将会改动 Constraint Error 消息措辞——缓解=守卫测试钉形态（git-cli 输出契约先例），风险已闭合到可接受。
3. **file-card 补采链的毒事实是否已在既有双仓试点数据中实际发生**——本轮只读模式未跑库；落地 (a) 前建议对现有 facts.duckdb 做一次 fact_id/fact_seq/NOT NULL 违例扫描留证（对齐 D-025 双读数纪律）。
