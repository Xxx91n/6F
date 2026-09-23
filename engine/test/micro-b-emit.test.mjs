// micro-b-emit.test.mjs — #80 步① per-file 一等事实发射契约测试（D-124/D-125/ADR-0023）
// 断言面：A subject 归一器五规则+NFC+禁折叠 / B per-file 发射（行对象形态+role 标记+skip 披露+
//   case-only 冲突告警+成对端点双发射）/ C file_renamed 血缘（-z 解析+载荷五字段+e2e 真 git 可复算）/
//   D facet_rows raw 证据位+对账判据 / E golden 骨架锁（字段骨架非内容值）。
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const S = await import(pathToFileURL(join(root, 'dist', 'fact', 'subject.js')).href);
const C = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const FL = await import(pathToFileURL(join(root, 'dist', 'collect', 'file-lineage.js')).href);
const G = await import(pathToFileURL(join(root, 'scripts', 'gen-micro-b-emission-golden.mjs')).href);
const FX = join(HERE, 'fixtures', 'micro-b');

let n = 0;
const t = (name, fn) => { fn(); n++; };

// ---------- A. subject 归一器（SCIP 五规则 + NFC + 禁折叠） ----------
t('A1 反斜杠/重复斜杠/dot 段归一为 POSIX 形', () => {
  assert.equal(S.normalizeSubjectPath('src\\alpha.ts').subject, 'src/alpha.ts');
  assert.equal(S.normalizeSubjectPath('docs//adr//x.md').subject, 'docs/adr/x.md');
  assert.equal(S.normalizeSubjectPath('docs/./y.md').subject, 'docs/y.md');
  assert.equal(S.normalizeSubjectPath('./a.ts').subject, 'a.ts');
});
t('A2 dotdot/绝对路径/NUL/空串显式拒绝（reason 分类）', () => {
  assert.equal(S.normalizeSubjectPath('docs/../evil.md').reason, 'dotdot-segment');
  assert.equal(S.normalizeSubjectPath('/abs/x.ts').reason, 'absolute');
  assert.equal(S.normalizeSubjectPath('C:\\x.ts').reason, 'absolute');
  assert.equal(S.normalizeSubjectPath('\\\\srv\\x.ts').reason, 'absolute');
  assert.equal(S.normalizeSubjectPath('').reason, 'empty');
  assert.equal(S.normalizeSubjectPath('a\0b').reason, 'nul-byte');
});
t('A3 NFC 归一 + 禁大小写折叠（字面保留）', () => {
  const nfd = 'src/cafe\u0301.ts';
  assert.equal(S.normalizeSubjectPath(nfd).subject, 'src/caf\u00e9.ts');
  assert.ok(S.normalizeSubjectPath(nfd).warnings.includes('nfc-normalized'));
  assert.equal(S.normalizeSubjectPath('Src/A.ts').subject, 'Src/A.ts');   // 不折叠
});
t('A4 case-only 冲突检测=同桶多字面成对输出', () => {
  assert.deepEqual(S.detectCaseOnlyConflicts(['Src/A.ts', 'src/a.ts', 'b.ts']).pairs, [['Src/A.ts', 'src/a.ts']]);
  assert.deepEqual(S.detectCaseOnlyConflicts(['a.ts', 'b.ts']).pairs, []);
});

// ---------- B. per-file 发射（fixture 驱动，注入假探针） ----------
const input = JSON.parse(readFileSync(join(FX, 'emission-input.json'), 'utf8'));
const CTX = { runId: 'ut80', traceId: 't'.padEnd(32, '0'), repoRef: 'fixture@' + 'a'.repeat(40), scale: 'Macro-B', observedAt: '2026-09-23T00:00:00Z' };
const resolver = () => ({ strategy: 'binary-discovery', binary: 'fake', version: '0.28.0', pinned: true, error: null });
const rowMap = {};
for (const f of input.facets) { rowMap[f.analysis] = JSON.stringify(f.rows); }
const runner = (bin, spec) => ({ ok: true, status: 0, stdout: rowMap[spec.analysis] || '[]', stderrTail: '' });
const probe = (root, rel) => input.subject_probe[rel] || { kind: 'missing' };
const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver, runner, subjectProbe: probe, facets: input.facets }, CTX);
const fileFacts = facts.filter((f) => f.metric === 'codelore.file_facet_row');

