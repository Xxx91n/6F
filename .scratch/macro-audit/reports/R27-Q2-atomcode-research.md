# R27-Q2 atomcode 深调研报告 —— 开源 CLI/插件仓 logo/品牌资产族投入边界（2026-09-22）

> 置信度：高。Sufficiency Gate：searches 10（Official/Comparative/Criticism/Community 四角）｜原文全读 6｜缺口：Tavily 配额超限未参与（两引擎+6 次原文核验补足）；「无网站 CLI 仓 favicon 消费面」无直接量化数据=机制推导。题面存档=R27-Q2-research-prompt.md。
> **串仓幻觉勘误（本窗口实证）**：调研中「本仓 docs/brand/ 24 文件＋.github/assets 派生族已在实践」为知识库串仓误召回——实证本仓两目录均不存在，实际资产=docs/assets/{architecture.svg,hero.svg,social-card.png}+docs/listing/icon.svg。该论据已剔除。

## 1) 执行摘要

**推荐 (b) 轻量派生，且按消费面裁剪，不做全套。** 判据：① 真实消费面枚举——favicon/PWA manifest 仅在「存在被浏览器打开的 HTML 页面」时才有消费面（web.dev 官方：manifest 必须经 <link rel=manifest> 挂在 HTML 页上才生效），GitHub 仓页面不读仓内 favicon，本仓唯一真实消费面=docs 站（若部署）；② 插件市场类列表只要**一张固定尺寸 PNG**（VS Code Marketplace：≥128×128 PNG、256×256 Retina、明确禁 SVG——官方 Extension Manifest+publishing 双源核验），不需要资产族；③ (c) 生图+新概念与「已有 logo 优先复用」红线直接冲突，且单一母本→脚本派生已被工具生态验证为纪律最优解（brandkit/favigen/pwa-asset-generator 全是「one SVG in, everything out」形态）。

## 2) 分点结论

### ① 消费面枚举：favicon 族对无 web 消费面的仓≈零消费，除非 docs 站上线

- GitHub 仓页面：社交卡片=repo Settings 里**上传的 social preview**（GitHub 官方文档已核验：PNG/JPG/GIF <1MB，推荐 1280×640），**不读取仓内 favicon.ico/apple-touch-icon/webmanifest**；「repo 根放 favicon.ico 生效」说法只适用于 GitHub Pages（reddit/SO 交叉）。
- 插件市场（VS Code Marketplace 对标）：消费面只需**一张** icon PNG（≥128×128，256×256 Retina，禁 SVG）+可选 galleryBanner 色值——不存在 16/32/48/favicon 家族需求。
- npm 包页：**无标准 logo 字段**——2015 年 feature request 至今未实现（npm/npm#10323 核验），首页 top 包 logo 是硬编码关联非 package.json→npm 消费面=零。
- 社交分享：唯一生效=social-preview（已产未上传——**上传比任何资产族建设都优先，零成本动作**）。
- 终端/CLI：不消费任何位图资产。
- **结论**：真实消费面=①GitHub social preview（已产）②插件市场 128×128 PNG ③docs 站（若部署才有 favicon+apple-touch-icon 意义）。PWA manifest 无可安装 web 面=纯装饰。

### ② 单一母本→脚本派生 vs 新设计+生图

- 工具生态收敛于「one SVG in, everything out」：brandkit 把生图管线列为**多步且易漂移**路线（DALL-E/Midjourney 5 步 vs brandkit 1-2 步），卖点=verify CI gate 防 off-palette 色漂移——生图路线已知缺陷恰是**一致性维护成本**；favigen/RealFaviconGenerator/pwa-asset-generator 同构。
- SVG Genie 指南（已核验）：「SVG as source of truth, PNG exports for the handful of contexts that require raster」=确立惯例；现代浏览器 SVG favicon 已可一文件覆盖多数场景，位图矩阵比传说中更可裁剪。
- 反向佐证（Criticism）：生图下游问题=3-15 RGB 点/色漂移「肉眼不可见但跨 surface 累积」（brandkit 实测），重资产族无 CI gate 时**必然**漂移为仓库杂物。

### ③ 判据与推荐

