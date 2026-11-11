// ---------- 上游适配器：CodeLore（双轨接入那条主路 / D-020） ----------
// 上游工具走单独的适配器通道，它吐出来的原始东西不许出这一层
// 协议传染性强的上游工具不许打进项目代码里，直接在系统环境里找可执行文件，这就是那道防线
// 这条隔离线怎么划：本文件只做「跑个进程 + 把原始输出解成结构」——退出码、字节解析、版本钉死校验都在这儿办；
// 判定的事（判据、阈值、裁决）不许进这层；上游原始输出也不许出去（统一整成规范的事实结构再往外递）。
// 运行的时候怎么找它＝按二进制找（binary discovery）：在 PATH 里翻 codelore 这个命令，再用 --version 核对钉住的版本。
import { spawnSync } from 'node:child_process';
import { makeFact } from '../collect/collectors.js';
import { lstatSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { normalizeSubjectPath, detectCaseOnlyConflicts } from '../fact/subject.js';
export const CODELORE_ADAPTER_ID = 'codelore-adapter@v1';
export const CODELORE_FAMILY = 'upstream-codelore';
export const CODELORE_PINNED_VERSION = '0.28.0';
export const CODELORE_DESCRIPTOR = {
    id: CODELORE_ADAPTER_ID,
    family: CODELORE_FAMILY,
    dimension: null, // 这条故意留白（适配层不许塞业务判定）——维度怎么映射看 docs/upstream-dimension-map.md（D-078）
    quadrant: 'strategic'
};
export function resolveCodelore(binary) {
    const bin = binary || 'codelore';
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (r.error || r.status !== 0) {
        return { strategy: 'binary-discovery', binary: bin, version: null, pinned: false, error: String(r.error || ('exit ' + r.status)) };
    }
    const m = (r.stdout || '').match(/codelore\s+(\d+\.\d+\.\d+)/i);
    const version = m ? m[1] : null;
    return { strategy: 'binary-discovery', binary: bin, version: version, pinned: version === CODELORE_PINNED_VERSION, error: version ? null : 'version-parse-failed' };
}
function pushResolutionFact(out, ctx, res) {
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'codelore', 'codelore', 'upstream.resolution', {
        strategy: res.strategy,
        binary: res.binary,
        version: res.version,
        pinned_version: CODELORE_PINNED_VERSION,
        pinned: res.pinned,
        error: res.error
    }));
}
// 单文件档的 ctx 只从这一处出（r31 审计返修定的：原来四处各写一遍字面量，现在收到一处）——粒度按 subject 算，不按 run（D-124）；
// 跳过和冲突这些说明事实统一用 scale=Micro-B，ctx 字段怎么映射只在这儿定义，免得走样。
function microBCtx(ctx) {
    return { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt };
}
// `codelore explain <file>` 结果固定，就是 INI 那种 [section] 加 key = value 的行。
export function parseExplainDossier(text) {
    const sections = {};
    let cur = null;
    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!line)
            continue;
        const sec = line.match(/^\[(.+)\]$/);
        if (sec) {
            cur = sec[1];
            if (cur === '__proto__' || cur === 'constructor' || cur === 'prototype') {
                cur = null;
                continue;
            }
            if (!Object.prototype.hasOwnProperty.call(sections, cur)) {
                sections[cur] = {};
            }
            continue;
        }
        const kv = line.match(/^([A-Za-z0-9_][A-Za-z0-9_.]*)\s*=\s*(.*)$/);
        if (kv && cur) {
            const k = kv[1];
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
                continue;
            }
            sections[cur][k] = kv[2].trim();
        }
    }
    return { sections };
}
export function parseSummaryJson(text) {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) {
        throw new Error('summary output is not an array');
    }
    for (const m of arr) {
        if (typeof m.metric !== 'string' || typeof m.value !== 'number') {
            throw new Error('summary row shape drift: expected {metric:string,value:number}');
        }
    }
    return arr;
}
function runText(binary, args, cwd) {
    const r = spawnSync(binary, args, { cwd: cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { ok: !r.error && r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}
export function collectCodeloreFacts(input, ctx) {
    const out = [];
    const bin = input.binary || 'codelore';
    const res = resolveCodelore(bin);
    pushResolutionFact(out, ctx, res);
    if (res.error || !res.pinned) {
        return out;
    }
    const sum = runText(bin, ['analyze', '--analysis', 'summary', '--format', 'json', '--repo', input.repoRoot], input.repoRoot);
    if (sum.ok) {
        for (const m of parseSummaryJson(sum.stdout)) {
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary --format json', 'codelore.summary_metric', {
                metric: m.metric,
                value: m.value
            }));
        }
    }
    else {
        out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary', 'codelore.summary_error', {
            status: sum.status,
            stderr_tail: sum.stderr.slice(-400)
        }));
    }
    for (const p of input.explainPaths) {
        const pn = normalizeSubjectPath(p); // 路径统一在这儿归整：单文件事实统一转成规范路径（D-125①）
        if (!pn.ok) {
            out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, 'explain', 'codelore explain', 'codelore.file_subject_skip', { analysis: 'explain', group: null, raw_path: p, reason: pn.reason }));
            continue;
        }
        const ex = runText(bin, ['explain', p, '--repo', input.repoRoot], input.repoRoot);
        if (!ex.ok) {
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, pn.subject, 'codelore explain', 'codelore.explain_error', {
                status: ex.status,
                stderr_tail: ex.stderr.slice(-400)
            }));
            continue;
        }
        const d = parseExplainDossier(ex.stdout);
        out.push(makeFact(ctx, CODELORE_DESCRIPTOR, pn.subject, 'codelore explain ' + p, 'codelore.file_dossier', {
            path: pn.subject,
            sections: Object.keys(d.sections),
            dossier: d.sections
        }));
    }
    return out;
}
// code-age 把参考时间钉死（--age-time-now），重放才能得出同一个结果；messages 的检索式也钉死（契约就是这一整套命令行参数）。
export const CODELORE_BATCH1_FACETS = [
    { analysis: 'revisions', group: 'evolution', extraArgs: [] },
    { analysis: 'abs-churn', group: 'evolution', extraArgs: [] },
    { analysis: 'entity-churn', group: 'evolution', extraArgs: [] },
    { analysis: 'author-churn', group: 'evolution', extraArgs: [] },
    { analysis: 'hotspot-velocity', group: 'evolution', extraArgs: [] },
    { analysis: 'code-age', group: 'evolution', extraArgs: ['--age-time-now', '2026-09-15'] },
    { analysis: 'stale-code', group: 'evolution', extraArgs: [] },
    { analysis: 'architecture-trend', group: 'evolution', extraArgs: [] },
    { analysis: 'health-trend', group: 'evolution', extraArgs: [] },
    { analysis: 'lead-time', group: 'evolution', extraArgs: [] },
    { analysis: 'release-cadence', group: 'evolution', extraArgs: [] },
    { analysis: 'messages', group: 'evolution', extraArgs: ['-e', '(?i)(fix|feat|docs)'] },
    { analysis: 'god-classes', group: 's3', extraArgs: [] },
    { analysis: 'architecture-metrics', group: 's3', extraArgs: [] },
    { analysis: 'dependency-cycles', group: 's3', extraArgs: [] },
    { analysis: 'modularity-violations', group: 's3', extraArgs: [] },
    { analysis: 'instability', group: 's3', extraArgs: [] },
    { analysis: 'architecture-roles', group: 's3', extraArgs: [] },
    { analysis: 'ownership', group: 's5', extraArgs: [] },
    { analysis: 'entity-ownership', group: 's5', extraArgs: [] },
    { analysis: 'bus-factor', group: 's5', extraArgs: [] },
    { analysis: 'main-dev', group: 's5', extraArgs: [] },
    { analysis: 'main-dev-by-revs', group: 's5', extraArgs: [] },
    { analysis: 'main-dev-by-deletions', group: 's5', extraArgs: [] },
    { analysis: 'knowledge-islands', group: 's5', extraArgs: [] },
    { analysis: 'communication', group: 's5', extraArgs: [] },
    { analysis: 'coordination-needs', group: 's5', extraArgs: [] },
    { analysis: 'team-composition', group: 's5', extraArgs: [] },
    { analysis: 'marginal-owner-risk', group: 's5', extraArgs: [] },
    { analysis: 'pair-programming', group: 's5', extraArgs: [] }
];
// ---------- 行为分析（#51 / A-058 / D-054）：单仓四象限档里行为面的那一块 ----------
// churn/hotspot/change-coupling 三族最小的那套行为数据（2026-09-16 真跑 codelore analyze 确认过的结构，
// 存在 reports/51-behavior-schema.json）：
//   hotspots          → {path, revisions, cognitive, cognitive_health, hotspot_score, mi, mi_rank, ai_pct, hotspot_score_anchored}
//   coupling          → {entity_a, entity_b, shared, revs_a, revs_b, average_revs, degree, fisher_p}
//   function-hotspots → {path, function(name@lines), revs, cognitive, cognitive_health, function_hotspot_score}
// 暂时不做的：function-coupling 得带 --target <path>（要一个文件一个文件跑，不是扫全仓那种玩法）——记成暂缓项；
// 另外 clone-coupling/sarif 那种形态、effort-exposure/delivery-* 那一串，都归到后头的活（在 registry 的 codelore-deferred-faces 里挂着）。
// 象限怎么归（D-054③）：fact.quadrant 写的是采集器声明的那个面（strategic/codelore 这一系列），
// 报告里归到哪个象限，是具体用的时候才定的——单仓四象限档的行为面条目拿这组事实时才归位，已经记下的事实一个字不改。
export const CODELORE_BEHAVIOR_FACETS = [
    { analysis: 'hotspots', group: 'behavior', extraArgs: [] },
    { analysis: 'coupling', group: 'behavior', extraArgs: [] },
    { analysis: 'function-hotspots', group: 'behavior', extraArgs: [] }
];
// 跑的时候和记证据的时候用同一个参数构造函数，省得两边参数对不上。
export function codeloreAnalysisArgs(spec, repoRoot) {
    return ['analyze', '--analysis', spec.analysis, '--format', 'json', '--repo', repoRoot].concat(spec.extraArgs);
}
export function runCodeloreAnalysis(binary, spec, repoRoot) {
    const r = runText(binary, codeloreAnalysisArgs(spec, repoRoot), repoRoot);
    return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}
