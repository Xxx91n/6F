# ADR-0013: 首报验收 = 三层闸门 + 预声明判据（Three-Layer Acceptance Gates）

- Status: accepted
- Date: 2026-09-12
- Deciders: 用户（grill 轮 3 Q2/Q3，经 atomcode R3-Q2/R3-Q3 深调研呈报后拍板）
- Ledger: D-017、D-018（current）

## Context

阶段 1 产物「第一份真报告」需要通过/证伪口径。调研证伪了「A+C 跳过 B」（no-finding 假信心 / eval gaming 无 golden set / Goodhart 定律三线汇聚）；B 层判据构造进一步需要防「已知异常自证预言」与「全空信号歧义」（ICH E10 assay sensitivity / ISO 13528 / OWASP Benchmark / mutation testing / NIST KAT 五线汇聚）。

## Decision

验收 = A→B→C 三层串行闸门：A 形式达标（共享骨架 + 可回查引文 + Receipt 存在，smoke 层）；B 内容非平凡 = RAT 预声明 kill criterion，构造为 2 正对照（与真判据共享 detector 路径、不计入价值判定、未中=管线故障 P0）+ 3 真判据（预注册可操作定义+显式阈值+命中方向+未中语义，阈值跑前写死跑后禁调；真判据全空且正对照 2/2 命中 =「前提未被支持」合法实验数据）+ 1 负对照（特异性守卫，命中走复核路径不自动定罪）；C 信任裁决四条款（裁定三档且依据看报告前入库防 HARKing / 对抗性清单或链路外读者 / 锚定 B 产物 / 裁定原文+时间戳回写账本）。kill criterion 三级措辞：前置管线健康闸 / 主前提证伪闸 / 反向红条。

## Consequences

- D-006 引文校验升级为「引文→结论支持关系」校验（撑不住结论标 unsupported）；
- D-001 verdict-gate 以 C 层信任裁决为外部校准锚；
- D-011 下 C 层判据须覆盖 agent 可消费性（引文可解析、裁决可编程引用）；
- 「未命中=合法数据」仅适用于真判据；正对照未中=实验无效；
- 执行序锁定：先写 B 判据预声明文档 → 用户审阅 → commit 入库 → 再跑 6F。