// quarantine.test.mjs —— #78 quarantine 引擎的测试清单（整行格式坏了立刻停 / 单个字段坏了就隔离；D-103~D-120）
// A=分类器只管三态、永不 throw / B=raw_bytes 指纹和截断边界 / C=strict 模式的下限
// D=两边数字必须相等的关系 / E=quarantine_log 建表语句 / F=store 端到端（同一键重复写只留一行·事务回滚·词表外的码直接崩）
// G=造一个病态 git 仓库跑全链端到端（hash-object --literally 写病态 commit 对象）/ H=MCP quarantine 只读投影
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CLI = join(ROOT, 'dist', 'cli.js');
const NL = String.fromCharCode(10);
const SHA64 = /[0-9a-f]{64}/;
const Q = await import(pathToFileURL(join(ROOT, 'dist', 'intake', 'quarantine.js')).href);
const S = await import(pathToFileURL(join(ROOT, 'dist', 'fact', 'schema.js')).href);
const STORE = await import(pathToFileURL(join(ROOT, 'dist', 'fact', 'store.js')).href);

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 240) : '')); } }

// ---------- A. 分类器只管那三态（D-103/D-104：三种情况分开归，字段级病态永远不 throw） ----------
const c1 = Q.classifyGitIsoField('2005-04-07T22:13:13Z');
t('A1 Z 结尾的写法判 clean', c1.status === 'clean' && c1.value === '2005-04-07T22:13:13Z' && c1.reason_code === null);
const c2 = Q.classifyGitIsoField('2005-04-07T22:13:13-07:00');
t('A2 ±HH:MM 的偏移写法判 clean', c2.status === 'clean' && c2.value === '2005-04-07T22:13:13-07:00');
const c3 = Q.classifyGitIsoField('2005-04-07T22:13:13+00:00');
t('A3 +00:00 归一成 Z（只留记录，不告警）', c3.status === 'normalized' && c3.value === '2005-04-07T22:13:13Z' && c3.reason_code === 'normalized_tz_offset');
const c4 = Q.classifyGitIsoField('%cI');
t('A4 字面 %cI → quarantined/unclassified_field_anomaly（病态不升格成崩溃）', c4.status === 'quarantined' && c4.value === null && c4.reason_code === 'unclassified_field_anomaly');
const c5 = Q.classifyGitIsoField('%cI', { anchor: true });
t('A5 锚位上的病态码是 anchor_head_date_malformed（D-105）', c5.status === 'quarantined' && c5.reason_code === 'anchor_head_date_malformed');
const c6 = Q.classifyGitIsoField('x'.repeat(65537));
t('A6 超过 64KiB 判 quarantined/oversize', c6.status === 'quarantined' && c6.reason_code === 'oversize');
const c7 = Q.classifyGitIsoField('x'.repeat(65536));
t('A7 卡在 N=65536 不算 oversize（不是 ISO 就判 unclassified）', c7.status === 'quarantined' && c7.reason_code === 'unclassified_field_anomaly');
const c8 = Q.classifyGitIsoField('2005-04-12T02:52:13+99:99');
t('A8 形状合法但语义越界（+99:99）也判 clean——规矩只管形状，不自作主张扩展语义', c8.status === 'clean' && c8.value === '2005-04-12T02:52:13+99:99');
let threw = false;
const FUZZ = [null, undefined, '', '   ', String.fromCharCode(10), String.fromCharCode(9, 13), '%cI', '垃圾', String.fromCharCode(0, 1, 2), '{bad}', 'not-a-date', 'x'.repeat(200000), '2005-04-07', '2005-04-07T22:13:13', '2005-04-07T22:13:13+0000', ' 2005-04-07T22:13:13Z '];
for (const f of FUZZ) { try { const r = Q.classifyGitIsoField(f); if (['clean', 'normalized', 'quarantined'].indexOf(r.status) < 0) { threw = 'bad-status'; break; } } catch (e) { threw = 'threw:' + String(e).slice(0, 60); break; } }
t('A9 永远不 throw，三态就这三种（拿 15 个输入乱试）', threw === false, String(threw));
const d1 = Q.classifyGitIsoField('bogus-value');
const d2 = Q.classifyGitIsoField('bogus-value');
t('A10 同一个输入永远同一个输出（reason/value/status 逐字节一样）', JSON.stringify(d1) === JSON.stringify(d2));
const c11 = Q.classifyGitIsoField(' 2005-04-07T22:13:13Z ');
t('A11 首尾空白按同一规矩清掉（trim 后是 ISO 就判 clean）', c11.status === 'clean' && c11.value === '2005-04-07T22:13:13Z');

