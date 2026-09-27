# R40-Q1 atomcode 调研呈报（第四轮锐评摄入分诊与 grill 射程裁定）

> 调研方式：atomcode -c 续跑（首轮 5h 配额耗尽 22:50 恢复后续跑）；Sufficiency Gate：searches 6（web×2+anysearch batch×2+仓内 ctx×2）｜angles：Official（pytest/conventionalcommits）＋Criticism/Comparative（SMURF、测试维护成本）＋Community（dogfooding ADR/指南）＋Currency（2026 维护成本文）｜full reads 5（pytest skipping、pytest goodpractices、conventionalcommits.org、Google SMURF、r40 审计 handoff/report 仓内原文）｜gaps：Tavily 配额耗尽、mycelium ADR-036 429 未读成、testcontainers 官方档未直取、Google flaky-test 专文未单独读。

## 1) 执行摘要（TL;DR）

分诊表基本成立，两处需修正（C1 的 26-check 幽灵 commit 一半属 D-094 字面钉族而非纯环境假设；C2 数字已被 D-146⑤ 勘误记为计量漂移）。射程裁定：同意 (b)＝锐评四面＋F-A1，理由 F-A1 与 C1 同属守卫面探测语义、且 r40 审计 handoff 明令「F-A1 处置优先：先走裁定或修复窗」；T3/T2 属簿记执行面，按 D-153 先例「簿记面不占裁定链」不入本射程，T3 复审读数可作为 C2 的证据输入。Confidence：分诊修正＝高（仓内一手证据）；射程推荐＝中高；心智模型映射＝中高（逐条标注）。

## 2) 分诊表裁定

| 面 | 裁定 | 依据 |
|---|---|---|
| C1 守卫面环境硬编码 | 成立但需拆分：37-check ROOTS/9-check sibling 引用＝纯环境假设面，确无 current D 覆盖（D-149 只裁了守卫基线成员与静默红画像，未裁运行环境契约）；26-check fc00d458 幽灵 commit ≠ 环境假设——它是 commit 哈希字面钉，属 D-094「字面钉失效族」已立法机制的实例，应归 #75批1 普查通道而非新裁面 | D-094（BACKLOG #75批1 失效三分类建制）、D-149 全量画像（era-scoped 静默红归 T3/#75批1） |
| C2 守卫递归成本倒挂 | 成立，且数字须先勘误：D-146⑤ 已登记锐评「5117 行/52 组/1246 断言」系 R31 旧数（现状 5808 行/58 组），量级成立但读数漂移；「断言裁军/守卫退役」与 D-144（复绿税保留——两次抓到真漏录 M-013/M-009）正面冲突，见 §4 | D-144/D-146⑤/D-148（R35 锐评三税已裁毕、文本面零残余） |
| C3 提交信息长行政风 | 成立；归因为准（D-018 编年纪律＋账行↔编年核对＋D-144 保留裁定的直接函数）；但「长」本身有不改纪律的可改善面＝结构化（trailer 化），见 §5-C3 | D-018/ADR-0018/D-144 |
| S3 registry 真实用户压测 | 成立；残余面界定准确——D-051 已裁 A+C 双轨自助上架＋Apache-2.0，ADR-0017 已立 preview 模型，真残余=preview 期 capability 4/5 的外部用户暴露节奏与梯度 | D-051（current）/ADR-0017 |
| F-A1 | 成立且应入射程：r40 审计报告实证字符串提名仍豁免＋CONTEXT「注释或字符串里的字面提名不计」措辞越界实现实态；handoff 明示两径待裁 | r40-audit-report §5/handoff §F-A1 |
| T3/T2 | 成立且不入本射程：T3=manual_watch 三件＋技术债八件重审=簿记执行面；T2 批2=执行窗。按 D-153 先例簿记不占裁定链；但 T3 八件技术债重审的读数应作为 C2 裁面的输入证据一并取回 | D-153/D-155 |

## 3) 射程裁定：推荐 (b)

- C1 与 F-A1 同属守卫面语义：C1 的治理出口（环境契约声明）与 F-A1 的出口（豁免谓词收紧 vs 接受＋文案修）都要动同一批 check 文件与 ADR-0024 邻接面，拆两轮必产生重复读面与漂移窗口。
- C2 的裁定需要 T3 读数但不需要 T3 裁面：八件技术债重审恰好是「哪些守卫该退役/降级」的实证素材——取其读数入 C2 证据包，裁定动作仍归 T3 执行窗。
- (c) 全并的代价：T2 票面批2 建制是执行窗建制，混入裁定链违反本仓「裁定≠执行」纪律（R39 收口节原话「本轮 grill 全程零源码零行为面改动」）。
- 本仓自身先例最有力：D-148（R36-Q1 grill 射程裁）已裁定过一次「锐评文本面零残余、不再扩射程」；D-153（射程立法——核销呈报与裁定序入收口节、簿记面不占裁定链）。外部先例（ADR-036 双 waypoint）支持把「裁定批」与「执行批」分开编排。

