# next-round — 轮 14 常驻任务书（轮 13 原预设对照清算后）

> 生成于 2026-09-17 轮 13 整理环节（handoff skill）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 58 条：52 current／5 revised／1 closed）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 口径基线（读前必知）

- **Kernel/Agent 职责边界已总则化**（D-058，CONTEXT 词条）：确定性面归 kernel（事实/盖章/门禁），编排与概率性面归宿主 agent（叙事/补查/触发编排/呈现）；裁决 band 永不归 agent（ADR-0013/D-026 红线）
- **叙事面定型**（D-053）：宿主 agent 经 MCP 读 facts 写叙事段→kernel checkAllCitations 盖章（grounded/⚠ uncited＋失败明细）→入报告；kernel 模板叙事居 degraded 兜底位（degraded=true＋UNVERIFIED_MARK）；叙事段禁携带 band；叙事记 model id
- **hooks 层④=可选呈现面/声明位**（D-055，ADR-0008 勘误）：宿主专属非可移植，现无实物；实建走 registry hooks-presentation-face 触发器；com.macroaudit.* 自造命名空间在任何宿主侧 inert
- **repomix-gitingest 已退役**（D-056）：锁表首个 retired 行留档；repo 文件面归宿主 agent 原生访问，产品不提供打包面；重开=registry repomix-reopen-trigger
- **补查回路归 agent**（D-057④）：kernel 只判 insufficient；「证据不足→经 MCP 补查」程序段属 #50 的 strategy-questions.md 义务
- 分发面定型（D-051/D-052）：插件名 `6f`、市场名 `xxx91n`、Apache-2.0、A+C 双轨（B 未授权）；manifest.meta.json 为 manifest 唯一元数据源
- 仓已公开：push=发布面动作实质发生——push 仍停用户闸门；copyleft 上游永不得 vendor（ADR-0021）
- 文书纪律：只记影响正确性的事实与状态断言；流程性自我归因不进仓面

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第十三轮节＋ADR-0008/0015 勘误；跑 33/42/44/46-check 确认基线 | D-053~D-058 | 基线快照 | — |
| T1 | **#48 Micro-A preview 单票**（P0，前置 #47 已闭环）：管道＋实跑＋报告双件＋披露三件；6 步验收序列（golden 管道→env-manager 三形态→jiahao 全人基线→anysearch-cli 诚实拒绝 failure 件→披露→desk-task15＋micro-a-preview-prep 事件闭环）；票面细节见 BACKLOG #48 行 | D-049 / D-047 / D-032 / D-044 | 双件报告＋NN-check 字段断言＋registry 事件翻转 | implement / tdd |
| T2 | **#50 叙事双轨票**（P0）：references/ 三件（quadrant-rubric.md＋strategy-questions.md＋report-template.md）＋宿主 agent 叙事→kernel citation 盖章链路＋MCP facts 只读投影出 stub＋degraded 模板叙事＋citation 失败明细＋model id；band 红线；SKILL.md frontmatter 修复＋R2-Q7 #4/#5 闭环同票；票面细节见 BACKLOG #50 行 | D-053 / D-057④ | rubric 三件＋MCP 查询面＋盖章链路＋NN-check | implement / domain-modeling / tdd |
| T3 | **#51 Macro-B behavior 象限**（P1）：先实物跑 `codelore analyze` 确认 hotspots/coupling 输出 schema→逐面 golden 契约（复用 #35 模式）＋behavior 切片＋能力矩阵措辞同票收窄（strategy: active · behavior: preview · structure/supply-chain: queued）＋归位规则＋低样本披露（TC1_MIN_N=5）＋D-035 勘误注记 | D-054 | 契约面＋behavior 切片＋宣称收窄＋NN-check | implement / tdd |
| T4 | **#49 回归 matrix 三仓接入**（P1）：git/django/spring-boot 各一 leg；dispatch 首跑 20min 预算，超者按备选表换 | D-050 / D-046 | workflow JSON＋首跑工件 | implement |
| T5 | **#41b 残余面**（P1）：listing 资产收尾核对；B 轨仍不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T6 | push 授权（**用户专属**）：本轮落盘内容随 but 栈推 origin——推了=marketplace.json 公开生效 | D-051 / D-052 | 用户点头＋push | gitbutler |
| T7 | 用户侧动作（**用户专属**）：`/plugin marketplace add Xxx91n/6F` 验证路径 A 安装链 | D-051 / D-052 | 用户操作 | — |
| T8 | 值守面复核：mw-trigger-c（Macro-A 启动即复审）＋暂缓面集 25 面＋新触发器三件套（hooks-presentation-face／narrative-eval-surface：#50 闭环即翻转／repomix-reopen-trigger） | D-043 / D-045 / D-055 / D-056 / D-057② | registry confirmations/状态翻转 | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（commit/push 分支纪律，不 push 除非用户明示）；
- `atomcode-research`：外部心智模型调研（串行单发 concurrency=1，ctx_batch_execute 投递）；
- `implement` / `tdd`：T1~T4 票面执行；
- `domain-modeling`：T2 rubric/词条面措辞裁定；
- 验收=NN-check 系列脚本 exit 0；写文件一律 node.js＋读回断言＋BOM 检查；输出文件路径一律完整绝对路径（AGENTS.md 纪律）。
