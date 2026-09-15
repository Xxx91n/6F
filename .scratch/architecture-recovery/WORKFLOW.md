# Workflow: 架构恢复（从巡检到收口 / architecture-recovery）

> **生成依据**：基于 [ask-matt SKILL.md](../../../../C:/Users/Administrator/.agents/skills/grill/engineering/ask-matt/SKILL.md) 主流程 + on-ramp / Phase boundaries + GitButler skill + 本仓库 AGENTS.md / 8 项硬要求 + grill-with-docs 实战经验
> **生成日期**：2026-09-11
> **兼容性声明**：本文件是 ask-matt 主流程在本仓库的本地化操作手册；与 skill 本体冲突时 **以 skill 为准**（按 ask-matt SKILL.md 规定）。本仓库偏离 skill 的部分见 §0 偏离点清单，已获用户批准方生效。
> **工作流类目**：架构恢复（architecture-recovery）—— 属 ask-matt 中"on-ramp / triage / codebase-health"复合范畴，从巡检触发到 PR 收口的完整闭环。

---

## 0. 偏离点清单（10 条本地适配）

基于 ask-matt SKILL + GitButler skill + 本仓库 AGENTS.md，下表 10 项是本仓库运行 skill 时叠加的本地规则。skill 本体未改；本文件如与 skill 本体冲突以 skill 为准。

| # | 偏离点 | ask-matt SKILL 原状 | 本仓库本地适配 | 对 WORKFLOW 的影响 |
|---|---|---|---|---|
| D-1 | Subagent 派发 = 人工触发 | Phase boundaries 把 Subagent 列为隐式可选项 | 多窗口人工派发（大脑 Agent 输出任务 + 人工开窗） | 每个 Phase 标注"是否触发子窗口" |
| D-2 | Research = atomcode | 用 `/research` background agent | `atomcode -p "..."` via `ctx_batch_execute`（concurrency:1, timeout:600000） | 调研环节固定走此路径；同会话串行（共享配额） |
| D-3 | VCS = `but` CLI | 不规定 VCS | GitButler 替换所有 git 写命令；每 session 独立 branch | 所有 commit / push / branch / rebase / merge 走 `but *` |
| D-4 | 文件写入 = Node.js | 不规定文档写入方式 | `mcp__context-mode__ctx_execute` (language=javascript, fs.writeFileSync) | 所有 .md / .json / .txt 写入走此路径 + 字节级回读（per windows_file_integrity_protocol） |
| D-5 | 禁止 mid-task 许可询问 | Phase boundaries 隐含"可问" | AGENTS.md "DO NOT STOP TO ASK"；只在 destructive / irreversible / credential-gated / 外部生产 暂停 | Phase 内继续；Phase boundary 默认 Continue，例外才停 |
| D-6 | 决策账本必须维护 | 不规定决策记录形式 | `.scratch/{slug}/decision-ledger.md` 每个确认结论当场落盘；防丢（压缩/compact/handoff 前必检） | grill 决策流程强制落账本 |
| D-7 | ctx 工具优先 | 不规定工具栈 | `ctx_*` > zcode built-in；file mutation 例外（用 Node.js）；short bounded shell 例外（可 Bash） | shell / 分析 / 索引 / 抓取走 ctx |
| D-8 | Lessons 持续追加 | 不规定教训记录形式 | 每次爆炸 / 返工 / skill 失效 必须 append 到本文件 §4 Lessons 段 | 本文件 §4 段持续填，不可随会话蒸发 |
| D-9 | Skill 命名 = `$` 前缀 | ask-matt 用 `/skill-name` | 用户习惯 `$skill-name`（本文件统一使用） | 引用 skill 用 `$skill-name` 格式 |
| D-10 | Phase boundary 偏好顺序 | ask-matt 5 选项无优先级 | 本仓库偏好：Continue > Subagent(人工派发) > Handoff(子目录/harness) > Compact > Clear | §3 决策树标注本仓库偏好 |

---

## 1. 流程图（大脑 / 子窗口双轨）

```
                +-----------------------------+
                |  Phase 1 巡检 (Inspection) |   <- 大脑 Agent 主轨
                |  入口: 用户/大脑显式触发    |
                +-------------+---------------+
                              |
                              v
                +-----------------------------+
                |  Phase 2 排查 (Diagnosing)  |
                |  入口: inspection 报告      |
                +-------------+---------------+
                              |
                              v
                +-----------------------------+
                |  Phase 3 方案 (Plan)         |
                |  grill -> to-spec -> tickets|
                +-------------+---------------+
                              |
                              v
                +-----------------------------+
                |  Phase 4 实施 (Implement)   |
                |  implement -> tdd + review  |
                +-------------+---------------+
                              |
                              v
                +-----------------------------+
                |  Phase 5 验证 (Verify)       |
                |  code-review 双轴           |
                +-------------+---------------+
                              |
                              v
                +-----------------------------+
                |  Phase 6 收口 (Closeout)     |
                |  but pr new + Lessons       |
                +-----------------------------+

  [子窗口派发触发点] D-1 适用：Phase 2 排查 / Phase 3 spec 调研 / Phase 4 ticket 实施
                   派发 = 大脑 Agent 输出任务清单 + 人工开窗 + 子窗口回报
```

---

## 2. 6 个 Phase 详细

### Phase 1 — 巡检（Inspection）

- **入口**：用户显式触发（"巡检一下" / "看看 X 有没有烂"），或大脑 Agent 在心跳/排程中发现异常
- **入口技能**（择一）：
  - `$diagnosing-bugs` —— 已知某处坏了，定位 bug 来源
  - `$improve-codebase-architecture` —— 整体扫一遍，挑出可深化点
- **产出物路径**：`.scratch/architecture-recovery/{YYYY-MM-DD}-inspection.md`
- **工具链**：
  - `but status -fv` —— 仓库当前状态（commit / branch / dirty files）
  - `but diff` —— 未提交改动
  - `ctx_execute_file` / `ctx_execute` —— 沙箱内 grep / 行数 / 结构分析
  - `atomcode-research` —— 工业界对标（仅当怀疑有现成心智模型可借时）
- **退出条件**：
  - inspection 报告锁定 1+ 个可疑点（bug / 架构债 / 性能 / 安全）
  - 每个可疑点标注：严重度（high/med/low）+ 触发面（哪段代码 / 哪个 PR / 哪段历史）+ 假设根因
- **子窗口派发（D-1）**：通常不需要子窗口；巡检是大脑 Agent 一次性扫读
- **决策账本（D-6）**：本次巡检的"严重度排序"作为 D-NNN 入 ledger（如 D-001）

