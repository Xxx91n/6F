// docs-authority-check.mjs — tracker #47 文档权威守卫与 docs-ci 单腿（R8 / ADR-0027）
// 断言面：
//   A 守卫自声明（guard-meta）与 *-check.mjs 命名
//   B 门面文书集合（结构派生，不硬编码五/六处计数）→ 逐文件指回 docs/authority.md
//   C 现行文本的 ADR-NNNN 全部可解析（含 docs/adr/ 现行件枚举正对照）
//   D D-NNN 引用 ⊆ 归档索引；D-NNN 集合只减不增（冻结账本 blob 钉＝棘轮上界）
//   E §D-NNN / §A-NNN 死锚拒绝（3 位退役码形态；1~2 位是 ADR-0018 节号，不在此列）
//   F 门面文书不得自称权威；专题「唯一权威」白名单读自 docs/authority.md §2（单源）
//   G docs-ci 单腿契约：ubuntu/node24、paths 覆盖、复用 check:docs、不建第二套校验
//   H engine-ci 矩阵/路径边界：仍为 [22,24]，不承载文档守卫
//   I contracts-run 以 *-check.mjs 命名自动纳入；smoke 链与 check:docs 链同源
//   J 本守卫与 docs-ci 无 BOM + LF
// 负对照（手动验红，必须 exit 1）：--inject-adr=ADR-9998 / --inject-dcode=D-999 / --inject-anchor=§D-004
// 纪律：只读断言（git ls-files / git hash-object 只读 + fs 读），零写仓内状态；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#47 文档权威守卫与 docs-ci 单腿（R8 / ADR-0027；tracker #47）';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const SELF = relative(REPO, fileURLToPath(import.meta.url)).split(sep).join('/');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 400) : '')); } }
function txt(p) { return readFileSync(join(REPO, p), 'utf8'); }
function noBom(buf) { return !(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF); }
function git(args) { return execFileSync('git', ['-C', REPO].concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }

// ---------- 普查面：tracked 文本，排除归档/产物/冻结夹具 ----------
const TRACKED = git(['ls-files']).split('\n').filter(Boolean);
const TEXT_RE = /\.(md|markdown|txt|ts|tsx|js|mjs|cjs|json|jsonl|ya?ml|yml|toml)$/i;
const EXCLUDED_DIRS = ['docs/archive/', 'engine/dist/', 'engine/test/fixtures/', 'engine/fixtures/', 'node_modules/'];
function excluded(p) {
  if (p === SELF) { return true; }                     // 守卫自身含负对照串，不参与内容普查
  if (EXCLUDED_DIRS.some(d => p.startsWith(d))) { return true; }
  if (/\.bundle$/i.test(p)) { return true; }           // 逐字节冻结件
  return false;
}
const CORPUS = [];
for (const p of TRACKED) {
  if (excluded(p) || !TEXT_RE.test(p)) { continue; }
  let s;
  try { s = readFileSync(join(REPO, p), 'utf8'); } catch { continue; }
  if (s.indexOf('\u0000') >= 0) { continue; }
  CORPUS.push({ path: p, text: s });
}

// ---------- 探测器（纯函数：负对照与主断言共用，避免「测的不是判的」） ----------
function dcodes(text) { return [...text.matchAll(/\bD-(\d{3})\b/g)].map(m => m[0]); }
function adrRefs(text) { return [...text.matchAll(/\bADR-(\d{4})\b/g)].map(m => m[0]); }
// 退役决策账本的 D/A 码是三位零填充（D-004）；ADR-0018 的节号 §D-1/§D-2 是 1~2 位，不属死锚形态
function deadAnchors(text) { return [...text.matchAll(/§[DA]-\d{3,}/g)].map(m => m[0]); }

// ---------- A. 守卫自声明 ----------
const selfText = txt(SELF);
t('A1 guard-meta TIER/PROTECTED_SURFACE 声明合法', /^const TIER = 'portable';$/m.test(selfText) && /^const PROTECTED_SURFACE = '[^'\n]+';$/m.test(selfText));
t('A2 文件名符合 *-check.mjs（contracts-run 自动纳入）', /-check\.mjs$/.test(SELF.split('/').pop()), SELF);

// ---------- B. 门面文书集合 → 指针 ----------
// 域＝除 docs/authority.md 与三载体正文之外、声明落点的文书；按结构派生，新增 docs/agents/*.md
// 或声明落点的根级文书自动入域；不硬编码「五处/六处」计数。
const CARRIER = [/^docs\/spec\.md$/, /^docs\/authority\.md$/, /^GLOSSARY\.md$/, /^docs\/adr\//];
const FACADE_FIXED = [
  'AGENTS.md', 'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md',
  'engine/README.md', '.github/PULL_REQUEST_TEMPLATE.md', 'docs/archive/decisions/README.md',
];
const LANDING_MARK = /唯一成文处|门面文书|决策与术语|只留指针|authority\.md/;
const facade = TRACKED.filter(p => {
  if (!/\.md$/i.test(p)) { return false; }
  if (CARRIER.some(r => r.test(p))) { return false; }
  if (FACADE_FIXED.includes(p)) { return true; }
  if (excluded(p)) { return false; }
  if (p.startsWith('docs/agents/')) { return LANDING_MARK.test(txt(p)); }
  return !p.includes('/') && LANDING_MARK.test(txt(p));
});
const missingFixed = FACADE_FIXED.filter(p => !facade.includes(p));
const facadeMissing = facade.filter(p => !/\]\([^)\s]*authority\.md\)/.test(txt(p)));
t('B1 固定门面文书全部入域（集合结构派生，非计数硬编码）', missingFixed.length === 0, 'missing=' + missingFixed.join(','));
t('B2 每份门面文书都指回 docs/authority.md', facadeMissing.length === 0, 'missing=' + facadeMissing.join(','));

