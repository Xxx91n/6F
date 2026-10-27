// docs-authority-check.mjs — tracker #47 文档权威守卫与 docs-ci 单腿（ADR-0027）
// 断言面：
//   A 守卫自声明（guard-meta）、*-check.mjs 命名、普查面非空（防空集假绿）
//   B 门面文书集合（按「声明落点」内容派生，不硬编码五/六处计数）→ 逐文件 markdown 链接指回 docs/authority.md 本体
//   C 现行文本的 ADR-NNNN 全部可解析；docs/adr/ 相对链接可解析（含生成索引）
//   D D-NNN 引用 ⊆ 归档索引；D-NNN 集合只减不增（冻结账本 blob 钉＋散文假阳性五项钉）
//   E §D-NNN / §A-NNN 死锚拒绝（2+ 位退役码形态；1 位是 ADR-0018 节号，不在此列）
//   F 门面文书不得自称权威；专题「唯一权威」白名单读自 docs/authority.md §2（单源）
//   G docs-ci 单腿契约：ubuntu/node24、paths 覆盖、复用 check:docs、不建第二套校验
//   H engine-ci 矩阵/路径边界：仍为 [22,24]，不承载文档守卫
//   I contracts-run 以 *-check.mjs 命名自动纳入；smoke 链与 check:docs 链同源
//   J 本守卫无 BOM + LF
// 负对照（注入普查面后必须 exit 1）：--inject-adr=ADR-9998 / --inject-dcode=D-999 / --inject-anchor=§D-004
// 纪律：只读断言（git ls-files / git hash-object 只读 + fs 读），零写仓内状态；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep, posix } from 'node:path';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = 'tracker #47 文档权威守卫与 docs-ci 单腿（ADR-0027）';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const SELF = relative(REPO, fileURLToPath(import.meta.url)).split(sep).join('/');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 400) : '')); } }
function txt(p) { return readFileSync(join(REPO, p), 'utf8'); }
function safeTxt(p) { try { return txt(p); } catch { return null; } }
function noBom(buf) { return !(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF); }
function git(args) { return execFileSync('git', ['-C', REPO].concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }

// ---------- 普查面：tracked 文本，排除归档/产物/冻结夹具 ----------
const TRACKED = git(['ls-files', '-z']).split('\0').filter(Boolean);
const TEXT_RE = /\.(md|markdown|txt|ts|tsx|js|mjs|cjs|json|jsonl|ya?ml|yml|toml)$/i;
const EXCLUDED_DIRS = ['docs/archive/', 'engine/dist/', 'engine/test/fixtures/', 'engine/fixtures/golden/', 'node_modules/'];
function excluded(p) {
  if (EXCLUDED_DIRS.some(d => p.startsWith(d))) { return true; }
  if (/\.bundle$/i.test(p)) { return true; }           // 逐字节冻结件
  return false;
}
// 守卫自身也入普查；只剥掉 CLI 负对照行（其中含人为注入的非法字面量）与标记为
// NEGATIVE-CONTROL 的探测器自证行，其余策略文本照常受同一套探测（避免「整份守卫排除」留下真实死锚盲区）。
function corpusText(p, s) {
  if (p !== SELF) { return s; }
  return s.split('\n').filter(l => !l.includes('--inject-') && !l.includes('NEGATIVE-CONTROL')).join('\n');
}
const unreadable = [];
const CORPUS = [];
for (const p of TRACKED) {
  if (excluded(p) || !TEXT_RE.test(p)) { continue; }
  let s;
  try { s = readFileSync(join(REPO, p), 'utf8'); } catch { unreadable.push(p); continue; }
  if (s.indexOf('\u0000') >= 0) { continue; }
  CORPUS.push({ path: p, text: corpusText(p, s) });
}

// ---------- 负对照：把 CLI 注入值并入普查面，让主断言本身变红（不另造探测器分支） ----------
const args = process.argv.slice(2);
function argVal(flag) { const hit = args.find(a => a.startsWith(flag + '=')); return hit ? hit.slice(flag.length + 1) : null; }
for (const [flag, label] of [['--inject-adr', 'ADR'], ['--inject-dcode', 'DCODE'], ['--inject-anchor', 'ANCHOR']]) {
  const v = argVal(flag);
  if (v) { CORPUS.push({ path: '<inject:' + label + '>', text: v }); }
}

// ---------- 探测器（纯函数：负对照与主断言共用，避免「测的不是判的」） ----------
function dcodes(text) { return [...text.matchAll(/\bD-(\d{3})\b/g)].map(m => m[0]); }
function adrRefs(text) { return [...text.matchAll(/\bADR-(\d{4})\b/g)].map(m => m[0]); }
// 退役决策账本的 D/A 码是三位零填充（D-004）；ADR-0018 的节号 §D-1/§D-2 是 1 位，不属死锚形态。
// 判据取 2+ 位：既覆盖三位退役码，也拦住非零填充的短码变体；1 位节号放行。
function deadAnchors(text) { return [...text.matchAll(/§[DA]-\d{2,}/g)].map(m => m[0]); }

// ---------- A. 守卫自声明与普查面 ----------
const selfText = txt(SELF);
t('A1 guard-meta TIER/PROTECTED_SURFACE 声明合法', /^const TIER = 'portable';$/m.test(selfText) && /^const PROTECTED_SURFACE = '[^'\n]+';$/m.test(selfText));
t('A2 文件名符合 *-check.mjs（contracts-run 自动纳入）', /-check\.mjs$/.test(SELF.split('/').pop()), SELF);
const CORPUS_PATHS = new Set(CORPUS.map(f => f.path));
t('A3 普查面非空且含权威载体/门面/源码三锚（防空集假绿）',
  ['docs/authority.md', 'README.md', 'engine/src/audit/macro-c.ts'].every(p => CORPUS_PATHS.has(p)));
t('A4 所有 tracked 文本文件可读（缺失即红，不静默跳过）', unreadable.length === 0, unreadable.join(','));

// ---------- B. 门面文书集合 → 指针 ----------
// 域＝除 docs/authority.md 与三载体正文之外、声明落点的文书；按内容标记派生，
// 新增 docs/ 或 engine/ 下的门面文书自动入域；不硬编码「五处/六处」计数。
const CARRIER = [/^docs\/spec\.md$/, /^docs\/authority\.md$/, /^GLOSSARY\.md$/, /^docs\/adr\//];
const FACADE_FIXED = [
  'AGENTS.md', 'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md',
  'engine/README.md', '.github/PULL_REQUEST_TEMPLATE.md', 'docs/archive/decisions/README.md',
];
const LANDING_MARK = /唯一成文处|门面文书|决策与术语|只留指针|authority\.md|authority surface|where a decision or a term belongs|指回/;
const facade = TRACKED.filter(p => {
  if (!/\.md$/i.test(p)) { return false; }
  if (CARRIER.some(r => r.test(p))) { return false; }
  if (FACADE_FIXED.includes(p)) { return true; }
  if (excluded(p)) { return false; }
  const s = safeTxt(p);
  return s !== null && LANDING_MARK.test(s);
});
const missingFixed = FACADE_FIXED.filter(p => !facade.includes(p) || !LANDING_MARK.test(safeTxt(p) || ''));
// 指针必须解析到 docs/authority.md 本体；`[x](../nope/authority.md)` 这类伪指针不算。
function authorityPointer(p, text) {
  const dir = posix.dirname(p);
  for (const m of text.matchAll(/\]\(([^)\s]*authority\.md)(?:#[^)]*)?\)/g)) {
    const raw = m[1];
    if (/^[a-z]+:/i.test(raw)) { continue; }
    if (posix.normalize(posix.join(dir, raw)) === 'docs/authority.md') { return true; }
  }
  return false;
}
const facadeMissing = facade.filter(p => !authorityPointer(p, safeTxt(p) || ''));
t('B1 固定门面文书全部入域且带落点声明（域按内容派生，非计数硬编码）', missingFixed.length === 0, 'missing=' + missingFixed.join(','));
t('B2 每份门面文书都以 markdown 链接指回 docs/authority.md 本体', facadeMissing.length === 0, 'missing=' + facadeMissing.join(','));

// ---------- C. ADR-NNNN 与 docs/adr 链接可解析 ----------
const ADR_NUMBERS = new Set(TRACKED
  .filter(p => /^docs\/adr\/\d{4}-.+\.md$/.test(p))
  .map(p => p.match(/^docs\/adr\/(\d{4})-/)[1]));
const authorityText = txt('docs/authority.md');
// 0002/0010/0015 按 ADR-0025 保持删除；从 authority.md §4 的成文行解析，不复制第二套编号。
const deletedLine = authorityText.split('\n').find(l => l.includes('保持删除') && /\b0002\b/.test(l)) || '';
const ADR_DELETED = new Set(deletedLine.match(/\b\d{4}\b/g) || []);
// 合成夹具/解析器写出的哨兵号，不是决策落点：ADR-0000（空占位）、ADR-9999（越界探针）。
// 只允许出现在 engine 代码/测试（逐字节冻结夹具已在 excluded() 排除）；docs/门面引用它们仍是死锚。
const ADR_SENTINELS = new Set(['ADR-0000', 'ADR-9999']);
// 只允许 engine 代码/测试；engine/README.md 是门面，引用哨兵仍按死锚判红。
const ADR_SENTINEL_PATH = /^engine\/(?:src|scripts|test)\//;
// engine/fixtures/definitions/*.json 是手写合成夹具（不是冻结件），其 ADR 头是 fixture 数据，
// 不是落点；D-code 与死锚仍照常扫描。
const ADR_SYNTHETIC_PATH = /^engine\/fixtures\/definitions\//;
const badAdr = [];
let adrRefCount = 0;
for (const { path, text } of CORPUS) {
  for (const code of adrRefs(text)) {
    adrRefCount++;
    if (ADR_SYNTHETIC_PATH.test(path)) { continue; }
    if (ADR_SENTINELS.has(code) && ADR_SENTINEL_PATH.test(path)) { continue; }
    const n = code.slice(4);
    if (ADR_NUMBERS.has(n)) { continue; }
    // 但门面/现行文书引用它们仍是不可解析的落点（下面的 path.startsWith('docs/adr/') 只豁免载体本身）。
    if (ADR_DELETED.has(n) && path.startsWith('docs/adr/')) { continue; }
    badAdr.push(path + ':' + code);
  }
}
const adrLinks = [];
let adrLinkCount = 0;
for (const { path, text } of CORPUS) {
  const dir = posix.dirname(path);
  for (const m of text.matchAll(/\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) {
    const raw = m[1];
    if (/^[a-z]+:/i.test(raw)) { continue; }
    const resolved = posix.normalize(posix.join(dir, raw));
    const isAdrLink = /(^|\/)adr\//.test(resolved) || (dir === 'docs/adr' && /^\d{4}-/.test(raw));
    if (!isAdrLink) { continue; }
    adrLinkCount++;
    if (!existsSync(join(REPO, resolved))) { adrLinks.push(path + ' -> ' + raw + ' (' + resolved + ')'); }
  }
}
t('C0 docs/adr 现行件可枚举＋已删三件从 authority.md §4 解析（size=3）',
  ADR_NUMBERS.has('0001') && ADR_NUMBERS.has('0027') && ADR_DELETED.size === 3 && deletedLine.length > 0);
t('C1 现行文本的 ADR-NNNN 全部可解析（哨兵与 ADR 正文内的已删前身除外）',
  adrRefCount > 0 && badAdr.length === 0, 'refs=' + adrRefCount + ' dangling=' + [...new Set(badAdr)].join(','));
t('C1b 哨兵豁免只覆盖 engine 代码/测试（engine/README.md 不在内）',
  ADR_SENTINEL_PATH.test('engine/src/audit/macro-b.ts') && !ADR_SENTINEL_PATH.test('engine/README.md'));
t('C2 现行 Markdown 的 docs/adr 链接可解析（含生成索引相对链接）', adrLinkCount > 0 && adrLinks.length === 0, 'links=' + adrLinkCount + ' dangling=' + adrLinks.join(','));

// ---------- D. D-code ⊆ 归档索引 + 只减不增 ----------
const INDEX_PATH = 'docs/archive/decisions/ticket-index.md';
const LEDGER_PATH = 'docs/archive/decisions/macro-audit-ledger.md';
// 归档 README 公布 macro-audit-ledger 的 git hash-object 值＝账本零改写的可证锚；
// 从该文书解析，不在守卫里复制第二份字面量（同一事实只写一处）。
const ARCHIVE_README = 'docs/archive/decisions/README.md';
const archiveReadme = txt(ARCHIVE_README);
const anchorMatch = archiveReadme.match(/git hash-object docs\/archive\/decisions\/macro-audit-ledger\.md\s+#\s+([0-9a-f]{40})/);
const LEDGER_ANCHOR = anchorMatch ? anchorMatch[1] : '';
const indexText = txt(INDEX_PATH);
const ledgerText = txt(LEDGER_PATH);
const INDEX_CODES = new Set(dcodes(indexText));
const LEDGER_CODES = new Set(dcodes(ledgerText));

// ticket-index §4 是「散文假阳性」单源（D-000 等不是决策号，不建索引行）。
function parseFalsePositives(text) {
  const m = text.match(/^## 4\.[^\n]*\n([\s\S]*?)^## 5\./m);
  if (!m) { return new Set(); }
  const out = new Set();
  for (const line of m[1].split('\n')) {
    const hit = line.match(/^\|\s*`(D-\d{3})`\s*\|/);
    if (hit) { out.add(hit[1]); }
  }
  return out;
}
const FP_CODES = parseFalsePositives(indexText);
// §4 的散文假阳性是固定五项（归档 README 同文）；表可读，但集合必须与归档 README 的五项逐一相等，
// 防止「往 §4 加一行」把任意新 D-code 洗成假阳性（棘轮旁路）。
const fpLine = archiveReadme.split('\n').find(l => l.includes('5 个形似') && l.includes('D-000')) || '';
const FP_KNOWN = [...new Set(fpLine.match(/D-\d{3}/g) || [])];

const currentCodes = new Set();
for (const { text } of CORPUS) {
  for (const code of dcodes(text)) { currentCodes.add(code); }
}
const notIndexed = [...currentCodes].filter(c => !INDEX_CODES.has(c) && !FP_CODES.has(c)).sort();
const overRatchet = [...currentCodes].filter(c => !LEDGER_CODES.has(c) && !FP_CODES.has(c)).sort();
const ledgerBlob = git(['hash-object', LEDGER_PATH]).trim();
t('D0 现行 D-code 集合非空（棘轮不空转）', currentCodes.size > 0);
t('D1 现行 D-NNN 引用 ⊆ 归档索引（散文假阳性表例外）', notIndexed.length === 0, 'not-indexed=' + notIndexed.join(','));
t('D2 冻结账本 blob 钉未变（锚取自归档 README）', !!LEDGER_ANCHOR && ledgerBlob === LEDGER_ANCHOR, 'got=' + ledgerBlob + ' want=' + (LEDGER_ANCHOR || '<unparsed>'));
t('D3 现行 D-NNN 集合 ⊆ 冻结账本∪散文假阳性（只减不增）', overRatchet.length === 0, 'new=' + overRatchet.join(','));
t('D4 §4 散文假阳性表与归档 README 五项逐一相等（不可扩）',
  FP_KNOWN.length === 5 && FP_CODES.size === FP_KNOWN.length && FP_KNOWN.every(c => FP_CODES.has(c)),
  'known=' + FP_KNOWN.join(',') + ' fp=' + [...FP_CODES].join(','));

// ---------- E. §D-NNN / §A-NNN 死锚 ----------
const dead = [];
for (const { path, text } of CORPUS) {
  for (const anchor of deadAnchors(text)) { dead.push(path + ':' + anchor); }
}
t('E1 现行文本零 §D-NNN/§A-NNN 死锚（2+ 位退役码形态）', dead.length === 0, 'hits=' + dead.slice(0, 10).join(','));
t('E2 死锚探测器负对照：§D-004/§A-123/§D-99 命中，ADR-0018 §D-1 不命中', // NEGATIVE-CONTROL
  deadAnchors('x §D-004 y §A-123 z §D-99').length === 3 && deadAnchors('ADR-0018 §D-1').length === 0); // NEGATIVE-CONTROL

// ---------- F. 门面文书不得自称权威（§2 白名单单源） ----------
function section2Whitelist(text) {
  // 只取 §2 表：到下一个二级/三级标题（即 §2.1）即止，不把生成面的再生命令当从属口径。
  const m = text.match(/^## 2\.[^\n]*\n([\s\S]*?)^(?:##|###)\s/m);
  if (!m) { return new Set(); }
  const out = new Set();
  for (const line of m[1].split('\n')) {
    if (!line.startsWith('|')) { continue; }
    const first = line.split('|')[1] || '';
    if (!first.includes('`') && !first.includes('](')) { continue; }
    for (const tick of first.matchAll(/`([^`]+)`/g)) { out.add(tick[1]); }
  }
  return out;
}
const whitelist = section2Whitelist(authorityText);
// 行内引用可能只写 basename（README 上游表写 engine/upstream-lock.yaml），故同时登记 basename；
// 但只对文件形 token 做 basename，且拒绝通配/空白 token（`**` 若入集会让任意粗体行通过）。
const whitelistMatch = new Set();
for (const tok of whitelist) {
  whitelistMatch.add(tok);
  const looksLikeFile = !tok.endsWith('/') && !tok.includes('*') && !/\s/.test(tok) && tok.includes('.');
  if (looksLikeFile) { const base = tok.split('/').pop(); if (base && base !== '**' && !base.includes('*')) { whitelistMatch.add(base); } }
}
const lineMatchesWhitelist = (line) => [...whitelistMatch].some(tok => line.includes(tok));
// 取「唯一权威 = <值>」里的完整断言值；不能只看同句是否出现 authority.md 或白名单子串。
function assertedAuthority(line) {
  const m = line.match(/唯一权威\s*[=＝]\s*(?:\[[^\]]+\]\(([^)\s]+)\)|`([^`]+)`|([^\s；;，,。)）]+))/);
  return m ? (m[1] || m[2] || m[3] || null) : null;
}
function selfClaimHit(line) {
  // 只认「主语 + 系词 + 权威」的自称；「本文件首行指针所列的权威载体」是引用，不是自称。
  const claim = /(本文件|本文|本册|本目录|this (?:file|document))\s*(?:本身)?\s*(?:是|为|作为|即|is)\s*(?:唯一|the)?\s*(?:权威|authority)/i;
  const negative = /非权威|not (?:the )?authority|并非权威|不是权威/i;
  return claim.test(line) && !negative.test(line);
}
const selfClaim = [];
for (const p of facade) {
  const s = safeTxt(p);
  if (s === null) { continue; }
  s.split('\n').forEach((line, i) => {
    const viaAuthority = authorityPointer(p, line);
    const asserted = assertedAuthority(line);
    const viaWhitelist = asserted !== null && whitelistMatch.has(asserted);
    if (line.includes('唯一权威') && !viaWhitelist) { selfClaim.push(p + ':' + (i + 1) + ' 唯一权威无 §2 落点'); }
    if (line.includes('唯一成文处') && !viaAuthority) { selfClaim.push(p + ':' + (i + 1) + ' 自称唯一成文处'); }
    if (selfClaimHit(line) && !viaAuthority) { selfClaim.push(p + ':' + (i + 1) + ' 自称权威'); }
  });
}
const readmeAuthorityLine = (safeTxt('README.md') || '').split('\n').find(l => l.includes('唯一权威')) || '';
t('F1 §2 从属口径白名单可从 authority.md 单源解析（upstream-lock.yaml 正对照）',
  [...whitelistMatch].includes('upstream-lock.yaml'), 'tokens=' + [...whitelist].join(','));
t('F1b §2 白名单只取 §2 表（不含 §2.1 生成面）',
  !whitelist.has('engine/dist/**') && !whitelist.has('.mcp.json') && !whitelist.has('engine/plugin.json'));
t('F1c 白名单不含通配 token（** 不得让任意粗体行通过）',
  [...whitelistMatch].every(tok => !tok.includes('*')));
t('F1d 粗体不构成白名单命中（** 不再放行任意行）',
  !whitelistMatch.has(assertedAuthority('**唯一权威** = somewhere-else') || '') &&
  whitelistMatch.has(assertedAuthority('唯一权威 = engine/upstream-lock.yaml') || ''));
t('F1e 伪权威值不因同句 authority.md 链接而通过',
  !whitelistMatch.has(assertedAuthority('唯一权威 = other/engine/upstream-lock.yaml；参见 [authority.md](docs/authority.md)') || ''));
t('F2 门面文书不得自称权威；专题唯一权威须命中 §2 白名单', selfClaim.length === 0, selfClaim.join(' | '));
t('F3 README 上游表「唯一权威=upstream-lock」属合法命中（不得洗红）',
  whitelistMatch.has(assertedAuthority(readmeAuthorityLine) || ''));
t('F4 自称权威探测器负对照：本文件是权威口径命中，本目录是非权威不命中', // NEGATIVE-CONTROL
  selfClaimHit('本文件是权威口径') && !selfClaimHit('本目录是非权威、只读')); // NEGATIVE-CONTROL

// ---------- G. docs-ci 单腿契约 ----------
const DOCS_CI = '.github/workflows/docs-ci.yml';
const docsCiBuf = existsSync(join(REPO, DOCS_CI)) ? readFileSync(join(REPO, DOCS_CI)) : null;
const docsCi = docsCiBuf ? docsCiBuf.toString('utf8') : '';
// on.<event>.paths 的行式解析（本仓 workflow 缩进受控：event 2 空格、paths 4 空格、item 6+ 空格）
function yamlPaths(wf, event) {
  const lines = wf.split('\n');
  const start = lines.findIndex(l => new RegExp('^  ' + event + ':\\s*$').test(l));
  if (start < 0) { return []; }
  const out = [];
  let inPaths = false;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^[a-zA-Z_]/.test(l)) { break; }
    if (/^  [a-zA-Z_]/.test(l)) { break; }
    if (/^    [a-zA-Z_]/.test(l)) { inPaths = /^    paths:\s*$/.test(l); continue; }
    if (!inPaths) { continue; }
    const m = l.match(/^\s+-\s+"?([^"#]+?)"?\s*(?:#.*)?$/);
    if (m) { out.push(m[1].trim()); }
  }
  return out;
}
const REQUIRED_PATHS = [
  'docs/**', '*.md', 'README*', 'CONTRIBUTING.md', 'AGENTS.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md',
  'GLOSSARY.md', 'engine/README.md', 'engine/package.json',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'engine/test/contracts/docs-authority-check.mjs', '.github/workflows/docs-ci.yml',
  '.github/**', '.claude-plugin/**', 'examples/**',
];
t('G1 docs-ci workflow 在位且无 BOM + LF', !!docsCiBuf && noBom(docsCiBuf) && docsCi.indexOf('\r') < 0);
for (const ev of ['push', 'pull_request']) {
  const ps = yamlPaths(docsCi, ev);
  const missing = REQUIRED_PATHS.filter(x => !ps.includes(x));
  t('G2.' + ev + ' paths 覆盖 docs/README/门面/守卫本身', missing.length === 0, 'missing=' + missing.join(',') + ' got=' + ps.join(','));
}
t('G3 docs-ci 单腿 ubuntu/node24（无 matrix/strategy）',
  /runs-on:\s*ubuntu-latest/.test(docsCi) && /node-version:\s*['"]?24['"]?/.test(docsCi) &&
  !/^\s*matrix:/m.test(docsCi) && !/^\s*strategy:/m.test(docsCi) && (docsCi.match(/runs-on:/g) || []).length === 1);
const runSteps = [...docsCi.matchAll(/^[ \t]*run:[ \t]*(.+)$/gm)].map(m => m[1].trim());
t('G4 docs-ci 复用 check:docs（单一步骤，不建第二套 README/戳位校验）',
  runSteps.length === 1 && runSteps[0] === 'npm run check:docs', 'runs=' + runSteps.join(' | '));
t('G5 docs-ci permissions contents: read', /permissions:[\s\S]*?contents:\s*read/.test(docsCi));
t('G6 docs-ci working-directory: engine', /working-directory:\s*engine/.test(docsCi));
// checkout 步骤是否仍持久化凭据：只看 actions/checkout 步骤内的键，跳过注释行；
// 注释掉的 persist-credentials: false 仍按默认（持久化）判。
function checkoutPersistsCredentials(wf) {
  const lines = wf.split('\n');
  const start = lines.findIndex(l => /^\s*-\s+uses:\s*actions\/checkout@/.test(l));
  if (start < 0) { return true; }
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*-\s+/.test(l)) { break; }
    if (/^\s*#/.test(l)) { continue; }
    if (/^\s*persist-credentials:\s*['"]?false['"]?\s*(?:#.*)?$/.test(l)) { return false; }
    if (/^\s*persist-credentials:\s*/.test(l)) { return true; }
  }
  return true;
}
t('G7 docs-ci checkout 不持久化凭据（persist-credentials: false）', !checkoutPersistsCredentials(docsCi));
const goodCheckout = '- uses: actions/checkout@v4\n  with:\n    persist-credentials: false\n';
const badCheckout = '- uses: actions/checkout@v4\n  with:\n    # persist-credentials: false\n';
t('G7b checkout 凭据判据负对照：真设置不持久，注释掉仍算持久',
  !checkoutPersistsCredentials(goodCheckout) && checkoutPersistsCredentials(badCheckout));

// ---------- H. engine-ci 矩阵/路径边界 ----------
const engineCi = txt('.github/workflows/engine-ci.yml');
const engineCiPushPaths = yamlPaths(engineCi, 'push');
const engineCiPrPaths = yamlPaths(engineCi, 'pull_request');
t('H1 engine-ci 矩阵仍为 [22,24]', /node:\s*\[22,\s*24\]/.test(engineCi));
t('H2 engine-ci 路径/步骤不承载文档守卫（无 docs/** 触发、无 docs-ci 引用）',
  !engineCiPushPaths.includes('docs/**') && !engineCiPrPaths.includes('docs/**') &&
  !engineCi.includes('docs-authority-check') && !engineCi.includes('docs-ci.yml'));
t('H3 engine-ci 仍跑 smoke（contracts-run 自动纳入新守卫）', /run:\s*npm run smoke/.test(engineCi));

// ---------- I. contracts-run 自动纳入 ----------
const runner = txt('engine/test/contracts-run.mjs');
const pkg = JSON.parse(txt('engine/package.json'));
t('I1 contracts-run 以 *-check.mjs 命名枚举（本守卫自动纳入）',
  runner.includes('/-check.mjs$/') && /-check\.mjs$/.test(SELF.split('/').pop()));
t('I2 smoke 链含 contracts-run（engine-ci 六腿自动继承）', String(pkg.scripts.smoke || '').includes('test/contracts-run.mjs'));
t('I3 check:docs 链含本守卫（docs-ci 单命令复用）', String(pkg.scripts['check:docs'] || '').includes('test/contracts/docs-authority-check.mjs'));
const checkDocs = String(pkg.scripts['check:docs'] || '');
t('I4 check:docs 单源含 ack/73/77/docs-authority 四段',
  ['gen-acknowledgments.mjs --check', '73-check.mjs', '77-check.mjs', 'docs-authority-check.mjs'].every(s => checkDocs.includes(s)));

// ---------- J. 编码纪律 ----------
t('J1 本守卫无 BOM + LF', noBom(readFileSync(fileURLToPath(import.meta.url))) && selfText.indexOf('\r') < 0);

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail) + ' docs-authority checks');
process.exit(fail === 0 ? 0 : 1);
