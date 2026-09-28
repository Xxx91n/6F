# R41-Q1 atomcode 调研报告：fresh-clone 守卫红海的四类环境前置处置裁定

调研时点：2026-09-28｜引擎：Exa+AnySearch（Tavily 限流降级）

**Sufficiency Gate**: searches: 11 (web_search 6 + anysearch 4 + tavily 1 限流失败) | angles: Official/Comparative/Criticism/Currency/Community 五类全用 | full reads: 9 (pytest skipping / git-bundle / git-pack-objects+gitrepository-layout / Bazel Test Encyclopedia / Bourgon build-tags / npm optionalDependencies / Go testing / semgrep npm v12 / vibe-repro-guard) | gaps: git cat-file 对 bundle 直读无官方先例页（已用 pack/alternates 官方机制覆盖等效面）；Jest setupFiles/Rust cfg 未深挖（结论由 Bazel/Go/pytest 三源锚定，不构成支撑缺口）。

## ① 执行摘要（Tl;dr）

**推荐 = 修正版混合（(i) 为主干 + (iii) 降级为零写入读法 + (iv) 维持册化），Confidence 高**。一句话：四类前置全部纳入 env-contract 泛化探测、SKIP reason 直给修复指引，是 D-159 自己立的「sibling 在但漂移→披露、缺失→skip 三态」原则的机械延伸；唯一真正的裁面是 git-object 类——主仓内自举 git fetch bundle 违反 D-074 审计零写入纪律，但 git 官方档提供了不落主仓 object store 的替代（GIT_ALTERNATE_OBJECT_DIRECTORIES 借用 / unbundle 到临时仓），使 (iii) 的疑虑可用「临时仓自举」化解为 (i) 的一个探测特例。(iv) 已被 D-159 负向条款显式禁终态化，1 件 known-red 维持册化不动。

## ② 分点结论

### 1. SKIP vs FAIL vs xfail 语义边界——工业界与本仓裁定完全同构（置信高，双引擎多源）

- **pytest 官方**：skip=「预期满足某条件才通过、条件不满足则完全不跑（外部资源如数据库不可用）」；xfail=「预期失败（未实现/已认领 bug）」；两者分别计数且绝不互折——与 D-159③「环境没有=skip、该工作但物不在=xfail/known-red、混标丢环境修复后自动转红的哨兵价值」逐字对应。pytest.importorskip("docutils") 正是 engine-deps 类前置的权威形态：import 探测→缺失即 skip。
- **Go 官方 + Bourgon（社区转向权威）**：Go 标准做法已从 build tags（编译期裁面）转向 t.Skip 运行时探测，且 skip 消息里直接打印环境变量名——「测试输出告诉你确切该做什么」= 本题「SKIP 理由直给修复指引」的权威先例。Bourgon 批评 build tags 的两点（不可发现、隐藏编译错误）同样适用于「册外 13 红不可发现」的现状。
- **Bazel Test Encyclopedia**（normative/authoritative）：测试必须 hermetic，「outcome 只取决于声明依赖的 source files + build products + runner 保证的资源」；external tag 声明外部依赖、manual 排除出通配。这直接支持「守卫自声明 TIER+PROTECTED_SURFACE」的双字段路线：环境契约是测试的声明性输入，不是失败原因。
- **同构案例**：sandstream kit PR#518（env 缺失渲染红→改三态 skip）、startaitools gate receipt（skip 折 pass=假信心）——D-159 裁定书已收，本轮无需重开。

### 2. git bundle 冻结对象：不 fetch 的零写入读法存在，且是官方机制（置信高）

- **git-bundle 官方档**：bundle 无写支持（「no corresponding write support, i.e. git push into a bundle is not supported」）；git bundle verify 可检查接收仓是否具备 prerequisite commits；unbundle 经 index-pack 落仓——落仓即写 object store。bundle 可作为 fetch/pull/clone 的源（bundle 本质=离线传输协议）。
- **git-pack-objects / gitrepository-layout 官方档**：.idx+.pack 置于 GIT_OBJECT_DIRECTORY 或 GIT_ALTERNATE_OBJECT_DIRECTORIES 任一目录即「enable Git to read from the pack archive」——只读借用、不进主仓对象库，gitrepository-layout 明文称之为「borrow objects from other object stores」。注意：bundle 头部有 ref 声明非裸 pack，直接指给 alternates 的先例面未见官方背书（缺口）；稳妥路径=守卫启动时把 bundle unbundle 到 mkdtemp 临时仓（或直接 git clone <bundle> 临时仓），再以 GIT_ALTERNATE_OBJECT_DIRECTORIES/--git-dir 指向临时仓跑 cat-file 断言，进程结束清理。
- **副作用纪律对账**：主仓 fetch 方案写 object store + 可能建 loose objects/ref——撞 D-074「审计永不写被测仓」（even if the guard's target is the repo itself, mutating the object store mid-run breaks the porcelain/cat-file 等价面 for other concurrent guards）；临时仓方案写 ephemeral mkdtemp——与 D-074③ fixture 先例（fs.mkdtemp 玩具仓）完全同构，不撞。D-072 的自愈先例（engine 运行时 npm install --no-save 平台包）证明本仓接受「受控自举」，但其边界写得很清楚：自愈属于 engine 消费面，守卫面未被授权写仓。

