# Known-Gaps 台账（quarantine 覆盖缺口登记册）

> 立法出处：D-100⑤「新 reason code=契约覆盖缺口信号登记 known-gaps 台账」+ D-113① 台账形态字段集。
> 分工（D-113② 单向权威）：本册=缺口语义唯一权威（gap_id/reason_code/证据链/status/owner/review_by）；
>   `.scratch/architecture-recovery/reports/33-gate-registry.json`=立法触发器册（只持五要素触发器字段，
>   禁复制缺口语义；trigger_id 单向外链 registry，registry 不反写本册）。
> 检测面（D-113③）：quarantine_log SQL 派生信号（UNCLASSIFIED_FIELD_ANOMALY 出现/新码首见）→ 人审登记——
>   自动信号≠台账条目（自动 intake→人审→裁决登记三层）。

字段：gap_id / reason_code 族 / first_seen 证据链（repo+sha+raw 引用）/ status（observed→triaged→legislated）/ owner（到人/角色）/ notes / review_by / trigger_id（可空）。

| gap_id | reason_code 族 | first_seen 证据链 | status | owner | notes | review_by | trigger_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GAP-078-01 | unclassified_field_anomaly（committer_date） | 6F 自带回归链 macro-b-regression run 35581038342：git/git 仓 committer tz=`" INDIA"` 致 %cI 输出病态；复现=engine/test/quarantine.test.mjs G5-G10 合成 fixture（hash-object --literally tz=+GGGG → %cI 字面量） | legislated | devin-agent | %cI 病态→quarantined 收编而非全仓崩；39/40 对照物侧=「解析失败」预期分歧格（D-118①，对照物无 quarantine 语义属合规） | 2026-10-23 | — |
| GAP-078-02 | anchor_head_date_malformed（head_date） | 合成 fixture：HEAD commit committer tz=abc/空 → %cI 字面量锚病态；engine/test/quarantine.test.mjs G11-G14 | legislated | devin-agent | 锚病态→verdict=unsupported/anchor_malformed + fact 零行（observed_at NOT NULL 不落伪值）+ quarantine_log 行 recorded_at=NULL 显式留痕 | 2026-10-23 | — |
| GAP-078-03 | oversize（>64KiB raw_bytes） | 合成边界：65536 恰界不截 / 65537 截断（quarantine.test.mjs A6-A7/B2-B4）；实测语料 %cI 长度∈{20,25}，64KiB≈2600× headroom 保守上界 | legislated | devin-agent | raw_bytes 截断三件套（is_trunc 注：禁词表兼容名/original_length/sha256_full 全量哈希）——截断声明可机验，完整现场 git 内容寻址重放兜底 | 2026-10-23 | — |
| GAP-078-04 | normalized_tz_offset（+00:00→Z） | 合成：'2005-04-07T22:13:13+00:00' → normalized disposition；quarantine.test.mjs A3/C2 | legislated | devin-agent | 合法改写留痕不打 ⚠（防标记疲劳）；进 quarantine_log disposition=normalized 行 | 2026-10-23 | — |

## 治理注记

- **未枚举组合 fail-loud**（D-118②）：parity 矩阵未枚举格（如 39 产出与 cli 本应值相同的「可疑一致」）默认判 FAIL 记 warn——沉默不是兜底。
- **词表进场纪律**（D-119②④）：新 reason_code 走「quarantine_log 信号→本册 observed→人审 triaged→立法 legislated→ACCEPTED_REASON_CODES 基线收窄」全流程；加码非破坏、删改破坏。
- **is_trunc 命名注记**：列名非 is_truncated——append-only 黑名单为子串扫，`TRUNCATE` 会误伤含该子串的标识符；语义不变（D-117 截断标记位）。
- **复核节奏**：review_by 到期行须重审 status（Copla 腐化防线：无复核节奏表格册 18 个月后还列着不存在的系统）。
