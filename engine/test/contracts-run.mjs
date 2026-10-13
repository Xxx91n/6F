// contracts-run.mjs —— 迁移自 .scratch 守卫组的产品契约断言执行器（治理庭 C2 落地）。
// 逐件 spawn node engine/test/contracts/*-check.mjs，汇总 PASS/FAIL；任一非零即整体失败。
// SKIP 语义由各 check 内 env-contract need() 自管——本执行器不判环境只汇总退出码。
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, 'contracts');
const files = readdirSync(DIR).filter(f => /-check.mjs$/.test(f)).sort();
let fails = 0;
for (const f of files) {
  const r = spawnSync('node', [join(DIR, f)], { encoding: 'utf8', timeout: 300000 });
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  const tail = out.split(String.fromCharCode(10)).filter(l => /PASS|FAIL|SKIP|WARN|error/i.test(l)).slice(-2).join(' | ');
  if (r.status === 0) { console.log('PASS  ' + f + (tail ? '  — ' + tail.slice(0, 140) : '')); }
  else { fails++; console.log('FAIL(' + r.status + ') ' + f + '  — ' + (tail || out.slice(-200)).slice(0, 200)); }
}
console.log('---');
console.log((fails === 0 ? 'PASS' : 'FAIL') + ' ' + (files.length - fails) + '/' + files.length + ' contract checks');
process.exit(fails === 0 ? 0 : 1);
