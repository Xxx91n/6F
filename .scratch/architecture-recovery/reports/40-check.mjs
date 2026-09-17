// 40-check.mjs — #40 非自有公开仓 URL opt-in 泛化验证守卫（R5-09 / A-045）
// 断言面：目标选定 → intake 回执 → clone 隔离/全深度/远程配置纪律 → Macro-B 产物 → 三基线对照 → registry 翻转 → 文档账本
// 纪律：本守卫只读——对 clone 缓存仅发 git 只读子命令，对 reports/ 仅文件读；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const DIST = join(REPO, 'engine', 'dist');
const OUT = join(HERE, '40-out');
const EXT_URL = 'https://github.com/open-gsd/gsd-core.git';
const EXT_KEY = createHash('sha256').update(EXT_URL).digest('hex').slice(0, 16);
const CACHE = join(HERE, '40-clone-cache', 'repos', EXT_KEY);
const BASES = ['env-manager', 'anysearch-cli', 'jiahao'];

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function git(dir, args) { return execFileSync('git', ['-C', dir].concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim(); }
function json(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// ---------- A. 目标选定与 intake 回执 ----------
t('A1 目标选定记录在位（40-target-selection.json）', existsSync(join(HERE, '40-target-selection.json')));
const sel = json(join(HERE, '40-target-selection.json'));
t('A2 选定仓 = open-gsd/gsd-core 且 URL 为 https opt-in 形态', sel.selected.url === EXT_URL, sel.selected.url);
t('A3 选定理由含非自有 + ADR 语料 + 真实项目三要素', (sel.rationale || []).length >= 5 && sel.rationale.join('').indexOf('非自有') >= 0 && sel.rationale.join('').indexOf('ADR') >= 0);
t('A4 intake 回执在位（40-intake-receipt.json）', existsSync(join(HERE, '40-intake-receipt.json')));
const rc = json(join(HERE, '40-intake-receipt.json'));
t('A5 回执 kind=url 且 url 与选定一致', rc.kind === 'url' && rc.url === EXT_URL, rc.url);
t('A6 回执 resolved_root 位于 40-clone-cache 隔离目录（含 sha256 键）', rc.resolved_root && rc.resolved_root.indexOf('40-clone-cache') >= 0 && rc.resolved_root.indexOf(EXT_KEY) >= 0, rc.resolved_root);
t('A7 回执全深度断言位：shallow=false + full_depth_verified=true', rc.shallow === false && rc.full_depth_verified === true);
t('A8 回执纪律位：remote_config_execution=disabled + credentials=local-git-credential-chain', rc.remote_config_execution === 'disabled' && rc.credentials === 'local-git-credential-chain');
t('A9 回执 head_sha 为 40 位 git SHA', /^[0-9a-f]{40}$/.test(rc.head_sha || ''), rc.head_sha);

// ---------- B. clone 实物核查（git 只读子命令） ----------
t('B1 clone 缓存目录实物在位', existsSync(CACHE) && existsSync(join(CACHE, '.git')));
const shallow = git(CACHE, ['rev-parse', '--is-shallow-repository']);
t('B2 实物浅仓断言：is-shallow-repository=false', shallow === 'false', shallow);
const head = git(CACHE, ['rev-parse', '--verify', 'HEAD']);
t('B3 实物 HEAD 与回执一致', head === rc.head_sha, head + ' vs ' + rc.head_sha);
const remote = git(CACHE, ['config', '--local', '--get', 'remote.origin.url']);
t('B4 remote.origin.url = 选定 URL（来源锚一致）', remote === EXT_URL, remote);
const hooks = git(CACHE, ['config', '--local', '--get', 'core.hooksPath']);
t('B5 clone 产物 core.hooksPath 已置 noop（远程配置执行禁）', hooks.indexOf('noop-hooks') >= 0, hooks);
const ext = git(CACHE, ['config', '--local', '--get', 'protocol.ext.allow']);
t('B6 clone 产物 protocol.ext.allow=never', ext === 'never', ext);
const commits = Number(git(CACHE, ['rev-list', '--count', 'HEAD']));
t('B7 clone 历史深度 >1000 commits（全深度非浅层表象）', commits > 1000, String(commits));
const status = git(CACHE, ['status', '--porcelain']);
t('B8 clone 工作树干净（intake 未遗留改动）', status === '', status.slice(0, 80));

// ---------- C. intake 实现纪律（源码断言面） ----------
const srcIntake = readFileSync(join(REPO, 'engine', 'src', 'intake', 'intake.ts'), 'utf8');
t('C1 intake 模块在位且导出 repoAdd/classifyRepoInput', srcIntake.indexOf('export function repoAdd') >= 0 && srcIntake.indexOf('export function classifyRepoInput') >= 0);
t('C2 浅 clone 显式拒绝错误码在位（SHALLOW-CLONE-REJECTED）', srcIntake.indexOf('SHALLOW-CLONE-REJECTED') >= 0);
t('C3 clone 调用未携带 --depth/--shallow（全深度契约）', /clone/.test(srcIntake) && srcIntake.indexOf("'--depth'") < 0 && srcIntake.indexOf("'--shallow'") < 0);
t('C4 远程配置执行禁在位（protocol.ext.allow=never + core.hooksPath noop）', srcIntake.indexOf('protocol.ext.allow=never') >= 0 && srcIntake.indexOf('core.hooksPath') >= 0);
t('C5 CLI 暴露 repo add 子命令', readFileSync(join(REPO, 'engine', 'src', 'cli.ts'), 'utf8').indexOf("cmd === 'repo'") >= 0);
t('C6 intake 契约测试在位且入 smoke 链', existsSync(join(REPO, 'engine', 'test', 'intake.test.mjs')) && readFileSync(join(REPO, 'engine', 'package.json'), 'utf8').indexOf('intake.test.mjs') >= 0);

// ---------- D. Macro-B 产物与读回完整性 ----------
const MEAS = join(OUT, '40-macro-b-gsd-core-measurements.json');
const FACTS = join(OUT, '40-macro-b-gsd-core-facts.jsonl');
const SIDE = join(OUT, '40-macro-b-gsd-core.json');
const MD = join(OUT, '40-macro-b-gsd-core.md');
const DB = join(OUT, '40-audit-facts.duckdb');
const SUM = join(OUT, '40-macro-b-measurements.json');
for (const [n, p] of [['D1 实测 JSON', MEAS], ['D2 事实 JSONL', FACTS], ['D3 报告侧车', SIDE], ['D4 报告 MD', MD], ['D5 共享 DuckDB', DB], ['D6 汇总实测', SUM]]) {
  t(n + ' 在位', existsSync(p), p);
}
const meas = json(MEAS);
t('D7 实测 head_sha = clone HEAD（分析对象 = intake 产物）', meas.head_sha === rc.head_sha, meas.head_sha);
const factLines = readFileSync(FACTS, 'utf8').trim().split('\n');
t('D8 facts.jsonl 行数 = 实测 fact_count（读回一致）', factLines.length === meas.fact_count, factLines.length + ' vs ' + meas.fact_count);
const f0 = JSON.parse(factLines[0]);
t('D9 facts 行 schema 在位（fact_id/repo_ref/metric）', !!f0.fact_id && f0.repo_ref.indexOf('gsd-core@') === 0 && !!f0.metric);
const side = json(SIDE);
const mdText = readFileSync(MD, 'utf8');
t('D10 侧车 receipt 与 MD 标注 receipt 一致', !!side.receipt && mdText.indexOf(side.receipt.receipt_id) >= 0, side.receipt && side.receipt.receipt_id);
t('D11 报告披露块 = 外部仓 URL opt-in 校准面（非试点文案残留）', mdText.indexOf('外部公开仓 URL opt-in') >= 0 && mdText.indexOf('capability 1 of 5') >= 0);
t('D12 综合裁定与实测一致（unsupported=TC-2 RED 传播，如实落数）', side.overall_verdict === 'unsupported' && meas.tc2.verdict === 'RED' && meas.tc2.cond_b === true, side.overall_verdict + '/' + meas.tc2.verdict);
const duckCount = await (async () => {
  const S = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);
  // 只读纪律落实：openReader=READ_ONLY 无 DDL/种子/写锁（openWriter 每跑产 .wal 与本守卫文件头自述相悖，38/39-check 同形态）
  const r = await S.openReader(DB);
  const rows = await (await S.queryFacts(r, 'SELECT COUNT(*) n FROM audit_fact')).getRows();
  r.closeSync();
  return Number(rows[0][0]);
})();
t('D13 DuckDB audit_fact 行数 = facts.jsonl 行数（共享库读回）', duckCount === factLines.length, String(duckCount));
t('D14 外部仓 ADR 语料 ≥ min_n（92 份 → TC-1 可判）', meas.adr_count >= 5 && meas.tc1.judgeable_n >= 5, 'adr=' + meas.adr_count + ' judgeable=' + meas.tc1.judgeable_n);
t('D15 正/负对照在外部仓全过（PC-1/PC-2/NC-1）', meas.pc1.pass === true && meas.pc2.pass === true && meas.nc1.pass === true);

// ---------- E. 三基线对照 ----------
t('E1 对照表在位（40-external-comparison.json）', existsSync(join(HERE, '40-external-comparison.json')));
const cmp = json(join(HERE, '40-external-comparison.json'));
t('E2 对照表覆盖三基线 + 外部仓四行', cmp.targets.length === 4 && BASES.every(b => cmp.targets.some(r => r.repo === b)) && cmp.targets.some(r => r.repo === 'gsd-core'));
const extRow = cmp.targets.find(r => r.repo === 'gsd-core');
t('E3 外部行标记 url_optin=true + kind=external-url-optin', extRow.url_optin === true && extRow.kind === 'external-url-optin');
const baseRows = cmp.targets.filter(r => r.url_optin === false);
t('E4 三基线行标记 internal-dogfooding（dogfooding 边界显式）', baseRows.length === 3 && baseRows.every(r => r.kind === 'internal-dogfooding'));
t('E5 对照表 dogfooding_boundary 声明在位', (cmp.dogfooding_boundary || '').indexOf('dogfooding') >= 0);
t('E6 对照行数与实测一致（外部仓 fact_count 与 D 组同源）', extRow.fact_count === meas.fact_count && extRow.head_sha === meas.head_sha);
t('E7 基线实测文件在位（39-macro-b-*-measurements.json ×3 + 汇总）', BASES.every(b => existsSync(join(HERE, '39-macro-b-' + b + '-measurements.json'))) && existsSync(join(HERE, '39-macro-b-measurements.json')));
t('E8 TC-2 归因区分落文（detector 漏认 vs 真缺失 观察项在位）', (cmp.observations || []).join('').indexOf('漏认') >= 0 && (cmp.fallback_leg_note || '').indexOf('dash') >= 0);

// ---------- F. registry 翻转与绑定处置 ----------
const reg = json(join(HERE, '33-gate-registry.json'));
t('F1 first-external-repo.occurred = true（实跑完成后翻转）', reg.events['first-external-repo'].occurred === true);
t('F2 first-external-repo 证据锚含 40- 工件引用', (reg.events['first-external-repo'].evidence || '').indexOf('40-') >= 0);
const t2 = reg.items.find(i => i.id === 'desk-task2');
t('F3 desk-task2 判据达成 → triggered-bound（judgeable=92≥5）', t2.status === 'triggered-bound' && (t2.bound_to || '').indexOf('judgeable') >= 0, t2.status);
const t15 = reg.items.find(i => i.id === 'desk-task15');
t('F4 desk-task15 判定链闭合（#40 时点 unmet 留痕→#48 落地 criterion-met 判 decided）', t15.status === 'decided' && (t15.confirmations || []).some(c => (c.decision || '') === 'trigger-fired-criterion-unmet') && (t15.confirmations || []).some(c => (c.decision || '') === 'trigger-fired-criterion-met' && /#48/.test(c.by || '')), t15.status);
t('F5 desk-task15 确认记录含判据原文锚（30-desk-calibration task15）', (t15.confirmations || []).some(c => (c.criterion_version || '').indexOf('task=15') >= 0));

// ---------- G. 文档与账本落文 ----------
const reportMd = join(HERE, '40-report.md');
t('G1 40-report.md 在位且六段齐备', existsSync(reportMd) && ['②', '③', '④', '⑤', '⑥'].every(m => readFileSync(reportMd, 'utf8').indexOf(m) >= 0));
const issue = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'issues', '40-external-repo-generalization.md'), 'utf8');
t('G2 issue#40 状态已回写（Status 行翻转）', issue.indexOf('done') >= 0 || issue.indexOf('实跑完成') >= 0);
const archLedger = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'), 'utf8');
t('G3 A-045 账本行在位（architecture-recovery ledger）', archLedger.indexOf('A-045') >= 0);
const wf = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'), 'utf8');
t('G4 WORKFLOW §4 lessons 含 #40 外部仓条目', /#[0-9]*40|40-.*外部|外部.*泛化|dash\+加粗/.test(wf), 'no 40 lesson');
const nextRound = readFileSync(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'), 'utf8');
t('G5 next-round 含 #40 落点记录（T12/进度块）', nextRound.indexOf('#40') >= 0 || nextRound.indexOf('gsd-core') >= 0);
const maReport = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('G6 macro-audit 日报含 #40 窗口节', existsSync(maReport) && readFileSync(maReport, 'utf8').indexOf('gsd-core') >= 0);

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
