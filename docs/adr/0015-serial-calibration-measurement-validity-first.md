# ADR-0015: 阶段 2 = 序列化校准（量测效度先行：R4-01 真值表 → v2∥治理 → 2a → 2b）
> 勘误补记（D-056，2026-09-17）：「Scorecard/repomix 推到阶段 3 逐组件接入」中的 repomix-gitingest 已退役（planned→retired，锁表行留档；原用途被「宿主 agent 恒在」抽空）；Scorecard 维持 planned 按层需求拉动不插队。决策本体（串行校准/量测有效性优先）不改写。

- Status: accepted
- Date: 2026-09-15
- Deciders: 用户（grill 轮 5 Q2/Q3/Q4，经 atomcode R5-Q2/Q3/Q4 深调研呈报后拍板）
- Ledger: D-022（revised）→ D-023 / D-024 / D-025（current）

## Context

阶段 1 首报闭环（C 层裁定 supported）后，「源码为什么还不往前走」暴露三个连环问题：阶段 2 的 16 项缺口校准是否应与上游组合件接入同期（双重变量风险 vs 纸上谈兵风险）；缺口该走 desk 还是走实测的数据依赖没有判据；首报遗留的 TC-2 RED（S2b 五件套完整度 mean_ratio 0.2462）处置方向悬而未决——而 A-002 已证实工业界 ADR YAML 头采纳率 <1%、其交付的回退链从未接入 TC-2 detector，RED 读数里量测误差与真实缺失未分解。

## Decision

阶段 2 保持 ADR-0012 四阶段串行主干不变，内部结构定版为序列化校准，插入**阶段 1.5**：

1. **三问决策树**为全部缺口的归类判据（D-024）：未知变量是外部工具输出形态/语义/规模 → 上游探针；是自家系统在负载/争用下的行为 → 自证探针（self-probe），实测归铺开阶段；可由 spec 契约 + 冻结数据推导 → desk。
2. **阶段 2 拆 2a/2b 严格序列化**（D-023）：2a 在冻结首报数据上纯文档校准；2b 只接一个上游（CodeLore，覆盖任务 1/3/10），重跑同仓 + 同 spec 版本 diff，provenance 锚定，单变量归因。Scorecard/repomix 推到阶段 3 逐组件 strangler 式接入，避免三个上游大爆炸集成。
3. **量测效度先行**（D-025，FDA OOS 两阶段调查规程同构）：TC-2 RED 处置 = 阶段 1.5 人工真值表（14 份 ADR 逐份对照，先于一切 v2 代码）→ 判据 v2 追加（接线 A-002 回退链，v1 留档，验收 = 真值表一致率）∥ ADR 治理卫生票（验收 = 真实缺失清零）——两线预注册互不为完成条件；发布走勘误式双读数：原 RED 不撤回不覆盖，RED→绿唯一合法通道 = 「原读数记 invalid（附逐份可归属原因）+ 修正读数成为 reportable value」成对动作。

## Considered Options

- 纯文档回流、上游全推阶段 3（α）：被否——「缺口全貌」部分只能经探针可见（CodeLore narrative 受环境门控、Scorecard probe 字段形状须实跑固化），纸面校准这些项 = outrunning headlights；且三上游全堆阶段 3 = 大爆炸集成。
- 阶段 2 同期全量接上游（β）：被否——换数据源与校 spec 双变量混杂，校准 diff 无法归因。
- 只修 ADR 头取绿（TC-2 方案 a）：被否——量测效度未确认前改被测对象迁就 detector = teaching to the test，与改 detector 迁就被测对象在同一对称判据（规则是否先于结果存在且有独立出处）下等价不合规。
- 只追加判据 v2（方案 b）：被否——无 ground truth 的重测无法验收修正幅度。

## Consequences

- 「信任并行动」的 C 层 disposition 按 reopen 惯例待阶段 1.5 补毕后再落——不改写已入库裁定原文与时间戳（不可变纪律）。
- 本 ADR 是「量测效度先行」纪律的产品首个实例；后续任何判据修订均循「真值表在前、双读数并列、互不为条件」模板。
- 排期落点：计划表 R4-01~R4-05（spec-phase-tasks.md 第五轮节）；任务 7 原前置「CodeLore DuckDB schema 复审」判为类别错放、已标 stale 并按域拆分。
- 出处：atomcode R5-Q2（阶段拆分 γ 路径）/ R5-Q3（三问决策树 + Iceberg single-writer 先例）/ R5-Q4（FDA OOS + CAPA + dogfooding 三先例）三份报告，.scratch/macro-audit/reports/。
