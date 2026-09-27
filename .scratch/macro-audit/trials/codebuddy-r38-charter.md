# CodeBuddy 插件链 feasibility 试用 charter（R38）

> **判据预声明（Kill Criterion，D-151②）**：本 charter commit 入库后试用窗方可开启。本件=操作 charter（directive 非 prescriptive——执行步骤细节由宿主会话临场走，判据与记录义务不可临场改）。
> 载体语义：宿主试用/试点执行档案（trials/ README 声明）；本件为 D-150②④⑤／D-151①②③／D-152②④⑤⑥⑦⑧ 的执行承载面。

## 使命句（SBTM charter 形态）

Explore 6F Agent Plugin 在 CodeBuddy 宿主的安装链与 Macro-B 审计驱动面，with 既有 marketplace git-clone 路径与 skills 壳＋MCP 读面，to discover 宿主适配层真实缺陷与可用性读数（findings → D-146 摄入分诊）。

## 三判据（success 轴——各自命中读数，独立取值）

| # | 判据 | 可操作定义 | 阈值/命中方向 | 未中语义 |
|---|---|---|---|---|
| C1 | 安装链 | `/plugin marketplace add Xxx91n/6F` → `/plugin install 6f@xxx91n` → `/mcp` 见 macro-audit-kernel connected → `selftest` 5/5 | **零文档外干预步**（文档基线=engine/README.md sha256:7d9e8e96aedd8ac1 @commit 456c845e） | 每个文档外干预步=一条 finding（D-146 摄入） |
| C2 | 效果 | env-manager（`D:\Aworker\env-manager`，钉 SHA 9eb8f24b）一次 Macro-B 审计经 CodeBuddy agent 驱动产出完整报告（四象限＋provenance＋preview 披露块），与基线（安装树 `dist/cli.js` 本机直跑同 SHA）作**字段级 parity** | 字段键集＋语义不变量定点值全等（D-132 锁面定义——禁滑纯键集） | 差异点逐件记 finding，Assignable Cause 归因；找不到归因→默认异常读数有效并升级调查（禁悄悄二选一） |
| C3 | 披露 | 全程 preview 标注不失守：报告 `stability:"preview"`、Macro-A not-yet 如实、**会话内 agent 话术呈现**含 preview 语义（观测点） | 零失守 | 失守→finding |

## 三悬点实测清单（首轮逐项落读数——D-150③ 实证收口）

- [ ] 仓根 `.claude-plugin/marketplace.json` 是否被 CodeBuddy 市场读取（`/plugin marketplace add` 实际结果）
- [ ] 插件级 `.mcp.json` 是否自动发现（macro-audit-kernel 是否自动注册为 MCP server）
- [ ] Windows 真机 `${CLAUDE_PLUGIN_ROOT}` 展开（`/mcp` connected 即证；未拉起→查 stderr/init 日志）

## 执行路径（runbook 推荐序列）

1. `/plugin marketplace add Xxx91n/6F` → `/plugin install 6f@xxx91n`（若市场文件不识别→finding＋改走 `plugin.json` `mcpServers` 修复票路径裁定，**禁同位双 `.mcp.json`**——D-066 红线）
2. `/mcp` 验证 macro-audit-kernel connected；未 connected→`node <安装树>\engine\dist\cli.js selftest` 区分「宿主未拉起」vs「进程拉起即崩」；duckdb 绑定缺失→`doctor --fix` 唯一主路（D-075：MCP 无人值守面永不自动拉包）
3. 本仓自审（安装链验证＋dogfooding）：agent 经 skills 壳引导对 `D:\Aworker\6F` 跑审计
4. env-manager 效果审：agent 驱动 `audit D:\Aworker\env-manager`
5. 对照基线：本机直跑 `node <安装树>\engine\dist\cli.js audit D:\Aworker\env-manager --out <tmp>`（记录安装树 SHA）→字段级 parity 比对
6. session 记录＋findings 票面落盘 → D-146 四档初分 → debrief 报告落盘

## 预声明规则（禁临场裁——D-152②④⑦）

- **env-manager 不可得→判据二读数=not-run**：如实记录不可得原因；exit 完备性不受影响、success 独立取值；不换仓不临场扩射程（防撞 D-150②「禁新开外部仓」负向）
- **审计读数以安装树为准**：开发 worktree 中间态（index staged-revert 簿记态 ~80 件 MM/D）不入判据只作环境披露——audit/intake 读 worktree 文件面非 git objects（D-059⑦），安装树=clean clone 结构性免污染
- **摄入分诊（四档初分）≠终裁**：量大不阻塞关窗，裁定链走后续轮次
- **试用关窗=判据驱动不注册 registry 事件**（D-151② 负向）；关窗后未实测残项按 Trigger-gated 挂 manual_watch 五要素接力

## exit / success 双轴（D-151②）

- **exit（关窗判据）**＝三判据全跑完＋每条有读数＋findings 全过 D-146 摄入分诊＋session 记录落盘＋debrief 报告落盘 trials/——关窗不预设成功
- **success（成功判据）**＝三判据各自命中与否（3/0、2/1、1/2、0/3 均可能）；pilot 未达标≠失败（outcome 四档：stop／continue-with-modifications／continue-with-monitoring／continue-as-is）
- debrief 标题=「CodeBuddy 插件链 feasibility 试用报告」（禁「适配验收报告」措辞）

## findings 票面五要素（D-151②，deduplicate-first）

每条 finding：①复现步骤（精确到命令/URL）②环境快照（下节字段集）③严重度④来源（判据编号 C1~C3/悬点编号）⑤预填 D-146 四档去向建议（快照属实/现状已修→不进裁定链；仍开放→立 D-xxx 或挂批2；无法核实→pending＋复审时点；可证伪→驳回附依据）。**先 deduplicate**：与三悬点清单/既有账面逐条互斥再分诊，防重复票膨胀。

## 环境快照字段（session 记录模板）

CodeBuddy 版本＋形态（IDE/CLI）／插件安装树 SHA／OS＝Windows 11／文档基线 SHA（README 7d9e8e96aedd8ac1）／目标仓 SHA（env-manager 9eb8f24b）／开发仓 HEAD＋`git status --short | wc -l` 计数＋worktree dirty 标记／每步实际命令＋读数／TBS 计时（可选——单人短窗降可选，SBTM 标配简化）

## 时长盒与执行主体

- 时长盒 90 分钟（SBTM 60–120min 惯例取中；超盒未完成→记 partial session，未跑判据读数=not-run）
- 执行主体：CodeBuddy 侧 agent（用户驱动）＋本侧记录者（session 记录与 debrief 文书）

## 遗留与回流

- findings 全量→D-146 四档初分→仍开放者立 D-xxx 或挂批2 优先级重排（D-150⑤ 先行=排程优先——批2 无依赖项可并行准备，处置顺序服从本试用回流）
- 关窗后注记②「实证待真机收口」按 D-146⑤ 勘误惯例更新为实测结论
