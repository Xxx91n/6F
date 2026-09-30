// 84-check.mjs — commit 指针纪律守卫（D-188~D-192 轮 52 T1-A 落盘）
// 断言面：A 扫描面封闭枚举（C）→ B 严格层位形三通道机检 → C 法定形断言（cat-file 存在）
//   → D baseline 册两级判级（册内 WARN／册外 FAIL）→ E 孪生 change-id 分桶 WARN → F 册护栏自断言 → G fixture 四态＋六衍生态红绿分野
// 判级纪律（D-191③）：rc≠0 仅由「册外 FAIL 类」触发；可达性／孪生／豁免子面／册项失配恒 WARN 不影响 rc。
// 零三方依赖；零反斜杠（正则一律字符类，per WORKFLOW lessons W2-#02/W3-#09 backslash 教训）。
// 用法：node 84-check.mjs          → 逐条 PASS/WARN/FAIL；exit 0=无册外违规
//       node 84-check.mjs --emit   → 仅打印首跑普查候选清单（建册用，不判级）
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const TIER = 'portable';
const PROTECTED_SURFACE = 'D-188~D-192 commit 指针纪律严格层机检（法定形断言＋known-pointer-violations 册两级判级＋孪生 change-id 分桶）';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const BOOK = join(HERE, 'known-pointer-violations.json');
const NL = String.fromCharCode(10);

// ---- 扫描面封闭枚举（D-192②；扩面走立法票 D-095，禁开放增长）----
const SURFACE_CLOSED = 1;
const SCAN_ROOTS = ['.scratch/macro-audit', '.scratch/architecture-recovery', 'docs/adr'];
const SCAN_FILES = ['CONTEXT.md', 'AGENTS.md'];
// P2 勘误后回改贴合预声明 §1 EXEMPT-DIR：裸目录名三项（任意深度）＋ reports/ 路径锚定两项
const SKIP_DIR_BARE = ['node_modules', '.git', 'dist'];
const SKIP_DIR_ANCHORED = ['reports/_retired', 'reports/40-clone-cache'];
const EXEMPT_SUB_WORD_RE = /(atomcode-research|research-prompt)/;
// P7 勘误后回改贴合预声明 §1 EXEMPT-SUB：仅 .md 文件名命中（禁目录名同形豁免）
function isExemptSub(relPath) {
  const base = relPath.split('/').pop() || '';
  return base.endsWith('.md') && EXEMPT_SUB_WORD_RE.test(base);
}

// ---- 严格层位形封闭枚举（D-189⑧ 机检口径，预声明 §2）----
const STRICT_HEADERS = [
  '变更 commit 指针', '变更 commit', '原模糊指针', '归属 commit', '分支/commit',
  'Test commit', 'Impl commit', '闭环 commit', 'commit 指针',
  'git 短 hash（可 cat-file -e）', 'git 短 hash'
];
const SECTION_ANCHOR_RE = /T3 .*(?:哨兵|读数)/;
const ROMAN = new Set(['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx']);
// 模糊指针语（D-188④ 模糊语族；长形优先）
const FUZZY = ['本轮修复 commit','本轮收口 commit','本轮变更 commit','本轮落地 commit','修复 commit','落地 commit','收口 commit','该 commit','本 commit','见 commit','同上 commit'];

