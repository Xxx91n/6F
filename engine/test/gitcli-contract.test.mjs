// gitcli-contract.test.mjs — 查 git 打出来的 %cI 时间形状对不对（#54 / D-059①；拿 dist 编译产物跑）
// 事情是这样：git 版本低于 2.45 时，UTC 时间的提交会写成 '+00:00'，2.45 以后写成 'Z'。同一个 commit
// 对象，换个 git 版本字面就不一样，这会一路把 traceId→fact_id→receipt→report 那条逐字节确定性链撞坏。
// 拦住它的地方是 intake.normalizeGitIsoDate：把 '+00:00' 归一成 'Z'，而且严格查 ISO 形状
// （形状不对就报 GITCLI-OUTPUT-CONTRACT，不许悄悄放过）。
// 这一条就对应 upstream-lock.yaml 里 git-cli 那行「输出解析为契约」的实跑把关。
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const I = await import(pathToFileURL(join(root, 'dist', 'intake', 'intake.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }
function throwsCode(fn, code) { try { fn(); return 'no-throw'; } catch (e) { return e.code === code ? '' : (e.code || e.message); } }

const N = I.normalizeGitIsoDate;
check('G1 +00:00 归一成 Z（git 低于 2.45 时这么写）', N('2026-01-05T09:00:00+00:00') === '2026-01-05T09:00:00Z');
check('G2 本来就是 Z 的，原样放过（git 2.45 以后这么写）', N('2026-01-05T09:00:00Z') === '2026-01-05T09:00:00Z');
check('G3 不是 UTC 的偏移，原样放过（+08:00 两个版本写法一样，不用动）', N('2026-09-17T13:33:21+08:00') === '2026-09-17T13:33:21+08:00');
check('G4 负偏移也原样放过', N('2026-01-05T04:00:00-05:00') === '2026-01-05T04:00:00-05:00');
check('G5 前后带空格的，去掉空格', N('  2026-01-05T09:00:00Z ' + String.fromCharCode(10)) === '2026-01-05T09:00:00Z');
check('G6 一串 epoch 数字要拒掉（混进 %ct 的写法就当形状不对）', throwsCode(function () { N('1789623201'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G7 空字符串要拒掉（格式坏的行不许悄悄忽略）', throwsCode(function () { N(''); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G8 undefined 要拒掉', throwsCode(function () { N(undefined); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G9 截断的 ISO 要拒掉', throwsCode(function () { N('2026-01-05T09:00'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G10 带毫秒的要拒掉（%cI 的契约只到秒）', throwsCode(function () { N('2026-01-05T09:00:00.000Z'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G11 换个版本写法，同一时刻归一后是同一个字面（下游哈希链不会漂）', N('2026-03-02T10:00:00+00:00') === N('2026-03-02T10:00:00Z'));

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('GITCLI-CONTRACT ' + results.length + '/' + results.length) : 'GITCLI-CONTRACT-FAIL');
process.exit(ok ? 0 : 1);
