# 轮 24 独立审计报告（exec 收口 #73 T0→T4 复核）

- 日期：2026-09-20 ｜ 审计窗口：独立 lane（不属 facade-impl 窗口）｜ 被审对象：`.scratch/macro-audit/reports/2026-09-20-report.md`＋`handoffs/2026-09-20-r24-exec-handoff.md`＋`handoffs/next-round.md`（任务书）＋账本 D-085~D-091
- 固定点：`a3d5f27`（common base）→ 被审 diff=`b41de8d xlz→a89ddcd pqp→1036aee ytz→916b39b ymu→064b2be rxo`（GitButler lane `facade-impl`，未 push——远端仅 gb-local 含 HEAD，实证）
- **拓扑勘误前置**：报告/handoff 自述「stacked on round24-closeout」——git 父链实测 `b41de8d.parent=a3d5f27`：facade-impl 是与 r23/r24 全栈**平行**的独立栈（任务书本意即独立分支，实现无误，描述失真——见 P-a）。评审 diff 因此取 a3d5f27..064b2be（18 文件/+1158-82），非 yvq..rxo（会混入 74 文件栈外差异）
- 审计口径：不信报告自述——硬验收全部本窗重跑；关键声明仓库实物抽查；双轴评审（Standards+Spec 子代理并行，关键发现主代理逐一复跑实证——负测走 `.code-tmp/73-negtest/` 洁净室副本，零写被审树）；gh 写面以只读 api 回读取证
- 裁定：**PASS-with-findings**——硬验收全绿、T0→T4 交付物全部在位且声明可证；发现 1 项断言弱化（A4 名不副实可穿透）＋2 处实物小缺陷＋3 处口径失真＋判断性观察若干→打回小返工（R1~R4），返工后须重跑同一套验收

## 一、硬验收重跑（全部本窗实测，exit 0/输出实物）

