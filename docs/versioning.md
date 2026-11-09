# 版本和上游锁定规则

> 来由：D-037（grill 轮 7 Q1，2026-09-15 定）＋版本和编年制度。这份文件只管版本规则和上游锁定。

## 1. 产品版本（0.x）

- 0.x 只往上涨，号不复用；minor 是契约变更，patch 是修复；**旧版本线不回头补 patch**。
- 每个 preview 里程碑对应一个 tag（首个 preview tag = 0.1.0 候选，#41 窗口）。
- **1.0 的退出条件（写死，不看日历）**：报告 schema 冻结，并且接上的每个上游中间层都通过确定性验收。

## 2. 报告契约（和产品版本分开）

- `report_schema` 用自己的版本号，minor 只往后兼容。
- 报告头固定字段：`stability: "preview"` ＋ `capabilities: [...]` ＋ 出处锚含锁定表快照 hash ＋ `superseded_by` 归档互链（旧报告不作废，只换戳，按 Dual Reporting）。
- 说明块（机器键 `preview_disclosure`；内容含 synthetic fixture / ⚠ 数据未接 / capability N of 5）和本节字段是**同一个契约面**——报告 schema 票和 #45 各写一处引用，不要两处手抄。

## 3. 上游锁定表（`engine/upstream-lock.yaml`）

- 机器读的权威；README §3 上游表给人看，状态列必须和本表一致。
- 字段：`id / kind / version / pin_type(exact-version|commit-sha|digest|api-version) / contract / status(active|planned|evaluating|retired) / adapter / last_reviewed / next_review`（`api-version` 是 #47/D-048 为 remote-api 行加的：远端 API 按 X-GitHub-Api-Version 头固定，不是制品版本）。
- 复审留痕字段（#43 引入，**不是**九字段契约面，值是一行说明）：`review_evidence`=这次实际跑过的复核命令和读数（刷新 `last_reviewed`/`next_review` 的凭据，没有它就不能刷新）；`review_deferred`=复审缓办标记＋原因＋重核触发（该行两个日期保留原值不刷新，仍由 `44-check` C5 提醒并点名）。`review_deferred`（复审缓办）≠ registry 的 `deferred-faces`（没采集的面还没归位）——同一个词、不同地方，引用时写清字段名。
- **锁定表先于依赖存在**——planned 只登记目标契约，不许没固定版本就接入；retired 行不删（旧报告还要靠它回头查）；`^`/`>=`/浮动 tag 全禁。
- 种子行（#44 写入，状态以 `engine/upstream-lock.yaml` 现行为准）：codelore=active（exact-version＋`--version` 固定契约）／scorecard=planned、repomix=retired（D-056，重开触发器登记在 registry）／sqlite-dump=evaluating（风险说明）；github-rest=active（remote-api kind，#47/D-048——种子行写入时是 planned，中间层落地就翻，`47-check E1` 检查）。
- **基准语料另立一册（#33／ADR-0026）**：被审计同级仓的冻结快照**不属于本表**——唯一来源是 `engine/baseline-lock.yaml`（字段 `id / kind / version / pin_type / status / contract / adapter / materialization / bundle / bundle_bytes / bundle_sha256 / last_reviewed / next_review`；另加复审留痕字段 `review_evidence`，规则同本节第 3 条；`status` 只有 active|retired；三个固定值 version＋bundle_sha256＋bundle_bytes 必须在同一个窗口更新，`85-check` A10~A13 检查；复审节奏同 §4）。该表**不随 tgz 走**（用它的是仓内检查脚本，语料 bundle 在测试夹具里，不进包）。理由：本表的 status 枚举和 README 致谢面的闭账是「产品上游」的意思，基准语料是「被审计的基准仓」，旧表用 `status: planned` 装已经生效的固定值，是枚举位的将就（#32）。

## 4. 更新节奏

- **不许 Renovate 式自动升级**——检测器版本一变，审计规则就变。手动窗口：每次 release 前一次，bump 必须跑全量 golden 回归。
- **逾期逐行处理（#43 盘点规则）**：`next_review` 到期的行只能二选一——①实际跑一遍该行自己的契约面（检查脚本/单测/命令读数）通过→刷新 `last_reviewed`＋`next_review`（新窗=每次 release 前或 ≤30 天，谁先到算谁），并回填 `review_evidence`；②确实没有实跑面→写 `review_deferred`，保留原来的逾期日期。**不许没证据就批量刷新日期**；复审只动日期和留痕字段，固定版本要改一律走手动窗口＋全量 golden 回归。
- **登记日用 UTC 日**（#43 CI 勘误）：CI runner 没有业务时钟的 `.scratch` 日报输入，`44-check` 的日期判断在 CI 侧变成 runner 本地日（=UTC）；+08 这类超前宿主在凌晨按本地日登记，会把六条任务全打成「未来登记」失败（2026-10-26 本地凌晨实测）。两条断言各自处理：**C3（非未来登记）** 上界＝「业务时钟 ∩ UTC 日」里较严的那个，失败行输出 `upper/biz/utc/bad` 三个时钟读数——超前宿主按本地日登记，在本机就失败，不再只在 CI 才暴露；**C5（逾期提醒）** 意思和基准没动，仍按业务时钟判 `next_review`（提醒段）。规则侧以 UTC 日为登记起点：`last_reviewed` 只能 ≤ UTC 今天，`next_review` 从这个起点推 ≤30 天。
- 发现不一致时：报告不作废，只「换戳」——重跑生成新戳报告，旧报告归档＋`superseded_by` 互链。

## 5. 检查（先提醒，后强制）

检查脚本并入 #44：①工具链一致性 job（实际 `--version` == 锁定表，先快速跑）；②锁定表新鲜度（`next_review` 逾期提醒）；③三处 preview 标注同源校验（marketplace/报告头/文档能力状态表）；④golden diff。
