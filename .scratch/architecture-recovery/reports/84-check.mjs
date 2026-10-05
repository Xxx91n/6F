// 84-check.mjs — commit 指针纪律守卫（D-188~D-192 轮 52 T1-A 落盘）
// 断言面：A 扫描面封闭枚举（C）→ B 严格层位形三通道机检＋内容驱动反向闸（D-197②）→ C 法定形断言（cat-file 存在）
//   → D baseline 册两级判级（册内 WARN／册外 FAIL）→ E 孪生 change-id 分桶 WARN → F 册护栏自断言（册归零=合法终态 D-201②）→ G fixture 四态＋十三衍生态红绿分野（轮 54 T1-B：扩列 7 列头＋反向闸两 kind＋D5/D6/D7 收紧＋subject 引文不透明豁免——预声明 reports/D-197-pointer-surface-predeclaration.md）
// 判级纪律（D-191③）：rc≠0 仅由「册外 FAIL 类」触发；可达性／孪生／豁免子面／册项失配恒 WARN 不影响 rc。
// 零三方依赖；零反斜杠（正则一律字符类，per WORKFLOW lessons W2-#02/W3-#09 backslash 教训）。
// 用法：node 84-check.mjs          → 逐条 PASS/WARN/FAIL；exit 0=无册外违规
//       node 84-check.mjs --emit   → 仅打印首跑普查候选清单（建册用，不判级）
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { need, groupProbe } from './_lib/env-contract.mjs';   // D-159⑥ env-contract SSOT（first-party 本仓件——非三方依赖）

const TIER = 'portable';
const PROTECTED_SURFACE = 'D-188~D-192 commit 指针纪律严格层机检（法定形断言＋known-pointer-violations 册两级判级＋孪生 change-id 分桶）；known-pointer-violations 为本守卫输入工件（baseline 册），其生命周期独立于面消亡判据（D-201②）；#88 fixture 自足重声明（2026-10-05，D-163① 零写入临时仓读法/D-159②）——fixture SHA_OK/SHA_TWIN 运行时物化，零依赖未推送对象，主仓零写入，portable tier fresh-clone 可跑重申；R64 审计返修 P0-1：B 面探针（cb625c64 历史字面钉废止→FX.SHA_OK）＋F 面短钉（da0c25a9→SHA_OK 8hex 前缀）改运行时物化，浅克隆检出→C/D 面组级 SKIP（DOCSCAN，env-contract need git-history:full）——零历史依赖面全自足';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const BOOK = join(HERE, 'known-pointer-violations.json');
const NL = String.fromCharCode(10);

