// upstream-dimension-map.ts —— 上游事实归到哪一维，运行时就在这张表里定
// 战略象限就 S1 到 S5 这五个维度，映射不许随手加维度、减维度。
//
// 这张表从哪儿来：
// 定义写在 docs/upstream-dimension-map.md
// 这份代码就是那条规矩的运行版，内容得跟文档对得上
// 上游适配器本身不带业务维度，维度怎么映射只在这儿处理
//
// 映射规则，一句话一摊：
// codelore：演化主干那批指标进 S4；结构和预算那批进 S3；
// 所有权边界那批进 S5；explain 说明类进 S4；
// 单仓四象限的行为数据只落到行为象限，不当战略维度用。
// github-rest：PR 汇总进 S4；合并耗时把平台自己标的机器人刨掉后进 S4；
// 机器人参与密度进 S5；
// 接口报错、速率限制、演化差异这些辅助字段不进战略维度。
//
// 复审日期常量跟文档上写的复审日期对得上。
import { CODELORE_DESCRIPTOR } from '../upstream/codelore.js';
import { GITHUB_REST_DESCRIPTOR } from '../upstream/github-rest.js';
export const UPSTREAM_DIMENSION_MAP_VERSION = 'v1.0';
export const UPSTREAM_DIMENSION_MAP_REVIEW = { last_reviewed: '2026-10-25', next_review: '2026-11-24' };
// ---------- codelore 的映射配置 ----------
const CL = (surface, kind, dimension, lane, admission, note) => ({ adapter: 'codelore', surface, surface_kind: kind, dimension, lane, admission, note });
export const CODELORE_EVOLUTION_FACETS = ['revisions', 'abs-churn', 'entity-churn', 'author-churn', 'hotspot-velocity', 'code-age', 'stale-code', 'architecture-trend', 'health-trend', 'lead-time', 'release-cadence', 'messages'];
export const CODELORE_S3_FACETS = ['god-classes', 'architecture-metrics', 'dependency-cycles', 'modularity-violations', 'instability', 'architecture-roles'];
// 读数归哪一层用的标签：同一个读数可能好几层都要看，具体归哪层由读它的那层决定。
export const SEMANTIC_DOMAIN_LABELS = {
    structure: 'structure/shape', // 结构象限的形态测量读数
    s3: 'S3/budget-attribution' // S3 维度的预算归因读数
};
export const CODELORE_S5_FACETS = ['ownership', 'entity-ownership', 'bus-factor', 'main-dev', 'main-dev-by-revs', 'main-dev-by-deletions', 'knowledge-islands', 'communication', 'coordination-needs', 'team-composition', 'marginal-owner-risk', 'pair-programming'];
export const CODELORE_EXPLAIN_SURFACES = ['explain-repo', 'explain-brief', 'explain-adr', 'explain-query', 'explain-resolve', 'explain-execute', 'explain-dryrun', 'llm-narrative', 'capability-check'];
export const CODELORE_BEHAVIOR_FACES = ['hotspots', 'coupling', 'function-hotspots'];
export const CODELORE_DIMENSION_MAP = [
    ...CODELORE_EVOLUTION_FACETS.map(a => CL(a, 'analysis', 'S4', 'S-dimension', '无准入', '演化主干面→S4 演化方向（D-078③）')),
    ...CODELORE_S3_FACETS.map(a => CL(a, 'analysis', 'S3', 'S-dimension', '须成对 opposing 准入（#51 双口径风险——单指标禁孤立入维）', 's3 族→S3 门面/结构预算（D-078③）')),
    ...CODELORE_S5_FACETS.map(a => CL(a, 'analysis', 'S5', 'S-dimension', '无准入', 's5 族→S5 所有权边界匹配（D-078③）')),
    ...CODELORE_EXPLAIN_SURFACES.map(a => CL(a, 'group', 'S4', 'S-dimension', 'env 门控（MACRO_AUDIT_6F_CL_LLM_KEY 未设=不产面——环境缺≠断言败）', 'explain 族→S4（D-078③ env 门控不变）')),
    ...CODELORE_BEHAVIOR_FACES.map(a => CL(a, 'analysis', null, 'Macro-B-QuadrantEntry', 'behavior 族不直归 S 维——QuadrantEntry 归位 D-054③', 'behavior 族→Macro-B 行为象限切片')),
    CL('deferred-faces', 'group', null, 'deferred', '暂缓面集=registry codelore-deferred-faces 枚举，未激活不映射（D-035④）', 'deferred 面集显式不映射'),
];
// ---------- github-rest 那些行 ----------
const GH = (surface, kind, dimension, lane, admission, note) => ({ adapter: 'github-rest', surface, surface_kind: kind, dimension, lane, admission, note });
export const GITHUB_REST_EXCLUDED_FACT_TYPES = ['resolution', 'rate_limit', 'rate_limited', 'api_error', 'schema_drift', 'run', 'preflight'];
export const GITHUB_REST_DIMENSION_MAP = [
    GH('pr_summary', 'fact_type', 'S4', 'S-dimension', '无准入', 'PR 列表汇总→S4（D-078③）'),
    GH('merge-lead-time', 'slice', 'S4', 'S-dimension', '仅人类 PR（平台声明 Bot 身份排除——CHAOSS 纪律 bot 按类出入）', 'merge lead time→S4'),
    GH('bot-participation-density', 'slice', 'S5', 'S-dimension', '平台声明的 Bot 身份（user.type===Bot ∧ login 后缀 [bot] 双条件）', 'Bot 参与密度→S5 措辞锁「平台声明的 Bot 身份」（D-082①）'),
    GH('review-coverage', 'slice', null, 'pending-event_bound', '挂起——pulls.reviews 激活事件 github-rest-reviews-active 未发生（D-081③）', 'review 覆盖 pending(event_bound: github-rest-reviews-active)——S5↔S4 双挂待采后裁定不预设'),
    GH('pr_diff', 'fact_type', null, 'Micro-A', 'Micro-A lane 消费不直采 Macro-B（D-078③）', 'diff 双通道→Micro-A'),
    ...GITHUB_REST_EXCLUDED_FACT_TYPES.map(f => GH(f, 'fact_type', null, 'excluded', '永久排除——遥测/解析/决议面防渗入 S 维裁决（D-078③）', f + ' 永久排除出 S 维')),
];
export const UPSTREAM_DIMENSION_MAP = [...CODELORE_DIMENSION_MAP, ...GITHUB_REST_DIMENSION_MAP];
export function resolveCodeloreAnalysis(analysis) {
    const row = CODELORE_DIMENSION_MAP.find(r => r.surface === analysis);
    if (!row)
        return { dimension: null, lane: 'deferred', admission: '', admitted: false, reason: 'not_mapped（deferred/未登记面集——registry deferred-faces 语义）' };
    return { dimension: row.dimension, lane: row.lane, admission: row.admission, admitted: row.dimension !== null && row.lane === 'S-dimension', reason: row.note };
}
export function isCodeloreDeferredAnalysis(analysis) {
    return !CODELORE_EVOLUTION_FACETS.includes(analysis)
        && !CODELORE_S3_FACETS.includes(analysis)
        && !CODELORE_S5_FACETS.includes(analysis)
        && !CODELORE_EXPLAIN_SURFACES.includes(analysis)
        && !CODELORE_BEHAVIOR_FACES.includes(analysis);
}
export function resolveGithubRestSlice(slice, ctx) {
    const row = GITHUB_REST_DIMENSION_MAP.find(r => r.surface === slice);
    if (!row)
        return { dimension: null, lane: 'unmapped', admission: '', admitted: false, reason: 'not_mapped（未登记 slice——非永久排除非挂起，登记前不投影归位）' };
    if (slice === 'merge-lead-time' && ctx && ctx.is_bot_via_platform_identity === true) {
        return { dimension: null, lane: 'S-dimension', admission: row.admission, admitted: false, reason: '准入拒：平台声明 Bot 身份的 PR 不入 merge-lead-time（CHAOSS 纪律）' };
    }
    if (row.lane === 'pending-event_bound')
        return { dimension: null, lane: row.lane, admission: row.admission, admitted: false, reason: row.note };
    return { dimension: row.dimension, lane: row.lane, admission: row.admission, admitted: row.dimension !== null && row.lane === 'S-dimension', reason: row.note };
}
export function isGithubRestExcludedFactType(factType) {
    return GITHUB_REST_EXCLUDED_FACT_TYPES.includes(factType);
}
export const UPSTREAM_COLLECTOR_REGISTRY = [
    {
        descriptor: CODELORE_DESCRIPTOR,
        registered: true,
        opt_in: 'binary+pin',
        skipped_semantics: 'binary 缺席/版本不符→availability blocked 显式（run fact available=false＋audit behavior not_applicable）',
    },
    {
        descriptor: GITHUB_REST_DESCRIPTOR,
        registered: true,
        opt_in: 'token+network',
        skipped_semantics: '无 token/无网络环境→explicit skipped 报告不算 PASS（凭据缺席=优雅降级非绿）',
    },
];
export function projectUpstreamDimensions(facts) {
    const mapped = [];
    const unmapped = [];
    for (const f of facts) {
        if (f.scale === 'Micro-B') {
            continue;
        } // 单文件档的事实不进单仓四象限档的维度映射，免得结果文件撑得太大
        const fam = f.metric.startsWith('codelore.') ? 'upstream-codelore'
            : f.metric.startsWith('github_rest.') ? 'upstream-github-rest' : null;
        if (fam === null)
            continue;
        let v = {};
        try {
            v = JSON.parse(f.value_json);
        }
        catch {
            v = {};
        }
        let res;
        if (fam === 'upstream-codelore') {
            const analysis = String(v.analysis || f.subject_ref || f.metric.replace(/^codelore\./, ''));
            res = resolveCodeloreAnalysis(analysis);
        }
        else {
            const ft = f.metric.replace(/^github_rest\./, '');
            // 看看平台自己标没标这是机器人
            res = resolveGithubRestSlice(ft, { is_bot_via_platform_identity: v.bot_declared === true });
        }
        const entry = {
            fact_id: f.fact_id, family: fam, metric: f.metric, subject_ref: f.subject_ref,
            dimension: res.dimension, lane: res.lane, admitted: res.admitted, reason: res.reason,
        };
        (res.dimension !== null ? mapped : unmapped).push(entry);
    }
    return { map_version: UPSTREAM_DIMENSION_MAP_VERSION, map_review: UPSTREAM_DIMENSION_MAP_REVIEW, mapped, unmapped };
}
