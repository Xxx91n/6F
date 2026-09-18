// audit-zero-write.test.mjs —— D-074③ fixture 承接面（#65）：「审计管线对被测仓零写入」工具不变量
// 承接的 sealed 断言（attestation=.scratch/architecture-recovery/reports/acceptance-probe-attestation.jsonl）：
//   ap-38-h4（38-check H4 anysearch-cli 零写入）/ ap-39-i1（env-manager）/ ap-39-i2（anysearch-cli）
//   ——1:1 迁移对应表写入 attestation 行 migrated_to 字段。
// 机制（hermetic 处方）：fs.mkdtemp 玩具仓（cassette 化抽样真实 sibling 结构：docs/adr+CONTEXT.md+package.json+src，
//   仿 fixtures/github-rest cassette 先例）→ node dist/cli.js audit <repo> --out <tmp>/out → git status --porcelain 断言空 → 清理。
//   ephemeral 每次新建不 clone 真实 sibling（真实仓内容漂移违反 hermetic）；自检「审计确实产出 facts」防 vacuous pass。
//   原验收时点真实仓实测证据承接历史性（attestation evidence 字段），本测试承接持续性（挂 smoke 链每次实跑）。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, '..', 'dist', 'cli.js');
const NL = String.fromCharCode(10);

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }

// Windows mkdtemp/git 偶发竞态——重试一次（R22-Q2 §5.4 处方）；失败时 stderr 归因输出。
function git(args, cwd) {
  for (let i = 0; i < 2; i++) {
    try { return execFileSync('git', args, { cwd: cwd, encoding: 'utf8' }).trim(); }
    catch (e) { if (i === 1) { console.error('  git ' + args[0] + ' failed: ' + e.message); throw e; } }
  }
}
function gitOr(args, cwd, fallback) { try { return git(args, cwd); } catch (e) { return fallback; } }

// ---------- 玩具仓（cassette 抽样：README+CONTEXT+ADR+package.json+src，3 commits 触发 git/adr 采集面） ----------
const tmp = mkdtempSync(join(tmpdir(), 'azw-'));
const REPO = join(tmp, 'tgt');
let cleaned = false;
function cleanup() { if (!cleaned) { cleaned = true; try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { console.error('  cleanup warn: ' + e.message); } } }
process.on('exit', cleanup);

try {
  mkdirSync(join(REPO, 'docs', 'adr'), { recursive: true });
  mkdirSync(join(REPO, 'src'), { recursive: true });
  git(['init'], REPO);
  git(['config', 'user.email', 'azw@test.local'], REPO);
  git(['config', 'user.name', 'azw-test'], REPO);
  git(['config', 'commit.gpgsign', 'false'], REPO);

  const env = Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-05-01T10:00:00Z', GIT_COMMITTER_DATE: '2026-05-01T10:00:00Z' });
  const commitAll = (msg) => { execFileSync('git', ['add', '-A'], { cwd: REPO }); execFileSync('git', ['commit', '-m', msg], { cwd: REPO, env: env }); };

  writeFileSync(join(REPO, 'README.md'), ['# azw toy repo', 'cassette 抽样 sibling 结构（README/CONTEXT/ADR/package.json/src）。', ''].join(NL), 'utf8');
  writeFileSync(join(REPO, 'CONTEXT.md'), ['# azw context', 'macro audit positioning determinism traceability provenance receipt', ''].join(NL), 'utf8');
  writeFileSync(join(REPO, 'package.json'), '{"name":"azw-tgt","private":true,"version":"0.0.0"}' + NL, 'utf8');
  commitAll('init');

  writeFileSync(join(REPO, 'docs', 'adr', '001-first.md'), ['# ADR-001 first', '', '- Status: accepted', '- Date: 2026-05-01', '- Deciders: azw', '- Ledger: D-001', '', '## Context', 'toy cassette context.', '', '## Decision', 'toy decision.', '', '## Consequences', 'toy consequences; supersedes none.'].join(NL), 'utf8');
  commitAll('add adr');

  writeFileSync(join(REPO, 'src', 'index.js'), 'export function main() { return 42; }' + NL, 'utf8');
  commitAll('add src');

  const headBefore = gitOr(['rev-parse', 'HEAD'], REPO, 'UNKNOWN');

  // ---------- 实跑审计管线（--out 落 tmp 外侧目录，被测仓应保持零写入） ----------
  const OUT = join(tmp, 'out');
  const r = spawnSync('node', [CLI, 'audit', REPO, '--out', OUT], { encoding: 'utf8', timeout: 120000 });
  t('audit-zero-write-run audit 管线对玩具仓实跑 exit 0（非拒绝非崩溃）', r.status === 0, 'status=' + r.status + ' err=' + (r.stderr || '').slice(0, 160));

  let rec = null;
  try { rec = JSON.parse(r.stdout || ''); } catch (e) { }
  const factsPath = join(OUT, 'audit-facts.jsonl');
  const factsN = existsSync(factsPath) ? readFileSync(factsPath, 'utf8').trim().split(NL).filter(Boolean).length : 0;
  t('audit-zero-write-facts-produced 自检防 vacuous：审计确实产出 facts（回执 fact_count>0 且 audit-facts.jsonl 行数>0）', !!rec && (rec.fact_count || 0) > 0 && factsN > 0, 'fact_count=' + (rec && rec.fact_count) + ' jsonl=' + factsN);

  // ---------- 零写入不变量（断言名显式写不变量语义；porcelain 含 untracked） ----------
  const status = gitOr(['status', '--porcelain'], REPO, 'PROBE-FAILED');
  t('audit-zero-write-porcelain-clean 审计管线对被测仓工作树零写入（git status --porcelain 空）', status === '', JSON.stringify(status).slice(0, 160));
  const headAfter = gitOr(['rev-parse', 'HEAD'], REPO, 'UNKNOWN');
  t('audit-zero-write-head-stable 审计不改被测仓历史（HEAD 锚前后一致）', headBefore !== 'UNKNOWN' && headBefore === headAfter, headBefore + ' -> ' + headAfter);
} finally {
  cleanup();
}

console.log('---');
console.log(fail === 0 ? 'AUDIT-ZERO-WRITE-TEST-OK ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
