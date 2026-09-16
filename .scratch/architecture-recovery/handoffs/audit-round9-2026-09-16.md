# 交接 — 轮9 审计（2026-09-16 r9 栈）

> 写给下一个窗口的接续卡。审计产物 = `D:\Aworker\6F\.scratch\architecture-recovery\reports\round9-0916-audit.md`（声明→证据→结论对照表 + 发现清单 + 重跑清单），勿复制内容，引用即可。

## 审计终判
**实质成立 + 打回小修建议（守卫级 3 + 文书级 6，不动功能代码）**。14 commits 11 窗口硬验收亲跑全绿（npm test 8 套件 187 断言、package 54f、selftest 5/5、14/15 守卫 PASS 同声明数）；上轮 W1~W7 返修逐项闭合验证通过；D-035②/D-033/D-034/D-013/D-037~041 覆盖核对无方向性跑偏；未 push。

## 必修（呈报不追认）
1. **32-t0-verify 当前红** 98/99——33-ext 票档前缀与守卫 slug 映射相撞（startsWith('33-') 抓到 33-ext prompt）；编排收口未复跑 T0 门。
2. **40-check D13 openWriter 读回**——自述只读实写（DDL+种子+写锁），zz 的 duckdb.wal 即其产物；应改 openReader。
3. **43-check C 段 unbundle+worktree**——向本仓 .git 写 objects+refs/frozen/first-report（现仍存在），违自述零写；需善后或改措辞。
4. 38-check D3 门控开分支恒真空洞；upstream-lock adapter 悬空路径（store/→fact/store.ts）；37 jiahao 存档 head↔count 不自洽+C1 严格等值必再漂；文书失同步 6 处（报告 7vs11、README L394/L431、issues/41、BACKLOG #35-40 ✅、next-round 区间/枚举、README.md 54→56）。

## 处置选项
- **打回修复窗**：照审计报告 §6 清单修，修后重跑同一套验收（npm test+package+selftest+15 守卫+gen+ajv+32-t0 ALL-PASS+refs/frozen 无残留+zz 净）。
- **豁免放行**：全部核心声明已亲验成立，失同步/守卫卫生项转下窗口顺带修。

## 仓库状态
- 栈：r9-* 13 分支 + audit-round8 + 本审计产物待提交（新分支 audit-round9）。
- zz：2 件残留（136MB clone-cache + 624B wal——wal 由 40-check openWriter 每次运行再生，属守卫副作用非脏改）。
- 值守：33-check ALARM 3（mw-trigger-a/b 已触发未拍、desk-task15 待 Micro-A）+WARN 12 为设计信号。

## 下一个 grill 方向建议
**W14 = 收口窗口包**：① #41b 上架面（用户闸门，等拍板）② mw-trigger-a/b 裁决（触发已发生，判据读数=单写者序列化维持——收口窗口拍）③ desk-task15 复审（Micro-A preview 前置锚）④ 残余 4 面裁决（codelore-residual-faces，stage3-close 锚）⑤ jiahao 回归 CI 首实跑核验（需 MACRO_AUDIT_6F_TOKEN secret 配置+ref 钉 SHA）⑥ Micro-A preview 候选 = {env-manager,jiahao}（D-033 capacity 重排结论待收口确认）。

## 建议技能
[$code-review] 双轴（Standards+Spec）、[$handoff]、[$but]（GitButler 唯一 VCS 面，禁 git 写命令）、[$atomcode-research]（深调研通道，本窗口 #42 已恢复可用）。

## 环境注记
- 本机 rg 不可用（exit 127），检索以 node/ctx_execute 兜底。
- 守卫非纯读：40-check 写 wal、43-check 写 refs/frozen——审计复跑会留痕，已知来源。
- atomcode carrier 各窗口报告口径不一（#42 称恢复可用，其余称不可用）——接续窗口用时先实测。