### Phase 2 — 排查（Diagnosing）

- **入口**：inspection 报告锁定可疑点
- **入口技能**（择一）：
  - `$diagnosing-bugs` —— 硬 bug，需要紧反馈环（一个能跑红的命令）
  - `$grill-with-docs` —— 术语/心智/架构问题，需锐利化后再定位
- **产出物路径**：`.scratch/architecture-recovery/{YYYY-MM-DD}-diagnosis-{id}.md`（id = 可疑点序号）
- **工具链**：
  - `but log` / `but show <id>` —— 历史 blame
  - `git log -p` / `git blame` —— 只读检查
  - `ctx_execute` —— 静态分析 / pattern 匹配
  - `atomcode-research` —— 仅当需要外部心智模型佐证（如某错误码在工业界的标准含义）
- **退出条件**：
  - 根因锁定（写入 diagnosis 报告 + ledger D-NNN）
  - 给出"修复的代价 / 不修复的风险"对比
- **子窗口派发（D-1）**：
  - **可以派**：当多个可疑点彼此独立、且每个需要深入追历史时
  - **不派**：当根因相互耦合、需要交叉分析时（大脑 Agent 串行处理，避免上下文切割）
- **决策账本（D-6）**：根因条目入 ledger；修复方案只入 diagnosis 报告（不入 ledger，避免提前锁定）

### Phase 3 — 修复方案制定（Plan）

- **入口**：diagnosis 报告锁定根因
- **入口技能**（按顺序）：
  1. `$grill-with-docs` —— 锐利化修复方案中的术语 / 心智 / 边界（任何模糊点都先 grill）
  2. `$to-spec` —— 把 grill 出的方案固化成 spec（写入 .scratch/{slug}/spec.md）
  3. `$to-tickets` —— 把 spec 切成可派工的 tracer-bullet tickets（每个标 blocker）
- **产出物路径**：
  - spec：`.scratch/architecture-recovery/spec.md`
  - tickets：`.scratch/architecture-recovery/issues/{NNNN}-{slug}.md`（每个 ticket 一个文件）
  - ADR（如涉及 hard-to-reverse 决策）：`docs/adr/{NNNN}-{slug}.md`（per ADR 三判据）
- **工具链**：
  - `ctx_execute` / `ctx_search` —— 召回知识库 + 本地分析
  - `atomcode-research` —— 方案调研（如"用什么库做 X"）
  - 决策 ledger —— 每个确认结论当场落盘（per D-6）
- **退出条件**：
  - spec.md 自洽（无未决问题）
  - 所有 ticket 有 blocker 链（无孤立 ticket）
  - 所有 ADR 满足三判据（hard to reverse / surprising / real trade-off）
  - grill 退出（per grill 协议：账本条目数 + 覆盖率自评 + 用户拍板）
- **子窗口派发（D-1）**：
  - **可以派**：方案调研（atomcode-research 占用大量上下文，可派子窗口做调研回报）
  - **不派**：grill / 决策本身（grill 是人类 × Agent 对话，必须在大脑 Agent 主轨）

### Phase 4 — 修复实施（Implement）

- **入口**：tickets 全部 blocker 解除（每个 ticket 可单独被捡起）
- **入口技能**：
  - `$implement` —— 每个 ticket 走 `/implement`（内部驱动 `/tdd` 红绿循环 + `/code-review` 双轴）
- **产出物路径**：
  - 代码改动：在仓库 worktree（每个 session 独立 `but` branch，如 `fix/{slug}-{ticket-id}`）
  - 每个 ticket 完成时：`but commit -b fix/{slug}-{ticket-id} -m "{ticket title}" <ids>`
  - 测试：写在对应源码旁的 `{name}.test.{ext}` 文件
- **工具链**：
  - TDD 循环（red / green / refactor）—— `$tdd` 驱动
  - `but commit -b <branch> -m <msg> <ids>` —— GitButler 写命令（D-3）
  - `ctx_execute` —— 跑测试 / lint / build
- **退出条件**：
  - 每个 ticket 都通过 `$code-review` 双轴（Standards + Spec）
  - 所有 ticket 完成、commit 落到独立 branch、push ready（但未 push，等 Phase 5 验证）
- **子窗口派发（D-1）**：
  - **应该派**：当 ticket 之间真正独立（如不同模块、不同文件集、无交叉依赖）
  - **不派**：当 ticket 之间耦合（如一个 ticket 的修改影响另一个 ticket 的代码）
  - **派发模式**：大脑 Agent 输出 ticket 列表 + 优先级，人工开 N 个子窗口，每个窗口完成一个 ticket
- **决策账本（D-6）**：实施中遇到 spec 未覆盖的边界决策 → 新增 D-NNN，触发 Phase 3 局部回灌

### Phase 5 — 验证（Verify）

- **入口**：所有 ticket 完成 + commit 落 branch
- **入口技能**：
  - `$code-review` —— Standards + Spec 双轴 review（针对整个 fix branch 的 diff）
  - 如 review 发现严重问题：触发 Phase 4 局部返工（per D-5 不暂停，直接返工）
- **产出物路径**：
  - verify 报告：`.scratch/architecture-recovery/{YYYY-MM-DD}-verify-{slug}.md`
  - 含：Standards 通过 / 失败清单 + Spec 满足度 + 残余风险 + Lessons 候选
- **工具链**：
  - `but diff fix/{slug}..main` —— 整 branch diff
  - `ctx_execute` —— 跑完整 test / lint / build / coverage
  - `atomcode-research` —— 验证方案与工业界最佳实践对齐（可选）
- **退出条件**：
  - verify 报告通过（Standards + Spec 都 OK，无 high 风险）
  - 残余风险已记录到 verify 报告（不阻塞 PR，但透明披露）
- **子窗口派发（D-1）**：
  - 通常不需要——verify 是大脑 Agent 一次性 review
  - 例外：review diff 极大（> 5000 行）时可派子窗口分段 review 汇总

### Phase 6 — 收口（Closeout）

- **入口**：verify 报告通过
- **入口技能**：
  - `but pr new fix/{slug} -m "..." -F body.txt` —— 创建 PR（per D-3）
  - PR 描述引用 spec.md + verify-report.md + 链接 issue tracker（如有）
  - 用户 / 维护者 review & merge
  - **merge 后**：
    - 追加 Lessons 到本文件 §4（per D-8，日期 / 事由 / 解决方案）
    - 清理 `.scratch/architecture-recovery/{slug}/` 临时文件（保留 spec.md 作为档案）