t('B1 per-file 一等事实发射：subject_ref=规范化 path + value_json=per-path-face 行对象', () => {
  const subjects = fileFacts.map((f) => f.subject_ref);
  assert.ok(subjects.includes('src/alpha.ts'), 'backslash 归一');
  assert.ok(subjects.includes('docs/adr/x.md'), '// 归一');
  assert.ok(subjects.includes('docs/y.md'), './ 归一');
  assert.ok(subjects.includes('real/z.ts'), 'symlink 解析落仓内目标');
  const z = fileFacts.find((f) => f.subject_ref === 'real/z.ts');
  assert.equal(JSON.parse(z.value_json).via, 'symlink');
  const hf = fileFacts.filter((f) => JSON.parse(f.value_json).analysis === 'hotspots');
  for (const f of hf) { const v = JSON.parse(f.value_json); assert.equal(v.role, 'first_class'); assert.ok(v.row && typeof v.row === 'object'); assert.equal(v.path, f.subject_ref); }
});
t('B2 非规范化 subject→skip 披露事实（不静默丢行）', () => {
  const skips = facts.filter((f) => f.metric === 'codelore.file_subject_skip').map((f) => JSON.parse(f.value_json));
  assert.ok(skips.some((s) => s.raw_path === 'docs/../evil.md' && s.reason === 'dotdot-segment'));
  assert.ok(skips.some((s) => s.raw_path === 'link/dangling.ts' && s.reason === 'non-regular-path'));
});
t('B3 case-only 冲突→告警事实（字面保留不折叠）', () => {
  const cc = facts.find((f) => f.metric === 'codelore.subject_case_conflict');
  assert.ok(cc);
  assert.deepEqual(JSON.parse(cc.value_json).pairs, [['Src/A.ts', 'src/a.ts']]);
  const subs = fileFacts.map((f) => f.subject_ref);
  assert.ok(subs.includes('Src/A.ts') && subs.includes('src/a.ts'));
});
t('B4 成对端点行→双端各一条（entity/peer 互指）+ 非文件粒度行不发射', () => {
  const cpl = fileFacts.filter((f) => JSON.parse(f.value_json).analysis === 'coupling');
  assert.equal(cpl.length, 2);
  const subs = cpl.map((f) => f.subject_ref).sort();
  assert.deepEqual(subs, ['src/alpha.ts', 'src/beta.ts']);
  const va = JSON.parse(cpl.find((f) => f.subject_ref === 'src/alpha.ts').value_json);
  assert.equal(va.peer, 'src/beta.ts');
  assert.equal(va.entity, 'src/alpha.ts');
  const lt = fileFacts.filter((f) => JSON.parse(f.value_json).analysis === 'lead-time');
  assert.equal(lt.length, 0);   // rev/date 行非文件粒度不发射
});
t('B5 per-file/血缘事实 scale=Micro-B（粒度按 subject 非 run），聚合保 Macro-B', () => {
  assert.ok(fileFacts.every((f) => f.scale === 'Micro-B'));
  assert.ok(facts.filter((f) => f.metric === 'codelore.facet_rows').every((f) => f.scale === 'Macro-B'));
});
t('B6 entity 字段=文件 subject（实物钉 cassette 实证）', () => {
  const rev = fileFacts.find((f) => JSON.parse(f.value_json).analysis === 'revisions');
  assert.ok(rev && rev.subject_ref === 'src/alpha.ts');
});

