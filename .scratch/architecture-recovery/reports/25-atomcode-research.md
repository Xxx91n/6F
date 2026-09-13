# 25 — atomcode 深度调研报告（A-030 / spec §R3-D7）

> 调研主题：「铺开与分发收尾」前置清单的工业形态——插件上架前置条件 / 演示资产范围 / backlog 转正心智模型。
> 提示词留档：`reports/25-atomcode-prompt.md`。本报告只作前置清单的校准输入，零实施（per A-030）。

## §0 执行通道留痕

- 载体：atomcode 5.0.9（52ca5e6），经 `ctx_batch_execute` 单轮串行（concurrency=1，timeout=600000），一次跑完、未中断；resume 锚点 `14de13fa-47fc-4538-b44b-154a98d4c070`。
- Sufficiency Gate 自查（atomcode 自报）：searches 7（Exa×2 / Tavily×3 / AnySearch×2）；角度 Official/Comparative/Criticism/Currency/Community 全覆盖；全文阅读 6 篇（developer.chrome.com×3、extensionworkshop.com、plugins.jetbrains.com、launchdarkly.com；另 2 个 404 已换源）。
- 诚实性留痕：agent 原生市场（MCP Registry 等）一手规范未读到全文——本报告的「通行清单」由四大成熟插件市场（CWS/AMO/JetBrains/Open VSX）外推，见 §5 缺口 1；与本仓 Agent Plugins 1.0.0 五层盒子（D-012/ADR-0008）的衔接按「适用性边界」处理，不静默改向。

## §1 执行摘要（TL;DR）

- **上架前置条件 = 四层闸门**：①manifest/元数据合规（名称唯一、版本 SemVer、权限声明、隐私政策）；②版本与上游锁定（版本号单调递增不可复用、依赖锁定、可复现构建/源码包）；③审核与签名（自动化+人工双轨审核、平台代签或开发者证书签名、测试账号/说明）；④最小可发布形态（图标+截图+描述+支持链接的最低 listing 集）。置信度**高**（4 个市场官方一手文档交叉支撑）。
- **演示资产界定法则**：「审核员 + 首次访客」两条消费路径定边界——审核员路径 = 测试说明/演示入口/样例报告（CWS Test instructions 标签、AMO Notes for Reviewers 字段有官方槽位级支撑）；访客路径 = 图标/截图/描述/视频（各市场有明确尺寸下限）。「够」的判据 = 审核材料逐条对得上审核表单字段 + 营销资产覆盖 listing 每个图形槽位；范围上界 =「能被审核员验证」，不是越大越好。
- **backlog 转正心智模型**：DoR（Definition of Ready）+ DEEP + Release Readiness Checklist/PRR 三件套——DoR 管单 ticket 够不够格开工、DEEP 管 backlog 整体健康度、Release Readiness（LaunchDarkly 五阶段 25 步 / PRR）管 ready→ship 最后一公里。置信度**高**（Atlassian + LaunchDarkly 两源）。

## §2 分点结论（附来源）

### 2.1 前置条件清单的通行骨架（四个市场的公约数）

**① Manifest / 元数据规范**
- VS Code：`package.json` 必填 name（小写唯一）、version（SemVer）、publisher、engines（禁 `*`）；README/CHANGELOG 图片必须 https 且禁 SVG；`enableProposedApi` 直接禁止发布 [code.visualstudio.com manifest + publishing 文档]。
- Chrome：MV3 下仅改代码的更新审核极快（<1 分钟），改 manifest.json/截图/描述触发 2 小时–7 天审核 [developer.chrome.com/review-process 官方口径「几天到几周」+ getsnapfont.com 实测]。
- JetBrains：名称 ≤30 字符、logo 40×40 SVG、不得仿冒商标、描述英文优先、change notes 禁模板占位符 [Approval Guidelines v1.3，2026-03-31 生效，已全文]。
- Firefox：包体 ≤200MB、混淆/压缩代码必须提交源码包、privacy policy 有强制场景 [extensionworkshop.com 提交指南，2026-05，已全文]。

**② 版本与上游锁定**
- 版本号不可复用是全线铁律：JetBrains 明确拒绝同版本重复上传；Firefox 同版本不可跨 listed/unlisted 复用；Open VSX/VS Marketplace 走 SemVer 单调且不收 prerelease 字符串。
- 上游锁定：开放许可插件要求提供源码链接（JetBrains 3.3 条、AMO Source Code Submission）= 依赖可追溯/可复现构建；审计类产品叠加「混淆代码须附可读源码包」（AMO 硬性）。
- 实战补充（ctx 知识库召回）：CI 里用 jq/node -e 读 manifest 版本 + GitHub Marketplace 现成上传 action（chrome-extension-upload、action-web-ext）是社区事实标准。

