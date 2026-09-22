# 轮26 审计报告 —— r26-74-6f-rename（T0 守卫基线 + T1 #74 6F 正名 + T2 #76 engine-ci 红修）

日期：2026-09-22 · 审计窗口：独立审计 Agent · 对象：`.scratch/macro-audit/reports/2026-09-22-report.md` + 分支 r26-74-6f-rename 五 commit（77ba7a8..2a13575：64a1552/56bd88a/7a3d1be/8179a7f/2a13575）· 评审面：`round26-audit-workdiff.patch`（37 文件 +903/-706）

**裁决：PASS-WITH-FINDINGS** —— 硬验收全绿、关键声明逐项有实物、双轴评审各 PASS-WITH-FINDINGS；发现均为非阻断项（注释漂移/测试残留/文档面未提交等），返工建议见 §六。

## 一、硬验收重跑（亲跑，不信自述）

| 验收标准 | 报告声称 | 实测证据 | 结论 |
|---|---|---|---|
| 编译通过 | tsc 0 错+BUNDLE-OK | `npm run build` → tsc 无输出 + `BUNDLE-OK dist/cli.js`；post-build sha256=c9bc372c422ef257 == 提交态（确定性重建一致，git status engine/dist 净） | ✅ |
| 打包通过 | tgz 75 件 815.8kB | `npm run package`（dry-run）→ macro-audit-0.1.0.tgz **75 件**，unpacked **816.2kB**（报告称 815.8kB，0.4kB 口径漂移，脚注级） | ✅（脚注 F-07） |
| 启动测活 | selftest exit 0 + --version JSON + MCP stdio | `node dist/cli.js selftest` exit 0，5 项全 pass（manifest=6f@0.1.0/4 shells/mcp read-only）；`--version` → `{"name":"6f","version":"0.1.0"}` exit 0；MCP 链路由 smoke 内 mcp-db-resolution.test.mjs 覆盖（PASS） | ✅ |
| 每平台 test 闭环 | CI run 35677822036 六腿全绿 | `gh run view 35677822036`：status=completed conclusion=**success**，event=push，branch=r26-74-6f-rename，workflow=engine-ci，六 job（ubuntu/macos/windows × node20/22）全 success | ✅ |
| 本地测试 | audit 26/26、demo 38/38、selfheal-e2e 3/3、offline 13/13、doctor-fix 6/6 | 亲跑（Node v24.11.0）：AUDIT 26/26 exit0、DEMO 38/38 exit0、selfheal-e2e 3/3 exit0、offline 13/13 exit0、doctor-fix 6/6 exit0；npm run smoke 18 件链尾 audit-zero-write 全 PASS 无 not ok。报告所称 Node-20.19.5 本地腿本窗口以 v24 复证，node20 腿由 CI 覆盖 | ✅ |
| 守卫基线 | 17/17 + xfail-run 绿 | 亲跑 16 守卫全 exit0：33=31/31、34=23/23、38=34/34、41b=33/33、44=59/59、46=30/30、52a=22/22、53=25/25、54=20/20、55=18/18、56=24/24、64=15/15、70=13/13、71=16/16、72=16/16、73=14/14；xfail-run PASS（册内 7 条，无 XPASS） | ✅ |

## 二、关键声明实物抽查（声明→证据→结论）