// analyze --format json 出来的就是一行一个对象；格式要是走样了（不是数组、或者不是对象行）当场报错，别把问题压下去。
export function parseJsonRows(text) {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) {
        throw new Error('analysis output is not an array');
    }
    for (const row of arr) {
        if (row === null || typeof row !== 'object' || Array.isArray(row)) {
            throw new Error('analysis row shape drift: expected plain object row');
        }
    }
    return arr;
}
export function facetColumns(rows) {
    return rows.length > 0 ? Object.keys(rows[0]) : [];
}
// 一项项采：一个分析项出一条 codelore.facet_rows 事实（带着字段列表、行数和原始结构化数据）；
// 跑挂的项降成 codelore.facet_error 或 codelore.facet_parse_error，别的项照采，不跟着停。
export function collectCodeloreFacets(input, ctx) {
    const out = [];
    const bin = input.binary || 'codelore';
    const resolve = input.resolver || resolveCodelore;
    const runner = input.runner || runCodeloreAnalysis;
    const res = resolve(bin);
    pushResolutionFact(out, ctx, res);
    if (res.error || !res.pinned) {
        return out;
    }
    const facets = input.facets || CODELORE_BATCH1_FACETS;
    const emittedSubjects = [];
    for (const spec of facets) {
        const evidence = 'codelore ' + codeloreAnalysisArgs(spec, input.repoRoot).join(' ');
        const run = runner(bin, spec, input.repoRoot);
        if (!run.ok) {
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_error', {
                analysis: spec.analysis,
                group: spec.group,
                status: run.status,
                stderr_tail: run.stderrTail
            }));
            continue;
        }
        let rows;
        try {
            rows = parseJsonRows(run.stdout);
        }
        catch (e) {
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_parse_error', {
                analysis: spec.analysis,
                group: spec.group,
                message: String(e.message)
            }));
            continue;
        }
        // facet_rows 那堆汇总留着当原始证据（D-124②）：只往后加，标上 role=raw_evidence，
        // 不掺进单文件卡的主要查询，只拿来重建、争议仲裁和各个分析项的历史比对。
        const emitStat = emitPerFileFacts(rows, spec, evidence, microBCtx(ctx), input.repoRoot, input.subjectProbe || defaultSubjectPathProbe, out);
        emittedSubjects.push.apply(emittedSubjects, emitStat.subjects);
        out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_rows', {
            analysis: spec.analysis,
            group: spec.group,
            format: 'json',
            extra_args: spec.extraArgs,
            role: 'raw_evidence',
            per_file_emitted: emitStat.emitted,
            columns: facetColumns(rows),
            row_count: rows.length,
            rows: rows
        }));
    }
    // 只查大小写撞车，撞了就告警（D-125① 不许把大小写并成一条——换个操作系统就乱）：
    // 同一趟里出来的规范路径转小写分组，一组里冒出好几个不同写法，那就是真不同的文件，明着发一条告警事实，不合并。
    const conflicts = detectCaseOnlyConflicts(emittedSubjects);
    if (conflicts.pairs.length > 0) {
        out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, 'codelore', 'subject-normalizer', 'codelore.subject_case_conflict', {
            pairs: conflicts.pairs,
            host_platform: process.platform,
            note: '仅大小写不同的冲突：真实不同的文件保留原样字面不进行合并（参考 CVE-2021-21300 先例）；在大小写不敏感的文件系统上检出有互相覆盖风险，在此记录告警供外部了解'
        }));
    }
    return out;
}
export function defaultSubjectPathProbe(repoRoot, relPath) {
    const abs = join(repoRoot, relPath);
    try {
        const st = lstatSync(abs);
        if (st.isSymbolicLink()) {
            let real;
            try {
                real = realpathSync(abs);
            }
            catch {
                return { kind: 'other' };
            }
            const rel = relative(repoRoot, real).split(String.fromCharCode(92)).join('/');
            if (rel.indexOf('..') === 0 || rel.length === 0 || /^[A-Za-z]:/.test(rel)) {
                return { kind: 'other' };
            }
            if (!lstatSync(real).isFile()) {
                return { kind: 'other' };
            }
            return { kind: 'symlink', resolved: rel };
        }
        if (st.isFile()) {
            return { kind: 'file' };
        }
        return { kind: 'other' };
    }
    catch {
        return { kind: 'missing' }; // 工作区没有就是历史上的路径（git 记录合法，照常输出，D-125①）
    }
}
const FILE_SUBJECT_KEYS = ['path', 'entity'];
function resolveRowSubject(repoRoot, rawPath, probe) {
    const n = normalizeSubjectPath(rawPath);
    if (!n.ok) {
        return { subject: null, via: null, reason: n.reason };
    }
    const pr = probe(repoRoot, n.subject);
    if (pr.kind === 'file' || pr.kind === 'missing') {
        return { subject: n.subject, via: null, reason: null };
    }
    if (pr.kind === 'symlink' && pr.resolved) {
        const rn = normalizeSubjectPath(pr.resolved);
        if (rn.ok) {
            return { subject: rn.subject, via: 'symlink', reason: null };
        }
        return { subject: null, via: null, reason: 'symlink-resolved-' + String(rn.reason) };
    }
    return { subject: null, via: null, reason: pr.kind === 'symlink' ? 'symlink-unresolved' : 'non-regular-path' };
}
function pushFileSubjectSkip(out, ctx, spec, evidence, rawPath, reason) {
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.file_subject_skip', {
        analysis: spec.analysis,
        group: spec.group,
        raw_path: rawPath,
        reason: reason
    }));
}
// 一行条事实：subject_ref 是规范路径，value_json 是单文件那个分析项的数据。
// 返回已经输出的规范路径清单（大小写撞车要查它），外加一共输出了多少条。
export function emitPerFileFacts(rows, spec, evidence, ctx, repoRoot, probe, out) {
    const seen = new Set();
    const subjects = [];
    let emitted = 0;
    const pushRow = function (subject, via, row, peer) {
        const value = { analysis: spec.analysis, group: spec.group, role: 'first_class', row: row };
        if (peer !== null) {
            value.entity = subject;
            value.peer = peer;
        }
        else {
            value.path = subject;
        }
        if (via !== null) {
            value.via = via;
        }
        const f = makeFact(ctx, CODELORE_DESCRIPTOR, subject, evidence, 'codelore.file_facet_row', value);
        if (seen.has(f.fact_id)) {
            return;
        }
        seen.add(f.fact_id);
        out.push(f);
        subjects.push(subject);
        emitted += 1;
    };
    for (const row of rows) {
        const ea = row['entity_a'], eb = row['entity_b'];
        if (typeof ea === 'string' && typeof eb === 'string' && ea.length > 0 && eb.length > 0) {
            const ra = resolveRowSubject(repoRoot, ea, probe);
            const rb = resolveRowSubject(repoRoot, eb, probe);
            if (ra.subject === null) {
                pushFileSubjectSkip(out, ctx, spec, evidence, ea, ra.reason);
                continue;
            }
            if (rb.subject === null) {
                pushFileSubjectSkip(out, ctx, spec, evidence, eb, rb.reason);
                continue;
            }
            pushRow(ra.subject, ra.via, row, rb.subject);
            pushRow(rb.subject, rb.via, row, ra.subject);
            continue;
        }
        let sv = null;
        for (const k of FILE_SUBJECT_KEYS) {
            const v = row[k];
            if (typeof v === 'string' && v.length > 0) {
                sv = v;
                break;
            }
        }
        if (sv === null) {
            continue;
        }
        const r = resolveRowSubject(repoRoot, sv, probe);
        if (r.subject === null) {
            pushFileSubjectSkip(out, ctx, spec, evidence, sv, r.reason);
            continue;
        }
        pushRow(r.subject, r.via, row, null);
    }
    return { emitted: emitted, subjects: subjects };
}
// ---------- 单仓四象限档行为数据的读取和核对（D-124③） ----------
// 单文件数据重新汇总：file_facet_row 按分析项归堆，内容去重（成对关系两头各一条事实，拼回去还是原来那一行）；
// 核对标准：汇总层的数据跟单文件重算出来的必须一模一样（排序后比 JSON 字符串，逐字一样才算，免得后头逻辑跑偏）。
export function reaggregateFileFacetRows(facts) {
    const byFace = {};
    const seen = {};
    for (const f of facts) {
        if (f.metric !== 'codelore.file_facet_row') {
            continue;
        }
        const v = JSON.parse(f.value_json);
        const a = String(v.analysis);
        const key = JSON.stringify(v.row);
        if (!byFace[a]) {
            byFace[a] = [];
            seen[a] = new Set();
        }
        if (!seen[a].has(key)) {
            seen[a].add(key);
            byFace[a].push(v.row);
        }
    }
    return byFace;
}
// 核对标准（D-124③）：单文件重算结果 ＝ 带文件路径的汇总行 － 跳过的那些原始路径行。
// 怎么算「带文件路径」得跟 emitPerFileFacts 一个口径（成对的行要求 entity_a 和 entity_b 都不空；单行要求 path 或 entity 有个有效值）；
// 跳过事实记的是没能输出出去的原始路径；不是文件粒度的（日期、版本这些）本来就不参加比。
export function reconcilePerFileVsAggregate(facts) {
    const perFile = reaggregateFileFacetRows(facts);
    const canon = function (rows) { return rows.map(function (r) { return JSON.stringify(r); }).sort().join(String.fromCharCode(10)); };
    // 成对行怎么认，跟输出那头一个口径：entity_a 和 entity_b 都不空才算一对。
    const pairEnds = function (r) {
        const ea = r['entity_a'], eb = r['entity_b'];
        if (typeof ea === 'string' && typeof eb === 'string' && ea.length > 0 && eb.length > 0) {
            return [ea, eb];
        }
        return null;
    };
    // 单行怎么认：从 FILE_SUBJECT_KEYS 里取头一个非空字符串当路径。
    const singleRawPath = function (r) {
        for (const k of FILE_SUBJECT_KEYS) {
            const v = r[k];
            if (typeof v === 'string' && v.length > 0) {
                return v;
            }
        }
        return null;
    };
    const isFileBearing = function (r) {
        return pairEnds(r) !== null || singleRawPath(r) !== null;
    };
    const skippedByFace = {};
    for (const f of facts) {
        if (f.metric !== 'codelore.file_subject_skip') {
            continue;
        }
        const v = JSON.parse(f.value_json);
        const a = String(v.analysis);
        if (!skippedByFace[a]) {
            skippedByFace[a] = new Set();
        }
        skippedByFace[a].add(String(v.raw_path));
    }
    const per = {};
    let all = true;
    for (const f of facts) {
        if (f.metric !== 'codelore.facet_rows') {
            continue;
        }
        const v = JSON.parse(f.value_json);
        const a = String(v.analysis);
        const aggRows = (v.rows || []);
        const skip = skippedByFace[a] || new Set();
        const expected = aggRows.filter(function (r) {
            const pair = pairEnds(r);
            // 成对行排除的时候要看 entity_a 和 entity_b 的原值：哪一头转不出来，整行就跳过。
            if (pair !== null) {
                return !skip.has(pair[0]) && !skip.has(pair[1]);
            }
            const rp = singleRawPath(r);
            if (rp === null) {
                return false;
            }
            return !skip.has(rp);
        });
        const pf = perFile[a] || [];
        const fileBearing = aggRows.filter(isFileBearing).length;
        const m = canon(expected) === canon(pf);
        per[a] = { file_bearing: fileBearing, skipped: skip.size, per_file: pf.length, match: m };
        if (!m) {
            all = false;
        }
    }
    return { match: all, per_analysis: per };
}
// ---------- 大模型那块的开关（#36 / A-041 / D-035②）：环境变量管着，花了多少也算着 ----------
// 名字都按实输出来：analyze 那个列表里没有 explain-*（照实记）；
// 大模型的活是 `explain <path> --llm`（给单个文件加点说明）和 `diff <range> --llm`（给一段改动加点说明），还有个 MCP explain_file（走另一套协议，眼下先不做）。
// 开关规矩：用 CODELORE_LLM_* 那一串环境变量配，默认先照顾本地服务（openai-compat 默认连 http://localhost:11434/v1）；环境变量没配，这功能就用不了。
// 规矩：这层只读环境变量「配了没有」，里面的实际内容（尤其密钥）绝不写进事实库；没开大模型就记一条 llm_gated 事实说明白，不悄悄失败，也不去调上游 --llm，不抛异常把别的采集带崩。
export const CODELORE_LLM_ENV_VARS = [
    'CODELORE_LLM_PROVIDER',
    'CODELORE_LLM_BASE_URL',
    'CODELORE_LLM_API_KEY',
    'CODELORE_LLM_MODEL',
    'ANTHROPIC_API_KEY'
];
// 调用次数上限用这个工具自己的环境变量管，省得跟上游配置打架；
// 设上限是为了管资源，顶到上限就记一条降级说明，不掺任何判好判坏的逻辑。
export const CODELORE_LLM_CALL_CAP_ENV = 'MACRO_AUDIT_CODELORE_LLM_MAX_CALLS';
export const CODELORE_LLM_DEFAULT_CALL_CAP = 20;
// 开关状态怎么定（跟上游的提示保持一致）：
// 明确写了 PROVIDER 就先用它；没写但看见了 ANTHROPIC_API_KEY 就用 anthropic，不然默认走本地兼容模式 openai-compat。
export function resolveLlmGate(env) {
    const has = (k) => typeof env[k] === 'string' && env[k].trim().length > 0;
    const explicit = has('CODELORE_LLM_PROVIDER') ? env.CODELORE_LLM_PROVIDER.trim() : null;
    let provider;
    let reason = 'ok';
    if (explicit !== null) {
        if (explicit === 'anthropic' || explicit === 'openai-compat') {
            provider = explicit;
        }
        else {
            provider = null;
            reason = 'unknown-provider';
        }
    }
    else {
        provider = has('ANTHROPIC_API_KEY') ? 'anthropic' : 'openai-compat';
    }
    const missing = [];
    if (provider === 'anthropic' && !has('ANTHROPIC_API_KEY')) {
        missing.push('ANTHROPIC_API_KEY');
    }
    if (provider === 'openai-compat' && !has('CODELORE_LLM_MODEL')) {
        missing.push('CODELORE_LLM_MODEL');
    }
    if (missing.length > 0) {
        reason = 'missing-env';
    }
    return {
        env_family: 'CODELORE_LLM_*',
        provider: provider,
        configured: reason === 'ok' && missing.length === 0,
        missing_env: missing,
        reason: reason
    };
}
export const CODELORE_LLM_FACETS = [
    { face: 'explain-file' },
    { face: 'diff' }
];
// 参数构造函数跑和记证据共用；explain-file 按文件路径调，diff 按变动范围调。
export function codeloreLlmArgs(spec, subject, repoRoot, llmRefresh) {
    const args = spec.face === 'explain-file'
        ? ['explain', subject, '--repo', repoRoot, '--llm']
        : ['diff', subject, '--repo', repoRoot, '--format', 'markdown', '--llm'];
    if (llmRefresh) {
        args.push('--llm-refresh');
    }
    return args;
}
export function runCodeloreLlm(binary, args, cwd) {
    const r = runText(binary, args, cwd);
    return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}
