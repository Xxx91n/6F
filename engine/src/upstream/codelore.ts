// ---------- 上游适配器：CodeLore（ADR-0014 / D-020 双轨制主线） ----------
// 反腐层纪律：本文件只做「进程调用 + 原始输出解析」——退出码、字节解析、pin 校验在此；
// 业务规则（判据/阈值/裁决）禁止进入本层；上游 raw 语义不出本层（以结构化 fact 传出）。
// 运行时解析策略 = 二进制发现（binary discovery）：codelore 经 PATH 解析 + --version 校验 pin。

import { spawnSync } from 'node:child_process';
import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
import { makeFact } from '../collect/collectors.js';
import { lstatSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { normalizeSubjectPath, detectCaseOnlyConflicts } from '../fact/subject.js';

export const CODELORE_ADAPTER_ID = 'codelore-adapter@v1';
export const CODELORE_FAMILY = 'upstream-codelore';
export const CODELORE_PINNED_VERSION = '0.28.0';

export const CODELORE_DESCRIPTOR: CollectorDescriptor = {
  id: CODELORE_ADAPTER_ID,
  family: CODELORE_FAMILY,
  dimension: null, // 防腐层故意留白（ADR-0014）——维度映射见 docs/upstream-dimension-map.md（D-078）
  quadrant: 'strategic'
};

export interface CodeloreResolution {
  strategy: 'binary-discovery';
  binary: string;
  version: string | null;
  pinned: boolean;
  error: string | null;
}

export function resolveCodelore(binary: string): CodeloreResolution {
  const bin = binary || 'codelore';
  const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    return { strategy: 'binary-discovery', binary: bin, version: null, pinned: false, error: String(r.error || ('exit ' + r.status)) };
  }
  const m = (r.stdout || '').match(/codelore\s+(\d+\.\d+\.\d+)/i);
  const version = m ? m[1] : null;
  return { strategy: 'binary-discovery', binary: bin, version: version, pinned: version === CODELORE_PINNED_VERSION, error: version ? null : 'version-parse-failed' };
}

function pushResolutionFact(out: CollectedFact[], ctx: CollectContext, res: CodeloreResolution): void {
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'codelore', 'codelore', 'upstream.resolution', {
    strategy: res.strategy,
    binary: res.binary,
    version: res.version,
    pinned_version: CODELORE_PINNED_VERSION,
    pinned: res.pinned,
    error: res.error
  }));
}

export interface ExplainDossier {
  sections: Record<string, Record<string, string>>;
}

// `codelore explain <file>` 的确定性输出 = INI 式 [section] + key = value 行。
export function parseExplainDossier(text: string): ExplainDossier {
  const sections: Record<string, Record<string, string>> = {};
  let cur: string | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { cur = sec[1]; sections[cur] = sections[cur] || {}; continue; }
    const kv = line.match(/^([A-Za-z0-9_][A-Za-z0-9_.]*)\s*=\s*(.*)$/);
    if (kv && cur) { sections[cur][kv[1]] = kv[2].trim(); }
  }
  return { sections };
}

export interface SummaryMetric { metric: string; value: number }

export function parseSummaryJson(text: string): SummaryMetric[] {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) { throw new Error('summary output is not an array'); }
  for (const m of arr) {
    if (typeof m.metric !== 'string' || typeof m.value !== 'number') {
      throw new Error('summary row shape drift: expected {metric:string,value:number}');
    }
  }
  return arr;
}