// ---------- C. ADR-NNNN 可解析 ----------
const ADR_NUMBERS = new Set(TRACKED
  .filter(p => /^docs\/adr\/\d{4}-.+\.md$/.test(p))
  .map(p => p.match(/^docs\/adr\/(\d{4})-/)[1]));
// 合成夹具/解析器写出的哨兵号，不是决策落点：ADR-0000（空占位）、ADR-9999（越界探针）。
// 逐字节冻结夹具已在 excluded() 排除；此处只放行活跃测试代码里的这两个哨兵值。
const ADR_SENTINELS = new Set(['ADR-0000', 'ADR-9999']);
// 0002/0010/0015 按 ADR-0025 保持删除；ADR 正文（docs/adr/）作为史料指称它们不算死锚，
// 但门面/现行文书引用它们仍是不可解析的落点（下面的 isAdrRecord 分支只豁免载体本身）。
const ADR_DELETED = new Set(['0002', '0010', '0015']);
const badAdr = [];
for (const { path, text } of CORPUS) {
  for (const code of adrRefs(text)) {
    if (ADR_SENTINELS.has(code)) { continue; }
    const n = code.slice(4);
    if (ADR_NUMBERS.has(n)) { continue; }
    if (ADR_DELETED.has(n) && path.startsWith('docs/adr/')) { continue; }
    badAdr.push(path + ':' + code);
  }
}
t('C0 docs/adr 现行件可枚举（正对照 0001/0027 在册）', ADR_NUMBERS.has('0001') && ADR_NUMBERS.has('0027'));
t('C1 现行文本的 ADR-NNNN 全部可解析（哨兵 ADR-0000/9999 与 ADR 正文内的已删前身除外）', badAdr.length === 0, 'dangling=' + [...new Set(badAdr)].join(','));

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

const currentCodes = new Set();
for (const { text } of CORPUS) {
  for (const code of dcodes(text)) { currentCodes.add(code); }
}
const notIndexed = [...currentCodes].filter(c => !INDEX_CODES.has(c) && !FP_CODES.has(c)).sort();
const overRatchet = [...currentCodes].filter(c => !LEDGER_CODES.has(c) && !FP_CODES.has(c)).sort();
const ledgerBlob = git(['hash-object', LEDGER_PATH]).trim();
t('D1 现行 D-NNN 引用 ⊆ 归档索引（散文假阳性表例外）', notIndexed.length === 0, 'not-indexed=' + notIndexed.join(','));
t('D2 冻结账本 blob 钉未变（锚取自归档 README）', !!LEDGER_ANCHOR && ledgerBlob === LEDGER_ANCHOR, 'got=' + ledgerBlob + ' want=' + (LEDGER_ANCHOR || '<unparsed>'));
t('D3 现行 D-NNN 集合 ⊆ 冻结账本∪散文假阳性（只减不增）', overRatchet.length === 0, 'new=' + overRatchet.join(','));
t('D4 散文假阳性表解析非空且含 D-000（§4 单源自证）', FP_CODES.size >= 4 && FP_CODES.has('D-000'), 'fp=' + [...FP_CODES].join(','));

// ---------- E. §D-NNN / §A-NNN 死锚 ----------
const dead = [];
for (const { path, text } of CORPUS) {
  for (const anchor of deadAnchors(text)) { dead.push(path + ':' + anchor); }
}
t('E1 现行文本零 §D-NNN/§A-NNN 死锚（3 位退役码形态）', dead.length === 0, 'hits=' + dead.slice(0, 10).join(','));
t('E2 死锚探测器负对照：§D-004/§A-123 命中，ADR-0018 §D-1 不命中',
  deadAnchors('x §D-004 y §A-123 z').length === 2 && deadAnchors('ADR-0018 §D-1').length === 0);

