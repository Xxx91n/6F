# R45-Q2 atomcode 调研存档（轮45 grill Q2，2026-09-29）

> 题面存档：R45-Q2-research-prompt.md；ctx_batch_execute 单发（concurrency:1）。以下为 atomcode stdout 原文节录（索引节重排，未改写结论）。

## 1) 执行摘要（Tl;dr）

**推荐 (iv)，并把它视为 (ii) 的严格化版本**。成熟工业界的共识是：golden/baseline/evidence 类工件与可再生输出**必须生命周期分流**——golden 的更新只能由"有意图的行为变更"经人审触发（Jest 官方、golden-test 惯例双源确认），批量再生成扫入证据包本身就是治理缺陷；修复手段是**恢复钉死的历史快照 + 立法豁免**（对应 Jest「CI 永不自动写 snapshot」的设计），而把上游退化事实作为**有属主、有期限的观察项**移交，正符合 flaky/quarantine 治理中「无属主条目即坟场」的铁律。路径 (i) 用不存在的票当 review_anchor 不合格；(iii) 全量重建会抹掉与历史验证跑的连续性，把"测量有效性校准实验的证据"变成另一场实验，答非所问。**Confidence：高**——四问均有 ≥2 独立信源支撑，属成熟惯例而非冷门判断。

## 2) 分点结论

**① frozen 证据 vs 可再生工件应否分流？——应，且这是第一性设计原则。**
- Jest 官方文档：snapshot 工件"应与代码变更一起提交、纳入 code review"；Jest 20 起明确**CI 环境默认拒绝写新 snapshot**，新工件自动通过测试等于零信号（jestjs/jest PR #3456 + 官方 docs，两源）。
- staff-engineer 测试数据治理模板把 fixture 分为 hand-built / synthetic / captured / derived golden / shared seeded state 五类，各类 freshness-vs-determinism 策略不同，并明言"**未经 review 的 golden 再生成会抹掉测试的信号**"（sirmarkz/staff-engineer-mode）。
- golden-file 实践文：CI 中"never allow golden updates"，更新必须本地跑、diff 入 PR 人审（application-architect 摘要 + desertthunder golden-tests 原文交叉）。
- → 五件工件（corpora/align/spotcheck/fallback/report 互认）本质是**一次校准实验的 evidence pack**，属"captured/derived golden"类，天然不可再生——报告里的 F1=0.8182 是那次跑的观测值，不是可推导公式。分流立法（豁免清单/目录标记）是行业标准做法。

**② 「证据工件被机械再生误伤」的成熟处置惯例？——三步：恢复、立法、归因。**
- 恢复：字节级从 git 历史恢复 blob 是 golden 治理的标准动作——golden 的价值就在于"钉死某次被批准的输出"。
- 立法：把"再生成批不得扫入冻结包"写进守卫（机器可查的路径豁免），对应 Jest 的 `--ci` 语义与"cleanup probe 与 verification 分离"原则——再生成可以跑，但产物走独立一次性 job、产出 diff 供人审、**永不自动提交**。
- 归因：误伤根因是"再生成批缺少 golden 感知"，应作为流程缺陷登记，而不是只修数据。

**③ revert/re-pin vs 全量再生的取舍判据？——看工件的语义是「历史证据」还是「当前行为断言」。**
- 若工件的存在意义是**证明某次实验/验证跑的有效性**（本场景：报告钉死固定数字、守卫做互认），则其正确性判据是**与历史跑的一致性**——再生即失义。恢复历史快照是唯一保义操作。
- 若工件是**当前行为快照**（如 CLI 输出、序列化格式），则可再生成，且应在有意图变更时经人审更新。
- staff-engineer 模板判据同构："derived goldens 在行为有意图变更时走再生成程序；pinned corpus 允许 freshness policy 暂停并写明理由"——本场景命中后者例外条款。
- (iii) 的额外代价：新包 + 新报告会与既有 known-red 台账、历史验证连续性断裂，且此刻上游源已退化（9→1），再生出来的包是**在退化源上测量的**——用坏标尺校准标尺。

**④ review_anchor 绑定无属主事件是否合格？——不合格。**
- flaky 治理共识（edilec 长文 + flakyguard + qaskills 三源一致）："quarantine without ownership is just a graveyard"；合格条目必须具备 **owner + issue 链接 + 理由 + 到期日**，机器可校验，到期 escalate 而非静默续期。
- 路径 (i) 的触发器"上游重采样票"**实际不存在于任何队列**——等价于"issue links that no longer resolve"反模式，连 quarantined 条目的最低门槛都不到，只能等 fallback 自然到期，属把漂移债务伪装成待办。
- 正确做法即 (iv)：不代兄弟仓排产，但把"采样意图单元 9→1"作为**观察项**记入台账，注明属主缺失事实本身（"该退化无认领票"），这比 (ii) 纯静默恢复多一层跨仓可见性，也避免本仓守卫变成兄弟仓退化的事实上监控器。

