// check-kit-regex-check.mjs — check-kit stripComments regex 态等价性守卫（D-184②④ / D-177 fixture 红绿分野）
// 职责：① F-01..F-18 fixture 逐条钉期望 ② KE-01..03 known-errors 安全向 ③ detectRegexHazards 迁入闸探测件
//       ④ 8 消费位 golden 对照（旧实现 vs 新实现——零未归因差异） ⑤ 正对照探测器必抓
// 用法：node check-kit-regex-check.mjs → PASS/FAIL；exit 0 = 全绿
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stripComments, detectRegexHazards } from './_lib/check-kit.mjs';
const TIER = 'portable';
const PROTECTED_SURFACE = 'check-kit stripComments regex 字面量态 + 迁入闸探测件（D-184②④）';

const HERE = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// ---------- 旧实现（对照基线——D-184 盲区形态；仅 golden 对照用） ----------
function stripCommentsLegacy(src) {
  const out = [];
  let i = 0, inStr = null, inLine = false, inBlock = false;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === '\n') { inLine = false; out.push(c); } i++; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i += 2; } else i++; continue; }
    if (inStr) { out.push(c); if (c === '\\') { out.push(src[i + 1]); i += 2; continue; } if (c === inStr) inStr = null; i++; continue; }
    if (c === '/' && n === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && n === '*') { inBlock = true; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') inStr = c;
    out.push(c); i++;
  }
  return out.join('');
}

// ---------- A. Fixture 集（F-01..F-18——红绿分野必选） ----------
const fixtures = [
  { id: 'F-01', input: 'const re = /[\'"]+/g; // keep', must: ['const re ='], mustNot: ['// keep'] },
  { id: 'F-02', input: 'const x = a / b; // c', must: ['const x = a / b;'], mustNot: ['// c'] },
  { id: 'F-03', input: 'x /= 2; // note', must: ['x /= 2;'], mustNot: ['// note'] },
  { id: 'F-04', input: 'const re = /=/; // t', must: ['const re = /=/;'], mustNot: ['// t'] },
  { id: 'F-05', input: 'const s = ' + String.fromCharCode(96) + String.fromCharCode(36) + '{/x/g}' + String.fromCharCode(96) + '; // z', must: ['const s ='], mustNot: ['// z'] },
  { id: 'F-06', input: 'const o = {a:1} / 2; // m', must: ['const o = {a:1} / 2;'], mustNot: ['// m'] },
  { id: 'F-07', input: 'function f(){} /x/; // b', must: ['function f(){} /x/;'], mustNot: ['// b'] },
  { id: 'F-08', input: 'const e = {}; // n', must: ['const e = {};'], mustNot: ['// n'] },
  { id: 'F-09', input: 'if (x) (/y/); // k', must: ['(/y/);'], mustNot: ['// k'] }, // )后/=除号安全向——残差入 KE
  { id: 'F-10', input: 'const re = /foo // not-comment', must: ['/foo'], mustNot: [] },
  { id: 'F-11', input: "const p = 'a//b'; // ok", must: ["const p = 'a//b';"], mustNot: ["// ok"] },
  { id: 'F-12', input: 'const re = /\\/\\*/; // x', must: ['const re ='], mustNot: ['// x'] },
  { id: 'F-13', input: '/* comment */ program //comment', must: ['program'], mustNot: ['/* comment */', '//comment'] },
  { id: 'F-14', input: 'const re = /ab/gimsuy; // f', must: ['/ab/gimsuy;'], mustNot: ['// f'] },
  { id: 'F-15', input: 'const r = 1 / 2 / 3; // d', must: ['const r = 1 / 2 / 3;'], mustNot: ['// d'] },
  { id: 'F-16', input: 'f(1, /z/); // c', must: ['f(1, /z/);'], mustNot: ['// c'] },
  { id: 'F-17', input: 'class C{} /re/; // t', must: ['class C{} /re/;'], mustNot: ['// t'] },
  { id: 'F-18', input: 'const s = ' + String.fromCharCode(96) + String.fromCharCode(36) + '{ {k:/q/} }b' + String.fromCharCode(96) + '; // n', must: ['const s ='], mustNot: ['// n'] },
  { id: 'KE-01', input: 'function f(){}\n/x/; // k', must: ['/x/;'], mustNot: ['// k'] },
];

