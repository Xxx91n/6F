# R22-Q3 调研报告——D-072 自愈边界复审（锐评「夺舍」批评＋审计四缺陷是否构成修订事由）

- 调研工具：atomcode-research（resume id: caf4fc3c-4738-4c33-a9d0-5207002f1c1a）
- 题面：D:\Aworker\6F\.scratch\macro-audit\reports\R22-Q3-research-prompt.md
- Sufficiency Gate：searches 8（Exa 3/Tavily 2/AnySearch batch 3）｜angles 五类全用｜full reads 8（playwright#26614、12factor/disposability、rust-analyzer book、semgrep npm-v12 讣文、esbuild PR#1621 全文、k8s images 官方文档、npm/cli#1935 npx TTY 语义、pptr install.ts 源码）｜置信高

## ① 结论（Tl;dr）

**推荐 (c) 按面分层——D-072 需 revised（部分修订）**：审计四缺陷全归返工票可修，但锐评的根层攻击**成立**——「请求生命周期内同步拉包」不是实现细节而是 D-072 账本条文的规范化核心条款（D-072① 原文「loadDuckdb() DUCKDB-UNAVAILABLE 命中点前置自愈」白纸黑字），故仅修四缺陷不动条文不构成 (a)；工业界先例一边倒支持「安装时解决 / 请求时披露」，唯一保留自动拉包的先例（rust-analyzer、npx 交互式）全部以「用户在场可询问」为前提——MCP stdio 面恰恰是这个前提的反面，因此自动自愈必须按面切分：CLI 交互面保留、MCP stdio 面改为结构化披露 + opt-in。

## ② 逐候选裁定

| 候选 | 裁定 | 理由 |
|---|---|---|
| (a) 维持 + 四缺陷归返工票 | **不足** | 四缺陷确属独立可修，但锐评攻击的靶心是 D-072 条文本身：「DUCKDB-UNAVAILABLE 命中点前置自愈」写进账本 D-072① 决策本体。维持条文=MCP 面继续存在 4 分钟锁死面，锐评的信任模型批评未被回应 |
| (b) 收窄修订＝显式命令主路 | **过收** | 方向正确但把 CLI 交互面的自动自愈也砍了。rust-analyzer/npx 先例表明用户在场（TTY）时自动补装是行业可接受形态——全砍牺牲 D-072 核心价值（插件装上即跑通，D-067 自包含分发的补偿机制），把每个用户推回手动 npm install |
| (c) 按面分层（CLI 保留 / MCP 永不自动） | **✅ 推荐** | 精确对齐工业先例分界线：自动拉包的合法性判据不是「要不要拉」而是「谁在看屏幕」。CLI 面用户在场可控（Ctrl-C、看进度、被询问）；MCP 面宿主拉起、无 TTY、无人可询问——npx 在非交互环境的选择是「跳过 prompt 只 WARN」，不是静默装 |
| (d) 全拆回手动 | **过拆** | 等于废除 D-072①+② 大部分价值；playwright 式显式 install 适合浏览器这种 300MB 级重型资产，对本仓 40MB 单平台绑定过重，且 D-067② bundle 验收条件已为分发链铺路 |
| (e) 缓挂 | **否** | F4（前提证伪死分支）+F9（MCP 阻塞）是实证在案的行为缺陷，D-063 不允许可实证缺陷挂起；且使锐评的信任模型批评悬置到下轮 |

## ③ 工业先例证据（全部本轮 web_fetch 原文核验）

