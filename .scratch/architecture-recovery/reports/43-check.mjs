// 43-check.mjs — #43 样例 golden CI 守卫（R5-12 / A-048 / D-030③）
// 断言面：golden-ci workflow 在位且两腿（engine golden + examples 冻结重渲染）齐备
//   → 重生成命令与 examples README 所录逐字一致 → diff 非零即 fail 机械件在位
//   → 禁自动回写（无 commit/push/writeback action）→ bundle/overlay 传输件完整可解
//   → 本机模拟 diff 正误两态（冻结工作树实跑四件逐字节一致＋tmp 篡改必检出）
// 纪律：实跑产物只写 os.tmpdir()（冻结 worktree 在临时目录，用完即除）；仓内状态善后——
//   bundle unbundle 写入的 loose objects 留本仓 .git 由 gc 回收（不强行 prune），产物 ref
//   refs/frozen/first-report 在 C 段 finally 中 update-ref -d 删除（断言成败均走清理路径）。
//   exit 0 + PASS N/N 为绿。
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const WF = join(REPO, '.github', 'workflows', 'golden-ci.yml');
const EX = join(REPO, 'examples', 'first-report');
const GOLDEN = join(REPO, 'engine', 'fixtures', 'golden');
const BUNDLE = join(HERE, '23-frozen-fc00d458.bundle');
const OVERLAY = join(HERE, '23-frozen-readme-overlay.md');
const FROZEN_SHA = 'fc00d458e215cc9a7a26af81626dec8712622821';
const GEN_COMMIT = 'e39468c9c53d32694f2ef9153b79eae018ea6b44';
const FOUR = ['23-first-report.md', '23-first-report.json', '23-first-report-failure.md', '23-first-report-failure.json'];
const GOLDEN_FILES = ['report.md', 'report.json', 'demo-measurements.json', 'demo-facts.jsonl'];
const SCENARIOS = ['happy-path', 'degraded-supply', 'degraded-incomplete'];

