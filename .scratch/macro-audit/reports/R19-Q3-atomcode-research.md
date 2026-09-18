# R19-Q3 调研报告：骨架契约 breaking-diff↔version 联动断言

> atomcode 深调研（2026-09-18 实跑；searches 10+/5 角度/full reads 7，置信高）。题面=R19-Q3-research-prompt.md。

## 1) 执行摘要

**推荐 (a) 立守卫钉，直接 enforce（带一处 D-066 式拆段微调），置信度：高。** 「breaking-change 检测↔版本号联动」不是新发明，是 2026 年正在被头部工具收编为内置 checker 的成熟治理形态（oasdiff #1007，2026-06 开立、诉求逐字=「breaking change present but major did not bump」+「spec changed but version unchanged」双向断言）；且 G2 已实证人工纪律漏过一次。对本仓单文件 JSON 契约（四章×required_fields），**committed baseline 文件形态优于 git-diff vs base ref**（规避 shallow clone、GitButler workspace 提交史、base ref 缺失三类失败模式）。机检覆盖边界诚实声明：**删/改名（删+增对）/类型翻转可机检，语义翻转机检不可行**——审计人层从「主防线」降级为「语义面纵深防御」。

## 2) 分点结论

**2.1 「diff 分类↔版本号」联动是工业化心智，且有 2026 年新鲜先例。** oasdiff 维护者 2026-06 亲自开立 issue #1007：把「change severity vs info.version delta」做成 checker 家族（breaking→major 须 bump；spec 变了 version 没变→报），以 per-rule severity 表达策略、非 semver version 优雅跳过——与本仓拟建断言同构。现状是「人们在 CI 里用 shell 手搓 version math」（oasdiff-action#154），即**手搓联动是公认反模式、内置联动是正解方向**。buf breaking / graphql-inspector 均以「存在 breaking change→进程 exit≠0」作为 CI 门禁原语。

**2.2 diff 分类规则有成熟定义。** oasdiff 把 755 种变化分类为 339 breaking/17 warning/399 info，判定法则公开可机检：**收窄请求=breaking、放宽响应=breaking、无法证明安全→按 breaking 报（fail-safe）**——「报一个安全的为 breaking 只花 reviewer 一眼，报一个 breaking 的为安全就上生产了」。graphql-inspector 用三档（breaking/dangerous/safe）+规则调节豁免。对本仓收窄规则集：字段删除/改名（=删+增对）/required 集内成员消失→breaking；新增 required_fields 成员→additive；章序变更→breaking（ADR-0006 锁定）。

**2.3 rename 机检：删+增对是唯一可靠信号，启发式不必做。** JSON Schema 生态工具一律把 rename 呈现为 one removal+one addition，**无隐式 rename 检测**。Protobuf 例外（buf FIELD_SAME_JSON_NAME 有字段号稳定锚）；骨架字段无字段号等价物，故 rename 判定为「删+增对→breaking」即正确且足够。G2 的 F11 语义改名恰是这种形态——会被本断言拦住。

**2.4 语义翻转机检不可行，边界清晰。** oasdiff 原文：「a change in behavior your definition does not describe is invisible to any specification-based tool」——同名字段含义变（结构面零 diff）任何 spec-diff 工具都不可见。机检覆盖结构面三类，语义翻转维持人工+审计清单；守卫输出应显式打印「语义翻转不在机检覆盖内」提示行。

**2.5 baseline 文件 vs git-diff：选 committed baseline。** buf 默认 git ref baseline 但官方自承失败模式：「Many CI services run shallow clones that don't include the branches you want to diff against」；GitHub 官方博客：浅 clone 使 merge-base/log 不可用。叠加本仓特有：GitButler 管理下 diff 对象是 workspace commit，squash/apply 史失真风险高。committed baseline 三优势：① 本地/CI 同一逻辑零 git 依赖；② check 只需 fs 读两个 JSON；③ baseline 版本可被守卫自身断言（双向漏双向拦）。Pact broker/Confluent Schema Registry 同属 committed/published 基线家族。

**2.6 semver 口径分歧要显式钉进守卫。** semver.org 正典：additive→minor、breaking→major。但分歧真实存在：0.x 期 breaking→minor（oasdiff #1007 design question 明列 pre-1.0 rule）；社区有 additive=patch 习惯。**口径不统一是常态，守卫不能依赖默认共识**。本仓骨架轴已 1.2.0（≥1.0），按正典 breaking→major；A-064 C9 只写「须升版」未钉 major/minor。建议钉：**breaking diff→version 必须变更（最低断言）**，major/minor 之辨留审计人（或写死 major）；additive→免升（与 C9 一致），可选「additive 建议升 minor」WARN。

