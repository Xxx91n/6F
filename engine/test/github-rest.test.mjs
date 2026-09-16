// github-rest.test.mjs — GitHub REST 适配器 golden cassette 契约测试（ADR-0014 同款回放模式 / D-048 / #47）
// 全离线：cassette 回放真实录制响应（fixtures/github-rest/），不打真网络；占位 token 断言永不进 fact。
// 覆盖 D-048 五面：认证态 / 无认证降级 / 限流耗尽 / schema 漂移 / 平台声明 Bot + diff 双通道 + 凭据三级探测。
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const G = await import(pathToFileURL(join(root, 'dist', 'upstream', 'github-rest.js')).href);
const fx = (n) => JSON.parse(readFileSync(join(HERE, 'fixtures', 'github-rest', n), 'utf8'));

const CTX = { runId: 'test-run', traceId: '00000000000000000000000000000000', repoRef: 'Xxx91n/env-manager', scale: 'Micro-A', observedAt: '2026-09-16T00:00:00.000Z' };
const noGh = () => ({ available: false, token: null });

function cassetteFetcher(cassette, captured) {
  let i = 0;
  return async (req) => {
    captured.push(req);
    if (i >= cassette.calls.length) { throw new Error('cassette exhausted at ' + req.url); }
    const c = cassette.calls[i++];
    assert.equal(req.method, c.request.method);
    assert.ok(req.url.endsWith(c.request.path), 'path mismatch: ' + req.url + ' vs ' + c.request.path);
    assert.equal(req.accept, c.request.accept || 'application/vnd.github+json');
    return { status: c.response.status, headers: c.response.headers || {}, body: typeof c.response.body === 'string' ? c.response.body : JSON.stringify(c.response.body) };
  };
}
const byMetric = (facts, m) => facts.filter((f) => f.metric === m);
const val = (f) => JSON.parse(f.value_json);

const results = [];
const check = (name, pass, detail) => { results.push([name, !!pass, detail || '']); };

// --- R 凭据三级探测 ---
const r1 = G.resolveGithubCredential({ GITHUB_TOKEN: 'ENVTOK-PLACEHOLDER' }, noGh);
check('R1 env token → env-token 主路', r1.strategy === 'env-token' && r1.degraded === false);
const r2 = G.resolveGithubCredential({}, () => ({ available: true, token: 'GHTOK-PLACEHOLDER' }));
check('R2 gh 已认证态借读 → gh-token 可选回退', r2.strategy === 'gh-token' && r2.degraded === false);
const r3 = G.resolveGithubCredential({}, noGh);
check('R3 无凭据 → unauthenticated 显式降级', r3.strategy === 'unauthenticated' && r3.degraded === true);
check('R4 降级披露含 60/h + 私仓 token 必需', r3.disclosures.join('|').includes('60') && r3.disclosures.join('|').includes('token'), JSON.stringify(r3.disclosures));
check('R5 gh 存在但 token 空 → 降级不误借', G.resolveGithubCredential({}, () => ({ available: true, token: null })).strategy === 'unauthenticated');

// --- B 平台声明 Bot 双检真值表 ---
check('B1 dependabot[bot]/Bot → true', G.platformDeclaredBot('dependabot[bot]', 'Bot') === true);
check('B2 internal-ci/Bot（无 [bot]）→ false', G.platformDeclaredBot('internal-ci', 'Bot') === false);
check('B3 custom[bot]/User → false', G.platformDeclaredBot('custom[bot]', 'User') === false);
check('B4 Xxx91n/User → false', G.platformDeclaredBot('Xxx91n', 'User') === false);

