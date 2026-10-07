# R66-Q3 深度调研报告——②git-history 探测面入 D-163 分类

> atomcode 真回传存档（session 2026-10-06 03:02 batch:atomcode，13 节索引）。
> 三引擎交叉：浅克隆截断语义=git-scm＋github.blog＋mironsoft 三源一致；Sonar 复发=社区帖＋SO＋exasol issue 三源；能力注册表惯例=systemd＋NFD＋Bazel 三独立体系一致；Exa 本时段限流由 Tavily/AnySearch 补位。

## 1) 执行摘要（Tl;dr）

**推荐候选 (i) 修正版：`git-history:` 入册第五类**，按 D-146⑤ scoped 勘误文法登记（「四类」→「五类」注记，非改写枚举历史），caller-override 逃生口保留，粒度措辞须精确为「portable 守卫的**组级 need**（D-164-a① groupProbe 子面降级）非整件 env-contract 前置」。**Confidence：高**——运行时机制已在 84-check 以 need()/groupProbe 跑通、FIX 名册缺口是纯登记问题（≈5 行）、且工业界（SonarQube）证明浅克隆历史可达性断言面是**真实复发面**而非单消费方 YAGNI。

## 2) 逐候选点评

### (i) 入册第五类（SSOT 化）——推荐，带三处修正

赞成理由：
1. **机制面已实跑**：84-check 已以 need("git-history:full", false, …) 走通 caller-override 三段式——入册不是新立法，是把已存在的消费方从逃生口收编回 SSOT（名册前缀命中后 caller 第三参自动退役为纯逃生口）。
2. **修复语义独立成类**：git-history 修复=加深克隆/CI fetch-depth:0 **须联网**；现四类修复面的联网取值各不相同（git-object: 仓内 bundle 自足零联网／sibling: 本地路径零联网／asset: 视播种源／engine-deps: npm registry 须联网）——第三段「无网影响面」取值空间不同正是 FIX 按类分立的存在理由。git 官方文档（git-scm.com/docs/partial-clone）明言对象级过滤（partial clone）与 DAG 级截断（shallow clone）是**两个独立维度**：「independent of and not intended to conflict with existing DAG-level mechanisms」——git 自己都不并类，本仓更无并类理由。
3. **复发面实证**：SonarQube 对 .git/shallow 的历史可达性自检至今仍在 PR/target-branch 双 checkout 形态下反复误判复发——「下一守卫手搓三段式」不是假设而是已验证的模式。

**三处修正**：

- **修正 A——粒度措辞**：不得写成「第五类 env-contract 前置」。84-check 是 portable tier（D-159①②）守卫，git-history 缺席走 D-164-a① 组级闸（SKIP-GROUP、组级计数、文件级 rc=0），非整件 env-contract SKIP 退出。入册登记的是 FIX 模板名册条目（need 家族类型路由表），与 tier 重声明无关——本裁**不触发 84-check tier 变更**。
- **修正 B——修复指引与 D-074 边界**：git-history 的手动修复指引**不得写「在守卫运行的主仓 git fetch --unshallow/--deepen」**——撞 D-074（禁主仓 fetch 写 object store）。三段式第三段应写：CI checkout 配置 fetch-depth: 0，或专用 clone 物化（同 D-163① 临时仓读法家族），并声明无网影响面=浅克隆检出下历史可达性组持续 SKIP。
- **修正 C——三段式草稿**（D-072 文法）：
  > 原因：主仓为浅克隆检出（--is-shallow-repository 为真），对象库形状不含深历史——历史可达性子面在本环境不可判；手动修复：CI checkout 配置 fetch-depth: 0，或以完整克隆于独立路径物化后重跑（禁在守卫运行主仓 fetch 写 object store〔D-074〕）；无网影响面：加深克隆须联网，离线环境不可修、该组维持 SKIP-GROUP。

### (ii) 并入 git-object: 家族——拒绝，判据清晰
FIX 模板语义根本不同源（git-object 修复=恢复在仓 bundle；git-history 修复=加深克隆须联网）；git 上游官方对 shallow（DAG 截断）/partial（对象过滤）明确分立——「independent and not intended to conflict」。并类=模板错配＋与上游语义分类逆行。

### (iii) 维持 caller-override 现状——拒绝
SonarQube 先例证浅克隆历史可达性断言是**跨工具同构复发面**非 84-check 独有；SSOT 化成本≈FIX 名册一条目＋need() 头注一行＋账本 scoped 勘误，收益=「下一 portable 守卫的历史断言面不再手搓」；caller-override 设计初衷是「asset: 等播种命令各异面」的**例外通道**非**常态载体**——首用即走逃生口恰说明名册缺类；YAGNI 判据正解=「降级行为语义是否已稳定复用」——84-check 已稳定复用（组级 SKIP 语义冻结），入册恰是 YAGNI 正确时机（晚于首用、早于第二消费方）。

