// 78-check.mjs —— #78 quarantine 引擎验收闸（ADR-0022 / D-103~D-120）
// load-bearing: 独立对账守卫——承载性冗余（独立代码路径自持 SQL+git 重放恒等式，禁当重复代码删除；D-116②）。已挂载 engine-ci.yml。
// 断言面：A=契约层导出+intake 委托 / B=schema+store 持久化面 / C=macro-b+audit+report 接线
//   D=39/40 one-shot 同口径 / E=quarantine.test.mjs 实跑 / F=病态仓双通道 disposition parity 独立对账
// 用法：node 78-check.mjs（须先 npm run build——dist 面被断言）
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync as _rs } from 'node:fs';
import * as fs2 from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const CLI = join(ENG, 'dist', 'cli.js');
const ONESHOT39 = join(HERE, '39-macro-b-one-shot.mjs');
const NL = String.fromCharCode(10);
const Q = await import(pathToFileURL(join(ENG, 'dist', 'intake', 'quarantine.js')).href);
const STORE = await import(pathToFileURL(join(ENG, 'dist', 'fact', 'store.js')).href);

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 260) : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }

// ---------- A. 契约层（intake/quarantine.ts）导出+intake 委托 ----------
const quar = txt(join(ENG, 'src', 'intake', 'quarantine.ts'));
const intake = txt(join(ENG, 'src', 'intake', 'intake.ts'));
t('A1 分类器+三态+词表导出', /export function classifyGitIsoField/.test(quar) && quar.indexOf("'clean' | 'normalized' | 'quarantined'") >= 0 && /export const QUARANTINE_REASON_CODES/.test(quar));
t('A2 指纹+截断上界 64KiB 导出', /export function rawBytesFingerprint/.test(quar) && quar.indexOf('RAW_BYTES_CAP = 65536') >= 0);
t('A3 strict 门禁+恒等式+崩溃桶导出', /export function strictQuarantineViolations/.test(quar) && /export function intakeIdentityIssues/.test(quar) && /export function buildCrashArtifact/.test(quar) && /export function protocolCrashError/.test(quar) && /export function isProtocolCrash/.test(quar));
t('A4 normalizeGitIsoDate 委托分类器（抛型回执兼容旧调用方）', intake.indexOf('classifyGitIsoField') >= 0 && intake.indexOf('GITCLI-OUTPUT-CONTRACT') >= 0);
t('A5 ACCEPTED_REASON_CODES 仓级版本化基线常量', /export const ACCEPTED_REASON_CODES/.test(quar));

// ---------- B. schema + store 持久化面 ----------
const schema = txt(join(ENG, 'src', 'fact', 'schema.ts'));
const store = txt(join(ENG, 'src', 'fact', 'store.ts'));
t('B1 quarantine_log 字段集+DDL 常量', schema.indexOf('QUARANTINE_LOG_FIELDS') >= 0 && schema.indexOf('QUARANTINE_LOG_DDL') >= 0);
t('B2 自然键 UNIQUE(run_id,commit_sha,field_name,reason_code,disposition)', schema.indexOf('UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)') >= 0);
t('B3 reason_code 命名公约 CHECK + sha256 CHAR(64) + raw_bytes_hex 上界', schema.indexOf('regexp_matches(reason_code') >= 0 && schema.indexOf("'sha256_full', type: 'CHAR(64)'") >= 0 && schema.indexOf('131072') >= 0);
t('B4 写路径=appendQuarantineEvent + ON CONFLICT DO NOTHING 幂等', /export async function appendQuarantineEvent/.test(store) && store.indexOf('ON CONFLICT DO NOTHING') >= 0);
t('B5 事务面 runInTransaction + 恒等式半层 queryQuarantineCounts', /export async function runInTransaction/.test(store) && /export async function queryQuarantineCounts/.test(store));
t('B6 schema_registry v2 幂等注册', store.indexOf('quarantine_log_seq') >= 0 && store.indexOf('schema_registry') >= 0);

