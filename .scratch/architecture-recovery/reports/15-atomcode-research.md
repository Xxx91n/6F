[headless] --dangerously-skip-permissions：所有工具调用将自动批准
[warning] 正在以管理员权限运行 — 模型可能可以访问系统文件。
我将按调研协议执行：先检索知识库证伪空库假设，再三引擎多角度搜索，定点抓取一手来源，最后综合输出报告。先建立任务清单并启动第一轮。

知识库确认为空（已实际触发 ctx_search 验证），转入联网三引擎搜索阶段。

搜索进行中，继续补充批评、时效与社区角度查询。

搜索已覆盖官方/批评/社区角度，补两个时效角度查询，并同步开始抓取一手来源核验。

任务2完成（13 查询 / 3 引擎 / 4 角度类），转入定点抓取核验阶段。

继续抓取剩余关键一手来源（批评视角 + 模板与扩展字段实践）。

补一次 Scorecard 官方文档抓取（github 429 换官方文档站），随后进入综合输出。

# A-015 深度调研报告：Scale 切片差异边界

**任务来源**：spec.md §Decision 6.2（A-015）｜**模式**：default（单主题常规调研）｜**日期**：2026-09-12

---

## 一、执行摘要（Tl;dr）

**Confidence：高**（10 次全文核验覆盖 9 个独立域名，核心结论均有 ≥2 独立信源交叉验证）

1. **切片差异字段有充分工业界直接先例**：SARIF 2.1.0 的 `result.kind × level` 双轴分级、`physicalLocation.region` 定位精度模型、`properties` 扩展袋，加上 IEEE 829「完整性级别决定文档深度」的层级思想，足以支撑 5 类差异字段（trigger/input/output/citation/verdict-gate）的落地设计——**有直接先例，不是类比**。
2. **Macro-A 与 Micro-A 的极端差异可用机器可检字段完整刻画**：输出粒度跨度（narrative → row_level）、引文定位精度（artifact 级 → region 行/列级）、裁决进入方式（执行摘要级聚合 vs 每条 finding 级分级 + PR 门禁）、降级形态（叙事降维 vs 按严重度截断）——四个维度在 SARIF/GitHub code scanning/ToB 报告中都有可机检对应物；**「单一格式横跨 5 档连续谱」本身无直接先例，是组合式设计**。
3. **命名空间隔离有 4 种成熟工业做法**：OTel 保留前缀（`otel.*` 须规范批准）、反向域名前缀（`com.acme.*`）、SARIF `properties` 扩展袋、JSON Schema `unevaluatedProperties:false` 组合闭包——推荐「无前缀共享骨架 + 带前缀切片字段 + 组合根闭包校验 + 每 scale 字段白名单」的组合方案。

---

## 二、背景回顾

基线决策 D-001~D-007 + A-014 已锁定：5 scale 全覆盖（Macro-A/B/C + Micro-A/B）、Hub-of-Facts with Federated Adjudication（共享 DuckDB fact table + 联邦裁决、read model 独立投影）、报告模板 = 共享骨架（执行摘要→四象限与裁决→证据→行动建议）+ scale-specific 切片、4 章顺序锁定、45 骨架字段、20 格（5 scale × 4 象限）64 交集字段、applicability 枚举（native/projected/not_applicable）承载 20 格不等价。

本次要解决的是 **D-006 留下的最后一环**：切片字段如何与共享骨架共存而不破坏契约——即"共享骨架字段 vs 切片字段"的边界（问题 3）、每 scale 切片的差异字段形态（问题 1）、以及两个极端 scale 的表达边界（问题 2）。

---

## 三、对标表（对象 / 固定什么 / 自由什么 / 对本票印证）

