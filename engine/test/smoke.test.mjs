import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'dist', 'cli.js');
const results = [];
function check(name, pass, detail) { results.push([name, pass, detail || '']); }

check('dist/cli.js 在（说明 build 跑过了）', existsSync(cli), cli);

const v = spawnSync(process.execPath, [cli, '--version'], { encoding: 'utf8' });
check('cli --version 退出码是 0', v.status === 0, 'status=' + v.status);
let vj = null;
try { vj = JSON.parse(v.stdout); } catch (e) {}
check('cli --version 打出来的 JSON 里 name 和 version 都有', !!vj && !!vj.name && !!vj.version, String(v.stdout).trim());

const s = spawnSync(process.execPath, [cli, 'selftest'], { encoding: 'utf8' });
check('cli selftest 退出码是 0（说明程序还活着）', s.status === 0, 'status=' + s.status);
let sj = null;
try { sj = JSON.parse(s.stdout); } catch (e) {}
check('selftest 回 ok=true（它拿 spec 里的常量自查了一遍）', !!sj && sj.ok === true, String(s.stdout).trim());

const g = spawnSync(process.execPath, [join(root, 'scripts', 'gen-manifests.mjs')], { encoding: 'utf8' });
check('gen-manifests 退出码是 0（两份清单没走样）', g.status === 0, 'status=' + g.status);

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('SMOKE-OK ' + results.length + '/' + results.length) : 'SMOKE-FAIL');
process.exit(ok ? 0 : 1);