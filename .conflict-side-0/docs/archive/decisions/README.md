# 决策档案（退役账本 · 只读）

**本目录是非权威、只读的历史档案。新决策不得写入这里，也不得在此新增 `D-NNN` 编号。**

本档案不作裁决依据：现行决策与术语的落点见 [`docs/authority.md`](../../authority.md)（唯一成文处），此处只留这一行指针。

本目录存在的唯一理由：仓内代码注释、workflow 注释与历史文档里仍留着大量 `D-NNN` / `A-NNN` / 旧票号 `#NN` / `.scratch/...` 形态的历史指纹（治理轮审计按 1169 处 `D-NNN` 引用计数）。这些编号的账本在 `e356581e`（治理收敛批）随 `.scratch/` 一起移出版本控制，读者因此无法从工作树解析任何一条历史引用。这里把它们钉回**可解析**状态——只作解析入口，不作裁决依据。

## 文件

| 文件 | 内容 | 来源 |
|---|---|---|
| [`architecture-recovery-ledger.md`](architecture-recovery-ledger.md) | 架构恢复期问题条目账（`A-001`–`A-099`，含来源 `D-NNN` 咬合列） | `2e6061be:.scratch/architecture-recovery/decision-ledger.md`（445 行 / 175,694 B） |
| [`macro-audit-ledger.md`](macro-audit-ledger.md) | 产品决策账（`D-001`–`D-220`，逐轮 Grill 裁定与收口去向） | `2e6061be:.scratch/macro-audit/decision-ledger.md`（2,159 行 / 814,314 B） |
| [`ticket-index.md`](ticket-index.md) | 索引层：`D-NNN` / `A-NNN` / 旧票号 `#32`–`#94` → 引入 commit、账本行、现行载体 | 由上述两份账本 + `2e6061be:.scratch/architecture-recovery/BACKLOG.md` 一次性提取生成 |

两份账本是**原文逐字节恢复**，未改写、未重排、未删节：

```
git hash-object docs/archive/decisions/macro-audit-ledger.md            # a60176de7feacfb92db3dd1f3cf5ca382438380d
git hash-object docs/archive/decisions/architecture-recovery-ledger.md  # a03f699c1813bea26f75ef831c1dcd4e7b7f7e1c
git rev-parse 2e6061be:.scratch/macro-audit/decision-ledger.md
git rev-parse 2e6061be:.scratch/architecture-recovery/decision-ledger.md
```

两侧 blob 号相同即为零改写。账本里残留的 `.scratch/...` 路径、轮次黑话与已退役守卫名**按原样保留**——它们是原始现场的一部分，不做现代化清洗。

## 怎么读一条历史引用

1. **`D-NNN` / `A-NNN`** → 查 [`ticket-index.md` §1 / §3](ticket-index.md) 取引入 commit、账本行状态与去向，再到对应账本原文读该行全文。带圈号后缀（如 `D-053①`）是同一决策的子项，按主干号解析。`D-002`／`D-008`／`D-014`／`D-019`／`D-022` 五条例外：§1 载体列对它们只给机械解析（含已删 ADR），现行去向按 [ticket-index.md §7.1](ticket-index.md) 的解析表读。
2. **裸 `#NN`** → 先看 **[撞号警示](ticket-index.md#撞号警示)**。`#32`–`#94` 在本档案语境指 **旧 BACKLOG 票号**；`#38`–`#47` 现在同时是治理轮的 GitHub issue 号，语义完全不同。代码注释、workflow 注释、`NN-check` 与 `.scratch` 路径旁的 `#NN` 属旧 BACKLOG；治理轮文书里的 `#NN` 属 GitHub issue。
3. **`.scratch/...` 路径** → 该目录已于 `e356581e` 移出版本控制并加入 `.gitignore`，工作树里没有。逐票档案按 `git show 2e6061be:<旧路径>` 取回，口径见 [ticket-index.md §5](ticket-index.md)。
4. **冻结件里的本机绝对路径** → 见 [ticket-index.md §6](ticket-index.md)：`engine/test/fixtures/contracts/38-macro-c-facts.jsonl` 的 30 处 `D:/Aworker/...` 属原始采集现场，不可移植，不作基准锚。

## 边界

- 账本所载状态（`current` / `revised` / `deferred` / `closed`）是**当时的裁定记录**，不等于现行有效；冲突时以本文件首行指针所列的权威载体为准。
- 索引的「载体」列是按账本点名物在本仓文件清单里做的解析，不是重新裁定的去向；`unmapped` / `去向未载` 只表示解析链在本仓断掉，不表示该决策被推翻。
- [ticket-index.md §7.1](ticket-index.md) 是解析补记，不是新裁定；口径与边界写在该节首段，此处不重述。
- 5 个形似 `D-NNN` 的记号（`D-000` / `D-391` / `D-393` / `D-394` / `D-403`）经核为夹具占位与守卫断言标签，**均不出现在两份账本的任何行里**，故不建索引行；逐处现场见 [ticket-index.md §4](ticket-index.md)。
- 本档案钉死在 `2e6061be` 快照。它不随后续轮次增长：新决策进 `docs/spec.md` 或 `docs/adr/`，新架构取舍用 ADR 号或 spec 段号指称。
- 防复发守卫（校验仓内 `D-NNN` ⊆ 本索引、且该集合只减不增）不在本票交付面，另票承接。