| 对标对象 | 固定什么（共享契约） | 自由什么（扩展/切片） | 对本票印证 | 先例性质 |
|---|---|---|---|---|
| **SARIF 2.1.0**（OASIS，2020-03 批准，2023-08 Errata01） | `result` 的 `message`（唯一 required）；`kind`（notApplicable/pass/fail/review/open/informational）× `level`（none/note/warning/error）双轴正交；`physicalLocation.region`（startLine/startColumn/endLine/endColumn/snippet）定位模型；`fingerprints/partialFingerprints/correlationGuid/baselineState` 跨 run 身份 | `properties` 扩展袋（§3.8）承载工具私有字段；规则、taxonomy、location 均显式标注 MAY/可选 | **直接印证**：问题 1 的 verdict-gate 用 kind×level 双轴；问题 2 的引文定位精度用 region 模型；问题 3 的扩展点用 properties 袋 | **有直接先例** |
| **GitHub code scanning SARIF 摄取**（docs.github.com） | 支持字段**白名单**（仅列出的属性生效）；`level` 只认 note/warning/error；`properties.precision`（very-high/high/medium/low）作为排序键；`security-severity` 0-10 → critical/high/medium/low；PR 展示条件（告警所有行必须在 PR diff 内含首行）；容量上限表（results≤25k、locations/result≤1000 等） | 工具可上传任意合法 SARIF，但**未在白名单内的字段被忽略** | **直接印证**：问题 2 的"裁决进入方式 = PR 门禁 + 行级约束"、降级形态 = 按严重度截断；问题 3 的"扩展字段白名单"是消费端隔离的现实案例 | **有直接先例** |
| **IEEE 829-2008**（已被 ISO/IEC/IEEE 29119 取代） | 文档**形式与大纲**（Master Test Plan / Level Test Plan / Level Test Report / Test Summary Report 等的目的、提纲、内容）；完整性级别决定文档广度与深度 | 不规定必须产出哪些文档、不绑定方法论；各级计划的范围/方法/进度/判据自定 | **直接印证**：问题 1 的 trigger（挂起/恢复判据正是 829 的 suspension/resumption criteria）、input（level-specific 范围）、层级化文档族 = scale 切片族；"文档深度随级别变" = 5 档差异字段的存在理由 | **有直接先例**（字段级需类比，见缺口） |
| **OpenTelemetry 语义约定命名规范**（naming spec，Stable） | 小写点分命名空间（`http.response.status_code`）；名称 MUST 属于某命名空间；`otel.*` 保留前缀，新增 MUST 经规范批准；名称复用禁止、改名须弃用（deprecation）而非删除 | 厂商自定义属性：公司级用**反向域名前缀**（`com.acme.*`），应用级用应用名前缀；不允许借已有规范命名空间当自己的前缀 | **直接印证**：问题 3 的命名空间隔离核心机制（保留前缀 + 反向域名 + 前缀借用禁令）；"不得复用共享命名空间作前缀"直接解决"切片字段撞骨架字段" | **有直接先例** |
| **JSON Schema**（Draft 2020-12 / 2019-09） | `properties`/`required` 声明契约字段；`unevaluatedProperties:false`（2019-09+）在**组合根**做闭包（跨 allOf/$ref 评估） | 默认开放世界（additionalProperties 缺省=允许任意键）；`patternProperties` 前缀白名单（如 `^x-`）；`additionalProperties:{schema}` 类型化扩展袋 | **直接印证**：问题 3 的四种隔离策略（闭合 / 前缀白名单 / 类型化袋 / 组合闭包）全部有规范级机制；"基础 schema + 扩展 schema + 组合根闭合"= 共享骨架 + 切片投影的标准做法 | **有直接先例** |
| **NIST SSDF SP 800-218** | 每条 practice 固定四元素：Practice（名称+唯一 ID+为什么）/ Task / Notional Implementation Example / Reference（指向既有标准）；4 大组（PO/PS/PW/RV）；outcome-based | 采用哪些 practice、投入多少资源、实现示例均可裁剪；"meant to be changed and customized" | **直接印证**：问题 1 的切片字段=practice 四元素式"固定骨架+证据引用"；"Reference 指向外部证据"= 引文密度字段的雏形 | **直接先例（结构）/ 类比（内容）** |
| **Trail of Bits 报告解剖**（2026 官方页） | 8 部分固定骨架：封面（人-周工作量）/ 执行摘要 / 成熟度评估 / 逐 finding（exploit scenario + 短期+长期修复）/ 工件附录 / 修复复查附录 | 各 finding 的严重度×难度独立打分（两轴正交）；exploit scenario 每条必带（攻击者分步走查）；修复分短/长期 | **直接印证**：问题 2 的"执行摘要级聚合裁决"（severity×difficulty 矩阵即四象限裁决的前身）、"证据密度=每 finding 带步进走查+定位" | **有直接先例** |
| **arc42**（12 节模板） | 12 节固定结构（目标/约束/上下文/方案/构建块视图/运行时/部署/横切/决策/质量/风险/术语），每节有明确目的 | 每节内容可裁剪定制（"tailorable to your specific needs"） | **印证**：问题 2 的叙事端（Macro-A）输出形态 = 章节化叙事文档；与 SARIF 行级格式形成"叙事 vs 行级"两极端 | **类比**（仅输出形态） |
| **SARIF 批评文**（boostsecurity, 2022） | — | — | **印证**：共享格式 ≠ 免处理——需要有状态 ETL 完成标准化/去重/降级；"SARIF 是总线不是仪表盘" = 联邦裁决层存在理由；严重度边界归一化是真实分歧点（见信息缺口） | **批判性佐证**（非先例） |

