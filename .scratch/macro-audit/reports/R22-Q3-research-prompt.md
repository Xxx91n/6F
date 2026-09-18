# R22-Q3 atomcode 调研题面——D-072 自愈边界复审（锐评「夺舍」批评＋审计四缺陷是否构成修订事由）

## 问题

本仓 D-072（current）确立并实装了 DuckDB 原生绑定「懒加载自愈」：engine/src/fact/store.ts 的 loadDuckdb() 动态 import('@duckdb/node-api') 失败→catch 内 selfHealDuckdb() spawnSync 同步执行 npm install --no-save @duckdb/node-bindings-<platform>-<arch>@<pin>（timeout=240s）→完整性校验→createRequire retry→失败回落 DUCKDB-UNAVAILABLE 三段披露。R21 审计（PASS-with-findings）实测暴露四缺陷＋外部锐评发起根层攻击：

审计四缺陷（返工项立案级）：
1. 前提证伪——@duckdb/node-bindings-win32-arm64@1.5.5-r.5 实存于 optionalDeps（8 变体），D-072「win32-arm64 无官方包」前提错误→死分支；
2. probeUpstream 硬编码 registry.npmjs.org vs 自愈走 npm_config_registry 口径错位；
3. emitSelfHeal 非 MCP 面 stdout 污染（audit --json 混 SELFHEAL 行）＋result:"success" 位于 createRequire retry 前（装成功≠载成功）；
4. spawnSync 同步阻塞事件循环（240s timeout）。

锐评根层攻击：「MCP 投影请求→Node 进程静默锁死 4 分钟拉 40MB 二进制」=代码夺舍系统运维权；主张包管理应在安装/启动时解决，不该在请求生命周期内同步起子进程拉包。

对价在案：D-072 立项时已裁替代项——hooks 禁建（D-055 信任税＋Mini Shai-Hulud 供应链攻击面＋Windows bug 链）、duckdb-wasm 禁迁（#2192 OPFS 静默丢数据）、vendored bindings 禁入（8 变体仓重＋D-059⑨ 二进制值守）；「请求生命周期内拉包」是排除法产物。触发器复审三枚在册（vendored/wasm/hooks）。

问题：锐评＋审计证据是否构成 D-072 修订事由？若修订，自愈的触发面与时序该收成什么形态？

## 候选

(a) 维持 D-072＋四缺陷全归返工票（win32-arm64 接入/emitSelfHeal stderr/probeUpstream registry 口径/spawnSync 异步化或收窄）；
(b) 收窄修订=显式命令主路：自愈迁出请求路径→macro-audit setup（或 doctor --fix）显式拉包＋命中缺失只返回结构化指引；自动模式降格 env opt-in（MACRO_AUDIT_SELFHEAL=1）；D-072 revised；
(c) 按面分层：CLI 交互面保留自动自愈（用户在场可控）／MCP stdio 面永不自动拉包（宿主驱动无人可询问，只结构化披露指引）；D-072 部分 revised；
(d) 全拆：回手动 npm install --omit=dev＋三段披露；D-072 revised；
(e) 缓挂：返工票修完四缺陷后再评估。

## 必回顾（硬要求）

1. 决策账本全部 current 记录：D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md（D-001~D-074，重点 **D-072 自愈决策本体与其排除法理由**／D-067 自包含分发／D-059⑨ 二进制值守／D-055 hooks 禁建／D-038 npm publish deferred／D-063 有实证即裁决）；
2. ADR：D:\Aworker\6F\docs\adr\0001-0021（重点 0008 五层盒子／0016 纯插件分发／0017 preview 分级／0021 license）；
3. CONTEXT.md：D:\Aworker\6F\CONTEXT.md（Default Mode／Agent Plugin／Kernel-Agent 边界）；
4. 实物：D:\Aworker\6F\engine\src\fact\store.ts（selfHealDuckdb/loadDuckdb/probeUpstream/emitSelfHeal）＋engine\src\doctor.ts＋engine\test\duckdb-selfheal-*.test.mjs＋D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-audit-report.md（§六返工 2/4/5/9）＋R21-Q2-atomcode-research.md（D-072 原调研）；
5. **工业界成熟心智模型（重点）**：playwright install（显式拉浏览器二进制）／puppeteer PUPPETEER_SKIP_DOWNLOAD＋postinstall 自动拉取两派／rust-analyzer/clangd VS Code 扩展激活自动下载二进制／.NET OmniSharp 运行时自举／esbuild/swc optionalDependencies 平台分包（安装时解决非运行时）／npx 缺失包询问式安装／kubectl/Docker pull-on-miss 语义／语言服务器 vs CLI 工具的依赖自举边界／「应用不该在自己请求生命周期内改自身部署形态」运维原则（immutable deployment/12-factor disposability）／MCP stdio server 的信任模型（宿主拉起、无 TTY 用户在场）／lazy-install 模式的失败案例与社区批评（自动 npm install 被视副作用反模式的论据）；
6. 给出推荐与理由＋失败模式＋落地形态（若收窄：setup 命令契约/披露指引文案/自动模式 opt-in 语义；若分层：CLI vs MCP 探测判据——TTY？MACRO_AUDIT_MCP_STDIO？；spawnSync 阻塞的正确修法：异步 spawn？child_process detached？提前在命令入口预热检查？）；
7. 显式核查与本仓 current 决策的冲突面（特别：收窄/分层是否需 D-072 revised——「请求路径自动拉包」是 D-072 的规范化核心条款还是实现细节？Default Mode「一次安装命令」语义收窄是否触及 D-011/R2-03 默认模式契约？四缺陷是否独立可修不牵决策本体？）。

## 交付

返回结构化 Markdown：①结论（推荐+一句话）；②逐候选裁定；③工业先例证据（带 URL）；④落地形态设计；⑤失败模式与治理；⑥与本仓决策冲突核查表（逐条 D-xxx——特别裁定 D-072 是否需 revised）；⑦信息缺口；⑧建议追问。
