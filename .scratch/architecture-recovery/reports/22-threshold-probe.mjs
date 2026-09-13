// 只读测定：票 22 真判据阈值校准（A-023 / spec.md §R3-D4）
// 用法：node .scratch/architecture-recovery/reports/22-threshold-probe.mjs
// 约定：只读不改工作区；复用票 21 三族采集器纯函数（同一口径）；输出 reports/22-threshold-raw.json
// 纪律：observedAt 取自 HEAD committer date（不用 Date.now），保证同 commit 可复现

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const NL = String.fromCharCode(10);
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ADR_DIR = join(REPO, 'docs', 'adr');
const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');
const OUT = join(HERE, '22-threshold-raw.json');

function git(args) {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 67108864 });
}
function lines(text) {
  return text.split(NL).filter(function (s) { return s.length > 0; });
}

const C = await import(pathToFileURL(COLLECT_TS).href);

// ---- §0 仓库历史健康（浅克隆污染排查，per W2 #02 教训）----
const meta = {
  isShallow: git(['rev-parse', '--is-shallow-repository']).trim(),
  commitCount: Number(git(['rev-list', '--count', 'HEAD']).trim()),
  earliestCommit: lines(git(['log', '--reverse', '--format=%aI']))[0],
  headCommitDate: git(['log', '-1', '--format=%cI']).trim(),
  headSha: git(['log', '-1', '--format=%H']).trim()
};
const observedAt = meta.headCommitDate;
const ctx = {
  runId: 'probe-22-' + meta.headSha.slice(0, 8),
  traceId: '00000000000000000000000000000000',
  repoRef: '6F',
  scale: 'Macro-B',
  observedAt: observedAt
};
console.log('META shallow=' + meta.isShallow + ' commits=' + meta.commitCount + ' observedAt=' + observedAt);

// ---- §1 adr-structure@v1 实测（TC-2 / NC-1 输入）----
const adrFiles = readdirSync(ADR_DIR).filter(function (f) { return f.endsWith('.md'); }).sort();
const adrDocs = adrFiles.map(function (f) {
  return { path: 'docs/adr/' + f, text: readFileSync(join(ADR_DIR, f), 'utf8') };
});
const adrInput = { documents: adrDocs };
const adrFacts = C.collectAdrStructure(adrInput, ctx);
const adrDates = C.adrDates(adrInput);

const fivePiece = {};
adrFacts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).forEach(function (f) {
  fivePiece[f.subject_ref] = JSON.parse(f.value_json);
});
const datedCount = Object.keys(adrDates).filter(function (k) { return adrDates[k] !== null && adrDates[k] !== undefined; }).length;
const ratios = adrFiles.map(function (f) {
  const v = fivePiece['docs/adr/' + f];
  return v ? v.ratio : 0;
});
const sumRatios = ratios.reduce(function (a, b) { return a + b; }, 0);
const meanFivePiece = sumRatios / adrFiles.length;
const FIELDS = ['Status', 'Date', 'Context', 'Decision', 'Consequences'];
const missingFieldCount = {};
FIELDS.forEach(function (k) { missingFieldCount[k] = 0; });
adrFiles.forEach(function (f) {
  const v = fivePiece['docs/adr/' + f];
  if (!v) { return; }
  v.missing.forEach(function (m) { missingFieldCount[m] = missingFieldCount[m] + 1; });
});
const missingFieldRatio = {};
FIELDS.forEach(function (k) { missingFieldRatio[k] = missingFieldCount[k] / adrFiles.length; });
console.log('TC2 adr_total=' + adrFiles.length + ' dated=' + datedCount + ' mean_ratio=' + meanFivePiece.toFixed(4));
console.log('TC2 missing=' + JSON.stringify(missingFieldCount));