**2.7 误报治理有现成规则名。** graphql-inspector `ignoreDescriptionChanges`（描述文字变更过滤）即本仓「字段描述/注释变更不触发」先例；baseline 只存结构数据（章序+字段名集+version）不存描述文本；required_fields 数组**先归一化为集合再比较**，重排不误报。

**2.8 双向漏的双向拦已有先例措辞。** oasdiff #1007 v1 scope 恰好两条：「breaking present but major did not increase」＋「spec changed but version unchanged」；本仓加第三条：version 升但 baseline 未同 commit 同步→FAIL。三条合起来把「改字段忘升版」「升版忘改字段」「升版忘换 baseline」全钉死。

## 3) 对比矩阵

| 项 | 形态 | 覆盖面 | 主要失败模式 | 对本仓适配度 |
|---|---|---|---|---|
| buf breaking（git ref baseline） | diff vs base ref/registry | 结构 53 规则、字段号锚定 rename | shallow clone 须绕行；fetch-depth 0 或 remote-URL 克隆 | 低——骨架无字段号锚；GitButler 史失真 |
| oasdiff（双 spec diff） | diff vs base spec | 755 类变化、severity 法则公开 | 需 base spec 可得（同 shallow clone）；versioning checker 未内置 | 中——法则可借鉴，工具不适配 JSON 骨架 |
| graphql-inspector | diff vs committed schema/分支 | 三档+规则豁免 | 分支指针同 2.5 问题；描述变更默认出报 | 中高——committed schema+规则豁免同构 |
| **(a) baseline 文件+自研断言** | committed snapshot | 删/改名对/类型翻转/章序+additive | baseline 忘更新（被第三断言自拦）；语义翻转不可见 | **高**——纯 node fs、exit 0/1、合 NN-check 族形 |
| (c) CI-only git-diff | base ref diff | 同 (a) | 浅 clone/base ref 缺失/本地不可跑 | 低 |
| (b)/(d) 人工/观察 | 事后审计 | 全语义面（含机检不可达面） | 已实证漏一次（G2）；返工成本后置 | 仅作纵深防御层保留 |

## 4) 守卫设计要素清单（推荐方向展开）

1. **baseline 文件形态**：`14-skeleton-baseline.json`（与 14-skeleton-fields.json 同目录）——仅存 `{baseline_version, chapters:[{id, ordinal, required_fields}]}`；required_fields 存排序数组，比较前归一化为集合；不存描述/格式化文本。三方一致断言：baseline_version==fields.schema_version==generate.ts REPORT_SKELETON_VERSION（D-037② report_schema 若为另一轴则增第四方映射注记）。
2. **diff 分类规则**（A-064 C9 机械化）：`removed=baseline-current`、`added=current-baseline`；removed≠∅→breaking；整章消失或 ordinal 变→breaking；added≠∅→additive；两侧皆空但 version 变→「升版忘改字段」FAIL；两侧非空但 version 未变→「改字段忘升版」FAIL；version 升而 baseline_version 未跟进→FAIL。
3. **断言语义**：exit 0/1+PASS/FAIL 行，守卫族同形；FAIL 消息内嵌修复指引（「intentional breaking change→同 commit 更新 baseline 并升 version」）；豁免机制=无（baseline 更新即豁免动作本身，无独立 ignore 文件）。
4. **改名检测边界**：不配对、不做启发式——删+增对一律按 breaking 处理（oasdiff fail-safe）；守卫输出列 removed/added 明细供人眼判断是否 rename。
5. **机检不可达面显式化**：PASS 输出固定打印「semantic-flip not machine-checkable; human review per A-064 C9 still required」。
6. **enforce 档位**：直接 enforce。D-066 两段式适用前提是「新断言无事故实证」；本断言三类 breaking 均有 G2 实证且分类确定性 100%（纯集合运算零启发式）——符合「确定性高+有事故→直接 enforce」的 D-066 内在逻辑。若采两段式：首轮 advisory＋baseline 同 commit 落地、次轮升 enforce，成本仅一轮延迟——两案皆合 D-066 精神，默认 enforce。

## 5) 各候选已知失败模式

- **(a) baseline 文件**：① 有意 breaking 忘更 baseline→被第三断言拦（自愈）；② baseline 被误改（复制 current 顶替）→掩盖真实 diff——缓解：baseline 变更须与 version 升版同 commit，PR 审计可见；③ 语义翻转不可见（显式声明是边界非失败）；④ 多份版本字段漂移→三方一致断言兜。
- **(b) 人工纪律**：已实证 G2 漏一次；事后审计兜底=返工成本后置，审计覆盖率依赖轮次排期。
- **(c) CI-only**：浅 clone 下 git diff base ref 失败或拿错 base（GitHub community #25950 全套 workaround 存在即证明脆弱）；本地不可跑违守卫族惯例；GitButler workspace commit 使 base ref 语义更不稳。
- **(d) 缓挂**：A-064 C9 触发点已成熟、实现成本≈一个 NN-check 断言——「便宜+有先例+已定义」三条件齐，缓挂只有暴露窗口。

