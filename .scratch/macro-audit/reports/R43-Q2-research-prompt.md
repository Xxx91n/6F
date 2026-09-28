# R43-Q2 调研题面 — 环境前置探测粒度上限＋审计残留项处置

## 背景
仓库 macro-audit 自建守卫体系：60 件 *-check.mjs 守卫脚本，新增 env-contract 机制——守卫声明 TIER（portable/env-contract）＋need()/groupProbe() 环境前置（sibling 仓/git-object/engine-deps/asset 四类），前置缺席时组级 SKIP（不进 allOk、不折 pass）。

## 本批已兑现（R42-T1）
- 整件 envProbe→组级 groupProbe（46-check B/C 挂 sibling、A/D/E 零需照跑）
- O3 连坐修复：B/C 整闸拆为 B+C4 双闸（C1~C3 仓内断言脱连坐）——升级路径实证=「组内异质→拆闸细化」
- fresh clone 0 册外红

## 残余观察项（审计 judgement-call 级）
- O4：runner footer 把含组跳的文件计 GREEN（已有 group-skip[…] 行内标位＋group-skipped=N 计数＋allOk=false 三重披露）
- O6：40-check B1 在 asset 闸后又重言同一探测谓词（无害冗余）

## 裁决问题（三子题）
**a 粒度上限**：(i) 组粒度为终态上限、断言级前置标记不预建（首例出现再裁）；(ii) 断言级 need() 建制；(iii) 全仓静态重划分组到断言同粒度
**b O4 呈现层**：(i) 维持三重披露；(ii) 增加 GREEN-WITH-SKIP 行级方言态
**c O6 重言**：(i) 登记+下次触碰顺手删；(ii) 保留作冗余；(iii) 即删

## 调研要求
- 回顾本仓 decision-ledger 全部 current 记录（D-159/160/163/164 环境契约与粒度语义、D-079 案例驱动纪律）、docs/adr、CONTEXT.md 词条
- 重点工业界心智模型：测试环境前置/跳过的粒度实践（pytest skipif 标记粒度、JUnit assumptions、Go subtest、Bazel tag 拆分、Rust #[ignore]/cfg）；skip 结果在汇总报表中的呈现语义（CI 绿标位 vs partially-skipped 方言态——GitHub Actions/GitLab/Allure/TAP/JUnit XML 如何呈现含跳过的套件）；冗余/重言断言处置惯例；YAGNI/Speculative Generality 在测试基建上的应用边界；测试基建复杂度治理
- 辩证看待；若与 current 决策冲突：标记呈报禁静默改向
- 给出推荐与理由
