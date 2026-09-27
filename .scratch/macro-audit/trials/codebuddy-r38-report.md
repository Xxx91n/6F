# CodeBuddy 插件链 feasibility 试用报告

> 轮次=R38 T1｜charter=`codebuddy-r38-charter.md`（判据预声明临场未改）｜session 记录=`codebuddy-r38-session.md`｜证据目录=`trials/codebuddy-r38/`（baseline/codebuddy-run/self-run 三棵产物树）
> **形态限定**：实证面=CodeBuddy **CLI** v2.151.0（`@tencent-ai/codebuddy-code`）；IDE 形态未覆盖。charter 预设「宿主操作=用户驱动面」系按仅 IDE 形态假设——实测 CLI 子命令面齐备，本侧 agent 直接驱动。

## 一、结论（双轴）

| 轴 | 读数 |
|---|---|
| exit 完备性 | 三判据全有读数、findings 四条全过 D-146 初分、session/debrief 落盘、未注册 registry 事件 |
| success | **C1 hit / C2 hit / C3 hit**（三判据全命中；findings 全为 info/low 级设计内行为，无阻塞缺陷） |

## 二、判据逐项（每条附可复跑证据）

### C1 安装链 —— hit

链：`codebuddy plugin marketplace add Xxx91n/6F`（11.3s，✔ type=github）→ `codebuddy plugin install 6f@xxx91n`（4.8s，scope=user enabled）→ 会话内 macro-audit-kernel ready:true → 安装树 selftest ok:true 5/5。

唯一干预步=`doctor --fix`（10.6s，补拉 `@duckdb/node-bindings-win32-x64@1.5.5-r.5`）——pinned README（sha256:7d9e8e96 @456c845e）L45 明示「MCP/无人值守面=install→doctor --fix 1~2 步」，属**文档内**路径，「零文档外干预」判据不破。

复跑：`codebuddy plugin list`（见 6f@xxx91n enabled）；`node ~/.codebuddy/plugins/cache/xxx91n/6f/0.1.0/dist/cli.js selftest`（ok:true 5/5）。

### C2 效果 parity —— hit（字段级全等）

| 面 | baseline（安装树直跑） | codebuddy-run（agent 驱动） | 比对 |
|---|---|---|---|
| report.json 键集 | 70 | 70 | 零非对称 |
| 语义锚 17 项 | head_sha=9eb8f24b…/fact_count=960/commit_count=496/adr_count=14/verdict=supported/codelore pin v0.28.0 等 | 同 | 17/17 零 diff |
| audit-facts.jsonl | 960 行 872583B | 960 行 872583B | 等 |
| audit-measurements.json | — | — | 逐字节等 |

复跑：`node ~/.codebuddy/plugins/cache/xxx91n/6f/0.1.0/dist/cli.js audit D:/Aworker/env-manager --out <dir>`；双侧产物在 `trials/codebuddy-r38/{baseline,codebuddy-run}/`。

### C3 披露 —— hit

report.md 披露块齐：`stability: preview · capabilities: macro-b`、`capability 1 of 5 · preview`、`not_in_preview: Micro-A / Macro-C / Macro-A`、结构限制如实（supply-chain unverified、one-shot 快照时点披露）；会话内 agent 话术带 preview 语义并如实报 `SCALE-NOT-IMPLEMENTED` 自纠。

### 三悬点全部实证

① `.claude-plugin/marketplace.json` 被读 ✅ ② 插件级 `.mcp.json` 自动发现并拉起 ✅ ③ `${CLAUDE_PLUGIN_ROOT}` Windows 展开正确 ✅

## 三、findings（D-146 初分，≠终裁）

| id | 概要 | 严重度 | 四档建议 |
|---|---|---|---|
| F-01 | 安装树缺 duckdb 原生绑定→DUCKDB-UNAVAILABLE 四段披露→`doctor --fix` 自愈成功 | low | 不进裁定链（设计内文档化补偿，D-075 实证按设计工作） |
| F-02 | `codebuddy mcp list` 不列插件注入 server（会话内实 connected）——宿主展示面盲区 | low | 不进本仓裁定链（宿主侧行为）；留宿主适配层观察 |
| F-03 | 安装树=远端 main 顶 66525673，落后本地未 push 开发栈 | info | 环境披露非缺陷 |
| F-04 | `--scale macro` 未实装报 SCALE-NOT-IMPLEMENTED，agent 如实披露自纠 | info | 不进裁定链（结构化错误如实披露=设计行为） |

## 四、流程备注

- `-p` 非交互面首跑 audit 未自动补拉 duckdb——按 D-075 分层自愈语义属「无人值守面不自动拉包」正确行为。
- runbook 步5（本仓自审）附加实证：agent 经 skills 壳驱动 `audit D:/Aworker/6F` 产出 supported 报告五件（self-run/）。
- 90min 时长盒内完成；未触碰宿主 GUI 面（CLI 形态限定如实声明）。
- 关窗未注册 registry 事件（D-151②/D-152⑤ 负向沿行）。
