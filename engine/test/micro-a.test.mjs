// micro-a.test.mjs —— #85② Micro-A 一等面测试（cassette 离线回放；github-rest.test.mjs 同型注入）
// 断言面：U 采集（适配器事实落 Micro-A scale＋token 永不入 fact）→ R 单 PR 报告（骨架交集＋披露块翻转＋判据 band）
//   → F 拒绝件（merged=0 intake 显式拒绝）→ C CLI 接线（本地路径/名册外仓结构化拒绝 exit 2——离线安全面）
// 纪律：cassette 回放零网络；golden 腿不落真工件（outDir 隔离跑完即弃）；CLI happy-path 真网络面不入离线 smoke（predecl §1.2 偏差⑥）。
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, '..', 'dist', 'cli.js');
const NL = String.fromCharCode(10);
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 240) : '')); } }
function parseErr(stderr) { try { return JSON.parse(stderr); } catch (e) { return null; } }

const MA = await import(pathToFileURL(join(HERE, '..', 'dist', 'audit', 'micro-a.js')).href);
const noGh = function () { return { available: false, token: null }; };
function cassetteFetcher(cas, cap) {
  let i = 0;
  return async function (req) {
    cap.push(req);
    if (i >= cas.calls.length) { throw new Error('cassette exhausted at ' + req.url); }
    const c = cas.calls[i++];
    if (req.method !== c.request.method) { throw new Error('method mismatch'); }
    if (!req.url.endsWith(c.request.path)) { throw new Error('path mismatch: ' + req.url + ' vs ' + c.request.path); }
    const acc = c.request.accept || 'application/vnd.github+json';
    if (req.accept !== acc) { throw new Error('accept mismatch'); }
    return { status: c.response.status, headers: c.response.headers || {}, body: typeof c.response.body === 'string' ? c.response.body : JSON.stringify(c.response.body) };
  };
}
const cas = JSON.parse(readFileSync(join(HERE, 'fixtures', 'github-rest', 'authenticated.cassette.json'), 'utf8'));
const casAug = { name: cas.name + '+microa-test', recorded: 'derived', calls: cas.calls.concat([cas.calls[3]]) };
const cap = [];
const shared = { env: { GITHUB_TOKEN: 'TEST-PLACEHOLDER' }, ghTokenProbe: noGh, fetcher: cassetteFetcher(casAug, cap) };
const runAt = MA.deterministicRunAt();
const tmp = mkdtempSync(join(tmpdir(), 'microa-test-'));
const outDir = join(tmp, 'out');
mkdirSync(outDir, { recursive: true });
const measName = 'audit-measurements.json';
const factsName = 'audit-facts.jsonl';

