# R30-Q5 atomcode 深调研报告：文件身份语义——subject_ref 规范化形 + rename 连续性

> 运行：2026-09-23（atomcode -p，session 4f830211）；题面见 R30-Q5-research-prompt.md。
> Sufficiency：searches 11（Exa 6+AnySearch 5，Tavily 超限）｜full reads 5（SCIP 官方规范／git-config 官方档／SonarQube 分析流程档／OpenLineage namespace 官博／git 源码+补丁链）｜angles 4 类｜置信度=高（核心论点 2+ 官方信源交叉）。

## 1) 执行摘要（Tl;dr）

**推荐 B：path 身份+rename 血缘一等事实**，subject_ref 采用 **SCIP 式 canonical form**（仓根相对、正斜杠、NFC、无 `.`/`..`/空段、**不做大小写折叠**）。唯一同时满足字节级可重放幂等与 corrosion boundary 的方案：rename 判定入载荷参数化可复算、漏判=诚实分裂（与 git 官方语义一致）；A 改名即失忆系统性毁掉 hotspot/churn 核心指标；C/D 分别违反幂等 charter 和 corrosion boundary。

## 2) 候选对比矩阵

| 候选 | 身份模型 | rename 语义 | 可重放/幂等 | 主要缺陷 | 工业先例 |
|---|---|---|---|---|---|
| A 纯 path+规范化 | path canonical form | rename=旧死新生，零启发 | ✅ 完全确定 | 改名即失忆：hotspot/churn/ownership 历史全断 | SCIP Document（规范即不追 rename） |
| B path+血缘事实 | path canonical+file_renamed 事实 | 投影层沿血缘缝合；漏判=诚实分裂 | ✅ 检测参数入 fact 载荷可复算 | 检测启发式需固定版本+参数 | OpenLineage symlink/命名 facets；git diff -M 语义 |
| C blob hash 身份 | blob hash 链 | rename+edit 即断 | ✅ | 同内容文件共 hash=identity 碰撞；rename+edit 即断比失忆更糟 | git 内部对象模型（仅对象寻址非身份） |
| D 上游语义继承 | 上游工具原样 path | 随上游漂移 | ❌ 上游换版本=身份漂移 | 违反 corrosion boundary | —— |

## 3) 分点结论

**① subject_ref 规范化形——SCIP 官方规范逐条可抄（置信高）**
SCIP（scip-code.org 规范+scip.proto 源码）Document.relative_path 要求：必须相对 project_root、不得以 / 开头、**必须指向 regular file 而非符号链接**、**含 Windows 一律 / 分隔符**、必须 canonical（无 //、.、..）。Sourcegraph 对 SCIP 索引做 canonicalization 阶段+对 canonicalized Document 取确定性 hash——「canonical form→确定性哈希」正是本仓 fact_id 同构做法。照抄+加一条 **Unicode NFC**（对齐 git core.precomposeunicode macOS 默认 NFC 化），但**不做大小写折叠**（见⑤）。

**② git rename 本质是检测不是记录——B 的血缘=派生事实与 git 官方语义一致（置信高）**
rename 不入 git 对象模型，由 diffcore-rename.c 在 diff 时计算（exact rename 按 blob hash 匹配＋不完全匹配按相似度评分，-M 默认 50% 阈值；exact match 时 basename 加权）。git 官方 mail 归档 Linus 系补丁链直言 --follow「a bunch of weird special case code… Probably the whole thing needs to be thrown out and re-coded」；2.9 修复过同内容文件迭代顺序错配。**B 把检测参数（阈值+算法版本）入载荷使事实可复算=把 git 非确定性边界圈在适配层内的正确姿势**——漏判时诚实分裂与 git 用户心智一致。

**③ SonarQube 反面教训：rename 检测已做进核心流程但失忆/错忆仍是真实持续痛点（置信高）**
官方分析流程档第一步=「SonarQube checks if the file has been renamed」，issue 新旧判定靠 line hash 跨文件匹配；但社区长帖（2022「Moved files should not be new code」／2024「v10.1 treating renamed files as new code」）证 moved 文件仍被反复误判——**「改名失忆」=工业界真实持续被抱怨的痛点**；且证明 rename 处理做在投影/匹配层就够，不必改事实层身份。

**④ OpenLineage 先例：主身份稳定+附属 facet 补救血缘（置信中高）**
OpenLineage 官博：身份=namespace+name 两段键不随物理位置漂移；同一 dataset 两种命名视角（Hive 表名 vs 物理路径）经 SymlinksDatasetFacet 提供替代名修复血缘图——B 的同构心智：**主身份稳定（canonical path），血缘/别名作为附加事实而非身份本体**。

**⑤ 规范化踩坑——大小写与 NFC/NFD 均有真实事故级先例（置信高）**
- **大小写折叠**：git 官方 GHSA-8h77-4q3w-gfgv（2024 Critical RCE）与 CVE-2021-21300 均源于大小写不敏感 FS 上 case 碰撞——git 自身心智=「**保留原字面，提示冲突，而非折叠**」（core.ignorecase 只让 git 适配宿主 FS 从不改存储字面）。**结论：canonical form 不做 lower()，Windows 宿主下以「检测 case-only 冲突并告警」应对**——折叠会把 Foo.java/foo.java 两真实不同文件合并成分裂脑镜像；
- **NFC/NFD**：git 补丁 71fa8d2（2024）记录 macOS NFD 工作区致 git ls-files 直接 fatal——连 git 自己都在 precompose 上翻车。**采集层统一 NFC 须适配层显式做，不能依赖 git config**（repo-local config 甚至可能不被读取）；
- **符号链接**：SCIP 规范直接禁 relative_path 指向 symlink——采集时解析到 regular file 仓根相对路径或明确跳过。

**⑥ A vs B 裁决：失忆痛点有证据，纯 A 不可取**
证据链：Sonar 社区重复投诉＋SO 高频长帖（git log --follow 失效模式、merge 双腿走错腿的算法性缺陷）证明开发者强烈依赖跨 rename 历史；churn/hotspot 工具不缝血缘则核心指标在重构频繁仓上系统性归零重建——**hotspot/churn/ownership 生命周期长度恰与血缘连续性成正比**。B 成本（检测参数入载荷+投影缝合逻辑）远小于 A 在核心指标上的语义损失。

## 4) 信息缺口

- CodeQL/LGTM file identity 专门文档未直接打开（source location prefix 间接证据指向与 SCIP 同口径）；
- GitHub API renamed_file 字段存在但未单独核验文档页；
- **git rename 检测跨版本可复算性需实测**——不同 git 版本对同一 commit 对可能给出不同 rename 判定，落地应固定 git 版本或自实现确定性检测器（入票实测项）；
- SonarQube rename 检测内部实现闭源（仅社区帖+官方流程页可证）。
