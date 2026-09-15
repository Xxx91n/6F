# 25 — 铺开与分发收尾：前置清单清点（A-030 / spec §R3-D7）

> 本票零实施动作：只清点落文。所有动作项的出口一律为「待用户拍板」；任何上架/推送/立票执行均属越界（= FAIL）。
> 清点范围：BACKLOG B1/B2/B3 立票建议 + B4 上下游对接 + B5 参考项、plugin 上架条件、演示资产范围。校准输入 = `reports/25-atomcode-research.md`。
> 判定口径：能 = 前置齐备可立票/可执行；不能 = 有硬前置未满足；需什么 = 解除「不能」或拍板所需的具体输入。

## §0 清点时实测快照（2026-09-14）

- 五层盒子壳已在 `engine/` 落位：`plugin.json`（标准 manifest，v0.1.0）+ `.claude-plugin/plugin.json`（Claude Code 原生）双 manifest + `mcp.json`（readOnly stdio）+ `extensions/com.macroaudit.hooks` + `skills/macro-audit` + `manifest.meta.json`（shells/modes/receipt 字段声明）。
- 实现进度：Macro-B 切片已闭环（#20 fact schema v0 / #21 确定性采集器三族 / #23 首报 happy+failure 双产物）；其余 4 scale 未铺开（D-016 阶段 3）。
- 版本控制面：origin 远端已配置（#19 闭环时 `but config push-remote origin`）；`but branch list` 与 `git branch -a` 均无 e-branch-1；仓根无 .gitignore（engine/.gitignore 存在）。
- 文档面：根 README.md 已按 D-021 五段式落盘；docs/decisions/ 索引已存在（README + R3 摘要，引 docs/adr/0012/0013）。

## §1 BACKLOG B1 — 流程规范（立票建议清点）

| 编号 | 事项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| B1.1 | W1/W2 全部 14 份报告补 commit-surface 处置 + 分到独立 branch | 能（机械处置，W3/W4 已示范 `sc`/`re` 形态） | 需：确认处置范围 = 14 份全部、分支命名约定 | decided-now（R5-D-026 例外 1）：范围 = 14 份全量、分支命名沿用票 NN-slug 先例 |
| B1.2 | 启动器收尾硬要求加黑体强提示（防 W2/W3 V2 重演） | 能（18 份启动器文档编辑） | 需：确认强提示措辞与位置（黑体警告样式） | decided-now（R6-D-029）：措辞+位置+范围已定——「## 收尾」段首黑体强提示块（逐字措辞见 D-029），31 份 prompts 全量、handoffs 不加；执行=轮 6 整理环节（BACKLOG #32，已落盘） |
| B1.3 | A-006 重启触发器接入 D-007 演示脚本 | 不能立即（BACKLOG 自带触发条件 = A-006 deferred 等 AI 代码生成主流化，该条件未达成） | 需：用户裁定提前立票或维持 deferred | 维持 deferred（A-006 触发矩阵 T1-T8 未越线）；复审时点 = 触发越线（D-026） |

## §2 BACKLOG B2 — 仓库结构

| 编号 | 事项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| B2.1 | `.scratch/` 跟踪策略定版（当前仓根无 .gitignore，.scratch/ 全部进 git） | 能 | 需：二选一——加入 .gitignore 或明确「继续全部跟踪」 | 挂门｜最迟 阶段 3 铺开前｜触发：首个外部协作者加入 / CI 污染面扩大（准一扇门，提前拍无收益）（D-026） |
| B2.2 | 删 e-branch-1（空分支） | 不能按原文执行——**前提已失实**：实测 but/git 分支清单均无 e-branch-1（疑似已清理或登记时误记） | 需：用户确认本项关闭（或指出该分支实际位置） | closed-superseded：实测分支不存在（本票 §2 为指针）；登记时成立、现不成立（D-026） |

## §3 BACKLOG B3 — 文档与可发现性

| 编号 | 事项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| B3.1 | 仓根 README（原意 = 说明本仓是 spec-level 规划仓、不含代码） | 部分能——实质已闭合：轮 4 D-021 已落盘五段式根 README.md；且原文表述「不含代码」已失实（engine/ 承载实现，ADR-0011） | 需：用户裁定关闭本项，或改为「README 表述微调」小项 | closed-superseded：根 README 已按 D-021 五段式落盘；原文「不含代码」失实（本票 §3 为指针）（D-026） |
| B3.2 | docs/adr/ 链接到 docs/decisions/ 索引 | 部分能——docs/decisions/ 索引存在且 R3 摘要已引 docs/adr/0012/0013；ADR-0001~0014 全集↔索引双向映射未补齐 | 需：确认补全范围（仅 R3 期 ADR 或全部 14 篇） | 挂门｜最迟 listing 材料冻结时｜触发：阶段 3 收尾（与 P3/P4 同门）（D-026） |
| B3.3 | 仓根 CHANGELOG.md 记录本轮 7 ADR + 18 A-xxx | 能——但 BACKLOG 口径已过期：现应为 14 ADR + A-001~A-030 + R3 执行轮 | 需：确认 CHANGELOG 口径（更新后范围） | 挂门｜最迟 阶段 3 首发 tag 前｜触发：阶段 3 开工门评审（D-026） |

