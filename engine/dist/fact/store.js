// DuckDB 事实库 —— 靠 @duckdb/node-api 原生绑定（版本钉在 1.5.5-r.5）
// 几档审计共用同一个事实库，事实只往后加。
// 两个人同时写的时候必须当场报错，不许闷头瞎重试。
// 连接这头：一个写者（READ_WRITE）加好些读者（READ_ONLY），一写多读。
// 全引擎只认这一个写入入口：对外就给 appendFact 和 queryFacts，不放开裸 SQL 写。
// 本地开不起原生依赖就别编，构建和测试统统交给远端 CI。
// 原生依赖懒加载：没装 node_modules 时不能卡在模块解析那一步就崩了。
// 真调 openWriter/openReader 时才去加载；缺依赖就抛个明白的 DUCKDB-UNAVAILABLE。
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIT_FACT_DDL, SCHEMA_REGISTRY_DDL, AUDIT_FACT_FIELDS, QUARANTINE_LOG_DDL, assertAppendOnly, SCHEMA_VERSION_V0 } from './schema.js';
import { QUARANTINE_REASON_CODES, rawBytesFingerprint, protocolCrashError } from '../intake/quarantine.js';
const WRITE_COLUMNS = AUDIT_FACT_FIELDS
    .filter(function (f) { return f.name !== 'fact_seq' && f.name !== 'ingested_at'; })
    .map(function (f) { return f.name; });
// 自增号由事实表自己管，openWriter 时把序列开好；顺手记一条 schema 的初始登记。
const FACT_SEQ_NAME = 'audit_fact_seq';
const INSERT_SQL = 'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
    String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
    WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';
