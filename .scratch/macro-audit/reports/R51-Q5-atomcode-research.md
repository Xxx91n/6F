# R51-Q5 调研报告 —— 指针守卫件设计（扫描面枚举＋存量判级机制＋孪生检测实现）

> 存档说明：atomcode 配额仍在耗尽窗（~20:50 复位）——**配额耗尽=D-186 唯一不续跑例外**，按规程转白名单工具（web_search×4）编排层合成，**degraded_performance 合法降级形态**（本轮构成比 5/5=100%）。题面存档见 reports/R51-Q5-research-prompt.md。

**Sufficiency Gate**：searches: 4（web_search×4：PHPStan baseline 机制、ESLint/Psalm suppression 域、golangci-lint diff 模式、betterer/ratchet 惯例）| angles: Official（PHPStan 官方 baseline 文档全文、golangci-lint 官方 FAQ/配置文档）＋Community（phpstan#9032/#4502 issue 实测）＋Criticism（diff-linting 失配实录 golangci#4152/#4159/#4180）｜full reads: 4（PHPStan baseline 官方全文、PHPStan command-line/ignoring-errors、golangci-lint FAQ、phpstan#9032）｜gaps: 见 §6。

## 1) 执行摘要（Tl;dr）

**推荐：采纳 (i) baseline 文件制＋(vi) 封闭枚举文书类扫描面——判级机制=首跑生成/锁定 `known-pointer-violations` 清单（指纹=file+内容模式非行号），命中=WARN、不在册新违规=FAIL、失配条目自报告移除提示（ratchet 递减）；扫描面=封闭枚举文书类清单（扩面走立法票）。驳回 (ii) 时点判定、(iii) 纯增量检、(iv) WARN-only。** 置信度：**高**——PHPStan baseline 官方机制与十五条票型先例逐条对应（生成锁定/指纹匹配/失配自报告/周再生惯例）；diff-based 的脆性有 golangci-lint 官方 FAQ＋三 issue 实录。

## 2) 分点结论

**C1. baseline 文件制是 linter 生态成熟一等公民——PHPStan 直接先例逐条对上本仓需求。** PHPStan 官方 baseline【V1】【V2】：`--generate-baseline` 把当前全部违规导出为 `phpstan-baseline.neon` 清单（条目=message 正则+path+count 三要素，**不含行号**——指纹设计天然抗行漂移）；baseline 内条目静默跳过、新违规报错=「be interested in violations only in new and changed code」官方定位；`reportUnmatchedIgnoredErrors` 默认开=**已修复条目自动报告移除提示**（ratchet 递减自清理）；issue#9032 实测 15k 条目基线周再生惯例证明可扩展性【V3】。→ 本仓「存量违规 WARN/新增 FAIL」两级判级的工业标准承载=baseline 清单制：命中清单=存量 WARN、不在册=新增 FAIL、勘误落地后条目失配自报告（守卫主动提示移除）——D-191③ 的普查职责由首跑 `--generate` 天然承接。

**C2. 时点判定制 (ii) 与纯增量检 (iii) 的失败面有实录。** golangci-lint `--new-from-rev/--new-from-merge-base` 是 diff-based 官方先例【V4】，但官方 FAQ 自承「issue 不在变更行上则被跳过」+issue#4152/#4159/#4180 revgrep 失配三连实录（git 版本兼容问题致整检失败）——diff 面判定的脆性是结构性问题（行匹配启发式）。本仓还有加剧因子：GitButler 密集 amend/rebase 流下 git blame 锚不稳（W8 病灶本身就是 amend 产物），且违规行的「落盘时点」在 amend 后全部重写成 amend commit 时点——**时点判定方向性错误=存量违规被误判为新增**（amend 重写 blame 后一切看起来都是新落的），比「漏判」更危险（直接 FAIL 卡死存量老账行）。→ (ii)(iii) 双双驳回。

**C3. WARN-only (iv) 无牙齿论证成立。** 全部违规先 WARN=新规生效日守卫形设（新增违规仅告警不阻断——告警疲劳机制 Codacy/Pylint 实录【R51-Q2 报告 S10-S12】）；「观察一轮再升 FAIL」的升级触发器不具体= workaround-hardening 文献明判的「later」型假到期（R51-Q1 已援引）。→ 驳回；生效首跑即两级判级。

