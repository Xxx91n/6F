// audit/fact-write.ts —— 写事实和隔离记录的公共流水线
// 几档审计共用同一套只往后加、不改老行的写库流程，所以抽到这里一份。
// audit.ts（单仓四象限档）和 macro-c.ts（历史演化档）都走这里：
// 同一个写入函数；同一套事务边界（一个提交一个事务，每批 500 条）；
// 同一套事实编号规则（只追加、按内容算号）；同一套数量核对。
// 单文件档的补采（audit/file-card.ts）也用 appendFact 和 runInTransaction，只是写的时候不一样；编号和写法规矩还是这一套。
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
            // 核对这个提交写进去的隔离事件条数对不对得上
            const cn = await (await writer.run('SELECT COUNT(*) FROM quarantine_log WHERE run_id = ? AND commit_sha = ?', [input.ctx.traceId, c.sha])).getRows();
            if (Number(cn[0][0]) !== cEvents.length) {
                throw protocolCrashError('INTAKE-IDENTITY-MISMATCH', '逐 commit 增量恒等式断言失败：sha=' + c.sha + ' 期望 ' + cEvents.length + ' 库内 ' + Number(cn[0][0]), { crash_location: input.crashSource + ':per-commit-identity', run_context: crashCtx(c.sha), counts: crashCounts() });
            }
        }
        // 不属于某个提交的事实按 500 条一批写；没挂到提交上的隔离事件跟最后一批一块儿提交
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
