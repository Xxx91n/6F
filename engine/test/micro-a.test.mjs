// micro-a.test.mjs —— #85② Micro-A 一等面测试（cassette 离线回放；github-rest.test.mjs 同型注入）
// 断言面：U 采集（适配器事实落 Micro-A scale＋token 永不入 fact）→ R 单 PR 报告（骨架交集＋披露块翻转＋判据 band）
//   → F 拒绝件（merged=0 intake 显式拒绝）→ C CLI 接线（本地路径/名册外仓结构化拒绝 exit 2——离线安全面）
//   → S prereg 锚取值口径（浅克隆合成 fixture 正负对照——tracker #100／R9-1）。
// 纪律：cassette 回放零网络；golden 腿不落真工件（outDir 隔离跑完即弃）；CLI happy-path 真网络面不入离线 smoke（predecl §1.2 偏差⑥）。
import { spawnSync, execFileSync } from 'node:child_process';
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
const GR = await import(pathToFileURL(join(HERE, '..', 'dist', 'report', 'generate.js')).href);
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
// R11/R12 溯源串可解析（#29／ADR-0027：报告溯源串改指仓内 contract fixtures 与归档索引）——
//   gate_ref 两路径必须是本仓现行文件、且证据源零 .scratch；golden 再生见 48 契约件（48-check B4 齐备腿）。
const SELF = join(HERE, '..', '..');
const sc64 = JSON.parse(readFileSync(join(outDir, r64.outputs.sidecar), 'utf8'));
const gr64 = sc64.gate_ref || (sc64.receipt && sc64.receipt.gate_ref);
// 空串／缺字段必须判红：`join(SELF, '')` 会命中仓库根，existsSync 会把缺锚放行成通过
const grPath = function (s) { const p = String(s || '').split(' ')[0]; return p === '' ? null : p; };
const gateRefOk = function (g) {
  if (!g) return false;
  const a = grPath(g.criteria_path), b = grPath(g.basis_path);
  return !!a && !!b && !/\.scratch/.test(String(g.criteria_path) + String(g.basis_path))
    && existsSync(join(SELF, a)) && existsSync(join(SELF, b));
};
t('R11 gate_ref 溯源串可解析（criteria/basis 均仓内现行文件，零 .scratch；缺字段即红）', gateRefOk(gr64), JSON.stringify(gr64));
// 负对照喂的是**接线后的判定函数**（不是 helper）：缺 criteria_path／空串／已退役 .scratch 三态必须判红
// 反例必须**只差一个维度**：basis 用真实存在的锚，否则「路径不存在」会把断言替死（删掉被测断言仍绿）
const EXIST_ANCHOR = 'engine/test/fixtures/contracts/48-micro-a-criteria.md';
const SCRATCHY = './.scratch/../' + EXIST_ANCHOR;   // 字符串含 .scratch，归一化后仍指向该存在文件
t('R11-P 负对照：缺字段／空串／.scratch 三态各只差一维即判红（删任一断言此条即红）',
  gateRefOk({ criteria_path: EXIST_ANCHOR, basis_path: EXIST_ANCHOR }) === true      // 正对照：两锚干净时放行
  && gateRefOk(null) === false
  && gateRefOk({ basis_path: EXIST_ANCHOR }) === false                               // 仅缺 criteria_path
  && gateRefOk({ criteria_path: '', basis_path: EXIST_ANCHOR }) === false             // 仅 criteria 为空串
  && existsSync(join(SELF, SCRATCHY))                                                // 该路径真实可解析
  && gateRefOk({ criteria_path: SCRATCHY, basis_path: EXIST_ANCHOR }) === false       // 仅因 .scratch 判红
  && grPath(EXIST_ANCHOR + ' D-1') === EXIST_ANCHOR);
// 授权锚=EV(4) 票面授权锚＋EV(5) 判据预声明锚；条数钉死（filter 落空会让 .every 恒真——空集不构成正对照）
const anchors = sc64.evidence.filter(function (e) { return /-(04|05)$/.test(e.evidence_id); });
t('R12 证据源零退役 .scratch 且授权锚 grounded（EV(4)/EV(5) 恰两条，引文摘取成功）',
  anchors.length === 2 && anchors.every(function (e) { return e.grounded === true; })
  && sc64.evidence.every(function (e) { return String(e.source).indexOf('.scratch') < 0 && String(e.reproduce_cmd).indexOf('.scratch') < 0; }),
  JSON.stringify({ anchors: anchors.length, ungrounded: sc64.evidence.filter(function (e) { return e.grounded !== true; }).map(function (e) { return e.evidence_id + ':' + e.reproduce_absent_reason; }) }));
