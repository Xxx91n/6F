# R46-Q1 atomcode 调研报告 —— Stage-2 判据④ A(a) 静默窗语义（2026-09-29，atomcode 串行调研）

调研口径：searches 7+（Exa×3/AnySearch×3，Tavily 超额限流转双引擎）；angles=Official/Comparative/Criticism/Currency/Community 全覆盖；full reads 5 篇（kubernetes.io feature gates、KEP-5241 原文、CPersona Release Lifecycle Standard v1.4、traztech SOC 2 观察窗操作文、chromium.org origin trial 指南；O'Reilly MSF quiet period 章节 403 未读仅摘录佐证）。题面存档同目录 R46-Q1-research-prompt.md。

## 执行摘要

三问分裁决：Q1=来源分级默认不重置（置信中高）；Q2=零试点『计时中』不合法必须为 not_started（置信高）；Q3=最小机读建制要件五件。三候选对比矩阵裁决=来源分级（方案 C），窄口径为其退化实现，全量口径否决。

## Q1：内部审计 findings 是否计入「finding 回流」重置计时——**来源分级，默认不重置**

- KEP-5241 语义=「试点/回传反馈」口径：原文「The only valid GA criteria are 'all issues and gaps identified as feedback during beta are resolved'」——「identified as feedback during beta」明确限定 beta 试点期反馈类 findings；功能/安全/监控/测试完备性是 beta 准入条件（prior to beta）非 GA 窗内信号。能力面 findings 来自试点回传=静默窗监测对象；架构完备性类=窗前门禁不计回流。
- SOC 2 Type II 观察窗惯例=「记录但不必然重置」：窗内发现 gap 正确动作=当天记录/当日补做/显式标注 catch-up/主动披露→产生 exception 而非推倒重来；重置（移动窗口）是 remedy 之一代价=推迟报告期数月——内部发现默认不重置观察窗，仅系统描述层实质变更才显式决策记录。（traztech《Operating a SOC 2 Type II Observation Window》2026-08）
- Goodhart 效应论证：内部审计产出率随审计强度变化——把「审计勤不勤」当「系统稳不稳」信号=激励少审计。外部试点回传=真实使用压力采样，随窗递减才构成稳定性证据。
- 结论两支：试点回传的能力面 findings→重置计时；内部审计/账面 hygiene→记 reset_log 披露项默认不重置——**除非该 finding 触发修复变更进入被验证制品，此时按「变更重置」非「finding 重置」**（CPersona v1.4：「clock anchors on the certification event, patch releases inside the window do NOT reset it」——重置锚定在事件而非 finding 本体）。

## Q2：零试点（零 findings）时「计时中」读数是否合法——**不合法，必须是 not_started**

- KEP-5241 两周无 flake 窗预设 e2e 测试在跑：证明对象=「测试运行了且无 flake」，不存在「没跑测试所以 trivially 无 flake」读法；KEP 明言「without actual field experience is irresponsible」——零试点=无 field experience=窗根本不该开始。
- SOC 2 惯例现成判据（双源同义）：「For every control in scope, can you point to it operating and producing evidence today? If the answer is no…**the window has not started yet, whatever the calendar says**」——先证控件在运行才允许起表，日历天数不算数=vacuous silence≠stability 工业表述；「complete remediation, confirm each control is operating, and only then start the clock」。
- CPersona v1.4 反面教训实录：v1.3「open-ended soak let one line's defect record hold up its successor's release」——含糊 soak 语义造成实际工程事故；v1.4 改「freeze+21-day soak+certification decision」，**freeze 声明=dated event recorded in repo's SUPPORT.md status table=窗启动显式前置事件**；无 freeze 事件无 soak，不存在「默认在计时」。
- 语义裁决：静默窗逻辑=「在刺激存在的前提下无信号」。零试点=无刺激，no new findings=vacuously true（空真）——空真不是稳定性证据而是证据缺失。**窗起点未登记成机读锚（start_event 缺失）⇔窗未启动；合法读数只有 not_started/blocked:no pilot；判据不得判定达标也不得显示「计时中」**。判据文本未定义零试点分支=判据 spec 缺陷（CPersona 称 standard defect），应修判据而非凑读数。置信高。

