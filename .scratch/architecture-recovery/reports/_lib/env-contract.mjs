// _lib/env-contract.mjs — 守卫环境契约 SSOT（D-159④ 下沉；D-163①③④⑥ 泛化扩展；D-164-a groupProbe 组级探测）
//   need 类型四族：
//     sibling:<name>     —— GUARD_SIBLING_ROOT 下外部仓工作树（画像/对照组前置）
//     git-object:<sha>   —— 冻结 commit/tree 对象（幽灵钉——非分支祖先 clone 不携带；
//                          首选临时仓零写入读法物化：mkdtemp init→unbundle 借主仓 objects→
//                          主仓 GIT_ALTERNATE_OBJECT_DIRECTORIES 反借，零写主仓 object store〔D-074〕）
//     engine-deps:<spec> —— engine/node_modules 原生绑定等可 require 依赖（dist 已入库≠依赖已装）
//     asset:<spec>       —— gitignored 外部资产（如 40-clone-cache——设计不入仓须另行播种）
//   SKIP reason 三段式（D-072 修复指引文法）：原因 → 手动修复命令 → 无网影响面。
//   envProbe=整件级前置闸（缺一即整件 SKIP 出 0）；groupProbe=组级前置闸（缺一组跳一组，
//   其余组照跑——46-check B/C 挂 sibling 而 A/D/E 零需 portable 段的精化面）。
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, isAbsolute, delimiter } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { guardSkip } from './check-kit.mjs';

// 本仓画像的 sibling 根——守卫一律走 siblingPath()，禁散落字面路径
export const GUARD_SIBLING_ROOT = process.env.GUARD_SIBLING_ROOT || 'D:/Aworker';

// sibling 仓名 → 磁盘目录名（仓 rename 只改这处，D-159④）
const SIBLING_DIRS = {
  'env-manager': 'env-manager',
  'anysearch-cli': 'anysearch-cli',
  'jiahao': 'jiahao',
  'goose-duck-agent': 'eys',
};

export function siblingPath(name) {
  const dir = SIBLING_DIRS[name];
  if (!dir) throw new Error('unknown sibling repo: ' + name + '（名册外引用须先登记 SIBLING_DIRS）');
  return join(GUARD_SIBLING_ROOT, dir);
}

// ---------- 修复指引模板（D-072 三段：原因 → 手动命令 → 无网影响面） ----------
//   caller 可经 need(name, ok, fix) 第三参覆写（asset: 等播种命令各异面）
const FIX = {
  'sibling:': (name) => {
    const dir = SIBLING_DIRS[name.split(':')[1]] || name.split(':')[1];
    return '原因：sibling 工作树 ' + name.split(':')[1] + ' 缺席；手动修复：将 ' + dir + ' 仓工作树置于 GUARD_SIBLING_ROOT（当前=' + GUARD_SIBLING_ROOT + '）下，或 export GUARD_SIBLING_ROOT=<其所在父目录>；无网影响面：sibling 为本地路径前置零联网，clone 源若在远端则首次播种须联网';
  },
  'git-object:': (name) => '原因：冻结 git 对象 ' + name.slice('git-object:'.length).slice(0, 12) + ' 在对象库缺席（非任何分支祖先→clone 不携带，幽灵钉面）；手动修复：守卫本应自仓内 23-frozen-*.bundle 临时仓零写入物化——若仍缺席请恢复该在仓 bundle 文件或核对其完整性（git bundle verify）后重跑；无网影响面：bundle 在仓自足零联网',
  'engine-deps:': (name) => '原因：engine/node_modules 原生依赖 ' + name.slice('engine-deps:'.length) + ' 不可加载（dist 随仓入库但 npm 依赖未装，或其平台原生绑定缺席）；手动修复：cd engine && npm ci（package-lock 锁定树；npm 新版默认关 install-scripts 时 @duckdb 绑定走依赖包通道不受影响）；无网影响面：npm ci 需 registry 访问，离线环境不可修、维持 SKIP',
  'asset:': (name) => '原因：gitignored 外部资产 ' + name.slice('asset:'.length) + ' 缺席（设计不入仓）；手动修复：重新播种或从已有机位复制该目录；无网影响面：视播种源而定——远端 clone 源须联网一次',
};

// needs = [{ name: 'sibling:jiahao'|'git-object:<sha>'|'engine-deps:<spec>'|'asset:<spec>'|…,
//            ok: bool, fix?: string }]；fix 缺省走前缀模板
export function need(name, ok, fix) {
  const prefix = Object.keys(FIX).find((p) => name.indexOf(p) === 0);
  return { name, ok: !!ok, fix: fix || (prefix ? FIX[prefix](name) : '') };
}

function reasonText(m) {
  return 'env-missing:' + m.name + (m.fix ? ' | ' + m.fix : '');
}

export function envProbe(guardName, needs) {
  const missing = needs.filter((n) => !n.ok);
  if (missing.length) guardSkip(guardName, missing.map(reasonText));
}

