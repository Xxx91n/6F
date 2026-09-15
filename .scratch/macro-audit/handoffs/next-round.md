# 常驻任务书 — 轮 6（R4 执行轮：量测效度先行 → 序列化校准）

> 生成：2026-09-15 grill 轮 5 收口整理环节。上一轮结果与权威文件指针见 .scratch/macro-audit/decision-ledger.md「轮 5 收口对账」节与 .scratch/architecture-recovery/handoffs/closeout-2026-09-14.md（R3 收口，仍有效）。
> 唯一事实源：docs/adr/0001~0016 + CONTEXT.md（50 词）+ 两本账本（D-001~D-028 / A-001~A-030）+ spec-phase-tasks.md（含 R4 节）。开工前先读这些，不许凭记忆。

## 任务（每项声明覆盖 D-xxx）

- **T0 立票（先行，串行门）**：按 $to-spec / $to-tickets 把 spec-phase-tasks.md R4-01~05 展开为 architecture-recovery 账本 A-031 起 + issues/handoffs/prompts（NN-slug ≤60 行硬规则）+ README 波次表 W7+ 排程；波次 = R4-01 → （R4-02 ∥ R4-03）→ R4-04 → R4-05 严格序列化（并行仅 T2/T3 且验收互不引用为完成条件）。**覆盖：D-023、D-024、D-025。**
- **T1 阶段 1.5 量测审计（R4-01）**：14 份 ADR（docs/adr/ 全集）人工真值表 + 逐份 delta 表模板；区分 detector 漏认（内联 Nygard 格式）vs 真实缺失；产物是 R4-02 验收 golden set + 原 TC-2 RED 记 invalid 的逐份可归属原因；纯文档零构建。**覆盖：D-025（+D-024 两字段登记纪律）。**
- **T2 判据 v2（R4-02）**：adr-structure detector 接线 A-002 回退链（YAML→内联→git 首提交）；v1 留档禁改；验收 = 与人工真值表一致率；对冻结首报数据重跑 → 并列读数 + 勘误披露（重测次数与判定规则事先写死，禁 testing into compliance）；构建/测试走 CI。**覆盖：D-025。**
- **T3 ADR 治理卫生票（R4-03）**：6F 真实五件套缺失清零（以 T1 人工读数的真实缺失分解为准入范围）；验收独立于 T2——两票互为引用、互不为完成条件。**覆盖：D-025。**
- **T4 C 层 disposition 补记**：T1~T3 结题后按 reopen 惯例补记 disposition（architecture-recovery 账本 C 裁定节追加，不改写原文与时间戳）；勘误式双读数发布（原 RED 不撤回 + 成对动作说明）。**覆盖：D-025、D-017。**
- **T5 阶段 2a 冻结校准（R4-04）**：10 项 desk 清单（任务 2/4/8/9/10/11/12/13/14/15/16 + 任务 5 已锚行 + 任务 7 单写者域草案）；草案全部标注置信域（单写者证据禁外推多写者）；待探针占位带「满足判据+复审时点」。**覆盖：D-023、D-024。**
- **T6 阶段 2b CodeLore 单上游探针（R4-05）**：前置 = 运行时解析策略判定（容器捆绑 vs 二进制发现，D-020 派生待决）+ 读 Agent Plugins 1.0.0 plugin schema 原文（P1 预核对 baseline 顺手做）；适配器 + 锁版本 + golden 契约测试（ADR-0014 纪律：适配层禁业务规则）；重跑 6F 首报同仓 + 同 spec 版本 diff；provenance 锚定（commit pin + spec 版本 + data fingerprint）；产物 = 数据源漂移报告 + 任务 1/3 实测锚 + README 上游清单 CodeLore 行状态更新（$readme-crafter-skill，不虚报）。**覆盖：D-023、D-024、D-020。**
- **T7 #25 挂门值守（贯穿每轮收口）**：核对 25-rollout-checklist.md 拍板状态列——触发事件已发生而未拍的行，1 个工作日内升级用户拍板；到期未触发的行按硬到期日重组改绑一次。**覆盖：D-026、D-027。**

## 纪律规则（不可协商）

1. 【防丢】每个用户确认的实质结论当场追加 decision-ledger.md；任何压缩/compact/handoff 前先确认账本已落盘到最新。
2. 【数据源】整理的唯一数据源 = 账本；认为存在但账本没有的结论 → 列出并停下问，不许直接写进文档。
3. 【对账闸】整理环节 = 枚举 current → 逐条去向 → 无去向清单非空即停。
4. 【冲突协议】调研结论与 current 决策冲突 → 禁止静默改向：对应 D-xxx 标 revised（保留原记录）+ 新 D-xxx 呈报等拍板。
5. 【VCS】$but 全程；push/land 属用户闸门；本轮例外只在用户明示时。构建/测试一律 CI，本机仅轻量 node 断言（守卫脚本模式：reports/NN-check.mjs + exit 0 + PASS/FAIL）。
6. 【原子性】票产物落 reports/、守卫随票；账本行状态由执行窗口写、收口窗口复核核实。

## Suggested skills

- $but —— 版本控制（立分支/commit/收口时 land+push 需用户明示）
- $to-spec / $to-tickets —— T0 立票链
- $implement —— 票执行（drives tdd at pre-agreed seams，收口 code-review）
- $atomcode-research —— T6 运行时解析策略调研（串行、-p 只放问题、timeout 600000、锚点留证；配额中断走 resume anchoring 不杀进程）
- $readme-crafter-skill —— T6 后上游清单状态列更新
- $domain-modeling —— 新术语/ADR 锐化（CONTEXT.md 只放词汇，实现决策进 docs/adr/）
- $grill-with-docs —— 若 T6 前置调研与 D-020/D-023 冲突需重新下探时
- $handoff / $neat-freak —— 轮 6 收口归档与知识治理
