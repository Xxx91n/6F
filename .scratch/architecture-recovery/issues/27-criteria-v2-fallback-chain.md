# 27: 判据 v2 追加 — adr-structure detector 接线 A-002 回退链

**A-xxx covered:** A-032
**Spec ref:** [spec.md](spec.md) §R4-D2

**What to build:**
adr-structure detector 新增 v2 解析路径：YAML 头 → 内联 Nygard（Status:/Date: 行内字段）→ git 首提交回退；v1 代码与 v1 阈值 0.60 留档禁改。对冻结首报数据重跑出并列读数 + 逐份 delta 表勘误披露。验收 = 与 #26 人工真值表一致率；重测次数与判定规则事先写死（禁 testing into compliance）。

**Blocked by:**
#26（人工真值表 = golden set）

**Status:** ready-for-agent

- [ ] v2 回退链接线且 v1 留档禁改（两版本并存可复跑）
- [ ] 冻结首报数据重跑 → 并列读数（原 RED 不撤回不覆盖）+ 逐份 delta 表
- [ ] 重测次数与判定规则预注册先于重跑入库
- [ ] 验收 = v2 读数与 #26 真值表一致率达标；构建/测试走 CI（本机仅守卫脚本）
