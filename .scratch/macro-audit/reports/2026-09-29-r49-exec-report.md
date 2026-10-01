# 轮49 执行窗兑现批报告（R48-impl／T1 批）

日期：2026-09-29　分支：r49-t1-exec（stacked on r48-closeout——伴生再生面对 kom bundle 基底有内容依赖，but move 显式声明）　判据面：零修订（执行窗纪律——判据临场不可改）

## 覆盖裁定

D-176①~④（macro-b-regression 死件处置包——修＋parse 档机检闸＋manual_watch liveness 册项＋未授权 workflow_dispatch 不跑）；D-177①②④⑤（预声明验证包工序——本批为其生效后首个适用实例＋WORKFLOW §4.2.8 文书落行）；D-178③（R48 (d) 面调研件物化补落）；D-179①~⑦（守卫伴生再生减负包建制——种子化＋volatile-fields 键级豁免清单＋两跑零 diff 自检＋自动 discard 驳回登记）。

配套现行规程：D-147→D-177 一般化承载（预声明验证包）；D-139/D-140②（语义 commit 不搭车生成物——再生 bundle 独立 commit）；D-161④（三栏位 trailer）；D-155①~④（manual_watch 五要件）；D-175①~⑧（面序——(b) 清零序内 T1-A~C、(d) 主体序内 T1-F）；D-159②③/D-160③（新守卫 TIER＋PROTECTED_SURFACE 双自声明）；D-154③/D-094③（死项即红棘轮——volatile 键级可达性同构）；D-171/D-172②（frozen-01-series 五件禁区）；D-170③（欠账三要素）；D-149①②（守卫判据=guard-all-run 全量＋红集⊆manifest）。

## 完成定义逐项（原验收：「编译通过、打包通过、启动并测活软件进程；每个平台都要有 test 闭环，避免只引入却没做到。」）

### 1. T1-A macro-b-regression 死件修复（D-176①）——已兑现

- **病灶**：L144 `- name: verify report artifacts (three-check: present + JSON parse + verdict/reason_class enum + intake_health)` ——未引号 plain 标量内含 `: `（冒号+空白）→ YAML 解析级死亡，schedule 自 2026-09-23 静默失效。
- **修复**：该行双引号包裹复原解析（commit rtu）——行为零变。
- **证据**：
  - 病态检测器实测：三件 workflow 扫面中恰 L144 一命中（engine-ci.yml / golden-ci.yml 零误报）；修复后零命中。
  - `node -e "yaml.load(...)"`（js-yaml）→ 解析 PASS；name=`macro-b-regression`、on.schedule cron=`17 3 * * 1`、on.workflow_dispatch 在、jobs=[resolve, macro-b] 逐项核零漂移。
  - workflow_dispatch 实跑=未授权另案（D-176 scoping 登记——未跑如实登记）。

### 2. T1-B parse 档机检闸（D-176②＋D-177 工序）——已兑现

- **预声明包A 先行**：`.scratch/macro-audit/reports/2026-09-29-r49-predecl-verification-packs.md`（4411B）先于本变更 commit 落盘（vvp）——声明 A18 检测谓词、诱导红态输入（病态合成行）、阴性对照（引号/块标量/注释/shell 行/行尾注释）、修复后零命中要求、A1~A17+B~E 语义不动约束、零三方依赖边界。
- **落地**：46-check A18（commit zqq）——扫 `.github/workflows/*.{yml,yaml}`：键行 `^\s*(?:-\s+)?[A-Za-z_][\w-]*:\s+(\S.*)$` 提取标量 → 起始指示符排除（' " | > [ ] { } & * ! % @ 及反引号 十四枚 charCode 判定）→ 行尾注释剥离 → 检出 `:(\s|$)` 即病态；命中报 file:line＋行摘 80 字。
- **红态诱导实跑读数**（D-177 必选）：合成病态行 `- name: verify report artifacts (three-check: present + JSON parse)` → SICK；引号/块标量/shell 行/注释/正常 uses 行 → non-plain/non-key/clean 全零误报；三真实 workflow files=3 零命中；46-check PASS 31/31。
- **中途返工留痕**：初版用 char-class 正则判起始指示符——正则字面量内裸引号骗过 stripComments 引号态机（吞插入点后 60+ 行）→ 46-check 四条已注册 findings 悬空、75a-check C2 红；改 charCode 集判定后剥面 134 行全保、findings 389↔389 零悬空（教训入 WORKFLOW §4 Lessons）。
- **升格登记**：yaml 包/全量 parse=条件项未做（D-176 scoping）；actionlint=manual_watch T3 工具非 CI 硬依赖。

