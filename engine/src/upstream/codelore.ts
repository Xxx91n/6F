// ---------- 上游适配器：CodeLore（双轨接入主线 / D-020） ----------
// 上游工具接入走独立的适配器通道，上游工具的原始输出不传出这一层
// 强传染开源协议的上游工具禁止打包进项目代码，直接在系统环境中查找可执行文件作为安全防线
// 防腐层规则：本文件只做「进程调用 + 原始输出解析」——退出码、字节解析、版本固定校验在此处理；
// 判定规则（判据/阈值/裁决）禁止进入本层；上游原始输出不传出本层（统一转换为规范的事实结构传递出去）。
// 运行时查找策略 = 二进制发现（binary discovery）：在 PATH 环境变量中查找 codelore 命令，并通过 --version 校验固定版本。

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
  dimension: null, // 防腐层故意留白（上游适配层禁止放入业务判定规则）——维度映射见 docs/upstream-dimension-map.md（D-078）
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

// Micro-B 粒度 ctx 派生统一来源（r31 审计返修：四处字面量同源化）——粒度按 subject 而不是 run（D-124）；
//   跳过与冲突的说明事实统一使用 scale=Micro-B，ctx 字段映射只在此处定义以防走样。
function microBCtx(ctx: CollectContext): CollectContext {
  return { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt };
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
    const pn = normalizeSubjectPath(p);   // 统一路径格式：文件主体事实统一转换为规范路径（D-125①）
    if (!pn.ok) {
      out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, 'explain', 'codelore explain', 'codelore.file_subject_skip', { analysis: 'explain', group: null, raw_path: p, reason: pn.reason }));
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

// ---------- 首批契约项目（#35 / A-040 / D-035①）：逐项基准输出契约 ----------
// 分析项目集合 = 演化主干 12 + s3 族 6 + s5 族 12（族名=代码 group tag 拼写；维度映射见 docs/upstream-dimension-map.md）；分析项名称以 `codelore analyze --help` 实际输出核对（reports/35-facet-reconciliation.json）。
// 大模型分析项（explain 族环境变量开关控制）不混入此处，归 #36 独立处理；暂缓支持的项目（约 20 项）在 registry 中列为定期检查项（D-035④）。
// 本层仍只做「进程调用 + 原始输出解析」：固定的命令行参数属于契约约定（外部可观察的输出即为契约），任何判定或评级规则不进入本层。

export type CodeloreFacetGroup = 'evolution' | 's3' | 's5' | 'behavior';

export interface CodeloreFacetSpec {
  analysis: string;
  group: CodeloreFacetGroup;
  extraArgs: readonly string[];
}

// code-age 固定参考基准时间（--age-time-now）使重放结果可复现；messages 固定检索表达式（契约由全部命令行参数组成）。
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

// ---------- 行为分析（#51 / A-058 / D-054）：Macro-B 行为象限的一部分 ----------
// churn/hotspot/change-coupling 三族的最小行为数据集合（2026-09-16 实际运行 codelore analyze 确认结构，
// 保存在 reports/51-behavior-schema.json）：
//   hotspots          → {path, revisions, cognitive, cognitive_health, hotspot_score, mi, mi_rank, ai_pct, hotspot_score_anchored}
//   coupling          → {entity_a, entity_b, shared, revs_a, revs_b, average_revs, degree, fisher_p}
//   function-hotspots → {path, function(name@lines), revs, cognitive, cognitive_health, function_hotspot_score}
// 暂缓项：function-coupling 需要 --target <path> 参数（需要按具体文件逐个运行，不是全仓扫描形态）——登记为暂缓项；
//   另外 clone-coupling/sarif 形态、effort-exposure/delivery-* 系列归后续扩展任务（在 registry 的 codelore-deferred-faces 中暂缓）。
// 象限归属规则（D-054③）：fact.quadrant 取采集器声明的领域（strategic/codelore 系列出处），
//   报告象限的归属由具体使用时决定——Macro-B 行为象限条目使用本组事实时完成归位，已记录的事实内容不被改写。
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

// 统一使用同一个命令行参数构造函数，供实际运行与证据记录共用——防止两边参数不一致。
export function codeloreAnalysisArgs(spec: CodeloreFacetSpec, repoRoot: string): string[] {
  return ['analyze', '--analysis', spec.analysis, '--format', 'json', '--repo', repoRoot].concat(spec.extraArgs as string[]);
}

export function runCodeloreAnalysis(binary: string, spec: CodeloreFacetSpec, repoRoot: string): CodeloreAnalysisRun {
  const r = runText(binary, codeloreAnalysisArgs(spec, repoRoot), repoRoot);
  return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}

