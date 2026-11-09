# 决策档案（退役记录 · 只读）

**本目录是非权威、只读的历史档案。新决策不得写入这里，也不得在此新增 `D-NNN` 编号。**

本档案不作判定依据：现行决策与术语写在哪见 [`docs/authority.md`](../../authority.md)（唯一成文处），此处只留这一行指针。

本目录存在的唯一理由：仓内代码注释、工作流注释与历史文档里仍留着大量 `D-NNN` / `A-NNN` / 旧票号 `#NN` / `.scratch/...` 形态的历史编号（治理轮审计按 1169 处 `D-NNN` 引用计数）。这些编号的记录在 `e356581e`（治理整理批）随 `.scratch/` 一起移出版本控制，读者因此无法从当前目录解析任何一条历史引用。这里把它们固定回**可解析**状态——只作解析入口，不作判定依据。

## 文件

| 文件 | 内容 | 来源 |
|---|---|---|
| [`architecture-recovery-ledger.md`](architecture-recovery-ledger.md) | 架构恢复期问题条目记录（`A-001`–`A-099`，含来源 `D-NNN` 对应列） | `2e6061be:.scratch/architecture-recovery/decision-ledger.md`（445 行 / 175,694 B） |
| [`macro-audit-ledger.md`](macro-audit-ledger.md) | 产品决策记录（`D-001`–`D-220`，逐轮深入讨论判定与收尾去向） | `2e6061be:.scratch/macro-audit/decision-ledger.md`（2,159 行 / 814,314 B） |
| [`ticket-index.md`](ticket-index.md) | 索引层：`D-NNN` / `A-NNN` / 旧票号 `#32`–`#94` → 引入 commit、记录行、现行载体 | 由上述两份记录 + `2e6061be:.scratch/architecture-recovery/BACKLOG.md` 一次性提取生成 |

两份记录是**原文逐字节恢复**，未改写、未重排、未删节：

```
git hash-object docs/archive/decisions/macro-audit-ledger.md            # a60176de7feacfb92db3dd1f3cf5ca382438380d
git hash-object docs/archive/decisions/architecture-recovery-ledger.md  # a03f699c1813bea26f75ef831c1dcd4e7b7f7e1c
git rev-parse 2e6061be:.scratch/macro-audit/decision-ledger.md
git rev-parse 2e6061be:.scratch/architecture-recovery/decision-ledger.md
```

两侧 blob 号相同即为零改写。记录里残留的 `.scratch/...` 路径、轮次自造词与已退役检查脚本名**按原样保留**——它们是原始现场的一部分，不做现代化清洗。

## 怎么读一条历史引用

1. **`D-NNN` / `A-NNN`** → 查 [`ticket-index.md` §1 / §3](ticket-index.md) 取引入 commit、记录行状态与去向，再到对应记录原文读该行全文。带圈号后缀（如 `D-053①`）是同一决策的子项，按主干号解析。`D-002`／`D-008`／`D-014`／`D-019`／`D-022` 五条例外：§1 载体列对它们只给机械解析（含已删 ADR），现行去向按 [ticket-index.md §7.1](ticket-index.md) 的解析表读。
2. **裸 `#NN`** → 先看 **[撞号警示](ticket-index.md#撞号警示)**。`#32`–`#94` 在本档案语境指 **旧 BACKLOG 票号**；`#38`–`#47` 现在同时是治理轮的 GitHub issue 号，含义完全不同。代码注释、工作流注释、`NN-check` 与 `.scratch` 路径旁的 `#NN` 属旧 BACKLOG；治理轮文书里的 `#NN` 属 GitHub issue。
3. **`.scratch/...` 路径** → 该目录已于 `e356581e` 移出版本控制并加入 `.gitignore`，当前目录里没有。逐票档案按 `git show 2e6061be:<旧路径>` 取回，规则见 [ticket-index.md §5](ticket-index.md)。
4. **冻结件里的本机绝对路径** → 见 [ticket-index.md §6](ticket-index.md)：`engine/test/fixtures/contracts/` 的 38 期冻结件中，原始采集现场的若干件含本机盘符锚，不可移植、不作基准锚。逐件规则只在 §6 登记，本节不复述计数（同一事实不两写）。
5. **ADR 旧号与历史链接** → 索引中指向 `docs/adr/0001-*.md` 等旧文件的链接是历史记录，旧 ADR（0001–0027）已退役，正文只在 git 历史中。可通过 `git show <历史提交>:docs/adr/<文件名>` 回头查阅原文。

## 边界（非目标）

- 记录所载状态（`current` / `revised` / `deferred` / `closed`）是**当时的判定记录**，不等于现行有效；冲突时以本文件首行指针所列的权威载体为准。
- 索引的「现行载体」列是按记录点名物在本仓文件清单里做的解析，不是重新判定的去向；`unmapped` / `去向未载` 只表示解析链在本仓断掉，不表示该决策被推翻。
- [ticket-index.md §7.1](ticket-index.md) 是解析补记，不是新判定；规则与边界写在该节首段，此处不重述。
- 5 个形似 `D-NNN` 的记号（`D-000` / `D-391` / `D-393` / `D-394` / `D-403`）经核为假样本占位与检查脚本断言标签，**均不出现在两份记录的任何行里**，故不建索引行；逐处现场见 [ticket-index.md §4](ticket-index.md)。
- 本档案固定在 `2e6061be` 快照。它不随后续轮次增长：新决策进 `docs/spec.md` 或 `docs/adr/`，新架构取舍用 ADR 号或 spec 段号指称。
- 防复发检查脚本（校验仓内 `D-NNN` ⊆ 本索引、且该集合只减不增）不在本票交付范围，另票承接。
