// DuckDB fact store — 绑定：@duckdb/node-api（唯一选型，锁版本 1.5.5-r.5；D-075④ F4 升版——win32-arm64 官方包实存接入）
// 连接拓扑：唯一写者（READ_WRITE）+ 任意读者（READ_ONLY），承接 A-007 单写多读 SWMR。
// 本模块是 engine 对外唯一写入口：只暴露 appendFact / queryFacts，不暴露裸 SQL 写接口。
// 本机不安装原生绑定、不构建；构建与测试一律走 CI（prompt 专属 delta 第 3 条）。
// #59/D-067：原生绑定改懒加载——插件 git-clone 安装不带 node_modules，静态 import 会使
//   整个 CLI 在模块解析期崩溃（MCP server 握手都起不来）。duckdb 仅在 openWriter/openReader
//   实际调用时解析；缺失时抛结构化 DUCKDB-UNAVAILABLE，由调用面转译成 isError/exit 2。
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DuckDBConnection, DuckDBInstance, DuckDBValue } from '@duckdb/node-api';
import { AUDIT_FACT_DDL, SCHEMA_REGISTRY_DDL, AUDIT_FACT_FIELDS, assertAppendOnly, SCHEMA_VERSION_V0, type FactField } from './schema.js';

export interface FactEvent {
  fact_id: string;
  trace_id: string;
  baggage_id: string;
  scale: string;
  quadrant: string;
  dimension: string | null;
  collector_id: string;
  repo_ref: string;
  subject_ref: string;
  evidence_ref: string;
  metric: string;
  value_json: string;
  observed_at: string;
}

const WRITE_COLUMNS: readonly string[] = AUDIT_FACT_FIELDS
  .filter(function (f) { return f.name !== 'fact_seq' && f.name !== 'ingested_at'; })
  .map(function (f) { return f.name; });

// fact_seq 由 store 赋值（序列）——audit_fact_seq 在 openWriter 建序；schema_registry FK 种子行同处幂等引导。
const FACT_SEQ_NAME = 'audit_fact_seq';

const INSERT_SQL: string =
  'INSERT INTO audit_fact (fact_seq, ' + WRITE_COLUMNS.join(', ') + ', ingested_at) VALUES (nextval(' +
  String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + '), ' +
  WRITE_COLUMNS.map(function () { return '?'; }).join(', ') + ', current_timestamp)';

type DuckDBModule = typeof import('@duckdb/node-api');
let duckdbModulePromise: Promise<DuckDBModule> | null = null;

// --- #64/D-072→D-075(revised) 自愈补拉——按面分层（合法性判据=「谁在看屏幕」，每进程至多 1 次） ---
// 面探测：MCP≡MACRO_AUDIT_MCP_STDIO==='1' ／ CLI 交互面≡非 MCP 且 stdout.isTTY ／ CI 无人值守≡其余非 TTY。
// CLI 交互面保留自动自愈（stderr 预告「补拉约 40MB 最长 240s Ctrl-C 可中断」；spawnSync 保留不异步化——
//   异步 spawn 会让 CLI 拉包中途返回假 exit 0 比阻塞更糟）；MCP/CI 无人值守面永不自动拉包（宿主驱动无人可询问，
//   自动拉包在此面无工业先例）——改四段披露＋MACRO_AUDIT_SELFHEAL=1 opt-in 出口；doctor --fix=唯一显式主路。
// 机制不变：平台探测（platform+arch+ldd 判 musl）→精确单平台包恢复（in-tree 手术=npm pack+tar 解包，绕 npm#9024 arborist no-op；冷启动=npm install 整装）
// →完整性校验（.node 存在＋尺寸阈＋包内 version===锁定版，失败删半成品目录回落）；node-api JS 面亦缺才退全量。
// F4：win32-arm64 死分支摘除——@duckdb/node-bindings-win32-arm64@1.5.5-r.5 npm 实存（D-072 前提证伪），pin -r.4→-r.5；
// F8：emitSelfHeal 全 stderr 化＋success 移 createRequire 实载后（装成功≠载成功）；
// F9：MCP 不再 spawn＋CLI 有人在场已消解大半——detached+轮询异步形态存档备选不实施。
const DUCKDB_PINNED_VERSION = '1.5.5-r.5';
let selfHealAttempted = false;

