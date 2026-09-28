# Known-Gaps 台账（quarantine 覆盖缺口登记册）

> 立法出处：D-100⑤「新 reason code=契约覆盖缺口信号登记 known-gaps 台账」+ D-113① 台账形态字段集。
> 分工（D-113② 单向权威）：本册=缺口语义唯一权威（gap_id/reason_code/证据链/status/owner/review_by）；
>   `.scratch/architecture-recovery/reports/33-gate-registry.json`=立法触发器册（只持五要素触发器字段，
>   禁复制缺口语义；trigger_id 单向外链 registry，registry 不反写本册）。
> 检测面（D-113③）：quarantine_log SQL 派生信号（UNCLASSIFIED_FIELD_ANOMALY 出现/新码首见）→ 人审登记——
>   自动信号≠台账条目（自动 intake→人审→裁决登记三层）。

字段：gap_id / reason_code 族 / first_seen 证据链（repo+sha+raw 引用）/ status（observed→triaged→legislated；accepted-risk=RA 五要件齐备封闭终态，D-169-b②——档案位 docs/ra/）/ owner（到人/角色）/ notes / review_by / trigger_id（可空）。

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

## 批2-β 登记批（轮39 D-155①/D-156②——技术债＋宿主观察面，两全形态：节级条目＋逐件 mini-五要素）

| gap_id | reason_code 族 | first_seen 证据链 | status | owner | notes | review_by | trigger_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GAP-B2B-01 | tech_debt（guard_writes_worktree_artifact） | 75a-check.mjs 每跑写 findings 工件落工作树；r37 审计呈报＋75b-disposition-draft §3-④ | triaged | 仓内值守 | 守卫写工作树属设计内面——登记为债非缺陷裁定；处置方向=工件归位、dry-run 产物走独立工件位（D-154② 转窗伴生） | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-02 | tech_debt（hand_rolled_indexof_parser） | 41a-check.mjs 手写 indexOf 解析器（无依赖引入偏好代价面）；r37 审计呈报 | triaged | 仓内值守 | 功能正确，维护成本登记；引入解析库须走依赖引入裁定链 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-03 | tech_debt（fail_slug_regex_coupling） | guard-all-run.mjs FAIL-slug 正则耦合 check 文件名约定；r37 审计呈报 | triaged | 仓内值守 | 命名约定即契约面——slug 正则与文件名同命漂移；check 改名须同步改正则 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-04 | tech_debt（inline_spawnSync_residual） | N5：37-check.mjs 残余 inline spawnSync 未走 check-kit；r38-t1 审计 N 族 | triaged | 仓内值守 | check-kit 收编渐进的未竟项 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-05 | tech_debt（gitout_status_blindspot） | N6：check-kit gitOut 不检 spawnSync status——false-green 方向性风险；r38-t1 审计 N 族 | triaged | 仓内值守 | 八件中最高优先面：git 静默失败可致守卫假绿；处置方向=gitOut 内建 status/error 检查 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-06 | wording_precision（parity_full_equality） | T1-N1：debrief「字段级 parity 全等」表述过强——实态 report.json 70 键中 69 全等、唯一差=evidence[].reproduce_cmd 含 per-run 输出路径自引；trials/codebuddy-r38-report.md | triaged | 仓内值守 | 对外口径须用精化表述「字段级 parity（语义锚全等；reproduce_cmd 含 per-run 路径差）」 | 对外转述/发布材料前（里程碑锚）＋批2-β 后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-07 | doc_drift（comment_impl_mismatch） | N1：25-check.mjs:79 注释与实现不符；r38-t1 审计报告声明归批2-β 补录——去向断链经 R39-Q4 核查捞出，D-156② 补登兑现 | triaged | 仓内值守 | nit 级注释面——处置时按实态裁修注或修码 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-B2B-08 | doc_drift（stale_header_comment） | N2：check-kit 头注过时；同上去向断链补登 | triaged | 仓内值守 | 同上 | 批2-β 落地后下一审计窗 | batch2beta-techdebt-review |
| GAP-HOST-01 | host_surface_unverified（codebuddy_ide） | T1 试用实证面=CodeBuddy CLI 2.151.0 三判据 hit；IDE 形态 not-run 如实留痕（trials/codebuddy-r38-report.md）；R44 RA 档案 docs/ra/GAP-HOST-01.md（用户 2026-09-28 批「关档」） | accepted-risk | 仓内值守 | 宿主形态矩阵：CLI=verified／IDE=RA-closed（未实测缺口按五要件封闭——禁以 CLI 证据外推 IDE；判据③读数=「RA 五要件齐备关闭」非「IDE verified」）；IDE 形态可得即按 charter 三判据重跑回填档案 §6（verify_method 见 registry 哨兵） | min（下次 IDE 形态会话,2026-12-27)——RA 档案复审钩 | codebuddy-ide-gap-watch |
