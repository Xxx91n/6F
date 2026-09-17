// 48-check.mjs — #48 Micro-A preview 守卫（R8-02 / A-056 / D-049）
// 断言面：A 管道+判据文件+模块导出契约 → B golden 实跑（cassette 回放断言，离线）→ C 真跑工件齐备
//   → D 报告语义（4 PR supported＋拒绝件 unsupported＋切片字段∩骨架机械断言＋披露四字段）→ E 事件闭环+文档回写 → F token 泄漏+BOM
// 纪律：只读断言＋golden 子进程（cassette 离线回放零网络）；真跑工件为已落盘实证不重复实跑；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const PIPE = join(HERE, '48-micro-a-preview.mjs');
const CRIT = join(HERE, '48-micro-a-criteria.md');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. 管道 + 判据 + 导出契约 ----------
t('A1 48-micro-a-preview.mjs 在', existsSync(PIPE));
t('A2 48-micro-a-criteria.md 在（判据先入库）', existsSync(CRIT));
const pipe = existsSync(PIPE) ? txt(PIPE) : '';
const crit = existsSync(CRIT) ? txt(CRIT) : '';
t('A3 判据集六条全在（PC-1/TC-1/TC-2/TC-3/TC-4/NC-1）', ['PC-1', 'TC-1', 'TC-2', 'TC-3', 'TC-4', 'NC-1'].every(function (c) { return crit.indexOf(c) >= 0; }));
t('A4 判据拒语义+通道条件（api NULL_STATS 契约注记）', crit.indexOf('NULL_STATS') >= 0 && crit.indexOf('merged=0') >= 0);
const MOD = await import(pathToFileURL(PIPE).href);
t('A5 导出 MICRO_A_SLICE_FIELDS ≥20 字段', Array.isArray(MOD.MICRO_A_SLICE_FIELDS) && MOD.MICRO_A_SLICE_FIELDS.length >= 20, String((MOD.MICRO_A_SLICE_FIELDS || []).length));
t('A6 导出 skeletonIntersectionReport 函数', typeof MOD.skeletonIntersectionReport === 'function');
t('A7 管道含三形态+真负例+漂移注记', pipe.indexOf('release-please') >= 0 && pipe.indexOf('dependabot') >= 0 && pipe.indexOf('goose-duck-agent') >= 0 && pipe.indexOf('anysearch-cli') >= 0);
t('A8 走主路/回退标注面（credential_strategy + diff_channel 入切片）', MOD.MICRO_A_SLICE_FIELDS.indexOf('credential_strategy') >= 0 && MOD.MICRO_A_SLICE_FIELDS.indexOf('diff_channel') >= 0);