## Q3：窗起点机读锚定与重置语义最小建制要件

| 要件 | 字段 | 先例依据 |
|---|---|---|
| 窗启动锚 | start_event（枚举：pilot_started/findings_all_closed/freeze_declared）+start_at（ISO 时戳） | CPersona v1.4 dated event recorded in SUPPORT.md status table；SOC 2 起表日选择 |
| 前置条件断言 | prereq_check（试点在运行、findings 状态快照）启动时校验防「先起表后运行」 | SOC 2「confirm each control is operating…only then start the clock」 |
| 重置日志 | reset_log[]：finding_id/source_class（pilot_returned/capability/hygiene）/reset_at/new_window_start | KEP-5241「all issues and gaps identified as feedback」逐条可追；SOC 2 当日披露 gap 惯例 |
| 读数语义 | state∈{not_started,running(reset_count),satisfied_at}；not_started 是合法态，空窗不输出 satisfied | CPersona「clock anchors on the certification event」「Lines never frozen are never certified」 |
| 判定制品 | decision_date 当日复合测试（open findings 状态＋修复已部署且窗内被观察满最短时长） | CPersona v1.4「still open **or** fix not released/deployed/observed ≥7 days——**issue closure alone satisfies neither test**」 |

推荐配置（30 日窗版）：start_event=「all pilot findings closed」（复验该事件为真才落 start_at）；重置规则=试点回传能力面 finding 到达即重置并 append reset_log；hygiene 只记 log；决策日执行复合测试（无 open 能力面 finding 且每次重置后已满 30 日）；零试点→state 固定 not_started→判据输出「不达标：窗未启动」。

## 三候选对比矩阵（调研原文）

| 项 | 窄口径（i） | 全量口径（ii） | 来源分级（iii，荐） |
|---|---|---|---|
| KEP-5241 对齐度 | 高（feedback during beta=试点回传） | 低（KEP 完备性放 beta 准入非 GA 窗内） | 最高（能力面=feedback 口径/完备性=门禁口径逐条可映射） |
| 抗 Goodhart | 好 | 差（惩罚审计勤勉激励少审计晚发现） | 好（审计强度与计时解耦） |
| 安全性漏报 | 中（内部审计发现严重能力缺陷不重置=漏真实不稳信号） | 好 | 好（能力面 finding 无论内外都重置；hygiene 强制披露不重置） |
| 零试点语义 | 正确 not_started | 含糊（vacuous silence 读成稳定） | 正确 not_started |
| 机制复杂度 | 最低 | 低但语义错 | 中（source_class 字段化） |
| 主要弱点 | 「试点」边界模糊钻空子（外部反馈重定义为内部自查） | 窗变「治理清洁度观测」永无达标日 | 分类规则须判据文本预定义否则分类成争议点 |

**裁决=来源分级（iii）**：严格包含窄口径正确部分（零试点 not_started）＋修复窄口径漏报弱点（内部审计能力面缺陷同重置）＋不落全量口径 Goodhart 陷阱；窄口径为其退化实现（source_class 退化二值）；全量口径否决。

## 信息缺口（诚实标位）

1. 「内部审计 findings 是否重置静默窗」无逐字成文工业标准——来源分级=KEP-5241 语义边界＋SOC 2 例外处理惯例推断的最优解，置信中高非高。
2. MSF quiet period 原文 403（15~30 日数值与比例规则未核验原文）。
3. CPersona=单一项目自建标准（刻意对标 Node/Rust/Debian 惯例），「锚定事件不因 patch 重置」普适性以单一实现为据。

## 与本仓映射（整理注）

- Q2 裁决直接命中本仓现状：registry stage2-launch-criteria 六次「计时中」读数缺起点锚→按调研判=读数不合法须更正 not_started（勘误级更正非裁面改向）。
- Q1 两支映射本仓 finding 分类：F1（传播性锚错=证据完整性）属能力面；F2/F3/F5/F6（时点差/虚列/标签/footer）属 hygiene。
- 「重置锚定事件非 finding」精化：F1 修复（registry verify_method 更正）已进被验证制品→若窗在跑按变更重置；现状窗未启动故 moot，先例立法用。
