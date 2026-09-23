// gen-micro-b-emission-golden.mjs — #80 步① 发射骨架 golden 生成器（fixture golden=字段骨架非内容值）
// 骨架维度：metric 集+计数 / subject 规范化形清单 / value_json 键集 / role 标记 / skip reason /
//   case-only 冲突对 / 血缘载荷键集+edges / 对账判据 per_analysis。内容值（行数/评分/git_version）不锁。
// 用法：node scripts/gen-micro-b-emission-golden.mjs          生成/更新 golden（PR 审查制 D-030③）
//        node scripts/gen-micro-b-emission-golden.mjs --check  diff empty 判据（守卫调用面）
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const FX = join(ROOT, 'test', 'fixtures', 'micro-b');
const C = await import(pathToFileURL(join(ROOT, 'dist', 'upstream', 'codelore.js')).href);
const L = await import(pathToFileURL(join(ROOT, 'dist', 'collect', 'file-lineage.js')).href);

const input = JSON.parse(fs.readFileSync(join(FX, 'emission-input.json'), 'utf8'));
const renameRaw = fs.readFileSync(join(FX, 'rename-log.ztxt'), 'utf8');

const CTX = { runId: 'micro-b-golden', traceId: 'g'.repeat(32), repoRef: 'fixture@' + 'a'.repeat(40), scale: 'Macro-B', observedAt: '2026-09-23T00:00:00Z' };
const resolver = () => ({ strategy: 'binary-discovery', binary: 'fake', version: '0.28.0', pinned: true, error: null });
const rowMap = {};
for (const f of input.facets) { rowMap[f.analysis] = JSON.stringify(f.rows); }
const runner = (bin, spec) => ({ ok: true, status: 0, stdout: rowMap[spec.analysis] || '[]', stderrTail: '' });
const probe = (root, rel) => input.subject_probe[rel] || { kind: 'missing' };

export function buildSkeleton() {
  const facts = C.collectCodeloreFacets({ repoRoot: 'fixture', resolver, runner, subjectProbe: probe, facets: input.facets }, CTX);
  const edges = L.parseRenameLogZ(renameRaw);
  const lineageFacts = L.collectFileLineage({ edges, headSha: 'a'.repeat(40), threshold: L.RENAME_DEFAULT_THRESHOLD, detectorVersion: L.RENAME_DETECTOR_VERSION, gitVersion: 'golden-fixture' }, { runId: CTX.runId, traceId: CTX.traceId, repoRef: CTX.repoRef, scale: 'Micro-B', observedAt: CTX.observedAt });
  const all = facts.concat(lineageFacts);
  const recon = C.reconcilePerFileVsAggregate(facts);
  const skeleton = { metrics: {}, subjects: [], value_keys: {}, roles: {}, skips: [], conflicts: [], reconciliation: {}, lineage: { edges: 0, payload_keys: [], scan: null } };
  const subj = new Set();
  for (const f of all) {
    skeleton.metrics[f.metric] = (skeleton.metrics[f.metric] || 0) + 1;
    const v = JSON.parse(f.value_json);
    const ks = Object.keys(v).sort();
    const cur = skeleton.value_keys[f.metric];
    skeleton.value_keys[f.metric] = cur ? [...new Set(cur.concat(ks))].sort() : ks;
    if (v.role) { skeleton.roles[f.metric] = v.role; }
    if (f.metric === 'codelore.file_facet_row') { subj.add(f.subject_ref); }
    if (f.metric === 'codelore.file_subject_skip') { skeleton.skips.push({ raw_path: v.raw_path, reason: v.reason }); }
    if (f.metric === 'codelore.subject_case_conflict') { skeleton.conflicts = v.pairs; }
    if (f.metric === 'file.renamed') { skeleton.lineage.edges++; skeleton.lineage.payload_keys = Object.keys(v).sort(); }
    if (f.metric === 'file.lineage_scan') { skeleton.lineage.scan = { edges: v.edges, threshold: v.threshold, detector_version: v.detector_version }; }
  }
  skeleton.subjects = [...subj].sort();
  skeleton.skips.sort((a, b) => (a.raw_path < b.raw_path ? -1 : 1));
  skeleton.reconciliation = { match: recon.match, per_analysis: recon.per_analysis };
  skeleton.fact_scale = { file_facet_row: all.filter(f => f.metric === 'codelore.file_facet_row').every(f => f.scale === 'Micro-B'), file_renamed: all.filter(f => f.metric === 'file.renamed').every(f => f.scale === 'Micro-B'), aggregate_kept_macro_b: all.filter(f => f.metric === 'codelore.facet_rows').every(f => f.scale === 'Macro-B') };
  return skeleton;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const skeleton = buildSkeleton();
  const out = JSON.stringify(skeleton, null, 2) + '\n';
  const golden = join(FX, 'emission-skeleton.golden.json');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(golden) ? fs.readFileSync(golden, 'utf8') : '';
    if (cur === out) { console.log('GOLDEN-CHECK-OK'); }
    else { console.log('GOLDEN-CHECK-DIFF'); process.exit(1); }
  } else {
    fs.writeFileSync(golden, out, 'utf8');
    console.log('golden written ' + Buffer.byteLength(out) + ' bytes');
  }
}
