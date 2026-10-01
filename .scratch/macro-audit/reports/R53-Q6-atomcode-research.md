# R53-Q6 atomcode 调研报告：PROTECTED_SURFACE × 指针纪律面交叉声明

- 题面存档：`D:\Aworker\6F\.scratch\macro-audit\reports\R53-Q6-research-prompt.md`
- 派遣形态：atomcode `-p` 真回传（Indexed 9 sections，18.7KB）——**非降级**，三引擎（Exa＋AnySearch＋Tavily）均参与，12 篇 web_fetch 全文实读
- Sufficiency Gate：searches 13 次/17 查询；angles 五类全覆盖（Official/Comparative/Criticism/Currency/Community）
- 轮 53 构成比：Q1 内部载体降级／Q2 配额合成降级／Q3 真回传／Q4 配额合成降级／**Q6 真回传** → 3/5 降级

## 执行摘要（Tl;dr）

工业界对「守卫/哨兵声明」与「输入工件生命周期」存在高度一致的两层分离心智：**规则面（control plane）常驻全量运行，基线/豁免/静默是独立生命周期的数据面工件（grandfather data / exception data）**；工件的创建→收缩→归零→摘除全部属于数据面例行事件，规则面消亡在工业实践中从来不是由工件状态推导，而是由独立的治理动作（配置移除审批、control decommission 程序）承载。据此推荐 **候选 (i) 交叉声明（轻量）**：本仓机器面已齐备（D-199③ 同窗闭环＝ESLint prune/DDC failBuildOnUnusedSuppressionRule 的同构建制），独缺的正是判别文案——且混同的根源恰恰在 PROTECTED_SURFACE 声明字面把「known-pointer-violations 册两级判级」写进了守护面文字，歧义是内生的、非假想的。Confidence：**高**（外部先例≥6 个官方一手源两两交叉；唯一折减项＝84-check.mjs/WORKFLOW.md 实体文件在 atomcode 工作树不可达〔疑在未合并虚拟分支〕，声明现文以题面与账本记载为准——本侧已 grep 实证 L14 声明在案）。

## 1) 工业心智模型：守护对象声明 × 输入工件生命周期分离

核心模型：规则/策略面与基线/豁免数据面是两个对象，生命周期正交。

| 工具族 | 规则面（常驻） | 输入工件面（独立生命周期） | 归零/清空时的行为 |
|---|---|---|---|
| PHPStan | rule level 全量分析，每次 run 全执行 | phpstan-baseline.neon（注入为 ignoreErrors 输入） | 默认拒绝生成空 baseline（exit 1），须 --allow-empty-baseline 显式声明；未命中条目→reportUnmatchedIgnoredErrors 持续报警；官方「The life goal of a baseline file is to not exist」 |
| ESLint v9.24+ bulk suppressions | lint 规则照常全跑 | eslint-suppressions.json（须 commit 共享） | 修复后不清 prune→run 非零退出；--prune-suppressions 是册面动作，规则面零感知 |
| detekt | ruleset 由 detekt.yml 决定 | baseline.xml＝CurrentIssues（随修复自动更新）＋ManuallySuppressedIssues（人裁豁免） | CurrentIssues 自动收缩；两者清空都不影响 ruleset 存续 |
| gitleaks | .gitleaks.toml 检测规则恒执行 | baseline＝既往 JSON report（指纹 RuleID:File:Commit），baseline 自身路径被排除扫描 | 空/移除 baseline＝不再豁免任何 finding，检测面反而更强 |
| Semgrep | 规则全量扫描 head commit | --baseline＝事后对基线 commit 相关文件补充扫描再相减 | baseline 只影响 finding 归属（new/old），规则永不停 |
| OWASP dependency-check | analyzer 全量执行 | suppressionFile（XML）；failBuildOnUnusedSuppressionRule＝未用豁免条目→构建失败；<suppress until=…> 条目级到期 | 豁免条目失效/清空＝finding 重新暴露，扫描面不关 |
| Jest | 测试套件照跑 | .snap 快照文件按测试归属 | obsolete snapshot＝警告级 hygiene 信号，套件不因快照文件消亡而消亡 |
| Prometheus/Alertmanager | alerting rule（rule_files 配置面，promtool 校验存在性） | silence/inhibition＝运行时抑制数据，自带 expiresAt | silence 到期≠rule 变动；rule 物理移除也是独立配置事件（issue #2770：删 rule 后 Alertmanager 仍按 endsAt 超时才 resolved——两侧生命周期互不推导） |
| GRC（policy/exception） | policy/control 本身持续有效 | exception/waiver＝挂接对象，强制 time-bound | ISC2：「exception 到期＝exception 消亡，非 policy 废止」；CCM GRC-04 审计的是豁免流程自身，与 control 在效性正交 |