| 面 | 命令 | 实测 | 报告声明 | 结论 |
|---|---|---|---|---|
| 编译+测试闭环 | `cd engine && npm test` | exit 0（gen→tsc→smoke；DOCTOR-TEST-OK 9 legs＋AUDIT-ZERO-WRITE-TEST-OK 4/4） | exit 0 同 | ✅ |
| 打包 | `npm run package` | exit 0（pack --dry-run：75 件/188.4kB） | exit 0 同 | ✅ |
| 启动测活 | `node dist/cli.js selftest` | exit 0＋ok:true 5/5 checks | ok:true 5/5 | ✅ |
| 基线电池 | 15 NN-check（33/34/38/41b/44/46/52a/53/54/55/56/64/70/71/72） | 全 exit 0：31/23/34/33/59/30/22/25/20/18/24/15/13/16/16——与报告逐分一致（70-check 顶显 52 守卫/1289 emits 亦合） | 15/15 exit 0 | ✅ |
| 新守卫 | `node 73-check.mjs` | exit 0＋PASS 14/14 | PASS 14/14 | ✅ |
| xfail | `node xfail-run.mjs` | exit 0＋XFAIL-RUN PASS（entries=8/10＋SEALED 15） | 8 条已登记 | ✅ |
| 单测 | upstream-map / github-rest | UPSTREAM-MAP-TEST-OK 21/21；GITHUB-REST 56/56 | 同 | ✅ |
| 41a 册内项 | `node 41a-check.mjs` | exit 1＝FAIL 3/38（D6/D7/F4——stale-assertions.json 8 条清单内实证在册；exec handoff「35/38」读数吻合） | 已登记 XFAIL 非本票引入 | ✅ |
| 负测复跑（洁净室） | 73-check 对副本：锚断/戳死 | {#install}→{#instal}：B2 FAIL「2:install!=instal」exit 1；sync→deadbeef0000：C2 XFAIL exit 0 | 锚断=FAIL exit1／戳掉队=XFAIL exit0 | ✅ |
| gh 元数据 | `gh api repos/Xxx91n/6F` | desc=D-091 授权稿逐字；topics=授权十枚全中；homepage=null；private=false | 三项回读一致 | ✅ |
| social-preview | `gh api repos/Xxx91n/6F/social-preview` | HTTP 404（REST 无此面——BLOCKED 声明成立非托词） | GET/PUT 均 404 | ✅ |
| 未 push | `git branch -r --contains HEAD` | 仅 gb-local/gitbutler/workspace | 未 push | ✅ |

## 二、声明 → 证据 → 结论 对照（实物抽查）

| 声明（报告出处） | 实物证据（本窗抽查） | 结论 |
|---|---|---|
| T1 LICENSE=engine/LICENSE 字节一致 11371B | Buffer.compare=0，双侧 11371B | ✅ |
| T1 七件+CODEOWNERS 全在/无 BOM/模板无 tab | LICENSE 11371B・CONTRIBUTING 2006B・SECURITY 1568B・CoC 5265B・bug_report 1727B・feature_request 1208B・config 210B・PR_TEMPLATE 1030B・CODEOWNERS 69B——全 BOM=false、三 yml tab=false | ✅ |
| T1 内容逐项（诚实姿态/披露/字段/清单/CODEOWNERS） | 逐件实读全中：CONTRIBUTING preview+单作者+PR 政策+AGENTS.md 指针；SECURITY 私有 advisory+email+「only the latest release is supported」+诚实响应预期；bug_report host/version/os/selftest 四 required 字段；PR 模板 npm test/NN-check/dist rebuild/sync 戳/账本/诚实印记六行；CODEOWNERS `* @Xxx91n` | ✅ |
| T2 README.md 13450B EN canonical 双层门面 | 实测 13450B；结构=hero(L2)→badges(L8)→pitch+status(L16-19)→能力矩阵(L21)→Install(L37)→样例截片(L53)→Quick verify(L62)→工程层(L77~L152) | ✅（badge/pitch 序倒置见 Spec-P2） |
| T2 README.zh-CN.md 12715B derived | 实测 12715B；L1 `<!-- canonical: README.md \| owner: Xxx91n -->`＋L2 sync 戳＋L3 可见 ⚠ 权威警示 | ✅ |
| T2 sync 戳=EN 内容指纹 | sha256(README.md)-12=69e5b6eb1c72=戳值 | ✅ |
| T2 14 heading 全带 {#en-slug}＋install 实锚 | 14 锚逐一列出全 en-slug 形；`<a id="install">` 在 zh（EN 端 GitHub 自动 slug） | ✅ |
| T2 badges 四枚当下为真/无 CI 徽记/无 .gif | EN/ZH 各 4 枚 shields（license-Apache-2.0/version-0.1.0/node-≥20/marketplace-installable）；对账 engine/package.json version=0.1.0+engines.node>=20+.claude-plugin/marketplace.json 在；无 workflows/actions/badge、无 .gif | ✅ |
| T2 hero/architecture SVG icon 调色板派生+纯 SVG | 两文件同含 #0f172a/#38bdf8/#f59e0b/#e2e8f0 四色＋无外链 | ✅ |
| T2 样例截片 RCP-9d20125ad0976c86 实物行 | examples/first-report/23-first-report.md 内含该 receipt id；截片 verdict=unsupported 属「不四舍五入」实证 | ✅ |
| T2 preview 印记保留 | EN「Not yet in preview」×3+⚠×5+synthetic×4；ZH 同族×22 处；能力矩阵 3 of 5 preview | ✅ |
| T2 EN 不伪装全英文产品（D-087②） | status NOTE 末句「Product-facing surfaces (audit reports, listing copy) are primarily in Chinese; this file is the canonical English facade」 | ✅ |
| T2 工程节段不删不稀释 | 架构/上游/Runtime View/所有权/契约/仓库地图/演示/诚实注记全保留；相对链接 12 枚全解析为真 | ✅ |
| T3 73-check 7735B 14 断言 | 实读源码：t()×14=A1-A4+B1-B5+C1,C2+D1-D3；x() 独立 XFAIL 发射器；GUARD_CONFIG.owner='Xxx91n' | ✅ |
| T3 结构互等=FAIL／戳掉队=XFAIL | 负测实证（见一表负测行）；exit 语义 0/1 正确 | ✅ |
| T3 inventory 收编 73-check | 63-assertion-inventory.json guards['73-check']={assertion_ids:14,call_styles:['t()']}；70-check census=52 守卫/1289 emits | ✅（call_styles 漏 x() 见 R3） |
| T4 description/topics/homepage 照稿 | gh api 回读=授权稿逐字＋十枚＋null | ✅ |
| T4 social-card.png 1280×640/32832B icon 派生 | PNG sig+IHDR 实测 1280×640/32832B；.code-tmp/social-card.ps1 制作脚本在（未提交，scratch 惯例） | ✅ |
| T4 上传 BLOCKED 如实登记不伪造 | api 404 实证；报告/handoff 均如实标 ⚠ 2/3 非宣称完成 | ✅ |
| 回归事件处置：44/41a/70 钉串回填＋amend 收票 | 44-check 59/59、41a 仅册内 D6/D7/F4、70-check 13/13——双语契约钉串（「0.x 单调递增、号不复用」「发布未发生·不存在可安装 listing」等）在 README 实物 | ✅ |
| 生效边界：live face=main 不变 | 未 push 实证；description/topics 即刻生效=D-091 授权本意 | ✅ |
| registry 双值守项不翻转 | readme-ci-badge/readme-motion-gif 均 pending+event_bound；engine-ci-main-green/listing-material-freeze occurred=false | ✅ |
| BACKLOG #73 未标 ✅ | BACKLOG L94 行在、无闭环戳 | ✅ |

## 三、Standards 轴（成文标准＋Fowler smell 基线——子代理取证，主代理复验）

**硬违规：0**

对照 AGENTS.md（绝对路径/写后回读/禁 BOM）、CONTRIBUTING.md、PR 模板 dogfood 清单、守卫 sibling 约定（73-check 与 72-check 头块/t()/PASS 尾行/exit 语义同构，x() 为 XFAIL 协议的合理扩族）——无成文标准违反。

**判断性 smell / 缺陷 ×6**（均已主代理复核）：

- S1 [已实证·缺陷] `README.zh-CN.md` L23 失衡括号：open=7/close=8，句尾多一个 `）`（「…已由 marketplace 上架终结）。）——D-088⑥ 译文质量属人评审层守卫不可检，但实物即缺陷（→R2）
- S2 [已实证·断言弱化] 73-check A4 名不副实——`/权威版本|以英文版为准|canonical/` 在首 6 行匹配：删可见 ⚠ 横幅后 comment 里的 canonical 字样仍让 A4 PASS（洁净室实证 14/14）——「可见译文警示」名不副实、D-088① 读者锚失守卫（→R1）
- S3 [判断] 73-check linkTargets 首个 matchAll（图片形态）被次行通用 `]\((...)\)` 全包——死代码环；六处 matchAll→set.add 重复可抽 collect() 助手
- S4 [判断·仓标准可否决] ghSlug `\w` 仅 ASCII——真 GitHub slugger 留 Unicode 字母；今 EN 标题纯 ASCII 内部自洽即可用，值得一行注释
- S5 [已实证·登记不完整] update-70-inventory.mjs 发射器正则 `\b(t|ok|check|w|w58|sealed)\s*\(` 不含 x()——73-check 引入的第七族成盘点盲区，call_styles 记 ["t()"] 名实不全（assertion_ids=14 不受影响仍正确）（→R3）
- S6 [判断] en/zh 与 EN/ZH 仅大小写区分两个解析阶段产物，l1 过简——sibling 同风格，从宽

## 四、Spec 轴（任务书 T0→T4＋账本 D-085~D-091 原文对 diff——子代理取证，主代理复验）

- **[Spec-P1·partial 如实] social-card 上传未交付**：D-091④⑤ 授权三项执行 2/3——PNG 已产、上传经实证无 API 面（404）属所有者手动步；票面诚实登记非伪造，归「授权项不可机达」残项而非实现缺陷
- **[Spec-P2·trivial] D-086① 序倒置**：票面「pitch→badge→能力矩阵」vs 实物 hero→badges→pitch——badge 置顶为 GitHub 门面惯例，判定性偏移非缺陷（登记观察）
- **[Spec-P3·wrong→R1] A4 断言弱化**（同 Standards-S2，唯一 hard-ish 实现发现）
- **[Spec-P4·已消解] 非 shields CI 徽记穿透疑云**：badgeSet 只收 shields.io，双文件对称加 actions 徽记洁净室实证穿透 B5/D1——但 33-check H4 正则覆盖 `actions/workflows/.*badge` 非 shields 形态＋73-check B4 链接集拦单侧不对称——组合覆盖面成立非缺口（设计即「H4 执哨」分工，验证在案）
- **[Spec-P5·观察] EN canonical 留中文钉串**：「0.x 单调递增、号不复用」「发布未发生·不存在可安装 listing」等双语契约串与 D-087① EN 主位有张力——系 44/41a 守卫绑定的机器契约（报告已如实记归因），有意为之但欠一条账本注记（→建议修）
- **[Spec-P6·观察] {#en-slug} 13/14 裸锚渲染**：GitHub 不识别 {#id} 语法读者见裸文本——D-088② 票面要求即此形态，仅 install 补 `<a id>` 实锚；读者面成本 vs 机检钉回源收益随票裁（→建议修候选）
- **[creep 轻微] 73-check D 组超 T3 票面**：D1-D3 诚实面断言=D-089 执法扩展，T3 cell 未列——防御性加严合理但超票面，登记观察；另 feature_request scale 下拉/config blank_issues_enabled=false 属模板许可内

**已核对无缺陷**：七件文件内容与 D-090 逐项对账✓；LICENSE 复制债务清偿✓；双语 canonical→derived 全要件✓；四集互等 FAIL/XFAIL exit 语义✓；owner 入守卫配置✓；徽章诚实集✓；registry 双 event_bound✓；执行序=仓内物料先行/元数据写最后（D-085②）✓；live face 边界✓；未 push✓；D-031 listing 冻结面不在 diff✓；B 轨未触✓。

## 五、过程违规呈报（不替修、不追认）

**实质违规：0**——but 全链写操作、未 push、gh 写走 D-091 包级授权照稿执行、social-preview 404 如实登记不伪造、回归修复 amend 收进原票（票面对得上）、负测声明本窗复跑成立、未越 T5-T10 lane 界。

**口径失真 ×3（报告/handoff 勘误面，非实现缺陷——→R4）**：

- **P-a 「stacked on round24-closeout」**：git 父链实证 facade-impl 基于 common base `a3d5f27`、与 r23/r24 栈平行（but status 多栈共基座）；任务书本意即独立分支——实现正确、描述失真
- **P-b 「commits xlz→pqp→ytz→ymu」四票**：实际五票（+rxo 收口票装报告+handoff 本体）——票序写实于 rxo 生成前，可谅解但须注记
- **P-c 「config（discussions/SECURITY 链）」**：config.yml 仅 security advisories 一条 contact_link，无 discussions 链

**审计窗口自产工件呈报**：`.code-tmp/73-negtest/`（73-check 洁净室负测副本）＋`.code-tmp/r24-audit/facade-impl.diff`（评审 diff 快照）——未提交 scratch，被审树零改动；`56-heldout-eval.json` 未提交修改与 `.code-tmp/锐评.*` 为他会话遗留非本窗物

## 六、打回返工清单（返工后须重跑「一」全表同套验收）

- **R1 必修·A4 实修**（73-check.mjs）：断言面与名对齐——先于匹配剥离 HTML 注释（复用 sibling stripComments 思路）或改判可见行（⚠/「以英文版为准」须在注释外）；补一条负测实证（删横幅→A4 FAIL）写入报告证据列
- **R2 必修·zh L23 多 `）` 剔除**：改后 sync 戳不受影响（戳绑 EN 内容指纹，EN 未动）——73-check 复跑须仍 PASS 14/14
- **R3 必修·inventory 第七族**：update-70-inventory.mjs 发射器正则 +`x`→重生成 63-assertion-inventory.json（注意 t()/x() 同 slug=C2 的计数口径：site 计 vs unique-id 计——随修窗口裁并将口径写进 note 字段）→70-check 复跑
- **R4 勘误·口径三处**（P-a/P-b/P-c）：报告+exec handoff 按 A-080 勘误先例原文保留＋勘误节引本报告编号
- **建议修（非阻断，呈报用户批准）**：EN 中文钉串双语契约的账本注记（D-087① 张力立档）／73-check D 组票面外扩补登记／{#en-slug} 13 处裸锚读者面成本裁决（补 `<a id>` 全量 or 认栽）／linkTargets 死代码环清理

## 七、结论

- **验收面**：全绿（npm test/package/selftest＋15 基线＋73-check＋xfail＋双单测＋负测＋gh 回读全过，与报告逐分一致）
- **声明面**：T0→T4 全有实物证据可复跑；social-card 上传=唯一授权未达项（API 面不存在，如实登记）
- **裁定**：**PASS-with-findings**——打回 R1~R4（断言弱化 1＋实物小缺陷 2＋口径勘误 3，均小修面）；建议修四项呈报用户裁决；返工后重跑本报告「一」全表＋R1 专属负测
