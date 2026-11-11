// _lib/env-contract.mjs —— 守卫要什么环境，只在这儿说一次（D-159④ 挪下来的；D-163①③④⑥ 扩开；D-164-a 的 groupProbe 组级探测）
// need 分五类（原来四类，第五类 git-history 是 D-215② 加进来的——D-163①「四类→五类」那处勘误的三个同窗之一，D-146⑤ 的文法）：
// sibling:<name>     —— GUARD_SIBLING_ROOT 底下外部仓的工作树（画像、对照组得先有它）
// git-object:<sha>   —— 冻住的 commit/tree 对象（不挂分支的幽灵钉——普通克隆带不回来；
// 首选在临时仓里零写读法物化：mkdtemp init→unbundle 借主仓的 objects→
// 主仓再拿 GIT_ALTERNATE_OBJECT_DIRECTORIES 反借，主仓 object store 一个字节不写〔D-074〕）
// engine-deps:<spec> —— engine/node_modules 里那些 require 得起来的东西（dist 进了仓不等于依赖装好了）
// asset:<spec>       —— 被 gitignore 的外部资产（比如 40-clone-cache——设计上就不入仓，得另想办法播进去）
// git-history:<spec> —— 完整历史够不够得着（浅克隆检出来的对象库形状里没有深历史；历史够不够得着这件事，本环境判不了；
// 粒度＝portable 守卫的组级 need，不是整件 env-contract 的前置〔D-215③〕；
// 修的时候不许在守卫跑的主仓里 fetch 写 object store〔D-074〕）
// SKIP 原因三段式（D-072 修东西的指路文法）：为什么 → 手动怎么修 → 没网影响什么。
// envProbe＝整件级的前置闸（缺一样整件就 SKIP，出 0）；groupProbe＝组级前置闸（缺一组跳一组，
// 别的组照跑——46-check 的 B/C 组挂着 sibling，A/D/E 组一点不需要，portable 那段就是这么细分出来的）。
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, isAbsolute, delimiter } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { guardSkip } from './check-kit.mjs';

// 本仓画像里的 sibling 根——守卫一律走 siblingPath()，不许到处散落字面路径
export const GUARD_SIBLING_ROOT = process.env.GUARD_SIBLING_ROOT || 'D:/Aworker';

// sibling 仓名 对 磁盘目录名（仓改名只改这一处，D-159④）
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

// ---------- 修复指引的模板（D-072 三段：为什么 → 手动命令 → 没网影响什么） ----------
// caller 能拿 need(name, ok, fix) 第三个参数盖掉（asset: 这类播种命令各不一样）
const FIX = {
  'sibling:': (name) => {
    const dir = SIBLING_DIRS[name.split(':')[1]] || name.split(':')[1];
    return '原因：sibling 工作树 ' + name.split(':')[1] + ' 缺席；手动修复：将 ' + dir + ' 仓工作树置于 GUARD_SIBLING_ROOT（当前=' + GUARD_SIBLING_ROOT + '）下，或 export GUARD_SIBLING_ROOT=<其所在父目录>；无网影响面：sibling 为本地路径前置零联网，clone 源若在远端则首次播种须联网';
  },
  'git-object:': (name) => '原因：冻结 git 对象 ' + name.slice('git-object:'.length).slice(0, 12) + ' 在对象库缺席（非任何分支祖先→clone 不携带，幽灵钉面）；手动修复：守卫本应自仓内 23-frozen-*.bundle 临时仓零写入物化——若仍缺席请恢复该在仓 bundle 文件或核对其完整性（git bundle verify）后重跑；无网影响面：bundle 在仓自足零联网',
  'engine-deps:': (name) => '原因：engine/node_modules 原生依赖 ' + name.slice('engine-deps:'.length) + ' 不可加载（dist 随仓入库但 npm 依赖未装，或其平台原生绑定缺席）；手动修复：cd engine && npm ci（package-lock 锁定树；npm 新版默认关 install-scripts 时 @duckdb 绑定走依赖包通道不受影响）；无网影响面：npm ci 需 registry 访问，离线环境不可修、维持 SKIP',
  'asset:': (name) => '原因：gitignored 外部资产 ' + name.slice('asset:'.length) + ' 缺席（设计不入仓）；手动修复：重新播种或从已有机位复制该目录；无网影响面：视播种源而定——远端 clone 源须联网一次',
  // D-215① 第五类的三段式（C 稿的修正）：历史够不够得着得当前置——浅克隆的对象库形状里没有深历史，靠 cat-file 那条历史判定在环境层面判不了。
  // 修的时候不许在守卫跑的主仓里 fetch --unshallow/--deepen 去写 object store（D-074 的红线）；要加深就得联网→没网就维持 SKIP-GROUP。
  'git-history:': (name) => '原因：' + name.slice('git-history:'.length) + ' 完整历史在本检出不可得（--is-shallow-repository 为真·对象库形状不含深历史·历史可达性子面本环境不可判）；手动修复：CI checkout 配置 fetch-depth:0 或以完整克隆于独立路径物化后重跑（禁在守卫运行主仓 fetch 写 object store——D-074 边界）；无网影响面：加深克隆须联网·离线环境不可修·该组维持 SKIP-GROUP',
};

