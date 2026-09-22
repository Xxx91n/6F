# R28-Q9 atomcode 调研题面

> 2026-09-22 轮28 grill Q9。数据源纪律：调研须回顾 decision-ledger 全部 current 记录、docs/adr 全部 ADR、CONTEXT.md 全部词条、工业界成熟心智模型（重点）。结果辩证看待；与 current 决策冲突→标 revised 呈报不静默改向。

## 系统背景

工程内容审计产品：DuckDB 单文件 SSOT 只追加、字节级确定性可重放、报告=read model 投影、MCP 只读查询面、Receipt 概念已在 CONTEXT。quarantine 建制链 D-100~D-110 全就位（契约层分类器/%cI 接线/锚病态→unsupported/独立 quarantine_log/逐字段恒等式/幂等写入/崩溃工件/strict 门禁仓级基线+棘轮）。

## 已就位决策（本题约束）

- D-105：unsupported 裁定报告须携机读 verdict+reason class（DLQ「非成功终点须告警」）＋管线绿与裁定红正交；observed_at 红线；
- D-106：报告=quarantine_log 投影（read model 纪律：可推导者不落库）；
- D-109：协议崩溃=工件文件+进程非零退出（fail-fast）；
- D-110：strict 门禁基线 miss=门禁失败 exit 非 0＋结构化 stderr（非协议崩溃不进 crash 工件）；
- 现状出口面：cli.ts --json 机读输出＋报告 md＋receipt；regression CI 腿只认「进程成败+工件在否」；
- verdict=逐运行 grain 事实（非逐 commit fact 非逐字段事件），但可从 quarantine_log+阈值规则完全推导。

## 裁决问题

verdict 机读载体与 exit code 契约：

- (a) verdict 落报告机读块＋receipt＋--json 三面同源投影；exit code 恒 0=管线完成（supported/unsupported/insufficient 都算跑完）；非零仅管线失败（协议崩溃/IO/strict 门禁崩）；CI 按 JSON verdict 字段判实质裁定——「exit code=执行轴、verdict=审计轴」两轴正交；
- (b) unsupported→专用非零 exit code（如 3）——CI 无 JSON 解析可分流，但 exit code 把裁定混进执行语义=正交轴坍一维；
- (c) verdict 落库（runs/verdict 表）——逐运行 grain 该有逐运行表，但 verdict=纯推导量落库=派生量写进 SSOT 违投影纪律；
- (d) verdict 仅人读报告节——违 D-105③ 机读要求。

reason_class 枚举候选=evidence_insufficient/anchor_malformed/threshold_exceeded/...（受控词表同 reason_code 纪律）。

## 调研任务

1. 工业界 CI/CLI 工具的 exit code 语义惯例：0=成功 vs 非零=失败 vs 多值分流（grep 0/1/2、jest/eslint/trivy/gitleaks exit code 设计、「violations found」与「tool error」是否分开）；「业务裁定=数据字段、执行成败=exit code」分轴先例；
2. 审计/报告类工具的裁定承载面：SARIF result vs toolException、OPA/conftest verdict、inspec compliance report——裁定结果放结构化数据面还是 exit code；
3. 「降级/unsupported/insufficient」第三态裁定在报告 schema 的成熟表达（health check UNKNOWN=200 先例、OpenTelemetry status codes、SARIF result.kind）；
4. 可推导裁定 vs 落库裁定：read model 投影 vs event 表的边界惯例（CQRS/ES 里 verdict/status 这种「由事件推导的态」是否落事件存储）；
5. 辩证处：每选项找真实反例；(a) 的「exit 0=跑完含 unsupported」是否会让 CI 漏报（消费者不读字段就当绿的风险）——业界怎么解（default-deny 消费面/强制 schema）。

输出：推荐选项（可修正变形）＋理由＋对本仓既有决策的冲突核查。
