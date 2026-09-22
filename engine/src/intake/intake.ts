// ---------- Repo Intake 输入面（ADR-0009 / D-013） ----------
// 裁决顺序：显式本地路径 → owner/repo 形态本地优先消歧（./ 前缀强制本地）→ 显式 URL（https/git@）才 clone。
// clone 纪律：隔离缓存 <cache>/repos/<sha256(url)[:16]>/；全深度（不传 --depth/fetch-depth 0）；
// .git 完整性校验；浅 clone 显式拒绝 SHALLOW-CLONE-REJECTED；禁远程配置执行（不递归子模块、
// hooksPath 置 noop、ext 协议禁）；凭据复用本地 git 凭据链（不新建凭据存储）。
// 入口纪律：repo add 仅 CLI/配置文件可达；kernel MCP 查询面保持只读（本模块不被 mcp 面导入）。

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
  /^file:\/\//i,           // 显式 URL 形态（file:// 仅用于离线/测试等价路径，不经网络）
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

// ---- git %cI 输出形状契约（#54 / D-059①；upstream-lock.yaml git-cli 行「输出解析为契约」enforce 位） ----
// git <2.45 对 UTC 偏移提交吐 '+00:00'，≥2.45 吐 'Z'——同一 commit object 跨版本字面漂移，
// 击穿 traceId→fact_id→receipt→report 逐字节确定性链。处置=解析边界归一化 '+00:00'→'Z'
// （非 UTC 偏移如 +08:00 两版一致不动）＋严格形状断言：归一化后不符即拒，不静默放行。
// %cI 严格形状正则=quarantine.ts GIT_ISO_STRICT_RE（契约层自持，判定单源）
// 归一化判定本体=契约层 classifyGitIsoField（ADR-0022/D-103：字段级病态三态分流，永不 throw）。
// 本函数为既有调用方保留的「抛型回执」：clean/normalized 返回合法值；quarantined 仍抛
// GITCLI-OUTPUT-CONTRACT（调用方要走隔离桶时须直接消费 classifyGitIsoField）。
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

// ---- URL 键归一（#55 / D-059⑦）：'https://…/a/b' 与 'https://…/a/b.git' 指向同一远端——
// 缓存键对归一化形态取 sha，去尾 '.git' 与尾 '/'，防同仓双缓存槽＋provenance sha 键漂移。
export function normalizeRepoUrlKey(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
}

export interface RepoAddOptions {
  cwd?: string;
  cacheRoot?: string;          // 默认 <cwd>/.macro-audit-cache
  cloneTimeoutMs?: number;     // 默认 10 分钟
  refresh?: boolean;           // 显式刷新 opt-in（#55 / D-059⑦）：仅 url 面缓存命中时生效——fetch --prune＋reset 到 origin/HEAD；绝不自动 pull
}

export interface RepoAddResult {
  kind: RepoInputKind;
  input: string;
  resolved_root: string;
  url: string | null;
  cache_dir: string | null;
  cloned: boolean;
  head_sha: string;
  shallow: boolean;                  // 恒定 false——浅仓一律拒绝
  full_depth_verified: boolean;
  remote_config_execution: 'disabled'; // 禁远程配置执行记录位
  credentials: 'local-git-credential-chain'; // 凭据复用本地链，不新建凭据存储
  // ---- 快照时点披露（#55 / D-059⑦）：审计证据须可判 staleness——
  // url 面=最近一次成功 fetch/clone 的墙钟时点；local/owner-repo 面恒 null（无 fetch 概念）。
  snapshot_fetched_at: string | null;
  cache_hit: boolean;                  // url 面：true=复用既有缓存槽未重新 fetch（远端新提交不可见，除非 refresh）
  refreshed: boolean;                  // url 面：true=本次经 refresh opt-in 显式拉取并复位到 origin/HEAD
}

// 缓存槽的最近 fetch 时点：优先 .git/FETCH_HEAD mtime（clone/fetch 均写），退 .git 目录 mtime，再退槽目录 mtime。
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
  snapshot_fetched_at: string | null;  // 最近成功 fetch/clone 墙钟时点（缓存命中未刷新=旧时点）
  refreshed: boolean;                  // 本次经显式 refresh 拉取
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
      // 显式刷新 opt-in（不自动 pull 保隔离纪律）：fetch --prune → 复位到 origin/HEAD。
      const noopHooksRefresh = join(cacheRoot, 'noop-hooks');
      gitOk(['-c', 'core.hooksPath=' + noopHooksRefresh, '-c', 'protocol.ext.allow=never', 'fetch', 'origin', '--prune'], dir, timeoutMs);
      let remoteHead = git(['rev-parse', '--verify', 'origin/HEAD'], dir, 30000);
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        // 兜底：origin/HEAD symref 缺席（部分 file:// 克隆不建）→ 取 refs/remotes/origin/* 首支
        const refs = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'], dir, 30000);
        const first = (!refs.error && refs.status === 0) ? refs.stdout.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== 'origin/HEAD'; })[0] : null;
        remoteHead = first ? git(['rev-parse', '--verify', first], dir, 30000) : remoteHead;
      }
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        throw intakeError('REFRESH-REMOTE-HEAD-UNRESOLVED', 'origin/HEAD 及 refs/remotes/origin/* 均不可解析：' + dir);
      }
      gitOk(['reset', '--hard', remoteHead.stdout], dir, timeoutMs);
      // refresh 后时点=FETCH_HEAD 新 mtime（与 clone 腿同一取证源——单源一致，缓存命中读回同值）
      return { dir: dir, cloned: false, head_sha: headSha(dir, 30000), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || new Date().toISOString(), refreshed: true };
    }
    throw intakeError('INTAKE-CACHE-COLLISION', 'cache slot occupied by foreign content: ' + dir);
  }
  mkdirSync(dirname(dir), { recursive: true });
  // 禁远程配置执行：hooksPath 指向空目录（hook 不随 clone 传输，此为双保险）；ext:: 协议禁；symlinks 关闭（Windows 安全）。
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
  const head = headSha(dir, 30000); // .git 完整性：HEAD 可解析
  if (isShallowRepo(dir, 30000)) { throw intakeError('SHALLOW-CLONE-REJECTED', 'clone is shallow (fetch-depth must be 0): ' + dir); }
  // clone 时点=FETCH_HEAD mtime（clone 必写；与缓存命中腿同一取证源——同槽同值，双钟不漂）
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
    throw intakeError('OWNER-REPO-UNRESOLVED', cls.original + ' 本地优先消歧失败——显式 URL（https/git@）才允许 clone');
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