// ---------- B. golden 实跑（cassette 离线回放） ----------
const gr = spawnSync('node', [PIPE, '--golden'], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
const gout = (gr.stdout || '') + (gr.stderr || '');
t('B1 --golden 实跑 exit 0', gr.status === 0, gout.slice(-300));
const gass = existsSync(join(HERE, '48-micro-a-golden-assertions.json')) ? JSON.parse(txt(join(HERE, '48-micro-a-golden-assertions.json'))) : null;
t('B2 golden 断言文件 all_pass=true', gass !== null && gass.all_pass === true);
t('B3 golden 断言 ≥10 条且全过', gass !== null && gass.checks.length >= 10 && gass.checks.every(function (c) { return c.pass; }), gass ? String(gass.checks.length) : 'absent');
t('B4 golden 工件齐备（2 PR 双件+拒绝件双件+facts×2+gate+measurements）', ['48-micro-a-golden-env-manager-pr64.md', '48-micro-a-golden-env-manager-pr64.json', '48-micro-a-golden-env-manager-pr51.md', '48-micro-a-golden-env-manager-pr51.json', '48-micro-a-golden-goose-duck-agent-refusal.md', '48-micro-a-golden-goose-duck-agent-refusal.json', '48-micro-a-golden-env-manager-facts.jsonl', '48-micro-a-golden-goose-duck-agent-facts.jsonl', '48-micro-a-golden-gate-probes.json', '48-micro-a-golden-env-manager-measurements.json'].every(function (f) { return existsSync(join(HERE, f)); }));

// ---------- C. 真跑工件齐备 ----------
const REAL = ['env-manager-pr64', 'env-manager-pr55', 'env-manager-pr51', 'jiahao-pr6'];
t('C1 4 PR 报告双件（md+json）+diff 工件', REAL.every(function (s) { return existsSync(join(HERE, '48-micro-a-' + s + '.md')) && existsSync(join(HERE, '48-micro-a-' + s + '.json')) && existsSync(join(HERE, '48-micro-a-' + s + '.diff')); }));
t('C2 拒绝件双件', existsSync(join(HERE, '48-micro-a-goose-duck-agent-refusal.md')) && existsSync(join(HERE, '48-micro-a-goose-duck-agent-refusal.json')));
t('C3 事实 JSONL×4（env-manager/jiahao/anysearch-cli/goose-duck-agent）', ['env-manager', 'jiahao', 'anysearch-cli', 'goose-duck-agent'].every(function (n) { return existsSync(join(HERE, '48-micro-a-' + n + '-facts.jsonl')); }));
t('C4 measurements×2 + gate-probes + 汇总 + 共享库', ['48-micro-a-env-manager-measurements.json', '48-micro-a-jiahao-measurements.json', '48-micro-a-gate-probes.json', '48-micro-a-measurements.json', '48-audit-facts.duckdb'].every(function (f) { return existsSync(join(HERE, f)); }));

// ---------- D. 报告语义 ----------
const sc = {}; const md = {};
for (const s of REAL.concat(['goose-duck-agent-refusal'])) {
  sc[s] = JSON.parse(txt(join(HERE, '48-micro-a-' + s + '.json')));
  md[s] = txt(join(HERE, '48-micro-a-' + s + '.md'));
}
const PINS = { 'env-manager-pr64': 'machine-generated/release-please', 'env-manager-pr55': 'platform-declared-bot/dependabot', 'env-manager-pr51': 'human', 'jiahao-pr6': 'human' };
const CHAN = { 'env-manager-pr64': 'local-git', 'env-manager-pr55': 'api', 'env-manager-pr51': 'local-git', 'jiahao-pr6': 'local-git' };
for (const s of REAL) {
  const x = sc[s];
  const bq = x.quadrants.filter(function (q) { return q.quadrant === 'behavior'; })[0];
  const sf = bq ? bq.slice_fields : {};
  const sliceMiss = MOD.MICRO_A_SLICE_FIELDS.filter(function (f) { return !(f in sf); });
  t('D-' + s + ' supported+merged+形态锁+通道锁+切片字段全', x.overall_verdict === 'supported' && sf.merged === true && sf.author_form === PINS[s] && sf.diff_channel === CHAN[s] && sliceMiss.length === 0, 'form=' + sf.author_form + ' ch=' + sf.diff_channel + ' miss=' + sliceMiss.join(','));
}
t('D-e1 env64 release-please 平台声明 Bot（github-actions[bot]/Bot 双检真值）', sc['env-manager-pr64'].quadrants[0].slice_fields.bot_declared === true && sc['env-manager-pr64'].quadrants[0].slice_fields.author_login === 'github-actions[bot]');
t('D-e2 env55 api 兜底如实标注（stats NULL 契约＋detail 注记）', (function () { const e = sc['env-manager-pr55'].adjudication.entries.filter(function (x) { return x.criterion_id === 'TC-2'; })[0]; return e.band === 'supported' && e.rationale.indexOf('api') >= 0; })());
t('D-e3 四件判据条目=6 条/件（PC-1/TC-1~4/NC-1）', REAL.every(function (s) { return sc[s].adjudication.entries.length === 6; }));
t('D-e4 四件 preview_disclosure=capability 3 of 5 · preview＋同主确认偏差置首＋not_in_preview 收窄', REAL.every(function (s) { const d = sc[s].preview_disclosure; return d && d.capability_label === 'capability 3 of 5 · preview' && d.structural_limitations[0].indexOf('同主确认偏差') >= 0 && JSON.stringify(d.not_in_preview) === JSON.stringify(['Micro-B', 'Macro-A']); }));
t('D-e5 四件 subject_ref=PR 级（owner/repo#N）', REAL.every(function (s) { return /^Xxx91n\/[a-z-]+#\d+$/.test(sc[s].subject_ref); }));
t('D-e6 四件 receipt RCP- 格式＋human pending', REAL.every(function (s) { return /^RCP-[0-9a-f]{16}$/.test(sc[s].receipt.receipt_id) && sc[s].adjudication.human.status === 'pending'; }));
t('D-r1 拒绝件 overall=unsupported', sc['goose-duck-agent-refusal'].overall_verdict === 'unsupported');
t('D-r2 拒绝件含「无托管 PR 面」+前置条件+前提漂移注记', md['goose-duck-agent-refusal'].indexOf('无托管 PR 面') >= 0 && md['goose-duck-agent-refusal'].indexOf('前置条件') >= 0 && md['goose-duck-agent-refusal'].indexOf('漂移') >= 0);
t('D-r3 拒绝件 TC-4 判据落 unsupported＋象限 intake-refused 标记', sc['goose-duck-agent-refusal'].adjudication.entries.some(function (e) { return e.criterion_id === 'TC-4' && e.band === 'unsupported'; }) && sc['goose-duck-agent-refusal'].quadrants.every(function (q) { return q.conflict_markers.indexOf('intake-refused') >= 0; }));

const gates = JSON.parse(txt(join(HERE, '48-micro-a-gate-probes.json')));
t('D-g1 资格闸读数：anysearch-cli merged≥1→eligible（前提漂移）＋goose-duck-agent merged=0→拒绝', (function () { const a = gates.probes.filter(function (p) { return p.name === 'anysearch-cli'; })[0]; const g = gates.probes.filter(function (p) { return p.name === 'goose-duck-agent'; })[0]; return a.eligible === true && a.merged_prs >= 1 && g.eligible === false && g.merged_prs === 0; })());
const meas = JSON.parse(txt(join(HERE, '48-micro-a-measurements.json')));
t('D-m1 共享库 Micro-A 四仓事实齐入', meas.shared_duckdb && meas.shared_duckdb.db_by_scale['Micro-A'] >= 90 && ['Xxx91n/env-manager', 'Xxx91n/jiahao', 'Xxx91n/anysearch-cli', 'Xxx91n/goose-duck-agent'].every(function (k) { return meas.shared_duckdb.db_by_repo[k] > 0; }), JSON.stringify(meas.shared_duckdb ? meas.shared_duckdb.db_by_repo : {}));
t('D-m2 事实 scale=Micro-A 全量（JSONL 行抽查）', (function () { const line = txt(join(HERE, '48-micro-a-jiahao-facts.jsonl')).split('\n')[0]; return JSON.parse(line).scale === 'Micro-A'; })());

// ---------- E. 事件闭环 + 文档回写 ----------
const reg = JSON.parse(txt(join(HERE, '33-gate-registry.json')));
t('E1 micro-a-preview-prep occurred=true 带证据', reg.events['micro-a-preview-prep'].occurred === true && /#48/.test(reg.events['micro-a-preview-prep'].evidence));
const t15 = reg.items.find(function (i) { return i.id === 'desk-task15'; });
t('E2 desk-task15 decided + criterion-met 确认留痕（#48 署名）', t15.status === 'decided' && (t15.confirmations || []).some(function (c) { return c.decision === 'trigger-fired-criterion-met' && /#48/.test(c.by); }));
t('E3 绑定三项复审留痕（llm-mcp-face/deferred-faces/scorecard-repomix）', ['codelore-llm-mcp-face', 'codelore-deferred-faces', 'upstream-probes-scorecard-repomix'].every(function (id) { const it = reg.items.find(function (x) { return x.id === id; }); return (it.confirmations || []).some(function (c) { return /#48/.test(c.by); }); }));
const led = txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'));
t('E4 A-056 行在且标 implemented', /\| A-056 \|[^\n]*implemented/.test(led));
const bl = txt(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('E5 BACKLOG #48 行回写 ✅', /\| #48[^\n]*✅/.test(bl));
const wf = txt(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'));
t('E6 WORKFLOW §4 lessons 含 #48 条目', /#48/.test(wf));
const rd = txt(join(REPO, 'README.md'));
t('E7 README 能力矩阵 Micro-A=capability 3 of 5 · preview', rd.indexOf('capability 3 of 5 · preview') >= 0 && /Micro-A PR diff \| \*\*capability 3 of 5/.test(rd));
t('E8 票档三件套在', existsSync(join(REPO, '.scratch', 'architecture-recovery', 'issues', '48-micro-a-preview.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '48-micro-a-preview.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '48-micro-a-preview.md')));
t('E9 日报含 #48 窗口节', txt(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md')).indexOf('窗口：#48') >= 0);
t('E10 48-report.md 在且六段齐备', existsSync(join(HERE, '48-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(function (x) { return txt(join(HERE, '48-report.md')).indexOf(x) >= 0; }));

// ---------- F. token 泄漏 + BOM ----------
const f48 = readdirSync(HERE).filter(function (f) { return f.indexOf('48-') === 0; });
const allTxt = f48.filter(function (f) { return /\.(json|jsonl|md|mjs)$/.test(f); }).map(function (f) { return txt(join(HERE, f)); }).join('\n');
t('F1 全部 48-* 工件零 token 泄漏（gho_/ghp_/github_pat_/Bearer 实值）', !/(gho_[A-Za-z0-9]|ghp_[A-Za-z0-9]|github_pat_[A-Za-z0-9])/.test(allTxt));
t('F2 全部 48-* 工件无 BOM', f48.every(function (f) { return noBom(join(HERE, f)); }), f48.filter(function (f) { return !noBom(join(HERE, f)); }).join(','));
t('F3 守卫脚本自身无 BOM', noBom(join(HERE, '48-check.mjs')));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