## §4 BACKLOG B4 — 上下游对接

| 编号 | 事项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| B4.1 | 进入 Phase 4 实施（需另起工程仓） | — | 已被 D-015 取代（单仓 + engine/ 子目录已落地，「另起工程仓」前提作废），不立项 | 关闭（D-015 supersede 吸收，非事项） |
| B4.2 | 与 jiahao / anysearch-cli / env-manager 对接 | 不能立即（多票工程，视产品方向；三仓被 W2 扫描但未实际集成） | 需：用户定产品方向与对接优先级 | decided-now（R6-D-033）：试点仓角色绑定能力层——anysearch-cli→Macro-C 校准／env-manager→Micro-A＋泛化验证／jiahao→Micro-B·Macro-B 回归+下限／三仓并跑→Macro-A；泛化验证须引≥1 非自有公开仓（Macro-B GA 前置）；拆票=可用性审计→one-shot→各层试点→回归（#37/#39/#40） |

## §5 BACKLOG B5 — 不可立票事项（参考清点，含决策点者仍标拍板）

| 编号 | 事项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| B5-1 | W1~W4 commits 合入 main 的栈序 + push 策略 | 不能由 agent 自行处置（B5 声明需用户指示） | 需：用户给栈序 + push 授权 | closed：R3 收口已按用户授权执行（栈序 24→25→grill-r4，push 8be9db5 gh api 在案）（D-026） |
| B5-2 | 仓根 .gitignore 缺失 → .scratch/ 被追踪 | 能（并入 B2.1 同项处置） | 需：同 B2.1 二选一 | 随 B2.1 同门处置（D-026） |
| B5-3 | A-006 评估仅 framework、未实际扫描 | 不能立即（与 B1.3 同源：触发条件未达成） | 需：同 B1.3 裁定 | 随 B1.3 维持 deferred（D-026） |
| B5-4 | 「仓无远端；push 需明确指令」 | 不能（push 仍属用户闸门）——**前提部分失实**：origin 已于 #19 闭环配置（github.com/Xxx91n/6F.git，push-remote=origin），「仓无远端」半句作废；「push 需用户明确指令」仍成立 | 需：任何 push 由用户显式下令 | closed-superseded（半句失实）：origin 已配置且 R3 收口 push 已执行；「push 需用户明示指令」条款仍有效（纪律维持）（D-026） |

## §6 plugin 上架条件清点（目标形态 = Agent Plugins 1.0.0 五层盒子 + 双 manifest，per D-012/ADR-0008；校准 = 调研 §2.1 四层闸门）

| 编号 | 条件 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| P1 | 五层盒子实体齐备且合规 | 部分能——壳已落位（§0）；但 Agent Plugins 1.0.0 plugin schema 原文未逐字段核对（该前置登记于 D-020 派生待决） | 需：读 schema 原文做逐字段合规核对（可单独立票） | 挂门｜最迟 上架提交前｜预核对可提前存 baseline，正式核对不可（D-026） |
| P2 | 版本与上游锁定（调研四层闸门②） | 部分能——engine/package-lock.json 在库、版本 0.1.0 无复用冲突；版本单调策略与上游锁定表状态列待制度化 | 需：版本策略 + 上游清单表「已接入/规划中」状态随阶段 2/3 更新（衔接 T2） | 分层挂门｜框架现在可定（契约声明已在 README）；数值化承诺最迟 阶段 2 双结题（D-026） |
| P3 | 审核材料（样例报告 + 演示入口 + 5 步走查） | 部分能——样例报告有候选（§7-D1）；演示入口/内置样例项目未实现 | 需：演示资产范围拍板后制作 | 挂门｜最迟 上架提交前｜触发：上架提交动作启动（D-026） |
| P4 | listing 最小集（图标/截图/描述/支持链接） | 不能——图形资产零 | 需：§7-D3 拍板 + 制作 | 挂门｜最迟 listing 提交前（功能冻结后，截图须拍真实 UI）｜占位可、定稿不可（D-026） |
| P5 | 发布通道与凭据（市场账号、secrets、签名策略） | 不能——目标市场未定、无凭据；发布动作本身属用户闸门 | 需：用户选目标市场（Agent Plugins 生态 vs 通用市场）+ 账号/凭据 | 方向已拍：纯 Agent Plugins 生态（R5-D-027）；通用市场不进入不占位不注册；凭据申请最迟 阶段 3 开工门启动（D-026 例外 2 落点） |
| P6 | 上架最小形态（能力铺开度口径） | 不能现在定——Macro-B 单 scale 已可跑通（首报闭环）；是否「单 scale 即上架」vs 等更多 scale 属产品裁定 | 需：用户定「最小可发布形态」口径 | decided-now（R6-D-031）：Macro-B 单层 + Preview 形态即具备上架资格（capability 1 of 5 · preview＋0.x 语义＋changelog 明示覆盖）；build-scope≠release-sequence 划界入规（ADR-0017）；上架动作仍属用户闸门 |

