# next-round — 轮 27 常驻任务书（轮 27 grill 收口＋门面致谢/quarantine 分层/窗口边界定稿后）

> 生成：2026-09-22 轮 27 收口。上位账本=`D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md`（102 主记录：95 current／7 revised=D-002/008/012/014/022/059①款/072）；本任务书不复述账本全文，只排执行序与覆盖映射。

## 轮 25~27 留痕（已定，勿重复）

- 轮 25 grill 五裁（D-092~D-096）：6F 正名+六-F 宣言／波及面分层／断言失效三分类／枚举 open-closed／census-contract——调研报告存档 `.scratch\macro-audit\reports\R25-Q{1..5}-*.md`。
- 轮 26 实施（A-088）：#74 门面 6F 化＋#76 engine-ci 红修三症四修全落，合入 main d207a0a，CI 分支 35677822036 六腿绿＋main 35681529820 绿——**engine-ci-main-green 事件已发生**，readme-ci-badge 挂徽解锁（trigger-fired 在案，挂载落 #77 后方翻 status）。
- 轮 27 grill 五裁（D-098~D-102，四轮 atomcode 深调研）：致谢三层分工／品牌资产消费面驱动／契约违约两级处置（D-059① 收窄 revised 链）／A-B 双窗边界／xfail-45-h5 摘除追认。调研报告存档 `R27-Q{1,2,3,4,5}-*.md`（Q5=xfail 摘除裁）。
- **xfail-45-h5 实物已落地**（R26 T0 摘除在案 meta.xpass_removal_2026_09_22＋45-check H5 已移除）——D-102 系追认；其衍生（断言无牙族/反向 TDD mutation 检验）归 T3 批1 findings 处置面。

## 口径基线（读前必知）

- 门面现状：公开面全 `6F`（README 双件 H1/hero 六 chip/marketplace displayName/GitHub description+topics）；六-F 宣言=Highlights 区六句（Facts/Federation/Forensics/Five scales/Frankness/Fingerprints）；**致谢节缺失=本轮待补**（upstream-lock.yaml 11 行中 active 8 个未上门面 credit 面）。
- 双名分层（D-093）不变：品牌层 `6F`／kernel 技术标识 `macro-audit*` 保留。
- registry 53 项/36 事件；engine-ci-main-green→occurred:true；readme-ci-badge pending（trigger-fired 已记，badge 实挂后翻 status）；readme-motion-gif 仍待 listing-material-freeze；两新触发器 pending。
- macro-b-regression 调度跑实证红：git/git 腿 GITCLI-OUTPUT-CONTRACT 硬崩（%cI=「 INDIA」病态 commit）——**broken 类非门禁红**，处置=#78 限期立票（D-101②③）。
- 守卫基线全绿（收口复跑见收尾汇报）；70-check census=63-assertion-inventory.json 机生面，改守卫源码后须 update-70-inventory.mjs regen。
- 写文件用 Node.js（ctx_execute/脚本），禁 BOM；版本控制用 but，不 push 除非用户明示。

## 任务序列

