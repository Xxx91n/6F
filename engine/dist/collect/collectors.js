// collect/collectors.ts — 三族确定性采集器（A-022 / spec.md §R3-D3）
// 单模块约束：不含任何相对 import，使守卫脚本可用 Node 自带类型剥离直接 import（Node 22.18+）。
// 纯逻辑约束：输入一律注入；不读 fs、不起子进程、不发网络请求、不接 LLM。
// 决议继承：D-016/D-017（确定性、不接 LLM）· D-018（正对照与真判据同族）· A-010（correlation key 前置）· A-021（schema v0）
import { createHash } from 'node:crypto';
export function sha256Hex(input) {
    return createHash('sha256').update(input, 'utf8').digest('hex');
}
export function uuidFromHex(hex) {
    const h = (hex + '00000000000000000000000000000000').slice(0, 32);
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20, 32);
}
export function deriveBaggageId(ctx, dimension) {
    const parts = [ctx.repoRef, ctx.scale, 'strategic', dimension === null ? 'na' : dimension, ctx.runId];
    return sha256Hex(parts.join('|')).slice(0, 32);
}
export function deriveFactId(collectorId, subjectRef, metric, valueJson, observedAt) {
    return uuidFromHex(sha256Hex([collectorId, subjectRef, metric, valueJson, observedAt].join('|')));
}
export function toValueJson(value) {
    return JSON.stringify(value);
}
export function makeFact(ctx, desc, subjectRef, evidenceRef, metric, value) {
    const valueJson = toValueJson(value);
    return {
        fact_id: deriveFactId(desc.id, subjectRef, metric, valueJson, ctx.observedAt),
        trace_id: ctx.traceId,
        baggage_id: deriveBaggageId(ctx, desc.dimension),
        scale: ctx.scale,
        quadrant: desc.quadrant,
        dimension: desc.dimension,
        collector_id: desc.id,
        repo_ref: ctx.repoRef,
        subject_ref: subjectRef,
        evidence_ref: evidenceRef,
        metric: metric,
        value_json: valueJson,
        observed_at: ctx.observedAt
    };
}
export function daysBetweenUtc(a, b) {
    const ta = Date.parse(a.slice(0, 10) + 'T00:00:00Z');
    const tb = Date.parse(b.slice(0, 10) + 'T00:00:00Z');
    if (!isFinite(ta) || !isFinite(tb)) {
        return NaN;
    }
    return Math.round((ta - tb) / 86400000);
}
// ---------- §2 族一：adr-structure（S2 ADR 结构扫描） ----------
export const ADR_STRUCTURE_ID = 'adr-structure@v1';
export const ADR_STRUCTURE_FAMILY = 'adr-structure';
export const ADR_HEADER_FIELDS = ['Status', 'Date', 'Deciders', 'Ledger'];
export const ADR_SECTIONS = ['Context', 'Decision', 'Consequences', 'Options'];
export const ADR_FIVE_PIECE = ['Status', 'Date', 'Context', 'Decision', 'Consequences'];
export const ADR_STRUCTURE_DESCRIPTOR = {
    id: ADR_STRUCTURE_ID,
    family: ADR_STRUCTURE_FAMILY,
    dimension: 'S2',
    quadrant: 'strategic'
};
function linesOf(text) {
    return text.split(/\r?\n/);
}
function parseHeaderFields(lines) {
    const out = {};
    let started = false;
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (/^#\s+/.test(raw)) {
            started = true;
            continue;
        }
        if (!started) {
            continue;
        }
        if (/^##\s+/.test(raw)) {
            break;
        }
        const m = raw.match(/^-\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/);
        if (m) {
            const key = m[1].trim();
            if (!(key in out)) {
                out[key] = { value: m[2].trim(), line: i + 1 };
            }
        }
    }
    return out;
}
function parseSections(lines) {
    const out = {};
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^##\s+(.+?)\s*$/);
        if (!m) {
            continue;
        }
        let name = m[1].trim();
        if (/^considered\s+options$/i.test(name)) {
            name = 'Options';
        }
        if (!(name in out)) {
            out[name] = { name: name, line: i + 1 };
        }
    }
    return out;
}
function findSupersede(lines) {
    let matches = 0;
    let line = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().indexOf('supersede') >= 0) {
            matches++;
            if (line === 0) {
                line = i + 1;
            }
        }
    }
    return { present: matches > 0, matches: matches, line: line };
}
function evidenceFor(path, present, line) {
    return present && line > 0 ? path + '#L' + line : path;
}
export function collectAdrStructure(input, ctx) {
    const out = [];
    for (const doc of input.documents) {
        const lines = linesOf(doc.text);
        const headers = parseHeaderFields(lines);
        const sections = parseSections(lines);
        for (const field of ADR_HEADER_FIELDS) {
            const hit = headers[field];
            const present = !!hit;
            const line = present ? hit.line : 0;
            out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), 'adr.header_field_present', {
                field: field,
                present: present,
                line: line
            }));
        }
        for (const section of ADR_SECTIONS) {
            const hit = sections[section];
            const present = !!hit;
            const line = present ? hit.line : 0;
            out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), 'adr.section_present', {
                section: section,
                present: present,
                line: line
            }));
        }
        const missing = [];
        let presentCount = 0;
        for (const item of ADR_FIVE_PIECE) {
            const has = item === 'Status' || item === 'Date' ? !!headers[item] : !!sections[item];
            if (has) {
                presentCount++;
            }
            else {
                missing.push(item);
            }
        }
        out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, doc.path, 'adr.five_piece_completeness', {
            present: presentCount,
            of: ADR_FIVE_PIECE.length,
            ratio: presentCount / ADR_FIVE_PIECE.length,
            missing: missing
        }));
        const sup = findSupersede(lines);
        out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, sup.present, sup.line), 'adr.supersede_link_present', {
            present: sup.present,
            matches: sup.matches,
            line: sup.line
        }));
        const dateHit = headers['Date'];
        out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!dateHit, dateHit ? dateHit.line : 0), 'adr.decision_date', {
            date: dateHit ? dateHit.value : null
        }));
    }
    return out;
}
export function adrDates(input) {
    const out = {};
    for (const doc of input.documents) {
        const headers = parseHeaderFields(linesOf(doc.text));
        if (headers['Date']) {
            out[doc.path] = headers['Date'].value;
        }
    }
    return out;
}
// ---------- §2b 族一 v2：adr-structure 回退链（A-002 接线；v1 留档禁改） ----------
// 规则冻结于 reports/27-prereg.md（先于重跑入库）：字段腿 A dash → B 内联 Nygard；
// Date 追加 C head-60 ISO → D git 首提交（外部注入）；节腿 A ## 标题 → B 行首裸标签。
export const ADR_STRUCTURE_V2_ID = 'adr-structure@v2';
export const ADR_STRUCTURE_V2_DESCRIPTOR = {
    id: ADR_STRUCTURE_V2_ID,
    family: ADR_STRUCTURE_FAMILY,
    dimension: 'S2',
    quadrant: 'strategic'
};
const ISO_DATE_V2 = /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/;
function legInlineField(lines, name) {
    const dashRe = new RegExp('^[-*]\\s*' + name + '\\s*[:：]', 'i');
    const re = new RegExp('^(?:\\*\\*)?' + name + '(?:\\*\\*)?\\s*[:：]\\s*(.*)$', 'i');
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i].trim();
        if (raw.indexOf('#') === 0 || dashRe.test(raw)) {
            continue;
        }
        const m = raw.match(re);
        if (m) {
            const value = (m[1] || '').trim().replace(/\*\*$/, '').trim();
            return { value: value, line: i + 1, leg: 'inline' };
        }
    }
    return null;
}
function legInlineIsoDate(lines) {
    const head = lines.slice(0, 60);
    const re = new RegExp(ISO_DATE_V2.source, 'g');
    let best = null;
    for (let i = 0; i < head.length; i++) {
        for (const m of head[i].matchAll(re)) {
            if (!best || m[0] < best.value) {
                best = { value: m[0], line: i + 1 };
            }
        }
    }
    return best ? { value: best.value, line: best.line, leg: 'inline-iso' } : null;
}
function resolveHeaderFieldV2(lines, dashHeaders, name, doc) {
    const dh = dashHeaders[name];
    if (dh) {
        return { value: dh.value, line: dh.line, leg: 'dash' };
    }
    const ih = legInlineField(lines, name);
    if (ih) {
        return ih;
    }
    if (name === 'Date') {
        const iso = legInlineIsoDate(lines);
        if (iso) {
            return iso;
        }
        if (doc.first_commit_date) {
            return { value: doc.first_commit_date.slice(0, 10), line: 0, leg: 'git' };
        }
    }
    return null;
}
const SECTION_LABEL_V2 = {
    Context: ['Context'],
    Decision: ['Decision'],
    Consequences: ['Consequences'],
    Options: ['Considered Options', 'Options']
};
function legBareSection(lines, name) {
    const alts = SECTION_LABEL_V2[name] || [name];
    const re = new RegExp('^(?:[-*>]\\s*)?(?:\\*\\*)?(' + alts.join('|') + ')(?:\\*\\*)?\\s*[:：]', 'i');
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i].trim();
        if (raw.indexOf('#') === 0) {
            continue;
        }
        if (re.test(raw)) {
            return { line: i + 1 };
        }
    }
    return null;
}
export function collectAdrStructureV2(input, ctx) {
    const out = [];
    for (const doc of input.documents) {
        const lines = linesOf(doc.text);
        const dashHeaders = parseHeaderFields(lines);
        const v1Sections = parseSections(lines);
        const hdrLegs = {};
        const secLegs = {};
        for (const field of ADR_HEADER_FIELDS) {
            const hit = resolveHeaderFieldV2(lines, dashHeaders, field, doc);
            hdrLegs[field] = hit;
            out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!hit, hit ? hit.line : 0), 'adr.header_field_present', {
                field: field,
                present: !!hit,
                line: hit ? hit.line : 0,
                leg: hit ? hit.leg : null
            }));
        }
        for (const section of ADR_SECTIONS) {
            const v1h = v1Sections[section];
            const bare = legBareSection(lines, section);
            const hit = v1h ? { line: v1h.line, leg: 'dash' } : (bare ? { line: bare.line, leg: 'inline' } : null);
            secLegs[section] = hit;
            out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!hit, hit ? hit.line : 0), 'adr.section_present', {
                section: section,
                present: !!hit,
                line: hit ? hit.line : 0,
                leg: hit ? hit.leg : null
            }));
        }
        const missing = [];
        let presentCount = 0;
        for (const item of ADR_FIVE_PIECE) {
            const has = item === 'Status' || item === 'Date' ? !!hdrLegs[item] : !!secLegs[item];
            if (has) {
                presentCount++;
            }
            else {
                missing.push(item);
            }
        }
        out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, doc.path, 'adr.five_piece_completeness', {
            present: presentCount,
            of: ADR_FIVE_PIECE.length,
            ratio: presentCount / ADR_FIVE_PIECE.length,
            missing: missing
        }));
        const sup = findSupersede(lines);
        out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, sup.present, sup.line), 'adr.supersede_link_present', {
            present: sup.present,
            matches: sup.matches,
            line: sup.line
        }));
        const dateHit = hdrLegs['Date'];
        out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!dateHit, dateHit ? dateHit.line : 0), 'adr.decision_date', {
            date: dateHit ? dateHit.value : null,
            leg: dateHit ? dateHit.leg : null
        }));
    }
    return out;
}
// ---------- §3 族二：positioning（S1 定位素材） ----------
export const POSITIONING_ID = 'positioning@v1';
export const POSITIONING_FAMILY = 'positioning';
export const POSITIONING_DESCRIPTOR = {
    id: POSITIONING_ID,
    family: POSITIONING_FAMILY,
    dimension: 'S1',
    quadrant: 'strategic'
};
export function tokenize(text) {
    const lower = text.toLowerCase();
    const out = [];
    const ascii = lower.match(/[a-z][a-z0-9_+-]*/g) || [];
    for (const w of ascii) {
        if (w.length >= 2) {
            out.push(w);
        }
    }
    const cjk = lower.match(/[\u4e00-\u9fff]+/g) || [];
    for (const run of cjk) {
        for (let i = 0; i + 1 < run.length; i++) {
            out.push(run.slice(i, i + 2));
        }
    }
    return out;
}
export function countTokens(tokens) {
    const out = {};
    for (const t of tokens) {
        out[t] = (out[t] || 0) + 1;
    }
    return out;
}
export function extractKeywords(text, topN, stopwords) {
    const counts = countTokens(tokenize(text));
    const stop = new Set();
    for (const s of stopwords) {
        stop.add(s.toLowerCase());
    }
    const keys = Object.keys(counts).filter(function (k) { return !stop.has(k); });
    keys.sort(function (a, b) {
        const d = counts[b] - counts[a];
        if (d !== 0) {
            return d;
        }
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    return keys.slice(0, topN);
}
export function collectPositioning(input, ctx) {
    const out = [];
    const deliveryText = input.deliveryDocs.map(function (d) { return d.text; }).join('\n');
    const deliveryCounts = countTokens(tokenize(deliveryText));
    for (const doc of input.intentDocs) {
        const intentCounts = countTokens(tokenize(doc.text));
        const keywords = extractKeywords(doc.text, input.topN, input.stopwords);
        const missed = [];
        let hit = 0;
        for (const k of keywords) {
            const deliveryCount = deliveryCounts[k] || 0;
            out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.keyword_hit', {
                keyword: k,
                hit: deliveryCount > 0,
                intent_count: intentCounts[k] || 0,
                delivery_count: deliveryCount
            }));
            if (deliveryCount > 0) {
                hit++;
            }
            else {
                missed.push(k);
            }
        }
        const total = keywords.length;
        out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.keyword_coverage', {
            keywords: total,
            hit: hit,
            ratio: total === 0 ? 0 : hit / total,
            missed: missed
        }));
        const firstMissed = missed.length > 0 ? missed[0] : null;
        out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, 'positioning.drift_anchor', {
            first_missed_keyword: firstMissed,
            anchor: firstMissed
        }));
    }
    return out;
}
// ---------- §4 族三：gitlog（跨族交叉） ----------
export const GITLOG_ID = 'gitlog@v1';
export const GITLOG_FAMILY = 'gitlog';
export const GITLOG_DESCRIPTOR = {
    id: GITLOG_ID,
    family: GITLOG_FAMILY,
    dimension: null,
    quadrant: 'strategic'
};
export function collectGitlog(input, ctx) {
    const out = [];
    for (const path of input.paths) {
        const touching = input.commits.filter(function (c) { return c.paths.indexOf(path) >= 0; });
        if (touching.length === 0) {
            continue;
        }
        // null=毒值显式跳过（D-100②）：first_commit/adr_lag 只在 date 可判定子集上排序；
        // 排除计数由 Intake Health 节 excluded_commits 披露（over N-M commits 声明）。
        const dated = touching.filter(function (c) { return c.date !== null; });
        const sorted = dated.slice().sort(function (a, b) {
            if (a.date < b.date) {
                return -1;
            }
            if (a.date > b.date) {
                return 1;
            }
            if (a.sha < b.sha) {
                return -1;
            }
            if (a.sha > b.sha) {
                return 1;
            }
            return 0;
        });
        const first = sorted.length > 0 ? sorted[0] : null;
        const anchorSha = first !== null ? first.sha : touching[0].sha;
        if (first !== null) {
            out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.first_commit', {
                path: path,
                sha: first.sha,
                date: first.date
            }));
        }
        out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, anchorSha, 'git.commit_count', {
            path: path,
            count: touching.length
        }));
        const authorCounts = {};
        for (const c of touching) {
            authorCounts[c.author] = (authorCounts[c.author] || 0) + 1;
        }
        const authors = Object.keys(authorCounts).sort();
        let topAuthor = authors[0];
        for (const a of authors) {
            if (authorCounts[a] > authorCounts[topAuthor]) {
                topAuthor = a;
            }
        }
        out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, anchorSha, 'git.author_matrix', {
            path: path,
            authors: authors,
            top_author: topAuthor,
            top_share: authorCounts[topAuthor] / touching.length
        }));
        const adrDate = input.adrDates[path];
        if (adrDate && first !== null) {
            out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, 'git.adr_lag_days', {
                path: path,
                adr_date: adrDate,
                first_commit_date: first.date,
                delta_days: daysBetweenUtc(adrDate, first.date)
            }));
        }
    }
    return out;
}
// ---------- §5 注册表 + detector 同族声明（供票 22 直接引用） ----------
export const COLLECTOR_DESCRIPTORS = [
    ADR_STRUCTURE_DESCRIPTOR,
    POSITIONING_DESCRIPTOR,
    GITLOG_DESCRIPTOR
];
export const COLLECTOR_FAMILIES = COLLECTOR_DESCRIPTORS.map(function (d) { return d.family; });
export const DETECTOR_BINDING = [
    { criterion: 'PC-1', type: 'positive_control', families: ['adr-structure', 'positioning'], same_family_control: null, threshold: null },
    { criterion: 'PC-2', type: 'positive_control', families: ['gitlog', 'adr-structure'], same_family_control: null, threshold: null },
    { criterion: 'TC-1', type: 'true_criterion', families: ['gitlog', 'adr-structure'], same_family_control: 'PC-2', threshold: null },
    { criterion: 'TC-2', type: 'true_criterion', families: ['adr-structure'], same_family_control: 'PC-1', threshold: null },
    { criterion: 'TC-3', type: 'true_criterion', families: ['positioning'], same_family_control: 'PC-1', threshold: null },
    { criterion: 'NC-1', type: 'negative_control', families: ['adr-structure'], same_family_control: null, threshold: null }
];
export function bindingByCriterion(criterion) {
    for (const e of DETECTOR_BINDING) {
        if (e.criterion === criterion) {
            return e;
        }
    }
    return null;
}
