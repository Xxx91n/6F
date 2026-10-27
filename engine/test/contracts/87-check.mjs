// 87-check.mjs —— #31 registry 可执行引用一致性守卫（ADR-0027／spec #38）
// 断言面：A 策略面（meta.reference_resolution 齐备＋解析根实存）→ B 抽取规则自证（路径/裸名/_lib 命中，
//   通配与占位不抽取）→ C 全量对账（每条 .mjs 引用可解析，或逐条登记 historical）→ D 反向对账
//   （historical 必须仍被引用、必须不可解析、kind 与 reason 齐备且家族匹配）→ E 消费面活性
//   （guards[]／confirmations[] 两族各有引用，防字段改名后守卫空转）→ F 判别臂负对照
//   （未登记／已登记／复活／kind 错配／空理由／悬空六态）。
// 纪律：只读仓内 JSON 与文件系统，零写；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute, relative } from 'node:path';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#31 registry 可执行引用一致性（ADR-0027）——.mjs 引用可解析或逐条 historical';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const REG = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '33-gate-registry.json');

// 通配/占位写法不是文件引用：#31 票面点名 `NN-check.mjs` 是措辞截出的伪引用。
const NON_REFERENCE = new Set(['NN-check.mjs']);
// 前位排除 - . * /：`*-check.mjs` 不得截出 `check.mjs`，`*.test.mjs` 不得截出 `test.mjs`。
const REF_RE = /(?<![A-Za-z0-9_.*\/-])((?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_][A-Za-z0-9_.-]*\.mjs)\b/g;

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 400) : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- 抽取与判定（F 组负对照直接复用） ----------
function extractRefs(root) {
  const refs = new Map();
  (function walk(v, path) {
    if (typeof v === 'string') {
      for (const m of v.matchAll(REF_RE)) {
        const ref = m[1];
        if (NON_REFERENCE.has(ref)) continue;
        if (!refs.has(ref)) refs.set(ref, new Set());
        refs.get(ref).add(path);
      }
      return;
    }
    if (Array.isArray(v)) { v.forEach(function (x, i) { walk(x, path + '[' + i + ']'); }); return; }
    if (v && typeof v === 'object') { for (const k of Object.keys(v)) walk(v[k], path ? path + '.' + k : k); }
  })(root, '');
  return refs;
}

function refsFromStrings(strings) {
  const out = new Map();
  for (const s of strings) {
    if (typeof s !== 'string') continue;
    for (const m of s.matchAll(REF_RE)) {
      if (NON_REFERENCE.has(m[1])) continue;
      out.set(m[1], (out.get(m[1]) || 0) + 1);
    }
  }
  return out;
}

function resolveRef(ref, roots) {
  for (const root of roots) {
    const p = join(root, ref);
    if (existsSync(p) && statSync(p).isFile()) return relative(REPO, p).split('\\').join('/');
  }
  return null;
}

function classify(refs, historical, resolve) {
  const v = [];
  for (const [ref, paths] of refs) {
    const target = resolve(ref);
    const h = historical[ref];
    if (target) {
      if (h) v.push('STALE-HISTORICAL ' + ref + ' -> ' + target);
      continue;
    }
    if (!h) { v.push('UNRESOLVED-UNDECLARED ' + ref + ' @ ' + [...paths].slice(0, 3).join(' | ')); continue; }
    if (h.kind !== 'archived-path' && h.kind !== 'retired-script') { v.push('BAD-KIND ' + ref + ' :: ' + h.kind); continue; }
    if (typeof h.reason !== 'string' || h.reason.trim().length < 10) v.push('EMPTY-REASON ' + ref);
    const want = ref.indexOf('reports/') === 0 ? 'archived-path' : 'retired-script';
    if (h.kind !== want) v.push('KIND-MISMATCH ' + ref + ' :: ' + h.kind + ' != ' + want);
  }
  for (const ref of Object.keys(historical)) { if (!refs.has(ref)) v.push('DANGLING-HISTORICAL ' + ref); }
  return v;
}

// ---------- A. 策略面 ----------
const reg = JSON.parse(readFileSync(REG, 'utf8'));
const policy = reg.meta && reg.meta.reference_resolution;
t('A1 meta.reference_resolution 齐备（rule 非空＋resolution_roots 数组＋historical 对象）',
  !!policy && typeof policy.rule === 'string' && policy.rule.trim().length >= 20 &&
  Array.isArray(policy.resolution_roots) && policy.historical && typeof policy.historical === 'object' && !Array.isArray(policy.historical));

const declaredRoots = (policy && Array.isArray(policy.resolution_roots)) ? policy.resolution_roots : [];
const badRoots = declaredRoots.filter(function (r) { return typeof r !== 'string' || r === '' || isAbsolute(r) || r.split(/[\\/]/).indexOf('..') >= 0; });
const roots = declaredRoots.filter(function (r) { return typeof r === 'string'; }).map(function (r) { return r === '<repo>' ? REPO : join(REPO, r); });
t('A2 解析根仓相对且实存（<repo> 必在其中）',
  declaredRoots.indexOf('<repo>') >= 0 && badRoots.length === 0 && roots.every(function (r) { return existsSync(r) && statSync(r).isDirectory(); }),
  'bad=' + JSON.stringify(badRoots));