| T | 任务 | 覆盖 D | 交付物 | suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十七轮节＋R27-Q1~Q5 调研报告；跑守卫基线（33/44/70/71/72/73/xfail-run 等）确认全绿 | D-098~D-102 | 基线快照 | — |
| T1 | **#77 门面收口包·A 窗（本轮主任务）**：①致谢节生成器（per-id 人工模板=感谢宾语+角色句逐条人定一次，禁从 kind 推导——github-rest=API 非项目）→README.md 尾「## Acknowledgments」生成式锚段（Honesty notes 前，8 active 行=名字+一句角色+上游主页链接，脚注指 upstream-lock.yaml 全集）；②closed 对账守卫=regen→diff empty（成员集⇔active 集双向差集，先比后写同型）；③zh-CN 派生镜像（D-088 纪律）；④CI badge 挂载（徽标指 main 分支 engine-ci workflow——D-089⑤ 事件已发生）；⑤GitHub homepageUrl 补齐（repo URL 或 listing 指定值） | D-098 / D-099③ / D-101① / D-089⑤ / D-037③ / D-088 | 生成器+锚段+守卫绿+zh 镜像 | implement / readme 系 skill（create-readme、readme-crafter） |
| T2 | **#78 引擎 quarantine 建制·B 并行独立窗**：①intake 违约两级化（协议级 fail-fast 保持/字段级病态进 quarantine=null+⚠malformed+审计继续）；②三桶分离计数；③可观测五件（逐 SHA+reason code/原始字节回显/覆盖率恒等式/比例阈值超限→unsupported/--strict-quarantine 反向开关）；④null=毒值纪律全消费面执行；⑤新 reason code 登 known-gaps；⑥验收=macro-b-regression git 腿转绿（%cI 病态 commit 走 quarantine 不崩全仓） | D-100 / D-101② / D-059①收窄链 | intake/macro-b/schema/报告渲染+golden+恒等式同窗 | implement / tdd / diagnosing-bugs |
| T3 | **#75 批1 失效三分类建制**（沿用）：字面钉普查 pass（日期字面量/魔数地板/裸 occurred===→归因注记；45-h5 松散「|| demo」分支=已登记的松钉 findings 样本处置）＋剥注释名检通用化＋presence/liveness/readiness 三层命名＋XFAIL 册明文只收合法漂移类＋断言无牙族纪律（|| 便利分支=无牙，mutation 检验标准） | D-094 / D-102③ / D-079 / D-071 | 普查 pass+册规补丁 | implement / tdd |
| T4 | **#75 批2 枚举 open-closed**（沿用）：枚举面 open/closed 声明＋closed 面成员级双向差集 lint（explain 9 面/遥测排除首案；D-098 致谢节成 closed 面第二案先例）＋常量 SSOT＋preflight 逐条裁＋reserved 机制仅外部输入面 | D-095 / D-081 / D-098② | open-closed 声明集+lint | implement |
| T5 | **#75 批3 census-contract**（沿用）：63 清单头契约块（字段 schema 归一+五豁免正反例对）＋70-check 互等裁决断言＋契约变更 PR 门控＋70/vacuity 共用规格 | D-096 / D-037 | 契约块+E2 断言 | implement / domain-modeling |
| T6 | **#79 NOTICE 承接合规核查**（随 #75 排产）：8 个 active 上游逐个核查 NOTICE 文件存在性（Apache-2.0 §4(d) 承接义务）→承接面选型（仓根 NOTICE/THIRD-PARTY-NOTICES）；核查未完不宣称闭环 | D-098⑦ / ADR-0021 | 逐上游核查表+承接文件（如需） | — |
| T7 | **judgement/观察项批**（沿用）：R22 §C 残留＋R24 新增三件（EN 中文钉串双语契约注记／73-check D 组票面外扩登记／en-slug 裸锚读者面成本） | R22 §C / R23-R24 留票面 | 逐项处置登记 | — |
| T8 | **真机 MCP 面分层验收＋M2 lane 残影裁定**（沿用） | R21/R22 Remaining | 验收报告＋裁定行 | — |
| T9 | **触发器待绑项**：rubric 权重立案（quadrant-rubric-params-draft 不提前开工）＋#52b 待命＋#41b 残余（B 轨不授权；B 轨提交若定义 icon 字段=official-catalog-icon-required 事件发生→D-099⑥ 派生） | D-084④ / D-061 / D-042 / D-099③ | 登记行 | domain-modeling |
| T10 | 值守面复核：registry 53 项——readme-ci-badge（T1 挂载后翻 status）／readme-motion-gif（仍待 freeze）／两新触发器（official-catalog-icon-required/docs-site-deployed）／github-rest-review-coverage-dimension／xfail-second-track(#65)／promotion-watch／duckdb 三复审／D-076 四触发器／暂缓面集 | D-041 / D-076 / D-081 / D-089 / D-099 | registry confirmations/翻转 | — |
| T11 | **post-merge 链尾**：social-card.png 所有者 web-UI 手动上传（D-091 授权内最后一步）→BACKLOG #73 闭环登记 | D-091 | 上传回执+闭环注记 | — |
| T12 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- **implement / tdd**：T1~T6 主驱动——门面收口包与 quarantine/守卫建制批
- **readme 系 skill**（C:\Users\Administrator\.agents\skills\git\readme\）：T1 致谢节文案与锚段形态（create-readme/readme-crafter）
- **diagnosing-bugs**：T2 quarantine 分层的边界场景回归（git/git 病态 commit 复现面）
- **domain-modeling**：T5 契约块措辞＋T9 权重立案（若触发）＋CONTEXT 新词同步
- **atomcode-research**：新决策题调研入口（沿用规程：题面存档→-p 深调研→辩证呈报→冲突即停标 revised）
- **gitbutler**：VC 唯一写面——本轮收口文档已 commit 防丢；后续 push/merge 逐次闸门
- **handoff**：下轮收口同规程再生

## 窗口边界纪律（D-101）

- A 窗（T1）与 B 窗（T2）并行不混：门面包=行为恒等文档面，quarantine=引擎行为变更——同 commit/同验证窗=mixed-PR 反模式。
- B 票带 owner+deadline；若本迭代排不上→git 腿登记显式豁免（xfail+tracking+deadline）转「显式豁免红」，禁烂着常态化。

## 用户闸门（勿越）

- push/merge：逐次授权；栈上未 push 分支按 but status 实态管理。
- social-card.png 上传=所有者 web-UI 手动操作（agent 不可代行）。
- B 轨官方目录提交不授权不触碰（D-042 收窄义在案）。