### 3. T1-C liveness 哨兵册项（D-176③）——已兑现

- **册项**：`ci-workflow-liveness-watch`（update-33-ci-liveness-watch.mjs 幂等迁移，commit qkw）——family=repo-maintenance；watch=manual_watch；owner=仓内值守；review_event=next-audit-window；verify_method 三读=①gh workflow list/run list 或等价 API 核 name≠path 退化态＋0s 败迹＋schedule 注册活性（60 天自动停用面）②本地 actionlint/等价 parser 全扫③46-check A18 持续绿；workflow_dispatch 实跑显式不入哨义。
- **联动**：waiting-allowed-deferred.md 值守行插入＋头部计数同步（registry 74→75、live 62→63、rows 88→89）。
- **证据**：
  - `node update-33-ci-liveness-watch.mjs` → `REGISTRY-UPDATED`；重跑 → `REGISTRY-IDEMPOTENT-SKIP`（assert-back fail-closed）。
  - `node 33-check.mjs` → `PASS 33/33；登记 75 项/事件 52 个/ALARM 0/WARN 9`。
  - `node verify-waiting-list.mjs` → `VERIFY-PASS；rows=89 registry=75 live=63`。

### 4. T1-D R48 (d) 面调研件补落（D-178③）——已兑现

- **载体**：`.scratch/macro-audit/reports/R48-d-face-atomcode-research.md`（commit xlp，15240B 无 BOM LF）——完整六搜八读 provenance＋三候选裁荐（①d-33check-enum-assert=建〔走预声明验证包工序〕②d-guard-perf-baseline=缓〔footer 派生形态锁〕③d-frozen-pack-recheck=建〔T3 节律非 manual_watch 册项防双册〕）＋出处限制如实随文（GitLab 403、MSF 静默期未完全核实、KEP-5241 语义外推注记）。

### 5. T1-E D-177 工序文书面落行（D-177⑤）——已兑现

- WORKFLOW §4.2.8 新增条款（commit rqr）——①声明须物化于先于变更 commit 落盘的承载面（账行/报告节/独立文件均合法；同 commit 原子落盘不满足时序强度）②红态诱导实跑必选（客观不可跑=缺件非静默过）③无既有账行锚的探测面变更先落声明件④生效时点自落盘 commit 起不溯既往（7bd2e8e1 形态不重开）。

### 6. T1-F 守卫伴生再生减负包（D-179①~⑦＋D-177 工序）——已兑现

