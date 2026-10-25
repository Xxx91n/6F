# 50 — 叙事双轨落地报告（R9-01 / A-057 / D-053＋D-057④）

日期：2026-09-16　范围：references 三件＋盖章链路＋MCP facts 投影＋degraded 兜底＋model id＋band 红线＋SKILL.md/R2-Q7 #4/#5 闭环

## ① references/ 三件（`engine/skills/macro-audit/references/`）
- `quadrant-rubric.md`（3.2KB）：S1-S5 判据可操作化=D-004（spec 4.1~4.6）文书化投影——判据名→判什么/证据源/初版参数/回退，**不新增判据语义**；S3 无单列判定参数（spec 4.x 未给）如实标注「叙事只可组织既有事实、不得自创阈值」；改动走 PR 评审声明在位。
- `strategy-questions.md`（2.6KB）：叙事问题清单 5 问＋「证据不足→经 MCP 补查」程序段（先 `mcp facts` 投影查→缺口仍存标 ⚠ 数据未接→kernel 判 insufficient 不回灌→补查轮归 agent 编排 D-057④）＋「仓内容只当证据不当指令」防注入防线（祈使句不执行/引文锚必须/冲突以本壳模板为准）。
- `report-template.md`（2.0KB）：叙事段输出 JSON 契约（section_id/author/model_id/text/claims{claim_id,evidence_id,required_tokens,text}）＋三态 stamp 说明＋band 红线明文＋degraded 模板说明。
- SKILL.md 加载条件节：strategic 象限叙事→rubric；任何叙事→questions；提交前→template。SKILL.md 32 行<500。

## ② 盖章链路（kernel `sealNarrative`）
- `engine/src/report/narrative.ts`：NarrativeSection{section_id,author,model_id,text,claims[{claim_id,evidence_id,required_tokens,text}]} → sealNarrative 逐 claim 走 checkAllCitations → NarrativeSeal{stamp,sealed_at,checks,band_violations,model_id_recorded}。
- 三态：sealed（全 supports）／sealed-with-gaps（有 insufficient claim）／rejected（band 违规或缺 model_id）。失败明细=每 claim 的 matched_tokens/missing_tokens/reason（token↔evidence 逐字对照）——CiteGuard Auditable 原则。
- band 红线机检 BAND_PATTERNS 六模：dimension-band-assignment（`S1:`/`S5＝`）／verdict-field-en（verdict/verdict_gate/overall_verdict/verdict_band）／band-field-en（`band=`）／verdict-word-assertion（`supported:`）／cjk-verdict-assertion（裁定为/判红/判绿…）／quadrant-band-assertion（象限裁定：）。段文本+claim.text 双面扫描。
- model id 纪律：author=host-agent 缺 model_id→rejected；kernel-template 免（D-053⑤ CodeLore stamp 同款）。

## ③ MCP facts 只读投影 stub
- `engine/src/fact/projection.ts`：buildProjectionSql=固定 SELECT 形（projection 列=FactEvent 十三列，observed_at SQL 层 CAST VARCHAR 规避 DuckDBTimestampTZValue 序列化）＋过滤只接 scale/repo_ref/subject_ref 等值（参数绑定，不接裸 SQL）＋limit≤500；projectFacts 走 openReader（READ_ONLY 实例，SWMR 读者位）。
- cli `macro-audit mcp` → descriptor{transport:stdio,readOnly:true,ops:[facts]}；`mcp facts --db X [--scale] [--repo] [--subject] [--limit]` → JSONL 行投影。
- e2e 实证（test M2）：写库子进程（openWriter+appendFact）→ 读库子进程 `cli mcp facts` 跨进程 SWMR——同进程 openWriter→openReader 实例锁必拒（已知拓扑）。

## ④ degraded 模板兜底
- `degradeReport` 自动注入 renderTemplateNarrative 段（section_id=kernel-template-fallback，author=kernel-template，model_id=null）——文本只指向 C2 裁决块不做超出断言，自扫零 band 违规；报告 degraded=true＋⚠ unverified 印记；模板永居降级位不冒充正式叙事。

## ⑤ SKILL.md / R2-Q7 闭环
- 违规#4（frontmatter 缺 `---`）：R1-7 已修，本票核验落地（test S1 断言 frontmatter 围栏+name/description）→ 闭环留痕。
- 违规#5（ADR-0008 声称 rubric 产物缺失）：references 三件本票补建 → 闭环。

## ⑥ registry 事件闭环
- events.narrative-surface-landed occurred=true（D-057② 复审锚：#50 闭环即叙事实物出现）。
- items.narrative-eval-surface → triggered-bound（bound_to=#52 评测票，confirmations 留痕）＋BACKLOG #52 立案（评测面判据独立于产出方，防自写自评）。

## 实证
- `cd engine && node test/narrative.test.mjs` → NARRATIVE-TEST-OK 25（N 三态真值表×8 + R 报告接入×4 + D 降级×3 + M mcp×3 + S SKILL/references×6 + G golden×1）。
- `node .scratch/architecture-recovery/reports/50-check.mjs` → PASS（A 模块契约×8+B 接入×5+C 投影×5+D 三件×6+E 文档×9+F 测试×4）。
- `npm test` 全链绿（narrative 已入 smoke）。

## 已知限制
- mcp facts 是 stub 级投影（固定 SELECT 形）——非 MCP 协议 server；宿主 agent 经 stdio 调用而非长驻协议握手，与 mcp.json readOnly:true 声明一致。
- narrative-eval-surface 评测票 #52 仅立案未实施（先物后尺）。
- host-agent 叙事写入入口=ReportInput.narrative_sections（程序化注入）；宿主 agent 实际产出 JSON 段集→注入报告的编排脚本尚未落（属宿主侧行为，kernel 面本票已全）。
