// ---------- 上游适配器：GitHub REST（GitHub REST+env token 主通道、gh 登录态可选回退 / D-048 / #47）----------
// 托管平台适配器以直接调用 GitHub REST API 并配合环境变量 token 为主，gh 命令行仅作为可选回退
// 上游接口返回的原始数据不超出适配器范围，业务判定规则不进入这一层
// 防腐层规则（同 codelore.ts）：本文件只做「HTTP 调用 + 原始响应解析」——状态码、限流响应头解析、
// 数据结构校验在此处理；判定规则（判据/阈值/裁决）禁止进入本层；接口原始响应不传出本层（统一转换为规范的结构化类型或事实输出）。
// 方案约定：以 REST 直连并固定 X-GitHub-Api-Version 为主；借用本机 gh 登录态只读使用属于可选回退
// （尽力而为，非强依赖——git 是产品必需的基础工具，gh 只是可选命令行）；
// 未提供认证凭据时明确降级（公仓每小时 60 次限流如实说明）；凭据按三级探测即用即清，不保存凭据、不引入 OAuth。
// 最小数据范围 = PR 列表（平台声明的 Bot 身份双重校验：user.type==Bot 且 login 带 [bot] 后缀）＋PR 详细元数据
// ＋diff 双通道（优先使用本地 git 计算 base...head，本地没有相应 commit 时才调用 API 获取）。
// review/comment 等功能当前登记为 planned，不纳入最小集（按需引入）。
// 限流处理（对齐 GitHub 官方文档）：每个响应解析 x-ratelimit-* 响应头，并将剩余额度写入事实库日志；
// 主要配额耗尽（remaining=0）时不再等待直接停止，并记录重置时间戳；遇到 403 或 429 且带有 retry-after 时，在时间限制内等待后
// 重试一次，仍被限流则停止；无 retry-after 且 remaining!=0 时（官方建议等待 60 秒以上，超出执行预算）直接明确停止。
// 规则要求：Bot 身份仅作为「平台声明的 Bot 身份」记录，不做语义层面的人机推断；私有仓库场景明确提示「token 必需」。
import { spawnSync } from 'node:child_process';
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
// 预定计划登记：本任务最小数据范围之外的平台接口，后续有实际需要时再引入
export const GITHUB_REST_PLANNED_SURFACES = ['pulls.reviews', 'pulls.comments', 'issues.comments'];
export const GITHUB_REST_DESCRIPTOR = {
    id: GITHUB_REST_ADAPTER_ID,
    family: GITHUB_REST_FAMILY,
    dimension: null, // 防腐层故意留白（上游适配层禁止放入业务判定规则）——维度映射见 docs/upstream-dimension-map.md（D-078）
    quadrant: 'strategic'
};
// 借用 gh 登录态：只读取 gh auth token，不修改其登录状态；未安装 gh 时返回 available=false（不当作错误）。
export function probeGhAuthToken(binary) {
    const bin = binary || 'gh';
    const r = spawnSync(bin, ['auth', 'token'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
    if (r.error || r.status !== 0) {
        return { available: false, token: null };
    }
    const t = (r.stdout || '').trim();
    return { available: true, token: t.length > 0 ? t : null };
}
export function resolveGithubCredential(env, ghProbe) {
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
export const defaultSleeper = (ms) => new Promise((r) => setTimeout(r, ms));
export function realHttpFetcher(timeoutMs) {
    const t = timeoutMs || 30000;
    return async (req) => {
        const headers = {
            'Accept': req.accept,
            'X-GitHub-Api-Version': GITHUB_API_VERSION,
            'User-Agent': GITHUB_USER_AGENT
        };
        if (req.token) {
            headers['Authorization'] = 'Bearer ' + req.token;
        }
        const ac = new AbortController();
        const timer = setTimeout(() => { ac.abort(); }, t);
        try {
            const r = await fetch(req.url, { method: req.method, headers: headers, signal: ac.signal });
            const body = await r.text();
            const h = {};
            r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
            return { status: r.status, headers: h, body: body };
        }
        finally {
            clearTimeout(timer);
        }
    };
}
function toIntOrNull(v) {
    if (v === undefined) {
        return null;
    }
    const n = parseInt(v, 10);
    return isFinite(n) ? n : null;
}
export function parseRateLimitHeaders(headers) {
    const has = headers['x-ratelimit-limit'] !== undefined || headers['x-ratelimit-remaining'] !== undefined;
    if (!has) {
        return null;
    }
    return {
        limit: toIntOrNull(headers['x-ratelimit-limit']),
        remaining: toIntOrNull(headers['x-ratelimit-remaining']),
        used: toIntOrNull(headers['x-ratelimit-used']),
        reset_epoch: toIntOrNull(headers['x-ratelimit-reset']),
        resource: headers['x-ratelimit-resource'] || null,
        retry_after_seconds: toIntOrNull(headers['retry-after'])
    };
}
export function createGithubRestClient(cred, opts) {
    const fetcher = (opts && opts.fetcher) || realHttpFetcher();
    const sleeper = (opts && opts.sleeper) || defaultSleeper;
    const base = (opts && opts.apiBase) || GITHUB_API_BASE;
    const maxWait = (opts && opts.maxRetryWaitSeconds !== undefined) ? opts.maxRetryWaitSeconds : DEFAULT_MAX_RETRY_WAIT_SECONDS;
    const log = [];
    async function once(path, accept) {
        let res;
        try {
            res = await fetcher({ method: 'GET', url: base + path, accept: accept, token: cred.token });
        }
        catch (e) {
            return { ok: false, status: 0, data: null, error_kind: 'network', rate_limit: null, retried: false, detail: String(e.message || e) };
        }
        const rl = parseRateLimitHeaders(res.headers);
        if (res.status >= 200 && res.status < 300) {
            if (/json/i.test(res.headers['content-type'] || '') || /^\s*[\[{]/.test(res.body)) {
                try {
                    return { ok: true, status: res.status, data: JSON.parse(res.body), error_kind: 'none', rate_limit: rl, retried: false, detail: null };
                }
                catch (e) {
                    return { ok: false, status: res.status, data: null, error_kind: 'parse', rate_limit: rl, retried: false, detail: 'json parse: ' + String(e.message || e) };
                }
            }
            return { ok: true, status: res.status, data: res.body, error_kind: 'none', rate_limit: rl, retried: false, detail: null };
        }
        return { ok: false, status: res.status, data: null, error_kind: 'http', rate_limit: rl, retried: false, detail: 'http ' + res.status };
    }
    // 退避等待策略（与官方文档对齐，限制等待上限）：
    //  主要限额耗尽（remaining==0）时立即停止，不在程序内空等重置时间；
    //  次级限流带有 retry-after 且小于等于最大等待时间时，等待指定时间并重试一次；若仍被限流或超出等待上限则停止；
    //  次级限流未提供 retry-after 时（官方建议至少等待 60 秒以上，超出执行预算）直接停止。
    // 403 或 429 在记录时直接归类为 rate-limited——调用日志记录的是处理结论而非单纯的底层网络状态。
    function logAttempt(path, r, retried) {
        const kind = (r.status === 403 || r.status === 429) ? 'rate-limited' : r.error_kind;
        log.push({ path: path, status: r.status, rate_limit: r.rate_limit, retried: retried, error_kind: kind });
    }
    async function call(path, accept) {
        const acc = accept || 'application/vnd.github+json';
        let r = await once(path, acc);
        logAttempt(path, r, false);
        if (r.ok || (r.status !== 403 && r.status !== 429)) {
            return r;
        }
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
// ---------- §4 数据结构校验与解析（格式不匹配时明确抛出错误，不掩盖异常） ----------
export class GithubSchemaDrift extends Error {
    missing;
    constructor(where, missing) {
        super('schema drift at ' + where + ': missing ' + missing.join(','));
        this.name = 'GithubSchemaDrift';
        this.missing = missing;
    }
}
function fieldAt(row, path) {
    let cur = row;
    for (const seg of path.split('.')) {
        if (cur === null || typeof cur !== 'object') {
            return undefined;
        }
        cur = cur[seg];
    }
    return cur;
}
function collectMissing(row, required) {
    const missing = [];
    for (const p of required) {
        if (fieldAt(row, p) === undefined) {
            missing.push(p);
        }
    }
    return missing;
}
const PR_SUMMARY_REQUIRED = ['number', 'title', 'state', 'user.login', 'user.type', 'head.sha', 'base.sha', 'html_url'];
const PR_DETAIL_REQUIRED = PR_SUMMARY_REQUIRED.concat(['merged', 'merge_commit_sha', 'additions', 'deletions', 'changed_files', 'commits', 'created_at']);
function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
function str(v) { return typeof v === 'string' ? v : null; }
function boolOrNull(v) { return typeof v === 'boolean' ? v : null; }
// 平台声明的 Bot 身份双重校验：user.type=='Bot' 且 login 以 [bot] 结尾——缺一不认定为 Bot（照实记录，不主观推断）。
export function platformDeclaredBot(login, userType) {
    return userType === 'Bot' && typeof login === 'string' && /\[bot\]$/i.test(login);
}
export function parsePrSummaryRow(row) {
    const missing = collectMissing(row, PR_SUMMARY_REQUIRED);
    if (missing.length > 0) {
        throw new GithubSchemaDrift('pulls[]', missing);
    }
    const o = row;
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
export function parsePrDetail(row) {
    const missing = collectMissing(row, PR_DETAIL_REQUIRED);
    if (missing.length > 0) {
        throw new GithubSchemaDrift('pulls/{n}', missing);
    }
    const base = parsePrSummaryRow(row);
    const o = row;
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
const NULL_STATS = { files_changed: null, additions: null, deletions: null };
// SHA 十六进制格式校验正则（#116 安全检查：防止参数注入、路径遍历或非法字符；限定 7 到 40 位十六进制字符）
export const GIT_SHA_HEX_RE = /^[0-9a-f]{7,40}$/i;
export function isValidGitSha(sha) {
    return typeof sha === 'string' && GIT_SHA_HEX_RE.test(sha.trim());
}
export function gitShaResolvable(repoRoot, sha) {
    if (!isValidGitSha(sha)) {
        return false;
    }
    const cleanSha = sha.trim();
    const r = spawnSync('git', ['cat-file', '-e', cleanSha + '^{commit}'], { cwd: repoRoot, encoding: 'utf8', timeout: 30000, windowsHide: true });
    return !r.error && r.status === 0;
}
export function parseNumstat(text) {
    let files = 0, add = 0, del = 0, sawNum = false;
    for (const line of text.split('\n')) {
        const t = line.trim();
        if (!t) {
            continue;
        }
        const parts = t.split('\t');
        if (parts.length < 3) {
            continue;
        }
        files++;
        if (parts[0] !== '-' && parts[1] !== '-') {
            const a = parseInt(parts[0], 10), d = parseInt(parts[1], 10);
            if (isFinite(a) && isFinite(d)) {
                add += a;
                del += d;
                sawNum = true;
            }
        }
    }
    return { files_changed: files, additions: sawNum ? add : null, deletions: sawNum ? del : null };
}
export function localThreeDotDiff(repoRoot, baseSha, headSha) {
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
export async function resolvePrDiff(client, owner, repo, prNumber, baseSha, headSha, repoRoot) {
    // 非空 SHA 必须满足十六进制校验；恶意参数/非法字符前置拒绝
    if ((baseSha && !isValidGitSha(baseSha)) || (headSha && !isValidGitSha(headSha))) {
        return { channel: 'local-git', ok: false, text: '', stats: NULL_STATS, detail: 'invalid base or head git sha: baseSha=' + JSON.stringify(baseSha) + ', headSha=' + JSON.stringify(headSha), error_kind: 'local-diff' };
    }
    const cleanBase = baseSha ? baseSha.trim() : '';
    const cleanHead = headSha ? headSha.trim() : '';
    if (repoRoot && cleanBase && cleanHead && gitShaResolvable(repoRoot, cleanBase) && gitShaResolvable(repoRoot, cleanHead)) {
        const l = localThreeDotDiff(repoRoot, cleanBase, cleanHead);
        if (l.ok) {
            return { channel: 'local-git', ok: true, text: l.text, stats: l.stats, detail: null, error_kind: null };
        }
        // 规则限定（D-048）：API diff 仅在本地缺少 base 或 head 时作为备选；本地存在 commit 但 diff 执行失败时照实报错降级，不悄悄换通道
        return { channel: 'local-git', ok: false, text: '', stats: NULL_STATS, detail: 'local-git diff failed: ' + (l.detail || 'unknown'), error_kind: 'local-diff' };
    }
    return apiDiff(client, owner, repo, prNumber);
}
async function apiDiff(client, owner, repo, prNumber) {
    const res = await client.call('/repos/' + owner + '/' + repo + '/pulls/' + String(prNumber), 'application/vnd.github.diff');
    if (!res.ok) {
        return { channel: 'api', ok: false, text: '', stats: NULL_STATS, detail: 'api diff ' + res.error_kind + ' status=' + String(res.status), error_kind: res.error_kind };
    }
    return { channel: 'api', ok: true, text: String(res.data), stats: NULL_STATS, detail: 'api diff channel (base/head 本地缺席)', error_kind: null };
}
export function parseGithubRepoRef(input) {
    const s = (input || '').trim();
    let m = s.match(/^https?:\/\/github\.com\/([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*?)(\.git)?\/?$/i);
    if (m) {
        return { ok: true, owner: m[1], repo: m[2] };
    }
    m = s.match(/^git@github\.com:([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*?)(\.git)?$/i);
    if (m) {
        return { ok: true, owner: m[1], repo: m[2] };
    }
    if (/^https?:\/\//i.test(s) || /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+:/.test(s)) {
        return { ok: false, reason: 'unsupported: 托管面非 github.com（无托管 PR 面适配）' };
    }
    m = s.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/);
    if (m) {
        return { ok: true, owner: m[1], repo: m[2] };
    }
    return { ok: false, reason: 'unparseable repo ref' };
}
export async function collectGithubPrFacts(owner, repo, opts, ctx) {
    const out = [];
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
    let stopped = null;
    const counters = { errors: 0, rate_limited: 0, schema_drift: 0, prs: 0, details: 0, diffs: 0, diffs_local: 0, diffs_api: 0 };
    // 统一输出日志事实：按照调用记录真实输出 rate_limit 事实（列表、详情与 diff 统一来源）
    function emitCallLog(fromIdx) {
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
    function noteError(path, r) {
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
        }
        else {
            stopped = r.detail || ('api error ' + String(r.status));
            out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.api_error', {
                path: path, status: r.status, error_kind: r.error_kind, detail: r.detail, retried: r.retried
            }));
        }
    }
    // 获取 PR 列表（按每页条数分页，当返回条数少于每页要求时停止）
    const state = opts.state || 'all';
    const perPage = opts.perPage || DEFAULT_PER_PAGE;
    const maxPages = opts.maxPages || DEFAULT_MAX_PAGES;
    const summaries = [];
    for (let page = 1; page <= maxPages; page++) {
        const path = '/repos/' + repoRef + '/pulls?state=' + state + '&per_page=' + String(perPage) + '&page=' + String(page);
        const logBefore = client.callLog.length;
        const r = await client.call(path);
        emitCallLog(logBefore);
        if (!r.ok) {
            noteError(path, r);
            break;
        }
        let rows;
        try {
            if (!Array.isArray(r.data)) {
                throw new GithubSchemaDrift('pulls', ['<root is not an array>']);
            }
            rows = r.data;
        }
        catch (e) {
            counters.errors++;
            counters.schema_drift++;
            out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.schema_drift', {
                path: path, where: 'pulls', missing: e.missing || [String(e.message)]
            }));
            stopped = 'schema-drift';
            break;
        }
        for (const row of rows) {
            let s;
            try {
                s = parsePrSummaryRow(row);
            }
            catch (e) {
                counters.errors++;
                counters.schema_drift++;
                out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef, 'GET ' + path, 'github_rest.schema_drift', {
                    path: path, where: 'pulls[]', missing: e.missing || [String(e.message)]
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
        if (rows.length < perPage) {
            break;
        }
    }
    // 获取 PR 详情与 diff 内容（仅获取指定编号，遇到限流或错误时停止）
    const byNumber = new Map();
    for (const s of summaries) {
        byNumber.set(s.number, s);
    }
    if (!stopped) {
        for (const n of opts.details || []) {
            const path = '/repos/' + repoRef + '/pulls/' + String(n);
            const logBefore = client.callLog.length;
            const r = await client.call(path);
            emitCallLog(logBefore);
            if (!r.ok) {
                noteError(path, r);
                break;
            }
            try {
                const d = parsePrDetail(r.data);
                byNumber.set(d.number, d);
                counters.details++;
                out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path, 'github_rest.pr_metadata', d));
            }
            catch (e) {
                counters.errors++;
                counters.schema_drift++;
                out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path, 'github_rest.schema_drift', {
                    path: path, where: 'pulls/{n}', missing: e.missing || [String(e.message)]
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
                }
                else {
                    out.push(makeFact(ctx, GITHUB_REST_DESCRIPTOR, repoRef + '#' + String(n), 'GET ' + path + ' (diff)', 'github_rest.api_error', {
                        path: path, error_kind: d.error_kind || 'http', detail: d.detail, channel: d.channel
                    }));
                }
                break;
            }
            counters.diffs++;
            if (d.channel === 'local-git') {
                counters.diffs_local++;
            }
            else {
                counters.diffs_api++;
            }
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