// ---------- C. macro-b / audit / report / cli 接线 ----------
const mb = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
const audit = txt(join(ENG, 'src', 'audit', 'audit.ts'));
const gen = txt(join(ENG, 'src', 'report', 'generate.ts'));
const cli = txt(join(ENG, 'src', 'cli.ts'));
// #81/D-128②：接线序改为 absorbGitIsoDialect（边界方言归一）→ classifyGitIsoField（规范流分类）——断言更新为吸收在分类器上游。
t('C1 probe 锚位+逐 commit 双分类接线（#81：边界吸收→分类器）', mb.indexOf('absorbGitIsoDialect(headRaw)') >= 0 && mb.indexOf('classifyGitIsoField(headAbs.value, { anchor: true })') >= 0 && mb.indexOf('absorbGitIsoDialect(parts[2])') >= 0 && mb.indexOf('classifyGitIsoField(abs.value)') >= 0);
t('C2 probe 输出带 fieldStats/fieldEvents', mb.indexOf('fieldStats') >= 0 && mb.indexOf('fieldEvents') >= 0);
t('C3 audit 装配：strict 闸+事务写+恒等式断言', audit.indexOf('strictQuarantineViolations') >= 0 && audit.indexOf('runInTransaction') >= 0 && audit.indexOf('intakeIdentityIssues') >= 0);
t('C4 Intake Health 恒在节+verdict 三面投影', gen.indexOf('## Intake Health') >= 0 && gen.indexOf('reason_class') >= 0 && gen.indexOf('VERDICT_REASON_CLASSES') >= 0);
t('C5 cli --strict-quarantine 旗 + crash 工件 + 三值退出码', cli.indexOf('--strict-quarantine') >= 0 && cli.indexOf('crashArtifactFromError') >= 0 && cli.indexOf('STRICT-QUARANTINE-VIOLATION') >= 0);
t('C6 collectors null-date 显式跳过（不静默转 0）', txt(join(ENG, 'src', 'collect', 'collectors.ts')).indexOf('date === null') >= 0 || txt(join(ENG, 'src', 'collect', 'collectors.ts')).indexOf('date: string | null') >= 0);
t('C7 strict env 通道：cli flag>env precedence（STRICT_QUARANTINE_ENV+strictQuarantineEnabled 单点）', cli.indexOf('STRICT_QUARANTINE_ENV') >= 0 && cli.indexOf('strictQuarantineEnabled') >= 0 && quar.indexOf('STRICT_QUARANTINE_ENV') >= 0);
t('C8 D-115③ 错误码分流：AuditIoError+classifyWriteError+exit 4 类', store.indexOf('AuditIoError') >= 0 && store.indexOf('classifyWriteError') >= 0 && cli.indexOf('EXIT_IO_FAILURE') >= 0 && audit.indexOf('classifyWriteError') >= 0);
t('C9 D-110③ 棘轮机化 ratchetIssues+strict 闸接线', quar.indexOf('ratchetIssues') >= 0 && audit.indexOf('ratchetIssues') >= 0);
t('C10 D-117② raw_echo 截断谓词单点共享（rawEcho 导出+双消费面零裸字面量）', quar.indexOf('RAW_ECHO_CAP') >= 0 && quar.indexOf('export function rawEcho') >= 0 && audit.indexOf('rawEcho(e.raw)') >= 0 && txt(join(ENG, 'src', 'demo', 'demo.ts')).indexOf('rawEcho(e.raw)') >= 0);
t('C11 D-115①/D-116① 逐 commit 事务+增量断言接线', audit.indexOf('per-commit-identity') >= 0 && audit.indexOf('FACT_WRITE_BATCH') >= 0);
t('C12 D-109② 工件 schema 三桶+run_context 关联键补齐', quar.indexOf('records_parsed') >= 0 && quar.indexOf('head_date') >= 0 && quar.indexOf('collector') >= 0 && quar.indexOf('countsFromStats') >= 0);
t('C13 D-108④ NULL 语义呈现面双固化（报告节+接口注释）', gen.indexOf('recorded_at') >= 0 && gen.indexOf('时点不可得') >= 0);

