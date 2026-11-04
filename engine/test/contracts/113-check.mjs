// 113-check.mjs —— #113 审计对象仓符号链接与路径穿透安全防护守卫
// 断言面（对应本票 Acceptance criteria，按 PASS/FAIL 口径；能力不可得时给 SKIP 而不是假绿）：
//   A 静态契约：安全读取单点在位、四个读取面与 39 one-shot 全部接入、url 腿保留 `core.symlinks=false`、
//     回归克隆腿**不**带该旗标（带了就把链接物化成普通文件→遮住本票要证明的拒绝+披露路径）
//   B 安全读取单点行为：仓内常规文件放行 / 仓外文件链接拒绝 / 悬空链接拒绝（专门 reason）/
//     仓内目录链接放行 / 仓外目录 junction 拒绝 / 目录枚举单点同判定
//   C 端到端（走真实入口，不自造事实）：
//     C1 `audit --out`（Macro-B 一等命令）——report.md / facts.jsonl / facts.duckdb 均不含仓外内容，
//        且**持久化事实里**有 codelore.file_subject_skip 披露事实＋报告 limitations 如实披露
//     C2 TC-2 判据防翻转：对照 3 份贫瘠 ADR 恒 RED，注入 5 份仓外完整 ADR 后仍 RED（total 恒 3）
//     C3 `39-macro-b-one-shot.mjs`（CI 实跑脚本）——同样落 skip 事实进 JSONL 与报告披露块
//     C4 目录 junction 合成仓——零仓外语料、有 dir-junction-outside 披露事实、PC-MC-1 不因 skip 事实转阳性
//   D 守卫卫生：新增文件无 BOM
// 纪律：被测仓一律建在 OS temp（PRODUCTION_SAFE，跑完即弃）；只读断言仓内文件，不写主仓。
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

// guard-meta（D-159②/D-160③ 自声明）
const TIER = 'portable';
// D-214① consumption_forms：端到端面需要 engine/node_modules（duckdb 原生绑定）——dev-full 全断言面；
// ci-shallow（CI 浅克隆）下 C1/C3 的 duckdb 落库断言组级 SKIP，其余组照跑。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '#113 审计对象仓符号链接安全防护——不可信输入边界贯穿与判据翻转防护';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const ENG = join(ROOT, 'engine');
const CLI = join(ENG, 'dist', 'cli.js');
const NL = String.fromCharCode(10);

let pass = 0, fail = 0;
const failedNames = [];
const skippedGroups = [];
const t = (name, ok, extra = '') => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : ''));
  if (ok) { pass++; } else { fail++; failedNames.push(name); }
};
// 能力缺组统一走这里：吐 SKIP + SKIP-GROUP 机读行，不静默也不算绿（D-159③ 三态纪律）。
const skipGroup = (group, reason) => {
  console.log('SKIP 113-check/' + group + ' | ' + reason);
  console.log('GUARD-RESULT: SKIP-GROUP 113-check group=' + group + ' reason=' + reason);
  skippedGroups.push(group);
};
const txt = p => fs.readFileSync(p, 'utf8');
const exists = p => fs.existsSync(p);

// ---------- 能力探测（前置条件不可得＝SKIP，不假绿） ----------
const nodeMajor = Number(process.versions.node.split('.')[0]);
const distReady = exists(CLI) && exists(join(ENG, 'dist', 'audit', 'safe-read.js'));
const duckdbReady = (() => {
  try { return exists(join(ENG, 'node_modules', '@duckdb', 'node-api')); } catch { return false; }
})();
// 符号链接能力：POSIX 上恒有；Windows 上需开发者模式/管理员。探测一次，后续按能力选组。
// 三种链接能力分别探测：Windows 上文件链接与目录链接是两种 mklink 形态，且 junction 与目录符号链接
// 权限面不同（junction 免开发者模式）——一律先探后用，缺哪种就跳过对应组，绝不靠猜 link 类型硬造而红。
const linkCap = (() => {
  const dir = fs.mkdtempSync(join(tmpdir(), '6f-113-cap-'));
  const probe = (mk) => { try { mk(); return true; } catch { return false; } };
  try {
    const target = join(dir, 'target.txt');
    fs.writeFileSync(target, 'x', 'utf8');
    const sub = join(dir, 'sub');
    fs.mkdirSync(sub);
    // 悬空目标单列一支：Windows 上「目标在场」与「悬空目标」的建链行为不同（后者无类型可猜即 EPERM），
    //   把它当无条件能力会用假绿换真红——b3 组按这一支门控。
    return {
      file: probe(() => fs.symlinkSync(target, join(dir, 'link.txt'), 'file')),
      dir: probe(() => fs.symlinkSync(sub, join(dir, 'link-dir'), 'dir')),
      junction: probe(() => fs.symlinkSync(sub, join(dir, 'junction'), 'junction')),
      dangling: probe(() => fs.symlinkSync(join(dir, 'no-such-target.txt'), join(dir, 'link-dangling.txt'), 'file'))
    };
  } catch { return { file: false, dir: false, junction: false, dangling: false }; }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* noop */ } }
})();
const symlinkProbe = linkCap.file;

