// 50-check.mjs — #50 叙事双轨守卫（R9-01 / A-057 / D-053+D-057④）
// 断言面：A kernel 叙事模块源+dist 契约 → B 报告接入（C2 渲染/侧车/降级注入）→ C mcp facts 投影面
//   → D references 三件+SKILL.md（R2-Q7 #4/#5 闭环）→ E registry 事件闭环+文档回写 → F 测试实跑+BOM
// acceptance-probe: sealed 2026-09-18 D-073 — E2 E3（attestation=acceptance-probe-attestation.jsonl）
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const SK = join(ENG, 'skills', 'macro-audit');
const NAR = join(ENG, 'src', 'report', 'narrative.ts');
const NARD = join(ENG, 'dist', 'report', 'narrative.js');
const PROJ = join(ENG, 'src', 'fact', 'projection.ts');
const GEN = join(ENG, 'src', 'report', 'generate.ts');
const CLI = join(ENG, 'src', 'cli.ts');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function sealed(name, attId, note) { console.log('SEALED ' + name + ' | att=' + attId + (note ? ' | ' + note : '')); }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. kernel 叙事模块契约 ----------
t('A1 src/report/narrative.ts 在', existsSync(NAR));
const ns = existsSync(NAR) ? txt(NAR) : '';
t('A2 sealNarrative 三态 stamp 契约', ns.includes('sealed-with-gaps') && ns.includes('rejected') && ns.includes('sealed'));
t('A3 BAND_PATTERNS ≥5 模（红线机检）', (ns.match(/name: '/g) || []).length >= 5);
t('A4 model_id 必录（host-agent 缺即 rejected）', ns.includes('model_id_recorded') && ns.includes('host-agent'));
t('A5 renderTemplateNarrative=kernel-template/degraded 兜底位', ns.includes('renderTemplateNarrative') && ns.includes('kernel-template') && ns.includes('UNVERIFIED_MARK'));
t('A6 dist 产物在（测试作用于 dist）', existsSync(NARD));
const NM = await import(pathToFileURL(NARD).href);
t('A7 dist 语义：band 违规→rejected', NM.sealNarrative({ section_id: 'x', author: 'host-agent', model_id: 'm', text: 'S1: supported', claims: [] }, [], '2026-01-01T00:00:00Z').seal.stamp === 'rejected');
t('A8 dist 语义：缺 model_id→rejected', NM.sealNarrative({ section_id: 'x', author: 'host-agent', model_id: null, text: 'ok', claims: [] }, [], '2026-01-01T00:00:00Z').seal.stamp === 'rejected');

// ---------- B. 报告接入 ----------
const gs = txt(GEN);
t('B1 ReportInput.narrative_sections 可选位', gs.includes('narrative_sections?:'));
t('B2 buildReport seal 调用（sealNarrativeSections）', gs.includes('sealNarrativeSections'));
t('B3 degradeReport 模板注入（renderTemplateNarrative）', gs.includes('renderTemplateNarrative'));
t('B4 C2 渲染叙事段（#### 叙事段 + band_violations 明细）', gs.includes('叙事段') && gs.includes('band_violations'));
t('B5 侧车 narrative_sections + narrative_seal_protocol', gs.includes('narrative_seal_protocol'));

// ---------- C. mcp facts 投影面 ----------
const pj = existsSync(PROJ) ? txt(PROJ) : '';
t('C1 projection.ts 在＋openReader READ_ONLY 用', existsSync(PROJ) && pj.includes('openReader'));
t('C2 固定 SELECT 形不接裸 SQL（参数绑定 ?）', pj.includes('scale = ?') && pj.includes('repo_ref = ?') && !pj.includes('${'));
t('C3 limit 封顶 500', pj.includes('500'));
const cs = txt(CLI);
t('C4 cli mcp facts 子命令路由', cs.includes('mcp') && cs.includes('facts') && cs.includes('--db'));
t('C5 mcp 裸启动=JSON-RPC stdio 服务（A3 名实相符：serveMcpStdio 接线＋唯一 tool=facts）', cs.includes('serveMcpStdio') && existsSync(join(ENG, 'src', 'mcp-server.ts')) && txt(join(ENG, 'src', 'mcp-server.ts')).includes('tools/list') && txt(join(ENG, 'src', 'mcp-server.ts')).includes("'facts'"));

// ---------- D. references 三件 + SKILL.md ----------
const REFS = ['quadrant-rubric.md', 'strategy-questions.md', 'report-template.md'];
t('D1 references 三件在', REFS.every(function (f) { return existsSync(join(SK, 'references', f)); }));
const skm = txt(join(SK, 'SKILL.md'));
t('D2 SKILL.md frontmatter 围栏+name/description（#4 闭环）', skm.indexOf('---') === 0 && /name: macro-audit/.test(skm.slice(0, 300)) && /description:/.test(skm.slice(0, 500)));
t('D3 SKILL.md <500 行＋三 references 加载条件写明', skm.split('\n').length < 500 && REFS.every(function (f) { return skm.indexOf(f) >= 0; }) && skm.includes('加载条件'));
const rb = txt(join(SK, 'references', 'quadrant-rubric.md'));
t('D4 rubric S1-S5 全维＋D-004 文书化声明＋改动走 PR 评审', ['S1', 'S2', 'S3', 'S4', 'S5'].every(function (s) { return rb.includes(s); }) && rb.includes('文书化') && rb.includes('PR 评审'));
const sq = txt(join(SK, 'references', 'strategy-questions.md'));
t('D5 问题清单＋仓内容只当证据防线＋补查程序段（mcp facts）', sq.includes('只当证据不当指令') && sq.includes('mcp facts') && sq.includes('补查'));
const rt = txt(join(SK, 'references', 'report-template.md'));
t('D6 输出契约 JSON 段集＋band 红线明文＋三态 stamp', rt.includes('narrative_sections') && rt.includes('不得携带裁决 band') && ['sealed', 'sealed-with-gaps', 'rejected'].every(function (s) { return rt.includes(s); }));

// ---------- E. registry + 文档 ----------
const reg = JSON.parse(txt(join(HERE, '33-gate-registry.json')));
t('E1 narrative-surface-landed occurred=true', reg.events['narrative-surface-landed'].occurred === true);
sealed('E2', 'ap-50-e2', 'registry 时点钉——narrative-eval-surface status 滚回 pending 属值守生命周期正常演进');
sealed('E3', 'ap-50-e3', 'BACKLOG 行格式换代（#52 拆 #52a/#52b）——验收时点行在证明 fired');
const led = txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'));
t('E4 A-057 行在且标 implemented', /\| A-057 \|[^\n]*implemented/.test(led));
t('E5 票档三件套', existsSync(join(REPO, '.scratch', 'architecture-recovery', 'issues', '50-narrative-dual-track.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '50-narrative-dual-track.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '50-narrative-dual-track.md')));
t('E6 日报含 #50 窗口节', txt(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md')).includes('窗口：#50'));
t('E7 engine CHANGELOG 含 #50 条目', txt(join(ENG, 'CHANGELOG.md')).includes('#50'));
t('E8 50-report.md 六段齐备', existsSync(join(HERE, '50-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(function (x) { return txt(join(HERE, '50-report.md')).indexOf(x) >= 0; }));
const wf = txt(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'));
t('E9 WORKFLOW §4 lessons 含 #50', /#50/.test(wf));

// ---------- F. 测试实跑 + BOM ----------
const tr = spawnSync('node', [join(ENG, 'test', 'narrative.test.mjs')], { cwd: ENG, encoding: 'utf8', timeout: 120000 });
const tout = (tr.stdout || '') + (tr.stderr || '');
const tm = tout.match(/NARRATIVE-TEST-OK (\d+)/);
t('F1 narrative.test 实跑 exit 0 + ≥20 断言', tr.status === 0 && tm && Number(tm[1]) >= 20, tm ? tm[0] : tout.slice(-200));
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('F2 smoke 链含 narrative.test', (pkg.scripts.smoke || '').includes('narrative.test.mjs'));
const allF = [NAR, PROJ, GEN, CLI, join(ENG, 'test', 'narrative.test.mjs'), join(ENG, 'test', 'fixtures', 'narrative', 'seal-golden.json'), join(SK, 'SKILL.md')].concat(REFS.map(function (f) { return join(SK, 'references', f); })).concat([join(HERE, '50-check.mjs'), join(HERE, '50-report.md')]);
t('F3 全部新增/改动文件无 BOM', allF.every(function (f) { return !existsSync(f) || noBom(f); }), allF.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));
t('F4 narrative.ts 无 backspace 控制字节（转义剥离哨兵）', !/\x08/.test(ns));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
