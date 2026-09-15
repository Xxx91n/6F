# round6-audit — 轮 6 收口审计报告（审计窗口，只审不修）

> 审计对象：reports/round6-report.md + 栈 8be9db5..HEAD（含 grill-r5-cleanup/round6-closeout 第二栈）
> 任务书：.scratch/macro-audit/handoffs/next-round.md（T0~T7）；spec：spec-phase-tasks.md R4 节 + issues #26~#31
> 审计日期：2026-09-15；审计结论：**不通过 —— 有实质发现需返工/呈报**

## §1 硬验收重跑（审计员亲跑，非信报告自述）

| 验收项 | 报告声明 | 亲跑结果 | 结论 |
|---|---|---|---|
| 编译 | tsc 0 错 | `npm run build` exit 0 无输出 | ✅ |
| 打包 | macro-audit-0.1.0.tgz 31 文件 | `npm run package` → total files: 31 | ✅ |
| 测活 | selftest ok=true 5/5 | `node dist/cli.js selftest` → ok:true, 5/5 | ✅ |
| test 闭环 | 26 断言 | gen+build+smoke 6/6 + collectors 13/13 + codelore-adapter 7/7 | ✅ |
| 六守卫 | 18+15+113+13+9+14=182 | 逐一亲跑全 PASS exit 0 | ✅ |
| 工作树 | — | but status: zz no changes；git status 干净 | ✅ |

## §2 声明 → 证据 → 结论 对照表

| # | 报告声明 | 审计证据 | 结论 |
|---|---|---|---|
| C1 | 栈 8be9db5←txv←kpz←pov,uvr,orr←vkn←nqq←nvm←oyp | but status / git log 逐 commit 对上 | ✅（但 §5 未披露报告自身所在第二栈 round6-closeout(qvk)+grill-r5-cleanup(sxm)，披露不完整） |
| C2 | TC-2 v1=0.2462 RED / 真值=0.4923 / v2=0.5846 RED | 27-dual-readings.json 逐字一致；26-truth-table aggregates 一致 | ✅ |
| C3 | 65/65 ALL-AGREE | prereg §2 判定口径 = v2 实测 vs 预注册 v2_expected（含 Date git 腿设计内 present）；27-check B4 断言过 | ✅ 合规（验收语义经预注册收窄并写死于重跑前） |
| C4 | 重测恰 1 次 + 预注册先于重跑 | rerun_count:1；git log pov(066c0bc) 先于 uvr(fb0fb8d) | ✅ |
| C5 | detector-miss 16(form11+inline5) / real-gap 33 | 26-truth-table delta_class 实算：form=11/inline=5/real-gap=33 | ✅ |
| C6 | post-freeze 16 格 | 实际 post-freeze=5（0014 五格全标）；16 = consistent 格数 | ❌ 张冠李戴 |
| C7 | 当前树 v2=1.0 not-RED (n=16) | 31-report L19/L29 + 31-probe-measurements.json diff 节有锚 | ✅ |
| C8 | CodeLore pin 0.28.0 / facts 8 / golden 契约 7/7 | 31-probe-measurements + upstream-facts.jsonl 8 行 + codelore-adapter.test 7/7 | ✅ |
| C9 | plugin.json 不合 Agent Plugins 1.0.0 | engine/plugin.json 实读：无 $schema const、skills/mcp 越界属性、extensions 为数组形态 | ✅ |
| C10 | 25 行全有状态值 + B4.1 规范化 | 25/25 拍板状态非空；B4.1=「关闭（D-015 supersede 吸收，非事项）」 | ✅ |
| C11 | 14 行挂门绑定「最迟+触发」未触发 | 14 行带「最迟」可复现；但「未触发」失实——B4.2/B1.2/D2 绑「2b 结题」、P6/D1 绑「阶段2双结题」，#31 本轮已结题 | ❌ 见 F2 |
| C12 | A-031~A-036 全 done，无悬空 current | 账本 R4 登记节逐行 done→implemented(2026-09-15) | ✅ |
| C13 | engine-ci.yml 未改，CI 3OS×Node20/22 同链 | diff 空；workflow 实读 os×3 node×2 跑 gen/build/package/smoke | ✅（但本轮 engine 改动未经 CI 实跑：paths 触发+栈未 push——用户闸门内，报告措辞未明说此省略） |
| C14 | C 层 disposition 不改写原文/时间戳 | 账本 L260-270 追加节，原裁定表与时间戳原样 | ✅ |
| C15 | 治理：Date×6 + 三节×9 verbatim + 0014 四节 | 0001/0014 实物确认；勘误补记标注在 | ✅（注：0001 的 Status 由 L5 迁至文末 L17——文本逐字、位置移动，「重分布」字面覆盖但宜注明） |
| C16 | issues/handoffs/prompts NN-slug ≤60 行 | 实测 issues≤17 / handoffs≤26 / prompts≤34 | ✅ |
| C17 | v1 留档禁改 + 适配层零业务规则 | collectors.ts v1 段零改（F6 断言）；codelore.ts 129 行仅 spawn+解析+pin | ✅ |
| C18 | 序列化：唯一并行对 #27∥#28，验收互不引用 | spec.md L373 + issues/27/28 验收段互不为完成条件 | ✅ |