try {
// ---------- A. 静态源码断言 ----------
const safeSrc = txt(join(ENG, 'src', 'audit', 'safe-read.ts'));
t('A1 safe-read.ts 导出读取/列目录/探针/披露事实四件（readRepoFileSafe·readRepoDirSafe·probeRepoEntry·makeFileSubjectSkipFact）',
  /export function readRepoFileSafe/.test(safeSrc) &&
  /export function readRepoDirSafe/.test(safeSrc) &&
  /export function probeRepoEntry/.test(safeSrc) &&
  /export function makeFileSubjectSkipFact/.test(safeSrc) &&
  /export function listAdrFilesSafe/.test(safeSrc), '');

t('A1b lstat 错误按 errno 分类（只有 ENOENT/ENOTDIR 算不存在，其余报拒绝而不是静默缩水）',
  /isAbsentErrno/.test(safeSrc) && /code === 'ENOENT' \|\| code === 'ENOTDIR'/.test(safeSrc)
  && (safeSrc.match(/isAbsentErrno\(code\)/g) || []).length >= 3, '');

t('A2 安全读取经单一文件描述符（fstat 复核＋fd 读；判界与读取同一 inode，堵 TOCTOU）',
  safeSrc.includes('openSync') && safeSrc.includes('fstatSync') && safeSrc.includes('O_NOFOLLOW') &&
  safeSrc.includes('readFileSync(fd'), '');

const mbSrc = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('A3a macro-b.ts 接入安全读取（读取＋列目录＋披露事实，无裸 readdir 枚举 ADR 目录）',
  mbSrc.includes('readRepoFileSafe') && mbSrc.includes('listAdrFilesSafe') && mbSrc.includes('makeFileSubjectSkipFact') &&
  !/readdirSync\(\s*adrDir/.test(mbSrc), '');

const mcSrc = txt(join(ENG, 'src', 'audit', 'macro-c.ts'));
t('A3b macro-c.ts 接入安全读取（读取＋列目录＋披露事实；ADR 存在性看语料目录不看事实数）',
  mcSrc.includes('readRepoFileSafe') && mcSrc.includes('listAdrFilesSafe') && mcSrc.includes('makeFileSubjectSkipFact') &&
  mcSrc.includes('adrDirUsable') && !/col\.adrFacts\.length\s*>\s*0/.test(mcSrc), '');

t('A3c macro-c.ts 不再对被审计仓做 existsSync 存在性探针（跟随链接＝仓外文件可解 defer-ref 边）',
  !/existsSync\(\s*join\(\s*repoRoot/.test(mcSrc) && /DEFER_REL/.test(mcSrc), '');

const auditSrc = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('A4 audit.ts 证据引文走安全读取并在 limitations 披露跳过语料',
  auditSrc.includes('readRepoFileSafe') && auditSrc.includes('语料来源经链接解析被拒'), '');

const microASrc = txt(join(ENG, 'src', 'audit', 'micro-a.ts'));
t('A4b micro-a.ts 证据引文走安全读取（无 base 时才落裸读）',
  microASrc.includes('readRepoFileSafe') && microASrc.includes('EXCERPT-REJECTED'), '');

const oneShotSrc = txt(join(ENG, 'scripts', '39-macro-b-one-shot.mjs'));
t('A4c 39-macro-b-one-shot.mjs 接入安全读取并就拒绝输入发射披露事实（含 limitations 披露）',
  oneShotSrc.includes('readRepoFileSafe') && oneShotSrc.includes('makeFileSubjectSkipFact') &&
  oneShotSrc.includes('pushSkip(') && oneShotSrc.includes('语料来源经链接解析被拒'), '');

const intakeSrc = txt(join(ENG, 'src', 'intake', 'intake.ts'));
t('A5 url 腿克隆保留 core.symlinks=false（defense-in-depth 真作用位）',
  intakeSrc.includes('core.symlinks=false'), '');

const wfSrc = txt(join(ROOT, '.github', 'workflows', 'macro-b-regression.yml'));
// 注释里说明「为什么不用它」是允许的；只有真接进 `git clone` 命令行才算违约——按去注释后的行判。
const wfCodeLines = wfSrc.split(NL).map(l => l.replace(/(^|\s)#.*$/, '')).join(NL);
t('A6 回归克隆腿不带 core.symlinks=false（带则链接被物化成普通文件，遮住拒绝+披露路径）',
  wfCodeLines.indexOf('core.symlinks=false') < 0, '');
t('A7 回归克隆腿保留链接可见性断言（链接面不被静默降级）',
  wfSrc.includes('120000') && wfSrc.includes('symlink entries'), '');

const genSrc = txt(join(ENG, 'src', 'report', 'generate.ts'));
t('A8 引文/来源/披露块转义走单行化（多行引文不得跳出列表项与引用块）',
  /export function escapeMarkdownExcerptInline/.test(genSrc) &&
  /escapeMarkdownExcerptInline\(e\.excerpt\)/.test(genSrc), '');

// ---------- B. 安全读取单点行为 ----------
const safeModPath = distReady ? join(ENG, 'dist', 'audit', 'safe-read.js') : join(ENG, 'src', 'audit', 'safe-read.ts');
const SR = await import(pathToFileURL(safeModPath).href);

if (!symlinkProbe) {
  console.log('SKIP 113-check/B | env-missing:file-symlink 能力（Windows 未开开发者模式/权限不足）——' + 'B/C 组跳过，不计绿');
  console.log('GUARD-RESULT: SKIP-GROUP 113-check group=B reason=file-symlink-unavailable');
} else {
  const testTmp = fs.mkdtempSync(join(tmpdir(), '6f-113-test-'));
  try {
    const secret = join(testTmp, 'secret.txt');
    fs.writeFileSync(secret, 'SECRET_SUPER_CONFIDENTIAL_KEY' + NL, 'utf8');
    const outsideDir = join(testTmp, 'outside-adrs');
    fs.mkdirSync(outsideDir, { recursive: true });
    const outsideAdr = join(outsideDir, '0001-outside.md');
    fs.writeFileSync(outsideAdr, '# ADR-0001: outside' + NL, 'utf8');
    const insideDir = join(testTmp, 'repo', 'docs', 'adr');
    fs.mkdirSync(insideDir, { recursive: true });

    // 仓内常规文件
    fs.writeFileSync(join(insideDir, '0001-in.md'), '# ADR-0001: in' + NL, 'utf8');
    const okRead = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/adr/0001-in.md');
    t('B1 仓内常规文件放行', okRead.ok === true && okRead.text.indexOf('ADR-0001') >= 0, '');

    // 仓外文件链接
    fs.symlinkSync(secret, join(insideDir, '0002-evil.md'), 'file');
    const evil = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/adr/0002-evil.md');
    t('B2 指向仓外文件的符号链接被拒（reason=symlink-outside）',
      evil.ok === false && evil.reason === 'symlink-outside', evil.reason);

    // 悬空链接（能力门控：该平台建不出悬空链接就跳过该组，绝不硬造）
    if (linkCap.dangling) {
      fs.symlinkSync(join(testTmp, 'does-not-exist.md'), join(insideDir, '0003-dangling.md'), 'file');
      const dangling = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/adr/0003-dangling.md');
      t('B3 悬空符号链接被拒且 reason 单列（symlink-dangling，不与「不存在」混判）',
        dangling.ok === false && dangling.reason === 'symlink-dangling', dangling.reason);
    } else {
      console.log('SKIP 113-check/B3 | env-missing:dangling-symlink——悬空链接不可建，本组跳过不计绿');
      console.log('GUARD-RESULT: SKIP-GROUP 113-check group=B3 reason=dangling-symlink-unavailable');
    }

    // 仓内目录链接：允许（链接目标仍在仓内）——目录链接须显式指定类型（Windows 上不指定会落到 file 型）
    if (linkCap.dir) {
      fs.symlinkSync(insideDir, join(testTmp, 'repo', 'docs', 'adr-inside-link'), 'dir');
      const insideLink = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/adr-inside-link/0001-in.md');
      t('B4 指向仓内目录的链接放行（边界判仓内/仓外，不按链接形态一刀切）', insideLink.ok === true, insideLink.ok ? '' : insideLink.reason);
    } else {
      console.log('SKIP 113-check/B4 | env-missing:dir-symlink——目录链接不可建，本组跳过不计绿');
      console.log('GUARD-RESULT: SKIP-GROUP 113-check group=B4 reason=dir-symlink-unavailable');
    }

    // 仓外目录链接／junction（Windows：junction 免开发者模式，故优先用它拿同一语义）
    const outsideLinkName = 'adr-junction';
    let outsideDirLinkMade = false;
    if (linkCap.junction) { fs.symlinkSync(outsideDir, join(testTmp, 'repo', 'docs', outsideLinkName), 'junction'); outsideDirLinkMade = true; }
    else if (linkCap.dir) { fs.symlinkSync(outsideDir, join(testTmp, 'repo', 'docs', outsideLinkName), 'dir'); outsideDirLinkMade = true; }
    const junction = outsideDirLinkMade
      ? SR.readRepoDirSafe(join(testTmp, 'repo'), 'docs/' + outsideLinkName)
      : { ok: false, reason: 'env-missing' };
    t('B5 指向仓外的目录链接/junction 拒绝（reason=dir-junction-outside）',
      outsideDirLinkMade ? (junction.ok === false && junction.reason === 'dir-junction-outside') : true,
      outsideDirLinkMade ? junction.reason : 'junction-unsupported-skipped');
    const junctionRead = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/' + outsideLinkName + '/0001-outside.md');
    t('B6 经仓外目录链接读文件同样被拒（不靠调用方各自判）', junctionRead.ok === false, junctionRead.reason);

    // 列目录单点与 ADR 文件名口径
    const listing = SR.listAdrFilesSafe(join(testTmp, 'repo'), 'docs/adr');
    t('B7 列目录单点只出仓内 ADR 语料（bad 链接文件也在列——由读取单点逐件拒绝并披露）',
      listing.ok === true && listing.files.indexOf('0001-in.md') >= 0 && listing.files.indexOf('0002-evil.md') >= 0, '');
    const outsideListing = SR.listAdrFilesSafe(join(testTmp, 'repo'), 'docs/' + outsideLinkName);
    t('B8 列目录单点对仓外目录链接返回失败（不静默给空列）',
      outsideDirLinkMade ? (outsideListing.ok === false && outsideListing.reason === 'dir-junction-outside') : true,
      outsideDirLinkMade ? (outsideListing.ok ? 'unexpected-ok' : outsideListing.reason) : 'junction-unsupported-skipped');

    // 探测不了≠不存在（PR #127 审查）：ELOOP 自环在 POSIX 上可造，须报 read-error 且**不是** missing。
    if (linkCap.file) {
      try {
        fs.symlinkSync(join(testTmp, 'repo', 'docs', 'self-loop.md'), join(testTmp, 'repo', 'docs', 'self-loop.md'), 'file');
      } catch { /* ELOOP 建不出来就算了，下面的断言跳过 */ }
      const loopRead = SR.readRepoFileSafe(join(testTmp, 'repo'), 'docs/self-loop.md');
      const loopProbe = SR.probeRepoEntry(join(testTmp, 'repo'), 'docs/self-loop.md');
      t('B10 ELOOP 自环报拒绝（既不是 missing，也不被探针当 absent 静默吞掉）',
        loopRead.ok === false && loopRead.reason !== 'missing' && loopProbe !== 'absent',
        loopRead.ok ? 'unexpected-ok' : loopRead.reason + '/' + loopProbe);
    } else {
      skipGroup('B10', 'env-missing:file-symlink');
    }

    // 披露事实形状
    const ctx = { runId: 'r', traceId: 't', repoRef: 'x@y', scale: 'Macro-B', observedAt: '2026-01-01T00:00:00Z' };
    const f = SR.makeFileSubjectSkipFact(ctx, 'docs/adr/0002-evil.md', 'symlink-outside');
    const fv = JSON.parse(f.value_json);
    t('B9 披露事实 metric=codelore.file_subject_skip＋collector=audit-safe-read＋带 raw_path/reason',
      f.metric === 'codelore.file_subject_skip' && f.collector_id === 'audit-safe-read' &&
      fv.raw_path === 'docs/adr/0002-evil.md' && fv.reason === 'symlink-outside', '');
  } finally {
    try { fs.rmSync(testTmp, { recursive: true, force: true }); } catch { /* noop */ }
  }

  // ---------- C. 端到端（真实入口） ----------
  // C 组要同时具备两件：构建产物（入口可跑）＋原生绑定（duckdb 落库面）。
  //   engine/dist 是入库产物——只查 distReady 时 ci-shallow（无 node_modules）会「看起来能跑」，
  //   随后 C0/C1/C8 断言入口产物存在即红；故整组按两件能力门控，缺一即组级 SKIP（不假绿也不假红）。
  if (!distReady || !exists(join(ENG, 'dist', 'audit', 'macro-b.js'))) {
    skipGroup('C', 'env-missing:engine-dist（先 cd engine && npm run build）');
  } else if (!duckdbReady) {
    skipGroup('C', 'env-missing:engine-deps:@duckdb/node-api（C 组全部入口都要落库面）');
  } else {
    const e2eTmp = fs.mkdtempSync(join(tmpdir(), '6f-113-e2e-'));
    const gitArgs = (cwd, args) => ['-C', cwd].concat(args);
    const git = (cwd, args) => spawnSync('git', gitArgs(cwd, args), { encoding: 'utf8' });
    try {
      const OUTSIDE = join(e2eTmp, 'outside');
      fs.mkdirSync(OUTSIDE, { recursive: true });
      const SECRET = '-----BEGIN FAKE PRIVATE KEY-----' + NL + 'FAKESECRET-' + String(process.pid) + NL;
      fs.writeFileSync(join(OUTSIDE, 'secret.txt'), SECRET, 'utf8');

      // ---- C1/C2：文件级符号链接合成仓（3 份仓内贫瘠 ADR + 5 份仓外完整 ADR + 1 份悬空 + 越界意图文档）----
      const repoA = join(e2eTmp, 'repoA');
      fs.mkdirSync(join(repoA, 'docs', 'adr'), { recursive: true });
      git(repoA, ['init', '-q', '.']);
      git(repoA, ['config', 'user.email', 'guard@test.local']);
      git(repoA, ['config', 'user.name', 'guard']);
      const POOR = '# ADR-0001: Poor ADR' + NL + '## Status' + NL + 'accepted' + NL + '## Context' + NL + 'some context' + NL;
      for (const n of ['0001', '0002', '0003']) { fs.writeFileSync(join(repoA, 'docs', 'adr', n + '-poor.md'), POOR, 'utf8'); }
      fs.writeFileSync(join(repoA, 'README.md'), '# Synth Repo' + NL, 'utf8');
      fs.writeFileSync(join(repoA, 'package.json'), '{"name":"synth"}' + NL, 'utf8');
      git(repoA, ['add', '-A']);
      git(repoA, ['commit', '-qm', 'init poor adrs']);

      // 基线：注入前先跑一次（同一条命令，只差链接是否在场）——判据翻转的对照臂
      const runAudit = (repo, outDir, scale) => spawnSync('node',
        [CLI, 'audit', repo, '--scale', scale, '--out', outDir, '--json'],
        { encoding: 'utf8', timeout: 300000, cwd: e2eTmp });
      const readFacts = outDir => {
        const p = join(outDir, 'audit-facts.jsonl');
        if (!exists(p)) { return []; }
        return txt(p).split(NL).filter(l => l.trim().length > 0).map(l => JSON.parse(l));
      };
      const baselineOut = join(e2eTmp, 'out-baseline');
      const rBase = runAudit(repoA, baselineOut, 'Macro-B');
      const baseFacts = readFacts(baselineOut);
      const baseTc2 = baseFacts.filter(f => f.metric === 'adr.five_piece_completeness');
      t('C0 基线段可跑（audit 一等命令 exit=0 且产出 facts.jsonl）',
        rBase.status === 0 && baseFacts.length > 0, 'exit=' + String(rBase.status) + ' facts=' + String(baseFacts.length));

      // 注入：仓外文件链接、悬空链接、仓外目录链接、越界意图文档链接
      fs.symlinkSync(join(OUTSIDE, 'secret.txt'), join(repoA, 'docs', 'adr', '0004-evil.md'), 'file');
      for (const n of ['0005', '0006', '0007', '0008', '0009']) {
        const p = join(OUTSIDE, n + '-rich.md');
        fs.writeFileSync(p, '# ADR-' + n + ': Rich' + NL + '## Status' + NL + 'accepted' + NL + '## Context' + NL + 'ctx'
          + NL + '## Decision' + NL + 'dec' + NL + '## Consequences' + NL + 'cons' + NL, 'utf8');
        fs.symlinkSync(p, join(repoA, 'docs', 'adr', n + '-rich.md'), 'file');
      }
      // 悬空链接单列（能力门控：Windows 上悬空目标建链可能直接失败——不可建则本断言不成立，跳过并留痕）
      if (linkCap.dangling) { fs.symlinkSync(join(OUTSIDE, 'nope.md'), join(repoA, 'docs', 'adr', '0010-dangling.md'), 'file'); }
      fs.symlinkSync(join(OUTSIDE, 'secret.txt'), join(repoA, 'AGENTS.md'), 'file');

      const attackOut = join(e2eTmp, 'out-attack');
      const rAttack = runAudit(repoA, attackOut, 'Macro-B');
      t('C1 攻击段可跑（exit=0）', rAttack.status === 0, 'exit=' + String(rAttack.status));
      const attackFacts = readFacts(attackOut);
      const skips = attackFacts.filter(f => f.metric === 'codelore.file_subject_skip' && f.collector_id === 'audit-safe-read');
      const skipPaths = skips.map(f => JSON.parse(f.value_json).raw_path);
      const adrSkips = skipPaths.filter(p => p.indexOf('docs/adr/') === 0);
      const expectedMin = linkCap.dangling ? 7 : 6;   // 6 越界（密钥样＋5 完整仓外 ADR）＋1 悬空
      t('C2 持久化事实里存在披露事实（docs/adr 下越界/悬空链接逐件拒绝）',
        adrSkips.length >= expectedMin, 'n=' + String(adrSkips.length) + ' expected>=' + String(expectedMin));
      t('C3 悬空链接单列 reason=symlink-dangling（不被 existsSync 静默吞掉）',
        !linkCap.dangling || skips.some(f => JSON.parse(f.value_json).raw_path === 'docs/adr/0010-dangling.md'
          && JSON.parse(f.value_json).reason === 'symlink-dangling'), linkCap.dangling ? '' : 'dangling-symlink-unavailable');
      t('C4 越界意图文档链接也被拒并披露（AGENTS.md→仓外）',
        skips.some(f => JSON.parse(f.value_json).raw_path === 'AGENTS.md'), '');

      // 仓外内容不得出现在任何产物里（report.md / facts.jsonl / facts.duckdb 三面）
      const artifacts = fs.readdirSync(attackOut);
      const leaked = artifacts.filter(a => a.endsWith('.md') || a.endsWith('.jsonl') || a.endsWith('.duckdb'))
        .filter(a => {
          const p = join(attackOut, a);
          try {
            const buf = fs.readFileSync(p);
            return buf.indexOf('FAKE PRIVATE KEY') >= 0 || buf.indexOf('ADR-0005: Rich') >= 0;
          } catch { return false; }
        });
      t('C5 报告/事实库/duckdb 均不含仓外内容（三面逐件扫）', leaked.length === 0, 'leaked=' + leaked.join(','));

      // 报告披露块如实写明跳过数与路径
      const mdA = artifacts.filter(a => a.endsWith('.md')).map(a => txt(join(attackOut, a))).join(NL);
      t('C6 报告 limitations 如实披露「语料来源经链接解析被拒」并带跳过计数',
        mdA.indexOf('语料来源经链接解析被拒') >= 0 && /跳过 \d+ 处不可信文件/.test(mdA), '');

      // TC-2 判据防翻转：AD 语料恒为仓内 3 份；注入 5 份完整仓外 ADR 前后 verdict/total 不变
      const baseFive = baseTc2.length;
      const attackFive = attackFacts.filter(f => f.metric === 'adr.five_piece_completeness');
      const baseMean = baseFive === 0 ? 0 : baseTc2.reduce((s, f) => s + JSON.parse(f.value_json).ratio, 0) / baseFive;
      const attackMean = attackFive.length === 0 ? 0 : attackFive.reduce((s, f) => s + JSON.parse(f.value_json).ratio, 0) / attackFive.length;
      const baseRed = baseMean < 0.6;
      const attackRed = attackMean < 0.6;
      t('C7 TC-2 判据防翻转：注入 5 份完整仓外 ADR 前后均 RED、语料数恒 3（mean 不变）',
        baseFive === 3 && attackFive.length === 3 && baseRed && attackRed &&
        Math.abs(baseMean - attackMean) < 1e-9,
        'base=' + String(baseFive) + '/' + baseMean.toFixed(4) + ' attack=' + String(attackFive.length) + '/' + attackMean.toFixed(4));

      // ---- C8/C9：39 one-shot（CI 实跑脚本）同一条链 ----
      const oneShotOut = join(e2eTmp, 'out-oneshot');
      fs.mkdirSync(oneShotOut, { recursive: true });
      const r39 = spawnSync('node', [join(ENG, 'scripts', '39-macro-b-one-shot.mjs'),
        '--repo', 'synthA', '--root', repoA, '--out', oneShotOut],
      { encoding: 'utf8', timeout: 300000, cwd: e2eTmp });
      const facts39Path = join(oneShotOut, '39-macro-b-synthA-facts.jsonl');
      const facts39 = exists(facts39Path) ? txt(facts39Path).split(NL).filter(l => l.trim().length > 0).map(l => JSON.parse(l)) : [];
      const skips39 = facts39.filter(f => f.metric === 'codelore.file_subject_skip' && f.collector_id === 'audit-safe-read');
      t('C8 39 one-shot 退出 0 且把拒绝输入落成披露事实（不再静默丢弃）',
        r39.status === 0 && skips39.length >= 7, 'exit=' + String(r39.status) + ' skips=' + String(skips39.length));
      const md39Path = join(oneShotOut, '39-macro-b-synthA.md');
      const md39 = exists(md39Path) ? txt(md39Path) : '';
      t('C9 39 one-shot 报告披露块写明跳过语料（与 audit 面同文案口径）',
        md39.indexOf('语料来源经链接解析被拒') >= 0, '');
      t('C10 39 one-shot 产物不含仓外内容',
        facts39.every(f => f.value_json.indexOf('FAKE PRIVATE KEY') < 0) && md39.indexOf('FAKE PRIVATE KEY') < 0, '');

      // ---- C11/C12：目录 junction 合成仓（docs/adr 整体指向仓外目录）----
      const repoB = join(e2eTmp, 'repoB');
      fs.mkdirSync(join(repoB, 'docs'), { recursive: true });
      git(repoB, ['init', '-q', '.']);
      git(repoB, ['config', 'user.email', 'guard@test.local']);
      git(repoB, ['config', 'user.name', 'guard']);
      fs.writeFileSync(join(repoB, 'README.md'), '# Repo B' + NL, 'utf8');
      fs.writeFileSync(join(repoB, 'package.json'), '{"name":"b"}' + NL, 'utf8');
      git(repoB, ['add', '-A']);
      git(repoB, ['commit', '-qm', 'init']);
      const JUNC_OUTSIDE = join(e2eTmp, 'outside-adr-dir');
      fs.mkdirSync(JUNC_OUTSIDE, { recursive: true });
      for (const n of ['0001', '0002', '0003']) {
        fs.writeFileSync(join(JUNC_OUTSIDE, n + '-outside.md'),
          '# ADR-' + n + ': Outside' + NL + '- Status: accepted' + NL + '- Date: 2026-01-0' + n.slice(-1) + NL
          + '## Context' + NL + 'c' + NL + '## Decision' + NL + 'd' + NL + '## Consequences' + NL + 'q' + NL, 'utf8');
      }
      // 目录链接/junction：Windows 上 junction 免开发者模式——能力优先，形态不改变被测语义（都指向仓外目录）
      const dirLinkKind = linkCap.junction ? 'junction' : (linkCap.dir ? 'dir' : null);
      if (dirLinkKind === null) { throw new Error('ENV-SKIP:dir-link-unavailable'); }
      fs.symlinkSync(JUNC_OUTSIDE, join(repoB, 'docs', 'adr'), dirLinkKind);
      const juncOut = join(e2eTmp, 'out-junction');
      const rJunc = runAudit(repoB, juncOut, 'Macro-C');
      const juncFacts = readFacts(juncOut);
      const juncSkips = juncFacts.filter(f => f.metric === 'codelore.file_subject_skip' && f.collector_id === 'audit-safe-read');
      t('C11 目录 junction：docs/adr 整体被拒并披露 reason=dir-junction-outside',
        rJunc.status === 0 && juncSkips.some(f => JSON.parse(f.value_json).raw_path === 'docs/adr'
          && JSON.parse(f.value_json).reason === 'dir-junction-outside'), 'exit=' + String(rJunc.status));
      const juncMd = fs.readdirSync(juncOut).filter(a => a.endsWith('.md')).map(a => txt(join(juncOut, a))).join(NL);
      t('C12 目录 junction：仓外 ADR 未进报告（零 outside 语料）且 PC-MC-1 不因 skip 事实转阳性',
        juncMd.indexOf('ADR-0001: Outside') < 0 &&
        /PC-MC-1: (insufficient|unsupported)/.test(juncMd), '');

      // ---- C14：defer 注册表链接不得把 defer-ref 边「解」成 resolved（TC-MC-1 由 insufficient 翻 supported）----
      //   形态：仓内 ADR 正文写 `References: defer-001`，仓根挂 docs/deferred-registry.json → 仓外文件。
      //   旧实现 existsSync 跟随链接 ⇒ deferRegistryPresent=true ⇒ 全部 defer-ref 边 resolved ⇒ TC-MC-1 supported。
      const repoD = join(e2eTmp, 'repoD');
      fs.mkdirSync(join(repoD, 'docs', 'adr'), { recursive: true });
      git(repoD, ['init', '-q', '.']);
      git(repoD, ['config', 'user.email', 'guard@test.local']);
      git(repoD, ['config', 'user.name', 'guard']);
      fs.writeFileSync(join(repoD, 'docs', 'adr', '0001-defer.md'),
        '# ADR-0001: Defer' + NL + '## Status' + NL + 'accepted' + NL + '## Context' + NL + 'c' + NL
        + '## Decision' + NL + 'd' + NL + '## Consequences' + NL + 'q' + NL + 'References: defer-001' + NL, 'utf8');
      fs.writeFileSync(join(repoD, 'README.md'), '# Repo D' + NL, 'utf8');
      fs.writeFileSync(join(repoD, 'package.json'), '{"name":"d"}' + NL, 'utf8');
      git(repoD, ['add', '-A']);
      git(repoD, ['commit', '-qm', 'init defer adr']);
      const DEFER_OUTSIDE = join(e2eTmp, 'outside-registry.json');
      fs.writeFileSync(DEFER_OUTSIDE, '{"deferred":[]}' + NL, 'utf8');
      fs.symlinkSync(DEFER_OUTSIDE, join(repoD, 'docs', 'deferred-registry.json'), 'file');
      const deferOut = join(e2eTmp, 'out-defer');
      const rDefer = runAudit(repoD, deferOut, 'Macro-C');
      const deferFacts = readFacts(deferOut);
      const deferSkips = deferFacts.filter(f => f.metric === 'codelore.file_subject_skip'
        && JSON.parse(f.value_json).raw_path === 'docs/deferred-registry.json');
      const deferChain = deferFacts.filter(f => f.metric === 'adr.supersede_chain_summary')
        .map(f => JSON.parse(f.value_json))[0];
      // 链摘要不带明细 edges；以 defer_ref_edges＋unresolved_refs 判定：注册表在册时 defer-ref 边全 resolved
      //   （unresolved_refs 里不出现 defer-ref），被拒时必须仍为未解析。
      const deferUnresolved = deferChain && Array.isArray(deferChain.unresolved_refs)
        ? deferChain.unresolved_refs.filter(r => String(r).indexOf('defer-ref') >= 0).length : -1;
      const deferEdgeN = deferChain ? deferChain.defer_ref_edges : -1;
      const deferMd = fs.readdirSync(deferOut).filter(a => a.endsWith('.md')).map(a => txt(join(deferOut, a))).join(NL);
      t('C14 defer 注册表仓外链接：拒绝并披露（defer-ref 边仍 unresolved——TC-MC-1 不因仓外文件转 supported）',
        rDefer.status === 0 && deferSkips.length === 1 && deferSkips[0].collector_id === 'audit-safe-read'
        && deferEdgeN === 1 && deferUnresolved === 1
        && /^- TC-MC-1: (insufficient|unsupported)/m.test(deferMd),
        'exit=' + String(rDefer.status) + ' skips=' + String(deferSkips.length)
          + ' deferEdges=' + String(deferEdgeN) + ' unresolvedDefer=' + String(deferUnresolved));

      // ---- C13：duckdb 落库面（原生绑定不在位即 SKIP，不假绿）----
      if (!duckdbReady) {
        console.log('SKIP 113-check/C13 | env-missing:engine-deps:@duckdb/node-api——duckdb 落库面跳过，不计绿');
        console.log('GUARD-RESULT: SKIP-GROUP 113-check group=C13 reason=engine-deps-missing');
      } else {
        const dbPath = join(attackOut, 'facts.duckdb');
        const probe = spawnSync(process.execPath, ['--input-type=module', '-e', `
          import { createRequire } from 'node:module';
          import { pathToFileURL } from 'node:url';
          const require = createRequire(${JSON.stringify(join(ENG, 'package.json'))});
          // 必须 pathToFileURL：Windows 上 new URL('C:\\x', 'file://') 得到的是 scheme=c: 的不透明 URL，import 必败。
          const { DuckDBInstance } = await import(pathToFileURL(require.resolve('@duckdb/node-api')).href);
          const inst = await DuckDBInstance.create(${JSON.stringify(dbPath)}, { access_mode: 'READ_ONLY' });
          const conn = await inst.connect();
          const rows = await (await conn.runAndReadAll(
            "SELECT COUNT(*) AS n FROM audit_fact WHERE metric = 'codelore.file_subject_skip'"
          )).getRows();
          console.log(JSON.stringify({ n: Number(rows[0][0]) }));
        `], { encoding: 'utf8', timeout: 120000 });
        let dbSkips = -1;
        try { dbSkips = JSON.parse((probe.stdout || '{}').trim().split(NL).pop()).n; } catch { dbSkips = -1; }
        t('C13 facts.duckdb 内同样落有披露事实（落库面与 JSONL 同源）',
          probe.status === 0 && dbSkips >= 7,
          'db_skips=' + String(dbSkips) + ' exit=' + String(probe.status)
            + (probe.status === 0 ? '' : ' stderr=' + String(probe.stderr || '').trim().split(NL).slice(-2).join(' ').slice(0, 300)));
      }
    } finally {
      try { fs.rmSync(e2eTmp, { recursive: true, force: true }); } catch { /* noop */ }
    }
  }
}

// ---------- D. 负对照（守卫自检：判据确实会红，不是恒真断言） ----------
// 在临时副本里用**旧行为**（裸 readFileSync 跟随链接）替换安全读取单点——端到端必须出现仓外内容/判据翻转，
// 否则说明 C 组断言与被测面脱节（恒真教训：Autonoma 恒真断言五形态，D-153②）。
if (distReady && symlinkProbe && duckdbReady) {
  const ctrlTmp = fs.mkdtempSync(join(tmpdir(), '6f-113-neg-'));
  try {
    const SECRET = '-----BEGIN FAKE PRIVATE KEY-----' + NL + 'NEGCTRL-' + String(process.pid) + NL;
    fs.writeFileSync(join(ctrlTmp, 'secret.txt'), SECRET, 'utf8');
    const repoC = join(ctrlTmp, 'repoC');
    fs.mkdirSync(join(repoC, 'docs', 'adr'), { recursive: true });
    spawnSync('git', ['-C', repoC, 'init', '-q', '.'], { encoding: 'utf8' });
    spawnSync('git', ['-C', repoC, 'config', 'user.email', 'guard@test.local'], { encoding: 'utf8' });
    spawnSync('git', ['-C', repoC, 'config', 'user.name', 'guard'], { encoding: 'utf8' });
    const POOR = '# ADR-0001: Poor ADR' + NL + '## Status' + NL + 'accepted' + NL + '## Context' + NL + 'some context' + NL;
    for (const n of ['0001', '0002', '0003']) { fs.writeFileSync(join(repoC, 'docs', 'adr', n + '-poor.md'), POOR, 'utf8'); }
    fs.writeFileSync(join(repoC, 'README.md'), '# Repo C' + NL, 'utf8');
    fs.writeFileSync(join(repoC, 'package.json'), '{"name":"c"}' + NL, 'utf8');
    spawnSync('git', ['-C', repoC, 'add', '-A'], { encoding: 'utf8' });
    spawnSync('git', ['-C', repoC, 'commit', '-qm', 'init'], { encoding: 'utf8' });
    fs.symlinkSync(join(ctrlTmp, 'secret.txt'), join(repoC, 'docs', 'adr', '0004-evil.md'), 'file');
    for (const n of ['0005', '0006', '0007', '0008', '0009']) {
      const p = join(ctrlTmp, n + '-rich.md');
      fs.writeFileSync(p, '# ADR-' + n + ': Rich' + NL + '## Status' + NL + 'accepted' + NL + '## Context' + NL + 'ctx'
        + NL + '## Decision' + NL + 'dec' + NL + '## Consequences' + NL + 'cons' + NL, 'utf8');
      fs.symlinkSync(p, join(repoC, 'docs', 'adr', n + '-rich.md'), 'file');
    }

    // 复制 engine 到临时目录，把安全读取单点换成「旧行为」实现（仅供本负对照使用，不落主仓）
    // 临时 engine 副本：dist（含**未打包**的 dist/audit/safe-read.js，39 one-shot 直接 import 它）＋scripts＋
    // package.json＋node_modules 软链。不复制 fixtures（十几 MB），也不打新包——负对照只替换读取单点本身。
    const engCopy = join(ctrlTmp, 'engine');
    fs.mkdirSync(engCopy, { recursive: true });
    fs.cpSync(join(ENG, 'dist'), join(engCopy, 'dist'), { recursive: true });
    fs.cpSync(join(ENG, 'scripts'), join(engCopy, 'scripts'), { recursive: true });
    fs.copyFileSync(join(ENG, 'package.json'), join(engCopy, 'package.json'));
    // node_modules 用 junction（Windows 免开发者模式）优先，退回目录符号链接；两者都不可建则整组跳过。
    let nmLinked = true;
    try { fs.symlinkSync(join(ENG, 'node_modules'), join(engCopy, 'node_modules'), linkCap.junction ? 'junction' : 'dir'); }
    catch { nmLinked = false; }
    // 39 脚本读预声明阈值夹具（REPO 推算为 engine 副本的父目录）——只补这一件，不搬整个 fixtures 面。
    fs.mkdirSync(join(engCopy, 'test', 'fixtures', 'contracts'), { recursive: true });
    fs.copyFileSync(join(ENG, 'test', 'fixtures', 'contracts', '22-threshold-raw.json'),
      join(engCopy, 'test', 'fixtures', 'contracts', '22-threshold-raw.json'));
    // 39 的 EV-39-07 引文锚读仓库根 docs/spec.md（REPO 推算为 engine 副本的父目录）——同样只补这一件。
    fs.mkdirSync(join(engCopy, '..', 'docs'), { recursive: true });
    fs.copyFileSync(join(ROOT, 'docs', 'spec.md'), join(engCopy, '..', 'docs', 'spec.md'));
    // 旧行为实现（=本票要修掉的形态）：不做 lstat 非链接判定、不做 realpath 判界，直接跟随链接读。
    fs.writeFileSync(join(engCopy, 'dist', 'audit', 'safe-read.js'), [
      "import { readFileSync, statSync, readdirSync } from 'node:fs';",
      "import { join, relative, resolve, isAbsolute } from 'node:path';",
      "import { createHash } from 'node:crypto';",
      "export const AUDIT_DESCRIPTOR = { id: 'audit-safe-read', family: 'audit', dimension: 'S2', quadrant: 'strategic' };",
      "export function isPathContainedInRepo() { return true; }",
      "export function readRepoFileSafe(repoRoot, relOrAbsPath) {",
      "  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);",
      "  const normRel = relative(repoRoot, abs).split(String.fromCharCode(92)).join('/');",
      "  try { return { ok: true, text: readFileSync(abs, 'utf8'), relPath: normRel, realPath: abs, isSymlink: false }; }",
      "  catch { return { ok: false, reason: 'missing', relPath: normRel }; }",
      "}",
      "export function readRepoDirSafe(repoRoot, relOrAbsPath) {",
      "  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);",
      "  const normRel = relative(repoRoot, abs).split(String.fromCharCode(92)).join('/');",
      "  try { return { ok: true, relPath: normRel, realPath: abs, isSymlink: false, entries: readdirSync(abs).slice().sort() }; }",
      "  catch { return { ok: false, reason: 'missing', relPath: normRel }; }",
      "}",
      "export function listAdrFilesSafe(repoRoot, relDir) {",
      "  const d = readRepoDirSafe(repoRoot, relDir);",
      "  if (!d.ok) { return { ok: false, reason: d.reason, relPath: d.relPath }; }",
      "  return { ok: true, files: d.entries.filter(f => /^\\d{3,}.*\\.md$/i.test(f)).sort() };",
      "}",
      "export function probeRepoEntry(repoRoot, relOrAbsPath) {",
      "  const abs = isAbsolute(relOrAbsPath) ? resolve(relOrAbsPath) : resolve(repoRoot, relOrAbsPath);",
      "  try { const st = statSync(abs); return st.isFile() ? 'file' : (st.isDirectory() ? 'dir' : 'other'); }",
      "  catch { return 'absent'; }",
      "}",
      "export function makeFileSubjectSkipFact(ctx, rawPath, reason) {",
      "  const valueJson = JSON.stringify({ analysis: 'safe-read', group: 'security', raw_path: rawPath, reason: reason });",
      "  const h = createHash('sha256').update([rawPath, reason].join('|')).digest('hex');",
      "  return { fact_id: [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20,32)].join('-'),",
      "    trace_id: ctx.traceId, baggage_id: h.slice(0, 32), scale: ctx.scale, quadrant: 'strategic',",
      "    dimension: 'S2', collector_id: 'audit-safe-read', repo_ref: ctx.repoRef, subject_ref: rawPath,",
      "    evidence_ref: 'safe-read-probe', metric: 'codelore.file_subject_skip', value_json: valueJson, observed_at: ctx.observedAt };",
      "}",
      "export const __negctrl = join;",
      ''
    ].join(NL), 'utf8');

    if (!nmLinked) { throw new Error('ENV-SKIP:dir-link-unavailable'); }
    const negOut = join(ctrlTmp, 'out-neg');
    fs.mkdirSync(negOut, { recursive: true });
    const rNeg = spawnSync('node', [join(engCopy, 'scripts', '39-macro-b-one-shot.mjs'),
      '--repo', 'negctrl', '--root', repoC, '--out', negOut],
    { encoding: 'utf8', timeout: 300000, cwd: ctrlTmp });
    const negFactsPath = join(negOut, '39-macro-b-negctrl-facts.jsonl');
    const negFacts = exists(negFactsPath) ? txt(negFactsPath).split(NL).filter(l => l.trim().length > 0).map(l => JSON.parse(l)) : [];
    const negFive = negFacts.filter(f => f.metric === 'adr.five_piece_completeness');
    const negSkips = negFacts.filter(f => f.metric === 'codelore.file_subject_skip' && f.collector_id === 'audit-safe-read');
    t('D4 负对照（旧行为替换读取单点，走真实 one-shot 入口）：拒绝+披露面整体消失（0 条 skip 事实）——C2/C8 不是恒真',
      rNeg.status === 0 && negSkips.length === 0,
      'exit=' + String(rNeg.status) + ' skips=' + String(negSkips.length)
        + ' stdout=' + String(rNeg.stdout || '').slice(-200));
    t('D5 负对照（判据翻转面）：旧行为下 ADR 语料由 3 涨到 9（3 贫瘠＋1 仓外密钥样＋5 仓外完整）——C7 的「恒 3」不是恒真',
      negFive.length === 9, 'five=' + String(negFive.length));
  } finally {
    try { fs.rmSync(ctrlTmp, { recursive: true, force: true }); } catch { /* noop */ }
  }
} else {
  console.log('SKIP 113-check/D4-D5 | env-missing:dist/symlink/engine-deps——负对照组跳过，不计绿');
  console.log('GUARD-RESULT: SKIP-GROUP 113-check group=D4 reason=capability-unavailable');
}

// ---------- E. 卫生规范 ----------
t('E1 safe-read.ts 无 BOM', !txt(join(ENG, 'src', 'audit', 'safe-read.ts')).startsWith('\uFEFF'), '');
t('E2 113-check.mjs 自身无 BOM', !txt(join(HERE, '113-check.mjs')).startsWith('\uFEFF'), '');
t('E3 主仓工作区未被守卫写入（守卫只写 OS temp）', !exists(join(ENG, 'audit-facts.jsonl')), '');

} catch (e) {
  // 崩溃同样要能被 CI 侧看见（否则只有一句 exit code 1）——ENV-SKIP 走 SKIP 语义，其余算红。
  const msg = String(e && e.message ? e.message : e);
  if (msg.indexOf('ENV-SKIP:') === 0) {
    skipGroup('C-D-e2e', msg.slice('ENV-SKIP:'.length));
  } else {
    console.log('FAIL 113-check 未捕获异常: ' + msg);
    console.log('::error title=113-check::CRASH ' + msg.slice(0, 900));
    console.log((L => L)(e && e.stack ? String(e.stack).slice(0, 1500) : ''));
    fail += 1;
    failedNames.push('crash:' + msg.slice(0, 200));
  }
}

console.log(`${NL}--- 113-check summary: ${pass} passed, ${fail} failed ---`);
if (fail > 0) {
  // Actions 注解（本地跑只是一行原文）：CI 上失败项直接进 check-run annotation，不必翻整段日志。
  console.log('::error title=113-check::' + String(fail) + ' failed: ' + failedNames.join(' | ').slice(0, 900));
  process.exit(1);
}
