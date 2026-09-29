# R48-Q2 调研报告 —— 「预声明验证包」工序收严裁量（D-147 工序形态）

> atomcode 深调研存档（轮48 Q2）。执行备注：首轮委托调研撞 5h 额度窗限流（resets ~19:50），会话内续跑锚定后由会话按题面协议直跑完成（三引擎＋知识库召回复用）；searches/angles/full reads 配额见过程注记；信息缺口如实标位含「委托调研在途超时未回收」一条。

## 1) 执行摘要（Tl;dr）

**推荐 (iv) 换锚——声明锚＝任何「先于变更 commit 落盘的物化面」即合法＋红态诱导实跑读数列必选复验件**（Confidence：高）。理由：预声明的证据学本质是**时序可证**（第三方可从工件验证声明先于实现），而非「必须独立切一个 commit」——声明在更早 commit 中物化（账行/报告节/独立声明文件均可）即自证时序，这恰好是 D-147③ 原判例形态的一般化；同 commit 原子落盘则时序只能信作者自述，证据强度确为弱档（P2 为真洞）。红态诱导实跑必选有混沌工程 before-probe 纪律、kill-criteria「有数无主＝事后挪用」反模式、TDD RED 阶段必须实际观察到失败三重惯例支持（P3 亦为真洞）——**声明而不跑＝declared-not-proven，不应视为闭环**。

## 3) 分点结论

### 3.1 裁决①：「预声明」的证据学本质＝时序可证，但达成方式不唯一——commit 序与「文档已物化于更早 commit」等效

- **核心证据（科研预注册域）**：Mazor et al. 2019（*Eur J Neurosci*, DOI 10.1111/ejn.14278）——**「把研究计划注册到 OSF 并获得时间戳，本身并不能客观证明计划先于数据采集」**：OSF/AsPredicted 只提供 registration 时间戳，无法保证数据采集没有先于该时点；「只有 time-locking（证明预注册先于数据采集这一事件序）才是有意义的，注册提交日期本身若无数据采集时点的相对知识则毫无意义」。直接回答裁决①：**证据学本质是可验证的事件序，不是时间戳或 commit 本身**。
- **软件工程域证据机制不同且更强**：git commit DAG 即行业标准时间锁定机制——声明物化于祖先 commit、变更物化于后代 commit，则任何评审者 `git log` 即可第三方验证时序，无需信作者自述。这正是原判例「声明钉账行→变更另 commit」的优点（题面 P2 观察属实）。
- **同 commit 原子落盘的证据学缺陷**：声明与实现同时物化，工件上无从区分「先声明后实现」与「实现后补写声明再一起提交」——只能信作者自述。与 Mazor 批评的「sealed envelope scheme does not provide this objective marker」同构。审计证据学同向：PCAOB AS 1215 要求 documentation「clearly demonstrate that the work was in fact performed……and the date」，.09 款明示**事后补入的说明须有 persuasive other evidence、口头解释不足为凭**——「事后自述」在审计纪律中是最低档证据。
- **结论**：commit 序是达成时序可证的手段之一而非唯一手段；**判据应钉在「声明物化面先于变更 commit 存在于 git 历史」**（账行、审计报告节、独立预声明文件均满足），同 commit 原子落盘不满足。这就是候选 (iv) 的锚定义——证据强度与 (i)① 等效，但不强制独立 commit。
- 〔推断级标注〕「声明 commit vs 同 commit 的审计证据强度分级」无直接一手行业研究；PCAOB contemporaneous 原则＋Mazor time-locking 论证向软件治理域类比迁移，两个独立信源同向，推断置信中高。

### 3.2 裁决②：红态诱导实跑**应列必选复验件**——声明而不跑的 fail-closed 断言包在工业验证纪律中＝未闭环形态

三重独立惯例同向：