function runText(binary: string, args: readonly string[], cwd: string): { ok: boolean; stdout: string; stderr: string; status: number | null } {
  const r = spawnSync(binary, args as string[], { cwd: cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: !r.error && r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

export interface CodeloreProbeInput {
  repoRoot: string;
  explainPaths: readonly string[];
  binary?: string;
}

export function collectCodeloreFacts(input: CodeloreProbeInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const res = resolveCodelore(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) { return out; }

  const sum = runText(bin, ['analyze', '--analysis', 'summary', '--format', 'json', '--repo', input.repoRoot], input.repoRoot);
  if (sum.ok) {
    for (const m of parseSummaryJson(sum.stdout)) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary --format json', 'codelore.summary_metric', {
        metric: m.metric,
        value: m.value
      }));
    }
  } else {
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary', 'codelore.summary_error', {
      status: sum.status,
      stderr_tail: sum.stderr.slice(-400)
    }));
  }

  for (const p of input.explainPaths) {
    const pn = normalizeSubjectPath(p);   // 归一单点：file subject 事实统一规范化形（D-125①）
    if (!pn.ok) {
      out.push(makeFact({ runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt }, CODELORE_DESCRIPTOR, 'explain', 'codelore explain', 'codelore.file_subject_skip', { raw_path: p, reason: pn.reason }));
      continue;
    }
    const ex = runText(bin, ['explain', p, '--repo', input.repoRoot], input.repoRoot);
    if (!ex.ok) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, pn.subject as string, 'codelore explain', 'codelore.explain_error', {
        status: ex.status,
        stderr_tail: ex.stderr.slice(-400)
      }));
      continue;
    }
    const d = parseExplainDossier(ex.stdout);
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, pn.subject as string, 'codelore explain ' + p, 'codelore.file_dossier', {
      path: pn.subject,
      sections: Object.keys(d.sections),
      dossier: d.sections
    }));
  }
  return out;
}

// ---------- 首批契约面（#35 / A-040 / D-035①）：逐面 golden 契约 ----------
// 面集 = 演化主干 12 + s3 族 6 + s5 族 12（族名=代码 group tag 拼写；维度归位映射见 docs/upstream-dimension-map.md）；面名以 `codelore analyze --help` 实物枚举对账（reports/35-facet-reconciliation.json）。
// LLM 面（explain 族 env 门控）不混入，归 #36 独立票；暂缓面集 ~20 面挂 registry manual_watch（D-035④）。
// 本层仍只做「进程调用 + 原始输出解析」：冻结 argv 属契约钉死（可观察输出即契约），任何判据/评级语义不进本层。

export type CodeloreFacetGroup = 'evolution' | 's3' | 's5' | 'behavior';

export interface CodeloreFacetSpec {
  analysis: string;
  group: CodeloreFacetGroup;
  extraArgs: readonly string[];
}

// code-age 冻结参考时钟（--age-time-now）使重放可复现；messages 冻结检索表达式（契约 = argv 全体）。
export const CODELORE_BATCH1_FACETS: readonly CodeloreFacetSpec[] = [
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

// ---------- 行为面（#51 / A-058 / D-054）：Macro-B behavior 象限切片 ----------
// churn/hotspot/change-coupling 三族的最小行为集（2026-09-16 实物跑 codelore analyze 确认 schema，
// reports/51-behavior-schema.json 留痕）：
//   hotspots          → {path, revisions, cognitive, cognitive_health, hotspot_score, mi, mi_rank, ai_pct, hotspot_score_anchored}
//   coupling          → {entity_a, entity_b, shared, revs_a, revs_b, average_revs, degree, fisher_p}
//   function-hotspots → {path, function(name@lines), revs, cognitive, cognitive_health, function_hotspot_score}
// 暂缓面：function-coupling 需 --target <path> 参数（按实体逐个跑，非全仓扫描形）——登记为 deferred face；
//   另有 clone-coupling/sarif 形态、effort-exposure/delivery-* 族归后续面集扩展票（registry codelore-deferred-faces 缓）。
// quadrant 归位规则（D-054③）：fact.quadrant=collector 声明域（strategic/codelore 族 provenance），
//   报告象限归属=切片决策——Macro-B behavior QuadrantEntry 消费本面集事实即归位，facts 不被改写。
export const CODELORE_BEHAVIOR_FACETS: readonly CodeloreFacetSpec[] = [
  { analysis: 'hotspots', group: 'behavior', extraArgs: [] },
  { analysis: 'coupling', group: 'behavior', extraArgs: [] },
  { analysis: 'function-hotspots', group: 'behavior', extraArgs: [] }
];

export interface CodeloreAnalysisRun {
  ok: boolean;
  status: number | null;
  stdout: string;
  stderrTail: string;
}

// 同一 argv 构建器供运行与 evidence 共用——防两处表达漂移（审计 W7 判定项）。
export function codeloreAnalysisArgs(spec: CodeloreFacetSpec, repoRoot: string): string[] {
  return ['analyze', '--analysis', spec.analysis, '--format', 'json', '--repo', repoRoot].concat(spec.extraArgs as string[]);
}

export function runCodeloreAnalysis(binary: string, spec: CodeloreFacetSpec, repoRoot: string): CodeloreAnalysisRun {
  const r = runText(binary, codeloreAnalysisArgs(spec, repoRoot), repoRoot);
  return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}

export type CodeloreRow = Record<string, unknown>;

// analyze --format json 的确定性输出 = 对象行数组；形状漂移（非数组/非对象行）直接抛错，不出假阳性。
export function parseJsonRows(text: string): CodeloreRow[] {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) { throw new Error('analysis output is not an array'); }
  for (const row of arr) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('analysis row shape drift: expected plain object row');
    }
  }
  return arr as CodeloreRow[];
}

