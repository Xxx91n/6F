# 22: B 层判据预声明文档

**A-xxx covered:** A-023, A-024, A-025, A-029
**Spec ref:** [spec.md](spec.md) §R3-D4

**What to build:**
预声明文档：三级 kill criterion 措辞 + 2 正对照（绑定 21 的 detector 族）+ 3 真判据（阈值跑前实测测定并写死）+ 1 负对照（选材 + 复核路径）+ 引用策略（ICH E10 + ISO 13528 权威锚）；另落 C 层裁定依据预入库文件。

**Blocked by:**
#20, #21

**Status:** ready-for-agent

- [ ] 3 条真判据阈值由 6F 实测测定（记录测定方法与原始数据），跑后禁调
- [ ] 正对照与真判据 detector 同族（对照 21 的映射表核对）
- [ ] 负对照选材 + 预期 0 命中声明 + 命中复核路径齐备
- [ ] 引用可回查（ICH E10 + ISO 13528 逐条列出处）
- [ ] 闸门：文档须用户审阅后 commit；commit 时机先于首报（HARKing 禁令）
