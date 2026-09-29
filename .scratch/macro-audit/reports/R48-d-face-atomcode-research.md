# R48 (d) 面三件候选 atomcode 调研存档（D-178 物化补落）

> 物化说明：本文件由 ctx 检索源 `atomcode-d-face-research`（batch 同名，会话 2026-09-29 08:59）原位物化——
> D-178③「atomcode 调研件=Git 持久工件硬要求」义务兑现：ctx 索引=检索层非等价持久证据（D-178①）。
> 调研呈裁时点=轮48（R48 grill 收口节 D-177~179 同窗）；物化补落时点=轮49 T1 执行批（本文件 commit）。

## 调研输入（题面）

在仓库 D:/Aworker/6F 中评估等待期 (d) 面三件具体维护候选件是否应批准动工，逐件给推荐（建/缓建/不建/形态选项）与理由：

- ① d-33check-enum-assert——守卫 .scratch/architecture-recovery/reports/33-check.mjs 增「window_state ∈ window_state_enum」值域断言＋可选跨字段断言（window_state=running/satisfied_at 态须 window.start_event 已注册流转合法边）；约束：探测面变更须走 D-147 预声明验证包工序。
- ② d-guard-perf-baseline——守卫组 60 件 wall-time 性能基线建制；约束：D-175③ 禁开新状态文件（基线须承载于既有面，如报告 footer/确认行/runner 呈现层）。
- ③ d-frozen-pack-recheck——frozen_evidence_packs 代表性巡检制度化；现状钉值机检已有 01-check.mjs F 组逐件 sha256 钉值一致＋75a-check M5 schema 钉。

**Sufficiency Gate**：searches: 6（web_search×4〔Official/Criticism/Comparative/Currency/Community 角度混合〕＋tavily×1＋anysearch×1）| angles: Official／Criticism／Comparative／Community／Currency | full reads: 8 处联网原文（KEP-5241 页+issue、release_phases.md、criterion CLI 档+FAQ、Stryker 配置档、pythonspeed 基准噪声文、GitHub 限流最佳实践）＋本地 9 文件（账本 D-053~D-175、ADR-0022/0024、33-check/01-check/75a-check/guard-all-run/CONTEXT 词条/registry 记载）| gaps：GitLab 性能门禁官方页 403（以 criterion FAQ/pythonspeed 双源替代）；MSF quiet period 未能读原文；KEP-5241「Test Freeze 期内新增守卫类工作」无逐字先例（用 Test Freeze 语义外推，标中置信）。

## 执行摘要

**① d-33check-enum-assert：建（含可选跨字段断言一并建，但走 D-147 预声明验证包工序）**；**② d-guard-perf-baseline：缓建（形态选型若将来做＝报告 footer 派生行，非现在）**；**③ d-frozen-pack-recheck：建，形态选 T3 哨兵普查节律行，不建 registry manual_watch 常驻册项**。三件与账本 current 决策均有同向支撑、无一处需要 revised；与 D-175 的「禁开新状态文件」「主体面=深度非广度」约束逐件核验合规。Confidence：①高（D-174 直接立法背书＋K8s 校验面惯例双源）；②高（外部惯例一致反对无噪声基线的 wall-time 硬门，本地无消费面拉动）；③中高（先例同构成立，但「定期复检 frozen 包」无逐字工业标准，属外推）。

## 逐件裁定

### ① d-33check-enum-assert —— 守卫 33-check 增 window_state 值域断言

**推荐：建。可选跨字段断言（window_state=running/satisfied_at 态须 window.start_event 已注册且流转合法边）一并建，必须随批走 D-147 预声明验证包工序。**

