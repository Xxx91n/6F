# R27-Q2 atomcode 调研题面（存档）

> 2026-09-22 轮27 grill Q2。执行面=atomcode -p（ctx_batch_execute 串行）。

## 调研问题（verbatim 发出）

开源开发者工具仓的「logo/品牌资产族」投入边界取舍：一个开源工程内容审计产品（Agent Plugin 分发形态=CLI 内核+插件五层盒子，**非 web 应用**；Apache-2.0；preview 阶段）已有 docs/listing/icon.svg（512x512 自绘 SVG：放大镜+审计网格+证据锚点，hero.svg 横幅与 listing 图标均由其派生——它已是事实 logo）与 social-card.png（已产未上传）。问题=是否补建完整品牌资产族：选项 (a) 不上管线（icon.svg 已够，favicon/PWA 图标族对无 web 消费面的 CLI/插件仓是装饰）；选项 (b) 轻量派生（从既有 icon.svg 脚本化派生 logo.png 深浅版+favicon 16/32/48+apple-touch-icon+webmanifest——无生图无新概念，纯派生补家谱）；选项 (c) 全管线（新 logo 概念设计+通用生图模型生成+1024 母本+dev/staging/prod 状态色变体+全套派生矩阵+活文档——品牌资产完整但含新概念设计与生图成本，且与「已有 logo 优先复用」红线有张力）。请调研：①CLI/开发工具类开源项目（非 web 应用）在 logo/品牌资产上的成熟投入惯例——favicon/apple-touch-icon/PWA manifest 对**没有自家网站**的 GitHub 仓是否真有消费面（GitHub 仓页面本身用不到 favicon，消费面到底在哪：插件市场列表/文档站/社交分享/终端？）；②「单一母本→脚本派生矩阵」vs「新设计+生图」的维护成本与一致性纪律先例；③对本题给出推荐——判据应是什么（真实消费面枚举优先于资产完整性？品牌成熟度阶段与资产投入的匹配惯例？）。辩证看待，指出牵强处与反例（资产族沦为仓库杂物/social-preview 与 GitHub repo 级社交卡片的真实生效面/重资产族对小众工具仓的过度建设）。