// 带 `--llm` 跑成功的话，输出里除了常规结果，还有大模型写的说明和一行标记。
// 标记那行一般是：'advisory <model>, grounded' 或者 'advisory <model> contains uncited claims: <list>'。
// 解析就各字段各取各的，不改它的意思，原话完整往下递。
export function parseLlmNarrative(text) {
    const marker = 'LLM narrative (advisory)';
    const idx = text.indexOf(marker);
    if (idx < 0) {
        return { base: text, narrative: null, stamp: null, model: null, grounded: null, uncited_claims: [] };
    }
    const lineStart = text.lastIndexOf('\n', idx) + 1;
    const base = text.slice(0, lineStart);
    const block = text.slice(lineStart);
    const blockLines = block.split('\n');
    let stampIdx = -1;
    for (let i = blockLines.length - 1; i >= 0; i--) {
        if (/^[*_~` ]*advisory\s+\S/.test(blockLines[i])) {
            stampIdx = i;
            break;
        }
    }
    let stamp = null;
    let model = null;
    let grounded = null;
    const claims = [];
    if (stampIdx >= 0) {
        stamp = blockLines[stampIdx].trim().replace(/^[*_~` ]+|[*_~` ]+$/g, '');
        const g = stamp.match(/,\s*grounded\s*$/);
        const u = stamp.match(/contains uncited claims:\s*(.*)$/);
        if (g) {
            grounded = true;
            model = stamp.slice('advisory'.length, stamp.length - g[0].length).trim();
        }
        else if (u) {
            grounded = false;
            model = stamp.slice('advisory'.length, stamp.indexOf('contains uncited claims')).trim().replace(/,\s*$/, '');
            const claimsText = u[1].replace(/\s*\(\d+\s+more\)\s*$/i, '');
            for (const c of claimsText.split(',')) {
                const s = c.trim();
                if (s) {
                    claims.push(s);
                }
            }
        }
        else {
            model = stamp.slice('advisory'.length).trim().replace(/,\s*$/, '');
        }
    }
    const narrative = blockLines.slice(1).join('\n').trim();
    return { base: base, narrative: narrative.length > 0 ? narrative : null, stamp: stamp, model: model, grounded: grounded, uncited_claims: claims };
}
// 成本怎么估：上游不直接吐 token 数，这儿按字符数除以 4 估，字段名都以 est_ 打头标明白。
function estTokenUnits(chars) {
    return Math.ceil(chars / 4);
}
// 一项项采：先看解析状态和大模型配没配（开关怎么判的结果一律明着记进事实库）；没开就对每个要的项记一条 llm_gated 降级；
// 开了就一个个调，顺便数字符和 token；顶到调用上限就标 llm_gated(reason=call-cap-reached)；最后出一条 llm_cost 汇总。
export function collectCodeloreLlm(input, ctx) {
    const out = [];
    const bin = input.binary || 'codelore';
    const env = input.env || process.env;
    const resolve = input.resolver || resolveCodelore;
    const runner = input.runner || runCodeloreLlm;
    const res = resolve(bin);
    pushResolutionFact(out, ctx, res);
    if (res.error || !res.pinned) {
        return out;
    }
    const gate = resolveLlmGate(env);
    const capFromEnv = Number(env[CODELORE_LLM_CALL_CAP_ENV]);
    const capSource = input.maxLlmCalls !== undefined ? 'input' : (Number.isFinite(capFromEnv) && capFromEnv > 0 ? 'env' : 'default');
    const callCap = input.maxLlmCalls !== undefined ? input.maxLlmCalls : (capSource === 'env' ? Math.floor(capFromEnv) : CODELORE_LLM_DEFAULT_CALL_CAP);
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'llm-gate', 'env ' + gate.env_family, 'codelore.llm_gate', {
        env_family: gate.env_family,
        provider: gate.provider,
        configured: gate.configured,
        missing_env: gate.missing_env,
        reason: gate.reason,
        call_cap: callCap,
        cap_source: capSource
    }));
    const facets = input.facets || CODELORE_LLM_FACETS;
    const subjects = [];
    for (const spec of facets) {
        if (spec.face === 'explain-file') {
            for (const p of input.explainPaths || []) {
                const pn = normalizeSubjectPath(p); // 归整只此一处：单文件主体的事实统一成规范形（D-125①）
                if (!pn.ok) {
                    out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, 'explain-file', 'codelore explain', 'codelore.file_subject_skip', { analysis: 'explain-file', group: null, raw_path: p, reason: pn.reason }));
                    continue;
                }
                subjects.push({ spec: spec, subject: pn.subject });
            }
        }
        else {
            subjects.push({ spec: spec, subject: input.diffRange || '' });
        }
    }
    const cost = { attempted: 0, succeeded: 0, failed: 0, capped: 0, narrative_chars: 0, est_token_units: 0 };
    const gatedFaces = [];
    const pushGated = (s, reason, extra) => {
        gatedFaces.push(s.spec.face);
        out.push(makeFact(ctx, CODELORE_DESCRIPTOR, s.subject || s.spec.face, 'env ' + gate.env_family, 'codelore.llm_gated', {
            face: s.spec.face,
            reason: reason,
            missing_env: gate.missing_env,
            provider: gate.provider,
            call_cap: callCap,
            calls_attempted: cost.attempted,
            ...extra
        }));
    };
    for (const s of subjects) {
        if (!gate.configured) {
            pushGated(s, 'gate-' + gate.reason, {});
            continue;
        }
        if (s.subject === '') {
            pushGated(s, 'param-missing:diff-range', {});
            continue;
        }
        if (cost.attempted >= callCap) {
            cost.capped++;
            pushGated(s, 'call-cap-reached', {});
            continue;
        }
        const args = codeloreLlmArgs(s.spec, s.subject, input.repoRoot, !!input.llmRefresh);
        const evidence = 'codelore ' + args.join(' ');
        cost.attempted++;
        const run = runner(bin, args, input.repoRoot);
        if (!run.ok) {
            cost.failed++;
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, s.subject, evidence, 'codelore.llm_error', {
                face: s.spec.face,
                status: run.status,
                stderr_tail: run.stderrTail,
                base_emitted: run.stdout.length > 0,
                base_chars: run.stdout.length
            }));
            continue;
        }
        const parsed = parseLlmNarrative(run.stdout);
        if (parsed.narrative === null) {
            cost.failed++;
            out.push(makeFact(ctx, CODELORE_DESCRIPTOR, s.subject, evidence, 'codelore.llm_error', {
                face: s.spec.face,
                status: run.status,
                stderr_tail: run.stderrTail,
                base_emitted: parsed.base.length > 0,
                base_chars: parsed.base.length,
                detail: 'narrative-marker-absent'
            }));
            continue;
        }
        cost.succeeded++;
        cost.narrative_chars += parsed.narrative.length;
        const units = estTokenUnits(parsed.base.length + parsed.narrative.length);
        cost.est_token_units += units;
        out.push(makeFact(ctx, CODELORE_DESCRIPTOR, s.subject, evidence, 'codelore.llm_narrative', {
            face: s.spec.face,
            model: parsed.model,
            grounded: parsed.grounded,
            uncited_claims: parsed.uncited_claims,
            stamp: parsed.stamp,
            narrative: parsed.narrative,
            narrative_chars: parsed.narrative.length,
            base_chars: parsed.base.length,
            est_token_units: units
        }));
    }
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'llm-cost', 'adapter metering', 'codelore.llm_cost', {
        call_cap: callCap,
        cap_source: capSource,
        calls_attempted: cost.attempted,
        calls_succeeded: cost.succeeded,
        calls_failed: cost.failed,
        calls_capped: cost.capped,
        narrative_chars_total: cost.narrative_chars,
        est_token_units_total: cost.est_token_units,
        est_basis: 'chars/4（上游工具不输出 token 统计，此处为按字符估算结果而非实际数值）',
        gated_faces: Array.from(new Set(gatedFaces))
    }));
    return out;
}
