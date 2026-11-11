// ---------- 上游适配器：GitHub REST（REST 加环境变量 token 是主路，gh 登录态是可选回退 / D-048 / #47）----------
// 取数主要靠直接调 GitHub REST，token 从环境变量拿；gh 命令行只是备用的回退
// 上游接口吐出来的原始数据不出适配器这层，业务判定也不进这层
// 隔离线跟 codelore.ts 一个划法：本文件只做「发 HTTP + 解原始响应」——状态码、限流响应头解析、
// 数据结构校验都在这儿；判定的事（判据、阈值、裁决）不许进来；原始响应不出去（统一整成规范的类型或事实再往外递）。
// 路子定成这样：REST 直连，X-GitHub-Api-Version 钉死，这是主路；借本机 gh 的登录态只读用，当可选回退
// （能借就借，不硬依赖——git 是产品必须有的基础工具，gh 就是个可有可无的命令行）；
// 没给凭据就明着降级（公仓一小时 60 次的限额照实说）；凭据三级探测，用完就清，不存、不搞 OAuth。
// 最小要采的东西＝PR 列表（平台标的 Bot 身份要两头都验：user.type==Bot 且 login 带 [bot] 后缀）加 PR 详细元数据
// 加 diff 双通道（先用本地 git 算 base...head，本地没有那个 commit 才去调接口）。
// review/comment 这些眼下记成 planned，不进最小集（真要用的时候再说）。
// 限流怎么处理（照 GitHub 官方文档来）：每个响应都看 x-ratelimit-* 头，剩下的额度写进事实库日志；
// 主配额用光（remaining=0）就不等了，直接停，记下重置时间；撞上 403 或 429 但带 retry-after 的，等它说的时间再
// 试一回，还被限流就停；没 retry-after 而 remaining 又不是 0 的（官方建议等 60 秒以上，超了执行预算）直接明着停。
// 规矩：Bot 身份只记成「平台标的 Bot 身份」，不做语义上的人机推断；私有仓的场景明说「要 token」。

import { spawnSync } from 'node:child_process';
import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
import { makeFact } from '../collect/collectors.js';

export const GITHUB_REST_ADAPTER_ID = 'github-rest-adapter@v1';
export const GITHUB_REST_FAMILY = 'upstream-github-rest';
export const GITHUB_API_VERSION = '2022-11-28';
export const GITHUB_API_BASE = 'https://api.github.com';
export const GITHUB_USER_AGENT = 'macro-audit-6f';
export const UNAUTHENTICATED_HOURLY_LIMIT = 60;
export const DEFAULT_MAX_PAGES = 10;
export const DEFAULT_PER_PAGE = 100;
export const DEFAULT_MAX_RETRY_WAIT_SECONDS = 60;

// 记一下计划：这活儿最小范围之外的接口，哪天真要用再引进来
export const GITHUB_REST_PLANNED_SURFACES: readonly string[] = ['pulls.reviews', 'pulls.comments', 'issues.comments'];

export const GITHUB_REST_DESCRIPTOR: CollectorDescriptor = {
  id: GITHUB_REST_ADAPTER_ID,
  family: GITHUB_REST_FAMILY,
  dimension: null, // 这条故意留白（适配层不许塞业务判定）——维度怎么映射看 docs/upstream-dimension-map.md（D-078）
  quadrant: 'strategic'
};

// ---------- §1 凭据三级探测（用完就清：token 只搁内存里，不许写进事实库、日志或序列化数据） ----------

export type GithubCredentialStrategy = 'env-token' | 'gh-token' | 'unauthenticated';

export interface GithubCredentialResolution {
  strategy: GithubCredentialStrategy;
  token: string | null;
  degraded: boolean;
  disclosures: string[];
}

export interface GhTokenProbeResult { available: boolean; token: string | null }
export type GhTokenProbe = () => GhTokenProbeResult;

