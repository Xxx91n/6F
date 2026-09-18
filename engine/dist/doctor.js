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
import { openWriter } from './fact/store.js';
function worst(legs) {
    if (legs.some(function (l) { return l.status === 'fail'; })) {
        return 'fail';
    }
    if (legs.some(function (l) { return l.status === 'degraded'; })) {
        return 'degraded';
    }
    return 'ok';
}
async function probeDuckdb() {
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
            return { leg: 'duckdb', status: 'degraded', detail: 'DUCKDB-UNAVAILABLE 结构化回落（自愈已试一回；无网络时 facts/audit 不可用其余命令不受影响）' };
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
function probeUpstream() {
    return new Promise(function (resolve) {
        const t0 = Date.now();
        const req = get('https://registry.npmjs.org/', { timeout: 5000, method: 'HEAD' }, function (res) {
            res.resume();
            resolve({ leg: 'upstream', status: 'ok', detail: 'registry.npmjs.org ' + String(res.statusCode) + ' ' + String(Date.now() - t0) + 'ms' });
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
export async function runDoctor() {
    const legs = [await probeDuckdb(), probeGit(), await probeUpstream()];
    return { doctor: '1.0.0', legs: legs, overall: worst(legs) };
}