// ---------- B. raw_bytes 指纹和截断（D-117） ----------
const fp1 = Q.rawBytesFingerprint('2005-04-07T22:13:13Z');
t('B1 短值的指纹三样：不截断、原长、sha256 覆盖全文', fp1.is_trunc === false && fp1.original_length === 20 && SHA64.test(fp1.sha256_full));
const fp2 = Q.rawBytesFingerprint('A'.repeat(70000));
t('B2 超界就截：hex 回显 = 64KiB×2，is_trunc 是 true，原长 70000', fp2.is_trunc === true && fp2.original_length === 70000 && fp2.raw_bytes_hex.length === 131072);
t('B3 sha256_full 算的是没截断的原文', fp2.sha256_full === createHash('sha256').update('A'.repeat(70000), 'utf8').digest('hex'));
const fp3 = Q.rawBytesFingerprint('B'.repeat(65536));
t('B4 卡在 N=65536 不截（N+1 才截）', fp3.is_trunc === false && fp3.original_length === 65536 && fp3.raw_bytes_hex.length === 131072);
const fp4 = Q.rawBytesFingerprint('%cI');
t('B5 hex 回显能倒回去（hex→bytes→原文）', Buffer.from(fp4.raw_bytes_hex, 'hex').toString('utf8') === '%cI');

// ---------- C. strict 模式的下限（D-110） ----------
t('C1 空基线就是零容忍：unclassified quarantined 事件算一条违例', Q.strictQuarantineViolations([{ commit_sha: 's', field_name: 'committer_date', disposition: 'quarantined', reason_code: 'unclassified_field_anomaly', raw: 'r' }]).length === 1);
t('C2 normalized 只留记录，不进违例集', Q.strictQuarantineViolations([{ commit_sha: 's', field_name: 'committer_date', disposition: 'normalized', reason_code: 'normalized_tz_offset', raw: 'r' }]).length === 0);
t('C3 基线自己说得通（眼下空基线，没有滞留码）', Q.baselineIssues().length === 0, Q.baselineIssues().join('|'));
t('C4 v1 词表就是四族，也只这四族', JSON.stringify(Q.QUARANTINE_REASON_CODES.slice().sort()) === JSON.stringify(['anchor_head_date_malformed', 'normalized_tz_offset', 'oversize', 'unclassified_field_anomaly'].sort()));
t('C5 ACCEPTED 基线是仓里带版本的常量（不是从环境变量来的）', Array.isArray(Q.ACCEPTED_REASON_CODES));

// ---------- D. 两边数字必须相等（D-116：字段实例这个粒度） ----------
const st = [{ field_name: 'committer_date', total: 5, clean: 3, normalized: 1, quarantined: 1 }];
t('D1 库里的计数和内存三桶对得上 → 没有问题', Q.intakeIdentityIssues(st, { committer_date: { normalized: 1, quarantined: 1 } }).length === 0);
t('D2 对不上 → 出一条问题', Q.intakeIdentityIssues(st, { committer_date: { normalized: 0, quarantined: 0 } }).length > 0);
t('D3 三桶加起来不等于 total → 出一条问题', Q.intakeIdentityIssues([{ field_name: 'f', total: 5, clean: 5, normalized: 1, quarantined: 0 }], {}).length > 0);