const tmp = mkdtempSync(join(tmpdir(), '43-check-'));
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function git(args) { return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
function sha(p) { return createHash('sha256').update(readFileSync(p)).digest('hex'); }
function tokenize(text) { const lower = text.toLowerCase(); const out = []; const ascii = lower.match(/[a-z][a-z0-9_+-]*/g) || []; for (const w of ascii) { if (w.length >= 2) { out.push(w); } } const cjk = lower.match(/[一-鿿]+/g) || []; for (const run of cjk) { for (let i = 0; i + 1 < run.length; i++) { out.push(run.slice(i, i + 2)); } } return out; }

// ---------- A. workflow 文件面 ----------
const wf = existsSync(WF) ? readFileSync(WF, 'utf8') : '';
t('A1 golden-ci.yml 在位且含 golden job（ubuntu-latest）', wf.indexOf('name: golden-ci') >= 0 && wf.indexOf('golden:') >= 0 && wf.indexOf('runs-on: ubuntu-latest') >= 0);
t('A2 两腿重渲染命令落位（gen-demo-golden + 23-first-report.mjs）', wf.indexOf('node scripts/gen-demo-golden.mjs') >= 0 && wf.indexOf('node .scratch/architecture-recovery/reports/23-first-report.mjs') >= 0);
const exReadme = readFileSync(join(EX, 'README.md'), 'utf8');
const regenCmd = (exReadme.match(/重生成命令\*\*：(`[^`]+`)/) || [])[1];
t('A3 重生成命令与 #41a 披露 README 逐字一致', !!regenCmd && wf.indexOf(regenCmd.slice(1, -1)) >= 0, 'README cmd=' + regenCmd);
t('A4 diff fail 机械件齐备（cmp -s / git status --porcelain / ::error / exit 1 / git diff）', wf.indexOf('cmp -s') >= 0 && wf.indexOf('git status --porcelain') >= 0 && wf.indexOf('::error') >= 0 && wf.indexOf('exit 1') >= 0 && wf.indexOf('git diff') >= 0);
t('A5 禁自动回写：无 git commit/push/writeback action/写权限', wf.indexOf('git commit') < 0 && wf.indexOf('git push') < 0 && wf.indexOf('git-auto-commit') < 0 && wf.indexOf('stefanzweifel') < 0 && wf.indexOf('create-pull-request') < 0 && wf.indexOf('contents: write') < 0 && wf.indexOf('contents: read') >= 0);
t('A6 纪律明文：PR 审查 + 禁自动重生成直通 main + snapshot 纪律在注释', wf.indexOf('PR 审查') >= 0 && wf.indexOf('自动重生成直通 main') >= 0 && wf.indexOf('snapshot 纪律') >= 0);
t('A7 冻结物化面齐备（bundle unbundle / worktree add / 双 sha / overlay cp / fetch-depth 0 / node 24）', wf.indexOf('git bundle unbundle') >= 0 && wf.indexOf('git worktree add') >= 0 && wf.indexOf(FROZEN_SHA) >= 0 && wf.indexOf(GEN_COMMIT) >= 0 && wf.indexOf('23-frozen-readme-overlay.md') >= 0 && wf.indexOf('fetch-depth: 0') >= 0 && wf.indexOf('node-version: 24') >= 0);
t('A8 单平台裁定理由注释在位（矩阵/平台 关键词）', wf.indexOf('矩阵') >= 0 && wf.indexOf('eol=lf') >= 0);

// ---------- B. 传输与资产面 ----------
t('B1 冻结 bundle 在位且 verify 通过', existsSync(BUNDLE) && ((() => { const r = spawnSync('git', ['bundle', 'verify', BUNDLE], { cwd: REPO, encoding: 'utf8' }); return r.status === 0 && (r.stdout + r.stderr).indexOf('is okay') >= 0; })()));
const heads = git(['bundle', 'list-heads', BUNDLE]);
t('B2 bundle 头 = refs/frozen/first-report @ fc00d458 + 前置 200b344 在仓内', heads.indexOf(FROZEN_SHA + ' refs/frozen/first-report') >= 0 && (() => { try { git(['cat-file', '-e', '200b344ded9573c372ffa4a56baf35ecc433dd98^{commit}']); return true; } catch (e) { return false; } })());
t('B3 生成时点入库 commit e39468c 为 HEAD 祖先（overlay 源可达）', (() => { try { git(['merge-base', '--is-ancestor', GEN_COMMIT, 'HEAD']); return true; } catch (e) { return false; } })());
const ov = existsSync(OVERLAY) ? readFileSync(OVERLAY, 'utf8') : '';
const SIG = { md: 192, prompts: 64, handoffs: 53, issues: 53, blocked: 20, by: 20, mjs: 20, 'a-xxx': 19, '全部': 19, w3: 18, branch: 17, pass: 17, w2: 17, workflow: 17, 'architecture-recovery': 16, '复核': 16, '守卫': 16, '张票': 16, '覆盖': 16, '阻塞': 16 };
const oc = {}; for (const tk of tokenize(ov)) { oc[tk] = (oc[tk] || 0) + 1; }
t('B4 overlay README 等签名重构：top-20 关键词计数与 golden 签名逐项一致', existsSync(OVERLAY) && Object.keys(SIG).every(k => oc[k] === SIG[k]));
const raw = JSON.parse(git(['show', FROZEN_SHA + ':.scratch/architecture-recovery/reports/22-threshold-raw.json']));
const stop = new Set(raw.tc3_s1_coverage.stopwords.map(s => s.toLowerCase()));
const keys = Object.keys(oc).filter(k => !stop.has(k));
keys.sort((a, b) => { const d = oc[b] - oc[a]; if (d !== 0) return d; return a < b ? -1 : a > b ? 1 : 0; });
const GOLDEN_TOP20 = ['md', 'prompts', 'handoffs', 'issues', 'blocked', 'by', 'mjs', 'a-xxx', '全部', 'w3', 'branch', 'pass', 'w2', 'workflow', 'architecture-recovery', '复核', '守卫', '张票', '覆盖', '阻塞'];
t('B5 overlay top-20 词表与序与 golden 逐字一致（rank-21 边界 <16）', JSON.stringify(keys.slice(0, 20)) === JSON.stringify(GOLDEN_TOP20) && oc[keys[20]] < 16);
t('B6 examples 四件与 .scratch 原件逐字节一致（溯源链未漂移）', FOUR.every(f => sha(join(EX, f)) === sha(join(HERE, f))));
const man = JSON.parse(readFileSync(join(GOLDEN, 'manifest.json'), 'utf8'));
t('B7 engine golden manifest sha256 与实物一致（3 场景×4 件）', SCENARIOS.every(s => GOLDEN_FILES.every(f => man.scenarios[s].sha256[f] === sha(join(GOLDEN, s, f)))));

// ---------- C. 本机模拟 diff 正误两态 ----------
// unbundle 向本仓 .git 写 loose objects + refs/frozen/first-report——ref 善后走 finally（无论断言成败）；
// loose objects 不强行 prune，由 gc 回收。
const FW = join(tmp, 'frozen');
try {
git(['bundle', 'unbundle', BUNDLE]);
execFileSync('git', ['worktree', 'add', FW, FROZEN_SHA], { cwd: REPO, encoding: 'utf8' });
mkdirSync(join(FW, 'engine', 'src', 'report'), { recursive: true });
writeFileSync(join(FW, 'engine', 'src', 'report', 'generate.ts'), git(['show', GEN_COMMIT + ':engine/src/report/generate.ts']), 'utf8');
writeFileSync(join(FW, '.scratch', 'architecture-recovery', 'reports', '23-first-report.mjs'), git(['show', GEN_COMMIT + ':.scratch/architecture-recovery/reports/23-first-report.mjs']), 'utf8');
writeFileSync(join(FW, '.scratch', 'architecture-recovery', 'README.md'), ov, 'utf8');
const rr = spawnSync(process.execPath, ['.scratch/architecture-recovery/reports/23-first-report.mjs'], { cwd: FW, encoding: 'utf8', timeout: 300000 });
t('C1 冻结工作树重渲染 exit 0（逐字 README 命令）', rr.status === 0, (rr.stderr || rr.stdout || '').slice(0, 300));
t('C2 正态：重渲染四件与 examples/first-report 逐字节一致', FOUR.every(f => readFileSync(join(EX, f), 'utf8') === readFileSync(join(FW, '.scratch', 'architecture-recovery', 'reports', f), 'utf8')));
const tamperDir = join(tmp, 'tampered'); mkdirSync(tamperDir, { recursive: true });
for (const f of FOUR) { writeFileSync(join(tamperDir, f), readFileSync(join(EX, f)), 'utf8'); }
const bad = readFileSync(join(tamperDir, FOUR[1]), 'utf8');
writeFileSync(join(tamperDir, FOUR[1]), bad.replace('RCP-', 'RPX-'), 'utf8');
const redHits = FOUR.filter(f => readFileSync(join(tamperDir, f), 'utf8') !== readFileSync(join(FW, '.scratch', 'architecture-recovery', 'reports', f), 'utf8'));
t('C3 误态：篡改一件 → 同一 diff 逻辑必检出（命中差异文件）', redHits.length === 1 && redHits[0] === FOUR[1], JSON.stringify(redHits));
const goldCopy = join(tmp, 'golden-copy'); mkdirSync(goldCopy, { recursive: true });
execFileSync('cp', ['-r', join(GOLDEN, 'happy-path'), goldCopy], { encoding: 'utf8' });
const gfile = join(goldCopy, 'happy-path', 'report.md');
writeFileSync(gfile, readFileSync(gfile, 'utf8') + '\nTAMPERED\n', 'utf8');
t('C4 误态：engine golden 篡改 → byte diff 逻辑必检出', readFileSync(gfile, 'utf8') !== readFileSync(join(GOLDEN, 'happy-path', 'report.md'), 'utf8'));
execFileSync('git', ['worktree', 'remove', '--force', FW], { cwd: REPO, encoding: 'utf8' });
} finally {
  // 善后：worktree 兜底移除（成功路径上方已除，此处兜断言中断情形）＋ unbundle 产物 ref 删除
  try { execFileSync('git', ['worktree', 'remove', '--force', FW], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { /* 已移除或未建成——忽略（stderr 吞掉，成功路径上方已除） */ }
  try { git(['update-ref', '-d', 'refs/frozen/first-report']); } catch (e) { /* ref 不存在时忽略 */ }
}

// ---------- D. 文档与账本落文 ----------
const issue = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'issues', '43-sample-golden-ci.md'), 'utf8');
t('D1 issue#43 Status=done + 四 checklist 勾掉', issue.indexOf('done') >= 0 && (issue.match(/- \[x\]/g) || []).length >= 4);
t('D2 issue#43 Blocked-by 旧口径注记 D-038⑤ 修正', issue.indexOf('D-038') >= 0);
const archLedger = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'), 'utf8');
t('D3 A-048 账本行回写 done → implemented', /A-048[^\n]*done → implemented/.test(archLedger));
const wfDoc = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'), 'utf8');
t('D4 WORKFLOW §4 lessons 含 #43 样例 golden CI 条目', /#43/.test(wfDoc) && /golden/.test(wfDoc));
const nextRound = readFileSync(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'), 'utf8');
t('D5 next-round T14 ✅ DONE', /T14[^\n]*✅/.test(nextRound));
const backlog = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'), 'utf8');
t('D6 BACKLOG #43 行 ✅ 闭环', /\| #43[^\n]*✅/.test(backlog));
t('D7 examples README 含 CI 校验与更新纪律节', exReadme.indexOf('更新只走 PR 审查') >= 0 && exReadme.indexOf('golden-ci.yml') >= 0);
t('D8 43-report.md 在位且六段齐备', existsSync(join(HERE, '43-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(m => readFileSync(join(HERE, '43-report.md'), 'utf8').indexOf(m) >= 0));
const maReport = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('D9 macro-audit 日报含 #43 窗口节', existsSync(maReport) && readFileSync(maReport, 'utf8').indexOf('#43') >= 0);

rmSync(tmp, { recursive: true, force: true });
console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
