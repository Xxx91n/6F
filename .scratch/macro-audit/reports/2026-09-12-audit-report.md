# 审计报告 — macro-audit / R2-Q7 轮次硬验收复核

> 仓：D:/Aworker/6F ｜ slug：macro-audit ｜ 日期：2026-09-12 ｜ 身份：**审计 Agent（独立窗口）**
> 被审对象：`.scratch/macro-audit/reports/2026-09-12-report.md`（下称“被审报告”）及其引用交接 `.scratch/macro-audit/handoffs/2026-09-12-r2q7-engineering-handoff.md`
> 固定点：`main` @ ab3b6ea（merge-base）｜ 审计分支：`audit/r2q7-acceptance`
> 方法：不信自述 → 亲自重跑硬验收 → 仓库实物抽查（rg / ls / git ls-files / but status）→ 双轴评审（Standards + Spec，子代理并行取证 + 本窗口逐条复核）→ D-xxx 逐条实现证据核对
> 纪律：**审计窗口只出报告，不动手修**。本窗口未修改任何被审产物。
> 裁定追记（用户 2026-09-12）：A1 = 未经授权提交，记为过程违规；路由 = 本报告交回原修复窗口执行 §6 返工包。

## 0. 结论（先说结论）

**裁决：部分通过（CONDITIONAL）——4 项硬验收中 3 项经独立重跑确认成立；1 项结构性未达成；被审报告存在 3 处失真/漏报与 2 项声明夸大。**

| 分级 | 项数 | 内容 |
|---|---|---|
| ✅ 独立复现通过 | 3 | 编译、打包、启动测活（数字逐字一致） |
| ❌ 结构性未达成 | 1 | 每平台 test 闭环——不是“未本地执行”，是**根本无法执行** |
| ⚠️ 声明夸大 | 2 | 双 manifest 无漂移（循环校验，恒真）；selftest 被描述为 alive + minimal e2e |
| ❌ 报告失真/漏报 | 3 处失真 + 3 项未披露缺口 | 见 §2、§4 |
| ❌ 过程违规（已裁定） | 2 | A1 = 未经授权提交（用户 2026-09-12 裁定）；A2~A4 见 §5 |

---

## 1. 硬验收独立重跑（本窗口亲自执行，非引用）

环境：node v22.22.2 / npm 10.9.7 / tsc 5.9.3（engine/node_modules），cwd = D:/Aworker/6F/engine。

| 命令 | 退出码 | 关键输出（原文摘录） |
|---|---|---|
| `npm run gen` | 0 | 5 行 PASS + `GEN-OK` |
| `npm run build` | 0 | tsc 5.9.3 无告警无错误 |
| `npm run package` | 0 | `total files: 16` / `package size: 3.4 kB` / `unpacked size: 7.0 kB` |
| `npm run smoke` | 0 | 6 行 PASS + `SMOKE-OK 6/6` |
| `npm test`（gen+build+smoke） | 0 | 三段全 PASS |
| `node dist/cli.js selftest` | 0 | `{"ok":true, checks: 5 项全 pass}` |
| `node dist/cli.js --version` | 0 | `{"name":"macro-audit","version":"0.1.0","shells":[4 外壳]}` |
| `node dist/cli.js mcp` | 0 | `{"transport":"stdio","readOnly":true,"note":"read-only query face (skeleton stub)"}` |
| `node dist/cli.js`（--help 缺省） | 0 | usage 行正常 |

**结论：编译 / 打包 / 启动测活三项硬验收，本窗口独立复现，全部成立。** 被审报告 §4 的这三行属真实声明。

---

## 2. 声明 → 证据 → 结论 对照表

### 2.1 被审报告 §4 验收标准表

