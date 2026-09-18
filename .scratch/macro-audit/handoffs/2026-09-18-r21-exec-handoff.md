# Handoff — 轮 21 全量执行（2026-09-18 · 六票闭环 · 分支栈 r21-* 六连 · 未 push）

## Goal

任务书 `D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md` 轮 21 常驻任务书 T0→T10 依序执行：BACKLOG #58/#63/#64/#61/#60/#62 六票实装闭环＋值守复核＋D-025 双读数。本会话六票全部落地，T7–T10 值守面核验完成。

## Accomplished（本轮已落地，勿重做）

1. **#58 manifest 契约链**（`ovl` @ `r21-58-manifest-contract`，A-070）：enforce 级 manifest 形状断言＋SchemaStore schema 快照入仓（sha256 `3f69938d…`）＋`claude plugin validate --strict` advisory 集成（CLI 缺席=SKIP/streak 值守非 FAIL）＋`engine/mcp.json` 退役（cursor#252 遮蔽根因根除，单一 `.mcp.json` 自动发现位）＋`.mcp.json` 入 pack `files[]`——真机 `mcp list` ✔ Connected。
2. **#63 陈旧守卫换代**（`rxn` @ `r21-63-stale-guard`，A-071）：`stale-assertions.json` 清单制 cap=10＋`xfail-run.mjs` 严格三态（PASS/FAIL/XFAIL/XPASS，strict XPASS=红）＋断言照跑不 archived＋33-check G1–G4 元校验直接 enforce＋48 守卫/906 断言盘点工件＋三负路（XPASS/悬空/超 cap）各 exit 1 实证。
3. **#64 duckdb 自愈补拉**（`owy` @ `r21-64-duckdb-selfheal`，A-072）：平台感知精确单包 `@duckdb/node-bindings-<platform>-<arch>`（win32-arm64 无官方包前提与 optionalDeps 实存有出入→保留回落特例票面注记）＋`.node`/尺寸阈/version 三方完整性校验＋每进程至多 1 次＋devCheckout 分流（有 lock 禁 `--omit=dev` 防剪 devDeps——实证事故修复）＋`createRequire` retry（实证 ESM 缓存失败 module record）＋`DUCKDB-SELFHEAL` 结构化事件走 stderr（MCP stdio stdout=JSON-RPC 帧避让）＋offline-sim 7/7＋E2E 3/3＋64-check 14/14＋CI 双腿＋README 三段披露。
4. **#61 cue 表分层双 commit**（`zvq`＋`xxm` @ `r21-61-cue-tables`，A-073）：判定 commit=CJK_NON_ASSERT_PRE(16)/POST(6)/PSEUDO(5)＋`EN_NON_ASSERT_CUES` 接线实证（r18 死表名实对齐）＋`CJK_SPEECH_PSEUDO` 同族补收（假说/举例来说/比如说——'说'子串误吞豁免）＋词表治理「词表即判据」统一声明＋改表三件义务＋56-check G 组 hash WARN（基线 `0628234f798bc569`）＋K1–K9；[cleanup] commit=r18①–⑤等价变换（firstFactIds/死条件/closers→Set/enCuesIn offset 对称＋stripMemo/check() 风格）——G2 hash 不变=顺带清等价自证。held-out 复跑零漂移、52a parity 22/22 阈值不回调。
5. **#60 骨架升版机检**（`qpu` @ `r21-60-skeleton-gate`，A-074）：`14-skeleton-baseline.json`（v1.2.0 必现轴四章 16/15/9/10）＋14-check 第 9 节三 FAIL 双向拦（负测 T1/T2/T3 各 EXIT1）＋三方一致（baseline==fields.json==code，D-037② 核验同轴）＋doc↔code 子集规则（值必填⊆必现轴差如实收窄）＋semantic-flip 边界行入 PASS。
6. **#62 doctor 探测票**（`kvw` @ `r21-62-runtime-doctor`，A-075）：`src/doctor.ts` 三腿 probe（duckdb 自愈链消费/git/registry HEAD）＋三态聚合 ok/degraded/fail＋结构化 JSON＋exit fail→1＋`macro-audit doctor` 子命令＋doctor.test 9/9 入 smoke＋selftest 不扩容——registry `runtime-doctor-trigger` triggered-bound→decided 消费收官。
7. **T7–T10**：narrative-eval-surface pending 核验（#52b 待命保持）；25-P4/25-D3 listing 资产核对留痕（marketplace.json 零图形资产，B 轨不授权 stay pending）；registry 44 项复核＋stale-assertions 10 条与 §3 归因一致；D-025 双读数入报告 §三。
8. **账本**：A-070~A-075 六行落 `.scratch/architecture-recovery/decision-ledger.md`；BACKLOG 六票「已闭环」注记；终报 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-18-r21-exec-report.md`。

## Discoveries / 如实披露的缺口

- **D-025 双读数**：陈旧 FAIL 实测 **21 条/8 守卫** vs 账本首批 9 条/5 守卫——45-H5 系 r21 任务书重写后新破（注册第 10 条恰满 cap）；38/39/40 族 11 条 §3 已归因件如实登记 >cap 批量处置证据（清单制不膨胀，触发器面待复审锚）。
- **D-072 前提勘误**：`@duckdb/node-bindings-win32-arm64` 实存于 optionalDeps——「无官方包」前提与实有出入，保留回落特例＋票面注记。
- **值守 pending 项**：`xfail-second-track-trigger`（第二轨治本挂触发器不膨胀）／`claude-validate-promotion-watch`（SKIP streak 值守）／`cue-table-extraction-trigger`（单消费者已核验）／duckdb 三复审（vendored/wasm/binary-watch）／25-P4/25-D3（listing 资产 B 轨）。
- **push 未授权**：六分支栈留本地——「全部授权」级指令未至，PR/push 停用户闸门。

## Remaining（下轮候选面）

| 项 | 内容 | 依赖/注意 |
|---|---|---|
| stale >cap 处置 | 38/39/40 族 11 条陈旧断言 | §3 归因已在案；cap=10 清单制下待复审事件锚（xfail-run strict 会拦新增注册） |
| listing 资产 | 25-P4/25-D3 图形资产 | B 轨=用户授权面 |
| cue 表抽 JSON | cue-table-second-consumer 触发 | 单消费者已核验——第二消费者出现才抽 |
| doctor 扩腿 | 后续可挂平台矩阵腿 | 当前三腿按 D-059③ 票面 |

## Instructions / 环境

- 分支栈（自下而上）：`r21-58-manifest-contract`→`r21-63-stale-guard`→`r21-64-duckdb-selfheal`→`r21-61-cue-tables`→`r21-60-skeleton-gate`→`r21-62-runtime-doctor`；全部未 push。
- 验证入口：`node .scratch/architecture-recovery/reports/NN-check.mjs`（exit 0=过）；`node engine/dist/cli.js doctor`；`cd engine && npm test`。
- 写入纪律：Node.js `fs`＋回读断言＋禁 BOM；守卫走 exec 直跑（ctx 沙箱 node preload 有注入污染面）。
- 版本控制：`but` 全写操作；`but status` rename 探测会配对「删除+新文件」——纯删除提交前把同名族 scratch 挪出仓外。
- Suggested skills for next round：atomcode-research（调研新票先跑）／handoff（收口）／gitbutler（栈维护）。