### 3. node 原生绑定可用性探测：optionalDependencies + 动态探测→skip 是惯例（置信高）

- **npm 官方语义**：optionalDependencies 装不上不失败 install——意味着 engine-deps 类红在 fresh clone 上的根因正是「committed dist 引用了未安装的平台绑定」，可用 try { require('@duckdb/node-bindings-<platform>') } catch → SKIP 探测。
- **vibecop 实例**：@ast-grep/napi 平台包 optionalDependencies + test-install.sh 干净目录安装验证（prepublishOnly 哨兵）——干净环境复跑作门禁的社区先例。
- **时效警示（Currency）**：npm v12（2026-06-09 起）默认关闭 install scripts，binding.gyp 隐式 node-gyp rebuild 也被拦——意味着「让守卫自举 npm install 补绑定」的新代码将默认被 npm 拦截，进一步支持探测+SKIP 指引而非守卫内自愈的路线；D-072 自愈路径若沿用也须核 npm ≥12 的 allowScripts 语义。
- **D-072 先例可直接引用**：结构化降级披露三段文案（自动失败原因→手动命令→无网时影响面）就是 engine-deps 类 SKIP reason 的现成模板。

### 4. fresh-clone 门禁的成熟形态（置信中高）

- Bazel hermetic 判据（前引）+ .NET Aspire 生态「git clone && run」指标（clone-to-running 时长作季度追踪指标）+ vibe-repro-guard（fresh tmp workspace 重放、隐藏环境依赖检测、reproducibility score 门禁）三源同向：干净 checkout 复跑是公认的可复现性门禁形态，与 D-162③ 判据②「fresh clone 不红海」同构。关键差别：成熟形态全部依赖「环境前置被声明+探测」，而非「前置不可见」。R40-T1 portable/env-contract 机制已把 13 红中的 sibling 类降为 skip——fresh clone 红海是探测覆盖不足，不是机制失败。

### 5. 本仓账本对账（D-001~D-162 / docs/adr / CONTEXT.md）

- **D-159①**：env-contract tier 现行限定 sibling 集={37,39,46}，且明文「26-check 幽灵钉维持 D-094 族并轨不拉回」——与 (i) 泛化到 git-object 类正面冲突，这是最大冲突点（见 ④-2）。
- **D-159 负向**：「禁 (iii) 终态化」「禁 (iv) 终态化」——(iii)(iv) 只可作过渡/册化态，不可为终态。(iv) 若升级为「册化已否=接受」即撞禁令。
- **D-162③判据②**：fresh clone 不红海以 D-159 判据为操作性定义「防双裁」——泛化探测正是让判据②可判的必要路径，D-162 与泛化同向。
- **D-074**：audit-zero-write——主仓 fetch 自举违之；临时仓/alternates 不违。
- **D-072**：受控自愈先例（engine 消费面）——为「自举」开了受控先例但明确限定在非守卫层。
- **D-160③**：双字段 schema 显式扩展先例——泛化须呈报落地，禁静默改写。
- **A-097/升格判据**：守卫全量跑+红集⊆known-red manifest——泛化后 SKIP 三态不进 allOk 的形态与升格判据兼容（skip 非 red 非册内）。
- **CONTEXT.md 环境契约分层词条**：与本报告结论一致的现行 SSOT。

## ③ 四选项对比矩阵

| 项 | (i) 泛化探测 | (ii) 如实值守 | (iii) bundle 内自举 fetch | (iv) 册化承认 |
|---|---|---|---|---|
| D-159③ skip/xfail 分界 | 完全一致（环境没有=skip） | 部分一致（红≠skip） | 部分一致 | 一致（known-red=xfail 族） |
| D-074 zero-write | 不写（纯探测） | 不写 | 违（写主仓 object store）；临时仓变体不违 | 不写 |
| D-162 判据② fresh clone 不红海 | 可达（红→skip 三态） | 不可达 | 部分可达（仅 git-object 类） | 判据判死 |
| 工业对齐 | pytest importorskip/Go t.Skip+Bourgon/Bazel external 声明 | 无先例支持「探测得到却如实渲染红」 | npm v12 默认拦 install scripts=逆风 | known-red 有 GitLab/pytest strict 先例 |
| 修复指引闭环 | reason 直给（Bourgon 先例） | 无 | 无 reason 面 | 册面 reason 静态 |
| 主要代价 | 扩展须呈报（D-160③）；git-object 归属须 T3 裁 | 判据②死锁 | npm v12 逆风+写仓纪律 | 撞 D-159 负向禁终态化 |

## ④ 冲突清单（辩证）