// 组级前置闸（D-164-a①）：needs 缺一即本组跳过（非整件退出）——
//   吐 SKIP <guard>/<group> 行 + GUARD-RESULT: SKIP-GROUP 机读行，返回 false 供调用面包 if。
//   组级仍守 D-159③ 三态纪律：SKIP 不算绿、不进 allOk、不算闸过。
export function groupProbe(guardName, group, needs) {
  const missing = needs.filter((n) => !n.ok);
  if (!missing.length) return true;
  const rs = missing.map(reasonText).join('; ');
  console.log('SKIP ' + guardName + '/' + group + ' | ' + rs);
  console.log('GUARD-RESULT: SKIP-GROUP ' + guardName + ' group=' + group + ' reason=' + rs);
  return false;
}

// ---------- git-object 探测与临时仓物化（D-163②：零写主仓 object store） ----------
export function gitObjectOk(repoRoot, sha) {
  const r = spawnSync('git', ['-C', repoRoot, 'cat-file', '-e', sha], { encoding: 'utf8' });
  return r.status === 0;
}

// 自仓内 bundle 物化冻结对象：mkdtemp 临时仓 init → unbundle（GIT_ALTERNATE_OBJECT_DIRECTORIES
//   借主仓 objects 补 prereq，对象落临时仓）→ 返回 { objectsDir, cleanup }；
//   调用方把 objectsDir 写入 process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES 后主仓全部 git
//   只读命令即见冻结对象（alternates 语义天然只读，主仓 object store 零写）。
export function materializeGitObjects(repoRoot, bundlePath) {
  if (!existsSync(bundlePath)) return null;
  const tmp = mkdtempSync(join(tmpdir(), 'env-contract-gobj-'));
  const cleanup = () => { try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* best-effort */ } };
  try {
    const gcd = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--git-common-dir'], { encoding: 'utf8' });
    const gcdPath = gcd.status === 0 ? gcd.stdout.trim() : '';
    const mainObjects = join(gcdPath ? (isAbsolute(gcdPath) ? gcdPath : join(repoRoot, gcdPath)) : join(repoRoot, '.git'), 'objects');
    let r = spawnSync('git', ['init', '-q', tmp], { encoding: 'utf8' });
    if (r.status !== 0) { cleanup(); return null; }
    const borrowEnv = Object.assign({}, process.env, { GIT_ALTERNATE_OBJECT_DIRECTORIES: mainObjects });
    r = spawnSync('git', ['-C', tmp, 'bundle', 'unbundle', bundlePath], { encoding: 'utf8', env: borrowEnv });
    if (r.status !== 0) { cleanup(); return null; }
    return { objectsDir: join(tmp, '.git', 'objects'), dir: tmp, cleanup };
  } catch (_) { cleanup(); return null; }
}

// 组合探测：对象已在库→直达；否则尝试 bundle 物化→借出。返回 need() 可用的 ok 布尔；
//   ok=true 且物化过 → env 已就位（调用方无须再动作；cleanup 挂 process exit）。
const _gobjCleanups = [];
export function gitObjectNeedOk(repoRoot, sha, bundlePath) {
  if (gitObjectOk(repoRoot, sha)) return true;
  const m = materializeGitObjects(repoRoot, bundlePath);
  if (!m) return false;
  const prev = process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES;
  process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES = prev ? prev + delimiter + m.objectsDir : m.objectsDir;
  _gobjCleanups.push(m.cleanup);
  return gitObjectOk(repoRoot, sha);
}
process.on('exit', () => { for (const c of _gobjCleanups) { try { c(); } catch (_) { /* best-effort */ } } });

// ---------- engine-deps 探测（D-163③：真 require 加载测试，非仅目录存在） ----------
export function engineDepsOk(engRoot, spec) {
  try {
    createRequire(join(engRoot, 'package.json'))(spec);
    return true;
  } catch (_) { return false; }
}

// ---------- D-179① 确定性种子化（SOURCE_DATE_EPOCH 式 env 注入；缺席=固定默认 epoch 不取墙钟） ----------
// 守卫伴生再生面 run 时戳唯一熵源收敛：env 注入=可复现定值（reproducible-builds.org 惯例，秒级 unix epoch）；
//   缺席→固定默认 epoch 0（确定性=默认行为非隐藏开关——D-179⑥）；非法值→throw fail-closed
//   （静默回落会使「显式注入」与「缺席」不可分辨——同 D-179⑥ 语义合）。
export function deterministicRunAt(env) {
  const e = (env || process.env).SOURCE_DATE_EPOCH;
  if (e === undefined || e === '') return new Date(0).toISOString();
  const n = Number(e);
  if (!Number.isFinite(n)) throw new Error('SOURCE_DATE_EPOCH 非法值：' + JSON.stringify(e) + '（须为秒级 unix epoch 数值）');
  return new Date(Math.trunc(n) * 1000).toISOString();
}