let pass = 0, fail = 0;
const t = (name, ok, extra) => {
  if (ok) { pass++; console.log('PASS ' + name + (extra ? ' :: ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  return ok;
};
const warn = (name, extra) => console.log('WARN ' + name + (extra ? ' :: ' + extra : ''));

// ---- git 机件（带缓存——2520 文件面下严禁每候选一次 spawn）----
const gcache = new Map();
function git(args) {
  const k = args.join(' ');
  if (gcache.has(k)) return gcache.get(k);
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  const v = { out: String(r.stdout || '').trim(), err: String(r.stderr || ''), rc: r.status };
  gcache.set(k, v);
  return v;
}
function resolveSha(short) {
  const r = git(['rev-parse', '--verify', '--quiet', short + '^{commit}']);
  return r.rc === 0 ? r.out : null;
}
function objectType(sha) {
  const r = git(['cat-file', '-t', sha]);
  return r.rc === 0 ? r.out : null;
}
function changeIdOf(sha) {
  const r = git(['cat-file', '-p', sha]);
  if (r.rc !== 0) return null;
  for (const line of r.out.split(NL)) {
    const m = line.match(/^change-id[ ]+([0-9a-zA-Z_-]+)$/);
    if (m) return m[1];
  }
  return null;
}

// ---- 文件枚举 ----
function walk(dir, acc) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      const relPosix = p.split('\\').join('/');
      if (SKIP_DIR_BARE.indexOf(e.name) >= 0) continue;
      if (SKIP_DIR_ANCHORED.some((a) => relPosix.endsWith('/' + a) || relPosix === a)) continue;
      walk(p, acc);
    }
    else if (e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}
function surfaceFiles() {
  const abs = [];
  for (const r of SCAN_ROOTS) walk(join(ROOT, r), abs);
  for (const f of SCAN_FILES) abs.push(join(ROOT, f));
  return abs;
}
const rel = (p) => relative(ROOT, p).split('\\').join('/');

// ---- 严格层抽取（通道 A 列头白名单／通道 B 小节锚定／通道 C 列表行标签）----
function normHeader(h) {
  return h.replace(/[*`_]/g, '').replace(/[ ]+/g, ' ').trim();
}
function isSepRow(line) {
  const s = line.trim();
  if (!s.startsWith('|')) return false;
  if (s.indexOf('-') < 0) return false;
  return /^[| :-]+$/.test(s);
}
function splitRow(line) {
  const s = line.trim();
  return s.slice(1, s.length - 1).split('|').map((c) => c.trim());
}
function listLabelStrict(line) {
  const s = line.trim();
  if (!(s.startsWith('- ') || s.startsWith('* '))) return false;
  const body = s.slice(2).replace(/[*`]/g, '');
  const ci = body.indexOf('commit');
  if (ci < 0) return false;
  const after = body.slice(ci + 6).replace(/^[ ]+/, '');
  if (after.startsWith('指针')) {
    const t2 = after.slice(2).replace(/^[ ]+/, '');
    return t2.startsWith(':') || t2.startsWith('：');
  }
  const lead = body.slice(0, ci).replace(/[ ]/g, '');
  if (['变更','修复','落地','收口','定点','固定点',''].indexOf(lead) < 0) return false;
  return after.startsWith(':') || after.startsWith('：');
}
function strictCells(lines) {
  const out = [];
  let sectionHit = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) { sectionHit = SECTION_ANCHOR_RE.test(line); continue; }
    if (isSepRow(line) && i > 0 && lines[i - 1].trim().startsWith('|')) {
      const cols = splitRow(lines[i - 1]).map(normHeader);
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('|') && !isSepRow(lines[j])) {
        const cells = splitRow(lines[j]);
        for (let c = 0; c < cols.length; c++) {
          if (c >= cells.length) continue;
          const hit = sectionHit || STRICT_HEADERS.indexOf(cols[c]) >= 0;
          if (hit && cells[c] && cells[c] !== '—' && cells[c] !== '-') {
            out.push({ line: j + 1, col: c, header: cols[c], text: cells[c] });
          }
        }
        j++;
      }
      i = j - 1;
      continue;
    }
    if (listLabelStrict(line)) out.push({ line: i + 1, col: -1, header: 'list-label', text: line });
  }
  return out;
}