- **产出物路径**：
  - PR 创建：远程 PR URL
  - Lessons：追加到本文件 §4 段
  - 失败兜底：`but undo` 回退（per GitButler skill）
- **工具链**：
  - `but pr new` —— PR + 自动 push（per D-3）
  - `but undo` —— 失败兜底
  - `ctx_execute` —— 追加 Lessons 到本文件（D-4 + D-8）
- **退出条件**：
  - PR merged 或明确 reject（reject 也算闭环——记录到 Lessons）
  - Lessons 已落盘（per D-8 防蒸发规则）
- **子窗口派发（D-1）**：通常不派——收口是单人动作

---

## 3. Phase Boundary 决策树（本仓库偏好）

Phase 之间到达 boundary 时，按本仓库偏好顺序选：

1. **Continue**（默认）—— Phase 内未完成的工作继续；不开新上下文
2. **Subagent（人工派发）**—— Phase 内有可并行 / 可独立子任务时，按 D-1 派子窗口；大脑 Agent 接收回报
3. **Handoff** —— 跨 harness / 跨目录 / 跨同事 时，按 ask-matt `/handoff` 写 portable markdown
4. **Compact** —— context 接近 smart zone（~150k tokens）且下一阶段必须继承上下文时；compact 前必检决策账本落盘（per D-6）
5. **Clear** —— 跨会话且下一阶段无依赖时

**禁止的选项**：
- 不要用 `git *` 写命令（per D-3）
- 不要用 `apply_patch` 或 zcode built-in file-write（per D-4）
- 不要跳过 atomcode-research 直接拿搜索结果当结论（per D-2）
- 不要在 Phase 内暂停问"Should I proceed?"（per D-5）

---

## 4. Lessons（教训持续追加 / 不可蒸发）

> 每次爆炸 / 返工 / skill 失效 / skill 与本仓库约束冲突时，必须追加一行到此段。格式：日期 / 事由 / 影响 / 解决方案 / 引用 skill 段。
> 防蒸发规则（D-8）：口头承诺"下次注意"不算数，必须落盘。

| 日期 | 事由 | 影响 | 解决方案 | 引用 |
|---|---|---|---|---|
## 4.2 通用规则引用（启动器 / 启动模板可引用 — 不复述全文）

> 本节集中定义跨 Phase / 跨票通用的"会被启动器反复引用"规则。启动器（如 prompts/NN-slug.md）只能写"遵循 WORKFLOW §4.2.X"以引用，禁止复述本节任何条目。

### 4.2.1 版本控制
- 所有 commit / push / branch / rebase / merge 一律走 `but` CLI（per 偏离点 D-3）
- 每个 Agent session 必须有独立 `but` branch，不动他人分支
- 禁止 git write 命令（`git add` / `git commit` / `git push` / `git checkout` / `git merge` / `git rebase` / `git stash` / `git cherry-pick`）；worktree / git checkout / git branch 等字样禁止出现在启动器
- 例外：`but` 报"linked worktrees unsupported"时，工作树内允许 `git commit` 单条命令

### 4.2.2 文件写入
- 所有 .md / .json / .txt 写入走 `mcp__context-mode__ctx_execute` (language=javascript, fs.writeFileSync)
- 写入后必回读 + 字节计数 + 关键片段存在检查（per windows_file_integrity_protocol）

### 4.2.3 调研
- 跨票通用调研要求：atomcode 深度调研（per 偏离点 D-2）+ 回顾 docs/adr 与 CONTEXT.md 心智模型 + 对标工业级成熟方案
- atomcode 调用模板：`ctx_batch_execute(commands: [{label, command: "atomcode -p \"...\""}], concurrency: 1, timeout: 600000)`
- 同会话串行（共享配额）；禁止并发

### 4.2.4 决策账本
- 每个确认结论当场落盘 `.scratch/{slug}/decision-ledger.md`（per 偏离点 D-6）
- 压缩/compact/handoff 前必确认账本落盘到最新

### 4.2.5 报告
- 完成动作统一收口到 `reports/NN-report.md`（路径在启动器固定）
- 报告必须含：完成定义清单逐项 / 阻塞 / lessons 候选 / 引用文件列表

### 4.2.6 启动器硬规则（per 用户 /goal）
1. 每份 ≤60 行
2. 禁止复述被引用文件已有条款（版本控制引 §4.2.1 / 完成定义引 handoff / 调研要求引 handoff）
3. 禁止 worktree / git checkout / git branch 等字样
4. 生成后逐份自检：无违禁词、无重复条款、所有路径可解析
5. 每票通用调研要求只在 handoff 写一次，启动器只引用

