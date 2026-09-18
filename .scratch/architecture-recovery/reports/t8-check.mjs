// t8-check.mjs — 轮 14 T8 值守面复核守卫（D-043/D-045/D-055/D-056/D-057② / A-061）
// acceptance-probe: sealed 2026-09-18 D-073 — A3（attestation=acceptance-probe-attestation.jsonl）
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const AR = join(REPO, '.scratch', 'architecture-recovery');
const reg = JSON.parse(readFileSync(join(HERE, '33-gate-registry.json'), 'utf8'));
let pass = 0, fail = 0;
function t(n, ok, d) { if (ok) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (d ? ' :: ' + d : '')); } }
function sealed(name, attId, note) { console.log('SEALED ' + name + ' | att=' + attId + (note ? ' | ' + note : '')); }
function it(id) { return reg.items.find(i => i.id === id); }

// A. 三新触发器挂门完整（D-055/D-056/D-057②）
const hp = it('hooks-presentation-face'), rp = it('repomix-reopen-trigger'), ne = it('narrative-eval-surface');
t('A1 hooks-presentation-face pending+bound presentation-demand-signal', hp && hp.status === 'pending' && hp.trigger_event === 'presentation-demand-signal' && reg.events['presentation-demand-signal'].occurred === false);
t('A2 repomix-reopen-trigger pending+bound repomix-reopen-demand', rp && rp.status === 'pending' && rp.trigger_event === 'repomix-reopen-demand' && reg.events['repomix-reopen-demand'].occurred === false);
sealed('A3', 'ap-t8-a3', 'registry 时点钉——同 50-E2 族（status 滚回 pending 属值守生命周期）');
t('A4 三项本轮确认留痕在', [ne].every(i => i.confirmations && i.confirmations.some(c => /T8/.test(c.by || ''))));

// B. mw 触发器组（D-043）
const mc = it('mw-trigger-c');
t('B1 mw-trigger-a/b decided（D-043）', it('mw-trigger-a').status === 'decided' && it('mw-trigger-b').status === 'decided');
t('B2 mw-trigger-c pending+bound macro-a-start 未发生', mc && mc.status === 'pending' && mc.trigger_event === 'macro-a-start' && reg.events['macro-a-start'].occurred === false);

// C. 暂缓面集同步 #51（D-045 邻接）
const df = it('codelore-deferred-faces');
t('C1 faces[] 移除已激活三面（hotspots/coupling/function-hotspots）', !['hotspots', 'coupling', 'function-hotspots'].some(f => df.faces.includes(f)));
t('C2 function-coupling 暂缓判据在 face_criteria（审计 C11：具名移出 faces[]，由 function-* 通配覆盖去歧义）', !df.faces.includes('function-coupling') && df.faces.includes('function-*') && df.face_criteria && /target/.test(df.face_criteria['function-coupling'] || ''));
t('C3 faces 计数与标题一致（21 面，C11 去重后）', df.faces.length === 21 && df.title.includes('21'));

// D. 复审逾期清零（复核完成）
const mw = reg.items.filter(i => i.watch === 'manual_watch' && i.status !== 'decided');
const overdue = mw.filter(i => [].concat(i.review_event || []).some(e => reg.events[e] && reg.events[e].occurred));
t('D1 manual_watch 复审逾期=0（33-check E 段口径）', overdue.length === 0, overdue.map(i => i.id).join(','));
t('D2 四项确认留痕含本轮 T8 条目', ['codelore-deferred-faces', 'codelore-llm-mcp-face', 'upstream-probes-scorecard-repomix', 'narrative-eval-surface'].every(id => { const i = it(id); return i.confirmations && i.confirmations.some(c => /T8/.test(c.by || '')); }));

// E. 文档
const led = readFileSync(join(AR, 'decision-ledger.md'), 'utf8');
t('E1 A-061 行在且标 implemented', led.includes('| A-061 |') && new RegExp('\\| A-061 \\|[^\\n]*implemented').test(led));
t('E2 t8-watch-review.md 在且含陈旧守卫清单', existsSync(join(HERE, 't8-watch-review.md')) && readFileSync(join(HERE, 't8-watch-review.md'), 'utf8').includes('陈旧守卫清单'));
t('E3 WORKFLOW lessons 含 T8', readFileSync(join(AR, 'WORKFLOW.md'), 'utf8').includes('T8 值守面复核'));
t('E4 日报含 T8', (existsSync(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md')) ? readFileSync(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md'), 'utf8') : '').includes('T8'));

// F. BOM
const allF = [join(HERE, '33-gate-registry.json'), join(HERE, 't8-watch-review.md'), join(HERE, 't8-check.mjs')];
t('F1 全部相关文件无 BOM', allF.every(f => { const b = readFileSync(f); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
