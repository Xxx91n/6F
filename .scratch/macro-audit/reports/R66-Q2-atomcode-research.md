# R66-Q2 深度调研报告——①验收形态选取：消费形态枚举机检 × tier 差异化验收

> atomcode 真回传存档（session 2026-10-06 02:47 batch:atomcode，14 节索引）。

## 1) 执行摘要（Tl;dr）

**核心推荐：(a) 修正版**——消费形态枚举机检＋tier 差异化验收采纳，但作三点修正：①portable 双形态实测改为「合成交付物验证」而非要求真实浅克隆环境常驻（构造 --depth 1 临时克隆属一次性、低成本、完全离线的物化读法，与本仓 D-163①「临时仓零写入读法」先例同构，无须声明豁免）；②env-contract 面不另立实测义务，其验收=need 声明集结构完整性＋SKIP-with-reason 三态**结构验证**（机检可查 reason 文法），不强制每形态实跑——避免与 D-177 实跑必选腿的适用域（红态诱导面）混淆；③consumption_forms 枚举面由**守卫作者维护＋75a-T3 对账**，与 D-159② tier 自声明同责同闸。

**Confidence：高（~85%）**——病根诊断（消费形态从未被枚举）与工业界成熟心智模型完全同构（Bazel test suite environments、Pact verification matrix、Terraform GHA 矩阵、「环境形态新增=重验」皆有成文先例）；且本仓 D-159/D-163/D-211 已预置了判据所需的大部分机制骨架，本裁是其自然延伸而非新立法。剩余 15% 不确定性集中在浅克隆 fixture 取证成本与 D-211① 措辞边界。

## 2) 四候选逐项点评

| 候选 | 判词 | 被支配点/盲区 |
|---|---|---|
| (a) 强版 | 采纳（修正） | 三处过度：(i) 要求真实浅克隆环境常驻——CI 改 fetch-depth:0 后已无该消费方，为无消费方形态建常驻闸=为新守卫造 born-red 温床；(ii) env-contract 若强制逐项探测实跑=D-177 实跑必选腿（立法域=红态诱导/修复性断言）不当扩张；(iii)「新增消费形态=勘误扩列」未定义谁在何时检测到形态新增——需落 registry 触发器否则仍靠人记 |
| (b) 登记不立判据 | 驳回 | 枚举可见但无闸=重演 P1-2 同型病理（声明面与实测面可对不齐无机检兜底）；D-159②「未声明=红」同型推理直接支配；浅克隆 born-red 已实证「靠登记不靠实测」漏检——(b) 即 (d) 换皮 |
| (c) 仅 portable 立法 | 驳回 | env-contract 守卫同样被浅克隆/CI/沙箱消费；且 (c) 误读 tier 语义——D-159① env-contract 承诺=「前置文档化＋启动探测＋SKIP-with-reason」本身就是一种对消费形态的承诺（承诺在这些形态下优雅降级），不枚举则该承诺无对账面。**tier 双层=承诺类型不同，非需要枚举与否不同**——两层都需枚举，只验收证据不同 |
| (d) 维持现状 | 驳回 | born-red 实证漏检；D-165② Dual Reporting 两层皆空转（消费形态不在裁定层也不在验收层） |

## 3) 修正版 (a′) 具体内容

### 3.1 portable tier 验收证据修正：合成交付物验证

全克隆实测照常；浅克隆形态走**合成物化**：执行窗一次性构造临时浅克隆（git clone --depth 1 本地/临时 fork），在该形态下复跑守卫并留实跑读数（D-177② 文法）。

理由：浅克隆是「形态」不是「环境服务」，本体=git 对象库形状——临时浅克隆即精确复现该形态，无需 CI 常驻；与 D-163①「首选临时仓零写入读法」完全同构=同一机制家族第五类应用；与 D-159① 负向「禁 fixture 化/mock sibling」**不冲突**——该禁令针对 mock 依赖物致断言结构性恒真（安慰剂守卫），此处合成的是**消费形态复现载体**非被断言对象（历史可达性断言对象=commit 图本身，浅克隆里真实存在/不存在），Terraform TF_ACC 在「临时物化的真实基础设施」上跑验收=同构先例；取证成本极低（--depth 1 本地 clone 秒级，无网络无 CI 时长税）。