// needs = [{ name: 'sibling:jiahao'|'git-object:<sha>'|'engine-deps:<spec>'|'asset:<spec>'|'git-history:<spec>'|…,
// ok: bool, fix?: string }]；fix 没给就走前缀模板（五类前缀——git-history: 是 D-215② 的第五类，D-146⑤ 勘误三同窗之一）
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

// 组级前置闸（D-164-a①）：needs 缺一样这组就跳过（不是整件退出）——
// 吐一行 SKIP <guard>/<group>，再加一行机读的 GUARD-RESULT: SKIP-GROUP，返回 false 让调用方包个 if。
// 组级照样守 D-159③ 的三态：SKIP 不算绿、不进 allOk、不算闸过。
export function groupProbe(guardName, group, needs) {
  const missing = needs.filter((n) => !n.ok);
  if (!missing.length) return true;
  const rs = missing.map(reasonText).join('; ');
  console.log('SKIP ' + guardName + '/' + group + ' | ' + rs);
  console.log('GUARD-RESULT: SKIP-GROUP ' + guardName + ' group=' + group + ' reason=' + rs);
  return false;
}

// ---------- git-object 怎么探、临时仓怎么物化（D-163②：主仓 object store 零写） ----------
export function gitObjectOk(repoRoot, sha) {
  const r = spawnSync('git', ['-C', repoRoot, 'cat-file', '-e', sha], { encoding: 'utf8' });
  return r.status === 0;
}

// 从仓里的 bundle 物化冻住的对象：mkdtemp 建个临时仓 init → unbundle（GIT_ALTERNATE_OBJECT_DIRECTORIES
// 借主仓的 objects 补前置，对象落进临时仓）→ 返回 { objectsDir, cleanup }；
// 调用方把 objectsDir 写进 process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES，主仓所有 git
// 只读命令就看得见那些冻住的对象了（alternates 这套天生只读，主仓 object store 一个字节没写）。
export function materializeGitObjects(repoRoot, bundlePath) {
  if (!existsSync(bundlePath)) return null;
  // 临时目录得在失败路径里头建：mkdtempSync 抛的异常要是跑出去了，调用方就没机会把它报成一条 FAIL，
  // 整条 contracts-run 会被一串栈回溯拉红（#72；跟 test/contracts/_lib/env-contract.mjs 那份正本一块儿修的）。
  let tmp = null;
  const cleanup = () => { if (!tmp) { return; } try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* best-effort */ } };
  try {
    tmp = mkdtempSync(join(tmpdir(), 'env-contract-gobj-'));
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

// 两件事合起来探：对象已经在库里就直接过；不在就试着从 bundle 物化再借出来。返回 need() 能用的 ok 布尔值；
// ok=true 而且物化过 → 环境已经就位（调用方不用再动手；cleanup 挂在 process 退出上）。
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

// ---------- engine-deps 怎么探（D-163③：真 require 起来跑一下，光看目录在不在不算） ----------
export function engineDepsOk(engRoot, spec) {
  try {
    createRequire(join(engRoot, 'package.json'))(spec);
    return true;
  } catch (_) { return false; }
}

// ---------- D-179① 让结果可复现：拿 SOURCE_DATE_EPOCH 这种环境变量注入（没给就用固定的默认 epoch，不读墙上时钟） ----------
// 守卫连带再生成那面，运行时戳唯一的那点不确定性收在一处：环境变量注入＝可复现的定值（reproducible-builds.org 的惯例，秒级 unix epoch）；
// 没给→固定默认 epoch 0（确定性是默认行为，不是藏起来的开关——D-179⑥）；给的值不合法→直接抛、fail-closed
// （偷偷回落的话「明确注入了」跟「压根没给」就分不出来——跟 D-179⑥ 一个意思）。
export function deterministicRunAt() {
  const e = process.env.SOURCE_DATE_EPOCH;
  if (e === undefined || e === '') return new Date(0).toISOString();
  const n = Number(e);
  if (!Number.isFinite(n)) throw new Error('SOURCE_DATE_EPOCH 非法值：' + JSON.stringify(e) + '（须为秒级 unix epoch 数值）');
  return new Date(Math.trunc(n) * 1000).toISOString();
}
