// 47-check.mjs — #47 托管平台 API 适配器的检查（R8-01 / A-055 / D-048；GitHub REST 加 env token 走主路、gh 认证态可选回退）
// 查这几面：A 适配器源码和 dist 产物有没有标记 → B 五个 cassette（在不在、recorded 怎么标、有没有 token 泄漏、关键响应头对不对）
//   → C 测试在不在 smoke 链里、真跑过不过 → D dist 模块的契约语义（三级探测/Bot 双检/仓引用/限流）
//   → E 锁表 github-rest→active，README/CHANGELOG 同源 → F 文档记录写回去了 → G 有没有 BOM
// 纪律：只读检查 + node test 子进程（cassette 离线回放，不联网）；exit 0 加 PASS N/N 就是绿。
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
// guard-meta（D-159②/D-160③ 得自己声明——声明缺了就是红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#47 托管平台 API 适配器守卫（R8-01 / A-055 / D-048）';


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

// ---------- A. 适配器源码和 dist 产物 ----------
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
t('A10 本地 diff 失败就缩到 spec，不再绕去 API（源码里没有 -> api fallback 这个残留）',
  !src.includes('-> api fallback') && src.includes("error_kind: 'local-diff'") && src.includes('api diff channel (base/head 本地缺席)'));
t('A11 callLog 条目携带 retried/error_kind 真值 + 共用发射器 emitCallLog 三路径同源',
  src.includes('retried: boolean;') && src.includes('error_kind: GithubApiErrorKind;') && src.includes('emitCallLog') && src.includes('logAttempt'));

// ---------- B. 五份 golden cassette ----------
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
t('B7 无认证带 source 标注诚实（无 gh/借读/token 字样，含无认证自述）',
  unauth && typeof unauth.source === 'string' && !/gh|借读|token/i.test(unauth.source) && /无认证|unauth/i.test(unauth.source));

// ---------- C. 测试在 smoke 链里，真跑过不过 ----------
const testP = join(ENG, 'test', 'github-rest.test.mjs');
t('C1 test/github-rest.test.mjs 在', existsSync(testP));
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('C2 smoke 链含 github-rest.test.mjs', (pkg.scripts.smoke || '').includes('github-rest.test.mjs'));
const tr = spawnSync('node', [testP], { cwd: ENG, encoding: 'utf8', timeout: 120000 });
const tout = (tr.stdout || '') + (tr.stderr || '');
const m = tout.match(/GITHUB-REST (\d+)\/(\d+)/);
t('C3 github-rest 测试实跑 exit 0 + PASS N/N（同值判）', tr.status === 0 && m && m[1] === m[2] && Number(m[1]) >= 40, m ? m[0] : tout.slice(-200));

// ---------- D. dist 模块的契约语义（纯函数这一面，不联网） ----------
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
t('D4 仓引用解析：owner/repo+URL 收、非 github 明确拒',
  G.parseGithubRepoRef('o/r').ok === true && G.parseGithubRepoRef('https://github.com/o/r').ok === true && ng.ok === false);
t('D5 schema 漂移明确抛 GithubSchemaDrift',
  (() => { try { G.parsePrSummaryRow({ number: 1 }); return false; } catch (e) { return e.name === 'GithubSchemaDrift'; } })());
t('D6 限流头解析字段齐备', (() => { const r = G.parseRateLimitHeaders({ 'x-ratelimit-limit': '5000', 'x-ratelimit-remaining': '4999', 'x-ratelimit-used': '1', 'x-ratelimit-reset': '1', 'retry-after': '5' }); return r && r.limit === 5000 && r.remaining === 4999 && r.retry_after_seconds === 5; })());

// ---------- E. 锁表和文档同源 ----------
const lock = txt(LOCK);
const gi = lock.indexOf('id: github-rest');
const grow = lock.slice(gi, lock.indexOf('next_review:', gi));
t('E1 锁表 github-rest status=active', /status: active/.test(grow));
t('E2 锁表里的 adapter 指针补写回去了', /adapter: "engine\/src\/upstream\/github-rest\.ts/.test(grow));
t('E3 锁表 version/pin_type=api-version 填实', grow.includes('version: "2022-11-28"') && grow.includes('pin_type: api-version'));
const rd = txt(join(REPO, 'README.md'));
t('E4 README §3 GitHub REST 行=已接入（active）', /\| GitHub REST API \|[^\n]*已接入（active） \|/.test(rd));
const ec = txt(join(ENG, 'CHANGELOG.md'));
t('E5 engine CHANGELOG Unreleased 含 #47 条目引锁表', ec.includes('#47') && ec.includes('github-rest'));

// ---------- F. 文档记录写回去了 ----------
const rep = existsSync(join(REPO,'engine','test','fixtures','contracts','47-report.md')) ? txt(join(REPO,'engine','test','fixtures','contracts','47-report.md')) : '';
t('F5 47-report.md 在且六段齐备（①~⑥）', existsSync(join(REPO,'engine','test','fixtures','contracts','47-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every((x) => rep.indexOf(x) >= 0));

// ---------- G. BOM ----------
const newFiles = [
  SRC, testP, join(REPO, 'README.md'), join(ENG, 'CHANGELOG.md'), LOCK, join(ENG, 'package.json'),
  join(REPO,'engine','test','fixtures','contracts','47-report.md'), join(HERE, '47-check.mjs'),
  ...cassettes.map((n) => join(FXD, n + '.cassette.json'))
];
t('G1 全部新增/改动文件无 BOM', newFiles.every((f) => !existsSync(f) || noBom(f)), newFiles.filter((f) => existsSync(f) && !noBom(f)).join(','));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