// D-075① 面探测：谁在看屏幕决定自动自愈合法性。
type DuckdbSurface = 'mcp' | 'cli-interactive' | 'ci-unattended';
function duckdbSurface(): DuckdbSurface {
  if (process.env.MACRO_AUDIT_MCP_STDIO === '1') return 'mcp';
  if (process.stdout.isTTY === true) return 'cli-interactive';
  return 'ci-unattended';
}

function isMusl(): boolean {
  try {
    const r = spawnSync('ldd', ['--version'], { encoding: 'utf8', timeout: 5000 });
    return /musl/i.test((r.stdout || '') + (r.stderr || ''));
  } catch {
    return false;
  }
}

export function platformPackageSuffix(): string | null {
  const p = process.platform;
  const a = process.arch;
  if (p === 'win32' || p === 'darwin') return p + '-' + a;
  if (p === 'linux') return 'linux-' + a + (isMusl() ? '-musl' : '');
  return null;
}

export function engineRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const pj = join(dir, 'package.json');
    if (existsSync(pj)) {
      try {
        const j = JSON.parse(readFileSync(pj, 'utf8'));
        if (j && j.dependencies && j.dependencies['@duckdb/node-api']) return dir;
      } catch { /* next level */ }
    }
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return dirname(fileURLToPath(import.meta.url));
}

function emitSelfHeal(ev: Record<string, unknown>): void {
  // F8 全 stderr 化：stdout 留给命令输出/JSON-RPC 行帧——MCP stdio 避让由单通道天然满足（MACRO_AUDIT_MCP_STDIO 仍供面探测）。
  // 事件含 trigger 字段区分 auto（CLI 在场自动）/opt-in（MACRO_AUDIT_SELFHEAL=1）/doctor-fix（显式主路）——D-075⑥ opt-in 可审计性。
  console.error('DUCKDB-SELFHEAL ' + JSON.stringify(ev));
}

function selfHealDuckdb(): { ok: boolean; detail: string } {
  if (selfHealAttempted) return { ok: false, detail: 'already-attempted-once-per-process' };
  selfHealAttempted = true;
  const suffix = platformPackageSuffix();
  if (!suffix) return { ok: false, detail: 'unsupported-platform:' + process.platform + '-' + process.arch };
  const root = engineRoot();
  const nodeApiPresent = existsSync(join(root, 'node_modules', '@duckdb', 'node-api', 'package.json'));
  // dev 检出分流：package-lock.json 在=开发仓——禁 --omit=dev（npm omit 会剪掉既有 devDeps 毁开发面）；插件 clone 无 lock→--omit=dev 保最小拉取（D-072① 只读语义）
  const devCheckout = existsSync(join(root, 'package-lock.json'));
  // win32 经 cmd.exe /c 调 npm（Node≥24 硬化禁 .cmd 直调 EINVAL；shell:true 触发 DEP0190——cmd.exe 显式包装两全）；POSIX 直调 npm。
  const npmSpec = process.platform === 'win32' ? { cmd: 'cmd.exe', pre: ['/d', '/s', '/c', 'npm'] } : { cmd: 'npm', pre: [] as string[] };
  const pkgDir = join(root, 'node_modules', '@duckdb', 'node-bindings-' + suffix);
  if (!nodeApiPresent) {
    // 冷启动整装（插件纯净克隆无 node_modules——无手工树编辑，arborist 语义正常）
    const args = devCheckout ? ['install'] : ['install', '--omit=dev'];
    const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(args), { cwd: root, encoding: 'utf8', timeout: 240000 });
    if (r.status !== 0) {
      return { ok: false, detail: 'npm-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
    }
  } else {
    // #76 修复（CI run 35515346216 非 Windows 4/4 FAIL）：npm#9024——install --no-save 对 lockfile
    // 已含该 optional 边＋磁盘目录缺失的包会 arborist no-op（up to date / exit 0 / 不落盘）。
    // 绕开 arborist 树推理——npm pack + tar 解包手术恢复：纯 fetch+落文件路径，与 lockfile/npm 版本无关。
    const stage = mkdtempSync(join(root, '.duckdb-heal-'));
    try {
      const spec = '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION;
      const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(['pack', spec, '--pack-destination', stage]), { cwd: root, encoding: 'utf8', timeout: 240000 });
      if (r.status !== 0) {
        return { ok: false, detail: 'npm-pack-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
      }
      const tgz = readdirSync(stage).filter(function (f) { return f.slice(-4) === '.tgz'; })[0];
      if (!tgz) { return { ok: false, detail: 'npm-pack-no-artifact' }; }
      const xdir = join(stage, 'x');
      mkdirSync(xdir, { recursive: true });
      // 全相对路径（cwd=stage）——GNU tar on Windows 把 D:\… 当 host:file 远程规格/转义路径解析炸
      const tr = spawnSync('tar', ['-xzf', tgz, '-C', 'x'], { cwd: stage, encoding: 'utf8', timeout: 120000 });
      if (tr.status !== 0) {
        return { ok: false, detail: 'tar-exit-' + String(tr.status) + ':' + String(tr.stderr || '').replace(/\s+/g, ' ').slice(0, 140) };
      }
      rmSync(pkgDir, { recursive: true, force: true });
      mkdirSync(dirname(pkgDir), { recursive: true });
      renameSync(join(xdir, 'package'), pkgDir);
    } finally {
      rmSync(stage, { recursive: true, force: true });
    }
  }
  let ver: string | null = null;
  try { ver = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version; } catch { /* missing */ }
  let nodeCount = 0;
  let sizeOk = false;
  if (existsSync(pkgDir)) {
    for (const f of readdirSync(pkgDir)) {
      if (f.endsWith('.node')) {
        nodeCount++;
        if (statSync(join(pkgDir, f)).size > 1024 * 1024) sizeOk = true;
      }
    }
  }
  if (!(ver === DUCKDB_PINNED_VERSION && nodeCount > 0 && sizeOk)) {
    try { rmSync(pkgDir, { recursive: true, force: true }); } catch { /* best effort */ }
    return { ok: false, detail: 'integrity-fail:ver=' + String(ver) + ' node-files=' + nodeCount + ' sizeOk=' + sizeOk };
  }
  return { ok: true, detail: 'installed @duckdb/node-bindings-' + suffix + '@' + ver };
}

