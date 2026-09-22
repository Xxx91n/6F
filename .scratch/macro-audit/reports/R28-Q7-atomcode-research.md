# R28-Q7 atomcode 调研存档（ctx_batch_execute 输出整理）

> 2026-09-22 轮28 grill Q7：「crash-bucket 承载形态」——quarantine_log 复用 vs 崩溃工件文件 vs DB 独立 crash 表 vs 工件+事后补库。
> 题面存档：R28-Q7-research-prompt.md。执行：atomcode -p 串行单发（81 行/13.5KB/8 索引节）。
> Sufficiency Gate：searches 8（web×4+anysearch batch×3 合并 6 查询+tavily×2 限额失败补位）| angles：Official/Comparative/Criticism/Community | full reads 7（Oracle error-reporting、Crashpad overview_design、Chromium OS crash FAQ、GitHub store-and-share-data、Sentry Crashpad backend、johal.in Airflow DLQ、WER SOSP'09 论文）。缺口：Android tombstone 官方页 403 由 Sentry 博文+Arm/SO 交叉补位；Tavily 本任务零成功。

## 1) 执行摘要

**推荐 (b)：崩溃工件文件——fail-fast 边界（cli.ts 顶层 catch＋39 脚本等位 catch）落结构化 JSON 工件（error_code/raw_bytes_hex/崩溃位置/run 上下文/结构化计数），不依赖 DB，CI 收 workflow artifact。** Confidence：高——JVM hs_err_pid、Android tombstone、Crashpad/Chromium OS、Sentry minidump、GitHub Actions failure artifact 五条独立工业先例全部同向：致命错误的现场留痕走文件工件、垂死路径写依赖最小化、聚合/入库存放是事后旁路职责。与 D-104③/D-103/D-106/D-108 零冲突；澄清注记：D-104③「结构化计数留痕」由工件 JSON 内嵌三桶计数字段承载。

## 2) 对比矩阵

| 项 | 垂死路径写依赖 | grain 纪律 | 可观测性/查询面 | 双故障风险 | 备注 |
|---|---|---|---|---|---|
| (a) 挤入 quarantine_log | 高（fail-fast 路径一次 DB 写） | 自违 D-106（逐运行事件混进逐字段事件表） | 单查询面 | 写失败=证据永久丢失 | field=__protocol__ 哨兵+commit_sha=null 伪造外键语义 |
| (b) 工件文件 | 零 DB 依赖 | 逐运行事件=逐文件自洽 | CI artifact 收集；跨运行对账靠目录聚合（WER 模式） | 最低（仅文件系统依赖，JVM 先例证明最可靠） | 推荐；计数内嵌 JSON 化解 D-104③ |
| (c) 独立 crash 表 | 高 | 分表可守 grain | SQL 可查 | 同 (a)＋罕见事件多建表 | DB 写风险与收益不成比例 |
| (d) (b)+事后补库 | 首现场零依赖 | 补库表 grain 仍需另立 | 两层面 | 「下次成功运行」可能永不来；补库写入重引入耦合 | 复杂度翻倍，收益被 CI artifact 覆盖 |

## 3) 分点结论

**① JVM hs_err_pid：致命错误现场=文件，官方明文。** Oracle 官方档：fatal error 时 JVM writes a crash report 到 hs_err_pid<pid>.log 文件（siginfo/问题帧/线程栈）——不是写入任何错误表；路径可配 -XX:ErrorFile，工作目录不可写时回落 /tmp——连降级路径都立法了。SO 反向印证：native 栈溢出等场景 hs_err 也会写不出来——没有载体能 100% 捕获，(b) 的可靠性上界即工业上界。

**② Android tombstone：结构化崩溃报告落盘目录，独立于业务数据面。** debuggerd 写 /data/tombstones/ 文件（全线程栈+寄存器+内存），与应用数据/数据库完全分离；Crashlytics 等消费端事后读取 tombstone 聚合上报——「垂死进程只写文件、采集与入库分离」是平台级建制。

