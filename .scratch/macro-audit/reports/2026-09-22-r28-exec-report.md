# 轮 28 T1（#77 门面收口包·A 窗）执行报告 — 2026-09-22

> 执行面：修复/开发子 Agent（单会话 A 窗）。常驻任务书=.scratch/macro-audit/handoffs/next-round.md（轮27版）；覆盖=D-098 全七款＋D-099③／D-101①／D-089⑤／D-037③／D-088，连带 T0 修复=D-102①。

## 1. 开工复述（per 开工第一句）

- 任务：#77 门面收口包 A 窗——①README 尾「## Acknowledgments」生成式锚段（枚举=upstream-lock.yaml active 集，名字+一句角色+上游主页链接，脚注指 lock 全集）；②closed 对账守卫 regen→diff empty（双向差集，先比后写同型）；③zh-CN 派生镜像；④CI badge 挂载（engine-ci-main-green 已发生）；⑤GitHub homepageUrl 补齐。
- 边界：A 窗=文档面恒等，与 #78 quarantine（B 窗=引擎行为变更）并行不混；禁手写枚举+字符串断言；planned/evaluating/retired 不进面；节内禁版本/pin/契约；链接指上游主页禁 .scratch。

## 2. 调研（§4.2.3）

- 沿用 R27-Q1 atomcode 深调研结论（reports/R27-Q1-atomcode-research.md）：三层分工=NOTICE 法律承接／lock 机读权威／README 人读 credit 投影；生成式锚段防 README-rot；谢错对象风险真实（github-rest=API 非项目）。
- 本窗零新决策题——全部为既有裁定执行，未开新调研。

## 3. 交付物与可复跑证据

| # | 声明 | 可复跑证据（命令 → 输出摘要） |
|---|---|---|
| 1 | 生成器落盘：engine/scripts/gen-acknowledgments.mjs（183 行，per-id 人工模板×8，禁 kind 推导；--check 只比不写 exit 1 on drift；默认 DRIFT/CLEAN/NEW 先比后写） | `node engine/scripts/gen-acknowledgments.mjs --check` → `CLEAN README.md / CLEAN README.zh-CN.md / CHECK-OK`（exit 0） |
| 2 | EN 锚段实物：## Acknowledgments 在 ## Honesty notes 之前，8 行成员+脚注指 lock | `node .scratch/architecture-recovery/reports/77-check.mjs` → PASS 16/16（B1-B4/C1-C4） |
| 3 | closed 对账=双向差集：模板键集⇔lock active 集⇔节内成员行 三向互等 | 77-check A1/A2/A3 断言；变异验证=模板/锁表任一侧漂移即红（生成器内建 template-missing/template-extra/lock-parse-empty 三路 fail） |
| 4 | zh-CN 派生镜像（D-088）：## 致谢 {#acknowledgments} 同位同链接集；sync 戳刷成新 EN 指纹 | 77-check B4/D1/D2/D3；`node .scratch/architecture-recovery/reports/73-check.mjs` → PASS 14/14（B1 标题数互等/B2 锚点逐位互等/B4 链接集互等/B5 badge 集互等/C2 sync 戳 fresh） |
| 5 | CI badge 挂载：双文件 badge 行插 <a href=workflow><img badge.svg?branch=main>（native actions badge，非 shields 族——73-D1 白名单纪律不动） | 77-check E1/E2；`node .scratch/architecture-recovery/reports/33-check.mjs` → PASS 31/31（H4 双向互等化后仍绿） |
| 6 | 诚实注记措辞合法演化：badge 节改「engine-ci main 徽记已挂载（2026-09-22 首个 main 绿 run 后）」，动图仍待 freeze | README.md/README.zh-CN.md 诚实注记节 diff；73-check D3 印记保留 PASS |
| 7 | GitHub homepageUrl 补齐=listing 指定值 | `gh repo view Xxx91n/6F --json homepageUrl` → `{"homepageUrl":"https://github.com/Xxx91n/6F"}`（原为空串） |
| 8 | T0 基线连带修复：xfail-45-b5 stale 条目摘除（pkz 按 D-094(b) 重写 B5 断言后册内条目残留→XPASS）＋meta.xpass_removal_2026_09_22_b5 归因注记 | `node .scratch/architecture-recovery/reports/xfail-run.mjs` → `XFAIL-RUN PASS（仅已登记 XFAIL 0 条，entries=0/10）`（摘除前 FAIL 1：xpass:xfail-45-b5） |
| 9 | 守卫演化修：33-check H4「未预埋单向」→「occurred↔徽标在场互等」；73-check D1 措辞合法演化（shields 白名单不变，CI 徽记归 H4） | 33-check PASS 31/31；73-check PASS 14/14 |
| 10 | 验收链：编译/打包/测活/测试闭环 | `cd engine && npm run build`→exit 0（BUNDLE-OK dist/cli.js）；`npm run package`→exit 0（macro-audit-0.1.0.tgz dry-run）；`node dist/cli.js selftest`→`{"ok":true}` 5 checks 全 true；`npm run smoke`→exit 0（AUDIT-ZERO-WRITE-TEST-OK 4/4 等链尾） |
| 11 | 全守卫电池复绿（含新守卫入盘点） | 33=31/31；44=59/59；45=51/51；70=13/13（update-70-inventory regen 后 53 守卫/1262 emit）；71=16/16；72=16/16；73=14/14；77=16/16；xfail-run=exit 0；另恢复性绿：39=28/28、40=57/57、41a=38/38、43=28/28（任务书「历史票面闭环索引」回写字面锚＋CHANGELOG M-005 编年行区间更新后全绿） |
| 12 | 台账：A-089 执行记录＋CHANGELOG M-005＋BACKLOG #77 ✅ | .scratch/architecture-recovery/decision-ledger.md 尾行；CHANGELOG.md M-005；BACKLOG.md #77 行 |

