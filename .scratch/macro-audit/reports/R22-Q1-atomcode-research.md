# R22-Q1 调研报告：册外陈旧断言批量处置与 cap 满机制缺口

- 调研工具：atomcode-research（resume id: d4e2345f-cb14-4a6d-a59b-a15742d7f344）
- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q1-research-prompt.md
- 置信度：高（内部双依据 D-071⑨＋R21 审计返工第 8 项；外部 6+ 独立信源交叉）

## ① 结论

**推荐 (a)：提前触发 second-track＋三向分拣批量票**——cap 已满即 D-071⑨ 触发条件的字面命中（「条目触 cap」），无需等 stage3-close；13 件按失效类三向分拣（验收探针面封存＋attestation 留档／活契约面腾位入册／环境敏感腿另题），cap=10 不动。一句话：**验收探针是「时点事件」不是「活契约」，其归宿是封存留档而非入册续命；清单位留给真正的活契约漂移**——这正是 Chromium NeverFixTests/StaleTestExpectations 分文件、Pact「契约 vs 过度指定场景」、jest obsolete snapshot「所有者消亡即退役」三方共同指向的心智模型。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 提前触发 second-track＋三向分拣 | **采纳** | 触发器字面已命中（cap 10/10）；分拣按失效类而非按守卫，可机械化归因；cap 不动保住「清单=活契约漂移的受控容量」语义（Oneuptime：cap 满应停止新增而非扩容——"Hitting the cap should stop new quarantines until the backlog shrinks"） |
| (b) 批量桶 group entry 扩容 | 不采纳 | group entry 把一族异质失效（探针/契约/环境腿）压成一条条目，稀释逐条 review_anchor/expires_fallback 问责粒度，恰是 R21 审计判册外件「无机制承接 [weakened]」要修的病灶；Chromium 反例：其解法是分文件（NeverFix/StaleTestExpectations）而非把一条 expectation 塞多测试 |
| (c) cap→23 全量入册 | 不采纳 | 13 件中约 11 件是验收探针/环境腿，入册=给时点断言发「活契约」身份证，违反 D-071⑤「真回归禁入清单」同构的准入语义；Chromium 明文：「will never pass 的测试应直接删除」而非永久挂账 |
| (d) 激进整面删除 | 部分采纳（仅探针面，且需 attestation 前置） | Open edX Flaky Process/Google Trunk 实践支持删除，但前提是 ticket 留痕先行（"file a flaky bug ticket → then delete"）；无封存留档的裸删除撞 D-044 不可变历史张力；环境敏感腿（38:H4/39:I1-I3）不属「使命完成」不能整面删 |
| (e) 缓挂等 stage3-close | 不采纳 | 触发条件已实然命中而按期序挂起=用「manual_watch 期序」压制「触发器事实」，与 D-063 直接冲突；且 R21 审计已列返工项（第 8 项），缓挂=已知债务展期 |

## ③ 工业先例证据

1. **Chromium TestExpectations 分文件治理**（Official，https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/testing/web_test_expectations.md）：StaleTestExpectations 专收「挂了很多月、短期修不了」的行——移出去给人让路而非扩容主清单；NeverFixTests 收「永不修」；明文「永不通过的测试应该直接删除」。→ 支持 (a) 分拣＋独立封存轨道，反对 (c)。
2. **Oneuptime 隔离区治理**（2026-07-28，https://oneuptime.com/blog/post/2026-07-28-quarantine-flaky-tests/view）：条目五要素（id/owner/issue/expiry/exit criteria）缺一 CI 拒收；「expiry 不自动删除，而是把忽视变成可操作的流水线失败」；cap 满即停新增。→ 支持 (a) 逐条归因＋批量票登记，反对 (b) 粗粒度。
3. **Pact 官方：契约 vs 过度指定**（Official，https://docs.pact.io/consumer/contract_tests_not_functional_tests）：过度指定业务细节的场景造「不必要的紧契约」，提供方放宽规则即「破坏」契约——语义分界先例：验收探针（钉 milestone 完成时点的具体事实）≈过度指定场景，milestone 完成后任何世界向前都「破坏」它，这种破坏不是契约破坏。→ 支持「验收探针面不迁入清单」分拣判据。
4. **Gojko Adzic《Specification by Example》十年回访**（2020-03-17，https://gojko.net/2020/03/17/sbe-10-years.html）：验收测试兼具「spec＋done 后的回归＋未来文档」三职只在被正确维护时成立；FitNesse 衰落教训正是 wiki 验收页无人随演进更新而腐烂。→ 支持「时点探针与活契约是不同失效类」，D-071⑨「断言改写为时点快照/结构不变量」正对症。
5. **Open edX Flaky Test Process**（Community/官方 wiki，https://openedx.atlassian.net/wiki/spaces/AC/pages/4306337795/Flaky+Test+Process ）：删除流程=先立 GitHub ticket（含失败签名存档，"Build logs aren't kept forever"）→单 commit PR 删除→留链。→ 支持「封存前固化 fired attestation」落地形态。
6. **Jest obsolete snapshot 机制**（Official，https://jestjs.io/docs/cli）：snapshot 所有者（测试）消亡后判 obsolete 并可 prune——基线化退出心智模型：资产价值由其所有者存在性定义，所有者（milestone 验收职能）已消失的断言应显式退役而非挂账。insta（cargo insta）同理：pending/accept/reject 显式三态评审。