// grounded=true 只证明「摘到了某一行」，不证明是授权那一行——单 token 'D-049' 首先命中的是第 40 行「增量去向」索引条
const ev04 = anchors.filter(function (e) { return /-04$/.test(e.evidence_id); })[0];
const ev04Cells = String((ev04 && ev04.excerpt) || '').split('|');
t('R13 EV(4) 票面授权锚引文=归档账本 D-049 决策行本体（首格即 D-049）',
  !!ev04 && ev04Cells[1] !== undefined && ev04Cells[1].trim() === 'D-049',
  ev04 ? ev04.locator + ' :: ' + String(ev04.excerpt).slice(0, 60) : 'EV(4) absent');

// ---------- F 拒绝件（48 §7 同构——zero-pr synthetic cassette） ----------
const zeroCas = { name: 'zero-pr-synthetic', recorded: 'synthetic', calls: [{ request: { method: 'GET', path: '/repos/Xxx91n/goose-duck-agent/pulls?state=all&per_page=100&page=1' }, response: { status: 200, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '59', 'x-ratelimit-used': '1', 'x-ratelimit-reset': '0', 'x-ratelimit-resource': 'core' }, body: [] } }] };
const sharedZ = { env: {}, ghTokenProbe: noGh, fetcher: cassetteFetcher(zeroCas, []) };
const gp = await MA.gateProbeMicroA({ name: 'goose-duck-agent', owner: 'Xxx91n', repo: 'goose-duck-agent' }, sharedZ, runAt);
t('F1 gate 闸 merged=0 eligible=false', gp.merged_prs === 0 && gp.eligible === false, 'merged=' + String(gp.merged_prs));
const rf = await MA.buildRefusalReportMicroA({ name: gp.name, owner: gp.owner, repo: gp.repo, headSha: gp.headSha, root: null, facts: gp.facts, ctx: gp.ctx }, sharedZ, { golden: false, outDir: outDir, measName: measName });
t('F2 拒绝件 overall=unsupported', rf.overall === 'unsupported', rf.overall);
t('F3 拒绝件语义（无托管 PR 面＋前置条件＋intake-refused 象限标记）', (function () { const md = readFileSync(join(outDir, rf.outputs.md), 'utf8'); const sc = JSON.parse(readFileSync(join(outDir, rf.outputs.sidecar), 'utf8')); return md.indexOf('无托管 PR 面') >= 0 && md.indexOf('前置条件') >= 0 && sc.quadrants.every(function (q) { return q.conflict_markers.indexOf('intake-refused') >= 0; }) && sc.adjudication.entries.some(function (e) { return e.criterion_id === 'TC-4' && e.band === 'unsupported'; }); })());
// REF-03 是「硬约束锚」：claim 引的约束句在 D-033 立法行（账本 :88）；原单 token '无托管 PR 面' 首先命中的 D-049 行（:54）不含该句
t('F4 REF-03 硬约束锚落在 D-033 决策行本体（首格即 D-033）', (function () { const sc = JSON.parse(readFileSync(join(outDir, rf.outputs.sidecar), 'utf8')); const e = (sc.evidence || []).filter(function (x) { return /-REF-03$/.test(x.evidence_id); })[0]; if (!e) { return false; } const cells = String(e.excerpt).split('|'); return cells[1] !== undefined && cells[1].trim() === 'D-033'; })(), 'REF-03 absent 或首格非 D-033');

// ---------- C CLI 接线（离线安全面：input gate／scope gate 先于网络） ----------
const c1 = spawnSync('node', [CLI, 'audit', join(tmp, 'local-path'), '--scale', 'Micro-A'], { encoding: 'utf8' });
t('C1 本地路径 → exit 2 结构化 MICRO-A-INPUT', c1.status === 2 && (parseErr(c1.stderr) || {}).error === 'MICRO-A-INPUT', c1.stderr.slice(0, 140));
const c2 = spawnSync('node', [CLI, 'audit', 'Xxx91n/not-a-pilot-repo', '--scale', 'Micro-A'], { encoding: 'utf8' });
t('C2 名册外仓 → exit 2 MICRO-A-SCOPE（D-049③ 票面写死；先于网络）', c2.status === 2 && (parseErr(c2.stderr) || {}).error === 'MICRO-A-SCOPE', c2.stderr.slice(0, 140));
t('C3 MICRO-A-INPUT 载体带试点名册（message 内嵌——cli 泛型 catch 序列化面）', ((parseErr(c1.stderr) || {}).message || '').indexOf('Xxx91n/env-manager') >= 0);

