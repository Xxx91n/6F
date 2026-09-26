// 75a-check.mjs — #75批1 失效断言三分类建制守卫（D-094②③④ / D-144② / D-149④ / P5-B2 同名断言普查落点）
// 职责：
//   ① 字面钉普查 pass：扫 reports/ 全 *-check.mjs 源码（剥注释后）检出
//      日期字面量 / 魔数地板 / 裸 occurred=== / 无牙断言 / 未剥注释原文扫描 / 纯存在性断言 / 同名多命中弱隔离钉；
//      检出条目须在 75a-census-register.json 有归因注记（检出=须归因，非须红）。
//   ② presence/liveness/readiness 三层命名：existence 断言注册条目须标 layer。
//   ③ known-red-manifest.json 元校验（四要素+类别域+政策句在文）；stale-assertions.json meta 须载 D-094 禁欺诈入册条款。
//   ④ 41a-D7 字面钉回归钉（cl.indexOf(dMax) 不得回潮——已结构不变量化）。
//   ⑤ 正对照自检（D-079⑥ 同型）：合成源码注入各族锚点 → 探测器必抓（守卫守卫者也被守）。
// 用法：node 75a-check.mjs → PASS/FAIL；exit 0 = 全绿。node 75a-check.mjs --emit → 只吐普查 findings JSON。
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stripComments } from './_lib/check-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const NL = String.fromCharCode(10);
const EMIT = process.argv.indexOf('--emit') >= 0;

// 普查豁免面（普查机件自身+全量跑执行器——探测器字面量非断言钉；xfail-run 仍在列）
const SCAN_EXEMPT = new Set(['75a-check.mjs', 'guard-all-run.mjs']);
const ASSERT_CALL = /(?:^|[^.\w])(?:t|check|ok|chk|assert)\s*\(/;

const sha8 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);
const keyOf = (f, kind, line) => f + '|' + kind + '|' + (line === null ? 'file' : sha8(line.trim()));

// ---------- 探测核（纯函数，正对照可复用） ----------
function findInSource(file, strippedLines) {
  const out = [];
  strippedLines.forEach((line, idx) => {
    const lno = idx + 1;
    if (/(?:^|[^.\w])(19|20)\d{2}-\d{2}-\d{2}/.test(line)) out.push({ file, kind: 'date-literal', line, lno });
    if (ASSERT_CALL.test(line) && /(>=|<=|===|!==|>|<)\s*\d{2,}\b/.test(line)) out.push({ file, kind: 'magic-floor', line, lno });
    if (/occurred\s*===?\s*(?:true|false|1|0)/.test(line)) out.push({ file, kind: 'bare-occurred', line, lno });
    if (/(?:\.length|\.size)\s*>=\s*0\b/.test(line) || ASSERT_CALL.test(line) && /,\s*true\s*[,)]/.test(line)) out.push({ file, kind: 'toothless', line, lno });
    if (ASSERT_CALL.test(line) && /existsSync\s*\(/.test(line)) out.push({ file, kind: 'existence-assert', line, lno });
  });
  return out;
}

