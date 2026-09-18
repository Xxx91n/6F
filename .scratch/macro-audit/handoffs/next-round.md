# next-round — 轮 21 常驻任务书（轮 21 grill 收口＋R20 审计 T1/#59 通过后）

> 更新于 2026-09-18 轮 21 grill 收口（D-071/D-072 两决策落账）＋R20 审计 T1/#59 通过（A-069）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 72 条：66 current／3 revised／3 承继链吸收）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列——A-069=R20 T1 票档）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 轮 20~21 留痕（已定，勿重复）

- **T1 #59 ✅**（A-069 / r20-59-kernel-selfcontained lvr→prs→ytx）：`.mcp.json`=node+`${CLAUDE_PLUGIN_ROOT}`＋dist 40 件入库（esbuild 单文件 bundle+tsc 树双形态）＋CI rebuild-diff＋README/SKILL 同票＋真机 `claude --plugin-dir` mcp Connected 实证；审计通过（R1~R8 打回小修全闭环）。
- **轮 21 grill 两决策**（全 current 零 revised）：D-071 陈旧守卫换代=known-failures 清单制（首批 9 条 XFAIL 入单）／D-072 duckdb 自愈=精确拉单平台包＋披露地板。
- **registry 状态**：44 项/28 事件——新增 `xfail-second-track-trigger`（manual_watch）＋`duckdb-vendored-review`/`duckdb-wasm-review`/`claude-hooks-bootstrap-review`（event_bound）；`first-external-install` 已 occurred＋`runtime-doctor-trigger`→#62 待执行。
- **栈面**：round19-closeout(xql)→r20-59-kernel-selfcontained(lvr→prs→ytx) 未 push（用户闸门）；`.code-tmp/{r18,r20}-audit/` 未跟踪 scratch。
- **待验证缺口**（随票验收）：30 守卫断言级 id 现状盘点（#63 前置）／平台包精确尺寸逐变体实测（#64 落地时）／CI 无凭据 validate（#58 顺带验证）。

## 口径基线（读前必知）

- **陈旧守卫换代**（D-071）：清单=输出态分级层非豁免文件——断言照跑、快照照冻；strict=XPASS 一律红逼摘条目；真回归禁入清单（broken≠flaky）；复审锚=事件制 stage3-close＋日期兜底；第二轨快照化挂触发器不立大票；「FAIL 不扩大」人工比对由机制替代（账本勘误注记在案）。
- **duckdb 自愈**（D-072）：命中点前置精确拉 `@duckdb/node-bindings-<platform>` 单包（--no-save/版本三方同值/每进程至多 1 次）；失败回落三段文案披露；npm publish 渠道≠插件目录依赖拉取——辨析写票面；bundle 验收硬条件=分发器 JS 可达或显式 external。
- **守卫分层**（D-066）：shape 钉 enforce＋真校验器 advisory/event_bound＋SKIP 计入 WARN＋2 窗口转 enforce；#58 落地注意与 lvr/ytx 同文件（34/41b-check）落序——新契约断言 G9/G12~G14/A4 已在其上。
- **cue 表纪律**（D-069）：词表=判据；CJK 独立设计≥2 字词形；「假设」配伪表；种子表一次先验声明；顺带清=独立 `[cleanup]` commit 判定 commit 零夹带（D-070）。
- **kernel 边界**（D-058）：NLI/概率模型永不进 kernel；自愈逻辑全在 kernel CLI 内不越界。
- **评测纪律**（D-061/D-065）：禁参照 52a 语料标签调参；golden 基线依赖 git 史。
- **分发面**：插件名 6f/市场名 xxx91n/Apache-2.0/A+C 双轨；push=用户闸门；审计件分支=冻结只读。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十一轮节＋R21-Q1/Q2 调研报告＋r20-audit-pass-handoff；跑 33/42/44/46/52a/53/54/55-check 确认基线（含 5 守卫 9 条陈旧 FAIL 现状登记——#63 首批清单素材） | D-071 / D-072 | 基线快照 | — |
| T1 | **#58 manifest 契约守卫链扩（P1）**：34/41b-check 三断言＋validate advisory 双触发＋SKIP 硬化＋schema 快照＋claude-cli/schemastore 入锁——注意与 lvr/ytx 同文件落序（新契约断言已在其上） | D-066 / D-037⑤ / D-041 | 守卫断言＋advisory 面＋schema 快照＋锁表 | implement / tdd |
| T2 | **#63 陈旧守卫换代机制（P1）**：stale-assertions.json＋首批 9 条＋断言级 id＋三态输出＋33-check 元校验四断言——前置=30 守卫只读盘点 | D-071 | 清单文件＋协议改动＋元校验 | implement / tdd / domain-modeling |
| T3 | **#64 duckdb 自愈补拉（P1）**：store.ts 自愈路径＋三段文案＋bundle external 验收＋CI E2E smoke＋离线断言＋README 升口径＋npm 辨析票面 | D-072 / D-067② | 自愈逻辑＋守卫＋文档 | implement / tdd |
| T4 | **#61 cue 表分层＋顺带清（P1）**：判定 commit（CJK_NON_ASSERT＋伪表＋词表治理＋56-check hash WARN）＋`[cleanup]` 独立 commit（r18 残余①-⑤）＋held-out 复跑 | D-069 / D-070① / D-065 | citation.ts 两 commit＋56-check 扩 | implement / tdd / domain-modeling |
| T5 | **#60 骨架升版机检（P1）**：14-skeleton-baseline.json＋14-check 三 FAIL＋三方一致＋语义翻转边界行 | D-068 / A-064 C9 | baseline 文件＋守卫断言 | implement / tdd |
| T6 | **#62 doctor 探测票（P2）**：duckdb 可开库/git/上游连通三腿 probe＋结构化输出（消费 #64 自愈 stdout 格式——序在 #64 后） | D-059③ / D-072⑧ | doctor 子命令＋探测报告 | implement / tdd |
| T7 | **#52b 待命**：锚=host-narrative-corpus | D-061 / D-064④ | 触发即启 | — |
| T8 | **#41b 残余面**：listing 资产核对留痕；B 轨不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T9 | 值守面复核：registry 44 项——xfail-second-track-trigger／duckdb 三复审触发器／claude-validate-promotion-watch／cue-table-extraction-trigger／runtime-doctor-trigger→#62／mw-trigger-c／narrative-eval-surface／bundle-retirement-trigger／duckdb-binary-watch／golden-verifier-dirty-on-rerun／hooks-presentation-face／repomix-reopen-trigger／upstream-probes／暂缓面集＋陈旧守卫 9 条归因清单核对（#63 首批素材已用） | D-041 / D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-061~D-072 | registry confirmations/状态翻转 | — |
| T10 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（不 push 除非用户明示；r20 栈与 round19/21-closeout 并行不互碰）；
- `implement`＋`tdd`：T1~T6 代码票——预声明判据先行；
- `domain-modeling`：T2 清单 schema/断言 id 命名域建模＋T4 cue 表语义边界；
- `atomcode-research`：票内新方案面（断言 id 协议、自愈 fetch 细节）按 D-2 深调研；
- `handoff`：次轮收尾同规程再生。

## 用户闸门残留

- push 授权：round19-closeout/r20-59-kernel-selfcontained 栈＋本收口 commit 全停闸门；
- D-067⑧ push 后真机 `/plugin install`→`/mcp` 重验＋CI rebuild-diff/npm ci 首跑实证随 push 闸门；
- B 轨官方目录：未授权不触碰（D-042）。

