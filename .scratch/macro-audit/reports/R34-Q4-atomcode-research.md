# R34-Q4 atomcode 调研存档 —— R33 口径卫生三件批处置

调研时间：2026-09-25（本轮 atomcode 批次）｜题面：R34-Q4-research-prompt.md
引擎面：Exa×3 + AnySearch×3（Tavily 超限）；full reads 7（protobuf.dev/graphql governance-versioning/graphql spec introspection/qabattle/paulbellamy/medium-sanhdoan/victoriametrics）；置信：高。

## 1) 执行摘要（Tl;dr）

- **件① F9 勘误封账：推荐采纳**，落收口节一行勘误（置信高）——差集已归因观测时点（skipped 披露落地后 dirty-facts=197 复扫吻合），纯 correction 与 D-139① ISO correction 文法、D-138② known-gaps 如实登记同构；工业 errata 惯例（轻量登记不改写原文）一致支持。
- **件② SuppressedFacetReason：推荐读法 (i) 收窄到可达集 {new_file, insufficient_history}＋注释**（置信高）——读法 (ii) 与 D-095①/D-095④＋CONTEXT Reason Code Avoid 行**实质冲突非平局**。
- **件③ 83-check B2 标签收窄：推荐采纳**（置信高）——R32-V2/R33-P1 同型第三次；D-094③ 名↔检纪律＋D-094①(c) 欺诈类「名不副实→修检查面」已有立法；paulbellamy 惯例=测试名是实现的第三份描述，名称与断言不一致时名称必被裁。

## 2) 分点结论

### 件② 主论证：closed 枚举不可达成员的工业心智模型

| 项 | TS/ADT「诚实可达集」惯例 | protobuf/GraphQL 契约面惯例 | 6F 账本语境 |
|---|---|---|---|
| closed 联合中不可达成员 | 收窄到实际构造集；never 穷尽守卫才有判力（词表有永不可达成员=穷尽检查对该成员恒空转） | 无既有值流出时删值是安全变更；删除后用 reserved 防复用号/名，非保留死成员 | suppressed_facets 内部投影面无外部消费者（词表非 wire format） |
| 「预留成员」合法性 | 仅开放 SDK 场景合法（显式开口模型非顺手保留） | GraphQL 加 enum value=breaking-adjacent，预留=把 breaking 风险留给自己 | D-095④ reserved 机制仅限外部输入面且 cap≤2 |
| 删除成本 | 删后加回=普通 additive 非破坏 | protobuf 删除值再复用号才危险——6F 词表是字符串字面量无编号可占 | D-136② 只说「复用 D-126③ 词表」未锁成员全集 |

关键判定链：
1. **(ii) 保留全词表与 D-095① 正面冲突**——「内部常量集超枚举成员默认删除（删除派域内占优）」；not_applicable 成员正是内部常量集超枚举成员，立法场景=纯内部 read-model 面不满足 D-095④ reserved 唯一合法域（外部输入面）。保留=账本明文禁止的「内部防万一」。
2. **(ii) 与 CONTEXT Reason Code 词条冲突**——Avoid 行逐字「预防性预登记未验判据码（CA1700 判词=死分支+文档谎言）」；永不可达=死分支，宣称三成员产出两成员=文档谎言。
3. **(i) 不与 D-126③ 冲突**——miss 四类词表服务查询语义层（not_applicable 在 miss 态/card_type 枝活跃可达）；D-136② 复用=文法来源非成员集恒等。D-136② 原文括号本就写「new_file/insufficient_history→not_applicable 族」——「族」字暗示子集引用。
4. **TS/ADT 佐证**：discriminated union 判力=新成员落进消费面才报 never 缺失；词表含不可达成员时 `failure as SuppressedFacetReason` 断言转换掩盖可达集缩窄——收窄后未来新枝产出第三原因码时编译器能 exhaustiveness 拦截。
5. **protobuf 惯例正确映射**：reserved=外部 wire format 防复用机制；6F 词表无序列化编号无历史值流出（preview 0.x、golden 可再生），删后加回=普通 additive（D-104④「加码非破坏」支持）。

