# next-round — 轮 24 常驻任务书（轮 24 grill 收口＋GitHub 门面三面定稿后）

> 更新于 2026-09-20 轮 24 grill 收口（D-085~D-091 七决策落账全 current，零 revised——R24-Q4 atomcode 深调研经账本 current 冲突核查）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 91 条：85 current／6 revised）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 轮 22~24 留痕（已定，勿重复）

- **轮 22 六票＋返工全闭环＋R22 审计 Loop-2 PASS**（沿上轮任务书口径）。
- **轮 23 全链闭环 PASS**：map v1.0 本地定稿＋#70/#71/#72 三票执行毕＋R23 审计 PASS-with-findings 打回修复全绿（lane r23-impl：`82cbb60→c3767c3→62ed336→wxr` 未 push）——详见 `.scratch/macro-audit/handoffs/2026-09-19-r23-audit-pass-handoff.md`（含留票面 S1 census 双份/S3 魔数地板/S6 开关重复/S7 tripwire/P-d 过程呈报五项登记）。
- **轮 24 grill 七决策全 current**：D-085 门面三面全含＋元数据写置最后／D-086 README 双层门面／D-087 双语双文件 EN 主位／D-088 canonical→derived 同步守卫三分类／D-089 中度视觉＋CI badge·动图双触发项／D-090 社区七件全补／D-091 元数据草稿包＋包级授权。
- **registry 51 项/34 事件**：+engine-ci-main-green 事件＋readme-ci-badge/readme-motion-gif 双值守项；33-check +H3/H4；44-check G6→#73；CONTEXT.md +Canonical→Derived 条目；BACKLOG +#73。
- **栈面**：round19/21/22/23-closeout＋r21 六分支栈＋r22-impl-ledger＋r23-impl＋r23-audit 全未 push（用户闸门）；R24-Q4 调研报告存 reports/。

## 口径基线（读前必知）