### (iv) 归 consumption_forms 域——拒绝，但吸收其层间划分
运行时机制已是 need()/groupProbe 驱动（SKIP 三态管道现成）；D-214 consumption_forms 管「谁在什么形态消费我」声明面，need() 管「缺席时如何优雅降级」机制面——两层互补非竞争，(iv) 的分层观察被本裁吸收（D-214 枚举面恰消费 need 类型名为其值域成员）。

## 3) 工业先例证据（带出处）

| 先例 | 机制 | 对本题映射 | 出处 |
|---|---|---|---|
| systemd Condition* 条件族 | 40+ 个 Condition*= 键的类型化条件注册表：类型分立（PathExists/KernelVersion/Virtualization…），缺席→静默 skip 非失败 | need 四类→五类=systemd 条件族形态：新探测维度=新 Condition 类型，非塞进现有类型参数 | freedesktop.org systemd.unit(5)，manpages.debian.org 镜像 |
| Bazel tags 关键字表 | 封闭性以枚举关键字登记（requires-network/block-network/local…）每关键字一段精确语义 | 环境前置类型化登记惯例；Test Encyclopedia 封闭性=「只访问已声明依赖」与 D-163「声明前置→缺席优雅降级」同构 | bazel.build common-definitions＋test-encyclopedia |
| K8s Node Feature Discovery | 能力探测→标签命名空间 feature.node.kubernetes.io/<类>-<特征>，特征类分立可经 NodeFeatureRule CRD 扩展 | 前缀路由即标签命名空间惯例；新维度=新命名空间段不并入既有段 | github.com/kubernetes-sigs/node-feature-discovery |
| git partial-clone 官方规范 | 对象级过滤与 DAG 级截断（shallow）明言「independent…not intended to conflict」 | git 上游自身对 git-object/git-history 两维分立的直接先例 | git-scm.com/docs/partial-clone |
| semver 枚举扩列惯例 | 向后兼容新增=minor，additive change 不改写既有枚举语义 | 「scoped 勘误 vs 直接改写」的版本化答案：加注记保历史 | semver.org |

## 4) 账本冲突清单（硬要求核查）

| # | 编号 | 冲突点 | 处置 |
|---|---|---|---|
| 1 | D-163① | 字面「四类前置」——第五类入册=**扩展非修订**（立法时点无 git-history 消费方，扩列不废既判） | D-146⑤ scoped 勘误注记挂 D-163①，不整体改写（sibling 画像 9→3 勘误、D-148→revised 均注记不改史同型） |
| 2 | D-159① 摘录段 | 「need 类型四族机读面（env-contract.mjs SSOT）」字面=四族——入册后该段与 SSOT 头注同步失真 | 同一 scoped 勘误覆盖：账本摘录段＋env-contract.mjs 头注＋need() 头注三处同窗更新（D-160③「双字段同窗」同型纪律） |
| 3 | D-074 | git-history 修复=加深克隆，若指引写「主仓 fetch --unshallow」直接撞 D-074（禁主仓 fetch 写 object store） | 修正 B：修复指引限定 CI 配置面/独立路径完整克隆，显式援引 D-074 |
| 4 | D-159①② portable 判据 | 84-check 为 portable tier 却携带组级 SKIP——「仓内自足随处可跑」与「有前置可缺」字面张力 | 非实质冲突：D-164-a① 组级闸＋D-159③「skip 不进 allOk」文法已兼容——portable 准确读法=「可跑、缺前置的组如实 SKIP-GROUP」；**须显式声明此读法免被读作 tier 降级——呈报拍板确认** |
| 5 | D-214 | 若降级机制写进 consumption_forms 域则竞争 | 候选 (iv) 已拒——两层互补；本裁限定 need 家族不触碰 D-214 声明面 |

## 5) 置信度自评

**高（~0.85）**。核心推荐有：本仓机制实跑实物证据（FIX 名册与 need() 路由全文、84-check 调用形态本轮直读）、工业界三独立体系类型化注册表惯例一致、git 上游 shallow/partial 分立一手规范、SonarQube 十年复发史实证。扣分项：D-146⑤/D-163① 逐字原文未核到（沙箱提取落空，引文依赖索引段），修正 B 的 D-074 边界判断基于摘录段非原文全读。

## 6) 信息缺口清单

1. D-146⑤/D-163① 逐字原文未核到（沙箱提取落空）——scoped 勘误的具体文法引用以索引段为据，执行窗落笔前须亲读原文核对字段级措辞；
2. D-074 原文未全读——「禁主仓 fetch 写 object store」的精确边界（是否含 fetch 以外写形态）执行窗须亲核；
3. 修正 C 三段式草稿为调研拟定——落 SSOT 时须与现有四类的语气/字段长度对齐走格式校验。
