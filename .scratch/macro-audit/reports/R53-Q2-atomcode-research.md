# R53-Q2 调研报告 —— 严格层列头枚举欠列（E-11）处置形态（扩列 vs 内容驱动反向闸 vs 复合）

> 题面：`R53-Q2-research-prompt.md`｜派遣：atomcode `-p` 已派（内部续跑锚定轮询约 20min）→ `[rate-limited] 5h window exhausted, resets ~16:50` → 按 D-186 配额耗尽唯一不续跑例外，**编排层合成**。
> **组成字段（D-186）**：`degraded_performance`——atomcode 派遣在途但配额耗尽未产出；正文=编排层 web_search 直查合成（k8s KEP-2885/GA 博客、protobuf 官方文档、checkpatch 源码+LKML 补丁、ESLint 行为、JSON Schema 兼容文献）。轮 53 构成比暂记 **2/2**。

## 1) 执行摘要（Tl;dr）

**推荐 (iii) 复合＝(i) 立法票扩列收编实证同义词＋(ii) 内容驱动反向闸兜长尾（Confidence：高）**。证据链五路收敛：①k8s `fieldValidation=Strict`（KEP-2885 GA v1.27）=闭世界校验工业正典——未知字段 Strict 拒收/Warn 放行，**校验存在恰因「unknown fields hide errors (misspelled field name)」**；②protobuf JSON 解析**默认拒未知字段**、`ignore_unknown_fields` 为显式 opt-in——严格为默认态非例外；③checkpatch `$signature_tags` 白名单＋泛型 `[a-z0-9_-]+by:` 形态正则双轨——**非白名单但形态可疑的 trailer 触发 `Non-standard signature:` WARNING 而非静默放过**（Assisted-by 案=盲区自报→立法收编的工作先例）；④ESLint 未知规则=`Definition for rule was not found` 硬 ERROR（防 typo 的闭世界校验）；⑤secret scanner（gitleaks/truffleHog）按 **token 形态/熵＋keyword 预筛**检测非按字段名——内容驱动探测的成熟先例。

## 2) 分点结论

### ① 闭世界校验是工业正典，非激进做法【来源：kubernetes.io KEP-2885 + GA 博客原文 + protobuf.dev 官方文档】

- k8s fieldValidation 三模制：`Strict`（未知/重复字段=error）、`Warn`（校验但警告放行）、`Ignore`（不校验）；kubectl 用户写面默认 Strict，controller 默认 Warn——**人机交互面严格、存量机器面宽容**的双层判级正典。
- KEP-2885 设计动机逐字：「Server should validate that no extra fields are present or invalid (e.g. misspelled)」——**校验理由=未知字段藏匿拼写错误**，与本题「非白名单列头藏匿指针负载」同型。
- protobuf 官方 JSON 规则：解析器「should reject unknown fields by default but may provide an option to ignore」；issue #1389 设计理由逐字「**Ignoring unknown fields may hide real errors (like a mistyped field name)**」。
- JSON Schema：`additionalProperties:false`=闭内容模型显式语义＋「Ban Unknown Properties」校验模式存在；默认 true=开世界——**闭合须显式声明，但声明后完全合法**。本题 D-189⑧ 封闭枚举=已显式声明闭世界，缺口在执行不在声明。

### ② checkpatch 双轨制=本题的逐字同构先例【来源：torvalds/linux scripts/checkpatch.pl 源码 + LKML Assisted-by 补丁实录】

- 机制：`$signature_tags` 白名单枚举（Signed-off-by:/Co-developed-by:/…）＋泛型形态正则 `[a-z0-9_-]+by:`——**非白名单但形态匹配者触发 `Non-standard signature:` WARNING**，非静默豁免。
- **Assisted-by: 案逐字重放本题病灶**：docs 新增 `Assisted-by:` trailer 规范但 checkpatch 白名单未收编→每个合法 tag 触发 WARNING＋ERROR（无法同时满足文档与工具）→修法=「白名单收编＋机制泛化」（新增 `$no_email_signature_tags` 分类留扩展口）。**枚举欠列→形态告警自报→立法收编**=完整闭环先例。
- 对本题映射：STRICT_HEADERS=白名单；「单元格载 commit 对象形态 token 而列头不在白名单」=Non-standard signature WARNING 同构；扩列立法票=Assisted-by 收编同构。

### ③ 内容驱动探测是成熟探测形态【来源：gitleaks 源码文档 + truffleHog 文档】

- gitleaks：keyword 预筛（Aho-Corasick trie）→regex 形态匹配→entropy 阈值→allowlist 豁免——**检出单位是 token 形态非字段名**；「secret 出现在任何字段名下都被检出」正是闭世界探测语义。
- truffleHog generic scanner：`keywords=[pass,token,cred,secret,key]`＋`keyPat` 形态正则——语境提示词＋载荷形态双层检出。
- 映射：本题反向闸=「hex token≥7 且 cat-file -t=commit」（载荷形态）＋「表格单元格位」（语境）双层，天然区分 commit 指针与文件 shasum（后者非 commit 对象不触发）。

