# R34-Q4 调研题面（atomcode）

仓库 D:\Aworker\6F 是 spec-level 工程内容审计产品（五尺度审计；决策账本 142 条 D 记录；preview 0.x）。

## 问题

R33 收口交接遗留三件「口径卫生」小裁，拟合并一批处置（D-139 轻规约文法，不立票不设守卫）：

- **件① F9 emitted 203→197 勘误**：R32 审计呈报的 ±6 差集已归因——skipped 披露机制落地后 dirty-facts=197 复扫吻合，系观测时点差异非缺陷。拟在收口节补一句勘误封账。
- **件② SuppressedFacetReason 词表的 'not_applicable' 不可达成员**：engine/src/fact/file-card.ts:40 `type SuppressedFacetReason = 'new_file'|'insufficient_history'|'not_applicable'`——但 binary/generated 态走 `card_type:'not_applicable'` 整条路（kernel.suppressed_facets=[]），原因码仅在 new_file/insufficient_history 失败枝产生；'not_applicable' 是断言永不可达的幽灵成员。两读法：(i) 收窄到可达集 {new_file, insufficient_history}＋注释（closed 枚举=诚实可达集；D-136②「复用 D-126③ 词表」指词表来源非全量成员）；(ii) 保留全词表（前向兼容：未来新失败态走抑制路径免改词表）。
- **件③ 83-check.mjs B2 标签超断言力**：`t('B2 F6 集内 not_tracked_at_sha 补 available_head_shas（两枝补齐）'`——标签称「两枝补齐」而断言只验一枝覆盖面；拟措辞收窄到断言实际覆盖（R32-V2 44-check G6 与 R33-P1 标签名实不符同型教训，第三次出现前纠正）。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（重点 D-136② suppressed_facets closed 枚举与原因码复用 D-126③ 词表的立法原文、D-126 miss 四类词表、D-095 closed 枚举成员级对账纪律、D-139 轻规约、R32-V2/R33-P1 标签名实不符先例、守卫标签断言力匹配相关条款）、docs/adr/ 全部 ADR（重点 0022 quarantine/0023 micro-b/0018 编年）、CONTEXT.md 全部词条（重点 Reason Code 受控词表/Suppressed Facets/Strict Quarantine）；
2. 工业界成熟落地的心智模型（重点）：closed/tagged union 类型中「不可达成员」的处置惯例——TypeScript/Rust enum 完备性 vs 诚实可达集之争（exhaustiveness checking 惯例、serde/ADT 标签域设计）、API/契约面「为未来预留枚举成员」的反模式论证（GraphQL enum 演进规约、protobuf reserved 字段惯例 vs「不可达值」清理）、断言标签名实相符纪律（测试标签 overclaim 的处置惯例、pytest/jest 描述与断言匹配实践）、勘误/errata 的轻量登记惯例；
3. 给出推荐与理由，显式指出与账本任一 current 决策的冲突点（若有——冲突则该 D-xxx 需标 revised 并呈报新决策，禁止静默改向）。
