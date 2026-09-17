# 轮17 交接——轮16 审计通过（附条件）后接续

> 生成：审计窗口（轮16 实施审计）。审计报告=D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-17-r16-audit-report.md（声明→证据→结论全表＋F1-F15 发现＋过程呈报）。
> 唯一事实源=.scratch/macro-audit/decision-ledger.md（D 系列）；执行账=.scratch/architecture-recovery/decision-ledger.md（A 系列）；验收=NN-check exit 0。
> 分支面：r16-impl-t1-t3-t2 栈于 round15-closeout 未 push（T6 用户闸门）；审计自产工件在 .scratch/macro-audit/audit-r17/（未跟踪，可弃）。

## 审计裁定

硬验收全绿（编译/打包/版本/selftest/真实仓测活 RCP-e0ab92dca215a66d/九守卫/npm test 全链）。审计通过，附处置项：

- **F1 必修（或呈报裁定）**：audit.ts:24 SCALE_LAYER_ORDER 误引 ADR-0017③——ADR 原序=Macro-C→Micro-A→Micro-B→Macro-A，实现串=Micro-A→Micro-B→Macro-B→Macro-C→Macro-A。修法=串改回 ADR 原序（Macro-B 已上架不出现在剩余漏斗，或以 implemented 字段另行表达）＋53-check 加层序原文断言。重跑：53-check+audit.test+npm test+33-check。
- **F2 待裁定**：audit 回执字段集 vs D-060③「与 demo receipt 同源禁另造」——收窄 or 票面/账本勘误授权，二选一需裁定，勿默认追认。
- **F3-F6 并入裁定**：单一管线函数字面未达（两端装配样板重复）／human-human κ→intra-rater 已披露偏离／held-out 分区缺席／矛盾·中立分层缺口——建议随 #56 设计票一并裁定或在账本登记勘误行。
- **advisory**：F8 新守卫补 noBom 扫；F9 --scale 吞旗标；F10 pc1AdrFacts[0] 空值守卫；F11 evidence_threshold_met 语义裁定；F12 ADR-0009④ 枚举勘误行；F13 demo.ts 死码 git()+alias 块清理；F15 mcp facts 复用 resolveFactsDb。

## 下一个 grill 方向指示

1. **F1/F2 优先**：误引与「同源禁另造」违约是票面级纪律题，先裁定再动码——建议并入 #56 设计裁定窗或单列小票；若用户裁定票面措辞为准，则属票面超前于裁定的返工项。
2. **T1 #56 checker 语义边界修复票**（原任务书）：设计先立（否定语境剥离启发式／语义等价锚表／presence-only 宣称收窄），禁参照 52a 语料标签调参；F4-F6 语境随票吸收。
3. T2 #52b 触发器票待命（锚=真实宿主叙事语料）；T3 #48/#49 残余腿；T6/T7 用户闸门不动。

## Suggested skills

- `gitbutler`：VCS 写操作（不 push）；`domain-modeling`/`implement`：F1-F3 裁定与修复；`tdd`：修复面先锁断言；`atomcode-research`：#56 方案调研（concurrency=1）。
- 写文件一律 node.js＋读回断言＋BOM 检查；输出路径一律完整绝对路径。