// ---- §2 gitlog@v1 实测（TC-1 输入）----
const shas = lines(git(['log', '--pretty=format:%H']));
const authors = lines(git(['log', '--pretty=format:%an']));
const dates = lines(git(['log', '--pretty=format:%aI']));
const subjects = lines(git(['log', '--pretty=format:%s']));
// paths 逐 commit 解析（gitlog 族要求 commit.paths 命中目标路径，否则整条被跳过）
const NAMEONLY = lines(git(['log', '--name-only', '--pretty=format:__C__%H']));
const commits = [];
let cur = null;
NAMEONLY.forEach(function (line) {
  if (line.indexOf('__C__') === 0) {
    cur = { sha: line.slice(5), paths: [] };
    commits.push(cur);
  } else if (cur !== null && line.trim().length > 0) {
    cur.paths.push(line.trim());
  }
});
if (commits.length !== shas.length) {
  console.log('PROBE-INVARIANT-FAIL commits=' + commits.length + ' shas=' + shas.length);
  process.exit(1);
}
for (let i = 0; i < commits.length; i++) {
  commits[i].author = authors[i];
  commits[i].date = dates[i];
}
console.log('COMMITS parsed=' + commits.length + ' with_paths=' + commits.filter(function (c) { return c.paths.length > 0; }).length);
const adrPaths = adrDocs.map(function (d) { return d.path; });
const firstSeen = {};
adrPaths.forEach(function (p) {
  const out = lines(git(['log', '--diff-filter=A', '--format=%aI', '--', p]));
  firstSeen[p] = out.length > 0 ? out[out.length - 1] : null;
});
const gitFacts = C.collectGitlog({ commits: commits, paths: adrPaths, adrDates: adrDates }, ctx);
const lagRows = gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).map(function (f) { return JSON.parse(f.value_json); });
const judgeable = lagRows.filter(function (r) { return typeof r.delta_days === 'number'; });
console.log('TC1 adr_total=' + adrFiles.length + ' dated=' + datedCount + ' judgeable=' + judgeable.length);
lagRows.forEach(function (r) {
  console.log('TC1 row ' + r.path + ' adr_date=' + r.adr_date + ' first_commit=' + r.first_commit_date + ' delta=' + r.delta_days);
});

// ---- §3 positioning@v1 实测（TC-3 输入）----
const TOPN = 20;
const STOPWORDS = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'per', 'via', 'not', 'all', 'any', 'are', 'was', 'were', 'has', 'have', 'had', 'its', 'but', 'can', 'may', 'our', 'out', 'over', 'under', 'when', 'which', 'will', 'would', 'should', 'must', 'such', 'than', 'then', 'they', 'them', 'their', 'there', 'here', 'each', 'both', 'same', 'more', 'most', 'some', 'only', 'also', 'been', 'being', 'does', 'did', 'done', '的', '了', '是', '在', '和', '与', '及', '或', '为', '以', '对', '从', '到', '被', '把', '给', '让', '使', '等', '就', '都', '也', '还', '很', '更', '最', '要', '会', '能', '可', '将', '已', '未', '无', '非', '个', '中', '上', '下', '之', '其', '此', '该', '由', '而', '但', '则', '若', '如', '于', '所', '有', '这', '那', '不', '一', '二', '三', '的的', '了的', '是在', '和的', '与的', '为的', '对的', '中的', '上的', '下的', '之中', '一个', '这个', '那个', '我们', '他们', '可以', '因为', '所以', '但是', '如果', '通过', '进行', '以及', '并且', '从而', '因此', '其中', '对应', '相关', '分别', '同时', '之后', '之前', '以内', '以上', '以下'];
const intentPaths = ['.scratch/architecture-recovery/README.md', 'CONTEXT.md'];
const intentDocs = intentPaths.filter(function (p) { return existsSync(join(REPO, p)); }).map(function (p) {
  return { path: p, text: readFileSync(join(REPO, p), 'utf8') };
});
const deliveryDocs = [{ path: 'git-log-subjects@' + meta.headSha.slice(0, 8), text: subjects.join(NL) }];
const posInput = { intentDocs: intentDocs, deliveryDocs: deliveryDocs, topN: TOPN, stopwords: STOPWORDS };
const posFacts = C.collectPositioning(posInput, ctx);
const covRows = posFacts.filter(function (f) { return f.metric === 'positioning.keyword_coverage'; }).map(function (f) {
  return { subject_ref: f.subject_ref, value: JSON.parse(f.value_json) };
});
covRows.forEach(function (r) {
  console.log('TC3 ' + r.subject_ref + ' hit=' + r.value.hit + '/' + r.value.keywords.length + ' ratio=' + r.value.ratio.toFixed(4));
  console.log('TC3 keywords=' + JSON.stringify(r.value.keywords));
});

// ---- §4 负对照候选扫描（NC-1 选材依据）----
const NC_CANDIDATES = ['.gitattributes', '.github/workflows/engine-ci.yml', 'engine/src/fact/schema.ts', 'engine/src/collect/collectors.ts', 'CONTEXT.md'];
const ncScan = NC_CANDIDATES.filter(function (p) { return existsSync(join(REPO, p)); }).map(function (p) {
  const facts = C.collectAdrStructure({ documents: [{ path: p, text: readFileSync(join(REPO, p), 'utf8') }] }, ctx);
  const fp = facts.filter(function (f) { return f.metric === 'adr.five_piece_completeness'; }).map(function (f) { return JSON.parse(f.value_json).present; });
  const sp = facts.filter(function (f) { return f.metric === 'adr.supersede_link_present'; }).map(function (f) { return JSON.parse(f.value_json).present; });
  return { path: p, fact_count: facts.length, five_piece_present: fp.length > 0 ? fp[0] : null, supersede_present: sp.length > 0 ? sp[0] : null };
});
ncScan.forEach(function (r) {
  console.log('NC ' + r.path + ' facts=' + r.fact_count + ' five_piece=' + r.five_piece_present);
});