**③ 审核 / 签名**
- 签名机制三分天下：AMO 平台代签（listed 审核即签；自分发走 web-ext sign）；JetBrains 开发者密钥对 + signPlugin 证书链签包 + Marketplace 验签；CWS 不签包，靠审核+周期性复检。
- 审核「自动化+人工」双轨是全行业共识；新开发者/新扩展/危险权限/大代码量四类信号拉长审核 [CWS review-process 官方，已全文]。
- 审核时长**分歧如实记录**：官方「多数几天内、可到几周」vs 第三方实测「最坏 3 周+」vs SEO 文「90% 三天内」——审核时长不可作排期承诺，只能作缓冲假设。

**④ 最小可发布形态（Minimum Publishable Shape）**
- CWS 最小集：128×128 图标 + ≥1 张 1280×800 截图 + 详细描述 + 类别 + 语言 + 隐私页（single purpose + 数据使用声明）+ 分发区域选择。
- 各市场最小集差异见 §2.2 矩阵；「最低 listing 集」概念本身为四市场公约数。

### 2.2 市场对比矩阵

| 项 | Chrome Web Store | Firefox AMO | JetBrains Marketplace | Open VSX / VS Marketplace |
|---|---|---|---|---|
| Manifest 载体 | manifest.json (MV3) | manifest.json (WebExtensions) | plugin.xml + Gradle 配置 | package.json (vsce/ovsx) |
| 版本规则 | 单调递增，不可复用 | 单调递增，跨通道不可复用 | 明确拒绝同版本重复上传 | SemVer，Marketplace 不收 prerelease |
| 签名 | 不签包（审核+复检） | 平台代签（listed）/ web-ext sign | 开发者证书签名（signPlugin） | 不签名（命名空间+PAT 鉴权） |
| 审核 | 自动+人工，几天~几周 | 自动+人工，24h~数天；自分发分钟级 | 全量人工复核，3–4 工作日 | 近乎即时（校验即上） |
| 最小图形资产 | 128 图标 + ≥1×1280×800 截图 + 440×280 promo | 无强制图形（分类+描述即可） | 40×40 SVG logo；主题类强制截图 | 128 图标 + README 图（https） |
| 测试材料 | Test instructions 标签（可选） | Notes for Reviewers 字段 | 审核邮件往来/说明 | 无（自助上架） |
| 特色前置 | $5 注册费、新发布者限 2 个扩展 | 混淆代码必须交源码包 | Plugin Verifier + EULA + EEA trader 声明 | 命名空间需先创建 |

### 2.3 演示资产范围如何界定才「够」

判定法则 =「一个槽位一份资产，两条路径逐一对齐」：

1. **审核员路径**（决定能否过审）：审计类工具的特殊性 = 审核员无法「用一下就懂」，故**样例报告 = Test instructions**。应提供：预置数据的演示入口（demo 账号或内置样例项目）+ 一份导出样例报告 + 「5 步复现核心功能」演示路径（CWS 官方字段、AMO 官方指南双支撑）。
2. **访客路径**（决定转化率）：覆盖 listing 每个图形槽位——商店图标（统一 128×128 或平台规格）、主截图 1280×800（CWS 上限 5 张、JetBrains 推荐 16:10、禁设备相框照与小字 [Approval Guidelines 1.6 条]）、可选 promo 视频（CWS 走 YouTube）、hero/promo tile（CWS 440×280 必填、1400×560 可选）。
3. **范围红线**：截图不得与实际功能不符（JetBrains 1.6.e must not misrepresent）；多语言 listing 元数据不得宣称不一致功能集（CWS 自动检测告警）——**演示资产范围以「能被审核员验证」为上界**。
4. 样例报告须「含真实感数据但不含敏感数据」，且**版本跟着产品走**（每次发版重跑生成，与 §2.1 版本锁定同一条纪律的资产面延伸）。

### 2.4 backlog 项转正式 ticket / release readiness 的成熟心智模型