## 4) 与 current D-xxx 的显式冲突点（勿静默改向）

| 锐评面 | 冲突的 current 决策 | 冲突性质 | 处置建议 |
|---|---|---|---|
| C2「断言裁军/阶段守卫退役」 | D-144（复绿循环税保留：税乃 ADR-0018 强制函数且两次抓到真漏录）＋D-148（R35 锐评三税已裁毕、锐评文本面零残余） | 正面冲突——C2 是第四轮锐评三税的路线级重开 | 若本 grill 要听 C2，必须显式声明「重开 D-144 层级问题」，不允许以「补裁」名义改向；默认走向=维持 D-144，仅接受 era-scoping/降级机制（D-149 已立法的 manifest 管理路径）作为退役的合法形态 |
| C1-26check 幽灵 commit | D-094（字面钉三分类批注册） | 归属冲突：新裁面 vs 既有普查通道实例 | 建议裁定为 D-094 族实例归 #75批1，不另立裁面；ROOTS/sibling 面另立新裁（无冲突） |
| C3「提交太长」 | D-018/ADR-0018 编年纪律＋D-144 税保留 | 半冲突：内容长度不可削（纪律函数），但形态可改善 | trailer 化/结构化不推翻 D-018——把账行改写为 git trailer 规范文法（机器可解析）属兼容性增强，须显式声明「不动编年纪律本身」 |
| C1 环境契约 | D-149 守卫基线 18 件枚举锚 | 无正面冲突，但 C1 治理若引入 env-gated skip，会扩 D-149 的 XFAIL/manifest 机制语义 | 声明为 D-149 机制的延伸（环境类 skip 入 manifest 带理由），非改向 |
| S3 暴露节奏 | D-051（current，A+C 双轨）＋ADR-0017 | 无冲突，纯残余面 | 新裁，引用 D-051 为底座 |
| F-A1 | D-153②/D-154①（刚收口的剥后消费位判据）＋ADR-0024＋CONTEXT 新词条 | 正面冲突——F-A1 实证 CONTEXT 词条「字符串提名不计」措辞越界 | 无论选 (a) 收紧还是 (b) 接受，CONTEXT 词条都必须修（这是唯一无歧义项）；(a) 则同时收紧谓词，新检出按 D-094 门批注册 |

## 5) 裁面心智模型参考（不代替拍板）

### C1＝环境依赖测试治理
- env-gated skip：pytest 官方把「外部资源不可用」列为 skip 的教科书场景，且要求集中一处定义 marker、附 reason（pytest.org skipping 文档，已读原文）；importorskip 处理依赖缺失。→ 对应本仓：ROOTS 不可达时 skip-with-reason 入 manifest，而非静默红——与 D-149 的 manifest 管理无缝衔接。
- hermetic 环境（Testcontainers/Compose，pytest goodpractices 及生态实践）：环境依赖要么封进容器化契约、要么显式分层。→ 对应 sibling 仓依赖：两条成熟出路＝(i) 声明为 env contract（文档化前置条件＋启动时探测＋不可达降级），(ii) 把被依赖面降为契约快照（fixture 化），拔除运行时 sibling 依赖。取舍先例：required-check 分层（pre-commit 快子集 vs CI 全量，D-149 调研已引 switowski）——外机跑的只是快子集，sibling 面可定位为「CI-only tier」。
- SMURF Fidelity 维度（Google Testing Blog 2024-10，已读原文）：测试价值在逼近真实运行条件；外部机 9 红恰好证明 fidelity 与 portability 的张力——裁定时应问「这些 check 的保真价值是否值得环境耦合」，而非一律拔除。
- 幽灵 commit：业界无「引用不可克隆对象」的合法形态——要么 fixture 化（对象入仓），要么改结构不变量（D-071⑨ 方向）。