export type CodeloreRow = Record<string, unknown>;

// analyze --format json 的确定输出是对象行数组；如果格式走样（不是数组或不是对象行）直接报错，不掩盖问题。
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
  subjectProbe?: SubjectPathProbe;   // 探针接口：默认使用 defaultSubjectPathProbe（实际检查文件系统）；测试时可注入模拟探针
}

// 逐个项目采集：每个分析项输出一条 codelore.facet_rows 事实（包含字段列表、行数及原始结构化数据）；
// 运行失败的项目降级为 codelore.facet_error 或 codelore.facet_parse_error，不中断其余项目的采集。
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
    // facet_rows 汇总数据保留作为原始证据（D-124②）：只追加记录并标记 role=raw_evidence，
    //   不参与单文件卡的主要查询路径，仅用于重新构建、争议仲裁以及各分析项的历史比对。
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
  // 仅大小写差异冲突检测与告警（D-125① 禁止大小写合并——防止在不同操作系统上引起混淆）：
  //   同一次运行中发射的规范路径转为小写分组，同一组有多个不同字面值说明是真实不同的文件，明确发出告警事实而不合并。
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

// ---------- 单文件事实记录（#80 步骤① / D-124 / D-125；Micro-B 文件卡=预采集数据×单文件主体×血缘事实） ----------
// 路径统一转换在此处集中处理：行对象的 path 与 entity 字段通过 normalizeSubjectPath 规范化（遵循 SCIP 规范与 NFC 编码）。
// 文件级别的字段包括 path 和 entity（entity 字段值为仓库内相对路径，已由测试数据验证）；
//   entity_a 和 entity_b 代表关联的两端（属于 coupling 或 modularity-violations 系列）→ 双端各自输出一条指向对方的数据对象；
//   非文件级别的数据行（如日期、版本、作者、模块、指标等）仅保留在汇总层，不作为单文件事实输出，保持粒度真实不硬凑。
// 软链接处理规则（D-125①）：检查发现软链接后，真实路径必须落在仓库内的普通文件；
//   超出仓库、死链接或非文件的路径直接跳过并记录原因；如果工作区里该文件不存在（属于历史记录或已删除文件），仍作为合法的 git 记录输出。
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
    return { kind: 'missing' };   // 工作区不存在表示属于历史文件路径（git 历史记录合法，照常输出，D-125①）
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

// 逐行输出事实：subject_ref 为规范路径，value_json 为单文件分析项的数据对象。
// 返回已输出的规范路径列表（供大小写冲突检查使用）以及输出总条数。
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

// ---------- Macro-B 行为数据读取与校验（D-124③） ----------
// 单文件数据重新汇总：将 file_facet_row 事实按分析项归类，内容去重（成对关系的两端各有一条事实，合并还原为原行）；
// 核对标准：汇总层数据与单文件重算后的集合必须完全一致（通过排序比较 JSON 字符串确认完全相同，以防后续逻辑走样）。
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

// 核对标准（D-124③）：单文件重算结果 == 包含文件路径的汇总行 - 跳过的原始路径行。
//   包含文件路径的判断规则与 emitPerFileFacts 保持一致（成对行要求 entity_a 和 entity_b 都不为空；单行要求 path 或 entity 存在有效值）；
//   跳过事实记录了未成功输出的原始路径；非文件粒度的数据（如日期、版本等）本身不参与比较。
export function reconcilePerFileVsAggregate(facts: readonly CollectedFact[]): FacetReconciliation {
  const perFile = reaggregateFileFacetRows(facts);
  const canon = function (rows: readonly CodeloreRow[]): string { return rows.map(function (r) { return JSON.stringify(r); }).sort().join(String.fromCharCode(10)); };
  // 成对行的判断与输出逻辑保持一致：entity_a 与 entity_b 都非空才算成对关系。
  const pairEnds = function (r: CodeloreRow): [string, string] | null {
    const ea = r['entity_a'], eb = r['entity_b'];
    if (typeof ea === 'string' && typeof eb === 'string' && ea.length > 0 && eb.length > 0) { return [ea, eb]; }
    return null;
  };
  // 单行判断：取 FILE_SUBJECT_KEYS 中第一个非空字符串作为路径。
  const singleRawPath = function (r: CodeloreRow): string | null {
    for (const k of FILE_SUBJECT_KEYS) { const v = r[k]; if (typeof v === 'string' && v.length > 0) { return v; } }
    return null;
  };
  const isFileBearing = function (r: CodeloreRow): boolean {
    return pairEnds(r) !== null || singleRawPath(r) !== null;
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
      const pair = pairEnds(r);
      // 成对行排除时检查 entity_a 和 entity_b 的原始值：只要有一端格式转换失败整行跳过。
      if (pair !== null) { return !skip.has(pair[0]) && !skip.has(pair[1]); }
      const rp = singleRawPath(r);
      if (rp === null) { return false; }
      return !skip.has(rp);
    });
    const pf = perFile[a] || [];
    const fileBearing = aggRows.filter(isFileBearing).length;
    const m = canon(expected) === canon(pf);
    per[a] = { file_bearing: fileBearing, skipped: skip.size, per_file: pf.length, match: m };
    if (!m) { all = false; }
  }
  return { match: all, per_analysis: per };
}