| 心智模型 | 管什么 | 核心机制 | 来源 |
|---|---|---|---|
| DoR（Definition of Ready） | 单 ticket 够不够格开工 | 标题清晰、WHY 说明、验收标准可测、范围 2–5 天、无阻塞、依赖已链接；红灯项打回 refinement | Atlassian backlog grooming + DoR 实践文（含「~10% tickets 才该是 Critical」量化红线） |
| DEEP | backlog 整体健康度 | Detailed appropriately / Estimated / Emergent / Prioritized | Atlassian（摘要级） |
| DoR vs DoD 对照 | 分清入口/出口闸门 | DoR=开工前（PO+团队）：AC✓/估点✓/无阻塞；DoD=完工后：评审✓/测试✓/文档✓ | 同上，两源一致 |
| Release Management Checklist（五阶段 25 步） | ready→ship 全程 | pre-release planning → dev&test → release prep → execution → post-release；progressive rollout（1%→100%）、回滚预演、retrospective 更新清单本身 | LaunchDarkly（已全文） |
| Production Readiness Review（PRR） | 服务/产品级「能不能上」 | 形式化检查点：SLO、监控、on-call、回滚、安全审查制度化 | cortex.io / opslevel（摘要级，见缺口） |

与本仓衔接：本仓已用「立票 → 验收清单（AC 表 + status + evidence 列）→ 真实 run-id 留证」形态（DoD 侧严格），与 LaunchDarkly 五阶段同构；缺的是把 DoR 闸门前置化——本票的「逐项待用户拍板前置清单」正是 DoR 入口闸门的对应物。

## §3 推荐的前置清单结构（可直接落地）

推荐 **G0–G4 五闸门 + 阻塞/非阻塞分级 + 证据列**：

- **G0 版本与构建（阻塞）**：版本号 > 商店当前版且全通道未复用；依赖锁定可复现构建；构建产物 = 上传产物（同一 CI 产物直传）。
- **G1 Manifest 与政策合规（阻塞）**：必填字段本地校验通过（vsce ls / web-ext lint / Plugin Verifier）；权限最小化逐条写必要性；隐私声明与代码行为一致；无混淆代码或备好源码包。
- **G2 审核材料（阻塞）**：Test instructions/演示账号/内置样例入口齐；样例报告随本版本重新生成；演示路径 5 步走查通过（录屏存档）。
- **G3 Listing 资产（阻塞=最小集；非阻塞=增强集）**：最小集=图标+≥1 张 1280×800 截图+描述+类别+支持链接；增强集=promo tile/视频/本地化 listing；资产不含过期版本号与第三方商标。
- **G4 签名与发布通道（阻塞）**：签名证书/通道策略就位；上传凭据在 CI secrets；回滚预案 = 上一版本包 + 上架快照；发布时机可选 defer publish（审核后手动放行，留 30 天窗口）。

理由：①市场审核是「一票否决」型检查，闸门化防止带病提交（CWS 官方确认 rejected 后复审更慢）；②证据列把 checklist 变成可留痕 AC 表，与本仓守卫脚本形态同构；③阻塞/非阻塞分级避免「hero 图没做」卡死「能过审」主线。

## §4 综合段

### §A 心智模型/类比映射（≥2，逐条支撑本票哪个设计决策）

| # | 类比（成熟心智模型/工具/论文） | 支撑本票哪条 |
|---|---|---|
| 1 | **四市场上架四层闸门**（manifest 合规 → 版本/上游锁定 → 审核/签名 → 最小可发布形态；CWS/AMO/JetBrains/Open VSX 官方文档交叉） | 前置清单 §6 plugin 上架条件逐行的「能/不能/需什么」判定框架——本仓五层盒子未实现前，上架各行只能判「不能+需什么」 |
| 2 | **DoR + DEEP + Release Readiness 三件套**（Atlassian DoR/DEEP + LaunchDarkly 五阶段 25 步 + PRR） | 前置清单整体形态 = DoR 入口闸门：BACKLOG B1/B2/B3 的「立票建议」先经逐项拍板清单（本票产物），拍板后才转正式 ticket——与本仓「票→AC 表→守卫」DoD 侧形态互补 |
| 3 | **「一个槽位一份资产，两条路径」演示资产法则**（CWS Test instructions / AMO Notes for Reviewers / JetBrains 1.6 条） | 前置清单 §7 演示资产范围——审核员路径（样例报告+演示入口+5 步走查）与访客路径（图标/截图/hero）分列，范围上界=可被审核验证 |
| 4 | **版本号不可复用铁律 + 源码包义务**（JetBrains publishing 文档 / AMO Source Code Submission） | 前置清单 §6-P2 上游锁定行；与 D-020 双轨制②（lockfile hash pinning）同向印证 |

### §B 冲突点名（与 current 决策逐条核对）