// 借 gh 的登录态：只读 gh auth token，不动它的登录状态；没装 gh 就返回 available=false（不算出错）。
export function probeGhAuthToken(binary?: string): GhTokenProbeResult {
  const bin = binary || 'gh';
  const r = spawnSync(bin, ['auth', 'token'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
  if (r.error || r.status !== 0) { return { available: false, token: null }; }
  const t = (r.stdout || '').trim();
  return { available: true, token: t.length > 0 ? t : null };
}

export function resolveGithubCredential(
  env: Readonly<Record<string, string | undefined>>,
  ghProbe?: GhTokenProbe
): GithubCredentialResolution {
  const envTok = (env.GITHUB_TOKEN || '').trim();
  if (envTok.length > 0) {
    return { strategy: 'env-token', token: envTok, degraded: false, disclosures: [] };
  }
  const gh = (ghProbe || probeGhAuthToken)();
  if (gh.available && gh.token) {
    return {
      strategy: 'gh-token', token: gh.token, degraded: false,
      disclosures: ['gh 已认证态只读借用——best-effort 可选回退（非依赖、非契约承诺）']
    };
  }
  return {
    strategy: 'unauthenticated', token: null, degraded: true,
    disclosures: [
      'unauthenticated 降级：公仓只读 ' + UNAUTHENTICATED_HOURLY_LIMIT + '/hr 限流如实披露',
      '私仓场景 = token 必需（本形态无法访问）'
    ]
  };
}

// ---------- §2 HTTP 那层（fetcher 能换——测试时从这个口离线放录制好的数据） ----------

export interface GithubHttpRequest {
  method: string;
  url: string;
  accept: string;
  token: string | null;
}

export interface GithubHttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export type GithubHttpFetcher = (req: GithubHttpRequest) => Promise<GithubHttpResponse>;
export type Sleeper = (ms: number) => Promise<void>;
export const defaultSleeper: Sleeper = (ms) => new Promise((r) => setTimeout(r, ms));

export function realHttpFetcher(timeoutMs?: number): GithubHttpFetcher {
  const t = timeoutMs || 30000;
  return async (req) => {
    const headers: Record<string, string> = {
      'Accept': req.accept,
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      'User-Agent': GITHUB_USER_AGENT
    };
    if (req.token) { headers['Authorization'] = 'Bearer ' + req.token; }
    const ac = new AbortController();
    const timer = setTimeout(() => { ac.abort(); }, t);
    try {
      const r = await fetch(req.url, { method: req.method, headers: headers, signal: ac.signal });
      const body = await r.text();
      const h: Record<string, string> = {};
      r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
      return { status: r.status, headers: h, body: body };
    } finally { clearTimeout(timer); }
  };
}

// ---------- §3 限流响应头怎么解、客户端怎么当（每个响应都读 x-ratelimit-*，配额记进调用日志再落进事实库） ----------

export interface RateLimitSnapshot {
  limit: number | null;
  remaining: number | null;
  used: number | null;
  reset_epoch: number | null;
  resource: string | null;
  retry_after_seconds: number | null;
}

function toIntOrNull(v: string | undefined): number | null {
  if (v === undefined) { return null; }
  const n = parseInt(v, 10);
  return isFinite(n) ? n : null;
}

export function parseRateLimitHeaders(headers: Record<string, string>): RateLimitSnapshot | null {
  const has = headers['x-ratelimit-limit'] !== undefined || headers['x-ratelimit-remaining'] !== undefined;
  if (!has) { return null; }
  return {
    limit: toIntOrNull(headers['x-ratelimit-limit']),
    remaining: toIntOrNull(headers['x-ratelimit-remaining']),
    used: toIntOrNull(headers['x-ratelimit-used']),
    reset_epoch: toIntOrNull(headers['x-ratelimit-reset']),
    resource: headers['x-ratelimit-resource'] || null,
    retry_after_seconds: toIntOrNull(headers['retry-after'])
  };
}

export type GithubApiErrorKind = 'none' | 'http' | 'rate-limited' | 'network' | 'parse';

export interface GithubApiResult {
  ok: boolean;
  status: number;
  data: unknown;
  error_kind: GithubApiErrorKind;
  rate_limit: RateLimitSnapshot | null;
  retried: boolean;
  detail: string | null;
}

export interface GithubCallLogEntry {
  path: string;
  status: number;
  rate_limit: RateLimitSnapshot | null;
  retried: boolean;
  error_kind: GithubApiErrorKind;
}

export interface GithubRestClient {
  call(path: string, accept?: string): Promise<GithubApiResult>;
  callLog: GithubCallLogEntry[];
}

export interface GithubRestClientOptions {
  fetcher?: GithubHttpFetcher;
  sleeper?: Sleeper;
  apiBase?: string;
  maxRetryWaitSeconds?: number;
}

export function createGithubRestClient(cred: GithubCredentialResolution, opts?: GithubRestClientOptions): GithubRestClient {
  const fetcher = (opts && opts.fetcher) || realHttpFetcher();
  const sleeper = (opts && opts.sleeper) || defaultSleeper;
  const base = (opts && opts.apiBase) || GITHUB_API_BASE;
  const maxWait = (opts && opts.maxRetryWaitSeconds !== undefined) ? opts.maxRetryWaitSeconds : DEFAULT_MAX_RETRY_WAIT_SECONDS;
  const log: GithubCallLogEntry[] = [];

  async function once(path: string, accept: string): Promise<GithubApiResult> {
    let res: GithubHttpResponse;
    try {
      res = await fetcher({ method: 'GET', url: base + path, accept: accept, token: cred.token });
    } catch (e) {
      return { ok: false, status: 0, data: null, error_kind: 'network', rate_limit: null, retried: false, detail: String((e as Error).message || e) };
    }
    const rl = parseRateLimitHeaders(res.headers);
    if (res.status >= 200 && res.status < 300) {
      if (/json/i.test(res.headers['content-type'] || '') || /^\s*[\[{]/.test(res.body)) {
        try {
          return { ok: true, status: res.status, data: JSON.parse(res.body), error_kind: 'none', rate_limit: rl, retried: false, detail: null };
        } catch (e) {
          return { ok: false, status: res.status, data: null, error_kind: 'parse', rate_limit: rl, retried: false, detail: 'json parse: ' + String((e as Error).message || e) };
        }
      }
      return { ok: true, status: res.status, data: res.body, error_kind: 'none', rate_limit: rl, retried: false, detail: null };
    }
    return { ok: false, status: res.status, data: null, error_kind: 'http', rate_limit: rl, retried: false, detail: 'http ' + res.status };
  }

  // 退避怎么等（照官方文档，等待上限管住）：
  // 主配额用光（remaining==0）就立刻停，不在程序里干等它重置；
  // 次级限流带 retry-after 且没超过最长等待，就等到点再试一回；还被限流或超了等待上限就停；
  // 次级限流没给 retry-after 的（官方建议至少等 60 秒，超了执行预算）直接停。
  // 403 或 429 记的时候就归成 rate-limited——调用日志记的是处理结论，不是光秃秃的网络状态。
  function logAttempt(path: string, r: GithubApiResult, retried: boolean): void {
    const kind = (r.status === 403 || r.status === 429) ? 'rate-limited' : r.error_kind;
    log.push({ path: path, status: r.status, rate_limit: r.rate_limit, retried: retried, error_kind: kind });
  }

  async function call(path: string, accept?: string): Promise<GithubApiResult> {
    const acc = accept || 'application/vnd.github+json';
    let r = await once(path, acc);
    logAttempt(path, r, false);
    if (r.ok || (r.status !== 403 && r.status !== 429)) { return r; }
    const rl = r.rate_limit;
    if (rl && rl.remaining === 0) {
      r.error_kind = 'rate-limited';
      r.detail = 'primary rate limit exhausted (x-ratelimit-remaining=0); reset_epoch=' + (rl.reset_epoch === null ? 'unknown' : String(rl.reset_epoch));
      return r;
    }
    if (rl && rl.retry_after_seconds !== null && rl.retry_after_seconds <= maxWait) {
      await sleeper(rl.retry_after_seconds * 1000);
      const r2 = await once(path, acc);
      r2.retried = true;
      logAttempt(path, r2, true);
      if (!r2.ok && (r2.status === 403 || r2.status === 429)) {
        r2.error_kind = 'rate-limited';
        r2.detail = 'secondary rate limit persisted after single bounded retry (retry-after=' + String(rl.retry_after_seconds) + 's)';
      }
      return r2;
    }
    r.error_kind = 'rate-limited';
    r.detail = rl && rl.retry_after_seconds !== null
      ? 'retry-after ' + String(rl.retry_after_seconds) + 's exceeds bounded wait ' + String(maxWait) + 's — stopped'
      : 'secondary rate limit without retry-after (official >=60s wait exceeds bounded budget) — stopped';
    return r;
  }

  return { call: call, callLog: log };
}

// ---------- §4 数据结构校验和解析（格式不对就明着抛错，别把异常盖住） ----------

export class GithubSchemaDrift extends Error {
  missing: string[];
  constructor(where: string, missing: string[]) {
    super('schema drift at ' + where + ': missing ' + missing.join(','));
    this.name = 'GithubSchemaDrift';
    this.missing = missing;
  }
}

function fieldAt(row: unknown, path: string): unknown {
  let cur: unknown = row;
  for (const seg of path.split('.')) {
    if (cur === null || typeof cur !== 'object') { return undefined; }
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function collectMissing(row: unknown, required: readonly string[]): string[] {
  const missing: string[] = [];
  for (const p of required) {
    if (fieldAt(row, p) === undefined) { missing.push(p); }
  }
  return missing;
}

const PR_SUMMARY_REQUIRED: readonly string[] = ['number', 'title', 'state', 'user.login', 'user.type', 'head.sha', 'base.sha', 'html_url'];
const PR_DETAIL_REQUIRED: readonly string[] = PR_SUMMARY_REQUIRED.concat(['merged', 'merge_commit_sha', 'additions', 'deletions', 'changed_files', 'commits', 'created_at']);

function num(v: unknown): number | null { return typeof v === 'number' && isFinite(v) ? v : null; }
function str(v: unknown): string | null { return typeof v === 'string' ? v : null; }
function boolOrNull(v: unknown): boolean | null { return typeof v === 'boolean' ? v : null; }

// 平台标的 Bot 身份要两头都验：user.type=='Bot' 且 login 以 [bot] 结尾——差一样就不认（照实记，不瞎猜）。
export function platformDeclaredBot(login: unknown, userType: unknown): boolean {
  return userType === 'Bot' && typeof login === 'string' && /\[bot\]$/i.test(login);
}

export interface PrSummary {
  number: number;
  title: string;
  state: string;
  draft: boolean | null;
  author_login: string;
  author_type: string;
  bot_declared: boolean;
  bot_basis: 'platform-declared:user.type==Bot&&login~[bot]';
  merged_at: string | null;
  head_sha: string;
  base_sha: string;
  html_url: string;
}

export function parsePrSummaryRow(row: unknown): PrSummary {
  const missing = collectMissing(row, PR_SUMMARY_REQUIRED);
  if (missing.length > 0) { throw new GithubSchemaDrift('pulls[]', missing); }
  const o = row as Record<string, unknown>;
  const login = str(fieldAt(o, 'user.login')) || '';
  const utype = str(fieldAt(o, 'user.type')) || '';
  return {
    number: num(o.number) || 0,
    title: str(o.title) || '',
    state: str(o.state) || '',
    draft: boolOrNull(o.draft),
    author_login: login,
    author_type: utype,
    bot_declared: platformDeclaredBot(login, utype),
    bot_basis: 'platform-declared:user.type==Bot&&login~[bot]',
    merged_at: str(o.merged_at),
    head_sha: str(fieldAt(o, 'head.sha')) || '',
    base_sha: str(fieldAt(o, 'base.sha')) || '',
    html_url: str(o.html_url) || ''
  };
}

export interface PrDetail extends PrSummary {
  merged: boolean;
  merge_commit_sha: string | null;
  additions: number | null;
  deletions: number | null;
  changed_files: number | null;
  commits: number | null;
  comments: number | null;
  review_comments: number | null;
  created_at: string | null;
  closed_at: string | null;
  merged_by_login: string | null;
  merged_by_type: string | null;
}

export function parsePrDetail(row: unknown): PrDetail {
  const missing = collectMissing(row, PR_DETAIL_REQUIRED);
  if (missing.length > 0) { throw new GithubSchemaDrift('pulls/{n}', missing); }
  const base = parsePrSummaryRow(row);
  const o = row as Record<string, unknown>;
  return {
    ...base,
    merged: o.merged === true,
    merge_commit_sha: str(o.merge_commit_sha),
    additions: num(o.additions),
    deletions: num(o.deletions),
    changed_files: num(o.changed_files),
    commits: num(o.commits),
    comments: num(o.comments),
    review_comments: num(o.review_comments),
    created_at: str(o.created_at),
    closed_at: str(o.closed_at),
    merged_by_login: str(fieldAt(o, 'merged_by.login')),
    merged_by_type: str(fieldAt(o, 'merged_by.type'))
  };
}

// ---------- §5 diff 两条通道（先用本地 git 算 base...head；本地没那个 commit 才调接口） ----------

export interface PrDiffStats {
  files_changed: number | null;
  additions: number | null;
  deletions: number | null;
}

export interface PrDiffOutcome {
  channel: 'local-git' | 'api';
  ok: boolean;
  text: string;
  stats: PrDiffStats;
  detail: string | null;
  error_kind: GithubApiErrorKind | 'local-diff' | null;
}

const NULL_STATS: PrDiffStats = { files_changed: null, additions: null, deletions: null };

// SHA 十六进制校验正则（#116 安全：防参数注入、路径穿越和怪字符；只认 7 到 40 位十六进制）
export const GIT_SHA_HEX_RE = /^[0-9a-f]{7,40}$/i;

export function isValidGitSha(sha: string): boolean {
  return typeof sha === 'string' && GIT_SHA_HEX_RE.test(sha.trim());
}

export function gitShaResolvable(repoRoot: string, sha: string): boolean {
  if (!isValidGitSha(sha)) { return false; }
  const cleanSha = sha.trim();
  const r = spawnSync('git', ['cat-file', '-e', cleanSha + '^{commit}'], { cwd: repoRoot, encoding: 'utf8', timeout: 30000, windowsHide: true });
  return !r.error && r.status === 0;
}

export function parseNumstat(text: string): PrDiffStats {
  let files = 0, add = 0, del = 0, sawNum = false;
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) { continue; }
    const parts = t.split('\t');
    if (parts.length < 3) { continue; }
    files++;
    if (parts[0] !== '-' && parts[1] !== '-') {
      const a = parseInt(parts[0], 10), d = parseInt(parts[1], 10);
      if (isFinite(a) && isFinite(d)) { add += a; del += d; sawNum = true; }
    }
  }
  return { files_changed: files, additions: sawNum ? add : null, deletions: sawNum ? del : null };
}

export function localThreeDotDiff(repoRoot: string, baseSha: string, headSha: string): { ok: boolean; text: string; stats: PrDiffStats; detail: string | null } {
  if (!isValidGitSha(baseSha) || !isValidGitSha(headSha)) {
    return { ok: false, text: '', stats: NULL_STATS, detail: 'invalid base or head git sha: baseSha=' + JSON.stringify(baseSha) + ', headSha=' + JSON.stringify(headSha) };
  }
  const cleanBase = baseSha.trim();
  const cleanHead = headSha.trim();
  const range = cleanBase + '...' + cleanHead;
  const d = spawnSync('git', ['diff', range], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000, windowsHide: true });
  if (d.error || d.status !== 0) {
    return { ok: false, text: '', stats: NULL_STATS, detail: 'git diff ' + range + ' :: ' + (d.error ? String(d.error) : (d.stderr || '').slice(-200)) };
  }
  const n = spawnSync('git', ['diff', '--numstat', range], { cwd: repoRoot, encoding: 'utf8', timeout: 60000, windowsHide: true });
  const stats = (!n.error && n.status === 0) ? parseNumstat(n.stdout || '') : NULL_STATS;
  return { ok: true, text: d.stdout || '', stats: stats, detail: null };
}

export async function resolvePrDiff(
  client: GithubRestClient,
  owner: string,
  repo: string,
  prNumber: number,
  baseSha: string,
  headSha: string,
  repoRoot?: string | null
): Promise<PrDiffOutcome> {
  // 非空的 SHA 必须过十六进制校验；恶意参数、怪字符在这儿就挡回去
  if ((baseSha && !isValidGitSha(baseSha)) || (headSha && !isValidGitSha(headSha))) {
    return { channel: 'local-git', ok: false, text: '', stats: NULL_STATS, detail: 'invalid base or head git sha: baseSha=' + JSON.stringify(baseSha) + ', headSha=' + JSON.stringify(headSha), error_kind: 'local-diff' };
  }
  const cleanBase = baseSha ? baseSha.trim() : '';
  const cleanHead = headSha ? headSha.trim() : '';
  if (repoRoot && cleanBase && cleanHead && gitShaResolvable(repoRoot, cleanBase) && gitShaResolvable(repoRoot, cleanHead)) {
    const l = localThreeDotDiff(repoRoot, cleanBase, cleanHead);
    if (l.ok) { return { channel: 'local-git', ok: true, text: l.text, stats: l.stats, detail: null, error_kind: null }; }
    // 规矩卡死（D-048）：API diff 只在本地缺 base 或 head 时当备选；本地有 commit 但 diff 跑挂了，照实报错降级，不许悄悄换通道
    return { channel: 'local-git', ok: false, text: '', stats: NULL_STATS, detail: 'local-git diff failed: ' + (l.detail || 'unknown'), error_kind: 'local-diff' };
  }
  return apiDiff(client, owner, repo, prNumber);
}

async function apiDiff(client: GithubRestClient, owner: string, repo: string, prNumber: number): Promise<PrDiffOutcome> {
  const res = await client.call('/repos/' + owner + '/' + repo + '/pulls/' + String(prNumber), 'application/vnd.github.diff');
  if (!res.ok) {
    return { channel: 'api', ok: false, text: '', stats: NULL_STATS, detail: 'api diff ' + res.error_kind + ' status=' + String(res.status), error_kind: res.error_kind };
  }
  return { channel: 'api', ok: true, text: String(res.data), stats: NULL_STATS, detail: 'api diff channel (base/head 本地缺席)', error_kind: null };
}

// ---------- §6 仓库地址怎么解（解 owner/repo 和 github.com 的 URL；不是 GitHub 的直接拒） ----------

export type GithubRepoRef = { ok: true; owner: string; repo: string } | { ok: false; reason: string };

export function parseGithubRepoRef(input: string): GithubRepoRef {
  const s = (input || '').trim();
  let m = s.match(/^https?:\/\/github\.com\/([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*?)(\.git)?\/?$/i);
  if (m) { return { ok: true, owner: m[1], repo: m[2] }; }
  m = s.match(/^git@github\.com:([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*?)(\.git)?$/i);
  if (m) { return { ok: true, owner: m[1], repo: m[2] }; }
  if (/^https?:\/\//i.test(s) || /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+:/.test(s)) {
    return { ok: false, reason: 'unsupported: 托管面非 github.com（无托管 PR 面适配）' };
  }
  m = s.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/);
  if (m) { return { ok: true, owner: m[1], repo: m[2] }; }
  return { ok: false, reason: 'unparseable repo ref' };
}

// ---------- §7 采集入口（记事实：resolution、rate_limit 运行日志、pr_summary、pr_metadata、pr_diff、run） ----------

export interface CollectGithubPrOptions {
  state?: 'open' | 'closed' | 'all';
  maxPages?: number;
  perPage?: number;
  details?: readonly number[];
  diffs?: readonly number[];
  repoRoot?: string | null;
  env?: Readonly<Record<string, string | undefined>>;
  ghTokenProbe?: GhTokenProbe;
  fetcher?: GithubHttpFetcher;
  sleeper?: Sleeper;
  apiBase?: string;
  maxRetryWaitSeconds?: number;
}

export interface GithubPrCollectResult {
  facts: CollectedFact[];
  strategy: GithubCredentialStrategy;
  degraded: boolean;
  prs_listed: number;
  calls: number;
  stopped_reason: string | null;
}

export async function collectGithubPrFacts(
  owner: string,
  repo: string,
  opts: CollectGithubPrOptions,
  ctx: CollectContext
): Promise<GithubPrCollectResult> {
  const out: CollectedFact[] = [];
  const env = opts.env || process.env;
  const repoRef = owner + '/' + repo;
  const cred = resolveGithubCredential(env, opts.ghTokenProbe);
  const client = createGithubRestClient(cred, { fetcher: opts.fetcher, sleeper: opts.sleeper, apiBase: opts.apiBase, maxRetryWaitSeconds: opts.maxRetryWaitSeconds });

  out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'credential 3-level probe', 'github_rest.resolution', {
    strategy: cred.strategy,
    degraded: cred.degraded,
    disclosures: cred.disclosures,
    api_version: GITHUB_API_VERSION,
    api_base: (opts.apiBase || GITHUB_API_BASE),
    planned_surfaces: GITHUB_REST_PLANNED_SURFACES,
    credential_storage: 'none（即用即清，不建凭据存储）'
  }));

  let stopped: string | null = null;
  const counters = { errors: 0, rate_limited: 0, schema_drift: 0, prs: 0, details: 0, diffs: 0, diffs_local: 0, diffs_api: 0 };

  // 日志事实统一出：照调用实况出 rate_limit 事实（列表、详情、diff 一个来源）
  function emitCallLog(fromIdx: number): void {
    for (let li = fromIdx; li < client.callLog.length; li++) {
      const le = client.callLog[li];
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + le.path, 'github_rest.rate_limit', {
        path: le.path,
        status: le.status,
        limit: le.rate_limit ? le.rate_limit.limit : null,
        remaining: le.rate_limit ? le.rate_limit.remaining : null,
        used: le.rate_limit ? le.rate_limit.used : null,
        reset_epoch: le.rate_limit ? le.rate_limit.reset_epoch : null,
        resource: le.rate_limit ? le.rate_limit.resource : null,
        retried: le.retried,
        error_kind: le.error_kind
      }));
    }
  }

  function noteError(path: string, r: GithubApiResult): void {
    counters.errors++;
    if (r.error_kind === 'rate-limited') {
      counters.rate_limited++;
      stopped = r.detail || 'rate-limited';
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.rate_limited', {
        path: path, status: r.status, detail: r.detail,
        reset_epoch: r.rate_limit ? r.rate_limit.reset_epoch : null,
        remaining: r.rate_limit ? r.rate_limit.remaining : null,
        retried: r.retried,
        policy: 'backoff-bounded-single-retry / stop-on-exhausted（退避不硬重试，触顶即停）'
      }));
    } else {
      stopped = r.detail || ('api error ' + String(r.status));
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.api_error', {
        path: path, status: r.status, error_kind: r.error_kind, detail: r.detail, retried: r.retried
      }));
    }
  }

  // 拉 PR 列表（一页一页拉，回来不够一页就停）
  const state = opts.state || 'all';
  const perPage = opts.perPage || DEFAULT_PER_PAGE;
  const maxPages = opts.maxPages || DEFAULT_MAX_PAGES;
  const summaries: PrSummary[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const path = '/repos/' + repoRef + '/pulls?state=' + state + '&per_page=' + String(perPage) + '&page=' + String(page);
    const logBefore = client.callLog.length;
    const r = await client.call(path);
    emitCallLog(logBefore);
    if (!r.ok) { noteError(path, r); break; }
    let rows: unknown[];
    try {
      if (!Array.isArray(r.data)) { throw new GithubSchemaDrift('pulls', ['<root is not an array>']); }
      rows = r.data;
    } catch (e) {
      counters.errors++; counters.schema_drift++;
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.schema_drift', {
        path: path, where: 'pulls', missing: (e as GithubSchemaDrift).missing || [String((e as Error).message)]
      }));
      stopped = 'schema-drift';
      break;
    }
    for (const row of rows) {
      let s: PrSummary;
      try { s = parsePrSummaryRow(row); } catch (e) {
        counters.errors++; counters.schema_drift++;
        out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.schema_drift', {
          path: path, where: 'pulls[]', missing: (e as GithubSchemaDrift).missing || [String((e as Error).message)]
        }));
        continue;
      }
      summaries.push(s);
      counters.prs++;
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(s.number), 'GET ' + path, 'github_rest.pr_summary', {
        number: s.number, title: s.title, state: s.state, draft: s.draft,
        author_login: s.author_login, author_type: s.author_type,
        bot_declared: s.bot_declared, bot_basis: s.bot_basis,
        merged_at: s.merged_at, head_sha: s.head_sha, base_sha: s.base_sha, html_url: s.html_url
      }));
    }
    if (rows.length < perPage) { break; }
  }

  // 拉 PR 详情和 diff 内容（只拉指定的号，撞上限流或出错就停）
  const byNumber = new Map<number, PrSummary>();
  for (const s of summaries) { byNumber.set(s.number, s); }
  if (!stopped) {
    for (const n of opts.details || []) {
      const path = '/repos/' + repoRef + '/pulls/' + String(n);
      const logBefore = client.callLog.length;
      const r = await client.call(path);
      emitCallLog(logBefore);
      if (!r.ok) { noteError(path, r); break; }
      try {
        const d = parsePrDetail(r.data);
        byNumber.set(d.number, d);
        counters.details++;
        out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path, 'github_rest.pr_metadata', d));
      } catch (e) {
        counters.errors++; counters.schema_drift++;
        out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path, 'github_rest.schema_drift', {
          path: path, where: 'pulls/{n}', missing: (e as GithubSchemaDrift).missing || [String((e as Error).message)]
        }));
      }
    }
  }
  if (!stopped) {
    for (const n of opts.diffs || []) {
      const meta = byNumber.get(n);
      const baseSha = meta ? meta.base_sha : '';
      const headSha = meta ? meta.head_sha : '';
      const path = '/repos/' + repoRef + '/pulls/' + String(n);
      const logBefore = client.callLog.length;
      const d = await resolvePrDiff(client, owner, repo, n, baseSha, headSha, opts.repoRoot || null);
      emitCallLog(logBefore);
      if (!d.ok) {
        counters.errors++;
        stopped = d.detail || 'diff failed';
        if (d.error_kind === 'rate-limited') {
          counters.rate_limited++;
          const lastE = client.callLog[client.callLog.length - 1];
          out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path + ' (diff)', 'github_rest.rate_limited', {
            path: path, status: lastE ? lastE.status : 0, detail: d.detail,
            reset_epoch: lastE && lastE.rate_limit ? lastE.rate_limit.reset_epoch : null,
            remaining: lastE && lastE.rate_limit ? lastE.rate_limit.remaining : null,
            retried: lastE ? lastE.retried : false,
            channel: d.channel,
            policy: 'backoff-bounded-single-retry / stop-on-exhausted（退避不硬重试，触顶即停）'
          }));
        } else {
          out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path + ' (diff)', 'github_rest.api_error', {
            path: path, error_kind: d.error_kind || 'http', detail: d.detail, channel: d.channel
          }));
        }
        break;
      }
      counters.diffs++;
      if (d.channel === 'local-git') { counters.diffs_local++; } else { counters.diffs_api++; }
      out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), d.channel === 'local-git' ? 'git diff ' + baseSha + '...' + headSha : 'GET ' + path + ' (diff)', 'github_rest.pr_diff', {
        number: n, channel: d.channel, bytes: d.text.length,
        files_changed: d.stats.files_changed, additions: d.stats.additions, deletions: d.stats.deletions,
        detail: d.detail
      }));
    }
  }

  const lastLog = client.callLog.length > 0 ? client.callLog[client.callLog.length - 1] : null;
  out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'adapter run summary', 'github_rest.run', {
    strategy: cred.strategy,
    degraded: cred.degraded,
    calls: client.callLog.length,
    errors: counters.errors,
    rate_limited: counters.rate_limited,
    schema_drift: counters.schema_drift,
    prs_listed: counters.prs,
    details: counters.details,
    diffs: counters.diffs,
    diffs_local_git: counters.diffs_local,
    diffs_api: counters.diffs_api,
    stopped_reason: stopped,
    final_remaining: lastLog && lastLog.rate_limit ? lastLog.rate_limit.remaining : null
  }));

  return {
    facts: out,
    strategy: cred.strategy,
    degraded: cred.degraded,
    prs_listed: counters.prs,
    calls: client.callLog.length,
    stopped_reason: stopped
  };
}
