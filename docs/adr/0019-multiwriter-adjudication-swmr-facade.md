# ADR-0019: 多写者域终裁 = 判据意图读法＋SWMR 单写者门面＋fail-fast 准入＋L0→L3 升级阶梯

- Status: accepted
- Date: 2026-09-16
- Deciders: 用户（grill 轮 8 Q2，atomcode 调研后拍板）
- Ledger: D-043（current）；承 D-034④ 触发器域 / A-007（SSOT 单写者排他理由四条件）

## Context

desk-task7 预声明判据「多写者并发写入无丢行/乱序/冲突」遭遇实测形态：DuckDB 单文件引擎层互斥（官方文档：multi-process writing is not a primary design goal），并行写者被 fail-fast 拒入而非并发正确写入。字面读法下判据永不满足；需裁决判据守护的是结果属性还是实现路径。

## Decision

判据守护**结果属性**（无丢行/乱序/冲突的完整性不变量），实现路径不属于判据内容。并发策略成文 = **SWMR 单写者门面**：store.ts 唯一写入口；引擎级文件锁为准入控制，竞争失败方显式失败（fail-fast 零撕裂，优于盲目重试）；胜者串行追加，终读零重复。实测锚 = 39-mw-self-probe.json（1 胜 3 lock_denied／跨进程串行追加 2/2／终读 66/66 行零重复）。升级阶梯 L0→L3：L0 fail-fast 准入（现状）→ L1 bounded queue＋单 owner 进程 → L2 分库 ATTACH → L3 Quack/DuckLake（写路径本质仍是服务端串行准入，beta 未熟）；升级信号 = 锁等待进入关键路径实测／WAL 失控／在线低延迟小事务，触发复审从 L1 起步。复审触发面 = D-034 三触发器任一激活且关键路径信号出现（mw-trigger-c 保留 event_bound 值守）。

## Considered Options

- 判据字面读法立票做真多写者（写队列/分库 merge）——拒：与 A-007 单写者排他理由四条件全撞（append-only 场景、受控管线、余量 3–4 个数量级、无在线低延迟小事务）；工业界心智模型=单写者域＋应用层准入（SQLite「writers queue up and take turns」、OneUptime workers→bounded queue→单 owner→duckdb 标准模式，逐 worker 重试连接被列反模式）。
- 折中：SWMR＋新触发器「单仓采集并行化需求出现」——拒：mw-trigger-c 已锚唯一可预见的真并行写需求点（Macro-A ≥2 仓并跑），重复造触发面。

## Consequences

desk-task7 判据写实化改写（原文留 git 历史）；mw-trigger-a/b 闭环 decided；并发策略获得学名（SWMR Facade，CONTEXT 词表）；升级路径预注册避免届时临时发挥；「判据守护结果属性」成先例——后续预声明判据措辞默认按意图读法撰写与复核。
