// docs-authority-check.mjs — tracker #47 文档权威检查与 docs-ci 只跑一条
// 查什么：
//   A 本检查自报身份（guard-meta）、*-check.mjs 命名、扫描范围非空（防扫不到东西就假装通过）
//   B 门面文书集合（按「声明位置」内容派生，不硬编码五/六处计数）→ 逐文件 markdown 链接指回 docs/authority.md 本体
//   C 在仓 ADR 从 §3 的块推出来（可以不止一份，不由脚本写死）；C0 核在仓集合里有没有块里的起点号、历史号有没有复活、同号有没有两份；C0b 核起点号确实还是 0028；旧号只准出现在 §3 声明的历史引用面（哨兵与固定机器名除外）；docs/adr/ 链接可解析
//   D D-NNN 引用 ⊆ 归档索引；D-NNN 集合只减不增（冻结记录的 blob 值锁死＋散文假阳性五项锁死）
//   E §D-NNN / §A-NNN 死锚拒绝（2+ 位退役码形态；1 位是节号，不在此列）
//   F 门面文书不得自称权威；专题「唯一权威」白名单只从 docs/authority.md §2 读一处
//   G docs-ci 只跑一条的规矩：ubuntu/node24、paths 覆盖、复用 check:docs、#97 的 drift 检查（gen 后 diff 即红）、不建第二套校验
//   H engine-ci 矩阵/路径边界：仍为 [22,24]，不承载文档检查
//   I contracts-run 以 *-check.mjs 命名自动纳入；smoke 链与 check:docs 链同源
//   K 版本记录引用形制：[Unreleased] 节零裸 GitHub 引用（tracker #N 口径，tracker #106；旧票 #N 与反引号字面量豁免）
//   J 本检查无 BOM + LF
// 负对照（注入普查面后必须 exit 1）：--inject-adr=ADR-9998 / --inject-dcode=D-999 / --inject-anchor=§D-004
// 纪律：只读不写（git ls-files / git hash-object 只读 + fs 读），零写仓内状态；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep, posix } from 'node:path';

