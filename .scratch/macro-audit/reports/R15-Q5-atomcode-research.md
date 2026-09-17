# R15-Q5 atomcode 深度调研报告 — 轮14余项清算（L1 分支处置＋L2 golden/verifier 解耦）

> 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R15-Q5-research-prompt.md
> 时点 2026-09-17；通道 ctx_batch_execute（label=atomcode-r15q5）；14 来源（Jest 官方/IntuitionLabs FDA/SRE Workbook/minware quarantine/SLSA v1.0/Cloudsmith/google golden.go/Datadog/Trunk 等）。
> 冲突协议结果：**零 revised；两处附带纪律（①留档分支视同冻结只读＋ledger 记分支名与 HEAD SHA；②五要素填全是 manual_watch 成立的硬前提）。**

## §1 执行摘要

① **(b) 审计件留档分支口径登记，置信高**——合规惯例=证据归集中式不可篡改证据仓（eQMS/artifact store），Git 主干只留 commit 指针交叉引用（IntuitionLabs FDA/IEC 62304）；SLSA provenance=附着于 artifact 的 attestation 独立分发，git commit 仅作 resolvedDependencies 指针——「reproducible evidence=工件＋指针」不需证据进源码树。与 D-038 双通道、D-060「不随 tgz 分发」自洽。② **(b) manual_watch 观察项（脏树复现≥3 次→立票），置信中高**——SRE toil 口径（量化→按频率/ROI 升级）＋flaky-test quarantine 实践（5%/N-of-M 阈值）支持「条件式判据＋显式阈值」优先于立即立票；且 L2 真解=守卫脚本旗标化（小改非解耦工程）。

## §2 分点结论

**Q1 审计件归宿**：证据通行归宿=集中式带保留期不可篡改证据仓，eQMS 记录引用 Git commit ID 交叉溯源而非证据合主干；**已作为证据的分支禁止改写历史**（留档分支=冻结只读非活跃开发面）；SLSA：attestation 独立分发、commit 仅指针；git-for-windows SLSA audit 案例：审计件=归档物非交付物。对照本仓：.scratch=调研审计档案面，不合 main 与现行决策同构且免产品仓 diff 信噪污染。

**Q2 golden/verifier 工业答案**：**Jest 官方样板**——`--ci` 永不写 snapshot（缺即 fail）、本地显式 `--updateSnapshot` 才重写、snapshot 当代码审须进版本控制；**google/golden**——默认只读比对＋unified diff、`-update_golden` 显式覆写＋golden 变更进 review；**Go 惯例** UPDATE_GOLDEN 环境变量。**三件套=先比后写、写需旗标、diff 人审**；本仓 A-050 gen-demo-golden＋R2-9 gen-manifests「先比后写」已是同款实践。工件出仓 artifact store（digest 留档）是更重一档。→ L2 真解=**给 NN-check 守卫脚本加显式 --update/--write 旗标、默认只读比对**，属一次性小修补非解耦工程——支持观察项而非立票。

**Q3 N 次立票判据**：无统一心智常数；SRE toil（manual/repetitive/automatable＋50% 上限＋ROI 排序）＋flaky quarantine（5% 失败率/N-of-M/Datadog 30 天时限）支持显式阈值升级；≥3 次与业界粒度一致；**五要素缺项→manual_watch 退化为「隐性人工盯」anti-pattern（本仓词表明禁）**——若登记时填不全五要素（尤其责任人），退回 ②(a) 立票。

## §3 对比矩阵

①(a) 合 main：证据随代码可见但进产品交付面与 D-060 相抵＋报告时点快照被误读为现行结论｜①**(b) 留档登记（荐）**：分支即冻结档案零污染，ledger 记分支名＋HEAD SHA 防遗忘误删｜①(c) 缓挂：欠账违留痕纪律最差。
②(a) 立票：单次现象立票高于业界阈值惯例，低频项坟场风险｜②**(b) manual_watch（荐）**：显式阈值≥3 次升级，五要素填全是硬前提｜②(c) 并入 D-059⑨：异构触发器捆绑稀释可审计性。

## §4 落盘要素清单

①(b)：CONTEXT 或 handoff 登记「审计件=分支留档口径」一行＋decision-ledger 记分支名 r14-audit-findings＋HEAD SHA＋「冻结只读禁改写历史」句。②(b)：registry 新 manual_watch 项（标记=golden-verifier-dirty-on-rerun＋责任人=macro-audit 队列值守＋复审时点=脏树第3次复现或 Macro-B GA 先到者＋验证方法=守卫重跑后 git status 脏面统计＋留痕=confirmations 数组）；附注「若升级立票，修法=NN-check 族加 --update/--write 旗标默认只读比对（A-050 模式推广）非解耦工程」。

## §5 失败模式

①(a) 报告进 main 被误读为现行结论＋分发面再裁剪；①(b) 分支遗忘/误删（缓解=ledger 记 SHA）＋重写历史证据链断裂；②(a) 单次即立票→噪音坟场；②(b) 五要素缺→隐性人工盯；②(c) 触发器耦合连带清缺口。

## §6 冲突排查

D-038 ✅（①(b) 强化双通道）／D-060 ✅ 直接支持（审计件与 39/40 同类=仓内档案不进 tgz）／D-041 Watch Tri-state ✅但设硬前提（五要素填全否则退回立票）／D-059⑨ ✅但 ②(c) 不建议（退役触发 vs 解耦观察异构）／D-037/A-050 ✅ 方向一致（旗标化=既有模式推广）／push 闸门=约束（①(a) 本轮只能登记意向，与①(b)不矛盾）。**零 revised；附带修正=②(b) 五要素填不全则退回②(a)。**

## §7 信息缺口

「本仓 .scratch 是否已在 npm files 白名单外」未单独核验（D-038/D-060 口径隐含）；责任人字段取值按本仓惯例「macro-audit 队列值守」。

**一句话裁定**：①(b)——r14-audit-findings 登记为冻结只读审计档案分支（ledger 记 SHA）；②(b)——golden/verifier 脏树 manual_watch（≥3 次→立票，届时修法=守卫旗标化非解耦）。