// ---------- S prereg 锚取值口径（tracker #100／R9-1：浅克隆不得静默取到边界 commit） ----------
// 合成 fixture＝两枚 commit 的临时 git 仓：判据件落在 c1，c2 只改无关文件。
//   完整仓 → c1（真末次变更锚）；浅克隆 → 只含 c2，裸 `git log -1 --format=%h -- <判据件>` 把判据件归到边界 commit c2。
// S1 前提臂钉「失败形态确实复现」，S2/S3 才是判别臂——没有 S1，负对照可能只是恒真的空跑。
// 纪律：local-path clone 会静默忽略 --depth（git 自带 warning「--depth is ignored in local clones」），
//   必须 --no-local 走真传输，否则克隆根本不浅、fixture 全程失真而断言照绿。
const SRC_REL = join('engine', 'test', 'fixtures', 'contracts', 'PREREG-CRITERIA.md').split('\\').join('/');
const GIT_ENV = Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' });
function gitAt(cwd, args) { return execFileSync('git', ['-C', cwd].concat(args), { encoding: 'utf8', env: GIT_ENV }).trim(); }
const pSrc = join(tmp, 'prereg-src');
mkdirSync(join(pSrc, 'engine', 'test', 'fixtures', 'contracts'), { recursive: true });
gitAt(pSrc, ['init', '-q']);
gitAt(pSrc, ['config', 'user.email', 'a@b.c']);
gitAt(pSrc, ['config', 'user.name', 'micro-a-prereg-test']);
gitAt(pSrc, ['config', 'commit.gpgsign', 'false']);
writeFileSync(join(pSrc, 'engine', 'test', 'fixtures', 'contracts', 'PREREG-CRITERIA.md'), '# 判据预声明 v1' + NL, 'utf8');
gitAt(pSrc, ['add', '-A']); gitAt(pSrc, ['commit', '-qm', 'c1: 判据预声明']);
const TRUE_ANCHOR = gitAt(pSrc, ['log', '-1', '--format=%h', '--', SRC_REL]);
writeFileSync(join(pSrc, 'later.md'), '# 后续无关变更' + NL, 'utf8');
gitAt(pSrc, ['add', '-A']); gitAt(pSrc, ['commit', '-qm', 'c2: 无关变更']);
const BOUNDARY_COMMIT = gitAt(pSrc, ['rev-parse', 'HEAD']);
// 锚等不等，按 commit 全值判，不按 %h 字面判：git auto-abbrev 随对象库在 7↔8 跳变，两仓对象数不同即可能
//   给出不同宽度（tracker #84 已定这条口径）。字面比较会让「退化成短写的边界 commit」溜过去＝假绿。
function fullCommit(cwd, v) { try { return gitAt(cwd, ['rev-parse', '--verify', v + '^{commit}']); } catch (e) { return ''; } }
const TRUE_ANCHOR_FULL = fullCommit(pSrc, TRUE_ANCHOR);
const sameCommit = function (cwd, v, fullSha) { const r = fullCommit(cwd, v); return r !== '' && r === fullSha; };
const pShallow = join(tmp, 'prereg-shallow');
execFileSync('git', ['clone', '-q', '--depth', '1', '--no-local', pSrc, pShallow], { encoding: 'utf8', env: GIT_ENV });

t('S1 前提臂：fixture 确为浅克隆，且裸命令在该形态下取到的 commit 就是边界 commit（失败形态复现，非恒真）',
  gitAt(pShallow, ['rev-parse', '--is-shallow-repository']) === 'true'
  && TRUE_ANCHOR_FULL !== '' && TRUE_ANCHOR_FULL !== BOUNDARY_COMMIT
  && sameCommit(pShallow, gitAt(pShallow, ['log', '-1', '--format=%h', '--', SRC_REL]), BOUNDARY_COMMIT)
  && sameCommit(pSrc, gitAt(pSrc, ['log', '-1', '--format=%h', '--', SRC_REL]), TRUE_ANCHOR_FULL),
  'shallow=' + gitAt(pShallow, ['rev-parse', '--is-shallow-repository']) + ' true=' + TRUE_ANCHOR_FULL.slice(0, 12) + ' boundary=' + BOUNDARY_COMMIT.slice(0, 12));

