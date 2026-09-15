// #39 守卫——Macro-B 三仓 one-shot：产物齐/证据锚/registry 翻转/jiahao CI 接入/self-probe 实测/被测仓零写入
// 用法：node 39-check.mjs → 逐条 PASS/FAIL；exit 0 = 全 PASS，exit 1 = 有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const ENG = join(ROOT, 'engine');
const REPOS = { 'env-manager': 'D:/Aworker/env-manager', 'anysearch-cli': 'D:/Aworker/anysearch-cli', 'jiahao': 'D:/Aworker/jiahao' };
const NAMES = Object.keys(REPOS);

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const read = (f) => fs.readFileSync(join(here, f), 'utf8');
const noBom = (f) => { const b = fs.readFileSync(join(here, f)); return !(b.length >= 3 && b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); };
const git = (root, args) => { const s = spawnSync('git', ['-C', root].concat(args), { encoding: 'utf8' }); return s.status === 0 ? s.stdout.trim() : null; };

// --- A. 工件齐备 + 无 BOM ---
const ARTIFACTS = [];
for (const n of NAMES) { ARTIFACTS.push('39-macro-b-' + n + '.md', '39-macro-b-' + n + '.json', '39-macro-b-' + n + '-facts.jsonl', '39-macro-b-' + n + '-measurements.json'); }
ARTIFACTS.push('39-macro-b-measurements.json', '39-audit-facts.duckdb', '39-macro-b-one-shot.mjs', '39-mw-self-probe.mjs', '39-mw-child.mjs', '39-mw-self-probe.json', '39-mw-probe.duckdb');
t('A1 工件齐备（3仓×4 + 汇总 + duckdb + 脚本×3 + self-probe 产物）', ARTIFACTS.every((f) => fs.existsSync(join(here, f))), ARTIFACTS.filter((f) => !fs.existsSync(join(here, f))).join(','));
t('A2 文本工件无 BOM', ARTIFACTS.filter((f) => !f.endsWith('.duckdb') && !f.endsWith('.mjs')).every(noBom), '');

const summary = JSON.parse(read('39-macro-b-measurements.json'));
const probe = JSON.parse(read('39-mw-self-probe.json'));
const perRepo = {};
for (const n of NAMES) {
  perRepo[n] = {
    md: read('39-macro-b-' + n + '.md'),
    sc: JSON.parse(read('39-macro-b-' + n + '.json')),
    meas: JSON.parse(read('39-macro-b-' + n + '-measurements.json')),
    facts: read('39-macro-b-' + n + '-facts.jsonl').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  };
}

// --- B. 每仓证据锚（facts 数 / receipt / commit 锚可解析为真实对象——产物锚定生成时刻，禁止与易变 HEAD 相等比较，#23 教训） ---
for (const n of NAMES) {
  const r = perRepo[n];
  const anchorType = git(REPOS[n], ['cat-file', '-t', r.meas.head_sha]);
  t('B-' + n + ' 证据锚三件套：facts>0 + receipt RCP- + commit 锚可解析 + subject_ref 一致',
    r.facts.length > 0 && /^RCP-[0-9a-f]{16}$/.test(r.sc.receipt && r.sc.receipt.receipt_id ? r.sc.receipt.receipt_id : '') && anchorType === 'commit' && r.sc.subject_ref === n + '@' + r.meas.head_sha.slice(0, 12),
    'facts=' + r.facts.length + ' receipt=' + (r.sc.receipt ? r.sc.receipt.receipt_id : 'none') + ' anchor=' + r.meas.head_sha.slice(0, 7) + '(' + anchorType + ')');
}

