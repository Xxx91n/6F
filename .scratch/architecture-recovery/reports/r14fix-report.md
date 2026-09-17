# r14fix 返工报告 — 轮 14 审计发现修复窗口（2026-09-17）

> 触发：.scratch/macro-audit/reports/2026-09-17-audit-report.md §8 修复要求；守卫 r14fix-check.mjs PASS 24/24。

## A 面：实现缺陷（4/4 修复）

| ID | 缺陷 | 修复 | 机检 |
|---|---|---|---|
| A1 | degradeReport 模板叙事引用降级前对象→「降级原因：未声明」与真值并存 | 两段式构造：先成 out（degraded_reason 就位）再 renderTemplateNarrative(out)；三场景 golden 重基线 | r14fix A1a~A1c＋narrative D4 |
| A2 | buildReport degraded:true 直建路径无模板兜底（注释声称有） | 选「修代码」对齐 D-053①：degraded 且空叙事→模板注入（兜底只补空位，有宿主段不盖） | r14fix A2＋narrative R5/R6 |
| A3 | mcp.json 注册不会说 JSON-RPC 的 server（注册面>实物面） | 选「补握手」：mcp-server.ts 最小 JSON-RPC 2.0 stdio（NDJSON 行帧；initialize/notifications/ping/tools/list/tools/call；唯一 tool=facts 走同一投影）——宿主挂上不再即死 | r14fix A3/A3b＋narrative M1/M4/M5 |
| A4 | package-lock.json 根 license=UNLICENSED 漏网 | npm install --package-lock-only 重生成→Apache-2.0＋npm ci 冒烟 | r14fix A4 |

## B 面：文书漂移（4/4 修正）

- B1 根 CHANGELOG M-004 a_range→A-001 ~ A-055（A-055 先于 M-004 落账，原「无新增」为漂移）
- B2 日报 header 七行→八行 A-056~A-063
- B3 总览表 commit@branch 勘误：nkk/qlt 实在 r14-51-behavior-quadrant 栈段（r14-48/r14-50 为栈顶空标签未落远端），勘误注记入日报
- B4 PR #3（kmk 落账，2026-09-17T01:21:07Z merged）补记入总览表＋T6 窗口节

## C 面：判定项逐条裁定（12/12 处置）

| 采纳修复 | C1 引文核验抽 citation.ts 破循环 import（generate re-export 兼容）／C3 删死参 at+签名收窄 Pick／C4 用 NARRATIVE_SEAL_PROTOCOL 常量／C5 宿主叙事降级不丢弃（重盖章 sealed-with-gaps 留痕）／C6 limit NaN 闸／C7 严格参数面（未知 flag/缺值/bogus 子命令 exit 2）／C8 G1 断言名对齐实义／C10 CHANGELOG 双 Added 合并／C11 faces[] 去歧义（function-coupling 具名归 face_criteria，function-* 通配覆盖，22→21） |
|---|---|
| 记一笔不改码 | C2 \bverdict\b 从严本意注释声明／C9 骨架版本 1.1.0 不升版先例成立（加法字段非契约变更，升版触发点=删/改名/语义翻转）／C12 判据同 commit 纪律强度差异登记（后续判据先行提交） |

## 重跑清单（审计 §8 原文全过）

- npm test 全链绿：gen+tsc+smoke 十套件（NARRATIVE 25→34 断言，新增 R5/R6/D4/D5/M4~M8 锁修复点）
- npm run package 67 文件；selftest ok=true 5/5
- npm ci 冒烟（lockfile 变动后）：7 包 0 漏洞
- 十一守卫全 exit 0（33/41b/42/44/46/48/49/50/51/t8/t9）＋r14fix-check 24/24
- 陈旧五守卫 38/39/40/43/45 FAIL 不扩大（FAIL 面与 t8-watch-review §3 归因逐条一致）
- 守卫断言载体迁移留痕：42-E5/44-E2·E3/50-C5 随 C1/A3 重构改指 citation.ts/mcp-server.ts（语义源未漂移，断言跟随载体）

## 残余风险

- mcp-server 为最小握手（MCP protocol 2024-11-05 子集）：resources/prompts 等面未声明故未实现；宿主若探测未声明面按 -32601 显式拒，不装死
- golden 重基线后 DEMO O2 字节一致断言在新基线上重过（npm test DEMO 38/38）