## ④ 落地形态设计

**1. 触发器认定**：second-track 票面登记一行「触发器 fired：cap 10/10（G1 断言在案）＋册外 13 件实测（R21 §3）」，manual_watch 状态置 escalated，不绕过期序（触发认定≠直接处置，处置仍走本轮裁决）。

**2. 三向分拣判据（可机械化）**：

| 失效类 | 判据（机检） | 处置 |
|---|---|---|
| 验收探针漂移 | 守卫头部注释含「接入时点验收」标记＋failure_class∈{acceptance-probe}＋superseded_by=milestone-close 事件 | 封存 |
| 活契约漂移 | 归因与已入册 10 条同型（rolling/anchor/growth-surface） | 逐条补十字段入册（需先封存/清退腾位） |
| 环境敏感腿 | 断言依赖 sibling 仓/外部工作树状态（grep 守卫源码可判定） | 另题，不进任何清单 |

**3. sealed 态语义**：**封存≠archived**。区别面——
- D-071③「断言照跑不转 archived」保护的是活契约：XFAIL 条目的断言必须继续跑，XPASS 是回归自清信号；
- sealed 是第三态载体：断言从 xfail-run 的执行集移出、守卫转 sealed 输出，但 xfail-run 对 sealed 守卫输出 `SEALED: n (fired-attestation: <path>)` 顶显行——语义=「此断言已完成使命，其最后已知结果已固化留档；任何后续变更为无意义信号，已切警」。archived=「失效但假装在管」，sealed=「完成且显式退役」。正是 Chromium StaleTestExpectations「移出去给主清单让路」的文件级版本。

**4. attestation 留档格式**：仿 Open edX ticket-then-delete，`.scratch/architecture-recovery/reports/acceptance-probe-attestation.jsonl`，每件一行：`{id, guard, assertion-slug, fired_at, last_fired_commit, evidence(R21 §3 指针), disposition: "sealed-probe-mission-complete", decision: "D-xxx"}`——append-only（D-044 同构），33-check 增 G5：sealed 守卫必须有对应 attestation 行，否则 FAIL。

**5. 接口面**：xfail-run 读 sealed 列表→跳过执行但输出计数；33-check 校验 sealed×attestation 闭包＋entries+sealed 不重复；守卫文件加头部标记行（`// acceptance-probe: sealed <date> <decision>`）供分拣机检。活契约面腾位后逐条入册，流程与 A-071 首批完全同构。

## ⑤ 失败模式与治理