// --- C. 报告形态（骨架/披露块/裁决/引文校验/诚实裁定带） ---
for (const n of NAMES) {
  const r = perRepo[n];
  const bands = ['supported', 'unsupported', 'insufficient'];
  t('C-' + n + ' 报告形态：C1-C4 骨架 + RECEIPT + 披露块 capability 1 of 5 + 6 裁决条目 + 引文全 supports + overall 三档内',
    ['## C1', '## C2', '## C3', '## C4', 'RECEIPT RCP-'].every((s) => r.md.includes(s)) &&
    !!r.sc.preview_disclosure && r.sc.preview_disclosure.capability_label === 'capability 1 of 5 · preview' &&
    r.sc.preview_disclosure.structural_limitations.join('；').includes('dogfooding') &&
    r.sc.adjudication.entries.length === 6 && r.sc.citation_checks.every((c) => c.support === 'supports') &&
    bands.indexOf(r.sc.overall_verdict) >= 0,
    'overall=' + r.sc.overall_verdict + ' checks=' + r.sc.citation_checks.length);
}
t('C-honest 三仓裁定如实落数（汇总与侧车一致；非全绿——接受非跑通）',
  summary.targets.every((x) => x.verdicts.overall === perRepo[x.repo].sc.overall_verdict) && new Set(summary.targets.map((x) => x.verdicts.overall)).size >= 1,
  summary.targets.map((x) => x.repo + '=' + x.verdicts.overall).join(' '));
t('C-supply_chain 三仓 supply_chain 象限全 not_applicable + ⚠ 数据未接（D-034③）',
  NAMES.every((n) => perRepo[n].sc.quadrants.some((q) => q.quadrant === 'supply_chain' && q.applicability === 'not_applicable' && /数据未接/.test(q.verdict_gate.override_reason))), '');

// --- D. 共享事实库（同一 audit_fact 表：3 仓 Macro-B，计数对齐 jsonl） ---
const STORE = await import(pathToFileURL(join(ENG, 'dist', 'fact', 'store.js')).href);
let dbOk = false, dbScale = {}, dbRepo = {};
try {
  const reader = await STORE.openReader(join(here, '39-audit-facts.duckdb'));
  const rows = await (await STORE.queryFacts(reader, 'SELECT scale, COUNT(*) n FROM audit_fact GROUP BY scale')).getRows();
  const repos = await (await STORE.queryFacts(reader, 'SELECT repo_ref, COUNT(*) n FROM audit_fact GROUP BY repo_ref')).getRows();
  for (const r of rows) { dbScale[String(r[0])] = Number(r[1]); }
  for (const r of repos) { dbRepo[String(r[0])] = Number(r[1]); }
  reader.closeSync();
  dbOk = true;
} catch (e) { console.log('  duckdb read error: ' + e.message); }
const jsonlTotal = NAMES.reduce((s, n) => s + perRepo[n].facts.length, 0);
t('D1 共享事实库单 scale=Macro-B + 3 repo_ref + 计数=三仓 jsonl 总和（' + jsonlTotal + '）',
  dbOk && Object.keys(dbScale).length === 1 && dbScale['Macro-B'] === jsonlTotal && Object.keys(dbRepo).length === 3 && NAMES.every((n) => Object.keys(dbRepo).some((k) => k.indexOf(n + '@') === 0 && dbRepo[k] === perRepo[n].facts.length)),
  JSON.stringify(dbRepo));
t('D2 汇总 measurements 与库一致（appended=' + summary.shared_duckdb.appended + ' dedup=' + summary.shared_duckdb.dedup_dropped + '）',
  summary.shared_duckdb.appended === jsonlTotal && summary.shared_duckdb.dedup_dropped === 0 && summary.shared_duckdb.db_by_scale['Macro-B'] === jsonlTotal, '');

// --- E. registry 翻转（mw-regression-ci occurred + mw-trigger-a trigger-fired + desk-task7 实测封口翻转） ---
const reg = JSON.parse(read('33-gate-registry.json'));
const mwa = reg.items.find((i) => i.id === 'mw-trigger-a');
const dt7 = reg.items.find((i) => i.id === 'desk-task7');
t('E1 registry 事件 mw-regression-ci occurred=true + 证据含 jiahao workflow', reg.events['mw-regression-ci'].occurred === true && /macro-b-regression\.yml/.test(reg.events['mw-regression-ci'].evidence || ''), '');
t('E2 mw-trigger-a confirmations 追加 trigger-fired（D-034④a 激活登记）', !!mwa && Array.isArray(mwa.confirmations) && mwa.confirmations.some((c) => c.decision === 'trigger-fired' && /macro-b-regression/.test(c.evidence || '')), '');
t('E3 desk-task7 状态翻转 triggered-bound + confirmations self-probe-executed', !!dt7 && dt7.status === 'triggered-bound' && /39-mw-self-probe/.test(dt7.bound_to || '') && Array.isArray(dt7.confirmations) && dt7.confirmations.some((c) => c.decision === 'self-probe-executed'), '');
const g33 = spawnSync('node', [join(here, '33-check.mjs')], { encoding: 'utf8' });
t('E4 33-check 回归不破坏（exit 0 + ALARM mw-trigger-a 值守登记输出）', g33.status === 0 && (g33.stdout || '').includes('ALARM mw-trigger-a'), (g33.stdout || '').trim().split('\n').filter((l) => /ALARM|PASS|FAIL/.test(l)).slice(-3).join(' / '));