// ---------- B. 抽取规则自证 ----------
const sample = 'reports/33-check.mjs、38-check.mjs＋_lib/check-kit.mjs；*-check.mjs 与 NN-check.mjs 不是引用；*.test.mjs 也不截。';
const sampleRefs = [...extractRefs({ s: sample }).keys()].sort();
const sampleWant = ['38-check.mjs', '_lib/check-kit.mjs', 'reports/33-check.mjs'];
t('B1 抽取规则：路径/裸名/_lib 命中，通配与占位不抽取', JSON.stringify(sampleRefs) === JSON.stringify(sampleWant), JSON.stringify(sampleRefs));

// ---------- C. 全量对账 ----------
const refs = extractRefs(reg);
const historical = (policy && policy.historical) || {};
const violations = classify(refs, historical, function (r) { return resolveRef(r, roots); });
const liveRefs = [...refs.keys()].filter(function (r) { return resolveRef(r, roots); });
t('C1 每条 .mjs 引用可解析，或逐条登记 historical（零未登记死引用）', violations.length === 0, violations.join(' ;; '));
t('C2 对账面非空（live>0 且 historical>0）', liveRefs.length > 0 && Object.keys(historical).length > 0,
  'live=' + liveRefs.length + ' historical=' + Object.keys(historical).length);

// ---------- D. 反向对账 ----------
const histKeys = Object.keys(historical);
t('D1 historical 逐条 kind/reason 齐备（kind 二态合法＋reason 非空）',
  histKeys.every(function (k) { const h = historical[k]; return h && (h.kind === 'archived-path' || h.kind === 'retired-script') && typeof h.reason === 'string' && h.reason.trim().length >= 10; }),
  histKeys.filter(function (k) { const h = historical[k]; return !h || typeof h.reason !== 'string' || h.reason.trim().length < 10; }).join(','));
t('D2 reports/* 一律 archived-path，其余一律 retired-script（家族与 kind 互证）',
  histKeys.every(function (k) { return historical[k].kind === (k.indexOf('reports/') === 0 ? 'archived-path' : 'retired-script'); }),
  histKeys.filter(function (k) { return historical[k].kind !== (k.indexOf('reports/') === 0 ? 'archived-path' : 'retired-script'); }).join(','));
t('D3 historical 条目必须仍被 registry 引用（零悬空登记）', histKeys.every(function (k) { return refs.has(k); }),
  histKeys.filter(function (k) { return !refs.has(k); }).join(','));
t('D4 historical 条目必须不可解析（复活即红——防声明与实存双真）', histKeys.every(function (k) { return !resolveRef(k, roots); }),
  histKeys.filter(function (k) { return !!resolveRef(k, roots); }).join(','));

// ---------- E. 消费面活性 ----------
const guardRefs = refsFromStrings(reg.items.flatMap(function (i) { return Array.isArray(i.guards) ? i.guards : []; }));
const confRefs = refsFromStrings(reg.items.flatMap(function (i) {
  return (Array.isArray(i.confirmations) ? i.confirmations : []).map(function (c) { return [c && c.evidence, c && c.reason].filter(Boolean).join(' '); });
}));
t('E1 guards[] 面有可抽取引用（字段改名后守卫不得空转）', guardRefs.size > 0, 'n=' + guardRefs.size);
t('E2 confirmations[] 面有可抽取引用（evidence/reason 双字段）', confRefs.size > 0, 'n=' + confRefs.size);

// ---------- F. 判别臂负对照（合成样本，不读仓内状态） ----------
const mark = function (kind, reason) { return { kind: kind, reason: reason }; };
const cases = [
  ['F1 未登记死引用 → UNRESOLVED-UNDECLARED', [['999-missing.mjs']], {}, function () { return null; }, 'UNRESOLVED-UNDECLARED'],
  ['F2 已登记死引用 → 零违规', [['999-missing.mjs']], { '999-missing.mjs': mark('retired-script', 'negative control: declared historical') }, function () { return null; }, null],
  ['F3 historical 复活 → STALE-HISTORICAL', [['85-check.mjs']], { '85-check.mjs': mark('retired-script', 'negative control: must be live') }, function () { return 'engine/test/contracts/85-check.mjs'; }, 'STALE-HISTORICAL'],
  ['F4 reports/* kind 错配 → KIND-MISMATCH', [['reports/x.mjs']], { 'reports/x.mjs': mark('retired-script', 'negative control: kind mismatch') }, function () { return null; }, 'KIND-MISMATCH'],
  ['F5 空理由 → EMPTY-REASON', [['999-missing.mjs']], { '999-missing.mjs': mark('retired-script', '') }, function () { return null; }, 'EMPTY-REASON'],
  ['F6 悬空登记 → DANGLING-HISTORICAL', [], { '999-missing.mjs': mark('retired-script', 'negative control: dangling entry') }, function () { return null; }, 'DANGLING-HISTORICAL'],
];
for (const [name, refList, hist, resolver, want] of cases) {
  const m = new Map(refList.map(function (r) { return [r[0], new Set(['synthetic'])]; }));
  const got = classify(m, hist, resolver);
  const ok = want === null ? got.length === 0 : got.some(function (x) { return x.indexOf(want) === 0; });
  t(name, ok, JSON.stringify(got));
}

// ---------- G. 守卫卫生 ----------
t('G1 本守卫自身无 BOM', noBom(join(HERE, '87-check.mjs')));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
