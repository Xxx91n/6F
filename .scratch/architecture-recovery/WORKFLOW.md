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
| 2026-09-23 | 轮29 #78 quarantine 建制：①D-118④ SoD 裁决落地纠偏——初版误把分类器接进 39/40 对照物（「被观察的独立行为」禁改），回退后 parity 改判格语义（quarantined×解析失败=预期分歧格）；②append-only 子串黑名单误伤列名——is_truncated 含 TRUNCATE 子串被守卫拒，改 is_trunc 并注记；③模板层 $' 与 \\n 双重转义塌陷=源文件字面量雷区——含正则/换行的生成走 String.fromCharCode 规避＋写后 node --check+字节回读 | 教训：改「对照物/基线/守卫」三类权威面前先查账本禁条（D-118④「双实现+parity=否决」直接适用）；标识符命名先过黑名单子串预审；生成文件双验位不可省 | D-8 + 轮29 实战 |
| 2026-09-23 | 轮29 #78 r29 审计打回返工批：①编年漂移——账本新增 A-090 与同 commit CHANGELOG M-006「a_range 无新增」自相矛盾，41a D6 当场抓红（编年守卫实证价值）；②「对照物零改动」边界≠「零引入」——崩溃留证/env 读取是裁决明令义务（D-109①/D-110④），禁条只禁分类逻辑；③运行末单事务违 D-115① 负向明禁——逐 commit 事务＋节拍批＋增量断言三层归位；④退出码三类分流（协议 2/strict 3/IO 4）魔数改命名常量 | 教训：收口自述「守卫组全绿」前必须当窗实跑核验——时点快照声明会在同 commit 编年漂移下立刻失实；审计「打回清单」逐条对裁决原文二次核对（弱化款按子款逐条落地非按大意） | D-8 + r29 审计实战 |
| 2026-09-16 | R9 #48 闭环：Micro-A preview 单票铺开——github-rest-adapter@v1 消费侧管道（PR 枚举+元数据+diff 双通道）→ 101 facts 入 48-audit-facts.duckdb（scale=Micro-A）→ 预声明判据 PC-1/TC-1~4/NC-1 → 报告双件×4 全 supported（env64 release-please 机器生成·env55 dependabot api 兜底·env51 人类·jia6 人类）＋goose-duck-agent 无托管面拒绝件 unsupported；golden cassette 回放 14/14；registry micro-a-preview-prep occurred 翻转＋desk-task15 判 decided；40-check F4/44-check E8 漂移对齐 | ① 判据文字面先于实跑锁死（criteria 文件先入库跑后禁调）——api 通道 diff 契约=NULL_STATS（适配器 apiDiff 不算 numstat），判据须编码通道条件语义（local-git→数值齐备/api→bytes>0+detail 注记）否则 api 兜底腿被误杀成 insufficient；② 票面前提漂移如实登记（anysearch-cli 票写时无托管面→实测 merged=6≥1）不硬套票面，failure 演示主体改取真负例 goose-duck-agent（merged=0）；③ 事件翻转连带绑定项全部复审留痕——review 不等于翻转，三项维持 pending＋一项 reaffirmed＋desk-task15 独判 decided | ① 托管面资格闸=枚举行 merged_at 字段即够（≥1 eligible，无需 detail 调用）；② 判据通道条件语义进 criteria 文档并注上游契约出处（apiDiff NULL_STATS 是设计非缺陷）；③ 前提漂移注记三处同源（拒绝件披露块＋日报＋账本） | D-049/D-047/D-033 + 报告 #48 |
| 2026-09-16 | R9 #50 闭环：叙事双轨落地——report/narrative.ts sealNarrative（三态 stamp＋band 红线机检＋model_id 必录）＋mcp facts 只读投影（固定 SELECT/READ_ONLY/参数绑定）＋references 三件＋SKILL.md 加载条件；registry narrative-surface-landed occurred＋narrative-eval-surface→triggered-bound＋#52 评测票立案；narrative.test 25/25 入 smoke | ① ctx_execute 写源码文件时正则要 **双重转义**——\b/\s 在外层 JS 字符串被剥成裸字符（backspace 字节/s 字面），正则字面量静默失配——写含正则的文件一律 new RegExp(字符串) 或直接 Edit 工具；② DuckDB TIMESTAMPTZ 返回 DuckDBTimestampTZValue 对象（内含 BigInt 不可 JSON）——投影面 SQL 层 CAST AS VARCHAR 最干净；③ SWMR 同进程 openWriter→openReader 必拒（实例级锁），e2e 一律跨进程（写子进程+读子进程） | ① 文件写入后扫 \x08 控制字节做哨兵；② MCP stub 收窄=固定 SELECT 形+参数绑定不接裸 SQL（stub 面越小越安全）；③ 评测面先物后尺：被测对象落地当刻登记 triggered-bound＋另立票，判据独立于产出方 | D-053/D-057④ + 报告 #50 |
| 2026-09-16 | R9 #51 闭环：Macro-B behavior 象限接入——CODELORE_BEHAVIOR_FACETS（hotspots/coupling/function-hotspots group=behavior）＋51 管道（env-manager 实跑 116/241/41 行→判据 PC-1/TC-1/TC-2/NC-1 全 supported→behavior=native 切片）＋能力矩阵收窄（strategy:active·behavior:preview·structure/supply-chain:queued）＋D-035 勘误注记＋registry deferred 面集留痕；51-check PASS | ① 暂缓面集激活不静默——消费侧扩展做账本勘误注记（D-035 行后一行）＋registry 确认留痕，契约本体不变；② quadrant 归位=切片决策（fact.quadrant=provenance 不改写）天然支持同一 facts 双象限消费无冲突；③ 低样本判据预声明阈值（TC1_MIN_N=5=codelore --min-revs 默认）把「小样本信度」从披露话术变成可机检判据 | ① 能力矩阵措辞与立票同票绑定（只收窄不立票=声明↔实物漂移）；② --target 参数面（function-coupling 类）不进全仓面集——登记 deferred 防半接面污染判据；③ schema 实物跑留痕先行（51-behavior-schema.json）再写判据——判据引用的列名必须有实跑锚 | D-054 + 报告 #51 |
| 2026-09-17 | R9 #49 闭环：回归 matrix 三首选仓接入——macro-b-regression.yml DEFAULT JSON 四 leg（jiahao+git/django/spring-boot 一仓一行）＋备选表注释同文件留痕＋本机克隆预算实测工件 49-clone-budget.json＋49-check.mjs | ① matrix 扩 leg 时 DEFAULT 走单行 JSON 字面量，备选表（curl/flask/kafka）以注释形态留在同文件可机检；② 20min 预算先本机 `git clone` 计时实证再落账，不空口承诺 CI 时长；③ dispatch 首跑属 push 后动作，legs 接入与实跑验收分离表述 | ① 回归集变更=JSON 字面量+注释备选表+预算实测工件+守卫四件套同窗落；② 实测留 JSON 工件（49-clone-budget.json）供后续轮复核；③ push 闸门动作在票内显式标注「待授权」不混入完成口径 | D-050/D-046 |
| 2026-09-17 | R9 #41b 闭环：listing 资产核对留痕——三 manifest 字段对账 D-052＋license 五处同值＋capability 口径对账 README；抓获三处陈旧（description UNLICENSED 阻塞语/marketplace 2 of 5/checklist 同）同票修复＋41b-check PASS | ① 上游票改 README 能力矩阵后，listing 文案/清单/manifest 三处下游投影不会自动随动——核对票的价值正是抓此类漂移；② 「唯一事实源」声明要配机检：README 改口径时若无守卫断言下游文件，漂移必发 | ① 能力口径变更票应连带核对 listing 投影面（description/marketplace/checklist）；② 41b-check C 面断言把 README↔下游一致性固化，后续能力矩阵再改即被守卫抓获 | D-051/D-052/D-042 |
| 2026-09-17 | R14 T8 值守面复核：registry 4 项复审逾期清零——T8 确认留痕＋review_event 推进下一锚（stage3-close）＋deferred-faces faces[] 同步 #51 激活（22 面）；陈旧守卫清单落 t8-watch-review.md（38/39/40/43/45 预存漂移归因）；33-check ALARM 4→0 | ① review_event 被消费后要推进到下一未到锚点，否则 33-check 恒报 RISK-ACCEPTED-CANDIDATE——复核完成=确认+锚推进两动作；② faces[] 登记面要随激活票同步删名，否则暂缓面集与实际能力面漂移 | ① 复核窗口四件套：确认留痕/锚推进/面集同步/陈旧守卫归因；② 历史 NN-check 断言按快照冻结不重写，当前值守以 registry+33-check 为准 | D-043/D-045/D-055/D-056/D-057② |
| 2026-09-17 | R14 T9 D-025 勘误双读数呈报：核验 v1=0.2462 RED 保留不撤∥v2=0.5846 reportable∥账本 disposition 补记+原裁定时间戳逐字断言——纪律呈报票的价值=防后续轮静默改写已发布读数 | ① 双读数纪律需周期性核验（原文/时间戳/读数字符串逐字断言入守卫），一次落盘不等于永久免疫；② 呈报票=核验+守卫非新裁决，t9-check 把「不撤回不覆盖」固化成可机检断言 | ① 涉及历史读数/裁定的呈报面，断言一律逐字字符串防漂移；② 每轮收口时顺带核验勘误纪律面（成本极低） | D-025 |
| 2026-09-18 | R19 grill 收口：T6 市场安装实证戳穿 manifest 契约缺口→五决策落账（D-066~D-070）——生成器自洽断言≠真校验器契约（skills 裸名/`mcp` 未知字段/路径形 MCP(0) 三形态全漏）；kernel 自包含分发修复（裸命令名+PATH=官方排错表明示反模式，`${CLAUDE_PLUGIN_ROOT}` 钦定）；骨架升版纪律机检化（committed baseline 胜 git-diff：浅 clone/无 base ref 三类失败模式）；CJK non-assert 对称补表＋词表治理立规；r18 残余 8 项顺带清分流 | ①「对自己理解的契约做断言」守卫盲区=契约失效只在真消费者手里显形——校验器进链不可省但外部工具禁钉 enforce（版本漂移不可重放）；②分发形态跟随安装器能力：有构建步→产物不入库，无构建步（git-clone 型）→可运行体必须随源进仓（javascript-action dist 先例）；③顺带清必须独立 commit——判定 commit 零夹带防回滚耦合污染 receipt 链（审计型产品红线）；④机检边界显式化：PASS 打印「semantic-flip not machine-checkable」防绿灯=安全的虚假安心 | ①守卫分层=shape 钉 enforce＋真校验器 advisory/event_bound（SKIP 计入 WARN）＋2 干净窗口转 enforce；②词表=判据统一声明＋改表三件义务＋hash WARN（内部判定面降一档防守卫通胀）；③baseline 更新本身=豁免动作，不立独立豁免文件防腐化 | D-066~D-070 + R19-Q1~Q5 报告 |
| 2026-09-18 | R21 grill 收口：R20 审计残余两实质分叉裁定（D-071/D-072）——陈旧断言 FAIL 常态化（9 条/5 守卫，主源=断言锚定滚动输入面 BACKLOG/next-round/ledger 行）立 known-failures 清单制换代；duckdb 原生绑定 git-clone 缺口立懒加载自愈（精确拉单平台包非全量 npm install） | ①守卫断言锚定滚动文件=随轮必然腐化——锁「结构不变量/单调包含性」不锁「具体值」，快照化归 D-068 committed-baseline 同构；②「断言照跑」是 known-failures 机制的根基（XPASS 自清信号）——过期不跑=盲；③外部依赖缺口的修复优先级=官方包管理器生态位（optionalDependencies 平台分包），自造缓存/hook/入库二进制都是次优；④自愈路径失败语义必须三段披露（原因→手动路径→离线面），静默降级=审计产品自破约 | ①清单制 XFAIL/XPASS 三态＋strict 无逃生门＋cap≤10＋事件锚复审；②自愈每进程至多 1 次防循环＋完整性三方同值校验＋失败回落分级披露；③npm publish 渠道≠插件目录 npm install 依赖拉取——辨析写票面防误读 | D-071/D-072 + R21-Q1/Q2 报告 |
| 2026-09-18 | R22 grill 收口：锐评辩证复审+R21 审计次生缺口六决策落账（D-073~D-078）——册外 13 件 cap 满分拣立 sealed 第三态（显式退役非 archived 变体）；env 敏感腿双轴（验收面封存+活契约迁 fixture 测工具不测环境）；D-072 夺舍批评实证化 revised→按面分层自愈（谁在屏幕前=自动拉包合法性判据）；锐评四奇观立场批评零实证全维持+批评转写为可证伪触发器；SKIP-STREAK 病灶=前提错配非持久化（CI 预期缺席≠异常缺席）；上游接入裁设计先行（dimension:null=防腐层故意留白非空槽故障） | ①立场批评与实证的受理边界必须成对（D-075 三要素=立场+实证+工业先例交叉——缺一不重裁，立场输入转写为 event_bound 复审条件而非噪音丢弃）；②「预期态」与「异常态」的环境分层是断言语义本体（pytest skipif/Chromium TestExpectations 先例）——CI 恒真 SKIP 持久化只是永真告警；③防腐层留白是设计正确态——业务映射只能落裁决面/文档面，填进适配器即腐蚀（SonarQube rule→quality 分层同构）；④封存必须有承接义务（migrated_to 闭包或 rewrite-pending）否则 XPASS 信号洞 | ①sealed 第三态输出+attestation jsonl 双锚+33-check 闭包校验——退役显式化且不可无档；②「禁宣称 X」值守化=不可判定事件转可判定事件的标准手法（grep 级机检）；③人工晋升门挂 manual_watch 五要素+receipts.jsonl 证据载体——翻牌权属人工但证据面机检留痕；④设计票绑复审时点防僵尸（D-035 不得裸挂纪律） | D-073~D-078 + R22-Q1~Q6 报告 |

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
6. 「## 收尾」段首必须含 ❗ 黑体硬要求块（措辞逐字 = .scratch/macro-audit/decision-ledger.md D-029；新票启动器生成时模板纪律继承）

