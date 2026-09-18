// DuckDB fact store — 绑定：@duckdb/node-api（唯一选型，锁版本 1.5.5-r.5；D-075④ F4 升版——win32-arm64 官方包实存接入）
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
import type { DuckDBConnection, DuckDBValue } from '@duckdb/node-api';
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
// 机制不变：平台探测（platform+arch+ldd 判 musl）→npm install --no-save --omit=dev 精确单平台包
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

function platformPackageSuffix(): string | null {
  const p = process.platform;
  const a = process.arch;
  if (p === 'win32' || p === 'darwin') return p + '-' + a;
  if (p === 'linux') return 'linux-' + a + (isMusl() ? '-musl' : '');
  return null;
}

function engineRoot(): string {
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
  const args = nodeApiPresent
    ? devCheckout
      ? ['install', '--no-save', '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION]
      : ['install', '--no-save', '--omit=dev', '@duckdb/node-bindings-' + suffix + '@' + DUCKDB_PINNED_VERSION]
    : devCheckout ? ['install'] : ['install', '--omit=dev'];
  const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(args), { cwd: root, encoding: 'utf8', timeout: 240000 });
  if (r.status !== 0) {
    return { ok: false, detail: 'npm-exit-' + String(r.status) + ':' + String(r.stderr || r.error || '').replace(/\s+/g, ' ').slice(0, 140) };
  }
  const pkgDir = join(root, 'node_modules', '@duckdb', 'node-bindings-' + suffix);
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
  try { createRequire(import.meta.url)('@duckdb/node-api'); } catch (e2) {
    emitSelfHeal({ result: 'fallback', trigger: 'doctor-fix', detail: heal.detail + '；createRequire 仍失败', platform: process.platform + '-' + process.arch });
    return { ok: false, detail: heal.detail + '；createRequire 仍失败' };
  }
  emitSelfHeal({ result: 'success', trigger: 'doctor-fix', detail: heal.detail, platform: process.platform + '-' + process.arch });
  return heal;
}

export async function openWriter(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_WRITE' });
  const connection = await DuckDBConnection.create(instance);
  await connection.run(SCHEMA_REGISTRY_DDL);
  await connection.run(AUDIT_FACT_DDL);
  await connection.run('CREATE SEQUENCE IF NOT EXISTS ' + FACT_SEQ_NAME + ' START 1');
  await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
  return connection;
}

export async function openReader(dbPath: string): Promise<DuckDBConnection> {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: 'READ_ONLY' });
  return await DuckDBConnection.create(instance);
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