let duckdbModulePromise = null;
// --- 依赖自己拉、自己修：看当前什么环境决定怎么办，一个进程最多试一回 ---
// 环境怎么分：MCP 那头、命令行有人在跟的、还有不带人跑的。
// 有人在跟就允许自动拉一把修；MCP 和不带人跑的别偷偷联网，改成明说，想开就设环境变量。
// 修的主路就是跑 doctor --fix。
// 要走的路：认平台架构 -> 把对应平台的独立包拉下来 -> 核对原生库的完整性和大小。
const DUCKDB_PINNED_VERSION = '1.5.5-r.5';
let selfHealAttempted = false;
function duckdbSurface() {
    if (process.env.MACRO_AUDIT_MCP_STDIO === '1')
        return 'mcp';
    if (process.stdout.isTTY === true)
        return 'cli-interactive';
    return 'ci-unattended';
}
function isMusl() {
    try {
        const r = spawnSync('ldd', ['--version'], { encoding: 'utf8', timeout: 5000 });
        return /musl/i.test((r.stdout || '') + (r.stderr || ''));
    }
    catch {
        return false;
    }
}
export function platformPackageSuffix() {
    const p = process.platform;
    const a = process.arch;
    if (p === 'win32' || p === 'darwin')
        return p + '-' + a;
    if (p === 'linux')
        return 'linux-' + a + (isMusl() ? '-musl' : '');
    return null;
}
export function engineRoot() {
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 8; i++) {
        const pj = join(dir, 'package.json');
        if (existsSync(pj)) {
            try {
                const j = JSON.parse(readFileSync(pj, 'utf8'));
                if (j && j.dependencies && j.dependencies['@duckdb/node-api'])
                    return dir;
            }
            catch { /* next level */ }
        }
        const up = dirname(dir);
        if (up === dir)
            break;
        dir = up;
    }
    return dirname(fileURLToPath(import.meta.url));
}
function emitSelfHeal(ev) {
    // 日志一律走 stderr，别搅了 stdout 上的正常输出和 JSON-RPC 通道。
    console.error('DUCKDB-SELFHEAL ' + JSON.stringify(ev));
}
function selfHealDuckdb() {
    if (selfHealAttempted)
        return { ok: false, detail: 'already-attempted-once-per-process' };
    selfHealAttempted = true;
    const suffix = platformPackageSuffix();
    if (!suffix)
        return { ok: false, detail: 'unsupported-platform:' + process.platform + '-' + process.arch };
    const root = engineRoot();
    const nodeApiPresent = existsSync(join(root, 'node_modules', '@duckdb', 'node-api', 'package.json'));
    // 看是不是开发环境：有 package-lock.json 就别加 --omit=dev，省得把开发依赖一块儿删了；平常安装只拉运行要用的。
    const devCheckout = existsSync(join(root, 'package-lock.json'));
    // Windows 上包一层 cmd.exe 调 npm，别的平台直接调。
    const npmSpec = process.platform === 'win32' ? { cmd: 'cmd.exe', pre: ['/d', '/s', '/c', 'npm'] } : { cmd: 'npm', pre: [] };
    const pkgDir = join(root, 'node_modules', '@duckdb', 'node-bindings-' + suffix);
    if (!nodeApiPresent) {
        // 先整包装一遍
        const args = devCheckout ? ['install'] : ['install', '--omit=dev'];
        const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(args), { cwd: root, encoding: 'utf8', timeout: 240000 });
        if (r.status !== 0) {
            return { ok: false, detail: 'npm-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
        }
    }
    else {
        // 要是只缺某个平台的底层二进制，就拿 npm pack 下回来解包，缺哪个补哪个。
        const stage = mkdtempSync(join(root, '.duckdb-heal-'));
        try {
            const spec = '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION;
            const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(['pack', spec, '--pack-destination', stage]), { cwd: root, encoding: 'utf8', timeout: 240000 });
            if (r.status !== 0) {
                return { ok: false, detail: 'npm-pack-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
            }
            const tgz = readdirSync(stage).filter(function (f) { return f.slice(-4) === '.tgz'; })[0];
            if (!tgz) {
                return { ok: false, detail: 'npm-pack-no-artifact' };
            }
            const xdir = join(stage, 'x');
            mkdirSync(xdir, { recursive: true });
            // 用相对路径解压，免得到别的平台路径解析出岔子
            const tr = spawnSync('tar', ['-xzf', tgz, '-C', 'x'], { cwd: stage, encoding: 'utf8', timeout: 120000 });
            if (tr.status !== 0) {
                return { ok: false, detail: 'tar-exit-' + String(tr.status) + ':' + String(tr.stderr || '').replace(/\s+/g, ' ').slice(0, 140) };
            }
            rmSync(pkgDir, { recursive: true, force: true });
            mkdirSync(dirname(pkgDir), { recursive: true });
            renameSync(join(xdir, 'package'), pkgDir);
        }
        finally {
            rmSync(stage, { recursive: true, force: true });
        }
    }
    let ver = null;
    try {
        ver = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
    }
    catch { /* missing */ }
    // 验一下原生的二进制：动态链接库或 .node 文件在不在，大小对不对。
    let nativeCount = 0;
    let sizeOk = false;
    if (existsSync(pkgDir)) {
        for (const f of readdirSync(pkgDir)) {
            if (/\.(node|so|dylib|dll)$/.test(f)) {
                nativeCount++;
                if (statSync(join(pkgDir, f)).size > 1024 * 1024)
                    sizeOk = true;
            }
        }
    }
    if (!(ver === DUCKDB_PINNED_VERSION && nativeCount > 0 && sizeOk)) {
        try {
            rmSync(pkgDir, { recursive: true, force: true });
        }
        catch { /* best effort */ }
        return { ok: false, detail: 'integrity-fail:ver=' + String(ver) + ' native-files=' + nativeCount + ' sizeOk=' + sizeOk };
    }
    return { ok: true, detail: 'installed @duckdb/node-bindings-' + suffix + '@' + ver };
}
// 缺东西时怎么提示：为什么缺、该怎么修、还有哪些用不了的、可选配置怎么写，分段说清。
function unavailableMessage(surface, healDetail, orig) {
    const origMsg = String(orig && orig.message || orig).replace(/\s+/g, ' ').slice(0, 120);
    const reason = healDetail !== null ? '自动补拉失败（' + healDetail + '）' : '原生绑定缺失（' + origMsg + '）';
    return 'DUCKDB-UNAVAILABLE: ' + reason + '；' +
        '修复路径=插件目录执行 `macro-audit doctor --fix`（自愈唯一显式主路）或 `npm install --omit=dev`；' +
        '能力边界=' + surface + ' 面不自动安装（避免无人值守/宿主进程阻塞）——无网络时 facts/audit 不可用、其余命令不受影响；' +
        'opt-in=设 MACRO_AUDIT_SELFHEAL=1 可令本进程自动补拉（MCP 面会阻塞 JSON-RPC 最长 240s）';
}
function loadDuckdb() {
    if (!duckdbModulePromise) {
        duckdbModulePromise = import('@duckdb/node-api').catch(async function (e) {
            const surface = duckdbSurface();
            // 看环境定：有人在跟就自己动手修；别的情况得是主动设了环境变量才试。
            const trigger = surface === 'cli-interactive' ? 'auto' : (process.env.MACRO_AUDIT_SELFHEAL === '1' ? 'opt-in' : null);
            let healDetail = null;
            if (trigger !== null) {
                emitSelfHeal({ phase: 'start', trigger: trigger, note: 'DuckDB 原生绑定缺失——补拉约 40MB 最长 240s' + (trigger === 'auto' ? '（Ctrl-C 可中断）' : '（opt-in 生效，阻塞本进程）'), platform: process.platform + '-' + process.arch });
                const heal = selfHealDuckdb();
                healDetail = heal.detail;
                if (heal.ok) {
                    try {
                        const mod = createRequire(import.meta.url)('@duckdb/node-api');
                        emitSelfHeal({ result: 'success', trigger: trigger, detail: heal.detail, platform: process.platform + '-' + process.arch });
                        return mod;
                    }
                    catch (e2) {
                        e = e2;
                        healDetail = heal.detail + '；createRequire 仍失败';
                    }
                }
                emitSelfHeal({ result: 'fallback', trigger: trigger, detail: healDetail, platform: process.platform + '-' + process.arch });
            }
            duckdbModulePromise = null;
            throw new Error(unavailableMessage(surface, healDetail, e));
        });
    }
    return duckdbModulePromise;
}
// 手动修的入口：装依赖包、验一遍，成了再用 createRequire 把模块加载起来，后面就能用。
export function healDuckdbBinding() {
    emitSelfHeal({ phase: 'start', trigger: 'doctor-fix', note: 'doctor --fix 显式自愈——补拉约 40MB 最长 240s', platform: process.platform + '-' + process.arch });
    const heal = selfHealDuckdb();
    if (!heal.ok) {
        emitSelfHeal({ result: 'fallback', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch });
        return heal;
    }
    let mod;
    try {
        mod = createRequire(import.meta.url)('@duckdb/node-api');
    }
    catch (e2) {
        emitSelfHeal({ result: 'fallback', trigger: 'doctor-fix', detail: heal.detail + '；createRequire 仍失败', platform: process.platform + '-' + process.arch });
        return { ok: false, detail: heal.detail + '；createRequire 仍失败' };
    }
    // 先前 import() 挂过，模块缓存可能还记着那次失败，这里直接把 promise 换成加载成功的。
    duckdbModulePromise = Promise.resolve(mod);
    emitSelfHeal({ result: 'success', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch });
    return heal;
}
// 关连接时连底层句柄一块儿放掉，别让文件被占着。
const instanceOf = new WeakMap();
export function closeDuckdb(connection) {
    try {
        connection.closeSync();
    }
    finally {
        const inst = instanceOf.get(connection);
        if (inst) {
            instanceOf.delete(connection);
            inst.closeSync();
        }
    }
}
export async function openWriter(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
    const connection = await DuckDBConnection.create(instance);
    instanceOf.set(connection, instance);
    await connection.run(SCHEMA_REGISTRY_DDL);
    await connection.run(AUDIT_FACT_DDL);
    await connection.run(QUARANTINE_LOG_DDL);
    await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
    await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + QUARANTINE_SEQ_NAME + ' START 1');
    await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
    await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 2, 'Registered', 'BACKWARD', 'quarantine_log added: field-level pathology disposition ledger (#78)' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 2)");
    return connection;
}
export async function openReader(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
    const connection = await DuckDBConnection.create(instance);
    instanceOf.set(connection, instance);
    return connection;
}
export async function appendFact(connection, event) {
    assertAppendOnly(INSERT_SQL);
    const row = WRITE_COLUMNS.map(function (c) {
        if (c === 'schema_version') {
            return SCHEMA_VERSION_V0;
        }
        const v = event[c];
        return v === undefined ? null : v;
    });
    await connection.run(INSERT_SQL, row);
}
export async function queryFacts(connection, sql) {
    assertAppendOnly(sql);
    return await connection.run(sql);
}
export function factFieldNames() {
    return AUDIT_FACT_FIELDS.map(function (f) { return f.name; });
}
// ---------- quarantine_log 怎么写 ----------
export const QUARANTINE_SEQ_NAME = 'quarantine_log_seq';
// quarantine_log 是单独的字段级处置记录，跟事实数据一趟事务写进去。
// 幂等靠自然键：UNIQUE(run_id,commit_sha,field_name,reason_code,disposition)，撞上重复直接跳过。
const QUARANTINE_INSERT_SQL = 'INSERT INTO quarantine_log (q_seq, run_id, commit_sha, field_name, disposition, reason_code, ' +
    'raw_bytes_hex, is_trunc, original_length, sha256_full, collector, recorded_at) VALUES (' +
    "nextval('" + QUARANTINE_SEQ_NAME + "'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING";
