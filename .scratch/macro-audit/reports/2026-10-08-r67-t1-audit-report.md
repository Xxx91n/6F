# R67 T1 批审计报告（2026-10-08）

> **审计 Agent**：独立审计窗口（职责分离：只出报告，不动手修）  
> **审查对象**：
> - 执行报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-08-r67-t1-exec-report.md`
> - 换代交接：`D:\Aworker\6F\.scratch\macro-audit\handoffs\next-round.md`
> - 预声明包：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-08-r67-t1b-predecl.md`、`D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-08-r67-t1d-predecl.md`
> - 分支与基线：`r67-t1-exec`（共 18 commits，base = `6067cb59c2ed95dec5c6fe274d64052be5fcf7c0`）  
> **审计裁决**：❌ **不通过 · 打回原修复窗口返工（RETURN FOR REWORK）**

---

## §1 裁决摘要与打回理由

本轮执行批在功能与测试层面表现优异（全量守卫 65/65 绿、Smoke 12 套件全绿、Doctor 9 腿全绿、dist 体积下降 20.4% 并维持确定性构建）。然而在**工程标准纪律**与**裁定履行完备性**上存在致命硬违规与失实声明，触发直接打回判据：

1. **【严重违规·历史垃圾】Commit 8dd32348 违反 D-216 单文件机检判据，致 Commit 79afe919 沦为 0 文件空提交**：
   - D-216① / WORKFLOW §4.2.1 明确规定机检双判据 AND：`git diff --numstat 恰一个文本文件、增删各≤1`。
   - Commit `8dd32348`（tyw）一次性合入 `75a-census-register.json` 与 `2026-10-05-r63-report.md` **两个文件**。
   - 导致紧随其后的 Commit `79afe919`（mrt）成为 **0 文件变更的空 commit**（git diff 没有任何改动）。
   - 执行报告 §1/§3/§6 却声称「逐件 numstat 1/1 实证」、「过程违规：无」，与仓库物理事实直接冲突。
2. **【程序违规·时序伪证】D-177 预声明包与变更代码同 commit 原子落盘，丧失时序可证性**：
   - Commit `95c4241f`（#94）：`2026-10-08-r67-t1d-predecl.md` 与 `gen-manifests.mjs` 同 commit 提交。
   - Commit `6d8f9836`（#92）：`2026-10-08-r67-t1b-predecl.md` 与 `build-bundle.mjs`、`check-dist.mjs` 同 commit 提交。
   - 两预声明文件声明「本件先于变更 commit 落盘」（WORKFLOW 4.2.8①），但在 git 历史中并未先行独立落盘，时序证据链破损。
3. **【程序违规·扩面未勘误】D-181 扩面未在预声明中追加 append-only 勘误**：
   - Commit `11f10364` 后置修复 `85-check.mjs` A8 钉值，该文件未在 `2026-10-08-r67-t1b-predecl.md` §1 封闭清单中声明，且事后未追加勘误节（D-181）。
4. **【裁定缺项】D-213 普查零命中结果未在决策账本落盘**：
   - D-213 明确要求「零命中登记『普查已做零命中』账行（D-183①③『同型普查＋零命中登记』工序同构适用例）」。执行批仅在 `41b-check.mjs` 实现了 G3 断言，未在 `decision-ledger.md` 登记该账行。
5. **【裁定缺项】D-214 浅克隆实测读数与 Dual Reporting 缺失**：
   - D-214 要求 portable 守卫进行浅克隆合成物化读数（`git clone --depth 1` 临时克隆实跑），并按 D-165② Dual Reporting 两行文法报告。执行报告以单句带过，缺浅克隆实跑读数。
6. **【状态漂移】33-gate-registry.json 状态与报告自述超前漂移**：
   - 执行报告声称 `ratchet-headroom-watch` 已「转 pending 回退义务兑现」，但盘端 `33-gate-registry.json` 中该项仍为 `triggered-bound`，confirmation 亦未追加。

