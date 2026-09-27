# r38 T1 关窗交接（CodeBuddy 试用 3/3 hit＋审计 LOOP-1 PASS）

## 下一窗焦点

**批2-β 立项裁定**（推荐主线——T1 已关窗，批2 优先级重排触发器可评估）：

- 题面=75b §3 五项探测面硬化裁定（unstrippedScanHit 注释提名豁免 / multi-hit 扩面 includes·test+漏 macro-audit 面 / SCAN_EXEMPT 不可达项+75a-S1 自指恒真 / 75a 写工件语义 / 41a 手写解析器+guard-all-run slug 正则耦合）
- 可并入：审计 N5/N6（37-check inline spawnSync 残余＋kit gitOut 不检 status 的 false-green 向）＋T1-N1（parity 表述口径）
- 备选面：批3 候选 multi-hit 76 件点级锚试批；票面批2 枚举 open/closed 建制票未动

## 本窗已交付（r38-T1 关窗）

- 试用实测：CLI 形态（@tencent-ai/codebuddy-code 2.151.0）三判据全 hit——C1 四步零文档外干预（doctor --fix 属 pinned README L45 文档内主路）/ C2 parity 展平 70 键零非对称＋facts 960 行 872583B 逐字节等＋measurements 逐字节等 / C3 披露块齐＋agent 话术 preview 如实
- 三悬点全实证：marketplace.json 被读 ✅ 插件级 .mcp.json 自动发现拉起 ✅ ${CLAUDE_PLUGIN_ROOT} Windows 展开 ✅
- findings×4 全 D-146 初分「不进裁定链」（F-01 设计内补偿实证 / F-02 宿主展示盲区 / F-03 环境披露 / F-04 结构化披露）
- 落盘：session 9404B 全格回填＋debrief 4025B＋证据树 `trials/codebuddy-r38/` 9.4MB（baseline/codebuddy-run/self-run 三棵各五件）
- 栈：mor=`bfb4b154` docs＋twx=`5bf43ccf` chore 已入 r38-batch2-a；T1 审计报告 `reports/2026-09-27-r38-t1-audit-report.md` LOOP-1 PASS
- 形态限定留痕：IDE 形态未覆盖——如需复核转 manual_watch 五要素接力（Trigger-gated）

## 下轮接续点

- 试用 findings 回流：四条全判不进裁定链，批2 优先级无需因 T1 重排（D-152③ 触发器实际未产生输入）
- registry 口径刷新顺手项：任务书「61/42」→实态 62/43（r37 批1 后稳态）
- xfail 摘除追认（D-102①）/R28-Q19 复核债仍挂账
- 下轮账行=A-100 起、编年=M-024 起

## suggested skills

- 批2-β 立项：`$atomcode-research`（串行单发，探测面取证）＋`$grill` 裁定链
- 本仓 VC：`$but`；文件写入 ctx_execute（Node fs 回读字节断言、禁 BOM 保尾行）
- 宿主级测试先 `env -u NODE_OPTIONS`（ctx 沙箱 bash 注入污染避雷）
- DB 探查纪律：audits//trials/ 下 duckdb 原件一律副本探查（cp 到 Temp 再 --db），原件 sha256 前后校验

