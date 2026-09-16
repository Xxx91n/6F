// ---------- 上游适配器：GitHub REST（ADR-0020 / D-048 / #47）----------
// 反腐层纪律（同 codelore.ts）：本文件只做「HTTP 调用 + 原始响应解析」——状态码、限流头解析、
// schema 校验在此；业务规则（判据/阈值/裁决）禁止进入本层；raw 上游响应不出本层（以结构化类型/fact 传出）。
// 路径钉死（ADR-0020）：REST 直连＋X-GitHub-Api-Version pin 主路；gh 已认证态只读借用 = 可选回退
// （best-effort 非依赖、非 git-cli 先例延伸——git 为产品硬依赖、gh 为额外二进制）；
// 无认证 = 显式降级（公仓 60/hr 如实披露）；凭据三级探测即用即清，不建凭据存储、不引 OAuth。
// 最小契约 = PR 枚举（平台声明 Bot 判读：user.type==Bot ＋ login [bot] 后缀双检）＋PR 元数据
// ＋diff 双通道（本地 git base...head 优先，API diff 仅在 base/head 本地缺席时兜底）。
// review/comment 面 = planned 登记不入最小集（YAGNI，同 D-035 逐面纪律）。
// 限流（docs.github.com rate-limits 原文对齐）：每响应读 x-ratelimit-* 头＋余额写事实库运行日志；
// primary 耗尽（remaining=0）→ 不等待即停＋标注 reset_epoch；403/429 带 retry-after → 有界等待后
// 单次重试，仍限 → 停；无 retry-after 且 remaining≠0 → 官方要求 ≥60s 等待超进程预算 → 显式停。
// 措辞纪律：Bot 判读 = 「平台声明的 Bot 身份」，非语义级人/机判定；私仓场景披露「token 必需」。

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

// planned 登记（与锁表 contract 同源措辞）：本票最小契约之外的平台面，YAGNI 待真实需求拉动
export const GITHUB_REST_PLANNED_SURFACES: readonly string[] = ['pulls.reviews', 'pulls.comments', 'issues.comments'];

export const GITHUB_REST_DESCRIPTOR: CollectorDescriptor = {
  id: GITHUB_REST_ADAPTER_ID,
  family: GITHUB_REST_FAMILY,
  dimension: null,
  quadrant: 'strategic'
};

// ---------- §1 凭据三级探测（即用即清：token 仅进程内存，禁止进 fact/日志/序列化输出） ----------

export type GithubCredentialStrategy = 'env-token' | 'gh-token' | 'unauthenticated';

export interface GithubCredentialResolution {
  strategy: GithubCredentialStrategy;
  token: string | null;
  degraded: boolean;
  disclosures: string[];
}

export interface GhTokenProbeResult { available: boolean; token: string | null }
export type GhTokenProbe = () => GhTokenProbeResult;

// gh 已认证态只读借用：gh auth token 只读不改其 auth 态；gh 缺席 → available=false（非错误）。
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

// ---------- §2 HTTP 面（fetcher 可注入——golden cassette 离线回放经此缝） ----------

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