- **混沌工程（最强同构）**：Steady State Hypothesis 纪律要求「before probe」实跑——chaostoolkit 官方定义 steady state 假设同时用作实验前确认系统处于声明正常态的检查与实验后对照模板；ACE Journal 2025 案例明示「若 before probe 失败，实验在不注入混沌的情况下中止——这本身是系统已退化的信号」。AWS Prescriptive Guidance 要求实验规划文档捕获 steady state 定义后**实跑采集 metrics/logs 讲出实际发生的故事**。即：预声明的判据面必须配套实际运行读数，声明本身不是产出。
- **TDD（RED 阶段语义）**：TDD 的 RED 不是「声明这个测试会红」而是**实际运行并观察到失败**——严格两-commit 派要求 test-only commit 在 CI 中真实红、并用 `git log -2`＋脚本输出作为证据呈堂。声明了「病态输入下断言真红」而不构造病态输入实跑，等于跳过 RED 直接宣称 GREEN——在 TDD 语境中这不是流程简化而是流程未执行。
- **Kill criteria 文献（失败模式反证）**：Singular State《Write the kill criteria before the demo》点名的头号失败模式——**「criterion has a number and no owner：实践中 review 不会发生，数字在事后被取出来正当化任何已做的决定」**。这正是 P3 的精确病理：预声明了红态诱导面但未实跑，该声明的唯一剩余用途就是事后正当化——若审计窗不补证，「预声明验证包」退化为「事后合理化的预制文本」。
- **结论**：声明了诱导面就必须实跑留数（读数入报告/账行），未跑＝包不闭环按缺件处置。此为 (i)②=(ii)=(iv) 三候选共识项，(iii) 是唯一放任项。

### 3.3 裁决③：工序收严的成本-收益判据——何时值得多一道工序

- **收益侧**：P2/P3 均为 r48 审计实证呈报（非假想）；且 P3 已实际发生一次补救成本（审计窗沙箱补证 5/5）。同型弱化若不拦，「预声明」工序的信任基础被侵蚀——kill criteria 文献的警告是系统性的：预承诺机制的价值恰恰在于例外可检视，「written triggers alone」若无执行面则不改变行为。
- **成本侧**：本仓用 GitButler 管理提交，切分/重排 commit 边际成本极低；且已有 D-139（语义/格式分 commit）、D-140②（生成物独立 bundle commit）的分 commit 纪律——**「多切一个 commit」在本仓不是新工序而是既有纪律的同型延伸**。
- **关键判据（从 TDD 惯例的分歧中提取）**：工业界反对「test commit 先行」的主要理由是 RED commit 破坏 bisect/CI 绿态（社区共识：main 每个 commit 应可构建）。但**该理由对声明性文档 commit 不成立**——预声明验证包是文档/账行，永远是绿的，分时落盘零 bisect 代价。故本仓场景下「分时落盘」的反对理由清单为空，收严成本≈零。
- **反面约束**：工序不宜过刚到把「小变更」挤出预声明工序（D-133「票面开销超工作量则禁拆」精神的对偶）。(iv) 在账行锚在场时零新增工序，仅在非裁条驱动的探测面变更时才需要一个先落的声明物化面（轻量文件/报告节 commit）——成本-收益比最优。

### 3.4 候选逐评

- **(i) 双收严**：方向正确（两洞都堵），但①的形态过窄——「须独立先落 commit」会把 D-147③ 原判例的「声明钉账行」形态也判为需重述（账行随裁定 commit 落盘≠「独立声明 commit」），制造与自家判例的表述冲突；且对 TDD 惯例的引入忽略了「红 commit 破坏 bisect」这一反对理由在本仓不成立的前提差异。**判：实质等价于 (iv) 的过刚实现，不取。**
- **(ii) 半收严**：堵住真洞 P3，但 P2 的时序弱档维持——同 commit 原子落盘可再犯且无拦。**判：不完整的收严，次优。**
- **(iii) 不收严**：两建议降文书口径。P3 的「只声明未验证形态流出」无拦（本轮靠审计窗补证属运气面非制度面）；P2 同型弱化可再犯。「criteria written afterwards cannot be departed from, because there is nothing to depart from」——无时序物化约束的预声明在证据学上是空集。**判：否。**
- **(iv) 换锚**：①锚定义「先于变更 commit 落盘的物化面」把时序判据从「commit 形态」还原为「证据学本质」（3.1 结论），与 D-147③ 原形态完全兼容（账行锚=特例），适用面窄的弊病可用兜底条款消解（非裁条驱动时允许任选先落物化面：预声明文件/报告节）；②实跑必选与 (i)(ii) 共识一致。证据强度= (i)，工序成本≤(ii)。**判：推荐。**

## 4) 冲突扫描