### 4.2.7 票据调度与拆分（per D-040）
1. 开工闸门 = DoR（依赖闭合即可拉）；波次仅作协调/验收装置（整批 demo/评审/回顾），不作统一开工门
2. 拆票判据：完成定义无法用同组可测条件陈述、或部分被非工作项外部事件门控 → 拆
3. 被外部闸门阻塞的票不排程、不入波次、不占 WIP，backlog 标 blocked-by 闸门名

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
| 2026-09-15 | R4 #27 闭环：判据 v2——adr-structure@v2 接线 A-002 回退链（字段腿 dash→内联→inline-iso→git；节腿 ##→裸标签），预注册 27-prereg 先入库（pov）后重跑；冻结集 65/65 ALL-AGREE，v2=0.5846 RED 与 v1=0.2462 RED 勘误式并列；engine/test/collectors.test.mjs 13 断言挂 smoke（CI 矩阵生效） | Node 模板字面量携含 $ 记号的 TS 代码经 String.replace 插入时被替换串展开破坏——文件拼接用 split/join；Windows 下 await import 绝对路径须 pathToFileURL | ① 重测纪律可复制：预注册 commit → 实现 → 单次重跑 → 守卫复核次序；② 采集器保持纯函数、git 数据走输入注入（保住 21-check N4/N5 纯净断言） | D-8 + D-025 + 报告 #27 |
| 2026-09-15 | R4 #28 闭环：ADR 治理卫生——real-gap 33 格清零（Date×6 补记 git 首提交值、三节 ## 标签×9 份逐句 verbatim 重分布）+ 0014 post-freeze 行 4 节补记；勘误式批注行「量测审计驱动」统一标记；守卫 28-check.mjs PASS 113/113（verbatim 句保留 vs fc00d458 逐文件断言） | 补记纪律：Consequences 不得事后编造——原文无独立后果句的 7 份用白名单注记「未改写、未增补」占位而非虚构内容 | ① verbatim 句保留可机检（git show 冻结件逐句断言）；② 两日期规则落字：Date 值注记 = 入库/commit 日期；③ 白名单就地修订（字段/节标签）是社区主流先例，实质变化仍走 supersede | D-8 + D-025 + 报告 #28 |
| 2026-09-15 | R4 #29 闭环：C 层 disposition 补记（CAPA reopen）——原裁定行逐字保留（supported + 2026-09-13T10:49:04.195Z），成对动作落字（v1=0.2462 RED 字段归因部分 invalid；v2=0.5846 RED = reportable value）；守卫 29-check.mjs PASS 13/13 | reopen 惯例落地为「### disposition 补记（日期，票号，CAPA reopen）」三级标题追加于原裁定表后 | ① 张力记录结论维持但归因基座换成修正读数——disposition 文体须显式声明「人裁定不推翻 + 规则推导复核后仍 unsupported」；② 守卫可断言追加位置（原表行后、下个 ## 前） | D-8 + D-025 + 报告 #29 |
| 2026-09-15 | R4 #30 闭环：阶段 2a 冻结校准——13 项清单落盘（11 desk 草案 + 任务 5 已锚行 + 任务 7 单写者域草案）；置信域逐项标注（单写者域禁外推）；待探针占位 10 项两字段齐备；守卫 30-check.mjs PASS 9/9 | 校准清单 JSON 结构化承载 + md 渲染分离——「置信域非空/占位两字段」可机检 | ① desk 草案必须引冻结实测锚（judgeable/top_share/降级路径均有数）；② 任务 7 拆域（单写者草案 + 多写者 self-probe）模式可复用于后续双域项 | D-8 + D-023/D-024 + 报告 #30 |
| 2026-09-15 | R4 #31 闭环：阶段 2b CodeLore 单上游探针——binary-discovery 判定+pin 0.28.0+golden 契约测试 7/7（红证=G5 漂移拒绝）；上游事实 8 条入 facts 形态；漂移报告+P1 schema 预核对发现 plugin.json 不合 1.0.0 登记独立修复项；守卫 31-check.mjs PASS 14/14 | regex-heavy 文件走 heredoc '<<EOF' 逐字写入，勿走 JS 字符串嵌套 | ① 适配层「零业务规则词」守卫断言是 ACL 纪律的机检代理；② P1 顺手预核对值大——抓到 plugin.json 自造格式缺口 | D-8 + D-020 + 报告 #31 |
| 2026-09-15 | R5 T0 立票：ctx_execute(javascript) 沙箱为 Bun——Python 三引号非法、模板串嵌套易踩坑 | 首次 README 编辑调用报错返工 | 多文件写入走 ctx_execute(shell) heredoc 逐字落盘；程序化替换写临时 .mjs 脚本再执行 | 轮 7 T0 实跑 |
| 2026-09-15 | R5 T0 立票：任务书「A-031 起」口径过期——A-031~A-036 已被 R4 票占用 | 若照抄会撞号 | 立票编号一律以 ledger 实物最大值续接（本次 A-037 起），偏差写报告不静默沿用 | 数据源=账本纪律 |
| 2026-09-15 | R5 T0 立票：必读清单路径可解析自检单行多路径误报 | 自检脚本首轮 7 误报 | 校验需按 `、`/` + `/`（注记）` 分割后逐个核对 | 轮 7 T0 实跑 |
| 2026-09-15 | R5 #33 闭环：T7 挂门机检化——33-gate-registry.json 27 项×三字段四族+13 事件 + 33-check.mjs PASS 8/8（首跑如实呈报 ALARM 4） | 挂门检出判据须含「最迟」——半拍板行（方向已拍/子项仍挂门）不标挂门字样，B5 孤儿断言兜底 | ①登记表 bound_to/trigger_event/deadline_event 字段即后续票触发器挂接点；②事件翻转位驱动报警 | D-024/D-026/D-034④ + 报告 #33 |
| 2026-09-15 | R5 #34 闭环：plugin.json 合 Agent Plugins 1.0.0（修复落元数据源 meta+gen；ajv valid；34-check.mjs PASS 11/11） | gen 首跑报 DRIFT 是迁移语义（旧产物≠新产物时记 DRIFT 并改写），二次跑才应全 CLEAN | ①守卫断言用「重跑幂等」而非「首跑 GEN-OK」；②一次性依赖（ajv）不进常驻守卫——零依赖结构断言覆盖同一断言面 | D-012 余款/D-036 + 报告 #34 |
| 2026-09-15 | R5 #35 闭环：CodeLore 首批 30 面契约化——30 cassette + manifest 独立计量 + 41 用例契约测试入 smoke 链；35-check.mjs PASS 21/21 | 空结果面 --format json 无表头；字符串手术抽辅助函数时自反命中造成自递归 bug | ① 空面列契约走 csv 第二通道（cassette 逐字节 sha256 钉死）；② 冻结 argv（--age-time-now / -e）入契约表 extraArgs = 边界冻结不确定性；③ 枚举残余面显式登记不静默入暂缓表（入表须先补 D-035④ 原文否则 33-check B3 FAIL） | D-035/D-034 + 报告 #35 |
| 2026-09-16 | R5 #36 闭环：CodeLore LLM 面 env 门控＋成本验收——实物枚举修正「explain 族非 analyze 枚举成员」（0 命中），LLM 面=explain --llm/diff --llm/mcp explain_file 三面；env 五变量契约+门控判读矩阵+llm_cost 计量（chars/4 估算位）+call-cap 降级；契约测试 25/25 两形态；36-check.mjs PASS 20/20 | 票面措辞假设的「族」与实物枚举不符（explain 是独立子命令非 analyze 面）；上游不暴露 token 计数 | ① 「族」名单先以实物枚举核实再落契约，枚举对账先断言命中数；② env 门控契约最低诚实位=只落「是否配置+缺哪个变量名」，秘密值断言（扫全 fact）值得固化红证；③ 无真件的 golden=synthetic 显式标注+结构证据链+marker-absent 拒识路径；④ 枚举残余面（含跨传输形态）一律挂 registry manual_watch 跟踪位 | D-035② + 报告 #36 |
| 2026-09-16 | R5 #37 闭环：试点面可用性审计——三仓只读实测（git 只读命令白名单，零写被测仓）PR 人/机比+ADR supersede 链完整度+托管面；37-check.mjs PASS 40/40；D-033 desk 指派 2 一致 2 出入按冲突协议呈报（jiahao「纯本地无托管」被 6 个已合入 PR 证伪、env「唯一 PR 面」证伪——呈报收口裁决不静默改向） | ①「机器生成 PR」按主题词匹配会把人类 release-please 治理 PR（#46/#47/#51/#32）误分——产物签名应是 chore(main): release X.Y.Z 标题 + release-please--branches 分支名；② supersede 抽取三类假阳：否定形（does not supersede）/自指引文（0060 引自身 status 格式）/跨行接续（again by ADR-0066 在段落后续行）；③ 守卫断言注意 JS 空数组 truthy（errors=[] 不能 !errors 判） | ① bot 署名与机器产物分列（dependabot[bot] 作者 vs release-please 生成内容人署名）；② desk 角色指派必须带实测闸——「无托管」判定可被拍板前 5 天的 6 个 PR 证伪，Pilot-surface Audit 即此闸；③ 断言对象先区分「计数型字段」与「错误清单」再用语义化判空 | D-033 + 报告 #37 |
| 2026-09-16 | R5 #38 闭环：Macro-C preview——anysearch-cli 全链实跑（codelore 30/30+ADR 65+supersede 8 边↔37 存档一致+llm_gated 降级披露）→ 共享 38-audit-facts.duckdb（Macro-B 228+Macro-C 1012，mw-trigger-b 触发登记）→ happy/failure 双件+preview_disclosure 契约面（D-037② 首实现）；38-check.mjs PASS 36/36 | ① store.ts 结构守卫全过却藏 fact_seq 无赋值+schema_registry 无种子两致命缺陷——唯一写入口首次端到端实跑才暴露；② upstream.resolution 双 emit 撞 fact_id UNIQUE；③ DuckDB 连接不 close 留 .wal 侧文件 | ① 「结构断言≠行为证明」：preview 票必须把只被结构检查过的写路径列入实跑面；② fact_id 内容寻址=同内容即同一事实，汇总层按 id 去重留痕而非改 id 伪造唯一；③ 二进制工件 FORCE CHECKPOINT+closeSync 落单文件可复验库；④ 外部仓混排 ADR 格式下 v2 回退链实证有效（dash 仅 17/65 命中，inline-iso/git 腿兜到 65/65 日期解析） | D-034/D-032/D-033 + 报告 #38 |
| 2026-09-16 | R5 #39 闭环：Macro-B 三仓 one-shot＋jiahao 回归 CI——39-macro-b-one-shot.mjs 全链实跑三仓（env-manager 276f supported/anysearch-cli 1041f unsupported·TC-2 Status 缺失率 0.7385 超线如实落数/jiahao 1101f supported）+ 共享库 2418 行；jiahao workflow macro-b-regression.yml（schedule+dispatch）接入=触发器(a)激活；self-probe 实测封口（同进程二写拒/跨进程并行 1胜3锁拒/串行2/2/66行零dup）desk-task7→triggered-bound；39-check PASS | ① self-probe 父进程先持锁会把全部并发读数污染成假象（B1/B2 全拒）——测量装置须零持锁、真争用全放子进程互打；② DuckDB 文件锁属 DuckDBInstance 非 connection——store.ts openWriter 只回传 conn，conn.closeSync 后锁仍在（reopen/reader 皆拒实测为证），「写后同进程读回」在现门面下不可行；③ 接入即触发类动作把触发面/层限定/job 绿语义注释进 workflow 本体，登记表 confirmations 指回文件 | ① self-probe 结构设计：父进程编排+子进程争用+独立 probe 库；② 锁生命周期呈报项：store 是否需 instance 释放门面留收口窗口裁决；③「接入即触发」工作流文书=证据锚本体 | D-034④a/D-024/D-033 + 报告 #39 |
| 2026-09-16 | R5 #40 闭环：非自有公开仓泛化验证——open-gsd/gsd-core 经 engine repo add URL opt-in 接入（隔离缓存/全深度/浅拒/禁远程配置执行/凭据复用本地链，intake.test 31 断言入 smoke）→ 1424 facts unsupported（TC-2 RED：Status dash+加粗形态漏认率 0.9783，mean=0.7478 五件套其实大体在位）如实落数；对照三基线区分双归因；registry first-external-repo→occurred，desk-task2→triggered-bound（judgeable=92≥5），desk-task15 pending→ALARM（判据属 Micro-A 未上架层） | ① 同一判红不同归因必须分开写——gsd-core 与 anysearch-cli 同 TC-2 RED，前者主成分=detector 漏认（- **Field:** dash+加粗混排四腿皆漏），后者=真缺失；盯裁定档位会抹掉回退链覆盖缺口这一真泛化发现；② 披露块文案是 caller 注入的，复用管线脚本须同步换披露面（39 脚本直跑外部仓会把同主三试点仓文案带进证据产物）；③ file:// 显式 URL 腿让 intake clone 全链离线实跑真 git（不经网络），比 mock spawn 硬 | ① 跨仓对照先逐字段拆 missing_ratio 再归因，量测效度先于裁定档位；② 外部仓选型的格式多样性本身就是探针资产，选型理由里登记预判并实测量；③ registry 触发≠判据满足——触发同项可一 bound 一 pending，按登记处置不静默翻转 | D-013/D-033 + 报告 #40 |