// --- F. jiahao CI 接入（workflow 触发面 + 引擎链 + commit 在 jiahao 仓） ---
const WF = join(REPOS.jiahao, '.github', 'workflows', 'macro-b-regression.yml');
const wf = fs.existsSync(WF) ? fs.readFileSync(WF, 'utf8') : '';
const onBlock = (wf.split(/\njobs:/)[0] || '');
t('F1 jiahao workflow 存在 + 触发面 schedule(cron)+workflow_dispatch 写明', wf.includes('schedule:') && /cron:\s*'\d+ \d+ \* \* \d'/.test(wf) && wf.includes('workflow_dispatch'), '');
t('F2 触发面不含 push/pull_request（回归≠门禁）', !/^\s+(push|pull_request)\s*:/m.test(onBlock.split(/\non:/)[1] || ''), '');
t('F3 回归链完整：checkout Xxx91n/6F + fetch-depth 0 + engine build + 39-macro-b-one-shot.mjs --repo jiahao', wf.includes('Xxx91n/6F') && wf.includes('fetch-depth: 0') && wf.includes('npm run build') && wf.includes('39-macro-b-one-shot.mjs') && wf.includes('--repo jiahao'), '');
t('F4 已上架层限定 + 诚实语义注释在 workflow 内（preview 不混 / job 绿=管线绿）', wf.includes('已上架层') && wf.includes('preview'), '');
const jhLog = git(REPOS.jiahao, ['log', '-1', '--format=%s', 'r9-39-macro-b-regression']);
const jhStatus = git(REPOS.jiahao, ['status', '--porcelain']);
t('F5 jiahao 仓 but commit 落地（r9-39-macro-b-regression 含 A-044）+ 工作树干净', !!jhLog && jhLog.includes('A-044') && jhStatus === '', 'log=' + (jhLog || 'n/a').slice(0, 60));

// --- G. self-probe 实测（真实并发面，非模拟） ---
const A = probe.phases.A_same_process || {};
const B1 = probe.phases.B1_multi_process_parallel || {};
const B2 = probe.phases.B2_multi_process_sequential || {};
const CC = probe.phases.C_during_holder_lock || {};
const FB = probe.final_readback || {};
t('G1 self-probe 产物含 5 实测面 + 判据引用 + verdict 读数', !!(A.w2 && B1.per_writer && B2.per_writer && CC.reader && FB.per_writer && probe.criterion && probe.verdict), '');
t('G2 同进程面实测：第二 openWriter denied + 并发 append 30/30 + 写中 reader denied + conn.close 后 reopen denied（instance 持锁读数）',
  A.w2 === 'denied' && A.append_ok === 30 && A.append_fail === 0 && A.reader_during_write === 'denied' && A.reopen_after_conn_close === 'denied',
  'w2=' + A.w2 + ' append=' + A.append_ok + '/' + (A.append_ok + A.append_fail) + ' reader=' + A.reader_during_write + ' reopen=' + A.reopen_after_conn_close);
t('G3 跨进程面实测：并行 1 胜 3 lock_denied + 串行 2/2 + 持锁期 reader/writer 皆拒',
  B1.winners === 1 && B1.lock_denied === 3 && B1.other_errors === 0 && B2.winners === 2 && CC.reader.outcome === 'denied' && /lock_denied/.test(CC.writer.outcome || ''),
  'B1=' + B1.winners + '/' + B1.lock_denied + ' B2=' + B2.winners + ' C=' + (CC.reader.outcome || '') + '/' + (CC.writer.outcome || ''));