export function facetColumns(rows: readonly CodeloreRow[]): string[] {
  return rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];
}

export type CodeloreAnalysisRunner = (binary: string, spec: CodeloreFacetSpec, repoRoot: string) => CodeloreAnalysisRun;
export type CodeloreResolver = (binary: string) => CodeloreResolution;

export interface CodeloreFacetsInput {
  repoRoot: string;
  facets?: readonly CodeloreFacetSpec[];
  binary?: string;
  runner?: CodeloreAnalysisRunner;
  resolver?: CodeloreResolver;
  subjectProbe?: SubjectPathProbe;   // 注入缝：默认 defaultSubjectPathProbe（fs 实探）；测试注入假探针
}

// 逐面采集：每面一条 codelore.facet_rows 事实（列清单 + 行数 + 结构化行原样传出）；
// 失败面降级为 codelore.facet_error / codelore.facet_parse_error，不中断其余面。
export function collectCodeloreFacets(input: CodeloreFacetsInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const resolve = input.resolver || resolveCodelore;
  const runner = input.runner || runCodeloreAnalysis;
  const res = resolve(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) { return out; }

  const facets = input.facets || CODELORE_BATCH1_FACETS;
  const emittedSubjects: string[] = [];
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
    let rows: CodeloreRow[];
    try {
      rows = parseJsonRows(run.stdout);
    } catch (e) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.facet_parse_error', {
        analysis: spec.analysis,
        group: spec.group,
        message: String((e as Error).message)
      }));
      continue;
    }
    // facet_rows 聚合载荷降 raw 证据位（D-124②）：append-only 保留＋role=raw_evidence 标记，
    //   不进文件卡查询主路径，供重建/争议仲裁/面级历史对照（quarantine raw_bytes D-117 同族）。
    const emitStat = emitPerFileFacts(rows, spec, evidence, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt }, input.repoRoot, input.subjectProbe || defaultSubjectPathProbe, out);
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
  // case-only 冲突检测+告警（D-125① 禁大小写折叠——Windows 宿主分裂脑镜像检测路径）：
  //   同 run 发射的规范化 subject 按 lower 分桶，同桶多字面=真实不同文件，显式告警事实不折叠。
  const conflicts = detectCaseOnlyConflicts(emittedSubjects);
  if (conflicts.pairs.length > 0) {
    out.push(makeFact({ runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt }, CODELORE_DESCRIPTOR, 'codelore', 'subject-normalizer', 'codelore.subject_case_conflict', {
      pairs: conflicts.pairs,
      host_platform: process.platform,
      note: 'case-only 冲突=真实不同文件保留字面不折叠（CVE-2021-21300 先例）；大小写不敏感文件系统上 checkout 互覆风险——宿主侧告警消费位'
    }));
  }
  return out;
}

