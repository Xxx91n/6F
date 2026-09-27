# R39-Q3 调研题面（atomcode）

承接 R39-Q1（射程裁=(b') 已落账 D-153）与 R39-Q2（批2-beta 行为语义三项裁定已落账 D-154：unstrippedScanHit 改剥后消费位＋ADR-0024 单收两变更／multi-hit dry-run→批注册→enforcing 带预声明转窗／SCAN_EXEMPT 摘死项＋S1 改写可达性自检作正对照）。本问=登记类与处置面打包裁（批2-beta ④⑤+交接书带入小面）。

## 仓景速览（勿重复验证）

D:\Aworker\6F = spec-level 工程审计产品（Agent Plugin 分发，preview 态）。裁定治理栈：decision-ledger.md（D 面 154 条）＋registry（manual_watch/event_bound 五要素制）＋D-113 known-gaps 台账五要素（owner/review_by/证据链/trigger_id/status）＋D-146 摄入分诊四档＋Watch Tri-state 词条。CodeBuddy 试用已关窗（CLI 形态三判据全 hit；IDE 形态未覆盖如实声明；findings×4 全不进裁定链）。

## 本问三面

**面A〔技术债台账六件五要素默认值〕**：三件技术债（①75a-check 每跑写 findings 工件=守卫写工作树设计内面；②41a-check 手写 indexOf 解析器；③guard-all-run FAIL-slug 正则与 check 文件名耦合）＋并入三件（④N5=37-check inline spawnSync 残余；⑤N6=check-kit gitOut 不检 spawnSync status 的 false-green 向；⑥T1-N1=试用 debrief「字段级 parity 全等」表述精化——实态 69/70 键等、唯一差=evidence[].reproduce_cmd per-run 路径自引）。六件全落 D-113 五要素。我默认指派：owner=仓内值守；review_by=批2-beta 落地后下一审计窗（T1-N1 单挂「对外转述/发布材料前」复评锚）；trigger_id=manual_watch 全员（活动做完类非事件等待类）；status=open-registered。

**面B〔IDE 形态缺口接力〕**：CodeBuddy 试用实证面=CLI（@tencent-ai/codebuddy-code 2.151.0），IDE 形态未覆盖。候选：(i) 挂 manual_watch 五要素（trigger=CodeBuddy IDE 可得/用户启用 IDE 面时复核 C1-C3 同判据，沿 D-152⑤ 未实测残项接力先例）；(ii) 不挂，留待「第二宿主全形态验证」专项。

**面C〔F-02 宿主展示盲区对外动作〕**：codebuddy mcp list 不列插件注入 server（会话内实 connected——宿主侧展示盲区非本仓缺陷）。候选：(i) 不主动上报留观察；(ii) 上报 CodeBuddy 官方渠道（对外动作须用户授权）；(iii) 挂 manual_watch 待宿主版本升级复核。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点：D-113 known-gaps 五要素与 Copla 腐化负向、D-146 四档分诊、D-152⑤ 关窗后不注册事件＋manual_watch 接力先例、D-135 禁卫生组升格、D-059⑨ 触发器语义、registry 既有 manual_watch 条目五要素填法先例〔如 golden-verifier-dirty-on-rerun〕、以及一切涉及观察项/技术债台账/宿主适配的条款）；
2. 回顾 docs/adr/ 与 CONTEXT.md（Watch Tri-state、Trigger-gated Closure、Accepted Risk、宿主试用词条）；
3. 工业界成熟落地心智模型（重点）：①known-issues/tech-debt registry 的字段惯例与 review 节奏（owner 指派、review_by 锚点选型=固定日期 vs 里程碑事件 vs 下一审计窗；「债务无 review 锚=graveyard」判据）；②试点/试用中「未覆盖形态」（IDE vs CLI）的诚实披露与后续复核登记惯例；③向第三方宿主/上游报送缺陷的惯例——何时值得报（本仓缺陷 vs 宿主侧盲区）、不报的正当性边界（非本仓面+有观察项登记是否足够）；④manual_watch/watch-list 条目的 trigger 设计惯例（「宿主版本升级时复核」类模糊 trigger 是否合格——vs 可判定条件写法）；⑤duplicate/registration 台账六件合并 vs 分列的颗粒度惯例；
4. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（冲突则该 D-xxx 标 revised 呈报新决策，禁静默改向）。特别核查：①六件五要素默认指派中 review_by 锚点选型与本仓既有 manual_watch 条目惯例的一致性；②面C (i)「不主动上报」与 D-146 四档「不进本仓裁定链=宿主侧行为」初分结论是否自洽，还是需要任何额外留痕义务；③面B 挂 manual_watch 的 trigger 写法（「IDE 可得/用户启用时复核」）是否满足可判定性。