// guard-meta（D-159②/D-160③ 自己声明——没写就是红）
const TIER = 'portable';
const PROTECTED_SURFACE = 'tracker #47 文档权威守卫与 docs-ci 单腿';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const SELF = relative(REPO, fileURLToPath(import.meta.url)).split(sep).join('/');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 400) : '')); } }
function txt(p) { return readFileSync(join(REPO, p), 'utf8'); }
function safeTxt(p) { try { return txt(p); } catch { return null; } }
function noBom(buf) { return !(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF); }
function git(args) { return execFileSync('git', ['-C', REPO].concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }

// ---------- 扫描范围：tracked 文本，排除归档/产物/冻结夹具 ----------
const TRACKED = git(['ls-files', '-z']).split('\0').filter(Boolean);
const TEXT_RE = /\.(md|markdown|txt|ts|tsx|js|mjs|cjs|json|jsonl|ya?ml|yml|toml)$/i;
const EXCLUDED_DIRS = ['docs/archive/', 'engine/dist/', 'engine/test/fixtures/', 'engine/fixtures/golden/', 'node_modules/'];
function excluded(p) {
  if (EXCLUDED_DIRS.some(d => p.startsWith(d))) { return true; }
  if (/\.bundle$/i.test(p)) { return true; }           // 逐字节冻住的存档
  return false;
}
// 本检查自身也入扫描；只剥掉 CLI 负对照行（其中含人为注入的非法字面量）与标记为
// NEGATIVE-CONTROL 的试探行，其余策略文本照常受同一套探测（避免「整份检查排除」留下真实死锚盲区）。
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

// ---------- 负对照：把 CLI 注入值并进扫描范围，让主检查本身变红（不另造探测分支） ----------
const args = process.argv.slice(2);
function argVal(flag) { const hit = args.find(a => a.startsWith(flag + '=')); return hit ? hit.slice(flag.length + 1) : null; }
for (const [flag, label] of [['--inject-adr', 'ADR'], ['--inject-dcode', 'DCODE'], ['--inject-anchor', 'ANCHOR']]) {
  const v = argVal(flag);
  if (v) { CORPUS.push({ path: '<inject:' + label + '>', text: v }); }
}

// ---------- 探测器（纯函数：负对照与主检查共用同一个，避免「测的不是判的」） ----------
function dcodes(text) { return [...text.matchAll(/\bD-(\d{3})\b/g)].map(m => m[0]); }
// 退役决策记录的 D/A 码是三位零填充（D-004）；旧 ADR 正文里的 1 位节号 §D-1/§D-2 不属死锚形态。
// 判据取 2+ 位：既覆盖三位退役码，也拦住非零填充的短码变体；1 位节号放行。
function deadAnchors(text) { return [...text.matchAll(/§[DA]-\d{2,}/g)].map(m => m[0]); }

// ---------- A. 本检查自报身份与扫描范围 ----------
const selfText = txt(SELF);
t('A1 guard-meta TIER/PROTECTED_SURFACE 声明合法', /^const TIER = 'portable';$/m.test(selfText) && /^const PROTECTED_SURFACE = '[^'\n]+';$/m.test(selfText));
t('A2 文件名符合 *-check.mjs（contracts-run 自动纳入）', /-check\.mjs$/.test(SELF.split('/').pop()), SELF);
const CORPUS_PATHS = new Set(CORPUS.map(f => f.path));
t('A3 扫描范围非空且含权威载体/门面/源码三锚（防扫不到东西就假装通过）',
  ['docs/authority.md', 'README.md', 'engine/src/audit/macro-c.ts'].every(p => CORPUS_PATHS.has(p)));
t('A4 所有 tracked 文本文件可读（缺失即红，不悄悄跳过）', unreadable.length === 0, unreadable.join(','));

// ---------- B. 门面文书集合 → 指针 ----------
// 域＝除 docs/authority.md 与三载体正文之外、声明位置的文书；按内容标记派生，
// 新增 docs/ 或 engine/ 下的门面文书自动入域；不硬编码「五处/六处」计数。
const CARRIER = [/^docs\/spec\.md$/, /^docs\/authority\.md$/, /^GLOSSARY\.md$/, /^docs\/adr\//];
const FACADE_FIXED = [
  'AGENTS.md', 'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md',
  'engine/README.md', '.github/PULL_REQUEST_TEMPLATE.md', 'docs/archive/decisions/README.md',
];
// 门面标记只认「决策与术语位置」语义或指向 authority.md 的 markdown 链接；
// `指回` 与裸 `docs/authority.md` 在 workflow/registry/CHANGELOG 正文里也常见（#91），
// 单靠它们会把 §2 从属专题文书误收进门面域。
const LANDING_MARK = /唯一成文处|门面文书|决策与术语|只留指针|authority surface|where a decision or a term belongs|\]\((?![a-zA-Z]+:)[^)\s]*authority\.md(?:#[^)\s]*)?\)/;
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
t('B1 固定门面文书全部入域且带位置声明（域按内容派生，非计数硬编码）', missingFixed.length === 0, 'missing=' + missingFixed.join(','));
t('B2 每份门面文书都以 markdown 链接指回 docs/authority.md 本体', facadeMissing.length === 0, 'missing=' + facadeMissing.join(','));
t('B1b §2 从属专题文书（engine/CHANGELOG.md）不因「指回」误入门面域',
  !facade.includes('engine/CHANGELOG.md'));
t('B0 门面标记与 authorityPointer 同形：外链不算、fragment 算',
  !LANDING_MARK.test('](https://example.com/authority.md)') &&
  LANDING_MARK.test('](docs/authority.md#section)'));

// ---------- C. 在仓 ADR 从 §3 推出来，旧号只在历史引用面 ----------
// 发现口径收成一个纯函数，负对照和主检查共用它——这样「加一份新 ADR 会被认出来」
// 才是真被测过的，不是拿合成集合绕过发现链。
// 认三条：git 跟踪、文件名形如 docs/adr/NNNN-名字.md、盘上真有这个文件。
// 盘上那条不能少：工作区把文件删了但还没提交时 git 仍列着它，这时不该继续算「在仓」。
const ADR_NAME_RE = /^docs\/adr\/(\d{4})-.+\.md$/;
function collectAdr(trackedPaths, fileExists) {
  const files = trackedPaths.filter(p => ADR_NAME_RE.test(p)).filter(p => fileExists(p));
  const numbers = files.map(p => p.match(ADR_NAME_RE)[1]);
  const countByNumber = new Map();
  for (const n of numbers) { countByNumber.set(n, (countByNumber.get(n) || 0) + 1); }
  const duplicates = [...countByNumber].filter(([, c]) => c > 1).map(([n]) => n).sort();
  return { files, numbers: new Set(numbers), duplicates };
}
const ADR = collectAdr(TRACKED, p => existsSync(join(REPO, p)));
const ADR_FILES = ADR.files;
const ADR_NUMBERS = ADR.numbers;
const authorityText = txt('docs/authority.md');
// authority.md §3 的 yaml 块是历史号、起点号、历史路径和说明处的来源，脚本从块读；
// 块里的 entry 是脚本读到的起点号；它必须正好是 0028（见 C0b），改了就红。
function parseHistoricalAdr(text) {
  const fences = [...text.matchAll(/```yaml\r?\n([\s\S]*?)```/g)].map(m => m[1]);
  // 认块按「行首根键」，不按子串：文档里另放一个 yaml 示例、注释里写着 `# historical_adr: ...`，
  // 子串筛会把它当第二份块，于是报「两份来源」误红——配置一点没动却判错。
  // 根键后面允许跟行尾注释（`historical_adr: # 说明` 是合法 YAML），不能要求冒号后只剩空白。
  const blocks = fences.filter(b => b.split(/\r?\n/).some(l => /^historical_adr:\s*(#.*)?$/.test(l)));
  // 两份同名的块等于两个来源，直接按空处理交给调用处判红，不悄悄取第一个。
  if (blocks.length !== 1) { return null; }
  const block = blocks[0];
  const lines = block.split(/\r?\n/);
  // 字段层级钉死在 historical_adr 下面那一层（恰好 2 个空格），不用 `\s*`：
  // 否则把 entry 挪进子键（如 metadata: 下面）也会被当成顶层字段读走，等于放宽了块的结构却不报错。
  const TOP_FIELD = '^  ';
  const numbersLine = lines.find(l => new RegExp(TOP_FIELD + 'numbers:\\s*\\[').test(l)) || '';
  const numbers = [...numbersLine.matchAll(/"(\d{4})"/g)].map(m => m[1]);
  // 起点号扫全块的行，不是只看第一行：写了两行也得算「不止一个」，返回 null 交给调用处判红。
  // 一行只认严格形态 `entry: "NNNN"`（2 个空格缩进），其余写法（没引号、位数不对、缩进不对、空值）
  // 都记成坏行。「存在」只认冒号本身，不看冒号后有没有内容——空值 `entry:` 也是一行坏写法，
  // 要求冒号后有字符会把这类行悄悄漏掉，那就等于放过了一个错。
  const entryLineRe = new RegExp(TOP_FIELD + 'entry:\\s*"\\d{4}"\\s*$');
  const entryAnyLineRe = new RegExp('^\\s*entry:');
  const entryLines = lines.filter(l => entryAnyLineRe.test(l));
  const entryValues = entryLines
    .filter(l => entryLineRe.test(l))
    .map(l => (l.match(new RegExp(TOP_FIELD + 'entry:\\s*"(\\d{4})"\\s*$')) || [])[1]);
  function list(key) {
    const start = lines.findIndex(l => new RegExp('^\\s+' + key + ':\\s*$').test(l));
    if (start < 0) { return []; }
    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*:/.test(lines[i])) { break; }
      const item = lines[i].match(/^\s*-\s+([^\s#]+)/);
      if (item) { out.push(item[1]); }
    }
    return out;
  }
  // 起点号只认恰好一行、且严格形态可解析；写错、漏写、写两行都返回 null，交给调用处判红。
  const entry = entryLines.length === 1 && entryValues.length === 1 ? entryValues[0] : null;
  return { entry, numbers, paths: list('paths'), explained_in: list('explained_in') };
}
const HIST = parseHistoricalAdr(authorityText);
const HIST_NUMBERS = new Set(HIST ? HIST.numbers : []);
const HIST_PATHS = HIST ? HIST.paths : [];
const HIST_EXPLAINED = new Set(HIST ? HIST.explained_in : []);
const ENTRY_ADR = HIST ? HIST.entry : null;
// 起点号从块里的 entry 读（authority §3 说另抄一份清单就判红，所以这里不存号，只存期望值）。
// 票面点名「C0 至少含 0028」，可 C0 只核「在仓集合里有没有块里那个数」——块改成别的它也绿。
// 所以 0028 这个字面单独落成 C0b：读来的值必须等于期望值，改了块就红。
const EPOCH_START_EXPECTED = '0028';
// 在仓集合 = 盘上的号里剔掉历史号。按文件算、不按 Status 算：还没接受的提案也算在仓。
// 同一个号出现两份文件算红：去掉「只有一份」不等于允许同号并存。
function adrFloorVerdict(adrFiles, adrNumbers, historicalNumbers, epochStart) {
  const current = [...adrNumbers].filter(n => !historicalNumbers.has(n)).sort();
  const revived = [...adrNumbers].filter(n => historicalNumbers.has(n)).sort();
  return {
    current,
    revived,
    duplicates: adrFiles.duplicates,
    ok: current.length > 0 && current.includes(epochStart) && revived.length === 0 && adrFiles.duplicates.length === 0,
  };
}
const CURRENT_VERDICT = adrFloorVerdict(ADR, ADR_NUMBERS, HIST_NUMBERS, ENTRY_ADR);
// 起点号那份文件，C5 拿它核对 explained_in。
const epochStartFiles = ENTRY_ADR ? ADR_FILES.filter(p => p.startsWith('docs/adr/' + ENTRY_ADR + '-')) : [];
// C6d 的对照：一路走 collectAdr（git ls-files + 全路径正则 + existsSync），
// 一路走文件系统列举（readdir + 文件名正则），只看最后拿到的文件名清单是否一致。
// 两侧筛选方式不同，所以「全路径正则写错」这种毛病会被这一条抓到；
// 但两侧都拿 TRACKED 做交集，git 索引本身残缺时两边会一起少，这条看不见——那是另一类问题。
const ADR_DIR_FILES = (() => {
  const dir = join(REPO, 'docs', 'adr');
  const trackedSet = new Set(TRACKED);
  let names;
  try { names = readdirSync(dir); } catch { return []; }
  return names.filter(n => /^\d{4}-.+\.md$/.test(n)).map(n => 'docs/adr/' + n)
    .filter(p => trackedSet.has(p)).sort();
})();
// 历史路径按前缀匹配目录，说明处按整文件匹配；两者都要求号在 numbers 清单里。
function inHistoricalSurface(path, num) {
  if (!HIST_NUMBERS.has(num)) { return false; }
  if (HIST_EXPLAINED.has(path)) { return true; }
  return HIST_PATHS.some(p => path === p || path.startsWith(p.endsWith('/') ? p : p + '/'));
}
function historicalPathExists(p) { return existsSync(join(REPO, p)); }
// 合成夹具/解析器写出的哨兵号，不是决策位置：ADR-0000（空占位）、ADR-9999（越界试探）。
// 只允许出现在 engine 代码/测试（逐字节冻结夹具已在 excluded() 排除）；docs/门面引用它们仍是死锚。
const ADR_SENTINELS = new Set(['ADR-0000', 'ADR-9999', 'ADR-9991', 'ADR-9992', 'ADR-9993', 'ADR-9994']);
// 只允许 engine 代码/测试；engine/README.md 是门面，引用哨兵仍按死锚判失败。
const ADR_SENTINEL_PATH = /^engine\/(?:src|scripts|test)\//;
// engine/fixtures/definitions/*.json 是手写合成夹具（不是冻住的存档），其 ADR 头是 fixture 数据，
// 不是放置位置；D-code 与死锚仍照常扫描。
const ADR_SYNTHETIC_PATH = /^engine\/fixtures\/definitions\//;
// 两个固定名字不是位置引用：ADR-NNNN-C/vN 是裁决协议/叙事封条版本串；schema 的 inherits: 值
// 是「这一列从哪份旧决定继承」的历史标签。只放行这两个形状，且只限 engine 源码/脚本/测试。
function frozenMachineLabel(path, site) {
  if (!ADR_SENTINEL_PATH.test(path)) { return false; }
  const num = site.num || site.code.slice(4);
  if (!HIST_NUMBERS.has(num) && !ADR_NUMBERS.has(num)) { return false; }
  if (new RegExp(site.code + '-C/v[0-9]+').test(site.line)) { return true; }
  return new RegExp('inherits\\s*:\\s*[\\x27"]' + site.code + '[\\x27"]').test(site.line);
}
function adrRefSites(text) {
  const out = [];
  for (const m of text.matchAll(/\bADR-(\d{4})\b/g)) {
    const lineStart = text.lastIndexOf('\n', m.index - 1) + 1;
    const lineEnd = text.indexOf('\n', m.index);
    out.push({ code: m[0], num: m[1], line: text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd) });
  }
  return out;
}
// 同一枚号按放置面分类：C1 的主检查和 C6 负对照共用这一个分类器，避免「测的不是判的」。
function adrRefClass(path, num, site) {
  if (site) {
    if (ADR_SYNTHETIC_PATH.test(path)) { return 'exempt'; }
    if (frozenMachineLabel(path, site)) { return 'exempt'; }
    if (ADR_SENTINELS.has(site.code) && ADR_SENTINEL_PATH.test(path)) { return 'exempt'; }
  }
  if (ADR_NUMBERS.has(num)) { return 'current'; }
  if (inHistoricalSurface(path, num)) { return 'historical'; }
  return 'dead';
}
const badAdr = [];
let adrRefCount = 0;
for (const { path, text } of CORPUS) {
  for (const site of adrRefSites(text)) {
    adrRefCount++;
    if (adrRefClass(path, site.num, site) === 'dead') { badAdr.push(path + ':' + site.code); }
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
// C0 认四条：在仓集合非空、里面含块里那个起点号、盘上没有历史号复活、
// 同一个号没有两份文件。最后一条是去掉「只有一份」时补的口子——删掉那份检查不等于允许同号并存。
t('C0 在仓 ADR 非空、含块里的起点号、没有历史号复活、同一个号没有两份',
  CURRENT_VERDICT.ok,
  'entry=' + (ENTRY_ADR || '<unparsed>') + ' in-repo=' + CURRENT_VERDICT.current.join(',') + ' revived=' + CURRENT_VERDICT.revived.join(',') + ' dup=' + CURRENT_VERDICT.duplicates.join(',') + ' files=' + ADR_FILES.join(','));
// C0b 把票面点名的那个字面钉住：script 不写第二份是好事，但不能因此没人验「起点到底还是不是 0028」。
// 期望值只出现在这一处，且它验的是块里读出来的值，所以「块里改成 0029」会在这里红。
t('C0b 起点号就是 0028（票面点名的字面条件；块里改了就红）',
  ENTRY_ADR === EPOCH_START_EXPECTED,
  'entry=' + (ENTRY_ADR || '<unparsed>') + ' expected=' + EPOCH_START_EXPECTED);
t('C1 现行文本的 ADR-NNNN 只指向在仓 ADR 或历史引用面（哨兵与固定机器名除外）',
  adrRefCount > 0 && badAdr.length === 0, 'refs=' + adrRefCount + ' dangling=' + [...new Set(badAdr)].join(','));
t('C1b 哨兵豁免只覆盖 engine 代码/测试（engine/README.md 不在内）',
  ADR_SENTINEL_PATH.test('engine/src/audit/macro-b.ts') && !ADR_SENTINEL_PATH.test('engine/README.md'));
t('C2 现行 Markdown 的 docs/adr 链接可解析（含生成索引相对链接）', adrLinkCount > 0 && adrLinks.length === 0, 'links=' + adrLinkCount + ' dangling=' + adrLinks.join(','));
function contiguousFromOne(nums) {
  const sorted = [...new Set(nums)].sort();
  return sorted.length === nums.length && sorted.every((n, i) => n === String(i + 1).padStart(4, '0'));
}
// C3 的「恰 27 个」是刻意冻结过去，不是本票的过期说法问题（票面把它划在范围外），保持原样。
t('C3 历史号解析恰为 0001–0027（27 个、连续、无重复；从 §3 读）',
  !!HIST && HIST.numbers.length === 27 && contiguousFromOne(HIST.numbers),
  HIST ? 'n=' + HIST.numbers.length + ' first=' + HIST.numbers[0] + ' last=' + HIST.numbers[HIST.numbers.length - 1] : 'block=absent');
const missingHistPaths = HIST_PATHS.filter(p => !historicalPathExists(p));
t('C4 历史路径清单非空，每条都在仓里（清单从 §3 读，不在脚本里抄第二份）',
  HIST_PATHS.length > 0 && missingHistPaths.length === 0,
  'paths=' + HIST_PATHS.join(',') + ' missing=' + missingHistPaths.join(','));
const missingExplained = [...HIST_EXPLAINED].filter(p => !historicalPathExists(p));
// explained_in 要含 authority.md 和块里起点号那份。起点那份不在仓里也算红：那是「起点 ADR 被删」。
// 「起点号不是历史号、盘上那份在」已由 C0（不含历史号）和 C5（有那份文件）覆盖，不再另开断言重说一遍。
t('C5 explained_in 非空、每条都在仓里，且含 authority.md 与块里起点号那份',
  HIST_EXPLAINED.size > 0 && missingExplained.length === 0 && epochStartFiles.length > 0 &&
  HIST_EXPLAINED.has('docs/authority.md') && epochStartFiles.some(p => HIST_EXPLAINED.has(p)),
  'explained=' + [...HIST_EXPLAINED].join(',') + ' epoch-start=' + (epochStartFiles.join(',') || '<none>') + ' missing=' + missingExplained.join(','));
const HIST_SCREEN = HIST_PATHS[0] || '<missing-historical-path>';
t('C6 负对照：同一枚 ADR-0001 在历史路径通过、在现行路径判红；历史路径不放行任意旧号', // NEGATIVE-CONTROL
  adrRefClass(HIST_SCREEN, '0001') === 'historical' && // NEGATIVE-CONTROL
  adrRefClass('README.md', '0001') === 'dead' && // NEGATIVE-CONTROL
  adrRefClass(HIST_SCREEN, '9998') === 'dead', // NEGATIVE-CONTROL
  'hist=' + adrRefClass(HIST_SCREEN, '0001') + ' current=' + adrRefClass('README.md', '0001'));
// 起点号落在现行面这件事由 C0（current.includes(entry) 已保证它不在历史号里、也算进了在仓集合）
// 和 C5（explained_in 含它那份文件）覆盖，不另开一条重复的。
// C6b 证伪的是「发现 + 判断」整条链，所以走的是真函数 collectAdr/adrFloorVerdict，
// 只把输入换成合成路径假装的 tracked 列表和 existsSync —— 不碰真仓，也不会因为仓坏了跟着红。
// 号段取 4 位里用不到的合成值，不把真号搬回脚本。
t('C6b 发现链与判法负对照：新加一份仍绿、删起点号红、号塞进历史清单红、同号两份红、发现器认不出新文件时也红、entry 写错层级/缩进/格式也红', // NEGATIVE-CONTROL
  (() => { // NEGATIVE-CONTROL
    const trackedWith = (names) => names.map(n => 'docs/adr/' + n + '.md'); // NEGATIVE-CONTROL
    const allExist = () => true; // NEGATIVE-CONTROL
    const base = ['9001-base', '9002-next']; // NEGATIVE-CONTROL
    const hist = new Set(['9003']); // NEGATIVE-CONTROL
    const epoch = '9001'; // NEGATIVE-CONTROL
    const verdictOf = (tracked, exists, historical) => { // NEGATIVE-CONTROL
      const adr = collectAdr(tracked, exists); // NEGATIVE-CONTROL
      return adrFloorVerdict(adr, adr.numbers, historical, epoch); // NEGATIVE-CONTROL
    }; // NEGATIVE-CONTROL
    return verdictOf(trackedWith([...base, '9004-added']), allExist, hist, epoch).ok && // NEGATIVE-CONTROL
      // 新加那份必须真被认出来：只看“绿”不够，被漏掉也绿。
      verdictOf(trackedWith([...base, '9004-added']), allExist, hist, epoch).current.includes('9004') && // NEGATIVE-CONTROL
      !verdictOf(trackedWith(['9002-next', '9004-added']), allExist, hist, epoch).ok && // NEGATIVE-CONTROL
      !verdictOf(trackedWith(base), allExist, new Set([...hist, '9001']), epoch).ok && // NEGATIVE-CONTROL
      !verdictOf(trackedWith([...base, '9001-copy']), allExist, hist, epoch).ok && // NEGATIVE-CONTROL
      // 命名规则要真挡得住：.markdown 不算，非 docs/adr 路径不算。这里喂完整路径，不靠 trackedWith 补后缀。
      collectAdr(['docs/adr/9001-base.md', 'docs/adr/9002-next.markdown'], allExist).files.length === 1 && // NEGATIVE-CONTROL
      collectAdr(['not-an-adr/docs/adr/9001-x.md'], allExist).files.length === 0 && // NEGATIVE-CONTROL
      // existsSync 一侧要真起作用：盘上没了的那份不算在仓。
      !collectAdr(trackedWith([...base, '9004-added']), (p) => !p.includes('9004')).numbers.has('9004') && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  numbers: ["9003"]\n```').entry === '9001' && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  entry: "9002"\n  numbers: []\n```').entry === null && // NEGATIVE-CONTROL
      // 层级负对照：entry 挪进子键下就不是 historical_adr 的直接字段了，不能照样读成顶层。
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  metadata:\n    entry: "9001"\n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n entry: "9001"\n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: 9001\n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      // 空值行也算坏写法：`entry:` 后面什么都没写，不能被当成「这行不存在」悄悄放过。
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  entry:\n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  entry:   \n  numbers: ["9003"]\n```').entry === null && // NEGATIVE-CONTROL
      // 认块按行首根键：另一个 yaml 示例里只在注释提到它，不该被当成第二份块。
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  numbers: ["9003"]\n```\n\n```yaml\n# historical_adr: 只是注释举例\nx: 1\n```').entry === '9001' && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr:\n  entry: "9001"\n  numbers: ["9003"]\n```\n\n```yaml\nhistorical_adr:\n  entry: "9002"\n```') === null && // NEGATIVE-CONTROL
      // 根键带行尾注释是合法 YAML，得照样认出来；两块都带注释时也要按「两份」判掉。
      parseHistoricalAdr('```yaml\nhistorical_adr: # 配置说明\n  entry: "9001"\n  numbers: ["9003"]\n```').entry === '9001' && // NEGATIVE-CONTROL
      parseHistoricalAdr('```yaml\nhistorical_adr: # 一\n  entry: "9001"\n  numbers: ["9003"]\n```\n\n```yaml\nhistorical_adr: # 二\n  entry: "9002"\n```') === null; // NEGATIVE-CONTROL
  })()); // NEGATIVE-CONTROL
// C6d 把「发现链在真仓上跑出来的结果」和「独立从 tracked 列表重算的结果」对一遍。
// 那条正对照（加一份新 ADR 不用改脚本）没法测未来，但能测「发现链有没有如实反映盘上事实」：
// 两条独立算法给出不同答案，就说明发现链本身坏了（正则、git 过滤、existsSync 任一处）。
t('C6d 真仓发现链与独立列举一致（git 侧和目录侧答案不同、或有文件只在一侧，都红）',
  ADR_FILES.length > 0 && ADR_DIR_FILES.length > 0 &&
  JSON.stringify([...ADR_FILES].sort()) === JSON.stringify(ADR_DIR_FILES),
  'git-side=' + ADR_FILES.join(',') + ' dir-side=' + ADR_DIR_FILES.join(','));
// 「起点 ADR 那份文件真的在盘上」由 C0（在仓集合含它）和 C5（explained_in 含它）兜住，
// 不再单开一条自查——那只会把同一句话再重复一遍。
t('C7 固定机器名放行：协议版本串和 schema inherits 历史标签不算死引用，普通旧号仍算', // NEGATIVE-CONTROL
  frozenMachineLabel('engine/src/report/generate.ts', { code: 'ADR-0013', line: "const V = 'ADR-0013-C/v1';" }) && // NEGATIVE-CONTROL
  frozenMachineLabel('engine/src/fact/schema.ts', { code: 'ADR-0005', line: "inherits: 'ADR-0005'" }) && // NEGATIVE-CONTROL
  !frozenMachineLabel('engine/src/audit/x.ts', { code: 'ADR-0005', line: '// ADR-0005' }) && // NEGATIVE-CONTROL
  !frozenMachineLabel('README.md', { code: 'ADR-0013', line: "'ADR-0013-C/v1'" })); // NEGATIVE-CONTROL
// explained_in 是整文件豁免；活指针仍须守「不指旧号」——单独一条，避免整文件豁免把它一并放过。
// 块里列的历史件路径原样保留，不按活指针判；其余面（含 explained_in 的说明处）照常扫。
const historicalDesignPointers = [];
for (const { path, text } of CORPUS) {
  if (HIST_PATHS.some(p => path === p || path.startsWith(p.endsWith('/') ? p : p + '/'))) { continue; }
  for (const site of adrRefSites(text)) {
    if (!site.line.includes('Design:')) { continue; }
    if (HIST_NUMBERS.has(site.num)) { historicalDesignPointers.push(path + ':' + site.code); }
  }
}
t('C8 Design 指针不指历史号（explained_in 整文件豁免不放行活指针）',
  historicalDesignPointers.length === 0, 'hits=' + historicalDesignPointers.slice(0, 10).join(','));

// ---------- D. D-code ⊆ 归档索引 + 只减不增 ----------
const INDEX_PATH = 'docs/archive/decisions/ticket-index.md';
const LEDGER_PATH = 'docs/archive/decisions/macro-audit-ledger.md';
// 归档 README 公布 macro-audit-ledger 的 git hash-object 值＝记录零改写的可证锚；
// 从该文书解析，不在检查里复制第二份字面量（同一事实只写一处）。
const ARCHIVE_README = 'docs/archive/decisions/README.md';
const archiveReadme = txt(ARCHIVE_README);
const anchorMatch = archiveReadme.match(/git hash-object docs\/archive\/decisions\/macro-audit-ledger\.md\s+#\s+([0-9a-f]{40})/);
const LEDGER_ANCHOR = anchorMatch ? anchorMatch[1] : '';
const indexText = txt(INDEX_PATH);
const ledgerText = txt(LEDGER_PATH);
const INDEX_CODES = new Set(dcodes(indexText));
const LEDGER_CODES = new Set(dcodes(ledgerText));

// ticket-index §4 是「散文假阳性」的唯一起源（D-000 等不是决策号，不建索引行）。
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
// 防止「往 §4 加一行」把任意新 D-code 洗成假阳性（堵住这个绕过口子）。
const fpLine = archiveReadme.split('\n').find(l => l.includes('5 个形似') && l.includes('D-000')) || '';
const FP_KNOWN = [...new Set(fpLine.match(/D-\d{3}/g) || [])];

const currentCodes = new Set();
for (const { text } of CORPUS) {
  for (const code of dcodes(text)) { currentCodes.add(code); }
}
const notIndexed = [...currentCodes].filter(c => !INDEX_CODES.has(c) && !FP_CODES.has(c)).sort();
const overRatchet = [...currentCodes].filter(c => !LEDGER_CODES.has(c) && !FP_CODES.has(c)).sort();
const ledgerBlob = git(['hash-object', LEDGER_PATH]).trim();
t('D0 现行 D-code 集合非空（证明这条限制真在起作用，不是白跑一趟）', currentCodes.size > 0);
t('D1 现行 D-NNN 引用 ⊆ 归档索引（散文假阳性表例外）', notIndexed.length === 0, 'not-indexed=' + notIndexed.join(','));
t('D2 冻结记录的 blob 值没变（锚取自归档 README）', !!LEDGER_ANCHOR && ledgerBlob === LEDGER_ANCHOR, 'got=' + ledgerBlob + ' want=' + (LEDGER_ANCHOR || '<unparsed>'));
t('D3 现行 D-NNN 集合 ⊆ 冻结记录∪散文假阳性（只减不增）', overRatchet.length === 0, 'new=' + overRatchet.join(','));
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

// ---------- F. 门面文书不得自称权威（§2 白名单只从一个地方读） ----------
function section2Whitelist(text) {
  // 只取 §2 表：到下一个二级/三级标题（即 §2.1）即止，不把生成面的再生命令当从属规则。
  const m = text.match(/^## 2\.[^\n]*\n([\s\S]*?)^(?:##|###)\s/m);
  if (!m) { return new Set(); }
  const out = new Set();
  for (const line of m[1].split('\n')) {
    if (!line.startsWith('|')) { continue; }
    // 非权威/只读行不构成「专题唯一权威」白名单（docs/archive/decisions/ 明标非权威、只读）。
    if (/非权威|只读|not authoritative|read-only/i.test(line)) { continue; }
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
// 取「唯一权威 = <值>」里的完整取值；不能只看同句是否出现 authority.md 或白名单子串。
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
    if (line.includes('唯一权威') && !viaWhitelist) { selfClaim.push(p + ':' + (i + 1) + ' 唯一权威无 §2 位置'); }
    if (line.includes('唯一成文处') && !viaAuthority) { selfClaim.push(p + ':' + (i + 1) + ' 自称唯一成文处'); }
    if (selfClaimHit(line) && !viaAuthority) { selfClaim.push(p + ':' + (i + 1) + ' 自称权威'); }
  });
}
const readmeAuthorityLine = (safeTxt('README.md') || '').split('\n').find(l => l.includes('唯一权威')) || '';
t('F1 §2 从属规则白名单只从 authority.md 一处解析（upstream-lock.yaml 正对照）',
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
t('F1f 非权威/只读的 §2 行不入白名单（docs/archive/decisions/ 被排除）',
  whitelist.has('docs/ra/') && !whitelist.has('docs/archive/decisions/'));
t('F1g 伪权威值 docs/archive/decisions/ 被拒',
  !whitelistMatch.has(assertedAuthority('唯一权威 = docs/archive/decisions/') || ''));
t('F2 门面文书不得自称权威；专题唯一权威须命中 §2 白名单', selfClaim.length === 0, selfClaim.join(' | '));
t('F3 README 若有「唯一权威」行，必须命中 §2 白名单（没有该行也通过）',
  readmeAuthorityLine === '' || whitelistMatch.has(assertedAuthority(readmeAuthorityLine) || ''));
t('F4 自称权威探测器负对照：本文件是权威规则命中，本目录是非权威不命中', // NEGATIVE-CONTROL
  selfClaimHit('本文件是权威规则') && !selfClaimHit('本目录是非权威、只读')); // NEGATIVE-CONTROL

// ---------- G. docs-ci 只跑一条的规矩 ----------
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
  'GLOSSARY.md', 'engine/README.md', 'engine/package.json', 'engine/scripts/gen-adr-index.mjs',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'engine/test/contracts/docs-authority-check.mjs', '.github/workflows/docs-ci.yml',
  '.github/**', '.claude-plugin/**', 'examples/**',
];
t('G1 docs-ci workflow 在位且无 BOM + LF', !!docsCiBuf && noBom(docsCiBuf) && docsCi.indexOf('\r') < 0);
for (const ev of ['push', 'pull_request']) {
  const ps = yamlPaths(docsCi, ev);
  const missing = REQUIRED_PATHS.filter(x => !ps.includes(x));
  t('G2.' + ev + ' paths 覆盖 docs/README/门面/检查脚本本身', missing.length === 0, 'missing=' + missing.join(',') + ' got=' + ps.join(','));
}
t('G3 docs-ci 只跑一条 ubuntu/node24（无 matrix/strategy）',
  /runs-on:\s*ubuntu-latest/.test(docsCi) && /node-version:\s*['"]?24['"]?/.test(docsCi) &&
  !/^\s*matrix:/m.test(docsCi) && !/^\s*strategy:/m.test(docsCi) && (docsCi.match(/runs-on:/g) || []).length === 1);
const runSteps = [...docsCi.matchAll(/^[ \t]*run:[ \t]*(.+)$/gm)].map(m => m[1].trim());
t('G4 docs-ci 复用 check:docs（恰一个 npm run check:docs run 步骤，不建第二套文档校验）',
  runSteps.filter(s => s === 'npm run check:docs').length === 1, 'runs=' + runSteps.join(' | '));
// tracker #97：生成物 drift 检查长什么样——全 workflow 恰两个 run 步骤（check:docs ＋ 一个多行 drift 步骤），
// 复用 engine-ci 同一条 npm run gen 链，检查本体锁死为 docs/adr/README.md 一件，不扩第二套校验。
// CodeRabbit 复审升级：解析第二个 run: | 的可执行体并剥注释行，锁死命令顺序——
// gen 首行、tracked 检查次之、diff 本体第三；注释里的命令文本不再能蒙混过关，顺序颠倒即红。
const wfLines = docsCi.split('\n');
const runBarIdx = wfLines.map((l, i) => (/^[ \t]*run:\s*\|\s*$/.test(l) ? i : -1)).filter(i => i >= 0);
const driftCmds = runBarIdx.length === 1 ? (() => {
  const out = [];
  for (let i = runBarIdx[0] + 1; i < wfLines.length; i++) {
    if (/^\s*$/.test(wfLines[i])) { continue; }
    if (!/^[ \t]{8,}/.test(wfLines[i])) { break; }
    const l = wfLines[i].trim();
    if (!l.startsWith('#')) { out.push(l); }
  }
  return out;
})() : [];
const genIdx = driftCmds.indexOf('npm --prefix engine run gen');
const trackIdx = driftCmds.findIndex(l => l.startsWith('if ! git ls-files --error-unmatch -- docs/adr/README.md'));
const diffIdx = driftCmds.findIndex(l => l.startsWith('if ! git diff --exit-code -- docs/adr/README.md'));
t('G8 docs-ci #97 drift 检查：可执行序列 = gen → tracked 检查 → diff 本体（剥注释行，顺序敏感）',
  runSteps.length === 2 && runSteps[0] === 'npm run check:docs' && runSteps[1] === '|' &&
  driftCmds.length > 0 && genIdx === 0 && trackIdx === genIdx + 1 && diffIdx > trackIdx,
  'cmds=' + driftCmds.join(' && '));
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
t('H2 engine-ci 路径/步骤不承载文档检查（无 docs/** 触发、无 docs-ci 引用）',
  !engineCiPushPaths.includes('docs/**') && !engineCiPrPaths.includes('docs/**') &&
  !engineCi.includes('docs-authority-check') && !engineCi.includes('docs-ci.yml'));
t('H3 engine-ci 仍跑 smoke（contracts-run 自动纳入新检查）', /run:\s*npm run smoke/.test(engineCi));

// ---------- I. contracts-run 自动纳入 ----------
const runner = txt('engine/test/contracts-run.mjs');
const pkg = JSON.parse(txt('engine/package.json'));
t('I1 contracts-run 以 *-check.mjs 命名枚举（本检查自动纳入）',
  runner.includes('/-check\\.mjs$/') && /-check\.mjs$/.test(SELF.split('/').pop()));
t('I2 smoke 链含 contracts-run（engine-ci 六条任务自动继承）', String(pkg.scripts.smoke || '').includes('test/contracts-run.mjs'));
t('I3 check:docs 链含本检查（docs-ci 单命令复用）', String(pkg.scripts['check:docs'] || '').includes('test/contracts/docs-authority-check.mjs'));
const checkDocs = String(pkg.scripts['check:docs'] || '');
t('I4 check:docs 一处配齐 ack/docs-authority 两段',
  ['gen-acknowledgments.mjs --check', 'docs-authority-check.mjs'].every(s => checkDocs.includes(s)));

// ---------- K. 版本记录 GitHub 引用形制（tracker #N 口径，tracker #106） ----------
// authority §3「新写按节判」的执行面：[Unreleased] 节永远算现行文本，节内 GitHub 引用一律
// `tracker #N`；已发布节随 release cut 冻结成历史文本，本检查不碰。豁免两形：`旧票 #N`（旧
// BACKLOG 号不是 GitHub 引用，加 tracker 前缀反而造错——本仓评审实证过的坑）和反引号内的
// 字面量。其余文件不设机检边界（PR 人审顺手归一），这里只钉版本记录这一节。
// [Unreleased] 节正文：从标题行到下一个 `## ` 标题行为止；没有这一节返回 null，交给调用处判红。
function unreleasedSection(text) {
  const lines = text.split('\n');
  const start = lines.findIndex(l => /^## \[Unreleased\]/.test(l));
  if (start < 0) { return null; }
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) { break; }
    out.push(lines[i]);
  }
  return out.join('\n');
}
// 代码跨区间（[start, end) 清单）。CommonMark 配对：开跨＝完整反引号连续段，闭跨＝
// **同长度**的完整连续段，跨内允许出现更短的连续段（``a`b`` 合法）。两条边界
// （CodeRabbit PR #237 第二轮 Minor）：两端不等长不构成跨子（`a`` 里 a 照裸判），
// 否则 1 枚反引号会被 2 枚连续段的第一枚错关掉；跨内更短连续段不算关，否则合法跨子
// ``#N `x` `` 会被拆碎误红。跨子不跨行；未配对不构成跨子。
function codeSpanRanges(text) {
  const ranges = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] !== '`') { i += 1; continue; }
    let n = 0;
    while (i + n < text.length && text[i + n] === '`') { n += 1; }
    let j = i + n;
    let close = -1;
    while (j < text.length && text[j] !== '\n') {
      if (text[j] === '`') {
        let m = 0;
        while (j + m < text.length && text[j + m] === '`') { m += 1; }
        if (m === n) { close = j; break; }
        j += m; // 长度不等的连续段是跨内字面量，不算关
      } else {
        j += 1;
      }
    }
    if (close >= 0) {
      const end = close + n;
      ranges.push([i, end]);
      i = end;
    } else {
      i += n; // 未配对：这一段反引号是字面量，不构成跨子
    }
  }
  return ranges;
}
// 裸引用位点（纯函数，判别臂与主检查共用同一个，避免「测的不是判的」）：在**原文**上找
// `#数字`，落在代码跨内的豁免；前缀判据同样只看原文——掩码把反引号换成空格会凭空造出
// 「tracker 」这样的豁免前缀，把 tracker`#123（未配对）和 tracker`x`#123（完整跨子）
// 这类真裸引用漏掉（CodeRabbit PR #237 第三轮 Minor）。
function bareTrackerRefs(text) {
  const spans = codeSpanRanges(text);
  const inSpan = (idx) => spans.some(([s, e]) => idx >= s && idx < e);
  // 豁免前缀的回看窗口：16 个字符足够容纳「epic tracker 」这类最长的合法前缀。
  const EXEMPT_PREFIX_WINDOW = 16;
  const out = [];
  for (const m of text.matchAll(/#(\d+)/g)) {
    if (inSpan(m.index)) { continue; }
    const before = text.slice(Math.max(0, m.index - EXEMPT_PREFIX_WINDOW), m.index);
    // 只认「前缀 + 至少一个空格/tab」直接贴到 #：tracker#N（无空格）、tracker`x`#123
    // （中间隔着代码跨）、「tracker 换行 #N」（跨行）都不放行——前者和后两类不是成文形制，
    // 跨行那类会让下一行行首的裸 #NN 借上一行的尾巴逃掉。
    if (/(?:tracker|旧票)[ \t]+$/.test(before)) { continue; }
    const lineStart = text.lastIndexOf('\n', m.index - 1) + 1;
    const lineEnd = text.indexOf('\n', m.index);
    const line = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd).trim();
    out.push('#' + m[1] + ' :: ' + (line.length > 50 ? line.slice(0, 50) + '…' : line));
  }
  return out;
}
const CHANGELOG = 'engine/CHANGELOG.md';
const unreleased = unreleasedSection(txt(CHANGELOG));
const bareRefs = unreleased === null ? [] : bareTrackerRefs(unreleased);
t('K1 [Unreleased] 节在位（形制判据的对象存在；节没了或改名都红，不给扫描留静默空转）',
  unreleased !== null);
t('K2 [Unreleased] 节零裸 GitHub 引用（tracker #N 口径；旧票 #N 与反引号字面量豁免）',
  bareRefs.length === 0, 'hits=' + bareRefs.join(' | '));
t('K3 判别臂：裸 #NN 必判红（含 PR 前缀与同句第二枚）、tracker/旧票/反引号放行、节提取到下一个 ## 为止、节缺失返 null', // NEGATIVE-CONTROL
  (() => { // NEGATIVE-CONTROL
    const hits = (s) => bareTrackerRefs(s).length; // NEGATIVE-CONTROL
    return hits('（#123）') === 1 && // NEGATIVE-CONTROL
      hits('PR #105 落地') === 1 && // NEGATIVE-CONTROL
      hits('tracker #123 与 #124 同句') === 1 && // NEGATIVE-CONTROL
      hits('tracker#123 无空格不是成文形制') === 1 && // NEGATIVE-CONTROL
      hits('tracker\n#123 跨行借不到上一行的前缀') === 1 && // NEGATIVE-CONTROL
      hits('父票 tracker #38 与 epic tracker #109') === 0 && // NEGATIVE-CONTROL
      hits('旧票 #38 是旧 BACKLOG 号') === 0 && // NEGATIVE-CONTROL
      hits('反引号字面量 `#38` 不算 GitHub 引用') === 0 && // NEGATIVE-CONTROL
      hits('双反引号跨子 ``#123`` 同样豁免') === 0 && // NEGATIVE-CONTROL
      hits('跨子 ``a`` 外的裸 #123 照判') === 1 && // NEGATIVE-CONTROL
      hits('`#123`` 两端不等长不构成跨子') === 1 && // NEGATIVE-CONTROL
      hits('合法跨子 ``#123 `x` `` 内含短连续段') === 0 && // NEGATIVE-CONTROL
      hits('tracker`#123 未配对反引号不造豁免前缀') === 1 && // NEGATIVE-CONTROL
      hits('tracker`x`#123 代码跨不是豁免前缀') === 1 && // NEGATIVE-CONTROL
      unreleasedSection('## [Unreleased]\n- A（#123）\n## [0.3.0]\n- B #55\n') === '- A（#123）' && // NEGATIVE-CONTROL
      unreleasedSection('## [0.3.0]\n- B\n') === null; // NEGATIVE-CONTROL
  })()); // NEGATIVE-CONTROL

// ---------- J. 编码纪律 ----------
t('J1 本检查无 BOM + LF', noBom(readFileSync(fileURLToPath(import.meta.url))) && selfText.indexOf('\r') < 0);

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail) + ' docs-authority checks');
process.exit(fail === 0 ? 0 : 1);