- **预声明包B 先行**：同锚文件包B 节声明种子化原语、两跑零 diff 断言形态、volatile 枚举三硬边界、红态诱导（异 env diff 通道可火）与 frozen 禁区。
- **① 种子化**（commit zxu）：`_lib/env-contract.mjs` 增 `deterministicRunAt()`——`SOURCE_DATE_EPOCH` 秒级 epoch 注入（reproducible-builds 惯例）、缺席=固定 epoch 0（`1970-01-01T00:00:00.000Z` 确定性=默认行为非隐藏开关）、非法值 throw fail-closed；48-micro-a-preview 与 56-checker-heldout-eval 两处 `new Date()` 墙钟熵源摘除改调原语——下游 trace_id/baggage_id/receipt_id/chain_hash 本已内容寻址自动稳定。
- **追加发现＋修法**：`gate_ref.prereg_commit` 原取 `rev-parse --short HEAD`=永漂源（任何 commit 落盘后整批 golden 必漂，永无静止点）——改钉 `git log -1 --format=%h -- 48-micro-a-criteria.md` = `3e588e02`（判据预声明 commit 本体，名实归位；且更贴 23-check R3「闸门先于被裁定对象」祖先语义）。无断言钉死其等于 HEAD，语义零损。
- **② volatile-fields.json**：version/decision_ref/purpose 齐备；纯挥发族键级枚举 11 键（run_at/generated_at/observed_at/collected_at/decided_at/issued_at/ingested_at/trace_id/baggage_id/receipt_id/chain_hash）；派生信号族禁列 18 键（计数/盘点/git 派生 sha/内容摘要——含 prereg_commit/head_sha/fact_count/item_count/api_calls/sha256_16 等）；enumerated_artifacts 9 件 JSON/JSONL；frozen-01-series 五件禁区声明。
- **③ d179-check.mjs 自检件**（TIER=portable＋PROTECTED_SURFACE 自声明）：A1 清单 schema／A2 键级可达性棘轮（逐键须达 enumerated 工件键空间——死项即红，键空间=206）／A3 派生族禁入＋反空虚校验（keys∩banned=∅ 且禁键须实达——禁令非空转）／A4 frozen 禁区（enumerated∩frozen packs=∅）／A5 熵源钉（生成器源码无 new Date(/Date.now( 回潮即红）——B1 56-eval 原位两跑字节等值／B2 48 --golden 双 tmpdir 两跑全 12 件 sha256 对账等值（Bazel null-build 同构）。动态枚举自动入 guard-all-run。
- **④ 自动 discard 驳回登记**：语义 commit 不搭车再生、再生 bundle 独立 commit（D-140②）——差异走断言面（d179-check A/B 组）非一键丢弃；本批全部 drift 经 diff 逐件核目（无静默 discard）。
- **⑤~⑦ 读数**：红态诱导=`SOURCE_DATE_EPOCH=1700000000` 两跑 sha 0830a983…／`1700000001` 两跑 f2d85493…（diff≠0 通道可火）；同 env 复跑恒等；env 缺席两跑恒等（run_at=1970-01-01T00:00:00.000Z）。**伴生 churn 实测=guard-all-run 完整跑（61 件全量含 48-check 原位 golden 再生＋56-eval＋75a findings 回写＋70 盘点）后 `git status --short` 零 diff**——12~14 件/轮 → 0（唯余真实语义变化件：criteria 变更→prereg_commit 动、assertion 增减→盘点件动）。46-check 31/31 相容。

### 7. 验收标准映射（本仓可执行面 test 闭环）

| 平台面 | 编译通过 | 打包/产出 | 启动并测活 | test 闭环 |
| --- | --- | --- | --- | --- |
| engine | npm run build：tsc+esbuild BUNDLE-OK | npm run package：85 件 255.5kB | node dist/cli.js selftest：ok=true 5/5 | npm test：gen→build→smoke 23 套件全绿（SMOKE 6/6、COLLECTORS 14/14、CODELORE 7+41、MICRO-B 18、LLM 25、REPORT-PREVIEW 5、INTAKE 40、GITCLI 11、SQL-LITERAL 17、MCP-DB 12、AUDIT 26、DEMO、GITHUB-REST、UPSTREAM-MAP、NARRATIVE、CITATION 38、DOCTOR 9、QUARANTINE 58、AUDIT-ZERO-WRITE 4、DIALECT 19、FILE-CARD 36） |
| 守卫面 | node --check 全件语法绿 | —（无打包面） | guard-all-run.mjs 实跑 | ran=61 green=61 red=0 allOk=true 二跑零漂 |
| workflow 面 | js-yaml safe_load PASS | — | 46-check A18 parse 档闸 | 31/31＋红态诱导读数随批 |
| 注册表面 | — | — | 33-check＋verify-waiting-list | 33/33＋VERIFY-PASS（75 项/89 行对账） |

## 复验跑总表

| 命令 | 结果 |
| --- | --- |
| `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（两次） | 一跑：61/61（d179-check 动态入列）＋二跑后 git status 零 diff（确定性端到端证明） |
| `node 33-check.mjs` | PASS 33/33（登记 75 项/事件 52/ALARM 0/WARN 9） |
| `node verify-waiting-list.mjs` | VERIFY-PASS（rows=89 registry=75 live=63） |
| `node 46-check.mjs` | PASS 31/31（A18 files=3 零命中） |
| `node 75a-check.mjs` | PASS 16/16（findings 389↔register 389 零悬空——中途引号态吞行 C2 红已修） |
| `node 70-check.mjs` | PASS（inventory regen 对账 46-check 31→32＋d179-check +7） |
| `node d179-check.mjs` | PASS 7/7（A1~A5＋B1/B2；键空间 206） |
| `cd engine && npm run build` | BUNDLE-OK dist/cli.js |
| `cd engine && npm run package` | macro-audit-0.1.0.tgz 85 件/255.5kB |
| `cd engine && node dist/cli.js selftest` | ok=true 5/5 |
| `cd engine && npm test` | gen→build→smoke 全链绿 |
| `node -e js-yaml load macro-b-regression.yml` | 解析 PASS（name/triggers/jobs 零漂移） |
| 红态诱导（预声明包B） | 异 SOURCE_DATE_EPOCH 两跑 diff≠0；同 env/env 缺席两跑恒等 |

## 变更文件清单（commit 序，全列——含本报告与 handoff 自身）

| commit | 面 | 文件 |
| --- | --- | --- |
| `c6849452db9bb14bf0d037038a41096c8b6a23ef` ("docs(轮49预声明): T1-B/T1-F 验证包锚物化（D-177 首个适用实例——先于变更 commit 落盘）") | .scratch/macro-audit/reports/2026-09-29-r49-predecl-verification-packs.md |
| `0401d487c57fcb18f94b7d2e096d6c651bcc2899` ("fix(ci): macro-b-regression.yml L144 病态标量加引号——YAML 解析级死件复原（D-176①）") | .github/workflows/macro-b-regression.yml |
| `3c769c0b4f1ff44f404afe018d2d9ec2d3c90fb9` ("test(guard): 46-check A18 workflows parse 档病态闸（D-176②——拦 macro-b 死件同型）") | .scratch/architecture-recovery/reports/46-check.mjs |
| `46b91d11a6d6863cd31d1ab6e2464046dab799d4` ("feat(registry): ci-workflow-liveness-watch manual_watch 册项落地（D-176③——死件案活性哨兵五要件）") | 33-gate-registry.json、update-33-ci-liveness-watch.mjs、waiting-allowed-deferred.md |
| `454c32259635d5660b5248fa4981bb8cd9a58402` ("docs(archive): R48 (d) 面 atomcode 调研物化补落 reports/（D-178③ 欠账兑现）") | .scratch/macro-audit/reports/R48-d-face-atomcode-research.md |
| `9b076b66e7e146ce61adf597d5e21be08602e929` ("docs(workflow): §4.2.8 预声明验证包工序落行（D-177①②④⑤ 文书规定位）") | .scratch/architecture-recovery/WORKFLOW.md（§4.2.8） |
| `0a68d41ad6dd0ec444734af595455bf52f3d875f` ("feat(guard): D-179 守卫伴生再生确定性建制——种子化＋volatile-fields 键级豁免枚举＋两跑零 diff 自检件") | _lib/env-contract.mjs、48-micro-a-preview.mjs、56-checker-heldout-eval.mjs、volatile-fields.json、d179-check.mjs |
| `79cf046d9461a519244500cbcf197f5d8bae927c` ("bundle: 伴生再生物一次性确定性再基线（D-179 种子化首跑落定——语义零变）") | 48-micro-a-golden-*×11、56-heldout-eval.json、63-assertion-inventory.json、75a-census-findings.json |
| `b1d6535947c332c5fb55b45cd5da5d66d385a393` ("docs(轮49收口): R48-impl 兑现批收口文书——账行增量↔编年随行＋报告＋交接＋任务书兑现标记") | decision-ledger.md、CHANGELOG.md（M-046）、WORKFLOW.md（Lessons 行）、本报告、handoff |

## 阻塞与待办

- workflow_dispatch 实跑复验=未授权另案（外触四仓 clone 副作用面须用户单独授权）。
- ci-workflow-liveness-watch 首窗盘查=下轮 T3 哨兵读数（gh 认证面读数＋actionlint 随读工具）。
- (d) 面三候选终裁已于轮48 落地（enum-assert=33-check J 组已建成／perf-baseline=缓建挂触发器／frozen-recheck=T3 节律行）；本轮调研件物化完成 D-178③ 持久化义务。
- O6 顺删续挂账（D-167-c①）：本轮未触 40-check.mjs——搭车路径维持不专开批。
- macro-b-regression push 后平台侧 schedule 复原验证=外部事件锚（本分支未 push）。

## Lessons

- **stripComments 普查剥面引号态吞行**：check 件源码=普查双重消费者——正则字面量内裸单/双引号骗过简朴引号态机吞后续行；新断言落地后必随跑 75a-check（本件 31/31 绿≠剥面注册表零悬空）。解法=charCode 数值集判定源码零裸引号。已入 WORKFLOW §4 Lessons 行。
- **prereg_commit 永漂源**：取运行时 HEAD 的「预声明锚」字段每次 commit 必漂——钉 criteria 文件 last-change sha=名实归位＋断永漂尾（祖先语义反而更贴闸门先于被裁定对象）。
- **D-177 工序首实例实测**：预声明验证包（先落物化面＋红态诱导实跑读数）对探测面变更工序有效——中途引号态返工即被 75a 棘轮当场拦下，工序链条自证价值。

## 版本控制面

分支 r49-t1-exec（栈于 r48-closeout——but move 显式声明伴生再生面对 kom bundle 基底的内容依赖）；commits=vvp/rtu/zqq/qkw/xlp/rqr/zxu/txn＋本收口文书 commit；未 push 未 merge（D-176④ 口径：push 后 name 复原属外部事件锚）。
