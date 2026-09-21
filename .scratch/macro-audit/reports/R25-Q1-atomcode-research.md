# R25-Q1 atomcode 调研报告（存档）

> 2026-09-21 轮25 grill Q1。置信度：高（8 检索／11 原文全文读／Exa+Tavily+AnySearch 三引擎／四角度 Official+Comparative+Criticism+Community 全覆盖）。来源：muji blog/Zinzin/Nucleus/The Name Inspector/fly.io/Tessl/Daytona/banesullivan/Brandchemy/Namingbrain/Software Sustainability Institute/createabilitygroup/jasonfagan/kerryhatcher——全文经 ctx 索引 source=atomcode 可回捞。

## ① 命名判据（核心）

- **分界线不是「缩写好不好听」而是「缩写是否压缩了已建立的含义」**（Nucleus：IBM/3M/KFC 权威来自 initials meant something before；Zinzin：no pathways between image and product=反例判据）。六句 F 各须独立钉到一个已命名+已有 ADR 的资产——要读者读注释才能建立映射=凑数。
- Software Sustainability Institute 直持「不凑数」原则（BANG 不需硬解成 Big flAshy firework Noise Generator）；muji blog 点 backronym gimmicky 风险；Brandchemy 批评缩写名把记忆负担转嫁受众。

## ② README 首屏实践

- Highlights 置顶＋简短动宾句＋认知漏斗（banesullivan：ain't nobody got time for your manifesto——六句须每句一个动宾短语可独立扫懂）；首屏结构=Logo→Badges（含 preview 徽）→一句定位→Highlights 3-6 bullet→快速开始，占 0-10 秒认知区间。
- bullet 文案公式=「[动词] what [受众] need」（createabilitygroup）。
- SVG>截图>GIF；preview 状态用 badge 显式声明；2025-26 趋势=诚实标注+可验 receipts 本身是差异化卖点（Tessl manifest/SLA 首屏同构）。
- 禁忌：大段 manifesto／堆不解释术语缩写／营销腔形容词。

## ③ 三候选集（推荐序 B>A>C）

### 集 B（职能导向——推荐首选）：与 ADR 命名严格对齐零漂移

| F 词 | 映射资产 | 风险 |
|---|---|---|
| Facts | Hub-of-Facts（ADR-0005） | 低——名称即本体 |
| Federation | Federated Adjudication（ADR-0005） | 低 |
| Fidelity | canonical→derived 双语纪律＋receipts | 中——需副标点明 canonical 关系 |
| Fivefold | 五尺度（ADR-0001） | 中——歧义（五倍增长）；Five-Scale 更直白 |
| Foresight | Macro-C 演化考古 | 中——方向反偏差（前瞻vs回溯）；Forensics 更贴本质 |
| Frankness | 诚实 preview 标注+印记（ADR-0017） | 低——语义完全一致 |

### 集 A（意象导向——术语漂移最高）

Facts/Federation/Firewalls/Fossils/Frontiers/Flags——Firewalls≠Gate、Fossils 静态贬义 vs 考古动态调查、Frontiers 向外扩张 vs intake 向内收缩——Zinzin 反例型；若选须副标钉死 ADR 编号。

### 集 C（受众动作导向——转化最强但最激进）

Fork/Filter/Flag/Follow/Fuse/Free——「Free what you decide」把 Federated Adjudication 核心治理资产弱化成模糊且与 license 语义混淆的词，与「六句须映射最有价值资产」作者意图直接冲突。

## ④ 冲突面

1. 术语漂移（集 A）vs canonical 纪律→选 B 或副标钉 ADR；
2. 英文-only 宣言 vs 双语纪律（D-088）→六句 EN=canonical，zh-CN 必产 derived 镜像；
3. 凑数风险（Nucleus empty-vessel）→资产撑不住就五句不硬凑；
4. 宣言自信语气 vs preview 诚实（ADR-0017）→把诚实纪律本身写成宣言一句＋preview badge 置宣言区下方；
5. routing→scoring→weighting=实现纪律非用户可感知资产→不进六句（这本身是不凑数的体现）。

## ⑤ 信息缺口

backronym/acronym 权威边界无定论；六词 vs 三/五词记忆效果无量化研究；Foresight/Forensics/Fossils 开发者联想强度无实证（语言学常识判断）。