// ---------- per-file 一等事实发射（#80 步① / D-124 / D-125 / ADR-0023） ----------
// subject 归一单点=本发射边界：行对象 path/entity 字段经 normalizeSubjectPath 规范化（SCIP 五规则+NFC）。
// 文件粒度行字段=path/entity（实物钉：entity 字段值=仓内相对路径，35-check cassette 实证）；
//   entity_a/entity_b=成对端点行（coupling/modularity-violations 族）→双端各发一条 per-path-face 行对象（peer 互指）；
//   非文件粒度行（date/rev/author/module/metric 等）驻聚合层不发射——grain 诚实不硬凑。
// symlink 细则（D-125①）：lstat 判 symlink→realpath 解析须落仓内 regular file；
//   跨仓/悬空/非文件=跳过披露；工作树缺席路径（历史实体/已删文件）=合法 git 身份照发不探活。
export type SubjectPathKind = 'file' | 'symlink' | 'missing' | 'other';
export interface SubjectPathProbeResult { kind: SubjectPathKind; resolved?: string }
export type SubjectPathProbe = (repoRoot: string, relPath: string) => SubjectPathProbeResult;

export function defaultSubjectPathProbe(repoRoot: string, relPath: string): SubjectPathProbeResult {
  const abs = join(repoRoot, relPath);
  try {
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) {
      let real: string;
      try { real = realpathSync(abs); } catch { return { kind: 'other' }; }
      const rel = relative(repoRoot, real).split(String.fromCharCode(92)).join('/');
      if (rel.indexOf('..') === 0 || rel.length === 0 || /^[A-Za-z]:/.test(rel)) { return { kind: 'other' }; }
      if (!lstatSync(real).isFile()) { return { kind: 'other' }; }
      return { kind: 'symlink', resolved: rel };
    }
    if (st.isFile()) { return { kind: 'file' }; }
    return { kind: 'other' };
  } catch {
    return { kind: 'missing' };   // 工作树缺席=历史实体路径（git 身份合法照发，D-125① regular-file 仅就可判定者）
  }
}

const FILE_SUBJECT_KEYS: readonly string[] = ['path', 'entity'];

interface ResolvedRowSubject { subject: string | null; via: string | null; reason: string | null }

function resolveRowSubject(repoRoot: string, rawPath: string, probe: SubjectPathProbe): ResolvedRowSubject {
  const n = normalizeSubjectPath(rawPath);
  if (!n.ok) { return { subject: null, via: null, reason: n.reason }; }
  const pr = probe(repoRoot, n.subject as string);
  if (pr.kind === 'file' || pr.kind === 'missing') { return { subject: n.subject, via: null, reason: null }; }
  if (pr.kind === 'symlink' && pr.resolved) {
    const rn = normalizeSubjectPath(pr.resolved);
    if (rn.ok) { return { subject: rn.subject, via: 'symlink', reason: null }; }
    return { subject: null, via: null, reason: 'symlink-resolved-' + String(rn.reason) };
  }
  return { subject: null, via: null, reason: pr.kind === 'symlink' ? 'symlink-unresolved' : 'non-regular-path' };
}

function pushFileSubjectSkip(out: CollectedFact[], ctx: CollectContext, spec: CodeloreFacetSpec, evidence: string, rawPath: string, reason: string | null): void {
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, 'codelore.file_subject_skip', {
    analysis: spec.analysis,
    group: spec.group,
    raw_path: rawPath,
    reason: reason
  }));
}

