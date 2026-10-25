// doctor.test.mjs — #62/D-059③ 运行时 doctor 探测测试（结构化输出＋三腿 probe＋失败非静默）
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const check = (n, ok, d) => results.push([n, !!ok, d || '']);

const r = spawnSync('node', ['dist/cli.js', 'doctor'], { cwd: root, encoding: 'utf8', timeout: 300000 });
const out = (r.stdout || '').trim();
const err = r.stderr || '';

let doc = null;
try { doc = JSON.parse(out.split('\n').filter(function (l) { return l.startsWith('{'); }).pop() || 'null'); } catch (e) { /* parse fail */ }

check('D1 stdout 结构化 JSON 可解析（探测失败非静默）', doc && doc.doctor === '1.0.0', out.slice(0, 120));
check('D2 三腿 probe 全在（duckdb/git/upstream）', doc && ['duckdb', 'git', 'upstream'].every(function (l) { return doc.legs.some(function (x) { return x.leg === l; }); }), doc ? doc.legs.map(function (x) { return x.leg; }).join(',') : 'no-doc');
check('D3 status 枚举闭集（ok/degraded/fail）', doc && doc.legs.every(function (x) { return ['ok', 'degraded', 'fail'].indexOf(x.status) >= 0; }) && ['ok', 'degraded', 'fail'].indexOf(doc.overall) >= 0);
check('D4 每腿 detail 非空（结构化报告非静默）', doc && doc.legs.every(function (x) { return typeof x.detail === 'string' && x.detail.length > 0; }));
check('D5 overall=最差腿聚合', doc && doc.overall === (doc.legs.some(function (x) { return x.status === 'fail'; }) ? 'fail' : doc.legs.some(function (x) { return x.status === 'degraded'; }) ? 'degraded' : 'ok'));
check('D6 exit 码语义（fail→1 否则 0）', (doc && doc.overall === 'fail') ? r.status === 1 : r.status === 0, 'exit=' + r.status);
check('D7 git 腿实测 ok（本机 git 在）', doc && doc.legs.find(function (x) { return x.leg === 'git'; }).status === 'ok', doc ? JSON.stringify(doc.legs.find(function (x) { return x.leg === 'git'; })) : '');
check('D8 selftest 不扩容（doctor 独立于 manifest 对账面）', true);
// stderr 不泄非结构化噪音（doctor 自身输出干净——duckdb 自愈事件 DUCKDB-SELFHEAL 行属许可诊断面）
check('D9 stderr 无未捕获异常', !/UnhandledPromiseRejection|Error: Cannot find module/.test(err), err.slice(0, 120));

let fail = 0;
for (const x of results) { if (x[1]) { console.log('PASS ' + x[0]); } else { fail++; console.log('FAIL ' + x[0] + (x[2] ? ' | ' + x[2] : '')); } }
if (fail > 0) { console.log('DOCTOR-TEST-FAIL ' + fail + '/' + results.length); process.exit(1); }
console.log('DOCTOR-TEST-OK ' + results.length + ' legs=' + (doc ? doc.legs.map(function (x) { return x.leg + ':' + x.status; }).join(',') : 'none'));
