# R56-Q9 调研题面 —— per-layer preview→GA 毕业判据框架形态

（提交 atomcode-research 深调研；账本=唯一事实源立场，调研须回顾 decision-ledger 全部 current 记录、docs/adr、CONTEXT.md 词条、工业界成熟落地心智模型为重点。）

## 背景

产品=宏观+微观工程内容审计（5 scale），发布=ADR-0017 Preview 分级发布（各层独立 preview→GA 漏斗不打包等齐）。R56 已裁 D-203~D-209。本题为 B6 本体——(b) 收口深化面最后一枝。

判据面实物盘点（产品级判据都在、层级判据全缺）：
- 产品 1.0 退出（docs/versioning.md L9 写死）：报告 schema 冻结＋已接上游适配器全过确定性验收
- Stage-2 公开推广（CONTEXT 暴露梯度词条）：四判据全达标＋30 日静默窗（①capability 5/5 ②fresh clone 不红海 ③GAP-HOST-01 关闭 ④试点 findings 无未分诊残留）
- preview 入口判据：各层票面已有 DoD（D-049 Micro-A 式 a~f 验收序列先例）
- **缺口**：ADR-0017 立了各层独立 preview→GA 漏斗但漏斗出口端从未定义——层如何毕业、什么算 GA 态、与产品 1.0/Stage-2 的层次关系全空位

已裁约束（current）：ADR-0017 各层独立漏斗字面／ADR-0013 预声明判据三层验收闸／ADR-0015 量测效度先行／ADR-0018 0.x 纪律＋schema 独立版本化／D-162 Stage-0/1/2 暴露梯度／D-062 Macro-A DoR／D-204 preview=用户可达交付面（GA 语义在其上构建）。

本仓路径：decision-ledger=D:/Aworker/6F/.scratch/macro-audit/decision-ledger.md；ADR=D:/Aworker/6F/docs/adr/；CONTEXT=D:/Aworker/6F/CONTEXT.md；versioning=D:/Aworker/6F/docs/versioning.md。

## 候选

- **(i) 判据类目先立＋阈值后填**：本裁只立判据类目骨架（候选类目：语料广度=≥N 真实仓跨形态／披露清洁窗=golden 面无 ⚠ 标的持续期／象限完整度=四维全活读数或明示永久豁免／适配器确定性验收／schema 稳定窗）——per-layer 数值阈值挂各层 GA 票（阈值需真实分布数据现填数=无据裁定）；框架层应用 ADR-0013 预声明惯例
- **(ii) Stage-2 判据单层投影**：per-layer GA=Stage-2 四判据的单层投影+层特有件——复用已立法形态；但 Stage-2 判据是产品级（capability 5/5 不可单层化），投影语义部分不通
- **(iii) per-layer GA 概念取消**：矩阵只留 preview/shipped 两态，GA 只存在产品级 1.0——简化但正面撞 ADR-0017 独立漏斗字面（须 ADR 勘误非静默）
- **(iv) 判据面整体挂起**：挂触发器=首个 Stage-1 试点 charter 生效——判据无消费方时是空架子；但预声明纪律反面论据=先立框后填数正是防到时改门槛的立法本意

## 调研要求

1. 先回顾账本 current 与 ADR/CONTEXT（本地路径已给）——特别核 ADR-0017 漏斗语义原文、Stage-2 四判据与本题的层次关系、D-049 式 DoD 先例作为判据形态载体；
2. **工业界心智模型为重点**：分级成熟度毕业判据的成熟形态——K8s alpha→beta→GA 毕业判据集（KEP-5241 PRR 判据：each stage has graduation criteria；alpha→beta=default-off 可启用+beta 默开启；feature gates 表 Since/Until 列先例——**此前轮未直读 KEP-5241 本题必须补**）；Chrome/web feature status（Intent to Ship 判据面）；Semantic Versioning pre-1.0 心智；「判据类目 vs 阈值」分离的先例（SLO framework=SLI 类目固定 SLO 数值场景定；SOC2/ISO 判据=control objective 固定 evidence 逐案）；毕业判据的「未达标形态」（K8s deprecated/stuck-in-beta 先例——feature 永不毕业可合法声明）；
3. 辩证要求：逐候选给支持与反对论据；(i) 的类目清单完备性风险（会不会漏类目——K8s 判据集是否给类目学启示）；(iv) 挂起派与预声明派的正面辩证；任何与账本 current 冲突显式点名 D-xxx/ADR-xxx；
4. 输出：推荐＋理由＋置信度＋信息缺口清单。
