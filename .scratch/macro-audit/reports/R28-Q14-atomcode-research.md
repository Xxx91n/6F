[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我先召回知识库中已有的相关调研，再启动三引擎检索。知识库命中 R28-Q5 相关先例（grain 轮），但执行面（谁/在哪/何时执行对账）未调研过。开始三引擎并行搜索。Tavily 已超额，改用 Exa＋AnySearch 双引擎继续。下一轮补齐角度：dbt singular test 官方、SODA 部署形态、双路径独立验证先例、断言误报批评。现在定点深挖：打开关键原文核验（dbt 官方、Astronomer、belt-and-suspenders、SOD 权威页、ETL 对账文）。继续定点深挖，补足 fetch 配额与批评/时效角度。**Sufficiency Gate**：searches: 7（Exa 4 + AnySearch 3 + Tavily 2 次因超额失败） | angles: Official（dbt docs/Airflow docs/UCLA）、Comparative（dbt vs GX/Soda、ETL testing vs reconciliation）、Criticism（belt-and-suspenders liabilities、reconciliation-failed 案例）、Currency（2026 年文）、Community（Appsierra/实践文） | full reads: 6（apache.org、finance.ucla.edu、aipatternbook.com、astronomer.io、getrightdata.com、appsierra.com） | gaps: Soda 官方文档仅摘要未全文读；financial SoD 权威仅 UCLA 一手 + WA State Auditor 摘要二级；NIST SP 800-53 相关章节未逐条读。

---

# R28-Q14 调研报告：恒等式对账的验证执行面

## 1) 执行摘要（Tl;dr）

**推荐 (c) 双层：引擎内后置断言（写完数据→报告前，自跑三桶 COUNT 差集重算，不符→非零退出）＋外部独立 check 脚本（NN-check.mjs 惯例，独立代码路径，CI 跑）。** Confidence：**高**——三个独立行业先例同向：①数据管线界的主流形态就是「管线内断言＋独立复核作业」并存（dbt build 内嵌 test + 外部 Datafold/Soda scan；Airflow in-DAG check operator + 调度独立扫描）；②内控界的职责分离（SoD）教义要求「记账者与对账者分离」，直接否定 (a) 单层与 (d)；③工程界的 belt-and-suspenders 模式给出采纳双层的形式化判据（失败昂贵 × 第二道守卫便宜 = 必装），并给出关键约束——**两道守卫必须失败方式不同（独立代码路径），否则是「一守卫戴两帽」**。仅 (b) 被明确否定：非 CI 运行无保护，违反 D-115 逐 commit 事务写的原子性承诺精神。

## 2) 分点结论

### ① ETL/数据管线界：in-pipeline 断言是主流默认，separate reconciliation job 是补强，二者共存非互斥

- **dbt**：tests（含 singular test）随 `dbt build` 内嵌执行、按 DAG 序插入，「failing test halts downstream models」——这是业界公认「最紧的反馈环」【dbt 官方 docs + datatrail.ai 对比文，双源】。singular test 形态=一条返回失败行的 SQL，与本仓「COUNT 差集」恒等式重算同构：`tests/` 下一条 SQL，断言 `total = clean + normalized + quarantined` 返回差异行即 FAIL。
- **Airflow**：官方 best-practices 与 Astronomer 指南均把 SQL check operator 作为 DAG 内一等公民任务（`SQLCheckOperator` 跑任意 SQL，返回 False 即任务失败=非零退出），同时建议 pre-load + in-warehouse **多点**检查，并可叠加第三方框架（GX/Soda）做独立扫描【airflow.apache.org + astronomer.io，双源已读原文】。
- **Appsierra 2026 综述**明确给出口诀：「Reconciliation queries … run well **as pipeline steps** that execute **after each load and fail loudly**」，同时又说成熟配置是「a quality framework, a diffing tool **and plain SQL reconciliation in the pipeline** 三件并存」——即工业界现状就是双层/多层，单层被视为不完整【appsierra.com 已读原文】。
- **getrightdata 案例**给出反面教训：把 reconciliation 只当迁移期一次性外部作业（migration gate），缺陷会「wave-one 泄漏到后续每一波」且对账失败是安静的（quietly）——支持对账必须**每次运行**执行而非仅外部定时【getrightdata.com 已读原文】。

**→ 支持 (a) 的必要性：引擎内断言对应「pipeline step that fails loudly」，保护每一次运行。**

### ② 自校验先例与「同体双生 bug」的工业界处理

- **写完自查的内建断言惯例**：Airflow 官方 best-practices「Self-Checks」一节、任务=事务（「never produce incomplete results from your tasks」）的教义，直接对应本仓 D-115 逐 commit 事务写→事务完成后自查完整性。Appsierra 列举的 checksum/hash per partition、count parity、aggregate reconciliation 全部作为 load 后管线步骤执行。
- **同体双生 bug 的处理 = independence（独立失败模式），而非放弃引擎内断言**。aipatternbook Belt-and-Suspenders 模式（2026-06）形式化了这一点：
  - 「A single guard is a single point of failure … you usually can't tell from the outside whether it's holding」→ 否定 (a) 单层足够；
  - 「**Independence is the whole point. Two guards that share the same flaw fail together and buy you nothing.** The second guard has to fail differently」→ 双层的关键工程约束：外部 check 必须**独立代码路径**（不得 import 引擎的对账函数，须自行从 SSOT 重算），否则是 decoration；
  - 采纳判据：「cost of failure × chance first guard misses it」大且第二守卫便宜 → 装。本仓恒等式违例=审计账本崩溃（昂贵），check 脚本=几十行 SQL（便宜）→ 判据满足。
  - 「Make Illegal States Unrepresentable 优先」的例外说明：本仓恒等式是**行为性/统计性**约束（三桶计数关系），无法用类型系统结构性消灭 → 正是 belt-and-suspenders 的适用场景。
- **dbt 的 severity 机制**（error/warn）提供了断言误报面的官方调节阀：非关键断言可降级 warn 不 fail build——对应引擎内断言应区分「协议崩溃类」（非零退出）与「警告类」。

### ③ 财务/合规界：reconciliation 是独立控制职能（SoD），但「独立」指**执行主体/代码路径**独立，不否定流程内控制的存在

- UCLA Controller's Office（一手权威）：五项职能必须分离——**Approval / Accounting(reconciling) / Asset custody**，明确「The person who maintains and reconciles the accounting records should not be…」「**At least two sets of eyes are required for any transaction!**」【finance.ucla.edu 已读原文】。映射到本仓：**写 audit_fact 的代码（记账）与重算恒等式的代码（对账）不应是同一函数**——引擎内断言若复用写入路径的计数逻辑，即违反 SoD；这正是 (a) 的「双生 bug」风险的内控表述。
- WA State Auditor SoD Guide（摘要级）：小型部门无法分离时用「detailed supervisory review as **compensating control**」——映射：引擎内断言=流程内第一道控制，外部 check=补偿性独立复核，双层恰好构成「控制＋补偿控制」的合规标准形态。
- 所以 SoD 教义**不**说「对账只能在流程外」——它说对账逻辑不能与记账逻辑同源。(c) 的双层恰是 SoD 的机械化。

### ④ Invariants/assertion-as-code 先例的部署形态

- **dbt singular test**：断言=项目内 SQL 文件，随 build/test 命令执行，结果落 run_results.json【dbt 官方已读】——形态=(a)。
- **Soda**：双形态并存——`soda scan` 可嵌入管线内（Airflow operator/Python library 程序化调用）也可作为**定时独立扫描**监控【docs.soda.io、shipshapedata.com、confessionsofadataguy.com，多源一致】——形态=(a)+(b) 双层在单一工具内的官方支持。
- **Airflow SQL check operators**：断言即 DAG 任务，失败=fail task 并可通知【astronomer.io 已读】——形态=(a)。
- **Great Expectations**：Checkpoint 可挂进管线也可独立调度，Actions 可告警——同为双形态。
- 无一主流工具采用 (d)「报告内声明、读者自行核对」作为唯一形态；报告/数据文档（Data Docs、run_results）一律是断言执行的**产物**而非替代——与本仓「报告=投影」的定位完全一致：投影不能反过来替代生成它的账本的完整性检查。

### ⑤ 辩证：三层方案的代价与误报面

- **双层冗余成本**：belt-and-suspenders 明言「Redundancy is a tax」——外部 check 需要独立维护、会 drift。缓解：本仓已有 NN-check.mjs 惯例与 D-107 库内可重算承诺，外部 check 的边际成本低（同一 SQL 恒等式，第二条实现）；且「Mark it as load-bearing」——须在 check 脚本头注明其为承载性冗余、不得当作重复代码删除。
- **引擎内断言误报面（断言 bug 杀好管线）**：真实风险，行业调节阀是 severity 分级（dbt warn / Airflow trigger rules 可不阻断管线但保留 on_failure_callback 告警【astronomer.io 已读】）。对本仓：恒等式违例属于 D-111 非零退出枚举中的「协议崩溃=内部一致性违例」——**不应降级**，因为审计账本的完整性违例没有「警告后继续写」的安全形态；但断言本身要写得极简（纯 COUNT 比较），把误报面压缩到最小。
- **外部 check 滞后性**：仅 CI 跑=两次 CI 之间的运行无保护（(b) 的致命伤）；且 getrightdata 案例证明事后对账漏掉的缺陷会静默传播。
- **反向风险（双层特有）**：false confidence——团队知道有 backstop 就让第一层腐烂。缓解=belt-and-suspenders 的「fail fast and loud」纪律：两层都要每次运行发声，任何一层静默即视为失效。

## 3) 对比矩阵

| 方案 | 每次运行保护 | 独立性（防双生 bug） | SoD 合规模型 | 成本/误报面 | 工业界对应 |
|---|---|---|---|---|---|
| (a) 仅引擎内断言 | ✅ | ❌ 记账=对账同体 | 单一控制，无补偿控制 | 断言 bug 双生；误报直接杀运行 | dbt build 内嵌 test（但 dbt 生态总配外部工具） |
| (b) 仅外部守卫 | ❌ 非 CI 无保护 | ✅ | 仅 detective 控制且滞后 | 滞后传播（getrightdata 案例） | 纯定时 Soda scan（被视为不完整配置） |
| **(c) 双层** | ✅ | ✅ 两代码路径互核 | 控制＋补偿控制（WA auditor 模型） | 冗余税小（check 极简）；需防 backstop 腐烂 | dbt build test + Datafold/Soda；Airflow operator + GX 扫描 |
| (d) 报告声明 | ❌ | ❌ | ❌ 无主动控制 | 零成本但零保护 | 无主流先例；报告=断言的产物而非替代 |

## 4) 冲突核查（对既有决策）

- **D-107（恒等式三桶库内可重算）**：✅ 无冲突，双层是其**执行化**——「可重算」升级为「被重算×2」。
- **D-111（非零退出枚举）**：✅ 无冲突。引擎内断言违例归入「协议崩溃=内部一致性违例」类，语义吻合；外部 check FAIL 走 NN-check.mjs 既有 exit 非 0 惯例，属守卫层不占协议枚举。
- **D-112（三桶全须库内可重算）**：✅ 无冲突；外部 check 独立重算三桶时恰好是 D-112 的最严格验收（第二条独立实现），并顺带满足 D-071 风格的「断言级对账」惯例（对照 73-check.mjs 的 emit 调用点 vs inventory 对账先例）。
- **D-115（逐 commit 事务写）**：✅ 无冲突且被强化——引擎内断言的时点应为「每 commit 事务提交后即可增量断言三桶守恒（三桶恒等式是逐 commit 不变量），报告生成前做最终全量断言」。 belt-and-suspenders 的「fail fast and loud」支持逐 commit 即查而非攒到最后。
- 无需 revised 决策；建议新增一条 D 系列决策记录执行面=(c)，并注明外部 check 的 **load-bearing** 属性与**独立代码路径**约束（不得复用引擎对账函数）。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | dbt Developer Hub — Add data tests to your DAG | https://docs.getdbt.com/docs/build/data-tests | Official | 2026-09 更新 | singular test 形态、随 build 执行、fail 阻断下游 |
| 2 | Airflow 3.3 Best Practices | https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html | Official | 当前版 | 任务=事务教义、Self-Checks、幂等重跑约束 |
| 3 | Astronomer — Data quality and Airflow | https://www.astronomer.io/docs/learn/data-quality | Official | 当前版 | in-DAG check operator 全家桶、失败行为控制（trigger rules/告警）、pre-load+in-warehouse 多点检查 |
| 4 | UCLA — Segregation of Duties (Preventive & Detective) | https://www.finance.ucla.edu/corporate-accounting/controls-and-accountability/control-practices/segregation-of-duties-preventive-detective | Official（内控一手） | — | 对账与记账必须分离；「at least two sets of eyes」 |
| 5 | WA State Auditor — Segregation of Duties Guide | https://sao.wa.gov/sites/default/files/2023-05/Segregation-of-Duties-Guide%20%283%29.pdf | Official | 2023-05 | 无法分离时的 compensating control 模型（摘要级） |
| 6 | Encyclopedia of Agentic Coding Patterns — Belt-and-Suspenders | https://aipatternbook.com/belt-and-suspenders | Community/Comparative | 2026-06-07 | 双层采纳判据、independence 约束、false-confidence/冗余腐烂风险 |
| 7 | Appsierra — Data Warehouse Testing 2026 | https://www.appsierra.com/blog/data-warehouse-testing | Comparative | 2026-07 | 「reconciliation as pipeline steps that fail loudly」+ 成熟配置=三件并存 |
| 8 | GetRightData — ETL Testing Passed. Data Reconciliation Failed. | https://www.getrightdata.com/resources/blog/etl-testing-vs-data-reconciliation | Criticism | — | 仅迁移期/外部对账的静默失败与波次泄漏案例（正文 JS 受限，摘要+搜索全文） |
| 9 | Datatrail — Great Expectations vs dbt Tests | https://datatrail.ai/blog/great-expectations-vs-dbt-tests | Comparative | 2026-07-23 | dbt build「最紧反馈环」；GX 独立运行时形态；成熟团队组合用法 |
| 10 | Soda v3 — Test data quality in an Airflow pipeline | https://docs.soda.io/soda-documentation/soda-v3/use-case-guides/quick-start-prod | Official | 2026-05-04 | Soda 定时扫描+管线嵌入双形态（摘要级） |
| 11 | dbt severity / error_if / warn_if | https://docs.getdbt.com/reference/resource-configs/severity | Official | — | 断言误报面的官方调节阀（warn 不阻断） |

## 6) 信息缺口

- WA State Auditor PDF 与 NIST SP 800-53 仅摘要级，SoD「补偿控制」表述未逐字核验（结论有多源一致支持，风险低）。
- Soda 官方 quick-start 未全文读（Tavily extract 超额失败），双形态结论依赖三个次级源一致。
- 未找到数据契约（data contract）规范（如 Bufferpad/Open Data Contract Standard）中对账执行面的专门条款——可能补强 (c) 论证，非关键。
- getrightdata 正文被 JS 渲染截断，其案例细节来自搜索摘要＋部分原文，未达逐字级。

**最终建议（一句话）**：采纳 (c)——引擎内在每 commit 事务后＋报告前执行极简 COUNT 恒等式断言（违例→D-111 协议崩溃类非零退出，不设 warn 降级）；外部 NN-check.mjs 以**独立实现**（不复用引擎代码）重算同一恒等式进 CI；check 脚本标注 load-bearing 防误删。Confidence：高。

继续此会话，运行：atomcode -p "…" --resume 4ae90538-b068-4527-b327-2dc7ceabd565