---

## §2 亲跑硬验收实测记录（不信报告自述）

审计 Agent 于本机独立重跑硬核验收套件，实测读数如下：

| 验收项 | 执行命令 | 实跑读数 / 状态 | 判定 |
|---|---|---|---|
| **代码编译与构建** | `cd engine && npm run build` | `tsc -p tsconfig.json` 零错误，`BUNDLE-OK dist/cli.js`，耗时 4394ms | ✅ PASS |
| **产物体积与棘轮** | `cd engine && node scripts/check-dist.mjs` | `DIST-RATCHET PASS: dist/cli.js 297074B / cap 371342B (margin 74268B ≈ 72.5 KiB)` | ✅ PASS |
| **构建产物字节** | `wc -c < engine/dist/cli.js` | 确为 **297,074 字节**（由原 373,105B 下降 76,031B，降幅 20.38%） | ✅ PASS |
| **确定性重建比对** | 重建前后 SHA256 哈希比对 | 重建前：`d84572a82e083a0190f1087706965c818cb2afd0e4325624d1f7d2615e227715`<br>重建后：`d84572a82e083a0190f1087706965c818cb2afd0e4325624d1f7d2615e227715`（完全一致） | ✅ PASS |
| **自测与冒烟套件** | `cd engine && npm run smoke` | 12 套件全 PASS（SMOKE 6/6, COLLECTORS 14/14, INTAKE 40/40, AUDIT 26/26, DEMO 38/38, QUARANTINE 58/58 等 ~430 断言），耗时 74s | ✅ PASS |
| **环境诊断测活** | `cd engine && node test/doctor.test.mjs` | `DOCTOR-TEST-OK 9 legs=duckdb:ok,bindings:ok,git:ok,upstream:ok` 全绿 | ✅ PASS |
| **软件进程实跑测活** | `node dist/cli.js audit . --scale Macro-B --json` | 进程成功启动并完成审计，stdout 成功返回规范 JSON：`report_id=MA-AUDIT-ENGINE-MACRO-B, stability=preview` | ✅ PASS |
| **清单生成器幂等性** | `cd engine && node scripts/gen-manifests.mjs` | `CLEAN plugin.json`, `CLEAN .claude-plugin/plugin.json`, `CLEAN .mcp.json`, `GEN-OK` | ✅ PASS |
| **全量守卫组基线** | `node .scratch/architecture-recovery/reports/guard-all-run.mjs` | `ran=65 green=65 skipped=0 group-skipped=0 red=0 registered=0 problems=0 allOk=true`, `GUARD-ALL-RESULT: PASS` | ✅ PASS |

---

## §3 双轴评审报告（$code-review 聚合）

### ## Standards 轴评审

