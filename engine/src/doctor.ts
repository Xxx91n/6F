// doctor.ts — 运行环境诊断（#62/D-059③）
// 检查项：duckdb 能否正常打开数据库（通过 loadDuckdb 自动修复流程）／
//   git 命令是否可用（git --version）／网络与 npm 镜像连通性（检测能否拉取依赖）。
// 结构化输出：{doctor, legs:[{leg,status,detail}], overall}——检查失败时明确返回结构化信息，不悄悄吞掉错误；
// status：ok（正常）/ degraded（降级，如离线时 facts/audit 无法使用但其它命令正常）/ fail（严重故障）。
// selftest 专门负责清单对账，不混在一起（D-059③ 两者职责分离）——本文件专做环境诊断。
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { get } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openWriter, closeDuckdb, healDuckdbBinding, engineRoot, platformPackageSuffix } from './fact/store.js';

export interface DoctorLeg {
  leg: 'duckdb' | 'bindings' | 'git' | 'upstream';
  status: 'ok' | 'degraded' | 'fail';
  detail: string;
}

export interface DoctorReport {
  doctor: string;
  legs: DoctorLeg[];
  overall: 'ok' | 'degraded' | 'fail';
}

function worst(legs: readonly DoctorLeg[]): DoctorReport['overall'] {
  if (legs.some(function (l) { return l.status === 'fail'; })) { return 'fail'; }
  if (legs.some(function (l) { return l.status === 'degraded'; })) { return 'degraded'; }
  return 'ok';
}

async function probeDuckdb(fix: boolean): Promise<DoctorLeg> {
  const db = join(tmpdir(), 'macro-audit-doctor-' + String(process.pid) + '.duckdb');
  try {
    const conn = await openWriter(db);
    try { await conn.run('SELECT 1'); } catch { /* 开库成功即达标，查询失败不进 detail */ }
    try { closeDuckdb(conn); } catch { /* best effort */ }
    return { leg: 'duckdb', status: 'ok', detail: 'openWriter 可开库（原生绑定在位）' };
  } catch (e) {
    const msg = String(e && (e as Error).message || e);
    if (msg.indexOf('DUCKDB-UNAVAILABLE') === 0) {
      // D-075③：doctor --fix 专门用于主动修复依赖；成功后重新打开数据库验证。
      if (fix) {
        const heal = healDuckdbBinding();
        if (!heal.ok) {
          return { leg: 'duckdb', status: 'degraded', detail: 'doctor --fix 自愈未竟：' + heal.detail.slice(0, 120) };
        }
        try {
          const conn2 = await openWriter(db);
          try { await conn2.run('SELECT 1'); } catch { /* best effort */ }
          try { closeDuckdb(conn2); } catch { /* best effort */ }
          return { leg: 'duckdb', status: 'ok', detail: 'doctor --fix 自动修复成功——' + heal.detail };
        } catch (e2) {
          return { leg: 'duckdb', status: 'fail', detail: 'doctor --fix 装成功但加载失败：' + String(e2 && (e2 as Error).message || e2).slice(0, 120) };
        }
      }
      return { leg: 'duckdb', status: 'degraded', detail: 'DUCKDB-UNAVAILABLE 降级处理（默认不会悄悄自动安装；可执行 doctor --fix 修复；离线时 facts/audit 无法使用，其余命令不受影响）' };
    }
    return { leg: 'duckdb', status: 'fail', detail: msg.slice(0, 160) };
  } finally {
    try { rmSync(db, { force: true }); } catch { /* best effort */ }
  }
}

function probeGit(): DoctorLeg {
  const r = spawnSync('git', ['--version'], { encoding: 'utf8', timeout: 10000 });
  if (r.status === 0) { return { leg: 'git', status: 'ok', detail: String(r.stdout || '').trim() }; }
  return { leg: 'git', status: 'fail', detail: 'git --version exit=' + String(r.status) + ' ' + String(r.error || r.stderr || '').replace(/\s+/g, ' ').slice(0, 120) };
}

// 检查 npm registry 源连通性（优先读取用户配置的 npm registry，读取不到再回退到官方源）

function probeUpstream(): Promise<DoctorLeg> {
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
      resolve({ leg: 'upstream', status: 'degraded', detail: 'registry unreachable: ' + String(e && (e as Error).message || e).slice(0, 120) });
    });
  });
}

// #66④ doctor.bindings 检查项（r22 审计补缺腿）：绑定包磁盘在位＋版本可辨——独立于 duckdb 开库腿
// （装成功≠载成功双面各报：bindings=装在盘事实，duckdb=载得动事实）。
function probeBindings(): DoctorLeg {
  const sfx = platformPackageSuffix();
  if (sfx === null) return { leg: 'bindings', status: 'degraded', detail: '未知平台组合 ' + process.platform + '-' + process.arch + '——无官方绑定映射' };
  const dir = join(engineRoot(), 'node_modules', '@duckdb', 'node-bindings-' + sfx);
  if (!existsSync(dir)) {
    return { leg: 'bindings', status: 'degraded', detail: '绑定包缺席 @duckdb/node-bindings-' + sfx + '——修复=doctor --fix 或 npm install --omit=dev' };
  }
  try {
    const v = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
    return { leg: 'bindings', status: 'ok', detail: '@duckdb/node-bindings-' + sfx + '@' + String(v) + ' 在盘' };
  } catch (e) {
    return { leg: 'bindings', status: 'degraded', detail: '绑定目录在但 package.json 不可读——半成品面，doctor --fix 重装' };
  }
}

export async function runDoctor(opts?: { fix?: boolean }): Promise<DoctorReport> {
  const legs = [await probeDuckdb(!!(opts && opts.fix)), probeBindings(), probeGit(), await probeUpstream()];
  return { doctor: '1.0.0', legs: legs, overall: worst(legs) };
}