| 决策 | 排查结果 |
|---|---|
| **D-147 工序本体** | 零冲突且被一般化：D-147③「声明钉账行→变更独立实施 commit」正是 (iv) 锚定义的特例（账行 commit 先于变更 commit＝时序自证）。(iv) 不改判例方向，只把「锚=账行」放宽为「锚=任何先落物化面」并补实跑必选腿。 |
| **D-148③ 规程生效时点** | 新约束自落盘 commit 起生效，不溯既往——7bd2e8e1（同 commit 原子落盘）已由 r48 审计判「实质合规」维持，不翻案；此后探测面变更按新锚执行。 |
| **D-139/D-140② 分 commit 纪律** | 同向强化：已有「语义/格式/生成物分 commit」三型先例，「声明物化面先落」是同族第四型，无新范式。 |
| **D-144①④ 账行↔编年随行** | 零冲突：实跑读数入账行/报告节照走编年随行核对；预声明账行本身即触发既有随行义务。 |
| **D-155 manual_watch 五要件** | 无涉——实跑必选是复验件义务非哨兵登记；若个别诱导面因环境不可当时实跑（如需沙箱副本），应按缺件挂起而非静默放行，与 D-155「缺件不静默」精神一致。 |
| **D-161④ commit trailer 三栏位** | 零冲突：声明 commit/实跑读数 commit 的 trailer 照走三栏位。 |
| **D-144/D-145「工序前置＋硬闸不降级」先例** | 同构支持：(iv) 正是「工序前置（声明先落）＋闭环义务（实跑）」在预声明域的平移。 |

**结论：四候选中 (i)(ii)(iv) 均无 current 冲突；(iii) 与外部惯例（chaos eng/TDD/kill criteria）相悖。唯一表述风险在 (i)① 与 D-147③ 原形态的冗余重述。**

## 5) 推荐＋置信度

**推荐 (iv) 换锚＋实跑必选，置信度：高。**

- **置信依据**：①证据学裁决有 Mazor 2019（time-locking 论证）＋PCAOB AS 1215（contemporaneous/事后补证降档）双独立信源同向；②实跑必选有 chaos eng before-probe（chaostoolkit/AWS/Google Cloud 三官方源）＋TDD RED 实证语义＋kill criteria 失败模式三重惯例支持；③本地 D-147③/D-139/D-144①/D-145① 先例链完全兼容，落点=对 D-147 的一次 revised（③款锚定义放宽＋新增实跑必选腿），沿 D-146⑤ 勘误/修订惯例走裁定链即可。
- **置信折扣项**：无直接一手「声明 commit vs 同 commit 审计证据强度」研究（类比级）；Mazor 论文正文未全文读（PDF 二进制）。

**落点建议（供裁定链参考，非代裁）**：
1. D-147 标 revised：③款锚定义改为「声明须物化于**先于变更 commit 落盘**的承载面（账行/审计报告节/独立预声明文件均可）；同 commit 原子落盘不满足预声明证据强度」；
2. 新增腿：「红态诱导面声明即含实跑义务——执行窗须留实跑读数（构造输入＋运行结果），未跑=包不闭环按缺件处置，不得以『审计窗补证』为预期兜底路径立法」；
3. 兜底条款：非裁条驱动的探测面变更无账行锚时，允许任选先落物化面（推荐轻量预声明文件，随 D-139 语义 commit 纪律独立落）。

## 6) 完整来源清单（摘要）

- Mazor et al. 2019, *Eur J Neurosci* DOI 10.1111/ejn.14278——预注册 time-locking 论证（abstract/高亮层）
- PCAOB AS 1215（Audit Documentation）.09——contemporaneous 文档原则＋事后补证降档
- chaostoolkit 官方 steady-state hypothesis 文档＋AWS Prescriptive Guidance 混沌工程实验规划＋Google Cloud 同族——before-probe 实跑纪律
- Singular State《Write the kill criteria before the demo》——「number and no owner」失败模式反证
- TDD 严格两-commit 派先例（develop-tdd HARD GATE：test-only commit CI 真实红＋git log 证据呈堂）
- pre-commit hooks 目录／devopsboys 故障手册——分档建制化惯例

## 7) 信息缺口

1. 「声明 commit vs 同 commit 原子落盘」的审计证据强度分级无直接一手行业研究——由 PCAOB contemporaneous 原则＋Mazor time-locking 类比迁移（推断级已标注）。
2. Mazor 2019 正文 PDF 为二进制未能逐行读，time-locking 机制细节引至 abstract 与搜索高亮层。
3. atomcode CLI 委托调研在途超时未回收（进程存疑），本报告由本会话按协议直跑完成；若该后台跑后续落库，可作二轮复核锚。
