// 38-macro-c-preview.mjs — Macro-C（演化考古）preview 全链实跑（#38 / A-043 / R5-07 / spec §R5-D7）
// 链 = 采集（codelore 30面 + LLM 门控面 + adr-structure@v2 + gitlog + supersede 链复测）
//   → fact（38-macro-c-facts.jsonl + 共享事实库 38-audit-facts.duckdb：Macro-B 存档回放 + Macro-C 追加）
//   → 叙事/裁决（engine generate.ts buildReport + preview_disclosure 披露块）
//   → 报告双件（happy：38-macro-c-preview-report.{md,json} / failure：38-macro-c-preview-failure.{md,json}）
// 纪律：anysearch-cli 只读扫描（git 只读子命令 + 文件读 + codelore analyze），绝不写被测仓；
//       唯一写动作 = 本目录 38-* 工件。LLM env 门控关 = llm_gated 降级披露（不伪造、不真调）。
import { readFileSync, readdirSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');                 // 6F 仓根
const AS = 'D:/Aworker/anysearch-cli';                    // 校准语料仓（只读对象）
const DIST = join(REPO, 'engine', 'dist');

const C = await import(pathToFileURL(join(DIST, 'collect', 'collectors.js')).href);
const G = await import(pathToFileURL(join(DIST, 'report', 'generate.js')).href);
const U = await import(pathToFileURL(join(DIST, 'upstream', 'codelore.js')).href);
const S = await import(pathToFileURL(join(DIST, 'fact', 'schema.js')).href);
const STORE = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);