- 判据一（采纳）：**真实消费面枚举优先于资产完整性**——资产完整性是品牌成熟度的函数；preview 阶段 CLI/插件仓品牌接触点总共 2-3 个，资产族投入超过接触点数即过度建设。
- 判据二（部分采纳+修正）：「品牌成熟度阶段匹配」成立但方向相反——**不是等品牌成熟才建资产族，而是消费面出现才建对应资产**。接触点驱动非阶段驱动。
- **具体推荐（(b) 裁剪版）**：
  1. **先做（零成本）**：social-card.png 上传为 repo social preview——全链路唯一被外部社交平台直接消费的资产，已产未传等于没产。
  2. **做**：icon.svg 脚本化派生**插件市场要求的单张 PNG（128×128+256×256）**与 **logo.png 深浅版**（README/终端展示用）——已确认消费面。
  3. **缓做/条件做**：favicon 16/32/48+apple-touch-icon 仅在 docs 站实际部署时派生（届时一条脚本命令，不必现在预置）。
  4. **不做**：webmanifest/PWA 图标族（无可安装 web 面纯装饰）；dev/staging/prod 状态色变体（CLI 工具无此消费面）；1024 母本+新概念+生图（撞复用红线，一致性维护成本为负资产）。

### ④ 辩证与牵强处

- 「消费面枚举」牵强处：favicon 脚本派生边际成本趋零，「做全」的反对理由不是成本而是**杂物化**——资产膨胀倾向的裁剪纪律比省钱更重要。
- 反例 1：npm#10323 十年未实现的 logo 字段——为不存在的消费面预置资产，等消费面出现时规范早已变=负期望。
- 反例 2：GitHub social preview 只在**显式分享 repo URL** 时展开（无图退化为 owner avatar）；README 内嵌/终端/安装流程完全不经过——「一次点击的呈现」，投入上限=一张 1280×640 图，本题已达标。
- 反例 3：brandkit 这类**本身是品牌工具**的项目才有动力维护 14 文件矩阵；普通工具仓维护带 CI gate 的资产管线，成本超过曝光收益。
- 对 (a) 的辩护与否定：(a)「icon.svg 已够」在「无 docs 站」前提下几乎成立，但市场 PNG 与 social preview 上传是已确认缺口，纯 (a) 会漏唯一免费曝光面——裁剪版 (b) 是正解。

## 3) 来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| GitHub Docs social media preview | docs.github.com/.../customizing-your-repositorys-social-media-preview | Official | 已核验：1280×640、上传制、不读仓内 favicon |
| VS Code Extension Manifest | code.visualstudio.com/api/references/extension-manifest | Official | 市场只需单张 ≥128 PNG、禁 SVG |
| vscode-docs publishing-extension.md | github.com/microsoft/vscode-docs | Official | 市场图标规范交叉验证 |
| web.dev Web app manifest | web.dev/learn/pwa/web-app-manifest | Official | manifest 依赖 HTML link，无页面即无效 |
| brandkit README | github.com/gent8/brandkit | Comparative | one-SVG→14 资产形态；生图路线步数/漂移对比 |
| SVG Genie SVG vs PNG guide | svggenie.com/blog/svg-vs-png-startup-logo-format-guide | Comparative | SVG 母本+按需 PNG=确立惯例 |
| Scarf repos-not-enough-for-docs | about.scarf.sh | Criticism | repo 作为唯一面的局限→docs 站潜在消费面 |
| npm#10323 logo field | github.com/npm/npm/issues/10323 | Criticism | npm 无 logo 消费面十年未实现 |
| favigen | github.com/tdanks2000/favigen | Community | 派生工具生态佐证 |
| r/github+SO favicon threads | reddit/SO 35037482 | Community | favicon 生效仅限 GitHub Pages |

## 4) 信息缺口

- 「无网站 CLI 仓 favicon 族实际点击/加载数据」无直接统计——「消费面≈零」由机制推导（manifest 需 HTML、npm 无字段、GitHub 不读）非流量数据。
- 本仓具体分发市场图标规范未确认（调研以 VS Code Marketplace 对标）——若上 OpenVSX 同规范单张 PNG 结论不变；**本仓实际 marketplace.json/plugin.json schema 实证无 icon 字段**（本窗口核验），市场 PNG 消费面对当前分发形态亦为零——须按真实消费面再裁剪。
- Tavily 配额超限，第三引擎交叉由 AnySearch 独立补足（5 域名、6 次原文核验）。