| 2026-09-16 | R6 #45 闭环：演示入口——fixture-generator.ts（pin author/committer/date → 逐字节确定性 SHA，merge/多分支/tag）＋definitions 三场景＋golden 逐字节 diff＋cli demo [--scenario]（临时目录跑完即弃）＋CASRAI 披露块四印记复用 preview_disclosure 同一契约；demo.test 38/38 入 smoke；45-check PASS | ① tokenize 把 [a-z0-9_+-] 连字符词并读一 token——意图文档/提交主题的关键词面必须逐词核对（CONTEXT.md 关键词全集 ⊆ git subjects 命中集，否则 TC-3 最低档被无关词拖 RED）；② 临时目录路径若进证据源/reproduce_cmd 会毁掉 golden 逐字节稳定——工件一律相对名，abs 只留运行时；③ 降级变体若靠自然裁判产出差异，三场景可能撞形态——definition.failure.trigger 声明式触发 degradeReport 才把「失败路径一等演示」钉成确定性契约 | ① 确定性 fixture = pin 全部 commit object 输入（author/committer/date/tree/parents/message），tag 用 lightweight 天然确定；② 披露块契约复用不扩展——四印记塞进既有四字段比新加字段更守「禁止两处手抄」；③ R6 票档三件套缺位时先按 40 模板补立再开工（立票计票内） | D-038/D-013/D-034 + 报告 #45 |
| 2026-09-16 | R6 #41a 闭环：分发收尾·仓内文档面——examples/first-report/ 四件+披露 README（真实产物/commit/日期/重生成命令＋冻结时点＋failure=degradeReport 演示性质＋preview_disclosure 时点差三处如实注）、README 边界矩阵（capability 1-2 of 5 preview/三层 Not yet）+0.x 语义+Try-on-real-repo 节、仓根 CHANGELOG M-001 编年首条（区间实物读出）、engine CHANGELOG 指针闭环（W4 悬空清零）；41a-check PASS | ① 披露 README 的重生成命令=「脚本审计 HEAD」——冻结时点声明必须连带「在生成 commit 工作树状态运行」否则读者拿当前 HEAD 复跑得到不同读数；② 多层 preview 的边界文案要以报告披露块实物印记为准（Macro-C=capability 2 of 5）而非沿用 D-031 单层期「1 of 5」旧口径——同一语义源=generate.ts PreviewDisclosure；③ failure 样例性质=degradeReport 确定性降级演示非真实事故，不注明会被误读 | ① 对外「能力边界」文案一律从冻结决策/产物印记倒推，禁从产品愿景正写（DoD 护栏机械化）；② CLI usage 行是命令面唯一事实源——README 引命令前先逐字核 cli.js usage（repo add 只交付 intake，无 audit 子命令不可虚写）；③ 编年「区间写时实物读出」落地=守卫运行时重扫 docs/adr+ledger 反推区间串对比，防写死漂移 | D-030~D-032/D-038~D-040 + 报告 #41a |
| 2026-09-16 | R5 #43 闭环：样例 golden CI——golden-ci.yml 两腿重渲染+逐字节 diff（engine golden 经 gen-demo-golden.mjs porcelain 断言；examples 经仓内 bundle 物化 fc00d458 冻结 worktree+e39468c overlay+等签名 README 重构，逐字跑 README 重生成命令）；禁自动回写明文；43-check PASS 28/28 | ① GitButler workspace 快照 commit 不在任何 pushed ref 上——冻结时点物化不能靠 checkout，用 `git bundle create` 以父锚（--not parent）打薄包随仓传输（904B），CI 端 `git bundle unbundle`+`git worktree add` 即得；② 生成时点脏工作树≠commit 树——report 产物只消费输入的派生签名（top-20 关键词计数），原脏文件不可恢复时可从已入库 facts intent_count 反推构造等签名 overlay，实测四件+侧工件逐字节一致 | ① 「逐字节 diff 契约」先问输入面是什么——git 历史对象、工作树文件、生成器版本三个面分别钉（bundle/overlay/e39468c git show），缺一面即不可复现；② 等签名重构是诚实路径但必须在注释+README+报告三处如实标注「非原字节、签名等价」，禁冒充原文件；③ golden job 单平台裁定理由写进 workflow 注释（确定性=逐字节契约，eol=lf 消行尾差），平台相关漂移留登记义务 | D-030③ + 报告 #43 |
| 2026-09-16 | R6 #44 闭环：版本与上游锁定制度化——upstream-lock.yaml 六行种子（codelore active 0.28.0+--version 契约/duckdb+git-cli active/scorecard·repomix planned/sqlite-dump evaluating+risk_note）＋README §3 状态列唯一权威绑定＋engine CHANGELOG Unreleased 引 lock＋44-check.mjs 56 断言两段式（ENFORCE=锁表结构/三方同值版本断言/日期/README绑定/三处标注同源/编年指针；ADVISORY=新鲜度逾期+binary 缺席 WARN）；首跑抓出 M-001 漏计 ADR-0010 superseded 补全 | ① 「唯一权威」绑定须先覆盖全集——README 五行只绑四行种子则两行失言，已接入项须补登记；② 日期断言勿用 UTC 墙钟当业务「今天」——toISOString 在 UTC+8 回退一天，账本正文日期含未来截止日不可扫（取本地日期∪日报文件名日期最稳）；③ 「superseded」全文匹配误报高——判据锚定 Status 头行（正文提 supersedes 关系≠自身被 supersede） | ① 锁表先于依赖的规则反向要求：已接入项补登记先于宣称「唯一权威」；② 两段式门禁=双计数器非双脚本（PASS/WARN 分离，exit 只看 FAIL），binary 缺席与逾期属环境/节奏位作 WARN；③ yaml 子集解析器 30 行够用——锁表格式自造自守（顶层标量+行组+零嵌套）不引 js-yaml | D-037/D-039 + 报告 #44 |
| 2026-09-16 | R5 #42 闭环：上游队列值守——42-probe.mjs 只读枚举 dump 面形态（sqlite=full fact-store dump/parquet 仅 3 面/内部 schema_v8 不在 codelore schema 公开面）→ 42-dump-comparison.md 三轴对照落文＋atomcode 五先例；呈报=维持逐面契约不采纳为事实输入面（锁表 evaluating 不翻）；registry 新增 upstream-probes-scorecard-repomix 层需求拉动条目；42-check.mjs PASS 43/43 | ① 「dump vs 契约」先问数据层级再谈字段——dump=ingest 原料层导出、契约=分析产出层，对契约字段覆盖天然 0/30；② 内部 schema 不是契约面——`codelore schema` 公开目录=57 输出行类型，dump 的 schema_v8 无对外语义标注，golden 钉它=钉实现细节快照；③ 触发条件为「条件」时选 manual_watch 而非强绑事件——层需求拉动无单一事件可绑，强绑 stage3-rollout 会造伪 WARN | ① 评估类值守票的产出=对照落文＋注记锚定，「评估完」不等于「可翻状态」——状态翻转权属 ADR 拍板不越权；② dump 合法域=诊断/调研原料（Terraform/GH Archive 先例同型），进 verdict 输入面才须 ADR；③ 探针「禁写副作用」边界=只跑 stdout 枚举面（--help/docs/schema/profile），不跑 analyze --output——评估对象是面形态契约非单份产物 | D-023/D-034/D-035③ + 报告 #42 |
| 2026-09-16 | R6 #33-ext 闭环：挂门守卫扩展——registry watch 三态 schema 齐备化（manual_watch 7 项五要素 3/5→5/5：owner/review_event 机读锚/verify_method 补齐＋micro-a-preview-prep 事件登记）＋33-check.mjs D 组 7 断言（fail-closed 事件引用堵 W6/三态枚举/留痕结构/BOM）＋E 组 manual_watch 扫描（逾期→ALARM+RISK-ACCEPTED-CANDIDATE 不自动翻转/确认缺失→WARN）＋COVERAGE event_bound 23/30 输出；PASS 16/16＋红证两态实跑 | ① fail-open 是挂门守卫最危险方向——`ref && table[ref]` 短路把悬空引用静默跳过，可选引用字段必须独立断言可解析性；② 「默认态」也要显式校验——event_bound 缺省即默认，其不变式（须有事件锚）不断言就会出现名义默认实际无锚的游离项；③ 复审时点机读锚取事件不取日历——复审点全是事件型 prose 时编日期=虚构，登记事件把层节律变成可判 occurred 的锚 | ① 守卫扩展先红证再落地：注入悬空引用→FAIL、翻转事件 occurred→候选名单，两态实跑证明断言非永真装饰；② 「缺口显式可见」落成每跑必现信号——manual_watch 零确认留痕 WARN 常驻是设计非噪音；③ 断言并入本体守卫 vs 分立的取舍：全票共识引用的单一哨兵不拆（双跑约定会漂移），新校验按组并入同文件 | D-041 + W6 + 报告 #33-ext |
| 2026-09-16 | R7 #46 闭环＋轮 10 返修：回归 CI 迁回 6F——workflow resolve→fromJSON matrix（schedule+dispatch opt-in）＋jiahao 单文件撤除 2755bf35＋经典仓候选呈报；独立审计抓出 npm install 惯例违反／matrix→run 直插注入面／verify 弱断言／五层盒子术语误用／收口回写缺口族（A 账本/BACKLOG✅/lessons/票档三件套） | ①「CI 惯例」是成文规范面——同仓 golden-ci 已 npm ci，新 workflow 未同步惯例即硬违规；② ${{ matrix.* }} 直插 run 是注入面——resolve 段用了 env 间接引用而消费段丢纪律，防御要全链一致；③ GitButler 分支并入 main 后提交会随他方 push 上远端——「本地待 push」自述会失效，交接文书写可机检状态断言而非时点快照 | ① 新 workflow 落仓前先 grep 兄弟 workflow 安装/版本惯例（npm ci、node 版本），分歧注释理由；② 消费矩阵值一律 env 间接引用＋消费腿防御性再校验，头注写明纪律；③ 守卫断言与标签等强（test -f→test -s、关键词 grep→格式正则），弱断言在审计窗必被打回；④ 票闭环四件套同窗口落：A 账本行/BACKLOG ✅/WORKFLOW lessons/票档三件套，缺一即断档 | D-046 + 报告轮 10 返修节 |
| 2026-09-16 | R8 #47 闭环：托管平台 API 适配器——github-rest.ts（REST 主路+API 版本 pin+三级探测+diff 双通道+限流有界退避+余额写事实库）＋cassette×5（env-manager 实录制 62-PR，限流耗尽/漂移/平台 Bot 如实标 synthetic/derived）＋test 55/55 入 smoke＋锁表→active；47-check PASS | ① ctx_execute 模板字面量嵌 TS 源码时 \\ 转义层叠炸过一轮（\n 变真实换行、\/\[ 丢反斜杠）——String.raw`...` 直写后零再犯，凡含正则/\n\t 的源码写入一律 String.raw＋回读断言；② cassette 录制器首版 Accept 头在 auth 分支被吞（三元只带 token 丢 accept）——diff 路录成 JSON 详情，测试断言 bytes>1000 当场抓获；③ gh auth token 借读在真机零成本实证（无 GITHUB_TOKEN 环境→真实 strategy=gh-token 命中 API），可选回退路径不只是一条代码路径而是活路径 | ① 含正则/控制符源码写文件：String.raw＋读回 marker 断言＋tsc 立刻编译三步走；② 录制器 bug 用「录制产物回放后断言语义」兜底（golden 模式价值再证）；③ 降级/回退面要有真机活探佐证，不满足于纯 fixture | D-048/ADR-0020 + 报告 #47 |
| 2026-09-18 | R11 #59 闭环：kernel 自包含分发修复——.mcp.json=node+${CLAUDE_PLUGIN_ROOT}/dist/cli.js mcp＋dist 40 件随源入库（esbuild 0.28.2 单文件 bundle 定形；勘误 41→40：r20 审计 R1 复核）＋store.ts duckdb 懒加载降级＋engine-ci rebuild-diff 步＋34/41b-check 断言换约＋真机 claude --plugin-dir→mcp list=Connected 验收 | ① ctx_execute 模板字面量写含 `${...}` 的文本会被 JS 插值层吞掉（${CLAUDE_PLUGIN_ROOT}→ReferenceError）——转义族第四条变种（W2 反斜杠→W3 双解→R8 \→本票 ${}），含 ${} 的内容用行数组 join 或 edit 工具非模板串；② bundle 形态决策=smoke 实证非推断：esbuild 单文件 bundle＋store.ts dynamic import 降级，clone 零 node_modules 握手/selftest 可用、duckdb 面报 DUCKDB-UNAVAILABLE 结构化错——原生依赖不可内联时的正确姿势是降级非打包；③ import.meta.url 锚点在 bundle 下漂移——metaPath()（引擎根锚）统一 bundle/tsc-dist 两形态路径解析；④ 冻结守卫钉住的文案修改须兼容 pinned 子串（41a-C9：「发布未发生·可安装 listing」用过渡句式引述历史态并宣告终结——诚实且守卫兼容），不可兼容的漂移（C10/D6/D7/F4）归因冻结快照不复写 | ① claude --plugin-dir <dir>→claude mcp list 是免 push 的真机验收环（A-068 本地环回法第二型：marketplace add 本地路径→install→details 先行于 push）；② git-clone 分发的残余缺口如实分级披露（零依赖面 vs 需 npm install 面）胜过硬凑全量自包含；③ rebuild-diff 用 git status --porcelain 而非 git diff --exit-code——前者捕未跟踪新文件（dist 首入库后新增产物不静默） | D-067/D-038/D-037⑥ + 报告轮20 T1 |
| 2026-09-19 | 轮 23 grill 收口：upstream 映射定稿六项全裁（D-080~D-084）＋sealed 恒真族立案（D-079）——六轮 atomcode 深调研全经账本 current 冲突核查零 revised | ①「PR 合入」类依赖措辞要分层——文档定稿（draft→final）与 push/merge 是两道门，字面化绑错层级=永假死锁（Gerrit/Google design-doc 两阶段门先例）；②挂起必须锚化——prose「待采后裁定」违 D-035 裸挂，event_bound=代码面机检锚比日历锚硬（Pact pending pacts＋codelore-deferred-faces 同型）；③快照≠趋势——cross-sectional snapshot 量 prevalence 不量 change，S4 演化宣称只认纵向派生 fact（SurveyCTO/CHAOSS Evolution WG 纪律）；④权重不住路由契约——LFX v2 变更史实证权重可高频迭代的前提=分类面零权重列（路由→scoring→weighting 三层分离 UK Gov MCDA 同构本仓 map→spec 判据→C 层 band） | ①依赖措辞带层级限定词（合入=本地定稿）防未来会话重新字面化（D-025 双读数句式）；②新候选族判据独立成条不塞勘误注记——案卷完整性保留（D-073 vs D-079 分界：勘误=纠内部错，新族=输入面边界扩展）；③通用判据升格纪律：快照/趋势、权重/路由各落映射表 §④ 供后续行援引；④指针分发感知——壳内文件指 docs/ 路径必悬空（tgz 无 docs/），原则行零口径零路径 | D-079~D-084 + 报告 R23-Q1~Q6 |
| 2026-09-20 | 轮 24 grill 收口：GitHub 门面三面整改七裁（D-085~D-091）——R24-Q4 atomcode 深调研经账本 current 冲突核查零 revised | ①双语 README 不是平等双写而是 canonical→derived——「译文可落后但不得假装新鲜」（MDN/blume/Weblate 三引擎收敛；锚点英文不译、标题可译）；②可机检面分三类——结构互等 FAIL／版本戳掉队 XFAIL／译文质量人评审，硬阻断对小修过严逼假同步（Opendray advisory-only 先例）；③repo 元数据是即刻生效公开门面与 README 分支态不同步——旧 description 是过时阶段叙事 | ①翻译同步核心是声明「谁权威」而非追求「双一致」——canonicalMarker＋结构守卫＋owner 字段三件套；②badge 只挂当下为真者，CI 徽记绑实跑绿事件；③无 owner 译文必死（17 天 11 译文全灭先例）；④门面工作范围→定位→语言→同步→视觉→社区→元数据七裁序可复用 | D-085~D-091 + R24-Q4 报告 |
| 2026-09-22 | 轮 25 grill 收口：6F 正名＋守卫纪律建制五裁（D-092~D-096）——五轮 atomcode 深调研全经账本 current 冲突核查零 revised | ①断言失效三分类——守的真坏→修现实／合法演化→改断言或入 XFAIL 册／欺诈（名不副实断言·死面守卫）→修检查面**禁入册**，册只收合法漂移类（字面钉普查 pass 复用 D-079 机制族：日期字面量/魔数地板/裸 occurred=== 检出须归因注记）；②断言名↔检查面一致——名声称可见面则检查物须在可见层，文本匹配先剥注释（73-check A4 先例）；存在≠活性三层：presence/liveness/readiness 断言命名分层（K8s 三态移植）；③枚举面 open/closed 声明制——声明 closed 才立成员级双向对账法（D-081 pending 镜像），常量集=单一权威源、文档枚举行派生或校验；成员级漂移禁入 XFAIL 册（文档债≠预期红）；reserved 成员仅外部输入面合法（cap≤2、生产者出现→FAIL、场景≤1 不建制）；④生成器/校验器双份机芯不共享——differential oracle 独立性是判力命根（tautological test 反模式），但独立性非布尔量：Knight–Leveson 共模失效主因=共享隐式规格歧义→规格显式化（census-contract 块钉正反例对不钉正则体）＋互等裁决断言比对契约 | ①失效断言先分类再处置，禁一律 XFAIL 洗绿；②枚举成员增删双向可机检才配称 closed 面；③机芯冗余要配分歧显式化机制否则塌成同义反复；④F 词宣言每句钉已命名+ADR 资产，撑不住的槽位宁缺毋滥 | D-092~D-096 + R25-Q1~Q5 报告 |
| 2026-09-22 | 轮 27 grill 收口：门面致谢建制+品牌资产边界+契约脏数据分层+窗口边界+xfail 摘除裁（D-098~D-102）——四轮 atomcode 深调研，一处触发 revised 规程（D-059①「不符即拒」收窄至协议级） | ①致谢枚举=active-only，谢未接入=roadmap 混 credit 撞 preview 诚实纪律；生成式锚段+regen-diff 对账强于手写枚举+字符串断言（钉集合非钉字面，manifest.meta.json 先比后写同型）；②品牌资产判据=真实消费面枚举优先于资产完整性（接触点驱动非阶段驱动），为不存在消费面预置资产=负期望（npm#10323 实证）；③契约违约分层判据=「重试/挽救同一批字节是否有意义」：协议级 fail-fast/字段级 quarantine——git 上游自身对病态 ident 选记录级宽容（620e92b 先例），宽容须「有界且被度量」（reason code+阈值+台账否则垃圾收容所）；④窗口拆分判据=主题一致性非改动类型一致性，回滚原子性定边界；非门禁 broken 红 SLA=限期立票非抢修非拖延（Fuchsia 政策同构） | ①XPASS 不得作摘除触发——归因本身是裁决证据（失配命中≠意图满足，GitLab :stale=rewrite-or-delete 域）；②断言体内 || 宽松分支=断言无牙族（能被错误原因满足=平时假安心 XPASS 假信号），mutation 检验=「意图未满足世界里必须红」；③调研报告引述本仓实物须实证防知识库串仓幻觉（docs/brand 24 文件误召回实证剔除）；④null 必须是毒值非默认值（当 0 处理=静默谎言注入） | D-098~D-102 + R27-Q1~Q5 报告 |
