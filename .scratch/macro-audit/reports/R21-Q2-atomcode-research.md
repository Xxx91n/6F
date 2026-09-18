# R21-Q2 调研报告：duckdb 原生绑定残余缺口终态裁票

> 来源：atomcode 深调研（2026-09-18，session a9f62256-202d-4b4c-b9b7-853493fd4730——末段 EOF 截断，⑦仅存首条如实登记）。题面=R21-Q2-research-prompt.md。置信：高（候选裁定每条≥2 独立信源）。

## ① 执行摘要

**推荐 = (f) 组合：以「(e) 懒加载自愈 fetch @duckdb/node-bindings-<platform> 单平台包」为主路径升级，(d) 结构化降级披露为保底地板，(a)(b)(c) 全部维持否决并各挂复审触发器。** 一句话：DuckDB 官方自己的分发设计（esbuild 式 optionalDependencies 平台分包）已经把「精确拉单平台包」变成一等公民——自愈路径可以不跑全量 `npm install`，只拉一个平台包，把首次使用延迟、仓重、hooks 信任面三项全部避开，同时 D-067⑧ 的 npm deferred 语义不受损（插件目录 npm install ≠ npm publish 渠道，D-038 双通道口径早已辨析此义）。

## ② 逐候选裁定

| 候选 | 裁定 | 核心理由 |
|---|---|---|
| (a) vendored bindings | **否决** | 8 个平台变体（darwin-x64/arm64、linux-x64/arm64±musl、win32-x64/arm64——DeepWiki 确认 musl 拆分后 5→8），单件 ~40MB+→仓重数百 MB；违反 D-059⑨ checked-in 二进制值守纪律；git-clone 分发还得全平台拖给每个用户。sharp/libvips 平台矩阵先例全走 optionalDependencies **安装期**选择而非入库 |
| (b) SessionStart bootstrap | **否决** | Windows hook 面 bug 链现势未愈：#43380/#65579（${CLAUDE_PLUGIN_ROOT} 反斜杠展开）、#16116（closed as dup）、obra/superpowers#420（2026-02 仍 open）、claudeissues #23768（SessionStart 外部命令 Windows 冻结 REPL）、#15013（官方插件 SessionStart 在 Windows 打不开 .sh）。且与 D-055 正面冲突（审计产品无真实信号禁建 hook 配置——hooks 信任税）；2026-05 Mini Shai-Hulud 攻击正是劫持 SessionStart hook 持久化——再加自动 npm install 的 hook=给供应链攻击递刀 |
| (c) duckdb-wasm 换绑 | **否决（挂触发器）** | ①API 异构：AsyncDuckDB+worker+selectBundle 与 node-api 同步连接模型完全不同形，store.ts 需整层适配；②持久化脆弱：#2192 实锤 v1.5 variegata 升级后 OPFS 直接持久化静默失败（数据丢失级缺陷，修复 PR 三个月未合 dev57 仍 broken）——审计型产品 append-only fact 表不能架在「写成功但落盘零字节」运行时上；③官方 README 明列差异：out-of-core 与文件系统支持降级、扩展 autoload 不同、基于 v1.5.4 落后 node-bindings 1.5.5；④.wasm 路径无 SWMR/锁语义实测先例。触发器：「纯零网络安装」硬需求信号出现再评 |
| (d) 能力分级披露 | **采纳为地板** | 现状（DUCKDB-UNAVAILABLE 结构化降级+README 手动补救）已实证可行；但单独为终态违 CONTEXT Default Mode「一次安装命令」语义——核心功能（facts/audit）对 C 类用户破约。故只作自愈失败回落层 |
| (e) 懒加载自愈 bootstrap | **采纳为主路径（锐化版）** | DUCKDB-UNAVAILABLE 命中点触发，**精确拉 @duckdb/node-bindings-<platform> 单包**而非全量 npm install --omit=dev——DuckDB Neo 官方包设计（esbuild 式 optionalDependencies+detect-libc 分发器）使此为一等路径：分发器 JS 随 bundle 走，缺的只是平台二进制包一件。首次使用延迟（一个 ~40MB 下载）发生在用户明确要用 facts 的时刻，可接受且可进度披露；离线/失败回落 (d)，语义闭环 |
| (f) 组合 | **✅ 推荐** | (e) 主路径+(d) 地板+触发器：(a) 复审触发=平台包尺寸/数量恶化或官方预签名分发出现；(c) 复审触发=#2192 类持久化缺陷修复合入≥1 稳定版＋本仓 append→重开 SWMR 实测通过；(b) 复审触发=上游 #43380/#16116/#420 修复落地＋hooks 信任面真实需求信号（D-055 触发器复用） |

## ④ 落地形态设计（(e) 自愈主路径）

**触发点**：`loadDuckdb()` catch 分支（store.ts 现有 DUCKDB-UNAVAILABLE 处）前置一步自愈：

