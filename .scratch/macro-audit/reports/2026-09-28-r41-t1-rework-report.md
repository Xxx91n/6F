# R41-T1 返工闭环报告（修复窗——回应审计 F-1~F-7）

日期：2026-09-28 ｜ 分支：`r40-t1-exec`（续栈）｜ 返工 commit：lpx(F-2)→qzw(F-1)→ylo(F-4/5/6/7)→yny(生成物)
对照审计件：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-28-r41-t1-audit-report.md`

## 裁定/处置总表

| Finding | 处置 | 落点 |
|---|---|---|
| F-2（必修·实质） | 已修净 | lpx |
| F-1（必修·呈报裁定） | 认账登记（审计建议①——登记＋披露，豁免项未采：登记成本可逆、披露义务可履行） | qzw |
| F-7（建议修） | 已修净（39/46 按 37-C1 WARN 退化型补齐） | ylo |
| F-3/F-4/F-5/F-6（轻） | F-4/F-5/F-6 已修净；F-3 后续 commit 全量无 subject D-锚（本批四件零锚遵守） | ylo |
| 附注观察项 | 记本报告 §四，不阻塞 | — |

## 一、F-2 修净明细

- `blankStrings` 引号串分支：`out += src.slice(i, j + 1)`（内容原样透传）→ `q + ' '.repeat(len) + q`（内容抹空格、保引号边界/全长/行号）——`'…stripComments(x)…'` 字符串内调用形态不再命中 callForm。
- `callForm` 放宽：`[^\w$.]` → `[^\w$]`——成员调用 `x.stripComments(` 计调用位（D-158① 原文「调用位」无「裸」字，审计 Spec-轴 WRONG 项对齐；声明位 `{stripComments:…}` 无左括号仍不中）。
- 75a S2 fixture 扩七因子：`fxStrCall`（字符串内调用形态载荷必中——审计指出 fxStringNom 无 `(` 钉不住此洞，现补上）＋`fxMemberCall`（成员调用位豁免）。
- 措辞校准三处：check-kit docstring／CONTEXT 消费位词条／ADR-0024 执行注记（裸→调用位＋F-2 补记段）。

## 二、F-1 认账登记明细

- `.git-blame-ignore-revs` 新立（仓根）：登 `64f0ae74a202736a1d366ee1911f7f99756898c6`＋`6d62d16afbee8dd710d760d5df1dad6319b747c2`，注释明示「ignore 粒度=整 commit，语义行归因同被跳过」代价。
- exec 报告 `2026-09-28-r40-t1-exec-report.md` §四 补 `4.5 F-1 披露补记`：重缩进事实＋63-inventory 生成物随行同族灰区一并呈报。
- 工具面纪律留痕：JSON 写入一律钉 `JSON.stringify(x,null,2)` 口径（写本批起）。

## 三、F-4/F-5/F-6/F-7 修净明细

- **F-4**：env-contract.mjs 全注释还原可读 UTF-8（`\uXXXX` 转义实害清零）。
- **F-5**：`siblingExists` 零消费死导出摘除；75a T 组改用 `guardDeclaredTier`/`guardDeclaredSurface` 共用件（内联重复正则消除）；75a 中行 `import { writeFileSync }` 归顶。
- **F-6**：guard-all-run `skipped` 判定加 `r.status === 0`——打印 SKIP 后崩溃者归 red 集（crash 赢过 skip），red/skip 双集互斥。
- **F-7**：39-check B 组 commit 锚不可达→WARN 退化不计数＋本地腿（facts/receipt/subject_ref）照断言；46-check B1（文件重现）/B2（删除提交不可达）/B3（变更面不符）/C4（存档 head 不可达）→WARN 退化不计数——同 37-C1 型，原断言 verbatim 入非漂移分支（census 键零迁移）。

## 四、验证证据（全部亲跑）

| 验证 | 命令 | 结果 |
| --- | --- | --- |
| 变异探测套件 | `node --input-type=module` 14 例回灌 realConsumption | ALL 14 PASS（string-with-callform/dquoted-callform=false 修净；member-call=true；tpl-interp-call=true；其余位全对） |
| 75a 主检 | `node 75a-check.mjs` | GUARD RESULT: PASS 14/14 findings=389（S2 七因子 hit/comment/stringNom/strCall=true、import/call/member=false） |
| 70 库存对账 | 含于全量跑 | GREEN（无 E1 漂移） |
| 39/46 复跑 | `node 39-check.mjs`、`node 46-check.mjs` | 28/28、30/30（本环境 sibling 在位无 WARN 触发） |
| SKIP 路径 | `GUARD_SIBLING_ROOT=D:/nonexistent-path-xyz node 37/46-check.mjs` | SKIP-with-reason exit 0（F-6 改后语义不变） |
| 33-check | `node 33-check.mjs` | PASS 31/31（68 项/47 事件、ALARM 1 存量） |
| xfail | `node xfail-run.mjs` | PASS entries=0/10 |
| 全量升格跑 | `node guard-all-run.mjs` | ran=60 green=59 skipped=0 red=1(kr-01) allOk=true → PASS |
| engine 验收 | `npm run build` + `check-dist` + `selftest` | BUNDLE-OK / 263151B cap 内 / ok:true 5/5（返工未触 engine，复跑零回归） |

## 五、返工中途自产缺陷与处置

- 46-check 漂移披露首版用 `t(name, true)` 字面真断言三件 → 75a toothless 普查自动捕获（findings 391）；同批 B1 谓词改形致 existence-assert 册项悬空。处置：else 分支保留原断言 verbatim（活谓词非字面真），census 键零迁移，findings 复 389。**75a 普查对自身返工批次有效自捕**——机制工作正常。
- 39-check PASS 行计数 28↔29 为 grep 口径差（含摘要行），断言数不变。

## 六、遗留观察（审计附注级，本窗不动）

- `envProbe` 整件级 skip 粒度：46 A/D 组（本仓面）随 jiahao 缺席全跳——粒度拆分须守卫内组级探测，立项走 T3 窗。
- `unstrippedScanHit` 探针面盲区：`readFileSync(\`${x}.mjs\`)` 模板路径类不进 readsSource——保守方向（多报非漏报）。
- 成员调用豁免放宽后理论残口：`obj.stripComments` 为名之无关方法可误豁免——发生率低且方向=漏报侧，记观察。
- 63-inventory 生成物随行语义 commit 灰区：已随 F-1 披露呈报，操作纪律=生成物单提。

## 七、分支状态

`r40-t1-exec` 累计十 commit（skt/tml/yms/rus/kny/wtr 实施批＋lpx/qzw/ylo/yny 返工批）；工作树残余非本批改动（48-*/56-heldout/codebuddy-r38）原样未动；push/merge 未授权未执行。