### ④ 「未知即告警」vs「未知即豁免」默认态分野【来源：ESLint 行为实录 + 前述各源】

- ESLint：未知规则=ERROR 非静默（#12656 讨论串确认行为即「typo protection」）；TypeScript strict/webpack strict 同族。
- 反面：JSON Schema 默认 `additionalProperties:true`、protobuf wire 格式容忍未知字段（向前兼容设计）——**开世界是「可演化性」优先时的合法默认**。
- 分界判据浮出：机器消费契约面（API/schema/CI 配置）→闭世界默认；数据交换面（wire format）→开世界默认。**文书面指针位=机器消费治理契约面→闭世界判据适用**。

### ⑤ 冲突扫描（对照账本 current）

| 决策 | 关系 | 说明 |
|---|---|---|
| D-189⑧ 封闭枚举 | **零冲突** | 反向闸不改枚举封闭语义（白名单仍 canonical）；扩列仍走 D-095 立法票——枚举权威不动，新增的是「偏离枚举自报」探测方向 |
| D-095 立法票 | 同向 | (i) 扩列经立法票＋反向闸 WARN 面成为扩列候选的天然清单源 |
| D-192 baseline 机制 | 同向 | 反向闸存量命中走册内 WARN／新增 FAIL 两级判级复用既有机制 |
| D-181 勘误通道 | 同向 | E-11 登记的两处实证文书走勘误不回写 |
| D-148③ 生效时点 | 同向 | 反向闸自落地 commit 起生效，存量自然分级 |
| D-177 预声明验证包 | 适用 | 84-check 扩断言面须走 D-177 预声明先行 |
| D-190 锚线/D-188 法定形 | 同向 | 反向闸判「位置未入枚举」不替代法定形校验，两层并存 |

**零冲突**。(iii) 全部落地路径在现行决策框架内。

## 3) 对比矩阵

| 项 | (i) 扩列制 | (ii) 反向闸 | (iii) 复合 | (iv) 维持 |
|---|---|---|---|---|
| 当前盲区闭合 | ✓ 两件实证收编 | ✓ 自报现形 | ✓ | ✗ |
| 长尾盲区防护 | ✗ 打地鼠 | ✓ 形态探测兜住 | ✓ | ✗ |
| 立法通道保留 | ✓ | ✓ | ✓ | — |
| 误报面 | 零 | 低（commit 对象判别天然区分 shasum） | 低 | — |
| 实现成本 | 近零（两行字符串） | 中（新增扫描向） | 中 | 零 |
| 工业先例 | Assisted-by 收编同构 | checkpatch 泛型告警＋k8s Strict＋ESLint unknown-rule ERROR | 双轨同构 | 无先例支撑 |

## 4) 推荐＋理由＋置信度

**推荐 (iii)（Confidence：高 ~0.85）**。

1. **双轨是业界收敛形态非自创**：checkpatch 三十年实证「白名单 canonical＋泛型形态告警」双轨是枚举制机检的标准答案——单独扩列（i）= Assisted-by 案的欠收编状态重演；单独反向闸（ii）=丢掉 canonical 命名的文书纪律收益。
2. **误报面可控有先例**：commit 对象经 `cat-file -t` 实证判别，把「文件 shasum/随机 hex」与「commit 指针」物性区分——比 secret scanner 的 entropy 近似判别更硬。
3. **判级沿用既有机制**：存量命中→baseline WARN（E-11 两实证件入册）；新增→FAIL；反向闸告警面同时成为 D-095 扩列票的天然清单源——枚举维护从「被动欠列」转「主动候选流」。
4. **加细节**：反向闸对新文档判 FAIL 的措辞建议=「指针负载置于非 canonical 列头」——违法本质=违反文书列头纪律非仅枚举欠列；canonical 列头词表写进 WORKFLOW 指针条款。

**最强反驳自查**：「反向闸扫全表单元格性能成本高」——84-check 已对扫描面 5 目录全表格行做 STRICT_HEADERS 匹配，反向闸=同一遍历多加一次列头判定＋cat-file 缓存已建制（gcache Map）——成本增量微小。自查不成立。

## 5) 信息缺口

- atomcode 深调研配额耗尽未产出（~16:50 复位），本报告=编排层直查合成，多源交叉强度低于深调研形态，已按 D-186 如实登记。
- 「闭世界判头」对**叙事文散文中表格**的边界情形（如示例性表格装示例指针）未取到工业处置先例——建议实现期对 example/fixture 目录维持 SKIP_DIR 豁免机制应对。
- checkpatch `Non-standard signature` 触发率/误报率无公开统计，WARN/FAIL 判级选择属本仓自定无外部锚。