---

## 四、三条问题的推荐方案

### 问题 1：每 scale 切片的差异字段设计（固定 5 类）

直接对标：IEEE 829「完整性级别决定文档广度与深度」+ SSDF「Practice/Task/Example/Reference」+ SARIF「kind×level 双轴 + region 定位」。建议每个 scale 切片是一个**自包含命名空间对象**，固定 5 类字段，每类给出最小机检字段集：

| 类别 | 字段名建议 | 值域 | 对标依据 |
|---|---|---|---|
| **触发器**（何时启动） | `trigger.kind`（event/poll/manual/cron/on_demand）；`trigger.suspend_criteria`、`trigger.resume_criteria` | 枚举 + 谓词表达式 | IEEE 829 的 suspension/resumption criteria（一手：IEEE 829 大纲与 Wikipedia 文档清单） |
| **输入**（数据源与信号集） | `input.data_sources[]`（fact table 中哪些 fact 表/视图）；`input.signal_set[]`（信号集）；`input.scope_selector`（仓库/PR/文件选择器）；`input.applicability_map`（复用 A-014 的 20 格枚举） | 数组 + 选择器 | IEEE 829 Level Test Plan 的 scope/approach/features to be tested（一手：ProfessionalQA、Wikipedia） |
| **输出粒度**（叙事 vs 行级） | `output.granularity`：`narrative` \| `structured` \| `row_level`；`output.max_findings`（上限）；`output.summary_depth`（执行摘要提炼层级） | 枚举 + 整数 | SARIF row-level vs arc42 narrative 的两端；GitHub 容量上限表 |
| **引文密度**（每条结论证据条数与定位精度） | `evidence.min_per_conclusion`（每条结论最少证据条数）；`evidence.location_precision`：`artifact` \| `region` \| `line` \| `line_column`（对应 SARIF region 的 startLine/startColumn 粒度）；`evidence.allow_derived`（是否允许投影派生证据） | 枚举 + 整数 | SARIF `physicalLocation.region`（一手：sarif.info/Result）；ToB 每条 finding 带 exploit scenario + 定位 |
| **verdict-gate 印记位置**（裁决落在哪） | `verdict_gate.anchor_chapter`：`executive_summary` \| `quadrant` \| `per_finding`；`verdict_gate.field`（落到共享骨架哪个字段）；`verdict_gate.scale`：`pass/fail/review/n/a`（映射 SARIF kind）；`verdict_gate.criteria`（通过判据引用） | 枚举 | SARIF kind（fail/pass/review/notApplicable/informational）；ToB 执行摘要 severity×difficulty 矩阵 |

