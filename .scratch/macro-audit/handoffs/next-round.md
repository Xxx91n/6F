# next-round — 轮 25 常驻任务书（轮 25 grill 收口＋6F 正名/守卫纪律建制定稿后）

> 生成：2026-09-22 轮 25 收口。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（96 主记录：90 current／6 revised=D-002/008/012/014/022/072）；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 22~25 留痕（已定，勿重复）

- 轮 24 门面三面七裁（D-085~D-091）→#73 已实施+审计 PASS+合入 main（双语门面/badges/73-check 上线、description/topics 生效）；**未闭环**=social-card.png 待所有者 web-UI 手动上传（闭环链尾，见 T10）。
- 轮 25 grill 五裁（D-092~D-096，五轮 atomcode 深调研全零 revised）：6F 正名+六-F 宣言／波及面分层／断言失效三分类／枚举 open-closed／census-contract。调研报告存档 `.scratch\macro-audit\reports\R25-Q{1..5}-*.md`（提示词同目录）。
- engine-ci 首跑实证：YAML 死面 8 天→块标量修复合入 main（603268b）→**首跑 5/6 job 红**→立案 #76（挡 engine-ci-main-green 事件）。
- R23/R24 审计发现已分流：A4 名不副实修法（剥注释）成 D-094 通用先例；机芯双份问题已升格 D-096 建制（勿在 judgement 批重复处置）。

## 口径基线（读前必知）

- 门面现状：README 首屏显示名仍=`macro-audit`（kernel 内部名误上门面=R25 动因）；六-F 宣言文案冻结在 D-092（Facts/Federation/Forensics/Five scales/Frankness/Fingerprints——槽6 备选 Fenced/Fidelity 留档）。
- 双名分层（D-093）：品牌层=`6F`／kernel 技术标识=`macro-audit*` 保留不动——分层=纪律非债。
- registry 51 项/34 事件；engine-ci-main-green 事件实证未发生（CI 红），readme-ci-badge/readme-motion-gif 双值守项不预翻。
- 守卫基线全绿（收口复跑结果见收尾汇报）；70-check 断言盘点=63-assertion-inventory.json 机生面，改守卫源码后须 `update-70-inventory.mjs` regen。

## 任务序列

| T | 任务 | 覆盖 D | 交付物 | suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十五轮节＋R25-Q1~Q5 调研报告；跑守卫基线（33/34/38/41b/44/46/52a/53/54/55/56/64/70/71/72/73/xfail-run）确认全绿 | D-092~D-096 | 基线快照 | — |
| T1 | **#74 6F 正名＋六-F 宣言**（P1）：hero.svg 重绘〔名=6F＋三 chip→六 F 族〕→README.md〔H1/alt→6F＋Highlights 宣言块六句各一行短句＋preview badge 紧随＋canonical 锚 #6f＋兼容锚 a-id macro-audit〕→README.zh-CN.md 派生镜像（D-088 纪律）→social-card.png 重产→description.md displayName→6F＋变更注记→engine/README 代号注记行→73-check 锚点集同步 | D-092 / D-093 / D-088 / D-031 / D-052 | 门面资产+73-check 绿 | implement / readme 系 skill |
| T2 | **#76 engine-ci 首跑红修**（P1，挡 engine-ci-main-green 事件）：A 类 Node-20——audit.test J1/J2＋demo.test M1（stdout sidecar 解析失败，node20 挂/22 过/24 本地绿，需 Node-20 复现）；B 类非 Windows——duckdb-selfheal-e2e 4/4 FAIL（bindings 补拉后包目录未复在）；复现线索 run 35515346216 | R24 handoff / D-072③ | CI 全绿 run | diagnosing-bugs / tdd |
| T3 | **#75 批1 失效三分类建制**（D-094）：字面钉普查 pass（扫 NN-check 源码找日期字面量/魔数地板/裸 occurred===→归因注记）＋剥注释名检通用化＋presence/liveness/readiness 三层命名＋XFAIL 册明文只收合法漂移类＋vacuity 豁免登记位 | D-094 / D-079 / D-071 | 普查 pass+册规补丁 | implement / tdd |
| T4 | **#75 批2 枚举 open-closed**（D-095）：每枚枚举面标 open/closed＋closed 面成员级双向差集 lint（explain 9 面/遥测排除首案）＋常量 SSOT 派生计数＋preflight 逐条裁（内部防万一则删）＋reserved 机制仅外部输入面 | D-095 / D-081 | open-closed 声明集+lint 断言 | implement |
| T5 | **#75 批3 census-contract**（D-096）：63 清单头契约块（字段 schema 归一＋五豁免规则正反例对）＋70-check 互等裁决断言比对契约＋契约变更 PR 门控＋契约=70/vacuity 共用规格 | D-096 / D-037 | 契约块+E2 断言 | implement / domain-modeling |
| T6 | **judgement/观察项批**（沿用，census 双份项已升格 T5 移除）：sealed()x5 重构／emit 盲区／attestation try-catch／TTY once-per-process／G15-G17 表驱动／detect-libc＋R24 新增三件（EN 中文钉串双语契约注记／73-check D 组票面外扩登记／en-slug 裸锚读者面成本） | R22 §C / R23-R24 留票面 | 逐项处置登记 | — |
| T7 | **真机 MCP 面分层验收＋M2 lane 残影裁定**（沿用） | R21/R22 Remaining | 验收报告＋裁定行 | — |
| T8 | **rubric 权重立案项**（挂 quadrant-rubric-params-draft 触发不提前开工）＋**#52b 待命**（host-narrative-corpus）＋**#41b 残余**（B 轨不授权） | D-084④ / D-061 / D-042 | 登记行 | domain-modeling |
| T9 | 值守面复核：registry 51 项——engine-ci-main-green（待 T2 绿方可翻）／readme-ci-badge／readme-motion-gif／github-rest-review-coverage-dimension／xfail-second-track(bound=#65)／promotion-watch／duckdb 三复审／D-076 四触发器／暂缓面集 | D-041 / D-076 / D-081 / D-089 | registry confirmations/状态翻转 | — |
| T10 | **post-merge 剩余链尾**：social-card.png 所有者 web-UI 手动上传（D-091 授权内最后一步）→BACKLOG #73 闭环登记 | D-091 | 上传回执+闭环注记 | — |
| T11 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- **implement / tdd**：T1~T5 主驱动——门面波及面与守卫建制批
- **diagnosing-bugs**：T2 Node-20/非 Windows 双腿失败定位（需多平台复现面）
- **readme 系 skill**（C:\Users\Administrator\.agents\skills\git\readme\）：T1 README 双件改写
- **domain-modeling**：T5 契约块措辞＋T8 权重立案（若触发）
- **atomcode-research**：新决策题调研入口（沿用 R25 五轮规程：题面存档→-p 深调研→辩证呈报→冲突即停）
- **gitbutler**：VC 唯一写面——本轮收口文档已 commit 防丢；后续 push/merge 逐次闸门
- **handoff**：下轮收口同规程再生

## 用户闸门（勿越）

- push/merge：上轮已授权执行毕；本轮起新变更仍逐次授权，栈上未 push 分支按 but status 实态管理。
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）。
- B 轨官方目录未授权；registry event_bound 项不预翻（engine-ci-main-green 待 T2 实证绿）。
- 契约块（T5）变更走 PR 审查，禁绕过直接改单侧机芯（D-096④）。
- XFAIL 册只收合法漂移类——欺诈断言与枚举漂移均禁入册（D-094①/D-095③）。
