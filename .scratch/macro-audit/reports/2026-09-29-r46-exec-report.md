# 轮46 执行窗兑现批报告（R45-impl／T1 批）

日期：2026-09-29　分支：r46-t1-exec（stacked on r45-closeout）　判据面：零修订（执行窗纪律——判据临场不可改）

## 覆盖裁定

D-171③④（r1 重立项呈批／r2 追认注记／词条同步核验）；D-172①~⑤（冻结重钉／frozen 立法／归因登记／上游漂移移交／review_anchor 修正）；配套现行规程 D-169-b②（revised 留痕）、D-094、D-139/140、D-144①④、D-145①、D-149①②、D-155②③、D-160①~③⑤、D-161④、D-162③⑥、D-163⑦、D-165②、D-167-c①、D-169-a②、D-170②③④。无新增 D 条目（D 总数 172 不变）。

## 完成定义逐项（原验收：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」）

本批零源码改动（.scratch/registry/manifest/docs＋一件守卫脚本断言增补），映射闭环如下。

### 1. T1-C kr-01 冻结重钉（D-172①）——已消解

- **字节级恢复**：
  - 命令（复跑）：`git show 3a049d45:.scratch/architecture-recovery/reports/<f>` → 写回工作树。
  - 证据：三件 sha256 工作树==冻结 blob——corpora=5a2e04914262…（407340B）／align=8bc5fb589956…（76352B）／spotcheck=26a1821c6491…（25082B）；01-report.md=a579b7c5…／01-fallback.json=92db7cb6…未被 c6fe0f8 波及（==3a049d45 blob）未动。
  - **commit 级对账**：`git ls-tree <uom-amended> -- <三件>` blob id 逐件等于 `git ls-tree 3a049d45`（align=5c3177cf／corpora=fc559f9d／spotcheck=8d6f1813）——GitButler 对无尾换行件的序列化规整偏差（初版 commit 多 +0x0A 一字节）经 `but amend` 校正，工作树保持原 blob 字节。
- **复绿实证**：`env -u NODE_OPTIONS node .scratch/architecture-recovery/reports/01-check.mjs` → PASS 82/82 EXIT=0（原红 D1 anysearch-cli intent 1→9≥5 恢复＋D5 45/45 锚分溯源互认恢复＋新增 F 组 7 断言落位）。
- **摘除正轨（非静默）**：known-red-manifest.json kr-01 entries→closed[]，`closed_at=2026-09-29`／`closure=resolved（冻结重钉＋frozen 立法）`；lifecycle_log 追加 collateral-damage-attribution（误伤归因 D-172③）＋closed-resolved 两行；review_anchor_correction 字段级修正注记（原「语料重采样票落地」腿判无属主不合格锚点，D-172⑤）。
- **registry 闭环**：known-red-kr-01-corpus-regen status→decided＋closed-resolved 确认行；corpus-resnapshot-landed 事件 superseded_by 注记（保留存证不翻 occurred）。

### 2. T1-D frozen 证据包机器可查豁免（D-172②）——落地

- 最小形态：known-red-manifest.json `frozen_evidence_packs[id=frozen-01-series]`——五件 sha256/bytes 钉值＋exempt_from（regen/刷新批禁扫入）＋refresh_path（有意图刷新走裁定链；阈值禁下调、禁手改数字冒充重钉）＋scope（恰 01 系五件，02/38/56 不自动豁免）。
- 执行面：01-check.mjs F 组断言（F1 豁免节在位且覆盖恰五件／F2 逐件 sha256 钉值一致）——触碰=违例信号红。
- 证据：`node 01-check.mjs` 输出 `frozen-pack=5`、PASS 82/82。

### 3. T1-A r1 RA 重立项草案呈批（D-171③a）——已呈批待裁

- 新档 `docs/ra/r1-lineage-edgecap-accepted-risk.md` 五要件齐备：判据引用（D-171①a 腐化基座类——reprobe 补偿控制代码路径依赖可静默腐化）＋justification＋补偿控制＋具名裁者=用户（起草=轮46 T1 执行批 Agent，提交人≠批准人）＋到期 min（复评触发事件，2026-12-28)≤90d＋复审钩重验补偿控制存续。
- registry r1 项确认行=refiled-draft-pending-approval；**批准前原 expires_at 事件制字段维持值守**，本批不预判裁定。
- T1-F：reprobe 代码路径哨兵=可选加固呈裁量，本批不建制（日历兜底已覆盖，D-171③a 明裁不建制不违规）。

### 4. T1-B r2 追认注记（D-171③b）——落册

- registry r2 项确认行=wontfix-permanent-reaffirmed-annotated：判 wontfix 恒久类（接受对象=不随时间衰减设计事实、无存续依赖补偿控制），事件制到期保留无需重批；双条件核验在册（sentinel=本项 expires_at/review_event=stage3-close 锚＋低频盘查钩=T3 普查复读）。字段标注非内容重裁。

### 5. T1-E 上游漂移观察项（D-172④）——入册

- registry 新增 anysearch-cli-intent-drift-watch（manual_watch 五要素齐备，family=upstream-drift，review_event=next-audit-window）：intent 9→1 实测退化＋「该退化无认领票」双标注；观察期条款=上游永久演进坐实→冻结包代表性衰减声明＋S1 重校准走有意图裁定链非机械 regen；跨仓主权不代排产。

