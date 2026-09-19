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
// sealed 第三态（D-073③/#65）：acceptance-probe-attestation.jsonl = 验收探针显式退役双锚（append-only）；
// sealed 断言移出执行集——守卫源以 sealed('<slug>') 发射 SEALED 行（非 PASS/FAIL），本层计数顶显并对 entries∩sealed 互斥机检。
const ATT = join(HERE, 'acceptance-probe-attestation.jsonl');
const attRows = existsSync(ATT) ? readFileSync(ATT, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l)) : [];
const sealedSet = {};
for (const r of attRows) { const g = r.guard; (sealedSet[g] = sealedSet[g] || new Set()).add(r['assertion-slug']); }
const entryKeySet = new Set(entries.map(e => e.guard + ':' + e['assertion-slug']));
const problems = [];
const overlap0 = attRows.filter(r => entryKeySet.has(r.guard + ':' + r['assertion-slug'])).map(r => r.id);
if (overlap0.length) problems.push('entries-sealed-overlap:' + overlap0.join(','));
const perGuard = {};

for (const g of guards) {
  const gp = join(HERE, g + '-check.mjs');
  if (!existsSync(gp)) { problems.push('guard-missing:' + g); continue; }
  const r = spawnSync(process.execPath, [gp], { encoding: 'utf8', timeout: 180000 });
  const out = (r.stdout || '') + '\n' + (r.stderr || '');
  const seen = {};
  const seenSealed = {};
  for (const line of out.split('\n')) {
    const m = line.match(/^(PASS|FAIL)\s+([A-Z]+\d+[a-z]?)\b/);
    if (m) seen[m[2]] = m[1];
    const ms = line.match(/^SEALED\s+([A-Z]+\d+[a-z]?)\b/);
    if (ms) seenSealed[ms[1]] = true;
  }
  if (r.error || (r.status !== 0 && Object.keys(seen).length === 0)) problems.push('guard-crash:' + g + (r.error ? ' ' + String(r.error).slice(0, 80) : ''));
  perGuard[g] = { seen, seenSealed };
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
// sealed 面机检：emit 必有 attestation 行；sealed 断言不得再吐 PASS/FAIL（复活=信号洞）
for (const g of guards) {
  const pg = perGuard[g];
  if (!pg) continue;
  const attSlugs = sealedSet[g] || new Set();
  for (const slug of Object.keys(pg.seenSealed || {})) {
    if (!attSlugs.has(slug)) problems.push('sealed-no-attestation:' + g + ':' + slug);
  }
  for (const slug of attSlugs) {
    if (pg.seen[slug]) problems.push('sealed-resurrected:' + g + ':' + slug);
  }
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
  const nSealedEmit = Object.keys(pg.seenSealed || {}).length;
  if (nSealedEmit) lines.push('SEALED ' + g + ': ' + nSealedEmit + ' assertions sealed（fired-attestation 在档，移出执行集）');
}
if (entries.length > CAP) problems.push('over-cap:' + entries.length + '>' + CAP);

if (attRows.length) console.log('SEALED: ' + attRows.length + ' (fired-attestation: acceptance-probe-attestation.jsonl)');
if (xfailCount > 0) console.log('XFAIL: ' + xfailCount + ' (cap ' + CAP + ')');
lines.forEach(l => console.log(l));
console.log('---');
console.log(problems.length === 0 ? 'XFAIL-RUN PASS（仅已登记 XFAIL ' + xfailCount + ' 条，entries=' + entries.length + '/' + CAP + '）' : 'XFAIL-RUN FAIL ' + problems.length + ' problems :: ' + problems.join(' '));
process.exit(problems.length === 0 ? 0 : 1);