两源交叉要点：「基线清零后规则继续运行」得到 PHPStan＋ESLint＋detekt＋gitleaks＋Semgrep＋DDC 六工具一致实现；「豁免清单清空有独立的 hygiene 信号通道」得到 PHPStan reportUnmatched／ESLint unused-suppressions 非零退出／DDC failBuildOnUnusedSuppressionRule／Jest obsolete 四源一致——**该信号在工业上被建模为册机制面自检，从不被建模为守护面消亡事件**。与本仓 D-199③「册项失配→自报摘除、PV-F10D 守恒、manifest 只删不增」完全同构：机器面已齐，缺的只是文字边界。

## 2) 「工件生命周期终结 ≠ 守护面消亡」的判别先例

1. **空态是显式决定，不是静默默认**——PHPStan 生成空 baseline 默认 exit 1、必须 --allow-empty-baseline 显式 opt-in。对偶到本仓：册归零应是 D-199③ 同窗闭环的正常收口（每步留账），而不是任何需要 death-watch 介入的事件。
2. **豁免到期→风险重新暴露到面上，而非面关闭**——OWASP until 语义与 OpenRewrite remove-expired recipe：清单条目消亡使守卫输出变红（重新执法），恰证明守卫面**更活跃**了。
3. **Control retirement 需要独立程序与留痕**——decommission 文献要求分类/评估/文档化程序；GRC-04 审计指引审的是例外流程自身；ISC2 明言例外审批与 policy 存续是两个决定。即：**消亡判据落在「控制目标是否仍在/是否被吸收」，永不落「台账是否为空」**。
4. **反面教材**：PHPStan issue #3458/#12430——用户误把「重新生成/编辑 baseline」当作清理手段吞掉新错误；ratchet 研究把「重新生成基线」列为 ratchet 腐烂首因（"the one that kills the whole idea"）。教训同构：把册面动作与执法面动作混在同一操作通道里，才是历次事故的根因——分离文案正是对此的免疫。

## 3) 本仓决策库兼容性逐条评估

| 决策 | 内容锚点 | (i) 交叉声明 | (ii) 维持 | (iii) 子面分解 |
|---|---|---|---|---|
| D-160① | 消亡判据＝对象移除/上层吸收/更强更窄契约取代；⑥禁以断言量/年龄/通过史为退役判据 | **兼容**：判据全集不动，仅加负向边界句（册归零∉三事件）。与⑥同向 | 兼容但留歧义 | 兼容但无必要 |
| D-164-b | 事件触发制、禁预建发射机件、窗随读零机件普查；案底含误判触发教训 | **兼容且加固**：零机件，纯判读文字；普查员见「册将删除」不再需二次推理 | **残余风险实位**：声明字面含册名→忠实普查员面临「册文件算不算引用物」歧义 | **张力**：子面独立消亡判据＝预建三条独立触发语义，贴「禁预建发射机件」红线 |
| D-169/D-171 | AR 五要件；「补偿控制存续承载接受有效性」 | **同构**：与「例外工件生命周期≠control 存续」完全同型 | 不冲突，但错失同构表述对齐点 | 同构但过度 |
| D-188~D-192 | 84-check 为单文件三职能；D-192⑥ SURFACE_CLOSED=1 封闭世界 | 兼容。补钉句须表述为「输入工件非客体本体」，不改判级职能的守护面归属 | 歧义源即此声明字面 | **物理不可执行**：三子面同栖一个 .mjs，纸面独立＝虚设建制 |
| D-199 | 册收敛窗＋同窗闭环＋负向禁重生成册 | **兼容减阻**：册归零到达时闭环比照「归零≠面消亡」句直接对账，免临时另议 | 归零窗与 death-watch 首遇时仍要现炒判别 | 兼容（册机制子面独立判据反而给归零留错出口） |
| D-197▷WORKFLOW 先例 | ③「文书纪律入 WORKFLOW 指针条款」已开同通道 | **有同形先例通道**，非新形态 | — | — |
| D-190/ADR-0023「消除接缝优于守护」 | 接缝处置倾向消除 | 语义性接缝无代码消除路径，文字钉即最轻消除 | — | 重形态反违「消除优于守护」精神 |