// ---------- E. quarantine_log 建表语句（D-106/D-112/D-119） ----------
const ddl = S.QUARANTINE_LOG_DDL;
t('E1 建表，加组合自然键 UNIQUE', ddl.indexOf('CREATE TABLE IF NOT EXISTS quarantine_log') >= 0 && ddl.indexOf('UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)') >= 0);
t('E2 reason_code 的 CHECK 只查命名规矩（词表是开放的不是硬编码枚举）', ddl.indexOf('regexp_matches(reason_code') >= 0 && ddl.indexOf('{2,63}') >= 0);
t('E3 raw_bytes_hex 有上限，≤131072 个 hex 字符', ddl.indexOf('CHECK(length(raw_bytes_hex) <= 131072)') >= 0);
t('E4 INSERT…ON CONFLICT DO NOTHING 能过只追加这个检查', S.classifyStatement("INSERT INTO quarantine_log (q_seq, run_id) VALUES (nextval('s'), ?) ON CONFLICT DO NOTHING").allow === true);
t('E5 黑名单还是拦得住 UPDATE/DELETE（防线没开洞）', S.classifyStatement('UPDATE quarantine_log SET x=1').allow === false && S.classifyStatement('DELETE FROM quarantine_log').allow === false);

// ---------- F. store 端到端（DuckDB 真货：重复写/事务/词表外的码） ----------
const tmpD = mkdtempSync(join(tmpdir(), 'quar-store-'));
const DBP = join(tmpD, 'f.duckdb');
const W = await STORE.openWriter(DBP);
const RID = 'a'.repeat(32);
const EV = { run_id: RID, commit_sha: 'c1', field_name: 'committer_date', disposition: 'quarantined', reason_code: 'unclassified_field_anomaly', raw: '%cI', collector: 'test', recorded_at: '2026-04-10T10:00:00Z' };
await STORE.appendQuarantineEvent(W, EV);
await STORE.appendQuarantineEvent(W, EV);
const n1 = await (await W.run('SELECT COUNT(*) FROM quarantine_log')).getRows();
t('F1 同一个键重复写只留 1 行（ON CONFLICT DO NOTHING）', Number(n1[0][0]) === 1);
let unlisted = null;
try { await STORE.appendQuarantineEvent(W, { run_id: RID, commit_sha: 'c9', field_name: 'f', disposition: 'quarantined', reason_code: 'bogus_code', raw: 'r', collector: 'test', recorded_at: null }); } catch (e) { unlisted = e; }
t('F2 词表外的 reason_code 直接按协议崩（写入前先查枚举）', Q.isProtocolCrash(unlisted) && unlisted.code === 'REASON-CODE-UNLISTED');
await STORE.runInTransaction(W, async function () {
  await STORE.appendQuarantineEvent(W, { run_id: RID, commit_sha: 'c2', field_name: 'committer_date', disposition: 'normalized', reason_code: 'normalized_tz_offset', raw: 'x', collector: 'test', recorded_at: null });
  throw new Error('forced-rollback');
}).catch(function () { });
const n2 = await (await W.run('SELECT COUNT(*) FROM quarantine_log')).getRows();
t('F3 事务回滚，不留半截写（失败的事件不落库）', Number(n2[0][0]) === 1);
const cnts = await STORE.queryQuarantineCounts(W, RID);
t('F4 queryQuarantineCounts 按半层读回来是 {committer_date:{quarantined:1}}', cnts.committer_date && cnts.committer_date.quarantined === 1 && cnts.committer_date.normalized === 0);
const qr = await STORE.queryQuarantineRows(W, RID);
t('F5 投影行里的指纹三样跟着行一起出来', qr.length === 1 && qr[0].sha256_full && SHA64.test(String(qr[0].sha256_full)) && qr[0].is_trunc === false);
STORE.closeDuckdb(W);