**verdict 双轴建议**：采用 SARIF `kind × level` 正交模型而非单值——`verdict_gate.state`（评估状态轴，对应 20 格 applicability）+ `verdict_gate.severity`（严重度轴），两轴正交正是 SARIF 2.1.0 §3.27.9-10 与 ToB「severity × difficulty 分开打分」的共同结论（双源交叉验证）。

### 问题 2：Macro-A 与 Micro-A 的表达边界（两极端）

**四个可机检边界字段（每对都有 SARIF/GitHub 直接对应物）：**

| 边界维度 | Macro-A（跨仓叙事） | Micro-A（PR 行级） | 机检字段 | 直接先例 |
|---|---|---|---|---|
| 输出粒度跨度 | `output.granularity=narrative`；结论是主题/趋势（如"跨仓所有权漂移"），章节化叙事 | `output.granularity=row_level`；一条 finding = 一个 result 对象 | `output.granularity` + `output.max_findings` | SARIF result 对象（message 唯一 required，行级单位）；arc42 12 节叙事 |
| 引文定位精度 | `evidence.location_precision=artifact`（引用到 artifactLocation.uri 即可，region 可缺省） | `evidence.location_precision=line_column`（region.startLine/startColumn 必填，且 PR 告警的所有行必须落在 diff 内含首行） | `evidence.location_precision`；`evidence.require_diff_membership`(bool) | GitHub：PR check 展示条件（一手文档原文）；SARIF region |
| 裁决进入方式 | 裁决印记落在**执行摘要**（四象限聚合裁决，像 ToB 的 severity×difficulty 矩阵） | 裁决印记落在**每条 finding**（result.level）**+ PR 门禁**（check 通过/失败由告警级别驱动） | `verdict_gate.anchor_chapter`（executive_summary vs per_finding）+ `verdict_gate.pr_gate`(bool) | ToB 执行摘要矩阵；GitHub code scanning 告警→PR check |
| 降级形态 | **叙事降维**：砍叙事深度/合并象限，保留结论降置信度（evidence.allow_derived 标为 projected） | **行级截断**：按严重度/精度排序后截断（GitHub 只保留 top 5000 results、locations 只取 100 条），`baselineState`（new/unchanged/absent）标记跨 run 状态而非删除 | `output.max_findings`；`verdict_gate.baseline_state` | GitHub 限制表（一手：docs.github.com 容量上限表）；SARIF baselineState |

**边界断言（可机检的"极端差异"判据）**：当且仅当满足 `output.granularity=narrative ∧ evidence.location_precision≤artifact ∧ verdict_gate.anchor_chapter=executive_summary` 时可断言"这是 Macro-A 形态"；`output.granularity=row_level ∧ evidence.location_precision≥line ∧ verdict_gate.pr_gate=true` 时断言"这是 Micro-A 形态"。**无直接先例项**：单一 schema 内同时声明这两组约束并允许中间 3 档连续过渡（SARIF 只有行级端、IEEE 829 只有文档族层级、arc42 只有叙事端）——这是本票的组合式创新，先例只覆盖两端各自形态。

### 问题 3：命名空间隔离（防切片字段撞共享骨架字段）

四类成熟做法，全部有规范级来源（OTel naming spec 一手、JSON Schema 一手、SARIF §3.8 一手、GitHub 白名单一手），建议**组合使用**：