**冲突面标注**：(i) 唯一表述红线——补钉句不得写成「册归零情形禁触退役通道」（剥夺 T3 呈报权）；正确写法是判据澄清（册归零不构成 D-160①任一事件），呈裁通道本身不动。(iii) 的实质冲突＝D-164-b 禁预建＋普查判读负担×3＋声明文本自引用膨胀。**零冲突裁定结论：(i) 与全部 current 决策兼容**。

## 4) 推荐与反方论证

**推荐 (i) 交叉声明（轻量）**，落地三件（零机件）：
- WORKFLOW 指针条款补钉（沿 D-197③ 通道）：「known-pointer-violations 册的创建/收缩/归零/摘除/失配自报＝D-191③/D-192/D-199 册工作面例行收敛事件，**不属** D-160① 三事件；84 面真消亡仍走 D-160① 全集＋T3 呈裁，判据不因册状态增减」；
- 84-check PROTECTED_SURFACE 补一句：「known-pointer-violations 为本守卫输入工件（baseline 册），其生命周期独立于面消亡判据」；
- （执行侧口径，非新裁票）death-watch 随读普查引用物清单口径：指针纪律引用物＝D-188~D-192 法定本体与严格层位形面，输入工件类（册）单列不纳入消亡普查。

**反方意见如实列示**：
1. **冗余文书论（中强）**：death-watch 是人工随读普查，文字钉同样靠人判读——若普查员机械地把声明提及的一切文件名当引用物，补句仍可被无视；若普查员本有常识，钉无对象。**反驳强度中**：歧义是声明字面内生的，非假想；补钉给「怎么算不算」提供判读锚，是方向性收敛。
2. **文书滑坡论（弱中）**：每件守卫都可援引加免责句→声明膨胀。**反驳**：(i) 仅两件各一句，无通道无机件；膨胀防线本就是 T3 呈裁与 D-135「禁 nit 升格独立裁定」既有纪律。
3. **消除优于守护论（中）**：交叉声明本身是新接缝。**反驳**：语义接缝无代码消除路径；真正的「消除」形态就是 (iii) 重构声明，而 (iii) 是更重建制——本语境下文字钉恰是消除思想的最轻应用。

**(ii) 残余混同面**：①归零窗（D-199③ 已排期，很近）与 death-watch 首遇时零缓冲；②误摘除册→下一窗「声明引用物缺失」假阴事件（反向混同同样存在）；③每次误判都要重新翻 CONTEXT 词条＋D-199 原文再推理复读，成本按窗支付。
**(iii) 残余面**：纸面三子面无物理承载＋贴 D-164-b 预建红线＋归零可被误读为「子面消亡」的错出口。

## 信息缺口

1. 84-check.mjs 与 WORKFLOW.md 现文在 atomcode 工作树不可读（疑在未合并 GitButler 虚拟分支）——声明现文按题面与账本记载为准（本侧 grep 已实证 L14 声明在案）。
2. tsconfig 空 include 语义未一手核验（降级为弱先例，不入判据链）。
3. control retirement 的 GRC 专门文献偏薄（以 decommission 术语页＋CCM GRC-04 补位）。

## 来源清单（摘要）

PHPStan baseline 官方文档＋CLI 用法（allow-empty-baseline/reportUnmatchedIgnoredErrors）；ESLint bulk suppressions 官方博客＋CLI 参考（prune/unused-disable）；detekt baseline 官方文档；gitleaks README＋Factory wiki 源码注记；Semgrep run_scan.py 官方源码直读；OWASP Dependency-Check suppression 官方页＋OpenRewrite 两份 recipe 文档；Jest Snapshot Testing 官方文档；Prometheus/Alertmanager 配置文档＋issue #2770；ISC2 exception/policy 分离＋CCM GRC-04；PHPStan issue #3458/#12430 反面教材；quality-ratchets 研究文（ratchet 腐烂四因）；RushStack eslint-bulk＋TikTok 工程博客（prune 周期维护惯例）。