## §3 双轴评审（code-review 双子代理并行，父窗复核取证）

### Standards
- **硬违规 1 条**：collectors.ts L286-293 legInlineIsoDate 返回 head-60 **行序首个** ISO 匹配；已入库预注册 27-prereg.md §1 腿 C 写死「head-60 行内**最早排序**的 ISO（= 02-adr-fallback.mjs extractInlineDate 语义，matches.sort()[0]）」。实现偏离已冻结规则；冻结集零影响（日期全同 2026-09-12），但 v2 作为定版检测器在未来语料会错解。
- 判断项：leg 'dash' 命名复用于 '## ' 节命中（语义含混）；collectAdrStructureV2 与 v1 ~55 行重复发射逻辑（受 v1 冻结约束，可接受）；magic numbers（slice(-400)×2、slice(0,60)）；测试缺口（unpinned/version-parse-failed 路径未测）；两测试文件 harness 风格不一。
- 已验证清洁面：v1 零改、ACL 无阈值/裁决、collectors 无网络/模型/fs/Date.now/Math.random。

### Spec
- **T7 值守未尽责**：「触发事件已发生而未拍的行 1 个工作日内升级」——绑「2b 结题/阶段2双结题」的行（B1.2、B4.2、D2、P6、D1）触发/到期条件本轮已达成，报告 §6「未触发」失实且未升级呈报。
- **README 邻居陈旧**：上游清单表行已改「已接入（探针切片）」，但同文件 mermaid L24 与所有权表 L60 仍写「CodeLore（规划中）」——同文件自相矛盾，弱化 T6「不虚报」要求。
- **全集口径漂移**：T1「14 份 ADR（docs/adr/ 全集）」字面达成，但全集已 16；0014 有 post-freeze 行而 0015/0016 无——覆盖口径不对称（spec 自身张力，非实现错）。
- 已验证：T0 立票链、T1 真值表先于 v2、T3 治理清零、T4 只追加不改写、T5 13 项+置信域+占位两字段×10、T6 适配器/pin/契约/provenance 三锚/漂移报告/任务1-3锚。

## §4 过程违规呈报（单独列出，不追认）

1. **报告自述失实 ×2**：§3「post-freeze 16 格」（实际 post-freeze=5、consistent=16）；§6「14 行挂门…未触发」（2b 结题绑定行已到期）。
2. **实现偏离已入库预注册**：legInlineIsoDate 未实现「最早排序」语义——预注册纪律的镜像违规（不是跑后调规则，而是实现没跟上写死的规则），须返工或走正式勘误，不可静默。
3. **披露不完整**：§5 栈图缺第二栈（报告自身所在 round6-closeout）；§2 未明说本轮 engine 代码未经 CI 实跑（在闸门内但应明示）。
4. **#28 由 subagent 执行**：报告已自披露且 verbatim 逐字断言在守卫中 —— 合规，记录备查。

## §5 返工清单（交修复窗口；修完重跑 §1 同一套验收）

R1. collectors.ts legInlineIsoDate 改为「head-60 全部匹配取最早排序」以符合 27-prereg 腿 C；或按 v2 追加/勘误流程明文改规则并留痕。加回归用例：后行更早日期 → 命中更早值。
R2. T7 补做：枚举 B1.2/B4.2/D2/P6/D1（绑 2b 结题 / 阶段 2 双结题）行，按 D-026 升级用户拍板或执行「重组改绑一次」并留痕。
R3. round6-report §3 勘误：post-freeze 16 → consistent 16 + post-freeze 5（0014，不入冻结对照）。
R4. README.md L24 mermaid 与 L60 所有权表同步 CodeLore 探针已接入口径。
R5. round6-report §5 补第二栈（grill-r5-cleanup/round6-closeout）披露；§2 补「本轮 engine 改动未上 CI（push 属用户闸门）」。
R6.（建议非阻断）0015/0016 补 post-freeze 行或在 26-truth-table 注明豁免费口径。

## §6 审计结论

**不通过**。硬验收链全部真实可复现、六票交付物大体扎实，但存在 1 处实现偏离预注册 + 2 处报告失实 + T7 值守漏项。按职责分离，本窗不修；返工窗口执行 §5 后重跑 §1 验收 + 六守卫，并由审计窗复核 C6/C11/F1。