1. **保留前缀 + 命名空间分层**（OTel 模式，强先例）：共享骨架字段**无前缀**占据根命名空间（它们是契约）；所有切片字段强制 `scale_<s>.<field>` 前缀（如 `scale_macro_a.granularity`）。**关键禁令直接抄 OTel**：切片不得把共享命名空间当自己的前缀（OTel 原文：不建议用现有语义约定命名空间作自定义属性前缀，会与未来规范冲突）。OTel 还提供反向域名兜底（`com.acme.*`）给组织私有扩展。
2. **扩展袋**（SARIF §3.8 `properties` propertyBag，强先例）：每个共享骨架对象带 `properties` 袋，允许 scale 私有字段塞入——GitHub 的 `properties.precision`/`properties.security-severity` 就是"通过扩展袋承载平台级扩展"的现实案例（一手文档确认）。
3. **schema 级闭包**（JSON Schema，强先例）：共享骨架 schema 保持开放（`additionalProperties` 缺省）以利组合；在**投影组合根**用 `unevaluatedProperties:false` 闭合（2019-09+ 跨 allOf/$ref 评估），未知字段（拼错的骨架字段、无前缀的野生切片字段）直接被校验拒绝。`patternProperties` 可做 `^scale_[a-z]+\.` 前缀白名单。
4. **消费端白名单**（GitHub 模式，强先例）：集成层维护「每 scale 受支持字段表」——白名单外的字段不被投影（而非报错），与 SARIF 规范"绝大多数属性可选且可加"兼容，保证前向兼容。

**推荐组合**：无前缀共享骨架（契约）+ `scale_<s>.` 前缀切片字段（OTel 式）+ 每对象 `properties` 袋兜底（SARIF 式）+ 投影根 `unevaluatedProperties:false`（JSON Schema 式）+ 集成层字段白名单（GitHub 式）。四条防线中任何一条都能独立阻止"切片字段冒充骨架字段"。

---

## 五、一手来源清单（10 次全文核验 + 3 次搜索级验证）

| # | 标题 | URL | 抓取角度 | 日期 | 贡献 |
|---|---|---|---|---|---|
| 1 | SARIF v2.1.0 + Errata 01（sarif.info 参考站） | https://sarif.info/ | Official（全文） | 2023-08（Errata01） | SARIF 形状、result 为唯一 required=message、level/kind 语义、扩展袋 §3.8 |
| 2 | SARIF result 对象全属性表 | https://sarif.info/Result/ | Official（全文） | 2020-03 | kind×level 双轴正交、region 定位、fingerprints/baselineState 跨 run 身份、properties 袋为 §3.8 扩展点 |
| 3 | OTel 语义约定命名规范 | https://opentelemetry.io/docs/specs/semconv/general/naming/ | Official（全文） | Stable | 点分命名空间、otel.* 保留前缀、反向域名前缀、前缀借用禁令、弃用而非删除 |
| 4 | Trail of Bits 报告解剖 | https://trailofbits.com/anatomy-of-a-report/ | Official（全文） | 2026 | 8 部分骨架、severity×difficulty 双轴、每条 finding 带 exploit scenario + 短/长期修复 |
| 5 | GitHub code scanning SARIF 支持 | https://docs.github.com/en/code-security/reference/code-scanning/sarif-files/sarif-support | Official（全文） | 当前 | 支持字段白名单、level/security-severity 映射、PR diff 展示条件、容量上限表（降级截断依据） |
| 6 | IEEE 829-2008 标准页 | https://standards.ieee.org/ieee/829/3787/ | Official（全文） | 2008 | "完整性级别决定文档广度深度"、被 ISO/IEC/IEEE 29119 取代（时效标注） |
| 7 | NIST SSDF SP 800-218 | https://csrc.nist.gov/projects/ssdf | Official（全文） | 2024 | Practice/Task/Notional Implementation Example/Reference 四元素结构、outcome-based 可裁剪 |
| 8 | arc42 模板总览 | https://arc42.org/overview/ | Official（全文） | 2005 起 | 12 节固定模板 + "tailorable to your specific needs"（叙事端形态类比） |
| 9 | JSON Schema additionalProperties 全解 | https://jsonic.io/guides/json-schema-additional-properties | Community（全文） | 2026-05 | 开放/闭合默认、patternProperties `^x-` 白名单、unevaluatedProperties 跨 allOf 组合闭包 |
| 10 | SARIF Can't Save You Now（批评） | https://boostsecurity.io/blog/sarif-cant-save-you-now | Criticism（全文） | 2022-11-03 | SARIF 是"总线"需有状态 ETL；严重度/置信度/标签归一化是真实痛点（联邦裁决层存在理由） |
| 11 | IEEE 829 文档族（Wikipedia） | https://en.wikipedia.org/wiki/Software_test_documentation | Official（搜索级） | 当前 | MTP/LTP/LTR/TSR 文档清单与职责 |
| 12 | 测试文档标准（ProfessionalQA） | https://www.professionalqa.com/test-documentation-standards | Community（搜索级） | 当前 | Level Test Plan scope/approach/判据、Level Test Report 职责（Q1 字段值域佐证） |
| 13 | What's new in SARIF 2.2（TC Wiki） | https://github.com/oasis-tcs/sarif-spec/wiki/What's-new-in-SARIF-2.2 | Currency（搜索级） | 2026-02 | 2.2 草案新增 `precision` 字段（#611）、`security-severity`（#612）、theLocationOwner（#540）——印证 GitHub 扩展袋内容正被规范化 |
| 14 | OASIS SARIF TC 会议纪要 251204 | https://github.com/oasis-tcs/sarif-spec/blob/main/meeting_minutes/251204_SARIF_TC_104.md | Currency（搜索级） | 2025-12 | 2.2 路线图、precision/security-severity 提案进入编辑修订 |
| 15 | OpenSSF Scorecard 说明（Sonar） | https://www.sonarsource.com/learn/openssf-scorecard | Official（搜索级） | 当前 | 每 check 0-10 分 + 总体分（Scorecard 证据模型佐证；**一手 schema 未抓到，见缺口**） |

