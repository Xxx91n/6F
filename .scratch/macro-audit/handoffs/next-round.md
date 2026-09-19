# next-round — 轮 23 常驻任务书（轮 23 grill 收口＋upstream 映射定稿后）

> 更新于 2026-09-19 轮 23 grill 收口（D-079~D-084 六决策落账全 current，零 revised——六轮 atomcode 深调研全经账本 current 冲突核查）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 84 条：78 current／6 revised）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列——A-076~A-081=轮 22 六票＋返工档）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 轮 22~23 留痕（已定，勿重复）

- **轮 22 六票＋返工全闭环 ✅**（A-076~A-081，分支 r22-impl-ledger 未 push）：#65 sealed 分拣（attestation 15 行＋五守卫 sealed()＋stale 8 条＋audit-zero-write fixture）／#66 duckdb 自愈分层（三面＋四段披露＋doctor --fix＋opt-in）／#67 SKIP-STREAK 环境分层（MACRO_AUDIT_CI＋INFO 三态＋receipts jsonl）／#68 upstream-dimension-map v0.1／#69 返工四件（R1 复载死路修＋R2 TDZ＋R3 勘误＋P1 报告恢复）。
- **R22 独立审计 Loop-2=PASS**：硬验收全绿（33:20/20｜34:22/22｜41b:33/33｜44:56/56｜46:30/30｜52a:22/22｜53:25/25｜54:20/20｜55:18/18｜56:24/24｜64:14/14｜14-skeleton｜xfail-run XFAIL:10/10）。
- **轮 23 grill 六决策全 current**：D-079 恒真断言族独立判据（vacuous-deleted 通道＋二值口径＋分级＋自检）／D-080 接线票立项=六项定稿 grill→两张 sibling 票（「合入」勘误=本地定稿非 push）／D-081 review 行 pending(event_bound) 锚化（registry github-rest-review-coverage-dimension）／D-082 Bot 占比 S5 终裁＋快照/趋势通用判据／D-083 映射表 docs/ 独立终裁＋rubric 零口径原则行＋指针分发感知／D-084 权重不进路由契约＋移交 rubric 判据面立案。
- **map v1.0 本地定稿已落**：docs/upstream-dimension-map.md（review 行 pending(event_bound)＋Bot S5 终裁封边＋§④ 快照判据/权重行/双挂中间态＋§⑤ 留票全销）；registry 48 项/32 事件（+github-rest-reviews-active）；33-check +H1/H2 断言。
- **栈面**：round19/21/22-closeout＋r21 六分支栈＋r22-impl-ledger 全未 push（用户闸门）；R23-Q1~Q6 六份调研报告存 reports/。

## 口径基线（读前必知）

