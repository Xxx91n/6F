# next-round — 轮 22 常驻任务书（轮 22 grill 收口＋R21 审计 PASS-with-findings 整理后）

> 更新于 2026-09-18 轮 22 grill 收口（D-073~D-078 六决策落账，D-072 revised 由 D-075 承载）。任何子 Agent 读本文件即可接续：先读口径基线→按 T 序执行→每项声明覆盖的 D-xxx 不得超出账本原文范围。
> 唯一事实源 = .scratch/macro-audit/decision-ledger.md（D 系列 78 条：72 current／6 revised）；执行账 = .scratch/architecture-recovery/decision-ledger.md（A 系列——A-070~A-075=R21 六票档）；验收守卫 = .scratch/architecture-recovery/reports/NN-check.mjs（exit 0 才算过）。

## 轮 21~22 留痕（已定，勿重复）

- **轮 21 六票全闭环 ✅**（A-070~A-075，分支栈 r21-58→63→64→61→60→62 全未 push）：#58 manifest 契约／#63 stale-assertions 清单制（10/10 cap 已满）／#64 duckdb 自愈实装／#61 cue 表／#60 骨架升版机检／#62 doctor 三腿。
- **R21 独立审计=PASS-with-findings**：硬验收全绿（33:20/20｜34:22/22｜41b:33/33｜56:24/24｜64:14/14｜14-skeleton｜xfail-run XFAIL:10/10），9 项返工要求——F 项已分流至 #66（duckdb 四缺陷）／#67（SKIP-STREAK）／T5 文档面。
- **轮 22 grill 六决策**（5 current＋1 revised 链）：D-073 册外 13 件分拣（sealed 第三态＋attestation 双锚）／D-074 env 腿双轴（fixture 承接）／D-075 自愈按面分层（CLI 自动／MCP+CI 披露+opt-in）／D-076 四奇观维持＋触发器挂账／D-077 SKIP-STREAK 环境分层＋人工晋升门／D-078 upstream→dimension 映射表设计先行。
- **registry 47 项/31 事件**：`xfail-second-track-trigger→triggered-bound bound_to=#65`（cap fired 条款内认定）；`claude-validate-promotion-watch→manual_watch`（receipts 证据人工翻转）；+3 事件（git-iso-contract-violated／sql-strip-escape-observed／dist-in-repo-superseded）+3 值守项。
- **栈面**：round19/21-closeout＋r21 六分支栈全未 push（用户闸门）；`.code-tmp/{r18,r20,r21}-audit/`＋`锐评.md`＋`claude-validate-state.json` 未跟踪 scratch。

## 口径基线（读前必知）

- **sealed vs archived 分界**（D-073）：sealed=验收探针使命完成的显式退役（attestation 固化留档＋移出执行集＋SEALED 顶显）；archived=失效但假装在管；D-071③「断言照跑」只适用活契约条目（账本划界注记在案）。封存必带承接义务——活契约腿 migrated_to 必填闭包或 rewrite-pending 兜底，防 XPASS 信号洞。
- **测工具不测环境**（D-074）：env 敏感断言双轴——验收使命已 fired→sealed（attestation 记历史性真相）；工具不变量该守→fixture 测试（mkdtemp 受控环境内因果可归因）；I3 类决策漂移件标 superseded-by-D-046。
- **自愈分层合法性判据=「谁在看屏幕」**（D-075）：CLI 交互面（非 MCP 且 isTTY）自动自愈保留＋stderr 预告可中断；MCP stdio/CI 非 TTY 面永不自动拉包→四段披露（缺失原因→doctor --fix→能力边界→MACRO_AUDIT_SELFHEAL=1 opt-in）；doctor --fix=唯一主路；D-072 revised 仅动触发面与时序，排除法理由与三复审触发器不动。
- **立场批评受理边界三要素**（D-075④/D-076）：立场＋实证＋工业先例交叉齐备才 revised——缺一维持并转写为可证伪 event_bound 复审触发器（防安慰剂：判定口径二值禁程度副词）。
- **预期缺席≠异常缺席**（D-077）：CI=cli-absent-expected 面 SKIP→INFO 第三披露态（neutral 非 WARN 非 streak）；本地面 SKIP-STREAK 收窄为「本地异常缺席」；promotion=人工读 receipts.jsonl 证据翻转（2 版本窗判据原文不动）；state.json=运行计数器不入仓 vs stale-assertions=声明式期望表入仓——受控状态文件边界划清。
- **dimension:null=防腐层故意留白**（D-078）：映射=业务语义只能落裁决面/文档面（docs/upstream-dimension-map.md 版本化 PR 评审）；适配器不加 dimension_hints；ADR-0004 五维不动=facet enrichment 非扩维；映射行必带逐 dimension 准入条件列（LFX 式 bot 按维出入）；rate_limit=遥测永久排除。
- **既有口径沿用**：守卫分层（D-066）／cue 表纪律（D-069）／kernel 边界（D-058）／评测纪律（D-061/D-065）／npm publish≠依赖拉取辨析／分发面（6f/xxx91n/Apache-2.0/A+C 双轨/push=用户闸门）。

