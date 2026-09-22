# R28-Q16 深调研题面：独立对照物在病态输入上的 parity 语义（分歧分类矩阵 vs 双实现 vs 排除）

## 本仓背景

审计面产品：cli.ts 主管线（quarantine 引擎：字段级病态→null+quarantine_log 事件，三桶 clean/normalized/quarantined）＋39/40 遗留脚本=**独立复跑对照物**（D-060 周边：golden parity=audit 侧车字段⊆39 复跑产物，独立实现互核=SoD 精神）。quarantine 落地后 parity 遇新情况：cli 对病态字段产 null+事件，39 独立解析器对同段字节可能产出不同结果。对照物价值在病态输入上最大（独立分歧=最强信号），排除则失明。

## 选项

- **(a) 处置感知 parity 矩阵**：比对按 disposition 分流；cli=quarantined×39 结果判分歧类别（39 也判病态/产出不同值/解析失败=预期分歧记档；39 产出与 cli 本应值相同=可疑 warn）；组合矩阵受控枚举；
- **(b) 39 端独立实现 quarantine 分类器**：双实现互核，最强独立但双倍实现面+双份规则漂移；
- **(c) parity 排除 quarantined 实例**：只比对 clean/normalized——病态输入失明；
- **(d) 39 仅协议级覆盖**：字段级 quarantine 不进 parity。

## 调研任务

工业界成熟心智模型取证：① 双实现/影子管线（shadow/dual-run）惯例——参考实现 vs 生产实现在异常输入上的比对语义（如编译器 differential testing、Csmith/EMI、双解析器互核、fuzzing harness 的 differential oracle）；② differential testing 对「一方报错一方产出」的处置惯例——divergence 分类先例（expected divergence vs suspicious agreement）；③ 解析器安全界的「两家解析器分歧=信号」先例（HTTP request smuggling 的 parser differential、polyglot 文件检测、LangSec 对 parser differential 的论述）；④ golden/parity 测试对「预期不一致」的表达惯例（tolerant comparison、divergence taxonomy）；⑤ 辩证：(a) 的矩阵完备性负担（组合爆炸/未预见组合）、(b) 双份漂移、(c) 失明代价的实证。输出=按角度组织、结论=推荐+理由、冲突核查=对 D-060 周边 parity 契约/D-104/D-106/D-116、来源清单、信息缺口、置信度。
