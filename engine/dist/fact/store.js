// DuckDB fact store — 依赖原生绑定：@duckdb/node-api（版本锁定为 1.5.5-r.5）
// 理由：多个审计档位共用同一套事实存储，事实数据单向追加。
// 理由：并发写入时必须明确失败并报错，不做无意义的盲目重试。
// 连接管理：单个写入者（READ_WRITE）+ 多个读取者（READ_ONLY），单写多读。
// 本模块是引擎唯一的写入入口：对外只提供 appendFact 与 queryFacts，不开放原生 SQL 写入。
// 本地开发不主动编译原生依赖，构建和测试统一走远端 CI。
// 原生依赖采用懒加载：避免在没有 node_modules 时模块解析阶段崩溃。
// 仅在真正调用 openWriter/openReader 时加载；缺少依赖时抛出明确的 DUCKDB-UNAVAILABLE 错误。
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
// 自增序号由事实表管理，在 openWriter 时初始化序列；同时登记 schema 初始记录。
const FACT_SEQ_NAME = 'audit_fact_seq';
const INSERT_SQL = 'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
    String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
    WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';
let duckdbModulePromise = null;
// --- 依赖自动拉取与修复：根据当前运行环境决定策略，每个进程最多尝试一次 ---
// 环境判断：MCP 模式、命令行交互模式、或者非交互环境。
// 交互模式允许自动尝试拉取修复；MCP 与非交互模式不自动联网下载，改为明确提示并可通过环境变量开启。
// 修复主途径为运行 doctor --fix 命令。
// 流程：检测系统架构与平台 -> 拉取对应平台的独立包 -> 校验原生库文件完整性与体积。
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
    // 日志统一输出到 stderr，避免干扰 stdout 上的正常输出或 JSON-RPC 通信。
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
    // 判断开发环境：有 package-lock.json 则不使用 --omit=dev，避免误删开发依赖；普通安装则只拉运行依赖。
    const devCheckout = existsSync(join(root, 'package-lock.json'));
    // Windows 下通过 cmd.exe 包装调用 npm 命令，其余平台直接调用。
    const npmSpec = process.platform === 'win32' ? { cmd: 'cmd.exe', pre: ['/d', '/s', '/c', 'npm'] } : { cmd: 'npm', pre: [] };
    const pkgDir = join(root, 'node_modules', '@duckdb', 'node-bindings-' + suffix);
    if (!nodeApiPresent) {
        // 首次完整安装依赖包
        const args = devCheckout ? ['install'] : ['install', '--omit=dev'];
        const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(args), { cwd: root, encoding: 'utf8', timeout: 240000 });
        if (r.status !== 0) {
            return { ok: false, detail: 'npm-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
        }
    }
    else {
        // 仅缺少单个平台的底层二进制时，通过 npm pack 下载并解包，精准补齐对应文件。
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
            // 使用相对路径解压，避免跨平台路径解析异常
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
    // 原生二进制文件校验：检查是否存在动态链接库或 .node 文件，且文件大小符合预期。
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
// 缺失提示说明：分段说明缺失原因、修复建议命令、运行限制以及可选配置项。
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
            // 根据运行环境判断：交互环境自动尝试修复；其他环境仅在主动配置环境变量时尝试。
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
// 主动修复入口：执行依赖包安装与校验，成功后使用 createRequire 加载模块，确保后续调用可用。
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
    // 如果之前 import() 失败过，模块缓存可能记录拒绝状态，在此直接更新 promise 为成功加载的模块。
    duckdbModulePromise = Promise.resolve(mod);
    emitSelfHeal({ result: 'success', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch });
    return heal;
}
// 关闭连接与释放实例：不仅断开连接，还要释放底层的数据库句柄，防止文件占用。
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
// ---------- quarantine_log 写入流程 ----------
export const QUARANTINE_SEQ_NAME = 'quarantine_log_seq';
// 理由：quarantine_log 是独立的字段级处置记录，与事实数据在同一事务中写入。
// 使用自然键实现幂等：UNIQUE(run_id,commit_sha,field_name,reason_code,disposition) 遇到重复记录直接跳过。
const QUARANTINE_INSERT_SQL = 'INSERT INTO quarantine_log (q_seq, run_id, commit_sha, field_name, disposition, reason_code, ' +
    'raw_bytes_hex, is_trunc, original_length, sha256_full, collector, recorded_at) VALUES (' +
    "nextval('" + QUARANTINE_SEQ_NAME + "'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING";
// 写入前校验原因码是否在已知列表中，如果不在说明分类逻辑存在缺陷，立刻报错。
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
// 事务边界管理：保证事实数据与隔离记录在同一个事务中提交，出错时完整回滚，防止写入半截数据。
export class AuditIoError extends Error {
    code = 'AUDIT-IO-FAILURE';
    constructor(msg) { super(msg); this.name = 'AuditIoError'; }
}
export function isAuditIoError(e) {
    return !!e && typeof e === 'object' && e.code === 'AUDIT-IO-FAILURE';
}
// 错误类型区分：磁盘满、文件锁、权限问题归为 IO 错误；字段约束与定义问题归为约束错误。
const IO_ERROR_RE = /IO Error|disk|lock|readonly|read-only|ENOSPC|EBUSY|EPERM|out of space|full/i;
export function classifyWriteError(e) {
    const m = String(e.message || e || '');
    return IO_ERROR_RE.test(m) ? 'io' : 'constraint';
}
// 精确识别重复主键错误：只有 fact_id 唯一约束冲突才视为幂等跳过，其余约束违规直接报错回滚。
export function isFactIdUniqueViolation(e) {
    const m = String(e.message || e || '');
    return m.indexOf('Constraint Error') >= 0 && m.indexOf('unique constraint') >= 0 && m.indexOf('"fact_id:') >= 0;
}
// 批量写入前先查询数据库中已存在的事实编号，提前过滤已有的行，避免靠捕获报错来跳过。
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
// 统计一次运行中各个字段的处置计数（已修复 vs 已隔离）。
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
