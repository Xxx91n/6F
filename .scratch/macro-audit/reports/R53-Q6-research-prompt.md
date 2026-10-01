# R53-Q6 atomcode 调研题面：PROTECTED_SURFACE × 指针纪律面交叉声明

## 研究问题

本仓守卫建制中，每件 `*-check.mjs` 在文件头自声明 `PROTECTED_SURFACE`（守护面文字）。registry 哨兵 `protected-surface-death-watch`（D-164-b）逐审计窗普查全部守卫声明非空＋引用物在位，「面消亡判据事件」（D-160①：对象移除／上层吸收／更强更窄契约取代）发生即激活退役发射通道（T3 呈裁，禁静默摘除）。

指针纪律守卫 `84-check.mjs` 的 PROTECTED_SURFACE 声明为：「D-188~D-192 commit 指针纪律严格层机检（法定形断言＋known-pointer-violations 册两级判级＋孪生 change-id 分桶）」。其中 `known-pointer-violations.json` 是守卫的输入工件（baseline 册），D-199 已立法「册的生命目标是归零」（ratchet：只可缩不可增；册项指纹失配→自报摘除）。册归零在物理上成为可达态后，出现两条混同路径：
- 误把「册归零/摘除」当作「守护面消亡」→ 触发退役发射（过杀）；
- 误把「84-check 面真消亡」当作册机制例行清理 → 消亡事件漏警。

候选处置：
- (i) 交叉声明（轻量）：WORKFLOW 指针条款补钉「册归零≠面消亡；面消亡判据仍走 D-160① 全集且须 T3 呈裁通道」＋84-check PROTECTED_SURFACE 声明补「输入工件生命周期独立于面消亡判据」一句；
- (ii) 维持现状：声明已引 D-188~D-192、death-watch 普查在转，交叉声明=冗余文书；
- (iii) 重形态：PROTECTED_SURFACE 改子面分解枚举（严格层机检面／册机制面／孪生检测面各自独立消亡判据）。

请调研并给出推荐与理由：

1. 工业界对「守卫/哨兵的守护对象声明」与「输入工件生命周期」分离的成熟心智模型与落地先例（重点：监控系统 alert rule vs 其 baseline/抑制清单工件；测试套件 vs fixture/baseline 文件；SAST/IaC 工具的 rule vs 豁免清单工件——如 PHPStan baseline、OWASP suppression 文件、gitleaks baseline、tsconfig files/include、CODEOWNERS）。
2. 「工件生命周期终结 ≠ 守护面消亡」判别的成熟先例：baseline 清零后规则是否继续运行、suppression/ignore 清单清空时的处置惯例、waiver/exception expiry 与 control retirement 的分离治理。
3. 本仓决策库回顾义务：D-160①（消亡判据全集）、D-164-b（哨兵锚定钉事件触发）、D-169/D-171（AR 五要件）、D-188~D-192（指针纪律五裁）、D-199（册收敛窗）——评估三候选与这些决策的兼容性，标注任何冲突面。
4. 反方论证义务：若推荐 (i)，须如实列出「冗余文书/过度建制」反对意见及强弱；若推荐 (ii)/(iii)，须如实列出混同路径风险残余面。
