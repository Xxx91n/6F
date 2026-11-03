// 113-check.mjs —— #113 审计对象仓符号链接与路径穿透安全防护守卫
// 验证 Acceptance criteria：
//   1. 含文件级符号链接的合成仓：audit report / facts 均不含仓外内容，且发射 file_subject_skip 披露事实；
//   2. 含 docs/adr 目录 junction 的合成仓：不纳入仓外 ADR，产出披露事实；
//   3. 同一组合成仓（对照 3 份 + 注入 5 份）的 TC-2 verdict 恒为 RED，不随链接注入变化（钉死判据翻转回归面）；
//   4. .github/workflows/macro-b-regression.yml 的 clone 步包含 core.symlinks=false；
//   5. 守卫卫生：新增文件无 BOM。
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

// guard-meta（D-159②/D-160③ 自声明）
const TIER = 'portable';
const PROTECTED_SURFACE = '#113 审计对象仓符号链接安全防护——不可信输入边界贯穿与判据翻转防护';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const ENG = join(ROOT, 'engine');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : ''));
  if (ok) pass++; else fail++;
};
const txt = p => fs.readFileSync(p, 'utf8');
const exists = p => fs.existsSync(p);

// ---------- A. 静态源码断言 ----------
const safeSrc = exists(join(ENG, 'src', 'audit', 'safe-read.ts')) ? txt(join(ENG, 'src', 'audit', 'safe-read.ts')) : '';
t('A1 safe-read.ts 模块存在并导出 readRepoFileSafe / isPathContainedInRepo / makeFileSubjectSkipFact',
  /export function readRepoFileSafe/.test(safeSrc) &&
  /export function isPathContainedInRepo/.test(safeSrc) &&
  /export function makeFileSubjectSkipFact/.test(safeSrc), '');

const mbSrc = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('A2 macro-b.ts 接入 safe-read 且包含 junction/symlink 拦截与 skipFacts',
  mbSrc.includes('readRepoFileSafe') && mbSrc.includes('isPathContainedInRepo') && mbSrc.includes('makeFileSubjectSkipFact'), '');

const mcSrc = txt(join(ENG, 'src', 'audit', 'macro-c.ts'));
t('A3 macro-c.ts 接入 safe-read 且包含 junction/symlink 拦截与 skipFacts',
  mcSrc.includes('readRepoFileSafe') && mcSrc.includes('isPathContainedInRepo') && mcSrc.includes('makeFileSubjectSkipFact'), '');

const auditSrc = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('A4 audit.ts pickExcerpt 接入 safe-read 并在 limitations 披露语料链接解析跳过',
  auditSrc.includes('readRepoFileSafe') && auditSrc.includes('语料来源经链接解析被拒'), '');

const wfSrc = txt(join(ROOT, '.github', 'workflows', 'macro-b-regression.yml'));
t('A5 macro-b-regression.yml clone 步包含 -c core.symlinks=false',
  wfSrc.includes('core.symlinks=false'), '');