// ---- 违规形态抽取（零反斜杠）----
function shaTokens(cell) {
  const out = [];
  for (const tk of cell.split(/[^0-9A-Za-z]/)) {
    if (/^[0-9a-f]{7,40}$/.test(tk)) out.push(tk);
  }
  return out;
}
function bareCodes(cell) {
  const out = [];
  const PAIRS = [[String.fromCharCode(40), String.fromCharCode(41)], [String.fromCharCode(0xFF08), String.fromCharCode(0xFF09)]];
  for (const pr of PAIRS) {
    let i = 0;
    while (i < cell.length) {
      const p = cell.indexOf(pr[0], i);
      if (p < 0) break;
      const q = cell.indexOf(pr[1], p + 1);
      if (q < 0) break;
      const inner = cell.slice(p + 1, q).trim();
      if (/^[a-z]{3}$/.test(inner) && !ROMAN.has(inner)) out.push(inner);
      i = q + 1;
    }
  }
  // 首位裸短码（D-188③ GitButler 3 字母便利码单独承担定位；形如 wmu（…）／wmu …）
  const lead = cell.replace(/^[*` ]+/, '').match(/^[a-z]{3}($|[^0-9A-Za-z_])/);
  if (lead && !ROMAN.has(lead[0].slice(0, 3))) out.push(lead[0].slice(0, 3));

  for (const kw of ['commit ', '分支 ', 'branch ']) {
    let k = -1;
    while ((k = cell.indexOf(kw, k + 1)) >= 0) {
      const m = cell.slice(k + kw.length).match(/^[a-z]{3}([^0-9A-Za-z_]|$)/);
      if (m && !ROMAN.has(m[1])) out.push(m[1]);
    }
  }
  const seen = new Set();
  return out.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
}
function fuzzyHits(cell) {
  const out = [];
  for (const p of FUZZY) {
    if (cell.indexOf(p) < 0) continue;
    if (out.some((q) => q.indexOf(p) >= 0)) continue;
    out.push(p);
  }
  return out;
}
function hasSubject(cell, sha) {
  const i = cell.indexOf(sha);
  if (i < 0) return false;
  const after = cell.slice(i + sha.length);
  return after.indexOf('("') >= 0 && after.indexOf('")') > after.indexOf('("');
}

// ---- 文档扫描 → finding 集 ----
function scanDoc(file, text) {
  const exempt = isExemptSub(file);
  const lines = text.split(NL);
  const out = [];
  for (const cell of strictCells(lines)) {
    const codes = bareCodes(cell.text);
    for (const c of codes) out.push({ file, line: cell.line, kind: 'bare-shortcode', token: c, detail: cell.header, exempt });
    for (const p of fuzzyHits(cell.text)) out.push({ file, line: cell.line, kind: 'fuzzy-phrase', token: p, detail: cell.header, exempt });
    for (const s of shaTokens(cell.text)) {
      const full = resolveSha(s);
      if (full === null) { out.push({ file, line: cell.line, kind: 'nonexistent-sha', token: s, detail: cell.header, exempt }); continue; }
      if (objectType(full) !== 'commit') { out.push({ file, line: cell.line, kind: 'nonexistent-sha', token: s, detail: cell.header, exempt }); continue; }
      const len = s.length;
      const subj = hasSubject(cell.text, s);
      if (len < 12) out.push({ file, line: cell.line, kind: 'short-sha', token: s, sha: full, len: len, subj: subj, detail: cell.header, exempt });
      else if (!subj) out.push({ file, line: cell.line, kind: 'missing-subject', token: s, sha: full, len: len, subj: subj, detail: cell.header, exempt });
      else out.push({ file, line: cell.line, kind: 'legal', token: s, sha: full, len: len, subj: subj, detail: cell.header, exempt });
    }
  }
  return out;
}

// ---- 首跑普查（--emit）----
const EMIT = process.argv.indexOf('--emit') >= 0;
function emitRun() {
  const files = surfaceFiles();
  const all = [];
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const fd of scanDoc(rel(f), text)) all.push(fd);
  }
  console.log('SURFACE files=' + files.length + ' findings=' + all.length);
  const uniq = new Map();
  for (const fd of all) {
    if (fd.kind === 'legal') continue;
    const k = fd.file + '||' + fd.kind + '||' + fd.token;
    if (!uniq.has(k)) uniq.set(k, fd);
  }
  const rows = [...uniq.values()].sort((x, y) => (x.file + x.token < y.file + y.token ? -1 : 1));
  for (const fd of rows) console.log('CAND ' + fd.kind + ' :: ' + fd.file + ' :: ' + fd.token + ' :: ' + fd.detail + ' :: line ' + fd.line + (fd.exempt ? ' :: EXEMPT' : ''));
  return { files: files.length, rows: rows, all: all };
}

if (EMIT) {
  const r = emitRun();
  console.log('EMIT-DONE files=' + r.files + ' uniq=' + r.rows.length);
  process.exit(0);
}

const DQ = String.fromCharCode(34);
// ---- 册载入（D-192① baseline 文件制；禁行号定位）----
function loadBook() {
  if (!fs.existsSync(BOOK)) return { entries: [] };
  return JSON.parse(fs.readFileSync(BOOK, 'utf8'));
}
function splitPattern(p) { const v = String(p).split(String.fromCharCode(58)); return [v[0], v.slice(1).join(String.fromCharCode(58))]; }
const bookKey = (file, kind, token) => file + String.fromCharCode(124) + kind + String.fromCharCode(58) + token;
function bookKeySet(book) {
  const s = new Set();
  for (const e of (book.entries || [])) { const sp = splitPattern(e.pattern); s.add(bookKey(e.file, sp[0], sp[1])); }
  return s;
}

// ---- 判级（D-191③ 存量 WARN／册外新增 FAIL；可达性与孪生恒 WARN）----
// PV-F10B 行号四形态（file.ext:N／L<n>／行号／第 N 行）——模块级供 fixture 反例共用
const LINENO_RE = /[.](md|json|mjs):[ ]?[0-9]+|L[0-9]+|行号|第[ ]?[0-9]+[ ]?行/;
const SLUG_BY_KIND = { 'bare-shortcode': 'PV-BARE-SHORTCODE', 'fuzzy-phrase': 'PV-FUZZY-PHRASE', 'short-sha': 'PV-SHORT-SHA', 'missing-subject': 'PV-MISSING-SUBJECT', 'nonexistent-sha': 'PV-NONEXISTENT-SHA' };
function judge(findings, keys) {
  const out = [];
  for (const fd of findings) {
    if (fd.kind === 'legal') continue;
    const k = bookKey(fd.file, fd.kind, fd.token);
    if (keys.has(k)) out.push({ fd: fd, level: 'WARN', slug: 'PV-BASELINE-HIT' });
    else if (fd.exempt) out.push({ fd: fd, level: 'WARN', slug: 'PV-EXEMPT-SUBFACE' });
    else out.push({ fd: fd, level: 'FAIL', slug: SLUG_BY_KIND[fd.kind] || ('PV-UNMAPPED-' + fd.kind.toUpperCase()) });
  }
  return out;
}

// ---- 锚线可达性（WARN only——D-190④ 主锚线可达性留人工复核非机检）----
function anchorReach(sha, anchors) {
  for (const ln of anchors) { if (git(['merge-base', '--is-ancestor', sha, ln]).rc === 0) return ln; }
  return null;
}

// ---- 孪生 change-id 分桶（D-192③；桶>1 = WARN 列成员）----
function twinBuckets(findings) {
  const m = new Map();
  for (const fd of findings) {
    if (!fd.sha) continue;
    const cid = changeIdOf(fd.sha);
    if (!cid) continue;
    if (!m.has(cid)) m.set(cid, new Set());
    m.get(cid).add(fd.sha);
  }
  const out = [];
  for (const [cid, set] of m) if (set.size > 1) out.push({ cid: cid, members: [...set] });
  return out;
}

// ---- 主跑 ----
function mainRun() {
  const book = loadBook();
  const keys = bookKeySet(book);
  const anchors = (book.anchor_decl && book.anchor_decl.lines) || ['HEAD'];
  const entries = book.entries || [];
  const files = surfaceFiles();

  t('PV-A-SURFACE-CLOSED', SURFACE_CLOSED === 1, 'SURFACE_CLOSED=1 枚举 ' + SCAN_ROOTS.length + ' 根 + ' + SCAN_FILES.length + ' 文件');
  let rootsOk = true;
  for (const r of SCAN_ROOTS.concat(SCAN_FILES)) if (!fs.existsSync(join(ROOT, r))) rootsOk = false;
  t('PV-A2-ROOTS-EXIST', rootsOk, '五面逐件 existsSync');
  t('PV-A3-SURFACE-NONEMPTY', files.length > 0, 'files=' + files.length);

  const all = [];
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const fd of scanDoc(rel(f), text)) all.push(fd);
  }
  const verdicts = judge(all, keys);
  const fails = verdicts.filter((v) => v.level === 'FAIL');
  const warns = verdicts.filter((v) => v.level === 'WARN');
  const legalList = all.filter((x) => x.kind === 'legal');

  // B 严格层机检确在跑（自指正对照：合法形行零 finding）
  const SHA1 = 'cb625c64521398306f914eb7986a4a505f95291a';
  const subj1 = git(['log', '-1', '--format=%s', SHA1]).out;
  const legalLine = ['| 变更 commit | 说明 |', '|---|---|', '| ' + String.fromCharCode(96) + SHA1 + String.fromCharCode(96) + ' (' + DQ + subj1 + DQ + ') | 说明 |'].join(NL);
  const legalProbe = scanDoc('__probe__', legalLine);
  t('PV-B-STRICT-ACTIVE', legalProbe.length === 1 && legalProbe[0].kind === 'legal', '合法形行探针 kind=' + (legalProbe[0] ? legalProbe[0].kind : 'none') + '（零违规命中即机检在跑）');

  // C 法定形断言
  const badShape = legalList.filter((x) => !(x.len >= 12 && x.subj === true && objectType(x.sha) === 'commit'));
  t('PV-C-LEGAL-FORM', legalList.length > 0 && badShape.length === 0, 'legal 指针 ' + legalList.length + ' 件逐件断：位形≥12hex ∧ 带 subject 校验位 ∧ cat-file -t=commit；违例 ' + badShape.length);

  // D baseline 册两级判级（D-191③）
  t('PV-D-ZERO-NEW-FAIL', fails.length === 0, '册外 FAIL ' + fails.length + ' 件（须零）；册内 WARN ' + warns.length + ' 件');
  t('PV-D2-BASELINE-LOADED', entries.length > 0, '册条目 ' + entries.length + ' 件（首跑建册已落）');
  const kindSet = new Set(all.map((x) => x.kind).filter((k) => k !== 'legal'));
  const unmapped = [...kindSet].filter((k) => !SLUG_BY_KIND[k]);
  t('PV-D3-KIND-SLUG-TABLE', kindSet.size > 0 && unmapped.length === 0, '违规 kind→slug 对表覆盖 ' + kindSet.size + ' 形态（legal 为非违规形态不入表）；未映射 ' + unmapped.length + '（新增违规 kind 未登记 SLUG_BY_KIND 即红）');

  // E 锚线可达性 + 孪生分桶（恒 WARN，不影响 rc）
  const uniqU = new Map();
  for (const fd of all) { if (fd.sha && !anchorReach(fd.sha, anchors)) uniqU.set(fd.file + String.fromCharCode(124) + fd.sha, fd); }
  const twins = twinBuckets(all);
  for (const fd of uniqU.values()) warn('PV-UNREACHABLE', fd.file + ' :: ' + fd.sha.slice(0, 8) + ' 锚线未达（人工复核面 D-190④）');
  for (const b of twins) warn('PV-TWIN-BUCKET', 'change-id ' + b.cid.slice(0, 12) + ' 桶成员 ' + b.members.length + ': ' + b.members.map((x) => x.slice(0, 8)).join(' / '));
  let cidCovered = 0, cidTotal = 0;
  for (const fd of all) { if (!fd.sha) continue; cidTotal++; if (changeIdOf(fd.sha)) cidCovered++; }
  const bucketed = twins.reduce((a, b) => a + b.members.length, 0);
  warn('PV-TWIN-COVERAGE-INFO', '严格层 SHA ' + cidTotal + ' 件／取得 change-id ' + cidCovered + ' 件（覆盖率仅披露，不作判据）；同 change-id 桶 ' + twins.length + ' 族／' + bucketed + ' 成员');
  const twinInFail = fails.filter((v) => v.slug.indexOf('TWIN') >= 0 || v.slug.indexOf('UNREACHABLE') >= 0);
  const allBucketsGt1 = twinBuckets(all).every((b) => b.members.length > 1);
  t('PV-E-TWIN-NEVER-FAILS', allBucketsGt1 && twinInFail.length === 0, '孪生/不可达恒 WARN 不入 FAIL 集（判级矩阵 D-192①④）；FAIL 集内孪生相关 ' + twinInFail.length + ' 件');
  t('PV-E2-ANCHOR-DECL', Array.isArray(anchors) && anchors.length > 0, '锚线声明 lines=' + JSON.stringify(anchors));

  // F 册护栏自断言（D-192④ 防大赦名单化）
  let aOk = entries.length > 0;
  const aBad = [];
  for (const e of entries) {
    if (!e.errata_ref || !String(e.errata_ref).trim()) { aOk = false; aBad.push(e.id + ':空errata_ref'); continue; }
    const ref = String(e.errata_ref);
    const sp = ref.indexOf(' ');
    if (sp < 0) { aOk = false; aBad.push(e.id + ':格式'); continue; }
    const fp = join(ROOT, ref.slice(0, sp));
    if (!fs.existsSync(fp)) { aOk = false; aBad.push(e.id + ':文件缺'); continue; }
    const txt = fs.readFileSync(fp, 'utf8');
    let anchorTxt = ref.slice(sp + 1).trim();
    for (const sep of [String.fromCharCode(65288), String.fromCharCode(65290)]) { const i2 = anchorTxt.indexOf(sep); if (i2 > 0) anchorTxt = anchorTxt.slice(0, i2); }
    if (txt.indexOf(anchorTxt) < 0) { aOk = false; aBad.push(e.id + ':锚文本缺[' + anchorTxt + ']'); }
  }
  t('PV-F10A-ERRATA-REF', aOk, '册 ' + entries.length + ' 条 errata_ref 逐条实物可解析' + (aBad.length ? ' 失配: ' + aBad.join(', ') : ''));
  const lineno = entries.filter((e) => LINENO_RE.test(String(e.pattern)));
  t('PV-F10B-NO-LINENO', lineno.length === 0, 'pattern 无行号定位形态（四形态：file.ext:N／L<n>／行号／第 N 行；' + entries.length + ' 条）');
  t('PV-F10C-SURFACE-CLOSED', SURFACE_CLOSED === 1, '扫描面封闭性硬断言');
  const hitSet = new Set(verdicts.map((v) => bookKey(v.fd.file, v.fd.kind, v.fd.token)));
  const stale = entries.filter((e) => { const sp = splitPattern(e.pattern); return !hitSet.has(bookKey(e.file, sp[0], sp[1])); });
  for (const e of stale) warn('PV-STALE-ENTRY', e.id + ' 册项已无实物命中——可移除（ratchet 只减不增，禁判 FAIL）');
  const entryKeys = entries.map((e) => { const sp = splitPattern(e.pattern); return bookKey(e.file, sp[0], sp[1]); });
  const hitCount = entryKeys.filter((k) => hitSet.has(k)).length;
  t('PV-F10D-STALE-REPORTED', entries.length > 0 && stale.length + hitCount === entries.length, '失配 ' + stale.length + ' 件已自报 ／命中 ' + hitCount + ' 件 ／册 ' + entries.length + ' 条（不漏不重）');

  for (const v of warns) warn('PV-BASELINE-HIT', v.fd.kind + String.fromCharCode(58) + v.fd.token + ' @ ' + v.fd.file + ' [' + v.fd.detail + ']');
  for (const v of fails) console.log('FAIL ' + v.slug + ' :: ' + v.fd.kind + String.fromCharCode(58) + v.fd.token + ' @ ' + v.fd.file + ':' + v.fd.line + ' [' + v.fd.detail + ']');
  console.log('SURFACE files=' + files.length + ' findings=' + all.length + ' legal=' + legalList.length + ' baselineWarn=' + warns.length + ' newFail=' + fails.length + ' unreachable=' + uniqU.size + ' twinBuckets=' + twins.length + ' staleEntries=' + stale.length);
  return { all: all, files: files, fails: fails, warns: warns, twins: twins, stale: stale };
}


// ---- G fixture 四态＋六衍生态红绿分野（D-192⑤ 预声明 §3；rc 隔离自断言）----
function fixtureRun() {
  const book = loadBook();
  const keys = bookKeySet(book);
  const BT = String.fromCharCode(96);
  const DQc = String.fromCharCode(34);
  const SHA_OK = 'cb625c64521398306f914eb7986a4a505f95291a';
  const SHA_TWIN = '201935fc7764c3a3716a0400cd603a76ef5b5cec';
  const subj = (sha) => git(['log', '-1', '--format=%s', sha]).out;
  const hdr = ['| 变更 commit | 说明 |', '|---|---|'].join(NL);
  const cell = (sha, withSubj) => '| ' + BT + sha + BT + (withSubj ? ' (' + DQc + subj(sha) + DQc + ')' : '') + ' | 说明 |';
  const doc = (rows) => hdr + NL + rows.join(NL);
  const noKeys = new Set();
  const probe = (d) => scanDoc('__fixture__', d);
  const j0 = judge(probe(doc([cell(SHA_OK, true)])), noKeys);
  t('PV-G-F01-LEGAL-PASS', j0.length === 0, '合法形行零违规（rc 不受影响）');
  const j1 = judge(probe(doc([cell('cb625c64521398306f914eb7986a4a505f95291b', true)])), noKeys);
  t('PV-G-F02-NEW-FAIL', j1.length === 1 && j1[0].level === 'FAIL' && j1[0].slug === 'PV-NONEXISTENT-SHA', '册外幻觉 SHA 判 FAIL slug=' + (j1[0] ? j1[0].slug : 'none') + '（40hex 形但对象不存在＝E-3 幻觉 hex 族）');
  const j2 = judge(probe(doc([cell('da0c25a9', false)])), new Set([bookKey('__fixture__', 'short-sha', 'da0c25a9')]));
  t('PV-G-F03-BASELINE-HIT', j2.length === 1 && j2[0].level === 'WARN' && j2[0].slug === 'PV-BASELINE-HIT', '册内短 SHA 判 WARN slug=' + (j2[0] ? j2[0].slug : 'none'));
  const tb = twinBuckets(probe(doc([cell(SHA_TWIN, false), cell(SHA_OK, true)])));
  t('PV-G-F04-TWIN-BUCKET', tb.length === 1 && tb[0].members.length === 2, '同 change-id 桶成员 ' + (tb[0] ? tb[0].members.length : 0) + '（>1 触发 WARN）');
  const j4 = judge(probe(doc(['| wmu（check-kit regex 态） | 说明 |'])), noKeys);
  t('PV-G-F05-BARE-SHORTCODE', j4.length === 1 && j4[0].level === 'FAIL' && j4[0].slug === 'PV-BARE-SHORTCODE', '裸短码判 FAIL slug=' + (j4[0] ? j4[0].slug : 'none'));
  const j5 = judge(probe(doc(['| 本轮修复 commit | 说明 |'])), noKeys);
  t('PV-G-F06-FUZZY-PHRASE', j5.length === 1 && j5[0].level === 'FAIL' && j5[0].fd.kind === 'fuzzy-phrase', '模糊语判 FAIL kind=' + (j5[0] ? j5[0].fd.kind : 'none'));
  const reachOK = anchorReach(SHA_OK, ['HEAD', 'main']);
  const reachBad = anchorReach(SHA_TWIN, ['HEAD', 'main']);
  const j7f = judge(probe(doc([cell(SHA_TWIN, false)])), new Set([bookKey('__fixture__', 'missing-subject', SHA_TWIN)]));
  const f7Fail = j7f.filter((v) => v.level === 'FAIL');
  const f7Warn = j7f.filter((v) => v.level === 'WARN');
  t('PV-G-F07-UNREACHABLE-WARN-ONLY', reachOK !== null && reachBad === null && f7Fail.length === 0 && f7Warn.length === 1, '可达=' + reachOK + ' ／不可达=' + reachBad + '；judge 路由：FAIL ' + f7Fail.length + ' ／WARN ' + f7Warn.length + '（不可达禁判 FAIL——D-190④）');
  const exHits = scanDoc('__fixture__/R51-Q5-atomcode-research.md', doc([cell('da0c25a9', false)]));
  const j6 = judge(exHits, noKeys);
  t('PV-G-F08-EXEMPT-SUBFACE', j6.length === 1 && j6[0].level === 'WARN' && j6[0].slug === 'PV-EXEMPT-SUBFACE', '豁免子面降 WARN slug=' + (j6[0] ? j6[0].slug : 'none'));
  const staleKey = bookKey('__nowhere__', 'short-sha', 'zzzzzzz');
  const hitSetF = new Set(judge(probe(doc([cell(SHA_OK, true)])), new Set([staleKey])).map((v) => bookKey(v.fd.file, v.fd.kind, v.fd.token)));
  t('PV-G-F09-STALE-ENTRY', [...new Set([staleKey])].filter((k) => !hitSetF.has(k)).length === 1, '失配册项可检出（自报可移除，禁判 FAIL）');
  t('PV-G-F10-BOOK-KEY-ROUNDTRIP', keys.size === (book.entries || []).length, '册键数=' + keys.size + ' ／册条目=' + (book.entries || []).length);
  const KINDS = ['bare-shortcode', 'fuzzy-phrase', 'short-sha', 'missing-subject', 'nonexistent-sha'];
  const kindProbe = [
    ['bare-shortcode', doc(['| wmu（x） | 说明 |'])],
    ['fuzzy-phrase', doc(['| 本轮修复 commit | 说明 |'])],
    ['short-sha', doc(['| da0c25a9 | 说明 |'])],
    ['missing-subject', doc(['| ' + BT + SHA_OK + BT + ' | 说明 |'])],
    ['nonexistent-sha', doc(['| ' + BT + 'cb625c64521398306f914eb7986a4a505f95291b' + BT + ' | 说明 |'])]
  ];
  const kindOk = kindProbe.every((p) => judge(probe(p[1]), noKeys).length === 1 && judge(probe(p[1]), noKeys)[0].fd.kind === p[0]);
  t('PV-G-F11-KIND-REACHABLE', kindOk, '五形态各自可达且 kind 判准（' + KINDS.length + ' 形态，集合与实现同源）');
  const linenoHit = LINENO_RE.test('short-sha:decision-ledger.md:1659');
  const linenoMiss = LINENO_RE.test('short-sha:da0c25a9');
  t('PV-G-F12-LINENO-DETECT', linenoHit && !linenoMiss, '行号形态反例：file.ext:N 必抓／kind:token 分隔符不误抓');
}

const res = mainRun();
fixtureRun();
console.log('PASS-COUNT ' + pass + ' FAIL-COUNT ' + fail);
console.log('GUARD-RESULT: 84-check ' + (fail === 0 ? 'PASS' : 'FAIL') + ' newFail=' + res.fails.length + ' baselineWarn=' + res.warns.length + ' twinBuckets=' + res.twins.length);
process.exit(fail === 0 ? 0 : 1);