// --- A authenticated cassette（真实录制 env-manager 62 PRs） ---
{
  const cas = fx('authenticated.cassette.json');
  const cap = [];
  const r = await G.collectGithubPrFacts('Xxx91n', 'env-manager', {
    env: { GITHUB_TOKEN: 'ENVTOK-PLACEHOLDER' }, ghTokenProbe: noGh,
    fetcher: cassetteFetcher(cas, cap), details: [64, 51], diffs: [64]
  }, CTX);
  check('A1 PR 枚举 62 条全列', r.prs_listed === 62, 'prs=' + r.prs_listed);
  check('A2 strategy=env-token', r.strategy === 'env-token');
  const res = val(byMetric(r.facts, 'github_rest.resolution')[0]);
  check('A3 resolution 事实：api_version pin + planned 面登记', res.api_version === '2022-11-28' && res.planned_surfaces.includes('pulls.reviews'));
  check('A4 rate_limit 运行日志事实=每调用一条（4 calls）', byMetric(r.facts, 'github_rest.rate_limit').length === 4);
  const rl0 = val(byMetric(r.facts, 'github_rest.rate_limit')[0]);
  check('A5 余额字段齐备（limit/remaining/used/reset）', rl0.limit === 5000 && typeof rl0.remaining === 'number' && typeof rl0.used === 'number' && typeof rl0.reset_epoch === 'number', JSON.stringify(rl0));
  const summaries = byMetric(r.facts, 'github_rest.pr_summary');
  check('A6 pr_summary 事实 62 条', summaries.length === 62);
  const expectedBots = cas.calls[0].response.body.filter((x) => x.user && x.user.type === 'Bot' && /\[bot\]$/i.test(x.user.login)).length;
  check('A7 bot_declared 计数与录制真值一致（' + expectedBots + '）', summaries.filter((f) => val(f).bot_declared).length === expectedBots);
  check('A8 bot_basis 平台声明措辞在', summaries.every((f) => val(f).bot_basis === 'platform-declared:user.type==Bot&&login~[bot]'));
  const m64 = byMetric(r.facts, 'github_rest.pr_metadata').map(val).find((v) => v.number === 64);
  check('A9 detail #64 merged=true + changed_files=2', m64 && m64.merged === true && m64.changed_files === 2);
  const d64 = byMetric(r.facts, 'github_rest.pr_diff').map(val).find((v) => v.number === 64);
  check('A10 diff #64 → api 通道（本地缺席兜底）+bytes>1000', d64 && d64.channel === 'api' && d64.bytes > 1000, d64 ? String(d64.bytes) : 'missing');
  const run = val(byMetric(r.facts, 'github_rest.run')[0]);
  check('A11 run 汇总 calls=4/errors=0/stopped=null', run.calls === 4 && run.errors === 0 && run.stopped_reason === null, JSON.stringify(run));
  check('A12 token 入 wire（fetcher 收到），不进任何 fact', cap.every((q) => q.token === 'ENVTOK-PLACEHOLDER') && !JSON.stringify(r.facts).includes('ENVTOK-PLACEHOLDER'));
}

// --- D diff 本地 git 优先通道 ---
{
  const tmp = mkdtempSync(join(tmpdir(), 'ghrest-local-'));
  const repo = join(tmp, 'r');
  mkdirSync(repo, { recursive: true });
  const git = (a) => spawnSync('git', a, { cwd: repo, encoding: 'utf8' });
  git(['init', '-q']); git(['config', 'user.email', 't@t']); git(['config', 'user.name', 't']);
  writeFileSync(join(repo, 'a.txt'), 'a1\n');
  git(['add', 'a.txt']); git(['commit', '-qm', 'c1']);
  const base = git(['rev-parse', 'HEAD']).stdout.trim();
  writeFileSync(join(repo, 'a.txt'), 'a1\na2\n'); writeFileSync(join(repo, 'b.txt'), 'b\n');
  git(['add', '-A']); git(['commit', '-qm', 'c2']);
  const head = git(['rev-parse', 'HEAD']).stdout.trim();
  const client = G.createGithubRestClient({ strategy: 'unauthenticated', token: null, degraded: true, disclosures: [] }, { fetcher: async () => { throw new Error('must-not-call'); } });
  const d = await G.resolvePrDiff(client, 'o', 'r', 1, base, head, repo);
  check('D1 本地 sha 可解 → local-git 通道', d.ok && d.channel === 'local-git');
  check('D2 local diff 文本含 diff --git', d.text.includes('diff --git'));
  check('D3 numstat 解析 files=2 additions≥1', d.stats.files_changed === 2 && (d.stats.additions || 0) >= 1, JSON.stringify(d.stats));
  check('D4 本地通道零 API 调用', client.callLog.length === 0);
  const cas = fx('authenticated.cassette.json');
  const cap = [];
  const client2 = G.createGithubRestClient({ strategy: 'env-token', token: 'T', degraded: false, disclosures: [] }, { fetcher: cassetteFetcher({ name: 'one', calls: [cas.calls[3]] }, cap) });
  const d2 = await G.resolvePrDiff(client2, 'Xxx91n', 'env-manager', 64, 'deadbeef'.repeat(5), 'feedbeef'.repeat(5), repo);
  check('D5 sha 本地缺席 → api 兜底通道', d2.ok && d2.channel === 'api' && d2.text.length > 1000);
  check('D6 api 兜底确实产生了调用', client2.callLog.length === 1);
  // spec 收窄：sha 双解但本地 diff 失败（orphan 分支无 merge-base）→ 如实降级，不静默改道 API
  git(['checkout', '-q', '--orphan', 'orph']);
  git(['reset', '-q']); writeFileSync(join(repo, 'o.txt'), 'o\n');
  git(['add', 'o.txt']); git(['commit', '-qm', 'oc']);
  const orphanSha = git(['rev-parse', 'HEAD']).stdout.trim();
  const client3 = G.createGithubRestClient({ strategy: 'env-token', token: 'T', degraded: false, disclosures: [] }, { fetcher: async () => { throw new Error('must-not-call'); } });
  const d3 = await G.resolvePrDiff(client3, 'o', 'r', 9, base, orphanSha, repo);
  check('D7 本地可解但 diff 失败 → local-git 降级不兜底 API', d3.ok === false && d3.channel === 'local-git' && d3.error_kind === 'local-diff' && client3.callLog.length === 0, JSON.stringify(d3).slice(0, 200));
  rmSync(tmp, { recursive: true, force: true });
}

