# R41-Q1 调研题面（atomcode）

## 背景（决策上下文，勿外传代码本体只传语义）

某仓库守卫组（~60 件 node 检查脚本）在开发者本机全绿（红集⊆known-red-manifest）。外部评审指控「外人 clone 即红海」。已建立 portable/env-contract 双层 tier 机制：每件守卫自声明 TIER＋PROTECTED_SURFACE，env-contract 件在启动时 envProbe 探测前置条件，缺失→SKIP-with-reason 第三态退出（exit 0，skip 不进 allOk，reason 保留进报告）；sibling 路径寻址经单一 SSOT 环境变量（GUARD_SIBLING_ROOT，默认开发机路径）。

实测新鲜 clone（git clone 本仓）：14 红/13 册外，归因四类环境前置：
1. ghost git-object（5 件守卫钉一个须手工 git fetch 本地 bundle 才能存在的 commit SHA；bundle 文件本身已提交进仓但对象不在 object store）
2. engine-deps（7 件守卫 import 已提交的 engine/dist，但 dist 依赖原生绑定 @duckdb/node-api，须先 npm install；错误已带自愈指引）
3. gitignored 资产（1 件守卫依赖 .gitignore 的 clone-cache 目录——外部仓 clone 隔离缓存）
4. 已注册 known-red（1 件，正常）

全部 13 件红件当前自声明 TIER=portable（声明不真），但探测面只覆盖 sibling 一类前置。

## 待裁问题

处置路由候选：
(i) env-contract 泛化——探测面扩到「任何文档化环境前置」（git-object/engine-deps/gitignored-asset/sibling），逐件探测＋tier 重声明，SKIP 理由直给修复指引（git fetch bundle / npm install）；
(ii) 建制不动如实值守——承认 fresh-clone 判据未达标保持关闭；
(iii) 混合——git-object 类做守卫内自举 git fetch 本地 bundle（bundle 在仓自足；但有「守卫写 object store」纪律疑虑）＋deps/cache 走探测 skip；
(iv) 册化 known-red——已被否（本机全绿→册件复绿告警矛盾）。

## 调研要求

1. 工业界成熟心智模型（重点）：测试套件/守卫套件对外部环境前置（git 对象、原生模块绑定、外部目录、服务）的成熟处置模式——pytest skip/fixture marker、Go testing build tags/Skip、Bazel test_env/toolchain、Jest setupFiles 前置断言、Rust cfg feature gates、Chromium/gtest 环境探测惯例；SKIP vs FAIL vs xfai l语义边界的主流权威依据。
2. git bundle 在测试中的使用先例：把冻结 commit 以 bundle 文件进仓、守卫/测试启动时自举 fetch 的可移植性与写盘副作用处置；或不 fetch 的替代（GIT_ALTERNATE_OBJECT_DIRECTORIES、git cat-file --batch 对 bundle 内容直读、unbundle 到临时仓库）。
3. 原生模块（node-gyp/prebuilt binding）在 CI/测试中的可用性探测惯例：optionalDependencies、动态 require try/catch→skip 的工业范式。
4. 「works on my machine」防护：fresh-clone/干净 checkout 复跑作为门禁的成熟形态（hermetic CI、containerized test、clone-and-run 哨兵任务）。
5. 回顾本仓决策账本 D-001~D-162（.scratch/macro-audit/decision-ledger.md current 记录）、docs/adr 24 件、CONTEXT.md 词条——调研结论若与 current 决策冲突须显式列出（特别是 D-159 env-contract 限定 {37,39,46} sibling 集、ghost 归 D-094 族、audit-zero-write 纪律、D-162③ 判据②回指 D-159）。

给出推荐与理由；辩证看待，列冲突清单。
