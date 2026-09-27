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
import { stripComments, realConsumption } from './_lib/check-kit.mjs';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#75批1 失效断言三分类建制守卫（D-094②③④ / D-144② / D-149④ / P5-B2 同名断言普查落点）';


const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const NL = String.fromCharCode(10);
const EMIT = process.argv.indexOf('--emit') >= 0;

// 普查豁免面（普查机件自身——探测器字面量非断言钉；xfail-run 仍在列）
// 批2-β③（D-154③）：摘除 guard-all-run.mjs 死项（枚举面 *-check.mjs 文案漂移合法演化类，
// D-094③ 归因在案）；S1 改写为「SCAN_EXEMPT ⊆ walked 枚举面」可达性自检（killable 不变式，死项即红）。
const SCAN_EXEMPT = new Set(['75a-check.mjs']);
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
    if (/--format=%h\b|'--short'|--abbrev(=|\b)/.test(line)) out.push({ file, kind: 'short-sha-pin', line, lno });
  });
  return out;
}

// 批2-β①（D-154①/ADR-0024）：豁免判据改测剥后源码消费位——import/真实调用计消费位，
// 注释提名不再豁免（全局豁免反模式收口）；探测谓词同走剥后面（注释内假消费位不计）。
function unstrippedScanHit(file, srcText) {
  const stripped = stripComments(srcText);
  // D-158① 谓词收紧：仅认剥注释+剥字符串后真消费形态——import/require 具名引入 或 stripComments(／stripMdComments( 裸调用位；
  //   字符串/属性名/标识符内提名不豁免（fxStringNom 正对照钉住——回滚即红）
  if (realConsumption(stripped)) return false;
  const readsSource = /readFileSync\([^)]*(ts|md|mjs)[^)]*\)/.test(stripped) || /(?:txt|read)\s*\([^)]*\.(ts|md|mjs)/.test(stripped);
  const probes = /\.indexOf\(|\.includes\(|\.test\(/.test(stripped);
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
  // 批2-β②（D-154②）：探针字面量收集扩 .includes(/.test( 调用形态（原仅 .indexOf( 逃逸面收口）
  for (const m of raw.matchAll(/\.(?:indexOf|includes|test)\(\s*(['"`])((?:(?!\1).){20,}?)\1/g)) probeLiterals.set(m[2], { file: f });
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
walk(join(ROOT, '.scratch', 'macro-audit'), 0); // 批2-β② 补漏面（实测零 .mjs——纯封洞）
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
  "execSync('git', ['log', '--format=%h', '-1'])",
].join(NL);
const posHit = new Set(findInSource('synthetic', synthetic.split(NL)).map((f) => f.kind));
t('C4 正对照：合成源注入 日期/魔数/occurred/无牙/存在性/短SHA钉 六族必抓', ['date-literal', 'magic-floor', 'bare-occurred', 'toothless', 'existence-assert', 'short-sha-pin'].every((k) => posHit.has(k)), [...posHit].join(','));
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

// 普查自身完整性：豁免面可达性自检、findings 落盘（供复跑比对）
// S1 批2-β③ 改写（D-154③）：恒真断言（自指文本命中即过）转 killable 不变式——
// 引枚举面集合（checkFiles=*-check.mjs+xfail-run.mjs walked 面）非自身文本，
// SCAN_EXEMPT 任一成员出枚举面（死项）即红（75a-C2 零悬空镜像；gitleaks --deny-unused-baseline 先例）。
const enumSurface = new Set(checkFiles);
const deadExempt = [...SCAN_EXEMPT].filter((f) => !enumSurface.has(f));
t('S1 普查豁免面可达性自检（SCAN_EXEMPT ⊆ walked 枚举面——死项即红）', deadExempt.length === 0, deadExempt.join(','));

// S2 批2-β③ 面A修法正对照 fixture（D-154③「改写后 S1 作面A修法首个正对照」落点）：
//   合成源注入——SCAN_EXEMPT 字面于真实消费位必被修后探测器命中；注释提名 stripComments 不再豁免；
//   真实 import/调用计消费位仍豁免。回滚①修复（豁免判据退回原文测试）即红=killable。
const fxConsumption = unstrippedScanHit('fx-consumption', "const ex = new Set(['SCAN_EXEMPT']); const s = readFileSync('a.mjs', 'utf8'); s.indexOf(ex);");
const fxCommentOnly = unstrippedScanHit('fx-comment-only', "// stripComments 注释提名不豁免\nconst s = readFileSync('a.mjs', 'utf8'); s.indexOf('k');");
const fxRealImport = unstrippedScanHit('fx-real-import', "import { stripComments } from './k.mjs'; const s = readFileSync('a.mjs', 'utf8'); s.indexOf(stripComments(s));");
const fxRealCall = unstrippedScanHit('fx-real-call', "const s = readFileSync('a.mjs', 'utf8'); s.indexOf(stripMdComments(s));");
const fxStringNom = unstrippedScanHit('fx-stringnom', "const s = readFileSync('a.mjs', 'utf8'); const label = 'stripComments 字符串提名'; s.indexOf(label);");
t('S2 消费位判据正对照（面A fixture：消费位命中/注释提名必中/字符串提名必中/真实消费位豁免）', fxConsumption === true && fxCommentOnly === true && fxStringNom === true && fxRealImport === false && fxRealCall === false, 'hit=' + fxConsumption + ' comment=' + fxCommentOnly + ' stringNom=' + fxStringNom + ' import=' + fxRealImport + ' call=' + fxRealCall);

// T 组（R40-T1：D-159② tier 自声明强制＋D-160③ protected_surface 双字段显式扩展——未声明=红）
const tierMap = new Map(), surfMap = new Map();
for (const f of checkFiles) {
  const srcT = readFileSync(join(HERE, f), 'utf8');
  const mt = srcT.match(/^const TIER = '(portable|env-contract)';$/m);
  const ms = srcT.match(/^const PROTECTED_SURFACE = '([^'\n]+)';$/m);
  tierMap.set(f, mt ? mt[1] : null);
  surfMap.set(f, ms ? ms[1] : null);
}
const noTier = checkFiles.filter((f) => !tierMap.get(f));
const noSurf = checkFiles.filter((f) => !surfMap.get(f));
t('T1 全量守卫 tier 自声明（portable|env-contract；未声明=红——stevenengelhardt/Bazel 反转先例）', noTier.length === 0, noTier.slice(0, 6).join(','));
t('T2 全量守卫 protected_surface 自声明非空（D-160③ 面消亡退役判据输入）', noSurf.length === 0, noSurf.slice(0, 6).join(','));
const envDeclared = checkFiles.filter((f) => tierMap.get(f) === 'env-contract').sort();
const reg33 = JSON.parse(readFileSync(join(HERE, '33-gate-registry.json'), 'utf8'));
const envRegItem = reg33.items.find((i) => i.id === 'env-gated-guard-class');
const envReg = ((envRegItem && envRegItem.guards) || []).slice().sort();
t('T3 env-contract 声明集 ↔ registry env-gated 类对账（声明≠登记即红——防事后标签漂移）', JSON.stringify(envDeclared) === JSON.stringify(envReg), 'decl=' + envDeclared.join(',') + ' reg=' + envReg.join(','));

import { writeFileSync } from 'node:fs';
writeFileSync(join(HERE, '75a-census-findings.json'), JSON.stringify(findings.map((f) => ({ key: keyOf(f.file, f.kind, f.line), file: f.file, kind: f.kind, lno: f.lno, excerpt: ((f.line || '').trim().slice(0, 110) + (f.note ? ' → ' + f.note : '')) })), null, 1) + NL, 'utf8');

console.log('----------------------------------------');
console.log('GUARD RESULT: ' + (fail === 0 ? 'PASS' : 'FAIL') + ' (' + pass + ' pass, ' + fail + ' fail) | findings=' + findings.length);
process.exit(fail === 0 ? 0 : 1);