理由：
- **本仓立法已在案**：D-174①④ 明文「补 window_state_enum ＋可选跨字段断言＝执行窗义务」，且跨字段断言「若做归 33-check 且随批走 D-147 预声明验证包工序」——本件不是新决策，是 D-174 已立义务的兑现路径呈裁。R48-T1-A 已落枚举键本体（`window_state_enum:["not_started","running","satisfied_at"]`），只剩校验面半边未接。
- **外部惯例同向**：K8s feature-gate 体系的核心纪律是「字段状态机的行为面要有机检守护、且守护面变更须预声明」（KEP-5241 的 Graduation Criteria/PRR 机制即「先声明判据再放行变更」心智模型；k8s release_phases 的 Test Freeze 语义＝冻结期内允许的恰是 fix/revert failing tests 类守护面维修，即 D-175 等待期词条「对冻结资产做深度非广度维护强化」的精确同构）。给新落地的枚举键补值域断言，属「为已冻结资产补守护」而非「扩面」。
- **形态核验**：33-check 现行断言面（D2 五要素 22 项／D6 确认行 111 条）已消费 stage2-launch-criteria 项；window_state_enum 是该容器的 sibling-of-field，校验面补一条「window_state ∈ enum」属同容器对账补齐，零新状态文件、零新机制，与 D-175③ 合。
- **可选跨字段断言值得做的原因**：状态机不合法边（如 window_state=running 而 start_event 从未注册）正是 33-check D 组五要素断言抓不到的缝——机读枚举落了、流转校验没落，是「枚举覆盖不对称」欠账的最后一半（D-174① 立法原文点名）。K8s conformance 思想＝「合法状态集合可机检」，此断言即本仓的 conformance 检。
- **硬约束履行**：探测面（守卫脚本）变更走 D-147 预声明验证包——题面自带此约束，与 R46-impl「新字段形态不破既有校验面——破则同窗校验面同步扩」的先例处理方式一致，零冲突。

**与 current 决策冲突**：无。D-174 同向立法；D-175②/③ 合（不动状态文件、属冻结资产深度强化）；D-159/D-164（tier/env-contract 面）不受影响。

### ② d-guard-perf-baseline —— 守卫组 60 件 wall-time 性能基线建制

**推荐：缓建（deferred，挂观察触发器）。若将来解封，形态唯一合法选项＝报告 footer 派生展示行（guard-all-run 呈现层），禁新状态文件——D-175③ 已锁死，且这恰好与外部惯例一致。**

理由：
- **外部惯例一致反对本仓现在做 wall-time 硬基线**：criterion 官方 FAQ 逐字警告「cloud CI providers introduce a great deal of noise…benchmarks that detect performance regressions should not cause the build to fail」——CI 共享环境 wall-time 噪声 ~1.5%+ 跨机更大（pythonspeed 实测）；Stryker「先读数分布后阈值」棘轮惯例（katabench「set the first break threshold just below the reviewed baseline」）——无读数分布不设门。本仓零观测数据零消费面，噪声/缺读数双重不利，硬基线=随机红噪声污染源。
- **辩证点**：D-175 等待期词条把「性能基线」点名为合法主体面——但这只授权「维护强化」这个类目，不构成每件候选的立项依据；词条自己同时写了主体面的限定语「深度非广度」与「禁借机开新 API/新状态文件」。把「性能基线」读成无条件义务＝过度读取，本裁按词条全文裁定。

**与 current 决策冲突**：无。D-175③（约束本身）与本裁同向；D-167-b（footer 派生展示语＝可选 polish 非义务）先例直接覆盖形态；与 D-024/D-031 的「无实测信号不建制」一致。**注意一处张力（非冲突）**：D-175② 将性能基点名列为主体面候选——本裁「缓建」是对类目授权下的件级筛选，属 D-175④⑦「本裁立法不立件——枚举呈裁量位」明文预留的裁量空间，不是改向。

### ③ d-frozen-pack-recheck —— frozen_evidence_packs 代表性巡检制度化

**推荐：建。形态选 T3 哨兵普查节律行（挂在既有 next-audit-window/审计窗点火检查义务上），不建 registry manual_watch 新册项。**

