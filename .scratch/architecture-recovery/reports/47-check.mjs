// 47-check.mjs — #47 托管平台 API 适配器守卫（R8-01 / A-055 / D-048 / ADR-0020）
// 断言面：A 适配器源+dist 产物标记 → B 五 cassette（存在/recorded 标注/token 泄漏扫描/关键响应头）
//   → C 测试在 smoke 链且实跑 PASS → D dist 模块契约语义（三级探测/Bot 双检/仓引用/限流）
//   → E 锁表 github-rest→active＋README/CHANGELOG 同源 → F 文档账本回写 → G BOM
// 纪律：只读断言 + node test 子进程（cassette 离线回放，零网络）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const SRC = join(ENG, 'src', 'upstream', 'github-rest.ts');
const DIST = join(ENG, 'dist', 'upstream', 'github-rest.js');
const FXD = join(ENG, 'test', 'fixtures', 'github-rest');
const LOCK = join(ENG, 'upstream-lock.yaml');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. 适配器源 + dist 产物 ----------
t('A1 src/upstream/github-rest.ts 在', existsSync(SRC));
const src = existsSync(SRC) ? txt(SRC) : '';
t('A2 API 版本常量 pin=2022-11-28', src.includes("GITHUB_API_VERSION = '2022-11-28'"));
t('A3 凭据三级探测标记（GITHUB_TOKEN env / gh auth token / unauthenticated 降级）',
  src.includes('GITHUB_TOKEN') && src.includes("'auth', 'token'") && src.includes('unauthenticated'));
t('A4 限流面（x-ratelimit-* + retry-after + 触顶即停文案）',
  src.includes('x-ratelimit-limit') && src.includes('retry-after') && src.includes('primary rate limit exhausted'));
t('A5 Bot 双检函数（platformDeclaredBot：type==Bot + [bot] 后缀）',
  src.includes('platformDeclaredBot') && src.includes('\\[bot\\]'));
t('A6 diff 双通道（local-git + api；base...head 三点）',
  src.includes('local-git') && src.includes('api') && src.includes("'...'"));
t('A7 planned 面登记（pulls.reviews/comments 不入最小集）',
  src.includes('pulls.reviews') && src.includes('pulls.comments'));
t('A8 raw 响应不出边界 + 凭据不建存储文案', src.includes('credential_storage') || src.includes('即用即清'));
t('A9 dist/upstream/github-rest.js 编译产物在（测试作用于 dist）', existsSync(DIST));

// ---------- B. golden cassette ×5 ----------
const cassettes = ['authenticated', 'unauthenticated-degraded', 'rate-limit-exhausted', 'schema-drift', 'platform-bot'];
t('B1 五 cassette 全在', cassettes.every((n) => existsSync(join(FXD, n + '.cassette.json'))));
const casObjs = cassettes.map((n) => (existsSync(join(FXD, n + '.cassette.json')) ? JSON.parse(txt(join(FXD, n + '.cassette.json'))) : null));
t('B2 每带 calls>=1 且 recorded 标注合法（real/derived/synthetic）',
  casObjs.every((c) => c && Array.isArray(c.calls) && c.calls.length >= 1 && ['real', 'derived', 'synthetic'].includes(c.recorded)));
const allCasTxt = casObjs.map((c) => (c ? JSON.stringify(c) : '')).join('');
t('B3 带内零 token 泄漏（gho_/ghp_/github_pat_/Bearer 实值）', !/(gho_|ghp_|ghu_|ghs_|ghr_|github_pat_)/.test(allCasTxt));
const unauth = casObjs[1];
t('B4 无认证带=真实 60/h 响应头', unauth && unauth.calls[0].response.headers['x-ratelimit-limit'] === '60');
const rl = casObjs[2];
t('B5 限流带含 retry-after + remaining=0 耗尽帧',
  rl && rl.calls.some((c) => c.response.headers['retry-after']) && rl.calls.some((c) => c.response.headers['x-ratelimit-remaining'] === '0'));
const drift = casObjs[3];
t('B6 漂移带=实录制派生（derived）且行缺字段', drift && drift.recorded === 'derived');

// ---------- C. 测试入 smoke 链且实跑 PASS ----------
const testP = join(ENG, 'test', 'github-rest.test.mjs');
t('C1 test/github-rest.test.mjs 在', existsSync(testP));
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('C2 smoke 链含 github-rest.test.mjs', (pkg.scripts.smoke || '').includes('github-rest.test.mjs'));
const tr = spawnSync('node', [testP], { cwd: ENG, encoding: 'utf8', timeout: 120000 });
const tout = (tr.stdout || '') + (tr.stderr || '');
const m = tout.match(/GITHUB-REST (\d+)\/(\d+)/);
t('C3 github-rest 测试实跑 exit 0 + PASS N/N（同值判）', tr.status === 0 && m && m[1] === m[2] && Number(m[1]) >= 40, m ? m[0] : tout.slice(-200));