// 逐行发射：subject_ref=<规范化 path>，value_json=per-path-face 行对象（SonarQube per-component JSON_VALUE 先例——D-124⑥）。
// 返回发射的规范化 subject 清单（供 case-only 冲突检测）与发射计数。
export function emitPerFileFacts(
  rows: readonly CodeloreRow[],
  spec: CodeloreFacetSpec,
  evidence: string,
  ctx: CollectContext,
  repoRoot: string,
  probe: SubjectPathProbe,
  out: CollectedFact[]
): { emitted: number; subjects: string[] } {
  const seen = new Set<string>();
  const subjects: string[] = [];
  let emitted = 0;
  const pushRow = function (subject: string, via: string | null, row: CodeloreRow, peer: string | null): void {
    const value: Record<string, unknown> = { analysis: spec.analysis, group: spec.group, role: 'first_class', row: row };
    if (peer !== null) { value.entity = subject; value.peer = peer; }
    else { value.path = subject; }
    if (via !== null) { value.via = via; }
    const f = makeFact(ctx, CODELORE_DESCRIPTOR, subject, evidence, 'codelore.file_facet_row', value);
    if (seen.has(f.fact_id)) { return; }
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
      if (ra.subject === null) { pushFileSubjectSkip(out, ctx, spec, evidence, ea, ra.reason); continue; }
      if (rb.subject === null) { pushFileSubjectSkip(out, ctx, spec, evidence, eb, rb.reason); continue; }
      pushRow(ra.subject, ra.via, row, rb.subject);
      pushRow(rb.subject, rb.via, row, ra.subject);
      continue;
    }
    let sv: string | null = null;
    for (const k of FILE_SUBJECT_KEYS) {
      const v = row[k];
      if (typeof v === 'string' && v.length > 0) { sv = v; break; }
    }
    if (sv === null) { continue; }
    const r = resolveRowSubject(repoRoot, sv, probe);
    if (r.subject === null) { pushFileSubjectSkip(out, ctx, spec, evidence, sv, r.reason); continue; }
    pushRow(r.subject, r.via, row, null);
  }
  return { emitted: emitted, subjects: subjects };
}

// ---------- Macro-B behavior 消费面迁移件（D-124③ / 对照期对账判据=BbA 双实现先例） ----------
// per-file 重聚合：file_facet_row 事实按 analysis 归组、row 内容去重（成对行双端各一 fact→还原对行）；
// 对账判据=聚合载荷↔per-file 重算多重集相等（行 JSON 排序比较——同 run 同解析源故恒等，对账钉防未来漂移）。
export function reaggregateFileFacetRows(facts: readonly CollectedFact[]): Record<string, CodeloreRow[]> {
  const byFace: Record<string, CodeloreRow[]> = {};
  const seen: Record<string, Set<string>> = {};
  for (const f of facts) {
    if (f.metric !== 'codelore.file_facet_row') { continue; }
    const v = JSON.parse(f.value_json) as Record<string, unknown>;
    const a = String(v.analysis);
    const key = JSON.stringify(v.row);
    if (!byFace[a]) { byFace[a] = []; seen[a] = new Set<string>(); }
    if (!seen[a].has(key)) { seen[a].add(key); byFace[a].push(v.row as CodeloreRow); }
  }
  return byFace;
}

export interface FacetReconciliation { match: boolean; per_analysis: Record<string, { file_bearing: number; skipped: number; per_file: number; match: boolean }> }