t('G4 终读回完整性：66 行零重复 fact_id + verdict.rows_match=true + closure_reading 落文',
  FB.rows_total === 66 && FB.duplicate_fact_ids === 0 && probe.verdict.rows_match === true && (probe.verdict.closure_reading || '').length > 40,
  'rows=' + FB.rows_total + ' dup=' + FB.duplicate_fact_ids);

// --- H. 落点文书（报告/账本/issue/任务书/lessons） ---
t('H1 39-report.md 落盘', fs.existsSync(join(here, '39-report.md')), '');
if (fs.existsSync(join(here, '39-report.md'))) {
  const rep = read('39-report.md');
  t('H2 报告含三仓证据锚 + CI 接入 + self-probe + 触发器登记引用', rep.includes('RCP-b1106d4112171be9') && rep.includes('RCP-b87bc53eb457a9fc') && rep.includes('RCP-4d1b294f6e2b0a07') && rep.includes('macro-b-regression.yml') && rep.includes('mw-trigger-a') && rep.includes('39-mw-self-probe.json'), '');
  t('H3 报告含诚实裁定叙事（unsupported 落数 + 反复接受非跑通 + dogfooding）', rep.includes('unsupported') && rep.includes('非跑通') && rep.includes('dogfooding'), '');
}
const ledger = fs.readFileSync(join(ROOT, '.scratch', 'architecture-recovery', 'decision-ledger.md'), 'utf8');
const a044 = ledger.split('\n').find((l) => l.includes('A-044')) || '';
t('H4 账本 A-044 回写 done → implemented（2026-09-16）', a044.includes('done → implemented（2026-09-16）'), '');
const issue = fs.readFileSync(join(ROOT, '.scratch', 'architecture-recovery', 'issues', '39-macro-b-three-repo.md'), 'utf8');
t('H5 issue #39 Status=done + checklist 全勾', /Status:\*\* done/.test(issue) && (issue.match(/- \[x\]/g) || []).length === 4, '');
const nr = fs.readFileSync(join(ROOT, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'), 'utf8');
t('H6 next-round T11 ✅ DONE + 进度块含 #39 闭环', nr.split('\n').some((l) => l.includes('T11') && l.includes('DONE')) && nr.includes('#39'), '');
const wfMd = fs.readFileSync(join(ROOT, '.scratch', 'architecture-recovery', 'WORKFLOW.md'), 'utf8');
t('H7 WORKFLOW §4 lessons 追加本票行（#39/A-044）', /2026-09-16[^\n]*(#39|A-044)/.test(wfMd), '');

// --- I. 被测仓写纪律（env-manager/anysearch-cli 零写入；jiahao 仅 workflow 变更已 commit） ---
t('I1 env-manager 工作树零写入', git(REPOS['env-manager'], ['status', '--porcelain']) === '', '');
t('I2 anysearch-cli 工作树零写入', git(REPOS['anysearch-cli'], ['status', '--porcelain']) === '', '');
const jhFiles = git(REPOS.jiahao, ['show', '--pretty=format:', '--name-only', 'r9-39-macro-b-regression']);
t('I3 jiahao 分支 commit 变更面仅 .github/workflows/macro-b-regression.yml', !!jhFiles && jhFiles === '.github/workflows/macro-b-regression.yml', jhFiles || '');

// --- J. 引擎纪律 + 测试链不回归（本票零 engine 源码改动） ---
const pkg = JSON.parse(fs.readFileSync(join(ENG, 'package.json'), 'utf8'));
t('J1 smoke 链在位（6 测试文件入链）', (pkg.scripts.smoke.match(/node test\//g) || []).length === 6, '');
const pv = spawnSync('node', [join(ENG, 'test', 'report-preview.test.mjs')], { encoding: 'utf8' });
t('J2 preview 契约测试实跑全绿（引擎未回归）', pv.status === 0 && /REPORT-PREVIEW-TEST-OK (\d+)\/\1/.test(pv.stdout || ''), (pv.stdout || '').trim().split('\n').pop());
const col = spawnSync('node', [join(ENG, 'test', 'collectors.test.mjs')], { encoding: 'utf8' });
t('J3 collectors 契约测试实跑全绿（采集面未回归）', col.status === 0, (col.stdout || '').trim().split('\n').pop());

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
