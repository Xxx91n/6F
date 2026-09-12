# 单仓 + 子目录 + but 分支（更正 ADR-0010 的「另起工程仓」）

**Status: accepted（2026-09-12）｜Supersedes: ADR-0010**

## Context
- ADR-0010 将工程实现规划为「另起工程仓」（独立 git 仓），并在 D:/Aworker/6F-impl 落地了 walking skeleton。
- 用户 2026-09-12 更正：该架构错误——正确形态是 **6F 为默认项目文件夹（单仓）**，其余内容在子目录；并行隔离用 **but 分支**（而非独立仓 / 工作树）。
- 理由：单仓 + 子目录让 spec / 决策 / 契约与实现同处一个 git 历史，契约衔接无需跨仓；but 分支天然提供并行隔离。

## Decision
1. **单仓**：D:/Aworker/6F 为默认项目文件夹，是唯一 git 仓。
2. **子目录**：实现内容位于 6F/engine/（原 6F-impl 内容整体迁入）；spec / 决策 / 契约位于 CONTEXT.md / docs/ / .scratch/。
3. **分支隔离用 but**：并行工作通过 but 分支实现，不引入独立仓或 git worktree。
4. **ADR-0010 superseded**：其「另起工程仓」被本条更正；其 Decision 2「本仓不承载产品实现源码」亦被更正——单仓内 engine/ 子目录承载实现；其余内容（版本化契约衔接 / walking skeleton 验收）保留。
5. 6F-impl 独立仓已删除（内容已迁入 6F/engine/，迁后 build/smoke 6/6 PASS）。

## Consequences
- 正面：单一 git 历史；契约与实现同仓，无跨仓 drift；but 分支即隔离。
- 负面：单仓体积与 CI 范围变大 → 用子目录 path filter 缓解。
- 不改：ADR-0003 商业边界；walking skeleton 验收（编译/打包/测活/每平台 test 闭环）。

## References
- 被 supersede：ADR-0010
- ledger D-015（current）；D-014（revised）
- 实现：6F/engine/
