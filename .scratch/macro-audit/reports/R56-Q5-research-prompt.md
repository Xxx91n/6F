# R56-Q5 调研题面 —— supply-chain 象限解排：时点与源选择

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale）；Macro-B=单仓四象限评审（结构/行为/供应链/战略）。

R56 已裁（current）：D-203 子枝序 B3→B1→B2→B4→B6；D-204 preview 法理边界；D-205 structure 解排（分层分工成文+facts 层 golden 闸三断言）。本题为 B2 本体。

supply-chain 象限现状（代码级实证）：
- 象限位在跑：not_applicable＋verdict_gate override_reason=「⚠ 数据未接——Scorecard/repomix 按层需求队列接入不插队（D-034③）」；conflict_markers=['data-not-connected']——诚实披露形态正常运作
- engine/src/upstream/ 仅两个适配器：codelore.ts、github-rest.ts——**无 scorecard 模块**，接入=绿地上游集成（descriptor+collector faces+golden+quarantine 语义，github-rest 先例可抄）
- repomix-gitingest 轮13 已退役（retired 锁表＋重开触发器，D-054⑥）——supply-chain 候选源=OpenSSF Scorecard（公共 API scorecard.dev 或 Go binary）/deps.dev/OSV/manifest 级
- CONTEXT Macro-B 词条预定数据源=CodeLore+OpenSSF Scorecard

已裁约束（current）：D-034③「Scorecard/repomix 按层需求队列接入不插队」——supply-chain 象限本身即层需求位，排队自指；D-054 supply-chain 维持排队；D-204 preview=用户可达交付面（接入后须命令面可达才计入 preview）／ADR-0014 上游集成双轨+vendor 逃生舱+防腐层禁业务语义／ADR-0013 预声明判据／ADR-0015 量测效度先行／D-080④ 文档单源真值＋映射常量块。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md。

## 候选

- **(i) 本轮解排立票**：Scorecard 适配器新建 API-first（公共 API 零二进制依赖，Go binary 作 dual-track 退路位 ADR-0014）；收益=四象限全活读数 Macro-B 名实首次全齐
- **(ii) 降源解排**：先接轻源（deps.dev/OSV/manifest 级依赖事实）产部分读数，Scorecard 续排——象限语义变窄，披露面须写 partial
- **(iii) 续排**：披露在跑无伪报；无消费压力；留 B6 GA 判据面统一议
- **(iv) 象限语义重定义**：改用现有 facts（git 依赖 churn/lockfile/vendored 检测）不接新上游——语义从供应链安全姿态降为依赖形态，须重新立词条

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 D-034③「按层需求队列」的触发语义（supply-chain 象限调度即需求触发？）、ADR-0014 适配器形态合规点；
2. **工业界心智模型为重点**：OpenSSF Scorecard 三种接入面成熟对比（公共 REST API 覆盖度/配额/稳定性 vs Go binary 子进程 vs GitHub Action 制品消费——scorecard 官方档/scorecard.dev API 文档/osv.dev/deps.dev API 对比）；供应链安全度量象限的成熟最小集（SLSA/SBOM/SCA 生态中 scorecard checks 的优先级共识——哪些 check 是主流 MVP 面）；「queued 能力接入时点」判据先例（需求拉动 vs 覆盖率完满驱动的象限补齐次序）；上游数据源可用性风险（scorecard.dev API 现状/限流/auth——2025-2026 实证）；
3. 辩证要求：逐候选给支持与反对论据；API-first 的单点依赖风险（公共 API 配额/停服）与 binary 的供应链体积代价对比；任何与账本 current 冲突显式点名 D-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
