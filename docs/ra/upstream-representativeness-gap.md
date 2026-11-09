# 风险档案：GAP-REP-01（01 系冻结包的上游代表性衰减）

> 形式：已接受风险档案（D-169-b② 五要素；D-182③ 缺口合法化路径——决定已经做了，本档是执行批登记）
> 状态：**登记落册**（五要素齐全；拍板人=决定链 D-182，R49 grill 2026-09-30 采纳）
> 起草：2026-09-30 轮 50 T1-C 执行窗（欠账三要素：负责=执行批／时点=本轮文书批／复核=五要素在场＋册项确认行＋冻结件 sha256 没变）

## 1. 依据

- **主依据**：reports/R49-Q3-atomcode-research.md（证据档已随治理工件退役，git 历史可查原路径 .scratch/macro-audit/reports/R49-Q3-atomcode-research.md；atomcode 深调研——benchmark deprecation 三阶段框架＋计量学 ILAC-G24/NCSLI RP-1/NIST GMP 11 重校对双触发制＋BNC/PMC 语料库快照语义＋in-toto/SLSA chain-of-custody 双轨）。
- **决定锚**：decision-ledger.md **D-182**（R49-Q3 冻结包代表性衰减送审，2026-09-30 采纳）。
- **缺口条目**：docs/known-gaps.md `GAP-REP-01`（reason_code=upstream_representativeness_decay）。
- **实测证据**：01-extract.mjs extractIntent 谓词复测上游 anysearch-cli intent=1（readme:h1）vs frozen 锚=8；原因是上游 commit `bbb3ba73`（r69-t2 README 登录页信息架构重构——定位 bullets 段被删）；和 c6fe0f8 的变差读数同一个签名；「这个变差没有认领票」。
- **册项**：registry `anysearch-cli-intent-drift-watch`（manual_watch，confirmations 含 decay-declared 终态行）。

## 2. 为什么接受

- **没有使用方**：现在没有 Macro-C/Macro-A 消费 anysearch-cli 上游代表性校对的需求——没有测量对象，重新校对就是纯走流程（D-182⑤ 明确驳回「立刻重新校对」的理由相同）。
- **计量学先例**：ILAC-G24 / NCSLI RP-1 / NIST GMP 11 都只认两条合法重校对触发（周期制 owner 设定 / event-driven in-service）——**没有第三种「参照物一变就自动重测」**；到期日由仪器主人定。
- **仓内同类**：参照仓两条 ADR 的 D5 重校对锚=被测面变了，不是参照物变了。
- **冻结件不能动**：01 系五件=历史证据冻结类（D-171/D-172①），字节零动；代表性衰减=只处理说明，不动工件。

## 3. 能检查的补偿控制

- **标记继续看**：registry `anysearch-cli-intent-drift-watch` 保持 pending/manual_watch——这次升级用 decay-declared 确认行落实 verify_method 送审条款，**不结项**（D-182④）；后续变差信号继续收。
- **T3 普查节奏**：审计窗随读（next-audit-window）——册项 status 重审＋frozen_evidence_packs 固定值机器检查＋intent-drift 读数续录。
- **冻结件完整性常驻机器检查**：01 系五件 sha256 固定在 known-red-manifest frozen_evidence_packs（完整性和代表性分开看——in-toto/SLSA 双轨同构）。
- **01-check D1/D5 自带断言全绿**：回归固定值语义不受代表性衰减影响（历史证据 as-of 快照语义成立）。

## 4. 谁批的

- **拍板人=决定链 D-182**（R49 grill 收尾批，用户原话「采纳」，2026-09-30）——决定已经做了，本档=执行批按决定第③条登记落册。
- 起草人=轮 50 T1-C 执行批 Agent；起草人≠批准人（D-169 取代 D-148② 五要素——拍板人写决定链，不是起草 Agent）。

## 5. 到期日和复查钩

- **到期形态**：wontfix 恒久类事件制双条件（D-171）——接受=事实判据（as-of 快照语义）不依赖存续控制物来消解缺口本身。
- **事件复查钩（消费触发锚）**：下次真的需要消费上游代表性校对时（Macro-C/Macro-A 消费 anysearch-cli 锚场景票）→**另立决定**做新校对包 v2（新建，不是 frozen 突变，走 D-177 事前声明工序）。
- **低频盘查钩**：T3 普查节奏（每审计窗随读——册项 status 重审＋「这个变差没有认领票」标注复核）。
- **双条件满足就复查**：消费触发先到→立刻另立决定；否则按审计窗节奏盘查维持。**任一条件触发却没复查=档案失效**，要按五要素重新立项（D-169-b④）。

## 6. 登记结果

- 决定：**登记落册**——上游代表性缺口存续期按已接受风险五要素齐全封掉（D-182③ 缺口合法化——正式记账，不是藏起来）。
- 落册（本批落实）：本档案＋registry `anysearch-cli-intent-drift-watch` confirmations decay-declared 行＋known-gaps GAP-REP-01 行＋记录 R50 执行窗落实注记。
- S1 重新校对：缓行，等消费拉动（D-182② 决定内容=缓行，不是永远不做）；触发锚同上。
- 冻结件字节零动（D-172①）——本档只处理说明，不碰 01 系五件。