// ---------- U 采集（48 §4 collectTarget 同构） ----------
const t1 = { name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', root: null, pins: MA.MICRO_A_GOLDEN_PRS };
const collected = await MA.collectMicroA(t1, shared, MA.MICRO_A_GOLDEN_DIFFS, runAt);
t('U1 采集事实>0 且 scale=Micro-A', collected.res.facts.length > 0 && collected.res.facts.every(function (f) { return f.scale === 'Micro-A'; }), String(collected.res.facts.length));
t('U2 prs_listed>0＋strategy=env-token', collected.res.prs_listed > 0 && collected.res.strategy === 'env-token', collected.res.strategy);
t('U3 token 进 wire 不入 fact', cap.every(function (q) { return q.token === 'TEST-PLACEHOLDER'; }) && JSON.stringify(collected.res.facts).indexOf('TEST-PLACEHOLDER') < 0);
t('U4 ctx 契约（runId r48- 前缀＋traceId 32hex＋observedAt=runAt）', collected.ctx.runId.indexOf('r48-env-manager-') === 0 && new RegExp('^[0-9a-f]{32}$').test(collected.ctx.traceId) && collected.ctx.observedAt === runAt, collected.ctx.runId);
t('U5 切片字段契约 ≥20＋credential_strategy/diff_channel 在', Array.isArray(MA.MICRO_A_SLICE_FIELDS) && MA.MICRO_A_SLICE_FIELDS.length >= 20 && MA.MICRO_A_SLICE_FIELDS.indexOf('credential_strategy') >= 0 && MA.MICRO_A_SLICE_FIELDS.indexOf('diff_channel') >= 0, String(MA.MICRO_A_SLICE_FIELDS.length));
t('U6 骨架交集机械导出面在', typeof MA.skeletonIntersectionReport === 'function');

// ---------- R 单 PR 报告（PR64 golden 腿＋PR51 diff 缺席腿——48 goldenMain 同构） ----------
writeFileSync(join(outDir, measName), JSON.stringify({ repos: ['env-manager', 'goose-duck-agent'], prs_listed: collected.res.prs_listed }, null, 2) + NL, 'utf8');
writeFileSync(join(outDir, factsName), collected.res.facts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL, 'utf8');
const gateOK = { merged_prs: collected.mergedCount, eligible: true };
const r64 = await MA.buildPrReportMicroA(t1, { n: 64, form: 'machine-generated/release-please' }, collected, gateOK, shared, { golden: true, outDir: outDir, measName: measName, factsName: factsName });
t('R1 pr64 overall=supported', r64.overall === 'supported', r64.overall);
t('R2 pr64 form_actual=machine-generated/release-please merged=true', r64.form_actual === 'machine-generated/release-please' && r64.merged === true, r64.form_actual);
t('R3 pr64 diff_channel=api（root=null）＋artifact ok', r64.diff_channel === 'api' && r64.artifact.ok === true, JSON.stringify({ c: r64.diff_channel, ok: r64.artifact.ok }));
t('R4 pr64 骨架交集 OK', r64.skeleton.ok, r64.skeleton.missing.join(','));
t('R5 披露块翻转（capability 3 of 5 · preview＋not_in_preview=[Macro-A]）', (function () { const sc = JSON.parse(readFileSync(join(outDir, r64.outputs.sidecar), 'utf8')); return sc.preview_disclosure.capability_label === 'capability 3 of 5 · preview' && JSON.stringify(sc.preview_disclosure.not_in_preview) === JSON.stringify(['Macro-A']); })());
t('R6 fact_ids 三联（summary＋metadata＋diff）', r64.fact_ids.length === 3, JSON.stringify(r64.fact_ids));
t('R7 receipt RCP- 格式', new RegExp('^RCP-[0-9a-f]{16}$').test(r64.receipt), r64.receipt);
t('R8 报告文件双件在', existsSync(join(outDir, r64.outputs.md)) && existsSync(join(outDir, r64.outputs.sidecar)));
const r51 = await MA.buildPrReportMicroA(t1, { n: 51, form: 'human' }, collected, gateOK, shared, { golden: true, outDir: outDir, measName: measName, factsName: factsName });
t('R9 pr51 判据构建＋overall 三档域', ['supported', 'unsupported', 'insufficient'].indexOf(r51.overall) >= 0, r51.overall);
t('R10 pr51 form=human', r51.form_actual === 'human' && r51.form_match === true, r51.form_actual);

// ---------- F 拒绝件（48 §7 同构——zero-pr synthetic cassette） ----------
const zeroCas = { name: 'zero-pr-synthetic', recorded: 'synthetic', calls: [{ request: { method: 'GET', path: '/repos/Xxx91n/goose-duck-agent/pulls?state=all&per_page=100&page=1' }, response: { status: 200, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '59', 'x-ratelimit-used': '1', 'x-ratelimit-reset': '0', 'x-ratelimit-resource': 'core' }, body: [] } }] };
const sharedZ = { env: {}, ghTokenProbe: noGh, fetcher: cassetteFetcher(zeroCas, []) };
const gp = await MA.gateProbeMicroA({ name: 'goose-duck-agent', owner: 'Xxx91n', repo: 'goose-duck-agent' }, sharedZ, runAt);
t('F1 gate 闸 merged=0 eligible=false', gp.merged_prs === 0 && gp.eligible === false, 'merged=' + String(gp.merged_prs));
const rf = await MA.buildRefusalReportMicroA({ name: gp.name, owner: gp.owner, repo: gp.repo, headSha: gp.headSha, root: null, facts: gp.facts, ctx: gp.ctx }, sharedZ, { golden: false, outDir: outDir, measName: measName });
t('F2 拒绝件 overall=unsupported', rf.overall === 'unsupported', rf.overall);
t('F3 拒绝件语义（无托管 PR 面＋前置条件＋intake-refused 象限标记）', (function () { const md = readFileSync(join(outDir, rf.outputs.md), 'utf8'); const sc = JSON.parse(readFileSync(join(outDir, rf.outputs.sidecar), 'utf8')); return md.indexOf('无托管 PR 面') >= 0 && md.indexOf('前置条件') >= 0 && sc.quadrants.every(function (q) { return q.conflict_markers.indexOf('intake-refused') >= 0; }) && sc.adjudication.entries.some(function (e) { return e.criterion_id === 'TC-4' && e.band === 'unsupported'; }); })());

// ---------- C CLI 接线（离线安全面：input gate／scope gate 先于网络） ----------
const c1 = spawnSync('node', [CLI, 'audit', join(tmp, 'local-path'), '--scale', 'Micro-A'], { encoding: 'utf8' });
t('C1 本地路径 → exit 2 结构化 MICRO-A-INPUT', c1.status === 2 && (parseErr(c1.stderr) || {}).error === 'MICRO-A-INPUT', c1.stderr.slice(0, 140));
const c2 = spawnSync('node', [CLI, 'audit', 'Xxx91n/not-a-pilot-repo', '--scale', 'Micro-A'], { encoding: 'utf8' });
t('C2 名册外仓 → exit 2 MICRO-A-SCOPE（D-049③ 票面写死；先于网络）', c2.status === 2 && (parseErr(c2.stderr) || {}).error === 'MICRO-A-SCOPE', c2.stderr.slice(0, 140));
t('C3 MICRO-A-INPUT 载体带试点名册（message 内嵌——cli 泛型 catch 序列化面）', ((parseErr(c1.stderr) || {}).message || '').indexOf('Xxx91n/env-manager') >= 0);

try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(fail === 0 ? 'MICRO-A-TEST-OK ' + pass + '/' + (pass + fail) : 'MICRO-A-TEST-FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);