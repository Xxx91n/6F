// #64/D-072③ 干净机自愈 E2E smoke：挪走平台绑定包 → 触发 loadDuckdb → 自愈精确补拉 → openWriter 成功读写
// 要联网（npm pack 真去拉包）；不在默认 smoke 链里——CI engine-ci 的「duckdb self-heal E2E」那一步专门跑它。
import { renameSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sfx = process.platform + '-' + process.arch;
const pkg = join(root, 'node_modules', '@duckdb', 'node-bindings-' + sfx);
const parked = pkg + '.parked-e2e';
const tmpDb = join(root, '.code-tmp-e2e.duckdb');

let pass = 0, fail = 0;
const t = (n, ok, ex = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ex ? ' | ' + ex : '')); ok ? pass++ : fail++; };

const child = [
  "import { openWriter, queryFacts, closeDuckdb } from './dist/fact/store.js';",
  "const c = await openWriter(process.argv[1]);",
  "const r = await queryFacts(c, \"SELECT 1 AS one\");",
  "closeDuckdb(c);",
  "process.stdout.write('HEALED rows=' + (r && r.rowCount !== undefined ? r.rowCount : 'ok') + '\\n', function () { process.exit(0); });"
].join('\n');

if (!existsSync(pkg)) {
  t('平台绑定包在位（E2E 前置）', false, pkg + ' missing');
} else {
  renameSync(pkg, parked);
  try {
    // D-075① 分层门控：spawnSync 走管道，没有人盯着终端——这种场合必须 MACRO_AUDIT_SELFHEAL=1 显式开了才允许补拉。
    const r = spawnSync('node', ['--input-type=module', '-e', child, tmpDb], { cwd: root, encoding: 'utf8', timeout: 300000, env: { ...process.env, MACRO_AUDIT_SELFHEAL: '1' } });
    const out = (r.stdout || '') + (r.stderr || '');
    t('自愈成功事件 DUCKDB-SELFHEAL result=success trigger=opt-in', /DUCKDB-SELFHEAL \{[^}]*"result":"success"[^}]*"trigger":"opt-in"/.test(out) || /DUCKDB-SELFHEAL \{[^}]*"trigger":"opt-in"[^}]*"result":"success"/.test(out));
    t('openWriter 成功（HEALED）', out.includes('HEALED'), 'exit=' + r.status);
    t('补拉后包目录复在（@duckdb/node-bindings-' + sfx + '）', existsSync(pkg));
    if (r.status !== 0) {
      // 失败时把整份诊断吐出来（CI 在 POSIX 上定证据用）——全部 DUCKDB-*/npm 行 + 尾部 400B
      const ev = out.split('\n').filter(function (l) { return l.indexOf('DUCKDB-') >= 0 || l.indexOf('npm') >= 0 || l.indexOf('tar') >= 0; });
      t('子进程 exit=0', false, ev.join(' | ').slice(0, 800) + ' ::TAIL:: ' + out.slice(-400));
    }
  } finally {
    if (!existsSync(pkg) && existsSync(parked)) renameSync(parked, pkg);
    else if (existsSync(parked)) rmSync(parked, { recursive: true, force: true });
    rmSync(tmpDb, { force: true });
  }
}
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