## 3) 候选对比矩阵

| 路径 | 守卫复绿 | 证据保真（与历史跑连续） | 跨仓责任处理 | 主要风险 |
|---|---|---|---|---|
| (i) 等无属主票 | ❌ 红至年末 fallback | 保真（不动） | 无处置 | 锚点不合格、债务静默化、fallback 到期时同样要面对 (ii)/(iii) 的选择 |
| (ii) 冻结重钉 | ✅ | ✅ 字节级一致 | 不涉及 | 若只重钉不立法，下次再生成批会**再次误伤**（复发风险）；上游退化不可见 |
| (iii) 全量重建 | ✅ | ❌ 连续性断裂，且在退化源上测量 | 隐式吞下退化（新数字带病转正） | 把"有效性校准"偷换成"另一场实验"；报告历史互认全弃；退化期数据转正 |
| (iv) (ii)+观察项移交 | ✅ | ✅ | ✅ 显式、不代裁 | 立法维护成本（豁免清单需随目录演进）；若上游长期不修复，冻结包会渐失代表性——需配观察期条款 |

## 4) 完整来源清单

1. Jest 官方 Snapshot Testing 文档 — github.com/jestjs/jest docs/SnapshotTesting.md（Official；原文已读）— snapshot 必须提交+人审；`-u` 前须先修复非意图 bug。
2. Jest CLI `--ci` 文档 + PR #3456 — jestjs.io/docs/cli＋github.com/facebook/jest/pull/3456（Official；摘要级）— CI 默认拒绝写新 snapshot 设计先例。
3. Golden Tests (Owais) — garden.desertthunder.dev/engineering/general/golden-tests/（Community/blog；原文已读）— golden = "approved artifact"，更新走 review-diff-approve 循环。
4. Application Architect: Golden File Testing — application-architect.com/posts/golden-file-testing-output-comparison/（Comparative；fetch 失败，仅摘要级，已声明）— "never allow golden updates in CI"。
5. staff-engineer-mode: test-data-engineering — github.com/sirmarkz/staff-engineer-mode（Community/方法论；原文已读）— fixture 五分类、"goldens regenerated without review erase the test's signal"、pinned corpus 允许 freshness 暂停、第三方输出 pin 属主语义。
6. Edilec: Flaky Test Quarantine With Ownership, Expiry, and Recovery — edilec.com（Criticism/规范；原文已读）— 无属主/无到期 quarantine = 坟场；条目须 owner+issue+expiry；过期须 escalate 不许静默延期。
7. FlakyGuard: How to Quarantine Flaky Tests — flakyguard.com（Criticism；原文已读）— "Quarantine without ownership is just a graveyard" 反模式清单。
8. qaskills: flaky-test-quarantine skill — qaskills.sh（Community；摘要级）— 每个 quarantined 测试须 assignee + tracking ticket。

## 5) 信息缺口（如实标注）

- 大厂（Google/Meta 级）内部 "evidence pack" 类工件的公开治理细则没有一手材料，以上均为可公开惯例的等价物。
- application-architect 原文因证书问题未读，其独有细节未纳入。
- 豁免清单机器校验的具体形态（路径标记 vs 目录约定 vs manifest）属实施细节，需结合本仓守卫结构落地。

## 6) atomcode 收口建议原文

执行 (iv)——git show 恢复五件工件的退化前 blob → 守卫复绿验证 → 立法"冻结证据包 + 豁免路径"（机器可查）→ 兄弟仓退化事实（9→1、无属主票）入观察台账并显式标注"本仓不代裁排产"。known-red 条目在复绿后以"已消解（冻结重钉 + 立法）"结案，保留误伤事件本身作为流程缺陷记录。

## 7) 辩证比对注记（呈报侧）

- 调研确认 (iv)=首选置信高；带出三处超题面精化：①立法须机器可查形态（非纯注记）；②根因=「regen 批缺 golden 感知」流程缺陷须登记非仅修数据；③(iv) 自身风险=冻结包代表性渐失须配观察期条款。
- 冲突面：零 revised——kr-01 的 manifest 生命周期自带「复绿→strict 告警→人工摘除」出口，重钉复绿即走该正轨非改向；review_anchor 的「上游票」腿被调研判不合格锚点（无属主事件），锚点字段修正属册件字段级处置非账本裁面。