1. **sealed 变垃圾桶**：封存无审查=skip 的体面化。治理：sealed 需决策 ID＋attestation 双锚（Oneuptime expiry 语义——「把忽视变成可操作失败」），33-check G5 enforce。
2. **XPASS 自清信号丢失**（D-071「断言照跑」的真正价值）：探针面封存后若守卫断言将来真复活被违反，无信号。缓解：D-071⑨ 已含「断言改写为时点快照/结构不变量」——封存时同步完成改写者不留此洞；未改写者 attestation 行标 rewrite-pending，复审锚兜底。
3. **分拣误判**：探针/契约边界靠归因文本判断，有主观性。缓解：判据尽量机检（头部标记＋failure_class 枚举），边界件挂「同 45-H5 前提勘误」先例人工裁决，账本留痕。
4. **环境敏感腿漂白**：并行 agent 再弄脏邻仓时，38/39 守卫其余断言可能新破。治理：另题内将「sibling 仓零写入」类断言改为前探（存在性检查）＋快照化，参照 D-071⑨ 同构。

## ⑥ 与本仓决策冲突核查表

| 决策 | 冲突面 | 核查结论 |
|---|---|---|
| D-071③ 断言照跑不 archived | 验收探针封存是否隐性破例？ | **不破例，前提是语义分界成立**：③约束的是清单条目（活契约 XFAIL），sealed 是册外探针的第三态载体、不入 entries、不占 cap；且非 skip——输出面 SEALED 顶显持续可见。建议账本 D-071 补注记：「③适用于活契约条目；验收探针 sealed 为 D-xxx 显式新例，非 archived 变体」 |
| D-044 不可变历史 | 断言移除 vs fired 记录不可变？ | 无冲突：D-044 保护的是记录（fired 留档），封存恰是加强留档（attestation jsonl append-only）；移除的是执行，历史照存 |
| D-071⑨ 触发器（manual_watch, stage3-close） | 提前触发 vs 期序纪律？ | 条款自含「条目触 cap」条件，cap 已满=fired 是条款内认定而非绕序；期序保留在「处置裁决仍走本轮立票」环节 |
| D-063 有实证即裁决 | 缓挂 (e)？ | (e) 与 D-063 直接冲突（实证 13 件在案而挂起），已排除 |
| D-046 撤除先例 | 删 jiahao workflow 先例是否支持整面删除 (d)？ | D-046 是决策性撤除（有意识撤项）；探针删除是使命完成退役，同类但需 attestation 中介——引用 D-046 作「撤除有先例」注记而非直接外推 |
| D-068⑥/D-068⑦ 划界 | sealed 条目会否变 registry 第四态？ | 不会：sealed 不入 stale-assertions.json schema，独立载体＋独立校验行，与「baseline 更新=一次性豁免 vs XFAIL=受控声明」二分正交 |
| D-037 版本纪律 | stale-assertions.json schema 是否需升版？ | 本轮不动 schema（cap/entries 不变）；attestation 为新文件新 version=1；若后续活契约面入册则 entries 追加属常规操作非升版 |

## ⑦ 信息缺口

1. sealed 守卫的 CI 展示面：38/39/40 三守卫整体转 sealed 还是断言级部分 sealed？（38 有 2 件册外、39 有 10 件——39 几乎全守卫陷落，可能整守卫封存更经济；需逐守卫盘点断言级 id 现状，D-071 落地时预留的「30 守卫断言级 id 盘点」仍未做。）
2. xfail-run.mjs 当前是否支持「守卫级排除」——实物读取显示其按 entries 驱动，sealed 排除逻辑需小改 runner（改动量未评估）。
3. attestation 留档的消费者：目前只有 33-check G5 一个读者，是否有审计链下游（如 held-out eval / 下轮审计 agent）需要读它，影响格式字段。
4. rustc known-bug / TAP TODO 封存先例原文本轮未重取（R21 调研已覆盖并进 D-071，引用其结论而非本轮一手核验）。

## ⑧ 建议追问

1. 39 号守卫 10/10 断言陷落——是否直接整守卫 sealed（守卫级封存）而非逐断言？整守卫封存时 xfail-run 的排除粒度要不要升级为守卫级？
2. attestation jsonl 与 decision-ledger 的 D 条目是否要双向指针（账本行含 attestation 路径）？建议要——否则 D-044「不可变历史」链断在账本侧。
3. 环境敏感腿（38:H4/39:I1-I3）「另题」的题号与 owner 归属：进 BACKLOG 新条目还是并入本批量票的第三分拣行？
4. 活契约面腾位后谁先入册——册外 13 中已判定同型的件（如 39:H6，审计已注「同 45-H5 型」）是否免复审直接入册？
