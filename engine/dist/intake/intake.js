// ---------- 仓库接入输入判定（默认用本地路径 / owner-repo 优先查本地 / 远端 URL 需明确指定 / D-013） ----------
// 默认使用本地路径；远端 URL 必须明确指定，克隆到独立的缓存目录。
// 判定顺序：先看是不是明确的本地路径 → 如果是 owner/repo 格式先看本地有没有（./ 开头强制当成纯本地）→ 只有明确给出的 URL（https/git@）才去克隆。
// 克隆要求：放到专用缓存目录 <cache>/repos/<sha256(url)[:16]>/；完整历史克隆（不加 --depth，fetch-depth 设为 0）；
// 检查 .git 是否完整；浅克隆直接拒绝并报错 SHALLOW-CLONE-REJECTED；禁止执行远端自带的钩子或脚本配置（不递归克隆子模块、
// 把 hooksPath 指向空目录、禁止 ext 协议）；凭据复用本地 git 既有配置（不新建凭据存储）。
// 入口控制：repo add 只对命令行和配置文件开放；核心 MCP 查询通道保持只读（本模块不被 MCP 相关代码引用）。
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { classifyGitIsoField } from './quarantine.js';
const URL_SCHEMES = [
    /^https?:\/\//i,
    /^ssh:\/\//i,
    /^git:\/\//i,
    /^file:\/\//i, // 明确给出的 URL 格式（file:// 仅用于离线或测试，不走网络）
    /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+:.+/ // git@host:owner/repo
];
const OWNER_REPO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
export function classifyRepoInput(input) {
    const s = (input || '').trim();
    if (!s) {
        throw intakeError('INVALID-INPUT', 'empty repo input');
    }
    for (const re of URL_SCHEMES) {
        if (re.test(s)) {
            return { kind: 'url', forcedLocal: false, original: s };
        }
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
export function intakeError(code, message) {
    const e = new Error(code + ': ' + message);
    e.code = code;
    return e;
}
function git(args, cwd, timeoutMs) {
    const r = spawnSync('git', args, { cwd: cwd, encoding: 'utf8', timeout: timeoutMs, windowsHide: true });
    return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), error: r.error };
}
function gitOk(args, cwd, timeoutMs) {
    const r = git(args, cwd, timeoutMs);
    if (r.error || r.status !== 0) {
        throw intakeError('GIT-FAILED', 'git ' + args.join(' ') + ' :: ' + (r.error ? String(r.error) : r.stderr || ('exit ' + r.status)));
    }
    return r;
}
export function isGitRepo(dir, timeoutMs = 30000) {
    const r = git(['rev-parse', '--git-dir'], dir, timeoutMs);
    return !r.error && r.status === 0;
}
// ---- git %cI 输出格式约定（#54 / D-059①；upstream-lock.yaml 中注明 git-cli 输出解析需保持统一） ----
// git 2.45 之前的版本对 UTC 零时区提交输出 '+00:00'，2.45 及以后的版本输出 'Z'。
// 同一个提交对象在不同 git 版本下文字写法不一致，会导致 traceId、fact_id、回执和报告的哈希值对不上。
// 处理方式：在解析入口把 '+00:00' 统一转换为 'Z'（其他时区如 +08:00 各版本写法一致，保持原样），
// 并且严格校验时间格式：转换后只要不符合标准就直接拒绝报错，绝不悄悄放行。
// %cI 严格时间正则定义在 quarantine.ts 的 GIT_ISO_STRICT_RE（由规则层统一提供，保持单处定义）。
// 格式转换逻辑由 quarantine.ts 的 classifyGitIsoField 函数实现（支持三种分类状态，遇到异常不抛出异常；D-103）。
// 当前函数为现有调用方保留抛异常行为：clean 或 normalized 返回合法字符串；quarantined 抛出 GITCLI-OUTPUT-CONTRACT 错误
// （如果调用方需要把异常记录进隔离区，应直接使用 classifyGitIsoField）。
export function normalizeGitIsoDate(raw) {
    const c = classifyGitIsoField(raw);
    if (c.status === 'quarantined' || c.value === null) {
        throw intakeError('GITCLI-OUTPUT-CONTRACT', 'git %cI output violates frozen shape (expect strict ISO-8601, Z or ±HH:MM zone; quarantined reason=' + c.reason_code + '): ' + JSON.stringify(raw));
    }
    return c.value;
}
export function isShallowRepo(dir, timeoutMs = 30000) {
    const r = gitOk(['rev-parse', '--is-shallow-repository'], dir, timeoutMs);
    return r.stdout === 'true';
}
export function headSha(dir, timeoutMs = 30000) {
    const r = gitOk(['rev-parse', '--verify', 'HEAD'], dir, timeoutMs);
    return r.stdout;
}
function remoteOriginUrl(dir, timeoutMs) {
    const r = git(['config', '--local', '--get', 'remote.origin.url'], dir, timeoutMs);
    return r.status === 0 ? r.stdout : '';
}
export function sha256Short(text) {
    return createHash('sha256').update(text).digest('hex').slice(0, 16);
}
// ---- URL 缓存键规整（#55 / D-059⑦）：'https://…/a/b' 与 'https://…/a/b.git' 指向同一个远端仓库 ——
// 缓存键计算前先对 URL 统一处理，去掉末尾的 '.git' 和 '/'，防止同一个仓库重复占用两个缓存槽，避免来源哈希对不上。
export function normalizeRepoUrlKey(url) {
    return url.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
}
// 获取缓存目录最近拉取时间：优先读取 .git/FETCH_HEAD 的修改时间（克隆和拉取都会写），没有则看 .git 目录时间，再没有看缓存目录本身的时间。
function snapshotFetchedAt(dir) {
    for (const p of [join(dir, '.git', 'FETCH_HEAD'), join(dir, '.git'), dir]) {
        try {
            return statSync(p).mtime.toISOString();
        }
        catch (e) { /* try next */ }
    }
    return null;
}
export function cloneToIsolatedCache(url, cacheRoot, timeoutMs = 600000, refresh = false) {
    const key = sha256Short(normalizeRepoUrlKey(url));
    const dir = join(cacheRoot, 'repos', key);
    if (existsSync(dir)) {
        if (isGitRepo(dir, 30000) && normalizeRepoUrlKey(remoteOriginUrl(dir, 30000)) === normalizeRepoUrlKey(url)) {
            const shallow = isShallowRepo(dir, 30000);
            if (shallow) {
                throw intakeError('SHALLOW-CLONE-REJECTED', 'cached clone is shallow: ' + dir);
            }
            if (!refresh) {
                return { dir: dir, cloned: false, head_sha: headSha(dir, 30000), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir), refreshed: false };
            }
            // 手动刷新（不自动 pull，避免影响工作区独立性）：fetch --prune → 重置到 origin/HEAD。
            const noopHooksRefresh = join(cacheRoot, 'noop-hooks');
            gitOk(['-c', 'core.hooksPath=' + noopHooksRefresh, '-c', 'protocol.ext.allow=never', 'fetch', 'origin', '--prune'], dir, timeoutMs);
            let remoteHead = git(['rev-parse', '--verify', 'origin/HEAD'], dir, 30000);
            if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
                // 保底处理：如果 origin/HEAD 软链接不存在（部分通过 file:// 克隆的仓库不会创建）→ 取 refs/remotes/origin/* 下的第一个分支
                const refs = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'], dir, 30000);
                const first = (!refs.error && refs.status === 0) ? refs.stdout.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== 'origin/HEAD'; })[0] : null;
                remoteHead = first ? git(['rev-parse', '--verify', first], dir, 30000) : remoteHead;
            }
            if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
                throw intakeError('REFRESH-REMOTE-HEAD-UNRESOLVED', 'origin/HEAD 及 refs/remotes/origin/* 均不可解析：' + dir);
            }
            gitOk(['reset', '--hard', remoteHead.stdout], dir, timeoutMs);
            // 刷新后时间记录为 FETCH_HEAD 的新修改时间（与克隆时取自同一处，命中缓存时读出相同的值）
            return { dir: dir, cloned: false, head_sha: headSha(dir, 30000), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || new Date().toISOString(), refreshed: true };
        }
        throw intakeError('INTAKE-CACHE-COLLISION', 'cache slot occupied by foreign content: ' + dir);
    }
    mkdirSync(dirname(dir), { recursive: true });
    // 禁止执行远端配置：hooksPath 指向空目录（钩子本身不会随克隆传输，这里做双重保险）；禁用 ext:: 协议；关闭符号链接（保障 Windows 下安全）。
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
    if (!isGitRepo(dir, 30000)) {
        throw intakeError('CLONE-FAILED', 'clone produced non-git dir: ' + dir);
    }
    const head = headSha(dir, 30000); // 确保 .git 完整且 HEAD 可正常解析
    if (isShallowRepo(dir, 30000)) {
        throw intakeError('SHALLOW-CLONE-REJECTED', 'clone is shallow (fetch-depth must be 0): ' + dir);
    }
    // 克隆时间记录为 FETCH_HEAD 的修改时间（克隆必然会写入；与命中缓存时取自同一处，时间记录不走样）
    return { dir: dir, cloned: true, head_sha: head, shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || new Date().toISOString(), refreshed: false };
}
export function repoAdd(input, opts = {}) {
    const cwd = opts.cwd || process.cwd();
    const timeoutMs = opts.cloneTimeoutMs || 600000;
    const cls = classifyRepoInput(input);
    const base = {
        kind: cls.kind,
        input: input,
        remote_config_execution: 'disabled',
        credentials: 'local-git-credential-chain'
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
function finishLocal(result, timeoutMs) {
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