## §7 演示资产范围清点（校准 = 调研 §2.3「两条路径逐一对齐」）

| 编号 | 资产项 | 可执行判定 | 需什么 / 前置 | 拍板状态 |
|---|---|---|---|---|
| D1 | 样例报告（审核员路径核心资产） | 能——已有 reports/23-first-report.{md,json} + 23-first-report-failure.{md,json}（同骨架 + ⚠ unverified），含真实感数据且为 6F 自身审计（无敏感数据） | 需：用户确认将其列为发布样例资产 | decided-now（R6-D-030）：四件列为发布样例资产，复制至 examples/first-report/（仓根公共路径，披露制防失真）；golden CI 登记阶段 3 候选票（#43） |
| D2 | 演示路径覆盖（10 路径法，D-007/ADR-0007） | 部分能——已交付 2/10（Macro-B happy + failure）；其余 8 路径（4 scale × 2）属阶段 3 铺开 | 需：拍板上架期演示口径（仅 2/10 或排期补齐） | decided-now（R6-D-032）：上架期演示口径=仅 2/10（Macro-B happy+failure）；其余 8 路径=各层 preview 里程碑 DoD 准入件；未上架层仅文字披露＋「Not yet in preview」标注 |
| D3 | listing 图形资产（图标/截图/hero/promo tile） | 不能——均未制作；候选范围 = readme-crafter Phase 6 建议（CI 徽章/hero 图/首报截图）+ 调研 §2.3 最小集 | 需：用户定资产清单与制作排期 | 同 P4 一并挂门（可合并一行拍）（D-026） |
| D4 | 演示入口（内置样例项目 / demo 数据面） | 不能——未实现 | 需：立票时定义形态（样例仓 or 内置 fixture） | 挂门｜最迟 阶段 3 铺开前｜触发：阶段 3 开工门（D-026） |
| D5 | 样例资产版本跟随纪律 | 能（流程约束）——发版时重跑生成样例报告，保持与当前产物一致（调研 §2.3-4） | 需：写入届时上架票的 AC | 挂门｜最迟 首个含样例发布前（与 CHANGELOG 同门）｜触发：阶段 3 首发 tag（D-026） |

## §8 呈报：逐项拍板请求汇总

请用户对下列决策点逐项回复（编号 = 上文行号）：

- **立票类**：B1.1（范围+命名）/ B1.2（措辞）/ B1.3（提前立票 or 维持 deferred）/ B2.1（ignore or 跟踪二选一）/ B3.2（补全范围）/ B3.3（CHANGELOG 口径）/ B4.2（方向与优先级）
- **关闭/失实确认类**：B2.2（e-branch-1 不存在）/ B3.1（README 已闭合，原文表述失实）/ B5-4（origin 已配置）
- **授权类**：B5-1（栈序+push 策略）/ B5-4（push 指令）/ P5（市场+凭据）
- **范围裁定类**：P1（schema 核对立票）/ P2（版本策略）/ P3+P4（制作排期）/ P6（最小可发布形态口径）/ D1~D5（演示资产范围）

> （2026-09-15 R5 收口：拍板范围与逐行挂门已按 D-026/D-027 更新「拍板状态」列；§1-§7 判定列与正文保持原样——superseded 关闭 = 改状态不改内容。绑定表全文见 .scratch/macro-audit/reports/R5-Q5-atomcode-research.md §3。）
> （2026-09-15 R6 收口：B1.2/B4.2/P6/D1/D2 五行拍板状态列已按 D-029/D-030/D-031/D-032/D-033 更新为 decided-now；判定列与正文保持原样——触发已发生＋拍板完成只改状态列。）