## 4. 完成定义对照（§4.2.5）

| 票面交付物 | 状态 |
|---|---|
| ①致谢节生成器→README 尾锚段（8 active 行=名字+角色+上游主页链接，脚注指 lock） | ✅ 落（证据 #1/#2） |
| ②closed 对账守卫 regen→diff empty（双向差集，先比后写同型） | ✅ 落（证据 #1/#3：--check  exit 0；三向互等断言） |
| ③zh-CN 派生镜像 | ✅ 落（证据 #4） |
| ④CI badge 挂载（指 main engine-ci） | ✅ 落（证据 #5） |
| ⑤GitHub homepageUrl 补齐 | ✅ 落（证据 #7） |
| 用户验收「编译/打包/测活/test 闭环」 | ✅（证据 #10） |

## 5. 阻塞与决策留口

- **待追认**：①xfail-45-b5 摘除（stale 摘除＋归因注记 meta.xpass_removal_2026_09_22_b5）；②xfail 批摘六条 xfail-41a-d6/d7/f4、xfail-43-d5、xfail-39-h6、xfail-40-g5（任务书字面钉／CHANGELOG 区间钉族——本窗恢复锚点实物后断言真实复绿→条目 stale 摘除＋meta.xpass_removal_2026_09_22_anchors 归因注记）。均 D-102① 两键分离人工裁决侧呈此报待追认（同 xfail-45-h5→D-102 先例）；册终态 entries=0/10。
- **registry readme-ci-badge**：实物已挂载；status 翻转归 T10 值守面（本窗不越界翻账）。
- **45-check H5 松钉观察**：H5 仍含 `|| 'demo'` 便利分支（D-102③ 断言无牙族样本），归 T3/#75批1 findings 处置面，本窗未动。
- **39/40/41a/43 旧守卫红（轮22~27 任务书逐轮换写丢 T 行字面钉所致）**：本窗经任务书「历史票面闭环索引」块恢复字面锚点全转绿；41a-D6/D7 经 M-005 编年行修绿。该族=D-094 字面钉族，根治归 T3/#75批1 普查（锚点 hash＋时点／结构断言化，D-071⑨ 方向已注记）。

## 6. Lessons（不可蒸发）

- 生成式锚段先比后写对 README 同样适用：closed 面枚举（lock active）→ 生成器持 per-id 人工模板 → 守卫=regen→diff empty，消掉「手写枚举+字符串断言」错位族。
- 徽章语义分层要早定：shields 族白名单（73-D1）与 GitHub 原生 actions badge（33-H4 事件互等）分开管——若用 shields 包 CI 徽记会撞白名单；原生 badge 恰好落在白名单管外且语义最准（真实 workflow 态）。
- zh sync 戳（sha256[:12]）应跟着派生内容生成走：生成器写 zh 时顺手刷戳，73-check C2 保持 fresh 而非 XFAIL-warn。
- xfail 册摘除纪律：断言被合法演化重写后，册内条目必须同窗摘除——否则下一轮基线即 XPASS 红（本次实证）。

## 7. 返修记录（r28-audit 终裁 PASS-WITH-FINDINGS 后处置）

| ID | 发现 | 处置 | 复验证据 |
|---|---|---|---|
| F-01 | template-missing 漂移类走 TypeError 裸栈（tp.name 先于诊断） | 生成器加 renderable 门（模板集不完整禁渲染、先报归因行）＋MISSING-TEMPLATE 防御网 | 负测：临时锁表加 fake-new-upstream active 行 → exit 1 且输出 template-missing 归因、无 TypeError；`--check` 回 CLEAN×2+CHECK-OK |
| F-02 | 报告撞名覆盖轮26 实施报告（审计对象指针指向异物） | 原文件按 aafb463 字节级恢复（4953B）；本报告迁名 `2026-09-22-r28-exec-report.md`（贴合 r21/r22 exec-report 惯例）；BACKLOG/next-round 引用同步 | `git show aafb463:.scratch/macro-audit/reports/2026-09-22-report.md` 头行=「# 轮26 实施报告」复原在位 |
| P-01 | commit 缺 A-NNN（WORKFLOW 明文） | but amend+reword 写入 A-089 | `but status` commit 消息头含 feat(#77)…A-089 |
| O-01 | sync 戳 hash 口径差（gitattributes LF 锁下不可达） | 生成器哈希改对盘上 EN 的 EOL 形态（与 73-check raw-file 口径严格同型） | `gen --check` CLEAN×2；73-check C2 fresh |
| O-02 | 44-G6 又钉滚动面字面（同族已自报） | 归 T3/#75批1 普查处置面，本窗不动 | 报告 §5 已载 |

