# 轮 10 独立审计——轮 9 执行窗口（r9-exec / next-round T0–T9）

> 生成 2026-09-16 · 审计窗口只出报告不动手修。审计对象 = `.scratch/macro-audit/reports/2026-09-16-report.md` 末节「轮 9 next-round 任务书执行」＋ `handoffs/2026-09-16-r9-exec-handoff.md` ＋ 6F `r9-round9-exec` 栈（22a6ffa/8686f29/b04953e，基线 756eff9）＋ jiahao `2755bf35`。方法 = 不信自述：硬验收亲跑＋实物抽查（rg/文件存在性/gh 实读/git reflog）＋双轴评审（Standards×Spec 并行子代理）＋atomcode 独立外部复核。

## 结论

**PASS-WITH-BLOCKING-OBSERVATIONS（打回小修＋一项闸门状态须用户裁定）**。工程实物全部成立（T1–T9 声明逐条有证据、零虚构）；但存在：① 1 项仓库级规范硬违规（npm ci 惯例）；② 收口回写缺口族（A 账本/#46 票档/BACKLOG ✅/WORKFLOW lessons）；③ jiahao 删除提交已在 origin/main 与「本地待 push」自述冲突——push 责任方不能凭仓库证据唯一归因，呈报用户裁定；④ 若干守卫/文书弱化点。

## 1. 硬验收重跑（审计窗亲跑，非引用报告读数）

| 验收项 | 报告声明 | 亲跑结果 | 判定 |
|---|---|---|---|
| `npm test`（engine/） | 全链绿（GEN+tsc+SMOKE 6/6+COLLECTORS 14/14+ADAPTER 7/7+BATCH1 41/41+LLM 25/25+REPORT-PREVIEW 5/5+INTAKE 31/31+DEMO 38/38） | exit 0；实测尾部 INTAKE 31/31、DEMO 38/38 全 PASS | ✅ |
| `npm run package` | macro-audit-0.1.0.tgz 54 files | exit 0；total files=54，76.6kB | ✅ |
| `node dist/cli.js selftest` | ok 5/5 | ok:true checks 5/5 | ✅ |
| `node reports/46-check.mjs` | PASS 26/26 exit 0 | PASS 26/26 exit 0 | ✅ |
| `node reports/33-check.mjs` | PASS 16/16、ALARM 0、30 项/15 事件/COVERAGE 23/30 | PASS 16/16 exit 0；ALARM 0、WARN 11、COVERAGE 23/30 | ✅（WARN 12→11 差=codelore-residual-faces 转 decided 后 WARN 消，预期漂移） |
| jiahao `git show --name-status 2755bf35` | 恰 1 文件 D | D .github/workflows/macro-b-regression.yml 恰 1 文件；main/工作树该文件均缺席 | ✅（撤除本体） |

## 2. 声明 → 证据 → 结论 对照表

