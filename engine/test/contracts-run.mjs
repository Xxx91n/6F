// contracts-run.mjs —— 迁移自 .scratch 守卫组的产品契约断言执行器（治理庭 C2 落地）。
// 逐件 spawn node engine/test/contracts/*-check.mjs，汇总 PASS/FAIL；任一非零即整体失败。
// SKIP 语义由各 check 内 env-contract need() 自管——本执行器不判环境只汇总退出码；
// 组级 SKIP-GROUP 行全量留存＋计数进终行 SKIP-GROUPS=<n> 机读位（跳过不隐身，判定与退出码不变）。
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, 'contracts');
const files = readdirSync(DIR).filter(f => /-check.mjs$/.test(f)).sort();
let fails = 0;
let skipGroups = 0;
for (const f of files) {
  const r = spawnSync('node', [join(DIR, f)], { encoding: 'utf8', timeout: 300000 });
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  const lines = out.split(String.fromCharCode(10));
  // 组级 SKIP 行由 check 在跑动前打印——「尾 2 行」窗口必截掉它，整组没跑却在汇总里显示干净＝假绿面，
  // 故独立留存打印并计数（SKIP 仍不算红、不改判定，只保证不可见性归零）。
  const skipped = lines.filter(l => /^GUARD-RESULT: SKIP-GROUP\b|^SKIP \S+\/\S+\b/.test(l));
  if (skipped.length) console.log('SKIP-GROUP  ' + f + '  — ' + skipped.join(' | ').slice(0, 300));
  skipGroups += lines.filter(l => /^GUARD-RESULT: SKIP-GROUP\b/.test(l)).length;
  const tail = lines.filter(l => /PASS|FAIL|SKIP|WARN|error/i.test(l)).slice(-2).join(' | ');
  if (r.status === 0) { console.log('PASS  ' + f + (tail ? '  — ' + tail.slice(0, 140) : '')); }
  else { fails++; console.log('FAIL(' + r.status + ') ' + f + '  — ' + (tail || out.slice(-200)).slice(0, 200)); }
}
console.log('---');
console.log((fails === 0 ? 'PASS' : 'FAIL') + ' ' + (files.length - fails) + '/' + files.length + ' contract checks' + ' SKIP-GROUPS=' + skipGroups);
process.exit(fails === 0 ? 0 : 1);
