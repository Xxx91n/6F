# R64 收口交接——审计窗已出报告，**下窗＝R63 返工窗（NOT 审计窗）**

> 本件为审计窗收口交接。上一份常驻任务书 `.scratch/macro-audit/handoffs/next-round.md` 仍是 R64 任务书；**本件在其之上声明窗口序已变**：R64 的 T1（审计窗）已完成且**未通过**，下窗不是 grill，是**打回返工**。
> 审计报告（本窗唯一产出）：`.scratch/macro-audit/reports/2026-10-05-r64-audit-report.md`（绝对路径 `D:\Aworker\6F\.scratch\macro-audit\reports\2026-10-05-r64-audit-report.md`）。

## 一句话状态

R63 执行批**语义面扎实、硬验收全绿、报告读数零虚报**，但 **#88 的 CI 射程修复是 born-red**——84-check 在 CI 自己的浅克隆形态下 `newFail=72` exit 1。**审计结论：不通过，打回原修复窗口返工。**

## 下窗第一件事（返工要求，勿跳过）

修 P0-1，两条路，**推荐都做**：
1. `engine-ci.yml:25` 加 `fetch-depth: 0`（止血）——本仓 `golden-ci.yml:41` 与 `macro-b-regression.yml:86` 已两处先例，注释明写「对象位于历史深处」正是加它的理由。
2. 把 `84-check.mjs:413` 的 `const SHA1 = 'cb625c64…'` 改为与 `SHA_OK/SHA_TWIN` 同法的运行时物化（治本）——否则 `TIER = 'portable'` 与 PROTECTED_SURFACE 里那句「portable tier fresh-clone 可跑重申」在 CI 形态下是**伪声明**。

顺带把 `.scratch/**` 加进 `engine-ci.yml` 的触发 `paths`（现仅 `engine/**`，守卫自身变更永不入射程）。

**重跑清单**（报告 §⑤ P0-1 段有全文版）：build → check-dist → selftest → guard-all（65/65）→ **`git clone --depth 1` 后 84-check 必须 34/34 PASS** → 同克隆 78-check 42/42 对照。

## 本窗已核销的 R64 T1 义务

- ✅ 硬验收六项亲自重跑（编译/打包/测活/测试/全守卫/鲜克隆复读）——全绿，报告自述读数逐条复现无虚报
- ✅ 15 项完成定义逐条机核 → 对照表（唯一 ❌ 是 #9，其余 ✅，一处 ⚠️）
- ✅ 41a H 组**独立 mutation-kill 4/4 击杀**（同父 ###、全局 ##、跨父边界、围栏跳过）——H1/H2 是真断言，非 immortal test
- ✅ 双轴评审（Standards＋Spec 子代理并行）＋本人逐条复核，未采信转述
- ✅ 棘轮算术机核：`(1−373105/385000)×100 = 3.09%` < 25% → #90 强制开立属实

## 待用户裁定（审计窗无权处置）

1. **返工还是授权直修**——P0-1/P1-1/P2-1/P2-2/P3-1 全部附了修复要求，等你选「打回原窗口」或「批准后修」。谁修都一样：**修完必须重跑上面那套验收**。
2. **P3-2 版本递增**是否追补——`10252bc0`（Macro-C 产线化）同样没 bump，可能是既有缺口而非本批新增。含是否要 `git tag`。
3. **git index 异常态**（见下）是否要我方处置。
4. T3 用户主权面原三件仍挂账：`.atomcode` 两件归属／origin 三分支删否／`51-E2`。

## ⚠️ 交接必读：git index 处于「删除待提交」态

`but status -fv` 只显示 `.atomcode` 两件未提交；但 `git status` 有 10 项，其中：

```
D  engine/dist/audit/micro-a.d.ts      ← 已暂存删除
D  engine/dist/audit/micro-a.js        ← 已暂存删除
?? engine/dist/audit/micro-a.d.ts      ← worktree 里文件其实在
?? engine/dist/audit/micro-a.js
```

我已逐字节核实：两文件**在 HEAD 中存在**、**worktree 字节与 HEAD 完全一致**、只是不在 index stage 0。内容无损，HEAD 无恙，全守卫仍绿——是 GitButler 的正常中间态。

**但：任何 Agent 若跑裸 `git commit`（不用 `but`），会把这 2 件 dist 产物提交成删除态。** 本审计窗按职责分离**未动它**。返工窗动 dist 前请先确认这个态。

## 建议 skills

- **diagnosing-bugs** — 返工分诊主用。P0-1 根因已定位到行（`84-check.mjs:413-414`），不需要重新诊断，需要的是**修法裁定＋浅克隆形态复验**。
- **gitbutler** — VC 唯一写面。动 dist 前先解上面那个 index 态；`but commit` 后必 `but show <id>` 核实收清单（R63 已栽过第六例：漏传文件 ID 触发全量兜底卷入 `.atomcode`）。
- **handoff** — 返工窗收口时再生交接，**换代钉清单盘点步先行**（D-187①）＋保护区节整节保搬（D-187②）。
- **atomcode-research** — P0-1 若要查 GitHub `actions/checkout` 浅克隆默认深度的官方口径再取证（新裁定题才派遣，串行配额纪律 D-186）。

## 下一轮 grill 方向指示

本窗未开新裁定题（执行窗零裁定的镜像：审计窗同样零裁定）。**下个 grill 窗的题从这两处来，都不是本窗能定的：**

1. **「验收形态选取」是否需要立法成通则**——本窗最深的教训不是 P0 本身，是「读数选得对、验得窄」：R63 两次验收读数（本机 34/34、全克隆 34/34）**都是真的**，但都不是 CI 形态。建议 grill 裁一问：*探测面验收是否必须包含「消费该守卫的那个真实环境形态」*（此处即 shallow clone）。这是 R63 报告 ③ lesson 的自然延伸，且**该报告自己已把 lesson 提炼出来了、却没回检自身**——立法价值高于再记一条 lesson。
2. **`--depth` / 对象可达性是否该进 D-163 探测面分类**——现有 `git-object:` env-contract 类目似可容纳「历史可达性」这一子面，但 R63 的自足修只做了「fixture 自足」没做「历史自足」。是否拆成两个子面，请 grill 裁。

**另附一条待裁的记账问题**（P1-1）：fresh-clone 复读同时挂「欠账」与「已闭环」——欠账三要素（D-170③）是否需要一条**互斥性断言**，防止已闭项滞留在欠账表？这是流程机制问题，不是本票实现问题。
