# R34-Q3 atomcode 调研存档 —— 外部评审「过时快照」摄入规程立规裁

调研时间：2026-09-25（本轮 atomcode 批次）｜题面：R34-Q3-research-prompt.md｜resume 句柄：8578eceb-016a-474a-ab01-46201eba0e65
引擎面：web_search×4 + anysearch×3（Tavily 配额耗尽）；full reads 4（GitHub advisories 最佳实践全文/PCAOB AS 2801 全文/RN triage 原文/GNOME 邮件串）＋本地账本 946 行×3 窗＋CONTEXT＋AGENTS；置信：高。

## 1) 执行摘要（Tl;dr）

**推荐 (b)：AGENTS.md 补一行摄入规程。** 置信高。①工业界高度收敛=「接收方对照现状分诊，非约束报告方重拉 HEAD」——GNOME/Launchpad 自动拒收模板、RN `Needs: Verify on Latest Version` 机器人标签、GitLab Likely Fixed→请报告者对最新版验证、审计 dual dating——全部把「钉快照」义务留报告方、把「对照现状分诊」义务放接收方，(c) 与收敛方向相反；②本仓已有完整概念地基（D-076 去向表、D-138「快照属实已修」定性、Watch Tri-state、Trigger-gated Closure），缺的是把自发实践写成可执行判词——正是 D-130②「手写枚举惯例=必然再过期，判据须成文」的直接应用；③不立规约 (a) 留「分诊因轮次而异」暗纪律，与 D-076④ 登记纪律+D-139 轻规约文法相悖。

## 2) 本地账本事实基线

- D-076④「批评→触发器映射＋锐评六项去向表」与「全留痕可回溯」义务在案；
- D-130②「手写枚举区间=必然再过期」立法原则；D-138「快照属实已修」定性形态已实存；
- AGENTS.md 现状=环境/操作速查面（D-139② 格式化规约已开「规约行入 AGENTS」先例）。

## 3) 外部工业惯例（三角度交叉）

### 3.1 缺陷报告/安全披露：报告方钉版本，接收方对照现状
- GitHub Security Advisory：受影响版本由报告/维护方以 VVR 结构化字段显式钉死（>=x,<y + Fixed 字段），「fixed version cannot be smaller than largest in VVR」；下游消费方靠字段对照自身版本分诊——无人要求下游「重拉最新版再读通告」。
- OSV schema（OSSF 官方，ranges+fixed 事件字段）：同分工；OSV 直接影响 CVE 5.0 标准。
- React Native/GitLens triage：疑似过时报告标准动作=`Needs: Verify on Latest Version` 标签＋机器人模板「upgrade and verify」——接收方先分诊「疑似已修」再请报告方确认，非要求提交前重拉。
- GNOME Bugsquad/Launchpad：EOL 版本自动拒收模板「version reached EOL, fixed in newer versions, closing」——分诊定性由接收方执行，报告方义务仅「报上版本号」。

### 3.2 Issue tracker 分类学：「快照属实已修」是有名分诊态，非开放问题
- Bugzilla（Mozilla 实例原文）：「already been fixed in newer versions, marking WFM」→RESOLVED WORKSFORME；报告基于过时版本且当前不可复现→WORKSFORME/INVALID，留痕关闭非开放排期。
- GitLab triage：「Likely Fixed → needs-more-info 标签＋请报告者对最新版验证」——「疑似已修」专档与 Confirmed/Cannot Reproduce 并列。
- 共同心智：报告的事实性（快照时点属实）与现行性（当前版本仍存在）是两个正交判定；锐评 O2 FAIL 落「事实性✓×现行性✗」格——工业界给此格的名字=WORKSFORME/Likely Fixed/Resolution: Old Version，没有一家记成开放问题。

### 3.3 审计行业：review-cutoff 与 subsequent events
- PCAOB AS 2801（原文已读）：审计师责任期止于报告日，「不预期对已满意结论的事项持续复核」；报告日后事件=subsequent events，处置=披露或 dual dating（'Feb 16, except Note X, as to which March 1'），非要求使用方重做审计。
- 映射：锐评快照 SHA≈审计报告日；快照→摄入时点的主线推进=「报告日后后续事项」，处置=接收方分诊时显式标注差异区间（快照 SHA→当前 HEAD）=dual dating 同构——恰是摄入侧本轮自发做的事，AS 2801 提供「行业标准职责边界」判据。
- ACM Artifact Evaluation：评审对象=作者钉死的 artifact revision，结论只对该 revision 负责；「要求评审方评审前重拉 HEAD」在所有 artifact evaluation 规程里无先例。

