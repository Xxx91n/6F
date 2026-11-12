// 87-check.mjs —— #31 registry 可执行引用一致性检查（spec #38）
// 查什么：A 策略面（meta.reference_resolution 齐备＋解析根实存）→ B 抽取规则自己验一遍（路径/裸名/_lib 命中，
//   通配与占位不抽取）→ C 把全部引用逐条核一遍（每条 .mjs 引用可解析，或逐条登记 historical）→ D 再反过来核一遍
//   （historical 必须仍被引用、必须不可解析、kind 与 reason 齐备且家族匹配）→ E 消费面还活着
//   （guards[]／confirmations[] 两族各有引用，防字段改名后检查白跑一趟；E3 再逐条校验 confirmations[] 的键集与必备字段，
//   单改一个字段名当场红——tracker #229）→ F 这道判定的负对照
//   （未登记／已登记／复活／kind 错配／空理由／悬空／越界七态）→ H 逐条结构校验的负对照（合成样本）
//   → G 检查脚本自身的卫生（无 BOM）。
// 纪律：只读仓内 JSON 与文件系统，零写；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute, relative } from 'node:path';

// guard-meta（D-159②/D-160③ 自己声明——没写就是红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#31 registry 可执行引用一致性——.mjs 引用可解析或逐条 historical';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const REG = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '33-gate-registry.json');
// 只认已跟踪文件：untracked 残留不得翻转结论（portable 面本地/CI 同判）。
const TRACKED = new Set(execFileSync('git', ['ls-files'], { cwd: REPO, encoding: 'utf8' }).split('\n').filter(Boolean).map(function (p) { return p.split('\\').join('/'); }));

