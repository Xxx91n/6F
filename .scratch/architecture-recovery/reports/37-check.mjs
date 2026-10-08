// #37 守卫——三仓实测数据齐备 + 证据锚可回查 + 矩阵字段齐备 + 报告引用一致
// 用法：node 37-check.mjs → 逐条 PASS/FAIL；exit 0 = 全 PASS，exit 1 = 有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { siblingPath, envProbe, need } from './_lib/env-contract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——整件 need sibling:）：dev-full=完整克隆＋sibling 工作树在位全断言面；ci-shallow=CI 浅克隆（sibling 缺席→整件 SKIP-with-reason）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '37-pilot 三仓实测面（measurements 字段齐备＋证据锚回查＋快照钉复测）';
const ROOTS = { 'env-manager': siblingPath('env-manager'), 'anysearch-cli': siblingPath('anysearch-cli'), 'jiahao': siblingPath('jiahao') };
const REPO_NAMES = Object.keys(ROOTS);
// env-contract 启动探测（D-159①⑤）：sibling 缺失→SKIP-with-reason；在但漂移→下方 WARN/NOTE 方言披露面承载
envProbe('37-check', REPO_NAMES.map((n) => need('sibling:' + n, fs.existsSync(ROOTS[n]))));

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

const pm = JSON.parse(fs.readFileSync(join(here, '37-pilot-measurements.json'), 'utf8'));

// --- A. 三仓 × 三指标矩阵字段齐备 ---
t('A1 measurements 三仓齐备', REPO_NAMES.every((n) => pm.repos[n] && !(pm.repos[n].errors && pm.repos[n].errors.length)), Object.keys(pm.repos).join(','));
for (const n of REPO_NAMES) {
  const r = pm.repos[n] || {};
  const prOk = r.pr_ratio && typeof r.pr_ratio.github_pr_total === 'number' && Array.isArray(r.pr_evidence?.merge_commit_prs) && Array.isArray(r.pr_evidence?.squash_prs) && typeof r.pr_ratio.human_authored === 'number' && typeof r.pr_ratio.bot_authored === 'number';
  const adrOk = r.adr && typeof r.adr.count === 'number' && r.supersede_chain && typeof r.supersede_chain.edge_count === 'number' && Array.isArray(r.supersede_chain.unresolved_refs) && Array.isArray(r.supersede_chain.missing_backrefs);
  const hostOk = r.remotes && Array.isArray(r.workflows) && r.hosting_files && typeof r.shallow === 'string';
  t(`A2-${n} 三指标字段齐备（PR/ADR链/托管面）`, prOk && adrOk && hostOk, `pr=${prOk} adr=${adrOk} host=${hostOk}`);
}

// --- B. 证据锚可回查（live 复核：文件/commit/度量值） ---
const gitOk = (repo, args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 60000 }).status === 0;
for (const n of REPO_NAMES) {
  const r = pm.repos[n], root = ROOTS[n];
  t(`B1-${n} head commit 锚可回查`, gitOk(root, ['cat-file', '-e', r.head]), r.head.slice(0, 8));
  t(`B2-${n} 全部 PR 证据 sha 可回查`, r.pr_evidence.merge_commit_prs.concat(r.pr_evidence.squash_prs).every((p) => gitOk(root, ['cat-file', '-e', p.sha])), `${r.pr_evidence.merge_commit_prs.length + r.pr_evidence.squash_prs.length} pr-shas`);
  const adrMissing = r.adr.files.filter((f) => !fs.existsSync(join(root, f)));
  t(`B3-${n} ADR 文件锚全部存在（count=${r.adr.count}）`, adrMissing.length === 0, adrMissing.slice(0, 3).join(','));
  const wfMissing = r.workflows.filter((w) => !fs.existsSync(join(root, '.github', 'workflows', w)));
  t(`B4-${n} workflow 文件锚全部存在（${r.workflows.length} 个）`, wfMissing.length === 0, wfMissing.join(','));
}

