// #64/D-072→#66/D-075 离线＋分层门控模拟断言：挪走平台绑定包 →
//   A) 非 TTY 缺省（spawnSync 管道面）：永不自动拉包——无 DUCKDB-SELFHEAL 事件，四段披露结构化回落；
//   B) MACRO_AUDIT_SELFHEAL=1 opt-in＋死 registry：允许补拉但离线失败——start/fallback 事件＋四段披露。
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
  "openWriter(process.argv[1]).then(function(){ process.stdout.write('UNEXPECTED-OK\\n', function(){ process.exit(2); }); }).catch(function(e){ process.stdout.write('ERR=' + String(e && e.message || e) + '\\n', function(){ process.exit(0); }); });"
].join('\n');

const DEAD = { npm_config_registry: 'http://127.0.0.1:9/', npm_config_fetch_retries: '0', npm_config_fetch_retry_maxtimeout: '1000' };

if (!existsSync(pkg)) {
  t('平台绑定包在位（离线模拟前置）', false, pkg + ' missing');
} else {
  renameSync(pkg, parked);
  try {
    // —— A) 非 TTY 缺省面：D-075① 永不自动拉包（无人值守无人可询问） ——
    const ra = spawnSync('node', ['--input-type=module', '-e', child, tmpDb], {
      cwd: root, encoding: 'utf8', timeout: 120000,
      env: { ...process.env, ...DEAD }
    });
    const outA = (ra.stdout || '') + (ra.stderr || '');
    t('A1 子进程受控退出非崩溃', ra.status === 0, 'exit=' + ra.status);
    t('A2 非 TTY 缺省面零 DUCKDB-SELFHEAL 事件（永不自动拉包）', !/DUCKDB-SELFHEAL/.test(outA));
    t('A3 四段披露①缺失原因在（原生绑定缺失/解析错误）', outA.includes('原生绑定缺失（') || outA.includes('DUCKDB-UNAVAILABLE'));
    t('A4 四段披露②修复路径 doctor --fix＋npm install --omit=dev', outA.includes('doctor --fix') && outA.includes('npm install --omit=dev'));
    t('A5 四段披露③能力边界（facts/audit 不可用其余不受影响）', outA.includes('无网络') && outA.includes('其余命令不受影响'));
    t('A6 四段披露④opt-in 出口 MACRO_AUDIT_SELFHEAL=1', outA.includes('MACRO_AUDIT_SELFHEAL=1'));
    t('A7 DUCKDB-UNAVAILABLE 结构化错误', outA.includes('DUCKDB-UNAVAILABLE'));

    // —— B) opt-in＋死 registry：允许补拉但离线失败——结构化回落 ——
    const rb = spawnSync('node', ['--input-type=module', '-e', child, tmpDb], {
      cwd: root, encoding: 'utf8', timeout: 180000,
      env: { ...process.env, ...DEAD, MACRO_AUDIT_SELFHEAL: '1' }
    });
    const outB = (rb.stdout || '') + (rb.stderr || '');
    t('B1 opt-in 子进程受控退出非崩溃', rb.status === 0, 'exit=' + rb.status);
    t('B2 自愈事件 DUCKDB-SELFHEAL trigger=opt-in（D-075⑥ 可审计性）', /DUCKDB-SELFHEAL \{[^}]*"trigger":"opt-in"/.test(outB));
    t('B3 离线补拉失败 result=fallback', /DUCKDB-SELFHEAL \{[^}]*"result":"fallback"/.test(outB));
    t('B4 回落仍四段披露（doctor --fix＋opt-in＋边界）', outB.includes('doctor --fix') && outB.includes('MACRO_AUDIT_SELFHEAL') && outB.includes('其余命令不受影响'));
    t('B5 DUCKDB-UNAVAILABLE 结构化错误', outB.includes('DUCKDB-UNAVAILABLE'));
  } finally {
    renameSync(parked, pkg);
    rmSync(tmpDb, { force: true });
    t('绑定目录复原', existsSync(pkg));
  }
}
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