- **门面诚实纪律**（D-085②/D-089）：preview 标注/⚠ 未接/synthetic 印记延伸到门面——badge 只挂当下为真项（license/version/node/marketplace）；CI 徽记绑 engine-ci-main-green 事件（未绿前 README 不得含 workflow/actions 徽标，33-check H4 执哨）；动图绑 listing-material-freeze（25-P4/25-D3 同锚：功能冻结后拍真实 UI 不伪造）。
- **canonical→derived**（D-087/D-088）：README.md EN=canonical 权威源、README.zh-CN.md=derived 工件——译文可暂时落后不得假装新鲜；canonicalMarker 首行声明＋zh-CN heading 带 {#english-id} 锚点（锚点不译标题可译）＋`<!-- sync: <en-hash> -->` 版本戳＋owner 字段；守卫三分类：结构互等=FAIL／版本戳掉队=XFAIL·warn（小修不逼假同步）／译文质量=人评审不可机检。
- **生效边界**（D-085③）：门面改动落 but 分支≠上线——live face=main 分支；repo 元数据=即刻生效公开面（D-091 包级授权已授三项）仍按 D-085② 置执行最后。
- **沿用口径**：快照≠趋势（D-082③）／权重不进路由（D-084）／合入=本地定稿非 push（D-080②）／pending(event_bound)（D-081）／指针分发感知壳内不引 docs/（D-083）／sealed vs archived／测工具不测环境／push=用户闸门。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十四轮节＋R24-Q4 调研报告；跑守卫基线（33/34/38/41b/44/46/52a/53/54/55/56/64/70/71/72/xfail-run/upstream-map/github-rest）确认全绿 | D-085~D-091 | 基线快照 | — |
| T1 | **#73 门面整改总票（P1）·步1 面二社区七件**：root LICENSE←engine/LICENSE 复制（ADR-0021/D-051 执行债）／CONTRIBUTING 诚实姿态（preview 单作者维护+issue 欢迎+PR 政策+纪律指针 AGENTS.md）／SECURITY（披露渠道+0.x 仅最新版）／CODE_OF_CONDUCT／ISSUE_TEMPLATE×3（字段含宿主/版本/OS/selftest 输出）／PULL_REQUEST_TEMPLATE（dogfood 纪律清单）／CODEOWNERS（*=Xxx91n） | D-090 / D-085 / ADR-0021 / D-051 | 七件文件 | implement |
| T2 | **#73·步2 面一 README 双语重构**：README.md EN 双层门面重写（pitch→badges→能力矩阵→安装→样例截片→快速验证＋工程节段下半层）＋README.zh-CN.md 中文全量（canonicalMarker/{#english-id}/sync 戳/owner）＋icon.svg 派生 logo/hero＋架构 SVG 一张（三层盒/五尺度择一） | D-086 / D-087 / D-089 / D-031 | 双 README＋视觉资产 | readme-crafter / beautify-github-readme |
| T3 | **#73·步3 73-check.mjs 双语同步守卫**：canonicalMarker 断言＋heading 锚点集/code block 集/链接目标集/badge 集互等=FAIL＋sync 版本戳失配=XFAIL（非 FAIL）＋owner 字段入配置 | D-088 | 73-check.mjs | implement / tdd |
| T4 | **#73·步4 面三元数据执行**（末步）：gh repo edit description+topics 十枚＋social card 1280×640 PNG（icon.svg 派生制作后上传）——D-091 包级授权已授照稿执行；homepage 留空 | D-091 | gh 写结果＋逐项回报 | — |
| T5 | **R23 三追问 grill 候选**（handoff 指示未烤）：字面钉失效族通用纪律（71-A1/72-C2/70-C1 vs xfail-41a-d6/d7 同族）／对账边界扩面（deferred-faces registry 枚举⇔常量成员级）／超枚举政策（preflight 无生产者注记原则行） | R23 handoff §方向1-3 | grill 裁定呈报 | grilling / atomcode-research |
| T6 | **judgement/观察项批**（沿用 T5 票面）：sealed()×5 重构／emit 盲区／attestation try-catch／TTY once-per-process／G15-G17 表驱动化／detect-libc＋R23 审计留票五项（S1 census 双份/S3 魔数地板/S6 开关重复/S7 tripwire/P-d） | R22 §C / R23 留票面 | 逐项处置登记 | — |
| T7 | **真机 MCP 面分层验收＋M2 lane 残影裁定**（沿用） | R21/R22 Remaining | 验收报告＋裁定行 | — |
| T8 | **rubric 权重立案项**（挂 quadrant-rubric-params-draft 触发不提前开工）＋**#52b 待命**（host-narrative-corpus）＋**#41b 残余**（B 轨不授权） | D-084④ / D-061 / D-042 | 登记行 | domain-modeling |
| T9 | 值守面复核：registry 51 项——readme-ci-badge／readme-motion-gif（新）＋github-rest-review-coverage-dimension＋xfail-second-track(bound=#65)＋promotion-watch(manual)＋duckdb 三复审＋D-076 四触发器＋暂缓面集 | D-041 / D-081 / D-088 / D-089 | registry confirmations/状态翻转 | — |
| T10 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- **readme-crafter**（`C:\Users\Administrator\.agents\skills\git\readme\readme-crafter-skill-main\`）：T2 README 重构主驱动（分类模型→SCAN→UNDERSTAND→GENERATE→VERIFY）；
- **beautify-github-readme**：T2 视觉层（hero/SVG/badge——先定 mode 再动手，preview-verify 收尾）；
- **implement / tdd**：T1 七件＋T3 守卫断言；
- **domain-modeling**：T8 rubric 立案成形时；
- **grilling / atomcode-research**：T5 三追问升级裁定、新争议题域；
- **code-review**：#73 收口前 diff 双轴复评；
- **gitbutler**：VC 写操作唯一面——#73 用独立分支（建议 `facade-impl` 或 `r24-impl`），不 push 除非用户明示；
- **handoff**：执行段结束同规程再生。

## 用户闸门（勿越）

- **push 授权**：round19/21/22/23-closeout＋r21 六分支栈＋r22-impl-ledger＋r23-impl＋r23-audit＋本轮 commit——全未 push 待授权；
- **元数据写**：D-091 包级授权限三项（description/topics/social-card）照稿执行——扩字段（homepage 等）须重新呈报；
- **D-067⑧**：push 后真机 `/mcp` 重验＋CI 首跑实证随闸门；
- **B 轨**：官方目录未授权不触碰；
- **追问挂票**：#73 内（首屏文案逐字/SVG 三选一/模板字段/social PNG 制作细节）随票裁；T5 三追问（字面钉纪律/对账边界/超枚举）待 grill 窗；#72（Bot 占比宣称强度）；T8（rubric 权重立案随起草票）。
