# examples/first-report — 6F 自己审自己的首报真件（顺利一份、失败一份）

> 这是真货，不是摆拍：本目录四件是 **6F 拿自己的仓真跑一遍 Macro-B 出来的审计报告**，不是合成的假数据，也不是手写编出来的样子。
> **冻结时点：这份读数只说明当时那一刻**：数字反映的是生成那天（2026-09-13）的仓状态和那时候的判据版本——请当成一张旧照片来看，**千万别当成「现在的读数」**。

## 四件是什么

| 文件 | 内容 |
|---|---|
| `23-first-report.md` | Macro-B 首报，给人看的形态（顺利那条路，overall_verdict = unsupported） |
| `23-first-report.json` | 同一份报告的机器读版本（回执、裁决块、引文校验都在里面） |
| `23-first-report-failure.md` | 失败那条路的演示，给人看的形态（降级产物 ⚠ unverified，overall = insufficient） |
| `23-first-report-failure.json` | 同一份报告的机器读版本 |

## 这份报告是怎么来的（生成溯源）

- **真跑出来的**：对 6F 自己的仓真跑了一遍 Macro-B（自己审自己那种跑法），不是合成的假数据，也不是事后补写的示意文本；顺利那两件是实跑产物原样复制过来的。
- **当时的提交**：`fc00d458e215cc9a7a26af81626dec8712622821`（subject_ref = `6F@fc00d458…`；回执上钉了提交和树两个锚：commit + tree `6f405cfc2ce5…`）。
- **生成时间**：`2026-09-13T14:31:09+08:00`（generated_at；两张回执 `RCP-9d20125ad0976c86` / `RCP-1f603ed7b3032f0a`）。
- **重生成命令**：`node .scratch/architecture-recovery/reports/23-first-report.mjs`——这个脚本审的是 **HEAD**，所以得把工作树切到当时那个提交 `fc00d458…` 再跑，读数才复现得出来；判据版本是 `22-criteria-pre-registration` 那份事先写好、跑完不许改的快照。

## 哪些地方要说实话

- **失败那两件是怎么来的**：同一份实跑报告，经 `degradeReport(FP-2)` 确定地降级渲染出来——演示的是「docs/adr 这一路一条事实都没采到 → 主前提判不了 → 正式提出要补数据 → 回执标 ⚠ unverified」这套降级形态，**不是真出过一次采集事故的记录**。
- **为什么判 unsupported 算数**：TC-2 判红（ADR 里 Status/Date 缺失率 84.62%，超过事先定下的 0.50 这条线）是这套判据下站得住的裁定，不是管线坏了；正对照、负对照全 PASS，说明管线活着。
- **四件和后来的契约对不上**：四件生成于 2026-09-13，比 `preview_disclosure` 披露块这套契约（2026-09-16 才第一次做出来）早——机器读那两份没有 `preview_disclosure` 字段，这是时间先后的事实，不是漏了什么；演示用的披露块实例见 `engine demo` 合成数据出的产物。
- **原件放在哪**：原件复制在 `engine/test/fixtures/contracts/`（是复制，不是搬走）；CI 比的是本目录这四件——重新渲染一遍再逐字节对，不一致就红，所以要改这些件只走 PR 审查（禁止自动重新生成直接进 main）。

## CI golden 校验与更新纪律

- **怎么核对**：`.github/workflows/golden-ci.yml` 的 `golden` job 会在 CI 里把当时的工作树拼出来，然后逐字跑上面那条重新生成命令，产物与本目录四件逐字节比，不一致就 fail（非零退出，差异摘要进 job 日志）。拼工作树的办法：仓里的 `23-frozen-fc00d458.bundle` 把当时那个提交送进去（GitButler 快照，不在推上去的 ref 上）→ `git worktree` → 再按当时的文件状态补上 `23-first-report.mjs`/`engine/src/report/generate.ts`（e39468c 入库那版）和 `.scratch` README 这些签名覆盖（`23-frozen-readme-overlay.md`——当年那些脏文件没入库、已经丢了，top-20 关键词签名是拿 `23-facts.jsonl` 一个词一个词数回来的）。
- **更新只走 PR 审查**：本目录四件和 `engine/fixtures/golden/` 要更新，一律由人重新渲染后随 PR 提交、进审查；**CI 里没有 commit/push/自动回写这一步**，diff 红了由人来修，禁止自动重新生成直接进 main（跟 Jest/Vitest 快照的老规矩一样：入库，走代码审查）。
- **正确的更新法**：把工作树切到当时那个提交的状态，跑上面那条重新生成命令，核对读数为什么会变（判据或输入变了，得在 PR 说明里讲清楚），然后同步替换本目录四件和 fixtures 里的原件，再开 PR。engine 那边的 golden 对应 `cd engine && npm run demo:golden`（definitions 改了也是同一套规矩，走 PR）。

来源：#43（这份样例的 golden CI）、A-048（CI 重新渲染再比对的执行记录）、D-030③（样例更新只走 PR 审查）、ADR-0017 / D-037②（预览说明块契约）。
