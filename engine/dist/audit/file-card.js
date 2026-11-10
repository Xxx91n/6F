// audit/file-card.ts — `audit file` 按需补采流程
// 理由：按需补采与批量分析复用同一套单文件数据写入管线，MCP 查询面永远只读不写。
// 命令行入口：未命中现有数据时重新执行采集管线并追加新事实（与批量分析共用同一套写入函数与编号规则）。
// 检查目标提交是否在仓库对象库中存在；只读取 git 数据，不依赖本地工作区的未提交修改。
// 补采写入连接先关闭，再打开只读连接进行结果查询展示。
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
// 默认补采管线：提取文件行为面指标（按单文件归纳）并结合文件改名记录。
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
    // 确认目标提交可解析：解析失败直接报错终止
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
    // 提取观测时间：吸收时间格式差异，不触发错误隔离
    const headRaw = gitOut(repoRoot, ['log', '-1', '--format=%cI']);
    const absorbed = absorbGitIsoDialect(headRaw);
    const cls = classifyGitIsoField(absorbed.value);
    const headDate = cls.value !== null ? cls.value : null;
    const repoRef = name + '@' + headSha;
    const pinned = opts.at !== undefined && opts.at.length > 0;
    // 检查已有观测集：若指定了历史提交则不补采；若未指定且当前提交无数据则触发补采
    let backfilled = false;
    let emitted = 0;
    let skipped = 0;
    if (!pinned) {
        // 数据库文件不存在则直接补采，避免只读打开时报错
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
            mkdirSync(dirname(opts.db), { recursive: true }); // 确保数据库目录存在
            const writer = await openWriter(opts.db);
            try {
                // 使用事务包裹：出错完整回滚，防止写入残缺数据
                emitted = await runInTransaction(writer, async function () {
                    // 写入前预查已存在的事实编号，已存在的直接跳过
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
                            // 仅主键冲突允许跳过，其余写入异常直接抛出并回滚
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
                closeDuckdb(writer); // 写入完成关闭连接，便于后续只读查询
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
