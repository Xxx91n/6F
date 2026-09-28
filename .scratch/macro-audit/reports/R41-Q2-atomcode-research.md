# R41-Q2 atomcode 调研报告：env-contract 探测粒度＋retired 发射腿两裁面

调研时点：2026-09-28｜引擎：Exa+AnySearch（Tavily 限流降级）

searches: 8 | angles: Official, Comparative, Criticism, Currency, Community | full reads: 6 | gaps: Tavily 限流、t.Skip 父级语义、47-check 普查、方向反转成本

## 1) 执行摘要（TL;DR）

**子题a（探测粒度）：推荐 (i) 组级探测 groupProbe 下沉、三态渲到组，作为 (iii) 拆件的低成本替代**——保持整件结构不变，但把「环境探测」从启动即整件 SKIP 改为「per-组探测、组级三态呈现」，使 A/D/E 本仓自足组不再随 B/C sibling 缺席连坐 SKIP（Confidence：中高——pytest 模块级 skip 是业内默认整件粒度先例，但 JUnit Assumptions 与 Go subtest 恰是「组内部分 skip」一手反例，且本仓连坐实证成本已实际发生）。

**子题b（retired 候选发射）：推荐 (iii) 哨兵锚定（registry manual_watch 注册审计窗）为当下裁定，(i) 建制发射腿推迟到首件真实退役临窗再裁**（Confidence：中高——业界死代码探测器实证假阳率高（Optuna 28 findings→11 幸存、ctxo 案例 203 unused exports 大半框架假阳），空转期探测器既是维护负担又是信任侵蚀源；但 (iii) 与 D-148②「Accepted Risk 三要素」和 D-149 升格机制同构，零新机制成本）。

两裁面同源结论：探测/发射粒度设计的业界一致规律是——**三态语义（skip≠fail≠pass）必须在最细可归因单元上呈现，但检测器/发射器的建制时机应与真实案例挂钩（首例先行）**。

## 2) 对比矩阵

### 子题a：探测粒度

| 项 | 组级探测 (i) groupProbe | 整件维持 (ii) | 按 tier 拆件 (iii) 46a/46b |
|---|---|---|---|
| 连坐消除 | ✅ A/D/E 组本仓面保活 | ❌ 连坐维持（已实证 46/39 两案） | ✅ A/D/E 组入 portable 件保活 |
| SKIP 语义保真 | 组级 reason 仍 env-missing:sibling:*，三态不进 allOk 不变 | 同左但粒度粗，SKIP 原因掩盖了自足面 | 拆后 portable 件零 SKIP；env-contract 件整件 SKIP 语义反而更纯 |
| 改动成本 | 中：env-contract.mjs 加组级 API＋46/39 两件调用点改写＋GUARD-RESULT 渲染面扩列 | 零 | 高：拆件＋guard-all-run 动态枚举自动收编（A-097⑥ 升格机制利旧）＋文件头 TIER/PROTECTED_SURFACE 双声明重写 |
| 语义单元对齐 | 守护面语义单元（A=workflow 契约 vs B=jiahao 撤除本就异源） | 文件即单元（与 75a-T 普查、env-gated registry 对账面一致） | 最强对齐，但引入两件新守卫的基线入列义务 |
| 先例 | JUnit assumingThat／Go subtest 级 Skip＝组内部分 skip 官方形态 | pytest pytestmark 模块级 skip＝整件粒度默认态 | Bazel 按 tag/target 拆分＝构建层拆件先例 |
| 主要风险 | 渲染面契约（GUARD-RESULT 行格式）需扩列，guard-all-run 分类器要跟 | 自足面哨兵价值持续损失（环境修复后无自动转红信号） | 守卫件数 60→62，普查/对账/manifest 全链路件数维护成本 |

### 子题b：retired 发射腿

| 项 | (i) 建制发射腿 | (ii) 散文态维持 | (iii) 哨兵锚定 |
|---|---|---|---|
| 首件退役前 | 复用 VACUOUS 机件持续空转 | T3 人工读数零产出 | manual_watch 条目静置，复审窗到达才激活 |
| 首件退役时 | 即时发射 | 依赖人工读数纪律 | 临窗再裁发射腿形态 |
| 空转成本 | 探测器维护＋假阳分诊（业界实证高假阳率） | 零 | 零（注册表对账随窗走） |
| 机制先行风险 | 与 D-079 普查结论同型：候选 0 时探测器价值未实证 | 依赖散文记忆，跨窗漂移风险 | 无 |
| 先例 | D-079 VACUOUS 普查机制本身（先例是「有引用物缺席探测器后才建」，其候选 0 是建后实测） | D-148② 人工呈报通道 | 33-gate-registry next-audit-window 现役哨兵锚 |

## 3) 分点结论

