// gen-demo-golden.mjs —— 把 fixtures/golden 重出一遍（#45/A-050；#43 的 golden CI 就从这儿进）
// 用法：node scripts/gen-demo-golden.mjs          # 三个场景全重出 + manifest 重写
// 管线一样、定义也一样：调的是 dist/demo/demo.js 的 runDemo —— 出来的跟 `macro-audit demo --out` 一模一样；
// 禁自动重生成直通 main（D-030③：golden 要更新走 PR 审查，这脚本只管出东西）。
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOLDEN = join(root, 'fixtures', 'golden');
const D = await import(pathToFileURL(join(root, 'dist', 'demo', 'demo.js')).href);

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const manifest = { kind: 'fixture-golden-manifest', schema_version: '1.0.0', generator: 'fixture-generator@1.0.0', note: 'demo --scenario 产物逐字节确定性（pin author/committer/date）；更新走 PR 审查（D-030③）', scenarios: {} };

for (const scenario of D.DEMO_SCENARIOS) {
  const dir = join(GOLDEN, scenario);
  if (existsSync(dir)) { rmSync(dir, { recursive: true, force: true }); }
  mkdirSync(dir, { recursive: true });
  const r = D.runDemo({ scenario: scenario, outDir: dir });
  const files = ['report.md', 'report.json', 'demo-measurements.json', 'demo-facts.jsonl'];
  const hashes = {};
  for (const f of files) { hashes[f] = sha(join(dir, f)); }
  manifest.scenarios[scenario] = { verdict: r.verdict, degraded_mode: r.degraded_mode, receipt_id: r.receipt_id, head_sha: r.head_sha, fact_count: r.fact_count, sha256: hashes };
  console.log('[golden] ' + scenario + ' verdict=' + r.verdict + ' degraded=' + r.degraded_mode + ' facts=' + r.fact_count + ' receipt=' + r.receipt_id);
}
writeFileSync(join(GOLDEN, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('[golden] manifest.json written for ' + Object.keys(manifest.scenarios).join(' / '));