### 3.2 env-contract tier 验收证据修正：结构验证非全量实跑

env-contract 验收=need 声明集**机检可验的结构面**（每条 need 有类型前缀、有 D-072 三段式 reason、probe 覆盖声明集逐项）＋SKIP 三态**渲染契约结构验证**（reason 非空、skip 不进门禁计数、修复指引可复制执行）——不强制每形态实跑。

理由：env-contract 守卫的 SKIP 面在宿主环境缺席时天然无法「实跑绿」——把 D-177 实跑必选（其立法域=红态诱导/修复性断言）扩张到全量验收即撞 D-177⑤「禁借本裁扩张到非探测面变更」；结构验证保持承诺可核（声明集完备+降级契约健全）而不假装能验环境本身。

### 3.3 consumption_forms 枚举面归属：作者声明＋T3 对账

枚举面由守卫作者在自声明时一并维护（与 tier 声明同 commit、同 T1 机检「未声明=红」）；75a-T3 扩展对账「声明 consumption_forms ↔ registry 登记」**双单向**（声明≠登记红、登记≠声明红——与 75a-T3 现行逻辑同构）。「新增消费形态=既有守卫重验」落 registry 触发器（形态：外部 clone 方式变更／CI checkout 配置变更／sibling 消费方式变更→触发被消费守卫 consumption_forms 复审）。

理由：与 D-159② tier 自声明同责同闸零新机制；触发器落 registry=D-211② 棘轮警戒线「先计量再立闸」同型；engine-ci fetch-depth 变更=同族先例实锤。

## 4) 工业先例证据（带出处）

### 4.1 「在哪个环境下验收过」的显式登记惯例

| 先例 | 机制 | 出处（已读原文） |
|---|---|---|
| Bazel Test Encyclopedia | 正式规范穷举测试执行环境全部约束面——非封闭环境声明下测试结果对后来者失去归因价值（「later users cannot be sure their changes are at fault」）=本仓病根的镜像表述 | bazel.build/reference/test-encyclopedia（已 fetch） |
| tox env_list | 声明式环境矩阵——「在哪些环境下跑过」是配置一等公民非口口相传 | tox-dev/tox getting-started.rst（已读） |
| GitHub Actions matrix | strategy.matrix 显式枚举配置组合，include/exclude 处理特例，fail-fast:false 保形态间不遮蔽 | runs-on.com/GHA matrix（已 fetch） |
| Terraform provider 验收 | 前置条件显式登记为环境变量名册（TF_ACC 等数十项）＋GHA matrix 跨版本跑验收——「需要什么环境」与「在哪些形态验过」双双成文 | hashicorp.github.io/terraform-provider-aws（已 fetch） |
| **Pact can-i-deploy** | **最接近先例**：verification matrix 把「哪些消费者×哪些形态验过、结果如何」落成可查询账面，部署前**对账矩阵而非对账记忆** | docs.pact.io/pact_broker/can_i_deploy（已 fetch） |

### 4.2 「声明 vs 实测对齐」的机检惯例

- K8s/Infra drift detection：declared vs actual 持续对账，漂移本身即报警——75a-T3 对账同构（cast.ai/HashiCorp Drift Detection 双源）；
- Pact Broker record-deployment：验证结果回写账面形成闭环——「声明集↔登记集↔实测集」三方对账工业成熟做法；
- D-177 预声明纪律（本仓自立法）：PCAOB AS 1215 contemporaneous 原则——声明须物化于先于变更的 commit、实跑读数必须留下。

### 4.3 「环境形态新增=既有验证失效」的触发器重验先例