**③ Crashpad/Chromium OS：设计档把「垂死路径执行最少」写成硬性要求。** Crashpad overview_design 原文：「generate crash reports with as little execution in the crashed process as possible」——崩溃捕获由独立 handler 进程完成、minidump 落盘序列化文件、上传是事后旁路。Chromium OS FAQ：crash_reporter 写 *.dmp/*.meta 到 /var/spool/crash，crash_sender cron 每小时才上传；磁盘已有 32 份停止新建（kMaxCrashDirectorySize）——罕见致命事件惯例=目录＋配额＋旁路发送，无一写入运行时数据库。Sentry Native 同构：Crashpad database=.sentry-native 目录。

**④ GitHub Actions failure artifact 是 CI 级惯例。** 官方档 artifact 明文用途含「debugging failed tests or crashes」；实战 commit：if: always()/failure() 上传诊断工件、if-no-files-found、retention-days——CRASH 后退出的进程在 CI 的收集面=workflow artifact，39 脚本与 cli.ts 崩溃工件可直接挂现有 CI 矩阵。

**⑤ 框架级失败 vs 记录级失败分流是数据管线公认分界。** Airflow 实践：task 级失败走 Airflow 日志/失败标记（框架面），记录级失败走 DLQ（S3/表，数据面）；airflow-dq 把 infra 错误立为 status=error 独立状态与 quarantine 行分开承载、infra 失败不 crash monitor。对应本仓：协议级违约（框架级）≠字段级病态（记录级），(a) 把前者塞后者表正是管线界避免的反模式。

**⑥ 微软 WER SOSP'09 论文：大规模聚合靠「错误报告文件→中央库」两段式，非崩溃时入库。** WER 本地单位=错误报告文件（CAB），服务端才聚合入 SQL 库做 bucket 统计——「data not decibels」聚合能力建立在崩溃路径只产生文件的前提上。回答 (b) 对账疑虑：跨运行结构化对账不需要崩溃时写库，只需工件结构化＋目录可枚举；聚合是消费面职责。

**⑦ D-104③ 结构化计数在 (b) 下的满足方式。** 工件 JSON schema 内嵌：error_code（受控词表对齐 D-104④ fsck msg-id 命名法）、raw_bytes_hex（字节级证据）、crash_location（流内偏移/记录序号）、run_context（traceId/headDate/collector）、counts（崩溃时刻三桶累计＋已解析记录数）——WER 证明崩溃报告携结构化计数后服务端聚合可行；「防首个观测实例永久不可归因」义务由 raw_bytes_hex＋counts 双字段闭合。

## 4) 冲突核查

D-104③ 满足（工件携字节快照+结构化计数，由消费面 catch 承接合 D-103 契约层不做 IO）；D-103 满足；**D-106 grain 判据下 (b) 反而是唯一完全守规选项**——(a) 自违、(c) 分表守 grain 但引入 DB 写风险、(d) 补库表需另立 grain；D-108：traceId 写入工件 run_context 作关联键，crash 运行无 fact/quarantine 行幂等约束不适用；双通道 cli.ts 与 39 脚本等位 catch 对称落工件。**零 revised**；D-104③ 载体显式落为工件 JSON 字段属补齐未定义项（同 D-107 处理 D-100③ total 先例）。

## 5) 来源清单

Oracle JVM Fatal Error Reporting（hs_err 文件机制+降级路径+二级错误坦白）；Oracle Fatal Error Log 位置（ErrorFile 配置/抑制条件）；SO:hs_err 不生成原因（可靠性上界实证）；Crashpad Overview Design（垂死进程最少执行硬要求）；Chromium OS Crash Reporting FAQ（目录+配额+旁路 sender）；GitHub Actions store-and-share-data（failure artifact 惯例）；Sentry Crashpad backend（.sentry-native 目录）；johal.in Airflow DLQ（框架级 vs 记录级分流）；airflow-dq（infra error 独立状态分写）；WER SOSP'09 论文（两段式聚合）；Sentry tombstone 博文+Arm MTE（Android 交叉补位）。

## 6) 信息缺口

Android tombstone 官方页 403 未读原文（Sentry 博文+Arm+SO 交叉补位）；Tavily 引擎本任务零成功检索（Exa+AnySearch 补位）。
