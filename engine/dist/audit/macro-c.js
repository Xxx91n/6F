// audit/macro-c.ts —— Macro-C（演化考古）一等面（#84 / D-204②④ / ADR-0015 重校准硬准入）
// .scratch/architecture-recovery/reports/38-macro-c-preview.mjs 移植：编排语义逐段保真——
//   38 §0 触发→§1 gitlog→§2 ADR 语料→§3 codelore 30 面＋LLM 门控→§4 supersede 链→§5 fact 同位发射
//   →§6 measurements→§7 证据→§8 判据（跑前写死常量段）→§9 报告装配。
// 移植差异面（预声明包 2026-10-03-r57-t1-predecl.md §2.5/§5.1 声明在案）：
//   ①intake 走仓级 probeMacroBRepo（硬化 intake 替代脚本裸解析——病态字段 quarantine 非崩溃）；
//   ②NC 对照选材/explainPaths 候选化（列首保 38 原路径，band 级对账不受候选差影响）；
//   ③fact 发射=file-card 同位（fact-write.ts 共享核：同 emit 函数/同 grain/同恒等式）；
//   ④重校准=85-check 差分对账（同语料编排层独立重算，语料漂移非等值目标——38-check F5 先例）。
// 纪律：被测仓只读；kernel 边界内（D-058）——确定性采集＋骨架渲染，叙事职责不外携（D-053）；
//   LLM env 门控关=llm_gated 降级披露（不伪造不真调）。
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { repoAdd } from '../intake/intake.js';
import { probeMacroBRepo, macroBContext, probeGitVersion } from './macro-b.js';
import { auditRepoName } from './audit.js';
import { collectAdrStructureV2, collectGitlog, makeFact, ADR_STRUCTURE_V2_DESCRIPTOR } from '../collect/collectors.js';
import { collectCodeloreFacets, collectCodeloreLlm, CODELORE_BATCH1_FACETS } from '../upstream/codelore.js';
import { CODELORE_S3_FACETS } from './upstream-dimension-map.js';
import { buildReport, renderMarkdown, renderSidecar, deriveOverallBand, ADJUDICATION_PROTOCOL_VERSION, REPORT_SKELETON_VERSION, UNVERIFIED_MARK } from '../report/generate.js';
import { openWriter, queryQuarantineCounts, closeDuckdb } from '../fact/store.js';
import { strictQuarantineViolations, ratchetIssues, protocolCrashError, intakeIdentityIssues, countsFromStats, QUARANTINE_FIELD_RATIO_RED } from '../intake/quarantine.js';
import { writeRunFactsAndEvents } from './fact-write.js';
const NL = String.fromCharCode(10);
// ---------- 判据常量（38 §8 跑前写死段移植——ADR-0013 判据先于实跑） ----------
export const MACRO_C_LAG_MIN_N = 30; // TC-MC-2 可判定数门槛
export const MACRO_C_CAPABILITY_LABEL = 'capability 2 of 5 · preview';
export const MACRO_C_REPORT_ID_PREFIX = 'MA-AUDIT-';
export const MACRO_C_NC_CANDIDATES = ['apps/cli/package.json', 'package.json', 'Cargo.toml', 'pom.xml', 'pyproject.toml', 'go.mod', 'README.md'];
export const MACRO_C_LLM_EXPLAIN_CANDIDATES = ['apps/cli/src/index.ts', 'apps/cli/src/composition.ts', 'src/index.ts', 'src/main.ts'];
export const MACRO_C_SUPERSEDE_KINDS = ['whole-adr-status', 'item-level-inline'];
export function scanSupersedeAdrs(adrDocs) {
    const adrs = [];
    for (const d of adrDocs) {
        const num = d.path.split('/').pop().match(/^(\d+)/)[1];
        const text = d.text;
        const statusLine = (text.match(/^\s*[-*]?\s*status\s*[:：][^\n]*/im) || [''])[0].trim();
        const wholeTo = (statusLine.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || [])[1] || null;
        const inlineRefs = [];
        const lines = text.split(NL);
        lines.forEach(function (line, i) {
            const sm = line.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || line.match(/supersedes?\s+ADR-?(\d{3,})/i);
            if (sm && !/^\s*[-*]?\s*status\s*[:：]/i.test(line)) {
                const negated = /(does not|do not|not a|no longer|never)\s+supersede/i.test(line);
                inlineRefs.push({ line: i + 1, to: sm[1], negated: negated });
            }
        });
        const amends = [];
        const refs = [];
        const defers = [];
        text.split(NL).forEach(function (line, i) {
            if (!/^\s*(Amends|References)\s*[:：]/i.test(line)) {
                return;
            }
            const isAmends = /^Amends/i.test(line.trim());
            for (const mm of line.matchAll(/ADR-?(\d{3,})/gi)) {
                (isAmends ? amends : refs).push({ line: i + 1, to: mm[1] });
            }
            for (const mm of line.matchAll(/defer-(\d{3,})/gi)) {
                defers.push({ line: i + 1, to: 'defer-' + mm[1] });
            }
        });
        const mentions = Array.from(new Set(Array.from(text.matchAll(/ADR-?(\d{3,})/gi)).map(function (x) { return x[1]; })));
        adrs.push({ file: d.path, num: num, whole_to: wholeTo, inline: inlineRefs, amends: amends, refs: refs, defers: defers, mentions: mentions });
    }
    return adrs;
}
export function buildSupersedeChain(adrs, deferRegistryPresent) {
    const numSet = new Set(adrs.map(function (a) { return a.num; }));
    const edges = [];
    for (const a of adrs) {
        if (a.whole_to) {
            edges.push({ from: a.num, to: a.whole_to, kind: 'whole-adr-status', evidence: a.file + ' status-line', resolved: false, back_reference: null });
        }
        for (const r of a.inline) {
            edges.push({ from: a.num, to: r.to, kind: r.negated ? 'explicit-non-supersede' : 'item-level-inline', evidence: a.file + ':' + r.line, resolved: false, back_reference: null });
        }
        for (const r of a.amends) {
            edges.push({ from: a.num, to: r.to, kind: 'amends', evidence: a.file + ':' + r.line, resolved: false, back_reference: null });
        }
        for (const r of a.refs) {
            edges.push({ from: a.num, to: r.to, kind: 'references', evidence: a.file + ':' + r.line, resolved: false, back_reference: null });
        }
        for (const r of a.defers) {
            edges.push({ from: a.num, to: r.to, kind: 'defer-ref', evidence: a.file + ':' + r.line, resolved: false, back_reference: null });
        }
    }
    for (const e of edges) {
        if (e.from === e.to) {
            e.kind = 'self-quote-artifact';
        }
        if (e.kind === 'defer-ref') {
            e.resolved = deferRegistryPresent;
        }
        else {
            e.resolved = numSet.has(e.to);
        }
        if (e.kind !== 'defer-ref' && e.resolved) {
            const target = adrs.find(function (a) { return a.num === e.to; });
            e.back_reference = target ? target.mentions.indexOf(e.from) >= 0 : false;
        }
        else {
            e.back_reference = null;
        }
    }
    return {
        edge_count: edges.length,
        whole_adr_supersessions: edges.filter(function (e) { return e.kind === 'whole-adr-status'; }).length,
        item_level_supersessions: edges.filter(function (e) { return e.kind === 'item-level-inline'; }).length,
        amends_edges: edges.filter(function (e) { return e.kind === 'amends'; }).length,
        references_edges: edges.filter(function (e) { return e.kind === 'references'; }).length,
        defer_ref_edges: edges.filter(function (e) { return e.kind === 'defer-ref'; }).length,
        explicit_non_supersedes: edges.filter(function (e) { return e.kind === 'explicit-non-supersede'; }).length,
        self_quote_artifacts: edges.filter(function (e) { return e.kind === 'self-quote-artifact'; }).length,
        unresolved_refs: edges.filter(function (e) { return !e.resolved && e.kind !== 'self-quote-artifact'; }).map(function (e) { return e.from + '->' + e.to + ' (' + e.kind + ', ' + e.evidence + ')'; }),
        missing_backrefs: edges.filter(function (e) { return MACRO_C_SUPERSEDE_KINDS.indexOf(e.kind) >= 0 && e.resolved && e.back_reference === false; }).map(function (e) { return e.from + '->' + e.to + ' (' + e.kind + ', ' + e.evidence + ')'; })
    };
}
export function collectMacroC(repoRoot, probes, ctx, spec) {
    // §2 ADR 语料（docs/adr 编号文件；first_commit=含该文件的最早 dated commit——D-100② 毒值跳过同构 38）
    const adrDir = join(repoRoot, 'docs', 'adr');
    const adrFiles = existsSync(adrDir) ? readdirSync(adrDir).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort() : [];
    const firstCommitOf = function (relPath) {
        let best = null;
        for (const c of probes.commits) {
            if (c.date !== null && c.paths.indexOf(relPath) >= 0 && (best === null || c.date < best)) {
                best = c.date;
            }
        }
        return best;
    };
    const adrDocs = adrFiles.map(function (f) {
        const rel = 'docs/adr/' + f;
        return { path: rel, text: readFileSync(join(adrDir, f), 'utf8'), first_commit_date: firstCommitOf(rel) };
    });
    const adrFacts = collectAdrStructureV2({ documents: adrDocs }, ctx);
    const adrDateMap = {};
    for (const f of adrFacts) {
        if (f.metric === 'adr.decision_date') {
            const v = JSON.parse(f.value_json);
            if (v.date) {
                adrDateMap[f.subject_ref] = String(v.date).slice(0, 10);
            }
        }
    }
    const gitFacts = collectGitlog({ commits: probes.commits, paths: adrDocs.map(function (d) { return d.path; }), adrDates: adrDateMap }, ctx);
    // §3 codelore 契约面 30 面＋LLM 门控面（38 同款直调——emitPerFileFacts 在发射边界内落 Micro-B grain）
    const codeloreFacts = collectCodeloreFacets({ repoRoot: repoRoot }, ctx);
    const explainCandidates = (spec && spec.llmExplainCandidates) || MACRO_C_LLM_EXPLAIN_CANDIDATES;
    const explainPaths = explainCandidates.filter(function (p) { return existsSync(join(repoRoot, p)); }).slice(0, 2);
    const llmFacts = collectCodeloreLlm({ repoRoot: repoRoot, explainPaths: explainPaths, diffRange: (spec && spec.llmDiffRange) || 'HEAD~10..HEAD' }, ctx);
    const llmGateFact = llmFacts.find(function (f) { return f.metric === 'codelore.llm_gate'; });
    const llmGate = llmGateFact ? JSON.parse(llmGateFact.value_json) : { configured: false, reason: 'no-gate-fact' };
    // §4 supersede 链（38 逐行移植）＋链摘要 fact（同族 metric，evidence=docs/adr 扫描）
    const adrs = scanSupersedeAdrs(adrDocs);
    const deferRegistryPresent = existsSync(join(repoRoot, 'docs', 'deferred-registry.json'));
    const chain = buildSupersedeChain(adrs, deferRegistryPresent);
    const chainFact = makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, 'docs/adr/*', 'docs/adr/* status+inline scan', 'adr.supersede_chain_summary', chain);
    // §5 fact_id 内容寻址去重（38 同款：resolution 双 emit 合一；保留首见，dedup 计数留痕）
    const rawFacts = adrFacts.concat(gitFacts, codeloreFacts, llmFacts, [chainFact]);
    const seenFactIds = new Set();
    const realFacts = [];
    let dedupDropped = 0;
    for (const f of rawFacts) {
        if (seenFactIds.has(f.fact_id)) {
            dedupDropped += 1;
            continue;
        }
        seenFactIds.add(f.fact_id);
        realFacts.push(f);
    }
    const resFact = codeloreFacts.find(function (f) { return f.metric === 'upstream.resolution'; });
    let codeloreResolution = null;
    if (resFact) {
        const v = JSON.parse(resFact.value_json);
        codeloreResolution = { version: v.version !== undefined ? v.version : null, pinned: v.pinned === true, error: v.error !== undefined ? v.error : null };
    }
    return { adrDocs: adrDocs, adrFacts: adrFacts, gitFacts: gitFacts, codeloreFacts: codeloreFacts, llmFacts: llmFacts, llmGate: llmGate, chain: chain, chainFact: chainFact, realFacts: realFacts, dedupDropped: dedupDropped, codeloreResolution: codeloreResolution };
}
export function evaluateMacroC(col, repoRoot, ctx, ncCandidates) {
    const facetRowsFacts = col.codeloreFacts.filter(function (f) { return f.metric === 'codelore.facet_rows'; });
    const facetErrFacts = col.codeloreFacts.filter(function (f) { return f.metric === 'codelore.facet_error' || f.metric === 'codelore.facet_parse_error'; });
    const lagFacts = col.gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
    const dateFacts = col.adrFacts.filter(function (f) { return f.metric === 'adr.decision_date' && JSON.parse(f.value_json).date !== null; });
    const legDist = {};
    for (const f of col.adrFacts) {
        if (f.metric === 'adr.header_field_present' || f.metric === 'adr.decision_date') {
            const v = JSON.parse(f.value_json);
            const leg = v.leg || 'miss';
            legDist[leg] = (legDist[leg] || 0) + 1;
        }
    }
    const pinned = col.codeloreResolution ? col.codeloreResolution.pinned === true : false;
    const chain = col.chain;
    const pcMc1 = pinned && facetRowsFacts.length === CODELORE_BATCH1_FACETS.length && facetErrFacts.length === 0 && col.adrFacts.length > 0;
    const pcMc2 = col.gitFacts.filter(function (f) { return f.metric === 'git.first_commit'; }).length >= col.adrDocs.length - 2;
    const tcMc1 = chain.edge_count >= 1 && chain.unresolved_refs.length === 0 && chain.missing_backrefs.length === 0;
    const tcMc2 = lagFacts.length >= MACRO_C_LAG_MIN_N;
    const tcMc3 = col.llmGate.configured === true && col.llmFacts.filter(function (f) { return f.metric === 'codelore.llm_narrative'; }).length >= 1;
    const cands = ncCandidates || MACRO_C_NC_CANDIDATES;
    let nc1Path = null;
    let ncMc1 = false;
    for (const c of cands) {
        if (existsSync(join(repoRoot, c))) {
            nc1Path = c;
            break;
        }
    }
    if (nc1Path !== null) {
        const nc1Doc = { path: nc1Path, text: readFileSync(join(repoRoot, nc1Path), 'utf8'), first_commit_date: null };
        const nc1Facts = collectAdrStructureV2({ documents: [nc1Doc] }, ctx);
        const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
        ncMc1 = !!nc1Five && JSON.parse(nc1Five.value_json).present === 0;
    }
    return { pcMc1: pcMc1, pcMc2: pcMc2, tcMc1: tcMc1, tcMc2: tcMc2, tcMc3: tcMc3, ncMc1: ncMc1, facetRowsFacts: facetRowsFacts, facetErrFacts: facetErrFacts, lagFacts: lagFacts, dateFacts: dateFacts, legDist: legDist, llmGatedCount: col.llmFacts.filter(function (f) { return f.metric === 'codelore.llm_gated'; }).length, llmNarrativeCount: col.llmFacts.filter(function (f) { return f.metric === 'codelore.llm_narrative'; }).length, nc1Path: nc1Path };
}
// ---------- 一等命令装配（38 §6~§9＋audit.ts 家族形态；capability 2 of 5 · preview） ----------
function pickExcerpt(absOrRelPath, tokens, base) {
    const text = readFileSync(base ? join(base, absOrRelPath) : absOrRelPath, 'utf8');
    const lines = text.split(NL);
    if (tokens === null) {
        return { line: 1, text: lines[0].trim() };
    }
    for (let i = 0; i < lines.length; i++) {
        let all = true;
        for (const tk of tokens) {
            if (lines[i].indexOf(tk) < 0) {
                all = false;
            }
        }
        if (all) {
            return { line: i + 1, text: lines[i].trim() };
        }
    }
    throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}