- **actions/checkout fetch-depth 语义变更**=本类活标本：checkout@v2 起默认改浅克隆，致依赖全历史的工作流集体失效需逐个改 fetch-depth:0——消费方形态静默变更触发被消费方重验，与本仓 84-check 事故同构且更早期（issues #338/#1152）；
- SonarQube shallow clone warning：下游工具对输入形态自检并在不满足契约时报警（.git/shallow 检测）——「守卫自检自身消费形态前提」先例；
- GitHub 官方博客（Derrick Stolee）明文：shallow clone「creates some unexpected behavior issues… strongly discouraged for developer use」——浅克隆是已知语义有损形态，portable 承诺面必须显式覆盖或显式豁免，不能默认含混。

## 5) 账本冲突清单（硬要求核查）

| 冲突点 | 编号 | 冲突内容 | 处置建议 |
|---|---|---|---|
| 1 | D-159① | env-contract tier 限定 {37,39,46} 三件＋「禁 26 幽灵钉拉回环境裁面／内容级六件扫入 tier」——consumption_forms 枚举面加到所有守卫会被读作把内容级件拉回环境裁面 | **非实质冲突但须拍板读法**：consumption_forms 枚举对象=守卫作为被消费物的形态，非断言面重划；建议显式声明枚举面独立于 tier 字段（任何 NN-check 均有消费形态，tier 只管验收证据档位） |
| 2 | D-211① | 已裁「fresh clone 全绿并入 D-163⑥ 哨兵读数」判据语境=全克隆红海问题，未含浅克隆形态——本裁浅克隆双形态实测=对该判据的**扩展** | 方向一致但字面上是新增判据——建议登记为 D-211① scoped 注记（「浅克隆形态系本裁新增枚举面非原判据域」），沿 D-163⑤ scoped 先例 |
| 3 | D-177⑤ | 负向「禁借本裁扩张 D-147 适用面到非探测面变更」——实跑义务泛化到 env-contract 全量验收即触此禁令 | 修正版 3.2 已规避（结构验证非全量实跑）——作为修正版优于原始 (a) 的论据 |
| 4 | D-159① 负向「禁 fixture 化」 | 修正版 3.1 合成浅克隆可能被读作 fixture 化 | 已论证不构成实质冲突（断言对象真实，形态载体合成）——但须显式写明与 D-076③/D-079 安慰剂禁令的分界（合成的是消费形态非断言对象） |
| 5 | D-165② Dual Reporting | 若只报「枚举面已建」不报「浅克隆形态实测读数」即触「禁单句已完成」 | 执行窗落盘按 Dual Reporting 两行文法并报 |

无与 D-163（本裁是其 need 家族第五类的自然延伸）、D-213（姊妹题，管断言活性不管消费形态）的冲突。

## 6) 置信度自评

- 核心方向（枚举机检＋tier 差异化）：高 ~85%（工业先例密度高且与既有机制同构，非发明新范式）；
- 修正版 3.1（合成交付物验证）：中高 ~80%（机制同构扎实，但「合成浅克隆不触 D-159 负向」的读法须用户拍板）；
- 修正版 3.2（env-contract 结构验证）：高 ~85%（D-177⑤ 禁令直接支持此边界）。

## 7) 信息缺口清单

1. docs.github.com workflow syntax 官方页未直接 fetch（Tavily 引用已足，如实登记未一手）；
2. 84-check 修法落地后浅克隆实测读数未见账行（属下一题②入册裁定域，本题不裁）；
3. **工业界无 per-guard 粒度 consumption_forms 同构先例**——找到的都是 per-project/per-test-suite 粒度（tox/GHA/Terraform/Bazel environments）；本裁在仓内制度生态内属首创，粒度风险（N 守卫×N 形态维护税）须靠 D-177 比例化对冲——建议修正版明确：**consumption_forms 只对有真实多形态消费方的守卫强制枚举，单一 dev 消费方守卫登记 consumption_forms:[dev-full] 一行即闭环，不设枚举税**；
4. GHA 官方对 shallow clone 语义保证无成文边界（issues #338/#1152 属社区讨论）——守卫对浅克隆形态的断言面只能自证（84-check HISTREACH 即自证路径）。