- **vacuous 恒真族判据**（D-079）：恒真不可证伪=独立候选族非 FAIL 子类——二值口径 VACUOUS⇔断言引用物缺席∧执行历史零 FAIL；certain（机械导出缺席→自动入册）／likely（路径可能漂移→人工裁决 45-H5 先例）分级；baseline 只拦新增；39-F2 走删除＋留痕行（disposition=vacuous-deleted）**不走 sealed/XFAIL**（sealed=fired 过使命完成装不下从未 fired；XFAIL 无 FAIL/XPASS 信号对恒真失效）；普查 pass 必含 anti-vacuity 自检（注入已知引用物缺席合成断言——D-018 正对照）。
- **pending(event_bound)=挂起的合法形态**（D-081）：无数据形状之面禁止现裁（YAGNI 不为未采集面立法）＋D-035 不得裸挂——prose「待采后裁定」升级为事件锚化 pending（代码面机检锚比日历锚硬）；候选对须注「无偏好序」防读者锚定。有数据形状即可现裁（D-082 对照面），挂起尾巴的正确处置=移除非造不存在的触发事件。
- **快照不承载演化宣称**（D-082③ 通用判据）：窗口快照统计量（cross-sectional=prevalence 状态量）不承载 S4 演化方向宣称；演化归属须以纵向派生 fact（时间序列）为载体——快照 fact 申请 S4 须援引本条并出示纵向派生实物。
- **权重不进路由契约**（D-084）：路由→scoring→weighting 三层分离（UK Gov MCDA 同构本仓 map→spec 判据→C 层 band 人裁）；权重/强弱归 quadrant-rubric 判据面＋C 层人裁；LFX v2 反证：权重可高频迭代的前提=分类面零权重列。
- **「合入」=本地定稿非 push/merge**（D-080② 勘误）：文档定稿（draft→final 评审）与 push/merge 是两道门（Gerrit/Google design-doc 先例）；接线票依赖=map v1.0 本地定稿已满足，push 属分发面用户闸门不绑架工程票。
- **指针分发感知**（D-083）：壳内（engine/skills/）文件不得引用 docs/ 路径（tgz 分发不含 docs/ 安装态必悬空）——rubric 侧只写零口径原则行；NN-check 断言随 #71 落。
- **既有口径沿用**：sealed vs archived 分界（D-073）／测工具不测环境（D-074）／自愈按面分层（D-075）／立场批评受理三要素（D-075④）／预期缺席≠异常缺席（D-077）／dimension:null=防腐层留白（D-078）／守卫分层（D-066）／cue 表纪律（D-069）／kernel 边界（D-058）／npm publish≠依赖拉取辨析／push=用户闸门。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十三轮节＋R23-Q1~Q6 六份调研报告；跑守卫基线（33/34/38/41b/44/46/52a/53/54/55/56/64/14-skeleton/xfail-run）确认全绿 | D-079~D-084 | 基线快照 | — |
| T1 | **#70 vacuous 恒真断言族（P1）**：引用物缺席普查 pass（sibling-dependency grep 复用）＋二值口径 VACUOUS⇔缺席∧零 FAIL＋certain/likely 分级＋baseline 只拦新增＋独立 vacuity-manifest＋39-F2 删除＋留痕行（disposition=vacuous-deleted）＋anti-vacuity 自检注入（合成引用物缺席断言验证探测器）＋断言级 id 盘点（偿 D-071 欠账） | D-079 / D-073注 / D-071注 / D-018 | vacuity-manifest＋普查 pass＋39-F2 处置＋自检 | implement / tdd / domain-modeling |
| T2 | **#71 codelore 接线票·批1（P1）**：COLLECTOR_DESCRIPTORS 注册＋Macro-B 归位（演化主干→S4／s3 族→S3 须成对 opposing／s5 族→S5／explain 族 env 门控／behavior 族 QuadrantEntry）＋裁决面映射常量块＋NN-check「常量↔表逐行对账」守卫＋「engine/skills/ 不引 docs/」断言（D-083⑤）＋dimension:null 保留 | D-080 / D-078 / D-082③ / D-083⑤ / D-054③ / D-035④ | 注册＋归位＋常量块＋双守卫 | implement / tdd / domain-modeling |
| T3 | **#72 github-rest 接线票·批2（P1，#71 后）**：opt-in 注册＋无 token 显式 skipped（不算 PASS）＋pr_summary→S4／merge lead time→S4 仅人类 PR／Bot 占比→S5 辅助披露（宣称强度随票裁）／pr_diff→Micro-A／遥测永久排除＋review 行 event_bound 消费＋golden/cassette 对账（#47 复用） | D-080 / D-081 / D-082 / D-048 / ADR-0020 | opt-in 注册＋归位＋skipped 披露＋cassette 对账 | implement / tdd |
| T4 | **rubric 层立案项（挂触发）**：权重语义立案挂「quadrant-rubric 初版参数起草」票（未立——该票起草时并入权重语义＋LFX v2「人气≠健康」启示一句；本项=登记义务非提前开工，D-062 DoR 登记先例） | D-084④ | 立案登记行 | domain-modeling |
| T5 | **judgement/观察项批处置**（R22 审计 §C＋exec 票面遗留）：sealed()×5 重构候选／emit 盲区／attestation try-catch／TTY once-per-process 注记／G15-G17 表驱动化／detect-libc——逐项裁：分流顺带清（D-070 先例）or 留票面 or 明示不处置 | R22 审计 §C | 逐项处置登记 | — |
| T6 | **真机 MCP 面分层验收**（exec Remaining 推迟项）＋**M2 lane 残影裁定**（package.json staged 版漂移残迹——收编 or 明示留存一句话裁） | R21/R22 exec Remaining | 验收报告＋裁定行 | — |
| T7 | **#52b 待命**：锚=host-narrative-corpus／**#41b 残余**：listing 资产核对留痕，B 轨不授权 | D-061 / D-064④ / D-051 / D-052 / D-042 | 触发即启／资产核对 | — |
| T8 | 值守面复核：registry 48 项——github-rest-review-coverage-dimension（event_bound 新件）／xfail-second-track-trigger(bound=#65)／claude-validate-promotion-watch(manual)／duckdb 三复审／D-076 四触发器／mw-trigger-c／narrative-eval-surface／bundle-retirement／duckdb-binary-watch／golden-verifier-dirty-on-rerun／upstream-probes／暂缓面集 | D-041 / D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-076 / D-077 / D-081 | registry confirmations/状态翻转 | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- **implement / tdd**：#70/#71/#72 三票执行时——TDD 在预定 seam（vacuity 普查 pass、映射常量块、skipped 披露断言）；
- **domain-modeling**：映射常量块落点选型、rubric 权重立案项成形时；
- **grilling / atomcode-research**：T5 judgement 批若需升级裁定、新争议题域；
- **code-review**：三票收口前；
- **handoff**：本轮执行段结束时产出新任务书。

## 用户闸门（勿越）

- **push 授权**：round19/21/22-closeout＋r21 六分支栈＋r22-impl-ledger＋本轮 commit——全未 push 待授权；
- **D-067⑧**：push 后真机 `/mcp` 重验＋CI 首跑实证随闸门；
- **B 轨**：官方目录未授权不触碰；
- **追问挂票**：#70（优先级 P1/P2／vacuity-manifest vs stale-assertions 扩枚举载体裁／likely 级人工 vs 触发器／普查与断言 id 盘点合并）／#71（explain 族 S4 归位与 #36 接缝／映射常量块落点文件）／#72（Bot 占比宣称强度=仅 S5 辅助披露 vs 进 quadrant 判据）／T4（rubric 权重立案挂起草票）——随票裁不前置。