**C4. 扫描面：封闭枚举文书类 (vi) 采纳。** 枚举清单（立法钉死扩面走票）：`.scratch/macro-audit/`（decision-ledger.md＋handoffs/＋reports/）＋`.scratch/architecture-recovery/`（decision-ledger.md＋reports/*.md＋WORKFLOW.md）＋`docs/adr/*.md`＋`CONTEXT.md`＋`AGENTS.md`＋根 `WORKFLOW.md`（architecture-recovery 节）。全仓 md（v）误报面=示例文档/调研报告引用区会命中（调研报告本身含 SHA 讨论——**须列豁免子面**：reports/*atomcode-research*.md 与 *research-prompt*.md 豁免或降为 WARN-only，否则本轮报告自体违规）；窄面（vii）漏 ADR/CONTEXT 实证引用位。

**C5. 孪生检测判级确认。** D-190④ 已定「锚线满足＋同 change-id 多 SHA=WARN 非 FAIL」——孪生发现是风险披露非违规（SHA+锚线已消歧，指针本身合法）；实现=对严格层提取的 SHA `cat-file -p` 解析 `change-id` 头（GitButler trailer），按 change-id 分桶，桶>1 即 WARN 列出成员。无冲突。

**C6. baseline 条目治理护栏（防大赦名单化——题面特别裁决①）。** PHPStan 生态教训：baseline 可无节制膨胀（issue#9032 的 15k 条目场景即失控边缘案例）。对策缝在本仓既有建制：①baseline 条目须逐条关联 D-181 勘误行号（无勘误引用的 baseline 条目=非法，守卫自身断言）；②存量勘误落地→条目失配→守卫报告移除提示→清单只减不增（ratchet）；③新增违规 FAIL 不进清单（清单只收存量，新增加条目=审计窗裁例需勘误依据）。

## 3) 冲突扫描（对本仓 current 决策）

| 决策 | 冲突？ | 裁定 |
|---|---|---|
| D-188~D-191 指针纪律四裁 | 否——被消费 | 判级机制=D-191③ 两级判级的实现形态；位形枚举=D-189③ 封闭枚举的机检承载 |
| D-149/D-160 守卫建制 | 否 | 守卫按 D-149 入列（预声明+实测绿+登记）；baseline 文件作为守卫伴随物同规程管理 |
| D-177 预声明 | 否——须衔接 | check 源码=源改，落地前须 D-177 预声明包（fixture 钉死：合法指针形/短码违规/孪生告警/baseline 命中四态期望） |
| D-148③ 不溯既往 | 否——实现承接 | baseline 清单=不溯既往的机检化（比时点判定更稳——不依赖 blame 存活） |
| D-095 枚举封闭 | 否 | 扫描面+位形枚举双封闭，扩面扩列走立法票 |
| D-184 退役闸先例 | 否——同构 | D-184 过渡闸=「探测件+AR 注册+退役触发器」三件套；本守卫不同：常驻件非过渡闸，但孪生告警面预留退役触发器（change-id 唯一性官方承诺出现时） |
| D-165/D-170/D-074 | 否 | 守卫属验收层工具；git 访问全只读（cat-file/log/merge-base） |

## 4) 推荐＋理由＋置信度

**推荐：(i) baseline 文件制＋(vi) 封闭枚举扫描面，含护栏四条：**
1. **判级机制**：`known-pointer-violations.json`（manifest 条目=file+内容模式指纹+关联勘误行号——**禁行号定位**，PHPStan 式 pattern+path 指纹抗漂移）；命中=WARN、不在册新违规=FAIL、失配条目守卫自报告「可移除」提示；
2. **扫描面封闭枚举**（立法钉清单）：`.scratch/macro-audit/`＋`.scratch/architecture-recovery/`＋`docs/adr/`＋`CONTEXT.md`＋`AGENTS.md`；**豁免子面**：调研报告/题面文件（*atomcode-research*/＋*research-prompt*.md）降为 WARN-only 或豁免（自体引用不可规避）；
3. **孪生检测**：严格层 SHA→change-id 头分桶→桶>1=WARN（含成员列表）；
4. **入列路径**：D-177 预声明先行（fixture 钉四态期望：合法/违规新/baseline 命中/孪生）→check 落盘→实测绿→D-149 登记入列。

**理由**：PHPStan baseline=直接先例（生成/指纹/失配自报/再生惯例四件全对上）；diff-based 脆性实录＋amend 流下 blame 方向性错误论证；(iv) 无牙齿机制先例。置信度：**高**。

## 5) 完整来源清单

| # | 标题 | URL | 角度 | 贡献 |
|---|---|---|---|---|
| V1 | PHPStan The Baseline 官方文档 | phpstan.org/user-guide/baseline | Official（已读原文） | baseline 机制全文：generate/条目格式（message regex+path+count）/unmatched 自报告/「only new and changed code」官方定位 |
| V2 | PHPStan Command Line Usage＋Ignoring Errors | phpstan.org/user-guide/command-line-usage | Official | --generate-baseline 退出码语义（0=生成且非空/1=无错）、--allow-empty-baseline |
| V3 | phpstan issue#9032＋#4502 | github.com/phpstan/phpstan/issues/9032 与 /4502 | Community/Criticism | 15k 条目大基线实测（周再生惯例）；unmatched ignored errors 的移除痛点与 `--only-remove` 诉求——baseline 治理的实操面 |
| V4 | golangci-lint FAQ＋issues.new-* 配置 | golangci-lint.run/docs/welcome/faq/ | Official（已读原文） | `--new-from-merge-base/--new-from-rev` 官方先例＋自承「issue 不在变更行则被跳过」＋`--whole-files` 放宽项 |
| V5 | golangci#4152/#4159/#4180 revgrep 失配 | github.com/golangci/golangci-lint/issues/4152 | Criticism | diff-based 判定的结构性脆性实录（git 版本兼容致整检失败） |
| V6 | （引用回收）R51-Q2 报告 lint 误报域 | reports/R51-Q2-atomcode-research.md | 前轮调研 | 误报→告警失效机制（Codacy/Pylint 实证）——WARN-only 无牙齿论证支撑 |

## 6) 信息缺口（如实标位）

1. **atomcode 配额耗尽窗未复位**——本报告=编排层合成（D-186 降级形态）。
2. **betterer ratchet 原文档**未抓取（推荐语引用其语义惯例——如有疑可补抓 betterer.dev 官方档）。
3. **ESLint suppressions/bulk suppression 机制**（v9 bulk-suppression 特性）未抓一手——同型先例补强非必要条件。
4. **GitButler amend 流下 git blame 重锚行为**未做本仓实测——方向性错误论证基于 amend 语义推断（amend=新 commit→blame 全锚到新 SHA），执行批落地时可实测验证。
5. **账本原文对表**：编排层已核 D-188~D-191/D-149/D-148③/D-095 原文，其余以题面转述为据。