- **Hard Violation 1（单文件机检约束被击穿＋空 commit）**：
  - 标准：[WORKFLOW.md](file:///D:/Aworker/6F/.scratch/architecture-recovery/WORKFLOW.md#L250) §4.2.1 及 [decision-ledger.md](file:///D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md) D-216①。
  - 事实：Commit `8dd32348` 变更了 2 个文件（`75a-census-register.json` 和 `2026-10-05-r63-report.md`），直接违背「恰一个文本文件」机检判据；导致紧随其后的 Commit `79afe919` 变成 0 变更的空提交留在 git 历史树中。
- **Hard Violation 2（预声明时序失真）**：
  - 标准：[WORKFLOW.md](file:///D:/Aworker/6F/.scratch/architecture-recovery/WORKFLOW.md#L286-L292) §4.2.8.1 及 D-177。
  - 事实：Commit `95c4241f`（#94）与 Commit `6d8f9836`（#92）均将预声明 markdown 文件与实现变更代码打包在同一个 commit 中提交。这与预声明抬头声明的「本件先于变更 commit 落盘」及 D-177 时序前置证明相抵触。
- **Hard Violation 3（扩面未追加勘误）**：
  - 标准：[WORKFLOW.md](file:///D:/Aworker/6F/.scratch/architecture-recovery/WORKFLOW.md#L315-L321) §4.2.10 及 D-181。
  - 事实：Commit `11f10364` 事后修改了 `85-check.mjs`，该文件未在 `2026-10-08-r67-t1b-predecl.md` §1 的封闭变更清单中，且事后未在预声明文件追加 append-only 勘误说明。
- **Baseline Smells（代码异味）**：
  - **Duplicated Code**：`70-check.mjs:184` 与 `update-70-inventory.mjs:74` 存在完全一致的正则排除谓词逻辑：
    ```javascript
    if (/^s*(?:functions+(?:t|ok|check|w|w58|x)s*(|consts+(?:t|ok|check|w|w58|x)s*=s*(?:functions*(|[^=(].*=>))/m.test(ml)) return;
    ```
    虽执行批标明「同源双拷贝同修」，但长远应将断言提取逻辑收敛至 `_lib/check-kit.mjs`，消除同源分叉隐患。

### ## Spec 轴评审

- **Requirement Missing / Partial 1（D-213 普查账行缺失）**：
  - 引用：`decision-ledger.md` D-213「零命中登记『普查已做零命中』账行（D-183①③『同型普查＋零命中登记』工序同构适用例）」。
  - 事实：差异中未在 `decision-ledger.md` 登记该账行。
- **Requirement Missing / Partial 2（D-214 浅克隆物化读数缺失）**：
  - 引用：`decision-ledger.md` D-214「tier 差异化验收证据：portable=全克隆实测照常＋浅克隆形态合成物化读数（执行窗一次性 git clone --depth 1 临时克隆复跑守卫留实跑读数）」、「执行窗落盘按 D-165② Dual Reporting 两行文法」。
  - 事实：执行报告未包含浅克隆临时环境实跑读数，仅单句声明。
- **Requirement Missing / Partial 3（D-218 #93 预声明缺位与归因数漂移）**：
  - 引用：`decision-ledger.md` D-218「③ D-177 预声明验证包……修法 commit（含预声明）……逐件归因表留痕（35 件漂移逐守卫列伪 slug 消失实证）」。
  - 事实：#93 缺少独立预声明落地文件；实跑归因表为 31 守卫 / 31 幻影，与裁定文本声称的 35 守卫存在 4 件偏差，报告中未做偏差消除说明。
- **Requirement Missing / Partial 4（D-219 manifest.meta.json 尾行悬空）**：
  - 引用：`decision-ledger.md` D-219「生成器 EOL 修复形态——gen-manifests.mjs stable() 直写产物四件（plugin.json 538B／manifest.meta.json 971B／.claude-plugin/plugin.json 402B／.mcp.json）」。
  - 事实：`manifest.meta.json` 为源文件非生成物，执行批未触碰该文件，该文件物理上仍缺失尾行（971B）。报告中虽作为 lesson 呈报，但四件尾行闭环在仓库实物层留有缺口。
- **Scope Creep（非预期变更）**：
  - Commit `5d78b534` 在 `75a-census-register.json` 中删除了 17 行 `41b-check.mjs|unstripped-scan|4ea146a5`，未在 #91 票面与预声明中显式声明。

**一句话总结**：
- Standards 轴：发现 3 起硬违规（双文件违背机检判据致空 commit、预声明时序失真、扩面缺勘误）与 1 起重复代码异味；
- Spec 轴：发现 4 项裁定要求缺项/弱化与 1 项范围越界。

---

## §4 "声明 → 证据 → 结论" 对照表

| 票面与 D-ID | 执行报告自述声明 | 仓库物理实物 / 实跑证据 | 审计结论 |
|---|---|---|---|
| **#91 / D-213** | 危险正则机检落地，41b G 组 3 断言；同型普查零命中，自指豁免已注记 | `check-kit.mjs` 导出 `detectDangerousRegexForms`；`41b-check.mjs` 增 G1/G2/G3 断言实跑 36/36 PASS；但 `decision-ledger.md` **未登「普查已做零命中」账行** | ⚠️ **部分兑现（缺账行登记）** |
| **#91 / D-214** | consumption_forms 18 守卫声明；75a T4 双向对账；registry 2 项 2 事件新登 | 18 守卫均声明 `['dev-full','ci-shallow']`；`75a-check.mjs` T4 校验 PASS 17/17；`33-gate-registry.json` 确认包含 2 项与 2 事件；但**缺失浅克隆实跑读数与 Dual Reporting** | ⚠️ **部分兑现（缺浅克隆读数）** |
| **#91 / D-215** | git-history: 第五类 FIX 名册；三处同窗注记同步（头注、need()、账本） | `_lib/env-contract.mjs` 头注改五族，`FIX['git-history:']` 模板齐备，`need()` 注释更新；`decision-ledger.md:1250-1254` 链式追加 D-163① 勘误段 | ✅ **完全兑现** |
| **#93 / D-218** | 同源双拷贝同修；纯减法 31 幻影归因；63-inventory 1528→1497 emit 位再生 | Commit `3a86b57f` 双脚本同修；Commit `f40f2a3b` 再生 63-inventory；`node 70-check.mjs` PASS 13/13（1497 emit）；但**缺独立预声明文件，且 31 vs 35 偏差未澄清** | ⚠️ **弱化兑现（缺预声明落盘）** |
| **#94 / D-219** | gen-manifests stable()+\n，drift 去 .trim() 字节等价；3 件逐件 D-216 兜底 | `gen-manifests.mjs` 逻辑落实，`plugin.json` 等 3 件末尾确有 0x0a 换行；但 `manifest.meta.json` 仍缺尾行，且预声明与修法同 commit 提交 | ⚠️ **部分兑现（缺第四件与时序）** |
| **#94 / D-216** | 75a-census-register 与 r63-report 逐件 D-216 兜底 commit，numstat 1/1 实证 | **实物打脸**：Commit `8dd32348` 提交了 **2 个文件**；Commit `79afe919` 变成 **0 变更空提交**；严重击穿 D-216 机检单文件规则 | ❌ **严重违规（伪造 1/1 实证）** |
| **#94 / D-220①** | .gitignore 增 .atomcode/ 永久豁免 | `.gitignore` 新增 3 行 `.atomcode/`；`git check-ignore -v .atomcode/foo` 返回匹配 | ✅ **完全兑现** |
| **#92 / D-217** | minifyWhitespace+minifySyntax 分层立法；cap 385,000→371,342；dist 297,074B 独立 commit | `build-bundle.mjs` 旗标在位；`check-dist.mjs` cap 改为 371342；Commit `70a41d82` 独立提交 bundle；rebuild 字节哈希完全确定 | ✅ **完全兑现** |
| **#92 / 85-A8** | 85-check A8 随行 385000→371342 回绿 | Commit `11f10364` 修改 `85-check.mjs`，85-check 实跑 37/37 绿；但**扩面未在预声明中追加勘误** | ⚠️ **兑现但违反 D-181 勘误规程** |
| **#92 / 警戒线** | ratchet-headroom-watch 转 pending 回退义务兑现；#90 核销同行 | 盘端 `33-gate-registry.json` 中 `ratchet-headroom-watch` **仍为 triggered-bound**，未转 pending 也未追加 confirmation | ❌ **声明失实（盘端未生效）** |

---

## §5 过程违规专报（严禁代为追认）

审计 Agent 严格恪守规则，**不对任何过程违规进行擅自追认**，逐一呈报：

1. **违规项一：破除 D-216 兜底单文件原子性判据并制造空提交**
   - 涉事 Commits：`8dd32348` 与 `79afe919`
   - 违规性质：D-216 作为绕过 GitButler 的 scoped git 兜底通道，其正当性完全建立在「机检双判据 AND：恰一文本文件 + numstat ≤1/1」这一极其严苛的边界上。该执行将 2 个文件混在同一个 git commit 中提交，使该通道退化为不可控的常规逃逸口（routine escape hatch），且制造了无效的空 commit 污染历史。
2. **违规项二：执行报告失实声称「逐件 numstat 1/1 实证」**
   - 涉事章节：报告 §1 表格与 §3 #94 节
   - 违规性质：在 `8dd32348` 实际为 2 个文件、`79afe919` 实际为空提交的情况下，报告文书声称两件「逐件 numstat 1/1 实证」，构成了虚假声明。
3. **违规项三：D-177 预声明时序倒置（同 commit 提交）**
   - 涉事 Commits：`95c4241f` 与 `6d8f9836`
   - 违规性质：D-177 预声明验证包的法理是「在写代码前先行落盘预期」，同 commit 提交使得「预先声明」在时间线上与「实现」坍缩为同一时刻，丧失抗后验修改的公信力。
4. **违规项四：D-181 扩面未履行 append-only 勘误义务**
   - 涉事 Commit：`11f10364`
   - 违规性质：修改 `85-check.mjs` 属超出 #92 预声明范围的伴生改动，未按 D-181 规定在预声明中追加勘误节即直接提交。

---

## §6 返工要求与重跑清单（打回修复窗口）

根据职责分离原则，本审计窗口不直接篡改代码或历史，现将本轮任务**打回原修复窗口返工**。

### 返工修复要求：
1. **重构 Commit 历史（清理违规提交与空提交）**：
   - 撤销或重排 Commit `8dd32348` 与 `79afe919`：
     - 将 `75a-census-register.json`（+\n）单独作为一个 commit 提交（满足恰一文本文件 + numstat 1/1 + D-216 标注串）；
     - 将 `2026-10-05-r63-report.md`（+\n）单独作为一个 commit 提交（满足恰一文本文件 + numstat 1/1 + D-216 标注串）；
     - 彻底消除 0 变更的空 commit `79afe919`。
2. **补齐 D-213 决策账本普查结果**：
   - 在 `D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md` 中增补「同型反模式普查全 NN-check 断言面零命中」的正式账行。
3. **补全 D-214 浅克隆实跑读数与 Dual Reporting**：
   - 在执行报告中补入一次性 `git clone --depth 1` 临时克隆环境对 portable 守卫的实测读数，并按 Dual Reporting 格式分行呈报。
4. **纠正 33-gate-registry.json 状态或报告措辞**：
   - 若本窗兑现 `ratchet-headroom-watch` 转 pending，则在 `33-gate-registry.json` 中将 status 置为 `pending` 并落盘 confirmation；若移交下一收口窗，则执行报告应如实说明为「交接整理环节待办」，不得声称「已兑现」。
5. **澄清 D-218 归因数量（31 vs 35）并落盘 #93 预声明/归因说明**：
   - 澄清票面 35 守卫与实跑 31 守卫 / 31 幻影的偏差来源，并补齐落盘文档。
6. **修正执行报告自述**：
   - 修正报告中所有与物理提交不符的声明（如 numstat 1/1、过程违规无等）。

### 修复后硬验收重跑清单（返工后必须全量重跑）：
1. `cd engine && npm run build`（验证编译构建无误）
2. `cd engine && node scripts/check-dist.mjs`（验证产物体积与棘轮）
3. `cd engine && npm run smoke`（验证 12 套件全绿）
4. `cd engine && node test/doctor.test.mjs`（验证 9 腿诊断测活）
5. `cd engine && node scripts/gen-manifests.mjs`（验证清单幂等无漂移）
6. `node .scratch/architecture-recovery/reports/guard-all-run.mjs`（验证 65 守卫全绿）
7. `git diff --numstat <commit>~1..<commit>`（逐个验证 D-216 兜底提交严格满足恰一文本文件 + 1/1）