**结论1（板块1）**：四大测试框架给出粒度光谱的两端，本仓问题恰落在中间——pytest 官方把模块级 pytest.mark.skipif / pytestmark 作为整文件 skip 的标准形态，即「环境前置探测＝整件粒度」是 Python 圈默认；但 JUnit 官方明确把 Assumptions 定义为 per-test 粒度 abort 语义，且 Go 官方博客明确 t.Fatal 使该 subtest 被跳过而不牵连父测试或后续 subtest——后者正是本仓 A/D/E 组该有的形态。交叉验证：两个独立信源（JUnit、Go）一致支持「环境缺席 skip 应细化到最小可归因单元」；pytest 提供反例（模块级整件 skip 亦是官方形态），分歧点在于「前置成本评估时机」——pytest 的模块级 skip 走 import 时判定（零运行成本），本仓 envProbe 也走启动时判定（同样零成本），故 pytest 先例并不能为「A/D/E 连坐」辩护，只是说明整件粒度不是无先例的错。

**结论2（板块1）**：Bazel 的答案是从根本不设组内 skip——环境差异在构建层用 tag/target 拆分承载（tags 属性＋test_suite 按正/负 tag 组装）。这为候选 (iii) 拆件提供一手先例：Bazel 圈共识是「环境依赖差异＝目标拆分」，不是运行时探测。但 Bazel 语境里拆分是零边际成本（tag 一行），而本仓拆件牵动守卫基线、普查、对账全链路——先例支持 (iii) 的语义方向，不支持其在本仓的成本结构下立即执行。

**结论3（板块1）**：partial-skip/pass 语义惯例——JUnit 的 assumingThat(executable) 官方形态是「假设不成立则该段不做，测试其余部分照常」，与本仓「组级探测、组级三态渲」语义同构；Go subtest 的独立 skip/fail 也是组内部分呈现的官方认可形态。两源交叉：JUnit API doc＋Go testing.go 源码注释（Fatal ... causes a subtest to be skipped but not its parent）均一手已读。

**结论4（板块2）**：死代码/过期测试探测器的假阳率实证——Optuna 真实 PR：28 findings 经 17 假阳过滤后仅 11 幸存（repowise/Skylos 实测分析，flagshark＋skylos 文档交叉）；另一实测案例 203 个 unused exports 中 API endpoints/DI 注册/CLI commands/测试类全为框架假阳。结论：空产出期（retired 册空）建发射腿，意味着持续承担探测器维护＋假阳分诊成本，而产出为零——与「探测器的价值须由真实案例兑现」的业界纪律相悖。

**结论5（板块2）**：机制先行 vs 首例先行——D-079 VACUOUS 普查的先例结构是：先有疑似恒真案例（39-F2），再建探测机制，机制落成后候选普查结果=0（机制有效性实证但无新产出）。这恰好反驳「机制先行」在本仓的传统：本仓建制纪律一贯是案例驱动（D-094 三分类门、A-097 升格判据落地即替代枚举）。业界同构证据：stale-test 检测器（sentri staleDetector，STALE_DAYS=90 默认＋人工阈值）也把自动化挂在真实运行史上而非预建。（注：此条为单一信源＋本仓先例推断，置信低于前几条。）

**结论6（本仓账本）**：D-159②④⑤（tier 自声明＋envProbe＋SKIP-with-reason 三态契约）与 D-160③（双字段同窗显式扩展）已把「整件粒度」钉死为现行契约形态——envProbe(guardName, needs) 的函数签名本身就是 guard 级（整件级）API，guardSkip 打出的 SKIP <guard> | env-missing:* 行也是 guard 级 reason。子题a 的 (i) 方案不是对 D-159 的推翻而是其粒度精化——D-159③ 的三态纪律（skip 不进 allOk、禁折 pass、禁门禁计数）在组级渲染下全额保留。

## 4) 账本冲突清单（辩证，显式列出）

| # | 冲突点 | 支持方 | 反对方 | 裁定倾向 |
|---|---|---|---|---|
| C1 | groupProbe vs D-159 现行契约「启动探测→整件 SKIP」 | D-159⑤ 契约未钉死粒度细节，组级是精化非违逆 | D-159①⑤ 文字「启动探测缺失→SKIP」指向整件；改粒度须在账本登记为 D-159 精化裁定 | (i) 合法，须走账行增量 |
| C2 | 拆件 (iii) vs D-149④ 升格机制 | 升格机制自动收编新 check，拆件无 graveyard 风险 | D-159② env-contract 声明集={37,39,46} 是勘误后的 3 件画像，拆件使其膨胀为 6+ 件，对账面/registry env-gated 类/75a-T3 全链路件数翻倍 | (iii) 推迟：仅当 (i) 改造后连坐仍实质发生再裁 |
| C3 | 发射腿 (i) vs D-079 VACUOUS 先例 | 复用 VACUOUS 机件「引用物缺席探测」技术同源，建制边际成本低 | D-079 的建制由真实案例（39-F2）触发，retired 现无首例——机制先行违反本仓「案例驱动」纪律（D-094/A-097 同型）；且 dead-code 探测器假阳率业界实证高 | (iii)/(ii) 优先，(i) 首例临窗再裁 |
| C4 | 哨兵锚 (iii) vs D-148② 三要素 | manual_watch 五要素通道现役（33-gate-registry next-audit-window 同型在案），零新机制 | 哨兵锚若只挂「审计窗开启」而不挂「首件退役」，则首件退役可能落在两窗之间静默丢失 | (iii) 须把哨兵触发条件钉为「任一 PROTECTED_SURFACE 消亡判据事件」而非纯时间窗 |
| C5 | 46-check B 组的 WARN 方言披露（D-159⑤）vs A/D/E 组自足性 | B 组漂移时 WARN 只影响 B 组断言退化，A/D/E 不受影响——说明组级异质性已被 D-159⑤ 隐式承认 | 现行实现里 envProbe 仍在启动时一票否决整件，两处语义不一致 | C5 本身是 (i) 方案的内部证据：D-159⑤ 已经承认组内异质，groupProbe 只是把承认延伸到探测层 |
| C6 | skip≠xfail 纪律 vs 组级 SKIP 后组内断言「本可过却未跑」 | D-159③ 已裁定 skip/xfail 不可混标 | 组级 SKIP 使 A/D/E 组的断言处于「环境缺席型未跑」，与 xfail（物不在）语义边界在组粒度上反而更清晰——整件 SKIP 时自足断言被误归入环境面 | 支持 (i)，无实质冲突 |
| C7 | R23 恒真纪律 vs retired 发射腿 | 恒真普查（D-079）的存在意味着「空产出检测」机件已备——复用即发射腿 | R23 纪律针对的是断言恒真（探测器探测守卫），retired 候选是守卫本身消亡——探测方向相反（守卫探自己），机件复用需方向反转，非零成本 | C3/C7 叠加后 (iii) 更稳 |