// 写之前先看原因码在不在已知名单里，不在就是分类逻辑出了毛病，当场报错。
export async function appendQuarantineEvent(connection, ev) {
    if (QUARANTINE_REASON_CODES.indexOf(ev.reason_code) < 0) {
        throw protocolCrashError('REASON-CODE-UNLISTED', 'reason_code outside v1 vocabulary: ' + ev.reason_code, {
            raw: ev.raw,
            crash_location: 'fact/store.ts:appendQuarantineEvent',
            run_context: { repo_ref: null, run_id: ev.run_id, commit_sha: ev.commit_sha }
        });
    }
    const fp = rawBytesFingerprint(ev.raw);
    assertAppendOnly(QUARANTINE_INSERT_SQL);
    await connection.run(QUARANTINE_INSERT_SQL, [
        ev.run_id, ev.commit_sha, ev.field_name, ev.disposition, ev.reason_code,
        fp.raw_bytes_hex, fp.is_trunc, fp.original_length, fp.sha256_full,
        ev.collector, ev.recorded_at
    ]);
}
// 事务边界：事实和隔离记录必须一趟提交，出错整趟回滚，库里头不留半截。
export class AuditIoError extends Error {
    code = 'AUDIT-IO-FAILURE';
    constructor(msg) { super(msg); this.name = 'AuditIoError'; }
}
export function isAuditIoError(e) {
    return !!e && typeof e === 'object' && e.code === 'AUDIT-IO-FAILURE';
}
// 错误分门别类：磁盘满、文件锁住、没权限算 IO 毛病；字段约束和定义不对算约束毛病。
const IO_ERROR_RE = /IO Error|disk|lock|readonly|read-only|ENOSPC|EBUSY|EPERM|out of space|full/i;
export function classifyWriteError(e) {
    const m = String(e.message || e || '');
    return IO_ERROR_RE.test(m) ? 'io' : 'constraint';
}
// 重复主键要认准：只有 fact_id 撞了唯一约束才算幂等跳过，别的约束违规照样报错回滚。
export function isFactIdUniqueViolation(e) {
    const m = String(e.message || e || '');
    return m.indexOf('Constraint Error') >= 0 && m.indexOf('unique constraint') >= 0 && m.indexOf('"fact_id:') >= 0;
}
// 批量写之前先把库里已有的号查一遍，提前把有的行筛掉，别等捕获报错再跳过。
export async function existingFactIds(connection, factIds) {
    const found = new Set();
    const CHUNK = 500;
    for (let i = 0; i < factIds.length; i += CHUNK) {
        const part = factIds.slice(i, i + CHUNK);
        const sql = 'SELECT fact_id FROM audit_fact WHERE fact_id IN (' + part.map(function () { return '?'; }).join(', ') + ')';
        assertAppendOnly(sql);
        const res = await connection.run(sql, part);
        const rows = await res.getRows();
        for (const r of rows) {
            found.add(String(r[0]));
        }
    }
    return found;
}
export async function runInTransaction(connection, fn) {
    await connection.run('BEGIN TRANSACTION');
    try {
        const r = await fn();
        await connection.run('COMMIT');
        return r;
    }
    catch (e) {
        try {
            await connection.run('ROLLBACK');
        }
        catch (_) { /* 回滚自身如果出错不覆盖原来的主要错误 */ }
        throw e;
    }
}
// 数一数这一趟里每个字段怎么处置的（修好的和隔开的各多少）。
export async function queryQuarantineCounts(connection, runId) {
    const sql = 'SELECT field_name, disposition, COUNT(*) AS n FROM quarantine_log WHERE run_id = ? GROUP BY field_name, disposition';
    assertAppendOnly(sql);
    const res = await connection.run(sql, [runId]);
    const rows = await res.getRows();
    const out = {};
    for (const r of rows) {
        const field = String(r[0]);
        const disp = String(r[1]);
        const n = Number(r[2]);
        if (!out[field]) {
            out[field] = { normalized: 0, quarantined: 0 };
        }
        if (disp === 'normalized') {
            out[field].normalized = n;
        }
        else if (disp === 'quarantined') {
            out[field].quarantined = n;
        }
    }
    return out;
}
export async function queryQuarantineRows(connection, runId) {
    const sql = 'SELECT run_id, commit_sha, field_name, disposition, reason_code, raw_bytes_hex, is_trunc, original_length, sha256_full, collector, recorded_at FROM quarantine_log WHERE run_id = ? ORDER BY q_seq';
    assertAppendOnly(sql);
    const res = await connection.run(sql, [runId]);
    const rows = await res.getRowObjects();
    return rows;
}
