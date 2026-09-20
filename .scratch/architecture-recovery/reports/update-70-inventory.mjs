// update-70-inventory.mjs — 断言级 id 盘点重生成器（#70/D-071 欠账偿还；63-assertion-inventory.json 刷新唯一路径）
// 口径=emit 调用点（t()/ok()/check()/w()/w58()/sealed()/x() 七签名族），slug=name 第一参第一 token；
// loop 族动态 slug（'B-'+n 形）按调用点计一。检测走 stripComments+maskStrings 双轨（注释/字面量内伪调用不计）。
// 70-check E1 对账漂移时跑本脚本。抽取机芯与 70-check.mjs §1 同源（双份拷贝——守卫无 import 纪律不引模块）。
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const NAME_P = /^(name|label|id|n|msg|slug|title|desc|l|key)$/i;

function stripComments(src) {
  return src.split('\n').map(line => {
    let q = null;
    for (let i = 0; i < line.length - 1; i++) {
      const ch = line[i];
      if (q) { if (ch === q && line[i - 1] !== '\\') q = null; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
      if (ch === '/' && line[i + 1] === '/') return line.slice(0, i);
    }
    return line;
  }).join('\n');
}

function maskStrings(src) {
  const out = [];
  for (const line of src.split('\n')) {
    let q = null, buf = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === q && line[i - 1] !== '\\') { buf += ch; q = null; }
        else buf += ' ';
      } else {
        buf += ch;
        if (ch === "'" || ch === '"' || ch === '`') q = ch;
      }
    }
    out.push(buf);
  }
  return out.join('\n');
}

function extractLiterals(text) {
  const lits = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const q = ch; let j = i + 1, buf = '';
      while (j < text.length && text[j] !== q) { if (text[j] === '\\') { buf += text[j]; j++; if (j < text.length) buf += text[j]; j++; } else { buf += text[j]; j++; } }
      lits.push(buf);
      i = j + 1;
    } else i++;
  }
  return lits;
}

function detectNamePos(lines) {
  const namePos = { t: 0, sealed: 0, w: 0, w58: 0, check: 0, ok: 0, x: 0 };
  for (const l of lines) {
    const d = l.match(/const\s+(ok|check|t|w|w58|x)\s*=\s*\(([^)]*)\)/);
    if (d) { const ps = d[2].split(',').map(s => s.trim().split(/[\s=]/)[0]); const idx = ps.findIndex(p => NAME_P.test(p)); if (idx >= 0) namePos[d[1]] = idx; }
    const d2 = l.match(/function\s+(ok|check|t|w|w58|x)\s*\(([^)]*)\)/);
    if (d2) { const ps = d2[2].split(',').map(s => s.trim()); const idx = ps.findIndex(p => NAME_P.test(p)); if (idx >= 0) namePos[d2[1]] = idx; }
  }
  return namePos;
}

function extractAssertions(origLines, maskedLines, namePos) {
  const assertions = [];
  origLines.forEach((l, i) => {
    const ml = maskedLines[i] || '';
    for (const mm of ml.matchAll(/\b(t|ok|check|w|w58|sealed|x)\s*\(/g)) {
      const fn = mm[1];
      const pos = namePos[fn] || 0;
      const callWin = origLines.slice(i, i + 4).join(' ');
      const fromCall = callWin.slice(mm.index);
      const lits = extractLiterals(fromCall);
      const name = lits.length > pos ? lits[pos] : (lits.length ? lits[lits.length - 1] : '');
      if (!name) continue;
      assertions.push({ line: i, slug: name.split(/\s+/)[0], style: fn });
    }
  });
  return assertions;
}

const guards = {};
for (const f of fs.readdirSync(HERE).filter(f => /-check\.mjs$/.test(f)).sort()) {
  const g = f.replace(/\.mjs$/, '');
  const src = stripComments(fs.readFileSync(join(HERE, f), 'utf8'));
  const masked = maskStrings(src);
  const lines = src.split('\n');
  const maskedLines = masked.split('\n');
  const a = extractAssertions(lines, maskedLines, detectNamePos(maskedLines));
  guards[g] = { assertion_ids: new Set(a.map(e => e.slug)).size, call_styles: [...new Set(a.map(e => e.style + '()'))].sort() };
}

const out = {
  ticket: 63,
  decision: 'D-071',
  created: '2026-09-18',
  updated: '2026-09-19',
  updated_by: 'update-70-inventory.mjs（#70/D-079 引用物缺席普查顺带偿 D-071 欠账）',
  note: '断言级稳定 id=断言名首词 token（A1/B5/G15 形），跨 t()/ok()/check()/w()/w58()/sealed()/x() 七签名族均在位——XFAIL/VACUOUS 协议按 <guard>:<slug> 键可寻址。assertion_ids=唯一 slug 数（同 slug 多发射路径按一计——73-check C2 t()/x() 双路实证，loop 族动态 slug 按调用点计一，sealed() 计入盘点不参评候选；检测经 stripComments+maskStrings 双轨，注释/字面量内伪调用不计）。',
  guards: guards
};
const target = join(HERE, '63-assertion-inventory.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n', 'utf8');

// --- assert-back（fail-closed——update-72-registry.mjs 同款三检；R23 审计 R2 修复） ---
const back = JSON.parse(fs.readFileSync(target, 'utf8'));
const hasBom = fs.readFileSync(target)[0] === 0xEF;
const guardN = Object.keys(back.guards || {}).length;
const sites = Object.values(back.guards || {}).reduce((s, x) => s + (x.assertion_ids || 0), 0);
const wantSites = Object.values(guards).reduce((s, x) => s + x.assertion_ids, 0);
const ok = !hasBom && back.ticket === 63 && back.decision === 'D-071' && guardN === Object.keys(guards).length && guardN > 0 && sites === wantSites;
console.log('63-assertion-inventory.json regenerated: ' + guardN + ' guards, ' + sites + ' emit sites (BOM=' + hasBom + ')');
if (!ok) { console.error('INVENTORY-ASSERT-FAIL'); process.exit(1); }