// ---------- C. file_renamed 血缘 ----------
t('C1 -z 原字节解析：R<score> 双路径 + __R__ 提交锚 + 单路径条目跳过', () => {
  const edges = FL.parseRenameLogZ(readFileSync(join(FX, 'rename-log.ztxt'), 'utf8'));
  assert.equal(edges.length, 1);
  assert.deepEqual(edges[0], { commit_sha: 'a'.repeat(40), similarity: 100, from: 'src/alpha.ts', to: 'src/beta.ts' });
});
t('C2 file.renamed 载荷五字段+provenance（from/to/head_sha/threshold/detector_version+commit_sha+similarity）', () => {
  const edges = FL.parseRenameLogZ(readFileSync(join(FX, 'rename-log.ztxt'), 'utf8'));
  const lf = FL.collectFileLineage({ edges, headSha: 'a'.repeat(40), threshold: FL.RENAME_DEFAULT_THRESHOLD, detectorVersion: FL.RENAME_DETECTOR_VERSION, gitVersion: 'git 2.55.0' }, { runId: CTX.runId, traceId: CTX.traceId, repoRef: CTX.repoRef, scale: 'Micro-B', observedAt: CTX.observedAt });
  const ren = lf.find((f) => f.metric === 'file.renamed');
  assert.ok(ren);
  assert.equal(ren.subject_ref, 'src/beta.ts');
  const v = JSON.parse(ren.value_json);
  for (const k of ['from', 'to', 'head_sha', 'threshold', 'detector_version', 'commit_sha', 'similarity', 'git_version']) assert.ok(k in v, k);
  assert.equal(v.threshold, '50%');
  assert.equal(v.detector_version, 'rename-detector@v1');
  const scan = lf.find((f) => f.metric === 'file.lineage_scan');
  assert.ok(scan);
  assert.equal(JSON.parse(scan.value_json).edges, 1);
});
t('C3 e2e 真 git rename 检测可复算（跨 git 版本验证项——各 CI 腿重跑同断言）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'micro-b-e2e-'));
  try {
    const g = (args) => execFileSync('git', ['-C', dir].concat(args), { encoding: 'utf8' });
    g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't']);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'alpha.ts'), 'export const a = 1;\n'.repeat(20));
    g(['add', '-A']); g(['commit', '-qm', 'c1']);
    g(['mv', 'src/alpha.ts', 'src/beta.ts']); g(['commit', '-qm', 'c2']);
    const head = g(['rev-parse', 'HEAD']).trim();
    const raw = g(FL.gitRenameLogArgs('50%'));
    const edges = FL.parseRenameLogZ(raw);
    assert.equal(edges.length, 1);   // 重跑同断言=跨版本可复算实测载体
    assert.equal(edges[0].from, 'src/alpha.ts');
    assert.equal(edges[0].to, 'src/beta.ts');
    assert.equal(edges[0].similarity, 100);
    assert.equal(edges[0].commit_sha, head);
    const lf = FL.collectFileLineage({ edges, headSha: head, threshold: '50%', detectorVersion: FL.RENAME_DETECTOR_VERSION, gitVersion: execFileSync('git', ['--version'], { encoding: 'utf8' }).trim() }, { runId: CTX.runId, traceId: CTX.traceId, repoRef: 'e2e@' + head, scale: 'Micro-B', observedAt: CTX.observedAt });
    const ren = lf.find((f) => f.metric === 'file.renamed');
    assert.ok(ren);
    assert.equal(JSON.parse(ren.value_json).head_sha, head);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------- D. raw 证据位 + 对账 ----------
t('D1 facet_rows 降 raw 证据位（append-only 保留 + role=raw_evidence + per_file_emitted 计数）', () => {
  const agg = facts.filter((f) => f.metric === 'codelore.facet_rows');
  assert.equal(agg.length, input.facets.length);
  for (const f of agg) { const v = JSON.parse(f.value_json); assert.equal(v.role, 'raw_evidence'); assert.ok(typeof v.per_file_emitted === 'number'); assert.ok(Array.isArray(v.rows)); }
});
t('D2 对账判据：per-file 重算 == file-bearing 聚合行 − skipped（同 run 恒等）', () => {
  const recon = C.reconcilePerFileVsAggregate(facts);
  assert.equal(recon.match, true, JSON.stringify(recon.per_analysis));
  assert.equal(recon.per_analysis.hotspots.file_bearing, 9);
  assert.equal(recon.per_analysis.hotspots.skipped, 2);
  assert.equal(recon.per_analysis.hotspots.per_file, 7);
  assert.equal(recon.per_analysis['lead-time'].match, true);   // 非文件粒度面天然对账真
});
t('D3 reaggregateFileFacetRows=消费面迁移读源（成对行去重还原）', () => {
  const byFace = C.reaggregateFileFacetRows(facts);
  assert.equal(byFace.coupling.length, 1);   // 双端 2 fact→1 对行
  assert.equal(byFace.coupling[0].entity_a, 'src/alpha.ts');
  assert.equal(byFace.hotspots.length, 7);
});

// ---------- E. golden 骨架锁（字段骨架非内容值） ----------
t('E1 发射骨架 == fixtures/micro-b/emission-skeleton.golden.json（D-038 接入）', () => {
  const sk = G.buildSkeleton();
  const golden = JSON.parse(readFileSync(join(FX, 'emission-skeleton.golden.json'), 'utf8'));
  assert.deepEqual(sk, golden);
});

console.log('MICRO-B-EMIT-TEST-OK ' + n + '/' + n);
