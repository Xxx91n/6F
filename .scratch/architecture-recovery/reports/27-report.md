# 27-report — 判据 v2：A-002 回退链接线（A-032 / spec §R4-D2）

## §0 开工复述

本票 Blocked by #26（已解除：26-check.mjs PASS 18/18，commit kpz）。必读已逐条读取：issue/handoff/spec §R4-D2/WORKFLOW §4.2/ADR-0015/26-truth-table.json/02-adr-fallback.mjs/collectors.ts §2。范围 = adr-structure@v2 回退链接线 + 冻结数据重跑双读数发布；v1 留档、阈值不动、golden set 对照。

## 调研

- **通道**：`ctx_batch_execute` → `atomcode -p` 单问题串行 timeout 600000；resume 锚 = `3bd54780-5b47-4bd5-8490-2a2665d1471f`（索引 label = atomcode-r6-27）。
- **工业先例（≥2）**：① ISO 9001:2015 §7.1.5.2 / FDA 21 CFR 820.72(b)(5)——测量设备失格时须书面评估既往结果有效性并记录重跑（或不重跑）理由；② COPE/AIP/CSE §3.5 erratum 制式——原文永不删、勘误双向链接、逐指标声明「哪些结论变/不变」；③ CALDB 校准库惯例——测量系统版本写入每次重跑结果元数据（本票 dual_readings 逐行带 detector 列）。
- **冲突点名**：调研指出「dual reporting」非标准术语（正式名 = 既往结果有效性评估 / erratum-corrigendum）——已沿用 D-025 既定「双读数」中文措辞并注明对应英文术语，不构成改向。
- **信息缺口（调研自报）**：ISO 9001 原文付费（二手交叉印证）；GWTC 未见单独 erratum（目录版本升级路径差异，已记）。

## 完成定义对照

| 判据 | 结果 | 证据 |
|---|---|---|
| A-002 回退链接入 v2 detector（YAML头→内联Nygard→git首提交） | ✅ | collectors.ts §2b collectAdrStructureV2：字段腿 dash → 内联（裸行/加粗）→ inline-iso(head-60) → git（first_commit_date 注入）；节腿 ## → 行首裸标签（全角冒号/Considered Options 归一） |
| v1 留档不动 + 阈值 0.60/0.50 不动 | ✅ | 守卫 C2：v1 实跑冻结集仍复现 0.2462；C3：23-first-report.mjs / 23-measurements.json / 22-prereg 零改动 |
| 重测次数与判定规则先 commit 后重跑 | ✅ | 27-prereg.md commit pov（分支 27-criteria-v2-fallback-chain）先于重跑产物 |
| 冻结数据重跑 + 双读数发布（原读数不撤） | ✅ | 27-dual-readings.json/.md：v1=0.2462 RED 并列 v2=0.5846 RED + 真值 0.4923 参照；逐格 65 行 delta |
| golden set 验证 | ✅ | 一致率 **65/65 ALL-AGREE**（v2 读数 == 预注册期望逐格相等） |
| 引擎编译/打包/测活 + 每平台 test 闭环 | ✅ | `npm test` → SMOKE-OK 6/6 + COLLECTORS-TEST-OK 13/13；`npm run package` → macro-audit-0.1.0.tgz 打包通过；`cli selftest` liveness ok=true；新增 engine/test/collectors.test.mjs 挂入 smoke 脚本（CI 3OS×Node20/22 矩阵执行，push 后生效） |
| 守卫 PASS exit 0 | ✅ | `node 27-check.mjs` → GUARD RESULT: PASS (15 pass, 0 fail) |

## 关键发现

1. **v2 冻结集读数 = 预注册期望，零偏差**：mean 0.5846（v1 0.2462 / 真值 0.4923）；Status/Date 缺失率归零（腿命中 dash 16 / inline 11 / inline-iso 5 / git 6）；三节真实缺失 9/13 原样保留——RED 方向成立、字段归因纠正。
2. **decision_date 全 13 份 = 2026-09-12**：0012/0013 经 dash 腿（git 首提交为 09-13，腿序致 dash 胜）——证明腿序设计可区分「文档记录日期」与「入库日期」。
3. **设计决策**：first_commit_date 走输入注入而非采集器内调 git——保持 collectors 纯函数性（21-check N4/N5 禁 process/fs 断言不受影响）。

## 阻塞

- 无。#29 前置（#26+#27+#28）中 #26/#27 已毕；#28 并行进行中（互不引用为完成条件）。

## lessons 候选

- Node 模板字面量内嵌含 `$'` 的 TS 正则代码会被 String.replace 替换串展开机制破坏——文件拼接用 split/join 或函数式 replacer，勿用 `.replace(marker, str)` 携含 `$` 的代码块。
- Windows 下 `await import(absPath)` 必须 pathToFileURL；engine/test 作用于 dist 产物可保 CI 全平台一致性。

## 引用文件

- 产物：reports/27-prereg.md / 27-rerun.mjs / 27-dual-readings.json / 27-dual-readings.md / 27-check.mjs / 27-report.md；engine/src/collect/collectors.ts §2b；engine/test/collectors.test.mjs；engine/package.json（smoke 挂接）
- 证据源：26-truth-table.json（golden set）、23-measurements.json（原读数）、02-adr-fallback.mjs（链语义原型）

## 版本控制处置

- 分支 `27-criteria-v2-fallback-chain`：commit pov（预注册先入库）+ 本提交（v2 实现+重跑产物+守卫+报告）。未 push。
