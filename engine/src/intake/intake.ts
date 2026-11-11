// ---------- 判断一个仓库输入该怎么接（默认走本地路径 / owner-repo 先看本地 / 远端 URL 得明说 / D-013） ----------
// 默认用本地路径；远端 URL 必须明着给，拉下来放在单独的缓存目录里。
// 顺序是这么判的：先看是不是明摆着的本地路径 → 要是 owner/repo 那种写法，先看本地有没有（开头写 ./ 就强制当纯本地）→ 只有明着给的 URL（https/git@）才去拉。
// 拉的时候讲究：放到专门的缓存目录 <cache>/repos/<sha256(url)[:16]>/ 里；历史要拉全（不加 --depth，fetch-depth 设 0）；
// 查一下 .git 全不全；浅克隆直接拒，报 SHALLOW-CLONE-REJECTED；远端自带的钩子和脚本配置一律不许跑（子模块不递归拉、
// hooksPath 指向空目录、ext 协议禁掉）；凭据沿用本地 git 原有的配置（不另建一套凭据库）。
// 入口管住：repo add 只给命令行和配置文件用；MCP 那条查询通道照旧只读（MCP 那边的代码不引这个模块）。

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { classifyGitIsoField } from './quarantine.js';

export type RepoInputKind = 'local' | 'owner-repo' | 'url';

export interface InputClassification {
  kind: RepoInputKind;
  forcedLocal: boolean;
  original: string;
}

const URL_SCHEMES: readonly RegExp[] = [
  /^https?:\/\//i,
  /^ssh:\/\//i,
  /^git:\/\//i,
  /^file:\/\//i, // 明着给的 URL 写法（file:// 只给离线或测试用，不走网络）
  /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+:.+/ // git@host:owner/repo
];
const OWNER_REPO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function classifyRepoInput(input: string): InputClassification {
  const s = (input || '').trim();
  if (!s) { throw intakeError('INVALID-INPUT', 'empty repo input'); }
  for (const re of URL_SCHEMES) {
    if (re.test(s)) { return { kind: 'url', forcedLocal: false, original: s }; }
  }
  if (s.startsWith('./') || s.startsWith('../') || s.startsWith('.\\') || s.startsWith('..\\')) {
    return { kind: 'local', forcedLocal: true, original: s };
  }
  if (isAbsolute(s) || /^[A-Za-z]:[\\/]/.test(s) || s.startsWith('~')) {
    return { kind: 'local', forcedLocal: false, original: s };
  }
  if (OWNER_REPO_RE.test(s)) {
    return { kind: 'owner-repo', forcedLocal: false, original: s };
  }
  return { kind: 'local', forcedLocal: false, original: s };
}

export interface IntakeError extends Error { code: string }

export function intakeError(code: string, message: string): IntakeError {
  const e = new Error(code + ': ' + message) as IntakeError;
  e.code = code;
  return e;
}

interface GitRun {
  status: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

function git(args: readonly string[], cwd: string | undefined, timeoutMs: number): GitRun {
  const r = spawnSync('git', args as string[], { cwd: cwd, encoding: 'utf8', timeout: timeoutMs, windowsHide: true });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), error: r.error };
}

function gitOk(args: readonly string[], cwd: string | undefined, timeoutMs: number): GitRun {
  const r = git(args, cwd, timeoutMs);
  if (r.error || r.status !== 0) {
    throw intakeError('GIT-FAILED', 'git ' + args.join(' ') + ' :: ' + (r.error ? String(r.error) : r.stderr || ('exit ' + r.status)));
  }
  return r;
}

export function isGitRepo(dir: string, timeoutMs = 30000): boolean {
  const r = git(['rev-parse', '--git-dir'], dir, timeoutMs);
  return !r.error && r.status === 0;
}

// ---- git %cI 吐出来的格式有个老毛病（#54 / D-059①；upstream-lock.yaml 里写了解析 git-cli 输出要保持一致） ----
// git 2.45 以前，UTC 零时区的提交吐 '+00:00'；2.45 往后吐 'Z'。
// 同一个提交对象在不同 git 版本下写法不一样，traceId、fact_id、回执和报告的哈希就全对不上了。
// 怎么弄：在解析入口把 '+00:00' 统一转成 'Z'（+08:00 这类别的时区各版本写法一样，原样不动），
// 然后狠狠校验时间格式：转完只要不合标准就当场拒掉报错，绝不悄悄放过。
// %cI 的严格时间正则放在 quarantine.ts 的 GIT_ISO_STRICT_RE（规则层统一给一份，别处只有这一处定义）。
// 转换逻辑在 quarantine.ts 的 classifyGitIsoField（三种状态，碰上异常也不抛；D-103）。
// 眼下这个函数给老调用方留着抛异常的老脾气：clean 或 normalized 返回好字符串；quarantined 抛 GITCLI-OUTPUT-CONTRACT
// （调用方要是想把异常记进隔离区，直接去用 classifyGitIsoField）。
export function normalizeGitIsoDate(raw: string): string {
  const c = classifyGitIsoField(raw);
  if (c.status === 'quarantined' || c.value === null) {
    throw intakeError('GITCLI-OUTPUT-CONTRACT', 'git %cI output violates frozen shape (expect strict ISO-8601, Z or ±HH:MM zone; quarantined reason=' + c.reason_code + '): ' + JSON.stringify(raw));
  }
  return c.value;
}

