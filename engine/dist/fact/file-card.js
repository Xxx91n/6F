// fact/file-card.ts — Micro-B 文件级审计卡投影（#80 步② / D-123/D-126 / ADR-0023）
// 纯逻辑：输入=已取事实行＋注入观测（current_head_sha 由调用面探针供给）；不读 fs、不起子进程。
// 三层卡契约（D-123）：
//   kernel 层=已契约实体面逐字段直投（facet_rows 按 analysis 归组，逐行带 citation 锚 fact_ref/observed_at/evidence_ref）；
//   derived 层=仅确定性可复算值（priority_band 规则带版本号 hotspot_priority_v1／percentile_rank scope=repo／top_n_flag），
//     每项带 derivation 溯源字段；禁 A-E/GPA 字母判语形态（业界绑定门禁语义——裁决力在消费面不在值形态，故结构性隔离）；
//   narrative 层=零指标值纪律（只引用 kernel 已算值键名）＋citation 校验验键存在性（key_check）。
// advisory 结构性隔离：卡 schema 无 verdict/gate-consumable 字段＋advisory:true 显式字段＋priority=排序语义非判定。
// miss 四类显式态（D-126）：never_collected（可行动指引）/not_tracked_at_sha/not_applicable（合法空值非 miss）/renamed_to
//   （血缘存在→跳转指引＋逐请求重验证 revalidated 字段；无血缘→降级 not_tracked_at_sha）。
// 失败三态：new_file/insufficient_history=显式态仅静态指标（derived 抑制 suppressed_by 留痕）；
//   binary/generated→card_type:not_applicable 不出空卡。
// at:<sha>=显式 opt-in pin（常量禁自动派生——SQL:2011 AS OF 仅常量纪律）；staleness=双字段披露照答不拒答。
import { normalizeSubjectPath } from './subject.js';
export const FILE_CARD_SCHEMA_VERSION = 'file-card@v1';
export const FILE_CARD_RULE_VERSION = 'hotspot_priority_v1';
export const FILE_CARD_TOP_N = 20;
export const FILE_CARD_INSUFFICIENT_MIN_REVS = 3; // <3 修订=历史不足（含 new_file=1）
// D-136 失败态投影收口（#83）：kernel facet 词表二分 closed 枚举（D-095 纪律）——
//   历史派生族（D-123⑤ 括号点名五族）在 new_file/insufficient_history 下不进卡面；
//   保留面=静态指标集 closed。两集成员级双向差集对账=发射词表（CODELORE_*_FACETS 33 名）由
//   file-card.test 断言：并集=全集且交集=∅——新增 analysis 未分类即红（禁临场裁量）。
export const FILE_CARD_HISTORY_DERIVED_FACETS = [
    'entity-churn', 'entity-ownership', 'code-age', 'hotspots', 'coupling'
];
export const FILE_CARD_STATIC_FACETS = [
    'revisions', 'abs-churn', 'author-churn', 'hotspot-velocity', 'stale-code', 'architecture-trend',
    'health-trend', 'lead-time', 'release-cadence', 'messages', 'god-classes', 'architecture-metrics',
    'dependency-cycles', 'modularity-violations', 'instability', 'architecture-roles', 'ownership',
    'bus-factor', 'main-dev', 'main-dev-by-revs', 'main-dev-by-deletions', 'knowledge-islands',
    'communication', 'coordination-needs', 'team-composition', 'marginal-owner-risk', 'pair-programming',
    'function-hotspots'
];
export function headShaOfRepoRef(repoRef) {
    const i = repoRef.lastIndexOf('@');
    return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}