// ---------- D. 39/40 对照物 SoD 断言（D-118④：对照物不引入 quarantine 分类/写库逻辑；39 仅获 crash 等位 catch+env 读取=D-109①/D-110④ 裁定边界） ----------
for (const NN of ['39', '40']) {
  const s = txt(join(HERE, NN + '-macro-b-one-shot.mjs'));
  t('D-' + NN + '1 对照物不引 quarantine 分类器/写面（SoD：分类规则真源唯 cli 契约层）', s.indexOf('classifyGitIsoField') < 0 && s.indexOf('recordFieldInstance') < 0 && s.indexOf('appendQuarantineEvent') < 0 && s.indexOf('quarantine_log') < 0);
  t('D-' + NN + '2 对照物保留自身归一化（normalizeGitIsoDate=病态即抛=「解析失败」分歧类的可观测代理）', s.indexOf('normalizeGitIsoDate') >= 0 && s.indexOf('%cI') >= 0);
}
const s39 = txt(ONESHOT39);
t('D-393 39 等位 catch：崩溃桶工件落盘+stderr 结构化（D-109① 第二腿）', s39.indexOf('crashArtifactFromError') >= 0 && s39.indexOf('buildCrashArtifact') >= 0 && s39.indexOf('39-crash-') >= 0 && s39.indexOf('process.exit(isProto ? 2 : 4)') >= 0);
t('D-394 39 env 腿：MACRO_AUDIT_STRICT_QUARANTINE 读取+证据面回声', s39.indexOf('STRICT_QUARANTINE_ENV') >= 0 && s39.indexOf('strict_quarantine') >= 0);
t('D-403 40 零 crash/env 引入（40 未在 D-109①/D-110④ 挂载面——保持纯对照）', txt(join(HERE, '40-macro-b-one-shot.mjs')).indexOf('quarantine.js') < 0);

// ---------- E. quarantine.test.mjs 实跑 ----------
let qout = '';
try { qout = execFileSync('node', [join(ENG, 'test', 'quarantine.test.mjs')], { encoding: 'utf8', timeout: 300000 }); } catch (e) { qout = (e.stdout || '') + (e.stderr || ''); }
t('E1 quarantine.test.mjs exit 0 + 全 PASS', /QUARANTINE (\d+)\/\1/.test(qout) && qout.indexOf('FAIL ') < 0, qout.split(NL).slice(-2).join(' | '));

