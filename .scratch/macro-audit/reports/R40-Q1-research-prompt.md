# R40-Q1 调研题面（atomcode）

承接轮40 收口（批2-β 探测面硬化已落地 enforcing：75a 10/10、register 348→389、ADR-0024＋CONTEXT 双词条、编年 M-025；commit 9f07a68/d46094c @ r40-b2beta-hardening）。本轮=第四轮外部锐评（D:\Aworker\6F\.code-tmp\锐评.md）摄入分诊＋射程裁定。HEAD=25d53cdb。

## 锐评分诊现况（已逐条对照 HEAD 核实）

- C1 「温室巨舰」：.scratch 守卫面硬编码 D:/Aworker——37-check.mjs:9 ROOTS={env-manager,anysearch-cli,jiahao} 硬编码；15 个 .mjs 含 D:/ 字面；9 个 check 引 sibling 仓名（37/38/39/40/42/46/48/49/51，与锐评「Linux 沙箱 9 红」精确吻合）；sibling 本机存在故绿；账本无任何「守卫面运行环境假设」裁定=真空；分发面实证=.claude-plugin/marketplace.json→source:./engine，.scratch 不入插件但入公开仓（Apache-2.0，外人 clone 后跑 guard-all-run 会见红）；fc00d458 幽灵 commit 依赖实在 26-check.mjs:12（git show SHA:path，fresh clone 无 bundle objects→红；锐评误挂 23-check，文件级张冠李戴已勘误）。
- C2 「守卫递归官僚主义」：59-60 check 脚本、389 册、~1183 t() 断言、75a guard-of-guards、70-check 盘点联动、known-red-manifest——数字属实但全机制皆已裁定（D-094 三分类/D-149 基线升格/D-148 处置封闭态）。性质=路线级成本质疑（断言裁军/阶段守卫退役/价值分级）非 bug。
- C3 「提交信息发票化」：d46094c/9f07a68 等长行政信息属实；系 D-018 编年纪律+账行增量↔编年核对+防丢规则直接产物（提交信息双受众=人 vs agent/审计机）。裁面=提交信息规范变更与否。
- S3 「发公共 registry 真实用户压测」：部分已裁定（D-051 上架路径+marketplace 已公开+Apache-2.0）；残余=preview 期 capability 4/5 下开放外部真实使用 vs 成熟度节奏战略题。
- 另：R40 遗留 F-A1（unstrippedScanHit 字符串提名残余豁免——审计呈报唯一实质项待裁）；T3 哨兵复审义务已激活（next-audit-window 锚 occurred：三件 manual_watch 复审到期＋技术债八件重审——簿记执行面）；T2 BACKLOG #75 票面批2 建制临窗可裁。

## 问题

两面：(1) 摄入分诊表有无异议（C1/C2/C3→裁定链、ghost 并入 C1 族、S3 残余→裁定链）；(2) 本轮射程=(a) 纯锐评四面 / (b) 锐评+F-A1 / (c) 全并（锐评+F-A1+T3+T2）。我倾向 (b)。

对真裁面本身的工业界解法请一并给参考（不代替用户拍板）：C1=环境依赖守卫的处置模型（env-gated test/skip 语义、contract-test 边界、mock fixture 降级 vs 环境变量寻址 vs 全面拔除）；C2=守卫/断言套件经济学（测试维护成本倒挂、阶段性守卫退役机制、元测试递归先例）；C3=commit message 双受众规范（conventional commits、machine-readable trailer、审计账本型提交风格先例）；S3=preview→真实用户暴露节奏（OSS 发布成熟度、dogfooding→external 转窗判据）；射程=决策批次编排先例。

## 调研要求

1. 回顾 D:\Aworker\6F\.scratch\macro-audit\decision-ledger.md 全部 current 记录（156 条全过：重点核 C1~S3 四面是否已有 current 决策被我漏查——尤其 D-015 单仓裁定、D-012/051 分发面、D-149 守卫基线、D-016 闭环节奏有无隐含环境/成本约束）；
2. 回顾 docs/adr/（24 件）与 CONTEXT.md（~90 词条）查漏；
3. 工业界成熟心智模型（重点）：环境依赖测试治理、测试套件成本经济学、commit 规范、OSS 发布节奏、外部评审摄入先例；
4. 显式列冲突点：若调研结论与任一 current D-xxx 冲突，指明 D-ID+冲突内容（勿静默改向）。

## 期望输出

分诊表裁否意见＋射程推荐（a/b/c）＋四裁面工业解法参考＋冲突点清单＋置信度自评。