// ---------- D. dist 模块契约语义（纯函数面，零网络） ----------
const G = await import(pathToFileURL(DIST).href);
t('D1 凭据三级探测纯函数：env-token/gh-token/unauthenticated 三态可达',
  G.resolveGithubCredential({ GITHUB_TOKEN: 'X' }, () => ({ available: false, token: null })).strategy === 'env-token' &&
  G.resolveGithubCredential({}, () => ({ available: true, token: 'X' })).strategy === 'gh-token' &&
  G.resolveGithubCredential({}, () => ({ available: false, token: null })).strategy === 'unauthenticated');
t('D2 无认证降级 degraded=true + 60/h 披露',
  (() => { const r = G.resolveGithubCredential({}, () => ({ available: false, token: null })); return r.degraded === true && r.disclosures.join('|').includes('60'); })());
t('D3 Bot 双检真值表（缺一即 false）',
  G.platformDeclaredBot('dependabot[bot]', 'Bot') === true &&
  G.platformDeclaredBot('internal-ci', 'Bot') === false &&
  G.platformDeclaredBot('custom[bot]', 'User') === false);
const ng = G.parseGithubRepoRef('https://gitlab.com/a/b');
t('D4 仓引用解析：owner/repo+URL 收、非 github 显式拒',
  G.parseGithubRepoRef('o/r').ok === true && G.parseGithubRepoRef('https://github.com/o/r').ok === true && ng.ok === false);
t('D5 schema 漂移显式抛 GithubSchemaDrift',
  (() => { try { G.parsePrSummaryRow({ number: 1 }); return false; } catch (e) { return e.name === 'GithubSchemaDrift'; } })());
t('D6 限流头解析字段齐备', (() => { const r = G.parseRateLimitHeaders({ 'x-ratelimit-limit': '5000', 'x-ratelimit-remaining': '4999', 'x-ratelimit-used': '1', 'x-ratelimit-reset': '1', 'retry-after': '5' }); return r && r.limit === 5000 && r.remaining === 4999 && r.retry_after_seconds === 5; })());

// ---------- E. 锁表 + 文档同源 ----------
const lock = txt(LOCK);
const gi = lock.indexOf('id: github-rest');
const grow = lock.slice(gi, lock.indexOf('next_review:', gi));
t('E1 锁表 github-rest status=active', /status: active/.test(grow));
t('E2 锁表 adapter 指针回填', /adapter: "engine\/src\/upstream\/github-rest\.ts/.test(grow));
t('E3 锁表 version/pin_type=api-version 填实', grow.includes('version: "2022-11-28"') && grow.includes('pin_type: api-version'));
const rd = txt(join(REPO, 'README.md'));
t('E4 README §3 GitHub REST 行=已接入（active）', /\| GitHub REST API \|[^\n]*已接入（active） \|/.test(rd));
const ec = txt(join(ENG, 'CHANGELOG.md'));
t('E5 engine CHANGELOG Unreleased 含 #47 条目引锁表', ec.includes('#47') && ec.includes('github-rest'));

// ---------- F. 文档账本回写 ----------
const issueP = join(REPO, '.scratch', 'architecture-recovery', 'issues', '47-github-rest-adapter.md');
t('F1 票档三件套在（issues/prompts/handoffs/47-*）',
  existsSync(issueP) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '47-github-rest-adapter.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '47-github-rest-adapter.md')));
const led = txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'));
t('F2 A-055 行在且标 implemented', /\| A-055 \|[^\n]*implemented/.test(led));
const bl = txt(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('F3 BACKLOG #47 行回写闭环 ✅', /\| #47[^\n]*✅/.test(bl));
const wf = txt(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'));
t('F4 WORKFLOW §4 lessons 含 #47 条目', /#47/.test(wf));
const rep = existsSync(join(HERE, '47-report.md')) ? txt(join(HERE, '47-report.md')) : '';
t('F5 47-report.md 在且六段齐备（①~⑥）', existsSync(join(HERE, '47-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every((x) => rep.indexOf(x) >= 0));
const ma = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('F6 macro-audit 日报含 #47 窗口节', existsSync(ma) && txt(ma).indexOf('窗口：#47') >= 0);
const issue = existsSync(issueP) ? txt(issueP) : '';
t('F7 issue Status=done', /Status:\*\* done/.test(issue));

// ---------- G. BOM ----------
const newFiles = [
  SRC, testP, join(REPO, 'README.md'), join(ENG, 'CHANGELOG.md'), LOCK, join(ENG, 'package.json'),
  issueP,
  join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '47-github-rest-adapter.md'),
  join(REPO, '.scratch', 'architecture-recovery', 'prompts', '47-github-rest-adapter.md'),
  join(HERE, '47-report.md'), join(HERE, '47-check.mjs'),
  ...cassettes.map((n) => join(FXD, n + '.cassette.json'))
];
t('G1 全部新增/改动文件无 BOM', newFiles.every((f) => !existsSync(f) || noBom(f)), newFiles.filter((f) => existsSync(f) && !noBom(f)).join(','));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