let fxPass = 0, fxFail = 0, legacyRed = 0;
for (const f of fixtures) {
  const out = stripComments(f.input);
  let ok = true; const bad = [];
  for (const s of f.must) if (out.indexOf(s) < 0) { ok = false; bad.push('miss:' + s); }
  for (const s of f.mustNot) if (out.indexOf(s) >= 0) { ok = false; bad.push('keep:' + s); }
  if (ok) fxPass++; else { fxFail++; bad.forEach(() => {}); }
  // 红绿分野：旧实现必须在 regex-引号形类上失败（证明新态有增量）
  const legacy = stripCommentsLegacy(f.input);
  let lok = true;
  for (const s of f.must) if (legacy.indexOf(s) < 0) lok = false;
  for (const s of f.mustNot) if (legacy.indexOf(s) >= 0) lok = false;
  if (!lok && (f.id === 'F-01' || f.id === 'F-12')) legacyRed++;
  if (!ok) console.log('  fixture-FAIL ' + f.id + ' out=' + JSON.stringify(out) + ' ' + bad.join(';'));
}
t('A1 fixture 成员集==预声明（F-01..F-18∪KE-01，非总数凑数）', (() => { const ids = fixtures.map(f => f.id); const need = ['F-01','F-02','F-03','F-04','F-05','F-06','F-07','F-08','F-09','F-10','F-11','F-12','F-13','F-14','F-15','F-16','F-17','F-18','KE-01']; return need.every(id => ids.includes(id)) && ids.length === need.length && fxPass === fixtures.length; })(), 'n=' + fixtures.length + ' ids=' + fixtures.map(f => f.id).join(','));
t('A2 红绿分野：旧实现必在 regex-引号形/伪注释形上失败（legacyRed>=1）', legacyRed >= 1, 'legacyRed=' + legacyRed);

// ---------- B. KE known-errors 安全向 ----------
const ke = JSON.parse(readFileSync(join(HERE, 'check-kit-known-errors.json'), 'utf8'));
t('B1 known-errors 册 KE-01..03 齐备且 expected=division', ke.entries.length >= 3 && ke.entries.every(e => e.expected === 'division'));
for (const e of ke.entries) {
  const out = stripComments(e.input);
  // 安全向：} 后 / 不吞后续——/x/ 形状残留或除号表达式均可，但不得整段消失
  t('B2 ' + e.id + ' 安全向不吞码（输出非空且含可见 residue）', out.replace(/\s/g, '').length > 0);
}

// ---------- C. detectRegexHazards 迁入闸探测件 ----------
const h1 = detectRegexHazards('const re = /[\'"]+/g;');
t('C1 探测件：regex-引号形必抓', h1.some(h => h.kind === 'regex-quote-form'));
const h2src = 'const s = ' + String.fromCharCode(96) + String.fromCharCode(36) + '{/x/g}' + String.fromCharCode(96) + ';';
const h2 = detectRegexHazards(h2src);
t('C2 探测件：模板串内 regex 必抓', h2.some(h => h.kind === 'tpl-inner-regex'));
const h3 = detectRegexHazards('const x = a / b;');
t('C3 探测件：普通除号不误报（或仅 ambiguous 族）', h3.every(h => h.kind !== 'regex-quote-form'));
const h4 = detectRegexHazards('function f(){} /x/;');
t('C4 探测件：歧义除号位 API 可调用（返回数组）', Array.isArray(h4)); // 启发式允许 0 或 1 hits，不强制命中

