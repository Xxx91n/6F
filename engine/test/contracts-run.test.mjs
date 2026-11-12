// 执行器和隔离环境下的注入回归测试（tracker #54）。
// 未分类行和假证明这两处注入，维护者在 tracker #54 里已经批过。
// 这些对照是直接跑隔离环境那个检查脚本；跑成套的那套留到 tracker #134。
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const engine = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(engine, '..');
const temp = mkdtempSync(join(tmpdir(), 'contracts-run-test-'));
/** 跑一个独立的 Node 进程：给个时间上限，执行器的参数也定死。 */
function run(args, env = {}) {
  return spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 60000, env: { ...process.env, CONTRACTS_ONLY: '', CONTRACTS_TIMEOUT_MS: '10000', ...env } });
}
/** 只在一个唯一的地方注入一次，这样改过的检查脚本不会悄悄让测试失效。 */
function replaceOnce(text, from, to) {
  assert.equal(text.split(from).length, 2, 'injection anchor must be unique: ' + from);
  return text.replace(from, to);
}
try {
  // 合成的最小检查脚本，用来跑真执行器，但不改动全量扫描的范围。
  const runnerDir = join(temp, 'runner');
  const checks = join(runnerDir, 'contracts');
  mkdirSync(checks, { recursive: true });
  cpSync(join(engine, 'test/contracts-run.mjs'), join(runnerDir, 'contracts-run.mjs'));
  writeFileSync(join(checks, 'a-check.mjs'), "console.log('GUARD-RESULT: SKIP-GROUP example'); console.log('AUDIT-DISCLOSURE example disclosure line'); console.log('PASS a');\n");
  // 两条披露合计超过 400 字：先拼后截会把后面那条切掉，新加的通道必须逐条打全（tracker #229 的返修意见）。
  const longA = 'AUDIT-DISCLOSURE first long disclosure ' + 'x'.repeat(260);
  const longB = 'AUDIT-DISCLOSURE second long disclosure ' + 'HEAD-MARKER' + 'y'.repeat(260) + ' TAIL-MARKER';
  writeFileSync(join(checks, 'c-check.mjs'), "console.log(" + JSON.stringify(longA) + "); console.log(" + JSON.stringify(longB) + "); console.log('PASS c');\n");
  writeFileSync(join(checks, 'b-check.mjs'), "setTimeout(() => {}, 5000);\n");
  let r = run([join(runnerDir, 'contracts-run.mjs')], { CONTRACTS_ONLY: '^a-' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /PASS 1\/1 contract checks SKIP-GROUPS=1/);
  assert.match(r.stdout, /SKIP-GROUP  a-check/);
  // 绿着跑的时候披露行也要单独露出来——汇总窗口只留最后两条 PASS 行，它挤不进去（tracker #229）。
  assert.match(r.stdout, /DISCLOSURE  a-check\.mjs  — AUDIT-DISCLOSURE example disclosure line/);
  assert.doesNotMatch(r.stdout, /b-check/);
  r = run([join(runnerDir, 'contracts-run.mjs')], { CONTRACTS_ONLY: '^c-' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  // 两条都完整打到，后面那条的尾巴不能被截掉
  assert.match(r.stdout, new RegExp('DISCLOSURE  c-check\\.mjs  — ' + longA));
  assert.match(r.stdout, new RegExp('DISCLOSURE  c-check\\.mjs  — ' + longB.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '$', 'm'));
  assert.match(r.stdout, /TAIL-MARKER/);
  assert.match(r.stdout, /HEAD-MARKER/);
  r = run([join(runnerDir, 'contracts-run.mjs')], { CONTRACTS_ONLY: '^b-', CONTRACTS_TIMEOUT_MS: '100' });
  assert.equal(r.status, 1); assert.match(r.stdout, /FAIL\(TIMEOUT\).*超时 100ms signal=/); assert.doesNotMatch(r.stdout, /FAIL\(null\)/);
  for (const [env, message] of [
    [{ CONTRACTS_ONLY: '[' }, /Invalid CONTRACTS_ONLY regex/],
    [{ CONTRACTS_ONLY: 'not-found' }, /No contract checks matched CONTRACTS_ONLY/],
    [{ CONTRACTS_TIMEOUT_MS: '0' }, /CONTRACTS_TIMEOUT_MS must be an integer/]
  ]) {
    r = run([join(runnerDir, 'contracts-run.mjs')], env);
    assert.equal(r.status, 1); assert.match(r.stderr, message); assert.doesNotMatch(r.stdout, /PASS 0\/0/);
  }

  // 只复制检查脚本要读的那些输入。git 元数据指向原来的对象库；
  // 所有写操作，包括源码和数据注入，都只留在临时复制的那份里。
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
    // 原来 TC-1 ratio 那个谎报：在自检之后注入，这样新加的事实表用例盖不住记录自洽这一项。
    { id: 1, injection: ["check('B3-TC1',", "tc1.ratio_4 = '0.9000';\ncheck('B3-TC1',"], mutation: [conditions[0], conditions[0].replace(' && consistentTc1(tc1)', '')] },
    { id: 1, injection: ['const tc1Gaps = classGaps(tc1Cases);', "tc1Cases.push(['missing class', true, '']);\nconst tc1Gaps = classGaps(tc1Cases);"], mutation: [conditions[0], conditions[0].replace(' && tc1Gaps.length === 0', '')] },
    { id: 1, injection: ['const tc1Gaps = classGaps(tc1Cases);', "tc1Cases.push(['missing class', true, '']);\nconst tc1Gaps = classGaps(tc1Cases);"], mutation: ['function classGaps(cases) {', 'function classGaps(cases) { return [];'] },
    { id: 1, injection: ['function lieArm(consistent, derive, base, field, value, witness) {', 'function lieArm(consistent, derive, base, field, value, witness) { witness = function () { return false; };'], mutation: ['return !consistent(lied) && witness(derive(lied), lied);', 'return !consistent(lied);'] }
  ];
  /** 跑临时那份检查脚本，只取名字里那条 B3 结果，不拿别的失败凑数。 */
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
