# R24-Q4 atomcode 深调研存档 — 双语 README 同步机制

> 调研日期 2026-09-20；题面见同目录 R24-Q4-research-prompt.md。
> Sufficiency Gate：searches 7（Exa×3/Tavily×3/AnySearch×1，Official/Comparative/Criticism/Currency/Community 五角度全覆）；full reads 7（dev.to SSOT 文、readme-i18n-sentinel 仓、Opendray check-readme-drift.mjs 源码、blume translate 文档、Mozilla Hacks MDN 本地化策略、Weblate 翻译状态机、MDN heading-ID 讨论+Applanga outdated-translations）；置信高（三引擎独立路径收敛）。

## 执行摘要

工业界心智模型高度一致：**双语 README 不是「平等双写」，而是 SSOT→派生关系**（英文 canonical + 译文从属标注 + 新鲜度机检）。推荐 **(a)+(d) 复合**：结构级机检守卫（骨架/代码块/链接/badge 相等）+ zh-CN 头部显式「英文为准」锚点标注，可选叠加 front-matter 版本戳做掉队检测——与本仓「文档单源真值+派生常量+逐行对账」守卫先例同构。(b) 纯流程纪律与 (d) 放任漂移单独使用均被实践证明失败。

## 分点结论

1. **翻译=派生工件非平等副本**：dev.to SSOT+CI 实践文（PSXRecompStudio 实例）原文「English is canonical. Translations are derived documents」——canonical→translation 映射存 JSON（含 canonicalMarker），CI 校验关系仍被声明+记录译文上次同步的 canonical revision：「译文可以暂时落后，但不能假装自己是新的」。TMS 侧（Weblate Needs rewriting 状态、Applanga Outdated Translation 自动警告）同模型：源变更→译文状态自动降级→显式待办，不指望译者自觉。
2. **机检面有现成工具形态**：readme-i18n-sentinel（npm CLI）=案 (a) 实物——断言 section 数/层级/起始行位/总行数相等，可选 heading 原文不变、code block 逐字节不变；自食其果管自己仓 11 个译文。blume translate=ledger+hash+--check 退出非零的版本戳方案。
3. **(a) 独用失败模式**：强阻断对小修过严逼出「最小合规改译」——Opendray check-readme-drift.mjs 源码注释明示**刻意 advisory-only**（PR 评论永不 exit 1）：「typo/link fix 不动译文是正当理由」。补救=按 diff 规模分级（小修提示/结构性阻断）或只 gate 已声明受管译文。第二失败模式：**无 owner 译文注定死**——blume 实例：11 个译文无 gate 无 owner，17 天后全作 stale 删除；对策=drift 报告必须打印 owner。
4. **第三类半机检面成立**：(i) front-matter 版本戳——译文记 source-rev/hash，CI 对当前 canonical hash 不等则标 stale（freshness=build-time property）；(ii) committed ledger——blume.translations.json 记每文件每译时源 hash，--check 只读报 missing/stale 并 exit 1；(iii) 分级状态——taiwan-md _translation-status.json 分 P1 major/P2 minor/**P2.5 metadata-stale**（仅指针过期正文未变，可机械一键 bump）。**机器可检「是否同步过」，人检「译得好不好」**。
5. **大型项目真实归宿=双语平等门面被放弃**：MDN 标本——曾允许全 locale 自由翻译，结果「most locales unmaintained, changes weren't being reviewed effectively」，2020 重构为 Tier1/Tier2 社区负责制（Tier1 zh-CN/zh-TW/fr/ja 必须有社区 lead 跟进义务否则冻结回 Tier2）。**(d) 放任漂移+英文为准在工业界不是方案而是方案失败的终局残留**——单独作起点=预支失败。MDN 另一教训：heading ID 曾被各语言自译致跨语言锚点错乱，后统一**锚点 slug 一律英文不译**——直接支持 zh-CN heading 带 {#english-id} 显式锚。
6. **锚点/链接=双语 README 最脆弱机检点**：blume 解法=译文每 heading 强制 trailing [#id] 钉回源锚点按位置配对；sentinel --require-original-section-titles 为更粗替代（heading 全留英文）。本仓取前者思想：zh-CN heading 用 {#english-id} 显式锚，守卫断言锚点集与英文相等——锚点不译、标题可译。
7. **三引擎交叉**：Exa（自建脚本案例群）/Tavily（MDN/Weblate/Crowdin/Applanga 厂商线）/AnySearch（blume/Opendray 工具线）独立收敛；无信源支持「纯人肉双写可持续」或「平等双文件可长期免机检」。

## 本仓落地建议（调研原文）

1. 骨架=案 (a)：NN-check 断言 heading 层级序列互等、zh-CN 标题带 {#英文锚} 且锚点集相等、fenced code block 数量与逐块内容相等、链接目标集相等、badge 集相等；三态输出沿用 PASS/FAIL/XFAIL。
2. 半机检面=front-matter 版本戳：zh-CN 头部 <!-- sync: <英文版短 hash> -->，英文变更而戳未 bump 给 **XFAIL/警示**非 FAIL（区分结构性漂移与小修掉队，吸 Opendray 教训）。
3. 标注=案 (d) 最小形态：zh-CN 首行「> 译文，英文版为权威；如不一致以 README.md 为准」——读者锚且被守卫断言存在（canonicalMarker 模式）。
4. 拒绝 (b) 独立使用、拒绝 (c)：双语对照场景引 generated 管线得不偿失；≥3 语言再升级 (c) 的 ledger/hash 模型。
5. 译文质量=人评审，但守卫加 owner 字段（zh-CN 跟进人写进检查配置）——MDN Tier1「有 lead 才保有译文」可持续条件。

## 二分法评估

二分成立但应修正为三分类：可机检面（骨架/代码块/链接/badge/锚点集）成立；不可机检面（译文质量/术语一致性）成立（blume 原文「the ledger only guarantees freshness, not fluency」）；**第三类半机检面确实存在**=同步状态（版本戳/hash/ledger/状态分级）。

## 主要来源

dev.to/loach2009（SSOT+CI 双语实践）；github.com/sugurutakahashi-1234/readme-i18n-sentinel；Opendray/opendray scripts（check-readme-drift.mjs 源码）；useblume.dev/docs（translate ledger+hash）；hacks.mozilla.org 2020-12（MDN Tier1/Tier2 重构）；docs.weblate.org/workflows（翻译状态机）；applanga.com（outdated-translations）；github.com/frank890417/taiwan-md PR#921（分级状态）；github.com/orgs/mdn/discussions/387（heading-ID 锚点）。

## 信息缺口

无大型基金会级「双语 README 对称平等」标杆（大项目多走 MDN 式社区负责制或 TMS 路线）；i18next/react 等头部项目做法未逐一核验（generated→放弃路径有二手佐证）。
