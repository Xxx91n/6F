# RA 档案 —— GAP-REP-01（01 系冻结包上游代表性衰减缺口）

> 形态：Accepted-Risk 呈批档案（D-169-b② 五要件标准形；D-182③ 缺口合法化路径——裁定已发生，本档=执行批注册落盘）
> 状态：**注册落盘**（accepted-risk 五要件齐备；具名裁者=裁定链 D-182，R49 grill 采纳 2026-09-30）
> 起草：2026-09-30 轮 50 T1-C 执行窗（欠账三要素：owner=执行批／时点锚=本轮文书批／复验=五要件在场＋册项确认行＋冻结件 sha256 未变）

## 1. 判据引用

- **主判据**：reports/R49-Q3-atomcode-research.md（atomcode 深调研——benchmark deprecation 三阶段框架＋计量学 ILAC-G24/NCSLI RP-1/NIST GMP 11 重校准双触发制＋BNC/PMC 语料库快照语义＋in-toto/SLSA chain-of-custody 双轨）。
- **裁定锚**：decision-ledger.md **D-182**（R49-Q3 冻结包代表性衰减呈裁，采纳 2026-09-30）。
- **缺口条目**：docs/known-gaps.md `GAP-REP-01`（reason_code=upstream_representativeness_decay）。
- **实测证据**：01-extract.mjs extractIntent 谓词复测上游 anysearch-cli intent=1（readme:h1）vs frozen 锚=8；归因上游 commit `bbb3ba73`（r69-t2 README 登录页 IA 重构——定位 bullets 段消除）；与 c6fe0f8 退化读数同签名；「该退化无认领票」。
- **册项**：registry `anysearch-cli-intent-drift-watch`（manual_watch，confirmations 含 decay-declared 终态行）。

## 2. justification（不修理由）

- **无消费者**：当前无 Macro-C/Macro-A 消费 anysearch-cli 上游代表性校准的测量需求——重校准无测量对象，属纯裁定税（D-182⑤ 显式驳回立即重校准的同源理由）。
- **计量学先例**：ILAC-G24 / NCSLI RP-1 / NIST GMP 11 钉死重校准仅两条合法触发制（周期制 owner 设定 / event-driven in-service）——**无第三种「参照物演进自动重测」**；due date is set by the instrument owner。
- **仓内同构**：ADR-0036/0038 D5 重校准锚=被测面变更非参照物漂移。
- **冻结件不可动**：01 系五件=历史证据冻结类（D-171/D-172①），字节零动；代表性衰减=声明面处置非工件处置。

## 3. 可验证补偿控制

- **哨兵续看**：registry `anysearch-cli-intent-drift-watch` 保持 pending/manual_watch——本次升级以 decay-declared 确认行兑现 verify_method 呈裁条款**不销项**（D-182④）；后续漂移信号继续收录。
- **T3 普查节律**：审计窗随读（next-audit-window）——册项 status 重审＋frozen_evidence_packs 钉值机检＋intent-drift 读数续录。
- **冻结件完整性常驻机检**：01 系五件 sha256 钉 known-red-manifest frozen_evidence_packs（完整性命题与代表性命题分轨——in-toto/SLSA 双轨同构）。
- **01-check D1/D5 自含断言全绿**：回归钉值语义不受代表性衰减影响（历史证据 as-of 快照语义成立）。

## 4. 具名裁者

- **裁者=裁定链 D-182**（R49 grill 收口批，用户原话「采纳」，2026-09-30）——立法裁决已发生，本档=执行批按裁条③注册落盘。
- 起草人=轮 50 T1-C 执行批 Agent；起草人≠批准人（D-169 取代 D-148② 五要件——裁者具名为裁定链非起草 Agent）。

## 5. 到期日＋复审钩

- **到期形态**：wontfix 恒久类事件制双条件（D-171）——接受=事实判据（as-of 快照语义）不依赖存续控制物消解缺口本身。
- **事件复审钩（消费触发锚）**：下次真实消费上游代表性校准的测量需求出现（Macro-C/Macro-A 消费 anysearch-cli 锚场景票）→**另立裁定**执行新校准包 v2（新建非 frozen 突变，走 D-177 预声明工序）。
- **低频盘查钩**：T3 普查节律（每审计窗随读——册项 status 重审＋「该退化无认领票」标注复核）。
- **双条件满足即复审**：消费触发先到→立即另立裁定；否则按审计窗节律盘查维持。**任一条件触发而未复审=档案失效**，须按五要件重立项（D-169-b④）。

## 6. 注册结果登记

- 决定：**注册落盘**——上游代表性缺口存续期 Accepted Risk 五要件齐备封闭（D-182③ 缺口合法化——正式挂账非隐形）。
- 落册闭环（本批兑现）：本档案＋registry `anysearch-cli-intent-drift-watch` confirmations decay-declared 行＋known-gaps GAP-REP-01 行＋账本 R50 执行窗兑现注记。
- S1 重校准：缓行挂消费拉动（D-182② 裁定内容=缓行非永不）；触发锚同上。
- 冻结件字节零动（D-172①）——本档纯声明面，不触碰 01 系五件。