// ---------- 大模型功能开关（#36 / A-041 / D-035②）：环境变量控制与成本计量 ----------
// 功能名称以实际命令行输出为准：analyze 列表中不包含 explain-*（如实记录）；
// 大模型功能包括 `explain <path> --llm`（针对单个文件的辅助说明）与 `diff <range> --llm`（针对改动范围的辅助说明），另有 MCP explain_file（通过不同协议提供，当前暂缓）。
// 开关规则：通过 CODELORE_LLM_* 系列环境变量进行配置，默认优先支持本地服务（openai-compat 默认连接 http://localhost:11434/v1）；未配置环境变量则该功能不可用。
// 规则要求：本层只读取环境变量「是否已配置」，环境变量的实际内容（特别是密钥）绝不写入事实库；未开启大模型时，通过记录 llm_gated 事实明确说明，不悄悄失败，也不调用上游 --llm 参数，不抛出异常影响其他采集任务。

export const CODELORE_LLM_ENV_VARS: readonly string[] = [
  'CODELORE_LLM_PROVIDER',
  'CODELORE_LLM_BASE_URL',
  'CODELORE_LLM_API_KEY',
  'CODELORE_LLM_MODEL',
  'ANTHROPIC_API_KEY'
];

// 调用次数上限由本工具独立的环境变量控制，避免与上游配置冲突；
// 设定上限是为了控制资源消耗，达到上限后记录降级说明，不产生判定好坏的逻辑。
export const CODELORE_LLM_CALL_CAP_ENV = 'MACRO_AUDIT_CODELORE_LLM_MAX_CALLS';
export const CODELORE_LLM_DEFAULT_CALL_CAP = 20;

export interface CodeloreLlmGate {
  env_family: string;
  provider: 'anthropic' | 'openai-compat' | null;
  configured: boolean;
  missing_env: string[];
  reason: 'ok' | 'missing-env' | 'unknown-provider';
}

// 开关状态判定（与上游工具输出的提示保持一致）：
// 如果明确指定了 PROVIDER 则优先使用；未明确指定时，如果检测到 ANTHROPIC_API_KEY 则使用 anthropic，否则默认使用本地兼容模式 openai-compat。
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

// 参数构造函数供运行与证据记录共用；explain-file 按文件路径调用，diff 按变动范围调用。
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

// 携带 `--llm` 运行成功时，输出包含常规分析结果、大模型生成的说明文本以及标记行。
// 标记行格式通常为：'advisory <model>, grounded' 或 'advisory <model> contains uncited claims: <list>'。
// 解析时只提取各字段内容，不篡改其语义，将原文完整传递出去。
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

// 成本估算：上游工具不直接输出 token 数量，这里按字符数除以 4 进行估算，字段名以 est_ 开头明确标示。
function estTokenUnits(chars: number): number {
  return Math.ceil(chars / 4);
}

interface LlmSubject {
  spec: CodeloreLlmFacetSpec;
  subject: string;
}

// 逐个项目采集：首先检查解析状态与大模型配置开关（开关判定结果始终明确记入事实库）；未开启时，针对每个请求项目记录 llm_gated 降级事实；
// 开启配置时，逐个调用并统计字符与 token 消耗；超过调用上限时标记 llm_gated(reason=call-cap-reached)；最终生成 llm_cost 汇总事实。
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
          out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, 'explain-file', 'codelore explain', 'codelore.file_subject_skip', { analysis: 'explain-file', group: null, raw_path: p, reason: pn.reason }));
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
    est_basis: 'chars/4（上游工具不输出 token 统计，此处为按字符估算结果而非实际数值）',
    gated_faces: Array.from(new Set(gatedFaces))
  }));
  return out;
}