### C2＝测试套件成本经济学与阶段守卫退役
- SMURF Maintainability/Reliability（同文，已读）：维护成本随被测系统增长超线性、flaky/静默红浪费 rerun 时间——为 C2 的成本质疑提供正当框架；但 Google 的处方是按维度权衡而非裁军。
- 2026 年测试维护成本文献（diffie.ai/qa.tech/justqa，社区级信号非权威）：一致结论=高维护成本的真实代价是机会成本，且「删测试」须以缺陷检出证据为准。→ 对应：退役判据应锚定 D-149 已采集的静默红画像（12 件 era-scoped 红的失效族分布），而非断言总量。
- 阶段退役的合法形态本仓已有：D-149 的 era-scoped manifest＋XFAIL 二轨（Mozilla/Chromium/pytest strict xfail 先例，D-149 调研已引）。C2 的可裁定残余其实很窄：维持 D-144，接受「era-scoped 退役」为唯一合法路径。

### C3＝commit 双受众规范
- Conventional Commits 1.0.0（已读原文）：规范本身就是双受众设计——type 前缀短 subject 给人、footer 走 git trailer 文法给机器（§8-10 明示 trailer 解析规则）；「body 自由多段」明文允许长 body。→ 本仓的「长行政风」与规范不矛盾：规范给出的成熟解法=把机器受众的信息从 body 散文移入结构化 footer（如 Ledger-Ref: D-xxx、Chronicle: M-xxx 形态），人读 subject+body、审计机读 trailer——零纪律变更、可机器解析，与账行↔编年核对（41a-check）天然兼容。
- 审计型提交先例：git trailer 本身源自 kernel 的 Acked-by/Signed-off-by 审计链（conventionalcommits 明文承袭）。

### S3＝preview→外部用户暴露节奏
- dogfooding→public beta 转窗判据（theproductflow 指南、mycelium ADR-036——后者 429 未读成，仅摘要级）：业界惯形是给 dogfooding 与 public release 各设独立 waypoint（"a tag (functionally complete) and a release (dogfooded, public)"），转窗判据=退出标准清单而非时间表。
- 发布生命周期（Wikipedia，摘要级）：open/closed beta 之分对应本仓 preview 模型。→ 对应残余面：D-051 的 A 轨（marketplace 自助装）本质=开放 beta 已技术上可达，残余裁面=是否设梯度暴露（如先 capability 4 后 5、或先 invite 后全量）＋转窗判据预声明（与 D-146「判据预声明」纪律同形）。

### 射程＝决策批次编排先例
- 本仓自身先例最有力：D-148（R36-Q1 grill 射程裁）已裁定过一次「锐评文本面零残余、不再扩射程」；D-153（射程立法——核销呈报与裁定序入收口节、簿记面不占裁定链）。→ (b) 方案与 D-153 形态一致：裁定面=锐评四面中未裁残余（C1 主体＋C2 路线质询显式重开声明＋C3 形态面＋S3 残余）＋F-A1；簿记（T3/T2）随过程登记。外部先例（ADR-036 双 waypoint）支持把「裁定批」与「执行批」分开编排。

## 6) 置信度自评

| 结论 | 置信 | 理由 |
|---|---|---|
| 分诊表修正两处（26-check 归 D-094 族；C2 数字先勘误） | 高 | 仓内一手：D-094/D-146⑤/D-149 原文核对 |
| 射程 (b) 推荐 | 中高 | F-A1 紧迫性有 r40 handoff 一手证据；C1-F-A1 同面论证成立；但「C2 需要 T3 读数」依赖 T3 读数质量，未亲验八件内容 |
| C2 与 D-144 正面冲突判定 | 高 | D-144 原文明示反方理由并采纳保留 |
| C1 治理出口（env contract vs 降级） | 中高 | pytest 官方文档一手支持 skip-with-reason；但「ROOTS 改 env 寻址」对本仓 Node 脚本形态无逐字同名先例 |
| C3 trailer 化方案 | 中高 | conventionalcommits 原文一手；「账行↔编年核对改为 trailer 解析」的迁移成本未实测 |
| S3 残余面框架 | 中 | dogfooding 转窗判据为社区级信源（ADR-036 未读成原文），惯例外推已标注 |

## 7) 信息缺口

1. mycelium ADR-036（dogfooding/public 双 waypoint）429 未读成——S3 的「双 waypoint」提法现仅摘要级，若采纳入裁面建议补读原文。
2. Tavily 引擎本会话配额耗尽，C2 的 Google flaky-test 治理专文未独立读原文（SMURF 已读可部分替代）。
3. 八件技术债（T3 复审对象）内容未逐一核验——C2 裁面证据包的取数建议在 grill 前由簿记窗先出读数。
4. 37-check ROOTS 与 9-check sibling 的逐 check 清单未在本轮重列（信任呈报的 9 红画像；D-149 全量画像佐证外部语料漂移族 37/38 在列）。