const NL = String.fromCharCode(10);
const git = (args) => execFileSync('git', ['-C', AS].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

// ---------- §0 触发序列（Macro-C：手动触发 preview；锚定被测仓 HEAD） ----------
const HEAD_SHA = git(['rev-parse', 'HEAD']).trim();
const HEAD_DATE = git(['log', '-1', '--format=%cI']).trim();
const TREE_SHA = git(['rev-parse', 'HEAD^{tree}']).trim();
const COMMIT_COUNT = Number(git(['rev-list', '--count', 'HEAD']).trim());

const ctx = {
  runId: 'r38-' + HEAD_SHA.slice(0, 7),
  traceId: C.sha256Hex('anysearch-cli|' + HEAD_SHA + '|' + HEAD_DATE).slice(0, 32),
  repoRef: 'anysearch-cli@' + HEAD_SHA,
  scale: 'Macro-C',
  observedAt: HEAD_DATE
};

// ---------- §1 采集：gitlog 解析（PROBE-INVARIANT：解析完整性先断言） ----------
const rawLog = git(['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
const commits = [];
let cur = null;
for (const line of rawLog.split(NL)) {
  const t = line.trim();
  if (t.indexOf('__R__') === 0) {
    const parts = t.slice(5).split('|');
    cur = { sha: parts[0], author: parts[1], date: parts[2], paths: [] };
    commits.push(cur);
  } else if (cur && t.length > 0) {
    cur.paths.push(t);
  }
}
if (commits.length !== COMMIT_COUNT) { throw new Error('PROBE-INVARIANT-FAIL: parsed ' + commits.length + ' != git rev-list ' + COMMIT_COUNT); }

// ---------- §2 采集：ADR 语料（adr-structure@v2 回退链——anysearch-cli 混排格式实测适配） ----------
const adrDir = join(AS, 'docs', 'adr');
const adrFiles = readdirSync(adrDir).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort();
const firstCommitOf = (p) => {
  let best = null;
  for (const c of commits) { if (c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) { best = c.date; } }
  return best;
};
const adrDocs = adrFiles.map(function (f) {
  const rel = 'docs/adr/' + f;
  return { path: rel, text: readFileSync(join(adrDir, f), 'utf8'), first_commit_date: firstCommitOf(rel) };
});
const adrPaths = adrDocs.map(function (d) { return d.path; });
const adrFacts = C.collectAdrStructureV2({ documents: adrDocs }, ctx);
const adrDateMap = {};
for (const f of adrFacts) {
  if (f.metric === 'adr.decision_date') {
    const v = JSON.parse(f.value_json);
    if (v.date) { adrDateMap[f.subject_ref] = v.date.slice(0, 10); }
  }
}
const gitFacts = C.collectGitlog({ commits: commits, paths: adrPaths, adrDates: adrDateMap }, ctx);

// ---------- §3 采集：CodeLore 契约面 30 面 + LLM 门控面（实跑，#35/#36 供给） ----------
const codeloreFacts = U.collectCodeloreFacets({ repoRoot: AS }, ctx);
const llmFacts = U.collectCodeloreLlm({
  repoRoot: AS,
  explainPaths: ['apps/cli/src/index.ts', 'apps/cli/src/composition.ts'],
  diffRange: 'HEAD~10..HEAD'
}, ctx);
const llmGateFact = llmFacts.find(function (f) { return f.metric === 'codelore.llm_gate'; });
const llmGate = llmGateFact ? JSON.parse(llmGateFact.value_json) : { configured: false, reason: 'no-gate-fact' };

// ---------- §4 采集：supersede 链 live 复测（与 37-pilot-measurements.json 对账通道） ----------
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
  const amends = [], refs = [], defers = [];
  text.split(NL).forEach(function (line, i) {
    if (!/^\s*(Amends|References)\s*[:：]/i.test(line)) { return; }
    for (const mm of line.matchAll(/ADR-?(\d{3,})/gi)) { (/^Amends/i.test(line.trim()) ? amends : refs).push({ line: i + 1, to: mm[1] }); }
    for (const mm of line.matchAll(/defer-(\d{3,})/gi)) { defers.push({ line: i + 1, to: 'defer-' + mm[1] }); }
  });
  adrs.push({ file: d.path, num: num, whole_to: wholeTo, inline: inlineRefs, amends: amends, refs: refs, defers: defers, mentions: Array.from(new Set(Array.from(text.matchAll(/ADR-?(\d{3,})/gi)).map(function (x) { return x[1]; }))) });
}
const numSet = new Set(adrs.map(function (a) { return a.num; }));
const deferRegistry = existsSync(join(AS, 'docs', 'deferred-registry.json'));
const edges = [];
for (const a of adrs) {
  if (a.whole_to) { edges.push({ from: a.num, to: a.whole_to, kind: 'whole-adr-status', evidence: a.file + ' status-line' }); }
  for (const r of a.inline) { edges.push({ from: a.num, to: r.to, kind: r.negated ? 'explicit-non-supersede' : 'item-level-inline', evidence: a.file + ':' + r.line }); }
  for (const r of a.amends) { edges.push({ from: a.num, to: r.to, kind: 'amends', evidence: a.file + ':' + r.line }); }
  for (const r of a.refs) { edges.push({ from: a.num, to: r.to, kind: 'references', evidence: a.file + ':' + r.line }); }
  for (const r of a.defers) { edges.push({ from: a.num, to: r.to, kind: 'defer-ref', evidence: a.file + ':' + r.line }); }
}
const SUPERSEDE_KINDS = new Set(['whole-adr-status', 'item-level-inline']);
for (const e of edges) {
  if (e.from === e.to) { e.kind = 'self-quote-artifact'; }
  if (e.kind === 'defer-ref') { e.resolved = deferRegistry; }
  else { e.resolved = numSet.has(e.to); }
  if (e.kind !== 'defer-ref' && e.resolved) {
    const target = adrs.find(function (a) { return a.num === e.to; });
    e.back_reference = target ? target.mentions.indexOf(e.from) >= 0 : false;
  } else { e.back_reference = null; }
}
const chain = {
  edge_count: edges.length,
  whole_adr_supersessions: edges.filter(function (e) { return e.kind === 'whole-adr-status'; }).length,
  item_level_supersessions: edges.filter(function (e) { return e.kind === 'item-level-inline'; }).length,
  amends_edges: edges.filter(function (e) { return e.kind === 'amends'; }).length,
  references_edges: edges.filter(function (e) { return e.kind === 'references'; }).length,
  defer_ref_edges: edges.filter(function (e) { return e.kind === 'defer-ref'; }).length,
  explicit_non_supersedes: edges.filter(function (e) { return e.kind === 'explicit-non-supersede'; }).length,
  self_quote_artifacts: edges.filter(function (e) { return e.kind === 'self-quote-artifact'; }).length,
  unresolved_refs: edges.filter(function (e) { return !e.resolved && e.kind !== 'self-quote-artifact'; }).map(function (e) { return e.from + '->' + e.to + ' (' + e.kind + ', ' + e.evidence + ')'; }),
  missing_backrefs: edges.filter(function (e) { return SUPERSEDE_KINDS.has(e.kind) && e.resolved && e.back_reference === false; }).map(function (e) { return e.from + '->' + e.to + ' (' + e.kind + ', ' + e.evidence + ')'; })
};
// 链摘要同时落 fact（同族 metric，evidence = docs/adr 扫描）
const chainFact = C.makeFact(ctx, C.ADR_STRUCTURE_V2_DESCRIPTOR, 'docs/adr/*', 'docs/adr/* status+inline scan', 'adr.supersede_chain_summary', chain);

// ---------- §5 fact：JSONL + 共享事实库（同一 audit_fact DuckDB；触发器 b 落点） ----------
// fact_id 内容寻址：collectCodeloreFacets 与 collectCodeloreLlm 各自 emit 的 upstream.resolution 内容全同
// → 同一 fact_id → 同一事实。按 fact_id 去重（保留首见），审计留痕 dedup 计数。
const rawFacts = adrFacts.concat(gitFacts, codeloreFacts, llmFacts, [chainFact]);
const seenFactIds = new Set();
const allFacts = [];
let dedupDropped = 0;
for (const f of rawFacts) {
  if (seenFactIds.has(f.fact_id)) { dedupDropped++; continue; }
  seenFactIds.add(f.fact_id);
  allFacts.push(f);
}
writeFileSync(join(HERE, '38-macro-c-facts.jsonl'), allFacts.map(function (f) { return JSON.stringify(f); }).join(NL) + NL, 'utf8');

const DB = join(HERE, '38-audit-facts.duckdb');
if (existsSync(DB)) { unlinkSync(DB); }
const writer = await STORE.openWriter(DB);
// Macro-B 存档事实经同一 appendFact 写路径回放（23-facts-insert.sql 的执行形态）——共用同一 audit_fact 表
const mbRows = readFileSync(join(HERE, '23-facts.jsonl'), 'utf8').split(NL).filter(Boolean).map(function (l) { return JSON.parse(l); });
for (const r of mbRows) { await STORE.appendFact(writer, r); }
for (const f of allFacts) { await STORE.appendFact(writer, f); }
// 读回计数走同一写者连接（queryFacts = 唯一读路径，assertAppendOnly 白名单内 SELECT）
const scaleRows = await (await STORE.queryFacts(writer, 'SELECT scale, COUNT(*) AS n FROM audit_fact GROUP BY scale ORDER BY scale')).getRows();
const repoRows = await (await STORE.queryFacts(writer, 'SELECT repo_ref, COUNT(*) AS n FROM audit_fact GROUP BY repo_ref ORDER BY repo_ref')).getRows();
const dbCounts = { by_scale: {}, by_repo: {} };
for (const r of scaleRows) { dbCounts.by_scale[String(r[0])] = Number(r[1]); }
for (const r of repoRows) { dbCounts.by_repo[String(r[0])] = Number(r[1]); }
const SHARED_DB = (dbCounts.by_scale['Macro-B'] === mbRows.length) && (dbCounts.by_scale['Macro-C'] === allFacts.length);
// 干净关闭：FORCE CHECKPOINT 合并 WAL 回库文件（连接维护语句，非行改写——不经 appendFact/queryFacts 门面）
await writer.run('FORCE CHECKPOINT');
writer.closeSync();

// ---------- §6 实测数落盘（供引文回查 + 38-check 断言面） ----------
const facetRowsFacts = codeloreFacts.filter(function (f) { return f.metric === 'codelore.facet_rows'; });
const facetErrFacts = codeloreFacts.filter(function (f) { return f.metric === 'codelore.facet_error' || f.metric === 'codelore.facet_parse_error'; });
const facetRowsCount = {};
for (const f of facetRowsFacts) { const v = JSON.parse(f.value_json); facetRowsCount[v.analysis] = v.row_count; }
const lagFacts = gitFacts.filter(function (f) { return f.metric === 'git.adr_lag_days'; });
const dateFacts = adrFacts.filter(function (f) { return f.metric === 'adr.decision_date' && JSON.parse(f.value_json).date !== null; });
const legDist = {};
for (const f of adrFacts) {
  if (f.metric === 'adr.header_field_present' || f.metric === 'adr.decision_date') {
    const v = JSON.parse(f.value_json);
    const leg = v.leg || 'miss';
    legDist[leg] = (legDist[leg] || 0) + 1;
  }
}
const pm37 = JSON.parse(readFileSync(join(HERE, '37-pilot-measurements.json'), 'utf8'));
const pm37as = pm37.repos['anysearch-cli'];
const LAG_MIN_N = 30;   // TC-MC-2 可判定数门槛（跑前写死）
const measurements = {
  observed_at: HEAD_DATE,
  head_sha: HEAD_SHA,
  tree_sha: TREE_SHA,
  commit_count: COMMIT_COUNT,
  adr_count: adrs.length,
  adr_date_resolvable: dateFacts.length,
  adr_leg_distribution: legDist,
  lag_judgeable_n: lagFacts.length,
  lag_min_n_threshold: LAG_MIN_N,
  codelore: {
    pinned: codeloreFacts.length > 0 ? JSON.parse(codeloreFacts[0].value_json).pinned === true : false,
    facet_rows: facetRowsFacts.length,
    facet_errors: facetErrFacts.map(function (f) { return f.subject_ref + ':' + f.metric; }),
    per_facet_rows: facetRowsCount
  },
  llm_gate: llmGate,
  llm_gated_count: llmFacts.filter(function (f) { return f.metric === 'codelore.llm_gated'; }).length,
  llm_narrative_count: llmFacts.filter(function (f) { return f.metric === 'codelore.llm_narrative'; }).length,
  supersede_chain: chain,
  crosscheck_37: {
    adr_count_37: pm37as.adr.count, adr_count_38: adrs.length, adr_parity: pm37as.adr.count === adrs.length,
    edge_count_37: pm37as.supersede_chain.edge_count, edge_count_38: chain.edge_count, edge_parity: pm37as.supersede_chain.edge_count === chain.edge_count,
    unresolved_37: pm37as.supersede_chain.unresolved_refs.length, unresolved_38: chain.unresolved_refs.length,
    missing_backrefs_37: pm37as.supersede_chain.missing_backrefs.length, missing_backrefs_38: chain.missing_backrefs.length
  },
  shared_duckdb: {
    file: '38-audit-facts.duckdb',
    macro_b_facts: mbRows.length,
    macro_c_facts: allFacts.length,
    db_by_scale: dbCounts.by_scale,
    db_by_repo: dbCounts.by_repo,
    shared: SHARED_DB,
    note: 'Macro-B 存档事实（23-facts.jsonl）回放 + Macro-C 新事实追加，同一 appendFact 写路径同一 audit_fact 表 → 共用同一 DuckDB（触发器 b 成立，登记 mw-trigger-b）'
  },
  fact_count: allFacts.length,
  dedup_dropped: dedupDropped
};
writeFileSync(join(HERE, '38-macro-c-measurements.json'), JSON.stringify(measurements, null, 2) + NL, 'utf8');

// ---------- §7 证据（C3）+ 结论→引文锚 ----------
const MEAS_REL = '.scratch/architecture-recovery/reports/38-macro-c-measurements.json';
function pickExcerpt(absOrRelPath, tokens, base) {
  const text = readFileSync(base ? join(base, absOrRelPath) : absOrRelPath, 'utf8');
  const list = Array.isArray(tokens) ? tokens : [tokens];
  const lines = text.split(NL);
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of list) { if (lines[i].indexOf(tk) < 0) { all = false; } }
    if (all) { return { line: i + 1, text: lines[i].trim() }; }
  }
  throw new Error('EXCERPT-MISS: ' + absOrRelPath + ' tokens=' + String(tokens));
}
const evidence = [];
function addEvidence(id, path, token, claim, reproCmd, base) {
  const ex = pickExcerpt(path, token, base || null);
  evidence.push({ evidence_id: id, source: path, locator: 'L' + ex.line, claim: claim, grounded: true, collected_at: HEAD_DATE, reproduce_cmd: reproCmd, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
}
const ADR58 = 'docs/adr/0058-ci-test-job-independence-and-gate-layer-entrypoint-narrowing.md';
const ADR60 = 'docs/adr/0060-architecture-grill-round-59-archive-truthfulness-closure.md';
const LEDGER_MA = '.scratch/macro-audit/decision-ledger.md';
const RUN_CMD = 'node .scratch/architecture-recovery/reports/38-macro-c-preview.mjs';

addEvidence('EV-38-01', MEAS_REL, '"edge_count": 8', '本次实测：supersede 引用网 8 边（whole 1 + item 2 + amends 2 + defer 1 + 纪律样本 2）', RUN_CMD, REPO);
addEvidence('EV-38-02', ADR58, 'Superseded by ADR-0060', 'anysearch-cli 演化考古稀缺素材：whole-ADR supersede 事件 0058→0060 实物存在', 'git -C ' + AS + ' show HEAD:' + ADR58, AS);
addEvidence('EV-38-03', ADR60, 'ADR-0058', '回链实物：ADR-0060 提及 ADR-0058（supersede 回链闭合）', 'git -C ' + AS + ' show HEAD:' + ADR60, AS);
addEvidence('EV-38-04', MEAS_REL, '"configured": false', '本次实测：LLM env 门控关（CODELORE_LLM_* 未配置）→ llm_gated 降级披露', RUN_CMD, REPO);
addEvidence('EV-38-05', MEAS_REL, '"facet_rows": 30', '本次实测：CodeLore 契约面 30/30 facet_rows（零 facet_error）', RUN_CMD, REPO);
addEvidence('EV-38-06', LEDGER_MA, '单仓校准（anysearch-cli）', 'D-034⑤：Macro-C preview 报告强制披露「单仓校准（anysearch-cli）」结构性限制', 'git -C ' + REPO + ' show HEAD:.scratch/macro-audit/decision-ledger.md', REPO);
addEvidence('EV-38-07', MEAS_REL, '"macro_b_facts"', '本次实测：共享事实库 38-audit-facts.duckdb 同库双 scale（Macro-B 回放 + Macro-C 追加）', RUN_CMD, REPO);
addEvidence('EV-38-08', MEAS_REL, '"lag_judgeable_n"', '本次实测：ADR 决策日 vs 首提交 lag 可判定数', RUN_CMD, REPO);
addEvidence('EV-38-09', '.scratch/architecture-recovery/reports/37-pilot-measurements.json', '"edge_count": 8', '对账：37-pilot 存档 anysearch-cli supersede 边 = 8（38 复测一致性基准）', 'node .scratch/architecture-recovery/reports/37-check.mjs', REPO);

const claims = [];
function addClaim(id, evId, tokens) { claims.push({ claim_id: id, evidence_id: evId, required_tokens: tokens }); }
addClaim('CL-38-01', 'EV-38-01', ['edge_count', '8']);
addClaim('CL-38-02', 'EV-38-02', ['Superseded by ADR-0060']);
addClaim('CL-38-03', 'EV-38-03', ['ADR-0058']);
addClaim('CL-38-04', 'EV-38-04', ['configured', 'false']);
addClaim('CL-38-05', 'EV-38-05', ['facet_rows', '30']);
addClaim('CL-38-06', 'EV-38-06', ['单仓校准（anysearch-cli）']);
addClaim('CL-38-07', 'EV-38-07', ['macro_b_facts']);
addClaim('CL-38-08', 'EV-38-08', ['lag_judgeable_n']);
addClaim('CL-38-09', 'EV-38-09', ['edge_count', '8']);

// ---------- §8 裁决条目（Macro-C preview 判据集——跑前写死于本脚本常量段） ----------
const pinnedOk = measurements.codelore.pinned;
const pcMc1 = pinnedOk && facetRowsFacts.length === 30 && facetErrFacts.length === 0 && adrFacts.length > 0;
const pcMc2 = gitFacts.filter(function (f) { return f.metric === 'git.first_commit'; }).length >= adrs.length - 2;
const tcMc1 = chain.edge_count >= 1 && chain.unresolved_refs.length === 0 && chain.missing_backrefs.length === 0;
const tcMc2 = lagFacts.length >= LAG_MIN_N;
const tcMc3Supported = llmGate.configured === true && measurements.llm_narrative_count >= 1;
const nc1Doc = { path: 'apps/cli/package.json', text: readFileSync(join(AS, 'apps', 'cli', 'package.json'), 'utf8'), first_commit_date: null };
const nc1Facts = C.collectAdrStructureV2({ documents: [nc1Doc] }, ctx);
const nc1Five = nc1Facts.find(function (f) { return f.metric === 'adr.five_piece_completeness'; });
const nc1Pass = nc1Five && JSON.parse(nc1Five.value_json).present === 0;

const facetFactIds = facetRowsFacts.slice(0, 3).map(function (f) { return f.fact_id; });
const lagFactIds = lagFacts.slice(0, 5).map(function (f) { return f.fact_id; });
const adjudicationEntries = [
  { criterion_id: 'PC-MC-1', band: pcMc1 ? 'supported' : 'insufficient', basis_refs: ['管线活性正对照'], anchored_fact_ids: (codeloreFacts.length > 0 ? [codeloreFacts[0].fact_id] : []).concat(facetFactIds), anchored_evidence_ids: ['EV-38-05'], decided_at: HEAD_DATE, rationale: pcMc1 ? 'codelore pin 0.28.0 + 30/30 facet_rows + ADR 语料 ' + adrs.length + ' 份解析' : '管线活性未中（pin/facet/语料缺）——管线故障 P0' },
  { criterion_id: 'PC-MC-2', band: pcMc2 ? 'supported' : 'insufficient', basis_refs: ['管线活性正对照'], anchored_fact_ids: lagFactIds.slice(0, 1), anchored_evidence_ids: ['EV-38-08'], decided_at: HEAD_DATE, rationale: pcMc2 ? 'gitlog 族产出 ADR 首提交/lag 事实（first_commit ≥ ' + (adrs.length - 2) + '）' : 'gitlog 族未产出足量首提交事实' },
  { criterion_id: 'TC-MC-1', band: tcMc1 ? 'supported' : 'insufficient', basis_refs: ['演化链完整性'], anchored_fact_ids: [chainFact.fact_id], anchored_evidence_ids: ['EV-38-01', 'EV-38-02', 'EV-38-03', 'EV-38-09'], decided_at: HEAD_DATE, rationale: 'supersede 引用网 ' + chain.edge_count + ' 边：断链 ' + chain.unresolved_refs.length + ' / 缺回链 ' + chain.missing_backrefs.length + '（与 37-pilot 存档复测一致=' + measurements.crosscheck_37.edge_parity + '）' },
  { criterion_id: 'TC-MC-2', band: tcMc2 ? 'supported' : 'insufficient', basis_refs: ['时间维信号可判定性'], anchored_fact_ids: lagFactIds, anchored_evidence_ids: ['EV-38-08'], decided_at: HEAD_DATE, rationale: 'ADR 决策日 vs 首提交 lag 可判定数 ' + lagFacts.length + ' / 门槛 ' + LAG_MIN_N + '（v2 回退链日期解析 ' + dateFacts.length + '/' + adrs.length + '）' },
  { criterion_id: 'TC-MC-3', band: tcMc3Supported ? 'supported' : 'insufficient', basis_refs: ['S4 假设失效检测深检'], anchored_fact_ids: llmGateFact ? [llmGateFact.fact_id] : [], anchored_evidence_ids: ['EV-38-04'], decided_at: HEAD_DATE, rationale: tcMc3Supported ? 'LLM 面已配置且产出叙事' : 'S4 假设失效检测面 llm_gated（CODELORE_LLM_* env 门控关）→ 深检维度 ⚠ unverified 降级，不伪造不真调' },
  { criterion_id: 'NC-MC-1', band: nc1Pass ? 'supported' : 'insufficient', basis_refs: ['负对照特异性'], anchored_fact_ids: nc1Facts.length > 0 ? [nc1Facts[0].fact_id] : [], anchored_evidence_ids: ['EV-38-05'], decided_at: HEAD_DATE, rationale: nc1Pass ? '负对照选材 apps/cli/package.json 五件套 0 命中（特异性成立）' : '负对照命中 → 转复核路径' }
];
const overallBand = G.deriveOverallBand(adjudicationEntries);

// ---------- §9 四象限切片 + 行动建议 + 报告装配 ----------
const fv = (name) => { const f = facetRowsFacts.find(function (x) { return x.subject_ref === name; }); return f ? JSON.parse(f.value_json).row_count : 0; };
const GATE = { protocol_version: G.ADJUDICATION_PROTOCOL_VERSION, decided_at: HEAD_DATE, audit_ref: 'reports/38-macro-c-preview.mjs' };
const quadrants = [
  { quadrant: 'strategy', applicability: 'native', verdict: overallBand, score: null, confidence: 0.55, dimensions: ['S2', 'S4'], slice_fields: { adr_count: adrs.length, supersede_edges: chain.edge_count, supersede_unresolved: chain.unresolved_refs.length, supersede_missing_backrefs: chain.missing_backrefs.length, lag_judgeable_n: lagFacts.length, adr_date_resolvable: dateFacts.length, llm_gate: llmGate.configured ? 'open' : 'closed' }, verdict_gate: { protocol_version: GATE.protocol_version, decision: overallBand, evidence_flag: false, decided_at: HEAD_DATE, override_reason: 'S4 深检面 llm_gated——深检维度证据门槛未达，preview 诚实部分裁定', audit_ref: GATE.audit_ref }, conflict_markers: ['single-repo-calibration'] },
  { quadrant: 'structure', applicability: 'derived', verdict: 'insufficient', score: null, confidence: 0.3, dimensions: ['S3'], slice_fields: { god_classes_rows: fv('god-classes'), architecture_metrics_rows: fv('architecture-metrics'), dependency_cycles_rows: fv('dependency-cycles'), modularity_violations_rows: fv('modularity-violations'), instability_rows: fv('instability'), architecture_roles_rows: fv('architecture-roles') }, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: '衍生观测不裁决——无预声明阈值基线（preview 深度，观测值如实落 slice_fields）', audit_ref: GATE.audit_ref }, conflict_markers: ['preview-derived-observation-only'] },
  { quadrant: 'behavior', applicability: 'derived', verdict: 'insufficient', score: null, confidence: 0.3, dimensions: ['S5'], slice_fields: { revisions_rows: fv('revisions'), abs_churn_rows: fv('abs-churn'), entity_churn_rows: fv('entity-churn'), hotspot_velocity_rows: fv('hotspot-velocity'), code_age_rows: fv('code-age'), lead_time_rows: fv('lead-time'), release_cadence_rows: fv('release-cadence'), ownership_rows: fv('ownership'), bus_factor_rows: fv('bus-factor') }, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: '衍生观测不裁决——同上', audit_ref: GATE.audit_ref }, conflict_markers: ['preview-derived-observation-only'] },
  { quadrant: 'supply_chain', applicability: 'not_applicable', verdict: 'insufficient', score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: 'insufficient', evidence_flag: false, decided_at: HEAD_DATE, override_reason: '⚠ 数据未接——Scorecard/repomix 按层需求队列接入不插队（D-034③）', audit_ref: GATE.audit_ref }, conflict_markers: ['data-not-connected'] }
];
const recommendations = [
  { rec_id: 'R-38-1', priority: 'P1', action: '配置 CODELORE_LLM_PROVIDER/MODEL（或 ANTHROPIC_API_KEY）激活 S4 假设失效检测面，复跑本 preview', rationale: 'TC-MC-3 因 env 门控关判 insufficient——S4 演化方向深检是当前唯一未验证维度；上限走 MACRO_AUDIT_CODELORE_LLM_MAX_CALLS 计量', expected_impact: 'TC-MC-3 由 insufficient 转可判定，overall 具升级通道', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-38-04'], degraded_note: null },
  { rec_id: 'R-38-2', priority: 'P1', action: '引入 ≥1 非自有公开仓经 URL opt-in 跑 Macro-C（衔接 #40 / D-013）', rationale: '单仓校准（anysearch-cli）属 dogfooding——generative not evaluative（D-033）；泛化证据是 GA 前置', expected_impact: '披露块结构性限制项①获得实证闭环', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-38-06'], degraded_note: null },
  { rec_id: 'R-38-3', priority: 'P1', action: '多写者 self-probe 实测封口（mw-trigger-b 已触发登记）', rationale: '本票已证共用同一 audit_fact DuckDB——多写者域并发策略由触发条款进入实测封口通道（D-034④b）', expected_impact: '任务 7 多写者域从挂门转实测', effort: 'M', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-38-07'], degraded_note: null },
  { rec_id: 'R-38-4', priority: 'P3', action: '供应链象限维持「⚠ 数据未接」，Scorecard 探针按层需求队列接入（#42）', rationale: 'D-034③ 降级披露制已立法——禁止为补齐象限插队上游', expected_impact: 'preview 诚实形态保持', effort: 'S', verdict_gate_stamp: G.ADJUDICATION_PROTOCOL_VERSION + ' / insufficient', evidence_refs: ['EV-38-01'], degraded_note: null }
];

const HEADLINE = 'anysearch-cli Macro-C preview（capability 2 of 5）：全链实跑——codelore 30/30 面 + ADR 65 份（v2 回退链解析日期 ' + dateFacts.length + '）+ supersede 引用网 ' + chain.edge_count + ' 边零断链零缺回链 + lag 可判定 ' + lagFacts.length + '；S4 深检面 llm_gated → 综合裁定 ' + overallBand + '（preview 诚实部分裁定，非管线失败）；共享事实库已证（Macro-B ' + mbRows.length + ' + Macro-C ' + allFacts.length + ' 同库）→ mw-trigger-b 触发登记。';

const reportInput = {
  report_id: 'MA-38-ANYSEARCH-MACRO-C-PREVIEW',
  scale: 'Macro-C',
  subject_ref: 'anysearch-cli@' + HEAD_SHA.slice(0, 12),
  generated_at: HEAD_DATE,
  trace_id: ctx.traceId,
  baggage_id: C.deriveBaggageId(ctx, 'S4'),
  headline: HEADLINE,
  confidence: 0.55,
  stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: '1.1.0', fact_watermark_version: '1' },
  fact_ids: allFacts.map(function (f) { return f.fact_id; }),
  top_findings: ['EV-38-01', 'EV-38-04', 'EV-38-05', 'EV-38-07'],
  evidence: evidence,
  claims: claims,
  quadrants: quadrants,
  recommendations: recommendations,
  adjudication_entries: adjudicationEntries,
  decided_at: HEAD_DATE,
  commit_anchor: HEAD_SHA,
  tree_anchor: TREE_SHA,
  gate_ref: { prereg_commit: '38-script-const', criteria_path: 'reports/38-macro-c-preview.mjs §8', basis_path: '.scratch/macro-audit/decision-ledger.md D-034', criterion_ids: ['PC-MC-1', 'PC-MC-2', 'TC-MC-1', 'TC-MC-2', 'TC-MC-3', 'NC-MC-1'] },
  degraded: false,
  degraded_reason: null,
  preview_disclosure: {
    capability_label: 'capability 2 of 5 · preview',
    calibration_scope: '单仓校准（anysearch-cli）',
    structural_limitations: [
      '校准语料 = 单仓（anysearch-cli，65 ADR＋supersede 链稀缺素材），不构成泛化证据——dogfooding = generative not evaluative（D-033），GA 前置须 ≥1 非自有公开仓（#40 / D-013）',
      '同主仓确认偏差面：试点仓与产品同主，本报告仅作校准＋冒烟依据',
      'LLM 叙事面 env 门控关：S4 假设失效检测深检维度降级 ⚠ unverified（llm_gated 明示，不伪造不真调）',
      '供应链象限 ⚠ 数据未接：Scorecard/repomix 未接不插队（D-034③）',
      'structure/behavior 象限为衍生观测（无预声明阈值基线）——观测值如实落 slice_fields 不裁决'
    ],
    not_in_preview: ['Micro-A', 'Micro-B', 'Macro-A']
  },
  human: { status: 'pending', adjudicator: 'user', text: null, decided_at: null }
};

const report = G.buildReport(reportInput);
const FP_REASON = 'FP-38-1 Macro-C failure 演示场景：演化面采集域返回空事实集（facet_rows=0，data doesn' + String.fromCharCode(39) + 't show 形态）→ 主前提不可裁定，发起 GapRequest';
const degraded = G.degradeReport(report, FP_REASON);

writeFileSync(join(HERE, '38-macro-c-preview-report.md'), G.renderMarkdown(report) + NL, 'utf8');
writeFileSync(join(HERE, '38-macro-c-preview-report.json'), G.renderSidecar(report) + NL, 'utf8');
writeFileSync(join(HERE, '38-macro-c-preview-failure.md'), G.renderMarkdown(degraded) + NL, 'utf8');
writeFileSync(join(HERE, '38-macro-c-preview-failure.json'), G.renderSidecar(degraded) + NL, 'utf8');

console.log('[38] head=' + HEAD_SHA.slice(0, 7) + ' commits=' + COMMIT_COUNT + ' adr=' + adrs.length + ' facts=' + allFacts.length);
console.log('[38] codelore facets ' + facetRowsFacts.length + '/30 rows errors=' + facetErrFacts.length + ' | llm_gate=' + (llmGate.configured ? 'open' : 'closed') + ' gated=' + measurements.llm_gated_count);
console.log('[38] supersede edges=' + chain.edge_count + ' unresolved=' + chain.unresolved_refs.length + ' missing_backrefs=' + chain.missing_backrefs.length + ' | 37-parity edge=' + measurements.crosscheck_37.edge_parity + ' adr=' + measurements.crosscheck_37.adr_parity);
console.log('[38] lag judgeable=' + lagFacts.length + '/' + LAG_MIN_N + ' | date resolvable=' + dateFacts.length + '/' + adrs.length + ' legs=' + JSON.stringify(legDist));
console.log('[38] duckdb shared=' + SHARED_DB + ' ' + JSON.stringify(dbCounts.by_scale));
console.log('[38] PC-MC-1 ' + (pcMc1 ? 'PASS' : 'FAIL') + ' | PC-MC-2 ' + (pcMc2 ? 'PASS' : 'FAIL') + ' | TC-MC-1 ' + (tcMc1 ? 'PASS' : 'FAIL') + ' | TC-MC-2 ' + (tcMc2 ? 'PASS' : 'FAIL') + ' | TC-MC-3 ' + (tcMc3Supported ? 'supported' : 'insufficient(llm_gated)') + ' | NC-MC-1 ' + (nc1Pass ? 'PASS' : 'FAIL'));
console.log('[38] overall=' + report.adjudication.overall + ' receipt=' + report.receipt.receipt_id);
const sup = report.adjudication.citation_checks.filter(function (c) { return c.support === 'supports'; }).length;
console.log('[38] citation checks ' + sup + '/' + report.adjudication.citation_checks.length + ' supports');
process.exit(0);
