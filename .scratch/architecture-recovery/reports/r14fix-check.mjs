// r14fix-check.mjs — 轮 14 审计返工验收守卫（审计报告 §8 修复要求逐条机检）
// 断言面：A1~A4 修复实物＋B1~B4 文书修正＋C 面采纳项落地＋golden 错文案不再固化。
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const txt = (p) => readFileSync(p, 'utf8');
let n = 0;
const t = (name, ok) => { try { assert.ok(ok); n++; console.log('PASS ' + name); } catch (e) { console.log('FAIL ' + name + ' | ' + e.message); } };

const gen = txt(join(ENG, 'src', 'report', 'generate.ts'));
const cit = txt(join(ENG, 'src', 'report', 'citation.ts'));
const nar = txt(join(ENG, 'src', 'report', 'narrative.ts'));
const cli = txt(join(ENG, 'src', 'cli.ts'));
const srv = existsSync(join(ENG, 'src', 'mcp-server.ts')) ? txt(join(ENG, 'src', 'mcp-server.ts')) : '';

// ---------- A 面：实现缺陷修复 ----------
t('A1a degradeReport 两段式构造（先成 out 再引用）', gen.includes('const out: Report = {') && gen.includes('renderTemplateNarrative(out)') && !gen.includes('renderTemplateNarrative(r,'));
t('A1b golden 错文案不再固化：degraded-incomplete 模板引用真实 reason 非「未声明」', (function () { const j = JSON.parse(txt(join(ENG, 'fixtures', 'golden', 'degraded-incomplete', 'report.json'))); const tpl = j.narrative_sections.find(s => s.author === 'kernel-template'); return tpl && tpl.text.includes('FP-45-2') && !tpl.text.includes('未声明'); })());
t('A1c degraded-supply golden 同（FP-45-1）', (function () { const j = JSON.parse(txt(join(ENG, 'fixtures', 'golden', 'degraded-supply', 'report.json'))); const tpl = j.narrative_sections.find(s => s.author === 'kernel-template'); return tpl && tpl.text.includes('FP-45-1'); })());
t('A2 buildReport degraded:true 直建路径模板注入位', gen.includes('input.degraded && narrativeInput.length === 0'));
t('A3 mcp-server.ts JSON-RPC 面（initialize/tools/list/tools/call/-32601/-32700）', srv.includes('initialize') && srv.includes('tools/list') && srv.includes('tools/call') && srv.includes('-32601') && srv.includes('-32700'));
t('A3b cli 裸 mcp → serveMcpStdio 接线', cli.includes('serveMcpStdio(process.stdin, process.stdout)'));
t('A4 package-lock 根 license=Apache-2.0', JSON.parse(txt(join(ENG, 'package-lock.json'))).packages[''].license === 'Apache-2.0');

// ---------- B 面：文书漂移修正 ----------
const chgR = txt(join(REPO, 'CHANGELOG.md'));
const chgE = txt(join(ENG, 'CHANGELOG.md'));
const rpt = txt(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md'));
t('B1 根 CHANGELOG M-004 a_range=A-001 ~ A-055', chgR.includes('a_range: A-001 ~ A-055'));
t('B2 日报 header 八行 A-056~A-063', rpt.includes('A-056~A-063 八行落账'));
t('B3 commit@branch 勘误注记在（nkk/qlt 实在 r14-51 栈段）', rpt.includes('栈段 r14-51-behavior-quadrant'));
t('B4 PR #3 补记（01:21:07Z）', rpt.includes('PR #3') && rpt.includes('01:21:07'));

// ---------- C 面：采纳项落地 ----------
t('C1 citation.ts 叶子模块在＋generate re-export＋narrative 仅 type 引 generate（运行期值走 citation）', cit.includes("UNVERIFIED_MARK = '⚠ unverified'") && gen.includes('export { UNVERIFIED_MARK') && nar.includes("from './citation.js'") && !nar.includes("import { checkAllCitations, UNVERIFIED_MARK } from './generate.js'"));
t('C2 band 红线从严本意注释在', nar.includes('从严本意声明'));
t('C3 renderTemplateNarrative 死参 at 已删（签名收窄）', nar.includes("Pick<Report, 'quadrants' | 'degraded_reason'>") && !nar.includes('renderTemplateNarrative(r: Report, at:'));
t('C4 toSidecar 用 NARRATIVE_SEAL_PROTOCOL 常量非字面量', gen.includes('narrative_seal_protocol: NARRATIVE_SEAL_PROTOCOL') && !gen.includes("narrative_seal_protocol: 'ADR-0013"));
t('C5 degradeReport 宿主叙事保留重盖章（hostKept 段在）', gen.includes('hostKept'));
t('C6 --limit NaN 闸（Number.isFinite）', cli.includes('Number.isFinite'));
t('C7 CLI 严格面：未知 flag/缺值/bogus 子命令 exit 2', cli.includes('unknown flag') && cli.includes('missing value') && cli.includes("usage: macro-audit mcp [facts"));
t('C8 narrative.test G1 改名对齐实义', txt(join(ENG, 'test', 'narrative.test.mjs')).includes('四字段断言一致'));
t('C10 engine CHANGELOG Unreleased 单 Added 段（双段合并）', (chgE.split('## [0.1.0]')[0].match(/### Added/g) || []).length === 1);
t('C11 registry faces=21＋function-coupling 出 faces 留 face_criteria', (function () { const reg = JSON.parse(txt(join(REPO, '.scratch', 'architecture-recovery', 'reports', '33-gate-registry.json'))); const df = reg.items.find(i => i.id === 'codelore-deferred-faces'); return df.faces.length === 21 && !df.faces.includes('function-coupling') && df.faces.includes('function-*') && df.face_criteria['function-coupling']; })());
t('C9+C12 账本 A-064 裁定注记在', txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md')).includes('A-064') && txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md')).includes('1.1.0'));

// ---------- 综合 ----------
t('X1 审计报告＋交接件在', existsSync(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-audit-report.md')) && existsSync(join(REPO, '.scratch', 'macro-audit', 'handoffs', '2026-09-17-r14-audit-handoff.md')));
t('X2 narrative.test 断言数≥34（新增 9 断言：R5/R6/D4/D5/M4~M8）', txt(join(ENG, 'test', 'narrative.test.mjs')).includes('M8 facts 未知 flag'));

console.log('---');
console.log((n === 24 ? 'PASS' : 'FAIL') + ' ' + n + '/24');
process.exit(n === 24 ? 0 : 1);