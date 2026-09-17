# 轮16 实施报告——#54/%cI · #53/audit 一等命令 · #55/P1 批 · #52a/checker 标定

日期：2026-09-17　分支：r16-impl-t1-t3-t2（栈于 round15-closeout）　提交：wkp→usr→pwo→zvt

## ① 完成定义逐项

| 项 | 状态 | 证据（命令→输出摘要） |
|---|---|---|
| #54 %cI 确定性修复（D-059①） | ✅ | `node 54-check.mjs` → PASS 19/19；`gitcli-contract.test.mjs` → 11/11；归一化 +00:00→Z＋秒精度形状断言落 intake.ts `normalizeGitIsoDate`；golden-ci 勘误块＋upstream-lock enforce 位 |
| #53 audit 一等命令（D-060 八要素） | ✅ | `node 53-check.mjs` → PASS 22/22；`audit.test.mjs` → 24/24；签名/exit2 SCALE-NOT-IMPLEMENTED/--out 双通道五工件/共享链（audit·demo 同消费 macro-b.ts）/39·40 对照物 parity（侧车字段⊆39 复跑产物）/报告头 stability·capabilities/usage+README 同票/不携叙事职责 |
| #55 P1 四子项（D-059④⑤⑥⑦） | ✅ | `node 55-check.mjs` → PASS 17/17；sql-literal 17/17、mcp-db-resolution 12/12、intake 40/40；contradicts 死枚举代码面清零 |
| #52a checker 仪器标定（D-061） | ✅ | `node 52a-check.mjs` → PASS 21/21；语料 110 条八层分层（gen 确定性生成＋sha 指纹）；κ 三报（全集 0.455/非对抗 0.970/intra-rater 1.000）＋raw agreement＋bootstrap CI95；band-leak 12/12＋干净 FP 0/6；eval JSON＋披露块；暴露缺陷另立 #56（评测/修复分票兑现） |
| #41b 残余（T5） | ✅ 复核 | `node 41b-check.mjs` → PASS 30/30（上轮 A-060 留痕复核仍成立；B 轨未授权不动） |
| 值守面复核（T8） | ✅ | 33-check WARN 9→8：5 项新触发器 confirmations 补 evidence 锚（账本 D-059~D-063 行＋闭环 check 产物）；余 WARN=进行中事件常态，无翻转项 |
| 双读数纪律（T9） | ✅ | 见 §④ |
| 编译 | ✅ | `npx tsc -p tsconfig.json` → 0 错 |
| 打包 | ✅ | `npm run package` → macro-audit-0.1.0.tgz 121.8kB/71 件（dist/audit/*.js 入包） |
| 启动+测活 | ✅ | `cli.js --version`→0.1.0 JSON；`selftest`→ok:true 5/5；**真实仓测活**：`audit D:/Aworker/env-manager --out …` → RCP-e0ab92dca215a66d·supported·280 facts·codelore resolved |
| test 闭环 | ✅ | `npm test` 全链绿：smoke 6/6·collectors 14/14·codelore 7/41/25·report-preview 5/5·intake 40/40·gitcli 11/11·sql 17/17·mcp-db 12/12·audit 24/24·demo 38/38（golden 逐字节）·github-rest 55/55·narrative 34 |
| 守卫基线 | ✅ | 33=16/16·42=43/43·44=56/56·46=30/30·53=22/22·54=19/19·55=17/17·52a=21/21·41b=30/30 |
| `git diff --check` | ✅ | 干净（零尾随空白/冲突标记） |

## ② 阻塞

- 无硬阻塞。T6（push 授权）/T7（`/plugin marketplace add`）属用户专属闸门，未执行（D-051/D-052）。

## ③ Lessons（进 WORKFLOW 候选）

- **mcp.json 是 gen-manifests 生成物**——直改 mcp.json 被 gen 回写冲掉；配置面一律落 manifest.meta.json 单一元数据源＋模板同步（首跑 GEN-FAIL=DRIFT 自检即证据）。
- **DuckDB 事实表名以 store.ts 为唯一权威**（`audit_fact`）；测试硬编码别名 audit_fact_events 即炸——表名查询一律走 store/schema 常量化面。
- **时点披露取证源单源化**：clone/refresh/缓存命中三腿同读 FETCH_HEAD mtime，杜绝「clone 盖 now()、命中读 mtime」双钟漂移（r1/r2 同槽同值实测）。
- **file:// 下 `x` 与 `x.git` 是不同物理路径**——.git 归一化的等价语义只对 https 类拼写成立；e2e 断言改用尾斜线变体，.git 等价性留单元面。
- **but diff hunk 相邻即合并**：cli.ts --refresh 行与 audit 分发块同 hunk 不可再分，归属以主导内容定（记 commit 注）；hunk ID 随 commit 失效，残余改动用 `but amend --target` 归位。

## ④ 双读数（D-025）

- **实测口径**：52a checker 全集 κ=0.455（<0.6 预声明地板，kappa-below-floor finding 已登记）；非对抗子集 κ=0.970；intra-rater κ=1.000；对抗 FP=13/FN=12；band 检出 12/12、干净 FP 0/6。
- **账本口径**：BACKLOG #52a 记「κ 三报如实＋#56 立票」；台账轮16节同数。两口径一致无粉饰；κ<floor 解读=presence 仪器无语义层的构造预期失配，非实现回归（非对抗域 0.970 佐证），修复走 #56 另票且禁参照本集标签调参。

## ⑤ 引用文件

- 新增：`engine/src/audit/{audit,macro-b}.ts`、`engine/test/audit.test.mjs`、`engine/test/{gitcli-contract,sql-literal,mcp-db-resolution}.test.mjs`、`reports/{53,54,55,52a}-check.mjs`、`reports/52a-{gen-corpus,checker-eval}.mjs`、`52a-checker-eval-corpus.json`、`52a-eval-results.json`
- 改动：`engine/src/{cli,mcp-server}.ts`、`intake/intake.ts`、`fact/schema.ts`、`report/{generate,citation}.ts`、`demo/demo.ts`、`manifest.meta.json`、`scripts/gen-manifests.mjs`、`mcp.json`（生成物）、`README.md`、`upstream-lock.yaml`、`package.json`、golden fixtures（仅 +stability/capabilities 行与字段）、39/40/48 对照脚本（归一化＋对照物标记）、`.github/workflows/golden-ci.yml`（勘误块）、`33-gate-registry.json`（5 项 evidence 锚）、`BACKLOG.md`（4 票闭环＋#56 立案）、`decision-ledger.md`（轮16 节）

## ⑥ 剩余工作

- #56（checker 语义边界修复票，排期另定；设计先立）／#52b（触发器票，锚=真实宿主叙事语料）／#48 残余 Micro-A 面／#49 经典仓回归腿。
- T6 push＋T7 marketplace add＝用户闸门，本代理不代行。
- golden-verifier-dirty-on-rerun：本轮守卫重跑未致脏树（0/3 阈值计数）。
