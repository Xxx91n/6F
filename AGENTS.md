# AGENTS.md

## 用户协作偏好

- **输出文件路径一律给完整绝对路径**：凡输出用户需要复制/打开的文件路径（如 `.scratch/macro-audit/handoffs/next-round.md` 这类任务书/报告/handoff），一律写全绝对路径（`D:\Aworker\6F\...`），不要只给仓库相对路径。

## 项目环境速查

- 决策账本：`.scratch/macro-audit/decision-ledger.md`（D 系列）与 `.scratch/architecture-recovery/decision-ledger.md`（A 系列）
- 文件写入用 Node.js（`ctx_execute(language:"javascript")` 或 node 脚本），写后回读断言、禁 BOM＋保尾行
- **格式化-only／机械重缩进变更禁搭车语义提交**——须独立 format commit 先行（大范围 reformat 登记 `.git-blame-ignore-revs`）；NO-OP 例外=被触碰文件内的顺手整理可搭车（R32 审计 V1 先例/D-139）
- **生成物再生禁搭车语义提交**——`engine/dist/` 产物（tsc+esbuild 输出）变更须独立 bundle commit；bundle-only SHA 可登记 `.git-blame-ignore-revs`（D-140②，D-139 同型扩展）
- **外部评审摄入先分诊再裁定**：钉评审快照 SHA＋逐条对照当前 HEAD——「快照属实/现状已修」不进裁定链（去向表照登）；仍开放→裁定链（D-075 三要素受理）；无法核实→pending+复审时点（入 registry 须走 manual_watch 五要素）；「可核实且证伪」→标「快照不属实」**附核实依据**显式驳回不进裁定链（去向表照登——摄入分诊封闭处置态，非第四值守态）（D-142/D-146）
- **收口工序前置核对**：账行增量↔编年随行核对＋收口前跑守卫组——「本轮无账行增量」可显式声明豁免（D-144①④）；`engine/src` 或 `engine/dist` 触碰→前置 `npm run build`＋`node scripts/check-dist.mjs` 核对零 drift 再 commit（D-145①；守卫组/CI 层硬闸不降级）
- **守卫组指称**（D-149①②）：「收口前跑守卫组」=基线 18 件枚举——`33/39/40/41a/43/44/45/70/71/72/73/77/78/80/81/82/83-check.mjs`＋`xfail-run.mjs`（reports/ 下全绿判据；41a 编行随行钉在账行增量 commit 落盘前许可中途红）——成员进出：新 check 落盘轮登记＋实测绿入列，出列=T3 分诊门处置；升格触发器=T3 manifest 产出当轮改「58 件全跑＋红集⊆manifest＋manifest 件复绿告警」（registry `guard-baseline-upgrade-trigger`）——**已触发（A-097/轮37）**：升格后判据=`node .scratch/architecture-recovery/reports/guard-all-run.mjs` 全量跑（动态枚举含新入列 check）＋红集⊆`known-red-manifest.json`＋册件复绿 strict 告警；18 件枚举为升格前基线历史快照存证
- **规程生效时点**（D-148③）：checklist/规程自其落盘 commit 起对新行为生效，落盘 commit 自身豁免（grandfather/lint 存量豁免同构）——豁免对象=新规程，落盘时点已生效的旧守卫仍全额适用
- **审计 finding 处置**（D-148②）：Accepted Risk 封闭处置态须三要素齐备——不修理由＋补偿控制＋复评触发条件；缺任一=finding 静默丢弃（wontfix≠裸标；false-positive=finding 不存在语义非处置档）
- 版本控制用 `but`（GitButler），不 push 除非用户明示
- 本机验证用守卫脚本 `node .scratch/architecture-recovery/reports/NN-check.mjs`（exit 0 + PASS/FAIL）