| # | 声明（出处） | 审计证据 | 结论 |
|---|---|---|---|
| T0 | 开工前置：33-check 基线 PASS 16/16 ALARM 0 | 亲跑 33-check exit 0、ALARM 0、30 项/15 事件/23/30 | ✅ |
| T1 | #46 workflow 迁回 6F（resolve→fromJSON matrix／cron 周一 03:17 UTC+workflow_dispatch／https-only 闸门／intake 隔离三件／one-shot→工件断言→upload-artifact／contents:read／无 token 无跨仓 checkout） | workflow 全文逐条核：A1–A14 全部实物对应（cron 17 3 * * 1；inputs repo_url/repo_name；case https://* 闸门；clone -c core.hooksPath=noop -c protocol.ext.allow=never + --is-shallow-repository 断言；verify 六断言；upload-artifact@v4 + if always()；DEFAULT JSON 仅 jiahao） | ✅（弱化点见 §3 S-1/J-1/J-3） |
| T1 | 本地实证 46-out：jiahao head=8a8422e、commits=265、adr=69、facts=1101、supported、RCP-a435e3bf5b9d6b46 | 六件实物读：sidecar receipt_id=RCP-a435e3bf5b9d6b46、commit_anchor=8a8422e…、fact_count=1101、verdicts 全中；facts.jsonl 实测 1101 行；duckdb 1,847,296B | ✅ |
| T2 | jiahao 撤除单文件 commit 2755bf35 @ r9-46-jiahao-ci-removal，「本地提交（push=用户闸门）」 | git show：恰 1 文件 D ✅；但 `git branch -r --contains` 命中 remotes/origin/main；reflog b4c7ec59→2755bf35 update by push（≈15:24:50 +0800），随后三笔 push=grill-t9 提交链；r9-46 分支名已不解析（并入 main 消耗） | ⚠️ 撤除本体真实；「本地待 push」自述已失效——提交已在远端 main。证据指向他方会话推 main 时带走已并入提交（本窗未自推与 reflog 一致），但不能排除用户自推——**呈报裁定不追认** |
| T3 | 经典公开仓候选呈报待选定（首选 git/django/spring-boot） | 46-classic-repo-candidates.md 在（矩阵+排除留痕+呈报非定案声明）；workflow DEFAULT JSON 实测仍仅 jiahao 一行 | ✅ |
| T4 | #41b 备料：docs/listing×3+marketplace 字段查证；提交停用户 | 三件在且零凭据值；查证文档在。atomcode 独立复核：Claude 目录侧三主张全成立（无 preview 字段/无签名/无图形资产硬要求）；「Agent Plugins 1.0.0 封闭 schema」本轮未直接复核（我抽查的 VS Code/Open VSX 有 preview:boolean 字段，但不在文档「两生态」口径内，不构成证伪） | ✅ 主体成立；瑕疵：description.md 五层盒子术语误用（见 S-4） |
| T5 | registry 复核未触发；desk-task15 pending+errata 在 | 实测：micro-a-preview-prep occurred=false；desk-task15 pending、trigger_event=micro-a-preview-prep、errata 注记在、confirmations=1 | ✅ |
| T6 | entity-effort 票未触发（S5 族窗口未开） | 无新票=正确执行 | ✅ |
| T7 | Micro-A 前置包：env-manager 机器面≈74%；jiahao 全人基线；第三槽空挂 | 文档在；gh 独立重跑逐字命中 {Xxx91n:16, dependabot:37, github-actions:9}=62 与 jiahao 7/7 全 Xxx91n 全 MERGED；不翻转事件 | ✅ |
| T8 | mw-trigger-c 维持 event_bound | registry：pending/event_bound→macro-a-start（occurred=false） | ✅ |
| T9 | 暂缓面集值守：B3 PASS、23 速写名≈25 枚举回查 D-035④∥D-045 | 33-check B3 PASS（33-check.mjs 回查源已扩 D-035∥D-045）；35-facet deferred_set 22→25+disposition_source=D-045 | ✅ |
| T10 | 用户专属未执行（6F/jiahao push、listing 提交、凭据） | 6F origin/main=756eff9、r9/r8 栈全本地未推✅；jiahao 2755bf35 已在 origin/main（同 T2）；diff 密钥扫描 0 命中 | ⚠️ 同 T2 呈报 |
| D-013 | URL opt-in 输入面 | workflow repo_url 输入+clone 隔离三件 | ✅ |
| D-034② | 第三槽挂托管 API 适配器前置 | micro-a 报告明记 T3 名单不自动进 Micro-A 试点 | ✅ |
| D-042/D-026/D-027 | 提交点击用户专属、凭据值不入仓 | checklist §C 用户专属清单；密钥扫描 0 | ✅（push 状态另呈） |
| D-043 | mw-a/b decided、mw-c 留 event_bound、判据写实留痕 | registry 三状态实测+30-desk-calibration task7 写实化+satisfaction_note 留原文指针 | ✅ |
| D-044 | desk-task15 重绑+勘误成对落盘 | trigger_event+errata 同见 | ✅ |
| D-045 | 残余 4 面 1+3 分流 | 35-facet 25+disposition_source=D-045；B3 双源回查 PASS | ✅ |
| D-046 | 6F workflow+jiahao 单文件撤除+经典仓候选+token 取消+push 分授权 | T1/T2/T3 核验全中；token/跨仓 checkout 实物缺席（46-check A12） | ✅（push 状态呈报） |
| D-047 | 双试点+第三槽空挂 | T7 核验（gh 实测命中） | ✅ |
| D-041/D-035 | manual_watch 值守面不破坏、暂缓面集判据逐面挂住 | 33-check D/E 组 PASS、WARN×6 常驻=设计信号 | ✅ |

## 3. Standards 轴（子代理评审＋审计窗逐条复核确认）

**硬违规（仓库成文规范）**：

- **S-1 `macro-b-regression.yml` 用 `npm install --ignore-scripts`**——仓内 CI 惯例=npm ci（golden-ci.yml:46；round9 返修刚把 golden-ci install→ci），同链引擎构建退回 lockfile 容忍安装。修复=npm ci --ignore-scripts。
- **S-2 `39-macro-b-one-shot.mjs` 头注残留旧引用**——用法注释仍写「CI 回归用：jiahao .github/workflows/macro-b-regression.yml」（该文件已被 T2 删除）；R-…-2 正文注记已迁 6F 口径但注释行漏改（46-check D3 只钉 R-…-2）。
- **S-3 #46 收口回写缺口族**：① A 账本无 #46 行（A-054 缺位，每票闭环必落 A 行的惯例断档）；② BACKLOG #46 行缺兄弟行清一色「✅ 已闭环」标记；③ WORKFLOW §4 lessons 未追加（报告末节 3 条 Lessons 候选滞留）；④ #46 票档三件套（issues/handoffs/prompts 46-*）未按 41a 模板补立。
- **S-4 术语误用**：docs/listing/description.md「五层盒子：Macro-A/B、Micro-A/B、Macro-C」撞 CONTEXT.md L174 定义（五层盒子=Agent Plugins 1.0.0 分发包装层：plugin.json+skills+mcp.json+扩展目录+内核 CLI）。

