# 版本与上游锁定纪律（versioning.md）

> 来源：decision-ledger D-037（grill 轮 7 Q1，2026-09-15 拍板）＋ ADR-0018。本文是版本策略与上游锁定的唯一成文口径。

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
- **锁定表先于依赖存在**——planned 登记目标契约，禁止未 pin 接入；retired 行不删（旧报告 provenance 反查）；`^`/`>=`/浮动 tag 全禁。
- 种子行（#44 落盘）：codelore=active（exact-version＋`--version` pin 契约）／scorecard、repomix=planned／sqlite-dump=evaluating（风险注记）；github-rest=planned（remote-api kind，#47/D-048）。

## 4. 更新节奏

- **禁 Renovate 式自动升级**——detector 版本变化 = 审计口径变更。手动窗口：每 release 前一次，bump 必须全量 golden 回归护航。
- 漂移检出语义：报告不作废而「换戳」——重跑生成新戳报告，旧报告归档＋`superseded_by` 互链。

## 5. 门禁（advisory → enforce 两段式）

守卫族并入 #44：①工具链一致性 job（实际 `--version` == 锁定表，前置快速跑）；②锁定表新鲜度（`next_review` 逾期报警）；③三处 preview 标注同源校验（marketplace/报告头/文档 capability matrix）；④golden diff。