| 先例 | 形态 | 含义 |
|---|---|---|
| **Playwright v1.38**（issue #26614）：v1.37 及之前 npm install 自动下载浏览器→**v1.38 起移除自动下载改 npx playwright install 显式命令**；自动路径仅存于可选 @playwright/browser-* 安装时分包 | 行业头部工具从自动退向显式，残余自动路径全收敛到安装时 | 「请求/使用时自动拉包」是已被头部项目放弃的形态；本仓自愈把 playwright 旧形态做进了请求路径，比旧形态更进一步 |
| **esbuild PR #1621**：作者明确废弃「postinstall 脚本手动下载平台二进制」改 optionalDependencies 安装时分包，理由含「custom registries/offline/read-only fs/--ignore-scripts 全破」——把拉包交给包管理器在安装时解决 | D-072 选取的 DuckDB Neo optionalDependencies 路线正是 esbuild 新形态；但本仓把兜底做成运行时 spawnSync npm install——恰是 esbuild 废弃的旧形态的运行时版 | 安装时（optionalDeps）✅ 与 D-072 一致；运行时 spawnSync ❌ 是被废弃形态 |
| **rust-analyzer VS Code 扩展**（官方 book）：「It will ask your permission to download the matching language server version binary」；issue #2988 设计讨论核心是「激活时检查+弹窗征询」 | 唯一保留激活时自动下载的先例，前提是编辑器 GUI=用户在场可征询 | 自动拉包的合法边界=用户在场；MCP stdio 无此前提 |
| **npx TTY 语义**（npm/cli#1935）：交互终端→「Ok to proceed? (y)」询问式安装；非 TTY/CI→npm 7.0.0-rc.4 起跳过 prompt、仅打 WARN 不阻塞（后续 7.0.6 连 CI 检测都做了） | npm 官方亲自给出的分层判据：TTY=询问后装；非 TTY=不装只警告 | (c) CLI/MCP 分层的直接官方同构——判据连 isTTY 都现成 |
| **Puppeteer**（install.ts 源码+troubleshooting）：postinstall 自动下载保留，但它是安装时（npm install 生命周期内），opt-out 走 PUPPETEER_SKIP_DOWNLOAD | 自动拉包另一派也存在，但从未有人把它放进命令请求生命周期 | 两派分歧在安装时不在运行时——锐评批评与两派共识不冲突 |
| **npm v12 默认禁 lifecycle scripts**（Semgrep 讣文 2026-06-11＋Rescana）：allowScripts 默认关，生态方向=隐式副作用执行全面收紧 | 本仓 spawnSync npm install 在请求路径里再起一次 npm——把 npm 刚收窄的执行面又在应用层开一道口，且正落在 D-055 hooks 禁建所防御的供应链攻击面同一张网里（Mini Shai-Hulud 教训在案） | 与 D-055 排除法理由同构：MCP 面自动拉包实质是「应用自建的最小 postinstall」 |
| **12-Factor Disposability**（12factor.net/disposability）＋**k8s images 官方文档**（kubelet 拉镜像是天职供给） | 进程可处置性原则／供给职责分离 | 应用进程在请求生命周期内改自身部署形态违反 disposability；kubelet 类供给者除外（其天职即供给） |

**先例结论**：没有任何主流工具在「宿主驱动的无人值守进程」里做请求内同步自动拉包；所有自动形态要么在安装时（esbuild 新/puppeteer），要么以用户在场为前提（rust-analyzer/npx 交互式），要么天职就是供给（kubelet）。

## ④ 落地形态设计（采 (c)）

**1) 触发判据（面探测，复用现有旗标）**：

- MCP 面 ≡ process.env.MACRO_AUDIT_MCP_STDIO === '1'（mcp-server.ts L7 已在，零新增探测）
- CLI 面 ≡ 非 MCP 面 且 process.stdout.isTTY === true
- 无人值守 CI ≡ 非 TTY 且非 MCP 面（如 GitHub Actions）→ 按 MCP 面同规：不自动，披露
- opt-in ≡ MACRO_AUDIT_SELFHEAL=1 时 MCP/CI 面也允许自动（显式接受阻塞语义，env 名登记 README）

判据与 npm 7 的 CI 检测同构，改造成本仅一处分支。

**2) 两面行为契约**：

- **CLI 交互面**：保留现自动自愈，但 (i) 拉包前 emitSelfHeal 一条 start 事件到 stderr（用户在场可见「正在补拉 @duckdb/node-bindings-<suffix>@1.5.5-r.4，约 40MB，最长 240s，Ctrl-C 可中断」）；(ii) spawnSync 保留可接受（用户在场+有超时+可中断），不做异步化——异步 spawn 会让 CLI 在拉包中途返回 exit 0 的假成功，比阻塞更糟。
- **MCP/无人值守面**：loadDuckdb() catch 内不再 spawn，直接抛升级版三段披露：
  - DUCKDB-UNAVAILABLE: 原生绑定缺失（原始错误：<msg>）。
  - 修复：在插件目录执行一次 macro-audit doctor --fix（或 npm install --omit=dev）。
  - 说明：MCP 会话内不自动安装（避免宿主进程阻塞）；无网络时 facts/audit 不可用，其余命令不受影响。
  - 设置 MACRO_AUDIT_SELFHEAL=1 可在本进程启用自动补拉（会阻塞 JSON-RPC 最长 240s）。
  - 宿主 LLM 拿到 isError 后可自行向用户转述或代跑 doctor——把「询问用户」还给该在的层。

**3) setup/doctor 命令契约**：macro-audit doctor --fix 扩为自愈唯一主路：复用 selfHealDuckdb() 全部逻辑（平台探测/锁定版/完整性三方校验/每进程一次旗标），增一条 doctor.bindings 检查项＋--fix 时执行补拉并输出自愈事件；四缺陷中的 F4（win32-arm64 摘除接入）、F7（probeUpstream 走 npm config get registry 回落 npmjs.org，与 esbuild PR#1621 废弃硬编码 registry 的理由一致）在此一并落。

