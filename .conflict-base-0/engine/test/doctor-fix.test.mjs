// doctor-fix.test.mjs — r22 审计 R1 复现面断言：绑定缺席 → `doctor --fix` 单进程内
//   首探失败（import() specifier 缓存已污染）→ heal 补拉 → 同进程复载 leg=ok。
// 断言 R1 修复=healDuckdbBinding createRequire 验载后回填 duckdbModulePromise（违 A-072 同 specifier 禁令已消）。
// 不在默认 smoke 链（挪 node_modules＋真 npm 补拉需网络）——CI engine-ci「duckdb doctor --fix e2e」步显式跑。
import { renameSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sfx = process.platform + '-' + process.arch;
const pkg = join(root, 'node_modules', '@duckdb', 'node-bindings-' + sfx);
const parked = pkg + '.parked-doctorfix';

let pass = 0, fail = 0;
const t = (n, ok, ex = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ex ? ' | ' + ex : '')); ok ? pass++ : fail++; };

if (!existsSync(pkg)) {
  t('平台绑定包在位（复现前置）', false, pkg + ' missing');
} else {
  renameSync(pkg, parked);
  try {
    // 关键复现面：子进程=非 TTY（ci-unattended 面）→ 首探 DUCKDB-UNAVAILABLE（禁自动拉包）
    // → --fix 显式自愈 → 同进程 openWriter 复载——R1 修复前此步必 fail（import() 缓存回投原拒绝）。
    const r = spawnSync('node', ['dist/cli.js', 'doctor', '--fix'], { cwd: root, encoding: 'utf8', timeout: 300000 });
    const out = (r.stdout || '') + (r.stderr || '');
    let doc = null;
    try { doc = JSON.parse((r.stdout || '').split('\n').filter(l => l.startsWith('{')).pop() || 'null'); } catch (e) { /* parse fail */ }
    const duckLeg = doc && doc.legs.find(l => l.leg === 'duckdb');
    const bindLeg = doc && doc.legs.find(l => l.leg === 'bindings');
    t('R1 复现面：doctor --fix 同进程 duckdb leg=ok（复载经回填通道非同 specifier import）', duckLeg && duckLeg.status === 'ok', duckLeg ? duckLeg.detail.slice(0, 140) : 'no-leg/' + out.slice(-200));
    t('doctor.bindings 检查项在且复装后 ok（#66④ 字面）', bindLeg && bindLeg.status === 'ok', bindLeg ? bindLeg.detail.slice(0, 120) : 'no-leg');
    t('overall=ok 且 exit=0（--fix 主路在绑定缺席目标场景成立）', doc && doc.overall === 'ok' && r.status === 0, 'overall=' + (doc && doc.overall) + ' exit=' + r.status);
    t('DUCKDB-SELFHEAL trigger=doctor-fix 事件在（显式主路可审计）', /DUCKDB-SELFHEAL \{[^}]*"trigger":"doctor-fix"/.test(out));
    t('绑定包目录复在（实补拉落盘）', existsSync(pkg));
  } finally {
    if (!existsSync(pkg) && existsSync(parked)) renameSync(parked, pkg);
    else if (existsSync(parked)) rmSync(parked, { recursive: true, force: true });
    t('parked 目录清理', !existsSync(parked));
  }
}
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
