// contracts-run.mjs —— 从 .scratch 那套检查脚本迁过来的产品契约断言执行器（治理庭 C2 落地）。
// 一件一件 spawn node engine/test/contracts/*-check.mjs，汇总 PASS/FAIL；任一非零就整体失败。
// SKIP 的语义由各 check 里的 env-contract need() 自己管——这个执行器不判环境，只汇总退出码；
// 组级 SKIP-GROUP 行整条留着并计数，进终行 SKIP-GROUPS=<n> 机器能读的字段（跳过不会被藏起来，判定和退出码都不变）。
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, 'contracts');
let only;
try { only = process.env.CONTRACTS_ONLY === undefined ? null : new RegExp(process.env.CONTRACTS_ONLY); }
catch (e) { console.error('Invalid CONTRACTS_ONLY regex: ' + e.message); process.exit(1); }
// 85-check 内部 audit 的预算是 420s；外层不能比它更短（tracker #54）。
const timeout = Number(process.env.CONTRACTS_TIMEOUT_MS ?? 420000);
if (!Number.isSafeInteger(timeout) || timeout <= 0 || timeout > 2147483647) {
  console.error('CONTRACTS_TIMEOUT_MS must be an integer between 1 and 2147483647'); process.exit(1);
}
const files = readdirSync(DIR).filter(f => /-check\.mjs$/.test(f) && (!only || only.test(f))).sort();
if (!files.length) { console.error('No contract checks matched CONTRACTS_ONLY'); process.exit(1); }
let fails = 0;
let skipGroups = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [join(DIR, f)], { encoding: 'utf8', timeout });
  // 超时和失败必须分得清：spawnSync 超时时 status=null，`FAIL(null)` 读起来像脚本崩了（#33 复盘时实际踩过）
  const timedOut = !!(r.error && r.error.code === 'ETIMEDOUT');
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  const lines = out.split(String.fromCharCode(10));
  // 组级 SKIP 行是 check 在开跑前打的——「最后 2 行」那个窗口必然会把它截掉，整组没跑却在汇总里看着干净＝假装通过，
  // 所以单独留出来打印并计数（SKIP 仍不算红、不改判定，只保证它不会被漏看）。
  const skipped = lines.filter(l => /^GUARD-RESULT: SKIP-GROUP\b|^SKIP \S+\/\S+\b/.test(l));
  if (skipped.length) console.log('SKIP-GROUP  ' + f + '  — ' + skipped.join(' | ').slice(0, 300));
  skipGroups += lines.filter(l => /^GUARD-RESULT: SKIP-GROUP\b/.test(l)).length;
  const tail = lines.filter(l => /PASS|FAIL|SKIP|WARN|error/i.test(l)).slice(-2).join(' | ');
  if (r.status === 0) { console.log('PASS  ' + f + (tail ? '  — ' + tail.slice(0, 140) : '')); }
  else { fails++; console.log('FAIL(' + (timedOut ? 'TIMEOUT' : (r.status === null ? (r.signal || (r.error && r.error.code) || 'UNKNOWN') : r.status)) + ') ' + f + '  — ' + (timedOut ? '超时 ' + timeout + 'ms signal=' + (r.signal || 'none') : (tail || out.slice(-200) || (r.error && r.error.message) || '')).slice(0, 200)); }
}
console.log('---');
console.log((fails === 0 ? 'PASS' : 'FAIL') + ' ' + (files.length - fails) + '/' + files.length + ' contract checks' + ' SKIP-GROUPS=' + skipGroups);
process.exit(fails === 0 ? 0 : 1);