// D-075② 四段披露：缺失原因→修复路径（doctor --fix 显式主路 / npm install --omit=dev）→能力边界→opt-in 出口。
function unavailableMessage(surface: DuckdbSurface, healDetail: string | null, orig: unknown): string {
  const origMsg = String(orig && (orig as Error).message || orig).replace(/\s+/g, ' ').slice(0, 120);
  const reason = healDetail !== null ? '自动补拉失败（' + healDetail + '）' : '原生绑定缺失（' + origMsg + '）';
  return 'DUCKDB-UNAVAILABLE: ' + reason + '；' +
    '修复路径=插件目录执行 `macro-audit doctor --fix`（自愈唯一显式主路）或 `npm install --omit=dev`；' +
    '能力边界=' + surface + ' 面不自动安装（避免无人值守/宿主进程阻塞）——无网络时 facts/audit 不可用、其余命令不受影响；' +
    'opt-in=设 MACRO_AUDIT_SELFHEAL=1 可令本进程自动补拉（MCP 面会阻塞 JSON-RPC 最长 240s）';
}

function loadDuckdb(): Promise<DuckDBModule> {
  if (!duckdbModulePromise) {
    duckdbModulePromise = import('@duckdb/node-api').catch(async function (e) {
      const surface = duckdbSurface();
      // D-075① 分层门控：CLI 交互面 auto；其余面仅 MACRO_AUDIT_SELFHEAL=1 opt-in；MCP/CI 缺省不 spawn。
      const trigger = surface === 'cli-interactive' ? 'auto' : (process.env.MACRO_AUDIT_SELFHEAL === '1' ? 'opt-in' : null);
      let healDetail: string | null = null;
      if (trigger !== null) {
        emitSelfHeal({ phase: 'start', trigger: trigger, note: 'DuckDB 原生绑定缺失——补拉约 40MB 最长 240s' + (trigger === 'auto' ? '（Ctrl-C 可中断）' : '（opt-in 生效，阻塞本进程）'), platform: process.platform + '-' + process.arch });
        const heal = selfHealDuckdb();
        healDetail = heal.detail;
        if (heal.ok) {
          try {
            const mod = createRequire(import.meta.url)('@duckdb/node-api') as DuckDBModule;
            emitSelfHeal({ result: 'success', trigger: trigger, detail: heal.detail, platform: process.platform + '-' + process.arch });
            return mod;
          } catch (e2) { e = e2; healDetail = heal.detail + '；createRequire 仍失败'; }
        }
        emitSelfHeal({ result: 'fallback', trigger: trigger, detail: healDetail, platform: process.platform + '-' + process.arch });
      }
      duckdbModulePromise = null;
      throw new Error(unavailableMessage(surface, healDetail, e));
    });
  }
  return duckdbModulePromise;
}

