// gitcli-contract.test.mjs — git %cI 输出形状契约 enforce 测试（#54 / D-059①；作用于 dist 编译产物）
// 背景：git <2.45 对 UTC 偏移提交吐 '+00:00'，≥2.45 吐 'Z'——同一 commit object 跨版本字面漂移，
// 击穿 traceId→fact_id→receipt→report 逐字节确定性链。enforce 位=intake.normalizeGitIsoDate：
// 归一化 '+00:00'→'Z'＋严格 ISO 形状断言（不符即 GITCLI-OUTPUT-CONTRACT，不静默放行）。
// 该断言即 upstream-lock.yaml git-cli 行「输出解析为契约」的实跑 enforce。
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const I = await import(pathToFileURL(join(root, 'dist', 'intake', 'intake.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }
function throwsCode(fn, code) { try { fn(); return 'no-throw'; } catch (e) { return e.code === code ? '' : (e.code || e.message); } }

const N = I.normalizeGitIsoDate;
check('G1 +00:00 → Z 归一化（git<2.45 拼写）', N('2026-01-05T09:00:00+00:00') === '2026-01-05T09:00:00Z');
check('G2 Z 原样通过（git≥2.45 拼写）', N('2026-01-05T09:00:00Z') === '2026-01-05T09:00:00Z');
check('G3 非 UTC 偏移原样通过（+08:00 两版一致不动）', N('2026-09-17T13:33:21+08:00') === '2026-09-17T13:33:21+08:00');
check('G4 负偏移原样通过', N('2026-01-05T04:00:00-05:00') === '2026-01-05T04:00:00-05:00');
check('G5 前后空白 trim', N('  2026-01-05T09:00:00Z ' + String.fromCharCode(10)) === '2026-01-05T09:00:00Z');
check('G6 epoch 数字串拒入（%ct 拼写混入即形状违例）', throwsCode(function () { N('1789623201'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G7 空串拒入（malformed 行不静默）', throwsCode(function () { N(''); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G8 undefined 拒入', throwsCode(function () { N(undefined); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G9 截断 ISO 拒入', throwsCode(function () { N('2026-01-05T09:00'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G10 毫秒形拒入（%cI 契约=秒精度）', throwsCode(function () { N('2026-01-05T09:00:00.000Z'); }, 'GITCLI-OUTPUT-CONTRACT') === '');
check('G11 跨版本拼写归一等价：同一时刻 +00:00 与 Z 产出同字面（下游哈希链不漂）', N('2026-03-02T10:00:00+00:00') === N('2026-03-02T10:00:00Z'));

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('GITCLI-CONTRACT ' + results.length + '/' + results.length) : 'GITCLI-CONTRACT-FAIL');
process.exit(ok ? 0 : 1);