**判断项（judgement calls，不阻断）**：

- **J-1** repo_url 仅 https://* 前缀闸门后即插 `git clone "${{ matrix.repo.url }}"`——$()/反引号可穿 JSON 入 run 执行；resolve 段用 env 间接引用而 macro-b 段丢弃该纪律。需 dispatch 写权限→低风险，但防御厚度低于「https-only 闸门」文面宣称。
- **J-2** node-version: 20 vs golden-ci 的 24（engines>=20 功能无碍；兄弟 workflow 分歧未注释）。
- **J-3** verify 步 test -f 接受零字节、grep -q receipt 接受 null（39-check 用 /^RCP-[0-9a-f]{16}$/ 强断言）。
- **J-4** 46-check A9 断言绕行（replace 引号）且 scale 查裸子串弱于标签「scale Macro-B」；D1 硬编码 PASS 16/16（33-check 已 8→16 长过；39-check J1 用 >=）。fail-loud 但脆。
- **J-5** workflow 头注链序写 clone→build、实际 build→clone；credential-checklist「无审核凭据」与 B 表「审核=有」字面张力。

Fowler 基线：无可行动 smell（NN-check 族 helper 重复属本仓惯例）。

## 4. Spec 轴（子代理评审）

全部 T 项对照 spec（next-round.md T0–T9＋账本 D-042~D-047）成立：T1 六要素齐；T3 刻意未接入与「呈报待选定」一致；T4 备料止步提交前；T5/T6/T8/T9 未触发=正确（registry 语义 diff=6 处变化全部已申报，零伪造翻转）；T7 三要素齐。唯一实质发现=T2/T10 push 状态冲突（同 §2）。另注：46-check E2「报告含 #46 窗口节」为自指断言（守卫存在性非内容正确性）。

## 5. 过程违规/偏差呈报（不替追认）

- **P-1（须用户裁定）jiahao push 闸门**：自述「本地待 push、远端 push 未授权未执行」。实测 2755bf35 已在 origin/main（reflog：本窗提交 15:16:09 → push 入远端 ≈15:24:50 → grill-t9 提交链 15:24:52 起随后三笔 push）。证据形态=他方会话推 main 时带走已并入提交（GitButler 分支消耗一致）；不能排除用户自推。**若未授权：闸门被旁路穿越（越权面=零本仓资产、内容恰该删除文件无扩大）；若用户自推：报告时点描述失效须勘误。** 两种走向都须把 r9-exec-handoff「本地待 push」改为实际状态。
- **P-2** #46 收口回写缺口族（S-3 四项）——A 账本断档最重：执行账唯一事实源无 #46 登记。
- **P-3** 规范/文书面：npm install（S-1）＋头注残留（S-2）＋术语误用（S-4）。
- **P-4** 守卫弱化面（J-3/J-4）——断言强度低于标签宣称，登记为「弱化」。
- **P-5**（事实登记非违规）atomcode 复核：Claude 目录侧三主张成立；「Agent Plugins 1.0.0」封闭 schema 声明本轮未直接复核到。

## 6. 打回修复要求（若走返修窗口）＋重跑清单

修复清单（全部小修）：
1. macro-b-regression.yml：npm install --ignore-scripts→npm ci --ignore-scripts；可选 node 24 对齐或注释分歧理由；repo_url 过矩阵后改 env 间接引用；verify 步 test -s＋/^RCP-[0-9a-f]{16}$/ 强断言。
2. 39-macro-b-one-shot.mjs 头注 jiahao 引用改 6F 侧；46-check 补钉头注断言。
3. #46 收口回写：A 账本补 A-054（done→implemented，证据锚=46-check/46-out/2755bf35）；BACKLOG #46 行补 ✅；WORKFLOW §4 追加 lessons；按 41a 模板补立 46-* 票档三件套。
4. description.md 术语改正；credential-checklist 行文精化。
5. 46-check D1 硬编码改 PASS (\d+)\/\1 或 >= 形态；A9 断言与标签等强。
6. r9-exec-handoff「本地待 push」按 P-1 裁定结果勘误。

**修完重跑清单（同一套验收）**：cd engine && npm test && npm run package && node dist/cli.js selftest；node reports/46-check.mjs（含新断言全 PASS）；node reports/33-check.mjs（16/16）；git -C D:/Aworker/jiahao show --name-status 2755bf35（仍恰 1 文件 D）。

## 7. 审计方法与边界

- 亲跑：npm test/package/selftest/46-check/33-check、git show/log/reflog/branch --contains、gh pr list 双仓、registry/diff 语义级比对、密钥扫描。
- 子代理 Standards/Spec 双轴并行取证，其声明经审计窗逐条复核后收录。
- atomcode 5.0.9 独立复核 T4（13 源、官方文档全文级）。
- 未覆盖：GitHub Actions 未真跑（无 push 即无 CI 实跑面，静态核）；Agent Plugins 1.0.0 schema 未直接复核；jiahao push 责任方认定超仓库证据能力。
- 本窗未改任何被审对象文件；本报告为唯一产出。
