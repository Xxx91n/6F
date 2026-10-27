# 51 — Macro-B behavior 象限接入报告（R9-02 / A-058 / D-054）

日期：2026-09-16　范围：behavior 面 golden 契约＋切片＋能力矩阵收窄＋归位规则＋低样本披露＋D-035 勘误

## ① 实物跑 schema 确认（D-054⑥ 先行）
- codelore 0.28.0（PATH 解析 pin 一致）；env-manager 实跑三行：
  - `hotspots`：{path, revisions, cognitive, cognitive_health, hotspot_score, mi, mi_rank, ai_pct, hotspot_score_anchored}
  - `coupling`：{entity_a, entity_b, shared, revs_a, revs_b, average_revs, degree, fisher_p}
  - `function-hotspots`：{path, function(name@lines), revs, cognitive, cognitive_health, function_hotspot_score}
- `function-coupling` 实测需 `--target <path>`（按实体逐个跑，非全仓扫描形）→ 登记 deferred 不进切片。
- 留痕：`51-behavior-schema.json`（recorded_at＋version＋每面列清单）。

## ② 面集接入（#35 契约模式复用）
- `engine/src/upstream/codelore.ts`：`CodeloreFacetGroup` 扩 `'behavior'`；`CODELORE_BEHAVIOR_FACETS`=[hotspots, coupling, function-hotspots]（冻结 argv 同批次契约：分析名+format=json+无 extraArgs）。
- raw 语义不出适配层（ADR-0014）——本层只传 argv+行数组原样；判据语义归 51 管道层。

## ③ 判据（51-behavior-criteria.md 预声明跑后禁调）
- PC-1 三面 facet_rows 齐备 row_count>0 → **supported**（116/241/41 行）
- TC-1 hotspots min(revisions)≥TC1_MIN_N=5 → **supported**（实测 min=5，见 51-behavior-measurements.json）
- TC-2 coupling shared≥2&degree>0 占比≥0.5 → **supported**
- NC-1 deferred_faces 含 function-coupling 如实标注 → **supported**
- 报告：`51-macro-b-env-manager.{json,md}`——behavior=native/verdict=supported/confidence 0.6；strategy/structure/supply_chain=not_applicable＋queued 理由；citation_checks 3/3 supports；preview_disclosure 含 not_in_preview=function-coupling/structure/supply-chain/Micro-B/Macro-A。

## ④ 归位规则＋收窄＋勘误
- **quadrant 归位**（D-054③）：facts quadrant=strategic（codelore 族 provenance 不改写），报告象限归属=切片决策——同一批 facts 可被 Macro-C 演化主干并发消费无双归属冲突。
- **能力矩阵收窄**（同票绑定）：README + SKILL.md → strategy:active·behavior:preview·structure:queued（双口径风险）·supply-chain:queued（D-034③）。
- **D-035 勘误注记**：macro-audit 账本 D-035 行后追加——暂缓面集 3 面激活（消费侧扩展 Macro-B behavior），契约本体不变；function-coupling 留暂缓集。
- **registry**：codelore-deferred-faces confirmations 加 partial-activation-noted 留痕。

## ⑤ 低样本披露
- TC1_MIN_N=5 预声明阈值（codelore --min-revs 默认 5 对齐＋ADR-0015 量测有效性惯例）；切片字段 min_revs/sample_met 写入，低样本仓将由 TC-1 判红+披露。

## 实证
- `node reports/51-macro-b-behavior.mjs` → {ok:true,verdict:supported,facts:4,faces:3}（实跑 artifacts：facts.jsonl/duckdb/report 双件/measurements/schema）
- `node reports/51-check.mjs` → PASS（A 面集契约×6+B schema×5+C 判据×8+D 离线复跑×11+E 收窄×7+F registry×4+G BOM×1）
- `cd engine && npm test` 全链绿

## 已知限制
- 校准域=单仓 env-manager（同主 dogfooding 口径，非泛化证据）。
- function-coupling/--target 面、clone-coupling、delivery-* 族仍在暂缓面集（registry 缓）待需求拉动。
- behavior 切片 verdict 三判据粒度较粗（齐备性/低样本/耦合占比）——判定深度属 preview 位，fine-grained 行为判据待评测票口径拉动。
