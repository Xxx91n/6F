import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'dist', 'cli.js');
const results = [];
function check(name, pass, detail) { results.push([name, pass, detail || '']); }

check('dist/cli.js exists (build ran)', existsSync(cli), cli);

const v = spawnSync(process.execPath, [cli, '--version'], { encoding: 'utf8' });
check('cli --version exits 0', v.status === 0, 'status=' + v.status);
let vj = null;
try { vj = JSON.parse(v.stdout); } catch (e) {}
check('cli --version JSON has name+version', !!vj && !!vj.name && !!vj.version, String(v.stdout).trim());

const s = spawnSync(process.execPath, [cli, 'selftest'], { encoding: 'utf8' });
check('cli selftest exits 0 (liveness)', s.status === 0, 'status=' + s.status);
let sj = null;
try { sj = JSON.parse(s.stdout); } catch (e) {}
check('selftest ok=true (alive + minimal e2e)', !!sj && sj.ok === true, String(s.stdout).trim());

const g = spawnSync(process.execPath, [join(root, 'scripts', 'gen-manifests.mjs')], { encoding: 'utf8' });
check('gen-manifests exits 0 (dual manifest no drift)', g.status === 0, 'status=' + g.status);

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('SMOKE-OK ' + results.length + '/' + results.length) : 'SMOKE-FAIL');
process.exit(ok ? 0 : 1);