1. **平台探测**：process.platform+process.arch（+detect-libc 判 musl，duckdb 分发器同款逻辑）→目标包名（如 @duckdb/node-bindings-win32-x64@1.5.5-r.4，版本与 package.json 锁定值同源常量防漂移）；win32-arm64 无官方包→直接跳自愈回落 (d) 并在错误信息说明；
2. **精确安装**：于插件目录执行 `npm install --no-save --omit=dev <目标平台包>`（--no-save 不动 package.json/package-lock——插件缓存目录只读语义最小化）。优先单平台包；若 @duckdb/node-api 的 JS 面也缺失才退全量 npm install --omit=dev。bundle 形态裁决（D-067② caveat 升级为验收硬条件）：esbuild bundle 须将 @duckdb/node-bindings 分发器标 external 或验证其动态 require 在 bundle 内可达——CI rebuild-diff 守卫链加「干净机自愈 E2E smoke」；
3. **完整性校验**：拉取后校验 .node 文件存在+尺寸>阈值+包内 package.json version===锁定版本；校验失败→删半成品目录→回落 (d)；
4. **缓存目录约定**：就装插件自身 node_modules（DuckDB 分发器按标准 Node 解析逻辑找不到才触发自愈，装回标准位即闭环），不自造缓存目录；
5. **重试与降级**：自愈尝试每进程至多 1 次（内存旗标防循环）；离线/失败→回落 (d) DUCKDB-UNAVAILABLE，错误文案升级三段：「自动补拉失败（原因）→可手动 npm install --omit=dev→无网络时 facts/audit 不可用其余命令不受影响」；
6. **披露**：README/D-067⑧ 文档面从「手动补救」升为「首次使用 facts/audit 时自动补拉（需网络 ~40MB）；无网络见手动路径」——Default Mode 语义以「安装命令触发后一切自动」口径恢复兑现（语义收窄披露：需网络，票面如实登记）；
7. **治理**：自愈成功/失败结构化落 stdout 供 runtime-doctor（#62）消费；守卫链加离线模拟测试（npm 环境变量指死 registry→断言回落 (d) 非崩溃）。

## ⑤ 失败模式与治理

| 失败模式 | 缓解 |
|---|---|
| npm 不在 PATH（非 dev 用户） | 探测 npm --version，失败即静默回落 (d)，文案引导 Node/nvm 安装 |
| 插件目录只读（企业策略/权限） | 捕获 EACCES→回落 (d)，文案注明目录路径 |
| npm registry 镜像差异（lock 指 npmmirror） | 自愈 npm install 继承用户 npm 配置（镜像/代理），不硬编码 registry URL |
| --no-optional/--ignore-scripts 环境偏差 | 直接指定完整平台包名绕开 optionalDependencies 机制（esbuild #1647 教训） |
| 平台包版本与 node-api JS 面不匹配 | 版本常量单一来源（package.json 读取或生成期注入），CI 断言三方同值（D-037⑥ 同族） |
| 自愈下载被中间人替换 | npm 自带 integrity 校验兜底；审计产品升级项=对锁定版本预存 sha512 于 upstream-lock 自校验 |
| wasm 触发器漂移 | (c) 触发器量化条件：#2192 类持久化缺陷修复合入≥1 稳定版＋本仓 append→重开 SWMR 实测通过 |

## ⑥ 与本仓决策冲突核查表

| 决策 | 冲突？ | 辨析 |
|---|---|---|
| D-067⑧ npm deferred | **不冲突（须防误读）** | D-038 双通道早已辨析：npm publish **渠道**≠插件目录 npm install **依赖拉取**——自愈属后者且只装 duckdb 官方平台包不发布自有包。落票时票面显式写此辨析防后续轮误判 |
| D-059⑨ checked-in 二进制值守 | 不冲突，且 (a) 被禁 | D-059⑨ 语义面正是「裸二进制进仓」值守——(a) vendored 直接命中禁令面；自愈路径二进制进 node_modules 运行时目录不入仓，不触发该纪律 |
| D-067② dist 入库/bundle 形态 | 部分张力 | esbuild bundle 对 native 模块 caveat 已登记——自愈设计把该 caveat 升级为验收硬条件：分发器 JS 必须 bundle 内可达或显式 external |
| D-055 hooks 信任税 | (b) 正面冲突 | D-055 裁定无真实信号禁建 hook——(b) 正是新增 hook 面且带 Shai-Hulud 供应链攻击先例，独立否决理由充分 |
| D-058 kernel/Agent 边界 | 不冲突 | 自愈逻辑全在 kernel CLI（store.ts 触发点）内，不越界 skill/Agent 面 |
| CONTEXT Default Mode | (d) 单独终态=冲突；(f) 修复 | (f) 以「安装后首次使用自动补拉、失败才需手动」兑现「一次安装命令」——严格说是语义收窄披露（零手动步但需网络），票面如实登记 |
| ADR-0016 纯插件分发 | 不冲突 | 自愈拉上游依赖包，产品本体仍 Source-first 随仓分发 |
| ADR-0008 五层盒子 | 不冲突 | mcp.json kernel stdio 面不变，自愈是 kernel 内部行为 |

## ⑦ 信息缺口（EOF 截断仅存首条）

1. 平台包精确尺寸：~40MB+ 是量级估计未逐变体 registry tarball 实测——落地时逐变体核实披露。