## 5) 推荐与理由

- **子题a（探测粒度）→ (i) groupProbe**：46-check A/D/E 与 39-check E 段的连坐实证已实际发生，JUnit assumingThat / Go subtest 独立 skip 提供组内部分呈现的官方先例，且 D-159⑤ 的 WARN 方言披露已隐式承认组内异质——组级探测是既有裁定的自然延伸。(iii) 拆件登记为 (i) 落地后连坐仍实质发生时的复审触发条件。
- **子题b（retired 发射）→ (iii) 哨兵锚定**：机制先行违反本仓案例驱动纪律（D-079/D-094/A-097 同型），业界实证空转探测器假阳率高；哨兵触发条件须钉为 PROTECTED_SURFACE 消亡判据事件而非纯时间窗（冲突 C4），防止首件退役在两审计窗之间静默丢失。

## 6) 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| pytest — Skip and xfail | docs.pytest.org/en/stable/how-to/skipping.html | Official | 模块级整件 skip 官方形态；skip/xfail 语义区分与 D-159③ 同构 |
| JUnit 5 Assumptions API | docs.junit.org/5.14.2/api/.../Assumptions.html | Official | per-test 粒度 abort 语义；assumingThat＝组内部分 skip 官方形态 |
| Go Blog — Using Subtests | go.dev/blog/subtests | Official | Fatal 只 skip 该 subtest 不牵连父/兄弟＝组级独立呈现一手先例 |
| Go testing.go 源码注释 | go.dev/src/testing/testing.go | Official | Skip 语义注释二源交叉 |
| Bazel General Rules (tags/test_suite) | bazel.build/reference/be/general | Official | 拆件先例：环境差异＝tag/target 拆分 |
| Bazel Test Encyclopedia | bazel.build/reference/test-encyclopedia | Official | 测试环境封闭性规范 |
| FlagShark — Dead Code Detection | flagshark.com/blog/dead-code-detection-... | Currency | 10–30% 死代码占比＋标准工具漏检类目 |
| Skylos — Dead Code Detection docs | docs.skylos.dev/dead-code-detection | Official(工具方) | 置信度惩罚表＝探测器假阳结构化证据 |
| Dead-code cleanup PR 实测分析（Optuna/mitmproxy） | 经 Skylos 综述信源 | Criticism | 28 findings→11 幸存；203 unused exports 大半框架假阳 |
| sentri staleDetector 源码 | rameshbabuprudhvi.github.io/sentri/... | Community | stale-test 探测器挂真实运行史非预建同构先例 |
| 本仓 _lib/env-contract.mjs / check-kit.mjs / 46/39-check.mjs / 33-gate-registry.json | 本地 | 本仓一手 | envProbe 整件粒度签名、TIER 双声明、连坐实证、哨兵锚现役 |
| 本仓 decision-ledger（D-159/160/079/149/094/148/155、R23、A-097/098） | .scratch/architecture-recovery/decision-ledger.md | 本仓一手 | 冲突清单 C1–C7 裁定基线 |

## 7) 信息缺口

- Tavily 引擎配额耗尽（本会话限流），第三引擎交叉仅 AnySearch＋Exa 双轨达成；无第三独立引擎复核。
- Go t.Skip（非 Fatal）在 subtest 中对父测试的计数语义未深挖源码——博客只证 Fatal 行为，t.Skip 的父级呈现假定同构，未二源钉死。
- 47-check 是否也有 sibling 依赖之外的组内异质未逐一普查（本轮只实证 46/39 两案），groupProbe 落地前需 75a-T3 同窗对账。
- retired 发射腿复用 VACUOUS 机件的方向反转成本（守卫探自己 vs 探测器探守卫）未做代码级评估，留首例临窗裁定时补。