function unstrippedScanHit(file, srcText) {
  if (/stripComments|stripMdComments/.test(srcText)) return false;
  const readsSource = /readFileSync\([^)]*(ts|md|mjs)[^)]*\)/.test(srcText) || /(?:txt|read)\s*\([^)]*\.(ts|md|mjs)/.test(srcText);
  const probes = /\.indexOf\(|\.includes\(|\.test\(/.test(srcText);
  return readsSource && probes;
}

// ---------- 全量普查 ----------
const checkFiles = readdirSync(HERE).filter((f) => /-check\.mjs$/.test(f) || f === 'xfail-run.mjs');
const findings = [];
const probeLiterals = new Map(); // literal -> {file, lno}
for (const f of checkFiles) {
  if (SCAN_EXEMPT.has(f)) continue;
  const raw = readFileSync(join(HERE, f), 'utf8');
  const stripped = stripComments(raw);
  findings.push(...findInSource(f, stripped.split(NL)));
  if (unstrippedScanHit(f, raw)) findings.push({ file: f, kind: 'unstripped-scan', line: f + ' 源文扫描未过剥注释面（名↔检通用化登记项）', lno: null });
  for (const m of raw.matchAll(/\.indexOf\(\s*(['"`])((?:(?!\1).){20,}?)\1/g)) probeLiterals.set(m[2], { file: f });
}

// 同名多命中普查（P5-B2 型：断言探针字面量在单文件 ≥2 命中=弱隔离）
const corpus = [];
function walk(d, depth) {
  if (depth > 4) return;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git$|dist$|tmp$/.test(e.name)) walk(p, depth + 1); }
    else if (/\.(ts|js|md|mjs|json|yml|yaml)$/.test(e.name) && e.name.indexOf('75a-') !== 0) { try { corpus.push({ p, t: readFileSync(p, 'utf8') }); } catch { /* skip */ } }
  }
}
walk(join(ROOT, 'engine', 'src'), 0);
walk(join(ROOT, '.scratch', 'architecture-recovery'), 0);
walk(join(ROOT, 'docs'), 0);
for (const f of ['README.md', 'CHANGELOG.md', 'AGENTS.md', 'BACKLOG.md', '.scratch/architecture-recovery/BACKLOG.md']) {
  const p = join(ROOT, f); if (existsSync(p)) corpus.push({ p, t: readFileSync(p, 'utf8') });
}
for (const [lit, meta] of probeLiterals) {
  let maxFile = null, maxCount = 0;
  for (const c of corpus) {
    let n = 0, at = 0;
    while (true) { at = c.t.indexOf(lit, at); if (at < 0) break; n++; at += lit.length; }
    if (n > maxCount) { maxCount = n; maxFile = c.p; }
  }
  if (maxCount >= 2) findings.push({ file: meta.file, kind: 'multi-hit-probe', line: lit, lno: null, note: maxFile.slice(ROOT.length + 1) + '×' + maxCount });
}

findings.sort((a, b) => (a.file + a.kind + (a.line || '')).localeCompare(b.file + b.kind + (b.line || '')));

if (EMIT) {
  console.log(JSON.stringify(findings.map((f) => ({ key: keyOf(f.file, f.kind, f.line), file: f.file, kind: f.kind, lno: f.lno, excerpt: ((f.line || '').trim().slice(0, 90) + (f.note ? ' → ' + f.note : '')) })), null, 1));
  process.exit(0);
}

// ---------- 断言 ----------
let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

const reg = JSON.parse(readFileSync(join(HERE, '75a-census-register.json'), 'utf8'));
const regKeys = new Set(Object.keys(reg.entries));
const liveKeys = new Set(findings.map((f) => keyOf(f.file, f.kind, f.line)));

const unregistered = [...liveKeys].filter((k) => !regKeys.has(k));
t('C1 普查检出全量有归因注记（' + liveKeys.size + ' findings ↔ register ' + regKeys.size + ' 条）', unregistered.length === 0, unregistered.slice(0, 4).join(' | '));
const dangling = [...regKeys].filter((k) => !liveKeys.has(k));
t('C2 注册表零悬空条目（检出消失=条目须摘除）', dangling.length === 0, dangling.slice(0, 4).join(' | '));

const layerMiss = findings.filter((f) => f.kind === 'existence-assert' && ['presence', 'liveness', 'readiness'].indexOf((reg.entries[keyOf(f.file, f.kind, f.line)] || {}).layer || '') < 0);
t('C3 存在性断言全标层位（presence/liveness/readiness 三层命名约定）', layerMiss.length === 0, layerMiss.map((f) => f.file).slice(0, 4).join(','));

// 正对照：合成源码五族必抓
const synthetic = [
  "ok(x.length >= 0, 'always true')",
  "t('date pin', src.indexOf('2026-01-15') >= 0)",
  "t('ev', e.occurred === true)",
  "check('floor', rows.length >= 15, 'n')",
  "const probe = fs.readFileSync('a.ts'); t('x', probe.indexOf('needle-' + 'x') >= 0)",
  "t('ex', existsSync(join(HERE, 'a.json')))",
].join(NL);
const posHit = new Set(findInSource('synthetic', synthetic.split(NL)).map((f) => f.kind));
t('C4 正对照：合成源注入 日期/魔数/occurred/无牙/存在性 五族必抓', ['date-literal', 'magic-floor', 'bare-occurred', 'toothless', 'existence-assert'].every((k) => posHit.has(k)), [...posHit].join(','));
const negHit = findInSource('synthetic2', ["t('ok', xs.every((x) => x.id))", "const a = 2026"].join(NL).split(NL)).filter((f) => f.kind !== 'multi-hit-probe');
t('C5 负对照：正常断言行不误报', negHit.length === 0, negHit.map((f) => f.kind).join(','));

// manifest 元校验
const km = JSON.parse(readFileSync(join(HERE, 'known-red-manifest.json'), 'utf8'));
const mk = km.entries.every((e) => e.id && e.guard && e.failure_class === 'legit-drift' && e.evidence && e.review_anchor && e.expires_fallback && e.added && existsSync(join(HERE, e.guard)));
t('M1 known-red manifest schema 合规（legit-drift 单类域+四要素齐备+guard 文件在）', km.version === 1 && km.policy.indexOf('禁入册') >= 0 && mk, 'entries=' + km.entries.length);
const stale = JSON.parse(readFileSync(join(HERE, 'stale-assertions.json'), 'utf8'));
t('M2 stale-assertions meta 载 D-094 禁欺诈入册条款', stale.meta && typeof stale.meta.policy_d094 === 'string' && stale.meta.policy_d094.indexOf('欺诈') >= 0, '');

// 41a-D7 字面钉回归钉
const c41a = stripComments(readFileSync(join(HERE, '41a-check.mjs'), 'utf8'));
t('R1 41a-D7 结构不变量在位——cl.indexOf(dMax) 字面钉不得回潮（D-144②）', c41a.indexOf('cl.indexOf(dMax)') < 0 && c41a.indexOf('dCovered.has(+dMax.slice(2))') >= 0, '');

// 普查自身完整性：豁免面枚举在文、findings 落盘（供复跑比对）
const selfSrc = readFileSync(join(HERE, '75a-check.mjs'), 'utf8');
t('S1 普查豁免面枚举在册（75a/guard-all-run 机件免扫）', selfSrc.indexOf('SCAN_EXEMPT') >= 0 && selfSrc.indexOf('guard-all-run.mjs') >= 0, '');

import { writeFileSync } from 'node:fs';
writeFileSync(join(HERE, '75a-census-findings.json'), JSON.stringify(findings.map((f) => ({ key: keyOf(f.file, f.kind, f.line), file: f.file, kind: f.kind, lno: f.lno, excerpt: ((f.line || '').trim().slice(0, 110) + (f.note ? ' → ' + f.note : '')) })), null, 1) + NL, 'utf8');

console.log('----------------------------------------');
console.log('GUARD RESULT: ' + (fail === 0 ? 'PASS' : 'FAIL') + ' (' + pass + ' pass, ' + fail + ' fail) | findings=' + findings.length);
process.exit(fail === 0 ? 0 : 1);
