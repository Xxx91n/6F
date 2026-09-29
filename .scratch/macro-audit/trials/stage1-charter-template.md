# Stage-1 试点 charter 模板（备而建不启用——D-162② 逐案复用件）

> **模板态声明**：本件=Stage-1 定向邀请试用 charter 的逐案复用模板（D-162②「charter 协议逐案复用」；D-151 形态先例=本目录 codebuddy-r38-charter.md）。**模板本身不产生试点**——首个具案 charter 须经用户逐案闸门（D-162⑤ Stage-1 宿主资格逐案用户裁定）立项后，复制本模板填写并 commit 入库方开启试用窗（判据预声明=Kill Criterion，charter 入库前窗不可开——D-151②）。
> 填槽约定：`【槽位】` 为逐案必填位；判据阈值须 commit 前预声明钉死，禁临场改。
> 建制记录：轮48 T1-D 用户拍板「建」（2026-09-29 呈批回执）——备而建不启用（D-175④ shadow 边界维持）。

## 使命句（SBTM charter 形态——directive 非 prescriptive）

Explore 【产品/插件面】在【宿主/用户环境】的【安装接入链＋审计驱动面】，with 【接入路径与资产清单】，to discover 【适配层真实缺陷与可用性读数】（findings → D-146 摄入分诊四态）。

## 判据表（success 轴——各判据独立取值，阈值预声明）

| # | 判据 | 可操作定义 | 阈值/命中方向 | 未中语义 |
|---|---|---|---|---|
| C1 | 接入链 | 【安装/接入序列逐条列——命令级】 | 【如：零文档外干预步；文档基线钉 SHA】 | 每个文档外干预步=一条 finding |
| C2 | 效果 | 【审计产出与基线的比对轴——字段级 parity／facts 完整性／报告契约】 | 【键集＋语义不变量定点值判据——禁滑纯键集（D-132 锁面）】 | 差异点逐件记 finding＋Assignable Cause 归因；找不到归因→默认异常读数有效并升级调查（禁悄悄二选一） |
| C3 | 披露 | 【preview/试点标注不失守的观测点——报告字段＋话术呈现】 | 零失守 | 失守→finding |

## 悬点实测清单（首轮逐项落读数）

- [ ] 【悬点 1——逐案钉】
- [ ] 【悬点 2】
- [ ] 【悬点 3】

## 执行路径（runbook 推荐序列）

1. 【接入步骤——命令级】
2. 【验证步骤——含进程拉起与绑定自检分界命令（宿主未拉起 vs 拉起即崩）】
3. 【审计驱动步骤】
4. 【对照基线步骤——基线钉 SHA】
5. session 记录＋findings 票面落盘 → D-146 四档初分 → debrief 落盘本目录

## 预声明规则（禁临场裁——D-152②④⑦ 形态）

- **依赖不可得→判据读数=not-run**：如实记录不可得原因；exit 完备性不受影响、success 独立取值；不换仓不临场扩射程
- **审计读数以安装树/受控环境为准**：开发侧中间态不入判据只作环境披露
- **摄入分诊（四档初分）≠终裁**：量大不阻塞关窗，裁定链走后续轮次
- **关窗不注册 registry 事件**（D-151② 负向）；未实测残项挂 manual_watch 五要素接力
- **D-173 静默窗衔接**：charter 立项注册=window.start_event 候选锚（pilot_started）；能力面 findings 重置窗（reset_log 入账），hygiene findings 记披露不重置

## exit / success 双轴（D-151②）

- **exit（关窗判据）**＝判据全跑完＋每条有读数＋findings 全过摄入分诊＋session 记录＋debrief 落盘——关窗不预设成功
- **success（成功判据）**＝各判据命中与否独立取值；试点未达标≠失败（outcome 四档：stop／continue-with-modifications／continue-with-monitoring／continue-as-is）
- debrief 标题=「【宿主/试点名】feasibility 试用报告」（禁「验收报告」措辞）

## findings 票面五要素（D-151②，deduplicate-first）

每条 finding：①复现步骤（精确到命令/URL）②环境快照③严重度④来源（判据编号）⑤预填 D-146 四档去向建议（快照属实/现状已修→不进裁定链；仍开放→立 D-xxx 或挂批次；无法核实→pending＋复审时点；可证伪→驳回附依据）。**先 deduplicate**：与悬点清单/既有账面逐条互斥再分诊。

## 环境快照字段（session 记录模板）

宿主版本＋形态／接入树 SHA／OS／文档基线 SHA／目标仓 SHA／开发仓 HEAD＋`git status` 计数＋worktree dirty 标记／每步实际命令＋读数／TBS 计时（可选）

## 时长盒与执行主体

- 时长盒【N】分钟（SBTM 60–120min 惯例；超盒→partial session，未跑判据=not-run）
- 执行主体：【宿主侧 agent/外部用户——Stage-1=用户主权逐案裁定（D-162⑤）】＋本侧记录者（session 记录与 debrief 文书）

## 遗留与回流

- findings 全量→D-146 四档初分→仍开放者立 D-xxx 或挂批次优先级重排
- 关窗后注记按 D-146⑤ 勘误惯例更新为实测结论
