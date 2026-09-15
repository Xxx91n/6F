# 26: 阶段 1.5 量测审计（14 份 ADR 人工真值表 + 逐份 delta 表模板）

**A-xxx covered:** A-031
**Spec ref:** [spec.md](spec.md) §R4-D1

**What to build:**
对首报冻结时点的 docs/adr/ 全集（14 份）逐份人工读数：五件套字段（Status/Date/Deciders/Context/Decision 或对应结构要素）逐项标注「存在/缺失/内联 Nygard 变体」，形成人工真值表；并产出逐份 delta 表模板（detector 漏认 vs 真实缺失分列）。产物 = R4-02 验收 golden set + 原 TC-2 RED 记 invalid 的逐份可归属原因。

**Blocked by:**
None（前置 R3-05 首报已毕；本票先于一切 v2 代码）

**Status:** ready-for-agent

- [ ] 14 份 ADR 逐份读数表落盘（每份五字段读数 + Nygard 格式识别标记）
- [ ] 逐份 delta 表模板落盘（detector 漏认 vs 真实缺失分列，量化量测误差）
- [ ] 逐份可归属原因登记（供原 RED invalid 判定与 R4-02 golden set 复用）
- [ ] 纯文档零构建：不改 engine/、不改 docs/adr/ 任何文件