// ---------- G. 造一个病态 git 仓库跑全链（hash-object --literally） ----------
const PIN = { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' };
function gitR(args, cwd, input) {
  const r = spawnSync('git', args, { cwd: cwd, encoding: 'utf8', input: input, env: Object.assign({}, process.env, PIN) });
  if (r.status !== 0) { throw new Error('git ' + args[0] + ' failed: ' + (r.stderr || '').slice(0, 120)); }
  return r.stdout.trim();
}
const ADR_MD = ['# ADR-9999', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: test', '- Ledger: D-001', '', '## Context', 'x.', '', '## Decision', 'y.', '', '## Consequences', 'z; supersedes ADR-000.'].join(NL);
function mkRepo(dir) {
  mkdirSync(join(dir, 'docs', 'adr'), { recursive: true });
  gitR(['init'], dir); gitR(['config', 'user.email', 'a@b.c'], dir); gitR(['config', 'user.name', 't'], dir); gitR(['config', 'commit.gpgsign', 'false'], dir);
  writeFileSync(join(dir, 'CONTEXT.md'), 'macro audit positioning determinism traceability provenance receipt quarantine' + NL, 'utf8');
  writeFileSync(join(dir, 'package.json'), '{"name":"x","private":true}' + NL, 'utf8');
  gitR(['add', '-A'], dir); gitR(['commit', '-m', 'init'], dir);
  writeFileSync(join(dir, 'docs', 'adr', '9999-decision.md'), ADR_MD, 'utf8');
  gitR(['add', '-A'], dir); gitR(['commit', '-m', 'adr'], dir);
}
// hash-object --literally 手写 commit 对象（病态的 committer/author 行原样进库）
function badCommit(dir, opts) {
  const tree = gitR(['rev-parse', 'HEAD^{tree}'], dir);
  const head = gitR(['rev-parse', 'HEAD'], dir);
  const body = ['tree ' + tree, 'parent ' + head, 'author ' + (opts.author || 'T <t@t>') + ' 1112911993 -0700', 'committer ' + (opts.committer || 'T <t@t>') + ' 1112911993 ' + (opts.tz || '+GGGG'), '', 'pathological fixture', ''].join(NL);
  const sha = gitR(['hash-object', '--literally', '-t', 'commit', '-w', '--stdin'], dir, body);
  gitR(['update-ref', 'HEAD', sha], dir);
  return sha;
}
const tmpG = mkdtempSync(join(tmpdir(), 'quar-fix-'));

// -- G1 干净基线仓：采数体检该是零病态的那套骨架 --
const R1 = join(tmpG, 'clean'); mkRepo(R1);
const OUT1 = join(tmpG, 'out-clean');
let e1 = spawnSync('node', [CLI, 'audit', R1, '--out', OUT1], { encoding: 'utf8', timeout: 120000 });
t('G1 干净仓 audit exit 0', e1.status === 0, (e1.stderr || '').slice(0, 200));
const md1 = existsSync(join(OUT1, 'report.md')) ? readFileSync(join(OUT1, 'report.md'), 'utf8') : '';
t('G2 Intake Health 节一定在，并且证明这次一个病态都没有', md1.indexOf('## Intake Health') >= 0 && md1.indexOf('这次采数没查出问题') >= 0, md1.split('## Intake Health')[1] ? md1.split('## Intake Health')[1].slice(0, 200) : 'absent');
const sc1 = existsSync(join(OUT1, 'report.json')) ? JSON.parse(readFileSync(join(OUT1, 'report.json'), 'utf8')) : null;
t('G3 侧车 verdict 的三个面：这次摄入零病态，所以 reason_class 落在真判据族不是摄入族', !!sc1 && sc1.verdict && ['supported', 'unsupported', 'insufficient'].indexOf(sc1.verdict.band) >= 0 && ['none', 'evidence_insufficient', 'criteria_unsupported'].indexOf(sc1.verdict.reason_class) >= 0, sc1 && sc1.verdict ? JSON.stringify(sc1.verdict) : 'absent');
t('G4 receipt.verdict 投影在（band 和 reason_class 跟 verdict 块一致）', !!sc1 && sc1.receipt && sc1.receipt.verdict && sc1.receipt.verdict.band === sc1.verdict.band && sc1.receipt.verdict.reason_class === sc1.verdict.reason_class);

// -- G2 历史中间夹一个病态 commit（committer 时区写 +GGGG → %cI 吐出字面量） --
const R2 = join(tmpG, 'mid-bad'); mkRepo(R2);
const BADSHA2 = badCommit(R2, { tz: '+GGGG' });
gitR(['commit', '--allow-empty', '-m', 'top-clean'], R2);
const OUT2 = join(tmpG, 'out-mid');
let e2 = spawnSync('node', [CLI, 'audit', R2, '--out', OUT2], { encoding: 'utf8', timeout: 120000 });
t('G5 病态 committer_date 不崩全仓：audit exit 0', e2.status === 0, 'status=' + e2.status + ' err=' + (e2.stderr || '').slice(0, 200));
const md2 = existsSync(join(OUT2, 'report.md')) ? readFileSync(join(OUT2, 'report.md'), 'utf8') : '';
t('G6 Intake Health 那张只列 quarantined 的 SHA 表里，有这个 sha 和 reason_code', md2.indexOf(BADSHA2) >= 0 && md2.indexOf('unclassified_field_anomaly') >= 0);
const sc2 = existsSync(join(OUT2, 'report.json')) ? JSON.parse(readFileSync(join(OUT2, 'report.json'), 'utf8')) : null;
t('G7 病态率超过了线 → verdict 升到 unsupported/threshold_exceeded（D-105② 初值定 0.001）', !!sc2 && sc2.verdict && sc2.verdict.band === 'unsupported' && sc2.verdict.reason_class === 'threshold_exceeded', sc2 && sc2.verdict ? JSON.stringify(sc2.verdict) : 'absent');
const ms2 = existsSync(join(OUT2, 'audit-measurements.json')) ? JSON.parse(readFileSync(join(OUT2, 'audit-measurements.json'), 'utf8')) : null;
t('G8 measurements.intake_quarantine 这块在（field_stats 三个桶）', !!ms2 && ms2.intake_quarantine && Array.isArray(ms2.intake_quarantine.field_stats));
if (ms2 && ms2.intake_quarantine) {
  const cd = ms2.intake_quarantine.field_stats.filter(function (f) { return f.field_name === 'committer_date'; })[0] || {};
  t('G9 committer_date 三个桶：quarantined=1，而且加起来等于 total', cd.quarantined === 1 && cd.clean + cd.normalized + cd.quarantined === cd.total, JSON.stringify(cd));
} else { t('G9 committer_date 三个桶：quarantined=1，而且加起来等于 total', false, 'no intake_quarantine'); }
if (existsSync(join(OUT2, 'facts.duckdb'))) {
  const rc2 = await STORE.openReader(join(OUT2, 'facts.duckdb'));
  const qrows2 = await (await rc2.run("SELECT commit_sha, field_name, reason_code, is_trunc, sha256_full FROM quarantine_log")).getRows();
  t('G10 quarantine_log 落了一行：sha、字段、原因码、指纹三样都在', qrows2.length === 1 && String(qrows2[0][0]) === BADSHA2 && String(qrows2[0][1]) === 'committer_date' && String(qrows2[0][2]) === 'unclassified_field_anomaly' && qrows2[0][4] && SHA64.test(String(qrows2[0][4])), JSON.stringify(qrows2));
  STORE.closeDuckdb(rc2);
} else { t('G10 quarantine_log 有没有落行', false, 'facts.duckdb missing'); }

// -- G3 锚上的病态（HEAD 的 %cI 坏了 → anchor_head_date_malformed → unsupported，事实不落库） --
const R3 = join(tmpG, 'anchor-bad'); mkRepo(R3);
badCommit(R3, { tz: 'abc' });
const OUT3 = join(tmpG, 'out-anchor');
let e3 = spawnSync('node', [CLI, 'audit', R3, '--out', OUT3], { encoding: 'utf8', timeout: 120000 });
t('G11 锚坏了 audit 还是 exit 0（跑完了，不升级成崩溃）', e3.status === 0, 'status=' + e3.status + ' err=' + (e3.stderr || '').slice(0, 200));
const ms3 = existsSync(join(OUT3, 'audit-measurements.json')) ? JSON.parse(readFileSync(join(OUT3, 'audit-measurements.json'), 'utf8')) : null;
const sc3 = existsSync(join(OUT3, 'report.json')) ? JSON.parse(readFileSync(join(OUT3, 'report.json'), 'utf8')) : null;
t('G12 锚坏了 → verdict=unsupported/anchor_malformed', !!sc3 && sc3.verdict && sc3.verdict.band === 'unsupported' && sc3.verdict.reason_class === 'anchor_malformed', sc3 && sc3.verdict ? JSON.stringify(sc3.verdict) : 'absent');
t('G13 observed_at 标成明确的哨兵值（不落一个假的时间戳）', !!ms3 && ms3.observed_at === 'quarantined(anchor_head_date_malformed)', ms3 ? String(ms3.observed_at) : 'absent');
const qdb3 = join(OUT3, 'facts.duckdb');
if (existsSync(qdb3)) {
  const rc = await STORE.openReader(qdb3);
  const fq = await (await rc.run('SELECT COUNT(*) FROM audit_fact')).getRows();
  const qq = await (await rc.run('SELECT field_name, recorded_at FROM quarantine_log')).getRows();
  const qHd = qq.filter(function (r) { return r[0] === 'head_date'; })[0];
  const qCd = qq.filter(function (r) { return r[0] === 'committer_date'; })[0];
  t('G14 锚坏了这次：audit_fact 一行没有，head_date 和 committer_date 各一行（同一个病态 commit 两个位都被分类了），recorded_at 都是 NULL', Number(fq[0][0]) === 0 && !!qHd && qHd[1] === null && !!qCd && qCd[1] === null, 'facts=' + Number(fq[0][0]) + ' quar=' + JSON.stringify(qq));
  STORE.closeDuckdb(rc);
} else { t('G14 锚坏了这次：facts.duckdb 应该在', false, 'db missing'); }

// -- G4 strict quarantine 这道关：越过下限就硬崩 exit 3，并留下崩溃工件 --
const OUT4 = join(tmpG, 'out-strict');
let e4 = spawnSync('node', [CLI, 'audit', R2, '--out', OUT4, '--strict-quarantine'], { encoding: 'utf8', timeout: 120000 });
t('G15 strict 模式越过下限 → exit 3（不是 0 也不是 2，三种值分得清）', e4.status === 3, 'status=' + e4.status);
let se4 = null; try { se4 = JSON.parse(e4.stderr); } catch (e) { }
t('G16 stderr 是结构化输出：error=STRICT-QUARANTINE-VIOLATION，还带 crash_artifact 路径', !!se4 && se4.error === 'STRICT-QUARANTINE-VIOLATION' && typeof se4.crash_artifact === 'string', e4.stderr.slice(0, 200));
const crashFiles4 = existsSync(OUT4) ? readdirSync(OUT4).filter(function (f) { return f.indexOf('macro-audit-crash-') === 0; }) : [];
const art4 = crashFiles4.length > 0 ? JSON.parse(readFileSync(join(OUT4, crashFiles4[0]), 'utf8')) : null;
t('G17 崩溃工件的 schema=quarantine-crash-artifact/v1，指纹三样齐备', !!art4 && art4.schema === 'quarantine-crash-artifact/v1' && SHA64.test(art4.sha256_full) && art4.error_code === 'STRICT-QUARANTINE-VIOLATION', crashFiles4.join(','));

// -- G5 整行格式坏了（author 里有 | → 记录字段定不了界 → fail-fast exit 2，留下工件） --
const R5 = join(tmpG, 'proto-bad'); mkRepo(R5);
badCommit(R5, { author: 'A|B <t@t>', tz: '-0700' });
const OUT5 = join(tmpG, 'out-proto');
let e5 = spawnSync('node', [CLI, 'audit', R5, '--out', OUT5], { encoding: 'utf8', timeout: 120000 });
t('G18 整行格式坏了就立刻停，exit 2（不是 0 也不是 3）', e5.status === 2, 'status=' + e5.status + ' err=' + (e5.stderr || '').slice(0, 200));
let se5 = null; try { se5 = JSON.parse(e5.stderr); } catch (e) { }
t('G19 stderr 的 error=GITCLI-OUTPUT-CONTRACT（整行格式和单字段分开走两条路）', !!se5 && se5.error === 'GITCLI-OUTPUT-CONTRACT', e5.stderr.slice(0, 200));
const crashFiles5 = existsSync(OUT5) ? readdirSync(OUT5).filter(function (f) { return f.indexOf('macro-audit-crash-') === 0; }) : [];
t('G20 整行格式坏了的崩溃工件落在盘上', crashFiles5.length > 0, crashFiles5.join(','));

// -- G6 strict 的两个入口（D-110④：环境变量只传开关，命令行 flag 优先于它） --
const OUT4E = join(tmpG, 'out-strict-env');
let e4e = spawnSync('node', [CLI, 'audit', R2, '--out', OUT4E], { encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { MACRO_AUDIT_STRICT_QUARANTINE: '1' }) });
t('G21 走环境变量这一路：MACRO_AUDIT_STRICT_QUARANTINE=1 不给 flag → exit 3（跟 strict 一样的意思）', e4e.status === 3, 'status=' + e4e.status);
let e4n = spawnSync('node', [CLI, 'audit', R2, '--out', join(tmpG, 'out-nostrict'), '--no-strict-quarantine'], { encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { MACRO_AUDIT_STRICT_QUARANTINE: '1' }) });
t('G22 flag 优先于 env：--no-strict-quarantine 明确关掉，压过 env=1 → exit 0', e4n.status === 0, 'status=' + e4n.status + ' err=' + (e4n.stderr || '').slice(0, 160));

