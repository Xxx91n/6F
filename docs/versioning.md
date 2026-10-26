# 版本与上游锁定纪律（versioning.md）

> 来源：decision-ledger D-037（grill 轮 7 Q1，2026-09-15 拍板）＋ 版本与编年制度。本文是版本策略与上游锁定的唯一成文口径。

## 1. 产品版本纪律（0.x）

- 0.x 单调递增、号不复用；minor = 契约变更、patch = 修复；**不回退发旧线补丁**。
- 每个 preview 里程碑对应一个 tag（首个 preview tag = 0.1.0 候选，#41 窗口）。
- **1.0 退出条件（写死，不按日历）**：报告 schema 冻结 + 已接上游适配器全过确定性验收。

## 2. 报告契约（独立于产品版本）

- `report_schema` 独立版本号，minor 单调向后兼容。
- 报告头固定字段：`stability: "preview"` ＋ `capabilities: [...]` ＋ provenance 锚含锁定表快照 hash ＋ `superseded_by` 归档互链（旧报告不作废而换戳，per Dual Reporting）。
- 披露块（synthetic fixture / ⚠ 数据未接 / capability N of 5）与本节字段为**同一契约面**——报告 schema 票与 #45 各落一处引用，禁止两处手抄。

## 3. 上游锁定表（`engine/upstream-lock.yaml`）

- 机读权威；README §3 上游清单表为人读形态、状态列须与本表同源。
- 字段：`id / kind / version / pin_type(exact-version|commit-sha|digest|api-version) / contract / status(active|planned|evaluating|retired) / adapter / last_reviewed / next_review`（`api-version` 为 #47/D-048 remote-api 行引入：远端 API 按 X-GitHub-Api-Version 头 pin，非制品版本）。
- 复审留痕字段（#43 引入，**非** 九字段契约面，值为一行散文）：`review_evidence`=本次实跑复核的命令与读数（刷新 `last_reviewed`/`next_review` 的凭据，缺此即不得刷新）；`review_deferred`=复审缓办标记＋原因＋重核触发（该行两日期保留原值不刷新，仍由 `44-check` C5 advisory 点名）。`review_deferred`（复审缓办）≠ registry `deferred-faces`（未采集面不归位）——同词不同域，引用时点明字段名。
- **锁定表先于依赖存在**——planned 登记目标契约，禁止未 pin 接入；retired 行不删（旧报告 provenance 反查）；`^`/`>=`/浮动 tag 全禁。
- 种子行（#44 落盘）：codelore=active（exact-version＋`--version` pin 契约）／scorecard=planned、repomix=retired（D-056，重开触发器登记于 registry）／sqlite-dump=evaluating（风险注记）；github-rest=planned（remote-api kind，#47/D-048）。
- **基准语料分册（#33／ADR-0026）**：被审计同级仓的冻结快照**不属本表**——唯一权威＝`engine/baseline-lock.yaml`（字段 `id / kind / version / pin_type / status / contract / adapter / materialization / bundle / bundle_bytes / bundle_sha256 / last_reviewed / next_review`；另加复审留痕字段 `review_evidence`，口径同本节第 3 条；`status` 只有 active|retired；三元钉 version＋bundle_sha256＋bundle_bytes 须同窗更新，`85-check` A10~A13 机检；复审节奏同 §4）。该表**不随 tgz**（消费方是仓内守卫，语料 bundle 在测试夹具内不入包）。理由：本表的 status 枚举与 README 致谢面闭账是「产品上游」语义，基准语料是「被审计基准仓」，旧表用 `status: planned` 承载已生效的钉属枚举位妥协（#32）。

## 4. 更新节奏

- **禁 Renovate 式自动升级**——detector 版本变化 = 审计口径变更。手动窗口：每 release 前一次，bump 必须全量 golden 回归护航。
- **逾期逐行处置（#43 盘点纪律）**：`next_review` 到期行只能二选一——①实跑复核该行自己的契约面（守卫/单测/命令读数）通过→刷新 `last_reviewed`＋`next_review`（新窗=每 release 前或 ≤30 天先到者）并回填 `review_evidence`；②确无实跑面→写 `review_deferred` 保留原逾期日期。**禁无证据批量刷新日期**；复审只动日期与留痕字段，pin 版本改动一律走手动窗口＋全量 golden 回归。
- **登记日取 UTC 日**（#43 CI 勘误）：`44-check` C3「全行 `last_reviewed` ≤ today」在 CI 侧用 runner 本地（=UTC）日判，业务时钟的 `.scratch` 日报输入在 CI 缺席；+08 等超前宿主在凌晨按本地日登记会把六腿全打成「未来登记」红（2026-10-26 本地凌晨实证）。C5 逾期判定同受此基准影响，故刷新窗口一律以 UTC 日为起点。**守卫承接**：`44-check` C3 的上界改判「业务时钟 ∩ UTC 日」之较严者，失败行输出 `upper/biz/utc/bad` 三个时钟读数——超前宿主的本地日登记在本机即红，不再只在 CI 暴露。
- 漂移检出语义：报告不作废而「换戳」——重跑生成新戳报告，旧报告归档＋`superseded_by` 互链。

## 5. 门禁（advisory → enforce 两段式）

守卫族并入 #44：①工具链一致性 job（实际 `--version` == 锁定表，前置快速跑）；②锁定表新鲜度（`next_review` 逾期报警）；③三处 preview 标注同源校验（marketplace/报告头/文档 capability matrix）；④golden diff。
