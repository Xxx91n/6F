# R52 T3 退役呈裁单 —— check-kit-regex-blindspot-watch 处置（2026-09-30）

> 呈裁面：T3 审计窗逐件窗（D-160①「退役判据=面消亡唯一合法路径」＋D-160②「经 T3 窗逐件非批量」）。本单=**呈裁提议**，不含执行裁定；裁定归 T3 窗。
> 任务书依据：轮 52 T1-B「check-kit-regex-blindspot-watch『摘除或降级常规自检』处置提议入 T3 呈裁单」。

## 1. 事实基线（机检读数，非自述）

| 项 | 读数 | 证据命令 |
|---|---|---|
| 病灶根治状态 | fixture 18/18 ＋ golden 零误删 ＋ 70-check 回迁 PASS 13/13 ＋ 迁入闸退役 ＋ GAP-CK-01 closed | R51 执行批报告 §1（`.scratch/macro-audit/reports/2026-09-30-r51-report.md`） |
| registry 登记面 | **零命中**——`33-gate-registry.json` 全文 `check-kit` 命中 0 次／`blindspot` 命中 0 次 | `grep -c check-kit 33-gate-registry.json` → 0 |
| 现存登记位 | 仅账本侧「T3 审计窗哨兵读数」表一行（`.scratch/macro-audit/decision-ledger.md`） | 账本 T3 表 check-kit-regex-blindspot-watch 行 |
| 守护面是否消亡 | **否**——`stripComments` regex 字面量态仍为 `_lib/check-kit.mjs` 活跃消费面（21 守卫消费位在册） | `_lib/check-kit.mjs` 现存 ＋ `70a-check`/73-check 等消费位 |
| 退役通道 | manifest `retired[]` 空类 ＋ `_retired/` 归档目录在位（仅 README） | `75a-check.mjs M3` PASS（retired=0 bad=0） |

## 2. 两候选对照

### 候选 (i) 摘除（retired 类终态留档）

- **不合 D-160⑥**：退役判据＝守护面消亡。本面未消亡（`stripComments` regex 态为活跃共用面），摘除即以「病灶已根治」替代「面已消亡」作退役依据——与 D-160⑥「断言量/年龄/通过史不作退役判据」同型误用。
- 附带矛盾：摘除需 manifest retired 条目八要素齐备 ＋ 归档实物存在，而归档实物不存在（`_retired/` 空），M3 断言将转红。

### 候选 (ii) 降级为常规自检 ＋ 补注册

- 与 D-160⑥ 一致：面存续则哨兵不摘除，改以低频盘查承载。
- 补注册必要性（D-164-b「未注册触发器不算锚定」）：该哨兵当前**仅存于账本散文表**，registry 零条目——即无 `review_event` 机读锚、无 `verify_method`、无 `owner` 三要素可机检。T3 表是人工清单，非注册面。

## 3. 呈裁提议（推荐 (ii)）

**提议**：`check-kit-regex-blindspot-watch` 降级为常规自检，并补 registry `manual_watch` 条目，字段按既有五要素齐备：

- `family`: `guard-baseline`
- `watch`: `manual_watch`
- `status`: `pending`
- `review_event`: `next-audit-window`（与 guard-retirement-class 同节律）
- `trigger_event` / `trigger`: null ＋ 「`_lib/check-kit.mjs stripComments` 新增 JS 语法形态（regex/除号歧义/模板串内 regex）时提前触发」——**面演化驱动非日历驱动**（D-164-b）
- `verify_method`: 每审计窗跑 `node .scratch/architecture-recovery/reports/check-kit-regex-check.mjs`（fixture 四态红绿分野 ＋ golden 零误删对照 ＋ 迁入闸探测件）读数登记；`detectRegexHazards` 新增命中形态即立修批
- `bound_to`: D-184②④（根治落地）＋ D-192（指针守卫件同批落盘——两条面共享「共用工具函数面新增语法形态需机检回归」这一失效族）
- `source`: `.scratch/macro-audit/decision-ledger.md` R51 grill Scoping 声明节（登记面）

**显式驳回入去向表**：候选 (i) 摘除——驳回依据＝D-160⑥ 守护面未消亡（面消亡唯一合法路径）。

## 4. 同窗随呈：84-check 首跑孪生/孤儿残留条目

| 项 | 读数 | 判级 | 呈裁态 |
|---|---|---|---|
| 孤儿孪生 `201935fc7764c3a3716a0400cd603a76ef5b5cec` | `merge-base --is-ancestor` 对 `main`／`HEAD` 双非零 | WARN（`PV-UNREACHABLE`） | **已在册 PV-05 ＋ 勘误 E-4/E-1 覆盖**，无需新裁；可达性留人工复核（D-190④） |
| 同 change-id 孪生桶 `nktntvkkwqtrnqxwmtokzulttpowxnpp` | 桶成员 2：`201935fc` ／ `cb625c64521398306f914eb7986a4a505f95291a` | WARN（`PV-TWIN-BUCKET`） | 同上，**风险披露非违规**（D-190④ 既定 WARN 位） |

## 5. 复验钩

- [ ] T3 窗裁定行在账本「T3 审计窗哨兵读数」表在场（采纳 (ii) 或改采其他）
- [ ] 采纳 (ii) 时 registry 条目落盘 ＋ `33-check.mjs` E 段 manual_watch 扫描绿
- [ ] 采纳 (i) 时 manifest retired 八要素 ＋ `_retired/` 归档实物 ＋ `75a-check M3` 绿

---

**呈裁单边界**：本单不修改 registry、不改 manifest、不改 `_retired/`——三面均为裁定后执行面（D-160② 逐件窗）。
