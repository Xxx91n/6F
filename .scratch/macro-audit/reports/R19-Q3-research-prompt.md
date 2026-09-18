# R19-Q3 调研题面 — 骨架契约升版纪律机检钉：breaking-diff↔version 联动断言

## 上下文（本仓实况，调研须先回顾）
- 产品=宏观+微观工程内容审计 Agent Plugin（ADR-0001~0021；CONTEXT.md 60 词；decision-ledger.md 67 条：61 current/3 revised/3 承继吸收；执行账 A 系列至 A-067）；
- **必读**：decision-ledger 全部 current 记录（重点 D-025 Dual Reporting、D-037 版本纪律六条——报告契约 report_schema 独立版本号、D-041 watch 三态、D-043 写实非松绑先例、D-058 Kernel/Agent 边界、D-066 manifest 契约守卫两段式）；ADR-0006（共享骨架+scale 切片四章锁定）、ADR-0013（三层验收闸门）、ADR-0017（preview 分级）、ADR-0018（版本编年）；CONTEXT 词条（Report Template/Shared Skeleton、Evidence Gate、Watch Tri-state、Trigger-gated Closure）；
- 契约实物：`reports/14-skeleton-fields.json`（schema_version=1.2.0，locked 四章，每章 required_fields 清单）＋`14-skeleton.schema.json`＋`14-skeleton-check.mjs`（校验内部自洽：schema 合规/章序 1-4 锁定/字段必含，无变更纪律断言）；消费方 `engine/src/report/generate.ts` REPORT_SKELETON_VERSION='1.2.0' 单源引用；
- 纪律现状：A-064 C9 已定升版触发点=**字段删除/改名/语义翻转**（additive 加法字段不触发）；r18 G2 实证泄漏——F11 语义改名未升版被审计人层打回返工（1.1.0→1.2.0），人工纪律漏一次由事后审计兜住；
- 守卫族形态：NN-check=纯 node 脚本断言文件事实（exit 0/1，PASS/FAIL 行）；已有 golden/baseline 先例（golden fixture、upstream-lock 新鲜度、rebuild-diff 刚在 D-067 裁定）；环境=Windows 11+Git Bash+GitHub Actions。

## 选项
- (a) 立守卫钉：14-check 加 baseline 机制——`14-skeleton-baseline.json` 存上版 required_fields 集+version；check 算三类 diff（删/改/语义翻转=breaking 须升版、增=additive 免升）；breaking diff 且 version 未升→FAIL；version 升但 baseline 未同 commit 同步→FAIL；
- (b) 维持人工纪律（G2 已被审计兜住=安全网有效）；
- (c) CI-only（46-check/GitHub Action diff vs base ref，本地不跑）；
- (d) 缓挂观察项（G2 单发不足立钉）。

## 调研问题
1. 契约版本纪律的机检工业心智：schema/API 契约的「breaking change 检测↔版本号」联动守卫先例——OpenAPI/GraphQL/Protobuf/JSON Schema 生态的 breaking-change detector（oasdiff、graphql-inspector、buf breaking、pb-cli）在 CI 的落地形态；「diff 分类=breaking/additive」判定规则的成熟定义（字段删除/改名/类型翻转/语义翻转 vs 纯加法）；semver 语义下「additive=minor 免升还是 patch」的口径分歧；
2. baseline-snapshot vs git-diff 两形态取舍：契约守卫用「committed baseline 文件」vs「git history diff vs base ref」的成熟度与失败模式（浅 clone/无 base ref/squash merge 史失真）；契约测试框架（Pact/Spring Cloud Contract/JSON Schema diff）的惯例；
3. 「改名」的机检可行性：rename detection 在 schema diff 工具的实现（启发式=同位置同类型删+增 vs 显式 rename 声明文件）；语义翻转（同名字段含义变）机检不可行边界——哪些 breaking 类只能靠人工+review 清单，机检只能覆盖结构面；
4. 守卫粒度与误报治理：契约 diff 守卫的 false-positive 形态（重排/描述文字变更/格式化）与豁免机制（baseline 更新同 commit 的纪律如何防「改字段忘升版」与「升版忘改字段」双向漏）；
5. 候选逐条裁定＋已知失败模式；
6. **冲突排查**：逐条点名与本仓 current 决策有无冲突（重点 D-037 版本纪律——report_schema 独立版本号是否就是骨架轴、D-043 写实先例、D-041/D-066 守卫族形态、ADR-0006 四章锁定）；冲突→给 revised 方案。**不许改文件，只给调研报告**。

## 报告结构（严格）
1) 执行摘要：推荐＋置信度；2) 分点结论；3) 对比矩阵；4) 守卫设计要素清单（推荐方向展开：baseline 文件形态/diff 分类规则/断言语义/豁免与同步纪律/改名检测边界）；5) 各候选已知失败模式；6) 与本仓 current 决策冲突排查；7) 完整来源清单；8) 信息缺口。