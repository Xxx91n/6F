// DuckDB fact store — 绑定：@duckdb/node-api（唯一选型，锁版本 1.5.5-r.4）
// 连接拓扑：唯一写者（READ_WRITE）+ 任意读者（READ_ONLY），承接 A-007 单写多读 SWMR。
// 本模块是 engine 对外唯一写入口：只暴露 appendFact / queryFacts，不暴露裸 SQL 写接口。
// 本机不安装原生绑定、不构建；构建与测试一律走 CI（prompt 专属 delta 第 3 条）。
// #59/D-067：原生绑定改懒加载——插件 git-clone 安装不带 node_modules，静态 import 会使
//   整个 CLI 在模块解析期崩溃（MCP server 握手都起不来）。duckdb 仅在 openWriter/openReader
//   实际调用时解析；缺失时抛结构化 DUCKDB-UNAVAILABLE，由调用面转译成 isError/exit 2。
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIT_FACT_DDL, SCHEMA_REGISTRY_DDL, AUDIT_FACT_FIELDS, assertAppendOnly, SCHEMA_VERSION_V0 } from './schema.js';
const WRITE_COLUMNS = AUDIT_FACT_FIELDS
    .filter(function (f) { return f.name !== 'fact_seq' && f.name !== 'ingested_at'; })
    .map(function (f) { return f.name; });
// fact_seq 由 store 赋值（序列）——audit_fact_seq 在 openWriter 建序；schema_registry FK 种子行同处幂等引导。
const FACT_SEQ_NAME = 'audit_fact_seq';
const INSERT_SQL = 'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
    String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
    WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';
let duckdbModulePromise = null;
// --- #64/D-072 自愈补拉（DUCKDB-UNAVAILABLE 命中点前置自愈，每进程至多 1 次） ---
// 平台探测（process.platform+arch+ldd 判 musl）→npm install --no-save --omit=dev 精确单平台包
// →完整性校验（.node 存在＋尺寸阈＋包内 version===锁定版，失败删半成品目录回落）；
// win32-arm64 无官方包直接回落（D-072① 前提——dispatcher optionalDeps 实列其名，本仓按决策保守回落，前提勘误记票面）；
// node-api JS 面亦缺才退全量 npm install --omit=dev。
const DUCKDB_PINNED_VERSION = '1.5.5-r.4';
const NO_OFFICIAL_BINDINGS = new Set(['win32-arm64']);
let selfHealAttempted = false;
function isMusl() {
    try {
        const r = spawnSync('ldd', ['--version'], { encoding: 'utf8', timeout: 5000 });
        return /musl/i.test((r.stdout || '') + (r.stderr || ''));
    }
    catch {
        return false;
    }
}
function platformPackageSuffix() {
    const p = process.platform;
    const a = process.arch;
    if (p === 'win32' || p === 'darwin')
        return p + '-' + a;
    if (p === 'linux')
        return 'linux-' + a + (isMusl() ? '-musl' : '');
    return null;
}
function engineRoot() {
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
    const line = 'DUCKDB-SELFHEAL ' + JSON.stringify(ev);
    if (process.env.MACRO_AUDIT_MCP_STDIO === '1')
        console.error(line);
    else
        console.log(line);
}
function selfHealDuckdb() {
    if (selfHealAttempted)
        return { ok: false, detail: 'already-attempted-once-per-process' };
    selfHealAttempted = true;
    const suffix = platformPackageSuffix();
    if (!suffix)
        return { ok: false, detail: 'unsupported-platform:' + process.platform + '-' + process.arch };
    if (NO_OFFICIAL_BINDINGS.has(suffix))
        return { ok: false, detail: 'no-official-bindings:' + suffix };
    const root = engineRoot();
    const nodeApiPresent = existsSync(join(root, 'node_modules', '@duckdb', 'node-api', 'package.json'));
    // dev 检出分流：package-lock.json 在=开发仓——禁 --omit=dev（npm omit 会剪掉既有 devDeps 毁开发面）；插件 clone 无 lock→--omit=dev 保最小拉取（D-072① 只读语义）
    const devCheckout = existsSync(join(root, 'package-lock.json'));
    const npmShell = process.platform === 'win32';
    const npmCmd = 'npm';
    const args = nodeApiPresent
        ? devCheckout
            ? ['install', '--no-save', '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION]
            : ['install', '--no-save', '--omit=dev', '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION]
        : devCheckout ? ['install'] : ['install', '--omit=dev'];
    const r = spawnSync(npmCmd, args, { cwd: root, encoding: 'utf8', timeout: 240000, shell: npmShell });
    if (r.status !== 0) {
        return { ok: false, detail: 'npm-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
    }
    const pkgDir = join(root, 'node_modules', '@duckdb', 'node-bindings-' + suffix);
    let ver = null;
    try {
        ver = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
    }
    catch { /* missing */ }
    let nodeCount = 0;
    let sizeOk = false;
    if (existsSync(pkgDir)) {
        for (const f of readdirSync(pkgDir)) {
            if (f.endsWith('.node')) {
                nodeCount++;
                if (statSync(join(pkgDir, f)).size > 1024 * 1024)
                    sizeOk = true;
            }
        }
    }
    if (!(ver === DUCKDB_PINNED_VERSION && nodeCount > 0 && sizeOk)) {
        try {
            rmSync(pkgDir, { recursive: true, force: true });
        }
        catch { /* best effort */ }
        return { ok: false, detail: 'integrity-fail:ver=' + String(ver) + ' node-files=' + nodeCount + ' sizeOk=' + sizeOk };
    }
    return { ok: true, detail: 'installed @duckdb/node-bindings-' + suffix + '@' + ver };
}
function loadDuckdb() {
    if (!duckdbModulePromise) {
        duckdbModulePromise = import('@duckdb/node-api').catch(async function (e) {
            const heal = selfHealDuckdb();
            emitSelfHeal({ result: heal.ok ? 'success' : 'fallback', detail: heal.detail, platform: process.platform + '-' + process.arch });
            if (heal.ok) {
                try {
                    return createRequire(import.meta.url)('@duckdb/node-api');
                }
                catch (e2) {
                    e = e2;
                }
            }
            duckdbModulePromise = null;
            throw new Error('DUCKDB-UNAVAILABLE: 自动补拉失败（' + heal.detail + '）；在插件目录手动执行 `npm install --omit=dev` 恢复 facts/audit 读写面；无网络环境下 facts/audit 不可用、其余命令不受影响（原始解析错误：' + String(e && e.message || e) + '）');
        });
    }
    return duckdbModulePromise;
}
export async function openWriter(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
    const connection = await DuckDBConnection.create(instance);
    await connection.run(SCHEMA_REGISTRY_DDL);
    await connection.run(AUDIT_FACT_DDL);
    await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
    await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
    return connection;
}
export async function openReader(dbPath) {
    const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
    const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
    return await DuckDBConnection.create(instance);
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
