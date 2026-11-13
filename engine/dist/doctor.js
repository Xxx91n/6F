// doctor.ts —— 看看这台机器能不能跑（#62/D-059③）
// 查这几样：duckdb 能不能把库打开（走 loadDuckdb 那套自动修复流程）／
// git 命令有没有（git --version）／网络和 npm 源通不通（能不能把依赖拉下来）。
// 输出是结构化的：{doctor, legs:[{leg,status,detail}], overall}——查挂了就把结构化信息摆出来，不许把错误悄悄咽了；
// status 三档：ok（都好）/ degraded（降了级，比如断网时 facts/audit 用不了但别的命令照常）/ fail（真坏了）。
// selftest 那头专管清单对账，两件事不掺一块儿（D-059③ 职责分开）——这个文件只做环境诊断。
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { get } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openWriter, closeDuckdb, healDuckdbBinding, engineRoot, platformPackageSuffix } from './fact/store.js';
function worst(legs) {
    if (legs.some(function (l) { return l.status === 'fail'; })) {
        return 'fail';
    }
    if (legs.some(function (l) { return l.status === 'degraded'; })) {
        return 'degraded';
    }
    return 'ok';
}
async function probeDuckdb(fix) {
    const db = join(tmpdir(), 'macro-audit-doctor-' + String(process.pid) + '.duckdb');
    try {
        const conn = await openWriter(db);
        try {
            await conn.run('SELECT 1');
        }
        catch { /* 开库成功即达标，查询失败不进 detail */ }
        try {
            closeDuckdb(conn);
        }
        catch { /* best effort */ }
        return { leg: 'duckdb', status: 'ok', detail: 'openWriter 可开库（原生绑定在位）' };
    }
    catch (e) {
        const msg = String(e && e.message || e);
        if (msg.indexOf('DUCKDB-UNAVAILABLE') === 0) {
            // D-075③：doctor --fix 就是拿来自动修依赖的；修完再把库打开验证一遍。
            if (fix) {
                const heal = healDuckdbBinding();
                if (!heal.ok) {
                    return { leg: 'duckdb', status: 'degraded', detail: 'doctor --fix 自愈未竟：' + heal.detail.slice(0, 120) };
                }
                try {
                    const conn2 = await openWriter(db);
                    try {
                        await conn2.run('SELECT 1');
                    }
                    catch { /* best effort */ }
                    try {
                        closeDuckdb(conn2);
                    }
                    catch { /* best effort */ }
                    return { leg: 'duckdb', status: 'ok', detail: 'doctor --fix 自动修复成功——' + heal.detail };
                }
                catch (e2) {
                    return { leg: 'duckdb', status: 'fail', detail: 'doctor --fix 装成功但加载失败：' + String(e2 && e2.message || e2).slice(0, 120) };
                }
            }
            return { leg: 'duckdb', status: 'degraded', detail: 'DUCKDB-UNAVAILABLE 降级处理（默认不会悄悄自动安装；可执行 doctor --fix 修复；离线时 facts/audit 无法使用，其余命令不受影响）' };
        }
        return { leg: 'duckdb', status: 'fail', detail: msg.slice(0, 160) };
    }
    finally {
        try {
            rmSync(db, { force: true });
        }
        catch { /* best effort */ }
    }
}
function probeGit() {
    const r = spawnSync('git', ['--version'], { encoding: 'utf8', timeout: 10000 });
    if (r.status === 0) {
        return { leg: 'git', status: 'ok', detail: String(r.stdout || '').trim() };
    }
    return { leg: 'git', status: 'fail', detail: 'git --version exit=' + String(r.status) + ' ' + String(r.error || r.stderr || '').replace(/\s+/g, ' ').slice(0, 120) };
}
// 看看 npm 源通不通（先读用户自己配的 registry，读不到再退回官方源）
function probeUpstream() {
    const conf = process.platform === 'win32' ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npm', 'config', 'get', 'registry'], { encoding: 'utf8', timeout: 10000 }) : spawnSync('npm', ['config', 'get', 'registry'], { encoding: 'utf8', timeout: 10000 });
    const configured = conf.status === 0 ? String(conf.stdout || '').trim() : '';
    const reg = /^https?:\/\//.test(configured) ? configured : 'https://registry.npmjs.org/';
    return new Promise(function (resolve) {
        const t0 = Date.now();
        const req = get(reg, { timeout: 5000, method: 'HEAD' }, function (res) {
            res.resume();
            resolve({ leg: 'upstream', status: 'ok', detail: reg + ' ' + String(res.statusCode) + ' ' + String(Date.now() - t0) + 'ms' });
        });
        req.on('timeout', function () {
            req.destroy();
            resolve({ leg: 'upstream', status: 'degraded', detail: 'registry HEAD timeout 5s（离线面：自愈/上游拉取不可用，本地命令不受影响）' });
        });
        req.on('error', function (e) {
            resolve({ leg: 'upstream', status: 'degraded', detail: 'registry unreachable: ' + String(e && e.message || e).slice(0, 120) });
        });
    });
}
// #66④ doctor.bindings 这条腿（r22 审计补的漏项）：绑定包在不在盘上、版本还认不认得出——跟开库那条腿各算各的
// （装上了不等于载得动，两面分开报：bindings 说的是装在盘上，duckdb 说的是能不能载起来）。
function probeBindings() {
    const sfx = platformPackageSuffix();
    if (sfx === null)
        return { leg: 'bindings', status: 'degraded', detail: '未知平台组合 ' + process.platform + '-' + process.arch + '——无官方绑定映射' };
    const dir = join(engineRoot(), 'node_modules', '@duckdb', 'node-bindings-' + sfx);
    if (!existsSync(dir)) {
        return { leg: 'bindings', status: 'degraded', detail: '绑定包缺席 @duckdb/node-bindings-' + sfx + '——修复=doctor --fix 或 npm install --omit=dev' };
    }
    try {
        const v = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
        return { leg: 'bindings', status: 'ok', detail: '@duckdb/node-bindings-' + sfx + '@' + String(v) + ' 在盘' };
    }
    catch (e) {
        return { leg: 'bindings', status: 'degraded', detail: '绑定目录在但 package.json 不可读——半成品面，doctor --fix 重装' };
    }
}
export async function runDoctor(opts) {
    const legs = [await probeDuckdb(!!(opts && opts.fix)), probeBindings(), probeGit(), await probeUpstream()];
    return { doctor: '1.0.0', legs: legs, overall: worst(legs) };
}