// D-075③ doctor --fix=自愈唯一显式主路：复用 selfHealDuckdb() 全逻辑（平台探测/锁定版/完整性三方校验/每进程 1 次）；
// success 以 createRequire 实载为准（装成功≠载成功，F8）；输出自愈事件供 doctor 回显。
export function healDuckdbBinding(): { ok: boolean; detail: string } {
  emitSelfHeal({ phase: 'start', trigger: 'doctor-fix', note: 'doctor --fix 显式自愈——补拉约 40MB 最长 240s', platform: process.platform + '-' + process.arch });
  const heal = selfHealDuckdb();
  if (!heal.ok) { emitSelfHeal({ result: 'fallback', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch }); return heal; }
  let mod: DuckDBModule;
  try { mod = createRequire(import.meta.url)('@duckdb/node-api') as DuckDBModule; } catch (e2) {
    emitSelfHeal({ result: 'fallback', trigger: 'doctor-fix', detail: heal.detail + '；createRequire 仍失败', platform: process.platform + '-' + process.arch });
    return { ok: false, detail: heal.detail + '；createRequire 仍失败' };
  }
  // r22 审计 R1 修复：ESM 对失败 specifier 缓存 module record——同进程后续 import() 必回投原拒绝（A-072 实证）。
  // 回填 duckdbModulePromise 为 createRequire 已验载实例：--fix 后同进程 openWriter→loadDuckdb 复用本实例，
  // 不再走被污染的 import() 通道（--fix 是 MCP/CI 面唯一恢复路径，此回填即目标场景成立的前提）。
  duckdbModulePromise = Promise.resolve(mod);
  emitSelfHeal({ result: 'success', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch });
  return heal;
}

// #76/D-072 修复（CI run 35515346216 windows-20 ENOTEMPTY）：DuckDBInstance=库文件句柄持有者——
// conn.closeSync() 只断连接不释库句柄，instance 滞留待 GC/native teardown——Windows 下宿文件
// delete-pending → rmdir ENOTEMPTY（POSIX unlink-open 文件合法故 POSIX 无症状但同漏）。
// instance↔connection 登记＋closeDuckdb 双段关闭（conn→instance 序不可换）=唯一确定释放路径。
const instanceOf = new WeakMap<DuckDBConnection, DuckDBInstance>();

export function closeDuckdb(connection: DuckDBConnection): void {
  try { connection.closeSync(); }
  finally {
    const inst = instanceOf.get(connection);
    if (inst) { instanceOf.delete(connection); inst.closeSync(); }
  }
}

export async function openWriter(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
  const connection = await DuckDBConnection.create(instance);
  instanceOf.set(connection, instance);
  await connection.run(SCHEMA_REGISTRY_DDL);
  await connection.run(AUDIT_FACT_DDL);
  await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
  await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
  return connection;
}

export async function openReader(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
  const connection = await DuckDBConnection.create(instance);
  instanceOf.set(connection, instance);
  return connection;
}

export async function appendFact(connection: DuckDBConnection, event: FactEvent): Promise<void> {
  assertAppendOnly(INSERT_SQL);
  const row = WRITE_COLUMNS.map(function (c) {
    if (c === 'schema_version') { return SCHEMA_VERSION_V0; }
    const v = (event as unknown as Record<string, unknown>)[c];
    return v === undefined ? null : v;
  }) as unknown as DuckDBValue[];
  await connection.run(INSERT_SQL, row);
}

export async function queryFacts(connection: DuckDBConnection, sql: string) {
  assertAppendOnly(sql);
  return await connection.run(sql);
}

export function factFieldNames(): readonly string[] {
  return AUDIT_FACT_FIELDS.map(function (f: FactField) { return f.name; });
}
