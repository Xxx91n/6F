# R53-Q4 调研题面 —— 指针守卫 baseline 册 17 条存量违规收敛策略（专项批量窗 vs 随到随做 vs 分类排序批量窗 vs 不收敛）

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

本仓=五尺度工程内容审计产品的 spec-level 规划+治理仓。指针守卫件 84-check.mjs 已落地，首跑建册 `known-pointer-violations.json`（D-191③ 存量普查判级）：册内 17 条存量违规=WARN／册外新增=FAIL；条目指纹=file＋内容模式（禁行号定位）＋关联勘误行号（errata_ref 防大赦名单化）；册项失配=守卫自报移除提示（ratchet 只减不增——源文书实体更正后指纹不再命中）。存量处置=D-181 勘误通道 append-only（冻结声明件回写须独立勘误 commit 禁夹带语义批）。

册内 17 条分布与指纹四类：文件面=predecl 6／账本 1／r35-exec 报告 3／r49-audit 报告 2／r49-predecl 2／r51-report 3；形态=short-sha×10（可解析补法定形全 SHA＋subject）／bare-shortcode×5（per-session 码 wmu/kmk/qmw/rkm——wmu 已有映射 fe3271d8 可解，余者可能漂移不可解析）／nonexistent-sha×1（幻觉展开）／fuzzy-phrase×1（「本轮修复 commit」）。全部已关联 E-4~E-9 勘误行在册。判级生效自 D-192 落盘 commit 起（D-148③ 存量不溯）。

## 候选

(i) **专项批量窗**：一个执行窗内 6 文件逐件勘误 commit（一文件一钉）＋同窗册项摘除复核（PV-F10D 守恒断言复跑：失配数+命中数==册条目数）——止血最速。
(ii) **随到随做**：触碰对应文件时顺带收敛——成本摊薄但尾部条目可能久拖（predecl/账本行非常驻触碰面）。
(iii) **分类排序批量窗**：先处置「不可解析须作废」类（bare-shortcode＋nonexistent-sha，时效性最高——mapping 记忆与 reflog 可用性都随时间衰减），再处置 short-sha 补全类与 fuzzy-phrase。
(iv) **不收敛**：册=永久豁免清单——违 D-192 baseline 非大赦名单语义＋R22-Q4「维持≠免检」。

## 调研要求

1. 工业界成熟心智模型（重点）：**已知违规基线册/存量豁免清单的收敛惯例**——PHPStan baseline 条目的收敛/清理策略（reportUnmatchedIgnoredErrors 自清理后的主动收敛是否有先例）、ESLint disable comment 堆积治理（eslint-comments/no-unused-disable、--report-unused-disable-directives 的存量清理实践）、tsconfig/strict 迁移中的 baseline-error 归零运动（如 mypy --strict-equality 逐文件、RuboCop --auto-correct 批量修、uber Go nilaway 逐包启用）；**技术债清单收敛节奏**（boy scout rule 随到随做 vs dedicated debt sprint 的工业对比、Google工程实践文档对 tech-debt 清理窗口的立场）；**不可解析引用的时效性**（reflog 90 天默认 gc 窗、per-session 标识漂移——修复窗口的紧迫性论证先例）；「baseline 非大赦」（not-a-pardon）语义在 gitleaks baseline、code scanning 的实践。
2. 判候选：四候选各评强弱——特别裁决 ①专项批量窗 vs boy-scout 随到随做的收敛率实证（随到随做是否普遍导致尾部久拖）；②时效性优先序（不可解析类先修）是否有「修复窗口衰减」先例支撑；③一文件一勘误 commit 的粒度在审计/文书修订生态的先例。
3. 冲突扫描：结论是否与本仓 current 决策冲突（重点 D-191 存量勘误通道、D-192 baseline 册机制、D-181 勘误三字段、D-146⑤ append-only、D-148③ 生效时点、D-169 finding 处置三档、D-175 等待期序）。
4. 推荐+理由+置信度；缺口如实标位。
