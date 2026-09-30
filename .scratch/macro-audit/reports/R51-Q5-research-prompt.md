# R51-Q5 调研题面 —— 指针守卫件设计（扫描面枚举＋存量判级机制＋孪生检测实现）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。承 D-188（法定指针形=SHA≥12hex+(\"subject\")＋存在∧锚线可达；裁剪版机检=格式+存在性+同 change-id 多 SHA 孪生告警）＋D-189（严格层=封闭位形枚举〔列头白名单+锚定正则+括注位模式〕＋宽层裸短码禁独承定位）＋D-190（锚线声明制）＋D-191（存量两残留顺手勘误＋**守卫首跑承接全存量普查，存量违规 WARN／新增 FAIL 两级判级**）。

悬而未裁=**守卫件设计三件套**：
- **扫描面枚举**：检哪些文件——本仓文书生态=`.scratch/macro-audit/`（decision-ledger.md、handoffs/、reports/、预声明包）＋`docs/adr/`＋`CONTEXT.md`＋`WORKFLOW.md`＋`AGENTS.md`＋`.scratch/architecture-recovery/`（账本/报告/WORKFLOW）。须封闭枚举（D-095 语义）；
- **存量判级实现机制**（核心裁决点）：「立法生效前落盘」如何判——(a) 时点推断（git blame/log 追违规行落盘时点 vs 立法 commit——GitButler amend 流下 blame 锚漂移风险实证：W8 本身即 amend 孪生病灶）；(b) baseline 文件制（首跑生成/锁定 known-violations 清单逐条枚举 file+line+内容指纹，命中=WARN、不在册=FAIL）；(c) 增量检（只检立法 commit 后新增/变更行——pre-commit/diff 模式）；(d) 单级 WARN-only 初版观察一轮再升 FAIL；
- **孪生检测实现**：对严格层每个 SHA 指针——cat-file -e 存在性＋解析 commit 头 change-id（GitButler `change-id` 头/trailer）＋全对象库查同 change-id 多 SHA→WARN（告警非阻断，D-190④ 已定 WARN 位）。

约束面：D-149 守卫入列规程（预声明+实测绿+登记）；D-177 预声明验证包（check 源码属源改，须预声明先行）；D-148③ 不溯既往（判级面承接）；D-184 退役闸先例（迁入探测件先例=判级机制有仓内参照）；守卫执行面=node .scratch/architecture-recovery/reports/NN-check.mjs 形态 + guard-all-run.mjs 动态枚举；纯只读 git 访问（D-074）。

## 候选

(i) **baseline 文件制**：守卫首跑生成 `known-pointer-violations.json`（file+行号+内容指纹逐条枚举），命中=WARN，不在册新违规=FAIL；扩清单=逐条勘误后从清单移除（ratchet 递减语义）。先例假设=PHPStan/Psalm baseline、ESLint suppressions、betterer ratchet。
(ii) **时点判定制**：违规行 git blame 落盘时点 vs 立法 commit 时点判级。利=无额外文件；弊=amend/rebase 流下 blame 锚不稳（本仓 GitButler 密集 amend 实证 W8）＋多行表行追加的 blame 粒度复杂。
(iii) **增量检 diff-based**：只检立法 commit 后变更面。利=精准贴「新行为生效」；弊=存量违规永不现形（普查职责落空＝D-191③ 缺口）＋diff 面界定复杂。
(iv) **WARN-only 初版**：全部违规先 WARN 观察一轮再升 FAIL。利=保守不破既有绿；弊=新违规也只 WARN=守卫无牙齿，新规生效日即形同虚设。
(v) **扫描面全仓 md** vs (vi) **扫描面封闭枚举文书类**（.scratch 两 slugs＋docs/adr＋三根条文）vs (vii) **窄面**（ledger+handoffs+预声明）。

## 调研要求

1. 工业界成熟心智模型（重点）：linter baseline 文件制的落地先例与反模式——PHPStan baseline、Psalm baseline、ESLint disable/suppression 机制、detekt baseline、betterer ratchet 语义；「存量豁免清单」的治理风险（baseline 膨胀成垃圾桶的先例与对策）；diff-only lint（lint-staged/new-code-only 模式——golangci-lint new-from-rev、detekt new-issues）的适用边界；WARN vs FAIL 分级在执行语义上的先例（soft-fail→hard-fail 过渡惯例）；内容指纹 vs 行号定位的基线稳定性（行漂移对 baseline 命中的影响——指纹 vs 行号哪个抗漂移）；IDE/CI 中「suppress until fix」带到期日的豁免机制先例。
2. 判候选：①baseline 文件制的反面风险（清单变大赦名单——如何防：条目须逐条有勘误引用？）；②时点判定制在 GitButler amend 流下的失效率（blame 重锚后误判方向=存量误判 FAIL 还是新增误判 WARN——哪个方向危险）；③diff-only 与普查职责的互斥是否致命；④WARN-only 初版的「无牙齿」论证是否成立；⑤孪生检测的 WARN/FAIL 判级是否与违规判级同轨（D-190④ 已定 WARN 位——孪生发现本身不是违规只是风险披露，确认此判读）。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-188~D-191 四裁、D-149/D-160 守卫建制、D-177 预声明、D-148③、D-095 枚举封闭、D-184 退役闸先例、D-165/D-170、D-074）。
4. 推荐+理由+置信度；缺口如实标位。
