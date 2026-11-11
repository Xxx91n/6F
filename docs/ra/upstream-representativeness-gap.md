# 风险档案：GAP-REP-01（01 系冻结包在上游改版后代表性变弱）

> 形式：已接受风险档案（D-169-b② 要求写齐的五个栏目；D-182③ 缺口登记办法——决定已经做了，本档案是执行批记下）
> 状态：**已记入登记册**（五个栏目写齐；批准人=决定链 D-182，R49 评审 2026-09-30 采纳）
> 起草：2026-09-30 轮 50 T1-C 执行批（欠账三要素：负责=执行批／时点=本轮文书批／复核=五个栏目在场＋登记项确认行＋冻住的存档 sha256 没变）

## 1. 依据

- **主依据**：reports/R49-Q3-atomcode-research.md（证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/reports/R49-Q3-atomcode-research.md；atomcode 深入调研——benchmark deprecation 三阶段框架＋计量学 ILAC-G24/NCSLI RP-1/NIST GMP 11 重新校准双触发机制＋BNC/PMC 语料库快照含义＋in-toto/SLSA chain-of-custody 双轨）。
- **决定来源**：decision-ledger.md **D-182**（R49-Q3 冻结包代表性变弱，2026-09-30 交用户批并采纳）。
- **缺口条目**：docs/known-gaps.md `GAP-REP-01`（reason_code=upstream_representativeness_decay）。
- **实测证据**：01-extract.mjs extractIntent 条件复测上游 anysearch-cli intent=1（readme:h1）vs frozen 目标值=8；原因是上游 commit `bbb3ba73`（r69-t2 README 登录页结构改版——定位 bullets 段被删）；和 c6fe0f8 的变差读数是同一个特征；「这个变差没有认领任务」。
- **登记项**：registry `anysearch-cli-intent-drift-watch`（manual_watch，confirmations 里包含 decay-declared 最终行）。

## 2. 为什么接受

- **没有使用方**：现在没有 Macro-C/Macro-A 需要拿 anysearch-cli 上游代表性校对的结果——既然没有测量对象，重新校对就是白费功夫（D-182⑤ 明确驳回「立刻重新校对」的理由完全一样）。
- **行业先例**：ILAC-G24 / NCSLI RP-1 / NIST GMP 11 都只认两种合法的重新校准触发机制（按周期由负责人设定，或者运行中由事件触发）——**根本没有第三种「参照物一变就自动重测」**；到期日由仪器负责人定。
- **仓内同类做法**：参照仓两条 ADR 的 D5 重新校对依据=被测面变了，不是参照物变了。
- **冻住的存档不能动**：01 系五件=历史证据冻结类（D-171/D-172①），一个字节都不能动；代表性变弱=只改文字说明，不动文件本身。

## 3. 能检查的替代办法

- **标记继续看着**：registry `anysearch-cli-intent-drift-watch` 保持 pending/manual_watch——这次升级用 decay-declared 确认行落实 verify_method 里要先交用户看的条款，**不结案**（D-182④）；后续变差信号继续收集。
- **定期复查节奏**：审计窗顺带检查（next-audit-window）——登记项 status 重新核对＋frozen_evidence_packs 固定值机器检查＋intent-drift 读数继续记录。
- **冻住的存档完整性常驻机器检查**：01 系五件 sha256 固定在 known-red-manifest frozen_evidence_packs（完整性和代表性分开看——in-toto/SLSA 双轨同理）。
- **01-check D1/D5 自带断言全通过**：回归固定值含义不受代表性变弱影响（历史证据当时快照的意义依然成立）。

## 4. 谁批的

- **批准人=决定链 D-182**（R49 评审收尾批，用户原话「采纳」，2026-09-30）——决定已经做了，本档案=执行批按决定第③条记入登记册。
- 起草人=轮 50 T1-C 执行批 Agent；起草人≠批准人（D-169 取代 D-148② 五个栏目——批准人写决定链，不是起草 Agent）。

## 5. 到期日和复查点

- **到期形式**：wontfix 永久类事件触发机制（D-171）——接受=事实证据（当时快照的意义）不需要靠保留控制物来消除缺口本身。
- **事件复查点（真实需要时触发）**：下次真的需要消费上游代表性校对时（Macro-C/Macro-A 消费 anysearch-cli 场景任务）→**另立决定**做新校对包 v2（新建，而不是直接改动 frozen 产物，走 D-177 事前声明流程）。
- **低频定期检查点**：定期复查节奏（每审计窗顺带检查——登记项 status 重新核对＋「这个变差没有认领任务」说明复核）。
- **任一条件满足就复查**：真实需要先到→立刻另立决定；否则按审计窗节奏定期检查维持。**任一条件触发却没复查=档案失效**，要按五个栏目重新立项（D-169-b④）。

## 6. 登记结果

- 决定：**记入登记册**——上游代表性缺口在存续期间按已接受风险、五个栏目写齐处理（D-182③ 缺口登记——正式记账，不是藏起来）。
- 登记落实（本批办妥）：本档案＋registry `anysearch-cli-intent-drift-watch` confirmations decay-declared 行＋known-gaps GAP-REP-01 行＋记录 R50 执行批落实注记。
- S1 重新校准：先缓一缓，等实际需要驱动（D-182② 决定内容=缓一缓，不是永远不做）；触发时机同上。
- 冻住的存档字节零变动（D-172①）——本档案只负责说明，不碰 01 系五件。
