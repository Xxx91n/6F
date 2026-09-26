# R35-Q2 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（Agent Plugin 分发，ADR-0016「仅 Agent Plugins」⇒ git clone 无构建步=可运行 bundle 必须随源进仓）。engine/dist/cli.js=esbuild 产物 257947B/5808 行＋tsc 逐模块输出共 54 件，已标 linguist-generated -diff（D-140①）。

## 问题

第四轮外部锐评（快照=当前 HEAD）呈报 bundle 提交流程为「发票粉碎机」：改一个 .d.ts 类型声明就必须独立 bundle commit 更新产物（D-140② 立法 bundle 再生禁搭车语义提交须独立 commit）；多次「改了代码忘了重跑 build」被审计/CI 打回（commit 20f7f5c FAIL verdict、b244184 补提交两实证）；commit log 充斥 bundle 再生机械噪音。

现状执法层位：CI 层 engine-ci.yml rebuild-diff 步硬拦截（node scripts/check-dist.mjs 再生后 diff drift 即红，失败 upload-artifact）；本地 npm test=gen&&build&&smoke 链会顺带再生 dist；83-check 有 src+dist 双锚断言。残余缺口=产生面（语义 commit 前）无前置拦截，再生义务挂在人肉记忆上。

R35-Q1 刚裁定同形问题的双层模式：产生面工序内化（checklist 前置核对）＋守卫层保持硬闸不降级（mandatory 只能住 CI 层，jyn.dev/HN 边界）。

候选处置：
(a) 工序内化（D-144① 同构）——语义 commit checklist 增「engine/src 触碰→npm run build＋node scripts/check-dist.mjs 前置核对」，脚本已存在零新机制，CI rebuild-diff 保持硬闸兜底；
(b) 批量降频——bundle 再生从 per-change 改为收口/发布窗批量，消灭逐 commit 噪音，但破坏「每 commit 自含可运行体」bisect 优势＋翻 D-140② 刚立规约；
(c) hook/bot 自动化——pre-push hook 跑 check-dist（--no-verify 可绕过、.git/hooks 不入库、或引 husky 依赖）／CI bot 漂移自动补 bundle commit（bot 身份+写权限，「忘」变不可见而非消灭）；
(d) 不动——CI 守卫必拦，两次打回=便宜学费。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-140 bundle 三件套与信任源声明、D-139 机械变更禁搭车、D-144 刚立的双层模式/产生面工序内化、D-067 dist 进仓+rebuild-diff 守卫立法、D-070 随触碰顺带、D-059⑨ bundle 退役触发器、ADR-0016 相关条款），docs/adr/（重点 0016 分发形态、0008 插件五层、0013 三层验收），CONTEXT.md（Trigger-gated Closure、Golden 锁面、Kernel/Agent 边界）；
2. 工业界成熟落地的心智模型（重点）：check-in 生成物「忘再生」的成熟防遗忘机制——actions/javascript-action check-dist.yml 官方模板的本地侧配套惯例、husky/lint-staged/pre-commit 生态对生成物漂移的拦截实践与批评、typesync/protobuf generated-code 项目「build 前置检查」工作流惯例、monorepo 派生物「stale 检测」左移形态（Nx affected/bazel stale output 检测心智）、CI bot 自动补生成物提交的先例与风险（changeset bot/version packages 自动 commit 模式 vs 漂移修复 bot）、「开发者忘记跑 codegen」问题的业界标准解法（pre-push check/make 依赖关系生成/编辑器侧提醒）、generated-artifact freshness 的 gate-the-merge 模式；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
