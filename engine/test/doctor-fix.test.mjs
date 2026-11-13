// doctor-fix.test.mjs — r22 审计 R1 的复现：绑定缺席时，`doctor --fix` 在同一个进程里
//   第一次试拉失败（import() 的 specifier 缓存已经被污染）→ heal 补拉 → 同进程再加载，leg=ok。
// 这里验的 R1 修复是：healDuckdbBinding 用 createRequire 验过加载之后再写回 duckdbModulePromise（不再犯 A-072 那条同 specifier 禁令）。
// 不在默认 smoke 链里（挪 node_modules 再真跑 npm 补拉需要网络）——CI 的 engine-ci「duckdb doctor --fix e2e」那步会明确跑它。
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
  t('平台绑定包在位（这是复现的前提）', false, pkg + ' missing');
} else {
  renameSync(pkg, parked);
  try {
    // 关键就是这一步：子进程没有 TTY（ci-unattended 那种环境）→ 第一次试拉报 DUCKDB-UNAVAILABLE（禁它自动拉包）
    // → --fix 明确自愈 → 同进程里 openWriter 再加载——R1 修好之前这步一定红（import() 缓存会把原来那个拒绝再抛回来）。
    const r = spawnSync('node', ['dist/cli.js', 'doctor', '--fix'], { cwd: root, encoding: 'utf8', timeout: 300000 });
    const out = (r.stdout || '') + (r.stderr || '');
    let doc = null;
    try { doc = JSON.parse((r.stdout || '').split('\n').filter(l => l.startsWith('{')).pop() || 'null'); } catch (e) { /* parse fail */ }
    const duckLeg = doc && doc.legs.find(l => l.leg === 'duckdb');
    const bindLeg = doc && doc.legs.find(l => l.leg === 'bindings');
    t('R1 复现：doctor --fix 在同一个进程里 duckdb leg=ok（再加载走的是写回那条路，不是同 specifier 的 import）', duckLeg && duckLeg.status === 'ok', duckLeg ? duckLeg.detail.slice(0, 140) : 'no-leg/' + out.slice(-200));
    t('doctor.bindings 检查项在，复装完是 ok（#66④ 的字面要求）', bindLeg && bindLeg.status === 'ok', bindLeg ? bindLeg.detail.slice(0, 120) : 'no-leg');
    t('overall=ok 且 exit=0（绑定缺席这个目标场景下，--fix 主路成立）', doc && doc.overall === 'ok' && r.status === 0, 'overall=' + (doc && doc.overall) + ' exit=' + r.status);
    t('DUCKDB-SELFHEAL trigger=doctor-fix 事件在（主路走通，事后能审计）', /DUCKDB-SELFHEAL \{[^}]*"trigger":"doctor-fix"/.test(out));
    t('绑定包目录又在了（真补拉、真落盘）', existsSync(pkg));
  } finally {
    if (!existsSync(pkg) && existsSync(parked)) renameSync(parked, pkg);
    else if (existsSync(parked)) rmSync(parked, { recursive: true, force: true });
    t('parked 目录清理干净', !existsSync(parked));
  }
}
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