// ---------- §3 限流头解析 + 客户端（每响应读 x-ratelimit-*，余额进 callLog → 事实库） ----------

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
      log.push({ path: path, status: 0, rate_limit: null });
      return { ok: false, status: 0, data: null, error_kind: 'network', rate_limit: null, retried: false, detail: String((e as Error).message || e) };
    }
    const rl = parseRateLimitHeaders(res.headers);
    log.push({ path: path, status: res.status, rate_limit: rl });
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

  // 退避策略（官方文档对齐，确定性有界）：
  //  primary 耗尽（remaining==0）→ 即停，不进程内傻等 reset；
  //  次级限流带 retry-after ≤ maxWait → 等一次重试一次；仍限/超限 → 停；
  //  次级限流无 retry-after（官方要求 ≥60s）→ 超有界预算即停。
  async function call(path: string, accept?: string): Promise<GithubApiResult> {
    const acc = accept || 'application/vnd.github+json';
    let r = await once(path, acc);
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

// ---------- §4 schema 校验 + 解析（漂移显式抛错，不出假阳性） ----------

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

// 平台声明的 Bot 身份双检：user.type=='Bot' 且 login 以 [bot] 结尾——缺一不判 Bot（如实，不语义推断）。
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

export function parsePrList(data: unknown): PrSummary[] {
  if (!Array.isArray(data)) { throw new GithubSchemaDrift('pulls', ['<root is not an array>']); }
  return data.map((row) => parsePrSummaryRow(row));
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

// ---------- §5 diff 双通道（本地 git base...head 优先；API diff 仅 base/head 本地缺席兜底） ----------

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
}

const NULL_STATS: PrDiffStats = { files_changed: null, additions: null, deletions: null };

export function gitShaResolvable(repoRoot: string, sha: string): boolean {
  if (!sha) { return false; }
  const r = spawnSync('git', ['cat-file', '-e', sha + '^{commit}'], { cwd: repoRoot, encoding: 'utf8', timeout: 30000, windowsHide: true });
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
  const range = baseSha + '...' + headSha;
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
  if (repoRoot && gitShaResolvable(repoRoot, baseSha) && gitShaResolvable(repoRoot, headSha)) {
    const l = localThreeDotDiff(repoRoot, baseSha, headSha);
    if (l.ok) { return { channel: 'local-git', ok: true, text: l.text, stats: l.stats, detail: null }; }
    const a = await apiDiff(client, owner, repo, prNumber);
    a.detail = 'local-git diff failed (' + (l.detail || 'unknown') + ') -> api fallback';
    return a;
  }
  return apiDiff(client, owner, repo, prNumber);
}

async function apiDiff(client: GithubRestClient, owner: string, repo: string, prNumber: number): Promise<PrDiffOutcome> {
  const res = await client.call('/repos/' + owner + '/' + repo + '/pulls/' + String(prNumber), 'application/vnd.github.diff');
  if (!res.ok) {
    return { channel: 'api', ok: false, text: '', stats: NULL_STATS, detail: 'api diff ' + res.error_kind + ' status=' + String(res.status) };
  }
  return { channel: 'api', ok: true, text: String(res.data), stats: NULL_STATS, detail: 'api diff channel (base/head 本地缺席或本地 diff 失败)' };
}

// ---------- §6 仓引用解析（owner/repo 与 github.com URL；非 github 显式拒） ----------

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

// ---------- §7 采集入口（事实发射：resolution/rate_limit 运行日志/pr_summary/pr_metadata/pr_diff/run） ----------

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

  function noteCall(path: string, r: GithubApiResult): void {
    out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.rate_limit', {
      path: path,
      status: r.status,
      limit: r.rate_limit ? r.rate_limit.limit : null,
      remaining: r.rate_limit ? r.rate_limit.remaining : null,
      used: r.rate_limit ? r.rate_limit.used : null,
      reset_epoch: r.rate_limit ? r.rate_limit.reset_epoch : null,
      resource: r.rate_limit ? r.rate_limit.resource : null,
      retried: r.retried
    }));
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

  // PR 枚举（分页经 per_page；不足页止）
  const state = opts.state || 'all';
  const perPage = opts.perPage || DEFAULT_PER_PAGE;
  const maxPages = opts.maxPages || DEFAULT_MAX_PAGES;
  const summaries: PrSummary[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const path = '/repos/' + repoRef + '/pulls?state=' + state + '&per_page=' + String(perPage) + '&page=' + String(page);
    const r = await client.call(path);
    noteCall(path, r);
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

  // PR 元数据 + diff（按需子集；限流/错误即停）
  const byNumber = new Map<number, PrSummary>();
  for (const s of summaries) { byNumber.set(s.number, s); }
  if (!stopped) {
    for (const n of opts.details || []) {
      const path = '/repos/' + repoRef + '/pulls/' + String(n);
      const r = await client.call(path);
      noteCall(path, r);
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
      for (let li = logBefore; li < client.callLog.length; li++) {
        const le = client.callLog[li];
        out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + le.path, 'github_rest.rate_limit', {
          path: le.path, status: le.status,
          limit: le.rate_limit ? le.rate_limit.limit : null,
          remaining: le.rate_limit ? le.rate_limit.remaining : null,
          used: le.rate_limit ? le.rate_limit.used : null,
          reset_epoch: le.rate_limit ? le.rate_limit.reset_epoch : null,
          resource: le.rate_limit ? le.rate_limit.resource : null,
          retried: false
        }));
      }
      if (!d.ok) {
        counters.errors++;
        stopped = d.detail || 'diff failed';
        out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path + ' (diff)', 'github_rest.api_error', {
          path: path, error_kind: 'http', detail: d.detail, channel: d.channel
        }));
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
