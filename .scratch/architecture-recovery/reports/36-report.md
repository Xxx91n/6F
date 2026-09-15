# 36-report — CodeLore LLM 面独立票（explain 族 env 门控＋成本验收）

> 票：#36 / R5-05｜A-xxx：A-041｜决定：D-035②（LLM 面独立成票：env 门控＋成本面，S4 假设抽取前置，独立验收）
> issue：`.scratch/architecture-recovery/issues/36-codelore-llm-faces.md`；handoff：`.scratch/architecture-recovery/handoffs/36-codelore-llm-faces.md`
> 阻塞状态：**None**（#34/#35 均已闭环）

## ① 开工复述

必读清单逐条已解析：issue/handoff/prompt 36、spec.md §R5-D5、WORKFLOW §4.2、A-041 行、D-035 行、ADR-0014/0015、`engine/src/upstream/codelore.ts`（#31 探针期 ExplainDossier 存量 + #35 首批 30 面契约表）、`test/codelore-batch1.test.mjs` + `fixtures/codelore/batch1/manifest.json`（契约测试先例）、`reports/35-check.mjs`/`35-report.md`（守卫与报告先例）、`reports/03-extraction-prompt.md`/`03-extraction-cases.md`（S4 LLM 抽取先例）、CONTEXT.md（Failure Semantics / Micro-A `diff --llm` 数据源）、`reports/35-analyze-help.txt`（analyze 实物枚举存档）、`next-round.md` T8 行。

## ② 调研（实测探针替代 atomcode——本窗口无 atomcode carrier，如实登记）

调研通道：真二进制实物枚举（新建 `reports/36-probe.mjs`，**env 门控关态**——spawn 前删除全部 `CODELORE_LLM_*`/`ANTHROPIC_API_KEY`，物理上不可能真调 LLM）＋ 0.28.0 二进制字符串直读。产物存档：`36-top-help.txt` / `36-explain-help.txt` / `36-explain-topics.txt` / `36-diff-help.txt` / `36-explain-llm-unconfigured.{stdout,stderr}.txt` / `36-probe-measurements.json` / `36-llm-faces-reconciliation.json`。

关键实测发现（全部有存档可回查）：

- **explain 族不在 analyze 枚举内**：`35-analyze-help.txt` possible-values 57 面中 `explain-*` 面数 = **0**；`codelore explain` 是独立子命令（`36-top-help.txt` 命令面 = analyze/diff/explain/schema/profile/docs/check/gate/mcp/…）。裸 `codelore explain` 枚举 supported topics **46 个**（主题面 = 公式+引文+SQL，确定性非 LLM，`--llm` 对 topic 无效）。
- **LLM 面实物 = 3 面**：`explain <path> --llm`（文件 dossier 附加 advisory 叙事）、`diff <range> --llm`（PR delta 叙事，仅 text/markdown 生效）、MCP `explain_file`（narrative/narrative_error 字段面）。
- **env 族五变量**（二进制字符串 + help 原文对账）：`CODELORE_LLM_PROVIDER`（"anthropic"|"openai-compat"，未知值硬错）、`CODELORE_LLM_BASE_URL`（缺省 `http://localhost:11434/v1`，local-first）、`CODELORE_LLM_API_KEY`、`CODELORE_LLM_MODEL`（openai-compat 必填）、`ANTHROPIC_API_KEY`（anthropic 必填）。
- **门控关实测**：`explain <file> --llm` 未配置 → **exit 4** + stderr 显式错误 + 确定性 dossier 仍出 stdout（不静默）。
- **成本面实况**：上游不暴露 token 计数（narrative cache 字段 = subject/grounded/unmatched/prompt_version/schema_version/fact_digest）——token 真值不可得，适配层以 chars/4 估算位计量（如实登记）。
- 工业先例对标（训练语料级，未本窗口重验，如实登记）：env 门控形态与 OpenAI SDK（OPENAI_API_KEY/BASE_URL/MODEL）/Aider/LiteLLM 同构；成本计量位对齐 OTel GenAI 语义约定（gen_ai.usage.*）与 LiteLLM max_budget 上限判据先例。

## ③ 开源轮子

零新增依赖：复用 CodeLore 0.28.0 二进制（pin 不变）+ 既有 `runText`/`makeFact`/`parseExplainDossier` 存量；golden cassette 模式沿用 #31/#35 先例——差异：LLM 面 cassette 为 **synthetic**（真实 --llm 输出需 LLM 端点，本仓无可录真件；manifest 显式 `synthetic: true` 注记，结构依据二进制字符串 + help 实物）。

## ④ 完成定义 vs 实际