// 对账判据（D-124③ / BbA 双实现先例）：per-file 重算多重集 == file-bearing 聚合行 − skipped 原始路径行。
//   file-bearing=行含 path/entity 或 entity_a+entity_b（同发射规则同源判定——重复判定逻辑=对账本身失效）；
//   skip 事实枚举未发射行的 raw_path；非文件粒度行（date/rev/author/module 等）天然不入比对面。
export function reconcilePerFileVsAggregate(facts: readonly CollectedFact[]): FacetReconciliation {
  const perFile = reaggregateFileFacetRows(facts);
  const canon = function (rows: readonly CodeloreRow[]): string { return rows.map(function (r) { return JSON.stringify(r); }).sort().join(String.fromCharCode(10)); };
  const isFileBearing = function (r: CodeloreRow): boolean {
    if (typeof r['entity_a'] === 'string' && typeof r['entity_b'] === 'string') { return true; }
    for (const k of FILE_SUBJECT_KEYS) { if (typeof r[k] === 'string' && (r[k] as string).length > 0) { return true; } }
    return false;
  };
  const rowRawPath = function (r: CodeloreRow): string | null {
    for (const k of FILE_SUBJECT_KEYS) { const v = r[k]; if (typeof v === 'string' && v.length > 0) { return v; } }
    const ea = r['entity_a'];
    return typeof ea === 'string' ? ea : null;
  };
  const skippedByFace: Record<string, Set<string>> = {};
  for (const f of facts) {
    if (f.metric !== 'codelore.file_subject_skip') { continue; }
    const v = JSON.parse(f.value_json) as Record<string, unknown>;
    const a = String(v.analysis);
    if (!skippedByFace[a]) { skippedByFace[a] = new Set<string>(); }
    skippedByFace[a].add(String(v.raw_path));
  }
  const per: Record<string, { file_bearing: number; skipped: number; per_file: number; match: boolean }> = {};
  let all = true;
  for (const f of facts) {
    if (f.metric !== 'codelore.facet_rows') { continue; }
    const v = JSON.parse(f.value_json) as Record<string, unknown>;
    const a = String(v.analysis);
    const aggRows = (v.rows || []) as CodeloreRow[];
    const skip = skippedByFace[a] || new Set<string>();
    const expected = aggRows.filter(function (r) {
      if (!isFileBearing(r)) { return false; }
      const rp = rowRawPath(r);
      if (rp !== null && skip.has(rp)) { return false; }
      if (typeof r['entity_a'] === 'string' && typeof r['entity_b'] === 'string' && (skip.has(String(r['entity_a'])) || skip.has(String(r['entity_b'])))) { return false; }
      return true;
    });
    const pf = perFile[a] || [];
    const fileBearing = aggRows.filter(isFileBearing).length;
    const m = canon(expected) === canon(pf);
    per[a] = { file_bearing: fileBearing, skipped: skip.size, per_file: pf.length, match: m };
    if (!m) { all = false; }
  }
  return { match: all, per_analysis: per };
}

// ---------- LLM 门控面（#36 / A-041 / D-035②）：explain 族 env 门控 + 成本计量 ----------
// 面名以实物枚举为准（reports/36-explain-help.txt / 36-diff-help.txt / 36-explain-topics.txt）：
// analyze 枚举内无 explain-* 面（如实登记）；LLM 面 = `explain <path> --llm`（文件 dossier 附加 advisory 叙事）
// 与 `diff <range> --llm`（PR delta 叙事），另有 MCP explain_file（不同传输形态，登记 deferred）。
// 门控语义（上游 --help 原文 + 二进制字符串实证，0.28.0）：LLM 端点经 CODELORE_LLM_* 环境族配置，
// local-first 缺省（openai-compat 默认指向 http://localhost:11434/v1）；未配置 = 面不可用。
// 本层纪律不变：只读 env「是否配置」，env 值（尤其 key）永不进 fact；门控关 = 显式 llm_gated 披露
// fact，不静默失败、不调上游 --llm、不抛异常中断其余采集。

export const CODELORE_LLM_ENV_VARS: readonly string[] = [
  'CODELORE_LLM_PROVIDER',
  'CODELORE_LLM_BASE_URL',
  'CODELORE_LLM_API_KEY',
  'CODELORE_LLM_MODEL',
  'ANTHROPIC_API_KEY'
];

// 调用上限环境变量属本适配器自有命名空间（不占上游 CODELORE_LLM_* 族，防语义冲突）；
// 上限是资源护栏而非业务判据——超限只触发降级披露，不产生判定语义。
export const CODELORE_LLM_CALL_CAP_ENV = 'MACRO_AUDIT_CODELORE_LLM_MAX_CALLS';
export const CODELORE_LLM_DEFAULT_CALL_CAP = 20;