export async function runMacroCAudit(opts) {
    const cwd = opts.cwd || process.cwd();
    // ---------- §1 intake（ADR-0009 三段式；不自动 pull，refresh 显式 opt-in） ----------
    const intake = repoAdd(opts.input, { cwd: cwd, refresh: opts.refresh === true });
    const repoRoot = intake.resolved_root;
    const NAME = auditRepoName(opts.input, repoRoot);
    // ---------- §2 硬化 intake 探针（与 Macro-B 同 probe——锚字段病态 quarantine 非崩溃） ----------
    const probes = probeMacroBRepo(repoRoot, intake.head_sha);
    const ctx = macroBContext('audit-macro-c-' + NAME, NAME, probes.headSha, probes.headDate, probes.headRaw, 'Macro-C');
    const HEAD_AT = probes.headDate === null ? 'quarantined(anchor_head_date_malformed)' : probes.headDate;
    const anchorQuarantined = probes.headDate === null;
    const excludedCommits = probes.commits.filter(function (c) { return c.date === null; }).length;
    // strict quarantine 门禁（D-110）：与 audit.ts 同判据同向 fail-closed（crash_location 如实到本面）
    if (opts.strictQuarantine === true) {
        const violations = strictQuarantineViolations(probes.fieldEvents).concat(ratchetIssues(probes.fieldEvents));
        if (violations.length > 0) {
            const firstEv = probes.fieldEvents.filter(function (e) { return e.disposition === 'quarantined' && violations.join('|').indexOf(e.reason_code) >= 0; })[0];
            throw protocolCrashError('STRICT-QUARANTINE-VIOLATION', 'reason_code 越仓级基线/棘轮滞留（strict 模式 fail-closed）：' + violations.join(','), {
                raw: firstEv ? firstEv.raw : null,
                crash_location: 'macro-c.ts:strict-quarantine-gate',
                run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId, commit_sha: firstEv ? firstEv.commit_sha : null, head_date: probes.headDate, collector: 'macro-audit audit(macro-c)' },
                counts: countsFromStats(probes.fieldStats, probes.commitCount, 0, 0)
            });
        }
    }
    // ---------- §3 采集＋判据（38 §1~§5/§8） ----------
    const col = collectMacroC(repoRoot, probes, ctx);
    const ev = evaluateMacroC(col, repoRoot, ctx);
    const chain = col.chain;
    // ---------- §4 实测数落盘（outDir 或 scratch 临时目录：证据锚可读） ----------
    const persistOut = !!opts.outDir;
    const outDir = opts.outDir ? resolve(cwd, opts.outDir) : mkdtempSync(join(tmpdir(), 'macro-audit-run-'));
    mkdirSync(outDir, { recursive: true });
    const MEAS_NAME = 'audit-measurements.json';
    const FACTS_NAME = 'audit-facts.jsonl';
    const fv = function (name) {
        const f = ev.facetRowsFacts.find(function (x) { return x.subject_ref === name; });
        return f ? JSON.parse(f.value_json).row_count : 0;
    };
    const facetRowsCount = {};
    for (const f of ev.facetRowsFacts) {
        const v = JSON.parse(f.value_json);
        facetRowsCount[v.analysis] = v.row_count;
    }
    const measurements = {
        repo: NAME, root: repoRoot, observed_at: HEAD_AT, head_sha: probes.headSha, tree_sha: probes.treeSha, commit_count: probes.commitCount,
        adr_count: col.adrDocs.length, adr_date_resolvable: ev.dateFacts.length, adr_leg_distribution: ev.legDist,
        lag_judgeable_n: ev.lagFacts.length, lag_min_n_threshold: MACRO_C_LAG_MIN_N,
        codelore: { pinned: col.codeloreResolution ? col.codeloreResolution.pinned : false, version: col.codeloreResolution ? col.codeloreResolution.version : null, facet_rows: ev.facetRowsFacts.length, facet_rows_expected: CODELORE_BATCH1_FACETS.length, facet_errors: ev.facetErrFacts.map(function (f) { return f.subject_ref + ':' + f.metric; }), per_facet_rows: facetRowsCount },
        llm_gate: col.llmGate, llm_gated_count: ev.llmGatedCount, llm_narrative_count: ev.llmNarrativeCount,
        supersede_chain: col.chain,
        fact_count: col.realFacts.length, dedup_dropped: col.dedupDropped,
        pipeline: { source: '.scratch/architecture-recovery/reports/38-macro-c-preview.mjs 移植（#84/D-204②）', recalibration: '85-check 差分对账（anysearch-cli 原语料；编排层独立重算）', fact_emission: 'file-card 同位（fact-write.ts 共享核）' },
        intake: { kind: intake.kind, url: intake.url, cloned: intake.cloned, cache_hit: intake.cache_hit, refreshed: intake.refreshed, snapshot_fetched_at: intake.snapshot_fetched_at, full_depth_verified: intake.full_depth_verified },
        intake_quarantine: { wired_fields: ['committer_date', 'head_date'], field_stats: probes.fieldStats, excluded_commits: excludedCommits, threshold_ratio: QUARANTINE_FIELD_RATIO_RED, strict_mode: opts.strictQuarantine === true, dialect_absorbed_total: probes.dialectAbsorptions.length },
        collection_environment: { git_version: probeGitVersion() }
    };
    if (outDir) {
        writeFileSync(join(outDir, MEAS_NAME), JSON.stringify(measurements, null, 2) + NL, 'utf8');
    }
    // ---------- §5 证据＋结论→引文锚（多 token 全命中；源=运行目录工件相对名） ----------
    const R = NAME.toUpperCase().split('-').join('').split('/').join('');
    const RUN_CMD = 'macro-audit audit ' + opts.input + ' --scale Macro-C' + (opts.outDir ? ' --out ' + opts.outDir : '');
    const evidence = [];
    function addEvidence(id, source, tokens, claim, base) {
        const ex = pickExcerpt(source, tokens, base);
        evidence.push({ evidence_id: id, source: source, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: HEAD_AT, reproduce_cmd: RUN_CMD, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
    }
    addEvidence('EV-MC-' + R + '-01', MEAS_NAME, ['"fact_count"'], '本次实测：' + NAME + ' Macro-C 采集事实数（dedup 后）', outDir);
    addEvidence('EV-MC-' + R + '-02', MEAS_NAME, ['"supersede_chain"'], '本次实测：supersede 引用网 ' + chain.edge_count + ' 边（断链 ' + chain.unresolved_refs.length + '／缺回链 ' + chain.missing_backrefs.length + '）', outDir);
    addEvidence('EV-MC-' + R + '-03', MEAS_NAME, ['"lag_judgeable_n"'], '本次实测：ADR 决策日 vs 首提交 lag 可判定数（门槛 ' + MACRO_C_LAG_MIN_N + '）', outDir);
    addEvidence('EV-MC-' + R + '-04', MEAS_NAME, ['"facet_rows"'], '本次实测：CodeLore 契约面 ' + ev.facetRowsFacts.length + '/' + CODELORE_BATCH1_FACETS.length + ' facet_rows（error=' + ev.facetErrFacts.length + '）', outDir);
    addEvidence('EV-MC-' + R + '-05', MEAS_NAME, ['"configured"'], '本次实测：LLM env 门控=' + (col.llmGate.configured ? 'open' : 'closed（llm_gated 降级披露，不伪造不真调）'), outDir);
    addEvidence('EV-MC-' + R + '-06', MEAS_NAME, ['"snapshot_fetched_at"'], '快照时点披露：intake snapshot_fetched_at=' + String(intake.snapshot_fetched_at) + '（cache_hit=' + intake.cache_hit + ' refreshed=' + intake.refreshed + '）', outDir);
    if (col.adrDocs.length > 0) {
        addEvidence('EV-MC-' + R + '-07', col.adrDocs[0].path, null, NAME + ' ADR 语料锚：' + col.adrDocs[0].path + ' 实物存在（语料 ' + col.adrDocs.length + ' 份）', repoRoot);
    }
    const claims = [
        { claim_id: 'CL-MC-' + R + '-01', evidence_id: 'EV-MC-' + R + '-01', required_tokens: ['fact_count'] },
        { claim_id: 'CL-MC-' + R + '-02', evidence_id: 'EV-MC-' + R + '-02', required_tokens: ['supersede_chain'] },
        { claim_id: 'CL-MC-' + R + '-03', evidence_id: 'EV-MC-' + R + '-03', required_tokens: ['lag_judgeable_n'] },
        { claim_id: 'CL-MC-' + R + '-04', evidence_id: 'EV-MC-' + R + '-04', required_tokens: ['facet_rows'] },
        { claim_id: 'CL-MC-' + R + '-05', evidence_id: 'EV-MC-' + R + '-05', required_tokens: ['configured'] },
        { claim_id: 'CL-MC-' + R + '-06', evidence_id: 'EV-MC-' + R + '-06', required_tokens: ['snapshot_fetched_at'] }
    ];
    // ---------- §6 裁决条目（38 §8 六判据——阈值已在本模块常量段跑前写死） ----------
    const facetFactIds = ev.facetRowsFacts.slice(0, 3).map(function (f) { return f.fact_id; });
    const lagFactIds = ev.lagFacts.slice(0, 5).map(function (f) { return f.fact_id; });
    const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, decided_at: HEAD_AT, audit_ref: 'engine/src/audit/macro-c.ts' };
    const adjudicationEntries = [
        { criterion_id: 'PC-MC-1', band: ev.pcMc1 ? 'supported' : 'insufficient', basis_refs: ['管线活性正对照'], anchored_fact_ids: (col.codeloreFacts.length > 0 ? [col.codeloreFacts[0].fact_id] : []).concat(facetFactIds), anchored_evidence_ids: ['EV-MC-' + R + '-04'], decided_at: HEAD_AT, rationale: ev.pcMc1 ? 'codelore pin＋' + ev.facetRowsFacts.length + '/' + CODELORE_BATCH1_FACETS.length + ' facet_rows＋ADR 语料 ' + col.adrDocs.length + ' 份解析' : '管线活性未中（pin/facet/语料缺）——管线故障 P0' },
        { criterion_id: 'PC-MC-2', band: ev.pcMc2 ? 'supported' : 'insufficient', basis_refs: ['管线活性正对照'], anchored_fact_ids: lagFactIds.slice(0, 1), anchored_evidence_ids: ['EV-MC-' + R + '-03'], decided_at: HEAD_AT, rationale: ev.pcMc2 ? 'gitlog 族产出 ADR 首提交/lag 事实（first_commit ≥ ' + (col.adrDocs.length - 2) + '）' : 'gitlog 族未产出足量首提交事实' },
        { criterion_id: 'TC-MC-1', band: ev.tcMc1 ? 'supported' : 'insufficient', basis_refs: ['演化链完整性'], anchored_fact_ids: [col.chainFact.fact_id], anchored_evidence_ids: ['EV-MC-' + R + '-02'], decided_at: HEAD_AT, rationale: 'supersede 引用网 ' + chain.edge_count + ' 边：断链 ' + chain.unresolved_refs.length + ' / 缺回链 ' + chain.missing_backrefs.length + '（判据=38 §8 常量段，重校准背书 85-check）' },
        { criterion_id: 'TC-MC-2', band: ev.tcMc2 ? 'supported' : 'insufficient', basis_refs: ['时间维信号可判定性'], anchored_fact_ids: lagFactIds, anchored_evidence_ids: ['EV-MC-' + R + '-03'], decided_at: HEAD_AT, rationale: 'ADR 决策日 vs 首提交 lag 可判定数 ' + ev.lagFacts.length + ' / 门槛 ' + MACRO_C_LAG_MIN_N + '（v2 回退链日期解析 ' + ev.dateFacts.length + '/' + col.adrDocs.length + '）' },
        { criterion_id: 'TC-MC-3', band: ev.tcMc3 ? 'supported' : 'insufficient', basis_refs: ['S4 假设失效检测深检'], anchored_fact_ids: col.llmFacts.filter(function (f) { return f.metric === 'codelore.llm_gate'; }).map(function (f) { return f.fact_id; }), anchored_evidence_ids: ['EV-MC-' + R + '-05'], decided_at: HEAD_AT, rationale: ev.tcMc3 ? 'LLM 面已配置且产出叙事' : 'S4 假设失效检测面 llm_gated（CODELORE_LLM_* env 门控关）→ 深检维度 ' + UNVERIFIED_MARK + ' 降级，不伪造不真调' },
        { criterion_id: 'NC-MC-1', band: ev.ncMc1 ? 'supported' : 'insufficient', basis_refs: ['负对照特异性'], anchored_fact_ids: [], anchored_evidence_ids: ['EV-MC-' + R + '-04'], decided_at: HEAD_AT, rationale: ev.ncMc1 ? '负对照选材 ' + NAME + '/' + String(ev.nc1Path) + ' 五件套 0 命中（特异性成立）' : '负对照命中或选材缺席 → 转复核路径' }
    ];
    const overallBand = deriveOverallBand(adjudicationEntries);
    // ---------- §7 四象限（38 §9 形态：strategy 原生 S2/S4；structure/behavior 衍生观测；supply_chain 数据未接 D-034③） ----------
    const quadrantSliceKeys = CODELORE_S3_FACETS;
    const quadrants = [
        { quadrant: 'strategy', applicability: 'native', verdict: overallBand, score: null, confidence: 0.55, dimensions: ['S2', 'S4'], slice_fields: { adr_count: col.adrDocs.length, supersede_edges: chain.edge_count, supersede_unresolved: chain.unresolved_refs.length, supersede_missing_backrefs: chain.missing_backrefs.length, lag_judgeable_n: ev.lagFacts.length, adr_date_resolvable: ev.dateFacts.length, llm_gate: col.llmGate.configured ? 'open' : 'closed' }, verdict_gate: { protocol_version: GATE.protocol_version, decision: overallBand, evidence_flag: false, decided_at: HEAD_AT, override_reason: 'S4 深检面 llm_gated——深检维度证据门槛未达，preview 诚实部分裁定', audit_ref: GATE.audit_ref }, conflict_markers: ['single-repo-calibration'] },
        { quadrant: 'structure', applicability: 'derived', verdict: 'insufficient', score: null, confidence: 0.3, dimensions: ['S3'], slice_fields: (function () { const sf = {}; for (const k of quadrantSliceKeys) {
                sf[k] = fv(k);
            } return sf; })(), verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_AT, override_reason: '衍生观测不裁决——无预声明阈值基线（preview 深度，观测值如实落 slice_fields）', audit_ref: GATE.audit_ref }, conflict_markers: ['preview-derived-observation-only'] },
        { quadrant: 'behavior', applicability: 'derived', verdict: 'insufficient', score: null, confidence: 0.3, dimensions: ['S5'], slice_fields: { revisions_rows: fv('revisions'), abs_churn_rows: fv('abs-churn'), entity_churn_rows: fv('entity-churn'), hotspot_velocity_rows: fv('hotspot-velocity'), code_age_rows: fv('code-age'), lead_time_rows: fv('lead-time'), release_cadence_rows: fv('release-cadence'), ownership_rows: fv('ownership'), bus_factor_rows: fv('bus-factor') }, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_AT, override_reason: '衍生观测不裁决——同上', audit_ref: GATE.audit_ref }, conflict_markers: ['preview-derived-observation-only'] },
        { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_AT, override_reason: '⚠ 数据未接——Scorecard/repomix 按层需求队列接入不插队（D-034③）', audit_ref: GATE.audit_ref }, conflict_markers: ['data-not-connected'] }
    ];
    const recommendations = [
        { rec_id: 'R-MC-1', priority: 'P1', action: '配置 CODELORE_LLM_PROVIDER/MODEL（或 ANTHROPIC_API_KEY）激活 S4 假设失效检测面，复跑本 audit', rationale: 'TC-MC-3 因 env 门控关判 insufficient——S4 演化方向深检是当前唯一未验证维度', expected_impact: 'TC-MC-3 由 insufficient 转可判定，overall 具升级通道', effort: 'S', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-MC-' + R + '-05'], degraded_note: null },
        { rec_id: 'R-MC-2', priority: 'P1', action: '引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-C（泛化闸前置）', rationale: '单仓校准属 dogfooding——generative not evaluative（D-033）；泛化证据是 GA 前置', expected_impact: '披露块结构性限制项①获得实证闭环', effort: 'M', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-MC-' + R + '-02'], degraded_note: null },
        { rec_id: 'R-MC-3', priority: 'P3', action: '供应链象限维持「⚠ 数据未接」，Scorecard 探针按层需求队列接入不插队', rationale: 'D-034③ 降级披露制已立法；解排触发器=registry supply-chain-closure-trigger（D-206）', expected_impact: 'preview 诚实形态保持', effort: 'S', verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-MC-' + R + '-02'], degraded_note: null }
    ];
    const HEADLINE = NAME + ' Macro-C audit（capability 2 of 5 · preview）：全链实跑——codelore ' + ev.facetRowsFacts.length + '/' + CODELORE_BATCH1_FACETS.length + ' 面 + ADR ' + col.adrDocs.length + ' 份（日期解析 ' + ev.dateFacts.length + '）+ supersede 引用网 ' + chain.edge_count + ' 边（断链 ' + chain.unresolved_refs.length + '／缺回链 ' + chain.missing_backrefs.length + '）+ lag 可判定 ' + ev.lagFacts.length + '；S4 深检面 ' + (col.llmGate.configured ? 'open' : 'llm_gated') + ' → 综合裁定 ' + overallBand + '（' + (ev.facetErrFacts.length === 0 ? 'preview 诚实部分裁定，非管线失败' : '面级错误如实落数') + '）。';
    const disclosure = {
        capability_label: MACRO_C_CAPABILITY_LABEL,
        calibration_scope: NAME + ' Macro-C audit（演化考古一等命令面；管线校准=anysearch-cli 原语料重校准差分对账——85-check 背书）',
        structural_limitations: [
            '单仓校准（本 run 对象=' + NAME + '）：不构成泛化证据——dogfooding = generative not evaluative（D-033），GA 前置须 ≥1 非自有公开仓',
            'LLM 叙事面 env 门控' + (col.llmGate.configured ? '开' : '关：S4 假设失效检测深检维度降级 ⚠ unverified（llm_gated 明示，不伪造不真调）'),
            '供应链象限 ⚠ 数据未接：Scorecard/repomix 未接不插队（D-034③）',
            'structure/behavior 象限为衍生观测（无预声明阈值基线）——观测值如实落 slice_fields 不裁决（语义域标签：structure/shape 测量层 vs S3/budget-attribution 归因层，D-205）'
        ],
        not_in_preview: ['Micro-A', 'Macro-A'] // Micro-B file-card 进 preview（#80 步③）；Micro-A=calibrated demo 非 preview（D-204③）；Macro-C 本面产线化入 preview（#84/D-204②）
    };
    const quarantinedRows = probes.fieldEvents.filter(function (e) { return e.disposition === 'quarantined'; });
    const intakeHealth = {
        fields: probes.fieldStats.map(function (s) { return { field_name: s.field_name, total: s.total, clean: s.clean, normalized: s.normalized, quarantined: s.quarantined }; }),
        affected_commits: new Set(quarantinedRows.map(function (e) { return e.commit_sha; })).size,
        excluded_commits: excludedCommits,
        quarantined_rows: quarantinedRows.map(function (e) { return { commit_sha: e.commit_sha, field_name: e.field_name, reason_code: e.reason_code, raw_echo: e.raw }; }),
        threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
        escalation: 'none',
        recorded_at: probes.headDate
    };
    const reportInput = {
        report_id: MACRO_C_REPORT_ID_PREFIX + R + '-MACRO-C',
        stability: 'preview',
        capabilities: ['macro-c'],
        scale: 'Macro-C',
        subject_ref: NAME + '@' + probes.headSha.slice(0, 12),
        generated_at: HEAD_AT,
        trace_id: ctx.traceId,
        baggage_id: ctx.traceId,
        headline: HEADLINE,
        confidence: 0.55,
        stale: { marker: 'fresh', sla_seconds: 86400, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: '1' },
        fact_ids: col.realFacts.map(function (f) { return f.fact_id; }),
        top_findings: ['EV-MC-' + R + '-02', 'EV-MC-' + R + '-04', 'EV-MC-' + R + '-05'],
        evidence: evidence,
        claims: claims,
        quadrants: quadrants,
        recommendations: recommendations,
        adjudication_entries: adjudicationEntries,
        decided_at: HEAD_AT,
        commit_anchor: probes.headSha,
        tree_anchor: probes.treeSha,
        gate_ref: { prereg_commit: '38-script-const', criteria_path: 'reports/38-macro-c-preview.mjs §8', basis_path: '.scratch/macro-audit/decision-ledger.md D-034', criterion_ids: ['PC-MC-1', 'PC-MC-2', 'TC-MC-1', 'TC-MC-2', 'TC-MC-3', 'NC-MC-1'] },
        degraded: false,
        degraded_reason: null,
        preview_disclosure: disclosure,
        intake_health: intakeHealth,
        human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
    };
    // ---------- §8 事实库写入（file-card 同位发射——fact-write.ts 共享核，D-115①/D-116① 全量适用） ----------
    const dbPath = join(outDir, 'facts.duckdb');
    if (existsSync(dbPath)) {
        unlinkSync(dbPath);
    }
    if (existsSync(dbPath + '.wal')) {
        unlinkSync(dbPath + '.wal');
    }
    const writer = await openWriter(dbPath);
    const writeResult = await writeRunFactsAndEvents(writer, {
        ctx: { repoRef: ctx.repoRef, traceId: ctx.traceId },
        commits: probes.commits,
        commitCount: probes.commitCount,
        fieldEvents: probes.fieldEvents,
        fieldStats: probes.fieldStats,
        facts: col.realFacts,
        headDate: probes.headDate,
        anchorQuarantined: anchorQuarantined,
        collector: 'macro-audit audit(macro-c)',
        crashSource: 'macro-c.ts'
    });
    const dbCounts = await queryQuarantineCounts(writer, ctx.traceId);
    const identityIssues = intakeIdentityIssues(probes.fieldStats, dbCounts);
    await writer.run('FORCE CHECKPOINT');
    closeDuckdb(writer);
    if (identityIssues.length > 0) {
        throw protocolCrashError('INTAKE-IDENTITY-MISMATCH', '恒等式断言失败：' + JSON.stringify(identityIssues), { crash_location: 'macro-c.ts:intake-identity', run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId, commit_sha: null, head_date: probes.headDate, collector: 'macro-audit audit(macro-c)' }, counts: countsFromStats(probes.fieldStats, probes.commitCount, writeResult.factsWritten, writeResult.eventsWritten) });
    }
    // ---------- §9 报告双件＋回执 ----------
    const report = buildReport(reportInput);
    const reportMd = renderMarkdown(report) + NL;
    const sidecarJson = renderSidecar(report) + NL;
    let artifacts = null;
    writeFileSync(join(outDir, 'report.md'), reportMd, 'utf8');
    writeFileSync(join(outDir, 'report.json'), sidecarJson, 'utf8');
    writeFileSync(join(outDir, FACTS_NAME), anchorQuarantined ? '' : col.realFacts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL, 'utf8');
    artifacts = persistOut ? { report_md: join(outDir, 'report.md'), report_json: join(outDir, 'report.json'), facts_jsonl: join(outDir, FACTS_NAME), measurements: join(outDir, MEAS_NAME), duckdb: dbPath } : null;
    const resultOutDir = persistOut ? outDir : null;
    if (!persistOut) {
        rmSync(outDir, { recursive: true, force: true });
    }
    return {
        report_id: report.report_id,
        receipt_id: report.receipt.receipt_id,
        scale: report.scale,
        stability: report.stability,
        capabilities: report.capabilities,
        overall_verdict: report.overall_verdict,
        verdict: report.verdict,
        intake_quarantine: { quarantined: intakeHealth.fields.reduce(function (s, f) { return s + f.quarantined; }, 0), normalized: intakeHealth.fields.reduce(function (s, f) { return s + f.normalized; }, 0), affected_commits: intakeHealth.affected_commits, escalation: intakeHealth.escalation, facts_persisted: !anchorQuarantined },
        degraded_mode: report.degraded_mode,
        head_sha: probes.headSha,
        tree_sha: probes.treeSha,
        commit_count: probes.commitCount,
        adr_count: col.adrDocs.length,
        fact_count: col.realFacts.length,
        repo_name: NAME,
        resolved_root: repoRoot,
        intake_kind: intake.kind,
        snapshot_fetched_at: intake.snapshot_fetched_at,
        cache_hit: intake.cache_hit,
        refreshed: intake.refreshed,
        codelore: { resolved: col.codeloreResolution !== null, pinned: col.codeloreResolution ? col.codeloreResolution.pinned : false, version: col.codeloreResolution ? col.codeloreResolution.version : null },
        out_dir: resultOutDir,
        artifacts: artifacts,
        report_markdown: reportMd,
        sidecar_json: sidecarJson,
        measurements: measurements
    };
}