// ---------- H. MCP quarantine 只读投影（D-113②） ----------
const H1 = spawnSync('node', [CLI, 'mcp', 'quarantine', '--db', join(OUT2, 'facts.duckdb')], { encoding: 'utf8' });
const h1rows = (H1.stdout || '').trim().split(NL).filter(function (l) { return l.length > 0; }).map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
t('H1 mcp quarantine 这个命令把投影打出来，exit 0，每行带 reason_code/sha256_full', H1.status === 0 && h1rows.length === 1 && h1rows[0].reason_code === 'unclassified_field_anomaly', 'status=' + H1.status + ' rows=' + h1rows.length + ' ' + (H1.stderr || '').slice(0, 160));
const H2msgs = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'quarantine', arguments: { db: join(OUT2, 'facts.duckdb') } } }].map(JSON.stringify).join(NL) + NL;
const H2 = spawnSync('node', [CLI, 'mcp'], { encoding: 'utf8', input: H2msgs });
const h2res = (H2.stdout || '').trim().split(NL).map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
const h2call = h2res.filter(function (x) { return x.id === 2; })[0];
t('H2 走 JSON-RPC 调 tools/call quarantine，能读出行来', !!h2call && h2call.result && h2call.result.isError === false && h2call.result.content[0].text.indexOf('unclassified_field_anomaly') >= 0, H2.status + '/' + (H2.stdout || '').slice(0, 160));

rmSync(tmpD, { recursive: true, force: true });
rmSync(tmpG, { recursive: true, force: true });
console.log('QUARANTINE ' + pass + '/' + (pass + fail));
if (fail > 0) { process.exit(1); }