理由：
- **现状盘点（实物核验）**：机检腿已相当密——01-check F 组（F1 豁免节在位＋F1b 覆盖恰五件＋F2 逐件 sha256 钉值一致）＋75a-check M5（frozen_evidence_packs schema 立法要素＋64hex-sha256/bytes 非零钉值形态）。这两条**常驻断言已经覆盖了「完整性」**（字节没被改）。缺口只剩**「代表性」**——内容仍是否当初冻结时的语义代表物（上游漂移坐实→代表性衰减），这是机检判据覆盖不了的语义面，与 R45-T1-E anysearch-cli-intent-drift-watch 观察项自认的边界一致（「上游永久演进坐实→冻结包代表性衰减声明随观察项」）。
- **外部惯例对照**：供应链证据包惯例（in-toto/DSSE/SLSA 形态）的核心是**验证计划须周期执行**（StellaOps attestation contract：「Recompute sha256 for every manifest entry…Emit verification report」＋「freshness: reject bundles older than attestation.max_age_days（tenant policy）」——完整性重算＝常驻机检〔本仓已有 F/M5〕，**时效性/代表性巡查＝tenant policy 周期判据**，不是常驻断言）。chain-of-custody 惯例同理：封条完整性每次查、**内容代表性定期盘查**。SoC/审计的观察窗盘点走节律（本仓 T3 已是此节律）——两支惯例都指向「节律巡查」而非「新常驻机件」。
- **两形态裁定**：
  - **registry manual_watch 册项**——本仓 manual_watch 五要件含具名 owner＋复审时点＋验证方法，本可承载；但 frozen 01 系五件的上游漂移观察**已经有主**：anysearch-cli-intent-drift-watch（R45-T1-E，family=upstream-drift）在册值守，GAP-B2B 八件重审走 batch2beta-techdebt-review。再开一项＝同一观察面双册（双源），违 D-173「不另立通则防双源」同一防重纪律的精神。仅当未来出现**第二个 frozen 包**时，单包观察项覆盖不足，才值得升格为 per-pack 册项——此为将来触发器，不是现在。
  - **T3 哨兵普查节律行**——零新机制：next-audit-window 机读锚已在册（D-155），T3 值守读数已有「batch2beta-techdebt-review＝八件重审读数」的既有节律形态（R44/R45 两轮实证跑通）。加一行「frozen_evidence_packs 代表性复审：上游 intent/corpus 漂移信号复读＋代表性衰减声明有无」即完成制度化，且天然落 D-172④ 观察项读数载体。

**与 current 决策冲突**：无。形态裁定沿既有 T3 节律先例；D-172② 准则留待第二包出现时再逐类判定豁免面。

## 对比矩阵

| 件 | 推荐 | 形态 | 载体 | 立即动工？ | 关键依据（本仓＋外部） |
|---|---|---|---|---|---|
| ① enum-assert | 建 | 33-check 新增值域断言＋跨字段流转合法边断言 | 既有 33-check D 组面 | 是（随 D-147 预声明验证包批） | D-174①④ 立法在案；K8s conformance/KEP-5241 预声明判据惯例 |
| ② perf-baseline | 缓建 | （解封时）报告 footer 派生耗时行 | guard-all-run 呈现层（禁状态文件，D-175③） | 否——挂观察触发器（守卫耗时进关键路径实测信号 / CI 超时复发） | criterion FAQ 噪声警告＋pythonspeed 噪声实测＋Stryker「先读数分布后阈值」；本仓零观测数据零消费面 |
| ③ frozen-recheck | 建 | T3 哨兵普查节律行（非 manual_watch 册项） | next-audit-window 锚＋T3 值守读数既有节律 | 是（下轮 T3 窗即行，零新机制） | attestation 验证计划/时效 policy 惯例；chain-of-custody 周期盘查；D-172④ 观察项读数载体；防双册（intent-drift-watch 在册） |

## 冲突清单（辩证性要求）

