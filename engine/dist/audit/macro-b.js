// audit/macro-b.ts —— 单仓四象限档的主管线，把一次审计拆成引擎里能复用的几步，
// 真实 audit 命令和演示场景都走它：接仓库→git 探一遍→采集器加行为指标→写事实表→拼报告骨架。
// 具体几步：
// 1. 先摸清仓库底细，把提交记录读出来
// 2. 采架构决策记录、提交记录、定位文本和行为面的数据
// 3. 拿事先写死的判据算判（正对照、负对照、真判据）
// 报告最后怎么拼，交给调用方。
// 死规矩：对仓库目录只读；演示场景把外部依赖全关掉，图的是产物一字不差。
import { execFileSync } from 'node:child_process';
import { collectAdrStructureV2, collectAdrStructure, collectGitlog, collectPositioning, sha256Hex, ADR_FIVE_PIECE } from '../collect/collectors.js';
import { readRepoFileSafe, listAdrFilesSafe, probeRepoEntry, makeFileSubjectSkipFact } from './safe-read.js';
import { collectCodeloreFacets, CODELORE_BEHAVIOR_FACETS } from '../upstream/codelore.js';
import { collectFileLineage, gitRenameLogArgs, parseRenameLogZ, RENAME_DEFAULT_THRESHOLD, RENAME_DETECTOR_VERSION } from '../collect/file-lineage.js';
// 先看 git 时间戳的写法对不对；上游工具不同版本的等价写法先吸收掉，校验时见到的都是标准形。
import { classifyGitIsoField, recordFieldInstance, emptyFieldStat, protocolCrashError, absorbGitIsoDialect, FIELD_HEAD_DATE, FIELD_COMMITTER_DATE } from '../intake/quarantine.js';
const NL = String.fromCharCode(10);
// ---------- 判据门槛：开工前定死，跑完不许改 ----------
// 首报要过形式、内容、信任三道关，所以门槛必须在跑之前写死；跑完再调就是凑结果。
export const TC1_LAG_DAYS = 90;
export const TC1_RATIO_RED = 0.20;
export const TC1_MIN_N = 5;
export const TC2_MEAN_RED = 0.60;
export const TC2_FIELD_MISSING_RED = 0.50;
export const TC3_RED = 0.50;
export const TC3_GREEN = 0.70;
export const TC3_TOPN = 20;
// 定位分析里不看的那些高频虚词
export const MACRO_B_STOPWORDS = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'per', 'via', 'not', 'all', 'any', 'are', 'was', 'were', 'has', 'have', 'had', 'its', 'but', 'can', 'may', 'our', 'out', 'over', 'under', 'when', 'which', 'will', 'would', 'should', 'must', 'such', 'than', 'then', 'they', 'them', 'their', 'there', 'here', 'each', 'both', 'same', 'more', 'most', 'some', 'only', 'also', 'been', 'being', 'does', 'did', 'done', '的', '了', '是', '在', '和', '与', '及', '或', '为', '以', '对', '从', '到', '被', '把', '给', '让', '使', '等', '就', '都', '也', '还', '很', '更', '最', '要', '会', '能', '可', '将', '已', '未', '无', '非', '个', '中', '上', '下', '之', '其', '此', '该', '由', '而', '但', '则', '若', '如', '于', '所', '有', '这', '那', '不', '一', '二', '三', '的的', '了的', '是在', '和的', '与的', '为的', '对的', '中的', '上的', '下的', '之中', '一个', '这个', '那个', '我们', '他们', '可以', '因为', '所以', '但是', '如果', '通过', '进行', '以及', '并且', '从而', '因此', '其中', '对应', '相关', '分别', '同时', '之后', '之前', '以内', '以上', '以下'];
// ---------- 正对照和负对照的样例数据（用来确认采集和判定这两条通道还活着） ----------
export const GOLDEN_ADR = [
    '# ADR-9999: PC-1 golden fixture',
    '',
    '- Status: accepted',
    '- Date: 2026-09-13',
    '- Deciders: fixture',
    '- Ledger: D-000',
    '',
    '## Context',
    '',
    'fixture context.',
    '',
    '## Decision',
    '',
    'fixture decision.',
    '',
    '## Consequences',
    '',
    'fixture consequences; this supersedes ADR-0000.'
].join(NL);
export const POS_DECL = 'macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor';
function git(root, args) {
    return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim();
}
export function probeMacroBRepo(repoRoot, headSha, opts) {
    const run = opts && opts.gitRunner ? opts.gitRunner : git;
    const fieldStats = [emptyFieldStat(FIELD_HEAD_DATE), emptyFieldStat(FIELD_COMMITTER_DATE)];
    const fieldEvents = [];
    const dialectAbsorptions = [];
    let headRaw = '';
    let treeSha = '';
    let commitCount = 0;
    let rawLog = '';
    try {
        headRaw = run(repoRoot, ['log', '-1', '--format=%cI']);
        treeSha = run(repoRoot, ['rev-parse', 'HEAD^{tree}']);
        commitCount = Number(run(repoRoot, ['rev-list', '--count', 'HEAD']));
        rawLog = run(repoRoot, ['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
    }
    catch (e) {
        const ee = e;
        throw protocolCrashError('GIT-PROBE-FAILED', 'git 只读子命令失败：' + String(e.message || e).split(NL)[0], {
            raw: ee && ee.stderr ? String(ee.stderr) : null,
            crash_location: 'audit/macro-b.ts:probeMacroBRepo',
            run_context: { repo_ref: repoRoot, commit_sha: headSha }
        });
    }
    const headAbs = absorbGitIsoDialect(headRaw);
    if (headAbs.absorption) {
        dialectAbsorptions.push({ field_name: FIELD_HEAD_DATE, commit_sha: headSha, rule_id: headAbs.absorption.rule_id, raw: headAbs.absorption.raw, canonical: headAbs.absorption.canonical });
    }
    const headCls = classifyGitIsoField(headAbs.value, { anchor: true });
    recordFieldInstance(fieldStats[0], fieldEvents, headCls, headSha, FIELD_HEAD_DATE);
    const headDate = headCls.value;
    const commits = [];
    let cur = null;
    for (const line of rawLog.split(NL)) {
        const t = line.trim();
        if (t.indexOf('__R__') === 0) {
            const parts = t.slice(5).split('|');
            if (parts.length !== 3) {
                throw protocolCrashError('GITCLI-OUTPUT-CONTRACT', 'git log 记录形状违约：期望 3 字段实得 ' + parts.length + '（嵌定界符/记录截断→字段不可定界=协议级违约，D-100①）', {
                    raw: t,
                    crash_location: 'audit/macro-b.ts:probeMacroBRepo:log-parse',
                    run_context: { repo_ref: repoRoot, commit_sha: parts.length > 0 ? parts[0] : null },
                    counts: { commits_seen: commits.length }
                });
            }
            const abs = absorbGitIsoDialect(parts[2]);
            if (abs.absorption) {
                dialectAbsorptions.push({ field_name: FIELD_COMMITTER_DATE, commit_sha: parts[0], rule_id: abs.absorption.rule_id, raw: abs.absorption.raw, canonical: abs.absorption.canonical });
            }
            const cls = classifyGitIsoField(abs.value);
            cur = { sha: parts[0], author: parts[1], date: cls.value, paths: [] };
            recordFieldInstance(fieldStats[1], fieldEvents, cls, parts[0], FIELD_COMMITTER_DATE);
            commits.push(cur);
        }
        else if (cur && t.length > 0) {
            cur.paths.push(t);
        }
    }
    if (commits.length !== commitCount) {
        throw protocolCrashError('PROBE-INVARIANT-FAIL', '[' + repoRoot + ']: parsed ' + commits.length + ' != git rev-list ' + commitCount, {
            crash_location: 'audit/macro-b.ts:probeMacroBRepo:invariant',
            run_context: { repo_ref: repoRoot, commit_sha: headSha },
            counts: { commits_seen: commits.length }
        });
    }
    let subjects;
    try {
        subjects = run(repoRoot, ['log', '--pretty=format:%s']).split(NL);
    }
    catch (e) {
        const ee = e;
        throw protocolCrashError('GIT-PROBE-FAILED', 'git %s 探针失败：' + String(e.message || e).split(NL)[0], {
            raw: ee && ee.stderr ? String(ee.stderr) : null,
            crash_location: 'audit/macro-b.ts:probeMacroBRepo:subjects',
            run_context: { repo_ref: repoRoot, commit_sha: headSha },
            counts: { commits_seen: commits.length, records_parsed: commits.length }
        });
    }
    return { headSha: headSha, headDate: headDate, headRaw: headRaw, headStatus: headCls.status, treeSha: treeSha, commitCount: commitCount, commits: commits, subjects: subjects, fieldEvents: fieldEvents, fieldStats: fieldStats, dialectAbsorptions: dialectAbsorptions };
}
// 拿 git 客户端版本；没装或者跑挂了就返回 'unknown'
export function probeGitVersion() {
    try {
        return execFileSync('git', ['--version'], { encoding: 'utf8' }).trim();
    }
    catch {
        return 'unknown';
    }
}
const defaultRenameLogRunner = function (repoRoot, args) { return git(repoRoot, args); };
export function collectMacroB(repoRoot, spec, ctx, probes) {
    const skipFacts = [];
    const skipSeen = new Set();
    const pushSkip = function (f) { if (!skipSeen.has(f.fact_id)) {
        skipSeen.add(f.fact_id);
        skipFacts.push(f);
    } };
    // ---------- 扫 ADR 目录、挨个读 ----------
    // 目录遍历走安全那套；目录被链到仓外就直接拒，并记一条事实
    const ADR_REL_DIR = 'docs/adr';
    const adrListing = listAdrFilesSafe(repoRoot, ADR_REL_DIR);
    if (!adrListing.ok && adrListing.reason !== 'missing') {
        pushSkip(makeFileSubjectSkipFact(ctx, ADR_REL_DIR, adrListing.reason));
    }
    const rawAdrFiles = adrListing.ok ? adrListing.files : [];
    const firstCommitOf = function (p) {
        let best = null;
        for (const c of probes.commits) {
            if (c.date !== null && c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) {
                best = c.date;
            }
        }
        return best;
    };
    const adrDocs = [];
    const adrFiles = [];
    for (const f of rawAdrFiles) {
        const rel = 'docs/adr/' + f;
        const readRes = readRepoFileSafe(repoRoot, rel);
        if (!readRes.ok) {
            pushSkip(makeFileSubjectSkipFact(ctx, rel, readRes.reason));
            continue;
        }
        adrFiles.push(f);
        adrDocs.push({ path: rel, text: readRes.text, first_commit_date: firstCommitOf(rel) });
    }
    const adrPaths = adrDocs.map(function (d) { return d.path; });
    const adrFacts = collectAdrStructureV2({ documents: adrDocs }, ctx);
    const adrDateMap = {};
    for (const f of adrFacts) {
        if (f.metric === 'adr.decision_date') {
            const v = JSON.parse(f.value_json);
            if (v.date) {
                adrDateMap[f.subject_ref] = v.date.slice(0, 10);
            }
        }
    }
    const gitFacts = collectGitlog({ commits: probes.commits, paths: adrPaths, adrDates: adrDateMap }, ctx);
    // ---------- 定位分析：意图文档和实际改的内容对一对 ----------
    const intentDocs = [];
    for (const cand of spec.intentCandidates) {
        // 先看文件在不在；符号链接交给安全读取去查，文件没有就跳过
        if (probeRepoEntry(repoRoot, cand) === 'absent') {
            continue;
        }
        const readRes = readRepoFileSafe(repoRoot, cand);
        if (!readRes.ok) {
            pushSkip(makeFileSubjectSkipFact(ctx, cand, readRes.reason));
        }
        else {
            intentDocs.push({ path: cand, text: readRes.text });
        }
    }
    const deliveryDocs = [{ path: 'git log subjects @ ' + probes.headSha.slice(0, 7), text: probes.subjects.join(NL) }];
    const posFacts = intentDocs.length > 0
        ? collectPositioning({ intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: spec.topN, stopwords: spec.stopwords }, ctx)
        : [];
    // ---------- 采 codelore 行为面的指标 ----------
    let codeloreFacts = [];
    let codeloreResolution = null;
    if (spec.codelore === 'auto') {
        codeloreFacts = collectCodeloreFacets({ repoRoot: repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
        const resFact = codeloreFacts.find(function (f) { return f.metric === 'upstream.resolution'; });
        if (resFact) {
            const v = JSON.parse(resFact.value_json);
            codeloreResolution = { version: v.version !== undefined ? v.version : null, pinned: v.pinned === true, error: v.error !== undefined ? v.error : null };
        }
    }
    // ---------- 采文件改名的事实 ----------
    let fileLineageFacts = [];
    if (spec.fileLineage && spec.fileLineage.mode === 'on') {
        const threshold = spec.fileLineage.threshold || RENAME_DEFAULT_THRESHOLD;
        const runner = spec.fileLineage.runner || defaultRenameLogRunner;
        const gitVersion = probeGitVersion();
        const rawLog = runner(repoRoot, gitRenameLogArgs(threshold));
        fileLineageFacts = collectFileLineage({
            edges: parseRenameLogZ(rawLog),
            headSha: probes.headSha,
            threshold: threshold,
            detectorVersion: RENAME_DETECTOR_VERSION,
            gitVersion: gitVersion
        }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt });
    }
    // ---------- 正对照：确认分析管线还在正常干活 ----------
    const pc1AdrFacts = collectAdrStructure({ documents: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-golden-adr.md', text: GOLDEN_ADR }] }, ctx);
    const pc1PosFacts = collectPositioning({ intentDocs: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-positioning.md', text: POS_DECL }], deliveryDocs: [{ path: 'fixtures/' + spec.fixtureTag + '-pc1-delivery.md', text: POS_DECL }], topN: spec.topN, stopwords: spec.stopwords }, ctx);
    const pc1Five = pc1AdrFacts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
    const pc1Sup = pc1AdrFacts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
    const pc1 = { pass: pc1AdrFacts.length > 0 && pc1PosFacts.length > 0 && !!pc1Five && JSON.parse(pc1Five.value_json).present === 5 && !!pc1Sup && JSON.parse(pc1Sup.value_json).present === true };
    const PC2_PATH = 'fixtures/' + spec.fixtureTag + '-pc2-lag-adr.md';
    const pc2Commits = [{ sha: spec.pc2Sha, author: 'fixture', date: '2026-01-01T00:00:00+00:00', paths: [PC2_PATH] }];
    const pc2AdrDates = {};
    pc2AdrDates[PC2_PATH] = '2026-09-13';
    const pc2Facts = collectGitlog({ commits: pc2Commits, paths: [PC2_PATH], adrDates: pc2AdrDates }, ctx);
    const pc2Lag = pc2Facts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
    const pc2 = { pass: pc2Lag.length > 0 && JSON.parse(pc2Lag[0].value_json).delta_days > 0, delta_days: pc2Lag.length > 0 ? JSON.parse(pc2Lag[0].value_json).delta_days : null };
    // ---------- 负对照：挑非 ADR 文件，本来就该解析不出 ADR 结构 ----------
    let nc1Path = null;
    let nc1Text = null;
    for (const cand of spec.nc1Candidates) {
        if (probeRepoEntry(repoRoot, cand) === 'absent') {
            continue;
        }
        const r = readRepoFileSafe(repoRoot, cand);
        if (!r.ok) {
            pushSkip(makeFileSubjectSkipFact(ctx, cand, r.reason));
        }
        else {
            nc1Path = cand;
            nc1Text = r.text;
            break;
        }
    }
    if (!nc1Path || nc1Text === null) {
        throw new Error('NC1-CANDIDATE-MISS[' + repoRoot + ']');
    }
    const nc1Facts = collectAdrStructure({ documents: [{ path: nc1Path, text: nc1Text }] }, ctx);
    const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
    const nc1Sup = nc1Facts.find(function (f) { return f.metric === 'adr.supersede_link_present'; });
    const nc1 = { path: nc1Path, fact_count: nc1Facts.length, five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1, supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null, pass: false };
    nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;
    return {
        adrFiles: adrFiles, intentDocs: intentDocs, nc1Path: nc1Path,
        adrFacts: adrFacts.concat(skipFacts),
        gitFacts: gitFacts, posFacts: posFacts, codeloreFacts: codeloreFacts,
        fileLineageFacts: fileLineageFacts,
        realFacts: adrFacts.concat(skipFacts, posFacts, gitFacts, codeloreFacts, fileLineageFacts),
        pc1: pc1, pc2: pc2, nc1: nc1,
        pc1AdrFacts: pc1AdrFacts, pc1PosFacts: pc1PosFacts, pc2Lag: pc2Lag, nc1Facts: nc1Facts,
        codeloreResolution: codeloreResolution
    };
}
// 真判据的算法：按事先约好的规则，把各项指标算出来
export function evaluateMacroB(collect) {
    const lagValues = collect.gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return JSON.parse(f.value_json); });
    const tc1Judgeable = lagValues.length;
    const tc1Backfill = lagValues.filter(function (v) { return v.delta_days > TC1_LAG_DAYS; }).length;
    const tc1Ratio = tc1Judgeable === 0 ? 0 : tc1Backfill / tc1Judgeable;
    const tc1Verdict = tc1Judgeable < TC1_MIN_N ? 'INCONCLUSIVE' : (tc1Ratio > TC1_RATIO_RED ? 'RED' : 'NOT_RED');
    const fiveValues = collect.adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return JSON.parse(f.value_json); });
    const tc2Total = fiveValues.length;
    const tc2Mean = tc2Total === 0 ? 0 : fiveValues.reduce(function (s, v) { return s + v.ratio; }, 0) / tc2Total;
    const tc2Missing = {};
    for (const k of ADR_FIVE_PIECE) {
        tc2Missing[k] = 0;
    }
    for (const v of fiveValues) {
        for (const k of v.missing) {
            tc2Missing[k] = tc2Missing[k] + 1;
        }
    }
    const tc2MissingRatio = {};
    for (const k of Object.keys(tc2Missing)) {
        tc2MissingRatio[k] = tc2Total === 0 ? 0 : tc2Missing[k] / tc2Total;
    }
    const tc2CondA = tc2Mean < TC2_MEAN_RED;
    let tc2CondB = false;
    for (const k of Object.keys(tc2MissingRatio)) {
        if (tc2MissingRatio[k] > TC2_FIELD_MISSING_RED) {
            tc2CondB = true;
        }
    }
    const tc2Verdict = (tc2CondA || tc2CondB) ? 'RED' : 'NOT_RED';
    const covFacts = collect.posFacts.filter(function (f) { return f.metric === 'positioning.keyword_coverage'; }).map(function (f) { return { subject: f.subject_ref, value: JSON.parse(f.value_json), fact_id: f.fact_id }; });
    let tc3Lowest = null;
    for (const c of covFacts) {
        if (tc3Lowest === null || c.value.ratio < tc3Lowest.value.ratio) {
            tc3Lowest = c;
        }
    }
    const tc3Ratio = tc3Lowest ? tc3Lowest.value.ratio : 0;
    const tc3Verdict = collect.intentDocs.length === 0 ? 'INCONCLUSIVE' : (tc3Ratio < TC3_RED ? 'RED' : (tc3Ratio < TC3_GREEN ? 'AMBER' : 'GREEN'));
    return {
        tc1: { judgeable_n: tc1Judgeable, backfill_n: tc1Backfill, ratio: tc1Ratio, verdict: tc1Verdict },
        tc2: { total: tc2Total, mean_ratio: tc2Mean, missing_counts: tc2Missing, missing_ratio: tc2MissingRatio, cond_a: tc2CondA, cond_b: tc2CondB, verdict: tc2Verdict },
        tc3: { per_source: covFacts, lowest_path: tc3Lowest ? tc3Lowest.subject : null, lowest_ratio: tc3Ratio, verdict: tc3Verdict },
        covFacts: covFacts,
        lagFactIds: collect.gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return f.fact_id; }),
        fiveFactIds: collect.adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return f.fact_id; })
    };
}
export function tcBand(v) {
    if (v === 'INCONCLUSIVE') {
        return 'insufficient';
    }
    if (v === 'RED') {
        return 'unsupported';
    }
    return 'supported';
}
// 把上下文标识拼出来：运行标识、追踪标识、仓库标识。
// 提交时间坏了就用原始字节算个哈希当固定标识，绝不编个时间糊上去。
export function macroBContext(runIdLabel, ctxLabel, headSha, headDate, headRaw, scale = 'Macro-B') {
    const anchor = headDate === null ? 'quarantined:' + sha256Hex(headRaw === undefined ? '' : headRaw) : headDate;
    return {
        runId: runIdLabel + '-' + headSha.slice(0, 7),
        traceId: sha256Hex(ctxLabel + '|' + headSha + '|' + anchor).slice(0, 32),
        repoRef: ctxLabel + '@' + headSha,
        scale: scale,
        observedAt: headDate === null ? 'quarantined(anchor_head_date_malformed)' : headDate
    };
}