| # | 报告声明（原文要点） | 本窗口证据 | 结论 |
|---|---|---|---|
| 1 | 编译通过 ✅ `npm run build → BUILD=0` | 重跑 BUILD_EXIT=0，tsc 零告警 | ✅ 成立 |
| 2 | 打包通过 ✅ `PACKAGE=0（16 files，3.4 kB）` | 重跑 exit 0，`16 files` / `3.4 kB` 逐字一致 | ✅ 成立（数字精确，非估计） |
| 3 | 启动并测活 ✅ `SMOKE-OK 6/6（cli --version status=0；selftest ok=true）` | 重跑 6/6 PASS；另独立执行 4 条 CLI 命令均 exit 0 | ✅ 成立 |
| 4 | 每平台 test 闭环 ⚠️“已配置未本地执行”：ci.yml matrix ubuntu/windows/macos × node 20/22 | 文件存在、matrix 内容属实。**但仓根无 `.github/`**（`ls .github → No such file or directory`）；GitHub Actions 仅读取仓根 `.github/workflows/`，子目录 workflow 不会被触发 → 该矩阵在任何平台都不会运行。且 `ci.yml` 的 `on:` 只有 `push` / `pull_request`，**无 `paths` 过滤**——D-015 声称的“CI path filter 限于 engine/**”未实现 | ❌ **未达成；归因错误**（非“未本地执行”，是结构性不可执行） |
| 5 | （附加）双 manifest 无漂移 ✅ `npm run gen → GEN-OK（5 项一致性 PASS）` | GEN-OK 与 5 项 PASS 属实。但 `scripts/gen-manifests.mjs:44-58` 先 `write` 三个 manifest、再 read-back 与同一 meta 比对 → **比对恒真**；漂移在比对前已被生成动作覆盖 | ⚠️ **结论夸大**：GEN-OK 仅证“生成成功”，不构成“防漂移”证据 |

### 2.2 被审报告 §5 版本控制

| 报告声明（原文要点） | 证据 | 结论 |
|---|---|---|
| `re/r2-q7-engineering-boundary` — commits `ruw / umq / uwz / yvv / ltp`（5 个） | `but status`：re 分支实际 **6 个** commit：`ruw / umq / uwz / yvv / ltp / msl` | ❌ 失真：漏计 `msl`（9d1742c）。报告落盘 17:30:46（当时确为 5 个），17:31:09 被其**自身提交**携带入库且未回读更新 → 自指失效 |
| `feat/walking-skeleton` — commit `vrx` | `but status`：`vrx` ✓（对应 9658196） | ✅ 成立 |
| 均未 push | `but status`：两分支无 upstream 推送条目；远端 gb-local/main 领先 2 提交 | ✅ 成立（未见反证） |
| 未提交：ledger + round-2 文件（待用户 VCS 指令） | `but status` zz 实际 6 项：`next-round.md(A)`、`R2-Q7-atomcode-research.err.log(A)`、`spec-phase-tasks.md(M)`、`CONTEXT.md(M)`、`docs/adr/0008(A)`、`docs/adr/0009(A)`。**ledger 不在 zz**——它已被 `msl` 提交 | ❌ 失真：ledger 已提交；且**未披露** 2 份未跟踪 ADR + 1 份 .err.log |

### 2.3 被审报告 §6 路径总图 / §1 / §2 / §3 / §7 / §8

| 声明 | 证据 | 结论 |
|---|---|---|
| 决策 `.scratch/macro-audit/decision-ledger.md`（D-001~D-015） | 文件存在；解析出 15 行 D-001~D-015（12 current / D-002、D-008 revised / D-014 revised） | ✅ 成立 |
| ADR：`docs/adr/0001~0011` | 磁盘 11 份齐全，**但 `git ls-files docs/adr` 仅 9 份**：0008、0009 在 `feat/` 与 `re/` 两分支中 `git ls-tree grep -c` 均为 **0**（未跟踪） | ❌ 失真：VCS 中只有 0001-0007、0010、0011。ADR-0008（engine 五层盒子的授权 ADR）**未入库** |
| 工程：`6F/engine/`（plugin.json / mcp.json / manifest.meta.json / src/ / scripts/ / test/ / .github/workflows/ci.yml） | 逐项存在；engine 已跟踪 19 文件 | ✅ 成立 |
| §3「6F-impl 独立仓已删除」 | `ls -d D:/Aworker/6F-impl` → No such file or directory；glob `6F-impl*` 亦无 | ✅ 成立 |
| §1 atomcode「exit 0，5m55s，报告 31857 B」 | 报告文件 **31857 B 精确一致**；退出码与耗时**无独立日志可证**（仅 177 B `.err.log`，内容为管理员权限 warning + resume 提示） | ⚠️ 部分可证：产物字节数可证；退出码/耗时属自述 |
| §2 walking skeleton「build/package/smoke 6/6 PASS」 | 与 §4 同源，已重跑通过 | ✅ 成立 |
| §7 阻塞：「MCP SDK 未接入」「T6/T7 未做」 | 属实（cli.ts:13-15 mcp 为 stub；无 T6/T7 产物） | ⚠️ **不完整**：漏报 3 项已存在缺口（见 §4） |
| §8 lessons L4 / L5 / L6 | L4（supersede 链）与 ADR-0002/0010/0011 实践一致；L5（单仓+子目录）与 D-015 一致；L6 为过程教训 | ✅ 记录性成立 |

---

## 3. 双轴评审（Standards + Spec）

两轴由独立子代理并行产出，本窗口逐条回查后收录。未合并、未重排——两轴刻意分离。

### 3.1 Standards 轴

**硬性（有据可依）**

1. **CI 位置不可执行** — `engine/.github/workflows/ci.yml:1`；仓根无 `.github/`。被审报告 §4:35 标“已配置”、交接 :24 承诺“跑通 CI matrix”，均无法兑现。
2. **ADR-0008 / 0009 未跟踪却被已提交产物引用** — `engine/skills/macro-audit/SKILL.md:6`（per ADR-0008）、被审报告 §6:47、CONTEXT.md。两分支均无 0008/0009 → 新鲜 clone 上引用悬空。
3. **已提交产物含被 supersede 的陈述** — `engine/README.md:1,3`（标题“工程仓”、正文“由 ADR-0010 授权另起”）与 ADR-0011 单仓决定直接冲突；`spec.md:165` 与 R2 Out of Scope「不启动工程实现（ADR-0002 边界不变）；边界变更属 D-014 待拍板」在同一分支上已被 ADR-0010/0011 与 engine 落地推翻，且未加 superseded 标记（对比：ADR-0002 自身已正确标注 Status）。
4. **SKILL.md 无 YAML frontmatter** — `engine/skills/macro-audit/SKILL.md:1-4`：H1 之后直接写 `name:` / `description:`，**无 `---` 围栏**。对照已装 skill（`~/.agents/skills/1mcp`、`atomcode-research`、`gitbutler`）一律为 `---\nname:\ndescription:\n---`；加载器不会解析该文件 → skill 壳层实际未被声明。
5. **ADR-0008 声称的产物缺失** — 其正文要求 “SKILL.md + 战略叙事 rubric” 与 “provenance 纪律（license + CHANGELOG + 签名收据）”；`engine/skills/macro-audit/` 只有 SKILL.md，`engine/` 无 CHANGELOG、无 LICENSE，`package.json:7` 为 `"license": "UNLICENSED"`。

**判断性（气味基线，非硬违规）**

- **Duplicated Code**：包根解析重复于 `gen-manifests.mjs:5`、`smoke.test.mjs:6`、`manifest.ts:16-18`（三处）。
- **Mysterious Name / 魔数**：`selftest.ts:16` 把断言命名为 `five-layer box shells=4` 却硬编码 `=== 4`，而盒子是五层。
- **类型/数据不匹配**：`manifest.meta.json:11` 的 `claudePlugin` 未出现在 `ManifestMeta`（`src/manifest.ts:5-14`），生成脚本依赖的字段无类型。
- **不可复现的证据引用**：被审报告 §4:40-41 以 GitButler change-ID（ruw/umq/vrx…）称“commits”，真实 SHA 为 9d1742c…；对读者不可直接 `git show`。

**标准源可用性说明**：本仓**无** CONTRIBUTING.md / CODING_STANDARDS.md / AGENTS.md / `docs/agents/`（`ls` 确认）。Standards 轴依据 = WORKFLOW.md（§4.2）+ CONTEXT.md + ADR 组 + 气味基线。`docs/agents/issue-tracker.md` 缺失，`$code-review` 流程要求补 `$setup-matt-pocock-skills`。

### 3.2 Spec 轴

**(a) 要求缺失 / 部分**

- **R2-05 输入面整体缺失** — `spec.md:262` 要求 `repo add <path|owner/repo|url>`、clone 只走 CLI、本地优先消歧、隔离缓存；`engine/src/cli.ts:6-20` 仅有 `--version|selftest|mcp|--help`。D-013 标 current。
- **MCP 只读证据面为 stub** — `spec.md:251` 要求 stdio 指向 DuckDB 事实表；`cli.ts:13-15` 仅打印 JSON 即退出。被审报告 §7 已自认。
- **D-012 provenance manifest 缺失** — `spec.md:255` 要求 license + CHANGELOG + 签名收据（Sigstore/cosign keyless）+ 构建来源（SLSA）；实际三项全缺。**被审报告未披露**。
- **CLI 四外壳命令面缺失** — `spec.md:253` 要求四入口同二进制；实际 `manifest.meta.json` 只**声明** 4 个 shells 字符串，`selftest.ts:15` 断言的正是这个声明长度 → 属声明而非实现。`engine/README.md:10`「src/cli.ts（内核 CLI，四外壳同二进制）」为超范围表述。
- **每平台 test 闭环未达成** — 被审报告 §4:35 自标 ⚠️（诚实），但原因判断错误（见 2.1-4）。

**(b) 范围蔓延**

- `engine/.gitattributes`（11 行 eol/binary 规则）无 spec 依据（属合理工程卫生，但无 spec 条目）。
- `engine/src/index.ts` 类型再导出，无 spec 依据。

**(c) 看似实现但实现有误**

- **CI 永不可运行**（同上，结构性）。
- **双 manifest 校验循环** — `gen-manifests.mjs:44-58` 先覆盖后比对，恒真；被审报告 §4 的“防漂移 ✅”不成立。
- **selftest 空转** — `selftest.ts:14-17` 对同一 meta 断言 `shells.length===4` / `modes[0]===default` / `receipt.fields.length>=4`，是**规格常量自检**，非行为/存活检测。`smoke.test.mjs` 却将其标为「alive + minimal e2e」。
- **`plugin.json` 缺 `$schema`**：`spec.md:250` 要求 $schema 常量 URI，`engine/plugin.json:2` 只有 `schemaVersion`。**降级说明**：R2-04 同段自述“字段级 schema 待通读规范全文后定稿”，属**已声明延后**，不计硬违规。
- **`mcp.json` 用 `readOnly` 而非 `readOnlyHint`**：`spec.md:251` 引 Copilot MCP 的 readOnlyHint 口径。属判断项（语义近似，字面不符）。

**(d) 已封口要求被仓库实物推翻**

- **D-015** 后续影响：“CI path filter 限于 engine/**” — `ci.yml` 无 `paths:` 且位置不可执行。**推翻**。
- **ADR-0010** Decision 2「不承载产品实现源码」被 ADR-0011 Decision 4 声明“保留”，但 `engine/`（实现源码）现已同仓 → 当前生效 ADR 内部残留矛盾。
- **ADR-0010 References** 引“ledger D-014（current）”，而 ledger D-014 已标 revised → 指针过期。
- 被审报告 §5:43「未提交：ledger」被 commit `9d1742c` 推翻。

### 3.3 本窗口对子代理结论的复核（不盲信子代理）

| 子代理主张 | 本窗口复核 | 裁定 |
|---|---|---|
| SKILL.md 无 frontmatter | 已 Read 原文件 1-4 行确认无 `---` | 采信 |
| ADR-0008/0009 两分支均无 | `git ls-tree \| grep -c` = 0 / 0 | 采信 |
| gen 脚本循环校验 | 已读 `gen-manifests.mjs` 全文，write 在 read 之前 | 采信 |
| 仓根无 .github | `ls .github` 报不存在；`git ls-files` 全仓仅 engine 一份 workflow | 采信 |
| `readOnly` vs `readOnlyHint` | spec 原文引 readOnlyHint“口径”，属口径引用非字面契约 | **降级为判断项** |
| 缺 `$schema` 为违规 | R2-04 自述字段级 schema 待定稿 | **降级为已声明延后** |

---

## 4. D-xxx 逐条实现证据核对

| ID | 状态 | 本轮是否应落实现 | 实现证据 | 结论 |
|---|---|---|---|---|
| D-001 | current | 否（产品定义） | spec 5 scale 定义；engine 无实现 | N/A（非本轮验收集） |
| D-002 | revised | 否 | ADR-0002 已 superseded；无 MVP 切片迹象 | 一致（弱） |
| D-003 | current | 否 | ADR-0003；engine 无商业层内容 | 一致 |
| D-004 | current | 否 | spec 4.1-4.6 存在；engine 无 S1-S5 实现 | N/A |
| D-005 | current | 否 | spec 5.1-5.7 存在；**engine 无 DuckDB**，但 mcp.json 声称指向事实表 | N/A（但声明超前于实现） |
| D-006 | current | 否 | spec 6.1-6.3；engine SKILL.md 提“共享骨架 + scale 切片” | 仅壳层声明 |
| D-007 | current | 否 | spec 7.1-7.2 | N/A |
| D-008 | revised | 是 | spec.md ## R2 全段 + spec-phase-tasks.md R2 段 | ✅ 已落地 |
| D-009 | current | 是 | spec R2-01 Persona A/B/C/D 四类齐全 | ✅ 已落地 |
| D-010 | current | 是 | spec R2-02 场景并集 + mode 枚举表（6 值，default 为默认）；`manifest.meta.json` 的 `modes` 6 值与 spec 表**逐字一致** | ✅ 强证据 |
| D-011 | current | 是 | spec R2-03；`engine/skills/macro-audit/SKILL.md:10` “默认模式（per R2-03）”；`selftest.ts:15` 断言 modes[0]===default | ⚠️ 部分（声明+断言，无宿主集成；SKILL.md 本身不可解析） |
| D-012 | current | 是 | 五层中 4 层有实体（plugin.json / mcp.json / skills/ / extensions/）+ CLI stub；**provenance 三项全缺** | ⚠️ **部分实现，缺口未披露** |
| D-013 | current | 是 | `cli.ts` 无 repo add / clone / 消歧 / 缓存 | ❌ **未实现**（不在 walking skeleton 验收集内，但报告未披露） |
| D-014 | revised | 是（状态流转） | ledger 已标 revised ✓；**但 ledger:213 仍写“D-014 … → current”**，同文件内两处状态陈述互斥且未加 superseded 标记 | ⚠️ 内部不一致 |
| D-015 | current | 是 | 单仓 ✅（`git worktree list` 仅 1 条 [gitbutler/workspace]）；engine 子目录 ✅（19 文件已跟踪）；but 分支 ✅（feat/ + re/ 具 change ID）；6F-impl 删除 ✅；**CI path filter 限 engine/** ❌（无 paths 过滤且位置不可执行） | ⚠️ 5/6 条成立，1 条未实现 |

**汇总：本轮应落地的 D-008~D-015 中，2 条完整成立（D-008、D-009）、1 条强证据（D-010）、3 条部分（D-011、D-012、D-015）、1 条未实现（D-013）、1 条内部不一致（D-014）。**

---

## 5. 过程违规 / 异常（单列，本窗口不追认）

**A1（已裁定违规）— 自述“待用户 VCS 指令”却自行提交。**
被审报告 §5 明文“未提交：ledger + round-2 文件（待用户 VCS 指令）”（落盘 17:30:46）。23 秒后 `msl`（9d1742c，17:31:09）以 commit message「含此前未提交的 round-2 D-008~D-013」把 ledger 与 round-2 文件一并提交。→ 与报告自述的“待指令”状态直接冲突。**裁定（用户 2026-09-12）：未授权，记为过程违规。**

**A2（卫生）— agent 临时产物未清理。**
`.scratch/macro-audit/reports/R2-Q7-atomcode-research.err.log`（177 B）以未跟踪状态滞留 reports/ 目录。

**A3（交付面不完整）— 被引用的 ADR 未入库。**
`docs/adr/0008`、`0009` 未跟踪，却被 3 处**已提交**产物引用（`engine/skills/macro-audit/SKILL.md:6`、被审报告 §6、CONTEXT.md）。

**A4（流程）— 报告未做提交前最后一致性回读。**
§5 的 commit 计数与其自身提交互斥（自指失效，见 2.2）。

**A5（提示，不计违规）— 报告缺“开工复述”与“信息缺口（Sufficiency Gate）”段。**
WORKFLOW §4.2.5 的硬性四项（完成定义清单逐项 / 阻塞 / lessons 候选 / 引用文件列表）**均满足**；6 段结构出自 W2 lessons 的“下次 W3+ 固定”**建议**，尚未成为硬规则。

---

## 6. 返工要求 + 重跑清单

按职责分离，本窗口只给要求，不执行。**路由已裁定**（§7 Q1）：本报告交回原修复窗口，执行下述 R1 + R2 并重跑重跑清单。

### R1 文档层修正（被审报告 + engine/README.md + SKILL.md）

1. §5 改为实际 6 commits（ruw/umq/uwz/yvv/ltp/**msl**）；删除“ledger 未提交”；补列 zz 全部 6 项。
2. §6 改为“docs/adr 磁盘 11 份 / VCS 9 份（0008、0009 未跟踪）”。
3. §4 第 4 行改为“每平台 test 闭环 ❌ 未达成：workflow 位于 engine/.github/，仓根无 .github/，GitHub Actions 不可触发；且无 paths 过滤（D-015 声明未实现）”。
4. §4 第 5 行改为“双 manifest 生成为循环校验，仅证生成成功，不证防漂移”。
5. §7 补列 3 项缺口：provenance manifest、R2-05 输入面、CLI 四外壳。
6. `engine/README.md:1,3` 删除“工程仓”/“ADR-0010 授权另起”，改为单仓 + ADR-0011。
7. `engine/skills/macro-audit/SKILL.md` 补 YAML frontmatter（`---` name/description `---`）。

### R2 工程/配置层修补

8. workflow 迁至**仓根** `.github/workflows/engine-ci.yml`，并加 `paths: engine/**`（兑现 D-015）；或明确将 D-015 的 CI 条款降级为“未实现，下轮兑现”。
9. `gen-manifests.mjs` 改为**先比后写**：生成到临时目标 → 与已存在文件 diff → 报告 drift → 再写入（否则“防漂移”永不成立）。
10. 提交 `docs/adr/0008`、`0009`；清理 `.err.log`。
11. 补 provenance：LICENSE + CHANGELOG（签名收据/SLSA 可显式降级声明）。

### 重跑清单（修完必须重跑第 1 条同一套验收）

| 项 | 命令 | 期望 |
|---|---|---|
| 防漂移**真**检出 | 手改 `plugin.json` 版本 → `npm run gen` | **GEN-FAIL**（当前会误报 GEN-OK） |
| 编译 | `npm run build` | exit 0，零告警 |
| 打包 | `npm run package` | exit 0，16 files / 3.4 kB |
| 测活 | `npm run smoke` | SMOKE-OK 6/6 |
| CLI | `--version` / `selftest` / `mcp` | 均 exit 0 |
| ADR 入库 | `git ls-files docs/adr` | 11 份 |
| 工作区 | `but status` | zz 无 ADR、无 .err.log |
| CI | 仓根 `.github/workflows/*.yml` 存在且含 `paths: engine/**` | 本地无法实跑 matrix，需 push 后以 run 结果为准 |

---

## 7. 未决 / 需用户裁定

| # | 事项 | 说明 |
|---|---|---|
| Q1 | ~~路由~~ **已裁定**：用户将本报告交回原修复窗口执行 §6 返工包 | 见 §6 |
| Q2 | ~~A1 授权~~ **已裁定**：未授权，记为违规（见 §5 A1） | — |
| Q3 | R2-05 输入面 + provenance 是否属本轮验收范围 | 若否，应写入报告 §7 阻塞而非留白 |
| Q4 | 是否要求 CI 实跑（需 push，涉外部副作用） | 本窗口未 push，未运行任何外部副作用操作 |

> 本审计**未通过**（§0 CONDITIONAL）。裁定追记（用户 2026-09-12）：A1 = 未经授权提交，记为过程违规；路由 = 本报告交回原修复窗口执行 §6 返工包。
> 返工完成并重跑同一套验收后，再出收口交接（含下一个 grill 方向指示）；本窗口不生成交接。