三件均**无一处与 current 决策正面冲突，零 revised**。两处张力如实呈报：
1. **D-175② 授权面张力**（②件）：等待期词条点名「性能基线」为主体面合法类目，本裁却判缓建——消解依据＝D-175④⑦「本裁立法不立件，枚举呈裁量位」明文预留件级裁量权；词条授权类目≠强制立项，且词条自身限定语（深度非广度/禁新状态文件）支持缓建读法。非改向，呈用户裁量确认。
2. **D-057② manual_watch 纪律张力**（③件）：本裁拒绝 manual_watch 形态——消解依据＝D-057② 的观察项纪律已在 intent-drift-watch 上满员履行，本裁防的是双册双源（D-173 同族纪律），非拒绝登记。

## 信息缺口

1. GitLab/Buildkite 性能门禁官方文档 403 未读——但 criterion FAQ＋pythonspeed 双独立源已覆盖同一结论（CI 上 wall-time 门禁须防噪声），该缺口不影响②的置信。
2. MSF quiet period 原文未核验（R46 调研已标同一缺口）——静默窗与冻结期合法工作面的外推依赖 K8s release_phases 单一权威源，属「权威源唯一但语义清晰」形态。
3. 「frozen 包代表性周期复审」无逐字工业标准——由 attestation freshness policy＋chain-of-custody 周期盘查两个邻域汇聚外推，置信中高。
4. ②若将来解封，阈值具体数值须以那时实跑读数分布为准（本次不预拍数值——正是缓建的理由本身）。

## 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| KEP-5241: Beta Feature Gate Promotion Requirements | https://www.kubernetes.dev/resources/keps/5241/ | Official | 预声明判据/PRR/两周静默窗心智模型（①③） |
| KEP-5241 issue #5241 | https://github.com/kubernetes/enhancements/issues/5241 | Official | 提升需求原文（①） |
| Kubernetes release_phases.md（Burndown/Test Freeze/Exception） | https://github.com/kubernetes/sig-release/blob/HEAD/releases/release_phases.md | Official（已全文读） | Test Freeze 期合法工作面＝fix failing tests＝本仓等待期词条同构（三件） |
| Criterion.rs Command-Line Options | https://bheisler.github.io/criterion.rs/book/user_guide/command_line_options.html | Official（已全文读） | 基线 save/compare 机制（②形态） |
| Criterion.rs FAQ（CI 惯例） | https://docs.rs/crate/criterion/0.2.7/source/book/src/faq.md | Official/Criticism | 「CI 基准不应致 build fail，表面回归须人工复核」逐字（②核心否决依据） |
| Reliable benchmarking in noisy environments | https://pythonspeed.com/articles/consistent-benchmarking-in-ci/ | Criticism/Community（已全文读） | CI 共享环境 wall-time 噪声 ~1.5%+ 跨机更大（②） |
| Stryker.NET Configuration（thresholds/baseline） | https://stryker-mutator.io/docs/stryker-net/configuration/ | Official（已全文读） | break 阈值须在 reviewed baseline 之下棘轮——无读数分布不设门（②） |
| Stryker baseline 惯例社区文 | https://katabench.com/blog/mutation-testing-csharp | Community | 「set the first break threshold just below the reviewed baseline. Ratchet it upward」（②） |
| StellaOps Evidence Locker Attestation Contract v1 | https://stella-ops.org/docs/modules/evidence-locker/attestation-contract/ | Official | 证据包验证计划＝周期重算＋freshness policy 判据（③） |
| GitHub REST API best practices（rate limit） | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | Official（已全文读） | 限流退避惯例（D-048⑤ 呼应） |

## 回执

- 用户终裁（2026-09-29 采纳）：①建（已随 R48-impl 批兑现在 33-check J1/J2）＋③建（T3 节律行形态，next-round.md T3 增代表性复审值守行）＋②缓建（观察触发器在案）。
- 本文件为持久证据位（D-178③）：证据强度=persistent-git-artifact；引用锚=本路径（commit trailer Ledger-Refs 引 D-178 行）。
