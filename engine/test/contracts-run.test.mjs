// Runner and isolated guard-mutation regression tests (tracker #54).
// The maintainer approved the unclassified row and false-witness injections in tracker #54.
// These controls run the isolated guard directly; the runner-based harness remains tracker #134.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const engine = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(engine, '..');
const temp = mkdtempSync(join(tmpdir(), 'contracts-run-test-'));
/** Run an isolated Node process with bounded execution and controlled runner settings. */
function run(args, env = {}) {
  return spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 60000, env: { ...process.env, CONTRACTS_ONLY: '', CONTRACTS_TIMEOUT_MS: '10000', ...env } });
}
/** Inject only at a unique anchor so a changed guard cannot silently invalidate a test. */
function replaceOnce(text, from, to) {
  assert.equal(text.split(from).length, 2, 'injection anchor must be unique: ' + from);
  return text.replace(from, to);
}
try {
  // Minimal synthetic checks exercise the real runner without changing the census.
  const runnerDir = join(temp, 'runner');
  const checks = join(runnerDir, 'contracts');
  mkdirSync(checks, { recursive: true });
  cpSync(join(engine, 'test/contracts-run.mjs'), join(runnerDir, 'contracts-run.mjs'));
  writeFileSync(join(checks, 'a-check.mjs'), "console.log('GUARD-RESULT: SKIP-GROUP example'); console.log('PASS a');\n");
  writeFileSync(join(checks, 'b-check.mjs'), "setTimeout(() => {}, 5000);\n");
  let r = run([join(runnerDir, 'contracts-run.mjs')], { CONTRACTS_ONLY: '^a-' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /PASS 1\/1 contract checks SKIP-GROUPS=1/);
  assert.match(r.stdout, /SKIP-GROUP  a-check/);
  assert.doesNotMatch(r.stdout, /b-check/);
  r = run([join(runnerDir, 'contracts-run.mjs')], { CONTRACTS_ONLY: '^b-', CONTRACTS_TIMEOUT_MS: '100' });
  assert.equal(r.status, 1); assert.match(r.stdout, /FAIL\(TIMEOUT\).*超时 100ms signal=/); assert.doesNotMatch(r.stdout, /FAIL\(null\)/);
  for (const env of [{ CONTRACTS_ONLY: '[' }, { CONTRACTS_ONLY: 'not-found' }, { CONTRACTS_TIMEOUT_MS: '0' }]) {
    r = run([join(runnerDir, 'contracts-run.mjs')], env); assert.equal(r.status, 1); assert.doesNotMatch(r.stdout, /PASS 0\/0/);
  }

  // Mirror only the guard's inputs. Git metadata points at the original object store;
  // all writes, including source and data injection, remain in the temporary mirror.
  const mirror = join(temp, 'mirror');
  mkdirSync(join(mirror, 'engine', 'test', 'contracts'), { recursive: true });
  for (const path of ['engine/src', 'engine/dist', 'engine/test/fixtures', 'engine/test/contracts/_lib', 'docs']) {
    cpSync(join(root, path), join(mirror, path), { recursive: true });
  }
  const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], { cwd: root, encoding: 'utf8' }).trim();
  writeFileSync(join(mirror, '.git'), 'gitdir: ' + gitDir + '\n');
  const target = join(mirror, 'engine/test/contracts/23-first-report-check.mjs');
  const original = readFileSync(join(engine, 'test/contracts/23-first-report-check.mjs'), 'utf8');
  const gateLine = "const gates = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-gates.json'), 'utf8'));";
  const conditions = [
    "tc1.verdict === 'INCONCLUSIVE' && consistentTc1(tc1) && tc1FactOk && tc1Bad.length === 0 && tc1Gaps.length === 0",
    "tc2.verdict === 'RED' && consistentTc2(tc2) && tc2FactOk && tc2Bad.length === 0 && tc2Gaps.length === 0",
    "tc3.verdict === 'AMBER' && consistentTc3(tc3) && tc3FactOk && tc3Bad.length === 0 && tc3Gaps.length === 0"
  ];
  const data = ["gates.B.tc1.judgeable_n = 999;", "gates.B.tc2.mean_ratio_4 = '0.9000';", "gates.B.tc3.lowest_ratio_4 = '0.9900';"];
  const cases = [
    ...conditions.map((condition, i) => ({ id: i + 1, injection: [gateLine, gateLine + '\n' + data[i]], mutation: [condition, condition.split(' && ')[0]] })),
    // Existing TC-1 ratio lie: inject after self-tests so the new fact-table cases cannot mask the record-consistency arm.
    { id: 1, injection: ["check('B3-TC1',", "tc1.ratio_4 = '0.9000';\ncheck('B3-TC1',"], mutation: [conditions[0], conditions[0].replace(' && consistentTc1(tc1)', '')] },
    { id: 1, injection: ['const tc1Gaps = classGaps(tc1Cases);', "tc1Cases.push(['missing class', true, '']);\nconst tc1Gaps = classGaps(tc1Cases);"], mutation: [conditions[0], conditions[0].replace(' && tc1Gaps.length === 0', '')] },
    { id: 1, injection: ['const tc1Gaps = classGaps(tc1Cases);', "tc1Cases.push(['missing class', true, '']);\nconst tc1Gaps = classGaps(tc1Cases);"], mutation: ['function classGaps(cases) {', 'function classGaps(cases) { return [];'] },
    { id: 1, injection: ['function lieArm(consistent, derive, base, field, value, witness) {', 'function lieArm(consistent, derive, base, field, value, witness) { witness = function () { return false; };'], mutation: ['return !consistent(lied) && witness(derive(lied), lied);', 'return !consistent(lied);'] }
  ];
  /** Execute the temporary guard and return the named B3 result, not an unrelated failure. */
  function guard(source, id) {
    writeFileSync(target, source);
    const result = run([target]);
    assert.notEqual(result.status, null, result.stderr);
    const match = result.stdout.match(new RegExp('^(PASS|FAIL) B3-TC' + id + ' ', 'm'));
    assert.ok(match, result.stdout + result.stderr);
    return match[1];
  }
  for (let i = 1; i <= 3; i++) assert.equal(guard(original, i), 'PASS', 'unmodified guard');
  for (const [i, c] of cases.entries()) {
    const injected = replaceOnce(original, ...c.injection);
    assert.equal(guard(injected, c.id), 'FAIL', 'injection ' + (i + 1));
    const mutant = replaceOnce(injected, ...c.mutation);
    assert.equal(guard(mutant, c.id), 'PASS', 'mutation must survive this injection without the protected arm: ' + (i + 1));
  }
  console.log('PASS contracts-run tests: runner and 7 isolated mutation controls');
} finally { rmSync(temp, { recursive: true, force: true }); }
