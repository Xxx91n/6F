// guard-all-run.mjs — D-149④ 升格判据执行器（#75批1 / T1 轮37 落盘生效，A-097）
// 收口判据（升格后，替代基线 18 件枚举快照）：
//   ① 全量实跑 reports/ 下 *-check.mjs + xfail-run.mjs（动态枚举，新 check 自动入列）；
//   ② rc≠0 的红件集 ⊆ known-red-manifest.json 登记 guard 集——册外新红 = FAIL；
//   ③ manifest 条目对应守卫实测转绿 → 复绿告警（strict 同 XPASS 语义：确定性红常驻=教团队无视红，复绿必须人工摘除）；
//   ④ manifest 指向不存在守卫文件 → 悬空条目 FAIL；
//   ⑤ 册内守卫的实测失败 slug 集与条目 expected_slugs 漂移 → WARN（非致命；新 slug 族出现应走册修）。
// 环境：子进程剥离 NODE_OPTIONS（宿主注入污染先例，R36 T2 坑位）；逐件 timeout 300s。
// 用法：node guard-all-run.mjs → 表格 + GUARD-ALL-RESULT 行；exit 0 = 判据满足。
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const NL = String.fromCharCode(10);
const TIMEOUT_MS = 300000;

const manifest = JSON.parse(readFileSync(join(HERE, 'known-red-manifest.json'), 'utf8'));
const registered = new Map(manifest.entries.map((e) => [e.guard, e]));

const targets = readdirSync(HERE)
  .filter((f) => /-check\.mjs$/.test(f) || f === 'xfail-run.mjs')
  .sort();

const results = [];
for (const f of targets) {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  const r = spawnSync(process.execPath, [join(HERE, f)], { cwd: HERE, env, encoding: 'utf8', timeout: TIMEOUT_MS });
  const out = String(r.stdout || '') + NL + String(r.stderr || '');
  const slugs = out.split(NL)
    .map((l) => { const m = l.match(/^\s*(?:FAIL[:: ]+|x )\s*([A-Za-z][A-Za-z0-9_.-]*)/); return m && !/^\d+$/.test(m[1]) ? m[1] : null; })
    .filter(Boolean);
  // SKIP 三态（D-159③）：GUARD-RESULT: SKIP 行→skipped（rc=0 非绿非红；skip 不进 allOk 禁折 pass；reason 进 footer）
  const skipM = out.match(/GUARD-RESULT:\s*SKIP\s+\S+\s+reason=([^\n]+)/);
  results.push({ file: f, rc: r.status === null ? 124 : r.status, slugs, skipped: !!skipM, skipReason: skipM ? skipM[1].trim() : '' });
}

const redSet = new Set(results.filter((r) => r.rc !== 0).map((r) => r.file));
const greenFiles = new Set(results.filter((r) => r.rc === 0 && !r.skipped).map((r) => r.file));
const skipSet = new Set(results.filter((r) => r.skipped).map((r) => r.file));

let fail = 0;
const FAIL = (msg) => { fail++; console.log('FAIL ' + msg); };
const WARN = (msg) => console.log('WARN ' + msg);

// ② 册外新红
for (const f of redSet) {
  if (!registered.has(f)) FAIL('册外新红（须 D-094 三分类：修真坏/改断言/入册带锚）: ' + f);
}
// ③ 册件复绿 + ④ 悬空 + ⑤ slug 漂移
for (const [file, e] of registered) {
  if (!existsSync(join(HERE, file))) { FAIL('manifest 悬空条目（守卫文件不存在）: ' + file + ' [' + e.id + ']'); continue; }
  if (greenFiles.has(file)) { FAIL('册件复绿告警（strict 摘除制——复绿须人工摘条目）: ' + file + ' [' + e.id + ']'); continue; }
  if (skipSet.has(file)) { WARN('册件转 SKIP（环境缺席——非复绿非红，slug 比对免）: ' + file + ' [' + e.id + ']'); continue; }
  if (Array.isArray(e.expected_slugs)) {
    const actual = results.find((r) => r.file === file).slugs;
    const extra = actual.filter((s) => e.expected_slugs.indexOf(s) < 0);
    const gone = e.expected_slugs.filter((s) => actual.indexOf(s) < 0);
    if (extra.length || gone.length) WARN('slug 漂移 ' + file + ' [' + e.id + '] +' + JSON.stringify(extra) + ' -' + JSON.stringify(gone) + '（更新册条目或扩判）');
  }
}

console.log('----------------------------------------');
for (const r of results) {
  const tag = r.skipped ? 'SKIP ' : r.rc === 0 ? 'GREEN ' : registered.has(r.file) ? 'KNOWN-RED ' : 'RED ';
  console.log(tag + r.file + (r.skipped ? ' reason=' + r.skipReason : r.rc === 0 ? '' : ' rc=' + r.rc + (r.slugs.length ? ' slugs=' + r.slugs.join(',') : '')));
}
console.log('----------------------------------------');
console.log('ran=' + results.length + ' green=' + greenFiles.size + ' skipped=' + skipSet.size + ' red=' + redSet.size + ' registered=' + registered.size + ' problems=' + fail + ' allOk=' + (fail === 0 && skipSet.size === 0));
if (skipSet.size) { for (const r of results.filter((x) => x.skipped)) console.log('  skip-reason ' + r.file + ' :: ' + r.skipReason); }
console.log('GUARD-ALL-RESULT: ' + (fail === 0 ? 'PASS' : 'FAIL'));
process.exit(fail === 0 ? 0 : 1);