| # | 声明 | 实物证据 | 结论 |
|---|---|---|---|
| C1 | README.md H1/alt→6F | L2 alt=`6F — macro + micro…`，L6 `# 6F` | ✅ |
| C2 | Highlights 宣言块六句 | L21-26 Facts/Federation/Forensics/Five scales/Frankness/Fingerprints 各一行动宾句，均钉资产（5/6 带 ADR 号；Fingerprints 钉 receipts 无 ADR 号——D-092③ 槽6 原文亦无 ADR，临界） | ✅（脚注 F-06 邻） |
| C3 | preview badge 紧随宣言区 | L28 `status-preview` 徽章紧跟宣言块 | ✅ |
| C4 | 双锚 #6f + a-id macro-audit | L5 `<a id="macro-audit">` 兼容锚在；#6f 由 `# 6F` GitHub slugger 隐式供给（无显式 `id="6f"`，GitHub 可用）；zh L10 `{#6f}` 显式（GitHub 不渲染此语法会露字面量，73-check B2 锚校验放行） | ✅（cosmetic F-06） |
| C5 | zh-CN 镜像 + sync 戳 c1096e8405f7 | L2 `<!-- sync: c1096e8405f7 -->`、L10 H1=6F 镜像宣言块 | ✅ |
| C6 | hero.svg 六 F chip 族 | Facts/Federation/Forensics/Five scales/Frankness/Fingerprints 6 chip + 名=6F | ✅ |
| C7 | social-card.png 重产未上传 | Bin 32832→31540 在 diff；文件在盘 31540B；上传=所有者闸门未越 | ✅ |
| C8 | description.md displayName→6F+注记 | `displayName | `6F`` + 变更注记（原值 Macro Audit→6F 2026-09-22 D-092/D-093，冻结面其余字段不动）——diffstat 仅 ±1 行 | ✅ |
| C9 | engine/README kernel 代号注记 | `macro-audit 为 kernel 技术标识…门面品牌名=6F（双名分层 D-093）` | ✅ |
| C10 | CONTEXT.md「6F」名释条目 | 在档（属 r25 收口 commit cbf7fa1，平行栈，工作区已含） | ✅ |
| C11 | kernel 标识保留不动 | plugin.json skills=macro-audit、.mcp.json macro-audit-kernel、architecture.svg kernel 标签、CHANGELOG 零 6F——均未被改名 | ✅ |
| C12 | .code-tmp/ 入 .gitignore | .gitignore:9 `.code-tmp/` 在——但**已跟踪文件不适用**：git ls-files 显 7 件在库，check-ignore 空，锐评.txt 仍挂 M | ⚠ 弱化实现（F-04） |
| C13 | stale-assertions XPASS 摘除+人工裁决注记 | meta.xpass_removal_2026_09_22 在档；xfail-run 7 条册内无 XPASS | ✅ |
| C14 | literal-pin-census 34 守卫/77 命中/27+50 | 实测：扫 55 件、34 件命中、77 hits（LIT-EQ 44+DATE-LIT 33）、declared=27/undeclared-candidate=50——逐字相符 | ✅ |
| C15 | cli.ts write 回调门控+ExitSignal+async main | outExit/errExit 定义（write 回调内 process.exit）、class ExitSignal、5 处 instanceof 守卫+main() 边界吞哨兵；裸 process.exit 仅存于两回调 | ✅（计数口径 F-07） |
| C16 | closeDuckdb 双段关闭+调用面全迁 | store.ts WeakMap<DuckDBConnection,DuckDBInstance>+export closeDuckdb；audit.ts=2/doctor.ts=3/projection.ts=2/audit.test=1 处接线且零 closeSync | ✅（残留 F-02） |
| C17 | 自愈 npm pack+tar 手术面 | store.ts 内 npm pack+tar 解包代码在（注释行52机制文已同步），冷启动 npm install 保留；tar -xzf -C 全相对路径 | ✅ |
| C18 | integrity 族正则任一>1MB | 原生件族（node/so/dylib/dll）正则实证于 store.ts | ✅ |
| C19 | 64-check A1/A6 合法演化 | 64-check PASS 15/15；断言随机制更新（D-094(b) 类非入册） | ✅ |
| C20 | 73-check preview 徽章放行 | 73-check D1 白名单含 status-preview 带理由注记，PASS 14/14 | ✅ |
| C21 | 闸门不越 | registry engine-ci-main-green occurred=false（未预翻）；无 merge/push 提交面；social-card 未上传 | ✅ |

## 三、D-xxx 逐条核对