// ---------- F. 病态仓双通道 disposition parity（独立对账半层：check 自持 SQL+git 重放，不借引擎断言函数） ----------
const PIN = { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' };
function gitR(args, cwd, input) {
  const r = spawnSync('git', args, { cwd: cwd, encoding: 'utf8', input: input, env: Object.assign({}, process.env, PIN) });
  if (r.status !== 0) { throw new Error('git ' + args[0] + ': ' + (r.stderr || '').slice(0, 120)); }
  return r.stdout.trim();
}
const tmp = mkdtempSync(join(tmpdir(), '78check-'));
const FX = join(tmp, 'fx');
mkdirSync(join(FX, 'docs', 'adr'), { recursive: true });
gitR(['init'], FX); gitR(['config', 'user.email', 'a@b.c'], FX); gitR(['config', 'user.name', 't'], FX); gitR(['config', 'commit.gpgsign', 'false'], FX);
writeFileSync(join(FX, 'CONTEXT.md'), 'macro audit positioning determinism traceability provenance receipt' + NL, 'utf8');
writeFileSync(join(FX, 'package.json'), '{"name":"fx","private":true}' + NL, 'utf8');
gitR(['add', '-A'], FX); gitR(['commit', '-m', 'init'], FX);
writeFileSync(join(FX, 'docs', 'adr', '001-decision.md'), ['# ADR-001', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: t', '- Ledger: D-001', '', '## Context', 'x.', '', '## Decision', 'y.', '', '## Consequences', 'z; supersedes ADR-000.'].join(NL), 'utf8');
gitR(['add', '-A'], FX); gitR(['commit', '-m', 'adr'], FX);
const tree = gitR(['rev-parse', 'HEAD^{tree}'], FX);
const head = gitR(['rev-parse', 'HEAD'], FX);
const body = ['tree ' + tree, 'parent ' + head, 'author T <t@t> 1112911993 -0700', 'committer T <t@t> 1112911993 +GGGG', '', 'pathological', ''].join(NL);
const BADSHA = gitR(['hash-object', '--literally', '-t', 'commit', '-w', '--stdin'], FX, body);
gitR(['update-ref', 'HEAD', BADSHA], FX);
gitR(['commit', '--allow-empty', '-m', 'top'], FX);

const OUT_A = join(tmp, 'out-audit');
const ra = spawnSync('node', [CLI, 'audit', FX, '--out', OUT_A], { encoding: 'utf8', timeout: 120000 });
t('F1 引擎 audit 病态仓 exit 0', ra.status === 0, (ra.stderr || '').slice(0, 160));
const OUT_39 = join(tmp, 'out-39');
const r39 = spawnSync('node', [ONESHOT39, '--repo', 'fx', '--root', FX, '--out', OUT_39], { encoding: 'utf8', timeout: 120000 });
// D-118① parity 矩阵格：{cli=quarantined × 39=解析失败} = 预期分歧类——对照物无 quarantine 语义，病态即抛为合规行为
t('F2 one-shot39 病态仓=解析失败格（exit 2 + GITCLI-OUTPUT-CONTRACT 命中 stderr）', r39.status === 2 && (r39.stderr || '').indexOf('GITCLI-OUTPUT-CONTRACT') >= 0, 'status=' + r39.status + ' err=' + (r39.stderr || '').slice(0, 160));
const crash39 = existsSync(OUT_39) ? fs2.readdirSync(OUT_39).filter(function (f) { return f.indexOf('39-crash-') === 0; }) : [];
let crash39j = null; try { crash39j = JSON.parse(txt(join(OUT_39, crash39[0]))); } catch (_) { }
t('F2b 39 crash 工件落盘 quarantine-crash-artifact/v1（D-109① 双通道实物）', crash39.length === 1 && !!crash39j && crash39j.schema === 'quarantine-crash-artifact/v1' && crash39j.error_code === 'GITCLI-OUTPUT-CONTRACT', crash39.join(';'));
// env 腿实证：STRICT env=1 时 39 stderr 回声 strict_quarantine:true（对照物语义恒硬崩，env 只进证据面）
const r39s = spawnSync('node', [ONESHOT39, '--repo', 'fx', '--root', FX, '--out', join(tmp, 'out-39-strict')], { encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { MACRO_AUDIT_STRICT_QUARANTINE: '1' }) });
t('F2c 39 env 腿实证：MACRO_AUDIT_STRICT_QUARANTINE=1 → stderr 回声 strict_quarantine:true', r39s.status === 2 && (r39s.stderr || '').indexOf('"strict_quarantine":true') >= 0, 'err=' + (r39s.stderr || '').slice(0, 200));

async function quarSet(dbPath) {
  const c = await STORE.openReader(dbPath);
  const rows = await (await c.run('SELECT commit_sha, field_name, disposition, reason_code FROM quarantine_log ORDER BY commit_sha, field_name')).getRows();
  STORE.closeDuckdb(c);
  return rows.map(function (r) { return [String(r[0]), String(r[1]), String(r[2]), String(r[3])].join('|'); });
}
const setA = await quarSet(join(OUT_A, 'facts.duckdb'));
t('F3 引擎 quarantine_log 键集=病态 sha+committer_date+quarantined+unclassified_field_anomaly', setA.length === 1 && setA[0] === BADSHA + '|committer_date|quarantined|unclassified_field_anomaly', setA.join(';'));

// 干净仓 parity 格：{clean × 39 值同}——两侧各自实跑同干净仓，commit_count/facts 数一致（值等比对照常）
const FXC = join(tmp, 'fx-clean');
mkdirSync(join(FXC, 'docs', 'adr'), { recursive: true });
gitR(['init'], FXC); gitR(['config', 'user.email', 'a@b.c'], FXC); gitR(['config', 'user.name', 't'], FXC); gitR(['config', 'commit.gpgsign', 'false'], FXC);
writeFileSync(join(FXC, 'CONTEXT.md'), 'macro audit positioning determinism traceability provenance receipt' + NL, 'utf8');
writeFileSync(join(FXC, 'package.json'), '{"name":"fxc","private":true}' + NL, 'utf8');
gitR(['add', '-A'], FXC); gitR(['commit', '-m', 'init'], FXC);
writeFileSync(join(FXC, 'docs', 'adr', '001-decision.md'), ['# ADR-001', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: t', '- Ledger: D-001', '', '## Context', 'x.', '', '## Decision', 'y.', '', '## Consequences', 'z; supersedes ADR-000.'].join(NL), 'utf8');
gitR(['add', '-A'], FXC); gitR(['commit', '-m', 'adr'], FXC);
const OUT_C = join(tmp, 'out-audit-clean');
const rac = spawnSync('node', [CLI, 'audit', FXC, '--out', OUT_C], { encoding: 'utf8', timeout: 120000 });
const OUT_39C = join(tmp, 'out-39-clean');
const r39c = spawnSync('node', [ONESHOT39, '--repo', 'fxc', '--root', FXC, '--out', OUT_39C], { encoding: 'utf8', timeout: 120000 });
t('F4 干净仓 parity 格：两侧皆 exit 0（clean×值同格，无预期分歧）', rac.status === 0 && r39c.status === 0, 'audit=' + rac.status + ' 39=' + r39c.status);
const mc = existsSync(join(OUT_C, 'audit-measurements.json')) ? JSON.parse(txt(join(OUT_C, 'audit-measurements.json'))) : null;
const m39c = existsSync(join(OUT_39C, '39-macro-b-fxc-measurements.json')) ? JSON.parse(txt(join(OUT_39C, '39-macro-b-fxc-measurements.json'))) : null;
t('F5 干净仓 commit_count 双侧一致（值等粒度）', !!mc && !!m39c && mc.commit_count === m39c.commit_count && mc.commit_count === 2, 'eng=' + (mc && mc.commit_count) + ' 39=' + (m39c && m39c.commit_count));

const relog = gitR(['log', '--pretty=format:%H|%cI'], FX).split(NL).filter(function (l) { return l.indexOf('|') > 0; });
const badN = relog.filter(function (l) { return l.split('|')[1] !== undefined && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T/.test(l.split('|')[1]); }).length;
t('F6 独立重放病态数=1 与 quarantine_log committer_date 行数一致（自持 SQL+git 重放=独立半层）', badN === 1 && setA.length === badN, 'relog-bad=' + badN + ' db=' + setA.length);
const mdA = existsSync(join(OUT_A, 'report.md')) ? txt(join(OUT_A, 'report.md')) : '';
t('F7 引擎报告 Intake Health 表含病态 sha', mdA.indexOf(BADSHA) >= 0);
// D-118③：预期分歧类条目须落 known-gaps 册（gap↔trigger 单向互链）
const KG = join(REPO, 'docs', 'known-gaps.md');
t('F8 分歧类条目登记 docs/known-gaps.md（GAP-078-01=39 解析失败格）', existsSync(KG) && txt(KG).indexOf('GAP-078-01') >= 0 && txt(KG).indexOf('解析失败') >= 0, existsSync(KG) ? 'file exists, gap-id missing' : 'missing file');

rmSync(tmp, { recursive: true, force: true });
console.log('78CHECK ' + pass + '/' + (pass + fail));
if (fail > 0) { process.exit(1); }
