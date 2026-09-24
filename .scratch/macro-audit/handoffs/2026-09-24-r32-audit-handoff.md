# 2026-09-24 轮 32 审计交接（r32-exec 栈 · 审计窗→修复窗）

## 状态

- 栈 `r32-exec`（叠 r31-closeout 55d6ae1 之上）：rly→vpq→yyu→mkq→mkr 五提交分道，未 push/merge。
- 审计结论=**有条件通过**：硬验收面审计窗亲跑 100% 复现全绿（build/package/selftest/smoke 22 册/16 守卫+xfail/棘轮/gen 幂等/e2e 三面/dist 字节级复现/脏区零感知实验）；报告声明无虚构。但含必修 4 项+建议修包+呈报待裁 4 项，未替你追认。
- 审计报告全文：`D:\Aworker\6F\.scratch\architecture-recovery\reports\2026-09-24-r32-audit-report.md`（声明→证据→结论对照表 + D 覆盖表 + 重跑清单 §7）。
- 取证工件：`D:\Aworker\6F\.scratch\macro-audit\audits\r32\`（full-diff.patch、e2e-audit 产物、dirty-facts.duckdb 脏区实验、mcp-e2e.cjs、dbcmp.cjs）。

## 必修返工（建议打回执行窗，修后跑报告 §7 同一套验收）

- **F1** `82-check.mjs:25` 真空断言：`/[ADR-d{4}]/g` 字符类 bug → `rows>=23` 恒真（实测 517 hits vs 正确式 23）。改正则。
- **F2** 33-gate-registry `first-external-contributor` 只有 events 项、items 零绑定——补 event_bound watch item（trigger_event 指向它）。
- **F3** `runAuditFile` 补采写环无 `runInTransaction`（D-122③ 引 D-115）——补事务或暂存提交，防残观测集。
- **F4** MCP `cli_guidance` 用仓名拼命令实测 PATH-NOT-FOUND——改用 repo_path 或如实降级文案。

建议修包与待裁项详见报告 §5（F5 MCP 缺库形态 / F6 available_head_shas 不齐 / F7 小疵包 / F8 kernel 残留读法分歧 / F9 emitted 203→197 差 / F10 D-125 缝合孤儿需求 / F11 golden 再生不可证）。

## 过程违规（呈报，未追认）

- registry 全文件重缩进搭车（语义差集证清白但可审性差）+丢尾行；package.json 丢尾行；44-G6 断言标签名实不符；报告把 78-check C1 断言更新误称「文档漂移」。

## 下一个 grill 方向指示

1. **D-125 血缘缝合归口裁**（F10）：「卡投影沿血缘链缝合跨改名历史」现无步骤认领——grill 候选题：缝合归 #80 步③还是独立票？判据=步③票面枚举 vs 边界件 1-switch 成对件是否依赖缝合语义。
2. **D-123⑤ 读法裁**（F8）：失败态「仅静态指标」的 kernel 层射程（直投全量 vs 仅静态度）——词表级裁定即可。
3. 主线仍是 **#80 步③**（任务书 T4）：试点三角 jiahao+env-manager 双仓实跑、miss 四类 0-switch 边界件逐类点名、renamed_to 1-switch 成对件、benchmark p95 分档+target/danger 双阈值实跑预登记、披露四件套+not_in_preview——前置=必修返工闭环+重跑绿。
4. 次序建议：修复窗先落 F1-F4（+小疵包顺手）→审计窗复跑 §7→再进 #80 步③ grill/执行。

## suggested skills

- 修复窗：`implement` / `tdd`（F1-F4 + 小疵包）；修后 `code-review` 复评 diff 增量。
- 复验窗：本审计报告 §7 清单即命令面；重跑后对照表更新。
- 下轮任务书生成：`to-spec` / `to-tickets`（步③票面+缝合归口裁定入票）。
- 版本控制：`but`（GitButler 栈续走 r32-exec 或新支；push/merge 逐次授权）。

## 口径备忘

- MCP stdio 应答乱序按 id 匹配（原 handoff 警告复核属实）。
- `npm run package` 是 dry-run 不落 tgz 文件；ctx 沙箱 NODE_OPTIONS 污染——宿主测试先 `env -u NODE_OPTIONS`。
- 本窗审计工件属 .scratch 未提交面；cli.ts 脏区实验已还原（sha256 回证）。
