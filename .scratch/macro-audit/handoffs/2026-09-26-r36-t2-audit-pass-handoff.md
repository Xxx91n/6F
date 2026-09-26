# Handoff —— 轮36 T2 审计窗收口（2026-09-26）

## 本轮结论

- **R36 T2 审计通过（LOOP 复审 PASS）**：首轮审计不通过打回（A 类 5 项）→返工批 A-096 全修→复审 12/12 验收亲跑全绿、A/B 逐项核销、无新增缺陷。
- 栈 r36-t1-ascast-rework：lxt/ssw/zww（A-095 初批）＋kno(`1fc00ae`)/pnl(`cc4bc57`)/wvo(`29e461b`)（A-096 返工批）——语义/bundle/docs 三分层两轮均守，无 push。
- 审计报告两件：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-26-r36-t2-audit-report.md`（首轮打回）＋`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-26-r36-t2-rework-audit-report.md`（复审 PASS）。评审 diff 存档 `audits\r36\audit-r36-t2.diff`。
- 账实：A-096 账行＋M-018 编年同 commit（D-144 合规）；exec-report 三处自述漂移已由返工批主动纠偏。

## 呈报项留档（审计窗不修，已转判断项）

- **R1**：`lineageEdgeCapHit` 仅经非空 lineage 块披露——subject 无边＋祖先边池触帽时卡面仍 `lineage:null`（帽事件该卡不可见）。病态角，非硬错。
- **R2（B6 延续）**：peer 去重仅一跳；renamed_to 多 to-竞争边取首匹配。票面带病边界，返工批注明不修。

## 仓库状态

- but status 干净；git status MM/D 重影=GitButler 合成索引噪声（两轮均已坐实，判定以 but status＋物理存在为准）。
- 验收基线（复审实测）：tsc 0／build BUNDLE-OK／pack 85 件 255.2kB／selftest 5/5／check-dist 263151B／MCP 探针 3 工具+F5 never_collected／smoke FILE-CARD 36/36／守卫 19 件全 rc=0／gen+golden 幂等零 drift／dist 重建逐字节一致／bench small/small/medium 全 target。
- Micro-B 能力面现状：capability 4 of 5 preview（试点集=同主双仓 jiahao+env-manager，披露四件套 4/4 齐——preview 标注/advisory/同主偏差/not_in_preview）。

## 下一轮建议入口（任务书序）

- **T3 = #75 批1 失效三分类建制**（D-144②③ 增长面腿并入）：字面钉普查 pass＋剥注释名检通用化＋presence/liveness/readiness 三层命名＋XFAIL 册明文只收合法漂移类＋断言无牙族纪律＋41a-D7 类高频增长面钉→结构不变量改写（解析 `## [M-xxx]` 键集，断言账本 dMax ∈ 编年键覆盖集）＋P5 B2 三点位同名断言普查顺带。
- 后续序：T4（#75 批2 枚举 open-closed）→T5（census-contract）→…→T13（atomcode resume a324fdd2-738e-4a71-b220-065c362e2d71 可选）。任务书原文 `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`。
- grill 方向指示：T3 触及守卫钉改写面——审计窗对「结构不变量钉」的关注点=断言语义是否真随账行增长面自动收紧（防退化成装饰钉）；另盯「剥注释名检」通用化是否引入跨文件误伤。

## 坑位提醒

- `file-card.ts` dedup 分隔符现为 `'\u0000'` 转义——**写文件经 node/ctx 时 `'\0'` 字面量会物化为真 NUL**（A1 根因=codegen 转义被吞）。NUL 嗅探（`grep -rlP '\x00' engine/src engine/dist`）已进验收清单常项。
- 环检语义=互达（前向可达），visited 命中≠环——改血缘代码前先读 `file-card.ts:207-260` 双邻接表注释。
- bench 分档票面=观测集事实行数（<5k/5k~50k/>50k），非卡内行数；工件 set_facts 字段是口径锚。
- zh-CN 镜像戳绑 EN 指纹≠语义同步——正文过期需逐行核（73-check C2 盲区踩中过一轮）。
- ctx_batch_execute 多层引号嵌套易塌陷——探针输出走 `node -e` 读文件而非内嵌模板字面量（本轮亲历两次塌陷）。
- DB 探查纪律：audits/ 下证据库一律副本探查（cp 到 Temp 再 --db），原件 sha256 前后校验。

## Suggested skills（下一轮 Agent）

- 实施窗：`$implement`（T3 任务书行）＋`$tdd`（守卫钉改写面）；审计窗：`$code-review` 双轴＋本窗同款亲跑验收面。
- 账本/票面读法：D 系列=.scratch/macro-audit/decision-ledger.md；A 系列=.scratch/architecture-recovery/decision-ledger.md；编年=CHANGELOG.md M-xxx 节。