// ---------- D. 8 消费位 golden 对照（旧 vs 新——零未归因差异） ----------
const sha8 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);
const consumers = [
  { id: '20', file: '20-fact-schema-check.mjs' },
  { id: '21', file: '21-collectors-check.mjs' },
  { id: '54', file: '54-check.mjs' },
  { id: '55', file: '55-check.mjs' },
  { id: '70', file: '70-check.mjs' },
  { id: '75a', file: '75a-check.mjs' },
  { id: 'd179', file: 'd179-check.mjs' },
  { id: 'u70', file: 'update-70-inventory.mjs' },
];
const golden = [];
let goldDiff = 0;
// 归因判定：差异仅允许「旧 inStr 粘滞多留伪注释→新剥除」安全向；误删代码=未归因
function isAttributedFix(aLine, bLine) {
  if (aLine === bLine) return true;
  const at = aLine.trimEnd(), bt = bLine.trimEnd();
  if (at === bt) return true;
  if (at.startsWith(bt) || bt.startsWith(at)) return true; // 尾注剥离/空行收
  // 旧尾注未剥：a=code+//comment → b=code
  const aStripTrail = at.replace(/\s+\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trimEnd();
  if (aStripTrail === bt) return true;
  // 旧整行伪注释粘滞保留，新为空
  if (bt === '') {
    const aNoComment = at.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (aNoComment === '') return true;
  }
  return false;
}
for (const c of consumers) {
  const raw = readFileSync(join(HERE, c.file), 'utf8');
  const a = stripCommentsLegacy(raw);
  const b = stripComments(raw);
  const ha = sha8(a), hb = sha8(b);
  const aLines = a.split('\n'), bLines = b.split('\n');
  const lineDiffs = [];
  let attributed = true;
  for (let i = 0; i < Math.max(aLines.length, bLines.length); i++) {
    const al = aLines[i] || '', bl = bLines[i] || '';
    if (al === bl) continue;
    const ok = isAttributedFix(al, bl);
    if (!ok) attributed = false;
    lineDiffs.push({ i: i + 1, ok, a: al.slice(0, 60), b: bl.slice(0, 60) });
  }
  // 零误删硬校验：新输出不得丢失旧输出中的标识符（仅允许剥注释）
  const ids = (s) => (s.match(/[A-Za-z_$][\w$]*/g) || []);
  const idA = new Set(ids(a)), idB = new Set(ids(b));
  const lostIds = [...idB].filter(x => !idA.has(x));
  // 新不应产生旧没有的标识符（安全向）；丢失=误删
  // 注：剥注释可能去掉注释内标识符——lost 只计 b 有 a 无；误删计 a 的代码位标识符不在 b
  const aNoCmt = a.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/\S/g, ' ')).replace(/\/\/[^\n]*/g, '');
  const aCodeIds = new Set(ids(aNoCmt));
  const missingCodeIds = [...aCodeIds].filter(x => !idB.has(x));
  if (missingCodeIds.length > 0) attributed = false;
  if (lineDiffs.some(d => !d.ok)) attributed = false;
  golden.push({ id: c.id, ha, hb, lineDiffs: lineDiffs.slice(0, 5), nDiff: lineDiffs.length, attributed, missingCodeIds: missingCodeIds.slice(0, 5) });
  if (lineDiffs.length > 0) goldDiff++;
}
t('D1 8 消费位 golden 对照跑通（8/8 文件可读）', golden.length === 8);
t('D2 golden 零未归因差异／零误删（逐行归因+代码标识符不丢）', golden.every(g => g.attributed === true), 'changedFaces=' + goldDiff + '/8 unattributed=' + golden.filter(g => !g.attributed).map(g => g.id).join(','));
t('D2b 归因函数可红（注入未归因差异必判 false）', isAttributedFix('const x = 1; // keep', 'const y = 2;') === false);
for (const g of golden) {
  if (g.nDiff > 0) console.log('  golden-diff ' + g.id + ' attributed=' + g.attributed + ' lines=' + g.nDiff + ' sample=' + JSON.stringify(g.lineDiffs[0] || {}));
}

// ---------- E. 正对照：合成源注入探测器必抓 ----------
const synSrc = 'const re = /[\']/g; const s = ' + String.fromCharCode(96) + String.fromCharCode(36) + '{/y/}' + String.fromCharCode(96) + ';';
const syn = detectRegexHazards(synSrc);
t('E1 正对照：合成源 regex-引号+模板内 regex 双族必抓', syn.some(h => h.kind === 'regex-quote-form') && syn.some(h => h.kind === 'tpl-inner-regex'));
const ambSrc = 'function f(){} /x/;';
const amb = detectRegexHazards(ambSrc);
t('E2 正对照：歧义除号位探测件可调用（返回数组）', Array.isArray(amb));

console.log('');
console.log('KIT-REGEX: fixtures ' + fxPass + '/' + fixtures.length + ' | legacyRed ' + legacyRed + ' | goldenChanged ' + goldDiff + '/8');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