**4) 四缺陷归返工票（在 (c) 下重新定性）**：F4→doctor/--fix 票（接入 win32-arm64，注意 1.5.5-r.5 pin 与 D-037⑥ 三方同值断言联动升版）；F7→doctor 票；F8→两票各修一半（CLI 面 start/success 事件全部 stderr 化＋success 移 retry 后——「装成功≠载成功」）；F9→被 (c) 消解大半：MCP 面不再 spawn，CLI 面阻塞有人在场可披露可中断，无需异步化（若未来 MCP 面要支持 opt-in 自动，才需 child_process detached+轮询的异步形态）。

## ⑤ 失败模式与治理

| 失败模式 | 概率/影响 | 治理 |
|---|---|---|
| MCP 面披露文案宿主不转述，用户以为功能坏 | 中/中 | 文案首句即给可执行命令；doctor 在 --fix 之外默认跑 bindings 检查；CI 加「MCP 面 dry-run 断言 DUCKDB-UNAVAILABLE 文案含 doctor 指引」三段断言 |
| CLI 面 spawnSync 240s 用户以为挂死 | 低/低 | start 事件 stderr 预告＋可 Ctrl-C；timeout 兜底回落三段披露 |
| MACRO_AUDIT_SELFHEAL=1 被宿主模板大面积复制→夺舍面回流 | 低/中 | README opt-in 条目写明代价；emitSelfHeal 事件在 MCP 面该模式下仍走 stderr 并含 trigger: opt-in 字段可审计 |
| 自愈写到 node_modules 与后续 npm ci/升级冲突（半成品目录） | 低/中 | 完整性失败 rmSync 回落已在；锁定版不变使 --no-save 幂等 |
| isTTY 误判（pty/伪终端宿主） | 低/低 | 误判为 TTY 只是把 MCP 面降回现行为（有 timeout+披露），可接受；opt-in env 提供确定性出口 |

## ⑥ 与本仓 current 决策冲突核查表

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| **D-072 本体** | **是——需 revised** | 「请求路径自动拉包」是规范化核心条款（账本 D-072① 逐字为「loadDuckdb() DUCKDB-UNAVAILABLE 命中点前置自愈」），不是实现细节；修订只动触发面与时序条款（自愈主路径→限定 CLI 交互面；MCP 面改结构化披露+opt-in），排除法理由（hooks 禁建/wasm 禁迁/vendored 禁入）全部原样有效——锐评没有推翻任何替代项，只推翻了「自动形态的适用面无边界」这一隐含假设。registry 三复审触发器（vendored/wasm/hooks）不动 |
| D-067 自包含分发 | 否，**增强** | CLI 面保留自动自愈=自包含价值保留；MCP 面披露指向 doctor --fix=分发链显式修复路径，bundle 验收硬条件不受影响 |
| D-055 hooks 禁建 | 否，**同向** | MCP 面永不自动拉包收窄了应用自建执行面；npm v12 默认禁 lifecycle scripts 证明 D-055 方向是生态共识 |
| D-059⑨ 二进制值守 | 否 | 不引入 vendored/内置二进制；锁定版+完整性校验原样 |
| D-038 npm publish deferred | 否 | 无涉及 |
| D-063 有实证即裁决 | 否，**被援引** | R21 审计 F4/F9 实证＋本轮工业先例交叉=修订依据充分，不裁决才是违反 |
| D-011/R2-03 Default Mode「一次安装命令」 | **张力，非冲突** | CLI 面自动自愈仍在，Default Mode 语义未收窄；MCP 面改为「一次安装命令＋一次 doctor --fix（或 opt-in env）」——严格说 MCP 用户安装动作从 1 变 1~2 步。裁定：不触及契约本体，但 D-072 revised 条文里应明写「Default Mode 补偿机制在 MCP 面以披露替代自动」，避免下轮审计再翻 |
| D-071 known-failures 清单制 | 否 | 本轮四缺陷若暂修不完可按 D-071 xfail 登记带 review_anchor |

## ⑦ 信息缺口

1. OmniSharp .NET 扩展运行时自举官方一手文档未直接核验（rust-analyzer＋matklad 讨论中间接覆盖）；
2. @duckdb/node-bindings-win32-arm64@1.5.5-r.5 实装接入是否需 dispatcher 版本升级（pin -r.4→-r.5 联动三方同值断言）属返工票技术细节，本轮未验 npm registry 实包；
3. Claude Code 宿主对 MCP 工具 isError 后代跑 shell 命令的实际意愿率无数据——披露→修复的转化路径依赖宿主行为。

## ⑧ 建议追问

1. D-072 revised 条文是否同时把「CI 无人值守面」（非 TTY 非 MCP）一并写入禁自动清单，还是只裁 MCP 面？（本报告按一并写入给出，若只想最小改动可只裁 MCP 面、CI 面留观察）
2. MACRO_AUDIT_SELFHEAL=1 的 opt-in 是否需要搭配一个 doctor 检查项回显该模式开启状态（可审计性）？
3. F9 的异步化（detached spawn+轮询）是否作为返工票备选形态存档，还是随 (c) 直接关闭？