### 6. 词条同步核验（D-171④/D-172② 余量）——已于 R45 收口批落地

- CONTEXT.md「Accepted Risk」到期二分扩写（L347~349）＋「Frozen 证据包」词条（L359~361）＋AGENTS.md RA/守卫组/Frozen 行——commit b3306052 已落，本批实证复核在册零补写。

### 7. T3 哨兵值守读数（本窗）——8 确认行落册

- batch2beta-techdebt-review：GAP-B2B-01~08 全 triaged 零恶化＋mini-五要素 8/8。证据：`grep -c triaged docs/known-gaps.md（GAP-B2B 节）→8`。
- batch2beta-open-triggers：点火三问全否（读数无恶化／同型需求第二例未现／known-gaps 无新增命中）→deferred 续持。
- codebuddy-ide-gap-watch：GAP-HOST-01 RA 关档维持，复审钩 min(IDE会话,2026-12-27) 未逾期。
- codebuddy-f02-display-watch：`codebuddy mcp list` 实测→「No MCP servers configured」——盲区续存，宿主侧未修不代办。
- guard-retirement-class：retired[]=[]＋_retired/README.md 在位＋零退役提案。
- stage2-launch-criteria：①阻塞（DoR-b 真实仓 facts 面未形成）②维持（本批全量绿未册化红=0）③维持④计时中→Stage-2 维持关闭。
- protected-surface-death-watch：普查 60/60 守卫 PROTECTED_SURFACE 声明非空（guard-all-run=运行器不计）＋零消亡事件。
- fresh-clone-rerun-watch：随读——env-contract 泛化未落地，复跑义务未激活。
- 证据：`node 33-check.mjs` → PASS 31/31，登记 74 项／ALARM 1（readme-ci-badge 挂账常项）／WARN 9（均为既有未到期项），COVERAGE event_bound 50/74（manual_watch 22/risk_accepted 2）。

### 8. 验收标准映射（本仓可执行面 test 闭环）

| 验收项 | 命令 | 结果 |
|---|---|---|
| 编译 | `cd engine && npm run build`（tsc+build-bundle） | BUNDLE-OK dist/cli.js，EXIT=0 |
| 打包 | `npm run package`（npm pack --dry-run） | 85 files / 1.0 MB，EXIT=0 |
| 启动测活 | `node dist/cli.js selftest` | 5/5 checks pass，EXIT=0 |
| dist 闸 | `node scripts/check-dist.mjs` | DIST-RATCHET PASS 263151B/cap 289395B；git status 无 engine/ 脏件=零 drift |
| test 闭环 | `npm run smoke`（23 测试文件） | 349 PASS／0 FAIL，EXIT=0 |
| 守卫组 | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | GUARD-ALL-RESULT: PASS，ran=60 green=60 red=0 registered=0 allOk=true |
| kr-01 专项 | `node 01-check.mjs` | PASS 82/82 EXIT=0 |
| registry | `node 33-check.mjs` | PASS 31/31 EXIT=0 |
| manifest schema | `node 75a-check.mjs` | PASS 14/14 EXIT=0（M1 空册合规） |

## 变更文件清单（commit 序）

- `uom` fix：01-corpora/align/spotcheck.json 字节级恢复（amend 后 commit 树 blob==冻结目标）
- `nvm` feat：known-red-manifest.json（closed[]＋frozen_evidence_packs）＋01-check.mjs（F 组）
- `mzz` docs：33-gate-registry.json（kr-01 闭环／新观察项／r1-r2 注记／T3×8 确认行）＋docs/ra/r1-lineage-edgecap-accepted-risk.md
- `qwn` chore：守卫重跑生成物 bundle（48-golden×11＋56-heldout＋75a-census）——D-140② 独立 commit
- 本 commit：decision-ledger R45节兑现小节＋CHANGELOG M-039＋本报告＋交接

## 阻塞与待办

- **r1 RA 呈批待用户裁定**（docs/ra/r1-lineage-edgecap-accepted-risk.md §0——「批准重立项」或「驳回」；批准后：§6 回填＋registry 确认行＋账本注记＋编年随行）。
- T2（批2-β 结构性大改）续挂账——点火检查三问全否。
- O6 顺删（D-167-c①）续挂账——本轮未触 40-check.mjs。
- F-02 盲区续存（宿主侧未修——用户侧事项不代办）；GAP-HOST-01 复审钩 2026-12-27 前有效。

## Lessons

- GitButler commit 序列化对**无尾换行**文件会规整补 +0x0A——字节级冻结恢复类提交后务必 `git ls-tree <commit>` 对账 blob id（而非仅工作树 sha256），偏差用 `but amend -t <id> <change>` 校正回含「No newline」语义的正确 blob。
- 守卫集 60/60 全绿空册态落地后，frozen 包钉值断言（F 组）把「历史证据不可再生」转成机器可查红线——regen 批误伤自此即红非静默。
- review_anchor 跨仓腿（外部票）=无属主锚点反模式（graveyard/issue-links-no-resolve）——锚腿必须可由本仓机制兑现或已有具名 owner。