---

## 六、信息缺口

1. **OpenSSF Scorecard JSON v2 的一手 schema** 未抓取成功（github.com/ossf/scorecard 返回 429，ossf.github.io 404）——其 `check.reason/documentation` 字段细节仅靠 Sonar 与 Marketplace 搜索摘要佐证，建议后续补抓 raw.githubusercontent 的 JSON schema。
2. **IEEE 829-2008 正文**为付费墙（IEEE Xplore），仅核验标准页摘要 + Wikipedia + 第三方教程；"字段级文档大纲"细节（如 Level Test Report 的具体段落）未读到原文，本报告对 IEEE 829 的引用止于"文档族层级与完整性级别原则"，未下钻到字段级。
3. **SARIF 2.2 规范正文**未整读（wiki/会议纪要确认了 precision 与 security-severity 提案，但 2.2 尚未发布 OASIS 标准稿）——若本票落地晚于 2.2 发布，应改用 2.2 的 `reportingDescriptor.precision` 原生字段而非自建。
4. **严重度边界分歧**（来自 code scanning 检索中 aaronlippold 与社区关于 CVSS 桶边界、critical vs high 归一化的争论）说明 verdict-gate 的严重度分桶本身存在操作分歧——建议本票的 `verdict_gate.severity` 分桶独立成文（复用 A-014 applicability 枚举的"不等价承载"思路），并显式记录分桶依据。
5. **"5 档连续谱单一 schema"无直接先例**（SARIF 只有行级端、arc42 只有叙事端、IEEE 829 是文档族而非字段谱）——这是组合式创新，风险点在中间 3 档（Macro-B/C/Micro-B）的字段组合是否存在空档，建议后续 A-0xx 对中间档做样例验证。

---

**Sufficiency Gate**：searches: 13 | angles: Official / Criticism / Community / Currency / Comparative | full reads: 10（9 独立域名）| gaps: Scorecard 一手 schema（429/404）、IEEE 829 正文（付费墙）、SARIF 2.2 正文（未发布）；关键结论（SARIF 双轴分级、region 精度、OTel 命名空间、JSON Schema 闭包、GitHub 白名单/PR 门禁/截断降级）均已 ≥2 独立信源交叉验证。

继续此会话，运行：atomcode -p "…" --resume 27958270-c614-4413-a1cf-ef33224a5725