## 6) 与本仓 current 决策冲突排查

| 决策 | 排查结论 |
|---|---|
| D-037② report_schema 独立版本号 | 无冲突，但需澄清轴：report_schema（报告契约头）与 REPORT_SKELETON_VERSION（骨架轴）是两条轴（A-067 handoff 明记）；守卫须把两轴关系写成显式断言/注记防混轴升版。**若审计人裁定两轴实为一体**，则 D-037② 需一行勘误注记（D-055 先例），本体不变 |
| D-043 写实先例 | 同向：baseline 命名写实（-baseline 后缀自明），守卫输出不虚称「检测语义破坏」 |
| D-041 watch 三态 | 同向：event_bound（14-check 触发链内），不新增 manual_watch |
| D-058 Kernel/Agent 边界 | 无冲突：断言属 .scratch 报告资产层守卫，不进 kernel |
| D-066 manifest 守卫两段式 | 部分张力：D-066 对新校验器采两段式；本推荐对新断言直接 enforce（G2 事故实证+判定确定性）。从众采两段式亦可——成本仅一轮延迟，两案皆合 D-066 精神，默认 enforce |
| ADR-0006 四章锁定 | 同向：baseline 的 ordinal/chapter 断言是四章锁定字段级延伸 |
| ADR-0013/ADR-0018 | 同向：守卫=第一层机检扩容；version 单调性断言与编年纪律互证 |

**零 revised（附条件注记一条：若两轴裁定一体则 D-037② 加勘误注记）。**

## 7) 来源清单

1. oasdiff breaking-changes 完整规则册 — https://www.oasdiff.com/docs/breaking-changes — Official — 2026 现行 — 755 类分类+severity 法则+fail-safe 原则
2. oasdiff issue #1007 versioning policy checker — https://github.com/oasdiff/oasdiff/issues/1007 — Official — 2026-06 — breaking↔version 联动断言双向措辞原形
3. Buf breaking usage — https://buf.build/docs/breaking/usage/ — Official — baseline 形态谱系+shallow clone 失败模式自认
4. Buf breaking 概览/规则 — https://buf.build/docs/breaking/ — Official — 字段号锚定 rename 规则（FIELD_SAME_JSON_NAME）
5. GraphQL Inspector diff — https://the-guild.dev/graphql/inspector/docs/commands/diff — Official — 三档分类+ignoreDescriptionChanges 豁免
6. Yan Cui《detect and prevent breaking changes in event schemas》 — https://theburningmonk.com/2025/04/... — Community/Expert — 2025-04 — 三形态取舍
7. PactFlow《Schema-based contract testing》 — https://pactflow.io/blog/contract-testing-using-json-schemas-and-open-api-part-1/ — 厂商 — schema test=point-in-time 断言→快照基线
8. JSON Schema org GSoC 2026 #984 — https://github.com/json-schema-org/community/issues/984 — Official — JSON Schema 兼容性检查缺口自认
9. semver.org — https://semver.org/ — Official 正典 — additive→minor/breaking→major
10. GitHub Blog partial/shallow clone — https://github.blog/... — Official — 浅 clone 使 merge-base/log 不可用
11. GitHub community discussion #25950 — https://github.com/orgs/community/discussions/25950 — Community — git diff base ref 手搓绕行（脆弱性反证）
12. json-schema-diff (npm) — https://www.npmjs.com/package/json-schema-diff — Official — rename=删+增对行为实证
13. Creek Service《Evolving JSON Schemas Part I》 — https://www.creekservice.org/articles/2024/01/08/... — Expert — required/optional 增删兼容性口径分歧
14. Confluent Schema Registry compatibility — https://docs.confluent.io/platform/current/schema-registry/... — Official — 兼容矩阵
15. 本地：decision-ledger.md（D-037/D-041/D-066/D-067）、r18-audit-pass-handoff.md（G2 实证+A-067 轴澄清）

## 8) 信息缺口

1. **oasdiff versioning-policy checker 未发布**：#1007 尚在设计中（#1133 关联），final 语义按提案推断；结论不依赖其落地，2026Q4 发布可回看对齐。
2. **Reddit 同构案例原文未读成**（JS 渲染页）：仅搜索摘要级信号，未计入结论权重。
3. **Agent Plugins 生态同构先例**：plugin manifest/技能资产层面版本纪律守卫未查得公开先例——本仓守卫大概率自创形态（借鉴通用契约工具心智非移植）。
4. **Pact/SCC contract 版本↔broker 联动细节**未深挖（本仓无 broker，相关度低）。
5. **骨架轴 report_schema 两轴关系**最终裁定需审计人拍板，调研只给两案。