- **零改向冲突**：调研结论与 D-012/ADR-0008（五层盒子+双 manifest）、D-015/ADR-0011（单仓子目录）、D-016（阶段 3 = 铺开+分发收尾）、D-020（双轨制+逃生舱）、D-021（README 五段式 + 「不暗示已发布」）全部一致，无 revised。
- **适用性边界（显式记录，非冲突）**：调研对象为四大成熟编辑器/浏览器插件市场；本仓目标分发形态是 Agent Plugins 1.0.0 五层盒子 + 双 manifest（D-012），agent 原生市场一手规范未读到全文（§5 缺口 1）。四层闸门结构作为校准输入外推有效，但落地前必须读 Agent Plugins 1.0.0 plugin schema 原文——该前置已登记在 D-020 派生待决（运行时解析策略前置）。
- **同向印证**：D-020②「库形态走 lockfile hash pinning」与调研 §2.1②「版本不可复用 + 依赖可追溯/源码包义务」同向；D-021「不暗示已发布（A-030 deferred）」由本票逐项「待用户拍板」标记承接，语义未变。

### §C 校准输入声明

本调研只作前置清单的校准输入：不执行任何上架/push/立票动作（A-030 零实施约束）；清单内每项行动仍以「待用户拍板」为唯一出口。

## §5 信息缺口（Sufficiency Gate）

| # | 缺口 | 性质 | 处置 |
|---|---|---|---|
| 1 | Agent 原生市场（MCP Registry、各家 agent plugin marketplace）一手发布规范全文 | 未读到一手 | 落地前须读目标市场具体文档 + Agent Plugins 1.0.0 plugin schema 原文（已在 D-020 派生待决登记） |
| 2 | Cortex/OpsLevel PRR 文章 | 仅摘要级 | PRR 细节以 LaunchDarkly 全文为准 |
| 3 | 知名开源项目 release checklist 实例（rocket.rs RELEASES.md 等） | 样例 404 | 以 LaunchDarkly 五阶段模板替代 |
| 4 | CWS「90% 三天内过审」说法 | 出自 SEO 培训内容，未获官方证实 | 按「分歧」处理，不采纳；审核时长只作缓冲假设 |

## §6 来源清单

| # | 标题 / 信源 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| 1 | Publish in the Chrome Web Store（官方） | developer.chrome.com/docs/webstore/publish | Official | CWS 上传流程、扩展上限、defer publish 30 天窗口 |
| 2 | CWS review process（官方，已全文） | developer.chrome.com/docs/webstore/review-process | Official+Criticism | 自动+人工双轨、拉长审核四类信号、申诉通道 |
| 3 | CWS listing 信息（官方，已全文） | developer.chrome.com/docs/webstore/cws-dashboard-listing | Official | 图形资产尺寸全集、本地化一致性警告 |
| 4 | Submitting an add-on（Mozilla 官方，已全文） | extensionworkshop.com/documentation/publish/submitting-an-add-on/ | Official | AMO 全字段清单、200MB 限制、源码包义务、Notes for Reviewers |
| 5 | JetBrains Marketplace Approval Guidelines v1.3（官方，已全文） | plugins.jetbrains.com/docs/marketplace/jetbrains-marketplace-approval-guidelines.html | Official | 名称/logo/截图/审查/法律五类硬性标准、反干扰条款 |
| 6 | LaunchDarkly Release management checklist（已全文） | launchdarkly.com/blog/release-management-checklist/ | Official(厂商)+Currency | 五阶段 25 步模型、progressive rollout、retrospective |
| 7 | VS Code Extension Manifest / Publishing（官方，Exa 全文检索） | code.visualstudio.com/api/references/extension-manifest + .../publishing-extension | Official | manifest 必填字段、vsce 校验规则（SVG/https/prerelease 禁令） |
| 8 | Open VSX 发布流程（Eclipse 新闻稿 + GitHub wiki，两源） | newsroom.eclipse.org（Open VSX 稿）+ github.com/eclipse/openvsx/wiki/Publishing-Extensions | Official | ovsx create-namespace/publish 流程 |
| 9 | Atlassian backlog grooming + DoR checklist 实践文 | atlassian.com（agile/backlog grooming 系） | Community | DoR 六要件、DEEP、DoR vs DoD 对照、「~10% Critical」红线 |
| 10 | web-ext issue #1737（知识库既往调研召回） | github.com/mozilla/web-ext/issues/1737 | Community | Firefox 版本号跨通道不可复用 |
| 11 | JetBrains Plugin Signing / Publishing 文档 | plugins.jetbrains.com/docs/marketplace/ | Official | signPlugin 证书链签包、同版本拒收 |
| 12 | getsnapfont.com 实测（CWS 审核时长） | getsnapfont.com | Community | 审核时长第三方实测口径（与官方分歧已如实标注） |
| 13 | cortex.io / opslevel PRR 文章 | cortex.io / opslevel.com | Community | PRR 模型（摘要级，见缺口 2） |