| D | 要求 | 实现证据 | 结论 |
|---|---|---|---|
| D-092 | 正名 6F+六句宣言钉资产+preview badge+zh 镜像 | C1-C8 全验；六句=集 B' 原文；无营销腔/无未兑现宣称（preview 诚实边界守住） | ✅ |
| D-093 | 波及面四面改+双锚+description 注记式修订+kernel 保留面 | C1/C4/C8/C11 全验；保留面逐项抽查未被碰 | ✅ |
| D-094⑤ | XPASS 摘除=人工裁决明文（两键分离） | stale-assertions meta.xpass_removal_2026_09_22 注记在档，册内零 XPASS | ✅ |
| D-097① | write 回调门控整类收敛 | 25 调用点全走 outExit/errExit，裸 process.exit 仅存两回调内；ExitSignal never 哨兵+main 边界 | ✅ |
| D-097② | closeDuckdb 调用面全迁 | 枚举面 audit/doctor/projection/audit.test 全迁零 closeSync；**残留** narrative.test.mjs:62/86 子进程串内 closeSync（枚举外面，良性） | ⚠ 弱化（F-02） |
| D-097③ | pack+extract 仅手术面 | nodeApiPresent 分支内启用，裸装面 npm install 保留 | ✅ |
| D-097④ | CI 全矩阵绿方翻事件位 | 六腿绿实证+registry occurred=false 未翻 | ✅ |

## 四、双轴评审（子代理并行取证）

### Standards 轴 — PASS-WITH-FINDINGS
文档标准零硬违例（双语 sync 戳/产物同 commit/守卫共演化/诚实面白名单全合规）。Baseline smells（judgement call）：store.ts:53 注释漂移（.node 阈 vs 族正则）、narrative.test 裸 closeSync、selfHealDuckdb spawnSync→tag-exit 三连重复、ExitSignal catch-guard 脆性（4 站漏守即吞哨兵）、instanceOf 命名、.duckdb-heal-* 未 gitignore。

### Spec 轴 — PASS-WITH-FINDINGS
(a) 缺失/弱化：census 落盘但未入 commit（T3 伸展非约束面）；Fingerprints 句无 ADR 号（临界）；narrative.test closeSync 残留。(b) 跑偏/越闸：零——kernel 标识/历史文档/registry/merge/push/social-card 上传全未越。(c) 实现错误：零实质；nit=zh-CN highlights 双锚重复。

## 五、发现清单（非阻断）

| F | 面 | 内容 | 严重度 |
|---|---|---|---|
| F-01 | 代码注释 | store.ts:53「完整性校验（.node 存在＋尺寸阈）」未同步族正则——同文件 52 行已改 53 行漏 | minor |
| F-02 | 测试残留 | narrative.test.mjs:62/86 spawn 子进程串内 c.closeSync() 未迁 closeDuckdb | minor |
| F-03 | 代码形态 | selfHealDuckdb spawnSync→tag-exit 重复×3；outExit/errExit 孪生可合并 | nit |
| F-04 | 过程 | .code-tmp/ 入 gitignore 对已跟踪 7 件不生效（锐评.txt 仍挂 M）——若意在断跟踪须 rm --cached 或书面声明意图 | minor |
| F-05 | 过程 | 收口文档面未提交：报告/账本 D-097/census/next-round 进度块均挂 zz——防丢纪律破口 | minor |
| F-06 | 门面 | zh-CN {#6f} GitHub 露字面量；zh highlights 双锚重复 | nit |
| F-07 | 报告口径 | 包体积 815.8kB→实测 816.2kB；「22 出口」→实测 25 调用点 | nit |
| F-08 | 闸门 | 分支 push 已发生（CI run=push 事件）——任务书「逐次授权」字面 vs T2 交付物「CI 全绿 run」隐含授权；merge 未越。呈报不裁 | 呈报项 |

## 六、返工建议与重跑清单

建议返工包（修复窗口或经批准后）：F-01 注释一行改、F-02 两处迁 closeDuckdb、F-04 裁定意图（断跟踪则 git rm -r --cached .code-tmp 或账本注记「保跟踪防新文件」）、F-05 提交收口文档、F-06 zh 双锚择一。
重跑清单（修完同套）：`npm run build`（dist hash 应保持 c9bc372c——注释/测试改动不进 bundle，若变=bundle 漂移）→ `npm run package` → selftest+--version → `npm run smoke` + selfheal 三件套 → 16 守卫 + xfail-run → git status engine/dist 净。

## 七、证据索引

- workdiff：.scratch/macro-audit/reports/round26-audit-workdiff.patch（37 文件 +903/-706）
- CI：run 35677822036（六腿全 success）；前轮红 35515346216/35677071573 与报告一致
- 哈希：dist/cli.js sha256=c9bc372c422ef257（提交态=重建态一致）
- 本窗口实测环境：Node v24.11.0 / npm 11.19.1（报告 Node-20 腿由 CI 覆盖）