const SHALLOW_ANCHOR = MA.resolvePreregCommit(pShallow, SRC_REL);
t('S2 判别臂：浅克隆取 degraded 标记而非边界 commit（退回裸 tryGit 取值即红）',
  SHALLOW_ANCHOR === 'degraded:shallow-clone', SHALLOW_ANCHOR);

t('S3 票面字面判据：浅克隆结果既不指向边界 commit 也不指向真锚，且不伪装成 commit 形',
  !sameCommit(pShallow, SHALLOW_ANCHOR, BOUNDARY_COMMIT) && !sameCommit(pSrc, SHALLOW_ANCHOR, TRUE_ANCHOR_FULL)
  && GR.classifyPreregAnchor(SHALLOW_ANCHOR) !== 'commit', SHALLOW_ANCHOR + ' boundary=' + BOUNDARY_COMMIT.slice(0, 12));

t('S4 正对照：完整历史仓仍取判据件末次变更 commit——收紧没把好面一起拒掉',
  sameCommit(pSrc, MA.resolvePreregCommit(pSrc, SRC_REL), TRUE_ANCHOR_FULL), MA.resolvePreregCommit(pSrc, SRC_REL) + ' vs ' + TRUE_ANCHOR_FULL.slice(0, 12));

t('S5 无源码仓根（安装态插件）落显式降级标记，不再落裸 unknown',
  MA.resolvePreregCommit(null, SRC_REL) === 'degraded:no-source-repo', MA.resolvePreregCommit(null, SRC_REL));

t('S5b 判据件在该仓取不到 commit 时落具名降级，而非裸空值/unknown',
  MA.resolvePreregCommit(pSrc, 'engine/test/fixtures/contracts/NO-SUCH-CRITERIA.md') === 'degraded:no-criteria-history',
  MA.resolvePreregCommit(pSrc, 'engine/test/fixtures/contracts/NO-SUCH-CRITERIA.md'));

t('S6 发出面合口径：本机完整克隆跑出的 Micro-A 报告 prereg_commit 仍是 commit 形（未误判为降级）',
  GR.classifyPreregAnchor(String(gr64 && gr64.prereg_commit)) === 'commit', JSON.stringify(gr64 && gr64.prereg_commit));

// 判不了深度必须降级而非抛出——机理记于 ADR-0027；本函数在模块加载期被调用，抛出即拖垮整条 Micro-A 面。
const pNotRepo = join(tmp, 'prereg-not-a-repo');
mkdirSync(pNotRepo, { recursive: true });
let unprobed = '';
let unprobedErr = null;
try { unprobed = MA.resolvePreregCommit(pNotRepo, SRC_REL); } catch (e) { unprobedErr = String((e && e.message) || e); }
t('S7 判不了深度时降级而非抛出——非 git 目录喂进去不得抛，结果仍落合规形态',
  unprobedErr === null && GR.classifyPreregAnchor(unprobed) === 'degraded',
  unprobedErr !== null ? 'threw ' + unprobedErr : unprobed);

// core.abbrev=4 时 `%h` 真会短到 4 位（git 忽略 <4 的设定，4 是下限）。这条钉的是**本票自引入的**失败模式：
//   口径闸初版把 commit 下限写成 7，合法锚会被自己的闸判成模糊态，buildReceipt 在 Micro-A 落盘前就抛。
gitAt(pSrc, ['config', 'core.abbrev', '4']);
const ABBREV4_RAW = gitAt(pSrc, ['log', '-1', '--format=%h', '--', SRC_REL]);
const ABBREV4_ANCHOR = MA.resolvePreregCommit(pSrc, SRC_REL);
t('S8 前提+正对照：core.abbrev=4 使 %h 落到 7 位以下，该锚仍须判成 commit 且解析回同一枚判据锚',
  ABBREV4_RAW.length < 7 && GR.classifyPreregAnchor(ABBREV4_ANCHOR) === 'commit'
  && sameCommit(pSrc, ABBREV4_ANCHOR, TRUE_ANCHOR_FULL), JSON.stringify({ raw: ABBREV4_RAW, anchor: ABBREV4_ANCHOR }));

try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(fail === 0 ? 'MICRO-A-TEST-OK ' + pass + '/' + (pass + fail) : 'MICRO-A-TEST-FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
