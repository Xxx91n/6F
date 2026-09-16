# next-round — 轮 12 常驻任务书（轮 11 W15 收口后）

> 生成于 2026-09-16 轮 11 整理环节（handoff skill）。任何子 Agent 读本文件即可接续：先读本节口径→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 口径基线（读前必知）

- 分发面定型（D-051/D-052）：插件名=`6f`、市场名=`xxx91n`（安装引用 6f@xxx91n）、license=Apache-2.0、路径 A+C 双轨（B 未授权）；manifest.meta.json 为 manifest 唯一元数据源（改字段改 meta 跑 gen，勿手改生成物）；内核 CLI/bin/包名 macro-audit 不变
- 托管 API 适配器路径已钉死（D-048/ADR-0020）：REST+env token 主路、gh 已认证态可选回退（非依赖）、无认证降级；锁表 kind=remote-api 已登记
- Micro-A preview 票形已定（D-049）：单票铺开＋6 步验收序列＋4 PR 最小充分集；desk-task15=骨架机械导出字段断言进 NN-check
- 并发策略 = SWMR 单写者门面（ADR-0019）；暂缓面集 25 面值守（D-035④/D-045）
- 仓已公开：push=发布面动作实质发生（marketplace.json 上 main 后任何人可 add）——push 仍停用户闸门
- copyleft 上游（codelore GPLv3/git GPLv2）永不得 vendor 进分发物（ADR-0021）
- 文档面纪律：审计/handoff 文书只记影响正确性的事实与状态断言；流程性自我归因类观察不进提交文档面（用户拍板，会话层纪律）

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第十一轮节＋ADR-0020/0021；跑 33-check＋44-check 确认基线 | D-048~D-052 | 基线快照 | — |
| T1 | **#47 托管平台 API 适配器**（P0）：REST 主路（GITHUB_TOKEN env→X-GitHub-Api-Version pin）＋gh 已认证态可选回退＋无认证降级三态；最小契约=PR 枚举（user.type==Bot+[bot] 双检）＋元数据＋diff 双通道（本地 git base...head 优先／API 兜底）；限流 x-ratelimit-*+Retry-After＋余额写事实库；凭据即用即清不建存储；golden cassette×5（认证/无认证降级/限流耗尽/schema 漂移/平台 Bot）；票毕锁表 github-rest→active | D-048 / ADR-0020 | engine 适配器＋cassette 测试＋NN-check | context7（GitHub REST 文档）/ implement / tdd |
| T2 | **#48 Micro-A preview 单票**（P0，前置 T1）：管道（PR intake→facts→共享骨架 Micro-A 切片）＋实跑＋报告双件＋披露三件；验收序列=① golden 管道 PASS→② env-manager 三形态各 1 PR（dependabot/release-please/人类）→③ jiahao 全人基线 1 PR→④ failure 件 anysearch-cli 无托管面诚实拒绝→⑤ 披露（preview 标注/同主偏差/平台声明 Bot 措辞）→⑥ desk-task15 核验＋micro-a-preview-prep 事件 occurred | D-049 / D-047 / D-032 / D-044 | 双件报告＋NN-check 字段断言＋registry 事件翻转 | implement / tdd |
| T3 | **#49 回归 matrix 三仓接入**（P1）：git/git＋django/django＋spring-projects/spring-boot 各一 leg 入 macro-b-regression resolve job JSON；dispatch 首跑实测克隆耗时（20min 预算），超者按备选表换（curl/flask/kafka） | D-050 / D-046 | workflow JSON＋首跑工件 | implement |
| T4 | **#41b 残余面**（P1）：listing 资产收尾核对（description.md 已更 6f 名/author 值）；B 轨仍不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T5 | push 授权（**用户专属**）：本轮落盘内容（manifest/marketplace.json/LICENSE/ADR/docs/账本/本任务书）随 but 栈推 origin——**注意：推了=marketplace.json 公开生效=路径 A 实质可 add** | D-051 / D-052 | 用户点头＋push | gitbutler |
| T6 | 用户侧动作（**用户专属**）：`/plugin marketplace add Xxx91n/6F` 验证路径 A 安装链；B 轨若日后启用需另拍板 | D-051 / D-052 | 用户操作 | — |
| T7 | mw-trigger-c 值守维持：Macro-A 启动即复审（届时设计仍单写者串行采集→本域永久封口呈报） | D-043 / D-034 | registry 状态翻转呈报 | — |
| T8 | 暂缓面集 25 面值守：判据逐面挂住；复审时点=各层 preview 前置 | D-045 / D-035 | registry confirmations | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报，不静默合一 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（commit/push 分支纪律）；
- `atomcode-research`：外部心智模型调研（串行单发，concurrency=1）；
- `context7`：GitHub REST API 官方文档核查（T1）；
- 验收=NN-check 系列脚本 exit 0；写文件一律 node.js＋读回断言＋BOM 检查。