1. **(i) 泛化 vs D-159① sibling 限定**：现行 tier 集明文限定 sibling 三件且「26 幽灵钉不拉回」。但 D-159① 的限定对象是「内容级提及零依赖」的误并勘误（防画像膨胀），不是「禁止新增已证实的文件系统依赖类」；37/39/46 三件本身就是 git-object/路径/sibling 三种前置并存的实证——限定是历史勘误语境，非类型学封闭。化解：按 D-160③ schema 显式扩展呈报落地，不静默。
2. **git-object 五件的族归属**：若与 26-check 幽灵钉同族（冻结 commit 钉的是「本应存在于 clone 的历史」），D-159 勘误明文归 D-094 族处置（修断言）；若钉的是「正当冻结测试语料（golden 快照）」，则属环境前置应走探测。这是真正须 T3 逐件裁定的五件，不可机械归一——建议以「bundle 是否在仓自足+commit 是否曾真实入仓」作分界：在仓自足=环境前置（探测+SKIP 指引），否则=D-094 断言修复。
3. **(iii) 主仓自举 vs D-074 zero-write + D-072 层级边界**：自举 fetch 违零写入；D-072 自愈先例仅授权 engine 消费面。化解：unbundle/clone 到 mkdtemp 临时仓 + GIT_ALTERNATE_OBJECT_DIRECTORIES 借用，零写入主仓、有官方机制背书、写盘限 ephemeral（D-074③ 同构）——(iii) 的「写 object store 纪律疑虑」由此消解，(iii) 不再作为独立选项而是 (i) 的一个探测实现细节。
4. **(iv) vs D-159 负向禁终态化**：「册化已否」若作终态即撞「禁 (iv) 终态化」。维持现状（1 件册化正常）无冲突；把 13 件册化则违禁令。
5. **(ii) 与升格判据的隐性冲突**：(ii) 表述为「如实值守承认判据未达标」，但建制现状下 fresh clone 13 红中 12 件本应呈现为 SKIP 三态而非红——(ii) 实际否定了 R40-T1 已落盘机制的效力，与 D-149 升格判据（红集⊆manifest）不自洽。如实值守的正确形态就是 (i) 的探测披露，二者非真对立。
6. **npm v12 时效风险 vs D-072 自愈路径**：D-072 自愈（2026-09 采）未预判 npm v12 allowScripts 默认关闭；若 engine 自愈依赖 install scripts 需复审——与本裁无直接冲突但挂复审触发器值得顺带呈报。

## ⑤ 完整来源清单

| 标题 | URL | 角度 | 贡献 |
|---|---|---|---|
| pytest: How to use skip and xfail | docs.pytest.org/en/stable/how-to/skipping.html | Official | skip/xfail 语义边界权威定义+importorskip |
| git-bundle(1) | git-scm.com/docs/git-bundle | Official | bundle 无写支持、verify/unbundle 语义 |
| git-pack-objects(1) | git-scm.com/docs/git-pack-objects | Official | GIT_ALTERNATE_OBJECT_DIRECTORIES 只读借用 |
| gitrepository-layout(5) | code.googlesource.com/git/+/refs/tags/v2.46.0/Documentation/gitrepository-layout.txt | Official | alternates=「borrow objects」+发布限制 |
| Bazel Test Encyclopedia | bazel.build/reference/test-encyclopedia | Official | hermetic 判据+external/manual tag 声明 |
| Go testing package | pkg.go.dev/testing | Official | T.Skip 运行时探测语义 |
| Don't use build tags for integration tests | peter.bourgon.org/blog/2021/04/02/… | Community→权威转向 | skip reason 直给修复指引先例 |
| npm package.json: optionalDependencies | docs.npmjs.com/cli/v10/configuring-npm/package-json | Official | optional 缺失不失败 install |
| RIP npm Postinstall Scripts (npm v12) | semgrep.dev/blog/2026/rip-npm-postinstall-scripts-npm-v12-default-change | Currency | 2026-06-09 install scripts 默认关闭 |
| vibecop native binding test-install commit | github.com/bhvbhushan/vibecop/commit/c6abc6a | Community | 干净目录安装验证哨兵先例 |
| vibe-repro-guard | github.com/alecaram007/vibe-repro-guard | Community | fresh-workspace 重放门禁工具形态 |
| 本仓 D-159/D-074/D-072/D-162/D-094/D-160 | .scratch/macro-audit/decision-ledger.md | 本地账本 | 全部现行约束面 |

## ⑥ 信息缺口

1. git cat-file 对 bundle 文件直接（不经 unbundle/alternates 指向解包产物）读取——无官方背书页面；实操上 bundle=头部+pack，git index-pack --fix-thin 到临时目录后指向之是等效可行路径，建议落地时实测一次钉存证。
2. Jest setupFiles / Rust cfg(trait) 未单独深挖——由 Bazel/Go/pytest 三源已锚定同一原则，不改变结论。
3. Tavily 引擎本会话限流未参与交叉——关键结论均有 Exa+AnySearch 双引擎或≥2 独立域名支撑，但「fresh-clone 门禁企业级先例」仅社区级工具源，置信标注中高。