### 3.4 对比矩阵
| 候选 | 工业对应物 | 符合度 | 关键风险 |
|---|---|---|---|
| (a) 不立规约 | 无直接对应（暗惯例≠成文规程） | 低——分诊档位全部成文 | 纪律随会话漂移，下轮可能再把已修项当开放立案 |
| (b) AGENTS 一行摄入规程 | tracker Likely Fixed/WORKSFORME 分诊档＋AS 2801 dual dating＋ACM pin | 高——报告方钉快照/接收方对照分诊各自法定化 | 需防 pending 成第四态 |
| (c) 要求评审方重拉 | 无先例——artifact eval 钉 revision 是明文要求，反向要求不存在 | 反向 | 外部不可约束＋后续事项处置义务错配给报告方 |

## 4) 推荐措辞要点（AGENTS.md 一行）

> 外部评审摄入＝先钉评审快照 SHA（报告日基准），逐条对照当前 HEAD 分诊：快照属实且现状已修→标「快照属实/现状已修」不立案（留痕按 Dual Reporting 去向表惯例）；仍开放→进裁定链（D-075 三要素受理边界）；无法核实→标 pending 并挂 Watch Tri-state 复审时点，不作为已核实结论引用。

附：(c) 合理内核吸收——若锐评渠道持续化，规程可带一句「可向评审方提示其快照 SHA 以便下轮更新」=请求非要求。复发升格路径=按 D-139③ deferred 触发器文法（同 89-format-piggyback-recurrence）。

## 5) 与账本 current 决策的显式冲突核查

**(b) 与 current 决策零实质冲突，但三处张力须显式登记**：

| 张力 | 性质 | 处置 |
|---|---|---|
| ①「pending」vs Watch Tri-state 三态 | 若 pending 落值守登记表=第四态违词条 | pending 仅作票面瞬时标记；未核实项入 registry 须走 manual_watch 五要素（带复审时点），不入三态即非法 |
| ②摄入规程入 AGENTS vs 决策本体住账本 | AGENTS 现存皆为速查；规约行有 D-139② 先例但须防 AGENTS 膨胀成第二决策账本 | AGENTS 只留操作判词一行；裁决理由（工业先例/D-075 边界）留账本——D-139 先例正是此形 |
| ③「不立案」vs D-076④「全留痕可回溯」 | 「不立案」若被读成「不登记」则丢 Dual Reporting 留痕，与 D-076④ 正面冲突 | 「不立案」限定=「不进裁定链」，去向表登记义务不减——「快照属实/现状已修」本身就是去向表一行（D-129 收口注记同款先例：批评被拒收但映射照登） |

非冲突但易误读：D-075 受理边界（立场批评+实证+工业先例三要素）管「已核实仍开放的批评要不要受理重裁」；本规约管「核实之前的分诊动作」——两阶段正交，D-075 三要素核查天然是分诊第三档（仍开放→进裁定链时才触发）。

## 6) 来源清单

- docs.github.com repository-security-advisories best-practices（Official：VVR/Fixed 结构化字段=报告方钉快照制度化）
- pcaobus.org AS 2801 Subsequent Events（Official 全文：报告日责任边界＋dual dating）
- ossf.github.io/osv-schema/（Official：ranges+fixed 事件字段；CVE 5.0 前身）
- bugzilla.mozilla.org #973615（Community：WORKSFORME=「快照属实已修」有名分诊态实例）
- mail.gnome.org desktop-devel-list 2007-04（Community：EOL 版本自动拒收模板）
- github.com react-native triage 标签（Needs: Verify on Latest Version／Resolution: Old Version）
- GitLens triage 流程（Likely Fixed→needs-more-info）

## 7) 信息缺口

- Chrome/Apache 安全团队 version-check 成文一手规程未直接读到（以 GitHub VVR/OSV 字段＋多 tracker 实例交叉替代，方向一致权威等级略降）。
- Tavily 配额耗尽三引擎降级双引擎（关键结论 ≥2 独立信源）。
- 「锐评渠道是否持续化」属商业/协作事实仓内不可核实——若一次性事件 (b) 紧迫性下降但仍建议落（一行成本≈0，且 D-130 类「计数失实」风险在任何外部输入上重现）。
