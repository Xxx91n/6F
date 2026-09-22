# 轮 28 审计收口交接（r28-audit-pass-with-findings）— 2026-09-22

> 供下一个会话接手。审计窗只出报告未动手修；本交接=发现处置路由＋下一 grill 方向指示。

## 本轮发生了什么

- 审计对象：轮 28 T1「#77 门面收口包·A 窗」——分支 r28-t1-facade-ack 单提交 3f84d5f（base aafb463=r27 收口 pkz）。
- 审计方法：硬验收亲跑（build/package/selftest/smoke 全绿）＋13 项守卫电池复跑全对上＋声明→证据→结论 12 条对照＋D-098~D-102 系逐条核对＋双轴评审子代理（Standards/Spec）。
- **终裁：PASS-WITH-FINDINGS**——声明无造假、验收链真实；2 项返工级发现＋1 项过程漂移＋2 观察项。
- 审计报告：D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-22-r28-audit-report.md（§3 对照表/§4 D 条核对/§5 发现清单/§6 修法+重跑清单）。
- 评审输入留档：D:\Aworker\6F\.code-tmp\audit-r28\（diff.patch/spec.md/commits.txt，gitignored 本地证据）。

## 待处置（路由）

| 项 | 内容 | 归属 |
|---|---|---|
| F-01 | gen-acknowledgments.mjs template-missing 路 TypeError 裸栈（诊断不可达，exit 仍 1） | 打回修复窗或用户批准后修；修法与验收见审计报告 §6.1 |
| F-02 | 2026-09-22-report.md 撞名覆盖轮26 实施报告（r26-audit-report 引用指向异物） | 同上；修法=改名 r28 后缀+恢复前版+同步指针，§6.2 |
| P-01 | commit 缺 A-NNN（WORKFLOW 明文规则 vs 近三轮惯性漂移） | 用户裁决：but reword 补标 vs 修订规则 |
| 值守 | readme-ci-badge status=pending（badge 实物已挂，33-check ALARM 1 在案，SLA=1 工作日） | T10 值守面翻 status——非阻塞 |
| 待追认 | xfail 摘除 7 条（meta.xpass_removal_2026_09_22_b5/anchors） | 用户人工裁决侧——D-102① 两键分离，执行侧已落 |

## 下一 grill / 执行方向指示

- **若走返工线**：F-01+F-02 小返工后进同套验收重跑（审计报告 §6 清单），然后 T2。
- **下一主任务候选=T2 #78 引擎 quarantine 建制·B 并行独立窗**（D-100/D-101②/D-059① 收窄链）：intake 违约两级化＋三桶分离计数＋可观测五件（逐 SHA+reason code/字节回显/覆盖率恒等式/比例阈值/--strict-quarantine）＋null=毒值全消费面＋新 reason code 登 known-gaps；验收=macro-b-regression git 腿转绿（%cI 病态 commit 走 quarantine 不崩全仓）。票面须带 owner+deadline（腐红防线）。
- 次候选：T3 #75 批1 字面钉普查（45-h5 松钉样本＋44-G6 新钉同族在案）。
- T10 值守顺带：readme-ci-badge 翻 status（SLA 内）、readme-motion-gif 仍待 freeze 不动。

## 审计工具链经验（下窗必读）

- **ctx 沙箱 NODE_OPTIONS 污染**：ctx_batch_execute 的 bash 注入 NODE_OPTIONS=--require cm-fs-preload-*.js，孙子 node 进程 stderr 混入噪音——凡「子进程 stderr 纯 JSON parse」断言会假 FAIL（本轮 audit.test.mjs S3-S5 实证）。对策：smoke/单测在宿主 shell 跑，或 env -u NODE_OPTIONS。
- Windows 下写文件一律 ctx_execute（Node.js fs），禁 node -e 内嵌大段模板串（bash 双层转义会炸）。
- Git Bash /tmp ≠ node.exe 的 /tmp（node 解到 D:\tmp）；给 node 传路径用 Windows 实路径。

## Suggested skills（下窗）

- $implement / $tdd：F-01/F-02 返工与 T2 quarantine 建制主驱动
- $diagnosing-bugs：T2 git/git 病态 commit 复现面（%cI=" INDIA"）
- $code-review：下轮审计同规程双轴评审
- $but：VC 唯一写面；审计产物落 r28-audit 分支
- $handoff：下轮收口同规程再生
