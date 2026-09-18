# R21-Q2 atomcode 调研题面——duckdb 原生绑定残余缺口终态裁票

## 问题

本仓 macro-audit kernel 插件经 marketplace git-clone 分发（无构建步无 npm lifecycle）。#59 自包含化后 esbuild 单文件 bundle 随源进仓：握手/selftest/`demo --list` 零依赖可用，但 `facts/audit/demo` 实跑需 `@duckdb/node-api@1.5.5-r.4` 原生绑定（store.ts 懒加载动态 import＋catch→`DUCKDB-UNAVAILABLE` 结构化降级已在）。干净 git-clone 无 node_modules→核心功能死，README 已写手动补救=插件目录 `npm install --omit=dev`（审计实证可行）。该选什么终态？

## 候选

(a) vendored bindings：平台矩阵原生 .node 入库（~5+ 变体，DuckDB 绑定单件 ~40MB+，仓重＋供应链治理）；
(b) SessionStart bootstrap：hooks 面装后自动 npm install --omit=dev（Windows ${CLAUDE_PLUGIN_ROOT} hook 面展开 bug #43380 实锤未免疫＋会话启动延迟＋运行时改插件缓存目录＋hooks 信任面）；
(c) duckdb-wasm 换绑：@duckdb/duckdb-wasm 纯 wasm 随 bundle 分发（API 异构需适配层＋.duckdb 文件格式兼容性须实测＋性能特征变）；
(d) 能力分级披露为终态：接受「装得上＋核心功能需手动 npm install」为正式能力分层（零工程成本但 Default Mode「一次安装命令」语义对核心功能破约）；
(e) 懒加载自愈 bootstrap：kernel 命中 DUCKDB-UNAVAILABLE 时自动执行 npm install --omit=dev（或精确拉取 @duckdb/node-bindings-<platform> 单包）于插件目录后重试（首次使用延迟＋网络依赖，失败回落 d）；
(f) 组合：(e) 自愈主路径＋(d) 披露保底地板＋(a)/(b)/(c) 触发器复审。

## 必回顾（硬要求）

1. 决策账本全部 current：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（重点 D-038 A+C 双轨 npm deferred／D-059⑨ checked-in 二进制值守／D-067 自包含分发八项／D-058 kernel/Agent 边界）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0008 五层盒子内核 CLI 随插件分发／0016 纯插件分发）；
3. CONTEXT.md：Default Mode「一次安装命令」语义；
4. 可复用调研档案：D:\Aworker\6F\.scratch\macro-audit\reports\R19-Q2-atomcode-research.md（${CLAUDE_PLUGIN_ROOT}/Windows bug 链/esbuild bundle 分析）；
5. 实物：D:\Aworker\6F\engine\src\fact\store.ts（懒加载降级路径）＋D:\Aworker\6F\engine\package.json；
6. **工业界成熟心智模型（重点）**：原生模块分发的成熟路径——node-sqlite3/better-sqlite3 prebuild-install 机制（prebuilds 按 ABI/平台拉取）、sharp/libvips 平台 optionalDependencies 矩阵、esbuild/swc/lightningcss 的 optionalDeps 平台分包模式、Prisma engines 下载、playwright/puppeteer 浏览器下载器（postinstall vs lazy fetch vs PLAYWRIGHT_SKIP）、node-llama-cpp binaries 管理、duckdb 官方 node-api 的 node-bindings 平台包结构（@duckdb/node-bindings-*）、wasm 在 Node 服务端跑 duckdb 的实测先例与限制（duckdb-wasm on Node 官方支持度/文件格式兼容/PATH 持久化）、Claude Code 插件 hooks SessionStart 可靠性与 Windows bug #43380 现状；
7. 给出推荐与理由＋失败模式＋落地形态（自愈 fetch 的完整性校验/离线语义/缓存目录约定/重试与降级路径；wasm 候选的适配层成本实测）；
8. 显式核查与本仓 current 决策冲突面（D-067⑧ npm deferred 是否被自愈路径隐性破坏——npm install 于插件目录 vs npm publish 渠道是两个不同语义面注意辨析；D-059⑨ 二进制纪律对 vendored 的约束力）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx）；⑦信息缺口；⑧建议追问。
