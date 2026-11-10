// audit/fact-write.ts —— 事实数据与隔离记录写入的公共处理逻辑
// 理由：不同审计档位共用同一套只追加不修改的数据库写入通道。
// audit.ts（单仓四象限档）与 macro-c.ts（历史演化档）共同复用：
//   同一写入函数、相同的事务颗粒度（按提交划分事务，批量 500 条）、
//   相同的事实编号规则（只追加写入、按内容寻址）、相同的数据一致性检查。
// 单文件档补采（audit/file-card.ts）同样使用 appendFact 与 runInTransaction 原语，写入时机不同，但编号与写入规则保持一致。
import { closeDuckdb, appendFact, appendQuarantineEvent, runInTransaction, AuditIoError, classifyWriteError } from '../fact/store.js';
import { protocolCrashError, isProtocolCrash, countsFromStats } from '../intake/quarantine.js';
export async function writeRunFactsAndEvents(writer, input) {
    const FACT_WRITE_BATCH = 500;
    const seen = new Set();
    let factsWritten = 0;
    let eventsWritten = 0;
    const crashCtx = function (sha) {
        return { repo_ref: input.ctx.repoRef, run_id: input.ctx.traceId, commit_sha: sha, head_date: input.headDate, collector: input.collector };
    };
    const crashCounts = function () {
        return countsFromStats(input.fieldStats, input.commitCount, factsWritten, eventsWritten);
    };
    try {
        const commitShaSet = new Set(input.commits.map(function (c) { return c.sha; }));
        const factsBySha = new Map();
        const restFacts = [];
        for (const f of input.facts) {
            if (commitShaSet.has(f.subject_ref)) {
                const arr = factsBySha.get(f.subject_ref) || [];
                arr.push(f);
                factsBySha.set(f.subject_ref, arr);
            }
            else {
                restFacts.push(f);
            }
        }
        const eventsBySha = new Map();
        for (const fe of input.fieldEvents) {
            const arr = eventsBySha.get(fe.commit_sha) || [];
            arr.push(fe);
            eventsBySha.set(fe.commit_sha, arr);
        }
        const appendEvents = async function (evs) {
            for (const fe of evs) {
                await appendQuarantineEvent(writer, { run_id: input.ctx.traceId, commit_sha: fe.commit_sha, field_name: fe.field_name, disposition: fe.disposition, reason_code: fe.reason_code, raw: fe.raw, collector: input.collector, recorded_at: input.headDate });
                eventsWritten += 1;
            }
        };
        for (const c of input.commits) {
            const cFacts = input.anchorQuarantined ? [] : (factsBySha.get(c.sha) || []);
            const cEvents = eventsBySha.get(c.sha) || [];
            if (cFacts.length > 0 || cEvents.length > 0) {
                await runInTransaction(writer, async function () {
                    for (const f of cFacts) {
                        if (!seen.has(f.fact_id)) {
                            seen.add(f.fact_id);
                            await appendFact(writer, f);
                            factsWritten += 1;
                        }
                    }
                    await appendEvents(cEvents);
                });
            }
            // 检查当前提交写入隔离记录的计数是否一致
            const cn = await (await writer.run('SELECT COUNT(*) FROM quarantine_log WHERE run_id = ? AND commit_sha = ?', [input.ctx.traceId, c.sha])).getRows();
            if (Number(cn[0][0]) !== cEvents.length) {
                throw protocolCrashError('INTAKE-IDENTITY-MISMATCH', '逐 commit 增量恒等式断言失败：sha=' + c.sha + ' 期望 ' + cEvents.length + ' 库内 ' + Number(cn[0][0]), { crash_location: input.crashSource + ':per-commit-identity', run_context: crashCtx(c.sha), counts: crashCounts() });
            }
        }
        // 非提交粒度的事实按 500 条分批写入，未绑定到提交的隔离事件随最后一批事务一起提交
        const orphanEvents = input.fieldEvents.filter(function (fe) { return !commitShaSet.has(fe.commit_sha); });
        for (let i = 0; i < restFacts.length; i += FACT_WRITE_BATCH) {
            const batch = restFacts.slice(i, i + FACT_WRITE_BATCH);
            const lastChunk = i + FACT_WRITE_BATCH >= restFacts.length;
            await runInTransaction(writer, async function () {
                if (!input.anchorQuarantined) {
                    for (const f of batch) {
                        if (!seen.has(f.fact_id)) {
                            seen.add(f.fact_id);
                            await appendFact(writer, f);
                            factsWritten += 1;
                        }
                    }
                }
                if (lastChunk) {
                    await appendEvents(orphanEvents);
                }
            });
        }
        if (restFacts.length === 0 && orphanEvents.length > 0) {
            await runInTransaction(writer, async function () { await appendEvents(orphanEvents); });
        }
    }
    catch (e) {
        try {
            closeDuckdb(writer);
        }
        catch (_) { /* 关闭数据库失败不覆盖主异常 */ }
        if (isProtocolCrash(e)) {
            throw e;
        }
        if (classifyWriteError(e) === 'io') {
            throw new AuditIoError('fact/quarantine 写 IO 失败（D-115③ IO 失败类退出类——非协议崩溃）：' + String(e.message || e));
        }
        throw protocolCrashError('QUARANTINE-CONSTRAINT', 'fact/quarantine 事务写失败（该批 ROLLBACK 无半截写）：' + String(e.message || e), { crash_location: input.crashSource + ':fact-write-tx', run_context: crashCtx(null), counts: crashCounts() });
    }
    return { factsWritten: factsWritten, eventsWritten: eventsWritten };
}