// ---- §4.5 预声明阈值（与 reports/22-criteria-pre-registration.md 逐字一致；跑后禁调）----
const TH = {
  lag_days_red: 90,
  lag_ratio_red: 0.20,
  min_judgeable: 5,
  five_piece_mean_red: 0.60,
  field_missing_ratio_red: 0.50,
  coverage_red: 0.50,
  coverage_amber: 0.70
};
const lagging = judgeable.filter(function (r) { return r.delta_days > TH.lag_days_red; });
const lagRatio = judgeable.length > 0 ? lagging.length / judgeable.length : null;
const tc1 = judgeable.length < TH.min_judgeable
  ? 'INCONCLUSIVE'
  : (lagRatio > TH.lag_ratio_red ? 'RED' : 'GREEN');
const worstMissingField = FIELDS.reduce(function (a, b) { return missingFieldRatio[a] >= missingFieldRatio[b] ? a : b; });
const tc2 = (meanFivePiece < TH.five_piece_mean_red || missingFieldRatio[worstMissingField] > TH.field_missing_ratio_red) ? 'RED' : 'GREEN';
const worstCov = covRows.reduce(function (a, b) { return a.value.ratio <= b.value.ratio ? a : b; });
const tc3 = worstCov.value.ratio < TH.coverage_red ? 'RED' : (worstCov.value.ratio < TH.coverage_amber ? 'AMBER' : 'GREEN');
console.log('VERDICT-TC1=' + tc1 + ' judgeable=' + judgeable.length + ' lagging=' + lagging.length + ' ratio=' + lagRatio);
console.log('VERDICT-TC2=' + tc2 + ' mean=' + meanFivePiece.toFixed(4) + ' worstField=' + worstMissingField + ' ' + missingFieldRatio[worstMissingField].toFixed(4));
console.log('VERDICT-TC3=' + tc3 + ' worst=' + worstCov.subject_ref + ' ratio=' + worstCov.value.ratio.toFixed(4));

// ---- §5 落盘原始数 ----
const raw = {
  ticket: 22,
  purpose: 'R3-D4 真判据阈值跑前测定原始数（A-023 纪律：跑后禁调）',
  probe_script: '.scratch/architecture-recovery/reports/22-threshold-probe.mjs',
  collector_source: 'engine/src/collect/collectors.ts（票 21 三族，同口径）',
  meta: meta,
  observed_at: observedAt,
  tc1_s2a_backdating: {
    adr_total: adrFiles.length,
    adr_dated: datedCount,
    adr_dated_ratio: datedCount / adrFiles.length,
    judgeable_rows: judgeable.length,
    first_seen: firstSeen,
    rows: lagRows
  },
  tc2_s2b_five_piece: {
    adr_total: adrFiles.length,
    per_adr_ratio: ratios,
    mean_ratio: meanFivePiece,
    missing_field_count: missingFieldCount,
    missing_field_ratio: missingFieldRatio
  },
  tc3_s1_coverage: {
    topN: TOPN,
    stopword_count: STOPWORDS.length,
    stopwords: STOPWORDS,
    intent_docs: intentDocs.map(function (d) { return d.path; }),
    delivery_docs: deliveryDocs.map(function (d) { return d.path; }),
    delivery_subject_count: subjects.length,
    coverage_rows: covRows
  },
  pre_registered_thresholds: TH,
  pre_registered_outcome: {
    tc1: tc1,
    tc1_judgeable: judgeable.length,
    tc1_lagging: lagging.length,
    tc1_ratio: lagRatio,
    tc2: tc2,
    tc2_mean_ratio: meanFivePiece,
    tc2_worst_field: worstMissingField,
    tc2_worst_field_ratio: missingFieldRatio[worstMissingField],
    tc3: tc3,
    tc3_worst_source: worstCov.subject_ref,
    tc3_worst_ratio: worstCov.value.ratio
  },
  nc1_candidates: ncScan
};
writeFileSync(OUT, JSON.stringify(raw, null, 2), 'utf8');
const back = readFileSync(OUT, 'utf8');
console.log('PROBE-OUT bytes=' + Buffer.byteLength(back, 'utf8') + ' lines=' + back.split(NL).length);
console.log('PROBE-DONE');
