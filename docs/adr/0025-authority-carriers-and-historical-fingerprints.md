# 决策载体 = 三载体 + 历史指纹归档

- Date: 2026-10-26
- Status: accepted

## Context

`6626d08d` 删除了 `CONTEXT.md` 与 21 份现行 ADR（合计 896 行），提交信息声称"ADR 决策折进源码注释"，但 `engine/src` 实际只改了 +39/−39 行，全仓 `Design:` 注释 0 条。`docs/spec.md` 作为 AGENTS/README/CONTRIBUTING 共同声明的产品决策唯一权威，最后一节停在 2026-09-16（R7）。

结果是读者无法从 HEAD 判断任何一条决策是什么：130 个不同 D-code、1169 处引用没有仓内账本可解析；113 处 `ADR-xxxx` 引用指向已删除文件；仓内文档引用 #38–#94，而 GitHub tracker 只有 #1–#37。这不是一次内容错误，而是"权威声明可以静默漂移"的结构性缺口。

## Decision

决策载体恢复为三层，并设唯一成文处：

- `docs/spec.md` 管产品决策（范围、能力、用户可见契约）；
- `docs/adr/` 管架构决策（Context / 替代方案 / 后果）；
- `GLOSSARY.md` 管术语。
- `docs/authority.md` 是"决策与术语分别在哪"的唯一成文处；AGENTS、README×2、CONTRIBUTING、engine/README 只留一行指针。
- 从 `6626d08d^` 恢复 21 份现行 ADR；0002/0010/0015 保持删除（0010 已由 0011 supersede）。
- 约束点使用单行 `Design: <一句话约束> — ADR-NNNN` 指针，正文不复制。
- 两份退役决策账本与旧票号索引归档到 `docs/archive/decisions/`，声明非权威、只读；代码中的历史指纹保留，但新决策不再新增 D-code，改用 ADR 号或 spec A-code。

## Considered Options

- **只写 `Design:` 注释、不恢复 ADR**：ADR 的 Context / 替代方案 / 后果无法在单行注释里承载；同一决策会散落在多文件，违反"一处只有一份"。
- **单一 `docs/spec.md` 载体**：架构细节会把 spec 撑成混合体，且代码局部约束不适合放进产品范围文档。
- **只声明"历史指纹，git 历史可查"**：读者仍需考古；130 个 D-code、1169 处引用没有可解析入口。
- **全量改写 1169 处引用**：宽重构覆盖测试与冻结件，收益只是注释好看。

## Consequences

- 读者可以从 `docs/authority.md` 一处找到决策与术语的落点。
- `docs/archive/decisions/` 只承担历史可解析性，不参与现行裁决；新决策不得写入该目录。
  - **勘误（2026-10-27 / tracker #29）**：上一条「不参与现行裁决」只在该目录**不承载判据**这一层成立。claim 支撑层的实情（引擎运行时会 deref 归档取引文参与引文评级）机理与边界记于 [`ADR-0027`](0027-verification-surface-node-floor-and-docs-authority-guard.md) 的勘误二与口径补记，本条不复述。归档目录仍不写新决策、仍不承载判据。
- 文档权威需要机器守卫（见 ADR-0027），否则同一漂移会复发。
- 本轮新增 ADR-0025 / 0026 / 0027，编号接在恢复的 0024 之后。