// ---------- B. safe-read 行为实测（支持 dist 与 src 回退） ----------
const testTmp = fs.mkdtempSync(join(tmpdir(), '6f-113-test-'));
try {
  const fakeSecret = join(testTmp, 'secret.txt');
  fs.writeFileSync(fakeSecret, 'SECRET_SUPER_CONFIDENTIAL_KEY\n', 'utf8');

  const fakeRepo = join(testTmp, 'fake-repo');
  fs.mkdirSync(join(fakeRepo, 'docs', 'adr'), { recursive: true });

  execFileSync('git', ['init', fakeRepo], { stdio: 'ignore' });
  execFileSync('git', ['-C', fakeRepo, 'config', 'user.name', 'test'], { stdio: 'ignore' });
  execFileSync('git', ['-C', fakeRepo, 'config', 'user.email', 'test@test.local'], { stdio: 'ignore' });

  const ADR_POOR = `# ADR-0001: Poor ADR
## Status
accepted
## Context
some context
`;
  fs.writeFileSync(join(fakeRepo, 'docs', 'adr', '0001-poor.md'), ADR_POOR, 'utf8');
  fs.writeFileSync(join(fakeRepo, 'docs', 'adr', '0002-poor.md'), ADR_POOR, 'utf8');
  fs.writeFileSync(join(fakeRepo, 'docs', 'adr', '0003-poor.md'), ADR_POOR, 'utf8');
  fs.writeFileSync(join(fakeRepo, 'README.md'), '# Fake Repo\n', 'utf8');

  execFileSync('git', ['-C', fakeRepo, 'add', '.'], { stdio: 'ignore' });
  execFileSync('git', ['-C', fakeRepo, 'commit', '-m', 'initial poor adrs'], { stdio: 'ignore' });

  try {
    fs.symlinkSync(fakeSecret, join(fakeRepo, 'docs', 'adr', '0004-evil.md'));
  } catch (e) {}

  const safeModPath = exists(join(ENG, 'dist', 'audit', 'safe-read.js'))
    ? join(ENG, 'dist', 'audit', 'safe-read.js')
    : join(ENG, 'src', 'audit', 'safe-read.ts');
  const { readRepoFileSafe, isPathContainedInRepo, makeFileSubjectSkipFact } = await import(pathToFileURL(safeModPath).href);

  const poorRead = readRepoFileSafe(fakeRepo, 'docs/adr/0001-poor.md');
  t('B1 safe-read 允许仓内常规文件读取', poorRead.ok === true && poorRead.text.includes('Poor ADR'), '');

  const evilRead = readRepoFileSafe(fakeRepo, 'docs/adr/0004-evil.md');
  t('B2 safe-read 拒绝指向仓外的符号链接', evilRead.ok === false && evilRead.reason === 'symlink-outside', evilRead.reason);

  const outsideDir = join(testTmp, 'outside-adrs');
  fs.mkdirSync(outsideDir, { recursive: true });
  const junctionJail = join(fakeRepo, 'docs', 'adr-junction');
  try {
    fs.symlinkSync(outsideDir, junctionJail, 'junction');
  } catch (e) {}

  t('B3 isPathContainedInRepo 拦截指向仓外的目录符号链接/junction',
    isPathContainedInRepo(fakeRepo, junctionJail) === false, '');

  // ---------- C. 验证 TC-2 判据防翻转 ----------
  for (let i = 5; i <= 9; i++) {
    const extAdr = join(outsideDir, `000${i}-rich.md`);
    fs.writeFileSync(extAdr, `# ADR-000${i}: Rich ADR\n## Status\naccepted\n## Context\nctx\n## Decision\ndec\n## Consequences\ncons\n`, 'utf8');
    try {
      fs.symlinkSync(extAdr, join(fakeRepo, 'docs', 'adr', `000${i}-rich.md`));
    } catch (e) {}
  }

  const oneShotScript = txt(join(ENG, 'scripts', '39-macro-b-one-shot.mjs'));
  t('C1 39-macro-b-one-shot.mjs 包含 readRepoFileSafe 安全读取逻辑',
    oneShotScript.includes('readRepoFileSafe') && oneShotScript.includes('isPathContainedInRepo'), '');

  const rawFiles = fs.readdirSync(join(fakeRepo, 'docs', 'adr')).filter(f => /^\d{3,}.*\.md$/i.test(f)).sort();
  const validDocs = [];
  const skipped = [];
  const ctx = {
    runId: 'test-run',
    traceId: 'trace0000000000000000000000000001',
    repoRef: 'fake-repo@head',
    scale: 'Macro-B',
    observedAt: '2026-10-30T00:00:00Z'
  };

  for (const f of rawFiles) {
    const rel = 'docs/adr/' + f;
    const r = readRepoFileSafe(fakeRepo, rel);
    if (!r.ok) {
      skipped.push(makeFileSubjectSkipFact(ctx, rel, r.reason));
    } else {
      validDocs.push({ path: rel, text: r.text });
    }
  }

  t('C2 仓外符号链接 ADR 全部被拦截 (skipped count >= 6)', skipped.length >= 6, `skipped=${skipped.length}`);
  t('C3 仅 3 份仓内合法 poor ADR 被纳入 (valid count == 3)', validDocs.length === 3, `valid=${validDocs.length}`);

  const colModPath = exists(join(ENG, 'dist', 'collect', 'collectors.js'))
    ? join(ENG, 'dist', 'collect', 'collectors.js')
    : join(ENG, 'src', 'collect', 'collectors.ts');
  const mbModPath = exists(join(ENG, 'dist', 'audit', 'macro-b.js'))
    ? join(ENG, 'dist', 'audit', 'macro-b.js')
    : join(ENG, 'src', 'audit', 'macro-b.ts');

  const { collectAdrStructureV2 } = await import(pathToFileURL(colModPath).href);
  const { evaluateMacroB } = await import(pathToFileURL(mbModPath).href);

  const adrFacts = collectAdrStructureV2({ documents: validDocs }, ctx);
  const colSim = {
    adrFiles: validDocs.map(d => d.path),
    intentDocs: [{ path: 'README.md', text: '# Fake Repo\n' }],
    nc1Path: 'README.md',
    adrFacts: adrFacts.concat(skipped),
    gitFacts: [],
    posFacts: [],
    codeloreFacts: [],
    fileLineageFacts: [],
    realFacts: adrFacts.concat(skipped),
    pc1: { pass: true },
    pc2: { pass: true, delta_days: 10 },
    nc1: { path: 'README.md', fact_count: 1, five_piece_present: 0, supersede_present: false, pass: true },
    pc1AdrFacts: [],
    pc1PosFacts: [],
    pc2Lag: [],
    nc1Facts: [],
    codeloreResolution: null
  };

  const evSim = evaluateMacroB(colSim);
  t('C4 TC-2 verdict 恒为 RED，不随 5 份注入 ADR 翻转', evSim.tc2.verdict === 'RED' && evSim.tc2.total === 3, `verdict=${evSim.tc2.verdict} total=${evSim.tc2.total} mean=${evSim.tc2.mean_ratio}`);
  t('C5 产出的 skip 事实包含 codelore.file_subject_skip',
    skipped.some(f => f.metric === 'codelore.file_subject_skip' && f.subject_ref.includes('0004-evil')), '');

} finally {
  try {
    fs.rmSync(testTmp, { recursive: true, force: true });
  } catch (e) {}
}

// ---------- D. 卫生规范 ----------
t('D1 safe-read.ts 无 BOM', !txt(join(ENG, 'src', 'audit', 'safe-read.ts')).startsWith('\uFEFF'), '');
t('D2 113-check.mjs 自身无 BOM', !txt(join(HERE, '113-check.mjs')).startsWith('\uFEFF'), '');

console.log(`\n--- 113-check summary: ${pass} passed, ${fail} failed ---`);
if (fail > 0) process.exit(1);