// --- U unauthenticated-degraded cassette ---
{
  const cas = fx('unauthenticated-degraded.cassette.json');
  const r = await G.collectGithubPrFacts('Xxx91n', 'env-manager', { env: {}, ghTokenProbe: noGh, fetcher: cassetteFetcher(cas, []) }, CTX);
  check('U1 降级态 strategy=unauthenticated + degraded', r.strategy === 'unauthenticated' && r.degraded === true);
  check('U2 降级下枚举仍产出 62 条', r.prs_listed === 62);
  const rl = val(byMetric(r.facts, 'github_rest.rate_limit')[0]);
  check('U3 无认证限额 limit=60 如实进事实', rl.limit === 60);
}

// --- L rate-limit-exhausted cassette（synthetic） ---
{
  const cas = fx('rate-limit-exhausted.cassette.json');
  const sleeps = [];
  const r = await G.collectGithubPrFacts('Xxx91n', 'env-manager', {
    env: {}, ghTokenProbe: noGh, fetcher: cassetteFetcher(cas, []), sleeper: async (ms) => { sleeps.push(ms); }
  }, CTX);
  const lim = byMetric(r.facts, 'github_rest.rate_limited');
  check('L1 限流耗尽 → rate_limited 事实', lim.length === 1);
  check('L2 单次有界退避（sleep 1000ms ×1）', sleeps.length === 1 && sleeps[0] === 1000, JSON.stringify(sleeps));
  check('L3 触顶即停：calls=2 不硬重试循环', r.calls === 2);
  check('L4 rate_limited 事实 retried=true + reset_epoch 标注', val(lim[0]).retried === true && typeof val(lim[0]).reset_epoch === 'number');
  check('L5 stopped_reason 非空（报告可标注）', r.stopped_reason !== null && r.stopped_reason.length > 0);
  // primary 耗尽直停（remaining=0 第一响应即停，零重试）
  const r2 = await G.collectGithubPrFacts('Xxx91n', 'env-manager', {
    env: {}, ghTokenProbe: noGh,
    fetcher: async () => ({ status: 403, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1789573500', 'x-ratelimit-resource': 'core' }, body: '{}' })
  }, CTX);
  check('L6 remaining=0 首响应即停（calls=1 零重试）', r2.calls === 1 && byMetric(r2.facts, 'github_rest.rate_limited').length === 1);
  // diff 路径限流 → rate_limited 事实（非 api_error）；rate_limit 日志携带 error_kind/retried 真值
  const casA = fx('authenticated.cassette.json');
  const row64 = casA.calls[0].response.body.find((x) => x.number === 64);
  const cap3 = [];
  const r3 = await G.collectGithubPrFacts('Xxx91n', 'env-manager', {
    env: {}, ghTokenProbe: noGh,
    fetcher: cassetteFetcher({ name: 'diff-limited', calls: [
      { request: { method: 'GET', path: '/repos/Xxx91n/env-manager/pulls?state=all&per_page=100&page=1', accept: 'application/vnd.github+json' }, response: { status: 200, headers: casA.calls[0].response.headers, body: [row64] } },
      { request: { method: 'GET', path: '/repos/Xxx91n/env-manager/pulls/64', accept: 'application/vnd.github.diff' }, response: { status: 403, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1789573500', 'x-ratelimit-resource': 'core' }, body: '{}' } }
    ] }, cap3),
    diffs: [64]
  }, CTX);
  const limD = byMetric(r3.facts, 'github_rest.rate_limited');
  check('L7 diff 限流归类 rate_limited（非 api_error）', limD.length === 1 && byMetric(r3.facts, 'github_rest.api_error').length === 0);
  check('L8 diff 限流事实带 channel=api + retried 真值', val(limD[0]).channel === 'api' && val(limD[0]).retried === false);
  const rlFacts = byMetric(r3.facts, 'github_rest.rate_limit').map(val);
  check('L9 rate_limit 日志 error_kind 真值（次次响应 rate-limited）', rlFacts.length === 2 && rlFacts[1].error_kind === 'rate-limited' && rlFacts[0].error_kind === 'none');
}

// --- S schema-drift cassette ---
{
  const cas = fx('schema-drift.cassette.json');
  const r = await G.collectGithubPrFacts('Xxx91n', 'env-manager', { env: { GITHUB_TOKEN: 'T' }, ghTokenProbe: noGh, fetcher: cassetteFetcher(cas, []) }, CTX);
  const drift = byMetric(r.facts, 'github_rest.schema_drift');
  check('S1 漂移行显式报（2 条 schema_drift）', drift.length === 2, 'got ' + drift.length);
  check('S2 漂移事实列缺失字段（user / head.sha）', drift.some((f) => val(f).missing.join(',').includes('user')) && drift.some((f) => val(f).missing.join(',').includes('head.sha')));
  check('S3 好行照出不假阳性（#64 summary 在）', byMetric(r.facts, 'github_rest.pr_summary').length === 1);
  const run = val(byMetric(r.facts, 'github_rest.run')[0]);
  check('S4 run 汇总 schema_drift=2 errors=2', run.schema_drift === 2 && run.errors === 2);
}

// --- P platform-bot cassette ---
{
  const cas = fx('platform-bot.cassette.json');
  const r = await G.collectGithubPrFacts('Xxx91n', 'env-manager', { env: { GITHUB_TOKEN: 'T' }, ghTokenProbe: noGh, fetcher: cassetteFetcher(cas, []) }, CTX);
  const s = byMetric(r.facts, 'github_rest.pr_summary').map(val);
  const by = {}; s.forEach((v) => { by[v.number] = v.bot_declared; });
  check('P1 真实 bot 行判 Bot（#62 dependabot/#64 actions）', by[62] === true && by[64] === true);
  check('P2 人类行不判 Bot（#51）', by[51] === false);
  check('P3 边缘行双检缺一即 false（#901 无[bot]/#902 非Bot型）', by[901] === false && by[902] === false);
}

// --- E 仓引用解析 ---
check('E1 owner/repo → ok', (() => { const x = G.parseGithubRepoRef('Xxx91n/env-manager'); return x.ok && x.owner === 'Xxx91n' && x.repo === 'env-manager'; })());
check('E2 https URL → ok', G.parseGithubRepoRef('https://github.com/Xxx91n/env-manager').ok === true);
check('E3 .git 尾缀 → ok', G.parseGithubRepoRef('https://github.com/Xxx91n/env-manager.git').ok === true);
check('E4 git@ URL → ok', G.parseGithubRepoRef('git@github.com:Xxx91n/env-manager.git').ok === true);
const ng = G.parseGithubRepoRef('https://gitlab.com/a/b');
check('E5 非 github 托管显式拒', ng.ok === false && /unsupported/.test(ng.reason));

// --- K 常量钉死 ---
check('K1 X-GitHub-Api-Version pin=2022-11-28', G.GITHUB_API_VERSION === '2022-11-28');
check('K2 adapter id + family', G.GITHUB_REST_ADAPTER_ID === 'github-rest-adapter@v1' && G.GITHUB_REST_FAMILY === 'upstream-github-rest');
check('K3 planned 面登记（review/comment 不入最小集）', G.GITHUB_REST_PLANNED_SURFACES.includes('pulls.reviews') && G.GITHUB_REST_PLANNED_SURFACES.includes('pulls.comments'));

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) { ok = false; }
}
console.log(ok ? ('GITHUB-REST ' + results.length + '/' + results.length) : 'GITHUB-REST-FAIL');
process.exit(ok ? 0 : 1);
