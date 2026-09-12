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
| 2026-09-11 | W2 #04 闭环：S5 团队规模分桶/降权无工业先例，用调研锚点（Avelino TF 分布 / Badge-Scorecard 豁免条款 / Safeguard 90% 结构性单人 / Team Topologies 5-9）组合成可机检 v1 参数（threshold_offset + weight_coefficient + 三门回退）；守卫脚本首跑抓出 3 处份额舍入容差不一致 | 单人仓分桶前置是身份归一化——env-manager 6 个 raw 身份实为「1 人类 + AI bot 家族 + 工具」，直接数 raw author 会把单人仓数成 6 人团队使降权完全失效；「可机检」工件的容差语义必须与存储精度对齐 | B2-B4 系数 90 天窗口内补 B2+ 语料重校准（Alves 桶内百分位）；试点语料建议补建 .mailmap | D-2/D-4/D-6 + 报告 #04 |
| 2026-09-11 | W2 #02 闭环：扫描 6 仓 169 ADR，YAML 完整头采纳率仅 0.6% (1/169)；S2 阈值"事后补写 > 90 天 > 20% 判红"在 99% 真实仓库场景下不可直接执行；git first-commit 回退是 S2 阈值的前置依赖而非可选增强 | 验证 IEEE Access MSR 实证（~50% 仓 1-5 ADR，主流 Nygard）与 ICSA 2026（63% 直接 accepted）的工业现实；n=108 精度数据集成为 S2xMACRO-C 校准池初版基线 | 启动器要求"前置基础设施"票时，必须配可复用 .mjs 脚本 + 真实数据集 + 精度验证三件套；下次类似票（W3-W4）默认要求 | 偏离点 D-2 + 报告 #02 |
| 2026-09-11 | W2 #02 heredoc 写 JS 字符串吞 backslash（`\b` → 实际是 backspace 字符 0x08，不是 regex word boundary 源） | atomcode 长报告与 ctx_execute 的 JS 字符串字面量交互：单引号 heredoc `'EOF'` 不会转义反斜杠；JS 字面量 `\b` 是 backspace 字符，必须用 `\b` 才能在 RegExp 看到 word boundary | 改用 ctx_execute_file 程序化 replace 或显式 `\\b`；下次写 .mjs 默认走 ctx_execute 路径 | D-4 / windows_file_integrity_protocol |
| 2026-09-11 | W2 #02 用 `git clone --depth 1` 克隆 log4brains + madr-sample，把所有 first-commit 偏置到 shallow pack 边界（clone 时刻） | 10 个最大 backdated 样本（delta 1505-2997d）全部是浅克隆污染，**误读会把 log4brains 4 年回顾文档判定为"治理差"** | 输出报告必须显式区分 shallow vs full history 样本；CI 评估时 `fetch-depth: 0` 是硬约束（per log4brains README）；剥离浅克隆污染后真实精度回归到 73% ≤ 7d | 偏离点 D-2 + log4brains README 提示 |