export interface CodeloreLlmGate {
  env_family: string;
  provider: 'anthropic' | 'openai-compat' | null;
  configured: boolean;
  missing_env: string[];
  reason: 'ok' | 'missing-env' | 'unknown-provider';
}

// 门控判读（与上游错误信息对账：'Anthropic provider selected but ANTHROPIC_API_KEY is not set' /
// 'OpenAI-compatible provider requires a model' / 'unknown CODELORE_LLM_PROVIDER'）：
// 显式 PROVIDER 优先；无显式时 ANTHROPIC_API_KEY 在 → anthropic；否则 local-first 缺省 openai-compat。
export function resolveLlmGate(env: Readonly<Record<string, string | undefined>>): CodeloreLlmGate {
  const has = (k: string) => typeof env[k] === 'string' && (env[k] as string).trim().length > 0;
  const explicit = has('CODELORE_LLM_PROVIDER') ? (env.CODELORE_LLM_PROVIDER as string).trim() : null;
  let provider: CodeloreLlmGate['provider'];
  let reason: CodeloreLlmGate['reason'] = 'ok';
  if (explicit !== null) {
    if (explicit === 'anthropic' || explicit === 'openai-compat') { provider = explicit; }
    else { provider = null; reason = 'unknown-provider'; }
  } else {
    provider = has('ANTHROPIC_API_KEY') ? 'anthropic' : 'openai-compat';
  }
  const missing: string[] = [];
  if (provider === 'anthropic' && !has('ANTHROPIC_API_KEY')) { missing.push('ANTHROPIC_API_KEY'); }
  if (provider === 'openai-compat' && !has('CODELORE_LLM_MODEL')) { missing.push('CODELORE_LLM_MODEL'); }
  if (missing.length > 0) { reason = 'missing-env'; }
  return {
    env_family: 'CODELORE_LLM_*',
    provider: provider,
    configured: reason === 'ok' && missing.length === 0,
    missing_env: missing,
    reason: reason
  };
}

export type CodeloreLlmFace = 'explain-file' | 'diff';

export interface CodeloreLlmFacetSpec {
  face: CodeloreLlmFace;
}

export const CODELORE_LLM_FACETS: readonly CodeloreLlmFacetSpec[] = [
  { face: 'explain-file' },
  { face: 'diff' }
];

export interface CodeloreLlmInput {
  repoRoot: string;
  explainPaths?: readonly string[];
  diffRange?: string | null;
  llmRefresh?: boolean;
  facets?: readonly CodeloreLlmFacetSpec[];
  binary?: string;
  runner?: CodeloreLlmRunner;
  resolver?: CodeloreResolver;
  env?: Readonly<Record<string, string | undefined>>;
  maxLlmCalls?: number;
}

// 同一 argv 构建器供运行与 evidence 共用（batch1 同模式）；explain-file 逐 path、diff 逐 range 一次一调用。
export function codeloreLlmArgs(spec: CodeloreLlmFacetSpec, subject: string, repoRoot: string, llmRefresh: boolean): string[] {
  const args = spec.face === 'explain-file'
    ? ['explain', subject, '--repo', repoRoot, '--llm']
    : ['diff', subject, '--repo', repoRoot, '--format', 'markdown', '--llm'];
  if (llmRefresh) { args.push('--llm-refresh'); }
  return args;
}

export type CodeloreLlmRunner = (binary: string, args: readonly string[], cwd: string) => CodeloreAnalysisRun;

export function runCodeloreLlm(binary: string, args: readonly string[], cwd: string): CodeloreAnalysisRun {
  const r = runText(binary, args, cwd);
  return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}

export interface CodeloreLlmNarrative {
  base: string;
  narrative: string | null;
  stamp: string | null;
  model: string | null;
  grounded: boolean | null;
  uncited_claims: string[];
}