function asNum(v) {
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
// narrative 键集=kernel facet 键＋derived 键＋观测锚键——宿主叙事只可引用已算值键名（D-123 零指标值纪律）。
export function fileCardCitationKeys(card) {
    const keys = ['observation.head_sha', 'staleness.drift', 'source', 'failure_state', 'kernel.set_truncated', 'kernel.suppressed_facets'];
    for (const k of Object.keys(card.kernel.facet_rows).sort()) {
        keys.push('kernel.facet_rows.' + k);
    }
    if (card.derived.revisions !== null) {
        keys.push('derived.revisions');
    }
    if (card.derived.hotspot_score !== null) {
        keys.push('derived.hotspot_score');
    }
    if (card.derived.percentile_rank.value !== null) {
        keys.push('derived.percentile_rank');
    }
    if (card.derived.top_n_flag.value !== null) {
        keys.push('derived.top_n_flag');
    }
    if (card.derived.priority_band.value !== null) {
        keys.push('derived.priority_band');
    }
    return keys;
}
// citation 校验=验键存在性：宿主叙事段引用的键须全在卡键集内（缺失键清单如实回执）。
export function validateFileCardCitations(card, referenced) {
    const have = new Set(fileCardCitationKeys(card));
    const missing = referenced.filter(function (k) { return !have.has(k); });
    return { ok: missing.length === 0, missing: missing };
}
function missCard(subject, miss, input, headSha) {
    return {
        schema_version: FILE_CARD_SCHEMA_VERSION,
        card_type: miss.state === 'not_applicable' ? 'not_applicable' : 'miss',
        advisory: true,
        subject: subject,
        repo_ref: input.setRepoRef,
        observation: {
            head_sha: headSha,
            pinned_sha: input.pinnedSha,
            pin_matches_observed_head: input.pinnedSha !== null && headSha !== null ? input.pinnedSha === headSha : null
        },
        staleness: {
            observed_head_sha: headSha,
            current_head_sha: input.currentHeadSha,
            drift: input.currentHeadSha === null || headSha === null ? 'unknown' : (input.currentHeadSha === headSha ? 'fresh' : 'behind')
        },
        source: input.source,
        failure_state: miss.state === 'not_applicable' ? 'not_applicable' : 'ok',
        miss: miss,
        kernel: { facet_rows: {}, set_truncated: input.setTruncated === true, suppressed_facets: [] },
        derived: {
            rule_version: FILE_CARD_RULE_VERSION,
            revisions: null,
            hotspot_score: null,
            percentile_rank: { scope: 'repo', metric: 'hotspots.hotspot_score', value: null },
            top_n_flag: { n: FILE_CARD_TOP_N, scope: 'repo', metric: 'hotspots.hotspot_score', value: null },
            priority_band: { value: null, inputs: { hotspot_score: null, percentile_rank: null } },
            suppressed_by: miss.state === 'not_applicable' ? 'not_applicable' : null
        },
        narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
    };
}
export function buildFileCard(input) {
    const norm = normalizeSubjectPath(input.subject);
    if (!norm.ok) {
        return missCard(String(input.subject), {
            state: 'not_tracked_at_sha',
            detail: 'subject 归一拒绝 reason=' + norm.reason + '（SCIP 五规则读侧镜像）'
        }, input, input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null);
    }
    const subject = norm.subject;
    const headSha = input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null;
    // miss 态序（D-126 四类）：无观测集→never_collected（可行动指引）；集内无 subject→血缘/跳检→renamed_to|not_tracked。
    if (input.setRepoRef === null) {
        // F7a：pin 前缀歧义先判（观测集在但前缀不唯一——不猜最新，照答 not_tracked 并披露全部命中 sha）
        if (input.pinnedAmbiguous !== undefined && input.pinnedAmbiguous.length > 1) {
            return missCard(subject, {
                state: 'not_tracked_at_sha',
                detail: 'pin 前缀歧义：at:' + String(input.pinnedSha) + ' 命中 ' + input.pinnedAmbiguous.length + ' 个观测集（' + input.pinnedAmbiguous.map(function (s) { return s.slice(0, 12); }).join(', ') + '…）——唯一性不成立，用更长前缀或全 sha 重试',
                available_head_shas: input.availableHeadShas.slice(),
                cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
            }, input, null);
        }
        if (input.availableHeadShas.length === 0) {
            return missCard(subject, {
                state: 'never_collected',
                detail: '该 repo 无任何 Micro-B 观测集——文件级事实从未采集',
                cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
            }, input, null);
        }
        return missCard(subject, {
            state: 'not_tracked_at_sha',
            detail: 'pin 观测集缺席：at:' + String(input.pinnedSha) + ' 未采集（不实现强制 HEAD 匹配，照答不拒答）',
            available_head_shas: input.availableHeadShas.slice(),
            cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
        }, input, null);
    }
    const mine = input.setFacts.filter(function (f) { return f.metric === 'codelore.file_facet_row' && f.subject_ref === subject; });
    if (mine.length === 0) {
        // binary/generated/非 regular path→发射侧 file_subject_skip 留痕→card_type:not_applicable（合法空值非 miss 态空卡）
        const skip = input.setFacts.filter(function (f) {
            if (f.metric !== 'codelore.file_subject_skip') {
                return false;
            }
            try {
                const v = JSON.parse(f.value_json);
                return v.raw_path === subject || v.raw_path === input.subject;
            }
            catch {
                return false;
            }
        })[0];
        if (skip) {
            let reason = 'unclassified';
            try {
                reason = String(JSON.parse(skip.value_json).reason);
            }
            catch { /* keep */ }
            return missCard(subject, {
                state: 'not_applicable',
                detail: 'subject 发射侧判定不适用（' + reason + '）——合法空值非采集缺漏，不出空卡'
            }, input, headSha);
        }
        // 血缘存在→renamed_to＋逐请求重验证（目标在集内有事实=跳转条件成立）；无血缘→not_tracked_at_sha
        const edgeFact = input.setFacts.filter(function (f) {
            if (f.metric !== 'file.renamed') {
                return false;
            }
            try {
                return JSON.parse(f.value_json).from === subject;
            }
            catch {
                return false;
            }
        })[0];
        if (edgeFact) {
            const ev = JSON.parse(edgeFact.value_json);
            const targetHasFacts = input.setFacts.some(function (f) { return f.metric === 'codelore.file_facet_row' && f.subject_ref === ev.to; });
            return missCard(subject, {
                state: 'renamed_to',
                detail: '血缘检出 ' + subject + ' → ' + ev.to + '（commit=' + ev.commit_sha.slice(0, 7) + ' similarity=' + ev.similarity + '）——条件跳转：重验证通过方可请求目标卡',
                renamed_to: ev.to,
                lineage_edge: { from: ev.from, to: ev.to, commit_sha: ev.commit_sha, similarity: ev.similarity },
                revalidated: targetHasFacts
            }, input, headSha);
        }
        return missCard(subject, {
            state: 'not_tracked_at_sha',
            detail: '观测集 head=' + String(headSha).slice(0, 7) + ' 内无该 subject 的 per-file 事实且无血缘边——该 sha 树下不追踪',
            available_head_shas: input.availableHeadShas.slice(), // F6：「可提示 at: 其他 sha 试探」机制两枝补齐（pin 枝既有）
            cli_guidance: input.cliGuidance === null ? undefined : input.cliGuidance
        }, input, headSha);
    }
    // ---------- kernel 层：facet_rows 逐字段直投＋逐行 citation 锚 ----------
    const facetRows = {};
    for (const f of mine) {
        let v;
        try {
            v = JSON.parse(f.value_json);
        }
        catch {
            continue;
        }
        const analysis = typeof v.analysis === 'string' ? v.analysis : 'unknown';
        const row = (v.row !== null && typeof v.row === 'object' ? v.row : {});
        const arr = facetRows[analysis] || (facetRows[analysis] = []);
        arr.push({ row: row, fact_ref: f.fact_id, observed_at: f.observed_at, evidence_ref: f.evidence_ref });
    }
    const analyses = Object.keys(facetRows).sort();
    const ordered = {};
    for (const a of analyses) {
        ordered[a] = facetRows[a];
    }
    // ---------- derived 层：hotspot_priority_v1（确定性可复算＋规则版本随行） ----------
    let revisions = null;
    let hotspotScore = null;
    for (const r of ordered['revisions'] || []) {
        const n = asNum(r.row['n_revs']);
        if (n !== null && (revisions === null || n > revisions)) {
            revisions = n;
        }
    }
    for (const r of ordered['hotspots'] || []) {
        const n = asNum(r.row['revisions']);
        if (n !== null && (revisions === null || n > revisions)) {
            revisions = n;
        }
        const s = asNum(r.row['hotspot_score']);
        if (s !== null && (hotspotScore === null || s > hotspotScore)) {
            hotspotScore = s;
        }
    }
    // percentile scope=repo：同观测集全部 subject 的 hotspot_score 分布（中位秩法 less+eq/2 确定性消并列）
    const peerScores = [];
    for (const f of input.setFacts) {
        if (f.metric !== 'codelore.file_facet_row') {
            continue;
        }
        try {
            const v = JSON.parse(f.value_json);
            if (v.analysis === 'hotspots' && v.row) {
                const s = asNum(v.row.hotspot_score);
                if (s !== null) {
                    peerScores.push(s);
                }
            }
        }
        catch { /* skip malformed */ }
    }
    let pct = null;
    if (hotspotScore !== null && peerScores.length > 0) {
        let less = 0, eq = 0;
        for (const s of peerScores) {
            if (s < hotspotScore) {
                less += 1;
            }
            else if (s === hotspotScore) {
                eq += 1;
            }
        }
        pct = (less + eq / 2) / peerScores.length;
    }
    const topN = hotspotScore === null ? null : peerScores.filter(function (s) { return s > hotspotScore; }).length < FILE_CARD_TOP_N;
    const band = pct === null ? null : (pct >= 0.9 ? 'high' : (pct >= 0.6 ? 'medium' : 'low'));
    // 失败三态（D-123）：binary/generated 走 miss not_applicable；new_file/insufficient_history=显式态仅静态指标
    let failure = 'ok';
    if (revisions === 1) {
        failure = 'new_file';
    }
    else if (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) {
        failure = 'insufficient_history';
    }
    const suppressed = failure !== 'ok';
    // D-136 失败态投影收口（#83）：kernel 卡面只留静态指标集（closed）——历史派生族及未声明 facet
    //   一律移 suppressed_facets 带原因码（fail-closed：未入静态集=失败态不上卡面，防退化值冒充有效读数）；
    //   raw 事实层 append-only 不动（收口只作用投影层）；derived.suppressed_by 现行保留。
    const keptFacets = {};
    const suppressedFacets = [];
    for (const a of analyses) {
        if (suppressed && FILE_CARD_STATIC_FACETS.indexOf(a) < 0) {
            suppressedFacets.push({ facet: a, reason: failure });
        }
        else {
            keptFacets[a] = ordered[a];
        }
    }
    const card = {
        schema_version: FILE_CARD_SCHEMA_VERSION,
        card_type: 'file-audit-card',
        advisory: true,
        subject: subject,
        repo_ref: input.setRepoRef,
        observation: {
            head_sha: headSha,
            pinned_sha: input.pinnedSha,
            pin_matches_observed_head: input.pinnedSha !== null && headSha !== null ? input.pinnedSha === headSha : null
        },
        staleness: {
            observed_head_sha: headSha,
            current_head_sha: input.currentHeadSha,
            drift: input.currentHeadSha === null || headSha === null ? 'unknown' : (input.currentHeadSha === headSha ? 'fresh' : 'behind')
        },
        source: input.source,
        failure_state: failure,
        miss: null,
        kernel: { facet_rows: keptFacets, set_truncated: input.setTruncated === true, suppressed_facets: suppressedFacets },
        derived: {
            rule_version: FILE_CARD_RULE_VERSION,
            revisions: revisions,
            hotspot_score: hotspotScore,
            percentile_rank: { scope: 'repo', metric: 'hotspots.hotspot_score', value: suppressed ? null : pct },
            top_n_flag: { n: FILE_CARD_TOP_N, scope: 'repo', metric: 'hotspots.hotspot_score', value: suppressed ? null : topN },
            priority_band: { value: suppressed ? null : band, inputs: { hotspot_score: hotspotScore, percentile_rank: suppressed ? null : pct } },
            suppressed_by: suppressed ? failure : null
        },
        narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
    };
    // 叙事层：hints=只引用卡内已算值键名（零指标值纪律）；key_check=键存在性校验自洽回执
    card.narrative.hints = fileCardCitationKeys(card);
    card.narrative.key_check = { referenced: card.narrative.hints.slice(), missing: [], ok: true };
    return card;
}