## 任务序列

| T | 任务 | 覆盖 D-xxx | 交付面 | Suggested skills |
|---|---|---|---|---|
| T0 | 开工前置：读本任务书＋账本第二十二轮节＋R22-Q1~Q6 六份调研报告＋R21 审计 handoff；跑守卫基线（33/34/41b/44/46/52a/53/54/55/56/64/14-skeleton/xfail-run）确认全绿＋册外 13 件现状登记（#65 分拣素材） | D-073~D-078 | 基线快照 | — |
| T1 | **#65 册外陈旧断言批量分拣（P1）**：13 件归因三向分拣＋acceptance-probe-attestation.jsonl＋sealed 第三态输出＋33-check G5 闭包＋audit-zero-write.test.mjs fixture（mkdtemp 玩具仓＋自检防 vacuous＋smoke 链）＋migrated_to 闭包＋D-071③ 注记执行＋attestation↔账本双向指针 | D-073 / D-074 / D-071③注 | attestation jsonl＋分拣标记＋fixture 测试＋G5 断言 | implement / tdd / domain-modeling |
| T2 | **#66 duckdb 自愈分层修订（P1）**：面探测（MCP/isTTY/CI）＋CLI 面 stderr 预告＋MCP/CI 面四段披露＋doctor --fix 主路＋MACRO_AUDIT_SELFHEAL=1 opt-in＋F4 win32-arm64/F7 registry 探测/F8 emitSelfHeal 后移 三缺陷＋Default Mode 披露收窄＋README | D-075 / D-072(revised) / D-067⑧ | 分层自愈＋doctor --fix＋披露文案 | implement / tdd |
| T3 | **#67 SKIP-STREAK 环境分层（P2）**：MACRO_AUDIT_CI 旗标＋INFO 第三披露态＋state.json mode 降格＋claude-validate-receipts.jsonl append-only＋41b 同型 SKIP 一并分层（追问默认=统一）＋mode 元断言裁量 | D-077 / D-066③⑥注 | 分层断言＋receipts 载体 | implement / tdd |
| T4 | **#68 upstream-dimension-map 设计票（P2）**：docs/upstream-dimension-map.md 按 D-078③ 骨架成文＋准入条件列逐维写明＋NN-check「上游文件无 S1-S5 字样」断言＋descriptor 注释指针＋绑复审时点；接线票待本表合入后另立 | D-078 / D-020 / D-048 / D-035 | 映射表文档＋守卫断言 | domain-modeling / writing-for-agents |
| T5 | **R21 审计返工文档面**：报告口径勘误（npm pack 73 件非 71／册外 13 件非 11／npm test 措辞收窄如实）＋#60 FAIL2 边界注记＋judgement 项登记 | R21 审计 §六 | 文档勘误批 | — |
| T6 | **#52b 待命**：锚=host-narrative-corpus | D-061 / D-064④ | 触发即启 | — |
| T7 | **#41b 残余面**：listing 资产核对留痕；B 轨不授权 | D-051 / D-052 / D-042 | 资产核对留痕 | — |
| T8 | 值守面复核：registry 47 项——xfail-second-track-trigger(bound=#65)／claude-validate-promotion-watch(manual)／duckdb 三复审／D-076 四触发器（git-iso/sql-strip/dist-in-repo/cue-table 复用）／mw-trigger-c／narrative-eval-surface／bundle-retirement／duckdb-binary-watch／golden-verifier-dirty-on-rerun／upstream-probes／暂缓面集 | D-041 / D-043 / D-045 / D-055 / D-056 / D-059③⑨ / D-076 / D-077 | registry confirmations/状态翻转 | — |
| T9 | D-025 勘误双读数纪律：实测/账本双口径并存呈报 | D-025 | 报告口径 | — |

## Suggested skills（本窗口）

- `gitbutler`：一切版本控制写操作（不 push 除非用户明示；r21 栈与 closeout 分支并行不互碰）；
- `implement`＋`tdd`：T1~T3 代码票——预声明判据先行，sealed/fixture/分层三机制各配负路测试；
- `domain-modeling`：T1 sealed/attestation 语义域建模＋T4 映射表维度归属域建模；
- `atomcode-research`：票内新方案面（attestation schema 细节、INFO 态命名）按 D-2 深调研；
- `writing-for-agents`：T4 映射表文档面（裁决消费的版本化文档）；
- `handoff`：次轮收尾同规程再生。

## 用户闸门残留

- push 授权：round19/21-closeout＋r21 六分支栈＋本收口 commit 全停闸门；
- D-067⑧ push 后真机 `/plugin install`→`/mcp` 重验＋CI rebuild-diff/npm ci 首跑实证随闸门；
- B 轨官方目录：未授权不触碰（D-042）；
- 追问挂票面（随票裁）：#67 mode 元断言是否进 34-check／版本窗机检锚=CHANGELOG M 条目／#68 落点 vs quadrant-rubric 并面／Bot 占比 S5 vs S4 备选。