export function isShallowRepo(dir: string, timeoutMs = 30000): boolean {
  const r = gitOk(['rev-parse', '--is-shallow-repository'], dir, timeoutMs);
  return r.stdout === 'true';
}

export function headSha(dir: string, timeoutMs = 30000): string {
  const r = gitOk(['rev-parse', '--verify', 'HEAD'], dir, timeoutMs);
  return r.stdout;
}

function remoteOriginUrl(dir: string, timeoutMs: number): string {
  const r = git(['config', '--local', '--get', 'remote.origin.url'], dir, timeoutMs);
  return r.status === 0 ? r.stdout : '';
}

export function sha256Short(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

// ---- URL 缓存键怎么归一（#55 / D-059⑦）：'https://…/a/b' 和 'https://…/a/b.git' 说的是同一个远端仓 ——
// 算缓存键之前先把 URL 收拾干净，尾巴上的 '.git' 和 '/' 去掉，免得同一个仓占两个坑、来源哈希对不上。
export function normalizeRepoUrlKey(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
}

export interface RepoAddOptions {
  cwd?: string;
  cacheRoot?: string; // 默认放 <cwd>/.macro-audit-cache
  cloneTimeoutMs?: number; // 默认 10 分钟
  refresh?: boolean; // 要不要手动刷新（#55 / D-059⑦）：只在 URL 命中已有缓存时才起作用，跑 fetch --prune 再重置到 origin/HEAD；绝不自己 pull
}

export interface RepoAddResult {
  kind: RepoInputKind;
  input: string;
  resolved_root: string;
  url: string | null;
  cache_dir: string | null;
  cloned: boolean;
  head_sha: string;
  shallow: boolean; // 一直是 false，浅克隆一律拒
  full_depth_verified: boolean;
  remote_config_execution: 'disabled'; // 记下来：远端那套配置不许执行
  credentials: 'local-git-credential-chain'; // 凭据沿用本地 git 的设置，不另建凭据库
  // ---- 快照是什么时候拿的（#55 / D-059⑦）：用来判断数据是不是过时了 ——
  // URL 那种写法记最近一次拉成功或克隆成功的钟点；本地或 owner-repo 的固定写 null（本来就不拉）。
  snapshot_fetched_at: string | null;
  cache_hit: boolean; // URL 写法下：true 就是直接用现成缓存、没重拉（不指定 refresh 就看不到远端新提交）
  refreshed: boolean; // URL 写法下：true 就是这回手动指定了 refresh，拉过了并重置到 origin/HEAD
}

// 缓存多久没更新：先看 .git/FETCH_HEAD 什么时候改的（克隆和拉取都会写），没有就看 .git 目录，再没有就看缓存目录本身。
function snapshotFetchedAt(dir: string): string | null {
  for (const p of [join(dir, '.git', 'FETCH_HEAD'), join(dir, '.git'), dir]) {
    try { return statSync(p).mtime.toISOString(); } catch (e) { /* try next */ }
  }
  return null;
}

export interface CloneResult {
  dir: string;
  cloned: boolean;
  head_sha: string;
  shallow: false;
  snapshot_fetched_at: string | null; // 最近一次拉成功或克隆成功的钟点（命中缓存又没刷新就还是老时间）
  refreshed: boolean; // 这回有没有手动刷新过
}

export function cloneToIsolatedCache(url: string, cacheRoot: string, timeoutMs = 600000, refresh = false): CloneResult {
  const key = sha256Short(normalizeRepoUrlKey(url));
  const dir = join(cacheRoot, 'repos', key);
  if (existsSync(dir)) {
    if (isGitRepo(dir, 30000) && normalizeRepoUrlKey(remoteOriginUrl(dir, 30000)) === normalizeRepoUrlKey(url)) {
      const shallow = isShallowRepo(dir, 30000);
      if (shallow) { throw intakeError('SHALLOW-CLONE-REJECTED', 'cached clone is shallow: ' + dir); }
      if (!refresh) {
        return { dir: dir, cloned: false, head_sha: headSha(dir, 30000), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir), refreshed: false };
      }
      // 手动刷新（不自动 pull，省得搅了工作区）：fetch --prune → 重置到 origin/HEAD。
      const noopHooksRefresh = join(cacheRoot, 'noop-hooks');
      gitOk(['-c', 'core.hooksPath=' + noopHooksRefresh, '-c', 'protocol.ext.allow=never', 'fetch', 'origin', '--prune'], dir, timeoutMs);
      let remoteHead = git(['rev-parse', '--verify', 'origin/HEAD'], dir, 30000);
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        // 兜底：origin/HEAD 这个软链没建（有些 file:// 克隆出来的仓就是不建）→ 就取 refs/remotes/origin/* 底下第一个分支
        const refs = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'], dir, 30000);
        const first = (!refs.error && refs.status === 0) ? refs.stdout.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== 'origin/HEAD'; })[0] : null;
        remoteHead = first ? git(['rev-parse', '--verify', first], dir, 30000) : remoteHead;
      }
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        throw intakeError('REFRESH-REMOTE-HEAD-UNRESOLVED', 'origin/HEAD 及 refs/remotes/origin/* 均不可解析：' + dir);
      }
      gitOk(['reset', '--hard', remoteHead.stdout], dir, timeoutMs);
      // 刷新完时间记成 FETCH_HEAD 新的修改时间（跟克隆时取的是同一处，命中缓存时读出来还是那个值）
      return { dir: dir, cloned: false, head_sha: headSha(dir, 30000), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || new Date().toISOString(), refreshed: true };
    }
    throw intakeError('INTAKE-CACHE-COLLISION', 'cache slot occupied by foreign content: ' + dir);
  }
  mkdirSync(dirname(dir), { recursive: true });
  // 远端那套配置不许跑：hooksPath 指到空目录（钩子本来不会跟着克隆走，这儿再上一道保险）；ext:: 协议禁掉；符号链接关掉（Windows 上稳妥）。
  const noopHooks = join(cacheRoot, 'noop-hooks');
  mkdirSync(noopHooks, { recursive: true });
  const r = git([
    'clone',
    '-c', 'core.hooksPath=' + noopHooks,
    '-c', 'protocol.ext.allow=never',
    '-c', 'core.symlinks=false',
    url, dir
  ], undefined, timeoutMs);
  if (r.error || r.status !== 0) {
    throw intakeError('CLONE-FAILED', 'git clone ' + url + ' :: ' + (r.error ? String(r.error) : r.stderr || ('exit ' + r.status)));
  }
  if (!isGitRepo(dir, 30000)) { throw intakeError('CLONE-FAILED', 'clone produced non-git dir: ' + dir); }
  const head = headSha(dir, 30000); // 确认 .git 是全的，HEAD 也能正常解析
  if (isShallowRepo(dir, 30000)) { throw intakeError('SHALLOW-CLONE-REJECTED', 'clone is shallow (fetch-depth must be 0): ' + dir); }
  // 克隆时间记成 FETCH_HEAD 的修改时间（克隆准会写它；跟命中缓存时取的是同一处，记的数不走样）
  return { dir: dir, cloned: true, head_sha: head, shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || new Date().toISOString(), refreshed: false };
}

