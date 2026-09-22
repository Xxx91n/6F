# R28-Q14 深调研题面：恒等式对账的验证执行面（引擎内断言 vs 外部守卫 vs 双层）

## 本仓背景

审计面产品：append-only audit_fact SSOT＋quarantine_log 逐字段事件表（disposition=quarantined|normalized）；恒等式 total_%cI=clean+normalized+quarantined 三桶全须库内可重算（D-107/D-112）；逐 commit 事务写（D-115）；字节级确定性 charter；报告=投影；CI 回归腿＋本机 NN-check.mjs 守卫脚本惯例；非零退出枚举=协议崩溃/IO 失败/strict 门禁崩（D-111）。

## 未裁问题

「可重算」≠「被重算」——恒等式对账由谁、在哪、何时实际执行？

- **(a) 引擎内后置断言**：写完所有数据后、报告生成前，引擎自跑 COUNT 差集重算，不符→非零退出（协议崩溃类=内部一致性违例）。每次运行被保护；但断言代码与被断言代码同体（bug 可能双生）；
- **(b) 仅外部守卫脚本**：独立 check 脚本（独立代码路径）在 CI 跑。独立复核；但非 CI 运行无保护；
- **(c) 双层**：引擎内断言＋外部独立 check（两代码路径互核）；
- **(d) 报告内声明即可**：读者自行核对——无主动执行。

## 调研任务

工业界成熟心智模型取证：① ETL/数据管线界的 reconciliation/count-validation 惯例——对账断言内建进管线（in-pipeline assertion）还是独立作业（separate reconciliation job）？（dbt test/Great Expectations/Airflow SLA/data diff 工具各自形态）；② 自校验先例——管线「写完自查」的内建断言惯例（如 checksum 校验、count parity、post-load validation），以及「同体双生 bug」风险的工业界处理（independent verification/dual-path）；③ 财务/合规界的对账执行面惯例（reconciliation 是流程内控制还是独立控制职能——segregation of duties 心智模型）；④ invariants/assertion-as-code 先例（如 dbt singular test、数据契约 testing、SODA checks 部署形态）；⑤ 辩证：双层冗余的成本、引擎内断言的误报面（断言 bug 杀好管线）、外部 check 的滞后性。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-107/D-111/D-112/D-115、来源清单、信息缺口、置信度。