// `--llm` 成功形态 = 确定性输出（INI dossier / diff 文本）+ 「LLM narrative (advisory)」段 + stamp 行。
// stamp 行形态（二进制字符串实证）：'advisory <model>, grounded' 或 'advisory <model> contains uncited claims: <list>'。
// 解析只切边界与字段，不解释内容——叙事原文与 stamp 原文原样传出，raw 语义不出本层。
export function parseLlmNarrative(text: string): CodeloreLlmNarrative {
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
    if (/^[*_~` ]*advisory\s+\S/.test(blockLines[i])) { stampIdx = i; break; }
  }
  let stamp: string | null = null;
  let model: string | null = null;
  let grounded: boolean | null = null;
  const claims: string[] = [];
  if (stampIdx >= 0) {
    stamp = blockLines[stampIdx].trim().replace(/^[*_~` ]+|[*_~` ]+$/g, '');
    const g = stamp.match(/,\s*grounded\s*$/);
    const u = stamp.match(/contains uncited claims:\s*(.*)$/);
    if (g) {
      grounded = true;
      model = stamp.slice('advisory'.length, stamp.length - g[0].length).trim();
    } else if (u) {
      grounded = false;
      model = stamp.slice('advisory'.length, stamp.indexOf('contains uncited claims')).trim().replace(/,\s*$/, '');
      const claimsText = u[1].replace(/\s*\(\d+\s+more\)\s*$/i, '');
      for (const c of claimsText.split(',')) {
        const s = c.trim();
        if (s) { claims.push(s); }
      }
    } else {
      model = stamp.slice('advisory'.length).trim().replace(/,\s*$/, '');
    }
  }
  const narrative = blockLines.slice(1).join('\n').trim();
  return { base: base, narrative: narrative.length > 0 ? narrative : null, stamp: stamp, model: model, grounded: grounded, uncited_claims: claims };
}

// 成本计量：上游不暴露 token 计数（如实登记于 reconciliation）——估算位 = chars/4，字段名显式标 est_。
function estTokenUnits(chars: number): number {
  return Math.ceil(chars / 4);
}

interface LlmSubject {
  spec: CodeloreLlmFacetSpec;
  subject: string;
}

// 逐面采集：先 resolution + llm_gate（门控判定永远显式落 fact），门控关 → 每请求面 llm_gated 降级披露；
// 门控开 → 逐 subject 调用并计量成本，超上限 → llm_gated(reason=call-cap-reached)；终态 llm_cost 汇总。
export function collectCodeloreLlm(input: CodeloreLlmInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const env = input.env || process.env;
  const resolve = input.resolver || resolveCodelore;
  const runner = input.runner || runCodeloreLlm;
  const res = resolve(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) { return out; }

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
  const subjects: LlmSubject[] = [];
  for (const spec of facets) {
    if (spec.face === 'explain-file') {
      for (const p of input.explainPaths || []) {
        const pn = normalizeSubjectPath(p);   // 归一单点：file subject 事实统一规范化形（D-125①）
        if (!pn.ok) {
          out.push(makeFact({ runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt }, CODELORE_DESCRIPTOR, 'explain-file', 'codelore explain', 'codelore.file_subject_skip', { raw_path: p, reason: pn.reason }));
          continue;
        }
        subjects.push({ spec: spec, subject: pn.subject as string });
      }
    } else {
      subjects.push({ spec: spec, subject: input.diffRange || '' });
    }
  }

  const cost = { attempted: 0, succeeded: 0, failed: 0, capped: 0, narrative_chars: 0, est_token_units: 0 };
  const gatedFaces: string[] = [];
  const pushGated = (s: LlmSubject, reason: string, extra: Record<string, unknown>) => {
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
    if (!gate.configured) { pushGated(s, 'gate-' + gate.reason, {}); continue; }
    if (s.subject === '') { pushGated(s, 'param-missing:diff-range', {}); continue; }
    if (cost.attempted >= callCap) { cost.capped++; pushGated(s, 'call-cap-reached', {}); continue; }

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
    est_basis: 'chars/4（上游不暴露 token 计数，此为估算位非真值）',
    gated_faces: Array.from(new Set(gatedFaces))
  }));
  return out;
}