export function repoAdd(input: string, opts: RepoAddOptions = {}): RepoAddResult {
  const cwd = opts.cwd || process.cwd();
  const timeoutMs = opts.cloneTimeoutMs || 600000;
  const cls = classifyRepoInput(input);
  const base = {
    kind: cls.kind,
    input: input,
    remote_config_execution: 'disabled' as const,
    credentials: 'local-git-credential-chain' as const
  };

  if (cls.kind === 'url') {
    const cacheRoot = resolve(cwd, opts.cacheRoot || '.macro-audit-cache');
    const c = cloneToIsolatedCache(cls.original, cacheRoot, timeoutMs, opts.refresh === true);
    return {
      ...base,
      resolved_root: c.dir,
      url: cls.original,
      cache_dir: c.dir,
      cloned: c.cloned,
      head_sha: c.head_sha,
      shallow: false,
      full_depth_verified: true,
      snapshot_fetched_at: c.snapshot_fetched_at,
      cache_hit: !c.cloned,
      refreshed: c.refreshed
    };
  }

  if (cls.kind === 'owner-repo') {
    const localCandidate = resolve(cwd, cls.original);
    if (existsSync(localCandidate) && statSync(localCandidate).isDirectory()) {
      return finishLocal({ ...base, resolved_root: localCandidate }, timeoutMs);
    }
    throw intakeError('OWNER-REPO-UNRESOLVED', cls.original + ' 本地路径不存在——只有给出明确的 URL（如 https 或 git@）才允许克隆');
  }

  const localPath = resolve(cwd, cls.original);
  if (!existsSync(localPath) || !statSync(localPath).isDirectory()) {
    throw intakeError('PATH-NOT-FOUND', 'local path not found: ' + localPath);
  }
  return finishLocal({ ...base, resolved_root: localPath }, timeoutMs);
}

function finishLocal(result: Omit<RepoAddResult, 'url' | 'cache_dir' | 'cloned' | 'head_sha' | 'shallow' | 'full_depth_verified' | 'snapshot_fetched_at' | 'cache_hit' | 'refreshed'>, timeoutMs: number): RepoAddResult {
  if (!isGitRepo(result.resolved_root, timeoutMs)) {
    throw intakeError('NOT-A-GIT-REPO', 'not a git repository: ' + result.resolved_root);
  }
  if (isShallowRepo(result.resolved_root, timeoutMs)) {
    throw intakeError('SHALLOW-CLONE-REJECTED', 'shallow local repository rejected: ' + result.resolved_root);
  }
  return {
    ...result,
    url: null,
    cache_dir: null,
    cloned: false,
    head_sha: headSha(result.resolved_root, timeoutMs),
    shallow: false,
    full_depth_verified: true,
    snapshot_fetched_at: null,
    cache_hit: false,
    refreshed: false
  };
}
