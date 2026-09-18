// xfail-run.mjs — #63/D-071 known-failures 清单制协议层（PASS/FAIL/XFAIL/XPASS）
// ① 断言照跑不 archived（Chromium/rustc 先例——不跑=丢 XPASS 自清信号）：每个清单守卫原样执行、逐断言重分级；
// ② exit 语义（strict）：未登记 FAIL / 任何 XPASS / 悬空条目 / 条目>cap → 非零；仅已登记 XFAIL → 零＋顶显 `XFAIL: n (cap 10)`；
// ③ 断言级稳定 id = 守卫输出首词 token（G1/A1/B5 形——36 守卫清点见 63-assertion-inventory.json），清单按 <guard>:<slug> 键；
// ④ 真回归禁入清单：未登记 FAIL 不静默吞——如实 FAIL 出局。
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIST = JSON.parse(readFileSync(join(HERE, 'stale-assertions.json'), 'utf8'));
const CAP = LIST.cap;
const entries = LIST.entries || [];

const guards = [...new Set(entries.map(e => e.guard))];
const perGuard = {};
const problems = [];

for (const g of guards) {
  const gp = join(HERE, g + '-check.mjs');
  if (!existsSync(gp)) { problems.push('guard-missing:' + g); continue; }
  const r = spawnSync(process.execPath, [gp], { encoding: 'utf8', timeout: 180000 });
  const out = (r.stdout || '') + '\n' + (r.stderr || '');
  const seen = {};
  for (const line of out.split('\n')) {
    const m = line.match(/^(PASS|FAIL)\s+([A-Z]+\d+[a-z]?)\b/);
    if (m) seen[m[2]] = m[1];
  }
  if (r.error || (r.status !== 0 && Object.keys(seen).length === 0)) problems.push('guard-crash:' + g + (r.error ? ' ' + String(r.error).slice(0, 80) : ''));
  perGuard[g] = { seen, crashed: !!r.error };
}

const lines = [];
let xfailCount = 0;
for (const e of entries) {
  const g = perGuard[e.guard];
  const st = g && g.seen[e['assertion-slug']];
  if (!g || !st) {
    problems.push('dangling:' + e.id);
    lines.push('FAIL DANGLING ' + e.id + '（断言在守卫输出缺席——摘条目或修映射）');
    continue;
  }
  if (st === 'FAIL') { xfailCount++; lines.push('XFAIL ' + e.guard + ':' + e['assertion-slug'] + ' | ' + e.id + ' | ' + (e.attribution || '').slice(0, 60)); }
  else { problems.push('xpass:' + e.id); lines.push('XPASS ' + e.guard + ':' + e['assertion-slug'] + '（strict 一律红——断言复绿须摘条目，无 lenient 逃生门）'); }
}
for (const g of guards) {
  const pg = perGuard[g];
  if (!pg) continue;
  const regSlugs = new Set(entries.filter(e => e.guard === g).map(e => e['assertion-slug']));
  let passN = 0, total = 0;
  for (const [slug, st] of Object.entries(pg.seen)) {
    total++;
    if (st === 'PASS') { passN++; }
    if (st === 'FAIL' && !regSlugs.has(slug)) {
      problems.push('unregistered:' + g + ':' + slug);
      lines.push('FAIL ' + g + ':' + slug + '（未登记 FAIL——真回归禁入清单：归因入册 or 修复，不得静默吞）');
    }
  }
  lines.push('PASS ' + g + ': ' + passN + '/' + total + ' assertions green（断言照跑——XFAIL 条目亦实跑非 skip）');
}
if (entries.length > CAP) problems.push('over-cap:' + entries.length + '>' + CAP);

if (xfailCount > 0) console.log('XFAIL: ' + xfailCount + ' (cap ' + CAP + ')');
lines.forEach(l => console.log(l));
console.log('---');
console.log(problems.length === 0 ? 'XFAIL-RUN PASS（仅已登记 XFAIL ' + xfailCount + ' 条，entries=' + entries.length + '/' + CAP + '）' : 'XFAIL-RUN FAIL ' + problems.length + ' problems :: ' + problems.join(' '));
process.exit(problems.length === 0 ? 0 : 1);