// ---------- F. 门面文书不得自称权威（§2 白名单单源） ----------
function section2Whitelist(text) {
  const m = text.match(/^## 2\.[^\n]*\n([\s\S]*?)^## 3\./m);
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
const whitelist = section2Whitelist(txt('docs/authority.md'));
// 行内引用可能只写 basename（README 上游表写 engine/upstream-lock.yaml），故同时登记 basename。
const whitelistMatch = new Set();
for (const tok of whitelist) {
  whitelistMatch.add(tok);
  if (!tok.endsWith('/')) { const base = tok.split('/').pop(); if (base) { whitelistMatch.add(base); } }
}
const selfClaim = [];
for (const p of facade) {
  txt(p).split('\n').forEach((line, i) => {
    if (line.includes('唯一权威')) {
      const viaAuthority = line.includes('authority.md');
      const viaWhitelist = [...whitelistMatch].some(tok => line.includes(tok));
      if (!viaAuthority && !viaWhitelist) { selfClaim.push(p + ':' + (i + 1) + ' 唯一权威无 §2 落点'); }
    }
    if (line.includes('唯一成文处') && !line.includes('authority.md')) {
      selfClaim.push(p + ':' + (i + 1) + ' 自称唯一成文处');
    }
  });
}
const readmeAuthorityLine = txt('README.md').split('\n').find(l => l.includes('唯一权威')) || '';
t('F1 §2 从属口径白名单可从 authority.md 单源解析（upstream-lock.yaml 正对照）',
  [...whitelistMatch].includes('upstream-lock.yaml'), 'tokens=' + [...whitelist].join(','));
t('F2 门面文书不得自称权威；专题唯一权威须命中 §2 白名单', selfClaim.length === 0, selfClaim.join(' | '));
t('F3 README 上游表「唯一权威=upstream-lock」属合法命中（不得洗红）',
  readmeAuthorityLine.includes('upstream-lock.yaml') && [...whitelistMatch].some(tok => readmeAuthorityLine.includes(tok)));

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
const REQUIRED_PATHS = ['docs/**', 'README*', 'CONTRIBUTING.md', 'AGENTS.md', 'engine/test/contracts/docs-authority-check.mjs', '.github/workflows/docs-ci.yml'];
t('G1 docs-ci workflow 在位且无 BOM + LF', !!docsCiBuf && noBom(docsCiBuf) && docsCi.indexOf('\r') < 0);
for (const ev of ['push', 'pull_request']) {
  const ps = yamlPaths(docsCi, ev);
  const missing = REQUIRED_PATHS.filter(x => !ps.includes(x));
  t('G2.' + ev + ' paths 覆盖 docs/README/门面/守卫本身', missing.length === 0, 'missing=' + missing.join(',') + ' got=' + ps.join(','));
}
t('G3 docs-ci 单腿 ubuntu/node24（无 matrix/strategy）',
  /runs-on:\s*ubuntu-latest/.test(docsCi) && /node-version:\s*['"]?24['"]?/.test(docsCi) &&
  !/^\s*matrix:/m.test(docsCi) && !/^\s*strategy:/m.test(docsCi) && (docsCi.match(/runs-on:/g) || []).length === 1);
t('G4 docs-ci 复用 check:docs（不建第二套 README/戳位校验）',
  /run:\s*npm run check:docs/.test(docsCi) && !/npm test/.test(docsCi) &&
  !/gen-acknowledgments/.test(docsCi) && !/77-check/.test(docsCi) && !/73-check/.test(docsCi));
t('G5 docs-ci permissions contents: read', /permissions:[\s\S]*?contents:\s*read/.test(docsCi));
t('G6 docs-ci working-directory: engine', /working-directory:\s*engine/.test(docsCi));

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

// ---------- J. 编码纪律 ----------
t('J1 本守卫与 docs-ci 无 BOM + LF',
  noBom(readFileSync(fileURLToPath(import.meta.url))) && selfText.indexOf('\r') < 0 &&
  !!docsCiBuf && noBom(docsCiBuf) && docsCi.indexOf('\r') < 0);

// ---------- 注入验红（CLI 负对照） ----------
const args = process.argv.slice(2);
function argVal(flag) { const hit = args.find(a => a.startsWith(flag + '=')); return hit ? hit.slice(flag.length + 1) : null; }
const injAdr = argVal('--inject-adr');
if (injAdr) {
  const dangling = adrRefs(injAdr).filter(c => !ADR_SENTINELS.has(c) && !ADR_NUMBERS.has(c.slice(4)));
  t('INJECT-ADR ' + injAdr + ' 悬空（注入必须验红）', dangling.length === 0, 'dangling=' + dangling.join(','));
}
const injDcode = argVal('--inject-dcode');
if (injDcode) {
  const extra = dcodes(injDcode).filter(c => !INDEX_CODES.has(c) && !LEDGER_CODES.has(c) && !FP_CODES.has(c));
  t('INJECT-DCODE ' + injDcode + ' 未入索引/账本（注入必须验红）', extra.length === 0, 'not-indexed=' + extra.join(','));
}
const injAnchor = argVal('--inject-anchor');
if (injAnchor) {
  const hits = deadAnchors(injAnchor);
  t('INJECT-ANCHOR ' + injAnchor + ' 死锚（注入必须验红）', hits.length === 0, 'hits=' + hits.join(','));
}

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail) + ' docs-authority checks');
process.exit(fail === 0 ? 0 : 1);
