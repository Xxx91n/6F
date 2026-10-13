# 20-report — fact table schema v0（A-021）

- **Ticket:** issues/20-fact-schema-v0.md ｜ **Handoff:** handoffs/20-fact-schema-v0.md ｜ **Prompt:** prompts/20-fact-schema-v0.md
- **Decision:** spec.md §R3-D2 ｜ **Session:** 2026-09-13 ｜ **状态：闭环（守卫 28/28 PASS，退出码 0）**

---

## §1 开工第一句复述（阻塞状态 + 必读清单逐条路径）

**阻塞状态：** `Blocked by: None`（issue / handoff / prompt 三处一致），可立即开工。本票无外部副作用闸门（区别于 #19 的 push 授权闸门）。

| # | 清单条目 | 解析路径 | 状态 |
|---|---|---|---|
| 1 | issues/20-fact-schema-v0.md | .scratch/architecture-recovery/issues/20-fact-schema-v0.md | OK 16 行 |
| 2 | handoffs/20-fact-schema-v0.md | .scratch/architecture-recovery/handoffs/20-fact-schema-v0.md | OK 26 行 |
| 3 | spec.md §R3-D2 | .scratch/architecture-recovery/spec.md:307-308 | OK |
| 4 | WORKFLOW.md §4.2 | .scratch/architecture-recovery/WORKFLOW.md:228-301 | OK |
| 5 | decision-ledger.md（A-021 行） | .scratch/architecture-recovery/decision-ledger.md:232 | OK |
| 6 | docs/adr/0005-*.md | **D:/Aworker/6F/docs/adr/0005-hub-of-facts-with-federated-adjudication.md**（唯一命中） | OK |

> 注：第 6 条基准目录在**仓库根** `docs/adr/`，不在 `.scratch/architecture-recovery/` 下（该处无 docs/ 子目录）——与 #19 报告 L-19-b 记录的同源问题，已按根路径解析。

## §2 调研（per WORKFLOW §4.2.3）

atomcode 深度调研已执行并落盘 `reports/20-research.md`（9,320 字节，7 段，26 信源，双引擎交叉验证）。核心结论：

**绑定选型三候选项对照表（唯一项已定，无骑墙）：**