| handoff 完成定义 | 实际 |
|---|---|
| explain 族面清单 + CODELORE_LLM_* env 契约（变量名/语义/缺省行为）落文 | `36-llm-faces-reconciliation.json`：analyze 枚举 explain-*=0 如实登记、topics 46、LLM 面 3（2 contracted + 1 deferred）、env 五变量语义/缺省/门控判读表 + 保密纪律（值永不进 fact，只落变量名） |
| 成本验收面（计量字段 + 上限判据 + 超限降级路径） | `codelore.llm_cost` fact：calls_attempted/succeeded/failed/capped + narrative_chars_total + est_token_units_total(chars/4 估算位)；上限 = `call_cap`（input > env `MACRO_AUDIT_CODELORE_LLM_MAX_CALLS` > default 20，`cap_source` 留痕）；超限 → `llm_gated(reason=call-cap-reached)` |
| golden 契约测试两形态 PASS；守卫 PASS | `test/codelore-llm.test.mjs` **25/25**：门控关 = llm_gate+逐面 llm_gated+runner 零调用（不真调 LLM 的机检证明）；门控开 = 注入 runner 回放 cassette → llm_narrative+成本字段；红证含 uncited stamp/缺段标/非零退出/cap 拦截/env 秘密不外泄；`36-check.mjs` **PASS 20/20** |
| ledger A-041 done + WORKFLOW §4 lessons + commit 引 A-041+守卫 | 本窗口收口一并落盘 |

## ⑤ 卡死 3 连问

无卡死。如实登记项（非阻塞）：

1. **「explain 族」语义修正**：票面措辞假设 explain-* 是 analyze 枚举成员——实物为 0。LLM 面在 explain/diff 子命令旗标与 MCP 工具字段上，已如实枚举登记（recon `analyze_enum_explain_family.count=0`）。
2. **synthetic cassette**：真实 --llm 输出无 LLM 端点不可录；cassette 显式标 synthetic，段标/stamp 形态依据二进制字符串。上游真输出若漂移，契约测试会以解析断言暴露（marker-absent → llm_error）。
3. **MCP explain_file 面 deferred**：MCP 是 stdio server 会话形态，出 spawnSync 一次性调用适配层范围——已挂 `33-gate-registry.json` manual_watch 项 `codelore-llm-mcp-face`（复审时点 = Micro-A preview 前置），防 #35 W1「残余无跟踪」重演。
4. **上游 CODELORE_LLM_* 文档面不全**：`codelore docs` dump 90 行无 env 章节；env 语义以 --help 原文 + 二进制字符串 + 门控关实测三方对账为准。

## ⑥ 断言式收尾清单（每条附可复跑证据）

| 断言 | 证据 |
|---|---|
| explain 族实物枚举 + 对账 | `node .scratch/architecture-recovery/reports/36-probe.mjs` → topics=46 / exit_llm_unconfigured=4 / dossier_emitted=true；`36-check.mjs` A1–A7 PASS |
| env 门控契约（变量名/语义/缺省行为） | recon.env_contract + 适配器 `resolveLlmGate`（显式 PROVIDER 优先 → ANTHROPIC_API_KEY 隐含 anthropic → local-first 缺省 openai-compat）；`36-check.mjs` E1 + 测试 B1–B6 判读矩阵 |
| 门控关 = 显式降级披露不静默 | 测试 C1–C3：逐面 `codelore.llm_gated`（reason=gate-missing-env）+ llm_gate fact + runner 零调用；上游侧实测 exit 4 显式错误（36-probe） |
| 成本验收面 | 测试 D1/D5/D6 + 36-check E3/E4：llm_cost 计量字段 + call_cap/cap_source + call-cap-reached 降级路径 |
| 测试不真调 LLM | throwRunner 注入（调用即抛错）下门控关形态全绿；synthetic cassette 回放门控开形态 |
| 编译通过 | `cd engine && npm run build` → tsc exit 0 |
| 打包通过 | `npm run package` → `macro-audit-0.1.0.tgz` total files 31（与基线一致） |
| 启动并测活进程 | `node dist/cli.js selftest` → `{"ok":true,...}` 5/5 pass |
| 每平台 test 闭环 | `npm test` → GEN-OK + SMOKE-OK 6/6 + COLLECTORS 14/14 + ADAPTER 7/7 + BATCH1 41/41 + **LLM 25/25**；新测试入 `smoke` 链（engine-ci.yml matrix ubuntu/windows/macos × node 20/22 同跑） |
| 适配层零业务规则词 | `36-check.mjs` B2 + 测试 G1：`threshold|verdict|RED|score_band` 零命中 |
| pin 0.28.0 / binary-discovery 不变 | `36-check.mjs` B3 + 测试 A3 |
| 兄弟守卫不回归 | 35-check 22/22 · 34-check 11/11 · 33-check 8/8（登记 29 项 / ALARM 0 / WARN 6 沿既有）· 32-t0-verify 99/99 |
| deferred 面有跟踪位 | registry `codelore-llm-mcp-face` manual_watch 三字段齐备（36-check D1） |

## ⑦ 教训

1. **「族」名先实物核实再落契约**：票面「explain 族」按直觉像是 analyze 枚举成员，实物枚举证明 0 命中——枚举对账脚本先断言「explain-* 命中数」再谈面清单，避免了按记忆造面。
2. **env 门控契约的最低诚实位**：只落「是否配置 + 缺哪个变量名」，值永不进 fact——秘密值断言（s3cr3t 扫描全 fact）是值得固化的红证形态。
3. **无真件的 golden 测试 = synthetic 显式标注 + 结构证据链**：LLM 面无法录真 cassette，synthetic 件必须挂 manifest 注记 + 二进制字符串依据，并在解析器里留 marker-absent 拒识路径（上游真漂移时红而非绿）。
4. **守卫脚本路径深度易踩坑**：reports/ 三层目录下 ROOT 须 `join(here,'..','..','..')`（36-check 首跑 ENOENT 暴露，已修）。
