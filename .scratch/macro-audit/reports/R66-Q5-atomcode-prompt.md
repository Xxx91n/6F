# R66-Q5 调研题面——dist 形态重评（#90 警戒线触发强制票）

## 背景（仓内实证，非转述）

- 本仓=宏观+微观工程内容审计产品，Agent 插件分发形态（marketplace install=git clone **零构建**——可运行体 `engine/dist/cli.js` esbuild 单文件 bundle 随源进仓，clone 即跑）；
- dist/cli.js 现 **373,105B**／cap **385,000B**，headroom=11,895B=**3.09%**＜25% 警戒线——`dist-ratchet-headroom-low` 触发器实测翻转，BACKLOG #90 强制开「分发形态重评票」（registry `dist-in-repo-review` 裁定面，四选预枚举：拆仓/publish 渠道/体积治理/限值重推导）；
- **cap 推导溯源（票面硬义务已兑现）**：385,000B 系 R57 commit 10771b9 勘误四抬限——289,395→385,000（Macro-C 移植 +18.1KiB 后**实测×1.25**，D-129③ size-limit 惯例「限值=实测×1.25 起步、抬限走有理由 reviewed PR」）；D-129② 明载该帽=「内部 ratchet 初始值**非工业基准**」；再前=153.6KB×2≈307.2KB 阈锚（R31 时点）；
- **bundle 成分实证**：esbuild packages-external——373KB 几乎纯自家 TS 源码；唯一运行时依赖 @duckdb/node-api 原生绑定本就不可内联（external＋懒加载，缺席时 DUCKDB-UNAVAILABLE 结构化降级已立法）；
- **关键新实证（票面四选枚举时点无人核过）**：build 配置 `minify` 旗标**缺席**——bundle 为未压缩态（`// src/...` 模块路径注释保留为证）；全账本/ADR/CONTEXT grep 无 minify 立法记录——未压缩非裁定结果是**立法空白**；
- **增长轨迹**：Macro-C +18.1KiB／Micro-A +62.8KB（310,334→373,105 单批）；剩余尺度 Macro-A 未建（DoR-b 阻塞），移植后预估再 +50~100KB——若仅机械抬限（×1.25→~466KB）1~2 批内警戒线再触发；
- **立法语境**：ADR-0011 单仓单分支（拆仓撞其字面）；ADR-0016 Agent-插件-only 分发（publish 渠道=修正案级变更）；ADR-0008 五层盒；D-067/D-076 dist 入库形态立法；D-140② 生成物禁搭车＋独立 bundle commit；D-211② 警戒线语义=「棘轮管静默增长、警戒线管计划性到顶」；registry dist-in-repo-review 另三子事件（publish 激活/pack 过阈/官方弃指引）均未发生；
- **外部语境**：锐评 reef#2「bundle 310KB 技术十字架」快照=310,334B 时点已计入（D-211② 处置=警戒线立法而非形态推翻）；Stage-2 未达（capability 4/5 卡 Macro-A＋静默窗未启动）——分发形态变更的用户拉动力=零外部信号。

## 待裁问题

dist-ratchet-headroom-low 强制触发的「分发形态重评」应裁定何种处置——监管触发语义是「强制重评」非「强制换形态」，且新实证（bundle 未压缩=立法空白）改写了四选项的相对代价：

- **(i) 体积治理先行**：esbuild 外科压缩——`minifyWhitespace+minifySyntax` 保标识符（零语义风险＋stack trace 函数名保住；full minify 含标识符改写留后续选项）→实测读数→棘轮帽按「新实测×1.25」**向下**重推导（reviewed-PR 纪律不变）→余量回 ~40%+；分发形态零变更；副作用=dist diff 可读性再降（本已非人读面＋check-dist 字节比对非人审，边际≈0）＋selftest/doctor 结构化错误面不依赖行号须验证；执行走 D-177 预声明；
- **(ii) 仅限值重推导**：×1.25→~466KB 机械抬限——合法但纯展期，Macro-A 落地即再触线=警戒线连续空转；
- **(iii) 拆仓**：dist 独立仓——撞 ADR-0011＋破坏 clone 即跑装载面；
- **(iv) publish 渠道**：npm 发布改分发本体——撞 ADR-0016 需修正案＋零外部需求信号；
- **(v) (i)+(ii) 抬限组合**：minify 后仍抬帽——棘轮单向只升=机制语义自伤。

我的初步推荐=(i)，但**两个疑点须调研裁决**：①警戒线触发的设计语义是否允许「重评结论=形态不变+治理空白修复」——即触发器是否立法上要求结构性变更还是只要求一次带证据的重新评估；②minify 对「git-clone 型插件分发」场景的副作用面（可调试性/stack trace/恶意审计者读 dist 验证产品行为=审计产品自身的透明度资产——**审计产品把分发体变不可读是否有品牌/信任维度代价**，这是纯工程外维度需工业先例回答）。

## 调研要求（纪律面不变）

1. **必须回顾本地三大件**（用本地文件读取工具全量/按需核读）：`D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md` 全部 status=current 记录（重点核 D-067/D-076/D-129/D-139/D-140②/D-211② 及一切涉 dist/分发/棘轮/bundle 条目——冲突核查必须逐条对照，不许泛称「无冲突」）；`D:/Aworker/6F/docs/adr/` 全部条目（重点 ADR-0008/0011/0016 分发形态三法）；`D:/Aworker/6F/CONTEXT.md` 全词条；
2. **工业界成熟落地心智模型（重点）**：单一产物体积治理先例族（esbuild/webpack minify 分级惯例〔whitespace/syntax/identifier 三档副作用谱〕、size-limit/bundlewatch/bundlesize 帽治理惯例、vscode/electron 等大件分发体积治理、npm packfiles 体积优化、sourcemap 生产面〔hidden-source-map 等形态 vs 无 map〕、「审计/安全工具分发体可读性」维度先例〔curl/openssh 等安全敏感工具的分发形态哲学、reproducible-builds 与 minify 兼容性〕、「ratchet 帽单向棘轮 vs 可向下重推导」先例〔Betterer/size-limit 实际允许下修吗〕、「触发器强制重评的结果=维持原判」的先例与判据〔监管语义：force re-evaluation ≠ force change〕）；
3. **辩证性看待**：逐候选点评论证 (i)~(v) 各自成立面与崩坏面；特别评估 (i) 的风险面——minify 后 dist 字节比对守卫/check-dist 机制是否仍有效（rebuild-diff 语义不变？）、插件故障排查可调试性损失如何量化、是否有先例因「分发体可读性=信任面」而拒绝 minify；
4. **冲突核查（硬要求）**：若结论与账本任何 current 决策冲突（重点核 D-129③ 棘轮惯例「抬限走 reviewed PR」是否隐含「帽只升不降」、D-211② 警戒线触发义务的形态要求、ADR-0011/0016 边界），列冲突表逐条给出处置建议（该 D 标 revised＋新 D 呈报用户拍板）；
5. **结论交付**：核心推荐（含裁定文本骨架，可直接改写为账本条目）＋置信度自评＋信息缺口清单。
