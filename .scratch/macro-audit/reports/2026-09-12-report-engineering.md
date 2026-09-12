# 2026-09-12 报告（二）— D-014 批准执行：ADR-0010 + 工程仓 walking skeleton

> 仓：D:/Aworker/6F（spec）+ D:/Aworker/6F-impl（工程）｜ slug：macro-audit ｜ 日期：2026-09-12
> 前置：reports/2026-09-12-report.md（R2-Q7 调研呈报）

## 1. 触发
用户 2026-09-12 批准 D-014（激活 B4.1）：supersede ADR-0002 + 另起工程仓 + R2 先封口 + walking skeleton 验收。

## 2. 边界迁移（spec 仓）
- ledger D-014：proposed → current（用户批准，2026-09-12）
- ADR-0010 新建：docs/adr/0010-spec-repo-and-engineering-repo-split.md（2529 B）—— supersede ADR-0002
- ADR-0002：Status → superseded by ADR-0010（正文保留，符合 ADR 不可变原则）
- spec.md ## R2（R2-01~05）已于前一轮落盘

## 3. 工程仓（D:/Aworker/6F-impl）— walking skeleton
结构（Agent Plugin 五层盒子）：
- manifest.meta.json（单一元数据源）→ plugin.json + .claude-plugin/plugin.json + mcp.json（生成）
- skills/macro-audit/SKILL.md（方法论壳，只读）
- extensions/com.macroaudit.hooks/（hooks 触发/呈现面）
- src/cli.ts（内核 CLI，四外壳同二进制）+ src/manifest.ts + src/selftest.ts
- scripts/gen-manifests.mjs（双 manifest 生成 + 防漂移校验）
- test/smoke.test.mjs（启动并测活）
- .github/workflows/ci.yml（matrix: ubuntu/windows/macos × node 20/22）

## 4. 验收标准逐项对照（可复跑证据）

| 验收要求 | 结果 | 证据（命令 + 输出摘要） |
|---|---|---|
| 编译通过 | ✅ | npm run build → BUILD=0（tsc 无错） |
| 打包通过 | ✅ | npm run package → PACKAGE=0（npm pack --dry-run，16 files，3.4 kB） |
| 启动并测活软件进程 | ✅ | npm run smoke → SMOKE-OK 6/6（cli --version status=0；selftest ok=true，5 项内检全过） |
| 每平台 test 闭环 | ⚠️ 已配置未本地执行 | ci.yml matrix ubuntu/windows/macos × node 20/22；本机仅 Windows 实跑，macOS/Linux 需 CI |

补充：npm run gen → GEN-OK（双 manifest 5 项一致性校验 PASS，无漂移）。

## 5. 版本控制（per WORKFLOW §4.2.1）
- spec 仓：分支 re/r2-q7-engineering-boundary（commits ruw / umq / uwz），已 stack 在 e-branch-2 之上
- 工程仓：分支 feat/walking-skeleton（commit pmv）
- 未提交：ledger + round-2 文件（spec 仓）——其未提交 diff 混入上一 session 的工作，未擅自打包

## 6. 阻塞 / 未完成
- 每平台 test 闭环需 CI 实跑（本地仅 Windows）
- 双 manifest 生成脚本 = 自研（无直接先例）
- Agent Plugins 规范全文未通读 → plugin.json 字段级 schema 待定稿
- MCP 官方 SDK 未接入（当前 mcp 命令为只读 stub）
- 任务书 T6（信息缺口扫描）/ T7（呈报待定）未做

## 7. lessons 候选
- L4：ADR 修订必须走 supersede 链（旧 ADR 仅改 Status，正文保留）——本仓 S2 判据自洽。
- L5：新仓 bootstrap 时 but 可先 git init 再 but setup（自动建 gb-local 目标分支）。
- L6：ctx_execute 写含 GitHub Actions 的 yaml 时，$ 后接 { 会被外层模板字面量吞掉——用 $ + { + { 拼接规避。

## 8. 引用文件
- D:/Aworker/6F/docs/adr/0010-spec-repo-and-engineering-repo-split.md
- D:/Aworker/6F/.scratch/architecture-recovery/spec.md（## R2）
- D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md（D-014 current）
- D:/Aworker/6F-impl/（工程仓）
