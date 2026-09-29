# R47-Q2 atomcode 调研存档 —— 「等外部真实验证」段仓内合法工作面裁量

（ctx_batch_execute 串行单发；searches: 4（Exa×3+AnySearch×3，Tavily 超限换引擎）／angles: Official+Criticism+Comparative+Currency+Community 五类／full reads: 6。调研完成时刻=2026-09-29。）

## 执行摘要

**推荐：以 (b) 闭环残余面为最高优先，叠加 (d) 维护强化面为主体工作，(c) 预备件严格限流为「解锁后第一周就要用的小件」，(a) 纯值守不成立。** 置信度：**高（~85%）**——三个成熟心智模型（Kubernetes 式 freeze 期活动清单／design-partner 等待期反模式／dark-launch-shadow「无真实流量不算验证」边界）交叉收敛，每模型 ≥2 独立信源。

**一句话执行序**：先清残余欠账到零（b）→ 等待期主力投守卫覆盖/性能基线/冻结资产巡检（d）→ 预备件只做「解锁第一周必用、不依赖试点反馈、假设被否定仍成立」的管道件（c）→ 仓内落一份 freeze 期 allowed/deferred 清单作约束文件。

## 分点结论

**① 纯值守姿态 (a) 健康性判据不达标，排除。**
Founders Edition（2026-07）：等待外部流程不免费——「每一周没有反馈就是一周纯按自己想法构建并复利猜测」；纯值守=仍在一个方向隐性复利（文档腐化/测试 flake/依赖漂移积累），只是把「选做什么」外包给惯性。freeze 期健康判据（Kody Wildfeuer 2026-04＋K8s release phases）：允许工作=bug fix/docs/DX/不改外部行为的 refactor/测试覆盖/面向外部采用的工作，且应「写下来、定退出条件」——**无任何成熟模型支持「只值守」**；纯值守唯一成立前提=欠账清零∧守卫全覆盖∧无代表性巡检义务，工程语境下几乎不可能是真。

**② (b) 闭环残余面优先级最高——两条独立心智模型共同指定的第一动作。**
- K8s release phases（原文）：Code Freeze 后 Burndown 阶段全部意图=fix bugs/消 test flakes/稳定化；Enhancements 缺测试被 prune——已触发未处置欠账正是此类 partially implemented 项。
- Wildfeuer freeze 实践：停止开新面后首周发现的全是「接线没接对/schema 双命名/文档指向不存在端点/测试 import 已改名模块坏了几周没人跑」——已存在未闭环欠账。留着它们的危害随外部验证临近放大：**试点/真实仓实测期暴露的任何失败会同时污染「产品判据」和「欠账噪音」，无法区分产品问题 vs 仓内已知问题**。

**③ (d) 维护强化面=等待期主体合法面，完全落 freeze 期允许边界内。**
K8s Test Freeze 明文「在此之前改进既有代码的测试覆盖是可接受的」；Wildfeuer allowed 列表含 test coverage/DX/不改外部行为的 refactor；Microsoft 工程手册把 shadow testing/合成监控列为 pre-production 风险削减标准手段。守卫覆盖加深/性能基线/冻结资产代表性巡检=「对已冻结资产做深度而非广度」——「feature velocity 超 integration velocity」时的标准解法。**边界**：不得借机开新 API/新状态文件/新 workflow。

**④ (c) 预备件严格限流——三问筛。**
合法预备件=「解锁后第一周必用 ∧ 不依赖试点反馈 ∧ 假设被否定仍成立」的管道类件；dev.to「build on imaginary users」反模式＋YC 社区「building ahead of validation」信号为限制面来源（摘要级）。

**⑤ 与 shadow launch/dark launch 反模式的界限：合法预备件是「管道」，非法的是「假装已验证」。**
Microsoft playbook＋Signadot（两源一致）：shadow testing 价值=用代表性流量对比 V-Current/V-Next，明文承认不能替代真实用户暴露（canary 才有真实用户）；OneUptime（2026-01）dark launch 同理——新路径结果被丢弃只采指标。映射本场景：**为真实仓预建接入/采集/对照管线=合法预备件（建好管道等真水）；把模拟仓/内部仓实测结果当作「已满足 ≥2 真实仓证据」=shadow 反模式**——本仓「模拟/内部仓证据被显式排除」（D-062③）恰是此边界的正确执行。

## 对比矩阵

| 面 | freeze 边界合法性 | 解锁后价值 | 主要风险 | 推荐姿态 |
|---|---|---|---|---|
| (a) 纯值守 | 合法但不充分 | 低 | 文档/测试腐化隐性复利；健康判据几乎不可能满足 | 仅作底线，不作策略 |
| (b) 闭环残余 | K8s Burndown/Test-freeze 前标准活动 | 极高——隔离试点期信号噪音 | 无（面有限，做完即止） | **第一优先，做完为止** |
| (c) 预备件 | 允许「面向外部采用」的件；新功能不允许 | 高（仅三问全 yes 的件） | 滑向 build-ahead-of-validation | 严格限流：解锁后首周必用管道类件 |
| (d) 维护强化 | 全部在 allowed 清单内 | 高——冻结资产深度即发布质量 | 借机开新面（须 allowed/deferred 清单约束） | **主体工作面** |

## 完整来源清单

1. Kubernetes Release Phases（官方 github.com/kubernetes/sig-release，raw 已读）——freeze 期活动边界一手权威：Test Freeze 前允许提升既有代码测试覆盖；Burndown=清 bug 与 flake；无测试 enhancement 被 prune。贡献 (b)(d) 合法性依据。
2. Feature Freeze as a Forcing Function（Wildfeuer，2026-04-17，已读全文）——freeze 期 allowed/not-allowed 显式清单、deferred list 机制、退出条件。贡献 (a)(c)(d) 边界。
3. Stop Waiting（Founders Edition/Collin Stewart，2026-07-24，已读全文）——等待企业流程期成本与反模式。贡献 (a) 证伪。
4. Microsoft Code-With-Engineering Playbook: Shadow Testing（官方，已读全文）——shadow/representative traffic 定义与局限。贡献⑤管道 vs 假验证界限。
5. Signadot: What Is Shadow Testing（2025-04，已读）——shadow vs canary vs feature flag 区分；shadow 无真实用户在环。与 #4 交叉验证⑤。
6. OneUptime: Dark Launch Patterns（2026-01-30，已读全文）——dark launch 定义、丢弃新路径输出。三源交叉验证⑤。
7. Why Most Developer Startups Fail Before Launch（dev.to，2026-01，仅摘要）——build on imaginary users 反模式。贡献 (c) 限制（未读全文，方向性佐证）。
8. r/ycombinator 常见反模式帖（仅摘要）——building ahead of validation 社区信号。贡献 (c) 限制。

## 信息缺口

- 未找到针对「工业产品发布判据卡在外部生产线实测」精确场景的公开 playbook（多数材料面向 SaaS/云服务）——结论由邻近模型合成，已标注。
- Tavily 配额超限第三引擎仅部分参与；关键结论仍满足双源。
- (b) 残余欠账具体清单与 (d) 覆盖缺口属仓内事实须盘点后定工作量——调研只能给优先级不能给清单。