// ---- 扫描面封闭枚举（D-192②；扩面走立法票 D-095，禁开放增长）----
const SURFACE_CLOSED = 1;
const SCAN_ROOTS = ['.scratch/macro-audit', '.scratch/architecture-recovery', 'docs/adr'];
const SCAN_FILES = ['CONTEXT.md', 'AGENTS.md'];
// D-212① 防误读注记（2026-10-05）：本守卫对 decision-ledger 的文档面扫描（短码/模糊语/幻觉 SHA/孪生桶/可达性 WARN 面）维持不变不因 D-212 收窄——账本 ##/### 节标题唯一性断言 owner=41a-check（#89）。
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
  'git 短 hash（可 cat-file -e）', 'git 短 hash',
  'commit', 'SHA', 'commit hash', 'commit SHA', '指针', 'SHA-1', 'hash'
];
const SECTION_ANCHOR_RE = /T3 .*(?:哨兵|读数)/;
const ROMAN = new Set(['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx']);
// 英文实词豁免集（D-200：ROMAN 同型——「真英语词非码」口径收编；高频虚词例同为误报源一并收录并已在预声明 §4 登记口径；wmu/kmk/qmw/rkm 非英语词不豁免）
const WORDS = new Set(['the','and','for','not','but','you','all','can','her','was','one','our','out','day','get','has','him','his','how','man','new','now','old','see','two','way','who','did','its','let','put','say','she','too','use','that','this','with','from','have','will','your','what','when','are','been','were','run','set','end','add','age','ago','aim','air','app','arc','arm','art','ask','bad','bag','ban','bar','bat','bed','bet','bid','bit','box','bus','buy','cal','cap','car','cat','cup','cut','dad','den','dew','dig','dim','dip','dry','ear','eat','egg','ego','era','err','eve','eye','fan','fat','fig','fin','fit','fix','flu','fly','foe','fog','fox','gap','gas','gem','god','got','gum','gun','guy','gym','had','ham','hat','hay','hen','hew','hid','hit','hoe','hog','hot','hum','hut','ice','ill','imp','ink','inn','ion','ire','irk','jab','jam','jar','jaw','jet','job','jog','jot','joy','jug','keg','key','kid','kin','kit','lab','lad','lag','lap','law','lax','lay','leg','lid','lie','lip','lit','log','lot','low','mad','map','mar','mat','may','men','met','mid','mix','mob','mop','mud','mug','nab','nag','nap','nay','net','nip','nod','nor','nun','nut','oak','oar','oat','odd','off','oil','opt','orb','ore','owe','owl','own','pad','pal','pan','pap','par','pat','paw','pay','pea','peg','pen','pep','per','pet','pew','pie','pig','pin','pit','ply','pod','pop','pot','pro','pry','pub','pug','pun','pup','rag','ram','ran','rap','rat','raw','ray','red','ref','rib','rid','rig','rim','rip','rob','rod','rot','row','rub','rue','rug','rum','rut','rye','sad','sag','sap','sat','saw','sax','sea','sew','shy','sin','sip','sir','sit','six','ski','sky','son','sow','soy','spa','spy','sub','sun','tab','tad','tag','tan','tap','tar','tax','tea','ten','thy','tie','tin','tip','toe','ton','top','toy','try','tub','tug','van','vat','vex','via','vie','wad','wan','war','wax','web','wed','wet','wig','win','wit','woe','wok','won','wow','yak','yam','yap','yes','yet','yew','zag','zap','zed','zoo','git','cli','api','url','uri','sha','hex','mjs','css','dom','ipc','npm','e2e','tdd','llm','sdk','sql','ssl','tcp','udp','dns','png','jpg','svg','xml','jsx','tsx','esm','cjs','amd','umd','iso','oss','cpu','gpu','ram','jdk','jvm','gpt','awk','sed','dev','env','obj','val','var','len','idx','str','int','min','max','wip','poc','mvp','adr','dsl','lhs','rhs','src','dst','tmp','tpl','ctx','cfg','pkg','dep','ver','doc','msg','err','req','res']);
const isWordish = (x) => ROMAN.has(x) || WORDS.has(x);
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
let GIT_CWD = ROOT;          // fixtureRun 运行时物化窗口内指向临时仓（#88），其余恒 ROOT
let GIT_ALT_OBJECTS = null;  // fixture 窗口内借主仓 objects（alternates 只读——主仓零写入 D-074）
function git(args) {
  const k = GIT_CWD + '::' + args.join(' ');
  if (gcache.has(k)) return gcache.get(k);
  const spawnOpts = { cwd: GIT_CWD, encoding: 'utf8' };
  if (GIT_ALT_OBJECTS) spawnOpts.env = Object.assign({}, process.env, { GIT_ALTERNATE_OBJECT_DIRECTORIES: GIT_ALT_OBJECTS });
  const r = spawnSync('git', args, spawnOpts);
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
      const relPosix = p.split(String.fromCharCode(92)).join('/');
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
const rel = (p) => relative(ROOT, p).split(String.fromCharCode(92)).join('/');

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
  let body = s;
  if (body.startsWith('|')) body = body.slice(1);
  if (body.endsWith('|')) body = body.slice(0, body.length - 1);
  return body.split('|').map((c) => c.trim());
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
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ft = line.trim();
    if (ft.startsWith('```') || ft.startsWith('~~~')) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (line.startsWith('#')) { sectionHit = SECTION_ANCHOR_RE.test(line); continue; }
    if (isSepRow(line) && i > 0 && lines[i - 1].trim().startsWith('|')) {
      const cols = splitRow(lines[i - 1]).map(normHeader);
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('|') && !isSepRow(lines[j])) {
        const cells = splitRow(lines[j]);
        for (let c = 0; c < cols.length; c++) {
          if (c >= cells.length) continue;
          const hit = sectionHit || STRICT_HEADERS.indexOf(cols[c]) >= 0;
          if (cells[c] && cells[c] !== '—' && cells[c] !== '-') {
            out.push({ line: j + 1, col: c, header: cols[c], text: cells[c], hit: hit });
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
      if (/^[a-z]{3}$/.test(inner) && !isWordish(inner)) out.push(inner);
      i = q + 1;
    }
  }
  // 首位裸短码（D-188③ GitButler 3 字母便利码单独承担定位；形如 wmu（…）／wmu …）
  const stripped = cell.replace(/^[*` ]+/, '');
  const leadM = stripped.match(/^([a-z]{3})/);
  if (leadM && !isWordish(leadM[1])) {
    const rest = stripped.slice(3);
    const normRest = rest.replace(/[^0-9A-Za-z]/g, '');
    if (rest.indexOf('（') === 0 || rest.indexOf('(') === 0 || normRest.length === 0) out.push(leadM[1]);
  }

  for (const kw of ['commit ', '分支 ', 'branch ']) {
    let k = -1;
    while ((k = cell.indexOf(kw, k + 1)) >= 0) {
      const m = cell.slice(k + kw.length).match(/^[a-z]{3}([^0-9A-Za-z_]|$)/);
      if (m && !isWordish(m[1])) out.push(m[1]);
    }
  }
  const seen = new Set();
  return out.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
}
function stripSubjectQuotes(cell) {
  const DQc = String.fromCharCode(34);
  const open = '(' + DQc;
  const close = DQc + ')';
  let out = '';
  let rest = cell;
  for (;;) {
    const a = rest.indexOf(open);
    if (a < 0) { out += rest; break; }
    const b = rest.indexOf(close, a + 2);
    if (b < 0) { out += rest; break; }
    out += rest.slice(0, a + 2);
    rest = rest.slice(b);
  }
  return out;
}
function fuzzyHits(cell) {
  const body = stripSubjectQuotes(cell);
  const out = [];
  for (const p of FUZZY) {
    if (body.indexOf(p) < 0) continue;
    if (out.some((q) => q.indexOf(p) >= 0)) continue;
    out.push(p);
  }
  return out;
}
function hasSubject(cell, sha) {
  const i = cell.indexOf(sha);
  if (i < 0) return false;
  const after = cell.slice(i + sha.length);
  const DQc = String.fromCharCode(34);
  const open = '(' + DQc;
  const a = after.indexOf(open);
  if (a < 0) return false;
  const b = after.indexOf(DQc + ')', a + 2);
  if (b < 0) return false;
  return after.slice(a + 2, b).trim().length > 0;
}

// ---- 反向闸负载判据（D-197②：格载荷即指针本身——剥反引号/空白后整体为 hex 或 hex+("subject")；混合散文格不判，宽层散文不背税 D-189②）----
function normCellText(cell) {
  return cell.split(String.fromCharCode(96)).join('').split(' ').join('').trim();
}
function pointerPayload(cell) {
  const s = normCellText(cell);
  if (/^[0-9a-f]{7,40}$/.test(s)) return { shape: 'bare', token: s };
  const DQc = String.fromCharCode(34);
  const m = s.match(new RegExp('^([0-9a-f]{7,40})[(]' + DQc + '[^' + DQc + ']*' + DQc + '[)]$'));
  if (m) return { shape: 'subject', token: m[1] };
  return null;
}

// ---- 文档扫描 → finding 集 ----
function scanDoc(file, text) {
  const exempt = isExemptSub(file);
  const lines = text.split(NL);
  const out = [];
  for (const cell of strictCells(lines)) {
    if (!cell.hit) {
      const p = pointerPayload(cell.text);
      if (p) {
        const full = resolveSha(p.token);
        if (full === null || objectType(full) !== 'commit') out.push({ file, line: cell.line, kind: 'misplaced-unresolvable', token: p.token, detail: cell.header, exempt });
        else out.push({ file, line: cell.line, kind: 'misplaced-pointer', token: p.token, sha: full, detail: cell.header, exempt });
      }
      continue;
    }
    const visible = stripSubjectQuotes(cell.text);
    const codes = bareCodes(visible);
    for (const c of codes) out.push({ file, line: cell.line, kind: 'bare-shortcode', token: c, detail: cell.header, exempt });
    for (const p of fuzzyHits(visible)) out.push({ file, line: cell.line, kind: 'fuzzy-phrase', token: p, detail: cell.header, exempt });
    for (const s of shaTokens(visible)) {
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
const SLUG_BY_KIND = { 'bare-shortcode': 'PV-BARE-SHORTCODE', 'fuzzy-phrase': 'PV-FUZZY-PHRASE', 'short-sha': 'PV-SHORT-SHA', 'missing-subject': 'PV-MISSING-SUBJECT', 'nonexistent-sha': 'PV-NONEXISTENT-SHA', 'misplaced-pointer': 'PV-MISPLACED-POINTER', 'misplaced-unresolvable': 'PV-MISPLACED-UNRESOLVABLE' };
function judge(findings, keys) {
  const out = [];
  for (const fd of findings) {
    if (fd.kind === 'legal') continue;
    if (fd.kind === 'misplaced-unresolvable') { out.push({ fd: fd, level: 'WARN', slug: 'PV-MISPLACED-UNRESOLVABLE' }); continue; }
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
function mainRun(FX) {
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

  // R64 审计返修 P0-1（born-red 修复——审计窗 CI 浅克隆实证 72 件级联误红）：C/D 面逐件 cat-file 校验
  //   真账本引用的历史 commit 指针，浅克隆（--depth 1）对象库不含历史=环境性不可判——组级 SKIP 带因降级
  //   （40-check:B env-contract 同型，D-159⑥ SSOT need()）；B/G 面已零历史依赖（运行时物化）照跑。
  //   CI 侧 engine-ci.yml checkout fetch-depth: 0 全量覆盖（golden-ci.yml:41 先例同型）。
  const IS_SHALLOW = git(['rev-parse', '--is-shallow-repository']).out === 'true';
  const DOCSCAN_OK = !IS_SHALLOW;
  if (!DOCSCAN_OK) groupProbe('84-check', 'DOCSCAN', [need('git-history:full', false, '原因：84-check C/D 面逐件 cat-file 校验真账本引用的历史 commit 指针，浅克隆对象库不含历史（R64 返修 P0-1 实证 72 件级联误红）；手动修复：完整克隆或 CI checkout 加 fetch-depth: 0（engine-ci.yml 已配）；无网影响面：全量历史本地即在零联网，SKIP 期间 B/G 面（运行时物化自足）照跑')]);
  let all = [], verdicts = [], fails = [], warns = [], legalList = [], twins = [], stale = [];
  const uniqU = new Map();
  if (DOCSCAN_OK) {
    for (const f of files) {
      let text;
      try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
      for (const fd of scanDoc(rel(f), text)) all.push(fd);
    }
    verdicts = judge(all, keys);
    fails = verdicts.filter((v) => v.level === 'FAIL');
    warns = verdicts.filter((v) => v.level === 'WARN');
    legalList = all.filter((x) => x.kind === 'legal');
  }

  // B 严格层机检确在跑（自指正对照：合法形行零 finding）——R64 审计返修 P0-1：探针 SHA 由历史字面钉
  //   （cb625c64…，浅克隆不可达→PV-B born-red）改 FX.SHA_OK 运行时物化——探针语义不动（合法形行判 legal），零历史依赖
  const bakCwd = GIT_CWD, bakAlt = GIT_ALT_OBJECTS;
  GIT_CWD = FX.fxDir; GIT_ALT_OBJECTS = FX.mainObjects; gcache.clear();
  const subj1 = git(['log', '-1', '--format=%s', FX.SHA_OK]).out;
  const legalLine = ['| 变更 commit | 说明 |', '|---|---|', '| ' + String.fromCharCode(96) + FX.SHA_OK + String.fromCharCode(96) + ' (' + DQ + subj1 + DQ + ') | 说明 |'].join(NL);
  const legalProbe = scanDoc('__probe__', legalLine);
  GIT_CWD = bakCwd; GIT_ALT_OBJECTS = bakAlt; gcache.clear();
  t('PV-B-STRICT-ACTIVE', legalProbe.length === 1 && legalProbe[0].kind === 'legal', '合法形行探针 kind=' + (legalProbe[0] ? legalProbe[0].kind : 'none') + '（零违规命中即机检在跑；探针件=fixture 运行时物化零历史依赖）');

  if (DOCSCAN_OK) {
    // C 法定形断言（历史依赖面——浅克隆组级 SKIP，见 P0-1 注记）
    const badShape = legalList.filter((x) => !(x.len >= 12 && x.subj === true && objectType(x.sha) === 'commit'));
    t('PV-C-LEGAL-FORM', legalList.length > 0 && badShape.length === 0, 'legal 指针 ' + legalList.length + ' 件逐件断：位形≥12hex ∧ 带 subject 校验位 ∧ cat-file -t=commit；违例 ' + badShape.length);

    // D baseline 册两级判级（D-191③）
    t('PV-D-ZERO-NEW-FAIL', fails.length === 0, '册外 FAIL ' + fails.length + ' 件（须零）；册内 WARN ' + warns.length + ' 件');
  }
  t('PV-D2-BASELINE-LOADED', fs.existsSync(BOOK) && Array.isArray(entries), '册工件在位（existsSync＋entries 数组——归零=合法终态 D-201②）entries=' + entries.length + ' 件');
  if (DOCSCAN_OK) {
    const kindSet = new Set(all.map((x) => x.kind).filter((k) => k !== 'legal'));
    const unmapped = [...kindSet].filter((k) => !SLUG_BY_KIND[k]);
    t('PV-D3-KIND-SLUG-TABLE', kindSet.size > 0 && unmapped.length === 0, '违规 kind→slug 对表覆盖 ' + kindSet.size + ' 形态（legal 为非违规形态不入表）；未映射 ' + unmapped.length + '（新增违规 kind 未登记 SLUG_BY_KIND 即红）');
  }

  // E 锚线可达性 + 孪生分桶（恒 WARN，不影响 rc）——历史依赖面（fd.sha 来自真账本解析），浅克隆随 DOCSCAN 组 SKIP
  if (DOCSCAN_OK) {
    for (const fd of all) { if (fd.sha && !anchorReach(fd.sha, anchors)) uniqU.set(fd.file + String.fromCharCode(124) + fd.sha, fd); }
    twins = twinBuckets(all);
    for (const fd of uniqU.values()) warn('PV-UNREACHABLE', fd.file + ' :: ' + fd.sha.slice(0, 8) + ' 锚线未达（人工复核面 D-190④）');
    for (const b of twins) warn('PV-TWIN-BUCKET', 'change-id ' + b.cid.slice(0, 12) + ' 桶成员 ' + b.members.length + ': ' + b.members.map((x) => x.slice(0, 8)).join(' / '));
    let cidCovered = 0, cidTotal = 0;
    for (const fd of all) { if (!fd.sha) continue; cidTotal++; if (changeIdOf(fd.sha)) cidCovered++; }
    const bucketed = twins.reduce((a, b) => a + b.members.length, 0);
    warn('PV-TWIN-COVERAGE-INFO', '严格层 SHA ' + cidTotal + ' 件／取得 change-id ' + cidCovered + ' 件（覆盖率仅披露，不作判据）；同 change-id 桶 ' + twins.length + ' 族／' + bucketed + ' 成员');
    const twinInFail = fails.filter((v) => v.slug.indexOf('TWIN') >= 0 || v.slug.indexOf('UNREACHABLE') >= 0);
    const allBucketsGt1 = twinBuckets(all).every((b) => b.members.length > 1);
    t('PV-E-TWIN-NEVER-FAILS', allBucketsGt1 && twinInFail.length === 0, '孪生/不可达恒 WARN 不入 FAIL 集（判级矩阵 D-192①④）；FAIL 集内孪生相关 ' + twinInFail.length + ' 件');
  }
  t('PV-E2-ANCHOR-DECL', Array.isArray(anchors) && anchors.length > 0, '锚线声明 lines=' + JSON.stringify(anchors));

  // F 册护栏自断言（D-192④ 防大赦名单化）
  let aOk = true;
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
  if (DOCSCAN_OK) {
    const hitSet = new Set(verdicts.map((v) => bookKey(v.fd.file, v.fd.kind, v.fd.token)));
    stale = entries.filter((e) => { const sp = splitPattern(e.pattern); return !hitSet.has(bookKey(e.file, sp[0], sp[1])); });
    for (const e of stale) warn('PV-STALE-ENTRY', e.id + ' 册项已无实物命中——可移除（ratchet 只减不增，禁判 FAIL）');
    const entryKeys = entries.map((e) => { const sp = splitPattern(e.pattern); return bookKey(e.file, sp[0], sp[1]); });
    const hitCount = entryKeys.filter((k) => hitSet.has(k)).length;
    t('PV-F10D-STALE-REPORTED', stale.length + hitCount === entries.length, '失配 ' + stale.length + ' 件已自报 ／命中 ' + hitCount + ' 件 ／册 ' + entries.length + ' 条（不漏不重；归零态 0＋0==0 自洽 D-201②）');
  }

  if (DOCSCAN_OK) {
    for (const v of warns) warn('PV-BASELINE-HIT', v.fd.kind + String.fromCharCode(58) + v.fd.token + ' @ ' + v.fd.file + ' [' + v.fd.detail + ']');
    for (const v of fails) console.log('FAIL ' + v.slug + ' :: ' + v.fd.kind + String.fromCharCode(58) + v.fd.token + ' @ ' + v.fd.file + ':' + v.fd.line + ' [' + v.fd.detail + ']');
  }
  console.log('SURFACE files=' + files.length + ' findings=' + all.length + ' legal=' + legalList.length + ' baselineWarn=' + warns.length + ' newFail=' + fails.length + ' unreachable=' + uniqU.size + ' twinBuckets=' + twins.length + ' staleEntries=' + stale.length + (DOCSCAN_OK ? '' : ' docscan=SKIP(shallow)'));
  return { all: all, files: files, fails: fails, warns: warns, twins: twins, stale: stale, docscanSkipped: !DOCSCAN_OK };
}


// ---- fixture 运行时物化（R64 审计返修 P0-1 提升为主跑前共享件——B 面探针与 G 面同源）----
// #88 fixture 自足修（D-163① 首选零写入临时仓读法——predecl 2026-10-05-r63-t1-predecl.md §2.1）：
//   SHA_OK/SHA_TWIN 运行时物化——mkdtemp 临时仓自足＋GIT_ALTERNATE_OBJECT_DIRECTORIES 借主仓 objects（alternates 只读，主仓零写入 D-074）；
//   孤儿 commit 201935fc 字面钉废止——零依赖未推送对象，fresh clone 可跑（portable 重申 D-159②）；断言面 F01~F20 语义逐条不动。
function materializeFixture() {
  const fxDir = fs.mkdtempSync(join(tmpdir(), '84-fixture-'));
  const gcdOut = git(['rev-parse', '--git-common-dir']).out || '.git';
  const mainObjects = fs.existsSync(join(ROOT, gcdOut, 'objects')) ? join(ROOT, gcdOut, 'objects') : join(gcdOut, 'objects');
  const FX_ENV = Object.assign({}, process.env, { GIT_ALTERNATE_OBJECT_DIRECTORIES: mainObjects, GIT_AUTHOR_NAME: '84-fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid', GIT_COMMITTER_NAME: '84-fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid', GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z' });
  const fxInit = spawnSync('git', ['init', '-q', fxDir], { encoding: 'utf8' });
  if (fxInit.status !== 0) throw new Error('84-fixture: temp repo init failed ' + String(fxInit.stderr || ''));
  const fxTree = spawnSync('git', ['-C', fxDir, 'mktree'], { encoding: 'utf8', input: '', env: FX_ENV });
  if (fxTree.status !== 0) throw new Error('84-fixture: mktree failed ' + String(fxTree.stderr || ''));
  const TREE_SHA = String(fxTree.stdout || '').trim();
  const fxOk = spawnSync('git', ['-C', fxDir, 'commit-tree', TREE_SHA, '-m', 'fixture: reachable ok subject', '-m', 'change-id 84fixtureok0000'], { encoding: 'utf8', env: FX_ENV });
  if (fxOk.status !== 0) throw new Error('84-fixture: commit-tree ok failed ' + String(fxOk.stderr || ''));
  const SHA_OK = String(fxOk.stdout || '').trim();   // 运行时物化：update-ref HEAD 后=锚线可达
  spawnSync('git', ['-C', fxDir, 'update-ref', 'HEAD', SHA_OK], { encoding: 'utf8', env: FX_ENV });
  const fxTwin = spawnSync('git', ['-C', fxDir, 'commit-tree', TREE_SHA, '-p', SHA_OK, '-m', 'fixture: twin subject', '-m', 'change-id 84fixtureok0000'], { encoding: 'utf8', env: FX_ENV });
  if (fxTwin.status !== 0) throw new Error('84-fixture: commit-tree twin failed ' + String(fxTwin.stderr || ''));
  const SHA_TWIN = String(fxTwin.stdout || '').trim();   // 运行时物化：零 ref=锚线不可达孪生（同 change-id 注入→孪生桶语义保真）
  return { fxDir: fxDir, mainObjects: mainObjects, SHA_OK: SHA_OK, SHA_TWIN: SHA_TWIN };
}
const FX = materializeFixture();

// ---- G fixture 四态＋六衍生态红绿分野（D-192⑤ 预声明 §3；rc 隔离自断言）----
function fixtureRun() {
  const book = loadBook();
  const keys = bookKeySet(book);
  const BT = String.fromCharCode(96);
  const DQc = String.fromCharCode(34);
  const fxDir = FX.fxDir, mainObjects = FX.mainObjects, SHA_OK = FX.SHA_OK, SHA_TWIN = FX.SHA_TWIN;
  const ROOT_CWD_BAK = GIT_CWD; const ALT_BAK = GIT_ALT_OBJECTS;
  GIT_CWD = fxDir; GIT_ALT_OBJECTS = mainObjects; gcache.clear();
  const SHORT_OK = SHA_OK.slice(0, 8);   // R64 审计返修 P0-1：short-sha 探针件由历史短钉（da0c25a9，浅克隆不可达）改 SHA_OK 运行时缩位——判据原义（<12hex 判 short-sha）不动
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
  const j2 = judge(probe(doc([cell(SHORT_OK, false)])), new Set([bookKey('__fixture__', 'short-sha', SHORT_OK)]));
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
  const exHits = scanDoc('__fixture__/R51-Q5-atomcode-research.md', doc([cell(SHORT_OK, false)]));
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
    ['short-sha', doc(['| ' + SHORT_OK + ' | 说明 |'])],
    ['missing-subject', doc(['| ' + BT + SHA_OK + BT + ' | 说明 |'])],
    ['nonexistent-sha', doc(['| ' + BT + 'cb625c64521398306f914eb7986a4a505f95291b' + BT + ' | 说明 |'])]
  ];
  const kindOk = kindProbe.every((p) => judge(probe(p[1]), noKeys).length === 1 && judge(probe(p[1]), noKeys)[0].fd.kind === p[0]);
  t('PV-G-F11-KIND-REACHABLE', kindOk, '五形态各自可达且 kind 判准（' + KINDS.length + ' 形态，集合与实现同源）');
  const linenoHit = LINENO_RE.test('short-sha:decision-ledger.md:1659');
  const linenoMiss = LINENO_RE.test('short-sha:da0c25a9');
  t('PV-G-F12-LINENO-DETECT', linenoHit && !linenoMiss, '行号形态反例：file.ext:N 必抓／kind:token 分隔符不误抓');
  const FENCE = String.fromCharCode(96, 96, 96);
  const hdrCommit = ['| commit | 说明 |', '|---|---|'].join(NL);
  const hdrSha = ['| SHA | 说明 |', '|---|---|'].join(NL);
  const p13a = scanDoc('__fixture__', hdrCommit + NL + cell(SHA_OK, true));
  const p13b = scanDoc('__fixture__', hdrSha + NL + cell(SHA_OK, true));
  t('PV-G-F13-STRICT-HEADERS-EXPANDED', p13a.length === 1 && p13a[0].kind === 'legal' && p13b.length === 1 && p13b[0].kind === 'legal', 'bare commit/SHA 列头收编后合法形 cell 判 legal（扩列在跑 D-197①）');
  const p14 = judge(probe(['| 备注 | 说明 |', '|---|---|', '| ' + SHA_OK + ' | x |'].join(NL)), noKeys);
  t('PV-G-F14-REVERSE-GATE', p14.length === 1 && p14[0].level === 'FAIL' && p14[0].slug === 'PV-MISPLACED-POINTER', '非白名单列头纯指针负载判 FAIL slug=' + (p14[0] ? p14[0].slug : 'none') + '（D-197② 反向闸）');
  const p15 = judge(probe(['| 备注 | 说明 |', '|---|---|', '| ' + BT + 'cb625c64521398306f914eb7986a4a505f95291b' + BT + ' | x |'].join(NL)), noKeys);
  t('PV-G-F15-REVERSE-GATE-UNRESOLVABLE', p15.length === 1 && p15[0].level === 'WARN' && p15[0].slug === 'PV-MISPLACED-UNRESOLVABLE', '不可解析 hex 负载恒 WARN slug=' + (p15[0] ? p15[0].slug : 'none') + '（禁判 FAIL——D-190④ 同族）');
  const p16a = judge(probe(doc(['| (run) (the) 说明 |'])), noKeys);
  const p16b = judge(probe(doc(['| the table 说明 |'])), noKeys);
  const p16c = judge(probe(doc(['| zqq |'])), noKeys);
  t('PV-G-F16-D5-WORDS-EXEMPT', p16a.length === 0 && p16b.length === 0 && p16c.length === 1 && p16c[0].slug === 'PV-BARE-SHORTCODE', '英文词豁免（括号内 run/the）＋首位三字词后随空格不判＋裸码独占格仍判（E-5 类不回归，slug=' + (p16c[0] ? p16c[0].slug : 'none') + '）');
  const p17 = judge(probe(doc(['| ' + BT + SHORT_OK + BT + ' | 说明'])), noKeys);
  t('PV-G-F17-D6-OPTIONAL-PIPE', p17.length === 1 && p17[0].fd.kind === 'short-sha', '行尾无管末格短 SHA 检出 kind=' + (p17[0] ? p17[0].fd.kind : 'none') + '（splitRow 首尾管可选——FN 修复自证）');
  const p18 = judge(probe([FENCE + 'md', '| wmu（x） | 说明 |', '|---|---|', FENCE].join(NL)), noKeys);
  t('PV-G-F18-D6-FENCE-EXCLUDED', p18.length === 0, '围栏内伪表违规行零 finding（fence 状态机排除）');
  const p19 = judge(probe(doc(['| ' + BT + SHA_OK + BT + ' (' + DQc + DQc + ') | 说明 |'])), noKeys);
  t('PV-G-F19-D7-EMPTY-SUBJECT', p19.length === 1 && p19[0].fd.kind === 'missing-subject', '空校验位拒收 kind=' + (p19[0] ? p19[0].fd.kind : 'none') + '（D-200 subject 非空白必填）');
  const p20 = scanDoc('__fixture__', doc(['| ' + BT + SHA_OK + BT + ' ("fix: 旧指针 c6fe0f8 已实名") | 说明 |']));
  t('PV-G-F20-SUBJECT-QUOTE-OPAQUE', p20.length === 1 && p20[0].kind === 'legal', 'subject 引文内 token 不扫描（不透明载荷——kind=' + (p20[0] ? p20[0].kind : 'none') + '；shaTokens/bareCodes 走剥引文可见面）');
  GIT_CWD = ROOT_CWD_BAK; GIT_ALT_OBJECTS = ALT_BAK; gcache.clear();
}

let res;
try {
  res = mainRun(FX);
  fixtureRun();
} finally {
  try { fs.rmSync(FX.fxDir, { recursive: true, force: true }); } catch (_) { }
}
console.log('PASS-COUNT ' + pass + ' FAIL-COUNT ' + fail);
console.log('GUARD-RESULT: 84-check ' + (fail === 0 ? 'PASS' : 'FAIL') + ' newFail=' + res.fails.length + ' baselineWarn=' + res.warns.length + ' twinBuckets=' + res.twins.length + (res.docscanSkipped ? ' docscan=SKIP(shallow)' : ''));
process.exit(fail === 0 ? 0 : 1);
