# R34-Q1 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计，Hub-of-Facts append-only 事实表 + DuckDB + Micro-B 文件级审计卡；分发形态=Agent Plugin，ADR-0016 立法「仅 Agent Plugins 分发」）。

## 问题

第三轮外部锐评（快照 commit 44cc2a4/Round31）呈报「dist/cli.js 编译 bundle 提交进版本库」为「恶魔的契约/原罪」：

- 现状：engine/dist/cli.js 由 esbuild 打包（tsc + scripts/build-bundle.mjs），当前 5809 行，随每次 TS 源码变更再生并全量进入 commit diff；
- 立法背景：R19 决策 bundle 进仓=Agent Plugin 开箱即跑（用户免 npm run build），CI 挂 rebuild-diff 守卫（bundle 与源码漂移即红）——R31 审计已实证该守卫拦到一次漏 bundle 打回；
- 噪声面：engine/.gitattributes 未对 dist/cli.js 标 -diff 或 linguist-generated——5000+ 行机械 diff 污染每次人读评审与审计 diff；bundle 再生属机械变更，搭车语义提交与 D-139「格式化-only 禁搭车语义提交」同型污染；
- 泛化语境：宿主环境泄漏通道族已逐一点名封死（.gitattributes eol=lf、generated_at 钉 fixture 时钟、SCIP 路径规范化、方言边界吸收器）——本题裁的不是泄漏而是「锁面内生成物的评审/历史成本」。

候选处置：
(a) generated 标记＋信任转移——engine/.gitattributes 加 dist/cli.js -diff linguist-generated（本地 git diff 默认跳过＋GitHub 折叠），配套书面声明「bundle 正确性信任源=rebuild-diff 守卫而非人读 diff」；
(b) 独立 bundle commit 规约——bundle 再生强制独立 commit（D-139 机械变更禁搭车规约的同型扩展），不加 generated 标记，diff 仍可全读但隔离在专用 commit；
(c) (a)+(b) 组合——generated 标记降噪＋独立 commit 隔离（信任源归守卫、历史可二分性归专属段）；
(d) 维持现状——全量可读 diff 作制品可审计性的保守姿态（但 R31 实证审计员读不完 5000 行 diff，可审性已名义化）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-139 格式化禁搭车新规、D-127/D-132 golden 锁面分层、D-128 方言归一与披露双轴、D-130 first-external-contributor 触发器、D-133/D-135 分票判据、D-025 双读数纪律、bundle 进仓的原始立法记录）、docs/adr/ 全部 ADR（重点 0016 分发=仅 Agent Plugins、0018 版本与编年纪律、0008 插件五层盒、0013 三层验收闸门）、CONTEXT.md 全部词条（重点 Golden 锁面/Trigger-gated Closure/Frankness 系披露词/Kernel-Agent 边界）；
2. 工业界成熟落地的心智模型（重点）：check-in 生成物（checked-in generated artifacts）的成熟处置惯例——GitHub linguist-generated/-diff 语义与最佳实践、GitLab/GitHub 对 lockfile/生成代码的 diff 折叠惯例、protobuf/graphql-codegen/go generate 产物的 check-in vs release-artifact 之争、.git-blame-ignore-revs 生态、Bazel/Buck 远端制品 vs 仓内 vendored 制品的取舍、「trust the generator+verify by CI」式可审性转移先例（如 Android/Google 生成代码评审规约、npm package 内置 dist 与仓库 dist 的关系惯例）、生成物 diff 对 review/bisect/blame 成本的对照证据；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