| 候选 | npm 包 | 版本 | 安装体积 | API 面 | 维护度 | 裁定 |
|---|---|---|---|---|---|---|
| A | `@duckdb/node-api` | 1.5.5-r.4 | 68.2 MiB | 双接口+Appender+Prepared+流式 | 官方/196★/2026-09-12 push/月级 | **SELECTED** |
| B | `duckdb` | 1.4.4 | 58.4 MiB | 无 Appender，Arrow 带 Windows 限制 | 官方/91★/2026-01-30 停更/**deprecated** | rejected |
| C | `duckdb-async` | 1.4.2 | 58.4 MiB（依赖 B） | Promise 包装，无 Appender | 社区/156★/随 B 同步 EOL | rejected |
| D | `node-duckdb` | 0.0.79 | 不可比（需自编译） | 仅旧 Stream API | 社区/5 年无发布 | rejected |

**排他理由（逐条）：** B 被官方明文判 EOL（只为 1.4.x 最后一次发布）；C 的 `dependencies` 固定 `duckdb 1.4.2`，不是独立候选项；D 绑定 DuckDB 0.2.6 时代源码，Node 目标 ≥12.17 无法支撑 Node 20/22 CI 矩阵；A 是唯一同时满足「官方主推 + 随包 .d.ts + Appender + 活跃维护」的选项。

**与 current 决策的冲突点名：** 无。本票严格沿用 A-007 单写多读 / A-008 版本演进 / A-010 correlation key，未重开任何决议（守卫 F5/F6 断言机检）。

## §3 字段清单（表名 / 字段 / 类型 / 约束 / 继承关系）

**表 `audit_fact`（16 列，只追加）：**

| # | 字段 | 类型 | 约束 | 继承 |
|---|---|---|---|---|
| 1 | fact_seq | UBIGINT | NOT NULL PRIMARY KEY | **A-007** |
| 2 | fact_id | VARCHAR(36) | NOT NULL UNIQUE | ADR-0005 |
| 3 | schema_version | INTEGER | NOT NULL, CHECK(>=1), **REFERENCES schema_registry(version)** | **A-008** |
| 4 | trace_id | CHAR(32) | NOT NULL, CHECK 32 位 hex | **A-010** |
| 5 | baggage_id | CHAR(32) | NOT NULL, CHECK 32 位 hex | **A-010** |
| 6 | scale | VARCHAR(8) | NOT NULL, CHECK 5 档 | CONTEXT |
| 7 | quadrant | VARCHAR(16) | NOT NULL, CHECK 4 象限 | CONTEXT |
| 8 | dimension | VARCHAR(2) | NULL, CHECK S1-S5 | CONTEXT |
| 9 | collector_id | VARCHAR(64) | NOT NULL | R3-D3 |
| 10 | repo_ref | VARCHAR(256) | NOT NULL | CONTEXT |
| 11 | subject_ref | VARCHAR(512) | NOT NULL | ADR-0005 |
| 12 | evidence_ref | VARCHAR(512) | NOT NULL | CONTEXT |
| 13 | metric | VARCHAR(128) | NOT NULL | A-005 |
| 14 | value_json | VARCHAR | NOT NULL, CHECK(json_valid) | A-005 |
| 15 | observed_at | TIMESTAMPTZ | NOT NULL（采集器给定，可重放） | R3-D3 |
| 16 | ingested_at | TIMESTAMPTZ | NOT NULL DEFAULT current_timestamp（写者权威，防伪造） | **A-007** |

**表 `schema_registry`（5 列，只追加）：** 为使 `audit_fact.schema_version` 的 FK 能在 **DDL 冻结前声明**，v0 一并建表。依据 A-008 已记录教训——「凡 DDL 冻结的票，其下游票的引用完整性约束必须在建表前全部声明完，否则只能降级为进程内校验」。此举是**执行** A-008 教训，不是重开决议。
## §4 守卫脚本（reports/20-fact-schema-check.mjs，退出码 0）

```
PASS B1 :: selected=@duckdb/node-api            PASS B2 :: candidates=4
PASS B3 :: selectedCount=1                      PASS B4 :: rejected=3
PASS B5 :: apiKeys=6                            PASS B6 :: quantifiedCandidates=3
PASS B7 :: fenceWords=[]                        PASS F1 :: manifest=16 ts=16
PASS F2 :: order=fact_seq>...>ingested_at       PASS F3 :: keys=7
PASS F4 :: allInheritsDeclared                  PASS F5 :: covered=A-007,A-008,A-010
PASS F6 :: reopenHits=0                         PASS F7 :: maxCorrelationIdx=4 minPayloadIdx=12
PASS F8 :: trace=CHAR(32) baggage=CHAR(32)      PASS F9 :: schemaVersion=INTEGER
PASS F10 :: fkDeclaredBeforeDdlFreeze           PASS F11 :: noAlterInDdl
PASS F12 :: jsonValidCheck                      PASS F13 :: scaleEnum=5
PASS F14 :: ddlParensBalanced                   PASS A1 :: rejected=9/9
PASS A2 :: allowed=4/4                          PASS A3 :: threw=true name=AppendOnlyViolation
PASS A4 :: exports=openWriter,openReader,appendFact,queryFacts,factFieldNames bad=[]
PASS A5 :: rewriteTokensInFacade=[]             PASS A6 :: readerReadOnlyDeclared
PASS A7 :: dep=1.5.5-r.4
GUARD-PASS 28/28
```

只追加断言的**语义层次**（避免 W3 #15 R6 式自指）：A5 只扫描 `store.ts`（门面），黑名单定义位于 `schema.ts`，二者分离；A1/A2 走 `classifyStatement()` 行为断言而非文本匹配。

## §5 完成定义逐项对照（handoff）

| 完成判据 | 状态 |
|---|---|
| schema v0 代码/落文交付 | DONE（engine/src/fact/{schema,store,index}.ts + reports/20-fact-schema.json） |
| 绑定选型唯一 | DONE（B1/B3 断言；`@duckdb/node-api@1.5.5-r.4`） |
| 守卫断言清单 | DONE（28/28 PASS，退出码 0） |
| ledger A-021 回写 done | DONE |
| WORKFLOW §4 追加 1 行 lessons | DONE |
| commit msg 引用 A-021 + 守卫结果 | DONE |

**issue 检查项逐条：** 绑定选型唯一 + 理由量化（B1-B6）｜字段清单落文（§3 + JSON）｜只追加不可改写断言（A1-A5）｜沿用 A-007/A-008/A-010 不重开（F5/F6）｜构建与测试一律 CI（本机未执行 npm install / build / test）。

## §6 阻塞

**无阻塞。** 唯一需提请注意的**未验证项**（诚实记录，不是阻塞）：绑定 API 的编译与运行时行为未经本机验证——本机按 prompt delta 第 3 条禁构建，仅通过 unpkg `.d.ts` 静态核验了 `DuckDBInstance.create` / `DuckDBConnection.create` / `connection.run` 签名。`npm run build` 与 `smoke` 留待 CI。

## §7 lessons 候选

| # | 现象 | 教训 |
|---|---|---|
| L-20-a | 生成 .mjs 时把每行当字符串字面量加了引号，文件实际只是一串字符串表达式：**无输出、退出码 0、node --check 也通过** | 「退出码 0 + 零输出」是静默失败特征，不能用退出码代替输出断言；守卫脚本写完后必须断言**输出行数 > 0**，而不只看退出码 |
| L-20-b | DDL 由字段清单程序化派生后，`CHECK(regexp_matches(...))` 少一个右括号——只有真正渲染 DDL 才暴露 | 程序化派生 DDL 必须配「括号平衡 + 实际渲染一次」的断言（本票 F14）；字段清单正确 ≠ DDL 正确 |
| L-20-c | 本机禁构建时，绑定 API 用法只能靠静态核验 | 用 unpkg 取 `.d.ts` 核验导出名与签名（零安装、零构建），可显著降低 CI 首跑失败率，应固化为「禁构建票」的标准动作 |
| L-20-d | Node 22 类型剥离可直接 `import` .ts，使守卫脚本能做**行为断言**而非文本猜测 | 纯逻辑模块与原生依赖模块必须分离（schema.ts 纯 / store.ts 带原生 import），守卫只 import 纯模块，既零依赖又可行为断言 |

## §8 引用文件列表

- .scratch/architecture-recovery/{issues,handoffs,prompts}/20-fact-schema-v0.md
- .scratch/architecture-recovery/spec.md（§R3-D2, :307-308）
- .scratch/architecture-recovery/WORKFLOW.md（§4.2, :228-301）
- .scratch/architecture-recovery/decision-ledger.md（A-007 :14 / A-008 :15 / A-010 :17 / A-021 :232）
- .scratch/architecture-recovery/reports/{20-research.md, 20-fact-schema.json, 20-fact-schema-check.mjs}
- docs/adr/0005-hub-of-facts-with-federated-adjudication.md
- CONTEXT.md（Scale / Strategic Quadrant / S1-S5 / Evidence Gate / Cross-Scale Correlation Key 等术语）
- engine/src/fact/{schema.ts, store.ts, index.ts} · engine/package.json · .github/workflows/engine-ci.yml

## §9 版本控制处置（WORKFLOW §4.2.1）

- 全部写操作走 `but` CLI；本会话独立分支 **`20-fact-schema-v0`**。
- 提交：**`twt`**（10 files changed, 979 insertions, 1 deletion）；commit message 首行 `20: close A-021`，正文引用 A-021 + 守卫 28/28 PASS 退出码 0。
- **分支堆叠处置**：`WORKFLOW.md` / `decision-ledger.md` 为多窗口共享文件，GitButler 判定其改动依赖 `19-push-ci-activation`（`szo`），直接提交被拒。已按 CLI 提示执行 `but move 20-fact-schema-v0 --above 19-push-ci-activation` —— **仅调整分支排序，未改动 #19 窗口的任何提交内容**，随后提交成功。当前栈序：`20-fact-schema-v0` └─ `19-push-ci-activation`。
- **hunk 粒度提交**：共享文件只提交本票 hunk（`py:5` / `sq:a`），未带走其他窗口的改动；`engine/package.json` 只提交依赖新增那一行（`lq:4`）。
- 未执行任何 git write 命令（add/commit/push/checkout/merge/rebase/stash/cherry-pick）。
- **未执行任何 push**（远端与时机须用户明示授权，未获授权）。
