# R25-Q3 atomcode 调研报告（存档）

> 2026-09-22 轮25 grill Q3。置信度：高（字面钉/存在性活性分层≥2 独立一手信源；tripwire 登记纪律=中，无现成哨兵册制度系相邻纪律合成）。来源：Google Testing Blog(Titus Winters)/Bashmatica #20 intent-lint/thoughtbot 时间炸弹/Enterprise Craftsmanship(Khorikov)/K8s probes 官方/OneUptime/actionlint/Mergify quarantine 等——全文经 ctx 索引 source=atomcode 可回捞。

## 核心结论

1. **分流判据=「失效是不是断言的功能性预期」**：(a)守的真坏→修现实；(b)合法演化→改断言或入册；(c)从未检查声称的东西（名不副实/死面）→**欺诈断言禁入 XFAIL 册**——入册=册子为假断言背书。
2. **三建制路线**：纪律文（写法约定）／普查机检（结构可判缺陷）／册登记（合法漂移类——cap+归因+XPASS 防垃圾桶化）。
3. **存在≠活性=K8s 三态移植**：presence/liveness/readiness 三层断言；活性层检查运行记录非文件；读不到 run 记录时断言名须诚实标只剩 presence 面。
4. **机芯互搏预警**：登记 tripwire 须在 vacuity 普查豁免（否则恒真误报）；sealed 探针同受注释层规则约束+豁免显式登记；XPASS 逼摘=人工裁决（两键分离）。
5. **逐样本**：①字面钉→册+纪律+逐枚归因（逼复审意图=tripwire 非漂移钉）②魔数地板→先问意图（治理 tripwire→改名+事件锚；无意图→派生断言改写）③事件钉→册+事件退役断言同摘④名不副实→机检剥注释+纪律文⑤死面→三层断言拆分⑥XFAIL 册规→明文只收 (b) 类。

## 工业锚点

thoughtbot 时间炸弹（字面钉相对化+表意化，钉性质不钉字面值）；Khorikov 自证断言（名↔检由同一构造产生）；Bashmatica intent-lint（一句话说不清=finding）；K8s probes 三态各配不同失败后果（依赖检查混 liveness=级联重启反模式）；actionlint=workflow 存在→活性缺口的标准补法；Mergify quarantine 照跑+自动恢复 vs 本仓 XPASS 人工逼摘（保留现制）。
