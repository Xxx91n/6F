// audit/file-card.ts —— `audit file` 按需补采的那条路
// 按需补采和批量分析共用同一套单文件写入流程；MCP 那头只看不写，所以补采只能在命令行做。
// 命令行入口：库里没有这份文件的数据时，重跑一遍采集，把新事实追加进去（写入函数和编号规则跟批量分析一样）。
// 先确认这个提交在仓库对象库里真能找到；只读 git，不碰工作区没提交的改动。
// 写连接先关掉，再开一个只读连接去查结果、摆出来。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { repoAdd } from '../intake/intake.js';
import { auditRepoName } from './audit.js';
import { macroBContext, probeGitVersion } from './macro-b.js';
import { collectCodeloreFacets, CODELORE_BEHAVIOR_FACETS } from '../upstream/codelore.js';
import { collectFileLineage, gitRenameLogArgs, parseRenameLogZ, RENAME_DEFAULT_THRESHOLD, RENAME_DETECTOR_VERSION } from '../collect/file-lineage.js';
import { absorbGitIsoDialect, classifyGitIsoField } from '../intake/quarantine.js';
import { openWriter, closeDuckdb, appendFact, isAuditIoError, isFactIdUniqueViolation, existingFactIds, runInTransaction } from '../fact/store.js';
import { headShaOfRepoRef } from '../fact/file-card.js';
import { projectFileCard } from '../fact/projection.js';
import { buildFileCard } from '../fact/file-card.js';
export class AuditFileError extends Error {
    code;
    constructor(code, message) { super(message); this.code = code; }
}
export function isAuditFileError(e) {
    return e instanceof AuditFileError || (typeof e === 'object' && e !== null && typeof e.code === 'string' && String(e.code).indexOf('AUDIT-FILE-') === 0);
}
function gitOut(root, args) {
    return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim();
}
// 默认的补采流程：把这个文件的行为面指标按单文件归出来，再把改名记录一起取上
function defaultCodeloreCollect(ctx, repoRoot) {
    return collectCodeloreFacets({ repoRoot: repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
}
function defaultLineageCollect(ctx, repoRoot) {
    const rawLog = gitOut(repoRoot, gitRenameLogArgs(RENAME_DEFAULT_THRESHOLD));
    return collectFileLineage({
        edges: parseRenameLogZ(rawLog),
        headSha: headShaOfRepoRef(ctx.repoRef),
        threshold: RENAME_DEFAULT_THRESHOLD,
        detectorVersion: RENAME_DETECTOR_VERSION,
        gitVersion: probeGitVersion()
    }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt });
}
export async function runAuditFile(opts) {
    const intake = repoAdd(opts.input, { cwd: opts.cwd || process.cwd() });
    const repoRoot = intake.resolved_root;
    const name = auditRepoName(opts.input, repoRoot);
    // 先确认目标提交能解析出来；解析不了直接报错停手
    let headSha;
    try {
        headSha = gitOut(repoRoot, ['rev-parse', 'HEAD']);
        if (!/^[0-9a-f]{40}$/i.test(headSha)) {
            throw new Error('unexpected rev-parse output');
        }
    }
    catch (e) {
        throw new AuditFileError('AUDIT-FILE-SHA-UNREACHABLE', '目标 SHA 对象库不可达（git rev-parse HEAD）：' + String(e.message));
    }
    // 取观测时间：写法差异先吸收掉，别当成字段异常去隔离
    const headRaw = gitOut(repoRoot, ['log', '-1', '--format=%cI']);
    const absorbed = absorbGitIsoDialect(headRaw);
    const cls = classifyGitIsoField(absorbed.value);
    const headDate = cls.value !== null ? cls.value : null;
    const repoRef = name + '@' + headSha;
    const pinned = opts.at !== undefined && opts.at.length > 0;
    // 先看库里有没有观测集：指定了历史提交就不补采；没指定、当前提交又没数据，才补
    let backfilled = false;
    let emitted = 0;
    let skipped = 0;
    if (!pinned) {
        // 库文件压根不存在，直接补采，省得只读打开时报错
        const preCard = existsSync(opts.db)
            ? await projectFileCard(opts.db, { repo: name, subject: opts.path, current_head_sha: headSha })
            : null;
        const setExists = preCard !== null && preCard.observation.head_sha === headSha;
        const subjectHasFacts = preCard !== null && Object.keys(preCard.kernel.facet_rows).length > 0;
        if (!setExists || !subjectHasFacts) {
            const ctx = macroBContext('audit-file-' + name, name, headSha, headDate, headRaw);
            const codeloreFn = (opts.collectors && opts.collectors.codelore) || defaultCodeloreCollect;
            const lineageFn = (opts.collectors && opts.collectors.lineage) || defaultLineageCollect;
            const batch = codeloreFn(ctx, repoRoot).concat(lineageFn(ctx, repoRoot));
            mkdirSync(dirname(opts.db), { recursive: true }); // 库所在的目录先建出来
            const writer = await openWriter(opts.db);
            try {
                // 整段包在事务里：出错全回滚，不留半截数据
                emitted = await runInTransaction(writer, async function () {
                    // 写之前先查一遍库里已有的编号，有的就跳过
                    const seen = await existingFactIds(writer, batch.map(function (f) { return f.fact_id; }));
                    let n = 0;
                    for (const f of batch) {
                        if (seen.has(f.fact_id)) {
                            skipped += 1;
                            continue;
                        }
                        seen.add(f.fact_id);
                        try {
                            await appendFact(writer, f);
                            n += 1;
                        }
                        catch (e) {
                            // 只有主键撞车才允许跳过；别的写入报错一律往上抛、回滚
                            if (!isFactIdUniqueViolation(e)) {
                                throw e;
                            }
                            skipped += 1;
                        }
                    }
                    return n;
                });
            }
            finally {
                closeDuckdb(writer); // 写完关连接，后面查询用只读那条
            }
            backfilled = true;
        }
    }
    const card = existsSync(opts.db)
        ? await projectFileCard(opts.db, {
            repo: name,
            subject: opts.path,
            at: pinned ? opts.at : undefined,
            current_head_sha: headSha,
            source: backfilled ? 'backfill' : 'prefetch'
        })
        : buildFileCard({
            subject: opts.path, setRepoRef: null, setFacts: [], availableHeadShas: [],
            pinnedSha: pinned ? opts.at : null, currentHeadSha: headSha,
            source: 'unknown', cliGuidance: null
        });
    return { card: card, backfilled: backfilled, emitted: emitted, skipped: skipped, repo_ref: repoRef, repo_name: name, head_sha: headSha };
}
export { isAuditIoError };