// --- C. 度量值 live 复测一致（独立重跑与存档对账） ---
for (const n of REPO_NAMES) {
  const r = pm.repos[n], root = ROOTS[n];
  // C1 钉快照 SHA 复测：存档 head 对账存档 count——活 HEAD 前移（如 jiahao +N）不再误红；
  // 存档 head 在活仓不可达时退化显式 WARN 行（不计 PASS/FAIL 假绿），见 r.drift_note。
  const cc = parseInt(spawnSync('git', ['-C', root, 'rev-list', '--count', r.head], { encoding: 'utf8' }).stdout.trim(), 10);
  if (Number.isFinite(cc)) {
    t(`C1-${n} commit_count 钉快照 SHA 复测一致`, cc === r.commit_count, `${cc}==${r.commit_count} @${r.head.slice(0, 8)}`);
  } else {
    console.log(`WARN C1-${n} 存档 head ${r.head.slice(0, 8)} 活仓不可达——复测退化不计数（活仓前移语义非失真，见 drift_note）`);
  }
  // R37/#75批1（D-094(b) 外部语料漂移→改断言）：活仓增长使「等值复测」恒碎——
  // C2 改钉存档 SHA 集单调包含（增长面→成员资格非等值，D-071⑨）；C3 改钉快照 head 树内计数（同 C1 钉快照型）。
  const storedShas = r.pr_evidence.merge_commit_prs.concat(r.pr_evidence.squash_prs, r.pr_evidence.other_github_web_commits).map((p) => p.sha);
  const ghOk = function (sha) { const c = spawnSync('git', ['-C', root, 'cat-file', 'commit', sha], { encoding: 'utf8' }); const cl = c.status === 0 ? c.stdout.split(String.fromCharCode(10)).find(function (l) { return l.indexOf('committer ') === 0; }) : ''; return !!cl && cl.indexOf('noreply@github.com') >= 0; };
  const badGh = storedShas.filter((s) => !ghOk(s));
  if (storedShas.length > 0) {
    t(`C2-${n} 存档 GitHub-committer 证据逐件核验（对象可解析+committer=noreply@github.com——活仓增长/引用面漂移不碎钉）`, badGh.length === 0, `recorded=${storedShas.length} bad=${badGh.length}`);
  } else {
    console.log(`NOTE C2-${n} 存档 gh-committer 证据集为空——逐件核验恒真不证伪（诚实缺席注记，非断言计件）`);
  }
  // R38/#75批2（r37 审计 P-3 欠数检出回补）：C2 单向收窄补双向——存档证据集对快照 head 可达
  // gh-committer 全集欠数可检出（钉 r.head 防活仓增长漂移，同 C1/C3 钉快照型）；head 不可达→WARN 退化同例。
  const ghReach = spawnSync('git', ['-C', root, 'log', r.head, '--format=%H', '--committer=noreply@github.com'], { encoding: 'utf8' });
  if (ghReach.status !== 0) {
    console.log('WARN C2b-' + n + ' 存档 head ' + r.head.slice(0, 8) + ' 活仓不可达——欠数检出退化不计数（同 C1 退化型）');
  } else {
    const ghReachShas = ghReach.stdout.split('\n').filter(Boolean);
    const storedSet = new Set(storedShas);
    const missingCov = ghReachShas.filter(function (s) { return !storedSet.has(s.slice(0, 8)); });
    if (ghReachShas.length > 0) {
      t('C2b-' + n + ' 存档 gh-committer 证据集对快照 head 可达全集欠数检出（stored ⊇ reachable@' + r.head.slice(0, 8) + '）', missingCov.length === 0, 'reachable=' + ghReachShas.length + ' stored=' + storedShas.length + ' missing=' + missingCov.length);
    } else {
      console.log('NOTE C2b-' + n + ' 快照 head 可达 gh-committer 集为空——欠数检出恒真不证伪（诚实缺席注记，同 C2 型）');
    }
  }
  const ls3 = spawnSync('git', ['-C', root, 'ls-tree', '-r', '--name-only', r.head, '--', r.adr.dir || 'docs/adr'], { encoding: 'utf8' });
  if (ls3.status === 0) {
    const adrAtHead = ls3.stdout.split('\n').filter((f) => /^\d{3,}.*\.md$/i.test((f.split('/').pop() || ''))).length;
    t(`C3-${n} ADR 文件数钉快照 head 复测一致（树内计数防活仓增长）`, adrAtHead === r.adr.count, `${adrAtHead}==${r.adr.count} @${r.head.slice(0, 8)}`);
  } else {
    console.log(`WARN C3-${n} 存档 head ${r.head.slice(0, 8)} 活仓不可达——钉快照复测退化不计数（同 C1 退化型）`);
  }
  t(`C4-${n} supersede 断链=0`, r.supersede_chain.unresolved_refs.length === 0, r.supersede_chain.unresolved_refs.join(','));
}