| 2026-09-11 | 起草本 WORKFLOW.md，初始化偏离点清单与 6 Phase | 首次把 ask-matt 主流程落到本仓库 | 用户拍板 10 条偏离点 + 6 Phase 结构 | ask-matt SKILL.md §Main Flow + §On-ramps |
| 2026-09-11 | skill 冲突声明字面与用户原话不一致
| 2026-09-11 | architecture-recovery 流程首次落地：把 macro-audit spec-phase-tasks.md 18 项作为架构报告，按对账闸 + to-spec + to-tickets + handoff + 启动器 6 阶段产出 18 张票 + 18 份 handoff + 18 份 prompt + README 波次表 | 流程跑通：spec 覆盖闸 18/18 pass，启动器全部 ≤60 行（实际 15-16 行）、0 违禁词、0 重复条款；并行波次 4 波由 issue Blocked by 推导 | 把启动器硬规则集中到 WORKFLOW §4.2 让启动器只引用不重复；handoff 模板中通用调研要求只写一次；docs/adr/*.md 用通配符引用避免路径漂移 | 偏离点 D-4/D-7 + 用户 /goal 第 5 条 |——文件写成"以 skill 本体为准"，用户原话是"以 skill 为准" | 校验脚本 has-skill-wins: false 暴露 | 改为精确匹配用户原话"以 skill 为准"；教训：声明类文字必须字面 1:1 对齐用户指定措辞，不要"语义相近即可" | D-8 + 用户要求 #2 |

| 2026-09-11 | W1 复核 #05 守卫脚本 PASS — 25/25 cells, schema-valid, full S1-S5 x 5-scale coverage, no placeholders | 验证 #05 不只声明有矩阵，且 matrix.json 真符合 schema.json（JSON Schema 2020-12） | 启动器要求"可机检"声明时，必须配守卫脚本可执行；下次 spec-level 票默认要求 .mjs/.json 实物落地 | 偏离点 D-7 + 报告 #05 |
| 2026-09-11 | W1 8 份报告皆含 atomcode 深度调研段 + Sufficiency Gate 信息缺口段 + 完成定义对照段 | 验证 §3 调研、§7 信息缺口、§8 完成定义三段都齐 | atomcode 优先在 W1 全部 8 票真正执行（无绕开） | 偏离点 D-2 + 用户 /goal |
| 2026-09-11 | W1 git log 18 commits 全部带 A-NNN 标识（如 docs(A-005): ...、05: close A-005） | 验证 commit message 与 ledger 的 A-xxx 严格对齐 | commit 必须以 A-NNN 起头或引用，便于后续 trace；下次 W2 起同样强制 | 偏离点 D-7 + 用户 /goal |
| 2026-09-11 | W1 所有工作落在 .scratch/architecture-recovery/ 与 .code-tmp/，未触动 jiahao/anysearch-cli/env-manager | 验证 git diff 未污染其他 agent 工作 | 严格工作区隔离有效；workspace 边界要写在 WORKFLOW §4.2.7 永久化 | 偏离点 D-3/D-7 |
| 2026-09-11 | W1 ledger 状态字段未更新（仍 current） + WORKFLOW §4 Lessons 未追加 W1 教训 | 复核发现 W1 agents 写报告后未回写 ledger 与 lessons | 启动器收尾必须包含两步：① ledger 当前 A-xxx 状态写 done/deferred ② WORKFLOW §4 append 1 行 lessons；下次 spec 必须把这两步纳入"完成定义" | D-8 防蒸发 + 启动器收尾硬要求 |

| 2026-09-12 | W2 #01-check.mjs PASS（75 assertions / 3 真实仓 / 3 embedding 候选 / 70% 跨仓校准 / 8 fallback triggers）—— 启动器要求"实测 ≥2 真实仓"时必须有守卫脚本机检通过 | W2 agents 严守"可机检"承诺，与 W1 #05 的 25/25 守卫模式一致 | W2 证明守卫脚本模式在跨票可复用；下次 W3+ 默认沿用"reports/NN-*.mjs 守卫 + 退出码 0 + 显式 PASS/FAIL"模板 | 偏离点 D-7 + 用户 /goal |
| 2026-09-12 | W2 7 张报告全部遵守"开工复述（per 开工第一句）+ 调研（§4.2.3）+ 信息缺口（Sufficiency Gate）+ 完成定义对照（§4.2.5）+ 阻塞 + lessons"6 段标准结构 | W2 比 W1 更规范化：V4 报告标题不统一问题已部分收敛 | 启动器应在收尾硬要求中明确这 6 段最小结构；下次 W3+ 启动器模板直接固定 | 偏离点 D-2 + 用户 /goal 第 5 条 |
| 2026-09-12 | W2 守卫脚本结果与 commit message 严格对齐（如 18-failure-demo.mjs 9/9 PASS ↔ commit 6f87371 "FP-4 Micro-A failure 演示 9/9 PASS"） | commit message 引用守卫结果，避免"自述 PASS" | "守卫 PASS + commit message 引用守卫结果"是双锁；下次启动器收尾硬要求写明 commit msg 必须引用守卫退出码 + assertion 数 | D-7 + 用户 /goal |

| 2026-09-12 | W3 #09-stale-check.mjs PASS（15 checks）+ #15-slice-check.mjs PASS（13/13）—— 启动器要求"守卫脚本 + 数字退出码"已稳定为 W3 默认规范 | W3 agents 100% 配守卫 + 守卫结果写入 commit message，与 W1-W2 一致 | 守卫模式已稳定；下次 W4 启动器仍沿用 `reports/NN-*.mjs` 守卫 + `exit 0 + 显式 PASS/FAIL` + commit message 引用守卫结果 | D-7 + W1-W3 实战 |

| 2026-09-12 | W4 #16 是 4 波中**首个同时满足 8 段齐 + ledger done + branch 落位 + commit-surface 处置 + commit 引用守卫结果**的票 | #16 守卫 16/16 PASS + branch `re [16-rendering-split]` + 报告 §8 版本控制处置段明文 | #16 模式可作为后续 spec-level 票的"金标准"；W1-W3 票可在需要时按 #16 模式补齐缺失 sections | W1-W4 实战 |
| 2026-09-12 | W4 V2 (WORKFLOW §4 未追加 lessons) **首次归零** — #16 agents 主动同步 lessons 段 | 报告 §6 标"提交 WORKFLOW §4"承诺兑现 | V2 自 W2 起反复出现，W4 由 agents 主动同步成功，V2 真正归零；下次启动器收尾硬要求保留 | D-8 + W4 实战 |
| 2026-09-12 | 全 18 票闭环（17 done + 1 deferred = 100%）—— grill 阶段全部 spec-level 票完成，流程收敛 | 4 波（8+7+2+1=18）守卫脚本平均每票 13-16 assertions；2/18 已分到独立 branch；commit-surface 处置模式稳定 | spec-level 全部完成；下一步可转 Phase 4 实施（per WORKFLOW §2）或关闭本仓 | W1-W4 总收 || 2026-09-12 | W3 #15 首次出现 GitButler branch 分配 `sc [15-scale-slice-boundaries]` —— 验证 W1/W2 "分支落位缺失"问题被部分解决 | #15 commits 落到独立 branch；#09 仍 zz 悬空 | W3 启动器应在 prompt 中显式提示窗口"but branch new`建议`操作" + 提醒主脑后续派发；下次 W4 启动器强化 | D-3 + W3 实战 |
| 2026-09-12 | W3 #15 启动器主动做 "commit-surface disposition" 注释（commit `0652070` 明文声明跨栈依赖未提交 + 内容已落盘） | agents 主动声明 commit 受阻原因，避免 silent partial commit | "commit-surface disposition"模式 W1→W3 三波共 5+ 张票稳定采用，可纳入 WORKFLOW §4.2.7 | D-3 + commit-surface 透明性 |
| 2026-09-12 | W3 V2 (WORKFLOW §4 未追加 lessons) 暴露：W2 lessons L4 已经写明"启动器收尾必须包含 ledger + lessons 两步"，但 W3 agents 仍未执行 | 启动器硬要求与 agent 行为存在 gap | 启动器必须在收尾段加 ❗ 强提示（不仅描述，还要黑体警告）；下次 W4 启动器强制 | 启动器规范 || 2026-09-12 | W2 V1（3 张 ledger 未回写）暴露：本票 ledger 状态回写不在启动器收尾硬要求里 | W1 已暴露此问题但 W2 仍部分重蹈 | 启动器收尾硬要求需升级为"ledger 状态写 done/deferred" + "WORKFLOW §4 append lessons"两步必须项（而非可选项） | D-8 防蒸发 + 启动器收尾硬要求 |
| 2026-09-12 | W2 #08 / #03 无独立 .mjs 守卫——以报告 + JSON 数据为准可接受，但应明文标注守卫缺失原因 | 不同票的"可机检"程度不一 | 启动器应在 prompt 里为每票标注"守卫等级"（A=必须 .mjs 守卫 / B=必须有 JSON 数据 / C=报告即可），避免 W2-V3 那种模糊 | 启动器规范 / W3 启动器强化 |
| 2026-09-12 | W2 7 张报告累计 commit 数约 19（每票 2-4 commit），全部带 A-NNN 标识 | commit 量适中、未触动其他 agent 工作、commit message 一致 | W1 → W2 范式延续成功；W3/W4 保持同样 commit 密度 | D-7 + W2 实战 || 2026-09-11 | W2 #04 闭环：S5 团队规模分桶/降权无工业先例，用调研锚点（Avelino TF 分布 / Badge-Scorecard 豁免条款 / Safeguard 90% 结构性单人 / Team Topologies 5-9）组合成可机检 v1 参数（threshold_offset + weight_coefficient + 三门回退）；守卫脚本首跑抓出 3 处份额舍入容差不一致 | 单人仓分桶前置是身份归一化——env-manager 6 个 raw 身份实为「1 人类 + AI bot 家族 + 工具」，直接数 raw author 会把单人仓数成 6 人团队使降权完全失效；「可机检」工件的容差语义必须与存储精度对齐 | B2-B4 系数 90 天窗口内补 B2+ 语料重校准（Alves 桶内百分位）；试点语料建议补建 .mailmap | D-2/D-4/D-6 + 报告 #04 |
| 2026-09-11 | W2 #02 闭环：扫描 6 仓 169 ADR，YAML 完整头采纳率仅 0.6% (1/169)；S2 阈值"事后补写 > 90 天 > 20% 判红"在 99% 真实仓库场景下不可直接执行；git first-commit 回退是 S2 阈值的前置依赖而非可选增强 | 验证 IEEE Access MSR 实证（~50% 仓 1-5 ADR，主流 Nygard）与 ICSA 2026（63% 直接 accepted）的工业现实；n=108 精度数据集成为 S2xMACRO-C 校准池初版基线 | 启动器要求"前置基础设施"票时，必须配可复用 .mjs 脚本 + 真实数据集 + 精度验证三件套；下次类似票（W3-W4）默认要求 | 偏离点 D-2 + 报告 #02 |
| 2026-09-11 | W2 #02 heredoc 写 JS 字符串吞 backslash（`\b` → 实际是 backspace 字符 0x08，不是 regex word boundary 源） | atomcode 长报告与 ctx_execute 的 JS 字符串字面量交互：单引号 heredoc `'EOF'` 不会转义反斜杠；JS 字面量 `\b` 是 backspace 字符，必须用 `\b` 才能在 RegExp 看到 word boundary | 改用 ctx_execute_file 程序化 replace 或显式 `\\b`；下次写 .mjs 默认走 ctx_execute 路径 | D-4 / windows_file_integrity_protocol |
| 2026-09-11 | W2 #02 用 `git clone --depth 1` 克隆 log4brains + madr-sample，把所有 first-commit 偏置到 shallow pack 边界（clone 时刻） | 10 个最大 backdated 样本（delta 1505-2997d）全部是浅克隆污染，**误读会把 log4brains 4 年回顾文档判定为"治理差"** | 输出报告必须显式区分 shallow vs full history 样本；CI 评估时 `fetch-depth: 0` 是硬约束（per log4brains README）；剥离浅克隆污染后真实精度回归到 73% ≤ 7d | 偏离点 D-2 + log4brains README 提示 |
| 2026-09-11 | W2 #03 闭环：25 假设全量独立抽检（引文 25/25 逐字命中、0 reject），复核位抓出抽取位自察不到的生成残渣 token（"Đây"）与 4 处 F2/F4 语气硬化/类别错标；PARTIAL-DRIFT 首案（ADR-0001 四象限 vs ADR-0004 战略象限跨 scale 张力，交 verdict-gate 裁决） | 验证"LLM 抽取必须人工抽检"不是流程口号：残渣与硬化只有独立上下文能捕获；evidence_level 系统性低估 4 条（抽取位只见 ADR 单文） | LLM 自由文本字段落盘前必过独立上下文复核位；阶段 0 应把 CONTEXT.md 术语表 + ledger 状态喂给抽取位；能 grep 的失效信号不进 LLM（AS-0003-04 机检 CONFIRMED） | D-6/D-7 + 报告 #03 |
| 2026-09-11 | W3 #14 闭环：报告模板共享骨架 — 章顺序严格锁定 4 章（C1 执行摘要→C2 四象限与裁决→C3 证据→C4 行动建议）；45 骨架字段 + 20 格（5 scale × 4 象限）64 个交集字段全部 type/required/description 齐备；守卫脚本 8 项全 PASS，31 处字段级引用回查 A-005 矩阵 metric 名 | 验证“锁章顺序不锁措辞”有标准级先例（arc42 12 章 tailorable / IEEE 829 “sections shall be ordered in the specified sequence”）；机器可校验字段契约最接近 SARIF；“多粒度共享骨架+切片”无直接先例，最接近 IEEE 829 Master/Level 层级 | ① 当 ADR（四象限只在 Macro-B）与 CONTEXT（战略象限跨 5 scale）对同一网格给出不同覆盖范围时，契约层必须用 applicability 枚举显式建模差异，不可用“统一字段清单”掩盖（与 #03 的 AS-0001-03 PARTIAL-DRIFT 同源，本票只承载不代裁）；② 写 .mjs 正则优先用字符类 [?] 而非转义序列，且写完立即实跑一次（W2 #02 教训本票重演一次，首版因 ? 未转义直接 SyntaxError） | D-2/D-6 + 报告 #14 |
| 2026-09-12 | W2 #01 闭环：3 仓实测 S1 语义对齐，3 个 embedding 候选的 70% 阈值工作点分别为 0.40 / 0.70 / 无（MiniLM / bge-small / me5-small） | 实测证实「绝对余弦分数不可跨模型迁移」（anisotropy）——同一 70% 在三个模型上分别意味着几乎全漏 / 刚好 / 全通过；阈值必须与模型版本绑定存储，不能作为全局常量 | 阈值存储 schema 必须带 model_id + model_version；换模型即触发重校准（报告 #01 §3.4） | 偏离点 D-2 + 报告 #01 §2.3/§3.4 |
| 2026-09-12 | W2 #01：直接 import `@huggingface/transformers` 的 `dist/transformers.js`（web 构建）导致 ONNX 后端 InferenceSession 为 undefined（Cannot read properties of undefined (reading create)） | 本地 embedding 流水线首跑失败；绝对路径 import 会绕过 package.json exports 映射，Node 分支是 `dist/transformers.node.mjs` | 用绝对路径 import 三方包前必须先读 package.json 的 exports 字段，按 node -> import 分支取入口，不能按 main 或目录名猜 | 偏离点 D-4 + 报告 #01 §8-1 |
| 2026-09-11 | W2 #18 闭环：5 条 failure path 明文表（FP-1 Macro-A / FP-2 Macro-B / FP-3 Macro-C / FP-4 Micro-A / FP-5 Micro-B），每条 4 要素齐全并显式与 happy path 对比；FP-4 / Micro-A failure 用同源 PR fixture（happy 3/3 带引文 vs failure 0/3，采集结果完全一致）经四阶段管线实跑，9/9 守卫断言 PASS | 验证「降级只降内容完整度、不改产物形态」这条 ADR-0006 骨架不变式可以做成机检约束；写断言 A3/A7 时才暴露「证据章在 failure 下也必须有非空内容」，否则 yield=1 是空的 | ①凡是「共享 / 同构 / 不变」类文字约束，必须配一条「两产物结构 JSON 相等 + 每章非空」的断言，否则只是风格偏好；②failure 印记词表要按「是否进入裁决」分族（data doesn't show + gap request = 采集缺口，verdict rejected + unverified = 裁决驳回），混用会摧毁可追溯性；③构造 failure 演示夹具时，差异只允许来自「被检验的那一维」，其余输入必须同源，否则演示退化为自证 | D-2/D-7 + 报告 #18 |
| | 2026-09-12 | W2 #08 闭环：Schema 版本演进规则 — 混合式注册中心（git 契约层 + DuckDB 元数据表 + 消费层 schema-on-read）、单调序号版本语义（不装 SemVer，主/次/补丁映射为 MODEL/REVISION/ADDITION 评审语言）、BACKWARD_TRANSITIVE 写侧闸门 + 版本区间读侧订阅、三变更事件（Registered/Rejected/Deprecated）；两轮 atomcode 调研（7 方案对标 + 11 反例） | 单写者使 HTTP 注册中心三项核心价值（并发注册仲裁 / 集中兼容检查 / 变更审计事件）全部退化——选架构前必须先问「该组件的核心价值在本场景是否还存在」 | 组件选型前置一问：核心价值是否在本场景存在；不存在则用更轻载体（本例：库内元数据表 + git 契约），API 语义仍照抄 Confluent 四操作以保留未来切 Apicurio 的迁移路径 | D-2/D-5 + 报告 #08 |
| | 2026-09-12 | W2 #08：ledger A-008 行「显式约束」列写「被 A-009 阻塞」，而 A-009 行写「被 A-008 阻塞」，两行互指成环；issue / handoff / prompt / README 四处一致为 Blocked by #07 | ledger 的「显式约束」列是自由文本，易与「阻塞」字段脱钩；若照抄会推出循环依赖、错排并行波次 | 阻塞关系只由 issue 的 Blocked by 单一来源推导；ledger 文本与派生字段冲突时以多源一致裁决并显式记录，不悄悄二选一 | D-8 + 报告 #08 §2.3 |
| | 2026-09-12 | W2 #08：`fact.schema_version` 需加 FK 到 `schema_registry(version)`，但 DuckDB 官方明说 `ALTER TABLE ... ADD CONSTRAINT` 仅部分支持（not currently supported for all constraints）→ DDL 冻结后无法补 | 凡「DDL 冻结」的票，其下游票的 FK/CHECK 引用完整性约束必须在建表前全部声明完，否则只能降级为进程内校验 + 机检对账（可靠性降一档） | 冻结类 DDL 的建表前 checklist 须含「所有下游票的引用完整性约束是否已声明」；本票已把 FK 增量登记到 ledger A-008 供 Phase 4 采纳 | D-7 + 报告 #08 §4.1.5 |
| 2026-09-12 | W3 #15 闭环：Scale 切片差异边界 — 8 列差异表（5 列 spec §Decision 6.2 强制 + 3 列本票扩展）× 5 scale、Macro-A vs Micro-A 10 维极端差异（每维两端取值互斥）、切片字段命名空间冲突契约 R1-R7（切片 vs 骨架同名冲突 0 / 跨 scale 复用 0 / 缺 origin 0）；守卫 15-slice-check.mjs PASS 13/13（退出码 0），15-slice-boundaries.json 对 schema 2020-12 经 ajv 校验 valid=true | 验证「多粒度共享骨架 + 切片」的字段级边界可以做成机检约束（0 冲突是可跑的断言而非风格声明）；也验证「单一 schema 横跨 5 档连续谱」无工业先例（SARIF 只有行级端、arc42 只有叙事端、IEEE 829 是文档族而非字段谱），属组合式创新，风险点在中间 3 档 | ①「禁止 X」类守卫在扫描「描述禁止 X 的规则文本」时必然自指——首版把 R6 规则名「占位词禁止」自身判为占位词导致 12/13 FAIL，守卫作用域必须与语义层次对齐、只扫描述性载荷；②调研推荐是输入不是结论：OTel 式 scale_ 前缀虽为首选，但与 A-014 已锁定的 60 个无前缀切片字段名冲突，改以 quadrants[].slice_fields 嵌套实现等价隔离并保留前缀借用禁令；③ESM 不吃 NODE_PATH（ajv 需 file:/// 绝对路径才能 import），一次性校验依赖不要写进常驻守卫，否则可复现性依赖本机 node_modules | D-2/D-6/D-7 + 报告 #15 |
| 2026-09-12 | W3 #09 闭环：Read model 失效策略 — 默认 SLA 5s（数字）+ warn 5s / error 15s 两级 + 连续 3 周期去抖 / 6 周期迟滞清除；对 D-006 骨架做版本化追加扩展（ADDITION 1.0.0 → 1.1.0，C1 新增 5 字段）+ 逐字复用 5 个 D-006 字段名；守卫 15 checks PASS + 原 D-006 守卫无回归 | 验证「跨票扩展他人契约」可以既满足对齐又不破坏已闭环契约：先跑原守卫证明无回归，再声明变更类别 | 跨票扩展他人契约的默认动作序列：① 备份 → ② 只追加不改既有 → ③ 重跑原守卫 → ④ 声明 ADDITION/REVISION/MODEL；启动器收尾硬要求建议固定这四步 | D-4/D-7 + 报告 #09 |
| 2026-09-12 | W3 #09：首版 09-stale-check.mjs 的正则经 JSON 与模板字面量两层解转义后退化（/^/([A-Za-z]:)/ → /^/(...)/），node --check 直接 SyntaxError；这是 W2 #02 反斜杠教训的**第二次重演** | ctx_execute 写 .mjs 时，反斜杠在 JSON 层与 JS 字符串层被各解一次；即使写成双反斜杠仍会丢一层 | 固化：ctx_execute 写 .mjs **一律零反斜杠**（路径用 fileURLToPath，换行用 String.fromCharCode(10)，正则优先字符类），写完立即 node --check + 实跑一次 | D-4 + 报告 #09 §7 |
| 2026-09-12 | W4 #16 闭环：渲染样式与模板结构切分 — spec 字段 110 项（骨架 50 + 切片 60，全部程序化派生自 14-skeleton-fields.json）/ demo 样式 28 个 ui: 前缀 token / 越界清单 18 类（17 硬禁 + 1 软警告）；守卫 16-render-split-check.mjs PASS 16/16（退出码 0，硬禁扫描 0 命中），ajv valid=true | spec 字段集严格真子集 demo 字段集（109 ⊊ 137）把「spec 不写样式」从风格偏好变成可跑断言；黑名单定义文件与守卫自身必须显式排除出扫描作用域 | ①「禁止 X」类守卫必须把定义文件与守卫脚本写进 excluded 并加断言防自指（W3 #15 R6 的主动预防而非事后修复）；②守卫首跑 FAIL 先验守卫自身（本票 A11 路径回退少一级、A8 分词字符类留了 .，两处都是守卫 bug 而非契约缺陷）；③schema 字符类要与真实数据同源（token_ref 漏 _，靠一次性 ajv 校验抓出，印证一次性依赖不进常驻守卫）；④跨票字段一律程序化派生而非手工转录，使上游计数对齐成为硬断言 | D-2/D-6/D-7 + 报告 #16 |
| 2026-09-13 | R3 #19 暂挂（deferred）：勘察发现三条与票据前提冲突的事实——①ledger A-019 记「engine-ci.yml 未实跑」但该 workflow 实已实跑并全绿（run 34690925491 / main@66e4433 / 6-6 job）；②CI 仅由 paths engine/** 触发，而 R3 规划基线全在 .scratch/，推基线不触发 CI；③but push-remote=gb-local（本地）非 origin，but push 不达 GitHub | 三条均使「push 激活 CI」在字面上不成立：前提失实 + 触发条件与被推内容错位 + 推送机制不达目标远端 | ①闸门/前提类事实立票时须机检复核（gh run list / but config），不得凭记忆断言；②触发条件与被推内容须在立票时对齐；③涉 GitHub 的票先核实 push-remote/forge 再定机制 | D-8 + 报告 #19 |
| 2026-09-13 |  R3 #20 闭环：fact table schema v0 — 绑定唯一选 `@duckdb/node-api@1.5.5-r.4`（4 候选量化对照 + 排他理由）；audit_fact 16 列 + schema_registry 5 列（correlation key 前置、schema_version 的 FK 在 DDL 冻结前声明）；只追加守卫 20-fact-schema-check.mjs 28/28 PASS（退出码 0）。期间抓出两处真缺陷：①生成 .mjs 时每行被误加引号，文件实际只是一串字符串表达式 —— **零输出但退出码 0，且 node --check 也通过**；②由字段清单程序化派生的 DDL 中 `CHECK(regexp_matches(...))` 少一个右括号，只有真正渲染一次才暴露  退出码不能代替「有输出」的断言；派生产物必须渲染后校验  ①守卫脚本写完必须断言输出行数 > 0，不能只看退出码（本票静默失败正是靠分段打标才定位）；②DDL 由字段清单派生时必配「括号平衡 + 实际渲染一次」断言；③本机禁构建的票，用 unpkg 取 `.d.ts` 静态核验绑定 API 导出名与签名，零安装零构建即可显著降低 CI 首跑失败率；④纯逻辑模块与原生依赖模块必须分离（schema.ts 纯 / store.ts 带原生 import），守卫只 import 纯模块即可做行为断言而非文本猜测  D-016 + 报告 #20 §7 |

| 2026-09-13 | R3 #21 闭环：确定性采集器三族 + 映射表落文 + detector 同族声明；守卫 21-collectors-check.mjs 43/43 PASS。期间抓出两处真缺陷：①按 NodeNext 写 .js 后缀的多文件 TS 模块，Node 22.22 / 24.11 的类型剥离不解析 .js → .ts，守卫直接 import 报 Cannot find module；②源码级「不接 LLM」扫描若扫原文，会被注释里的「不接 LLM」字样自伤（首轮 N2 FAIL 命中 llm） | ①供守卫直接 import 的纯逻辑模块必须单模块、零相对 import（只依赖 node: 内建）——这是「守卫可机检」承诺的硬约束，不是风格偏好；②源码扫描类断言必须先 stripComments 再匹配 | ①纯逻辑模块的拆分自由度受「守卫直连 import」约束，跨文件拆分前先验证 Node 类型剥离的解析行为；②「禁止 X」类断言一律先剥离注释再扫描；③D-018 的 2 正对照 vs 3 真判据跨 3 数据源属结构性冲突，须显式点名并给出不改配比的实现层解法 | D-016/D-017/D-018 + 报告 #21 §7 |
| 2026-09-13 | R3 #22 闭环：B 层判据预声明文档（三级 kill criterion 措辞 + 2 正对照 + 3 真判据 + 1 负对照 + 引用策略）+ C 层裁定依据预入库；3 条真判据阈值由 6F 只读实测测定并跑前写死（TC-1 INCONCLUSIVE / TC-2 RED / TC-3 AMBER），预期结果同表写死以消除事后调节空间；守卫 22-criteria-check.mjs 19/19 PASS（退出码 0）。期间抓出两处真缺陷：①探针首版 commits[].paths 未填充，gitlog 族因 touching.length===0 对全部路径静默 continue，TC-1 可判定数直接为 0；②守卫首跑两连 FAIL 均为守卫自身归一化 bug（TS families[] 与 JSON primary_family+cross_family 同义异形） | 阈值必须与「可执行性门槛」同时预声明：TC-1 在 6F 上 11/13 ADR 无 Date 头，可判定数 2 < 门槛 5 → INCONCLUSIVE；若只写占比阈值会算出「0/2 = 0%」并被读成通过（假绿）。占比型判据的分母最小样本量是判据本体，不是脚注 | ①注入式采集器对不完整注入是「静默跳过」而非报错 —— 凡外部解析喂数，先断言解析完整性（本项目加 PROBE-INVARIANT-FAIL：解析 commit 数 == git log 数）再做统计；②跨文件比对同一语义时先写归一化函数再比对（族全集 = 主族 ∪ 交叉族，去重），否则守卫自身成为唯一 FAIL 源（#16 教训②的第三次重演）；③atomcode carrier 不可用时（HTTP 403 CodingPlan 失效），下载标准官方 PDF + pypdf 逐页抽取定位条款位可满足「引用须可回查」，但必须显式记录 carrier 缺口（#17 先例）；④预声明须连同「预声明预期结果」一起写死，使首报跑完后无调节空间 | D-017/D-018 + 报告 #22 §6 |
| 2026-09-13 | R3 #23 闭环：首报全链（采集→fact→叙事→裁决→报告）经「报告生成器」外壳产出首份真报告 + 失败路径；三层闸门守卫 23-first-report-check.mjs 36/36 PASS（退出码 0）。期间抓出四处真缺陷：①引文 excerpt 按「首个含单 token 的行」定位，CL-006 首轮把 AMBER 判定的引文定位到只含 0.6000 的表格行 → 支持关系 10/11（撑不住），改 pickExcerpt 为多 token 全命中后 11/11；②deriveOverallBand 初版写「任一 insufficient 即 insufficient」，会让 TC-1 的 INCONCLUSIVE 盖掉 TC-2 的 RED，把「已证伪」降级成「不可裁定」，改为 PC/NC 未中优先 insufficient、TC 层内 unsupported 优先于 insufficient；③本机 engine/node_modules 缺 @duckdb/node-api 原生包，fact 步无法落 DuckDB，改以只追加 JSONL + 渲染 INSERT 经 assertAppendOnly 校验（形态仍绑 audit_fact 16 列），DuckDB 实写留给 CI；④atomcode carrier 二次失效（HTTP 403 + 第 22 轮 context overflow 被中断）且同窗口后段 ctx_execute/ctx_search 拒参，退回内置工具完成收口 | ①引文的「定位锚」必须等于「支撑锚」，否则可回查与可支撑各证一半（有引文 ≠ 撑得住）；②多档合并裁定必须写明优先级语义（确定证伪 > 不可裁定 > 未观察），否则「缺数据」会吞掉「已证伪」；③原生依赖缺包时的降级必须形态不变 + 守卫覆盖，不得静默跳过链路步骤；④carrier 与 ctx 双通道都可能在单窗口内失效，启动器应预设降级顺序并显式记录缺口（#17/#22 先例第三次重演） | ①引文定位一律用「多 token 全命中」而非首个单 token 命中，并把 required_tokens 同时用作定位与支撑判据；②综合档位的推导规则写进纯逻辑模块并配守卫断言，禁止在报告层口头约定；③跨进程写库前先在本机验证原生依赖存在性，缺失即走同形态降级 + 明文标注；④调研通道按 atomcode → 官方原文直读 → 内置工具三级降级，每级都在调研报告 §0 留痕；⑤「不可伪造」类声明必须先查该机制的公认攻击面（commit sha 可塑 → 必配 tree 锚 + gate_ref 拓扑断言），不得只凭「有哈希」就下结论；⑥锚类断言写「可解析为真实对象」（git cat-file -t）+ 拓扑关系，禁止与易变引用（当前 HEAD）做相等比较 —— 产物锚定生成时刻，提交后必然失配，会把正确实现判成假 FAIL（本票 R1 首版误报即此） | D-016/D-017/D-018 + 报告 #23 §6 |
| 2026-09-14 | R3 #24 闭环：缺口回流实测锚清扫——atomcode 两轮串行调研（r1 审计产品首报先例 15 源 / r2 B 层迁移有效性 13 源 + 多仓复核计划 v1）+ 校准输入映射清单（16 项 active 登记表 + CI-01~04）；「映射只允许既有缺口编号」由守卫机检（17 编号全集 + CI 行指向 + 新造编号扫描），非自述 | 缺口清单「16 项」口径源于 macro-audit 2026-09-12-report §12.5（5+4+8−1 性质变化）；R2Q7-1/2/7/8 与 D-013-3/D-012-1/3/2 为同一缺口两轮登记的承继对，不标注会重复计数 | 缺口映射类票的启动器应要求三段式：登记表全集 + 映射子集 + 无输入缺口如实标注；调研新增开放问题留在调研报告自身缺口段、不升格 | D-2/D-7 + 报告 #24 |
| 2026-09-14 | R3 #25 闭环：铺开与分发收尾前置清单清点落文——25 行动作项全标「待用户拍板」+ B4.1「已被 D-015 取代」一行带过；atomcode 单轮调研（四层上架闸门 + 演示资产双路径 + DoR/DEEP/PRR，13 源，与 current 零冲突）；守卫 25-check.mjs PASS（退出码 0） | 清点式票的 §0 实测快照抓出 BACKLOG 三处过期前提：e-branch-1 不存在（B2.2）、根 README 已按 D-021 落盘且「不含代码」表述失实（B3.1）、origin 已配置（B5-4 半失实）——BACKLOG 类文档登记后前提会被后续轮改写，清点票必须先实测再判定 | ①「清点/卫生」类票动手前先跑实测快照（文件存在性 + 分支清单 + remote 清单），判定列写实测结果而非复述 BACKLOG 原文；②「每行标拍板状态」「一行带过」类启动器 delta 由守卫逐行机检（标记缺失扫描 + 出现次数断言）兜底，不靠自述 | D-8 + 报告 #25 

| 2026-09-15 | R4 #26 闭环：阶段 1.5 量测审计——14 份 ADR 人工真值表（AAA Part/Reference 同构）+ 65 格 delta 分解 + AC-26-1~5 可归属原因登记；守卫 26-check.mjs PASS 18/18 | 真值表生成顺序反了会失真：先实跑 v1 代码（Node 24 直 import .ts + pathToFileURL）锁逐格 v1 读数，再做人工形态判定，可消除凭记忆写真值的风险 | ① 量测审计类票 = 实跑基线锁定 + 人工判定分离；② 守卫内嵌实跑复现（v1 mean 0.2462 复刻 + 65/65 逐格一致）比静态断言硬；③ 冻结集与任务书口径差异（13 vs 14）须显式标注 post-freeze 行而非静默取并集 | D-8 + D-025 + 报告 #26 |
