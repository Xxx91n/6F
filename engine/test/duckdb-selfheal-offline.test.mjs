// #64/D-072③ 离线模拟断言：挪走平台绑定包＋死 registry → 自愈补拉失败 → 三段文案结构化回落非崩溃
// 不在默认 smoke 链（改 node_modules＋需模拟网络面）——CI engine-ci「duckdb self-heal offline-sim」步显式跑。
import { renameSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sfx = process.platform + '-' + process.arch;
const pkg = join(root, 'node_modules', '@duckdb', 'node-bindings-' + sfx);
const parked = pkg + '.parked-offline';
const tmpDb = join(root, '.code-tmp-offline.duckdb');

let pass = 0, fail = 0;
const t = (n, ok, ex = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ex ? ' | ' + ex : '')); ok ? pass++ : fail++; };

const child = [
  "import { openWriter } from './dist/fact/store.js';",
  "openWriter(process.argv[1]).then(function(){ console.log('UNEXPECTED-OK'); process.exit(2); }).catch(function(e){ console.log('ERR=' + String(e && e.message || e)); process.exit(0); });"
].join('\n');

if (!existsSync(pkg)) {
  t('平台绑定包在位（离线模拟前置）', false, pkg + ' missing');
} else {
  renameSync(pkg, parked);
  try {
    const r = spawnSync('node', ['--input-type=module', '-e', child, tmpDb], {
      cwd: root, encoding: 'utf8', timeout: 180000,
      env: { ...process.env, npm_config_registry: 'http://127.0.0.1:9/', npm_config_fetch_retries: '0', npm_config_fetch_retry_maxtimeout: '1000' }
    });
    const out = (r.stdout || '') + (r.stderr || '');
    t('子进程受控退出非崩溃', r.status === 0, 'exit=' + r.status);
    t('结构化自愈事件 DUCKDB-SELFHEAL JSON（result=fallback）', /DUCKDB-SELFHEAL \{[^}]*"result":"fallback"/.test(out));
    t('三段文案①自动补拉失败（原因）', out.includes('自动补拉失败（'));
    t('三段文案②手动 npm install --omit=dev', out.includes('npm install --omit=dev'));
    t('三段文案③无网络 facts/audit 不可用其余不受影响', out.includes('无网络') && out.includes('其余命令不受影响'));
    t('DUCKDB-UNAVAILABLE 结构化错误', out.includes('DUCKDB-UNAVAILABLE'));
  } finally {
    renameSync(parked, pkg);
    rmSync(tmpDb, { force: true });
    t('绑定目录复原', existsSync(pkg));
  }
}
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