// --- D. 非人类 PR 边缘形态单列（env-manager 应检出 bot/机器生成 PR） ---
const env = pm.repos['env-manager'];
t('D1 env-manager 非人类 PR 边缘形态单列（bot≥1 且 machine-generated≥1）', env.pr_ratio.bot_authored >= 1 && env.pr_ratio.machine_generated >= 1, `b=${env.pr_ratio.bot_authored} g=${env.pr_ratio.machine_generated}`);
t('D2 env-manager dependabot/release-please 远端分支检出', env.dependabot_remote_branches.length >= 1 && env.release_please_remote_branches.length >= 1, `dep=${env.dependabot_remote_branches.length} rp=${env.release_please_remote_branches.length}`);
const as = pm.repos['anysearch-cli'];
t('D3 anysearch-cli 无 PR 面 = 如实下限（github_pr_total=0 且 remote 在）', as.pr_ratio.github_pr_total === 0 && !!as.github_remote, '');
t('D4 anysearch-cli supersede 链完整（whole-adr≥1 且回链0缺失）', as.supersede_chain.whole_adr_supersessions >= 1 && as.supersede_chain.missing_backrefs.length === 0, `whole=${as.supersede_chain.whole_adr_supersessions}`);
const jh = pm.repos['jiahao'];
t('D5 jiahao 实测托管面纠偏（github_remote + PR≥1 + origin/main 同步）', !!jh.github_remote && jh.pr_ratio.github_pr_total >= 1 && jh.main_origin_sync === '0\t0', `pr=${jh.pr_ratio.github_pr_total} sync=${JSON.stringify(jh.main_origin_sync)}`);
t('D6 jiahao 引用网完整（edges≥30 且断链=0 且 defer-registry 在）', jh.supersede_chain.edge_count >= 30 && jh.supersede_chain.unresolved_refs.length === 0 && jh.deferred_registry_present === true, `edges=${jh.supersede_chain.edge_count}`);

// --- E. 报告落盘 + 引用一致 ---
const rp = join(here, '37-report.md');
t('E1 37-report.md 落盘', fs.existsSync(rp), '');
if (fs.existsSync(rp)) {
  const rep = fs.readFileSync(rp, 'utf8');
  t('E2 报告含层×仓 capacity 矩阵（三仓列 + 层行）', REPO_NAMES.every((n) => rep.includes(n)) && /capacity/i.test(rep) && /Macro-C|Macro-B|Micro-A/.test(rep), '');
  t('E3 报告含 D-033 对照（一致/出入标记）', /D-033/.test(rep) && /出入|不一致|证伪|纠偏/.test(rep), '');
  t('E4 报告引用实测值一致（PR/ADR 计数逐仓命中）', [env.pr_ratio.github_pr_total, as.pr_ratio.github_pr_total, jh.pr_ratio.github_pr_total].every((v) => rep.includes(String(v))) && rep.includes(String(as.adr.count)) && rep.includes(String(jh.adr.count)) && rep.includes(String(env.adr.count)), `env_pr=${env.pr_ratio.github_pr_total} as_pr=${as.pr_ratio.github_pr_total} jh_pr=${jh.pr_ratio.github_pr_total} adr=${env.adr.count}/${as.adr.count}/${jh.adr.count}`);
  t('E5 报告引用 37-pilot-measurements.json + Pilot-surface Audit 三问', rep.includes('37-pilot-measurements.json') && /capacity/.test(rep) && /ground-truth|ground truth/.test(rep) && /泛化/.test(rep), '');
  t('E6 报告含 evidence 锚形态（docs/adr/ 或 commit sha 或度量值引用）', /docs\/adr\/|sha|commit|证据锚/.test(rep), '');
}

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
