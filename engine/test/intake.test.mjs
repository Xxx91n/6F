// intake.test.mjs — Repo Intake 输入面契约测试（ADR-0009 / D-013；CI 每平台；作用于 dist 编译产物）
// 全离线：本地临时 git 仓 + file:// URL 等价路径实跑 clone，无网络调用。
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const I = await import(pathToFileURL(join(root, 'dist', 'intake', 'intake.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }
function throwsCode(fn, code) { try { fn(); return 'no-throw'; } catch (e) { return e.code === code ? '' : (e.code || e.message); } }

const tmp = mkdtempSync(join(tmpdir(), 'intake-test-'));
function git(args, cwd) { return spawnSync('git', args, { cwd: cwd, encoding: 'utf8' }); }
function makeRepo(dir) {
  mkdirSync(dir, { recursive: true });
  git(['init', '-q'], dir);
  git(['config', 'user.email', 't@t'], dir);
  git(['config', 'user.name', 't'], dir);
  writeFileSync(join(dir, 'a.txt'), 'a\n');
  git(['add', 'a.txt'], dir);
  git(['commit', '-qm', 'init'], dir);
  return dir;
}

// --- C 输入裁决分类 ---
check('C1 ./ 前缀强制本地', I.classifyRepoInput('./x').kind === 'local' && I.classifyRepoInput('./x').forcedLocal === true);
check('C2 ../ 前缀强制本地', I.classifyRepoInput('../x').forcedLocal === true);
check('C3 https URL → url', I.classifyRepoInput('https://github.com/o/r.git').kind === 'url');
check('C4 git@ URL → url', I.classifyRepoInput('git@github.com:o/r.git').kind === 'url');
check('C5 ssh:// URL → url', I.classifyRepoInput('ssh://git@github.com/o/r.git').kind === 'url');
check('C6 file:// URL → url（离线等价路径）', I.classifyRepoInput('file:///tmp/x').kind === 'url');
check('C7 owner/repo 形态 → owner-repo（本地优先消歧）', I.classifyRepoInput('o/r').kind === 'owner-repo');
check('C8 绝对路径 → local', I.classifyRepoInput('/abs/path/x').kind === 'local');
check('C9 Windows 盘符 → local', I.classifyRepoInput('D:\\a\\b').kind === 'local');
check('C10 多级相对路径 → local', I.classifyRepoInput('a/b/c').kind === 'local');
check('C11 空输入抛 INVALID-INPUT', throwsCode(function () { I.classifyRepoInput('  '); }, 'INVALID-INPUT') === '');

// --- L 本地路径 intake ---
const src = makeRepo(join(tmp, 'src'));
const srcSha = git(['rev-parse', 'HEAD'], src).stdout.trim();

const r1 = I.repoAdd(src, { cwd: tmp });
check('L1 本地仓 resolved_root', r1.resolved_root === src && r1.kind === 'local', JSON.stringify(r1));
check('L2 本地仓 head_sha 可解析', r1.head_sha === srcSha, r1.head_sha);
check('L3 本地仓 full_depth_verified + shallow=false', r1.full_depth_verified === true && r1.shallow === false);
check('L4 本地仓 url/cache_dir null + cloned=false', r1.url === null && r1.cache_dir === null && r1.cloned === false);
check('L5 凭据=本地链 + 远程配置执行=disabled', r1.credentials === 'local-git-credential-chain' && r1.remote_config_execution === 'disabled');

// --- S 浅 clone 显式拒绝 ---
const shallow = join(tmp, 'shallow');
const sc = git(['clone', '-q', '--depth', '1', 'file://' + src.replace(/\\/g, '/'), shallow], tmp);
check('S1 预置浅 clone 成功（夹具）', sc.status === 0 && existsSync(shallow), String(sc.stderr));
check('S2 夹具确为浅仓', I.isShallowRepo(shallow) === true);
check('S3 浅仓本地输入显式拒绝', throwsCode(function () { I.repoAdd(shallow, { cwd: tmp }); }, 'SHALLOW-CLONE-REJECTED') === '');

// --- O owner/repo 本地优先消歧 ---
const ownDir = join(tmp, 'o');
mkdirSync(ownDir, { recursive: true });
const ownRepo = makeRepo(join(ownDir, 'r'));
const r2 = I.repoAdd('o/r', { cwd: tmp });
check('O1 owner/repo 命中本地 → local 解析', r2.resolved_root === ownRepo && r2.kind === 'owner-repo' && r2.url === null, JSON.stringify(r2));
check('O2 owner/repo 本地不存在 → OWNER-REPO-UNRESOLVED（不隐式 clone）', throwsCode(function () { I.repoAdd('x/y', { cwd: tmp }); }, 'OWNER-REPO-UNRESOLVED') === '');

// --- N 不存在路径 ---
check('N1 ./ 前缀不存在路径 → PATH-NOT-FOUND', throwsCode(function () { I.repoAdd('./nope', { cwd: tmp }); }, 'PATH-NOT-FOUND') === '');
check('N2 非 git 目录 → NOT-A-GIT-REPO', throwsCode(function () { I.repoAdd(ownDir, { cwd: tmp }); }, 'NOT-A-GIT-REPO') === '');

// --- U URL opt-in clone（file:// 离线实跑全链路） ---
const cache = join(tmp, 'cache');
const url = 'file://' + src.replace(/\\/g, '/');
const r3 = I.repoAdd(url, { cwd: tmp, cacheRoot: cache });
check('U1 URL clone → resolved_root 位于隔离缓存', r3.kind === 'url' && r3.resolved_root.indexOf(cache) === 0 && r3.resolved_root.indexOf(join('repos')) >= 0, r3.resolved_root);
check('U2 clone 产物 .git 在位 + HEAD 同源', existsSync(join(r3.resolved_root, '.git')) && r3.head_sha === srcSha, r3.head_sha);
check('U3 全深度断言通过（is-shallow=false）', I.isShallowRepo(r3.resolved_root) === false && r3.full_depth_verified === true);
check('U4 缓存键 = sha256(url)[:16]', r3.resolved_root.indexOf(I.sha256Short(url)) >= 0, r3.resolved_root);
const r4 = I.repoAdd(url, { cwd: tmp, cacheRoot: cache });
check('U5 同 URL 二次 → 复用（cloned=false）', r4.cloned === false && r4.resolved_root === r3.resolved_root);
check('U6 clone 产物禁远程配置执行位恒定 disabled', r3.remote_config_execution === 'disabled' && r4.remote_config_execution === 'disabled');
const hooksPath = git(['config', '--local', '--get', 'core.hooksPath'], r3.resolved_root).stdout.trim();
check('U7 clone 产物 core.hooksPath 已置 noop（防 hook 执行）', hooksPath.length > 0 && hooksPath.indexOf('noop-hooks') >= 0, hooksPath);
const extAllow = git(['config', '--local', '--get', 'protocol.ext.allow'], r3.resolved_root).stdout.trim();
check('U8 clone 产物 protocol.ext.allow=never', extAllow === 'never', extAllow);

rmSync(tmp, { recursive: true, force: true });

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('INTAKE ' + results.length + '/' + results.length) : 'INTAKE-FAIL');
process.exit(ok ? 0 : 1);
