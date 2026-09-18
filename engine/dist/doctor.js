// doctor.ts — 运行时 doctor 探测（#62/D-059③ runtime-doctor-trigger 兑现：first-external-install 于 A-068 occurred）
// 三腿 probe：duckdb 可开库（经 loadDuckdb 自愈链——消费 #64/D-072⑧ DUCKDB-SELFHEAL 结构化事件与三段回落文案）／
//   git 可用（git --version）／上游连通性（npm registry HTTPS HEAD——自愈补拉与适配器拉取前提）。
// 结构化输出：{doctor, legs:[{leg,status,detail}], overall}——探测失败=结构化报告非静默；
// status：ok / degraded（有文档化回落路径，如离线时 facts/audit 不可用其余命令正常）/ fail（硬故障）。
// selftest 维持 manifest 完整性对账本职不扩容（D-059③ doctor≠manifest 对账两类工具）——本模块为独立探测面。
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { get } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openWriter, healDuckdbBinding } from './fact/store.js';
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
            conn.closeSync();
        }
        catch { /* best effort */ }
        return { leg: 'duckdb', status: 'ok', detail: 'openWriter 可开库（原生绑定在位）' };
    }
    catch (e) {
        const msg = String(e && e.message || e);
        if (msg.indexOf('DUCKDB-UNAVAILABLE') === 0) {
            // D-075③：doctor --fix=自愈唯一显式主路——显式操作员同意，任何面均可执行；成功后重开库验载。
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
                        conn2.closeSync();
                    }
                    catch { /* best effort */ }
                    return { leg: 'duckdb', status: 'ok', detail: 'doctor --fix 显式自愈成功——' + heal.detail };
                }
                catch (e2) {
                    return { leg: 'duckdb', status: 'fail', detail: 'doctor --fix 装成功但加载失败：' + String(e2 && e2.message || e2).slice(0, 120) };
                }
            }
            return { leg: 'duckdb', status: 'degraded', detail: 'DUCKDB-UNAVAILABLE 结构化回落（分层面不自动补拉；修复=doctor --fix 显式主路；无网络时 facts/audit 不可用其余命令不受影响）' };
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
// F7（D-075④）：registry 口径改 `npm config get registry` 探测回落 npmjs.org（esbuild PR#1621 同构）——
// 镜像/私有 registry 环境下探测目标=真实拉包源，不再硬编码 npmjs.org。
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
export async function runDoctor(opts) {
    const legs = [await probeDuckdb(!!(opts && opts.fix)), probeGit(), await probeUpstream()];
    return { doctor: '1.0.0', legs: legs, overall: worst(legs) };
}