**落法建议**：词表改 `'new_file' | 'insufficient_history'`＋行尾注释（「D-126③ 词表可达子集——not_applicable 仅 miss/card_type 层可达；新失败枝须扩此集」），D-136 行挂 scoped 注记一行。

### 件① 论证：勘误封账
- 账本内文法先例齐全：D-139① 收口节四行登记（correction 留档义务）、D-138② known-gaps 如实登记、D-045「不动原文另立注记」文法。工业侧 errata 惯例=小错误不撤回原文、单独登记并链接。
- 收口节补一句「F9 emitted 203→197：±6 差集归因于 skipped 披露机制落地前后观测时点差异，机制落地后 dirty-facts=197 复扫吻合，非缺陷，勘误封账」。不立票——D-139②「一行规约不立票」文法。

### 件③ 论证：标签名实相符
- 账本立法：D-094③「断言文本匹配先剥注释再匹配……名声称可见面⇒检查物须在可见面」；D-094①(c) 欺诈类（名不副实）→修检查面；R32-V2/R33-P1 已两次同型纠正，本次第三次。
- 推荐改标签措辞非扩断言：file-card.ts:241 注释「两枝补齐（pin 枝既有）」实义=「本枝新增、pin 枝既有」——标签照抄注释省略表述但断言只验新枝。扩第二枝断言=超 D-135「禁卫生组升格」边界。
- 外部惯例（paulbellamy 全文核验）：test name=实现第三份描述，三份描述不一致时名称与断言不一致→名称必被裁。

## 3) 与账本 current 决策的显式冲突核查

| 拟案 | 冲突点 | 定性 |
|---|---|---|
| 件② (ii) 保留全词表 | 与 D-095①「内部超枚举成员默认删除」＋D-095④「内部防万一 YAGNI」＋CONTEXT Reason Code Avoid「预防性预登记死分支」正面冲突 | 若选 (ii) 须显式 revised D-095（不可静默） |
| 件② (i) 收窄 | 与 D-126③ 无冲突（成员集≠文法来源引用）；需 D-136 行挂 scoped 注记 | 零 revised（注记文法成例：D-123⑤/D-125/D-128⑤ 先例） |
| 件① 勘误一行 | 无冲突；D-138②/D-139① 文法同构 | 零风险 |
| 件③ 标签收窄 | 无冲突；D-094③ 名↔检纪律执行件 | 不修反而与 D-094①(c) 类冲突（放着不动=容忍名不副实存续） |

## 4) 来源清单

- protobuf.dev/best-practices/dos-donts（Official：删 enum value→reserve 防复用；加法演进惯例）
- graphql governance-versioning（Official：移除/改名 enum value=breaking change；预留=breaking 风险留给自己）
- graphql spec §4 Introspection（Official：deprecation 两段生命周期非预留不删）
- qabattle.com typescript-exhaustive-union-compile-tests（Comparative：never 穷尽守卫判力来源；开放域须显式建模非顺手保留）
- paulbellamy.com testing-with-intent-9-descriptive-test-naming（Community：test name=第三份描述，与断言冲突时名称必输）
- medium.com/@sanhdoan protobuf reserved/deprecated 实战（Community：复用号生产事故；reserved=wire format 前提）
- victoriametrics.com go-protobuf-basic（Community：二进制兼容语境 reserved 佐证）
- graphql-wg OptInFeatures RFC（Official 摘要级：experimental→stable→deprecated→removed 生命周期）

## 5) 信息缺口

- 期刊级 errata 原文（pkp/w3.org/SO 均 403）——以搜索摘要+账本既有 PCAOB/ISO 先例补位，不作独立结论源。
- Tavily 引擎超限未参与（AnySearch+Exa 双引擎已达成配额）。