// 通配/占位写法不是文件引用：#31 票面点名 `NN-check.mjs` 是措辞截出的伪引用。
const NON_REFERENCE = new Set(['NN-check.mjs']);
// 前位排除 - . * /：`*-check.mjs` 不得截出 `check.mjs`，`*.test.mjs` 不得截出 `test.mjs`。
const REF_RE = /(?<![A-Za-z0-9_.*\/-])((?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_][A-Za-z0-9_.-]*\.mjs)\b/g;

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 400) : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- 抽取与判定（F 组负对照直接复用） ----------
function extractRefs(root, includePolicy) {
  const refs = new Map();
  (function walk(v, path) {
    // 声明区默认不进 D3 的外部引用范围（防 historical 自己给自己背书）；C1 用 includePolicy=true 把 reason 内的替代指针一并解析。
    if (!includePolicy && path === 'meta.reference_resolution') return;
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
    if (!existsSync(p) || !statSync(p).isFile()) continue;
    const rel = relative(REPO, p).split('\\').join('/');
    if (rel === '' || rel.startsWith('../') || isAbsolute(rel)) continue;
    if (TRACKED.has(rel)) return rel;
  }
  return null;
}

function classify(refs, historical, resolve) {
  const v = [];
  for (const [ref, paths] of refs) {
    if (isAbsolute(ref) || ref.split('/').indexOf('..') >= 0) { v.push('INVALID-REF ' + ref); continue; }
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

// ---------- 逐条结构校验（E3 判定用，H 组负对照直接复用同一函数） ----------
// 必备字段和允许出现的键只在这里认：五样必填（at/by/criterion_version/decision/reason），
// evidence 可以没有。出现别的键（把 evidence 改成 proof 就属这一类）一律判红。
// 这份清单不往别处抄：registry 的 meta.confirmation_schema 只描述行为、指过来看这里。
const CONFIRMATION_ALLOWED = ['at', 'by', 'criterion_version', 'decision', 'reason', 'evidence'];
const CONFIRMATION_REQUIRED = ['at', 'by', 'criterion_version', 'decision', 'reason'];
const MIN_REASON_LEN = 10;
// 历史空 evidence 按阶段放行的名单。键是 item + at + by + decision 四样：
// 只拿 item+by 挑，本表有 4 条重复（25-P1/25-P3/25-P4/25-D3 都在 2026-09-17 被「T6 授权后复核」；
// 再加上 at 还是重）；补上 decision 之后全表零重复。
// 每条豁免必须恰好命中一条记录，而且被豁免的那条确实没写证据——没命中或有证据都判红。
const CONFIRMATION_EVIDENCE_EXEMPT = [
  {
    item: 'demo-cleanup-observe', at: '2026-09-17', by: '轮17 grill D-064⑥', decision: 'registered',
    reason: '登记那一轮还没有实证可引，只记了这一项怎么挂上去；实证落在同一项第 1 条确认（discharged-decided，带 demo.ts 与 npm test 的回执）'
  },
  {
    item: 'env-gated-guard-class', at: '2026-10-03', by: 'R57 T1 执行批', decision: 'registered',
    reason: '登记那一轮只声明 85/86-check 落盘后实测绿，回执写在下一条 rescoped 确认；这一条当时没有独立证据锚'
  }
];

function blank(s) { return typeof s !== 'string' || s.trim().length === 0; }
function exemptKey(it, c) { return it.id + '|' + c.at + '|' + c.by + '|' + c.decision; }
// 只在字段已经判定为「不能用」的时候调用，所以不讲「正常」这一支。
function describeField(c, k) {
  if (!Object.prototype.hasOwnProperty.call(c, k)) return '键不在';
  const v = c[k];
  if (typeof v !== 'string') return '不是字符串（' + (v === null ? 'null' : typeof v) + '）';
  return '是空白字符串';
}

// 逐条校验 confirmations[]。返回 { violations, blankEvidence, codes }：
// violations 空数组＝全过；codes 是原因码的计数（整表改名时一眼看出全都栽在同一处）；
// blankEvidence 给 E4 用，免得在外面再数一遍。
// 原因码：一个记录可以同时吃到好几种（例如 evidence 键被改名后既有 UNKNOWN-KEY 也有 MISSING-EVIDENCE），
// 这时 codes 的计数会重叠，那是故意的——每种坏法单独报出来，不合并。
function checkConfirmations(items, exemptions, minReasonLen) {
  const v = [];
  const codes = {};
  const add = function (line) { v.push(line); const code = line.split(' ')[0]; codes[code] = (codes[code] || 0) + 1; };
  const hits = new Map();
  const exIndex = new Map();
  let blankEvidence = 0;
  for (const e of exemptions) {
    const k = e.item + '|' + e.at + '|' + e.by + '|' + e.decision;
    if (exIndex.has(k)) { add('DUPLICATE-EXEMPTION ' + k); continue; }
    exIndex.set(k, e);
  }
  for (const it of items) {
    const confs = it.confirmations;
    if (confs === undefined) continue;
    if (!Array.isArray(confs)) { add('NOT-ARRAY ' + it.id); continue; }
    for (const [i, c] of confs.entries()) {
      if (!c || typeof c !== 'object' || Array.isArray(c)) { add('NOT-OBJECT ' + it.id + '#' + i); continue; }
      // 多余/改名的键：proof、why 之类全在这里被点出来
      for (const k of Object.keys(c)) {
        if (CONFIRMATION_ALLOWED.indexOf(k) < 0) add('UNKNOWN-KEY ' + it.id + '#' + i + ' :: ' + k);
      }
      // 必备字段缺失、空白或不是字符串，三种都报 MISSING-FIELD，但把实际状况写清楚
      for (const k of CONFIRMATION_REQUIRED) {
        if (blank(c[k])) add('MISSING-FIELD ' + it.id + '#' + i + ' :: ' + k + '（' + describeField(c, k) + '）');
        else if (k === 'reason' && c.reason.trim().length < minReasonLen) add('SHORT-REASON ' + it.id + '#' + i);
      }
      // evidence 的坏法分开报。豁免只对「键整个不在」这一种有效：
      // 写了 evidence 却给个空串或不给字符串，说明写的人以为自己写了证据，这种不能算「历史上没证据」，照样红。
      const k = exemptKey(it, c);
      const hasKey = Object.prototype.hasOwnProperty.call(c, 'evidence');
      if (blank(c.evidence)) {
        blankEvidence++;
        if (hasKey) add('BLANK-EVIDENCE ' + it.id + '#' + i + ' :: ' + describeField(c, 'evidence') + '，豁免只认「键不在」这一种');
        else if (!exIndex.has(k)) add('MISSING-EVIDENCE ' + it.id + '#' + i);
        else hits.set(k, (hits.get(k) || 0) + 1);
      } else if (exIndex.has(k)) {
        // 有证据就不该被豁免——挡住「先豁免再悄悄删证据」这条路
        add('STALE-EXEMPTION ' + k);
      }
    }
  }
  for (const [k, e] of exIndex) {
    const n = hits.get(k) || 0;
    if (n === 0) add('EXEMPTION-NOT-FOUND ' + k);
    else if (n > 1) add('EXEMPTION-AMBIGUOUS ' + k + ' :: ' + n + ' 条命中');
    if (blank(e.reason) || e.reason.trim().length < minReasonLen) add('EXEMPTION-BLANK-REASON ' + k);
  }
  return { violations: v, blankEvidence: blankEvidence, codes: codes };
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
t('A3 已跟踪文件非空（解析只认 git ls-files——untracked 残留不翻转结论）', TRACKED.size > 0, 'tracked=' + TRACKED.size);

// ---------- B. 抽取规则自己验一遍 ----------
const sample = 'reports/33-check.mjs、38-check.mjs＋_lib/check-kit.mjs；*-check.mjs 与 NN-check.mjs 不是引用；*.test.mjs 也不截。';
const sampleRefs = [...extractRefs({ s: sample }, true).keys()].sort();
const sampleWant = ['38-check.mjs', '_lib/check-kit.mjs', 'reports/33-check.mjs'];
t('B1 抽取规则：路径/裸名/_lib 命中，通配与占位不抽取', JSON.stringify(sampleRefs) === JSON.stringify(sampleWant), JSON.stringify(sampleRefs));
const policySample = { meta: { reference_resolution: { historical: { 'dead.mjs': { kind: 'retired-script', reason: '现行承载为 engine/test/contracts-run.mjs' } } } } };
t('B2 声明里 reason 提到的 .mjs 纳入 C1 的全量核对、不进 D3 的外部引用范围（防自己给自己背书）',
  extractRefs(policySample, true).has('engine/test/contracts-run.mjs') && !extractRefs(policySample, false).has('engine/test/contracts-run.mjs'));

// ---------- C. 把全部引用逐条核一遍 ----------
const refsBody = extractRefs(reg, false);
const refsAll = extractRefs(reg, true);
const historical = (policy && policy.historical) || {};
const violations = classify(refsAll, historical, function (r) { return resolveRef(r, roots); });
const liveRefs = [...refsAll.keys()].filter(function (r) { return resolveRef(r, roots); });
t('C1 每条 .mjs 引用可解析，或逐条登记 historical（零未登记死引用；含 historical reason 内替代指针）', violations.length === 0, violations.join(' ;; '));
t('C2 参与核对的引用非空（refs>0 且 live>0——historical 清零属收敛态，不判失败）', refsAll.size > 0 && liveRefs.length > 0,
  'refs=' + refsAll.size + ' live=' + liveRefs.length + ' historical=' + Object.keys(historical).length);

// ---------- D. 再反过来核一遍 ----------
const histKeys = Object.keys(historical);
t('D1 historical 逐条 kind/reason 齐备（kind 二态合法＋reason 非空）',
  histKeys.every(function (k) { const h = historical[k]; return h && (h.kind === 'archived-path' || h.kind === 'retired-script') && typeof h.reason === 'string' && h.reason.trim().length >= 10; }),
  histKeys.filter(function (k) { const h = historical[k]; return !h || typeof h.reason !== 'string' || h.reason.trim().length < 10; }).join(','));
t('D2 reports/* 一律 archived-path，其余一律 retired-script（家族与 kind 互证）',
  histKeys.every(function (k) { return historical[k].kind === (k.indexOf('reports/') === 0 ? 'archived-path' : 'retired-script'); }),
  histKeys.filter(function (k) { return historical[k].kind !== (k.indexOf('reports/') === 0 ? 'archived-path' : 'retired-script'); }).join(','));
t('D3 historical 条目必须仍被 registry 引用（零悬空登记）', histKeys.every(function (k) { return refsBody.has(k); }),
  histKeys.filter(function (k) { return !refsBody.has(k); }).join(','));
t('D4 historical 条目必须不可解析（复活即红——防「登记说没有、文件确实在」两头都成真）', histKeys.every(function (k) { return !resolveRef(k, roots); }),
  histKeys.filter(function (k) { return !!resolveRef(k, roots); }).join(','));

// ---------- E. 消费面还活着（字段还有人读） ----------
const guardRefs = refsFromStrings(reg.items.flatMap(function (i) { return Array.isArray(i.guards) ? i.guards : []; }));
const confRefs = refsFromStrings(reg.items.flatMap(function (i) {
  return (Array.isArray(i.confirmations) ? i.confirmations : []).map(function (c) { return [c && c.evidence, c && c.reason].filter(Boolean).join(' '); });
}));
const guardLive = [...guardRefs.keys()].filter(function (r) { return resolveRef(r, roots); });
const confLive = [...confRefs.keys()].filter(function (r) { return resolveRef(r, roots); });
t('E1 guards[] 里有能解析的引用（字段改名后检查不得白跑一趟）', guardRefs.size > 0 && guardLive.length > 0,
  'n=' + guardRefs.size + ' live=' + guardLive.length);
t('E2 confirmations[] 里有能解析的引用（evidence/reason 合并抽取）', confRefs.size > 0 && confLive.length > 0,
  'n=' + confRefs.size + ' live=' + confLive.length);

// E3：逐条结构校验。E2 只做整表汇总（n>0 且 live>0），单改一个字段名照样能过——
// 把 evidence 改成 proof 后，reason 里剩的那几个引用够它判绿。这一条逐个键看，改名当场红。
// t() 会把 detail 截到 400 字，只够列十来条；整表改名时剩下的上百条就看不见了，
// 所以红了以后另打一行数量汇总（绿的时候不打，没违规没什么可汇总的）。
// 那行的前缀 AUDIT-DISCLOSURE 是给执行器看的：contracts-run.mjs 会单独把它捞出来打。
// 它不以 PASS 开头，不会在红了的时候冒充通过行。
const confCheck = checkConfirmations(reg.items, CONFIRMATION_EVIDENCE_EXEMPT, MIN_REASON_LEN);
if (confCheck.violations.length > 0) console.log('AUDIT-DISCLOSURE E3 违规共 ' + confCheck.violations.length + ' 条（下行只贴开头几条，t() 截到 400 字），原因码分布 ' + JSON.stringify(confCheck.codes));
t('E3 confirmations[] 逐条结构合法（必备五字段非空＋只认这几个键——单改 evidence 字段名即红）',
  confCheck.violations.length === 0, confCheck.violations.slice(0, 40).join(' ;; '));

// E4：豁免不是悄悄跳过——放行了哪些、表里到底有几条没证据，两个数都打出来。
// 判的是两者必须相等：多出一条没声明的（悄悄跳过）红；声明了却没命中（过期豁免）由 E3 报
// EXEMPTION-NOT-FOUND。不写死条数，免得以后新登记轮要放行时假红。
// 这行的前缀 AUDIT-DISCLOSURE 是给执行器看的：contracts-run.mjs 汇总时只留最后两条含
// PASS/FAIL 的行，别的行会被整行丢掉（那个 2 行窗口的毛病它自己注释里也写了）。
// 用这个前缀，执行器会单独把它捞出来打一行，绿着跑也看得见「放行了哪些」。
const exemptHits = CONFIRMATION_EVIDENCE_EXEMPT.map(function (e) { return e.item + ' @' + e.at + ' by ' + e.by; });
t('E4 缺 evidence 的条数与声明放行的条数相等（零悄悄跳过）',
  confCheck.blankEvidence === CONFIRMATION_EVIDENCE_EXEMPT.length,
  'blank=' + confCheck.blankEvidence + ' declared=' + CONFIRMATION_EVIDENCE_EXEMPT.length + ' :: ' + exemptHits.join(' | '));
console.log('AUDIT-DISCLOSURE E4 豁免可见：表里缺 evidence ' + confCheck.blankEvidence + ' 条／声明放行 ' + CONFIRMATION_EVIDENCE_EXEMPT.length + ' 条；放行的是 ' + exemptHits.join(' | '));

// ---------- F. 这道判定的负对照（合成样本，不读仓内状态） ----------
const mark = function (kind, reason) { return { kind: kind, reason: reason }; };
const cases = [
  ['F1 未登记死引用 → UNRESOLVED-UNDECLARED', [['999-missing.mjs']], {}, function () { return null; }, 'UNRESOLVED-UNDECLARED'],
  ['F2 已登记死引用 → 零违规', [['999-missing.mjs']], { '999-missing.mjs': mark('retired-script', 'negative control: declared historical') }, function () { return null; }, null],
  ['F3 historical 复活 → STALE-HISTORICAL', [['85-check.mjs']], { '85-check.mjs': mark('retired-script', 'negative control: must be live') }, function () { return 'engine/test/contracts/85-check.mjs'; }, 'STALE-HISTORICAL'],
  ['F4 reports/* kind 错配 → KIND-MISMATCH', [['reports/x.mjs']], { 'reports/x.mjs': mark('retired-script', 'negative control: kind mismatch') }, function () { return null; }, 'KIND-MISMATCH'],
  ['F5 空理由 → EMPTY-REASON', [['999-missing.mjs']], { '999-missing.mjs': mark('retired-script', '') }, function () { return null; }, 'EMPTY-REASON'],
  ['F6 悬空登记 → DANGLING-HISTORICAL', [], { '999-missing.mjs': mark('retired-script', 'negative control: dangling entry') }, function () { return null; }, 'DANGLING-HISTORICAL'],
  ['F7 越界引用 → INVALID-REF', [['../escape.mjs']], {}, function () { return null; }, 'INVALID-REF'],
];
for (const [name, refList, hist, resolver, want] of cases) {
  const m = new Map(refList.map(function (r) { return [r[0], new Set(['synthetic'])]; }));
  const got = classify(m, hist, resolver);
  const ok = want === null ? got.length === 0 : got.some(function (x) { return x.indexOf(want) === 0; });
  t(name, ok, JSON.stringify(got));
}

// ---------- H. 逐条结构校验的负对照（合成样本，不读仓内状态） ----------
// 每一态都是「E3 必须红」或「E3 必须绿」。这几条钉住的是判定本身，不是真表内容——
// 以后谁把 E3 改松（例如把键集检查删掉），这里当场红，tracker #229。
const exOk = [{ item: 'x', at: '2026-01-01', by: 'someone', decision: 'registered', reason: 'negative control: registered round without evidence anchor' }];
const baseConf = { at: '2026-01-01', by: 'someone', criterion_version: 'D-1', decision: 'registered', reason: '一条够长的理由，用来占住必备字段的位置。' };
const renamed = function (from, to, value) { const o = Object.assign({}, baseConf); delete o[from]; o[to] = value; return o; };
const shapeCases = [
  ['H1 正常记录（五必备齐＋evidence） → 零违规',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: 'npm test 全绿' })] }], [], 'NONE'],
  ['H2 evidence 改名为 proof → 红（这就是本票补的洞）',
    [{ id: 'x', confirmations: [renamed('evidence', 'proof', 'npm test 全绿')] }], [], 'UNKNOWN-KEY'],
  ['H3 reason 改名为 why → 报 UNKNOWN-KEY',
    [{ id: 'x', confirmations: [renamed('reason', 'why', '改名的理由')] }], [], 'UNKNOWN-KEY'],
  ['H3b 同一个改名样本 → 同时报 MISSING-FIELD（改名后必备字段也跟着缺）',
    [{ id: 'x', confirmations: [renamed('reason', 'why', '改名的理由')] }], [], 'MISSING-FIELD'],
  ['H4 缺 reason 必备字段 → 红',
    [{ id: 'x', confirmations: [{ at: '2026-01-01', by: 'someone', criterion_version: 'D-1', decision: 'registered', evidence: 'x' }] }], [], 'MISSING-FIELD'],
  ['H5 多塞一个集合外的键 → 红',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: 'x', extra: 'y' })] }], [], 'UNKNOWN-KEY'],
  ['H6 evidence 是空字符串 → 红',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: '   ' })] }], [], 'BLANK-EVIDENCE'],
  ['H6b evidence 键整个删掉（不是改名） → 红',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf)] }], [], 'MISSING-EVIDENCE'],
  ['H7 豁免命中一条、该条确实没证据 → 绿（放行本身合法）',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf)] }], exOk, 'NONE'],
  ['H7b 豁免名下的记录写了空 evidence → 还是红（豁免只认「键不在」）',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: '' })] }], exOk, 'BLANK-EVIDENCE'],
  ['H8 豁免一条都没命中 → 红（挡住留下过期豁免）',
    [{ id: 'other-item', confirmations: [Object.assign({}, baseConf, { evidence: 'x' })] }], exOk, 'EXEMPTION-NOT-FOUND'],
  ['H9 豁免名下的记录补上了证据 → 红（先豁免再悄悄删证据要拦）',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: '补上的证据' })] }], exOk, 'STALE-EXEMPTION'],
  ['H10 两条记录都撞同一条豁免 → 红（挡住复制粘贴制造歧义）',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf), Object.assign({}, baseConf)] }], exOk, 'EXEMPTION-AMBIGUOUS'],
  ['H11 reason 太短 → 红',
    [{ id: 'x', confirmations: [Object.assign({}, baseConf, { evidence: 'x', reason: '太短' })] }], [], 'SHORT-REASON'],
];
for (const [name, items, exemptions, want] of shapeCases) {
  const got = checkConfirmations(items, exemptions, MIN_REASON_LEN).violations;
  const ok = want === 'NONE' ? got.length === 0 : got.some(function (x) { return x.indexOf(want) === 0; });
  t(name, ok, JSON.stringify(got));
}

// ---------- G. 检查脚本自身的卫生 ----------
t('G1 本检查自身无 BOM', noBom(join(HERE, '87-check.mjs')));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
